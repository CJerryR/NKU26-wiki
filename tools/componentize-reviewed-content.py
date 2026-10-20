#!/usr/bin/env python3
"""One-time, lossless component migration of the reviewed October manuscripts.

Never re-import an earlier manuscript. Images, captions and equation TeX come
from the currently checked out canonical Tina source, not generated Markdown.
"""
import csv
import html
import io
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def save(slug, data):
    (ROOT / f'content/wiki/{slug}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def load(slug):
    return json.loads((ROOT / f'content/wiki/{slug}.json').read_text())

def small_markdown(text):
    return text.replace('<strong>', '**').replace('</strong>', '**')

def engineering():
    data = load('engineering')
    if any(b['_template'] == 'cycle' for b in data['blocks']):
        return
    out = []
    phases = None
    phase = None
    count = 0
    def finish():
        nonlocal phases, count
        if phases is not None:
            assert all(k in phases for k in ('design', 'build', 'test', 'learn'))
            count += 1
        phases = None
    for block in data['blocks']:
        text = block.get('body', '')
        match = re.match(r'^\*\*(Design|Build|Test|Learn)\*\*\s*-\s*(.*)$', text, re.S)
        if match:
            if phases is None:
                phases = {}
                out.append({'_template': 'cycle', 'language': 'en', 'items': [phases]})
            phase = match[1].lower()
            assert phase not in phases
            text = match[2]
            # The earlier term expander split the established gRNA identifier.
            text = text.replace('guide-<strong>ribonucleic acid (RNA)</strong>', 'gRNA')
            phases[phase] = small_markdown(text)
        elif phases is not None and phase != 'learn' and block['_template'] == 'image':
            phases[f'{phase}Image'] = block['src']
            phases[f'{phase}Alt'] = block['alt']
            phases[f'{phase}Caption'] = small_markdown(text)
        elif phases is not None and phase == 'test' and text.startswith('**Figure 5.'):
            # Retain the caption-only state explicitly requested by the user.
            phases['testCaption'] = small_markdown(text)
        else:
            finish()
            out.append(block)
    finish()
    assert count == 12, count
    data['blocks'] = out
    save('engineering', data)

def equations():
    for slug in ('model-docking', 'model-md', 'model-ode', 'model-eco'):
        data = load(slug)
        for i, block in enumerate(data['blocks']):
            text = block.get('body', '')
            if block['_template'] == 'text' and text.startswith('<div class="model-equation">'):
                tex = re.findall(r'<annotation encoding="application/x-tex">(.*?)</annotation>', text, re.S)
                assert len(tex) == 1, (slug, i)
                data['blocks'][i] = {'_template': 'equation', 'latex': html.unescape(tex[0])}
        save(slug, data)

def markdown_tables():
    for slug in ('background', 'attributions'):
        data = load(slug)
        out = []
        for block in data['blocks']:
            body = block.get('body', '')
            match = re.search(r'(?m)^\|[^\n]+\|\s*\n\|[ :|-]+\|[^\n]*\n(?:\|[^\n]*(?:\n|$))+', body)
            if block['_template'] != 'text' or not match:
                out.append(block)
                continue
            before, after = body[:match.start()].strip(), body[match.end():].strip()
            rows = [[v.strip() for v in line.strip().strip('|').split('|')] for line in match[0].strip().splitlines()]
            del rows[1]
            assert all(len(row) == len(rows[0]) for row in rows)
            buf = io.StringIO()
            csv.writer(buf, lineterminator='\n').writerows(rows)
            if before: out.append({'_template': 'text', 'body': before})
            out.append({'_template': 'datatable', 'csv': buf.getvalue()})
            if after: out.append({'_template': 'text', 'body': after})
        data['blocks'] = out
        for block in data['blocks']:
            if block['_template'] == 'datatable' and re.search(r'<(?:strong|em|sup|sub)>', block.get('csv', '')):
                block['inlineFormatting'] = True
        save(slug, data)

def outlines():
    # Introductory prose precedes the first chapter. The scene already supplies
    # the page's real h1; an author subtitle must not become chapter 01.
    data = load('description')
    intro = data['blocks'].pop(next(i for i,b in enumerate(data['blocks']) if b.get('attributes', '').startswith('#description-project-overview ')))
    data['blocks'].insert(next(i for i,b in enumerate(data['blocks']) if b['_template'] == 'heading'), intro)
    save('description', data)
    for slug in ('model', 'model-docking', 'model-md', 'model-ode', 'model-eco'):
        data = load(slug)
        first = next(i for i,b in enumerate(data['blocks']) if b['_template'] == 'heading')
        block = data['blocks'][first]
        expected = {'model':'model-overview', 'model-docking':'model-docking-section-0', 'model-md':'model-md-section-0', 'model-ode':'model-ode-section-0', 'model-eco':'src-Model-Eco-1'}[slug]
        if not block.get('attributes', '').startswith('#' + expected + ' '):
            continue
        anchor = re.search(r'#([\w-]+)', block.get('attributes', ''))[1]
        if slug == 'model':
            data['blocks'][first] = {'_template': 'text', 'body': f'<span id="{anchor}" class="legacy-section-anchor" aria-hidden="true"></span>'}
            for b in data['blocks']:
                if b['_template'] == 'heading': b['level'] = 2
        else:
            data['blocks'][first:first+1] = [
                {'_template': 'text', 'body': f'<span id="{anchor}" class="legacy-section-anchor" aria-hidden="true"></span>'},
                {'_template': 'layout', 'kind': 'lead', 'body': block['text']},
            ]
            if slug in ('model-docking', 'model-md'):
                for b in data['blocks']:
                    if b['_template'] == 'heading': b['level'] = 2
        chapter = sub = 0
        for b in data['blocks']:
            if b['_template'] != 'heading': continue
            text = re.sub(r'^\d+(?:\.\d+)*\s+', '', b['text'])
            if b['level'] == 2:
                chapter += 1; sub = 0
            elif b['level'] == 3:
                sub += 1; text = f'{chapter}.{sub} {text}'
            b['text'] = text
            attrs = re.sub(r'\s+toc-unnumbered\b', '', b.get('attributes', ''))
            b['attributes'] = attrs + (' toc-unnumbered' if b['level'] == 3 else '')
        save(slug, data)

if __name__ == '__main__':
    engineering()
    equations()
    markdown_tables()
    outlines()
