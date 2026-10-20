import { toolkitTypes, renderToolkit } from './toolkit-blocks.mjs';
import { renderMemberGrid, renderCreditGrid } from './person-cards.mjs';
import { renderMediaBlock } from './media-blocks.mjs';
import { serializeMDX } from '@tinacms/mdx';
import katex from 'katex';

export function markdown(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const result = serializeMDX(value, { type: 'rich-text', name: 'body', parser: { type: 'markdown' } }, (url) => url);
  if (typeof result !== 'string') throw new Error('Invalid rich-text content');
  return result;
}

export function blocksToMarkdown(blocks = [], { plainEquations = false } = {}) {
  return blocks.map((block) => {
    const body = markdown(block.body).trim();
    const attrs = block.attributes ? `{${block.attributes}}` : '';
    const label = block.label ? `[${block.label.replace(/[\[\]\n]/g, ' ')}]` : '';
    const img = (src, alt = '') => `![${alt.replace(/[\[\]\n]/g, ' ')}](${src})`;
    const template = block._template || block.__typename?.replace(/^WikiBlocks/, '').toLowerCase();
    if (plainEquations && template === 'equation' && block.latex) {
      const formula = katex.renderToString(block.latex, { displayMode: true, throwOnError: true, output: 'htmlAndMathml' })
        .replace(/(<annotation[^>]*>)([\s\S]*?)(<\/annotation>)/g, (_, open, tex, close) => open + tex.replaceAll('\\', '&#92;').replaceAll('_', '&#95;').replaceAll('*', '&#42;').replaceAll('\n', '&#10;') + close);
      return `<div class="model-equation">${formula}</div>`;
    }
    if (toolkitTypes.has(template)) return renderToolkit(block, template);
    switch (template) {
      case 'membergrid': return renderMemberGrid(block);
      case 'creditgrid': return renderCreditGrid(block);
      case 'protein': case 'pdf': case 'html': return renderMediaBlock(block, template);
      case 'heading': return `${'#'.repeat(Math.max(2, Math.min(4, block.level || 2)))} ${block.text}${attrs ? ` ${attrs}` : ''}`;
      case 'manuscriptTitle': case 'manuscripttitle': return `:::manuscriptTitle\n\n${markdown(block.manuscript).trim()}\n\n:::`;
      case 'text': return body;
      case 'layout': return `:::${block.kind}${label}${attrs}\n\n${body}\n\n:::`;
      case 'image': {
        const scale = ['85', '70', '55'].includes(String(block.scale || '')) ? `{scale=${block.scale}}` : '';
        const originalSrc = block.originalSrc || block.src;
        const media = block.openOriginal ? `[${img(block.src, block.alt)}](${originalSrc} "Open full-resolution image")` : img(block.src, block.alt);
        const figure = `:::figure${scale}\n\n${media}\n\n${body}\n\n:::`;
        const accompanying = markdown(block.accompanyingBody).trim();
        if (!accompanying) return figure;
        if (block.layout === 'stack') return `${accompanying}\n\n${figure}`;   // R1-I03: text above, figure below
        const wrap = ['wrap-left', 'wrap-right'].includes(block.layout);
        if (!wrap && !['left', 'right'].includes(block.layout)) return `${figure}\n\n${accompanying}`;
        const width = ['narrow', 'medium', 'wide'].includes(block.imageWidth) ? block.imageWidth : 'medium';
        const side = wrap ? block.layout.replace('wrap-', '') : block.layout;
        return `::::figuretext{side=${side} width=${width}${wrap ? ' flow=wrap' : ''}}\n\n${figure}\n\n${accompanying}\n\n::::`;
      }
      // R1-I04: two framed figures side by side, each with its own caption (stacked on phones)
      case 'gallery': {
        const one = (src, alt, cap) => `:::figure\n\n${img(src, alt)}\n\n${markdown(cap).trim() || alt || ''}\n\n:::`;
        const pair = `::::figures\n\n${one(block.left, block.leftAlt, block.leftCaption)}\n\n${one(block.right, block.rightAlt, block.rightCaption)}\n\n::::`;
        const after = markdown(block.afterBody).trim();
        return [body.trim(), pair, after].filter(Boolean).join('\n\n');
      }
      // C01: DBTL stage marker; the authored stage paragraph is kept as written (not made a heading)
      case 'phase': {
        const kind = ['design', 'build', 'test', 'build-test', 'learn'].includes(block.kind) ? block.kind : 'other';
        return `:::phase{kind=${kind}}\n\n${body}\n\n:::`;
      }
      // C01: one figure with the paragraphs that lead to it and read it; source order is preserved
      case 'evidence': {
        const place = ['right', 'left', 'below'].includes(block.place) ? block.place : 'right';
        const size = ['compact', 'standard', 'wide'].includes(block.size) ? block.size : 'standard';
        const media = block.openOriginal ? `[${img(block.src, block.figureAlt || '')}](${block.src} "Open full-resolution image")` : img(block.src, block.figureAlt || '');
        const caption = markdown(block.figureCaption).trim();
        const after = markdown(block.afterBody).trim();
        return [`::::evidence{place=${place} size=${size}}`, body, media, caption && `:::caption\n\n${caption}\n\n:::`, after, '::::'].filter(Boolean).join('\n\n');
      }
      default: throw new Error(`Unknown content block: ${block._template}`);
    }
  }).join('\n\n') + '\n';
}

export function toEntry(id, document) {
  if (!document || typeof document !== 'object') throw new Error(`页面 ${id} 的 Tina 数据未能加载。请检查是否存在未填写必填字段的模块，或重新打开编辑器。`);
  const { blocks, meta, _sys, _values, __typename, ...data } = document;
  if (data.route && !/^[a-z0-9][a-z0-9-]*$/.test(data.route)) throw new Error(`Invalid route: ${data.route}`);
  return {
    id, collection: 'pages', body: blocksToMarkdown(blocks, { plainEquations: /^model(?:-|$)/.test(id) }),
    data: { ...data, crumbs: data.crumbs || [], meta: Object.fromEntries((meta || []).map(({ key, value }) => [key, value])), draft: !!data.draft, hidden: !!data.hidden, search: data.search !== false },
  };
}
