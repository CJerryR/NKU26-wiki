/**
 * Outline: follows the reading position, shows progress, opens on phones.
 * The section being read is marked by a film inside the glass that springs
 * to it and stretches with its speed (the top bar's film, turned upright).
 * On phones the pill lifts while pressed and takes the tone of the page
 * under it, so it turns dark over the footer.
 */
import { glassFor } from './liquid-glass';
import { setTone, toneAt, watchTone } from './tone';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function initToc(): void {
  const toc = document.querySelector<HTMLElement>('[data-toc]');
  if (!toc) return;
  const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  const pairs = links
    .map((a) => ({ a, el: document.getElementById(decodeURIComponent(a.hash.slice(1))) }))
    .filter((p): p is { a: HTMLAnchorElement; el: HTMLElement } => !!p.el);
  const list = toc.querySelector<HTMLElement>('.toc__list');
  const film = toc.querySelector<HTMLElement>('[data-toc-film]');
  const bar = toc.querySelector<HTMLElement>('[data-toc-bar]');
  const ring = toc.querySelector<SVGCircleElement>('[data-toc-ring]');
  const now = toc.querySelector<HTMLElement>('[data-toc-now]');
  const toggle = toc.querySelector<HTMLButtonElement>('[data-toc-toggle]');
  const panel = toc.querySelector<HTMLElement>('.toc__panel');
  const article = document.querySelector<HTMLElement>('[data-doc]');
  const narrow = matchMedia('(max-width: 1099px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = -1;

  /* ------------------------------------------------------------ film */
  let y = 0, v = 0, h = 30, vh = 0, ty = 0, th = 30, raf = 0, shown = false;
  const render = () => {
    if (!film) return;
    const stretch = Math.min(Math.abs(v) / 30, 0.45);
    film.style.height = `${h.toFixed(2)}px`;
    film.style.transform = `translateY(${y.toFixed(2)}px) scale(${(1 - stretch * 0.06).toFixed(3)}, ${(1 + stretch * 0.5).toFixed(3)})`;
  };
  const frame = () => {
    v = (v + (ty - y) * 0.16) * 0.74; y += v;
    vh = (vh + (th - h) * 0.16) * 0.74; h += vh;
    render();
    if (Math.abs(ty - y) > 0.2 || Math.abs(v) > 0.03 || Math.abs(th - h) > 0.2 || Math.abs(vh) > 0.03) raf = requestAnimationFrame(frame);
    else { raf = 0; y = ty; h = th; v = vh = 0; render(); }
  };
  /* the film sits in the list's own coordinates, so it scrolls with it; the
     item (li) is measured, the link inside it fills it */
  const placeFilm = (jump = false) => {
    const li = pairs[active]?.a.parentElement;
    if (!film || !li || !li.offsetHeight) return;
    ty = li.offsetTop; th = li.offsetHeight;
    if (!shown || jump || reduce) { y = ty; h = th; v = vh = 0; render(); }
    film.classList.add('is-on');
    shown = true;
    if (!reduce && !raf) raf = requestAnimationFrame(frame);
  };

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    pairs.forEach((p, k) => {
      p.a.classList.toggle('is-active', k === i);
      if (k === i) p.a.setAttribute('aria-current', 'location'); else p.a.removeAttribute('aria-current');
    });
    const cur = pairs[i];
    if (!cur) return;
    placeFilm();
    if (now) now.textContent = cur.a.querySelector('.toc__text')?.textContent || '';
    if (list && !narrow.matches && list.scrollHeight > list.clientHeight) {
      const top = cur.a.parentElement!.offsetTop;
      if (top < list.scrollTop + 8 || top > list.scrollTop + list.clientHeight - 48) {
        list.scrollTo({ top: top - list.clientHeight / 3, behavior: 'smooth' });
      }
    }
  };

  /* where the headings and the article sit is measured only when the
     layout changes (resize, fonts, images), not on every scroll frame */
  let tops: number[] = [], artTop = 0, artH = 1;
  const measure = () => {
    const sy = scrollY;
    tops = pairs.map((p) => p.el.getBoundingClientRect().top + sy);
    if (article) { const r = article.getBoundingClientRect(); artTop = r.top + sy; artH = r.height; }
  };
  const update = () => {
    const line = innerHeight * 0.35, sy = scrollY;
    let i = 0;
    for (let k = 0; k < tops.length; k++) {
      if (tops[k] - sy - line <= 0) i = k; else break;
    }
    setActive(i);
    if (article) {
      const p = clamp((innerHeight * 0.3 - (artTop - sy)) / Math.max(1, artH - innerHeight * 0.55));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (ring) ring.style.strokeDashoffset = (94.25 * (1 - p)).toFixed(2);
    }
  };
  const remeasure = () => { measure(); update(); placeFilm(true); };
  measure();
  const main = document.querySelector('main');
  if (main && 'ResizeObserver' in window) new ResizeObserver(remeasure).observe(main);
  document.fonts?.ready.then(remeasure);
  addEventListener('load', remeasure);
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', remeasure, { passive: true });
  update();

  /* ------------------------------------------------ phone pill + sheet */
  const pillGlass = toggle && narrow.matches ? glassFor(toggle) : null;
  const setOpen = (open: boolean) => {
    toc.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && panel) {
      glassFor(panel).refresh();
      const cur = pairs[active]?.a;
      requestAnimationFrame(() => { cur?.scrollIntoView({ block: 'center' }); placeFilm(true); });
    }
  };
  toggle?.addEventListener('click', () => setOpen(!toc.classList.contains('is-open')));
  if (toggle) {
    const drop = () => { toggle.classList.remove('is-lifted'); (pillGlass ?? glassFor(toggle)).setStrength(1); };
    toggle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      toggle.classList.add('is-lifted');
      (pillGlass ?? glassFor(toggle)).setStrength(1.25);
    });
    toggle.addEventListener('pointerup', drop);
    toggle.addEventListener('pointercancel', drop);
    toggle.addEventListener('pointerleave', drop);
    /* the pill's tone: read when a section boundary crosses its height */
    const pillY = () => { const r = toggle.getBoundingClientRect(); return r.height ? r.top + r.height / 2 : innerHeight - 41; };
    const paint = () => {
      if (!narrow.matches) return;
      const r = toggle.getBoundingClientRect();
      setTone(toggle, toneAt(r.left + r.width / 2, r.top + r.height / 2));
    };
    const rewatch = watchTone(pillY, paint);
    narrow.addEventListener?.('change', () => { rewatch(); paint(); });
  }
  toc.querySelector('[data-toc-close]')?.addEventListener('click', () => { setOpen(false); toggle?.focus(); });
  links.forEach((a) => a.addEventListener('click', () => { if (narrow.matches) setOpen(false); }));
  toc.querySelector('.toc__top')?.addEventListener('click', () => { if (narrow.matches) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toc.classList.contains('is-open')) { setOpen(false); toggle?.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!toc.classList.contains('is-open')) return;
    const t = e.target as Element;
    if (t === toc || !toc.contains(t)) setOpen(false);
  });
  narrow.addEventListener?.('change', () => setOpen(false));
}
