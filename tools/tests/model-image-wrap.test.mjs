import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { toEntry } from '../../src/lib/editor-content.mjs';

const page = JSON.parse(fs.readFileSync(new URL('../../content/wiki/model-docking.json', import.meta.url), 'utf8'));
const blocks = page.blocks;

test('Docking Figures 1 and 3 use shared wrap layouts with associated prose kept in order', () => {
  const expected = new Map([[1, 'src-Model-Docking-14'], [3, 'src-Model-Docking-29']]);
  for (const [number, anchor] of expected) {
    const index = blocks.findIndex((block) => block._template === 'image' && block.body?.startsWith(`Figure ${number}.`));
    assert.notEqual(index, -1, `Figure ${number} exists`);
    const figure = blocks[index];
    assert.equal(figure.layout, 'wrap-right');
    assert.equal(Object.hasOwn(figure, 'flow'), false);
    assert.ok(figure.accompanyingBody);
    assert.equal(blocks[index + 1]?._template, 'text');
    assert.ok(blocks[index + 1].body.includes(`id="${anchor}"`), `Figure ${number} flow stops before its hidden source anchor`);
    assert.equal(figure.accompanyingBody.includes(anchor), false);
  }

  const first = blocks.find((block) => block._template === 'image' && block.body?.startsWith('Figure 1.'));
  const p1 = first.accompanyingBody.indexOf('We initially examined three fungal');
  const p2 = first.accompanyingBody.indexOf('Initial checks revealed two input problems.');
  const p3 = first.accompanyingBody.indexOf('We used structural superposition');
  const p4 = first.accompanyingBody.indexOf('Subsequent mutant comparisons');
  assert.ok(p1 >= 0 && p1 < p2 && p2 < p3 && p3 < p4, 'Figure 1 prose remains in authored order');

  const third = blocks.find((block) => block._template === 'image' && block.body?.startsWith('Figure 3.'));
  assert.match(third.accompanyingBody, /We then replaced candidate residues[\s\S]*Using the structures and WT reference/);
});

test('the shared serializer emits both Docking figures through the standard wrap directive', () => {
  const output = toEntry('model-docking', page).body;
  assert.equal((output.match(/figuretext\{side=right width=medium flow=wrap\}/g) || []).length, 2);
  assert.equal(output.includes('model-figure-flow-context'), false);
  assert.equal(output.includes('正文环绕整张图块'), false);
});
