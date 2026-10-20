import test from 'node:test';
import assert from 'node:assert/strict';
import {captionLead,toText} from '../../src/lib/remark-wiki.mjs';
const t=value=>({type:'text',value});
const s=(...children)=>({type:'strong',children});
const e=value=>({type:'emphasis',children:[t(value)]});
const hasStrong=nodes=>nodes.some(n=>n.type==='strong'||n.children&&hasStrong(n.children));
function run(nodes){const before=nodes.map(toText).join('');const result=captionLead(structuredClone(nodes));assert.equal(result.map(toText).join(''),before);assert.equal(hasStrong(result),false);return result;}
test('figure lead and panel markers stay plain',()=>run([t('Figure 1. Plasmid construction. (a) Map. b, PCR. Panels c and d show repeats.')]));
test('authored and nested strong markup is removed',()=>run([s(t('Figure 2. Title. '),s(t('(a)'))),t(' Detail.')]));
test('scientific italics remain intact',()=>{const out=run([t('Figure 3. '),e('Saccharomyces cerevisiae'),t(' and '),e('Gal80')]);assert.equal(out.filter(n=>n.type==='emphasis').length,2);});
test('links and exact identifiers remain intact',()=>{const node={type:'link',url:'https://example.org/Data.csv',children:[s(t('N84V'))]};const out=run([node,{type:'inlineCode',value:'GPR2-sfGFP'}]);assert.equal(out[0].url,node.url);assert.equal(out[1].value,'GPR2-sfGFP');});
test('formula nodes remain byte exact',()=>{const raw={type:'html',value:'<span class="katex"><math><msub><mi>G</mi><mn>3</mn></msub></math></span>'};assert.deepEqual(captionLead([raw]),[raw]);});
test('raw authored HTML bold is removed, italics and citation superscripts remain',()=>{const out=captionLead([{type:'html',value:'<strong>Figure 4.</strong> <b>(a)</b> <em>Mi</em><sup>[1]</sup>'}]);assert.equal(out[0].value,'Figure 4. (a) <em>Mi</em><sup>[1]</sup>');});
test('unlabelled captions and units gain no automatic emphasis',()=>run([t('Cells spun at 5000 g, 4 °C for 24 h; $a, b$ are model parameters.')]));
