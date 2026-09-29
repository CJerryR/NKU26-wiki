---
title: Notebook
heading: "The *casebook*"
sub: "A faithful audit of every documented notebook record — what each one shows, and where the evidence stops."
crumbs: [Wet Lab, Notebook]
route: notebook
meta:
  Records: "18 documented"
  Format: Chronological audit
---

## About this record {#how toc="How to read this"}

Below is an audit of eighteen dated laboratory records, from the 0506 record through the 0607 record. Each entry states what the record documents and its result status — including the dead ends. Read together, the sequence supports real DNA and plasmid work, knockout-cassette PCR, several yeast-transformation attempts, one explicit negative selective-medium result, failed or inconclusive verification attempts, and a single preliminary positive PCR conclusion. It does not establish sequence-confirmed genome editing or any working sensing function.

:::note[Evidence key]

Three cautions apply throughout. A record label — for example “0506” — identifies a document, not a proven execution date. Handwritten records (0601 onward) carry extra uncertainty because their text is image-only and some details are ambiguous. And a documented workflow is not automatically a validated outcome: “the record documents” and “the workflow called for” are not the same as an independently verified result.

:::

## Every record, in order {#chronology toc="Record chronology"}

:::timeline

#### Bacterial transformation set up {when="0506"}

YPD prepared; five plasmids (four described as ampicillin-resistant, one kanamycin-resistant) transformed into Trans5α competent *E. coli* by heat shock and plated on matching resistance plates. Not all five plasmids are named. **Status:** no colony counts, identity checks, or success recorded; antibiotic units flagged and withheld.

#### Overnight culture and colony picking {when="0507"}

A single Trans5α colony grown overnight in selective LB; two colony-picking methods and flask labelling documented. **Status:** establishes a culture, not clone identity.

#### Plasmid miniprep {when="0508"}

Alkaline-lysis extraction (K1/K2/K3, ZBL column, W2 washes, warmed-TE elution) with a planned NanoDrop reading, a gel sample, and −20 °C storage. **Status:** no NanoDrop value, purity ratio, gel result, or plasmid identity.

#### Yeast genomic-DNA extraction {when="0511"}

*S. cerevisiae* genomic DNA prepared by LETS-buffer bead disruption, organic extraction, ethanol precipitation, and TE/EB dissolution, then run on a gel. **Status:** no concentration, gel interpretation, or downstream PCR result.

#### First-round knockout-cassette PCR {when="0513"}

Six KOGal fragments set up: Gal4 and Gal80 upstream/downstream homology arms, Ura3 for KOGal4, and Trp1 for KOGal80, using CEN.PK2-1C genomic DNA, p406TEF1, and pRS314 as templates. **Status:** no program, expected size, gel, or yield.

#### Overlap and nested PCR, recovery {when="0514"}

KOGal80 first-round products gel-purified; second-round overlap and third-round nested recipes for KOGal4/KOGal80 recorded, ending in separation and recovery gels and cold storage. **Status:** no expected sizes, concentrations, gel image, or correctness call.

#### First yeast transformation attempt {when="0520"}

SDCt medium prepared; CEN.PK2-1C transformation attempted with KOGal4 plus KOGal80 material and “solution 3”, then plated on SDCt with His and Leu. **Status:** no colony count, plate observation, colony PCR, or edit validation.

#### Grouped transformation conditions {when="0525"}

Blank, ΔGal4, and ΔGal80 conditions recorded with distinct dropout media (blank: His/Trp/Ura/Leu; ΔGal4 omits Ura; ΔGal80 omits Trp). **Status:** no plate observation, colony count, or validation.

#### Media prep and repeat KOGal4 transformation {when="0526"}

Five SDCt media prepared (casamino acids noted as strongly hygroscopic; tryptophan material protected from light/UV) and another KOGal4 transformation attempted. **Status:** no growth or verification result.

#### Repeat PCR, gel excision, streaking {when="0527"}

Autoclave and clean-bench work; YPD plates; CEN.PK2-1C streaked on YPD; repeat third-round KOGal4/KOGal80 PCR with an embedded gel (lanes labelled Marker, Gal4-1, Gal4-2, Gal80-1, Gal80-2) and band excision under brief UV. **Status:** no expected sizes or written pass/fail; fragment identity not established.

#### Negative selective-medium result, with control {#m-0528 toc="0528 — negative result" when="0528"}

An explicit result page: **no yeast grew** on the double-auxotrophy medium lacking Trp and Ura, while competent yeast **did grow** on YPD as a positive control. **Status:** a negative selective-medium outcome with a working growth control — not successful double transformation.

#### Further transformation rounds {when="0529"}

Two more rounds with Blank, ΔGal4, ΔGal80, and a combined double-deletion group; the morning medium was fragile, and the afternoon medium followed a method obtained after contacting a paper’s source. **Status:** no colony observation, efficiency, or edit validation.

#### Repeat PCR and extraction checks {when="0530"}

KOGal4/KOGal80 PCR and extraction checks repeated with gel images and lane maps, plus a warning not to confuse 100 bp and 1 kb markers. **Status:** no expected sizes or pass/fail; the images alone do not prove construct identity.

#### Handwritten: ΔGal80 streak and GPR2-GFP start {when="0601"}

Image-only record: putative CEN.PK2-1C ΔGal80 candidate material streaked on SC without Trp, and GPR2-GFP homologous-recombination fragment construction begun by double-joint PCR. **Status:** handwriting partly ambiguous; apparent position counts and growth marks are not treated as data.

#### Handwritten: failed / inconclusive verification {#m-0603 toc="0603 — verification fails" when="0603"}

ΔGal80 transformant verification (RT and 5′/3′ checks, controls, FastTaq, gel). The RT positive control passed, but the remaining RT, 5′, and 3′ reactions produced no result; the author suspected genomic DNA had not been released from the cells. **Status:** failed or inconclusive verification.

#### Handwritten: verification continued {when="0604"}

Thirty-two colonies gave no bands, while the positive control showed a band and the negative control did not; the plan was to grow a subset, extract genomic DNA, and repeat PCR. The page also records additional PCR/amplification work or attempts. **Status:** transformants remained unverified.

#### Handwritten: GPR2-GFP stage and ΔGal80 gDNA {when="0606"}

Another GPR2-GFP double-joint-PCR stage and a genomic-DNA extraction from a 5 mL putative ΔGal80 candidate culture. **Status:** no gel interpretation, concentration, sequence result, or verified GPR2-GFP construct.

#### Handwritten: preliminary positive ΔGal80 PCR {#m-0607 toc="0607 — preliminary positive" when="0607"}

RT and 5′/3′ checks on eight ΔGal80 candidates; the author concluded all eight were correct (noted RT negative, 5′/3′ positive). This is the first explicit positive edit-verification statement in the audited sequence — but a preliminary one: no gel photograph, band sizes, sequencing, or replicate is supplied. The same page records further GPR2-GFP double-joint PCR and a planned validation-lane layout, with no GPR2-GFP result. **Status:** preliminary PCR conclusion only.

:::

## What the sequence does and does not show {#arc toc="Reading the arc"}

Read end to end, the records move through preparation and cassette PCR, into repeated yeast-transformation attempts, to an explicit negative selective-medium result on 0528 (with a YPD growth control), through further attempts, into the failed or inconclusive verification of 0603 and 0604, and finally to the preliminary positive ΔGal80 PCR conclusion on 0607. In parallel, GPR2-GFP fragment construction is attempted repeatedly but is never reported as a finished, verified construct.

What this does *not* amount to is equally important. No record describes exposure to any ascaroside, a receptor recognition event, a reporter measurement, or an end-to-end test. The strongest supplied claim is the preliminary 0607 PCR conclusion for ΔGal80 — not a sequence-confirmed edit, and not a working sensor.

:::warning[Boundary of the evidence]

Documented DNA and plasmid workflows, cassette PCR, transformation attempts, one negative selective-medium result, inconclusive checks, and a preliminary positive ΔGal80 PCR conclusion — that is the full extent of what these records support. They do not demonstrate sequence-confirmed editing, GPR2/GPR3 expression, receptor response, reporter output, or any integrated detection.

:::
