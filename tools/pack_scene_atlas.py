"""Pack one page's opening props into the two WebP atlases the site loads.

    python3 tools/pack_scene_atlas.py description
    python3 tools/pack_scene_atlas.py --all

Reads   src/data/scenes/<page>.json          (the layout: which props, how wide)
        assets/scenes/<page>/<prop>.png      (transparent sources)
Writes  static/img/scenes/<page>-desktop.webp, <page>-mobile.webp
        src/data/scenes/<page>.atlas.json    (frame of every prop + file hash)

Each prop is scaled to the widest size the layout ever draws it at (its width
times the layer's largest scale) times DENSITY, so it stays sharp on 2x
screens without shipping pixels nobody sees. If an atlas comes out over its
byte budget the WebP quality is lowered, then the whole sheet is scaled down,
until it fits. Development tool only: needs Pillow, not part of the site.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LAYOUTS = ROOT / 'src' / 'data' / 'scenes'
SOURCES = ROOT / 'assets' / 'scenes'
OUT = ROOT / 'static' / 'img' / 'scenes'

# atlas px per design px, max sheet edge, byte budget
SETS = {
    'desktop': {'density': 1.45, 'max_edge': 2560, 'budget': 290_000},
    'mobile': {'density': 1.25, 'max_edge': 2048, 'budget': 165_000},
}
GAP = 4


def shelf_pack(sizes: dict[str, tuple[int, int]], width: int) -> tuple[dict[str, tuple[int, int]], int]:
    """Tallest first, left to right in rows. Returns positions and sheet height."""
    order = sorted(sizes, key=lambda k: (-sizes[k][1], -sizes[k][0]))
    pos: dict[str, tuple[int, int]] = {}
    x = y = row_h = 0
    for k in order:
        w, h = sizes[k]
        if x and x + w > width:
            x, y, row_h = 0, y + row_h + GAP, 0
        pos[k] = (x, y)
        x += w + GAP
        row_h = max(row_h, h)
    return pos, y + row_h


def best_sheet(sizes: dict[str, tuple[int, int]], max_edge: int):
    """Try a few sheet widths and keep the one with the smallest area."""
    widest = max(w for w, _ in sizes.values())
    best = None
    for width in range(widest, max_edge + 1, 64):
        pos, height = shelf_pack(sizes, width)
        used_w = max(pos[k][0] + sizes[k][0] for k in pos)
        if height > max_edge:
            continue
        area = used_w * height
        if best is None or area < best[0]:
            best = (area, pos, used_w, height)
    return best


def pack(page: str, kind: str, layout: dict) -> dict:
    cfg = SETS[kind]
    want: dict[str, float] = {}
    for layer in layout[kind]['layers']:
        scale = max(layer['from'].get('s', 1), layer['to'].get('s', 1))
        want[layer['prop']] = max(want.get(layer['prop'], 0), layer['w'] * scale * cfg['density'])

    images = {}
    for prop, target_w in want.items():
        src = SOURCES / page / f'{prop}.png'
        if not src.exists():
            sys.exit(f'missing source {src.relative_to(ROOT)}')
        im = Image.open(src).convert('RGBA')
        im = im.crop(im.getbbox())
        w = min(round(target_w), im.width)  # never upscale
        images[prop] = im.resize((w, round(im.height * w / im.width)), Image.Resampling.LANCZOS)

    shrink = 1.0
    while True:
        cur = {k: v if shrink == 1 else v.resize((max(1, round(v.width * shrink)), max(1, round(v.height * shrink))), Image.Resampling.LANCZOS)
               for k, v in images.items()}
        sizes = {k: v.size for k, v in cur.items()}
        found = best_sheet(sizes, cfg['max_edge'])
        if not found:
            shrink *= 0.9
            continue
        _, pos, W, H = found
        sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        for k, im in cur.items():
            sheet.paste(im, pos[k])
        for quality in (86, 80, 74, 68, 62):
            buf = io.BytesIO()
            sheet.save(buf, 'WEBP', quality=quality, alpha_quality=90, method=6)
            if buf.tell() <= cfg['budget']:
                break
        if buf.tell() <= cfg['budget']:
            break
        shrink *= 0.9

    OUT.mkdir(parents=True, exist_ok=True)
    name = f'{page}-{kind}.webp'
    data = buf.getvalue()
    (OUT / name).write_bytes(data)
    return {
        'file': name,
        'size': [W, H],
        'bytes': len(data),
        'quality': quality,
        'hash': hashlib.sha256(data).hexdigest()[:12],
        'frames': {k: [pos[k][0], pos[k][1], sizes[k][0], sizes[k][1]] for k in sorted(pos)},
    }


def run(page: str) -> None:
    layout = json.loads((LAYOUTS / f'{page}.json').read_text())
    atlas = {kind: pack(page, kind, layout) for kind in SETS}
    (LAYOUTS / f'{page}.atlas.json').write_text(json.dumps(atlas, indent=2) + '\n')
    for kind, a in atlas.items():
        print(f'{page}-{kind}.webp  {a["size"][0]}x{a["size"][1]}  {a["bytes"] / 1000:.0f} kB  q{a["quality"]}  '
              f'(budget {SETS[kind]["budget"] / 1000:.0f} kB)')


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('pages', nargs='*')
    ap.add_argument('--all', action='store_true')
    args = ap.parse_args()
    pages = sorted(p.stem for p in LAYOUTS.glob('*.json') if not p.name.endswith('.atlas.json')) if args.all else args.pages
    if not pages:
        ap.error('name a page or pass --all')
    for page in pages:
        run(page)


if __name__ == '__main__':
    main()
