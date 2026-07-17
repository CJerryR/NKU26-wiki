---
source: _content/modeling.html
slug: modeling
title: Modeling
route: model
crumbs: Lab / Modeling
eyebrow: Dry lab / Modeling
heading: Modelling the signal
sub: A conceptual teaching skeleton that exposes unknowns before any solver, calibration, or project prediction exists.
meta: Stage=Conceptual | Solver=Not implemented
---

# Modeling

01 - Status

## A preparation layer, not a finished model

The work documented here is a conceptual model-preparation and teaching layer. The repository contains no runnable ODE solver, simulation notebook, parameter file, fitting code, or calibrated model artifact. No equation on this page has produced a project result or guided a design decision.

The value of this stage is narrower but still useful: it makes the proposed signal chain explicit, separates algebraic relations from changing states, and turns missing biological evidence into a visible measurement agenda. It also prevents an attractive diagram from being mistaken for an implemented sensing system.

**Evidence boundary**

Gpr2/Gpr3 response to ascr#18, receptor expression and localisation, pathway coupling, reporter selection, reporter output, and end-to-end sensing are all unresolved. The current skeleton cannot establish any of them.

02 - Abstraction

## Which links would a future model need?

The proposed abstraction asks how a symbolic ligand input might propagate through candidate receptor activity, proposed G-protein coupling, MAPK/Fus3 activity, a transcriptional layer, and a proposed reporter output. The internal explainer also considers Ste12 or a synthetic transcription factor and a possible GAL output layer. These are candidate mathematical layers, not selected or functional biological parts.

In the equations below, `L` is only a hypothetical ligand-input variable. It is not a measured ascr#18 concentration. Likewise, `R_active`, `G_on`, `M`, `TF`, `Prod`, `C`, and optional `P` are conceptual activity or output proxies. They have no supplied units, ranges, initial conditions, or measured identities.

### Recognition

Candidate receptor activation is a proposed link. The algebraic expression does not demonstrate binding, occupancy, or response.

### Coupling

G-protein and MAPK/Fus3 activity are conceptual layers. Functional coupling has not been established for this project.

### Output

Transcriptional and visible-reporter layers remain proposals. No reporter has been selected or measured.

03 - Equations

## A mixed algebraic/differential skeleton

The team teaching skeleton is transcribed below without modification. It is not six ODEs and not a complete mechanistic model. `R_active`, `TF`, and `Prod` are algebraic relations; `G_on`, `M`, and `C` have differential equations.

```
R_active = basal_R + E_R * L^n_R / (K_L^n_R + L^n_R)
dG_on/dt = k_couple * R_active * (1 - G_on) - k_g_off * G_on
dM/dt = k_m_on * G_on * (1 - M) - k_m_off * M
TF = basal_TF + E_TF * M^n_TF / (K_TF^n_TF + M^n_TF)
Prod = leak_out + copy_number * gain_out * TF / (K_out + TF)
dC/dt = k_color_prod * Prod - k_color_loss * C
```

The block organizes a possible sequence from input to output while leaving every parameter symbolic. Its algebraic relations do not establish equilibrium, timescale separation, conservation, or a unique biological interpretation.

### Alternative maturation layer

The explainer supplies a second, optional output-layer formulation:

```
dP/dt = protein_production - k_mature * P - k_deg_P * P
dC/dt = k_mature * P - k_loss_C * C
```

This optional block is a separate alternative. Its `dC/dt` replaces the simple `dC/dt` in the main block when the maturation split is considered; the two forms are not simultaneous equations in one system. The evidence supplies no mapping between `protein_production` and `Prod`, or between `k_loss_C` and `k_color_loss`.

04 - Provenance

## A future ledger for every parameter

The explainer proposes five bookkeeping labels: `fixed from source`, `literature prior`, `scenario prior`, `wet-lab required`, and `do-not-use`. They are categories for future evidence tracking, not assignments already made.

No final parameter table or parameter-to-category mapping is supplied. No named parameter can therefore be described as fixed, measured, or estimated. A scenario prior would be an exploratory assumption only; it could not become a project conclusion or performance claim.

### Trace

Record the exact source and interpretation for any future quantity.

### Separate

Keep literature information, exploratory assumptions, and team measurements distinct.

### Exclude

Mark unusable quantities explicitly instead of silently carrying them into later work.

05 - Gates

## What must exist before calculation

Before an executable simulation could be implemented, the formulation, variable meanings, units, provenance, initial conditions, and verification tests would need to be specified. Before later calibration or validation, the biological chain would need controlled measurements rather than assumed links.

- Component evidence

#### Recognition and coupling

Direct ligand-response controls, no-ligand basal leak, non-cognate controls, receptor expression and localisation, and receptor/G-protein coupling evidence.

- Dynamic evidence

#### Input and time

Ligand dose-response and time-course measurements collected with defined controls and reproducible sample handling.

- Output evidence

#### Reporter and complete chain

Reporter selection, gain, maturation and loss measurements, followed by replicated end-to-end measurements with matched controls.

**No numerical gate yet**

The evidence supplies no pass/fail threshold for moving from concept to implementation, calibration, or validation. Those criteria must follow the measurement definitions and intended use.

06 - Scope

## Useful for questions, not performance claims

The current skeleton can expose unknowns, show where experimental measurements would enter, and help keep alternative output formulations separate. It cannot predict sensor performance, establish receptor response, quantify sensitivity or specificity, determine a limit of detection or dynamic range, compare prediction with data, or justify a design decision.

A later model should be presented as a project result only after its implementation, provenance, verification, calibration, and comparison evidence are available. Until then, this page records the conceptual foundation and the conditions required to progress responsibly.
