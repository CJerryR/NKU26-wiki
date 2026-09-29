/**
 * Search index, written to js/search-data.js in the same format as v6
 * (window.NKU_SEARCH_INDEX), so the homepage's own search keeps working and
 * inner pages load the same file the first time search is opened.
 */
import type { APIRoute } from 'astro';
import { getPages, pagePath } from '../../lib/pages';
import { homeSearchEntry } from '../../lib/home';
import { markdownToText, sectionsFromMarkdown, stripMd } from '../../lib/text';

export const GET: APIRoute = async () => {
  const pages = await getPages();
  const entries = [homeSearchEntry(pages)];
  for (const page of pages) {
    if (page.data.hidden || !page.data.search) continue;
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
  const js = `window.NKU_SEARCH_INDEX = ${JSON.stringify(entries, null, 2)};\n`;
  return new Response(js, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
