import { getCollection, type CollectionEntry } from 'astro:content';

export type PageEntry = CollectionEntry<'pages'>;

/** Every published page (drafts left out), in a stable order. */
export async function getPages(): Promise<PageEntry[]> {
  const all = await getCollection('pages', ({ data }) => !data.draft);
  return all.sort((a, b) => a.id.localeCompare(b.id));
}

/** Address inside the site without a leading slash: `model/` or `pages/description.html`. */
export function pagePath(entry: PageEntry): string {
  return entry.data.route ? `${entry.data.route}/` : `pages/${entry.id}.html`;
}

/** Root-absolute link to a page; made relative after the build. */
export function pageHref(entry: PageEntry): string {
  return `/${pagePath(entry)}`;
}

export function byId(pages: PageEntry[]): Map<string, PageEntry> {
  return new Map(pages.map((p) => [p.id, p]));
}
