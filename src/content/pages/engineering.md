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

<section class="author-manuscript" lang="en">

## DBTL-1 | engineering the signal-response pathway {#src-Project-Engineering-1 toc="DBTL-1 | engineering the signal-response pathway"}

### 1.1 Receptor screening and selection of study targets {#src-Project-Engineering-2 toc="Receptor screening and selection of study targets"}

#### Design | defining receptor-screening objectives {#src-Project-Engineering-3 toc="Design | defining receptor-screening objectives"}

<p>We organize engineering through <strong>design–build–test–learn (DBTL)</strong> cycles.</p><p style="text-align:left;"> To build a yeast sensor that distinguishes <strong>ascaroside #18 (ascr#18)</strong> from <strong>ascaroside #3 (ascr#3)</strong>, we screened recognition elements for further engineering. The literature identifies Gpr2, Gpr3, and GprC from nematode-trapping fungi as <strong>G protein-coupled receptors (GPCRs)</strong> involved in ascaroside sensing. We included all three as candidates, considering ligand recognition, localization in yeast, and pathway coupling. </p>

#### Build | establishing receptor and literature comparisons {#src-Project-Engineering-5 toc="Build | establishing receptor and literature comparisons"}

<p style="text-align:left;"> After preparing predicted structures of the three receptors and ascaroside ligands, we explored docking using AutoDock Vina as reported for GprC and SwissDock as reported for Gpr2 and Gpr3, with published pocket positions and key residues as references. </p>

#### Test | comparing with literature and refining the docking workflow {#src-Project-Engineering-7 toc="Test | comparing with literature and refining the docking workflow"}

<p style="text-align:left;"> Comparing scores, ligand positions, and residue contacts with literature clues revealed that inconsistent coordinate references could misplace search regions, while loss of formal charges during format conversion could affect charged-contact identification. We therefore refined docking and contact analysis by adding structural alignment, search-region verification, and chemical-information checks. </p>

#### Learn | selecting receptors for further engineering {#src-Project-Engineering-9 toc="Learn | selecting receptors for further engineering"}

:::note[Interpretation and next steps]

<p style="text-align:left;"> Reported plasma-membrane and mitochondria-associated localization of GprC could complicate localization and pathway integration in yeast. We therefore excluded it from this engineering round but retained it as a structural reference. Considering computational behavior and heterologous application conditions, subsequent mutant screening focused on Gpr2 while retaining studies of Gpr3 and its mutants. </p>

:::

</section>

### 1.2 The third cycle——wet lab {#the-third-cycle-wet-lab toc="The third cycle——wet lab"}

<p>Informed by results from the prior cycle, this iteration characterizes heterologous expression and proper plasma membrane localization of GPR2, establishing proof of feasibility for downstream chassis engineering.</p>

#### 1.2.1 Design {#design toc="Design | planning GPR2 expression and localization verification"}

<p>To validate heterologous expression and proper plasma membrane localization of GPR2 in our host strain <strong><em>Saccharomyces cerevisiae</em> (<em>S.c</em>)</strong> CEN.PK2-1C, the construct uses <strong>superfolder green fluorescent protein (sfGFP)</strong> as a localization reporter. We adopted the following experimental pipeline: assembly of the GPR2-sfGFP expression plasmid, gene knock-in mediated by yeast <strong>homologous recombination (HR)</strong>, and fluorescence microscopy to characterize protein expression and subcellular localization. See Wet Lab-Results- DBTL-1 for detailed design and experimental protocols.</p>

#### 1.2.2 Build {#build toc="Build | integrating the GPR2-sfGFP expression cassette"}

<p>Via HR, we integrated the constitutive <em>GPR2-sfGFP</em> expression cassette into the CEN.PK2-1C genome (Figure 1).</p>

:::figure

![Figure 1 Yeast transformation of GPR2‑sfGFP construct](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-e81fa7011e20-r2-e81fa7011e20-engineering-r2-eng-001.webp)

Figure 1 Yeast transformation of GPR2‑sfGFP construct

:::

#### 1.2.3 Test {#test toc="Test | comparing GFP with cell-wall and membrane staining"}

Following gene knock-in, we visualized three groups of yeast under fluorescence microscopy: unstained cells (Figure 2), cell wall-stained yeast (Figure 3), and plasma membrane-stained yeast (Figure 4).

Distinct <strong>green fluorescent protein (GFP)</strong> fluorescence signals were detected at the cell periphery in unstained yeast.

:::figure

![Figure 2 Fluorescence microscopy results](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ad5d098cc617-fig1-3-2.avif)

Figure 2 Fluorescence microscopy results

:::

For <strong>Calcofluor White (CFW)</strong>-labelled yeast, the green GFP signal localizes to the cytoplasmic side of the blue CFW fluorescence.

:::figure

![Figure 3 Calcofluor‑White (CFW) staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-f9ddc932c78a-fig1-3-3.avif)

Figure 3 CFW staining of yeast cells

:::

In FM4-64-labelled yeast, the green GFP fluorescence and red FM4-64 signal co-localize on the vacuolar membrane following endocytosis.

:::figure

![Figure 4 FM4‑64 staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-03753b902e9a-fig1-3-4.avif)

Figure 4 FM4‑64 staining of yeast cells

:::

#### 1.2.4 Learn {#learn toc="Learn | assessing GPR2 localization for chassis engineering"}

:::note[Interpretation and next steps]

<p>Collectively, these data confirm heterologous expression and proper plasma membrane localization of GPR2 in CEN.PK2-1C, laying an essential foundation for our chassis engineering. We therefore advance to the next cycle to assemble the full signal-responsive engineered strain.</p>

:::

### 1.3 The fourth cycle——wet lab {#the-fourth-cycle-wet-lab toc="The fourth cycle——wet lab"}

Building upon findings from prior iterations, this cycle launches the chassis engineering of our signal-responsive pathway.

#### 1.3.1 Design {#design-2 toc="Design | planning the ascaroside-responsive yeast pathway"}

<p>Referring to previous work reported by Fan et al. <sup>[1][2]</sup>, we assembled the ascaroside-sensitive yeast biosensor according to the pipeline illustrated in Figure 1. </p>

:::figure

![Figure 1 Schematic Diagram of Yeast Biosensor Construction Pipeline](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-d2f6a13810e7-r2-d2f6a13810e7-engineering-r2-eng-002.webp)

Figure 1 Schematic diagram of yeast biosensor construction pipeline

:::

#### 1.3.2 Build {#build-2 toc="Build | assembling the signal-responsive yeast chassis"}

<p>First, we knocked out the <em>Gal80</em> gene in CEN.PK2-1C to obtain the engineered strain NKU-Y02 (Figure 2), which eliminates endogenous signal interference in this pathway. </p>

::::figures

:::figure

![Figure 2 Knockout of the *Gal80* Gene](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-9ec82d42de33-r2-9ec82d42de33-engineering-r2-eng-003.webp)

Figure 2 Knockout of the *Gal80* gene

:::

:::figure

![Figure 3 Construction of Synthetic Transcription Factor](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-10dfc2855aa3-r2-10dfc2855aa3-engineering-r2-eng-004.webp)

Figure 3 Construction of <strong>synthetic transcription factor (sTF)</strong>

:::

::::

In the domain terminology below, <strong>deoxyribonucleic acid (DNA)</strong> is abbreviated as DNA. Subsequently, we fused the <strong>pheromone-responsive domain (PRD)</strong> of Ste12 (216–688 aa) with the <strong>DNA-binding domain (DBD)</strong> of Gal4 (1–147 aa) to construct an sTF. This construct was transformed into NKU-Y05, yielding strain NKU-Y05 (Figure 3) and enabling the coupling of GPCR-activated signaling with the GAL pathway.

<p>Subsequently, we introduced MjDOD and BvCYP76AD5 driven by the bidirectional Gal1/10 promoter into NKU-Y05 to generate the engineered strain NKU-Y06 (Figure 4), realizing the visualization of signal output.</p>

<p>Finally, we transformed the constitutive <em>GPR2</em> expression cassette into NKU-Y06 to obtain the engineered strain NKU-Y07 (Figure 5), completing the preliminary construction of the full engineered strain system and advancing the project to the testing phase.</p>

#### 1.3.3 Test {#wet-lab-fourth-test toc="Test"}

This section will be provided later.

#### 1.3.4 Learn {#wet-lab-fourth-learn toc="Learn"}

This section will be provided later.

### 1.4 References {#references toc="References"}

Fan C, Yuan J. Reshaping the yeast galactose regulon via GPCR signaling cascade. Cell Rep Methods. 2023 Dec 18;3(12):100647. doi: 10.1016/j.crmeth.2023.100647. Epub 2023 Nov 20. PMID: 37989311; PMCID: PMC10753199.

Cong Fan, Nike He, Jifeng Yuan, Cascaded amplifying circuit enables sensitive detection of fungal pathogens, Biosensors and Bioelectronics, Volume 250, 2024, 116058, ISSN 0956-5663, [https://doi.org/10.1016/j.bios.2024.116058](https://doi.org/10.1016/j.bios.2024.116058).

<section class="author-manuscript" lang="en">

## DBTL-2 | engineering receptor specificity and constructing pathway models {#src-Project-Engineering-12 toc="DBTL-2 | engineering receptor specificity and constructing pathway models"}

### 2.1 Contact-guided mutant design and screening {#src-Project-Engineering-13 toc="Contact-guided mutant design and screening"}

#### Design | proposing engineering sites from WT contact differences {#src-Project-Engineering-14 toc="Design | proposing engineering sites from WT contact differences"}

<p style="text-align:left;"> We compared contact distributions of Gpr2 <strong>wild type (WT)</strong> with ascr#18 and ascr#3, selecting residues with differential contacts for <strong>alanine (Ala)</strong> substitution to examine effects on dual-ligand behavior. </p>

#### Build | constructing mutant models and consistent controls {#src-Project-Engineering-16 toc="Build | constructing mutant models and consistent controls"}

<p style="text-align:left;"> We generated mutant sequences and predicted structures with AlphaFold 3. WT and mutants retained original residue numbering and were aligned to a common coordinate reference, with consistent structural preparation, ligand inputs, and docking search settings for score and contact comparisons. </p>

#### Test | iterating substitutions using score and contact feedback {#src-Project-Engineering-18 toc="Test | iterating substitutions using score and contact feedback"}

<p style="text-align:left;"> After screening single-site Ala mutants, we supplemented side-chain substitutions using score and contact analyses and performed saturation scanning at selected sites. The difference between each ligand's score change relative to WT classified shifts toward ascr#3 or ascr#18. We then inspected the scores separately to distinguish a lower target-ligand score, a higher score for the other ligand, or both. Contact comparisons with WT examined corresponding ligand positions and interaction clues. </p>

<p style="text-align:left;"> We then selected single-mutant parents by shift direction and score-change pattern and tested combinations to determine whether their effects persisted together. Compared with WT and each parent, most tested combinations did not further improve the better parent's target score or enlarge dual-ligand differences, so subsequent work focused on single mutants. </p>

#### Learn | selecting candidates for dynamic testing {#src-Project-Engineering-21 toc="Learn | selecting candidates for dynamic testing"}

:::note[Interpretation and next steps]

<p style="text-align:left;"> Combining score differentiation and contact analysis, we selected N84V and V368R. Relative to the same WT batch, N84V lowered the ascr#18 score and raised the ascr#3 score; V368R showed the opposite direction. Both mutants and WT then entered dynamic comparisons in a membrane environment. </p>

:::

### 2.2 Examining selected candidates in a membrane environment {#src-Project-Engineering-23 toc="Examining selected candidates in a membrane environment"}

#### Design | testing the membrane behavior of docking-selected candidates {#src-Project-Engineering-24 toc="Design | testing the membrane behavior of docking-selected candidates"}

<p style="text-align:left;"> We performed <strong>molecular dynamics (MD)</strong> simulations of six complexes formed by WT, N84V, and V368R with each ligand, examining whether ligands remained in their predicted pockets and whether original contacts persisted in a membrane environment. </p>

#### Build | preparing full-length receptors and membrane systems {#src-Project-Engineering-26 toc="Build | preparing full-length receptors and membrane systems"}

<p style="text-align:left;"> We aligned docked poses and their full-length receptors to a common coordinate reference, checked ligand clashes with restored segments, and adjusted the overlapping local lid region. Some reconstruction schemes also altered the backbone outside the loop or the ligand starting position, so adjustments were restricted to the lid while retaining each system's remaining coordinates. Each of the six complexes was then placed in a <strong>1-palmitoyl-2-oleoyl-sn-glycero-3-phosphocholine (POPC)</strong> lipid bilayer with solvent and ions. </p>

#### Test | tracking ligand motion and contact changes {#src-Project-Engineering-28 toc="Test | tracking ligand motion and contact changes"}

<p style="text-align:left;"> Each system completed one 100 ns trajectory. Using the local pocket as reference, we distinguished overall receptor motion from ligand movement within the pocket and compared time-dependent contacts and representative conformations. </p>

<p style="text-align:left;"> In the second half of the trajectories, N84V–ascr#18 deviated less from its own starting pose than WT–ascr#18 and N84V–ascr#3. Its initial Arg189 contact persisted: during 50–100 ns, hydrogen-bond occupancy between Arg189 and the ascr#18 carboxylate end was 93.6%, while neither comparison system showed that hydrogen bond in the same interval. This persistent contact offers a possible explanation for positional retention. </p>

<p style="text-align:left;"> V368R–ascr#3 left its initial position and moved toward Arg345. The charged end of Arg368 moved away from Asp70 around the time the ligand began contacting Arg345; in V368R–ascr#18, Arg368 and Asp70 remained close. Arg345 contacts with the ligand carboxylate also occurred in WT–ascr#3 and V368R–ascr#18, so this contact alone cannot yet explain the ascr#3 score bias of V368R. </p>

#### Learn | reinterpreting mutation effects from trajectories {#src-Project-Engineering-32 toc="Learn | reinterpreting mutation effects from trajectories"}

:::note[Interpretation and next steps]

<p style="text-align:left;"> MD showed that ligands can retain initial contacts or relocate and form persistent new contacts. Interpreting mutation effects requires combining ligand motion, internal receptor changes, and WT controls. Each system currently has only one trajectory and a different starting pose; contact and rearrangement reproducibility require further testing, and their relationship to actual recognition requires experiments. </p>

:::

### 2.3 ODE: connecting receptor signals to color output {#src-Project-Engineering-34 toc="ODE: connecting receptor signals to color output"}

#### Design | building a minimal model from biological principles {#src-Project-Engineering-35 toc="Design | building a minimal model from biological principles"}

<p style="text-align:left;"> We initially used ligand input to connect the receptor, <strong>guanine nucleotide-binding protein (G protein)</strong>, <strong>mitogen-activated protein kinase (MAPK)</strong>, sTF, GAL productivity, and color in a minimal model. Several internal parameters lacked project-specific measurements and could not readily be identified separately from final color alone. We therefore turned to published and previous iGEM models for reusable pathway structures and parameters. </p>

#### Build | adapting the shared pathway and color-output interface {#src-Project-Engineering-37 toc="Build | adapting the shared pathway and color-output interface"}

<p style="text-align:left;"> Based on the public reaction structures of Supady Model B and TU Delft 2012, we incorporated G protein, scaffold, Fus3, and feedback modules. Under fixed construct conditions, we combined sTF regulation, GAL productivity, and color production and eliminated redundant states through molecular-total conservation, yielding six independent dynamic equations. The two sensors share the pathway but have separate effective input scales and color-production gains. </p>

#### Test | adjusting the response range using simulated endpoints {#src-Project-Engineering-39 toc="Test | adjusting the response range using simulated endpoints"}

<p style="text-align:left;"> After computational consistency checks, we found that colors from different stimuli were too similar under the initial parameters. Keeping shared pathway parameters fixed, we varied target and background nematode densities independently, constructed simulated color targets, and fitted input scales and color-production gains for both sensors. We then adjusted color scale and basal production using a smartphone-readout example and reintegrated to verify outputs. </p>

#### Learn | distinguishing pathway mechanisms from interface calibration {#src-Project-Engineering-41 toc="Learn | distinguishing pathway mechanisms from interface calibration"}

:::note[Interpretation and next steps]

<p style="text-align:left;"> Literature structures describe signal transmission, while input scales and color parameters adapt the model to particular constructs and measurement conditions. Simulation fitting identified a distinguishable output range and revealed deviations under weak stimulation. Subsequent experiments need dose responses, blanks, and time courses to determine real parameters and usable color-readout ranges. </p>

:::

### 2.4 Dual-channel model: estimating target density from paired colors {#src-Project-Engineering-43 toc="Dual-channel model: estimating target density from paired colors"}

#### Design | estimating Mi density with unknown background abundance {#src-Project-Engineering-44 toc="Design | estimating Mi density with unknown background abundance"}

<p style="text-align:left;"> Both the <strong><em>Meloidogyne incognita</em> (<em>Mi</em>)</strong> and <strong><em>Caenorhabditis elegans</em> (<em>Ce</em>)</strong> may contribute ascr#3 and ascr#18. We designed two sensors with different ligand preferences and retained cross-responses, using paired colors from the same sample to estimate <em>Mi</em> density without knowing <em>Ce</em> abundance. </p><p>Nematode density is expressed as counts of <strong>second-stage juveniles (J2)</strong> per 100 cm³.</p>

#### Build | connecting mixed samples, ODEs, and smartphone readouts {#src-Project-Engineering-46 toc="Build | connecting mixed samples, ODEs, and smartphone readouts"}

<p style="text-align:left;"> We varied target and background densities independently and assigned different ligand compositions under an equal-total-release assumption. With the calibrated <strong>ordinary differential equation (ODE)</strong> fixed, we calculated paired pigment outputs from mixed samples and converted them to simulated smartphone <strong>red–green–blue (RGB)</strong> blue-channel readouts using a literature relationship. Negative logarithms of each channel's color ratio relative to its blank were then used to fit a three-coefficient regression mapping paired colors to <em>Mi</em> density. </p>

#### Test | comparing single- and dual-channel models on new combinations {#src-Project-Engineering-48 toc="Test | comparing single- and dual-channel models on new combinations"}

<p style="text-align:left;"> For new mixtures excluded from fitting, the dual-channel model recovered the preset <em>Mi</em> density with a <strong>root mean square error (RMSE)</strong> of approximately 3.01 J2/100 cm³, lower than either single-channel model. The two colors thus supplied complementary information under the current simulation conditions. Classification deviations remained near risk thresholds, so the model also checks input ranges and flags uncertain results that cross thresholds. </p>

#### Learn | connecting density error to risk assessment {#src-Project-Engineering-50 toc="Learn | connecting density error to risk assessment"}

:::note[Interpretation and next steps]

<p style="text-align:left;"> The simulation connected ODE color development, smartphone color features, and <em>Mi</em> density estimation, extending evaluation from overall error to risk assessment: acceptability of low-density error also depends on whether it changes the risk tier. We will calibrate smartphone color relationships with measured mixed samples and evaluate density estimation and risk classification on independent batches. </p>

:::

</section>

<section class="author-manuscript" lang="en">

## DBTL-3 | feedback from societal relevance {#src-Project-Engineering-53 toc="DBTL-3 | feedback from societal relevance"}

### 3.1 Economic modeling and refinement of detection requirements {#src-Project-Engineering-54 toc="Economic modeling and refinement of detection requirements"}

#### Design | defining the decision value of detection information {#src-Project-Engineering-55 toc="Design | defining the decision value of detection information"}

<p style="text-align:left;"> We compared testing costs with potentially avoided losses to examine how detection information affects growers' management choices and expected returns. </p>

#### Build | establishing cost accounting and management scenarios {#src-Project-Engineering-57 toc="Build | establishing cost accounting and management scenarios"}

<p style="text-align:left;"> We established a general cost-accounting framework that converts density-dependent yield losses into economic losses per unit area and compares costs and net returns across management scenarios. Preliminary analysis suggested that negative or positive results alone cannot reflect risk at different densities. We therefore defined low, medium, and high risk tiers, corresponding to no targeted control, moderate treatment, and intensive treatment, and compared tiered management with uniform treatment. </p>

#### Test | comparing the additional returns from density information {#src-Project-Engineering-59 toc="Test | comparing the additional returns from density information"}

<p style="text-align:left;"> Using Spanish protected tomato production as an example, density-based treatment tiers generated additional expected net returns over uniform moderate treatment under the example assumptions. </p>

<p style="text-align:left;"> Compared with no control, improved returns include the effects of control itself. Comparison with uniform treatment better examines whether detection information helps users make more appropriate management choices. </p>

#### Learn | feeding management requirements back into detection design {#src-Project-Engineering-62 toc="Learn | feeding management requirements back into detection design"}

:::note[Interpretation and next steps]

<p style="text-align:left;"> We refined the detection goal to provide semiquantitative or quantitative information supporting risk tiers, cover key density ranges where management changes, and indicate sampling and measurement uncertainty near thresholds. </p>

:::

<p style="text-align:left;"> Model outputs expanded from a single return-on-investment metric to detected density, estimated yield loss, risk tier, scenario-specific treatment, testing costs, and net-return comparisons, informing discussion of quantitative capability, sampling, and applications. Subsequent updates will combine wet-lab detection performance and sampling error with local prices, testing costs, and willingness to pay from <strong>Human Practices (HP)</strong> research to test these requirements under real conditions. </p>

</section>

<section class="author-manuscript" lang="en">

### 3.2 Refining user needs and detection objectives {#src-HP-Engineering-2 toc="Refining user needs and detection objectives"}

#### Design | identifying the agricultural decisions detection should support

<p style="text-align:left;"> When a sensor changes color, what can a grower do next? This question connected the observable response of engineered yeast with practical agricultural needs. Through questionnaires, expert consultation, and field visits, we explored who would use a detection tool, when testing would be most useful, and which management decisions results should support. </p>

#### Build | gathering user needs and production experience

<p style="text-align:left;"> We collected 369 questionnaire submissions, consulted experts in plant protection and related fields, and visited Tianjin Xiangyu Fruit and Vegetable Garden and the Diliubu Village Vegetable Demonstration Garden. Questionnaires identified tool expectations; interviews and visits placed those expectations in production settings to discuss testing time, existing management, and routine operational burdens. </p>

#### Test | examining application concepts against real scenarios

<p style="text-align:left;"> Respondents prioritized ease of use, accuracy and reliability, and affordability. Experts recommended connecting early detection with preplanting management so results could inform production planning. Grower discussions also reminded us that nematodes are not currently the dominant problem in every field; demand must be assessed against local crops, field conditions, and management experience. </p>

#### Learn | translating needs into evaluation requirements

<p style="text-align:left;"> This feedback made early warning more concrete: provide understandable, usable information at a time when it can influence management choices. We incorporated workflow and cost into evaluation and linked these with dry-lab economic analysis to examine the precision needed for risk tiers and whether testing costs match potential management benefits. </p>

### 3.3 Interpreting soil background and signal composition {#src-HP-Engineering-11 toc="Interpreting soil background and signal composition"}

#### Design | identifying interference in real samples

<p style="text-align:left;"> Samples introduce soil color and complex backgrounds into the detection system. 庞志豪 noted that these factors could affect color interpretation and that differential degradation of ascr#3 and ascr#18 might alter measured relative composition. Together with 刘倩's advice on matrix interference and staged validation, this prompted us to examine whether signals from real samples retain the intended information. </p>

#### Build | defining conditions for experimental and model checks

<p style="text-align:left;"> We separated two questions: how much observed color change comes from sensor response, and which sample backgrounds may affect it; and how measured ascaroside composition relates to sampling, storage, and molecular stability. These questions entered engineering discussions and guided real-sample controls, detection conditions, and tests of model assumptions. </p>

#### Test | studying background interference and signal composition

<p style="text-align:left;"> The team has undertaken work on soil-background interference and signal composition and retained corresponding records. Evaluation needs actual samples and controls to assess matrix effects on readouts and whether composition changes affect subsequent inference. Together, these lines of evidence determine the conditions under which color results should be interpreted and which factors need further testing. </p>

#### Learn | interpreting detection results according to evidence level

<p style="text-align:left;"> We further distinguished target-signal detection, signal composition, inference of nematode species and density, and disease-risk assessment. Each step toward agricultural decisions requires corresponding experimental or model support. We will test these relationships against relevant records, identify supported interpretations, and refine applicability conditions, analytical assumptions, and the next validation round. </p>

### 3.4 Designing sampling and the complete workflow {#src-HP-Engineering-20 toc="Designing sampling and the complete workflow"}

#### Design | incorporating field conditions into detection workflows

<p style="text-align:left;"> A soil sample passes through collection, storage, transport, and processing before producing a readout. Expert discussions highlighted effects of representativeness, extraction losses, and storage and transport, as well as the need to consider environmental release and post-test disposal of engineered yeast. We therefore expanded design to the entire process of sampling, preparation, sensor reaction, interpretation, and post-test handling. </p>

#### Build | collecting soil samples and preparing sampling guidance

<p style="text-align:left;"> The team organized soil collection and produced a sampling-guidance video to explain requirements. Sample identifiers link crops, locations, collection dates, and treatment histories, making production contexts traceable and retaining clues for comparing samples. </p>

#### Test | assessing workflow requirements through field practice

<p style="text-align:left;"> Field visits and expert discussions indicated differences between fields and greenhouses, requiring context-specific sampling, storage, and separate processing. Practical experience also highlighted clarity of instructions and completeness of background information. Further work must test how sampling and processing differences affect results and whether users can follow instructions for operations and sample handover. </p>

#### Learn | improving workflow evaluation and safety requirements

<p style="text-align:left;"> We included sample traceability, operational burden, and post-test disposal in subsequent evaluation and considered equipment, consumables, steps, storage, and transport across the workflow. The next stage will refine pretreatment and safe engineered-yeast disposal for the actual detection system, using real samples and operational records to assess usability and identify improvements. </p>

</section>

<section class="author-manuscript" lang="en">

## DBTL-4 | commercialization exploration and application pathways {#src-HP-Engineering-30 toc="DBTL-4 | commercialization exploration and application pathways"}

#### Design | identifying intended users and collaboration needs

<p style="text-align:left;"> Moving from laboratory research toward potential application requires answering who will use the test, who can help evaluate it, and what support continued development requires. We outlined testing costs, ease of use, and result interpretation for growers, farm managers, and agricultural service providers, focusing enterprise discussions on resources, application advice, and subsequent research conditions. </p>

#### Build | preparing enterprise outreach and pitch materials

<p style="text-align:left;"> The team prepared collaboration invitations, project proposals, and presentation slides outlining the agricultural problem, sensor concept, current work, and required support. These materials explain the problem being addressed, existing foundations, and possible participation. We established contact through email and alumni enterprise networks and delivered project presentations and pitches after initial contact. </p>

#### Test | holding discussions and securing resources

<p style="text-align:left;"> We discussed applications and collaboration with representatives of several enterprises and received sponsorship from organizations including ExCell Bio. This stage explored opportunities and secured research resources through practical communication. Records distinguish enterprise advice, expressed interest, and confirmed support, informing follow-up and separating established collaboration from directions requiring further discussion. </p>

#### Learn | defining the next collaboration pathway

<p style="text-align:left;"> Enterprise discussions supported continued research and clarified conditions needed for application validation. We plan to connect with agricultural enterprises, farms, and technical service providers for sample access, prototype evaluation, and real-world validation. Collaboration will require defined evaluation goals and responsibilities and increasingly specific plans addressing detection performance, operation, storage, transport, and safe disposal. </p>

</section>

</div>
