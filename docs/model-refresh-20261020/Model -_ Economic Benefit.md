# Model \-\> Economic Benefit

# Eco: From Color Readouts to Management Decisions

**When growers can already apply a uniform treatment, how much additional benefit can nematode density information provide?**

We developed the NemaKlear interactive web tool to explore this question\. It connects ODE simulations of color development, dual\-channel density estimation, and economic analysis\. Users can select simulated soil samples or enter paired absorbance readings, estimate target nematode density, and compare net income across management strategies for a single growing season\.

【此处插入网页】

Eco links density to potential yield loss, treatment costs, and testing costs\. It examines when density information changes a management decision and whether the resulting benefit covers the cost of testing and adjusting treatment\.

## 4\.1 Exploring the Path from Color to Net Income

NemaKlear follows a four\-step workflow:

**Color response → Density estimate → Management choice → Economic outcome**

The tool offers two input modes:

- **Simulated soil samples:** Select a sample to explore color development over time in both channels and the corresponding density estimate\.

- **Manual readings:** Enter paired absorbance readings at 480 nm \(A480\) to estimate density directly\. In this mode, ODE curves are displayed for reference\.

The results bring together the management tier, potential yield loss, and net\-income tables and curves for three scenarios: no testing and no control, uniform treatment without testing, and test\-guided treatment\. Users can compare the density point estimate with the prediction\-interval endpoints and, when the interval crosses a management threshold, inspect scenarios on either side\.

These comparisons show how testing may reduce unnecessary treatment at low densities, add a cost when it leaves treatment unchanged, or support a more effective treatment at higher densities\. A full report provides model parameters, sensitivity analyses, and downloadable results for further review\.

## 4\.2 Connecting Color Readouts and Economics through Density

The three models perform consecutive tasks\. The ODE model describes how receptor input produces a color response through intracellular signaling\. The dual\-channel model uses paired color features to estimate the density of the southern root\-knot nematode, *Meloidogyne incognita*, while accounting for signals contributed by background nematodes\. Eco then combines the density estimate with crop and management parameters to calculate economic outcomes\.

For simulated soil samples, the calculation proceeds as follows:

**ODE color output → Endpoint absorbance and blank correction → Dual\-channel density regression → Economic comparison of management scenarios**

Density is expressed as second\-stage juveniles per 100 cm³ of soil \(J2/100 cm³\)\. Both readings undergo the same processing used for calibration\. Unit and applicability checks are performed before the regression output enters Eco\. Economic parameters come independently from literature and scenario assumptions; density connects the color readout to the economic calculation\.

The interface retains both the density point estimate and its regression prediction interval\. If the interval crosses a management threshold, the tool evaluates scenarios on both sides to show how treatment choice and net income may change\. Negative estimates and values outside the calibration or economic model range are blocked from further calculation\. The interface also displays the calibration status and applicable conditions\.

## 4\.3 Calculating Yield Loss and Net Income

Our demonstration considers protected tomato production in Spain affected by *M\. incognita*\. It uses pre\-plant nematode density and calculates net income per hectare for one growing season\.

We describe the relationship between density and relative yield using a Seinhorst model, with parameters from the spring experiment on ungrafted tomato reported by Expósito et al\. \(2020\) \[1\]\. Below the tolerance density, predicted relative yield remains at its baseline level\. Above this density, relative yield declines toward a lower limit\. In our example, the converted tolerance density is **6 J2/100 cm³** and the minimum relative yield is **0\.34**\.

The economic calculation is:

**Seasonal net income = Revenue after residual nematode damage − Base production cost − Treatment cost − Testing cost**

Economic and treatment inputs draw on Talavera\-Rubia et al\. \(2022\) \[2\]\. To represent treatment effects, we first apply the reported population\-reduction rates at a reference density of **100 J2/100 cm³**\. We then use the density–yield relationship to calculate the fraction of yield loss avoided\. This fraction is held constant across density scenarios, a simplifying assumption of the demonstration\.

The model combines yield relationships and economic parameters from different studies into a reproducible literature\-based scenario\. Testing costs are set at **EUR 5/ha** as a team assumption\. Sources for prices, treatment costs, and derived treatment effects are retained so that these inputs can be updated for a specific application\.

## 4\.4 Comparing Test\-Guided Treatment with Two Baselines

An increase in income after testing can reflect both the benefit of nematode control and the benefit of choosing treatment using density information\. To distinguish these effects, we compare three scenarios:

The test\-guided scenario follows the preset rules below\. Treatment options are drawn from the literature \[2\]\.

The management thresholds of **10 and 80 J2/100 cm³** are preset decision rules\. They serve a different purpose from the yield model’s tolerance density of **6 J2/100 cm³**\. The model separately compares the net income of all candidate treatments to check whether the preset choice matches the highest\-income option under the current parameters\.

We calculate two net\-income differences:

**Benefit relative to no control**
= Net income with test\-guided treatment − Net income without testing or control\.

**Benefit relative to uniform treatment**
= Net income with test\-guided treatment − Net income with uniform treatment without testing\.

The first comparison evaluates the combined testing\-and\-control program\. The second measures the conditional additional benefit of using density information when uniform treatment is already available\. Reporting both makes the source of the economic benefit explicit\.

## 4\.5 When Is Density Information Worth Obtaining?

At **100 J2/100 cm³**, with all other inputs held at their example values, the model gives:

The **EUR 17,028\.48/ha** increase represents the benefit of the combined program relative to leaving nematodes untreated\. The **EUR 496\.26/ha** increase represents the additional benefit of changing treatment relative to the uniform\-treatment baseline\. In this scenario, the extra losses avoided by the high\-tier treatment cover both the additional treatment expense and the testing cost\.

The role of density information changes across the density range:

- **At low densities,** testing may help avoid unnecessary treatment\.

- **At intermediate densities,** test\-guided and uniform management use the same treatment\. Their net\-income difference is **−EUR 5/ha**, equal to the added testing cost\.

- **At high densities,** a more effective treatment is worthwhile when the additional losses avoided exceed its additional cost, including testing\.

We also vary testing costs, treatment costs, treatment effects, and crop prices individually to examine the sensitivity of both comparisons\. When the two strategies use the same treatment, shared cost and efficacy parameters change together to keep the comparison consistent\.

These calculations are conditional on the specified density, costs, and treatment effects\. The current density prediction interval describes uncertainty in the simulated regression; its coverage requires validation using real samples and measured readouts\. Evaluating interval endpoints and neighboring density scenarios shows how economic results depend on the density estimate\. The resulting range of net incomes is not a confidence interval for economic benefit\. Assessing the economic consequences of actual testing errors will require measured error distributions and their effects on treatment selection\.

## 4\.6 Using Economic Analysis to Inform Detection Design

Eco identifies density ranges where measurement can change a management decision\. Semiquantitative or quantitative readouts are useful when they distinguish between ranges that call for different treatments\. Estimates near management thresholds deserve particular attention because an error can change the selected treatment and its economic outcome\.

The interface therefore presents the density estimate, management tier, and both economic comparisons together\. When the estimated range crosses a threshold, neighboring scenarios show how strongly the conclusion depends on density estimation\.

Future work will calibrate density estimates using real samples and smartphone readouts, while application\-focused research will update sampling coverage, testing costs per hectare, and management parameters\. These data will help establish whether the readout can distinguish the relevant density ranges at a reasonable cost\.

To support reuse, we store parameter configurations separately from the calculation code and provide example inputs and reports that can be regenerated\. Existing automated checks cover density–loss calculations, cost accounting, and consistency between comparison baselines\. Local data are still needed to evaluate practical economic benefits\. Researchers can adapt the framework by replacing crop, price, and treatment parameters to assess detection strategies under their own management conditions\.

## References

\[1\] Expósito, A\., Pujolà, M\., Achaerandio, I\., Giné, A\., Escudero, N\., Fullana, A\. M\., Cunquero, M\., Loza\-Alvarez, P\., \& Sorribas, F\. J\. \(2020\)\. Tomato and Melon *Meloidogyne* Resistant Rootstocks Improve Crop Yield but Melon Fruit Quality Is Influenced by the Cropping Season\. *Frontiers in Plant Science, 11*, 560024\. [https://doi\.org/10\.3389/fpls\.2020\.560024](https://doi.org/10.3389/fpls.2020.560024)

\[2\] Talavera\-Rubia, M\., Vela\-Delgado, M\. D\., \& Verdejo\-Lucas, S\. \(2022\)\. A Cost\-Benefit Analysis of Soil Disinfestation Methods against Root\-Knot Nematodes in Mediterranean Intensive Horticulture\. *Plants, 11*\(20\), 2774\. [https://doi\.org/10\.3390/plants11202774](https://doi.org/10.3390/plants11202774)

