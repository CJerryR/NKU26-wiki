import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkWiki from '../../src/lib/remark-wiki.mjs';
import { toText } from '../../src/lib/remark-wiki.mjs';

function parse(source) {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).use(remarkWiki);
  return processor.runSync(processor.parse(source));
}

test('table captions move before adjacent Markdown tables without reordering prose or raw HTML/math', () => {
  const tree = parse([
    'Opening context.', '',
    'Table 1. Already before.', '',
    '| A | B |', '| - | - |', '| 1 | 2 |', '',
    'Between tables.', '',
    '| C | D |', '| - | - |', '| 3 | 4 |', '',
    'Table 2. Authored after.', '',
    'Following context.', '',
    'Table 3. Raw HTML stays authored.', '',
    '<table><tr><td>HTML cell</td></tr></table>', '',
    '$\\begin{array}{c}x\\end{array}$',
  ].join('\n'));

  const children = tree.children;
  const captions = children.filter(node => node.data?.hProperties?.className?.includes('table-caption'));
  assert.equal(captions.length, 2, 'the already-before caption is marked once, and only Markdown tables are handled');
  assert.equal(toText(captions[0]), 'Table 1. Already before.');
  assert.equal(toText(captions[1]), 'Table 2. Authored after.');

  const firstTable = children.findIndex(node => node.data?.hProperties?.className?.includes('table-wrap'));
  const afterCaption = children.indexOf(captions[1]);
  const secondTable = children.findIndex((node, index) => index > firstTable && node.data?.hProperties?.className?.includes('table-wrap'));
  assert.ok(children.indexOf(captions[0]) < firstTable);
  assert.ok(afterCaption < secondTable, 'caption authored after table is moved above it');
  assert.equal(toText(children[3]), 'Between tables.');
  assert.equal(toText(children[6]), 'Following context.');
  assert.equal(toText(children[7]), 'Table 3. Raw HTML stays authored.');
  assert.equal(children[8].type, 'html', 'raw HTML table is not treated as a Markdown table');
  assert.equal(children.filter(node => node.type === 'wikiElement' && node.data?.hProperties?.className?.includes('table-wrap')).length, 2);
  assert.ok(children.at(-1).children.some(node => node.type === 'html' && /<math/.test(node.value)), 'MathML remains intact');
});
