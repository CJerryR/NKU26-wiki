---
source: _content/results.html
slug: results
title: Results
hidden: true
crumbs: Project / Results
eyebrow: Project / Evidence
heading: Results and evidence status
sub: The auditable outcomes across the eighteen notebook records, and the sensor-performance evidence that remains absent.
meta: Type=Evidence status | Scope=18 notebook records | Reading=8 min
---

# Results

01 - Status

## Where the evidence stands

This page reports the auditable outcomes across the full eighteen-record notebook audit, labelled 0506 to 0607. The honest headline is that the strongest auditable result is not a working detector. It is a documented sequence of attempted build and verification work: one explicit negative selective-plate observation, two failed or inconclusive PCR verification attempts, the troubleshooting that followed, and a later preliminary PCR conclusion recorded by the notebook author.

Nothing in the audited material establishes a receptor response, reporter output, dose response, limit of detection, specificity, species discrimination, soil-matrix performance, or an end-to-end sensor. The absence of those results is not a claim that every experiment failed: the records document real bench work and informative negative outcomes. It is a statement about which capabilities the evidence can and cannot support. The two-record bacterial setup and the full record-by-record procedure are described on the [ Wet Lab](../pages/wet-lab.html) page.

02 - Observed

## The four clearest records

Four records carry the clearest observations in the audit. For each, the observation, its control context, the interpretation it supports, and what it does not prove are separated below.

### The 0528 negative plate

**Observation.** The 0528 record states that no yeast grew on the previously prepared and inoculated double-auxotrophy medium lacking Trp and Ura, with an embedded plate image. **Control context.** The same record states that competent yeast grew on YPD, with a separate embedded image, giving a positive growth control. **Supported interpretation.** This is a negative selective-medium result alongside a positive growth control. **What it does not prove.** It is not successful double transformation, the record assigns no molecular cause for the absence of growth, and it is not an integrated sensor test.

### The 0603 inconclusive verification

**Observation.** The 0603 record documents colony-PCR verification of putative delta-Gal80 transformants with RT, 5-prime and 3-prime checks; the handwritten result records that the RT positive control passed while the remaining RT, 5-prime and 3-prime reactions produced no result. **Control context.** Positive and negative controls were included, and the positive control behaved as expected. **Supported interpretation.** This is a failed or inconclusive verification attempt; the author suspected that genomic DNA had not been released from the cells. **What it does not prove.** It does not show a correct delta-Gal80 edit.

### The 0604 no-band colonies

**Observation.** The 0604 handwritten result records that 32 colonies produced no bands, while the positive control had a band and the negative control did not; the recorded next step was to culture a subset, extract genomic DNA and repeat the PCR. **Control context.** Both the positive and negative controls behaved as expected. **Supported interpretation.** At this stage the candidates remained unverified; the behaving controls do not rescue the colony result. **What it does not prove.** It does not establish any edit, and the record does not state why all 32 produced no bands.

### The 0607 preliminary PCR conclusion

**Observation.** The 0607 record documents RT, 5-prime and 3-prime PCR checks on eight putative delta-Gal80 candidates with positive and negative controls; the author recorded all eight as RT-negative and 5-prime/3-prime-positive and concluded that they were correct. **Control context.** Positive and negative controls were included. **Supported interpretation.** This is the author's preliminary PCR conclusion, a pattern recorded as consistent with the intended delta-Gal80 edit and the first explicit positive verification statement in the audited sequence. **What it does not prove.** The page embeds no gel photograph, no expected or observed band sizes, no sequencing and no independent replicate, so it is not independent proof of a sequence-confirmed genomic edit. It also says nothing about delta-Gal4: the check covers the eight putative delta-Gal80 candidates only, delta-Gal4 remains unverified, and any future Gal4 confirmation is a separate unmet gate.

03 - Gels

## Fragment gel and recovery workflows

Several records document fragment gel and recovery workflows. The 0514 record documents gel purification of the KOGal80 first-round PCR material and further overlap and nested PCR work; the 0527 record documents duplicate third-round KOGal4 and KOGal80 reactions, verification and recovery gels, an embedded image with the recorded lane order Marker, Gal4-1, Gal4-2, Gal80-1, Gal80-2, and excision of the bands recorded as Gal4 and Gal80; the 0530 record repeats the third-round PCR with two lane maps and a caution about confusing the 100 bp and 1 kb markers.

These are documented workflows with embedded lane images. Because no expected fragment sizes and no written pass-or-fail interpretation are recorded, and the images were not independently interpreted in this audit, they cannot establish that the recovered material has the intended construct identity.

04 - Gates

## Evidence gate by capability

Each row below is a capability the finished detector would need to demonstrate. No audited record clears any of these gates, and no detection threshold, replicate count, efficiency or performance figure is asserted on this page, because none is available to assert.

| Capability / claim | Status | Evidence that would be required |
| Construct identity of the recovered KOGal material | Not established by the audited records | Expected-size checks plus independent sequence confirmation of the recovered material |
| Independent confirmation of the putative delta-Gal80 edit | Not established by the audited records; the 0607 record carries the author's preliminary PCR conclusion only | Sequencing or an equivalently decisive independent method confirming the delta-Gal80 edit |
| Confirmation of the delta-Gal4 edit | Not established by the audited records; delta-Gal4 remains unverified and no positive Gal4 verification evidence appears in the audit | A separate, currently unmet gate: sequencing or an equivalently decisive independent method confirming the delta-Gal4 edit |
| Receptor expression and localisation | Not established by the audited records | GPR2-GFP integrated and the receptor shown present and correctly located in the chassis |
| Ligand-response controls | Not established by the audited records | Chassis response to ascr#18 measured against vehicle and non-cognate controls |
| Reporter signal and replicates | Not established by the audited records | Reporter output above matched negative controls across independent replicates |
| Dose response and limit of detection | Not established by the audited records | A concentration series and an operationally defined detection limit (no value assumed here) | ****
| Specificity and species context | Not established by the audited records | Response characterised against related ascarosides and non-target inputs. Team material reports ascr#18 across several Meloidogyne species and also from Heterodera glycines, so species-level discrimination cannot be assumed, and the taxonomic range and specificity of ascr#18 remain untested |
| Matrix performance | Not established by the audited records | Performance in a soil-derived matrix versus clean buffer, with recovery and interference characterised |
| End-to-end classification | Not established by the audited records | A blinded sample-to-call run scored against known inputs |

**Status, not verdict**

Every entry reads not established because the audited evidence does not clear that gate. Genuine negative and inconclusive verification outcomes are useful engineering evidence, but they are not a completed sensor-performance test. The engineering plan behind these gates is set out on the [ Engineering](../engineering/) page.

05 - Gaps

## What remains open

In order, the evidence gaps that remain open across the whole audit are the following, and each is currently unmet:

1. independent or sequence confirmation of the putative delta-Gal80 edit, moving beyond the 0607 preliminary PCR conclusion;
2. confirmation of the delta-Gal4 edit, which remains unverified and is a separate unmet gate;
3. receptor expression and localisation;
4. a controlled ligand response to ascr#18;
5. reporter output with matched controls and replication;
6. dose response and a defined detection limit;
7. specificity and species context;
8. soil-matrix performance;
9. an end-to-end, blinded sample-to-call test.

06 - Basis

## What this status rests on

This page rests on the eighteen dated records in the team's authenticated notebook, labelled 0506 to 0607. The labels are folder identifiers rather than confirmed execution dates, and no external measurements are reported here.

1. Team notebook records labelled 0506 to 0607, from the authenticated Feishu notebook (access-restricted; not publicly linked). The recorded procedure and its limits are summarised on the [ Wet Lab](../pages/wet-lab.html) page, and the record-by-record notebook is on the [ Notebook](../pages/notebook.html) page; neither carries evidence beyond this audit.
2. No external measurement or performance reference is cited on this page. Any future measured outcome will be added here with its method.
