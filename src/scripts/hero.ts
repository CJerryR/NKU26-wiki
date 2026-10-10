/**
 * Title bar depth (src/components/page/PageHero.astro), after the team's
 * DepthLockScreen and ParallaxTiles demos. Each [data-depth] layer:
 *  - moves against the pointer by up to data-depth px (the far layers most,
 *    the text hardly at all), smoothed like the demos' tilt;
 *  - sinks by data-sink × the distance scrolled, so layers further back fall
 *    behind and the paper wave, which scrolls with the page, rises over the
 *    title.
 * Only while the hero is on screen; nothing moves with reduced motion.
 */
export function initHero(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layers = Array.from(hero.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
    el, depth: Number(el.dataset.depth) || 0, sink: Number(el.dataset.sink) || 0,
  }));
  if (!layers.length) return;
  const fine = matchMedia('(pointer: fine)').matches;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, visible = true, heroH = hero.offsetHeight;

  const apply = () => {
    const s = Math.max(0, Math.min(scrollY, heroH));
    for (const l of layers) {
      l.el.style.transform = `translate3d(${(-x * l.depth).toFixed(2)}px, ${(-y * l.depth * 0.6 + s * l.sink).toFixed(2)}px, 0)`;
    }
  };
  const loop = () => {
    x += (tx - x) * 0.1; y += (ty - y) * 0.1;
    const settled = Math.abs(tx - x) + Math.abs(ty - y) < 0.001;
    if (settled) { x = tx; y = ty; }
    apply();
    raf = settled ? 0 : requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(loop); };

  if (fine) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }
  let ticking = false;
  addEventListener('scroll', () => {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; if (!raf) apply(); });
  }, { passive: true });
  addEventListener('resize', () => { heroH = hero.offsetHeight; apply(); }, { passive: true });
  new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); if (visible) apply(); }).observe(hero);
  apply();
}
