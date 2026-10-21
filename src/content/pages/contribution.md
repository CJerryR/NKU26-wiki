---
title: Contribution
heading: Contribution
sub: ''
crumbs:
  - Project
  - Contribution
route: contribution
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout" lang="en">

:::manuscriptTitle

Contribution

:::

NemaKlear brings together yeast engineering, computational modeling, and work with communities and agricultural stakeholders. Along the way, we developed resources that other teams can build on: genetic parts, experimental guidance, analysis methods, and educational materials.

This page introduces those resources and links to their detailed documentation. Whether you are building a yeast biosensor, interpreting a mixed signal, or planning a sampling project, the sections below offer starting points you can adapt to your own work.

## Biological parts and experimental resources {#contribution-1-biological-parts-and-experimental-resources toc="Biological parts and experimental resources"}

### 1.1 Parts and collections {#contribution-1-1-parts-and-collections toc="Parts and collections" toc-unnumbered}

We submitted 39 Parts and four Collections to the iGEM Registry, covering yeast chassis construction, editing tools, guide RNAs, and GPR2 variants. Organizing these components by function gives future teams a clearer route to finding parts for related yeast-engineering projects.

The collections bring together sequence and design information that teams can use when planning their own constructs. Detailed part descriptions and identifiers are listed on our Parts page.

[Browse Parts and Collections](/parts/) · [Visit Our Registry Entries](https://registry.igem.org/organisations/igem/6303)

### 1.2 Documented strain construction {#contribution-1-2-documented-strain-construction toc="Documented strain construction" toc-unnumbered}

We documented the construction of our engineered yeast through successive genetic modifications, including receptor expression, pathway engineering, and pigment-production modules. The documentation presents the construction strategy, genetic modifications, and available verification results.

Teams developing similar biosensors can use this documentation to plan an assembly strategy, identify relevant intermediate constructs, and choose verification steps for their own strains.

[Explore the Construction Results](/results/)

:::figure

[![A documented route to yeast strain construction.](https://static.igem.wiki/teams/6303/wiki/release-20261020/contribution-figure-1-e88a84496c.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/contribution-figure-1-e88a84496c.webp "Open full-resolution image")

Figure 1. A documented route to yeast strain construction. The workflow summarizes the genetic modifications connecting our chassis and receptor variants.

:::

### 1.3 Protocols and troubleshooting {#contribution-1-3-protocols-and-troubleshooting toc="Protocols and troubleshooting" toc-unnumbered}

Our experimental resources include the main protocols used in the project and a troubleshooting guide covering difficulties encountered during polymerase chain reaction, yeast transformation, and cloning.

Together, these materials give future teams both an experimental starting point and practical examples of what to check when a procedure does not work as expected.

[View Experimental Protocols](/experiments/) · [Read the Troubleshooting Guide](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-cbf9a8013583-troubleshooting.pdf)

## Computational methods and modeling tools {#contribution-2-computational-methods-and-modeling-tools toc="Computational methods and modeling tools"}

Our computational work addresses questions that extend beyond NemaKlear: how to compare receptor candidates, examine ligand behavior, interpret combined sensor outputs, and assess the value of a screening result. Each workflow offers methods that can be adapted to another system with appropriate inputs and validation.

### 2.1 Receptor design and docking checks {#contribution-2-1-receptor-design-and-docking-checks toc="Receptor design and docking checks" toc-unnumbered}

::::figuretext{side=right width=medium flow=wrap}

:::figure

[![Mapping candidate sites for receptor engineering.](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-3-9b303eb053.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-3-9b303eb053.webp "Open full-resolution image")

Figure 2. Mapping candidate sites for receptor engineering. Highlighted residues were selected for further substitution studies through comparisons of predicted ligand contacts.

:::

We organized a receptor-design workflow around comparisons between two ligands. It combines contact-guided site selection, side-chain scanning, separate inspection of each ligand’s score, and comparisons between combined mutants and their single-mutant parents. Cross-receptor analysis adds sequence and structural correspondence to the assessment of candidate positions.

We also documented input checks and pose-export procedures for keeping coordinate references, atom mappings, and chemical information consistent. These methods can help other teams develop testable receptor-engineering hypotheses and prepare docking outputs for further analysis.

[Explore the Docking Workflow](/model-docking/)

::::

### 2.2 Ligand motion and contact analysis {#contribution-2-2-ligand-motion-and-contact-analysis toc="Ligand motion and contact analysis" toc-unnumbered}

We combined ligand-position measurements with contact analysis to examine receptor–ligand behavior during molecular dynamics simulations. Comparing whole-receptor, transmembrane-core, and local-pocket alignment helps distinguish overall receptor movement from changes near the binding site.

Other teams can apply this approach to identify persistent contacts, periods of ligand relocation, and interactions worth investigating further. The analysis connects motion curves with the molecular structures behind them.

[Explore the Molecular dynamics analysis](/model-md/#src-Model-Molecular-Dynamics-6)

### 2.3 Signal-to-color and dual-channel modeling {#contribution-2-3-signal-to-color-and-two-channel-modeling toc="Signal-to-color and dual-channel modeling" toc-unnumbered}

We developed a connected modeling workflow that follows effective receptor input through yeast signaling and pigment production to paired color features and target-density estimation. The signaling core builds on Supady Model B and public TU Delft 2012 iGEM materials, with project-specific input and output relationships added around it.

Separating shared pathway parameters from sensor and reporter settings makes the framework easier to adapt. Other teams can use the documented equations, parameter sources, and simulated examples to explore their own sensing systems, then calibrate the relevant relationships with experimental measurements.

:::figure

[![From signal response to density estimation.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-64-b07ff15b9548.webp)](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-64-b07ff15b9548.webp "Open full-resolution image")

Figure 3. From signal response to density estimation. The workflow connects pathway modeling, simulated colors, and paired-readout analysis. Generated with OpenAI GPT Image 2.

:::

[Explore the ordinary differential equation and dual-channel models](/model-ode/#src-Model-ODE-1)

### 2.4 Economic evaluation of screening {#contribution-2-4-economic-evaluation-of-screening toc="Economic evaluation of screening" toc-unnumbered}

Our economic model connects target density, crop losses, and management costs to compare three scenarios: no testing and no treatment, uniform treatment without testing, and treatment guided by screening results. These comparisons help examine when additional information changes a management choice and whether the expected benefit covers its cost.

The framework separates parameters from calculations, allowing users to substitute crop-specific loss relationships, local prices, testing costs, and treatment assumptions. A worked example provides a starting point for evaluating another agricultural screening project with suitable local data.

[Explore the Economic Model](/model-eco/)

## Educational and engagement resources {#contribution-3-educational-and-engagement-resources toc="Educational and engagement resources"}

Our Human Practices work produced materials and organizational approaches that can support other teams in teaching, understanding user needs, and coordinating field sampling. The documentation also outlines a way to record stakeholder feedback, team discussions, and follow-up actions.

### 3.1 Age-adapted educational materials {#contribution-3-1-age-adapted-educational-materials toc="Age-adapted educational materials" toc-unnumbered}

::::figuretext{side=left width=medium flow=wrap}

:::figure

[![Bringing nematode science into the classroom.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-65-2b6f00755b3f-preview.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/contribution-figure-4-2b6f00755b.webp "Open full-resolution image")

Figure 4. Bringing nematode science into the classroom. Our teaching materials support classroom activities through the Xiangyang Program partnership.

:::

We developed three courses linking nematodes, agriculture, biological signals, and scientific responsibility. Age-adapted materials, picture books, and other outreach resources offer different ways to introduce these ideas to younger audiences.

Teams and educators can draw on the learning goals, activity sequences, and visual materials, adapting them to local crops, classroom conditions, and learners’ ages.

[Explore Educational Materials](/education/)

::::

### 3.2 Stakeholder research and feedback methods {#contribution-3-2-stakeholder-research-and-feedback-methods toc="Stakeholder research and feedback methods" toc-unnumbered}

::::figuretext{side=right width=medium flow=wrap}

:::figure

[![Learning from growers’ experience.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-66-7d72a4f73708-preview.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/contribution-figure-5-7d72a4f737.webp "Open full-resolution image")

Figure 5. Learning from growers’ experience. Conversations during farm visits helped us relate testing needs to local crops and management practices.

:::

Our documentation shows how project questions can guide questionnaires, expert discussions, and conversations with growers. It also describes a way to trace feedback from its source through team discussion to subsequent design decisions.

Other teams can adapt this approach to organize their own engagement and keep track of how it informs their work. Project-introduction and industry-communication materials provide additional examples of explaining a research idea and presenting a specific request for support.

[Explore Integrated Human Practices](/human-practices/) · [Explore Industry Engagement](/hp-industry/)

::::

### 3.3 Sampling guidance and sample records {#contribution-3-3-sampling-guidance-and-sample-records toc="Sampling guidance and sample records" toc-unnumbered}

Our soil-collection work combined a sampling guidance video with sample identifiers and records of crop, location, collection date, and treatment history. This approach links each sample to the agricultural setting from which it came.

Teams organizing environmental sampling can use this as a reference for coordinating instructions, labeling, background records, and handover checks, then adapt the sampling conditions to their research questions.

[Explore Field Investigation](/hp-investigation/)

## Building on these resources {#contribution-building-on-these-resources toc="Building on these resources"}

The linked pages explain the methods, examples, and supporting evidence behind each contribution. When adapting the materials, please credit NKU-China 2026 and the relevant original sources, and check the usage terms of any third-party content. We hope these resources help future teams begin with useful references and carry the work further.

</div>
