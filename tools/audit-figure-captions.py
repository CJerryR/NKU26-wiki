#!/usr/bin/env python3
"""Check every generated article figure caption, including authored HTML."""
import argparse
import importlib.util
import json
from pathlib import Path
import re

spec=importlib.util.spec_from_file_location('dom','tools/audit-content-rules.py')
dom=importlib.util.module_from_spec(spec);spec.loader.exec_module(dom)
parser=argparse.ArgumentParser();parser.add_argument('--output',default='/tmp/figure-caption-audit.json');args=parser.parse_args()
captions=[];failures=[]
for source in sorted(Path('content/wiki').glob('*.json')):
    page=json.loads(source.read_text());path=Path('public')/(page['route']+'/index.html' if page.get('route') else 'pages/'+source.stem+'.html')
    nodes=list(dom.DOM(path.read_text()).root.walk())
    article=next(n for n in nodes if n.tag=='article' and n.has('doc__body'))
    for node in article.walk():
        if node.tag!='figcaption' and not node.has('figure-caption') and not node.has('docking-caption-only'):continue
        parent=node.parent
        if parent and (parent.inside(tag='figcaption') or parent.inside(cls='figure-caption') or parent.inside(cls='docking-caption-only')):continue
        text=node.text().strip();entry={'page':source.stem,'text':text};captions.append(entry)
        if any(n.tag in ('strong','b') for n in node.walk()):failures.append({**entry,'error':'caption bold markup remains'})
        if re.match(r'^(?:Figure|Fig\.)\s*S?\d',text,re.I) and not re.match(r'^Figure\s+S?\d+(?:[.-]\d+)*[a-z]?\.\s',text):failures.append({**entry,'error':'figure number punctuation differs'})
report={'caption_count':len(captions),'passed':not failures,'failures':failures,'captions':captions}
Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='captions'},ensure_ascii=False));raise SystemExit(bool(failures))
