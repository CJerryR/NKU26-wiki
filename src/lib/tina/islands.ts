import EditableArticle from '../../components/page/EditableArticle.astro';
import { loadWiki } from './data';
import { toEntry } from '../editor-content.mjs';

export const islands = {
  wiki: {
    fetch: (_request, params) => loadWiki(params.get('slug') || ''),
    component: EditableArticle,
    wrapper: { tag: 'div', className: 'wiki-editor-content' },
    propsFromData: (result, params) => ({ entry: toEntry(params.get('slug'), result.data.wiki), document: result.data.wiki }),
  },
};
