import { toolkitNames } from './toolkit-specs.mjs';
import Papa from 'papaparse';
import katex from 'katex';

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
function sourceCellHtml(value, runs) {
  if (!Array.isArray(runs)) return esc(value);
  const original = runs.map(r => r.text || '').join('');
  if (original !== value) throw new Error('Original table cell text does not match CSV.');
  return '<span style="font-weight:400;white-space:pre-wrap">' + runs.map(run => {
    let text = esc(run.text || '');
    for (const [flag, tag] of [['superscript','sup'],['subscript','sub'],['u','u'],['i','em'],['b','strong']]) {
      if (run.format?.includes(flag)) text = `<${tag}>${text}</${tag}>`;
    }
    if (/^https?:\/\//.test(run.href || '')) text = `<a href="${esc(run.href)}">${text}</a>`;
    return text;
  }).join('') + '</span>';
}
export function renderToolkit(block, type) {
  const props = esc(JSON.stringify({ ...block, _template: type }));
  const heading = block.title ? `<p><strong>${esc(block.title)}</strong></p>` : '';
  let body = lines(block).join('');
  if (type === 'datatable' && block.csv) {
    const rows = Papa.parse(block.csv, { skipEmptyLines: true }).data;
    body = `<div class="table-wrap"><table><thead><tr>${(rows[0] || []).map((cell, k) => `<th>${sourceCellHtml(cell, block.sourceCellRuns?.[0]?.[k])}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((row, i) => `<tr>${row.map((cell, k) => `<td>${sourceCellHtml(cell, block.sourceCellRuns?.[i + 1]?.[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  } else if (type === 'equation' && block.latex) {
    body = katex.renderToString(block.latex.replace(/(?<!\\)#/g, '\\#'), { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
  }
  // Hidden until the element upgrades (no flash of raw text); the <noscript> rule
  // reveals it for visitors without JavaScript.
  return `<div class="wiki-toolkit-block"><wiki-toolkit data-type="${esc(type)}" data-props="${props}"><div class="wiki-toolkit-fallback">${heading}${body}</div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}</style><p>Enable JavaScript to use the interactive controls.</p></noscript></wiki-toolkit></div>`;
}
