import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';

async function setup() {
  const source = await fs.readFile(new URL('../../src/scripts/nav.ts', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('  let peekBounds:'), source.indexOf('  /* the compact/peek switch'));
  class Node {}
  const target = () => ({ handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; } });
  const bar = target(), document = target(), window = target();
  const classes = new Set();
  bar.classList = { contains: (c) => classes.has(c), add: (c) => classes.add(c), remove: (c) => classes.delete(c) };
  const child = new Node();
  bar.contains = (node) => node === child;
  let rect = { left: 1000, right: 1250, top: 14, bottom: 70 };
  const islands = [{ getBoundingClientRect: () => rect }];
  let onResize;
  const { code } = await transform(block, { loader: 'ts' });
  vm.runInNewContext(code, { Node, bar, document, window, islands,
    ResizeObserver: class { constructor(fn) { onResize = fn; } observe() {} } });
  const move = (x, y = 42, inside = false) => document.handlers.pointermove({ clientX: x, clientY: y, target: inside ? child : new Node() });
  return { bar, document, window, move, peek: () => classes.has('is-peek'),
    resize(left) { rect = { ...rect, left }; onResize(); } };
}

test('stationary pointer at swept left rim survives expansion and retreat', async () => {
  const s = await setup();
  s.bar.handlers.pointerenter();
  s.resize(500); // links expand while the section label still occupies space
  s.move(501, 42, true);
  s.resize(600); // section label disappears; rim retreats past the pointer
  s.bar.handlers.pointerleave({ clientX: 501, clientY: 42, target: {} });
  for (let i = 0; i < 20; i++) s.move(501);
  assert.equal(s.peek(), true);
  s.move(493); // small tolerance just outside the widest rim
  assert.equal(s.peek(), true);
  s.move(480);
  assert.equal(s.peek(), false);
});

test('leaving vertically collapses and the next hover forgets old bounds', async () => {
  const s = await setup();
  s.bar.handlers.pointerenter();
  s.resize(500);
  s.move(700, 100);
  assert.equal(s.peek(), false);
  s.resize(1000);
  s.bar.handlers.pointerenter();
  s.move(700);
  assert.equal(s.peek(), false);
});

test('dropdown descendants keep the navigation open outside island bounds', async () => {
  const s = await setup();
  s.bar.handlers.pointerenter();
  s.move(900, 200, true);
  assert.equal(s.peek(), true);
  s.move(900, 200);
  assert.equal(s.peek(), false);
});

test('window blur, resize and leaving the document clear hover', async () => {
  const s = await setup();
  for (const [target, event] of [[s.window, 'blur'], [s.window, 'resize'], [s.document, 'pointerleave']]) {
    s.bar.handlers.pointerenter();
    target.handlers[event]();
    assert.equal(s.peek(), false);
  }
});
