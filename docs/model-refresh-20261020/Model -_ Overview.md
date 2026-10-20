# Model \-\> Overview

## Model Overview

How can nematode chemical signals in soil help guide agricultural management? Our modeling work explores this question from receptor recognition to color readout, target nematode density, and treatment decisions\. Four complementary components support sensor design, experimental calibration, and assessment of the potential value of detection\.

![01\_molecular\_docking\.png](图片和附件/01_molecular_docking.png)

![02\_molecular\_dynamics\.png](图片和附件/02_molecular_dynamics.png)

![03\_ode\_dual\_channel\.png](图片和附件/03_ode_dual_channel.png)

![04\_economic\_benefit\.png](图片和附件/04_economic_benefit.png)

> Generated with OpenAI GPT Image 2\.
> 
> 

### Molecular Docking \| Identifying receptor variants for differential recognition

We compared how Gpr2 variants interact with two ascarosides, ascr\#18 and ascr\#3, using docking scores and receptor–ligand contacts\. These comparisons guided the selection of N84V and V368R for further study as candidates with contrasting predicted ligand preferences\.

### Molecular Dynamics \| Exploring receptor–ligand behavior in a membrane

Starting from docked poses, we simulated receptor–ligand complexes in a membrane environment to examine receptor motion, ligand positioning, and changes in molecular contacts\. These simulations provide structural clues for interpreting the candidates and formulating hypotheses for experimental testing\.

### ODE \& Dual\-Channel Modeling \| Linking color readouts to nematode density

Our ordinary differential equation \(ODE\) model connects receptor input to yeast signaling and pigment production, with simulated pigment outputs translated into smartphone color features\. The dual\-channel model combines two complementary sensor responses to explore density estimation for the southern root\-knot nematode \(Meloidogyne incognita\) when background nematode abundance is unknown\. Together, these models provide a framework for experimental calibration\.

### Economic Benefit \| Assessing when detection informs treatment

Using target nematode density as an input, we compare net returns from no treatment, uniform treatment, and treatment selected by density category after testing\. By accounting for potential yield loss, testing costs, and treatment costs, the model examines when density information could improve management decisions under the modeled conditions\.

Docking and molecular dynamics guide receptor design and experimental questions\. ODE and dual\-channel modeling explore how sensor responses can be interpreted as density estimates, which then serve as inputs to economic scenarios\. In turn, the density categories used for treatment help define the measurement precision needed for future calibration\.

