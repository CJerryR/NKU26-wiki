import { h, s, rich, has, icon, button, segmented, chips, empty, asset, safeHref, linkProps, list, clamp, initials, color, swap } from './core.js';

const goLink = (href, text) => {
  const url = safeHref(href);
  if (!url) return null;
  const outside = Object.keys(linkProps(url)).length > 0;
  return h('a', { class: 'go', href: url, ...linkProps(url) }, h('span', { text }), icon(outside ? 'external' : 'arrow'));
};
const photo = (src, name, cls) => {
  if (src) { try { return h('img', { class: cls, src: asset(src), alt: '', loading: 'lazy', decoding: 'async' }); } catch { /* fall through */ } }
  return h('span', { class: `${cls} ${cls}--empty`, 'aria-hidden': 'true', text: initials(name) });
};
const counted = (items, key) => {
  const counts = {};
  for (const it of items) for (const v of (Array.isArray(key) ? key : [key]).flatMap((k) => list(it[k]))) counts[v] = (counts[v] || 0) + 1;
  return counts;
};
const unique = (values) => [...new Set(values.filter(Boolean))];

/* ================================================================= cycle */
const PHASES = [
  { key: 'design', en: 'Design', zh: '设计', c: '#6e4fb8' },
  { key: 'build', en: 'Build', zh: '构建', c: '#2e8a7e' },
  { key: 'test', en: 'Test', zh: '测试', c: '#b37414' },
  { key: 'learn', en: 'Learn', zh: '学习', c: '#b2466f' },
];
function sector(cx, cy, r0, r1, a0, a1) {
  const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
}
function cycle(d, { body }) {
  const rounds = d.items || [];
  if (!rounds.length) return body.append(empty('请添加至少一轮 Design–Build–Test–Learn。'));
  let r = 0; let p = 0;
  const C = 120; const R1 = 112; const R0 = 70; const gap = 0.075;
  const ring = s('svg', { class: 'cyc__ring', viewBox: '0 0 240 240', role: 'group', 'aria-label': '工程循环阶段' });
  const arcs = PHASES.map((ph, i) => {
    const a0 = -Math.PI * 3 / 4 + (i * Math.PI) / 2 + gap; const a1 = a0 + Math.PI / 2 - gap * 2;
    const mid = (a0 + a1) / 2; const lr = (R0 + R1) / 2;
    const path = s('path', { d: sector(C, C, R0, R1, a0, a1) });
    const label = s('text', { x: C + lr * Math.cos(mid), y: C + lr * Math.sin(mid) + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'cyc__en', text: ph.en });
    const g = s('g', { class: 'cyc__arc', tabindex: '0', role: 'button', 'aria-label': `${ph.en} ${ph.zh}`, style: { '--pc': ph.c } }, path, label);
    g.addEventListener('click', () => go(r, i));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(r, i); } });
    ring.append(g);
    return g;
  });
  // small chevrons in the gaps show the direction of the loop
  PHASES.forEach((_, i) => {
    const a = -Math.PI * 3 / 4 + ((i + 1) * Math.PI) / 2; const rr = (R0 + R1) / 2;
    const x = C + rr * Math.cos(a); const y = C + rr * Math.sin(a); const deg = (a * 180) / Math.PI + 90;
    ring.append(s('path', { d: 'M-2.5 -4L2 0L-2.5 4', transform: `translate(${x} ${y}) rotate(${deg})`, class: 'cyc__chev' }));
  });
  const centreTop = s('text', { x: C, y: C - 8, 'text-anchor': 'middle', class: 'cyc__round' });
  const centreSub = s('text', { x: C, y: C + 14, 'text-anchor': 'middle', class: 'cyc__phase' });
  ring.append(centreTop, centreSub);

  const panelHead = h('div', { class: 'cyc__phead' });
  const panelBody = h('div', { class: 'cyc__pbody', 'aria-live': 'polite' });
  const panelFoot = h('div', { class: 'cyc__pfoot' });
  const panel = h('div', { class: 'cyc__panel' }, panelHead, panelBody, panelFoot);
  const seg = rounds.length > 1 ? segmented(rounds.map((it, i) => it.title || `Cycle ${i + 1}`), { label: '选择轮次', onSelect: (i, user) => { if (user) go(i, 0); } }) : null;

  function go(ri, pi) {
    r = ri; p = pi;
    const round = rounds[r]; const ph = PHASES[p];
    if (seg && seg.index !== r) seg.select(r);
    arcs.forEach((g, i) => {
      g.setAttribute('aria-pressed', String(i === p));
      g.classList.toggle('is-empty', !has(round[PHASES[i].key]));
    });
    centreTop.textContent = rounds.length > 1 ? `第 ${r + 1} / ${rounds.length} 轮` : '工程循环';
    centreSub.textContent = `${ph.zh} · ${p + 1}/4`;
    panel.style.setProperty('--pc', ph.c);
    swap(panelHead, h('span', { class: 'cyc__badge', text: ph.en }), h('h4', { text: ph.zh }), rounds.length > 1 || round.title ? h('span', { class: 'muted small', text: round.title || `Cycle ${r + 1}` }) : null);
    swap(panelBody, has(round[ph.key]) ? rich(round[ph.key]) : h('p', { class: 'muted', text: '这一阶段还没有填写内容。' }));
    const prevAt = p > 0 ? [r, p - 1] : r > 0 ? [r - 1, 3] : null;
    const nextAt = p < 3 ? [r, p + 1] : r < rounds.length - 1 ? [r + 1, 0] : null;
    swap(panelFoot, 
      prevAt ? button('上一步', { cls: 'btn btn--quiet', icon: 'left', onClick: () => go(...prevAt) }) : h('span'),
      goLink(round.href, '详细数据'),
      nextAt ? button(nextAt[0] !== r ? `进入 ${rounds[nextAt[0]].title || `Cycle ${nextAt[0] + 1}`}` : `下一步：${PHASES[nextAt[1]].en}`, { cls: 'btn btn--next', icon: 'right', after: true, onClick: () => go(...nextAt) }) : h('span', { class: 'muted small', text: '循环结束' }));
  }
  body.append(seg ? h('div', { class: 'seg-scroll' }, seg.el) : null, h('div', { class: 'cyc' }, ring, panel));
  go(0, 0);
}

/* ============================================================== feedback */


/* ========================================================== stakeholders */
function stakeholders(d, { body }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加利益相关者，并给出影响力与关注程度（1–5）。'));
  const groups = unique(items.map((it) => it.group));
  const gColor = (g) => color(Math.max(0, groups.indexOf(g)));
  const S = 320; const pad = 34; const span = S - pad * 2;
  const P = (v) => ((clamp(v, 1, 5, 3) - 0.5) / 5) * span;
  const plot = s('svg', { class: 'sh__plot', viewBox: `0 0 ${S + 8} ${S + 8}`, role: 'group', 'aria-label': '影响力—关注程度矩阵' });
  const x0 = pad + 8; const y0 = pad - 16;
  [[0, 0, '#efe6d6'], [span / 2, 0, '#e9e0f4'], [0, span / 2, '#f3ede2'], [span / 2, span / 2, '#efe6d6']].forEach(([x, y, fill]) => plot.append(s('rect', { x: x0 + x, y: y0 + y, width: span / 2, height: span / 2, fill })));
  const q = (x, y, text, anchor) => plot.append(s('text', { x, y, 'text-anchor': anchor, class: 'sh__q', text }));
  q(x0 + span - 8, y0 + 18, '重点合作', 'end'); q(x0 + 8, y0 + 18, '保持满意', 'start');
  q(x0 + span - 8, y0 + span - 10, '保持沟通', 'end'); q(x0 + 8, y0 + span - 10, '持续关注', 'start');
  plot.append(s('text', { x: x0 + span / 2, y: y0 + span + 26, 'text-anchor': 'middle', class: 'sh__axis', text: `${d.xLabel || '关注程度'} →` }),
    s('text', { x: x0 - 14, y: y0 + span / 2, transform: `rotate(-90 ${x0 - 14} ${y0 + span / 2})`, 'text-anchor': 'middle', class: 'sh__axis', text: `${d.yLabel || '影响力'} →` }));
  const seen = {};
  const dots = items.map((it, i) => {
    const key = `${clamp(it.interest, 1, 5, 3)}-${clamp(it.influence, 1, 5, 3)}`; const k = seen[key] = (seen[key] ?? -1) + 1;
    const ang = k * 2.4; const off = k ? 13 : 0;
    const cx = x0 + P(it.interest) + off * Math.cos(ang); const cy = y0 + span - P(it.influence) + off * Math.sin(ang);
    const g = s('g', { class: 'sh__dot', tabindex: '0', role: 'button', 'aria-label': `${i + 1}. ${it.name || ''}`, style: { '--gc': gColor(it.group) } },
      s('circle', { cx, cy, r: 12 }), s('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', text: String(i + 1) }));
    g.addEventListener('click', () => pick(i));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
    plot.append(g);
    return g;
  });
  const detail = h('div', { class: 'sh__detail', 'aria-live': 'polite' });
  const listEl = h('ol', { class: 'sh__list' }, items.map((it, i) => h('li', null, h('button', { type: 'button', class: 'sh__item', onclick: () => pick(i) },
    h('span', { class: 'sh__n', style: { background: gColor(it.group) }, text: String(i + 1) }), h('span', { text: it.name || `对象 ${i + 1}` })))));
  let current = 0;
  function pick(i) {
    current = i; const it = items[i];
    dots.forEach((g, k) => g.setAttribute('aria-pressed', String(k === i)));
    listEl.querySelectorAll('.sh__item').forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
    swap(detail, 
      h('div', { class: 'sh__dhead' }, h('span', { class: 'sh__n', style: { background: gColor(it.group) }, text: String(i + 1) }), h('h4', { text: it.name || `对象 ${i + 1}` })),
      h('p', { class: 'meta' }, it.group ? h('span', { class: 'pill', style: { '--tone': gColor(it.group) }, text: it.group }) : null,
        h('span', { text: `影响力 ${clamp(it.influence, 1, 5, '—')}` }), h('span', { text: `关注 ${clamp(it.interest, 1, 5, '—')}` })),
      has(it.text) ? rich(it.text) : h('p', { class: 'muted', text: '尚未填写诉求与回应。' }),
      goLink(it.href, '查看交流记录'));
  }
  const filter = groups.length > 1 ? chips(groups, { counts: counted(items, 'group'), swatch: gColor, label: '按类别筛选', onChange: (v) => {
    items.forEach((it, i) => { const on = !v || it.group === v; dots[i].classList.toggle('is-dim', !on); listEl.children[i].hidden = !on; });
    if (v && items[current].group !== v) { const first = items.findIndex((it) => it.group === v); if (first >= 0) pick(first); }
  } }) : null;
  body.append(filter?.el || null, h('div', { class: 'sh' }, h('div', { class: 'sh__plotwrap' }, plot), h('div', { class: 'sh__side' }, detail, listEl)));
  pick(0);
}

/* ============================================================= interview */
function interview(d, { body }) {
  const items = d.items || [];
  const takeaways = String(d.takeaways || '').split('\n').map((t) => t.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean);
  const head = h('div', { class: 'iv__head' }, photo(d.image, d.person, 'iv__photo'),
    h('div', { class: 'iv__who' }, h('p', { class: 'iv__name', text: d.person || '受访者' }), has(d.role) ? h('p', { class: 'muted', text: d.role }) : null),
    has(d.date) ? h('span', { class: 'pill' }, icon('calendar'), h('span', { text: d.date })) : null);
  const quoteEl = has(d.quote) ? h('blockquote', { class: 'iv__quote' }, icon('quote', 'i iv__mark'), rich(d.quote)) : null;
  const cols = (takeaways.length || has(d.impact)) ? h('div', { class: 'iv__cols' },
    takeaways.length ? h('section', { class: 'iv__take' }, h('h4', { text: '访谈要点' }), h('ul', null, takeaways.map((t) => h('li', null, icon('check'), h('span', { text: t }))))) : null,
    has(d.impact) ? h('section', { class: 'iv__impact' }, h('h4', null, icon('bulb'), h('span', { text: '对项目的影响' })), rich(d.impact), goLink(d.href, '查看对应改动')) : null) : null;
  const qa = items.length ? h('details', { class: 'iv__qa' }, h('summary', null, h('span', { text: `访谈问答（${items.length}）` }), icon('down', 'i acc__chev')),
    h('dl', null, items.map((it, i) => h('div', { class: 'iv__pair' }, h('dt', null, h('span', { class: 'iv__q', text: `Q${i + 1}` }), h('span', { text: it.title || '' })), h('dd', null, rich(it.text)))))) : null;
  if (!has(d.person) && !quoteEl && !cols && !qa) return body.append(empty('请填写受访者、原话、要点和影响。'));
  body.append(h('div', { class: 'iv' }, head, quoteEl, cols, qa));
}

/* ============================================================ chronology */
function chronology(d, { body }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加时间线事件。'));
  const cats = unique(items.map((it) => it.category));
  const catColor = (c) => color(Math.max(0, cats.indexOf(c)));
  const rows = items.map((it) => h('li', { class: 'chr__item', dataset: { cat: it.category || '' }, style: { '--tone': catColor(it.category) } },
    h('p', { class: 'chr__date', text: it.date || '' }),
    h('span', { class: 'chr__dot', 'aria-hidden': 'true' }),
    h('div', { class: 'chr__main' },
      it.category ? h('span', { class: 'pill', style: { '--tone': catColor(it.category) }, text: it.category }) : null,
      h('h4', { text: it.title || '' }), rich(it.text), goLink(it.href, '相关内容'))));
  const none = h('p', { class: 'muted', hidden: '', text: '这个分类下暂时没有事件。' });
  const filter = cats.length > 1 ? chips(cats, { counts: counted(items, 'category'), swatch: catColor, label: '按分类筛选', onChange: (v) => {
    let n = 0; rows.forEach((row) => { const on = !v || row.dataset.cat === v; row.hidden = !on; if (on) n++; }); none.hidden = n > 0;
  } }) : null;
  body.append(filter?.el || null, h('ol', { class: 'chr' }, rows), none);
}

/* ============================================================== activity */


/* ================================================================== risk */
const LEVELS = [[4, '低', '#dfe7d2'], [9, '中', '#f3deac'], [16, '高', '#f0b88f'], [25, '极高', '#e38c70']];
const level = (score) => LEVELS.find(([max]) => score <= max) || LEVELS[3];
function risk(d, { body }) {
  const items = (d.items || []).map((it, i) => ({ ...it, i, L: clamp(it.likelihood, 1, 5, 3), S: clamp(it.severity, 1, 5, 3) }));
  if (!items.length) return body.append(empty('请添加风险，并给出可能性与严重程度（1–5）。'));
  const markers = []; const rows = [];
  const pick = (i, scroll) => {
    markers.forEach((m) => m.setAttribute('aria-pressed', String(Number(m.dataset.i) === i)));
    rows.forEach((r, k) => { r.open = k === i ? true : r.open; r.classList.toggle('is-on', k === i); });
    if (scroll) rows[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  const grid = h('div', { class: 'rk__grid', role: 'group', 'aria-label': '风险矩阵：纵轴严重程度，横轴可能性' });
  for (let sev = 5; sev >= 1; sev--) {
    grid.append(h('span', { class: 'rk__ax', text: String(sev) }));
    for (let lik = 1; lik <= 5; lik++) {
      const here = items.filter((it) => Math.round(it.S) === sev && Math.round(it.L) === lik);
      const c = h('div', { class: 'rk__cell', style: { background: level(sev * lik)[2] } }, here.map((it) => {
        const m = h('button', { type: 'button', class: 'rk__mark', 'aria-pressed': 'false', dataset: { i: it.i }, 'aria-label': `风险 ${it.i + 1}：${it.title || ''}`, text: String(it.i + 1) });
        m.addEventListener('click', () => pick(it.i, true));
        markers.push(m);
        return m;
      }));
      grid.append(c);
    }
  }
  grid.append(h('span'), ...[1, 2, 3, 4, 5].map((n) => h('span', { class: 'rk__ax', text: String(n) })));
  const matrixBox = h('div', { class: 'rk__matrix' }, h('p', { class: 'rk__ylab', text: '↑ 严重程度' }), grid, h('p', { class: 'rk__xlab', text: '可能性 →' }),
    h('p', { class: 'rk__key' }, LEVELS.map(([, name, bg]) => h('span', null, h('i', { style: { background: bg } }), name))));
  items.forEach((it) => {
    const score = Math.round(it.L * it.S); const [, name, bg] = level(score);
    const row = h('details', { class: 'rk__row' },
      h('summary', null, h('span', { class: 'rk__n', text: String(it.i + 1) }), h('span', { class: 'rk__t', text: it.title || `风险 ${it.i + 1}` }),
        h('span', { class: 'rk__score', style: { background: bg }, title: `可能性 ${it.L} × 严重程度 ${it.S}`, text: `${name} ${score}` }), icon('down', 'i acc__chev')),
      h('div', { class: 'rk__body' }, has(it.text) ? rich(it.text) : null,
        has(it.mitigation) ? h('div', { class: 'rk__mit' }, h('p', { class: 'fb__label' }, icon('shield'), h('span', { text: '应对措施' })), rich(it.mitigation)) : null));
    row.addEventListener('toggle', () => { if (row.open) markers.forEach((m) => m.setAttribute('aria-pressed', String(Number(m.dataset.i) === it.i))); });
    rows.push(row);
  });
  body.append(h('div', { class: 'rk' }, matrixBox, h('div', { class: 'rk__list' }, rows)));
}

/* =============================================================== members */


/* ========================================================== attributions */


export const components = {
  cycle: { render: cycle },
  
  stakeholders: { render: stakeholders },
  interview: { render: interview },
  chronology: { render: chronology },
  
  risk: { render: risk },
  
  
};
