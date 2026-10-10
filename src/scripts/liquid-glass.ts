/**
 * Liquid glass for the top bar, the page outline and the hero labels.
 * A TypeScript port of the team's liquid-glass.js (lib/liquid-glass.js in
 * the LiquidGlass demo): squircle bezel, Snell's law, an SDF displacement
 * map, RGB dispersion and a .lg-surface layer that carries the refraction.
 *
 * Changes for the site:
 *  - a .lg-surface already in the markup (LiquidGlass.astro) is reused, so a
 *    page without JavaScript still shows frosted glass;
 *  - frost and saturation come from CSS (--glass-blur, --glass-sat), so a
 *    switch between the light and dark tone never rebuilds a map;
 *  - while a surface changes size (the bar collapsing) the current map is
 *    stretched; the map for the new size is built once the size stops
 *    changing, and every size is built only once;
 *  - the rim highlight follows the pointer only; scrolling reads no layout.
 *
 * Only Chromium accepts url(#svg-filter) inside backdrop-filter. Other
 * browsers keep the frosted fallback from liquid-glass.css.
 */
export interface GlassOptions {
  ior: number;        // index of refraction: air 1.0, glass 1.5
  thickness: number;  // thickest point (px); thicker bends more at the rim
  bezel: number;      // width of the refracting rim (px)
  zoom: number;       // centre magnification (0–0.35), for lenses
  dispersion: number; // RGB channels bend by slightly different amounts
}

export const GLASS_DEFAULTS: GlassOptions = { ior: 1.5, thickness: 32, bezel: 24, zoom: 0, dispersion: 0.05 };

/* The bar's recipe is the LiquidTabBar demo's; panels use the same glass so
   a dropdown reads as the same material as the bar it hangs from. */
export const PRESETS: Record<string, Partial<GlassOptions>> = {
  bar: { thickness: 22, bezel: 18, ior: 1.5, dispersion: 0.04 },
  panel: { thickness: 22, bezel: 18, ior: 1.5, dispersion: 0.04 },
  pill: { thickness: 22, bezel: 18, ior: 1.5, dispersion: 0.04 },
  chip: { thickness: 12, bezel: 10, ior: 1.5, dispersion: 0.03 },
};

const SVG_NS = 'http://www.w3.org/2000/svg';

export function supportsSvgBackdrop(): boolean {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') return false;
  if (!CSS.supports('backdrop-filter', 'blur(1px)')) return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  if (Array.isArray(brands) && brands.some((b) => /Chromium/i.test(b.brand))) return true;
  const ua = navigator.userAgent;
  return /Chrome\/|Chromium\//.test(ua) && !/CriOS|FxiOS|EdgiOS|Firefox/.test(ua);
}
const SUPPORTED = supportsSvgBackdrop();
const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let defs: SVGDefsElement | null = null;
function ensureDefs(): SVGDefsElement {
  if (defs) return defs;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'lg-glass-defs');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  defs = document.createElementNS(SVG_NS, 'defs');
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}

/* Convex squircle cross-section: 0 = outer edge, 1 = the rim ends and the
   flat top begins. Softer than a circular arc, so a long bar has no crease. */
const squircle = (t: number) => Math.pow(1 - Math.pow(1 - t, 4), 0.25);

/** Refraction shift (px) along the rim, 128 samples = the 8-bit map's precision. */
function bezelProfile(ior: number, thickness: number, bezel: number, samples = 128): Float32Array {
  const out = new Float32Array(samples);
  const eps = 1e-3;
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const a = Math.max(0, t - eps), b = Math.min(1, t + eps);
    const slope = ((squircle(b) - squircle(a)) / (b - a)) * (thickness / bezel);
    const incidence = Math.atan(slope);
    const refracted = Math.asin(Math.sin(incidence) / ior);
    out[i] = squircle(t) * thickness * Math.tan(incidence - refracted);
  }
  return out;
}

export interface GlassMap { url: string; scale: number; width: number; height: number }

/* Maps are shared by every surface with the same size and recipe. */
const mapCache = new Map<string, GlassMap>();

/** Displacement map for a w×h rounded rectangle; `scale` feeds feDisplacementMap. */
export function computeDisplacementMap(w: number, h: number, radius: number, o: GlassOptions): GlassMap {
  const W = Math.max(2, Math.round(w)), H = Math.max(2, Math.round(h));
  const hw = W / 2, hh = H / 2;
  const r = Math.min(radius, hw, hh);
  const bezel = Math.max(1, Math.min(o.bezel, hw, hh));
  const key = `${W}x${H}r${Math.round(r)}:${o.ior}:${o.thickness}:${bezel}:${o.zoom}`;
  const hit = mapCache.get(key);
  if (hit) return hit;

  const N = 128;
  const profile = bezelProfile(o.ior, o.thickness, bezel, N);
  const vx = new Float32Array(W * H), vy = new Float32Array(W * H);
  let max = 0;
  for (let y = 0; y < H; y++) {
    const py = y + 0.5 - hh, sy = py < 0 ? -1 : 1;
    const qy = Math.abs(py) - (hh - r);
    for (let x = 0; x < W; x++) {
      const px = x + 0.5 - hw, sx = px < 0 ? -1 : 1;
      const qx = Math.abs(px) - (hw - r);
      // rounded-rectangle SDF: d = distance inside the edge, (nx, ny) = outward normal
      let d: number, nx: number, ny: number;
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1;
        d = r - l; nx = (qx / l) * sx; ny = (qy / l) * sy;
      } else if (qx > qy) { d = r - qx; nx = sx; ny = 0; } else { d = r - qy; nx = 0; ny = sy; }
      if (d < 0) continue;
      let dx = 0, dy = 0;
      if (d < bezel) {
        const m = profile[Math.min(N - 1, Math.round((d / bezel) * (N - 1)))];
        dx = -nx * m; dy = -ny * m; // a convex rim pulls light inwards
      }
      if (o.zoom) { dx -= px * o.zoom; dy -= py * o.zoom; }
      const i = y * W + x;
      vx[i] = dx; vy[i] = dy;
      const m2 = Math.max(Math.abs(dx), Math.abs(dy));
      if (m2 > max) max = m2;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const k = max > 0 ? 127 / max : 0;
  for (let i = 0, j = 0; i < W * H; i++, j += 4) {
    img.data[j] = 128 + vx[i] * k;
    img.data[j + 1] = 128 + vy[i] * k;
    img.data[j + 2] = 128;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const map = { url: canvas.toDataURL('image/png'), scale: max * 2, width: W, height: H };
  mapCache.set(key, map);
  return map;
}

function createFilter(id: string): SVGFilterElement {
  const f = document.createElementNS(SVG_NS, 'filter');
  f.setAttribute('id', id);
  f.setAttribute('filterUnits', 'userSpaceOnUse');
  f.setAttribute('primitiveUnits', 'userSpaceOnUse');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  // three shifts (R/G/B at slightly different strengths) = dispersion, merged with screen
  f.innerHTML = `
    <feImage result="map" x="0" y="0" preserveAspectRatio="none"></feImage>
    <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dr"></feDisplacementMap>
    <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dg"></feDisplacementMap>
    <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="db"></feDisplacementMap>
    <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"></feColorMatrix>
    <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"></feColorMatrix>
    <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"></feColorMatrix>
    <feBlend in="r" in2="g" mode="screen" result="rg"></feBlend>
    <feBlend in="rg" in2="b" mode="screen"></feBlend>`;
  ensureDefs().appendChild(f);
  return f;
}

/* ---- rim highlight: follows the pointer (no layout reads on scroll) ---- */
const lit = new Set<HTMLElement>();
let lightRaf = 0;
let pointer: [number, number] | null = null;
function updateLights(): void {
  lightRaf = 0;
  if (!pointer) return;
  for (const el of lit) {
    if (!el.isConnected) { lit.delete(el); continue; }
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const deg = (Math.atan2(pointer[0] - (r.left + r.width / 2), -(pointer[1] - (r.top + r.height / 2))) * 180) / Math.PI;
    el.style.setProperty('--glass-light', `${deg.toFixed(1)}deg`);
  }
}
if (typeof window !== 'undefined' && !REDUCED) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer = [e.clientX, e.clientY];
    if (!lightRaf) lightRaf = requestAnimationFrame(updateLights);
  }, { passive: true });
}

export interface Glass {
  readonly supported: boolean;
  readonly el: HTMLElement;
  set(next: Partial<GlassOptions>): void;
  /** Scales how strongly the glass bends light (pressed controls use 1.25). */
  setStrength(k: number): void;
  /** Apple: glass does not fade in, its bending grows until it is there. */
  materialize(ms?: number): void;
  /** Rebuild now (after a panel opens or changes size while hidden). */
  refresh(): void;
  destroy(): void;
}

const registry = new WeakMap<HTMLElement, Glass>();
let seq = 0;

function optionsFor(el: HTMLElement, opts?: Partial<GlassOptions>): GlassOptions {
  const preset = PRESETS[el.dataset.glass || ''] || PRESETS.bar;
  return { ...GLASS_DEFAULTS, ...preset, ...opts };
}

/** The glass controller for `el`, created on first use. */
export function glassFor(el: HTMLElement, opts?: Partial<GlassOptions>): Glass {
  const existing = registry.get(el);
  if (existing) { if (opts) existing.set(opts); return existing; }
  const g = createGlass(el, optionsFor(el, opts));
  registry.set(el, g);
  return g;
}

function createGlass(el: HTMLElement, o: GlassOptions): Glass {
  el.classList.add('lg-glass');
  el.classList.toggle('lg-fallback', !SUPPORTED);
  lit.add(el);

  let surface = el.querySelector<HTMLElement>(':scope > .lg-surface');
  const ownSurface = !surface;
  if (!surface) {
    surface = document.createElement('span');
    surface.className = 'lg-surface';
    surface.setAttribute('aria-hidden', 'true');
    el.prepend(surface);
  }
  const surf = surface;

  let strength = 1, map: GlassMap | null = null, raf = 0, settle = 0;
  let size = { w: 0, h: 0 };
  const id = `lg-glass-${++seq}`;
  const filter = SUPPORTED ? createFilter(id) : null;
  const feImage = filter?.querySelector('feImage') ?? null;
  const feMaps = filter ? Array.from(filter.querySelectorAll('feDisplacementMap')) : [];
  if (filter) surf.style.backdropFilter = `blur(var(--glass-blur, 1px)) url(#${id}) saturate(var(--glass-sat, 1.5))`;

  const applyScale = () => {
    if (!filter || !map) return;
    const s = map.scale * strength, k = o.dispersion;
    feMaps[0].setAttribute('scale', (s * (1 - k)).toFixed(2)); // red bends least
    feMaps[1].setAttribute('scale', s.toFixed(2));
    feMaps[2].setAttribute('scale', (s * (1 + k)).toFixed(2)); // blue bends most
  };
  /* the region follows the element at once; the current map stretches with it */
  const region = (w: number, h: number) => {
    if (!filter || !feImage) return;
    for (const [node, a, b] of [[filter, 'width', 'height'], [feImage, 'width', 'height']] as const) {
      node.setAttribute(a, String(w)); node.setAttribute(b, String(h));
    }
  };
  const build = () => {
    settle = 0;
    const { w, h } = size;
    if (!w || !h || !filter || !feImage) return;
    const raw = getComputedStyle(surf).borderTopLeftRadius.split(' ')[0];
    const num = parseFloat(raw) || 0;
    const radius = raw.endsWith('%') ? (num / 100) * Math.min(w, h) : num;
    const next = computeDisplacementMap(w, h, radius, o);
    if (next !== map) { map = next; feImage.setAttribute('href', map.url); }
    applyScale();
  };
  const measure = () => {
    raf = 0;
    const w = surf.offsetWidth, h = surf.offsetHeight;
    if (!w || !h) return;
    if (w === size.w && h === size.h && map) return;
    size = { w, h };
    region(w, h);
    clearTimeout(settle);
    if (!map) build(); else settle = window.setTimeout(build, 140);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };

  const ro = new ResizeObserver(schedule);
  ro.observe(el);
  /* a radius transition does not fire ResizeObserver */
  const onEnd = (e: TransitionEvent) => { if (e.target === el && /radius|width|height/.test(e.propertyName)) { map = null; schedule(); } };
  el.addEventListener('transitionend', onEnd);
  schedule();

  return {
    supported: SUPPORTED,
    el,
    set(next) {
      const needsMap = (['ior', 'thickness', 'bezel', 'zoom'] as const).some((k) => k in next && next[k] !== o[k]);
      Object.assign(o, next);
      if (needsMap) { map = null; schedule(); } else applyScale();
    },
    setStrength(v) { strength = v; applyScale(); },
    materialize(ms = 800) {
      if (REDUCED || !filter) { strength = 1; applyScale(); return; }
      const t0 = performance.now();
      strength = 0; applyScale();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        strength = 1 - Math.pow(1 - p, 3);
        applyScale();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    refresh() { size = { w: 0, h: 0 }; measure(); },
    destroy() {
      ro.disconnect(); lit.delete(el); clearTimeout(settle);
      el.removeEventListener('transitionend', onEnd);
      filter?.remove();
      surf.style.backdropFilter = '';
      if (ownSurface) surf.remove();
      el.classList.remove('lg-glass', 'lg-fallback');
      registry.delete(el);
    },
  };
}

/** Every [data-glass] element gets its glass once it comes near the screen. */
export function initLiquidGlass(root: ParentNode = document): void {
  const all = Array.from(root.querySelectorAll<HTMLElement>('[data-glass]'));
  if (!SUPPORTED) { all.forEach((el) => el.classList.add('lg-fallback')); }
  if (!('IntersectionObserver' in window)) { all.forEach((el) => glassFor(el)); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { glassFor(e.target as HTMLElement); io.unobserve(e.target); }
  }, { rootMargin: '200px' });
  all.forEach((el) => { if (!registry.has(el)) io.observe(el); });
}
