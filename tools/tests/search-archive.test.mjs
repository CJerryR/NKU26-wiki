import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';

async function searchIndex(pages) {
  const source = (await readFile(new URL('../../src/lib/search-index.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '').replace('export function', 'function');
  const { code } = await transform(source, { loader: 'ts' });
  const context = {
    pages,
    pagePath: (page) => `${page.data.route || page.id}/`,
    homeSearchEntry: () => ({ title: 'Home', url: 'index.html' }),
    stripMd: (value) => value,
    markdownToText: (value) => value,
    sectionsFromMarkdown: () => [],
  };
  return vm.runInNewContext(code + '\nbuildSearchIndex(pages)', context);
}

const page = (id, route = id) => ({ id, body: 'Scientific material', data: {
  route, title: id, search: true, hidden: false, crumbs: ['Project'],
} });

test('historical originals never enter search, even when their search flag is true', async () => {
  const result = await searchIndex([
    page('source-archive'), page('renamed-archive', 'source-archive'), page('experiments'),
  ]);
  assert.deepEqual(Array.from(result, (entry) => entry.url), ['index.html', 'experiments/']);
});

test('scientific downloads and ordinary published content remain searchable', async () => {
  const result = await searchIndex([page('parts'), page('experiments'), {
    ...page('private'), data: { ...page('private').data, hidden: true },
  }]);
  assert.deepEqual(Array.from(result, (entry) => entry.url), ['index.html', 'parts/', 'experiments/']);
  assert.equal(result[1].text.includes('Scientific material'), true);
});
