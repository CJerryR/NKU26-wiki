import siteJson from './site.json';

export interface FooterItem { name: string; url?: string; note?: string }

const json = siteJson as { source_repository_url?: string; sponsors?: FooterItem[]; friends?: FooterItem[] };

function safeUrl(url?: string): string {
  const u = String(url ?? '').trim();
  if (!u || u === '#' || /^(javascript|data):/i.test(u)) return '';
  return u;
}

export const site = {
  title: 'NKU iGEM 2026',
  team: 'NKU-iGEM 2026 Team',
  description: 'NKU iGEM 2026 - a synthetic-biology sensing concept for plant-parasitic nematode-associated signals, under investigation.',
  teamPage: 'https://teams.igem.org/6303',
  /** GitLab CI provides CI_PROJECT_URL; otherwise _data → src/data/site.json. */
  repository: safeUrl(process.env.CI_PROJECT_URL || process.env.IGEM_SOURCE_REPOSITORY || json.source_repository_url),
  sponsors: (json.sponsors ?? []).filter((s) => s && s.name),
  friends: (json.friends ?? []).filter((s) => s && s.name),
  safeUrl,
};
