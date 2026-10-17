---
title: Molecular Dynamics
heading: Molecular Dynamics
sub: Local ligand movement and persistent contacts in six membrane systems.
crumbs:
  - Model
  - Molecular Dynamics
route: model-md
search: true
description: Local ligand movement and persistent contacts in six membrane systems.
meta: {}
draft: false
hidden: false
---
## Following ligand positions in a membrane {#md-introduction toc="Research question"}

Docking provided candidate poses and contact hypotheses for N84V and V368R. **Molecular dynamics (MD)** asks how those poses change in a membrane and whether predicted contacts persist, adding dynamic evidence to our structural explanations.

## Building six comparable systems {#md-systems toc="Simulation systems"}

WT, N84V and V368R were each paired with ascr#18 and ascr#3. Starting from each system's own docking pose, we placed the ligand back into the corresponding full-length receptor, rationalized the structure and checked for clashes between restored segments, the ligand and neighboring structure. While preserving each system's original conformation as far as possible, we placed the complexes in **POPC lipid bilayers**, solvent and ions.

:::note[Preparation methods awaiting completion]
The authors are adding the description of energy minimization and the other preparation stages. These details were marked as incomplete in the supplied manuscript.
:::

Each of the six systems completed **one 100 ns trajectory**. We used a common analysis method for ligand motion and contacts and retained the source of each starting structure and ligand pose for interpretation.

## Measuring motion relative to the pocket {#md-pocket-rmsd toc="Local motion"}

The receptor itself moves during simulation. To distinguish movement with the receptor from movement within its pocket, we aligned the local pocket and calculated the **ligand heavy-atom RMSD** relative to its own starting pose. Contact changes and actual conformations were examined alongside RMSD.

We mainly summarize **50–100 ns** and also inspect the full trajectories. RMSD measures departure from the initial pose; **contact occupancy** is the proportion of sampled frames in the selected interval that satisfy the contact criteria.

:::note[Analysis window and figure awaiting completion]
The rationale for excluding the first 50 ns from the main summary and the associated trajectory figure remain to be supplied.
:::

## N84V–ascr#18 and persistent Arg189 contacts {#md-n84v toc="N84V–ascr#18"}

:::note[Author revision pending]
The supplied section is marked for revision around the Arg189–carboxyl hydrogen-bond/salt-bridge description. The observations below retain the current manuscript's qualifications.
:::

With the local pocket as the alignment reference, N84V–ascr#18 moved less in the second half of the trajectory than WT–ascr#18 or N84V–ascr#3. This observation was retained when the transmembrane helical core was used for alignment.

| System | Mean ligand RMSD, 50–100 ns, pocket aligned (Å) |
| --- | ---: |
| WT–ascr#18 | 2.62 |
| N84V–ascr#18 | 1.73 |
| N84V–ascr#3 | 4.68 |

We examined persistent residues and the ligand groups they contacted. In N84V–ascr#18, the Arg189 guanidinium group remained near the terminal carboxylate. During 50–100 ns, their heavy-atom contact occupancy was 100%; occupancy of any candidate geometric hydrogen bond was 93.6%.

The heavy-atom contact criterion was a **minimum distance of at most 4 Å**. Candidate geometric hydrogen bonds required a **donor–acceptor distance of at most 3.0 Å** and a **D–H–A angle of at least 150°**.

In this trajectory, persistent contact between the carboxyl end and Arg189 provides a structural explanation for local ligand positioning. However, Val84 did not contact the ligand directly in the second half, and the current local analysis has not established a specific link from position 84 to Arg189. The Arg189–carboxyl contact was already present at the production-simulation starting point.

The observation therefore associates persistent contact with smaller local motion in this particular N84V–ascr#18 conformation. **Replicate simulations** and more controlled starting-point comparisons are needed to test its relationship to the substitution at position 84.

## V368R–ascr#3 and ligand relocation {#md-v368r toc="V368R–ascr#3"}

:::note[Author revision pending]
This section remains marked for revision in the supplied manuscript.
:::

V368R–ascr#3 behaved differently: the ligand left its initial position, moved toward Arg345 and formed new contacts. We examined receptor changes around the mutation site that accompanied this movement.

In V368R–ascr#3, the charged end of Arg368 gradually moved away from Asp70. In V368R–ascr#18, these groups remained close. In the former trajectory, separation of the charged group and the onset of persistent Arg345–ligand contact occurred at similar times. This suggests a local rearrangement accompanying ligand relocation, but **temporal proximity within one trajectory does not establish causation**.

WT also changed the interpretation. WT–ascr#3 had persistent Arg345–carboxyl contacts, with 100% occupancy during 50–100 ns, compared with 90.4% for V368R–ascr#3. These results do not support calling the Arg345 contact unique to V368R or an enhanced anchoring effect. **Occupancies alone do not measure binding strength**.

The two V368R systems also differed in starting ligand pose and local structural processing. This limits attribution of subsequent changes solely to ligand type or mutation. The observations support a local-rearrangement hypothesis that requires further testing, with explicit attention to initial structures.

## Feeding dynamic observations back into design {#md-next-steps toc="Interpretation"}

MD supplied different explanations for the two candidates. In N84V–ascr#18, persistent Arg189–carboxyl contacts accompanied smaller local motion. In V368R–ascr#3, ligand relocation emphasizes contact rearrangement beyond the original pose.

The next questions are whether N84V's local positioning persists in replicate simulations, whether V368R repeatedly undergoes rearrangement, and how these behaviors relate to the mutations. Each system currently has **one trajectory and the starting conformations differ**. Effects on actual binding and selectivity require further simulations and experiments.

[Return to the docking hypotheses](/model-docking/) or [continue to signaling and density estimation](/model-ode/).
