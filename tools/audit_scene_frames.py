"""Check every referenced source sprite for opaque geometry cut by its canvas.
Development check; requires Pillow, like the atlas packer. Soft floor shadows
below 50% opacity are excluded from the geometry boundary check.
"""
from pathlib import Path
from PIL import Image
import json,sys
ROOT=Path(__file__).resolve().parents[1]
def audit():
 rows=[]
 for path in sorted((ROOT/'src/data/scenes').glob('*.json')):
  if path.name.endswith('.atlas.json'):continue
  layout=json.loads(path.read_text())
  for prop in sorted({layer['prop'] for kind in ['desktop','mobile'] for layer in layout[kind]['layers']}):
   image=Image.open(ROOT/f'assets/scenes/{path.stem}/{prop}.png').convert('RGBA');alpha=image.getchannel('A');w,h=image.size
   strips=[alpha.crop((0,0,w,1)),alpha.crop((0,h-1,w,h)),alpha.crop((0,0,1,h)),alpha.crop((w-1,0,w,h))]
   counts=[sum(v>128 for v in strip.tobytes()) for strip in strips]
   edge_max=[max(strip.tobytes()) for strip in strips]
   rows.append({'page':path.stem,'prop':prop,'size':[w,h],'opaque_edges':counts,'edge_alpha_max':edge_max,'pass':max(counts)<=1 and max(edge_max)<=8})
 return {'checked':len(rows),'failures':[row for row in rows if not row['pass']],'sources':rows}
if __name__=='__main__':
 result=audit()
 if len(sys.argv)>1:Path(sys.argv[1]).write_text(json.dumps(result,indent=2))
 print(f"Source sprite boundary check: {result['checked']} references, {len(result['failures'])} failures")
 for row in result['failures']:print(row)
 sys.exit(bool(result['failures']))
