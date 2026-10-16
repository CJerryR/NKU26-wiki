#!/usr/bin/env python3
"""China base map from the Standard Map of China (标准地图), review no. GS(2022)4308.

Source: 中国地图 (English, 1:14 000 000, vertical layout incl. the South China Sea),
Ministry of Natural Resources of the PRC, standard map service bzdt.ch.mnr.gov.cn,
review number GS(2022)4308 (自然资源部 监制). The EPS is not stored in the repo.

    python3 tools/china_standard_map.py extract path/to/4o28b...0687.eps   # -> data/china-standard-map.json
    python3 tools/china_standard_map.py build                             # -> js/home-geo.js, js/home-geo3d.js, china-base.svg

extract: reads the CorelDRAW EPS paths, merges the province and island fills
(and the island symbols of the South China Sea) into one land mask at ~1 km per
pixel, traces its outline, takes the ten dashes of the national boundary in
the South China Sea, and converts everything to lon/lat with the projection
fitted to this sheet (oblique Lambert azimuthal equal-area + similarity
transform; median fit error ~0.7 pt, about 3.5 km on the sheet). Boundaries,
islands and the dash line are taken from the sheet, not redrawn.
build: writes the China parts of the homepage geography files from that JSON.
Needs numpy and opencv-python. Province marker anchors are unchanged.
"""
import json, math, pathlib, re, sys
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "china-standard-map.json"
REVIEW = "GS(2022)4308"
# fitted on this sheet: LAEA centre lon, lat; then scale, rotation (rad), tx, ty in EPS points
FIT = [103.872342263, 34.7263181396, 1293.655986647, -0.0113830624, 1212.8420876508, 1816.6318390147]

import re
NUM = re.compile(r'^-?\d+(\.\d+)?$')
def bez(p0, p1, p2, p3, n):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
                    u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]))
    return out
def parse(path, seg=4):
    b = open(path, 'rb').read()
    body = b[b.find(b'%EndSetup'):].decode('latin-1').replace('\r', '')
    objs, cur, sub = [], None, None
    fill = stroke = None; width = 0; dash = []
    def flush_sub():
        nonlocal sub
        if sub and len(sub) > 1: cur['subs'].append(sub)
        sub = None
    for ln in body.split('\n'):
        s = ln.strip()
        if not s: continue
        t = s.split()
        op = t[-1]
        if s.startswith('@rax'):
            cur = {'subs': [], 'fill': None, 'stroke': None, 'width': 0, 'dash': [], 'op': None, 'idx': len(objs)}
            objs.append(cur); fill = stroke = None; width = 0; dash = []; sub = None; continue
        if cur is None: continue
        if op == 'set_fill_color' or op == 'set_solid_fill':
            nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', s)[:4]]; cur['fill'] = tuple(nums); continue
        if op == 'set_outline_color' or op == 'set_outline':
            nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', s)[:4]]; cur['stroke'] = tuple(nums); continue
        if op == '@w':
            cur['width'] = float(t[0]); continue
        if 'd' in t and '@G' in t and s.startswith('['):
            cur['dash'] = [float(x) for x in re.findall(r'-?\d+\.?\d*', s[:s.index(']')])]; continue
        if op in ('m', 'l', 'L', 'c', 'C') and all(NUM.match(x) for x in t[:-1]):
            v = [float(x) for x in t[:-1]]
            if op == 'm':
                flush_sub(); sub = [(v[0], v[1])]
            elif op in ('l', 'L'):
                if sub is None: sub = []
                sub.append((v[0], v[1]))
            else:
                p0 = sub[-1]; sub.extend(bez(p0, (v[0], v[1]), (v[2], v[3]), (v[4], v[5]), seg))
            continue
        if op == '@c':
            if sub: sub.append(sub[0]); cur.setdefault('closed', True)
            continue
        if op in ('F', 'S', 'B', 'N', 'f', 's', 'b') and len(t) == 1:
            flush_sub(); cur['op'] = (cur['op'] or '') + op; continue
    for o in objs:
        xs = [p[0] for sp in o['subs'] for p in sp]; ys = [p[1] for sp in o['subs'] for p in sp]
        o['bbox'] = (min(xs), min(ys), max(xs), max(ys)) if xs else None
    return [o for o in objs if o['subs']]
def cmyk2rgb(c):
    if not c: return None
    C, M, Y, K = c[:4]
    return tuple(int(255 * (1 - min(1, v)) * (1 - K)) for v in (C, M, Y))


def laea_inv(x, y, lon0, lat0):
    f0 = math.radians(lat0); rho = np.hypot(x, y); c = 2 * np.arcsin(np.clip(rho / 2, -1, 1))
    safe = np.where(rho > 0, rho, 1)
    lat = np.arcsin(np.cos(c) * math.sin(f0) + np.where(rho > 0, y * np.sin(c) * math.cos(f0) / safe, 0))
    lon = lon0 + np.degrees(np.arctan2(x * np.sin(c), rho * math.cos(f0) * np.cos(c) - y * math.sin(f0) * np.sin(c)))
    return lon, np.degrees(lat)

def eps_to_ll(P):
    P = np.asarray(P, float); lon0, lat0, sc, th, tx, ty = FIT
    dx, dy = (P[:, 0] - tx) / sc, (P[:, 1] - ty) / sc
    c, s = math.cos(-th), math.sin(-th)
    lon, lat = laea_inv(c * dx - s * dy, s * dx + c * dy, lon0, lat0)
    return np.c_[lon, lat]

def extract(eps):
    import cv2
    objs = parse(eps)
    X0, Y1, PX = 680.0, 2365.0, 5.0
    W, H = int((1700 - X0) * PX), int((Y1 - 1100) * PX)
    px = lambda sp: np.array([[(x - X0) * PX * 16, (Y1 - y) * PX * 16] for x, y in sp], np.int32)
    water = (1.0, 0.25, 0.0, 0.0)
    land = [o for o in objs if 23 <= o["idx"] <= 345 and o["op"] and ("F" in o["op"] or "B" in o["op"]) and o["fill"] != water]
    sym = [o for o in objs if o["fill"] == (1.0, 0.0, 1.0, 0.0) and o["op"] == "F"]
    mask = np.zeros((H, W), np.uint8)
    for o in land + sym:
        for sp in o["subs"]:
            if len(sp) > 2: cv2.fillPoly(mask, [px(sp)], 255, shift=4)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    rings = []
    for c in sorted(cs, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(c) < 2: continue
        a = cv2.approxPolyDP(c, 0.9, True)[:, 0, :].astype(float)
        if len(a) < 3: a = c[:, 0, :].astype(float)
        P = np.c_[(a[:, 0] + .5) / PX + X0, Y1 - (a[:, 1] + .5) / PX]
        rings.append(np.round(eps_to_ll(P), 4).tolist())
    # the national boundary symbol in the South China Sea: ten dashes (incl. east of Taiwan)
    pieces = [sp for o in objs if o["op"] == "Sff" for sp in o["subs"] if all(x > 1260 and y < 1665 for x, y in sp)]
    groups = []
    for sp in pieces:
        hit = [g for g in groups if min(math.dist(p, q) for p in sp for q in g) < 6]
        merged = [p for g in hit for p in g] + list(sp)
        groups = [g for g in groups if g not in hit] + [merged]
    near = cv2.dilate(mask, np.ones((31, 31), np.uint8))      # pieces hugging the coast are land boundary, not sea dashes
    dashes = []
    for g in groups:
        A = np.array(g); m = A.mean(0)
        ix = np.clip(((A[:, 0] - X0) * PX).astype(int), 0, W - 1); iy = np.clip(((Y1 - A[:, 1]) * PX).astype(int), 0, H - 1)
        if (near[iy, ix] > 0).mean() > 0.5: continue
        u = np.linalg.svd(A - m)[2][0]
        t = (A - m) @ u; A = A[np.argsort(t)]
        k = np.linspace(0, len(A) - 1, min(len(A), 7)).round().astype(int)
        dashes.append(np.round(eps_to_ll(A[k]), 4).tolist())
    dashes.sort(key=lambda d: -np.mean([p[1] for p in d]))
    out = {"source": "Standard Map of China (中国地图, English edition, 1:14 000 000, vertical layout), Ministry of Natural Resources of the PRC, standard map service",
           "review_number": REVIEW, "supervised_by": "自然资源部 监制",
           "method": "land = merged province and island fills of the sheet (+ South China Sea island symbols), traced at ~1 km/pixel; dashes = national boundary symbol in the South China Sea; converted to lon/lat with a projection fitted to the sheet",
           "fit": {"projection": "oblique Lambert azimuthal equal-area (spherical)", "params": FIT, "median_error_km": 3.5},
           "land": rings, "dashes": dashes}
    DATA.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("rings", len(rings), "points", sum(map(len, rings)), "dashes", len(dashes))

def dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
    idx, dmax = 0, -1
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / L if L > 1e-9 else math.dist(p, a)
        if d > dmax: idx, dmax = i, d
    return dp(pts[:idx + 1], tol)[:-1] + dp(pts[idx:], tol) if dmax > tol else [a, b]

def ring_dp(r, tol):
    if len(r) < 8: return r
    i = max(range(len(r)), key=lambda k: math.dist(r[0], r[k]))
    s = dp(r[:i + 1], tol)[:-1] + dp(r[i:] + [r[0]], tol)[:-1]
    return s if len(s) >= 3 else r

def area(r): return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2
def box(lon, lat): return ((lon - 72) * 8.5 + 19.5, (56 - lat) * 8.5 + 12)   # the china view's 600 x 500 frame

def js_obj(path, var):
    s = path.read_text(encoding="utf-8"); i = s.index("{"); j = s.rindex("}")
    return s[:i], json.loads(s[i:j + 1]), s[j + 1:]

def build():
    from matplotlib.path import Path as MPath
    D = json.loads(DATA.read_text(encoding="utf-8"))
    land = [[tuple(p) for p in r] for r in D["land"]]
    note = "China: Standard Map of China, review no. %s (Ministry of Natural Resources); land, islands and the dash line traced from the sheet" % REVIEW
    # 1) 3D / 2D china view (js/home-geo3d.js)
    head, G, tail = js_obj(ROOT / "static/js/home-geo3d.js", "NKUHomeGeo")
    rings3, zoom = [], []
    for r in land:
        b = [box(*p) for p in r]; a = area(b)
        s = ring_dp(b, 0.12 if a >= 1.5 else 0.04)
        rings3.append({"a": round(area(s), 3), "p": [round(v, 2) for q in s for v in q]})
        if a >= 1.5:
            z = ring_dp(b, 0.45)
            if len(z) >= 3: zoom.append("M" + " ".join("%.1f %.1f" % q for q in z) + "Z")
    rings3.sort(key=lambda r: -r["a"])
    G["rings"] = rings3
    G["maritime"] = [[round(v, 2) for p in d for v in box(*p)] for d in D["dashes"]]
    G["zoomOutline"] = "".join(zoom)
    G["source"] = "China: Standard Map of China %s (Ministry of Natural Resources), traced and fitted; see data/china-standard-map.json" % REVIEW
    G["note"] = "Land rings, South China Sea islands and the ten-dash line from the standard map; province points are schematic anchors."
    G["stats"] = {"rings": len(rings3), "vertices": sum(len(r["p"]) // 2 for r in rings3), "maritimeLines": len(G["maritime"]), "review": REVIEW}
    bad = [c for c, p in G["provinces"].items() if not any(MPath(np.array(r["p"]).reshape(-1, 2)).contains_point((p["x"], p["y"])) for r in rings3)]
    (ROOT / "static/js/home-geo3d.js").write_text(head + json.dumps(G, ensure_ascii=False, separators=(",", ":")) + tail, encoding="utf-8")
    # 2) dot maps and the world map's China shape (js/home-geo.js)
    head, N, tail = js_obj(ROOT / "static/js/home-geo.js", "NKU_GEO")
    paths = [MPath(np.array(r)) for r in land]
    def inside(pts): 
        hit = np.zeros(len(pts), bool)
        for p in paths: hit |= p.contains_points(pts)
        return hit
    C = N["china"]; rows = []
    for rr in range(C["rows"]):
        lat = C["north"] - (rr + .5) * C["step"]
        lons = C["west"] + (np.arange(C["cols"]) + .5) * C["step"]
        h = inside(np.c_[lons, np.full_like(lons, lat)]); runs, st = [], None
        for c in range(C["cols"] + 1):
            on = c < C["cols"] and h[c]
            if on and st is None: st = c
            if not on and st is not None: runs.append("%d:%d" % (st, c - st)); st = None
        rows.append(",".join(runs))
    C["rows_mask"] = rows
    outline = []
    for r in land:
        x0, y0 = min(p[0] for p in r), min(p[1] for p in r); x1, y1 = max(p[0] for p in r), max(p[1] for p in r)
        s = ring_dp(list(r), 0.06 if (x1 - x0) > 1.2 or (y1 - y0) > 1.2 else 0.02)
        if len(s) >= 3: outline.append([[round(p[0], 2), round(p[1], 2)] for p in s])
    C["outline"] = outline
    C["maritime"] = [[[round(p[0], 2), round(p[1], 2)] for p in d] for d in D["dashes"]]
    Wd = N["world"]; cells = []
    for rr in range(Wd["rows"]):
        lat = Wd["north"] - (rr + .5) * Wd["step"]
        if not 3 < lat < 55: continue
        cs = [c for c in range(Wd["cols"]) if 72 < Wd["west"] + (c + .5) * Wd["step"] < 136]
        h = inside(np.array([[Wd["west"] + (c + .5) * Wd["step"], lat] for c in cs]))
        cells += [rr * Wd["cols"] + c for c, on in zip(cs, h) if on]
    Wd["china"] = cells
    N["source"] = "World: Natural Earth v5.1.2 (public domain). " + note
    (ROOT / "static/js/home-geo.js").write_text(head + json.dumps(N, ensure_ascii=False, separators=(",", ":")) + tail, encoding="utf-8")
    # 3) the svg the old pipeline read (same 600 x 500 frame)
    svg = ROOT / "static/img/home-maps/china-base.svg"; s = svg.read_text(encoding="utf-8")
    def rel(pts, close):
        o = "M%.2f,%.2f" % pts[0]
        if len(pts) > 1: o += "l" + " ".join("%.2f,%.2f" % (b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
        return o + ("Z" if close else "")
    landd = "".join(rel([tuple(r["p"][i:i + 2]) for i in range(0, len(r["p"]), 2)], True) for r in rings3)
    mard = "".join(rel([tuple(m[i:i + 2]) for i in range(0, len(m), 2)], False) for m in G["maritime"])
    s = re.sub(r'(id="china-land" d=")[^"]*(")', lambda m: m.group(1) + landd + m.group(2), s)
    s = re.sub(r'(id="china-maritime-indicators" d=")[^"]*(")', lambda m: m.group(1) + mard + m.group(2), s)
    svg.write_text(s, encoding="utf-8")
    print("3D rings", len(rings3), "vertices", G["stats"]["vertices"], "dashes", len(G["maritime"]),
          "| dot grid cells", sum(int(x.split(":")[1]) for row in rows for x in row.split(",") if x),
          "world china cells", len(cells), "outline pts", sum(map(len, outline)), "| anchors outside land:", bad)

if __name__ == "__main__":
    if sys.argv[1:2] == ["extract"]: extract(sys.argv[2])
    elif sys.argv[1:2] == ["build"]: build()
    else: print(__doc__)
