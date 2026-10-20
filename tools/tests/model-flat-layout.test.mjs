import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { toEntry, blocksToMarkdown } from '../../src/lib/editor-content.mjs';
const load = name => JSON.parse(fs.readFileSync(`content/wiki/${name}.json`, 'utf8'));
test('Model math keeps original editable LaTeX and exports as static centered math', () => {
 for (const name of ['model-docking','model-ode']) {
  const doc=load(name),before=JSON.stringify(doc),equations=doc.blocks.filter(b=>b._template==='equation');
  const output=toEntry(name,doc).body;
  assert.equal((output.match(/class="model-equation"/g)||[]).length,equations.length);
  assert.ok(!output.includes('data-type="equation"'));
  assert.ok(!output.includes('katex-error'));
  assert.equal(JSON.stringify(doc),before);
 }
});
test('Other pages retain their existing equation controls', () => {
 assert.match(blocksToMarkdown([{_template:'equation',latex:'x=1'}]),/data-type="equation"/);
});
test('Model manuscript titles remain outside numbered section headings', () => {
 for(const name of ['model','model-docking','model-md','model-ode','model-eco']) {
  const doc=load(name);assert.equal(doc.blocks.filter(b=>b._template==='manuscriptTitle').length,1,name);
  assert.match(toEntry(name,doc).body,/:::manuscriptTitle/);
 }
});
test('Eco app follows the source introduction and precedes the first section', () => {
 const blocks=load('model-eco').blocks,app=blocks.findIndex(b=>b._template==='html'&&b.file==='/widgets/nemaklear/index.html');
 assert.ok(app>0);assert.match(blocks[app-1].body,/We developed the NemaKlear/);
 assert.ok(app<blocks.findIndex(b=>b._template==='heading'));
 const apps=blocks.filter(b=>b._template==='html'&&b.file==='/widgets/nemaklear/index.html');
 assert.equal(apps.length,1);
 assert.equal(apps[0].title,'NemaKlear: ODE, Dual-channel modeling and economic analysis');
 assert.equal(apps[0].scripts,true);
 assert.equal(apps[0].height,900);
 assert.ok(!blocks.some(b=>b.body?.includes('data-nemaklear-original')));
});
