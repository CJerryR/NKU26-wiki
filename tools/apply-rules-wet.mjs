/** Read-only content rendering regression: no Markdown export or site build. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkWiki from '../src/lib/remark-wiki.mjs';
import { toEntry } from '../src/lib/editor-content.mjs';
import { parseFragment } from 'parse5';

const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkDirective, remarkWiki], syntaxHighlight: false, smartypants: false,
});
const current = JSON.parse(fs.readFileSync('content/wiki/results.json', 'utf8'));
const opener = current.blocks.findIndex(b => b.body === '<section class="author-manuscript" lang="en">');
assert.equal(current.blocks[opener - 1].level, 2, 'author wrapper starts after the chapter heading');
const originalOrder = structuredClone(current);
[originalOrder.blocks[opener - 1], originalOrder.blocks[opener]] = [originalOrder.blocks[opener], originalOrder.blocks[opener - 1]];
const attr = (n, name) => n.attrs?.find(a => a.name === name)?.value;
const isChapter = n => attr(n, 'class')?.split(' ').includes('doc-section');
async function inspect(document) {
  const entry = toEntry('results', document);
  const rendered = await processor.render(entry.body, { frontmatter: entry.data });
  const tree = parseFragment(rendered.code);
  const chapters = [], scientificElements = [], text = [];
  function walk(node) {
    if (node.nodeName === '#text') text.push(node.value);
    if (isChapter(node)) {
      const ancestors = [];
      for (let p = node.parentNode; p; p = p.parentNode) if (isChapter(p)) ancestors.push(attr(p, 'data-num'));
      chapters.push({ node, number: attr(node, 'data-num'), id: attr(node, 'aria-labelledby'), parentTag: node.parentNode?.tagName, parentClass: attr(node.parentNode, 'class'), chapterAncestors: ancestors });
    }
    if (['img', 'video', 'source', 'a', 'h2', 'h3', 'h4'].includes(node.tagName)) scientificElements.push({ tag: node.tagName, attrs: node.attrs });
    for (const child of node.childNodes || []) walk(child);
  }
  walk(tree);
  return { chapters, scientificElements, text: text.join(' ').replace(/\s+/g, ' ').trim() };
}
const before = await inspect(originalOrder), after = await inspect(current);
assert.equal(before.chapters.length, 3);
assert.equal(after.chapters.length, 3);
assert.deepEqual(before.chapters[2].chapterAncestors, ['02'], 'reproduces the malformed nesting');
assert.ok(after.chapters.every(c => c.chapterAncestors.length === 0), 'chapters are not nested');
assert.ok(after.chapters.every(c => c.node.parentNode === after.chapters[0].node.parentNode), 'all chapters share one parent');
assert.deepEqual(after.chapters.map(c => c.number), ['01', '02', '03']);
assert.equal(after.text, before.text, 'visible text remains identical');
assert.deepEqual(after.scientificElements, before.scientificElements, 'figures, video, links and heading identities remain identical');
const serializable = ({ node, ...rest }) => rest;
const report = {
  status: 'pass',
  method: 'In-memory production Markdown processor plus parse5 DOM parsing; no export or site build',
  before: before.chapters.map(serializable), after: after.chapters.map(serializable),
  unchanged: ['all visible text', 'image/video/source/link attributes', 'h2/h3/h4 identities and order'],
};
fs.writeFileSync('docs/术语表-wet-structure-validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
