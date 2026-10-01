import { requestWithMetadata } from '@tinacms/astro';
import client from '../../../tina/__generated__/client';

export function loadWiki(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Invalid page name');
  return requestWithMetadata(client.queries.wiki({ relativePath: `${slug}.json` }), { priority: 'primary' });
}
