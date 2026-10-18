"""Library models for the dense page-opening islands (2026-10-18).

Each function returns a Prop whose parts sit around the origin, roughly one
unit tall or wide, standing on y = 0 when it is a bench object. Islands
(islands.py) put many of them into one 3D scene with sdf.place(), so they
occlude each other and share contact shadows. No model carries text,
numbers, logos or data: labels are blank bands, screens are plain swatches.
"""
from __future__ import annotations

import math

import numpy as np

from sdf import (Part, Prop, capsule, cylinder, ellipsoid, intersect, local, rot, round_box, sphere,  # noqa: F401
                 subtract, torus, tube, union)
from props import _prism2d, alpha_helix, ligand  # noqa: F401  (re-exported for islands.py)


def poly_prism(points2d, depth, R=np.eye(3), c=(0, 0, 0)):
    """Exact SDF of an extruded simple polygon (concave allowed), polygon in local x-y."""
    P = np.asarray(points2d, float); c = np.asarray(c, float)

    def f(p):
        q = (p - c) @ R
        x, y = q[:, 0], q[:, 1]
        d = np.full(len(q), np.inf); sgn = np.ones(len(q))
        for i in range(len(P)):
            a, b = P[i], P[i - 1]
            ex, ey = b[0] - a[0], b[1] - a[1]
            wx, wy = x - a[0], y - a[1]
            t = np.clip((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1)
            d = np.minimum(d, (wx - ex * t) ** 2 + (wy - ey * t) ** 2)
            c1, c2, c3 = y >= a[1], y < b[1], ex * wy > ey * wx
            sgn = np.where((c1 & c2 & c3) | (~c1 & ~c2 & ~c3), -sgn, sgn)
        d2 = sgn * np.sqrt(d)
        dz = np.abs(q[:, 2]) - depth
        return np.minimum(np.maximum(d2, dz), 0) + np.hypot(np.maximum(d2, 0), np.maximum(dz, 0))
    return f


def helix_rod(c, R=np.eye(3), radius=0.065, pitch=0.12, half=0.42, tube_r=0.03):
    """Cheap analytic alpha-helix: a coil around a core, along local y."""
    c = np.asarray(c, float)
    slope = pitch / (2 * math.pi * radius); kk = 1 / math.sqrt(1 + slope * slope)

    def coil(p):
        q = (p - c) @ R
        r = np.hypot(q[:, 0], q[:, 2]); th = np.arctan2(q[:, 2], q[:, 0])
        u = q[:, 1] - pitch * th / (2 * math.pi)
        dy = (u + pitch / 2) % pitch - pitch / 2
        return np.maximum(np.sqrt((r - radius) ** 2 + (dy * kk) ** 2) - tube_r, np.abs(q[:, 1]) - half) * 0.9
    core = cylinder(c, radius * 0.62, half, R=R, rounding=0.02)
    return coil, core


def _rng(seed):
    return np.random.default_rng(seed)


def _lines(axis=0, freq=40.0, amp=0.05, sharp=0.5):
    """Engraved stripes along one local axis: paper rules, grip ridges."""
    def tex(p, n):
        return -amp * (np.sin(p[:, axis] * freq) > sharp)
    return tex


# ---------------------------------------------------------------- people
def pawn(pose='stand', seed=0) -> Prop:
    """Faceless clay figurine (a game piece, not a portrait)."""
    r = _rng(seed)
    base = cylinder((0, 0.025, 0), 0.17, 0.025, rounding=0.012)
    body = capsule((0, 0.1, 0), (0, 0.4, 0), 0.165, 0.115)
    head = sphere((0, 0.6, 0), 0.115)
    neck = capsule((0, 0.44, 0), (0, 0.52, 0), 0.06)
    sh = 0.38
    if pose == 'wave':
        arms = union(capsule((-0.12, sh, 0), (-0.2, 0.17, 0.02), 0.045), capsule((0.12, sh, 0), (0.25, 0.62, 0.0), 0.045))
    elif pose == 'hold':
        arms = union(capsule((-0.12, sh, 0), (-0.06, 0.26, 0.17), 0.045), capsule((0.12, sh, 0), (0.06, 0.26, 0.17), 0.045))
    else:
        arms = union(capsule((-0.12, sh, 0), (-0.19, 0.16, 0.03), 0.045), capsule((0.12, sh, 0), (0.19, 0.16, 0.03), 0.045))
    t = r.uniform(-0.04, 0.06)
    return Prop(f'pawn-{pose}', [Part(base, tone=-0.06), Part(body, tone=0.04 + t), Part(arms, tone=0.04 + t),
                                 Part(neck, tone=0.1), Part(head, tone=0.12)], extent=0.5, elevation=24, center=(0, 0.34, 0))


def bubble(style='dots') -> Prop:
    """Speech bubble standing in the x-y plane."""
    slab = round_box((0, 0.3, 0), (0.3, 0.17, 0.035), 0.03)
    soft = lambda p: slab(p) - 0.06
    tail = _prism2d([(-0.17, 0.2), (-0.02, 0.2), (-0.2, 0.0)], 0.04, np.eye(3))
    tail2 = lambda p: tail(p) - 0.015
    shape = union(soft, tail2, k=0.04)
    if style == 'dots':
        marks = union(*[sphere((x, 0.3, 0.1), 0.045) for x in (-0.15, 0.0, 0.15)])
    else:
        marks = union(*[capsule((-0.2, y, 0.095), (x, y, 0.095), 0.022) for y, x in ((0.38, 0.2), (0.3, 0.12), (0.22, 0.04))])
    return Prop(f'bubble-{style}', [Part(shape, tone=0.12), Part(marks, tone=-0.1)], extent=0.45, elevation=8, center=(0, 0.28, 0))


def clipboard() -> Prop:
    R = rot(pitch=-62)
    board = round_box((0, 0, 0), (0.25, 0.33, 0.014), 0.012, R)
    paper = round_box(R @ np.array([0, -0.03, 0.016]), (0.21, 0.27, 0.004), 0.003, R)
    clip = union(round_box(R @ np.array([0, 0.31, 0.03]), (0.1, 0.035, 0.025), 0.015, R),
                 cylinder(R @ np.array([0, 0.33, 0.05]), 0.03, 0.06, R=R @ rot(roll=90), rounding=0.01))

    def form(p, n):
        q = p @ R
        rows = (np.abs(((q[:, 1] + 1) % 0.075) - 0.0375) < 0.006) & (q[:, 0] > -0.08) & (q[:, 0] < 0.17) & (q[:, 1] < 0.18)
        boxes = (np.abs(q[:, 0] + 0.14) < 0.022) & (np.abs(((q[:, 1] + 1) % 0.075) - 0.0375) < 0.022) & (q[:, 1] < 0.18)
        return np.where(rows, -0.14, 0.0) + np.where(boxes, -0.1, 0.0)

    return Prop('clipboard', [Part(board, tone=-0.04), Part(paper, tone=0.24, texture=form), Part(clip, tone=-0.1)],
                extent=0.42, elevation=30, center=(0, 0.02, 0))


# ---------------------------------------------------------------- bench
def magnifier() -> Prop:
    R = rot(pitch=70, roll=-20)
    ring = torus((0, 0.18, 0), 0.17, 0.03, R)
    lens = cylinder((0, 0.18, 0), 0.155, 0.012, R=R, rounding=0.008)
    hd = R @ np.array([0.0, 0.0, 0.19])
    handle = capsule(np.array([0, 0.18, 0]) + R @ np.array([0.12, 0, 0.12]) * 1.0, np.array([0, 0.18, 0]) + R @ np.array([0.33, 0, 0.33]), 0.035, 0.045)
    return Prop('magnifier', [Part(ring, tone=-0.02), Part(lens, tone=0.25), Part(handle, tone=0.06, texture=_lines(1, 60, 0.04))],
                extent=0.45, elevation=34, center=(0.08, 0.15, 0.05))


def tip_box() -> Prop:
    box = round_box((0, 0.09, 0), (0.3, 0.09, 0.19), 0.02)
    plate = round_box((0, 0.19, 0), (0.29, 0.012, 0.18), 0.008)
    tips = []
    for i in range(6):
        for j in range(3):
            x, z = -0.225 + i * 0.09, -0.11 + j * 0.11
            tips.append(capsule((x, 0.2, z), (x, 0.36, z), 0.03, 0.012))
    lid = round_box((0, 0.25, -0.24), (0.3, 0.012, 0.11), 0.01, rot(pitch=-55))
    return Prop('tip-box', [Part(box, tone=-0.02), Part(plate, tone=0.1), Part(union(*tips), tone=0.22), Part(lid, tone=0.02)],
                extent=0.45, elevation=32, center=(0, 0.17, -0.03))


def ep_tube(open_cap=True, seed=0) -> Prop:
    body = union(cylinder((0, 0.2, 0), 0.06, 0.1), capsule((0, 0.1, 0), (0, 0.0, 0), 0.058, 0.016))
    rim = torus((0, 0.3, 0), 0.062, 0.012)
    if open_cap:
        cap = cylinder((0.11, 0.36, 0), 0.068, 0.018, R=rot(roll=-70), rounding=0.008)
        hinge = capsule((0.06, 0.3, 0), (0.1, 0.33, 0), 0.012)
        caps = union(cap, hinge)
    else:
        caps = cylinder((0, 0.32, 0), 0.07, 0.022, rounding=0.01)
    liquid = cylinder((0, 0.12, 0), 0.061, 0.045)
    return Prop('ep-tube', [Part(body, tone=0.18), Part(rim, tone=0.16), Part(caps, tone=-0.02 + 0.04 * (seed % 3)),
                            Part(liquid, tone=-0.06)], extent=0.3, elevation=26, center=(0, 0.18, 0))


def beaker() -> Prop:
    wall = subtract(cylinder((0, 0.2, 0), 0.17, 0.2, rounding=0.012), cylinder((0, 0.24, 0), 0.15, 0.2))
    lip = capsule((0.13, 0.4, 0.09), (0.19, 0.41, 0.13), 0.02)
    liquid = cylinder((0, 0.12, 0), 0.152, 0.1, rounding=0.004)

    def ticks(p, n):
        return -0.08 * ((np.abs(((p[:, 1] + 1) % 0.06) - 0.03) < 0.004) & (p[:, 0] < -0.04) & (p[:, 1] > 0.08) & (p[:, 1] < 0.34))

    return Prop('beaker', [Part(wall, tone=0.2, texture=ticks), Part(lip, tone=0.2), Part(liquid, tone=-0.04)],
                extent=0.32, elevation=26, center=(0, 0.2, 0))


def flask() -> Prop:
    body = capsule((0, 0.08, 0), (0, 0.32, 0), 0.22, 0.06)
    flat = lambda p: np.maximum(body(p), -p[:, 1])
    neck = cylinder((0, 0.42, 0), 0.06, 0.1, rounding=0.01)
    rim = torus((0, 0.52, 0), 0.06, 0.016)
    liquid = intersect(lambda p: body(p) + 0.012, lambda p: p[:, 1] - 0.15)
    return Prop('flask', [Part(flat, tone=0.2), Part(neck, tone=0.2), Part(rim, tone=0.18), Part(liquid, tone=-0.08)],
                extent=0.34, elevation=24, center=(0, 0.27, 0))


def goggles() -> Prop:
    R = rot(yaw=-20)
    lenses = union(ellipsoid(R @ np.array([-0.13, 0.12, 0]), (0.12, 0.08, 0.05), R), ellipsoid(R @ np.array([0.13, 0.12, 0]), (0.12, 0.08, 0.05), R), k=0.03)
    frame = union(torus(R @ np.array([-0.13, 0.12, 0.01]), 0.1, 0.018, R @ rot(pitch=90)), torus(R @ np.array([0.13, 0.12, 0.01]), 0.1, 0.018, R @ rot(pitch=90)))
    strap = intersect(torus(R @ np.array([0, 0.12, -0.16]), 0.27, 0.016), lambda p: (p - R @ np.array([0, 0, -0.03])) @ (R @ np.array([0, 0, 1.0])))
    return Prop('goggles', [Part(lenses, tone=0.2), Part(frame, tone=-0.04), Part(strap, tone=-0.1)],
                extent=0.36, elevation=30, center=(0, 0.1, -0.06))


def shield() -> Prop:
    pts = [(-0.3, 0.36), (0.3, 0.36), (0.3, 0.05), (0.2, -0.2), (0.0, -0.38), (-0.2, -0.2), (-0.3, 0.05)]
    R = rot(yaw=-18, pitch=-8)
    face = poly_prism(pts, 0.05, R)
    body = lambda p: face(p) - 0.03
    rim = subtract(lambda p: face(p) - 0.045, lambda p: poly_prism([(x * 0.84, y * 0.84 + 0.01) for x, y in pts], 0.2, R)(p))
    c = R @ np.array([0, 0, 0.08])
    tick = union(capsule(c + R @ np.array([-0.13, 0.02, 0]), c + R @ np.array([-0.03, -0.09, 0]), 0.034),
                 capsule(c + R @ np.array([-0.03, -0.09, 0]), c + R @ np.array([0.15, 0.13, 0]), 0.034))
    return Prop('shield', [Part(body, tone=0.06), Part(rim, tone=-0.06), Part(tick, tone=0.2)], extent=0.48, elevation=14)


def safety_cabinet(part='body') -> Prop:
    """Biosafety cabinet; 'sash' is its front glass panel (rendered on the same frame)."""
    if part == 'body':
        outer = round_box((0, 0.62, 0), (0.62, 0.62, 0.36), 0.04)
        cavity = round_box((0, 0.58, 0.12), (0.54, 0.42, 0.34), 0.02)
        shell = subtract(outer, cavity)
        hood = round_box((0, 1.31, -0.02), (0.6, 0.08, 0.34), 0.04)
        stand = union(*[capsule((x, 0.0, z), (x, -0.42, z), 0.035) for x in (-0.52, 0.52) for z in (-0.26, 0.26)])
        shelf = round_box((0, 0.17, 0.05), (0.54, 0.02, 0.3), 0.01)
        flask_ = cylinder((0.25, 0.27, 0.0), 0.06, 0.08, rounding=0.02)
        rack = round_box((-0.2, 0.22, 0.02), (0.14, 0.035, 0.07), 0.01)

        def vents(p, n):
            return -0.1 * ((np.sin(p[:, 0] * 70) > 0.5) & (p[:, 1] > 1.26) & (n[:, 2] > 0.6))

        return Prop('cabinet-body', [Part(shell, tone=0.08), Part(hood, tone=0.0, texture=vents), Part(stand, tone=-0.1),
                                     Part(shelf, tone=0.14), Part(flask_, tone=0.2), Part(rack, tone=-0.02)],
                    extent=1.05, elevation=16, center=(0, 0.45, 0), crop=False)
    frame = subtract(round_box((0, 0.78, 0.4), (0.56, 0.3, 0.02), 0.015), round_box((0, 0.78, 0.4), (0.5, 0.24, 0.1), 0.01))
    glass = round_box((0, 0.78, 0.4), (0.5, 0.24, 0.008), 0.006)
    handle = capsule((-0.3, 0.46, 0.44), (0.3, 0.46, 0.44), 0.02)
    return Prop('cabinet-sash', [Part(frame, tone=-0.04), Part(glass, tone=0.26), Part(handle, tone=-0.1)],
                extent=1.05, elevation=16, center=(0, 0.45, 0), crop=False)


def cooler_box() -> Prop:
    body = round_box((0, 0.17, 0), (0.32, 0.17, 0.22), 0.04)
    lid = round_box((0, 0.37, 0), (0.34, 0.04, 0.24), 0.03)
    handle = intersect(torus((0, 0.42, 0), 0.16, 0.025, rot(pitch=90)), lambda p: 0.42 - p[:, 1])
    handle = (lambda tt: (lambda p: tt(p)))(torus((0, 0.41, 0), 0.15, 0.025, rot(pitch=90)))
    hcut = lambda p: np.maximum(handle(p), 0.41 - p[:, 1])
    band = round_box((0, 0.2, 0.222), (0.18, 0.06, 0.006), 0.004)
    return Prop('cooler-box', [Part(body, tone=0.02), Part(lid, tone=0.12), Part(hcut, tone=-0.08), Part(band, tone=0.22)],
                extent=0.44, elevation=28, center=(0, 0.25, 0))


def microscope() -> Prop:
    base = round_box((0, 0.04, 0.02), (0.2, 0.04, 0.26), 0.035)
    arm = tube([(0, 0.08, -0.17), (0, 0.4, -0.2), (0, 0.66, -0.12), (0, 0.76, 0.0)], [0.07, 0.065, 0.06, 0.055], k=0.03)
    stage = round_box((0, 0.36, 0.05), (0.18, 0.018, 0.16), 0.01)
    clips = union(capsule((-0.1, 0.385, 0.1), (-0.02, 0.385, 0.14), 0.01), capsule((0.1, 0.385, 0.1), (0.02, 0.385, 0.14), 0.01))
    slide = round_box((0, 0.382, 0.08), (0.12, 0.004, 0.04), 0.002)
    turret = cylinder((0, 0.62, 0.06), 0.09, 0.03, R=rot(pitch=-20), rounding=0.015)
    objs = union(*[capsule((x, 0.6, 0.06 + z), (x * 1.1, 0.48, 0.08 + z), 0.026, 0.018) for x, z in ((-0.05, 0.0), (0.04, 0.03), (0.0, -0.05))])
    tube_ = capsule((0, 0.68, 0.04), (0, 0.9, 0.16), 0.045)
    eye = capsule((0, 0.9, 0.16), (0, 0.98, 0.21), 0.038)
    knobs = union(cylinder((0.08, 0.32, -0.17), 0.06, 0.02, R=rot(roll=90), rounding=0.01), cylinder((-0.08, 0.32, -0.17), 0.06, 0.02, R=rot(roll=90), rounding=0.01))
    lamp = cylinder((0, 0.1, 0.06), 0.05, 0.02, rounding=0.01)
    return Prop('microscope', [Part(base, tone=-0.02), Part(arm, tone=0.04), Part(stage, tone=-0.06), Part(clips, tone=0.12),
                               Part(slide, tone=0.26), Part(turret, tone=0.0), Part(objs, tone=0.14), Part(tube_, tone=0.06),
                               Part(eye, tone=-0.04), Part(knobs, tone=-0.1), Part(lamp, tone=0.2)],
                extent=0.6, elevation=18, azimuth=-35, center=(0, 0.5, 0.0))


def desk() -> Prop:
    top = round_box((0, 0.5, 0), (0.45, 0.025, 0.28), 0.015)
    legs = union(*[capsule((x, 0.5, z), (x, 0.0, z), 0.026) for x in (-0.4, 0.4) for z in (-0.23, 0.23)])
    bar = capsule((-0.4, 0.15, 0.0), (0.4, 0.15, 0.0), 0.018)
    book = round_box((0.12, 0.545, 0.02), (0.13, 0.02, 0.09), 0.008, rot(yaw=12))
    pencil = capsule((-0.25, 0.535, 0.1), (-0.05, 0.535, 0.16), 0.012)
    return Prop('desk', [Part(top, tone=0.08), Part(legs, tone=-0.08), Part(bar, tone=-0.08), Part(book, tone=0.0), Part(pencil, tone=0.2)],
                extent=0.55, elevation=30, center=(0, 0.3, 0))


def blackboard(part='board') -> Prop:
    """Board with two hinged wings; all three share one frame."""
    if part == 'board':
        frame = round_box((0, 0.62, 0), (0.62, 0.42, 0.03), 0.02)
        panel = round_box((0, 0.62, 0.025), (0.57, 0.37, 0.008), 0.004)
        chalk = union(torus((-0.25, 0.68, 0.035), 0.1, 0.008, rot(pitch=90)),
                      capsule((-0.1, 0.68, 0.035), (0.12, 0.68, 0.035), 0.008), capsule((0.12, 0.68, 0.035), (0.08, 0.72, 0.035), 0.008),
                      capsule((0.12, 0.68, 0.035), (0.08, 0.64, 0.035), 0.008), torus((0.27, 0.68, 0.035), 0.08, 0.008, rot(pitch=90)),
                      capsule((-0.4, 0.44, 0.035), (0.35, 0.44, 0.035), 0.007), capsule((-0.4, 0.38, 0.035), (0.15, 0.38, 0.035), 0.007))
        tray = round_box((0, 0.2, 0.06), (0.6, 0.012, 0.045), 0.006)
        stand = union(capsule((-0.5, 0.2, 0.0), (-0.62, -0.32, 0.18), 0.025), capsule((0.5, 0.2, 0.0), (0.62, -0.32, 0.18), 0.025),
                      capsule((-0.5, 0.2, 0.0), (-0.6, -0.32, -0.2), 0.025), capsule((0.5, 0.2, 0.0), (0.6, -0.32, -0.2), 0.025))
        return Prop('board', [Part(frame, tone=0.04), Part(panel, tone=-0.3), Part(chalk, tone=0.36), Part(tray, tone=0.0), Part(stand, tone=-0.08)],
                    extent=1.0, elevation=12, center=(0, 0.3, 0), crop=False)
    side = -1 if part == 'wing-l' else 1
    c = np.array([side * 0.305, 0.62, 0.06])
    wing = round_box(c, (0.3, 0.41, 0.02), 0.015)
    inset = round_box(c + (0, 0, 0.02), (0.25, 0.35, 0.004), 0.004)
    knob = sphere(c + (-side * 0.24, 0.0, 0.03), 0.022)
    return Prop(part, [Part(wing, tone=0.06), Part(inset, tone=0.14), Part(knob, tone=-0.08)], extent=1.0, elevation=12, center=(0, 0.3, 0), crop=False)


def pencil() -> Prop:
    R = rot(roll=90, yaw=30)
    body = cylinder((0, 0.03, 0), 0.03, 0.28, R=R)
    tip = capsule(R @ np.array([0, 0.28, 0]) + (0, 0.03, 0), R @ np.array([0, 0.38, 0]) + (0, 0.03, 0), 0.028, 0.004)
    eraser = capsule(R @ np.array([0, -0.28, 0]) + (0, 0.03, 0), R @ np.array([0, -0.33, 0]) + (0, 0.03, 0), 0.03)
    return Prop('pencil', [Part(body, tone=0.06), Part(tip, tone=0.22), Part(eraser, tone=-0.06)], extent=0.4, elevation=34, center=(0, 0.03, 0))


def gear(teeth=10, seed=0) -> Prop:
    R = rot(pitch=72, roll=12)

    def f(p):
        q = p @ R
        a = np.arctan2(q[:, 2], q[:, 0]); sec = 2 * math.pi / teeth
        a2 = (a + sec / 2) % sec - sec / 2
        r = np.hypot(q[:, 0], q[:, 2])
        x, z = r * np.cos(a2), r * np.sin(a2)
        tooth = np.maximum.reduce([np.abs(x - 0.25) - 0.05, np.abs(z) - 0.035, np.abs(q[:, 1]) - 0.05]) - 0.01
        core = np.maximum(r - 0.25, np.abs(q[:, 1]) - 0.06) - 0.01
        hole = np.maximum(r - 0.07, np.abs(q[:, 1]) - 0.2)
        return np.maximum(np.minimum(core, tooth), -hole)
    return Prop('gear', [Part(f, tone=0.02 + 0.06 * (seed % 2))], extent=0.38, elevation=26)


def dna(turns=1.6) -> Prop:
    pts_a, pts_b, rungs = [], [], []
    n = int(turns * 12)
    for i in range(n + 1):
        y = -0.5 + i / n
        a = i / 12 * 2 * math.pi
        pa = (0.17 * math.cos(a), y, 0.17 * math.sin(a)); pb = (0.17 * math.cos(a + math.pi), y, 0.17 * math.sin(a + math.pi))
        pts_a.append(pa); pts_b.append(pb)
        if i % 2 == 0 and 0 < i < n:
            rungs.append(capsule(pa, pb, 0.022))
    R = rot(roll=-24)
    sa = tube([R @ np.array(p) for p in pts_a], [0.045] * len(pts_a))
    sb = tube([R @ np.array(p) for p in pts_b], [0.045] * len(pts_b))
    rr = union(*[(lambda f: (lambda p: f(p @ R)))(g) for g in rungs])
    return Prop('dna', [Part(sa, tone=0.04), Part(sb, tone=0.1), Part(rr, tone=0.22)], extent=0.6, elevation=14)


def receptor_7tm(tilt=0.0) -> Prop:
    """Seven transmembrane helices as a slightly twisted barrel around a pocket;
    loops alternate extracellular (top) / intracellular (bottom)."""
    T = rot(roll=tilt)
    coils, cores, ends = [], [], []
    for i in range(7):
        a = i / 7 * 2 * math.pi + 0.3
        x, z = 0.3 * math.cos(a), 0.26 * math.sin(a)
        Rh = T @ rot(yaw=-math.degrees(a)) @ rot(pitch=11)
        c = T @ np.array([x, 0.0, z])
        coil, core = helix_rod(c, Rh, radius=0.058, pitch=0.105, half=0.34, tube_r=0.026)
        coils.append(coil); cores.append(core)
        ends.append((c + Rh @ np.array([0, 0.36, 0]), c + Rh @ np.array([0, -0.36, 0])))
    loops = []
    for i in range(6):
        top = i % 2 == 0
        p1, p2 = ends[i][0 if top else 1], ends[i + 1][0 if top else 1]
        mid = (p1 + p2) / 2 * 1.18 + T @ np.array([0, 0.07 if top else -0.07, 0])
        loops.append(tube([p1, mid, p2], [0.027, 0.03, 0.027]))
    nterm = tube([ends[0][0], ends[0][0] + T @ np.array([0.04, 0.14, 0.1])], [0.027, 0.022])
    return Prop('receptor', [Part(union(*coils), tone=0.06), Part(union(*cores), tone=-0.04), Part(union(*loops, nterm), tone=0.16)],
                extent=0.55, elevation=22, center=(0, 0.02, 0))


def place_(prop, at, yaw=0.0, pitch=0.0, roll=0.0, s=1.0, tone=0.0):
    from sdf import place
    return place(prop, at=at, yaw=yaw, pitch=pitch, roll=roll, s=s, tone=tone, origin=prop.center)


def membrane(w=1.1, d=0.6) -> Prop:
    """Lipid bilayer slab: two clamped lattices of head spheres over a tail core."""
    sp = 0.085; nx, nz = int(w / sp), int(d / sp)

    def heads(y, off):
        def f(p):
            q = p.copy()
            q[:, 0] = p[:, 0] - off - np.clip(np.round((p[:, 0] - off) / sp), -nx, nx) * sp
            q[:, 2] = p[:, 2] - off - np.clip(np.round((p[:, 2] - off) / sp), -nz, nz) * sp
            q[:, 1] = p[:, 1] - y
            return np.linalg.norm(q, axis=1) - 0.042
        return f
    core = round_box((0, 0, 0), (w * sp * nx / w + 0.0, 0.07, d * sp * nz / d), 0.03)
    return Prop('membrane', [Part(core, tone=-0.08), Part(heads(0.08, 0.0), tone=0.16), Part(heads(-0.08, sp / 2), tone=0.1)],
                extent=0.8, elevation=26)


def water(seed=0) -> Prop:
    r = _rng(seed)
    R = rot(yaw=r.uniform(0, 360), pitch=r.uniform(-40, 40))
    o = sphere((0, 0, 0), 0.09)
    hs = union(sphere(R @ np.array([0.1, 0.06, 0]), 0.055), sphere(R @ np.array([-0.1, 0.06, 0]), 0.055))
    return Prop('water', [Part(o, tone=0.14), Part(hs, tone=0.26)], extent=0.2, elevation=20)


# ---------------------------------------------------------------- soil and field
def clod(seed=0, size=0.25) -> Prop:
    r = _rng(seed)
    k = r.uniform(0.5, 1.5, 6); ph = r.uniform(0, 6.3, 6)
    base = ellipsoid((0, size * 0.55, 0), (size, size * r.uniform(0.55, 0.8), size * r.uniform(0.7, 1.0)))

    def f(p):
        bump = (np.sin(p[:, 0] * 14 * k[0] + ph[0]) * np.sin(p[:, 1] * 13 * k[1] + ph[1]) * np.sin(p[:, 2] * 15 * k[2] + ph[2])
                + 0.5 * np.sin(p[:, 0] * 31 * k[3] + ph[3]) * np.sin(p[:, 2] * 29 * k[4] + ph[4]))
        return (base(p) + size * 0.06 * bump) * 0.75

    def grain(p, n):
        return 0.05 * (np.sin(p[:, 0] * 90) * np.sin(p[:, 1] * 87) * np.sin(p[:, 2] * 93) > 0.3)
    return Prop(f'clod-{seed}', [Part(f, tone=-0.1 + 0.05 * (seed % 3), texture=grain)], extent=size * 1.4, elevation=26, center=(0, size * 0.5, 0))


def pebble(seed=0, size=0.08) -> Prop:
    r = _rng(seed + 50)
    e = ellipsoid((0, size * 0.45, 0), (size, size * r.uniform(0.45, 0.7), size * r.uniform(0.6, 0.9)), rot(yaw=r.uniform(0, 180)))
    return Prop('pebble', [Part(e, tone=0.08 + 0.06 * r.uniform(-1, 1))], extent=size * 1.4, elevation=26)


def crop_plant(seed=0, h=0.5) -> Prop:
    """Soybean plant: stem, trifoliate leaves, a couple of pods."""
    r = _rng(seed + 7)
    lean = r.uniform(-0.06, 0.06)
    stem = tube([(0, 0, 0), (lean, h * 0.5, 0.02), (lean * 1.6, h, 0)], [0.022, 0.018, 0.013])
    leaves, pods = [], []
    for j, y in enumerate((0.45, 0.72, 0.98)):
        a = r.uniform(0, 360) + j * 120
        cx, cz = lean * (y * 1.4) + 0.12 * math.cos(math.radians(a)), 0.12 * math.sin(math.radians(a))
        for k in range(3):
            b = math.radians(a + (k - 1) * 70)
            c = np.array([cx + 0.09 * math.cos(b), h * y + 0.02, cz + 0.09 * math.sin(b)])
            leaves.append(ellipsoid(c, (0.085, 0.014, 0.05), rot(yaw=-math.degrees(b), roll=12)))
        leaves.append(capsule((lean * y, h * y - 0.04, 0), (cx, h * y + 0.02, cz), 0.009))
    for y in (0.3, 0.55):
        pods.append(capsule((lean * 0.6 + 0.03, h * y, 0.03), (lean * 0.6 + 0.09, h * y - 0.09, 0.05), 0.022, 0.016))
    return Prop('crop', [Part(stem, tone=0.0), Part(union(*leaves), tone=0.1, texture=_lines(0, 70, 0.03, 0.8)), Part(union(*pods), tone=-0.04)],
                extent=h * 0.8, elevation=22, center=(0, h * 0.55, 0))


def soil_auger() -> Prop:
    R = rot(roll=-14)
    T = lambda x, y, z: R @ np.array([x, y, z])
    shaft = capsule(T(0, 0.15, 0), T(0, 1.0, 0), 0.025)
    handle = capsule(T(-0.22, 1.0, 0), T(0.22, 1.0, 0), 0.035)
    pts = [T(0.06 * math.cos(i * 0.6), 0.02 + i * 0.012, 0.06 * math.sin(i * 0.6)) for i in range(16)]
    spiral = tube(pts, [0.022] * len(pts))
    return Prop('auger', [Part(shaft, tone=0.02), Part(handle, tone=-0.06, texture=_lines(0, 80, 0.04)), Part(spiral, tone=0.12)],
                extent=0.62, elevation=18, center=(0.06, 0.5, 0))


def field_tile(rows=3, seed=0) -> Prop:
    soilb = round_box((0, -0.06, 0), (0.62, 0.06, 0.42), 0.04)
    ridges = union(*[capsule((-0.55, 0.0, z), (0.55, 0.0, z), 0.04) for z in np.linspace(-0.3, 0.3, rows)])
    parts = [Part(soilb, tone=-0.08, texture=lambda p, n: 0.04 * (np.sin(p[:, 0] * 80) * np.sin(p[:, 2] * 77) > 0.4)), Part(ridges, tone=-0.02)]
    r = _rng(seed)
    for z in np.linspace(-0.3, 0.3, rows):
        for x in np.linspace(-0.42, 0.42, 3):
            parts += place_(crop_plant(seed=int(r.integers(0, 99)), h=0.42), (x + r.uniform(-0.04, 0.04), 0.02, z), yaw=r.uniform(0, 360), s=1.0)
    return Prop('field', parts, extent=0.72, elevation=32, center=(0, 0.1, 0))


# ---------------------------------------------------------------- devices and paper
def phone(swatch=True) -> Prop:
    R = rot(pitch=-58, yaw=16)
    body = round_box((0, 0, 0), (0.17, 0.33, 0.018), 0.035, R)
    screen = round_box(R @ np.array([0, 0.0, 0.017]), (0.15, 0.3, 0.004), 0.02, R)
    parts = [Part(body, tone=-0.08), Part(screen, tone=0.2)]
    if swatch:
        parts.append(Part(cylinder(R @ np.array([-0.05, 0.08, 0.022]), 0.055, 0.004, R=R @ rot(pitch=90)), material='amber', tone=0.04))
        parts.append(Part(cylinder(R @ np.array([0.06, 0.08, 0.022]), 0.055, 0.004, R=R @ rot(pitch=90)), tone=-0.14))
        parts.append(Part(round_box(R @ np.array([0, -0.12, 0.021]), (0.1, 0.02, 0.003), 0.01, R), tone=-0.04))
    return Prop('phone', parts, extent=0.36, elevation=30)


def color_card() -> Prop:
    R = rot(pitch=-70, yaw=-10)
    card = round_box((0, 0, 0), (0.32, 0.12, 0.008), 0.01, R)
    parts = [Part(card, tone=0.26)]
    for i, tn in enumerate((-0.3, -0.18, -0.06, 0.06)):
        parts.append(Part(round_box(R @ np.array([-0.24 + i * 0.13, 0.0, 0.009]), (0.05, 0.08, 0.003), 0.01, R), tone=tn))
    parts.append(Part(round_box(R @ np.array([0.27, 0.0, 0.009]), (0.04, 0.08, 0.003), 0.01, R), material='amber', tone=0.0))
    return Prop('color-card', parts, extent=0.38, elevation=34)


def document(seed=0, fold=True) -> Prop:
    r = _rng(seed)
    R = rot(yaw=r.uniform(-25, 25), pitch=-86)
    sheet = round_box((0, 0, 0), (0.22, 0.29, 0.004), 0.004, R)
    corner = _prism2d([(0.22, 0.29), (0.12, 0.29), (0.22, 0.19)], 0.006, R)

    def rules(p, n):
        q = p @ R
        return -0.12 * ((np.abs(((q[:, 1] + 1) % 0.06) - 0.03) < 0.005) & (np.abs(q[:, 0]) < 0.16) & (q[:, 1] < 0.18))
    parts = [Part(subtract(sheet, corner) if fold else sheet, tone=0.24, texture=rules)]
    if fold:
        parts.append(Part(_prism2d([(0.12, 0.19), (0.12, 0.29), (0.22, 0.19)], 0.004, R @ rot(yaw=0)), tone=0.12))
    return Prop('document', parts, extent=0.36, elevation=40)


def padlock(open_=True) -> Prop:
    body = round_box((0, 0.17, 0), (0.17, 0.15, 0.08), 0.04)
    sh_c = np.array([0.0 if not open_ else -0.06, 0.34 if not open_ else 0.44, 0.0])
    shackle = intersect(torus(sh_c, 0.11, 0.032, rot(pitch=90, yaw=0 if not open_ else 25)), lambda p: sh_c[1] - 0.0 - p[:, 1] - 0.0 if False else -(p[:, 1] - sh_c[1]))
    legs = union(capsule(sh_c + (-0.11, 0, 0), sh_c + (-0.11, -0.14 if not open_ else -0.24, 0), 0.032),
                 capsule(sh_c + (0.11, 0, 0) if not open_ else sh_c + (0.1, 0.0, -0.05), (0.11, 0.26, 0) if not open_ else sh_c + (0.1, -0.06, -0.05), 0.032))
    hole = union(capsule((0, 0.19, 0.09), (0, 0.12, 0.09), 0.02), sphere((0, 0.19, 0.09), 0.032))
    return Prop('padlock', [Part(subtract(body, hole), tone=0.06), Part(union(shackle, legs), tone=-0.06)],
                extent=0.36, elevation=18, azimuth=-20, center=(0, 0.25, 0))


def key() -> Prop:
    R = rot(yaw=-30)
    bow = subtract(torus((0, 0.03, 0), 0.09, 0.03), cylinder((0, 0.03, 0), 0.05, 0.1))
    shaft = capsule(R @ np.array([0.11, 0, 0]) + (0, 0.03, 0), R @ np.array([0.46, 0, 0]) + (0, 0.03, 0), 0.025)
    bits = union(*[round_box(R @ np.array([x, 0, 0.04]) + (0, 0.03, 0), (0.02, 0.022, 0.035), 0.008, R) for x in (0.36, 0.43)])
    return Prop('key', [Part(bow, tone=0.04), Part(shaft, tone=0.08), Part(bits, tone=0.08)], extent=0.34, elevation=40, center=(0.2, 0.03, -0.08))


def code_block() -> Prop:
    """Rounded tile embossed with the angle-bracket glyph used for source code."""
    R = rot(yaw=14, pitch=-14)
    tile = round_box((0, 0, 0), (0.3, 0.2, 0.05), 0.05, R)
    z = 0.06
    g = [((-0.12, 0.1), (-0.22, 0.0)), ((-0.22, 0.0), (-0.12, -0.1)), ((0.12, 0.1), (0.22, 0.0)), ((0.22, 0.0), (0.12, -0.1)), ((0.05, 0.13), (-0.05, -0.13))]
    glyph = union(*[capsule(R @ np.array([a[0], a[1], z]), R @ np.array([b[0], b[1], z]), 0.024) for a, b in g])
    return Prop('code-block', [Part(tile, tone=-0.02), Part(glyph, tone=0.24)], extent=0.36, elevation=10)


# ---------------------------------------------------------------- awards and thanks
def trophy() -> Prop:
    cup = subtract(capsule((0, 0.58, 0), (0, 0.36, 0), 0.2, 0.08), capsule((0, 0.66, 0), (0, 0.42, 0), 0.17, 0.05))
    cup = (lambda c: (lambda p: np.maximum(c(p), p[:, 1] - 0.7)))(cup)
    rim = torus((0, 0.7, 0), 0.2, 0.022)
    handles = union(intersect(torus((0.22, 0.54, 0), 0.09, 0.022, rot(pitch=90)), lambda p: 0.2 - p[:, 0]),
                    intersect(torus((-0.22, 0.54, 0), 0.09, 0.022, rot(pitch=90)), lambda p: p[:, 0] + 0.2))
    stem = capsule((0, 0.34, 0), (0, 0.16, 0), 0.04, 0.06)
    base = union(cylinder((0, 0.12, 0), 0.12, 0.03, rounding=0.012), round_box((0, 0.05, 0), (0.17, 0.05, 0.17), 0.02))
    band = round_box((0, 0.05, 0.172), (0.1, 0.025, 0.004), 0.004)
    return Prop('trophy', [Part(cup, material='amber', tone=0.02), Part(rim, material='amber', tone=0.1), Part(handles, material='amber', tone=0.0),
                           Part(stem, material='amber', tone=0.04), Part(base, tone=-0.04), Part(band, tone=0.2)],
                extent=0.5, elevation=16, center=(0, 0.38, 0))


def _star2d(r1=0.12, r2=0.055, n=5, rotdeg=90):
    pts = []
    for i in range(2 * n):
        a = math.radians(rotdeg + i * 180 / n); rr = r1 if i % 2 == 0 else r2
        pts.append((rr * math.cos(a), rr * math.sin(a)))
    return pts


def medal(seed=0) -> Prop:
    R = rot(yaw=-10 + 20 * (seed % 2), pitch=-10)
    disc = cylinder(R @ np.array([0, 0, 0]), 0.16, 0.022, R=R @ rot(pitch=90), rounding=0.012)
    rim = torus((0, 0, 0), 0.155, 0.02, R @ rot(pitch=90))
    star = poly_prism(_star2d(0.09, 0.04), 0.012, R)
    star_ = (lambda f: (lambda p: f(p - R @ np.array([0, 0, 0.022])) - 0.006))(star)
    rib = union(round_box(R @ np.array([-0.06, 0.27, -0.01]), (0.045, 0.13, 0.008), 0.006, R @ rot(roll=-14)),
                round_box(R @ np.array([0.06, 0.27, -0.01]), (0.045, 0.13, 0.008), 0.006, R @ rot(roll=14)))
    return Prop('medal', [Part(disc, material='amber', tone=0.0), Part(rim, material='amber', tone=0.1), Part(star_, material='amber', tone=0.18),
                          Part(rib, tone=0.04, texture=_lines(1, 120, 0.05, 0.6))], extent=0.36, elevation=12, center=(0, 0.1, 0))


def rosette() -> Prop:
    R = rot(pitch=-12)

    def pleat(p):
        q = p @ R
        a = np.arctan2(q[:, 1], q[:, 0])
        r = np.hypot(q[:, 0], q[:, 1])
        rr = 0.18 + 0.022 * np.sin(a * 18)
        return np.maximum(np.abs(r - 0.15) - (rr - 0.12), np.abs(q[:, 2]) - 0.02) * 0.7
    centre = cylinder((0, 0, 0.02), 0.1, 0.02, R=R @ rot(pitch=90), rounding=0.012)
    tails = union(poly_prism([(-0.1, -0.12), (-0.02, -0.12), (-0.1, -0.42), (-0.14, -0.36), (-0.18, -0.42)], 0.01, R),
                  poly_prism([(0.02, -0.12), (0.1, -0.12), (0.18, -0.42), (0.14, -0.36), (0.1, -0.42)], 0.01, R))
    star = poly_prism(_star2d(0.06, 0.028), 0.01, R)
    star_ = (lambda f: (lambda p: f(p - R @ np.array([0, 0, 0.045])) - 0.004))(star)
    return Prop('rosette', [Part(pleat, tone=0.08), Part(tails, tone=0.02), Part(centre, material='amber', tone=0.04), Part(star_, material='amber', tone=0.2)],
                extent=0.45, elevation=10, center=(0, -0.08, 0))


def podium() -> Prop:
    blocks = [((-0.36, 0.17), 0.0), ((0.0, 0.27), 0.08), ((0.36, 0.12), -0.06)]
    parts = []
    for (x, hgt), tn in blocks:
        parts.append(Part(round_box((x, hgt, 0), (0.17, hgt, 0.2), 0.025), tone=tn))
    st = poly_prism(_star2d(0.07, 0.032), 0.01)
    parts.append(Part((lambda f: (lambda p: f(p - np.array([0, 0.3, 0.205])) - 0.005))(st), tone=0.24))
    return Prop('podium', parts, extent=0.6, elevation=22, center=(0, 0.25, 0))


def star(seed=0, amber=False) -> Prop:
    R = rot(yaw=20 * seed, pitch=-20 + 10 * seed, roll=12 * seed)
    s = poly_prism(_star2d(0.15, 0.065), 0.03, R)
    return Prop('star', [Part(lambda p: s(p) - 0.02, material='amber' if amber else 'iris', tone=0.06)], extent=0.22, elevation=18)


def confetti(seed=0, n=14, spread=0.6) -> Prop:
    r = _rng(seed)
    bits = []
    for i in range(n):
        R = rot(r.uniform(0, 360), r.uniform(0, 360), r.uniform(0, 360))
        c = np.array([r.uniform(-spread, spread), r.uniform(-spread * 0.4, spread * 0.6), r.uniform(-0.2, 0.2)])
        bits.append(round_box(c, (0.035, 0.012, 0.004), 0.003, R) if i % 3 else torus(c, 0.03, 0.008, R))
    return Prop('confetti', [Part(union(*bits[0::2]), tone=0.14), Part(union(*bits[1::2]), material='amber', tone=0.06)], extent=spread, elevation=10)


def envelope(open_=True) -> Prop:
    body = round_box((0, 0.03, 0), (0.3, 0.03, 0.2), 0.012)
    R = rot(pitch=-90 if open_ else 0)
    flap_pts = [(-0.3, 0.0), (0.3, 0.0), (0.0, 0.17)]
    if open_:
        flap = _prism2d([(-0.3, 0.0), (0.3, 0.0), (0.0, 0.17)], 0.006, rot(pitch=-20))
        flap_ = (lambda f: (lambda p: f(p - np.array([0, 0.07, -0.2])) - 0.004))(flap)
    else:
        flap = _prism2d([(-0.3, 0.0), (0.3, 0.0), (0.0, -0.17)], 0.006, rot(pitch=90))
        flap_ = (lambda f: (lambda p: f(p - np.array([0, 0.064, -0.2])) - 0.004))(flap)
    # Bound the seam to the envelope; an unbounded SDF stripe rendered out to
    # both camera edges at every resolution.
    seam = lambda p: np.maximum.reduce([
        np.abs(np.abs(p[:, 0]) * 0.55 + p[:, 2] * 0.85 - 0.1) - 0.006,
        np.abs(p[:, 1] - 0.062) - 0.004,
        np.abs(p[:, 0]) - 0.285,
        np.abs(p[:, 2]) - 0.19,
    ])
    return Prop('envelope-open' if open_ else 'envelope', [Part(body, tone=0.16), Part(flap_, tone=0.08), Part(seam, tone=0.02)],
                extent=0.38, elevation=34, center=(0, 0.06, 0))


def card(seed=0) -> Prop:
    r = _rng(seed)
    R = rot(yaw=r.uniform(-30, 30), pitch=-12 + r.uniform(-10, 10), roll=r.uniform(-14, 14))
    c = round_box((0, 0, 0), (0.17, 0.12, 0.006), 0.008, R)

    def deco(p, n):
        q = p @ R
        lines_ = (np.abs(((q[:, 1] + 1) % 0.05) - 0.025) < 0.004) & (np.abs(q[:, 0]) < 0.11) & (q[:, 1] < 0.04)
        dot = np.hypot(q[:, 0], q[:, 1] - 0.075) < 0.026
        return np.where(lines_, -0.1, 0.0) + np.where(dot, -0.16, 0.0)
    return Prop('card', [Part(c, tone=0.24, texture=deco)], extent=0.22, elevation=14)


def flower(seed=0, h=0.42) -> Prop:
    r = _rng(seed + 3)
    lean = r.uniform(-0.08, 0.08)
    top = np.array([lean, h, 0.0])
    stem = tube([(0, 0, 0), (lean * 0.4, h * 0.5, 0.01), tuple(top)], [0.016, 0.014, 0.012])
    leaf = ellipsoid((lean * 0.3 + 0.05, h * 0.35, 0.0), (0.06, 0.012, 0.025), rot(yaw=10, roll=30))
    petals = union(*[ellipsoid(top + 0.05 * np.array([math.cos(a), 0.15, math.sin(a)]), (0.055, 0.016, 0.032), rot(yaw=-math.degrees(a), roll=-18))
                     for a in np.linspace(0, 2 * math.pi, 6)[:-1] + r.uniform(0, 1)])
    centre = sphere(top + (0, 0.02, 0), 0.03)
    return Prop('flower', [Part(stem, tone=-0.02), Part(leaf, tone=0.04), Part(petals, tone=0.18 + 0.05 * (seed % 2)), Part(centre, material='amber', tone=0.04)],
                extent=h * 0.7, elevation=24, center=(0, h * 0.6, 0))


def gift_box(seed=0) -> Prop:
    s = 0.17 + 0.03 * (seed % 2)
    box = round_box((0, s, 0), (s, s, s), 0.02)
    lid = round_box((0, 2 * s + 0.02, 0), (s + 0.02, 0.025, s + 0.02), 0.012)
    band = union(round_box((0, s + 0.01, 0), (s + 0.025, s + 0.012, 0.035), 0.006), round_box((0, s + 0.01, 0), (0.035, s + 0.012, s + 0.025), 0.006))
    bow = union(torus((-0.06, 2 * s + 0.08, 0), 0.055, 0.018, rot(yaw=0, roll=-60)), torus((0.06, 2 * s + 0.08, 0), 0.055, 0.018, rot(roll=60)),
                sphere((0, 2 * s + 0.06, 0), 0.03))
    return Prop('gift', [Part(box, tone=0.04), Part(lid, tone=0.08), Part(band, tone=0.22), Part(bow, tone=0.2)],
                extent=s * 1.6, elevation=26, center=(0, s * 1.1, 0))


def puzzle_grid(n=4, seed=11):
    """n x n jigsaw: returns {(i, j): sdf builder data} for puzzle_tile()."""
    r = _rng(seed)
    cell = 1.0 / n
    knobs = []   # (owner (i,j), x, z)
    for i in range(n):
        for j in range(n):
            cx, cz = -0.5 + (i + 0.5) * cell, -0.5 + (j + 0.5) * cell
            if i < n - 1:
                s = 1 if r.random() < 0.5 else -1
                owner = (i, j) if s > 0 else (i + 1, j)
                knobs.append((owner, cx + cell / 2 + s * cell * 0.2, cz))
            if j < n - 1:
                s = 1 if r.random() < 0.5 else -1
                owner = (i, j) if s > 0 else (i, j + 1)
                knobs.append((owner, cx, cz + cell / 2 + s * cell * 0.2))
    return cell, knobs


def puzzle_tiles(cells, n=4, seed=11, yaw=-16, tone=0.0, name='quad'):
    """One Prop holding the given (i, j) tiles of an n x n puzzle, on the shared frame."""
    cell, knobs = puzzle_grid(n, seed)
    R = rot(yaw=yaw)
    h, rr, gap, kr = 0.042, 0.016, 0.005, cell * 0.17
    parts = []
    for (i, j) in cells:
        cx, cz = -0.5 + (i + 0.5) * cell, -0.5 + (j + 0.5) * cell

        def f(p, cx=cx, cz=cz, ij=(i, j)):
            q = p @ R
            x, y, z = q[:, 0], q[:, 1], q[:, 2]
            d = np.maximum(np.abs(x - cx), np.abs(z - cz)) - (cell / 2 - gap)
            for owner, kx, kz in knobs:
                if abs(kx - cx) > cell or abs(kz - cz) > cell:
                    continue
                k = np.hypot(x - kx, z - kz) - kr
                d = np.minimum(d, k) if owner == ij else np.maximum(d, -(k - gap * 1.6))
            d2 = d + rr
            dy = np.abs(y) - (h - rr)
            return np.minimum(np.maximum(d2, dy), 0) + np.hypot(np.maximum(d2, 0), np.maximum(dy, 0)) - rr
        parts.append(Part(f, tone=tone + 0.04 * (((i + j) % 2) - 0.5)))
    return Prop(name, parts, extent=0.78, elevation=44, crop=False)
