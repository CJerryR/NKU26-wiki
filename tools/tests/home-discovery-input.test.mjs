import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('static/js/home-opening.js', 'utf8');

test('discovered nematode keeps its light fixed, while the surface remains interactive', () => {
  const start = source.indexOf('  function pointerTo(e) {');
  const end = source.indexOf("  stage.addEventListener('pointermove'", start);
  const context = { S: { found: true, exploring: true }, ptr: { x: 12, y: 18, seen: false }, pointerN: {}, guide: 'active', stageRect: () => ({ left: 0, top: 0, width: 800, height: 600 }) };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  context.pointerTo({ clientX: 500, clientY: 300 });
  assert.equal(context.ptr.x, 12);
  assert.equal(context.ptr.y, 18);
  context.S.exploring = false;
  context.pointerTo({ clientX: 500, clientY: 300 });
  assert.equal(context.ptr.x, 500);
  assert.equal(context.ptr.y, 300);
});

test('ArrowDown after discovery is left available to the story pager', () => {
  const start = source.indexOf("    focusEl.addEventListener('keydown', function (e) {");
  const end = source.indexOf('    });', start) + '    });'.length;
  let handler;
  const context = { S: { found: false, exploring: true }, light: { tx: 0, ty: 0 }, ptr: {}, guide: null, startGuide() {}, focusEl: { addEventListener: (_name, fn) => { handler = fn; } } };
  vm.runInNewContext(source.slice(start, end), context);
  let prevented = false, stopped = false;
  const key = { key: 'ArrowDown', preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } };
  handler(key);
  assert.equal(context.light.ty, -0.9);
  assert.equal(prevented, true);
  context.S.found = true;
  prevented = stopped = false;
  handler(key);
  assert.equal(context.light.ty, -0.9);
  assert.equal(prevented, false);
  assert.equal(stopped, false);
});
