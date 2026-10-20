"""Stand-alone preview of one new opening (no Astro build). Same markup as SceneHero.astro,
the real scene-hero.css and scene-hero.ts / scene-framing.ts (types stripped by Node >= 22.13).

    python3 tools/scene-art/subpage_preview.py hp-overview [--out ../preview/hp-overview]

Open <out>/index.html through any static server (python3 -m http.server). The night sky comes
from the homepage CDN address (offline it falls back to the plain night colour)."""
import html, json, math, re, shutil, subprocess, sys
from pathlib import Path
REPO = Path(__file__).resolve().parents[2]
page = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'hp-overview'
out = Path(sys.argv[sys.argv.index('--out') + 1]) if '--out' in sys.argv else REPO.parent / 'preview' / page
out.mkdir(parents=True, exist_ok=True)
strip = "const m=require('node:module');process.stdout.write(m.stripTypeScriptTypes(require('fs').readFileSync(process.argv[1],'utf8')))"
def ts(f):
    src = subprocess.run(['node', '-e', strip, f], cwd=REPO, capture_output=True, text=True, check=True).stdout
    return re.sub(r'^\s*import[^;]*;\s*$', '', src, flags=re.M).replace('export function', 'function').replace('export ', '')
js = ('const { sampleScene, cameraUnit } = (() => {\n' + ts('src/lib/scene-framing.ts') + '\nreturn { sampleScene, cameraUnit };\n})();\n'
      + ts('src/scripts/scene-hero.ts') + '\n')
(out / 'scene.js').write_text(js + 'initSceneHero();\n')
css = ''.join((REPO / f).read_text() for f in ('src/styles/tokens.css', 'src/styles/page.css', 'src/styles/scene-hero.css'))
L = json.loads((REPO / f'src/data/scenes/{page}.json').read_text()); A = json.loads((REPO / f'src/data/scenes/{page}.atlas.json').read_text())
W = json.loads((REPO / f'content/wiki/{page}.json').read_text())
shutil.copy(REPO / 'static/img/scenes/ground-strip.webp', out / 'ground-strip.webp')
pct = lambda n: f'{round(n, 4)}%'
sys.path.insert(0, str(REPO / 'tools/scene-art'))
import subpage_openings as SO
sets = []
for kind in ('desktop', 'mobile'):
    s, a = L[kind], A[kind]; shutil.copy(REPO / f'static/img/scenes/{a["file"]}', out / a['file'])
    url = f'{a["file"]}?v={a["hash"]}'; AW, AH = a['size']; layers = []
    l0, t0, r0, b0 = SO.sample(s['layers'], a['frames'], 0)
    frame = f'--frame-left:{max(1,-l0)};--frame-right:{max(1,r0)};--frame-top:{max(1,-t0)};--frame-bottom:{max(1,b0)}'
    for l in sorted(s['layers'], key=lambda l: l.get('z', 1)):
        fx, fy, fw, fh = a['frames'][l['prop']]; f = l['from']
        st = ';'.join([f"--x:{f['x']}", f"--y:{f['y']}", f"--w:{l['w']}", f"--h:{round(l['w'] * fh / fw, 2)}", f"--z:{l.get('z', 1)}",
                       f"--r:{f.get('r', 0)}deg", f"--s:{f.get('s', 1)}", f"--o:{f.get('o', 1)}",
                       f"background-size:{pct(AW / fw * 100)} {pct(AH / fh * 100)}",
                       f"background-position:{pct(0 if AW == fw else fx / (AW - fw) * 100)} {pct(0 if AH == fh else fy / (AH - fh) * 100)}"])
        mo = json.dumps({'f': l['from'], 't': l['to'], 'w': l['win'], 'd': l.get('depth', 0)})
        layers.append(f'<div class="scene__layer" data-scene-layer="{l["id"]}" data-motion="{html.escape(mo)}" style="{st}"></div>')
    t = s.get('title', {})
    ttl = html.escape(json.dumps({'y': t.get('y', 0), 'toY': t.get('toY', -200), 'toScale': t.get('toScale', .65)}))
    sets.append(f'<div class="scene__set scene__set--{kind}" aria-hidden="true" data-scene-set="{kind}" data-canvas="{",".join(map(str, s["canvas"]))}" '
                f'data-src="{url}" data-title="{ttl}" style="--cw:{s["canvas"][0]};--ch:{s["canvas"][1]};{frame};--atlas:url({url});--atlas-preview:url({a["preview"]})">{"".join(layers)}</div>')
title = W.get('heading') or W['title']; longest = max(len(w) for w in title.split())
cap = f' style="--h1-cap:calc(88vw / {longest * .56:.2f})"' if longest > 11 else ''
md = (REPO / f'src/content/pages/{page}.md').read_text().split('---', 2)[-1]
paras = [p.strip() for p in md.split('\n\n') if re.match(r'[A-Za-z\u4e00-\u9fff"(]', p.strip())][:3]
markup = re.compile(r"[*_`]|\[([^\]]*)\]\([^)]*\)|\{[^}]*\}")
clean_paras = [html.escape(markup.sub(lambda m: m.group(1) or "", p)) for p in paras]
body = ''.join(f'<p>{p}</p>' for p in clean_paras)
fs = ''.join(f';--title-size-{k[0]}:calc({L[k]["title"]["fontSize"]} * var(--u))' for k in ('desktop', 'mobile') if L[k].get('title', {}).get('fontSize'))
sky = 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-286c59c2d24c-opening-sky.webp'
style = A['desktop']['style'] + ' | ' + A['mobile']['style']
art_status = '程序临时图（PLACEHOLDER）待 GPT 重画' if 'PLACEHOLDER' in style else '已回填 GPT 素材'
(out / 'index.html').write_text(f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(title)} - opening preview</title><style>{css}
*{{box-sizing:border-box}} body{{margin:0;background:var(--paper)}}
.fake-nav{{position:fixed;top:0;left:0;right:0;height:var(--nav-h);z-index:50;background:rgba(27,15,34,.35);backdrop-filter:blur(14px) saturate(1.4);border-bottom:1px solid rgba(244,227,177,.15)}}
.badge{{position:fixed;right:12px;bottom:12px;z-index:60;max-width:min(70vw,520px);font:11px/1.35 system-ui;color:#f4e3b1;background:rgba(27,15,34,.82);padding:8px 12px;border-radius:10px}}
#content{{max-width:760px;margin:0 auto;padding:32px 22px 60vh;font:18px/1.65 Georgia,serif;color:#3a2f45}}</style></head><body>
<div class="fake-nav"></div><div class="badge">PREVIEW · {art_status} · {html.escape(style)}</div>
<main id="main"><section class="scene scene--preview" data-scene data-scene-preview="true" data-scene-portrait="(max-aspect-ratio: 4/5)" data-tone="dark" aria-labelledby="page-title"
style="--ground:url(ground-strip.webp);--sky:url({sky});--ty-d:{L['desktop']['title']['y']};--ty-m:{L['mobile']['title']['y']};--title-word-factor:{longest * .56:.2f}{fs}">
<div class="scene__stage"><div class="scene__floor" aria-hidden="true" data-scene-floor></div><div class="scene__ground" aria-hidden="true"></div>
<div class="scene__composition"><nav class="crumbs scene__crumbs" aria-label="Breadcrumb"><ol><li><a href="#">Home</a></li>{''.join(f'<li>{html.escape(c)}</li>' for c in W['crumbs'])}</ol></nav>
<div class="scene__art">{''.join(sets)}</div></div>
<div class="scene__title" data-scene-title><h1 id="page-title" class="scene__h1"{cap}>{html.escape(title)}</h1></div></div></section>
<div class="scene-tear" data-tone="light" aria-hidden="true"></div>
<article id="content"><p><em>正文摘录（只读，未改动）</em></p>{body}</article></main><script src="scene.js"></script></body></html>""")
print(f'preview -> {out}/index.html')
