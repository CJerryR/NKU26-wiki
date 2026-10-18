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
:::note[翻译未校对]
Translation not proofread.
:::

## 4. Eco | How density information supports management decisions {#eco-introduction toc="4. Eco | How density information supports management decisions"}

The preceding models connect receptor recognition to an interpretable color signal and estimate target-nematode density through two-channel readings. Having obtained this information, we further ask: when growers can already choose uniform treatment, what additional value does knowing nematode density provide?

We established an economic-benefit model linking density to potential yield loss, treatment costs and testing costs, and comparing the net income from different management approaches over a single production season. As the comparison developed, the focus also moved from “whether testing and control can cover their costs” to “whether density information changes action, and when that change is worthwhile.”

## 4.1 Using density as the interface between signal interpretation and economic comparison {#eco-interface toc="4.1 Using density as the interface between signal interpretation and economic comparison"}

ODE, the two-channel model and Eco perform three consecutive tasks. ODE describes how receptor input passes through the intracellular pathway to form a color output; the two-channel model uses two color features to estimate southern root-knot nematode density while background nematodes also contribute to the signal; Eco receives this density and combines it with cultivation and management parameters to compare economic outcomes.

The interface between the three can be summarized as follows:

ODE color output → two-channel color features and density regression → target-density estimate → Eco management-scenario comparison.

In the current example, density is consistently expressed as the number of second-stage juveniles per 100 cm³ of soil (J2/100 cm³). The two readings are processed in the same way as in calibration, and the regression output enters Eco after checks on units and the applicable range. Eco’s economic parameters come independently from the literature and scenario settings; color and income are connected through density as the intermediate quantity.

The current simulated interface retains both a density point estimate and its regression prediction interval. When the interval crosses a management-tier boundary, the program calculates scenarios on both sides of the boundary to show how treatment choices and income comparisons may change. Results with negative density, outside the calibration range, or outside the range supported by the economic model are stopped from being passed downstream. The current interval reflects the formal uncertainty of the simulated regression; its coverage for actual measurements still needs to be tested through calibration with real samples and readings.

## 4.2 Estimating yield loss and net income from nematode density {#eco-economics toc="4.2 Estimating yield loss and net income from nematode density"}

We selected protected tomato production in Spain and southern root-knot nematodes as a specific example, using preplant density as the input and calculating income per hectare over one production season.

The relationship between density and relative yield uses the Seinhorst loss relationship, with parameters based on the fitted spring-season results for ungrafted tomato reported by Expósito et al. (2020). This relationship describes a response with a tolerance level: at low density, the model predicts that yield remains at the normal level; above the tolerance level, relative yield decreases as density increases and gradually approaches a lower bound. The tolerance density used in the example is 6 J2/100 cm³ after conversion, and the minimum relative yield is 0.34. [Expósito et al., 2020](https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2020.560024/full)

After obtaining potential yield loss, we introduced crop selling price, baseline production cost, treatment cost and treatment effect, and calculated income using the following relationship:

Net income over one production season = sales revenue after the remaining nematode loss − baseline production cost − treatment cost − testing cost.

Economic and treatment information refers to the study by Talavera-Rubia et al. (2022). The population reduction reported in the literature is first converted into a proportion of loss avoided through the density–yield relationship at a reference density of 100 J2/100 cm³, and is then held fixed for the different density scenarios in this example. This simplifies the comparison and also makes the results depend on the fixed-effect assumption. [Talavera-Rubia et al., 2022](https://doi.org/10.3390/plants11202774)

The model combines yield relationships and economic parameters from different studies to form a reproducible literature scenario. Testing cost is provisionally set at 5 EUR/ha as a team assumption; the sources of literature prices, treatment costs and converted effects are retained for subsequent updates according to actual application conditions.

## 4.3 Distinguishing control benefits from information value through two comparison baselines {#eco-baselines toc="4.3 Distinguishing control benefits from information value through two comparison baselines"}

We first compare “no testing, no treatment” with “graded treatment after testing.” This comparison can answer whether the entire testing-and-control program improves income, but it also includes the loss avoided by treatment itself. To further assess the value provided by density information, we added the “no testing, uniform treatment” scenario.

In the example, uniform treatment uses the fluopyram program from the literature. Graded treatment is selected according to density: below 10 J2/100 cm³, no additional dedicated control is used; from 10 to below 80, middle-tier treatment is used; at 80 and above, high-tier treatment is used. The middle tier uses the same program as uniform treatment, while the high tier uses chicken-manure biosolarization.

The values 10 and 80 are preset management-tier boundaries and have a different meaning from the tolerance density in the yield curve. The model separately compares the net income of the candidate programs to check whether the preset choice agrees with the option giving the highest income under the current parameters.

We therefore calculate two income differences separately:

Improvement relative to no treatment reflects the overall benefit of testing and graded treatment;

Improvement relative to uniform treatment reflects the conditional value of using density information to adjust action when a treatment option already exists.

Keeping the two baselines separate allows us to further assess whether increased income comes from undertaking control or from adjusting the treatment approach after obtaining information.

## 4.4 Examining when information has value through representative scenarios {#eco-example toc="4.4 Examining when information has value through representative scenarios"}

At a density of 100 J2/100 cm³, with the other parameters kept at the example configuration, the model gives the following results.

| Management scenario | Net seasonal income (EUR/ha) |
| --- | ---: |
| No testing, no control | −1,828.19 |
| No testing, uniform control | 14,704.03 |
| Testing, graded treatment | 15,200.29 |

Graded treatment after testing increases income by approximately 17,028.48 EUR/ha relative to no treatment and by approximately 496.26 EUR/ha relative to uniform treatment. The difference between these two values shows that assessing testing value requires an explicit comparator. In this scenario, the additional loss avoided by stronger treatment covers the increased treatment and testing costs.

The role of information also changes with density. At low density, testing may help reduce unnecessary treatment; in the middle-density range, the graded program is the same as uniform treatment, so the modeled income difference is −5 EUR/ha, the additional testing cost. At high density, whether stronger treatment is worthwhile depends on whether the additional loss avoided covers the cost.

These results led us to focus the evaluation on whether density information changed the management choice. We further varied testing cost, treatment cost, treatment effect and crop selling price separately to examine how the two income differences changed. When the graded program and uniform treatment used the same measure, their shared cost and effect parameters were adjusted together to keep the comparison conditions consistent. These one-factor scenarios examine the sensitivity of the conclusions to the assumptions.

The above income calculations are conditional on the given density and the cost and effect assumptions. Real detection errors may lead to treatment choices that differ from the program appropriate for the actual density; their economic effects still need to be evaluated using measured error distributions.

## 4.5 Feeding economic comparisons back into detection design {#eco-design toc="4.5 Feeding economic comparisons back into detection design"}

The economic model further clarified the requirements for detection outputs: when different densities correspond to different treatment approaches, semi-quantitative or quantitative information is more useful for supporting management tiers. In particular, estimation bias in density ranges where action may change affects program selection, so these regions should be priorities for subsequent calibration and evaluation.

This understanding also influenced how results are presented. We retain the density estimate, corresponding management tier and income comparisons against both baselines together; when the estimated range crosses a tier boundary, neighboring scenarios are displayed to help users understand the dependence of the results on the density interpretation.

Subsequent work will calibrate density estimates using real samples and phone readings, and update sampling coverage, testing cost per hectare and management parameters through application research. New data will test both whether the front-end readings sufficiently distinguish the relevant density ranges and whether the cost of obtaining this information is reasonable.

We store parameter configurations separately from the calculation program and provide example inputs and reproducible reports. Existing automated checks cover density–loss calculations, cost calculations and the consistency of comparison baselines; actual application benefits still need to be tested using local data. Other researchers can replace crop, price and treatment parameters within this framework to evaluate the value of their detection programs under specific management conditions.

## 4.6 Exploring the connection from color development to income through an interactive webpage {#eco-explorer toc="4.6 Exploring the connection from color development to income through an interactive webpage"}

To let readers directly observe how the preceding models connect, we integrated ODE, dual-channel density estimation and Eco scenario comparison into the NemaKlear interactive webpage. Readers can select different simulated soil samples and view the two color responses, target-density estimates and corresponding economic results in sequence, exploring how changes in sample composition affect subsequent interpretation.

The webpage provides two input modes: simulated soil samples and manual absorbance. After a simulated sample is selected, the program solves the two ODEs, displays color development over time, and passes the blank-corrected endpoint absorbances to the dual-channel regression. Manual mode allows two A480 readings to be entered directly for density estimation; ODE curves in this mode are shown as references.

After obtaining the density estimate, the webpage jointly displays the management grade, potential yield loss, net-income tables and income curves for three management scenarios. Readers can compare changes relative to both no control and uniform control, and switch among the point estimate, prediction-interval endpoints and neighboring scenarios where a grading boundary is crossed, observing how density interpretation affects treatment choice and economic results.

These interactions continue the question of this chapter: after density information is obtained, does the treatment plan change, and how much additional income does that change bring? The page labels the simulated-calibration status and conditional interpretation beyond the calibration range. Income at different densities is used for scenario comparison; its variation does not constitute a confidence interval for income. Readers can also open the full report to inspect parameters and sensitivity analysis, or download the calculation results for review.

<div data-nemaklear-original></div>

<span id="eco-references" aria-hidden="true"></span>
