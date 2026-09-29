/** Outline: follows the reading position, shows progress, opens on phones. */
import { attach, refresh } from './glass';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function initToc(): void {
  const toc = document.querySelector<HTMLElement>('[data-toc]');
  if (!toc) return;
  const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  const pairs = links
    .map((a) => ({ a, el: document.getElementById(decodeURIComponent(a.hash.slice(1))) }))
    .filter((p): p is { a: HTMLAnchorElement; el: HTMLElement } => !!p.el);
  const list = toc.querySelector<HTMLElement>('.toc__list');
  const bar = toc.querySelector<HTMLElement>('[data-toc-bar]');
  const ring = toc.querySelector<SVGCircleElement>('[data-toc-ring]');
  const now = toc.querySelector<HTMLElement>('[data-toc-now]');
  const toggle = toc.querySelector<HTMLButtonElement>('[data-toc-toggle]');
  const panel = toc.querySelector<HTMLElement>('.toc__panel');
  const article = document.querySelector<HTMLElement>('[data-doc]');
  const narrow = matchMedia('(max-width: 1099px)');
  let active = -1;

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    pairs.forEach((p, k) => {
      p.a.classList.toggle('is-active', k === i);
      if (k === i) p.a.setAttribute('aria-current', 'location'); else p.a.removeAttribute('aria-current');
    });
    const cur = pairs[i];
    if (!cur) return;
    if (now) now.textContent = cur.a.querySelector('.toc__text')?.textContent || '';
    if (list && !narrow.matches && list.scrollHeight > list.clientHeight) {
      const top = cur.a.offsetTop - list.offsetTop;
      if (top < list.scrollTop + 8 || top > list.scrollTop + list.clientHeight - 48) {
        list.scrollTo({ top: top - list.clientHeight / 3, behavior: 'smooth' });
      }
    }
  };

  const update = () => {
    const line = innerHeight * 0.28;
    let i = 0;
    for (let k = 0; k < pairs.length; k++) {
      if (pairs[k].el.getBoundingClientRect().top - line <= 0) i = k; else break;
    }
    setActive(i);
    if (article) {
      const r = article.getBoundingClientRect();
      const p = clamp((innerHeight * 0.3 - r.top) / Math.max(1, r.height - innerHeight * 0.55));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (ring) ring.style.strokeDashoffset = (94.25 * (1 - p)).toFixed(2);
    }
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();

  const setOpen = (open: boolean) => {
    toc.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && panel) {
      attach(panel);
      refresh(panel);
      const cur = pairs[active]?.a;
      requestAnimationFrame(() => cur?.scrollIntoView({ block: 'center' }));
    }
  };
  toggle?.addEventListener('click', () => setOpen(!toc.classList.contains('is-open')));
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
