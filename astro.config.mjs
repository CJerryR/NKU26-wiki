// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkWiki from './src/lib/remark-wiki.mjs';
import relativeLinks from './integrations/relative-links.mjs';
import tina from '@tinacms/astro/integration';
import node from '@astrojs/node';
import sirv from 'sirv';
import compactScripts from './integrations/compact-scripts.mjs';

const editor = process.env.TINA_EDITOR === '1';

export default defineConfig({
  ...(editor ? { adapter: node({ mode: 'standalone' }) } : {}),
  // Files copied to the site untouched: the story homepage's scripts and
  // styles (static/css, static/js), images and fonts.
  publicDir: './static',
  // iGEM's GitLab CI publishes whatever ends up in public/.
  outDir: './public',
  // Keeps the v6 addresses: pages/description.html, model/index.html, ...
  build: { format: 'preserve' },
  markdown: {
    remarkPlugins: [remarkDirective, remarkWiki],
    syntaxHighlight: false,
    smartypants: false,
  },
  // No `site` or `base`: every link is rewritten to a relative one after the
  // build, so the same output works on iGEM, GitHub Pages and a local server.
  integrations: [relativeLinks(), compactScripts(), ...(editor ? [tina(), {
    name: 'wiki-tina-editor',
    hooks: { 'astro:server:setup': ({ server }) => {
      server.middlewares.use(sirv('.tina-static', { dev: true }));
    }, 'astro:config:setup': ({ injectRoute }) => {
      injectRoute({ pattern: '/component-showcase', entrypoint: './src/editor/toolkit-demo.astro', prerender: false });
      injectRoute({ pattern: '/edit/[slug]', entrypoint: './src/editor/preview.astro', prerender: false });
      injectRoute({ pattern: '/tina-island/[name]', entrypoint: './src/editor/island.ts', prerender: false });
    } },
  }] : [])],
  devToolbar: { enabled: false },
});
