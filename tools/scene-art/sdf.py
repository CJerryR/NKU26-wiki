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


@dataclass
class Prop:
    name: str
    parts: list[Part]
    extent: float = 1.2             # orthographic half-size of the view in world units
    elevation: float = 25.0         # camera looks down by this many degrees
    azimuth: float = 0.0
    blend: float = 0.0              # smooth-union radius across parts
    center: Sequence[float] = (0, 0, 0)
    crop: bool = True               # False: keep the full square frame, so parts rendered
                                    # on one shared frame (lid/base, puzzle pieces) line up


def _scene(parts: list[Part], blend: float):
    def dist(p):
        d = parts[0].sdf(p)
        for part in parts[1:]:
            d = smin(d, part.sdf(p), blend)
        return d
    return dist


def render(prop: Prop, size=900, supersample=2, pad=12) -> Image.Image:
    """Render to an RGBA image whose long edge is about `size` px, cropped."""
    W = size * supersample
    parts = prop.parts
    dist = _scene(parts, prop.blend)

    # camera basis (orthographic): forward looks at the centre from above-front
    el, az = math.radians(prop.elevation), math.radians(prop.azimuth)
    fwd = -v3(math.sin(az) * math.cos(el), math.sin(el), math.cos(az) * math.cos(el))
    right = norm(np.cross(fwd, v3(0, 1, 0)))
    up = np.cross(right, fwd)
    ctr = np.asarray(prop.center, float)

    xs = (np.arange(W) + 0.5) / W * 2 - 1
    gx, gy = np.meshgrid(xs, -xs)
    gx = gx.ravel() * prop.extent; gy = gy.ravel() * prop.extent
    origin = ctr[None, :] + gx[:, None] * right + gy[:, None] * up - fwd * 6.0
    n = origin.shape[0]

    t = np.zeros(n); hit = np.zeros(n, bool); alive = np.ones(n, bool)
    eps = prop.extent * 4e-4
    for _ in range(220):
        idx = np.nonzero(alive)[0]
        if idx.size == 0:
            break
        p = origin[idx] + t[idx, None] * fwd
        d = dist(p)
        done = d < eps
        hit[idx[done]] = True
        t[idx] += np.maximum(d, eps * 0.5) * 0.85
        alive[idx[done]] = False
        alive[idx[t[idx] > 12.0]] = False

    hidx = np.nonzero(hit)[0]
    p = origin[hidx] + t[hidx, None] * fwd

    # normals
    h = prop.extent * 1.5e-3
    nrm = np.stack([
        dist(p + [h, 0, 0]) - dist(p - [h, 0, 0]),
        dist(p + [0, h, 0]) - dist(p - [0, h, 0]),
        dist(p + [0, 0, h]) - dist(p - [0, 0, h]),
    ], axis=1)
    nrm /= np.maximum(length(nrm), 1e-9)[:, None]

    # material of the closest part
    dp = np.stack([part.sdf(p) for part in parts], axis=1)
    which = np.argmin(dp, axis=1)

    # lights in camera space: key upper-left-front, fill right-back
    key = norm(-0.62 * right + 0.78 * up - 0.45 * fwd)
    fill = norm(0.8 * right + 0.1 * up + 0.4 * fwd)

    ndl = nrm @ key
    wrap = np.clip((ndl + 0.35) / 1.35, 0, 1) ** 1.25
    fil = np.clip(nrm @ fill, 0, 1)

    # soft shadow toward the key light
    sh = np.ones(len(hidx)); st = np.full(len(hidx), prop.extent * 0.02)
    for _ in range(40):
        q = p + nrm * eps * 4 + st[:, None] * key
        d = dist(q)
        sh = np.minimum(sh, np.clip(10.0 * d / st, 0, 1))
        st += np.clip(d, prop.extent * 0.01, prop.extent * 0.12)
    sh = 0.45 + 0.55 * sh

    # ambient occlusion
    ao = np.zeros(len(hidx))
    for i in range(1, 6):
        hh = prop.extent * 0.035 * i
        ao += (hh - dist(p + nrm * hh)) / (2 ** i)
    ao = np.clip(1 - 2.2 * ao / prop.extent, 0.25, 1)

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
    img = img.reshape(W, W, 4).astype(np.uint8)
    im = Image.fromarray(img, 'RGBA')
    if supersample > 1:
        # premultiply so edges stay clean when averaging
        arr = np.asarray(im).astype(np.float64)
        a = arr[..., 3:4] / 255
        arr[..., :3] *= a
        small = Image.fromarray(arr.astype(np.uint8), 'RGBA').resize((size, size), Image.Resampling.BOX)
        s = np.asarray(small).astype(np.float64)
        a = np.maximum(s[..., 3:4] / 255, 1e-6)
        s[..., :3] = np.clip(s[..., :3] / a, 0, 255)
        im = Image.fromarray(s.astype(np.uint8), 'RGBA')
    bbox = im.getbbox() if prop.crop else None
    if bbox:
        l, t_, r, b = bbox
        im = im.crop((max(0, l - pad), max(0, t_ - pad), min(size, r + pad), min(size, b + pad)))
    return im
