// C01 component tests:  node --test tools/c01/evidence.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { blocksToMarkdown } from '../../src/lib/editor-content.mjs';
import { renderPage } from './verify-render.mjs';

const page = (blocks) => renderPage({ preserveAuthorFormatting: true, blocks: [{ _template: 'heading', level: 2, text: 'S', attributes: '#s' }, ...blocks] });
const order = (html, ...needles) => needles.map((n) => html.indexOf(n));
const IMG = 'https://static.igem.wiki/x/fig.json';

test('evidence keeps text-before → figure → caption → text-after in the DOM', async () => {
  const { html, warnings } = await page([{ _template: 'evidence', body: '<p>Lead (Figure 1).</p>', src: IMG, figureAlt: '', openOriginal: true,
    figureCaption: '<p class="figure-caption">Figure 1. Caption.</p>', afterBody: '<p>Reading.</p>', place: 'left', size: 'compact' }]);
  assert.deepEqual(warnings, []);
  const at = order(html, 'Lead (Figure 1).', `<img src="${IMG}"`, 'Figure 1. Caption.', 'Reading.');
  assert.ok(at.every((v, i) => v > 0 && (i === 0 || v > at[i - 1])), at.join());
  assert.match(html, /class="evidence evidence--left evidence--compact"/);
  assert.match(html, /<figure class="figure evidence__figure"><div class="figure__media"><a href="https:\/\/static\.igem\.wiki\/x\/fig\.json"/);
  assert.match(html, /<figcaption><p class="figure-caption">Figure 1\. Caption\.<\/p><\/figcaption><\/figure>/);
});

test('evidence falls back to right / standard and marks missing text slots', async () => {
  const { html } = await page([{ _template: 'evidence', src: IMG, place: 'diagonal', size: 'huge' }]);
  assert.match(html, /class="evidence evidence--right evidence--standard evidence--no-before evidence--no-after"/);
  assert.doesNotMatch(html, /<figcaption/);
});

test('an evidence block without an image keeps its text and warns', async () => {
  const md = '## S\n\n::::evidence\n\nOnly text.\n\n::::\n';
  const r = await renderPage({ blocks: [{ _template: 'text', body: md }] });
  assert.match(r.html, /<p>Only text\.<\/p>/);
  assert.doesNotMatch(r.html, /class="evidence/);
  assert.equal(r.warnings.length, 1);
});

test('a :::caption outside an evidence block stays as plain text', async () => {
  const r = await renderPage({ blocks: [{ _template: 'text', body: '## S\n\n:::caption\n\nStray caption.\n\n:::' }] });
  assert.match(r.html, /<p>Stray caption\.<\/p>/);
  assert.doesNotMatch(r.html, /figcaption/);
});

test('stage markers group following blocks up to the next marker, heading or bare tag', async () => {
  const { html, toc } = await page([
    { _template: 'text', body: '<section class="m">' },
    { _template: 'phase', kind: 'design', body: '<p style="text-align:left;">Design</p>' },
    { _template: 'text', body: '<p>d1</p>' },
    { _template: 'phase', kind: 'build-test', body: '<p>Build &amp; Test</p>' },
    { _template: 'text', body: '<p>b1</p>' },
    { _template: 'heading', level: 3, text: 'Next', attributes: '#next' },
    { _template: 'text', body: '<p>after heading</p>' },
    { _template: 'phase', kind: 'learn', body: 'Learn' },
    { _template: 'text', body: '<p>l1</p>' },
    { _template: 'text', body: '</section>' },
  ]);
  assert.match(html, /<section class="m"><div class="dbtl-stage dbtl-stage--design"><div class="dbtl-phase dbtl-phase--design" data-phase="design"><p style="text-align:left;">Design<\/p><\/div><p>d1<\/p><\/div><div class="dbtl-stage dbtl-stage--build-test">/);
  assert.match(html, /<p>b1<\/p><\/div><h3 id="next">Next<\/h3><p>after heading<\/p><div class="dbtl-stage dbtl-stage--learn">/);
  assert.match(html, /<p>l1<\/p><\/div><\/section>/);        // the closing tag is never pulled into a stage
  assert.deepEqual(toc.map((t) => t.id), ['s']);             // stage paragraphs never enter the outline
});

test('phase kind falls back to other; Markdown stage text works too', async () => {
  const md = blocksToMarkdown([{ _template: 'phase', kind: 'nope', body: 'Design and build' }]);
  assert.equal(md, ':::phase{kind=other}\n\nDesign and build\n\n:::\n');
});

test('evidence Markdown matches the documented directive', () => {
  const md = blocksToMarkdown([{ _template: 'evidence', body: 'A', src: '/img/a.png', figureAlt: 'gel', openOriginal: false, figureCaption: 'Figure 1. C.', afterBody: 'B', place: 'below', size: 'wide' }]);
  assert.equal(md, '::::evidence{place=below size=wide}\n\nA\n\n![gel](/img/a.png)\n\n:::caption\n\nFigure 1. C.\n\n:::\n\nB\n\n::::\n');
});
