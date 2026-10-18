"""Write the published opening atlases from the canonical 2D props.

    python3 tools/scene-art/compose_atlas.py --all
    python3 tools/scene-art/compose_atlas.py description results

Every atlas keeps its size and its frames (src/data/scenes/<page>.atlas.json):
each frame is refilled with the prop's canonical image, GPT's drawing if there
is one (assets/scenes-2d/gpt/), otherwise the procedural hand-cut version
(assets/scenes-2d/auto/), scaled to the frame with premultiplied alpha. WebP
quality steps down until the sheet fits its byte budget. bytes, quality, hash
and style are updated in the .atlas.json, so scenes.ts serves the new file under
a new ?v= hash. Layouts are never touched. Needs NumPy and Pillow.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scene2d as S  # noqa: E402

BUDGET = {'desktop': 290_000, 'mobile': 165_000}   # same budgets as tools/pack_scene_atlas.py
QUALITIES = (86, 82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38, 34, 30, 26, 22)


def preview(sheet: Image.Image) -> str:
    scale = min(1.0, 240 / max(sheet.size))
    small = S.resize_rgba(sheet, (max(1, round(sheet.width * scale)), max(1, round(sheet.height * scale))))
    buf = io.BytesIO()
    small.save(buf, 'WEBP', quality=35, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


def encode(sheet: Image.Image, budget: int) -> tuple[bytes, int]:
    data, q = b'', QUALITIES[-1]
    for q in QUALITIES:
        buf = io.BytesIO()
        sheet.save(buf, 'WEBP', quality=q, alpha_quality=90, method=6)
        data = buf.getvalue()
        if len(data) <= budget:
            break
    if len(data) > budget:
        raise ValueError(f'Atlas cannot fit its {budget} byte budget: {len(data)} bytes')
    return data, q


def compose(page: str, quiet: bool = False) -> Counter:
    path = S.LAYOUTS / f'{page}.atlas.json'
    atlas = json.loads(path.read_text())
    total = Counter()
    for kind in S.KINDS:
        a = atlas[kind]
        sheet = Image.new('RGBA', tuple(a['size']), (0, 0, 0, 0))
        used = Counter()
        for prop, (x, y, w, h) in a['frames'].items():
            im, src = S.canonical(prop)
            used[src] += 1
            sheet.paste(S.resize_rgba(im, (w, h)), (x, y))
        data, q = encode(sheet, BUDGET[kind])
        (S.OUT / a['file']).write_bytes(data)
        a.update(bytes=len(data), quality=q, hash=hashlib.sha256(data).hexdigest()[:12],
                 preview=preview(sheet),
                 style='handcut-v10 ' + ', '.join(f'{k} {v}' for k, v in sorted(used.items())))
        total.update(used)
        if not quiet:
            print(f'{a["file"]:32s} {a["size"][0]}x{a["size"][1]}  {len(data) / 1000:5.0f} kB q{q}  '
                  + ' '.join(f'{k}:{v}' for k, v in sorted(used.items())))
    path.write_text(json.dumps(atlas, indent=2) + '\n')
    return total


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('pages', nargs='*')
    ap.add_argument('--all', action='store_true')
    args = ap.parse_args()
    pages = S.pages() if args.all else args.pages
    if not pages:
        ap.error('name pages or pass --all')
    for p in pages:
        compose(p)


if __name__ == '__main__':
    main()
