const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/content.DRiRNI0K.js","_astro/search.Cext5raH.js","_astro/media.DM3pNE19.js","_astro/data.Cd9YICCw.js","_astro/narrative.Df6mSVFI.js","_astro/bio.CE0ohUt3.js"])))=>i.map(i=>d[i]);
import{i as se,g as N,w as fe,a as ge,r as he,s as me,t as ue,b as _e,c as be,d as ke}from"./search.Cext5raH.js";const ve="modulepreload",we=function(e){return"/"+e},ee={},H=function(r,t,n){let i=Promise.resolve();if(t&&t.length>0){let o=function(d){return Promise.all(d.map(g=>Promise.resolve(g).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const p=document.querySelector("meta[property=csp-nonce]"),s=p?.nonce||p?.getAttribute("nonce");i=o(t.map(d=>{if(d=we(d),d in ee)return;ee[d]=!0;const g=d.endsWith(".css"),l=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${l}`))return;const c=document.createElement("link");if(c.rel=g?"stylesheet":ve,g||(c.as="script"),c.crossOrigin="",c.href=d,s&&c.setAttribute("nonce",s),document.head.appendChild(c),g)return new Promise((m,x)=>{c.addEventListener("load",m),c.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(o){const p=new Event("vite:preloadError",{cancelable:!0});if(p.payload=o,window.dispatchEvent(p),!p.defaultPrevented)throw o}return i.then(o=>{for(const p of o||[])p.status==="rejected"&&a(p.reason);return r().catch(a)})},pe=`/* <wiki-toolkit> components. Loaded into every shadow root as one shared sheet.
   Colours and fonts inherit from the page (tokens.css) with fallbacks. */
:host {
  display: block; margin: 2rem 0;
  --k-ink: var(--ink, #241c2b); --k-ink2: var(--ink-2, #4a4152); --k-ink3: var(--ink-3, #6c6373);
  --k-paper: var(--paper, #f7f2e8); --k-surface: var(--paper-hi, #fbf8f1); --k-sunk: var(--paper-2, #efe6d6); --k-sunk2: var(--paper-3, #e7dcc8);
  --k-line: var(--line, rgba(36, 28, 43, .12)); --k-line2: var(--line-2, rgba(36, 28, 43, .07));
  --k-iris: var(--iris, #6e4fb8); --k-iris-deep: var(--iris-deep, #523a8c);
  --k-wash: color-mix(in srgb, var(--k-iris) 9%, var(--k-surface));
  --k-amber: var(--amber, #e2a23c); --k-rust: var(--rust, #b8561f); --k-loam: var(--loam, #191222); --k-cream: var(--cream, #f4ecdd);
  --k-teal: #2e8a7e;
  --k-font: var(--font-body, 'Spline Sans', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif);
  --k-mono: var(--font-mono, 'Space Mono', ui-monospace, Menlo, monospace);
  --k-r: 20px; --k-r2: 14px;
  --k-ease: cubic-bezier(.22, .61, .36, 1);
  color: var(--k-ink); font: 380 15.5px/1.65 var(--k-font); letter-spacing: .003em;
  -webkit-font-smoothing: antialiased;
}
*, *::before, *::after { box-sizing: border-box; }
p, h3, h4, ul, ol, dl, dd, figure, blockquote { margin: 0; }
button, input, select, textarea { font: inherit; color: inherit; }
img { max-width: 100%; }
[hidden] { display: none !important; }
:focus-visible { outline: 2.5px solid var(--k-iris); outline-offset: 2px; border-radius: 6px; }
.i { width: 18px; height: 18px; flex: none; }

/* ------------------------------------------------------------- frame */
.tk { background: var(--k-surface); border: 1px solid var(--k-line); border-radius: var(--k-r); container: tk / inline-size; }
.tk--bare { background: none; border: 0; }
.tk__head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; padding: 18px 22px 0; }
.tk__title { flex: 1 1 14ch; margin: 0; font-size: 18.5px; font-weight: 620; line-height: 1.3; letter-spacing: -.01em; color: var(--k-ink); text-wrap: balance; }
.tk__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-left: auto; }
.tk__body { padding: 16px 22px 22px; }
.tk--bare .tk__head { padding: 0 0 12px; }
.tk--bare .tk__body { padding: 0; }
.tk__cap { margin: 12px 2px 0; max-width: 72ch; font-size: 14px; line-height: 1.55; color: var(--k-ink3); }
.tk__error { display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; border-radius: 12px; background: #fbeee6; color: #8f3a12; font-size: 14px; white-space: pre-wrap; }
.tk__error .i { margin-top: 2px; }
@container tk (max-width: 520px) {
  .tk__head { padding: 14px 16px 0; }
  .tk__body { padding: 12px 16px 16px; }
  .tk__title { font-size: 17px; }
}

/* -------------------------------------------------------------- text */
h4 { font-size: 16.5px; font-weight: 620; line-height: 1.35; color: var(--k-ink); }
.rt { margin: 0 0 .7em; color: var(--k-ink2); text-wrap: pretty; overflow-wrap: anywhere; }
.rt:last-child, .rl:last-child { margin-bottom: 0; }
.rl { margin: 0 0 .7em; padding-left: 1.15em; color: var(--k-ink2); }
.rl li { margin: .25em 0; padding-left: .2em; }
.rl li::marker { color: var(--k-iris); }
strong, b { font-weight: 620; color: var(--k-ink); }
a { color: var(--k-iris-deep); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: color-mix(in srgb, var(--k-iris) 40%, transparent); }
a:hover { color: var(--k-iris); text-decoration-color: currentColor; }
code { padding: .1em .38em; border-radius: 6px; background: color-mix(in srgb, var(--k-iris) 9%, transparent); color: var(--k-iris-deep); font-family: var(--k-mono); font-size: .85em; }
.muted { color: var(--k-ink3); }
.small { font-size: 13px; }
.grow { flex: 1; }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; font-size: 13px; color: var(--k-ink3); }
.meta > span { display: inline-flex; align-items: center; gap: 5px; }
.meta .i { width: 15px; height: 15px; }
.fb__label { display: flex; align-items: center; gap: 5px; margin: 0 0 4px; font-size: 12.5px; font-weight: 600; color: var(--k-ink3); }
.go { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 14px; font-weight: 560; color: var(--k-iris-deep); text-decoration: none; }
.go .i { width: 16px; height: 16px; transition: transform .2s var(--k-ease); }
.go:hover { color: var(--k-iris); }
.go:hover .i { transform: translateX(2px); }
.empty { display: flex; align-items: center; gap: 10px; padding: 18px; border: 1.5px dashed var(--k-line); border-radius: var(--k-r2); color: var(--k-ink3); font-size: 14px; }
@keyframes tk-in { from { opacity: 0; transform: translateY(4px); } }

/* ----------------------------------------------------------- controls */
.btn { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 13px; border: 1px solid var(--k-line); border-radius: 999px; background: var(--k-surface); color: var(--k-ink2); font-size: 13.5px; font-weight: 520; line-height: 1; white-space: nowrap; text-decoration: none; cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
.btn .i { width: 16px; height: 16px; }
.btn:hover { border-color: color-mix(in srgb, var(--k-iris) 40%, transparent); background: var(--k-wash); color: var(--k-iris-deep); }
.btn--quiet { border-color: transparent; background: transparent; }
.btn--icon { width: 34px; padding: 0; justify-content: center; }
.btn[aria-pressed='true'] { border-color: color-mix(in srgb, var(--k-iris) 35%, transparent); background: var(--k-wash); color: var(--k-iris-deep); }
.btn:disabled { opacity: .35; cursor: default; pointer-events: none; }
.btn--next { border-color: transparent; background: var(--pc, var(--k-iris)); color: #fff; }
.btn--next:hover { border-color: transparent; background: color-mix(in srgb, var(--pc, var(--k-iris)) 84%, #000); color: #fff; }
.btn--dark { height: 30px; border-color: rgba(255, 255, 255, .12); background: rgba(255, 255, 255, .05); color: #e9e2f2; font-size: 12.5px; }
.btn--dark:hover { border-color: rgba(255, 255, 255, .25); background: rgba(255, 255, 255, .1); color: #fff; }

.seg { display: inline-flex; gap: 2px; max-width: 100%; padding: 4px; border-radius: 999px; background: var(--k-sunk); }
.seg__btn { padding: 7px 15px; border: 0; border-radius: 999px; background: none; color: var(--k-ink2); font-size: 14px; font-weight: 520; white-space: nowrap; cursor: pointer; transition: background .15s, color .15s; }
.seg__btn:hover { color: var(--k-ink); }
.seg__btn[aria-selected='true'], .seg__btn[aria-pressed='true'] { background: var(--k-surface); color: var(--k-ink); font-weight: 620; box-shadow: 0 1px 2px rgba(36, 28, 43, .14), 0 0 0 1px var(--k-line2); }
.seg--small { padding: 3px; }
.seg--small .seg__btn { padding: 5px 12px; font-size: 13px; }
.seg-scroll { margin: 0 -4px 16px; padding: 2px 4px; overflow-x: auto; scrollbar-width: none; }
.seg-scroll::-webkit-scrollbar { display: none; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.toolbar .chips { margin-bottom: 0; }
.chip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border: 1px solid var(--k-line); border-radius: 999px; background: transparent; color: var(--k-ink2); font-size: 13px; cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.chip:hover { border-color: color-mix(in srgb, var(--k-iris) 45%, transparent); color: var(--k-iris-deep); }
.chip[aria-pressed='true'] { border-color: var(--k-iris-deep); background: var(--k-iris-deep); color: #fff; }
.chip__sw { width: 8px; height: 8px; border-radius: 50%; }
.chip__n { font-size: 11.5px; font-variant-numeric: tabular-nums; opacity: .6; }

.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-bottom: 14px; }
.search { display: flex; flex: 0 1 280px; align-items: center; gap: 8px; min-width: min(100%, 200px); height: 36px; padding: 0 12px; border: 1px solid var(--k-line); border-radius: 12px; background: var(--k-paper); transition: border-color .15s, box-shadow .15s; }
.search:focus-within { border-color: var(--k-iris); box-shadow: 0 0 0 3px color-mix(in srgb, var(--k-iris) 16%, transparent); }
.search .i { width: 16px; height: 16px; color: var(--k-ink3); }
.search__input { flex: 1; min-width: 0; border: 0; outline: none; background: none; font-size: 14px; }
.search__input::-webkit-search-cancel-button { cursor: pointer; }

.pill { display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 10px; border-radius: 999px; background: color-mix(in srgb, var(--tone, var(--k-iris)) 12%, var(--k-surface)); color: color-mix(in srgb, var(--tone, var(--k-iris)) 76%, var(--k-ink)); font-size: 12.5px; font-weight: 540; white-space: nowrap; }
.pill .i { width: 13px; height: 13px; }
.pill--muted { --tone: #8a8290; }
.pill--amber { --tone: #b37414; }
.tone-iris { --tone: #6e4fb8; } .tone-teal { --tone: #2e8a7e; } .tone-amber { --tone: #b37414; } .tone-rust { --tone: #b8561f; }
.tone-slate { --tone: #4f6db0; } .tone-moss { --tone: #6b7a2c; } .tone-berry { --tone: #b2466f; } .tone-plain { --tone: #6c6373; }

/* --------------------------------------------------------------- tabs */
.tabs__panel { max-width: 70ch; animation: tk-in .25s var(--k-ease); }
.tabs__pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--k-line2); font-size: 13px; }
.tabs__pager:empty { display: none; }

/* ---------------------------------------------------------- accordion */
.acc { border-top: 1px solid var(--k-line); }
.acc__item { border-bottom: 1px solid var(--k-line); }
.acc__sum { display: flex; align-items: center; gap: 14px; padding: 14px 2px; font-size: 15.5px; font-weight: 580; color: var(--k-ink); list-style: none; cursor: pointer; }
.acc__sum::-webkit-details-marker { display: none; }
.acc__q { flex: 1; }
.acc__sum:hover .acc__q { color: var(--k-iris-deep); }
.acc__chev { width: 28px; height: 28px; padding: 6px; border-radius: 50%; background: var(--k-sunk); color: var(--k-iris-deep); transition: transform .25s var(--k-ease), background .2s, color .2s; }
details[open] > summary .acc__chev { transform: rotate(180deg); background: var(--k-iris); color: #fff; }
.acc__a { margin: 0 0 18px 2px; padding-left: 16px; border-left: 2px solid color-mix(in srgb, var(--k-iris) 30%, transparent); max-width: 70ch; animation: tk-in .25s var(--k-ease); }

/* ----------------------------------------------------------- protocol */
.proto { display: grid; gap: 22px; }
@container tk (min-width: 640px) { .proto--mats { grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); align-items: start; } }
.proto__mats { padding: 16px 18px; border-radius: var(--k-r2); background: var(--k-sunk); }
.proto__mats h4 { margin-bottom: 8px; font-size: 14px; }
.proto__mats ul { list-style: none; padding: 0; display: grid; gap: 4px; }
.proto__mats label { display: flex; align-items: flex-start; gap: 9px; font-size: 14px; line-height: 1.45; cursor: pointer; }
.proto__mats input { margin: 3px 0 0; accent-color: var(--k-iris); }
.proto__mats input:checked + span { color: var(--k-ink3); text-decoration: line-through; }
.proto__head { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.proto__count { font-size: 13px; color: var(--k-ink3); font-variant-numeric: tabular-nums; white-space: nowrap; }
.proto__bar { flex: 1; height: 6px; overflow: hidden; border-radius: 99px; background: var(--k-sunk); }
.proto__bar span { display: block; height: 100%; border-radius: inherit; background: var(--k-iris); transition: width .35s var(--k-ease); }
.proto__steps { list-style: none; margin: 0 0 10px; padding: 0; }
.proto__step { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--k-line2); }
.proto__tick { position: relative; width: 36px; height: 36px; cursor: pointer; }
.proto__box { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
.proto__n { display: grid; place-items: center; width: 36px; height: 36px; border: 1.5px solid color-mix(in srgb, var(--k-iris) 45%, transparent); border-radius: 50%; color: var(--k-iris-deep); font-size: 14px; font-weight: 650; transition: background .2s, color .2s, border-color .2s; }
.proto__tick:hover .proto__n { background: var(--k-wash); }
.proto__box:checked + .proto__n { border-color: var(--k-iris); background: var(--k-iris); color: #fff; }
.proto__box:focus-visible + .proto__n { outline: 2.5px solid var(--k-iris); outline-offset: 2px; }
.proto__step:has(.proto__box:checked) .proto__main { opacity: .5; }
.proto__top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; margin: 6px 0 4px; }

/* ---------------------------------------------------------- downloads */
.files { display: grid; gap: 8px; list-style: none; margin: 0; padding: 0; }
.file { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 12px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); transition: border-color .15s; }
.file:hover { border-color: var(--k-line); }
.file__kind { display: grid; place-items: end center; width: 48px; height: 56px; padding-bottom: 9px; border-radius: 7px; background: color-mix(in srgb, var(--tone) 15%, var(--k-surface)); color: color-mix(in srgb, var(--tone) 82%, #000); font: 700 10.5px/1 var(--k-mono); clip-path: polygon(0 0, 68% 0, 100% 24%, 100% 100%, 0 100%); }
.file__name { font-weight: 620; color: var(--k-ink); overflow-wrap: anywhere; }
.file__text .rt { margin-top: 2px; font-size: 14px; }
.file .meta { margin-top: 4px; }
@container tk (max-width: 480px) { .file { grid-template-columns: 42px minmax(0, 1fr); } .file > :last-child { grid-column: 2; justify-self: start; } .file__kind { width: 42px; height: 50px; } }

/* ----------------------------------------------------------- glossary */
.gl { display: grid; }
.gl__row { display: grid; grid-template-columns: minmax(110px, 26%) minmax(0, 1fr); gap: 4px 20px; padding: 12px 0; border-top: 1px solid var(--k-line2); }
.gl dt { font-weight: 620; color: var(--k-ink); }
@container tk (max-width: 520px) { .gl__row { grid-template-columns: 1fr; } }

/* --------------------------------------------------------------- flow */
.flow { display: grid; gap: 12px; list-style: none; margin: 0; padding: 0; }
.flow__step { position: relative; padding: 14px 16px 16px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.flow__top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.flow__n { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--k-iris); color: #fff; font-size: 13px; font-weight: 650; }
.flow__step h4 { margin-bottom: 6px; }
.flow__step .rt { font-size: 14.5px; }
.flow:not(.flow--row) .flow__step + .flow__step::before { content: ''; position: absolute; left: 29px; top: -13px; width: 2px; height: 12px; background: color-mix(in srgb, var(--k-iris) 40%, transparent); }
.flow--row { grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 20px; }
.flow--row .flow__step + .flow__step::before { content: ''; position: absolute; left: -15px; top: 24px; width: 9px; height: 9px; border-top: 2px solid var(--k-iris); border-right: 2px solid var(--k-iris); transform: rotate(45deg); }

/* ----------------------------------------------------------- criteria */
.crit { display: grid; gap: 20px; }
.crit__group { --medal: var(--k-iris); }
.medal-bronze { --medal: #a4673a; } .medal-silver { --medal: #858b95; } .medal-gold { --medal: #c09527; }
.crit__head { display: flex; align-items: center; gap: 10px; padding-bottom: 8px; border-bottom: 2px solid var(--medal); }
.crit__head h4 { flex: 1; }
.crit__medal { width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, .6) 0 18%, transparent 42%), var(--medal); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--medal) 70%, #000); }
.crit__list { list-style: none; margin: 0; padding: 0; }
.crit__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--k-line2); }
.crit__title { font-weight: 620; color: var(--k-ink); }
.crit__text .rt { font-size: 14.5px; }
.crit__row .go { flex: none; margin-top: 0; white-space: nowrap; }
@container tk (max-width: 520px) { .crit__row { flex-direction: column; gap: 4px; } }

/* -------------------------------------------------------------- quote */
.quote { position: relative; padding: 4px 0 4px 26px; border-left: 3px solid var(--k-amber); }
.quote__mark { width: 28px; height: 28px; margin-bottom: 6px; color: var(--k-iris); }
.quote__text .rt { font-size: clamp(19px, 2.6cqi, 24px); font-weight: 440; line-height: 1.45; letter-spacing: -.005em; color: var(--k-ink); }
.quote__by { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; }
.quote__by strong { display: block; }
.quote__by .muted { font-size: 13.5px; }
.quote__by .go { margin: 0 0 0 auto; }
.quote__photo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.quote__photo--empty { display: grid; place-items: center; background: var(--k-wash); color: var(--k-iris-deep); font-weight: 620; }

/* --------------------------------------------------------------- code */
.code { position: relative; overflow: hidden; border-radius: var(--k-r2); background: var(--k-loam); color: #e9e2f2; }
.code__bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 7px 8px 7px 16px; border-bottom: 1px solid rgba(255, 255, 255, .08); font-size: 13px; }
.code__file { color: #fff; font-family: var(--k-mono); font-size: 12.5px; }
.code__lang { padding: 2px 8px; border-radius: 99px; background: rgba(155, 127, 224, .22); color: #cdbff5; font-size: 11.5px; }
.code__lines { margin-left: auto; color: rgba(244, 236, 221, .45); font-size: 12px; }
.code__pre { margin: 0; padding: 14px 0; overflow: auto; font: 13px/1.7 var(--k-mono); tab-size: 4; counter-reset: ln; }
.code__pre code { display: block; min-width: max-content; padding: 0; border-radius: 0; background: none; color: inherit; font: inherit; }
.code__line { display: block; padding-right: 18px; white-space: pre; }
.code__line::before { content: counter(ln); counter-increment: ln; display: inline-block; width: 3.4em; padding-right: 1.2em; color: rgba(244, 236, 221, .26); text-align: right; user-select: none; }
.tok-c { color: #978fa6; font-style: italic; } .tok-s { color: #f2c879; } .tok-n { color: #6ff3de; } .tok-k { color: #c3b0ff; }
.code--clip .code__pre { max-height: 420px; overflow: hidden; -webkit-mask-image: linear-gradient(#000 78%, transparent); mask-image: linear-gradient(#000 78%, transparent); }
.code__more { display: flex; justify-content: center; align-items: center; gap: 6px; width: 100%; padding: 10px; border: 0; border-top: 1px solid rgba(255, 255, 255, .08); background: rgba(255, 255, 255, .03); color: #cdbff5; font-size: 13px; cursor: pointer; }
.code__more:hover { background: rgba(255, 255, 255, .07); }
.code__more .i { width: 16px; }
.code__cmd { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 6px 6px 6px 14px; border-radius: 12px; background: var(--k-sunk); }
.code__cmd > .i { color: var(--k-iris); }
.code__cmd code { flex: 1; overflow-x: auto; padding: 0; background: none; color: var(--k-ink); font-size: 13px; white-space: nowrap; }
.code__repo .go { margin-top: 12px; }

/* ----------------------------------------------------------- lightbox */
.lb { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 168px), 1fr)); gap: 10px; }
.lb--feature { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.lb--feature .lb__tile:first-child { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; }
@container tk (max-width: 520px) { .lb--feature { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lb__tile { position: relative; display: block; width: 100%; aspect-ratio: 4 / 3; padding: 0; overflow: hidden; border: 0; border-radius: 12px; background: var(--k-sunk); cursor: zoom-in; }
.lb__tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--k-ease); }
.lb__tile:hover img { transform: scale(1.03); }
.lb__label { position: absolute; inset: auto 0 0; padding: 26px 12px 9px; background: linear-gradient(transparent, rgba(25, 18, 34, .74)); color: #fff; font-size: 13px; font-weight: 520; text-align: left; }
.lb__zoom { position: absolute; top: 8px; right: 8px; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: rgba(251, 248, 241, .92); color: var(--k-ink); opacity: 0; transition: opacity .2s; }
.lb__zoom .i { width: 15px; height: 15px; }
.lb__tile:hover .lb__zoom, .lb__tile:focus-visible .lb__zoom { opacity: 1; }
.lb__dlg { width: min(96vw, 1200px); max-height: 94vh; padding: 0; overflow: hidden; border: 0; border-radius: 18px; background: var(--k-loam); color: var(--k-cream); }
.lb__dlg::backdrop { background: rgba(14, 9, 20, .82); backdrop-filter: blur(4px); }
.lb__stage { position: relative; display: grid; place-items: center; min-height: 40vh; background: #120c19; }
.lb__img { display: block; max-width: 100%; max-height: 76vh; object-fit: contain; }
.lb__nav { position: absolute; top: 50%; translate: 0 -50%; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: rgba(251, 248, 241, .14); color: #fff; cursor: pointer; }
.lb__nav:hover { background: rgba(251, 248, 241, .28); }
.lb__nav--prev { left: 12px; } .lb__nav--next { right: 12px; }
.lb__foot { display: flex; align-items: flex-start; gap: 16px; padding: 14px 16px 16px 20px; }
.lb__caption { flex: 1; color: rgba(244, 236, 221, .78); font-size: 14px; line-height: 1.55; }
.lb__caption strong { display: block; margin-bottom: 2px; color: #fff; }
.lb__count { padding-top: 3px; color: rgba(244, 236, 221, .6); font: 12px var(--k-mono); white-space: nowrap; }
.lb__close { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid rgba(255, 255, 255, .2); border-radius: 50%; background: none; color: #fff; cursor: pointer; }
.lb__close:hover { background: rgba(255, 255, 255, .1); }

/* --------------------------------------------------------- comparison */
.cmp { --pos: 50%; position: relative; overflow: hidden; aspect-ratio: 16 / 10; border-radius: var(--k-r2); background: var(--k-sunk); user-select: none; }
.cmp__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.cmp__before { position: absolute; inset: 0; clip-path: inset(0 calc(100% - var(--pos)) 0 0); }
.cmp__handle { position: absolute; top: 0; bottom: 0; left: var(--pos); width: 2px; margin-left: -1px; background: #fff; box-shadow: 0 0 0 1px rgba(36, 28, 43, .16); pointer-events: none; }
.cmp__knob { position: absolute; top: 50%; left: 50%; translate: -50% -50%; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; background: #fff; color: var(--k-iris-deep); box-shadow: 0 6px 18px -6px rgba(36, 28, 43, .5); }
.cmp__knob .i { width: 14px; height: 14px; margin: 0 -2px; }
.cmp__tag { position: absolute; top: 12px; padding: 4px 10px; border-radius: 999px; background: rgba(25, 18, 34, .68); color: #fff; font-size: 12.5px; font-weight: 520; pointer-events: none; backdrop-filter: blur(4px); }
.cmp__tag--l { left: 12px; } .cmp__tag--r { right: 12px; }
.cmp__range { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ew-resize; }
.cmp:has(.cmp__range:focus-visible) { outline: 2.5px solid var(--k-iris); outline-offset: 3px; }
.cmp__hint { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 10px; }
.cmp__hint .i { width: 14px; height: 14px; }

/* -------------------------------------------------------------- video */
.vid { overflow: hidden; border-radius: var(--k-r2); background: var(--k-loam); }
.vid__player { display: block; width: 100%; max-height: 70vh; background: var(--k-loam); }
.vid + .tk__error, .vid ~ .muted { margin-top: 10px; }

/* ----------------------------------------------------------- hotspots */
.hs { display: grid; gap: 16px; }
@container tk (min-width: 700px) { .hs:not(.hs--solo) { grid-template-columns: minmax(0, 1.55fr) minmax(220px, 1fr); align-items: start; } }
.hs__stage { position: relative; overflow: hidden; border-radius: var(--k-r2); background: var(--k-sunk); }
.hs__img { display: block; width: 100%; height: auto; }
.hs__pin { position: absolute; translate: -50% -50%; width: 28px; height: 28px; padding: 0; border: 2px solid #fff; border-radius: 50%; background: var(--k-iris); color: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px -2px rgba(25, 18, 34, .55); transition: transform .2s var(--k-ease), background .2s; }
.hs__pin:hover { transform: scale(1.1); }
.hs__pin[aria-pressed='true'] { transform: scale(1.2); background: var(--k-amber); color: var(--k-ink); }
.hs__list { display: grid; gap: 2px; max-height: 520px; overflow: auto; list-style: none; margin: 0; padding: 0; }
.hs__row { border-radius: 12px; transition: background .2s; }
.hs__row.is-on { background: var(--k-wash); }
.hs__rowbtn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: 0; background: none; color: var(--k-ink); font-weight: 600; text-align: left; cursor: pointer; }
.hs__n { display: grid; flex: none; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--k-iris); color: #fff; font-size: 12px; }
.is-on .hs__n { background: var(--k-amber); color: var(--k-ink); }
.hs__text { padding: 0 12px 10px 44px; }
.hs__text .rt { font-size: 14px; }

/* ------------------------------------------------------ charts / maps */
.chart__legend { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.legend { display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 11px 0 9px; border: 1px solid var(--k-line2); border-radius: 999px; background: var(--k-paper); color: var(--k-ink2); font-size: 13px; }
button.legend { cursor: pointer; }
button.legend:hover { border-color: var(--k-line); }
button.legend[aria-pressed='false'] { opacity: .45; text-decoration: line-through; }
.legend__sw { width: 10px; height: 10px; border-radius: 3px; }
.legend__err { color: var(--k-ink3); font-size: 11.5px; }
.chart__plot { position: relative; }
.chart__svg, .hm__svg { display: block; width: 100%; height: auto; overflow: visible; font-family: var(--k-font); }
.chart__tip { position: absolute; top: 0; left: 0; z-index: 2; display: grid; gap: 3px; min-width: 140px; max-width: 280px; padding: 9px 11px; border-radius: 12px; background: rgba(25, 18, 34, .95); color: #f4ecdd; font-size: 12.5px; line-height: 1.4; pointer-events: none; box-shadow: 0 12px 28px -12px rgba(25, 18, 34, .6); }
.chart__tip strong { margin-bottom: 2px; color: #fff; }
.chart__tiprow { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.chart__tiprow i { width: 10px; height: 10px; border-radius: 3px; }
.chart__tiprow b { color: #fff; font-weight: 600; font-variant-numeric: tabular-nums; }
.chart__data { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--k-line2); }

/* -------------------------------------------------------------- tables */
.dt__scroll { max-height: 560px; overflow: auto; border: 1px solid var(--k-line); border-radius: var(--k-r2); background: var(--k-surface); }
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }
.dt th { position: sticky; top: 0; z-index: 1; padding: 10px 14px; border-bottom: 1px solid var(--k-line); background: var(--k-sunk); color: var(--k-ink); font-size: 13px; font-weight: 620; text-align: left; white-space: nowrap; }
.dt th:has(.dt__sort) { padding: 0; }
.dt__sort { display: flex; align-items: center; gap: 4px; width: 100%; padding: 10px 14px; border: 0; background: none; font-weight: 620; text-align: left; cursor: pointer; }
th.num .dt__sort { justify-content: flex-end; }
.dt__arrow { width: 14px; height: 14px; opacity: 0; transition: opacity .2s, transform .2s; }
th:hover .dt__arrow { opacity: .35; }
th[aria-sort='ascending'] .dt__arrow { opacity: 1; transform: rotate(180deg); }
th[aria-sort='descending'] .dt__arrow { opacity: 1; }
.dt td { padding: 9px 14px; border-bottom: 1px solid var(--k-line2); color: var(--k-ink2); vertical-align: top; }
.dt tr:last-child td { border-bottom: 0; }
.dt td:first-child { color: var(--k-ink); font-weight: 520; }
.dt tbody tr:hover td { background: color-mix(in srgb, var(--k-iris) 4%, transparent); }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.dt__none { color: var(--k-ink3); text-align: center !important; }
.dt__pager { display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin-top: 10px; }

/* ------------------------------------------------------------- matrix */
.mx th, .mx td { padding: 11px 14px; border-bottom: 1px solid var(--k-line2); text-align: left; }
.mx tr:last-child > * { border-bottom: 0; }
.mx thead th { position: sticky; top: 0; background: var(--k-sunk); color: var(--k-ink); font-size: 13px; font-weight: 620; }
.mx tbody th { color: var(--k-ink); font-weight: 620; white-space: nowrap; }
.mx tbody th .pill { margin-left: 8px; }
.mx td { color: var(--k-ink2); }
.mx .num { text-align: center; }
.mx .is-chosen > * { background: color-mix(in srgb, var(--k-amber) 13%, var(--k-surface)); }
.mx .is-chosen > th { box-shadow: inset 3px 0 0 var(--k-amber); }
.mx__sym { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; vertical-align: middle; }
.mx__sym .i { width: 15px; height: 15px; stroke-width: 2.6; }
.mx__sym--yes { background: color-mix(in srgb, var(--k-teal) 16%, var(--k-surface)); color: var(--k-teal); }
.mx__sym--no { background: color-mix(in srgb, var(--k-rust) 14%, var(--k-surface)); color: var(--k-rust); }
.mx__sym--part { background: color-mix(in srgb, var(--k-amber) 22%, var(--k-surface)); color: #8f5d10; }
.mx__rate { display: inline-flex; gap: 3px; vertical-align: middle; }
.mx__rate i { width: 9px; height: 9px; border-radius: 50%; background: var(--k-sunk2); }
.mx__rate i.on { background: var(--k-iris); }
.mx__rate i.half { background: linear-gradient(90deg, var(--k-iris) 50%, var(--k-sunk2) 50%); }
.mx__key { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; }
.mx__key > span { display: inline-flex; align-items: center; gap: 6px; }
.mx__key .mx__sym { width: 20px; height: 20px; }

/* --------------------------------------------------- equation / params */
.eq { display: flex; align-items: center; gap: 16px; padding: 18px 12px; border-radius: var(--k-r2); background: var(--k-paper); }
.eq__scroll { flex: 1; min-width: 0; overflow-x: auto; overflow-y: hidden; }
.eq__math .katex-display { margin: 0; }
.eq__math .katex { font-size: 1.12em; }
.eq__label { color: var(--k-ink3); font-size: 14px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pm__sym { color: var(--k-ink); font-size: 1.06em; white-space: nowrap; }
.pm__sym--plain { font-style: italic; }
.pm__unit { color: var(--k-ink3); white-space: nowrap; }
.pm td:nth-child(2) { min-width: 11em; }
.pm__ref { display: inline-flex; margin-left: 6px; color: var(--k-iris); vertical-align: middle; }
.pm__ref .i { width: 15px; height: 15px; }

/* ------------------------------------------------------------ sequence */
.seq__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; margin-bottom: 10px; }
.seq__name { color: var(--k-ink); font: 700 12.5px var(--k-mono); }
.seq__stats { display: flex; flex-wrap: wrap; gap: 4px 14px; color: var(--k-ink3); font-size: 13px; }
.seq__stats b { font-variant-numeric: tabular-nums; }
.seq__legend { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.seq__legend .muted { font-size: 12px; font-variant-numeric: tabular-nums; }
.seq__pre { max-height: 420px; margin: 0; padding: 14px 16px; overflow: auto; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); color: var(--k-ink2); font: 13.5px/1.95 var(--k-mono); white-space: pre; }
.seq__pos { margin-right: 1.4ch; color: rgba(108, 99, 115, .55); user-select: none; }
mark { border-radius: 3px; background: none; color: inherit; }
.seq__feat { background: color-mix(in srgb, var(--fc) 18%, transparent); box-shadow: inset 0 -2px 0 var(--fc); }
.seq__hit { background: #ffe19a; box-shadow: none; color: var(--k-ink); }
.seq__hit--now { background: var(--k-amber); outline: 2px solid #8f5d10; }

/* -------------------------------------------------------------- cycle */
.cyc { display: grid; align-items: center; gap: 20px; }
@container tk (min-width: 620px) { .cyc { grid-template-columns: 248px minmax(0, 1fr); } }
.cyc__ring { display: block; width: min(100%, 248px); margin: 0 auto; overflow: visible; font-family: var(--k-font); }
.cyc__arc { cursor: pointer; outline: none; }
.cyc__arc path { fill: color-mix(in srgb, var(--pc) 15%, #fbf8f1); stroke: color-mix(in srgb, var(--pc) 38%, transparent); stroke-width: 1; transform-origin: 120px 120px; transition: fill .25s, transform .35s var(--k-ease); }
.cyc__arc:hover path { fill: color-mix(in srgb, var(--pc) 28%, #fbf8f1); }
.cyc__arc[aria-pressed='true'] path { fill: var(--pc); stroke: var(--pc); transform: scale(1.04); }
.cyc__arc.is-empty path { fill: #fbf8f1; stroke-dasharray: 4 3; }
.cyc__arc:focus-visible path { stroke: var(--k-ink); stroke-width: 2.5; }
.cyc__en { fill: color-mix(in srgb, var(--pc) 78%, #241c2b); font-size: 13px; font-weight: 650; pointer-events: none; }
.cyc__arc[aria-pressed='true'] .cyc__en { fill: #fff; }
.cyc__chev { fill: none; stroke: var(--k-ink3); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.cyc__round { fill: var(--k-ink); font-size: 15px; font-weight: 650; }
.cyc__phase { fill: var(--k-ink3); font-size: 12.5px; }
.cyc__panel { --pc: var(--k-iris); display: flex; flex-direction: column; min-height: 230px; padding: 16px 18px; border: 1px solid var(--k-line2); border-top: 3px solid var(--pc); border-radius: var(--k-r2); background: var(--k-paper); transition: border-color .25s; }
.cyc__phead { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin-bottom: 10px; }
.cyc__phead .muted { margin-left: auto; }
.cyc__badge { padding: 3px 9px; border-radius: 999px; background: var(--pc); color: #fff; font-size: 12px; font-weight: 650; }
.cyc__pbody { flex: 1; }
.cyc__pbody > * { animation: tk-in .25s var(--k-ease); }
.cyc__pfoot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--k-line2); }
.cyc__pfoot .go { margin: 0; }

/* ----------------------------------------------------------- feedback */
.fb { display: grid; gap: 14px; list-style: none; margin: 0; padding: 0; }
.fb__row { padding: 12px 14px 14px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.fb__meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.fb__n { color: var(--k-iris-deep); font: 700 12px var(--k-mono); }
.fb__grid { display: grid; gap: 6px; }
.fb__cell { padding: 10px 12px; border-radius: 12px; background: var(--k-surface); }
.fb__cell .rt { font-size: 14.5px; }
.fb__who { color: var(--k-ink); font-size: 14.5px; font-weight: 620; }
.fb__change { background: var(--k-wash); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--k-iris) 24%, transparent); }
.fb__change .fb__label { color: var(--k-iris-deep); }
.fb__arrow { display: grid; place-items: center; color: color-mix(in srgb, var(--k-iris) 55%, transparent); }
.fb__arrow .i { width: 18px; transform: rotate(90deg); }
.fb__ev .go { margin-top: 6px; font-size: 13.5px; }
@container tk (min-width: 760px) {
  .fb__grid { grid-template-columns: minmax(0, .8fr) 20px minmax(0, 1.1fr) 20px minmax(0, 1.2fr) 20px minmax(0, 1fr); gap: 4px; }
  .fb__arrow .i { transform: none; }
}

/* ------------------------------------------------------- stakeholders */
.sh { display: grid; gap: 18px; }
@container tk (min-width: 680px) { .sh { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); align-items: start; } }
.sh__plot { display: block; width: 100%; max-width: 420px; height: auto; margin: 0 auto; font-family: var(--k-font); }
.sh__q { fill: var(--k-ink3); font-size: 11.5px; font-weight: 520; }
.sh__axis { fill: var(--k-ink2); font-size: 12px; font-weight: 620; }
.sh__dot { cursor: pointer; outline: none; transition: opacity .2s; }
.sh__dot circle { fill: var(--gc); stroke: #fbf8f1; stroke-width: 2.5; transition: r .2s; }
.sh__dot text { fill: #fff; font-size: 11px; font-weight: 700; pointer-events: none; }
.sh__dot:hover circle { r: 14px; }
.sh__dot[aria-pressed='true'] circle { r: 14.5px; stroke: #241c2b; }
.sh__dot:focus-visible circle { stroke: #241c2b; stroke-width: 3; }
.sh__dot.is-dim { opacity: .18; }
.sh__side { display: grid; gap: 14px; }
.sh__detail { min-height: 160px; padding: 16px 18px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.sh__detail > * + * { margin-top: 8px; }
.sh__dhead { display: flex; align-items: center; gap: 10px; }
.sh__n { display: inline-grid; flex: none; place-items: center; width: 22px; height: 22px; border-radius: 50%; color: #fff; font-size: 11px; font-weight: 700; }
.sh__list { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 0; padding: 0; }
.sh__item { display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px 4px 5px; border: 1px solid var(--k-line2); border-radius: 999px; background: none; color: var(--k-ink2); font-size: 13px; cursor: pointer; }
.sh__item:hover { border-color: var(--k-line); }
.sh__item[aria-current='true'] { border-color: var(--k-ink); color: var(--k-ink); font-weight: 620; }

/* ---------------------------------------------------------- interview */
.iv { display: grid; gap: 18px; }
.iv__head { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.iv__photo { flex: none; width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
.iv__photo--empty { display: grid; place-items: center; background: var(--k-wash); color: var(--k-iris-deep); font-size: 18px; font-weight: 620; }
.iv__who { flex: 1; min-width: 12ch; }
.iv__name { color: var(--k-ink); font-size: 17px; font-weight: 650; }
.iv__who .muted { font-size: 13.5px; }
.iv__quote { position: relative; padding: 2px 0 2px 44px; }
.iv__mark { position: absolute; top: 2px; left: 0; width: 30px; height: 30px; color: var(--k-amber); }
.iv__quote .rt { color: var(--k-ink); font-size: 20px; font-weight: 440; line-height: 1.5; }
.iv__cols { display: grid; gap: 12px; }
@container tk (min-width: 600px) { .iv__cols { grid-template-columns: 1fr 1fr; } }
.iv__take, .iv__impact { padding: 14px 16px; border-radius: var(--k-r2); }
.iv__take { border: 1px solid var(--k-line2); background: var(--k-paper); }
.iv__impact { border: 1px solid color-mix(in srgb, var(--k-iris) 22%, transparent); background: var(--k-wash); }
.iv__take h4, .iv__impact h4 { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 14px; }
.iv__impact h4 .i { width: 17px; color: var(--k-iris); }
.iv__take ul { display: grid; gap: 6px; list-style: none; padding: 0; }
.iv__take li { display: flex; gap: 8px; color: var(--k-ink2); font-size: 14.5px; }
.iv__take li .i { width: 16px; height: 16px; margin-top: 4px; color: var(--k-teal); }
.iv__qa { border-top: 1px solid var(--k-line); }
.iv__qa summary { display: flex; align-items: center; justify-content: space-between; padding: 14px 0 6px; font-weight: 620; list-style: none; cursor: pointer; }
.iv__qa summary::-webkit-details-marker { display: none; }
.iv__qa dl { display: grid; gap: 14px; margin-top: 6px; }
.iv__pair dt { display: flex; gap: 10px; color: var(--k-ink); font-weight: 620; }
.iv__q { padding-top: 3px; color: var(--k-iris); font: 700 12px var(--k-mono); }
.iv__pair dd { margin: 4px 0 0 34px; }

/* --------------------------------------------------------- chronology */
.chr { position: relative; list-style: none; margin: 0; padding: 0; }
.chr__item { position: relative; display: grid; grid-template-columns: 112px 18px minmax(0, 1fr); grid-template-areas: 'date dot main'; gap: 0 14px; padding-bottom: 22px; }
.chr__item::before { content: ''; position: absolute; top: 16px; bottom: -4px; left: calc(112px + 14px + 8px); width: 2px; background: var(--k-line); }
.chr__item:last-child::before { display: none; }
.chr__date { grid-area: date; padding-top: 2px; color: var(--k-ink3); font-size: 13px; font-weight: 620; font-variant-numeric: tabular-nums; text-align: right; }
.chr__dot { position: relative; z-index: 1; grid-area: dot; width: 14px; height: 14px; margin: 5px 2px 0; border: 3px solid var(--tone); border-radius: 50%; background: var(--k-surface); }
.chr__main { grid-area: main; }
.chr__main .pill { margin-bottom: 6px; }
.chr__main h4 { margin-bottom: 4px; }
.chr__main .rt { font-size: 14.5px; }
.chr__main .go { margin-top: 4px; font-size: 13.5px; }
@container tk (max-width: 520px) {
  .chr__item { grid-template-columns: 18px minmax(0, 1fr); grid-template-areas: 'dot date' '. main'; }
  .chr__item::before { left: 8px; }
  .chr__date { text-align: left; }
}

/* ----------------------------------------------------------- activity */
.act__sum { display: flex; flex-wrap: wrap; gap: 8px 28px; margin-bottom: 14px; }
.act__sum p { display: flex; align-items: baseline; gap: 6px; color: var(--k-ink3); font-size: 13.5px; }
.act__sum b { color: var(--k-iris-deep); font-size: 28px; font-weight: 620; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.act { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 14px; }
.act__card { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.act__media { display: grid; place-items: center; aspect-ratio: 16 / 10; background: var(--k-sunk); }
.act__media img { width: 100%; height: 100%; object-fit: cover; }
.act__media--none { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--tone) 9%, #fbf8f1) 0 10px, color-mix(in srgb, var(--tone) 15%, #fbf8f1) 10px 20px); color: var(--tone); }
.act__media--none .i { width: 34px; height: 34px; }
.act__body { display: grid; align-content: start; gap: 8px; padding: 14px 16px 16px; }
.act__text .rt { font-size: 14px; }
.act__fb { padding: 10px 12px; border-left: 3px solid var(--k-amber); border-radius: 10px; background: var(--k-surface); }
.act__fb .rt { font-size: 13.5px; }
.act__body .go { margin-top: 2px; }

/* --------------------------------------------------------------- risk */
.rk { display: grid; gap: 20px; }
@container tk (min-width: 700px) { .rk { grid-template-columns: minmax(250px, 330px) minmax(0, 1fr); align-items: start; } }
.rk__matrix { display: grid; gap: 6px; }
.rk__ylab { color: var(--k-ink2); font-size: 12px; font-weight: 620; }
.rk__grid { display: grid; grid-template-columns: 16px repeat(5, minmax(0, 1fr)); gap: 3px; }
.rk__ax { display: grid; place-items: center; color: var(--k-ink3); font-size: 11px; }
.rk__cell { display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 2px; aspect-ratio: 1; padding: 2px; border-radius: 6px; }
.rk__mark { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; background: var(--k-ink); color: var(--k-surface); font-size: 11px; font-weight: 700; cursor: pointer; }
.rk__mark[aria-pressed='true'] { background: var(--k-iris); box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--k-iris); }
.rk__xlab { color: var(--k-ink2); font-size: 12px; font-weight: 620; text-align: right; }
.rk__key { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 12px; color: var(--k-ink3); font-size: 12px; }
.rk__key span { display: inline-flex; align-items: center; gap: 5px; }
.rk__key i { width: 12px; height: 12px; border-radius: 3px; }
.rk__list { display: grid; gap: 8px; }
.rk__row { border: 1px solid var(--k-line2); border-radius: 12px; background: var(--k-paper); transition: border-color .2s; }
.rk__row.is-on { border-color: color-mix(in srgb, var(--k-iris) 50%, transparent); }
.rk__row summary { display: flex; align-items: center; gap: 10px; padding: 10px 12px; list-style: none; cursor: pointer; }
.rk__row summary::-webkit-details-marker { display: none; }
.rk__row .acc__chev { width: 26px; height: 26px; padding: 5px; }
.rk__n { display: grid; flex: none; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--k-ink); color: var(--k-surface); font-size: 11.5px; font-weight: 700; }
.rk__t { flex: 1; color: var(--k-ink); font-size: 14.5px; font-weight: 620; }
.rk__score { padding: 2px 9px; border-radius: 999px; color: var(--k-ink); font-size: 12px; font-weight: 620; white-space: nowrap; }
.rk__body { display: grid; gap: 10px; padding: 0 14px 14px 46px; }
.rk__body .rt { font-size: 14.5px; }
.rk__mit { padding: 10px 12px; border-radius: 10px; background: color-mix(in srgb, var(--k-teal) 8%, var(--k-surface)); }
.rk__mit .fb__label { color: #2a7068; }
.rk__mit .i { width: 15px; height: 15px; }

/* ------------------------------------------------------------ members */
.mb { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px 28px; }
.mb__group { flex: 0 1 calc(var(--n, 1) * 176px + (var(--n, 1) - 1) * 14px); min-width: min(100%, 150px); max-width: 100%; }
.mb__ghead { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--k-line2); font-size: 14px; }
.mb__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 14px; }
.mb__card { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.mb__photo { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; background: var(--k-sunk); }
.mb__photo--empty { display: grid; place-items: center; background: radial-gradient(circle at 30% 22%, color-mix(in srgb, var(--k-iris) 17%, #fbf8f1), color-mix(in srgb, var(--k-iris) 7%, #efe6d6)); color: var(--k-iris-deep); font-size: 34px; font-weight: 620; }
.mb__info { display: grid; align-content: start; gap: 6px; padding: 12px 14px 14px; }
.mb__name { font-size: 16px; }
.mb__name a { color: var(--k-ink); text-decoration: none; }
.mb__name a:hover { color: var(--k-iris-deep); text-decoration: underline; }
.mb__id { color: var(--k-iris-deep); font-size: 13px; font-weight: 560; }
.mb__tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { height: 24px; padding: 0 9px; border: 0; border-radius: 999px; background: var(--k-sunk); color: var(--k-ink2); font-size: 12px; cursor: pointer; }
.tag:hover { background: var(--k-wash); color: var(--k-iris-deep); }
.mb__text .rt { font-size: 13.5px; line-height: 1.55; }

/* ------------------------------------------------------- attributions */
.at__table th, .at__table td { padding: 8px 10px; border-bottom: 1px solid var(--k-line2); text-align: center; }
.at__table thead th { position: sticky; top: 0; z-index: 2; background: var(--k-sunk); color: var(--k-ink); font-size: 12.5px; font-weight: 620; vertical-align: bottom; }
.at__cat span { display: block; min-width: 4.5em; max-width: 7.5em; margin: 0 auto; line-height: 1.3; }
.at__table .at__corner { left: 0; z-index: 3; color: var(--k-ink3); font-weight: 500; text-align: left; }
.at__table tbody th { position: sticky; left: 0; z-index: 1; background: var(--k-surface); color: var(--k-ink); font-weight: 620; text-align: left; white-space: nowrap; }
.at__name { display: block; font-size: 14px; }
.at__aff { display: block; color: var(--k-ink3); font-size: 12px; font-weight: 400; }
.at__table tbody tr:hover > * { background: color-mix(in srgb, var(--k-iris) 5%, var(--k-surface)); }
.at__dot { width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; background: var(--tone); cursor: pointer; transition: transform .15s; }
.at__dot:hover { transform: scale(1.18); }
.at__dot[aria-pressed='true'] { box-shadow: 0 0 0 3px var(--k-surface), 0 0 0 5px var(--k-ink); }
.at__none { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--k-line); }
.at__detail { min-height: 64px; margin-top: 12px; padding: 14px 16px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.at__dhead { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 6px; }
.at__rec + .at__rec { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--k-line); }
.at__cats { display: grid; gap: 14px; }
@container tk (min-width: 640px) { .at__cats { grid-template-columns: 1fr 1fr; } }
.at__catsec { padding: 14px 16px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.at__catsec h4 { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.at__sw { width: 10px; height: 10px; border-radius: 50%; background: var(--tone); }
.at__catsec ul { display: grid; gap: 10px; list-style: none; margin: 0; padding: 0; }
.at__who { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; font-size: 14px; }
.at__catsec .rt { font-size: 14px; }

/* -------------------------------------------------------------- parts */
.pt__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 232px), 1fr)); gap: 12px; }
.pt__card { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.pt__top { display: flex; align-items: center; gap: 12px; }
.pt__ids { flex: 1; min-width: 0; }
.pt__top .pill { align-self: flex-start; }
.glyph-tile { flex: none; width: 44px; height: 44px; border: 1px solid var(--k-line2); border-radius: 10px; background: var(--k-surface); }
.pt__code { color: var(--k-ink); font: 700 12.5px/1.4 var(--k-mono); overflow-wrap: anywhere; }
.pt__name { font-size: 16px; }
.pt__role { display: grid; gap: 1px; color: var(--k-ink2); font-size: 13.5px; }
.pt__role .fb__label { margin: 0; }
.pt__text .rt { font-size: 14px; }
.pt__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--k-line2); }
.pt__cell { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.pt__cell .glyph-tile { width: 26px; height: 26px; border-radius: 6px; }

/* ---------------------------------------------------------- construct */
.ct__scroll { overflow-x: auto; padding: 2px 0; }
.ct__svg { display: block; max-width: none; margin: 0 auto; font-family: var(--k-font); }
.ct__part { cursor: pointer; outline: none; }
.ct__hit { fill: transparent; transition: fill .2s; }
.ct__part:hover .ct__hit { fill: color-mix(in srgb, var(--k-iris) 6%, transparent); }
.ct__part[aria-pressed='true'] .ct__hit { fill: color-mix(in srgb, var(--k-iris) 11%, transparent); stroke: color-mix(in srgb, var(--k-iris) 40%, transparent); }
.ct__part:focus-visible .ct__hit { stroke: var(--k-iris); stroke-width: 2; }
.ct__detail { margin-top: 8px; padding: 14px 16px; border: 1px solid var(--k-line2); border-radius: var(--k-r2); background: var(--k-paper); }
.ct__dhead { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 6px; }
.ct__dhead .muted { margin-left: auto; }
.ct__key { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 10px; color: var(--k-ink3); font-size: 12.5px; }
.ct__key > span { display: inline-flex; align-items: center; gap: 6px; }
.ct__key .glyph-tile { width: 22px; height: 22px; border: 0; background: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
@media print {
  .tk__tools, .toolbar, .chips, .seg-scroll, .code__more { display: none !important; }
  .dt__scroll, .seq__pre, .code--clip .code__pre { max-height: none !important; overflow: visible !important; -webkit-mask-image: none; mask-image: none; }
}
`,ye="http://www.w3.org/2000/svg";function le(e,r){if(r){for(const[t,n]of Object.entries(r))if(!(n==null||n===!1))if(t==="class")e.setAttribute("class",Array.isArray(n)?n.filter(Boolean).join(" "):n);else if(t==="text")e.textContent=String(n);else if(t==="style"&&typeof n=="object")for(const[i,a]of Object.entries(n))a!=null&&(i.startsWith("--")?e.style.setProperty(i,String(a)):e.style[i]=a);else t==="dataset"?Object.assign(e.dataset,n):t.startsWith("on")&&typeof n=="function"?e.addEventListener(t.slice(2),n):e.setAttribute(t,n===!0?"":String(n))}}function B(e,r){for(const t of r.flat(1/0))t==null||t===!1||t===""||e.append(t instanceof Node?t:String(t));return e}const We=(e,...r)=>(e.replaceChildren(),B(e,r)),u=(e,r,...t)=>{const n=document.createElement(e);return le(n,r),B(n,t)},ze=(e,r,...t)=>{const n=document.createElementNS(ye,e);return le(n,r),B(n,t)};function D(e){if(!e)return"";const r=String(e).trim();if(r.startsWith("#"))return new URL(r,location.href).href;const t=new URL(document.documentElement.dataset.root||"/",location.href),n=new URL(r.replace(/^\/(?!\/)/,""),t);if(!["http:","https:"].includes(n.protocol)||r.startsWith("//"))throw new Error("请使用网站内文件路径或 https 地址");return n.href}function Me(e){if(!e)return"";const r=String(e).trim();if(r.startsWith("#"))return r;try{return D(r)}catch{return""}}function Ee(e){try{return new URL(e,location.href).origin===location.origin?{}:{target:"_blank",rel:"noopener noreferrer"}}catch{return{}}}const Le=e=>{try{return decodeURIComponent(new URL(D(e)).pathname.split("/").pop()||"")}catch{return""}},Ge=e=>(Le(e).match(/\.([a-z0-9]+)$/i)?.[1]||"").toLowerCase();function te(e){const r=[],t=/\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;let n=0,i;for(;i=t.exec(e);){if(i.index>n&&r.push(e.slice(n,i.index)),i[1]!=null)r.push(u("strong",{text:i[1]}));else if(i[2]!=null)r.push(u("code",{text:i[2]}));else{const a=Me(i[4]);r.push(a?u("a",{href:a,text:i[3],...Ee(a)}):i[3])}n=t.lastIndex}return n<e.length&&r.push(e.slice(n)),r}function Ke(e,r="rt"){const t=document.createDocumentFragment(),n=String(e??"").replace(/\r\n?/g,`
`).split(/\n{2,}/);for(const i of n){if(!i.trim())continue;let a=null,o=null;for(const p of i.split(`
`)){const s=p.match(/^\s*[-•*]\s+(.*)$/);s?(o||(o=u("ul",{class:"rl"}),t.append(o),a=null),o.append(u("li",null,te(s[1])))):(o=null,a?a.append(u("br")):(a=u("p",{class:r}),t.append(a)),a.append(...te(p)))}}return t}const Xe=e=>e!=null&&String(e).trim()!=="";function Je(e){return Array.isArray(e)?e.map(r=>String(r).trim()).filter(Boolean):String(e??"").split(/[,，、;；\n]/).map(r=>r.trim()).filter(Boolean)}function Qe(e,r,t,n){const i=Number(e);return Number.isFinite(i)?Math.max(r,Math.min(t,i)):n}function Ze(e){const r=String(e??"").trim().replace(/^−/,"-");if(!r||/^(na|n\/a|nan|-|—|–)$/i.test(r))return null;const t=Number(r);return Number.isFinite(t)?t:NaN}function et(e,r){if(e==null||!Number.isFinite(e))return"—";const t=Math.abs(e),n=r??(t>=1e3?0:t>=100?1:t>=1?2:3);return new Intl.NumberFormat("en-US",{maximumFractionDigits:n}).format(e)}function tt(e){const r=String(e||"").replace(/[（(【\[][^）)】\]]*[）)】\]]/g,"").trim()||String(e||"").trim();return r?/[\u3400-\u9fff]/.test(r)?r.replace(/[^\u3400-\u9fff]/g,"").slice(-2)||r.slice(0,2):(r.match(/[\p{L}\p{N}]+/gu)||[]).slice(0,2).map(t=>t[0]).join("").toUpperCase()||"?":"?"}function Se(e){const r=String(e??"").replace(/^\uFEFF/,""),t=r.split(`
`,1)[0],n=t.includes("	")&&!t.includes(",")?"	":",",i=[];let a=[],o="",p=!1;for(let s=0;s<r.length;s++){const d=r[s];p?d==='"'?r[s+1]==='"'?(o+='"',s++):p=!1:o+=d:d==='"'&&o===""?p=!0:d===n?(a.push(o),o=""):d===`
`?(a.push(o),i.push(a),a=[],o=""):d!=="\r"&&(o+=d)}if(p)throw new Error("CSV 中有未闭合的引号，请检查。");return(o!==""||a.length)&&(a.push(o),i.push(a)),i.filter(s=>s.some(d=>d.trim()!=="")).map(s=>s.map(d=>d.trim()))}function rt(e,{minCols:r=1}={}){const t=Se(e),[n,...i]=t;if(!n||!i.length)throw new Error("CSV 需要一行列名和至少一行数据。");if(n.length<r)throw new Error(`至少需要 ${r} 列数据。`);return i.forEach((a,o)=>{if(a.length!==n.length)throw new Error(`第 ${o+2} 行有 ${a.length} 列，表头有 ${n.length} 列，请补齐或删除多余的逗号。`)}),{headers:n,rows:i}}function nt(e,r){const t=n=>/[",\n]/.test(n)?`"${String(n).replace(/"/g,'""')}"`:String(n);return[e,...r].map(n=>n.map(t).join(",")).join(`
`)}const re=["#6e4fb8","#2e8a7e","#d18f25","#b2466f","#4f6db0","#7b8a36","#8c5a3c","#3d9bc2"],it=e=>re[e%re.length];function U(e){const r=parseInt(e.slice(1),16);return[r>>16&255,r>>8&255,r&255]}function qe(e,r,t){const[n,i]=[U(e),U(r)];return`#${n.map((a,o)=>Math.round(a+(i[o]-a)*t).toString(16).padStart(2,"0")).join("")}`}function at(e,r){const t=Math.max(0,Math.min(1,r))*(e.length-1),n=Math.min(e.length-2,Math.floor(t));return qe(e[n],e[n+1],t-n)}function Ae(e){const[r,t,n]=U(e).map(i=>{const a=i/255;return a<=.03928?a/12.92:((a+.055)/1.055)**2.4});return .2126*r+.7152*t+.0722*n}const ot=e=>Ae(e)>.36?"#241c2b":"#fbf8f1",Ce={search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',download:'<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',external:'<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',down:'<path d="M6 9l6 6 6-6"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',arrowDown:'<path d="M12 5v14M6 13l6 6 6-6"/>',expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',reset:'<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/>',table:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M9.5 10v9"/>',grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',rows:'<path d="M4 6h16M4 12h16M4 18h16"/>',link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',quote:'<path d="M9.5 7C6.5 8 5 10.3 5 13.5V17h5v-5H7.3c.3-1.8 1.2-2.9 2.9-3.6zM18.5 7c-3 1-4.5 3.3-4.5 6.5V17h5v-5h-2.7c.3-1.8 1.2-2.9 2.9-3.6z" fill="currentColor" stroke="none"/>',pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',calendar:'<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.6a3 3 0 0 1 0 5.8M21 19.5a6 6 0 0 0-3.5-5.4"/>',shield:'<path d="M12 3.5l7 2.8v5.4c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',file:'<path d="M7 3.5h7l4.5 4.5v12.5H7z"/><path d="M14 3.5V8h4.5"/>',image:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8"/>',play:'<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',dot:'<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',cross:'<path d="M7 7l10 10M17 7L7 17"/>',half:'<path d="M6 12h12"/>',terminal:'<path d="M5 8l4 4-4 4M11 16h8"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'};function j(e,r="i"){const t=ze("svg",{viewBox:"0 0 24 24",class:r,"aria-hidden":"true",focusable:"false",fill:"none",stroke:"currentColor","stroke-width":1.8,"stroke-linecap":"round","stroke-linejoin":"round"});return t.innerHTML=Ce[e]||"",t}function Te(e,{icon:r,onClick:t,cls:n="btn",title:i,pressed:a,after:o=!1}={}){const p=u("button",{type:"button",class:n,title:i,"aria-pressed":a==null?null:String(a),onclick:t});return r&&!o&&p.append(j(r)),e&&p.append(u("span",{text:e})),r&&o&&p.append(j(r)),!e&&i&&p.setAttribute("aria-label",i),p}function st(e,{onSelect:r,label:t,role:n="tablist",cls:i="seg"}={}){const a=u("div",{class:i,role:n,"aria-label":t}),o=e.map((d,g)=>{const l=u("button",{type:"button",class:"seg__btn",role:n==="tablist"?"tab":null,text:d});return l.addEventListener("click",()=>s(g,!0)),l.addEventListener("keydown",c=>{const m={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};let x=null;c.key in m&&(x=(g+m[c.key]+e.length)%e.length),c.key==="Home"&&(x=0),c.key==="End"&&(x=e.length-1),x!=null&&(c.preventDefault(),s(x,!0),o[x].focus())}),a.append(l),l});let p=-1;function s(d,g){p=d,o.forEach((l,c)=>{const m=c===d;l.setAttribute(n==="tablist"?"aria-selected":"aria-pressed",String(m)),l.tabIndex=m?0:-1}),(g||r)&&r?.(d,g)}return{el:a,buttons:o,select:s,get index(){return p}}}function pt(e,{onChange:r,all:t="全部",counts:n,label:i="筛选",swatch:a}={}){const o=u("div",{class:"chips",role:"group","aria-label":i});let p="";const s=(l,c,m)=>{const x=u("button",{type:"button",class:"chip","aria-pressed":String(l==="")});return a&&l&&x.append(u("span",{class:"chip__sw",style:{background:a(l,m)}})),x.append(u("span",{text:c})),n&&n[l]!=null&&x.append(u("span",{class:"chip__n",text:n[l]})),x.addEventListener("click",()=>g(p===l&&l!==""?"":l)),o.append(x),[l,x]},d=[s("",t,-1),...e.map((l,c)=>s(l,l,c))];function g(l){p=l,d.forEach(([c,m])=>m.setAttribute("aria-pressed",String(c===l))),r?.(l)}return{el:o,set:g,get value(){return p}}}function lt(e,r){const t=u("input",{type:"search",class:"search__input",placeholder:e,"aria-label":e});return t.addEventListener("input",()=>r(t.value)),{el:u("label",{class:"search"},j("search"),t),input:t}}function ct(e,r){const t=URL.createObjectURL(e),n=u("a",{href:t,download:r});document.body.append(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(t),1500)}async function He(e){try{return await navigator.clipboard.writeText(e),!0}catch{const r=u("textarea",{style:{position:"fixed",opacity:"0"}});r.value=e,document.body.append(r),r.select();let t=!1;try{t=document.execCommand("copy")}catch{t=!1}return r.remove(),t}}function dt(e,r="Copy",t="btn btn--quiet"){const n=Te(r,{icon:"copy",cls:t}),i=n.querySelector("span");let a;return n.addEventListener("click",async()=>{const o=await He(typeof e=="function"?e():e);i&&(i.textContent=o?"Copied":"Copy failed; select the text manually"),clearTimeout(a),a=setTimeout(()=>{i&&(i.textContent=r)},1800)}),n}const xt=e=>u("div",{class:"empty"},j("plus"),u("p",{text:e})),ft=()=>matchMedia("(prefers-reduced-motion: reduce)").matches,je={content:()=>H(()=>import("./content.DRiRNI0K.js"),__vite__mapDeps([0,1])),media:()=>H(()=>import("./media.DM3pNE19.js"),__vite__mapDeps([2,1])),data:()=>H(()=>import("./data.Cd9YICCw.js"),__vite__mapDeps([3,1])),narrative:()=>H(()=>import("./narrative.Df6mSVFI.js"),__vite__mapDeps([4,1])),bio:()=>H(()=>import("./bio.CE0ohUt3.js"),__vite__mapDeps([5,1]))},Fe={tabs:"content",accordion:"content",downloads:"content",flow:"content",code:"content",lightbox:"media",comparison:"media",video:"media",hotspots:"media",chart:"data",datatable:"data",heatmap:"data",matrix:"data",params:"data",equation:"data",sequence:"data",cycle:"narrative",stakeholders:"narrative",interview:"narrative",chronology:"narrative",risk:"narrative",parts:"bio",construct:"bio"};let R=null;function Re(e){try{return R||(R=new CSSStyleSheet,R.replaceSync(pe)),e.adoptedStyleSheets=[R],!0}catch{return!1}}class $e extends HTMLElement{static observedAttributes=["data-props"];cleanups=[];controller=null;generation=0;adopted=!1;constructor(){super(),this.attachShadow({mode:"open"}),this.adopted=Re(this.shadowRoot)}connectedCallback(){this.render()}attributeChangedCallback(){this.isConnected&&this.render()}disconnectedCallback(){this.teardown()}teardown(){for(const r of this.cleanups.splice(0))try{r()}catch{}this.controller?.abort()}async render(){const r=++this.generation;this.teardown(),this.controller=new AbortController;const t=this.shadowRoot;t.replaceChildren(),this.adopted||t.append(u("style",{text:pe}));let n={};try{n=JSON.parse(this.getAttribute("data-props")||"{}")}catch{n={}}const i=n._template||this.dataset.type||"",a=u("div",{class:"tk__tools"}),o=u("header",{class:"tk__head"},n.title&&i!=="quote"?u("h3",{class:"tk__title",text:n.title}):null,a),p=u("div",{class:"tk__body"}),s=u("section",{class:["tk",`tk--${i}`],"aria-label":n.title||null},o,p);t.append(s),n.caption&&t.append(u("p",{class:"tk__cap",text:n.caption}));const d=()=>this.isConnected&&r===this.generation,g={root:t,host:this,frame:s,head:o,tools:a,body:p,active:d,signal:this.controller.signal,onCleanup:l=>this.cleanups.push(l),load:async l=>{if(!l)return"";const c=await fetch(D(l),{signal:this.controller.signal});if(!c.ok)throw new Error(`文件加载失败（HTTP ${c.status}）：${l}`);return c.text()}};try{const l=Fe[i];if(!l)throw new Error(`未知组件类型：${i||"（空）"}`);const c=await je[l]();if(!d())return;const m=c.components[i];if(m.bare&&s.classList.add("tk--bare"),await m.render(n,g),!d())return;!o.querySelector(".tk__title")&&!a.childElementCount&&o.remove()}catch(l){if(l?.name==="AbortError"||!d())return;p.append(u("p",{class:"tk__error",role:"alert"},j("close"),u("span",{text:l?.message||String(l)})))}}}customElements.get("wiki-toolkit")||customElements.define("wiki-toolkit",$e);const Y=new WeakMap;let V=0;function P(){V||(V=requestAnimationFrame(()=>{V=0;const e=[...document.querySelectorAll(".member-card__front")];e.forEach(t=>{t.style.minHeight=""});const r=Math.max(0,...e.map(t=>t.offsetHeight));e.forEach(t=>{t.style.minHeight=`${r}px`})}))}function ce(e){if(e.classList.contains("is-ready"))return;const r=e.querySelector(".member-card__front"),t=e.querySelector(".member-card__back"),n=e.querySelector("[data-member-flip]"),i=e.querySelector(".member-card__inner");if(!r||!t||!n||!i)return;const a=()=>{const c=e.classList.contains("is-flipped")?t:r;i.style.height=`${c.offsetHeight}px`},o={open:n.dataset.labelOpen||n.getAttribute("aria-label")||"Turn card",close:n.dataset.labelClose||n.getAttribute("aria-label")||"Turn card"},p=c=>{c!==e.classList.contains("is-flipped")&&(c&&t.querySelectorAll('img[loading="lazy"]').forEach(m=>{m.loading="eager"}),e.classList.toggle("is-flipped",c),n.setAttribute("aria-expanded",String(c)),n.setAttribute("aria-label",c?o.close:o.open),r.inert=c,t.inert=!c,r.setAttribute("aria-hidden",String(c)),t.setAttribute("aria-hidden",String(!c)),a())};t.inert=!0,t.setAttribute("aria-hidden","true"),e.classList.add("is-ready"),a();const s=new ResizeObserver(a);s.observe(r),s.observe(t);let d=-1;const g=new ResizeObserver(c=>{for(const m of c)(m.target!==e||m.contentRect.width!==d)&&(m.target===e&&(d=m.contentRect.width),P())});g.observe(e);const l=r.querySelector(".member-card__info");l&&g.observe(l),P(),Y.set(e,()=>{s.disconnect(),g.disconnect(),P()}),n.addEventListener("click",()=>p(!e.classList.contains("is-flipped"))),e.addEventListener("click",c=>{c.target.closest("button, a, input, textarea, select, summary, [contenteditable]")||window.getSelection()?.toString()||(p(!e.classList.contains("is-flipped")),n.focus({preventScroll:!0}))}),e.addEventListener("keydown",c=>{c.key==="Escape"&&e.classList.contains("is-flipped")&&(c.preventDefault(),p(!1),n.focus({preventScroll:!0}))})}function ne(e){e.querySelectorAll("[data-member-card]").forEach(ce)}let ie=!1;function Oe(){ne(document),!ie&&(ie=!0,new MutationObserver(e=>{for(const r of e)for(const t of r.removedNodes)!(t instanceof HTMLElement)||t.isConnected||(Y.get(t)?.(),t.querySelectorAll("[data-member-card]").forEach(n=>Y.get(n)?.()));for(const r of e)for(const t of r.addedNodes)!(t instanceof Element)||!(t.matches(".member-grid, .credit-grid")||t.querySelector(".member-grid, .credit-grid"))&&!t.matches("[data-member-card]")||(t.matches("[data-member-card]")?ce(t):ne(t),se(t))}).observe(document.body,{childList:!0,subtree:!0}))}function Ie(){const e=document.querySelector("[data-hero]");if(!e||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const r=Array.from(e.querySelectorAll("[data-depth]")).map(x=>({el:x,depth:Number(x.dataset.depth)||0,sink:Number(x.dataset.sink)||0}));if(!r.length)return;const t=matchMedia("(pointer: fine)").matches;let n=0,i=0,a=0,o=0,p=0,s=!0,d=e.offsetHeight;const g=()=>{const x=Math.max(0,Math.min(scrollY,d));for(const k of r)k.el.style.transform=`translate3d(${(-a*k.depth).toFixed(2)}px, ${(-o*k.depth*.6+x*k.sink).toFixed(2)}px, 0)`},l=()=>{a+=(n-a)*.1,o+=(i-o)*.1;const x=Math.abs(n-a)+Math.abs(i-o)<.001;x&&(a=n,o=i),g(),p=x?0:requestAnimationFrame(l)},c=()=>{!p&&s&&(p=requestAnimationFrame(l))};t&&(e.addEventListener("pointermove",x=>{const k=e.getBoundingClientRect();n=Math.max(-1,Math.min(1,(x.clientX-k.left)/k.width*2-1)),i=Math.max(-1,Math.min(1,(x.clientY-k.top)/k.height*2-1)),c()}),e.addEventListener("pointerleave",()=>{n=0,i=0,c()}));let m=!1;addEventListener("scroll",()=>{!s||m||(m=!0,requestAnimationFrame(()=>{m=!1,p||g()}))},{passive:!0}),addEventListener("resize",()=>{d=e.offsetHeight,g()},{passive:!0}),new IntersectionObserver(x=>{s=x.some(k=>k.isIntersecting),s&&g()}).observe(e),g()}const Ne=e=>Math.max(0,Math.min(1,e));function Ve(){const e=document.querySelector("[data-toc]");if(!e)return;const r=Array.from(e.querySelectorAll("[data-toc-link]")),t=r.map(f=>({a:f,el:document.getElementById(decodeURIComponent(f.hash.slice(1)))})).filter(f=>!!f.el),n=e.querySelector(".toc__list"),i=e.querySelector("[data-toc-film]"),a=e.querySelector("[data-toc-bar]"),o=e.querySelector("[data-toc-ring]"),p=e.querySelector("[data-toc-now]"),s=e.querySelector("[data-toc-toggle]"),d=e.querySelector(".toc__panel"),g=document.querySelector("[data-doc]"),l=matchMedia("(max-width: 1099px)"),c=matchMedia("(prefers-reduced-motion: reduce)").matches;let m=-1,x=0,k=0,L=30,S=0,q=0,y=30,h=0,v=!1;const _=()=>{if(!i)return;const f=Math.min(Math.abs(k)/30,.45);i.style.height=`${L.toFixed(2)}px`,i.style.transform=`translateY(${x.toFixed(2)}px) scale(${(1-f*.06).toFixed(3)}, ${(1+f*.5).toFixed(3)})`},M=()=>{k=(k+(q-x)*.16)*.74,x+=k,S=(S+(y-L)*.16)*.74,L+=S,_(),Math.abs(q-x)>.2||Math.abs(k)>.03||Math.abs(y-L)>.2||Math.abs(S)>.03?h=requestAnimationFrame(M):(h=0,x=q,L=y,k=S=0,_())},T=(f=!1)=>{const b=t[m]?.a.parentElement;!i||!b||!b.offsetHeight||(q=b.offsetTop,y=b.offsetHeight,(!v||f||c)&&(x=q,L=y,k=S=0,_()),i.classList.add("is-on"),v=!0,!c&&!h&&(h=requestAnimationFrame(M)))},W=f=>{if(f===m)return;m=f,t.forEach((w,z)=>{w.a.classList.toggle("is-active",z===f),z===f?w.a.setAttribute("aria-current","location"):w.a.removeAttribute("aria-current")});const b=t[f];if(b&&(T(),p&&(p.textContent=b.a.querySelector(".toc__text")?.textContent||""),n&&!l.matches&&n.scrollHeight>n.clientHeight)){const w=b.a.parentElement.offsetTop;(w<n.scrollTop+8||w>n.scrollTop+n.clientHeight-48)&&n.scrollTo({top:w-n.clientHeight/3,behavior:"smooth"})}};let $=[],G=0,K=1;const X=()=>{const f=scrollY;if($=t.map(b=>b.el.getBoundingClientRect().top+f),g){const b=g.getBoundingClientRect();G=b.top+f,K=b.height}},O=()=>{const f=innerHeight*.35,b=scrollY;let w=0;for(let z=0;z<$.length&&$[z]-b-f<=0;z++)w=z;if(W(w),g){const z=Ne((innerHeight*.3-(G-b))/Math.max(1,K-innerHeight*.55));a&&(a.style.transform=`scaleX(${z.toFixed(4)})`),o&&(o.style.strokeDashoffset=(94.25*(1-z)).toFixed(2))}};let A=null;try{A=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{}let J=!!A&&!!g?.contains(A);const de=()=>{J=!1};for(const f of["wheel","touchstart","pointerdown","keydown","hashchange"])addEventListener(f,de,{passive:!0,once:!0});const xe=()=>{if(!J||!A)return;const f=parseFloat(getComputedStyle(A).scrollMarginTop)||0;Math.abs(A.getBoundingClientRect().top-f)>2&&A.scrollIntoView({block:"start",behavior:"instant"})},F=()=>{X(),O(),T(!0),requestAnimationFrame(xe)};X();const Q=document.querySelector("main");Q&&"ResizeObserver"in window&&new ResizeObserver(F).observe(Q),document.fonts?.ready.then(F),addEventListener("load",F);let I=!1;addEventListener("scroll",()=>{I||(I=!0,requestAnimationFrame(()=>{O(),I=!1}))},{passive:!0}),addEventListener("resize",F,{passive:!0}),O();const Z=s&&l.matches?N(s):null,C=f=>{if(e.classList.toggle("is-open",f),s?.setAttribute("aria-expanded",f?"true":"false"),f&&d){ge(d),he(d);const b=t[m]?.a;requestAnimationFrame(()=>{b?.scrollIntoView({block:"center"}),T(!0)})}};if(s?.addEventListener("click",()=>C(!e.classList.contains("is-open"))),s){const f=()=>{s.classList.remove("is-lifted"),(Z??N(s)).setStrength(1)};s.addEventListener("pointerdown",E=>{E.button===0&&(s.classList.add("is-lifted"),(Z??N(s)).setStrength(1.25))}),s.addEventListener("pointerup",f),s.addEventListener("pointercancel",f),s.addEventListener("pointerleave",f);const b=()=>{const E=s.getBoundingClientRect();return E.height?E.top+E.height/2:innerHeight-41},w=()=>{if(!l.matches)return;const E=s.getBoundingClientRect();me(s,ue(E.left+E.width/2,E.top+E.height/2))},z=fe(b,w);l.addEventListener?.("change",()=>{z(),w()})}e.querySelector("[data-toc-close]")?.addEventListener("click",()=>{C(!1),s?.focus()}),r.forEach(f=>f.addEventListener("click",()=>{l.matches&&C(!1)})),e.querySelector(".toc__top")?.addEventListener("click",()=>{l.matches&&C(!1)}),document.addEventListener("keydown",f=>{f.key==="Escape"&&e.classList.contains("is-open")&&(C(!1),s?.focus())}),document.addEventListener("click",f=>{if(!e.classList.contains("is-open"))return;const b=f.target;(b===e||!e.contains(b))&&C(!1)}),l.addEventListener?.("change",()=>C(!1))}function Pe(){const e=document.querySelector("[data-detective]");if(!e)return;const r=e.querySelector(".detective__btn"),t=e.querySelector(".detective__bubble");if(!r||!t)return;const n=matchMedia("(prefers-reduced-motion: reduce)").matches,i=matchMedia("(max-width: 1099px)"),a=()=>["Lost? Tap me to go back to the top.",i.matches?"The outline button at the bottom jumps between sections.":"The outline on the left jumps between sections.","Search lives in the top bar. Press <b>/</b> to open it."];let o=0,p=0;const s=(d,g=4800)=>{t.innerHTML=d,e.classList.add("show-bubble"),clearTimeout(p),p=window.setTimeout(()=>e.classList.remove("show-bubble"),g)};window.NKUDetective={say:s,el:e,lit:()=>{},aim:()=>{},torchTip:()=>null},r.addEventListener("click",()=>window.scrollTo({top:0,behavior:n?"auto":"smooth"})),r.addEventListener("pointerenter",()=>{const d=a();s(d[o++%d.length])}),r.addEventListener("focus",()=>{const d=a();s(d[o++%d.length])})}function Ue(){document.querySelectorAll("[data-doc] :is(h2, h3)[id]").forEach(t=>{if(t.querySelector("a"))return;const n=document.createElement("a");n.className="heading-anchor",n.href=`#${t.id}`,n.textContent="#",n.setAttribute("aria-label",`Link to “${(t.textContent||"").trim()}”`),t.appendChild(n)});const e=Array.from(document.querySelectorAll(".table-wrap")),r=()=>e.forEach(t=>t.classList.toggle("is-scrollable",t.scrollWidth>t.clientWidth+2));r(),addEventListener("resize",r,{passive:!0})}const ae=120,Ye=65;function Be(){const e=document.documentElement,r=matchMedia("(pointer: fine)"),t=matchMedia("(prefers-reduced-motion: reduce)"),n=()=>r.matches&&!t.matches;let i=scrollY,a=scrollY,o=scrollY,p=0,s=0,d=ae,g=0,l=0;const c=()=>{l=Math.max(0,e.scrollHeight-innerHeight)};c(),"ResizeObserver"in window&&new ResizeObserver(c).observe(document.body),addEventListener("resize",c,{passive:!0});const m=h=>{scrollTo({top:h,behavior:"instant"}),o=scrollY},x=h=>{p=0;const v=Math.min(64,Math.max(1,h-s));s=h,i+=(a-i)*(1-Math.exp(-v/d)),Math.abs(a-i)<.4&&(i=a),m(i),i!==a&&(p=requestAnimationFrame(x))},k=()=>{p&&cancelAnimationFrame(p),p=0,i=a=o=scrollY};addEventListener("scroll",()=>{if(!p)return;const h=scrollY-o;Math.abs(h)>1&&(i+=h,a+=h,o=scrollY)},{passive:!0});const L=new WeakMap,S=h=>{let v=L.get(h);if(!v){const _=getComputedStyle(h);v=[_.overflowY,_.overscrollBehaviorY],L.set(h,v)}return v},q=(h,v)=>{if(e.classList.contains("search-open"))return!0;if(!h||!h.closest)return!1;if(h.closest('[data-free-scroll], dialog, [aria-modal="true"], .lnav__drop, .lnav__sheet, wiki-toolkit'))return!0;for(let _=h;_&&_!==document.body&&_!==e;_=_.parentElement){if(_.scrollHeight<=_.clientHeight+1)continue;const[M,T]=S(_);if(M!=="auto"&&M!=="scroll"&&M!=="overlay")continue;if((v>0?_.scrollTop+_.clientHeight<_.scrollHeight-1:_.scrollTop>0)||T==="contain"||T==="none")return!0}return!1};addEventListener("wheel",h=>{if(!n()||h.defaultPrevented||h.ctrlKey||h.metaKey||h.shiftKey)return;let v=h.deltaY,_=h.deltaX;if(h.deltaMode===1?(v*=16,_*=16):h.deltaMode===2&&(v*=innerHeight,_*=innerWidth),!v||Math.abs(_)>Math.abs(v))return;if(q(h.target,v)){k();return}h.preventDefault();const M=performance.now();d=h.deltaMode!==0||Math.abs(v)>=50&&M-g>=25?ae:Ye,g=M,p||(i=a=o=scrollY),a=Math.max(0,Math.min(l,a+v)),!p&&a!==i&&(s=M,p=requestAnimationFrame(x))},{passive:!1});const y=()=>{p&&k()};addEventListener("pointerdown",y,{passive:!0}),addEventListener("keydown",y,{passive:!0}),addEventListener("touchstart",y,{passive:!0}),addEventListener("hashchange",y),document.addEventListener("visibilitychange",y),t.addEventListener?.("change",y)}function oe(){_e(),se(),be(),Ie(),Ve(),ke(),Pe(),Ue(),Be(),Oe()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",oe):oe();export{ct as A,nt as B,tt as C,qe as D,H as _,u as a,Te as b,dt as c,Ge as d,xt as e,D as f,Le as g,Xe as h,j as i,Me as j,We as k,Ee as l,Je as m,Qe as n,it as o,pt as p,Ze as q,Ke as r,st as s,rt as t,ze as u,et as v,lt as w,ft as x,at as y,ot as z};
