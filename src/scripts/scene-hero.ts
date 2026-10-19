/**
 * Motion for the scroll-opened page hero (src/components/page/SceneHero.astro).
 *
 * Progress p runs 0 → 1 while the pinned stage is held (the section is taller
 * than the screen; the stage is position: sticky). Each prop eases from its
 * `from` to its `to` state over its own window of p; the title shrinks and
 * rises; the floor shadow and the scroll cue fade. p is read from scrollY on
 * every frame, so a page opened at an anchor, restored by the back button or
 * jumped by the outline simply shows the state for where it is.
 *
 * Deliberately passive: no wheel or touch listeners, no preventDefault, no
 * scrollTo. src/scripts/smooth.ts keeps the page's damped wheel scrolling and
 * this only follows it. Runs only while the hero is on screen; nothing moves
 * with reduced motion (the CSS then shows the closed composition as a still).
 */
interface State { x: number; y: number; r?: number; s?: number; o?: number }
interface Motion { f: State; t: State; w: [number, number]; d: number }
interface Layer { el: HTMLElement; m: Motion }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initSceneHero(): void {
  const root = document.querySelector<HTMLElement>('[data-scene]');
  if (!root) return;
  const stage = root.querySelector<HTMLElement>('.scene__stage')!;
  const title = root.querySelector<HTMLElement>('[data-scene-title]');
  const crumbs = root.querySelector<HTMLElement>('.scene__crumbs');
  const floor = root.querySelector<HTMLElement>('[data-scene-floor]');
  const ground = root.querySelector<HTMLElement>('.scene__ground');
  const sets = Array.from(root.querySelectorAll<HTMLElement>('[data-scene-set]'));

  const probed = new Set<string>();
  const probe = (set: HTMLElement) => {
    const url = set.dataset.src; // data-src: rewritten to a relative URL by integrations/relative-links.mjs
    if (!url || probed.has(url)) return;
    probed.add(url);
    const img = new Image();
    img.onerror = () => { if (!root.dataset.scenePreview) root.classList.add('scene--noart'); };
    img.src = url;
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    const shown = sets.find((s) => getComputedStyle(s).display !== 'none');
    if (shown) probe(shown);
    return;
  }

  let active: HTMLElement | null = null, layers: Layer[] = [];
  let canvasW = 1600, u = 1, top = 0, span = 1;
  let navClearance = 104, titleHeight = 0, stageHeight = 0;
  let titleCfg = { y: 0, toY: -200, toScale: 0.65 };
  let px = 0, py = 0, tx = 0, ty = 0, visible = true, raf = 0, ticking = false;
  const fine = matchMedia('(pointer: fine)').matches;

  const measure = () => {
    active = sets.find((s) => getComputedStyle(s).display !== 'none') ?? null;
    if (active) {
      probe(active);
      canvasW = Number(active.dataset.canvas?.split(',')[0]) || 1600;
      u = active.getBoundingClientRect().width / canvasW || 1;
      try { titleCfg = { ...titleCfg, ...JSON.parse(active.dataset.title || '{}') }; } catch { /* keep defaults */ }
      layers = Array.from(active.querySelectorAll<HTMLElement>('[data-scene-layer]')).map((el) => {
        let m: Motion;
        try { m = JSON.parse(el.dataset.motion || ''); } catch { m = { f: { x: 0, y: 0 }, t: { x: 0, y: 0 }, w: [0, 1], d: 0 }; }
        return { el, m };
      });
    }
    top = root.getBoundingClientRect().top + scrollY;
    stageHeight = stage.offsetHeight;
    span = Math.max(1, root.offsetHeight - stageHeight);
    // Overscan below the stage keeps soil under the paper as the ground rises.
    ground?.style.setProperty('--ground-travel', `${(span * 0.28).toFixed(2)}px`);
    navClearance = Math.max(
      (parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 84) + 20,
      crumbs ? crumbs.offsetTop + crumbs.offsetHeight + 24 : 0,
    );
    titleHeight = title?.offsetHeight ?? 0;
  };

  const render = () => {
    const distance = Math.max(0, scrollY - top);
    const p = clamp(distance / span);
    for (const { el, m } of layers) {
      const [a, b] = m.w;
      const k = ease(clamp((p - a) / Math.max(1e-3, b - a)));
      const x = lerp(m.f.x, m.t.x, k) - m.f.x - px * m.d;
      const y = lerp(m.f.y, m.t.y, k) - m.f.y - py * m.d * 0.6;
      const r = lerp(m.f.r ?? 0, m.t.r ?? m.f.r ?? 0, k);
      const s = lerp(m.f.s ?? 1, m.t.s ?? m.f.s ?? 1, k);
      const o = lerp(m.f.o ?? 1, m.t.o ?? m.f.o ?? 1, k);
      el.style.transform = `translate3d(${(x * u).toFixed(2)}px, ${(y * u).toFixed(2)}px, 0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      el.style.opacity = o.toFixed(3);
    }
    if (title) {
      const k = ease(clamp((p - 0.06) / 0.62));
      // Keep the opened title almost full size, in the upper third of the stage.
      const endScale = Math.max(titleCfg.toScale, 0.98);
      const sc = lerp(1, endScale, k);
      const minCenter = navClearance + titleHeight * sc / 2;
      const startCenter = stageHeight / 2 + titleCfg.y * u;
      const endCenter = Math.max(navClearance + titleHeight * endScale / 2, Math.min(startCenter, stageHeight * 0.34));
      const center = Math.max(minCenter, lerp(startCenter, endCenter, k));
      const dy = center - startCenter;
      title.style.transform = `translate(-50%, calc(-50% + ${dy.toFixed(2)}px)) scale(${sc.toFixed(4)})`;
    }
    if (ground) {
      // Paper moves at scroll speed. Soil moves at 28%, even after sticky releases.
      const stageExit = Math.max(0, distance - span);
      ground.style.transform = `translate3d(0, ${(stageExit - distance * 0.28).toFixed(2)}px, 0)`;
    }
    if (floor) floor.style.opacity = (1 - ease(clamp((p - 0.45) / 0.4))).toFixed(3);
  };

  const loop = () => {
    px += (tx - px) * 0.1; py += (ty - py) * 0.1;
    const settled = Math.abs(tx - px) + Math.abs(ty - py) < 0.001;
    if (settled) { px = tx; py = ty; }
    render();
    raf = settled ? 0 : requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(loop); };

  if (fine) {
    stage.addEventListener('pointermove', (e) => {
      tx = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1);
      ty = clamp((e.clientY / innerHeight) * 2 - 1, -1, 1);
      kick();
    });
    stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }
  addEventListener('scroll', () => {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; if (!raf) render(); });
  }, { passive: true });
  const remeasure = () => { measure(); render(); };
  addEventListener('resize', remeasure, { passive: true });
  addEventListener('orientationchange', remeasure, { passive: true });
  addEventListener('pageshow', remeasure);
  if (title) new ResizeObserver(remeasure).observe(title);
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) render();
  }).observe(root);

  measure();
  root.classList.add('scene--live');
  render();
}
