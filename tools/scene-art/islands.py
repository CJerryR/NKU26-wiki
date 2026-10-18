"""Islands: several library models composed in ONE 3D scene and rendered as one
sprite, so they occlude each other and share contact shadows. A page is then
built from 6-10 islands (pages.py). Shared islands (soil bed, crowd, bench...)
are reused across pages; `pair` islands are rendered uncropped on a shared
frame so their layers fit together at scroll progress 0 (lid on box...).

    python3 tools/scene-art/islands.py all          # render what is missing
    python3 tools/scene-art/islands.py crowd bench --force
Output: assets/scenes/_islands/<name>.png
"""
from __future__ import annotations

import json
import math
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import lib  # noqa: E402
from lib import (bubble, card, clipboard, clod, code_block, color_card, confetti, cooler_box, crop_plant, desk, dna,  # noqa: E402
                 document, envelope, ep_tube, field_tile, flask, flower, gear, gift_box, goggles, key, magnifier, medal,
                 membrane, microscope, padlock, pawn, pebble, pencil, phone, place_, podium, puzzle_tiles, receptor_7tm,
                 rosette, shield, soil_auger, star, tip_box, trophy, water, beaker)
from props import (block, blueprint, book_closed, book_open, cryovial, field_coins, journals, laptop, ligand,  # noqa: E402
                   manual, microplate, nematode, ode_ribbon, pipette, plasmid, sbol_block, seedling, test_strip,
                   thermocycler, tube_rack, yeast_cluster)
from sdf import Part, Prop, _bound, place, render, round_box, cylinder  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'scenes' / '_islands'
PXW = 440            # rendered px per world unit; the real value is saved beside each sprite
REG: dict = {}


def island(name, extent=0.9, aspect=1.6, el=26.0, ground=0.0, center=(0, 0.25, 0), crop=True, az=0.0, px=None):
    def deco(fn):
        REG[name] = dict(fn=fn, extent=extent, aspect=aspect, el=el, ground=ground, center=center, crop=crop, az=az, px=px)
        return fn
    return deco


def build(name) -> Prop:
    r = REG[name]
    return Prop(name, r['fn'](), extent=r['extent'], elevation=r['el'], azimuth=r['az'], aspect=r['aspect'], unit=0.7,
                cull=True, ground=r['ground'], center=r['center'], crop=r['crop'])


def drop(parts, floor=0.0):
    """Translate parts so their lowest point rests on `floor`."""
    lo = math.inf
    for pt in parts:
        c, rr = _bound(pt.sdf, (0, 0.4, 0), 1.6, n=36)
        if rr <= 0:
            continue
        g = np.linspace(-1, 1, 24)
        X, Y, Z = np.meshgrid(g, g, g, indexing='ij')
        P = c + rr * np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
        m = pt.sdf(P) < rr * 2 / 23 * 0.9
        if m.any():
            lo = min(lo, P[m, 1].min())
    return place(parts, at=(0, floor - lo, 0)) if math.isfinite(lo) else parts


def put(prop, at, yaw=0.0, s=1.0, tone=0.0, pitch=0.0, roll=0.0, sit=True):
    parts = place_(prop, at, yaw=yaw, pitch=pitch, roll=roll, s=s, tone=tone)
    return drop(parts, at[1] if sit else None) if sit else parts


def scatter(fn, spots, seed=0, yaw=(0, 360), s=(0.9, 1.1), tone=(-0.04, 0.05), sit=True):
    r = np.random.default_rng(seed)
    out = []
    for i, (x, z) in enumerate(spots):
        out += put(fn(i), (x, 0.0, z), yaw=r.uniform(*yaw), s=r.uniform(*s), tone=r.uniform(*tone), sit=sit)
    return out


def lying_worms(spots, seed=0, s=(0.4, 0.55)):
    r = np.random.default_rng(seed)
    nem = nematode()
    out = []
    for x, z in spots:
        out += put(nem, (x, 0.0, z), yaw=r.uniform(0, 360), pitch=r.uniform(70, 88), s=r.uniform(*s), tone=r.uniform(-0.04, 0.06))
    return out


# ================================================================ shared islands
@island('soil-bed', extent=1.05, aspect=2.0, el=26)
def _():
    P = []
    for i, (x, z, s) in enumerate([(-0.62, 0.02, 0.34), (-0.16, -0.2, 0.28), (0.26, 0.04, 0.3), (0.7, -0.1, 0.22), (0.02, 0.3, 0.17), (-0.42, 0.34, 0.14), (0.52, 0.32, 0.13)]):
        P += put(clod(i + 1, s), (x, 0.0, z), yaw=40 * i)
    P += scatter(lambda i: pebble(i, 0.05 + 0.02 * (i % 3)), [(-0.85, 0.3), (-0.3, 0.12), (0.12, 0.38), (0.45, -0.25), (0.9, 0.2), (-0.05, -0.35)], seed=3)
    P += lying_worms([(-0.38, 0.22), (0.45, 0.18)], seed=5)
    return P


@island('nematodes', extent=0.95, aspect=1.8, el=30)
def _():
    P = lying_worms([(-0.55, 0.05), (-0.2, -0.15), (0.12, 0.12), (0.45, -0.1), (0.7, 0.18), (-0.35, 0.3)], seed=11, s=(0.45, 0.62))
    P += scatter(lambda i: pebble(i + 9, 0.05), [(-0.75, -0.2), (0.25, 0.32), (0.85, -0.15)], seed=4)
    return P


@island('yeast', extent=0.85, aspect=1.6, el=24)
def _():
    y = yeast_cluster()
    P = put(y, (-0.25, 0.0, 0.0), s=0.62) + put(y, (0.28, 0.0, -0.12), yaw=140, s=0.48, tone=0.04) + put(y, (0.05, 0.0, 0.28), yaw=250, s=0.34, tone=-0.03)
    P += put(ep_tube(True, 1), (0.62, 0.0, 0.1), yaw=-30) + put(ep_tube(False, 2), (-0.66, 0.0, 0.16), yaw=20)
    return P


@island('molecules', extent=0.9, aspect=1.7, el=16, ground=None, center=(0, 0.0, 0))
def _():
    lg = ligand()
    P = place_(lg, (-0.3, 0.05, 0), yaw=20, s=0.62) + place_(lg, (0.38, -0.12, 0.1), yaw=160, roll=20, s=0.46, tone=0.03)
    r = np.random.default_rng(8)
    for i, (x, y) in enumerate([(-0.75, -0.2), (-0.05, -0.3), (0.1, 0.3), (0.72, 0.22), (0.8, -0.3), (-0.6, 0.3)]):
        P += place_(water(i), (x, y, r.uniform(-0.2, 0.2)), s=r.uniform(0.9, 1.25))
    return P


@island('bench', extent=0.95, aspect=1.7, el=28)
def _():
    P = put(tip_box(), (-0.42, 0.0, -0.08), yaw=18)
    P += put(pipette(), (0.12, 0.0, 0.18), pitch=0, roll=72, yaw=-20, s=0.75)
    P += scatter(lambda i: ep_tube(i % 2 == 0, i), [(0.5, -0.12), (0.62, 0.05), (0.42, 0.1)], seed=2, yaw=(-40, 40), s=(0.95, 1.05))
    P += put(beaker(), (0.15, 0.0, -0.3), yaw=30, s=0.9)
    return P


@island('plates', extent=0.9, aspect=1.6, el=32)
def _():
    m = microplate()
    P = put(m, (-0.18, 0.0, 0.0), yaw=-8, s=0.62) + put(m, (-0.16, 0.075, -0.02), yaw=4, s=0.62, tone=0.05, sit=False)
    P += put(m, (0.45, 0.0, 0.2), yaw=24, s=0.55, tone=-0.03)
    P += put(magnifier(), (0.55, 0.0, -0.25), yaw=-40, s=0.9)
    return P


@island('library', extent=1.0, aspect=1.7, el=30)
def _():
    P = put(journals(), (-0.45, 0.0, -0.05), yaw=10, s=0.85)
    P += put(book_open(), (0.3, 0.0, 0.08), yaw=-6, s=0.7)
    P += put(magnifier(), (-0.05, 0.0, 0.35), yaw=200, s=0.85)
    P += put(document(1), (0.72, 0.0, -0.28), s=0.9)
    return P


def crowd_parts(n, seed=0, spread=0.9, depth=0.45):
    r = np.random.default_rng(seed)
    poses = ['stand', 'wave', 'hold', 'stand', 'stand', 'wave']
    P = []
    cols = max(1, math.ceil(n / 2))
    for i in range(n):
        row = i % 2; col = i // 2
        x = (col - (cols - 1) / 2) * spread / max(1, cols - 1 or 1) * 1.6 + r.uniform(-0.05, 0.05) + (0.12 if row else 0)
        z = (-depth / 2 if row == 0 else depth / 2) + r.uniform(-0.05, 0.05)
        P += put(pawn(poses[(i + seed) % len(poses)], seed + i), (x, 0.0, z), yaw=r.uniform(-25, 25), s=r.uniform(0.92, 1.06), tone=r.uniform(-0.06, 0.06))
    return P


@island('crowd', extent=0.8, aspect=1.5, el=20, center=(0, 0.32, 0))
def _():
    return crowd_parts(6, seed=1, spread=0.6)


@island('field', extent=1.0, aspect=1.6, el=30, center=(0, 0.2, 0))
def _():
    P = put(field_tile(seed=2), (0.0, 0.0, 0.0), s=0.95)
    P += put(soil_auger(), (0.78, 0.0, 0.1), yaw=20, s=0.8)
    P += put(crop_plant(4, 0.5), (-0.78, 0.0, 0.28)) + put(crop_plant(6, 0.42), (-0.62, 0.0, 0.42), yaw=60)
    return P


@island('paperwork', extent=0.75, aspect=1.5, el=38, center=(0, 0.05, 0))
def _():
    P = put(clipboard(), (-0.18, 0.0, 0.0), yaw=-12)
    P += put(document(2), (0.3, 0.0, -0.1), s=0.95) + put(document(3, fold=False), (0.36, 0.012, 0.02), s=0.95, sit=False)
    P += put(pencil(), (0.12, 0.0, 0.32), yaw=-20)
    return P


@island('gears', extent=0.8, aspect=1.5, el=24, ground=None, center=(0, 0.0, 0))
def _():
    P = place_(gear(10, 0), (-0.28, 0.05, 0), s=1.0) + place_(gear(8, 1), (0.2, -0.12, 0.05), s=0.75) + place_(gear(12, 2), (0.42, 0.25, -0.1), s=0.6)
    P += place_(dna(), (-0.68, 0.0, 0.05), s=0.55)
    return P


@island('stars', extent=0.85, aspect=1.7, el=14, ground=None, center=(0, 0.0, 0))
def _():
    P = place_(star(1), (-0.5, 0.12, 0), s=1.2) + place_(star(2, amber=True), (0.15, -0.1, 0.1), s=0.9) + place_(star(3), (0.62, 0.2, 0), s=0.7)
    P += place_(confetti(4, 16, 0.7), (0, 0, 0))
    return P


# ================================================================ page heroes
# --- description
@island('desc-roots', extent=0.8, aspect=1.3, el=22, center=(0, 0.3, 0))
def _():
    sd = seedling()
    P = put(sd, (-0.1, 0.0, 0.0), s=0.72) + put(sd, (0.32, 0.0, -0.12), yaw=120, s=0.55, tone=0.04)
    P += lying_worms([(-0.38, 0.2), (0.15, 0.25), (0.5, 0.1)], seed=21, s=(0.38, 0.48))
    return P


@island('desc-sensor', extent=0.8, aspect=1.6, el=28)
def _():
    P = []
    for i, x in enumerate((-0.35, -0.12, 0.11)):
        P += put(test_strip(window='amber' if i == 1 else None, name='s'), (x, 0.0, 0.05 * i), yaw=-14 + 8 * i, s=0.62)
    P += put(yeast_cluster(), (0.5, 0.0, -0.05), s=0.42) + put(ep_tube(True, 4), (0.62, 0.0, 0.28), yaw=-20)
    return P


# --- engineering (design / build / test / learn)
@island('eng-design', extent=0.85, aspect=1.5, el=32)
def _():
    return put(blueprint(), (0.0, 0.0, 0.0), s=0.8) + put(pencil(), (0.32, 0.03, 0.25), yaw=10, sit=False) + put(document(5), (-0.55, 0.0, -0.2), s=0.85)


@island('eng-build', extent=0.8, aspect=1.4, el=22)
def _():
    P = put(plasmid(), (-0.15, 0.0, 0.0), s=0.62) + put(dna(), (0.42, 0.0, -0.1), s=0.62)
    P += scatter(lambda i: ep_tube(i == 1, i), [(0.2, 0.3), (0.38, 0.38), (-0.5, 0.3)], seed=7, yaw=(-30, 30))
    return P


@island('eng-test', extent=0.85, aspect=1.5, el=30)
def _():
    P = put(microplate(), (-0.15, 0.0, 0.0), yaw=-10, s=0.62) + put(tip_box(), (0.5, 0.0, -0.15), yaw=20, s=0.8)
    P += put(test_strip(window='amber', name='s'), (0.3, 0.0, 0.3), yaw=30, s=0.55, pitch=0)
    return P


@island('eng-learn', extent=0.85, aspect=1.5, el=26)
def _():
    return put(laptop(), (-0.1, 0.0, 0.0), s=0.72) + put(clipboard(), (0.5, 0.0, 0.15), yaw=-25, s=0.85) + put(document(6), (-0.6, 0.0, 0.25), s=0.8)


# --- contribution
@island('contrib-cryo', extent=0.75, aspect=1.4, el=28)
def _():
    P = put(cooler_box(), (-0.2, 0.0, -0.05), yaw=15, s=0.9)
    cv = cryovial()
    P += put(cv, (0.32, 0.0, 0.05), s=0.55) + put(cv, (0.44, 0.0, -0.08), yaw=40, s=0.55, tone=0.05) + put(cv, (0.5, 0.0, 0.18), s=0.5, tone=-0.04)
    return P


@island('contrib-docs', extent=0.75, aspect=1.5, el=32)
def _():
    return put(manual(), (-0.15, 0.0, 0.0), s=0.75) + put(document(7), (0.42, 0.0, -0.1), s=0.85) + put(pencil(), (0.3, 0.0, 0.3), yaw=40)


# --- results
def strip_fan(amber):
    P = []
    for i in range(5):
        a = -30 + i * 15
        P += place_(test_strip(window='amber' if amber else None, upright=True, name='s'), (math.sin(math.radians(a)) * 0.55, 0.0, 0.0), roll=-a * 0.6, s=0.7)
    return P


@island('res-strips-neutral', extent=0.8, aspect=1.3, el=12, ground=None, center=(0, 0.1, 0), crop=False)
def _():
    return strip_fan(False)


@island('res-strips-amber', extent=0.8, aspect=1.3, el=12, ground=None, center=(0, 0.1, 0), crop=False)
def _():
    return strip_fan(True)


@island('res-membrane', extent=0.95, aspect=1.6, el=24, ground=None, center=(0, 0.05, 0))
def _():
    P = place_(membrane(), (0, 0, 0), s=1.05)
    P += place_(receptor_7tm(), (-0.25, 0.05, 0.0), s=0.42) + place_(receptor_7tm(), (0.35, 0.05, -0.1), yaw=60, s=0.38, tone=0.04)
    P += place_(ligand(), (0.05, 0.42, 0.15), yaw=30, s=0.3)
    return P


# --- model overview: one small island per chapter
@island('model-dock', extent=0.75, aspect=1.3, el=18, ground=None, center=(0, 0.0, 0))
def _():
    return place_(receptor_7tm(), (0, 0, 0), s=0.85) + place_(ligand(), (0.38, 0.3, 0.2), yaw=40, s=0.32) + place_(ligand(), (-0.4, -0.2, 0.25), yaw=200, s=0.28, tone=0.04)


@island('model-md', extent=0.8, aspect=1.5, el=24, ground=None, center=(0, 0.05, 0))
def _():
    P = place_(membrane(0.8, 0.5), (0, 0, 0), s=0.9) + place_(receptor_7tm(), (0, 0.05, 0), s=0.45)
    for i, (x, y) in enumerate([(-0.55, 0.35), (0.5, 0.4), (0.62, -0.3), (-0.5, -0.32)]):
        P += place_(water(i + 3), (x, y, 0.15), s=1.0)
    return P


@island('model-ode', extent=0.8, aspect=1.5, el=26)
def _():
    return put(flask(), (-0.42, 0.0, 0.0), s=0.9) + put(phone(), (0.3, 0.0, 0.05), yaw=-10, s=0.95) + put(yeast_cluster(), (-0.05, 0.0, 0.3), s=0.32)


@island('model-eco', extent=0.85, aspect=1.5, el=30)
def _():
    return put(field_tile(seed=5), (-0.1, 0.0, 0.0), s=0.7) + put(field_coins(), (0.5, 0.0, 0.2), s=0.5)


# --- docking
@island('dock-receptor', extent=0.7, aspect=1.0, el=24, ground=None, center=(0, 0.02, 0), crop=False, px=900)
def _():
    return place_(receptor_7tm(), (0, 0, 0), s=1.0)


def ligand_b():
    """A second, longer-chained ligand, so the two docked molecules differ."""
    lg = ligand()
    return Prop('ligand-b', place(lg, at=(0, 0, 0), yaw=180, s=1.0) + place(lg, at=(0.42, 0.05, 0.0), yaw=10, s=0.55, tone=0.05), extent=0.8, elevation=18)


@island('dock-ligand-a', extent=0.7, aspect=1.0, el=24, ground=None, center=(0, 0.02, 0), crop=False, px=900)
def _():
    return place_(ligand(), (0.0, 0.3, 0.02), yaw=30, s=0.3)


@island('dock-ligand-b', extent=0.7, aspect=1.0, el=24, ground=None, center=(0, 0.02, 0), crop=False, px=900)
def _():
    return place(ligand_b().parts, at=(0.02, 0.12, 0.08), yaw=-20, s=0.24)


@island('dock-receptors', extent=0.85, aspect=1.6, el=18, ground=None, center=(0, 0.0, 0))
def _():
    rc = receptor_7tm()
    return place_(rc, (-0.42, 0, 0), yaw=40, s=0.55, tone=0.05) + place_(rc, (0.42, 0.05, -0.1), yaw=-60, s=0.5, tone=0.08)


# --- molecular dynamics
@island('md-slab', extent=1.05, aspect=1.6, el=24, ground=None, center=(0, 0.1, 0))
def _():
    P = place_(membrane(1.2, 0.6), (0, 0, 0), s=1.0) + place_(receptor_7tm(), (0.05, 0.08, 0.0), s=0.62)
    for i, (x, y, z) in enumerate([(-0.75, 0.42, 0.2), (0.7, 0.5, 0.1), (0.85, -0.35, 0.2), (-0.8, -0.38, 0.1), (-0.3, 0.6, -0.1)]):
        P += place_(water(i + 10), (x, y, z), s=1.1)
    return P


@island('md-ligand', extent=0.3, aspect=1.0, el=16, ground=None, center=(0, 0.0, 0))
def _():
    return place_(ligand(), (0, 0, 0), yaw=30, s=0.38)


@island('waters', extent=0.75, aspect=1.6, el=16, ground=None, center=(0, 0.0, 0))
def _():
    r = np.random.default_rng(31)
    P = []
    for i in range(9):
        P += place_(water(i + 20), (r.uniform(-0.6, 0.6), r.uniform(-0.3, 0.3), r.uniform(-0.2, 0.2)), s=r.uniform(0.9, 1.3))
    return P


# --- ODE and two-channel sensing
def flask_island(seed, tone):
    P = put(flask(), (0.0, 0.0, 0.0), s=1.0, tone=tone) + put(yeast_cluster(), (0.36, 0.0, 0.18), yaw=40 * seed, s=0.34)
    P += put(ep_tube(seed % 2 == 0, seed), (-0.34, 0.0, 0.2), yaw=20)
    return P


@island('ode-flask-a', extent=0.62, aspect=1.2, el=24, center=(0, 0.3, 0))
def _():
    return flask_island(1, 0.0)


@island('ode-flask-b', extent=0.62, aspect=1.2, el=24, center=(0, 0.3, 0))
def _():
    return flask_island(2, 0.08)


@island('ode-phone', extent=0.7, aspect=1.4, el=30)
def _():
    return put(phone(), (-0.12, 0.0, 0.0), yaw=8) + put(color_card(), (0.42, 0.0, 0.2), yaw=-20, s=0.9)


# --- economic benefit
def coin_stack(n, seed=0):
    r = np.random.default_rng(seed)
    parts = []
    for i in range(n):
        c = (r.uniform(-0.01, 0.01), 0.02 + i * 0.042, r.uniform(-0.01, 0.01))
        parts.append(Part(cylinder(c, 0.12, 0.019, rounding=0.008), material='amber', tone=0.02 * ((i % 3) - 1)))
    return parts


@island('eco-coins', extent=0.6, aspect=1.4, el=22, center=(0, 0.2, 0))
def _():
    return place(coin_stack(5, 1), at=(-0.28, 0, 0)) + place(coin_stack(8, 2), at=(0.0, 0, -0.1)) + place(coin_stack(11, 3), at=(0.28, 0, 0.02))


@island('eco-fields', extent=1.0, aspect=1.7, el=34, center=(0, 0.1, 0))
def _():
    return put(field_tile(seed=7), (-0.4, 0.0, 0.0), yaw=8, s=0.75) + put(field_tile(seed=9), (0.45, 0.0, -0.15), yaw=-10, s=0.68, tone=0.04)


# --- integrated human practices
@island('hp-farmers', extent=0.85, aspect=1.5, el=22, center=(0, 0.3, 0))
def _():
    P = crowd_parts(3, seed=4, spread=0.45)
    P += put(crop_plant(1, 0.55), (0.55, 0.0, 0.1)) + put(crop_plant(2, 0.5), (0.7, 0.0, -0.1), yaw=90)
    P += put(soil_auger(), (-0.62, 0.0, 0.05), yaw=-20, s=0.75)
    return P


@island('hp-lab', extent=0.85, aspect=1.5, el=22, center=(0, 0.3, 0))
def _():
    P = crowd_parts(3, seed=8, spread=0.45)
    P += put(microscope(), (0.6, 0.0, 0.0), yaw=-20, s=0.75) + put(flask(), (-0.6, 0.0, 0.1), s=0.7)
    return P


@island('bubble-a', extent=0.4, aspect=1.2, el=8, ground=None, center=(0, 0.28, 0))
def _():
    return place_(bubble('dots'), (0, 0.28, 0))


@island('bubble-b', extent=0.4, aspect=1.2, el=8, ground=None, center=(0, 0.28, 0))
def _():
    return place(bubble('lines').parts, at=(0, 0, 0))


# --- education
for part in ('board', 'wing-l', 'wing-r'):
    island(f'edu-{part}', extent=0.9, aspect=1.25, el=12, ground=None, center=(0, 0.45, 0), crop=False)((lambda part: (lambda: lib.blackboard(part).parts))(part))


@island('edu-class', extent=0.95, aspect=1.6, el=24, center=(0, 0.3, 0))
def _():
    P = put(desk(), (-0.42, 0.0, 0.0), yaw=8, s=0.8) + put(desk(), (0.4, 0.0, -0.08), yaw=-6, s=0.78, tone=0.03)
    P += put(pawn('hold', 3), (-0.42, 0.0, 0.32), yaw=180 + 10) + put(pawn('wave', 5), (0.4, 0.0, 0.26), yaw=170)
    P += put(pawn('stand', 6), (0.0, 0.0, 0.45), yaw=200, s=0.95)
    return P


@island('edu-micro', extent=0.75, aspect=1.4, el=22, center=(0, 0.3, 0))
def _():
    return put(microscope(), (-0.2, 0.0, 0.0), yaw=25, s=0.9) + put(journals(), (0.38, 0.0, 0.1), yaw=-20, s=0.55) + put(flask(), (0.42, 0.13, -0.05), s=0.45, sit=False)


# --- safety
for part in ('body', 'sash'):
    island(f'safe-{part}', extent=0.85, aspect=0.95, el=14, ground=0.0 if part == 'body' else None, center=(0, 0.45, 0), crop=False)(
        (lambda part: (lambda: lib.safety_cabinet(part).parts))(part))


@island('safe-ppe', extent=0.75, aspect=1.5, el=26)
def _():
    return put(goggles(), (-0.3, 0.0, 0.05), yaw=15) + put(shield(), (0.32, 0.0, -0.05), s=0.75) + put(flask(), (0.0, 0.0, 0.3), s=0.6)


@island('safe-transport', extent=0.8, aspect=1.5, el=28)
def _():
    P = put(cooler_box(), (-0.25, 0.0, 0.0), yaw=20) + put(clipboard(), (0.42, 0.0, 0.1), yaw=-15, s=0.85)
    P += scatter(lambda i: ep_tube(False, i), [(0.12, 0.3), (0.0, 0.38)], seed=9, yaw=(-20, 20))
    return P


# --- members: one crowd per sub-team
for nm, n, seed, extra in (('team-wet', 8, 11, 'flask'), ('team-dry', 4, 12, 'laptop'), ('team-hp', 5, 13, 'bubble'), ('team-visual', 3, 14, 'pencil'), ('team-adv', 2, 15, 'book')):
    def _team(n=n, seed=seed, extra=extra):
        P = crowd_parts(n, seed=seed, spread=0.18 * n)
        x = 0.16 * n + 0.15
        if extra == 'flask':
            P += put(flask(), (x, 0.0, 0.1), s=0.7)
        elif extra == 'laptop':
            P += put(laptop(), (x, 0.0, 0.12), s=0.45, yaw=-30)
        elif extra == 'bubble':
            P += place(bubble('dots').parts, at=(0.0, 0.62, -0.05), s=0.6)
        elif extra == 'pencil':
            P += put(pencil(), (x, 0.0, 0.2), yaw=30)
        else:
            P += put(journals(), (x, 0.0, 0.1), s=0.4)
        return P
    island(nm, extent=0.18 * n + 0.42, aspect=1.5, el=20, center=(0, 0.32, 0))(_team)


# --- attributions: a 4x4 puzzle in four quadrants (one per team area)
QUADS = {'q-wet': [(0, 0), (1, 0), (0, 1), (1, 1)], 'q-dry': [(2, 0), (3, 0), (2, 1), (3, 1)],
         'q-hp': [(0, 2), (1, 2), (0, 3), (1, 3)], 'q-design': [(2, 2), (3, 2), (2, 3), (3, 3)]}
for i, (nm, cells) in enumerate(QUADS.items()):
    island(nm, extent=0.78, aspect=1.25, el=44, center=(0, 0.0, 0), crop=False)(
        (lambda cells, i: (lambda: puzzle_tiles(cells, tone=(0.0, 0.1, -0.05, 0.15)[i]).parts))(cells, i))


# --- licensing
for nm, op in (('lock-closed', False), ('lock-open', True)):
    island(nm, extent=0.45, aspect=1.0, el=18, center=(0, 0.25, 0), crop=False)((lambda op: (lambda: lib.padlock(op).parts))(op))


@island('lic-code', extent=0.75, aspect=1.5, el=30)
def _():
    return put(code_block(), (-0.2, 0.0, 0.0), s=0.95) + put(key(), (0.45, 0.0, 0.2), yaw=-20) + put(document(9), (0.42, 0.0, -0.25), s=0.8)


# --- awards
@island('awd-trophy', extent=0.8, aspect=1.25, el=16, center=(0, 0.4, 0))
def _():
    P = put(podium(), (0.0, 0.0, 0.0), s=1.0) + put(trophy(), (0.0, 0.54, 0.0), s=0.9, sit=False)
    return drop(P, 0.0)


@island('medal', extent=0.4, aspect=0.8, el=12, ground=None, center=(0, 0.1, 0))
def _():
    return place_(medal(), (0, 0.1, 0))


@island('rosettes', extent=0.6, aspect=1.4, el=12, ground=None, center=(0, 0.0, 0))
def _():
    return place_(rosette(), (-0.25, 0.0, 0), s=0.9) + place_(rosette(), (0.3, 0.08, -0.1), yaw=20, s=0.7, tone=0.05)


# --- acknowledgements
for nm, op in (('env-closed', False), ('env-open', True)):
    island(nm, extent=0.42, aspect=1.4, el=34, center=(0, 0.06, 0), crop=False)((lambda op: (lambda: envelope(op).parts))(op))


@island('card', extent=0.25, aspect=1.2, el=14, ground=None, center=(0, 0.0, 0))
def _():
    return place_(card(1), (0, 0, 0))


@island('ack-flowers', extent=0.7, aspect=0.95, el=20, center=(0, 0.55, 0))
def _():
    P = put(beaker(), (0.0, 0.0, 0.0), s=1.1)
    r = np.random.default_rng(3)
    for i in range(6):
        a = i / 6 * 2 * math.pi
        P += place_(flower(i, 0.55 + 0.1 * r.random()), (0.1 * math.cos(a), 0.78, 0.1 * math.sin(a)), roll=26 * math.cos(a), pitch=26 * math.sin(a), s=1.45)
    return P


@island('ack-gifts', extent=0.6, aspect=1.4, el=26, center=(0, 0.2, 0))
def _():
    return put(gift_box(0), (-0.2, 0.0, 0.0), yaw=20) + put(gift_box(1), (0.26, 0.0, 0.12), yaw=-25, s=0.75, tone=0.05)


# --- parts and collections: a loose pile of part blocks
@island('parts-pile', extent=0.75, aspect=1.6, el=28)
def _():
    P = []
    kinds = [('promoter', block), ('cds', lambda k: sbol_block('cds')), ('terminator', block), ('rbs', lambda k: sbol_block('rbs')), ('cds', block), ('promoter', block)]
    spots = [(-0.5, 0.0), (-0.15, -0.15), (0.2, 0.05), (0.5, -0.12), (-0.3, 0.25), (0.25, 0.3)]
    r = np.random.default_rng(5)
    for (k, fn), (x, z) in zip(kinds, spots):
        P += put(fn(k), (x, 0.0, z), yaw=r.uniform(-40, 40), s=0.8, tone=r.uniform(-0.05, 0.05))
    return P


# --- experiments
@island('exp-instruments', extent=0.95, aspect=1.6, el=28)
def _():
    return put(thermocycler(), (-0.35, 0.0, -0.05), yaw=10, s=0.8) + put(tube_rack(), (0.45, 0.0, 0.15), yaw=-10, s=0.75)


# --- background
@island('bg-receptor', extent=0.7, aspect=1.2, el=18, ground=None, center=(0, 0.0, 0))
def _():
    return place_(receptor_7tm(), (0, 0, 0), s=0.9) + place_(ligand(), (0.42, 0.42, 0.2), yaw=60, s=0.26)


# Camera corrections keep complete geometry inside each source sprite.
_CAMERA_FRAMES = Path(__file__).with_name('camera-frames.json')
if _CAMERA_FRAMES.exists():
    for _name, _frame in json.loads(_CAMERA_FRAMES.read_text()).items():
        REG[_name].update(_frame)


def main(argv):
    force = '--force' in argv
    names = [a for a in argv if not a.startswith('--')]
    if not names or names == ['all']:
        names = list(REG)
    OUT.mkdir(parents=True, exist_ok=True)
    for nm in names:
        out = OUT / f'{nm}.png'
        if out.exists() and not force:
            continue
        r = REG[nm]
        t = time.time()
        size = r['px'] or min(1100, round(2 * r['extent'] * PXW))
        # 1.5x with one sample, then a Lanczos downscale: anti-aliased like
        # supersample=2 at ~55% of the rays (islands are the slow part)
        big = render(build(nm), size=round(size * 1.5), supersample=1)
        im = big.resize((max(1, round(big.width / 1.5)), max(1, round(big.height / 1.5))), Image.LANCZOS)
        im.save(out, optimize=True)
        (OUT / f'{nm}.json').write_text(json.dumps({'pxw': size / (2 * r['extent']), 'size': size}))
        print(f'{nm:20s} {im.width}x{im.height}  {time.time() - t:5.1f}s', flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
