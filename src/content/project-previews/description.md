---
title: Description
heading: Description
sub: ''
description: ''
route: description
crumbs:
  - Project
  - Description
search: true
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div class="reading-layout" lang="en">

<p class="manuscript-title">NemaKlear: making nematode screening easier to use</p>

NemaKlear is developing a yeast-based biosensing kit for preliminary screening of agricultural nematode risk. Our approach uses engineered yeast to sense ascarosides, small molecules released by nematodes, and turn these chemical signals into a visible yellow color. By combining readings from two sensors with computational models, we explore how these signals could help assess the risk posed by <strong>plant-parasitic nematodes (PPNs)</strong>.

**Our central goal is to lower the practical barriers to testing.** We are developing a kit built around freeze-dried yeast test strips, with a straightforward workflow and an easy-to-read output. We want growers and agricultural service providers to obtain useful clues about nematode risk at key moments, including before planting, and use those clues to guide further diagnosis and management.

:::figure

![Figure 1. From nematode signals to practical screening.](https://static.igem.wiki/teams/6303/wiki/release-20261020/engineering-figure-1-b7206774cd.webp)

Figure 1. From nematode signals to practical screening. NemaKlear brings biosensor design, paired readouts, and kit development into a shared Design–Build–Test–Learn cycle. Agricultural needs and stakeholder feedback guide each revision toward a kit that is easy to use and helps inform decisions before planting. Generated with OpenAI GPT Image 2.

:::

## Project overview {#description-project-overview toc="Project overview"}

### 1.1 Starting with the decision a grower needs to make {#description-starting-with-the-decision-a-grower-needs-to-make toc="Starting with the decision a grower needs to make" toc-unnumbered}

PPNs live in soil and roots. Symptoms above ground often give little indication of what is happening below. For growers, a test is useful when it provides information in time to help with the next management decision.

Established detection methods provide valuable information about nematodes, but their practical requirements can make routine testing difficult outside specialist settings. Microscopic identification relies on trained operators, while laboratory molecular testing often requires specialized equipment and sample preparation. NemaKlear focuses on making initial screening more accessible through a test-strip format supported by clear sampling, reading, and handling instructions. Our intended place is an accessible first step in a workflow that includes professional confirmation when needed. [Explore the scientific background →](/background/)

::::evidence{place=right size=wide}

Questionnaires, conversations with growers, and interviews with plant-protection experts helped us make this goal more concrete. Respondents valued straightforward operation, reliable results, and affordability. Experts also connected the timing of detection with decisions made before planting.

[![Figure 2. Team members talking with a grower in a greenhouse.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-40-f25a55a93d29.webp)](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-40-f25a55a93d29.webp "Open full-resolution image")

:::caption

Figure 2. Conversations with growers help us understand practical needs for nematode screening.

:::

::::

These perspectives gave “early warning” a specific purpose: could information about nematode risk help growers plan planting and consider soil treatment? This question shapes what our sensors need to measure, how results should be presented, and how the testing process should work. [Explore the needs and feedback behind our design →](/human-practices/)

:::figure

![Figure 3. Discussion with Yurong Yao.](https://static.igem.wiki/teams/6303/wiki/project-20261021/project-41-5a3f3ece2c07.webp)

Figure 3. Our discussion with Yurong Yao connects sampling and testing procedures with practical agricultural needs.

:::

### 1.2 Looking for chemical clues in the soil {#description-looking-for-chemical-clues-in-the-soil toc="Looking for chemical clues in the soil" toc-unnumbered}

Nematodes release a family of small signaling molecules called ascarosides. We focus on two of them, <strong>ascaroside #3 (ascr#3)</strong> and <strong>ascaroside #18 (ascr#18)</strong>, and use differences in their relative abundance as a starting point for investigating signals from target and background nematodes.

In real soil, several types of nematodes may contribute to the same chemical signals. We therefore designed a dual-channel sensing approach: two sensors with different response preferences, tested against the same sample. We aim to learn more from their paired responses than either response could tell us alone. [Explore the basis of our two-signal approach →](/background/)

The idea begins with nematode-trapping fungi, which can sense chemical signals released by their prey. We chose one of their receptors, GPR2, as our main engineering target. Molecular docking helps us compare predicted positions and contacts of the two ascarosides within the receptor and propose mutations. <strong>Molecular dynamics (MD)</strong> simulations then let us examine how those contacts change in a membrane environment.

Together, these calculations provide specific hypotheses for receptor construction and response testing, keeping molecular design focused on the needs of the dual-channel system. [Explore our receptor design →](/model-docking/)

### 1.3 Turning chemical signals into readable color {#description-turning-chemical-signals-into-readable-color toc="Turning chemical signals into readable color" toc-unnumbered}

To make recognition visible, we use baker’s yeast, <strong><em>Saccharomyces cerevisiae</em> (<em>S.c</em>)</strong>, as the host for a system connecting a foreign receptor, intracellular signaling, and production of the yellow pigment betaxanthin. In this design, a signal received by the receptor travels through the yeast signaling pathway. A <strong>synthetic transcription factor (sTF)</strong> links that pathway to pigment production, giving the system a visible output.

We have worked along this chain by examining receptor expression and localization, engineering the yeast host, and constructing the pigment-production module. Alongside these experiments, an <strong>ordinary differential equation (ODE)</strong> model describes how an input signal develops into color over time. It helps us examine whether different inputs can produce distinguishable outputs and identify the dose-response measurements, blanks, and time courses needed for calibration. [Explore our experimental work →](/results/) · [Explore our signaling model →](/model-ode/)

To move toward a portable kit, we have also tested strip materials, cell immobilization, freeze-drying protection, and conditions for yeast revival and color development. We have made a holder for the strips. Each step addresses the same practical need: enabling biological sensing on a carrier that is easy to handle and read. [Explore our test strip development →](/results/)

### 1.4 Making the color useful {#description-making-the-color-useful toc="Making the color useful" toc-unnumbered}

A similar color intensity could arise from different combinations of target and background nematodes. We therefore analyze the two sensor responses together. Using simulations, we explore whether paired readings can estimate the density of the southern root-knot nematode when the number of background nematodes is unknown.

This model connects receptor responses, signal transmission, and color readings, while providing a framework for future calibration with real mixed samples. [Explore our dual-channel model →](/model-ode/)

A density estimate raises another question: would knowing it change a management decision? Our economic model connects nematode density with potential yield loss, testing expenses, and treatment costs. It compares scenarios including no treatment, uniform treatment, and treatment adjusted to the detected risk level.

These comparisons feed back into the design of the test: which density ranges matter most, how much measurement error could change a decision, and whether the information is worth the cost of obtaining it. [Explore the value of detection information →](/model-eco/)

### 1.5 Bringing the whole process back to the field {#description-bringing-the-whole-process-back-to-the-field toc="Bringing the whole process back to the field" toc-unnumbered}

A low barrier to use depends on the whole testing process. Collecting a meaningful sample, preparing it, reading the result, and safely disposing of the materials all need to be manageable.

Expert discussions raised questions about representative sampling, soil background color, ascaroside stability, and disposal of engineered yeast. These questions entered our experimental and modeling discussions. Our soil collection and sampling guidance connect samples with information about crops, locations, and treatment histories, preparing the ground for testing under real environmental conditions. [Explore our field visits and expert discussions →](/hp-investigation/)

::::evidence{place=right size=wide}

Through age-adapted lessons, picture books, and outreach activities, we also explain soil nematodes, biological signals, and the principles behind our test. These activities help audiences understand what evidence is needed to interpret an observation. Industry discussions let us explore potential users, application conditions, and partnerships needed for further development. The project continues to take shape through feedback from laboratory research, agricultural practice, and public engagement. [Explore our education activities →](/education/) · [Explore our industry engagement →](/hp-industry/)

[![Figure 4. A classroom lesson about soil nematodes and crop diseases.](https://static.igem.wiki/teams/6303/wiki/hp-20261021/classroom-85d0f4d1c7a8.avif)](https://static.igem.wiki/teams/6303/wiki/hp-20261021/classroom-85d0f4d1c7a8.avif "Open full-resolution image")

:::caption

Figure 4. Students explore soil nematodes and crop diseases through an interactive lesson.

:::

::::

The path we are working toward runs from soil sampling, through biological sensing and color readings, to risk information that can support further confirmation and management discussions. Our next steps are to calibrate sensor responses and models with real samples and evaluate the usability of the complete workflow, bringing molecular recognition closer to the practical needs of the field.

## Innovation {#description-innovation toc="Innovation"}

### 2.1 Two responses to understand a mixed signal {#description-two-responses-to-understand-a-mixed-signal toc="Two responses to understand a mixed signal" toc-unnumbered}

Our sensing strategy combines two sensors with different response preferences for ascr#3 and ascr#18. Reading their responses together offers a way to investigate signals from samples containing both target and background nematodes.

Receptor engineering explores how to create these complementary responses, while the dual-channel model examines how paired readings could help estimate target nematode density. This connects molecular design with a central challenge of soil testing: extracting useful information from a mixture of biological signals. [Receptor engineering →](/model-docking/) · [Dual-channel modeling →](/model-ode/)

### 2.2 A living sensor in an accessible test format {#description-a-living-sensor-in-an-accessible-test-format toc="A living sensor in an accessible test format" toc-unnumbered}

We bring fungal signal recognition, yeast signaling, and visible pigment production together in a paper-based format. The receptor provides the sensing element, the yeast pathway connects recognition to an output, and betaxanthin makes that output visible.

Work on cell immobilization, freeze-drying, revival, and the strip holder addresses how this biological system can be handled as a practical test. **The intended advantage is a kit with a lower barrier to use:** a portable format, a visible readout, and procedures designed around the people who would collect samples and use the results.

This goal guides both the development of the test strip and the evaluation of the complete workflow, including preparation, reading, cost, and disposal. [Test strip development →](/results/) · [User needs and workflow →](/human-practices/)

### 2.3 Designing around the decision that follows {#description-designing-around-the-decision-that-follows toc="Designing around the decision that follows" toc-unnumbered}

We connect the development of the test with the question of what a user could do with its result. **Human Practices (HP)** identifies relevant settings and practical requirements. Modeling explores how paired readings might yield density information and when that information could change a management choice. These questions feed back into experimental calibration, readout design, and cost evaluation.

This approach gives us a concrete way to judge progress: can the proposed kit provide understandable information, at an accessible cost, at a time when it can help? By keeping that question central, we bring wet-lab engineering, computational modeling, and HP into the design of one usable screening approach. [Integrated HP →](/human-practices/) · [Economic evaluation →](/model-eco/)

</div>
