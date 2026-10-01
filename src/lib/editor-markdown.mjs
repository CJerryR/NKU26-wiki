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

export function renderEditorMarkdown(source) {
  const hit = cache.get(source);
  if (hit) {
    cache.delete(source);
    cache.set(source, hit);
    return hit;
  }
  const pending = processor.then((renderer) => renderer.render(source));
  if (source.length > MAX_CHARACTERS) return pending;
  cache.set(source, pending);
  characters += source.length;
  while (cache.size > 24 || characters > MAX_CHARACTERS) {
    const oldest = cache.keys().next().value;
    characters -= oldest.length;
    cache.delete(oldest);
  }
  pending.catch(() => {
    if (cache.get(source) === pending) {
      cache.delete(source);
      characters -= source.length;
    }
  });
  return pending;
}
