import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';

const source = (await readFile(new URL('../../src/scripts/search.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;$/gm, '').replace('export function', 'function');
const { code } = await transform(source, { loader: 'ts' });
const { flatten, destination } = vm.runInNewContext(code + '\n({ flatten, destination })');
const entry = {
  title: 'Results', url: 'results/', desc: 'Experimental results',
  text: 'Results receptor localization sfGFP fluorescence yeast chassis sfGFP',
  sections: [
    { title: 'Receptor localization', text: 'sfGFP fluorescence', url: 'results/#receptor' },
    { title: 'Yeast chassis', text: 'sfGFP yeast', url: 'results/#chassis' },
  ],
};

test('body-only page hit enters its matching section and shows the same excerpt', () => {
  const [page] = flatten([entry]);
  const target = destination(page, ['sfgfp'], 'sfgfp');
  assert.equal(target.url, 'results/#receptor');
  assert.equal(target.text, 'sfGFP fluorescence');
});

test('multiple words select the chapter containing all terms', () => {
  const [page] = flatten([entry]);
  assert.equal(destination(page, ['sfgfp', 'yeast'], 'sfgfp yeast').url, 'results/#chassis');
});

test('page-name searches and unmatched section combinations retain a valid page URL', () => {
  const [page] = flatten([entry]);
  assert.equal(destination(page, ['results'], 'results').url, 'results/');
  assert.equal(destination(page, ['localization', 'chassis'], 'localization chassis').url, 'results/');
});

test('section results keep their own anchor', () => {
  const [, section] = flatten([entry]);
  assert.equal(destination(section, ['sfgfp'], 'sfgfp').url, 'results/#receptor');
});
