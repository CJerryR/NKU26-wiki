#!/usr/bin/env python3
"""Audit every generated content page and protect scientific assets/data."""
import argparse
from collections import Counter
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag=tag; self.attrs=dict(attrs); self.parent=parent; self.children=[]
    def has(self, cls): return cls in self.attrs.get('class','').split()
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child,Node): yield from child.walk()
    def text(self):
        return ''.join(c.text() if isinstance(c,Node) else c for c in self.children)
    def inside(self, tag=None, cls=None):
        n=self
        while n:
            if (tag is None or n.tag==tag) and (cls is None or n.has(cls)): return True
            n=n.parent
        return False

class DOM(HTMLParser):
    void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(text)
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.stack[-1]);self.stack[-1].children.append(n)
        if tag not in self.void:self.stack.append(n)
    def handle_startendtag(self,tag,attrs): self.handle_starttag(tag,attrs);self.handle_endtag(tag)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,text):self.stack[-1].children.append(text)

def values(doc):
    out=[]
    protected={'src','left','right','csv','sourceCellRuns','pdbUrl','pdb','videoUrl','poster','sequence'}
    def walk(value):
        if isinstance(value,dict):
            for key,item in value.items():
                if key in protected: out.append((key,json.dumps(item,sort_keys=True,ensure_ascii=False)))
                else:walk(item)
        elif isinstance(value,list):
            for item in value:walk(item)
    walk(doc);return Counter(out)

def archive_links(doc):
    links=[]
    for block in doc.get('blocks',[]):
        dom=DOM(block.get('body',''))
        for n in dom.root.walk():
            if n.tag=='a' and 'data-source-document' in n.attrs:
                links.append((n.attrs.get('data-source-document'),n.attrs.get('href'),n.attrs.get('download')))
    return sorted(links,key=str)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='e205f4a5c5ade14f1c38e6836a2b41521b20bf5e');parser.add_argument('--output',default='docs/content-rules-audit.json');args=parser.parse_args()
    failures=[];pages=[]
    for path in sorted(Path('content/wiki').glob('*.json')):
        slug=path.stem;doc=json.loads(path.read_text());old=json.loads(subprocess.check_output(['git','show',f'{args.base}:{path}'],text=True))
        if values(doc)!=values(old):failures.append(f'{slug}: scientific asset/data fields changed')
        if slug=='source-archive' and archive_links(doc)!=archive_links(old):failures.append('source-archive: original download targets changed')
        generated=Path('public')/(doc['route']+'/index.html' if doc.get('route') else f'pages/{slug}.html')
        if not generated.exists(): failures.append(f'{slug}: generated page missing');continue
        dom=DOM(generated.read_text());nodes=list(dom.root.walk());article=next((n for n in nodes if n.tag=='article' and n.has('doc__body')),None)
        if article is None:failures.append(f'{slug}: article missing');continue
        heading_nodes=[n for n in article.walk() if n.tag in ('h2','h3','h4','h5','h6')]
        h2=[n for n in heading_nodes if n.tag=='h2'];h3=[n for n in heading_nodes if n.tag=='h3']
        for n in h2:
            label=n.text().strip()
            calendar_date=re.match(r'^\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',label)
            if not calendar_date and re.match(r'^\s*(?:\d+(?:\.\d+)*[.)]?|[IVX]+[.)])\s+',label):failures.append(f'{slug}: h2 still numbered: {label[:100]}')
        for section in (n for n in article.walk() if n.has('doc-section') and n.attrs.get('data-num')):
            if section.parent and section.parent.inside(cls='doc-section'):failures.append(f'{slug}: chapter {section.attrs["data-num"]} is nested inside another chapter')
            def belongs(n):
                parent=n.parent
                while parent and not parent.has('doc-section'):parent=parent.parent
                return parent is section
            children=[n for n in section.walk() if n.tag=='h3' and belongs(n) and not any(n.inside(cls=c) for c in ('cards','card','timeline','features','member-grid','credit-grid','person-name','wf'))]
            chapter=int(section.attrs['data-num'])
            for ordinal,n in enumerate(children,1):
                expected=f'{chapter}.{ordinal} '
                if not n.text().strip().startswith(expected):failures.append(f'{slug}: expected h3 {expected.strip()}: {n.text()[:100]}')
        nonarchive=slug!='source-archive'
        if nonarchive:
            for n in nodes:
                if n.tag=='a' and ('source-archive' in n.attrs.get('href','') or 'data-source-document' in n.attrs): failures.append(f'{slug}: manuscript/archive link remains: {n.text()[:80]}')
                if n.tag not in ('script','style') and not any(isinstance(c,Node) for c in n.children):
                    if re.search(r'Historical source documents|Original submission|历史原稿|历史文档|历史资料',n.text(),re.I): failures.append(f'{slug}: historical document text remains: {n.text()[:80]}')
            for n in article.walk():
                if n.tag=='p' and re.search(r'Back to HP Overview|Next:\s*(?:Education|iHP|Investigation)',n.text(),re.I):failures.append(f'{slug}: duplicate body paging remains')
        ids=Counter(n.attrs['id'] for n in nodes if 'id' in n.attrs)
        for key,count in ids.items():
            if count>1:failures.append(f'{slug}: duplicate id {key}')
        pages.append({'page':slug,'route':str(generated),'h2':len(h2),'h3':len(h3),'headings':[{'level':n.tag,'text':n.text().strip(),'id':n.attrs.get('id')} for n in heading_nodes]})
    index=Path('public/js/search-data.js').read_text()
    if 'source-archive/' in index or re.search('historical source documents|历史原稿|历史文档',index,re.I):failures.append('search: archive content remains')
    report={'base':args.base,'page_count':len(pages),'passed':not failures,'failures':failures,'pages':pages}
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'page_count':len(pages),'passed':not failures,'failures':failures},ensure_ascii=False,indent=2));return bool(failures)
if __name__=='__main__':raise SystemExit(main())
