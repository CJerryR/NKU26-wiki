import { h, s, rich, has, icon, button, segmented, chips, searchBox, copyButton, empty, asset, safeHref, linkProps,
  table, toCSV, toNum, fmt, color, ramp, inkOn, saveBlob, reduced, swap } from './core.js';

const FONT = "'Spline Sans', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif";
const INK = '#241c2b'; const INK3 = '#6c6373'; const GRID = '#e6ddcc'; const PAPER = '#fbf8f1';

/* ============================================================ data table */
function isNumericColumn(rows, k) {
  const vals = rows.map((r) => r[k]).filter((v) => v.trim() !== '');
  return vals.length > 0 && vals.filter((v) => Number.isFinite(toNum(v))).length / vals.length >= 0.8;
}
function cell(value) {
  if (/^https?:\/\/\S+$/i.test(value)) {
    const url = safeHref(value);
    if (url) { let label = value; try { const u = new URL(value); label = `${u.hostname.replace(/^www\./, '')}${u.pathname.length > 1 ? `/…/${u.pathname.split('/').filter(Boolean).pop()}` : ''}`; } catch { /* keep */ } return h('a', { href: url, text: label, ...linkProps(url) }); }
  }
  return value;
}
export function renderTable(target, headers, rows, { name = 'data', pageSize = 25 } = {}) {
  const numeric = headers.map((_, k) => isNumericColumn(rows, k));
  let sort = -1; let asc = true; let page = 0; let query = '';
  const status = h('span', { class: 'muted small', 'aria-live': 'polite' });
  const box = searchBox('筛选表格', (v) => { query = v; page = 0; draw(); });
  const tbody = h('tbody');
  const ths = headers.map((label, k) => {
    const b = h('button', { type: 'button', class: 'dt__sort' }, h('span', { text: label }), icon('down', 'i dt__arrow'));
    const th = h('th', { scope: 'col', 'aria-sort': 'none', class: numeric[k] ? 'num' : '' }, b);
    b.addEventListener('click', () => { asc = sort === k ? !asc : true; sort = k; page = 0; draw(); });
    return th;
  });
  const prev = button('', { cls: 'btn btn--icon', icon: 'left', title: '上一页', onClick: () => { page--; draw(); } });
  const next = button('', { cls: 'btn btn--icon', icon: 'right', title: '下一页', onClick: () => { page++; draw(); } });
  const pageText = h('span', { class: 'muted small' });
  const pager = h('div', { class: 'dt__pager' }, prev, pageText, next);
  let current = rows;
  const exportCsv = button('下载 CSV', { cls: 'btn btn--quiet', icon: 'download', onClick: () => saveBlob(new Blob([`\uFEFF${toCSV(headers, current)}`], { type: 'text/csv;charset=utf-8' }), `${name}.csv`) });
  function draw() {
    const q = query.trim().toLowerCase();
    let result = q ? rows.filter((r) => r.join(' ').toLowerCase().includes(q)) : rows;
    if (sort >= 0) {
      result = [...result].sort((a, b) => {
        const x = toNum(a[sort]); const y = toNum(b[sort]);
        const c = Number.isFinite(x) && Number.isFinite(y) && x !== null && y !== null ? x - y : a[sort].localeCompare(b[sort], 'zh');
        return asc ? c : -c;
      });
    }
    current = result;
    ths.forEach((th, k) => th.setAttribute('aria-sort', k === sort ? (asc ? 'ascending' : 'descending') : 'none'));
    const pages = Math.max(1, Math.ceil(result.length / pageSize));
    page = Math.max(0, Math.min(page, pages - 1));
    swap(tbody, ...result.slice(page * pageSize, page * pageSize + pageSize).map((r) => h('tr', null, r.map((v, k) => h('td', { class: numeric[k] ? 'num' : '' }, cell(v))))));
    if (!result.length) tbody.append(h('tr', null, h('td', { colspan: headers.length, class: 'dt__none', text: '没有匹配的行。' })));
    status.textContent = q ? `${result.length} / ${rows.length} 行` : `${rows.length} 行`;
    pageText.textContent = `第 ${page + 1} / ${pages} 页`;
    prev.disabled = page === 0; next.disabled = page >= pages - 1;
    pager.hidden = pages < 2;
  }
  target.append(h('div', { class: 'toolbar' }, box.el, status, h('span', { class: 'grow' }), exportCsv),
    h('div', { class: 'dt__scroll', tabindex: '0', role: 'region', 'aria-label': '数据表（可横向滚动）' }, h('table', { class: 'dt' }, h('thead', null, h('tr', null, ths)), tbody)),
    pager);
  draw();
}
async function csvText(d, ctx, message) {
  const text = (await ctx.load(d.file)) || d.csv || '';
  if (!ctx.active()) return null;
  if (!text.trim()) { ctx.body.append(empty(message)); return null; }
  return text;
}
async function datatable(d, ctx) {
  const text = await csvText(d, ctx, '请选择 CSV 文件或粘贴数据，首行为列名。');
  if (text == null) return;
  const { headers, rows } = table(text);
  renderTable(ctx.body, headers, rows, { name: d.title || 'table' });
}

/* ================================================================ charts */
const tw = (text, size = 12) => [...String(text)].reduce((w, c) => w + (/[\u2E80-\uFFFF]/.test(c) ? size : size * 0.58), 0);
function niceScale(min, max, count = 5, zero = false) {
  if (zero) { min = Math.min(0, min); max = Math.max(0, max); }
  if (min === max) { const pad = Math.abs(min) || 1; min -= pad / 2; max += pad / 2; }
  const raw = (max - min) / count; const mag = 10 ** Math.floor(Math.log10(raw)); const r = raw / mag;
  const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step + 1e-9) * step; const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks = []; for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  const digits = Math.max(0, -Math.floor(Math.log10(step)) + (String(step / mag).includes('.') ? 1 : 0));
  return { lo, hi, ticks, label: (v) => fmt(v, Math.min(digits, 6)) };
}
// "Control ±", "Control_sd", "Control SD", "Control (SEM)" or a bare "±" right after "Control".
function errorBase(name) {
  const t = String(name).trim();
  if (/^(±|\+\/-|sd|s\.d\.|sem|se|err|error|std)$/i.test(t)) return '';
  const m = t.match(/^(.*?)(?:\s*(?:±|\+\/-|\+-)|[\s_]+(?:sd|s\.d\.|sem|se|err|error|std)|\s*\((?:sd|sem|se|err)\))$/i);
  return m ? m[1].trim() : null;
}
const LIKERT = ['#a8481a', '#dc9b73', '#e7ddcb', '#a996d8', '#523a8c'];

function chartModel(headers, rows, type) {
  const series = [];
  headers.slice(1).forEach((name, k) => {
    const col = k + 1; const base = errorBase(name); const prev = series[series.length - 1];
    if (base != null && prev && prev.err == null && (!base || base.toLowerCase() === prev.name.trim().toLowerCase())) { prev.err = col; return; }
    series.push({ name, col, err: null });
  });
  const parse = (r, col, label, i) => {
    const v = toNum(r[col]);
    if (Number.isNaN(v)) throw new Error(`「${label}」第 ${i + 2} 行不是数字：「${r[col]}」`);
    return v;
  };
  series.forEach((sr, k) => {
    sr.values = rows.map((r, i) => { const v = parse(r, sr.col, sr.name, i); if (type === 'stacked' && v != null && v < 0) throw new Error(`百分比堆叠图不接受负数：${sr.name} 第 ${i + 2} 行`); return v; });
    sr.errors = sr.err == null ? null : rows.map((r, i) => { const e = parse(r, sr.err, headers[sr.err], i); if (e != null && e < 0) throw new Error(`「${headers[sr.err]}」第 ${i + 2} 行误差不能为负数`); return e; });
    sr.color = type === 'stacked' ? ramp(LIKERT, series.length === 1 ? 1 : k / (series.length - 1)) : color(k);
    sr.on = true;
  });
  const xs = rows.map((r) => r[0]);
  const xnum = xs.map((x) => toNum(x));
  const numericX = xnum.every((v) => v != null && Number.isFinite(v));
  if (type === 'scatter' && !numericX) throw new Error('散点图的第一列需要全部是数字。');
  return { series, xs, xnum, numericX };
}

function drawChart(svg, model, type, W, labels) {
  swap(svg);
  const vis = model.series.filter((sr) => sr.on);
  const n = model.xs.length;
  const horizontal = type === 'hbar' || type === 'stacked';
  const H = horizontal ? Math.max(160, n * (type === 'stacked' ? 44 : Math.max(34, vis.length * 16 + 14)) + 70) : Math.round(Math.min(420, Math.max(260, W * 0.52)));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
  const t = (x, y, text, extra = {}) => s('text', { x, y, fill: INK3, 'font-size': 12, 'font-family': FONT, ...extra, text });
  const layers = { grid: s('g'), data: s('g'), axis: s('g'), hover: s('g') };
  Object.values(layers).forEach((g) => svg.append(g));
  const out = { H, hit: null };

  if (!horizontal) {
    let lo = Infinity; let hi = -Infinity;
    let minValue = Infinity;
    for (const sr of vis) sr.values.forEach((v, i) => { if (v == null) return; const e = sr.errors?.[i] || 0; minValue = Math.min(minValue, v); lo = Math.min(lo, v - e); hi = Math.max(hi, v + e); });
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    // Keep the complete supplied error interval, including values below zero.
    const y = niceScale(lo, hi, 5, type === 'bar');
    const left = Math.max(...y.ticks.map((v) => tw(y.label(v)))) + (labels.y ? 34 : 14);
    const pad = { l: left, r: 16, t: 14, b: labels.x ? 54 : 34 };
    const iw = W - pad.l - pad.r; const ih = H - pad.t - pad.b;
    const Y = (v) => pad.t + ih - ((v - y.lo) / (y.hi - y.lo)) * ih;
    y.ticks.forEach((v) => {
      layers.grid.append(s('line', { x1: pad.l, x2: W - pad.r, y1: Y(v), y2: Y(v), stroke: v === 0 ? '#cbbfa8' : GRID, 'stroke-width': 1 }));
      layers.axis.append(t(pad.l - 8, Y(v) + 4, y.label(v), { 'text-anchor': 'end' }));
    });
    if (labels.y) layers.axis.append(t(14, pad.t + ih / 2, labels.y, { transform: `rotate(-90 14 ${pad.t + ih / 2})`, 'text-anchor': 'middle', fill: INK, 'font-size': 12.5 }));
    if (labels.x) layers.axis.append(t(pad.l + iw / 2, H - 10, labels.x, { 'text-anchor': 'middle', fill: INK, 'font-size': 12.5 }));

    let X; let xticks;
    const useNum = type !== 'bar' && model.numericX;
    if (useNum) {
      const ext = [Math.min(...model.xnum), Math.max(...model.xnum)];
      const xs = niceScale(ext[0], ext[1], Math.max(2, Math.min(8, Math.floor(iw / 80))));
      const [a, b] = ext[0] === ext[1] ? [xs.lo, xs.hi] : ext;
      X = (i) => pad.l + ((model.xnum[i] - a) / (b - a || 1)) * iw;
      const Xv = (v) => pad.l + ((v - a) / (b - a || 1)) * iw;
      xticks = xs.ticks.filter((v) => v >= a - 1e-9 && v <= b + 1e-9).map((v) => [Xv(v), xs.label(v)]);
    } else {
      const band = iw / n;
      X = type === 'bar' ? (i) => pad.l + band * (i + 0.5) : (i) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
      const every = Math.max(1, Math.ceil(Math.max(...model.xs.map((x) => tw(x) + 12)) / (iw / n)));
      xticks = model.xs.map((x, i) => (i % every === 0 ? [X(i), x] : null)).filter(Boolean);
    }
    layers.grid.append(s('line', { x1: pad.l, x2: W - pad.r, y1: pad.t + ih, y2: pad.t + ih, stroke: '#cbbfa8' }));
    xticks.forEach(([x, label]) => layers.axis.append(t(x, pad.t + ih + 18, label, { 'text-anchor': 'middle' })));

    const whisker = (x, v, e, c) => {
      if (!e) return;
      const g = s('g', { stroke: c, 'stroke-width': 1.4, opacity: 0.85 });
      const eLo = Math.max(y.lo, v - e); g.append(...[s('line', { x1: x, x2: x, y1: Y(eLo), y2: Y(v + e) }), eLo === v - e ? s('line', { x1: x - 4, x2: x + 4, y1: Y(eLo), y2: Y(eLo) }) : null, s('line', { x1: x - 4, x2: x + 4, y1: Y(v + e), y2: Y(v + e) })].filter(Boolean));
      layers.data.append(g);
    };
    if (type === 'bar') {
      const band = iw / n; const gw = band * 0.74; const bw = gw / Math.max(1, vis.length);
      vis.forEach((sr, k) => sr.values.forEach((v, i) => {
        if (v == null) return;
        const x = pad.l + band * i + (band - gw) / 2 + bw * k; const y0 = Y(Math.max(0, Math.min(y.hi, 0))); const yv = Y(v);
        layers.data.append(s('rect', { x: x + 1, y: Math.min(y0, yv), width: Math.max(1, bw - 2), height: Math.max(1, Math.abs(y0 - yv)), rx: Math.min(3, bw / 4), fill: sr.color }));
        whisker(x + bw / 2, v, sr.errors?.[i], INK);
      }));
    } else {
      vis.forEach((sr) => {
        if (type === 'line') {
          let dpath = ''; let pen = false;
          sr.values.forEach((v, i) => { if (v == null) { pen = false; return; } dpath += `${pen ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`; pen = true; });
          layers.data.append(s('path', { d: dpath, fill: 'none', stroke: sr.color, 'stroke-width': 2.25, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
        }
        sr.values.forEach((v, i) => {
          if (v == null) return;
          whisker(X(i), v, sr.errors?.[i], sr.color);
          if (type === 'scatter') layers.data.append(s('circle', { cx: X(i), cy: Y(v), r: 4.5, fill: sr.color, 'fill-opacity': 0.82, stroke: PAPER, 'stroke-width': 1 }));
          else if (n <= 40) layers.data.append(s('circle', { cx: X(i), cy: Y(v), r: 3.2, fill: PAPER, stroke: sr.color, 'stroke-width': 2 }));
        });
      });
    }
    out.hit = (px, py) => {
      if (type === 'scatter') {
        let best = null; let dist = 22;
        vis.forEach((sr) => sr.values.forEach((v, i) => { if (v == null) return; const dd = Math.hypot(X(i) - px, Y(v) - py); if (dd < dist) { dist = dd; best = { i, sr }; } }));
        if (!best) return null;
        return { x: X(best.i), y: Y(best.sr.values[best.i]), title: `${labels.x || '横轴'} ${model.xs[best.i]}`, rows: [[best.sr, best.i]] };
      }
      if (px < pad.l - 10 || px > W - pad.r + 10) return null;
      let i = 0; let dmin = Infinity;
      for (let k = 0; k < n; k++) { const dd = Math.abs(X(k) - px); if (dd < dmin) { dmin = dd; i = k; } }
      swap(layers.hover, s('line', { x1: X(i), x2: X(i), y1: pad.t, y2: pad.t + ih, stroke: INK, 'stroke-opacity': 0.25, 'stroke-dasharray': '3 3' }));
      return { x: X(i), y: pad.t + 8, title: model.xs[i], rows: vis.map((sr) => [sr, i]) };
    };
    out.clear = () => swap(layers.hover);
    return out;
  }

  /* horizontal: hbar (grouped) and stacked (100%) */
  const catW = Math.min(W * 0.36, Math.max(...model.xs.map((x) => tw(x))) + 14);
  const pad = { l: catW + (labels.y ? 22 : 8), r: 18, t: 10, b: labels.x ? 52 : 32 };
  const iw = W - pad.l - pad.r; const ih = H - pad.t - pad.b; const band = ih / n;
  if (labels.y) layers.axis.append(t(12, pad.t + ih / 2, labels.y, { transform: `rotate(-90 12 ${pad.t + ih / 2})`, 'text-anchor': 'middle', fill: INK, 'font-size': 12.5 }));
  if (labels.x) layers.axis.append(t(pad.l + iw / 2, H - 10, labels.x, { 'text-anchor': 'middle', fill: INK, 'font-size': 12.5 }));
  model.xs.forEach((x, i) => {
    const maxChars = Math.floor(catW / 12.5);
    const label = tw(x) > catW - 6 ? `${[...x].slice(0, Math.max(3, maxChars)).join('')}…` : x;
    const node = t(pad.l - 10, pad.t + band * (i + 0.5) + 4, label, { 'text-anchor': 'end', fill: INK });
    if (label !== x) node.append(s('title', { text: x }));
    layers.axis.append(node);
  });
  let X;
  if (type === 'stacked') {
    X = (p) => pad.l + p * iw;
    [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
      layers.grid.append(s('line', { x1: X(p), x2: X(p), y1: pad.t, y2: pad.t + ih, stroke: p === 0.5 ? '#cbbfa8' : GRID }));
      layers.axis.append(t(X(p), pad.t + ih + 18, `${p * 100}%`, { 'text-anchor': 'middle' }));
    });
    model.xs.forEach((_, i) => {
      const total = vis.reduce((sum, sr) => sum + Math.max(0, sr.values[i] || 0), 0);
      let acc = 0; const bh = Math.min(26, band * 0.66); const y0 = pad.t + band * (i + 0.5) - bh / 2;
      vis.forEach((sr) => {
        const v = Math.max(0, sr.values[i] || 0); if (!total || !v) return;
        const p = v / total; const x = X(acc);
        layers.data.append(s('rect', { x: x + 0.5, y: y0, width: Math.max(0, p * iw - 1), height: bh, fill: sr.color }));
        if (p * iw > 34) layers.data.append(t(x + (p * iw) / 2, y0 + bh / 2 + 4, `${Math.round(p * 100)}%`, { 'text-anchor': 'middle', fill: inkOn(sr.color), 'font-size': 11.5 }));
        acc += p;
      });
    });
  } else {
    let lo = Infinity; let hi = -Infinity;
    for (const sr of vis) sr.values.forEach((v, i) => { if (v == null) return; const e = sr.errors?.[i] || 0; lo = Math.min(lo, v - e); hi = Math.max(hi, v + e); });
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    const sc = niceScale(lo, hi, Math.max(3, Math.min(8, Math.floor(iw / 90))), true);
    X = (v) => pad.l + ((v - sc.lo) / (sc.hi - sc.lo)) * iw;
    sc.ticks.forEach((v) => {
      layers.grid.append(s('line', { x1: X(v), x2: X(v), y1: pad.t, y2: pad.t + ih, stroke: v === 0 ? '#cbbfa8' : GRID }));
      layers.axis.append(t(X(v), pad.t + ih + 18, sc.label(v), { 'text-anchor': 'middle' }));
    });
    const gh = band * 0.74; const bh = gh / Math.max(1, vis.length);
    vis.forEach((sr, k) => sr.values.forEach((v, i) => {
      if (v == null) return;
      const y = pad.t + band * i + (band - gh) / 2 + bh * k; const x0 = X(0); const xv = X(v);
      layers.data.append(s('rect', { x: Math.min(x0, xv), y: y + 1, width: Math.max(1, Math.abs(xv - x0)), height: Math.max(1, bh - 2), rx: Math.min(3, bh / 4), fill: sr.color }));
      const e = sr.errors?.[i];
      if (e) {
        const g = s('g', { stroke: INK, 'stroke-width': 1.4, opacity: 0.85 }); const cy = y + bh / 2;
        g.append(s('line', { x1: X(v - e), x2: X(v + e), y1: cy, y2: cy }), s('line', { x1: X(v - e), x2: X(v - e), y1: cy - 4, y2: cy + 4 }), s('line', { x1: X(v + e), x2: X(v + e), y1: cy - 4, y2: cy + 4 }));
        layers.data.append(g);
      }
    }));
  }
  out.hit = (px, py) => {
    if (py < pad.t || py > pad.t + ih) return null;
    const i = Math.max(0, Math.min(n - 1, Math.floor((py - pad.t) / band)));
    swap(layers.hover, s('rect', { x: 0, y: pad.t + band * i, width: W, height: band, fill: INK, 'fill-opacity': 0.04 }));
    return { x: Math.min(W - 10, Math.max(pad.l, px)), y: pad.t + band * i + 4, title: model.xs[i], rows: vis.map((sr) => [sr, i]), percent: type === 'stacked' };
  };
  out.clear = () => swap(layers.hover);
  return out;
}

async function exportPng(svg, name) {
  const clone = svg.cloneNode(true);
  const W = Number(svg.getAttribute('width')); const H = Number(svg.getAttribute('height'));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.insertBefore(s('rect', { width: W, height: H, fill: PAPER }), clone.firstChild);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
  const img = new Image(); img.src = url;
  await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = W * 2; canvas.height = H * 2;
  const c = canvas.getContext('2d'); c.scale(2, 2); c.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  canvas.toBlob((blob) => blob && saveBlob(blob, `${name}.png`));
}

async function chart(d, ctx) {
  const { body, tools, onCleanup } = ctx;
  const text = await csvText(d, ctx, '请选择 CSV 文件或粘贴数据：首列为横轴，其余列为数值。');
  if (text == null) return;
  const { headers, rows } = table(text, { minCols: 2 });
  const type = ['line', 'bar', 'scatter', 'hbar', 'stacked'].includes(d.chartType) ? d.chartType : 'line';
  const model = chartModel(headers, rows, type);
  const svg = s('svg', { class: 'chart__svg', role: 'img', 'aria-label': `${d.title || '数据图表'}：${model.series.map((sr) => sr.name).join('、')}` });
  const tip = h('div', { class: 'chart__tip', hidden: '' });
  const plot = h('div', { class: 'chart__plot' }, svg, tip);
  let geometry = null; let width = 0;
  const redraw = () => { if (width) geometry = drawChart(svg, model, type, width, { x: d.xLabel, y: d.yLabel }); };
  const legend = h('div', { class: 'chart__legend', role: 'group', 'aria-label': '显示或隐藏数据系列' }, model.series.map((sr) => {
    const b = h('button', { type: 'button', class: 'legend', 'aria-pressed': 'true' }, h('span', { class: 'legend__sw', style: { background: sr.color } }), h('span', { text: sr.name }), sr.errors ? h('span', { class: 'legend__err', text: '± 误差' }) : null);
    b.addEventListener('click', () => {
      if (sr.on && model.series.filter((x) => x.on).length === 1) return;
      sr.on = !sr.on; b.setAttribute('aria-pressed', String(sr.on)); redraw();
    });
    return b;
  }));
  plot.addEventListener('pointermove', (e) => {
    if (!geometry?.hit) return;
    const rect = svg.getBoundingClientRect();
    const hit = geometry.hit(e.clientX - rect.left, e.clientY - rect.top);
    if (!hit) { tip.hidden = true; geometry.clear?.(); return; }
    const totals = hit.percent ? hit.rows.reduce((sum, [sr, i]) => sum + Math.max(0, sr.values[i] || 0), 0) : 0;
    swap(tip, h('strong', { text: hit.title }), ...hit.rows.map(([sr, i]) => {
      const v = sr.values[i]; const e2 = sr.errors?.[i];
      const val = v == null ? '—' : `${fmt(v)}${e2 ? ` ± ${fmt(e2)}` : ''}${hit.percent && totals ? `（${Math.round((Math.max(0, v) / totals) * 100)}%）` : ''}`;
      return h('span', { class: 'chart__tiprow' }, h('i', { style: { background: sr.color } }), h('span', { text: sr.name }), h('b', { text: val }));
    }));
    tip.hidden = false;
    let left = hit.x + 14;
    if (left + tip.offsetWidth > rect.width - 6) left = hit.x - tip.offsetWidth - 14;
    tip.style.transform = `translate(${Math.max(4, left)}px, ${Math.max(4, hit.y)}px)`;
  });
  plot.addEventListener('pointerleave', () => { tip.hidden = true; geometry?.clear?.(); });
  const dataBox = h('div', { class: 'chart__data', hidden: '' });
  let built = false;
  const toggle = button('数据表', { cls: 'btn btn--quiet', icon: 'table', pressed: false });
  toggle.addEventListener('click', () => {
    const open = dataBox.hidden;
    if (open && !built) { renderTable(dataBox, headers, rows, { name: d.title || 'chart-data' }); built = true; }
    dataBox.hidden = !open; toggle.setAttribute('aria-pressed', String(open));
  });
  tools.append(toggle, button('PNG', { cls: 'btn btn--quiet', icon: 'download', title: '下载图表 PNG', onClick: () => exportPng(svg, d.title || 'chart') }));
  body.append(legend, plot, dataBox);
  const ro = new ResizeObserver(([entry]) => { const w = Math.floor(entry.contentRect.width); if (w && w !== width) { width = w; redraw(); } });
  ro.observe(plot);
  onCleanup(() => ro.disconnect());
}

/* =============================================================== heatmap */
const SCALES = {
  iris: ['#f4effb', '#c8b8ef', '#8a6ed0', '#523a8c', '#2a1b52'],
  amber: ['#fbf4e4', '#f3d49a', '#e2a23c', '#a8670f', '#5e3806'],
  diverging: ['#8e3a12', '#dc9b73', '#f6f1e8', '#a996d8', '#3f2a78'],
};
async function heatmap(d, ctx) {
  const { body, tools, onCleanup } = ctx;
  const text = await csvText(d, ctx, '请选择 CSV：首行为列名，首列为行名，其余为数值。');
  if (text == null) return;
  const { headers, rows } = table(text, { minCols: 2 });
  const cols = headers.slice(1); const names = rows.map((r) => r[0]);
  const values = rows.map((r, i) => r.slice(1).map((v, k) => { const n = toNum(v); if (Number.isNaN(n)) throw new Error(`第 ${i + 2} 行「${cols[k]}」不是数字：「${v}」`); return n; }));
  const flat = values.flat().filter((v) => v != null);
  if (!flat.length) throw new Error('没有可用的数值。');
  const plate = names.every((n) => /^[A-P]$/i.test(n)) && cols.every((c) => /^\d{1,2}$/.test(c));
  const palette = SCALES[d.palette] ? d.palette : 'iris';
  let min = Math.min(...flat); let max = Math.max(...flat);
  if (palette === 'diverging' && min < 0 && max > 0) { const m = Math.max(-min, max); min = -m; max = m; }
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));
  const unit = d.unit ? ` ${d.unit}` : '';
  const svg = s('svg', { class: 'hm__svg', role: 'img', 'aria-label': `${d.title || '热图'}：${rows.length} 行 × ${cols.length} 列，范围 ${fmt(min)}–${fmt(max)}${unit}` });
  const tip = h('div', { class: 'chart__tip', hidden: '' });
  const plot = h('div', { class: 'chart__plot' }, svg, tip);
  let geom = null;
  const draw = (W) => {
    swap(svg);
    const rowW = Math.max(...names.map((n) => tw(n))) + 14;
    const colH = Math.max(...cols.map((c) => tw(c))) > 44 ? 60 : 24;
    const cellSize = Math.max(14, Math.min(plate ? 46 : 64, (W - rowW - 10) / cols.length));
    const gw = cellSize * cols.length; const gh = cellSize * rows.length;
    const legendH = 46; const H = colH + gh + legendH + 8; const x0 = rowW; const y0 = colH;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    cols.forEach((c, k) => {
      const cx = x0 + cellSize * (k + 0.5);
      svg.append(colH > 30 ? s('text', { x: cx, y: colH - 6, transform: `rotate(-40 ${cx} ${colH - 6})`, 'font-size': 11.5, 'font-family': FONT, fill: INK3, text: c })
        : s('text', { x: cx, y: colH - 8, 'text-anchor': 'middle', 'font-size': 11.5, 'font-family': FONT, fill: INK3, text: c }));
    });
    names.forEach((n, i) => svg.append(s('text', { x: x0 - 8, y: y0 + cellSize * (i + 0.5) + 4, 'text-anchor': 'end', 'font-size': 12, 'font-family': FONT, fill: INK, text: n })));
    if (plate) svg.append(s('rect', { x: x0 - 4, y: y0 - 4, width: gw + 8, height: gh + 8, rx: 12, fill: '#efe6d6' }));
    values.forEach((row, i) => row.forEach((v, k) => {
      const x = x0 + cellSize * k; const y = y0 + cellSize * i;
      const fill = v == null ? '#fbf8f1' : ramp(SCALES[palette], norm(v));
      svg.append(plate
        ? s('circle', { cx: x + cellSize / 2, cy: y + cellSize / 2, r: cellSize * 0.41, fill, stroke: v == null ? '#cbbfa8' : 'none', 'stroke-dasharray': v == null ? '2 2' : null })
        : s('rect', { x: x + 1, y: y + 1, width: cellSize - 2, height: cellSize - 2, rx: 3, fill, stroke: v == null ? '#e2d8c6' : 'none' }));
      if (d.showValues && v != null && cellSize >= 30) svg.append(s('text', { x: x + cellSize / 2, y: y + cellSize / 2 + 4, 'text-anchor': 'middle', 'font-size': cellSize >= 44 ? 11.5 : 10, 'font-family': FONT, fill: inkOn(fill), text: fmt(v, Math.abs(v) >= 100 ? 0 : 1) }));
    }));
    const lw = Math.min(260, gw); const ly = y0 + gh + 22;
    const gid = `g${Math.random().toString(36).slice(2, 8)}`;
    const grad = s('linearGradient', { id: gid });
    SCALES[palette].forEach((c, i, a) => grad.append(s('stop', { offset: `${(i / (a.length - 1)) * 100}%`, 'stop-color': c })));
    svg.append(s('defs', null, grad), s('rect', { x: x0, y: ly, width: lw, height: 10, rx: 5, fill: `url(#${gid})` }),
      s('text', { x: x0, y: ly + 26, 'font-size': 11.5, 'font-family': FONT, fill: INK3, text: fmt(min) }),
      s('text', { x: x0 + lw, y: ly + 26, 'text-anchor': 'end', 'font-size': 11.5, 'font-family': FONT, fill: INK3, text: `${fmt(max)}${unit}` }));
    geom = { x0, y0, cellSize };
  };
  plot.addEventListener('pointermove', (e) => {
    if (!geom) return;
    const r = svg.getBoundingClientRect(); const px = e.clientX - r.left; const py = e.clientY - r.top;
    const k = Math.floor((px - geom.x0) / geom.cellSize); const i = Math.floor((py - geom.y0) / geom.cellSize);
    if (k < 0 || i < 0 || k >= cols.length || i >= rows.length) { tip.hidden = true; return; }
    const v = values[i][k];
    swap(tip, h('strong', { text: plate ? `${names[i]}${cols[k]}` : `${names[i]} × ${cols[k]}` }), h('span', { text: v == null ? '无数据' : `${fmt(v)}${unit}` }));
    tip.hidden = false;
    const x = geom.x0 + geom.cellSize * (k + 1) + 6;
    tip.style.transform = `translate(${x + tip.offsetWidth > r.width ? geom.x0 + geom.cellSize * k - tip.offsetWidth - 6 : x}px, ${geom.y0 + geom.cellSize * i}px)`;
  });
  plot.addEventListener('pointerleave', () => { tip.hidden = true; });
  const dataBox = h('div', { class: 'chart__data', hidden: '' }); let built = false;
  const toggle = button('数据表', { cls: 'btn btn--quiet', icon: 'table', pressed: false });
  toggle.addEventListener('click', () => { const open = dataBox.hidden; if (open && !built) { renderTable(dataBox, headers, rows, { name: d.title || 'heatmap' }); built = true; } dataBox.hidden = !open; toggle.setAttribute('aria-pressed', String(open)); });
  tools.append(toggle, button('PNG', { cls: 'btn btn--quiet', icon: 'download', title: '下载热图 PNG', onClick: () => exportPng(svg, d.title || 'heatmap') }));
  if (plate) body.append(h('p', { class: 'muted small' }, `${rows.length} × ${cols.length} 孔板视图 · 悬停查看每孔数值`));
  body.append(plot, dataBox);
  let width = 0;
  const ro = new ResizeObserver(([entry]) => { const w = Math.floor(entry.contentRect.width); if (w && w !== width) { width = w; draw(w); } });
  ro.observe(plot); onCleanup(() => ro.disconnect());
}

/* ================================================================ matrix */
const YES = /^(✓|✔|√|yes|y|是|满足|支持|true)$/i;
const NO = /^(✗|✘|×|x|no|n|否|不满足|不支持|false)$/i;
const PART = /^(~|～|△|partial|部分|一般)$/i;
async function matrix(d, ctx) {
  const { body } = ctx;
  const text = await csvText(d, ctx, '请粘贴比较表：首列为方案，首行为评价标准。');
  if (text == null) return;
  const { headers, rows } = table(text, { minCols: 2 });
  const rating = headers.map((_, k) => k > 0 && rows.every((r) => !r[k].trim() || /^[0-5](\.5)?(\s*\/\s*5)?$/.test(r[k].trim())) && rows.some((r) => r[k].trim()));
  const used = new Set();
  const render = (v, k) => {
    const t = v.trim();
    if (!t) return h('span', { class: 'muted', text: '—' });
    if (rating[k]) {
      used.add('rate'); const n = Number(t.split('/')[0]);
      return h('span', { class: 'mx__rate', role: 'img', 'aria-label': `${n} / 5` }, [1, 2, 3, 4, 5].map((i) => h('i', { class: n >= i ? 'on' : n >= i - 0.5 ? 'half' : '' })));
    }
    if (YES.test(t)) { used.add('yes'); return h('span', { class: 'mx__sym mx__sym--yes', role: 'img', 'aria-label': '满足' }, icon('check')); }
    if (NO.test(t)) { used.add('no'); return h('span', { class: 'mx__sym mx__sym--no', role: 'img', 'aria-label': '不满足' }, icon('cross')); }
    if (PART.test(t)) { used.add('part'); return h('span', { class: 'mx__sym mx__sym--part', role: 'img', 'aria-label': '部分满足' }, icon('half')); }
    return v;
  };
  const chosen = String(d.highlight || '').trim();
  const tbl = h('table', { class: 'mx' },
    h('thead', null, h('tr', null, headers.map((c, k) => h('th', { scope: 'col', class: k && rating[k] ? 'num' : '', text: c })))),
    h('tbody', null, rows.map((r) => h('tr', { class: chosen && r[0] === chosen ? 'is-chosen' : '' },
      h('th', { scope: 'row' }, h('span', { text: r[0] }), chosen && r[0] === chosen ? h('span', { class: 'pill pill--amber', text: '最终方案' }) : null),
      r.slice(1).map((v, k) => h('td', { class: rating[k + 1] ? 'num' : '' }, render(v, k + 1)))))));
  body.append(h('div', { class: 'dt__scroll', tabindex: '0', role: 'region', 'aria-label': '方案比较表' }, tbl));
  const key = [['yes', 'check', '满足'], ['part', 'half', '部分满足'], ['no', 'cross', '不满足']].filter(([k]) => used.has(k));
  if (key.length || used.has('rate')) {
    body.append(h('p', { class: 'mx__key muted small' },
      key.map(([k, i, label]) => h('span', null, h('span', { class: `mx__sym mx__sym--${k}` }, icon(i)), label)),
      used.has('rate') ? h('span', null, h('span', { class: 'mx__rate' }, [1, 2, 3].map(() => h('i', { class: 'on' }))), '评分（满分 5）') : null));
  }
}

/* ================================================================= KaTeX */
let katexPromise = null;
function katexCss(root) {
  const href = asset('/widgets/vendor/katex/katex.min.css');
  // Fonts declared in a shadow root are ignored by some browsers, so the sheet is
  // also added to the page once; the copy in the shadow root styles the markup.
  if (!document.querySelector('link[data-wiki-katex]')) document.head.append(h('link', { rel: 'stylesheet', href, 'data-wiki-katex': '' }));
  root.append(h('link', { rel: 'stylesheet', href }));
}
const loadKatex = () => (katexPromise ||= import('katex').then((m) => m.default || m));

async function equation(d, ctx) {
  const { body, tools, root, active } = ctx;
  if (!has(d.latex)) return body.append(empty('请填写 LaTeX 公式。'));
  katexCss(root);
  const katex = await loadKatex();
  if (!active()) return;
  const math = h('div', { class: 'eq__math' });
  katex.render(d.latex, math, { displayMode: true, throwOnError: true, trust: false, strict: 'warn', maxExpand: 500, maxSize: 20 });
  tools.append(copyButton(d.latex, '复制 LaTeX', 'btn btn--quiet'));
  body.append(h('div', { class: 'eq' }, h('div', { class: 'eq__scroll', tabindex: '0' }, math), has(d.label) ? h('span', { class: 'eq__label', text: d.label }) : null));
}

const SOURCE_TONE = [[/文献|literature|ref/i, 'slate'], [/实验|测定|measur|exp/i, 'teal'], [/拟合|fit/i, 'iris'], [/估计|estimat/i, 'amber'], [/假设|assum/i, 'berry']];
const tone = (src) => (SOURCE_TONE.find(([re]) => re.test(src || '')) || [null, 'plain'])[1];
async function params(d, ctx) {
  const { body, root, active } = ctx;
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加模型参数。'));
  let katex = null;
  if (items.some((it) => /[\\^_{}]/.test(it.symbol || ''))) {
    katexCss(root);
    try { katex = await loadKatex(); } catch { katex = null; }
    if (!active()) return;
  }
  const sym = (text) => {
    const box = h('span', { class: 'pm__sym' });
    if (katex) { try { katex.render(String(text || ''), box, { throwOnError: true, trust: false, strict: 'ignore' }); return box; } catch { /* plain */ } }
    box.textContent = text || '—'; box.classList.add('pm__sym--plain');
    return box;
  };
  const sources = [...new Set(items.map((it) => it.source).filter(Boolean))];
  const counts = Object.fromEntries(sources.map((src) => [src, items.filter((it) => it.source === src).length]));
  const rows = items.map((it) => {
    const url = safeHref(it.href);
    return { it, node: h('tr', null,
      h('td', null, sym(it.symbol)),
      h('td', { text: it.text || '' }),
      h('td', { class: 'num', text: it.value || '—' }),
      h('td', { class: 'pm__unit', text: it.unit || '' }),
      h('td', null, it.source ? h('span', { class: `pill tone-${tone(it.source)}`, text: it.source }) : null,
        url ? h('a', { class: 'pm__ref', href: url, 'aria-label': '查看来源', ...linkProps(url) }, icon('external')) : null)) };
  });
  const filter = sources.length > 1 ? chips(sources, { counts, label: '按来源筛选', onChange: (v) => rows.forEach(({ it, node }) => { node.hidden = !!v && it.source !== v; }) }) : null;
  body.append(filter?.el || null, h('div', { class: 'dt__scroll', tabindex: '0', role: 'region', 'aria-label': '参数表' },
    h('table', { class: 'dt pm' }, h('thead', null, h('tr', null, ['符号', '含义', '数值', '单位', '来源'].map((c, k) => h('th', { scope: 'col', class: k === 2 ? 'num' : '', text: c })))), h('tbody', null, rows.map((r) => r.node)))));
}

/* ============================================================== sequence */
const COMPLEMENT = { A: 'T', T: 'A', U: 'A', G: 'C', C: 'G', R: 'Y', Y: 'R', S: 'S', W: 'W', K: 'M', M: 'K', B: 'V', V: 'B', D: 'H', H: 'D', N: 'N', '-': '-' };
async function sequence(d, ctx) {
  const { body, tools, active } = ctx;
  const text = (await ctx.load(d.file)) || d.sequence || '';
  if (!active()) return;
  if (!text.trim()) return body.append(empty('请粘贴序列或选择 FASTA 文件。'));
  const headers = text.match(/^>/gm) || [];
  if (headers.length > 1) throw new Error('请使用单条 FASTA 序列；当前内容包含多个记录。');
  const name = (text.match(/^>(.*)$/m)?.[1] || '').trim();
  const seq = text.split('\n').filter((l) => !l.startsWith('>')).join('').replace(/\s/g, '').toUpperCase();
  const kind = ['dna', 'rna', 'protein'].includes(d.sequenceType) ? d.sequenceType : 'dna';
  const valid = kind === 'protein' ? /^[ABCDEFGHIKLMNPQRSTVWXYZ*OUJ-]+$/ : kind === 'rna' ? /^[ACGURYSWKMBDHVN-]+$/ : /^[ACGTRYSWKMBDHVN-]+$/;
  if (!valid.test(seq)) {
    const bad = [...new Set(seq.replace(kind === 'protein' ? /[ABCDEFGHIKLMNPQRSTVWXYZ*OUJ-]/g : kind === 'rna' ? /[ACGURYSWKMBDHVN-]/g : /[ACGTRYSWKMBDHVN-]/g, ''))].slice(0, 6).join(' ');
    throw new Error(`序列包含无效字符（${bad}），请检查序列类型；不要粘贴行号。`);
  }
  if (seq.length > 100000) throw new Error('当前阅读器适合不超过 100,000 个字符的单条序列，请拆分后展示。');
  const unit = kind === 'protein' ? 'aa' : 'nt';
  const features = String(d.highlight || '').split(/[,，;；]/).map((p, i) => {
    const m = p.trim().match(/^(\d+)\s*[-–~]\s*(\d+)\s*[:：]?\s*(.*)$/);
    if (!m) return null;
    const a = Math.max(1, Math.min(+m[1], +m[2])); const b = Math.min(seq.length, Math.max(+m[1], +m[2]));
    return { a, b, name: m[3].trim() || `区域 ${i + 1}`, color: color(i) };
  }).filter((f) => f && f.a <= f.b);
  const featAt = new Int16Array(seq.length).fill(-1);
  features.forEach((f, k) => { for (let j = f.a - 1; j < f.b; j++) if (featAt[j] < 0) featAt[j] = k; });

  const stats = [h('span', null, h('b', { text: seq.length.toLocaleString('en-US') }), ` ${unit}`)];
  if (kind !== 'protein') {
    const bases = (seq.match(/[ACGTU]/g) || []).length; const gc = (seq.match(/[GC]/g) || []).length;
    stats.push(h('span', null, 'GC ', h('b', { text: bases ? `${((gc / bases) * 100).toFixed(1)}%` : '—' })));
  }
  if (features.length) stats.push(h('span', null, h('b', { text: String(features.length) }), ' 个标注区域'));
  const head = h('div', { class: 'seq__head' }, name ? h('span', { class: 'seq__name', text: name }) : null, h('span', { class: 'seq__stats' }, stats));

  const pre = h('pre', { class: 'seq__pre', tabindex: '0', 'aria-label': `${kind.toUpperCase()} 序列，${seq.length} ${unit}` });
  const status = h('span', { class: 'muted small', 'aria-live': 'polite' });
  const input = h('input', { type: 'search', class: 'search__input', placeholder: '查找片段', 'aria-label': '查找序列片段', spellcheck: 'false' });
  let hits = []; let at = 0; let q = '';
  const draw = () => {
    const isHit = new Uint8Array(seq.length);
    hits.forEach((p, k) => { for (let j = p; j < p + q.length; j++) isHit[j] = k === at ? 2 : 1; });
    const frag = document.createDocumentFragment();
    for (let start = 0; start < seq.length; start += 60) {
      const line = h('span', { class: 'seq__line' }, h('span', { class: 'seq__pos', text: String(start + 1).padStart(6) }));
      for (let block = start; block < Math.min(start + 60, seq.length); block += 10) {
        const end = Math.min(block + 10, seq.length); let j = block;
        while (j < end) {
          const f = featAt[j]; const hit = isHit[j]; let k = j + 1;
          while (k < end && featAt[k] === f && isHit[k] === hit) k++;
          const chunk = seq.slice(j, k);
          if (f < 0 && !hit) line.append(chunk);
          else line.append(h('mark', { class: [hit ? (hit === 2 ? 'seq__hit seq__hit--now' : 'seq__hit') : '', f >= 0 ? 'seq__feat' : ''], style: f >= 0 ? { '--fc': features[f].color } : null, title: f >= 0 ? `${features[f].name}（${features[f].a}–${features[f].b}）` : null, text: chunk }));
          j = k;
        }
        line.append(' ');
      }
      frag.append(line, '\n');
    }
    swap(pre, frag);
    const now = pre.querySelector('.seq__hit--now');
    if (now) now.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  };
  const search = () => {
    q = input.value.replace(/\s/g, '').toUpperCase(); hits = []; at = 0;
    if (q) { let p = seq.indexOf(q); while (p >= 0 && hits.length < 5000) { hits.push(p); p = seq.indexOf(q, p + q.length); } }
    status.textContent = q ? (hits.length ? `${hits.length} 处 · 第 1 处位于 ${hits[0] + 1}` : '未找到') : '';
    draw();
  };
  const step = (dir) => { if (!hits.length) return; at = (at + dir + hits.length) % hits.length; status.textContent = `${hits.length} 处 · 第 ${at + 1} 处位于 ${hits[at] + 1}`; draw(); };
  input.addEventListener('input', search);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); } });
  tools.append(copyButton(seq, '复制序列', 'btn btn--quiet'));
  if (kind !== 'protein') tools.append(copyButton(() => [...seq].reverse().map((c) => (kind === 'rna' && c === 'A' ? 'U' : COMPLEMENT[c] || 'N')).join(''), '复制反向互补', 'btn btn--quiet'));
  const legend = features.length ? h('div', { class: 'seq__legend' }, features.map((f) => h('span', { class: 'legend', style: { '--fc': f.color } }, h('span', { class: 'legend__sw', style: { background: f.color } }), h('span', { text: f.name }), h('span', { class: 'muted', text: `${f.a}–${f.b}` })))) : null;
  body.append(head, legend,
    h('div', { class: 'toolbar' }, h('label', { class: 'search' }, icon('search'), input),
      button('', { cls: 'btn btn--icon', icon: 'left', title: '上一处', onClick: () => step(-1) }), button('', { cls: 'btn btn--icon', icon: 'right', title: '下一处（Enter）', onClick: () => step(1) }), status),
    pre);
  draw();
}

export const components = {
  chart: { render: chart },
  datatable: { render: datatable },
  heatmap: { render: heatmap },
  matrix: { render: matrix },
  params: { render: params },
  equation: { render: equation },
  sequence: { render: sequence },
};
