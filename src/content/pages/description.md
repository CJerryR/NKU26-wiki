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
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
## 1 Background {#background toc="Background"}

### 1.1 Silent Killers Underground: The Urgent Threat of Plant-Parasitic Nematodes {#11-silent-killers-underground-the-urgent-threat-of-plant-parasitic-nematodes toc="Plant-Parasitic Nematodes"}

<p>Plant-parasitic nematodes are among the most destructive pathogens in global agricultural production. Widely distributed in cultivated soils, they parasitize plant roots, disrupt nutrient uptake pathways and trigger secondary diseases, posing severe threats to crop yield and quality. Statistically, plant-parasitic nematodes cause up to 157 billion dollars in annual crop losses worldwide across more than 20 major cash crops<sup>[1]</sup>. Among them, sedentary endoparasitic nematodes represent the most harmful group due to their unique parasitic lifestyle, strong dispersal capacity and difficult control<sup>[2]</sup>. As two representative species, <em>Heterodera glycines</em> and <em>Meloidogyne incognita</em> exhibit typical taxonomic and biological features. They continuously endanger the production of globally critical crops and serve as core model organisms for research on soil nematode management (Figure 1).</p>

:::figure{scale=70}

![Figure 1. Symptoms of two major plant-parasitic nematodes on soybean roots. (a) Meloidogyne incognita: obvious root galls formed on infected soybean roots. (b) Heterodera glycines: white lemon-shaped mature females protruding from soybean roots (arrows). Note that soybean cyst nematode does not form root galls.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-a69f0a5adee6-fig1.avif)

<p><strong>Figure 1. Symptoms of two major plant-parasitic nematodes on soybean roots. </strong>(a) <em>Meloidogyne incognita</em>: obvious root galls formed on infected soybean roots. (b) <em>Heterodera glycines</em>: white lemon-shaped mature females protruding from soybean roots (arrows). Note that soybean cyst nematode does not form root galls. Source: <em>Management of Plant-Parasitic Nematodes in Florida Soybean Production</em> (NG018), UF/IFAS EDIS. Used for educational demonstration only.</p>

:::

<p>Plant-parasitic nematodes of these two species exert substantial economic and ecological impacts. <em>Heterodera glycines</em> specifically parasitizes legumes such as soybean and common bean. After second-stage juveniles (J2) invade host roots, they secrete effectors to induce syncytial feeding sites, which leads to root lignification, stunting and chlorosis of plants. In heavily infested fields, soybean yield losses can reach 30%–80% or even total crop failure. The cysts of this nematode can remain dormant in soil for more than 10 years, serving as persistent primary inoculum sources that are hard to eradicate, making it the most devastating disease in major soybean-producing regions worldwide<sup>[3]</sup>.</p>

<p>As a polyphagous sedentary endoparasitic nematode, <em>Meloidogyne incognita</em> infects over 3000 plant species including vegetables, grain and cash crops such as tomato, cucumber, cotton and maize<sup>[4]</sup>. Losses caused by this nematode are especially severe in protected agriculture due to continuous cropping obstacles. Notably, <em>M. incognita</em> secretes secondary metabolites such as 6-methoxybenzoxazolin-2-one to modulate the rhizosphere microbiome, improving its host-finding capacity and further expanding its damage range<sup>[5]</sup>.</p>

Co-infection by these two nematodes elevates the risk of complex soil-borne disease outbreaks and creates a “dual stress” on crop production. Therefore, systematic identification of detection and control targets for the two nematodes will not only enrich nematode management tools, but also provide universal strategies for eco-friendly control of nematode diseases in global agriculture.

### 1.2 Control Dilemma: The Critical Weakness of Current Nematode Control Systems {#control-dilemma toc="Control Dilemma"}

<p>Current major management strategies for nematode diseases include chemical fumigation, non-fumigant nematicides, novel nematicides, biological control, resistant cultivar breeding, and crop rotation. To maximize the efficacy of these control approaches while lowering their environmental risks, multiple detection technologies for plant-parasitic nematodes have been developed<sup>[6]</sup>. Nevertheless, these methods generally suffer from delayed detection, high cost, poor portability, and heavy reliance on professional operators (Table 1).</p>

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

<p>Previous studies revealed that ascaroside #18 (ascr#18) acts as the dominant ascaroside across multiple genera of plant-parasitic nematodes (Figure 2). In contrast, larvae of free-living nematodes such as <em>Caenorhabditis elegans</em> mainly produce ascaroside #3 (ascr#3) and ascaroside #5 (ascr#5) (Figure 3)<sup>[7]</sup>.</p>

:::figure

![Figure 2. Ascaroside profiles in plant-parasitic nematodes.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-4aaded62bc25-fig2.avif)

<p><strong>Figure 2. Ascaroside profiles in plant-parasitic nematodes. </strong>Source: Manosalva P, et al. (2015), <em>Nature Communications</em>, DOI:10.1038/ncomms8795.</p>

:::

:::figure

![Figure 3. Ascaroside profiles in free-living nematodes.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-cdf748e96338-fig3.avif)

<p><strong>Figure 3. Ascaroside profiles in free-living nematodes. </strong>Source: Lee D, et al. (2023), <em>Proceedings of the National Academy of Sciences</em>, DOI:10.1073/pnas.2221150120.</p>

:::

<p>Recent studies demonstrate that the G protein-coupled receptor (GPCR) GPR2 from the nematode-trapping fungus <em>Arthrobotrys oligospora</em> can sense ascaroside #3 (ascr#3). It triggers a MAPK cascade to activate downstream gene expression and ultimately initiate predatory behavior (Figure 4)<sup> [8]</sup>. This inspired our idea: we could repurpose this receptor to achieve early warning of plant-parasitic nematodes!</p>

:::figure

![Figure 4. GPCR-mediated prey pheromone sensing pathway in the nematode-trapping fungus Arthrobotrys oligospora.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-df028eb5874f-fig4.avif)

<p><strong>Figure 4. GPCR-mediated prey pheromone sensing pathway in the nematode-trapping fungus </strong><strong><em>Arthrobotrys oligospora</em></strong><strong>. </strong>Source: Kuo C-Y, et al. (2024), <em>Nature Microbiology</em>, DOI:10.1038/s41564-024-01647-4.</p>

:::

<p class="author-source-link"><a href="/source-archive/#meeting-20261019" data-source-document="meeting-20261019-aabe053205e9">Original submission (.docx)</a><span role="status" aria-live="polite"></span></p>

<section class="author-manuscript" lang="zh">

<p style="text-align:left;"> Human Practices addresses a central question: how can nematode detection respond to real agricultural needs? For Field Detective's concept of engineered yeast sensing ascarosides and producing observable outputs, we used questionnaires, expert interviews, and field practice to clarify applications and design requirements. Education, outreach, and industry discussions connected the project with potential users and the public. </p>

<p style="text-align:left;"> For needs assessment, we collected 369 questionnaire submissions. Respondents prioritized ease of use, accuracy and reliability, and affordability; 53.4% lacked knowledge of plant-parasitic nematodes. These results informed detection-workflow design and science communication. Visits to Tianjin Xiangyu Fruit and Vegetable Garden and the Diliubu Village Vegetable Demonstration Garden explored disease management and production experience, assessing specific needs against local crops and field conditions. </p>

<p style="text-align:left;"> For project design, discussions with 姚玉荣, 刘倩, and 庞志豪 connected early detection with preplanting decisions and identified sampling representativeness, soil background color, ascaroside stability, and engineered-yeast disposal as concerns. The team expanded its focus to sampling, testing, interpretation, and post-test handling, organized soil collection, and produced sampling guidance, identifying conditions for experimental and modeling tests. </p>

<p style="text-align:left;"> For education and outreach, we designed three courses on nematodes and agriculture, biological signals, and scientific responsibility, adapting content for primary and junior-secondary students. Teaching and outreach took place through Nankai University's Xiangyang Program. Picture books, posters, and other materials helped explain underground disease and biosensing. Courses progressed from recognizing phenomena to interpreting signals and results, addressing knowledge needs identified in the questionnaire. </p>

<p style="text-align:left;"> For social support and industry engagement, we prepared invitations, proposals, and pitch materials to discuss applications, potential users, and further research with enterprises, receiving sponsorship from organizations including ExCell Bio. These exchanges provided resources and clarified collaboration conditions for future sample access, prototype evaluation, and real-world validation. </p>

<p style="text-align:left;"> This work integrated user needs, professional advice, and public communication into project development and refined validation priorities with the wet and dry labs. Real samples and technical data will subsequently test relationships between sensor output and nematode information and the usability of the workflow in agricultural settings. Detailed investigations, activity records, and feedback appear on the Human Practices page. </p>

</section>

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

<p>Literature shows that <em>Saccharomyces cerevisiae</em> serves as an excellent platform for GPCR display. With only two native GPCR signaling systems that are readily knockable, it is stable, fast-growing and easy to manipulate. Prior work has established yeast biosensing platforms to express heterologous G protein-coupled receptors (GPCRs) on yeast cell surfaces and produce visual readouts<sup>[9]</sup>. We adopt similar strategies to display engineered GPR proteins and achieve visual signal output via betaxanthin.</p>

<p>Meanwhile, <em>Saccharomyces cerevisiae</em> features strong robustness, controllable genetics and established biosafety for humans, supporting cost-effective large-scale production. These properties lay critical foundations for fabricating freeze-dried yeast color strips. Requiring no extra equipment for detection, freeze-dried yeast color strips align well with our project goals. Thus, our final product is the freeze-dried yeast color strip.</p>

Detailed experimental design and results can be found in [Wet Lab-Results](/results/)

### 2.2 Dry Lab {#dry-lab toc="Dry Lab"}

<p class="author-source-link"><a href="/source-archive/#meeting-20261019" data-source-document="meeting-20261019-d8c0f0af5a28">Original submission (.docx)</a><span role="status" aria-live="polite"></span></p>

<section class="author-manuscript" lang="zh">

<p style="text-align:left;"> Our dry-lab work addresses three connected questions: how to select and engineer ascaroside-recognizing receptors, how to convert recognition signals into color outputs, and how detection results can support field management. Molecular docking, molecular dynamics simulations, ODE signaling models, and economic modeling provide computational support for project design. </p>

<p style="text-align:left;"> For receptor recognition, <strong> molecular docking </strong> helps compare Gpr2, Gpr3, and GprC, identify Gpr2 hotspots, and design mutations. Score and interaction changes explore differences in recognition of ascaroside 3 and ascaroside 18. <strong> molecular dynamics simulations </strong> further examine dynamic behavior in selected systems, tracking ligand positioning and key contacts over time to supplement structural hypotheses from docking. </p>

<p style="text-align:left;"><br></p>

<p style="text-align:left;"> For signal output, <strong> ODE modeling </strong> connects receptor input, intracellular signaling, and color development. We reused published pathways and calibrated input–output interfaces with simulated data, then converted paired pigment outputs into simulated smartphone RGB blue-channel features to fit <strong> the three-coefficient regression equation of the dual-channel model </strong>. This model estimates southern root-knot nematode density with unknown background abundance, providing input for risk tiers. Real samples and smartphone imaging data will support subsequent experimental calibration. </p>

<p style="text-align:left;"> For practical application, <strong> economic modeling </strong> examines what users can do after detecting a signal. Comparing costs and returns across risk tiers and management scenarios evaluates the decision value of detection information and identifies requirements for quantitative capability, detection range, and result presentation. Subsequent application evaluation will incorporate HP research and wet-lab data. </p>

<p style="text-align:left;"> Together, these four computational strands connect molecular design, system response, and application needs, supporting collaboration with Wet Lab and Human Practices through candidate validation, model calibration, and use-scenario analysis. Detailed methods and results appear on the Model page. </p>

</section>

## 3 Innovative Strategies {#innovative-strategies toc="Innovative Strategies"}

### Early-Warning Strategy for Plant-Parasitic Nematode Infestations {#early-warning-strategy-for-plant-parasitic-nematode-infestations toc="Early-Warning Strategy"}

<p>Unlike conventional detection methods, our strategy features early warning, low cost and simple operation. This approach sensitively detects ascarosides and outputs pest risk levels via colorimetric readout on test strips. Designed for end users, our product holds broad application prospects and research value.</p>

### Strategy for Reconstructing Ascaroside-Specific Yeast Biosensors {#strategy-for-reconstructing-ascaroside-specific-yeast-biosensors toc="Ascaroside-Specific Yeast Biosensors"}

<p>We utilize a reported yeast sensing circuit chassis with signal cascade amplification capacity. The intact intracellular signal-amplifying module is retained. Only the ascaroside-specific receptor, independently designed by our team, is replaced on the yeast cell surface. This enables specific recognition of ascarosides, qualitative detection of ascaroside presence/absence and semi-quantitative measurement. It further expands the application scenarios of this yeast sensing platform for plant pest detection.</p>

## 4 References {#references toc="References"}

1. Li J, Zou C, Xu J, et al. Molecular mechanisms of nematode-nematophagous microbe interactions: basis for biological control of plant-parasitic nematodes\[J]. Annual Review of Phytopathology, 2015, 53(1): 67-95.
2. Savary S, Willocquet L, Pethybridge S J, et al. The global burden of pathogens and pests on major food crops\[J]. Nature Ecology & Evolution, 2019, 3(3): 431-439.
3. Siddique S, Radakovic Z S, Hiltl C, et al. The genome and lifestage-specific transcriptomes of a plant-parasitic nematode and its host reveal susceptibility genes involved in trans-kingdom synthesis of vitamin B5\[J]. Nature Communications, 2022, 13(1): 6190.
4. Abad P, Gouzy J, Aury J M, et al. Genome sequence of the metazoan plant-parasitic nematode meloidogyne incognita\[J]. Nature Biotechnology, 2008, 26(8): 909-915.
5. Wu Z, Liu Z, Wang W, et al. Root-knot nematode meloidogyne incognita uses secondary-metabolite-mediated soil microbiome shifts to locate host plants\[J]. Nature Plants, 2026, 12(2): 337-355.
6. Pun, T. B., Thapa Magar, R., Koech, R., Owen, K. J., & Adorada, D. L. (2024). Emerging Trends and Technologies Used for the Identification, Detection, and Characterisation of Plant-Parasitic Nematode Infestation in Crops. Plants, 13(21), 3041. [https://doi.org/10.3390/plants13213041](https://doi.org/10.3390/plants13213041).
7. <span>Manosalva, P., Manohar, M., von Reuss, S. <em>et al.</em> Conserved nematode signalling molecules elicit plant defenses and pathogen resistance. <em>Nat Commun</em> <strong>6</strong>, 7795 (2015). <a href="https://doi.org/10.1038/ncomms8795">https://doi.org/10.1038/ncomms8795</a>. </span>
8. Kuo, CY., Tay, R.J., Lin, HC. et al. The nematode-trapping fungus Arthrobotrys oligospora detects prey pheromones via G protein-coupled receptors. Nat Microbiol 9, 1738–1751 (2024). [https://doi.org/10.1038/s41564-024-01679-w](https://doi.org/10.1038/s41564-024-01679-w).
9. Cong Fan, Nike He, Jifeng Yuan, Cascaded amplifying circuit enables sensitive detection of fungal pathogens, Biosensors and Bioelectronics, Volume 250, 2024, 116058, ISSN 0956-5663, [https://doi.org/10.1016/j.bios.2024.116058](https://doi.org/10.1016/j.bios.2024.116058).

<span id="hp-description-source-16" aria-hidden="true"></span>
<span id="hp-description-source-20" aria-hidden="true"></span>
<span id="hp-description-source-25" aria-hidden="true"></span>
<span id="hp-description-source-30" aria-hidden="true"></span>
<span id="hp-description-source-34" aria-hidden="true"></span>
<span id="hp-original-references" aria-hidden="true"></span>
