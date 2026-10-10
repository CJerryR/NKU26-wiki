import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

await fs.mkdir('content/wiki', { recursive: true });
for (const filename of await fs.readdir('src/content/pages')) {
  if (!filename.endsWith('.md')) continue;
  const { data, content } = matter(await fs.readFile(`src/content/pages/${filename}`, 'utf8'));
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).parse(content);
  const blocks = [];
  for (const node of tree.children) {
    const source = content.slice(node.position.start.offset, node.position.end.offset);
    if (node.type === 'heading') {
      const match = source.replace(/^#+\s+/, '').match(/^(.*?)(?:\s+\{([^{}]*)\})?$/s);
      blocks.push({ _template: 'heading', text: match[1], level: node.depth, attributes: match[2] || '' });
    } else if (node.type === 'containerDirective' || node.type === 'leafDirective') {
      const label = node.children?.find((c) => c.data?.directiveLabel);
      const children = node.children?.filter((c) => !c.data?.directiveLabel) || [];
      if (children.some((c) => c.type === 'containerDirective')) throw new Error(`Nested layout in ${filename}`);
      const start = children[0]?.position.start.offset;
      const end = children.at(-1)?.position.end.offset;
      blocks.push({ _template: 'layout', kind: node.name,
        label: label ? content.slice(label.position.start.offset, label.position.end.offset).replace(/^\[|\]$/g, '') : '',
        attributes: Object.entries(node.attributes || {}).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join(' '),
        body: start === undefined ? '' : content.slice(start, end),
      });
    } else {
      const previous = blocks.at(-1);
      if (previous?._template === 'text') previous.body += '\n\n' + source;
      else blocks.push({ _template: 'text', body: source });
    }
  }
  const destination = `content/wiki/${filename.replace(/\.md$/, '.json')}`;
  await fs.writeFile(destination, JSON.stringify({ ...data, meta: Object.entries(data.meta || {}).map(([key,value]) => ({key, value: String(value)})), search: data.search !== false, blocks }, null, 2) + '\n', { flag: 'wx' });
  console.log(`Migrated ${filename}: ${blocks.length} blocks`);
}
