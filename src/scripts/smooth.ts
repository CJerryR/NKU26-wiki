/**
 * v7.7: damped wheel scrolling for inner pages (the idea behind Lenis).
 *
 * A wheel scroll no longer jumps: the page glides to the same place with an
 * exponential ease-out, so it feels weighted but never lags behind by more
 * than a fraction of a second. The distance is exactly what the wheel asked
 * for (scroll speed is not changed), only its timing is smoothed.
 *
 * Left to the browser, on purpose:
 *   - touch, keyboard, scrollbar dragging, find-in-page, anchor jumps;
 *   - Ctrl/⌘ + wheel (zoom), Shift + wheel and sideways scrolling;
 *   - anything that can scroll by itself under the pointer (the outline list,
 *     search results, wide tables, code), including `overscroll-behavior:
 *     contain` boxes that must not pass the scroll on;
 *   - open dialogs, and `[data-free-scroll]` for any future exception;
 *   - "reduce motion", and devices without a fine pointer.
 */
const CLICK_TAU = 120;   // ms: a wheel click glides (about 90 % there after 280 ms)
const GLIDE_TAU = 65;    // ms: trackpad input already has its own inertia; smooth it lightly

let stopFn: () => void = () => {};
/** Stop a running glide where it is (e.g. before a programmatic scroll). */
export function stopSmooth(): void { stopFn(); }

export function initSmooth(): void {
  const root = document.documentElement;
  const fine = matchMedia('(pointer: fine)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const on = () => fine.matches && !reduce.matches;

  let cur = scrollY, target = scrollY, written = scrollY, raf = 0, last = 0, tau = CLICK_TAU, lastWheel = 0, max = 0;
  const measure = () => { max = Math.max(0, root.scrollHeight - innerHeight); };
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  addEventListener('resize', measure, { passive: true });

  const write = (y: number) => { scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }); written = scrollY; };
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(64, Math.max(1, now - last)); last = now;
    cur += (target - cur) * (1 - Math.exp(-dt / tau));
    if (Math.abs(target - cur) < 0.4) cur = target;
    write(cur);
    if (cur !== target) raf = requestAnimationFrame(frame);
  };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; cur = target = written = scrollY; };
  stopFn = stop;

  /* something else moved the page while gliding (scroll anchoring when an
     image above loads, for example): carry the glide along with it */
  addEventListener('scroll', () => {
    if (!raf) return;
    const d = scrollY - written;
    if (Math.abs(d) > 1) { cur += d; target += d; written = scrollY; }
  }, { passive: true });

  const overflow = new WeakMap<Element, [string, string]>();
  const styleOf = (el: Element): [string, string] => {
    let s = overflow.get(el);
    if (!s) { const cs = getComputedStyle(el); s = [cs.overflowY, cs.overscrollBehaviorY]; overflow.set(el, s); }
    return s;
  };
  /** true when the wheel belongs to something else than the page */
  const skip = (t: Element | null, dy: number): boolean => {
    if (root.classList.contains('search-open')) return true;
    if (!t || !t.closest) return false;
    if (t.closest('[data-free-scroll], dialog, [aria-modal="true"], .lnav__drop, .lnav__sheet, wiki-toolkit')) return true;
    for (let el: Element | null = t; el && el !== document.body && el !== root; el = el.parentElement) {
      if (el.scrollHeight <= el.clientHeight + 1) continue;
      const [oy, ob] = styleOf(el);
      if (oy !== 'auto' && oy !== 'scroll' && oy !== 'overlay') continue;
      const canMove = dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0;
      if (canMove || ob === 'contain' || ob === 'none') return true;
    }
    return false;
  };

  addEventListener('wheel', (e: WheelEvent) => {
    if (!on() || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;
    let dy = e.deltaY, dx = e.deltaX;
    if (e.deltaMode === 1) { dy *= 16; dx *= 16; } else if (e.deltaMode === 2) { dy *= innerHeight; dx *= innerWidth; }
    if (!dy || Math.abs(dx) > Math.abs(dy)) return;
    if (skip(e.target as Element | null, dy)) { stop(); return; }
    e.preventDefault();
    const now = performance.now();
    /* a click of a wheel comes alone (or in lines); a trackpad sends a stream */
    tau = e.deltaMode !== 0 || (Math.abs(dy) >= 50 && now - lastWheel >= 25) ? CLICK_TAU : GLIDE_TAU;
    lastWheel = now;
    if (!raf) { cur = target = written = scrollY; }
    target = Math.max(0, Math.min(max, target + dy));
    if (!raf && target !== cur) { last = now; raf = requestAnimationFrame(frame); }
  }, { passive: false });

  /* the reader takes over with another tool: let go at once */
  const letGo = () => { if (raf) stop(); };
  addEventListener('pointerdown', letGo, { passive: true });
  addEventListener('keydown', letGo, { passive: true });
  addEventListener('touchstart', letGo, { passive: true });
  addEventListener('hashchange', letGo);
  document.addEventListener('visibilitychange', letGo);
  reduce.addEventListener?.('change', letGo);
}
