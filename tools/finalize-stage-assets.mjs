// Trace page dependencies before pruning build output; retain required local assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const MEDIA = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|pfb|pdf|mp4|webm|mp3|wav|pdb|cif|csv|gltf|glb|stl|vtt)$/i;
const TEXT = /\.(?:html|css|js|mjs|json)$/i;
const decode = (s) => s.replace(/&quot;|&#34;|&#x22;/gi, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
async function walk(dir, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(dir, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}
export async function finalizeAssets(directory = 'public') {
  const root = path.resolve(directory), files = await walk(root), all = new Set(files), cache = new Map();
  async function read(file) {
    if (!cache.has(file)) cache.set(file, await fs.readFile(path.join(root, file), 'utf8'));
    return cache.get(file);
  }
  const pages = files.filter((f) => f.endsWith('.html') && !f.startsWith('widgets/'));
  const sources = await Promise.all(pages.map(read));
  // Lazy toolkit paths in JS cannot activate when pages have no component instances.
  const widgetRuntime = sources.some((s) => /<wiki-toolkit\b/i.test(s) || /(?:src|href)\s*=\s*["'][^"']*\bwidgets\//i.test(s));
  const reachable = new Set(), queue = [...pages];
  function resolveReference(raw, from) {
    let value = decode(raw).trim().replace(/^(?:\$\{[^}]+\})+/, '');
    if (!value || value.length > 1024 || /[\r\n{}<>]/.test(value) || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return [];
    value = value.split(/[?#]/)[0];
    try { value = decodeURIComponent(value); } catch { return []; }
    const candidates = value.startsWith('/') ? [value.slice(1)] : [path.posix.join(path.posix.dirname(from), value), value];
    for (const candidate of candidates) {
      const target = path.posix.normalize(candidate);
      if (target.startsWith('../') || target === '..' || (target.startsWith('widgets/') && !widgetRuntime)) continue;
      if (all.has(target)) return [target];
      if (all.has(path.posix.join(target, 'index.html'))) return [path.posix.join(target, 'index.html')];
      // Keep explicit runtime directories used to construct filenames, not data-root ../.
      if (target !== '.' && value.includes('/') && /[a-z0-9]/i.test(target)) {
        const children = files.filter((f) => f.startsWith(target.replace(/\/$/, '') + '/'));
        if (children.length) return children;
      }
    }
    return [];
  }
  function add(raw, from) {
    queue.push(...resolveReference(raw, from));
    // Viewer URLs encode their model/document URL in a query parameter.
    const at = raw.indexOf('?');
    if (at >= 0) {
      const params = new URLSearchParams(decode(raw.slice(at + 1)));
      for (const key of ['src', 'file', 'worker']) {
        const value = params.get(key);
        if (value) queue.push(...resolveReference(value, from));
      }
    }
  }
  function props(value, from) {
    if (typeof value === 'string') add(value, from);
    else if (Array.isArray(value)) value.forEach((v) => props(v, from));
    else if (value && typeof value === 'object') Object.values(value).forEach((v) => props(v, from));
  }
  while (queue.length) {
    const file = queue.pop();
    if (reachable.has(file)) continue;
    reachable.add(file);
    if (!TEXT.test(file)) continue;
    const source = await read(file);
    for (const m of source.matchAll(/\b(?:src|href|poster|data-src)\s*=\s*(["'])(.*?)\1/gi)) add(m[2], file);
    for (const m of source.matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/gi)) for (const item of m[2].split(',')) add(item.trim().split(/\s+/)[0], file);
    for (const m of source.matchAll(/url\(\s*(?:(["'])(.*?)\1|([^)]*))\s*\)/gi)) add(m[1] ? m[2] : m[3], file);
    for (const m of source.matchAll(/@import\s+(["'])(.*?)\1/gi)) add(m[2], file);
    for (const m of source.matchAll(/\bdata-props\s*=\s*(["'])(.*?)\1/gi)) {
      try { props(JSON.parse(decode(m[2])), file); } catch { /* render code reports invalid props */ }
    }
    if (/\.(?:js|mjs|json)$/i.test(file)) {
      // Imports, workers, asset('/...'), and prefix + 'img/...' literals.
      for (const m of source.matchAll(/(["'`])([^"'`\r\n]+)\1/g)) add(m[2], file);
    }
  }
  // Preserve notices beside any active viewer libraries.
  if ([...reachable].some((f) => f.startsWith('widgets/'))) files.filter((f) => f.startsWith('widgets/') && /license|copyright|ofl/i.test(path.posix.basename(f))).forEach((f) => reachable.add(f));
  const removed = files.filter((f) => !reachable.has(f) && (MEDIA.test(f) || f.startsWith('widgets/')));
  await Promise.all(removed.map((f) => fs.unlink(path.join(root, f))));
  // Byte-verified resources served from the explicit official CDN mapping.
  const mappingPath=path.resolve('content/nemaklear-cdn.json');
  if (await fs.stat(mappingPath).then(()=>true,()=>false)) {
    const mapping=JSON.parse(await fs.readFile(mappingPath,'utf8'));
    for(const file of Object.keys(mapping))await fs.unlink(path.join(root,file)).catch(e=>{if(e.code!=='ENOENT')throw e;});
  }
  return { removed: removed.length, keptMedia: files.filter((f) => MEDIA.test(f) && reachable.has(f)), widgetRuntime };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await finalizeAssets();
  console.log(`Asset dependency check: ${r.removed} unused files removed; ${r.keptMedia.length} required local media retained; widget runtime ${r.widgetRuntime ? 'active' : 'unused'}.`);
}
