/** Site search: loads js/search-data.js on first use (same index as v6). */
type Section = { id: string; title: string; text: string; url: string };
type Entry = { title: string; url: string; crumbs?: string[]; desc?: string; text?: string; sections?: Section[] };
type Doc = { title: string; url: string; crumbs: string; text: string; titleN: string; hay: string; page: boolean };

declare global { interface Window { NKU_SEARCH_INDEX?: Entry[] } }

const norm = (s: string) => (s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9#]+/g, ' ').trim();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function flatten(raw: Entry[]): Doc[] {
  const out: Doc[] = [];
  for (const p of raw) {
    const crumbs = (p.crumbs || []).filter((c) => c !== 'Home').join(' / ');
    out.push({ title: p.title, url: p.url, crumbs: crumbs || 'Home', text: p.desc || p.text || '', titleN: norm(p.title), hay: norm(`${p.title} ${p.desc || ''} ${p.text || ''}`), page: true });
    for (const s of p.sections || []) {
      out.push({ title: s.title, url: s.url, crumbs: [crumbs, p.title].filter(Boolean).join(' / ') || p.title, text: s.text, titleN: norm(s.title), hay: norm(`${s.title} ${s.text}`), page: false });
    }
  }
  return out;
}

function score(d: Doc, terms: string[], phrase: string): number {
  let s = 0;
  for (const t of terms) {
    const inTitle = d.titleN.includes(t);
    const at = d.hay.indexOf(t);
    if (!inTitle && at < 0) return 0;
    if (inTitle) s += d.titleN.startsWith(t) || d.titleN.includes(` ${t}`) ? 14 : 9;
    if (at >= 0) s += 3;
  }
  if (terms.length > 1 && d.hay.includes(phrase)) s += 8;
  return s * (d.page ? 1.1 : 1);
}

function snippet(text: string, terms: string[]): string {
  const low = text.toLowerCase();
  let at = -1;
  for (const t of terms) { const i = low.indexOf(t); if (i >= 0 && (at < 0 || i < at)) at = i; }
  const start = Math.max(0, at - 70);
  let s = text.slice(start, start + 190).trim();
  if (start > 0) s = `…${s}`;
  if (start + 190 < text.length) s += '…';
  return s;
}

function highlight(text: string, terms: string[]): string {
  const safe = esc(text);
  if (!terms.length) return safe;
  return safe.replace(new RegExp(`(${terms.map(reEsc).join('|')})`, 'gi'), '<mark>$1</mark>');
}

export function initSearch(): void {
  const modal = document.getElementById('site-search');
  if (!modal) return;
  const input = modal.querySelector<HTMLInputElement>('[data-search-input]')!;
  const results = modal.querySelector<HTMLElement>('[data-search-results]')!;
  const meta = modal.querySelector<HTMLElement>('[data-search-meta]')!;
  const openers = Array.from(document.querySelectorAll<HTMLElement>('[data-search-open]'));
  const root = document.documentElement.dataset.root || '';
  let docs: Doc[] | null = null;
  let loading: Promise<Doc[]> | null = null;
  let lastFocus: HTMLElement | null = null;
  let activeIdx = -1;

  const load = (): Promise<Doc[]> => {
    if (docs) return Promise.resolve(docs);
    if (!loading) {
      loading = new Promise<Entry[]>((resolve) => {
        if (window.NKU_SEARCH_INDEX) return resolve(window.NKU_SEARCH_INDEX);
        const s = document.createElement('script');
        s.src = `${root}js/search-data.js`;
        s.onload = () => resolve(window.NKU_SEARCH_INDEX || []);
        s.onerror = () => resolve([]);
        document.head.appendChild(s);
      }).then((raw) => (docs = flatten(raw)));
    }
    return loading;
  };

  const items = () => Array.from(results.querySelectorAll<HTMLAnchorElement>('.site-search__result'));
  const setActive = (i: number) => {
    const list = items();
    activeIdx = list.length ? (i + list.length) % list.length : -1;
    list.forEach((a, k) => a.classList.toggle('is-active', k === activeIdx));
    list[activeIdx]?.scrollIntoView({ block: 'nearest' });
  };

  const render = () => {
    const q = input.value.trim();
    const terms = norm(q).split(' ').filter(Boolean).slice(0, 8);
    activeIdx = -1;
    if (!terms.length) { results.innerHTML = ''; meta.textContent = 'Type a word to search every page.'; return; }
    if (!docs) { meta.textContent = 'Loading the index…'; return; }
    const phrase = terms.join(' ');
    const hits = docs.map((d) => ({ d, s: score(d, terms, phrase) })).filter((h) => h.s > 0).sort((a, b) => b.s - a.s).slice(0, 24);
    meta.textContent = hits.length ? `${hits.length}${hits.length === 24 ? '+' : ''} result${hits.length === 1 ? '' : 's'} for “${q}”` : '';
    if (!hits.length) { results.innerHTML = `<p class="site-search__empty">Nothing found for “${esc(q)}”. Try a shorter or different word.</p>`; return; }
    results.innerHTML = hits.map(({ d }) =>
      `<a class="site-search__result" href="${esc(root + d.url)}"><span class="site-search__crumbs">${esc(d.crumbs)}</span>` +
      `<span class="site-search__title">${highlight(d.title, terms)}</span>` +
      `<span class="site-search__snippet">${highlight(snippet(d.text, terms), terms)}</span></a>`).join('');
  };

  const open = () => {
    if (!modal.hidden) return;
    lastFocus = document.activeElement as HTMLElement;
    modal.hidden = false;
    document.documentElement.classList.add('search-open');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const panel = modal.querySelector<HTMLElement>('.site-search__panel');
    const lg = (window as unknown as { LiquidGlass?: { attach(el: HTMLElement): void } }).LiquidGlass;
    if (panel && lg) lg.attach(panel);
    requestAnimationFrame(() => { modal.classList.add('is-open'); input.focus(); input.select(); });
    load().then(render);
  };
  const close = () => {
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('search-open');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    window.setTimeout(() => { modal.hidden = true; }, 180);
    lastFocus?.focus?.();
  };

  openers.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  modal.querySelectorAll('[data-search-close]').forEach((b) => b.addEventListener('click', close));
  input.addEventListener('input', render);
  results.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) close(); });
  document.addEventListener('keydown', (e) => {
    const typing = /^(input|textarea|select)$/i.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
    if (modal.hidden) {
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); open(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
    else if (e.key === 'Enter' && document.activeElement === input) {
      const target = items()[activeIdx >= 0 ? activeIdx : 0];
      if (target) { e.preventDefault(); target.click(); }
    } else if (e.key === 'Tab') {
      const focusables = Array.from(modal.querySelectorAll<HTMLElement>('button, input, a[href]')).filter((el) => el.offsetParent !== null);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
