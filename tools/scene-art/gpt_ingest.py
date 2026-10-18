"""Bring GPT's hand-drawn sheets back into the site.

    python3 tools/scene-art/gpt_ingest.py                  # reads gpt/out/, writes props and atlases
    python3 tools/scene-art/gpt_ingest.py --in ~/Downloads --dry-run

Put every image ChatGPT drew into gpt/out/, under any name, re-draws included.
For each image this:
  1. reads its transparency, or removes a flat background, and drops soft shadows;
  2. recognises which layout sheet it is by its silhouettes (gpt/ref/); a file
     named 05.png or sheet-05.png is taken at its word. Of several images of one
     sheet the newest file wins (so a re-draw replaces the first try);
  3. lays it over the sheet and gives every drawn piece to the object it covers,
     fits each object into the box the old prop filled (same anchor: base or
     centre), and splits the assembled groups (plasmid halves, puzzle pieces)
     along the old seams, so they still close exactly;
  4. writes assets/scenes-2d/gpt/<prop>.png at the prop's canonical size, then
     the mirror twins (soil-right, i-edu-wing-r) and the full plasmid ring.
Then compose_atlas.py rebuilds every atlas, and gpt/out/_report.png shows each
GPT image beside its sheet and every prop old | new. A prop whose drawing is
missing or unusable keeps the procedural hand-cut version. Needs NumPy, Pillow, SciPy.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

try:
    from scipy import ndimage as ndi
except ImportError:  # pragma: no cover
    sys.exit('gpt_ingest.py needs SciPy:  python3 -m pip install scipy')

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scene2d as S  # noqa: E402

GPT = S.ROOT / 'gpt'
EXTS = {'.png', '.webp', '.jpg', '.jpeg'}
MIN_SCORE, MIN_MARGIN = .45, .06


# ------------------------------------------------------------------ reading
def read_rgba(path: Path) -> tuple[np.ndarray, str]:
    im = ImageOps.exif_transpose(Image.open(path))
    arr = np.asarray(im.convert('RGBA'), np.float32) / 255
    if (arr[..., 3] < .1).mean() > .02:
        how = 'alpha'
    else:
        arr, how = remove_background(arr[..., :3]), 'background removed'
    # GPT likes soft drop shadows: semi-transparent and dark -> gone
    lum = arr[..., :3] @ np.array([.299, .587, .114], np.float32)
    shadow = (arr[..., 3] < .6) & (lum < .25)
    arr[..., 3] = np.where(shadow, 0, arr[..., 3])
    return arr, how


def remove_background(rgb: np.ndarray) -> np.ndarray:
    """A flat background touching the border goes, and enclosed holes of the same
    colour (inside a ring, under a handle); pale parts of objects stay."""
    H, W = rgb.shape[:2]
    b = max(2, int(min(H, W) * .01))
    border = np.concatenate([rgb[:b].reshape(-1, 3), rgb[-b:].reshape(-1, 3),
                             rgb[:, :b].reshape(-1, 3), rgb[:, -b:].reshape(-1, 3)])
    bg = np.median(border, 0)
    tol = float(np.clip(np.percentile(np.abs(border - bg).max(1), 95) * 1.8 + .03, .06, .2))
    d = np.abs(rgb - bg).max(-1)
    cand = d < tol
    lab, _ = ndi.label(cand)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bgm = np.isin(lab, edge[edge > 0])
    hl, hn = ndi.label(cand & ~bgm)
    if hn:
        idx = np.arange(1, hn + 1)
        areas = ndi.sum(np.ones_like(hl), hl, idx)
        mean_d = ndi.mean(d, hl, idx)
        bgm |= np.isin(hl, idx[(areas > .00012 * H * W) & (mean_d < tol * .55)])
    alpha = np.where(bgm, 0.0, 1.0).astype(np.float32)
    rim = ndi.binary_dilation(bgm, iterations=2) & ~bgm
    alpha[rim] = np.clip((d[rim] - tol * .5) / (tol * 1.2), 0, 1)
    a = np.maximum(alpha[..., None], 1e-3)
    clean = np.where(alpha[..., None] > .02, np.clip((rgb - (1 - a) * bg) / a, 0, 1), 0)
    return np.dstack([clean, alpha]).astype(np.float32)


def to_sheet(arr: np.ndarray, size: tuple[int, int]) -> tuple[np.ndarray, str]:
    """Scale to the sheet canvas; a different aspect ratio is letterboxed."""
    W, H = size
    h, w = arr.shape[:2]
    note = ''
    im = S.to_image(arr)
    if abs((w / h) / (W / H) - 1) <= .04:
        im = S.resize_rgba(im, (W, H))
    else:
        s = min(W / w, H / h)
        sm = S.resize_rgba(im, (max(1, round(w * s)), max(1, round(h * s))))
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        im.paste(sm, ((W - sm.width) // 2, (H - sm.height) // 2))
        note = f'aspect {w}x{h} letterboxed'
    return S.from_image(im), note


def small(mask: np.ndarray) -> np.ndarray:
    im = Image.fromarray((np.clip(mask, 0, 1) * 255).astype(np.uint8), 'L').resize((192, 128), Image.Resampling.BOX)
    return ndi.gaussian_filter(np.asarray(im, np.float32) / 255, 1.0)


def dice(a: np.ndarray, b: np.ndarray) -> float:
    return float(2 * np.minimum(a, b).sum() / max(a.sum() + b.sum(), 1e-6))


# ------------------------------------------------------------------ geometry
def box_dist(px: np.ndarray, py: np.ndarray, box) -> np.ndarray:
    x0, y0, x1, y1 = box
    dx = np.maximum(np.maximum(x0 - px, 0), px - x1)
    dy = np.maximum(np.maximum(y0 - py, 0), py - y1)
    return np.hypot(dx, dy)


def assign(alpha: np.ndarray, cells: list[dict], label_box) -> np.ndarray:
    """Cell index for every drawn pixel (-1: background or stray mark)."""
    H, W = alpha.shape
    core, n = ndi.label(alpha > .25)
    owner = np.full((H, W), -1, np.int32)
    if n == 0:
        return owner
    idx = np.arange(1, n + 1)
    areas = ndi.sum(np.ones_like(core), core, idx)
    cents = ndi.center_of_mass(alpha > .25, core, idx)
    boxes = [c['box'] for c in cells]
    comp_cell = np.full(n + 1, -1, np.int32)
    split = []
    for i, (cy, cx) in zip(idx, cents):
        if areas[i - 1] < 30:
            continue
        lx0, ly0, lx1, ly1 = label_box
        if lx0 <= cx <= lx1 and ly0 <= cy <= ly1 and areas[i - 1] < 4000:
            continue                                              # the sheet number, redrawn
        d = np.array([box_dist(np.array(cx), np.array(cy), b) for b in boxes])
        j = int(d.argmin())
        if d[j] > 140:
            continue                                              # stray mark far from everything
        comp_cell[i] = j
        ys, xs = np.nonzero(core == i)
        inside = np.array([((xs >= b[0]) & (xs <= b[2]) & (ys >= b[1]) & (ys <= b[3])).mean() for b in boxes])
        order = np.argsort(-inside)
        if len(boxes) > 1 and inside[order[1]] > .15:
            split.append(i)                                       # one blob over two objects
    owner = comp_cell[core]
    owner[core == 0] = -1
    if split:
        yy, xx = np.mgrid[0:H, 0:W]
        dist = np.stack([box_dist(xx, yy, b) for b in boxes])
        nearest = dist.argmin(0)
        m = np.isin(core, split)
        owner[m] = nearest[m]
    # antialiased rims and faint strokes join the piece they touch
    faint = (alpha > .01) & (owner < 0) & (core == 0)
    if faint.any() and (owner >= 0).any():
        dmap, (iy, ix) = ndi.distance_transform_edt(owner < 0, return_indices=True)
        near = faint & (dmap <= 6)
        owner[near] = owner[iy[near], ix[near]]
    return owner


def anchor(box, how: str) -> tuple[float, float]:
    x0, y0, x1, y1 = box
    return ((x0 + x1) / 2, y1) if how == 'bottom' else ((x0 + x1) / 2, (y0 + y1) / 2)


def affine(im: Image.Image, size: tuple[int, int], sx: float, tx: float, ty: float, resample=Image.Resampling.BICUBIC):
    """out(x, y) = im(sx * x + tx, sx * y + ty), premultiplied."""
    return im.convert('RGBa').transform(size, Image.Transform.AFFINE, (sx, 0, tx, 0, sx, ty), resample=resample).convert('RGBA')


class Ingest:
    def __init__(self, store: Path):
        self.man = json.loads((GPT / 'manifest.json').read_text(encoding='utf-8'))
        self.W, self.H = self.man['size']
        self.store = store
        self.refs = {sh['id']: np.asarray(Image.open(GPT / 'ref' / f'{sh["id"]}-mask.png'), np.float32) / 255
                     for sh in self.man['sheets']}
        self.small = {k: small(v) for k, v in self.refs.items()}
        self.log: list[str] = []
        self.written: dict[str, Image.Image] = {}

    # ---- recognise
    def recognise(self, files: list[Path]) -> dict[str, tuple[Path, np.ndarray, float, str]]:
        picked: dict[str, tuple[Path, np.ndarray, float, str]] = {}
        ids = set(self.refs)
        for f in sorted(files, key=lambda p: p.stat().st_mtime):
            try:
                arr, how = read_rgba(f)
            except Exception as e:  # noqa: BLE001
                self.log.append(f'skip {f.name}: unreadable ({e})')
                continue
            arr, note = to_sheet(arr, (self.W, self.H))
            m = re.fullmatch(r'(?:sheet[-_ ]?)?(\d{2})', f.stem, re.I)
            sm = small(arr[..., 3])
            scores = sorted(((dice(sm, self.small[k]), k) for k in ids), reverse=True)
            if m and m.group(1) in ids:
                sid, score = m.group(1), dict((k, s) for s, k in scores)[m.group(1)]
                why = 'by name'
            else:
                (score, sid), (second, _) = scores[0], scores[1]
                if score < MIN_SCORE or score - second < MIN_MARGIN:
                    self.log.append(f'?? {f.name}: not recognised (best {sid} {score:.2f}, next {second:.2f}); '
                                    f'rename it to the sheet number, e.g. {sid}.png')
                    continue
                why = f'match {score:.2f}'
            if sid in picked:
                self.log.append(f'   {picked[sid][0].name} -> replaced by newer {f.name} for sheet {sid}')
            picked[sid] = (f, arr, score, f'{why}, {how}' + (f', {note}' if note else ''))
        return picked

    # ---- cut out
    def take(self, sid: str, arr: np.ndarray) -> list[str]:
        sh = next(s for s in self.man['sheets'] if s['id'] == sid)
        alpha = arr[..., 3]
        owner = assign(alpha, sh['cells'], self.man['label_box'])
        done = []
        for j, cell in enumerate(sh['cells']):
            mine = (owner == j) & (alpha > .01)
            solid = mine & (alpha > .5)
            ref_area = self._ref_area(cell)
            if solid.sum() < .15 * ref_area:
                self.log.append(f'   {sid} {cell["key"]}: nothing drawn there, keeping the procedural version')
                continue
            ys, xs = np.nonzero(solid)
            bo = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
            br = cell['box']
            s = min((br[2] - br[0]) / (bo[2] - bo[0]), (br[3] - br[1]) / (bo[3] - bo[1]))
            if not .55 <= s <= 1.8:
                self.log.append(f'   {sid} {cell["key"]}: drawn at {1 / s:.2f}x the old size, fitted anyway')
            ao, ar = anchor(bo, cell['anchor']), anchor(br, cell['anchor'])
            layer = arr.copy()
            layer[..., 3] = np.where(mine, alpha, 0)
            limg = S.to_image(layer)
            members = cell['members']
            if len(members) == 1:
                parts = {members[0]['prop']: limg}
            else:
                parts = self._split(layer, members, s, ao, ar)
            for mem in members:
                p, k, ox, oy = mem['prop'], mem['k'], mem['ox'], mem['oy']
                size = S.canonical_size(p)
                # canonical px -> sheet px (k, ox, oy) -> GPT image px (fit s, anchors)
                sx = k / s
                tx, ty = ao[0] + (ox - ar[0]) / s, ao[1] + (oy - ar[1]) / s
                out = affine(parts[p], size, sx, tx, ty)
                self.written[p] = out
                done.append(p)
        return done

    def _ref_area(self, cell: dict) -> float:
        tot = 0.0
        for m in cell['members']:
            a = S.source_tile(m['prop'])[..., 3] > .5
            tot += a.sum() * m['k'] ** 2
        return tot

    def _split(self, layer: np.ndarray, members: list[dict], s: float, ao, ar) -> dict[str, Image.Image]:
        """Each pixel goes to the member whose old silhouette covers it (later ones on
        top); pixels outside every silhouette go to the nearest one."""
        H, W = layer.shape[:2]
        lab = np.full((H, W), -1, np.int32)
        for i, mem in enumerate(members):
            m = (S.source_tile(mem['prop'])[..., 3] > .5).astype(np.uint8) * 255
            k, ox, oy = mem['k'], mem['ox'], mem['oy']
            # GPT px -> canonical px: inverse of the mapping used in take()
            sx = s / k
            tx = (ar[0] - s * ao[0] - ox) / k
            ty = (ar[1] - s * ao[1] - oy) / k
            mm = Image.fromarray(m, 'L').transform((W, H), Image.Transform.AFFINE, (sx, 0, tx, 0, sx, ty),
                                                   resample=Image.Resampling.BILINEAR)
            lab[np.asarray(mm) > 127] = i
        drawn = layer[..., 3] > .01
        if (lab >= 0).any():
            _, (iy, ix) = ndi.distance_transform_edt(lab < 0, return_indices=True)
            lab = np.where(lab < 0, lab[iy, ix], lab)
        out = {}
        for i, mem in enumerate(members):
            part = layer.copy()
            part[..., 3] = np.where(drawn & (lab == i), layer[..., 3], 0)
            out[mem['prop']] = S.to_image(part)
        return out

    # ---- twins and the full ring
    def derive(self) -> list[str]:
        made = []
        for prop, rule in self.man['derived'].items():
            if 'mirror' in rule and rule['mirror'] in self.written:
                im = ImageOps.mirror(self.written[rule['mirror']])
                self.written[prop] = S.resize_rgba(im, S.canonical_size(prop))
                made.append(prop)
            elif 'union' in rule:
                g = self.man['groups'][rule['union']]
                if all(m in self.written for m in g['members']):
                    self.written[prop] = self._ring(g, prop)
                    made.append(prop)
        return made

    def _ring(self, g: dict, prop: str) -> Image.Image:
        lay = {l['prop']: l for l in S.layout_json(g['page'])[g['kind']]['layers']}
        ppu = 2.0                                                  # px per design unit while assembling
        xs = [lay[m]['from']['x'] for m in g['members']]
        ys = [lay[m]['from']['y'] for m in g['members']]
        span = max(lay[m]['w'] for m in g['members']) * 2.5
        cw = ch = int(span * ppu)
        canvas = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        cx0, cy0 = np.mean(xs), np.mean(ys)
        for m in g['members']:
            l, im = lay[m], self.written[m]
            w = l['w'] * ppu
            h = w * im.height / im.width
            t = S.resize_rgba(im, (max(1, round(w)), max(1, round(h))))
            canvas.alpha_composite(t, (round(cw / 2 + (l['from']['x'] - cx0) * ppu - w / 2),
                                       round(ch / 2 + (l['from']['y'] - cy0) * ppu - h / 2)))
        bb = canvas.getbbox()
        ring = canvas.crop(bb)
        size = S.canonical_size(prop)
        tb = S.object_bbox(S.source_tile(prop)[..., 3])
        bw, bh = tb[2] - tb[0], tb[3] - tb[1]
        s = min(bw / ring.width, bh / ring.height)
        rs = S.resize_rgba(ring, (max(1, round(ring.width * s)), max(1, round(ring.height * s))))
        out = Image.new('RGBA', size, (0, 0, 0, 0))
        out.alpha_composite(rs, (round(tb[0] + (bw - rs.width) / 2), round(tb[1] + (bh - rs.height) / 2)))
        return out

    def save(self) -> None:
        self.store.mkdir(parents=True, exist_ok=True)
        for p, im in sorted(self.written.items()):
            im.save(self.store / f'{p}.png', optimize=True)


# ------------------------------------------------------------------ report
def label_font(px: int = 15):
    """A font that can show Chinese file names (ChatGPT names its downloads in the UI language)."""
    from PIL import ImageFont
    for f in ('/System/Library/Fonts/PingFang.ttc', '/System/Library/Fonts/STHeiti Medium.ttc', 'C:/Windows/Fonts/msyh.ttc',
              'C:/Windows/Fonts/simhei.ttf', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
              '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if Path(f).exists():
            try:
                return ImageFont.truetype(f, px)
            except OSError:
                continue
    return ImageFont.load_default()


def checker(size: tuple[int, int], dark=False) -> Image.Image:
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w]
    c = ((xx // 12 + yy // 12) % 2).astype(np.float32)
    base = (np.array([27, 15, 34]) if dark else np.array([214, 210, 204]))
    alt = base + (10 if dark else 18)
    arr = base[None, None] * (1 - c[..., None]) + alt[None, None] * c[..., None]
    return Image.fromarray(arr.astype(np.uint8), 'RGB').convert('RGBA')


def report(ing: Ingest, picked: dict, path: Path) -> None:
    tw, th = 480, 320
    rows = []
    for sh in ing.man['sheets']:
        sid = sh['id']
        ref = Image.open(next((GPT / '给GPT').rglob(sh['file']), GPT / 'ref' / f'{sid}-mask.png')).convert('RGBA')
        tile = Image.new('RGBA', (tw * 2 + 30, th + 28), (40, 26, 48, 255))
        d = ImageDraw.Draw(tile)
        if sid in picked:
            f, arr, score, why = picked[sid]
            g = checker((tw, th))
            g.alpha_composite(S.resize_rgba(S.to_image(arr), (tw, th)))
            tile.paste(g, (10, 24))
            d.text((10, 4), f'{sid}  <-  {f.name}  ({why})'[:110], fill=(244, 227, 177), font=label_font())
        else:
            d.text((10, 4), f'{sid}  not drawn yet: these props keep the procedural version', fill=(255, 150, 120), font=label_font())
        tile.paste(ref.resize((tw, th)), (tw + 20, 24))
        rows.append(tile)
    props = sorted(ing.written)
    cols, pw, ph = 6, 300, 170
    grid = Image.new('RGBA', (cols * pw + 20, ((len(props) + cols - 1) // cols) * (ph + 22) + 20), (27, 15, 34, 255))
    d = ImageDraw.Draw(grid)
    for i, p in enumerate(props):
        x, y = 10 + (i % cols) * pw, 10 + (i // cols) * (ph + 22)
        old = S.to_image(S.source_tile(p))
        new = ing.written[p]
        for j, im in enumerate((old, new)):
            s = min((pw / 2 - 8) / im.width, ph / im.height)
            t = S.resize_rgba(im, (max(1, int(im.width * s)), max(1, int(im.height * s))))
            grid.alpha_composite(t, (x + j * pw // 2 + 2, y + 16 + (ph - t.height) // 2))
        d.text((x, y), p, fill=(205, 191, 214), font=label_font(13))
    width = max(rows[0].width * 2 + 10 if rows else 0, grid.width)
    height = ((len(rows) + 1) // 2) * (rows[0].height + 8) + grid.height + 20 if rows else grid.height
    out = Image.new('RGBA', (width, height), (27, 15, 34, 255))
    for i, r in enumerate(rows):
        out.paste(r, ((i % 2) * (r.width + 10), (i // 2) * (r.height + 8)))
    out.paste(grid, (0, height - grid.height))
    out.convert('RGB').save(path, quality=88)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--in', dest='src', type=Path, default=GPT / 'out', help='folder with GPT images (default gpt/out)')
    ap.add_argument('--store', type=Path, default=S.STORE / 'gpt', help=argparse.SUPPRESS)
    ap.add_argument('--dry-run', action='store_true', help='recognise and report only; write nothing into the site')
    ap.add_argument('--no-compose', action='store_true', help='write the props but not the atlases')
    args = ap.parse_args()
    files = [p for p in args.src.iterdir() if p.suffix.lower() in EXTS and not p.name.startswith('_')] if args.src.exists() else []
    if not files:
        sys.exit(f'no images in {args.src}: download what ChatGPT drew into that folder first (see gpt/给GPT/使用说明.txt)')
    ing = Ingest(args.store)
    picked = ing.recognise(files)
    for sid in sorted(picked):
        f, arr, score, why = picked[sid]
        got = ing.take(sid, arr)
        ing.log.insert(0, f'{sid} <- {f.name} ({why}): {len(got)} props')
    derived = ing.derive()
    missing = sorted(set(s['id'] for s in ing.man['sheets']) - set(picked))
    rpt = args.src / '_report.png'
    report(ing, picked, rpt)
    print('\n'.join(ing.log))
    if derived:
        print('derived: ' + ', '.join(derived))
    if missing:
        print('sheets not drawn yet: ' + ', '.join(missing))
    print(f'{len(ing.written)} props from GPT; report {rpt}')
    if args.dry_run:
        return
    ing.save()
    if not args.no_compose:
        import compose_atlas
        for p in S.pages():
            compose_atlas.compose(p, quiet=True)
        print('atlases rebuilt (tools/scene-art/compose_atlas.py --all)')


if __name__ == '__main__':
    main()
