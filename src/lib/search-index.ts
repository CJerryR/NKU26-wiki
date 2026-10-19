/** Canonical search entries shared by the index endpoint and its cache key. */
import { pagePath, type PageEntry } from './pages';
import { homeSearchEntry } from './home';
import { markdownToText, sectionsFromMarkdown, stripMd } from './text';

export function buildSearchIndex(pages: PageEntry[]) {
  const entries = [homeSearchEntry(pages)];
  for (const page of pages) {
    // Historical originals remain directly accessible, but are not search results.
    if (page.id === 'source-archive' || page.data.route === 'source-archive' || page.data.hidden || !page.data.search) continue;
    const url = pagePath(page);
    const body = page.body ?? '';
    const title = page.data.title;
    const desc = stripMd(page.data.sub ?? '');
    const crumbs = ['Home', ...page.data.crumbs];
    entries.push({
      title,
      url,
      crumbs,
      desc,
      text: [title, desc, ...crumbs, markdownToText(body)].join(' ').replace(/\s+/g, ' ').trim(),
      sections: sectionsFromMarkdown(body).map((s) => ({ ...s, url: `${url}#${s.id}` })),
    });
  }
  return entries;
}
