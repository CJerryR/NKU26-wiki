"""Dump, for each element of the team's Inkscape file, its markup and the matrix
from its parent to the document's user space (mm), plus its bbox in mm."""
from playwright.sync_api import sync_playwright
import json
IDS=['g64','g65','g67','g139','g142','g143','path77','path92','path98','rect99','rect99-5','rect99-5-4',
     'g13','g137','g15','rect112','rect113','g107','g107-6','path147','path149-3','path1010','path1010-9','g8','g26','g26-1','g26-2','g26-9','g26-9-4','text26','path143','path74','g119']
svg=open('../total_2.svg').read().replace('width="210mm"','width="210"').replace('height="297mm"','height="297"')
# drop the mesh polyfill script so nothing is drawn by script
import re
svg=re.sub(r'<script[\s\S]*?</script>','',svg)
open('t.html','w').write("<html><body style='margin:0'>"+svg+"</body></html>")
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto(__import__('pathlib').Path('t.html').resolve().as_uri())
    res=pg.evaluate("""(ids)=>{const root=document.querySelector('svg');const R=root.getCTM().inverse();const out={};
      for(const id of ids){const e=document.getElementById(id); if(!e){out[id]=null;continue;}
        const P=R.multiply(e.parentNode.getCTM()); const M=R.multiply(e.getCTM()); const bb=e.getBBox();
        const pts=[[bb.x,bb.y],[bb.x+bb.width,bb.y],[bb.x,bb.y+bb.height],[bb.x+bb.width,bb.y+bb.height]].map(([x,y])=>[M.a*x+M.c*y+M.e,M.b*x+M.d*y+M.f]);
        const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
        out[id]={html:e.outerHTML,P:[P.a,P.b,P.c,P.d,P.e,P.f],bbox:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};}
      return out;}""", IDS)
    json.dump(res,open('dump.json','w'),indent=0)
    for k,v in res.items(): print(k, None if v is None else [round(x,2) for x in v['bbox']], None if v is None else [round(x,4) for x in v['P']])
    b.close()
