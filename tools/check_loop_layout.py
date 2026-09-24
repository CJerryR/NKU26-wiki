"""Layout check for the homepage research-loop map (part 04).

Loads the built page in headless Chromium, measures every node label, zone
title, edge pill and node disc on screen, samples each edge line every 3 px
and checks arrowheads, and reports any overlap: label on label, label on pill,
pill on pill, anything on a node disc, a line through a label or another
pill, or an arrowhead on a label or pill. Exit status 1 when anything overlaps.

  python3 tools/check_loop_layout.py [url] [viewport-width]
"""
import sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8822/index.html'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1440
JS = r"""() => {
  const svg = document.querySelector('[data-loop-svg]');
  const R = el => { const r = el.getBoundingClientRect(); return { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; };
  const grow = (r, p) => ({ x0: r.x0 - p, y0: r.y0 - p, x1: r.x1 + p, y1: r.y1 + p });
  const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  const inside = (x, y, r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1;
  const texts = [...svg.querySelectorAll('.lp-name, .lp-zh, .lp-zone-label')].map(el => ({ k: 'label "' + el.textContent + '"', r: R(el), node: el.closest('.lp-node') }));
  const pills = [...svg.querySelectorAll('.lp-pill')].map(el => ({ k: 'pill "' + el.textContent + '"', r: R(el.querySelector('rect')) }));
  const discs = [...svg.querySelectorAll('.lp-disc')].map(el => ({ k: 'node "' + el.closest('.lp-node').querySelector('.lp-name').textContent + '"', r: R(el), node: el.closest('.lp-node') }));
  const out = [];
  const boxes = texts.concat(pills);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    if (boxes[i].node && boxes[i].node === boxes[j].node) continue;
    if (hit(grow(boxes[i].r, 2), boxes[j].r)) out.push(boxes[i].k + ' overlaps ' + boxes[j].k);
  }
  for (const b of boxes) for (const d of discs) if (hit(b.r, grow(d.r, -1))) out.push(b.k + ' overlaps ' + d.k);
  [...svg.querySelectorAll('.lp-edge')].forEach((g, i) => {
    const own = pills[i], path = g.querySelector('.lp-line'), L = path.getTotalLength(), m = path.getScreenCTM();
    const seen = new Set();
    for (let s = 0; s <= L; s += 3) {
      const p = path.getPointAtLength(s), x = m.a * p.x + m.c * p.y + m.e, y = m.b * p.x + m.d * p.y + m.f;
      for (const t of texts) if (inside(x, y, t.r) && !seen.has(t.k)) { seen.add(t.k); out.push('line of ' + own.k + ' runs through ' + t.k); }
      for (const q of pills) if (q !== own && inside(x, y, q.r) && !seen.has(q.k)) { seen.add(q.k); out.push('line of ' + own.k + ' runs under ' + q.k); }
    }
    g.querySelectorAll('.lp-head').forEach(h => {
      const r = R(h);
      for (const t of texts) if (hit(r, t.r)) out.push('arrowhead of ' + own.k + ' on ' + t.k);
      for (const q of pills) if (q !== own && hit(r, q.r)) out.push('arrowhead of ' + own.k + ' on ' + q.k);
    });
  });
  return { n: { labels: texts.length, pills: pills.length, nodes: discs.length }, overlaps: [...new Set(out)] };
}"""
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': W, 'height': 900})
    pg.goto(URL, wait_until='load')
    pg.evaluate("document.querySelector('[data-loopmap]').scrollIntoView()")
    pg.wait_for_timeout(600)
    res = pg.evaluate(JS)
    b.close()
print('checked', res['n'])
for o in res['overlaps']: print('  OVERLAP:', o)
print('RESULT:', 'PASS' if not res['overlaps'] else 'FAIL (%d)' % len(res['overlaps']))
sys.exit(1 if res['overlaps'] else 0)
