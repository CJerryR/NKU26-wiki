#!/usr/bin/env python3
"""Rebuild offline base-map SVGs from pinned Natural Earth source geometries.

Python 3 standard library only. No scientific observations are generated.
All source rings/vertices are retained; projected SVG coordinates use 0.001
viewBox unit precision. Run without --download to reuse verified originals.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import tempfile
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent
RELEASE = "v5.1.2"
RAW_BASE = f"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{RELEASE}/geojson/"
SOURCES = {
    "world_land": {
        "file": "ne_50m_land.geojson", "theme_version": "4.0.0",
        "sha256": "e874b27a51d146452be360cafb3cc50c86001074a67d534113e6534682f9826b",
        "page": "https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-land/",
    },
    "countries_china_pov": {
        "file": "ne_10m_admin_0_countries_chn.geojson", "theme_version": "5.1.1",
        "sha256": "a13bf5f310fde87bc0a5f994f8ce9bd706cc198d8ee37d221e61c2546b945372",
        "page": "https://www.naturalearthdata.com/blog/admin-0-countries-point-of-views/",
    },
    "china_maritime_indicators": {
        "file": "ne_10m_admin_0_boundary_lines_maritime_indicator_chn.geojson", "theme_version": "5.1.0",
        "sha256": "6d8649e20b41a944937cbca983052c99c74662e681e7551c3936aff40cbfc17b",
        "page": "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/",
    },
}

# Equidistant cylindrical/equirectangular, latitude of true scale 0 degrees.
# x = (longitude - west) * units_per_degree + offset_x
# y = (north - latitude) * units_per_degree + offset_y
PROJECTIONS = {
    "world": {"west": -180, "east": 180, "south": -90, "north": 90,
              "units_per_degree": 2.5, "offset_x": 50, "offset_y": 0,
              "viewBox": [0, 0, 1000, 450]},
    "china": {"west": 72, "east": 138, "south": 0, "north": 56,
              "units_per_degree": 8.5, "offset_x": 19.5, "offset_y": 12,
              "viewBox": [0, 0, 600, 500]},
}


def numeric(value):
    result = f"{value:.3f}".rstrip("0").rstrip(".")
    return "0" if result in ("", "-0") else result


def project(point, projection):
    lon, lat = point[:2]
    scale = projection["units_per_degree"]
    return ((lon - projection["west"]) * scale + projection["offset_x"],
            (projection["north"] - lat) * scale + projection["offset_y"])


def path_from_sequence(sequence, projection, closed=False):
    coords = [project(point, projection) for point in sequence]
    if not coords:
        return ""
    # Keep every source coordinate, including the closing coordinate, instead
    # of simplifying or deleting rings representing small islands.
    rounded = [tuple(round(v * 1000) for v in point) for point in coords]
    result = "M" + " ".join(numeric(v / 1000) for v in rounded[0])
    deltas = [(b[0] - a[0], b[1] - a[1]) for a, b in zip(rounded, rounded[1:])]
    result += "l" + " ".join(numeric(v / 1000) for point in deltas for v in point)
    return result + ("Z" if closed else "")


def polygon_paths(features, projection):
    paths = []
    for feature in features:
        geom = feature["geometry"]
        polygons = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
        if geom["type"] not in ("Polygon", "MultiPolygon"):
            raise ValueError(f"Unexpected land geometry: {geom['type']}")
        for polygon in polygons:
            paths.append("".join(path_from_sequence(ring, projection, closed=True) for ring in polygon))
    return "".join(paths)


def line_paths(features, projection):
    paths = []
    for feature in features:
        geom = feature["geometry"]
        lines = [geom["coordinates"]] if geom["type"] == "LineString" else geom["coordinates"]
        if geom["type"] not in ("LineString", "MultiLineString"):
            raise ValueError(f"Unexpected line geometry: {geom['type']}")
        paths.extend(path_from_sequence(line, projection) for line in lines)
    return "".join(paths)


def geometry_stats(features):
    points, rings, polygons = [], 0, 0
    for feature in features:
        g = feature["geometry"]
        if g["type"] in ("Polygon", "MultiPolygon"):
            ps = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
            polygons += len(ps)
            for p in ps:
                rings += len(p)
                for r in p:
                    points.extend(r)
        else:
            ls = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
            for line in ls:
                points.extend(line)
    return {"features": len(features), "polygons": polygons, "rings": rings,
            "vertices": len(points), "bounds": [min(p[0] for p in points), min(p[1] for p in points),
                                                  max(p[0] for p in points), max(p[1] for p in points)]}


def svg_doc(title, description, projection, paths):
    view_box = " ".join(numeric(v) for v in projection["viewBox"])
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" aria-labelledby="map-title map-description">
  <title id="map-title">{title}</title>
  <desc id="map-description">{description}</desc>
  <metadata>Natural Earth release {RELEASE}; public domain; equirectangular; generated by generate_maps.py. Geographic basemap only: no nematode observations or scientific distribution values.</metadata>
{paths}
</svg>
'''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--download", action="store_true", help="Download pinned originals again, verifying SHA-256")
    parser.add_argument("--cache-dir", type=Path, default=Path(tempfile.gettempdir()) / "nku-home-map-originals", help="Source cache outside published img directory")
    parser.add_argument("--extras", action="store_true", help="Also write entry overlay and precompiled geometry")
    args = parser.parse_args()
    data = {}
    for key, source in SOURCES.items():
        path = args.cache_dir / source["file"]
        path.parent.mkdir(parents=True, exist_ok=True)
        url = RAW_BASE + source["file"]
        if args.download or not path.exists():
            with urlopen(url, timeout=60) as response:
                raw = response.read()
            if source["sha256"] and hashlib.sha256(raw).hexdigest() != source["sha256"]:
                raise ValueError(f"SHA-256 mismatch for downloaded {source['file']}")
            path.write_bytes(raw)
        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if source["sha256"] and digest != source["sha256"]:
            raise ValueError(f"SHA-256 mismatch for local {source['file']}")
        source.update({"url": url, "sha256": digest, "bytes": len(raw), "release": RELEASE})
        data[key] = json.loads(raw)

    world_land = data["world_land"]["features"]
    china = [f for f in data["countries_china_pov"]["features"] if f["properties"].get("ADM0_A3") in ("CHN", "HKG", "MAC")]
    if {f["properties"]["ADM0_A3"] for f in china} != {"CHN", "HKG", "MAC"}:
        raise ValueError("Expected CHN, HKG and MAC in pinned China POV countries")
    maritime = data["china_maritime_indicators"]["features"]
    world_d = polygon_paths(world_land, PROJECTIONS["world"])
    china_entry_d = polygon_paths(china, PROJECTIONS["world"])
    china_d = polygon_paths(china, PROJECTIONS["china"])
    maritime_d = line_paths(maritime, PROJECTIONS["china"])

    (ROOT / "world-base.svg").write_text(svg_doc(
        "World land basemap", "Natural Earth land polygons without national borders. No scientific data are displayed.", PROJECTIONS["world"],
        '  <rect width="1000" height="450" fill="var(--map-ocean, #f5eedc)"/>\n'
        f'  <path id="world-land" d="{world_d}" fill="var(--map-land, #d7c4b8)" fill-rule="evenodd"/>'
    ), encoding="utf-8")
    (ROOT / "china-base.svg").write_text(svg_doc(
        "China geographic basemap", "Natural Earth China point-of-view countries, combining CHN, Hong Kong and Macao, including Taiwan, Hainan, source islands and maritime indicator lines. Full source extent is retained. No scientific data are displayed.", PROJECTIONS["china"],
        '  <rect width="600" height="500" fill="var(--map-ocean, #170e23)"/>\n'
        f'  <path id="china-land" d="{china_d}" fill="var(--map-land, #c6afd8)" fill-rule="evenodd" stroke="var(--map-outline, #c6afd8)" stroke-width="0.4" vector-effect="non-scaling-stroke"/>\n'
        f'  <path id="china-maritime-indicators" d="{maritime_d}" fill="none" stroke="var(--map-outline, #c6afd8)" stroke-width="0.8" vector-effect="non-scaling-stroke"/>'
    ), encoding="utf-8")
    if args.extras:
        (ROOT / "world-china-entry.svg").write_text(svg_doc(
            "China entry overlay", "Geographic China entry geometry aligned to world-base.svg. No scientific distribution data.", PROJECTIONS["world"],
            f'  <path id="china-entry-geometry" d="{china_entry_d}" fill="var(--map-china-entry, #baa75f)" fill-rule="evenodd" stroke="var(--map-china-entry-stroke, #baa75f)" stroke-width="0.65" vector-effect="non-scaling-stroke"/>'
        ), encoding="utf-8")
        # Standalone path geometries and projection coefficients let the host embed
        # paths in its own accessible SVG and place data points consistently.
        (ROOT / "map-geometry.json").write_text(json.dumps({
            "world": {"landPath": world_d, "chinaEntryPath": china_entry_d},
            "china": {"landPath": china_d, "maritimePath": maritime_d},
            "projections": PROJECTIONS,
        }, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    manifest = {
        "license": "Public domain", "license_url": "https://www.naturalearthdata.com/about/terms-of-use/",
        "projection": "Equidistant cylindrical/equirectangular; latitude of true scale 0 degrees; WGS84 geographic lon/lat inputs",
        "point_formula": {"x": "(longitude - west) * units_per_degree + offset_x", "y": "(north - latitude) * units_per_degree + offset_y"},
        "sources": SOURCES, "projections": PROJECTIONS,
        "geometry_stats": {"world_land": geometry_stats(world_land), "china_land": geometry_stats(china), "maritime_indicators": geometry_stats(maritime)},
        "selection": "ADM0_A3 in CHN,HKG,MAC from China POV file. Taiwan already part of CHN; do not add a TWN geometry.",
        "precision": "0.001 viewBox units; all source polygon rings and vertices retained; no simplification, smoothing or island removal",
        "scientific_data": "None. Basemap geometry is not nematode distribution data.",
    }
    outputs = {}
    for name in (["world-base.svg", "china-base.svg"] + (["world-china-entry.svg", "map-geometry.json"] if args.extras else [])):
        raw = (ROOT / name).read_bytes()
        outputs[name] = {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
    manifest["outputs"] = outputs
    (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"directory": str(ROOT), "outputs": outputs, "stats": manifest["geometry_stats"], "source_sha256": {k: v["sha256"] for k, v in SOURCES.items()}}, indent=2))


if __name__ == "__main__":
    main()
