import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkWiki from '../../src/lib/remark-wiki.mjs';

test('a TOC numbering exception preserves its body number and following sequence', () => {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkWiki);
  const markdown = '## Protocol {#protocol}\n\n### 1.1 First {#first toc="First"}\n\n### 1.2 Coating {#coating toc="Coating" toc-unnumbered}\n\n### 1.3 Last {#last toc="Last"}\n';
  const file = { data: { astro: { frontmatter: { preserveAuthorFormatting: true } } } };
  const tree = processor.runSync(processor.parse(markdown), file);
  assert.deepEqual(file.data.wikiToc.map(item => [item.id, item.num]), [
    ['protocol', '01'], ['first', '1.1'], ['coating', undefined], ['last', '1.3']
  ]);
  assert.match(JSON.stringify(tree), /1\.2 Coating/);
});
