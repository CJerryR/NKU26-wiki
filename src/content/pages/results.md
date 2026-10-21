---
title: Results
heading: Results
sub: ''
crumbs:
  - Wet lab
  - Results
route: results
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout" lang="en">

## DBTL-1: heterologous expression and transmembrane localization verification of GPR2 {#dbtl-1-heterologous-expression-and-transmembrane-localization-verification-of-gpr2 toc="DBTL-1: heterologous expression and transmembrane localization verification of GPR2"}

<p>In this cycle, we performed heterologous expression and transmembrane localization verification of GPR2. The construction strategy of verification strains and detection methods were iteratively optimized. The final results met our expectations, laying a foundation for the next design–build–test–learn (DBTL) cycle.</p>

### 1.1 Cycle 1: expression and localization {#the-first-cycle toc="Cycle 1: expression and localization"}

#### Design {#design toc="Design | planning GPR2 expression and localization tests"}

<p>Based on the dry-lab screening results, we selected GPR2 as the receptor for display. To confirm that GPR2 can be heterologously expressed and correctly localized to the plasma membrane in our desired strain CEN.PK2-1C, we devised an experimental workflow consisting of "construction of the GPR2-sfGFP heterologous-expression plasmid — gene knock-in via yeast endogenous homologous recombination (HR) — assessment of expression and localization using fluorescence microscopy".</p>

For plasmid construction (Figure 1a), our design rationale was as follows:

<p>a. The upstream and downstream sequences of the <em>STE2</em> coding sequence were utilized as the 5′-homology arm and 3′-homology arm to facilitate gene knock-in via yeast endogenous HR.</p>

<p>b. The constitutive TEF1 promoter was employed to drive gene expression. The complementary DNA sequence of <em>GPR2</em> was fused to the <em>superfolder green fluorescent protein</em> sequence via a flexible linker for observation under fluorescence microscopy, followed by the CYC1 terminator.</p>

<p>c. The <em>Leu2</em> auxotrophic marker was used for transformant selection.</p>

#### Build {#build toc="Build | integrating the GPR2-sfGFP expression cassette"}

Firstly, the GPR2-sfGFP heterologous expression plasmid was successfully assembled by one-step cloning (Figure 1). The plasmid was then linearized and transformed into yeast. Positive transformants were validated to yield yeast strains carrying correctly knock-in GPR2-sfGFP (Figure 2).

:::note[Note]

A negative image of the stained gel is shown for better visualization of the PCR fragments.

:::

:::figure

![Construction of the plasmid for heterologous expression of GPR2-sfGFP.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-6a3e31c31a57-fig1-1.avif)

<p>Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP. (a) Plasmid map of the pRS315-GPR2-sfGFP construct for heterologous GPR2-sfGFP expression. (b) Colony polymerase chain reaction (PCR) results during plasmid construction. Sample T3 showed the expected positive band, and this colony was selected for plasmid extraction. (c) Double restriction digestion verification of pRS315-GPR2-sfGFP, with band sizes consistent with theoretical expectations.</p>

:::

:::figure

![Yeast transformation of GPR2-sfGFP.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b9bf38820eb8-fig1-2.avif)

Figure 2. Yeast transformation of GPR2-sfGFP. (a) Schematic diagram of yeast HR. (b) Verification results of transformants, confirming that GPR2-sfGFP was correctly integrated into the STE2 locus of the yeast genome.

:::

#### Test {#test toc="Test | observing GPR2-sfGFP fluorescence"}

<p>Upon examining GPR2-sfGFP-transformed yeast cells by fluorescence microscopy, we detected intense green fluorescent signals (Figure 3).</p>

:::figure

![Fluorescence microscopy results](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b5c833268081-fig1-3.avif)

Figure 3. Fluorescence microscopy results

:::

#### Learn {#learn toc="Learn | identifying the need for localization controls"}

<p>While Figure 3 indicates that GPR2 is heterologously expressed and appears to localize to the plasma membrane, definitive evidence for authentic plasma-membrane localization remains absent. We therefore moved on to the next DBTL cycle.</p>

### 1.2 Cycle 2: localization validation {#the-second-cycle toc="Cycle 2: localization validation"}

#### Design and build {#design-and-build toc="Design and build | preparing cell-wall and membrane staining controls"}

To further confirm that GPR2 correctly localizes to the plasma membrane, we designed two sets of experiments:

a. Staining of the yeast cell wall with the cell-wall dye Calcofluor White;

<p>b. Staining of the yeast plasma membrane with the plasma-membrane dye FM4-64.</p>

#### Test {#test-2 toc="Test | comparing GFP with cell-wall and membrane signals"}

<p>With cell-wall staining, we found that the fluorescence signal of GPR2-sfGFP barely overlapped with the Calcofluor White signal and resided on the inner side of the cell wall (Figure 4).</p>

:::figure

![Calcofluor White (CFW) staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-66d05c9efec6-fig1-4.avif)

Figure 4. CFW staining of yeast cells

:::

<p>When performing plasma-membrane staining, we unintentionally gave FM4-64-exposed yeast an extra 30 min of incubation. GPR2-sfGFP was found to colocalize with the membrane dye at the plasma membrane and vacuole (Figure 5). Since FM4-64 is known to trigger endocytosis<sup>[1]</sup>, this result suggests that plasma-membrane-localized GPR2-sfGFP was internalized along with FM4-64, further supporting correct plasma-membrane targeting of GPR2. We also added fluorescence-microscopy results from yeast under regular incubation conditions (Figure 5), matching our expectations.</p>

:::figure

![FM4-64 staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ecc5dd246c41-fig1-5.avif)

Figure 5. FM4-64 staining of yeast cells

:::

#### Learn {#learn-2 toc="Learn | assessing GPR2 plasma-membrane localization"}

<p>Taken together, these results confirm that CEN.PK2-1C can achieve heterologous expression and proper plasma-membrane localization of GPR2, which is an essential prerequisite for chassis-strain construction based on this host.</p>

### 1.3 Reference {#reference toc="Reference"}

<p>1. Vida, T. A., & Emr, S. D. (1995). A new vital stain for visualizing vacuolar membrane dynamics and endocytosis in yeast. <em>Journal of Cell Biology</em>, <em>128</em>(5), 779–792. https://doi.org/10.1083/jcb.128.5.779</p>

## DBTL-2: engineering construction of ascaroside-responsive yeast chassis {#dbtl-2-engineering-construction-of-ascaroside-responsive-yeast-chassis toc="DBTL-2: engineering construction of ascaroside-responsive yeast chassis"}

Building on the results of the previous cycle, we officially carried out the engineering construction of an ascaroside-responsive yeast chassis in this cycle. The strains constructed in this phase can be directly applied to product packaging and hardware development in the next research cycle.

### 2.1 Cycle 1: Gal80 knockout {#the-first-cycle-2 toc="Cycle 1: Gal80 knockout"}

#### Design {#design-2 toc="Design | planning Gal80 knockout"}

<p>Based on the results of DBTL-1 and literature references<sup>[2][3]</sup>, we performed chassis modification on the CEN.PK2-1C strain. Firstly, we designed the knockout of the response-interfering gene <em>Gal80</em> (Figure 7a) to relieve the repression of Gal gene expression by <em>Gal80</em>. We knocked out the <em>Gal80</em> gene via yeast HR. Approximately 1 kb sequences flanking the upstream and downstream regions of the <em>Gal80</em> coding sequence were used as homologous arms for the knockout cassette, and Trp was adopted as the auxotrophic marker for transformant screening.</p>

#### Build {#build-2 toc="Build | assembling the Gal80 knockout cassette"}

<p>Firstly, we amplified the upstream and downstream homologous arms (5F is 1255 bp and 3F is 1406 bp.) of <em>Gal80</em> from the genomic deoxyribonucleic acid (DNA) of CEN.PK2-1C strain and the Trp auxotrophic marker element (1081 bp) from the pRS314 plasmid. The <em>Gal80</em> knockout cassette was successfully assembled via double-joint PCR (DJ-PCR) (Figure 6).</p>

:::figure

![Construction of Gal80 knockout cassette KOGal80.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-54bc3d3f3bd3-fig2-1-1.avif)

Figure 6. Construction of Gal80 knockout cassette KOGal80. (a) PCR amplification of the three fragments constituting KOGal80. (b) KOGal80 cassette assembled by DJ-PCR.

:::

#### Test {#test-3 toc="Test | verifying Gal80 knockout transformants"}

<p>Subsequently, we transformed the cassette into yeast cells. After genomic DNA extraction and transformant verification, yeast strains with successful <em>Gal80</em> knockout were obtained (Figure 7).</p>

:::figure

![Gal80 Gene Knockout.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-f79bf47f490c-fig2-1-2.avif)

<p>Figure 7. Gal80 gene knockout. (a) Schematic diagram of yeast HR. (b) Transformant verification results, confirming the successful knockout of the <em>Gal80</em> gene.</p>

:::

#### Learn {#learn-3 toc="Learn | advancing to synthetic transcription factor construction"}

The response-interfering gene was knocked out in this round. According to the order of the signal transduction pathway, we next need to construct the synthetic transcription factor (sTF), and therefore we proceed to the next cycle. Its fusion components contain the DNA-binding domain of Gal4 and the pheromone-responsive domain of STE12.

### 2.2 Cycle 2: STE12 knockout {#the-second-cycle-2 toc="Cycle 2: STE12 knockout"}

To efficiently construct the yeast chassis strain, this cycle was performed concurrently with the third cycle.

#### Design {#design-3 toc="Design | planning STE12 knockout and sTF integration"}

<p>To construct the sTF, we designed an experimental workflow including<em> STE12 </em>gene knockout, recombinant pRS315-sTF plasmid construction, sTF gene knock-in via yeast HR, and transformant verification. </p>

Details are as follows:

<p>a. Sequences of approximately 1 kb upstream and downstream of the <em>STE12 </em>gene were selected as the homologous arms of the knockout cassette, and His was used as the auxotrophic marker for subsequent transformant screening and validation (Figure 12a).</p>

::::figuretext{side=right width=medium flow=wrap}

:::figure

![Plasmid map of the homologous recombination plasmid pRS315-sTF.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-e8d85e8ac64b-fig2-2-1.avif)

<p>Figure 8. Plasmid map of the HR plasmid pRS315-sTF.</p>

:::

<p> b. The upstream and downstream sequences of the <em>STE12</em> gene were used as the 5′ homologous arm (identical to the 5′ homologous arm of KOSTE12) and 3′ homologous arm, respectively. Between the two homologous arms, the sTF fused by Gal4-DNA-binding domain and STE12-pheromone-responsive domain<sup>[2]</sup>, together with the Leu auxotrophic marker, was inserted to generate the HR plasmid pRS315-sTF (Figure 8).</p>

::::

#### Build {#build-3 toc="Build | assembling STE12 knockout and sTF constructs"}

<p>Firstly, we amplified the upstream and downstream homologous arms of<em> STE12</em> from the genomic DNA of strain CEN.PK2-1C (5F: 1082 bp, 3F: 1031 bp). Meanwhile, the His auxotrophic marker (1061 bp) was amplified from plasmid pRS313. The STE12 knockout cassette was successfully assembled via DJ-PCR (Figure 9).</p>

:::figure

![Construction of the STE12 knockout cassette KOSTE12.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-c9dd0c23eba9-fig2-2-2.avif)

Figure 9. Construction of the STE12 knockout cassette KOSTE12. (a) PCR amplification results of the three fragments constituting KOSTE12. (b) the KOSTE12 knockout cassette assembled by DJ-PCR.

:::

<p>Meanwhile, we designed and constructed the HR plasmid pRS315-sTF. However, after fragment amplification, one-step cloning, colony polymerase chain reaction (PCR) and plasmid extraction, the double digestion result did not meet our expectation (Figure 10).</p>

:::figure

![The first attempt to construct pRS315-sTF plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-dd7eb6cbc85b-fig2-2-3.avif)

<p>Figure 10. The first attempt to construct pRS315-sTF plasmid. (a) Colony PCR result. The No.6 colony was selected for plasmid extraction and subsequent double digestion, shown in panel (b) It was difficult to confirm the correctness of the plasmid from this result.</p>

:::

<p>Plasmid sequencing revealed that the KOSTE12-3F fragment failed to assemble (Figure 11a). We suspected that lab power outage during the experiment impaired the activity of the one-step cloning enzyme and the competence of <em>Escherichia coli</em> (<em>E. coli</em>) competent cells. Therefore, we re-performed the experiment based on the previously constructed plasmid and obtained correct digestion and sequencing results (Figure 11).</p>

:::figure

![The second attempt to construct the pRS315-sTF plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ff3d00fb6194-fig2-2-4.avif)

<p>Figure 11. The second attempt to construct the pRS315-sTF plasmid. (a) Sequencing result of the first trial, showing that the 3F fragment was not assembled. (b) Fragment amplification for the second plasmid construction. The fragment sizes from left to right are 3363 bp, 1620 bp, 1076 bp and 4301 bp. (c) Double digestion verification of pRS315-sTF, consistent with expectations. (d) Whole-plasmid sequencing result, confirming correct base sequences in key regions.</p>

:::

#### Test {#test-4 toc="Test | checking STE12 knockout transformants"}

<p>Next, we first attempted to knock out the <em>STE12</em> gene. Despite three repeated trials, we failed to obtain positive results, and all transformants indicated unsuccessful knockout (Figure 12). Combined with identical issues encountered in the constitutive pigment expression verification of Cycle 3, we decided to redesign our experimental strategy.</p>

:::figure

![Schematic diagram of *STE12* gene knockout and transformant verification results, indicating unsuccessful knockout.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3b0197d8eb0c-fig2-2-5.avif)

<p>Figure 12. Schematic diagram of <em>STE12</em> gene knockout and transformant verification results, indicating unsuccessful knockout.</p>

:::

#### Learn {#learn-4 toc="Learn | switching to CRISPR-Cas9 gene editing"}

<p>After literature review, we hypothesized that the failure of gene knockout stemmed from the low efficiency of HR, which was unsuitable for multiple rounds of genetic modification. Therefore, we adopted the clustered regularly interspaced short palindromic repeats–CRISPR-associated protein 9 (CRISPR-Cas9) system<sup>[4][5]</sup>for gene editing. Together with Cycle 3, we advanced into Cycle 4.</p>

### 2.3 Cycle 3: betaxanthin expression {#the-third-cycle toc="Cycle 3: betaxanthin expression"}

This cycle was actually carried out in parallel with Cycle 2. The Learn section is largely consistent with that of Cycle 2 and will not be elaborated here.

#### Design {#design-4 toc="Design | planning betaxanthin expression verification"}

<p>After constructing the strain carrying sTF, the next step was to introduce genes encoding inducibly expressed betaxanthin synthases. Since these two genes originate from plants, we designed a verification experiment to confirm that the two enzymes could be expressed in yeast and catalyze betaxanthin production. Accordingly, we constructed the HR plasmid pRS315-MjDOD-BvCYP76AD5 with a design similar to pRS315-sTF (Figure 13a) and transformed it into yeast (Figure 14a) to observe color development.</p>

#### Build {#build-4 toc="Build | troubleshooting the betaxanthin expression plasmid"}

<p>After successfully amplifying the required fragments via PCR, we encountered a problem that plagued us for nearly one month: 11 attempts of plasmid construction using one-step cloning all failed. We faced a variety of issues, including no colony growth after transformation, fully negative bands in colony PCR, incorrect plasmid double digestion results, and erroneous sequencing data. Each time one problem was solved, another emerged, severely delaying our experimental progress.</p>

<p>Nevertheless, our team did not give up. Together with our instructors, we analyzed potential causes and proposed multiple solutions (see Contribution-Experimental Methods and Practical Experience for details). Finally, we obtained correct results after replacing with fresh one-step cloning enzyme (Figure 13).</p>

:::figure

![Construction of pRS315-MjDOD-BvCYP76AD5 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-1e5da6928b73-fig2-3-1.avif)

<p>Figure 13. Construction of pRS315-MjDOD-BvCYP76AD5 plasmid. (a) Plasmid map of pRS315-MjDOD-BvCYP76AD5. (b) Colony PCR identification for plasmid construction. Colony T5 was selected for plasmid extraction. (c) Double digestion verification of pRS315-MjDOD-BvCYP76AD5; the band sizes of digested products matched the theoretical expectation. (d) Whole-plasmid sequencing result, confirming correct base sequences in key regions.</p>

:::

#### Test {#test-5 toc="Test | examining gene integration and yellow coloration"}

<p>Subsequently, we linearized plasmid pRS315-MjDOD-BvCYP76AD5 and transformed it into yeast. Similar to the results from Cycle 2, we failed to achieve correct knock-in of the betaxanthin synthase genes for constitutive expression (Figure 14). However, we observed obvious yellow color in the transformed yeast (Figure 15). We hypothesized that the plasmid underwent self-circularization and existed episomally inside yeast cells.</p>

:::figure

![Schematic diagram of betaxanthin expression cassette transformation and transformant verification results, showing no insertion at the *Gal4* locus.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-bad380137ce7-fig2-3-2.avif)

<p>Figure 14. Schematic diagram of betaxanthin expression cassette transformation and transformant verification results, showing no insertion at the <em>Gal4</em> locus.</p>

:::

:::figure

![Yeast producing betaxanthin.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b80d515be3c2-fig2-3-3.avif)

Figure 15. Yeast producing betaxanthin.

:::

This result further demonstrated that HR had low efficiency and was not suitable for multiple rounds of genetic modification. Therefore, this cycle, together with Cycle 2, proceeded to Cycle 4.

### 2.4 Cycle 4: CRISPR-mediated construction {#the-fourth-cycle toc="Cycle 4: CRISPR-mediated construction"}

<p>Based on previous results, we adopted CRISPR-Cas9 for gene editing. The existing Cas9-carrying plasmid (p414-TEF1p-Cas9-CYC1t) uses Trp as its auxotrophic marker, which overlaps with the marker applied in our initial <em>Gal80</em> knockout. Therefore, we first replaced the auxotrophic marker of this plasmid with leucine (Leu) (Figure 16). The guide molecules consist of ribonucleic acid. In addition, according to available references, we also needed to construct plasmids expressing specific single-guide RNAs (sgRNAs) (Figure 18) and corresponding donor DNA<sup>[4]</sup> (Figure 22, Figure 23). Thus, we formally started this cycle.</p>

:::figure

![Map of auxotrophic marker replacement for p414-Cas9 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-e034ba0dffbf-fig2-4-1.avif)

<p>Figure 16. Map of auxotrophic marker replacement for p414-Cas9 plasmid.</p>

:::

#### Design {#design-5 toc="Design | planning Cas9, sgRNA and donor DNA constructs"}

<p>We needed to construct three types of components: the Cas9 plasmid with replaced auxotrophic marker, plasmids expressing specific sgRNAs, and donor DNA. Consistent with our previous strategy, we assembled the required plasmids via one-step cloning. Notably, we initially intended to use Quick-Change PCR for sgRNA plasmid construction. However, we encountered great difficulty in whole-plasmid amplification during practical operation. Consequently, we still adopted one-step cloning to build this plasmid.</p>

#### Build {#build-5 toc="Build | assembling CRISPR-Cas9 editing components"}

First, we constructed the Cas9 plasmid with replaced auxotrophic marker (Figure 16), and the construction was highly successful (Figure 17).

:::figure

![Construction of p414-Cas9-Leu plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-520027082450-fig2-4-2.avif)

<p>Figure 17. Construction of p414-Cas9-Leu plasmid. (a) Colony PCR identification for plasmid construction. Colony T6 was selected for plasmid extraction. (b) Double digestion verification of p414-Cas9-Leu; the band sizes of digested products matched the theoretical expectation. (c) Whole-plasmid sequencing result, confirming correct base sequences in key regions.</p>

:::

<p>Next, we constructed sgRNA plasmids targeting three genes: <em>STE12</em>, <em>Gal4</em> and <em>STE2 </em>(Figure 18).</p>

:::figure

![sgRNA expression plasmids.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-35c2440a69e2-fig2-4-3.avif)

<p>Figure 18. sgRNA expression plasmids. (a) Plasmid map of p426-SNR52p-gSTE12-SUP4t. (b) Plasmid map of p426-SNR52p-gGal4-SUP4t. (c) Plasmid map of p426-SNR52p-gSTE2-SUP4t.</p>

:::

<p>Although Quick-Change PCR failed to yield satisfactory results, our team successfully obtained three correct plasmids after switching to one-step cloning (shown in the figure below).</p>

:::figure

![Construction of p426-SNR52p-gSTE12-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-d982a8b520ff-fig2-4-4.avif)

<p>Figure 19. Construction of p426-SNR52p-gSTE12-SUP4t plasmid.</p>

:::

:::figure

![Construction of p426-SNR52p-gGal4-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-69de44f60d1c-fig2-4-5.avif)

<p>Figure 20. Construction of p426-SNR52p-gGal4-SUP4t plasmid.</p>

:::

:::figure

![Construction of p426-SNR52p-gSTE2-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-d5131d0a322f-fig2-4-6.avif)

<p>Figure 21. Construction of p426-SNR52p-gSTE2-SUP4t plasmid.</p>

:::

Finally, we constructed the corresponding donor DNA. The sTF fragment was amplified from plasmid pRS315-sTF (https://registry.igem.org/parts/bba-26iotmof). The gene fragment of betaxanthin synthase induced by the bidirectional Gal1/10 promoter (https://registry.igem.org/parts/bba-2697laqw) was first amplified from plasmid pRS315-MjDOD-BvCYP76AD5, followed by DJ-PCR amplification, using the same method as our previous fragment construction (Figure 22).

:::figure

![Fragment construction of Gal1/10bp-Betaxanthin Expression Cassette (a) and sTF Expression Cassette (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3fc8bdc1eede-fig2-4-7.avif)

Figure 22. Fragment construction of Gal1/10bp-betaxanthin expression cassette (a) and sTF expression cassette (b).

:::

::::figuretext{side=right width=medium flow=wrap}

:::figure

![Plasmid map of pRS315-TEF1p-GPR2.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b849be4108e2-fig2-4-8.avif)

<p>Figure 23. Plasmid map of pRS315-TEF1p-GPR2.</p>

:::

<p>For GPR2, since GPR2 in the previously constructed plasmid pRS315-TEF1p-GPR2-sfGFP is fused to sfGFP via a flexible linker, direct construction of the donor fragment was complicated. We therefore continued to use one-step cloning to assemble the plasmid (Figure 23), and finally successfully obtained pRS315-TEF1p-GPR2 for GPR2 knock-in (Figure 24).</p>

::::

:::figure

![Construction of pRS315-TEF1p-GPR2 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-17c9afd1d0d7-fig2-4-9.avif)

<p>Figure 24. Construction of pRS315-TEF1p-GPR2 plasmid.</p>

:::

#### Test {#test-6 toc="Test | verifying Cas9 transformation and genome editing"}

With these components ready, we proceeded to yeast transformation.

<p>First, according to references<sup>[4]</sup>, we needed to construct yeast strains that constitutively express Cas9 protein. Therefore, we directly transformed plasmid p414-Cas9-Leu and obtained correct transformants (Figure 25a), which were then prepared into competent cells.</p>

:::figure

![Transformant verification of p414-Cas9-Leu (a) and sTF transformant verification (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-2e431ac99756-fig2-4-10.avif)

<p>Figure 25. Transformant verification of p414-Cas9-Leu (a) and sTF transformant verification (b).</p>

:::

<p>Next, we co-transformed plasmid p426-SNR52p-gSTE12-SUP4t together with the sTF expression cassette (Figure 26). Gal4DBD was successfully recombined into the correct locus (Figure 25b).</p>

:::figure

![Schematic diagram of sTF Expression Cassette transformation.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-a4204d900f23-fig2-4-11.avif)

Figure 26. Schematic diagram of sTF expression cassette transformation.

:::

<p>Subsequently, we co-transformed the p426-SNR52p-gGal4-SUP4t plasmid together with the Gal1/10bp-Betaxanthin Expression Cassette. The <em>Gal4</em> gene was successfully knocked out, and the betaxanthin synthase gene under the control of the Gal1/10 bidirectional promoter was simultaneously knocked in (Figure 27).</p>

:::figure

![Schematic diagram of Gal1/10bp-Betaxanthin Expression Cassette transformation (a) and transformant validation (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-66c1379247d8-r2-66c1379247d8-fig2-4-12.avif)

<p>Figure 27. Schematic diagram of Gal1/10bp-betaxanthin expression cassette transformation (a) and transformant validation (b).</p>

:::

#### Learn {#learn-5 toc="Learn | advancing to GPR2 mutant characterization"}

So far, the chassis engineered yeast strain of our project has been constructed. Meanwhile, the dry lab finished the modification of GPR2 mutants. We therefore moved to the next cycle to characterize the screened GPR2 mutants.

### 2.5 Cycle 5: GPR2 mutant evaluation {#the-fifth-cycle toc="Cycle 5: GPR2 mutant evaluation"}

#### Design {#design-6 toc="Design | planning GPR2 mutant strain construction"}

Based on the results from previous cycles and dry lab, we still used one-step cloning to construct plasmids for transformation (Figure 28). Strain NKU-Y06 ([strain construction](/experiments/#strain-construction)) was utilized for genetic modification.

:::figure

![Plasmid maps of pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R.](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-5c10cfcd0e4c-r2-5c10cfcd0e4c-fig2-5-1.avif)

<p>Figure 28. Plasmid maps of pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R.</p>

:::

#### Build and test {#build-and-test toc="Build and test | constructing and verifying GPR2 mutant plasmids"}

<p>We successfully constructed two plasmids, pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R, via one-step cloning. Sequencing verified that their sequences were correct (Figure 29).</p>

:::figure

![Construction of pRS315-TEF1p-GPR2-N84V (a) and pRS315-TEF1p-GPR2-V368R (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-28480e6cf5ad-r2-28480e6cf5ad-fig2-5-2.avif)

<p>Figure 29. Construction of pRS315-TEF1p-GPR2-N84V (a) and pRS315-TEF1p-GPR2-V368R (b). Whole-plasmid sequencing confirmed the correct base sequences in key regions.</p>

:::

#### Learn {#learn-6 toc="Learn | identifying the need for test-strip productization"}

This cycle is hereby concluded. The strains constructed in this cycle can only function under laboratory conditions. For field applications, product formulation and packaging of the strains are required. Therefore, we proceeded to the third major DBTL cycle.

### 2.6 References {#references toc="References"}

<p>2. Fan, C., & Yuan, J. (2023). Reshaping the yeast galactose regulon via GPCR signaling cascade. <em>Cell Reports Methods</em>, <em>3</em>(12), 100647. https://doi.org/10.1016/j.crmeth.2023.100647</p>

<p>3. Fan, C., He, N., & Yuan, J. (2024). Cascaded amplifying circuit enables sensitive detection of fungal pathogens. <em>Biosensors and Bioelectronics</em>, <em>250</em>, 116058. https://doi.org/10.1016/j.bios.2024.116058</p>

<p>4. DiCarlo, J. E., Norville, J. E., Mali, P., Rios, X., Aach, J., & Church, G. M. (2013). Genome engineering in Saccharomyces cerevisiae using CRISPR-Cas systems. <em>Nucleic Acids Research</em>, <em>41</em>(7), 4336–4343. https://doi.org/10.1093/nar/gkt135</p>

<p>5. Mans, R., Wijsman, M., Daran-Lapujade, P., & Daran, J. M. (2018). A protocol for introduction of multiple genetic modifications in Saccharomyces cerevisiae using CRISPR/Cas9. <em>FEMS Yeast Research</em>, <em>18</em>(7), foy063. https://doi.org/10.1093/femsyr/foy063</p>

## DBTL-3: test strip development and productization {#dbtl-3-test-strip-development-and-productization toc="DBTL-3: test strip development and productization"}

<p>Building upon the successful construction of engineered chassis strains through previous DBTL cycles, and integrating feedback from Human Practices surveys alongside practical application scenarios, we shifted our focus to another core objective of the project: developing a low-cost, user-friendly, and intuitive colorimetric detection platform. Therefore, this section focuses on the fabrication process and color development workflow of the engineered yeast-based test strips, encompassing three sub-cycles: substrate determination, immobilization optimization, and color development rate optimization. </p>

### 3.1 Cycle 1: substrate determination {#results-3-1 toc="Cycle 1: substrate determination"}

<p>We reason that an ideal test strip substrate should possess high cell-loading capacity, excellent mechanical stability, reliable batch-to-batch consistency, and favorable water-retaining properties. Therefore, we initiate this cycle.</p>

#### Design {#results-3-1-design toc="Design | selecting candidate substrates"}

<p>Based on the criteria, we select seven candidate substrates with representative properties: qualitative filter paper(Cellulose), weighing paper (sulfite paper), lens cleaning paper(Cotton fiber), laboratory wipes(Virgin wood pulp), thin glass fiber filter paper (Whatman™ GF/A), thick glass fiber filter paper (Whatman™ GF/B), and cellulose acetate filter paper.</p>

<p>We suspend the cells in the protectant (glucose-free yeast extract–peptone–dextrose + sucrose) and spot them onto each substrate. Following pre-freezing, freeze-drying, recovery, and elution, the samples are plated for colony counting (defined as cell elution rate) to evaluate the binding affinity between each substrate and the yeast cells.</p>

<p>Subsequently, for the substrates demonstrating superior properties, we conduct copper sulfate solution wicking experiments to evaluate their water absorption capacity.</p>

#### Build and test {#results-3-1-build-test toc="Build and test | comparing cell binding and water absorption"}

<p>First, we evaluate the cell-binding capacity of each substrate. The results are summarized in Table 1 below:</p>

<div class="wiki-toolkit-block"><wiki-toolkit data-type="datatable" data-props="{&quot;_template&quot;:&quot;datatable&quot;,&quot;title&quot;:&quot;Table 1. Evaluation of cell-binding capacity across candidate substrates&quot;,&quot;csv&quot;:&quot;Substrate type,Cell elution rate,Performance characteristics\nCellulose,8%,\&quot;Easy to cut, stable structure, relatively uniform liquid absorption\&quot;\nsulfite paper,27%,\&quot;Strongly hydrophobic surface, extremely poor liquid absorption, forms surface bulges after freeze-drying\&quot;\nCotton fiber,3%,\&quot;Extremely thin and soft, difficult to handle, poor cell-loading capacity\&quot;\nVirgin wood pulp,10%,\&quot;Poor uniformity, inconsistent physical structure, difficult to standardize specifications\&quot;\nGF/B,3.4%,High liquid-loading capacity\nGF/A,23.7%,\&quot;Slightly lower toughness, moderate liquid-loading capacity\&quot;\n Cellulose acetate ,38.0%,\&quot;Brittle, susceptible to static electricity, low liquid-loading capacity\&quot;\n&quot;,&quot;sourceCellRuns&quot;:[[[{&quot;text&quot;:&quot;Substrate type&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Cell elution rate&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Performance characteristics&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot;Cellulose&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;8%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Easy to cut, stable structure, relatively uniform liquid absorption&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot;sulfite paper&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;27%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Strongly hydrophobic surface, extremely poor liquid absorption, forms surface bulges after freeze-drying&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot;Cotton fiber&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;3%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Extremely thin and soft, difficult to handle, poor cell-loading capacity&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot;Virgin wood pulp&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;10%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Poor uniformity, inconsistent physical structure, difficult to standardize specifications&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot;GF/B&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;3.4%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;High liquid-loading capacity&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot;GF/A&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;23.7%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Slightly lower toughness, moderate liquid-loading capacity&quot;,&quot;format&quot;:[]}]],[[{&quot;text&quot;:&quot; Cellulose acetate &quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;38.0%&quot;,&quot;format&quot;:[]}],[{&quot;text&quot;:&quot;Brittle, susceptible to static electricity, low liquid-loading capacity&quot;,&quot;format&quot;:[]}]]]}"><div class="wiki-toolkit-fallback"><p class="table-caption">Table 1. Evaluation of cell-binding capacity across candidate substrates</p><div class="table-wrap"><table><thead><tr><th><span style="font-weight:400;white-space:pre-wrap">Substrate type</span></th><th><span style="font-weight:400;white-space:pre-wrap">Cell elution rate</span></th><th><span style="font-weight:400;white-space:pre-wrap">Performance characteristics</span></th></tr></thead><tbody><tr><td><span style="font-weight:400;white-space:pre-wrap">Cellulose</span></td><td><span style="font-weight:400;white-space:pre-wrap">8%</span></td><td><span style="font-weight:400;white-space:pre-wrap">Easy to cut, stable structure, relatively uniform liquid absorption</span></td></tr><tr><td><span style="font-weight:400;white-space:pre-wrap">sulfite paper</span></td><td><span style="font-weight:400;white-space:pre-wrap">27%</span></td><td><span style="font-weight:400;white-space:pre-wrap">Strongly hydrophobic surface, extremely poor liquid absorption, forms surface bulges after freeze-drying</span></td></tr><tr><td><span style="font-weight:400;white-space:pre-wrap">Cotton fiber</span></td><td><span style="font-weight:400;white-space:pre-wrap">3%</span></td><td><span style="font-weight:400;white-space:pre-wrap">Extremely thin and soft, difficult to handle, poor cell-loading capacity</span></td></tr><tr><td><span style="font-weight:400;white-space:pre-wrap">Virgin wood pulp</span></td><td><span style="font-weight:400;white-space:pre-wrap">10%</span></td><td><span style="font-weight:400;white-space:pre-wrap">Poor uniformity, inconsistent physical structure, difficult to standardize specifications</span></td></tr><tr><td><span style="font-weight:400;white-space:pre-wrap">GF/B</span></td><td><span style="font-weight:400;white-space:pre-wrap">3.4%</span></td><td><span style="font-weight:400;white-space:pre-wrap">High liquid-loading capacity</span></td></tr><tr><td><span style="font-weight:400;white-space:pre-wrap">GF/A</span></td><td><span style="font-weight:400;white-space:pre-wrap">23.7%</span></td><td><span style="font-weight:400;white-space:pre-wrap">Slightly lower toughness, moderate liquid-loading capacity</span></td></tr><tr><td><span style="font-weight:400;white-space:pre-wrap"> Cellulose acetate </span></td><td><span style="font-weight:400;white-space:pre-wrap">38.0%</span></td><td><span style="font-weight:400;white-space:pre-wrap">Brittle, susceptible to static electricity, low liquid-loading capacity</span></td></tr></tbody></table></div></div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}</style><p>Enable JavaScript to use the interactive controls.</p></noscript></wiki-toolkit></div>

::::figuretext{side=right width=medium flow=wrap}

:::figure

[![Water absorption capacity evaluation of selected substrates.](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-e772d8a4854f55e5-00.json)](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-e772d8a4854f55e5-00.json "Open full-resolution image")

<p class="figure-caption">Figure 30. Water absorption capacity evaluation of selected substrates.</p>

:::

<p>Considering both the cell-binding capacity and the physical properties of each material, we select three substrates—GF/B, GF/A, and cellulose acetate—for the copper sulfate solution wicking experiment (Figure 30).</p><p>The results demonstrate that GF/B not only exhibits strong binding capacity with yeast cells but also possesses superior water absorption ability.</p>

::::

#### Learn {#results-3-1-learn toc="Learn | selecting GF/B as the test-strip substrate"}

<p>Based on the combined experimental results, Whatman™ GF/B thick glass fiber filter paper is selected as the final substrate for the test strip. GF/B demonstrates a liquid-loading capacity far exceeding other materials, allowing it to instantly absorb high-viscosity protectants without surface beading.</p>

<p>Through this cycle, we have identified a suitable substrate material for the test strip. Next, we need to explore appropriate immobilization methods to lay a solid foundation for visual color development, leading us into the next cycle.</p>

### 3.2 Cycle 2: immobilization optimization {#results-3-2 toc="Cycle 2: immobilization optimization"}

<p>Following the selection of the test strip substrate, efficiently, uniformly, and precisely immobilizing yeast cells onto the strip becomes critical to ensuring detection reproducibility. Traditional direct spotting often leads to lateral leakage, while high-viscosity cell suspensions are difficult to disperse evenly and quantify accurately. </p>

<p>To address this, we optimize immobilization across two dimensions—physical spatial confinement and biochemical/hardware sample loading. By creating hydrophobic barrier masks, refining protectant formulations, and introducing a vacuum-assisted filtration device, we achieve high-efficiency, stable cell immobilization on the test strip.</p>

#### Design {#results-3-2-design toc="Design | planning cell immobilization and loading"}

<p>To refine the yeast cell immobilization process, we use adhesive masks to define the cell-immobilization zones and apply ergo.® 5300 instant adhesive vapor deposition to fabricate localized hydrophilic areas on the filter paper, thereby resolving issues such as lateral wicking and uneven cell distribution. </p>

<p>Meanwhile, referencing literature<sup>[6]</sup>, we finalize the protectant formulation: sodium alginate (to increase viscosity), trehalose and glycerol (to provide cryoprotection), sodium glutamate (to protect cell membrane stability), and mannitol (to fill the sodium alginate matrix after freeze-drying and prevent powdering). We also design a water loss experiment to verify the water-retaining efficacy of this protectant.</p>

<p>In addition, we design a vacuum-assisted filtration spotting device to resolve the issue of high-viscosity protectant residues.</p>

#### Build and test {#results-3-2-build-test toc="Build and test | evaluating coatings, protectants, and cell loading"}

:::figure

[![Fumigation coating device (a), hydrophobic effect demonstration (b), circular hydrophilic zone demonstration (c). For (c), the surrounding experimental groups are created by placing the hydrophobic-treated test strips into solutions containing iron(III) chloride, cobalt(II) chloride, copper(II) sulfate, and manganese(II) chloride, respectively.](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-c90ad92ed801865f-00.json)](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-c90ad92ed801865f-00.json "Open full-resolution image")

<p class="figure-caption">Figure 31. Fumigation coating device (a), hydrophobic effect demonstration (b), circular hydrophilic zone demonstration (c). For (c), the surrounding experimental groups are created by placing the hydrophobic-treated test strips into solutions containing iron(III) chloride, cobalt(II) chloride, copper(II) sulfate, and manganese(II) chloride, respectively.</p>

:::

<p>First, we develop a hydrophobic coating fumigation device. Through mask shielding and cyanoacrylate vapor fumigation processes, we successfully fabricate test strips with a hydrophilic immobilization zone of 5 mm in diameter. The results demonstrate that the hydrophobic test strips exhibit good hydrophobic effects across different metal salt solutions (Figure 31), ensuring that our engineered bacteria are target-immobilized within the intended hydrophilic area.</p>

:::figure

[![Water loss rate curve.](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-eab5bea814fd5141-00.json)](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-eab5bea814fd5141-00.json "Open full-resolution image")

<p class="figure-caption">Figure 32. Water loss rate curve.</p>

:::

<p>Next, to verify the water-retaining performance of the protectant, we conduct dehydration kinetics and full-process freeze-drying tests on it. The results show (Figure 32) that the new protectant forms a structurally intact film matrix after drying and effectively prevents collapse and powdering; furthermore, its smooth and uniform dehydration rate avoids physical damage to yeast cell membranes caused by severe water loss, thereby significantly enhancing cell structural integrity and survival rate during freeze-drying.</p>

::::figuretext{side=left width=narrow flow=wrap}

:::figure

[![A vacuum filtration spotting device used to load protectant suspension onto the test-strip substrate.](https://static.igem.wiki/teams/6303/wiki/release-20261020/results-spotting-device-20751c382bee.json)](https://static.igem.wiki/teams/6303/wiki/release-20261020/results-spotting-device-20751c382bee.json "Open full-resolution image")

<p class="figure-caption">Figure 33. Photograph of the vacuum filtration spotting device.</p>

:::

<p>Additionally, we self-fabricate a vacuum filtration spotting device (Figure 33). This device can rapidly draw the high-viscosity protectant suspension into the interior of the test strip substrate, which not only significantly improves spotting efficiency but also achieves standardized control over the cell-loading amount per individual test strip.</p>

::::

::::figuretext{side=right width=medium flow=wrap}

:::figure

[![Overview of color-developing cell-loaded test strips.](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ea1a49677396-fig3-1-5.avif)](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ea1a49677396-fig3-1-5.avif "Open full-resolution image")

<p class="figure-caption">Figure 34. Overview of color-developing cell-loaded test strips.</p>

:::

<p>Integrating all the above methods and approaches, we prepare and obtain a batch of cell-loaded freeze-dried test strips available for downstream engineering (Figure 34).</p>

::::

#### Learn {#results-3-2-learn toc="Learn | standardizing cell immobilization"}

<p>In this cycle, combining gas-phase hydrophobic coating with the refined freeze-drying protectant successfully confines the cells within a uniform circular area; the vacuum-assisted spotting device eliminates liquid residue inside pipette tips, achieving controlled and quantitative cell-loading on the test strips; and we have successfully prepared freeze-dried live-cell test strips, as shown in Figure 34. Next, we officially proceed to optimize the color development rate of the test strips.</p>

### 3.3 Cycle 3: color development rate optimization {#results-3-3 toc="Cycle 3: color development rate optimization"}

<p>After completing the fabrication of the freeze-dried test strips, we require them to undergo rapid resuscitation and color development; therefore, we initiate this cycle.</p>

#### Design {#results-3-3-design toc="Design | planning reactivation and color development tests"}

<p>To meet the requirements of rapid detection, freeze-dried cells must quickly emerge from their dormant state upon contact with liquid. First, to evaluate the feasibility of resuscitation, we immerse the freeze-dried test strips into yeast nitrogen base-free synthetic complete (SC) medium and phosphate-buffered saline solution, respectively, and assess the impact of the amine donor tryptophan (Trp) on color development stability. Next, focusing on the key limiting factors of the betaxanthin biosynthesis pathway, we systematically evaluate the effects of tyrosine concentration (precursor), surfactants (precursor amino acid uptake), antioxidant protectants, and glucose concentration (carbon source).</p>

#### Build and test {#results-3-3-build-test toc="Build and test | comparing reactivation and color development conditions"}

<p>First, we complete a continuous observation and recording of freeze-dried test strip resuscitation via time-lapse photography (Video 1).</p>

<figure class="results-timelapse"><iframe title="Video 1. Observation of test strip resuscitation over 113 h" src="https://video.igem.org/videos/embed/fFXuDzig2DWKhQPFLW2mnM" allow="fullscreen" loading="lazy" sandbox="allow-scripts allow-same-origin" style="width:100%;aspect-ratio:16/9;border:0"></iframe><figcaption>Video 1. Observation of test strip resuscitation over 113 h.</figcaption></figure>

<p>Subsequently, we carry out multiple control experiments to further explore the optimal conditions for test strip color development, performing red–green–blue blue-channel grayscale quantification using ImageJ (Figure 35).</p>

<iframe class="author-screening-figure" title="Reactivation medium screening" src="/embeds/results-20261019/index.html" loading="lazy" sandbox="allow-scripts" style="width:100%;height:980px;border:0"></iframe><p class="figure-caption">Figure 35. Control experiments for color development conditions. </p>

#### Learn {#results-3-3-learn toc="Learn | refining reactivation conditions and test-strip packaging"}

<p>We observe that YNB-free SC medium as a resuscitation solution performs significantly better than phosphate-buffered saline solution, and the amine donor Trp stabilizes yeast color development.</p>

<p>The results of the color development condition control experiments further indicate that based on YNB-free SC selective medium, adding 2% glucose provides energy and a carbon source, tyrosine promotes precursor uptake and resuscitation, the surfactant (Tween 80) improves wettability and cell membrane permeability, and antioxidants protect betaxanthin stability. This optimized formulation overcomes the bottleneck of slow resuscitation in earlier stages and significantly accelerates the test strip color development rate.</p>

::::figuretext{side=right width=narrow flow=wrap}

:::figure

[![3D-printed test strip cassette.](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b5b9b9256085-fig3-2-2.avif)](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b5b9b9256085-fig3-2-2.avif "Open full-resolution image")

<p class="figure-caption">Figure 36. 3D-printed test strip cassette.</p>

:::

<p>Meanwhile, considering the field application scenarios of our product, we design a 3D-printed test strip cassette to hold the test strip (Figure 36), making the detection workflow simpler and more convenient.</p><p>At this point, we have closed the loop on test strip fabrication and application, establishing a solid foundation for subsequent on-site rapid detection of soil samples.</p>

::::

### 3.4 References {#results-dbtl3-references toc="References"}

<p>Miller, R. A., Brown, G., Barron, E., Luther, J. L., Lieberman, M., &amp; Goodson, H. V. (2020). Development of a paper-immobilized yeast biosensor for the detection of physiological concentrations of doxycycline in technology-limited settings. <em>Analytical Methods, 12</em>(16), 2123–2132. <a href="https://doi.org/10.1039/d0ay00001a">https://doi.org/10.1039/d0ay00001a</a></p>

<p>Grewal, P. S., Modavi, C., Russ, Z. N., Harris, N. C., &amp; Dueber, J. E. (2018). Bioproduction of a betalain color palette in <em>Saccharomyces cerevisiae</em>. <em>Metabolic Engineering, 45</em>, 180–188. <a href="https://doi.org/10.1016/j.ymben.2017.12.008">https://doi.org/10.1016/j.ymben.2017.12.008</a></p>

<p>Ostrov, N., Jimenez, M., Billerbeck, S., Brisbois, J., Matragrano, J., Ager, A., &amp; Cornish, V. W. (2017). A modular yeast biosensor for low-cost point-of-care pathogen detection. <em>Science Advances, 3</em>(6), e1603221. <a href="https://doi.org/10.1126/sciadv.1603221">https://doi.org/10.1126/sciadv.1603221</a></p>

<p>Shin, H. J., Park, H. H., &amp; Lim, W. K. (2005). Freeze-dried recombinant bacteria for on-site detection of phenolic compounds by color change. <em>Journal of Biotechnology, 119</em>(1), 36–43. <a href="https://doi.org/10.1016/j.jbiotec.2005.06.002">https://doi.org/10.1016/j.jbiotec.2005.06.002</a></p>

<p>Poirier, I., Maréchal, P. A., Richard, S., &amp; Gervais, P. (1999). Saccharomyces cerevisiae viability is strongly dependant on rehydration kinetics and the temperature of dried cells. <em>Journal of Applied Microbiology, 86</em>(1), 87–92. <a href="https://doi.org/10.1046/j.1365-2672.1999.00638.x">https://doi.org/10.1046/j.1365-2672.1999.00638.x</a></p>

## Future work {#results-future-work toc="Future work"}

<p>In our next phase of wet-lab validation, we plan to engineer yeast strains expressing distinct GPR2 receptor variants and perform quantitative assays to validate our dry-lab predictions. Using these experimental image datasets, we will perform systematic characterization across both pure ascaroside standards and authentic soil leachates to evaluate the strip's sensitivity, reproducibility, and matrix tolerance.</p>

<p>On the engineering front, we aim to integrate these isolated reaction units into a single-pour test strip. We plan to incorporate five functional units on a single platform: a quality unit to confirm strip validity, a standard unit for calibration, a blank unit to subtract soil background color, and two sample units to profile specific soil ascarosides. Combined with printed reference tones and mobile image-processing software, the system is intended to correct for environmental lighting variations and matrix interference.</p>

<p>Detailed design is as follows:</p>

<p>Quality: Loaded with saturating ligand. Color confirms strip validity; no color means a defective strip.</p>

<p>Standard: Loaded with a known sub-saturating ligand. Rescales readings against daily temperature and matrix variations.</p>

<p>Blank: Uses a pigment-pathway-knockout strain to subtract background soil tint and cell autofluorescence.</p>

<p>Samples 1 and 2: Express distinct GPR2 receptor variants to provide paired readings for profiling specific soil ascarosides.</p>

<figure class="wiki-media wiki-media--html"><iframe class="wiki-media__frame" src="/widgets/html.html?title=Five-unit+test+card+design+and+reading+guide&amp;src=%2Fembeds%2Fresults-future-work-20261021%2Findex.html&amp;scripts=1" title="Five-unit test card design and reading guide" loading="lazy" allow="fullscreen" style="height:900px" referrerpolicy="no-referrer"></iframe></figure>

<p>Ultimately, our vision is to empower growers with an intuitive testing tool—requiring nothing more than a simple pour, an observation, and a photograph to bring reliable, real-time soil diagnostics directly to where it is needed most.</p>

</div>
