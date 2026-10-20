import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../src/nemaklear/embed-view.js', import.meta.url), 'utf8');

function runView({ search = '?embed=1', now = 250 } = {}) {
 let nowValue = now;
 const observers = [], events = {}, timers = new Map(); let nextTimer = 0;
 class Observer {
  constructor(callback) { this.callback = callback; observers.push(this); }
  observe() {}
  disconnect() { this.disconnected = true; }
 }
 class Element {
  constructor(id = '') { this.id = id; this.hidden = false; this.textContent = ''; this.dataset = {}; this.children = []; this.attributes = {}; this.classList = { values: new Set(), add: value => this.classList.values.add(value) }; }
  setAttribute(key, value) { this.attributes[key] = value; }
  insertBefore(node, before) { this.inserted = node; node.parentElement = this; this.before = before; }
  closest(selector) { return selector === 'section' ? this.section : null; }
  querySelector(selector) { return selector === '.densityline' && this.hasDensity ? {} : null; }
 }
 const document = {
  body: new Element('body'),
  documentElement: new Element('html'),
  elements: {},
  createElement: () => new Element(),
  getElementById(id) { return this.elements[id] || null; }
 };
 const input = document.elements.inputs = new Element('inputs');
 const form = new Element('form'), status = document.elements.status = new Element('status'); status.parentElement = form;
 const dynamics = document.elements.dynamics = new Element('dynamics');
 const eco = document.elements.eco = new Element('eco');
 const gallery = new Element('gallery'), figures = document.elements.figures = new Element('figures'); figures.section = gallery;
 const resultBody = document.elements.resultBody = new Element('resultBody');
 const method = document.elements.method = new Element('method');
 document.elements.inputs = input;
 document.elements.language = new Element('language'); document.elements.language.value = 'en';
 const window = { location: { search }, performance: { now: () => nowValue }, addEventListener: (name, callback) => { events[name] = callback; }, removeEventListener: name => { delete events[name]; }, parent: {} };
 const context = { window, document, location: window.location, performance: window.performance, URLSearchParams, MutationObserver: Observer,
  setInterval(callback) { const id = ++nextTimer; timers.set(id, callback); return id; },
  clearInterval(id) { timers.delete(id); } };
 vm.runInNewContext(source, context);
 return { document, dynamics, eco, gallery, status, resultBody, method, observers, events, timers, tick: () => [...timers.values()].forEach(fn => fn()), setNow: value => { nowValue = value; } };
}

test('embedded view keeps only input and density panels while retaining method content and real startup feedback', () => {
 const view = runView();
 assert.ok(view.document.body.classList.values.has('wiki-embed'));
 assert.equal(view.dynamics.hidden, true);
 assert.equal(view.eco.hidden, true);
 assert.equal(view.gallery.hidden, true);
 assert.equal(view.method.hidden, false);
 const startup = view.status.parentElement.inserted;
 assert.ok(startup);
 assert.equal(startup.attributes.role, 'status');
 assert.match(startup.textContent, /Loading calculation engine/);

 view.events['nemaklear:runtime']({ detail: { phase: 'preparing-model' } });
 assert.match(startup.textContent, /Preparing model/);
 view.setNow(2250);
 view.tick();
 assert.match(startup.textContent, /\d+s/);
 view.status.textContent = 'Solving ODE…';
 view.observers[0].callback();
 assert.match(startup.textContent, /Running example/);
 view.resultBody.hasDensity = true;
 view.observers[1].callback();
 assert.equal(startup.hidden, true);
 assert.equal(view.timers.size, 0);
});

test('full page mode does not hide application sections or add embed status', () => {
 const view = runView({ search: '' });
 assert.equal(view.dynamics.hidden, false);
 assert.equal(view.eco.hidden, false);
 assert.equal(view.gallery.hidden, false);
 assert.equal(view.status.parentElement.inserted, undefined);
});

test('busy status remains live, while worker and arbitrary job errors stop startup feedback', () => {
 const view = runView();
 const startup = view.status.parentElement.inserted;
 view.status.textContent = 'Calculating…';
 view.observers[0].callback();
 assert.match(startup.textContent, /Running example/);

 view.events['nemaklear:runtime']({ detail: { phase: 'error' } });
 assert.equal(startup.hidden, true);
 assert.equal(view.timers.size, 0);
 assert.equal(view.events['nemaklear:runtime'], undefined);

 const jobErrorView = runView();
 const jobStartup = jobErrorView.status.parentElement.inserted;
 jobErrorView.status.textContent = 'Worker rejected the calculation request';
 jobErrorView.observers[0].callback();
 assert.equal(jobStartup.hidden, true);
 assert.equal(jobErrorView.timers.size, 0);
 assert.equal(jobErrorView.status.textContent, 'Worker rejected the calculation request');
});

test('presentation assets are copied and the embed-only controller is included by the packager', () => {
 const prepare = fs.readFileSync(new URL('../../tools/prepare-nemaklear.mjs', import.meta.url), 'utf8');
 const css = fs.readFileSync(new URL('../../src/nemaklear/mobile.css', import.meta.url), 'utf8');
 assert.match(prepare, /'embed-view\.js'/);
 assert.match(prepare, /\.\/embed-view\.js/);
 assert.match(css, /\.wiki-embed \.workspace \{ grid-template-columns: minmax\(260px/);
 assert.match(css, /\.wiki-embed \[hidden\] \{ display: none !important; \}/);
 assert.match(css, /@media \(max-width: 760px\)/);
});
