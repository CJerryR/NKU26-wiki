"""Procedural hand-cut paper props, in the technique of the homepage opening art.

    python3 tools/scene-art/handcut.py --all
    python3 tools/scene-art/handcut.py soil-left i-field --sheet /tmp/check.png

Reads   the V8.7 3D renders (assets/scene-atlas-3d/, via scene2d.source_tile)
Writes  assets/scenes-2d/auto/<prop>.png   one canonical image per prop
Then    python3 tools/scene-art/compose_atlas.py --all

This is the stand-in until the GPT hand-drawn set comes back (gpt/README.md);
props drawn by GPT replace these one by one, the rest keep this look.

What the homepage art does (team illustration, static/img/home-opening/
opening-foreground.webp), and so what this does:
  - shapes are cut with scissors: straight edges, few corners, no outlines;
  - each shape is one flat paper colour, with overlapping pieces of a darker or
    lighter paper (a trunk laid on a canopy, a shaded side);
  - oil-pastel scratches in a warm second colour run across a piece in one
    direction (ochre over the olive canopies), with a few dry-brush streaks;
  - soil and roots are speckled rather than scratched; everything is matte.
The 3D shading only decides where the cut pieces go; colours come from the
subject (FAMILY) and from the homepage art, a step lighter so they read on
the night sky. Deterministic per prop name. Needs NumPy, Pillow, OpenCV, SciPy.
"""
from __future__ import annotations

import argparse
import math
import sys
import zlib
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scene2d as S  # noqa: E402

OUT = S.STORE / 'auto'
SS = 2  # supersampling for cut edges and strokes


def hx(s: str) -> np.ndarray:
    return np.array([int(s[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


# body, shade, light, scratch, speck | scratch cover, scratch angle, streaks, specks, flakes
# Hues from the homepage art (canopy #5f5b30 + ochre #6f5225, trunk #502426,
# soil #45263c → #69485d, roots and pebbles pale mauve), lifted for the night sky.
FAMILIES = {
    'plant': ('#7b7639', '#58542a', '#99934a', '#c88f35', '#2b2814', .34, 38, .22, .5, 0),
    'rust':  ('#83403c', '#5f2c2e', '#a0574b', '#c98d3b', '#2d1418', .22, 84, .18, .4, 0),
    'ochre': ('#b58d3a', '#8a6a2b', '#d2ab52', '#8a3f35', '#3a2a12', .24, 52, .12, .4, 0),
    'soil':  ('#6e4764', '#4c2d46', '#8d6b84', '#aa8ea4', '#22101c', .05, 12, 0, 1.8, .8),
    'root':  ('#b59bb8', '#8e7395', '#d0bcd3', '#ece0ee', '#5c405e', .14, 70, 0, .5, .3),
    'worm':  ('#e88f46', '#bd662d', '#f4b676', '#ffdcae', '#7c3416', .18, 30, 0, .9, 0),
    'amber': ('#dfa340', '#b0742a', '#f1c672', '#fff1c8', '#6b3e0e', .16, 46, 0, .4, 0),
    'cream': ('#e6d7bb', '#c3b093', '#f4e9d1', '#a891b2', '#6f6150', .11, 58, 0, .3, 0),
    'lilac': ('#9479b8', '#6c5393', '#b19bd2', '#e2d4f0', '#2f2142', .13, 44, .1, .3, 0),
    'glass': ('#c9bfd9', '#a094b7', '#e5deed', '#fbf7ff', '#5f5475', .09, 62, 0, .15, 0),
}

# subject → paper (anything unlisted is lilac, the site's own colour)
FAMILY = {
    'soil-left': 'soil', 'soil-right': 'soil', 'i-soil-bed': 'soil',
    'i-desc-roots': 'root', 'i-res-membrane': 'root', 'i-md-slab': 'root', 'i-model-md': 'root', 'i-waters': 'root',
    'i-field': 'plant', 'i-eco-fields': 'plant', 'i-model-eco': 'plant', 'i-hp-farmers': 'plant', 'i-ack-flowers': 'plant',
    'i-team-hp': 'plant', 'i-q-wet': 'plant', 'block-promoter': 'plant',
    'i-nematodes': 'worm',
    'ligand': 'amber', 'i-dock-ligand-a': 'amber', 'i-dock-ligand-b': 'amber', 'i-md-ligand': 'amber',
    'i-eco-coins': 'amber', 'i-lock-closed': 'amber', 'i-lock-open': 'amber', 'i-q-hp': 'amber', 'block-rbs': 'amber',
    'i-paperwork': 'cream', 'i-contrib-docs': 'cream', 'i-card': 'cream', 'i-env-closed': 'cream', 'i-env-open': 'cream',
    'i-bubble-a': 'cream', 'i-bubble-b': 'cream', 'i-eng-design': 'cream', 'i-res-strips-amber': 'cream',
    'i-res-strips-neutral': 'cream', 'i-plates': 'cream', 'i-eng-test': 'cream', 'i-desc-sensor': 'cream',
    'book-closed': 'rust', 'book-open': 'rust', 'i-library': 'rust', 'toolbox-body': 'rust', 'toolbox-lid': 'rust',
    'i-gears': 'rust', 'i-edu-board': 'rust', 'i-edu-wing-l': 'rust', 'i-edu-wing-r': 'rust', 'i-parts-pile': 'rust',
    'i-safe-transport': 'rust', 'i-ack-gifts': 'rust', 'i-team-adv': 'rust', 'i-q-design': 'rust', 'block-cds': 'rust',
    'i-yeast': 'ochre', 'i-contrib-cryo': 'ochre', 'i-edu-micro': 'ochre', 'i-exp-instruments': 'ochre',
    'i-safe-ppe': 'ochre', 'i-team-visual': 'ochre', 'i-lic-code': 'ochre', 'i-team-wet': 'ochre',
    'dish-base': 'glass', 'dish-lid': 'glass', 'i-bench': 'glass', 'i-ode-flask-a': 'glass', 'i-ode-flask-b': 'glass',
    'i-model-ode': 'glass', 'i-safe-sash': 'glass',
}


class Fam:
    def __init__(self, name: str):
        v = FAMILIES[name]
        self.name = name
        self.body, self.shade, self.light, self.scratch, self.speck = (hx(c) for c in v[:5])
        self.cover, self.angle, self.streaks, self.specks, self.flakes = v[5:]


# ------------------------------------------------------------------ helpers
def hsv(rgb: np.ndarray):
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, (g - b) / dd % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    return h, s, mx


def value_noise(rng, h: int, w: int, cy: float, cx: float | None = None) -> np.ndarray:
    """Smooth noise in 0..1; features about cy (vertical) × cx (horizontal) px."""
    cx = cy if cx is None else cx
    gh, gw = max(2, int(h / max(cy, 1)) + 2), max(2, int(w / max(cx, 1)) + 2)
    g = Image.fromarray((rng.random((gh, gw)) * 255).astype(np.uint8))
    return np.asarray(g.resize((w, h), Image.Resampling.BICUBIC), np.float32) / 255


def mode_smooth(label: np.ndarray, size: int, passes: int = 1) -> np.ndarray:
    im = Image.fromarray(label.astype(np.uint8))
    for _ in range(passes):
        im = im.filter(ImageFilter.ModeFilter(size))
    return np.asarray(im, np.int32)


def drop_islands(label: np.ndarray, region: np.ndarray, min_area: int) -> np.ndarray:
    """Merge small patches of a label map into their neighbours (nearest label)."""
    lab = label.copy()
    bad = np.zeros_like(region)
    for v in np.unique(lab[region]):
        cc, n = ndi.label(region & (lab == v))
        if n == 0:
            continue
        areas = ndi.sum(np.ones_like(cc), cc, range(1, n + 1))
        small = np.isin(cc, np.nonzero(areas < min_area)[0] + 1)
        bad |= small
    if bad.any() and (region & ~bad).any():
        _, (iy, ix) = ndi.distance_transform_edt(bad | ~region, return_indices=True)
        filled = lab[iy, ix]
        lab = np.where(bad, filled, lab)
    return lab


def poly_mask(mask: np.ndarray, k_eps: float, max_eps: float, rng=None, jitter: float = 0.0) -> np.ndarray:
    """Re-cut a binary mask with scissors: every outline becomes a polygon of
    straight cuts (Douglas-Peucker), big shapes get long cuts, small ones keep
    their form. Holes stay holes. Returns an antialiased 0..1 mask."""
    H, W = mask.shape
    m8 = np.ascontiguousarray(mask.astype(np.uint8))
    cnts, hier = cv2.findContours(m8, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = np.zeros((H * SS, W * SS), np.uint8)
    if not cnts:
        return out[::SS, ::SS].astype(np.float32)
    hier = hier[0]

    def cut(c: np.ndarray) -> np.ndarray:
        area = abs(cv2.contourArea(c))
        thick = 2 * area / max(cv2.arcLength(c, True), 1.0)          # ~ width of a strip-like shape
        eps = float(np.clip(k_eps * min(math.sqrt(max(area, 1.0)), 3 * thick), .7, max_eps))
        # long cuts only where they keep the shape: stems, handles and teeth must survive
        x, y, w, h = cv2.boundingRect(c)
        ref = np.zeros((h + 2, w + 2), np.uint8)
        cv2.fillPoly(ref, [c - [x - 1, y - 1]], 1)
        p = c
        while True:
            q = cv2.approxPolyDP(c, eps, True)
            if len(q) >= 3:
                test = np.zeros_like(ref)
                cv2.fillPoly(test, [q - [x - 1, y - 1]], 1)
                inter, union = np.logical_and(ref, test).sum(), np.logical_or(ref, test).sum()
                if union == 0 or inter / union >= .93 or eps <= .75:
                    p = q
                    break
            if eps <= .75:
                break
            eps = max(.7, eps * .6)
        p = p.reshape(-1, 2).astype(np.float32)
        if rng is not None and jitter > 0 and len(p) > 3:
            p += rng.normal(0, eps * jitter, p.shape).astype(np.float32)
        return np.round((p + .5) * SS - .5).astype(np.int32)

    tops = sorted((i for i in range(len(cnts)) if hier[i][3] == -1), key=lambda i: -abs(cv2.contourArea(cnts[i])))
    for i in tops:
        cv2.fillPoly(out, [cut(cnts[i])], 255, lineType=cv2.LINE_AA)
        ch = hier[i][2]
        while ch != -1:
            cv2.fillPoly(out, [cut(cnts[ch])], 0, lineType=cv2.LINE_AA)
            ch = hier[ch][0]
    return cv2.resize(out, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255


def strokes(rng, region: np.ndarray, cover: float, angle: float, diag: float, spread: float = 8,
            length: tuple[float, float] = (.012, .045), width: float = .0026) -> np.ndarray:
    """Oil-pastel scratches inside a region: short strokes in one direction,
    broken by the paper's tooth. Returns 0..1 alpha."""
    H, W = region.shape
    ys, xs = np.nonzero(region > .5)
    if len(xs) < 40 or cover <= 0:
        return np.zeros((H, W), np.float32)
    lo, hi = length[0] * diag, length[1] * diag
    th = max(1.0, width * diag)
    n = int(cover * len(xs) / (((lo + hi) / 2) * th))
    n = min(n, 9000)
    canvas = np.zeros((H * SS, W * SS), np.uint8)
    patch = value_noise(rng, H, W, diag * .07)[ys, xs]
    keep = rng.random(len(xs)) < np.clip((patch - .25) / .5, .08, 1)
    xs, ys = xs[keep], ys[keep]
    if len(xs) < 10:
        return np.zeros((H, W), np.float32)
    pick = rng.integers(0, len(xs), n)
    ang = np.radians(angle + rng.normal(0, spread, n))
    ln = rng.uniform(lo, hi, n)
    tk = np.maximum(1, np.round(th * rng.uniform(.7, 1.5, n) * SS)).astype(int)
    val = (255 * rng.uniform(.5, 1, n)).astype(int)
    cx, cy = (xs[pick] + .5) * SS, (ys[pick] + .5) * SS
    dx, dy = np.cos(ang) * ln * SS / 2, -np.sin(ang) * ln * SS / 2
    for i in range(n):
        cv2.line(canvas, (int(cx[i] - dx[i]), int(cy[i] - dy[i])), (int(cx[i] + dx[i]), int(cy[i] + dy[i])),
                 int(val[i]), int(tk[i]), cv2.LINE_AA)
    a = cv2.resize(canvas, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    tooth = np.clip((value_noise(rng, H, W, 1.6) - .22) / .3, 0, 1)       # pastel skips on the grain
    return a * tooth * region


def dots(rng, region: np.ndarray, density: float, diag: float, r: tuple[float, float]) -> np.ndarray:
    H, W = region.shape
    ys, xs = np.nonzero(region > .5)
    if len(xs) < 40 or density <= 0:
        return np.zeros((H, W), np.float32)
    n = min(6000, int(density * len(xs) / diag ** 2 * 900))
    canvas = np.zeros((H * SS, W * SS), np.uint8)
    pick = rng.integers(0, len(xs), n)
    rr = rng.uniform(r[0] * diag, r[1] * diag, n)
    for i in range(n):
        cv2.circle(canvas, (int((xs[pick[i]] + .5) * SS), int((ys[pick[i]] + .5) * SS)),
                   max(1, int(rr[i] * SS)), int(255 * rng.uniform(.55, .95)), -1, cv2.LINE_AA)
    a = cv2.resize(canvas, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    return a * region


def pebbles(rng, region: np.ndarray, diag: float) -> np.ndarray:
    """Stones in the soil: a few small polygons with 5-8 straight cuts."""
    H, W = region.shape
    ys, xs = np.nonzero(region > .5)
    if len(xs) < 400:
        return np.zeros((H, W), np.float32)
    n = int(len(xs) / diag ** 2 * 26) + 2
    canvas = np.zeros((H * SS, W * SS), np.uint8)
    for i in rng.integers(0, len(xs), n):
        r = rng.uniform(.012, .034) * diag
        k = int(rng.integers(5, 9))
        a0 = rng.uniform(0, 2 * np.pi)
        th = a0 + np.sort(rng.uniform(0, 2 * np.pi, k))
        rad = r * rng.uniform(.65, 1.0, k)
        pts = np.stack([(xs[i] + .5 + np.cos(th) * rad * 1.25) * SS, (ys[i] + .5 + np.sin(th) * rad * .8) * SS], 1)
        cv2.fillPoly(canvas, [np.round(pts).astype(np.int32)], int(255 * rng.uniform(.55, .9)), cv2.LINE_AA)
    return cv2.resize(canvas, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255 * region


def lay(col: np.ndarray, a: np.ndarray, c: np.ndarray) -> None:
    col *= 1 - a[..., None]
    col += c * a[..., None]


# ------------------------------------------------------------------ the cut
def tones(Lb: np.ndarray, region: np.ndarray) -> np.ndarray:
    """dark / mid / light pieces from the old 3D shading (1-D k-means)."""
    t = np.ones(region.shape, np.int32)
    v = Lb[region]
    if len(v) < 300:
        return t
    c = np.percentile(v, [8, 50, 92]).astype(float)
    for _ in range(12):
        idx = np.abs(v[:, None] - c[None]).argmin(1)
        for j in range(3):
            if (idx == j).any():
                c[j] = v[idx == j].mean()
        c.sort()
    cuts = [(c[0] + c[1]) / 2, (c[1] + c[2]) / 2]
    if c[1] - c[0] < .045:
        cuts[0] = -1
    if c[2] - c[1] < .045:
        cuts[1] = 2
    t = np.where(region, np.searchsorted(cuts, Lb), 1).astype(np.int32)
    return t


def handcut(prop: str, tile: np.ndarray) -> np.ndarray:
    H, W = tile.shape[:2]
    rng = np.random.default_rng(zlib.crc32(prop.encode()))
    rgb, A = tile[..., :3], tile[..., 3]
    obj = A > .5
    cc, n = ndi.label(obj)
    if n:
        areas = ndi.sum(np.ones_like(cc), cc, range(1, n + 1))
        obj = np.isin(cc, np.nonzero(areas >= 10)[0] + 1)
    out = np.zeros((H, W, 4), np.float32)
    if obj.sum() < 30:
        return out
    diag = math.hypot(H, W)
    size = math.sqrt(obj.sum())
    fam = Fam(FAMILY.get(prop, 'lilac'))
    accents = {1: Fam('amber'), 2: Fam('cream')}      # amber and near-white parts of the render keep their own paper

    # where the old render was amber or near-white, cut separate pieces of those papers
    h, s, v = hsv(rgb)
    amber = obj & (s > .35) & ((h < 58) | (h > 340)) & (v > .35)
    cream = obj & (s < .13) & (v > .78) & ~amber
    famlab = np.where(amber, 1, np.where(cream, 2, 0)).astype(np.int32)
    k = max(3, int(size / 55) | 1)
    famlab = np.where(obj, mode_smooth(famlab, min(k, 9)), 0)
    famlab = drop_islands(famlab, obj, max(12, int(obj.sum() * .002)))
    # a pale patch smaller than ~1.5% of the prop is a specular highlight, not a sheet of paper
    cc, n = ndi.label(famlab == 2)
    if n:
        areas = ndi.sum(np.ones_like(cc), cc, range(1, n + 1))
        famlab = np.where(np.isin(cc, np.nonzero(areas < obj.sum() * .015)[0] + 1), 0, famlab)

    # flat pieces of shade: smooth the render, split its light into three
    L = rgb @ np.array([.299, .587, .114], np.float32)
    rb = max(1.0, size / 70)
    num = ndi.gaussian_filter(np.where(obj, L, 0), rb)
    den = ndi.gaussian_filter(obj.astype(np.float32), rb)
    Lb = num / np.maximum(den, 1e-3)
    tone = np.ones((H, W), np.int32)
    for f in (0, 1, 2):
        reg = obj & (famlab == f)
        if reg.sum() > 60:
            tone = np.where(reg, tones(Lb, reg), tone)
    tone = np.where(obj, mode_smooth(tone, min(max(3, int(size / 40) | 1), 11), 2), 1)
    tone = drop_islands(tone, obj, max(16, int(obj.sum() * .006)))

    big = .045                       # cut length grows with the piece: long straight cuts on big shapes
    max_eps = max(1.2, diag * .012)
    sil = poly_mask(obj, big, max_eps)
    col = np.zeros((H, W, 3), np.float32)
    col[:] = fam.body
    pieces: list[tuple[np.ndarray, Fam]] = [(sil, fam)]
    for f, fm in accents.items():
        reg = obj & (famlab == f)
        if reg.sum() > 20:
            m = poly_mask(reg, big, max_eps, rng, .25) * sil
            lay(col, m, fm.body)
            pieces.append((m, fm))
    for f in (0, 1, 2):
        fm = fam if f == 0 else accents[f]
        for t, c in ((0, fm.shade), (2, fm.light)):
            reg = obj & (famlab == f) & (tone == t)
            if reg.sum() > 20:
                lay(col, poly_mask(reg, big, max_eps, rng, .3) * sil, c)

    # surface: scratches across each paper, streaks, specks, flakes
    for m, fm in pieces:
        region = m * (sil > .5)
        if fm is not fam:
            region = region * (m > .5)
        own = region if fm is not fam else region * (famlab == 0)
        if fm.streaks:
            st = value_noise(rng, H, W, diag * .22, diag * .018)
            st = np.clip((st - .6) / .14, 0, 1) * fm.streaks * own
            lay(col, st, fm.light)
        a = strokes(rng, own, fm.cover, fm.angle + rng.uniform(-10, 10), diag)
        lay(col, a * .72, fm.scratch)
        if fm.specks:
            lay(col, dots(rng, own, fm.specks, diag, (.0009, .0028)) * .8, fm.speck)
        if fm.flakes:
            lay(col, dots(rng, own, fm.flakes, diag, (.0012, .0045)) * .55, fm.light)
            lay(col, pebbles(rng, own, diag), fm.light * .55 + fm.body * .45)
    mott = (value_noise(rng, H, W, diag * .09) - .5) * .07
    grain = (ndi.gaussian_filter(rng.random((H, W)).astype(np.float32), .6) - .5) * .16
    col = np.clip(col * (1 + mott + grain)[..., None], 0, 1)
    out[..., :3] = col
    out[..., 3] = sil
    return out


# ------------------------------------------------------------------ cli
def contact(props: list[str], path: Path) -> None:
    ims = [Image.open(OUT / f'{p}.png').convert('RGBA') for p in props]
    cw = 520
    rows = [ims[i:i + 4] for i in range(0, len(ims), 4)]
    hs = [max(int(im.height * min(1, cw / im.width)) for im in r) + 20 for r in rows]
    sheet = Image.new('RGBA', (cw * 4 + 20, sum(hs) + 20), (27, 15, 34, 255))
    y = 10
    for r, rh in zip(rows, hs):
        for i, im in enumerate(r):
            sc = min(1, cw / im.width)
            t = S.resize_rgba(im, (max(1, int(im.width * sc)), max(1, int(im.height * sc))))
            sheet.alpha_composite(t, (10 + i * cw + (cw - t.width) // 2, y + (rh - 20 - t.height) // 2))
        y += rh
    sheet.convert('RGB').save(path)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('props', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--sheet', type=Path, help='also write a contact sheet on the night sky')
    args = ap.parse_args()
    props = sorted(S.frames_index()) if args.all else args.props
    if not props:
        ap.error('name props or pass --all')
    OUT.mkdir(parents=True, exist_ok=True)
    for p in props:
        if p not in S.frames_index():
            sys.exit(f'unknown prop {p}')
        S.to_image(handcut(p, S.source_tile(p))).save(OUT / f'{p}.png', optimize=True)
        print(f'auto  {p:22s} {S.canonical_size(p)}')
    if args.sheet:
        contact(props, args.sheet)


if __name__ == '__main__':
    main()
