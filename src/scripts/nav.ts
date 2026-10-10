/**
 * Top bar behaviour, for every page (the story homepage loads it through
 * src/scripts/home-nav.ts). After the team's LiquidTabBar demo:
 *  - the menu island is one pane of glass; its highlight is a film inside
 *    it that rests on the current section, follows the pointer on a spring
 *    and stretches with its speed;
 *  - pressing lifts the film into a drop of glass and the pane bends light
 *    harder; dragging while pressed and letting go opens the item under it;
 *  - every pane (both islands, each dropdown, the phone menu) takes the tone
 *    of what lies beneath it, read only when a section boundary crosses the
 *    bar (src/scripts/tone.ts).
 */
import { glassFor } from './liquid-glass';
import { panelTone, setTone, toneAt, watchTone } from './tone';

type HomeHooks = { pager?: { pulling?: () => boolean } };

export function initNav(): void {
  const bar = document.querySelector<HTMLElement>('[data-lnav]');
  if (!bar) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const islands = Array.from(bar.querySelectorAll<HTMLElement>('.lnav__island'));
  const menu = bar.querySelector<HTMLElement>('.lnav__island--menu');
  const links = bar.querySelector<HTMLElement>('[data-lnav-links]');
  const film = bar.querySelector<HTMLElement>('[data-lnav-film]');
  const groups = Array.from(bar.querySelectorAll<HTMLElement>('.lnav__group'));
  const toggle = bar.querySelector<HTMLButtonElement>('.lnav__toggle');
  const sheet = bar.querySelector<HTMLElement>('.lnav__sheet');
  const scrim = document.querySelector<HTMLElement>('[data-lnav-scrim]');
  const dropOf = (g: HTMLElement) => g.querySelector<HTMLElement>('.lnav__drop');

  islands.forEach((el) => glassFor(el).materialize(900));
  const menuGlass = menu ? glassFor(menu) : null;
  /* build the dropdowns' glass before the first open, not during it */
  const warm = () => groups.forEach((g) => { const d = dropOf(g); if (d) glassFor(d); });
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 1500 }); else setTimeout(warm, 600);

  /* ---------------------------------------------------------------- film */
  const items = links ? Array.from(links.querySelectorAll<HTMLElement>('.lnav__link')) : [];
  let geo: { left: number; width: number }[] = [];
  const measure = () => {
    if (!links) return;
    const lr = links.getBoundingClientRect();
    if (!lr.width) return;
    geo = items.map((it) => { const r = it.getBoundingClientRect(); return { left: r.left - lr.left, width: r.width }; });
  };
  const current = items.findIndex((it) => it.classList.contains('is-current'));
  let hovered = -1;
  let x = 0, v = 0, w = 0, vw = 0, tx = 0, tw = 0, lift = 0, liftTarget = 0, raf = 0, shown = false;
  let pressX: number | null = null, dragging = false, dragX = 0, swallowClick = false;

  const render = () => {
    if (!film) return;
    const stretch = Math.min(Math.abs(v) / 26, 0.5);
    const sx = 1 + stretch + lift * 0.14;
    const sy = 1 - stretch * 0.4 + lift * 0.26;
    film.style.width = `${w.toFixed(2)}px`;
    film.style.transform = `translateX(${x.toFixed(2)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
  };
  const frame = () => {
    if (dragging) { v = v * 0.5 + (dragX - x) * 0.5; x = dragX; } else { v = (v + (tx - x) * 0.16) * 0.74; x += v; }
    vw = (vw + (tw - w) * 0.16) * 0.74; w += vw;
    lift += (liftTarget - lift) * 0.22;
    render();
    const busy = dragging || Math.abs(tx - x) > 0.2 || Math.abs(v) > 0.03 || Math.abs(tw - w) > 0.2 || Math.abs(vw) > 0.03 || Math.abs(liftTarget - lift) > 0.005;
    if (busy) raf = requestAnimationFrame(frame);
    else { raf = 0; x = tx; v = 0; w = tw; vw = 0; lift = liftTarget; render(); }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const moveTo = (i: number, jump = false) => {
    if (!film) return;
    if (i < 0 || !geo[i]) { film.classList.remove('is-on'); shown = false; return; }
    tx = geo[i].left; tw = geo[i].width;
    if (!shown || jump || reduce) { x = tx; w = tw; v = vw = 0; render(); }
    film.classList.add('is-on');
    shown = true;
    if (!reduce) kick();
  };
  /* where the film rests: the open menu, else the hovered link, else the page's section */
  const rest = () => {
    const open = groups.findIndex((g) => g.classList.contains('is-open'));
    if (open >= 0) return items.indexOf(groups[open].querySelector<HTMLElement>('.lnav__link')!);
    return hovered >= 0 ? hovered : current;
  };
  const nearest = (px: number) => {
    let best = 0, dist = Infinity;
    geo.forEach((g, i) => { const d = Math.abs(g.left + g.width / 2 - px); if (d < dist) { dist = d; best = i; } });
    return best;
  };
  const relayout = () => { measure(); moveTo(rest(), true); };

  /* ------------------------------------------------------------ menus */
  const paintPanel = (panel: HTMLElement | null) => {
    if (!panel || panel.hidden) return;
    setTone(panel, panelTone(panel.getBoundingClientRect()));
  };
  const setOpen = (g: HTMLElement, open: boolean) => {
    g.classList.toggle('is-open', open);
    g.querySelector('.lnav__link')?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { const d = dropOf(g); if (d) { paintPanel(d); glassFor(d).refresh(); } }
  };
  const closeAll = (except?: HTMLElement) => groups.forEach((g) => { if (g !== except) setOpen(g, false); });
  groups.forEach((g) => {
    const btn = g.querySelector<HTMLElement>('.lnav__link')!;
    let t = 0;
    btn.addEventListener('click', () => { const o = !g.classList.contains('is-open'); closeAll(g); setOpen(g, o); moveTo(rest()); });
    g.addEventListener('pointerenter', () => { if (!hover.matches || dragging) return; clearTimeout(t); closeAll(g); setOpen(g, true); });
    g.addEventListener('pointerleave', () => {
      if (!hover.matches || dragging) return;
      t = window.setTimeout(() => { setOpen(g, false); moveTo(rest()); }, 220);
    });
  });
  document.addEventListener('click', (e) => { if (!(e.target as Element).closest?.('.lnav__group')) { closeAll(); moveTo(rest()); } });

  /* ---------------------------------------------- pointer on the menu */
  if (links && film) {
    measure();
    moveTo(current, true);
    items.forEach((it, i) => {
      it.addEventListener('pointerenter', () => { if (dragging) return; hovered = i; moveTo(i); });
      it.addEventListener('focus', () => moveTo(i));
    });
    links.addEventListener('pointerleave', () => { if (dragging) return; hovered = -1; moveTo(rest()); });
    links.addEventListener('focusout', (e) => { if (!links.contains(e.relatedTarget as Node)) moveTo(rest()); });
    links.addEventListener('dragstart', (e) => e.preventDefault());
    const localX = (e: PointerEvent) => e.clientX - links.getBoundingClientRect().left;
    links.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || !(e.target as Element).closest('.lnav__link')) return;
      pressX = localX(e);
      links.classList.add('is-lifted');
      liftTarget = reduce ? 0 : 1;
      menuGlass?.setStrength(1.25); // pressed glass bends light harder
      const i = items.indexOf((e.target as Element).closest<HTMLElement>('.lnav__link')!);
      if (i >= 0) moveTo(i); else kick();
    });
    links.addEventListener('pointermove', (e) => {
      if (pressX == null) return;
      const lx = localX(e);
      /* capture only once it is a drag, so a plain click still reaches its link */
      if (!dragging && Math.abs(lx - pressX) > 6 && geo.length) { dragging = true; links.setPointerCapture(e.pointerId); closeAll(); }
      if (!dragging) return;
      const first = geo[0], last = geo[geo.length - 1];
      tw = geo[nearest(lx)].width;
      dragX = Math.max(first.left, Math.min(last.left + last.width - w, lx - w / 2));
      kick();
    });
    const release = (e: PointerEvent, cancelled: boolean) => {
      if (pressX == null) return;
      pressX = null;
      links.classList.remove('is-lifted');
      liftTarget = 0;
      menuGlass?.setStrength(1);
      if (!dragging) { kick(); return; }
      dragging = false;
      if (links.hasPointerCapture(e.pointerId)) links.releasePointerCapture(e.pointerId);
      if (cancelled) { moveTo(rest()); return; }
      const i = nearest(x + w / 2);
      hovered = i;
      moveTo(i);
      const item = items[i];
      const g = item.closest<HTMLElement>('.lnav__group');
      if (g) { closeAll(g); setOpen(g, true); moveTo(rest()); } else item.click();
      /* the native click that follows a drag lands on the menu itself; keep it from closing
         what the drag opened. Armed only after our own item.click(), which must go through. */
      swallowClick = true;
      setTimeout(() => { swallowClick = false; }, 0);
    };
    links.addEventListener('pointerup', (e) => release(e, false));
    links.addEventListener('pointercancel', (e) => release(e, true));
    links.addEventListener('click', (e) => { if (swallowClick) { e.stopPropagation(); e.preventDefault(); swallowClick = false; } }, true);
    new ResizeObserver(relayout).observe(links);
    document.fonts?.ready.then(relayout);
  }

  /* ------------------------------------------------------ phone sheet */
  const setSheet = (open: boolean) => {
    if (!sheet || !toggle) return;
    sheet.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { paintPanel(sheet); glassFor(sheet).refresh(); }
  };
  toggle?.addEventListener('click', () => setSheet(!!sheet?.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = groups.find((g) => g.classList.contains('is-open'));
    closeAll();
    moveTo(rest());
    if (open) open.querySelector<HTMLElement>('.lnav__link')?.focus();
    if (sheet && !sheet.hidden) { setSheet(false); toggle?.focus(); }
  });

  /* ------------------------------------------------------------- tone */
  let bandY = 42;
  const readBand = () => { const r = islands[0]?.getBoundingClientRect(); if (r && r.height) bandY = r.top + r.height / 2; return bandY; };
  const paint = () => {
    for (const isl of islands) { const r = isl.getBoundingClientRect(); setTone(isl, toneAt(r.left + r.width / 2, bandY)); }
    setTone(scrim, toneAt(innerWidth / 2, bandY));
    for (const g of groups) if (g.classList.contains('is-open')) paintPanel(dropOf(g));
    if (sheet && !sheet.hidden) paintPanel(sheet);
  };
  watchTone(readBand, paint);
  paint();

  /* ------------------------------------------ compact bar, section name */
  const nowEl = bar.querySelector<HTMLElement>('[data-lnav-now]');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[data-nav-label]'));
  const pageTitle = document.body.dataset.pageTitle || document.title.split('|')[0].trim();
  let nowText = '';
  const nowLabel = () => {
    if (!nowEl) return;
    const y = innerHeight * 0.35;
    let txt = '';
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { txt = s.dataset.navLabel || ''; break; }
    }
    txt = (txt || pageTitle).replace(/\s+/g, ' ').trim();
    if (txt.length > 34) txt = `${txt.slice(0, 32)}…`;
    if (txt !== nowText) { nowText = txt; nowEl.textContent = txt; }
  };
  bar.addEventListener('pointerenter', () => bar.classList.add('is-peek'));
  bar.addEventListener('pointerleave', () => bar.classList.remove('is-peek'));
  /* the compact/peek switch resizes the islands: re-read the film and the tone once it settles */
  menu?.addEventListener('transitionend', (e) => { if ((e.target as Element).matches?.('.lnav__links')) { relayout(); paint(); } });

  /* reading the section rects costs a layout, so it runs at most every
     120 ms while the page moves and once more when it stops */
  let lastY = scrollY, ticking = false, readAt = 0, settleT = 0;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    const home = (window as unknown as { NKUH?: HomeHooks }).NKUH;
    if (home?.pager?.pulling?.()) { lastY = y; return; } // the homepage's small give/peek is not the reader moving on
    if (performance.now() - readAt > 120) { readAt = performance.now(); nowLabel(); }
    clearTimeout(settleT); settleT = window.setTimeout(nowLabel, 90);
    const busy = (sheet && !sheet.hidden) || groups.some((g) => g.classList.contains('is-open'));
    if (!busy && y > lastY + 2 && y > 420) bar.classList.add('is-compact');
    if (y < lastY - 6 || y < 420) bar.classList.remove('is-compact');
    scrim?.classList.toggle('is-on', y > 24);
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  scrim?.classList.toggle('is-on', scrollY > 24);
  nowLabel();
}
