import { toolkitNames } from './toolkit-specs.mjs';
import Papa from 'papaparse';
import katex from 'katex';

export const toolkitTypes = new Set(toolkitNames);

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Strip the small inline syntax used in text fields so the fallback reads as prose.
const plain = (value) => String(value ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1');
const SKIP = new Set(['_template', '__typename', 'file', 'image', 'poster', 'subtitles', 'before', 'after', 'href', 'csv', 'code', 'sequence', 'latex',
  'chartType', 'sequenceType', 'palette', 'showValues', 'x', 'y', 'influence', 'interest', 'likelihood', 'severity', 'count', 'language', 'presentation', 'type']);
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

function cycleInline(value) {
  const source = String(value ?? '');
  const token = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_/g;
  let html = ''; let cursor = 0; let match;
  while ((match = token.exec(source))) {
    html += esc(source.slice(cursor, match.index));
    if (match[1] != null) {
      const label = esc(match[1]); const href = match[2].trim();
      const allowed = /^https?:\/\//i.test(href) || (href.startsWith('/') && !href.startsWith('//')) || href.startsWith('#');
      if (allowed) {
        const external = /^https?:\/\//i.test(href);
        html += `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
      } else html += `${label} (${esc(href)})`;
    } else if (match[3] != null || match[4] != null) html += `<strong>${esc(match[3] ?? match[4])}</strong>`;
    else if (match[5] != null) html += `<code>${esc(match[5])}</code>`;
    else html += `<em>${esc(match[6] ?? match[7])}</em>`;
    cursor = token.lastIndex;
  }
  return html + esc(source.slice(cursor));
}

/**
 * The interactive version renders inside <wiki-toolkit>'s shadow root. The light-DOM
 * children below stay in the page for crawlers, site search and visitors without
 * JavaScript; once the shadow root is attached they are no longer displayed.
 */
function sourceCellHtml(value, runs, inlineFormatting = false) {
  if (!Array.isArray(runs)) return inlineFormatting ? esc(value).replace(/&lt;(\/?(?:strong|b|em|i|sub|sup|code))&gt;/g, '<$1>') : esc(value);
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
function cycleFallback(block) {
  const inline = cycleInline;
  if (block.presentation === 'overview') {
    return (block.items || []).map(round => {
      const stages = ['design', 'build', 'test'].map(phase => {
        const title = phase[0].toUpperCase() + phase.slice(1);
        const paragraphs = String(round[phase] || '').split(/\n{2,}/).filter(Boolean).map(p => `<p>${inline(p)}</p>`);
        if (paragraphs.length) paragraphs[0] = paragraphs[0].replace('<p>', `<p><strong>${title} - </strong>`);
        else paragraphs.push(`<p><strong>${title} - </strong></p>`);
        return `<section data-dbtl-stage="${phase}" role="group" aria-label="${title}">${paragraphs.join('')}</section>`;
      }).join('');
      const media = ['design', 'build', 'test'].map(phase => {
        const src = round[`${phase}Image`]; const caption = round[`${phase}Caption`];
        if (!src && !caption) return '';
        const image = src ? `<a href="${esc(src)}"><img src="${esc(src)}" alt="${esc(round[`${phase}Alt`] || '')}" loading="lazy"></a>` : '';
        return `<figure data-dbtl-figure="${phase}">${image}${caption ? `<figcaption>${inline(caption)}</figcaption>` : ''}</figure>`;
      }).join('');
      const learn = String(round.learn || '').split(/\n{2,}/).map(p => `<p>${inline(p)}</p>`).join('');
      const learnSrc = round.learnImage; const learnCaption = round.learnCaption;
      const learnMedia = learnSrc || learnCaption ? `<figure>${learnSrc ? `<a href="${esc(learnSrc)}"><img src="${esc(learnSrc)}" alt="${esc(round.learnAlt || '')}" loading="lazy"></a>` : ''}${learnCaption ? `<figcaption>${inline(learnCaption)}</figcaption>` : ''}</figure>` : '';
      return `<article class="cyc__overview-fallback"><div class="cyc__overview-fallback-main">${stages}</div><aside class="cyc__overview-fallback-media">${media}</aside><section data-dbtl-stage="learn"><p><strong>Learn</strong></p>${learn}${learnMedia}</section></article>`;
    }).join('');
  }
  return (block.items || []).map(round => ['design', 'build', 'test', 'learn'].map(phase => {
    const title = phase[0].toUpperCase() + phase.slice(1);
    const body = String(round[phase] || '').split(/\n{2,}/).map(p => `<p>${inline(p)}</p>`).join('');
    const src = round[`${phase}Image`]; const caption = round[`${phase}Caption`];
    const media = src || caption ? `<figure>${src ? `<img src="${esc(src)}" alt="${esc(round[`${phase}Alt`] || '')}" loading="lazy">` : ''}${caption ? `<figcaption>${inline(caption)}</figcaption>` : ''}</figure>` : '';
    return `<div data-dbtl-stage="${phase}"><p><strong>${title}</strong></p>${body}${media}</div>`;
  }).join('')).join('');
}
export function renderToolkit(block, type) {
  const props = esc(JSON.stringify({ ...block, _template: type }));
  const heading = block.title ? `<p><strong>${esc(block.title)}</strong></p>` : '';
  let body = lines(block).join('');
  if (type === 'cycle') {
    body = cycleFallback(block);
  } else if (type === 'datatable' && block.csv) {
    const rows = Papa.parse(block.csv, { skipEmptyLines: true }).data;
    body = `<div class="table-wrap"><table><thead><tr>${(rows[0] || []).map((cell, k) => `<th>${sourceCellHtml(cell, block.sourceCellRuns?.[0]?.[k], block.inlineFormatting)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((row, i) => `<tr>${row.map((cell, k) => `<td>${sourceCellHtml(cell, block.sourceCellRuns?.[i + 1]?.[k], block.inlineFormatting)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  } else if (type === 'equation' && block.latex) {
    body = katex.renderToString(block.latex.replace(/(?<!\\)#/g, '\\#'), { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
  }
  // Hidden until the element upgrades (no flash of raw text); the <noscript> rule
  // reveals it for visitors without JavaScript.
  const overviewFallbackStyles = type === 'cycle' && block.presentation === 'overview'
    ? '.cyc__overview-fallback{display:grid;gap:16px}.cyc__overview-fallback-main,.cyc__overview-fallback-media{display:grid;align-content:start;gap:12px;min-width:0}.cyc__overview-fallback [data-dbtl-stage]{min-width:0}.cyc__overview-fallback figure{margin:0}.cyc__overview-fallback img{display:block;width:100%;height:auto;object-fit:contain}@media(min-width:700px){.cyc__overview-fallback{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.cyc__overview-fallback>[data-dbtl-stage=learn]{grid-column:1/-1}}'
    : '';
  return `<div class="wiki-toolkit-block"><wiki-toolkit data-type="${esc(type)}" data-props="${props}"><div class="wiki-toolkit-fallback">${heading}${body}</div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}${overviewFallbackStyles}</style><p>Enable JavaScript to use the interactive controls.</p></noscript></wiki-toolkit></div>`;
}
