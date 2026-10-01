import { toolkitTypes, renderToolkit } from './toolkit-blocks.mjs';
import { renderMediaBlock } from './media-blocks.mjs';
import { serializeMDX } from '@tinacms/mdx';

export function markdown(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const result = serializeMDX(value, { type: 'rich-text', name: 'body', parser: { type: 'markdown' } }, (url) => url);
  if (typeof result !== 'string') throw new Error('Invalid rich-text content');
  return result;
}

export function blocksToMarkdown(blocks = []) {
  return blocks.map((block) => {
    const body = markdown(block.body).trim();
    const attrs = block.attributes ? `{${block.attributes}}` : '';
    const label = block.label ? `[${block.label.replace(/[\[\]\n]/g, ' ')}]` : '';
    const img = (src, alt = '') => `![${alt.replace(/[\[\]\n]/g, ' ')}](${src})`;
    const template = block._template || block.__typename?.replace(/^WikiBlocks/, '').toLowerCase();
    if (toolkitTypes.has(template)) return renderToolkit(block, template);
    switch (template) {
      case 'protein': case 'pdf': case 'html': return renderMediaBlock(block, template);
      case 'heading': return `${'#'.repeat(Math.max(2, Math.min(4, block.level || 2)))} ${block.text}${attrs ? ` ${attrs}` : ''}`;
      case 'text': return body;
      case 'layout': return `:::${block.kind}${label}${attrs}\n\n${body}\n\n:::`;
      case 'image': return `:::figure\n\n${img(block.src, block.alt)}\n\n${body}\n\n:::`;
      case 'gallery': return `:::cols{cols=2}\n\n### ${block.leftAlt || 'A'}\n\n${img(block.left, block.leftAlt)}\n\n### ${block.rightAlt || 'B'}\n\n${img(block.right, block.rightAlt)}\n\n:::\n\n${body}`;
      default: throw new Error(`Unknown content block: ${block._template}`);
    }
  }).join('\n\n') + '\n';
}

export function toEntry(id, document) {
  const { blocks, meta, _sys, _values, __typename, ...data } = document;
  if (data.route && !/^[a-z0-9][a-z0-9-]*$/.test(data.route)) throw new Error(`Invalid route: ${data.route}`);
  return {
    id, collection: 'pages', body: blocksToMarkdown(blocks),
    data: { ...data, crumbs: data.crumbs || [], meta: Object.fromEntries((meta || []).map(({ key, value }) => [key, value])), draft: !!data.draft, hidden: !!data.hidden, search: data.search !== false },
  };
}
