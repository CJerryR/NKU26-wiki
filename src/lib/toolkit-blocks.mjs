import { toolkitNames } from './toolkit-specs.mjs';

export const toolkitTypes = new Set(toolkitNames);

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Strip the small inline syntax used in text fields so the fallback reads as prose.
const plain = (value) => String(value ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1');
const SKIP = new Set(['_template', '__typename', 'file', 'image', 'poster', 'subtitles', 'before', 'after', 'href', 'csv', 'code', 'sequence', 'latex',
  'chartType', 'sequenceType', 'palette', 'showValues', 'x', 'y', 'influence', 'interest', 'likelihood', 'severity', 'count', 'language', 'type']);
const TEXT_ORDER = ['title', 'name', 'person', 'source', 'date', 'role', 'identity', 'category', 'group', 'status', 'said', 'change', 'evidence',
  'design', 'build', 'test', 'learn', 'text', 'quotation', 'categories', 'quote', 'takeaways', 'impact', 'mitigation', 'feedback', 'materials', 'duration', 'value', 'unit', 'label'];

function lines(record, depth = 0) {
  const out = [];
  const keys = [...TEXT_ORDER.filter((k) => k in record), ...Object.keys(record).filter((k) => !TEXT_ORDER.includes(k))];
  for (const key of keys) {
    const value = record[key];
    if (SKIP.has(key) || value == null || value === '') continue;
    if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
      out.push('<ul>', ...value.map((item) => `<li>${lines(item, depth + 1).join(' ')}</li>`), '</ul>');
    } else if (Array.isArray(value)) {
      out.push(`<p>${esc(value.join('、'))}</p>`);
    } else if (typeof value !== 'object' && !(depth === 0 && key === 'title')) {
      out.push(`<p>${esc(plain(value))}</p>`);
    }
  }
  return out;
}

/**
 * The interactive version renders inside <wiki-toolkit>'s shadow root. The light-DOM
 * children below stay in the page for crawlers, site search and visitors without
 * JavaScript; once the shadow root is attached they are no longer displayed.
 */
export function renderToolkit(block, type) {
  const props = esc(JSON.stringify({ ...block, _template: type }));
  const heading = block.title ? `<p><strong>${esc(block.title)}</strong></p>` : '';
  const body = lines(block).join('');
  // Hidden until the element upgrades (no flash of raw text); the <noscript> rule
  // reveals it for visitors without JavaScript.
  return `<div class="wiki-toolkit-block"><wiki-toolkit data-type="${esc(type)}" data-props="${props}"><div class="wiki-toolkit-fallback">${heading}${body}</div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}</style><p>此组件的交互版本需要启用 JavaScript。</p></noscript></wiki-toolkit></div>`;
}
