---
title: Molecular Dynamics
heading: Molecular Dynamics
sub: ''
crumbs:
  - Model
  - Molecular Dynamics
route: model-md
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
:::note[翻译未校对]
Translation not proofread.
:::

## 2. Molecular Dynamics | Ligand positioning and contact changes in a membrane environment {#md-introduction toc="2. Molecular Dynamics | Ligand positioning and contact changes in a membrane environment"}

Docking provided candidate poses and contact clues for N84V and V368R. We further used molecular dynamics (MD) simulations to observe how these poses change after entering a membrane environment and whether the predicted contacts persist, adding dynamic evidence to the structural interpretation of the candidates.

## 2.1 Starting from docking poses to establish comparative systems in a membrane environment {#md-systems toc="2.1 Starting from docking poses to establish comparative systems in a membrane environment"}

We paired WT, N84V and V368R with ascr#18 and ascr#3, respectively, to construct six complexes. System preparation started from each system’s own docking pose: the ligand was placed back into the corresponding full-length receptor, the structure was rationalized, and spatial clashes between the restored segments, ligand and surrounding structure were checked and addressed. While retaining each system’s original conformation as far as possible, we placed the complexes in POPC lipid bilayers, solvent and ions.

To be inserted: “Description of energy minimization and other preparation stages.”

Each of the six systems completed one 100 ns simulation. We used a common analysis method to compare ligand motion and contact changes, while retaining the source of each starting structure and ligand pose as a basis for interpreting the results.

## 2.2 Observing ligand motion relative to the local pocket {#md-pocket-rmsd toc="2.2 Observing ligand motion relative to the local pocket"}

The receptor itself also moves during simulation. When observing ligand position, it is therefore necessary to distinguish movement together with the receptor from a change of position within the pocket. We aligned the local pocket, calculated the ligand heavy-atom RMSD relative to its own starting pose, and interpreted it together with contact changes and actual conformations.

Results are mainly summarized over 50–100 ns (to be supplemented: why the first 50 ns are not used), while the full trajectory is also examined. RMSD describes the extent of ligand departure from the initial pose; contact occupancy is the proportion of sampled frames within the analyzed time window that satisfy the specified contact criteria.

Image to be inserted.

## 2.3 N84V–ascr#18: tracing persistent contacts from smaller local motion {#md-n84v toc="2.3 N84V–ascr#18: tracing persistent contacts from smaller local motion"}

To be rewritten — focus on the hydrogen bond/salt bridge formed between arg189 and the carboxyl group.

Relative to the local pocket, the ligand in N84V–ascr#18 moved less in the second half of the trajectory than in WT–ascr#18 and N84V–ascr#3. This observation was also retained when the transmembrane helical core was used as the alignment reference.

| System | Mean ligand RMSD, 50–100 ns, pocket aligned (Å) |
| --- | ---: |
| WT–ascr#18 | 2.62 |
| N84V–ascr#18 | 1.73 |
| N84V–ascr#3 | 4.68 |

To understand ligand retention in this region, we further examined persistently contacting residues and the specific ligand groups they contacted. In N84V–ascr#18, the guanidinium group of Arg189 remained close to the terminal carboxylate of the ligand. During 50–100 ns, their heavy-atom contact occupancy was 100%, and the occupancy of any candidate geometric hydrogen bond was 93.6%.

Here, the heavy-atom contact criterion was a minimum distance no greater than 4 Å; the candidate geometric hydrogen-bond criteria were a donor–acceptor distance no greater than 3.0 Å and a D–H–A angle no smaller than 150°.

This result makes the R189 contact clue from docking more specific: in this trajectory, the carboxyl end of the ligand maintained persistent contact with Arg189, providing a structural explanation for its local positioning.

We then examined the relationship between this contact and the mutation site. Val84 did not directly contact the ligand in the second half of the trajectory, and the current local analysis has not established a specific connection from position 84 to Arg189. Meanwhile, the Arg189–carboxyl-end contact was already present at the starting point of the production simulation.

The current results therefore support an association between persistent contact and smaller local motion in this N84V–ascr#18 conformation. Replicate simulations and more controlled comparisons of starting points are still needed to test the relationship between this behavior and the substitution at position 84.

## 2.4 V368R–ascr#3: adjusting the interpretation following ligand relocation, {#md-v368r toc="2.4 V368R–ascr#3: adjusting the interpretation following ligand relocation,"}

To be rewritten.

V368R–ascr#3 showed different dynamic behavior: the ligand left its initial position, moved toward Arg345, and formed new contacts. This led us to further examine the receptor structure around the mutation site, looking for local changes accompanying ligand movement.

The analysis showed that the charged end of Arg368 gradually moved away from Asp70 in V368R–ascr#3, whereas the two groups remained close in V368R–ascr#18. In the former trajectory, movement of the charged end and the onset of persistent ligand contact with Arg345 occurred at similar times, suggesting that local rearrangement of the receptor accompanied ligand relocation. However, these changes come from the same trajectory, and their temporal proximity is still insufficient to establish a causal relationship.

The WT control also led us to reconsider this interpretation. WT–ascr#3 also had persistent contact between Arg345 and the carboxyl end of the ligand; during 50–100 ns, its contact occupancy was 100%, compared with 90.4% in V368R–ascr#3. The current results therefore do not support interpreting the Arg345 contact as a positioning effect unique to or enhanced by V368R, and these occupancies cannot directly determine binding strength.

In addition, the two V368R systems differed in their starting ligand poses and local structural processing, making it difficult to attribute subsequent changes solely to ligand type or mutation effects. The current observations support a local-rearrangement hypothesis that requires further testing, and show that candidate interpretation needs to consider ligand motion, internal receptor changes and the influence of starting structures together.

## 2.5 Feeding dynamic observations back into candidate interpretation {#md-next-steps toc="2.5 Feeding dynamic observations back into candidate interpretation"}

MD added different structural explanations for the two candidates: in N84V–ascr#18, persistent contact between Arg189 and the carboxyl end provided a clue to the smaller local motion; V368R–ascr#3 underwent ligand relocation, suggesting that subsequent evaluation needs to consider contact rearrangements beyond the initial pose.

These observations make the next questions more specific: whether the local positioning of N84V persists in replicate simulations, whether the rearrangement process in V368R recurs, and how these behaviors are related to the mutations. Each system currently has only one trajectory, and the starting conformations differ; the effects of the mutations on actual binding and selectivity still require further simulations and experimental evaluation.

<span id="source-english-20261010" aria-hidden="true"></span>
<span id="original-model-block-80" aria-hidden="true"></span>

[Historical source documents / 历史原稿](/source-archive/)
