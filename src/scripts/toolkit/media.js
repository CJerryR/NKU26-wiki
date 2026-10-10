import { h, rich, has, icon, button, empty, asset, clamp } from './core.js';

/* -------------------------------------------------------------- lightbox */
function lightbox(d, { body, signal }) {
  const items = (d.items || []).filter((it) => it.image);
  if (!items.length) return body.append(empty('请添加图片。'));
  const img = h('img', { class: 'lb__img', alt: '' });
  const title = h('strong');
  const text = h('span');
  const counter = h('span', { class: 'lb__count' });
  let at = 0;
  const show = (i) => {
    at = (i + items.length) % items.length;
    const it = items[at];
    img.src = asset(it.image); img.alt = it.title || '';
    title.textContent = it.title || '';
    text.textContent = it.text || '';
    counter.textContent = `${at + 1} / ${items.length}`;
  };
  const prev = button('', { cls: 'lb__nav lb__nav--prev', icon: 'left', title: '上一张', onClick: () => show(at - 1) });
  const next = button('', { cls: 'lb__nav lb__nav--next', icon: 'right', title: '下一张', onClick: () => show(at + 1) });
  const close = button('', { cls: 'lb__close', icon: 'close', title: '关闭' });
  const dialog = h('dialog', { class: 'lb__dlg', 'aria-label': d.title || '图片浏览' },
    h('div', { class: 'lb__stage' }, img, items.length > 1 ? prev : null, items.length > 1 ? next : null),
    h('div', { class: 'lb__foot' }, h('p', { class: 'lb__caption' }, title, text), items.length > 1 ? counter : null, close));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
  }, { signal });
  const grid = h('div', { class: ['lb', items.length >= 5 ? 'lb--feature' : ''] }, items.map((it, i) => {
    let src = '';
    try { src = asset(it.image); } catch { return h('p', { class: 'tk__error', text: `图片地址无效：${it.image}` }); }
    const b = h('button', { type: 'button', class: 'lb__tile', 'aria-label': `放大查看：${it.title || `图片 ${i + 1}`}` },
      h('img', { src, alt: it.title || '', loading: 'lazy', decoding: 'async' }),
      has(it.title) ? h('span', { class: 'lb__label', text: it.title }) : null,
      h('span', { class: 'lb__zoom', 'aria-hidden': 'true' }, icon('expand')));
    b.addEventListener('click', () => { show(i); dialog.showModal(); close.focus(); });
    return b;
  }));
  body.append(grid, dialog);
}

/* ------------------------------------------------------------ comparison */
function comparison(d, { body }) {
  if (!d.before || !d.after) return body.append(empty('请选择两张需要对比的图片。'));
  const beforeLabel = d.beforeLabel || '修改前';
  const afterLabel = d.afterLabel || '修改后';
  const after = h('img', { class: 'cmp__img', src: asset(d.after), alt: afterLabel, draggable: 'false' });
  const before = h('img', { class: 'cmp__img', src: asset(d.before), alt: beforeLabel, draggable: 'false' });
  const clip = h('div', { class: 'cmp__before' }, before);
  const handle = h('div', { class: 'cmp__handle', 'aria-hidden': 'true' }, h('span', { class: 'cmp__knob' }, icon('left'), icon('right')));
  const range = h('input', { class: 'cmp__range', type: 'range', min: '0', max: '100', value: '50', step: '0.5', 'aria-label': `拖动比较：左侧 ${beforeLabel}，右侧 ${afterLabel}` });
  const frame = h('div', { class: 'cmp' }, after, clip, handle,
    h('span', { class: 'cmp__tag cmp__tag--l', text: beforeLabel }), h('span', { class: 'cmp__tag cmp__tag--r', text: afterLabel }), range);
  const set = () => { frame.style.setProperty('--pos', `${range.value}%`); range.setAttribute('aria-valuetext', `${Math.round(range.value)}%`); };
  range.addEventListener('input', set);
  after.addEventListener('load', () => { if (after.naturalWidth) frame.style.aspectRatio = `${after.naturalWidth} / ${after.naturalHeight}`; });
  set();
  body.append(frame, h('p', { class: 'muted small cmp__hint' }, icon('left'), h('span', { text: '左右拖动分界线，或聚焦后用方向键调整' }), icon('right')));
}

/* ----------------------------------------------------------------- video */
function video(d, { body, tools }) {
  if (!d.file) return body.append(empty('请选择 MP4 或 WebM 视频。'));
  const src = asset(d.file);
  const player = h('video', { class: 'vid__player', controls: '', preload: 'metadata', playsinline: '', src });
  if (d.poster) player.poster = asset(d.poster);
  if (d.subtitles) player.append(h('track', { kind: 'subtitles', src: asset(d.subtitles), srclang: d.language || 'zh', label: d.language === 'en' ? 'English' : d.language || '中文字幕', default: '' }));
  const note = h('p', { class: 'tk__error', role: 'alert', hidden: '' }, icon('close'), h('span', { text: '视频无法播放：请检查格式（建议 H.264 MP4），或使用下载链接。' }));
  player.addEventListener('error', () => { note.hidden = false; });
  tools.append(h('a', { class: 'btn btn--quiet', href: src, download: '' }, icon('download'), h('span', { text: '下载视频' })));
  body.append(h('div', { class: 'vid' }, player), note,
    d.subtitles ? h('p', { class: 'muted small' }, `已附字幕（${d.language || 'zh'}），可在播放器菜单中开关。`) : null);
}

/* -------------------------------------------------------------- hotspots */
function hotspots(d, { body }) {
  if (!d.image) return body.append(empty('请上传需要标注的图片。'));
  const items = d.items || [];
  const img = h('img', { class: 'hs__img', src: asset(d.image), alt: d.title || '标注图片', loading: 'lazy' });
  const pins = []; const rows = [];
  let current = -1;
  const pick = (i, scroll) => {
    current = current === i ? -1 : i;
    pins.forEach((p, k) => p.setAttribute('aria-pressed', String(k === current)));
    rows.forEach((r, k) => r.classList.toggle('is-on', k === current));
    if (current >= 0 && scroll) rows[current].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  items.forEach((it, i) => {
    const pin = h('button', { type: 'button', class: 'hs__pin', 'aria-pressed': 'false', 'aria-label': `标注 ${i + 1}：${it.title || ''}`, style: { left: `${clamp(it.x, 0, 100, 50)}%`, top: `${clamp(it.y, 0, 100, 50)}%` }, text: String(i + 1) });
    pin.addEventListener('click', () => pick(i, true));
    pins.push(pin);
    const row = h('li', { class: 'hs__row' }, h('button', { type: 'button', class: 'hs__rowbtn', onclick: () => pick(i, false) },
      h('span', { class: 'hs__n', text: String(i + 1) }), h('span', { class: 'hs__t', text: it.title || `标注 ${i + 1}` })),
      has(it.text) ? h('div', { class: 'hs__text' }, rich(it.text)) : null);
    rows.push(row);
  });
  body.append(h('div', { class: ['hs', items.length ? '' : 'hs--solo'] },
    h('div', { class: 'hs__stage' }, img, pins),
    items.length ? h('ol', { class: 'hs__list' }, rows) : null));
}

export const components = {
  lightbox: { render: lightbox },
  comparison: { render: comparison },
  video: { render: video },
  hotspots: { render: hotspots },
};
