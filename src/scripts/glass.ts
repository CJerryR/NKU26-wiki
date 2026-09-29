/**
 * Liquid glass engine for inner pages — a port of static/js/shell.js
 * (optics after kube.io, "Liquid Glass in the Browser").
 *
 * Chromium gets true refraction: an SVG displacement map per glass size,
 * used as a backdrop-filter. Safari and Firefox keep the frosted CSS
 * fallback from glass.css. Changes from v6:
 *  - elements with the same preset and size share one filter;
 *  - filters are built only once an element is on screen or opened;
 *  - the blur under refraction comes from --lg-blur, so a context (for
 *    example the bar over white paper) can soften it without new maps.
 */
type Preset = { bezel: number; shift: number; aberration: number; spec: number; blur: number; sat: number };

/* One optical recipe, the top bar's, for every surface.
   bezel: refracting rim (px; 999 = the whole pane, as on the bar)
   shift: largest inward shift (px) · aberration: channel split
   spec: rim light · blur/sat: backdrop (blur is only the fallback for
   --lg-blur, which glass.css sets per surface and tone). */
const BAR = { shift: 13, aberration: 0.06, spec: 0.55, blur: 0.35, sat: 150 };
const PANEL = { ...BAR, bezel: 28 }; // big panels: the bar's rim width, a flat middle
export const PRESETS: Record<string, Preset> = {
  bar: { ...BAR, bezel: 999 },
  pill: { ...BAR, bezel: 999 },
  chip: { ...BAR, bezel: 999, shift: 8 },
  lens: { bezel: 999, shift: 9, aberration: 0.05, spec: 0.45, blur: 0, sat: 140 },
  panel: PANEL, drop: PANEL, sheet: PANEL, card: PANEL,
};

const SVGNS = 'http://www.w3.org/2000/svg';
const ua = navigator.userAgent;
export const REFRACT = /Chrome\/|Chromium\//.test(ua) && !/CriOS|FxiOS|EdgiOS|Firefox/.test(ua)
  && typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'blur(1px)');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

let defs: Element | null = null;
function ensureDefs(): Element {
  if (defs) return defs;
  let host = document.querySelector('.lg-defs');
  if (!host) {
    host = document.createElementNS(SVGNS, 'svg');
    host.setAttribute('class', 'lg-defs');
    host.setAttribute('aria-hidden', 'true');
    (host as SVGElement).style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    document.body.appendChild(host);
  }
  defs = host.querySelector('defs') || host.appendChild(document.createElementNS(SVGNS, 'defs'));
  return defs;
}

const profiles = new Map<string, Float32Array>();
function bezelProfile(bezel: number, thickness: number): Float32Array {
  const key = `${bezel}:${thickness}`;
  const hit = profiles.get(key);
  if (hit) return hit;
  const N = 128, out = new Float32Array(N), n = 1.5;
  let max = 0;
  const h = (x: number) => { x = Math.max(0, Math.min(1, x)); return 1 - (1 - x) * (1 - x); };
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1), e = 0.002;
    const slope = ((h(x + e) - h(x - e)) / (2 * e)) * (thickness / bezel);
    let nx = -slope, nz = 1;
    const L = Math.sqrt(nx * nx + nz * nz); nx /= L; nz /= L;
    const eta = 1 / n, cosi = nz, k = 1 - eta * eta * (1 - cosi * cosi);
    if (k < 0) { out[i] = 0; continue; }
    const c = eta * cosi - Math.sqrt(k), tx = c * nx, tz = -eta + c * nz;
    const depth = h(x) * thickness;
    const d = tz < 0 ? (tx / -tz) * depth : 0;
    out[i] = d;
    if (Math.abs(d) > max) max = Math.abs(d);
  }
  for (let i = 0; i < N; i++) out[i] = max ? out[i] / max : 0;
  profiles.set(key, out);
  return out;
}

function edgeField(x: number, y: number, hw: number, hh: number, r: number): [number, number, number] {
  const ax = Math.abs(x), ay = Math.abs(y), qx = ax - (hw - r), qy = ay - (hh - r);
  let dist: number, nx: number, ny: number;
  if (qx > 0 && qy > 0) { const L = Math.sqrt(qx * qx + qy * qy) || 1e-6; dist = r - L; nx = qx / L; ny = qy / L; }
  else if (qx > qy) { dist = hw - ax; nx = 1; ny = 0; }
  else { dist = hh - ay; nx = 0; ny = 1; }
  return [dist, x < 0 ? -nx : nx, y < 0 ? -ny : ny];
}

function maps(w: number, h: number, radius: number, bezel: number, specular: number) {
  const s = 0.5, cw = Math.max(2, Math.round(w * s)), ch = Math.max(2, Math.round(h * s));
  const prof = bezelProfile(bezel, bezel * 1.15);
  const c1 = document.createElement('canvas'); c1.width = cw; c1.height = ch;
  const c2 = document.createElement('canvas'); c2.width = Math.round(w); c2.height = Math.round(h);
  const x1 = c1.getContext('2d')!, x2 = c2.getContext('2d')!;
  const d1 = x1.createImageData(cw, ch), D = d1.data;
  const r = Math.min(radius, w / 2, h / 2), hw = w / 2, hh = h / 2;
  for (let py = 0; py < ch; py++) for (let px = 0; px < cw; px++) {
    const f = edgeField((px + 0.5) / s - hw, (py + 0.5) / s - hh, hw, hh, r);
    const t = f[0] / bezel, m = t < 1 && t >= 0 ? prof[Math.min(127, Math.round(t * 127))] : 0;
    const i = (py * cw + px) * 4;
    D[i] = 128 - f[1] * m * 127; D[i + 1] = 128 - f[2] * m * 127; D[i + 2] = 128; D[i + 3] = 255;
  }
  x1.putImageData(d1, 0, 0);
  const W2 = c2.width, H2 = c2.height, d2 = x2.createImageData(W2, H2), S = d2.data;
  const lx = -0.55, ly = -0.84;
  for (let py = 0; py < H2; py++) for (let px = 0; px < W2; px++) {
    const f = edgeField(px + 0.5 - hw, py + 0.5 - hh, hw, hh, r);
    if (f[0] < 0 || f[0] > 3.2) continue;
    const dot = f[1] * lx + f[2] * ly, lit = dot > 0 ? Math.pow(dot, 2.2) : Math.pow(-dot, 3) * 0.45;
    const fall = f[0] < 1 ? f[0] : Math.max(0, 1 - (f[0] - 1) / 2.2);
    const a = lit * fall * specular;
    if (a < 0.004) continue;
    const i = (py * W2 + px) * 4; S[i] = S[i + 1] = S[i + 2] = 255; S[i + 3] = Math.round(a * 255);
  }
  x2.putImageData(d2, 0, 0);
  return { disp: c1.toDataURL(), spec: c2.toDataURL() };
}

function buildFilter(id: string, w: number, h: number, m: { disp: string; spec: string }, scale: number, a: number) {
  const f = document.createElementNS(SVGNS, 'filter');
  f.setAttribute('id', id);
  f.setAttribute('filterUnits', 'userSpaceOnUse');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  f.setAttribute('x', '0'); f.setAttribute('y', '0');
  f.setAttribute('width', String(w)); f.setAttribute('height', String(h));
  const sc = (k: number) => (scale * k).toFixed(2);
  f.innerHTML =
    `<feImage href="${m.disp}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${sc(1)}" xChannelSelector="R" yChannelSelector="G" result="dr"/>` +
    '<feColorMatrix in="dr" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/>' +
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${sc(1 - a)}" xChannelSelector="R" yChannelSelector="G" result="dg"/>` +
    '<feColorMatrix in="dg" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/>' +
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${sc(1 - 2 * a)}" xChannelSelector="R" yChannelSelector="G" result="db"/>` +
    '<feColorMatrix in="db" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b"/>' +
    '<feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/>' +
    '<feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" result="glass"/>' +
    `<feImage href="${m.spec}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="spec"/>` +
    '<feComposite in="spec" in2="glass" operator="over"/>';
  ensureDefs().appendChild(f);
}

/* filters are shared by key and the least recently used unused ones are dropped */
const cache = new Map<string, string>();
const inUse = new Map<Element, string>();
let uid = 0;
function acquire(el: Element, key: string, build: (id: string) => void): string {
  let id = cache.get(key);
  if (id) { cache.delete(key); cache.set(key, id); }
  else { id = `lg-${++uid}`; build(id); cache.set(key, id); }
  inUse.set(el, key);
  if (cache.size > 48) {
    const live = new Set(inUse.values());
    for (const [k, fid] of cache) {
      if (cache.size <= 40) break;
      if (!live.has(k)) { cache.delete(k); document.getElementById(fid)?.remove(); }
    }
  }
  return id;
}

const updaters = new WeakMap<Element, () => void>();

export function attach(el: HTMLElement): void {
  if (!REFRACT || updaters.has(el)) return;
  const fx = el.querySelector<HTMLElement>(':scope > .lg__fx');
  if (!fx) return;
  const name = el.dataset.lg && PRESETS[el.dataset.lg] ? el.dataset.lg : 'card';
  const p = PRESETS[name];
  let last = '';
  const update = () => {
    const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
    if (w < 4 || h < 4) return;
    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || h / 2, w / 2, h / 2);
    const key = `${name}:${w}x${h}:${Math.round(radius)}`;
    if (key === last) return;
    last = key;
    const id = acquire(el, key, (fid) => buildFilter(fid, w, h, maps(w, h, radius, Math.min(p.bezel, h / 2 - 1), p.spec), p.shift * 2, p.aberration));
    fx.style.backdropFilter = `blur(var(--lg-blur, ${p.blur}px)) url(#${id}) saturate(var(--lg-sat, ${p.sat}%)) brightness(1.03)`;
  };
  updaters.set(el, update);
  update();
  if ('ResizeObserver' in window) {
    let t = 0;
    new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(update, 70); }).observe(el);
  }
}

export function refresh(el: Element | null | undefined): void {
  if (el) updaters.get(el)?.();
}

function sheen(el: HTMLElement): void {
  if (REDUCED || !matchMedia('(pointer: fine)').matches) return;
  const shine = el.querySelector<HTMLElement>(':scope > .lg__shine');
  if (!shine) return;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    shine.style.setProperty('--lg-mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    shine.style.setProperty('--lg-my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  });
}

export function initGlass(root: ParentNode = document): void {
  if (REFRACT) document.documentElement.classList.add('lg-refract');
  const all = Array.from(root.querySelectorAll<HTMLElement>('.lg[data-lg]'));
  const io = REFRACT && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { attach(e.target as HTMLElement); io!.unobserve(e.target); }
    }, { rootMargin: '160px' })
    : null;
  for (const el of all) {
    sheen(el);
    if (io) io.observe(el); else attach(el);
  }
  (window as unknown as { LiquidGlass: unknown }).LiquidGlass = { attach, refresh, refract: REFRACT };
}
