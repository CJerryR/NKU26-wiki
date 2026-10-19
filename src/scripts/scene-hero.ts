/**
 * Motion for the scroll-opened page hero (src/components/page/SceneHero.astro).
 *
 * Progress p runs 0 → 1 while the pinned stage is held (the section is taller
 * than the screen; the stage is position: sticky). Each prop eases from its
 * `from` to its `to` state over its own window of p; the title shrinks and
 * rises; the soil moves more slowly than the paper. One composition camera
 * keeps complete props inside the available frame. p is read from scrollY on
 * every frame, so a page opened at an anchor, restored by the back button or
 * jumped by the outline simply shows the state for where it is.
 *
 * Deliberately passive: no wheel or touch listeners, no preventDefault, no
 * scrollTo. src/scripts/smooth.ts keeps the page's damped wheel scrolling and
 * this only follows it. Runs only while the hero is on screen; nothing moves
 * with reduced motion (the CSS then shows the closed composition as a still).
 */
import { sampleScene, cameraUnit, type FramingLayer, type ScenePose as State } from '../lib/scene-framing';
interface Motion { f: State; t: State; w: [number, number]; d: number }
interface Layer { el: HTMLElement; m: Motion }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initSceneHero(): void {
  const root = document.querySelector<HTMLElement>('[data-scene]');
  if (!root) return;
  const stage = root.querySelector<HTMLElement>('.scene__stage')!;
  const art = root.querySelector<HTMLElement>('.scene__art')!;
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
    img.onload = async () => {
      try {
        await img.decode();
        set.dataset.sceneAtlasReady = 'true';
      } catch { /* Keep the inline preview if the new orientation cannot decode. */ }
    };
    img.src = url;
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    const shown = sets.find((s) => getComputedStyle(s).display !== 'none');
    if (shown) probe(shown);
    matchMedia(root.dataset.scenePortrait || '(max-aspect-ratio: 4/5)').addEventListener('change', () => {
      const shown = sets.find((s) => getComputedStyle(s).display !== 'none');
      if (shown) probe(shown);
    });
    return;
  }

  let active: HTMLElement | null = null, layers: Layer[] = [];
  let canvasW = 1600, u = 1, top = 0, span = 1;
  let artUnit = 1, artWidth = 1, artHeight = 1, artOriginY = 0;
  let framing: FramingLayer[] = [];
  let navClearance = 104, titleHeight = 0, titleAnchor = 0, stageHeight = 0;
  let titleCfg = { y: 0, toY: -200, toScale: 0.65 };
  let px = 0, py = 0, tx = 0, ty = 0, visible = true, raf = 0, ticking = false;
  const fine = matchMedia('(pointer: fine)').matches;

  const measure = () => {
    active = sets.find((s) => getComputedStyle(s).display !== 'none') ?? null;
    if (active) {
      probe(active);
      canvasW = Number(active.dataset.canvas?.split(',')[0]) || 1600;
      // Read untransformed geometry: the composition camera can be zoomed already.
      artUnit = parseFloat(getComputedStyle(active).width) / canvasW || 1;
      u = Math.min(stage.clientWidth, stage.offsetHeight * (canvasW === 900 ? 9 / 16 : 16 / 9)) / canvasW;
      artWidth = Math.max(1, art.clientWidth - 2 * Math.min(36, Math.max(16, innerWidth * 0.02)));
      artHeight = Math.max(1, art.clientHeight);
      artOriginY = clamp(stage.offsetHeight / 2 - (art.getBoundingClientRect().top - stage.getBoundingClientRect().top), artHeight * 0.4, artHeight * 0.6);
      try { titleCfg = { ...titleCfg, ...JSON.parse(active.dataset.title || '{}') }; } catch { /* keep defaults */ }
      layers = Array.from(active.querySelectorAll<HTMLElement>('[data-scene-layer]')).map((el) => {
        let m: Motion;
        try { m = JSON.parse(el.dataset.motion || ''); } catch { m = { f: { x: 0, y: 0 }, t: { x: 0, y: 0 }, w: [0, 1], d: 0 }; }
        return { el, m };
      });
      framing = layers.map(({ el, m }) => ({
        width: Number(el.style.getPropertyValue('--w')),
        height: Number(el.style.getPropertyValue('--h')),
        depth: m.d, from: m.f, to: m.t, window: m.w,
      }));
    }
    top = root.getBoundingClientRect().top + scrollY;
    stageHeight = stage.offsetHeight;
    span = Math.max(1, root.offsetHeight - stageHeight);
    // Overscan below the stage keeps soil under the paper as the ground rises.
    ground?.style.setProperty('--ground-travel', `${(span * 0.28).toFixed(2)}px`);
    navClearance = Math.max(
      (parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 84) + 20,
      crumbs ? crumbs.getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 24 : 0,
    );
    titleHeight = title?.offsetHeight ?? 0;
    titleAnchor = title ? parseFloat(getComputedStyle(title).top) : 0;
  };

  const render = () => {
    const distance = Math.max(0, scrollY - top);
    const p = clamp(distance / span);
    const { poses, bounds } = sampleScene(framing, p);
    if (active) {
      const scale = cameraUnit(bounds, artWidth, artHeight, u, artOriginY) / artUnit;
      active.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(6)})`;
    }
    layers.forEach(({ el, m }, i) => {
      const pose = poses[i];
      const x = pose.x - m.f.x - px * m.d;
      const y = pose.y - m.f.y - py * m.d * 0.6;
      el.style.transform = `translate3d(${(x * artUnit).toFixed(4)}px, ${(y * artUnit).toFixed(4)}px, 0) rotate(${pose.r.toFixed(4)}deg) scale(${pose.s.toFixed(6)})`;
      el.style.opacity = pose.o.toFixed(3);
    });
    if (title) {
      const k = ease(clamp((p - 0.06) / 0.62));
      // Keep the opened title almost full size, in the upper third of the stage.
      const endScale = Math.max(titleCfg.toScale, 0.98);
      const sc = lerp(1, endScale, k);
      const minCenter = navClearance + titleHeight * sc / 2;
      const startCenter = stageHeight / 2 + titleCfg.y * u;
      const endCenter = Math.max(navClearance + titleHeight * endScale / 2, Math.min(startCenter, stageHeight * 0.34));
      const center = Math.max(minCenter, lerp(startCenter, endCenter, k));
      const dy = center - titleAnchor;
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
  const geometry = new ResizeObserver(remeasure);
  if (title) geometry.observe(title);
  geometry.observe(art);
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) render();
  }).observe(root);

  measure();
  root.classList.add('scene--live');
  render();
}
