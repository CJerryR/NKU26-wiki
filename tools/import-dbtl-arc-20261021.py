#!/usr/bin/env python3
"""Gather each Engineering iteration into one half-ring DBTL block (DBTL组件.docx review).

Usage: python3 tools/import-dbtl-arc-20261021.py <dbtl-icon-dir>

Each iteration's "**Design** - …" to "**Learn** - …" paragraphs, and the figures placed with them,
become one `cycle` block with display "arc"; the paragraph that opens an iteration and the notes or
links that close it stay outside the block as before. <dbtl-icon-dir> holds the tiles cut from
dbtl.svg (dbtl-icon-<goal>-<iteration>.svg); they are copied to static/img/dbtl-icons-20261021/ for
local preview and move to the official upload service before release. Running twice is refused.
"""
import hashlib
import html
import json
import re
import shutil
import sys
from pathlib import Path

icons = Path(sys.argv[1])
out_dir = Path('static/img/dbtl-icons-20261021')
path = Path('content/wiki/engineering.json')
doc = json.loads(path.read_text())
if any(b['_template'] == 'cycle' for b in doc['blocks']):
    raise SystemExit('Engineering already uses DBTL blocks')

# The sheet's captions name the iterations; 2.3/2.4 and 3.2/3.3 share a tile, 2.5 has none.
ICON_OF = {'1-1': '1-1', '1-2': '1-2', '2-1': '2-1', '2-2': '2-2', '2-3': '2-3', '2-4': '2-3',
           '3-1': '3-1', '3-2': '3-2', '3-3': '3-2', '3-4': '3-4', '4-1': '4-1', '4-2': '4-2', '4-3': '4-3'}
# A figure set beside several stages joins the last of them, except where it pictures an earlier one.
FIGURE_STAGE = {'3-4': 'design'}
STAGE = re.compile(r'^\s*(?:\*\*|<strong>)(Design|Build|Test|Learn)(?:\*\*|</strong>)\s+-\s+', re.S)
manifest, copied = [], {}


def icon(tile):
    if tile not in copied:
        data = (icons / f'dbtl-icon-{tile}.svg').read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        target = out_dir / f'dbtl-icon-{tile}-{sha[:10]}.svg'
        out_dir.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        manifest.append({'icon': tile, 'source': 'dbtl.svg (DBTL组件.docx)', 'file': str(target), 'sha256': sha, 'bytes': len(data)})
        copied[tile] = '/' + str(target.relative_to('static'))
    return copied[tile]


def plain_markup(value):
    """Authored HTML paragraph → the cycle field syntax (**bold**, [link](url))."""
    value = re.sub(r'</?strong>', '**', value)
    value = re.sub(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', r'[\2](\1)', value)
    if re.search(r'<(?!/?p\b)[a-z]', value):
        raise SystemExit(f'Unexpected markup in stage text: {value[:80]}')
    return html.unescape(re.sub(r'</?p>', '', value)).strip()


def stages_in(value):
    parts = re.split(r'</p>\s*<p>|\n\s*\n', value.strip()) if value else []
    found = []
    for part in parts:
        part = re.sub(r'^\s*<p>|</p>\s*$', '', part)
        m = STAGE.match(part)
        if not m:
            return None
        found.append((m.group(1).lower(), plain_markup(part[m.end():])))
    return found


blocks, out, i = doc['blocks'], [], 0
summary = []
while i < len(blocks):
    b = blocks[i]
    if not (b['_template'] == 'heading' and b['level'] == 3):
        out.append(b); i += 1; continue
    iteration = re.match(r'(\d)\.(\d)', b['text']).expand(r'\1-\2')
    out.append(b); i += 1
    intro, item, after, last = [], {}, [], None
    while i < len(blocks) and blocks[i]['_template'] != 'heading':
        c = blocks[i]
        anchor = c['_template'] == 'text' and c['body'].lstrip().startswith('<span')
        if anchor:
            break
        found = stages_in(c.get('body')) if c['_template'] == 'text' else None
        beside = stages_in(c.get('accompanyingBody')) if c['_template'] == 'image' else None
        if found and not after:
            for key, value in found:
                item[key] = value; last = key
        elif c['_template'] == 'image' and not after and (beside or last):
            for key, value in beside or []:
                item[key] = value; last = key
            stage = FIGURE_STAGE.get(iteration, last)
            item[f'{stage}Image'], item[f'{stage}Alt'], item[f'{stage}Caption'] = c['src'], c.get('alt', ''), c.get('body', '')
        elif not item:
            intro.append(c)
        else:
            after.append(c)
        i += 1
    if set(item) & {'design', 'build', 'test', 'learn'} != {'design', 'build', 'test', 'learn'}:
        raise SystemExit(f'Iteration {iteration}: expected Design, Build, Test and Learn, found {sorted(item)}')
    if iteration in ICON_OF:
        item['icon'] = icon(ICON_OF[iteration])
    ordered = {k: item[k] for k in ['design', 'build', 'test', 'learn'] + sorted(k for k in item if k not in ('design', 'build', 'test', 'learn'))}
    out += intro + [{'_template': 'cycle', 'language': 'en', 'display': 'arc', 'items': [ordered]}] + after
    summary.append((iteration, len(intro), [k for k in ordered if k.endswith('Image')], len(after)))

doc['blocks'] = out
path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
Path('docs/dbtl-arc-20261021-media.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
for row in summary:
    print('%s intro=%d figures=%s after=%d' % row)
