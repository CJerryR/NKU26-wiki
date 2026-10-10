import { parseAttributes, slugify } from './remark-wiki.mjs';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s: string): string => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

/** The small inline Markdown used in frontmatter strings: *em*, **strong**, `code`. */
export function inlineMd(src: string): string {
  const parts = String(src).split(/(\\[*`\\])/);
  return parts.map((part) => {
    if (/^\\[*`\\]$/.test(part)) return escapeHtml(part.slice(1));
    return escapeHtml(part)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }).join('');
}

export function stripMd(src: string): string {
  return String(src).replace(/\\([*`_\\])/g, '$1').replace(/(\*\*|\*|`)/g, '').trim();
}

const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'" };

/** Plain text of a Markdown page, for the search index. */
export function markdownToText(md: string): string {
  const lines = md.split('\n').map((line) => {
    if (/^\s*:{2,}/.test(line)) {
      const label = line.match(/\[([^\]]*)\]/);
      return label ? label[1] : '';
    }
    if (/^\s{0,3}#{1,6}\s/.test(line)) return line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/\s*\{[^{}]*\}\s*$/, '');
    if (/^\s*\|?\s*:?-{3,}/.test(line)) return '';
    if (/^\s*```/.test(line)) return '';
    return line;
  });
  return lines.join('\n')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/(\*\*|\*|`|~~)/g, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!|~:<>])/g, '$1')
    .replace(/&(lt|gt|amp|quot|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

export interface MdSection { id: string; title: string; text: string }

/** `##` sections of a Markdown page with the same ids the renderer gives them. */
export function sectionsFromMarkdown(md: string): MdSection[] {
  const used = new Set<string>();
  const found: { id: string; title: string; lines: string[] }[] = [];
  let current: { id: string; title: string; lines: string[] } | null = null;
  let fence = false;
  for (const line of md.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    const m = fence ? null : line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      let title = m[1];
      let id = '';
      let toc = '';
      const a = title.match(/\s*\{([^{}]*)\}\s*$/);
      if (a && a.index !== undefined) {
        const parsed = parseAttributes(a[1]);
        if (parsed) {
          title = title.slice(0, a.index);
          id = parsed.id || '';
          toc = parsed.attrs.toc || '';
        }
      }
      const plain = stripMd(title);
      if (id) used.add(id); else id = slugify(plain, used);
      current = { id, title: toc || plain, lines: [] };
      found.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return found.map((s) => ({ id: s.id, title: s.title, text: markdownToText(s.lines.join('\n')) }));
}

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&(lt|gt|amp|quot|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
