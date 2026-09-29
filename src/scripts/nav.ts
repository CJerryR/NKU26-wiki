/** Top bar behaviour — same as the homepage's shell.js, on the glass engine. */
import { attach, refresh } from './glass';

export function initNav(): void {
  const bar = document.querySelector<HTMLElement>('[data-lnav]');
  if (!bar) return;
  const links = bar.querySelector<HTMLElement>('.lnav__links');
  const lens = bar.querySelector<HTMLElement>('.lnav__lens');
  const groups = Array.from(bar.querySelectorAll<HTMLElement>('.lnav__group'));
  const toggle = bar.querySelector<HTMLButtonElement>('.lnav__toggle');
  const sheet = bar.querySelector<HTMLElement>('.lnav__sheet');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  bar.querySelectorAll<HTMLElement>('.lnav__island').forEach((el) => attach(el));

  let lensTimer = 0;
  const moveLens = (target: HTMLElement) => {
    if (!lens || !links) return;
    const lr = links.getBoundingClientRect(), tr = target.getBoundingClientRect();
    lens.style.width = `${tr.width}px`;
    lens.style.setProperty('--lens-x', `${tr.left - lr.left}px`);
    lens.classList.add('is-on');
    attach(lens);
    clearTimeout(lensTimer);
    lensTimer = window.setTimeout(() => refresh(lens), 480);
  };
  const hideLens = () => {
    const open = groups.find((g) => g.classList.contains('is-open'));
    if (open) moveLens(open.querySelector<HTMLElement>('.lnav__link')!);
    else lens?.classList.remove('is-on');
  };
  if (links) {
    links.querySelectorAll<HTMLElement>('.lnav__link').forEach((l) => {
      l.addEventListener('pointerenter', () => moveLens(l));
      l.addEventListener('focus', () => moveLens(l));
      l.addEventListener('pointerdown', () => lens?.classList.add('is-pressed'));
    });
    document.addEventListener('pointerup', () => lens?.classList.remove('is-pressed'));
    links.addEventListener('pointerleave', hideLens);
  }

  const setOpen = (g: HTMLElement, open: boolean) => {
    g.classList.toggle('is-open', open);
    g.querySelector('.lnav__link')?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { const d = g.querySelector<HTMLElement>('.lnav__drop'); if (d) { attach(d); refresh(d); } }
  };
  const closeAll = (except?: HTMLElement) => groups.forEach((g) => { if (g !== except) setOpen(g, false); });
  groups.forEach((g) => {
    const btn = g.querySelector<HTMLElement>('.lnav__link')!;
    let t = 0;
    btn.addEventListener('click', () => { const o = !g.classList.contains('is-open'); closeAll(g); setOpen(g, o); });
    g.addEventListener('pointerenter', () => { if (!hover.matches) return; clearTimeout(t); closeAll(g); setOpen(g, true); });
    g.addEventListener('pointerleave', () => { if (!hover.matches) return; t = window.setTimeout(() => { setOpen(g, false); hideLens(); }, 220); });
  });
  document.addEventListener('click', (e) => { if (!(e.target as Element).closest?.('.lnav__group')) closeAll(); });

  const setSheet = (open: boolean) => {
    if (!sheet || !toggle) return;
    sheet.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { attach(sheet); refresh(sheet); }
  };
  toggle?.addEventListener('click', () => setSheet(!!sheet?.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = groups.find((g) => g.classList.contains('is-open'));
    closeAll();
    if (open) open.querySelector<HTMLElement>('.lnav__link')?.focus();
    if (sheet && !sheet.hidden) { setSheet(false); toggle?.focus(); }
  });

  /* tint follows what is under the bar; collapse on the way down */
  const tone = () => {
    const y = 42;
    let light = 0;
    for (const x of [innerWidth * 0.3, innerWidth * 0.7]) {
      for (const el of document.elementsFromPoint(x, y)) {
        if (el.closest('.lnav')) continue;
        const t = el.closest('[data-tone]');
        if (t) { if (t.getAttribute('data-tone') === 'light') light++; break; }
        const m = getComputedStyle(el).backgroundColor.match(/\d+(\.\d+)?/g);
        if (m && (m.length < 4 || +m[3] > 0.5)) { if (+m[0] * 0.3 + +m[1] * 0.59 + +m[2] * 0.11 > 170) light++; break; }
      }
    }
    bar.classList.toggle('is-on-light', light > 0);
  };
  const nowEl = bar.querySelector<HTMLElement>('[data-lnav-now]');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[data-nav-label]'));
  const pageTitle = document.body.dataset.pageTitle || document.title;
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
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const busy = (sheet && !sheet.hidden) || groups.some((g) => g.classList.contains('is-open'));
    if (!busy && y > lastY + 2 && y > 420) bar.classList.add('is-compact');
    if (y < lastY - 6 || y < 420) bar.classList.remove('is-compact');
    nowLabel();
    tone();
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', tone, { passive: true });
  tone();
  nowLabel();
}
