"""Bring GPT's drawings for the new sub-page openings back into the site.

    python3 tools/scene-art/subpage_gpt_ingest.py                 # gpt/subpage-openings/out/ -> props -> atlases
    python3 tools/scene-art/subpage_gpt_ingest.py --in ~/Downloads --dry-run

Separate from gpt_ingest.py / gpt/manifest.json (the 16 original sheets): this
reads gpt/subpage-openings/manifest.json only. For each image in the inbox:
  1. keeps its transparency, or removes a flat background touching the border;
  2. finds its sheet: a file name containing a sheet's match word (OV1,
     hp-overview, overview) is taken at its word, otherwise the silhouette
     mask in gpt/subpage-openings/ref/ decides; newest file per sheet wins;
  3. scales it onto the 1536x1024 sheet, cuts every cell by its box (plus half
     the gap), trims it, and fits it into the prop's canonical size with the
     same aspect as the placeholder (map quarters fill their frame, single
     props are centred), so no layout coordinate has to change;
  4. writes assets/scenes-2d/gpt/<prop>.png and re-packs the page's atlases
     (subpage_openings.py pack), which also rebuilds the mobile composites.
gpt/subpage-openings/out/_report.png shows placeholder | GPT for every prop.
A cell that comes back empty keeps its placeholder. Needs NumPy and Pillow.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

sys.path.insert(0, str(Path(__file__).resolve().parent))
import subpage_openings as SO  # noqa: E402

KIT = SO.KIT
EXTS = {'.png', '.webp', '.jpg', '.jpeg'}


def read_rgba(path: Path) -> np.ndarray:
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGBA')
    arr = np.asarray(im, np.float32) / 255
    if (arr[..., 3] < .1).mean() < .02:  # opaque: flood the border colour away
        rgb = arr[..., :3]
        b = max(2, int(min(rgb.shape[:2]) * .01))
        border = np.concatenate([rgb[:b].reshape(-1, 3), rgb[-b:].reshape(-1, 3), rgb[:, :b].reshape(-1, 3), rgb[:, -b:].reshape(-1, 3)])
        bg = np.median(border, 0)
        dist = np.abs(rgb - bg).max(-1)
        bgmask = flood(dist < .07)
        alpha = np.where(bgmask, 0.0, 1.0)
        edge = (dist >= .07) & (dist < .14)
        alpha = np.where(edge & ~bgmask, (dist - .07) / .07, alpha)
        arr = np.dstack([rgb, alpha])
    arr[..., 3] = np.where(arr[..., 3] >= .95, 1.0, arr[..., 3])
    lum = arr[..., :3] @ np.array([.299, .587, .114], np.float32)
    arr[..., 3] = np.where((arr[..., 3] < .6) & (lum < .25), 0, arr[..., 3])  # soft dark drop shadows
    return arr


def flood(cand: np.ndarray) -> np.ndarray:
    """Background = candidate pixels connected to the border (pure NumPy, iterative dilation)."""
    seen = np.zeros_like(cand)
    seen[0, :], seen[-1, :], seen[:, 0], seen[:, -1] = cand[0, :], cand[-1, :], cand[:, 0], cand[:, -1]
    while True:
        grow = seen.copy()
        grow[1:] |= seen[:-1]; grow[:-1] |= seen[1:]; grow[:, 1:] |= seen[:, :-1]; grow[:, :-1] |= seen[:, 1:]
        grow &= cand
        if (grow == seen).all():
            return seen
        seen = grow


def onto_sheet(arr: np.ndarray, size) -> np.ndarray:
    """Fit an image of any size onto the sheet canvas (letterboxed, centred)."""
    H, W = arr.shape[:2]
    k = min(size[0] / W, size[1] / H)
    im = SO.resize(SO_to_image(arr), (W * k, H * k))
    out = Image.new('RGBA', tuple(size), (0, 0, 0, 0))
    out.paste(im, ((size[0] - im.width) // 2, (size[1] - im.height) // 2))
    return np.asarray(out, np.float32) / 255


def SO_to_image(arr: np.ndarray) -> Image.Image:
    a = np.clip(arr * 255 + .5, 0, 255).astype(np.uint8)
    a[a[..., 3] == 0, :3] = 0
    return Image.fromarray(a, 'RGBA')


def which_sheet(path: Path, arr: np.ndarray, sheets: list[dict]) -> tuple[dict | None, str]:
    low = path.stem.lower()
    for s in sheets:
        if any(w in low for w in s.get('match', [])):
            return s, 'by name'
    best, score = None, 0.0
    alpha = arr[..., 3] > .5
    for s in sheets:
        ref = KIT / 'ref' / f'{s["id"]}-mask.png'
        if not ref.exists():
            continue
        m = np.asarray(Image.open(ref).convert('L').resize((alpha.shape[1], alpha.shape[0]))) > 127
        iou = (m & alpha).sum() / max(1, (m | alpha).sum())
        if iou > score:
            best, score = s, iou
    return (best, f'by silhouette {score:.2f}') if score >= .35 else (None, f'unrecognised (best {score:.2f})')


def cut(arr: np.ndarray, cell: dict, cells: list[dict]) -> Image.Image | None:
    x0, y0, x1, y1 = cell['box']
    # Permit small drawing drift, but split a shared gutter at its midpoint.
    # A fixed 20px pad can capture the neighbouring map when the gap is 24px.
    H, W = arr.shape[:2]
    left, top, right, bottom = max(0, x0 - 20), max(0, y0 - 20), min(W, x1 + 20), min(H, y1 + 20)
    for other in cells:
        if other is cell:
            continue
        a, b, c, d = other['box']
        if max(y0, b) < min(y1, d):
            if c <= x0: left = max(left, (c + x0) // 2)
            if a >= x1: right = min(right, (x1 + a) // 2)
        if max(x0, a) < min(x1, c):
            if d <= y0: top = max(top, (d + y0) // 2)
            if b >= y1: bottom = min(bottom, (y1 + b) // 2)
    if cell.get('crop_exact'):
        left, top, right, bottom = x0, y0, x1, y1
    crop = arr[top:bottom, left:right].copy()
    im = SO_to_image(crop)
    bb = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    if not bb or (bb[2] - bb[0]) * (bb[3] - bb[1]) < .12 * (x1 - x0) * (y1 - y0):
        return None
    im = im.crop(bb)
    tw, th = cell['size']
    if cell['anchor'] == 'fill':   # map quarters: exactly the frame of the placeholder
        return SO.resize(im, (tw, th))
    k = min(tw / im.width, th / im.height)
    im = SO.resize(im, (im.width * k, im.height * k))
    out = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    out.paste(im, ((tw - im.width) // 2, (th - im.height) // 2))
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--in', dest='inbox', default=str(KIT / 'out'))
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    manifest = json.loads((KIT / 'manifest.json').read_text(encoding='utf-8'))
    sheets, size = manifest['sheets'], manifest['size']
    inbox = Path(a.inbox).expanduser()
    inbox.mkdir(parents=True, exist_ok=True)
    files = sorted((p for p in inbox.iterdir() if p.suffix.lower() in EXTS and not p.name.startswith('_')), key=lambda p: p.stat().st_mtime)
    chosen: dict[str, tuple[Path, np.ndarray]] = {}
    for f in files:
        arr = onto_sheet(read_rgba(f), size)
        s, how = which_sheet(f, arr, sheets)
        print(f'{f.name}: {s["id"] if s else "-"} ({how})')
        if s:
            chosen[s['id']] = (f, arr)  # newest wins
    if not chosen:
        sys.exit(f'no usable image in {inbox}')
    rows, pages = [], set()
    for s in sheets:
        if s['id'] not in chosen:
            continue
        f, arr = chosen[s['id']]
        cells = s['cells']
        # Generated sheets can drift within their free gutters. A reviewed
        # per-image crop map preserves complete props without changing the kit.
        mapping = f.with_suffix('.cells.json')
        if mapping.exists():
            boxes = json.loads(mapping.read_text(encoding='utf-8'))
            known = {c['key'] for c in cells}
            if set(boxes) != known:
                raise ValueError(f'{mapping}: crop keys must match sheet {s["id"]}')
            cells = [dict(c, box=boxes[c['key']], crop_exact=True) for c in cells]
            for c in cells:
                x0, y0, x1, y1 = c['box']
                if not (0 <= x0 < x1 <= size[0] and 0 <= y0 < y1 <= size[1]):
                    raise ValueError(f'{mapping}: invalid crop for {c["key"]}')
            print(f'  reviewed crop map: {mapping.name}')
        for c in cells:
            im = cut(arr, c, cells)
            old = SO.STORE / 'auto' / f'{c["key"]}.png'
            rows.append((c['key'], Image.open(old).convert('RGBA') if old.exists() else None, im))
            if im is None:
                print(f'  {c["key"]}: empty, keeps placeholder')
                continue
            if not a.dry_run:
                (SO.STORE / 'gpt').mkdir(parents=True, exist_ok=True)
                im.save(SO.STORE / 'gpt' / f'{c["key"]}.png', optimize=True)
            print(f'  {c["key"]}: {im.size[0]}x{im.size[1]}' + (' (dry run)' if a.dry_run else ' -> assets/scenes-2d/gpt/'))
        pages.add(s['page'])
    report(rows, inbox / '_report.png')
    if not a.dry_run:
        for p in sorted(pages):
            SO.write_layout(p)
            SO.run_pack(p)


def report(rows, path: Path) -> None:
    cw, ch = 300, 190
    sheet = Image.new('RGB', (cw * 2 + 220, ch * len(rows) + 10), (38, 30, 52))
    d = ImageDraw.Draw(sheet)
    for i, (name, old, new) in enumerate(rows):
        d.text((10, i * ch + 10), name, fill=(240, 228, 200))
        for j, im in enumerate((old, new)):
            if im is None:
                d.text((220 + j * cw + 10, i * ch + 80), 'placeholder kept' if j else '-', fill=(200, 120, 120))
                continue
            k = min((cw - 20) / im.width, (ch - 20) / im.height)
            t = SO.resize(im, (im.width * k, im.height * k))
            sheet.paste(t, (220 + j * cw + 10, i * ch + 10), t)
    sheet.save(path)
    print(f'report -> {path}')


if __name__ == '__main__':
    main()
