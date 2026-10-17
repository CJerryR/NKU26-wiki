"""Stand-alone preview (dev tool; needs python playwright + node typescript, not part of the site).
Writes screenshots to $SCENE_PREVIEW_OUT (default: <tmp>/scene-preview).

Stand-alone preview of SceneHero (no Astro build): same markup as SceneHero.astro,
the real scene-hero.css/.ts, then screenshots at scroll progress 0/.5/1.
usage: python3 harness.py <page> [<page> ...] [--vp 1440x900,390x844]"""
import json, sys, subprocess, threading, http.server, functools, socketserver, html
from pathlib import Path
import os, tempfile
REPO = Path(__file__).resolve().parents[1]; OUT = Path(os.environ.get('SCENE_PREVIEW_OUT', tempfile.gettempdir())) / 'scene-preview'; OUT.mkdir(parents=True, exist_ok=True)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
vps = [tuple(map(int, v.split('x'))) for v in (sys.argv[sys.argv.index('--vp') + 1] if '--vp' in sys.argv else '1440x900,390x844').split(',')]
args = [a for a in args if 'x' not in a or not a.replace('x', '').replace(',', '').isdigit()]
js = subprocess.run(['node', '-e', """const ts=require('typescript');
const src=require('fs').readFileSync('src/scripts/scene-hero.ts','utf8');
process.stdout.write(ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext}}).outputText)"""],
                    cwd=REPO, capture_output=True, text=True, check=True).stdout
(OUT / 'scene-hero.js').write_text(js + '\ninitSceneHero();\n')
css = ''.join((REPO / f).read_text() for f in ('src/styles/tokens.css', 'src/styles/page.css', 'src/styles/scene-hero.css'))
pct = lambda n: f'{round(n, 4)}%'

def page_html(page):
    L = json.loads((REPO / f'src/data/scenes/{page}.json').read_text())
    A = json.loads((REPO / f'src/data/scenes/{page}.atlas.json').read_text())
    W = json.loads((REPO / f'content/wiki/{page}.json').read_text())
    crumbs = W.get('crumbs') or [W['title']]
    eyebrow = L.get('eyebrow') or (crumbs[0] if len(crumbs) > 1 else '')
    sets = []
    for kind in ('desktop', 'mobile'):
        s, a = L[kind], A[kind]; url = f"/static/img/scenes/{a['file']}?v={a['hash']}"
        t = s.get('title', {}); AW, AH = a['size']; layers = []
        for l in sorted(s['layers'], key=lambda l: l.get('z', 1)):
            fx, fy, fw, fh = a['frames'][l['prop']]; f = l['from']
            st = ';'.join([f"--x:{f['x']}", f"--y:{f['y']}", f"--w:{l['w']}", f"--h:{round(l['w'] * fh / fw, 2)}", f"--z:{l.get('z', 1)}",
                           f"--r:{f.get('r', 0)}deg", f"--s:{f.get('s', 1)}", f"--o:{f.get('o', 1)}",
                           f"background-size:{pct(AW / fw * 100)} {pct(AH / fh * 100)}",
                           f"background-position:{pct(0 if AW == fw else fx / (AW - fw) * 100)} {pct(0 if AH == fh else fy / (AH - fh) * 100)}"])
            mo = json.dumps({'f': l['from'], 't': l['to'], 'w': l.get('win', [0, 1]), 'd': l.get('depth', 0)})
            layers.append(f'<div class="scene__layer" data-scene-layer="{l["id"]}" data-motion="{html.escape(mo)}" style="{st}"></div>')
        ttl = html.escape(json.dumps({'y': t.get('y', 0), 'toY': t.get('toY', -200), 'toScale': t.get('toScale', 0.65)}))
        sets.append(f'<div class="scene__set scene__set--{kind}" aria-hidden="true" data-scene-set="{kind}" data-canvas="{",".join(map(str, s["canvas"]))}" '
                    f'data-src="{url}" data-title="{ttl}" style="--cw:{s["canvas"][0]};--ch:{s["canvas"][1]};--atlas:url({url})">{"".join(layers)}</div>')
    d, m = L['desktop'].get('title', {}), L['mobile'].get('title', {})
    crumb = ''.join(f'<li>{html.escape(c)}</li>' for c in crumbs)
    return f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>{css} *{{box-sizing:border-box}} body{{margin:0;background:var(--paper)}} .fake-nav{{position:fixed;top:0;left:0;right:0;height:64px;background:rgba(36,28,43,.10);z-index:50;border-bottom:1px dashed rgba(82,58,140,.5)}}
#content{{min-height:1600px;padding:60px 8vw;font:17px/1.6 system-ui;color:#3a2f45}}</style></head><body>
<div class="fake-nav"></div><main id="main">
<section class="scene" data-scene data-tone="light" aria-labelledby="page-title" style="--ty-d:{d.get('y', 0)};--ty-m:{m.get('y', 0)}"><div class="scene__stage">
<div class="scene__floor" aria-hidden="true" data-scene-floor></div>{''.join(sets)}
<nav class="crumbs scene__crumbs" aria-label="Breadcrumb"><ol><li><a href="#">Home</a></li>{crumb}</ol></nav>
<div class="scene__title" data-scene-title>{f'<p class="scene__eyebrow">{eyebrow}</p>' if eyebrow else ''}<h1 id="page-title" class="scene__h1">{html.escape(W.get('heading') or W['title'])}</h1><span class="scene__pill" aria-hidden="true"></span></div>
<div class="scene__cue" aria-hidden="true" data-scene-cue><span>Scroll to open</span><i></i></div><a class="scene__skip" href="#content">Skip intro</a></div></section>
<div id="content" tabindex="-1" class="doc"><h2>Article starts here</h2><p>{'Body text. ' * 300}</p></div></main>
<script type="module" src="/tmp-h/scene-hero.js"></script></body></html>"""

class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?')[0]
        if p.startswith('/tmp-h/'): return str(OUT / p[7:])
        if p.startswith('/static/'): return str(REPO / p[1:])
        return str(OUT / p.lstrip('/'))
    def log_message(self, *a): pass
class S(socketserver.ThreadingTCPServer): allow_reuse_address = True
httpd = S(('127.0.0.1', 0), H); port = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()
from playwright.sync_api import sync_playwright
CHROME = os.environ.get('CHROME_PATH')   # default: Playwright's own Chromium
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox']) if CHROME else pw.chromium.launch()
    for page in args:
        (OUT / f'{page}.html').write_text(page_html(page))
        for vw, vh in vps:
            pg = b.new_page(viewport={'width': vw, 'height': vh})
            errs = []; pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.on('response', lambda r: errs.append(f'{r.status} {r.url}') if r.status >= 400 else None)
            pg.goto(f'http://127.0.0.1:{port}/{page}.html', wait_until='networkidle')
            rng = pg.evaluate("document.querySelector('.scene').offsetHeight - innerHeight")
            for p in (0, 0.5, 1):
                pg.evaluate(f'window.scrollTo(0, {round(rng * p)})'); pg.wait_for_timeout(700)
                pg.screenshot(path=str(OUT / f'{page}-{vw}x{vh}-p{int(p * 100)}.png'))
            print(page, f'{vw}x{vh}', 'range', rng, 'errors:', errs or 'none')
            pg.close()
    b.close()
