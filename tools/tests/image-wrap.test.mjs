import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkWiki from '../../src/lib/remark-wiki.mjs';
import { blocksToMarkdown } from '../../src/lib/editor-content.mjs';

const sample = {
  _template: 'image', src: 'https://static.igem.wiki/preview.webp',
  originalSrc: 'https://static.igem.wiki/original.webp', alt: 'Source photo',
  openOriginal: true, body: 'Figure 1. Source caption.',
  accompanyingBody: 'First **authored** paragraph.\n\nSecond paragraph with [a link](/background/).',
  layout: 'wrap-right', imageWidth: 'medium',
};
function compile(block) {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkWiki);
  const source = blocksToMarkdown([block]);
  const tree = processor.runSync(processor.parse(source));
  const found = [];
  const walk = node => { found.push(node); (node.children || []).forEach(walk); };
  walk(tree);
  return found;
}
test('embedded layouts keep photo and caption together before the complete wrapping prose', () => {
  for (const layout of ['wrap-right', 'wrap-left']) {
    const nodes = compile({ ...sample, layout });
    const wrap = nodes.find(n => n.data?.hProperties?.className?.includes('figure-text--wrap'));
    assert.ok(wrap);
    assert.equal(wrap.children[0].data.hName, 'figure');
    assert.equal(wrap.children[0].children.at(-1).data.hName, 'figcaption');
    assert.equal(wrap.children[1].children.length, 2);
    assert.equal(nodes.filter(n => n.type === 'strong').length, 1);
    assert.ok(nodes.some(n => n.url === sample.originalSrc));
    assert.ok(nodes.some(n => n.url === '/background/'));
  }
});
test('existing column layouts keep their established order and empty prose remains a full figure', () => {
  const regular = compile({ ...sample, layout: 'right' });
  const pair = regular.find(n => n.data?.hProperties?.className?.includes('figure-text'));
  assert.equal(pair.children[0].data.hName, 'div');
  assert.equal(pair.children[1].data.hName, 'figure');
  const empty = compile({ ...sample, accompanyingBody: '' });
  assert.equal(empty.filter(n => n.data?.hName === 'figure').length, 1);
  assert.equal(empty.some(n => n.data?.hProperties?.className?.includes('figure-text')), false);
});

test('a floating image group keeps both figures, captions and original links in one wrapping unit', () => {
  const nodes = compile({
    _template: 'imagegroup', layout: 'wrap-right', imageWidth: 'wide', continueWrap: true,
    items: [sample, { ...sample, src: 'https://static.igem.wiki/second.webp', originalSrc: 'https://static.igem.wiki/second-original.webp', body: 'Figure 2. Second caption.' }],
    accompanyingBody: sample.accompanyingBody,
  });
  const wrap = nodes.find(n => n.data?.hProperties?.className?.includes('figure-text--continue'));
  assert.ok(wrap);
  assert.ok(wrap.data.hProperties.className.includes('figure-text--right'));
  const group = wrap.children[0];
  assert.ok(group.data.hProperties.className.includes('figure-pair'));
  assert.equal(group.children.filter(n => n.data?.hName === 'figure').length, 2);
  assert.equal(nodes.filter(n => n.data?.hName === 'figcaption').length, 2);
  assert.equal(wrap.children[1].children.length, 2);
  assert.ok(nodes.some(n => n.url === sample.originalSrc));
  assert.ok(nodes.some(n => n.url === 'https://static.igem.wiki/second-original.webp'));
});
