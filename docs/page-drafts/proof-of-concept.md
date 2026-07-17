---
source: _content/proof-of-concept.html
slug: proof-of-concept
title: Proof of Concept
hidden: true
crumbs: Project / Proof of Concept
eyebrow: Project / Evidence
heading: Proof of concept
sub: The evidence gates an end-to-end demonstration would need, the point the work has actually reached, and why the chain is not yet demonstrated.
meta: Status=Not yet demonstrated | Reading=5 min
---

# Proof of Concept

01 - Claim

## What we aim to prove

The aim of the project is an early-warning biosensor that reports a nematode-derived ascaroside signal in a sample. As a proof-of-concept target, that means a yeast chassis carrying a heterologous receptor should give a reporter readout when the ascaroside ascr#18 is present and stay quiet when it is not. This end-to-end behaviour has not been demonstrated; this page describes the plan, the gates it must pass, and the point the audited work has actually reached.

One scope limit matters up front. The intended readout is the presence of an ascaroside signal, not an identification of species. The supported boundary is narrow: team material reports ascr#18 across several *Meloidogyne* species and also from *Heterodera glycines*. Two further descriptions carried in an internal team table, concerning the relative abundance of ascr#18 and its degree of conservation, are not traced to a public source and are withheld here rather than repeated. On that basis species-level discrimination cannot be assumed, and the taxonomic range and specificity of ascr#18 remain untested. A response to ascr#18 therefore could not, on its own, distinguish one species from another, and species-level discrimination would require additional, orthogonal evidence beyond the chain described here.

02 - Endpoint

## How far the work actually reaches

It is worth being exact about the current endpoint, because it is early. On the chassis side, the furthest documented point is a preliminary edit-verification PCR conclusion: in the 0607 record the author checked eight putative CEN.PK2-1C delta-Gal80 candidates against positive and negative controls, recorded all eight as RT-negative and 5-prime/3-prime-positive, and concluded that they were correct. Because that record embeds no gel photograph, band sizes, sequencing or independent replicate, it is a preliminary PCR pattern recorded as consistent with the intended delta-Gal80 edit, not an independent or sequence-confirmed edit. That conclusion reaches the eight putative delta-Gal80 candidates only. Delta-Gal4 remains unverified: the audited records carry no positive Gal4 verification evidence, and any future Gal4 confirmation is a separate unmet gate.

On the receptor side, an attempted GPR2-GFP fragment-construction workflow was under way but unfinished: the records document double-joint PCR work targeting the fragments, a gel-recovery step and a sketched validation-gel lane plan, but no integration into the chassis, no receptor expression or localisation, and no functional test.

Two clarifications follow. The earlier 0528 record, in which no yeast grew on the double-auxotrophy plate while yeast grew on the YPD growth control, is a selection observation with a growth control; it is not an integrated sensor test. And no end-to-end run, from a prepared sample to a call, has been performed at any point in the audit.

03 - Chain

## The chain we intend to build

A convincing demonstration would connect the links below in order, and the chain is only as strong as its weakest unproven link. The first link is where the audited work currently sits, at a preliminary rather than a confirmed stage, and it reaches the putative delta-Gal80 candidates only; the rest are not yet begun as measured evidence.

1. independent or sequence confirmation of the putative delta-Gal80 edit, moving beyond the 0607 preliminary PCR conclusion;
2. confirmation of the delta-Gal4 edit, which remains unverified and is a separate unmet gate with no positive verification evidence in the audit;
3. integration of GPR2-GFP into the chassis, with evidence of receptor expression and correct localisation;
4. a controlled response to ascr#18, measured against vehicle and non-cognate controls;
5. a reporter response reproduced across independent replicates with matched controls;
6. characterised interference and recovery in a soil-derived matrix;
7. an end-to-end, blinded run that turns a prepared sample into a call scored against known inputs, with species context interpreted rather than assumed.

04 - Gates

## Gate status

The same links, written as gates. No gate is cleared, because the audited evidence does not yet meet its definition, and no performance figure, detection limit or replicate count is supported. Attempted build and verification work has begun, and the delta-Gal80 gate below has a preliminary PCR conclusion attached to it, but no gate below is met.

| Gate | Status | What would clear it |
| Independent confirmation of the putative delta-Gal80 edit | Preliminary PCR conclusion recorded at 0607 on eight putative candidates; not yet independently confirmed | Sequencing or an independent decisive method confirming the delta-Gal80 edit |
| Confirmation of the delta-Gal4 edit | Not yet demonstrated; delta-Gal4 remains unverified and the audit holds no positive Gal4 verification evidence | A separate gate: sequencing or an independent decisive method confirming the delta-Gal4 edit |
| GPR2-GFP integration and receptor expression | Not yet demonstrated | GPR2-GFP integrated and the receptor shown present and correctly located in the chassis |
| Controlled ligand response | Not yet demonstrated | A response to ascr#18 above vehicle and non-cognate controls |
| Reporter response with replicates | Not yet demonstrated | Reporter output above matched controls, reproduced across independent replicates |
| Matrix interference and recovery | Not yet demonstrated | Recovery and interference characterised in soil-derived samples versus clean buffer |
| End-to-end blinded classification | Not yet demonstrated | A blinded sample-to-call run scored against known inputs |

**No gate is cleared yet**

Proof of concept means the whole chain shown to work from sample to call. At present it is a plan, with an early preliminary PCR conclusion attached to the putative delta-Gal80 gate alone. The receptor step is unresolved in particular: there is no evidence that Gpr2 or Gpr3 responds to ascr#18. This page stays marked as not yet demonstrated until the gates above are met with data. Current evidence status is tracked on the [ Results](../pages/results.html) page.

05 - Sources

## References
1. Choe A, et al. Ascaroside signaling is widely conserved among nematodes. *Current Biology* 22(9):772-780 (2012). [ doi:10.1016/j.cub.2012.03.024](https://doi.org/10.1016/j.cub.2012.03.024).
2. Kuo CY, et al. The nematode-trapping fungus *Arthrobotrys oligospora* detects prey pheromones via G protein-coupled receptors. *Nature Microbiology* 9:1738-1751 (2024). [ doi:10.1038/s41564-024-01679-w](https://doi.org/10.1038/s41564-024-01679-w). Reports Gpr2 and Gpr3 detecting ascr#3 and ascr#7, not ascr#18.
3. Yang B, et al. Nematode pheromones: structures and functions. *Molecules* 28(5):2409 (2023). [ doi:10.3390/molecules28052409](https://doi.org/10.3390/molecules28052409).
