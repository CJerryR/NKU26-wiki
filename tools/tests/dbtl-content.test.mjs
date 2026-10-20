import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToolkit} from '../../src/lib/toolkit-blocks.mjs';
import {specByName} from '../../src/lib/toolkit-specs.mjs';
import fs from 'node:fs';

test('DBTL fallback retains all four stages, source media, captions and emphasis without JavaScript', () => {
  const block={_template:'cycle',language:'en',items:[{design:'Check **localization**.',build:'Use `GPR2–sfGFP`.',test:'Compare channels.',testImage:'https://static.igem.wiki/test.png',testAlt:'Three channels',testCaption:'**Figure 2.** Scale bar: 10 μm.',learn:'Additional measurements remain necessary.'}]};
  const html=renderToolkit(block,'cycle');
  assert.match(html,/<strong>localization<\/strong>/);
  assert.match(html,/<code>GPR2–sfGFP<\/code>/);
  assert.match(html,/<img src="https:\/\/static.igem.wiki\/test.png" alt="Three channels"/);
  assert.match(html,/<figcaption><strong>Figure 2.<\/strong> Scale bar: 10 μm.<\/figcaption>/);
  const fallback=html.slice(html.indexOf('<div class="wiki-toolkit-fallback">'),html.indexOf('<noscript>'));
  assert.doesNotMatch(fallback,/cyc__overview-fallback/);
  assert.ok(html.indexOf('data-dbtl-stage="design"') < html.indexOf('data-dbtl-stage="build"'));
  assert.ok(html.indexOf('data-dbtl-stage="build"') < html.indexOf('data-dbtl-stage="test"'));
  assert.ok(html.indexOf('data-dbtl-stage="test"') < html.indexOf('data-dbtl-stage="learn"'));
  assert.match(html,/Additional measurements remain necessary/);
});

test('DBTL overview fallback keeps the full DBT, figure, and Learn order and registered presentation option', () => {
  const data=JSON.parse(fs.readFileSync('content/wiki/engineering.json','utf8'));
  const block=data.blocks.find(b=>b._template==='cycle'&&b.presentation==='overview');
  assert.ok(block,'Iteration 3.4 opts into overview presentation');
  const html=renderToolkit(block,'cycle');
  const fallback=html.slice(html.indexOf('<div class="wiki-toolkit-fallback">'),html.indexOf('<noscript>'));
  const fallbackText=fallback.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  const positions=['data-dbtl-stage="design"','data-dbtl-stage="build"','data-dbtl-stage="test"','data-dbtl-figure="test"','data-dbtl-stage="learn"'].map(marker=>fallback.indexOf(marker));
  assert.ok(positions.every(position=>position>=0));
  assert.deepEqual(positions,[...positions].sort((a,b)=>a-b),'source order is Design, Build, Test, figure, Learn');
  for (const stage of ['design','build','test','learn']) {
    const text=block.items[0][stage];
    const plainText=text.replace(/\*\*/g,'');
    assert.ok(fallbackText.includes(plainText),`${stage} text is present in fallback`);
    assert.equal(fallbackText.split(plainText).length-1,1,`${stage} text is not duplicated in fallback`);
  }
  assert.match(fallback,/<strong>Design - <\/strong>/);
  assert.ok(fallback.includes(`src="${block.items[0].testImage}" alt="Figure 5. A test card designed for simpler use."`));
  assert.match(fallback,/<figcaption>Figure 5\. A test card designed for simpler use\./);
  const presentation=specByName.cycle.fields.find(field=>field.name==='presentation');
  assert.equal(presentation.kind,'select');
  assert.deepEqual(presentation.options.map(option=>option.value),['stepper','overview']);
});

test('DBTL no-JavaScript fallback renders safe links and scientific italics', () => {
  const data=JSON.parse(fs.readFileSync('content/wiki/engineering.json','utf8'));
  const ecoCycle=data.blocks.find(b=>b._template==='cycle'&&b.items?.[0]?.learn?.includes('The [Eco Model]'));
  assert.match(renderToolkit(ecoCycle,'cycle'),/<a href="\/model-eco\/">Eco Model<\/a>/);
  const block={_template:'cycle',presentation:'overview',items:[{design:'Compare *Meloidogyne incognita* and [Eco Model](/model-eco/).',build:'Unsafe [link](javascript:alert(1)).',test:'Keep <script>alert(1)</script> as text.',learn:'Done.'}]};
  const html=renderToolkit(block,'cycle');
  assert.match(html,/<em>Meloidogyne incognita<\/em>/);
  assert.match(html,/<a href="\/model-eco\/">Eco Model<\/a>/);
  assert.doesNotMatch(html,/href="javascript:/i);
  assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script>/);
});

test('overview no-JavaScript styles are limited to overview cycles', () => {
  const overview=renderToolkit({_template:'cycle',presentation:'overview',items:[]},'cycle');
  const stepper=renderToolkit({_template:'cycle',items:[]},'cycle');
  const datatable=renderToolkit({_template:'datatable',csv:'Name\nExample\n'},'datatable');
  assert.match(overview,/<style>[^<]*cyc__overview-fallback/);
  assert.doesNotMatch(stepper,/<style>[^<]*cyc__overview-fallback/);
  assert.doesNotMatch(datatable,/<style>[^<]*cyc__overview-fallback/);
  assert.match(datatable,/<style>[^<]*wiki-toolkit-fallback\{display:block!important\}/);
});

test('every phase image and caption is a real editable Tina field', () => {
  const fields=specByName.cycle.fields.find(f=>f.name==='items').fields;
  for (const phase of ['design','build','test','learn']) {
    assert.equal(fields.find(f=>f.name===`${phase}Image`).kind,'file');
    assert.equal(fields.find(f=>f.name===`${phase}Caption`).kind,'long');
  }
});

test('all migrated ODE formulas render as valid KaTeX and retain copyable TeX', () => {
  const data=JSON.parse(fs.readFileSync('content/wiki/model-ode.json','utf8'));
  const equations=data.blocks.filter(b=>b._template==='equation');
  assert.equal(equations.length,13);
  for (const block of equations) {
    const html=renderToolkit(block,'equation');
    assert.match(html,/<math /);
    assert.doesNotMatch(html,/katex-error/);
    assert.match(html,/application\/x-tex/);
  }
});

test('editable table cells retain species italics while escaping unsupported HTML', () => {
  const block={_template:'datatable',inlineFormatting:true,csv:'Organism,Notes\n<strong><em>Saccharomyces cerevisiae</em></strong>,<script>alert(1)</script>\n'};
  const html=renderToolkit(block,'datatable');
  assert.match(html,/<td><strong><em>Saccharomyces cerevisiae<\/em><\/strong><\/td>/);
  assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script>/);
});
