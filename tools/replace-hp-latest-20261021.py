"""Replace all three HP bodies from current Feishu exports, never append legacy prose."""
from pathlib import Path
import csv, hashlib, html, io, json, re, subprocess, zipfile
import xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parents[1]
EVID = ROOT.parents[1] / 'evidence/hp-refresh/replacement-20261021'
NS = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'a':'http://schemas.openxmlformats.org/drawingml/2006/main', 'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'o':'urn:schemas-microsoft-com:office:office', 's':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
W, R = '{'+NS['w']+'}', '{'+NS['r']+'}'
SLUGS = {'ihp':'human-practices', 'education':'education', 'investigation':'hp-investigation'}
PLAN = json.loads((EVID/'media-plan.json').read_text())
MEDIA = {(x['page'], x['file']):x for x in PLAN if x['used']}
BASE = '64173b935014ed8acc913f9ea12e22a85eb8022e'
REPORT = {'source_basis':'Fresh Feishu Word exports; page bodies replaced, no legacy union', 'baseline':BASE, 'pages':{}, 'formal_changes':[]}

def txt(e):
    return ''.join(t.text or '' for t in e.findall('.//w:t', NS)).strip()

def norm(s, page, kind='body'):
    original = s
    s = s.replace('\u2011', '-').replace('Human practices', 'Human Practices').replace('human practices', 'Human Practices')
    s = re.sub(r'\bFig\.\s*(\d+)([A-Fa-f]?)', lambda m:'Figure '+m[1]+m[2].lower(), s)
    s = re.sub(r'\be\.g\.(?!,)', 'e.g.,', s)
    s = re.sub(r'\bi\.e\.(?!,)', 'i.e.,', s)
    if kind == 'body':
        # The draft uses these only once each, below the three-use abbreviation threshold.
        s = s.replace(' (USTC)', '').replace('ascr#3', 'ascaroside #3').replace('ascr#18', 'ascaroside #18')
        if page == 'ihp':
            s = re.sub(r'\bHP\b', 'Human Practices', s).replace('sampling SOP', 'sampling standard operating procedure')
    if s != original:
        REPORT['formal_changes'].append({'page':page, 'kind':kind, 'before':original, 'after':s})
    return s

def heading(s):
    s = re.sub(r'^\d+(?:\.\d+)*\.?\s+', '', s)
    # Sentence case with named institutions and event names preserved.
    protected = ['US-China Human Practices Summit', 'The Nematode Hunt', 'Exploring Biological Signals', 'Small Lives and Everyday Contributions', 'Tianjin', 'Human Practices', 'National Natural History Museum of China', 'China Agricultural Museum', 'Beijing Academy of Agriculture and Forestry Sciences', 'Yurong Yao', 'Qian Liu', 'Zhihao Pang', 'US-China', 'iGEM', 'NemaKlear', 'HP']
    tokens={f'ZZTOKEN{i}ZZ':p for i,p in enumerate(protected)}
    for token,p in tokens.items(): s=s.replace(p, token)
    s=s.lower()
    if s: s=s[0].upper()+s[1:]
    for token,p in tokens.items(): s=s.replace(token.lower(),p).replace(token.capitalize(),p)
    return s

def rich(p, rels, page, kind='body'):
    out=[]; crosslinks=[]
    for x in p:
        if x.tag == W+'r':
            t=html.escape(norm(''.join(n.text or '' for n in x.findall('w:t', NS)), page, kind))
            if not t: continue
            pr=x.find('w:rPr', NS)
            if pr is not None:
                if pr.find('w:i', NS) is not None: t='<em>'+t+'</em>'
                if kind!='caption' and pr.find('w:b', NS) is not None: t='<strong>'+t+'</strong>'
                vert=pr.find('w:vertAlign', NS)
                if vert is not None:
                    tag='sup' if vert.get(W+'val')=='superscript' else 'sub';t='<'+tag+'>'+t+'</'+tag+'>'
            out.append(t)
        elif x.tag==W+'hyperlink':
            target=rels.get(x.get(R+'id'),'#');label=html.escape(norm(txt(x),page,kind))
            if '2026.igem.wiki/nku-china/' in target:
                out.append(label);crosslinks.append((target,label))
            else:out.append('<a href="'+html.escape(target,quote=True)+'">'+label+'</a>')
    for target,label in dict.fromkeys(crosslinks):
        out.append(' <a data-hp-crosslink="true" href="'+html.escape(target,quote=True)+'">Explore '+label+' →</a>')
    return ''.join(out)

def paragraphs(el):
    if el.tag==W+'p': yield el
    else:
        for child in el:
            if child.tag in (W+'tbl',W+'tr',W+'tc',W+'body',W+'sdt',W+'sdtContent',W+'p'):
                yield from paragraphs(child)

def workbook_rows(data):
    z=zipfile.ZipFile(io.BytesIO(data));ss=[]
    if 'xl/sharedStrings.xml' in z.namelist(): ss=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))]
    sheet=next(n for n in z.namelist() if n.startswith('xl/worksheets/sheet') and n.endswith('.xml'))
    out=[]
    for row in E.fromstring(z.read(sheet)).findall('.//s:row',NS):
        cells=[]
        for c in row.findall('s:c',NS):
            v=c.find('s:v',NS);v=v.text if v is not None else ''.join(c.find('s:is',NS).itertext()) if c.find('s:is',NS) is not None else ''
            cells.append(ss[int(v)] if c.get('t')=='s' else v)
        if any(cells): out.append(cells)
    return out

def cap_format(s, number):
    s=re.sub(r'^Figure\s+\d+\.', 'Figure '+str(number)+'.', s)
    s=re.sub(r'\bB, C,', '(b) and (c)', s)
    s=re.sub(r'\b([A-Fa-f]),\s+', lambda m:'('+m[1].lower()+') ', s)
    s=re.sub(r'(?<=in )B\b', '(b)', s)
    s=re.sub(r'\(([A-F])\)',lambda m:'('+m[1].lower()+')',s)
    # Semicolons separate the individual panel descriptions.
    s=re.sub(r'(?<=[.!?])\s+(?=\([b-f]\))', '; ', s)
    s=s.replace('.; ', '; ')
    return s

def figure_block(page, images, caption, source_ids):
    m=[MEDIA[(page, name)] for name in images]
    alt=re.sub(r'^Figure \d+\.\s*','',re.split(r'\.\s',caption,maxsplit=2)[1] if '. ' in caption else caption).rstrip('.')+'.'
    if len(m)==1:
        x=m[0];return {'_template':'image','src':x.get('preview_url') or x['cdn_url'],'originalSrc':x['cdn_url'],'openOriginal':True,'alt':alt,'body':caption,'layout':'full'},source_ids
    items=[]
    for i,x in enumerate(m):
        label=chr(97+i)
        items.append('<div class="hp-photo-item"><p class="hp-image-label">('+label+')</p><a href="'+x['cdn_url']+'"><img src="'+(x.get('preview_url') or x['cdn_url'])+'" alt="'+html.escape(alt+' Panel '+label+'.',quote=True)+'" loading="lazy" width="'+str(x['dimensions'][0])+'" height="'+str(x['dimensions'][1])+'"></a></div>')
    group='hp-photo-group'+(' hp-photo-group--three' if len(m)>=3 else '')
    f='<figure class="figure hp-source-figure"><div class="figure__media '+group+'">'+''.join(items)+'</div><figcaption>'+html.escape(caption)+'</figcaption></figure>'
    return {'_template':'text','body':f},source_ids

def build(page, slug):
    z=zipfile.ZipFile(EVID/'sources'/(page+'.docx'))
    rels={x.get('Id'):x.get('Target') for x in E.fromstring(z.read('word/_rels/document.xml.rels'))}
    root=E.fromstring(z.read('word/document.xml')).find('w:body',NS)
    old=json.loads(subprocess.check_output(['git','show',BASE+':content/wiki/'+slug+'.json'],cwd=ROOT))
    old_heads=[b for b in old['blocks'] if b['_template']=='heading']
    ids=set(re.findall(r'(?:id="|#)([a-z][a-z0-9-]+)',json.dumps(old['blocks'],ensure_ascii=False).replace('\\"','"')))
    anchor_map={re.sub(r'^\d+(?:\.\d+)*\s+','',b['text']).lower():b.get('attributes','').split()[0] for b in old_heads if b.get('attributes','').startswith('#')}
    blocks=[{'_template':'text','body':'<div class="reading-layout hp-manuscript" lang="en">'}]
    locs=[[]]; source_prose=[];source_headings=[];source_images=[];source_tables=[]
    pending=[];pending_ids=[];major=minor=fig=table=0;used_ids=set();hp_defined=False
    for index,p in enumerate(paragraphs(root)):
        text=txt(p);style=p.find('w:pPr/w:pStyle',NS);style=style.get(W+'val') if style is not None else None
        if text.startswith('HP ->') or text=='点击图片可查看完整电子表格': continue
        ole=p.find('.//o:OLEObject',NS)
        if ole is not None:
            target=rels[ole.get(R+'id')];rows=workbook_rows(z.read('word/'+target));source_tables.append(rows)
            for row in rows:
                for k,c in enumerate(row):row[k]=norm(c,page,'table')
            if page=='ihp':
                rows=[[c.replace('255 soil samples','289 soil samples') for c in row] for row in rows]
            if page=='investigation':
                rows=[['Subtotal (selected examples)', c[1], 'Six provincial-level regions; partial inventory'] if c[0]=='Total' else c for c in rows]
            table+=1;stream=io.StringIO();csv.writer(stream,lineterminator='\n').writerows(rows)
            title={'ihp':'Human Practices activity, project questions, and team responses','education':'Course versions by age group','investigation':'Selected sample sources and backgrounds (255 of 289 samples; six of nine provincial-level regions)'}[page]
            blocks.append({'_template':'datatable','title':'Table '+str(table)+'. '+title+'.','csv':stream.getvalue().rstrip('\n')});locs.append([index]);continue
        images=[rels[b.get(R+'embed')].split('/')[-1] for b in p.findall('.//a:blip',NS)]
        if images:
            pending+=images;pending_ids.append(index);source_images+=images
        if not text: continue
        if re.match(r'^Figure\s+\d+\.',text):
            assert pending,(page,index,text)
            fig+=1;c=cap_format(norm(text,page,'caption'),fig);b,loc=figure_block(page,pending,c,pending_ids+[index]);blocks.append(b);locs.append(loc);pending=[];pending_ids=[];continue
        if style in ['1','2','3']:
            label=heading(norm(text,page,'heading'));source_headings.append({'source':text,'display':label,'style':style})
            if style=='1': blocks.append({'_template':'manuscriptTitle','manuscript':label});locs.append([index]);continue
            if style=='2':major+=1;minor=0;level=2
            else:minor+=1;level=3
            anchor=anchor_map.get(label.lower(), '#'+slug+'-draft-'+str(index));used_ids.add(anchor[1:])
            blocks.append({'_template':'heading','level':level,'text':(str(major)+'.'+str(minor)+' ' if level==3 else '')+label,'attributes':anchor});locs.append([index]);continue
        source_prose.append({'id':index,'text':text})
        content=rich(p,rels,page)
        if page=='ihp':content=content.replace('255 samples from six provincial-level regions','289 samples from nine provincial-level regions')
        if page=='investigation':content=content.replace('255 soil samples from six provincial-level regions</strong>: Jilin,', '289 soil samples from nine provincial-level regions</strong>. The selected examples below document sources from six of these regions: Jilin,')
        if page=='investigation' and not hp_defined and re.search(r'\bHP\b',content):
            content=re.sub(r'\bHP\b','<strong>Human Practices (HP)</strong>',content,count=1);hp_defined=True
        blocks.append({'_template':'text','body':'<p data-hp-draft-paragraph="'+str(index)+'">'+content+'</p>'});locs.append([index])
    assert not pending,(page,pending)
    # Attach only complete nearby paragraphs in the same section to suitable single images.
    remove=set();wraps=[]
    for i,b in enumerate(blocks):
        if b['_template']!='image':continue
        image_id=locs[i][0];x=next(x for x in MEDIA.values() if x['page']==page and x['cdn_url']==b['originalSrc'])
        ratio=x['dimensions'][0]/x['dimensions'][1]
        if ratio>1.35 or len(b['body'])>420:continue
        a=i-1
        while a>0 and blocks[a]['_template']=='text' and blocks[a].get('body','').startswith('<p data-hp-draft-paragraph='):a-=1
        before=list(range(a+1,i));end=i+1
        while end<len(blocks) and blocks[end]['_template']=='text' and blocks[end].get('body','').startswith('<p data-hp-draft-paragraph='):end+=1
        after=list(range(i+1,end));indices=before+after
        if not indices:continue
        body='\n\n'.join(blocks[j]['body'] for j in indices)
        b['accompanyingBody']=body;b['layout']='wrap-right';b['imageWidth']='wide' if page=='investigation' and b['body'].startswith('Figure 2.') else 'medium'
        remove.update(indices);wraps.append({'figure':b['body'].split('.')[0],'source_paragraph_ids':[locs[j][0] for j in indices],'layout':b['layout'],'aspect_ratio':ratio})
    blocks=[b for i,b in enumerate(blocks) if i not in remove]
    # Keep incoming section anchors as invisible compatibility markers, never old copy.
    aliases=sorted(ids-used_ids)
    if aliases:blocks.append({'_template':'text','body':''.join('<span id="'+s+'" aria-hidden="true"></span>' for s in aliases)})
    blocks.append({'_template':'text','body':'</div>'})
    d=old;d['blocks']=blocks;d['sub']='';d['preserveAuthorFormatting']=True
    if page=='ihp':d['title']=d['heading']='Integrated Human Practices'
    d['crumbs']=['Human Practices',d['title']]
    (ROOT/'content/wiki'/(slug+'.json')).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    REPORT['pages'][slug]={'source_sha256':hashlib.sha256((EVID/'sources'/(page+'.docx')).read_bytes()).hexdigest(),'source_paragraphs':source_prose,'headings':source_headings,'source_images':source_images,'tables':source_tables,'figure_count':fig,'wraps':wraps,'legacy_navigation_removed':True,'invented_overview_heading_removed':True,'legacy_prose_imported':False}

for name,slug in SLUGS.items():build(name,slug)
(EVID/'replacement-source-map.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({s:{'figures':x['figure_count'],'prose_paragraphs':len(x['source_paragraphs']),'source_images':len(x['source_images']),'wraps':len(x['wraps'])} for s,x in REPORT['pages'].items()},indent=2))
