# Rebuilds the homepage "From the field to the bench" overview SVG (src/home/sections/loop.html)
# from the team's Inkscape drawing dbtlv2.svg (kept outside Git, ~/Documents/newDBTL/dbtlv2.svg).
# Usage: python3 tools/build-home-dbtl-v2.py <dbtlv2.svg> <out.svg>; then paste out.svg over the <svg class="dbtl"> in loop.html.
"""dbtlv2.svg (Inkscape) -> homepage loop SVG with the structure home-story.js expects."""
import re, sys, math
import xml.etree.ElementTree as ET

SRC, OUT = sys.argv[1], sys.argv[2]
NS = '{http://www.w3.org/2000/svg}'
XL = '{http://www.w3.org/1999/xlink}href'
T = (45.619449, -1.2367559)          # layer1 translate
root = ET.parse(SRC).getroot()
defs = root.find(NS + 'defs')
layer = root.find(NS + 'g')
byid = {e.get('id'): e for e in root.iter() if e.get('id')}

def tag(e): return e.tag.split('}')[1]
def sty(e): return dict(kv.split(':', 1) for kv in e.get('style', '').split(';') if ':' in kv)
def hidden(e): return sty(e).get('display') == 'none'

# ---------- number rounding ----------
NUM = re.compile(r'-?\d*\.?\d+(?:e-?\d+)?')
def rnd(s, nd=3):
    def f(m):
        v = float(m.group(0))
        if abs(v) < 1e-4: return '0'
        t = ('%.' + str(nd) + 'f') % v
        t = t.rstrip('0').rstrip('.') if '.' in t else t
        return t if t != '-0' else '0'
    return NUM.sub(f, s)

DROP_STYLE = {'-inkscape-font-specification', 'font-variant', 'font-stretch', 'font-style', 'writing-mode',
              'direction', 'font-family', 'display', 'stroke-dasharray', 'stroke-dashoffset', 'paint-order'}
def clean_style(st, keep_font=False):
    out = []
    for k, v in st.items():
        k = k.strip(); v = v.strip()
        if k in DROP_STYLE and not (keep_font and k == 'font-family'): continue
        if k == 'stroke-dasharray' and v == 'none': continue
        if k == 'font-weight' and v == 'normal': continue
        if 'url(#' in v: v = v.replace('url(#', 'url(#dbtl-')
        if k in ('marker-start', 'marker-mid', 'marker-end') and v == 'none': continue
        out.append('%s:%s' % (k, rnd(v) if re.match(r'^-?[\d.]+(px)?$', v) else v))
    return ';'.join(out)

used = set()
def refs(s):
    for m in re.finditer(r'url\(#(?:dbtl-)?([^)]+)\)', s or ''): used.add(m.group(1))

GEOM = {'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'd', 'transform', 'x1', 'y1', 'x2', 'y2',
        'gradientTransform', 'patternTransform', 'refX', 'refY', 'markerWidth', 'markerHeight', 'viewBox',
        'gradientUnits', 'patternUnits', 'orient', 'preserveAspectRatio', 'offset'}

def ser(e, extra='', first=''):
    """serialise e (no ids, no inkscape attrs)."""
    t = tag(e)
    if hidden(e): return ''
    a = []
    for k, v in e.attrib.items():
        if k.startswith('{'):
            if k == XL: a.append('xlink:href="#dbtl-%s"' % v[1:]); used.add(v[1:])
            continue
        if k in GEOM: a.append('%s="%s"' % (k, rnd(v) if k not in ('gradientUnits', 'patternUnits', 'orient', 'preserveAspectRatio') else v))
        elif k == 'style':
            s = clean_style(sty(e)); refs(s)
            if s: a.append('style="%s"' % s)
        elif k in ('fill', 'stroke'):
            refs(v); a.append('%s="%s"' % (k, v.replace('url(#', 'url(#dbtl-')))
    if t == 'text':
        txt = ''.join(e.itertext()).replace('（', '(').replace('）', ')')
        if not txt.strip(): return ''
        x, y = e.get('x'), e.get('y')
        ts = e.find(NS + 'tspan')
        s2 = clean_style({**sty(e), **(sty(ts) if ts is not None else {})}); refs(s2)
        return '<text x="%s" y="%s"%s%s>%s</text>' % (rnd(x), rnd(y), ' transform="%s"' % rnd(e.get('transform')) if e.get('transform') else '',
                                                    ' style="%s"' % s2 if s2 else '', txt.replace('&', '&amp;').replace('<', '&lt;'))
    kids = ''.join(ser(c) for c in e)
    if t == 'path' and not e.get('d'): return ''
    if t == 'g' and not kids.strip() and not first: return ''
    attrs = (' ' + extra if extra else '') + (' ' + ' '.join(a) if a else '')
    if not kids and not first: return '<%s%s/>' % (t, attrs)
    return '<%s%s>%s%s</%s>' % (t, attrs, first, kids, t)

# ---------- matrices ----------
def parse_tf(s):
    M = [1, 0, 0, 1, 0, 0]
    for name, args in re.findall(r'(\w+)\(([^)]*)\)', s or ''):
        v = [float(x) for x in re.split(r'[\s,]+', args.strip()) if x]
        if name == 'translate': m = [1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0]
        elif name == 'scale': m = [v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0]
        elif name == 'matrix': m = v
        elif name == 'rotate':
            c, s_ = math.cos(math.radians(v[0])), math.sin(math.radians(v[0]))
            m = [c, s_, -s_, c, 0, 0]
            if len(v) == 3:
                cx, cy = v[1], v[2]; m = mul(mul([1, 0, 0, 1, cx, cy], m), [1, 0, 0, 1, -cx, -cy])
        M = mul(M, m)
    return M
def mul(A, B):
    a, b, c, d, e, f = A; g, h, i, j, k, l = B
    return [a*g + c*h, b*g + d*h, a*i + c*j, b*i + d*j, a*k + c*l + e, b*k + d*l + f]
def ap(M, x, y): return (M[0]*x + M[2]*y + M[4], M[1]*x + M[3]*y + M[5])

def frame_rect(g):
    """the node's outline: the rounded rect stroked 2.4-2.8 wide."""
    for r in g.iter(NS + 'rect'):
        s = sty(r)
        if s.get('fill') == 'none' and float(s.get('stroke-width', 0)) > 2.3 and r.get('ry'): return r
    raise SystemExit('no frame in ' + g.get('id'))
def box(g, r):
    M = parse_tf(g.get('transform'))
    # walk from g down to r collecting transforms
    def path_to(node, target, acc):
        if node is target: return acc
        for c in node:
            res = path_to(c, target, mul(acc, parse_tf(c.get('transform'))))
            if res: return res
    M = path_to(g, r, M)
    x, y, w, h = (float(r.get(k)) for k in ('x', 'y', 'width', 'height'))
    p0, p1 = ap(M, x, y), ap(M, x + w, y + h)
    return p0[0], p0[1], p1[0], p1[1]

# ---------- design content ----------
COLOR_KIND = {'#53509d': 'dry', '#55519b': 'dry', '#c57925': 'wet', '#ab3045': 'hp'}
GRAD_KIND = {'linearGradient5': 'wet dry', 'linearGradient3': 'dry hp'}
# group id -> cycle, name for the panel, label (keyword, rest, keyword-first?)
NODES = [
    ('g1-2', 1, 'Editing strategy',      [('Editing', 1), ('strategy', 0)]),
    ('g12',  1, 'Parts assembly',        [('Parts', 1), ('assembly', 0)]),
    ('g16',  1, 'Pathway construction',  [('Pathway', 1), ('construction', 0)]),
    ('g11',  2, 'Molecular screening',   [('Molecular', 1), ('screening', 0)]),
    ('g10',  2, 'Mutation design',       [('Mutation', 1), ('design', 0)]),
    ('g8',   2, 'Strengthen docking',    [('Strengthen', 0), ('docking', 1)]),
    ('g9',   2, 'ODE modeling',          [('ODE', 1), ('modeling', 0)]),
    ('g6',   3, 'Soil tracking',         [('Soil', 1), ('tracking', 0)]),
    ('g5',   3, 'Education and outreach',[('Education', 1), ('&amp;', 0), ('outreach', 1)]),
    ('g3',   3, 'Social survey',         [('Social', 0), ('survey', 1)]),
    ('g4',   3, 'Economic modeling',     [('Economic', 1), ('modeling', 0)]),
    ('g48',  4, 'Substrate selection',   [('Substrate', 1), ('selection', 0)]),
    ('g20',  4, 'Process optimization',  [('Process', 1), ('optimization', 0)]),
    ('g17',  4, 'Strip finalization',    [('Strip', 1), ('finalization', 0)]),
]
# label baseline (layer coords) from the design's text elements
LABEL_Y = {'g1-2': 107.588, 'g12': 28.663, 'g16': 143.857, 'g11': 28.655, 'g10': 28.655, 'g8': 143.886,
           'g9': 144.018, 'g6': 28.742, 'g5': 28.742, 'g3': 143.603, 'g4': 206.745, 'g48': 207.346,
           'g20': 207.349, 'g17': 207.357}
EDGES = {  # path id -> cycle or bridge
    'path52': 1, 'path62': 1, 'path63': 1,
    'path11': 2, 'path12': 2, 'path13': 2, 'path61': 2,
    'path58': 3, 'path59': 3, 'path60': 3, 'path64': 3,
    'path50': 4, 'path51': 4,
    'path9': '1 2', 'path56': '2 3', 'path130': '2 4', 'path65': '3 4',
}
# the vertical links under "ODE modeling" and "Social survey" cut through those labels in the
# design; they start just under the label instead
TRIM = {'path130': 147.2, 'path64': 147.2}
CYCLES = [  # frame rect, no, title, aria
    ('rect1', 1, 'Engineering the pathway'),
    ('rect1-3', 2, 'Clarify the readout'),
    ('rect1-3-2', 3, 'Into the society'),
    ('rect1-4', 4, 'Forge the artifact'),
]
TITLE_Y = {1: 16.235, 2: 16.235, 3: 16.235, 4: 219.273}
PURPLE, INK, FRAME = '#8435b4', '#231829', '#8138a4'
FS_TITLE, FS_LABEL = 6.35, 5.5

seen = set()
# cycles (root coordinates: JS reads the frame rect straight into the viewBox)
cyc = []
for rid, c, title in CYCLES:
    r = byid[rid]; seen.add(rid)
    x, y, w, h = (float(r.get(k)) for k in ('x', 'y', 'width', 'height'))
    x += T[0]; y += T[1]
    tx = x + 5.3; ty = TITLE_Y[c] + T[1]
    cyc.append('<g class="dbtl-cycle" data-c="%d" tabindex="0" role="button" aria-label="Goal %d: %s. Show this goal">'
               '<rect class="dbtl-cycle__frame" x="%s" y="%s" width="%s" height="%s" rx="7.5" fill="#fff" fill-opacity=".5" stroke="%s" stroke-opacity=".5" stroke-width="2.55"/>'
               '<text class="dbtl-cycle__title" x="%s" y="%s" font-size="%s" font-weight="700" fill="%s"><tspan class="dbtl-cycle__no" fill="%s">GOAL-%d</tspan> | %s</text></g>'
               % (c, c, title, rnd(str(x)), rnd(str(y)), rnd(str(w)), rnd(str(h)), FRAME, rnd(str(tx)), rnd(str(ty)), FS_TITLE, INK, PURPLE, c, title))
for t in ('text65', 'text65-5', 'text65-5-6', 'text65-5-6-7'): seen.add(t)

# edges
edges = []
for pid, c in EDGES.items():
    p = byid[pid]; seen.add(pid)
    d = p.get('d')
    if pid in TRIM:
        nums = [float(n) for n in NUM.findall(d)]
        # "m x,y 0,dy" / "m x,y v dy": rebuild as absolute vertical line from TRIM to the old end
        x0, y0 = nums[0], nums[1]; y1 = y0 + nums[-1]
        d = 'M %s,%s V %s' % (x0, TRIM[pid], y1)
        p = ET.Element(p.tag, {**p.attrib, 'd': d})
    if isinstance(c, int): extra = 'class="dbtl-edge" data-c="%d"' % c
    else: extra = 'class="dbtl-edge dbtl-edge--bridge" data-bridge="%s"' % c
    edges.append(ser(p, extra))
seen.add('path6')  # invisible duplicate of path52
seen.update(['layer1-2', 'layer1-7'])  # only hold the hidden DBTL-3/4 titles of the first draft

# nodes + labels
nodes, labels = [], []
for gid, c, name, parts in NODES:
    g = byid[gid]; seen.add(gid)
    fr = frame_rect(g)
    st = sty(fr)['stroke']
    m = re.match(r'url\(#(.+)\)', st)
    kind = GRAD_KIND[m.group(1)] if m else COLOR_KIND[st.lower()]
    # white card behind the drawing (the page is warm, the design was drawn on white)
    bg = '<rect class="dbtl-node__bg" x="%s" y="%s" width="%s" height="%s" ry="%s" fill="#fff"%s/>' % (
        rnd(fr.get('x')), rnd(fr.get('y')), rnd(fr.get('width')), rnd(fr.get('height')), rnd(fr.get('ry')),
        ' transform="%s"' % rnd(fr.get('transform')) if fr.get('transform') else '')
    # bg must sit in the frame's own coordinate system: put it inside the frame's parent
    parent = next(p for p in g.iter() if fr in list(p))
    if parent is g:
        nodes.append(ser(g, 'class="dbtl-node" data-c="%d" data-kind="%s" data-name="%s"' % (c, kind, name), first=bg))
    else:
        # insert as first child of that inner group
        parent.insert(0, ET.fromstring(bg.replace('<rect ', '<rect xmlns="http://www.w3.org/2000/svg" ')))
        nodes.append(ser(g, 'class="dbtl-node" data-c="%d" data-kind="%s" data-name="%s"' % (c, kind, name)))
    x0, y0, x1, y1 = box(g, fr)
    cx = (x0 + x1) / 2
    spans = ''
    for i, (word, key) in enumerate(parts):
        sep = ' ' if i else ''
        spans += sep + ('<tspan font-weight="700" fill="%s">%s</tspan>' % (PURPLE, word) if key else word)
    labels.append('<text class="dbtl-label" data-c="%d" x="%s" y="%s" text-anchor="middle">%s</text>' % (c, rnd(str(cx)), rnd(str(LABEL_Y[gid])), spans))
for t in ('text68', 'text70', 'text71', 'text75', 'text84', 'text86', 'text87', 'text88', 'text89', 'text90',
          'text91', 'text92', 'text93', 'text93-6'): seen.add(t)

# legend (rebuilt: sentence case, site font)
lg = byid['g1']; seen.add('g1')
L = parse_tf(lg.get('transform'))
leg = []
for rid, label in (('rect5-1', 'Dry lab'), ('rect5-7', 'Wet lab'), ('rect5', 'HP')):
    r = byid[rid]
    leg.append('<rect x="%s" y="%s" width="%s" height="%s" ry="%s" fill="none" stroke="%s" stroke-width="1.755"/>' % (
        rnd(r.get('x')), rnd(r.get('y')), rnd(r.get('width')), rnd(r.get('height')), rnd(r.get('ry')), sty(r)['stroke']))
    leg.append('<text x="-11.324" y="%s" font-size="4.586" fill="%s">%s</text>' % (rnd(str(float(r.get('y')) + 5.45)), INK, label))
legend = '<g class="dbtl-legend" transform="translate(%s %s) %s">%s</g>' % (rnd(str(T[0])), rnd(str(T[1])), 'matrix(%s)' % ','.join(rnd(str(v), 4) for v in L), ''.join(leg))

# anything visible left over in the layer is a mistake
left = [e.get('id') for e in layer if e.get('id') not in seen and not hidden(e) and not (tag(e) == 'text' and not ''.join(e.itertext()).strip())]
if left: raise SystemExit('unassigned visible elements: %s' % left)

# defs: everything referenced, transitively, ids prefixed
def collect():
    out, done = [], set()
    while True:
        todo = [u for u in used if u not in done]
        if not todo: break
        for u in todo:
            done.add(u); e = byid[u]
            out.append((u, e))
            ser(e)  # registers nested refs
    return out
dd = []
for u, e in sorted(collect(), key=lambda p: p[0]):
    t = tag(e)
    inner = ''.join(ser(c) for c in e)
    a = ['id="dbtl-%s"' % u]
    for k, v in e.attrib.items():
        if k == XL: a.append('xlink:href="#dbtl-%s"' % v[1:])
        elif k in GEOM: a.append('%s="%s"' % (k, rnd(v) if k not in ('gradientUnits', 'patternUnits', 'orient', 'preserveAspectRatio') else v))
        elif k == 'style': a.append('style="%s"' % clean_style(sty(e)))
    for s in e.iter(NS + 'stop'):
        pass
    if t == 'linearGradient':
        inner = ''.join('<stop style="%s" offset="%s"/>' % (s.get('style').rstrip(';'), rnd(s.get('offset'))) for s in e.findall(NS + 'stop'))
    dd.append('<%s %s>%s</%s>' % (t, ' '.join(a), inner, t) if inner else '<%s %s/>' % (t, ' '.join(a)))

# viewBox: frames + legend, 3 units of air
xs = []
for rid, *_ in CYCLES:
    r = byid[rid]; sw = 2.55 / 2
    x, y, w, h = (float(r.get(k)) for k in ('x', 'y', 'width', 'height'))
    xs.append((x - sw + T[0], y - sw + T[1], x + w + sw + T[0], y + h + sw + T[1]))
for rid in ('rect5', 'rect5-1'):
    r = byid[rid]
    p0 = ap(L, float(r.get('x')) - 1, float(r.get('y')) - 1); p1 = ap(L, float(r.get('x')) + float(r.get('width')) + 1, float(r.get('y')) + float(r.get('height')) + 1)
    xs.append((p0[0] + T[0], p0[1] + T[1], p1[0] + T[0], p1[1] + T[1]))
X0 = min(b[0] for b in xs) - 3; Y0 = min(b[1] for b in xs) - 3
X1 = max(b[2] for b in xs) + 3; Y1 = max(b[3] for b in xs) + 3
VB = '%s %s %s %s' % tuple(rnd(str(v), 2) for v in (X0, Y0, X1 - X0, Y1 - Y0))

tr = 'transform="translate(%s %s)"' % (rnd(str(T[0])), rnd(str(T[1])))
svg = ('<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" class="dbtl" viewBox="%s" role="group" '
       'aria-label="Engineering overview: four goals linking the dry lab, the wet lab and Human Practices" '
       'font-family="\'Spline Sans\', -apple-system, \'Segoe UI\', sans-serif">'
       '<defs>%s</defs><g class="dbtl-cycles">%s</g><g class="dbtl-edges" %s>%s</g><g class="dbtl-nodes" %s>%s</g>'
       '<g class="dbtl-labels" %s font-size="%s" fill="%s">%s</g>%s</svg>') % (
    VB, ''.join(dd), ''.join(cyc), tr, ''.join(edges), tr, ''.join(nodes), tr, FS_LABEL, INK, ''.join(labels), legend)
open(OUT, 'w').write(svg)
print('viewBox', VB, 'ratio', (X1 - X0) / (Y1 - Y0), 'bytes', len(svg))
