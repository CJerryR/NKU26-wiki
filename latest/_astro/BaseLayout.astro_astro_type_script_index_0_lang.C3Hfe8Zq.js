const de="modulepreload",fe=function(e){return"/"+e},J={},R=function(t,r,n){let i=Promise.resolve();if(r&&r.length>0){let a=function(s){return Promise.all(s.map(u=>Promise.resolve(u).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),d=l?.nonce||l?.getAttribute("nonce");i=a(r.map(s=>{if(s=fe(s),s in J)return;J[s]=!0;const u=s.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${p}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":de,u||(h.as="script"),h.crossOrigin="",h.href=s,d&&h.setAttribute("nonce",d),document.head.appendChild(h),u)return new Promise((v,k)=>{h.addEventListener("load",v),h.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${s}`)))})}))}function o(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return i.then(a=>{for(const l of a||[])l.status==="rejected"&&o(l.reason);return t().catch(o)})},le=`/* <wiki-toolkit> components. Loaded into every shadow root as one shared sheet.
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
`,xe="http://www.w3.org/2000/svg";function pe(e,t){if(t){for(const[r,n]of Object.entries(t))if(!(n==null||n===!1))if(r==="class")e.setAttribute("class",Array.isArray(n)?n.filter(Boolean).join(" "):n);else if(r==="text")e.textContent=String(n);else if(r==="style"&&typeof n=="object")for(const[i,o]of Object.entries(n))o!=null&&(i.startsWith("--")?e.style.setProperty(i,String(o)):e.style[i]=o);else r==="dataset"?Object.assign(e.dataset,n):r.startsWith("on")&&typeof n=="function"?e.addEventListener(r.slice(2),n):e.setAttribute(r,n===!0?"":String(n))}}function K(e,t){for(const r of t.flat(1/0))r==null||r===!1||r===""||e.append(r instanceof Node?r:String(r));return e}const Ke=(e,...t)=>(e.replaceChildren(),K(e,t)),y=(e,t,...r)=>{const n=document.createElement(e);return pe(n,t),K(n,r)},ge=(e,t,...r)=>{const n=document.createElementNS(xe,e);return pe(n,t),K(n,r)};function X(e){if(!e)return"";const t=String(e).trim();if(t.startsWith("#"))return new URL(t,location.href).href;const r=new URL(document.documentElement.dataset.root||"/",location.href),n=new URL(t.replace(/^\/(?!\/)/,""),r);if(!["http:","https:"].includes(n.protocol)||t.startsWith("//"))throw new Error("请使用网站内文件路径或 https 地址");return n.href}function ue(e){if(!e)return"";const t=String(e).trim();if(t.startsWith("#"))return t;try{return X(t)}catch{return""}}function he(e){try{return new URL(e,location.href).origin===location.origin?{}:{target:"_blank",rel:"noopener noreferrer"}}catch{return{}}}const me=e=>{try{return decodeURIComponent(new URL(X(e)).pathname.split("/").pop()||"")}catch{return""}},Xe=e=>(me(e).match(/\.([a-z0-9]+)$/i)?.[1]||"").toLowerCase();function Q(e){const t=[],r=/\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;let n=0,i;for(;i=r.exec(e);){if(i.index>n&&t.push(e.slice(n,i.index)),i[1]!=null)t.push(y("strong",{text:i[1]}));else if(i[2]!=null)t.push(y("code",{text:i[2]}));else{const o=ue(i[4]);t.push(o?y("a",{href:o,text:i[3],...he(o)}):i[3])}n=r.lastIndex}return n<e.length&&t.push(e.slice(n)),t}function Je(e,t="rt"){const r=document.createDocumentFragment(),n=String(e??"").replace(/\r\n?/g,`
`).split(/\n{2,}/);for(const i of n){if(!i.trim())continue;let o=null,a=null;for(const l of i.split(`
`)){const d=l.match(/^\s*[-•*]\s+(.*)$/);d?(a||(a=y("ul",{class:"rl"}),r.append(a),o=null),a.append(y("li",null,Q(d[1])))):(a=null,o?o.append(y("br")):(o=y("p",{class:t}),r.append(o)),o.append(...Q(l)))}}return r}const Qe=e=>e!=null&&String(e).trim()!=="";function Ze(e){return Array.isArray(e)?e.map(t=>String(t).trim()).filter(Boolean):String(e??"").split(/[,，、;；\n]/).map(t=>t.trim()).filter(Boolean)}function et(e,t,r,n){const i=Number(e);return Number.isFinite(i)?Math.max(t,Math.min(r,i)):n}function tt(e){const t=String(e??"").trim().replace(/^−/,"-");if(!t||/^(na|n\/a|nan|-|—|–)$/i.test(t))return null;const r=Number(t);return Number.isFinite(r)?r:NaN}function nt(e,t){if(e==null||!Number.isFinite(e))return"—";const r=Math.abs(e),n=t??(r>=1e3?0:r>=100?1:r>=1?2:3);return new Intl.NumberFormat("en-US",{maximumFractionDigits:n}).format(e)}function rt(e){const t=String(e||"").replace(/[（(【\[][^）)】\]]*[）)】\]]/g,"").trim()||String(e||"").trim();return t?/[\u3400-\u9fff]/.test(t)?t.replace(/[^\u3400-\u9fff]/g,"").slice(-2)||t.slice(0,2):(t.match(/[\p{L}\p{N}]+/gu)||[]).slice(0,2).map(r=>r[0]).join("").toUpperCase()||"?":"?"}function _e(e){const t=String(e??"").replace(/^\uFEFF/,""),r=t.split(`
`,1)[0],n=r.includes("	")&&!r.includes(",")?"	":",",i=[];let o=[],a="",l=!1;for(let d=0;d<t.length;d++){const s=t[d];l?s==='"'?t[d+1]==='"'?(a+='"',d++):l=!1:a+=s:s==='"'&&a===""?l=!0:s===n?(o.push(a),a=""):s===`
`?(o.push(a),i.push(o),o=[],a=""):s!=="\r"&&(a+=s)}if(l)throw new Error("CSV 中有未闭合的引号，请检查。");return(a!==""||o.length)&&(o.push(a),i.push(o)),i.filter(d=>d.some(s=>s.trim()!=="")).map(d=>d.map(s=>s.trim()))}function it(e,{minCols:t=1}={}){const r=_e(e),[n,...i]=r;if(!n||!i.length)throw new Error("CSV 需要一行列名和至少一行数据。");if(n.length<t)throw new Error(`至少需要 ${t} 列数据。`);return i.forEach((o,a)=>{if(o.length!==n.length)throw new Error(`第 ${a+2} 行有 ${o.length} 列，表头有 ${n.length} 列，请补齐或删除多余的逗号。`)}),{headers:n,rows:i}}function ot(e,t){const r=n=>/[",\n]/.test(n)?`"${String(n).replace(/"/g,'""')}"`:String(n);return[e,...t].map(n=>n.map(r).join(",")).join(`
`)}const Z=["#6e4fb8","#2e8a7e","#d18f25","#b2466f","#4f6db0","#7b8a36","#8c5a3c","#3d9bc2"],at=e=>Z[e%Z.length];function Y(e){const t=parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function be(e,t,r){const[n,i]=[Y(e),Y(t)];return`#${n.map((o,a)=>Math.round(o+(i[a]-o)*r).toString(16).padStart(2,"0")).join("")}`}function st(e,t){const r=Math.max(0,Math.min(1,t))*(e.length-1),n=Math.min(e.length-2,Math.floor(r));return be(e[n],e[n+1],r-n)}function ke(e){const[t,r,n]=Y(e).map(i=>{const o=i/255;return o<=.03928?o/12.92:((o+.055)/1.055)**2.4});return .2126*t+.7152*r+.0722*n}const lt=e=>ke(e)>.36?"#241c2b":"#fbf8f1",ve={search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',download:'<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',external:'<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',down:'<path d="M6 9l6 6 6-6"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',arrowDown:'<path d="M12 5v14M6 13l6 6 6-6"/>',expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',reset:'<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/>',table:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M9.5 10v9"/>',grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',rows:'<path d="M4 6h16M4 12h16M4 18h16"/>',link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',quote:'<path d="M9.5 7C6.5 8 5 10.3 5 13.5V17h5v-5H7.3c.3-1.8 1.2-2.9 2.9-3.6zM18.5 7c-3 1-4.5 3.3-4.5 6.5V17h5v-5h-2.7c.3-1.8 1.2-2.9 2.9-3.6z" fill="currentColor" stroke="none"/>',pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',calendar:'<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.6a3 3 0 0 1 0 5.8M21 19.5a6 6 0 0 0-3.5-5.4"/>',shield:'<path d="M12 3.5l7 2.8v5.4c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',file:'<path d="M7 3.5h7l4.5 4.5v12.5H7z"/><path d="M14 3.5V8h4.5"/>',image:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8"/>',play:'<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',dot:'<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',cross:'<path d="M7 7l10 10M17 7L7 17"/>',half:'<path d="M6 12h12"/>',terminal:'<path d="M5 8l4 4-4 4M11 16h8"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'};function H(e,t="i"){const r=ge("svg",{viewBox:"0 0 24 24",class:t,"aria-hidden":"true",focusable:"false",fill:"none",stroke:"currentColor","stroke-width":1.8,"stroke-linecap":"round","stroke-linejoin":"round"});return r.innerHTML=ve[e]||"",r}function we(e,{icon:t,onClick:r,cls:n="btn",title:i,pressed:o,after:a=!1}={}){const l=y("button",{type:"button",class:n,title:i,"aria-pressed":o==null?null:String(o),onclick:r});return t&&!a&&l.append(H(t)),e&&l.append(y("span",{text:e})),t&&a&&l.append(H(t)),!e&&i&&l.setAttribute("aria-label",i),l}function pt(e,{onSelect:t,label:r,role:n="tablist",cls:i="seg"}={}){const o=y("div",{class:i,role:n,"aria-label":r}),a=e.map((s,u)=>{const p=y("button",{type:"button",class:"seg__btn",role:n==="tablist"?"tab":null,text:s});return p.addEventListener("click",()=>d(u,!0)),p.addEventListener("keydown",h=>{const v={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};let k=null;h.key in v&&(k=(u+v[h.key]+e.length)%e.length),h.key==="Home"&&(k=0),h.key==="End"&&(k=e.length-1),k!=null&&(h.preventDefault(),d(k,!0),a[k].focus())}),o.append(p),p});let l=-1;function d(s,u){l=s,a.forEach((p,h)=>{const v=h===s;p.setAttribute(n==="tablist"?"aria-selected":"aria-pressed",String(v)),p.tabIndex=v?0:-1}),(u||t)&&t?.(s,u)}return{el:o,buttons:a,select:d,get index(){return l}}}function ct(e,{onChange:t,all:r="全部",counts:n,label:i="筛选",swatch:o}={}){const a=y("div",{class:"chips",role:"group","aria-label":i});let l="";const d=(p,h,v)=>{const k=y("button",{type:"button",class:"chip","aria-pressed":String(p==="")});return o&&p&&k.append(y("span",{class:"chip__sw",style:{background:o(p,v)}})),k.append(y("span",{text:h})),n&&n[p]!=null&&k.append(y("span",{class:"chip__n",text:n[p]})),k.addEventListener("click",()=>u(l===p&&p!==""?"":p)),a.append(k),[p,k]},s=[d("",r,-1),...e.map((p,h)=>d(p,p,h))];function u(p){l=p,s.forEach(([h,v])=>v.setAttribute("aria-pressed",String(h===p))),t?.(p)}return{el:a,set:u,get value(){return l}}}function dt(e,t){const r=y("input",{type:"search",class:"search__input",placeholder:e,"aria-label":e});return r.addEventListener("input",()=>t(r.value)),{el:y("label",{class:"search"},H("search"),r),input:r}}function ft(e,t){const r=URL.createObjectURL(e),n=y("a",{href:r,download:t});document.body.append(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(r),1500)}async function ye(e){try{return await navigator.clipboard.writeText(e),!0}catch{const t=y("textarea",{style:{position:"fixed",opacity:"0"}});t.value=e,document.body.append(t),t.select();let r=!1;try{r=document.execCommand("copy")}catch{r=!1}return t.remove(),r}}function xt(e,t="复制",r="btn btn--quiet"){const n=we(t,{icon:"copy",cls:r}),i=n.querySelector("span");let o;return n.addEventListener("click",async()=>{const a=await ye(typeof e=="function"?e():e);i&&(i.textContent=a?"已复制":"复制失败，请手动选择"),clearTimeout(o),o=setTimeout(()=>{i&&(i.textContent=t)},1800)}),n}const gt=e=>y("div",{class:"empty"},H("plus"),y("p",{text:e})),ut=()=>matchMedia("(prefers-reduced-motion: reduce)").matches,Ee={content:()=>R(()=>import("./content.BpbvzXrd.js"),[]),media:()=>R(()=>import("./media.D5Iivt8i.js"),[]),data:()=>R(()=>import("./data.C3SeM6rj.js"),[]),narrative:()=>R(()=>import("./narrative.Bqk5iCcS.js"),[]),bio:()=>R(()=>import("./bio.Co2WIAJA.js"),[])},ze={tabs:"content",accordion:"content",downloads:"content",flow:"content",code:"content",lightbox:"media",comparison:"media",video:"media",hotspots:"media",chart:"data",datatable:"data",heatmap:"data",matrix:"data",params:"data",equation:"data",sequence:"data",cycle:"narrative",stakeholders:"narrative",interview:"narrative",chronology:"narrative",risk:"narrative",parts:"bio",construct:"bio"};let I=null;function Me(e){try{return I||(I=new CSSStyleSheet,I.replaceSync(le)),e.adoptedStyleSheets=[I],!0}catch{return!1}}class Se extends HTMLElement{static observedAttributes=["data-props"];cleanups=[];controller=null;generation=0;adopted=!1;constructor(){super(),this.attachShadow({mode:"open"}),this.adopted=Me(this.shadowRoot)}connectedCallback(){this.render()}attributeChangedCallback(){this.isConnected&&this.render()}disconnectedCallback(){this.teardown()}teardown(){for(const t of this.cleanups.splice(0))try{t()}catch{}this.controller?.abort()}async render(){const t=++this.generation;this.teardown(),this.controller=new AbortController;const r=this.shadowRoot;r.replaceChildren(),this.adopted||r.append(y("style",{text:le}));let n={};try{n=JSON.parse(this.getAttribute("data-props")||"{}")}catch{n={}}const i=n._template||this.dataset.type||"",o=y("div",{class:"tk__tools"}),a=y("header",{class:"tk__head"},n.title&&i!=="quote"?y("h3",{class:"tk__title",text:n.title}):null,o),l=y("div",{class:"tk__body"}),d=y("section",{class:["tk",`tk--${i}`],"aria-label":n.title||null},a,l);r.append(d),n.caption&&r.append(y("p",{class:"tk__cap",text:n.caption}));const s=()=>this.isConnected&&t===this.generation,u={root:r,host:this,frame:d,head:a,tools:o,body:l,active:s,signal:this.controller.signal,onCleanup:p=>this.cleanups.push(p),load:async p=>{if(!p)return"";const h=await fetch(X(p),{signal:this.controller.signal});if(!h.ok)throw new Error(`文件加载失败（HTTP ${h.status}）：${p}`);return h.text()}};try{const p=ze[i];if(!p)throw new Error(`未知组件类型：${i||"（空）"}`);const h=await Ee[p]();if(!s())return;const v=h.components[i];if(v.bare&&d.classList.add("tk--bare"),await v.render(n,u),!s())return;!a.querySelector(".tk__title")&&!o.childElementCount&&a.remove()}catch(p){if(p?.name==="AbortError"||!s())return;l.append(y("p",{class:"tk__error",role:"alert"},H("close"),y("span",{text:p?.message||String(p)})))}}}customElements.get("wiki-toolkit")||customElements.define("wiki-toolkit",Se);const U={shift:13,aberration:.06,spec:.55,blur:.35,sat:150},F={...U,bezel:28},ee={bar:{...U,bezel:999},pill:{...U,bezel:999},chip:{...U,bezel:999,shift:8},lens:{bezel:999,shift:9,aberration:.05,spec:.45,blur:0,sat:140},panel:F,drop:F,sheet:F,card:F},W="http://www.w3.org/2000/svg",te=navigator.userAgent,B=/Chrome\/|Chromium\//.test(te)&&!/CriOS|FxiOS|EdgiOS|Firefox/.test(te)&&typeof CSS<"u"&&CSS.supports("backdrop-filter","blur(1px)"),Le=matchMedia("(prefers-reduced-motion: reduce)").matches;let O=null;function qe(){if(O)return O;let e=document.querySelector(".lg-defs");return e||(e=document.createElementNS(W,"svg"),e.setAttribute("class","lg-defs"),e.setAttribute("aria-hidden","true"),e.style.cssText="position:absolute;width:0;height:0;overflow:hidden",document.body.appendChild(e)),O=e.querySelector("defs")||e.appendChild(document.createElementNS(W,"defs")),O}const ne=new Map;function Ce(e,t){const r=`${e}:${t}`,n=ne.get(r);if(n)return n;const i=128,o=new Float32Array(i),a=1.5;let l=0;const d=s=>(s=Math.max(0,Math.min(1,s)),1-(1-s)*(1-s));for(let s=0;s<i;s++){const u=s/(i-1),p=.002;let v=-((d(u+p)-d(u-p))/(2*p)*(t/e)),k=1;const q=Math.sqrt(v*v+k*k);v/=q,k/=q;const c=1/a,m=k,z=1-c*c*(1-m*m);if(z<0){o[s]=0;continue}const E=c*m-Math.sqrt(z),x=E*v,_=-c+E*k,g=d(u)*t,w=_<0?x/-_*g:0;o[s]=w,Math.abs(w)>l&&(l=Math.abs(w))}for(let s=0;s<i;s++)o[s]=l?o[s]/l:0;return ne.set(r,o),o}function re(e,t,r,n,i){const o=Math.abs(e),a=Math.abs(t),l=o-(r-i),d=a-(n-i);let s,u,p;if(l>0&&d>0){const h=Math.sqrt(l*l+d*d)||1e-6;s=i-h,u=l/h,p=d/h}else l>d?(s=r-o,u=1,p=0):(s=n-a,u=0,p=1);return[s,e<0?-u:u,t<0?-p:p]}function Ae(e,t,r,n,i){const a=Math.max(2,Math.round(e*.5)),l=Math.max(2,Math.round(t*.5)),d=Ce(n,n*1.15),s=document.createElement("canvas");s.width=a,s.height=l;const u=document.createElement("canvas");u.width=Math.round(e),u.height=Math.round(t);const p=s.getContext("2d"),h=u.getContext("2d"),v=p.createImageData(a,l),k=v.data,q=Math.min(r,e/2,t/2),c=e/2,m=t/2;for(let M=0;M<l;M++)for(let L=0;L<a;L++){const C=re((L+.5)/.5-c,(M+.5)/.5-m,c,m,q),f=C[0]/n,b=f<1&&f>=0?d[Math.min(127,Math.round(f*127))]:0,S=(M*a+L)*4;k[S]=128-C[1]*b*127,k[S+1]=128-C[2]*b*127,k[S+2]=128,k[S+3]=255}p.putImageData(v,0,0);const z=u.width,E=u.height,x=h.createImageData(z,E),_=x.data,g=-.55,w=-.84;for(let M=0;M<E;M++)for(let L=0;L<z;L++){const C=re(L+.5-c,M+.5-m,c,m,q);if(C[0]<0||C[0]>3.2)continue;const f=C[1]*g+C[2]*w,b=f>0?Math.pow(f,2.2):Math.pow(-f,3)*.45,S=C[0]<1?C[0]:Math.max(0,1-(C[0]-1)/2.2),T=b*S*i;if(T<.004)continue;const N=(M*z+L)*4;_[N]=_[N+1]=_[N+2]=255,_[N+3]=Math.round(T*255)}return h.putImageData(x,0,0),{disp:s.toDataURL(),spec:u.toDataURL()}}function $e(e,t,r,n,i,o){const a=document.createElementNS(W,"filter");a.setAttribute("id",e),a.setAttribute("filterUnits","userSpaceOnUse"),a.setAttribute("color-interpolation-filters","sRGB"),a.setAttribute("x","0"),a.setAttribute("y","0"),a.setAttribute("width",String(t)),a.setAttribute("height",String(r));const l=d=>(i*d).toFixed(2);a.innerHTML=`<feImage href="${n.disp}" x="0" y="0" width="${t}" height="${r}" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${l(1)}" xChannelSelector="R" yChannelSelector="G" result="dr"/><feColorMatrix in="dr" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${l(1-o)}" xChannelSelector="R" yChannelSelector="G" result="dg"/><feColorMatrix in="dg" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${l(1-2*o)}" xChannelSelector="R" yChannelSelector="G" result="db"/><feColorMatrix in="db" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b"/><feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/><feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" result="glass"/><feImage href="${n.spec}" x="0" y="0" width="${t}" height="${r}" preserveAspectRatio="none" result="spec"/><feComposite in="spec" in2="glass" operator="over"/>`,qe().appendChild(a)}const $=new Map,ie=new Map;let Te=0;function Re(e,t,r){let n=$.get(t);if(n?($.delete(t),$.set(t,n)):(n=`lg-${++Te}`,r(n),$.set(t,n)),ie.set(e,t),$.size>48){const i=new Set(ie.values());for(const[o,a]of $){if($.size<=40)break;i.has(o)||($.delete(o),document.getElementById(a)?.remove())}}return n}const G=new WeakMap;function A(e){if(!B||G.has(e))return;const t=e.querySelector(":scope > .lg__fx");if(!t)return;const r=e.dataset.lg&&ee[e.dataset.lg]?e.dataset.lg:"card",n=ee[r];let i="";const o=()=>{const a=Math.round(e.offsetWidth),l=Math.round(e.offsetHeight);if(a<4||l<4)return;const d=Math.min(parseFloat(getComputedStyle(e).borderTopLeftRadius)||l/2,a/2,l/2),s=`${r}:${a}x${l}:${Math.round(d)}`;if(s===i)return;i=s;const u=Re(e,s,p=>$e(p,a,l,Ae(a,l,d,Math.min(n.bezel,l/2-1),n.spec),n.shift*2,n.aberration));t.style.backdropFilter=`blur(var(--lg-blur, ${n.blur}px)) url(#${u}) saturate(var(--lg-sat, ${n.sat}%)) brightness(1.03)`};if(G.set(e,o),o(),"ResizeObserver"in window){let a=0;new ResizeObserver(()=>{clearTimeout(a),a=window.setTimeout(o,70)}).observe(e)}}function D(e){e&&G.get(e)?.()}function je(e){if(Le||!matchMedia("(pointer: fine)").matches)return;const t=e.querySelector(":scope > .lg__shine");t&&e.addEventListener("pointermove",r=>{const n=e.getBoundingClientRect();t.style.setProperty("--lg-mx",`${((r.clientX-n.left)/n.width*100).toFixed(1)}%`),t.style.setProperty("--lg-my",`${((r.clientY-n.top)/n.height*100).toFixed(1)}%`)})}function De(e=document){B&&document.documentElement.classList.add("lg-refract");const t=Array.from(e.querySelectorAll(".lg[data-lg]")),r=B&&"IntersectionObserver"in window?new IntersectionObserver(n=>{for(const i of n)i.isIntersecting&&(A(i.target),r.unobserve(i.target))},{rootMargin:"160px"}):null;for(const n of t)je(n),r?r.observe(n):A(n);window.LiquidGlass={attach:A,refresh:D,refract:B}}function ce(e,t){for(const r of document.elementsFromPoint(e,t)){if(r.closest(".lnav, .toc, .site-search, .lg"))continue;const n=r.closest("[data-tone]");if(n)return n.getAttribute("data-tone")==="light";const i=getComputedStyle(r).backgroundColor.match(/\d+(\.\d+)?/g);if(i&&(i.length<4||+i[3]>.5))return+i[0]*.3+ +i[1]*.59+ +i[2]*.11>170}return null}function P(e){if(!e||e.hidden)return;const t=e.getBoundingClientRect();if(t.width<4||t.height<4)return;let r=!1;for(const n of[.2,.8])for(const i of[t.top+14,t.top+t.height/2,t.bottom-14])i>0&&i<innerHeight&&ce(t.left+t.width*n,i)&&(r=!0);e.classList.toggle("is-light",r)}function He(){const e=document.querySelector("[data-lnav]");if(!e)return;const t=e.querySelector(".lnav__links"),r=e.querySelector(".lnav__lens"),n=Array.from(e.querySelectorAll(".lnav__group")),i=e.querySelector(".lnav__toggle"),o=e.querySelector(".lnav__sheet"),a=matchMedia("(hover: hover) and (pointer: fine)");e.querySelectorAll(".lnav__island").forEach(f=>A(f));const l=()=>n.forEach(f=>{const b=f.querySelector(".lnav__drop");b&&A(b)});"requestIdleCallback"in window?requestIdleCallback(l,{timeout:1500}):setTimeout(l,600);let d=0,s=null;const u=f=>{if(!r||!t)return;const b=t.getBoundingClientRect(),S=f.getBoundingClientRect();r.style.width=`${S.width}px`,r.style.setProperty("--lens-x",`${S.left-b.left}px`),r.classList.add("is-on"),A(r),clearTimeout(d),d=window.setTimeout(()=>D(r),480)},p=()=>{const b=n.find(S=>S.classList.contains("is-open"))?.querySelector(".lnav__link")??s;b?u(b):r?.classList.remove("is-on")};t&&(t.querySelectorAll(".lnav__link").forEach(f=>{f.addEventListener("pointerenter",()=>{s=f,u(f)}),f.addEventListener("pointerleave",()=>{s===f&&(s=null)}),f.addEventListener("focus",()=>u(f)),f.addEventListener("pointerdown",()=>r?.classList.add("is-pressed"))}),document.addEventListener("pointerup",()=>r?.classList.remove("is-pressed")),t.addEventListener("pointerleave",()=>{s=null,p()}));const h=(f,b)=>{if(f.classList.toggle("is-open",b),f.querySelector(".lnav__link")?.setAttribute("aria-expanded",b?"true":"false"),b){const S=f.querySelector(".lnav__drop");S&&(P(S),A(S),D(S))}},v=f=>n.forEach(b=>{b!==f&&h(b,!1)});n.forEach(f=>{const b=f.querySelector(".lnav__link");let S=0;b.addEventListener("click",()=>{const T=!f.classList.contains("is-open");v(f),h(f,T)}),f.addEventListener("pointerenter",()=>{a.matches&&(clearTimeout(S),v(f),h(f,!0))}),f.addEventListener("pointerleave",()=>{a.matches&&(S=window.setTimeout(()=>{h(f,!1),p()},220))})}),document.addEventListener("click",f=>{f.target.closest?.(".lnav__group")||v()});const k=f=>{!o||!i||(o.hidden=!f,i.setAttribute("aria-expanded",f?"true":"false"),i.setAttribute("aria-label",f?"Close menu":"Open menu"),f&&(P(o),A(o),D(o)))};i?.addEventListener("click",()=>k(!!o?.hidden)),document.addEventListener("keydown",f=>{if(f.key!=="Escape")return;const b=n.find(S=>S.classList.contains("is-open"));v(),b&&b.querySelector(".lnav__link")?.focus(),o&&!o.hidden&&(k(!1),i?.focus())});const q=()=>{const f=[innerWidth*.3,innerWidth*.7].some(b=>ce(b,42));e.classList.toggle("is-on-light",f);for(const b of n)b.classList.contains("is-open")&&P(b.querySelector(".lnav__drop"));o&&!o.hidden&&P(o)},c=e.querySelector("[data-lnav-now]"),m=Array.from(document.querySelectorAll("main section[data-nav-label]")),z=document.body.dataset.pageTitle||document.title;let E="";const x=()=>{if(!c)return;const f=innerHeight*.35;let b="";for(const S of m){const T=S.getBoundingClientRect();if(T.top<=f&&T.bottom>f){b=S.dataset.navLabel||"";break}}b=(b||z).replace(/\s+/g," ").trim(),b.length>34&&(b=`${b.slice(0,32)}…`),b!==E&&(E=b,c.textContent=b)};e.addEventListener("pointerenter",()=>e.classList.add("is-peek")),e.addEventListener("pointerleave",()=>e.classList.remove("is-peek"));let _=scrollY,g=!1,w=0,M=0;const L=()=>{w=performance.now(),x(),q()},C=()=>{const f=scrollY;performance.now()-w>120&&L(),clearTimeout(M),M=window.setTimeout(L,90),!(o&&!o.hidden||n.some(S=>S.classList.contains("is-open")))&&f>_+2&&f>420&&e.classList.add("is-compact"),(f<_-6||f<420)&&e.classList.remove("is-compact"),_=f,g=!1};addEventListener("scroll",()=>{g||(g=!0,requestAnimationFrame(C))},{passive:!0}),addEventListener("resize",q,{passive:!0}),q(),x()}const Ne=e=>Math.max(0,Math.min(1,e));function Ie(){const e=document.querySelector("[data-toc]");if(!e)return;const t=Array.from(e.querySelectorAll("[data-toc-link]")),r=t.map(g=>({a:g,el:document.getElementById(decodeURIComponent(g.hash.slice(1)))})).filter(g=>!!g.el),n=e.querySelector(".toc__list"),i=e.querySelector("[data-toc-bar]"),o=e.querySelector("[data-toc-ring]"),a=e.querySelector("[data-toc-now]"),l=e.querySelector("[data-toc-toggle]"),d=e.querySelector(".toc__panel"),s=document.querySelector("[data-doc]"),u=matchMedia("(max-width: 1099px)");let p=-1;const h=g=>{if(g===p)return;p=g,r.forEach((M,L)=>{M.a.classList.toggle("is-active",L===g),L===g?M.a.setAttribute("aria-current","location"):M.a.removeAttribute("aria-current")});const w=r[g];if(w&&(a&&(a.textContent=w.a.querySelector(".toc__text")?.textContent||""),n&&!u.matches&&n.scrollHeight>n.clientHeight)){const M=w.a.offsetTop-n.offsetTop;(M<n.scrollTop+8||M>n.scrollTop+n.clientHeight-48)&&n.scrollTo({top:M-n.clientHeight/3,behavior:"smooth"})}};let v=[],k=0,q=1;const c=()=>{const g=scrollY;if(v=r.map(w=>w.el.getBoundingClientRect().top+g),s){const w=s.getBoundingClientRect();k=w.top+g,q=w.height}},m=()=>{const g=innerHeight*.35,w=scrollY;let M=0;for(let L=0;L<v.length&&v[L]-w-g<=0;L++)M=L;if(h(M),s){const L=Ne((innerHeight*.3-(k-w))/Math.max(1,q-innerHeight*.55));i&&(i.style.transform=`scaleX(${L.toFixed(4)})`),o&&(o.style.strokeDashoffset=(94.25*(1-L)).toFixed(2))}},z=()=>{c(),m()};c();const E=document.querySelector("main");E&&"ResizeObserver"in window&&new ResizeObserver(z).observe(E),document.fonts?.ready.then(z),addEventListener("load",z);let x=!1;addEventListener("scroll",()=>{x||(x=!0,requestAnimationFrame(()=>{m(),x=!1}))},{passive:!0}),addEventListener("resize",z,{passive:!0}),m();const _=g=>{if(e.classList.toggle("is-open",g),l?.setAttribute("aria-expanded",g?"true":"false"),g&&d){A(d),D(d);const w=r[p]?.a;requestAnimationFrame(()=>w?.scrollIntoView({block:"center"}))}};l?.addEventListener("click",()=>_(!e.classList.contains("is-open"))),e.querySelector("[data-toc-close]")?.addEventListener("click",()=>{_(!1),l?.focus()}),t.forEach(g=>g.addEventListener("click",()=>{u.matches&&_(!1)})),e.querySelector(".toc__top")?.addEventListener("click",()=>{u.matches&&_(!1)}),document.addEventListener("keydown",g=>{g.key==="Escape"&&e.classList.contains("is-open")&&(_(!1),l?.focus())}),document.addEventListener("click",g=>{if(!e.classList.contains("is-open"))return;const w=g.target;(w===e||!e.contains(w))&&_(!1)}),u.addEventListener?.("change",()=>_(!1))}const j=e=>(e||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9#]+/g," ").trim(),V=e=>e.replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]),Fe=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");function Oe(e){const t=[];for(const r of e){const n=(r.crumbs||[]).filter(i=>i!=="Home").join(" / ");t.push({title:r.title,url:r.url,crumbs:n||"Home",text:r.desc||r.text||"",titleN:j(r.title),hay:j(`${r.title} ${r.desc||""} ${r.text||""}`),page:!0});for(const i of r.sections||[])t.push({title:i.title,url:i.url,crumbs:[n,r.title].filter(Boolean).join(" / ")||r.title,text:i.text,titleN:j(i.title),hay:j(`${i.title} ${i.text}`),page:!1})}return t}function Pe(e,t,r){let n=0;for(const i of t){const o=e.titleN.includes(i),a=e.hay.indexOf(i);if(!o&&a<0)return 0;o&&(n+=e.titleN.startsWith(i)||e.titleN.includes(` ${i}`)?14:9),a>=0&&(n+=3)}return t.length>1&&e.hay.includes(r)&&(n+=8),n*(e.page?1.1:1)}function Ue(e,t){const r=e.toLowerCase();let n=-1;for(const a of t){const l=r.indexOf(a);l>=0&&(n<0||l<n)&&(n=l)}const i=Math.max(0,n-70);let o=e.slice(i,i+190).trim();return i>0&&(o=`…${o}`),i+190<e.length&&(o+="…"),o}function oe(e,t){const r=V(e);return t.length?r.replace(new RegExp(`(${t.map(Fe).join("|")})`,"gi"),"<mark>$1</mark>"):r}function Be(){const e=document.getElementById("site-search");if(!e)return;const t=e.querySelector("[data-search-input]"),r=e.querySelector("[data-search-results]"),n=e.querySelector("[data-search-meta]"),i=Array.from(document.querySelectorAll("[data-search-open]")),o=document.documentElement.dataset.root||"";let a=null,l=null,d=null,s=-1;const u=()=>a?Promise.resolve(a):(l||(l=new Promise(c=>{if(window.NKU_SEARCH_INDEX)return c(window.NKU_SEARCH_INDEX);const m=document.createElement("script");m.src=`${o}js/search-data.js`,m.onload=()=>c(window.NKU_SEARCH_INDEX||[]),m.onerror=()=>c([]),document.head.appendChild(m)}).then(c=>a=Oe(c))),l),p=()=>Array.from(r.querySelectorAll(".site-search__result")),h=c=>{const m=p();s=m.length?(c+m.length)%m.length:-1,m.forEach((z,E)=>z.classList.toggle("is-active",E===s)),m[s]?.scrollIntoView({block:"nearest"})},v=()=>{const c=t.value.trim(),m=j(c).split(" ").filter(Boolean).slice(0,8);if(s=-1,!m.length){r.innerHTML="",n.textContent="Type a word to search every page.";return}if(!a){n.textContent="Loading the index…";return}const z=m.join(" "),E=a.map(x=>({d:x,s:Pe(x,m,z)})).filter(x=>x.s>0).sort((x,_)=>_.s-x.s).slice(0,24);if(n.textContent=E.length?`${E.length}${E.length===24?"+":""} result${E.length===1?"":"s"} for “${c}”`:"",!E.length){r.innerHTML=`<p class="site-search__empty">Nothing found for “${V(c)}”. Try a shorter or different word.</p>`;return}r.innerHTML=E.map(({d:x})=>`<a class="site-search__result" href="${V(o+x.url)}"><span class="site-search__crumbs">${V(x.crumbs)}</span><span class="site-search__title">${oe(x.title,m)}</span><span class="site-search__snippet">${oe(Ue(x.text,m),m)}</span></a>`).join("")},k=()=>{if(!e.hidden)return;d=document.activeElement,e.hidden=!1,document.documentElement.classList.add("search-open"),i.forEach(z=>z.setAttribute("aria-expanded","true"));const c=e.querySelector(".site-search__panel"),m=window.LiquidGlass;c&&m&&m.attach(c),requestAnimationFrame(()=>{e.classList.add("is-open"),t.focus(),t.select()}),u().then(v)},q=()=>{e.hidden||(e.classList.remove("is-open"),document.documentElement.classList.remove("search-open"),i.forEach(c=>c.setAttribute("aria-expanded","false")),window.setTimeout(()=>{e.hidden=!0},180),d?.focus?.())};i.forEach(c=>c.addEventListener("click",m=>{m.preventDefault(),k()})),e.querySelectorAll("[data-search-close]").forEach(c=>c.addEventListener("click",q)),t.addEventListener("input",v),r.addEventListener("click",c=>{c.target.closest("a")&&q()}),document.addEventListener("keydown",c=>{const m=/^(input|textarea|select)$/i.test(c.target.tagName)||c.target.isContentEditable;if(e.hidden){(c.key==="/"&&!m||(c.metaKey||c.ctrlKey)&&c.key.toLowerCase()==="k")&&(c.preventDefault(),k());return}if(c.key==="Escape")c.preventDefault(),q();else if(c.key==="ArrowDown")c.preventDefault(),h(s+1);else if(c.key==="ArrowUp")c.preventDefault(),h(s-1);else if(c.key==="Enter"&&document.activeElement===t){const z=p()[s>=0?s:0];z&&(c.preventDefault(),z.click())}else if(c.key==="Tab"){const z=Array.from(e.querySelectorAll("button, input, a[href]")).filter(_=>_.offsetParent!==null),E=z[0],x=z[z.length-1];c.shiftKey&&document.activeElement===E?(c.preventDefault(),x.focus()):!c.shiftKey&&document.activeElement===x&&(c.preventDefault(),E.focus())}})}function Ve(){const e=document.querySelector("[data-detective]");if(!e)return;const t=e.querySelector(".detective__btn"),r=e.querySelector(".detective__bubble");if(!t||!r)return;const n=matchMedia("(prefers-reduced-motion: reduce)").matches,i=matchMedia("(max-width: 1099px)"),o=()=>["Lost? Tap me to go back to the top.",i.matches?"The outline button at the bottom jumps between sections.":"The outline on the left jumps between sections.","Search lives in the top bar. Press <b>/</b> to open it."];let a=0,l=0;const d=(s,u=4800)=>{r.innerHTML=s,e.classList.add("show-bubble"),clearTimeout(l),l=window.setTimeout(()=>e.classList.remove("show-bubble"),u)};window.NKUDetective={say:d,el:e,lit:()=>{},aim:()=>{},torchTip:()=>null},t.addEventListener("click",()=>window.scrollTo({top:0,behavior:n?"auto":"smooth"})),t.addEventListener("pointerenter",()=>{const s=o();d(s[a++%s.length])}),t.addEventListener("focus",()=>{const s=o();d(s[a++%s.length])})}function Ye(){document.querySelectorAll("[data-doc] :is(h2, h3)[id]").forEach(r=>{if(r.querySelector("a"))return;const n=document.createElement("a");n.className="heading-anchor",n.href=`#${r.id}`,n.textContent="#",n.setAttribute("aria-label",`Link to “${(r.textContent||"").trim()}”`),r.appendChild(n)});const e=Array.from(document.querySelectorAll(".table-wrap")),t=()=>e.forEach(r=>r.classList.toggle("is-scrollable",r.scrollWidth>r.clientWidth+2));t(),addEventListener("resize",t,{passive:!0})}const ae=120,We=65;function Ge(){const e=document.documentElement,t=matchMedia("(pointer: fine)"),r=matchMedia("(prefers-reduced-motion: reduce)"),n=()=>t.matches&&!r.matches;let i=scrollY,o=scrollY,a=scrollY,l=0,d=0,s=ae,u=0,p=0;const h=()=>{p=Math.max(0,e.scrollHeight-innerHeight)};h(),"ResizeObserver"in window&&new ResizeObserver(h).observe(document.body),addEventListener("resize",h,{passive:!0});const v=x=>{scrollTo({top:x,behavior:"instant"}),a=scrollY},k=x=>{l=0;const _=Math.min(64,Math.max(1,x-d));d=x,i+=(o-i)*(1-Math.exp(-_/s)),Math.abs(o-i)<.4&&(i=o),v(i),i!==o&&(l=requestAnimationFrame(k))},q=()=>{l&&cancelAnimationFrame(l),l=0,i=o=a=scrollY};addEventListener("scroll",()=>{if(!l)return;const x=scrollY-a;Math.abs(x)>1&&(i+=x,o+=x,a=scrollY)},{passive:!0});const c=new WeakMap,m=x=>{let _=c.get(x);if(!_){const g=getComputedStyle(x);_=[g.overflowY,g.overscrollBehaviorY],c.set(x,_)}return _},z=(x,_)=>{if(e.classList.contains("search-open"))return!0;if(!x||!x.closest)return!1;if(x.closest('[data-free-scroll], dialog, [aria-modal="true"], .lnav__drop, .lnav__sheet, wiki-toolkit'))return!0;for(let g=x;g&&g!==document.body&&g!==e;g=g.parentElement){if(g.scrollHeight<=g.clientHeight+1)continue;const[w,M]=m(g);if(w!=="auto"&&w!=="scroll"&&w!=="overlay")continue;if((_>0?g.scrollTop+g.clientHeight<g.scrollHeight-1:g.scrollTop>0)||M==="contain"||M==="none")return!0}return!1};addEventListener("wheel",x=>{if(!n()||x.defaultPrevented||x.ctrlKey||x.metaKey||x.shiftKey)return;let _=x.deltaY,g=x.deltaX;if(x.deltaMode===1?(_*=16,g*=16):x.deltaMode===2&&(_*=innerHeight,g*=innerWidth),!_||Math.abs(g)>Math.abs(_))return;if(z(x.target,_)){q();return}x.preventDefault();const w=performance.now();s=x.deltaMode!==0||Math.abs(_)>=50&&w-u>=25?ae:We,u=w,l||(i=o=a=scrollY),o=Math.max(0,Math.min(p,o+_)),!l&&o!==i&&(d=w,l=requestAnimationFrame(k))},{passive:!1});const E=()=>{l&&q()};addEventListener("pointerdown",E,{passive:!0}),addEventListener("keydown",E,{passive:!0}),addEventListener("touchstart",E,{passive:!0}),addEventListener("hashchange",E),document.addEventListener("visibilitychange",E),r.addEventListener?.("change",E)}function se(){De(),He(),Ie(),Be(),Ve(),Ye(),Ge()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",se):se();export{ft as A,ot as B,rt as C,be as D,R as _,y as a,we as b,xt as c,Xe as d,gt as e,X as f,me as g,Qe as h,H as i,ue as j,Ke as k,he as l,Ze as m,et as n,at as o,ct as p,tt as q,Je as r,pt as s,it as t,ge as u,nt as v,dt as w,ut as x,st as y,lt as z};
