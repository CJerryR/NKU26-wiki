// The locked KaTeX package provides CSS/code; fonts are served by official Uploads.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await fs.readFile('content/cdn-assets.json', 'utf8'));
const fonts = new Map(manifest.assets.map((entry) => [entry.path, entry]));
const file = 'static/widgets/vendor/katex/katex.min.css';
let css = await fs.readFile(file, 'utf8');
const replacements = new Map();
for (const match of css.matchAll(/src:([^;}]+)/g)) {
  const font = match[1].match(/url\(fonts\/([^)]*\.woff2)\)/);
  if (!font) continue;
  const source = `static/widgets/vendor/katex/fonts/${font[1]}`;
  const entry = fonts.get(source);
  if (!entry) throw new Error(`Missing official CDN mapping for ${source}`);
  const url = new URL(entry.cdn_url);
  if (url.protocol !== 'https:' || url.hostname !== 'static.igem.wiki' || url.username || url.password)
    throw new Error(`Invalid official font URL for ${source}`);
  const hash = createHash('sha256').update(await fs.readFile(source)).digest('hex');
  if (hash !== entry.source_sha256) throw new Error(`Locked font has changed: ${source}`);
  // Modern browsers support WOFF2; omit legacy font files rather than retaining local fallbacks.
  replacements.set(match[0], `src:url(${entry.cdn_url}) format("woff2")`);
}
if (replacements.size !== 20) throw new Error(`Unexpected KaTeX font declarations: ${replacements.size}`);
for (const [from, to] of replacements) css = css.replaceAll(from, to);
await fs.writeFile(file, css);
console.log(`Applied official CDN URLs to ${replacements.size} locked KaTeX font declarations.`);
