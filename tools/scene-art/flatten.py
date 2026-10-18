"""Superseded in V10 by handcut.py + compose_atlas.py (kept only for the V9 record; running it
rewrites the atlases from the 3D renders).

Turn the 3D opening props into flat, hand-cut paper (V9 "night soil" style).

    python3 tools/scene-art/flatten.py --all
    python3 tools/scene-art/flatten.py description results
    python3 tools/scene-art/flatten.py description --sheet /tmp/desc.png   # contact sheet only

Reads   assets/scene-atlas-3d/<page>-<kind>.webp   (the V8.7 rendered atlases, kept as source)
        src/data/scenes/<page>.atlas.json         (frames: unchanged, so every layout and
                                                   every sharedFrames group keeps its geometry)
Writes  static/img/scenes/<page>-<kind>.webp      (same size, same frames)
        src/data/scenes/<page>.atlas.json         (only bytes / quality / hash / style change)

Every frame is restyled on its own, inside its own rectangle:
  - soft contact shadows become one hard, slightly offset paper shadow;
  - the edge is re-cut with a small wobble, like scissors on card;
  - the baked 3D shading is reduced to four flat tones of one colour family
    (deep / shade / body / light), with wobbly band edges and small islands removed;
  - amber parts keep an amber family, near-white parts become cream;
  - a crayon scratch, a gouache mottle and a paper grain go on top, matching the
    homepage opening art (team illustration: trees, soil, roots).
The colour family of a prop comes from its name (FAMILY below). Purely decorative:
nothing here encodes data. Needs NumPy and Pillow only; deterministic per prop name.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import sys
import zlib
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
LAYOUTS = ROOT / 'src' / 'data' / 'scenes'
SRC = ROOT / 'assets' / 'scene-atlas-3d'
OUT = ROOT / 'static' / 'img' / 'scenes'
BUDGET = {'desktop': 290_000, 'mobile': 165_000}
STYLE = 'flat-paper-v1'


def hx(s: str) -> np.ndarray:
    return np.array([int(s[i:i + 2], 16) for i in (1, 3, 5)], float) / 255


# deep, shade, body, light, scratch — sampled against the homepage opening art
# (night sky #1f0f27, soil #4b2a3c → #9a7389, olive/ochre canopies, rust trunks,
# pale mauve roots, the orange mascot nematode).
PALETTES = {
    'lilac':  ['#3b2350', '#6a4c8c', '#9b80bf', '#cdb9e3', '#e9dcf3'],
    'soil':   ['#2e1626', '#58334c', '#83597a', '#ab86a3', '#c9a8bf'],
    'plant':  ['#2d3414', '#5a6a25', '#8b9a3a', '#c4b452', '#d9a63e'],
    'root':   ['#4d3456', '#80648c', '#b49cc0', '#ddcde3', '#f2e8f4'],
    'worm':   ['#7c3416', '#c86a2b', '#ef9a4c', '#f8c58c', '#ffe1b8'],
    'amber':  ['#6b3e0e', '#b9762a', '#e2a23c', '#f6cf7e', '#fff0c4'],
    'cream':  ['#6f6150', '#a8977f', '#dccbaf', '#f5ead6', '#fffaf0'],
    'rust':   ['#40171c', '#7a3330', '#a8503e', '#d0855e', '#e8b07a'],
    'teal':   ['#173a3c', '#2f6a68', '#4f9a8f', '#93cbb8', '#d3efe2'],
}
PAL = {k: np.stack([hx(c) for c in v]) for k, v in PALETTES.items()}
SHADOW = hx('#0c0412')

# first match wins; the rest falls back to lilac
FAMILY = [
    (('nematode', 'yeast'), 'worm'),
    (('roots', 'receptor', 'dock-receptor'), 'root'),
    (('soil', 'slab', 'membrane', 'bed'), 'soil'),
    (('field', 'flowers', 'farmers', 'eco-fields', 'plant'), 'plant'),
    (('ligand', 'medal', 'trophy', 'coins', 'rosettes', 'stars', 'strips-amber'), 'amber'),
    (('paper', 'docs', 'card', 'env-', 'book', 'library', 'board', 'strips-neutral', 'code', 'bubble'), 'cream'),
    (('toolbox', 'gears', 'lock', 'bench', 'sash', 'safe-body', 'transport'), 'rust'),
    (('waters', 'dish', 'plates', 'flask', 'cryo', 'micro', 'phone', 'sensor', 'instruments', 'ppe'), 'teal'),
]


def family(prop: str) -> str:
    for keys, fam in FAMILY:
        if any(k in prop for k in keys):
            return fam
    return 'lilac'


# ------------------------------------------------------------------ noise
def rng_for(*parts: str) -> np.random.Generator:
    return np.random.default_rng(zlib.crc32('/'.join(parts).encode()))


def smooth_noise(rng, h: int, w: int, cell: float) -> np.ndarray:
    """Value noise in -1..1 with features about `cell` px across."""
    gh, gw = max(2, int(h / cell) + 2), max(2, int(w / cell) + 2)
    g = Image.fromarray(((rng.random((gh, gw)) * 255)).astype(np.uint8))
    g = g.resize((w, h), Image.Resampling.BICUBIC)
    return np.asarray(g, float) / 127.5 - 1


def streaks(rng, h: int, w: int, angle: float, length: int) -> np.ndarray:
    """Crayon scratches: white noise smeared along one direction, -1..1."""
    pad = length + 2
    # coarse grains, so the strokes have a crayon's width rather than a pin's
    n = rng.random(((h + 2 * pad) // 2 + 1, (w + 2 * pad) // 2 + 1))
    n = np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize(((w + 2 * pad) // 2 * 2 + 2, (h + 2 * pad) // 2 * 2 + 2), Image.Resampling.NEAREST), float)[:h + 2 * pad, :w + 2 * pad] / 255
    dx, dy = np.cos(np.radians(angle)), np.sin(np.radians(angle))
    acc = np.zeros((h, w))
    steps = max(4, length // 2)
    for i in range(steps):
        t = (i / (steps - 1) - .5) * length
        ox, oy = int(round(t * dx)), int(round(t * dy))
        acc += n[pad + oy:pad + oy + h, pad + ox:pad + ox + w]
    acc /= steps
    acc = (acc - acc.mean()) / (acc.std() + 1e-6)
    return np.clip(acc / 3, -1, 1)


def blur(a: np.ndarray, r: float) -> np.ndarray:
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), float) / 255


def grow(mask: np.ndarray, px: int) -> np.ndarray:
    im = Image.fromarray(mask.astype(np.uint8) * 255)
    return np.asarray(im.filter(ImageFilter.MaxFilter(px * 2 + 1))) > 127


def hsv(rgb: np.ndarray):
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, (g - b) / dd % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    return h, s, mx


# ------------------------------------------------------------------ style
def quantize(L: np.ndarray, m: np.ndarray) -> np.ndarray:
    """Four flat tones from 1-D k-means, so cuts fall between the 3D faces,
    not through the middle of one (which would leave blotches)."""
    v = L[m]
    c = np.percentile(v, [3, 22, 55, 90]).astype(float)
    for _ in range(12):
        idx = np.abs(v[:, None] - c[None]).argmin(1)
        for j in range(4):
            if (idx == j).any():
                c[j] = v[idx == j].mean()
        c = np.sort(c)
    cuts = (c[1:] + c[:-1]) / 2
    if c[1] - c[0] < .06 or (v < cuts[0]).mean() > .1:   # deep is for creases and holes only
        cuts[0] = min(cuts[0], np.percentile(v, 3))
    t = np.searchsorted(cuts, L).astype(np.int32)
    return np.clip(t, 0, 3)


def stylize(tile: np.ndarray, prop: str, page: str, scale: float) -> np.ndarray:
    """tile: H×W×4 float 0..1 → restyled tile, same size. scale ≈ atlas px per design px."""
    H, W = tile.shape[:2]
    if H < 6 or W < 6:
        return tile
    rng = rng_for(page, prop)
    rgb, A = tile[..., :3], tile[..., 3]
    L = rgb @ np.array([.299, .587, .114])
    k = max(.6, scale)                                   # noise sizes follow pixel density

    obj = A > .5
    if obj.sum() < 30:
        return tile
    # ---- paper shadow: the old soft contact shadow, cut hard and nudged down-right
    soft = (A > .05) & (L < .33) & ~grow(obj, 2)
    sh = blur(np.where(soft, A, 0), 2.2 * k)
    sh = sh + .05 * smooth_noise(rng, H, W, 18 * k)
    shadow = sh > .11
    ox, oy = int(round(3 * k)), int(round(4 * k))
    shadow = np.roll(np.roll(shadow, oy, 0), ox, 1)

    # ---- re-cut edge
    edge = blur(obj.astype(float), 1.1 * k) + .13 * smooth_noise(rng, H, W, 14 * k) + .04 * smooth_noise(rng, H, W, 4 * k)
    cut = np.clip((edge - .47) / .06, 0, 1)                 # ~1px antialiased, hand-cut wobble

    # ---- flat tones
    fam = family(prop)
    h, s, v = hsv(np.where(obj[..., None], rgb, 0))
    amber = obj & (s > .35) & ((h < 58) | (h > 340)) & (v > .35)
    cream = obj & (s < .08) & (v > .8) & ~amber
    base = obj & ~amber & ~cream

    # smooth away the renderer's surface noise first: big pieces get a bigger brush
    rb = max(.8 * k, min(H, W) / 90)
    Lb = blur(np.where(obj, L, 0), rb) / np.maximum(blur(obj.astype(float), rb), 1e-3)
    Lw = Lb + .012 * smooth_noise(rng, H, W, 26 * k)
    tone = np.ones((H, W), np.int32)
    for m in (base, amber, cream):
        if m.sum() < 20:
            continue
        tone = np.where(m, quantize(Lw, m), tone)
    famid = np.where(amber, 1, np.where(cream, 2, 0)).astype(np.int32)
    label = np.where(obj | (cut > 0), famid * 4 + tone + 1, 0).astype(np.uint8)
    # tidy: remove speckles so tones read as cut pieces, not posterised gradients
    size = 7 if min(H, W) > 400 else 5 if min(H, W) > 120 else 3
    lab = Image.fromarray(label)
    for _ in range(2 if size > 3 else 1):
        lab = lab.filter(ImageFilter.ModeFilter(size))
    label = np.asarray(lab, np.int32)
    label = np.where(label == 0, np.where(cut > 0, famid * 4 + 2 + 1, 0), label)  # fill what the edge grew
    famid, tone = np.maximum(label - 1, 0) // 4, np.maximum(label - 1, 0) % 4

    fams = [PAL[fam], PAL['amber'] if fam != 'amber' else PAL['worm'], PAL['cream'] if fam != 'cream' else PAL['lilac']]
    out = np.zeros((H, W, 3))
    scr_col = np.zeros((H, W, 3))
    for i, P in enumerate(fams):
        m = famid == i
        out[m] = P[tone[m]]
        scr_col[m] = P[np.minimum(tone[m] + 1, 4)]

    # ---- surface: crayon scratches, gouache mottle, paper grain
    ang = 62 + rng.uniform(-14, 14)
    st = streaks(rng, H, W, ang, int(22 * k))
    light = np.clip((st - .22) / .25, 0, 1) * (tone >= 1)
    dark = np.clip((-st - .3) / .25, 0, 1) * (tone >= 2)
    out = out * (1 - .55 * light[..., None]) + scr_col * (.55 * light[..., None])
    out = out * (1 - .16 * dark[..., None])
    mott = smooth_noise(rng, H, W, 30 * k) * .05 + smooth_noise(rng, H, W, 9 * k) * .025
    grain = (rng.random((H, W)) - .5) * .07
    out = np.clip(out * (1 + mott + grain)[..., None], 0, 1)

    # ---- composite: shadow under the cut piece
    a_obj = cut
    a_sh = np.where(shadow, .42, 0) * (1 - a_obj)
    alpha = a_obj + a_sh
    col = (out * a_obj[..., None] + SHADOW * a_sh[..., None]) / np.maximum(alpha, 1e-6)[..., None]
    res = np.dstack([np.where(alpha[..., None] > 0, col, 0), alpha])
    return res


# ------------------------------------------------------------------ atlases
def encode(sheet: Image.Image, budget: int):
    for q in (84, 78, 72, 66, 60, 54):
        buf = io.BytesIO()
        sheet.save(buf, 'WEBP', quality=q, alpha_quality=88, method=6)
        if buf.tell() <= budget:
            return buf.getvalue(), q
    return buf.getvalue(), q


def scale_of(layout: dict, kind: str, prop: str, fw: int) -> float:
    ws = [l['w'] * max(l['from'].get('s', 1), l['to'].get('s', 1)) for l in layout[kind]['layers'] if l['prop'] == prop]
    return fw / max(ws) if ws else 1.3


def run(page: str, sheet_out: Path | None = None) -> None:
    layout = json.loads((LAYOUTS / f'{page}.json').read_text())
    apath = LAYOUTS / f'{page}.atlas.json'
    atlas = json.loads(apath.read_text())
    for kind in ('desktop', 'mobile'):
        a = atlas[kind]
        src = SRC / a['file']
        if not src.exists():
            sys.exit(f'missing 3D source atlas {src.relative_to(ROOT)}')
        im = np.asarray(Image.open(src).convert('RGBA'), float) / 255
        assert list(im.shape[1::-1]) == a['size'], f'{src.name}: size differs from atlas.json'
        out = np.zeros_like(im)
        for prop, (x, y, w, h) in a['frames'].items():
            out[y:y + h, x:x + w] = stylize(im[y:y + h, x:x + w], prop, page, scale_of(layout, kind, prop, w))
        rgba = np.clip(out * 255 + .5, 0, 255).astype(np.uint8)
        rgba[rgba[..., 3] == 0, :3] = 0
        sheet = Image.fromarray(rgba, 'RGBA')
        if sheet_out:
            bg = Image.new('RGBA', sheet.size, (36, 16, 48, 255)); bg.alpha_composite(sheet)
            bg.convert('RGB').save(sheet_out.with_name(f'{sheet_out.stem}-{kind}{sheet_out.suffix}'))
            continue
        data, q = encode(sheet, BUDGET[kind])
        (OUT / a['file']).write_bytes(data)
        a.update(bytes=len(data), quality=q, hash=hashlib.sha256(data).hexdigest()[:12], style=STYLE)
        print(f'{a["file"]:34s} {a["size"][0]}x{a["size"][1]}  {len(data) / 1000:.0f} kB q{q}  (budget {BUDGET[kind] // 1000} kB)')
    if not sheet_out:
        apath.write_text(json.dumps(atlas, indent=2) + '\n')


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('pages', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--sheet', type=Path, help='write a preview on the night sky instead of the atlases')
    args = ap.parse_args()
    pages = sorted(p.stem for p in LAYOUTS.glob('*.json') if not p.name.endswith('.atlas.json')) if args.all else args.pages
    if not pages:
        ap.error('name a page or pass --all')
    for page in pages:
        run(page, args.sheet.with_name(f'{page}{args.sheet.suffix}') if args.sheet and len(pages) > 1 else args.sheet)


if __name__ == '__main__':
    main()
