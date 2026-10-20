#!/usr/bin/env python3
"""C01: prove that the candidate results.json changes only the carrier of DBTL-3.

    python3 tools/c01/verify-dbtl3.py <source results.json> <candidate results.json>

Checks
 1. every top-level field except `blocks` is identical;
 2. every block outside DBTL-3 is identical and in the same position;
 3. inside DBTL-3 the ordered sequence of authored content is identical:
    headings (text, level, anchor attributes), every paragraph / table / caption / embed
    HTML string byte-for-byte, and every image (src, alt, link to original);
 4. the only templates added are `phase` and `evidence`.
Exit code 0 = all checks pass.
"""
import json, re, sys, html

FIGURE = re.compile(r'^<figure><a href="([^"]+)" target="_blank" rel="noopener"><img src="([^"]+)" alt="([^"]*)" loading="lazy"></a></figure>$')

def dbtl3_start(blocks):
    return next(i for i, b in enumerate(blocks) if b['_template'] == 'heading' and b['text'].startswith('DBTL-3:'))

def atoms_source(blocks):
    for b in blocks:
        t = b['_template']
        if t == 'heading':
            yield ('heading', b['text'], b['level'], b.get('attributes'))
        elif t == 'text':
            m = FIGURE.match(b['body'])
            if m: yield ('image', html.unescape(m.group(2)), html.unescape(m.group(3)), html.unescape(m.group(1)))
            else: yield ('html', b['body'])
        else:
            raise SystemExit(f'unexpected source template in DBTL-3: {t}')

def atoms_candidate(blocks):
    for b in blocks:
        t = b['_template']
        if t == 'heading':
            yield ('heading', b['text'], b['level'], b.get('attributes'))
        elif t in ('text', 'phase'):
            yield ('html', b['body'])
        elif t == 'evidence':
            if b.get('body'): yield ('html', b['body'])
            yield ('image', b['src'], b.get('figureAlt', ''), b['src'] if b.get('openOriginal') else None)
            if b.get('figureCaption'): yield ('html', b['figureCaption'])
            if b.get('afterBody'): yield ('html', b['afterBody'])
        else:
            raise SystemExit(f'unexpected candidate template in DBTL-3: {t}')

def main(src_path, cand_path):
    src, cand = (json.load(open(p, encoding='utf8')) for p in (src_path, cand_path))
    ok = True
    def check(name, cond, detail=''):
        nonlocal ok
        print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))
        ok &= bool(cond)
    check('1 top-level fields unchanged', {k: v for k, v in src.items() if k != 'blocks'} == {k: v for k, v in cand.items() if k != 'blocks'})
    a, b = dbtl3_start(src['blocks']), dbtl3_start(cand['blocks'])
    check('2 blocks before DBTL-3 unchanged', a == b and src['blocks'][:a] == cand['blocks'][:b], f'{a} vs {b}')
    sa, sb = list(atoms_source(src['blocks'][a:])), list(atoms_candidate(cand['blocks'][b:]))
    first = next((i for i, (x, y) in enumerate(zip(sa, sb)) if x != y), None)
    check(f'3 DBTL-3 authored sequence identical ({len(sa)} items: '
          f'{sum(x[0]=="heading" for x in sa)} headings, {sum(x[0]=="html" for x in sa)} HTML strings, {sum(x[0]=="image" for x in sa)} images)',
          sa == sb, f'length {len(sa)} vs {len(sb)}; first difference at {first}: {sa[first] if first is not None and first < len(sa) else None!r} / {sb[first] if first is not None and first < len(sb) else None!r}')
    added = {x['_template'] for x in cand['blocks']} - {x['_template'] for x in src['blocks']}
    check('4 only phase / evidence templates added', added <= {'phase', 'evidence'}, str(added))
    counts = {t: sum(x['_template'] == t for x in cand['blocks'][b:]) for t in ('phase', 'evidence')}
    print(f'     DBTL-3 blocks: {len(src["blocks"]) - a} → {len(cand["blocks"]) - b}; phase {counts["phase"]}, evidence {counts["evidence"]}')
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main(*sys.argv[1:3])
