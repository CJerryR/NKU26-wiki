---
source: _content/protocols.html
slug: protocols
title: Protocols
hidden: true
crumbs: Lab / Protocols
eyebrow: Lab / Methods
heading: The recipes
sub: Bench workflows exactly as written in the team notebook — recorded procedures, not yet independently validated results.
meta: Reading=6 min | Format=Documented workflows
---

# Protocols

01 — Index

## Everything we actually recorded

This page collects the wet-lab procedures that appear in the team notebook, grouped by workstream. Every entry is transcribed from a dated record: it documents what the workflow *called for*, not a claim that the step produced a correct or validated result. Where the notebook does not supply a parameter — a primer sequence, a full thermal-cycling program, an expected band size, a reagent lot, or a numeric yield — we leave the gap visible rather than fill it from general knowledge.

### Bacterial plasmid handling

Transformation, culture, and miniprep in *E. coli*.

### Yeast nucleic-acid prep

Genomic-DNA extraction from *S. cerevisiae*.

### Fragment PCR & gel recovery

Knockout-cassette and recombination-fragment amplification.

### Yeast transformation & selection

Cassette delivery and dropout-medium selection.

**Read these as records, not validated protocols**

A documented workflow is not automatically a reproducible protocol. Several recipes here are incomplete — for example, the composition of “solution 3” and the full PCR programs are not in the source — and one antibiotic concentration in the earliest records is atypical and withheld pending team confirmation. Treat the collection as a faithful transcription to be completed and verified before reuse.

02 — E. coli

## Plasmid transformation, culture, and miniprep

**Chemically competent transformation (0506 record).** Lyophilised plasmid was spun down (13,000 rpm, 3 min) and resuspended in EB. Trans5α competent *E. coli* was thawed on ice, aliquoted at 50 µL, combined with a small volume of plasmid solution, held on ice for 30 min, heat-shocked at 42 °C for 45 s, returned to ice for 2 min, rescued in 500 µL plain LB, and recovered at 37 °C for 1 h. Recovered culture (100 µL) was plated on the matching resistance plate. The record handled five plasmids — four described as ampicillin-resistant and one as kanamycin-resistant — but the visible section does not name all five. No colony counts, identity checks, or transformation outcome are recorded.

**Overnight culture and colony picking (0507 record).** A single Trans5α colony was inoculated into 10 mL plain LB with the selective antibiotic and grown at 37 °C overnight. Two colony-picking methods are described: touching a colony with a pipette tip and rinsing it in medium, or transferring a colony directly on the tip. Flasks were to be labelled with plasmid name, date, and operator. This step establishes a culture, not clone identity.

**Alkaline-lysis miniprep (0508 record).** Culture (1–5 mL, collected in repeated loads) was processed through a K1/K2/K3 alkaline-lysis series onto an equilibrated ZBL spin column, washed twice with W2, spun dry, air-dried for 3–5 min, and eluted with two passes of 60 µL warmed TE. A NanoDrop reading and a gel sample were planned, and the product was stored at −20 °C. No NanoDrop value, purity ratio, gel image, or plasmid identity is recorded.

**Handling notes actually written in the records**

Add glucose to YPD only after autoclaving and cooling, to avoid caramelisation. Resuspend the bacterial cell pellet completely during alkaline lysis. The W2 wash buffer already contains ethanol. Warm the elution buffer before use. Keep K1 at 4 °C because it contains RNase. These are documented bench notes, not institutionally reviewed procedures.

**Antibiotic units withheld**

The 0506 and 0507 records state an ampicillin stock and working concentration that are atypical for standard LB–ampicillin selection and may be a unit error. The numeric values are intentionally omitted here until the team confirms the intended stock and working units.

03 — Yeast DNA

## Genomic-DNA extraction from *S. cerevisiae*

**Bead-beating extraction (0511 record).** From 1.5 mL culture, cells were lysed in LETS buffer with two sterile steel beads (tissue grinder, 70 Hz, 60 s), followed by organic extraction, ethanol precipitation and wash, and dissolution in 50 µL TE or EB. A sample was run against a 1 kb marker at 100 V for 30 min. No DNA concentration or gel interpretation is recorded.

**Repeat genomic extraction (0606 record).** A later handwritten record repeats genomic-DNA extraction from a 5 mL putative CEN.PK2-1C ΔGal80 candidate culture — centrifugation, LETS-buffer resuspension, disruption and extraction, precipitation, electrophoresis at 136 V for 20 min, and −20 °C storage. As with 0511, no concentration or sequence result is written on the page.

04 — PCR

## Knockout-cassette PCR and gel recovery

**First-round fragment PCR (0513 record).** Six KOGal fragments were set up in 50 µL reactions with 2× Phanta Max buffer, dNTPs, fragment-specific primers, and Phanta polymerase: the Gal4 and Gal80 upstream and downstream homology arms, a Ura3 marker for KOGal4, and a Trp1 marker for KOGal80. CEN.PK2-1C genomic DNA is listed as the template for the homology arms; p406TEF1 and pRS314 are listed for Ura3 and Trp1. The record ends by placing the tubes in the cycler — no thermal program, expected size, gel, or yield is given.

**Overlap and nested rounds (0514 record).** KOGal80 first-round products were gel-run and purified; the record then lists 25 µL second-round overlap-PCR recipes for KOGal4 and KOGal80 and 50 µL nested third-round recipes, ending with separation and recovery gels, gel recovery, and −20 °C storage. “Gel recovery” is an executed workflow note, not evidence that the intended products were correct; no expected sizes or concentrations appear.

**Repeat third-round PCR and band excision (0527 and 0530 records).** Third-round KOGal4/KOGal80 PCR was repeated in duplicate on 1% agarose (0527: 126 V, 20 min; 0530 repeated the PCR alongside extraction checks), and the corresponding Gal4 and Gal80 bands were cut from a recovery gel with minimal (~10 s) UV exposure. The 0527 record embeds a gel image and lane map read against a 1 kb ladder; the 0530 record includes separate maps — a 100 bp marker for its amplification-control gel and a 1 kb marker for its extraction-check gel. Neither record states expected sizes or a written pass/fail interpretation, so band identity is not established here.

**GPR2-GFP double-joint PCR (0601, 0606, 0607 records).** Several handwritten records document PCR attempts targeting a proposed GPR2-GFP homologous-recombination fragment, with multi-fragment reaction recipes, Phanta polymerase, gel separation, and gel recovery, plus a sketched later validation-lane plan. These records establish neither the identity of the recovered material nor completion or verification of a GPR2-GFP construct.

**Documented gel-handling cautions**

Choose the marker deliberately — the records warn against confusing a 100 bp marker with a 1 kb marker — and minimise UV exposure when excising bands. These notes are recorded practice, not proof of fragment correctness.

05 — Transformation

## Yeast transformation and dropout selection

**Transformation workflow (0520, 0525, 0526, 0529 records).** CEN.PK2-1C competent cells were combined with knockout-cassette material (typically 2.5–5 µL KOGal4 and/or KOGal80) and 500 µL “solution 3”, incubated at 30 °C for 1 h with mixing roughly every 15 min, then spread on SDCt dropout plates and incubated inverted at 28 °C. The composition of “solution 3” is not supplied in the source, so this is not a complete standalone protocol.

The selection scheme distinguishes the intended edits by which nutrients are dropped out of the plate:

| Group | Cassette added | SDCt dropout plate |
| Blank (control) | none | His + Trp + Ura + Leu |
| ΔGal4 | KOGal4 (Ura3 marker) | omits Ura |
| ΔGal80 | KOGal80 (Trp1 marker) | omits Trp |

Later rounds (0529 record) added a combined ΔGal4 + ΔGal80 group. None of these records reports a colony count, plate scoring, or edit validation; the selective-medium outcome itself is recorded separately in the notebook (see the 0528 result).

**Media-preparation notes from the records**

Technical-grade casamino acids were noted as strongly hygroscopic during weighing; tryptophan-containing material was protected from light and UV; and one batch of transformation medium was noted as fragile and prone to breaking during spreading. These are documented observations, not a validated media formulation.

06 — For repeaters

## What is still missing to reproduce this

To turn these records into protocols another team could follow without guessing, the following would need to be added and confirmed: the composition of “solution 3” and any incomplete media and buffer recipes; primer sequences for the KOGal products and PCR attempts targeting the proposed GPR2-GFP fragment; full thermal-cycling programs; expected fragment sizes and success criteria; reagent sources and lots; and the antibiotic stock and working concentrations flagged below. Until then, each workflow is a transcribed record rather than a reproducible protocol.

**How to read the record labels**

Labels such as “0506” identify a notebook record, not an independently proven execution date. Handwritten records (0601 onward) carry additional uncertainty because their text is not machine-extractable and some details are ambiguous.

**Confirm before finalising**

The atypical ampicillin units in the earliest records must be verified before any of these procedures is finalised or used in a risk assessment. The suspect values are not printed here.
