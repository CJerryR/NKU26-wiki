"""Tiny signed-distance-field renderer for the inner-page opening props.

Why it exists: every prop on the scroll-opened page heroes must share one look
(matte clay, monochrome iris violet, soft key light from the upper left, the
same three-quarter camera). Rendering them from code guarantees that, keeps
the science shapes exact (7 transmembrane helices, budding yeast, a 96-well
plate) and needs no image-generation service. Everything is numpy + Pillow,
so it runs wherever the repository's Python tools already run.

Usage: see props.py. A prop is a list of parts; each part is an SDF callable
p -> distance plus a material name. The renderer ray-marches an orthographic
camera, shades with wrap diffuse + soft shadow + ambient occlusion, then maps
brightness through the iris palette (or the amber palette for "signal" parts).
Output: an RGBA PNG cropped to the prop's silhouette.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable, Sequence

import numpy as np
from PIL import Image

Vec = np.ndarray


# ------------------------------------------------------------------ helpers
def v3(x, y, z) -> Vec:
    return np.array([x, y, z], dtype=np.float64)


def norm(a: Vec) -> Vec:
    return a / np.linalg.norm(a)


def rot(yaw=0.0, pitch=0.0, roll=0.0) -> Vec:
    """Rotation matrix (degrees): yaw about Y, then pitch about X, then roll about Z."""
    y, p, r = (math.radians(a) for a in (yaw, pitch, roll))
    ry = np.array([[math.cos(y), 0, math.sin(y)], [0, 1, 0], [-math.sin(y), 0, math.cos(y)]])
    rx = np.array([[1, 0, 0], [0, math.cos(p), -math.sin(p)], [0, math.sin(p), math.cos(p)]])
    rz = np.array([[math.cos(r), -math.sin(r), 0], [math.sin(r), math.cos(r), 0], [0, 0, 1]])
    return rz @ rx @ ry


def local(p: Vec, c: Vec, R: Vec | None) -> Vec:
    """World points -> a primitive's local frame (R maps local -> world)."""
    q = p - c
    return q @ R if R is not None else q


def length(q: Vec) -> Vec:
    return np.sqrt(np.einsum('ij,ij->i', q, q))


def smin(a: Vec, b: Vec, k: float) -> Vec:
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


# --------------------------------------------------------------- primitives
def sphere(c, r):
    c = np.asarray(c, float)
    return lambda p: length(p - c) - r


def ellipsoid(c, radii, R=None):
    c = np.asarray(c, float); rr = np.asarray(radii, float)
    def f(p):
        q = local(p, c, R)
        k0 = length(q / rr); k1 = length(q / (rr * rr))
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)
    return f


def round_box(c, half, r, R=None):
    c = np.asarray(c, float); b = np.asarray(half, float) - r
    def f(p):
        q = np.abs(local(p, c, R)) - b
        return length(np.maximum(q, 0)) + np.minimum(np.max(q, axis=1), 0) - r
    return f


def capsule(a, b, ra, rb=None):
    """Capsule / round cone from a (radius ra) to b (radius rb)."""
    a = np.asarray(a, float); b = np.asarray(b, float); rb = ra if rb is None else rb
    ba = b - a; bb = float(ba @ ba)
    def f(p):
        pa = p - a
        h = np.clip((pa @ ba) / bb, 0, 1)
        return length(pa - h[:, None] * ba) - (ra + (rb - ra) * h)
    return f


def cylinder(c, r, h, R=None, rounding=0.0):
    """Capped cylinder along local Y, half height h, optional edge rounding."""
    c = np.asarray(c, float)
    def f(p):
        q = local(p, c, R)
        d = np.stack([np.sqrt(q[:, 0] ** 2 + q[:, 2] ** 2) - r + rounding, np.abs(q[:, 1]) - h + rounding], axis=1)
        return np.minimum(np.max(d, axis=1), 0) + length(np.maximum(d, 0)) - rounding
    return f


def torus(c, R_major, r_minor, R=None):
    """Torus lying in the local XZ plane."""
    c = np.asarray(c, float)
    def f(p):
        q = local(p, c, R)
        qx = np.sqrt(q[:, 0] ** 2 + q[:, 2] ** 2) - R_major
        return np.sqrt(qx ** 2 + q[:, 1] ** 2) - r_minor
    return f


def union(*fs, k=0.0):
    def f(p):
        d = fs[0](p)
        for g in fs[1:]:
            d = smin(d, g(p), k)
        return d
    return f


def subtract(a, b):
    return lambda p: np.maximum(a(p), -b(p))


def intersect(a, b):
    return lambda p: np.maximum(a(p), b(p))


def halfspace(normal, offset=0.0):
    """Distance to the plane n.p = offset; inside where n.p < offset."""
    n = norm(np.asarray(normal, float))
    return lambda p: p @ n - offset


def tube(points: Sequence[Sequence[float]], radii: Sequence[float], k=0.0):
    """A swept chain of round cones through points (organic worms, roots)."""
    segs = [capsule(points[i], points[i + 1], radii[i], radii[i + 1]) for i in range(len(points) - 1)]
    return union(*segs, k=k)


# ------------------------------------------------------------------ palette
IRIS = [  # brightness stop -> colour (site tokens: iris-deep, iris, iris-bright, cream-2)
    (0.00, (0x2c, 0x1d, 0x4f)),
    (0.30, (0x52, 0x3a, 0x8c)),
    (0.58, (0x6e, 0x4f, 0xb8)),
    (0.82, (0x9b, 0x7f, 0xe0)),
    (1.00, (0xcd, 0xbf, 0xd6)),
]
AMBER = [
    (0.00, (0x5a, 0x37, 0x08)),
    (0.30, (0x8f, 0x5d, 0x10)),
    (0.62, (0xe2, 0xa2, 0x3c)),
    (1.00, (0xf8, 0xdd, 0xa4)),
]
PALETTES = {'iris': IRIS, 'amber': AMBER}


def gradient_map(t: Vec, stops) -> Vec:
    t = np.clip(t, 0, 1)
    xs = np.array([s[0] for s in stops]); cs = np.array([s[1] for s in stops], float)
    out = np.empty((t.size, 3))
    for ch in range(3):
        out[:, ch] = np.interp(t, xs, cs[:, ch])
    return out


# ------------------------------------------------------------------- render
@dataclass
class Part:
    sdf: Callable[[Vec], Vec]
    material: str = 'iris'          # 'iris' | 'amber'
    tone: float = 0.0               # brightness offset for this part (-.2 .. .2)
    texture: Callable[[Vec, Vec], Vec] | None = None  # (points, normals) -> brightness offset
    bound: tuple | None = None      # (centre, radius) enclosing the part; filled in by render()
    group: int = -1                 # parts placed together (one object) share a group


@dataclass
class Prop:
    name: str
    parts: list[Part]
    extent: float = 1.2             # orthographic half-size of the view in world units
    elevation: float = 25.0         # camera looks down by this many degrees
    azimuth: float = 0.0
    blend: float = 0.0              # smooth-union radius across parts
    center: Sequence[float] = (0, 0, 0)
    crop: bool = True               # False: keep the full frame, so parts rendered on one
                                    # shared frame (lid/base, puzzle pieces) line up
    aspect: float = 1.0             # frame width / height (islands are wide)
    unit: float | None = None       # length that sets AO / shadow / step sizes (default: extent).
                                    # Islands keep 0.7, the scale single props were made at.
    cull: bool = False              # per-part bounding spheres: needed for many-object islands
    ground: float | None = None     # y of an invisible floor that only receives a soft shadow
    ground_strength: float = 0.42


def _scene(parts: list[Part], blend: float):
    def dist(p):
        d = parts[0].sdf(p)
        for part in parts[1:]:
            d = smin(d, part.sdf(p), blend)
        return d
    return dist


def _bound(sdf, centre, half, n=44):
    """Bounding sphere of a part's solid, from a grid around `centre` (+-half).
    Grid points within one cell of the surface count, so thin parts are kept."""
    g = np.linspace(-half, half, n)
    X, Y, Z = np.meshgrid(g, g, g, indexing='ij')
    P = np.asarray(centre, float) + np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    step = 2 * half / (n - 1)
    m = sdf(P) < step * 0.9
    if not m.any():
        return np.asarray(centre, float), 0.0
    Q = P[m]
    c = (Q.min(0) + Q.max(0)) / 2
    return c, float(np.linalg.norm(Q - c, axis=1).max() + step)


def _culled(parts: list[Part], margin: float):
    """min over parts with two-level sphere culling: an object (parts placed
    together) far from a point costs one sphere distance; inside it, each part
    far from the point costs its own sphere. Sphere distances never exceed the
    true distance, so marching stays safe."""
    C = np.array([np.asarray(pt.bound[0], float) for pt in parts]); Rr = np.array([pt.bound[1] for pt in parts])
    by = {}
    for i, pt in enumerate(parts):
        by.setdefault(pt.group if pt.group >= 0 else -(i + 1), []).append(i)
    groups = []
    for idx in by.values():
        lo = (C[idx] - Rr[idx, None]).min(0); hi = (C[idx] + Rr[idx, None]).max(0)
        gc = (lo + hi) / 2
        groups.append((gc, float(np.max(np.linalg.norm(C[idx] - gc, axis=1) + Rr[idx])), idx))

    def each(p, i):
        db = np.linalg.norm(p - C[i], axis=1) - Rr[i]
        m = db < margin
        if m.any():
            db[m] = parts[i].sdf(p[m])
        return db

    def dist(p):
        d = np.full(len(p), np.inf)
        for gc, gr, idx in groups:
            dg = np.linalg.norm(p - gc, axis=1) - gr
            m = dg < margin
            if m.any():
                sub = p[m]; dd = np.full(len(sub), np.inf)
                for i in idx:
                    dd = np.minimum(dd, each(sub, i))
                dg[m] = dd
            d = np.minimum(d, dg)
        return d
    return dist, each


def render(prop: Prop, size=900, supersample=2, pad=12) -> Image.Image:
    """Render to an RGBA image `size` px wide (height size / aspect), cropped
    to the silhouette unless prop.crop is False."""
    W = size * supersample
    H = max(1, round(W / prop.aspect))
    parts = prop.parts
    u = prop.unit or prop.extent

    # camera basis (orthographic): forward looks at the centre from above-front
    el, az = math.radians(prop.elevation), math.radians(prop.azimuth)
    fwd = -v3(math.sin(az) * math.cos(el), math.sin(el), math.cos(az) * math.cos(el))
    right = norm(np.cross(fwd, v3(0, 1, 0)))
    up = np.cross(right, fwd)
    ctr = np.asarray(prop.center, float)

    xs = (np.arange(W) + 0.5) / W * 2 - 1
    ys = (np.arange(H) + 0.5) / H * 2 - 1
    gx, gy = np.meshgrid(xs, -ys)
    gx = gx.ravel() * prop.extent; gy = gy.ravel() * prop.extent / prop.aspect
    origin = ctr[None, :] + gx[:, None] * right + gy[:, None] * up - fwd * 6.0
    n = origin.shape[0]

    t = np.zeros(n); hit = np.zeros(n, bool); alive = np.ones(n, bool)
    if prop.cull:
        half = prop.extent * 1.25 + 0.3
        for pt in parts:
            if pt.bound is None:
                pt.bound = _bound(pt.sdf, ctr, half)
        parts = [pt for pt in parts if pt.bound[1] > 0]
        dist, each = _culled(parts, margin=0.28 * u)
        # rays that miss every bounding sphere are background: never march them
        C = np.array([pt.bound[0] for pt in parts]); Rr = np.array([pt.bound[1] for pt in parts])
        tmin = np.full(n, np.inf); tmax = np.zeros(n)
        for c, r in zip(C, Rr):
            oc = c[None, :] - origin
            b = oc @ fwd
            d2 = np.einsum('ij,ij->i', oc, oc) - b * b
            ok = d2 < r * r
            hw = np.sqrt(np.maximum(r * r - d2, 0))
            tmin = np.where(ok, np.minimum(tmin, b - hw), tmin)
            tmax = np.where(ok, np.maximum(tmax, b + hw), tmax)
        alive = np.isfinite(tmin)
        t = np.where(alive, np.maximum(tmin - 0.01, 0), 0)
        tend = tmax + 0.01
    else:
        dist = _scene(parts, prop.blend)
        each = lambda p, i: parts[i].sdf(p)
    eps = u * 4e-4
    for _ in range(260):
        idx = np.nonzero(alive)[0]
        if idx.size == 0:
            break
        p = origin[idx] + t[idx, None] * fwd
        d = dist(p)
        done = d < eps
        hit[idx[done]] = True
        t[idx] += np.maximum(d, eps * 0.5) * 0.85
        alive[idx[done]] = False
        alive[idx[t[idx] > (tend[idx] if prop.cull else 12.0)]] = False

    hidx = np.nonzero(hit)[0]
    p = origin[hidx] + t[hidx, None] * fwd

    # normals
    h = u * 1.5e-3
    nrm = np.stack([
        dist(p + [h, 0, 0]) - dist(p - [h, 0, 0]),
        dist(p + [0, h, 0]) - dist(p - [0, h, 0]),
        dist(p + [0, 0, h]) - dist(p - [0, 0, h]),
    ], axis=1)
    nrm /= np.maximum(length(nrm), 1e-9)[:, None]

    # material of the closest part
    dp = np.stack([each(p, i) for i in range(len(parts))], axis=1)
    which = np.argmin(dp, axis=1)

    # lights in camera space: key upper-left-front, fill right-back
    key = norm(-0.62 * right + 0.78 * up - 0.45 * fwd)
    fill = norm(0.8 * right + 0.1 * up + 0.4 * fwd)

    def soft_shadow(q0, nn):
        sh = np.ones(len(q0)); st = np.full(len(q0), u * 0.02)
        steps, cap = (26, 0.17) if prop.cull else (40, 0.12)   # islands: fewer, longer steps
        for _ in range(steps):
            q = q0 + nn * eps * 4 + st[:, None] * key
            dd = dist(q)
            sh = np.minimum(sh, np.clip(10.0 * dd / st, 0, 1))
            st += np.clip(dd, u * 0.01, u * cap)
        return sh

    def occlusion(q0, nn):
        ao = np.zeros(len(q0))
        for i in range(1, 6):
            hh = u * 0.035 * i
            ao += (hh - dist(q0 + nn * hh)) / (2 ** i)
        return np.clip(1 - 2.2 * ao / u, 0.25, 1)

    ndl = nrm @ key
    wrap = np.clip((ndl + 0.35) / 1.35, 0, 1) ** 1.25
    fil = np.clip(nrm @ fill, 0, 1)
    sh = 0.45 + 0.55 * soft_shadow(p, nrm)
    ao = occlusion(p, nrm)

    # rim from camera (soft clay sheen at the silhouette)
    rim = np.clip(1 + (nrm @ fwd), 0, 1) ** 3

    bright = (0.22 + 0.72 * wrap * sh + 0.12 * fil) * (0.55 + 0.45 * ao) + 0.08 * rim
    for i, part in enumerate(parts):
        m = which == i
        if not np.any(m):
            continue
        bright[m] += part.tone
        if part.texture is not None:
            bright[m] += part.texture(p[m], nrm[m])

    rgb = np.zeros((len(hidx), 3))
    for i, part in enumerate(parts):
        m = which == i
        if np.any(m):
            rgb[m] = gradient_map(bright[m], PALETTES[part.material])

    img = np.zeros((n, 4))
    img[hidx, :3] = rgb
    img[hidx, 3] = 255

    if prop.ground is not None and fwd[1] < 0:
        # invisible floor: only the soft shadow and contact darkening the island casts
        g = np.nonzero(~hit)[0]
        tg = (prop.ground - origin[g, 1]) / fwd[1]
        pg = origin[g] + tg[:, None] * fwd
        if prop.cull:   # only near the island
            near = np.zeros(len(g), bool)
            for c, r in zip(C, Rr):
                near |= np.hypot(pg[:, 0] - c[0], pg[:, 2] - c[2]) < r + 0.35 * u
            g, pg = g[near], pg[near]
        upv = np.tile(v3(0, 1, 0), (len(pg), 1))
        vis = soft_shadow(pg, upv) * occlusion(pg, upv)
        a = prop.ground_strength * np.clip(1 - vis, 0, 1) ** 1.15
        a[a < 0.03] = 0
        # A soft floor shadow must fade before the camera boundary; otherwise
        # transparent sprites show a rectangular shadow edge on dark pages.
        edge_px = np.minimum.reduce([g % W, W - 1 - g % W, g // W, H - 1 - g // W])
        fade = np.clip(edge_px / max(12, round(W * 0.035)), 0, 1)
        a *= fade * fade * (3 - 2 * fade)
        img[g, :3] = (0x2c, 0x1d, 0x4f)
        img[g, 3] = a * 255

    img = img.reshape(H, W, 4).astype(np.uint8)
    im = Image.fromarray(img, 'RGBA')
    if supersample > 1:
        # premultiply so edges stay clean when averaging
        arr = np.asarray(im).astype(np.float64)
        a = arr[..., 3:4] / 255
        arr[..., :3] *= a
        small = Image.fromarray(arr.astype(np.uint8), 'RGBA').resize((size, max(1, round(size / prop.aspect))), Image.Resampling.BOX)
        s_ = np.asarray(small).astype(np.float64)
        a = np.maximum(s_[..., 3:4] / 255, 1e-6)
        s_[..., :3] = np.clip(s_[..., :3] / a, 0, 255)
        im = Image.fromarray(s_.astype(np.uint8), 'RGBA')
    bbox = im.getbbox() if prop.crop else None
    if bbox:
        l, t_, r, b = bbox
        im = im.crop((max(0, l - pad), max(0, t_ - pad), min(im.width, r + pad), min(im.height, b + pad)))
    return im


_GROUP = [0]


def place(parts, at=(0, 0, 0), yaw=0.0, pitch=0.0, roll=0.0, s=1.0, tone=0.0, origin=(0, 0, 0)):
    """Move library parts into an island: scale s about `origin`, rotate, then put
    `origin` at `at`. Textures see local coordinates; tone shifts the brightness
    (individual variation inside a crowd)."""
    R = rot(yaw, pitch, roll); t = np.asarray(at, float); o = np.asarray(origin, float)
    _GROUP[0] += 1
    out = []
    for part in (parts.parts if isinstance(parts, Prop) else parts):
        f = part.sdf
        g = (lambda f: (lambda p: f(((p - t) @ R) / s + o) * s))(f)
        tex = None
        if part.texture is not None:
            tex = (lambda tf: (lambda p, nn: tf(((p - t) @ R) / s + o, nn @ R)))(part.texture)
        out.append(Part(g, part.material, part.tone + tone, tex, None, _GROUP[0]))
    return out
