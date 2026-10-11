/**
 * remark-wiki — the Markdown dialect used by every page in src/content/pages.
 *
 * Runs after remark-directive. It turns a small set of `:::blocks` into the
 * site's components, reads `{#id toc="…"}` attributes at the end of headings,
 * wraps each `##` section in <section>, and hands the outline (TOC) to the
 * page layout through `remarkPluginFrontmatter.toc`.
 *
 * Authoring mistakes never stop the build: an unknown block is unwrapped, a
 * stray `:word` in running text is put back as text, and a missing figure or
 * icon shows a visible notice plus a warning in the terminal.
 *
 * Plain ES module with no dependencies, so the same file also runs in tests.
 */
import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import { iconSvg, CALLOUT_ICONS, UI_ICONS } from './icons.mjs';

const CALLOUT_TYPES = { note: 'note', important: 'note', tip: 'tip', warning: 'warning', warn: 'warning', caution: 'warning' };
const CONTAINERS = new Set([
  ...Object.keys(CALLOUT_TYPES), 'callout',
  'cards', 'cols', 'timeline', 'features', 'stats', 'refs', 'figure', 'figuretext', 'details', 'people', 'lead',
]);
const LEAVES = new Set(['figure']);

export default function remarkWiki(options = {}) {
  const figureDir = options.figureDir || path.resolve(process.cwd(), 'src/figures');
  return function transformer(tree, file) {
    const ctx = { figureDir, file };
    restoreDirectives(tree, ctx);
    eachNode(tree, (node) => { if (node.type === 'heading') readHeadingAttributes(node); });
    transformBlocks(tree, ctx);
    wrapTablesAndImages(tree);
    renderInlineMath(tree);
    finalize(tree, file);
  };
}

/** Supplied inline TeX stays editable as $...$ in Tina's Markdown fields. */
function renderInlineMath(node) {
  if (!node.children || ['code', 'inlineCode', 'html'].includes(node.type)) return;
  const children = [];
  for (const child of node.children) {
    if (child.type !== 'text') { renderInlineMath(child); children.push(child); continue; }
    const value = child.value; const regex = /\$([^$\n]+)\$/g;
    let at = 0; let match;
    while ((match = regex.exec(value))) {
      children.push(text(value.slice(at, match.index)));
      // Manuscripts use ascr#18/ascr#3 inside math; # is literal notation here.
      const formula = match[1].replace(/(?<!\\)#/g, '\\#');
      children.push(raw(katex.renderToString(formula, { throwOnError: false, output: 'htmlAndMathml' })));
      at = regex.lastIndex;
    }
    children.push(text(value.slice(at)));
  }
  node.children = children;
}

/* ---------------------------------------------------------------- helpers */

const el = (tagName, props, children = []) => ({ type: 'wikiElement', data: { hName: tagName, hProperties: props }, children });
const raw = (value) => ({ type: 'html', value });
const text = (value) => ({ type: 'text', value });

function eachNode(node, fn, parent = null) {
  fn(node, parent);
  if (node.children) for (const child of node.children) eachNode(child, fn, node);
}

export function toText(node) {
  if (!node) return '';
  if (typeof node.value === 'string' && (node.type === 'text' || node.type === 'inlineCode')) return node.value;
  return (node.children || []).map(toText).join('');
}

function escAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function warn(ctx, message, node) {
  try { ctx.file?.message?.(`[wiki] ${message}`, node); } catch { /* reporting only */ }
}

function mergeText(nodes) {
  const out = [];
  for (const n of nodes) {
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text' && n.type === 'text' && !prev.data && !n.data) prev.value += n.value;
    else out.push(n);
  }
  return out;
}

/* ------------------------------------------- 1. stray directives → text */

function directiveAsText(node) {
  const colons = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::';
  const out = [text(colons + node.name)];
  const kids = (node.children || []).filter((c) => !(c.data && c.data.directiveLabel));
  if (node.type !== 'containerDirective' && kids.length) out.push(text('['), ...kids, text(']'));
  const attrs = node.attributes || {};
  const keys = Object.keys(attrs);
  if (keys.length) out.push(text('{' + keys.map((k) => (attrs[k] === '' ? k : `${k}="${attrs[k]}"`)).join(' ') + '}'));
  return out;
}

function restoreDirectives(node, ctx) {
  if (!node.children) return;
  let changed = false;
  const out = [];
  for (const child of node.children) {
    restoreDirectives(child, ctx);
    if (child.type === 'textDirective') {
      out.push(...directiveAsText(child)); changed = true;
    } else if (child.type === 'leafDirective' && !LEAVES.has(child.name)) {
      warn(ctx, `Unknown block "::${child.name}" was shown as text.`, child);
      out.push({ type: 'paragraph', children: directiveAsText(child) }); changed = true;
    } else if (child.type === 'containerDirective' && !CONTAINERS.has(child.name)) {
      warn(ctx, `Unknown block ":::${child.name}" was unwrapped.`, child);
      out.push(...child.children.filter((c) => !(c.data && c.data.directiveLabel))); changed = true;
    } else {
      out.push(child);
    }
  }
  if (changed) node.children = mergeText(out);
}

/* ------------------------------------ 2. `## Heading {#id toc="Label"}` */

const ATTR_TOKEN = /\s*(?:#([\w:.-]+)|\.([\w-]+)|([A-Za-z_][\w-]*)(?:\s*=\s*(?:"([^"]*)"|“([^”]*)”|'([^']*)'|‘([^’]*)’|([^\s"'“”‘’{}]+)))?)\s*/y;

export function parseAttributes(src) {
  const out = { id: null, classes: [], attrs: {} };
  let pos = 0;
  while (pos < src.length) {
    ATTR_TOKEN.lastIndex = pos;
    const m = ATTR_TOKEN.exec(src);
    if (!m || m[0].length === 0) return null;
    if (m[1]) out.id = m[1];
    else if (m[2]) out.classes.push(m[2]);
    else if (m[3]) out.attrs[m[3]] = m[4] ?? m[5] ?? m[6] ?? m[7] ?? m[8] ?? '';
    pos = ATTR_TOKEN.lastIndex;
  }
  if (!out.id && !out.classes.length && !Object.keys(out.attrs).length) return null;
  return out;
}

function readHeadingAttributes(node) {
  const last = node.children[node.children.length - 1];
  if (!last || last.type !== 'text') return;
  const m = last.value.match(/\s*\{([^{}]*)\}\s*$/);
  if (!m) return;
  const parsed = parseAttributes(m[1]);
  if (!parsed) return;
  last.value = last.value.slice(0, m.index).replace(/\s+$/, '');
  if (!last.value) node.children.pop();
  node.data = node.data || {};
  const props = (node.data.hProperties = { ...(node.data.hProperties || {}) });
  if (parsed.id) props.id = parsed.id;
  if (parsed.classes.length) props.className = [...(props.className || []), ...parsed.classes];
  node.data.wiki = parsed.attrs;
}

const attrsOf = (heading) => (heading && heading.data && heading.data.wiki) || {};

/* ------------------------------------------------------ 3. :::blocks */

function transformBlocks(node, ctx) {
  if (!node.children) return;
  const out = [];
  for (const child of node.children) {
    transformBlocks(child, ctx);
    if (child.type === 'containerDirective' || child.type === 'leafDirective') out.push(...renderBlock(child, ctx));
    else out.push(child);
  }
  node.children = out;
}

function takeLabel(node) {
  if (node.type === 'leafDirective') {
    return { label: node.children && node.children.length ? { children: node.children } : null, rest: [] };
  }
  let label = null;
  const rest = [];
  for (const c of node.children || []) {
    if (!label && c.data && c.data.directiveLabel) label = c;
    else rest.push(c);
  }
  return { label, rest };
}

function splitByHeading(children) {
  const depths = children.filter((c) => c.type === 'heading').map((c) => c.depth);
  if (!depths.length) return { lead: children, items: null };
  const depth = Math.min(...depths);
  const lead = [];
  const items = [];
  let current = null;
  for (const c of children) {
    if (c.type === 'heading' && c.depth === depth) { current = { heading: c, body: [] }; items.push(current); }
    else if (current) current.body.push(c);
    else lead.push(c);
  }
  return { lead, items };
}

function linkify(heading, href) {
  heading.children = [{
    type: 'link', url: href, title: null, children: heading.children,
    data: { hProperties: { className: ['stretched-link'] } },
  }];
}

function renderBlock(node, ctx) {
  const name = node.name;
  if (name in CALLOUT_TYPES || name === 'callout') return callout(node);
  switch (name) {
    case 'cards': case 'cols': return cards(node, ctx);
    case 'timeline': return timeline(node);
    case 'features': return features(node);
    case 'stats': return stats(node);
    case 'refs': return [el('div', { className: ['refs'] }, takeLabel(node).rest)];
    case 'lead': return [el('div', { className: ['lead'] }, takeLabel(node).rest)];
    case 'figure': return figure(node, ctx);
    case 'figuretext': return figureText(node);
    case 'details': return details(node);
    case 'people': return people(node);
    default: return takeLabel(node).rest;
  }
}

function callout(node) {
  const a = node.attributes || {};
  const type = CALLOUT_TYPES[node.name === 'callout' ? String(a.type || 'note') : node.name] || 'note';
  const { label, rest } = takeLabel(node);
  const title = label ? label.children : a.title ? [text(a.title)] : null;
  const body = [];
  if (title && title.length) body.push(el('p', { className: ['callout__title'] }, title));
  body.push(...rest);
  return [el('div', { className: ['callout', `callout--${type}`], role: 'note' }, [
    raw(`<span class="callout__icon" aria-hidden="true">${CALLOUT_ICONS[type]}</span>`),
    el('div', { className: ['callout__body'] }, body),
  ])];
}

function cards(node, ctx) {
  const a = node.attributes || {};
  const cols = Math.max(0, Math.min(4, parseInt(a.cols, 10) || 0));
  const cls = ['cards'];
  if (cols) cls.push(`cards--${cols}`);
  if (node.name === 'cols') cls.push('cards--plain');
  const { rest } = takeLabel(node);
  const { lead, items } = splitByHeading(rest);
  if (!items) return [el('div', { className: cls }, rest.map((b) => el('div', { className: ['card'] }, [b])))];
  const list = items.map(({ heading, body }) => {
    const ha = attrsOf(heading);
    const kids = [];
    if (ha.icon) {
      const svg = iconSvg(ha.icon);
      if (svg) kids.push(raw(`<span class="card__icon" aria-hidden="true">${svg}</span>`));
      else warn(ctx, `Unknown icon "${ha.icon}" (see src/lib/icons.mjs).`, heading);
    }
    if (ha.href) linkify(heading, ha.href);
    kids.push(heading, ...body);
    const c = ['card'];
    if (ha.href) c.push('card--link');
    return el('div', { className: c }, kids);
  });
  return [...lead, el('div', { className: cls }, list)];
}

function timeline(node) {
  const { rest } = takeLabel(node);
  const { lead, items } = splitByHeading(rest);
  if (!items) return [el('div', { className: ['timeline'] }, rest)];
  return [...lead, el('ol', { className: ['timeline'] }, items.map(({ heading, body }) => {
    const ha = attrsOf(heading);
    const kids = [];
    if (ha.when) kids.push(el('p', { className: ['timeline__when'] }, [text(ha.when)]));
    kids.push(heading, ...body);
    return el('li', { className: ['timeline__item'] }, kids);
  }))];
}

function features(node) {
  const { rest } = takeLabel(node);
  const { lead, items } = splitByHeading(rest);
  if (!items) return [el('div', { className: ['features'] }, rest)];
  return [...lead, el('div', { className: ['features'] }, items.map(({ heading, body }) => {
    const ha = attrsOf(heading);
    const kids = [];
    if (ha.idx) kids.push(el('span', { className: ['feature__idx'], 'aria-hidden': 'true' }, [text(ha.idx)]));
    if (ha.href) linkify(heading, ha.href);
    kids.push(el('div', { className: ['feature__main'] }, [heading, ...body]));
    if (ha.href) kids.push(raw(`<span class="feature__go" aria-hidden="true">${UI_ICONS.arrowUpRight}</span>`));
    return el('div', { className: ha.href ? ['feature', 'feature--link'] : ['feature'] }, kids);
  }))];
}

function stats(node) {
  const { rest } = takeLabel(node);
  const { lead, items } = splitByHeading(rest);
  if (!items) return [el('div', { className: ['stats'] }, rest)];
  return [...lead, el('div', { className: ['stats'] }, items.map(({ heading, body }) => el('div', { className: ['stat'] }, [
    el('p', { className: ['stat__num'] }, heading.children),
    ...body.map((b) => (b.type === 'paragraph' ? el('p', { className: ['stat__label'] }, b.children) : b)),
  ])))];
}

function readFigure(name, ctx, node) {
  if (!/^[\w-]+$/.test(name)) {
    warn(ctx, `Figure name "${name}" may only use letters, digits, - and _.`, node);
    return `<p class="figure__missing">Figure name not valid: ${escAttr(name)}</p>`;
  }
  try {
    return fs.readFileSync(path.join(ctx.figureDir, `${name}.svg`), 'utf8')
      .replace(/<\?xml[^>]*>\s*/i, '').replace(/<!DOCTYPE[^>]*>\s*/i, '').trim();
  } catch {
    warn(ctx, `Figure file not found: src/figures/${name}.svg`, node);
    return `<p class="figure__missing">Figure file not found: src/figures/${escAttr(name)}.svg</p>`;
  }
}

function figureText(node) {
  const attrs = node.attributes || {};
  const side = attrs.side === 'right' ? 'right' : 'left';
  const width = ['narrow', 'medium', 'wide'].includes(attrs.width) ? attrs.width : 'medium';
  const children = takeLabel(node).rest;
  const imageAt = children.findIndex((child) => child.data?.hName === 'figure');
  if (imageAt === -1) return children;
  const figure = children[imageAt];
  const body = children.filter((_, i) => i !== imageAt);
  return [el('div', { className: ['figure-text', `figure-text--${side}`, `figure-text--${width}`] }, [
    figure, el('div', { className: ['figure-text__body'] }, body),
  ])];
}

function figure(node, ctx) {
  const a = node.attributes || {};
  const { label, rest } = takeLabel(node);
  const media = [];
  if (a.svg) media.push(raw(readFigure(a.svg, ctx, node)));
  if (a.src) {
    const size = (a.width ? ` width="${escAttr(a.width)}"` : '') + (a.height ? ` height="${escAttr(a.height)}"` : '');
    media.push(raw(`<img src="${escAttr(a.src)}" alt="${escAttr(a.alt || '')}"${size} loading="lazy" decoding="async">`));
  }
  const body = [...rest];
  let caption = label ? [...label.children] : null;
  const last = body[body.length - 1];
  if (!caption && last && last.type === 'paragraph' && (media.length > 0 || body.length > 1)) caption = body.pop().children;
  if (!caption && a.caption) caption = [text(a.caption)];
  media.push(...body);
  const kids = [el('div', { className: ['figure__media'] }, media)];
  if (caption || a.credit) {
    const cap = caption ? [...caption] : [];
    if (a.credit) cap.push(el('span', { className: ['figure__credit'] }, [text(a.credit)]));
    kids.push(el('figcaption', {}, cap));
  }
  const cls = ['figure'];
  if ('wide' in a) cls.push('figure--wide');
  return [el('figure', { className: cls }, kids)];
}

function details(node) {
  const a = node.attributes || {};
  const { label, rest } = takeLabel(node);
  const summary = el('summary', {}, label ? label.children : [text(a.summary || 'Details')]);
  const props = { className: ['details'] };
  if ('open' in a) props.open = true;
  return [el('details', props, [summary, el('div', { className: ['details__body'] }, rest)])];
}

function initials(name) {
  const words = name.match(/[\p{L}\p{N}]+/gu) || [];
  return (words.slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase();
}

function people(node) {
  const { rest } = takeLabel(node);
  const { lead, items } = splitByHeading(rest);
  if (!items) return [el('div', { className: ['people'] }, rest)];
  return [...lead, el('div', { className: ['people'] }, items.map(({ heading, body }) => {
    const ha = attrsOf(heading);
    const photo = ha.img
      ? raw(`<img class="person__photo" src="${escAttr(ha.img)}" alt="" loading="lazy" decoding="async">`)
      : raw(`<span class="person__photo person__photo--empty" aria-hidden="true">${escAttr(initials(toText(heading)))}</span>`);
    const info = [heading];
    if (ha.role) info.push(el('p', { className: ['person__role'] }, [text(ha.role)]));
    info.push(...body);
    return el('div', { className: ['person'] }, [photo, el('div', { className: ['person__info'] }, info)]);
  }))];
}

/* ------------------------------------------------ 4. tables and images */

const pngSizes = new Map();
let cdnImageSizes;
function localPngSize(url) {
  if (typeof url === 'string' && url.startsWith('https://static.igem.wiki/')) {
    if (!cdnImageSizes) {
      try {
        const records = JSON.parse(fs.readFileSync(path.resolve('content/cdn-assets.json'), 'utf8')).assets;
        cdnImageSizes = new Map(records.filter((entry) => entry.dimensions).map((entry) => [entry.cdn_url, entry.dimensions]));
      } catch { cdnImageSizes = new Map(); }
    }
    return cdnImageSizes.get(url) || {};
  }
  if (typeof url !== 'string' || !url.startsWith('/img/') || !/\.(png|jpe?g)$/i.test(url)) return {};
  const root = path.resolve(process.cwd(), 'static');
  const filename = path.resolve(root, `.${url}`);
  if (!filename.startsWith(root + path.sep)) return {};
  try {
    const stamp = fs.statSync(filename).mtimeMs;
    const cached = pngSizes.get(filename);
    if (cached?.stamp === stamp) return cached.size;
    const header = fs.readFileSync(filename);
    let size;
    if (header.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') {
      size = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    } else if (header[0] === 0xff && header[1] === 0xd8) {
      let at = 2;
      while (at + 8 < header.length) {
        if (header[at] !== 0xff) break;
        while (header[at] === 0xff) at++;
        const marker = header[at++];
        if (marker === 0xd9 || marker === 0xda) break;
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        const length = header.readUInt16BE(at);
        if (length < 2) break;
        if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
          size = { width: header.readUInt16BE(at + 5), height: header.readUInt16BE(at + 3) }; break;
        }
        at += length;
      }
    }
    if (!size) return {};
    pngSizes.set(filename, { stamp, size });
    return size;
  } catch { return {}; }
}

function wrapTablesAndImages(node) {
  if (!node.children) return;
  node.children = node.children.map((c) => {
    wrapTablesAndImages(c);
    if (c.type === 'image') {
      c.data = c.data || {};
      c.data.hProperties = { loading: 'lazy', decoding: 'async', ...localPngSize(c.url), ...(c.data.hProperties || {}) };
    }
    if (c.type === 'table') {
      return el('div', { className: ['table-wrap'], tabindex: '0', role: 'region', 'aria-label': 'Table (scrolls sideways)' }, [c]);
    }
    return c;
  });
}

/* ------------------------------------- 5. ids, outline and <section>s */

export function slugify(value, used) {
  const base = value.toLowerCase().trim()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, '')
    .replace(/\s/g, '-') || 'section';
  let slug = base;
  let i = 1;
  while (used.has(slug)) slug = `${base}-${i++}`;
  used.add(slug);
  return slug;
}

function finalize(tree, file) {
  const headings = [];
  eachNode(tree, (n) => { if (n.type === 'heading') headings.push(n); });

  const used = new Set();
  for (const h of headings) {
    const id = h.data && h.data.hProperties && h.data.hProperties.id;
    if (id) used.add(id);
  }
  for (const h of headings) {
    h.data = h.data || {};
    h.data.hProperties = h.data.hProperties || {};
    if (!h.data.hProperties.id) h.data.hProperties.id = slugify(toText(h), used);
  }

  const rootH2 = new Set(tree.children.filter((c) => c.type === 'heading' && c.depth === 2));
  const toc = [];
  let n = 0;
  for (const h of headings) {
    const a = attrsOf(h);
    const id = h.data.hProperties.id;
    if (h.depth === 2 && rootH2.has(h) && !('notoc' in a)) {
      n += 1;
      const num = String(n).padStart(2, '0');
      h.data.hProperties['data-num'] = num;
      h.data.tocText = a.toc || toText(h);
      toc.push({ depth: 2, id, text: h.data.tocText, num });
    } else if (h.depth >= 3 && 'toc' in a) {
      toc.push({ depth: h.depth, id, text: a.toc || toText(h) });
    }
  }

  const children = [];
  let section = null;
  for (const c of tree.children) {
    if (c.type === 'heading' && c.depth === 2) {
      const props = { className: ['doc-section'], 'aria-labelledby': c.data.hProperties.id };
      if (c.data.hProperties['data-num']) props['data-num'] = c.data.hProperties['data-num'];
      if (c.data.tocText) props['data-nav-label'] = c.data.tocText;
      section = el('section', props, [c]);
      children.push(section);
    } else if (section) {
      section.children.push(c);
    } else {
      children.push(c);
    }
  }
  tree.children = children;

  file.data = file.data || {};
  const astro = (file.data.astro = file.data.astro || {});
  astro.frontmatter = astro.frontmatter || {};
  astro.frontmatter.toc = toc;
  file.data.wikiToc = toc;
}
