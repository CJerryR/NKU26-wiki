import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkWiki from '../../src/lib/remark-wiki.mjs';

test('outline numbering is limited to visible top-level headings and preserves body section numbers', () => {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkWiki);
  const markdown = [
    '## Protocol {#protocol toc="1 Protocol"}',
    '',
    '### 1.1 First {#first toc="1.1 First"}',
    '',
    '### 1.2 Coating {#coating toc="Coating" toc-unnumbered}',
    '',
    '### 1.3 Last {#last toc="1.3 Last"}',
    '',
    '## Hidden exception {#exception unnumbered toc="2026 field work"}',
    '',
    '### 2.1 Detail {#detail toc="2.1 Detail"}',
    '',
    '#### 24-hour response {#response toc="24-hour response"}',
    '',
    '## 3D sensing {#final toc="3D sensing"}',
  ].join('\n');
  const file = { data: { astro: { frontmatter: { preserveAuthorFormatting: true } } } };
  const tree = processor.runSync(processor.parse(markdown), file);
  assert.deepEqual(file.data.wikiToc.map(item => [item.id, item.num]), [
    ['protocol', '01'], ['first', undefined], ['coating', undefined], ['last', undefined],
    ['exception', '02'], ['detail', undefined], ['response', undefined], ['final', '03'],
  ]);
  assert.deepEqual(file.data.wikiToc.map(item => item.text), [
    'Protocol', 'First', 'Coating', 'Last', '2026 field work', 'Detail', '24-hour response', '3D sensing'
  ]);
  const rendered = JSON.stringify(tree);
  assert.match(rendered, /1\.1 First/); // Body headings retain authored text.
  assert.match(rendered, /"data-num":"01"/);
  assert.match(rendered, /"data-num":"02"/);
  assert.doesNotMatch(rendered, /"data-num":"03"/); // TOC and body counters stay independent.
  assert.match(rendered, /"data-nav-label":"2026 field work"/);
  assert.match(rendered, /24-hour/);
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
    '',
    '## After hidden section {#after}',
  ].join('\n');
  const file = { data: { astro: { frontmatter: { preserveAuthorFormatting: true } } } };
  const tree = processor.runSync(processor.parse(markdown), file);

  assert.deepEqual(file.data.wikiToc.map(({ depth, id, text, num }) => [depth, id, text, num]), [
    [2, 'main', 'Main section', '01'],
    [3, 'listed', 'Listed subsection', undefined],
    [4, 'detail', 'Listed detail', undefined],
    [5, 'subdetail', 'Listed subdetail', undefined],
    [6, 'deepest', 'Listed deepest detail', undefined],
    [2, 'after', 'After hidden section', '02'],
  ]);
  assert.deepEqual(new Set(file.data.wikiToc.map((item) => item.id)).size, file.data.wikiToc.length);
  assert.match(JSON.stringify(tree), /"depth":6/);
});
