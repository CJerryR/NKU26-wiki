#!/usr/bin/env python3
"""Verify temporary Project comparison routes, links and caption markup."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=set(); self.refs=[]; self.preview=False
        self.captions=0; self.caption_depth=0; self.caption_bold=False; self.feed(text)
    def handle_starttag(self, tag, attributes):
        a=dict(attributes)
        if 'id' in a:self.ids.add(a['id'])
        if 'data-project-preview' in a:self.preview=True
        if tag=='figcaption':self.captions+=1;self.caption_depth+=1
        if self.caption_depth and tag in ('b','strong'):self.caption_bold=True
        if 'data-page-off' not in a:
            for name in ['src','href','poster']:
                if a.get(name):self.refs.append(a[name])
    def handle_endtag(self, tag):
        if tag=='figcaption':self.caption_depth=max(0,self.caption_depth-1)

root=Path('public').resolve(); report=[]
for slug in ['description','engineering','contribution']:
    target=root/f'preview/project-feishu/{slug}/index.html'; p=Page(target.read_text())
    assert p.preview, f'{slug}: missing backup marker'
    assert not p.caption_bold, f'{slug}: bold caption'
    assert p.captions>0, f'{slug}: no captions'
    assert not Page((root/f'{slug}/index.html').read_text()).preview, f'{slug}: production isolation failed'
    for ref in p.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc:continue
        if not url.path:
            assert not url.fragment or unquote(url.fragment) in p.ids, f'{slug}: missing anchor {ref}'
            continue
        resolved=(target.parent/unquote(url.path)).resolve()
        assert resolved.is_relative_to(root), f'{slug}: link escapes deployment {ref}'
        assert resolved.is_file() or (resolved/'index.html').is_file(), f'{slug}: missing local asset/link {ref}'
    report.append({'page':slug,'captions':p.captions,'local_references':len(p.refs)})
assert (root/'preview/project-feishu/index.html').is_file()
print(json.dumps({'passed':True,'routes':4,'pages':report},indent=2))
