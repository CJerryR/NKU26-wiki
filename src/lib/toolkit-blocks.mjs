export const toolkitTypes = new Set(['tabs','accordion','chronology','protocol','lightbox','comparison','video','downloads','datatable','chart','sequence','equation']);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderToolkit(block,type) {
  return `<div class="wiki-toolkit-block"><wiki-toolkit data-props="${esc(JSON.stringify({...block,_template:type}))}"><p>${esc(block.title || '内容组件')}</p><noscript>此组件需要启用 JavaScript。${esc(block.caption)}</noscript></wiki-toolkit></div>`;
}
