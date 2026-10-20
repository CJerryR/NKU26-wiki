#!/usr/bin/env python3
"""Apply the requested superscript citation style, keeping reference entries and math."""
import importlib.util
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('rules',ROOT/'tools/refresh-project-model-rules.py')
rules=importlib.util.module_from_spec(spec);spec.loader.exec_module(rules)

def format_citations(text):
    # Protect the complete KaTeX/MathML/code spans. A table itself is editable
    # presentation, so protect its math spans rather than masking the whole table.
    protected=[]
    for a,b in rules.protected_ranges(text):
        if not re.match(r'<table\b',text[a:b]): protected.append((a,b))
        else:
            for x,y in rules.protected_ranges(text[a+1:b-1]):
                if not text[a+1+x:a+1+y].startswith('table'):
                    protected.append((a+1+x,a+1+y))
    protected += [(m.start(),m.end()) for m in re.finditer(r'<sup\b[^>]*>.*?</sup>',text,re.S)]
    pattern=r'\\?\[\d+(?:\s*[,–—-]\s*\d+)*\](?!\s*\()'
    for m in reversed(list(re.finditer(pattern,text))):
        if any(a<=m.start()<b for a,b in protected):continue
        label=m[0].lstrip('\\')
        text=text[:m.start()]+'<sup>'+label+'</sup>'+text[m.end():]
    return text

def run():
    changes={}
    for path in sorted((ROOT/'content/wiki').glob('*.json')):
        doc=json.loads(path.read_text());references=False;count=0
        for block in doc.get('blocks',[]):
            if block['_template']=='heading':
                references=bool(re.match(r'^(?:\d+(?:\.\d+)*\s+)?references?\b',block['text'],re.I))
            if references or block.get('kind')=='refs':continue
            for key in ('body','accompanyingBody','leftCaption','rightCaption','afterBody'):
                if isinstance(block.get(key),str):
                    before=block[key];block[key]=format_citations(before)
                    count+=block[key].count('<sup>')-before.count('<sup>')
        if count:
            path.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n');changes[path.stem]=count
    print(json.dumps(changes,ensure_ascii=False))

if __name__=='__main__':run()
