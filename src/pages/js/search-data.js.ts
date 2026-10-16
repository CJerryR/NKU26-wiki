/**
 * Search index, written to js/search-data.js in the same format as v6
 * (window.NKU_SEARCH_INDEX), so the homepage's own search keeps working and
 * inner pages load the same file the first time search is opened.
 */
import type { APIRoute } from 'astro';
import { getPages } from '../../lib/pages';
import { buildSearchIndex } from '../../lib/search-index';

export const GET: APIRoute = async () => {
  const entries = buildSearchIndex(await getPages());

  const js = `window.NKU_SEARCH_INDEX = ${JSON.stringify(entries, null, 2)};\n`;
  return new Response(js, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
