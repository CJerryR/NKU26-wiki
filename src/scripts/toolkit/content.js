import { h, rich, has, icon, button, segmented, searchBox, copyButton, empty, safeHref, linkProps, asset, extension, fileName, initials, list, swap } from './core.js';

const goLink = (href, text) => {
  const url = safeHref(href);
  if (!url) return null;
  const outside = Object.keys(linkProps(url)).length > 0;
  return h('a', { class: 'go', href: url, ...linkProps(url) }, h('span', { text }), icon(outside ? 'external' : 'arrow'));
};

/* ------------------------------------------------------------------ tabs */
function tabs(d, { body }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加分栏条目。'));
  const labels = items.map((it, i) => it.title || `分栏 ${i + 1}`);
  const panels = items.map((it, i) => h('div', { class: 'tabs__panel', role: 'tabpanel', tabindex: '0', id: `panel-${i}` }, rich(it.text)));
  const pager = h('div', { class: 'tabs__pager' });
  const seg = segmented(labels, {
    label: d.title || '内容分栏',
    onSelect: (n) => {
      panels.forEach((p, k) => { p.hidden = k !== n; });
      swap(pager);
      if (items.length < 2) return;
      pager.append(h('span', { class: 'muted', text: `${n + 1} / ${items.length}` }));
      if (n < items.length - 1) pager.append(button(`下一栏：${labels[n + 1]}`, { cls: 'btn btn--quiet', icon: 'right', after: true, onClick: () => { seg.select(n + 1, true); seg.buttons[n + 1].focus(); } }));
    },
  });
  seg.buttons.forEach((b, i) => { b.id = `tab-${i}`; b.setAttribute('aria-controls', `panel-${i}`); panels[i].setAttribute('aria-labelledby', `tab-${i}`); });
  body.append(h('div', { class: 'seg-scroll' }, seg.el), h('div', { class: 'tabs__panels' }, panels), pager);
  seg.select(0);
}

/* ------------------------------------------------------------- accordion */
function accordion(d, { body, tools }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加问答或访谈条目。'));
  const rows = items.map((it, i) => h('details', { class: 'acc__item' },
    h('summary', { class: 'acc__sum' }, h('span', { class: 'acc__q', text: it.title || `条目 ${i + 1}` }), icon('down', 'i acc__chev')),
    h('div', { class: 'acc__a' }, rich(it.text))));
  if (items.length >= 3) {
    const toggle = button('全部展开', { cls: 'btn btn--quiet', icon: 'expand' });
    toggle.addEventListener('click', () => {
      const open = rows.some((r) => !r.open);
      rows.forEach((r) => { r.open = open; });
      toggle.querySelector('span').textContent = open ? '全部收起' : '全部展开';
    });
    tools.append(toggle);
  }
  body.append(h('div', { class: 'acc' }, rows));
}

/* -------------------------------------------------------------- protocol */


/* ------------------------------------------------------------- downloads */
const KINDS = {
  pdf: ['PDF', 'rust'], csv: ['CSV', 'teal'], tsv: ['TSV', 'teal'], xlsx: ['XLSX', 'teal'], xls: ['XLS', 'teal'],
  zip: ['ZIP', 'amber'], gz: ['GZ', 'amber'], pdb: ['PDB', 'iris'], cif: ['CIF', 'iris'], fasta: ['FASTA', 'iris'], gb: ['GB', 'iris'], gbk: ['GBK', 'iris'], sbol: ['SBOL', 'iris'],
  html: ['HTML', 'slate'], htm: ['HTML', 'slate'], docx: ['DOCX', 'slate'], doc: ['DOC', 'slate'], pptx: ['PPTX', 'berry'], ppt: ['PPT', 'berry'],
  py: ['PY', 'moss'], r: ['R', 'moss'], m: ['M', 'moss'], ipynb: ['IPYNB', 'moss'], js: ['JS', 'moss'], json: ['JSON', 'moss'],
  png: ['PNG', 'berry'], jpg: ['JPG', 'berry'], jpeg: ['JPG', 'berry'], svg: ['SVG', 'berry'], mp4: ['MP4', 'berry'],
};
function downloads(d, { body }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加附件。'));
  const rows = items.map((it) => {
    const ext = it.file ? extension(it.file) : '';
    const [kind, tone] = KINDS[ext] || [ext ? ext.toUpperCase().slice(0, 5) : '待传', 'plain'];
    let url = '';
    try { url = it.file ? asset(it.file) : ''; } catch { url = ''; }
    const meta = [it.audience && h('span', null, icon('users'), h('span', { text: it.audience })), it.license && h('span', null, icon('file'), h('span', { text: it.license }))].filter(Boolean);
    return h('li', { class: 'file' },
      h('span', { class: `file__kind tone-${tone}`, text: kind }),
      h('div', { class: 'file__main' },
        h('p', { class: 'file__name', text: it.title || (it.file ? fileName(it.file) : '待上传附件') }),
        has(it.text) ? h('div', { class: 'file__text' }, rich(it.text)) : null,
        meta.length ? h('p', { class: 'meta' }, meta) : null),
      url ? h('a', { class: 'btn', href: url, download: '' }, icon('download'), h('span', { text: '下载' })) : h('span', { class: 'pill pill--muted', text: '尚未上传' }));
  });
  body.append(h('ul', { class: 'files' }, rows));
}

/* -------------------------------------------------------------- glossary */


/* ------------------------------------------------------------------ flow */
function flow(d, { body, onCleanup }) {
  const items = d.items || [];
  if (!items.length) return body.append(empty('请添加流程步骤。'));
  const ol = h('ol', { class: 'flow', style: { '--n': items.length } }, items.map((it, i) => h('li', { class: 'flow__step' },
    h('div', { class: 'flow__top' }, h('span', { class: 'flow__n', text: String(i + 1) }), has(it.tag) ? h('span', { class: 'pill', text: it.tag }) : null),
    h('h4', { text: it.title || `步骤 ${i + 1}` }),
    rich(it.text))));
  body.append(ol);
  // Side-by-side only when every step gets a readable width; otherwise stack.
  const ro = new ResizeObserver(([entry]) => { ol.classList.toggle('flow--row', entry.contentRect.width / items.length >= 150); });
  ro.observe(body);
  onCleanup(() => ro.disconnect());
}

/* -------------------------------------------------------------- criteria */
function medal(name) {
  const t = String(name).toLowerCase();
  if (/bronze|铜/.test(t)) return 'bronze';
  if (/silver|银/.test(t)) return 'silver';
  if (/gold|金/.test(t)) return 'gold';
  return 'special';
}


/* ----------------------------------------------------------------- quote */


/* ------------------------------------------------------------------ code */
const KEYWORDS = new Set('def return import from as for while if elif else in and or not None True False class lambda with try except finally raise yield pass break continue function end const let var new this null undefined true false library require nargin nargout print'.split(' '));
function highlight(line) {
  const out = [];
  const re = /(#.*$|\/\/.*$|%.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?(?:e[-+]?\d+)?\b)|([A-Za-z_][\w]*)/g;
  let last = 0; let m;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    if (m[1]) out.push(h('span', { class: 'tok-c', text: m[1] }));
    else if (m[2]) out.push(h('span', { class: 'tok-s', text: m[2] }));
    else if (m[3]) out.push(h('span', { class: 'tok-n', text: m[3] }));
    else out.push(KEYWORDS.has(m[4]) ? h('span', { class: 'tok-k', text: m[4] }) : m[4]);
    last = re.lastIndex;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}
function code(d, { body }) {
  const text = String(d.code || '').replace(/\s+$/, '');
  if (!text && !has(d.command)) return body.append(empty('请粘贴代码或填写运行命令。'));
  const lines = text ? text.split('\n') : [];
  const pre = h('pre', { class: 'code__pre', tabindex: '0' }, h('code', null, lines.map((l) => h('span', { class: 'code__line' }, highlight(l)))));
  const long = lines.length > 24;
  const box = h('div', { class: ['code', long ? 'code--clip' : ''] },
    h('div', { class: 'code__bar' },
      h('span', { class: 'code__file', text: d.filename || '代码' }),
      has(d.language) ? h('span', { class: 'code__lang', text: d.language }) : null,
      h('span', { class: 'code__lines', text: lines.length ? `${lines.length} 行` : '' }),
      text ? copyButton(text, '复制代码', 'btn btn--dark') : null),
    text ? pre : null);
  if (long) {
    const more = button(`展开全部 ${lines.length} 行`, { cls: 'code__more', icon: 'down' });
    more.addEventListener('click', () => { box.classList.remove('code--clip'); more.remove(); });
    box.append(more);
  }
  body.append(box);
  if (has(d.command)) body.append(h('div', { class: 'code__cmd' }, icon('terminal'), h('code', { text: d.command }), copyButton(d.command, '复制命令')));
  const repo = goLink(d.href, '打开代码仓库');
  if (repo) body.append(h('p', { class: 'code__repo' }, repo));
}

export const components = {
  tabs: { render: tabs },
  accordion: { render: accordion },
  
  downloads: { render: downloads },
  
  flow: { render: flow },
  
  
  code: { render: code },
};
export { goLink, list };
