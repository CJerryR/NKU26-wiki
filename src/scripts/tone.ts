/**
 * Which tone does a piece of glass need: light (over paper) or dark (over
 * the hero, the dark homepage scenes and the footer)?
 *
 * Every section already says so with data-tone. Instead of hit-testing on
 * every scroll frame, a band one or two pixels tall is laid across the
 * screen at the height of a glass control (IntersectionObserver with a
 * negative rootMargin). The observer fires only when a data-tone boundary
 * crosses that band, and the tone is read once, in the next frame.
 */
export type Tone = 'light' | 'dark';

/* glass controls and overlays are never "the page underneath" */
const SKIP = '.lnav, .lnav-scrim, .toc, .site-search, .lg, .lg-glass, .detective';

/** Tone of the page at (x, y); null if nothing there says. */
export function toneAt(x: number, y: number): Tone | null {
  if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return null;
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest(SKIP)) continue;
    const t = el.closest('[data-tone]');
    if (t) return t.getAttribute('data-tone') === 'dark' ? 'dark' : 'light';
    const m = getComputedStyle(el).backgroundColor.match(/\d+(\.\d+)?/g);
    if (m && (m.length < 4 || +m[3] > 0.5)) return +m[0] * 0.3 + +m[1] * 0.59 + +m[2] * 0.11 > 170 ? 'light' : 'dark';
  }
  return null;
}

/** A panel full of text turns light as soon as any part of it lies over the
 *  paper, so a menu reaching from the hero onto the page never shows white
 *  text on cream. */
export function panelTone(r: DOMRect): Tone | null {
  if (r.width < 4 || r.height < 4) return null;
  let seen: Tone | null = null;
  for (const fx of [0.2, 0.8]) {
    for (const y of [r.top + 14, r.top + r.height / 2, r.bottom - 14]) {
      const t = toneAt(r.left + r.width * fx, y);
      if (t === 'light') return 'light';
      if (t) seen = t;
    }
  }
  return seen;
}

export function setTone(el: Element | null | undefined, t: Tone | null): void {
  if (el && t && el.getAttribute('data-tone') !== t) el.setAttribute('data-tone', t);
}

/**
 * Calls `onCross` (in an animation frame) whenever a [data-tone] boundary
 * crosses the band at `bandY()`, after the page is resized, and once more
 * when scrolling stops (a safety net that costs one read per scroll).
 * Returns a function that re-reads bandY (call it when the control moves).
 */
export function watchTone(bandY: () => number, onCross: () => void): () => void {
  let io: IntersectionObserver | null = null, raf = 0, settle = 0;
  const fire = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onCross(); }); };
  const connect = () => {
    io?.disconnect();
    io = null;
    const H = innerHeight, y = Math.round(bandY());
    if (!('IntersectionObserver' in window) || y < 0 || y > H - 2) { fire(); return; }
    io = new IntersectionObserver(fire, { rootMargin: `${-y}px 0px ${-(H - y - 2)}px 0px`, threshold: 0 });
    document.querySelectorAll('[data-tone]').forEach((el) => { if (!el.closest(SKIP)) io!.observe(el); });
  };
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(connect, 120); }, { passive: true });
  addEventListener('scroll', () => { clearTimeout(settle); settle = window.setTimeout(fire, 180); }, { passive: true });
  addEventListener('load', fire);
  connect();
  return connect;
}
