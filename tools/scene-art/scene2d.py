"""Shared helpers for the 2D (hand-cut paper) opening props. Development tools only.

Every prop has one canonical image: the size of the largest frame it is ever
drawn at (all pages, desktop and mobile; the same prop always keeps the same
aspect ratio, so smaller frames are plain scale-downs). Canonical images live in

    assets/scenes-2d/gpt/<prop>.png    hand-drawn art from GPT, via gpt_ingest.py (wins)
    assets/scenes-2d/auto/<prop>.png   the procedural hand-cut version, via handcut.py

and compose_atlas.py writes them into the published atlases without moving any
frame, so no layout, no motion and no shared geometry changes. The V8.7 3D
atlases in assets/scene-atlas-3d/ stay the reference for every silhouette.

Needs NumPy and Pillow (SciPy for gpt_ingest.py, OpenCV for handcut.py).
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
LAYOUTS = ROOT / 'src' / 'data' / 'scenes'
SRC3D = ROOT / 'assets' / 'scene-atlas-3d'
STORE = ROOT / 'assets' / 'scenes-2d'
OUT = ROOT / 'static' / 'img' / 'scenes'
KINDS = ('desktop', 'mobile')


def pages() -> list[str]:
    return sorted(p.stem for p in LAYOUTS.glob('*.json') if not p.name.endswith('.atlas.json'))


def atlas_json(page: str) -> dict:
    return json.loads((LAYOUTS / f'{page}.atlas.json').read_text())


def layout_json(page: str) -> dict:
    return json.loads((LAYOUTS / f'{page}.json').read_text())


@lru_cache(maxsize=None)
def frames_index() -> dict[str, list[tuple[str, str, tuple[int, int, int, int]]]]:
    """prop -> every (page, kind, frame) it appears in."""
    idx: dict[str, list] = {}
    for page in pages():
        a = atlas_json(page)
        for kind in KINDS:
            for prop, fr in a[kind]['frames'].items():
                idx.setdefault(prop, []).append((page, kind, tuple(fr)))
    return idx


def largest(prop: str) -> tuple[str, str, tuple[int, int, int, int]]:
    return max(frames_index()[prop], key=lambda t: t[2][2] * t[2][3])


def canonical_size(prop: str) -> tuple[int, int]:
    _, _, (_, _, w, h) = largest(prop)
    return w, h


@lru_cache(maxsize=None)
def _atlas3d(page: str, kind: str) -> np.ndarray:
    f = SRC3D / f'{page}-{kind}.webp'
    if not f.exists():
        raise SystemExit(f'missing 3D reference atlas {f.relative_to(ROOT)} (kept from V8.7)')
    return np.asarray(Image.open(f).convert('RGBA'), np.float32) / 255


def source_tile(prop: str) -> np.ndarray:
    """The V8.7 3D render of a prop at its canonical size, H×W×4 float 0..1."""
    page, kind, (x, y, w, h) = largest(prop)
    return _atlas3d(page, kind)[y:y + h, x:x + w].copy()


def object_bbox(alpha: np.ndarray, thr: float = .5) -> tuple[int, int, int, int] | None:
    """Box of the solid object (soft contact shadows stay outside: they are < .5)."""
    ys, xs = np.nonzero(alpha > thr)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def to_image(arr: np.ndarray) -> Image.Image:
    rgba = np.clip(arr * 255 + .5, 0, 255).astype(np.uint8)
    rgba[rgba[..., 3] == 0, :3] = 0
    return Image.fromarray(rgba, 'RGBA')


def from_image(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert('RGBA'), np.float32) / 255


def resize_rgba(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Resize with premultiplied alpha, so edges never pick up dark fringes."""
    if im.size == tuple(size):
        return im
    return im.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')


def canonical(prop: str) -> tuple[Image.Image, str]:
    """Best available canonical image for a prop and where it came from."""
    for src in ('gpt', 'auto'):
        f = STORE / src / f'{prop}.png'
        if f.exists():
            im = Image.open(f).convert('RGBA')
            want = canonical_size(prop)
            return (im if im.size == want else resize_rgba(im, want)), src
    return to_image(source_tile(prop)), '3d'
