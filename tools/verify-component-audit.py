#!/usr/bin/env python3
"""Protect scientific sources while auditing their actual Tina block types."""
from collections import Counter
import hashlib
import html
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = 'c56e223'
COMPONENT_BASE = 'b2332d8'

def git_doc(ref, path):
    return json.loads(subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=ROOT, text=True))

def inventory(doc):
    images, tex, tables, identifiers, refs, csv, bibliography = [], [], [], [], [], [], []
    def walk(value, key=''):
        if isinstance(value, dict):
            for k,v in value.items():
                if k in ('src','image','left','right','before','after') or k.endswith('Image'): images.append(v)
                elif k == 'latex': tex.append(v)
                elif k == 'csv': csv.append(v)
                elif k in ('file','sequence','videoUrl','pdbUrl','poster'): identifiers.append((k,v))
                else: walk(v,k)
        elif isinstance(value, list):
            for v in value: walk(v,key)
        elif isinstance(value,str):
            tex.extend(html.unescape(t) for t in re.findall(r'<annotation encoding="application/x-tex">(.*?)</annotation>',value,re.S))
            # Superscripting an existing numeric citation is the only permitted
            # presentation change inside the original complex scientific tables.
            tables.extend(re.sub(r'<sup>\s*(\[[\d,\s–—-]+\])\s*</sup>',r'\1',t) for t in re.findall(r'<table\b.*?</table>',value,re.S))
            refs.extend(re.findall(r'<sup\b[^>]*>.*?</sup>',value,re.S))
    walk(doc)
    in_refs=False
    for block in doc.get('blocks',[]):
        if block['_template']=='heading':
            in_refs=bool(re.match(r'^(?:\d+(?:\.\d+)*\s+)?references?\b',block['text'],re.I))
        elif in_refs:
            bibliography.append(block.get('body',''))
    return {'images':Counter(images), 'tex':Counter(tex), 'rich_tables':Counter(tables), 'identifiers':Counter(identifiers), 'superscript_citations':Counter(refs), 'csv':Counter(csv), 'bibliography':Counter(bibliography)}

def prose(doc):
    values=[]
    for b in doc['blocks']:
        if b['_template']=='cycle':
            for r in b['items']:
                for phase in ('design','build','test','learn'):
                    values += [r.get(phase,''),r.get(phase+'Caption','')]
        else: values.append(b.get('body',''))
    text=' '.join(values).replace('guide-<strong>ribonucleic acid (RNA)</strong>','gRNA')
    text=re.sub(r'^\*\*(?:Design|Build|Test|Learn)\*\*\s*-\s*','',text,flags=re.M)
    text=re.sub(r'\*\*(?:Design|Build|Test|Learn)\*\*\s*-\s*','',text)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]*>|\*\*|\\(?=[#().-])','',text))).strip()

def run():
    report={'base':BASE,'component_base':COMPONENT_BASE,'pages':[],'failures':[]}
    for path in sorted((ROOT/'content/wiki').glob('*.json')):
        rel=str(path.relative_to(ROOT)); before=git_doc(BASE,rel); after=json.loads(path.read_text())
        assert {k:v for k,v in before.items() if k!='blocks'} == {k:v for k,v in after.items() if k!='blocks'},f'{path.stem}: metadata changed'
        old,new=inventory(before),inventory(after)
        for key in old:
            if key=='csv':
                if old[key]-new[key]:report['failures'].append(f'{path.stem}: original CSV data changed')
            elif key=='superscript_citations':
                if old[key]-new[key]:report['failures'].append(f'{path.stem}: original superscript citations were removed')
            elif old[key]!=new[key]:report['failures'].append(f'{path.stem}: {key} changed')
        if path.stem=='engineering':
            assert prose(git_doc(COMPONENT_BASE,rel))==prose(after),'Engineering prose or captions were lost or reordered'
            assert sum(b['_template']=='cycle' for b in after['blocks'])==12
            for b in after['blocks']:
                if b['_template']=='cycle':assert all(b['items'][0].get(k) for k in ('design','build','test','learn'))
            assert any(b.get('src','').endswith('sobl-e530246a44cd.svg') for b in after['blocks'])
            missing=next(b for b in after['blocks'] if b['_template']=='cycle' and b['items'][0].get('testCaption','').replace('**','').startswith('Figure 5.'))['items'][0]
            assert not missing.get('testImage'),'Figure 5 must retain the user-approved caption-only state'
        report['pages'].append({'page':path.stem,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'before':dict(Counter(b['_template'] for b in before.get('blocks',[]))),'after':dict(Counter(b['_template'] for b in after.get('blocks',[]))),'scientific_images':sum(new['images'].values()),'tex_expressions':sum(new['tex'].values()),'rich_tables':sum(new['rich_tables'].values())})
    report['passed']=not report['failures']
    out=ROOT/'docs/validation/component-audit';out.mkdir(parents=True,exist_ok=True)
    (out/'scientific-source-protection.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'pages':len(report['pages']),'passed':report['passed'],'failures':report['failures']},ensure_ascii=False))
    assert report['passed']

if __name__=='__main__':run()
