"""Props for the scroll-opened inner-page heroes, one function per page.

    python3 tools/scene-art/props.py description            # render one page
    python3 tools/scene-art/props.py description --only strip --size 600

Writes transparent PNGs to assets/scenes/<page>/<prop>.png (sources, not
published). tools/pack_scene_atlas.py then packs them into the WebP atlases
the site loads. Shapes are schematic illustrations, never data.
"""
from __future__ import annotations

import argparse
import math
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sdf import (Part, Prop, capsule, cylinder, ellipsoid, halfspace, intersect, render,  # noqa: E402
                 rot, round_box, sphere, subtract, torus, tube, union, local, length)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'scenes'


# ------------------------------------------------------------ description
def soil_half(side: str) -> Prop:
    """Half of a soil block split down the middle; the cut face shows strata
    and fine roots. side='left' keeps x<0 and turns its cut face to the right."""
    keep = 1.0 if side == 'left' else -1.0          # left keeps local x < 0
    R = rot(yaw=-38 if side == 'left' else 38)       # turn the cut face toward the camera
    c = np.zeros(3)
    block = round_box(c, (0.5, 0.40, 0.40), 0.085, R)
    half = intersect(block, lambda p: keep * local(p, c, R)[:, 0])

    def strata(p, n):
        q = local(p, c, R)
        on_cut = (np.abs(q[:, 0]) < 0.012)
        y = q[:, 1] + 0.035 * np.sin(q[:, 2] * 8.5 + (1.3 if side == 'left' else 0.4))
        band = np.where(y > 0.22, -0.10, np.where(y > -0.06, 0.06, -0.03))
        # fine roots: wavy dark threads running down from the top
        roots = np.zeros(len(q))
        for z0, ph, y_end in ((-0.18, 0.0, -0.25), (0.05, 1.7, -0.32), (0.22, 3.1, -0.05)):
            zc = z0 + 0.045 * np.sin(q[:, 1] * 9 + ph)
            near = (np.abs(q[:, 2] - zc) < 0.011) & (q[:, 1] > y_end) & (q[:, 1] < 0.36)
            roots = np.where(near, -0.16, roots)
        # pebbles
        peb = np.zeros(len(q))
        for py, pz in ((-0.2, -0.05), (0.02, 0.25), (-0.3, 0.2), (0.1, -0.26)):
            peb = np.where((q[:, 1] - py) ** 2 + (q[:, 2] - pz) ** 2 < 0.028 ** 2, 0.12, peb)
        # topsoil grain on the top face
        top = (q[:, 1] > 0.30) & ~on_cut
        grain = np.where(top, -0.02 + 0.012 * np.sin(q[:, 0] * 23 + 2 * np.sin(q[:, 2] * 11)), 0)
        lift = 0.13 if side == 'left' else 0.0          # the left cut face sits in shadow
        return np.where(on_cut, band + roots + peb + lift, grain)

    return Prop(f'soil-{side}', [Part(half, texture=strata)], extent=0.82, elevation=24)


def seedling() -> Prop:
    stem = capsule((0, -0.02, 0), (0, 0.47, 0), 0.03, 0.024)
    leaf_l = ellipsoid((-0.15, 0.53, 0.0), (0.18, 0.04, 0.11), rot(roll=26, yaw=10))
    leaf_r = ellipsoid((0.15, 0.55, 0.0), (0.18, 0.04, 0.11), rot(roll=-24, yaw=-10))
    main = tube([(0, 0, 0), (0.02, -0.24, 0.01), (-0.012, -0.5, 0.0), (0.018, -0.8, 0.0)], [0.04, 0.032, 0.021, 0.01], k=0.01)
    lat = union(
        tube([(0.005, -0.1, 0), (-0.22, -0.26, 0.04), (-0.36, -0.42, 0.07)], [0.024, 0.017, 0.009]),
        tube([(0.015, -0.18, 0), (0.22, -0.33, -0.03), (0.34, -0.5, -0.01)], [0.023, 0.016, 0.009]),
        tube([(-0.005, -0.36, 0), (-0.17, -0.52, 0.03), (-0.24, -0.66, 0.05)], [0.019, 0.013, 0.008]),
        tube([(0.0, -0.46, 0), (0.17, -0.6, 0.04), (0.22, -0.72, 0.04)], [0.018, 0.012, 0.008]),
        k=0.012)
    galls = union(sphere((0.006, -0.31, 0.012), 0.05), sphere((-0.2, -0.245, 0.04), 0.04),
                  sphere((0.25, -0.37, -0.025), 0.038), sphere((-0.01, -0.6, 0.0), 0.036),
                  sphere((0.13, -0.57, 0.03), 0.03))
    node = sphere((0, 0.5, 0), 0.042)
    plant = union(stem, node, main, lat, galls, k=0.02)
    return Prop('roots', [Part(plant, tone=0.02), Part(union(leaf_l, leaf_r, k=0.02), tone=0.08)],
                extent=0.9, elevation=18, blend=0.02, center=(0, -0.15, 0))


def nematode() -> Prop:
    ts = np.linspace(0, 1, 30)
    pts = [(1.4 * (t - 0.5), 0.17 * math.sin(t * 2 * math.pi), 0.1 * math.sin(t * 2 * math.pi + 1.2)) for t in ts]
    radii = [0.008 + 0.062 * (math.sin(math.pi * t) ** 0.5) for t in ts]
    body = tube(pts, radii, k=0.012)

    def rings(p, n):  # faint annulations along the cuticle
        return 0.018 * np.sin(p[:, 0] * 140)

    return Prop('nematode', [Part(body, tone=0.06, texture=rings)], extent=0.82, elevation=30)


def test_strip(window='amber', upright=False, name='strip') -> Prop:
    R = rot(yaw=0, pitch=0) if upright else rot(yaw=34)
    if upright:
        R = rot(pitch=90)
    c = np.zeros(3)
    body = round_box(c, (0.095, 0.012, 0.64), 0.011, R)
    pad = round_box(c + (R @ np.array([0, 0.012, -0.5])), (0.088, 0.016, 0.1), 0.014, R)
    win_frame = round_box(c + (R @ np.array([0, 0.012, 0.12])), (0.07, 0.01, 0.14), 0.01, R)
    win = round_box(c + (R @ np.array([0, 0.017, 0.12])), (0.048, 0.006, 0.105), 0.006, R)
    parts = [Part(body, tone=0.1), Part(pad, tone=-0.05), Part(win_frame, tone=-0.02),
             Part(win, material=window if window else 'iris', tone=0.0 if window else 0.12)]
    return Prop(name, parts, extent=0.78 if not upright else 0.75, elevation=30 if not upright else 14)



# ------------------------------------------------------------ engineering
def blueprint() -> Prop:
    R = rot(yaw=-20)
    c = np.zeros(3)
    sheet = round_box(c, (0.55, 0.008, 0.40), 0.006, R)
    roll = capsule(R @ np.array([-0.55, 0.035, -0.40]), R @ np.array([0.55, 0.035, -0.40]), 0.04)
    pencil = capsule(R @ np.array([-0.20, 0.04, 0.22]), R @ np.array([0.34, 0.04, -0.12]), 0.024)
    tip = capsule(R @ np.array([0.34, 0.04, -0.12]), R @ np.array([0.43, 0.03, -0.18]), 0.022, 0.004)

    def lines(p, n):
        q = local(p, c, R)
        top = q[:, 1] > 0.004
        x, z = q[:, 0], q[:, 2]
        grid = (np.abs(((x + 1) % 0.1) - 0.05) > 0.046) | (np.abs(((z + 1) % 0.1) - 0.05) > 0.046)
        rect = (np.abs(np.maximum(np.abs(x + 0.18) - 0.2, np.abs(z - 0.05) - 0.14)) < 0.007)
        ring = np.abs(np.hypot(x - 0.25, z - 0.08) - 0.13) < 0.007
        link = (np.abs(z - 0.08) < 0.006) & (x > 0.02) & (x < 0.12)
        out = np.where(grid, -0.04, 0.0) + np.where(rect | ring | link, -0.2, 0.0)
        return np.where(top, out, 0.0)

    return Prop('blueprint', [Part(sheet, tone=0.16, texture=lines), Part(roll, tone=0.08),
                              Part(pencil, tone=-0.02), Part(tip, tone=-0.12)], extent=0.75, elevation=38)


def plasmid() -> Prop:
    R = rot(pitch=62, roll=-12)
    c = np.zeros(3)
    ring = torus(c, 0.42, 0.075, R)
    bands = []
    for a0, a1 in ((10, 70), (130, 160), (215, 300)):
        n1 = np.array([math.sin(math.radians(a0)), 0, -math.cos(math.radians(a0))])
        n2 = np.array([-math.sin(math.radians(a1)), 0, math.cos(math.radians(a1))])
        wedge = (lambda n1=n1, n2=n2: (lambda p: np.maximum(local(p, c, R) @ n1, local(p, c, R) @ n2)))()
        bands.append(intersect(torus(c, 0.42, 0.098, R), wedge))
    return Prop('plasmid', [Part(ring, tone=0.0), Part(union(*bands), tone=0.12)], extent=0.62, elevation=20)


def microplate() -> Prop:
    R = rot(yaw=-28)
    c = np.zeros(3)
    body = round_box(c, (0.62, 0.07, 0.42), 0.035, R)
    pitch = 0.09

    def wells(p):
        q = local(p, c, R)
        ix = np.clip(np.floor(q[:, 0] / pitch), -6, 5) + 0.5
        iz = np.clip(np.floor(q[:, 2] / pitch), -4, 3) + 0.5
        qq = np.stack([q[:, 0] - ix * pitch, q[:, 1] - 0.07, q[:, 2] - iz * pitch], axis=1)
        d = np.stack([np.hypot(qq[:, 0], qq[:, 2]) - 0.033, np.abs(qq[:, 1]) - 0.05], axis=1)
        return np.minimum(np.max(d, axis=1), 0) + length(np.maximum(d, 0))

    plate = subtract(body, wells)
    return Prop('plate', [Part(plate, tone=0.04)], extent=0.8, elevation=34)


def laptop() -> Prop:
    R = rot(yaw=24)
    c = np.zeros(3)
    base = round_box(c, (0.6, 0.025, 0.4), 0.02, R)
    hinge = R @ np.array([0, 0.02, -0.4])
    RL = R @ rot(pitch=-104)
    lid_c = hinge + RL @ np.array([0, 0.0, 0.4])
    lid = round_box(lid_c, (0.6, 0.02, 0.4), 0.02, RL)

    def screen(p, n):
        q = local(p, lid_c, RL)
        face = np.abs(q[:, 1]) > 0.012
        x, z = q[:, 0], -q[:, 2]
        inside = (np.abs(x) < 0.52) & (np.abs(z) < 0.33)
        curve = 0.25 * np.tanh((x + 0.02) * 5.5) - 0.02
        line = inside & (np.abs(z - curve) < 0.016)
        return np.where(face & inside, 0.14, 0.0) + np.where(face & line, 0.32, 0.0)

    def keys(p, n):
        q = local(p, c, R)
        top = q[:, 1] > 0.02
        kb = (np.abs(q[:, 0]) < 0.48) & (q[:, 2] > -0.34) & (q[:, 2] < 0.05)
        gap = (np.abs(((q[:, 0] + 1) % 0.08) - 0.04) > 0.033) | (np.abs(((q[:, 2] + 1) % 0.08) - 0.04) > 0.033)
        pad = (np.abs(q[:, 0]) < 0.14) & (q[:, 2] > 0.13) & (q[:, 2] < 0.32)
        return np.where(top & kb & gap, -0.08, 0.0) + np.where(top & pad, -0.05, 0.0)

    return Prop('laptop', [Part(base, tone=0.02, texture=keys), Part(lid, tone=-0.02, texture=screen)],
                extent=0.78, elevation=22, center=(0, 0.25, 0))


# ----------------------------------------------------------------- results
def yeast_cluster() -> Prop:
    cells = [((-0.16, 0.0, 0.05), (0.17, 0.21, 0.17), 10), ((0.15, 0.03, -0.02), (0.16, 0.2, 0.16), -15),
             ((0.0, 0.2, -0.12), (0.15, 0.19, 0.15), 30), ((-0.05, -0.2, -0.06), (0.15, 0.18, 0.15), -40),
             ((0.23, -0.2, 0.1), (0.13, 0.16, 0.13), 60)]
    body = union(*[ellipsoid(cc, rr, rot(roll=a)) for cc, rr, a in cells], k=0.035)
    bud = union(sphere((0.36, 0.17, 0.02), 0.085), capsule((0.25, 0.1, 0.0), (0.33, 0.15, 0.02), 0.04), k=0.04)

    def scars(p, n):
        return 0.03 * np.sin(p[:, 0] * 31) * np.sin(p[:, 1] * 29) * np.sin(p[:, 2] * 27)

    return Prop('yeast', [Part(body, tone=0.04, texture=scars), Part(bud, tone=0.12)], extent=0.62, elevation=18, blend=0.03)


def membrane_receptor() -> Prop:
    c = np.zeros(3)
    pitch = 0.1

    def heads(y0):
        def f(p):
            q = p - c
            ix = np.clip(np.round(q[:, 0] / pitch), -5, 5)
            iz = np.clip(np.round(q[:, 2] / pitch), -5, 5)
            qq = np.stack([q[:, 0] - ix * pitch, q[:, 1] - y0, q[:, 2] - iz * pitch], axis=1)
            return length(qq) - 0.047
        return f

    core = round_box(c, (0.52, 0.075, 0.52), 0.03)
    helices = union(*[capsule((0.1 * math.cos(a), -0.36, 0.1 * math.sin(a)), (0.1 * math.cos(a), 0.4, 0.1 * math.sin(a)), 0.05)
                      for a in np.linspace(0, 2 * math.pi, 7, endpoint=False)], k=0.01)
    return Prop('membrane', [Part(union(heads(0.12), heads(-0.12)), tone=0.08), Part(core, tone=-0.08), Part(helices, tone=0.18)],
                extent=0.86, elevation=28)


# ------------------------------------------------------------------- model
def alpha_helix() -> Prop:
    r, pitch, tr, h = 0.1, 0.16, 0.042, 0.5

    def helix(p):
        x, y, z = p[:, 0], p[:, 1], p[:, 2]
        th = np.arctan2(z, x)
        k = np.round((y / pitch) - th / (2 * math.pi))
        y0 = pitch * (th / (2 * math.pi) + k)
        rho = np.hypot(x, z)
        d = np.sqrt((rho - r) ** 2 + ((y - y0) * 0.97) ** 2) - tr
        return np.maximum(d, np.abs(y) - h)

    core = capsule((0, -h + 0.02, 0), (0, h - 0.02, 0), 0.045)
    return Prop('helix', [Part(helix, tone=0.06), Part(core, tone=-0.1)], extent=0.56, elevation=12, blend=0.0)


def ligand() -> Prop:
    ring = [(0.16 * math.cos(a), 0.05 * math.sin(2 * a), 0.16 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 6, endpoint=False)]
    chain = [(0.3, 0.06, 0.05), (0.43, 0.0, 0.0), (0.56, 0.07, 0.04), (0.69, 0.0, -0.01), (0.82, 0.06, 0.03)]
    side = [(-0.27, 0.09, 0.05), (0.0, 0.14, -0.25), (0.1, -0.12, 0.25), (0.92, 0.0, -0.06)]
    atoms = ring + chain + side
    bonds = [(ring[i], ring[(i + 1) % 6]) for i in range(6)] + [(ring[0], chain[0])] + \
            [(chain[i], chain[i + 1]) for i in range(len(chain) - 1)] + \
            [(ring[3], side[0]), (ring[4], side[1]), (ring[1], side[2]), (chain[-1], side[3])]
    balls = union(*[sphere(a, 0.062 if i < 11 else 0.07) for i, a in enumerate(atoms)])
    sticks = union(*[capsule(a, b, 0.024) for a, b in bonds])
    return Prop('ligand', [Part(balls, material='amber', tone=0.02), Part(sticks, material='amber', tone=-0.06)],
                extent=0.78, elevation=30, center=(0.31, 0, 0))


def ode_ribbon() -> Prop:
    ts = np.linspace(0, 1, 26)
    pts = [(1.3 * (t - 0.5), 0.5 * (math.tanh((t - 0.5) * 6) / math.tanh(3)) * 0.5 + 0.05 * math.sin(t * 9), 0.15 * math.sin(t * 3.1)) for t in ts]
    return Prop('ribbon', [Part(tube(pts, [0.045] * len(pts), k=0.01), tone=0.1)], extent=0.75, elevation=20)


def field_coins() -> Prop:
    R = rot(yaw=-30)
    c = np.zeros(3)
    tile = round_box(c, (0.42, 0.07, 0.42), 0.04, R)
    rows = union(*[capsule(R @ np.array([-0.36, 0.08, z]), R @ np.array([0.36, 0.08, z]), 0.035) for z in np.linspace(-0.3, 0.3, 6)])
    coins = union(*[cylinder((0.62, 0.0 + 0.055 * i, 0.12), 0.14, 0.024, rounding=0.012) for i in range(3)])

    def crops(p, n):
        return 0.05 * np.sin(p[:, 0] * 40 + p[:, 2] * 25)

    return Prop('field', [Part(tile, tone=-0.06), Part(rows, tone=0.1, texture=crops), Part(coins, tone=0.16)],
                extent=0.82, elevation=30, center=(0.14, 0, 0))


# ------------------------------------------------------------ contribution
def toolbox(part: str) -> Prop:
    R = rot(yaw=-22)
    c = np.zeros(3)
    if part == 'body':
        outer = round_box(c, (0.6, 0.24, 0.3), 0.04, R)
        inner = round_box(c + R @ np.array([0, 0.1, 0]), (0.55, 0.26, 0.25), 0.03, R)
        latch = round_box(c + R @ np.array([0, 0.14, 0.305]), (0.07, 0.04, 0.02), 0.012, R)
        return Prop('toolbox-body', [Part(subtract(outer, inner), tone=0.0), Part(latch, tone=0.14)], extent=0.75, elevation=30)
    lid = round_box(c, (0.61, 0.045, 0.31), 0.04, R)
    handle = union(capsule(R @ np.array([-0.2, 0.04, 0]), R @ np.array([-0.2, 0.16, 0]), 0.028),
                   capsule(R @ np.array([0.2, 0.04, 0]), R @ np.array([0.2, 0.16, 0]), 0.028),
                   capsule(R @ np.array([-0.2, 0.16, 0]), R @ np.array([0.2, 0.16, 0]), 0.03), k=0.03)
    return Prop('toolbox-lid', [Part(lid, tone=0.06), Part(handle, tone=0.14)], extent=0.72, elevation=30)


def _prism2d(points2d, depth, R):
    """Convex polygon in local XY extruded to +-depth along local Z."""
    pts = np.asarray(points2d, float)
    def f(p):
        q = p @ R
        d = np.full(len(q), -1e9)
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            e = b - a
            nrm = np.array([e[1], -e[0]]) / np.hypot(*e)
            d = np.maximum(d, (q[:, :2] - a) @ nrm)
        return np.maximum(d, np.abs(q[:, 2]) - depth)
    return f


def block(kind: str) -> Prop:
    R = rot(yaw=-28, pitch=8)
    if kind == 'promoter':
        stem = round_box(np.zeros(3), (0.06, 0.2, 0.08), 0.03, R)
        arm = round_box(R @ np.array([0.14, 0.17, 0]), (0.2, 0.06, 0.08), 0.03, R)
        head = _prism2d([(0.3, 0.32), (0.3, 0.02), (0.5, 0.17)], 0.08, R)
        shape = union(stem, arm, head, k=0.02)
    elif kind == 'cds':
        shape = round_box(np.zeros(3), (0.34, 0.11, 0.1), 0.06, R)
    else:
        stem = round_box(np.zeros(3), (0.06, 0.2, 0.08), 0.03, R)
        bar = round_box(R @ np.array([0, 0.2, 0]), (0.22, 0.06, 0.08), 0.03, R)
        shape = union(stem, bar, k=0.02)

    def studs(p, n):
        return 0.03 * np.sin(p[:, 0] * 30) * np.sin(p[:, 2] * 30)

    return Prop(f'block-{kind}', [Part(shape, tone=0.08, texture=studs)], extent=0.62, elevation=24,
                center=(0.12, 0.08, 0) if kind == 'promoter' else (0, 0.06 if kind == 'terminator' else 0, 0))


def cryovial() -> Prop:
    body = union(cylinder((0, 0, 0), 0.11, 0.3, rounding=0.02), sphere((0, -0.3, 0), 0.105), k=0.03)
    cap = cylinder((0, 0.37, 0), 0.125, 0.075, rounding=0.025)

    def ridges(p, n):
        return 0.07 * np.sign(np.sin(np.arctan2(p[:, 2], p[:, 0]) * 18)) * (p[:, 1] > 0.3)

    def label(p, n):
        return np.where((p[:, 1] > -0.12) & (p[:, 1] < 0.16), 0.14, 0.0)

    return Prop('cryovial', [Part(body, tone=0.04, texture=label), Part(cap, tone=-0.06, texture=ridges)], extent=0.55, elevation=20, center=(0, 0.02, 0))


def manual() -> Prop:
    R = rot(yaw=-24)
    c = np.zeros(3)
    book = round_box(c, (0.4, 0.045, 0.52), 0.025, R)
    rings = union(*[torus(c + R @ np.array([-0.4, 0.0, z]), 0.045, 0.011, R @ rot(roll=90)) for z in np.linspace(-0.44, 0.44, 9)])

    def cover(p, n):
        q = local(p, c, R)
        top = q[:, 1] > 0.04
        panel = (np.abs(q[:, 0] - 0.04) < 0.24) & (np.abs(q[:, 2] + 0.18) < 0.09)
        return np.where(top & panel, 0.14, 0.0)

    return Prop('manual', [Part(book, tone=0.0, texture=cover), Part(rings, tone=0.2)], extent=0.72, elevation=36)


# ------------------------------------------------------------ experiments
DISH_R = 0.46
DISH_FRAME = dict(extent=0.66, elevation=34, center=(0, 0.04, 0), crop=False)   # lid and base share it


def dish(part: str) -> Prop:
    """Petri dish base (agar with a few colonies) or its lid. Both are rendered
    uncropped on the same frame, so a lid drawn at its base's position sits on it."""
    if part == 'base':
        wall = subtract(cylinder((0, 0, 0), DISH_R, 0.055, rounding=0.014), cylinder((0, 0.04, 0), DISH_R - 0.026, 0.06))
        agar = cylinder((0, -0.004, 0), DISH_R - 0.027, 0.03, rounding=0.012)
        dots = ((-0.15, -0.08, 0.045), (0.12, 0.1, 0.038), (0.05, -0.21, 0.032), (-0.05, 0.19, 0.04), (0.23, -0.06, 0.03), (-0.25, 0.12, 0.028))
        colonies = union(*[sphere((x, 0.018, z), r) for x, z, r in dots])
        parts = [Part(wall, tone=0.1), Part(agar, tone=-0.07), Part(colonies, tone=0.13)]
    else:
        lid = subtract(cylinder((0, 0.085, 0), DISH_R + 0.03, 0.035, rounding=0.016), cylinder((0, 0.05, 0), DISH_R + 0.006, 0.036))
        parts = [Part(lid, tone=0.17)]
    return Prop(f'dish-{part}', parts, **DISH_FRAME)


def pipette() -> Prop:
    R = rot(roll=-26)
    P = lambda x, y, z=0.0: R @ np.array([x, y, z])
    body = capsule(P(0, -0.2), P(0, 0.3), 0.072)
    grip = capsule(P(0, 0.04), P(0, 0.27), 0.088)
    rest = capsule(P(0.03, 0.27), P(0.15, 0.31), 0.032)
    plunger = capsule(P(0, 0.3), P(0, 0.45), 0.03)
    button = cylinder(P(0, 0.47), 0.058, 0.022, R=R, rounding=0.012)
    nose = capsule(P(0, -0.2), P(0, -0.36), 0.052, 0.03)
    ejector = capsule(P(-0.08, 0.14), P(-0.08, -0.22), 0.02)
    tip = capsule(P(0, -0.36), P(0, -0.68), 0.034, 0.006)

    def ridges(p, n):
        q = p @ R
        return 0.06 * (np.sin(q[:, 1] * 90) > 0.4)

    return Prop('pipette', [Part(body, tone=0.04), Part(grip, tone=-0.05, texture=ridges), Part(rest, tone=0.0),
                            Part(plunger, tone=0.12), Part(button, tone=0.16), Part(nose, tone=0.02),
                            Part(ejector, tone=-0.08), Part(tip, tone=0.2)], extent=0.8, elevation=18, center=(0.04, -0.1, 0))


def tube_rack() -> Prop:
    R = rot(yaw=-24)
    c = np.zeros(3)
    xs, zs = np.linspace(-0.42, 0.42, 5), (-0.1, 0.1)
    rack = round_box(c, (0.56, 0.07, 0.21), 0.03, R)
    holes = union(*[cylinder(R @ np.array([x, 0.06, z]), 0.056, 0.05) for x in xs for z in zs])
    tubes, caps = [], []
    for i, j in ((0, 0), (1, 1), (1, 0), (2, 0), (3, 0), (3, 1), (4, 1)):
        q = R @ np.array([xs[i], 0, zs[j]])
        tubes.append(union(cylinder(q + (0, 0.15, 0), 0.046, 0.1), capsule(q + (0, 0.06, 0), q + (0, -0.03, 0), 0.042, 0.012)))
        caps.append(cylinder(q + (0, 0.265, 0), 0.057, 0.022, rounding=0.01))
    return Prop('tube-rack', [Part(subtract(rack, holes), tone=0.0), Part(union(*tubes), tone=0.18), Part(union(*caps), tone=-0.04)],
                extent=0.72, elevation=30, center=(0, 0.08, 0))


def thermocycler() -> Prop:
    R = rot(yaw=22)
    c = np.zeros(3)
    base = round_box(c, (0.48, 0.17, 0.4), 0.05, R)
    lid = round_box(c + R @ np.array([0, 0.2, -0.04]), (0.45, 0.06, 0.34), 0.05, R)
    knob = cylinder(c + R @ np.array([0, 0.27, -0.04]), 0.11, 0.025, R=R, rounding=0.012)

    def panel(p, n):
        q = local(p, c, R)
        front = q[:, 2] > 0.38
        screen = front & (np.abs(q[:, 0] + 0.17) < 0.17) & (np.abs(q[:, 1] - 0.02) < 0.075)
        vents = front & (q[:, 0] > 0.1) & (q[:, 0] < 0.4) & (np.abs(q[:, 1] - 0.02) < 0.08) & (np.sin(q[:, 0] * 110) > 0.35)
        return np.where(screen, -0.22, 0.0) + np.where(vents, -0.12, 0.0)

    return Prop('thermocycler', [Part(base, tone=0.02, texture=panel), Part(lid, tone=0.12), Part(knob, tone=-0.04)],
                extent=0.72, elevation=28, center=(0, 0.04, 0))


# ------------------------------------------------------------ parts
ARC_FRAME = dict(extent=0.62, elevation=20, crop=False)


def plasmid_half(side: str) -> Prop:
    """One half of the engineering plasmid, cut open; both halves share a frame."""
    R = rot(pitch=62, roll=-12)
    c = np.zeros(3)
    keep = 1.0 if side == 'left' else -1.0
    cut = lambda p, k=keep: k * p[:, 0] + 0.006
    ring = intersect(torus(c, 0.42, 0.075, R), cut)
    bands = []
    for a0, a1 in ((10, 70), (130, 160), (215, 300)):
        n1 = np.array([math.sin(math.radians(a0)), 0, -math.cos(math.radians(a0))])
        n2 = np.array([-math.sin(math.radians(a1)), 0, math.cos(math.radians(a1))])
        wedge = (lambda n1=n1, n2=n2: (lambda p: np.maximum(local(p, c, R) @ n1, local(p, c, R) @ n2)))()
        bands.append(intersect(intersect(torus(c, 0.42, 0.098, R), wedge), cut))
    return Prop(f'arc-{side}', [Part(ring, tone=0.0), Part(union(*bands), tone=0.12)], **ARC_FRAME)


def sbol_block(kind: str) -> Prop:
    """Glyph-shaped part blocks to sit beside block('promoter') / block('terminator')."""
    R = rot(yaw=-28, pitch=8)
    if kind == 'rbs':
        disc = cylinder(np.zeros(3), 0.17, 0.08, R=R @ rot(pitch=90), rounding=0.03)
        shape = intersect(disc, lambda p: -(p @ R)[:, 1])
        center = (0, 0.07, 0)
    else:  # cds: the arrow-ended box of the SBOL glyph
        arrow = _prism2d([(-0.31, -0.085), (0.17, -0.085), (0.31, 0.0), (0.17, 0.085), (-0.31, 0.085)], 0.055, R)
        shape = lambda p: arrow(p) - 0.03
        center = (0, 0, 0)

    def studs(p, n):
        return 0.03 * np.sin(p[:, 0] * 30) * np.sin(p[:, 2] * 30)

    return Prop(f'block-{kind}', [Part(shape, tone=0.08, texture=studs)], extent=0.62, elevation=24, center=center)


# ------------------------------------------------------------ background
def _pages_texture(c, R, half, spine_x):
    """Paper edge stripes on a closed book's three open sides."""
    def tex(p, n):
        q = local(p, c, R)
        side = np.abs(n[:, 1]) < 0.6
        inner = np.abs(q[:, 1]) < half[1] * 0.72
        open_side = q[:, 0] * np.sign(-spine_x) > -half[0] + 0.03
        stripes = 0.05 * (np.sin(q[:, 1] * 260) > 0)
        return np.where(side & inner & open_side, 0.2 + stripes, 0.0)
    return tex


def journals() -> Prop:
    parts, y = [], 0.0
    for i, (hx, hz, th, yaw, tone) in enumerate(((0.44, 0.31, 0.06, -14, 0.0), (0.4, 0.29, 0.05, -3, 0.12), (0.42, 0.3, 0.045, -22, -0.05))):
        R = rot(yaw=yaw)
        c = np.array([0.03 * (i - 1), y + th, -0.015 * i])
        half = (hx, th, hz)
        parts.append(Part(round_box(c, half, 0.016, R), tone=tone, texture=_pages_texture(c, R, half, -hx)))
        y += 2 * th + 0.003
    return Prop('journals', parts, extent=0.66, elevation=30, center=(0, 0.14, 0))


def book_closed() -> Prop:
    R = rot(yaw=-12)
    c = np.zeros(3)
    half = (0.36, 0.075, 0.46)
    cover = round_box(c, half, 0.022, R)
    spine = capsule(R @ np.array([-0.36, 0, -0.44]), R @ np.array([-0.36, 0, 0.44]), 0.08)
    band = round_box(c + R @ np.array([0.0, 0.074, -0.18]), (0.25, 0.004, 0.06), 0.003, R)
    return Prop('book-closed', [Part(cover, tone=0.04, texture=_pages_texture(c, R, half, -0.36)),
                                Part(spine, tone=-0.06), Part(band, tone=0.16)], extent=0.66, elevation=32)


def book_open() -> Prop:
    R = rot(yaw=-12)
    c = np.zeros(3)
    cover = round_box(c + R @ np.array([0, -0.035, 0]), (0.7, 0.014, 0.44), 0.012, R)

    def leaf(sign):
        def f(p):
            q = local(p, c, R)
            x = sign * q[:, 0]
            top = 0.055 + 0.045 * np.exp(-((x - 0.16) / 0.2) ** 2) - 0.04 * np.exp(-(x / 0.05) ** 2)
            return np.maximum.reduce([q[:, 1] - top, -q[:, 1] - 0.025, np.abs(x - 0.345) - 0.335, np.abs(q[:, 2]) - 0.42]) * 0.8
        return f

    def lines(p, n):
        q = local(p, c, R)
        top = n[:, 1] > 0.5
        x = np.abs(q[:, 0])
        rows = (np.abs(((q[:, 2] + 1) % 0.07) - 0.035) < 0.006) & (x > 0.1) & (x < 0.6) & (np.abs(q[:, 2]) < 0.34)
        edge = (~top) & (np.sin(q[:, 1] * 300) > 0)
        return np.where(top & rows, -0.12, 0.0) + np.where(edge, 0.05, 0.0)

    return Prop('book-open', [Part(cover, tone=-0.06), Part(leaf(1), tone=0.22, texture=lines), Part(leaf(-1), tone=0.18, texture=lines)],
                extent=0.8, elevation=36)


# ------------------------------------------------------------ attributions
PUZZLE_FRAME = dict(extent=0.74, elevation=42, crop=False)
PZ_KNOBS = (('a', 0.05, -0.25), ('c', -0.25, -0.05), ('b', 0.25, 0.05), ('d', -0.05, 0.25))   # owner, x, z
PZ_CELLS = {'a': (-0.25, -0.25), 'b': (0.25, -0.25), 'c': (-0.25, 0.25), 'd': (0.25, 0.25)}


def puzzle_piece(name: str) -> Prop:
    """One piece of a 2x2 jigsaw (a back-left, b back-right, c front-left, d
    front-right). All four share a frame, so drawn at one spot they interlock."""
    R = rot(yaw=-18)
    c = np.zeros(3)
    cx, cz = PZ_CELLS[name]
    h, r, gap = 0.05, 0.022, 0.007

    def f(p):
        q = local(p, c, R)
        x, y, z = q[:, 0], q[:, 1], q[:, 2]
        d = np.maximum(np.abs(x - cx), np.abs(z - cz)) - (0.25 - gap)
        for owner, kx, kz in PZ_KNOBS:
            k = np.hypot(x - kx, z - kz) - 0.08
            d = np.minimum(d, k) if owner == name else np.maximum(d, -(k - gap * 1.6))
        d2 = d + r
        dy = np.abs(y) - (h - r)
        return np.minimum(np.maximum(d2, dy), 0) + np.hypot(np.maximum(d2, 0), np.maximum(dy, 0)) - r

    tone = {'a': 0.0, 'b': 0.12, 'c': -0.06, 'd': 0.17}[name]
    return Prop(f'piece-{name}', [Part(f, tone=tone)], **PUZZLE_FRAME)


PAGES = {
    'description': lambda: [soil_half('left'), soil_half('right'), seedling(), nematode(), test_strip()],
    'engineering': lambda: [blueprint(), plasmid(), microplate(), laptop()],
    'results': lambda: [yeast_cluster(), membrane_receptor(), test_strip(window=None, upright=True, name='strip-neutral'),
                        test_strip(window='amber', upright=True, name='strip-amber')],
    'model': lambda: [alpha_helix(), ligand(), ode_ribbon(), field_coins()],
    'contribution': lambda: [toolbox('body'), toolbox('lid'), block('promoter'), block('cds'), block('terminator'), cryovial(), manual()],
    'experiments': lambda: [dish('base'), dish('lid'), pipette(), tube_rack(), thermocycler()],
    'parts': lambda: [plasmid_half('left'), plasmid_half('right'), block('promoter'), sbol_block('rbs'), sbol_block('cds'), block('terminator')],
    'background': lambda: [journals(), book_closed(), book_open(), ligand(), alpha_helix(), ode_ribbon()],
    'attributions': lambda: [puzzle_piece(n) for n in 'abcd'],
}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('page', choices=sorted(PAGES))
    ap.add_argument('--only', nargs='*')
    ap.add_argument('--size', type=int, default=900)
    args = ap.parse_args()
    out = OUT / args.page
    out.mkdir(parents=True, exist_ok=True)
    for prop in PAGES[args.page]():
        if args.only and prop.name not in args.only:
            continue
        t0 = time.time()
        im = render(prop, size=args.size)
        im.save(out / f'{prop.name}.png', optimize=True)
        print(f'{args.page}/{prop.name}.png {im.size[0]}x{im.size[1]} in {time.time() - t0:.1f}s')


if __name__ == '__main__':
    main()
