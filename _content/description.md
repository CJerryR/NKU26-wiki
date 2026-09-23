---
title: Description
route: description
group: Project
icon: magnifier
summary: A soil-borne threat that shows itself too late, the trade-offs in current detection, and the sensing route we are investigating this season.
desc: NKU26-China project description: plant-parasitic nematodes, the limits of current detection methods, and the yeast-based ascaroside sensing concept we are investigating.
meta: Targets=H. glycines, M. incognita | Stage=Under investigation
---

## A threat that works underground {#problem data-toc="The problem"}

Plant-parasitic nematodes are microscopic roundworms that feed on plant roots. Because the
damage begins below the soil line, infestations can remain unnoticed until above-ground
symptoms and yield effects appear [@jones2013].

Our project focuses on two targets identified in the team's project materials: *Heterodera
glycines* and *Meloidogyne incognita*. Internal literature notes associate the ascaroside
**ascr#18** with both targets, but the underlying primary sources must be traced before that
association can be treated as established.

### Heterodera glycines {#suspect-glycines data-toc="Suspect - H. glycines"}

**The soybean cyst nematode.** A major pathogen of soybean. Females swell into protective
cysts packed with eggs that can persist in soil between growing seasons, complicating control
once the pest is established.

<Evidence level="hypothesis">
An internal literature lead reports ascr#18 from *H. glycines*. Because a traceable primary
source is not supplied, this remains part of the candidate-analyte rationale rather than proof
of a usable signal.
</Evidence>

### Meloidogyne incognita {#suspect-incognita data-toc="Suspect - M. incognita"}

**The southern root-knot nematode.** A generalist with a broad host range that forms
characteristic knots, or galls, on roots and disrupts plant function.

<Evidence level="hypothesis">
An internal research table describes ascr#18 in entries for *Meloidogyne* spp. That
genus-level lead still requires primary-source tracing before it is applied specifically to
*M. incognita*.
</Evidence>

<Callout type="note" title="Why these two?">
They represent two important sedentary endoparasitic strategies, cyst formation and root-knot
gall formation. Ascaroside signalling itself is widely conserved across nematodes
[@choe2012], which is what makes an ascaroside plausible as a shared analyte — but neither the
taxonomic coverage of ascr#18 nor a usable signal under the proposed sampling conditions has
been established here. Even if broad ascr#18 recognition proves possible, it would not
identify either species on its own.
</Callout>

## Diagnostic methods carry different trade-offs {#gap data-toc="Why current tests fall short"}

Some conventional workflows extract organisms from soil for morphological identification.
These can require trained specialists, while molecular and field-oriented alternatives
introduce different requirements and limitations.

Our literature review found recurring trade-offs in workflow, equipment, cost, specificity,
and sampling reliability. Three constraints came up repeatedly:

- **Slow workflows.** Extraction, preparation, and identification can delay an actionable answer.
- **Resource-intensive methods.** Several depend on specialist labour, instruments, or laboratory workflows.
- **Specialist interpretation.** Reliable identification can depend on taxonomic expertise or validated reference workflows.

The table below summarises the method families without treating any one limitation as
universal.

<Figure kind="table" caption="Detection method families and the constraint each faces in the field, as compiled by our literature review.">

| Method family | What it offers | Field-readiness limitation |
|---|---|---|
| Morphology | Inexpensive and direct | Slow, subjective, expertise-dependent; overlapping morphology and intraspecific variation |
| Biochemical (isoenzyme, MALDI-TOF) | Isoenzyme useful for root-knot species; MALDI-TOF fast and sensitive | Isoenzyme largely limited to root-knot nematodes; MALDI-TOF needs specialist equipment and skills |
| PCR-based (RFLP, SCAR, barcoding, qPCR, ddPCR) | Strong specificity or quantification | Field use constrained by workflow, reference databases, equipment, or cost |
| Isothermal (LAMP, RPA, with CRISPR/Cas12a) | Simpler and faster than PCR; Cas12a can add specificity and sensitivity | LAMP vulnerable to aerosol contamination; still reagent- and design-intensive |
| Direct field kits (FTA cards, soil-DNA, lateral flow) | Simplified preparation; visual readouts | Heterogeneous nematode distribution in soil reduces sampling reliability |
| Remote sensing / machine learning | Supports large-area monitoring | Depends on symptom specificity and high-quality datasets |

</Figure>

As a state-of-the-art field comparator, @camacho2024 combined FTA-card extraction, LAMP at
60–65 °C, and a magnetoresistive biosensor for the cyst nematode *Globodera pallida* and
reported detection of a single juvenile; even so, the modules were not fully integrated, the
workflow stayed relatively long, and the assay was single-target. <Tag level="literature" />

Across the methods reviewed, no single approach removed every constraint we prioritised. Our
project therefore investigates a complementary route: sensing a nematode-associated chemical
signal rather than first isolating and identifying the organism itself.

## Investigate a field-oriented sensing route {#idea data-toc="Our idea"}

We are investigating a **biosensor concept intended for eventual field-oriented use**. The
proposed workflow would prepare a soil-derived input, challenge a candidate receptor with an
ascaroside signal, and produce an interpretable output. Every stage remains contingent on
direct validation, including whether the signal represents *H. glycines* or *M. incognita*.

> See the pest before you see the symptom.

That is the goal, not a finished claim. Signal persistence in soil, representative sampling,
receptor response, pathway coupling, reporter choice, and interpretation are open questions.
Future engagement must also test whether the proposed workflow addresses real user and
regulatory needs.

<Figure src="img/figures/sensing-pipeline.svg" alt="Five stages in a row: soil-derived sample, ascaroside signal (ascr#18, marked uncertain), candidate yeast GPCR sensor, mating-pathway amplification, and visual readout." caption="The intended sensing pipeline at a glance. This is the design hypothesis, not a validated end-to-end result. The candidate receptor still requires direct response testing, and the reporter has not been selected; see the Design page for the open questions." />

## Why this is a synthetic-biology problem {#why-synbio data-toc="Why synthetic biology"}

Nematodes use ascarosides as chemical signals, and organisms that hunt nematodes have
receptors involved in reading related compounds. Synthetic biology provides a way to test
whether a candidate receptor can be expressed in a yeast chassis and coupled to a future
output. Three features motivate the investigation:

- **Recognition evolved for related signals.** Rather than designing a binder from scratch, we
  start from GPCRs that a nematode-preying fungus uses to sense ascr#3 and ascr#7
  [@kuo2024]. <Tag level="literature" /> Their response to our candidate target, ascr#18, is
  unknown. <Tag level="open" />
- **Pathway precedent.** Heterologous GPCRs can be coupled to the native yeast mating pathway,
  but receptor expression, functional coupling, amplification, and output remain unproven for
  this project.
- **A well-understood chassis.** Budding yeast is straightforward to culture and has an
  established heterologous-GPCR engineering toolkit. Whether it preserves enough target signal
  for this specific assay still has to be tested.

Concretely, the proposed chassis is *Saccharomyces cerevisiae*; the recognition element is a
candidate heterologous GPCR that first requires direct ascr#18 response testing; and
mating-pathway coupling is an intended engineering step. No reporter has yet been selected,
built, or measured.

## What we set out to achieve this season {#goals data-toc="Project goals"}

1. **Establish the molecular target.** Confirm which ascaroside signal best indicates early
   infestation by our target nematodes, and trace the reported concentrations to primary
   literature.
2. **Test a candidate receptor in yeast.** Assess receptor expression, localisation, direct
   ligand response, and proposed pathway coupling before selecting and testing a reporter.
3. **Move toward a soil-derived sample.** Test performance beyond clean buffer and characterise
   how stable the ascaroside signal is in soil.
4. **Ground the design in real needs.** Seek consented, attributable engagement with growers,
   agronomists, and regulators, then document whether it changes a design decision.

<Callout type="note" title="Where this stands today">
None of the four goals is closed. The evidence our records currently support, and the gates
that remain open, are set out cycle by cycle on the [Engineering](page:engineering-cycle) page.
</Callout>
