---
title: Model
heading: Model
sub: >-
  Four connected studies, from receptor contacts to conditional management
  value.
crumbs:
  - Model
  - Overview
route: model
search: true
description: >-
  Four connected studies, from receptor contacts to conditional management
  value.
meta: {}
draft: false
hidden: false
---
## From recognition to management decisions {#overview toc="Connected questions"}

:::lead
Our four modeling studies connect **molecular recognition, dynamic contacts, signal interpretation** and the value of density information. Each stage answers a different question and defines what the next stage needs to test.
:::

Docking compares predicted contacts and **two-ligand scores** to nominate receptor changes. MD follows selected complexes in a membrane. ODE and two-channel models connect mixed ligand inputs to color and target density. Eco asks whether density information changes management choices and conditional income.

:::cards{cols=2}
### Docking {icon="inspect" href="/model-docking/"}
From WT contact differences through 76 single-mutant designs to complementary N84V and V368R candidates.

### Molecular Dynamics {icon="cycle" href="/model-md/"}
Six membrane systems, local ligand motion, persistent contacts and the limits of single-trajectory comparisons.

### ODE and two-channel sensing {icon="signal" href="/model-ode/"}
A six-state signaling model, simulated color calibration, phone observation and paired-color density estimation.

### Economic benefit {icon="cost" href="/model-eco/"}
Density-to-yield relationships and three management scenarios, with separate comparisons against no control and **uniform control**.
:::

## Molecular recognition {#molecular-docking-from-receptor-comparisons-to-gpr2-mutant-design toc="Docking"}

<span id="research-objectives" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="computational-workflow-and-evaluation-methods" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="receptor-comparisons-and-selection-of-the-study-target" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="from-hotspot-identification-to-combination-design" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="main-findings-and-subsequent-validation" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="docking-differential-contacts-with-two-ligands-and-residue-correspondence" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="comparison-set-and-contact-frequencies" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="differential-contacts-with-two-ligands-in-the-three-fungal-receptors" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="support-for-tm6-positional-correspondence-and-disagreement-in-the-nematode-receptors" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="gprc-n56-and-other-receptor-specific-contacts" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="how-search-regions-and-chemical-representation-affect-interpretation" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="common-coordinate-references-membrane-orientation-and-local-searches" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="atom-record-integrity-and-formal-charges" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="from-differential-contacts-to-testable-structural-hypotheses" class="model-legacy-anchor" aria-hidden="true"></span>

Contact differences identify positions to test. Side-chain scans and combinations show why two ligand scores must be interpreted separately; contact retention alone does not guarantee a favorable score. N84V and V368R provide opposite candidate directions for further study. [Read the docking workflow and score table](/model-docking/).

## Testing contacts in motion {#molecular-dynamics-from-global-motion-to-local-contact-behavior toc="Molecular Dynamics"}

<span id="md-receptor-motion-and-local-ligand-contacts" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="simulation-systems-and-analysis-questions" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="dynamic-comparison-of-gpr2-wt-and-single-mutants" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="gpr3-r167y-coexistence-of-global-displacement-and-local-contacts" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="restoring-full-length-structures-and-rebuilding-local-loops-for-new-candidates" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="input-sources-and-completion-status-of-the-new-md-study" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="insights-from-dynamic-analysis" class="model-legacy-anchor" aria-hidden="true"></span>

Each of WT, N84V and V368R was paired with both ligands for **one 100 ns trajectory**. Pocket-aligned motion and contact occupancy inform structural explanations, with **starting-pose differences and lack of replicates** retained as limitations. [Read the MD observations and pending method details](/model-md/).

## From a mixed sample to paired colors {#ode-modeling-from-receptor-input-to-color-output toc="ODE and density"}

<span id="ode" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="ode-connecting-receptor-recognition-to-colorimetric-output" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="research-objectives-2" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="initial-model-retaining-dynamic-processes-and-simplifying-intermediate-steps" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="prototype-simulations-and-control-comparisons" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="model-iteration-matching-complexity-to-experimental-conditions" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="integration-with-wet-lab-experiments-and-next-steps" class="model-legacy-anchor" aria-hidden="true"></span>

The ODE uses a **literature-derived common signaling core** and **project-specific input/output interfaces**. Paired simulated colors allow a regression to estimate Mi density without supplying Ce density at prediction time. **The current evidence is simulated**; experiments must calibrate secretion, sensor response and reading conditions. [Read the equations, four research figures and parameter tables](/model-ode/).

## From density to an action {#economic-benefit-modeling-from-detection-information-to-management-decisions toc="Economic benefit"}

<span id="eco" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="economic-benefit-model-from-detection-information-to-management-decisions" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="research-objectives-3" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="model-structure-and-basic-assumptions" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="parameter-sources-and-risk-based-management" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="example-results-how-much-benefit-does-detection-information-provide" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="model-checks-and-applicability" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="integration-with-wet-lab-and-human-practices" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="references" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="references-2" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="docking-and-receptor-recognition" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="md-and-membrane-system-simulations" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="ode-modeling-and-signal-output" class="model-legacy-anchor" aria-hidden="true"></span>
<span id="economic-benefit-modeling-and-management-decisions" class="model-legacy-anchor" aria-hidden="true"></span>

The Spain/protected-tomato scenario distinguishes the benefit of a testing-and-control program from the added value of changing a uniform treatment. The interactive economic comparison uses density directly and the submitted economic parameters. [Explore the economic model](/model-eco/).

## What the models establish {#model-evidence toc="Evidence and next steps"}

| Study | Present contribution | Further evidence needed |
| --- | --- | --- |
| Docking | Candidate scores, predicted poses and contact hypotheses | Prepared structural panels and experimental binding/selectivity tests |
| MD | Local movement and contact observations in selected trajectories | Complete preparation methods, revised interpretations and replicate comparisons |
| ODE / two channels | Internal calibration and density estimation in simulated mixtures | Measured paired samples, pigment/phone calibration and noise evaluation |
| Eco | Reproducible conditional management comparisons | Local cost, sampling, treatment and detection-error data |

The original Chinese manuscripts are preserved in the team's source archive. The English presentation retains scientific qualifications and marks unfinished author material. Candidate ranking, simulated prediction error and scenario income each have different meanings; none substitutes for experimental or field validation.
