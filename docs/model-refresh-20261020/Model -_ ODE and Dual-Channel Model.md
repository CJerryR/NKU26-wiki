# Model \-\> ODE and Dual\-Channel Model

# ODE and Dual\-Channel Sensing: From Signal Response to Target Density Estimation

When *Meloidogyne incognita* and free\-living nematodes occur together, a stronger color signal may reflect an increase in either the target population or the background population\. This ambiguity motivates our dual\-channel approach: two sensors with different response profiles may provide information that a single color reading cannot resolve\.

We developed two connected models to examine this approach\. An ordinary differential equation \(ODE\) model describes how effective receptor input passes through the yeast signaling pathway to produce color\. A dual\-channel regression model then uses the paired simulated color readings to estimate target nematode density without requiring the background density as an input\. We first examined whether the signal\-to\-color model preserved differences between inputs, and then tested whether those differences supported target\-density estimation under the assumed simulation conditions\.

Throughout this chapter, nematode density is expressed as individuals per 100 cm³ of soil\.

![image\.png](图片和附件/image.png)

> **Figure 3\-1\. Sequential calibration workflow for the ODE and dual\-channel models\.**
> The upper panel shows mixed\-sample design, ODE calibration, and dual\-channel regression\. The lower panel shows the intended workflow for estimating Mi density from paired smartphone readings\. Prescribed pigment targets are used to calibrate the ODE, while regression uses color features calculated from the actual ODE outputs\. Generated with OpenAI GPT Image 2\.
> 
> 

## 3\.1 Defining the signal\-to\-color model

We initially represented the pathway from ligand recognition to color output as:

**Ligand → receptor → G protein → MAPK → synthetic transcription factor \(sTF\) → GAL output → pigment accumulation**

The connection between yeast GPCR signaling and the GAL system was informed by Fan and Yuan \[8\], while the cascaded amplification and betaxanthin output design drew on Fan and colleagues \[5\]\. Our initial formulation used three ODEs for G\-protein activity, MAPK activity, and color accumulation, together with algebraic relationships for receptor response, sTF activity, and GAL output\.

This formulation highlighted a calibration challenge: endpoint color depends jointly on input sensitivity, signal amplification, and pigment production, making their individual contributions difficult to determine from a single endpoint\. We therefore reused an established quantitative model of the yeast signaling pathway and retained an effective description of pigment production, focusing project\-specific calibration on the input and output interfaces\.

## 3\.2 Connecting a literature\-based signaling core to pigment production

The signaling core was reconstructed from Supady’s Model B and the TU Delft 2012 iGEM modeling materials \[1,2\]\. We reused their reaction framework for the G\-protein cycle, scaffold module, Fus3 activation, and feedback processes, together with the corresponding source\-model parameters\. We then connected this core to our project\-specific effective ligand input and pigment\-production equation\. Conservation relationships reduce the core to five independent states; adding pigment accumulation gives the six\-state model described below\.

The five independent core variables are the G\-protein heterotrimer \(H\), active Gα \(A\), an effective scaffold complex \(Q\), active Fus3 \(F^*\), and the activated feedback state \(Z^*\)\. The core equations reconstructed from the source reaction network are:

\[
\\begin\{aligned\}
\\frac\{dH\}\{d\\tau\}\&=\-u\(L\)H\+k\_5DB,\\
\\frac\{dA\}\{d\\tau\}\&=u\(L\)H\-\(k\_4\+k\_\{41\}Z^*\)A,\\*
*\\frac\{dQ\}\{d\\tau\}\&=k\_6SB\-\(k\_7\+k\_\{71\}Z^*\)Q,\\
\\frac\{dF^*\}\{d\\tau\}\&=k\_8QF\-\(k\_9\+k\_\{91\}Z\)F^*,\\
\\frac\{dZ^\*\}\{d\\tau\}\&=k\_\{10\}F^*Z\-k\_\{11\}Z^*\.
\\end\{aligned\}
\]

Here, \(D\), \(B\), \(S\), \(F\), and \(Z\) represent Gα–GDP, free Gβγ, free scaffold, inactive Fus3, and the inactive Sst2 state, respectively\. They are calculated from the conservation relationships:

\[
\\begin\{aligned\}
D\&=T\_\\alpha\-H\-A, \&
B\&=T\_\\beta\-H\-Q,\\
S\&=T\_S\-Q, \&
F\&=T\_F\-F^*,\\*
*Z\&=T\_Z\-Z^*\.
\\end\{aligned\}
\]

Each \(T\) denotes the total concentration of the corresponding molecular pool\. The project\-specific effective input is:

\[

u\(L\)=u\_\{\\max\}\\frac\{L\}\{K\_L\+L\}\.

\]

Here, \(L\) is the normalized effective ligand input, and \(K\_L\) controls the input scale entering the signaling core\. It is an interface parameter rather than a directly measured receptor binding constant\. The feedback terms retain the source model’s effective mechanisms; their applicability to the project strain depends on the actual construct\.

During reconstruction, we expressed the active\-Fus3 derivative as activation minus inactivation, consistent with the reaction directions and conservation relationships\. We also assigned \(k\_\{91\}\) the unit \(\\mu\\mathrm\{M\}^\{\-1\}\\mathrm\{s\}^\{\-1\}\), as required by its bimolecular reaction term\. These choices address the derivative\-sign and unit inconsistencies identified in the Delft supplement \[2\]\.

The pigment module combines the initial sTF, GAL, and color\-output relationships\. For a fixed construct, the active Fus3 fraction,

\[

m=\\frac\{F^\*\}\{T\_F\},

\]

drives effective pigment production:

\\frac\{1\}\{3600\}

\\left\(

b\+a\\frac\{m^n\}\{K^n\+m^n\}\-\\delta C

\\right\)\.

\]

The core time variable \(\\tau\) is measured in seconds, so production and loss rates defined per hour are divided by 3600\. In the subsequent calibration, \(C\) denotes pigment\-equivalent concentration in \(\\mu\\mathrm\{M\}\)\. The parameter \(b\) describes basal production, \(a\) controls stimulus\-dependent production, \(K\) and \(n\) determine response shape, and \(\\delta\) describes pigment loss\.

The five core equations and one pigment equation form the six\-state model\. We checked computational consistency between the original and merged output relationships, and between the six\-state implementation and a reaction implementation retaining all states\. Conservation relationships remove redundant states, while the merged pigment equation allows endpoint data to constrain a smaller set of effective parameters\. The connection between Fus3 activity and pigment production remains an interface requiring experimental calibration\.

## 3\.3 Constructing dual\-sensor inputs by varying target and background independently

To apply the pathway model to mixed soil samples, we first defined how nematodes contribute to the ligand input\. We used *Meloidogyne incognita* \(Mi\) as the target and *Caenorhabditis elegans* \(Ce\) as the background, retaining both ascr\#3 and ascr\#18 in the simulation\.

Previous studies show that Ce ascaroside secretion depends on culture conditions and developmental stage \[3\]\. Manosalva and colleagues reported that ascr\#18 predominated in the root\-knot nematode samples they examined \[4\]\. These findings provide qualitative support for exploring different secretion profiles\.

We used the following assumptions to examine how secretion composition and sensor preference affect paired responses\. Here, \(q\_3\) and \(q\_\{18\}\) denote per\-individual ligand\-release rates, while \(w\_3\) and \(w\_\{18\}\) denote a sensor’s input weights for the two ligands\.

These ratios describe the composition of ascr\#3 and ascr\#18, rather than the complete ascaroside profile\. The Mi contribution of ascr\#3 and the exact release ratios of both species remain assumptions requiring paired quantitative measurements\.

For each ligand, the contributions from the two species were added and converted to concentration using collection time, effective volume, recovery fraction, and dilution\. Increasing the background at fixed target density reveals interference, while increasing the target at fixed background density reveals the target response\. Varying the two species independently allows these effects to be examined separately\.

The two sensors were assigned preferences for ascr\#3 and ascr\#18, corresponding to the V368R and N84V candidate directions\. Project docking analyses provided design clues for these complementary preferences; the numerical response weights require calibration using pure\-ligand concentration series\. Cross\-response was retained so that both color channels reflect the mixed input\.

This design also defines the basic structure of experimental calibration: vary target and background independently, record paired color outputs from the same sample, and include blanks and multiple background levels\. Experimental data can then replace the assumed release profiles, sensor weights, and smartphone observation relationship\.

## 3\.4 Adjusting the input and output interfaces using simulated pigment targets

In the initial simulations, different stimulus levels produced similar endpoint colors\. We therefore examined whether the pathway retained enough input variation to support density estimation\.

Keeping the signaling core fixed, we adjusted the effective input scale \(K\_L\) and pigment\-production gain \(a\)\. At the same stimulus level, a larger \(K\_L\) gives a weaker effective input, while \(a\) controls the amount of pigment produced by the downstream signal\. These two parameters were fitted separately for each sensor, with \(K\), \(n\), and \(\\delta\) in the sixth equation held constant\.

To cover low densities, illustrative classification thresholds, and higher densities, we crossed six Mi levels with three Ce backgrounds, giving 18 synthetic pigment targets:

- **Mi:** 0, 5, 10, 40, 80, and 120 individuals per 100 cm³ of soil\.

- **Ce:** 0, 80, and 200 individuals per 100 cm³ of soil\.

Targets were calculated from the assumed ligand contributions and a common pigment\-output scale\. We then fitted interface parameters to approximate these endpoints\. All simulated readings were taken 8 h after stimulation\.

The adjusted ODE followed the overall target pattern, although responses at low stimulus levels remained below the linear targets\. We next examined whether these deviations affected target\-density estimation\. Regression training therefore used the actual ODE outputs, allowing the deviations to carry through to the dual\-channel evaluation\.

**Prescribed pigment endpoints were used to calibrate the ODE; actual ODE outputs were used to train the dual\-channel model\.**

To connect the model to the smartphone readout example, we subsequently set the 8 h total pigment targets to 0\.07–0\.56 mg/mL indicaxanthin equivalents\. This interval lies within the nonzero indicaxanthin standard range reported by Stücheli and colleagues \[7\]\. The 0\.07 mg/mL blank and the selected target interval were project assumptions\.

At this scale, we adjusted basal pigment production and uniformly rescaled net pigment production\. The production coefficients in the sixth equation were updated analytically, while the original \(K\_L\) values were retained\. The transformation was then checked by integrating the full ODE model\.

The resulting P3 and P18 endpoints spanned approximately 0\.070–0\.543 and 0\.070–0\.480 mg/mL, respectively\. The RMSEs against the 18 prescribed endpoints were 0\.009688 and 0\.009656 mg/mL\. This adjustment changed the output scale while preserving the response shape and relative deviations\. Actual basal and induced pigment yields in yeast require experimental measurement\.

![fig\-3\-2\-density\-response\.png](图片和附件/fig-3-2-density-response.png)

> **Figure 3\-2\. ODE pigment calibration at different background densities\.**
> Panels A and B show P3 and P18, respectively\. Colors distinguish Ce background densities\. Dashed lines with crosses indicate prescribed pigment targets, solid lines with circles indicate simulated 8 h total pigment concentrations, and gray dotted lines indicate the blank\.
> 
> 

In addition to endpoint comparisons, we examined pigment accumulation in blank, target\-only, background\-only, and mixed samples\. The respective \(\(\\mathrm\{Mi\},\\mathrm\{Ce\}\)\) densities were \(\(0,0\)\), \(\(120,0\)\), \(\(0,200\)\), and \(\(120,200\)\), in individuals per 100 cm³ of soil\.

To isolate the stimulus\-associated contribution, the matched blank for each channel was subtracted at every time point:

## C\_\{\\mathrm\{sample\},j\}\(t\)

C\_\{\\mathrm\{blank\},j\}\(t\)\.

\]

Different inputs produced different pigment\-accumulation trajectories through the shared signaling core\. Calibration was based on the 8 h endpoints; earlier trajectories are model predictions under the fixed parameters\.

![fig\-3\-3\-net\-timecourse\.png](图片和附件/fig-3-3-net-timecourse.png)

> **Figure 3\-3\. Net pigment accumulation in representative mixed samples\.**
> Panels A and B show simulated time courses for blank, Mi\-only, Ce\-only, and mixed samples in P3 and P18\. Net pigment is calculated by subtracting the matched channel blank at each time point\.
> 
> 

## 3\.5 Converting pigment concentration into simulated smartphone color features

The proposed readout uses smartphone images, so we introduced an observation relationship between pigment concentration and image features\. Stücheli and colleagues quantified indicaxanthin using the RGB blue channel of smartphone images acquired with a light\-shielding box, blue background, and cuvettes \[7\]\.

Their study used water as the blank and constructed a calibration curve from the negative logarithm of the blue\-channel intensity ratio, reporting a slope of \(0\.36\\pm0\.01\\ \\mathrm\{mL/mg\}\)\. We used the central slope value and assumed that samples and sensor blanks follow the same linear calibration\.

For each channel, we define:

\[

r\_j=

\\frac\{B\_\{\\mathrm\{sample\},j\}\}

\{B\_\{\\mathrm\{blank\},j\}\},

\]

c\_\{\\mathrm\{blank\},j\}

\\right\)\.

\]

Here, \(j\) denotes P3 or P18, \(B\) is the image blue\-channel intensity, and \(c\) is pigment concentration in mg/mL\. We use:

\[

k\_B=0\.36\\ \\mathrm\{mL/mg\}\.

\]

This transfers the published water\-blank calibration to a color difference relative to each sensor’s own blank\. Under the common linear\-calibration assumption, the intercept cancels through subtraction, and each feature describes the sample’s color change relative to its matched blank\.

The internal ODE pigment concentration \(C\), expressed in \(\\mu\\mathrm\{M\}\), is converted to mass concentration using the indicaxanthin molar mass of 308\.29 g/mol \[6\]:

\[

c=\\kappa C,

\\qquad

\\kappa=

3\.0829\\times10^\{\-4\}

\\ \\frac\{\\mathrm\{mg/mL\}\}\{\\mu\\mathrm\{M\}\}\.

\]

The ODE pigment outputs are converted to blue\-channel ratios \(r\_j\), then transformed into the logarithmic features \(x\_j\) used by the dual\-channel model\. These are simulated ratios; exposure variation, scattering, quantization, and device differences have not been included\. Actual imaging conditions require calibration using standards, samples, and matched blanks\.

The ODE describes pigment formation, while the observation relationship describes how pigment appears in the readout\. Keeping these components separate allows the observation interface to be updated when an experimental smartphone calibration becomes available\.

## 3\.6 Estimating target density from paired color readings

With the ODE and smartphone observation relationship fixed, we generated 45 paired readings by crossing different Mi and Ce densities:

- **Mi:** 0, 5, 10, 20, 40, 60, 80, 100, and 120 individuals per 100 cm³ of soil\.

- **Ce:** 0, 40, 80, 140, and 200 individuals per 100 cm³ of soil\.

Each sample corresponds to a point in a two\-dimensional color space, with the P3 feature \(x\_3\) on the horizontal axis and the P18 feature \(x\_\{18\}\) on the vertical axis\. This space allows us to compare the effects of increasing Ce at fixed Mi and increasing Mi at fixed Ce\. Differences between these directions provide a basis for using paired readings to distinguish target and background contributions\.

![fig\-3\-4\-signal\-space\.png](图片和附件/fig-3-4-signal-space.png)

> **Figure 3\-4\. Distribution of mixed samples in dual\-channel color space\.**
> The horizontal and vertical axes show the simulated P3 and P18 smartphone color indices\. Point color indicates Mi density\. Solid lines connect samples with fixed Mi density, while dashed lines connect samples with fixed Ce density\. Arrows indicate the directions of increasing Mi or Ce density\.
> 
> 

Using the two color features as predictors and known Mi density as the training label, we fitted:

\\beta\_0\+\\beta\_3x\_3\+\\beta\_\{18\}x\_\{18\}\.

\]

The intercept \(\\beta\_0\) describes the overall offset, while \(\\beta\_3\) and \(\\beta\_\{18\}\) jointly determine the contribution of the two channels\. Ordinary least squares was used to find one set of three coefficients that minimized the sum of squared differences between predicted and known Mi densities across the training samples\.

Ce density was used to construct background variation during training\. Prediction requires only the two color readings, allowing target density to be estimated without supplying the background count\.

The fitted regression was:

## 4\.335

1207\.944x\_3

\+

2109\.881x\_\{18\},

\]

with output in individuals per 100 cm³ of soil\.

These coefficients depend on the specified color features, readout conditions, and simulation range\. The negative P3 coefficient and positive P18 coefficient work together to compensate for part of the background contribution\. Their meaning comes from the joint relationship; neither channel independently represents one nematode species\.

To assess the contribution of the second channel, we compared P3\-only, P18\-only, and dual\-channel regression using the same training set and 19 additional simulated mixtures excluded from regression fitting\. Their evaluation RMSEs were 36\.591, 28\.429, and 3\.008 individuals per 100 cm³ of soil, respectively\. The lower dual\-channel error indicates that the paired responses helped distinguish target and background contributions under the assumed conditions\. All evaluation mixtures were generated by the same deterministic ODE model\.

*RMSE units: individuals per 100 cm³ of soil\.*

![fig\-3\-5\-prediction\-comparison\-wiki\.png](图片和附件/fig-3-5-prediction-comparison-wiki.png)

> **Figure 3\-5\. Mi density predictions and comparison of single\- and dual\-channel models\.**
> Panel A compares known and predicted Mi densities for the dual\-channel model; the dashed line indicates ideal agreement\. Panel B compares the RMSEs of P3\-only, P18\-only, and dual\-channel models on the same simulated evaluation set\.
> 
> 

For example, a simulated sample with Mi = 40 and Ce = 80 produced blue\-channel ratios relative to the respective blanks of approximately 0\.854 and 0\.879\. The model estimated Mi density at approximately 39\.72 individuals per 100 cm³ of soil\. Ce density was not required as a prediction input\. Under the Eco model’s illustrative rules, the estimate falls in the medium\-risk category\. This example connects the mixed sample, pathway\-driven pigment production, smartphone color features, and target\-density estimate\.

We also examined samples near the risk thresholds\. Small density errors can sometimes change the assigned category, so the interface checks the calibration range and indicates adjacent scenarios when an estimated interval crosses a threshold\. The current intervals are calculated from regression residuals; their coverage in measured samples remains to be evaluated\.

These results come from noise\-free simulations generated by the same ODE model and describe estimation performance under the specified secretion profiles, sensor responses, and observation relationship\. The evaluation mixtures mainly cover zero\-target conditions and densities near the illustrative classification thresholds\. Density predictions were essentially unchanged after introducing the smartphone observation interface, indicating that the new representation preserved the information in the original outputs\.

The ODE and dual\-channel models therefore serve complementary roles: the ODE calculates how mixed inputs produce paired color outputs, and the regression uses those outputs to estimate Mi density\. The code, parameter sources, fixed configurations, and example data support reproducibility and provide an interface for future paired experimental measurements\. The Eco model then examines how density information may affect management choices and expected benefits\.

## 3\.7 Parameter tables

The following tables summarize the parameters used for the signaling core, pigment module, and dual\-channel interpretation\. They distinguish source\-model values, project assumptions, analytical conversions, and parameters fitted to simulated data\.

### Table 3\-1\. Signaling\-core parameters

The core rate constants follow the estimated values in Supady’s Model B and were cross\-checked against the Delft supplement \[1,2\]\. They are parameters of the source model, rather than independently measured constants for the project strain\.

The Delft supplement lists the parameter corresponding to \(k\_\{91\}\) in s\(^\{\-1\}\), although its inactivation flux contains two concentration factors\. We therefore use \(\\mu\\mathrm\{M\}^\{\-1\}\\mathrm\{s\}^\{\-1\}\), retaining the numerical value of 0\.017\.

### Table 3\-2\. Input and pigment\-module parameters

Where channel values differ, P3 and P18 are listed separately\. Shared values apply to both channels\.

Pigment concentrations are expressed as indicaxanthin equivalents\. \(G\) is used to construct calibration targets, \(a\) is used in the sixth ODE, and \(K\_L\) is the effective response scale for the normalized input\.

### Table 3\-3\. Smartphone observation and dual\-channel regression parameters

The regression inputs are the dimensionless color indices:

\[

x\_j=

\-\\log\_\{10\}

\\left\(

\\frac\{B\_\{\\mathrm\{sample\},j\}\}

\{B\_\{\\mathrm\{blank\},j\}\}

\\right\)\.

\]

The coefficients apply to this input definition and return Mi density\. The published slope uncertainty is ±0\.01 mL/mg; the current deterministic simulation uses the central value without propagating that uncertainty\.

## References and source materials

1. Supady, A\. \(2009\)\. *Theoretical and computational analysis of negative feedback mechanisms and the dose\-response alignment in the pheromone signalling pathway of the yeast Saccharomyces cerevisiae*\. Bachelor’s thesis, Humboldt\-Universität zu Berlin\. Model B reactions, parameters, and initial conditions are given on PDF pages 48–49\. [Original thesis](https://rumo.biologie.hu-berlin.de/tbp/images/Theses/bsc_supady.pdf)\.

2. TU Delft iGEM Team\. \(2012\)\. *Single Cell Model; Reduced Model Details*\. Relevant source material: Tables 4\.1–4\.3 of the model supplement\.

3. Kaplan, F\., Srinivasan, J\., Mahanti, P\., et al\. \(2011\)\. Ascaroside Expression in *Caenorhabditis elegans* Is Strongly Dependent on Diet and Developmental Stage\. *PLOS ONE*, 6\(3\), e17804\. [doi:10\.1371/journal\.pone\.0017804](https://doi.org/10.1371/journal.pone.0017804)\.

4. Manosalva, P\., Manohar, M\., von Reuss, S\. H\., et al\. \(2015\)\. Conserved nematode signalling molecules elicit plant defenses and pathogen resistance\. *Nature Communications*, 6, 7795\. Secretion\-profile evidence is discussed in the first Results section, Supplementary Figure 1, and Supplementary Table 1\. [doi:10\.1038/ncomms8795](https://doi.org/10.1038/ncomms8795)\.

5. Fan, C\., He, N\., \& Yuan, J\. \(2024\)\. Cascaded amplifying circuit enables sensitive detection of fungal pathogens\. *Biosensors and Bioelectronics*, 250, 116058\. This work informs the cascaded amplification and betaxanthin output design\. Supplementary Figure S4 presents EGFP time courses\. [doi:10\.1016/j\.bios\.2024\.116058](https://doi.org/10.1016/j.bios.2024.116058)\.

6. National Center for Biotechnology Information\. *PubChem Compound Summary for CID 6096870, Indicaxanthin*\. The molar mass used here is 308\.29 g/mol\. [Compound record](https://pubchem.ncbi.nlm.nih.gov/compound/Indicaxanthin)\.

7. Stücheli, P\., Sieber, S\., Fuchs, D\. W\., et al\. \(2020\)\. Genetically encoded betaxanthin\-based small\-molecular fluorescent reporter for mammalian cells\. *Nucleic Acids Research*, 48\(12\), e67\. Smartphone quantification is described in “Smartphone\-based betaxanthin quantification” and Figure 4\. [doi:10\.1093/nar/gkaa342](https://doi.org/10.1093/nar/gkaa342)\.

8. Fan, C\., \& Yuan, J\. \(2023\)\. Reshaping the yeast galactose regulon via GPCR signaling cascade\. *Cell Reports Methods*, 3\(12\), 100647\. This work informs the sTF composed of a Ste12\-responsive domain and a Gal4 DNA\-binding domain, and its connection to the GAL system\. [doi:10\.1016/j\.crmeth\.2023\.100647](https://doi.org/10.1016/j.crmeth.2023.100647)\.

