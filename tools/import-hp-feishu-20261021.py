"""Import the two 2026-10-21 Feishu exports; keep the source OOXML in local evidence."""
from pathlib import Path
import subprocess
import json,zipfile,xml.etree.ElementTree as E,re,html
ROOT=Path(__file__).resolve().parents[1]
EVID=ROOT.parents[1]/'evidence/hp-refresh'
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
W='{'+NS['w']+'}';R='{'+NS['r']+'}'
media=json.loads((EVID/'media-plan.json').read_text())
preview_source={str(Path(x['source']).relative_to('workspace/evidence/hp-refresh/sources')):x.get('preview_url',x.get('cdn_url')) for x in media}
by_source={str(Path(x['source']).relative_to('workspace/evidence/hp-refresh/sources')):x.get('cdn_url') for x in media}
NAV='<nav class="hp-chapter-nav" aria-label="Human Practices chapters"><a href="/human-practices/">iHP</a><a href="/hp-investigation/">Investigation</a><a href="/education/">Education</a></nav>'
def text(x):return ''.join(t.text or '' for t in x.findall('.//w:t',NS)).strip()
def phtml(p,rels):
 out=''
 for x in p:
  if x.tag==W+'r':
   t=html.escape(''.join(n.text or '' for n in x.findall('w:t',NS)))
   if not t:continue
   pr=x.find('w:rPr',NS)
   if pr is not None:
    if pr.find('w:i',NS) is not None:t='<em>'+t+'</em>'
    if pr.find('w:b',NS) is not None:t='<strong>'+t+'</strong>'
    va=pr.find('w:vertAlign',NS)
    if va is not None:t=('<sup>' if va.get(W+'val')=='superscript' else '<sub>')+t+('</sup>' if va.get(W+'val')=='superscript' else '</sub>')
   out+=t
  elif x.tag==W+'hyperlink':out+='<a href="'+html.escape(rels.get(x.get(R+'id'),'#'))+'">'+html.escape(text(x))+'</a>'
 return '<p>'+out+'</p>' if out.strip() else ''
def caption(s):
 s=re.sub(r'(?<=in )([A-F])\b',lambda m:m[1].lower(),s)
 s=re.sub(r'\b([A-F]),',lambda m:m[1].lower()+',',s)
 s=re.sub(r'([Ff]ig(?:ure)?\.?\s*\d+)([A-F])\b',lambda m:m[1]+m[2].lower(),s)
 return s
def group(name,imgs,cap,wrapbody=''):
 al=cap.split('. ',2)[1] if '. ' in cap else cap
 items=''.join('<div class="hp-photo-item">'+(('<p class="hp-image-label">'+chr(97+i)+'</p>') if len(imgs)>1 else '')+'<a href="'+by_source[name+'/'+img.split('/')[-1]]+'"><img src="'+preview_source[name+'/'+img.split('/')[-1]]+'" alt="'+html.escape(al+((' ('+chr(97+i)+')') if len(imgs)>1 else ''),quote=True)+'" loading="lazy"></a></div>' for i,img in enumerate(imgs))
 f='<figure class="figure hp-source-figure"><div class="figure__media hp-photo-group'+(' hp-photo-group--three' if len(imgs)==3 else '')+'">'+items+'</div><figcaption>'+html.escape(caption(cap))+'</figcaption></figure>'
 if wrapbody:f='<div class="figure-text figure-text--wrap figure-text--right" style="--image-share:40%">'+f+'<div class="figure-text__body">'+wrapbody+'</div></div>'
 return {'_template':'text','body':f}
def sheet_html(f):
 z=zipfile.ZipFile(f);ss=[]
 if 'xl/sharedStrings.xml' in z.namelist():ss=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))]
 rows=[]
 for r in E.fromstring(z.read(next(n for n in z.namelist() if n.startswith('xl/worksheets/sheet') and n.endswith('.xml')))).findall('.//s:row',NS):
  row=[]
  for c in r.findall('s:c',NS):
   v=c.find('s:v',NS);v=v.text if v is not None else ''.join(c.find('s:is',NS).itertext()) if c.find('s:is',NS) is not None else ''
   row.append(ss[int(v)] if c.get('t')=='s' else v)
  rows.append(row)
 return '<div class="table-wrap" tabindex="0"><table><thead><tr>'+''.join('<th scope="col">'+html.escape(x)+'</th>' for x in rows[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+html.escape(x)+'</td>' for x in row)+'</tr>' for row in rows[1:])+'</tbody></table></div>'
def build(name,slug):
 z=zipfile.ZipFile(EVID/'sources'/ (name+'.docx'));body=list(E.fromstring(z.read('word/document.xml')).find('w:body',NS));rels={x.get('Id'):x.get('Target') for x in E.fromstring(z.read('word/_rels/document.xml.rels'))}
 paras={i:phtml(x,rels) for i,x in enumerate(body) if x.tag==W+'p'}
 def paras_inside(i):return ''.join(phtml(p,rels) for p in body[i].findall('.//w:p',NS) if text(p) and not text(p).startswith('Figure '))
 def imgs(i):return [rels[a.get(R+'embed')] for a in body[i].findall('.//a:blip',NS)]
 page=json.loads((ROOT/'content/wiki'/ (slug+'.json')).read_text())
 blocks=[{'_template':'text','body':NAV+'<section class="reading-layout hp-manuscript" lang="en">'},{'_template':'heading','text':'Human practices overview' if name=='ihp' else 'Education overview','level':2},{'_template':'manuscriptTitle','manuscript':text(body[1])}]
 skip={0,1};special={}
 if name=='ihp':
  for image_i,cap_i in [(9,11),(17,19),(26,27),(32,33),(38,40),(45,47)]:
   special[image_i]=group(name,imgs(image_i),text(body[cap_i]));skip.add(cap_i)
  # Full paragraphs follow the same reading order; the figure and its caption float together.
  for image_i,indices in [(9,[7,8,12]),(26,[22,23,24,25])]:
   ci={9:11,26:27,32:33}[image_i];special[min(indices)]=group(name,imgs(image_i),text(body[ci]),''.join(paras[i] for i in indices));skip.update(indices);skip.add(image_i);skip.discard(min(indices))
  special[52]={'_template':'text','body':sheet_html(EVID/'sources/ihp-Microsoft_Excel_Worksheet1.xlsx')};skip.add(53)
 else:
  cap1=next(text(p) for p in body[2].findall('.//w:p',NS) if text(p).startswith('Figure '));special[2]=group(name,imgs(2),cap1,paras_inside(2)+paras[3]);skip.add(3)
  for ii,ci in [(18,20),(30,32)]:special[ii]=group(name,imgs(ii),text(body[ci]));skip.add(ci)
  special[46]=group(name,imgs(46)+imgs(48),text(body[50]),paras_inside(46)+paras_inside(48)+paras[51]);skip.update([48,50,51])
  special[23]={'_template':'text','body':sheet_html(EVID/'sources/education-Microsoft_Excel_Worksheet1.xlsx')};skip.add(24)
 for i,x in enumerate(body):
  if i in skip:continue
  if i in special:blocks.append(special[i]);continue
  t=text(x)
  if not t:continue
  style=x.find('w:pPr/w:pStyle',NS)
  if style is not None and style.get(W+'val') in ['1','2','3']:
   t=re.sub(r'^\d+(?:\.\d+)*\.?\s+','',t)
   # Course names retain the wording but follow the site's sentence case convention.
   for a,b in [('The Nematode Hunt','the nematode hunt'),('Exploring Biological Signals','exploring biological signals'),('Small Lives and Everyday Contributions','small lives and everyday contributions')]:t=t.replace(a,b)
   t=re.sub(r'(: )([A-Z])',lambda m:m[1]+m[2].lower(),t)
   blocks.append({'_template':'heading','text':t,'level':3 if style.get(W+'val')=='3' else 2,'attributes':'#'+slug+'-source-'+str(i)})
  else:blocks.append({'_template':'text','body':paras.get(i,paras_inside(i))})
 blocks.append({'_template':'text','body':'</section>'});page['blocks']=blocks
 if name=='ihp':
  for block in blocks:
   if 'body' in block:block['body']=block['body'].replace('255 samples from six provincial-level regions','289 samples from nine provincial-level regions').replace('255 soil samples','289 soil samples')
 page['preserveAuthorFormatting']=True
 (ROOT/'content/wiki'/ (slug+'.json')).write_text(json.dumps(page,ensure_ascii=False,indent=2)+'\n')
for n,s in [('ihp','human-practices'),('education','education')]:build(n,s)
p=ROOT/'content/wiki/hp-investigation.json';d=json.loads(subprocess.check_output(['git','show','fd9b5a6e3c5ff568966c81ac691db61046568a2f:content/wiki/hp-investigation.json'],cwd=ROOT))
for b in d['blocks']:
 if '<nav class="hp-chapter-nav"' in b.get('body',''):b['body']=re.sub(r'<nav class="hp-chapter-nav".*?</nav>',NAV,b['body'])
 if b['_template']=='layout':b['_template']='text';b.pop('kind',None);b.pop('label',None);b.pop('attributes',None)
 if 'body' in b:b['body']=caption(b['body'])
# Single interview photographs use the same shared wrap as Project.
new=[]
for b in d['blocks']:
 if '<figure' in b.get('body','') and b.get('body','').startswith('### '):
  for part in re.split(r'(?=^### )',b['body'],flags=re.M):
   if not part.strip():continue
   h,rest=part.split('\n',1);m=re.match(r'### (.*?) (\{.*?\})$',h)
   new.append({'_template':'heading','level':3,'text':m[1],'attributes':m[2][1:-1]})
   fig=re.search(r'<figure.*?</figure>',rest,re.S)
   new.append({'_template':'text','body':'<div class="figure-text figure-text--wrap figure-text--right" style="--image-share:40%">'+fig[0]+'<div class="figure-text__body">'+rest[:fig.start()].strip()+rest[fig.end():].strip()+'</div></div>'})
 else:new.append(b)
d['blocks']=new
for b in d['blocks']:
 if 'body' in b:
  b['body']=re.sub(r'Figure (1[6-9]|2[01])\.',lambda m:'Figure '+str(int(m[1])-15)+'.',b['body'])
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
# Keep secondary heading numbering in source; this is required for author-formatted pages.
for slug in ['human-practices','education','hp-investigation']:
 p=ROOT/'content/wiki'/(slug+'.json');d=json.loads(p.read_text());major=0;minor=0
 for b in d['blocks']:
  if b['_template']=='heading':
   if b.get('level',2)==2:major+=1;minor=0
   elif b.get('level')==3:
    minor+=1;b['text']=str(major)+'.'+str(minor)+' '+re.sub(r'^\d+\.\d+\s+','',b['text'])
  if 'body' in b:
   lines=[]
   for line in b['body'].split('\n'):
    if line.startswith('### '):
     minor+=1;line='### '+str(major)+'.'+str(minor)+' '+re.sub(r'^\d+\.\d+\s+','',line[4:])
    lines.append(line)
   b['body']='\n'.join(lines)
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
p=ROOT/'src/data/nav.ts';s=p.read_text();start=s.index("    kind: 'group', id: 'hp'");end=s.index("\n  },",start)
s=s[:start]+"    kind: 'group', id: 'hp', label: 'Human practices', narrow: true, items: [\n      { page: 'human-practices', label: 'iHP', blurb: 'Bringing real-world perspectives into research' },\n      { page: 'hp-investigation', label: 'Investigation', blurb: 'Exploring agriculture through visits and dialogue' },\n      { page: 'education', label: 'Education', blurb: 'Making synthetic biology and our project accessible' },\n    ],"+s[end:];p.write_text(s)
