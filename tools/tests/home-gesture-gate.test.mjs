// Round 2 (2026-10-21): gesture segmentation for the gated 3D stretch of the
// homepage (static/js/home-pager.js, makeGestureGate). One physical gesture
// must keep one id; only a reversal, a quiet gap or a renewed push after the
// momentum has decayed may start a new one.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src = fs.readFileSync('static/js/home-pager.js', 'utf8');
const helper = src.slice(src.indexOf('  function makeGestureGate()'), src.indexOf('  // End gesture gate helper.'));
const make = () => vm.runInNewContext(helper + ';makeGestureGate')();
const ids = (events) => { const g = make(); return new Set(events.map(([t, d]) => g(d, t).id)).size; };
function swipe(t0 = 0, peak = 30, finger = 12, decay = 0.955, spike = 1.6) {
  const ev = []; let t = t0;
  for (let i = 0; i < finger; i++, t += 16) ev.push([t, 4 + (peak - 4) * i / (finger - 1)]);
  for (let v = peak * spike; v > 0.6; v *= decay, t += 16) ev.push([t, v]);
  return ev;
}
test('a trackpad swipe with lift-off spike and long momentum is one gesture', () => {
  assert.equal(ids(swipe()), 1);
  assert.equal(ids(swipe(0, 60, 25, 0.97, 1.9)), 1);
});
test('a main-thread stall inside momentum does not split the gesture', () => {
  for (const stall of [180, 240, 360]) {
    const ev = []; let t = 0, v = 34, stalled = false;
    while (v > 0.6) {
      if (!stalled && t > 400) { // the browser coalesces the stalled frames into one delta
        let sum = 0; for (let k = 0; k < stall / 16; k++) { sum += v; v *= 0.955; }
        t += stall; ev.push([t, sum]); stalled = true; continue;
      }
      ev.push([t, v]); v *= 0.955; t += 16;
    }
    assert.equal(ids(ev), 1, `stall ${stall} ms`);
  }
});
test('a burst of wheel notches is one gesture; separate notches are separate', () => {
  assert.equal(ids([0, 70, 140, 210, 280, 350].map((t) => [t, 100])), 1);
  assert.equal(ids([0, 90, 180, 270].map((t) => [t, 48])), 1); // Firefox line mode x16
  assert.equal(ids([0, 600, 1200].map((t) => [t, 100])), 3);
});
test('a reversal or a renewed push after decay starts a new gesture', () => {
  const g = make();
  const a = swipe().map(([t, d]) => g(d, t).id).pop();
  assert.equal(g(-12, 2000).id, a + 1);
  const h = make(); let last = 0;
  for (const [t, d] of swipe(0, 30, 12, 0.93)) last = h(d, t).id;
  // momentum has decayed to ~1 px; the hand pushes again without a gap
  const t1 = 12 * 16 + 60 * 16; const again = [6, 14, 24, 30].map((d, i) => h(d, t1 + i * 16).id);
  assert.equal(again.pop(), last + 1);
});
test('a new swipe after the momentum has ended is a new gesture', () => {
  const g = make(); let a = 0;
  for (const [t, d] of swipe()) a = g(d, t).id;
  assert.equal(g(5, 5000).id, a + 1);
});

// Exercise scene admission as well as gesture segmentation: momentum may last
// beyond a camera stop, but must not spend the same gesture for a second shot.
const gateBody = src.slice(src.indexOf('    function gatedWheel('), src.indexOf('    /* v10.0.2: a free-scroll area'));
function sceneGate(overrides = {}) {
  const state = {
    pages: [{ id: 'china', steps: 3, sp: { gateDelta: 40 } }], cur: 0, st: 1,
    busy: false, leaving: false, A: { mode: '' }, spent: 1, actedAt: 100,
    activeDir: 1, eligId: 0, gacc: 0, releasedAt: 1000, holdUntil: 1700,
    busyTimer: 0, inputSpeed: 1, turns: 0, actions: [], clearTimeout() {},
    lean() {}, pullBy() {}, ...overrides,
  };
  state.next = () => state.actions.push(1);
  state.prev = () => state.actions.push(-1);
  vm.createContext(state);
  vm.runInContext(gateBody + ';this.send = gatedWheel;', state);
  return state;
}
test('a spent gesture cannot advance another scene after its hold ends', () => {
  const state = sceneGate();
  for (const t of [1800, 2300, 3000]) state.send(60, t, { id: 1, start: 100, dir: 1 });
  assert.deepEqual(state.actions, []);
});
test('a new gesture advances once after the camera stop', () => {
  const state = sceneGate();
  state.send(60, 2300, { id: 2, start: 2300, dir: 1 });
  state.send(60, 2350, { id: 2, start: 2300, dir: 1 });
  assert.deepEqual(state.actions, [1]);
});
test('a fresh reverse gesture can reverse an internal camera shot', () => {
  const state = sceneGate({ busy: true });
  state.send(-60, 1400, { id: 2, start: 1400, dir: -1 });
  assert.deepEqual(state.actions, [-1]);
});
