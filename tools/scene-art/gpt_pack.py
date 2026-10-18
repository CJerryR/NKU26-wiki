"""Build the hand-drawn redraw package for GPT: layout sheets, style board, prompts.

    python3 tools/scene-art/gpt_pack.py

Writes  gpt/给GPT/第1批/  00-style.png, 01.png … 08.png, 提示词.txt
        gpt/给GPT/第2批/  00-style.png, 09.png … 16.png, 提示词.txt
        gpt/给GPT/使用说明.txt
        gpt/manifest.json        where every prop sits on every sheet (read by gpt_ingest.py
                                 and gpt_api.py); also the one-sheet prompts for the API
        gpt/ref/<sheet>-mask.png silhouettes, used to recognise GPT's images whatever their name

GPT redraws each sheet in the homepage's cut-paper style and keeps every object
where it is, so gpt_ingest.py can put each drawing back into the exact frame of
the prop it replaces: no layout, motion or shared geometry changes. Props that
must fit together are drawn together (the two halves of the plasmid, the four
attribution puzzle pieces) and split again on the way back; mirror twins
(soil-right, i-edu-wing-r) and the full plasmid ring are derived, not drawn.
Development tool: needs NumPy, Pillow, OpenCV and SciPy (through handcut.py).
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scene2d as S  # noqa: E402
import handcut as HC  # noqa: E402

GPT = S.ROOT / 'gpt'
SEND = GPT / '给GPT'
W, H = 1536, 1024
BG = (234, 229, 219)
MARGIN = (44, 62, 44, 44)       # left, top (sheet number lives here), right, bottom
GAP_X, GAP_Y, HMAX = 64, 60, 470

# ------------------------------------------------------------------ what GPT draws
# Each sheet is a list of items; an item is a prop, a ('pair', a, b) drawn side by side
# at one scale (two states of one thing, or close relatives), or a ('group', key)
# drawn exactly as it stands assembled in the closed scene and split back afterwards.
GROUPS = {
    'q-puzzle': {'page': 'attributions', 'kind': 'desktop', 'members': ['i-q-wet', 'i-q-dry', 'i-q-hp', 'i-q-design']},
    'plasmid-arcs': {'page': 'parts', 'kind': 'desktop', 'members': ['arc-left', 'arc-right']},
}
DERIVED = {
    'soil-right': {'mirror': 'soil-left'},
    'i-edu-wing-r': {'mirror': 'i-edu-wing-l'},
    'plasmid': {'union': 'plasmid-arcs'},
}
SHEETS = [
    ['soil-left', 'i-soil-bed', 'i-desc-roots', 'i-nematodes', 'i-field'],
    ['i-eco-fields', 'i-model-eco', 'i-ack-flowers', 'i-hp-farmers', 'i-eco-coins'],
    ['i-molecules', 'ligand', ('pair', 'i-dock-ligand-a', 'i-dock-ligand-b'), 'i-md-ligand', 'i-waters'],
    ['i-bg-receptor', 'i-dock-receptor', 'i-dock-receptors', 'i-model-dock'],
    ['i-md-slab', 'i-res-membrane', 'i-model-md', 'i-stars'],
    ['i-bench', 'i-plates', 'i-yeast', 'i-exp-instruments', ('pair', 'dish-base', 'dish-lid')],
    [('pair', 'i-ode-flask-a', 'i-ode-flask-b'), 'i-model-ode', 'i-ode-phone', 'i-contrib-cryo', 'i-desc-sensor'],
    ['i-eng-build', 'i-eng-design', 'i-eng-learn', 'i-eng-test', ('pair', 'i-res-strips-neutral', 'i-res-strips-amber')],
    ['i-safe-body', 'i-safe-ppe', 'i-safe-sash', 'i-safe-transport'],
    ['i-paperwork', 'i-contrib-docs', 'i-library', ('pair', 'book-closed', 'book-open'), 'i-lic-code'],
    [('pair', 'i-env-closed', 'i-env-open'), ('pair', 'i-bubble-a', 'i-bubble-b'), 'i-edu-board', 'i-edu-wing-l'],
    ['i-edu-class', 'i-edu-micro', 'i-awd-trophy', 'i-medal', 'i-rosettes'],
    ['i-crowd', 'i-team-dry', 'i-team-hp', 'i-team-wet'],
    ['i-team-adv', 'i-team-visual', 'i-hp-lab', 'i-ack-gifts', 'i-card'],
    [('pair', 'toolbox-body', 'toolbox-lid'), 'block-promoter', 'block-cds', 'block-rbs', 'block-terminator'],
    ['i-gears', 'i-parts-pile', ('group', 'q-puzzle'), ('group', 'plasmid-arcs'), ('pair', 'i-lock-closed', 'i-lock-open')],
]
BATCH = 8  # sheets per upload (plus the style board): stays under ChatGPT's per-message image limit

# Floating things are matched by their centre, everything else stands on its base.
CENTRE = {'i-molecules', 'ligand', 'i-dock-ligand-a', 'i-dock-ligand-b', 'i-md-ligand', 'i-waters', 'i-stars',
          'i-bubble-a', 'i-bubble-b', 'i-card', 'q-puzzle', 'plasmid-arcs', 'i-nematodes', 'i-medal', 'i-rosettes'}

DESC = {
    'soil-left': 'a big block of soil dug out of the ground, its top face and two side faces visible as in the model: layered soil strata in plum, mauve and dark aubergine paper with small pale stones and thin pale-mauve roots, a strip of olive grass along the top edge',
    'i-soil-bed': 'a low heap of round soil clods and stones in plum and mauve paper, speckled, with two thin pale-mauve roots',
    'i-desc-roots': 'two young plants, each with two olive leaves on a thin stem and long branching pale-mauve roots below, with two slim orange nematodes curling between the roots',
    'i-nematodes': 'seven slender orange nematodes (thin smooth worms, no faces) wriggling in different directions, with darker orange speckles, plus a few small orange dots',
    'i-field': 'a small field plot: a raised plum soil bed with rows of olive and ochre seedlings with round leaves, a few taller seedlings on the left, and a rust T-handled soil probe standing on the right',
    'i-eco-fields': 'two field plots side by side, each a plum soil bed full of olive and ochre seedlings with round leaves',
    'i-model-eco': 'a field plot of olive seedlings on a plum soil bed, a flat rust wooden pallet in front of it and a short stack of amber coins',
    'i-ack-flowers': 'a bunch of flowers in a cream paper pot: olive stems and leaves, cream daisy heads with amber centres',
    'i-hp-farmers': 'two farmers as faceless paper figures in olive and ochre clothes, one holding a rust hoe, next to young olive plants',
    'i-eco-coins': 'three stacks of amber coins of different heights',
    'i-molecules': 'small molecules floating apart: five lilac clusters of round atoms and two amber chain molecules (round beads joined by short sticks)',
    'ligand': 'one amber molecule: a ring of round beads with a long tail of beads, joined by short sticks',
    'i-dock-ligand-a': 'a small branched amber ball-and-stick molecule',
    'i-dock-ligand-b': 'a long, thin amber ball-and-stick chain molecule',
    'i-md-ligand': 'a small branched amber ball-and-stick molecule',
    'i-waters': 'about ten floating water molecules: each a large pale-mauve ball with two small pale-mauve balls',
    'i-bg-receptor': 'a receptor protein standing upright: seven lilac coiled ribbons (helices) in a bundle, joined by loops, with a tiny amber molecule near the top right',
    'i-dock-receptor': 'a large receptor protein: seven lilac coiled ribbons (helices) standing in a bundle, joined by loops',
    'i-dock-receptors': 'two receptor proteins, each a bundle of lilac coiled ribbons: a larger one on the left, a smaller one on the right',
    'i-model-dock': 'a lilac receptor protein of coiled ribbons with two amber chain molecules docking into it, one from the left and one from the right',
    'i-md-slab': 'a thick slab of cell membrane seen from the side: two layers of small pale-mauve beads, a lilac protein sitting in it, a few lilac water molecules above and below',
    'i-res-membrane': 'a long strip of cell membrane made of rows of small pale-mauve beads, with two small lilac proteins and a tiny amber molecule on top',
    'i-model-md': 'a slab of cell membrane of pale-mauve beads with a lilac protein in the middle and lilac water molecules at its corners',
    'i-stars': 'a few stars (one amber, two lilac) and some small scattered confetti pieces',
    'i-bench': 'lab bench tools: a rack of pipette tips, a beaker, a pipette lying diagonally and three small sample tubes, in pale lilac-grey and cream paper with rust details',
    'i-plates': 'two 96-well plates (flat trays with rows of small holes) in cream paper and a magnifying glass with a rust rim',
    'i-yeast': 'clusters of round budding yeast cells in ochre and mustard, between two small sample tubes',
    'i-exp-instruments': 'a lab shaker-incubator box with a round knob and a dark window, and a tube rack holding six tubes, in mustard and rust paper',
    'dish-base': 'an open Petri dish (shallow round glass dish seen from above at an angle) with a few round amber colonies inside, pale lilac-grey glass',
    'dish-lid': 'the matching flat round Petri-dish lid, pale lilac-grey glass',
    'i-ode-flask-a': 'a conical flask, a closed sample tube on its left and a cluster of lilac molecules on its right; glass in pale lilac-grey and cream',
    'i-ode-flask-b': 'the same scene as the object on its left, except that the sample tube\'s cap is open',
    'i-model-ode': 'a conical flask, a small cluster of lilac molecules and a smartphone showing an amber dot and a lilac dot',
    'i-ode-phone': 'a smartphone showing an amber dot and a lilac dot, next to a colour-chart strip of five swatches from lilac to amber',
    'i-contrib-cryo': 'a mustard cryo storage box with a handle and three frosted sample tubes standing beside it',
    'i-desc-sensor': 'three cream paper test strips (one with an amber result window) and a small cluster of lilac molecules above a sample tube',
    'i-eng-build': 'a plasmid ring made of four coloured segments, two sample tubes and a DNA double helix, in lilac, amber and rust',
    'i-eng-design': 'a cream blueprint sheet with a grid, a pencil and a ruler, and a written page behind it',
    'i-eng-learn': 'an open laptop whose screen shows one curve, a clipboard with a page, and a loose sheet of notes',
    'i-eng-test': 'a cream 96-well plate, a box of pipette tips and a test strip',
    'i-res-strips-neutral': 'five cream test strips fanned out like a hand of cards, each with an empty window near the bottom',
    'i-res-strips-amber': 'exactly the same five strips as the object on its left, but every window shows an amber result band',
    'i-safe-body': 'a biosafety cabinet (lab safety hood) on four legs: a box with a large glass front window and a work surface inside, mustard frame and pale lilac-grey glass',
    'i-safe-ppe': 'lab safety goggles, a small conical flask and a shield with a check mark',
    'i-safe-sash': 'a large glass window panel in a frame, with a handle bar below it',
    'i-safe-transport': 'a rust transport box with a handle, two sample tubes and a clipboard',
    'i-paperwork': 'a clipboard with a checklist, a stack of loose papers and a pen, in cream paper',
    'i-contrib-docs': 'a spiral notebook, a written page and a pen',
    'i-library': 'a stack of rust and plum books, an open book, a magnifying glass and a sheet of paper',
    'book-closed': 'a closed hardcover book with a blank label on the cover: rust cover, cream page edges',
    'book-open': 'the same book lying open, cream pages with lines',
    'i-lic-code': 'a rounded screen showing the code symbol </> (the only symbol allowed anywhere), a document and a key',
    'i-env-closed': 'a closed cream envelope',
    'i-env-open': 'the same envelope as the object on its left, with its flap open',
    'i-bubble-a': 'a rounded cream speech bubble with three dots',
    'i-bubble-b': 'a rounded cream speech bubble with three short lines',
    'i-edu-board': 'a dark plum chalkboard on a rust easel; on the board, in cream chalk: a circle, an arrow and a circle, with two lines below',
    'i-edu-wing-l': 'a single tall cabinet door: a rust rectangular panel with an inset border and a small round knob near its right edge',
    'i-edu-class': 'a classroom: two desks with open books and three faceless student figures',
    'i-edu-micro': 'a microscope next to a short stack of books',
    'i-awd-trophy': 'a winners\' podium of three blocks (the middle one taller, with a star) and an amber trophy cup on top',
    'i-medal': 'an amber medal with a star, hanging from a striped ribbon',
    'i-rosettes': 'two award rosettes with amber star centres and ribbon tails, the larger one on the left',
    'i-crowd': 'a group of six faceless paper figures, two of them waving, in mixed olive, ochre, rust and lilac',
    'i-team-dry': 'four faceless figures in two pairs, one waving, one next to a laptop',
    'i-team-hp': 'five faceless figures in three small groups, one holding up a speech-bubble sign with three dots, one waving',
    'i-team-wet': 'four small groups of two tiny faceless figures each, one figure holding a test tube',
    'i-team-adv': 'two faceless figures (advisers) standing together, and a stack of books',
    'i-team-visual': 'three faceless figures and a long pencil lying in front of them',
    'i-hp-lab': 'three faceless figures in a lab, a conical flask on the left and a microscope on the right',
    'i-ack-gifts': 'two gift boxes with ribbons and bows, the larger one on the left',
    'i-card': 'a small thank-you card with a round seal and three lines, cream paper',
    'toolbox-body': 'an open toolbox without its lid, rust paper',
    'toolbox-lid': 'the matching flat toolbox lid with a handle on top',
    'block-promoter': 'a chunky bent-arrow block (the DNA promoter symbol), olive',
    'block-cds': 'a chunky long block with a pointed arrow end (the DNA coding-sequence symbol), rust',
    'block-rbs': 'a chunky half-dome block (the DNA ribosome-binding-site symbol), amber',
    'block-terminator': 'a chunky T-shaped block (the DNA terminator symbol), lilac',
    'i-gears': 'two large gear wheels, one small gear and a short DNA double helix, in rust and mustard',
    'i-parts-pile': 'a pile of chunky DNA part blocks (bent arrows, long arrows, T shapes, half domes) in olive, rust, amber and lilac',
    'i-lock-closed': 'a closed mustard padlock',
    'i-lock-open': 'the same padlock as the object on its left, with its shackle open',
    'q-puzzle': 'four square jigsaw clusters fitted together into one block (each cluster is four tiles with round knobs and holes): top-left olive, top-right lilac, bottom-left amber, bottom-right rust; keep the four clusters as separate pieces with thin seams between them, exactly where they are',
    'plasmid-arcs': 'a plasmid: one thick ring of four segments in alternating lilac and amber, split into a left half and a right half with a thin gap between them, exactly as shown',
}


# ------------------------------------------------------------------ geometry
def solid(tile: np.ndarray) -> np.ndarray:
    """The object without its soft contact shadow (GPT must not copy shadows)."""
    out = tile.copy()
    out[..., 3] = np.clip((tile[..., 3] - .5) / .1, 0, 1)     # contact shadows are all below .5
    return out


def tinted(prop: str) -> np.ndarray:
    """The 3D render recoloured to the paper it should become, shading kept for form."""
    t = solid(S.source_tile(prop))
    rgb, a = t[..., :3], t[..., 3]
    obj = a > .5
    if obj.sum() < 10:
        return t
    fam = HC.Fam(HC.FAMILY.get(prop, 'lilac'))
    h, s, v = HC.hsv(rgb)
    amber = obj & (s > .35) & ((h < 58) | (h > 340)) & (v > .35)
    L = rgb @ np.array([.299, .587, .114], np.float32)
    lo, hi = np.percentile(L[obj], [4, 96])
    x = np.clip((L - lo) / max(hi - lo, 1e-3), 0, 1)[..., None]
    out = np.zeros_like(rgb)
    for m, f in ((~amber, fam), (amber, HC.Fam('amber'))):
        ramp = np.where(x < .5, f.shade + (f.body - f.shade) * (x / .5), f.body + (f.light - f.body) * ((x - .5) / .5))
        out = np.where(m[..., None], ramp, out)
    return np.dstack([out, a]).astype(np.float32)


class Member:
    """One prop inside an item: its canonical tile and where it sits in item units."""
    def __init__(self, prop: str, dx: float = 0, dy: float = 0, scale: float = 1):
        self.prop, self.dx, self.dy, self.scale = prop, dx, dy, scale
        self.tile = tinted(prop)
        self.box = S.object_bbox(self.tile[..., 3])      # canonical px


class Item:
    def __init__(self, spec):
        self.cells: list[tuple[str, list[Member]]] = []
        if isinstance(spec, str):
            self.cells = [(spec, [Member(spec)])]
        elif spec[0] == 'pair':
            a, b = Member(spec[1]), Member(spec[2])
            ha, hb = a.box[3] - a.box[1], b.box[3] - b.box[1]
            sa, sb = 1.0, 1.0
            # draw both at one scale (they are two states of one thing); bottoms aligned
            gap = .16 * max(ha, hb)
            b.dx = (a.box[2] - a.box[0]) + gap - b.box[0] + a.box[0]
            b.dy = (a.box[3]) - (b.box[3])
            a.scale, b.scale = sa, sb
            self.cells = [(spec[1], [a]), (spec[2], [b])]
        elif spec[0] == 'group':
            g = GROUPS[spec[1]]
            lay = {l['prop']: l for l in S.layout_json(g['page'])[g['kind']]['layers'] if l['prop'] in g['members']}
            ms = []
            for p in g['members']:
                l, (cw, ch) = lay[p], S.canonical_size(p)
                k = l['w'] / cw                                   # design units per canonical px
                ms.append(Member(p, (l['from']['x'] - l['w'] / 2), (l['from']['y'] - ch * k / 2), k))
                assert not l['from'].get('r') and l['from'].get('s', 1) == 1, f'{p}: group members must stand unrotated'
            # express offsets in px of the first member's scale
            k0 = ms[0].scale
            for m in ms:
                m.dx, m.dy, m.scale = m.dx / k0, m.dy / k0, m.scale / k0
            self.cells = [(spec[1], ms)]
        else:
            raise ValueError(spec)
        boxes = [self.member_box(m) for _, ms in self.cells for m in ms]
        self.box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))

    @staticmethod
    def member_box(m: Member) -> tuple[float, float, float, float]:
        x0, y0, x1, y1 = m.box
        return (m.dx + x0 * m.scale, m.dy + y0 * m.scale, m.dx + x1 * m.scale, m.dy + y1 * m.scale)

    @property
    def aspect(self) -> float:
        return (self.box[2] - self.box[0]) / (self.box[3] - self.box[1])


def plan(items: list[Item]) -> list[tuple[list[int], float]]:
    """Rows of a sheet: try every split of the item order into 1–3 rows, keep the one
    that draws the objects biggest without making any of them tiny."""
    n = len(items)
    aw, ah = W - MARGIN[0] - MARGIN[2], H - MARGIN[1] - MARGIN[3]
    best, best_score = None, -1e18
    splits = [[]] + [[i] for i in range(1, n)] + [[i, j] for i in range(1, n) for j in range(i + 1, n)]
    for cut in splits:
        bounds = [0, *cut, n]
        rows = [list(range(bounds[r], bounds[r + 1])) for r in range(len(bounds) - 1)]
        hs = [min(HMAX, (aw - GAP_X * (len(r) - 1)) / sum(items[i].aspect for i in r)) for r in rows]
        tot = sum(hs) + GAP_Y * (len(rows) - 1)
        f = min(1.0, (ah - GAP_Y * (len(rows) - 1)) / sum(hs)) if tot > ah else 1.0
        hs = [h * f for h in hs]
        score = 0.0
        for r, h in zip(rows, hs):
            for i in r:
                a = items[i].aspect
                score += a * h * h
                short = min(a * h, h)
                if short < 230:
                    score -= (230 - short) * 3000
        if score > best_score:
            best, best_score = list(zip(rows, hs)), score
    return best


def build_sheet(idx: int, specs: list) -> tuple[Image.Image, Image.Image, dict]:
    items = [Item(s) for s in specs]
    rows = plan(items)
    aw = W - MARGIN[0] - MARGIN[2]
    ah = H - MARGIN[1] - MARGIN[3]
    total = sum(h for _, h in rows) + GAP_Y * (len(rows) - 1)
    y = MARGIN[1] + (ah - total) / 2
    canvas = np.zeros((H, W, 4), np.float32)
    cells = []
    for r, (row, h) in enumerate(rows):
        widths = [items[i].aspect * h for i in row]
        x = MARGIN[0] + (aw - sum(widths) - GAP_X * (len(row) - 1)) / 2
        for i, wdt in zip(row, widths):
            it = items[i]
            k = h / (it.box[3] - it.box[1])                     # sheet px per item unit
            ox, oy = x - it.box[0] * k, y - it.box[1] * k
            for key, ms in it.cells:
                mems, boxes = [], []
                for m in ms:
                    kk = k * m.scale                            # sheet px per canonical px
                    mx, my = ox + m.dx * k, oy + m.dy * k
                    th, tw = m.tile.shape[:2]
                    im = S.resize_rgba(S.to_image(m.tile), (max(1, round(tw * kk)), max(1, round(th * kk))))
                    arr = S.from_image(im)
                    px, py = int(round(mx)), int(round(my))
                    y0, x0 = max(0, py), max(0, px)
                    y1, x1 = min(H, py + arr.shape[0]), min(W, px + arr.shape[1])
                    sub = arr[y0 - py:y1 - py, x0 - px:x1 - px]
                    a = sub[..., 3:4]
                    canvas[y0:y1, x0:x1, :3] = canvas[y0:y1, x0:x1, :3] * (1 - a) + sub[..., :3] * a
                    canvas[y0:y1, x0:x1, 3:4] = np.maximum(canvas[y0:y1, x0:x1, 3:4], a)
                    bx = m.box
                    boxes.append((mx + bx[0] * kk, my + bx[1] * kk, mx + bx[2] * kk, my + bx[3] * kk))
                    mems.append({'prop': m.prop, 'k': round(kk, 6), 'ox': round(mx, 2), 'oy': round(my, 2)})
                box = [round(min(b[0] for b in boxes), 1), round(min(b[1] for b in boxes), 1),
                       round(max(b[2] for b in boxes), 1), round(max(b[3] for b in boxes), 1)]
                cells.append({'key': key, 'row': r, 'box': box, 'members': mems,
                              'anchor': 'centre' if key in CENTRE else 'bottom', 'desc': DESC[key]})
            x += wdt + GAP_X
        y += h + GAP_Y
    # reading order: by row, then left to right
    cells.sort(key=lambda c: (c['row'], c['box'][0]))
    mask = Image.fromarray((np.clip(canvas[..., 3], 0, 1) * 255).astype(np.uint8), 'L')
    bg = np.empty((H, W, 3), np.float32)
    bg[:] = np.array(BG, np.float32) / 255
    a = canvas[..., 3:4]
    rgb = bg * (1 - a) + canvas[..., :3] * a
    sheet = Image.fromarray((np.clip(rgb, 0, 1) * 255 + .5).astype(np.uint8), 'RGB')
    d = ImageDraw.Draw(sheet)
    d.text((18, 14), f'{idx:02d}', fill=(150, 142, 132), font=font(30))
    return sheet, mask, {'id': f'{idx:02d}', 'file': f'{idx:02d}.png', 'batch': (idx - 1) // BATCH + 1, 'cells': cells}


def font(px: int):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
              'C:/Windows/Fonts/arialbd.ttf'):
        if Path(f).exists():
            return ImageFont.truetype(f, px)
    return ImageFont.load_default()


# ------------------------------------------------------------------ style board
def style_board() -> Image.Image:
    """The team's own art, cropped close so its cut-paper texture is legible."""
    home = S.ROOT / 'static' / 'img' / 'home-opening'
    sky = Image.open(home / 'opening-sky.webp').convert('RGBA')
    fg = Image.open(home / 'opening-foreground.webp').convert('RGBA')
    art = sky.copy()
    art.alpha_composite(fg)
    board = Image.new('RGBA', (W, H), (23, 11, 30, 255))
    soil = art.crop((0, 596, 1586, 992))
    soil = soil.resize((W, round(soil.height * W / soil.width)), Image.Resampling.LANCZOS)
    board.alpha_composite(soil, (0, H - soil.height))
    for box, scale, at in (((0, 228, 345, 640), 1.42, (26, 34)), ((1232, 296, 1586, 640), 1.34, (600, 120))):
        c = fg.crop(box)
        c = c.resize((round(c.width * scale), round(c.height * scale)), Image.Resampling.LANCZOS)
        board.alpha_composite(c, at)
    worm = Image.open(S.ROOT / 'static' / 'img' / 'home' / 'nematode.png').convert('RGBA')
    worm = worm.resize((round(worm.width * .78), round(worm.height * .78)), Image.Resampling.LANCZOS)
    board.alpha_composite(worm, (1080, 190))
    return board.convert('RGB')


# ------------------------------------------------------------------ prompts
POS = {0: 'top row', 1: 'middle row', 2: 'bottom row'}

RULES = """TASK
For every layout sheet, make ONE new image that can be laid exactly over it:
1. Same canvas: 1536 x 1024 pixels, landscape.
2. Same objects in the same places, at the same sizes, with the same outlines and the same viewing angle. Do not add, remove, merge, swap, turn or move any object. Keep the empty space between objects; no object may touch another.
3. Redraw every object in the style described below.
4. Background: fully transparent (PNG with alpha). If transparency is impossible, use one perfectly flat pure white #FFFFFF background with nothing else on it.
5. Do not draw the sheet number. No text, letters, numbers, labels, logos, borders, frames, ground lines, floors or shadows anywhere.

STYLE (match 00-style.png)
- Flat hand-cut paper collage: every shape is cut from matte coloured paper with scissors, so its edges are straight, slightly irregular cuts with a few corners. No outlines, no ink lines.
- Each shape is one flat paper colour. Sides and details are separate overlapping pieces of slightly darker or lighter paper. No gradients, no airbrush, no glossy highlights, no 3D rendering, no drop shadows.
- Texture as in the reference: oil-pastel or crayon scratches in a second, warmer colour running in one direction across each piece (like the ochre scratches on the olive tree crowns), a few dry-brush streaks, fine dark speckles and visible paper grain. Soil is speckled and dotted with small pale stones, like the reference soil.
- Simple, chunky, readable shapes. Small details may be simplified, but each object keeps its silhouette.
- People are simple faceless paper figures: round head, no face, no hair details, rounded body.
- Colours are given per object below. Palette, muted like the reference (never pure white, never black, never neon): olive #7B7639, dark olive #58542A, ochre #C88F35, mustard #B58D3A, rust #83403C, plum #6E4764, mauve #8D6B84, pale mauve #B59BB8, lilac #9479B8, light lilac #B19BD2, orange #E88F46, amber #DFA340, cream #E6D7BB.
- All sheets must look like one consistent set by the same artist."""


def sheet_lines(sh: dict) -> list[str]:
    out = [f'Sheet {sh["id"]} = {sh["file"]} ({len(sh["cells"])} objects)']
    rows = sorted({c['row'] for c in sh['cells']})
    nrows = len(rows)
    for i, c in enumerate(sh['cells']):
        same = [x for x in sh['cells'] if x['row'] == c['row']]
        nth = same.index(c) + 1
        rname = 'single row' if nrows == 1 else POS[0] if c['row'] == rows[0] else POS[2] if c['row'] == rows[-1] else POS[1]
        where = f'{rname}, {ordinal(nth)} from left' if len(same) > 1 else rname
        out.append(f'  {chr(97 + i)}) {where}: {c["desc"]}.')
    return out


def ordinal(n: int) -> str:
    return {1: '1st', 2: '2nd', 3: '3rd'}.get(n, f'{n}th')


def batch_prompt(sheets: list[dict], b: int, nb: int) -> str:
    first, last = sheets[0]['id'], sheets[-1]['id']
    head = (f'You are going to redraw {len(sheets)} layout sheets for a science website (part {b} of {nb}). '
            f'Work through all of them on your own, one image per sheet, without asking me anything.\n\n'
            f'ATTACHED\n'
            f'- 00-style.png = STYLE REFERENCE: our team\'s own illustration (trees, grass, soil layers, roots and an orange nematode), '
            f'made as hand-cut paper collage. Copy its technique, textures and palette. Do not copy its trees, sky or composition.\n'
            f'- {first}.png to {last}.png = LAYOUT SHEETS: each shows a few objects as smooth 3D clay models on a plain grey background. '
            f'The small grey number in the top-left corner is only the sheet number.\n\n')
    body = '\n'.join(l for sh in sheets for l in sheet_lines(sh) + [''])
    tail = (f'PROCESS\nStart with sheet {first} and continue in order up to sheet {last}, generating each image right after the previous one. '
            f'Do not ask questions, do not wait for confirmation and do not write explanations between the images. '
            f'If you have to stop before the end, then whenever I reply "继续", carry on with the next sheet that has not been drawn yet. '
            f'If I reply "重画" followed by a sheet number (for example "重画 {first}"), draw that sheet again with the same rules.')
    return head + RULES + '\n\nSHEETS (objects listed left to right, top row first)\n' + body + '\n' + tail + '\n'


def api_prompt(sh: dict) -> str:
    head = ('Redraw the layout sheet for a science website. Image 1 is the STYLE REFERENCE: our team\'s own hand-cut paper '
            'collage illustration; copy its technique, textures and palette, not its trees, sky or composition. Image 2 is the '
            'LAYOUT SHEET: objects as smooth 3D clay models on a plain grey background; the small number in its corner is only '
            'the sheet number.\n\n')
    rules = RULES.replace('For every layout sheet, make ONE new image', 'Make ONE new image').replace('All sheets must look', 'It must look')
    return head + rules + '\n\nOBJECTS (left to right, top row first)\n' + '\n'.join(sheet_lines(sh)[1:]) + '\n'


GUIDE = """怎么用（不需要改任何提示词）

1. 打开 ChatGPT，新建对话，选能生成图片的模型。
2. 打开「第1批」文件夹：把里面的 9 张图片（00-style.png 和 01.png 到 08.png）一次全部上传，
   再打开「提示词.txt」，全选复制，粘贴发送。
3. ChatGPT 会一张接一张地画。如果它画了几张就停下，回复「继续」两个字就行；
   哪一张画坏了，回复「重画 05」这样的格式（换成那张的编号）。
4. 第1批画完后，新建一个对话，用「第2批」文件夹重复第 2、3 步。
5. 把 ChatGPT 画好的图全部下载，放进网站源码的 gpt/out/ 文件夹（文件名不用改，多下载了重画前的旧图也没关系，工具默认用最新的那张）。
6. 在网站源码目录 website/ 下运行：
       python3 tools/scene-art/gpt_ingest.py
   工具会自动认出每张图对应第几张底图，把每个道具剪下来放回原位，重新生成开场图集，
   并在 gpt/out/_report.png 生成对照图。没画好或没认出来的道具会保留现在的手剪风格版本。

有 OpenAI API key 的话，也可以跳过第 1 到 5 步，直接运行：
       OPENAI_API_KEY=你的key python3 tools/scene-art/gpt_api.py
"""


def main() -> None:
    covered = set(DERIVED)
    for specs in SHEETS:
        for s in specs:
            if isinstance(s, str):
                covered.add(s)
            elif s[0] == 'pair':
                covered.update(s[1:])
            else:
                covered.update(GROUPS[s[1]]['members'])
    missing = set(S.frames_index()) - covered
    extra = covered - set(S.frames_index())
    if missing or extra:
        sys.exit(f'sheet plan out of date: missing {sorted(missing)}, unknown {sorted(extra)}')

    if SEND.exists():
        shutil.rmtree(SEND)
    (GPT / 'ref').mkdir(parents=True, exist_ok=True)
    (GPT / 'out').mkdir(parents=True, exist_ok=True)
    board = style_board()
    sheets = []
    nb = (len(SHEETS) + BATCH - 1) // BATCH
    for i, specs in enumerate(SHEETS, 1):
        img, mask, meta = build_sheet(i, specs)
        b = meta['batch']
        folder = SEND / f'第{b}批'
        folder.mkdir(parents=True, exist_ok=True)
        img.save(folder / meta['file'], optimize=True)
        mask.save(GPT / 'ref' / f'{meta["id"]}-mask.png', optimize=True)
        meta['api_prompt'] = api_prompt(meta)
        sheets.append(meta)
        print(f'sheet {meta["id"]}  batch {b}  ' + ', '.join(c['key'] for c in meta['cells']))
    for b in range(1, nb + 1):
        folder = SEND / f'第{b}批'
        board.save(folder / '00-style.png', optimize=True)
        (folder / '提示词.txt').write_text(batch_prompt([s for s in sheets if s['batch'] == b], b, nb), encoding='utf-8')
    (SEND / '使用说明.txt').write_text(GUIDE, encoding='utf-8')
    board.save(GPT / 'ref' / '00-style.png', optimize=True)
    manifest = {'version': 1, 'size': [W, H], 'background': '#%02x%02x%02x' % BG, 'label_box': [0, 0, 120, 56],
                'groups': GROUPS, 'derived': DERIVED, 'sheets': sheets}
    (GPT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(sheets)} sheets in {nb} batches -> {SEND.relative_to(S.ROOT)}')


if __name__ == '__main__':
    main()
