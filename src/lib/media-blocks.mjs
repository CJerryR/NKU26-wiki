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

  // PDF: the visitor's browser draws its own reader; we only add a title bar with
  // open / download so devices without inline PDF support can still read it.
  if (type === 'pdf') {
    const file = String(block.file).trim();
    if (!SAFE_URL.test(file)) return '<p class="wiki-media__invalid">请选择有效的 PDF 文件地址（站内路径或 https 地址）。</p>';
    const url = escape(file);
    return `<figure class="wiki-media wiki-media--pdf"><iframe class="wiki-media__frame" src="${url}" title="${escape(title)}" loading="lazy" style="height:${height}px;border:0;border-radius:0" referrerpolicy="no-referrer"></iframe><figcaption>${block.caption ? `${escape(block.caption)} · ` : ''}<a href="${url}" target="_blank" rel="noopener noreferrer">打开 PDF / 下载</a></figcaption></figure>`;
  }

  return `<figure class="wiki-media wiki-media--${type}"><iframe class="wiki-media__frame" src="/widgets/${type}.html?${escape(params.toString())}" title="${escape(title)}" loading="lazy" allow="fullscreen" style="height:${height}px" referrerpolicy="no-referrer"></iframe>${caption(block)}</figure>`;
}
