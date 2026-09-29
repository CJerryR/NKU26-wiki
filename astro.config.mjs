// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkWiki from './src/lib/remark-wiki.mjs';
import relativeLinks from './integrations/relative-links.mjs';

export default defineConfig({
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
  integrations: [relativeLinks()],
  devToolbar: { enabled: false },
});
