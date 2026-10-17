#!/usr/bin/env python3
"""Human Practices maps: province boundaries from the Standard Map of China and
the team's own records, written for the homepage (js/home-hp-data.js).

    python3 tools/build_hp_maps.py extract path/to/4o28b0625501ad13015501ad2bfc0683.eps
        -> data/china-provinces-standard.json
    python3 tools/build_hp_maps.py survey path/to/农业线虫问题认知与需求调查_369.xlsx
        -> data/hp/survey-locations.json   (counts only; no answers, IPs or contacts)
    python3 tools/build_hp_maps.py build
        -> static/js/home-hp-data.js

Province boundaries: 中国地图（分省设色）1:1100万，界线版，无邻国，有河流,
review no. GS(2022)4303, Ministry of Natural Resources (自然资源部 监制),
standard map service bzdt.ch.mnr.gov.cn. One fill per province on the sheet
(34 provincial-level divisions incl. Hong Kong, Macao and Taiwan). The fills
are read straight from the EPS, labelled by the provincial capital they
contain, and converted to lon/lat with the projection fitted to this sheet:
Albers equal-area conic, standard parallels 25 N / 47 N (the projection of the
national 1:1 100 万 sheets) + similarity transform; the fit is made against the
GS(2022)4308 outline already used on the homepage, median distance ~1 pt on
the sheet (~4 km). Small islands come from the shared outline, not from here.
The EPS itself is not stored in the repository.
"""
import json, math, pathlib, re, sys
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
PROVJSON = ROOT / "data" / "china-provinces-standard.json"
HPDIR = ROOT / "data" / "hp"
OUTJS = ROOT / "static" / "js" / "home-hp-data.js"
REVIEW = "GS(2022)4303"
# Albers 25/47: central meridian (deg), scale (pt per earth radius), rotation (rad), tx, ty (pt)
FIT = [109.8743256878, 1659.3940005604, -0.0003657568, 1263.3607959130, 3152.8738813390]
SP1, SP2 = math.radians(25), math.radians(47)
N_ = (math.sin(SP1) + math.sin(SP2)) / 2
C_ = math.cos(SP1) ** 2 + 2 * N_ * math.sin(SP1)

# provincial-level divisions: English name, Chinese name, a point inside (the capital)
PROVINCES = [
    ("Beijing", "北京", 116.40, 39.90), ("Tianjin", "天津", 117.20, 39.12), ("Hebei", "河北", 114.51, 38.04),
    ("Shanxi", "山西", 112.55, 37.87), ("Inner Mongolia", "内蒙古", 111.75, 40.84), ("Liaoning", "辽宁", 123.43, 41.80),
    ("Jilin", "吉林", 125.32, 43.82), ("Heilongjiang", "黑龙江", 126.53, 45.80), ("Shanghai", "上海", 121.47, 31.23),
    ("Jiangsu", "江苏", 118.80, 32.06), ("Zhejiang", "浙江", 120.15, 30.27), ("Anhui", "安徽", 117.23, 31.82),
    ("Fujian", "福建", 119.30, 26.08), ("Jiangxi", "江西", 115.86, 28.68), ("Shandong", "山东", 117.00, 36.67),
    ("Henan", "河南", 113.63, 34.75), ("Hubei", "湖北", 114.31, 30.59), ("Hunan", "湖南", 112.94, 28.23),
    ("Guangdong", "广东", 113.26, 23.13), ("Guangxi", "广西", 108.37, 22.82), ("Hainan", "海南", 110.20, 19.90),
    ("Chongqing", "重庆", 106.55, 29.56), ("Sichuan", "四川", 104.07, 30.57), ("Guizhou", "贵州", 106.63, 26.65),
    ("Yunnan", "云南", 102.71, 25.04), ("Tibet", "西藏", 91.13, 29.65), ("Shaanxi", "陕西", 108.94, 34.34),
    ("Gansu", "甘肃", 103.83, 36.06), ("Qinghai", "青海", 101.78, 36.62), ("Ningxia", "宁夏", 106.23, 38.49),
    ("Xinjiang", "新疆", 87.62, 43.83), ("Hong Kong", "香港", 114.15, 22.45), ("Macao", "澳门", 113.55, 22.17),
    ("Taiwan", "台湾", 121.00, 23.80),
]
ZH2EN = {z: e for e, z, _, _ in PROVINCES}


def albers_inv(P):
    a, sc, th, tx, ty = FIT
    P = np.asarray(P, float)
    dx, dy = (P[:, 0] - tx) / sc, (P[:, 1] - ty) / sc
    c, s = math.cos(-th), math.sin(-th)
    x, y = c * dx - s * dy, s * dx + c * dy
    rho = np.hypot(x, y); t = np.arctan2(x, -y)
    lat = np.degrees(np.arcsin(np.clip((C_ - (rho * N_) ** 2) / (2 * N_), -1, 1)))
    return np.c_[a + np.degrees(t / N_), lat]


def albers_fwd(lon, lat):
    a, sc, th, tx, ty = FIT
    f = np.radians(np.asarray(lat, float)); rho = np.sqrt(C_ - 2 * N_ * np.sin(f)) / N_
    t = N_ * np.radians(np.asarray(lon, float) - a); x, y = rho * np.sin(t), -rho * np.cos(t)
    c, s = math.cos(th), math.sin(th)
    return np.c_[sc * (c * x - s * y) + tx, sc * (s * x + c * y) + ty]


def area(r):
    r = np.asarray(r); return abs(np.sum(r[:, 0] * np.roll(r[:, 1], 1) - np.roll(r[:, 0], 1) * r[:, 1])) / 2


def extract(eps):
    import china_standard_map as M
    from matplotlib.path import Path as MPath
    objs = M.parse(eps, seg=4)
    inset = lambda b: b[0] > 1720 and b[1] < 690          # the South China Sea inset of this sheet
    prov = [o for o in objs if 69 <= o["idx"] <= 101 and o["op"] == "F"]
    assert len(prov) == 33, len(prov)   # 31 + Taiwan + Hong Kong (93; Lantau is island fill 109). Macao has no fill at 1:11M.
    cand = [o for o in objs if (23 <= o["idx"] <= 68 or 102 <= o["idx"] <= 147) and o["op"] in ("F", "B") and not inset(o["bbox"])]
    caps = albers_fwd([p[2] for p in PROVINCES], [p[3] for p in PROVINCES])
    out = {}
    pieces = []      # (province fill or island, sheet ring)
    for o in prov + cand:
        for sp in o["subs"]:
            if len(sp) > 3: pieces.append((o, np.array(sp)))
    # label the province fills by the capital they contain. Fills overlap on the sheet (Hebei is
    # drawn under Beijing and Tianjin, Guangdong under Hong Kong and Macao), so the smallest fill
    # that contains a capital is that province, and the sheet's drawing order is kept (z).
    named = {}
    for (en, zh, lon, lat), cp in zip(PROVINCES, caps):
        hit = [(area(r), o, r) for o, r in pieces if o in prov and MPath(r).contains_point(cp)]
        if hit: a, o, r = min(hit, key=lambda h: h[0]); named[en] = (o, r)
    assert len({id(v[0]) for v in named.values()}) == len(named), "two capitals in one fill"
    missing = [p[0] for p in PROVINCES if p[0] not in named]
    print("matched", len(named), "missing", missing)
    owner = {id(v[0]): k for k, v in named.items()}
    rings = {k: [] for k in named}
    for o, r in pieces:
        k = owner.get(id(o))
        if k is None:      # an island fill: give it to the nearest named province (sheet distance)
            c = r.mean(0); best, bd = None, 1e9
            for kk, (oo, rr) in named.items():
                d = np.min(np.hypot(rr[:, 0] - c[0], rr[:, 1] - c[1]))
                if d < bd: best, bd = kk, d
            if bd > 25 or area(r) < 3: continue           # far-off or tiny: the outline already draws it
            k = best
        rings[k].append(r)
    res = []
    for en, zh, lon, lat in PROVINCES:
        rr = sorted(rings.get(en, []), key=area, reverse=True)
        ll = [np.round(albers_inv(r), 4).tolist() for r in rr]
        res.append({"en": en, "zh": zh, "anchor": [lon, lat], "z": named[en][0]["idx"] if en in named else 999, "rings": ll})
    res.sort(key=lambda p: p["z"])
    D = {"source": "中国地图（分省设色）1:1100万，界线版，无邻国，有河流 — Standard Map of China, Ministry of Natural Resources of the PRC, standard map service",
         "review_number": REVIEW, "supervised_by": "自然资源部 监制",
         "method": "one fill per provincial-level division read from the EPS; labelled by the capital it contains; island fills joined to the nearest province; converted to lon/lat with the fitted projection",
         "fit": {"projection": "Albers equal-area conic, standard parallels 25N/47N (spherical) + similarity transform", "params": FIT,
                 "fitted_against": "GS(2022)4308 outline (data/china-standard-map.json)", "median_error_km": 4},
         "provinces": res}
    PROVJSON.write_text(json.dumps(D, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("wrote", PROVJSON, sum(len(p["rings"]) for p in res), "rings", sum(len(r) for p in res for r in p["rings"]), "points")


def survey(xlsx):
    import openpyxl
    wb = openpyxl.load_workbook(xlsx, read_only=True)
    rows = list(wb.active.iter_rows(values_only=True))
    head, rows = rows[0], rows[1:]
    col = next(i for i, h in enumerate(head) if h and "所在地" in str(h))
    tcol = next(i for i, h in enumerate(head) if h and "提交答卷时间" in str(h))
    prov, city = {}, {}
    for r in rows:
        loc = str(r[col]).strip(); p, _, c = loc.partition("-")
        prov[p] = prov.get(p, 0) + 1; city.setdefault(p, {}); city[p][c] = city[p].get(c, 0) + 1
    def day(v):
        y, m, d = re.match(r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})", str(v)).groups(); return "%s-%02d-%02d" % (y, int(m), int(d))
    dates = sorted(day(r[tcol]) for r in rows)
    unknown = [p for p in prov if p not in ZH2EN]
    assert not unknown, unknown
    out = {"title": "农业线虫问题认知与需求调查（中文版）", "responses": len(rows), "first": dates[0], "last": dates[-1],
           "field": "Q1 您的所在地（省-市/区，受访者自选）",
           "provinces": [{"zh": p, "en": ZH2EN[p], "n": n, "cities": sorted(([c, k] for c, k in city[p].items()), key=lambda x: -x[1])}
                         for p, n in sorted(prov.items(), key=lambda x: -x[1])]}
    HPDIR.mkdir(parents=True, exist_ok=True)
    (HPDIR / "survey-locations.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("survey", len(rows), "responses,", len(prov), "provinces,", sum(len(v) for v in city.values()), "places;", dates[0], "to", dates[-1])


def ring_dp(r, tol):
    from china_standard_map import ring_dp as rd
    return rd([tuple(p) for p in r], tol)


def build():
    D = json.loads(PROVJSON.read_text(encoding="utf-8"))
    S = json.loads((HPDIR / "survey-locations.json").read_text(encoding="utf-8"))
    T = json.loads((HPDIR / "teaching-sites.json").read_text(encoding="utf-8"))
    L = json.loads((HPDIR / "soil-samples.json").read_text(encoding="utf-8"))
    provs = []
    for p in D["provinces"]:
        rings = []
        for r in p["rings"]:
            if area(r) < 0.004: continue
            s = ring_dp(r, 0.025 if area(r) > 0.5 else 0.01)
            if len(s) >= 3: rings.append([round(v, 2) for q in s for v in q])
        provs.append({"en": p["en"], "zh": p["zh"], "a": p["anchor"], "r": rings})   # in the sheet's drawing order
    counts = {p["en"]: p["n"] for p in S["provinces"]}
    # class breaks for the survey choropleth (responses per province); every class is non-empty
    breaks = [[1, 2], [3, 5], [6, 20], [21, 100], [101, None]]
    for lo, hi in breaks:
        assert any(lo <= n and (hi is None or n <= hi) for n in counts.values()), (lo, hi)
    out = {
        "maps": {"provinces": D["review_number"], "outline": "GS(2022)4308",
                 "note": "Province boundaries: Standard Map of China %s; outline and South China Sea: %s. Both Ministry of Natural Resources." % (D["review_number"], "GS(2022)4308")},
        "provinces": provs,
        "survey": {"responses": S["responses"], "first": S["first"], "last": S["last"],
                   "breaks": breaks,
                   "byProvince": [{"en": p["en"], "zh": p["zh"], "n": p["n"], "top": p["cities"][:3], "places": len(p["cities"])} for p in S["provinces"]]},
        "teach": T, "soil": L,
    }
    js = ("/* NKU homepage - Human Practices map data. GENERATED by tools/build_hp_maps.py build; edit data/hp/*.json instead.\n"
          " * Provinces: Standard Map of China %s (Ministry of Natural Resources), fitted to lon/lat.\n"
          " * Survey: %d questionnaires (%s to %s), self-reported province. Teaching and soil: team records. */\n"
          "window.NKU_HP = %s;\n") % (D["review_number"], S["responses"], S["first"], S["last"], json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    OUTJS.write_text(js, encoding="utf-8")
    print("wrote", OUTJS, len(js) // 1024, "KB;", sum(len(p["r"]) for p in provs), "rings,", sum(len(r) // 2 for p in provs for r in p["r"]), "vertices")


if __name__ == "__main__":
    if sys.argv[1:2] == ["extract"]: extract(sys.argv[2])
    elif sys.argv[1:2] == ["survey"]: survey(sys.argv[2])
    elif sys.argv[1:2] == ["build"]: build()
    else: print(__doc__)
