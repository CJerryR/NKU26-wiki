import { h, s, rich, has, icon, segmented, chips, searchBox, empty, safeHref, linkProps, color, mix, inkOn, swap } from './core.js';

const TYPE_NAMES = {
  promoter: '启动子', rbs: 'RBS', cds: '编码序列', terminator: '终止子', operator: '调控位点', origin: '复制起点',
  insulator: '绝缘子', composite: '复合元件', plasmid: '质粒 / 骨架', other: '其他',
};
const typeOf = (t) => (TYPE_NAMES[String(t || '').toLowerCase()] ? String(t).toLowerCase() : 'other');
const INK = '#241c2b';

/**
 * SBOL Visual-style glyph sitting on a backbone at height y.
 * Returns an <g>; x is the left edge, w the slot width, hgt the glyph height.
 */
export function glyph(type, x, y, w, hgt, fill) {
  const g = s('g', { class: `glyph glyph--${type}` });
  const cx = x + w / 2; const sw = Math.max(1.6, hgt / 18);
  const line = { fill: 'none', stroke: INK, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  switch (type) {
    case 'promoter': {
      const top = y - hgt * 0.72; const x0 = x + w * 0.22; const x1 = x + w * 0.82;
      g.append(s('path', { d: `M${x0} ${y}V${top}H${x1}`, ...line }), s('path', { d: `M${x1 - hgt * 0.16} ${top - hgt * 0.14}L${x1} ${top}L${x1 - hgt * 0.16} ${top + hgt * 0.14}`, ...line }));
      break;
    }
    case 'rbs': {
      const r = Math.min(w * 0.42, hgt * 0.38);
      g.append(s('path', { d: `M${cx - r} ${y}A${r} ${r} 0 0 1 ${cx + r} ${y}Z`, fill: mix(fill, '#fbf8f1', 0.55), stroke: INK, 'stroke-width': sw }));
      break;
    }
    case 'cds': {
      const hh = hgt * 0.34; const tip = Math.min(hgt * 0.42, w * 0.28);
      g.append(s('path', { d: `M${x + 2} ${y - hh}H${x + w - tip}L${x + w - 1} ${y}L${x + w - tip} ${y + hh}H${x + 2}Z`, fill, stroke: INK, 'stroke-width': sw * 0.8, 'stroke-linejoin': 'round' }));
      break;
    }
    case 'terminator': {
      const top = y - hgt * 0.62; const half = Math.min(w * 0.38, hgt * 0.34);
      g.append(s('path', { d: `M${cx} ${y}V${top}M${cx - half} ${top}H${cx + half}`, ...line }));
      break;
    }
    case 'operator': {
      const a = Math.min(w * 0.6, hgt * 0.4);
      g.append(s('rect', { x: cx - a / 2, y: y - a / 2, width: a, height: a, fill: '#fbf8f1', stroke: INK, 'stroke-width': sw }));
      break;
    }
    case 'origin': {
      g.append(s('circle', { cx, cy: y, r: Math.min(w * 0.34, hgt * 0.26), fill: '#fbf8f1', stroke: INK, 'stroke-width': sw }));
      break;
    }
    case 'insulator': {
      const a = Math.min(w * 0.66, hgt * 0.5); const b = a * 0.5;
      g.append(s('rect', { x: cx - a / 2, y: y - a / 2, width: a, height: a, fill: '#fbf8f1', stroke: INK, 'stroke-width': sw }), s('rect', { x: cx - b / 2, y: y - b / 2, width: b, height: b, fill: 'none', stroke: INK, 'stroke-width': sw }));
      break;
    }
    case 'composite': {
      const q = w / 2;
      g.append(glyph('promoter', x, y, q, hgt * 0.9, fill), glyph('cds', x + q, y, q, hgt * 0.9, fill));
      break;
    }
    case 'plasmid': {
      g.append(s('circle', { cx, cy: y - hgt * 0.05, r: Math.min(w, hgt) * 0.34, fill: 'none', stroke: INK, 'stroke-width': sw }),
        s('circle', { cx, cy: y - hgt * 0.05 - Math.min(w, hgt) * 0.34, r: sw * 1.6, fill }));
      break;
    }
    default: {
      const a = Math.min(w * 0.7, hgt * 0.5);
      g.append(s('rect', { x: cx - a / 2, y: y - a / 2, width: a, height: a, rx: a / 5, fill: mix(fill, '#fbf8f1', 0.6), stroke: INK, 'stroke-width': sw, 'stroke-dasharray': '3 2' }));
    }
  }
  return g;
}
const onBackbone = (t) => !['plasmid'].includes(t);
function tile(type, fill, size = 44) {
  const t = typeOf(type);
  const svg = s('svg', { class: 'glyph-tile', viewBox: `0 0 ${size} ${size}`, 'aria-hidden': 'true' });
  const y = t === 'cds' || t === 'operator' || t === 'origin' || t === 'insulator' || t === 'other' ? size / 2 : size * 0.68;
  if (onBackbone(t)) svg.append(s('line', { x1: 3, x2: size - 3, y1: y, y2: y, stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  svg.append(glyph(t, size * 0.14, y, size * 0.72, size * 0.62, fill));
  return svg;
}

/* ================================================================= parts */
const statusTone = (st) => (/new|新/i.test(st) ? 'iris' : /improv|改进/i.test(st) ? 'teal' : 'plain');
function parts(d, { body, tools }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加元件：编号、名称、类型、作用和 Registry 链接。'));
  const types = [...new Set(items.map((it) => typeOf(it.type)))];
  const fillOf = (t) => color(Math.max(0, types.indexOf(t)));
  let query = ''; let type = '';
  const cards = items.map((it) => {
    const t = typeOf(it.type); const url = safeHref(it.href);
    return { it, t, card: h('article', { class: 'pt__card' },
      h('div', { class: 'pt__top' }, tile(t, fillOf(t)), h('div', { class: 'pt__ids' },
        h('p', { class: 'pt__code', text: it.code || '未编号' }),
        h('p', { class: 'muted small', text: TYPE_NAMES[t] })),
        has(it.status) ? h('span', { class: `pill tone-${statusTone(it.status)}`, text: it.status }) : null),
      h('h4', { class: 'pt__name', text: it.name || '' }),
      has(it.role) ? h('p', { class: 'pt__role' }, h('span', { class: 'fb__label', text: '在集合中的作用' }), h('span', { text: it.role })) : null,
      has(it.text) ? h('div', { class: 'pt__text' }, rich(it.text)) : null,
      h('div', { class: 'pt__foot' }, has(it.length) ? h('span', { class: 'muted small', text: it.length }) : h('span'),
        url ? h('a', { class: 'btn btn--quiet', href: url, ...linkProps(url) }, h('span', { text: 'Registry' }), icon('external')) : h('span', { class: 'muted small', text: 'Registry 链接待补充' }))) };
  });
  const tableRows = cards.map(({ it, t }) => {
    const url = safeHref(it.href);
    return h('tr', null,
      h('td', null, h('span', { class: 'pt__cell' }, tile(t, fillOf(t), 26), h('span', { class: 'pt__code', text: it.code || '—' }))),
      h('td', { text: it.name || '' }), h('td', { text: TYPE_NAMES[t] }),
      h('td', null, has(it.status) ? h('span', { class: `pill tone-${statusTone(it.status)}`, text: it.status }) : null),
      h('td', { text: it.role || '' }), h('td', { class: 'num', text: it.length || '' }),
      h('td', null, url ? h('a', { href: url, 'aria-label': `${it.code || it.name} 的 Registry 页面`, ...linkProps(url) }, icon('external')) : null));
  });
  const grid = h('div', { class: 'pt__grid' }, cards.map((c) => c.card));
  const tableBox = h('div', { class: 'dt__scroll', tabindex: '0', role: 'region', 'aria-label': '元件表', hidden: '' },
    h('table', { class: 'dt' }, h('thead', null, h('tr', null, ['编号', '名称', '类型', '状态', '作用', '长度', ''].map((c) => h('th', { scope: 'col', text: c })))), h('tbody', null, tableRows)));
  const status = h('span', { class: 'muted small', 'aria-live': 'polite' });
  const apply = () => {
    const q = query.trim().toLowerCase(); let n = 0;
    cards.forEach((c, i) => {
      const on = (!type || c.t === type) && (!q || [c.it.code, c.it.name, c.it.role, c.it.text, c.it.status].join(' ').toLowerCase().includes(q));
      c.card.hidden = !on; tableRows[i].hidden = !on; if (on) n++;
    });
    status.textContent = n === items.length ? `${items.length} 个元件` : `${n} / ${items.length} 个元件`;
  };
  const counts = {}; cards.forEach((c) => { counts[TYPE_NAMES[c.t]] = (counts[TYPE_NAMES[c.t]] || 0) + 1; });
  const byName = Object.fromEntries(types.map((t) => [TYPE_NAMES[t], t]));
  const filter = types.length > 1 ? chips(types.map((t) => TYPE_NAMES[t]), { counts, label: '按类型筛选', swatch: (name) => fillOf(byName[name]), onChange: (v) => { type = byName[v] || ''; apply(); } }) : null;
  const view = segmented(['卡片', '表格'], { role: 'group', label: '视图', cls: 'seg seg--small', onSelect: (i) => { grid.hidden = i !== 0; tableBox.hidden = i !== 1; } });
  tools.append(view.el);
  body.append(filter?.el || null, h('div', { class: 'toolbar' }, searchBox('搜索编号、名称或作用', (v) => { query = v; apply(); }).el, status), grid, tableBox);
  view.select(0); apply();
}

/* ============================================================= construct */
const SLOT = { promoter: 50, rbs: 38, cds: 118, terminator: 38, operator: 34, origin: 38, insulator: 38, other: 44 };
function construct(d, { body, onCleanup }) {
  const items = (d.items || []).map((it) => ({ ...it, t: typeOf(it.type) === 'composite' || typeOf(it.type) === 'plasmid' ? 'other' : typeOf(it.type) }));
  if (!items.length) return body.append(empty('请按顺序添加元件：启动子、RBS、编码序列、终止子……'));
  const svg = s('svg', { class: 'ct__svg', role: 'group', 'aria-label': `基因线路：${items.map((it) => it.label || TYPE_NAMES[it.t]).join(' → ')}` });
  const detail = h('div', { class: 'ct__detail', 'aria-live': 'polite' });
  let current = -1; let groups = [];
  const cdsIndex = []; items.forEach((it, i) => { if (it.t === 'cds') cdsIndex.push(i); });
  const fill = (i) => color(Math.max(0, cdsIndex.indexOf(i)) + 1);
  const select = (i) => {
    current = i; const it = items[i];
    groups.forEach((g, k) => g.setAttribute('aria-pressed', String(k === i)));
    swap(detail, h('p', { class: 'ct__dhead' }, h('span', { class: 'pill', text: TYPE_NAMES[it.t] }), h('strong', { text: it.label || TYPE_NAMES[it.t] }), h('span', { class: 'muted small', text: `第 ${i + 1} / ${items.length} 个元件` })),
      has(it.text) ? rich(it.text) : h('p', { class: 'muted', text: '点击线路中的其他元件查看说明。' }));
  };
  const draw = (W) => {
    swap(svg); groups = [];
    const gap = 12; const natural = items.reduce((sum, it) => sum + SLOT[it.t] + gap, 0) + 36;
    const k = Math.max(0.72, Math.min(1.35, W / natural)); const H = 132; const y = 62; const gh = 48;
    const total = Math.max(W, natural * k);
    svg.setAttribute('viewBox', `0 0 ${total} ${H}`); svg.setAttribute('width', total); svg.setAttribute('height', H);
    svg.append(s('line', { x1: 8, x2: total - 8, y1: y, y2: y, stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
    let x = 18 * k;
    items.forEach((it, i) => {
      const w = SLOT[it.t] * k;
      const g = s('g', { class: 'ct__part', tabindex: '0', role: 'button', 'aria-pressed': String(i === current), 'aria-label': `${TYPE_NAMES[it.t]}：${it.label || ''}` },
        s('rect', { class: 'ct__hit', x: x - 5, y: y - gh - 6, width: w + 10, height: gh + 56, rx: 10 }),
        glyph(it.t, x, y, w, gh, fill(i)));
      const label = it.label || TYPE_NAMES[it.t];
      if (it.t === 'cds' && label.length * 7.2 < w - 26) g.append(s('text', { x: x + (w - 14) / 2, y: y + 4.5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: inkOn(fill(i)), text: label }));
      else {
        const max = Math.max(4, Math.floor((w + gap * k) / 7.4));
        const short = label.length > max ? `${label.slice(0, max - 1)}…` : label;
        const tx = s('text', { x: x + w / 2, y: y + 38, 'text-anchor': 'middle', 'font-size': 12, fill: INK, text: short });
        if (short !== label) tx.append(s('title', { text: label }));
        g.append(tx);
      }
      g.addEventListener('click', () => select(i));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); } });
      svg.append(g); groups.push(g);
      x += w + gap * k;
    });
    if (current >= 0) groups[current]?.setAttribute('aria-pressed', 'true');
  };
  const types = [...new Set(items.map((it) => it.t))];
  const key = h('p', { class: 'ct__key' }, types.map((t) => h('span', null, tile(t, t === 'cds' ? color(1) : '#a996d8', 22), TYPE_NAMES[t])));
  body.append(h('div', { class: 'ct__scroll', tabindex: '0' }, svg), detail, key);
  let width = 0;
  const ro = new ResizeObserver(([entry]) => { const w = Math.floor(entry.contentRect.width); if (w && w !== width) { width = w; draw(w); } });
  ro.observe(body); onCleanup(() => ro.disconnect());
  select(items.findIndex((it) => it.t === 'cds') >= 0 ? items.findIndex((it) => it.t === 'cds') : 0);
}

export const components = {
  parts: { render: parts },
  construct: { render: construct },
};
