---
title: Molecular dynamics
heading: Molecular dynamics
sub: ''
crumbs:
  - Model
  - Molecular dynamics
route: model-md
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout model-manuscript" lang="en">

<span id="src-Model-Molecular-Dynamics-1" aria-hidden="true"></span>

## Molecular dynamics: ligand positioning and contact changes in a membrane environment {#model-md-section-0 toc="Molecular dynamics: ligand positioning and contact changes in a membrane environment"}

Molecular docking provided candidate binding poses for the Gpr2 variants N84V and V368R. We subsequently performed <strong>molecular dynamics (MD)</strong> simulations to examine how these poses adjusted in a membrane environment and which receptor–ligand contacts persisted.

<span id="src-Model-Molecular-Dynamics-3" aria-hidden="true"></span>

### 1.1 Constructing six membrane systems from docking poses {#model-md-section-1 toc="Constructing six membrane systems from docking poses" toc-unnumbered}

We paired <strong>wild type (WT)</strong> Gpr2, N84V, and V368R with <strong>ascaroside #18 (ascr#18)</strong> and <strong>ascaroside #3 (ascr#3)</strong> to generate six receptor–ligand complexes. Each complex was constructed from its own docking pose by placing the ligand in the corresponding full-length receptor and resolving steric clashes involving the restored receptor segments, the ligand, and neighboring structures. Each complex was then embedded in a <strong>1-palmitoyl-2-oleoyl-sn-glycero-3-phosphocholine (POPC)</strong> lipid bilayer, solvated, and supplemented with ions.

The systems underwent energy minimization, followed by gradual heating to 303.15 K at constant volume and a brief period at the target temperature. Pressure equilibration was then performed in successive stages at 1 bar, with positional and dihedral restraints progressively relaxed to allow the receptor, ligand, lipids, and solvent to relax together. Additional unrestrained preparatory simulations were then performed while monitoring temperature, density, membrane-plane area, and box height. Each of the six systems subsequently underwent a single 100 ns production simulation.

<span id="src-Model-Molecular-Dynamics-6" aria-hidden="true"></span>

### 1.2 Tracking ligand motion relative to the local binding pocket {#model-md-section-2 toc="Tracking ligand motion relative to the local binding pocket" toc-unnumbered}

To distinguish overall receptor motion from ligand movement within the pocket, we aligned the trajectories using a common set of pocket backbone atoms across all six systems. We then calculated ligand heavy-atom <strong>root mean square deviation (RMSD)</strong> relative to the first production frame of each respective trajectory. Whole-receptor alignment and alignment to the transmembrane helical core were also used to compare the results obtained with different structural references.

The 50–100 ns interval was used as the primary comparison window for all six systems to reduce the influence of early conformational relaxation. Full trajectories were also examined to track contact formation and loss and ligand repositioning. RMSD describes the extent to which a ligand deviates from its own starting pose, whereas contact occupancy is the fraction of sampled frames within the analysis window that satisfy the specified contact criterion.

:::figure

[![Figure 1 | Ligand heavy-atom RMSD under three structural alignment schemes. Trajectories were aligned using the whole receptor, the transmembrane helical core, or the local pocket backbone, with each trajectory referenced to its own initial production structure](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-d5f1716f681b7d35-00.json)](https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-d5f1716f681b7d35-00.json "Open full-resolution image")

**Figure 1 | Ligand heavy-atom RMSD under three structural alignment schemes.** Trajectories were aligned using the whole receptor, the transmembrane helical core, or the local pocket backbone, with each trajectory referenced to its own initial production structure. Curves show a 1 ns centered moving average of data sampled every 100 ps. Shading marks the 50–100 ns comparison window. Each system is represented by one 100 ns trajectory.

:::

The RMSD curves obtained after pocket alignment and transmembrane helical-core alignment were similar, whereas whole-receptor alignment yielded markedly different profiles. This indicates that motion in other receptor regions affects ligand RMSD measurements. Using local structural elements as the reference therefore provides a clearer view of ligand pose changes within the binding region.

<span id="src-Model-Molecular-Dynamics-12" aria-hidden="true"></span>

### 1.3 N84V–ascr#18: persistent anchoring of the ligand carboxylate by Arg189 {#model-md-section-3 toc="N84V–ascr#18: persistent anchoring of the ligand carboxylate by Arg189" toc-unnumbered}

In N84V–ascr#18, Arg189 maintained persistent contact with the ligand’s terminal carboxylate. In the simulation model, the Arg189 guanidinium group was positively charged and the ligand carboxylate was negatively charged. Their close association was consistent with a salt bridge and included contacts meeting the geometric criteria for hydrogen bonding. The electrostatic and geometric properties of salt bridges provide a basis for interpreting the positioning of this charged ligand terminus \[1].

During 50–100 ns, the minimum distance between an Arg189 guanidinium nitrogen and a ligand carboxylate oxygen was ≤4 Å in every sampled frame, corresponding to a contact occupancy of 100%. At least one hydrogen bond between these groups was present in 93.6% of sampled frames. Hydrogen bonds were defined by a donor–acceptor distance ≤3.0 Å and a donor–hydrogen–acceptor (D–H–A) angle ≥150°. Under the same criteria, no Arg189–carboxylate hydrogen bonds were detected in N84V–ascr#3 or WT–ascr#18 during this interval (Figure 2).

:::figure

[![Figure 2 | Arg189–carboxylate interactions in the Gpr2 N84V–ascr#18 complex. (a) Simulation snapshot at 64.64 ns](https://static.igem.wiki/teams/6303/wiki/release-20261020/model-md-4665546c7178.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/model-md-4665546c7178.webp "Open full-resolution image")

**Figure 2 | Arg189–carboxylate interactions in the Gpr2 N84V–ascr#18 complex.** (a) Simulation snapshot at 64.64 ns. The receptor is shown as purple ribbons; ascr#18 and Arg189 are shown as sticks with magenta and yellow carbon atoms, respectively. The dashed line indicates an Arg189–carboxylate hydrogen bond with a donor–acceptor distance of 2.77 Å. (b) Occupancy of at least one Arg189–carboxylate hydrogen bond during 50–100 ns: 93.6% for N84V–ascr#18 and 0% for WT–ascr#18 and N84V–ascr#3. Frames were sampled every 100 ps, using the hydrogen-bond criteria defined in the text.

:::

Persistent contact was accompanied by a smaller deviation from the initial ligand pose. After pocket alignment, the mean ligand RMSD of N84V–ascr#18 during 50–100 ns was lower than those of WT–ascr#18 and N84V–ascr#3. This relationship was retained after alignment to the transmembrane helical core. The persistent Arg189 salt bridge, together with its associated hydrogen bonding, provides a mechanistic clue to how ascr#18 maintains its position in this conformation.

<span id="src-Model-Molecular-Dynamics-20" aria-hidden="true"></span>

### 1.4 V368R–ascr#3: the structural basis for the predicted preference remains unresolved {#model-md-section-4 toc="V368R–ascr#3: the structural basis for the predicted preference remains unresolved" toc-unnumbered}

In the original V368R–ascr#3 trajectory, the ligand moved away from its initial position, and its carboxylate subsequently became anchored by Arg345. At the same time, the charged end of the Arg368 side chain moved away from Asp70, prompting us to examine the relationship between local receptor rearrangements and ligand repositioning. However, persistent Arg345–ligand contacts were also observed in WT–ascr#3 and V368R–ascr#18. Arg345 therefore provides an anchoring site accessible to multiple systems, and this shared contact does not explain the enhanced preference of V368R for ascr#3 predicted by Vina.

To identify other stabilizing interactions, we designed two alternative starting poses for V368R–ascr#3 and performed a 100 ns MD simulation for each. In one pose, the ligand carboxylate was positioned near the introduced Arg368 to test whether this residue could directly anchor the ligand. In the other, the carboxylate was positioned near Arg189, following the anchoring arrangement observed in N84V–ascr#18. Both trajectories lost their designed contacts early in the simulation and were dominated by Arg345-mediated anchoring in the later stages, without establishing a new persistent anchoring mode (Figure 3a,b). During 50–100 ns, the Arg345–carboxylate salt-bridge occupancies were 100.00% and 93.42% in the Arg368-directed and Arg189-directed trajectories, respectively (Figure 3c).

:::figure

[![Figure 3 | Changes in ligand anchoring in V368R–ascr#3 simulations initiated from two alternative poses. (a,b) Time-dependent salt-bridge occupancies for the Arg368-directed (a) and Arg189-directed (b) starting poses](https://static.igem.wiki/teams/6303/wiki/release-20261020/model-md-ec8e6e576326.webp)](https://static.igem.wiki/teams/6303/wiki/release-20261020/model-md-ec8e6e576326.webp "Open full-resolution image")

**Figure 3 | Changes in ligand anchoring in V368R–ascr#3 simulations initiated from two alternative poses.** (a,b) Time-dependent salt-bridge occupancies for the Arg368-directed (a) and Arg189-directed (b) starting poses. Each panel compares the designed Arg368–carboxylate or Arg189–carboxylate contact with the Arg345–carboxylate contact. Shading marks the 50–100 ns comparison window. (c) Arg345–carboxylate contact occupancies during 50–100 ns in the two additional trajectories and the WT–ascr#3, V368R–ascr#18, and original V368R–ascr#3 trajectories. Bars indicate salt-bridge occupancy using a distance cutoff of ≤4 Å; diamonds indicate the occupancy of short, near-linear hydrogen bonds. Each starting pose was simulated for 100 ns.

:::

A receptor-wide screen for direct salt bridges, hydrogen bonds, and combinations of contacts identified a transient interaction between Asp89 and the ascr#3 sugar ring in the trajectory initiated near Arg189. This hydrogen bond occurred frequently during 20–50 ns but was largely absent during the second half of the simulation. In this trajectory, the Arg368–Asp70 contact persisted across the formation and subsequent loss of the Asp89–ligand hydrogen bond, without changes corresponding to sugar-ring movement. A static model containing ascr#18 could also accommodate the sugar ring at the same position. Thus, Asp89 supported a transient binding pose but did not provide a persistent interaction pattern that explained the predicted preference of V368R for ascr#3.

**The additional simulations and subsequent analyses did not identify a mechanistic clue comparable to the persistent Arg189-mediated anchoring observed in N84V–ascr#18. The structural basis for the enhanced preference of V368R for ascr#3 predicted by Vina remains to be elucidated.**

<span id="src-Model-Molecular-Dynamics-25" aria-hidden="true"></span>

### 1.5 Mechanistic interpretations of the two candidates {#model-md-section-5 toc="Mechanistic interpretations of the two candidates" toc-unnumbered}

The MD results for N84V provide a structural clue to the Vina-predicted preference for ascr#18. Arg189 persistently anchored the ligand carboxylate through a salt bridge with associated hydrogen bonding, while the ligand showed a smaller deviation from its initial pose within the local pocket. These observations provide a specific explanation for how ascr#18 maintained its binding pose.

A comparable mechanistic clue has not yet emerged for V368R. The two additional simulations failed to maintain the designed Arg368 or Arg189 contacts, and the Arg345 contacts that predominated later were also observed in control systems. The newly identified Asp89 hydrogen bond persisted only during part of the trajectory. Thus, the current MD results do not explain the enhanced preference of V368R for ascr#3 predicted by Vina, and its structural basis requires further investigation.

<span id="src-Model-Molecular-Dynamics-28" aria-hidden="true"></span>

## References {#model-md-section-6 toc="References"}

\[1] Donald, J. E., Kulp, D. W., & DeGrado, W. F. (2011). Salt bridges: Geometrically specific, designable interactions. *Proteins: Structure, Function, and Bioinformatics*, 79(3), 898–915. <https://doi.org/10.1002/prot.22927>

</div>
