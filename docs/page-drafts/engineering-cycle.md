---
source: _content/engineering-cycle.html
slug: engineering-cycle
title: Engineering
route: engineering
hidden: true
crumbs: Project / Engineering
eyebrow: Project / Evidence
heading: The engineering cycle
sub: Design-Build-Test-Learn across the audited notebook, told as documented build work, observed test evidence, and the gates that remain open.
meta: Framework=DBTL | Scope=18-record notebook audit | Reading=8 min
---

# Engineering

01 - Approach

## How we engineer, and how far the records reach

We organise the project around Design-Build-Test-Learn: state a design question and a construct, build it at the bench, test it against a defined criterion, and feed what we learn into the next round.

This page now covers the full eighteen-record notebook audit, from the records labelled 0506 to 0607. Read it as an engineering narrative rather than a status board. The records document real bench work, attempted construction, attempted transformation and verification checks, and several informative negative or inconclusive outcomes, but none of them closes the loop on a working detector: there is no receptor-response, reporter, dose-response, matrix, or end-to-end result in the audited material. The record labels are folder identifiers, not confirmed execution dates, so each cycle below is attributed to what the records describe. The full record-by-record procedure sits on the [ Wet Lab](../pages/wet-lab.html) page, and observed outcomes on the [ Results](../pages/results.html) page.

D

### Design

Each cycle opens with a design question and the construct meant to test it.

[](../pages/design.html)

B

### Build

Bench work is attempted and recorded as documented procedure.

[](../pages/protocols.html)

T

### Test

Measure against a defined criterion and record what is observed.

[](../pages/results.html)

L

### Learn

Feed the observation into the next design and gate.

[](#gates)

02 - Cycle 1

## Attempted KOGal4 and KOGal80 fragment construction

The first cycle is a build track: an attempted construction of the knockout cassettes intended for later replacement of the Gal4 and Gal80 loci in *Saccharomyces cerevisiae* strain CEN.PK2-1C. The records document repeated PCR and gel work; they do not record the expected sizes or written conclusions that would let us call the products correct.

| Phase | Detail | ****
| Design | The intended design is a pair of knockout cassettes, KOGal4 and KOGal80, to be constructed from Gal4 and Gal80 upstream and downstream homology arms with a Ura3 marker for KOGal4 and a Trp1 marker for KOGal80, for later replacement of the Gal4 and Gal80 loci. | ****
| Build | The 0513 record documents first-round PCR work targeting six KOGal fragments, with CEN.PK2-1C genomic DNA as template for the homology arms and p406TEF1 and pRS314 as templates for the Ura3 and Trp1 markers. The 0514 record documents gel purification of the KOGal80 first-round PCR material and second-round overlap and nested third-round PCR work for KOGal4 and KOGal80. The 0527 and 0530 records repeat the third-round PCR with duplicate reactions and verification and recovery gels. | ****
| Test | Gels were run and material was excised and recovered. The 0527 record includes an embedded image with the recorded lane order Marker, Gal4-1, Gal4-2, Gal80-1, Gal80-2 and notes excision of the bands recorded as Gal4 and Gal80; the 0530 record includes two lane maps and a caution about confusing the 100 bp and 1 kb markers. No record states expected fragment sizes or a written conclusion that the pictured bands matched them, and the images were not independently interpreted in this audit. | ****
| Learn | Gel recovery is a documented workflow step, not evidence that the intended KOGal4 and KOGal80 products were correct. The next gate is expected-size checks and independent sequence confirmation of the recovered fragments before they are treated as the intended cassettes. |

03 - Cycle 2

## Attempted transformation and selection, including an explicit negative

The second cycle attempts to introduce the KOGal material into yeast and tries to select putative edited cells on defined drop-out media. Its clearest data point is a negative one, and the response to that negative is the Test-to-Learn transition of this cycle.

| Phase | Detail | ****
| Design | Introduce the KOGal4 and KOGal80 material into CEN.PK2-1C competent yeast and select putative edited cells on defined drop-out media. | ****
| Build | The 0520 record documents SDCt medium preparation and an attempted transformation in which KOGal4 and KOGal80 material was combined with CEN.PK2-1C competent cells before plating on His- and Leu-supplemented SDCt. The 0525 record documents three conditions, Blank, delta-Gal4 and delta-Gal80, on drop-out media designed so that delta-Gal4 omitted Ura and delta-Gal80 omitted Trp. The 0526 record documents a further attempted CEN.PK2-1C transformation with KOGal4 material, with practical notes on hygroscopic casamino acids and light protection of tryptophan-containing material. | ****
| Test | The 0528 record is an explicit result page. It states that no yeast grew on the previously prepared and inoculated double-auxotrophy medium lacking Trp and Ura, with an embedded plate image, while competent yeast did grow on YPD, with a separate embedded image serving as a positive growth control. | ****
| Learn | This is a negative selective-medium result alongside a positive growth control; it is not successful double transformation, and the record assigns no molecular cause. In response, the 0529 record documents repeating the attempted transformation across four groups, including a combined delta-Gal4 plus delta-Gal80 group; the morning medium was noted as fragile during spreading, so we contacted the source of a published method and prepared the afternoon medium according to the method we received. The medium adjustment is an engineering response, not evidence that the revised transformation produced edited cells. |

04 - Cycle 3

## Verifying putative delta-Gal80 candidates, from failed checks to a preliminary conclusion

The third cycle tries to answer whether the putative delta-Gal80 transformants actually carry the intended edit. It runs through a failed check, a no-band result, a troubleshooting step, and a carefully limited preliminary conclusion. None of it amounts to independent confirmation, and none of it addresses delta-Gal4, which remains unverified.

| Phase | Detail | ****
| Design | Determine whether the putative CEN.PK2-1C delta-Gal80 transformants carry the intended edit, using colony PCR with RT, 5-prime and 3-prime checks against positive and negative controls. | ****
| Build | The 0601 image-only record documents streaking putative delta-Gal80 material and the start of a GPR2-GFP fragment-construction workflow. The 0603 and 0604 records document colony-PCR setups with positive and negative controls, and the 0606 record documents putative delta-Gal80 genomic-DNA extraction from a 5 mL culture to provide a cleaner template. | ****
| Test | The 0603 handwritten result states that the RT positive control passed while the remaining RT, 5-prime and 3-prime reactions produced no result; the author suspected that genomic DNA had not been released from the cells. The 0604 handwritten result states that 32 colonies had no bands while the positive control had a band and the negative control did not. The 0607 handwritten record then reports checking eight putative delta-Gal80 candidates and records all eight as RT-negative and 5-prime/3-prime-positive; the author concluded that they were correct. | ****
| Learn | The 0603 attempt is a failed or inconclusive verification, and the behaving 0604 controls do not rescue a colony result in which the candidates remained unverified. The 0607 statement is the author's preliminary PCR conclusion, a pattern recorded as consistent with the intended delta-Gal80 edit; because the page embeds no gel photograph, band sizes, sequencing or independent replicate, it is not independent proof of a sequence-confirmed genomic edit. The open gate is independent or sequence confirmation of the delta-Gal80 edit. That conclusion covers the eight putative delta-Gal80 candidates only: delta-Gal4 remains unverified, no positive Gal4 verification evidence appears in the audited records, and any future Gal4 confirmation is a separate unmet gate. |

05 - Parallel track

## A separate GPR2-GFP build track

A separate build track targets a GPR2-GFP construct for the receptor stage, and it is important not to read its progress as part of the chassis-edit cycles above. The 0601 record documents the start of a GPR2-GFP homologous-recombination fragment-construction workflow by double-joint PCR; the 0604 record documents PCR work targeting KOste-5F, GPR2 and CYC1-related fragments; the 0606 record documents a further double-joint PCR stage with two fragment-reaction recipes and a program; and the 0607 record documents four fragment reactions with Phanta polymerase followed by gel separation and a gel-recovery step, together with a sketched WT/T1/T2/T3 validation-gel lane plan.

This track had reached attempted fragment construction only. The audited records contain no integration of GPR2-GFP into the chassis, no receptor expression or localisation, and no functional test, and a sketched lane plan is a plan rather than a result. Receptor integration, then expression and localisation evidence, then a controlled functional test remain open gates for this track.

06 - Open gates

## What has to be shown before the detector can be called working

These are the evidence gates that stand between the audited work and a detector that could be called working. None is met by the notebook audit, and the records did not themselves set pass-or-fail thresholds for many of the steps above, so the gates are stated as required evidence rather than as criteria the notebook defined. They are listed in the order we intend to address them.

1. **Independent confirmation of the putative delta-Gal80 edit.** Move from the 0607 preliminary PCR conclusion to independent or sequence confirmation that the Gal80 locus carries the intended edit. *(not yet met)*
2. **Confirmation of the delta-Gal4 edit.** Delta-Gal4 remains unverified: the audited records contain no positive Gal4 verification evidence, so Gal4 confirmation is a separate gate that must be cleared on its own evidence. *(not yet met)*
3. **GPR2-GFP integration and expression.** Integrate the GPR2-GFP construct into the chassis and show that the receptor is present and correctly located. *(not yet met)*
4. **Controlled ligand response.** Test the chassis response to ascr#18 against vehicle and non-cognate controls with a defined readout. *(not yet met)*
5. **Reporter response.** Show reporter output above matched negative controls across independent replicates. *(not yet met)*
6. **Specificity and species context.** Characterise the response against related ascarosides and non-target inputs. Team material reports ascr#18 across several *Meloidogyne* species and also from *Heterodera glycines*, so species-level discrimination cannot be assumed, and the taxonomic range and specificity of ascr#18 remain untested. *(not yet met)*
7. **Matrix and end-to-end behaviour.** Characterise performance in a soil-derived matrix and, finally, run a blinded sample-to-call test scored against known inputs. *(not yet met)*

**The receptor question is open**

Kuo et al. (2024) report that the fungal receptors Gpr2 and Gpr3 detect ascr#3 and ascr#7. Our source material contains no evidence that they bind or respond to ascr#18, the ascaroside this project targets. Gpr2 and Gpr3 are candidates awaiting a direct response test, not a validated ascr#18 receptor.

**Why this page stays cautious**

Across all eighteen records the notebook documents attempted build and verification work and genuine negative and inconclusive outcomes, but not a sequence-confirmed edit, receptor expression, ligand response, reporter output, or an end-to-end sensor. Measured outcomes, when they exist, are reported on the [ Results](../pages/results.html) page.
