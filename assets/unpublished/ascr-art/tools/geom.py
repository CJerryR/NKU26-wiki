"""Shared geometry for the ascaroside story art (slide space 1280x720)."""
import math
# --- affine helpers: (a,b,c,d,e,f) maps x'=a x+c y+e, y'=b x+d y+f
def mul(M,N):
    a,b,c,d,e,f=M; A,B,C,D,E,F=N
    return (a*A+c*B, b*A+d*B, a*C+c*D, b*C+d*D, a*E+c*F+e, b*E+d*F+f)
def S(k, ox, oy, tx=0, ty=0):
    """root mm (ox,oy) -> (tx,ty), scale k"""
    return (k,0,0,k,tx-k*ox,ty-k*oy)
def rot(deg):
    r=math.radians(deg); return (math.cos(r),math.sin(r),-math.sin(r),math.cos(r),0,0)
def ap(M,p):
    a,b,c,d,e,f=M; x,y=p; return (a*x+c*y+e, b*x+d*y+f)
def fmt(M): return 'matrix(' + ' '.join(f'{v:.5g}' if abs(v)>=1e-9 else '0' for v in M) + ')'
def R(v,deg):
    r=math.radians(deg); x,y=v; return (x*math.cos(r)-y*math.sin(r), x*math.sin(r)+y*math.cos(r))

# ---------------------------------------------------------------- receptor
K_R = 2.55                 # receptor art: slide units per mm at rec s=1
K_M = K_R*1.30             # pockets and molecules (PPT slide 1 ratio)
REC_O = (45.215, 83.775)   # composite centre (root mm) = rec-local origin
B_ROOT = (54.1, 56.2)      # pocket block top (PPT slide 1), root mm
B = ((B_ROOT[0]-REC_O[0])*K_R, (B_ROOT[1]-REC_O[1])*K_R)   # rec-local
GAP = 0.35                 # mm between the notch and the block
# molecule origins (root mm) = top of the notch
M3_O = (26.2064, 230.1196); M18_O = (69.4148, 228.7261)
M3_BB = (17.5,195.65,49.81,235.5); M18_BB = (60.54,182.89,100.49,235.85)
def vis_off(o,bb):   # visual centre offset from origin, slide units at s=1
    return (((bb[0]+bb[2])/2-o[0])*K_M, ((bb[1]+bb[3])/2-o[1])*K_M)
OFF3 = vis_off(M3_O,M3_BB); OFF18 = vis_off(M18_O,M18_BB)
P3_O = (25.135, 240.83); P18_O = (69.1678, 239.3781)   # block tops (root mm)
def place(off, cx, cy, s=1, r=0):
    """origin position that puts the visual centre at (cx,cy)"""
    v=R((off[0]*s, off[1]*s), r); return (cx-v[0], cy-v[1])
def dock(rx, ry, s, r):
    """where a molecule's origin goes when the receptor is at (rx,ry,s,r)"""
    v=R((B[0]*s, B[1]*s), r); return (rx+v[0], ry+v[1])

# ---------------------------------------------------------------- yeast (PPT slide 2, pt*4/3)
K_CELL = 6.117
CELL_C_ROOT = (148.10, 131.62); CELL_C = (640.0, 398.3)
def cell_pt(X,Y): return (CELL_C[0]+(X-CELL_C_ROOT[0])*K_CELL, CELL_C[1]+(Y-CELL_C_ROOT[1])*K_CELL)
