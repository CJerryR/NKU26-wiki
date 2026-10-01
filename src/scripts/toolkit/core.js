/**
 * Shared helpers for <wiki-toolkit> components.
 * Everything is built with DOM APIs (textContent / setAttribute): author text is
 * never parsed as HTML. The only innerHTML use is for the fixed icon paths below.
 */
export const SVG_NS = 'http://www.w3.org/2000/svg';

function apply(node, props) {
  if (!props) return;
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.setAttribute('class', Array.isArray(value) ? value.filter(Boolean).join(' ') : value);
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'style' && typeof value === 'object') { for (const [k, v] of Object.entries(value)) { if (v == null) continue; if (k.startsWith('--')) node.style.setProperty(k, String(v)); else node.style[k] = v; } }
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
}
function append(node, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false || kid === '') continue;
    node.append(kid instanceof Node ? kid : String(kid));
  }
  return node;
}
/** Replace an element's children; skips null / false like h() does. */
export const swap = (node, ...kids) => { node.replaceChildren(); return append(node, kids); };
/** HTML element: h('div', {class:'x', text:'…', onclick}, ...children) */
export const h = (tag, props, ...kids) => { const n = document.createElement(tag); apply(n, props); return append(n, kids); };
/** SVG element */
export const s = (tag, props, ...kids) => { const n = document.createElementNS(SVG_NS, tag); apply(n, props); return append(n, kids); };

/* ------------------------------------------------------------------ URLs */
/** Site file or https URL → absolute URL. Throws for anything else. */
export function asset(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (raw.startsWith('#')) return new URL(raw, location.href).href;
  const root = new URL(document.documentElement.dataset.root || '/', location.href);
  const url = new URL(raw.replace(/^\/(?!\/)/, ''), root);
  if (!['http:', 'https:'].includes(url.protocol) || raw.startsWith('//')) throw new Error('请使用网站内文件路径或 https 地址');
  return url.href;
}
/** Same rules as asset(), but returns '' instead of throwing (for optional links). */
export function safeHref(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (raw.startsWith('#')) return raw;
  try { return asset(raw); } catch { return ''; }
}
export function linkProps(url) {
  try { return new URL(url, location.href).origin === location.origin ? {} : { target: '_blank', rel: 'noopener noreferrer' }; }
  catch { return {}; }
}
export const fileName = (value) => { try { return decodeURIComponent(new URL(asset(value)).pathname.split('/').pop() || ''); } catch { return ''; } };
export const extension = (value) => (fileName(value).match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();

/* --------------------------------------------------------- inline text */
function inline(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] != null) out.push(h('strong', { text: m[1] }));
    else if (m[2] != null) out.push(h('code', { text: m[2] }));
    else {
      const url = safeHref(m[4]);
      out.push(url ? h('a', { href: url, text: m[3], ...linkProps(url) }) : m[3]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
/**
 * Plain text with a little structure: blank line = new paragraph, single line
 * break kept, "- " lines become a list, **bold**, `code`, [label](url).
 */
export function rich(text, cls = 'rt') {
  const frag = document.createDocumentFragment();
  const blocks = String(text ?? '').replace(/\r\n?/g, '\n').split(/\n{2,}/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    let para = null; let ul = null;
    for (const line of block.split('\n')) {
      const bullet = line.match(/^\s*[-•*]\s+(.*)$/);
      if (bullet) {
        if (!ul) { ul = h('ul', { class: 'rl' }); frag.append(ul); para = null; }
        ul.append(h('li', null, inline(bullet[1])));
      } else {
        ul = null;
        if (!para) { para = h('p', { class: cls }); frag.append(para); } else para.append(h('br'));
        para.append(...inline(line));
      }
    }
  }
  return frag;
}
export const has = (value) => value != null && String(value).trim() !== '';

/* ------------------------------------------------------------- values */
export function list(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value ?? '').split(/[,，、;；\n]/).map((v) => v.trim()).filter(Boolean);
}
export function clamp(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}
export function toNum(value) {
  const t = String(value ?? '').trim().replace(/^−/, '-');
  if (!t || /^(na|n\/a|nan|-|—|–)$/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}
export function fmt(value, digits) {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const d = digits ?? (abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 3);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(value);
}
export function initials(name) {
  // drop notes in brackets, e.g. 受访者 A（虚构） → 受访者 A
  const t = String(name || '').replace(/[（(【\[][^）)】\]]*[）)】\]]/g, '').trim() || String(name || '').trim();
  if (!t) return '?';
  if (/[\u3400-\u9fff]/.test(t)) return t.replace(/[^\u3400-\u9fff]/g, '').slice(-2) || t.slice(0, 2);
  return (t.match(/[\p{L}\p{N}]+/gu) || []).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
}

/* ---------------------------------------------------------------- CSV */
export function parseCSV(text) {
  const src = String(text ?? '').replace(/^\uFEFF/, '');
  const first = src.split('\n', 1)[0];
  const sep = first.includes('\t') && !first.includes(',') ? '\t' : ',';
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === sep) { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (quoted) throw new Error('CSV 中有未闭合的引号，请检查。');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== '')).map((r) => r.map((c) => c.trim()));
}
/** Header + rows with the same number of columns, or a clear error. */
export function table(text, { minCols = 1 } = {}) {
  const rows = parseCSV(text);
  const [headers, ...body] = rows;
  if (!headers || !body.length) throw new Error('CSV 需要一行列名和至少一行数据。');
  if (headers.length < minCols) throw new Error(`至少需要 ${minCols} 列数据。`);
  body.forEach((r, i) => {
    if (r.length !== headers.length) throw new Error(`第 ${i + 2} 行有 ${r.length} 列，表头有 ${headers.length} 列，请补齐或删除多余的逗号。`);
  });
  return { headers, rows: body };
}
export function toCSV(headers, rows) {
  const cell = (v) => (/[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [headers, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}

/* ------------------------------------------------------------- colours */
export const PALETTE = ['#6e4fb8', '#2e8a7e', '#d18f25', '#b2466f', '#4f6db0', '#7b8a36', '#8c5a3c', '#3d9bc2'];
export const color = (i) => PALETTE[i % PALETTE.length];
function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mix(a, b, t) {
  const [x, y] = [hex(a), hex(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
export function ramp(stops, t) {
  const p = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(p));
  return mix(stops[i], stops[i + 1], p - i);
}
export function luminance(c) {
  const [r, g, b] = hex(c).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const inkOn = (bg) => (luminance(bg) > 0.36 ? '#241c2b' : '#fbf8f1');

/* ---------------------------------------------------------------- icons */
const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/>',
  table: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M9.5 10v9"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  rows: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  quote: '<path d="M9.5 7C6.5 8 5 10.3 5 13.5V17h5v-5H7.3c.3-1.8 1.2-2.9 2.9-3.6zM18.5 7c-3 1-4.5 3.3-4.5 6.5V17h5v-5h-2.7c.3-1.8 1.2-2.9 2.9-3.6z" fill="currentColor" stroke="none"/>',
  pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.6a3 3 0 0 1 0 5.8M21 19.5a6 6 0 0 0-3.5-5.4"/>',
  shield: '<path d="M12 3.5l7 2.8v5.4c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  file: '<path d="M7 3.5h7l4.5 4.5v12.5H7z"/><path d="M14 3.5V8h4.5"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8"/>',
  play: '<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
  cross: '<path d="M7 7l10 10M17 7L7 17"/>',
  half: '<path d="M6 12h12"/>',
  terminal: '<path d="M5 8l4 4-4 4M11 16h8"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
};
export function icon(name, cls = 'i') {
  const n = s('svg', { viewBox: '0 0 24 24', class: cls, 'aria-hidden': 'true', focusable: 'false', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  n.innerHTML = ICONS[name] || '';
  return n;
}

/* ------------------------------------------------------------ controls */
export function button(label, { icon: iconName, onClick, cls = 'btn', title, pressed, after = false } = {}) {
  const b = h('button', { type: 'button', class: cls, title, 'aria-pressed': pressed == null ? null : String(pressed), onclick: onClick });
  if (iconName && !after) b.append(icon(iconName));
  if (label) b.append(h('span', { text: label }));
  if (iconName && after) b.append(icon(iconName));
  if (!label && title) b.setAttribute('aria-label', title);
  return b;
}
/** A row of mutually exclusive options (tabs, rounds, views). Arrow keys move. */
export function segmented(labels, { onSelect, label, role = 'tablist', cls = 'seg' } = {}) {
  const bar = h('div', { class: cls, role, 'aria-label': label });
  const buttons = labels.map((text, i) => {
    const b = h('button', { type: 'button', class: 'seg__btn', role: role === 'tablist' ? 'tab' : null, text });
    b.addEventListener('click', () => select(i, true));
    b.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let n = null;
      if (e.key in keys) n = (i + keys[e.key] + labels.length) % labels.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = labels.length - 1;
      if (n == null) return;
      e.preventDefault(); select(n, true); buttons[n].focus();
    });
    bar.append(b);
    return b;
  });
  let current = -1;
  function select(i, fromUser) {
    current = i;
    buttons.forEach((b, k) => {
      const on = k === i;
      b.setAttribute(role === 'tablist' ? 'aria-selected' : 'aria-pressed', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (fromUser || onSelect) onSelect?.(i, fromUser);
  }
  return { el: bar, buttons, select, get index() { return current; } };
}
/** Filter chips: "全部" + values (with counts). Calls onChange(value|''). */
export function chips(values, { onChange, all = '全部', counts, label = '筛选', swatch } = {}) {
  const bar = h('div', { class: 'chips', role: 'group', 'aria-label': label });
  let value = '';
  const make = (v, text, i) => {
    const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(v === '') });
    if (swatch && v) b.append(h('span', { class: 'chip__sw', style: { background: swatch(v, i) } }));
    b.append(h('span', { text }));
    if (counts && counts[v] != null) b.append(h('span', { class: 'chip__n', text: counts[v] }));
    b.addEventListener('click', () => set(value === v && v !== '' ? '' : v));
    bar.append(b);
    return [v, b];
  };
  const map = [make('', all, -1), ...values.map((v, i) => make(v, v, i))];
  function set(v) {
    value = v;
    map.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === v)));
    onChange?.(v);
  }
  return { el: bar, set, get value() { return value; } };
}
export function searchBox(placeholder, onInput) {
  const input = h('input', { type: 'search', class: 'search__input', placeholder, 'aria-label': placeholder });
  input.addEventListener('input', () => onInput(input.value));
  return { el: h('label', { class: 'search' }, icon('search'), input), input };
}
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const area = h('textarea', { style: { position: 'fixed', opacity: '0' } });
    area.value = text; document.body.append(area); area.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove(); return ok;
  }
}
/** Button that copies and briefly confirms. */
export function copyButton(getText, label = '复制', cls = 'btn btn--quiet') {
  const b = button(label, { icon: 'copy', cls });
  const text = b.querySelector('span');
  let timer;
  b.addEventListener('click', async () => {
    const ok = await copyText(typeof getText === 'function' ? getText() : getText);
    if (text) text.textContent = ok ? '已复制' : '复制失败，请手动选择';
    clearTimeout(timer); timer = setTimeout(() => { if (text) text.textContent = label; }, 1800);
  });
  return b;
}
export const empty = (message) => h('div', { class: 'empty' }, icon('plus'), h('p', { text: message }));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
