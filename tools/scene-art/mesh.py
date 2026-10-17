"""Offline orthographic mesh renderer. numpy + Pillow; no browser GPU dependency.
Smooth normals, z-buffer, shadow maps, transparent ground contact shadows.
Y is up; each object can be instanced with a deterministic transform and tone.
"""
from __future__ import annotations
import math
import numpy as np
from PIL import Image, ImageFilter

IRIS = np.array([[44,29,79],[82,58,140],[110,79,184],[155,127,224],[215,203,224]], float)
PAPER = np.array([[93,76,126],[151,133,172],[199,184,211],[230,220,231],[247,240,234]], float)
AMBER = np.array([[90,55,8],[143,93,16],[226,162,60],[248,221,164],[255,241,216]], float)
PALETTES = [IRIS, PAPER, AMBER]

def unit(v):
    a = np.asarray(v, float)
    return a / np.maximum(np.linalg.norm(a, axis=-1, keepdims=True), 1e-12)

def rotation(yaw=0, pitch=0, roll=0):
    y,p,r = np.radians([yaw,pitch,roll]); cy,sy,cp,sp,cr,sr = np.cos(y),np.sin(y),np.cos(p),np.sin(p),np.cos(r),np.sin(r)
    return np.array([[cr,-sr,0],[sr,cr,0],[0,0,1]]) @ np.array([[1,0,0],[0,cp,-sp],[0,sp,cp]]) @ np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]])

class Mesh:
    def __init__(self): self.items=[]
    def add(self, vertices, faces, normals=None, material=0, tone=0):
        v=np.asarray(vertices,float); f=np.asarray(faces,int)
        if normals is None:
            n=unit(np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])); v=v[f].reshape(-1,3); f=np.arange(len(v)).reshape(-1,3); normals=np.repeat(n,3,axis=0)
        self.items.append((v,f,np.asarray(normals),material,tone)); return self
    def instance(self, other, at=(0,0,0), scale=1, yaw=0, pitch=0, roll=0, tone=0):
        R=rotation(yaw,pitch,roll); s=np.broadcast_to(scale,(3,))
        for v,f,n,m,t in other.items: self.items.append(((v*s) @ R.T+at,f,unit((n/s)@R.T),m,t+tone))
        return self
    def bounds(self): return np.concatenate([v for v,*_ in self.items])

def uv_sphere(at=(0,0,0), radius=1, scale=(1,1,1), material=0, tone=0, seg=24, rings=12):
    vs=[]; ns=[]; fs=[]; sc=np.asarray(scale)*radius
    for i in range(rings+1):
        a=math.pi*i/rings
        for j in range(seg):
            b=2*math.pi*j/seg; n=np.array([math.sin(a)*math.cos(b),math.cos(a),math.sin(a)*math.sin(b)])
            vs.append(n*sc+at); ns.append(unit(n/sc))
    for i in range(rings):
        for j in range(seg):
            a=i*seg+j; b=i*seg+(j+1)%seg; c=a+seg; d=b+seg; fs.extend([(a,c,b),(b,c,d)])
    return Mesh().add(vs,fs,ns,material,tone)

def tube(points, radius=.05, material=0, tone=0, sides=10):
    p=np.asarray(points,float); radii=np.broadcast_to(radius,(len(p),)); vs=[]; ns=[]; fs=[]
    for i,c in enumerate(p):
        t=unit(p[min(i+1,len(p)-1)]-p[max(0,i-1)]); ref=[0,1,0] if abs(t[1])<.9 else [1,0,0]
        a=unit(np.cross(t,ref)); b=np.cross(t,a)
        for j in range(sides):
            n=a*math.cos(j*2*math.pi/sides)+b*math.sin(j*2*math.pi/sides); vs.append(c+n*radii[i]); ns.append(n)
    for i in range(len(p)-1):
        for j in range(sides):
            a=i*sides+j; b=i*sides+(j+1)%sides; c=a+sides; d=b+sides; fs.extend([(a,b,c),(b,d,c)])
    # Flat caps with separate normals.
    mesh=Mesh().add(vs,fs,ns,material,tone)
    for i in (0,len(p)-1):
        ring=np.array(vs[i*sides:(i+1)*sides]); cv=np.vstack([p[i],ring]); cf=[(0,j+1,(j+1)%sides+1) for j in range(sides)]; mesh.add(cv,cf,material=material,tone=tone)
    return mesh

def cylinder(at=(0,0,0), r=.3, h=.2, material=0, tone=0, sides=32):
    x,y,z=at
    return tube([(x,y-h/2,z),(x,y+h/2,z)],r,material,tone,sides)

def torus(at=(0,0,0), major=.3, minor=.04, material=0, tone=0, seg=48):
    x,y,z=at; p=[(x+major*math.cos(a),y,z+major*math.sin(a)) for a in np.linspace(0,2*math.pi,seg+1)]
    return tube(p,minor,material,tone,10)

def box(at=(0,0,0), size=(1,1,1), material=0, tone=0, bevel=.04):
    # Rounded cuboid via a sampled cube/sphere Minkowski surface; distinct face normals.
    half=np.asarray(size)/2; r=min(bevel,float(min(half))*.8); core=half-r; m=Mesh(); resolution=4
    for axis in range(3):
        u=(axis+1)%3; w=(axis+2)%3
        for sign in (-1,1):
            v=[]; n=[]; f=[]
            # More samples around the edge preserve broad flat faces and rounded corners.
            ss=np.array([-1,-.92,-.75,0,.75,.92,1]); N=len(ss)
            for a in ss:
                for b in ss:
                    p=np.zeros(3); p[axis]=sign*half[axis]; p[u]=a*half[u]; p[w]=b*half[w]
                    q=np.clip(p,-core,core); normal=unit(p-q); v.append(q+normal*r+at); n.append(normal)
            for i in range(N-1):
                for j in range(N-1):
                    k=i*N+j; f.extend([(k,k+1,k+N),(k+1,k+N+1,k+N)])
            m.add(v,f,n,material,tone)
    return m

def camera(direction):
    toward=unit(direction); right=unit(np.cross([0,1,0],toward)); up=np.cross(toward,right)
    return np.stack([right,up,toward],axis=1)

def raster(items, basis, center, extent, shape, depth_only=False):
    W,H=shape; depth=np.full((H,W),-1e9,np.float32); xyz=np.zeros((H,W,3),np.float32); normal=xyz.copy(); mats=np.zeros((H,W),int); tones=np.zeros((H,W))
    for v,f,n,mat,tone in items:
        q=(v-center)@basis; xy=np.stack([(q[:,0]/extent+.5)*W,(.5-q[:,1]/(extent*H/W))*H],axis=1)
        for tri in f:
            p=xy[tri]; z=q[tri,2]; lo=np.maximum(np.floor(p.min(axis=0)).astype(int),0); hi=np.minimum(np.ceil(p.max(axis=0)).astype(int),[W-1,H-1])
            if np.any(hi<lo): continue
            x0,y0=lo; x1,y1=hi; a,b,c=p; den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(den)<1e-6: continue
            yy,xx=np.mgrid[y0:y1+1,x0:x1+1]; xx=xx+.5; yy=yy+.5
            w0=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den
            w1=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den; w2=1-w0-w1
            zz=w0*z[0]+w1*z[1]+w2*z[2]; sl=np.s_[y0:y1+1,x0:x1+1]; mask=(w0>=-1e-5)&(w1>=-1e-5)&(w2>=-1e-5)&(zz>depth[sl])
            depth[sl][mask]=zz[mask]
            if depth_only or not mask.any(): continue
            weights=np.stack([w0[mask],w1[mask],w2[mask]],axis=1)
            xyz[sl][mask]=weights@v[tri]; normal[sl][mask]=unit(weights@n[tri]); mats[sl][mask]=mat; tones[sl][mask]=tone
    return depth,xyz,normal,mats,tones

def render(mesh, path, width=760, height=560, yaw=18, elevation=28, frame=None):
    verts=mesh.bounds() if frame is None else frame.bounds(); lo=verts.min(axis=0); hi=verts.max(axis=0); center=(lo+hi)/2
    az,el=np.radians([yaw,elevation]); basis=camera([math.sin(az)*math.cos(el),math.sin(el),math.cos(az)*math.cos(el)])
    q=(verts-center)@basis; extent=max(np.ptp(q[:,0])*1.16,np.ptp(q[:,1])*width/height*1.16)
    light=unit([-.8,2.8,1.0]); lb=camera(light); lq=(verts-center)@lb; le=max(np.ptp(lq[:,0]),np.ptp(lq[:,1]))*1.5
    shadow,*_=raster(mesh.items,lb,center,le,(640,640),True)
    def visibility(points):
        q=(points-center)@lb; u=(q[...,0]/le+.5)*640; v=(.5-q[...,1]/le)*640
        total=np.zeros(u.shape)
        for dx,dy in ((0,0),(-1,-1),(1,-1),(-1,1),(1,1),(-2,0),(2,0),(0,2),(0,-2)):
            ix=np.clip((u+dx).astype(int),0,639); iy=np.clip((v+dy).astype(int),0,639)
            total+=(q[...,2]+.018 >= shadow[iy,ix])
        return total/9
    depth,p,n,mat,tone=raster(mesh.items,basis,center,extent,(width,height)); hit=depth>-1e8
    out=np.zeros((height,width,4),np.uint8)
    # Ground shadow only: no opaque rectangle behind the illustration.
    yy,xx=np.mgrid[0:height,0:width]; origin=center+(xx[...,None]/width-.5)*extent*basis[:,0]+(.5-yy[...,None]/height)*extent*height/width*basis[:,1]
    plane=origin+((lo[1]-.015-origin[...,1])/basis[1,2])[...,None]*basis[:,2]
    edge=np.minimum.reduce([xx/width,(width-1-xx)/width,yy/height,(height-1-yy)/height])
    fade=np.clip(edge/.12,0,1); fade=fade*fade*(3-2*fade)
    alpha=(1-visibility(plane))*.12*fade
    if frame is not None: alpha*=0
    shadow_im=Image.fromarray((alpha*255).astype('uint8')).filter(ImageFilter.GaussianBlur(2)); out[...,:3]=[52,34,76]; out[...,3]=np.asarray(shadow_im)
    bright=(.35+.62*np.clip(n[hit]@light,0,1)*(.48+.52*visibility(p[hit]))+.08*np.clip(n[hit]@unit([1,.2,-1]),0,1)+tone[hit])
    for k,pal in enumerate(PALETTES):
        mask=mat[hit]==k; rgb=np.stack([np.interp(np.clip(bright[mask],0,1),np.linspace(0,1,len(pal)),pal[:,i]) for i in range(3)],axis=1)
        idx=np.where(hit); out[idx[0][mask],idx[1][mask],:3]=rgb.astype(np.uint8)
    out[...,3][hit]=255
    im=Image.fromarray(out); bbox=im.getbbox()
    if bbox and frame is None: im=im.crop(bbox)
    path.parent.mkdir(parents=True,exist_ok=True); im.save(path,optimize=True)
    return im.size
