import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync('src/scripts/scene-loading.js', 'utf8');
const classes = (...initial) => {
  const values = new Set(initial);
  return { add: (...v) => v.forEach(x => values.add(x)), remove: v => values.delete(v), contains: v => values.has(v) };
};
function boot({ mobile = false, loading = true } = {}) {
  const html = { classList: classes(...(loading ? ['scene-loading'] : [])) };
  const root = { classList: classes(), dataset: { scenePortrait: '(max-aspect-ratio: 4/5)', sceneGround: 'ground.webp', sceneSky: 'sky.webp' },
    querySelector: selector => ({ dataset: { src: selector.includes('mobile') ? 'mobile.webp' : 'desktop.webp' } }) };
  const images = [], timers = [];
  class Image {
    constructor() { images.push(this); }
    decode() { return new Promise((resolve, reject) => { this.decodeOK = resolve; this.decodeFail = reject; }); }
  }
  vm.runInNewContext(source, { document: { documentElement: html, querySelector: () => root }, matchMedia: () => ({ matches: mobile }), Image,
    setTimeout: callback => { timers.push(callback); return timers.length - 1; }, clearTimeout: id => { timers[id] = () => {}; } });
  return { html, root, images, timers };
}
async function loaded(image) { const result = image.onload(); image.decodeOK(); await result; }
const settle = () => new Promise(resolve => setImmediate(resolve));
test('title waits for every visible asset to decode; inactive desktop atlas is not requested on mobile', async () => {
  const t = boot({ mobile: true });
  assert.deepEqual(t.images.map(i => i.src), ['mobile.webp', 'ground.webp', 'sky.webp']);
  await loaded(t.images[0]); await loaded(t.images[1]);
  const last = t.images[2].onload();
  await settle(); assert.ok(t.html.classList.contains('scene-loading'));
  t.images[2].decodeOK(); await last; await settle();
  assert.ok(!t.html.classList.contains('scene-loading'));
  assert.ok(!t.root.classList.contains('scene--noart'));
});
test('broken atlas leaves a readable title and does not hide healthy ground/sky', async () => {
  const t = boot(); t.images[0].onerror();
  await loaded(t.images[1]); await loaded(t.images[2]); await settle();
  assert.ok(!t.html.classList.contains('scene-loading'));
  assert.ok(t.root.classList.contains('scene--noart'));
  assert.ok(!t.root.classList.contains('scene--noground'));
});
test('slow images time out without blocking reading or popping into the fallback later', async () => {
  const t = boot(); await loaded(t.images[2]); t.timers[0]();
  assert.ok(!t.html.classList.contains('scene-loading'));
  assert.ok(t.root.classList.contains('scene--noart'));
  assert.ok(t.root.classList.contains('scene--noground'));
  assert.ok(!t.root.classList.contains('scene--nosky'));
  await loaded(t.images[0]); await loaded(t.images[1]); await settle();
  assert.ok(t.root.classList.contains('scene--noart'));
});
test('cached composition can reveal immediately and an inactive bootstrap does not request images', async () => {
  const t = boot(); await Promise.all(t.images.map(loaded)); await settle();
  assert.ok(!t.html.classList.contains('scene-loading'));
  assert.equal(boot({ loading: false }).images.length, 0);
});
