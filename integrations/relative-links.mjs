/**
 * Makes every site-internal URL relative after `astro build`.
 *
 * Components and Markdown write root-absolute links (/model/, /img/x.png).
 * iGEM serves the wiki under /<team>/ and GitHub Pages under /<repo>/, so the
 * finished HTML and CSS files are rewritten to ../model/, ../img/x.png, which
 * work at any address — the same property the v6 Python builder had.
 * In `astro dev` the site runs at / and nothing needs rewriting; a small
 * middleware only lets the dev server answer the .html addresses.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTR = /(\s(?:href|src|poster|action|data-root|data-src)\s*=\s*)(["'])\/(?!\/)([^"']*)\2/gi;
const SRCSET = /(\ssrcset\s*=\s*)(["'])([^"']*)\2/gi;
const CSS_URL = /url\(\s*(["']?)\/(?!\/)([^"')]*)\1\s*\)/g;

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

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

export async function relativizeDirectory(root) {
  let changed = 0;
  for (const file of await walk(root)) {
    const ext = path.extname(file);
    if (ext !== '.html' && ext !== '.css') continue;
    const depth = path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
    const src = await fs.readFile(file, 'utf8');
    const out = relativize(src, '../'.repeat(depth), { css: ext === '.css' });
    if (out !== src) { await fs.writeFile(file, out); changed += 1; }
  }
  return changed;
}

export default function relativeLinks() {
  return {
    name: 'nku-relative-links',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, _res, next) => {
          const url = req.url || '';
          const q = url.indexOf('?');
          const p = q === -1 ? url : url.slice(0, q);
          const rest = q === -1 ? '' : url.slice(q);
          if (p.endsWith('/index.html')) req.url = p.slice(0, -'index.html'.length) + rest;
          else if (/^\/pages\/[^/]+\.html$/.test(p)) req.url = p.slice(0, -'.html'.length) + rest;
          next();
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const changed = await relativizeDirectory(fileURLToPath(dir));
        logger?.info?.(`relative links written in ${changed} files`);
      },
    },
  };
}
