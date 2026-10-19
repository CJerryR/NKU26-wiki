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
<div class="reading-layout" lang="en">

<section class="author-manuscript" lang="en">

## Docking | from differential ligand contacts to receptor-engineering hypotheses {#src-Model-Docking-1 toc="Docking | from differential ligand contacts to receptor-engineering hypotheses" unnumbered}

:::lead

<p> To build a sensing system that distinguishes <strong>ascaroside #18 (ascr#18)</strong> from <strong>ascaroside #3 (ascr#3)</strong>, we sought receptor candidates biased toward each ligand. Molecular docking helped us identify engineering clues in predicted structures: which residues contact each ligand, how scores and contacts change after side-chain substitutions, and which candidates warrant further study. </p>

:::

<p> We progressively established comparison conditions, proposed sites from <strong>wild type (WT)</strong> contact differences, and refined designs through <strong>alanine (Ala)</strong> substitutions, side-chain scanning, and combination tests. Scores compared candidate behavior across the two ligands, while contact analysis supported structural interpretations. Each round informed the next design. </p>

## Establishing a common structural and docking basis for dual-ligand comparisons {#src-Model-Docking-5 toc="Establishing a common structural and docking basis for dual-ligand comparisons"}

<p> We initially included the fungal <strong>G protein-coupled receptors (GPCRs)</strong> Gpr2, Gpr3 [1], and GprC [2], which participate in ascaroside sensing. We prepared predicted structures and ligands and explored pocket locations, key residues, and docking methods reported in the literature. Receptor selection also considered their use in yeast. Because the reported plasma-membrane and mitochondria-associated localization of GprC [2] could complicate heterologous localization and pathway integration, subsequent engineering focused on Gpr2, retained studies of Gpr3 and its mutants, and used GprC as a structural reference. </p>

<p> Inspection of preliminary docking revealed two types of input problems. Inconsistent coordinate references for structures and search boxes displaced the actual search region from its intended location. Loss of chemical information, such as formal charges, during format conversion affected the identification of charged contacts. These findings made input verification part of our analytical workflow. </p>

<p> We unified coordinate references for receptors, ligands, and search boxes through structural alignment, then checked search regions against membrane orientation and the segments actually retained. Atom mapping verified correspondence between the original <strong>structure-data format (SDF)</strong> and docking <strong>Protein Data Bank format with partial charges and atom types (PDBQT)</strong> files in atoms, coordinates, and structure. Where PDBQT files fully retained Meeko structural metadata, we recovered SDF files containing docked poses and formal charges for contact analysis. [4] </p>

<p> Subsequent mutant comparisons used consistent ligand inputs and search settings and retained original residue numbering so that scores and residue contacts could be traced together. Literature informed the research context and structural references; input checks verified computational conditions; and dual-ligand docking results supported the proposal and screening of engineering hypotheses. </p>

:::figure

<p><a href="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-1-fa6200a22b.webp" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-1-fa6200a22b.webp" alt=" Figure 1 | Predicted full-length structure of Gpr2 WT. " loading="lazy" width="1136" height="1639"></a></p>

<strong> Figure 1 | Predicted full-length structure of Gpr2 WT. </strong> Overall structure of the AlphaFold 3 prediction model_0. [3]

:::

## Combining contact frequencies and individual poses to propose initial engineering sites {#src-Model-Docking-14 toc="Combining contact frequencies and individual poses to propose initial engineering sites"}

<p> Initial site selection combined two observational scales. First, we counted residue contact frequencies across receptor prediction models and their docked poses, focusing on recurrent ligand-contacting positions and comparing their occurrence for the two ligands. Second, we examined specific contact differences in model_0, focusing on contacts detected for only one ligand in the analyzed poses and their interaction types. </p>

:::figure

<p><a href="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-2-7a7d9d242a.webp" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-2-7a7d9d242a.webp" alt="Figure 2 | Predicted docking poses and pocket environments of Gpr2 WT with the two ascarosides." loading="lazy" width="8378" height="2151"></a></p>

<strong>Figure 2 | Predicted docking poses and pocket environments of Gpr2 WT with the two ascarosides.</strong> (a, b) Three-dimensional pocket view and corresponding Maestro two-dimensional interaction diagram for WT–ascr#3; (c, d) three-dimensional pocket view and corresponding two-dimensional interaction diagram for WT–ascr#18. The receptor is shown as a purple cartoon, pocket residues as yellow sticks, and ascr#3 and ascr#18 in cyan and magenta, respectively. Each group shows the lowest-scoring docking pose. Residues retain their original sequence numbering.

:::

<p> These two types of information are complementary. Statistics across models and poses describe contact occurrence in the analyzed conformational ensemble; individual pose comparisons locate differences and suggest questions that side-chain substitutions can test. </p>

<p> We therefore introduced Ala substitutions at candidate positions to examine how simplifying side chains affected scores and contacts for both ligands. The first round covered N84, L90, V110, R181, R345, W338, and V368. We generated mutant sequences, predicted structures with AlphaFold 3 [3], and performed structural preparation, docking, and contact comparisons with WT. </p>

:::figure

<p><a href="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-3-9b303eb053.webp" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-3-9b303eb053.webp" alt=" Figure 3 | Spatial distribution of initial Gpr2 engineering sites. " loading="lazy" width="2079" height="2079"></a></p>

<strong> Figure 3 | Spatial distribution of initial Gpr2 engineering sites. </strong> N84, L90, V110, R181, W338, R345, and V368 are marked on the predicted full-length structure.

:::

<p> In the first round, N84A, V110A, and V368A all showed lower ascr#3 scores and higher ascr#18 scores under the structures and WT references used at that stage. N84, V110, and V368 therefore became core sites for further side-chain comparisons; score and contact changes at W338 and R181 also warranted exploration. Docking thus converted initial contact clues into testable substitutions for the next round. </p>

## Expanding from selected substitutions to saturation scanning {#src-Model-Docking-29 toc="Expanding from selected substitutions to saturation scanning"}

<p> Ala scanning narrowed our scope while raising a new question: could different side chains at the same position shift dual-ligand behavior in different directions? </p>

<p> Combining earlier Ala-scan scores, contact analyses, and additional side-chain substitutions, we selected N84, V110, V368, and W338 for saturation scanning. Nineteen substitutions at each of four sites produced seventy-six single-mutant designs to systematically compare side-chain effects on dual-ligand scores and contact distributions. </p>

<p> Saturation scanning showed that substitutions at the same position could produce different score shifts. For example, N84V lowered the ascr#18 score and raised the ascr#3 score, whereas N84Y showed the opposite direction. Contact differences identified positions worth exploring, but specific candidates required dual-ligand evaluation after side-chain substitution. </p>

## Examining both scores separately to identify the source of candidate shifts {#src-Model-Docking-34 toc="Examining both scores separately to identify the source of candidate shifts"}

<p> We described the direction of a candidate shift using the difference between the two ligands' score changes relative to WT. Let (G) denote the AutoDock Vina docking score [5], and define: </p>

<p><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub><mo>=</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow><mo separator="true">,</mo><mn>18</mn></mrow></msub><mo>−</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">W</mi><mi mathvariant="normal">T</mi></mrow><mo separator="true">,</mo><mn>18</mn></mrow></msub></mrow><annotation encoding="application/x-tex"> \Delta G_{18} = G_{\mathrm{mut},18}-G_{\mathrm{WT},18} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">mut</span></span><span class="mpunct mtight">,</span><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">WT</span></span><span class="mpunct mtight">,</span><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub><mo>=</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow><mo separator="true">,</mo><mn>3</mn></mrow></msub><mo>−</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">W</mi><mi mathvariant="normal">T</mi></mrow><mo separator="true">,</mo><mn>3</mn></mrow></msub></mrow><annotation encoding="application/x-tex"> \Delta G_{3} = G_{\mathrm{mut},3}-G_{\mathrm{WT},3} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">mut</span></span><span class="mpunct mtight">,</span><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">WT</span></span><span class="mpunct mtight">,</span><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span></p>

<p> Then calculate: </p>

<p><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>G</mi><mo>=</mo><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub><mo>−</mo><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex"> \Delta\Delta G = \Delta G_{18}-\Delta G_{3} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.6833em;"></span><span class="mord">ΔΔ</span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></p>

:::note[Interpreting docking scores]

<p> A negative <math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="ΔG"><mrow><mi>Δ</mi><mi>G</mi></mrow></math> indicates a lower score than WT for that ligand. Under this definition, a positive <math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="ΔΔG"><mrow><mi>ΔΔ</mi><mi>G</mi></mrow></math> indicates a shift toward ascr#3 relative to WT, whereas a negative value indicates a shift toward ascr#18. This metric describes docking-score differences for candidate comparison; actual binding and selectivity require experimental evaluation. </p>

:::

<p> After identifying the shift direction, we examined each score separately. A lower target-ligand score, a higher score for the other ligand, or both can produce the same direction of <math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="ΔΔG"><mrow><mi>ΔΔ</mi><mi>G</mi></mrow></math>, but represent different candidate characteristics. </p>

<p> The first priority candidates for contact review after saturation scanning were N84V, V110C, V110M, and V368R. All four used the same WT batch as reference, with scores of −6.492 and −6.625 kcal/mol for ascr#18 and ascr#3, respectively. </p>

<p style="text-align:center;"><strong> Click the image to view the complete spreadsheet </strong></p>

<p> All scores and differences in the table are in kcal/mol; negative differences indicate lower scores. </p>

<p> N84V and V110C both shifted toward ascr#18, but for different reasons. V110C lowered both scores, with a larger decrease for ascr#18; N84V lowered the ascr#18 score while raising the ascr#3 score. Thus, V110C produced a larger ascr#18 score improvement, whereas N84V produced greater differentiation between the two ligand scores. </p>

<p> V110M and V368R both shifted toward ascr#3. The ascr#3 score of V110M remained close to WT, so its shift mainly reflected a higher ascr#18 score. V368R both lowered the ascr#3 score and raised the ascr#18 score. Separating these changes allowed us to select candidates according to our goal of dual-ligand differentiation and design combinations accordingly. </p>

## Testing whether single-site effects persist in combinations {#src-Model-Docking-48 toc="Testing whether single-site effects persist in combinations"}

<p> Single-site results prompted combination designs: could substitutions with the same shift direction enlarge score differences? Could substitutions that lower one ligand's score and raise the other's retain their respective effects in the same receptor? </p>

<p> We constructed combinations based on candidate shift directions and patterns of score change, comparing them with both WT and each single-mutant parent. WT comparisons tested whether the original direction persisted; parent comparisons tested whether combining mutations offered additional benefits. </p>

<p> The N84V–V110C combination illustrates this approach. Both single mutants shifted toward ascr#18, so we hoped to combine N84V's dual-ligand differentiation with V110C's ascr#18 score improvement. In fact, the combination had (\Delta G_{18}) = −0.081 and (\Delta G_{3}) = −0.411 kcal/mol, with (\Delta\Delta G) shifting to +0.330 kcal/mol: the ascr#3 score decreased more, and the original ascr#18 direction was not retained. </p>

<p> Contact review showed that the combination's ascr#18 pose retained an R189-associated ionic-type contact and a W338 hydrophobic contact, yet its score was 0.480 kcal/mol higher than that of V110C alone. Retention of some key contacts therefore needs interpretation alongside the complete pose and other contact changes; single-site score effects also require reassessment in combination calculations. </p>

<p> Most tested combinations did not further improve the better parent's target-ligand score or enlarge the dual-ligand difference. Subsequent work therefore continued to focus on single mutants, with combination evaluation explicitly comparing WT, each single-mutant parent, and the complete contact network. </p>

## Narrowing four priority candidates to two subjects for dynamic analysis {#src-Model-Docking-55 toc="Narrowing four priority candidates to two subjects for dynamic analysis"}

<p> Combining score differentiation and contact review, we selected N84V and V368R from the four priority candidates for subsequent <strong>molecular dynamics (MD)</strong> studies. Their opposite bidirectional score changes provided two representative candidates for comparing the structural behavior of ascr#18 and ascr#3. </p>

<p> N84V contact analysis particularly highlighted the need to inspect the surrounding residue network. In the selected docking poses, position 84 itself had no detected direct ligand contact; relative to the same WT batch, ascr#18 gained R189-associated ionic- and hydrogen-bond-type contacts and a W338 hydrophobic contact. These changes directed our interpretation toward concurrent changes in ligand position and surrounding contacts, raising further questions: can these contacts persist dynamically, and are they associated with ligand positioning? </p>

:::figure

<p><a href="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-4-0e18ad3b0f.webp" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-4-0e18ad3b0f.webp" alt="Figure 4 | Predicted docking poses and pocket environments of Gpr2 N84V with the two ascarosides." loading="lazy" width="7971" height="2151"></a></p>

<strong>Figure 4 | Predicted docking poses and pocket environments of Gpr2 N84V with the two ascarosides.</strong> (a, b) Three-dimensional pocket view and corresponding Maestro two-dimensional interaction diagram for N84V–ascr#3; (c, d) three-dimensional pocket view and corresponding two-dimensional interaction diagram for N84V–ascr#18. The receptor is shown as a purple cartoon, pocket residues as yellow sticks, and ascr#3 and ascr#18 in cyan and magenta, respectively. Each group shows the lowest-scoring docking pose. Residue numbering corresponds to WT.

:::

<p> V368R offered another case worth testing. Although the substitution introduced <strong>arginine (Arg)</strong>, R368 showed a close contact only with ascr#18 in the selected poses, with no ionic-type contact involving R368 itself. Both ligands gained K364-associated ionic- and hydrogen-bond-type contacts. Interpreting V368R therefore also requires examining the structure and contact network around the mutation and their relationship to dual-ligand scores. </p>

:::figure

<p><a href="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-5-1e38205eaf.webp" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/release-20261020/docking-figure-5-1e38205eaf.webp" alt="Figure 5 | Predicted docking poses and pocket environments of Gpr2 V368R with the two ascarosides." loading="lazy" width="7707" height="2125"></a></p>

<strong>Figure 5 | Predicted docking poses and pocket environments of Gpr2 V368R with the two ascarosides.</strong> (a, b) Three-dimensional pocket view and corresponding Maestro two-dimensional interaction diagram for V368R–ascr#3; (c, d) three-dimensional pocket view and corresponding two-dimensional interaction diagram for V368R–ascr#18. The receptor is shown as a purple cartoon, pocket residues as yellow sticks, and ascr#3 and ascr#18 in cyan and magenta, respectively. Each group shows the lowest-scoring docking pose. Residue numbering corresponds to WT.

:::

<p> Docking thus advanced candidate screening into dynamic questions: in a full-length receptor within a membrane environment, does the ligand retain its initial position, which contacts persist, and which rearrange? Pairing WT, N84V, and V368R with each ligand produced six systems for MD comparison. Subsequent dynamic analysis will test these structural clues and help refine our understanding of candidate behavior. </p>

## Extended analysis: identifying contact positions for parallel testing across receptors {#src-Model-Docking-73 toc="Extended analysis: identifying contact positions for parallel testing across receptors"}

<p> Beyond Gpr2 candidates, we compared Gpr3, GprC, and the <strong><em>Caenorhabditis elegans</em> (<em>Ce</em>)</strong> receptors DAF-37 and SRBC-64 to explore contact positions worth studying in parallel across functionally related receptors. Hu et al.'s comparison of ascaroside pockets using docking models of different receptors informed this analysis. [2] </p>

<p> For each receptor, five predicted models were used to compare ascr#18 and ascr#3 contact frequencies within each model. Sequence alignment and structural mapping then checked positional correspondence. We also recorded whether relevant residues were retained in the actual constructs, keeping contact analysis, positional correspondence, and the structures used consistent. </p>

<p> <strong>Transmembrane helix 6 (TM6)</strong> <strong>tryptophan residues (Trp)</strong> in the three fungal receptors—Gpr2 W338, Gpr3 W306, and GprC W388—showed contact differences biased toward ascr#18, supported by sequence and structural positional correspondence. These results identify sites for parallel cross-receptor substitution comparisons; substitutions at corresponding positions can subsequently test whether their roles are similar. </p>

:::figure

<p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bbf52d6e8540-docking-source-15.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bbf52d6e8540-docking-source-15.avif" alt="" loading="lazy" width="552" height="182"></a></p>

<strong> Figure 6 | Predicted ascaroside-binding pockets of GprC, SRBC-64, and DAF-37. </strong> Docking results for five ascarosides are shown for each receptor, with five poses per ligand. Cropped from Hu et al. (2024), Fig. 5a–c. [2]

:::

<p> This extension broadens site selection from dual-ligand comparison within one receptor to cross-receptor analysis: contact differences identify candidate positions, sequence and structural correspondence assess their comparability, and construct records verify the actual objects analyzed. Raw scores, per-pose contact tables, model identifiers, WT provenance, and structural-processing records support review and help other researchers apply this approach to their own receptor–ligand systems. </p>

## References {#src-Model-Docking-81 toc="References"}

<p>[1] Kuo, C.-Y., Tay, R. J., Lin, H.-C., et al. (2024). The nematode-trapping fungus Arthrobotrys oligospora detects prey pheromones via G protein-coupled receptors. <em>Nature Microbiology</em>, 9, 1738–1751. <a href="https://doi.org/10.1038/s41564-024-01679-w">https://doi.org/10.1038/s41564-024-01679-w</a></p>

<p>[2] Hu, X., et al. (2024). GprC of the nematode-trapping fungus Arthrobotrys flagrans activates mitochondria and reprograms fungal cells for nematode hunting. <em>Nature Microbiology</em>, 9, 1752–1763. <a href="https://doi.org/10.1038/s41564-024-01731-9">https://doi.org/10.1038/s41564-024-01731-9</a></p>

<p>[3] Abramson, J., et al. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. <em>Nature</em>, 630, 493–500. <a href="https://doi.org/10.1038/s41586-024-07487-w">https://doi.org/10.1038/s41586-024-07487-w</a></p>

<p>[4] Meeko developers. <em>Meeko documentation: Options of mk_export.py</em>. <a href="https://meeko.readthedocs.io/en/develop/export_cli_options.html">https://meeko.readthedocs.io/en/develop/export_cli_options.html</a> (Accessed 19 October 2026).</p>

<p>[5] Trott, O., &amp; Olson, A. J. (2010). AutoDock Vina: Improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading. <em>Journal of Computational Chemistry</em>, 31, 455–461. <a href="https://doi.org/10.1002/jcc.21334">https://doi.org/10.1002/jcc.21334</a></p>

</section>

</div>
