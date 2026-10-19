---
title: Results
heading: Results
sub: ''
crumbs:
  - Wet Lab
  - Results
route: results
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
## 1 DBTL-1: Heterologous Expression and Transmembrane Localization Verification of GPR2 {#dbtl-1-heterologous-expression-and-transmembrane-localization-verification-of-gpr2 toc="DBTL-1: Heterologous Expression and Transmembrane Localization Verification of GPR2"}

<p>In this cycle, we performed heterologous expression and transmembrane localization verification of GPR2. The construction strategy of verification strains and detection methods were iteratively optimized. The final results met our expectations, laying a foundation for the next DBTL cycle.</p>

### 1.1 The First Cycle {#the-first-cycle toc="The First Cycle"}

#### 1.1.1 Design {#design toc="Design | Planning GPR2 Expression and Localization Tests"}

<p>Based on the dry-lab screening results, we selected GPR2 as the receptor for display. To confirm that GPR2 can be heterologously expressed and correctly localized to the plasma membrane in our desired strain CEN.PK2‑1C, we devised an experimental workflow consisting of "construction of the GPR2‑sfGFP heterologous‑expression plasmid — gene knock‑in via yeast endogenous homologous recombination (HR) — assessment of expression and localization using fluorescence microscopy".</p>

For plasmid construction (Figure 1.a), our design rationale was as follows:

<p>a. The upstream and downstream sequences of the <em>STE2</em> CDS were utilized as the 5′‑homology arm and 3′‑homology arm to facilitate gene knock‑in via yeast endogenous homologous recombination (HR).</p>

<p>b. The constitutive TEF1 promoter was employed to drive gene expression. The cDNA sequence of <em>GPR2</em> was fused to the <em>sfGFP</em> sequence via a flexible linker for observation under fluorescence microscopy, followed by the CYC1 terminator.</p>

<p>c. The <em>Leu2</em> auxotrophic marker was used for transformant selection.</p>

#### 1.1.2 Build {#build toc="Build | Integrating the GPR2-sfGFP Expression Cassette"}

Firstly, the GPR2‑sfGFP heterologous expression plasmid was successfully assembled by one‑step cloning (Figure 1). The plasmid was then linearized and transformed into yeast. Positive transformants were validated to yield yeast strains carrying correctly knock‑in GPR2‑sfGFP (Figure 2).

:::figure

![Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP. a, Plasmid map of the pRS315-GPR2-sfGFP construct for heterologous GPR2-sfGFP expression. b, Colony PCR results during plasmid construction. Sample T3 showed the expected positive band, and this colony was selected for plasmid extraction. c, Double restriction digestion verification of pRS315-GPR2-sfGFP, with band sizes consistent with theoretical expectations.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-6a3e31c31a57-fig1-1.avif)

<p><strong>Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP.</strong> <strong>a</strong>, Plasmid map of the pRS315-GPR2-sfGFP construct for heterologous GPR2-sfGFP expression. <strong>b</strong>, Colony PCR results during plasmid construction. Sample T3 showed the expected positive band, and this colony was selected for plasmid extraction. <strong>c</strong>, Double restriction digestion verification of pRS315-GPR2-sfGFP, with band sizes consistent with theoretical expectations.</p>

:::

:::figure

![Figure 2. Yeast transformation of GPR2-sfGFP. a, Schematic diagram of yeast homologous recombination (HR). b, Verification results of transformants, confirming that GPR2-sfGFP was correctly integrated into the STE2 locus of the yeast genome.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b9bf38820eb8-fig1-2.avif)

Figure 2. Yeast transformation of GPR2-sfGFP. a, Schematic diagram of yeast homologous recombination (HR). b, Verification results of transformants, confirming that GPR2-sfGFP was correctly integrated into the STE2 locus of the yeast genome.

:::

#### 1.1.3 Test {#test toc="Test | Observing GPR2-sfGFP Fluorescence"}

<p>Upon examining GPR2‑sfGFP‑transformed yeast cells by fluorescence microscopy, we detected intense green fluorescent signals (Figure 3).</p>

:::figure

![Figure 3. Fluorescence microscopy results](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b5c833268081-fig1-3.avif)

Figure 3. Fluorescence microscopy results

:::

#### 1.1.4 Learn {#learn toc="Learn | Identifying the Need for Localization Controls"}

<p>While Figure 3 indicates that GPR2 is heterologously expressed and appears to localize to the plasma membrane, definitive evidence for authentic plasma‑membrane localization remains absent. We therefore moved on to the next DBTL cycle.</p>

### 1.2 The Second Cycle {#the-second-cycle toc="The Second Cycle"}

#### 1.2.1 Design and Build {#design-and-build toc="Design and Build | Preparing Cell-Wall and Membrane Staining Controls"}

To further confirm that GPR2 correctly localizes to the plasma membrane, we designed two sets of experiments:

a. Staining of the yeast cell wall with the cell-wall dye Calcofluor‑White (CFW);

<p>b. Staining of the yeast plasma membrane with the plasma‑membrane dye FM4‑64.</p>

#### 1.2.2 Test {#test-2 toc="Test | Comparing GFP with Cell-Wall and Membrane Signals"}

<p>With cell‑wall staining, we found that the fluorescence signal of GPR2‑sfGFP barely overlapped with the CFW signal and resided on the inner side of the cell wall (Figure 4).</p>

:::figure

![Figure 4. Calcofluor‑White (CFW) staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-66d05c9efec6-fig1-4.avif)

Figure 4. Calcofluor‑White (CFW) staining of yeast cells

:::

<p>When performing plasma‑membrane staining, we unintentionally gave FM4‑64‑exposed yeast an extra 30 min of incubation. GPR2‑sfGFP was found to co‑localize with the membrane dye at the plasma membrane and vacuole (Figure 5). Since FM4‑64 is known to trigger endocytosis<sup>[1]</sup>, this result suggests that plasma‑membrane‑localized GPR2‑sfGFP was internalized along with FM4‑64, further supporting correct plasma‑membrane targeting of GPR2. We also added fluorescence‑microscopy results from yeast under regular incubation conditions (Figure 5), matching our expectations.</p>

:::figure

![Figure 5. FM4‑64 staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ecc5dd246c41-fig1-5.avif)

Figure 5. FM4‑64 staining of yeast cells

:::

#### 1.2.3 Learn {#learn-2 toc="Learn | Assessing GPR2 Plasma-Membrane Localization"}

<p>Taken together, these results confirm that CEN.PK2‑1C can achieve heterologous expression and proper plasma‑membrane localization of GPR2, which is an essential prerequisite for chassis‑strain construction based on this host.</p>

### Reference {#reference toc="Reference"}

Vida TA, Emr SD. A new vital stain for visualizing vacuolar membrane dynamics and endocytosis in yeast. J Cell Biol. 1995 Mar;128(5):779-92. doi: 10.1083/jcb.128.5.779. PMID: 7533169; PMCID: PMC2120394.

## 2 DBTL-2: Engineering Construction of Ascaroside-Responsive Yeast Chassis {#dbtl-2-engineering-construction-of-ascaroside-responsive-yeast-chassis toc="DBTL-2: Engineering Construction of Ascaroside-Responsive Yeast Chassis"}

Building on the results of the previous cycle, we officially carried out the engineering construction of an ascaroside-responsive yeast chassis in this cycle. The strains constructed in this phase can be directly applied to product packaging and hardware development in the next research cycle.

### 2.1 The First Cycle {#the-first-cycle-2 toc="The First Cycle"}

#### 2.1.1 Design {#design-2 toc="Design | Planning Gal80 Knockout"}

<p>Based on the results of DBTL-1 and literature references<sup> [1][2]</sup>, we performed chassis modification on the CEN.PK2-1C strain. Firstly, we designed the knockout of the response-interfering gene <em>Gal80</em> (Figure 2.a) to relieve the repression of Gal gene expression by <em>Gal80</em>. We knocked out the <em>Gal80</em> gene via yeast homologous recombination (HR). Approximately 1 kb sequences flanking the upstream and downstream regions of the <em>Gal80</em> coding sequence were used as homologous arms for the knockout cassette, and Trp was adopted as the auxotrophic marker for transformant screening.</p>

#### 2.1.2 Build {#build-2 toc="Build | Assembling the Gal80 Knockout Cassette"}

<p>Firstly, we amplified the upstream and downstream homologous arms (5F is 1255 bp and 3F is 1406 bp.) of <em>Gal80</em> from the genomic DNA of CEN.PK2-1C strain and the Trp auxotrophic marker element (1081bp) from the pRS314 plasmid. The <em>Gal80</em> knockout cassette was successfully assembled via Double-joint PCR (Figure 1).</p>

:::figure

![Figure 1. Construction of Gal80 knockout cassette KOGal80. a, PCR amplification of the three fragments constituting KOGal80. b, KOGal80 cassette assembled by Double-joint PCR.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-54bc3d3f3bd3-fig2-1-1.avif)

Figure 1. Construction of Gal80 knockout cassette KOGal80. a, PCR amplification of the three fragments constituting KOGal80. b, KOGal80 cassette assembled by Double-joint PCR.

:::

#### 2.1.3 Test {#test-3 toc="Test | Verifying Gal80 Knockout Transformants"}

<p>Subsequently, we transformed the cassette into yeast cells. After genomic DNA extraction and transformant verification, yeast strains with successful <em>Gal80</em> knockout were obtained (Figure 2).</p>

:::figure

![Figure 2. Gal80 Gene Knockout. a, Schematic diagram of yeast homologous recombination (HR). b, Transformant verification results, confirming the successful knockout of the *Gal80* gene.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-f79bf47f490c-fig2-1-2.avif)

<p><strong>Figure 2. Gal80 Gene Knockout. a</strong>, Schematic diagram of yeast homologous recombination (HR). <strong>b</strong>, Transformant verification results, confirming the successful knockout of the <em>Gal80</em> gene.</p>

:::

#### 2.1.4 Learn {#learn-3 toc="Learn | Advancing to Synthetic Transcription Factor Construction"}

The response-interfering gene was knocked out in this round. According to the order of the signal transduction pathway, we next need to construct the synthetic transcription factor sTF, and therefore we proceed to the next cycle.

### 2.2 The Second Cycle {#the-second-cycle-2 toc="The Second Cycle"}

To efficiently construct the yeast chassis strain, this cycle was performed concurrently with the third cycle.

#### 2.2.1 Design {#design-3 toc="Design | Planning STE12 Knockout and sTF Integration"}

<p>To construct the sTF, we designed an experimental workflow including<em> STE12 </em>gene knockout, recombinant pRS315-sTF plasmid construction, sTF gene knock-in via yeast homologous recombination (HR), and transformant verification. </p>

Details are as follows:

<p>a. Sequences of approximately 1 kb upstream and downstream of the <em>STE12 </em>gene were selected as the homologous arms of the knockout cassette, and His was used as the auxotrophic marker for subsequent transformant screening and validation (Figure 5.a).</p>

<p> b. The upstream and downstream sequences of the <em>STE12</em> gene were used as the 5′ homologous arm (identical to the 5′ homologous arm of KOSTE12) and 3′ homologous arm, respectively. Between the two homologous arms, the synthetic transcription factor sTF fused by Gal4-DBD and STE12-PRD<sup> [1]</sup>, together with the Leu auxotrophic marker, was inserted to generate the homologous recombination plasmid pRS315-sTF (Figure 1).</p>

:::figure

![Figure 1. Plasmid map of the homologous recombination plasmid pRS315-sTF.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-e8d85e8ac64b-fig2-2-1.avif)

<p><strong>Figure 1. Plasmid map of the homologous recombination plasmid pRS315-sTF.</strong></p>

:::

#### 2.2.2 Build {#build-3 toc="Build | Assembling STE12 Knockout and sTF Constructs"}

<p>Firstly, we amplified the upstream and downstream homologous arms of<em> STE12</em> from the genomic DNA of strain CEN.PK2-1C (5F: 1082 bp, 3F: 1031 bp). Meanwhile, the His auxotrophic marker (1061 bp) was amplified from plasmid pRS313. The STE12 knockout cassette was successfully assembled via Double-joint PCR (Figure 2).</p>

:::figure

![Figure 2. Construction of the STE12 knockout cassette KOSTE12. a, PCR amplification results of the three fragments constituting KOSTE12. b, The KOSTE12 knockout cassette assembled by Double-joint PCR.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-c9dd0c23eba9-fig2-2-2.avif)

Figure 2. Construction of the STE12 knockout cassette KOSTE12. a, PCR amplification results of the three fragments constituting KOSTE12. b, The KOSTE12 knockout cassette assembled by Double-joint PCR.

:::

<p>Meanwhile, we designed and constructed the homologous recombination plasmid pRS315-sTF. However, after fragment amplification, one-step cloning, colony PCR and plasmid extraction, the double digestion result did not meet our expectation (Figure 3).</p>

:::figure

![Figure 3. The first attempt to construct pRS315-sTF plasmid. a, Colony PCR result. The No.6 colony was selected for plasmid extraction and subsequent double digestion, shown in panel b, It was difficult to confirm the correctness of the plasmid from this result.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-dd7eb6cbc85b-fig2-2-3.avif)

<p><strong>Figure 3. The first attempt to construct pRS315-sTF plasmid.</strong> <strong>a</strong>, Colony PCR result. The No.6 colony was selected for plasmid extraction and subsequent double digestion, shown in panel <strong>b</strong>, It was difficult to confirm the correctness of the plasmid from this result.</p>

:::

<p>Plasmid sequencing revealed that the KOSTE12-3F fragment failed to assemble (Figure 4.a). We suspected that lab power outage during the experiment impaired the activity of the one-step cloning enzyme and the competence of <em>E. coli</em> competent cells. Therefore, we re-performed the experiment based on the previously constructed plasmid and obtained correct digestion and sequencing results (Figure 4).</p>

:::figure

![Figure 4. The second attempt to construct the pRS315-sTF plasmid. a, Sequencing result of the first trial, showing that the 3F fragment was not assembled. b, Fragment amplification for the second plasmid construction. The fragment sizes from left to right are 3363 bp, 1620 bp, 1076 bp and 4301 bp. c, Double digestion verification of pRS315-sTF, consistent with expectations. d, Whole-plasmid sequencing result, confirming correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ff3d00fb6194-fig2-2-4.avif)

<p><strong>Figure 4. The second attempt to construct the pRS315-sTF plasmid.</strong> <strong>a</strong>, Sequencing result of the first trial, showing that the 3F fragment was not assembled. <strong>b</strong>, Fragment amplification for the second plasmid construction. The fragment sizes from left to right are 3363 bp, 1620 bp, 1076 bp and 4301 bp. <strong>c</strong>, Double digestion verification of pRS315-sTF, consistent with expectations. <strong>d</strong>, Whole-plasmid sequencing result, confirming correct base sequences in key regions.</p>

:::

#### 2.2.3 Test {#test-4 toc="Test | Checking STE12 Knockout Transformants"}

<p>Next, we first attempted to knock out the <em>STE12</em> gene. Despite three repeated trials, we failed to obtain positive results, and all transformants indicated unsuccessful knockout (Figure 5). Combined with identical issues encountered in the constitutive pigment expression verification of Cycle 3, we decided to redesign our experimental strategy.</p>

:::figure

![Figure 5. Schematic diagram of *STE12* gene knockout and transformant verification results, indicating unsuccessful knockout.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3b0197d8eb0c-fig2-2-5.avif)

<p><strong>Figure 5. Schematic diagram of </strong><strong><em>STE12</em></strong><strong> gene knockout and transformant verification results, indicating unsuccessful knockout.</strong></p>

:::

#### 2.2.4 Learn {#learn-4 toc="Learn | Switching to CRISPR-Cas9 Gene Editing"}

<p>After literature review, we hypothesized that the failure of gene knockout stemmed from the low efficiency of homologous recombination (HR), which was unsuitable for multiple rounds of genetic modification. Therefore, we adopted the CRISPR-Cas9 system<sup>[3][4] </sup>for gene editing. Together with Cycle 3, we advanced into Cycle 4.</p>

### 2.3 The Third Cycle {#the-third-cycle toc="The Third Cycle"}

This cycle was actually carried out in parallel with Cycle 2. The Learn section is largely consistent with that of Cycle 2 and will not be elaborated here.

#### 2.3.1 Design {#design-4 toc="Design | Planning Betaxanthin Expression Verification"}

<p>After constructing the strain carrying sTF, the next step was to introduce genes encoding inducibly expressed betaxanthin synthases. Since these two genes originate from plants, we designed a verification experiment to confirm that the two enzymes could be expressed in yeast and catalyze betaxanthin production. Accordingly, we constructed the homologous recombination plasmid pRS315-MjDOD-BvCYP76AD5 with a design similar to pRS315-sTF (Figure 1.a) and transformed it into yeast (Figure 2.a) to observe color development.</p>

#### 2.3.2 Build {#build-4 toc="Build | Troubleshooting the Betaxanthin Expression Plasmid"}

<p>After successfully amplifying the required fragments via PCR, we encountered a problem that plagued us for nearly one month: 11 attempts of plasmid construction using one-step cloning all failed. We faced a variety of issues, including no colony growth after transformation, fully negative bands in colony PCR, incorrect plasmid double digestion results, and erroneous sequencing data. Each time one problem was solved, another emerged, severely delaying our experimental progress.</p>

<p>Nevertheless, our team did not give up. Together with our instructors, we analyzed potential causes and proposed multiple solutions (see Contribution‑Experimental Methods and Practical Experience for details). Finally, we obtained correct results after replacing with fresh one-step cloning enzyme (Figure 1).</p>

:::figure

![Figure 1. Construction of pRS315-MjDOD-BvCYP76AD5 plasmid. a, Plasmid map of pRS315-MjDOD-BvCYP76AD5. b, Colony PCR identification for plasmid construction. Colony T5 was selected for plasmid extraction. c, Double digestion verification of pRS315-MjDOD-BvCYP76AD5; the band sizes of digested products matched the theoretical expectation. d, Whole-plasmid sequencing result, confirming correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-1e5da6928b73-fig2-3-1.avif)

<p><strong>Figure 1. Construction of pRS315-MjDOD-BvCYP76AD5 plasmid.</strong> <strong>a</strong>, Plasmid map of pRS315-MjDOD-BvCYP76AD5. <strong>b</strong>, Colony PCR identification for plasmid construction. Colony T5 was selected for plasmid extraction. <strong>c</strong>, Double digestion verification of pRS315-MjDOD-BvCYP76AD5; the band sizes of digested products matched the theoretical expectation. <strong>d</strong>, Whole-plasmid sequencing result, confirming correct base sequences in key regions.</p>

:::

#### 2.3.3 Test {#test-5 toc="Test | Examining Gene Integration and Yellow Coloration"}

<p>Subsequently, we linearized plasmid pRS315-MjDOD-BvCYP76AD5 and transformed it into yeast. Similar to the results from Cycle 2, we failed to achieve correct knock-in of the betaxanthin synthase genes for constitutive expression (Figure 2). However, we observed obvious yellow color in the transformed yeast (Figure 3). We hypothesized that the plasmid underwent self-circularization and existed episomally inside yeast cells.</p>

:::figure

![Figure 2. Schematic diagram of betaxanthin expression cassette transformation and transformant verification results, showing no insertion at the *Gal4* locus.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-bad380137ce7-fig2-3-2.avif)

<p><strong>Figure 2. Schematic diagram of betaxanthin expression cassette transformation and transformant verification results, showing no insertion at the </strong><strong><em>Gal4</em></strong><strong> locus.</strong></p>

:::

:::figure

![Figure 3. Yeast producing betaxanthin.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b80d515be3c2-fig2-3-3.avif)

Figure 3. Yeast producing betaxanthin.

:::

This result further demonstrated that homologous recombination (HR) had low efficiency and was not suitable for multiple rounds of genetic modification. Therefore, this cycle, together with Cycle 2, proceeded to Cycle 4.

### 2.4 The Fourth Cycle {#the-fourth-cycle toc="The Fourth Cycle"}

<p>Based on previous results, we adopted CRISPR-Cas9 for gene editing. The existing Cas9-carrying plasmid (p414-TEF1p-Cas9-CYC1t) uses Trp as its auxotrophic marker, which overlaps with the marker applied in our initial <em>Gal80</em> knockout. Therefore, we first replaced the auxotrophic marker of this plasmid with Leu (Figure 1). In addition, according to available references, we also needed to construct plasmids expressing specific sgRNAs (Figure 3) and corresponding donor DNA<sup>[3]</sup> (Figure 7, Figure 8). Thus, we formally started this cycle.</p>

:::figure

![Figure 1. Map of auxotrophic marker replacement for p414-Cas9 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-e034ba0dffbf-fig2-4-1.avif)

<p><strong>Figure 1. Map of auxotrophic marker replacement for p414-Cas9 plasmid.</strong></p>

:::

#### 2.4.1 Design {#design-5 toc="Design | Planning Cas9, sgRNA and Donor DNA Constructs"}

<p>We needed to construct three types of components: the Cas9 plasmid with replaced auxotrophic marker, plasmids expressing specific sgRNAs, and donor DNA. Consistent with our previous strategy, we assembled the required plasmids via one-step cloning. Notably, we initially intended to use Quick‑Change PCR for sgRNA plasmid construction. However, we encountered great difficulty in whole-plasmid amplification during practical operation. Consequently, we still adopted one-step cloning to build this plasmid.</p>

#### 2.4.2 Build {#build-5 toc="Build | Assembling CRISPR-Cas9 Editing Components"}

First, we constructed the Cas9 plasmid with replaced auxotrophic marker (Figure 1), and the construction was highly successful (Figure 2).

:::figure

![Figure 2. Construction of p414-Cas9-Leu plasmid. a, Colony PCR identification for plasmid construction. Colony T6 was selected for plasmid extraction. b, Double digestion verification of p414-Cas9-Leu; the band sizes of digested products matched the theoretical expectation. c, Whole-plasmid sequencing result, confirming correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-520027082450-fig2-4-2.avif)

<p><strong>Figure 2. Construction of p414-Cas9-Leu plasmid.</strong> <strong>a</strong>, Colony PCR identification for plasmid construction. Colony T6 was selected for plasmid extraction. <strong>b</strong>, Double digestion verification of p414-Cas9-Leu; the band sizes of digested products matched the theoretical expectation. <strong>c</strong>, Whole-plasmid sequencing result, confirming correct base sequences in key regions.</p>

:::

<p>Next, we constructed sgRNA plasmids targeting three genes: <em>STE12</em>, <em>Gal4</em> and <em>STE2 </em>(Figure 3).</p>

:::figure

![Figure 3. sgRNA expression plasmids. a, Plasmid map of p426-SNR52p-gSTE12-SUP4t. b, Plasmid map of p426-SNR52p-gGal4-SUP4t. c, Plasmid map of p426-SNR52p-gSTE2-SUP4t.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-35c2440a69e2-fig2-4-3.avif)

<p><strong>Figure 3. sgRNA expression plasmids.</strong> <strong>a</strong>, Plasmid map of p426-SNR52p-gSTE12-SUP4t. <strong>b</strong>, Plasmid map of p426-SNR52p-gGal4-SUP4t. <strong>c</strong>, Plasmid map of p426-SNR52p-gSTE2-SUP4t.</p>

:::

<p>Although Quick‑Change PCR failed to yield satisfactory results, our team successfully obtained three correct plasmids after switching to one-step cloning (shown in the figure below).</p>

:::figure

![Figure 4. Construction of p426-SNR52p-gSTE12-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-d982a8b520ff-fig2-4-4.avif)

<p><strong>Figure 4. Construction of p426-SNR52p-gSTE12-SUP4t plasmid.</strong></p>

:::

:::figure

![Figure 5. Construction of p426-SNR52p-gGal4-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-69de44f60d1c-fig2-4-5.avif)

<p><strong>Figure 5. Construction of p426-SNR52p-gGal4-SUP4t plasmid.</strong></p>

:::

:::figure

![Figure 6. Construction of p426-SNR52p-gSTE2-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-d5131d0a322f-fig2-4-6.avif)

<p><strong>Figure 6. Construction of p426-SNR52p-gSTE2-SUP4t plasmid.</strong></p>

:::

Finally, we constructed the corresponding donor DNA. The sTF fragment was amplified from plasmid pRS315‑sTF (https://registry.igem.org/parts/bba‑26iotmof). The gene fragment of betaxanthin synthase induced by the bidirectional Gal1/10 promoter (https://registry.igem.org/parts/bba‑2697laqw) was first amplified from plasmid pRS315‑MjDOD‑BvCYP76AD5, followed by Double‑Joint PCR amplification, using the same method as our previous fragment construction (Figure 7).

:::figure

![Figure 7. Fragment construction of Gal1/10bp-Betaxanthin Expression Cassette (a) and sTF Expression Cassette (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3fc8bdc1eede-fig2-4-7.avif)

Figure 7. Fragment construction of Gal1/10bp-Betaxanthin Expression Cassette (a) and sTF Expression Cassette (b).

:::

<p>For GPR2, since GPR2 in the previously constructed plasmid pRS315-TEF1p-GPR2-sfGFP is fused to sfGFP via a flexible linker, direct construction of the donor fragment was complicated. We therefore continued to use one-step cloning to assemble the plasmid (Figure 8), and finally successfully obtained pRS315-TEF1p-GPR2 for GPR2 knock-in (Figure 9).</p>

:::figure

![Figure 8. Plasmid map of pRS315-TEF1p-GPR2.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b849be4108e2-fig2-4-8.avif)

<p><strong>Figure 8. Plasmid map of pRS315-TEF1p-GPR2.</strong></p>

:::

:::figure

![Figure 9. Construction of pRS315-TEF1p-GPR2 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-17c9afd1d0d7-fig2-4-9.avif)

<p><strong>Figure 9. Construction of pRS315-TEF1p-GPR2 plasmid.</strong></p>

:::

#### 2.4.3 Test {#test-6 toc="Test | Verifying Cas9 Transformation and Genome Editing"}

With these components ready, we proceeded to yeast transformation.

<p>First, according to references<sup>[3]</sup>, we needed to construct yeast strains that constitutively express Cas9 protein. Therefore, we directly transformed plasmid p414-Cas9-Leu and obtained correct transformants (Figure 10.a), which were then prepared into competent cells.</p>

:::figure

![Figure 10. Transformant verification of p414-Cas9-Leu (a) and sTF transformant verification (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-2e431ac99756-fig2-4-10.avif)

<p><strong>Figure 10. Transformant verification of p414-Cas9-Leu (a) and sTF transformant verification (b).</strong></p>

:::

<p>Next, we co-transformed plasmid p426-SNR52p-gSTE12-SUP4t together with the sTF expression cassette (Figure 11). Gal4DBD was successfully recombined into the correct locus (Figure 10.b).</p>

:::figure

![Figure 11. Schematic diagram of sTF Expression Cassette transformation.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-a4204d900f23-fig2-4-11.avif)

Figure 11. Schematic diagram of sTF Expression Cassette transformation.

:::

<p>Subsequently, we co-transformed the p426-SNR52p-gGal4-SUP4t plasmid together with the Gal1/10bp-Betaxanthin Expression Cassette. The <em>Gal4</em> gene was successfully knocked out, and the betaxanthin synthase gene under the control of the Gal1/10 bidirectional promoter was simultaneously knocked in (Figure 12).</p>

:::figure

![Figure 2. Schematic diagram of Gal1/10bp-Betaxanthin Expression Cassette transformation (a) and transformant validation (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-66c1379247d8-r2-66c1379247d8-fig2-4-12.avif)

<p><strong>Figure 2</strong><strong>.</strong><strong> Schematic diagram of Gal1/10bp-Betaxanthin Expression Cassette transformation (a) and transformant validation (b).</strong></p>

:::

<p>Finally, we co-transformed the p426-SNR52p-gSTE2-SUP4t plasmid and linearized pRS315-TEF1p-GPR2 plasmid. The <em>GPR2</em> gene was successfully recombined into the <em>STE2</em> locus (Figure 13).</p>

Figure 13. Schematic diagram of GPR2 transformation (a) and transformant validation (b). (Placeholder)

#### 2.4.4 Learn {#learn-5 toc="Learn | Advancing to GPR2 Mutant Characterization"}

So far, the chassis engineered yeast strain of our project has been constructed. Meanwhile, the dry lab finished the modification of GPR2 mutants. We therefore moved to the next cycle to characterize the screened GPR2 mutants.

### 2.5 The Fifth Cycle {#the-fifth-cycle toc="The Fifth Cycle"}

#### 2.5.1 Design {#design-6 toc="Design | Planning GPR2 Mutant Strain Construction"}

Based on the results from previous cycles and dry lab, we still used one-step cloning to construct plasmids for transformation (Figure 1). Strain NKU-Y06 (Wet Lab-Experiments-Strain Construction) was utilized for genetic modification.

:::figure

![Figure 1. Plasmid maps of pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R.](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-5c10cfcd0e4c-r2-5c10cfcd0e4c-fig2-5-1.avif)

<p><strong>Figure 1. Plasmid maps of pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R.</strong></p>

:::

#### 2.5.2 Build and Test {#build-and-test toc="Build and Test | Constructing and Verifying GPR2 Mutant Plasmids"}

<p>We successfully constructed two plasmids, pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R, via one-step cloning. Sequencing verified that their sequences were correct (Figure 2).</p>

:::figure

![Figure 2. Construction of pRS315-TEF1p-GPR2-N84V (a) and pRS315-TEF1p-GPR2-V368R (b). Whole-plasmid sequencing confirmed the correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-28480e6cf5ad-r2-28480e6cf5ad-fig2-5-2.avif)

<p><strong>Figure 2. Construction of pRS315-TEF1p-GPR2-N84V (a) and pRS315-TEF1p-GPR2-V368R (b). </strong>Whole-plasmid sequencing confirmed the correct base sequences in key regions.</p>

:::

Subsequently, we mixed the p426-SNR52p-gSTE2-SUP4t plasmid with each of the two plasmids mentioned above and co-transformed them into strain NKU-Y06. The recombination locus was identical to that used for GPR2 knock-in. After transformant validation, we successfully obtained two strains carrying GPR2 mutants (Figure 3).

Figure 3. Transformant validation of GPR2 (a), GPR2-N84V (b), and GPR2-V368R (c). (Placeholder)

#### 2.5.3 Learn {#learn-6 toc="Learn | Identifying the Need for Test-Strip Productization"}

This cycle is hereby concluded. The strains constructed in this cycle can only function under laboratory conditions. For field applications, product formulation and packaging of the strains are required. Therefore, we proceeded to the third major DBTL cycle.

### References {#references toc="References"}

Fan C, Yuan J. Reshaping the yeast galactose regulon via GPCR signaling cascade. Cell Rep Methods. 2023 Dec 18;3(12):100647. doi: 10.1016/j.crmeth.2023.100647. Epub 2023 Nov 20. PMID: 37989311; PMCID: PMC10753199.

Cong Fan, Nike He, Jifeng Yuan, Cascaded amplifying circuit enables sensitive detection of fungal pathogens, Biosensors and Bioelectronics, Volume 250, 2024, 116058, ISSN 0956-5663, [https://doi.org/10.1016/j.bios.2024.116058](https://doi.org/10.1016/j.bios.2024.116058).

James E. DiCarlo, Julie E. Norville, Prashant Mali, Xavier Rios, John Aach, George M. Church, Genome engineering in Saccharomyces cerevisiae using CRISPR-Cas systems, Nucleic Acids Research, Volume 41, Issue 7, 1 April 2013, Pages 4336–4343, [https://doi.org/10.1093/nar/gkt135](https://doi.org/10.1093/nar/gkt135)，

Mans R, Wijsman M, Daran-Lapujade P, Daran JM. A protocol for introduction of multiple genetic modifications in Saccharomyces cerevisiae using CRISPR/Cas9. FEMS Yeast Res. 2018 Nov 1;18(7):foy063. doi: 10.1093/femsyr/foy063. PMID: 29860374; PMCID: PMC6074844.

<p class="author-source-link"><a href="/source-archive/#meeting-20261019" data-source-document="meeting-20261019-552fb139c19f">Original submission (.docx)</a><span role="status" aria-live="polite"></span></p>

<section class="author-manuscript" lang="en">

## <strong>3 DBTL-3: Test Strip Development and Productization</strong> {#dbtl-3-test-strip-development-and-productization}

<p style="text-align:justify;">Building upon the successful construction of engineered chassis strains through previous DBTL cycles, and integrating feedback from Human Practices (HP) surveys alongside practical application scenarios, we shifted our focus to another core objective of the project: developing a low-cost, user-friendly, and intuitive colorimetric detection platform. Therefore, this section focuses on the fabrication process and color development workflow of the engineered yeast-based test strips, encompassing three sub-cycles: substrate determination, immobilization optimization, and color development rate optimization. </p>

### <strong>3.1 Cycle 1: Substrate Determination</strong> {#results-3-1}

<p style="text-align:justify;">We reason that an ideal test strip substrate should possess high cell-loading capacity, excellent mechanical stability, reliable batch-to-batch consistency, and favorable water-retaining properties. Therefore, we initiate this cycle.</p>

<p style="text-align:left;">Design</p>

<p style="text-align:justify;">Based on the criteria, we select seven candidate substrates with representative properties: qualitative filter paper(Cellulose), weighing paper (sulfite paper), lens cleaning paper(Cotton fiber), laboratory wipes(Virgin wood pulp), thin glass fiber filter paper (Whatman™ GF/A), thick glass fiber filter paper (Whatman™ GF/B), and cellulose acetate filter paper.</p>

<p style="text-align:justify;">We suspend the cells in the protectant (glucose-free YPD + sucrose) and spot them onto each substrate. Following pre-freezing, lyophilization, recovery, and elution, the samples are plated for colony counting (defined as cell elution rate) to evaluate the binding affinity between each substrate and the yeast cells.</p>

<p style="text-align:justify;">Subsequently, for the substrates demonstrating superior properties, we conduct copper sulfate solution wicking experiments to evaluate their water absorption capacity.</p>

<p style="text-align:left;">Build &amp; Test</p>

<p style="text-align:justify;">First, we evaluate the cell-binding capacity of each substrate. The results are summarized in Table 1 below:</p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:20.4792%"><col style="width:22.1767%"><col style="width:57.3441%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:center;">Substrate Type</p></td><td colspan="1"><p style="text-align:center;"><strong>cell elution rate</strong></p></td><td colspan="1"><p style="text-align:center;"><strong>Performance Characteristics</strong></p></td></tr><tr><td colspan="1"><p style="text-align:center;">Cellulose</p></td><td colspan="1"><p style="text-align:center;">8%</p></td><td colspan="1"><p style="text-align:center;">Easy to cut, stable structure, relatively uniform liquid absorption</p></td></tr><tr><td colspan="1"><p style="text-align:center;">sulfite paper</p></td><td colspan="1"><p style="text-align:center;">27%</p></td><td colspan="1"><p style="text-align:center;">Strongly hydrophobic surface, extremely poor liquid absorption, forms surface bulges after lyophilization</p></td></tr><tr><td colspan="1"><p style="text-align:center;">Cotton fiber</p></td><td colspan="1"><p style="text-align:center;">3%</p></td><td colspan="1"><p style="text-align:center;">Extremely thin and soft, difficult to handle, poor cell-loading capacity</p></td></tr><tr><td colspan="1"><p style="text-align:center;">Virgin wood pulp</p></td><td colspan="1"><p style="text-align:center;">10%</p></td><td colspan="1"><p style="text-align:center;">Poor uniformity, inconsistent physical structure, difficult to standardize specifications</p></td></tr><tr><td colspan="1"><p style="text-align:center;">GF/B</p></td><td colspan="1"><p style="text-align:center;">3.4%</p></td><td colspan="1"><p style="text-align:center;">High liquid-loading capacity</p></td></tr><tr><td colspan="1"><p style="text-align:center;">GF/A</p></td><td colspan="1"><p style="text-align:center;">23.7%</p></td><td colspan="1"><p style="text-align:center;">Slightly lower toughness, moderate liquid-loading capacity</p></td></tr><tr><td colspan="1"><p style="text-align:center;"> Cellulose acetate </p></td><td colspan="1"><p style="text-align:center;">38.0%</p></td><td colspan="1"><p style="text-align:center;">Brittle, susceptible to static electricity, low liquid-loading capacity</p></td></tr></tbody></table></div>

<p style="text-align:center;"><strong>Table 1.</strong><strong>Evaluation of cell-binding capacity across candidate substrates</strong></p>

<p style="text-align:left;">Considering both the cell-binding capacity and the physical properties of each material, we select three substrates—GF/B, GF/A, and cellulose acetate—for the copper sulfate solution wicking experiment (Figure 1).</p>

<figure><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-e772d8a4854f55e5-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-e772d8a4854f55e5-00.json" alt="" loading="lazy"></a></figure>

<p style="text-align:center;"><strong>Figure 1. </strong><strong>Water absorption capacity evaluation of selected substrates</strong>（<strong> Insert image </strong><strong>“Fig3.1.1”</strong>）</p>

<p style="text-align:left;">The results demonstrate that GF/B not only exhibits strong binding capacity with yeast cells but also possesses superior water absorption ability.Learn</p>

<p style="text-align:justify;">Learn</p>

<p style="text-align:justify;">Based on the combined experimental results, Whatman™ GF/B thick glass fiber filter paper is selected as the final substrate for the test strip. GF/B demonstrates a liquid-loading capacity far exceeding other materials, allowing it to instantly absorb high-viscosity protectants without surface beading.</p>

<p style="text-align:justify;">Through this cycle, we have identified a suitable substrate material for the test strip. Next, we need to explore appropriate immobilization methods to lay a solid foundation for visual color development, leading us into the next cycle.</p>

### 3.2 Cycle 2: Immobilization Optimization {#results-3-2}

<p style="text-align:justify;">Following the selection of the test strip substrate, efficiently, uniformly, and precisely immobilizing yeast cells onto the strip becomes critical to ensuring detection reproducibility. Traditional direct spotting often leads to lateral leakage, while high-viscosity cell suspensions are difficult to disperse evenly and quantify accurately. </p>

<p style="text-align:justify;">To address this, we optimize immobilization across two dimensions—physical spatial confinement and biochemical/hardware sample loading. By creating hydrophobic barrier masks, refining protectant formulations, and introducing a vacuum-assisted filtration device, we achieve high-efficiency, stable cell immobilization on the test strip.</p>

<p style="text-align:left;">Design</p>

<p style="text-align:justify;">To refine the yeast cell immobilization process, we use adhesive masks to define the cell-immobilization zones and apply ergo.® 5300 instant adhesive vapor deposition to fabricate localized hydrophilic areas on the filter paper, thereby resolving issues such as lateral wicking and uneven cell distribution. </p>

<p style="text-align:justify;">Meanwhile, referencing literature<sup> [1]</sup>, we finalize the protectant formulation: sodium alginate (to increase viscosity), trehalose and glycerol (to provide cryoprotection), sodium glutamate (to protect cell membrane stability), and mannitol (to fill the sodium alginate matrix after lyophilization and prevent powdering). We also design a water loss experiment to verify the water-retaining efficacy of this protectant.</p>

<p style="text-align:justify;">In addition, we design a vacuum-assisted filtration spotting device to resolve the issue of high-viscosity protectant residues.</p>

<p style="text-align:left;">Build &amp; Test</p>

<p style="text-align:justify;">First, we develop a hydrophobic coating fumigation device. Through mask shielding and cyanoacrylate vapor fumigation processes, we successfully fabricate test strips with a hydrophilic immobilization zone of 5 mm in diameter. The results demonstrate that the hydrophobic test strips exhibit good hydrophobic effects across different metal salt solutions (Figure 2), ensuring that our engineered bacteria are target-immobilized within the intended hydrophilic area.</p>

<figure><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-c90ad92ed801865f-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-c90ad92ed801865f-00.json" alt="" loading="lazy"></a></figure>

<p style="text-align:justify;">Figure 2. Fumigation coating device (a), hydrophobic effect demonstration (b), circular hydrophilic zone demonstration (c). For (c), the surrounding experimental groups are created by placing the hydrophobic-treated test strips into solutions containing iron(III) chloride, cobalt(II) chloride, copper(II) sulfate, and manganese(II) chloride, respectively.</p>

<p style="text-align:justify;">Next, to verify the water-retaining performance of the protectant, we conduct dehydration kinetics and full-process lyophilization tests on it. The results show (Figure 3) that the new protectant forms a structurally intact film matrix after drying and effectively prevents collapse and powdering; furthermore, its smooth and uniform dehydration rate avoids physical damage to yeast cell membranes caused by severe water loss, thereby significantly enhancing cell structural integrity and survival rate during lyophilization.</p>

<figure><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-eab5bea814fd5141-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-eab5bea814fd5141-00.json" alt="" loading="lazy"></a></figure>

<p style="text-align:center;">Figure3. Water loss rate curve.</p>

<p style="text-align:justify;">Additionally, we self-fabricate a vacuum filtration spotting device (Figure 4). This device can rapidly draw the high-viscosity protectant suspension into the interior of the test strip substrate, which not only significantly improves spotting efficiency but also achieves standardized control over the cell-loading amount per individual test strip.</p>

<figure><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-1020073bd61e1101-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-1020073bd61e1101-00.json" alt="" loading="lazy"></a></figure>

<p style="text-align:center;">Figure 3.1.4. Schematic of the spotting process</p>

<p style="text-align:justify;">Integrating all the above methods and approaches, we prepare and obtain a batch of cell-loaded freeze-dried test strips available for downstream engineering (Figure 5).</p>

<figure><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ea1a49677396-fig3-1-5.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ea1a49677396-fig3-1-5.avif" alt="" loading="lazy"></a></figure>

<p style="text-align:center;">Figure 5. Overview of color-developing cell-loaded test strips.</p>

<p style="text-align:left;">Learn</p>

<p style="text-align:justify;">In this cycle, combining gas-phase hydrophobic coating with the refined lyophilization protectant successfully confines the cells within a uniform circular area; the vacuum-assisted spotting device eliminates liquid residue inside pipette tips, achieving controlled and quantitative cell-loading on the test strips; and we have successfully prepared freeze-dried live-cell test strips, as shown in Figure 3.1.5. Next, we officially proceed to optimize the color development rate of the test strips.</p>

### 3.3 Cycle 3: Color Development Rate Optimization {#results-3-3}

<p style="text-align:justify;">After completing the fabrication of the freeze-dried test strips, we require them to undergo rapid resuscitation and color development; therefore, we initiate this cycle.</p>

<p style="text-align:left;">Design</p>

<p style="text-align:justify;">To meet the requirements of rapid detection, freeze-dried cells must quickly emerge from their dormant state upon contact with liquid. First, to evaluate the feasibility of resuscitation, we immerse the freeze-dried test strips into YNB-free SC medium and PBS solution, respectively, and assess the impact of the amine donor tryptophan on color development stability. Next, focusing on the key limiting factors of the betaxanthin biosynthesis pathway, we systematically evaluate the effects of tyrosine concentration (precursor), surfactants (precursor amino acid uptake), antioxidant protectants, and glucose concentration (carbon source).</p>

<p style="text-align:left;">Build &amp; Test</p>

<p style="text-align:justify;">First, we complete a continuous observation and recording of freeze-dried test strip resuscitation via time-lapse photography (Video 1).</p>

<figure class="results-timelapse"><iframe title="Video 1. Observation of test strip resuscitation over 113 h" src="https://video.igem.org/videos/embed/vwRYoammvjP4TanUWTm7yy?start=0s&amp;stop=70s" allow="fullscreen" loading="lazy" sandbox="allow-scripts allow-same-origin" style="width:100%;aspect-ratio:16/9;border:0"></iframe><p>Playback is pending iGEM moderation.</p><p style="text-align:center;"><strong>Video 1. Observation of test strip resuscitation over 113 h</strong>（<strong> Insert video </strong><strong>“Video3.2.1”</strong>）</p></figure>

<p style="text-align:justify;">Subsequently, we carry out multiple control experiments to further explore the optimal conditions for test strip color development, performing RGB blue-channel grayscale quantification using ImageJ (Figure 6).</p>

<iframe class="author-screening-figure" title="Reactivation medium screening" src="/embeds/results-20261019/index.html" loading="lazy" sandbox="allow-scripts" style="width:100%;height:980px;border:0"></iframe><p style="text-align:center;"><strong>Figure 6. Control experiments for color development conditions.</strong> </p>

<p style="text-align:left;">Learn</p>

<p style="text-align:justify;">We observe that YNB-free SC medium as a resuscitation solution performs significantly better than PBS solution, and the amine donor tryptophan stabilizes yeast color development.</p>

<p style="text-align:justify;">The results of the color development condition control experiments further indicate that based on YNB-free SC selective medium, adding 2% glucose provides energy and a carbon source, tyrosine promotes precursor uptake and resuscitation, the surfactant (Tween 80) improves wettability and cell membrane permeability, and antioxidants protect betaxanthin stability. This optimized formulation overcomes the bottleneck of slow resuscitation in earlier stages and significantly accelerates the test strip color development rate.</p>

<p style="text-align:justify;">Meanwhile, considering the field application scenarios of our product, we design a 3D-printed test strip cassette to hold the test strip (Figure 7), making the detection workflow simpler and more convenient.</p>

<figure><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b5b9b9256085-fig3-2-2.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b5b9b9256085-fig3-2-2.avif" alt="" loading="lazy"></a></figure>

<p style="text-align:center;"><strong>Figure 7.</strong> <strong>3D-printed test strip cassette</strong><strong>（</strong><strong> Insert image </strong><strong>“Fig3.2.2”</strong><strong>）</strong></p>

<p style="text-align:justify;">At this point, we have closed the loop on test strip fabrication and application, establishing a solid foundation for subsequent on-site rapid detection of soil samples.</p>

<p style="text-align:left;"><strong>References</strong></p>

<p style="text-align:left;">Rachel A. Miller, Galen Brown, Elsa Barron, Jamie L. Luther, Marya Lieberman, Holly V. Goodson; Development of a paper-immobilized yeast biosensor for the detection of physiological concentrations of doxycycline in technology-limited settings. <em>Anal. Methods</em> 2020; 12 (16): 2123–2132. <a href="https://doi.org/10.1039/d0ay00001a">https://doi.org/10.1039/d0ay00001a</a></p>

<p style="text-align:left;">Parbir S. Grewal, Cyrus Modavi, Zachary N. Russ, Nicholas C. Harris, John E. Dueber, Bioproduction of a betalain color palette in Saccharomyces cerevisiae, Metabolic Engineering, Volume 45, 2018, Pages 180-188, ISSN 1096-7176, <a href="https://doi.org/10.1016/j.ymben.2017.12.008">https://doi.org/10.1016/j.ymben.2017.12.008</a>.</p>

<p style="text-align:left;">Ostrov N, Jimenez M, Billerbeck S, et al. A modular yeast biosensor for low-cost point-of-care pathogen detection. Sci Adv. 2017;3(6):e1603221. doi:10.1126/sciadv.1603221.</p>

<p style="text-align:left;">Shin HJ, Park HH, Lim WK. Freeze-dried recombinant bacteria for on-site detection of phenolic compounds by color change. J Biotechnol. 2005;119(1):36-43. doi:10.1016/j.jbiotec.2005.06.002.</p>

<p style="text-align:left;">Poirier I, Marechal PA, Richard S, Gervais P. Saccharomyces cerevisiae viability is strongly dependant on rehydration kinetics and the temperature of dried cells. J Appl Microbiol. 1999;86(1):87-92. doi:10.1046/j.1365-2672.1999.00638.x.</p>

<p style="text-align:left;"><br></p>

</section>

<span id="results-3-1-1" aria-hidden="true"></span>
<span id="results-stage-3-1-1-1" aria-hidden="true"></span>
<span id="results-stage-3-1-2-3" aria-hidden="true"></span>
<span id="results-3-1-2" aria-hidden="true"></span>
<span id="results-stage-3-1-2-1" aria-hidden="true"></span>
<span id="results-stage-3-1-2-3-2" aria-hidden="true"></span>
<span id="results-3-1-3" aria-hidden="true"></span>
<span id="results-stage-3-1-3-1" aria-hidden="true"></span>
<span id="results-stage-3-1-3-3" aria-hidden="true"></span>
<span id="results-3-2-1" aria-hidden="true"></span>
<span id="results-stage-3-2-1-1" aria-hidden="true"></span>
<span id="results-stage-3-2-1-3" aria-hidden="true"></span>
<span id="results-3-2-2" aria-hidden="true"></span>
<span id="results-stage-3-2-2-1" aria-hidden="true"></span>
<span id="results-stage-3-2-2-3" aria-hidden="true"></span>
<span id="results-3-2-3" aria-hidden="true"></span>
<span id="results-stage-3-2-3-1" aria-hidden="true"></span>
<span id="results-stage-3-2-3-3" aria-hidden="true"></span>
