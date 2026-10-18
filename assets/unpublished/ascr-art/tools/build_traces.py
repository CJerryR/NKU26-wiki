import json,re
W='../../../../src/home/sections/traces.html'
S=json.load(open('slots.json'))
tpl=open('traces_svg.tpl').read()
tpl=tpl.replace('{{DEFS}}',S['_defs'])
for k,v in S.items():
    if k!='_defs': tpl=tpl.replace('{{'+k+'}}',v)
assert '{{' not in tpl, re.findall(r'\{\{\w+\}\}',tpl)
src=open(W).read()
a=src.index('      <svg class="as__svg"'); b=src.index('      </svg>',a)+len('      </svg>\n')
src=src[:a]+tpl+src[b:]
src=src.replace('''<!-- cp16: the merged ascaroside page from the team's PPT sketch (蛔苷素-线虫鉴别-ascr#3/18).
     One page, thirteen steps: trace -> receptor -> yeast -> test strip -> map, played like
     the slides' Morph transitions (home-ascr-story.js). The stage uses the slides' own
     1280x720 coordinates. Every drawing sits in a named slot (data-art) so the final
     artwork can replace it without touching the motion: see docs/home-ascr-story.md. -->''','''<!-- cp16: the merged ascaroside page from the team's PPT sketch (蛔苷素-线虫鉴别-ascr#3/18).
     One page, thirteen steps: trace -> receptor -> yeast -> test strip -> map, played like
     the slides' Morph transitions (home-ascr-story.js). The stage uses the slides' own
     1280x720 coordinates. Every drawing sits in a named slot (data-art).
     v8.6: the slots hold the team's own artwork, generated from
     assets/unpublished/ascr-art/total_2.svg by ascr-art/tools/build_traces.py
     (see assets/unpublished/ascr-art/README.md). -->''')
open(W,'w').write(src)
print(len(src))
