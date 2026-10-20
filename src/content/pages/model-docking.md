---
title: Molecular docking
heading: Molecular docking
sub: ''
crumbs:
  - Model
  - Molecular docking
route: model-docking
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout model-manuscript" lang="en">

<span id="src-Model-Docking-1" aria-hidden="true"></span>

<span id="model-docking-section-0" class="legacy-section-anchor" aria-hidden="true"></span>

:::lead

Docking: screening receptor variants for ascaroside discrimination

:::

To build a sensor that distinguishes <strong>ascaroside #18 (ascr#18)</strong> from <strong>ascaroside #3 (ascr#3)</strong>, we sought receptor variants with different preferences for the two ligands. Molecular docking helped us identify starting points for receptor engineering: which residues contact each ligand, how side-chain substitutions affect docking scores and contacts, and which variants merit further study.

We began by establishing comparable docking conditions, then used contact differences in <strong>wild type (WT)</strong> receptors to select mutation sites. <strong>Alanine (Ala)</strong> substitutions, saturation scans, and combination tests guided successive rounds of design. Docking scores supported candidate comparisons, while contact analysis helped us develop structural explanations and plan the next round.

<span id="src-Model-Docking-5" aria-hidden="true"></span>

## Receptor selection and docking setup {#model-docking-section-1 toc="Receptor selection and docking setup"}

::::figuretext{side=right width=wide}

:::figure

[![Figure 1. Predicted full-length structure of Gpr2 WT](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-1-fa6200a22b.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-1-fa6200a22b.webp "Open full-resolution image")

Figure 1. Predicted full-length structure of Gpr2 WT. Overall structure of model_0 generated with AlphaFold 3 <sup>[3]</sup>.

:::

We initially examined three fungal <strong>G protein-coupled receptors (GPCRs)</strong> involved in ascaroside sensing: Gpr2 and Gpr3 <sup>[1]</sup>, and GprC <sup>[2]</sup>. We prepared predicted receptor structures and ligands, using published pocket locations, key residues, and docking methods as references. We also considered their use in yeast. GprC has been reported at both the plasma membrane and mitochondria in its native fungal host <sup>[2]</sup>. We considered this a potential complication for localization and pathway integration in yeast, so we focused subsequent engineering on Gpr2, continued to investigate Gpr3 and its variants, and retained GprC as a structural reference.

::::

Initial checks revealed two input problems. Inconsistent coordinate frames between receptor structures and docking boxes displaced the search region from the intended pocket. Loss of chemical information, including formal charges, during format conversion also affected the identification of charged contacts. These findings made input validation a routine part of the workflow.

We used structural superposition to place receptors, ligands, and docking boxes in a common coordinate frame, then checked the search region against membrane orientation and the receptor segments retained for docking. Atom mapping was used to check atom identities and coordinate correspondence between the original ligand <strong>structure-data format (SDF)</strong> files and the <strong>Protein Data Bank format with partial charges and atom types (PDBQT)</strong> files. When the required Meeko metadata were retained in the PDBQT output, we exported the docked poses to SDF while restoring the original bond orders and formal charges for contact analysis <sup>[4]</sup>.

Subsequent mutant comparisons used consistent ligand inputs and search settings. Original residue numbering was preserved so that docking scores could be traced to residue contacts. Published studies guided receptor selection and structural comparisons; input checks established consistent computational conditions; and docking with both ligands guided the design and screening of variants.

<span id="src-Model-Docking-14" aria-hidden="true"></span>

## Contact-based site selection and alanine scanning {#model-docking-section-2 toc="Contact-based site selection and alanine scanning"}

We selected initial mutation sites at two levels. First, we measured residue contact frequencies across predicted receptor models and their docked poses, identifying recurring contacts and comparing their occurrence between the two ligands. Second, we examined the poses in model_0 to identify contacts detected for only one ligand and classify their interaction types.

:::figure

[![Figure 2. Predicted docking poses and pocket environments of Gpr2 WT](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-2-7a7d9d242a.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-2-7a7d9d242a.webp "Open full-resolution image")

Figure 2. Predicted docking poses and pocket environments of Gpr2 WT. (a, b) ascr#3; (c, d) ascr#18. Each pair shows a 3D pocket view and the corresponding Maestro 2D interaction diagram <sup>[6]</sup> for the lowest-scoring pose. In the 3D views, the receptor is shown as a purple cartoon, pocket residues as yellow sticks, and ascr#3 and ascr#18 in cyan and magenta, respectively. Original residue numbering is retained.

:::

These analyses provided complementary information. Contact frequencies showed how often a residue contacted a ligand within the sampled conformations, while individual poses helped locate differences and identify side chains to test.

::::figuretext{side=right width=wide}

:::figure

[![Figure 3. Initial mutation sites in Gpr2](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-3-9b303eb053.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-3-9b303eb053.webp "Open full-resolution image")

Figure 3. Initial mutation sites in Gpr2. N84, L90, V110, R181, W338, R345, and V368 are highlighted on the predicted full-length structure.

:::

We then replaced candidate residues with Ala to examine how simplifying each side chain changed the scores and contacts for both ligands. The initial sites were N84, L90, V110, R181, W338, R345, and V368. For each substitution, we generated a mutant sequence, predicted its structure with AlphaFold 3 <sup>[3]</sup>, and carried out structure preparation, docking, and contact comparisons with WT.

::::

Using the structures and WT reference from this initial round, N84A, V110A, and V368A all produced lower scores for ascr#3 and higher scores for ascr#18. We therefore prioritized N84, V110, and V368 for further side-chain comparisons. Score and contact changes at W338 and R181 also warranted further investigation. These results turned the initial contact observations into specific substitutions to test.

<span id="src-Model-Docking-29" aria-hidden="true"></span>

## Saturation scanning at four sites {#model-docking-section-3 toc="Saturation scanning at four sites"}

The Ala scan narrowed the search and raised a further question: could different side chains at the same position shift the scores in different directions?

Based on the Ala scan, contact analysis, and additional side-chain substitutions, we selected N84, V110, V368, and W338 for saturation scanning. Testing all 19 alternatives at each site produced 76 single-mutant designs, allowing us to compare how side-chain identity affected scores and contact patterns for the two ligands.

Different substitutions at the same position produced distinct score shifts. For example, N84V lowered the score for ascr#18 and raised it for ascr#3, whereas N84Y showed the opposite pattern. Contact differences helped identify promising positions, but the results for both ligands were needed to select individual variants.

<span id="src-Model-Docking-34" aria-hidden="true"></span>

## Comparing score changes for both ligands {#model-docking-section-4 toc="Comparing score changes for both ligands"}

We described each variant’s shift using the difference between its WT-relative score changes for the two ligands. Let (G) denote the AutoDock Vina docking score <sup>[5]</sup>:

<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub><mo>=</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow><mo separator="true">,</mo><mn>18</mn></mrow></msub><mo>−</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">W</mi><mi mathvariant="normal">T</mi></mrow><mo separator="true">,</mo><mn>18</mn></mrow></msub></mrow><annotation encoding="application/x-tex">\Delta G\_{18}=G\_{\mathrm{mut},18}-G\_{\mathrm{WT},18}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">mut</span></span><span class="mpunct mtight">,</span><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">WT</span></span><span class="mpunct mtight">,</span><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span>

<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub><mo>=</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow><mo separator="true">,</mo><mn>3</mn></mrow></msub><mo>−</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">W</mi><mi mathvariant="normal">T</mi></mrow><mo separator="true">,</mo><mn>3</mn></mrow></msub></mrow><annotation encoding="application/x-tex">\Delta G\_{3}=G\_{\mathrm{mut},3}-G\_{\mathrm{WT},3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">mut</span></span><span class="mpunct mtight">,</span><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">WT</span></span><span class="mpunct mtight">,</span><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span>

We then calculated:

<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>G</mi><mo>=</mo><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub><mo>−</mo><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex">\Delta\Delta G=\Delta G\_{18}-\Delta G\_{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.6833em;"></span><span class="mord">ΔΔ</span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>

A negative (\Delta G) indicates a lower score than WT for that ligand. Under this definition, a positive (\Delta\Delta G) indicates a shift toward ascr#3 relative to WT, whereas a negative value indicates a shift toward ascr#18. These quantities describe docking-score changes rather than thermodynamic binding free-energy changes. Binding affinity and selectivity require experimental evaluation.

We also examined the two score changes separately. A lower score for the target ligand, a higher score for the other ligand, or both could produce a shift in the same direction, but would imply different candidate profiles.

After saturation scanning, we prioritized N84V, V110C, V110M, and V368R for detailed contact analysis. All four were compared with the same WT reference, whose scores were −6.492 kcal/mol for ascr#18 and −6.625 kcal/mol for ascr#3.

**Table 1. Docking scores and WT-relative changes for four prioritized Gpr2 variants.**

<div class="model-table-scroll" tabindex="0"><table class="model-source-table"><thead><tr><th scope="col">Variant</th><th scope="col"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>G</mi><mn>18</mn></msub></mrow><annotation encoding="application/x-tex">G_{18}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></th><th scope="col"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>G</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex">G_{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></th><th scope="col"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub></mrow><annotation encoding="application/x-tex">\Delta G_{18}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></th><th scope="col"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex">\Delta G_{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></th><th scope="col"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>G</mi></mrow><annotation encoding="application/x-tex">\Delta\Delta G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.6833em;"></span><span class="mord">ΔΔ</span><span class="mord mathnormal">G</span></span></span></span></th></tr></thead><tbody><tr><td>N84V</td><td>−6.856</td><td>−6.264</td><td>−0.364</td><td>0.361</td><td>−0.725</td></tr><tr><td>V110C</td><td>−7.053</td><td>−6.719</td><td>−0.561</td><td>−0.094</td><td>−0.467</td></tr><tr><td>V110M</td><td>−6.066</td><td>−6.629</td><td>0.426</td><td>−0.004</td><td>0.43</td></tr><tr><td>V368R</td><td>−6.293</td><td>−7.013</td><td>0.199</td><td>−0.388</td><td>0.587</td></tr></tbody></table></div>

All values are in kcal/mol. Negative changes indicate lower scores than WT.

N84V and V110C both shifted toward ascr#18, but for different reasons. V110C lowered the scores for both ligands, with a larger decrease for ascr#18. N84V lowered the score for ascr#18 while raising it for ascr#3. V110C therefore produced the greater improvement in the ascr#18 score, whereas N84V produced the larger WT-relative score shift between the ligands.

V110M and V368R both shifted toward ascr#3. For V110M, the ascr#3 score remained close to WT, so the shift was driven mainly by a higher ascr#18 score. V368R combined a lower ascr#3 score with a higher ascr#18 score. Examining the components separately helped us choose candidates for ligand discrimination and design combinations.

<span id="src-Model-Docking-48" aria-hidden="true"></span>

## Testing mutation combinations {#model-docking-section-5 toc="Testing mutation combinations"}

The single-mutant results led us to test whether substitutions with similar score shifts could be combined. Could a combination increase the difference between the ligands? Could a substitution that lowered one ligand’s score retain its effect alongside another that raised the other ligand’s score?

We designed combinations based on the direction and components of each score shift, then compared them with WT and both single-mutant parents. Comparisons with WT showed whether the original direction was retained; comparisons with the parents showed whether the combination offered an additional improvement.

The N84V/V110C double mutant illustrates this approach. Both single mutants shifted toward ascr#18, so we aimed to combine the larger score separation of N84V with the greater improvement in the ascr#18 score of V110C. The double mutant instead yielded (\Delta G\_{18}=-0.081) kcal/mol and (\Delta G\_{3}=-0.411) kcal/mol, giving (\Delta\Delta G=+0.330) kcal/mol. The ascr#3 score decreased more, reversing the direction observed in the single mutants.

Contact analysis showed that the ascr#18 pose retained an ionic contact with R189 and a hydrophobic contact with W338. Nevertheless, its score was 0.480 kcal/mol higher than that of V110C. Retaining these contacts was therefore insufficient to explain the overall score: the complete pose and surrounding contact network also needed to be considered.

Most tested combinations failed to improve the target-ligand score of the better parent or increase the score separation between the ligands. We therefore continued to focus on single mutants and evaluated combinations against WT, their individual parents, and the full contact network.

<span id="src-Model-Docking-55" aria-hidden="true"></span>

## Selecting N84V and V368R for molecular dynamics {#model-docking-section-6 toc="Selecting N84V and V368R for molecular dynamics"}

Based on score separation and contact analysis, we selected N84V and V368R from the four prioritized variants for <strong>molecular dynamics (MD)</strong> simulations. Each lowered the score for one ligand and raised it for the other, with opposite directions of preference in the docking results. They provided two contrasting candidates for studying the structural behavior of ascr#18 and ascr#3.

N84V highlighted the importance of the surrounding residue network. In the selected poses, residue 84 itself made no detected direct contact with either ligand. Compared with the WT reference from the same batch, the ascr#18 pose gained ionic and hydrogen-bond contacts involving R189, together with a hydrophobic contact involving W338. We therefore focused on changes in ligand position and neighboring contacts, and asked whether these contacts would persist during MD and help maintain the ligand’s position.

:::figure

[![Figure 4. Predicted docking poses and pocket environments of Gpr2 N84V](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-4-0e18ad3b0f.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-4-0e18ad3b0f.webp "Open full-resolution image")

Figure 4. Predicted docking poses and pocket environments of Gpr2 N84V. (a, b) ascr#3; (c, d) ascr#18. Each pair shows a 3D pocket view and the corresponding Maestro 2D interaction diagram for the lowest-scoring pose. Colors follow Figure 2, and residue numbering matches WT.

:::

V368R raised a different question. Although the substitution introduced an <strong>arginine (Arg)</strong>, R368 showed a close contact only with ascr#18 in the selected poses, and no ionic contact involving R368 was detected. Both ligands gained ionic and hydrogen-bond contacts involving K364. Interpreting V368R therefore required examining the local structure and contact network around the mutation, together with the scores for both ligands.

:::figure

[![Figure 5. Predicted docking poses and pocket environments of Gpr2 V368R](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-5-1e38205eaf.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-5-1e38205eaf.webp "Open full-resolution image")

Figure 5. Predicted docking poses and pocket environments of Gpr2 V368R. (a, b) ascr#3; (c, d) ascr#18. Each pair shows a 3D pocket view and the corresponding Maestro 2D interaction diagram for the lowest-scoring pose. Colors follow Figure 2, and residue numbering matches WT.

:::

Docking thus led to questions about dynamics: would the ligands retain their initial positions in full-length receptors embedded in a membrane, and which contacts would persist or rearrange? We paired WT, N84V, and V368R with each ligand to form six systems for MD comparison. These simulations would test the structural hypotheses and refine our interpretation of the variants.

<span id="src-Model-Docking-73" aria-hidden="true"></span>

## Mapping contact sites across receptors {#model-docking-section-7 toc="Mapping contact sites across receptors"}

We extended the analysis to Gpr3, GprC, and the <strong><em>Caenorhabditis elegans</em> (<em>Ce</em>)</strong> receptors DAF-37 and SRBC-64 to identify corresponding contact positions for parallel testing. Hu et al.’s comparison of predicted ascaroside pockets across receptors provided a reference for this analysis <sup>[2]</sup>.

For each receptor, we used five predicted models and compared contact frequencies for ascr#18 and ascr#3 within each model. Sequence alignment and structural mapping were then used to examine residue correspondence. We also recorded whether each residue was retained in the actual docking construct, linking contact analysis and positional mapping to the structures used.

::::figuretext{side=right width=wide}

:::figure

[![Figure 6. Predicted ascaroside-binding pockets in GprC, SRBC-64, and DAF-37](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bbf52d6e8540-docking-source-15.avif)](https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bbf52d6e8540-docking-source-15.avif "Open full-resolution image")

Figure 6. Predicted ascaroside-binding pockets in GprC, SRBC-64, and DAF-37. Each receptor shows five docking poses for each of five ascarosides. Cropped from Hu et al. (2024), Figure 5a–c <sup>[2]</sup>, under the [Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/).

:::

Three <strong>transmembrane helix 6 (TM6)</strong> <strong>tryptophan residues (Trp)</strong>—Gpr2 W338, Gpr3 W306, and GprC W388—showed contact differences favoring ascr#18 and corresponding positions supported by both sequence and structural comparisons. These residues became candidates for parallel substitutions across the fungal receptors, allowing future tests of whether they play similar roles.

::::

This extension applied the site-selection approach across receptors. Contact differences identified candidate residues, sequence and structural correspondence supported positional comparisons, and construct records linked the results to the structures analyzed. Raw scores, pose-level contact tables, model identifiers, WT references, and structure-processing records provide a basis for reviewing the analysis and adapting the approach to other receptor–ligand systems.

<span id="src-Model-Docking-81" aria-hidden="true"></span>

## References {#model-docking-section-8 toc="References"}

\[1] Kuo, C.-Y., Tay, R. J., Lin, H.-C., et al. (2024). The nematode-trapping fungus *Arthrobotrys oligospora* detects prey pheromones via G protein-coupled receptors. *Nature Microbiology*, 9, 1738–1751. <https://doi.org/10.1038/s41564-024-01679-w>

\[2] Hu, X., Hoffmann, D. S., Wang, M., et al. (2024). GprC of the nematode-trapping fungus *Arthrobotrys flagrans* activates mitochondria and reprograms fungal cells for nematode hunting. *Nature Microbiology*, 9, 1752–1763. <https://doi.org/10.1038/s41564-024-01731-9>

\[3] Abramson, J., et al. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature*, 630, 493–500. <https://doi.org/10.1038/s41586-024-07487-w>

\[4] AutoDock Vina developers. *AutoDock Vina documentation: Basic docking*, Section 4.c, “Exporting results to SDF.” <https://autodock-vina.readthedocs.io/en/latest/docking_basic.html>. Accessed 20 October 2026.

\[5] Trott, O., & Olson, A. J. (2010). AutoDock Vina: Improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading. *Journal of Computational Chemistry*, 31, 455–461. <https://doi.org/10.1002/jcc.21334>

\[6] Schrödinger. *Maestro*. <https://www.schrodinger.com/platform/products/maestro/>. Accessed 20 October 2026.

</div>
