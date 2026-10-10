import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { toEntry } from '../src/lib/editor-content.mjs';
for (const name of await fs.readdir('content/wiki')) {
  if (!name.endsWith('.json')) continue;
  const doc = JSON.parse(await fs.readFile(`content/wiki/${name}`, 'utf8'));
  const entry = toEntry(name.slice(0, -5), doc);
  await fs.writeFile(`src/content/pages/${entry.id}.md`, matter.stringify(entry.body, entry.data));
}
console.log('Exported Tina content to Markdown for static build and content audit.');
