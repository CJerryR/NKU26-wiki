---
title: Engineering
heading: Engineering
sub: ''
crumbs:
  - Project
  - Engineering
route: engineering
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout" lang="en">

:::manuscriptTitle

Engineering NemaKlear: **design–build–test–learn (DBTL)**

:::

NemaKlear aims to make nematode screening easier to use through a yeast-based test kit. Reaching that goal means connecting several steps: sensing nematode signals, turning them into color, interpreting that color, and preparing cells in a practical test format.

We used DBTL to improve these connections. Bench experiments tested our biological constructs and materials. Computational models helped us develop receptor candidates and explore how to interpret mixed signals. <strong>Human Practices (HP)</strong> kept practical concerns—ease of use, cost, and useful information—in view as the project developed.

:::figure

[![Figure 1. Engineering yeast to turn nematode signals into color. Modular GPR2-mediated sensing connects to the yeast signaling pathway, a synthetic transcription factor, and GAL-driven amplification for yellow betaxanthin production.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-20-55bd4422e309.webp)](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-20-55bd4422e309.webp "Open full-resolution image")

Figure 1. Engineering yeast to turn nematode signals into color. Our modular design connects GPR2-mediated sensing to the yeast signaling pathway, a synthetic transcription factor, and GAL-driven amplification, leading to yellow betaxanthin production.

:::

The following iterations follow three engineering questions: Can we build the biosensor? Can its output help distinguish target from background? Can we turn it into a usable test?

<span id="src-Project-Engineering-1" class="legacy-section-anchor" aria-hidden="true"></span>

## Goal 1: Building the biosensor {#engineering-goal-1-building-the-biosensor toc="Goal 1: Building the biosensor"}

Our design connects the GPR2 receptor to a yeast signaling pathway and a yellow betaxanthin output. Building this system required us to check where the receptor was expressed and whether each genetic change had been made as intended.

### 1.1 Improving receptor localization tests {#engineering-iteration-1-1-improving-receptor-localization-tests toc="Improving receptor localization tests" toc-unnumbered}

Green fluorescence showed that GPR2–sfGFP was expressed, but its location needed a clearer reference.

**Design** - We added staining references to examine the receptor’s position relative to the cell boundary and membrane structures.

**Build** - We stained GPR2–sfGFP-expressing yeast with **Calcofluor White (CFW)** and FM4-64, then compared the fluorescence channels and merged images.

**Test** - The staining comparisons provided spatial context for the green signal. They allowed us to examine its distribution more closely than receptor fluorescence alone.

:::figure

[![Figure 2. Examining receptor localization.](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-2-627df6af35.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-2-627df6af35.webp "Open full-resolution image")

Figure 2. Examining receptor localization. GPR2–sfGFP fluorescence is compared with FM4-64 staining and merged images. Scale bars: 10 μm.

:::

**Learn** - **We established a clearer way to assess receptor localization.** Reference staining added spatial context to the expression images and strengthened our receptor-evaluation workflow. Further localization and response measurements will help connect receptor placement to sensing function.

### 1.2 Revising the genome-editing strategy {#engineering-iteration-1-2-revising-the-genome-editing-strategy toc="Revising the genome-editing strategy" toc-unnumbered}

Early homologous-recombination attempts did not consistently produce the intended edits. Some colonies produced yellow pigment even though verification did not confirm the planned insertion.

**Design** - We revised the editing workflow to use Cas9-assisted integration. This also required compatible selection markers, **guide RNAs (gRNAs)**, and donor **deoxyribonucleic acid (DNA)** for the target sites.

**Build** - We replaced the Cas9 plasmid’s Trp selection marker with **leucine (Leu)** and prepared the gRNA and donor constructs for pathway assembly.

**Test** - Transformant verification supported the intended integration of the synthetic transcription-factor module and the GAL-controlled pigment-production cassette in the revised workflow.

**Learn** - **The revised editing workflow yielded genetically verified pathway components.** Combining targeted integration with genotyping gave us a better-defined chassis for receptor and reporter studies. The next step is to characterize how these components function together in response to ligands.

Further construction details and verification results are available on our [Results page](/results/).

<span id="src-Project-Engineering-12" class="legacy-section-anchor" aria-hidden="true"></span>

## Goal 2: Making the readout informative {#engineering-goal-2-making-the-readout-informative toc="Goal 2: Making the readout informative"}

A stronger color can reflect more target nematodes, more background signals, or both. We therefore worked on two connected questions: how to obtain different receptor responses, and how to use those differences to interpret a sample.

### 2.1 Developing receptor variants with different predicted preferences {#engineering-iteration-2-1-developing-receptor-variants-with-different-predicted-preferences toc="Developing receptor variants with different predicted preferences" toc-unnumbered}

We used successive rounds of receptor design to find variants with different predicted preferences for <strong>ascaroside #3 (ascr#3)</strong> and <strong>ascaroside #18 (ascr#18)</strong>. Each round narrowed the candidates and guided the next set of substitutions.

**Design** - We selected candidate sites from differences in the two ligands’ predicted contacts, then used **alanine (Ala)** substitutions to identify positions worth exploring further.

**Build** - We expanded promising sites through side-chain scanning, generating a panel of mutant sequences and structural models. We also designed combinations to test whether useful single-site effects could be retained or improved.

**Test** - Score and contact comparisons identified N84V, V110C, V110M, and V368R as priority candidates. N84V and V368R showed contrasting score shifts toward ascr#18 and ascr#3, respectively. Most tested combinations offered no further improvement over the better single-mutant parent, helping us focus subsequent work.

**Learn** - **We developed a set of receptor-engineering candidates and prioritized N84V and V368R for further study.** Their contrasting predicted preferences provided a basis for exploring complementary sensing channels. Dynamic analysis and experimental ligand-response measurements were the next steps toward evaluating these designs.

### 2.2 Investigating how candidate receptors hold their ligands {#engineering-iteration-2-2-investigating-how-candidate-receptors-hold-their-ligands toc="Investigating how candidate receptors hold their ligands" toc-unnumbered}

The docking results gave us candidate receptors and possible binding poses. We next examined how those contacts behaved over time in a membrane environment.

**Design** - We compared **wild type (WT)** GPR2, N84V, and V368R with both ligands to look for persistent interactions that could help explain their docking-score differences.

**Build** - We prepared six receptor–ligand systems and ran **molecular dynamics (MD)** simulations. Observations from the initial V368R–ascr#3 trajectory then guided two additional starting poses near Arg368 and Arg189.

**Test** - In the N84V–ascr#18 simulation, Arg189 maintained contact with the ligand’s carboxylate group throughout the main comparison window, providing a persistent anchoring interaction. In contrast, the additional V368R simulations lost their preset contacts and mainly adopted Arg345 anchoring, which also occurred in other systems.

**Learn** - **We identified a persistent ligand-anchoring interaction in the N84V–ascr#18 simulation.** This provided a specific structural hypothesis for follow-up testing and helped distinguish the evidence available for the two candidates. Further simulations and ligand-response measurements will test how reproducible this N84V interaction is and investigate the mechanism behind V368R’s predicted preference.

### 2.3 Revising the signal-to-color model {#engineering-iteration-2-3-revising-the-signal-to-color-model toc="Revising the signal-to-color model" toc-unnumbered}

Our first model followed the full pathway from receptor input to pigment output. It exposed a problem: several different parameter combinations could produce similar final colors.

**Design** - We revised the model to separate a published yeast signaling core from the project-specific input and color-output relationships.

**Build** - We reconstructed the shared signaling reactions and connected them to an effective pigment-production equation. We then adjusted input sensitivity and output gain against simulated color targets.

**Test** - Early simulations produced similar endpoint colors across different inputs. After adjustment, the model better followed the intended response range, although weak-input responses still deviated from the targets.

**Learn** - **We built a simulation framework linking receptor input to distinguishable color outputs.** Separating the shared pathway from adjustable input and output relationships made calibration more manageable and supplied the outputs for density-estimation tests. Weak-input deviations and calibration against our yeast strains remain priorities for the next round.

### 2.4 Testing paired readouts {#engineering-iteration-2-4-testing-paired-readouts toc="Testing paired readouts" toc-unnumbered}

With a signal-to-color model in place, we asked whether two complementary readouts could help separate target abundance from background interference.

**Design** - We designed simulated mixtures in which target and background densities varied independently, and compared one-channel and two-channel predictions.

**Build** - We converted **ordinary differential equation (ODE)** pigment outputs into simulated blue-channel image features and used the paired features to estimate target nematode density.

**Test** - On the same simulated test set, paired readouts gave lower prediction errors than either channel alone. Tests near the example risk thresholds also showed that small density errors could change the assigned risk category.

:::figure

[![Figure 3. Comparing one and two readouts.](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-3-5f5e319acc.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-3-5f5e319acc.webp "Open full-resolution image")

Figure 3. Comparing one and two readouts. Paired readouts improved target-density prediction on the simulated test set.

:::

**Learn** - **Paired readouts improved target-density estimation in simulated mixtures.** This supported the two-channel design, while the economic model connected prediction errors to their practical consequences. Validation with measured colors will need particular attention to samples near risk thresholds, where small errors can change the interpretation.

### 2.5 Evaluating when screening adds value {#engineering-iteration-2-5-evaluating-when-screening-adds-value toc="Evaluating when screening adds value" toc-unnumbered}

**Design** - We asked when knowing target density could improve management decisions, comparing screening-guided management with no treatment and uniform treatment without testing.

**Build** - Using protected tomato cultivation in Spain as a worked example, we linked density estimates, crop losses, treatment effects, and costs to expected seasonal net returns.

**Test** - Screening could add value by avoiding unnecessary treatment or guiding a more effective response. When it led to the same treatment as the uniform strategy, it simply added testing costs. Sensitivity analysis examined how these comparisons changed with economic and treatment assumptions.

**Learn** - **We connected detection performance to potential management value.** This made affordable testing and accuracy near management thresholds clear priorities for sensor development. Measured detection errors and local agricultural data will help refine these priorities.

[Explore the Economic Model](/model-eco/)

Our [Docking](/model-docking/), [MD](/model-md/), and [ODE \& Dual-channel](/model-ode/) pages provide the detailed analyses behind these iterations.

## Goal 3: Engineering a usable test format {#engineering-goal-3-engineering-a-usable-test-format toc="Goal 3: Engineering a usable test format"}

A kit with a low barrier to use needs a manageable workflow as well as a biological response. We developed a paper-based format around three practical questions: which material could carry the cells, how to control their placement, and how to support color development after recovery.

### 3.1 Choosing the paper substrate {#engineering-iteration-3-1-choosing-the-paper-substrate toc="Choosing the paper substrate" toc-unnumbered}

**Design** - We looked for a substrate that could hold yeast and liquid while remaining easy to handle and consistent to prepare.

**Build** - We loaded yeast onto seven candidate materials and took them through freezing, drying, recovery, and elution. We then compared liquid uptake in three shortlisted substrates.

**Test** - The materials differed in cell retention, absorbency, and handling. GF/B glass-fiber paper combined favorable cell retention with high liquid-loading capacity.

**Learn** - **We selected GF/B as a suitable substrate for the test-strip prototype.** Its combination of cell retention, absorbency, and handling properties gave us a practical starting material. We then focused on controlling liquid spread and cell placement within a defined reaction area.

### 3.2 Controlling cell placement and loading {#engineering-iteration-3-2-controlling-cell-placement-and-loading toc="Controlling cell placement and loading" toc-unnumbered}

Direct spotting allowed liquid to spread sideways, while viscous cell suspensions made consistent dispensing difficult.

**Design** - We combined hydrophobic barriers with a revised protectant formulation and vacuum-assisted loading.

**Build** - We used masked vapor coating to leave circular hydrophilic regions on the paper, prepared the protectant mixture, and built a vacuum-assisted spotting device.

**Test** - Colored solutions demonstrated the defined wetting regions. The revised loading workflow was used to prepare cell-loaded, freeze-dried strips for subsequent recovery tests.

**Learn** - **We established a preparation workflow and produced cell-loaded, freeze-dried strips.** Bringing the substrate, protective formulation, and loading device together allowed us to move from material selection to recovery testing. The next round focused on obtaining a readable color after rehydration.

### 3.3 Improving conditions for color development {#engineering-iteration-3-3-improving-conditions-for-color-development toc="Improving conditions for color development" toc-unnumbered}

Preparing a dry strip was one step; obtaining a readable color after adding liquid was the next.

::::figuretext{side=right width=wide}

:::figure

[![Prototype test strips, a coating device, and colored solutions.](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-4-f4de7549d8.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-4-f4de7549d8.webp "Open full-resolution image")

Figure 4. Prototype test strips and colored solutions.

:::

<p><strong>Design</strong> - We examined recovery media and additives that could affect nutrient supply, wetting, and pigment stability.</p>

<p><strong>Build</strong> - We compared recovery in **synthetic complete (SC)** medium and **phosphate-buffered saline (PBS)**, then tested glucose, **tyrosine (Tyr)**, Tween 80, and ascorbic acid conditions. We quantified color using blue-channel image values.</p>

<p><strong>Test</strong> - Color development varied across treatments. Several Tyr–Tween 80 combinations and ascorbic acid treatments produced stronger yellow signals than the reference, while changing glucose concentration did not consistently improve the signal.</p>

::::

**Learn** - **We identified formulation conditions that strengthened the yellow readout.** These comparisons gave us a basis for refining the recovery solution alongside the strip itself. Further testing will assess whether the improved color development is consistent across prepared strips.

### 3.4 Designing around three user actions {#engineering-iteration-3-4-designing-around-three-user-actions toc="Designing around three user actions" toc-unnumbered}

::::figuretext{side=right width=wide}

:::figure

[![Figure 5. A test card designed for simpler use.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-55-4c447ce9cb96.webp)](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-55-4c447ce9cb96.webp "Open full-resolution image")

Figure 5. A test card designed for simpler use. The proposed workflow combines loading the soil extract, checking the quality-control region, and photographing the result, with dedicated control and sample regions and a color reference on the casing. Generated with OpenAI GPT Image 2.

:::

<p><strong>Design</strong> - Once the soil extract is ready, we aim to simplify testing to three actions: load, wait and check the quality-control region, then photograph. We designed a card with quality-control, negative-control, positive-control, and sample regions, using the existing hydrophobic barriers and a reservoir beneath the strip for loading in one pour.</p>

<p><strong>Build</strong> - We fabricated unit cassettes and positioned the strips from Iteration 3.2 for wetting from below. The design also includes reference colors on the casing for image correction; modular assembly remains the next construction step.</p>

<p><strong>Test</strong> - In the loading test, a single pour wetted all four regions evenly from below, with no observed liquid crossing the hydrophobic boundaries.</p>

::::

**Learn** - **The prototype supported a simpler loading step while maintaining distinct wetting regions.** This provided a practical basis for the three-action workflow. Further testing will evaluate the assembled device, control responses, and operation with real soil extracts.

Further material comparisons, preparation details, and recovery results are available on our [Results page](/results/).

<span id="src-Project-Engineering-53" class="legacy-section-anchor" aria-hidden="true"></span>
<span id="src-HP-Engineering-30" class="legacy-section-anchor" aria-hidden="true"></span>

## Goal 4: Refining the project for agricultural use {#engineering-goal-4-refining-the-project-for-agricultural-use toc="Goal 4: Refining the project for agricultural use"}

A useful screening kit needs to fit the decisions and routines of the people using it. HP helped us refine who NemaKlear could serve, when a result would be useful, and what the complete testing process would require.

Through questionnaires, expert discussions, field visits, and industry engagement, we developed a more specific project direction: a kit with a low barrier to use, designed to support screening before planting. This brought ease of operation, affordability, sample handling, and understandable results into our engineering criteria.

### 4.1 Defining when and why to use the kit {#engineering-iteration-4-1-defining-when-and-why-to-use-the-kit toc="Defining when and why to use the kit" toc-unnumbered}

We began with the idea of early warning. Stakeholder feedback helped us connect that broad aim to a concrete agricultural decision.

**Design** - We asked who might use the kit, when testing could influence management, and what information a grower would need from the result.

**Build** - We collected 369 questionnaire submissions, consulted plant-protection and related experts, and visited vegetable-growing sites in Tianjin. We discussed expectations for testing alongside existing management practices and everyday workloads.

**Test** - Respondents highlighted simple operation, reliable results, and affordability. Experts recommended connecting early detection to management before planting. Conversations with growers also showed that demand depends on local crops and field conditions, since nematodes are not the most pressing problem at every site.

**Learn** - **We refined NemaKlear’s positioning as an accessible screening tool for pre-planting management.** Stakeholder feedback made simple operation, affordable testing, and useful guidance central design requirements. The [Eco Model](/model-eco/) provided a way to examine the trade-offs behind these requirements, including when testing could change a management choice enough to justify its cost. Further engagement with growers and agricultural specialists will help ground these comparisons in local costs and practices.

### 4.2 Defining what a color result can tell the user {#engineering-iteration-4-2-defining-what-a-color-result-can-tell-the-user toc="Defining what a color result can tell the user" toc-unnumbered}

Moving toward real samples required us to examine how soil background and signal stability could affect the information carried by the readout.

**Design** - We examined the assumptions connecting a color change to signal composition, nematode density, and agricultural risk.

**Build** - We organized the questions into two areas: how the sample matrix affects the observed color, and how collection, storage, and molecular stability affect the signals entering the sensor. These questions guided discussions of sample controls, testing conditions, and model assumptions.

**Test** - Expert review highlighted possible interference from soil color and differences in the degradation of ascr#3 and ascr#18. These factors could alter the readout or the measured signal proportions, making sample conditions important to both experiments and downstream interpretation.

**Learn** - **We established a clearer framework for validating the meaning of the readout.** Signal detection, signal composition, density estimation, and risk assessment became distinct steps with their own evidence requirements. This helped align experimental controls with modeling assumptions; real-sample studies will determine which relationships hold under different sampling and storage conditions.

### 4.3 Extending the design to the whole testing process {#engineering-iteration-4-3-extending-the-design-to-the-whole-testing-process toc="Extending the design to the whole testing process" toc-unnumbered}

A low barrier to use depends on what happens before and after the sensing reaction as well as during it.

::::figuretext{side=right width=wide}

:::figure

[![Figure 6. From soil collection to disposal.](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-6-82a0893b5b.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-6-82a0893b5b.webp "Open full-resolution image")

Figure 6. From soil collection to disposal. The workflow brings sampling, recording, transport, laboratory handling, and disposal into one view. Generated with OpenAI GPT Image 2.

:::

<p><strong>Design</strong> - We expanded the workflow to include soil collection, sample preparation, storage and transport, result interpretation, and disposal. We considered sample traceability and safe handling of engineered yeast alongside operational convenience.</p>

<p><strong>Build</strong> - We organized soil collection and produced a sampling guidance video. Sample identifiers linked soil samples to information such as crop, location, collection date, and treatment history, giving subsequent studies a record of their agricultural context.</p>

::::

**Test** - Field visits and expert discussions highlighted differences between plots and greenhouses, as well as the need for clear sampling instructions, complete background information, and appropriate handling of separate samples. This review broadened our evaluation beyond the strip to equipment, consumables, storage, and handover requirements.

**Learn** - **We developed a traceable sampling approach and a fuller set of workflow requirements.** These provided a basis for assessing whether the kit could fit practical use. The next step is to test the complete process with real samples and users, including preparation, handling, and disposal instructions.

Industry engagement also helped us prepare for that next stage. Project presentations and discussions with companies secured research support, including sponsorship from ExCell Bio. Building on these contacts, we plan to seek partners for sample access, prototype evaluation, and testing in relevant agricultural settings.

Further stakeholder discussions and engagement activities are described on our [HP pages](/human-practices/).

## The next DBTL cycle — bringing the system together {#engineering-the-next-dbtl-cycle-bringing-the-system-together toc="The next DBTL cycle — bringing the system together"}

Our iterations produced genetically verified pathway components, receptor candidates, a connected modeling framework, and freeze-dried test-strip prototypes. HP gave these developments a more specific purpose: supporting pre-planting screening through a workflow that users can manage and results they can understand.

The next cycle will test these elements together. Ligand-response experiments and mixed samples will connect measured colors to the models. Real soil samples will help evaluate background effects and sample preparation, while user trials will examine handling, waiting time, cost, and interpretation. These results will guide the next revisions to both the kit and its intended use.

</div>
