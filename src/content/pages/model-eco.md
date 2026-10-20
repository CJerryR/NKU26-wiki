---
title: Economic Benefit
heading: Economic Benefit
sub: ''
crumbs:
  - Model
  - Economic Benefit
route: model-eco
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout model-manuscript" lang="en">

:::manuscriptTitle

Eco: from color readouts to management decisions

:::

<strong>When growers can already apply a uniform treatment, how much additional benefit can nematode density information provide?</strong>

We developed the NemaKlear interactive web tool to explore this question. It connects ODE simulations of color development, dual-channel density estimation, and economic analysis. Users can select simulated soil samples or enter paired absorbance readings, estimate target nematode density, and compare net income across management strategies for a single growing season.

<figure class="wiki-media wiki-media--html wiki-media--application"><div class="wiki-media__bar"><span class="wiki-media__kind">Model explorer</span><span class="wiki-media__title">NemaKlear: ODE, dual-channel modeling and economic analysis</span><a class="wiki-media__action" href="/widgets/nemaklear/index.html" target="_blank" rel="noopener noreferrer">Open full page</a></div><iframe class="wiki-media__frame" data-nemaklear-app src="/widgets/nemaklear/index.html?embed=1" title="NemaKlear: ODE, dual-channel modeling and economic analysis" loading="eager" allow="clipboard-write; fullscreen" style="height:900px" referrerpolicy="no-referrer"></iframe></figure>

Eco links density to potential yield loss, treatment costs, and testing costs. It examines when density information changes a management decision and whether the resulting benefit covers the cost of testing and adjusting treatment.

## Exploring the path from color to net income {#src-Model-Eco-4 toc="Exploring the path from color to net income"}

NemaKlear follows a four-step workflow:

<strong>Color response → Density estimate → Management choice → Economic outcome</strong>

The tool offers two input modes:

<strong>Simulated soil samples:</strong> Select a sample to explore color development over time in both channels and the corresponding density estimate.

<strong>Manual readings:</strong> Enter paired absorbance readings at 480 nm (A480) to estimate density directly. In this mode, ODE curves are displayed for reference.

The results bring together the management tier, potential yield loss, and net-income tables and curves for three scenarios: no testing and no control, uniform treatment without testing, and test-guided treatment. Users can compare the density point estimate with the prediction-interval endpoints and, when the interval crosses a management threshold, inspect scenarios on either side.

These comparisons show how testing may reduce unnecessary treatment at low densities, add a cost when it leaves treatment unchanged, or support a more effective treatment at higher densities. A full report provides model parameters, sensitivity analyses, and downloadable results for further review.

## Connecting color readouts and economics through density {#src-Model-Eco-15 toc="Connecting color readouts and economics through density"}

The three models perform consecutive tasks. The ODE model describes how receptor input produces a color response through intracellular signaling. The dual-channel model uses paired color features to estimate the density of the southern root-knot nematode, <em>Meloidogyne incognita</em>, while accounting for signals contributed by background nematodes. Eco then combines the density estimate with crop and management parameters to calculate economic outcomes.

For simulated soil samples, the calculation proceeds as follows:

<strong>ODE color output → Endpoint absorbance and blank correction → Dual-channel density regression → Economic comparison of management scenarios</strong>

Density is expressed as second-stage juveniles per 100 cm³ of soil (J2/100 cm³). Both readings undergo the same processing used for calibration. Unit and applicability checks are performed before the regression output enters Eco. Economic parameters come independently from literature and scenario assumptions; density connects the color readout to the economic calculation.

The interface retains both the density point estimate and its regression prediction interval. If the interval crosses a management threshold, the tool evaluates scenarios on both sides to show how treatment choice and net income may change. Negative estimates and values outside the calibration or economic model range are blocked from further calculation. The interface also displays the calibration status and applicable conditions.

## Calculating yield loss and net income {#src-Model-Eco-21 toc="Calculating yield loss and net income"}

Our demonstration considers protected tomato production in Spain affected by <em>M. incognita</em>. It uses pre-plant nematode density and calculates net income per hectare for one growing season.

We describe the relationship between density and relative yield using a Seinhorst model, with parameters from the spring experiment on ungrafted tomato reported by Expósito et al. (2020) <sup>[1]</sup>. Below the tolerance density, predicted relative yield remains at its baseline level. Above this density, relative yield declines toward a lower limit. In our example, the converted tolerance density is <strong>6 J2/100 cm³</strong> and the minimum relative yield is <strong>0.34</strong>.

The economic calculation is:

<strong>Seasonal net income = Revenue after residual nematode damage − Base production cost − Treatment cost − Testing cost</strong>

Economic and treatment inputs draw on Talavera-Rubia et al. (2022) <sup>[2]</sup>. To represent treatment effects, we first apply the reported population-reduction rates at a reference density of <strong>100 J2/100 cm³</strong>. We then use the density–yield relationship to calculate the fraction of yield loss avoided. This fraction is held constant across density scenarios, a simplifying assumption of the demonstration.

The model combines yield relationships and economic parameters from different studies into a reproducible literature-based scenario. Testing costs are set at <strong>EUR 5/ha</strong> as a team assumption. Sources for prices, treatment costs, and derived treatment effects are retained so that these inputs can be updated for a specific application.

## Comparing test-guided treatment with two baselines {#src-Model-Eco-28 toc="Comparing test-guided treatment with two baselines"}

An increase in income after testing can reflect both the benefit of nematode control and the benefit of choosing treatment using density information. To distinguish these effects, we compare three scenarios:

<div class="model-table-scroll" tabindex="0"><table class="model-source-table"><thead><tr><th scope="col">Scenario</th><th scope="col">Management approach</th></tr></thead><tbody><tr><td>No testing, no control</td><td>No additional nematode-specific treatment</td></tr><tr><td>No testing, uniform treatment</td><td>The same fluopyram program is applied regardless of density</td></tr><tr><td>Test-guided treatment</td><td>The density estimate determines whether to use no dedicated control, a medium-tier treatment, or a high-tier treatment</td></tr></tbody></table></div>

The test-guided scenario follows the preset rules below. Treatment options are drawn from the literature <sup>[2]</sup>.

The management thresholds of <strong>10 and 80 J2/100 cm³</strong> are preset decision rules. They serve a different purpose from the yield model’s tolerance density of <strong>6 J2/100 cm³</strong>. The model separately compares the net income of all candidate treatments to check whether the preset choice matches the highest-income option under the current parameters.

We calculate two net-income differences:

<strong>Benefit relative to no control</strong>= Net income with test-guided treatment − Net income without testing or control.

<strong>Benefit relative to uniform treatment</strong>= Net income with test-guided treatment − Net income with uniform treatment without testing.

The first comparison evaluates the combined testing-and-control program. The second measures the conditional additional benefit of using density information when uniform treatment is already available. Reporting both makes the source of the economic benefit explicit.

## When is density information worth obtaining? {#src-Model-Eco-40 toc="When is density information worth obtaining?"}

At <strong>100 J2/100 cm³</strong>, with all other inputs held at their example values, the model gives:

<div class="model-table-scroll" tabindex="0"><table class="model-source-table"><thead><tr><th scope="col">Comparison baseline</th><th scope="col">Increase in seasonal net income with test-guided treatment</th></tr></thead><tbody><tr><td>No testing, no control</td><td>EUR 17,028.48/ha</td></tr><tr><td>No testing, uniform treatment</td><td>EUR 496.26/ha</td></tr></tbody></table></div>

The <strong>EUR 17,028.48/ha</strong> increase represents the benefit of the combined program relative to leaving nematodes untreated. The <strong>EUR 496.26/ha</strong> increase represents the additional benefit of changing treatment relative to the uniform-treatment baseline. In this scenario, the extra losses avoided by the high-tier treatment cover both the additional treatment expense and the testing cost.

The role of density information changes across the density range:

<strong>At low densities,</strong> testing may help avoid unnecessary treatment.

<strong>At intermediate densities,</strong> test-guided and uniform management use the same treatment. Their net-income difference is <strong>−EUR 5/ha</strong>, equal to the added testing cost.

<strong>At high densities,</strong> a more effective treatment is worthwhile when the additional losses avoided exceed its additional cost, including testing.

We also vary testing costs, treatment costs, treatment effects, and crop prices individually to examine the sensitivity of both comparisons. When the two strategies use the same treatment, shared cost and efficacy parameters change together to keep the comparison consistent.

These calculations are conditional on the specified density, costs, and treatment effects. The current density prediction interval describes uncertainty in the simulated regression; its coverage requires validation using real samples and measured readouts. Evaluating interval endpoints and neighboring density scenarios shows how economic results depend on the density estimate. The resulting range of net incomes is not a confidence interval for economic benefit. Assessing the economic consequences of actual testing errors will require measured error distributions and their effects on treatment selection.

## Using economic analysis to inform detection design {#src-Model-Eco-52 toc="Using economic analysis to inform detection design"}

Eco identifies density ranges where measurement can change a management decision. Semiquantitative or quantitative readouts are useful when they distinguish between ranges that call for different treatments. Estimates near management thresholds deserve particular attention because an error can change the selected treatment and its economic outcome.

The interface therefore presents the density estimate, management tier, and both economic comparisons together. When the estimated range crosses a threshold, neighboring scenarios show how strongly the conclusion depends on density estimation.

Future work will calibrate density estimates using real samples and smartphone readouts, while application-focused research will update sampling coverage, testing costs per hectare, and management parameters. These data will help establish whether the readout can distinguish the relevant density ranges at a reasonable cost.

To support reuse, we store parameter configurations separately from the calculation code and provide example inputs and reports that can be regenerated. Existing automated checks cover density–loss calculations, cost accounting, and consistency between comparison baselines. Local data are still needed to evaluate practical economic benefits. Researchers can adapt the framework by replacing crop, price, and treatment parameters to assess detection strategies under their own management conditions.

## References {#src-Model-Eco-57 toc="References"}

[1] Expósito, A., Pujolà, M., Achaerandio, I., Giné, A., Escudero, N., Fullana, A. M., Cunquero, M., Loza-Alvarez, P., &amp; Sorribas, F. J. (2020). Tomato and Melon <em>Meloidogyne</em> Resistant Rootstocks Improve Crop Yield but Melon Fruit Quality Is Influenced by the Cropping Season. <em>Frontiers in Plant Science, 11</em>, 560024. https://doi.org/10.3389/fpls.2020.560024

[2] Talavera-Rubia, M., Vela-Delgado, M. D., &amp; Verdejo-Lucas, S. (2022). A Cost-Benefit Analysis of Soil Disinfestation Methods against Root-Knot Nematodes in Mediterranean Intensive Horticulture. <em>Plants, 11</em>(20), 2774. https://doi.org/10.3390/plants11202774

</div>
