"""Re-render source islands whose opaque geometry touched the camera boundary.
Runs the known checkpoint-08 repairs; caches completed sources for safe resume.
"""
from pathlib import Path
import sys,json,math,time
import numpy as np
from PIL import Image
sys.path.insert(0,str(Path(__file__).parent/'scene-art'))
import islands as I
from sdf import render
ROOT=Path(__file__).resolve().parents[1]
NAMES=['desc-roots','molecules','field','edu-board','crowd','edu-micro','ode-phone','gears','md-slab','safe-body','safe-sash','res-membrane','env-open','env-closed','hp-farmers','eng-learn']
OUT=ROOT/'assets/scenes/_repaired'
def edges(im):
 a=np.asarray(im)[:,:,3]
 return [int((x>128).sum()) for x in [a[0],a[-1],a[:,0],a[:,-1]]]
def run(name):
 OUT.mkdir(exist_ok=True,parents=True)
 if (OUT/f'{name}.json').exists():return
 t=time.time();r=I.REG[name];prop=I.build(name);original=r.get('checkpoint08_extent', r['extent']);prop.extent=original
 # Widen the orthographic camera, keeping its target and direction fixed.
 # The safety cabinet and both envelope states share this camera expansion.
 factor=1.7
 for attempt in range(5):
  prop.extent=original*factor;prop.crop=False
  for part in prop.parts:part.bound=None
  preview=render(prop,size=160,supersample=1)
  if not any(edges(preview)):break
  factor*=1.25
 else:raise RuntimeError(f'{name}: cannot fit geometry')
 prop.extent*=1.08;prop.crop=False
 for part in prop.parts:part.bound=None
 size=min(1450,max(760,round(2*prop.extent*440)))
 full=render(prop,size=round(size*1.5),supersample=1)
 full=full.resize((round(full.width/1.5),round(full.height/1.5)),Image.Resampling.LANCZOS)
 if any(edges(full)):raise RuntimeError(f'{name}: full resolution still clipped {edges(full)}')
 if r['crop']:
  l,t0,rr,b=full.getbbox();pad=12
  im=full.crop((max(0,l-pad),max(0,t0-pad),min(full.width,rr+pad),min(full.height,b+pad)))
 else:im=full
 im.save(OUT/f'{name}.png',optimize=True)
 oldsize=r['px'] or min(1100,round(2*original*I.PXW))
 meta={'extent':prop.extent,'old_extent':original,'size':size,'pxw':size/(2*prop.extent),'old_pxw':oldsize/(2*original),'edge_opaque':edges(im),'seconds':round(time.time()-t,2)}
 (OUT/f'{name}.json').write_text(json.dumps(meta,indent=2))
 print(name,im.size,meta,flush=True)
if __name__=='__main__':
 for name in sys.argv[1:] or NAMES:run(name)
