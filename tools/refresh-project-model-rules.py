#!/usr/bin/env python3
"""Reviewed follow-up for the nine October 20 Project/Model sources.

Protect math, code, tables, URLs, reference entries and exact data fields.
Keep the current manuscript and anchors; do not restore an older manuscript.
"""
import argparse
from collections import Counter
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PAGES = 'description background engineering contribution model model-docking model-md model-ode model-eco'.split()
REPORT = ROOT / 'docs/project-model-rules-followup.json'
spec = importlib.util.spec_from_file_location('reviewed_rules', ROOT/'tools/apply-rules-wet.py')
rules = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rules)
# These additional established definitions were already reviewed in the model
# glossary. A named species alias is not treated as a generic ecological group.
rules.TERMS.append(dict(full='guanosine diphosphate', abbreviation='GDP', aliases=[], species=False, plural=None, source='existing model glossary'))
for term in rules.TERMS:
    if term['abbreviation'] == 'Mi':
        term['aliases'] = [x for x in term['aliases'] if x != 'southern root-knot nematode']
rules.PATTERN, rules.LOOKUP = rules.compile_terms()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def protected_ranges(text, nav=True):
    """Keep original substrings, including nested KaTeX spans, byte exact."""
    ranges = []
    start = None
    stack = []
    for m in re.finditer(r'<[^>]*>', text):
        tag = re.match(r'<\s*(/?)\s*([\w-]+)', m.group())
        if not tag:
            continue
        closing, name = tag[1], tag[2].lower()
        if start is not None:
            if closing:
                if name in stack:
                    while stack:
                        popped = stack.pop()
                        if popped == name:
                            break
                if not stack:
                    ranges.append((start, m.end()))
                    start = None
            elif name not in {'img','br','hr','input','source','wbr','meta','link'} and not m.group().endswith('/>'):
                stack.append(name)
        elif not closing and (name in {'math','table','code','pre','svg'} or (nav and name == 'nav') or re.search(r'class=["\'][^"\']*\bkatex',m.group())):
            start = m.start()
            stack = [name]
    assert start is None, 'Unbalanced protected source HTML'
    patterns = [r'`+[^`]*`+', r'\$\$[\s\S]*?\$\$', r'\$[^$\n]*\$', r'\]\([^)]*\)', r'https?://[^\s<>"\')]+', r'(?m)^\s*\|.*$']
    for pattern in patterns:
        for m in re.finditer(pattern,text):
            if not any(a <= m.start() < b for a,b in ranges):
                ranges.append((m.start(),m.end()))
    return sorted(ranges)


def mask(text):
    held = []
    for a,b in reversed(protected_ranges(text)):
        held.append(text[a:b])
        text = text[:a] + f'\ue010{len(held)-1}\ue011' + text[b:]
    return text, held


def unmask(text, held):
    return re.sub('\ue010(\\d+)\ue011', lambda m: held[int(m[1])], text)


def normalize_prose(text, state, location):
    text, held = mask(text)
    # Imported Markdown escapes punctuation in ordinary words. Unescape only
    # those characters in editable prose, never URLs, identifiers or formulas.
    text = re.sub(r'\\([#().-])', r'\1', text)
    for term in rules.TERMS:
        abbr = re.escape(term['abbreviation'])
        # Remove a repeated abbreviation following an already defined term.
        text = re.sub(r'(\('+abbr+r'\)(?:</strong>|\*\*)?)\s*\('+abbr+r'\)',r'\1',text)
    text = rules.transform_prose(text, state, location)
    # An existing <strong> wrapper may separate a repeated bracketed symbol.
    for term in rules.TERMS:
        abbr = re.escape(term['abbreviation'])
        text = re.sub(r'(\('+abbr+r'\)(?:</strong>|\*\*)?)\s*\('+abbr+r'\)',r'\1',text)
        text = re.sub(r'(?<!\w)('+abbr+r')(</strong>)?\s*\('+abbr+r'\)',r'\1\2',text)
    return unmask(text, held)


def immutable(data):
    out = []
    def walk(value, key=''):
        if isinstance(value,dict):
            for k,v in value.items():
                if k in {'src','left','right','csv','sourceCellRuns','pdbUrl','pdb','videoUrl','poster','sequence','alt','name','url','href','file','sourceFile'}:
                    out.append((k,json.dumps(v,ensure_ascii=False,sort_keys=True)))
                else:
                    walk(v,k)
        elif isinstance(value,list):
            for v in value: walk(v,key)
        elif isinstance(value,str):
            for a,b in protected_ranges(value,nav=False):out.append(('protected',value[a:b]))
    walk(data)
    return Counter(out)


def anchors(data):
    found=[]
    for block in data['blocks']:
        found += re.findall(r'^#[\w-]+',block.get('attributes',''))
        found += re.findall(r'\bid=["\'][^"\']+["\']',block.get('body',''))
    return Counter(found)


def fix_headings(data, page):
    chapter = sub = 0
    changed = []
    for b in data['blocks']:
        if b.get('_template') == 'heading':
            old = copy.deepcopy(b)
            # Imported 1.x / 2.x sections belong under the page's main chapter.
            if page in {'model-docking','model-md'} and re.match(r'^\d+\.\d+\s',b['text']):
                b['level'] = 3
            text = rules.sentence_case(rules.unnumber(b['text']))
            if b['level'] == 2:
                chapter += 1
                sub = 0
            elif b['level'] == 3:
                sub += 1
                text = f'{chapter}.{sub} {text}'
            b['text'] = text
            attrs = re.sub(r'\s+unnumbered\b','',b.get('attributes',''))
            attrs = re.sub(r'toc="([^"]*)"',lambda m:'toc="'+rules.sentence_case(rules.unnumber(m[1]))+'"',attrs)
            if b['level'] == 3 and 'toc-unnumbered' not in attrs:
                attrs += ' toc-unnumbered'
            b['attributes'] = attrs
            if b != old:changed.append({'before':old,'after':copy.deepcopy(b)})
        for key in ('body','accompanyingBody'):
            if not isinstance(b.get(key),str):continue
            # A manuscript subtitle is a visible title, even when imported as p.
            b[key] = re.sub(r'(<p class="manuscript-title">)(.*?)(</p>)',lambda m:m[1]+rules.sentence_case(m[2])+m[3],b[key])
            if page == 'model':
                b[key] = re.sub(r'(<span>)([^<]+)(</span>)',lambda m:m[1]+rules.sentence_case(m[2])+m[3],b[key])
    return changed


def run(args):
    previous = None
    if REPORT.exists():
        previous = json.loads(REPORT.read_text())
        if previous.get('schema_revision') == 2 and all(digest((ROOT/'content/wiki'/f'{p}.json').read_bytes()) == previous['pages'][p]['after_sha256'] for p in PAGES):
            print('All nine pages match the reviewed follow-up; no repeat migration.')
            return
        if args.verify: raise SystemExit('Sources changed since the follow-up; review required.')
    elif args.verify:raise SystemExit('Follow-up report missing')
    result = {}
    for page in PAGES:
        path = ROOT/'content/wiki'/f'{page}.json'
        current = path.read_bytes()
        baseline = subprocess.check_output(['git','show',f'{args.base}:content/wiki/{page}.json'],cwd=ROOT)
        source = baseline
        data = json.loads(source)
        old = copy.deepcopy(data)
        changes = fix_headings(data,page)
        state = {}
        references = False
        for i,b in enumerate(data['blocks']):
            if b.get('_template') == 'heading':
                label = rules.unnumber(b['text'])
                references = label.lower().startswith(('references','reference '))
                continue
            if references:continue
            fields = ('accompanyingBody','body','leftCaption','rightCaption','afterBody')
            for key in fields:
                if isinstance(b.get(key),str):
                    b[key] = normalize_prose(b[key],state,f'blocks[{i}].{key}')
        assert immutable(data) == immutable(old),f'{page}: immutable scientific material changed'
        assert anchors(data) == anchors(old),f'{page}: stable anchors changed'
        for key in old:
            if key != 'blocks': assert data[key] == old[key],f'{page}: source metadata changed'
        output=(json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
        assert current in (baseline,output) or (previous and digest(current)==previous['pages'][page]['after_sha256']),f'{page}: unexpected concurrent source edits'
        path.write_bytes(output)
        pending=[]
        text=' '.join(rules.plain(b.get('body','')) for b in data['blocks'])
        for phrase in rules.PENDING:
            if re.search(r'(?<!\w)'+re.escape(phrase)+r'(?!\w)',text,re.I):pending.append(phrase)
        result[page]={'before_sha256':digest(source),'after_sha256':digest(path.read_bytes()),'heading_changes':changes,'terms':list(state.values()),'retained_full_terms_pending_owner':pending,'protected_material_unchanged':True,'anchors_unchanged':True}
    REPORT.write_text(json.dumps({'schema_revision':2,'baseline':args.base,'scope':PAGES,'pages':result},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({p:{'headings':len(r['heading_changes']),'terms':len(r['terms'])} for p,r in result.items()},indent=2))


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--base',default='6143316')
    parser.add_argument('--verify',action='store_true')
    run(parser.parse_args())
