"""Render presentation figures from the frozen r04 trajectories and endpoints."""
import csv
import os
from pathlib import Path

os.environ.setdefault('MPLCONFIGDIR', '/private/tmp/ode-web-mpl')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT/'public/figures'
COLORS = ['#8C9298', '#387CA3', '#D98A38', '#147D70']
CASES = [('SIM-V4-T0-B0', 'Blank'), ('SIM-V4-T40-B0', 'Mi only (40)'),
         ('SIM-V4-T0-B80', 'Ce only (80)'), ('SIM-V4-T40-B80', 'Mi + Ce (40 + 80)')]
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.spines.top': False,
                     'axes.spines.right': False, 'axes.labelcolor': '#243E3B', 'text.color': '#243E3B',
                     'axes.titleweight': 'bold', 'svg.fonttype': 'none', 'pdf.fonttype': 42})


def save(fig, name):
    for suffix in ('png', 'svg', 'pdf'):
        fig.savefig(OUT/f'{name}.{suffix}', dpi=300, facecolor='white')
    plt.close(fig)


def main():
    OUT.mkdir(exist_ok=True, parents=True)
    rows = list(csv.DictReader((ROOT/'data/timecourses.csv').open()))
    endpoints = list(csv.DictReader((ROOT/'data/endpoints.csv').open()))
    fig, axes = plt.subplots(2, 2, figsize=(11.8, 7.7), sharex=True, sharey='row')
    fig.subplots_adjust(top=.83, bottom=.16, hspace=.3, wspace=.13, left=.10, right=.97)
    for col, ch in enumerate(('3', '18')):
        for (sid, label), color in zip(CASES, COLORS):
            subset = [r for r in rows if r['sample_id'] == sid and r['channel'] == ch]
            t = [float(r['time_h']) for r in subset]
            for row, variable in enumerate(('Fus3_active_uM', 'pigment_equivalent_uM')):
                values = [float(r[variable]) for r in subset]
                axes[row, col].plot(t, values, label=label, color=color, linewidth=2.2,
                                    linestyle='--' if sid == CASES[0][0] else '-')
                axes[row, col].scatter([t[-1]], [values[-1]], color=color, s=18, zorder=4)
        axes[0, col].set_title(f'Channel {ch}', pad=14)
        axes[1, col].set_xlabel('Sensor time (h)')
        for ax in axes[:, col]:
            ax.set_xlim(0, 8.15)
            ax.set_ylim(bottom=0)
            ax.grid(alpha=.14)
            ax.axvline(8, color='#AEBDB8', linewidth=.9, linestyle=':')
    axes[0, 0].set_ylabel('Active Fus3 (μM)')
    axes[1, 0].set_ylabel('Pigment (μM equivalent)')
    fig.suptitle('From internal signaling to visible output', x=.10, ha='left', fontsize=20, fontweight='bold', y=.975)
    fig.text(.10, .915, 'Frozen two-channel ODE · four representative mixed-sample conditions', fontsize=11, color='#61716E')
    fig.legend(*axes[0, 0].get_legend_handles_labels(), loc='lower center', bbox_to_anchor=(.52, .06), ncol=4, frameon=False)
    fig.text(.10, .025, 'Synthetic simulation · Mi: J2/100 cm³; Ce: L4/100 cm³ · 8 h endpoints feed the dual-channel model', fontsize=9, color='#61716E')
    save(fig, '01-signal-to-color')

    fig, ax = plt.subplots(figsize=(13.5, 5.5))
    fig.subplots_adjust(left=.02, right=.98, top=.88, bottom=.13)
    ax.set(xlim=(0, 13.2), ylim=(0, 4)); ax.axis('off')
    boxes = [(0.1, 2.35, 'MIXED LIGANDS', 'ascr#3 + ascr#18', '#EDF2F2'),
             (2.65, 2.35, 'EFFECTIVE INPUT', r'$u=\frac{u_{max}L}{K_L+L}$', '#DFF0EB'),
             (5.2, 2.35, 'FIVE-STATE CORE', 'G protein → scaffold\nFus3 activation + feedback', '#EDF2F2'),
             (7.75, 2.35, 'PIGMENT OUTPUT', 'Effective expression\nand pigment accumulation', '#DFF0EB'),
             (10.3, 2.35, 'PAIRED READOUT', '8 h pigment → A480\n→ blank correction', '#EDF2F2')]
    for x, y, title, body, color in boxes:
        ax.add_patch(FancyBboxPatch((x, y), 2.25, 1.25, boxstyle='round,pad=.12,rounding_size=.12', linewidth=0, facecolor=color))
        ax.text(x+1.125, y+.98, title, ha='center', va='center', fontsize=9, fontweight='bold')
        ax.text(x+1.125, y+.48, body, ha='center', va='center', fontsize=12 if 'frac' in body else 10, linespacing=1.6)
    for x in (2.35, 4.90, 7.45, 10.0):
        ax.annotate('', xy=(x+.23, 2.97), xytext=(x+.02, 2.97), arrowprops=dict(arrowstyle='->', color='#58766B', lw=1.6))
    ax.text(3.775, 1.98, r'Fitted: $K_L$', ha='center', fontsize=12, color='#147D70', fontweight='bold')
    ax.text(6.325, 1.98, 'Source parameters fixed', ha='center', fontsize=10, color='#61716E')
    ax.text(8.875, 1.98, r'Fitted: $a$', ha='center', fontsize=12, color='#147D70', fontweight='bold')
    ax.text(6.6, 1.0, r'$\frac{dC}{dt}=b+a\frac{m^n}{K^n+m^n}-\delta C,\qquad m=\frac{Fus3_{active}}{Fus3_{total}}$', ha='center', fontsize=23)
    fig.text(.04, .95, 'What is fixed, and what is calibrated?', fontsize=20, fontweight='bold')
    fig.text(.04, .055, 'Two independent sensors share the core structure. Each channel has its own fitted K_L and a.\nSynthetic endpoint calibration; cross-response weights and remaining output parameters are assumptions.', fontsize=10, color='#61716E')
    save(fig, '02-pathway-and-interfaces')

    fig, axes = plt.subplots(1, 2, figsize=(11.8, 5.2))
    fig.subplots_adjust(left=.09, right=.97, top=.79, bottom=.20, wspace=.25)
    for ax, ch in zip(axes, ('3', '18')):
        part = [r for r in endpoints if r['channel'] == ch]
        x = np.array([float(r['assumed_pigment_uM']) for r in part])
        y = np.array([float(r['ode_pigment_uM']) for r in part])
        lo, hi = min(x.min(), y.min())-.015, max(x.max(), y.max())+.025
        ax.plot([lo, hi], [lo, hi], '--', color='#A8B5B1', lw=1.4)
        for target, color in [(0, '#8C9298'), (40, '#147D70'), (120, '#D98A38')]:
            mask = np.array([float(r['target_density_J2_per_100cm3']) == target for r in part])
            ax.scatter(x[mask], y[mask], s=56, color=color, edgecolor='white', linewidth=.8, label=f'Mi = {target}', zorder=3)
        ax.set(xlim=(lo, hi), ylim=(lo, hi), xlabel='Assumed endpoint (μM equivalent)', ylabel='ODE endpoint (μM equivalent)')
        ax.set_title(f'Channel {ch}  |  RMSE {np.sqrt(np.mean((y-x)**2)):.4f} μM', fontsize=12)
        ax.grid(alpha=.14)
    fig.text(.09, .93, 'Nine mixtures, one parameter pair per channel', fontsize=20, fontweight='bold')
    fig.text(.09, .86, 'Synthetic 8 h endpoint calibration · dashed line: y = x', fontsize=11, color='#61716E')
    fig.legend(*axes[0].get_legend_handles_labels(), loc='lower center', bbox_to_anchor=(.52,.055), ncol=3, frameon=False)
    fig.text(.09, .02, 'All nine points were used for fitting. These are assumed targets, not wet-lab observations.', fontsize=9, color='#61716E')
    save(fig, '03-endpoint-calibration')
    print('Exported three figures as PNG (300 dpi), SVG and PDF:', OUT)


if __name__ == '__main__':
    main()
