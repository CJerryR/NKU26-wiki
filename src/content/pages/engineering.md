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
meta: {}
draft: false
hidden: false
---
## DBTL-1：Engineering of Signaling Response Pathway {#dbtl-1-engineering-of-signaling-response-pathway toc="DBTL-1：Engineering of Signaling Response Pathway"}

### The First Cycle——Dry Lab {#the-first-cycle-dry-lab toc="The First Cycle——Dry Lab"}

The yeast sensor is intended to establish two channels based on differential responses to ascr#18 and ascr#3. To select recognition elements suitable for further engineering, we first considered G protein-coupled receptors (GPCRs) involved in fungal ascaroside sensing: Gpr2 and Gpr3 from *Arthrobotrys oligospora*, and GprC from *Arthrobotrys flagrans*. Their natural sensing functions provided a basis for selecting them as candidates, while their localization and integration with signaling pathways in yeast required investigation for heterologous use. [B02, B03]

#### Preliminary Receptor Comparisons and Substitution Studies {#preliminary-receptor-comparisons-and-substitution-studies toc="Preliminary Receptor Comparisons and Substitution Studies"}

Our preliminary work compared docking results for each of the three receptors with ascr#18, ascr#3, and ascr#7. We combined these comparisons with literature references, checks using multiple random seeds, and preliminary alanine (Ala) scanning to examine WT docking behavior and the computational changes caused by residue substitutions.

The preliminary Ala scan also produced substantial perturbations in the negative control. This prompted us to reconsider whether the observed changes could effectively distinguish the receptors’ engineering potential and whether alanine substitution alone was sufficient to support that assessment. We therefore performed additional saturation substitution tests on GprC, extending the comparison to a wider range of amino acid substitutions.

#### Selecting the Receptor for Engineering and Establishing the Source of Gpr2 {#selecting-the-receptor-for-engineering-and-establishing-the-source-of-gpr2 toc="Selecting the Receptor for Engineering and Establishing the Source of Gpr2"}

Localization characteristics influenced our engineering decision for GprC. Hu et al. observed plasma membrane- and mitochondria-associated localization of GprC in *A. flagrans*, with its distribution varying according to expression conditions and hyphal region. [B03] Because this feature could increase the complexity of localization and signaling integration during heterologous expression in yeast, we excluded GprC from this round of yeast receptor engineering. We retained GprC in the structural comparisons to analyze ligand contacts and residue correspondence among the fungal receptors.

Subsequent engineering focused on Gpr2, while work on Gpr3 and its mutants continued.

Once the target receptor had been selected, the next question was whether Gpr2 could be expressed and achieve the intended localization in the chosen yeast chassis.

### The Second Cycle——Dry Lab {#the-second-cycle-dry-lab toc="The Second Cycle——Dry Lab"}

To investigate the differential recognition of ascr#18 and ascr#3 by Gpr2, we explored whether side-chain substitutions could alter the positioning and interactions of the two ligands.

#### Preparing the Receptor for Docking {#preparing-the-receptor-for-docking toc="Preparing the Receptor for Docking"}

Segments were removed from the predicted Gpr2 structure before docking. The same segments were removed from the WT and mutant structures, and residue numbering from the full-length sequence was retained. Subsequent scoring and contact analyses were based on these processed structures.

### The Third Cycle——Wet Lab {#the-third-cycle-wet-lab toc="The Third Cycle——Wet Lab"}

Informed by results from the prior cycle, this iteration characterizes heterologous expression and proper plasma membrane localization of GPR2, establishing proof of feasibility for downstream chassis engineering.

#### Design {#design toc="Design"}

To validate heterologous expression and proper plasma membrane localization of GPR2 in our host strain *S. cerevisiae* CEN.PK2-1C, we adopted the following experimental pipeline: assembly of the GPR2-sfGFP expression plasmid, gene knock-in mediated by yeast homologous recombination (HR), and fluorescence microscopy to characterize protein expression and subcellular localization. See Wet Lab-Results- DBTL-1 for detailed design and experimental protocols.

#### Build {#build toc="Build"}

Via homologous recombination (HR), we integrated the constitutive *GPR2-sfGFP* expression cassette into the CEN.PK2-1C genome (Figure 1).

:::figure

![Figure 1 Yeast transformation of GPR2‑sfGFP construct](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-65db15fab465-fig1-3-1.avif)

Figure 1 Yeast transformation of GPR2‑sfGFP construct

:::

#### Test {#test toc="Test"}

:::warning[Data status]

The wet-lab team has reported that the culture medium in part of the fluorescence experiments was prepared incorrectly, and those experiments are being repeated. Until the team confirms which fluorescence results are affected, the GPR2-sfGFP localization results in this section (fluorescence microscopy, CFW and FM4-64 staining) and the conclusion drawn from them are provisional.

:::

Following gene knock-in, we visualized three groups of yeast under fluorescence microscopy: unstained cells (Figure 2), cell wall-stained yeast (Figure 3), and plasma membrane-stained yeast (Figure 4).

Distinct GFP fluorescence signals were detected at the cell periphery in unstained yeast.

:::figure

![Figure 2 Fluorescence microscopy results](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ad5d098cc617-fig1-3-2.avif)

Figure 2 Fluorescence microscopy results

:::

For CFW-labelled yeast, the green GFP signal localizes to the cytoplasmic side of the blue CFW fluorescence.

:::figure

![Figure 3 Calcofluor‑White (CFW) staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-f9ddc932c78a-fig1-3-3.avif)

Figure 3 Calcofluor‑White (CFW) staining of yeast cells

:::

In FM4-64-labelled yeast, the green GFP fluorescence and red FM4-64 signal co-localize on the vacuolar membrane following endocytosis.

:::figure

![Figure 4 FM4‑64 staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-03753b902e9a-fig1-3-4.avif)

Figure 4 FM4‑64 staining of yeast cells

:::

#### Learn {#learn toc="Learn"}

Collectively, these data confirm heterologous expression and proper plasma membrane localization of GPR2 in CEN.PK2-1C, laying an essential foundation for our chassis engineering. We therefore advance to the next cycle to assemble the full signal-responsive engineered strain.

### The Fourth Cycle——Wet Lab {#the-fourth-cycle-wet-lab toc="The Fourth Cycle——Wet Lab"}

Building upon findings from prior iterations, this cycle launches the chassis engineering of our signal-responsive pathway.

#### Design {#design-2 toc="Design"}

Referring to previous work reported by Fan et al. [1][2], we assembled the ascaroside-sensitive yeast biosensor according to the pipeline illustrated in Figure 1.

:::figure

![Figure 1 Schematic Diagram of Yeast Biosensor Construction Pipeline](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-0a2876570655-fig1-4-1.avif)

Figure 1 Schematic Diagram of Yeast Biosensor Construction Pipeline

:::

#### Build {#build-2 toc="Build"}

First, we knocked out the *Gal80* gene in CEN.PK2-1C to obtain the engineered strain NKU-Y02 (Figure 2), which eliminates endogenous signal interference in this pathway.

::::figures

:::figure

![Figure 2 Knockout of the *Gal80* Gene](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-dbd29273fd22-fig1-4-2.avif)

Figure 2 Knockout of the *Gal80* Gene

:::

:::figure

![Figure 3 Construction of Synthetic Transcription Factor](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-7c829241bfa9-fig1-4-3.avif)

Figure 3 Construction of Synthetic Transcription Factor

:::

::::

Subsequently, we fused the PRD domain of Ste12 (216–688 aa) with the DBD domain of Gal4 (1–147 aa) to construct a synthetic transcription factor (sTF). This construct was transformed into NKU-Y05, yielding strain NKU-Y05 (Figure 3) and enabling the coupling of GPCR-activated signaling with the GAL pathway.

Subsequently, we introduced MjDOD and BvCYP76AD5 driven by the bidirectional Gal1/10 promoter into NKU-Y05 to generate the engineered strain NKU-Y06 (Figure 4), realizing the visualization of signal output.

Finally, we transformed the constitutive *GPR2* expression cassette into NKU-Y06 to obtain the engineered strain NKU-Y07 (Figure 5), completing the preliminary construction of the full engineered strain system and advancing the project to the testing phase.

### References {#references toc="References"}

Fan C, Yuan J. Reshaping the yeast galactose regulon via GPCR signaling cascade. Cell Rep Methods. 2023 Dec 18;3(12):100647. doi: 10.1016/j.crmeth.2023.100647. Epub 2023 Nov 20. PMID: 37989311; PMCID: PMC10753199.

Cong Fan, Nike He, Jifeng Yuan, Cascaded amplifying circuit enables sensitive detection of fungal pathogens, Biosensors and Bioelectronics, Volume 250, 2024, 116058, ISSN 0956-5663, [https://doi.org/10.1016/j.bios.2024.116058](https://doi.org/10.1016/j.bios.2024.116058).

## DBTL-2：Engineering Receptor Specificity and Establishing Pathway Models {#dbtl-2-engineering-receptor-specificity-and-establishing-pathway-models toc="DBTL-2：Engineering Receptor Specificity and Establishing Pathway Models"}

### The First Cycle——Dry Lab {#the-first-cycle-dry-lab-2 toc="The First Cycle——Dry Lab"}

#### Candidate Sites and Single-Site Substitutions {#candidate-sites-and-single-site-substitutions toc="Candidate Sites and Single-Site Substitutions"}

We compared the predicted contact distributions of WT with the two ligands and selected seven candidate sites for substitution.

The initial multisite alanine substitutions worsened the docking scores for both ligands. We then separated the combination into single-site substitutions to examine the effect of each site. At four of these sites, we designed 19 amino acid substitutions per site, producing 76 single-mutant designs for saturation screening. Screening combined changes in docking scores relative to WT for both ligands with contact analysis to examine how different substitutions affected the two-ligand profile.

#### Exploring Mutation Combinations and Setting Priorities {#exploring-mutation-combinations-and-setting-priorities toc="Exploring Mutation Combinations and Setting Priorities"}

Based on the single-mutant results, we selected 14 single-mutant parents and designed 18 double mutants to explore the combined effects of substitutions at different sites. These were compared with the corresponding single mutants. The combination designs were not prioritized for further development, and subsequent work continued to focus on single-site engineering.

#### Selecting Single-Mutant Candidates {#selecting-single-mutant-candidates toc="Selecting Single-Mutant Candidates"}

The single-mutant candidates selected for subsequent dynamic studies were N84V and V368R.

### The Second Cycle——Dry Lab {#the-second-cycle-dry-lab-2 toc="The Second Cycle——Dry Lab"}

Docking provides static candidate poses ranked by an approximate scoring function within a specified receptor structure and search region. We further examined how these poses behaved dynamically in a membrane environment: how ligand position changed with receptor motion, whether predicted contacts persisted, and whether contacts rearranged. To address these questions, we used molecular dynamics (MD), in which a force field describes molecular interactions, to simulate the selected complexes in a lipid bilayer, solvent, and ionic environment. [B04; 7–8]

#### From Docking Poses to Full-Length Membrane Systems {#from-docking-poses-to-full-length-membrane-systems toc="From Docking Poses to Full-Length Membrane Systems"}

The comparison included six complexes: WT, N84V, and V368R, each paired with ascr#18 or ascr#3. Each complex used its corresponding receptor structure and initial ligand pose.

These ligand poses came from docking against the structures with deleted segments described in Section 2.2. Because the MD systems used full-length receptors, the selected poses and their corresponding full-length structures had to be placed in a common coordinate reference so that the spatial relationships between the restored segments and the ligands could be checked. Reintroducing local structures that had been absent during docking could create geometric clashes with the selected poses.

We attempted loop rebuilding for a local covering loop region, or lid. The original approach also changed parts of the backbone outside the loop or the initial ligand pose in some systems, confounding the local loop adjustment with other structural changes. We discontinued the use of these rebuilt controls, retained each combination’s own starting structure, and proposed an approach that would rebuild only the local loop while keeping the ligand pose and coordinates outside the loop fixed.

#### Comparing the Dynamics of WT and Single Mutants {#comparing-the-dynamics-of-wt-and-single-mutants toc="Comparing the Dynamics of WT and Single Mutants"}

Trajectory analysis focused on ligand position relative to the receptor and the persistence and rearrangement of key contacts, with receptor motion used to interpret local changes. We compared the same ligand in WT and single-mutant receptors, as well as contact changes for the two ligands within the same receptor, to examine how the differences observed in docking appeared in dynamic simulations.

#### Functional Testing and Feedback {#functional-testing-and-feedback toc="Functional Testing and Feedback"}

Functional testing of the mutant candidates is intended to compare the responses of WT and the candidates to ascr#18 and ascr#3. Expression, localization, and overall signaling-function controls will also be used to distinguish differences in recognition of the two ligands from changes in overall receptor function.

### The Third Cycle——Dry Lab {#the-third-cycle-dry-lab toc="The Third Cycle——Dry Lab"}

#### Design | Building the Initial Model from Seven Nodes {#design-building-the-initial-model-from-seven-nodes toc="Design \| Building the Initial Model from Seven Nodes"}

We aimed to connect ligand recognition with colorimetric output through modeling, understand how signals propagate along the pathway, and identify which steps require constraints from experimental data. To do this, we organized the system into seven nodes:

Ligand input L → receptor activity R_active → G protein G(t) → MAPK M(t) → synthetic transcription factor activity TF → GAL product formation rate Prod → colorimetric signal C(t).

Drawing on mechanistic descriptions in the literature, we used ordinary differential equations to track the dynamics of G protein, MAPK, and the colorimetric signal, while Hill-type or other saturating algebraic relationships connected the remaining steps. The initial model reduced the multistage MAPK reactions to a single effective dynamic state, retaining the overall activation and recovery behavior.

#### Build | Implementing a Runnable Normalized Prototype {#build-implementing-a-runnable-normalized-prototype toc="Build \| Implementing a Runnable Normalized Prototype"}

We implemented a model solver, configurable parameter files, and time-course outputs so that the pathway description could be simulated under explicitly defined example conditions. We also documented parameter sources and the corresponding experimental measurement requirements, preparing the model for the later incorporation of project-specific data.

At this stage, we used normalized inputs and example parameters to examine model behavior, compare modeling assumptions, and identify additional data needs.

#### Test | Checking Dynamic Behavior and Parameter Measurability {#test-checking-dynamic-behavior-and-parameter-measurability toc="Test \| Checking Dynamic Behavior and Parameter Measurability"}

We performed numerical checks on the prototype and independently ran and checked relevant published models to compare the pathway behaviors that different structures could describe. These checks showed that the original G protein–MAPK equations could not produce a decline after a peak under constant input, zero initial conditions, and nonnegative parameters. This prompted us to examine which mechanisms the intermediate module would need to retain to describe pathway adaptation or feedback.

We also examined the output layer in relation to the readouts available from wet-lab experiments. If the final colorimetric signal is the main measurement, the gains and thresholds across multiple response layers are difficult to determine separately. We therefore combined the original equations for sTF, GAL production rate, and color accumulation and completed algebraic equivalence checks. With a fixed copy number and under the assumptions of the original model, the combined colorimetric equation preserved the original input-output relationship while reducing the number of parameters that needed to be determined separately.

#### Learn | Retaining Essential Dynamics and Combining Steps That Are Difficult to Measure Independently {#learn-retaining-essential-dynamics-and-combining-steps-that-are-difficult-to-measure-independently toc="Learn \| Retaining Essential Dynamics and Combining Steps That Are Difficult to Measure Independently"}

This round of work led us to revise the structure planned for the next model version: use an effective input to represent the receptor’s drive on downstream signaling, draw on a checked signaling module from the literature, and connect it to the output through the combined colorimetric equation. The details retained in the model will be determined jointly by the research question, mechanistic evidence, and the extent to which experimental data can constrain them.

The normalized prototype, the derivation of the combined output equation, and the equivalence checks have been completed. Final selection of the literature module, integration of the simplified model into the main solver, and calibration against project wet-lab data are still underway. In the next iteration, we will calibrate parameters using actual construct information and measurements and assess whether response delays or pathway recovery mechanisms need to be added.

## DBTL-3：Social Practical Impact Feedback {#dbtl-3-social-practical-impact-feedback toc="DBTL-3：Social Practical Impact Feedback"}

**Economic Benefit Model: From Detection Results to Management Decisions**

#### Design | Assessing Whether Detection Information Can Support Action {#design-assessing-whether-detection-information-can-support-action toc="Design \| Assessing Whether Detection Information Can Support Action"}

Our initial question was whether detecting nematode signals would provide enough information to help growers choose management measures. We aimed to compare testing costs with potentially avoidable losses and then examine the decision-making value of different types of detection information.

#### Build | Establishing Cost Calculations and Management Scenarios {#build-establishing-cost-calculations-and-management-scenarios toc="Build \| Establishing Cost Calculations and Management Scenarios"}

We first developed a general cost calculation framework that converts yield losses associated with nematode density into economic losses per unit area and compares costs and net benefits across management scenarios.

Our preliminary analysis indicated that a simple negative or positive result could not adequately reflect differences in risk at different densities. We therefore introduced three risk levels: low, medium, and high. These corresponded to no targeted control, moderate-intensity treatment, and high-intensity treatment, respectively, allowing us to compare risk-based management with uniform treatment.

#### Test | Examining the Added Value of Density Information {#test-examining-the-added-value-of-density-information toc="Test \| Examining the Added Value of Density Information"}

Using the example of greenhouse tomatoes in Spain, we compared treatment levels selected according to density with a uniform moderate-intensity treatment strategy. The example analysis showed that, under the corresponding assumptions, density information could help adjust treatment intensity and yield additional expected net benefits.

This comparison also helped distinguish the contributions of detection information and control measures. An improvement relative to no control includes the effect of treatment itself. Assessing the value of detection therefore also requires examining whether the information helps users make more appropriate management choices.

#### Learn | Translating Management Needs into Detection System Design Requirements {#learn-translating-management-needs-into-detection-system-design-requirements toc="Learn \| Translating Management Needs into Detection System Design Requirements"}

This round of analysis clarified our design objectives for the detection output: provide semiquantitative or quantitative information that supports risk classification wherever possible, cover the key ranges in which management choices change, and communicate sampling and measurement uncertainty when results fall close to classification thresholds.

We also expanded the presentation of model results from a single return-on-investment metric to include measured density, expected yield loss, risk level, the treatment strategy in each scenario, testing costs, and comparisons of net benefits. These outputs provided a basis for discussing the product’s quantitative capabilities, sampling strategy, and intended application settings.

We will update the model using detection performance and sampling error measured in wet-lab experiments, along with local prices, testing costs, and willingness to pay identified through Human Practices (HP) research. We will then reassess whether these design requirements hold under practical use conditions.

## References {#references-2 toc="References"}

### Docking and Receptor Recognition {#docking-and-receptor-recognition toc="Docking and Receptor Recognition"}

B01. Manosalva P, Manohar M, von Reuss SH, et al. Conserved nematode signalling molecules elicit plant defenses and pathogen resistance. *Nature Communications.* 2015;6:7795. DOI: [10.1038/ncomms8795](https://doi.org/10.1038/ncomms8795).

B02. Kuo C-Y, Tay RJ, Lin H-C, et al. The nematode-trapping fungus Arthrobotrys oligospora detects prey pheromones via G protein-coupled receptors. *Nature Microbiology.* 2024;9:1738–1751. DOI: [10.1038/s41564-024-01679-w](https://doi.org/10.1038/s41564-024-01679-w).

B03. Hu X, Hoffmann DS, Wang M, et al. GprC of the nematode-trapping fungus Arthrobotrys flagrans activates mitochondria and reprograms fungal cells for nematode hunting. *Nature Microbiology.* 2024;9:1752–1763. DOI: [10.1038/s41564-024-01731-9](https://doi.org/10.1038/s41564-024-01731-9).

B04. AutoDock Vina developers. *AutoDock Vina Documentation: Frequently Asked Questions.* Accessed October 7, 2026. Relevant entries: “How accurate is AutoDock Vina?”; “How big should the search space be?”; “Why do I not get the correct bound conformation?”

B05. Bouysset C, Fiorucci S. ProLIF: a library to encode molecular interactions as fingerprints. *Journal of Cheminformatics.* 2021;13:72. DOI: [10.1186/s13321-021-00548-6](https://doi.org/10.1186/s13321-021-00548-6).

B06. Meeko authors, Forli Lab. *Meeko Documentation: Exporting docking results.* Accessed October 7, 2026. Relevant content: SMILES and index mapping in PDBQT files, SDF export, and dependence on structural metadata.

B07. Abramson J, Adler J, Dunger J, et al. Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature.* 2024;630:493–500. DOI: [10.1038/s41586-024-07487-w](https://doi.org/10.1038/s41586-024-07487-w).

B08. Katoh K, Standley DM. MAFFT multiple sequence alignment software version 7: improvements in performance and usability. *Molecular Biology and Evolution.* 2013;30(4):772–780. DOI: [10.1093/molbev/mst010](https://doi.org/10.1093/molbev/mst010).

B09. Edgar RC. Muscle5: High-accuracy alignment ensembles enable unbiased assessments of sequence homology and phylogeny. *Nature Communications.* 2022;13:6968. DOI: [10.1038/s41467-022-34630-w](https://doi.org/10.1038/s41467-022-34630-w).

B10. Zhang C, Shine M, Pyle AM, Zhang Y. US-align: universal structure alignments of proteins, nucleic acids, and macromolecular complexes. *Nature Methods.* 2022;19:1109–1115. DOI: [10.1038/s41592-022-01585-1](https://doi.org/10.1038/s41592-022-01585-1).

B11. Söding J. Protein homology detection by HMM–HMM comparison. *Bioinformatics.* 2005;21(7):951–960. DOI: [10.1093/bioinformatics/bti125](https://doi.org/10.1093/bioinformatics/bti125).

B12. Reliability and reproducibility checklist for molecular dynamics simulations. Editorial. *Communications Biology.* 2023;6:268. DOI: [10.1038/s42003-023-04653-0](https://doi.org/10.1038/s42003-023-04653-0).

[1] Hsueh Y-P, Mahanti P, Schroeder FC, Sternberg PW. Nematode-Trapping Fungi Eavesdrop on Nematode Pheromones. *Current Biology.* 2013;23:83–86. [Article](https://doi.org/10.1016/j.cub.2012.11.035)

[2] Kuo C-Y, et al. The nematode-trapping fungus Arthrobotrys oligospora detects prey pheromones via G protein-coupled receptors. *Nature Microbiology.* 2024;9:1738–1751. [Article](https://doi.org/10.1038/s41564-024-01679-w)

[3] Hu X, et al. GprC of the nematode-trapping fungus Arthrobotrys flagrans activates mitochondria and reprograms fungal cells for nematode hunting. *Nature Microbiology.* 2024;9:1752–1763. [Article](https://doi.org/10.1038/s41564-024-01731-9)

[4] Trott O, Olson AJ. AutoDock Vina: Improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading. *Journal of Computational Chemistry.* 2010;31:455–461. [Article](https://doi.org/10.1002/jcc.21334)

[5] Eberhardt J, Santos-Martins D, Tillack AF, Forli S. AutoDock Vina 1.2.0: New Docking Methods, Expanded Force Field, and Python Bindings. *Journal of Chemical Information and Modeling.* 2021;61:3891–3898. [Article](https://doi.org/10.1021/acs.jcim.1c00203)

[6] Bouysset C, Fiorucci S. ProLIF: a library to encode molecular interactions as fingerprints. *Journal of Cheminformatics.* 2021;13:72. [Article](https://doi.org/10.1186/s13321-021-00548-6)

### MD and Membrane System Simulations {#md-and-membrane-system-simulations toc="MD and Membrane System Simulations"}

[7] Huang J, et al. CHARMM36m: an improved force field for folded and intrinsically disordered proteins. *Nature Methods.* 2017;14:71–73. [Article](https://doi.org/10.1038/nmeth.4067)

[8] Feng S, Park S, Choi YK, Im W. CHARMM-GUI Membrane Builder: Past, Current, and Future Developments and Applications. *Journal of Chemical Theory and Computation.* 2023;19:2161–2185. [Article](https://doi.org/10.1021/acs.jctc.2c01246)

### ODE Modeling and Signal Output {#ode-modeling-and-signal-output toc="ODE Modeling and Signal Output"}

[9] Yi T-M, Kitano H, Simon MI. A quantitative characterization of the yeast heterotrimeric G protein cycle. *Proceedings of the National Academy of Sciences.* 2003;100:10764–10769. [Article](https://doi.org/10.1073/pnas.1834247100)

[10] Kofahl B, Klipp E. Modelling the dynamics of the yeast pheromone pathway. *Yeast.* 2004;21:831–850. [Article](https://doi.org/10.1002/yea.1122)

[11] Shaw WM, et al. Engineering a Model Cell for Rational Tuning of GPCR Signaling. *Cell.* 2019;177:782–796.e27. [Article](https://doi.org/10.1016/j.cell.2019.02.023)

[12] Fan C, Yuan J. Reshaping the yeast galactose regulon via GPCR signaling cascade. *Cell Reports Methods.* 2023;3:100647. [Article](https://doi.org/10.1016/j.crmeth.2023.100647)

[13] Fan C, He N, Yuan J. Cascaded amplifying circuit enables sensitive detection of fungal pathogens. *Biosensors and Bioelectronics.* 2024;250:116058. [Article](https://doi.org/10.1016/j.bios.2024.116058)

### Economic Benefit Modeling and Management Decisions {#economic-benefit-modeling-and-management-decisions toc="Economic Benefit Modeling and Management Decisions"}

[14] FAO. Nematode population dynamics, threshold levels and estimation of crop losses. [Original source](https://www.fao.org/4/V9978E/v9978e07.htm)

[15] UC Statewide Integrated Pest Management Program. Root-Knot Nematode: Tomato Pest Management Guidelines.
