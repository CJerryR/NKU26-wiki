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
  assert.ok(html.indexOf('data-dbtl-stage="test"') < html.indexOf('data-dbtl-stage="learn"'));
  assert.match(html,/Additional measurements remain necessary/);
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
