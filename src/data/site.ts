import fs from 'node:fs';
import path from 'node:path';
import siteJson from './site.json';

export interface FooterItem { name: string; short?: string; url?: string; note?: string; logo?: string; logoAlt?: string; logoBackground?: 'dark'; logoWide?: boolean }

const json = siteJson as { source_repository_url?: string; sponsors?: FooterItem[]; friends?: FooterItem[] };

function safeUrl(url?: string): string {
  const u = String(url ?? '').trim();
  if (!u || u === '#' || /^(javascript|data):/i.test(u)) return '';
  return u;
}

/** A logo may be an official CDN address or a local file under static/
 *  (e.g. /img/sponsors/snapgene.png). A local logo is used only once its file
 *  is there, under the given name or the same name with another image type;
 *  until then the footer shows the sponsor's name, never a broken image. */
function logoUrl(url?: string): string {
  const u = safeUrl(url);
  if (!u.startsWith('/')) return u;
  const local = (p: string) => fs.existsSync(path.join(process.cwd(), 'static', p));
  if (local(u)) return u;
  const stem = u.replace(/\.[a-z0-9]+$/i, '');
  const found = ['.svg', '.png', '.webp', '.avif', '.jpg'].map((ext) => stem + ext).find(local);
  return found ?? '';
}

export const site = {
  title: 'NKU iGEM 2026',
  team: 'iGEM 2026 · Team 6303',
  description: 'NKU iGEM 2026 - a synthetic-biology sensing concept for plant-parasitic nematode-associated signals, under investigation.',
  teamPage: 'https://teams.igem.org/6303',
  /** GitLab CI provides CI_PROJECT_URL; otherwise _data → src/data/site.json. */
  repository: safeUrl(process.env.CI_PROJECT_URL || process.env.IGEM_SOURCE_REPOSITORY || json.source_repository_url),
  sponsors: (json.sponsors ?? []).filter((s) => s && s.name),
  friends: (json.friends ?? []).filter((s) => s && s.name),
  safeUrl,
  logoUrl,
};
