import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkWiki from '../../src/lib/remark-wiki.mjs';
import { renderToolkit } from '../../src/lib/toolkit-blocks.mjs';
function compile(value, preserveAuthorFormatting = true) {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkWiki);
  return processor.runSync(processor.parse(value), { data: { astro: { frontmatter: { preserveAuthorFormatting } } } });
}
function nodes(tree, predicate) {
  const found=[];
  function visit(node){if(predicate(node))found.push(node);for(const child of node.children||[])visit(child);}
  visit(tree);return found;
}
test('author pages retain the supplied emphasis and citation placement', () => {
  const source='Saccharomyces cerevisiae [1]. **Author emphasis** and *author italics*.';
  const authored=compile(source);
  assert.equal(nodes(authored,n=>n.type==='emphasis').length,1);
  assert.equal(nodes(authored,n=>n.type==='strong').length,1);
  assert.equal(nodes(authored,n=>n.data?.hName==='sup').length,0);
  const conventional=compile(source,false);
  assert.ok(nodes(conventional,n=>n.type==='emphasis').length>1);
  assert.equal(nodes(conventional,n=>n.data?.hName==='sup').length,1);
});
test('raw author caption formatting stays inside the figure caption container', () => {
  const source=':::figure\n\n![Original image](https://static.igem.wiki/example.png)\n\n<p>Figure 1. <em>Author italics</em>, (a) unchanged.</p>\n\n:::';
  const tree=compile(source);
  const captions=nodes(tree,n=>n.data?.hName==='figcaption');
  assert.equal(captions.length,1);
  assert.equal(captions[0].children[0].type,'html');
  assert.equal(captions[0].children[0].value,'Figure 1. <em>Author italics</em>, (a) unchanged.');
  assert.equal(nodes(captions[0],n=>n.type==='strong').length,0);
});
test('table fallback retains original per-character styles and exact cell text', () => {
  const block={_template:'datatable',csv:'Part,Description\npRS315,GPR2\n',sourceCellRuns:[[[{text:'Part',format:['b']}],[{text:'Description',format:[]}]],[[{text:'pRS315',format:[]}],[{text:'GPR2',format:['i']}]]]};
  const out=renderToolkit(block,'datatable');
  assert.match(out,/<strong>Part<\/strong>/);
  assert.match(out,/<em>GPR2<\/em>/);
  assert.doesNotMatch(out,/<code>/);
  assert.throws(()=>renderToolkit({...block,csv:'Part,Description\npRS315,CHANGED\n'},'datatable'),/does not match CSV/);
});
