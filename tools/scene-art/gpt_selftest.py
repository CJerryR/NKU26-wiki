"""Self-test of the GPT round trip, without GPT: fabricate the images, ingest them.

    python3 tools/scene-art/gpt_selftest.py

Draws a fake "GPT result" for every sheet from the procedural props, each object
nudged and rescaled a little as a redraw would be, saved the awkward ways real
downloads arrive (ChatGPT file names in shuffled order, one JPEG on a white
background, one at another resolution, one sheet drawn twice, one with the sheet
number copied into the corner), runs gpt_ingest.py on them into a temporary
store (the site is not touched) and checks that every prop came back where it
belongs. Exit status 1 if any prop is lost or misplaced.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scene2d as S  # noqa: E402

GPT = S.ROOT / 'gpt'


def fake_sheet(sh: dict, size, rng, jolt=10.0) -> Image.Image:
    canvas = Image.new('RGBA', tuple(size), (0, 0, 0, 0))
    for cell in sh['cells']:
        dx, dy = rng.uniform(-jolt, jolt, 2)
        sc = rng.uniform(.94, 1.06)
        x0, y0, x1, y1 = cell['box']
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        for m in cell['members']:
            im, _ = S.canonical(m['prop'])
            k = m['k'] * sc
            t = S.resize_rgba(im, (max(1, round(im.width * k)), max(1, round(im.height * k))))
            canvas.alpha_composite(t, (round(cx + (m['ox'] - cx) * sc + dx), round(cy + (m['oy'] - cy) * sc + dy)))
    return canvas


def main() -> int:
    man = json.loads((GPT / 'manifest.json').read_text(encoding='utf-8'))
    size = man['size']
    rng = np.random.default_rng(26)
    tmp = Path(tempfile.mkdtemp(prefix='gpt-selftest-'))
    src, store = tmp / 'out', tmp / 'store'
    src.mkdir()
    order = rng.permutation(len(man['sheets']))
    t0 = time.time() - 3600
    for rank, i in enumerate(order):
        sh = man['sheets'][i]
        sid = sh['id']
        im = fake_sheet(sh, size, rng)
        name = f'ChatGPT Image 2026年10月18日 15_{rank:02d}_{int(rng.integers(0, 60)):02d}.png'
        if sid == '03':                                   # JPEG on white
            flat = Image.new('RGB', im.size, (255, 255, 255))
            flat.paste(im, mask=im.getchannel('A'))
            path = src / name.replace('.png', '.jpg')
            flat.save(path, quality=92)
        elif sid == '05':                                 # another resolution
            path = src / name
            S.resize_rgba(im, (1024, 683)).save(path)
        elif sid == '07':                                 # sheet number copied into the corner
            ImageDraw.Draw(im).text((18, 14), '07', fill=(120, 110, 100, 255))
            path = src / name
            im.save(path)
        elif sid == '16':                                 # named by hand
            path = src / '16.png'
            im.save(path)
        else:
            path = src / name
            im.save(path)
        os.utime(path, (t0 + rank * 60, t0 + rank * 60))
        if sid == '11':                                   # a bad first try, then the re-draw
            bad = fake_sheet(sh, size, rng, jolt=60)
            bpath = src / f'ChatGPT Image 2026年10月18日 14_{rank:02d}_00.png'
            bad.save(bpath)
            os.utime(bpath, (t0 - 600, t0 - 600))
    r = subprocess.run([sys.executable, str(Path(__file__).with_name('gpt_ingest.py')), '--in', str(src),
                        '--store', str(store), '--no-compose'], capture_output=True, text=True)
    print(r.stdout[-4000:], r.stderr[-2000:])
    bad = []
    for prop in sorted(S.frames_index()):
        f = store / f'{prop}.png'
        if not f.exists():
            bad.append((prop, 'missing'))
            continue
        got = np.asarray(Image.open(f).convert('RGBA'))[..., 3] > 127
        want = np.asarray(S.canonical(prop)[0])[..., 3] > 127
        iou = (got & want).sum() / max((got | want).sum(), 1)
        if iou < .72:
            bad.append((prop, f'IoU {iou:.2f}'))
    print(f'checked {len(S.frames_index())} props: ' + ('all back in place' if not bad else f'{len(bad)} problems'))
    for p, why in bad:
        print('  ', p, why)
    print('report:', src / '_report.png')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
