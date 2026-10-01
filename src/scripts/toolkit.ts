// @ts-nocheck — plain JS kept in a .ts entry so site.ts can import it unchanged.
// <wiki-toolkit data-props="{…}"> — interactive content blocks from Tina.
// Custom elements reconnect automatically when Tina replaces an editable island.
// Each family of components is a separate chunk, loaded only when a page uses it.
import styles from '../styles/toolkit.css?raw';
import { h, icon, asset } from './toolkit/core.js';

const families = {
  content: () => import('./toolkit/content.js'),
  media: () => import('./toolkit/media.js'),
  data: () => import('./toolkit/data.js'),
  narrative: () => import('./toolkit/narrative.js'),
  bio: () => import('./toolkit/bio.js'),
};
const FAMILY_OF = {
  tabs: 'content', accordion: 'content', downloads: 'content', flow: 'content', code: 'content',
  lightbox: 'media', comparison: 'media', video: 'media', hotspots: 'media',
  chart: 'data', datatable: 'data', heatmap: 'data', matrix: 'data', params: 'data', equation: 'data', sequence: 'data',
  cycle: 'narrative', stakeholders: 'narrative', interview: 'narrative', chronology: 'narrative', risk: 'narrative', parts: 'bio', construct: 'bio',
};

// One parsed stylesheet shared by every instance (falls back to <style> per instance).
let shared = null;
function adopt(root) {
  try {
    if (!shared) { shared = new CSSStyleSheet(); shared.replaceSync(styles); }
    root.adoptedStyleSheets = [shared];
    return true;
  } catch { return false; }
}

class WikiToolkit extends HTMLElement {
  static observedAttributes = ['data-props'];
  cleanups = []; controller = null; generation = 0; adopted = false;
  constructor() { super(); this.attachShadow({ mode: 'open' }); this.adopted = adopt(this.shadowRoot); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  disconnectedCallback() { this.teardown(); }
  teardown() {
    for (const fn of this.cleanups.splice(0)) { try { fn(); } catch { /* already gone */ } }
    this.controller?.abort();
  }
  async render() {
    const generation = ++this.generation;
    this.teardown();
    this.controller = new AbortController();
    const root = this.shadowRoot;
    root.replaceChildren();
    if (!this.adopted) root.append(h('style', { text: styles }));

    let d = {};
    try { d = JSON.parse(this.getAttribute('data-props') || '{}'); } catch { d = {}; }
    const type = d._template || this.dataset.type || '';
    const tools = h('div', { class: 'tk__tools' });
    const head = h('header', { class: 'tk__head' }, d.title && type !== 'quote' ? h('h3', { class: 'tk__title', text: d.title }) : null, tools);
    const body = h('div', { class: 'tk__body' });
    const frame = h('section', { class: ['tk', `tk--${type}`], 'aria-label': d.title || null }, head, body);
    root.append(frame);
    if (d.caption) root.append(h('p', { class: 'tk__cap', text: d.caption }));

    const active = () => this.isConnected && generation === this.generation;
    const ctx = {
      root, host: this, frame, head, tools, body, active,
      signal: this.controller.signal,
      onCleanup: (fn) => this.cleanups.push(fn),
      load: async (value) => {
        if (!value) return '';
        const response = await fetch(asset(value), { signal: this.controller.signal });
        if (!response.ok) throw new Error(`文件加载失败（HTTP ${response.status}）：${value}`);
        return response.text();
      },
    };
    try {
      const family = FAMILY_OF[type];
      if (!family) throw new Error(`未知组件类型：${type || '（空）'}`);
      const mod = await families[family]();
      if (!active()) return;
      const component = mod.components[type];
      if (component.bare) frame.classList.add('tk--bare');
      await component.render(d, ctx);
      if (!active()) return;
      if (!head.querySelector('.tk__title') && !tools.childElementCount) head.remove();
    } catch (error) {
      if (error?.name === 'AbortError' || !active()) return;
      body.append(h('p', { class: 'tk__error', role: 'alert' }, icon('close'), h('span', { text: error?.message || String(error) })));
    }
  }
}
if (!customElements.get('wiki-toolkit')) customElements.define('wiki-toolkit', WikiToolkit);
