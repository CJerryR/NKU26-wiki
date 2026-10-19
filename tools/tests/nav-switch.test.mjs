import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';

// Exercise pointerup before the spring has rendered another animation frame.
async function releaseAt(pointerX, filmX, cancelled = false) {
  const source = await fs.readFile(new URL('../../src/scripts/nav.ts', import.meta.url), 'utf8');
  const start = source.indexOf('    const release = (e: PointerEvent');
  const end = source.indexOf("    links.addEventListener('pointerup'", start);
  const { code } = await transform(source.slice(start, end), { loader: 'ts' });
  const selected = [];
  const items = [0, 1, 2].map((index) => ({ closest: () => ({ index }) }));
  const context = {
    pressX: 40, dragging: true, liftTarget: 1, swallowClick: false,
    x: filmX, w: 80, hovered: 0, items,
    links: { classList: { remove() {} }, hasPointerCapture: () => true, releasePointerCapture() {} },
    menuGlass: { setStrength() {} }, kick() {}, moveTo() {}, rest: () => 0,
    localX: (event) => event.clientX - 500,
    nearest: (x) => Math.max(0, Math.min(2, Math.floor(x / 100))),
    closeAll() {}, setOpen: (group, open) => { if (open) selected.push(group.index); },
    setTimeout() {},
  };
  vm.runInNewContext(code + `\nrelease({ clientX: ${pointerX + 500}, pointerId: 1 }, ${cancelled});`, context);
  return selected;
}

test('fast drag selects the adjacent menu even before the film moves', async () => {
  assert.deepEqual(await releaseAt(150, 0), [1]);
});

test('quick reversal follows the pointer rather than the previous menu highlight', async () => {
  assert.deepEqual(await releaseAt(50, 200), [0]);
  assert.deepEqual(await releaseAt(250, 0), [2]);
});

test('cancelled drag never opens a menu', async () => {
  assert.deepEqual(await releaseAt(150, 0, true), []);
});

test('closing dropdowns stop intercepting the pointer during their fade', async () => {
  const css = await fs.readFile(new URL('../../src/styles/nav.css', import.meta.url), 'utf8');
  assert.match(css.match(/\.lnav__drop\s*\{([^}]+)\}/)[1], /pointer-events:\s*none/);
  assert.match(css.match(/\.lnav__group\.is-open \.lnav__drop\s*\{([^}]+)\}/)[1], /pointer-events:\s*auto/);
});
