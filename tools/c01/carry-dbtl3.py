#!/usr/bin/env python3
"""C01 candidate: carry the DBTL-3 blocks of content/wiki/results.json into the new
`phase` and `evidence` Tina templates.

Only the carrier changes. Every authored string (paragraph HTML, caption HTML) is moved
byte-for-byte into a field of the new block; image URLs and alt text come from the
authored <figure> HTML; nothing is reordered, merged into other text, added or removed.
Run tools/c01/verify-dbtl3.py afterwards to prove it.

    python3 tools/c01/carry-dbtl3.py content/wiki/results.json > results.candidate.json
"""
import json, re, sys, html

# Stage paragraphs, by block index in the 20e4222 source, and their marker style.
PHASES = {127: 'design', 131: 'build-test', 139: 'learn',
          145: 'design', 149: 'build-test', 162: 'learn',
          166: 'design', 168: 'build-test', 173: 'learn'}
# Figures: (lead paragraph, figure html, caption, reading paragraph or None) -> layout choice.
# Layout is the only editorial decision here and is meant to be reviewed / changed in Tina.
EVIDENCE = [
    ((135, 136, 137, 138), 'right', 'standard'),  # Figure 1  water absorption of three substrates
    ((150, 151, 152, None), 'below', 'wide'),     # Figure 2  three panels (a)(b)(c)
    ((153, 154, 155, None), 'right', 'standard'), # Figure 3  water loss rate curve
    ((156, 157, 158, None), 'left', 'standard'),  # "Figure 3.1.4" spotting schematic
    ((159, 160, 161, None), 'below', 'standard'), # Figure 5  overview of test strips
    ((176, 177, 178, None), 'right', 'compact'),  # Figure 7  3D-printed cassette
]
FIGURE = re.compile(r'^<figure><a href="([^"]+)" target="_blank" rel="noopener"><img src="([^"]+)" alt="([^"]*)" loading="lazy"></a></figure>$')

def main(path):
    raw = open(path, encoding='utf8').read()
    data = json.loads(raw)
    blocks = data['blocks']
    assert blocks[122]['_template'] == 'heading' and blocks[122]['text'].startswith('DBTL-3:'), 'not the 20e4222 results.json layout'
    replace = {}
    for i, kind in PHASES.items():
        b = blocks[i]
        assert b['_template'] == 'text' and re.fullmatch(r'<p style="text-align:(left|justify);">(Design|Build &amp; Test|Learn)</p>', b['body']), (i, b)
        replace[i] = [{'_template': 'phase', 'kind': kind, 'body': b['body']}]
    for (lead, fig, cap, after), place, size in EVIDENCE:
        m = FIGURE.match(blocks[fig]['body'])
        assert m and m.group(1) == m.group(2), (fig, blocks[fig]['body'])
        assert 'figure-caption' in blocks[cap]['body'], cap
        block = {'_template': 'evidence', 'body': blocks[lead]['body'], 'src': html.unescape(m.group(2)),
                 'figureAlt': html.unescape(m.group(3)), 'openOriginal': True, 'figureCaption': blocks[cap]['body']}
        if after is not None:
            block['afterBody'] = blocks[after]['body']
        block.update(place=place, size=size)
        idx = [lead, fig, cap] + ([after] if after is not None else [])
        assert idx == list(range(lead, lead + len(idx))), idx  # only adjacent blocks, so order cannot change
        replace[lead] = [block]
        for j in idx[1:]:
            replace[j] = []
    out = []
    for i, b in enumerate(blocks):
        out.extend(replace.get(i, [b]))
    data['blocks'] = out
    sys.stdout.write(json.dumps(data, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main(sys.argv[1])
