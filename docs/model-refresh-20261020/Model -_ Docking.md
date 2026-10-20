# Model \-\> Docking

# Docking: Screening Receptor Variants for Ascaroside Discrimination

To build a sensor that distinguishes ascr\#18 from ascr\#3, we sought receptor variants with different preferences for the two ligands\. Molecular docking helped us identify starting points for receptor engineering: which residues contact each ligand, how side\-chain substitutions affect docking scores and contacts, and which variants merit further study\.

We began by establishing comparable docking conditions, then used contact differences in wild\-type \(WT\) receptors to select mutation sites\. Alanine substitutions, saturation scans, and combination tests guided successive rounds of design\. Docking scores supported candidate comparisons, while contact analysis helped us develop structural explanations and plan the next round\.

## 1\.1 Receptor Selection and Docking Setup

We initially examined three fungal G protein\-coupled receptors \(GPCRs\) involved in ascaroside sensing: Gpr2 and Gpr3 \[1\], and GprC \[2\]\. We prepared predicted receptor structures and ligands, using published pocket locations, key residues, and docking methods as references\. We also considered their use in yeast\. GprC has been reported at both the plasma membrane and mitochondria in its native fungal host \[2\]\. We considered this a potential complication for localization and pathway integration in yeast, so we focused subsequent engineering on Gpr2, continued to investigate Gpr3 and its variants, and retained GprC as a structural reference\.

![图1\.png](图片和附件/图1.png)

> **Figure 1\. Predicted full\-length structure of Gpr2 WT\.** Overall structure of model\_0 generated with AlphaFold 3 \[3\]\.
> 
> 

Initial checks revealed two input problems\. Inconsistent coordinate frames between receptor structures and docking boxes displaced the search region from the intended pocket\. Loss of chemical information, including formal charges, during format conversion also affected the identification of charged contacts\. These findings made input validation a routine part of the workflow\.

We used structural superposition to place receptors, ligands, and docking boxes in a common coordinate frame, then checked the search region against membrane orientation and the receptor segments retained for docking\. Atom mapping was used to check atom identities and coordinate correspondence between the original ligand SDF files and the PDBQT files\. When the required Meeko metadata were retained in the PDBQT output, we exported the docked poses to SDF while restoring the original bond orders and formal charges for contact analysis \[4\]\.

Subsequent mutant comparisons used consistent ligand inputs and search settings\. Original residue numbering was preserved so that docking scores could be traced to residue contacts\. Published studies guided receptor selection and structural comparisons; input checks established consistent computational conditions; and docking with both ligands guided the design and screening of variants\.

## 1\.2 Contact\-Based Site Selection and Alanine Scanning

We selected initial mutation sites at two levels\. First, we measured residue contact frequencies across predicted receptor models and their docked poses, identifying recurring contacts and comparing their occurrence between the two ligands\. Second, we examined the poses in model\_0 to identify contacts detected for only one ligand and classify their interaction types\.

![20261020\-014310\.png](图片和附件/20261020-014310.png)

> **Figure 2\. Predicted docking poses and pocket environments of Gpr2 WT\.** \(a, b\) ascr\#3; \(c, d\) ascr\#18\. Each pair shows a 3D pocket view and the corresponding Maestro 2D interaction diagram \[6\] for the lowest\-scoring pose\. In the 3D views, the receptor is shown as a purple cartoon, pocket residues as yellow sticks, and ascr\#3 and ascr\#18 in cyan and magenta, respectively\. Original residue numbering is retained\.
> 
> 

These analyses provided complementary information\. Contact frequencies showed how often a residue contacted a ligand within the sampled conformations, while individual poses helped locate differences and identify side chains to test\.

We then replaced candidate residues with alanine to examine how simplifying each side chain changed the scores and contacts for both ligands\. The initial sites were N84, L90, V110, R181, W338, R345, and V368\. For each substitution, we generated a mutant sequence, predicted its structure with AlphaFold 3 \[3\], and carried out structure preparation, docking, and contact comparisons with WT\.

![图3\.png](图片和附件/图3.png)

> **Figure 3\. Initial mutation sites in Gpr2\.** N84, L90, V110, R181, W338, R345, and V368 are highlighted on the predicted full\-length structure\.
> 
> 

Using the structures and WT reference from this initial round, N84A, V110A, and V368A all produced lower scores for ascr\#3 and higher scores for ascr\#18\. We therefore prioritized N84, V110, and V368 for further side\-chain comparisons\. Score and contact changes at W338 and R181 also warranted further investigation\. These results turned the initial contact observations into specific substitutions to test\.

## 1\.3 Saturation Scanning at Four Sites

The alanine scan narrowed the search and raised a further question: could different side chains at the same position shift the scores in different directions?

Based on the alanine scan, contact analysis, and additional side\-chain substitutions, we selected N84, V110, V368, and W338 for saturation scanning\. Testing all 19 alternatives at each site produced 76 single\-mutant designs, allowing us to compare how side\-chain identity affected scores and contact patterns for the two ligands\.

Different substitutions at the same position produced distinct score shifts\. For example, N84V lowered the score for ascr\#18 and raised it for ascr\#3, whereas N84Y showed the opposite pattern\. Contact differences helped identify promising positions, but the results for both ligands were needed to select individual variants\.

## 1\.4 Comparing Score Changes for Both Ligands

We described each variant’s shift using the difference between its WT\-relative score changes for the two ligands\. Let \(G\) denote the AutoDock Vina docking score \[5\]:

\[

\\Delta G\_\{18\}=G\_\{\\mathrm\{mut\},18\}\-G\_\{\\mathrm\{WT\},18\}

\]

\[

\\Delta G\_\{3\}=G\_\{\\mathrm\{mut\},3\}\-G\_\{\\mathrm\{WT\},3\}

\]

We then calculated:

\[

\\Delta\\Delta G=\\Delta G\_\{18\}\-\\Delta G\_\{3\}

\]

A negative \(\\Delta G\) indicates a lower score than WT for that ligand\. Under this definition, a positive \(\\Delta\\Delta G\) indicates a shift toward ascr\#3 relative to WT, whereas a negative value indicates a shift toward ascr\#18\. These quantities describe docking\-score changes rather than thermodynamic binding free\-energy changes\. Binding affinity and selectivity require experimental evaluation\.

We also examined the two score changes separately\. A lower score for the target ligand, a higher score for the other ligand, or both could produce a shift in the same direction, but would imply different candidate profiles\.

After saturation scanning, we prioritized N84V, V110C, V110M, and V368R for detailed contact analysis\. All four were compared with the same WT reference, whose scores were −6\.492 kcal/mol for ascr\#18 and −6\.625 kcal/mol for ascr\#3\.

**Table 1\. Docking scores and WT\-relative changes for four prioritized Gpr2 variants\.**

All values are in kcal/mol\. Negative changes indicate lower scores than WT\.

N84V and V110C both shifted toward ascr\#18, but for different reasons\. V110C lowered the scores for both ligands, with a larger decrease for ascr\#18\. N84V lowered the score for ascr\#18 while raising it for ascr\#3\. V110C therefore produced the greater improvement in the ascr\#18 score, whereas N84V produced the larger WT\-relative score shift between the ligands\.

V110M and V368R both shifted toward ascr\#3\. For V110M, the ascr\#3 score remained close to WT, so the shift was driven mainly by a higher ascr\#18 score\. V368R combined a lower ascr\#3 score with a higher ascr\#18 score\. Examining the components separately helped us choose candidates for ligand discrimination and design combinations\.

## 1\.5 Testing Mutation Combinations

The single\-mutant results led us to test whether substitutions with similar score shifts could be combined\. Could a combination increase the difference between the ligands? Could a substitution that lowered one ligand’s score retain its effect alongside another that raised the other ligand’s score?

We designed combinations based on the direction and components of each score shift, then compared them with WT and both single\-mutant parents\. Comparisons with WT showed whether the original direction was retained; comparisons with the parents showed whether the combination offered an additional improvement\.

The N84V/V110C double mutant illustrates this approach\. Both single mutants shifted toward ascr\#18, so we aimed to combine the larger score separation of N84V with the greater improvement in the ascr\#18 score of V110C\. The double mutant instead yielded \(\\Delta G\_\{18\}=\-0\.081\) kcal/mol and \(\\Delta G\_\{3\}=\-0\.411\) kcal/mol, giving \(\\Delta\\Delta G=\+0\.330\) kcal/mol\. The ascr\#3 score decreased more, reversing the direction observed in the single mutants\.

Contact analysis showed that the ascr\#18 pose retained an ionic contact with R189 and a hydrophobic contact with W338\. Nevertheless, its score was 0\.480 kcal/mol higher than that of V110C\. Retaining these contacts was therefore insufficient to explain the overall score: the complete pose and surrounding contact network also needed to be considered\.

Most tested combinations failed to improve the target\-ligand score of the better parent or increase the score separation between the ligands\. We therefore continued to focus on single mutants and evaluated combinations against WT, their individual parents, and the full contact network\.

## 1\.6 Selecting N84V and V368R for Molecular Dynamics

Based on score separation and contact analysis, we selected N84V and V368R from the four prioritized variants for molecular dynamics \(MD\) simulations\. Each lowered the score for one ligand and raised it for the other, with opposite directions of preference in the docking results\. They provided two contrasting candidates for studying the structural behavior of ascr\#18 and ascr\#3\.

N84V highlighted the importance of the surrounding residue network\. In the selected poses, residue 84 itself made no detected direct contact with either ligand\. Compared with the WT reference from the same batch, the ascr\#18 pose gained ionic and hydrogen\-bond contacts involving R189, together with a hydrophobic contact involving W338\. We therefore focused on changes in ligand position and neighboring contacts, and asked whether these contacts would persist during MD and help maintain the ligand’s position\.

![图4\.png](图片和附件/图4.png)

> **Figure 4\. Predicted docking poses and pocket environments of Gpr2 N84V\.** \(a, b\) ascr\#3; \(c, d\) ascr\#18\. Each pair shows a 3D pocket view and the corresponding Maestro 2D interaction diagram for the lowest\-scoring pose\. Colors follow Figure 2, and residue numbering matches WT\.
> 
> 

V368R raised a different question\. Although the substitution introduced an arginine, R368 showed a close contact only with ascr\#18 in the selected poses, and no ionic contact involving R368 was detected\. Both ligands gained ionic and hydrogen\-bond contacts involving K364\. Interpreting V368R therefore required examining the local structure and contact network around the mutation, together with the scores for both ligands\.

![图5\.png](图片和附件/图5.png)

> **Figure 5\. Predicted docking poses and pocket environments of Gpr2 V368R\.** \(a, b\) ascr\#3; \(c, d\) ascr\#18\. Each pair shows a 3D pocket view and the corresponding Maestro 2D interaction diagram for the lowest\-scoring pose\. Colors follow Figure 2, and residue numbering matches WT\.
> 
> 

Docking thus led to questions about dynamics: would the ligands retain their initial positions in full\-length receptors embedded in a membrane, and which contacts would persist or rearrange? We paired WT, N84V, and V368R with each ligand to form six systems for MD comparison\. These simulations would test the structural hypotheses and refine our interpretation of the variants\.

## 1\.7 Mapping Contact Sites Across Receptors

We extended the analysis to Gpr3, GprC, and the *Caenorhabditis elegans* receptors DAF\-37 and SRBC\-64 to identify corresponding contact positions for parallel testing\. Hu et al\.’s comparison of predicted ascaroside pockets across receptors provided a reference for this analysis \[2\]\.

For each receptor, we used five predicted models and compared contact frequencies for ascr\#18 and ascr\#3 within each model\. Sequence alignment and structural mapping were then used to examine residue correspondence\. We also recorded whether each residue was retained in the actual docking construct, linking contact analysis and positional mapping to the structures used\.

Three TM6 tryptophans—Gpr2 W338, Gpr3 W306, and GprC W388—showed contact differences favoring ascr\#18 and corresponding positions supported by both sequence and structural comparisons\. These residues became candidates for parallel substitutions across the fungal receptors, allowing future tests of whether they play similar roles\.

![image\.png](图片和附件/image.png)

> **Figure 6\. Predicted ascaroside\-binding pockets in GprC, SRBC\-64, and DAF\-37\.** Each receptor shows five docking poses for each of five ascarosides\. Cropped from Hu et al\. \(2024\), Figure 5a–c \[2\], under the [Creative Commons Attribution 4\.0 International license](https://creativecommons.org/licenses/by/4.0/)\.
> 
> 

This extension applied the site\-selection approach across receptors\. Contact differences identified candidate residues, sequence and structural correspondence supported positional comparisons, and construct records linked the results to the structures analyzed\. Raw scores, pose\-level contact tables, model identifiers, WT references, and structure\-processing records provide a basis for reviewing the analysis and adapting the approach to other receptor–ligand systems\.

## References

\[1\] Kuo, C\.\-Y\., Tay, R\. J\., Lin, H\.\-C\., et al\. \(2024\)\. The nematode\-trapping fungus *Arthrobotrys oligospora* detects prey pheromones via G protein\-coupled receptors\. *Nature Microbiology*, 9, 1738–1751\. [https://doi\.org/10\.1038/s41564\-024\-01679\-w](https://doi.org/10.1038/s41564-024-01679-w)

\[2\] Hu, X\., Hoffmann, D\. S\., Wang, M\., et al\. \(2024\)\. GprC of the nematode\-trapping fungus *Arthrobotrys flagrans* activates mitochondria and reprograms fungal cells for nematode hunting\. *Nature Microbiology*, 9, 1752–1763\. [https://doi\.org/10\.1038/s41564\-024\-01731\-9](https://doi.org/10.1038/s41564-024-01731-9)

\[3\] Abramson, J\., et al\. \(2024\)\. Accurate structure prediction of biomolecular interactions with AlphaFold 3\. *Nature*, 630, 493–500\. [https://doi\.org/10\.1038/s41586\-024\-07487\-w](https://doi.org/10.1038/s41586-024-07487-w)

\[4\] AutoDock Vina developers\. *AutoDock Vina documentation: Basic docking*, Section 4\.c, “Exporting results to SDF\.” [https://autodock\-vina\.readthedocs\.io/en/latest/docking\_basic\.html](https://autodock-vina.readthedocs.io/en/latest/docking_basic.html)\. Accessed 20 October 2026\.

\[5\] Trott, O\., \& Olson, A\. J\. \(2010\)\. AutoDock Vina: Improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading\. *Journal of Computational Chemistry*, 31, 455–461\. [https://doi\.org/10\.1002/jcc\.21334](https://doi.org/10.1002/jcc.21334)

\[6\] Schrödinger\. *Maestro*\. [https://www\.schrodinger\.com/platform/products/maestro/](https://www.schrodinger.com/platform/products/maestro/)\. Accessed 20 October 2026\.

