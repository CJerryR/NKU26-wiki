import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

// Run the actual TypeScript in a controlled browser host. Deferred transition
// callbacks let us exercise races that are timing-dependent in a real browser.
const source = transformSync(fs.readFileSync(new URL('../../src/scripts/theme.ts', import.meta.url), 'utf8'), {
  loader: 'ts', format: 'cjs', target: 'es2020',
}).code;
const origin = { x: 100, y: 800 };
const key = 'nku26-theme';
const microtasks = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function host({ transition = 'normal', reduced = false, hidden = false, blockedStorage = false, initial = 'light' } = {}) {
  const attributes = new Map(initial === 'dark' ? [['data-theme', 'dark']] : []);
  const classes = new Set();
  const storage = new Map(initial === 'dark' ? [[key, 'dark']] : []);
  const listeners = new Map();
  const frames = [], transitions = [], circles = [], events = [];
  const root = {
    getAttribute: name => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
    animate() {
      const circle = { cancelled: false, cancel() { this.cancelled = true; } };
      circles.push(circle);
      return circle;
    },
  };
  const document = { documentElement: root, hidden };
  if (transition !== 'absent') document.startViewTransition = callback => {
    if (transition === 'throw') throw new Error('transition unavailable');
    const ready = deferred(), finished = deferred();
    const item = {
      ready: ready.promise, finished: finished.promise, skipCount: 0,
      // A skipped transition can still execute its already queued update.
      skipTransition() { this.skipCount++; ready.reject(new Error('skipped')); finished.resolve(); },
      commit: callback,
      reveal: ready.resolve,
      rejectReady: ready.reject,
      finish: finished.resolve,
      rejectFinished: finished.reject,
    };
    transitions.push(item);
    return item;
  };
  const emit = (type, detail = {}) => {
    const event = { type, ...detail };
    events.push(event);
    for (const listener of listeners.get(type) ?? []) listener(event);
    return true;
  };
  const module = { exports: {} };
  const sandbox = {
    module, exports: module.exports, document,
    innerWidth: 1440, innerHeight: 1000,
    matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame: callback => frames.push(callback),
    localStorage: {
      getItem(name) { if (blockedStorage) throw new Error('storage blocked'); return storage.get(name) ?? null; },
      setItem(name, value) { if (blockedStorage) throw new Error('storage blocked'); storage.set(name, value); },
    },
    addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(listener); },
    dispatchEvent: event => emit(event.type, event),
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  };
  vm.runInNewContext(source, sandbox, { filename: 'src/scripts/theme.ts' });
  return {
    api: module.exports, root, classes, storage, transitions, circles, events, listeners, emit,
    async frame() { await microtasks(); const pending = frames.splice(0); pending.forEach(callback => callback()); await microtasks(); },
    async settle() { await this.frame(); await this.frame(); },
  };
}

for (const count of [2, 3, 10]) test(`${count} synchronous toggles preserve parity even when callbacks execute backwards`, async () => {
  const h = host();
  for (let i = 0; i < count; i++) assert.equal(h.api.toggleTheme(origin), i % 2 ? 'light' : 'dark');
  const expected = count % 2 ? 'dark' : 'light';
  assert.equal(h.storage.get(key), expected);
  const last = h.transitions.at(-1);
  last.commit();
  for (const t of h.transitions.slice(0, -1).reverse()) t.commit();
  assert.equal(h.api.currentTheme(), expected);
  assert.equal(h.events.filter(event => event.type === 'nku:themechange').length, 1);
  for (const t of h.transitions) t.reveal();
  await microtasks();
  assert.equal(h.circles.length, 1, 'stale ready callbacks must not create circles');
  await h.settle();
  assert.equal(h.classes.has('theme-switching'), true, 'old finished callbacks must not settle the newest transition');
  last.finish(); await h.settle();
  assert.equal(h.classes.has('theme-switching'), false);
});

for (const stage of ['before-update', 'before-ready', 'during-circle']) test(`reentry ${stage} cancels the old transition and preserves the latest paint`, async () => {
  const h = host();
  h.api.toggleTheme(origin);
  const first = h.transitions[0];
  if (stage !== 'before-update') first.commit();
  if (stage === 'during-circle') { first.reveal(); await microtasks(); assert.equal(h.circles.length, 1); }
  h.api.toggleTheme(origin);
  assert.equal(first.skipCount, 1);
  if (stage === 'during-circle') assert.equal(h.circles[0].cancelled, true);
  const last = h.transitions.at(-1);
  last.commit(); first.commit(); first.reveal();
  await h.settle();
  assert.equal(h.api.currentTheme(), 'light');
  assert.equal(h.storage.get(key), 'light');
  assert.equal(h.classes.has('theme-switching'), true);
  last.reveal(); await microtasks(); last.finish(); await h.settle();
  assert.equal(h.classes.has('theme-switching'), false);
});

test('a settle already queued for the second animation frame cannot clear a newer transition', async () => {
  const h = host(); h.api.toggleTheme(origin);
  const first = h.transitions[0]; first.commit(); first.reveal(); await microtasks(); first.finish();
  await h.frame(); // The old cleanup is now queued for its final animation frame.
  h.api.toggleTheme(origin);
  const last = h.transitions.at(-1); last.commit();
  await h.frame();
  assert.equal(h.classes.has('theme-switching'), true);
  last.reveal(); await microtasks(); last.finish(); await h.settle();
  assert.equal(h.classes.has('theme-switching'), false);
});

for (const external of ['dark', 'light', null]) test(`storage sync (${external}) supersedes a pending local update`, async () => {
  const h = host(); h.api.initTheme(); h.api.initTheme();
  assert.equal(h.listeners.get('storage').length, 1);
  h.api.toggleTheme(origin);
  const old = h.transitions[0];
  if (external === null) h.storage.delete(key); else h.storage.set(key, external);
  h.emit('storage', { key: external === null ? null : key });
  old.commit(); old.reveal(); old.finish(); await h.settle();
  const expected = external === 'dark' ? 'dark' : 'light';
  assert.equal(h.api.currentTheme(), expected);
  assert.equal(old.skipCount, 1);
  assert.equal(h.circles.length, 0);
  assert.equal(h.classes.has('theme-switching'), false);
  // The next local toggle must also use the externally synchronized state.
  assert.equal(h.api.toggleTheme(), expected === 'dark' ? 'light' : 'dark');
});

test('unrelated storage changes do not interrupt a local transition', () => {
  const h = host(); h.api.initTheme(); h.api.toggleTheme(origin);
  h.emit('storage', { key: 'unrelated' });
  assert.equal(h.transitions[0].skipCount, 0);
});

test('BFCache restore reconciles storage with a pending target even when the current DOM already matches storage', async () => {
  const h = host(); h.api.initTheme(); h.api.toggleTheme(origin);
  h.storage.set(key, 'light');
  h.emit('pageshow', { persisted: true });
  h.transitions[0].commit(); await h.settle();
  assert.equal(h.api.currentTheme(), 'light');
  assert.equal(h.transitions[0].skipCount, 1);
  assert.equal(h.classes.has('theme-switching'), false);
  assert.equal(h.api.toggleTheme(), 'dark');
});

for (const options of [{ transition: 'absent' }, { transition: 'throw' }, { reduced: true }, { hidden: true }]) {
  test(`instant fallback ${JSON.stringify(options)} switches both directions and clears protection`, async () => {
    const h = host(options);
    h.api.toggleTheme(origin); assert.equal(h.api.currentTheme(), 'dark');
    await h.settle(); assert.equal(h.classes.has('theme-switching'), false);
    h.api.toggleTheme(origin); assert.equal(h.api.currentTheme(), 'light');
    await h.settle(); assert.equal(h.classes.has('theme-switching'), false);
    assert.equal(h.transitions.length, 0); assert.equal(h.circles.length, 0);
  });
}

test('unavailable storage does not prevent local theme changes', async () => {
  const h = host({ blockedStorage: true, reduced: true });
  assert.equal(h.api.toggleTheme(origin), 'dark'); assert.equal(h.api.currentTheme(), 'dark');
  assert.equal(h.api.toggleTheme(origin), 'light'); assert.equal(h.api.currentTheme(), 'light');
  await h.settle(); assert.equal(h.classes.has('theme-switching'), false);
});

test('a skipped transition with rejected ready and finished promises cleans up without animating', async () => {
  const h = host(); h.api.toggleTheme(origin);
  const t = h.transitions[0]; t.commit();
  t.rejectReady(new Error('skipped')); t.rejectFinished(new Error('failed transition'));
  await h.settle();
  assert.equal(h.api.currentTheme(), 'dark');
  assert.equal(h.circles.length, 0);
  assert.equal(h.classes.has('theme-switching'), false);
});
