---
title: Model
heading: Model
sub: ''
crumbs:
  - Model
  - Overview
route: model
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout model-manuscript" lang="en">

<span id="model-overview" class="legacy-section-anchor" aria-hidden="true"></span>

:::manuscriptTitle

Model overview

:::

How can nematode chemical signals in soil help guide agricultural management? Our modeling work explores this question from receptor recognition to color readout, target nematode density, and treatment decisions. Four complementary components support sensor design, experimental calibration, and assessment of the potential value of detection.

The public modeling repository contains the analysis code, input files, and reproducibility notes for these studies. [Explore the modeling code →](https://gitlab.igem.org/2026/software/nku-china/modeling)

<nav class="model-chapter-links" aria-label="Model chapters"><a href="/model-docking/"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/model-b9a0bc880ff5.webp" width="1024" height="1024" alt="" loading="lazy" decoding="async"><span>Molecular docking</span></a><a href="/model-md/"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/model-924062c2f7ac.webp" width="1024" height="1024" alt="" loading="lazy" decoding="async"><span>Molecular dynamics</span></a><a href="/model-ode/"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/model-51cd59b3873b.webp" width="1024" height="1024" alt="" loading="lazy" decoding="async"><span>ordinary differential equation and dual-channel model</span></a><a href="/model-eco/"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/model-5d23c4029c73.webp" width="1024" height="1024" alt="" loading="lazy" decoding="async"><span>Economic benefit</span></a></nav>

> Generated with OpenAI GPT Image 2.

## Molecular docking: identifying receptor variants for differential recognition {#model-section-1 toc="Molecular docking: identifying receptor variants for differential recognition"}

We compared how Gpr2 variants interact with two ascarosides, ascaroside #18 (ascr#18) and ascaroside #3 (ascr#3), using docking scores and receptor–ligand contacts. These comparisons guided the selection of N84V and V368R for further study as candidates with contrasting predicted ligand preferences.

## Molecular dynamics: exploring receptor–ligand behavior in a membrane {#model-section-2 toc="Molecular dynamics: exploring receptor–ligand behavior in a membrane"}

Starting from docked poses, we simulated receptor–ligand complexes in a membrane environment to examine receptor motion, ligand positioning, and changes in molecular contacts. These simulations provide structural clues for interpreting the candidates and formulating hypotheses for experimental testing.

## ODE and dual-channel model: linking color readouts to nematode density {#model-section-3 toc="ODE and dual-channel model: linking color readouts to nematode density"}

Our ordinary differential equation model connects receptor input to yeast signaling and pigment production, with simulated pigment outputs translated into smartphone color features. The dual-channel model combines two complementary sensor responses to explore density estimation for the southern root-knot nematode (<em>Meloidogyne incognita</em>) when background nematode abundance is unknown. Together, these models provide a framework for experimental calibration.

## Economic benefit: assessing when detection informs treatment {#model-section-4 toc="Economic benefit: assessing when detection informs treatment"}

Using target nematode density as an input, we compare net returns from no treatment, uniform treatment, and treatment selected by density category after testing. By accounting for potential yield loss, testing costs, and treatment costs, the model examines when density information could improve management decisions under the modeled conditions.

Docking and molecular dynamics guide receptor design and experimental questions. ordinary differential equation and dual-channel modeling explore how sensor responses can be interpreted as density estimates, which then serve as inputs to economic scenarios. In turn, the density categories used for treatment help define the measurement precision needed for future calibration.

</div>
