import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkWiki from '../../src/lib/remark-wiki.mjs';
import { renderToolkit } from '../../src/lib/toolkit-blocks.mjs';
import { renderEditorMarkdown } from '../../src/lib/editor-markdown.mjs';
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

test('datatable renders only explicit source LaTeX runs as KaTeX while preserving CSV cell text', () => {
  const block={_template:'datatable',csv:'Symbol,Value\nG_{18},2\n',sourceCellRuns:[
    [[{text:'Symbol',format:['b']}],[{text:'Value',format:['b']}]],
    [[{text:'G_{18}',format:[],latex:'G_{18}'}],[{text:'2',format:[]}]],
  ]};
  const html=renderToolkit(block,'datatable');
  assert.match(html,/<span class="katex">/);
  assert.match(html,/<annotation encoding="application\/x-tex">G_\{18\}<\/annotation>/);
  assert.doesNotMatch(html,/<code>G_\{18\}<\/code>/);
  assert.throws(()=>renderToolkit({...block,csv:'Symbol,Value\nG_{3},2\n'},'datatable'),/does not match CSV/);

  const ordinary=renderToolkit({_template:'datatable',csv:'Material,ID\nGPR2_1,GPR2_1\n',sourceCellRuns:[
    [[{text:'Material',format:[]}],[{text:'ID',format:[]}]],
    [[{text:'GPR2_1',format:[]}],[{text:'GPR2_1',format:[]}]],
  ]},'datatable');
  assert.doesNotMatch(ordinary,/<span class="katex">/);
});

test('datatable display-only header casing leaves source runs and CSV untouched', () => {
  const block={_template:'datatable',csv:'Part Number,Value\nBBa_K123,1\n',sourceCellRuns:[
    [[{text:'Part Number',format:[]}],[{text:'Value',format:[]}]],
    [[{text:'BBa_K123',format:[]}],[{text:'1',format:[]}]],
  ]};
  const html=renderToolkit(block,'datatable');
  assert.match(html,/<th>Part number<\/th>/);
  assert.match(html,/Part Number,Value\\nBBa_K123,1\\n/);
  assert.match(html,/BBa_K123/);
});

test('legacy datatable headings receive only the approved display labels without source runs', () => {
  const html=renderToolkit({_template:'datatable',csv:'Early-Warning Capacity,Professional Dependence\nHigh,Low\n'},'datatable');
  assert.match(html,/<th>Early-warning capacity<\/th>/);
  assert.match(html,/<th>Professional dependence<\/th>/);
  assert.match(html,/Early-Warning Capacity,Professional Dependence\\n/);
});

test('Tina preview uses the author-format flag and keeps differently formatted caches separate', async () => {
  const source='Saccharomyces cerevisiae [1]. **Author emphasis**.';
  const authored=await renderEditorMarkdown(source,true);
  const conventional=await renderEditorMarkdown(source,false);
  assert.doesNotMatch(authored.code,/<sup/);
  assert.match(conventional.code,/<sup/);
  assert.match(authored.code,/<strong>Author emphasis<\/strong>/);
  assert.equal((await renderEditorMarkdown(source,true)).code,authored.code);
});
