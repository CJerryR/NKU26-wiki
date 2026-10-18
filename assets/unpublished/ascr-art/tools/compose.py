"""Turn the team's Inkscape file (total_2.svg) into the art slots of the
ascaroside story. Prints a JSON of {slot: svg-markup} plus one <defs> block."""
import json, re
from playwright.sync_api import sync_playwright
from geom import *

D=json.load(open('dump.json'))

def clean(html):
    html=re.sub(r'\s(?:inkscape|sodipodi):[\w-]+="[^"]*"','',html)
    html=re.sub(r'\s(?:id|xml:space)="[^"]*"','',html)
    html=re.sub(r'\s+',' ',html).replace('> <','><')
    return html

def art(ids, N, fix=None):
    out=[]
    for i in ids:
        e=D[i]; M=mul(N,tuple(e['P'])); h=clean(e['html'])
        if fix: h=fix(i,h)
        out.append(f'<g transform="{fmt(M)}">{h}</g>' if M!=(1,0,0,1,0,0) else h)
    return ''.join(out)

def T(tx,ty): return (1,0,0,1,tx,ty)

def unfill(cls):
    def f(i,h):
        h=re.sub(r'fill:#[0-9a-fA-F]{6};?','',h)
        return re.sub(r'<(path|rect)\b', rf'<\1 class="{cls}"', h)
    return f
def unfill_only(target_ids_cls):
    def f(i,h):
        # recolour the pocket block only (first rect / path with the given colour)
        for col,cls in target_ids_cls:
            h=re.sub(r'<(rect|path)([^>]*?)fill:'+col+r';?', rf'<\1 class="{cls}"\2', h)
        return h
    return f

SLOTS={}
SLOTS['recL']=art(['g64'], S(K_R,*REC_O))
SLOTS['recD']=art(['g65'], S(K_R,*REC_O))
SLOTS['pocket']=art(['g142'], mul(T(0,GAP*K_M), S(K_M,*P3_O)), unfill_only([('#410080','as-pk3')]))
SLOTS['mut']=art(['g143'], mul(T(0,GAP*K_M), S(K_M,*P18_O)), unfill_only([('#800030','as-pk18')]))
SLOTS['m3']=art(['g67'], S(K_M,*M3_O), unfill('as-a3'))
SLOTS['m18']=art(['g139'], S(K_M,*M18_O), unfill('as-a18'))
SLOTS['fung']=art(['g8','g26','g26-1','g26-2','g26-9','g26-9-4'], S(3.664,146.32,263.29))
SLOTS['cellIn']=art(['path77'], S(K_CELL,*CELL_C_ROOT))
SLOTS['nuc']=art(['path92'], S(K_CELL,155.47,147.34))
SLOTS['dna']=art(['path98'], S(K_CELL,155.91,149.0))
SLOTS['prom']=art(['rect99'], S(K_CELL,141.23,149.0))
SLOTS['gene']=art(['rect99-5','rect99-5-4'], S(K_CELL,163.125,149.0))
SLOTS['gB']=art(['g15'], S(4.17,112.14,16.15))
SLOTS['ste20']=art(['rect112'], S(4.99,131.60,19.77))
SLOTS['mapk']=art(['rect113'], S(5.99,146.88,17.59))
SLOTS['gG']=art(['g107-6'], S(2.49,165.96,14.81))
SLOTS['tfP']=art(['g107'], S(2.49,148.11,42.20))
SLOTS['tf']=art(['g13','g137'], S(3.076,120.98,71.66))
SLOTS['bud']=art(['path147','path149-3','path1010','path1010-9'], S(10.1,153.12,212.03))

# ---- defs referenced by the art (gradients, markers), renamed ak-*
allm=''.join(SLOTS.values())
need=set(re.findall(r'url\(#([^)]+)\)',allm))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.goto(__import__('pathlib').Path('t.html').resolve().as_uri())
    got={}; todo=list(need)
    while todo:
        i=todo.pop()
        if i in got: continue
        h=pg.evaluate("(i)=>{const e=document.getElementById(i);return e?e.outerHTML:null}", i)
        if h is None: print('MISSING DEF',i); continue
        got[i]=h
        for r in re.findall(r'(?:xlink:)?href="#([^"]+)"',h)+re.findall(r'url\(#([^)]+)\)',h):
            if r not in got: todo.append(r)
    b.close()
def rename(h):
    h=re.sub(r'url\(#([^)]+)\)',r'url(#ak-\1)',h)
    h=re.sub(r'(?:xlink:)?href="#([^"]+)"',r'href="#ak-\1"',h)
    return h
defs=[]
for i,h in got.items():
    h=re.sub(r'\s(?:inkscape|sodipodi):[\w-]+="[^"]*"','',h)
    h=h.replace(f'id="{i}"',f'id="ak-{i}"',1)
    defs.append(re.sub(r'\s+',' ',rename(h)).replace('> <','><'))
SLOTS={k:rename(v) for k,v in SLOTS.items()}
SLOTS['_defs']=''.join(sorted(defs))
json.dump(SLOTS,open('slots.json','w'),ensure_ascii=False,indent=0)
for k,v in SLOTS.items(): print(k,len(v))
print('defs',sorted(got))
