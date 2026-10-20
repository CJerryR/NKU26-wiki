#!/usr/bin/env python3
"""Normalize authored figure captions without changing images, data or prose."""
import importlib.util,json,re,hashlib,copy,subprocess
from pathlib import Path
spec=importlib.util.spec_from_file_location('reviewed','tools/apply-rules-wet.py');rules=importlib.util.module_from_spec(spec);spec.loader.exec_module(rules)
OUT=Path('docs/figure-caption-normalization.json')

def caption(value):
 value=value.replace('NKU-china','NKU-China')
 value=re.sub(r'</?(?:strong|b)\b[^>]*>','',value,flags=re.I)
 value=re.sub(r'\*\*([^*]*(?:\*(?!\*)[^*]*)*)\*\*',r'\1',value)
 value=re.sub(r'\\([.()#-])',r'\1',value)
 value=re.sub(r'(?i)\b(?:Figure|Fig\.)\s*(S?\d+(?:[.-]\d+)*[a-z]?)\s*(?:[.|:：]\s*|(?=\s|<|$))',lambda m:'Figure '+m[1]+'. ',value,count=1)
 # Only the title sentence is cased; preserve inline scientific markup and all
 # later explanation, math, links, citations and panel correspondence.
 first=True; ended=False; chunks=re.split(r'(<[^>]*>|`[^`]*`|\$[^$]*\$)',value);protected=0
 for i,c in enumerate(chunks):
  if c.startswith('<'):
   if re.match(r'<(?:em|i|code|math)\b',c):protected+=1
   if re.match(r'</(?:em|i|code|math)>',c):protected=max(0,protected-1)
   continue
  if protected or ended or c.startswith(('`','$')):continue
  # The Figure number's period is part of the label, not the title sentence.
  label=re.match(r'\s*Figure\s+S?\d+(?:[.-]\d+)*[a-z]?\.\s*',c,re.I)
  start=label.end() if label else 0
  stop=len(c)
  for m in re.finditer(r'\.(?=\s|$)',c[start:]):
   at=start+m.start()
   if not re.search(r'(?:\b(?:et al|Fig|e\.g|i\.e)|(?:^|\s)[A-Z]|\d)$',c[:at]):stop=at+1;ended=True;break
  def word(m):
   nonlocal first
   w=m[0];keep=w in rules.PROPER or w=='China' or (m.start()>0 and c[start:stop][m.start()-1].isdigit()) or bool(re.search(r'\d|[a-z][A-Z]',w)) or (len(w)>1 and w.isupper())
   t=w if keep else w.lower()
   if first and not keep:t=t[0].upper()+t[1:]
   first=False
   return t
  chunks[i]=c[:start]+re.sub(r'[A-Za-z][A-Za-z0-9.αβ]*',word,c[start:stop])+c[stop:]
 return ''.join(chunks)

def raw_captions(value):
 # Full figcaption content, including multiline paragraphs and inline species.
 value=re.sub(r'(<figcaption\b[^>]*>)([\s\S]*?)(</figcaption>)',lambda m:m[1]+caption(m[2])+m[3],value,flags=re.I)
 def paragraph(m):
  inner=m[2];plain=re.sub('<[^>]*>','',inner).replace('**','').lstrip()
  if not re.match(r'(?:Figure|Fig\.)\s*S?\d',plain,re.I):return m[0]
  opening=m[1]
  if 'class=' in opening:opening=re.sub(r'class="([^"]*)"',lambda c:'class="'+c[1]+' figure-caption"',opening) if 'figure-caption' not in opening else opening
  else:opening=opening[:-1]+' class="figure-caption">'
  return opening+caption(inner)+m[3]
 return re.sub(r'(<p\b[^>]*>)([\s\S]*?)(</p>)',paragraph,value,flags=re.I)

report=[]
for path in sorted(Path('content/wiki').glob('*.json')):
 original=path.read_bytes();data=json.loads(original);changes=[]
 def walk(obj,where=''):
  if isinstance(obj,list):
   for i,x in enumerate(obj):walk(x,where+f'[{i}]')
  elif isinstance(obj,dict):
   for key,value in list(obj.items()):
    if isinstance(value,str):
     direct=key in {'caption','leftCaption','rightCaption'} or (key=='body' and obj.get('_template')=='image')
     new=caption(value) if direct else raw_captions(value) if key in {'body','afterBody'} else value
     if new!=value:
      before=re.sub('<[^>]*>','',value).replace('**','');after=re.sub('<[^>]*>','',new).replace('**','')
      assert re.findall(r'\d+(?:\.\d+)?',before)==re.findall(r'\d+(?:\.\d+)?',after),(path,key,'numbers')
      changes.append({'field':where+'.'+key,'before':value,'after':new});obj[key]=new
    elif isinstance(value,(list,dict)):walk(value,where+'.'+key)
 walk(data)
 if changes:path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');report.append({'page':path.stem,'before_sha256':hashlib.sha256(original).hexdigest(),'after_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'changes':changes})
if report:
 previous=json.loads(OUT.read_text()) if OUT.exists() else {}
 by_page={p['page']:p for p in previous.get('pages',[])}
 for item in report:by_page[item['page']]=item
 OUT.write_text(json.dumps({'pages':list(by_page.values()),'changed_fields':sum(len(p['changes']) for p in by_page.values())},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pages_changed':len(report),'caption_fields':sum(len(p['changes']) for p in report)}))
