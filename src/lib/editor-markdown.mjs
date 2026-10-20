import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkWiki from './remark-wiki.mjs';

// Reuse the processor and unchanged article output during Tina island refreshes.
// Cache by full source so unsaved body changes are never served stale HTML.
const processor = createMarkdownProcessor({
  remarkPlugins: [remarkDirective, remarkWiki], syntaxHighlight: false, smartypants: false,
});
const cache = new Map();
let characters = 0;
const MAX_CHARACTERS = 1_000_000;

export function renderEditorMarkdown(source, preserveAuthorFormatting = false) {
  const key = `${preserveAuthorFormatting ? 'author:' : 'default:'}${source}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const pending = processor.then((renderer) => renderer.render(source, { frontmatter: { preserveAuthorFormatting } }));
  if (source.length > MAX_CHARACTERS) return pending;
  cache.set(key, pending);
  characters += key.length;
  while (cache.size > 24 || characters > MAX_CHARACTERS) {
    const oldest = cache.keys().next().value;
    characters -= oldest.length;
    cache.delete(oldest);
  }
  pending.catch(() => {
    if (cache.get(key) === pending) {
      cache.delete(key);
      characters -= key.length;
    }
  });
  return pending;
}
