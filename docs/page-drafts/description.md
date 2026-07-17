---
source: _content/description.html
slug: description
title: Description
crumbs: Project / Description
eyebrow: Project / Case file 01
heading: What we are solving
sub: Two soil-borne nematodes, delayed visible symptoms, and a proposed sensing route whose biological links still require validation.
meta: Track=Diagnostics / Agriculture | Reading=7 min | Status=Living document
---

# Description

01 - Background

## A threat that works underground

Plant-parasitic nematodes are microscopic roundworms that feed on plant roots. Because the damage begins below the soil line, infestations can remain unnoticed until above-ground symptoms and yield effects appear.

Our project focuses on two targets identified in the team's project materials: *Heterodera glycines* and *Meloidogyne incognita*. Internal literature notes associate the ascaroside **ascr#18** with both targets, but the underlying primary sources must be traced before that association can be treated as established.

### *Heterodera glycines*

**The soybean cyst nematode.** A major pathogen of soybean. Females swell into protective cysts packed with eggs that can persist in soil between growing seasons, complicating control once the pest is established.

An internal literature lead reports the ascaroside **ascr#18** from *H. glycines*. Because a traceable primary source is not supplied, this remains part of the candidate-analyte rationale rather than proof of a usable signal.

### *Meloidogyne incognita*

**The southern root-knot nematode.** A generalist with a broad host range that forms characteristic "knots" (galls) on roots and disrupts plant function.

It has a broad host range. Separately, an internal research table describes **ascr#18** in entries for *Meloidogyne* spp.; that genus-level lead still requires primary-source tracing before it is applied specifically to *M. incognita*.

**Why these two?**

They represent two important sedentary endoparasitic strategies - cyst formation and root-knot gall formation. Internal notes link ascr#18 to *Meloidogyne* entries and *H. glycines*, but neither the taxonomic coverage nor a usable signal under the proposed sampling conditions has been established. Even if broad ascr#18 recognition proves possible, it would not identify either species on its own.

02 - The gap

## Diagnostic methods carry different trade-offs

Some conventional workflows extract organisms from soil for morphological identification. These can require trained specialists, while molecular and field-oriented alternatives introduce different requirements and limitations.

Molecular and field methods exist, but the team's literature review found recurring trade-offs in workflow, equipment, cost, specificity, and sampling reliability. The table below summarises those method families without treating any one limitation as universal.

### Slow workflows

Extraction, preparation, and identification can delay an actionable answer.

### Resource-intensive

Several methods depend on specialist labour, instruments, or laboratory workflows.

### Specialist interpretation

Reliable identification can depend on taxonomic expertise or validated reference workflows.

| Method family | What it offers | Field-readiness limitation |
| Morphology | Inexpensive and direct | Slow, subjective, expertise-dependent; overlapping morphology and intraspecific variation |
| Biochemical (isoenzyme, MALDI-TOF) | Isoenzyme useful for root-knot species; MALDI-TOF fast and sensitive | Isoenzyme largely limited to root-knot nematodes; MALDI-TOF needs specialist equipment and skills |
| PCR-based (RFLP, SCAR, barcoding, qPCR, ddPCR) | Strong specificity or quantification | Field use constrained by workflow, reference databases, equipment, or cost |
| Isothermal (LAMP, RPA, with CRISPR/Cas12a) | Simpler and faster than PCR; Cas12a can add specificity and sensitivity | LAMP vulnerable to aerosol contamination; still reagent- and design-intensive |
| Direct field kits (FTA cards, soil-DNA, lateral flow) | Simplified preparation; visual readouts | Heterogeneous nematode distribution in soil reduces sampling reliability |
| Remote sensing / machine learning | Supports large-area monitoring | Depends on symptom specificity and high-quality datasets |

**Table 1** Detection method families and the constraint each faces in the field, as compiled by the team's literature review. As a state-of-the-art field comparator, Camacho *et al.* (2024) combined FTA-card extraction, LAMP (60–65 °C), and a magnetoresistive biosensor for the cyst nematode *Globodera pallida* and reported detection of a single juvenile; even so, the modules were not fully integrated, the workflow stayed relatively long, and the assay was single-target [4].

Across the methods reviewed, no single approach removed every constraint the team prioritised. Our project therefore investigates a complementary route: sensing a nematode-associated chemical signal rather than first isolating and identifying the organism itself.

03 - The idea

## Investigate a field-oriented sensing route

We are investigating a **biosensor concept intended for eventual field-oriented use**. The proposed workflow would prepare a soil-derived input, challenge a candidate receptor with an ascaroside signal, and produce an interpretable output. Every stage remains contingent on direct validation, including whether the signal represents *H. glycines* or *M. incognita*.

> See the pest before you see the symptom.

That is the goal, not a finished claim. Signal persistence in soil, representative sampling, receptor response, pathway coupling, reporter choice, and interpretation are open questions. Future engagement must also test whether the proposed workflow addresses real user and regulatory needs.

**Fig 1** The intended sensing pipeline at a glance. This is the design hypothesis - not a validated end-to-end result. The candidate receptor still requires direct response testing, and the reporter has not been selected; see the Design page for the open questions.

04 - Approach

## Why this is a synthetic-biology problem

Nematodes use ascarosides as chemical signals, and organisms that hunt nematodes have receptors involved in reading related compounds. Synthetic biology provides a way to test whether a candidate receptor can be expressed in a yeast chassis and coupled to a future output. Three features motivate the investigation:

- **Recognition evolved for related signals** - rather than designing a binder from scratch, we start from G-protein-coupled receptors (GPCRs) that a nematode-preying fungus uses to sense ascr#3 and ascr#7 (Kuo *et al.*, 2024) [3]. Their response to our candidate target, ascr#18, is unknown.
- **Pathway precedent** - heterologous GPCRs can be coupled to the native yeast mating pathway, but receptor expression, functional coupling, amplification, and output remain unproven for this project.
- **A well-understood chassis** - budding yeast is straightforward to culture and has an established heterologous-GPCR engineering toolkit. Whether it preserves enough target signal for this specific assay still has to be tested.

Concretely, the proposed chassis is *Saccharomyces cerevisiae*; the recognition element is a candidate heterologous GPCR that first requires direct ascr#18 response testing; and mating-pathway coupling is an intended engineering step. No reporter has yet been selected, built, or measured.

05 - Scope

## What we set out to achieve this season
- Goal 01

#### Establish the molecular target

Confirm which ascaroside signal best indicates early infestation by our target nematodes, and trace the reported concentrations to primary literature.

- Goal 02

#### Test a candidate receptor in yeast

Assess receptor expression, localisation, direct ligand response, and proposed pathway coupling before selecting and testing a reporter.

- Goal 03

#### Move toward a soil-derived sample

Test performance beyond clean buffer and characterise how stable the ascaroside signal is in soil.

- Goal 04

#### Ground the design in real needs

Seek consented, attributable engagement with growers, agronomists, and regulators, then document whether it changes a design decision.

06 - Sources

## References
1. Jones JT *et al.* Top 10 plant-parasitic nematodes in molecular plant pathology. *Molecular Plant Pathology* 14(9):946–961 (2013).
2. Choe A *et al.* Ascaroside signaling is widely conserved among nematodes. *Current Biology* 22(9):772–780 (2012). [ doi:10.1016/j.cub.2012.03.024](https://doi.org/10.1016/j.cub.2012.03.024)
3. Kuo CY *et al.* The nematode-trapping fungus *Arthrobotrys oligospora* detects prey pheromones via G protein-coupled receptors. *Nature Microbiology* 9:1738–1751 (2024). [ doi:10.1038/s41564-024-01679-w](https://doi.org/10.1038/s41564-024-01679-w)
4. Camacho MJ *et al.* FTA-LAMP based biosensor for a rapid in-field detection of *Globodera pallida*. *Frontiers in Bioengineering and Biotechnology* 12:1337879 (2024). [ doi:10.3389/fbioe.2024.1337879](https://doi.org/10.3389/fbioe.2024.1337879)

**Status of this page**

This is a living document. The sensing concept described here is a design in progress - it has not been demonstrated end-to-end, and no detection limit, timing, or field performance is claimed. The Background and Design pages carry the underlying evidence and the open questions still to be resolved.
