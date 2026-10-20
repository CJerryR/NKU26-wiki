import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

const source = path.resolve('../../evidence/senior-feedback-20261020/engineering-replacement');
const processor = unified().use(remarkParse).use(remarkStringify);
const markdown = fs.readFileSync(path.join(source, 'Project -_ Engineering.md'), 'utf8');
const tree = processor.parse(markdown);
const plain = node => node.value ?? (node.children || []).map(plain).join('');
const md = node => processor.stringify({ type: 'root', children: [node] }).trim();
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const contentPath = 'content/wiki/engineering.json';
const original = JSON.parse(fs.readFileSync(contentPath));
const svg = original.blocks.find(b => b._template === 'image' && b.src.includes('sobl-'));
if (!svg || svg.body) throw new Error('Expected caption-free author SVG');
fs.mkdirSync('docs/archived-content/senior-feedback-20261020', { recursive: true });
const archivePath = 'docs/archived-content/senior-feedback-20261020/engineering-before-replacement.json';
if (!fs.existsSync(archivePath)) fs.writeFileSync(archivePath, JSON.stringify(original, null, 2) + '\n');
const blocks = [{ _template: 'text', body: '<div class="reading-layout" lang="en">' }, svg];
const figures = [];
const headingChanges = [];
const sentenceCase = text => text.replace(/\b[A-Z][a-z]+\b/g, (word, offset) => offset === 0 || word === 'NemaKlear' ? word : word.toLowerCase());
const aliases = {
  1: ['src-Project-Engineering-1'],
  2: ['src-Project-Engineering-12'],
  4: ['src-Project-Engineering-53', 'src-HP-Engineering-30']
};
let chapter = 0;
let subsection = 0;
for (let i = 1; i < tree.children.length; i++) {
  const node = tree.children[i];
  if (node.type === 'heading') {
    const title = plain(node);
    if (node.depth === 1) {
      blocks.push({ _template: 'text', body: `<p class="manuscript-title">${sentenceCase(title)}</p>` });
      continue;
    }
    let text = title;
    if (node.depth === 2) {
      chapter++; subsection = 0;
      for (const id of aliases[chapter] || []) blocks.push({ _template: 'text', body: `<span id="${id}" class="legacy-section-anchor" aria-hidden="true"></span>` });
      text = sentenceCase(title.replace(/^Goal \d+:\s*/, ''));
    } else if (node.depth === 3) {
      subsection++;
      text = `${chapter}.${subsection} ${sentenceCase(title.replace(/^Iteration \d+\.\d+\s*—\s*/, ''))}`;
    }
    const id = `engineering-${node.depth === 2 ? `goal-${chapter}` : `iteration-${chapter}-${subsection}`}`;
    const toc = text.replace(/^\d+\.\d+\s*/, '');
    blocks.push({ _template: 'heading', level: node.depth, text, attributes: `#${id} toc="${toc}"` });
    headingChanges.push({ original: title, text });
    continue;
  }
  const image = node.type === 'paragraph' && node.children.length === 1 && node.children[0].type === 'image' ? node.children[0] : null;
  if (image) {
    const next = tree.children[i + 1];
    if (next?.type !== 'blockquote') throw new Error('Figure caption missing');
    const caption = processor.stringify({ type: 'root', children: next.children }).trim();
    const figure = Number(plain(next).match(/^Figure (\d+)/)?.[1]);
    const actualFigure = figure === 5 ? 4 : figure;
    const relative = `static/img/senior-feedback-20261020/engineering-figure-${actualFigure}.png`;
    const bytes = fs.readFileSync(path.join(source, decodeURIComponent(image.url)));
    fs.mkdirSync(path.dirname(relative), { recursive: true });
    fs.writeFileSync(relative, bytes);
    const block = { _template: 'image', src: '/' + relative.slice('static/'.length), alt: `Figure ${actualFigure}. ${actualFigure === 4 ? 'Coating device and colored metal-salt solutions defining circular wetting regions.' : plain(next).split('. ').slice(1, 2).join('. ')}`, body: figure === 5 ? '' : caption, layout: 'full', imageWidth: 'wide' };
    if (figure === 5) {
      const target = blocks.findIndex(b => b._template === 'text' && /^\*\*Figure 4/.test(b.body));
      if (target < 0) throw new Error('Figure 4 caption missing');
      block.body = blocks[target].body;
      blocks[target] = block;
      blocks.push({ _template: 'text', body: caption });
    } else blocks.push(block);
    figures.push({ source: image.url, source_position: figure, figure: actualFigure, file: relative, sha256: hash(bytes) });
    i++;
    continue;
  }
  if (node.type === 'blockquote' && /^Figure 4/.test(plain(node))) {
    blocks.push({ _template: 'text', body: processor.stringify({ type: 'root', children: node.children }).trim() });
  } else blocks.push({ _template: 'text', body: md(node) });
}
blocks.push({ _template: 'text', body: '</div>' });
const result = { ...original, blocks };
fs.writeFileSync(contentPath, JSON.stringify(result, null, 2) + '\n');
const receipt = { source: 'Project -> Engineering, 20 October latest author document', source_markdown_sha256: hash(Buffer.from(markdown)), author_svg_retained: svg, headings: headingChanges, figures, missing_source_figure: 5, original_figure_5_caption_retained: true, original_manuscript_archived: true, publication: 'not-published' };
fs.writeFileSync('docs/engineering-replacement-20261020.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ blocks: blocks.length, figures: figures.length, svg: true, missingFigure: 5 }));
