"""Independent openings for the new sub-pages (round 1: hp-overview only).

    python3 tools/scene-art/subpage_openings.py build hp-overview   # placeholders + layout + atlases + check
    python3 tools/scene-art/subpage_openings.py pack  hp-overview   # re-pack atlases only (after GPT ingest)
    python3 tools/scene-art/subpage_openings.py check hp-overview   # camera framing report
    python3 tools/scene-art/subpage_openings.py kit   hp-overview   # GPT sheet, style board, prompt, manifest

Writes
    assets/scenes-2d/auto/<prop>.png          procedural PLACEHOLDER art (never overwrites gpt/)
    src/data/scenes/<page>.json               layout (auto-discovered by scenes.ts, beats SHARED_SCENES)
    src/data/scenes/<page>.atlas.json         frames, hash, preview, style ("placeholder N" until GPT art lands)
    static/img/scenes/<page>-{desktop,mobile}.webp
    gpt/subpage-openings/...                  separate GPT kit + manifest (the 16-sheet gpt/manifest.json is untouched)

Sources: assets/scenes-2d/gpt/<prop>.png wins over assets/scenes-2d/auto/<prop>.png,
exactly as scene2d.canonical(). Composite props (mobile panels with their
vignette baked in) are rebuilt from those sources on every pack, so a GPT
drawing flows into both orientations. handcut.py must NOT be run on these
props: they have no V8.7 3D reference. Needs NumPy and Pillow.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import math
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
STORE = ROOT / 'assets' / 'scenes-2d'
LAYOUTS = ROOT / 'src' / 'data' / 'scenes'
OUT = ROOT / 'static' / 'img' / 'scenes'
KIT = ROOT / 'gpt' / 'subpage-openings'
STYLE_SRC = [ROOT / 'gpt' / 'ref' / '00-style.png', ROOT.parent / 'style' / '00-style.png', ROOT / 'gpt' / '给GPT' / '第1批' / '00-style.png']

SETS = {'desktop': {'density': 1.45, 'max_edge': 2560, 'budget': 290_000},
        'mobile': {'density': 1.25, 'max_edge': 2048, 'budget': 165_000}}
QUALITIES = (86, 82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38)
GAP = 4

PAL = {'olive': '#7B7639', 'dkolive': '#58542A', 'ochre': '#C88F35', 'mustard': '#B58D3A', 'rust': '#83403C',
       'plum': '#6E4764', 'mauve': '#8D6B84', 'pmauve': '#B59BB8', 'lilac': '#9479B8', 'orange': '#E88F46',
       'amber': '#DFA340', 'cream': '#E6D7BB', 'cream2': '#D9C7A4', 'dkcream': '#C9B48C'}


def rgb(name: str, a: int = 255) -> tuple[int, int, int, int]:
    h = PAL.get(name, name)
    return int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), a


# ====================================================================== placeholder painter
SS = 2  # supersampling


def cut_poly(rng, box, step=70, jit=5):
    """Rectangle as a scissor cut: straight runs with slight irregular corners."""
    x0, y0, x1, y1 = box
    pts = []
    for (ax, ay), (bx, by) in [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]:
        n = max(1, int(math.hypot(bx - ax, by - ay) / step))
        for i in range(n):
            t = i / n
            pts.append((ax + (bx - ax) * t + rng.uniform(-jit, jit), ay + (by - ay) * t + rng.uniform(-jit, jit)))
    return pts


def texture(img: Image.Image, mask: Image.Image, rng, scratch='ochre', angle=-35, cover=0.5, specks=0.0009):
    """Crayon scratches in one direction, fine dark specks, paper grain - only inside mask."""
    W, H = img.size
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    a = math.radians(angle)
    for _ in range(int(W * H / 2600 * cover)):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        L = rng.uniform(18, 60) * SS
        d.line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], fill=rgb(scratch, rng.randint(40, 110)), width=rng.randint(1, 3) * SS)
    for _ in range(int(W * H * specks)):
        x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(.6, 1.8) * SS
        d.ellipse([x - r, y - r, x + r, y + r], fill=(60, 36, 40, rng.randint(70, 150)))
    noise = (np.random.default_rng(rng.randint(0, 10**6)).random((H, W)) * 26 - 13).astype(np.int16)
    base = np.asarray(img).astype(np.int16)
    m = np.asarray(mask) > 0
    for c in range(3):
        base[..., c] = np.where(m, np.clip(base[..., c] + noise, 0, 255), base[..., c])
    img2 = Image.fromarray(base.astype(np.uint8), 'RGBA')
    lay.putalpha(Image.fromarray(np.minimum(np.asarray(lay)[..., 3], np.asarray(mask)).astype(np.uint8)))
    return Image.alpha_composite(img2, lay)


def piece(canvas: Image.Image, rng, pts, color, **tex):
    """One cut piece of paper, textured, composited onto canvas."""
    m = Image.new('L', canvas.size, 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    layer.paste(Image.new('RGBA', canvas.size, rgb(color)), (0, 0), m)
    layer = texture(layer, m, rng, **tex)
    canvas.alpha_composite(layer)
    return m


def finish(canvas: Image.Image, size) -> Image.Image:
    return canvas.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')


def dashes(d: ImageDraw.ImageDraw, pts, color, width, dash=22, gap=16):
    """Dashed polyline (route on the map)."""
    on, left = True, dash
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        L = math.hypot(bx - ax, by - ay)
        t = 0.0
        while t < L:
            seg = min(left, L - t)
            if on:
                d.line([(ax + (bx - ax) * t / L, ay + (by - ay) * t / L),
                        (ax + (bx - ax) * (t + seg) / L, ay + (by - ay) * (t + seg) / L)], fill=color, width=width)
            t += seg
            left -= seg
            if left <= 1e-6:
                on = not on
                left = dash if on else gap


def curve(p0, p1, bend=0.18, n=24):
    (x0, y0), (x1, y1) = p0, p1
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    nx, ny = -(y1 - y0) * bend, (x1 - x0) * bend
    cx, cy = mx + nx, my + ny
    return [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1)
            for t in (i / n for i in range(n + 1))]


# Map quadrants. inner = the corner that faces the knot in the opened scene.
QUADS = {'ihp': ('br', 'olive', 'mauve'), 'edu': ('bl', 'mustard', 'lilac'),
         'inv': ('tr', 'olive', 'plum'), 'ind': ('tl', 'ochre', 'rust')}


def paint_panel(key: str, size=(640, 400)) -> Image.Image:
    rng = random.Random('ov-map-' + key)
    W, H = size[0] * SS, size[1] * SS
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    m = piece(cv, rng, cut_poly(rng, (10 * SS, 10 * SS, W - 10 * SS, H - 10 * SS), jit=4 * SS), 'cream', scratch='dkcream', cover=.35)
    inner, field, accent = QUADS[key]
    # field plots, cut pieces with crop rows, kept away from the inner corner
    for i in range(4):
        x = rng.uniform(.06, .55) * W
        y = rng.uniform(.08, .6) * H
        w, h = rng.uniform(.18, .3) * W, rng.uniform(.18, .28) * H
        sk = rng.uniform(-.12, .12) * w
        col = field if i % 2 == 0 else ('mustard' if field != 'mustard' else 'olive')
        pts = [(x + sk, y), (x + w + sk, y), (x + w - sk, y + h), (x - sk, y + h)]
        sub = Image.new('RGBA', cv.size, (0, 0, 0, 0))
        mm = piece(sub, rng, pts, col, scratch='ochre', cover=.6)
        sub.putalpha(Image.fromarray(np.minimum(np.asarray(sub)[..., 3], np.asarray(m)).astype(np.uint8)))
        d = ImageDraw.Draw(sub)
        for r in range(1, 5):
            yy = y + h * r / 5
            d.line([(x - sk + 6 * SS, yy), (x + w + sk - 6 * SS, yy)], fill=rgb('dkolive', 120), width=2 * SS)
        cv.alpha_composite(sub)
    # torn corner accent
    cx, cy = {'br': (W, H), 'bl': (0, H), 'tr': (W, 0), 'tl': (0, 0)}[{'br': 'tl', 'bl': 'tr', 'tr': 'bl', 'tl': 'br'}[inner]]
    acc = [(cx, cy), (abs(cx - .28 * W), cy), (abs(cx - .16 * W), abs(cy - .22 * H)), (cx, abs(cy - .34 * H))]
    sub = Image.new('RGBA', cv.size, (0, 0, 0, 0))
    piece(sub, rng, acc, accent, scratch='pmauve', cover=.5)
    sub.putalpha(Image.fromarray(np.minimum(np.asarray(sub)[..., 3], np.asarray(m)).astype(np.uint8)))
    cv.alpha_composite(sub)
    # route from the inner corner towards the vignette spot (upper-right third)
    ix, iy = {'br': (W - 24 * SS, H - 24 * SS), 'bl': (24 * SS, H - 24 * SS), 'tr': (W - 24 * SS, 24 * SS), 'tl': (24 * SS, 24 * SS)}[inner]
    d = ImageDraw.Draw(cv)
    dashes(d, curve((ix, iy), (W * .66, H * .4), bend=.22), rgb('rust', 230), 5 * SS, 18 * SS, 12 * SS)
    d.ellipse([W * .66 - 9 * SS, H * .4 - 9 * SS, W * .66 + 9 * SS, H * .4 + 9 * SS], fill=rgb('rust'))
    # crease shading along the two cut sides that were folds (the inner sides)
    sh = Image.new('L', cv.size, 0)
    sd = ImageDraw.Draw(sh)
    if 'r' in inner: sd.rectangle([W - 40 * SS, 0, W, H], fill=60)
    if 'l' in inner: sd.rectangle([0, 0, 40 * SS, H], fill=60)
    if 'b' in inner: sd.rectangle([0, H - 30 * SS, W, H], fill=60)
    if 't' in inner: sd.rectangle([0, 0, W, 30 * SS], fill=60)
    sh = Image.fromarray(np.minimum(np.asarray(sh.filter(ImageFilter.GaussianBlur(14 * SS))), np.asarray(m)).astype(np.uint8))
    dark = Image.new('RGBA', cv.size, rgb('plum'))
    dark.putalpha(sh)
    cv.alpha_composite(dark)
    return finish(cv, size)


def paint_cover(size=(600, 420)) -> Image.Image:
    rng = random.Random('ov-map-cover')
    W, H = size[0] * SS, size[1] * SS
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    # two folded leaves peeking under the cover (map thickness)
    piece(cv, rng, cut_poly(rng, (40 * SS, 34 * SS, W - 14 * SS, H - 18 * SS), jit=4 * SS), 'cream2', scratch='dkcream', cover=.3)
    piece(cv, rng, cut_poly(rng, (26 * SS, 24 * SS, W - 26 * SS, H - 30 * SS), jit=4 * SS), 'dkcream', scratch='ochre', cover=.3)
    m = piece(cv, rng, cut_poly(rng, (14 * SS, 14 * SS, W - 40 * SS, H - 40 * SS), jit=4 * SS), 'cream', scratch='ochre', cover=.45)
    for pts, col in [([(14 * SS, H * .62), (W * .34, H - 40 * SS), (14 * SS, H - 40 * SS)], 'olive'),
                     ([(W * .7, 14 * SS), (W - 40 * SS, 14 * SS), (W - 40 * SS, H * .3)], 'mauve')]:
        sub = Image.new('RGBA', cv.size, (0, 0, 0, 0))
        piece(sub, rng, pts, col, scratch='ochre', cover=.6)
        sub.putalpha(Image.fromarray(np.minimum(np.asarray(sub)[..., 3], np.asarray(m)).astype(np.uint8)))
        cv.alpha_composite(sub)
    d = ImageDraw.Draw(cv)
    fx = (W - 26 * SS) / 2  # centre fold
    d.line([(fx, 18 * SS), (fx, H - 44 * SS)], fill=rgb('dkcream'), width=4 * SS)
    # small compass rose stamp
    cx, cy, R = W * .5, H * .42, 58 * SS
    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=rgb('plum'))
    star(d, cx, cy, R * .85, R * .22, 'amber')
    # rust string band
    piece(cv, rng, [(W * .64, 6 * SS), (W * .72, 6 * SS), (W * .72, H - 26 * SS), (W * .64, H - 26 * SS)], 'rust', scratch='orange', cover=.4)
    return finish(cv, size)


def star(d, cx, cy, r1, r2, col, n=4):
    pts = []
    for i in range(n * 2):
        a = math.pi / n * i - math.pi / 2
        r = r1 if i % 2 == 0 else r2
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    d.polygon(pts, fill=rgb(col))
    pts2 = []
    for i in range(n * 2):
        a = math.pi / n * i - math.pi / 2 + math.pi / 4
        r = r1 * .6 if i % 2 == 0 else r2 * .8
        pts2.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    d.polygon(pts2, fill=rgb('cream'))


def paint_knot(size=(640, 400)) -> Image.Image:
    rng = random.Random('ov-knot')
    W, H = size[0] * SS, size[1] * SS
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(cv)
    cx, cy = W / 2, H / 2
    for tx, ty, b in [(20, 20, .16), (W - 20, 20, -.16), (20, H - 20, -.16), (W - 20, H - 20, .16)]:
        dashes(d, curve((cx, cy), (tx * 1.0 if tx > 20 else 20 * SS, ty if ty > 20 else 20 * SS), bend=b), rgb('amber', 235), 7 * SS, 22 * SS, 14 * SS)
    R = 92 * SS
    piece(cv, rng, [(cx + math.cos(a) * R * rng.uniform(.95, 1.05), cy + math.sin(a) * R * rng.uniform(.95, 1.05))
                    for a in (i * math.pi / 7 for i in range(14))], 'plum', scratch='mauve', cover=.7)
    d = ImageDraw.Draw(cv)
    star(d, cx, cy, R * .86, R * .2, 'amber')
    d.ellipse([cx - 10 * SS, cy - 10 * SS, cx + 10 * SS, cy + 10 * SS], fill=rgb('rust'))
    return finish(cv, size)


def paint_vinv(size=(400, 300)) -> Image.Image:
    rng = random.Random('ov-v-inv')
    W, H = size[0] * SS, size[1] * SS
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    # soil sample bag: cream bag, plum soil showing, rust tie
    bx0, by0, bx1, by1 = 30 * SS, 70 * SS, 210 * SS, H - 14 * SS
    piece(cv, rng, [(bx0 + 10 * SS, by0), (bx1 - 10 * SS, by0), (bx1, by1), (bx0, by1)], 'cream', scratch='ochre', cover=.5)
    piece(cv, rng, cut_poly(rng, (bx0 + 14 * SS, by0 + 80 * SS, bx1 - 14 * SS, by1 - 14 * SS), step=40 * SS, jit=6 * SS), 'plum', scratch='mauve', cover=.6, specks=.003)
    piece(cv, rng, [(bx0 + 40 * SS, by0 - 30 * SS), (bx1 - 40 * SS, by0 - 30 * SS), (bx1 - 54 * SS, by0 + 8 * SS), (bx0 + 54 * SS, by0 + 8 * SS)], 'cream2', scratch='ochre', cover=.4)
    piece(cv, rng, [(bx0 + 50 * SS, by0 - 2 * SS), (bx1 - 50 * SS, by0 - 2 * SS), (bx1 - 50 * SS, by0 + 14 * SS), (bx0 + 50 * SS, by0 + 14 * SS)], 'rust')
    # magnifier leaning on the bag
    d = ImageDraw.Draw(cv)
    mx, my, R = 285 * SS, 120 * SS, 70 * SS
    ang = math.radians(50)
    hx0, hy0 = mx + math.cos(ang) * R, my + math.sin(ang) * R
    hx1, hy1 = mx + math.cos(ang) * (R + 120 * SS), my + math.sin(ang) * (R + 120 * SS)
    d.line([(hx0, hy0), (min(hx1, W - 12 * SS), min(hy1, H - 12 * SS))], fill=rgb('rust'), width=22 * SS)
    d.ellipse([mx - R, my - R, mx + R, my + R], fill=rgb('ochre'))
    lens = [(mx + math.cos(a) * R * .78, my + math.sin(a) * R * .78) for a in (i * math.pi / 10 for i in range(20))]
    piece(cv, rng, lens, 'cream', scratch='pmauve', cover=.4)
    return finish(cv, size)


# ====================================================================== page definitions
PANEL = (640, 400)
NEW_PROPS = {  # prop -> (painter, canonical size, GPT description)
    'ov-map-cover': (paint_cover, (600, 420), 'a folded paper field map lying flat and closed, seen from above: a cream front cover with an olive corner piece, a mauve corner piece and a small plum circle with an amber four-point compass star, a visible centre fold, a few slightly darker cream map leaves peeking out along the right and bottom edges, and a rust paper band wrapped vertically around it'),
    'ov-knot': (paint_knot, (640, 400), 'a compass rose in the middle (an amber four-point star on a round plum paper disc with a small rust dot) with four dashed amber route lines curving out from it to the four corners of the object area; the dashes are separate small paper strips, nothing else'),
    'ov-v-inv': (paint_vinv, (400, 300), 'a cream paper soil sample bag tied with a rust band, the lower half showing dark plum speckled soil through it, with an ochre-rimmed magnifying glass with a rust handle leaning against its right side'),
}
for k, (inner, field, accent) in QUADS.items():
    NEW_PROPS[f'ov-map-{k}'] = (lambda size, k=k: paint_panel(k, size), PANEL, None)

QUAD_DESC = {
    'ihp': 'top-left quarter: olive and mustard field plots with crop rows, a mauve torn corner at its outer corner',
    'edu': 'top-right quarter: mustard and olive field plots with crop rows, a lilac torn corner at its outer corner',
    'inv': 'bottom-left quarter: olive and mustard field plots with crop rows, a plum torn corner at its outer corner',
    'ind': 'bottom-right quarter: ochre and mustard field plots with crop rows, a rust torn corner at its outer corner',
}

# Vignette that sits on each panel: (prop, width as fraction of panel width, centre offset as fraction of panel w/h)
VIGNETTE = {'ihp': ('i-bubble-a', .44, (.16, -.12)), 'edu': ('i-edu-board', .34, (.17, -.06)),
            'inv': ('ov-v-inv', .46, (.16, -.08)), 'ind': ('i-env-closed', .48, (.16, -.10))}
# Composite props: canvas size + [(source prop, centre x, centre y, width)] in canvas px, first = base.
COMPOSITES = {f'ov-mpanel-{k}': (PANEL, [(f'ov-map-{k}', PANEL[0] / 2, PANEL[1] / 2, PANEL[0]),
                                         (VIGNETTE[k][0], PANEL[0] * (.5 + VIGNETTE[k][2][0]), PANEL[1] * (.5 + VIGNETTE[k][2][1]), PANEL[0] * VIGNETTE[k][1])])
              for k in QUADS}


def layer(id, prop, w, z, frm, to, win, depth):
    return {'id': id, 'prop': prop, 'w': w, 'z': z, 'depth': depth, 'from': frm, 'to': to, 'win': list(win)}


def hp_overview() -> dict:
    ph = PANEL[1] / PANEL[0]
    # ---------------- desktop 1600x900: folded map under the title opens to the four corners
    dw = 340
    dpos = {'ihp': (-560, -200), 'edu': (560, -200), 'inv': (-470, 232), 'ind': (470, 232)}
    stack = {'ihp': (-14, -8, -6), 'edu': (14, -6, 5), 'inv': (-10, 8, 4), 'ind': (12, 10, -5)}
    wins = {'ihp': (.08, .70), 'edu': (.12, .74), 'inv': (.16, .78), 'ind': (.20, .82)}
    vwin = {'ihp': (.50, .86), 'edu': (.55, .90), 'inv': (.60, .94), 'ind': (.64, .98)}
    tilt = {'ihp': -3, 'edu': 2.5, 'inv': 2, 'ind': -2.5}
    D = [layer('cover', 'ov-map-cover', 360, 7, {'x': 0, 'y': 196, 'r': -4}, {'x': 0, 'y': 226, 's': .7, 'r': -8, 'o': 0}, (.02, .40), 10)]
    for k, (x, y) in dpos.items():
        sx, sy, sr = stack[k]
        D.append(layer(f'map-{k}', f'ov-map-{k}', dw, 3, {'x': sx, 'y': 196 + sy, 'r': sr, 's': .92},
                       {'x': x, 'y': y, 'r': tilt[k], 's': 1}, wins[k], 14))
    D.append(layer('knot', 'ov-knot', 430, 2, {'x': 0, 'y': 214, 's': .5, 'o': 0}, {'x': 0, 'y': 204, 's': 1, 'o': 1}, (.30, .85), 8))
    for k, (x, y) in dpos.items():
        prop, f, (ox, oy) = VIGNETTE[k]
        vx, vy = x + ox * dw, y + oy * dw * ph
        D.append(layer(f'v-{k}', prop, round(f * dw, 1), 5, {'x': vx, 'y': vy + 18, 's': .4, 'o': 0, 'r': tilt[k]},
                       {'x': vx, 'y': vy, 's': 1, 'o': 1, 'r': tilt[k]}, vwin[k], 14))
    # ---------------- mobile 900x1600: same story in a column; vignettes baked into the panels
    mw = 380
    mpos = {'ihp': (-200, -580), 'edu': (200, -580), 'inv': (-200, 430), 'ind': (200, 430)}
    M = [layer('cover', 'ov-map-cover', 520, 7, {'x': 0, 'y': 270, 'r': -4}, {'x': 0, 'y': 300, 's': .7, 'r': -8, 'o': 0}, (.02, .40), 8)]
    for k, (x, y) in mpos.items():
        sx, sy, sr = stack[k]
        M.append(layer(f'map-{k}', f'ov-mpanel-{k}', mw, 3, {'x': sx * 1.4, 'y': 270 + sy * 1.4, 'r': sr, 's': 1.15},
                       {'x': x, 'y': y, 'r': tilt[k], 's': 1}, wins[k], 10))
    M.append(layer('knot', 'ov-knot', 560, 2, {'x': 0, 'y': 290, 's': .5, 'o': 0}, {'x': 0, 'y': 92, 's': 1, 'o': 1}, (.30, .85), 6))
    return {
        'page': 'hp-overview', 'enabled': True, 'eyebrow': 'Human Practices',
        'note': ('Generated by tools/scene-art/subpage_openings.py; edit the script, not this file. Folded field map: the closed map '
                 'under the title opens into four quarters (iHP, Education, Investigation, Industry) round a compass knot. '
                 'Canvas origin at the centre, y down; from = progress 0, to = progress 1; win = progress window; depth = pointer parallax.'),
        'desktop': {'canvas': [1600, 900], 'title': {'y': -30, 'toY': -300, 'toScale': .62}, 'layers': D},
        'mobile': {'canvas': [900, 1600], 'title': {'y': -80, 'toY': -470, 'toScale': .7}, 'layers': M},
    }


PAGES = {'hp-overview': hp_overview}
PAGE_PROPS = {'hp-overview': [p for p in NEW_PROPS if p.startswith('ov-')]}


# ====================================================================== round 2: hp-investigation, hp-industry
def canvas(size):
    return Image.new('RGBA', (size[0] * SS, size[1] * SS), (0, 0, 0, 0))


def pawn(cv, rng, cx, base, h, col, scratch='ochre'):
    """Faceless paper pawn: round head, rounded body, no face (as i-hp-farmers / i-crowd)."""
    w = h * .48
    body = [(cx - w * .5, base), (cx - w * .32, base - h * .62), (cx - w * .18, base - h * .7), (cx + w * .18, base - h * .7),
            (cx + w * .32, base - h * .62), (cx + w * .5, base)]
    piece(cv, rng, body, col, scratch=scratch, cover=.6)
    r = h * .17
    piece(cv, rng, [(cx + math.cos(a) * r, base - h * .8 + math.sin(a) * r) for a in (i * math.pi / 8 for i in range(16))], col, scratch=scratch, cover=.6)


def bubble(cv, rng, box, col, tail='left', accent='mauve'):
    x0, y0, x1, y1 = box
    tx = x0 + (x1 - x0) * (.25 if tail == 'left' else .75)
    pts = cut_poly(rng, box, step=60 * SS, jit=3 * SS)
    m = piece(cv, rng, pts, col, scratch='ochre', cover=.45)
    piece(cv, rng, [(tx - 26 * SS, y1 - 6 * SS), (tx + 26 * SS, y1 - 6 * SS), (tx + (-40 if tail == 'left' else 40) * SS, y1 + 44 * SS)], col, scratch='ochre', cover=.4)
    sub = Image.new('RGBA', cv.size, (0, 0, 0, 0))
    piece(sub, rng, [(x1, y0), (x1, y0 + (y1 - y0) * .45), (x1 - (x1 - x0) * .3, y0)], accent, scratch='pmauve', cover=.5)
    sub.putalpha(Image.fromarray(np.minimum(np.asarray(sub)[..., 3], np.asarray(m)).astype(np.uint8)))
    cv.alpha_composite(sub)


def leaf(d, cx, cy, s, col):
    d.polygon([(cx - s, cy + s * .2), (cx - s * .2, cy - s * .7), (cx + s, cy - s * .3), (cx + s * .1, cy + s * .6)], fill=rgb(col))


def paint_path(size):
    """Dashed field route as small cut paper strips, gentle wave, olive tufts at the verge."""
    rng = random.Random('iv-path')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    d = ImageDraw.Draw(cv)
    pts = [(W * t, H * .55 + math.sin(t * math.pi * 2.2) * H * .14) for t in (i / 60 for i in range(61))]
    dashes(d, pts, rgb('cream2', 255), 16 * SS, 34 * SS, 20 * SS)
    dashes(d, [(x, y - 4 * SS) for x, y in pts], rgb('cream', 255), 10 * SS, 34 * SS, 20 * SS)
    for i in range(18):
        t = rng.uniform(.02, .98)
        x, y = W * t, H * .55 + math.sin(t * math.pi * 2.2) * H * .14 + rng.choice((-1, 1)) * H * .22
        for j in range(3):
            leaf(d, x + j * 12 * SS, y - j * 4 * SS, rng.uniform(9, 14) * SS, rng.choice(('olive', 'dkolive', 'mustard')))
    return finish(cv, size)


def paint_path_m(size):
    rng = random.Random('iv-path-m')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    d = ImageDraw.Draw(cv)
    pts = [(W * .5 + math.sin(t * math.pi * 2.6 + .4) * W * .3, H * t) for t in (i / 70 for i in range(71))]
    dashes(d, pts, rgb('cream2'), 16 * SS, 34 * SS, 20 * SS)
    dashes(d, [(x - 3 * SS, y) for x, y in pts], rgb('cream'), 10 * SS, 34 * SS, 20 * SS)
    for i in range(14):
        t = rng.uniform(.03, .97)
        x = W * .5 + math.sin(t * math.pi * 2.6 + .4) * W * .3 + rng.choice((-1, 1)) * W * .12
        for j in range(3):
            leaf(d, x + j * 12 * SS, H * t - j * 4 * SS, rng.uniform(9, 14) * SS, rng.choice(('olive', 'dkolive', 'mustard')))
    return finish(cv, size)


def paint_museum(size):
    """Museum display case: rust plinth, pale glass case, a soil-strata specimen block with a small orange nematode model."""
    rng = random.Random('iv-museum')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    piece(cv, rng, cut_poly(rng, (W * .14, H * .72, W * .86, H * .98), jit=3 * SS), 'rust', scratch='orange', cover=.5)
    piece(cv, rng, cut_poly(rng, (W * .08, H * .66, W * .92, H * .74), jit=2 * SS), 'plum', scratch='mauve', cover=.4)
    piece(cv, rng, cut_poly(rng, (W * .16, H * .1, W * .84, H * .66), jit=3 * SS), 'pmauve', scratch='cream', cover=.35)
    for k, col in enumerate(('olive', 'mauve', 'plum', 'mauve')):
        y0 = H * (.3 + k * .085)
        piece(cv, rng, cut_poly(rng, (W * .28, y0, W * .72, y0 + H * .09), step=40 * SS, jit=4 * SS), col, scratch='ochre', cover=.5, specks=.002)
    d = ImageDraw.Draw(cv)
    pts = [(W * (.36 + t * .28), H * (.42 + math.sin(t * 7) * .03)) for t in (i / 20 for i in range(21))]
    d.line(pts, fill=rgb('orange'), width=9 * SS, joint='curve')
    d.line([(W * .2, H * .14), (W * .32, H * .14)], fill=rgb('cream', 200), width=5 * SS)  # glass glint as a cut strip
    d.line([(W * .2, H * .2), (W * .26, H * .2)], fill=rgb('cream', 200), width=5 * SS)
    return finish(cv, size)


def paint_interview(size):
    rng = random.Random('iv-interview')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    bubble(cv, rng, (W * .02, H * .04, W * .56, H * .52), 'cream', 'left', 'olive')
    bubble(cv, rng, (W * .42, H * .38, W * .98, H * .84), 'cream2', 'right', 'mauve')
    d = ImageDraw.Draw(cv)
    leaf(d, W * .2, H * .28, 26 * SS, 'olive')
    leaf(d, W * .3, H * .24, 20 * SS, 'dkolive')
    for i in range(3):
        d.rounded_rectangle([W * .52, H * (.5 + i * .09), W * (.88 - i * .08), H * (.5 + i * .09) + 12 * SS], 6 * SS, fill=rgb('olive' if i != 1 else 'ochre'))
    return finish(cv, size)


def paint_greenhouse(size):
    """Arched plastic tunnel greenhouse, cut ribs, rows of olive crops inside, plum soil strip."""
    rng = random.Random('iv-greenhouse')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    arch = [(W * .06, H * .92)] + [(W * (.5 - .44 * math.cos(a)), H * (.92 - .78 * math.sin(a))) for a in (i * math.pi / 10 for i in range(11))] + [(W * .94, H * .92)]
    piece(cv, rng, arch, 'pmauve', scratch='cream', cover=.35)
    inner = [(W * .14, H * .92)] + [(W * (.5 - .36 * math.cos(a)), H * (.92 - .62 * math.sin(a))) for a in (i * math.pi / 10 for i in range(11))] + [(W * .86, H * .92)]
    piece(cv, rng, inner, 'lilac', scratch='pmauve', cover=.4)
    d = ImageDraw.Draw(cv)
    for t in (.28, .5, .72):
        x = W * t
        d.line([(x, H * .92), (x, H * (.92 - .78 * math.sin(math.acos(min(1, abs(t - .5) / .44)))) + 6 * SS)], fill=rgb('cream2'), width=6 * SS)
    for r in range(3):
        y = H * (.62 + r * .1)
        for i in range(7):
            leaf(d, W * (.22 + i * .095), y, (14 + r * 3) * SS, ('olive', 'dkolive', 'mustard')[(i + r) % 3])
    piece(cv, rng, cut_poly(rng, (W * .02, H * .9, W * .98, H * .99), step=50 * SS, jit=3 * SS), 'plum', scratch='mauve', cover=.5, specks=.003)
    return finish(cv, size)


def paint_corer(size):
    """Soil corer (rust T handle) standing in a small soil mound, a pulled soil core beside it, two sample bags."""
    rng = random.Random('iv-corer')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    piece(cv, rng, [(W * .02, H * .98), (W * .1, H * .82), (W * .34, H * .76), (W * .56, H * .84), (W * .62, H * .98)], 'plum', scratch='mauve', cover=.6, specks=.003)
    piece(cv, rng, [(W * .3, H * .1), (W * .34, H * .1), (W * .34, H * .84), (W * .3, H * .84)], 'rust', scratch='orange', cover=.4)
    piece(cv, rng, cut_poly(rng, (W * .14, H * .06, W * .5, H * .13), step=40 * SS, jit=2 * SS), 'rust', scratch='orange', cover=.4)
    for k, col in enumerate(('olive', 'mauve', 'plum')):  # soil core lying down
        piece(cv, rng, cut_poly(rng, (W * (.42 + k * .07), H * .66, W * (.49 + k * .07), H * .74), step=30 * SS, jit=2 * SS), col, scratch='ochre', cover=.5)
    for i, x in enumerate((.66, .82)):
        bx0, by0, bx1, by1 = W * x, H * (.5 + i * .06), W * (x + .15), H * .96
        piece(cv, rng, [(bx0 + 6 * SS, by0), (bx1 - 6 * SS, by0), (bx1, by1), (bx0, by1)], 'cream', scratch='ochre', cover=.5)
        piece(cv, rng, cut_poly(rng, (bx0 + 8 * SS, (by0 + by1) / 2, bx1 - 8 * SS, by1 - 8 * SS), step=30 * SS, jit=3 * SS), 'plum', specks=.003)
        piece(cv, rng, [(bx0 + 12 * SS, by0 - 4 * SS), (bx1 - 12 * SS, by0 - 4 * SS), (bx1 - 12 * SS, by0 + 10 * SS), (bx0 + 12 * SS, by0 + 10 * SS)], 'rust')
    return finish(cv, size)


def paint_marker(size):
    """Small travelling magnifier (route marker)."""
    rng = random.Random('iv-marker')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    d = ImageDraw.Draw(cv)
    R, cx, cy = W * .3, W * .4, H * .4
    d.line([(cx + R * .7, cy + R * .7), (W * .94, H * .94)], fill=rgb('rust'), width=int(W * .13))
    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=rgb('ochre'))
    piece(cv, rng, [(cx + math.cos(a) * R * .74, cy + math.sin(a) * R * .74) for a in (i * math.pi / 10 for i in range(20))], 'cream', scratch='pmauve', cover=.4)
    return finish(cv, size)


def upscaled(name):
    def paint(size):
        im = Image.open(STORE / 'gpt' / f'{name}.png').convert('RGBA')
        im = im.crop(im.getbbox())
        k = min(size[0] / im.width, size[1] / im.height)
        return resize(im, (im.width * k, im.height * k))
    return paint


def paint_letter(size):
    rng = random.Random('in-letter')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    piece(cv, rng, cut_poly(rng, (W * .1, H * .02, W * .96, H * .9), jit=3 * SS), 'cream2', scratch='ochre', cover=.3)
    m = piece(cv, rng, cut_poly(rng, (W * .04, H * .08, W * .9, H * .98), jit=3 * SS), 'cream', scratch='ochre', cover=.4)
    d = ImageDraw.Draw(cv)
    d.ellipse([W * .4, H * .16, W * .56, H * .16 + W * .16], fill=rgb('ochre'))
    for i, (a, b) in enumerate(((.16, .78), (.16, .7), (.16, .74), (.16, .5))):
        y = H * (.5 + i * .1)
        d.rounded_rectangle([W * a, y, W * b, y + 9 * SS], 4 * SS, fill=rgb('mustard' if i else 'olive'))
    sub = Image.new('RGBA', cv.size, (0, 0, 0, 0))
    piece(sub, rng, [(W * .04, H * .98), (W * .04, H * .74), (W * .3, H * .98)], 'mauve', scratch='pmauve', cover=.5)
    sub.putalpha(Image.fromarray(np.minimum(np.asarray(sub)[..., 3], np.asarray(m)).astype(np.uint8)))
    cv.alpha_composite(sub)
    return finish(cv, size)


def paint_deck(size):
    """Presentation materials: a small easel board with a simple diagram (circle -> strip), plus a booklet leaning on it."""
    rng = random.Random('in-deck')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    d = ImageDraw.Draw(cv)
    for x0, x1 in ((.2, .26), (.64, .7)):
        d.polygon([(W * x0, H * .6), (W * x1, H * .6), (W * (x1 - .06 + (x0 > .5) * .12), H * .98), (W * (x0 - .06 + (x0 > .5) * .12), H * .98)], fill=rgb('rust'))
    piece(cv, rng, cut_poly(rng, (W * .08, H * .04, W * .82, H * .66), jit=3 * SS), 'rust', scratch='orange', cover=.4)
    piece(cv, rng, cut_poly(rng, (W * .12, H * .09, W * .78, H * .61), jit=3 * SS), 'cream', scratch='ochre', cover=.35)
    d = ImageDraw.Draw(cv)
    d.ellipse([W * .18, H * .2, W * .3, H * .2 + W * .12], fill=rgb('olive'))
    d.line([(W * .33, H * .28), (W * .44, H * .28)], fill=rgb('rust'), width=6 * SS)
    d.polygon([(W * .44, H * .24), (W * .49, H * .28), (W * .44, H * .32)], fill=rgb('rust'))
    for i, c in enumerate(('amber', 'mustard', 'ochre')):  # yellow readout swatches, not a product
        d.rounded_rectangle([W * (.52 + i * .075), H * .2, W * (.58 + i * .075), H * .36], 4 * SS, fill=rgb(c))
    for i in range(2):
        d.rounded_rectangle([W * .18, H * (.44 + i * .07), W * (.66 - i * .14), H * (.44 + i * .07) + 8 * SS], 4 * SS, fill=rgb('mauve'))
    piece(cv, rng, [(W * .66, H * .5), (W * .96, H * .46), (W * .98, H * .96), (W * .7, H * .99)], 'mustard', scratch='ochre', cover=.6)
    piece(cv, rng, [(W * .72, H * .58), (W * .92, H * .55), (W * .93, H * .64), (W * .73, H * .67)], 'cream')
    return finish(cv, size)


def paint_table(size):
    """Meeting table seen slightly from the front, two cups, scattered papers, a faceless pawn on each side."""
    rng = random.Random('in-table')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    pawn(cv, rng, W * .1, H * .78, H * .7, 'olive')
    pawn(cv, rng, W * .9, H * .78, H * .7, 'mauve', 'pmauve')
    piece(cv, rng, [(W * .2, H * .58), (W * .23, H * .58), (W * .23, H * .98), (W * .2, H * .98)], 'rust')
    piece(cv, rng, [(W * .77, H * .58), (W * .8, H * .58), (W * .8, H * .98), (W * .77, H * .98)], 'rust')
    piece(cv, rng, [(W * .17, H * .44), (W * .83, H * .44), (W * .88, H * .6), (W * .12, H * .6)], 'rust', scratch='orange', cover=.55)
    piece(cv, rng, [(W * .12, H * .6), (W * .88, H * .6), (W * .88, H * .66), (W * .12, H * .66)], 'plum', scratch='mauve', cover=.4)
    for x, r in ((.36, -8), (.52, 5)):
        cx, cy = W * x, H * .5
        a = math.radians(r)
        pts = [(cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)) for dx, dy in ((-50 * SS, -14 * SS), (50 * SS, -14 * SS), (56 * SS, 14 * SS), (-56 * SS, 14 * SS))]
        piece(cv, rng, pts, 'cream', scratch='ochre', cover=.3)
    for x in (.27, .7):
        piece(cv, rng, [(W * x - 16 * SS, H * .36), (W * x + 16 * SS, H * .36), (W * x + 13 * SS, H * .52), (W * x - 13 * SS, H * .52)], 'cream2', scratch='ochre', cover=.4)
    return finish(cv, size)


def paint_talk(side):
    def paint(size):
        rng = random.Random('in-talk-' + side)
        W, H = size[0] * SS, size[1] * SS
        cv = canvas(size)
        bubble(cv, rng, (W * .04, H * .04, W * .96, H * .74), 'cream' if side == 'l' else 'cream2', 'right' if side == 'l' else 'left',
               'olive' if side == 'l' else 'mauve')
        d = ImageDraw.Draw(cv)
        if side == 'l':   # a question about the field: leaf + soil dots
            leaf(d, W * .3, H * .36, 30 * SS, 'olive')
            for i in range(3):
                d.ellipse([W * (.52 + i * .1), H * .32, W * (.52 + i * .1) + 18 * SS, H * .32 + 18 * SS], fill=rgb('plum'))
        else:             # a reply: three readout swatches and a line
            for i, c in enumerate(('amber', 'mustard', 'ochre')):
                d.rounded_rectangle([W * (.2 + i * .14), H * .2, W * (.3 + i * .14), H * .44], 5 * SS, fill=rgb(c))
            d.rounded_rectangle([W * .2, H * .52, W * .72, H * .52 + 10 * SS], 5 * SS, fill=rgb('mauve'))
        return finish(cv, size)
    return paint


NEW_PROPS.update({
    'iv-path': (paint_path, (1500, 220), None),
    'iv-path-m': (paint_path_m, (700, 1300), None),
    'iv-museum': (paint_museum, (420, 360), 'a museum display case: a rust plinth with a plum top edge, a pale-mauve glass case on it (the glass shown as a pale paper panel with two short cream glint strips), inside a block of layered soil in olive, mauve and plum strata with a slim orange worm model lying across it'),
    'iv-interview': (paint_interview, (460, 300), 'two overlapping cream speech bubbles with short tails pointing to opposite sides: the upper-left one has two olive leaves on it and an olive torn corner, the lower-right one has three short olive and ochre bars and a mauve torn corner'),
    'iv-greenhouse': (paint_greenhouse, (520, 340), 'an arched plastic tunnel greenhouse seen from the front: pale-mauve outer cover, lilac inner opening, three cream ribs, rows of small olive, dark-olive and mustard seedlings inside, standing on a strip of plum speckled soil'),
    'iv-corer': (paint_corer, (420, 360), 'a rust soil corer (a long rod with a T-shaped handle) pushed into a small plum soil mound, a short soil core lying beside it in olive, mauve and plum segments, and two cream sample bags on the right with plum soil inside and rust ties'),
    'iv-marker': (paint_marker, (200, 200), 'a small magnifying glass with an ochre rim, pale cream lens and a short rust handle'),
    'in-env-closed': (upscaled('i-env-closed'), (642, 280), 'a closed envelope, the same object and colours as the closed envelope in the bottom half of 00-style.png, redrawn larger with the same cream paper, ochre scratches and olive and mauve torn pieces along the bottom'),
    'in-env-open': (upscaled('i-env-open'), (696, 462), 'the same envelope opened, its triangular flap up, the same as the open envelope in the bottom half of 00-style.png, redrawn larger'),
    'in-letter': (paint_letter, (360, 280), 'an invitation card coming out of an envelope: a cream card with a second slightly darker card behind it, a round ochre seal near the top, four short olive and mustard bars for lines of writing, a mauve torn corner'),
    'in-deck': (paint_deck, (440, 340), 'presentation materials: a small rust easel board with a cream sheet showing a simple diagram (an olive circle, a rust arrow, three amber, mustard and ochre colour swatches and two mauve bars), and a mustard booklet leaning against its right leg'),
    'in-table': (paint_table, (800, 380), 'a meeting table seen slightly from the front: rust table top and legs with a plum front edge, two cream papers and two cream cups on it, and one simple faceless paper pawn on each side (olive on the left, mauve on the right) facing each other'),
    'in-talk-l': (paint_talk('l'), (340, 230), 'a cream speech bubble with its tail at the bottom right, showing one olive leaf and three small plum dots, an olive torn corner'),
    'in-talk-r': (paint_talk('r'), (340, 230), 'a slightly darker cream speech bubble with its tail at the bottom left, showing three small amber, mustard and ochre swatches above one mauve bar, a mauve torn corner'),
})
COMPOSITES['in-talk-m'] = ((760, 300), [('in-talk-l', 190, 130, 340), ('in-talk-r', 570, 170, 340)])


def hp_investigation() -> dict:
    stops = {'museum': (-560, 112, 270, -6), 'interview': (-195, 86, 270, 3), 'greenhouse': (215, 110, 310, -3), 'corer': (575, 140, 240, 4)}
    wins = {'museum': (.10, .40), 'interview': (.28, .58), 'greenhouse': (.48, .78), 'corer': (.64, .94)}
    D = [layer('path', 'iv-path', 1480, 2, {'x': 0, 'y': 258, 's': .97, 'o': .4}, {'x': 0, 'y': 258, 's': 1, 'o': 1}, (0, .35), 6),
         layer('notebook', 'i-contrib-docs', 270, 5, {'x': -40, 'y': 210, 'r': -4}, {'x': -640, 'y': 350, 's': .78, 'r': -8}, (.04, .6), 8),
         layer('marker', 'iv-marker', 96, 7, {'x': -150, 'y': 196, 'r': -10}, {'x': 690, 'y': 228, 'r': 8}, (.06, .96), 10)]
    for k, (x, y, w, r) in stops.items():
        prop = 'iv-' + k
        D.append(layer(k, prop, w, 4, {'x': x, 'y': y + 70, 's': .35, 'o': 0, 'r': r * 3}, {'x': x, 'y': y, 's': 1, 'o': 1, 'r': r}, wins[k], 12))
    mst = {'museum': (-195, -575, 330, -5), 'interview': (205, -110, 330, 3), 'greenhouse': (-185, 250, 360, -3), 'corer': (195, 600, 300, 4)}
    M = [layer('path', 'iv-path-m', 640, 2, {'x': 0, 'y': 60, 's': .97, 'o': .4}, {'x': 0, 'y': 60, 's': 1, 'o': 1}, (0, .35), 4),
         layer('marker', 'iv-marker', 110, 7, {'x': -150, 'y': 250, 'r': -10}, {'x': 60, 'y': 690, 'r': 8}, (.06, .96), 6)]
    for k, (x, y, w, r) in mst.items():
        frm = {'x': x, 'y': y + 70, 's': .35, 'o': 0, 'r': r * 3}
        if k == 'museum':
            frm = {'x': 0, 'y': 300, 's': .9, 'o': 1, 'r': -3}  # the first stop stands under the title before scrolling
        M.append(layer(k, 'iv-' + k, w, 4, frm, {'x': x, 'y': y, 's': 1, 'o': 1, 'r': r}, (.04, .44) if k == 'museum' else wins[k], 8))
    return {'page': 'hp-investigation', 'enabled': True, 'eyebrow': 'Human Practices',
            'note': ('Generated by tools/scene-art/subpage_openings.py; edit the script, not this file. Field route: a dashed path, a magnifier '
                     'travelling along it, four stops rising in order: museum case, interviews, greenhouse farm, soil corer with sample bags. '
                     'No head-counts or real identities are drawn. Origin at the centre, y down.'),
            'desktop': {'canvas': [1600, 900], 'title': {'y': -40, 'toY': -300, 'toScale': .62}, 'layers': D},
            'mobile': {'canvas': [900, 1600], 'title': {'y': -90, 'toY': -470, 'toScale': .7}, 'layers': M}}


def hp_industry() -> dict:
    D = [layer('env-closed', 'in-env-closed', 300, 5, {'x': 0, 'y': 196, 'r': -3}, {'x': -560, 'y': 252, 'r': -5, 'o': 0}, (.04, .46), 10),
         layer('env-open', 'in-env-open', 300, 5, {'x': 0, 'y': 186, 'r': -3, 'o': 0}, {'x': -560, 'y': 236, 'r': -5, 'o': 1}, (.04, .46), 10),
         layer('letter', 'in-letter', 220, 6, {'x': -10, 'y': 190, 's': .4, 'o': 0, 'r': 8}, {'x': -600, 'y': 24, 'r': -6, 's': 1, 'o': 1}, (.18, .62), 14),
         layer('deck', 'in-deck', 290, 6, {'x': 10, 'y': 190, 's': .4, 'o': 0, 'r': -8}, {'x': 575, 'y': 170, 'r': 4, 's': 1, 'o': 1}, (.24, .70), 14),
         layer('table', 'in-table', 600, 3, {'x': 0, 'y': 320, 's': .8, 'o': 0}, {'x': 0, 'y': 262, 's': 1, 'o': 1}, (.40, .84), 6),
         layer('talk-l', 'in-talk-l', 220, 7, {'x': -150, 'y': 170, 's': .4, 'o': 0, 'r': -10}, {'x': -250, 'y': 70, 'r': -4, 's': 1, 'o': 1}, (.60, .92), 16),
         layer('talk-r', 'in-talk-r', 220, 7, {'x': 150, 'y': 170, 's': .4, 'o': 0, 'r': 10}, {'x': 255, 'y': 52, 'r': 4, 's': 1, 'o': 1}, (.68, 1.0), 16)]
    M = [layer('env-closed', 'in-env-closed', 470, 5, {'x': 0, 'y': 300, 'r': -3}, {'x': -240, 'y': 318, 's': .62, 'r': -6, 'o': 0}, (.04, .46), 8),
         layer('env-open', 'in-env-open', 470, 5, {'x': 0, 'y': 284, 'r': -3, 'o': 0}, {'x': -240, 'y': 304, 's': .62, 'r': -6, 'o': 1}, (.04, .46), 8),
         layer('letter', 'in-letter', 225, 6, {'x': -10, 'y': 290, 's': .4, 'o': 0, 'r': 8}, {'x': -215, 'y': 150, 'r': -6, 's': 1, 'o': 1}, (.16, .6), 10),
         layer('deck', 'in-deck', 245, 6, {'x': 10, 'y': 290, 's': .4, 'o': 0, 'r': -8}, {'x': 215, 'y': 138, 'r': 5, 's': 1, 'o': 1}, (.22, .66), 10),
         layer('table', 'in-table', 680, 3, {'x': 0, 'y': 650, 's': .8, 'o': 0}, {'x': 0, 'y': 598, 's': 1, 'o': 1}, (.40, .84), 4),
         layer('talk', 'in-talk-m', 470, 7, {'x': 60, 'y': 420, 's': .4, 'o': 0}, {'x': 135, 'y': 338, 's': 1, 'o': 1}, (.6, .96), 10)]
    return {'page': 'hp-industry', 'enabled': True, 'eyebrow': 'Human Practices',
            'note': ('Generated by tools/scene-art/subpage_openings.py; edit the script, not this file. Envelope to dialogue: the envelope '
                     'opens, the invitation and presentation materials fly out, a meeting table rises and both sides talk. Deliberately no '
                     'factory, production line, certificate, shelf goods, handshake or money: exploration and exchange, not commercialisation.'),
            'desktop': {'canvas': [1600, 900], 'title': {'y': -50, 'toY': -300, 'toScale': .62, 'fontSize': 100}, 'layers': D},
            'mobile': {'canvas': [900, 1600], 'title': {'y': -110, 'toY': -470, 'toScale': .7, 'fontSize': 84}, 'layers': M}}


PAGES.update({'hp-investigation': hp_investigation, 'hp-industry': hp_industry})
PAGE_PROPS.update({'hp-investigation': [p for p in NEW_PROPS if p.startswith('iv-')],
                   'hp-industry': [p for p in NEW_PROPS if p.startswith('in-')]})


# ====================================================================== round 3: description, engineering, contribution
def blob(cv, rng, cx, cy, r, col, n=9, **tex):
    return piece(cv, rng, [(cx + math.cos(a) * r * rng.uniform(.85, 1.1), cy + math.sin(a) * r * rng.uniform(.85, 1.1))
                           for a in (i * 2 * math.pi / n for i in range(n))], col, **tex)


def paint_grower(size):
    """A faceless grower pawn at the field edge with a seedling tray (the decision before planting)."""
    rng = random.Random('pd-grower')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    pawn(cv, rng, W * .36, H * .96, H * .78, 'olive')
    piece(cv, rng, [(W * .2, H * .2), (W * .52, H * .2), (W * .46, H * .25), (W * .26, H * .25)], 'mustard', scratch='ochre', cover=.5)  # hat brim
    piece(cv, rng, cut_poly(rng, (W * .56, H * .78, W * .98, H * .94), step=40 * SS, jit=3 * SS), 'rust', scratch='orange', cover=.4)
    d = ImageDraw.Draw(cv)
    for i in range(5):
        x = W * (.6 + i * .08)
        d.line([(x, H * .79), (x, H * .7)], fill=rgb('dkolive'), width=4 * SS)
        leaf(d, x - 8 * SS, H * .69, 13 * SS, 'olive')
        leaf(d, x + 8 * SS, H * .72, 10 * SS, 'mustard')
    return finish(cv, size)


def paint_sig(kind):
    def paint(size):
        rng = random.Random('pd-sig-' + kind)
        W, H = size[0] * SS, size[1] * SS
        cv = canvas(size)
        for i in range(9):
            x, y = rng.uniform(.18, .82) * W, rng.uniform(.18, .82) * H
            if kind == 'a':   # orange chained beads
                for j in range(3):
                    blob(cv, rng, x + j * 14 * SS, y + j * 6 * SS, 9 * SS, 'orange', 7, scratch='amber', cover=.6)
            else:             # lilac cut diamonds
                r = rng.uniform(13, 19) * SS
                piece(cv, rng, [(x, y - r), (x + r * .7, y), (x, y + r), (x - r * .7, y)], 'lilac', scratch='pmauve', cover=.6)
        return finish(cv, size)
    return paint


def paint_strips(size):
    """Two freeze-dried paper test strips; their yellow readout pads differ in depth (illustrative, not a result)."""
    rng = random.Random('pd-strips')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    for i, (cx, pad) in enumerate(((.33, 'amber'), (.67, 'cream2'))):
        a = math.radians(-8 + i * 14)
        def rot(dx, dy):
            return (W * cx + dx * math.cos(a) - dy * math.sin(a), H * .5 + dx * math.sin(a) + dy * math.cos(a))
        hw, hh = W * .11, H * .44
        piece(cv, rng, [rot(-hw, -hh), rot(hw, -hh), rot(hw, hh), rot(-hw, hh)], 'cream', scratch='ochre', cover=.4)
        piece(cv, rng, [rot(-hw * .7, -hh * .2), rot(hw * .7, -hh * .2), rot(hw * .7, hh * .25), rot(-hw * .7, hh * .25)],
              pad if pad != 'cream2' else 'mustard', scratch='ochre', cover=.5 if i == 0 else .2)
        if i == 1:  # paler pad: lay a cream veil
            piece(cv, rng, [rot(-hw * .7, -hh * .2), rot(hw * .7, -hh * .2), rot(hw * .7, hh * .05), rot(-hw * .7, hh * .05)], 'cream2', cover=.1)
        piece(cv, rng, [rot(-hw, -hh), rot(hw, -hh), rot(hw, -hh * .62), rot(-hw, -hh * .62)], 'lilac' if i == 0 else 'mauve', scratch='pmauve', cover=.4)
    return finish(cv, size)


def paint_lab(size):
    """Professional confirmation: a microscope and a small rack of sample vials."""
    rng = random.Random('pd-lab')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    piece(cv, rng, cut_poly(rng, (W * .08, H * .86, W * .62, H * .97), step=40 * SS, jit=2 * SS), 'plum', scratch='mauve', cover=.5)
    piece(cv, rng, [(W * .38, H * .86), (W * .5, H * .86), (W * .5, H * .3), (W * .42, H * .3)], 'mauve', scratch='pmauve', cover=.5)
    piece(cv, rng, [(W * .16, H * .14), (W * .26, H * .08), (W * .5, H * .5), (W * .4, H * .56)], 'pmauve', scratch='cream', cover=.4)
    piece(cv, rng, cut_poly(rng, (W * .16, H * .6, W * .44, H * .65), step=30 * SS, jit=2 * SS), 'rust')
    piece(cv, rng, cut_poly(rng, (W * .64, H * .74, W * .96, H * .97), step=40 * SS, jit=2 * SS), 'rust', scratch='orange', cover=.4)
    for i in range(3):
        x = W * (.69 + i * .09)
        piece(cv, rng, [(x, H * .5), (x + 16 * SS, H * .5), (x + 16 * SS, H * .8), (x, H * .8)], 'cream', scratch='ochre', cover=.3)
        piece(cv, rng, [(x, H * .66), (x + 16 * SS, H * .66), (x + 16 * SS, H * .8), (x, H * .8)], ('amber', 'mustard', 'plum')[i])
    return finish(cv, size)


def paint_ring(open_: bool):
    """DBTL loop: four cut-paper arc segments with arrow tips round a cream disc; the open one keeps a dashed gap."""
    def paint(size):
        rng = random.Random('pe-ring' + ('-open' if open_ else ''))
        W, H = size[0] * SS, size[1] * SS
        cv = canvas(size)
        cx, cy, R1, R2 = W / 2, H / 2, W * .47, W * .37
        blob(cv, rng, cx, cy, R2 * .95, 'cream', 16, scratch='ochre', cover=.35)
        cols = ('ochre', 'olive', 'mauve', 'rust')
        for i, col in enumerate(cols):
            if open_ and i == 3:
                d = ImageDraw.Draw(cv)
                pts = [(cx + math.cos(a) * (R1 + R2) / 2, cy + math.sin(a) * (R1 + R2) / 2)
                       for a in (math.radians(-90 + i * 90 + 8 + t * 74 / 16) for t in range(17))]
                dashes(d, pts, rgb('cream2'), int((R1 - R2) * .5), 14 * SS, 12 * SS)
                continue
            a0, a1 = math.radians(-90 + i * 90 + 8), math.radians(-90 + i * 90 + 70)
            arc = [(cx + math.cos(a0 + (a1 - a0) * t / 12) * R1, cy + math.sin(a0 + (a1 - a0) * t / 12) * R1) for t in range(13)]
            arc += [(cx + math.cos(a1 + .2) * (R1 + R2) / 2, cy + math.sin(a1 + .2) * (R1 + R2) / 2)]
            arc += [(cx + math.cos(a1 - (a1 - a0) * t / 12) * R2, cy + math.sin(a1 - (a1 - a0) * t / 12) * R2) for t in range(13)]
            piece(cv, rng, arc, col, scratch='amber' if col != 'ochre' else 'orange', cover=.6)
        return finish(cv, size)
    return paint


def paint_cabinet(size):
    rng = random.Random('pc-cabinet')
    W, H = size[0] * SS, size[1] * SS
    cv = canvas(size)
    for x in (.12, .8):
        piece(cv, rng, [(W * x, H * .9), (W * (x + .08), H * .9), (W * (x + .07), H), (W * (x + .01), H)], 'rust')
    piece(cv, rng, cut_poly(rng, (W * .04, H * .02, W * .96, H * .92), jit=3 * SS), 'ochre', scratch='orange', cover=.55)
    piece(cv, rng, cut_poly(rng, (W * .02, H * .02, W * .98, H * .08), jit=2 * SS), 'rust', scratch='orange', cover=.4)
    for i in range(3):
        y0 = H * (.13 + i * .26)
        piece(cv, rng, cut_poly(rng, (W * .12, y0, W * .88, y0 + H * .2), step=50 * SS, jit=2 * SS), 'plum', scratch='mauve', cover=.4)
        d = ImageDraw.Draw(cv)
        d.line([(W * .2, y0 + H * .17), (W * .8, y0 + H * .17)], fill=rgb('dkolive', 140), width=4 * SS)
    return finish(cv, size)


def paint_tray(part):
    def paint(size):
        rng = random.Random('pc-tray-' + part)
        W, H = size[0] * SS, size[1] * SS
        cv = canvas(size)
        if part == 'back':
            piece(cv, rng, [(W * .06, H * .05), (W * .94, H * .05), (W * .99, H * .95), (W * .01, H * .95)], 'mustard', scratch='ochre', cover=.5)
            piece(cv, rng, [(W * .1, H * .12), (W * .9, H * .12), (W * .94, H * .95), (W * .06, H * .95)], 'rust', scratch='orange', cover=.4)
        else:
            piece(cv, rng, cut_poly(rng, (W * .01, H * .05, W * .99, H * .95), jit=3 * SS), 'ochre', scratch='orange', cover=.55)
            d = ImageDraw.Draw(cv)
            d.rounded_rectangle([W * .43, H * .4, W * .57, H * .6], 8 * SS, fill=rgb('rust'))
        return finish(cv, size)
    return paint


TRAY = (640, 380)


def drawer(items):
    parts = [('pc-tray-back', 320, 205, 620)]
    parts += items
    parts += [('pc-tray-front', 320, 318, 640)]
    return (TRAY, parts)


LOOP = (420, 420)
NEW_PROPS.update({
    'pd-grower': (paint_grower, (360, 420), 'a simple faceless paper pawn in olive with a small mustard hat brim, standing at a field edge, next to a rust seedling tray with five small olive and mustard seedlings'),
    'pd-sig-a': (paint_sig('a'), (260, 260), 'a loose cloud of nine tiny orange paper bead-chains (each three small round beads), floating, with amber scratches'),
    'pd-sig-b': (paint_sig('b'), (260, 260), 'a loose cloud of nine small lilac paper diamonds, floating, with pale-mauve scratches'),
    'pd-strips': (paint_strips, (420, 300), 'two narrow cream paper test strips standing side by side and slightly tilted, each with a small lilac or mauve cap piece at the top and a square pad in the middle: the left pad deep amber yellow, the right pad a pale cream-mustard; no text and no marks'),
    'pd-lab': (paint_lab, (360, 360), 'a simple microscope in mauve and pale-mauve paper on a plum base, and beside it a small rust rack with three cream sample vials holding amber, mustard and plum contents'),
    'pe-ring': (paint_ring(False), LOOP, None),
    'pe-ring-open': (paint_ring(True), LOOP, None),
    'pc-cabinet': (paint_cabinet, (420, 520), 'a small wooden cabinet seen from the front: ochre body with orange scratches, a rust top edge and short rust legs, and three empty dark plum drawer openings stacked one above the other'),
    'pc-tray-back': (paint_tray('back'), (640, 200), None),
    'pc-tray-front': (paint_tray('front'), (640, 140), None),
})
LOOP_ICON = {'build': ('i-yeast', 230), 'readout': ('pd-strips', 210), 'format': ('i-desc-sensor', 230), 'field': ('i-field', 250)}
LOOP_DESC = {
    'build': 'a round loop of four curved paper arrows (ochre, olive, mauve, rust, each with an arrow tip) around a cream disc, inside the disc a small cluster of round pale yeast cells',
    'readout': 'the same round loop of four curved arrows around a cream disc, inside it two small test strips with yellow pads of different depth',
    'format': 'the same round loop of four curved arrows around a cream disc, inside it three small flat paper test strips lying in a row',
    'field': 'the same round loop of four curved arrows around a cream disc, inside it a tiny field plot with rows of olive seedlings',
}
for k, (icon, w) in LOOP_ICON.items():
    COMPOSITES[f'pe-loop-{k}'] = (LOOP, [('pe-ring', 210, 210, 420), (icon, 210, 210, w)])
    NEW_PROPS[f'pe-loop-{k}'] = (None, LOOP, LOOP_DESC[k])
COMPOSITES['pe-next'] = (LOOP, [('pe-ring-open', 210, 210, 420)])
NEW_PROPS['pe-next'] = (None, LOOP, 'the same round loop around a cream disc, but only three arrows are there: the fourth quarter (lower left) is an open gap marked by a few loose cream paper dashes, the disc empty; it must look unfinished')
COMPOSITES['pd-sig-m'] = ((420, 300), [('pd-sig-a', 130, 140, 240), ('pd-sig-b', 290, 160, 240)])
COMPOSITES['pc-drawer-bio'] = drawer([('block-promoter', 110, 170, 140), ('block-cds', 250, 160, 160), ('i-contrib-cryo', 400, 150, 170), ('i-contrib-docs', 535, 150, 170)])
COMPOSITES['pc-drawer-model'] = drawer([('i-model-dock', 105, 150, 150), ('i-model-md', 245, 150, 170), ('i-model-ode', 395, 150, 160), ('i-model-eco', 535, 160, 170)])
COMPOSITES['pc-drawer-edu'] = drawer([('i-library', 150, 165, 260), ('i-paperwork', 360, 140, 170), ('i-soil-bed', 520, 180, 190)])
NEW_PROPS.update({
    'pc-drawer-bio': (None, TRAY, 'an open ochre wooden drawer seen from the front and slightly above, filled with: two chunky paper gene blocks (rounded rectangles in olive and lilac), a small rack of cream cryotubes with coloured caps, and a mustard notebook with a pencil (a protocol book)'),
    'pc-drawer-model': (None, TRAY, 'an open ochre wooden drawer seen from the front and slightly above, filled with four small paper model cards: a docked molecule pair, a layered membrane slab with tiny molecules, a line chart card with two rising curves, and a little field-and-coins card'),
    'pc-drawer-edu': (None, TRAY, 'an open ochre wooden drawer seen from the front and slightly above, filled with: a stack of picture books with one open, a cream questionnaire on a clipboard, and a little heap of plum soil clods in a sample tray'),
})


def hp_like(page, note, D, M, dt, mt):
    return {'page': page, 'enabled': True,
            'note': f'Generated by tools/scene-art/subpage_openings.py; edit the script, not this file. {note} Origin at the centre, y down.',
            'desktop': {'canvas': [1600, 900], 'title': dt, 'layers': D}, 'mobile': {'canvas': [900, 1600], 'title': mt, 'layers': M}}


def T1(x, y, **k):
    return dict({'x': x, 'y': y, 's': 1, 'o': 1}, **k)


def description() -> dict:
    D = [layer('roots', 'i-desc-roots', 360, 2, {'x': -40, 'y': 300}, T1(-270, 300, s=1.04), (.04, .6), 6),
         layer('grower', 'pd-grower', 230, 4, {'x': -300, 'y': 236}, T1(-620, 196), (.04, .62), 10),
         layer('strips', 'pd-strips', 320, 5, {'x': 120, 'y': 320, 's': .55, 'o': 0}, T1(250, 190, r=-2), (.18, .68), 12),
         layer('sig-a', 'pd-sig-a', 130, 6, {'x': -190, 'y': 320, 's': .5, 'o': 0}, T1(150, 44), (.28, .80), 16),
         layer('sig-b', 'pd-sig-b', 130, 6, {'x': -70, 'y': 330, 's': .5, 'o': 0}, T1(345, 58), (.34, .86), 16),
         layer('yeast', 'i-yeast', 170, 6, {'x': 180, 'y': 330, 's': .5, 'o': 0}, T1(490, 290), (.26, .76), 10),
         layer('lab', 'pd-lab', 220, 3, {'x': 560, 'y': 250, 's': .7, 'o': 0}, T1(625, 40), (.56, .96), 20)]
    M = [layer('roots', 'i-desc-roots', 480, 2, {'x': 60, 'y': 420}, T1(110, 600), (.04, .6), 4),
         layer('grower', 'pd-grower', 250, 4, {'x': -200, 'y': 300}, T1(-255, 520), (.04, .6), 6),
         layer('sig', 'pd-sig-m', 330, 6, {'x': 40, 'y': 470, 's': .4, 'o': 0}, T1(40, 300), (.26, .80), 10),
         layer('strips', 'pd-strips', 430, 5, {'x': 60, 'y': 240, 's': .5, 'o': 0}, T1(60, 60), (.16, .66), 8),
         layer('lab', 'pd-lab', 270, 3, {'x': -220, 'y': -500, 's': .7, 'o': 0}, T1(-215, -575), (.56, .96), 12),
         layer('yeast', 'i-yeast', 240, 6, {'x': 200, 'y': -480, 's': .6, 'o': 0}, T1(215, -560), (.30, .80), 10)]
    return hp_like('description', 'NemaKlear from the grower decision: roots and nematodes in the soil, two kinds of signal rising to two yeast-sensor test strips whose yellow pads differ, and a microscope in the distance for professional confirmation. Illustrative only: no ticks, numbers or verdicts.',
                   D, M, {'y': -40, 'toY': -300, 'toScale': .62}, {'y': -90, 'toY': -470, 'toScale': .7})


def engineering() -> dict:
    p0 = {'build': (-600, -190, -6), 'readout': (600, -190, 6), 'format': (-620, 228, 4), 'field': (620, 228, -4)}
    p1 = {'build': (-560, 80), 'readout': (-290, 250), 'format': (290, 250), 'field': (560, 80)}
    wins = {'build': (.05, .60), 'readout': (.12, .67), 'format': (.19, .74), 'field': (.26, .81)}
    D = [layer(k, f'pe-loop-{k}', 250, 4, {'x': x, 'y': y, 'r': r, 's': .9}, T1(*p1[k], r=0), wins[k], 12) for k, (x, y, r) in p0.items()]
    D.append(layer('next', 'pe-next', 290, 3, {'x': 0, 'y': 300, 's': .4, 'o': 0, 'r': -20}, T1(0, 172, r=0), (.55, .95), 8))
    m0 = {'build': (-230, -470, -6), 'readout': (230, -470, 6), 'format': (-230, 430, 4), 'field': (230, 430, -4)}
    m1 = {'build': (-215, 60), 'readout': (215, 60), 'format': (-215, 610), 'field': (215, 610)}
    M = [layer(k, f'pe-loop-{k}', 300, 4, {'x': x, 'y': y, 'r': r, 's': .9}, T1(*m1[k], r=0), wins[k], 8) for k, (x, y, r) in m0.items()]
    M.append(layer('next', 'pe-next', 320, 3, {'x': 0, 'y': 420, 's': .4, 'o': 0, 'r': -20}, T1(0, 335, r=0), (.55, .95), 6))
    return hp_like('engineering', 'Four DBTL goal stations (biosensor, informative readout, usable test format, agricultural refinement) move in round a fifth loop that stays open: the next cycle, system integration not yet done.',
                   D, M, {'y': -40, 'toY': -300, 'toScale': .62}, {'y': -90, 'toY': -470, 'toScale': .7})


def contribution() -> dict:
    D = [layer('cabinet', 'pc-cabinet', 260, 5, {'x': 0, 'y': 246}, T1(0, 250), (.0, .5), 8),
         layer('drawer-bio', 'pc-drawer-bio', 380, 3, {'x': 0, 'y': 180, 's': .45}, T1(-535, 30, r=-3), (.08, .55), 14),
         layer('drawer-model', 'pc-drawer-model', 380, 3, {'x': 0, 'y': 252, 's': .45}, T1(545, 110, r=3), (.25, .72), 14),
         layer('drawer-edu', 'pc-drawer-edu', 380, 3, {'x': 0, 'y': 324, 's': .45}, T1(-470, 300, r=-2), (.42, .90), 10)]
    M = [layer('cabinet', 'pc-cabinet', 280, 5, {'x': 0, 'y': 330}, T1(170, 590), (.04, .7), 6),
         layer('drawer-bio', 'pc-drawer-bio', 420, 3, {'x': 0, 'y': 255, 's': .45}, T1(-40, -575, r=-3), (.08, .55), 8),
         layer('drawer-model', 'pc-drawer-model', 420, 3, {'x': 0, 'y': 330, 's': .45}, T1(60, 20, r=3), (.25, .72), 8),
         layer('drawer-edu', 'pc-drawer-edu', 420, 3, {'x': 0, 'y': 405, 's': .45}, T1(-90, 300, r=-2), (.42, .90), 8)]
    return hp_like('contribution', 'A three-drawer cabinet opens drawer by drawer: biological parts and experimental resources; computational methods and models; educational and engagement resources. Reusable resources, not just genetic parts.',
                   D, M, {'y': -40, 'toY': -300, 'toScale': .62}, {'y': -90, 'toY': -470, 'toScale': .7})


PAGES.update({'description': description, 'engineering': engineering, 'contribution': contribution})
PAGE_PROPS.update({'description': [p for p in NEW_PROPS if p.startswith('pd-')],
                   'engineering': ['pe-ring', 'pe-ring-open'],
                   'contribution': ['pc-cabinet', 'pc-tray-back', 'pc-tray-front']})


# ====================================================================== sources and packing
def source(prop: str) -> tuple[Image.Image, str]:
    g = STORE / 'gpt' / f'{prop}.png'
    if g.exists():  # a GPT drawing of a whole composite object beats its placeholder assembly
        return Image.open(g).convert('RGBA'), 'gpt'
    if prop in COMPOSITES:
        return composite(prop), 'composite'
    for kind in ('gpt', 'auto'):
        f = STORE / kind / f'{prop}.png'
        if f.exists():
            return Image.open(f).convert('RGBA'), ('route' if prop in ('iv-path', 'iv-path-m') else kind)
    sys.exit(f'missing source for {prop}: run "build" first')


def resize(im: Image.Image, size) -> Image.Image:
    size = (max(1, round(size[0])), max(1, round(size[1])))
    return im if im.size == size else im.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')


def composite(prop: str) -> Image.Image:
    size, parts = COMPOSITES[prop]
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    for src, cx, cy, w in parts:
        v, _ = source(src)
        v = v.crop(v.getbbox())
        v = resize(v, (w, w * v.height / v.width))
        out.alpha_composite(v, (round(cx - v.width / 2), round(cy - v.height / 2)))
    STORE.joinpath('auto').mkdir(parents=True, exist_ok=True)
    out.save(STORE / 'auto' / f'{prop}.png', optimize=True)  # keeps compose_atlas.py able to refill this frame
    return out


def shelf(sizes, width):
    order = sorted(sizes, key=lambda k: (-sizes[k][1], -sizes[k][0]))
    pos, x, y, rh = {}, 0, 0, 0
    for k in order:
        w, h = sizes[k]
        if x and x + w > width:
            x, y, rh = 0, y + rh + GAP, 0
        pos[k] = (x, y)
        x += w + GAP
        rh = max(rh, h)
    return pos, y + rh


def pack(page: str, kind: str, layout: dict, used: dict) -> dict:
    cfg = SETS[kind]
    want = {}
    for l in layout[kind]['layers']:
        s = max(l['from'].get('s', 1), l['to'].get('s', 1))
        want[l['prop']] = max(want.get(l['prop'], 0), l['w'] * s * cfg['density'])
    imgs = {}
    for prop, tw in want.items():
        im, src = source(prop)
        im = im.crop(im.getbbox())
        w = min(round(tw), im.width)
        imgs[prop] = resize(im, (w, im.height * w / im.width))
        used[kind][src] = used[kind].get(src, 0) + 1
    shrink = 1.0
    while True:
        cur = {k: v if shrink == 1 else resize(v, (v.width * shrink, v.height * shrink)) for k, v in imgs.items()}
        sizes = {k: v.size for k, v in cur.items()}
        best = None
        for width in range(max(w for w, _ in sizes.values()), cfg['max_edge'] + 1, 64):
            pos, H = shelf(sizes, width)
            W = max(pos[k][0] + sizes[k][0] for k in pos)
            if H <= cfg['max_edge'] and (best is None or W * H < best[0]):
                best = (W * H, pos, W, H)
        if best:
            _, pos, W, H = best
            sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            for k, im in cur.items():
                sheet.paste(im, pos[k])
            for q in QUALITIES:
                buf = io.BytesIO()
                sheet.save(buf, 'WEBP', quality=q, alpha_quality=90, method=6)
                if buf.tell() <= cfg['budget']:
                    break
            if buf.tell() <= cfg['budget']:
                break
        shrink *= .92
    data = buf.getvalue()
    OUT.mkdir(parents=True, exist_ok=True)
    name = f'{page}-{kind}.webp'
    (OUT / name).write_bytes(data)
    sc = min(1.0, 240 / max(sheet.size))
    pb = io.BytesIO()
    resize(sheet, (sheet.width * sc, sheet.height * sc)).save(pb, 'WEBP', quality=35, method=6)
    src = used[kind]
    style = ('subpage-v1 ' + ', '.join(f'{k} {v}' for k, v in sorted(src.items()))
             + ('' if not src.get('auto') else ' (auto = PROCEDURAL PLACEHOLDER, awaiting GPT redraw)'))
    return {'file': name, 'size': [W, H], 'bytes': len(data), 'quality': q,
            'hash': hashlib.sha256(data).hexdigest()[:12],
            'frames': {k: [pos[k][0], pos[k][1], sizes[k][0], sizes[k][1]] for k in sorted(pos)},
            'style': style, 'preview': 'data:image/webp;base64,' + base64.b64encode(pb.getvalue()).decode()}


def write_layout(page: str) -> dict:
    layout = PAGES[page]()
    LAYOUTS.joinpath(f'{page}.json').write_text(json.dumps(layout, indent=2) + '\n')
    return layout


def run_pack(page: str) -> None:
    layout = json.loads((LAYOUTS / f'{page}.json').read_text())
    used = {'desktop': {}, 'mobile': {}}
    atlas = {kind: pack(page, kind, layout, used) for kind in SETS}
    (LAYOUTS / f'{page}.atlas.json').write_text(json.dumps(atlas, indent=2) + '\n')
    for kind, a in atlas.items():
        print(f'{a["file"]:28s} {a["size"][0]}x{a["size"][1]} {a["bytes"] / 1000:5.0f} kB q{a["quality"]}  {a["style"]}')
    check(page)


def make_placeholders(page: str) -> None:
    (STORE / 'auto').mkdir(parents=True, exist_ok=True)
    for prop in PAGE_PROPS[page]:
        painter, size, _ = NEW_PROPS[prop]
        if painter is None:  # composite: assembled on pack
            continue
        im = painter(size)
        im.save(STORE / 'auto' / f'{prop}.png', optimize=True)
        tag = ' (gpt/ version exists and wins)' if (STORE / 'gpt' / f'{prop}.png').exists() else ''
        print(f'placeholder  assets/scenes-2d/auto/{prop}.png  {im.size[0]}x{im.size[1]}{tag}')


# ====================================================================== framing check (mirrors scene-framing.ts)
def sample(layers, frames, p):
    L = T = math.inf
    R = B = -math.inf
    for l in layers:
        f, t, (a, b) = l['from'], l['to'], l['win']
        k = 1 - (1 - min(1, max(0, (p - a) / max(.001, b - a)))) ** 3
        mix = lambda key, d: f.get(key, d) + (t.get(key, f.get(key, d)) - f.get(key, d)) * k
        x, y, r, s = mix('x', 0), mix('y', 0), mix('r', 0), mix('s', 1)
        fw, fh = frames[l['prop']][2:]
        w, h = l['w'], l['w'] * fh / fw
        c, sn = abs(math.cos(math.radians(r))), abs(math.sin(math.radians(r)))
        hw = (w * c + h * sn) * s / 2 + l['depth']
        hh = (w * sn + h * c) * s / 2 + l['depth'] * .6
        L, R, T, B = min(L, x - hw), max(R, x + hw), min(T, y - hh), max(B, y + hh)
    return L, T, R, B


VIEWPORTS = [('desktop', 1440, 900), ('desktop', 1920, 1080), ('desktop', 1280, 720), ('desktop', 844, 390),
             ('mobile', 390, 844), ('mobile', 360, 740), ('mobile', 768, 1024)]


def check(page: str) -> None:
    layout = json.loads((LAYOUTS / f'{page}.json').read_text())
    atlas = json.loads((LAYOUTS / f'{page}.atlas.json').read_text())
    print(f'framing {page}: camera scale / max unit at p = 0 .25 .5 .75 1  (1.00 = no zoom-out; steady = no pumping)')
    for kind, vw, vh in VIEWPORTS:
        if (kind == 'mobile') != (vw / vh <= .8):
            continue
        canvas = 1600 if kind == 'desktop' else 900
        u = min(vw, vh * (16 / 9 if kind == 'desktop' else 9 / 16)) / canvas
        nav = 78 if vw <= 520 else 88
        bottom = (80 if vw <= 640 else min(36, max(18, vh * .03)))
        top = nav + 18
        ah = vh - top - bottom
        aw = vw - 2 * min(36, max(16, vw * .02))
        oy = min(ah * .6, max(ah * .4, vh / 2 - top))
        row = []
        for p in (0, .25, .5, .75, 1):
            Lb, Tb, Rb, Bb = sample(layout[kind]['layers'], atlas[kind]['frames'], p)
            cu = max(.001, min(u, aw / 2 / max(1, -Lb), aw / 2 / max(1, Rb), oy / max(1, -Tb), (ah - oy) / max(1, Bb)))
            row.append(cu / u)
        print(f'  {kind:7s} {vw}x{vh}:  ' + '  '.join(f'{r:.2f}' for r in row))


# ====================================================================== GPT kit
SHEET = (1536, 1024)
BG = (234, 229, 219)
RULES = """TASK
Make ONE new image that can be laid exactly over the layout sheet:
1. Same canvas: 1536 x 1024 pixels, landscape.
2. Same objects in the same places, at the same sizes, with the same outlines. Do not add, remove, merge, swap, turn or move any object. Keep the empty space between objects; no object may touch another. The four map quarters on the left stay four separate pieces with the same narrow gaps between them.
3. Redraw every object in the style described below. The grey layout sheet only shows placement and rough shapes; it is a stand-in, do not copy its flat look.
4. Background: fully transparent (PNG with alpha). If transparency is impossible, use one perfectly flat pure white #FFFFFF background with nothing else on it.
5. Do not draw the sheet number. No text, letters, numbers, labels, logos, borders, frames, ground lines, floors or shadows anywhere.

STYLE (match 00-style.png: our homepage art on top, our existing props below)
- Flat hand-cut paper collage: every shape is cut from matte coloured paper with scissors, so its edges are straight, slightly irregular cuts with a few corners. No outlines, no ink lines.
- Each shape is one flat paper colour. Sides and details are separate overlapping pieces of slightly darker or lighter paper. Very light volume as in the existing props, but no gradients, no airbrush, no glossy highlights, no 3D rendering, no drop shadows.
- Texture as in the reference: oil-pastel or crayon scratches in a second, warmer colour running in one direction across each piece, a few dry-brush streaks, fine dark speckles and visible paper grain. Soil is speckled and dotted with small pale stones.
- Simple, chunky, readable shapes. It must look like the same artist as the props in the bottom half of 00-style.png (envelope, speech bubbles, blackboard, field plot).
- Palette, muted like the reference (never pure white, never black, never neon): olive #7B7639, dark olive #58542A, ochre #C88F35, mustard #B58D3A, rust #83403C, plum #6E4764, mauve #8D6B84, pale mauve #B59BB8, lilac #9479B8, orange #E88F46, amber #DFA340, cream #E6D7BB."""


def ov_cells():
    """Sheet plan: the whole unfolded map (2x2 quarters) on the left, the single props stacked on the right."""
    cells = []
    qw, qh, g = 480, 300, 24
    mx0, my0 = 44, 62 + (918 - (2 * qh + g)) // 2
    for k, (c, r) in zip(('ihp', 'edu', 'inv', 'ind'), ((0, 0), (1, 0), (0, 1), (1, 1))):
        x, y = mx0 + c * (qw + g), my0 + r * (qh + g)
        cells.append({'key': f'ov-map-{k}', 'box': [x, y, x + qw, y + qh], 'anchor': 'fill', 'size': list(PANEL)})
    rx, y = 44 + 2 * qw + g + 64, 62
    for prop, (bw, bh) in (('ov-map-cover', (400, 280)), ('ov-knot', (400, 250)), ('ov-v-inv', (300, 225))):
        x = rx + (400 - bw) // 2
        cells.append({'key': prop, 'box': [x, y, x + bw, y + bh], 'anchor': 'centre', 'size': list(NEW_PROPS[prop][1])})
        y += bh + 40
    return cells


def row_cells(rows):
    """Rows of (prop, box w, box h), each row centred, rows spread over the free height."""
    cells, top, free = [], 62, 918
    gap_y = (free - sum(max(h for _, _, h in r) for r in rows)) / max(1, len(rows) + 1)
    y = top + gap_y
    for ri, r in enumerate(rows):
        rh = max(h for _, _, h in r)
        gap_x = (SHEET[0] - 88 - sum(w for _, w, _ in r)) / (len(r) + 1)
        x = 44 + gap_x
        for prop, w, h in r:
            yy = y + (rh - h) / 2
            cells.append({'key': prop, 'box': [round(x), round(yy), round(x + w), round(yy + h)], 'anchor': 'centre', 'size': list(NEW_PROPS[prop][1]), 'row': ri})
            x += w + gap_x
        y += rh + gap_y
    return cells


def ov_lines():
    lines = ['LEFT HALF - one unfolded paper field map, cut along its two fold lines into four quarters with narrow gaps; draw them as one continuous map so the field plots and crop rows line up across the gaps. Cream map paper. In each quarter, keep the empty area around the small dot as plain map paper (a picture will be placed there later); keep the dashed rust route that runs from the inner corner (the corner touching the centre of the map) to that dot:']
    lines += [f'  {chr(97 + i)}) {QUAD_DESC[k]}.' for i, k in enumerate(('ihp', 'edu', 'inv', 'ind'))]
    lines.append('RIGHT COLUMN, top to bottom:')
    lines += [f'  {chr(101 + i)}) {NEW_PROPS[p][2]}.' for i, p in enumerate(('ov-map-cover', 'ov-knot', 'ov-v-inv'))]
    return lines


def row_lines(cells):
    n = max(c['row'] for c in cells) + 1
    names = {1: ['single row'], 2: ['top row', 'bottom row'], 3: ['top row', 'middle row', 'bottom row']}[n]
    out = []
    for i, c in enumerate(cells):  # row_cells emits them top row first, left to right
        nth = [x['key'] for x in cells if x['row'] == c['row']].index(c['key']) + 1
        out.append(f'  {chr(97 + i)}) {names[c["row"]]}, {nth} from left: {NEW_PROPS[c["key"]][2]}.')
    return out


# page -> sheet id, page name for the prompt, cells, object lines, extra rule
KIT_SHEETS = {
    'hp-overview': lambda: ('OV1', 'Human Practices Overview', ov_cells(), None,
                            ' The four map quarters on the left stay four separate pieces with the same narrow gaps between them.'),
}

KIT_SHEETS.update({
    'hp-investigation': lambda: ('IV1', 'Human Practices Investigation', row_cells([
        [('iv-museum', 400, 340), ('iv-interview', 440, 290), ('iv-greenhouse', 470, 310)],
        [('iv-corer', 420, 360), ('iv-marker', 200, 200)]]), None, ''),
    'hp-industry': lambda: ('IN1', 'Human Practices Industry Engagement and Support', row_cells([
        [('in-env-closed', 360, 160), ('in-env-open', 360, 240), ('in-letter', 300, 230)],
        [('in-table', 640, 305), ('in-deck', 380, 290)],
        [('in-talk-l', 300, 200), ('in-talk-r', 300, 200)]]), None, ''),
})

KIT_SHEETS.update({
    'description': lambda: ('PD1', 'Project Description', row_cells([
        [('pd-grower', 330, 390), ('pd-strips', 420, 300), ('pd-lab', 340, 340)],
        [('pd-sig-a', 240, 240), ('pd-sig-b', 240, 240)]]), None, ''),
    'engineering': lambda: ('PE1', 'Project Engineering', row_cells([
        [('pe-loop-build', 400, 400), ('pe-loop-readout', 400, 400), ('pe-loop-format', 400, 400)],
        [('pe-loop-field', 400, 400), ('pe-next', 400, 400)]]), None, ' The fifth loop must stay visibly open (one quarter missing).'),
    'contribution': lambda: ('PC1', 'Project Contribution', row_cells([
        [('pc-drawer-bio', 560, 333), ('pc-drawer-model', 560, 333)],
        [('pc-drawer-edu', 560, 333), ('pc-cabinet', 300, 371)]]), None, ''),
})


def kit(page: str) -> None:
    sid, pname, cells, lines, extra = KIT_SHEETS[page]()
    lines = lines or (ov_lines() if page == 'hp-overview' else row_lines(cells))
    send = KIT / '给GPT' / page
    (KIT / 'ref').mkdir(parents=True, exist_ok=True)
    (KIT / 'out').mkdir(parents=True, exist_ok=True)
    send.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGB', SHEET, BG)
    mask = Image.new('L', SHEET, 0)
    for c in cells:
        im, _ = source(c['key'])
        im = im.crop(im.getbbox())
        x0, y0, x1, y1 = c['box']
        k = min((x1 - x0) / im.width, (y1 - y0) / im.height)
        im = resize(im, (im.width * k, im.height * k))
        px, py = x0 + ((x1 - x0) - im.width) // 2, y0 + ((y1 - y0) - im.height) // 2
        g = np.asarray(im.convert('LA').convert('RGBA')).astype(np.float32)
        g[..., :3] = 120 + g[..., :3] * .45  # soft grey stand-in
        grey = Image.fromarray(g.clip(0, 255).astype(np.uint8))
        sheet.paste(grey, (px, py), grey)
        mask.paste(im.split()[3], (px, py))
    ImageDraw.Draw(sheet).text((14, 14), sid, fill=(150, 145, 138))
    sheet.save(send / f'{sid}.png', optimize=True)
    mask.save(KIT / 'ref' / f'{sid}-mask.png', optimize=True)
    style_board().save(send / '00-style.png', optimize=True)
    head = (f'You are going to redraw one layout sheet for our iGEM team wiki (page: {pname}). '
            'Draw it on your own without asking me anything.\n\nATTACHED\n'
            '- 00-style.png = STYLE REFERENCE: top, our team\'s own hand-cut paper illustration; bottom, props already drawn for the site. '
            'Copy technique, textures and palette. Do not copy their objects or composition.\n'
            f'- {sid}.png = LAYOUT SHEET: grey stand-ins on a plain light background showing where each object goes and its rough shape. '
            'The small number in the top-left corner is only the sheet number.\n\n')
    tail = ('\n\nThese are decorative illustrations only: no logos, no brand names, no text, no real people; any figures are simple faceless paper pawns.\n'
            f'If the result is not usable, I will reply "重画 {sid}"; then draw it again with the same rules.\n')
    rules = RULES.replace(' The four map quarters on the left stay four separate pieces with the same narrow gaps between them.', extra)
    prompt = head + rules + f'\n\nOBJECTS on sheet {sid} ({sid}.png)\n' + '\n'.join(lines) + tail
    (send / '提示词.txt').write_text(prompt, encoding='utf-8')
    (KIT / '使用说明.txt').write_text(GUIDE, encoding='utf-8')
    manifest_path = KIT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {'version': 1, 'size': list(SHEET), 'background': '#eae5db', 'label_box': [0, 0, 120, 56], 'sheets': []}
    manifest['sheets'] = [x for x in manifest['sheets'] if x['id'] != sid] + [
        {'id': sid, 'page': page, 'file': f'{sid}.png', 'match': [sid.lower(), page, page.split('-', 1)[-1]], 'cells': cells, 'prompt': prompt}]
    manifest['sheets'].sort(key=lambda x: x['id'])
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'kit -> {send.relative_to(ROOT)} (00-style.png, {sid}.png, 提示词.txt); manifest now: ' + ', '.join(x['id'] for x in manifest['sheets']))


def style_board() -> Image.Image:
    src = next((p for p in STYLE_SRC if p.exists()), None)
    board = Image.new('RGB', SHEET, (38, 30, 52))
    if src:
        st = Image.open(src).convert('RGB')
        st = st.resize((1000, round(st.height * 1000 / st.width)))
        board.paste(st, ((SHEET[0] - 1000) // 2, 12))
    x, y0 = 24, 700
    for n in ('i-env-closed', 'i-env-open', 'i-bubble-a', 'i-edu-board', 'i-field', 'i-paperwork', 'i-library'):
        f = STORE / 'gpt' / f'{n}.png'
        if not f.exists():
            continue
        im = Image.open(f).convert('RGBA')
        k = min(230 / im.width, 290 / im.height)
        im = resize(im, (im.width * k, im.height * k))
        board.paste(im, (x, y0 + (300 - im.height) // 2), im)
        x += im.width + 18
    return board


GUIDE = """六页开屏：GPT 素材生成与回填

原来的 gpt/manifest.json（16 张表）保持独立，本套使用 gpt/subpage-openings/manifest.json。

1. 给GPT/ 下六个页面目录各有构图底稿、00-style.png 和完整提示词.txt。
   OV1=HP Overview；IV1=Investigation；IN1=Industry；PD1=Description；PE1=Engineering；PC1=Contribution。
2. 同时附上该页底稿与风格板，粘贴提示词，生成透明 PNG。可以使用 Codex 内置 imagegen，无需 API key。
3. 原图放在 out/，建议文件名包含对应编号；同一编号取最新一张。自绘图勿使用 report 开头的文件名。
4. 在网站源码根运行：
       python3 tools/scene-art/subpage_gpt_ingest.py --dry-run
   查看 out/_report.png 新旧对照，确认每个道具完整且没有邻图串入，再运行：
       python3 tools/scene-art/subpage_gpt_ingest.py
   脚本自动切图、写入 assets/scenes-2d/gpt/、重建合成帧与横竖图集、更新 hash。
5. 已交付的六张源图已回填。Project 三张图有轻微构图漂移，随图附有同名 .cells.json，
   记录经检查的裁切区域；导入器自动读取。更换新图时，应先移动旧图及旧裁切映射，再重新检查。
6. 程序底稿保留在 assets/scenes-2d/auto/，同名 GPT 图优先。虚线路径为设计排版元素，不需要重画。
7. 所有插画仅用于开屏装饰，不充当科学数据。来源见 docs/subpage-opening/AI-PROVENANCE.json。
"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('cmd', choices=['build', 'pack', 'check', 'kit'])
    ap.add_argument('pages', nargs='*', default=['hp-overview'])
    a = ap.parse_args()
    for page in a.pages:
        if page not in PAGES:
            sys.exit(f'{page}: not in this round (available: {", ".join(PAGES)})')
        if a.cmd == 'build':
            make_placeholders(page)
            write_layout(page)
            run_pack(page)
        elif a.cmd == 'pack':
            write_layout(page)
            run_pack(page)
        elif a.cmd == 'check':
            check(page)
        else:
            kit(page)


if __name__ == '__main__':
    main()
