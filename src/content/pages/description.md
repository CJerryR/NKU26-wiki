---
title: Description
heading: Description
sub: ''
description: ''
route: description
crumbs:
  - Project
  - Description
search: true
meta: {}
draft: false
hidden: false
---
## 1 Background {#background toc="Background"}

### 1.1 Silent Killers Underground: The Urgent Threat of Plant-Parasitic Nematodes {#11-silent-killers-underground-the-urgent-threat-of-plant-parasitic-nematodes toc="Plant-Parasitic Nematodes"}

**Plant-parasitic nematodes** are among the most destructive pathogens in global agricultural production. Widely distributed in cultivated soils, they parasitize plant roots, disrupt nutrient uptake pathways and trigger secondary diseases, posing severe threats to crop yield and quality. Statistically, plant-parasitic nematodes cause up to 157 billion dollars in annual crop losses worldwide across more than 20 major cash crops\[1]. Among them, sedentary endoparasitic nematodes represent the most harmful group due to their unique parasitic lifestyle, strong dispersal capacity and difficult control\[2]. As two representative species, Heterodera glycines and Meloidogyne incognita exhibit typical taxonomic and biological features. They continuously endanger the production of globally critical crops and serve as core model organisms for research on soil nematode management (Figure 1).

:::figure{scale=70}

![Figure 1. Symptoms of two major plant-parasitic nematodes on soybean roots. (a) Meloidogyne incognita: obvious root galls formed on infected soybean roots. (b) Heterodera glycines: white lemon-shaped mature females protruding from soybean roots (arrows). Note that soybean cyst nematode does not form root galls.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-a69f0a5adee6-fig1.avif)

Figure 1. Symptoms of two major plant-parasitic nematodes on soybean roots. (a) Meloidogyne incognita: obvious root galls formed on infected soybean roots. (b) Heterodera glycines: white lemon-shaped mature females protruding from soybean roots (arrows). Note that soybean cyst nematode does not form root galls. Source: Management of Plant-Parasitic Nematodes in Florida Soybean Production (NG018), UF/IFAS EDIS. Used for educational demonstration only.

:::

Plant-parasitic nematodes of these two species exert substantial economic and ecological impacts. Heterodera glycines specifically parasitizes legumes such as soybean and common bean. After **second-stage juveniles (J2)** invade host roots, they secrete effectors to induce syncytial feeding sites, which leads to root lignification, stunting and chlorosis of plants. In heavily infested fields, soybean yield losses can reach 30%–80% or even total crop failure. The cysts of this nematode can remain dormant in soil for more than 10 years, serving as persistent primary inoculum sources that are hard to eradicate, making it the most devastating disease in major soybean-producing regions worldwide\[3].

As a polyphagous sedentary endoparasitic nematode, Meloidogyne incognita infects over 3000 plant species including vegetables, grain and cash crops such as tomato, cucumber, cotton and maize\[4]. Losses caused by this nematode are especially severe in protected agriculture due to continuous cropping obstacles. Notably, M. incognita secretes secondary metabolites such as 6-methoxybenzoxazolin-2-one to modulate the rhizosphere microbiome, improving its host-finding capacity and further expanding its damage range\[5].

Co-infection by these two nematodes elevates the risk of complex soil-borne disease outbreaks and creates a “dual stress” on crop production. Therefore, systematic identification of detection and control targets for the two nematodes will not only enrich nematode management tools, but also provide universal strategies for eco-friendly control of nematode diseases in global agriculture.

### 1.2 Control Dilemma: The Critical Weakness of Current Nematode Control Systems {#control-dilemma toc="Control Dilemma"}

Current major management strategies for nematode diseases include chemical fumigation, non-fumigant nematicides, novel nematicides, biological control, resistant cultivar breeding, and crop rotation. To maximize the efficacy of these control approaches while lowering their environmental risks, multiple detection technologies for plant-parasitic nematodes have been developed\[6]. Nevertheless, these methods generally suffer from **delayed detection, high cost, poor portability**, and heavy reliance on professional operators (Table 1).

| Method                        | Cost     | Early-Warning Capacity | Portability | Professional Dependence |
| ----------------------------- | -------- | ---------------------- | ----------- | ----------------------- |
| Morphological Methods         | low      | poor                   | moderate    | high                    |
| Biochemical Methods           | moderate | poor                   | low         | high                    |
| PCR / qPCR                    | high     | poor                   | low         | high                    |
| NGS and Metabarcoding         | high     | poor                   | low         | high                    |
| LAMP / RPA                    | moderate | poor                   | high        | high                    |
| Conventional Image Processing | moderate | poor                   | moderate    | high                    |
| Deep Learning / CNN           | high     | poor                   | moderate    | high                    |
| Hyperspectral Imaging         | high     | poor                   | low         | high                    |
| Remote Sensing                | high     | poor                   | low         | high                    |

Table 1. Comparison of detection methods for plant-parasitic nematodes

### 1.3 Dawn Breaks: Nematophagous Fungi Fuel Innovation in Nematode Detection {#nematophagous-fungi toc="Nematophagous Fungi"}

Previous studies revealed that **ascaroside #18 (ascr#18)** acts as the dominant ascaroside across multiple genera of plant-parasitic nematodes (Figure 2).

:::figure

![Figure 2. Ascaroside profiles in plant-parasitic nematodes.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-4aaded62bc25-fig2.avif)

Figure 2. Ascaroside profiles in plant-parasitic nematodes. Source: Manosalva P, et al. (2015), Nature Communications, DOI:10.1038/ncomms8795.

:::

In contrast, larvae of free-living nematodes such as Caenorhabditis elegans mainly produce **ascaroside #3 (ascr#3)** and ascaroside #5 (ascr#5) (Figure 3)\[7].

:::figure

![Figure 3. Ascaroside profiles in free-living nematodes.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-cdf748e96338-fig3.avif)

Figure 3. Ascaroside profiles in free-living nematodes. Source: Lee D, et al. (2023), Proceedings of the National Academy of Sciences, DOI:10.1073/pnas.2221150120.

:::

Recent studies demonstrate that the G protein-coupled receptor (GPCR) GPR2 from the nematode-trapping fungus Arthrobotrys oligospora can sense ascaroside #3 (ascr#3). It triggers a MAPK cascade to activate downstream gene expression and ultimately initiate predatory behavior (Figure 4) \[8]. This inspired our idea: we could repurpose this receptor to achieve early warning of plant-parasitic nematodes!

:::figure

![Figure 4. GPCR-mediated prey pheromone sensing pathway in the nematode-trapping fungus Arthrobotrys oligospora.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-df028eb5874f-fig4.avif)

Figure 4. GPCR-mediated prey pheromone sensing pathway in the nematode-trapping fungus Arthrobotrys oligospora. Source: Kuo C-Y, et al. (2024), Nature Microbiology, DOI:10.1038/s41564-024-01647-4.

:::

<span id="hp-social-needs" aria-hidden="true"></span>
<span id="hp-description-nemaklear-making-underground-risks-visible" aria-hidden="true"></span>
<span id="hp-description-understanding-the-need-beyond-the-laboratory" aria-hidden="true"></span>
<span id="hp-description-from-user-needs-to-design-priorities" aria-hidden="true"></span>
<span id="hp-description-why-ascarosides" aria-hidden="true"></span>
<span id="hp-description-what-we-have-built-and-what-comes-next" aria-hidden="true"></span>

### NemaKlear Making Underground Risks Visible {#hp-description-source-16 toc="NemaKlear Making Underground Risks Visible"}

Plant-parasitic nematodes present a difficult agricultural challenge: damage develops around roots and within soil, where it is not readily visible. Yellowing, wilting, and reduced growth may alert growers to a problem, but these symptoms can also arise from water stress, nutrient deficiencies, or other diseases. Recognizing an abnormal plant is therefore different from identifying its cause.

NemaKlear explores an ascaroside-responsive yeast biosensor for the early screening of nematode-associated agricultural risks. Our project focuses on questions relevant to soybean cyst nematodes and southern root-knot nematodes, while investigating whether nematode-associated chemical signals can provide useful screening information.

Our motivation is practical. A screening tool should help users decide when a sample deserves further investigation, communicate uncertainty clearly, and fit into existing agricultural advisory services. Detecting a signal is only one part of that task.

### Understanding the Need Beyond the Laboratory {#hp-description-source-20 toc="Understanding the Need Beyond the Laboratory"}

We approached this problem through three connected Human Practices workstreams: Research and Field Engagement, Education and Public Engagement, and Sponsorship and Translation Planning.

Research and field engagement helped us examine agricultural practices, public understanding, and scientific assumptions. Education created opportunities to discuss nematodes, food security, and synthetic biology with learners and the wider public. Industry conversations helped us consider potential users, development constraints, partnership responsibilities, and the resources needed to continue the work.

These workstreams informed one another. Agricultural observations supplied concrete examples for educational materials. Public questions revealed where our explanations were unclear. Scientific and industry discussions prompted us to reconsider what our prototype could reasonably claim.

Our potential users include growers, family farms, agricultural cooperatives, and local plant-protection personnel. Agricultural researchers and diagnostic laboratories are important partners for interpreting results and conducting confirmatory testing. Biotechnology and agricultural service companies provide additional perspectives on development and implementation. Students and the public contribute questions about accessibility, environmental responsibility, and the social purpose of the technology.

### From User Needs to Design Priorities {#hp-description-source-25 toc="From User Needs to Design Priorities"}

Our engagement highlighted that accessibility depends on the complete testing process. Users would need to know where and when to collect a sample, how to prepare it, whether a test has functioned correctly, and what to do with the result.

We therefore identified several design priorities: a manageable sampling workflow; limited dependence on specialized equipment; a readable output; clear instructions; and an appropriate route to professional confirmation. Time, cost, training requirements, and storage conditions must be assessed across the entire workflow.

These are development targets rather than established product specifications. We do not currently claim a validated field turnaround time, final test price, shelf life, or diagnostic accuracy.

Our proposed visual readout is intended to reduce the burden of interpreting laboratory-style measurements. However, any future risk category must be calibrated against appropriate reference methods and relevant agricultural conditions. A color change alone cannot establish a nematode species, quantify crop damage, or determine whether pesticide treatment is necessary.

### Why Ascarosides {#hp-description-source-30 toc="Why Ascarosides"}

Ascarosides are nematode-associated signaling molecules. Published research has identified ascr#18 in several plant-parasitic nematode species, providing a rationale for investigating these molecules as candidate inputs.[1] However, ascr#18 is also produced by nematodes outside this group, and ascarosides can be transformed by plants and other organisms.[2,3]

These findings make chemical context important. We investigate ascr#3 and ascr#18 as candidate inputs and explore whether their responses or relative abundance could provide useful information. We do not treat their ratio as an established universal classifier of harmful and harmless nematodes.

Our proposed architecture connects candidate ascaroside inputs to an engineered yeast sensing pathway involving GPR2 and G-protein-mediated signaling, with a betaxanthin-based visual output. Each connection requires its own evidence: ligand response, pathway function, background activity, output performance, and behavior in relevant samples. The Design, Engineering, Model, and Results pages describe the corresponding technical work.

### What We Have Built and What Comes Next {#hp-description-source-34 toc="What We Have Built and What Comes Next"}

Our Human Practices work includes questionnaire development and distribution, agricultural visits in Tianjin, expert and inter-team discussions, soil-sampling activities, educational resource development, and industry engagement. These activities helped us define the questions that a useful agricultural screening system must answer.

A freeze-dried yeast color card is a proposed product format. Its feasibility depends on further work on preservation, reactivation, containment, signal consistency, storage, and disposal. Freeze-drying must not be assumed to eliminate viable engineered cells.

The next development stage requires comparison with reference methods, testing across relevant soil conditions, assessment of cross-reactivity and recovery, and evaluation of whether users can follow the instructions and interpret results correctly.

Our intended contribution is an evidence-based route from an agricultural problem to a testable screening concept. NemaKlear remains a research prototype whose value and limitations must be evaluated together.

## 2 Project Design & Strategy {#project-design toc="Project Design & Strategy"}

Based on the above background, we aim to construct yeast biosensors capable of specifically recognizing ascr#3 and ascr#18 through the collaboration of dry-lab, wet-lab and HP teams, to realize early warning for agricultural protection.

:::workflow



:::

### 2.1 Wet Lab {#wet-lab toc="Wet Lab"}

Based on dry-lab screening results, the wet-lab team will build yeast biosensors for the detection of various ascarosides (Figure 5). Experiments using HP-collected soil samples will supply data to support dry-lab ODE modeling. Our final deliverable is a freeze-dried yeast test strip for real-world use.

:::figure

![Figure 5. Schematic of ascaroside-specific yeast biosensor construction. Drawn with assistance from ChatGPT.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-8314b17ab26f-fig5.avif)

Figure 5. Schematic of ascaroside-specific yeast biosensor construction. Drawn with assistance from ChatGPT.

:::

Literature shows that Saccharomyces cerevisiae serves as an excellent platform for GPCR display. With only two native GPCR signaling systems that are readily knockable, it is stable, fast-growing and easy to manipulate. Prior work has established yeast biosensing platforms to express heterologous G protein-coupled receptors (GPCRs) on yeast cell surfaces and produce visual readouts\[9]. We adopt similar strategies to display engineered GPR proteins and achieve visual signal output via betaxanthin.

A freeze-dried yeast color card is a proposed product format. Its feasibility depends on preservation, reactivation, containment, signal consistency, storage, and disposal. Freeze-drying must not be assumed to eliminate viable engineered cells. A manageable workflow with limited equipment is a development target; field performance, shelf life, turnaround time, and final cost remain to be established.

Detailed experimental design and results can be found in [Wet Lab-Results](/results/)

### 2.2 Dry Lab {#dry-lab toc="Dry Lab"}

Our dry-lab work addresses three connected questions: how to select and engineer receptors that recognize ascarosides, how to convert recognition signals into a colorimetric output, and how detection results can support practical field management decisions. Four areas of computational work—**molecular docking**, molecular dynamics simulations, ODE signaling pathway modeling, and **economic benefit modeling**—inform our project design.

At the receptor-recognition level, molecular docking helps us compare Gpr2, Gpr3, and GprC. Focusing on Gpr2, we identify interaction hotspots and design mutations, using changes in scores and interactions to explore differences in the recognition of ascaroside #3 and ascaroside #18. **Molecular dynamics simulations** examine the behavior of selected systems over time, tracking changes in ligand position and key contacts to provide further evidence for the structural hypotheses proposed through docking.

At the signal-output level, ODE modeling connects receptor activation, intracellular signal transduction, and color development. We select model complexity according to pathway mechanisms and the data available from wet-lab experiments, combine intermediate steps that are difficult to measure separately, and retain parameters for subsequent experimental calibration. This allows us to progressively develop a model that can explain the system’s response.

At the application level, economic benefit modeling asks what users can do after a signal is detected. By comparing costs and benefits across risk levels and management scenarios, we assess the decision-making value of detection information and identify requirements for quantitative capability, detection range, and result presentation. We will further refine this application assessment using Human Practices (HP) research and wet-lab data.

Together, these four areas connect molecular design, system responses, and application needs. Through candidate validation, model calibration, and use-scenario analysis, we collaborate with Wet Lab and Human Practices to advance the project. Detailed methods and results are available on the [Model page](/model/).

## 3 Innovative Strategies {#innovative-strategies toc="Innovative Strategies"}

### Early-Warning Strategy for Plant-Parasitic Nematode Infestations {#early-warning-strategy-for-plant-parasitic-nematode-infestations toc="Early-Warning Strategy"}

We investigate whether candidate ascaroside inputs can support an early-screening concept with a readable color output. Low cost, simple operation, and useful warning are **development goals**. Future risk categories require calibration against reference methods and relevant agricultural conditions; **a color change alone** cannot determine whether pesticide treatment is necessary.

### Strategy for Reconstructing Ascaroside-Specific Yeast Biosensors {#strategy-for-reconstructing-ascaroside-specific-yeast-biosensors toc="Ascaroside-Specific Yeast Biosensors"}

We build on a reported yeast signaling chassis with cascade amplification and investigate engineered receptors as inputs to a betaxanthin-based readout. Ligand response, background activity, pathway function, and output performance each require their own evidence. Qualitative or semi-quantitative use in agricultural samples remains subject to calibration and validation; docking and modeling do not establish field specificity.

## 4 References {#references toc="References"}

1. Li J, Zou C, Xu J, et al. Molecular mechanisms of nematode-nematophagous microbe interactions: basis for biological control of plant-parasitic nematodes\[J]. Annual Review of Phytopathology, 2015, 53(1): 67-95.
2. Savary S, Willocquet L, Pethybridge S J, et al. The global burden of pathogens and pests on major food crops\[J]. Nature Ecology & Evolution, 2019, 3(3): 431-439.
3. Siddique S, Radakovic Z S, Hiltl C, et al. The genome and lifestage-specific transcriptomes of a plant-parasitic nematode and its host reveal susceptibility genes involved in trans-kingdom synthesis of vitamin B5\[J]. Nature Communications, 2022, 13(1): 6190.
4. Abad P, Gouzy J, Aury J M, et al. Genome sequence of the metazoan plant-parasitic nematode meloidogyne incognita\[J]. Nature Biotechnology, 2008, 26(8): 909-915.
5. Wu Z, Liu Z, Wang W, et al. Root-knot nematode meloidogyne incognita uses secondary-metabolite-mediated soil microbiome shifts to locate host plants\[J]. Nature Plants, 2026, 12(2): 337-355.
6. Pun, T. B., Thapa Magar, R., Koech, R., Owen, K. J., & Adorada, D. L. (2024). Emerging Trends and Technologies Used for the Identification, Detection, and Characterisation of Plant-Parasitic Nematode Infestation in Crops. Plants, 13(21), 3041. [https://doi.org/10.3390/plants13213041](https://doi.org/10.3390/plants13213041).
7. Manosalva, P., Manohar, M., von Reuss, S. et al. Conserved nematode signalling molecules elicit plant defenses and pathogen resistance. Nat Commun 6, 7795 (2015). [https://doi.org/10.1038/ncomms8795](https://doi.org/10.1038/ncomms8795).
8. Kuo, CY., Tay, R.J., Lin, HC. et al. The nematode-trapping fungus Arthrobotrys oligospora detects prey pheromones via G protein-coupled receptors. Nat Microbiol 9, 1738–1751 (2024). [https://doi.org/10.1038/s41564-024-01679-w](https://doi.org/10.1038/s41564-024-01679-w).
9. Cong Fan, Nike He, Jifeng Yuan, Cascaded amplifying circuit enables sensitive detection of fungal pathogens, Biosensors and Bioelectronics, Volume 250, 2024, 116058, ISSN 0956-5663, [https://doi.org/10.1016/j.bios.2024.116058](https://doi.org/10.1016/j.bios.2024.116058).

## References and Supporting Evidence {#hp-original-references toc="References and Supporting Evidence"}

[1] Conserved nematode signalling molecules elicit plant defenses and pathogen resistance. Nature Communications (2015).

https://doi.org/10.1038/ncomms8795

[2] Plant metabolism of nematode pheromones mediates plant-nematode interactions. Nature Communications (2020).

https://doi.org/10.1038/s41467-019-14104-2

[3] Nematode Signaling Molecules Are Extensively Metabolized by Animals, Plants, and Microorganisms.

https://pmc.ncbi.nlm.nih.gov/articles/PMC8590397/

[4] Nankai University Xiangyang Initiative, 2026 Summer Teaching-Support Program Evaluation Report. Internal project source.

Team evidence supporting these pages includes questionnaire versions and response records; Tianjin agricultural visit records; anonymized expert and industry discussion summaries; inter-team exchange records; sampling guidance and sample records; course materials and teaching-partner records; and partnership planning documents. Technical performance claims should be read alongside the experimental and modeling evidence on the corresponding project pages.
