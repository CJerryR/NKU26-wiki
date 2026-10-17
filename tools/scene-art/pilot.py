"""Three-page pilot: molecular docking, awards, acknowledgements.
Code-built schematic art; no claims about structures, results or prizes.
Run with Python containing numpy + Pillow: python tools/scene-art/pilot.py
Then python tools/pack_scene_atlas.py <page> for each pilot page.
"""
from __future__ import annotations
import json, math, argparse, time
from pathlib import Path
import numpy as np
from mesh import Mesh, box, cylinder, torus, tube, uv_sphere, rotation, render
ROOT=Path(__file__).resolve().parents[2]

def sphere(at,r,scale=(1,1,1),mat=0,tone=0): return uv_sphere(at,r,scale,mat,tone,seg=18,rings=10)
def add(m,other,at=(0,0,0),s=1,yaw=0,pitch=0,roll=0,tone=0): return m.instance(other,at,s,yaw,pitch,roll,tone)
def line(m,a,b,r=.025,mat=0,tone=0): return add(m,tube([a,b],r,mat,tone))

def helix(phase=0):
    m=Mesh(); t=np.linspace(0,1,110)
    points=[(.13*math.cos(x*math.pi*2*4+phase),x*1.55,.13*math.sin(x*math.pi*2*4+phase)) for x in t]
    add(m,tube(points,.055,tone=.08,sides=8))
    # Main axis is lighter and finer than the coiled backbone.
    line(m,(0,0,0),(0,1.55,0),.023,1)
    return m

def receptor():
    halves=[Mesh(),Mesh()]; centers=[]
    for i in range(7):
        a=i*math.pi*2/7; x,z=.49*math.cos(a),.49*math.sin(a)
        target=halves[0 if x<0 else 1]; add(target,helix(i*.7),(x,.05,z),yaw=i*15,roll=math.sin(a)*9,tone=(i%3-1)*.035); centers.append((x,z))
    # Six connecting loops keep the seven helices visibly part of one schematic.
    for i in range(6):
        x,z=centers[i]; xx,zz=centers[i+1]; y=1.64 if i%2==0 else .06
        pts=[((1-t)*x+t*xx,y+math.sin(t*math.pi)*(.2 if i%2==0 else -.14),(1-t)*z+t*zz) for t in np.linspace(0,1,14)]
        add(halves[0 if (x+xx)<0 else 1],tube(pts,.035,tone=.1))
    return halves

def ligand(variant=0):
    m=Mesh(); nodes=[]
    for i in range(6):
        a=i*math.pi/3; nodes.append((.32*math.cos(a),.12*math.sin(a*2),.32*math.sin(a)))
    nodes += [(.66,.08,0),(.85,.23,.05),(-.58,.15,.05),(-.74,.02,.22)]
    if variant: nodes +=[(.38,.52,-.16),(.56,.67,-.25)]
    for i in range(6): line(m,nodes[i],nodes[(i+1)%6],.035,1)
    for a,b in [(0,6),(6,7),(3,8),(8,9)]+([(1,10),(10,11)] if variant else []): line(m,nodes[a],nodes[b],.04,1)
    for i,p in enumerate(nodes): add(m,sphere(p,.1 if i<6 else .12,mat=1 if i%3==0 else 0,tone=(i%3)*.045))
    return m

def water():
    m=Mesh(); add(m,sphere((0,0,0),.12,mat=1));
    for x in (-.14,.14): line(m,(0,0,0),(x,.12,.04),.025,1); add(m,sphere((x,.12,.04),.065,tone=.13))
    return m

def membrane():
    m=Mesh()
    for row in range(3):
        for col in range(7):
            x=(col-3)*.24; z=(row-1)*.26
            for side in (-1,1):
                y=.53+side*.38; add(m,sphere((x,y,z),.105,tone=(col%3)*.025))
                for dx in (-.035,.035): line(m,(x+dx,y-side*.08,z),(x+dx+.035,.53+side*.04,z+.015),.025,1)
    return m

def molecular_cloud():
    m=Mesh()
    for i,(p,s) in enumerate([((-.7,.18,0),.7),((.65,.5,.2),.65),((.05,.9,-.1),.5)]): add(m,ligand(i%2),p,s,yaw=i*37)
    for i in range(5): add(m,water(),(-.8+i*.38,.14+(i%2)*.8,.45),.7,yaw=i*20)
    return m

def trophy():
    m=Mesh(); add(m,box((0,.08,0),(.95,.16,.65),bevel=.06,tone=-.06)); add(m,box((0,.19,0),(.7,.1,.48),tone=.12)); add(m,cylinder((0,.45,0),.12,.48,tone=.05))
    # Open cup with an inner wall, rim, and curved handles.
    n=40; vs=[]; ns=[]; fs=[]
    for ring,(r,y) in enumerate([(.12,.62),(.3,.78),(.46,1.2),(.43,1.21),(.28,.82),(.12,.7)]):
        for j in range(n): a=j*2*math.pi/n; vs.append((r*math.cos(a),y,r*math.sin(a)))
    for i in range(5):
        for j in range(n): a=i*n+j;b=i*n+(j+1)%n;fs.extend([(a,b,a+n),(b,b+n,a+n)])
    m.add(vs,fs,material=0,tone=.12)
    add(m,torus((0,1.21,0),.445,.025,tone=.17))
    for sign in (-1,1):
        pts=[(sign*(.42-.19*t+.24*math.sin(t*math.pi)),1.15-t*.44,0) for t in np.linspace(0,1,24)]; add(m,tube(pts,.045,tone=.1))
    # Blank plaque: intentionally no rank, logo or year.
    add(m,box((0,.1,.331),(.36,.075,.014),material=1,bevel=.01)); return m

def medal():
    m=Mesh(); add(m,cylinder((0,.05,0),.37,.1,tone=.08)); add(m,torus((0,.108,0),.3,.018,tone=.2)); add(m,torus((0,.11,0),.25,.008,tone=-.06))
    # Radial embossed motif without a winner's position.
    for i in range(10):
        a=i*math.pi/5; line(m,(.2*math.cos(a),.12,.2*math.sin(a)),(.24*math.cos(a),.12,.24*math.sin(a)),.013,1)
    ribbon=Mesh(); add(ribbon,box((0,.02,0),(.18,.035,.65),tone=-.08)); add(m,ribbon,(-.12,0,-.53),yaw=-12);add(m,ribbon,(.12,0,-.53),yaw=12)
    return m

def laurel():
    m=Mesh()
    for s in (-1,1):
        pts=[(s*.43*math.sin(t*math.pi*.85),.1+t*.8,0) for t in np.linspace(0,1,25)]; add(m,tube(pts,.023,tone=.04))
        for i in range(7):
            t=(i+.5)/8;x=s*.43*math.sin(t*math.pi*.85);y=.1+t*.8
            leaf=sphere((0,0,0),1,(.065,.14,.028),tone=.08+i*.012);add(m,leaf,(x+s*.045,y,.015),roll=-s*40)
    return m

def podium():
    m=Mesh()
    # Unnumbered stage: decorative, does not imply a result.
    for x,h in [(-.72,.3),(0,.55),(.72,.22)]:
        add(m,box((x,h/2,0),(.68,h,.8),tone=.06,bevel=.055)); add(m,box((x,h+.012,0),(.7,.028,.83),material=1,bevel=.012))
    return m

def prize_station():
    m=Mesh(); add(m,podium());add(m,trophy(),(0,.58,0),.65); add(m,laurel(),(-.82,.3,0),.7,yaw=-15);add(m,medal(),(.75,.25,.12),.7,yaw=20)
    return m

def confetti():
    m=Mesh(); rng=np.random.default_rng(26)
    for i in range(16):
        add(m,box((0,0,0),(.12,.022,.055),material=1 if i%3==0 else 0,bevel=.009),(rng.uniform(-.8,.8),rng.uniform(0,1.15),rng.uniform(-.3,.3)),yaw=i*37,roll=i*23,pitch=i*19,tone=rng.uniform(-.02,.16))
    return m

def ribbon_scroll():
    m=Mesh(); pts=[(x,.2+.2*math.sin(x*3),.15*math.cos(x*3)) for x in np.linspace(-.7,.7,48)];add(m,tube(pts,.08,tone=.1));add(m,laurel(),(.4,.2,-.1),.75);add(m,medal(),(-.4,.05,.1),.55,yaw=20); return m

def envelope(part='base'):
    m=Mesh()
    if part=='base':
        add(m,box((0,.035,0),(1.5,.07,.92),material=1,bevel=.035))
        # Two raised folds create the recognizable envelope diagonal seams.
        for sign in (-1,1): line(m,(sign*.72,.084,-.42),(0,.086,.24),.013,0,.08)
        line(m,(-.72,.085,.42),(.72,.085,.42),.012,0,.08)
    elif part=='flap':
        verts=[(-.73,.09,-.44),(.73,.09,-.44),(0,.095,.23),(-.73,.11,-.44),(.73,.11,-.44),(0,.115,.23)]
        m.add(verts,[(3,4,5),(0,2,1),(0,1,4),(0,4,3),(1,2,5),(1,5,4),(2,0,3),(2,3,5)],material=0,tone=.16)
        add(m,cylinder((0,.13,.13),.115,.035,material=0,tone=.02))
    else:
        add(m,box((0,.025,0),(1.12,.05,.75),material=1,bevel=.02))
        # Only abstract rules; no names or invented acknowledgements.
        for z,w in [(-.18,.6),(-.05,.8),(.08,.72),(.21,.4)]: add(m,box((-.03,.054,z),(w,.008,.017),tone=.12,bevel=.003))
        add(m,sphere((.4,.06,-.22),.04,tone=.08))
    return m

def flower():
    m=Mesh(); line(m,(0,0,0),(0,.8,0),.025)
    for sign in (-1,1):add(m,sphere((0,0,0),1,(.06,.16,.025),tone=.08),(sign*.065,.32+sign*.08,0),roll=-sign*40)
    for i in range(6):a=i*math.pi/3;add(m,sphere((.12*math.cos(a),.87+.12*math.sin(a),0),.105,(1,.95,.45),mat=1,tone=.05))
    add(m,sphere((0,.87,.04),.075,tone=.12));return m

def bouquet():
    m=Mesh()
    # A folded paper sleeve and seven stems; the flowers vary in angle and size.
    for i in range(7):
        a=(i-3)*11; add(m,flower(),((i-3)*.075,0,(i%2)*.09),.8+(i%3)*.08,roll=a,tone=(i%3-1)*.03)
    add(m,box((0,.18,.025),(.4,.38,.25),material=1,bevel=.08));add(m,torus((0,.35,.025),.2,.02,tone=.1));return m

def gift():
    m=Mesh(); add(m,box((0,.3,0),(.85,.6,.7),tone=.04,bevel=.06));add(m,box((0,.64,0),(.93,.1,.77),tone=.16,bevel=.035))
    add(m,box((0,.35,.365),(.13,.58,.018),material=1,bevel=.008)); add(m,box((0,.7,0),(.13,.018,.77),material=1,bevel=.008))
    for sign in (-1,1):
        points=[(sign*.16*(1-math.cos(a)),.75+.11*math.sin(a),.03*math.sin(a)) for a in np.linspace(0,2*math.pi,35)];add(m,tube(points,.025,material=1))
    return m

def people():
    m=Mesh()
    # Five abstract, faceless tokens, not a count or portrayal of actual people.
    for i in range(5):
        x=(i-2)*.34; y=(i%2)*.1; add(m,cylinder((x,.12+y,0),.11,.24,tone=(i%3)*.06));add(m,sphere((x,.37+y,0),.105,tone=(i%3)*.06));add(m,cylinder((x,.025,0),.15,.05,material=1))
    return m

def correspondence():
    m=Mesh();add(m,envelope(),(-.25,.05,.1),.7,yaw=-12);add(m,envelope('flap'),(-.25,.05,.1),.7,yaw=-12);add(m,envelope('card'),(.45,.16,-.08),.65,yaw=24);add(m,flower(),(-.58,.06,-.2),.75,roll=-25);return m

def groups():
    left,right=receptor(); whole=Mesh();add(whole,left);add(whole,right)
    cloud=molecular_cloud(); ligands=Mesh();add(ligands,ligand(),(-.65,.2,0),.7,yaw=20);add(ligands,ligand(1),(.55,.25,.12),.65,yaw=-25)
    thanks=Mesh();add(thanks,gift(),(.48,0,.1),.8,yaw=18);add(thanks,bouquet(),(-.45,0,0),.9,yaw=-15)
    envbase=envelope();envflap=envelope('flap');envwhole=Mesh();add(envwhole,envbase);add(envwhole,envflap)
    return {
        'receptor-left':(left,whole),'receptor-right':(right,whole),'membrane':(membrane(),None),'ligand-a':(ligand(),None),'ligand-b':(ligand(1),None),'molecule-cloud':(cloud,None),
        'prize-station':(prize_station(),None),'medal':(medal(),None),'laurel':(laurel(),None),'confetti':(confetti(),None),'ribbon':(ribbon_scroll(),None),
        'envelope-base':(envbase,envwhole),'envelope-flap':(envflap,envwhole),'letter':(envelope('card'),None),'flowers-gift':(thanks,None),'people':(people(),None),'correspondence':(correspondence(),None)
    }

# Each entry is one true 3D group, not a screen-space collage.
ART={
    'model-docking':['receptor-left','receptor-right','membrane','ligand-a','ligand-b','molecule-cloud'],
    'awards':['prize-station','medal','laurel','confetti','ribbon'],
    'acknowledgements':['envelope-base','envelope-flap','letter','flowers-gift','people','correspondence'],
}

def layer(prop,w,x,y,tx,ty,r=0,tr=0,z=2,s=1,ts=1,win=(.08,.8),opacity=1,to_opacity=1):
    return dict(id=prop,prop=prop,w=w,z=z,depth=8 if z<4 else 18,**{'from':dict(x=x,y=y,r=r,s=s,o=opacity),'to':dict(x=tx,y=ty,r=tr,s=ts,o=to_opacity)},win=win)

def layouts():
    # All positions are in design units. Clear title band, dense lower stage,
    # cropped foreground and smaller upper clusters create three depth planes.
    docking_d=[
        layer('membrane',350,595,-235,710,-85,r=-8,tr=4,z=1),
        layer('molecule-cloud',330,-605,-225,-740,-55,r=12,tr=-8,z=1),
        layer('receptor-left',650,-350,250,-470,240,z=3,tr=-9),
        layer('receptor-right',650,-350,250,-310,240,z=3,tr=9),
        layer('ligand-a',270,390,180,20,130,r=-15,tr=10,z=4,win=(.24,.9)),
        layer('ligand-b',250,600,310,200,270,r=25,tr=-5,z=5,win=(.32,1)),
    ]
    docking_m=[layer('membrane',360,290,-430,420,-260,r=-12,z=1),layer('receptor-left',720,-70,350,-220,390,z=3,tr=-9),layer('receptor-right',720,-70,350,-20,390,z=3,tr=9),layer('ligand-a',260,240,170,80,200,r=-10,tr=16,z=4),layer('ligand-b',220,-280,-400,-390,-250,r=24,tr=-8,z=2)]
    awards_d=[layer('laurel',300,-610,-155,-740,-70,r=-18,tr=-28,z=1),layer('ribbon',360,575,-165,730,-80,r=12,tr=25,z=1),layer('prize-station',720,-260,290,-420,310,z=3,ts=1.08),layer('medal',390,410,260,330,100,r=14,tr=-12,z=4,win=(.18,.84)),layer('confetti',350,620,230,700,120,r=-10,tr=16,z=5)]
    awards_m=[layer('laurel',260,-280,-430,-400,-270,r=-14,tr=-28,z=1),layer('ribbon',310,270,-420,400,-280,r=15,tr=30,z=1),layer('prize-station',780,-100,380,-230,490,z=3),layer('medal',340,235,230,180,160,r=16,tr=-14,z=4),layer('confetti',300,260,500,330,340,z=5)]
    thanks_d=[layer('correspondence',400,-590,-160,-740,-50,r=-13,tr=-24,z=1),layer('people',390,580,-160,730,-40,r=9,tr=16,z=1),layer('flowers-gift',570,410,240,580,290,r=0,tr=8,z=3),layer('letter',420,-340,240,-310,70,r=-8,tr=6,z=3,win=(.24,.85)),layer('envelope-base',650,-310,280,-420,320,z=4),layer('envelope-flap',650,-310,280,-440,430,z=5,tr=-28,ts=.88,win=(.04,.56))]
    thanks_m=[layer('people',340,265,-420,410,-260,r=12,tr=20,z=1),layer('flowers-gift',480,230,400,370,500,z=2,tr=10),layer('letter',420,-130,340,-80,170,z=3,r=-8,tr=6,win=(.24,.85)),layer('envelope-base',650,-130,440,-250,520,z=4),layer('envelope-flap',650,-130,440,-270,640,z=5,tr=-28,ts=.88,win=(.04,.56))]
    result={}
    for page,d,m,signature in [('model-docking',docking_d,docking_m,'Seven schematic receptor helices separate in two connected groups as two schematic ligands approach.'),('awards',awards_d,awards_m,'A blank medal rises over an unnumbered violet podium. No award, ranking or result is asserted.'),('acknowledgements',thanks_d,thanks_m,'An envelope flap moves aside and a blank card rises; gifts, flowers and abstract tokens surround it.')]:
        for l in m:l['depth']=0
        result[page]=dict(page=page,sharedFrames=({'model-docking':['receptor-left','receptor-right'],'acknowledgements':['envelope-base','envelope-flap']}.get(page,[])),enabled=True,version='codex-3d-pilot',signature=signature,illustration='Code-rendered schematic decoration; not experimental evidence, actual molecular geometry, team size, or competition results.',desktop=dict(canvas=[1600,900],title=dict(y=-55,toY=-240,toScale=.62),layers=d),mobile=dict(canvas=[900,1600],title=dict(y=-85,toY=-360,toScale=.68),layers=m))
    result['model-docking']['desktop']['title']['fontSize']=104
    result['acknowledgements']['desktop']['title']['fontSize']=108
    result['acknowledgements']['mobile']['title']['fontSize']=70
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--layouts-only',action='store_true');ap.add_argument('--only',nargs='*');a=ap.parse_args(); library=groups()
    for page,layout in layouts().items():
        (ROOT/f'src/data/scenes/{page}.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n')
        if a.layouts_only: continue
        for name in ART[page]:
            if a.only and name not in a.only:continue
            obj,frame=library[name]; t=time.time();out=ROOT/f'assets/scenes/{page}/{name}.png'
            size=render(obj,out,width=1350,height=1020,frame=frame,yaw=18 if page!='acknowledgements' else -16,elevation=32 if page=='acknowledgements' else 27)
            print(page,name,size,round(time.time()-t,1),flush=True)
if __name__=='__main__':main()
