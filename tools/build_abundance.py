#!/usr/bin/env python3
"""Build js/home-abundance.js from the global soil nematode database.

Source (CC0): van den Hoogen, J. et al. (2020) A global database of soil
nematode abundance and functional group composition. Scientific Data 7, 103.
https://doi.org/10.1038/s41597-020-0437-3 · data: https://doi.org/10.6084/m9.figshare.c.4718003
code and csv: https://github.com/hooge104/2020_global_nematode_dataset

Field: Herbivores = plant-feeding nematodes per 100 g dry soil.
The 6,825 samples are averaged per 30 arc-second pixel (Pixel_Lat, Pixel_Long),
which gives the 1,933 pixels the paper maps. Nothing is interpolated: the
homepage draws one dot per sampled pixel, coloured on log10(value + 1), and
the world and China maps share the same scale.

    python3 tools/build_abundance.py                 # download from GitHub, then figshare
    python3 tools/build_abundance.py --csv FILE.csv  # use a file you downloaded yourself

Standard library only. Commit the generated js/home-abundance.js; build.py
loads it automatically and the homepage switches the abundance layers on.
"""
import argparse, csv, io, json, math, pathlib, statistics, sys, urllib.request, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "home-abundance.js"
BASE = "https://raw.githubusercontent.com/hooge104/2020_global_nematode_dataset/master/data/"
CANDIDATES = [
    BASE + "nematode_full_dataset_wBiome.csv",          # 6,825 samples (README)
    BASE + "nematode_abundance_aggregated_wCovar.csv",  # 1,933 pixels (README)
    BASE + "nematode_aggregated_wCovariateData.csv",    # name used in the team's source list
]
CITATION = ("van den Hoogen, J. et al. (2020) A global database of soil nematode abundance and "
            "functional group composition. Scientific Data 7, 103. doi:10.1038/s41597-020-0437-3 (data CC0)")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "NKU-iGEM-wiki-build"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8-sig", errors="replace")


def col(header, *names):
    low = {h.strip().lower(): h for h in header}
    for n in names:
        if n.lower() in low:
            return low[n.lower()]
    return None


def number(v):
    try:
        x = float(str(v).strip())
    except ValueError:
        return None
    return x if math.isfinite(x) else None


def pixels(text):
    rows = list(csv.DictReader(io.StringIO(text)))
    if not rows:
        raise ValueError("empty csv")
    h = rows[0].keys()
    herb = col(h, "Herbivores")
    plat, plon = col(h, "Pixel_Lat"), col(h, "Pixel_Long", "Pixel_Lon")
    lat, lon = col(h, "Latitude", "Lat"), col(h, "Longitude", "Long", "Lon")
    if not herb or not ((plat and plon) or (lat and lon)):
        raise ValueError("csv has no Herbivores / coordinate columns: " + ", ".join(list(h)[:12]))
    groups = {}
    for r in rows:
        v = number(r.get(herb))
        if v is None or v < 0:
            continue                                   # samples without a functional-group split
        y = number(r.get(plat)) if plat else None
        x = number(r.get(plon)) if plon else None
        if y is None or x is None:                     # fall back to the sample position
            y, x = number(r.get(lat)), number(r.get(lon))
        if y is None or x is None or not (-90 <= y <= 90 and -180 <= x <= 180):
            continue
        groups.setdefault((round(x, 5), round(y, 5)), []).append(v)
    out = [{"lon": round(k[0], 3), "lat": round(k[1], 3), "value": round(statistics.fmean(vs), 1), "n": len(vs)}
           for k, vs in groups.items()]
    out.sort(key=lambda p: (p["lat"], p["lon"]))
    return out, len(rows)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--csv", type=pathlib.Path, help="local copy of one of the dataset csv files")
    a = ap.parse_args()
    text, used = None, None
    if a.csv:
        text, used = a.csv.read_text(encoding="utf-8-sig", errors="replace"), str(a.csv)
    else:
        for url in CANDIDATES:
            try:
                text, used = fetch(url), url
                break
            except Exception as e:  # noqa: BLE001 - try the next mirror
                print(f"  could not read {url}: {e}", file=sys.stderr)
    if text is None:
        print("No data. Download a csv from https://doi.org/10.6084/m9.figshare.c.4718003 and pass --csv.", file=sys.stderr)
        return 1
    pts, nrows = pixels(text)
    if len(pts) < 100:
        print(f"Only {len(pts)} pixels found; refusing to write a map from so few points.", file=sys.stderr)
        return 1
    vals = [p["value"] for p in pts]
    meta = {
        "field": "Herbivores", "unit": "individuals per 100 g dry soil", "scale": "log10(value + 1)",
        "pixels": len(pts), "rows": nrows, "median": round(statistics.median(vals), 1),
        "source": CITATION, "file": used, "built": datetime.date.today().isoformat(),
    }
    body = ("/* Generated by tools/build_abundance.py. Do not edit by hand.\n   " + CITATION + " */\n"
            "window.NKU_ABUNDANCE_META = " + json.dumps(meta, ensure_ascii=False) + ";\n"
            "window.NKU_ABUNDANCE = " + json.dumps(pts, separators=(",", ":")) + ";\n")
    OUT.write_text(body, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(pts)} pixels from {nrows} rows ({OUT.stat().st_size // 1024} KB), median {meta['median']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
