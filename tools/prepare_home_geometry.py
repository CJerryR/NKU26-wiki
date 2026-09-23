#!/usr/bin/env python3
"""Build js/home-geo.js from the vetted base map in img/home-maps/china-base.svg.

Python 3 standard library only. No network, no scientific data.

The China POV geometry (Natural Earth v5.1.2, public domain) is already
projected into the 600 x 500 China viewBox by img/home-maps/generate_maps.py.
This script re-reads that SVG, keeps every land ring (including all islands and
Taiwan), lightly simplifies long coastlines for WebGL triangulation, keeps the
nine maritime indicator lines untouched, and writes a compact data module that
the homepage 3D stage and the zoom sequence share.

Province label points are schematic anchors for province-level records. They
are not boundaries and must never be read as detection locations.

Usage:  python3 tools/prepare_home_geometry.py [--tolerance 0.22]
"""
from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "img" / "home-maps" / "china-base.svg"
OUTPUT = ROOT / "js" / "home-geo.js"

# Same constants as generate_maps.py / manifest.json
CHINA = {"west": 72, "north": 56, "upd": 8.5, "ox": 19.5, "oy": 12, "w": 600, "h": 500}
WORLD = {"west": -180, "north": 90, "upd": 2.5, "ox": 50, "oy": 0, "w": 1000, "h": 450}

# Province-level label anchors (longitude, latitude). Schematic, placed inside
# each provincial-level division, used only to attach province-level records.
PROVINCES = {
    "HL": ("Heilongjiang", "黑龙江", 127.9, 47.7),
    "JL": ("Jilin", "吉林", 126.2, 43.6),
    "LN": ("Liaoning", "辽宁", 122.6, 41.3),
    "NM": ("Inner Mongolia", "内蒙古", 115.8, 43.3),
    "BJ": ("Beijing", "北京", 116.4, 40.1),
    "TJ": ("Tianjin", "天津", 117.3, 39.2),
    "HE": ("Hebei", "河北", 115.0, 38.3),
    "SX": ("Shanxi", "山西", 112.3, 37.6),
    "SD": ("Shandong", "山东", 118.0, 36.4),
    "HA": ("Henan", "河南", 113.5, 33.9),
    "JS": ("Jiangsu", "江苏", 119.3, 33.1),
    "AH": ("Anhui", "安徽", 117.2, 31.9),
    "SH": ("Shanghai", "上海", 121.45, 31.2),
    "ZJ": ("Zhejiang", "浙江", 120.1, 29.3),
    "JX": ("Jiangxi", "江西", 115.8, 27.8),
    "FJ": ("Fujian", "福建", 118.1, 26.1),
    "HB": ("Hubei", "湖北", 112.4, 30.9),
    "HN": ("Hunan", "湖南", 111.8, 27.7),
    "GD": ("Guangdong", "广东", 113.5, 23.6),
    "GX": ("Guangxi", "广西", 108.9, 23.8),
    "HI": ("Hainan", "海南", 109.8, 19.2),
    "CQ": ("Chongqing", "重庆", 107.3, 29.9),
    "SC": ("Sichuan", "四川", 102.9, 30.5),
    "GZ": ("Guizhou", "贵州", 106.8, 26.8),
    "YN": ("Yunnan", "云南", 101.6, 24.9),
    "XZ": ("Tibet", "西藏", 88.5, 31.5),
    "SN": ("Shaanxi", "陕西", 108.9, 35.3),
    "GS": ("Gansu", "甘肃", 103.8, 36.1),
    "QH": ("Qinghai", "青海", 96.0, 35.6),
    "NX": ("Ningxia", "宁夏", 106.2, 37.6),
    "XJ": ("Xinjiang", "新疆", 85.3, 41.4),
    "TW": ("Taiwan", "台湾", 120.95, 23.7),
    "HK": ("Hong Kong", "香港", 114.17, 22.32),
    "MO": ("Macao", "澳门", 113.54, 22.19),
}


def parse_path(d: str):
    """Parse the M / l / Z subset written by generate_maps.py."""
    tokens = re.findall(r"[MmLlZz]|-?\d*\.?\d+(?:e-?\d+)?", d)
    rings, current, cmd, i = [], [], None, 0
    x = y = 0.0
    closed_flags = []
    while i < len(tokens):
        t = tokens[i]
        if t in "MmLlZz":
            cmd = t
            i += 1
            if cmd in "Zz":
                if current:
                    rings.append(current)
                    closed_flags.append(True)
                current = []
            continue
        vx, vy = float(tokens[i]), float(tokens[i + 1])
        i += 2
        if cmd == "M":
            if current:
                rings.append(current)
                closed_flags.append(False)
            x, y = vx, vy
            current = [(x, y)]
            cmd = "L"
        elif cmd == "m":
            if current:
                rings.append(current)
                closed_flags.append(False)
            x, y = x + vx, y + vy
            current = [(x, y)]
            cmd = "l"
        elif cmd == "L":
            x, y = vx, vy
            current.append((x, y))
        elif cmd == "l":
            x, y = x + vx, y + vy
            current.append((x, y))
    if current:
        rings.append(current)
        closed_flags.append(False)
    return rings, closed_flags


def perpendicular(p, a, b):
    if a == b:
        return math.dist(p, a)
    (x, y), (x1, y1), (x2, y2) = p, a, b
    num = abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1)
    return num / math.hypot(x2 - x1, y2 - y1)


def simplify(points, tol):
    """Iterative Douglas-Peucker, endpoints kept."""
    if len(points) < 5:
        return points[:]
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        s, e = stack.pop()
        dmax, idx = 0.0, -1
        for k in range(s + 1, e):
            dd = perpendicular(points[k], points[s], points[e])
            if dd > dmax:
                dmax, idx = dd, k
        if dmax > tol and idx > 0:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [p for p, k in zip(points, keep) if k]


def ring_area(r):
    return 0.5 * sum(r[k][0] * r[(k + 1) % len(r)][1] - r[(k + 1) % len(r)][0] * r[k][1] for k in range(len(r)))


def to_lonlat(x, y):
    return (x - CHINA["ox"]) / CHINA["upd"] + CHINA["west"], CHINA["north"] - (y - CHINA["oy"]) / CHINA["upd"]


def to_china(lon, lat):
    return (lon - CHINA["west"]) * CHINA["upd"] + CHINA["ox"], (CHINA["north"] - lat) * CHINA["upd"] + CHINA["oy"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tolerance", type=float, default=0.22,
                    help="Douglas-Peucker tolerance in China viewBox units (1 unit = 1/8.5 degree)")
    args = ap.parse_args()
    svg = SOURCE.read_text(encoding="utf-8")
    land_d = re.search(r'id="china-land"\s+d="([^"]+)"', svg).group(1)
    sea_d = re.search(r'id="china-maritime-indicators"\s+d="([^"]+)"', svg).group(1)
    land_rings, _ = parse_path(land_d)
    sea_lines, _ = parse_path(sea_d)

    out_rings = []
    src_vertices = kept_vertices = 0
    for ring in land_rings:
        if len(ring) > 1 and ring[0] == ring[-1]:
            ring = ring[:-1]
        src_vertices += len(ring)
        area = abs(ring_area(ring))
        # Coastlines are lightly simplified; every island ring is retained.
        simp = simplify(ring + [ring[0]], args.tolerance)[:-1] if len(ring) > 12 else ring
        if len(simp) < 3:
            simp = ring
        kept_vertices += len(simp)
        out_rings.append({"a": round(area, 3), "p": [round(v, 2) for pt in simp for v in pt]})
    out_rings.sort(key=lambda r: -r["a"])

    lines = [[round(v, 2) for pt in line for v in pt] for line in sea_lines]

    provinces = {}
    for code, (en, zh, lon, lat) in PROVINCES.items():
        x, y = to_china(lon, lat)
        provinces[code] = {"en": en, "zh": zh, "lon": lon, "lat": lat, "x": round(x, 2), "y": round(y, 2)}

    # Coarse outline for the zoom sequence (drawn small, so heavier simplification).
    zoom_rings = []
    for ring in land_rings:
        if len(ring) > 1 and ring[0] == ring[-1]:
            ring = ring[:-1]
        if abs(ring_area(ring)) < 2.0:
            continue
        simp = simplify(ring + [ring[0]], 0.9)[:-1]
        if len(simp) >= 3:
            zoom_rings.append("M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in simp) + "Z")

    data = {
        "source": "Natural Earth v5.1.2 China POV (public domain) via img/home-maps/china-base.svg",
        "note": "Land rings lightly simplified for WebGL; all island rings retained. Province points are schematic anchors.",
        "china": CHINA,
        "world": WORLD,
        "chinaToWorld": {"scale": round(WORLD["upd"] / CHINA["upd"], 6),
                          "tx": round((CHINA["west"] - WORLD["west"]) * WORLD["upd"] + WORLD["ox"] - CHINA["ox"] * WORLD["upd"] / CHINA["upd"], 4),
                          "ty": round((WORLD["north"] - CHINA["north"]) * WORLD["upd"] + WORLD["oy"] - CHINA["oy"] * WORLD["upd"] / CHINA["upd"], 4)},
        "rings": out_rings,
        "maritime": lines,
        "zoomOutline": "".join(zoom_rings),
        "provinces": provinces,
        "stats": {"sourceRings": len(land_rings), "sourceVertices": src_vertices, "keptVertices": kept_vertices,
                  "maritimeLines": len(lines), "tolerance": args.tolerance},
    }
    body = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(
        "/* Generated by tools/prepare_home_geometry.py - do not edit by hand.\n"
        " * Base geography only (Natural Earth, public domain). No scientific data. */\n"
        "window.NKUHomeGeo = " + body + ";\n", encoding="utf-8")
    print(f"rings {len(land_rings)}  vertices {src_vertices} -> {kept_vertices}  maritime lines {len(lines)}")
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size/1024:.1f} KB)")


if __name__ == "__main__":
    main()
