/**
 * The story homepage is kept exactly as in v6: its sections are plain HTML in
 * src/home/sections and its scripts and styles live in static/. This module
 * only stitches the sections together and fills in page links.
 */
import fs from 'node:fs';
import path from 'node:path';
import homeJson from '../data/home.json';
import { site } from '../data/site';
import { byId, pagePath, type PageEntry } from './pages';
import { escapeHtml, htmlToText } from './text';

const HOME_DIR = path.resolve(process.cwd(), 'src/home');
export const HOME_SECTIONS = ['opening', 'world', 'china', 'threat', 'traces', 'combo', 'signal', 'hp', 'loop', 'built', 'explore'];
export const HOME_DESCRIPTION = 'NemaKlear by NKU26-China explores how engineered yeast could translate nematode chemical clues into an early risk signal. Follow the trail from soil to science.';

const read = (rel: string) => fs.readFileSync(path.join(HOME_DIR, rel), 'utf8');

type HomeLink = { source: string; label: string; status: string; url?: string };
type HomeData = { project: Record<string, string>; links: Record<string, HomeLink> };

export function homeData(pages: PageEntry[]): HomeData {
  const ids = byId(pages);
  const data = structuredClone(homeJson) as HomeData;
  for (const [key, item] of Object.entries(data.links)) {
    const entry = ids.get(item.source);
    if (!entry) throw new Error(`src/data/home.json: link "${key}" points to a missing page "${item.source}"`);
    item.url = pagePath(entry);
  }
  return data;
}

export function homeBody(pages: PageEntry[]): string {
  const links = homeData(pages).links;
  return HOME_SECTIONS.map((name) => read(`sections/${name}.html`)).join('\n')
    .replace(/\{\{HOME_URL:([a-z-]+)\}\}/g, (_m, key: string) => {
      const link = links[key];
      if (!link || !link.url) throw new Error(`Homepage section uses an unknown link key "${key}"`);
      return escapeHtml(link.url);
    })
    .replace(/\{\{P\}\}/g, '');
}

export function sponsorStrip(): string {
  if (!site.sponsors.length) return '';
  const badges = site.sponsors.map((s) => {
    const body = `<span class="sponsor-badge__name">${escapeHtml(s.name)}</span><i class="sponsor-badge__dot" aria-hidden="true"></i>`;
    const url = site.safeUrl(s.url);
    return url ? `<a class="sponsor-badge" href="${escapeHtml(url)}">${body}</a>` : `<span class="sponsor-badge">${body}</span>`;
  }).join('');
  return `<section class="sponsor-strip" aria-label="Sponsors"><span class="sr-only">Sponsors</span><div class="sponsor-strip__marquee"><div class="sponsor-strip__track"><div class="sponsor-strip__set">${badges}</div><div class="sponsor-strip__set" aria-hidden="true">${badges}</div></div></div></section>`;
}

export function homeFooter(): string {
  return read('sections/footer.html')
    .replace('{{GLOBAL_SPONSOR_STRIP}}', sponsorStrip())
    .replace(/\{\{SOURCE_REPOSITORY_URL\}\}/g, escapeHtml(site.repository))
    .replace(/\{\{P\}\}/g, '');
}

export function mascotHtml(): string {
  return read('mascot.html').replace(/\{\{P\}\}/g, '');
}

/** Search entry for the homepage, in the v6 index format. */
export function homeSearchEntry(pages: PageEntry[]) {
  const body = homeBody(pages);
  const sections: { id: string; title: string; text: string; url: string }[] = [];
  const re = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const id = (m[1].match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const toc = (m[1].match(/\bdata-toc="([^"]+)"/) || [])[1];
    const h = m[2].match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const title = htmlToText(toc || (h ? h[1] : '') || id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    sections.push({ id, title, text: htmlToText(m[2]), url: `index.html#${id}` });
  }
  return {
    title: site.title,
    url: 'index.html',
    crumbs: ['Home'],
    desc: HOME_DESCRIPTION,
    text: `${site.title} ${HOME_DESCRIPTION} Home ${htmlToText(body)}`.replace(/\s+/g, ' ').trim(),
    sections,
  };
}
