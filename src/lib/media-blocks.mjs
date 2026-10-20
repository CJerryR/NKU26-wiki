const escape = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SAFE_URL = /^(?:https?:\/\/|\/(?!\/)|\.\.?\/)/i;
const NAMES = { protein: '蛋白质结构', pdf: 'PDF 文档', html: 'HTML 演示' };
const HINTS = { protein: '选择 .pdb / .cif 结构文件后显示可旋转模型。', pdf: '选择 .pdf 文件后在此嵌入浏览器原生阅读器。', html: '选择单文件 .html，或填写 /embeds/作品名/index.html。' };

const caption = (block) => (block.caption ? `<figcaption>${escape(block.caption)}</figcaption>` : '');

export function renderMediaBlock(block, type) {
  const title = block.title || NAMES[type];
  const height = Math.max(300, Math.min(1200, Number(block.height) || 600));
  const params = new URLSearchParams({ title });
  if (block.file) params.set('src', String(block.file));
  for (const key of ['format', 'representation', 'color', 'chain', 'residues']) {
    if (block[key]) params.set(key, String(block[key]));
  }
  params.set('scripts', block.scripts === true ? '1' : '0');

  if (!block.file) {
    return `<figure class="wiki-media wiki-media--${type} wiki-media--empty"><div class="wiki-media__empty"><strong>${escape(title)}</strong><span>${HINTS[type]}</span></div>${caption(block)}</figure>`;
  }

  // The trusted multi-file NemaKlear application needs its same-origin Worker
  // and verified Python packages. Keep it in the existing editable HTML template,
  // without passing it through the single-file sandbox viewer.
  const file = String(block.file).trim();
  if (type === 'html' && block.scripts === true && /^\/widgets\/nemaklear\/index\.html(?:\?embed=1)?$/.test(file)) {
    const source = file.includes('?') ? file : `${file}?embed=1`;
    return `<figure class="wiki-media wiki-media--html wiki-media--application"><div class="wiki-media__bar"><span class="wiki-media__kind">Model explorer</span><span class="wiki-media__title">${escape(title)}</span><a class="wiki-media__action" href="${escape(file)}" target="_blank" rel="noopener noreferrer">Open full page</a></div><iframe class="wiki-media__frame" data-nemaklear-app src="${escape(source)}" title="${escape(title)}" loading="eager" allow="clipboard-write; fullscreen" style="height:${height}px" referrerpolicy="no-referrer"></iframe>${caption(block)}</figure>`;
  }

  // PDF: the visitor's browser draws its own reader; we only add a title bar with
  // open / download so devices without inline PDF support can still read it.
  // The bar sits above the frame: on phones that show no inline PDF (e.g. Android
  // Chrome) the frame stays blank, so the link must not wait below it (checkpoint-13).
  if (type === 'pdf') {
    const file = String(block.file).trim();
    if (!SAFE_URL.test(file)) return '<p class="wiki-media__invalid">请选择有效的 PDF 文件地址（站内路径或 https 地址）。</p>';
    const url = escape(file);
    return `<figure class="wiki-media wiki-media--pdf"><div class="wiki-media__bar"><span class="wiki-media__kind">PDF</span><span class="wiki-media__title">${escape(title)}</span><a class="wiki-media__action" href="${url}" target="_blank" rel="noopener noreferrer">Open PDF / Download</a></div><iframe class="wiki-media__frame" src="${url}" title="${escape(title)}" loading="lazy" style="height:${height}px" referrerpolicy="no-referrer"></iframe>${caption(block)}</figure>`;
  }

  return `<figure class="wiki-media wiki-media--${type}"><iframe class="wiki-media__frame" src="/widgets/${type}.html?${escape(params.toString())}" title="${escape(title)}" loading="lazy" allow="fullscreen" style="height:${height}px" referrerpolicy="no-referrer"></iframe>${caption(block)}</figure>`;
}
