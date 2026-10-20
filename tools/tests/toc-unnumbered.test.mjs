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

test('explicit TOC attributes include heading levels 3 through 6 and preserve exclusions', () => {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkWiki);
  const markdown = [
    '## Main section {#main}',
    '',
    '### Listed subsection {#listed toc="Listed subsection"}',
    '',
    '#### Listed detail {#detail toc="Listed detail"}',
    '',
    '##### Listed subdetail {#subdetail toc="Listed subdetail"}',
    '',
    '###### Listed deepest detail {#deepest toc="Listed deepest detail"}',
    '',
    '### Unlisted subsection {#unlisted}',
    '',
    '#### Unlisted detail {#unlisted-detail}',
    '',
    '##### Unlisted subdetail {#unlisted-subdetail}',
    '',
    '###### Unlisted deepest detail {#unlisted-deepest}',
    '',
    '## Hidden section {#hidden notoc}',
  ].join('\n');
  const file = { data: { astro: { frontmatter: { preserveAuthorFormatting: true } } } };
  const tree = processor.runSync(processor.parse(markdown), file);

  assert.deepEqual(file.data.wikiToc.map(({ depth, id, text, num }) => [depth, id, text, num]), [
    [2, 'main', 'Main section', '01'],
    [3, 'listed', 'Listed subsection', '1.1'],
    [4, 'detail', 'Listed detail', undefined],
    [5, 'subdetail', 'Listed subdetail', undefined],
    [6, 'deepest', 'Listed deepest detail', undefined],
  ]);
  assert.deepEqual(new Set(file.data.wikiToc.map((item) => item.id)).size, file.data.wikiToc.length);
  assert.match(JSON.stringify(tree), /"depth":6/);
});
