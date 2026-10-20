import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { toEntry } from '../src/lib/editor-content.mjs';
for (const name of await fs.readdir('content/wiki')) {
  if (!name.endsWith('.json')) continue;
  const doc = JSON.parse(await fs.readFile(`content/wiki/${name}`, 'utf8'));
  const entry = toEntry(name.slice(0, -5), doc);
  await fs.writeFile(`src/content/pages/${entry.id}.md`, matter.stringify(entry.body, entry.data).trimEnd() + '\n');
}
console.log('Exported Tina content to Markdown for static build and content audit.');

// Temporary comparison version: isolated source and generated collection.
await fs.mkdir('src/content/project-previews', { recursive: true });
for (const name of await fs.readdir('content/previews/project-feishu')) {
  if (!name.endsWith('.json')) continue;
  const doc = JSON.parse(await fs.readFile(`content/previews/project-feishu/${name}`, 'utf8'));
  const entry = toEntry(name.slice(0, -5), doc);
  await fs.writeFile(`src/content/project-previews/${entry.id}.md`, matter.stringify(entry.body, entry.data).trimEnd() + '\n');
}
