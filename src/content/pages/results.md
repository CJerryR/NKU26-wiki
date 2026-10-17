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
meta: {}
draft: false
hidden: false
---
## DBTL-1: Heterologous Expression and Transmembrane Localization Verification of GPR2 {#dbtl-1-heterologous-expression-and-transmembrane-localization-verification-of-gpr2 toc="DBTL-1: Heterologous Expression and Transmembrane Localization Verification of GPR2"}

In this cycle, we performed **heterologous expression and transmembrane localization verification** of GPR2. The construction strategy of verification strains and detection methods were iteratively optimized. The final results met our expectations, laying a foundation for the next DBTL cycle.

### The First Cycle {#the-first-cycle toc="The First Cycle"}

#### Design {#design toc="Design"}

Based on the dry-lab screening results, we selected GPR2 as the receptor for display. To confirm that GPR2 can be **heterologously expressed and correctly localized** to the plasma membrane in our desired strain `CEN.PK2-1C`, we devised an experimental workflow consisting of "construction of the GPR2-sfGFP heterologous-expression plasmid — gene knock-in via yeast endogenous homologous recombination (HR) — assessment of expression and localization using fluorescence microscopy".

For plasmid construction (Figure 1.a), our design rationale was as follows:

a. The upstream and downstream sequences of the *STE2* CDS were utilized as the 5′‑homology arm and 3′‑homology arm to facilitate gene knock‑in via yeast endogenous homologous recombination (HR).

b. The constitutive TEF1 promoter was employed to drive gene expression. The cDNA sequence of *GPR2* was fused to the *sfGFP* sequence via a flexible linker for observation under fluorescence microscopy, followed by the CYC1 terminator.

c. The *Leu2* auxotrophic marker was used for transformant selection.

#### Build {#build toc="Build"}

Firstly, the GPR2‑sfGFP heterologous expression plasmid was successfully assembled by one‑step cloning (Figure 1). The plasmid was then linearized and transformed into yeast. Positive transformants were validated to yield yeast strains carrying correctly knock‑in GPR2‑sfGFP (Figure 2).

:::figure

![Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP. a, Plasmid map of the pRS315-GPR2-sfGFP construct for heterologous GPR2-sfGFP expression. b, Colony PCR results during plasmid construction. Sample T3 showed the expected positive band, and this colony was selected for plasmid extraction. c, Double restriction digestion verification of pRS315-GPR2-sfGFP, with band sizes consistent with theoretical expectations.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-6a3e31c31a57-fig1-1.avif)

Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP. a, Plasmid map of the `pRS315-GPR2-sfGFP` construct for heterologous GPR2-sfGFP expression. b, Colony PCR results during plasmid construction. Sample T3 showed the expected positive band, and this colony was selected for plasmid extraction. c, Double restriction digestion verification of `pRS315-GPR2-sfGFP`, with band sizes consistent with theoretical expectations.

:::

:::figure

![Figure 2. Yeast transformation of GPR2-sfGFP. a, Schematic diagram of yeast homologous recombination (HR). b, Verification results of transformants, confirming that GPR2-sfGFP was correctly integrated into the STE2 locus of the yeast genome.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b9bf38820eb8-fig1-2.avif)

Figure 2. Yeast transformation of GPR2-sfGFP. a, Schematic diagram of yeast homologous recombination (HR). b, Verification results of transformants, confirming that GPR2-sfGFP was correctly integrated into the STE2 locus of the yeast genome.

:::

#### Test {#test toc="Test"}

Upon examining GPR2-sfGFP-transformed yeast cells by fluorescence microscopy, we detected intense green fluorescent signals (Figure 3).

:::figure

![Figure 3. Fluorescence microscopy results](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b5c833268081-fig1-3.avif)

Figure 3. Fluorescence microscopy results

:::

#### Learn {#learn toc="Learn"}

While Figure 3 indicates that GPR2 is heterologously expressed and appears to localize to the plasma membrane, definitive evidence for authentic plasma-membrane localization remains absent. We therefore moved on to the next DBTL cycle.

### The Second Cycle {#the-second-cycle toc="The Second Cycle"}

#### Design and Build {#design-and-build toc="Design and Build"}

To further confirm that GPR2 correctly localizes to the plasma membrane, we designed two sets of experiments:

a. Staining of the yeast cell wall with the cell-wall dye Calcofluor‑White (CFW);

b. Staining of the yeast plasma membrane with the plasma-membrane dye FM4-64.

#### Test {#test-2 toc="Test"}

With cell-wall staining, we found that the fluorescence signal of GPR2-sfGFP barely overlapped with the CFW signal and resided on the inner side of the cell wall (Figure 4).

:::figure

![Figure 4. Calcofluor‑White (CFW) staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-66d05c9efec6-fig1-4.avif)

Figure 4. Calcofluor‑White (CFW) staining of yeast cells

:::

When performing plasma-membrane staining, we unintentionally gave FM4-64-exposed yeast an extra 30 min of incubation. GPR2-sfGFP was found to co-localize with the membrane dye at the plasma membrane and vacuole (Figure 5). Since FM4-64 is known to trigger endocytosis[1], this result suggests that plasma-membrane-localized GPR2-sfGFP was internalized along with FM4-64, further supporting correct plasma-membrane targeting of GPR2. We also added fluorescence-microscopy results from yeast under regular incubation conditions (Figure 5), matching our expectations.

:::figure

![Figure 5. FM4‑64 staining of yeast cells](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ecc5dd246c41-fig1-5.avif)

Figure 5. FM4‑64 staining of yeast cells

:::

#### Learn {#learn-2 toc="Learn"}

Taken together, these results confirm that `CEN.PK2-1C` can achieve heterologous expression and proper plasma-membrane localization of GPR2, which is an essential prerequisite for chassis-strain construction based on this host.

### Reference {#reference toc="Reference"}

Vida TA, Emr SD. A new vital stain for visualizing vacuolar membrane dynamics and endocytosis in yeast. J Cell Biol. 1995 Mar;128(5):779-92. doi: 10.1083/jcb.128.5.779. PMID: 7533169; PMCID: PMC2120394.

## DBTL-2: Engineering Construction of Ascaroside-Responsive Yeast Chassis {#dbtl-2-engineering-construction-of-ascaroside-responsive-yeast-chassis toc="DBTL-2: Engineering Construction of Ascaroside-Responsive Yeast Chassis"}

Building on the results of the previous cycle, we officially carried out the engineering construction of an ascaroside-responsive yeast chassis in this cycle. The strains constructed in this phase can be directly applied to product packaging and hardware development in the next research cycle.

### The First Cycle {#the-first-cycle-2 toc="The First Cycle"}

#### Design {#design-2 toc="Design"}

Based on the results of DBTL-1 and literature references [1][2], we performed chassis modification on the `CEN.PK2-1C` strain. Firstly, we designed the knockout of the response-interfering gene *Gal80* (Figure 2.a) to relieve the repression of Gal gene expression by *Gal80*. We knocked out the *Gal80* gene via yeast homologous recombination (HR). Approximately 1 kb sequences flanking the upstream and downstream regions of the *Gal80* coding sequence were used as homologous arms for the knockout cassette, and Trp was adopted as the auxotrophic marker for transformant screening.

#### Build {#build-2 toc="Build"}

Firstly, we amplified the upstream and downstream homologous arms (5F is 1255 bp and 3F is 1406 bp.) of *Gal80* from the genomic DNA of `CEN.PK2-1C` strain and the Trp auxotrophic marker element (1081bp) from the `pRS314` plasmid. The *Gal80* knockout cassette was successfully assembled via Double-joint PCR (Figure 1).

:::figure

![Figure 1. Construction of Gal80 knockout cassette KOGal80. a, PCR amplification of the three fragments constituting KOGal80. b, KOGal80 cassette assembled by Double-joint PCR.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-54bc3d3f3bd3-fig2-1-1.avif)

Figure 1. Construction of Gal80 knockout cassette KOGal80. a, PCR amplification of the three fragments constituting KOGal80. b, KOGal80 cassette assembled by Double-joint PCR.

:::

#### Test {#test-3 toc="Test"}

Subsequently, we transformed the cassette into yeast cells. After genomic DNA extraction and transformant verification, yeast strains with successful *Gal80* knockout were obtained (Figure 2).

:::figure

![Figure 2. Gal80 Gene Knockout. a, Schematic diagram of yeast homologous recombination (HR). b, Transformant verification results, confirming the successful knockout of the *Gal80* gene.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-f79bf47f490c-fig2-1-2.avif)

Figure 2. Gal80 Gene Knockout. a, Schematic diagram of yeast homologous recombination (HR). b, Transformant verification results, confirming the successful knockout of the *Gal80* gene.

:::

#### Learn {#learn-3 toc="Learn"}

The response-interfering gene was knocked out in this round. According to the order of the signal transduction pathway, we next need to construct the synthetic transcription factor sTF, and therefore we proceed to the next cycle.

### The Second Cycle {#the-second-cycle-2 toc="The Second Cycle"}

To efficiently construct the yeast chassis strain, this cycle was performed concurrently with the third cycle.

#### Design {#design-3 toc="Design"}

To construct the sTF, we designed an experimental workflow including *STE12* gene knockout, recombinant `pRS315-sTF` plasmid construction, sTF gene knock-in via yeast homologous recombination (HR), and transformant verification.

Details are as follows:

a. Sequences of approximately 1 kb upstream and downstream of the *STE12* gene were selected as the homologous arms of the knockout cassette, and His was used as the auxotrophic marker for subsequent transformant screening and validation (Figure 5.a).

b. The upstream and downstream sequences of the *STE12* gene were used as the 5′ homologous arm (identical to the 5′ homologous arm of KOSTE12) and 3′ homologous arm, respectively. Between the two homologous arms, the synthetic transcription factor sTF fused by Gal4-DBD and STE12-PRD [1], together with the Leu auxotrophic marker, was inserted to generate the homologous recombination plasmid `pRS315-sTF` (Figure 1).

:::figure

![Figure 1. Plasmid map of the homologous recombination plasmid pRS315-sTF.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-e8d85e8ac64b-fig2-2-1.avif)

Figure 1. Plasmid map of the homologous recombination plasmid `pRS315-sTF`.

:::

#### Build {#build-3 toc="Build"}

Firstly, we amplified the upstream and downstream homologous arms of *STE12* from the genomic DNA of strain `CEN.PK2-1C` (5F: 1082 bp, 3F: 1031 bp). Meanwhile, the His auxotrophic marker (1061 bp) was amplified from plasmid `pRS313`. The STE12 knockout cassette was successfully assembled via Double-joint PCR (Figure 2).

:::figure

![Figure 2. Construction of the STE12 knockout cassette KOSTE12. a, PCR amplification results of the three fragments constituting KOSTE12. b, The KOSTE12 knockout cassette assembled by Double-joint PCR.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-c9dd0c23eba9-fig2-2-2.avif)

Figure 2. Construction of the STE12 knockout cassette KOSTE12. a, PCR amplification results of the three fragments constituting KOSTE12. b, The KOSTE12 knockout cassette assembled by Double-joint PCR.

:::

Meanwhile, we designed and constructed the homologous recombination plasmid `pRS315-sTF`. However, after fragment amplification, one-step cloning, colony PCR and plasmid extraction, the **double digestion result did not meet our expectation** (Figure 3).

:::figure

![Figure 3. The first attempt to construct pRS315-sTF plasmid. a, Colony PCR result. The No.6 colony was selected for plasmid extraction and subsequent double digestion, shown in panel b, It was difficult to confirm the correctness of the plasmid from this result.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-dd7eb6cbc85b-fig2-2-3.avif)

Figure 3. The first attempt to construct `pRS315-sTF` plasmid. a, Colony PCR result. The No.6 colony was selected for plasmid extraction and subsequent double digestion, shown in panel b, It was difficult to confirm the correctness of the plasmid from this result.

:::

Plasmid sequencing revealed that the `KOSTE12-3F` fragment failed to assemble (Figure 4.a). We suspected that lab power outage during the experiment impaired the activity of the one-step cloning enzyme and the competence of *E. coli* competent cells. Therefore, we re-performed the experiment based on the previously constructed plasmid and obtained correct digestion and sequencing results (Figure 4).

:::figure

![Figure 4. The second attempt to construct the pRS315-sTF plasmid. a, Sequencing result of the first trial, showing that the 3F fragment was not assembled. b, Fragment amplification for the second plasmid construction. The fragment sizes from left to right are 3363 bp, 1620 bp, 1076 bp and 4301 bp. c, Double digestion verification of pRS315-sTF, consistent with expectations. d, Whole-plasmid sequencing result, confirming correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-ff3d00fb6194-fig2-2-4.avif)

Figure 4. The second attempt to construct the `pRS315-sTF` plasmid. a, Sequencing result of the first trial, showing that the 3F fragment was not assembled. b, Fragment amplification for the second plasmid construction. The fragment sizes from left to right are 3363 bp, 1620 bp, 1076 bp and 4301 bp. c, Double digestion verification of `pRS315-sTF`, consistent with expectations. d, Whole-plasmid sequencing result, confirming correct base sequences in key regions.

:::

#### Test {#test-4 toc="Test"}

Next, we first attempted to knock out the *STE12* gene. Despite three repeated trials, we failed to obtain positive results, and all transformants indicated unsuccessful knockout (Figure 5). Combined with identical issues encountered in the constitutive pigment expression verification of Cycle 3, we decided to redesign our experimental strategy.

:::figure

![Figure 5. Schematic diagram of *STE12* gene knockout and transformant verification results, indicating unsuccessful knockout.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3b0197d8eb0c-fig2-2-5.avif)

Figure 5. Schematic diagram of *STE12* gene knockout and transformant verification results, indicating unsuccessful knockout.

:::

#### Learn {#learn-4 toc="Learn"}

After literature review, we hypothesized that the failure of gene knockout stemmed from the low efficiency of homologous recombination (HR), which was unsuitable for multiple rounds of genetic modification. Therefore, we adopted the **CRISPR-Cas9** system[3][4] for gene editing. Together with Cycle 3, we advanced into Cycle 4.

### The Third Cycle {#the-third-cycle toc="The Third Cycle"}

This cycle was actually carried out in parallel with Cycle 2. The Learn section is largely consistent with that of Cycle 2 and will not be elaborated here.

#### Design {#design-4 toc="Design"}

After constructing the strain carrying sTF, the next step was to introduce genes encoding inducibly expressed betaxanthin synthases. Since these two genes originate from plants, we designed a verification experiment to confirm that the two enzymes could be expressed in yeast and catalyze betaxanthin production. Accordingly, we constructed the homologous recombination plasmid `pRS315-MjDOD-BvCYP76AD5` with a design similar to `pRS315-sTF` (Figure 1.a) and transformed it into yeast (Figure 2.a) to observe color development.

#### Build {#build-4 toc="Build"}

After successfully amplifying the required fragments via PCR, we encountered a problem that plagued us for nearly one month: **11 attempts** of plasmid construction using one-step cloning all failed. We faced a variety of issues, including no colony growth after transformation, fully negative bands in colony PCR, incorrect plasmid double digestion results, and erroneous sequencing data. Each time one problem was solved, another emerged, severely delaying our experimental progress.

Nevertheless, our team did not give up. Together with our instructors, we analyzed potential causes and proposed multiple solutions (see Contribution-Experimental Methods and Practical Experience for details). Finally, we obtained correct results after replacing with fresh one-step cloning enzyme (Figure 1).

:::figure

![Figure 1. Construction of pRS315-MjDOD-BvCYP76AD5 plasmid. a, Plasmid map of pRS315-MjDOD-BvCYP76AD5. b, Colony PCR identification for plasmid construction. Colony T5 was selected for plasmid extraction. c, Double digestion verification of pRS315-MjDOD-BvCYP76AD5; the band sizes of digested products matched the theoretical expectation. d, Whole-plasmid sequencing result, confirming correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-1e5da6928b73-fig2-3-1.avif)

Figure 1. Construction of `pRS315-MjDOD-BvCYP76AD5` plasmid. a, Plasmid map of `pRS315-MjDOD-BvCYP76AD5`. b, Colony PCR identification for plasmid construction. Colony T5 was selected for plasmid extraction. c, Double digestion verification of `pRS315-MjDOD-BvCYP76AD5`; the band sizes of digested products matched the theoretical expectation. d, Whole-plasmid sequencing result, confirming correct base sequences in key regions.

:::

#### Test {#test-5 toc="Test"}

Subsequently, we linearized plasmid `pRS315-MjDOD-BvCYP76AD5` and transformed it into yeast. Similar to the results from Cycle 2, we failed to achieve correct knock-in of the betaxanthin synthase genes for constitutive expression (Figure 2). However, we observed obvious yellow color in the transformed yeast (Figure 3). We hypothesized that the plasmid underwent **self-circularization** and existed episomally inside yeast cells.

:::figure

![Figure 2. Schematic diagram of betaxanthin expression cassette transformation and transformant verification results, showing no insertion at the *Gal4* locus.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-bad380137ce7-fig2-3-2.avif)

Figure 2. Schematic diagram of betaxanthin expression cassette transformation and transformant verification results, showing no insertion at the *Gal4* locus.

:::

:::figure

![Figure 3. Yeast producing betaxanthin.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b80d515be3c2-fig2-3-3.avif)

Figure 3. Yeast producing betaxanthin.

:::

This result further demonstrated that homologous recombination (HR) had low efficiency and was not suitable for multiple rounds of genetic modification. Therefore, this cycle, together with Cycle 2, proceeded to Cycle 4.

### The Fourth Cycle {#the-fourth-cycle toc="The Fourth Cycle"}

Based on previous results, we adopted CRISPR-Cas9 for gene editing. The existing Cas9-carrying plasmid (`p414-TEF1p-Cas9-CYC1t`) uses Trp as its auxotrophic marker, which overlaps with the marker applied in our initial *Gal80* knockout. Therefore, we first replaced the auxotrophic marker of this plasmid with Leu (Figure 1). In addition, according to available references, we also needed to construct plasmids expressing specific sgRNAs (Figure 3) and corresponding donor DNA[3] (Figure 7, Figure 8). Thus, we formally started this cycle.

:::figure

![Figure 1. Map of auxotrophic marker replacement for p414-Cas9 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-e034ba0dffbf-fig2-4-1.avif)

Figure 1. Map of auxotrophic marker replacement for `p414-Cas9` plasmid.

:::

#### Design {#design-5 toc="Design"}

We needed to construct three types of components: the Cas9 plasmid with replaced auxotrophic marker, plasmids expressing specific sgRNAs, and donor DNA. Consistent with our previous strategy, we assembled the required plasmids via one-step cloning. Notably, we initially intended to use Quick-Change PCR for sgRNA plasmid construction. However, we encountered great difficulty in whole-plasmid amplification during practical operation. Consequently, we still adopted one-step cloning to build this plasmid.

#### Build {#build-5 toc="Build"}

First, we constructed the Cas9 plasmid with replaced auxotrophic marker (Figure 1), and the construction was highly successful (Figure 2).

:::figure

![Figure 2. Construction of p414-Cas9-Leu plasmid. a, Colony PCR identification for plasmid construction. Colony T6 was selected for plasmid extraction. b, Double digestion verification of p414-Cas9-Leu; the band sizes of digested products matched the theoretical expectation. c, Whole-plasmid sequencing result, confirming correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-520027082450-fig2-4-2.avif)

Figure 2. Construction of `p414-Cas9-Leu` plasmid. a, Colony PCR identification for plasmid construction. Colony T6 was selected for plasmid extraction. b, Double digestion verification of `p414-Cas9-Leu`; the band sizes of digested products matched the theoretical expectation. c, Whole-plasmid sequencing result, confirming correct base sequences in key regions.

:::

Next, we constructed sgRNA plasmids targeting three genes: *STE12*, *Gal4* and *STE2* (Figure 3).

:::figure

![Figure 3. sgRNA expression plasmids. a, Plasmid map of p426-SNR52p-gSTE12-SUP4t. b, Plasmid map of p426-SNR52p-gGal4-SUP4t. c, Plasmid map of p426-SNR52p-gSTE2-SUP4t.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-35c2440a69e2-fig2-4-3.avif)

Figure 3. sgRNA expression plasmids. a, Plasmid map of `p426-SNR52p-gSTE12-SUP4t`. b, Plasmid map of `p426-SNR52p-gGal4-SUP4t`. c, Plasmid map of `p426-SNR52p-gSTE2-SUP4t`.

:::

Although Quick-Change PCR failed to yield satisfactory results, our team successfully obtained three correct plasmids after switching to one-step cloning (shown in the figure below).

:::figure

![Figure 4. Construction of p426-SNR52p-gSTE12-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-d982a8b520ff-fig2-4-4.avif)

Figure 4. Construction of `p426-SNR52p-gSTE12-SUP4t` plasmid.

:::

:::figure

![Figure 5. Construction of p426-SNR52p-gGal4-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-69de44f60d1c-fig2-4-5.avif)

Figure 5. Construction of `p426-SNR52p-gGal4-SUP4t` plasmid.

:::

:::figure

![Figure 6. Construction of p426-SNR52p-gSTE2-SUP4t plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-d5131d0a322f-fig2-4-6.avif)

Figure 6. Construction of `p426-SNR52p-gSTE2-SUP4t` plasmid.

:::

Finally, we constructed the corresponding donor DNA. The sTF fragment was amplified from plasmid `pRS315sTF` ([https://registry.igem.org/parts/bba26iotmof](https://registry.igem.org/parts/bba%E2%80%9126iotmof)). The gene fragment of betaxanthin synthase induced by the bidirectional Gal1/10 promoter ([https://registry.igem.org/parts/bba2697laqw](https://registry.igem.org/parts/bba%E2%80%912697laqw)) was first amplified from plasmid `pRS315MjDODBvCYP76AD5`, followed by DoubleJoint PCR amplification, using the same method as our previous fragment construction (Figure 7).

:::figure

![Figure 7. Fragment construction of Gal1/10bp-Betaxanthin Expression Cassette (a) and sTF Expression Cassette (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3fc8bdc1eede-fig2-4-7.avif)

Figure 7. Fragment construction of Gal1/10bp-Betaxanthin Expression Cassette (a) and sTF Expression Cassette (b).

:::

For GPR2, since GPR2 in the previously constructed plasmid `pRS315-TEF1p-GPR2-sfGFP` is fused to sfGFP via a flexible linker, direct construction of the donor fragment was complicated. We therefore continued to use one-step cloning to assemble the plasmid (Figure 8), and finally successfully obtained `pRS315-TEF1p-GPR2` for GPR2 knock-in (Figure 9).

:::figure

![Figure 8. Plasmid map of pRS315-TEF1p-GPR2.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-b849be4108e2-fig2-4-8.avif)

Figure 8. Plasmid map of `pRS315-TEF1p-GPR2`.

:::

:::figure

![Figure 9. Construction of pRS315-TEF1p-GPR2 plasmid.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-17c9afd1d0d7-fig2-4-9.avif)

Figure 9. Construction of `pRS315-TEF1p-GPR2` plasmid.

:::

#### Test {#test-6 toc="Test"}

With these components ready, we proceeded to yeast transformation.

First, according to references[3], we needed to construct yeast strains that constitutively express Cas9 protein. Therefore, we directly transformed plasmid `p414-Cas9-Leu` and obtained correct transformants (Figure 10.a), which were then prepared into competent cells.

:::figure

![Figure 10. Transformant verification of p414-Cas9-Leu (a) and sTF transformant verification (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-2e431ac99756-fig2-4-10.avif)

Figure 10. Transformant verification of `p414-Cas9-Leu` (a) and sTF transformant verification (b).

:::

Next, we co-transformed plasmid `p426-SNR52p-gSTE12-SUP4t` together with the sTF expression cassette (Figure 11). Gal4DBD was successfully recombined into the correct locus (Figure 10.b).

:::figure

![Figure 11. Schematic diagram of sTF Expression Cassette transformation.](https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-a4204d900f23-fig2-4-11.avif)

Figure 11. Schematic diagram of sTF Expression Cassette transformation.

:::

Subsequently, we co-transformed the `p426-SNR52p-gGal4-SUP4t` plasmid together with the Gal1/10bp-Betaxanthin Expression Cassette. The *Gal4* gene was successfully knocked out, and the betaxanthin synthase gene under the control of the Gal1/10 bidirectional promoter was simultaneously knocked in (Figure 12).

:::figure

![Figure 12. Schematic diagram of Gal1/10bp-Betaxanthin Expression Cassette transformation (a) and transformant validation (b).](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-66c1379247d8-r2-66c1379247d8-fig2-4-12.avif)

**Figure 12.** Schematic diagram of Gal1/10bp-Betaxanthin Expression Cassette transformation (a) and transformant validation (b).

:::

Finally, we co-transformed the `p426-SNR52p-gSTE2-SUP4t` plasmid and linearized `pRS315-TEF1p-GPR2` plasmid. The *GPR2* gene was successfully recombined into the *STE2* locus.

#### Learn {#learn-5 toc="Learn"}

So far, the chassis engineered yeast strain of our project has been constructed. Meanwhile, the dry lab finished the modification of GPR2 mutants. We therefore moved to the next cycle to characterize the screened GPR2 mutants.

### The Fifth Cycle {#the-fifth-cycle toc="The Fifth Cycle"}

#### Design {#design-6 toc="Design"}

Based on the results from previous cycles and dry lab, we still used one-step cloning to construct plasmids for transformation (Figure 1). Strain `NKU-Y06` ([Wet Lab — Experiments — Strain Construction](/experiments/#strain-construction)) was utilized for genetic modification.

:::figure

![Figure 1. Plasmid maps of pRS315-TEF1p-GPR2-N84V and pRS315-TEF1p-GPR2-V368R.](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-5c10cfcd0e4c-r2-5c10cfcd0e4c-fig2-5-1.avif)

**Figure 1.** Plasmid maps of `pRS315-TEF1p-GPR2-N84V` and `pRS315-TEF1p-GPR2-V368R`.

:::

#### Build and Test {#build-and-test toc="Build and Test"}

We successfully constructed two plasmids, `pRS315-TEF1p-GPR2-N84V` and `pRS315-TEF1p-GPR2-V368R`, via one-step cloning. Sequencing verified that their sequences were correct (Figure 2).

:::figure

![Figure 2. Construction of pRS315-TEF1p-GPR2-N84V (a) and pRS315-TEF1p-GPR2-V368R (b). Whole-plasmid sequencing confirmed the correct base sequences in key regions.](https://static.igem.wiki/teams/6303/wiki/v8-0/v85-28480e6cf5ad-r2-28480e6cf5ad-fig2-5-2.avif)

**Figure 2.** Construction of `pRS315-TEF1p-GPR2-N84V` (a) and `pRS315-TEF1p-GPR2-V368R` (b). Whole-plasmid sequencing confirmed the correct base sequences in key regions.

:::

Subsequently, we mixed the `p426-SNR52p-gSTE2-SUP4t` plasmid with each of the two plasmids mentioned above and co-transformed them into strain `NKU-Y06`. The recombination locus was identical to that used for GPR2 knock-in. After transformant validation, we successfully obtained two strains carrying GPR2 mutants.

#### Learn {#learn-6 toc="Learn"}

This cycle is hereby concluded. The strains constructed in this cycle can only function under laboratory conditions. For field applications, product formulation and packaging of the strains are required. Therefore, we proceeded to the third major DBTL cycle.

### References {#references toc="References"}

Fan C, Yuan J. Reshaping the yeast galactose regulon via GPCR signaling cascade. Cell Rep Methods. 2023 Dec 18;3(12):100647. doi: 10.1016/j.crmeth.2023.100647. Epub 2023 Nov 20. PMID: 37989311; PMCID: PMC10753199.

Cong Fan, Nike He, Jifeng Yuan, Cascaded amplifying circuit enables sensitive detection of fungal pathogens, Biosensors and Bioelectronics, Volume 250, 2024, 116058, ISSN 0956-5663, [https://doi.org/10.1016/j.bios.2024.116058](https://doi.org/10.1016/j.bios.2024.116058).

James E. DiCarlo, Julie E. Norville, Prashant Mali, Xavier Rios, John Aach, George M. Church, Genome engineering in Saccharomyces cerevisiae using CRISPR-Cas systems, Nucleic Acids Research, Volume 41, Issue 7, 1 April 2013, Pages 4336–4343, [https://doi.org/10.1093/nar/gkt135](https://doi.org/10.1093/nar/gkt135)，

Mans R, Wijsman M, Daran-Lapujade P, Daran JM. A protocol for introduction of multiple genetic modifications in Saccharomyces cerevisiae using CRISPR/Cas9. FEMS Yeast Res. 2018 Nov 1;18(7):foy063. doi: 10.1093/femsyr/foy063. PMID: 29860374; PMCID: PMC6074844.

## DBTL-3: Test Strip Development and Productization {#dbtl-3-test-strip-development-and-productization toc="DBTL-3 · Test strips"}

Building upon the engineered chassis strain constructed in previous DBTL cycles, we turned to another key project objective: developing an affordable, convenient, and user-friendly colorimetric detection platform. To achieve this, we executed subsequent engineering cycles focused on cell immobilization and test-strip productization. This section details two overarching DBTL cycles—test-strip formulation using engineered yeast and on-strip colorimetric development—each encompassing several sub-iterative cycles that drive continuous optimization.

<div id="the-first-cycle-test-strip-formulation-processing" aria-hidden="true"></div>

### 3.1 Test-Strip Formulation and Processing {#results-3-1 toc="3.1 Formulation"}

To create an accessible, rapid, and low-cost live-cell test strip, we developed a **standardized, transferable workflow** for yeast cell immobilization and freeze-drying. This major cycle comprises three sub-iterative DBTL cycles: **Substrate Selection, Elution Method Refinement & Final Substrate Screening, and Surface Modification & Spotting Optimization**.

#### 3.1.1 Sub-cycle 1: Preliminary Substrate Screening {#results-3-1-1 toc="Substrate screening"}

<div id="sub-cycle-1-substrate-selection" aria-hidden="true"></div>

**Design**

We propose that an ideal test strip substrate should possess high cell loading capacity, excellent mechanical stability, good batch-to-batch reproducibility, and biocompatibility during freeze-drying and reactivation. On this basis, we selected four representative candidate substrates: qualitative filter paper, laboratory tissue, lens cleaning paper, and weighing paper.

We adopted the first-generation lyoprotectant (glucose-free YPD supplemented with sucrose) and performed comparative evaluation via the "freeze-drying – cell elution – plate counting" workflow for preliminary substrate screening.

**Build and Test**

Cells were suspended in the protectant and spotted onto each substrate. After pre-freezing, freeze-drying, reactivation and elution, samples were spread on agar plates to count viable colonies (Table 1).

<div class="wiki-toolkit-block"><wiki-toolkit data-type="datatable" data-props="{&quot;_template&quot;:&quot;datatable&quot;,&quot;title&quot;:&quot;Table 3.1.1. Substrate properties and preparation performance&quot;,&quot;csv&quot;:&quot;Paper Type,Cell Recovery,Performance Characteristics\nQualitative filter paper,8%,\&quot;Easy to cut, structurally stable, relatively uniform liquid absorption\&quot;\nWeighing paper,27%,\&quot;Highly hydrophobic surface, poor liquid wettability; bulges form after freeze-drying\&quot;\nLens cleaning paper,3%,\&quot;Extremely thin and fragile, inconvenient for handling, poor cell-loading capacity\&quot;\nLaboratory tissue,10%,Poor homogeneity and structural consistency; difficult to standardize specifications\n&quot;,&quot;caption&quot;:&quot;Values reproduced from the supplied Results 2.0 manuscript.&quot;}"><div class="wiki-toolkit-fallback"><p><strong>Table 3.1.1. Substrate properties and preparation performance</strong></p><div class="table-wrap"><table><thead><tr><th>Paper Type</th><th>Cell Recovery</th><th>Performance Characteristics</th></tr></thead><tbody><tr><td>Qualitative filter paper</td><td>8%</td><td>Easy to cut, structurally stable, relatively uniform liquid absorption</td></tr><tr><td>Weighing paper</td><td>27%</td><td>Highly hydrophobic surface, poor liquid wettability; bulges form after freeze-drying</td></tr><tr><td>Lens cleaning paper</td><td>3%</td><td>Extremely thin and fragile, inconvenient for handling, poor cell-loading capacity</td></tr><tr><td>Laboratory tissue</td><td>10%</td><td>Poor homogeneity and structural consistency; difficult to standardize specifications</td></tr></tbody></table></div></div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}</style><p>Enable JavaScript to use the interactive controls.</p></noscript></wiki-toolkit></div>

**Learn**

Lens cleaning paper and laboratory tissue were eliminated due to poor processability and reproducibility. Weighing paper was discarded for unsatisfactory cell loading caused by its inherent physical properties. Qualitative filter paper was temporarily retained as the test strip substrate owing to its superior processability and acceptable cell-loading capacity. Nevertheless, qualitative filter paper suffers from lateral wicking, which leads to irregular spot boundaries and uneven cell distribution. We will address this issue in subsequent DBTL cycles.

Furthermore, since the recovery efficiency of eluted cells is affected by substrate adsorption capacity, evaluating cell recovery solely by **colony counting introduces bias**. Therefore, we will optimize the elution method in the next cycle.

#### 3.1.2 Sub-cycle 2: Elution Optimization and Final Substrate Screening {#results-3-1-2 toc="Elution and substrate"}

<div id="sub-cycle-3-elution-method-refinement-final-substrate-selection" aria-hidden="true"></div>

**Design**

To eliminate interference from substrate adsorption on measured cell recovery, we redesigned the elution protocol. Isotonic PBS buffer supplemented with **0.05% Tween 80** was used as eluent to reduce non-specific binding between cells and substrate fibers. Meanwhile, 3 mm glass grinding beads were introduced for mechanical disruption to further improve elution efficiency.

In this cycle, we used qualitative filter paper as the control group and introduced three new candidate substrates: thin glass fiber filter paper (Whatman™ GF/A), thick glass fiber filter paper (**Whatman™ GF/B**), and cellulose acetate filter paper. The improved elution assay was applied for rigorous screening.

**Build and Test**

Before evaluating the cell recovery of test strips, we first eliminated the interference of physical substrate adsorption on cell elution efficiency. To this end, we adopted the modified eluent and elution protocol to directly elute non-freeze-dried strips and spread the cell suspension. With qualitative filter paper set as the reference (100%), we measured the initial cell recovery of each candidate substrate, which was defined as the adsorption correction factor for subsequent analysis (Table 2).

<div class="wiki-toolkit-block"><wiki-toolkit data-type="datatable" data-props="{&quot;_template&quot;:&quot;datatable&quot;,&quot;title&quot;:&quot;Table 3.1.2. Initial elution efficiency and substrate adsorption correction factors&quot;,&quot;csv&quot;:&quot;Metrics,Control,GF/A,GF/B,Cellulose acetate\nCell recovery,100%,76%,88%,50%\nAdsorption correction factor,1,0.76,0.88,0.5\n&quot;,&quot;caption&quot;:&quot;Values reproduced from the supplied Results 2.0 manuscript.&quot;}"><div class="wiki-toolkit-fallback"><p><strong>Table 3.1.2. Initial elution efficiency and substrate adsorption correction factors</strong></p><div class="table-wrap"><table><thead><tr><th>Metrics</th><th>Control</th><th>GF/A</th><th>GF/B</th><th>Cellulose acetate</th></tr></thead><tbody><tr><td>Cell recovery</td><td>100%</td><td>76%</td><td>88%</td><td>50%</td></tr><tr><td>Adsorption correction factor</td><td>1</td><td>0.76</td><td>0.88</td><td>0.5</td></tr></tbody></table></div></div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}</style><p>Enable JavaScript to use the interactive controls.</p></noscript></wiki-toolkit></div>

Next, we prepared freeze-dried test strip samples with these newly introduced substrates. A copper sulfate solution wicking test was performed to independently characterize their water absorption and liquid-holding capacity qualitatively (Figure 3.1.1).

:::figure{scale=70}

![Figure 3.1.1. Water-absorption test.](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-f41bd79ce2d8-fig3-1-1.avif)

**Figure 3.1.1.** Water-absorption test.

:::

We further processed the test strip samples using the optimized elution method. The adsorption-corrected cell recovery, coefficient of variation (CV), and key performance features of each substrate were comprehensively evaluated and compared with the qualitative filter paper control group (Table 3).

<div class="wiki-toolkit-block"><wiki-toolkit data-type="datatable" data-props="{&quot;_template&quot;:&quot;datatable&quot;,&quot;title&quot;:&quot;Table 3.1.3. Adsorption-corrected recovery and substrate performance&quot;,&quot;csv&quot;:&quot;Paper Type,Cell Recovery,CV,Key Performance Characteristics\nGF/B,3.4%,86.6%,\&quot;Slightly low toughness, strong liquid-holding capacity, remains flat without deformation after freeze-drying\&quot;\nGF/A,23.7%,65.6%,\&quot;Slightly low toughness, moderate liquid-holding capacity\&quot;\nCellulose acetate,38.0%,55.0%,\&quot;Brittle, prone to static electricity, weak liquid-holding capacity\&quot;\nQualitative filter paper,-,-,\&quot;Easy to cut, high toughness, moderate liquid-holding capacity\&quot;\n&quot;,&quot;caption&quot;:&quot;Values reproduced from the supplied Results 2.0 manuscript.&quot;}"><div class="wiki-toolkit-fallback"><p><strong>Table 3.1.3. Adsorption-corrected recovery and substrate performance</strong></p><div class="table-wrap"><table><thead><tr><th>Paper Type</th><th>Cell Recovery</th><th>CV</th><th>Key Performance Characteristics</th></tr></thead><tbody><tr><td>GF/B</td><td>3.4%</td><td>86.6%</td><td>Slightly low toughness, strong liquid-holding capacity, remains flat without deformation after freeze-drying</td></tr><tr><td>GF/A</td><td>23.7%</td><td>65.6%</td><td>Slightly low toughness, moderate liquid-holding capacity</td></tr><tr><td>Cellulose acetate</td><td>38.0%</td><td>55.0%</td><td>Brittle, prone to static electricity, weak liquid-holding capacity</td></tr><tr><td>Qualitative filter paper</td><td>-</td><td>-</td><td>Easy to cut, high toughness, moderate liquid-holding capacity</td></tr></tbody></table></div></div><noscript><style>.wiki-toolkit-fallback{display:block!important}wiki-toolkit:not(:defined){min-height:0;border:0;background:none;animation:none}</style><p>Enable JavaScript to use the interactive controls.</p></noscript></wiki-toolkit></div>

**Learn**

Combining all experimental results, Whatman™ GF/B thick glass fiber filter paper was selected as the final substrate for our test strips. Although qualitative filter paper exhibited higher cell recovery in small-scale counting assays, GF/B possesses substantially superior liquid-holding capacity compared with other candidates. It rapidly absorbs high-viscosity protectant without bead formation on the surface, which makes it well suited for freeze-drying. Moreover, it avoids powdering or curling after lyophilization, showing great practical engineering value.

Through this cycle, we established a novel evaluation system for test strip elution and selected a suitable substrate using this platform. Accordingly, we proceeded to the next cycle to further address lateral wicking and uneven cell distribution on the strips.

#### 3.1.3 Sub-cycle 3: Surface Modification and Spotting Optimization {#results-3-1-3 toc="Surface and spotting"}

<div id="sub-cycle-2-surface-modification-spotting-optimization" aria-hidden="true"></div>

**Design**

To solve the problems of lateral wicking and uneven cell distribution, we aimed to construct distinct **hydrophilic/hydrophobic boundaries** within the substrate. We proposed using adhesive labels as masking templates. By vapor deposition of ergo.® 5300 instant adhesive, locally defined circular hydrophilic spotting zones were fabricated on filter paper.

To reduce uneven distribution caused by cell sedimentation, we optimized the protectant formulation. **Sodium alginate** was introduced to increase viscosity; trehalose and glycerol provided more reliable lyoprotection. Sodium glutamate was supplemented for antioxidation and cell membrane stabilization. Mannitol replaced sucrose to fill the sodium alginate matrix after freeze-drying and prevent powdering. Furthermore, to address large spotting variability arising from high-viscosity protectant residue in pipette tips, we designed a vacuum filtration-assisted spotting device.

**Build and Test**

To effectively suppress lateral liquid spreading, we developed a reusable hydrophobic coating fumigation device. Using masking templates and cyanoacrylate (adhesive) vapor fumigation, we successfully fabricated well-defined 5 mm hydrophilic detection zones surrounded by outer hydrophobic barriers on filter paper (Figure 3.1.2).

:::figure{scale=85}

![Figure 3.1.2. Fumigation coating setup (a), hydrophobicity demonstration (b), and circular hydrophilic zone (c).](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-06c56594b1d7-fig3-1-2.avif)

**Figure 3.1.2.** Fumigation coating setup (a), hydrophobicity demonstration (b), and circular hydrophilic zone (c).

:::

To verify the protective effect of the modified protectant, we performed dehydration kinetics and full-process freeze-drying tests. The results demonstrated that the new sodium-alginate-based protectant forms an intact thin-film matrix after drying to effectively prevent collapse. Its gentle and uniform dehydration rate avoids physical damage to yeast cell membranes caused by drastic water loss, thereby greatly improving the structural integrity and viability of cells during lyophilization (Figure 3.1.3).

:::figure{scale=85}

![Figure 3.1.3. Rapid water-loss test (a) and water-loss rate curve (b).](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-e2be3f101f5e-fig3-1-3.avif)

**Figure 3.1.3.** Rapid water-loss test (a) and water-loss rate curve (b).

:::

In addition, we designed and built a custom **vacuum filtration spotting fixture**. This device rapidly draws the high-viscosity protectant suspension into the substrate. It greatly improves spotting efficiency and quantitative precision, and enables standardized control of cell loading per strip by accurate adjustment of sample volume (Figure 3.1.4).

:::figure{scale=70}

![Figure 3.1.4. Photograph of the vacuum-assisted spotting setup.](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-48ee38c731e9-fig3-1-4.avif)

**Figure 3.1.4.** Photograph of the vacuum-assisted spotting setup.

:::

Combined with all the above methods and techniques, we fabricated a batch of cell-loaded freeze-dried test strips available for subsequent experiments (Figure 3.1.5).

:::figure{scale=70}

![Figure 3.1.5. Cell-loaded freeze-dried test strips.](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ea1a49677396-fig3-1-5.avif)

**Figure 3.1.5.** Cell-loaded freeze-dried test strips.

:::

**Learn**

Combining vapor-deposited hydrophobic coating and optimized lyoprotectant, cells were successfully confined within uniform circular zones. The vacuum-assisted spotting device eliminated liquid residue in pipette tips and enabled controllable and quantitative cell loading on test strips.

Through these three sub-cycles, we established a **standardized, highly reproducible workflow** covering substrate pretreatment, protectant preparation and semi-automated spotting loading. Viable freeze-dried yeast test strips as shown in Figure 3.1.5 were successfully fabricated.

### 3.2 On-Strip Color Development and Productization {#results-3-2 toc="3.2 Color development"}

After the cell immobilization procedure, we moved forward to the **in-situ reactivation and signal output** stage on test strips. Using engineered chromogenic yeast strains, this major DBTL cycle addressed three progressive bottlenecks sequentially: reactivation condition optimization, coloration rate enhancement, and hardware productization and packaging.

#### 3.2.1 Sub-cycle 1: Reactivation Optimization {#results-3-2-1 toc="Reactivation"}

**Design**

To achieve direct visual detection without elution, freeze-dried cells must efficiently exit dormancy upon contact with liquid. We first immersed the Whatman™ GF/B test strips loaded with engineered cells in YNB-free SC selective medium to evaluate the feasibility of in-situ reactivation.

Meanwhile, we performed a preliminary investigation into the rehydration medium formulation for engineered strains. Using single-variable controlled experiments, we evaluated the effects of basal reactivation media (YNB-free SC selective medium versus isotonic PBS) and lysine supplementation (supplemented vs. non-supplemented groups) on strain reactivation and colorimetric performance.

**Build and Test**

We constructed a time-lapse imaging system adapted for yeast culture conditions and performed continuous observation and recording of the reactivation process of cell-loaded paper strips for 113 hours. The time-lapse results are shown below:

<figure class="results-timelapse"><iframe title="NKU-China: On-strip yeast reactivation over 113 hours (2026)" width="560" height="315" loading="lazy" allowfullscreen src="https://video.igem.org/videos/embed/fFXuDzig2DWKhQPFLW2mnM" allow="fullscreen" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" style="border: 0px;"></iframe><figcaption><strong>Video 3.2.1.</strong> Time-lapse recording of cell-loaded test-strip reactivation over 113 hours. <a href="https://video.igem.org/w/fFXuDzig2DWKhQPFLW2mnM">Watch on iGEM Video Universe</a>. Playback is pending iGEM moderation.</figcaption></figure>

**Learn**

Based on the above experiments, we concluded that YNB-free SC medium outperformed isotonic PBS as the basal reactivation medium. Meanwhile, lysine supplementation was verified to substantially promote yeast color development. Accordingly, we adopted "**SC medium supplemented with lysine**" as the basal reactivation formulation for subsequent experiments.

Reactivation experiments revealed that color development on test strips proceeds through three phases: **lag phase, coloration phase and plateau phase**. The prolonged lag phase fails to meet our requirement for rapid detection. Correlation analysis between strip geometry and coloration sites indicated that full submersion leads to severe internal hypoxia, which inhibits cell reactivation, extends the lag phase and reduces coloration rate. Therefore, efficient reactivation relies not only on nutrient supply but also sufficient aeration. This guides our next optimization: improving the **gas-liquid interface** via physical structural design to enhance oxygen availability and shorten the lag phase.

#### 3.2.2 Sub-cycle 2: Coloration Acceleration {#results-3-2-2 toc="Coloration"}

**Design**

To overcome the bottlenecks of slow coloration and low contrast, we systematically optimized the reactivation medium formulation. Targeting key limiting factors in the betaxanthin biosynthetic pathway, we designed controlled experiments across four dimensions: tyrosine concentration, glucose concentration and glucose-sucrose ratio, antioxidant protectants, and novel amine donors.

**Build and Test**

First, since tyrosine uptake is regulated by cell membrane permeability, we evaluated the synergistic effect of tyrosine concentration and surfactants, while retaining lysine to sustain its reactivation-promoting effect. Second, to balance metabolic flux between cell reactivation/growth and pigment synthesis, we modulated glucose concentration and the glucose-sucrose ratio. Third, to mitigate oxidative fading of betaxanthin, ascorbic acid was supplemented as an antioxidant protectant. Finally, **6-aminoindole (6-AI)** was tested as a novel amine donor to modify chromophores and improve visual contrast (Table 3.2.1).

*Table 3.2.1: the formulation-screening table is pending in the supplied manuscript.*

Parallel tracking in multi-well plates revealed that these components exerted remarkable synergistic effects on promoting cell reactivation, shortening the lag phase and enhancing color contrast (Figure 3.2.1).

*Figure 3.2.1: the coloration-acceleration comparison figure is pending in the supplied manuscript.*

**Learn**

Through systematic screening of these multi-factor variables, we identified an optimized reactivation formulation supporting rapid coloration. Our results showed that YNB-amino-acid-free SC selective medium supplemented with 5% glucose provided optimal energy and carbon skeletons. The combined addition of lysine and tyrosine greatly boosted precursor uptake and cell reactivation. 6-aminoindole (6-AI), acting as a novel amine donor, improved the visual distinguishability of pigments. Moreover, trace Tween 80 surfactant enhanced liquid wettability on paper substrates and cell membrane permeability. This optimized formula resolved the slow reactivation bottleneck and substantially accelerated strip coloration. With this, we established a complete "efficient reactivation – rapid coloration" system, laying a solid foundation for subsequent integration with 3D-printed hardware packaging.

#### 3.2.3 Sub-cycle 3: Hardware Integration for Productization {#results-3-2-3 toc="Hardware"}

**Design**

Previous experiments demonstrated that oxygen availability at the gas-liquid interface serves as the key bottleneck limiting coloration rate. To balance portability for on-site detection and stable oxygen supply, we designed a custom 3D-printed test strip holder. This hardware design addresses three core engineering requirements:

**Thin liquid layer and oxygen diffusion**: Shallow liquid reservoirs and supporting platforms confine the test strip at the optimal gas-liquid interface to avoid hypoxia caused by full submersion.

**Evaporation control and semi-enclosed space**: A semi-closed chamber with micro air vents maintains internal humidity to suppress liquid evaporation while ensuring sufficient gas exchange.

**Mechanical fixation and microfluidic loading**: Combined inclined sample inlet channels and positioning grooves prevent the washing-off of freeze-dried cells during sample loading and avoid liquid overflow.

**Build and Test**

Guided by the above design objectives, we carried out hardware fabrication and functional tests. For 3D modeling and manufacturing, geometric models were built with CAD software. High-precision FDM 3D printing using PLA material was applied to fabricate the portable device, which consists of a base reservoir and a breathable top cover (Figure 3.2.2).

:::figure{scale=70}

![Figure 3.2.2. Photograph of the 3D-printed test strip holder.](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b5b9b9256085-fig3-2-2.avif)

**Figure 3.2.2.** Photograph of the 3D-printed test strip holder.

:::

For functional performance validation, the cell-laden test strip was placed inside the holder, followed by reactivation medium loading. Tests demonstrated that this structure maintained the reactivation medium as a thin liquid layer of approximately 1 mm. Compared with open petri dishes, the sealed chamber reduced liquid evaporation rate by more than 60%. Meanwhile, the micro air vents on the top cover ensured adequate oxygen supply and greatly improved the uniformity of coloration on the strip.

**Learn**

The 3D-printed strip holder addresses the physical constraint of full submersion by controlling liquid-layer thickness and the chamber microenvironment. These tests support further development of a portable yeast test-strip format. **Performance under agricultural sampling conditions and end-to-end sensing remain to be evaluated**.
