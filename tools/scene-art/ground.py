"""Ground strip for the inner-page openings, cut from the homepage art.

    python3 tools/scene-art/ground.py

Reads   static/img/home-opening/opening-foreground.webp  (team illustration, 1586×992)
Writes  static/img/scenes/ground-strip.webp               (seamless, repeat-x)
        prints the hash for src/data/scenes.ts (GROUND)

Only the soil below the grass line is kept: tree trunks and shrub stems that
cross the line are removed, grass blades stay. The strip is laid next to its
mirror image so it repeats without a seam on any screen width. No redrawing,
no generated pixels: it is the team's own soil, roots and pebbles.
"""
from __future__ import annotations

import hashlib
import io
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'static' / 'img' / 'home-opening' / 'opening-foreground.webp'
OUT = ROOT / 'static' / 'img' / 'scenes' / 'ground-strip.webp'
TOP = 606            # source row just above the tallest grass blade we keep
HEIGHT = 300         # output height (px); width follows
BUDGET = 150_000


def main() -> None:
    im = np.asarray(Image.open(SRC).convert('RGBA'), float) / 255
    im = im[TOP:, 200:1100]   # between the trees: no trunks in the strip
    rgb, a = im[..., :3], im[..., 3]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    d = np.maximum(mx - mn, 1e-6)
    hue = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    lum = rgb @ np.array([.299, .587, .114])

    soil = (a > .9) & (lum < .3) & ((hue > 250) | (hue < 20) | (sat < .3))
    # soil top per column: first run of soil that continues for 12 rows
    H, W = a.shape
    run = np.zeros_like(soil, int)
    for y in range(H - 1, -1, -1):
        run[y] = np.where(soil[y], (run[y + 1] + 1) if y + 1 < H else 1, 0)
    top = np.argmax(run >= 12, axis=0)
    rows = np.arange(H)[:, None]
    above = rows < top[None, :] - 1
    grass = (hue > 52) & (hue < 120) & (sat > .22)
    keep = ~above | grass
    a = np.where(keep, a, 0)

    strip = np.dstack([rgb, a])
    strip = np.concatenate([strip, strip[:, ::-1]], axis=1)  # mirrored pair: seamless repeat
    out = Image.fromarray(np.clip(strip * 255 + .5, 0, 255).astype(np.uint8), 'RGBA')
    out = out.resize((round(out.width * HEIGHT / out.height), HEIGHT), Image.Resampling.LANCZOS)
    for q in (80, 74, 68, 62, 56):
        buf = io.BytesIO()
        out.save(buf, 'WEBP', quality=q, alpha_quality=80, method=6)
        if buf.tell() <= BUDGET:
            break
    data = buf.getvalue()
    OUT.write_bytes(data)
    print(f'{OUT.relative_to(ROOT)}  {out.width}x{out.height}  {len(data) / 1000:.0f} kB q{q}  hash {hashlib.sha256(data).hexdigest()[:12]}')


if __name__ == '__main__':
    main()
