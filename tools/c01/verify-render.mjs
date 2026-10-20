/**
 * C01: render the source and the candidate results.json through the site's own Markdown
 * pipeline pieces (editor-content.mjs → remark-directive → remark-wiki.mjs) and compare what a
 * reader gets: visible text, image addresses, heading ids, outline (TOC) and wiki warnings.
 *
 *   node tools/c01/verify-render.mjs <source results.json> <candidate results.json> [--write <dir>]
 *
 * Needs the repository's node_modules (unified, remark-parse, remark-directive, katex). The
 * HTML writer below stands in for remark-rehype + rehype-raw: raw HTML passes through as-is.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { blocksToMarkdown } = await import(path.join(root, 'src/lib/editor-content.mjs'));
const { default: remarkWiki } = await import(path.join(root, 'src/lib/remark-wiki.mjs'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attrs = (p = {}) => Object.entries(p).map(([k, v]) => (v === false || v == null ? '' : v === true ? ` ${k === 'className' ? 'class' : k}`
  : ` ${k === 'className' ? 'class' : k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}="${esc(Array.isArray(v) ? v.join(' ') : v).replace(/"/g, '&quot;')}"`)).join('');
const tag = (t, p, inner) => (t === 'img' ? `<img${attrs(p)}>` : `<${t}${attrs(p)}>${inner}</${t}>`);
const kids = (n) => (n.children || []).map(toHtml).join('');
export function toHtml(n) {
  const d = n.data || {}; const hp = d.hProperties || {};
  switch (n.type) {
    case 'root': return kids(n);
    case 'html': return n.value;
    case 'text': return esc(n.value);
    case 'paragraph': return tag(d.hName || 'p', hp, kids(n));
    case 'heading': return tag(`h${n.depth}`, hp, kids(n));
    case 'strong': return tag('strong', hp, kids(n));
    case 'emphasis': return tag('em', hp, kids(n));
    case 'inlineCode': return tag('code', hp, esc(n.value));
    case 'break': return '<br>';
    case 'thematicBreak': return '<hr>';
    case 'link': return tag('a', { href: n.url, ...(n.title ? { title: n.title } : {}), ...hp }, kids(n));
    case 'image': return tag('img', { src: n.url, alt: n.alt || '', ...hp }, '');
    case 'list': return tag(n.ordered ? 'ol' : 'ul', hp, kids(n));
    case 'listItem': return tag('li', hp, kids(n));
    case 'blockquote': return tag('blockquote', hp, kids(n));
    case 'code': return `<pre><code>${esc(n.value)}</code></pre>`;
    default: if (d.hName) return tag(d.hName, hp, kids(n)); throw new Error(`unhandled node ${n.type} ${n.name || ''}`);
  }
}
export async function renderPage(json) {
  const markdown = blocksToMarkdown(json.blocks);
  const warnings = [];
  const file = { data: { astro: { frontmatter: { preserveAuthorFormatting: json.preserveAuthorFormatting === true } } }, message: (m) => warnings.push(String(m)) };
  const proc = unified().use(remarkParse).use(remarkDirective).use(remarkWiki, { figureDir: path.join(root, 'src/figures') });
  const tree = await proc.run(proc.parse(markdown), file);
  return { markdown, html: toHtml(tree), toc: file.data.wikiToc, warnings };
}
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const visible = (h) => decode(h.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const images = (h) => [...h.matchAll(/<img\b[^>]*\bsrc="([^"]*)"/g)].map((m) => decode(m[1]));
const ids = (h) => [...h.matchAll(/<h[1-6]\b[^>]*\bid="([^"]*)"/g)].map((m) => m[1]);
const dbtl3 = (h) => h.slice(h.indexOf('id="dbtl-3-'));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [srcPath, candPath] = process.argv.slice(2);
  const out = process.argv.includes('--write') ? process.argv[process.argv.indexOf('--write') + 1] : null;
  const [a, b] = await Promise.all([srcPath, candPath].map((p) => renderPage(JSON.parse(fs.readFileSync(p, 'utf8')))));
  let ok = true;
  const check = (name, cond, detail = '') => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${!cond && detail ? ' — ' + detail : ''}`); ok &&= cond; };
  check('whole page: visible text identical', visible(a.html) === visible(b.html), `${visible(a.html).length} vs ${visible(b.html).length} chars`);
  check(`DBTL-3: visible text identical (${visible(dbtl3(a.html)).length} chars)`, visible(dbtl3(a.html)) === visible(dbtl3(b.html)));
  check(`image addresses identical and in order (${images(a.html).length})`, JSON.stringify(images(a.html)) === JSON.stringify(images(b.html)));
  check(`heading ids identical and in order (${ids(a.html).length})`, JSON.stringify(ids(a.html)) === JSON.stringify(ids(b.html)));
  check(`outline (TOC) identical (${a.toc.length} entries)`, JSON.stringify(a.toc) === JSON.stringify(b.toc));
  check('no new remark-wiki warnings', JSON.stringify(a.warnings) === JSON.stringify(b.warnings), b.warnings.join('; '));
  const count = (h, re) => (h.match(re) || []).length;
  console.log(`     candidate DBTL-3: ${count(b.html, /class="evidence /g)} evidence blocks, ${count(b.html, /class="dbtl-stage /g)} stage groups, ${count(b.html, /class="dbtl-phase /g)} stage markers, ${count(dbtl3(b.html), /<figcaption/g)} figcaptions`);
  if (out) {
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'source.html'), a.html); fs.writeFileSync(path.join(out, 'candidate.html'), b.html);
    fs.writeFileSync(path.join(out, 'source.md'), a.markdown); fs.writeFileSync(path.join(out, 'candidate.md'), b.markdown);
  }
  process.exit(ok ? 0 : 1);
}
