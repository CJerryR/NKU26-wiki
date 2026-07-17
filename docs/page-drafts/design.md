---
source: _content/design.html
slug: design
title: Design
hidden: true
crumbs: Project / Design
eyebrow: Project / The build
heading: Designing a sensing concept
sub: From validation questions to a candidate biological circuit - with every unresolved link made explicit.
meta: Discipline=Synthetic biology | Reading=9 min | Status=Working draft
---

# Design

01 - Brief

## What the concept would need to demonstrate

The problem defines validation questions rather than established requirements. A future system would need to distinguish a relevant chemical input from soil background, respond within a decision-relevant window, and produce an interpretable output. The target organisms' usable signal, sampling context, and every downstream module remain unproven.

### Discriminating

Respond to a nematode-associated ascaroside signal against a noisy soil background while measuring cross-species interference.

### Sensitive

Establish whether a biologically relevant signal range exists before defining any response target.

### Field-oriented

Ultimately function from a soil-derived sample without laboratory infrastructure; this remains an untested target.

The ascaroside **ascr#18** is a provisional candidate analyte drawn from internal literature leads involving *Meloidogyne* entries and *H. glycines*. A usable signal is **not yet established**: those leads do not establish production by either exact target under the proposed sampling conditions, and the internal concentration and timing entries require primary-source tracing before they can define a public design target.

**An open taxonomic question**

The team has not tested ascr#18 coverage across *Meloidogyne* spp., *H. glycines*, *M. incognita*, or other *nematode taxa*; cross-reactivity and environmental background are also unknown. Internal notes do not establish a marker for either target or any taxonomic group. A response to ascr#18 alone could not be interpreted as species identification without independent evidence.

**What this page is**

This is a design and its planned validation. The final receptor and reporter are not confirmed, and no wet-lab results are presented here - which is why the page is a working draft.

02 - Architecture

## How the circuit is put together

The proposed design is modular: a recognition module would test candidate-analyte response; a coupling module would attempt to route receptor activity through the yeast mating pathway; and a reporter module would translate a validated pathway response into a readout. Heterologous-GPCR work in yeast provides platform precedent, including a Gpa1–Gα chimera strategy described in a 2019 review [7], but it does not establish any module in this project.

**Fig 1** Candidate architecture (design hypothesis). The receptor's response to ascr#18 is unproven, pathway coupling has not been demonstrated, and the reporter is not yet chosen.

03 - Recognition

## Defining what the signal can distinguish

This is the hardest and least-settled part of the design, so we separate what is *known from the literature* from what is *hypothesis* and what is *still to be tested*.

**Literature evidence - the molecule class.** Ascarosides are nematode signalling glycolipids built from the sugar ascarylose and a fatty-acid-derived side chain; their biosynthesis runs through peroxisomal β-oxidation, and iterative two-carbon shortening generates side-chain diversity (Choe *et al.*, 2012 [1]; Yang *et al.*, 2023 [2]). Production and release can depend on developmental stage, diet, population density, temperature, and stress. Internal table entries that describe the composition of *Meloidogyne* ascaroside profiles are **not treated as established evidence** because their primary sources remain untraced.

**Literature evidence - the receptors that exist.** Known ascaroside receptors come from *C. elegans*: DAF-37/DAF-38 for ascr#2 and SRG-36/SRG-37 for ascr#5 (Park *et al.*, 2012 [5]). More promising for a fungal chassis, Kuo *et al.* (2024) showed that the nematode-trapping fungus *Arthrobotrys oligospora* uses **Gpr2 and Gpr3** to detect ascr#3 and ascr#7 through a Gpa2/cAMP-PKA pathway [6]. Because they are fungal and homologous to yeast glucose receptors, Gpr2/Gpr3 are attractive heterologous candidates.

**The central open question**

Gpr2 and Gpr3 are reported to participate in responses involving ascr#3 and ascr#7 - *not* ascr#18. There is no direct evidence in our sources that Gpr2/Gpr3 bind or respond strongly to ascr#18. They are therefore **candidates that require a direct ascr#18 response assay**, not validated ascr#18 receptors. A negative result would require the recognition strategy to change.

### Targeting *H. glycines*

An internal literature lead associates ascr#18 with *H. glycines*, but no traceable primary source is supplied. Its profile also cannot be inferred from *Meloidogyne* notes. Source tracing, sampling relevance, and direct testing are required before the candidate signal can be applied to *H. glycines*.

### Targeting *M. incognita*

An internal table associates ascr#18 with *Meloidogyne* spp. and identifies the infective J2 as a candidate sampling stage. Those genus-level leads must be traced before they are applied specifically to *M. incognita*, and they do not establish coverage across *Meloidogyne* or *H. glycines*. **Design hypothesis (not validated):** informed by metabolic observations in Manohar *et al.* (2020) [3] and Yu *et al.* (2021) [4], internal notes propose exploring an ascr#18/ascr#3 ratio and ascr#9 as additional context. No false-positive or false-negative control capability has been demonstrated.

| Candidate receptor | Demonstrated ligand (evidence) | Why considered | Key uncertainty for ascr#18 | ** **
| Gpr2 / Gpr3 (A. oligospora) | ascr#3, ascr#7 (Kuo et al., 2024 [6]) | Fungal origin; homologous to yeast glucose receptors | No evidence of ascr#18 response - must be tested directly | ** **
| DAF-37 / DAF-38 (C. elegans) | ascr#2 (Park et al., 2012 [5]) | Well-characterised ascaroside receptor | Animal GPCR; different ligand; heterologous expression harder | ** **
| SRG-36 / SRG-37 (C. elegans) | ascr#5 (Park et al., 2012 [5]) | Ascaroside-specific; precedent for signalling | Different ligand; no ascr#18 data |

**Table 1** Candidate ascaroside receptors and the uncertainty each carries for our target signal. Every row shares the same gap: none is demonstrated to respond to ascr#18, so a direct response assay is the deciding experiment.

04 - Reporter

## Making the answer visible

The reporter is not selected, built, or measured. If a candidate receptor and pathway coupling are first demonstrated, future work could compare fluorescent, colourimetric, enzymatic, or growth-based outputs. Readability, background separation, containment, and interpretation are evaluation questions rather than fixed capabilities; no dynamic range or field-use threshold has been established.

**Design for the reader**

We are committing to a design principle: the readout should be interpretable by the grower who uses it, not only by a lab. How that principle survives contact with real end users is something we plan to test through Human Practices - it is a commitment here, not yet a documented finding.

05 - Iterations

## The iterations we plan to run

The current source inventory does not establish a completed or verified sensor build, so we present these design iterations as a plan rather than a history. Each phase is labelled *planned*; results will be documented against the Engineering cycle only when supporting records are available.

- Phase 1 · planned

#### Assess the candidate analyte

Trace primary sources, define the relevant organism and life-stage evidence, examine taxonomic range, and determine whether a soil-derived sampling context is biologically plausible.

- Phase 2 · planned

#### Test the receptor - the go/no-go step

Assay Gpr2/Gpr3 (and the *C. elegans* receptors as alternatives) for a direct ascr#18 response in yeast. This decides whether the recognition strategy holds.

- Phase 3 · planned

#### Couple and report

If direct receptor response is established, test pathway coupling and compare reporter candidates under controlled conditions.

- Phase 4 · planned

#### Examine the sample matrix

Characterise analyte persistence, representative sampling, matrix interference, and the exploratory multi-signal hypotheses involving ascr#18/ascr#3 and ascr#9.

| Risk / open question | Why it matters | Status |
| Receptor response to ascr#18 unproven | Gpr2/Gpr3 shown only for ascr#3/#7; the recognition module depends on this | To be tested (Phase 2) | ****
| Candidate-analyte coverage across Meloidogyne and H. glycines is untested | A response could not be assigned to either target species without independent evidence | Open; source tracing and direct testing required |
| Ascaroside soil stability | External plant and cross-species metabolism studies show that persistence cannot be assumed [3,4] | To be characterised (Phase 4) |
| Reported J2 concentrations and timing not yet traced | Sets the sensitivity target; currently team-table values only | To be verified (Phase 1) |
| Chassis uptake of ascarosides is not yet sourced precisely | Target loss could affect the measured response | Unverified; citation and assay required |

**Table 2** The risks we must validate. These are the reasons this design is presented as a hypothesis with a validation plan, and the reason the page stays hidden until the experiments are done.

06 - Sources

## References
1. Choe A *et al.* Ascaroside signaling is widely conserved among nematodes. *Current Biology* 22(9):772–780 (2012). [ doi:10.1016/j.cub.2012.03.024](https://doi.org/10.1016/j.cub.2012.03.024)
2. Yang B *et al.* Nematode pheromones: structures and functions. *Molecules* 28(5):2409 (2023). [ doi:10.3390/molecules28052409](https://doi.org/10.3390/molecules28052409)
3. Manohar M *et al.* Plant metabolism of nematode pheromones mediates plant-nematode interactions. *Nature Communications* 11:208 (2020). [ doi:10.1038/s41467-019-14104-2](https://doi.org/10.1038/s41467-019-14104-2)
4. Yu Y *et al.* Nematode signaling molecules are extensively metabolized by animals, plants, and microorganisms. *ACS Chemical Biology* 16(6):1050–1058 (2021). [ doi:10.1021/acschembio.1c00217](https://doi.org/10.1021/acschembio.1c00217)
5. Park D *et al.* Interaction of structure-specific and promiscuous G-protein-coupled receptors mediates small-molecule signaling in *Caenorhabditis elegans*. *PNAS* 109(25):9917–9922 (2012). [ doi:10.1073/pnas.1202216109](https://doi.org/10.1073/pnas.1202216109)
6. Kuo CY *et al.* The nematode-trapping fungus *Arthrobotrys oligospora* detects prey pheromones via G protein-coupled receptors. *Nature Microbiology* 9:1738–1751 (2024). [ doi:10.1038/s41564-024-01679-w](https://doi.org/10.1038/s41564-024-01679-w)
7. Engineering G protein-coupled receptor signalling in yeast for biotechnological and medical purposes. (2019). [ PMID 31825496](https://pubmed.ncbi.nlm.nih.gov/31825496/)
