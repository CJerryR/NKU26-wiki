const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderMediaBlock(block, type) {
  const names = {protein: '蛋白质结构', pdf: 'PDF 阅读器', html: 'HTML 演示'};
  const title = block.title || names[type];
  const height = Math.max(300, Math.min(1200, Number(block.height) || 600));
  const params = new URLSearchParams({title});
  if (block.file) params.set('src', String(block.file));
  for (const key of ['format','representation','color','chain','residues']) {
    if (block[key]) params.set(key, String(block[key]));
  }
  params.set('scripts', block.scripts === true ? '1' : '0');
  // PDF controls are provided by the visitor's browser, without a custom toolbar.
  if (type === 'pdf' && block.file) {
    const file = String(block.file).trim();
    const safe = /^(?:https?:\/\/|\/(?!\/)|\.\.?\/)/i.test(file);
    if (!safe) return '<p>请选择有效的 PDF 文件地址。</p>';
    const url = escape(file);
    return `<figure class="wiki-media" style="margin:2rem 0"><iframe src="${url}" title="${escape(title)}" loading="lazy" style="display:block;width:100%;height:${height}px;border:0" referrerpolicy="no-referrer"></iframe><figcaption>${block.caption ? `${escape(block.caption)} · ` : ''}<a href="${url}" target="_blank" rel="noopener noreferrer">打开 PDF / 下载</a></figcaption></figure>`;
  }
  const content = block.file
    ? `<iframe src="/widgets/${type}.html?${escape(params.toString())}" title="${escape(title)}" loading="lazy" allow="fullscreen" style="display:block;width:100%;height:${height}px;border:0" referrerpolicy="no-referrer"></iframe>`
    : `<div style="padding:3rem 1rem;text-align:center;background:#f4f1e9"><strong>${escape(title)}</strong><p>尚未选择文件。请在 Tina 后台为此模块选择素材。</p></div>`;
  return `<figure class="wiki-media" style="margin:2rem 0;border:1px solid #d7d1e0;border-radius:16px;overflow:hidden">${content}${block.caption ? `<figcaption style="padding:1rem">${escape(block.caption)}</figcaption>` : ''}</figure>`;
}
