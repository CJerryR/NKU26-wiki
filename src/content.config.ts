import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One Markdown file per page in src/content/pages. The file name is the page
 * id (used by the navigation in src/data/nav.ts); `route` gives the page an
 * iGEM standard address such as /model/, otherwise it is pages/<id>.html.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    heading: z.string().optional(),
    sub: z.string().optional(),
    description: z.string().optional(),
    crumbs: z.array(z.string()).default([]),
    route: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'route: lowercase letters, digits and - only').optional(),
    meta: z.record(z.string(), z.coerce.string()).default({}),
    hidden: z.boolean().default(false),
    draft: z.boolean().default(false),
    search: z.boolean().default(true),
  }),
});

export const collections = { pages };
