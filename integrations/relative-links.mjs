/**
 * Two small jobs after `astro build`:
 *
 * 1. Links to switched-off pages become plain text. The outline's optional
 *    pages wait in src/content/optional and retired pages in
 *    src/content/archive; a link to one of them (for example a card that
 *    points at the Notebook) loses its href and keeps its text, so switching
 *    a page off never breaks the build. The build log lists every such link.
 *    Moving the file back into src/content/pages brings the link back.
 *
 * 2. Every site-internal URL is made relative. Components and Markdown write
 *    root-absolute links (/model/, /img/x.png); iGEM serves the wiki under
 *    /<team>/ and GitHub Pages under /<repo>/, so the finished HTML and CSS are
 *    rewritten to ../model/, ../img/x.png, which work at any address.
 *    In `astro dev` the site runs at / and nothing needs rewriting; a small
 *    middleware only lets the dev server answer the .html addresses.
 */
import fs from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTR = /(\s(?:href|src|poster|action|data-root|data-src)\s*=\s*)(["'])\/(?!\/)([^"']*)\2/gi;
const SRCSET = /(\ssrcset\s*=\s*)(["'])([^"']*)\2/gi;
const CSS_URL = /url\(\s*(["']?)\/(?!\/)([^"')]*)\1\s*\)/g;
const LINK = /<a\b([^>]*?)\shref=(["'])(\/(?!\/)[^"'#?]*)([#?][^"']*)?\2([^>]*)>/gi;

export function relativize(source, prefix, { css = false } = {}) {
  const rel = (p) => (prefix + p) || './';
  let out = source;
  if (!css) {
    out = out.replace(ATTR, (_, attr, q, p) => `${attr}${q}${rel(p)}${q}`);
    out = out.replace(SRCSET, (_, attr, q, v) => `${attr}${q}${v.split(',').map((part) =>
      part.replace(/^(\s*)\/(?!\/)(\S*)/, (m, sp, p) => sp + rel(p))).join(',')}${q}`);
  }
  return out.replace(CSS_URL, (_, q, p) => `url(${q}${rel(p)}${q})`);
}

/** Addresses of the pages kept out of the build: address -> source file. */
export function switchedOffPages(projectRoot) {
  const off = new Map();
  for (const folder of ['optional', 'archive']) {
    const dir = path.join(projectRoot, 'src', 'content', folder);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.md')) continue;
      const fm = readFileSync(path.join(dir, name), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const route = fm?.[1].match(/^route:\s*([a-z0-9-]+)\s*$/m)?.[1];
      const file = `src/content/${folder}/${name}`;
      if (route) { off.set(`/${route}/`, file); off.set(`/${route}/index.html`, file); off.set(`/${route}`, file); }
      else off.set(`/pages/${name.slice(0, -3)}.html`, file);
    }
  }
  return off;
}

export function unlinkSwitchedOff(source, off, outRoot, found) {
  return source.replace(LINK, (m, pre, q, p, _rest, post) => {
    if (!off.has(p)) return m;
    const target = path.join(outRoot, p.endsWith('/') ? `${p}index.html` : p);
    if (existsSync(target)) return m;
    found.push(p);
    return `<a${pre} data-page-off="${p}"${post}>`;
  });
}

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

export async function relativizeDirectory(root, off = new Map()) {
  let changed = 0;
  const unlinked = [];
  for (const file of await walk(root)) {
    const ext = path.extname(file);
    if (ext !== '.html' && ext !== '.css') continue;
    const depth = path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
    const src = await fs.readFile(file, 'utf8');
    const found = [];
    const kept = ext === '.html' && off.size ? unlinkSwitchedOff(src, off, root, found) : src;
    for (const p of found) unlinked.push(`${path.relative(root, file)} -> ${p}`);
    const out = relativize(kept, '../'.repeat(depth), { css: ext === '.css' });
    if (out !== src) { await fs.writeFile(file, out); changed += 1; }
  }
  return { changed, unlinked };
}

export default function relativeLinks() {
  let projectRoot = process.cwd();
  return {
    name: 'nku-relative-links',
    hooks: {
      'astro:config:done': ({ config }) => { projectRoot = fileURLToPath(config.root); },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, _res, next) => {
          const url = req.url || '';
          const q = url.indexOf('?');
          const p = q === -1 ? url : url.slice(0, q);
          const rest = q === -1 ? '' : url.slice(q);
          if (p.startsWith('/admin/')) { next(); return; }
          if (p.endsWith('/index.html')) req.url = p.slice(0, -'index.html'.length) + rest;
          else if (/^\/pages\/[^/]+\.html$/.test(p)) req.url = p.slice(0, -'.html'.length) + rest;
          next();
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const { changed, unlinked } = await relativizeDirectory(fileURLToPath(dir), switchedOffPages(projectRoot));
        logger?.info?.(`relative links written in ${changed} files`);
        if (unlinked.length) {
          logger?.info?.(`${unlinked.length} link(s) to switched-off pages shown as plain text:`);
          for (const line of unlinked) logger?.info?.(`  ${line}`);
        }
      },
    },
  };
}
