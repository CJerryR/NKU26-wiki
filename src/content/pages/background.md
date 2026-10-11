---
title: Background
heading: Background
sub: ''
description: ''
crumbs:
  - Project
  - Background
search: true
route: background
meta: {}
draft: false
hidden: false
---
Turning chemical signals released by nematodes into detection information that supports agricultural management requires connecting receptor recognition, intracellular signal transduction, and colorimetric output, then interpreting the crop risks and management choices associated with the results.

## Docking: From Natural Sensing Mechanisms to Receptor Engineering {#docking-from-natural-sensing-mechanisms-to-receptor-engineering toc="Docking: From Natural Sensing Mechanisms to Receptor Engineering"}

### Ascaroside Signals and the Two-Channel Design {#ascaroside-signals-and-the-two-channel-design toc="Ascaroside Signals and the Two-Channel Design"}

Ascarosides are a group of chemical signals released by nematodes. Manosalva et al. detected ascr#18 in cultures of several plant-parasitic nematode species. It was prominent in the secretion profiles of the infective juveniles of the root-knot nematodes examined, while its detection differed in adult samples. Ascr#18 is also not exclusive to plant-parasitic nematodes. [B01]

This project aims to establish two channels based on differential responses to ascr#18 and ascr#3 and to investigate how the two responses and their ratio relate to plant-parasitic nematode abundance. Quantitative interpretation of the signals requires consideration of species, developmental stage, and sampling conditions, together with concentration-to-readout calibration.

### Sensing, Localization, and Signaling Connections of Fungal Receptors {#sensing-localization-and-signaling-connections-of-fungal-receptors toc="Sensing, Localization, and Signaling Connections of Fungal Receptors"}

Nematode-trapping fungi can sense ascarosides and initiate processes associated with predation. [1] The G protein-coupled receptors (GPCRs) considered in this project include Gpr2, Gpr3, and GprC. Their sensing functions and downstream signaling have been investigated in different fungal systems. [B02, B03]

Kuo et al. studied Gpr2 and Gpr3 in the nematode-trapping fungus *Arthrobotrys oligospora*. Both ascr#3 and ascr#7 induced internalization of these receptors. Following overexpression of GPR2 or GPR3, trap formation induced by either ascaroside was higher than in the corresponding WT controls. [B02, Figures 2 and 3]

The study also used heterologous coexpression and co-immunoprecipitation in *Saccharomyces cerevisiae* to observe interactions of Gpr2 and Gpr3 with Gpa2. In the fungus, constitutively active Gpa2 (Q208L) increased trap formation in the gpr2 deletion strain under ascr#3 and ascr#7 exposure, whereas the corresponding comparisons in the gpr3 deletion background showed no significant increase. [B02, Figure 4]

Hu et al. observed differences in GprC localization in *Arthrobotrys flagrans* depending on expression conditions and hyphal region. Under the strong oliC promoter, GprC–GFP predominantly showed mitochondrial localization. Under the native promoter, mitochondrial signals were visible at hyphal tips, while plasma membrane localization was observed in regions farther from the tips. The study also found that nematode exposure increased the oxygen consumption rate of WT, whereas gprC or gasA deletion strains did not show the corresponding oxygen consumption response. [B03, Figures 2 and 3]

This project aims to connect recognition signals from natural receptors to the yeast pheromone mitogen-activated protein kinase (MAPK) pathway. Establishing this connection requires examining receptor localization in yeast and coupling to G proteins.

### Engineering Differential Responses to Two Ligands and Comparing Receptor Structures {#engineering-differential-responses-to-two-ligands-and-comparing-receptor-structures toc="Engineering Differential Responses to Two Ligands and Comparing Receptor Structures"}

Designing differential responses to two ligands requires further investigation of which receptor positions the two ascarosides may contact and whether changing the relevant side chains can affect recognition. Molecular docking generates candidate poses for a given receptor structure, search region, and ligand chemical state, then ranks them using an approximate scoring function. Interaction fingerprints (IFPs) describe the contacting residues and interaction types within these candidate poses. Combining scores with contact distributions allows us to propose substitution hypotheses aimed at differences between the two ligands. [B04, B05; 4–5]

Cross-receptor comparison also involves identifying structural correspondence despite low sequence similarity. DAF-37 and SRBC-64 come from *Caenorhabditis elegans* and have low overall sequence similarity to the fungal receptors in this project. Hu et al. combined transmembrane helices TM1–4 from nematode receptors with TM5–7 from GprC and tested the resulting constructs in an *A. flagrans* gprC deletion background. Chimeric receptors containing segments from SRBC-64, SRBC-66, or DAF-38 restored trap formation, whereas the construct containing the DAF-37 segment did not produce the same recovery. [B03, Figure 4]

We included DAF-37 and SRBC-64 alongside Gpr2, Gpr3, and GprC to investigate whether recurring ligand-contact positions could be identified among receptors with low sequence similarity and whether these positions could be mapped to one another in sequence and structure.

## MD: From Binding Poses to Dynamic Behavior {#md-from-binding-poses-to-dynamic-behavior toc="MD: From Binding Poses to Dynamic Behavior"}

Static poses generated by docking provide starting points for dynamic studies. For membrane receptors, it is also necessary to examine how ligand position changes with receptor motion and whether contacts in the candidate poses persist or rearrange.

Molecular dynamics (MD) uses a force field to describe molecular interactions and simulate molecular motion over a defined period. Combining protein force fields with membrane-system construction methods allows receptor–ligand conformational changes to be studied in a lipid bilayer, solvent, and ionic environment. [7–8] Within the selected starting systems and sampling scope, this project examines these changes by jointly analyzing receptor motion and local ligand behavior. [B12]

## ODE: From Receptor Activation to a Colorimetric Response {#ode-from-receptor-activation-to-a-colorimetric-response toc="ODE: From Receptor Activation to a Colorimetric Response"}

Ligand recognition is the starting point of the sensor response, while colorimetric output also depends on the G protein cycle, downstream signaling, and the reporter module. Quantitative studies of the yeast G protein cycle and pheromone pathway provide kinetic models for these processes. GPCR engineering studies further show that the configurations of the receptor, G protein, and output modules jointly influence the system response. [9–11] Research connecting GPCR signaling to GAL output through synthetic transcription factors provides further guidance for constructing a signaling chain from receptor activation to color development. [12–13]

This project uses ordinary differential equations (ODEs) and effective response relationships to connect receptor activation with color development. Modeling requires selecting which dynamic steps to retain according to the research question and the observations available from experiments, while combining intermediate processes that are difficult to measure separately. Published models provide reaction structures that can inform the model, while specific parameters are calibrated using the project’s constructs and experimental readouts.

## Economic Benefit Modeling: From Detection Information to Management Decisions {#economic-benefit-modeling-from-detection-information-to-management-decisions toc="Economic Benefit Modeling: From Detection Information to Management Decisions"}

The practical value of detection information depends on whether it helps users select appropriate management measures. The relationship between nematode population density and crop losses can support risk assessment. Resources on root-knot nematode management in tomatoes further connect expected yield losses, crop value, and treatment costs to compare management options. [14–15]

Economic evaluation requires comparing testing costs, management measures, and potentially avoidable losses within the same scenario, while accounting for differences in region, crop, and conditions of use. [16] On this basis, the project examines whether detection information helps distinguish risk levels and adjust management measures, and feeds requirements for detection capability, sampling strategy, and result presentation back into system design.

## References {#references toc="References"}

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
