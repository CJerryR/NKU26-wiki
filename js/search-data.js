window.NKU_SEARCH_INDEX = [
  {
    "title": "Attributions",
    "url": "pages/attribution.html",
    "crumbs": [
      "Home",
      "Team",
      "Attributions"
    ],
    "desc": "Honest attribution of the work behind this project.",
    "text": "Attributions Honest attribution of the work behind this project. Home Team Attributions 01 - Work Crediting the team Per iGEM rules, clearly state which work was done by the student team and which was supported by others. Be specific and honest. 02 - Breakdown Who led each part Wet lab Members who led the experimental work. Dry lab Members who led modelling/software/hardware. Human practices Members who led engagement & outreach. Wiki Members who built this wiki. Writing Members who wrote and edited content. Support Help received from advisors, instructors & others. Pending documentation With final attribution table 03 - Thanks Thank you Pending documentation Acknowledgements for labs, sponsors, Human Practices contributors, and other support. Be generous & precise Good attribution is both a rule and a courtesy: name names, and say exactly what each person contributed.",
    "sections": [
      {
        "id": "work",
        "title": "Attribution of work",
        "text": "01 - Work Crediting the team Per iGEM rules, clearly state which work was done by the student team and which was supported by others. Be specific and honest.",
        "url": "pages/attribution.html#work"
      },
      {
        "id": "breakdown",
        "title": "By area",
        "text": "02 - Breakdown Who led each part Wet lab Members who led the experimental work. Dry lab Members who led modelling/software/hardware. Human practices Members who led engagement & outreach. Wiki Members who built this wiki. Writing Members who wrote and edited content. Support Help received from advisors, instructors & others. Pending documentation With final attribution table",
        "url": "pages/attribution.html#breakdown"
      },
      {
        "id": "thanks",
        "title": "Acknowledgements",
        "text": "03 - Thanks Thank you Pending documentation Acknowledgements for labs, sponsors, Human Practices contributors, and other support. Be generous & precise Good attribution is both a rule and a courtesy: name names, and say exactly what each person contributed.",
        "url": "pages/attribution.html#thanks"
      }
    ]
  },
  {
    "title": "Contribution",
    "url": "contribution/",
    "crumbs": [
      "Home",
      "Project",
      "Contribution"
    ],
    "desc": "A documented contribution that the next team can pick up and build on.",
    "text": "Contribution A documented contribution that the next team can pick up and build on. Home Project Contribution 01 - Contribution What we added Pending documentation Clearly and concisely what the team is contributing to the iGEM community - new parts, characterization, data, protocols, or tools. 02 - How to use Pick up where we left off 01 Read this What the contribution is and what problem it solves. 02 Get the parts Where to find the parts and data in the Registry. 03 Reproduce Protocols to reproduce our results. 03 - Docs Reusable materials Pending documentation The detailed documentation, datasets, and protocols that make the contribution genuinely reusable. Documentation note This page is structurally complete; final team evidence will be added before wiki freeze.",
    "sections": [
      {
        "id": "what",
        "title": "Our contribution",
        "text": "01 - Contribution What we added Pending documentation Clearly and concisely what the team is contributing to the iGEM community - new parts, characterization, data, protocols, or tools.",
        "url": "contribution/#what"
      },
      {
        "id": "how",
        "title": "How to use it",
        "text": "02 - How to use Pick up where we left off 01 Read this What the contribution is and what problem it solves. 02 Get the parts Where to find the parts and data in the Registry. 03 Reproduce Protocols to reproduce our results.",
        "url": "contribution/#how"
      },
      {
        "id": "docs",
        "title": "Documentation",
        "text": "03 - Docs Reusable materials Pending documentation The detailed documentation, datasets, and protocols that make the contribution genuinely reusable. Documentation note This page is structurally complete; final team evidence will be added before wiki freeze.",
        "url": "contribution/#docs"
      }
    ]
  },
  {
    "title": "Description",
    "url": "pages/description.html",
    "crumbs": [
      "Home",
      "Project",
      "Description"
    ],
    "desc": "Two soil-borne nematodes, visible damage only after infection, and a field decision that needs earlier evidence. This is the problem - and the idea that answers it.",
    "text": "Description Two soil-borne nematodes, visible damage only after infection, and a field decision that needs earlier evidence. This is the problem - and the idea that answers it. Home Project Description 01 - Background A threat that works underground Plant-parasitic nematodes are microscopic roundworms that feed on plant roots. They are everywhere agriculture happens, they are invisible to the naked eye, and they are astonishingly destructive. Because the damage begins below the soil line, infestations are usually discovered only after yields have already collapsed. Our project focuses on the two species that matter most to the crops grown around us - and to growers worldwide. Heterodera glycines The soybean cyst nematode. The single most damaging pathogen of soybean. Females swell into protective cysts packed with eggs that survive in soil for years, making it nearly impossible to eradicate once established. Pending documentation Team local incidence data & a field photo Meloidogyne incognita The southern root-knot nematode. A generalist that attacks thousands of plant species, forming the characteristic \"knots\" (galls) on roots that choke off water and nutrient flow. Pending documentation Host range & a gall photo Why these two? Together they represent the two dominant strategies of plant-parasitic nematodes - sedentary cyst-formers and root-knot gall-formers. A detector that handles both covers the vast majority of field cases. 02 - The gap Diagnosis today is slow, costly, and late Conventional nematode diagnosis depends on extracting worms from soil and identifying them under a microscope - a process that demands trained specialists, days of turnaround, and central laboratory infrastructure. For a smallholder farmer, that is rarely an option. Too slow Days to weeks between sampling and an answer - long after the planting decision has been made. Too costly Specialist labour and equipment put routine testing out of reach for most growers. Too specialised Reliable identification still hinges on scarce taxonomic expertise. 03 - The idea Put the diagnosis in the grower's hand We are designing a field-deployable biosensor that detects the molecular signatures of H. glycines and M. incognita directly from a soil sample, and reports the result as a simple visual readout. No microscope, no shipping samples to a lab, no waiting. See the pest before you see the symptom. The remainder of this wiki documents how that sensor was conceived, engineered, tested, and shaped by the people who will ultimately use it. Soil sample Recognition + amplify Readout Fig 1 The detection pipeline at a glance - final assay schematic pending. 04 - Approach Why this is a synthetic-biology problem Specificity is the hard part. Soil is a noisy molecular environment, and the two target species must be told apart from each other and from harmless relatives. Engineered biological recognition - programmable, sequence-specific, and self-amplifying - is uniquely suited to that job, and it can be manufactured cheaply and deployed without a cold chain. Programmable specificity - recognition elements can be retargeted to new species by changing a single sequence. Built-in amplification - biological circuits turn a few molecules into a visible signal. Low-cost, field-ready - reagents that travel and store without specialist infrastructure. Pending documentation The specific chassis, recognition system & reporter the team adopts 05 - Scope What we set out to achieve this season Goal 01 Design a species-specific recognition module Identify and validate sequences that uniquely distinguish each target nematode. Goal 02 Build an amplifying reporter circuit Couple recognition to a robust, naked-eye readout. Goal 03 Demonstrate detection from a soil-like matrix Pending documentation The sensor works outside clean buffer, toward real-world use. Goal 04 Ground the design in real needs Let growers, agronomists, and regulators shape what \"useful\" means. 06 - Sources References Author, A. et al. Title of the global nematode crop-loss study. Journal (Year). Reference to add Author, B. et al. Biology and management of Heterodera glycines . Journal (Year). Reference to add Author, C. et al. Meloidogyne incognita host range and impact. Journal (Year). Reference to add Documentation note This page is structurally complete; final figures, citations, and data will be added before wiki freeze.",
    "sections": [
      {
        "id": "problem",
        "title": "The problem",
        "text": "01 - Background A threat that works underground Plant-parasitic nematodes are microscopic roundworms that feed on plant roots. They are everywhere agriculture happens, they are invisible to the naked eye, and they are astonishingly destructive. Because the damage begins below the soil line, infestations are usually discovered only after yields have already collapsed. Our project focuses on the two species that matter most to the crops grown around us - and to growers worldwide. Heterodera glycines The soybean cyst nematode. The single most damaging pathogen of soybean. Females swell into protective cysts packed with eggs that survive in soil for years, making it nearly impossible to eradicate once established. Pending documentation Team local incidence data & a field photo Meloidogyne incognita The southern root-knot nematode. A generalist that attacks thousands of plant species, forming the characteristic \"knots\" (galls) on roots that choke off water and nutrient flow. Pending documentation Host range & a gall photo Why these two? Together they represent the two dominant strategies of plant-parasitic nematodes - sedentary cyst-formers and root-knot gall-formers. A detector that handles both covers the vast majority of field cases.",
        "url": "pages/description.html#problem"
      },
      {
        "id": "gap",
        "title": "Why current tests fail",
        "text": "02 - The gap Diagnosis today is slow, costly, and late Conventional nematode diagnosis depends on extracting worms from soil and identifying them under a microscope - a process that demands trained specialists, days of turnaround, and central laboratory infrastructure. For a smallholder farmer, that is rarely an option. Too slow Days to weeks between sampling and an answer - long after the planting decision has been made. Too costly Specialist labour and equipment put routine testing out of reach for most growers. Too specialised Reliable identification still hinges on scarce taxonomic expertise.",
        "url": "pages/description.html#gap"
      },
      {
        "id": "idea",
        "title": "Our idea",
        "text": "03 - The idea Put the diagnosis in the grower's hand We are designing a field-deployable biosensor that detects the molecular signatures of H. glycines and M. incognita directly from a soil sample, and reports the result as a simple visual readout. No microscope, no shipping samples to a lab, no waiting. See the pest before you see the symptom. The remainder of this wiki documents how that sensor was conceived, engineered, tested, and shaped by the people who will ultimately use it. Soil sample Recognition + amplify Readout Fig 1 The detection pipeline at a glance - final assay schematic pending.",
        "url": "pages/description.html#idea"
      },
      {
        "id": "why-synbio",
        "title": "Why synthetic biology",
        "text": "04 - Approach Why this is a synthetic-biology problem Specificity is the hard part. Soil is a noisy molecular environment, and the two target species must be told apart from each other and from harmless relatives. Engineered biological recognition - programmable, sequence-specific, and self-amplifying - is uniquely suited to that job, and it can be manufactured cheaply and deployed without a cold chain. Programmable specificity - recognition elements can be retargeted to new species by changing a single sequence. Built-in amplification - biological circuits turn a few molecules into a visible signal. Low-cost, field-ready - reagents that travel and store without specialist infrastructure. Pending documentation The specific chassis, recognition system & reporter the team adopts",
        "url": "pages/description.html#why-synbio"
      },
      {
        "id": "goals",
        "title": "Project goals",
        "text": "05 - Scope What we set out to achieve this season Goal 01 Design a species-specific recognition module Identify and validate sequences that uniquely distinguish each target nematode. Goal 02 Build an amplifying reporter circuit Couple recognition to a robust, naked-eye readout. Goal 03 Demonstrate detection from a soil-like matrix Pending documentation The sensor works outside clean buffer, toward real-world use. Goal 04 Ground the design in real needs Let growers, agronomists, and regulators shape what \"useful\" means.",
        "url": "pages/description.html#goals"
      },
      {
        "id": "refs",
        "title": "References",
        "text": "06 - Sources References Author, A. et al. Title of the global nematode crop-loss study. Journal (Year). Reference to add Author, B. et al. Biology and management of Heterodera glycines . Journal (Year). Reference to add Author, C. et al. Meloidogyne incognita host range and impact. Journal (Year). Reference to add Documentation note This page is structurally complete; final figures, citations, and data will be added before wiki freeze.",
        "url": "pages/description.html#refs"
      }
    ]
  },
  {
    "title": "Education",
    "url": "education/",
    "crumbs": [
      "Home",
      "Human Practices",
      "Education"
    ],
    "desc": "How we helped others understand nematodes, biosensing, and synthetic biology.",
    "text": "Education How we helped others understand nematodes, biosensing, and synthetic biology. Home Human Practices Education 01 - Goals What we wanted to achieve Audience, learning goals, and intended takeaways. 02 - Activities What we did Workshops Hands-on sessions for students. Talks & outreach Public-facing explanations of the project. Materials Resources we created and shared. Pending documentation Activity descriptions, photos, and reach numbers 03 - Impact Did it land? Impact evidence, feedback, reach, and follow-on engagement. Measure, don't just do Reviewers value evidence that the education work actually changed understanding.",
    "sections": [
      {
        "id": "goals",
        "title": "Goals",
        "text": "01 - Goals What we wanted to achieve Audience, learning goals, and intended takeaways.",
        "url": "education/#goals"
      },
      {
        "id": "activities",
        "title": "Activities",
        "text": "02 - Activities What we did Workshops Hands-on sessions for students. Talks & outreach Public-facing explanations of the project. Materials Resources we created and shared. Pending documentation Activity descriptions, photos, and reach numbers",
        "url": "education/#activities"
      },
      {
        "id": "impact",
        "title": "Impact",
        "text": "03 - Impact Did it land? Impact evidence, feedback, reach, and follow-on engagement. Measure, don't just do Reviewers value evidence that the education work actually changed understanding.",
        "url": "education/#impact"
      }
    ]
  },
  {
    "title": "Engineering",
    "url": "engineering/",
    "crumbs": [
      "Home",
      "Project",
      "Engineering"
    ],
    "desc": "Design-Build-Test-Learn, documented cycle by cycle. This is how the detector earned our trust.",
    "text": "Engineering Design-Build-Test-Learn, documented cycle by cycle. This is how the detector earned our trust. Home Project Engineering 01 - Approach How we engineer Pending documentation The Design-Build-Test-Learn philosophy and how the team applied it rigorously across the season. D Design Specify the construct and the hypothesis it tests. B Build Assemble the parts and constructs at the bench. T Test Measure against a defined success criterion. L Learn Feed the result into the next design. 02 - Cycle 1 Proving the recognition module Design Hypothesis and construct for this cycle. Build What was assembled. Test Assay and success criterion. Learn Outcome and the change it drove. figure pending Fig 1 Cycle 1 key result. Pending documentation Data for cycle 1 03 - Cycle 2 Tuning the readout Design Pending documentation Reporter design question and success criterion. Build Pending documentation Reporter construct or assay condition tested. Test Signal measurement, controls, and replicate plan. Learn Change made after interpreting the signal. Pending documentation Data for cycle 2 04 - Cycle 3 Putting it together Design Integrated system design question and target workflow. Build Combined modules, sample preparation, and readout setup. Test End-to-end assay conditions and decision rule. Learn What integration taught the next design iteration. Tell the story Judges reward a clear narrative thread: each cycle should visibly build on the previous result.",
    "sections": [
      {
        "id": "approach",
        "title": "Our approach",
        "text": "01 - Approach How we engineer Pending documentation The Design-Build-Test-Learn philosophy and how the team applied it rigorously across the season. D Design Specify the construct and the hypothesis it tests. B Build Assemble the parts and constructs at the bench. T Test Measure against a defined success criterion. L Learn Feed the result into the next design.",
        "url": "engineering/#approach"
      },
      {
        "id": "cycle-1",
        "title": "Cycle 1 - Recognition",
        "text": "02 - Cycle 1 Proving the recognition module Design Hypothesis and construct for this cycle. Build What was assembled. Test Assay and success criterion. Learn Outcome and the change it drove. figure pending Fig 1 Cycle 1 key result. Pending documentation Data for cycle 1",
        "url": "engineering/#cycle-1"
      },
      {
        "id": "cycle-2",
        "title": "Cycle 2 - Reporter",
        "text": "03 - Cycle 2 Tuning the readout Design Pending documentation Reporter design question and success criterion. Build Pending documentation Reporter construct or assay condition tested. Test Signal measurement, controls, and replicate plan. Learn Change made after interpreting the signal. Pending documentation Data for cycle 2",
        "url": "engineering/#cycle-2"
      },
      {
        "id": "cycle-3",
        "title": "Cycle 3 - Integration",
        "text": "04 - Cycle 3 Putting it together Design Integrated system design question and target workflow. Build Combined modules, sample preparation, and readout setup. Test End-to-end assay conditions and decision rule. Learn What integration taught the next design iteration. Tell the story Judges reward a clear narrative thread: each cycle should visibly build on the previous result.",
        "url": "engineering/#cycle-3"
      }
    ]
  },
  {
    "title": "Human Practices",
    "url": "human-practices/",
    "crumbs": [
      "Home",
      "Human Practices",
      "Overview"
    ],
    "desc": "We asked the people who actually fight nematodes what they need - and let their answers steer the science.",
    "text": "Human Practices We asked the people who actually fight nematodes what they need - and let their answers steer the science. Home Human Practices Overview 01 - Approach How we did human practices Pending documentation Team philosophy: who the team spoke to, why, and how their input was genuinely fed back into design rather than collected after the fact. 02 - Stakeholders The people behind the problem Growers The people living with the pest day to day. Agronomists Advisors who translate science into field decisions. Regulators Those who decide what may be deployed and how. Researchers Nematology and diagnostics experts. Industry Companies working on crop protection. Community Local voices on responsible use. 03 - Impact How they reshaped the project Input 1 Practitioner need Stakeholder evidence and the design change it caused. Input 2 Regulatory concern Risk, compliance, or deployment feedback and the adjustment made. Input 3 Grower requirement Field-use constraint and the change made to readout, workflow, or implementation. Integration is the point Each conversation here maps to a concrete change elsewhere on this wiki - that is what makes it integrated human practices. Pending documentation Each engagement and its consequence 04 - Ethics Doing good, safely Pending documentation On the ethical, social, and environmental responsibilities of releasing a tool like this into agriculture. Documentation note This page is structurally complete; final team evidence will be added before wiki freeze.",
    "sections": [
      {
        "id": "approach",
        "title": "Our approach",
        "text": "01 - Approach How we did human practices Pending documentation Team philosophy: who the team spoke to, why, and how their input was genuinely fed back into design rather than collected after the fact.",
        "url": "human-practices/#approach"
      },
      {
        "id": "stakeholders",
        "title": "Who we met",
        "text": "02 - Stakeholders The people behind the problem Growers The people living with the pest day to day. Agronomists Advisors who translate science into field decisions. Regulators Those who decide what may be deployed and how. Researchers Nematology and diagnostics experts. Industry Companies working on crop protection. Community Local voices on responsible use.",
        "url": "human-practices/#stakeholders"
      },
      {
        "id": "what-changed",
        "title": "What changed",
        "text": "03 - Impact How they reshaped the project Input 1 Practitioner need Stakeholder evidence and the design change it caused. Input 2 Regulatory concern Risk, compliance, or deployment feedback and the adjustment made. Input 3 Grower requirement Field-use constraint and the change made to readout, workflow, or implementation. Integration is the point Each conversation here maps to a concrete change elsewhere on this wiki - that is what makes it integrated human practices. Pending documentation Each engagement and its consequence",
        "url": "human-practices/#what-changed"
      },
      {
        "id": "ethics",
        "title": "Responsibility & ethics",
        "text": "04 - Ethics Doing good, safely Pending documentation On the ethical, social, and environmental responsibilities of releasing a tool like this into agriculture. Documentation note This page is structurally complete; final team evidence will be added before wiki freeze.",
        "url": "human-practices/#ethics"
      }
    ]
  },
  {
    "title": "NKU iGEM 2026",
    "url": "index.html",
    "crumbs": [
      "Home"
    ],
    "desc": "NKU iGEM 2026 - a synthetic-biology biosensor that detects soybean cyst and root-knot nematodes in soil before crop damage appears.",
    "text": "NKU iGEM 2026 NKU iGEM 2026 - a synthetic-biology biosensor that detects soybean cyst and root-knot nematodes in soil before crop damage appears. Home Nankai University · iGEM 2026 The soil is hiding something. Two microscopic nematodes can damage crops underground, invisibly, and often before the field shows symptoms. We are engineering a biosensor that names them before the damage shows. Heterodera glycines · soybean cyst Meloidogyne incognita · root-knot Read the investigation How detection works Subsurface Evidence Map scan 03 Soil sample Target sequence Field readout Move your cursor across the soil - something is down there. Scroll 01 - The case A pest you never see, on a bill you always pay. Plant-parasitic nematodes are among the most overlooked threats in agriculture. They live in the soil, feed on roots, and can spread before symptoms reach the surface. This section frames the project case and leaves a clear slot for final burden-of-disease evidence and regional context. Data Global crop-loss figure and source Local Regional crop and field relevance 2 Target species: soybean cyst and root-knot nematodes Test Final assay format, time-to-result, and detection limit biosensing root-knot soybean cyst early detection synthetic biology biosensing root-knot soybean cyst early detection synthetic biology 02 - How detection works Three moves from a clod of soil to a clear answer. Our detector reads the molecular fingerprints these nematodes leave in soil and turns them into a signal anyone can interpret in the field - no lab, no microscope, no PhD required. 01 Sample A pinch of field soil goes into a tube. Target nucleic acids are released and concentrated on the spot. 02 Amplify & recognise An engineered recognition module locks onto sequences unique to each species and triggers an amplifying biological circuit. 03 Read the verdict A colour or fluorescence readout reports which nematode is present - and roughly how much - within the hour. Pending documentation Final assay chemistry & circuit once finalized 03 - The casebook Open the wiki. Everything we did, evidenced and cross-referenced. Start anywhere. Description The problem, the suspects, and the idea that catches them. Contribution What we leave for future teams to reuse and extend. Engineering Design-build-test-learn, cycle by documented cycle. Model The assumptions, predictions, and design feedback from dry lab. Human Practices Pending documentation Listening to farmers, agronomists, and regulators. Results What the detector actually did at the bench. The NKU iGEM mascot - a round detective with a deerstalker hat and magnifying glass 04 - The investigator Meet our detective. Every good case needs a sharp eye. Ours wears a deerstalker, carries a magnifying glass, and never lets a nematode slip past unnoticed - the face of a project about seeing the unseen. Behind the mascot is a team of Nankai University students from the life sciences and beyond, who spent a year turning a soil problem into a piece of synthetic biology. Meet the team Our human practices",
    "sections": [
      {
        "id": "how",
        "title": "Three moves from a clod of soil to a clear answer.",
        "text": "02 - How detection works Three moves from a clod of soil to a clear answer. Our detector reads the molecular fingerprints these nematodes leave in soil and turns them into a signal anyone can interpret in the field - no lab, no microscope, no PhD required. 01 Sample A pinch of field soil goes into a tube. Target nucleic acids are released and concentrated on the spot. 02 Amplify & recognise An engineered recognition module locks onto sequences unique to each species and triggers an amplifying biological circuit. 03 Read the verdict A colour or fluorescence readout reports which nematode is present - and roughly how much - within the hour. Pending documentation Final assay chemistry & circuit once finalized",
        "url": "index.html#how"
      }
    ]
  },
  {
    "title": "Modeling",
    "url": "model/",
    "crumbs": [
      "Home",
      "Lab",
      "Modeling"
    ],
    "desc": "The mathematics and simulation that guided the design and explained the data.",
    "text": "Modeling The mathematics and simulation that guided the design and explained the data. Home Lab Modeling 01 - Motivation What the model is for Pending documentation The questions the model answers: predicting sensitivity, choosing parameters, or interpreting results - and how it fed back into design. 02 - Model Assumptions & equations Pending documentation The model type, key assumptions, and governing equations. Use inline code for variables, e.g. k_on , k_cat . figure pending Fig 1 Model schematic / equation system. Pending documentation Equations and assumptions 03 - Results Did reality agree? figure pending Fig 2 Model prediction overlaid on experimental data. Model predictions compared with experimental measurements. Close the loop The strongest modelling sections show the model changing a real design decision. 04 - Sources References Modelling method / parameter source. Reference to add",
    "sections": [
      {
        "id": "why",
        "title": "Why we modelled",
        "text": "01 - Motivation What the model is for Pending documentation The questions the model answers: predicting sensitivity, choosing parameters, or interpreting results - and how it fed back into design.",
        "url": "model/#why"
      },
      {
        "id": "model",
        "title": "The model",
        "text": "02 - Model Assumptions & equations Pending documentation The model type, key assumptions, and governing equations. Use inline code for variables, e.g. k_on , k_cat . figure pending Fig 1 Model schematic / equation system. Pending documentation Equations and assumptions",
        "url": "model/#model"
      },
      {
        "id": "results",
        "title": "Predictions vs data",
        "text": "03 - Results Did reality agree? figure pending Fig 2 Model prediction overlaid on experimental data. Model predictions compared with experimental measurements. Close the loop The strongest modelling sections show the model changing a real design decision.",
        "url": "model/#results"
      },
      {
        "id": "refs",
        "title": "References",
        "text": "04 - Sources References Modelling method / parameter source. Reference to add",
        "url": "model/#refs"
      }
    ]
  },
  {
    "title": "Results",
    "url": "pages/results.html",
    "crumbs": [
      "Home",
      "Project",
      "Results"
    ],
    "desc": "The experimental evidence, presented honestly - including what did not work.",
    "text": "Results The experimental evidence, presented honestly - including what did not work. Home Project Results 01 - Summary The short version Headline findings and the key evidence behind them. Result Validated constructs and key evidence N Independent replicates and controls Species Species detected and specificity claim 02 - Recognition Did it bind the right target? figure pending Fig 1 Specificity assay across target and non-target species. Pending documentation The figure: specificity, cross-reactivity, and what it means for field use. Pending documentation Specificity / binding data 03 - Readout Was the signal clear? figure pending Fig 2 Dose-response / signal-to-noise of the reporter. Pending documentation Sensitivity and the limit of detection achieved. Pending documentation Readout data 04 - Matrix Did it survive contact with reality? Pending documentation Performance in a soil-like matrix versus clean buffer - the step toward real deployment. Report the negatives too Failed conditions, limitations, and guidance for future teams. Pending documentation Matrix results 05 - Sources References Methods reference for the assays used above. Reference to add",
    "sections": [
      {
        "id": "summary",
        "title": "Headline results",
        "text": "01 - Summary The short version Headline findings and the key evidence behind them. Result Validated constructs and key evidence N Independent replicates and controls Species Species detected and specificity claim",
        "url": "pages/results.html#summary"
      },
      {
        "id": "recognition-data",
        "title": "Recognition results",
        "text": "02 - Recognition Did it bind the right target? figure pending Fig 1 Specificity assay across target and non-target species. Pending documentation The figure: specificity, cross-reactivity, and what it means for field use. Pending documentation Specificity / binding data",
        "url": "pages/results.html#recognition-data"
      },
      {
        "id": "readout-data",
        "title": "Readout results",
        "text": "03 - Readout Was the signal clear? figure pending Fig 2 Dose-response / signal-to-noise of the reporter. Pending documentation Sensitivity and the limit of detection achieved. Pending documentation Readout data",
        "url": "pages/results.html#readout-data"
      },
      {
        "id": "matrix",
        "title": "Soil-matrix test",
        "text": "04 - Matrix Did it survive contact with reality? Pending documentation Performance in a soil-like matrix versus clean buffer - the step toward real deployment. Report the negatives too Failed conditions, limitations, and guidance for future teams. Pending documentation Matrix results",
        "url": "pages/results.html#matrix"
      },
      {
        "id": "refs",
        "title": "References",
        "text": "05 - Sources References Methods reference for the assays used above. Reference to add",
        "url": "pages/results.html#refs"
      }
    ]
  },
  {
    "title": "Safety",
    "url": "safety-and-security/",
    "crumbs": [
      "Home",
      "Project",
      "Safety"
    ],
    "desc": "How we kept ourselves, our community, and the environment safe throughout the project.",
    "text": "Safety How we kept ourselves, our community, and the environment safe throughout the project. Home Project Safety 01 - Lab In the laboratory Pending documentation Team lab's safety level, training, supervision, and the practices the team followed day-to-day. Training Training records and supervision summary. Containment Containment level and supervision summary. Protocols Reviewed protocol list and safety records. 02 - Chassis What we worked with Pending documentation The safety of team chassis organism and the parts used, including any risk-group considerations. Pending documentation Organisms / parts and their risk groups 03 - By design Built-in safeguards Pending documentation Any design choices that reduce risk - non-pathogenic targets of detection, containment features, and the fact that the device detects rather than releases. Detect, don't release Our system is a diagnostic: it reads a signature from soil rather than introducing an organism into the environment. 04 - Risk Deployment risks Pending documentation The risks of real-world use and how they are mitigated; connect to Implementation. Documentation note This page is structurally complete; final team evidence will be added before wiki freeze.",
    "sections": [
      {
        "id": "lab",
        "title": "Lab safety",
        "text": "01 - Lab In the laboratory Pending documentation Team lab's safety level, training, supervision, and the practices the team followed day-to-day. Training Training records and supervision summary. Containment Containment level and supervision summary. Protocols Reviewed protocol list and safety records.",
        "url": "safety-and-security/#lab"
      },
      {
        "id": "chassis",
        "title": "Chassis & parts safety",
        "text": "02 - Chassis What we worked with Pending documentation The safety of team chassis organism and the parts used, including any risk-group considerations. Pending documentation Organisms / parts and their risk groups",
        "url": "safety-and-security/#chassis"
      },
      {
        "id": "design-safety",
        "title": "Safety by design",
        "text": "03 - By design Built-in safeguards Pending documentation Any design choices that reduce risk - non-pathogenic targets of detection, containment features, and the fact that the device detects rather than releases. Detect, don't release Our system is a diagnostic: it reads a signature from soil rather than introducing an organism into the environment.",
        "url": "safety-and-security/#design-safety"
      },
      {
        "id": "risk",
        "title": "Risk assessment",
        "text": "04 - Risk Deployment risks Pending documentation The risks of real-world use and how they are mitigated; connect to Implementation. Documentation note This page is structurally complete; final team evidence will be added before wiki freeze.",
        "url": "safety-and-security/#risk"
      }
    ]
  },
  {
    "title": "Software",
    "url": "software/",
    "crumbs": [
      "Home",
      "Lab",
      "Software"
    ],
    "desc": "Software tools we built to design, analyse, or deploy the detector.",
    "text": "Software Software tools we built to design, analyse, or deploy the detector. Home Lab Software 01 - Overview What we built Pending documentation The software: what problem it solves, who it is for, and where the repository lives. Analysis Turning raw readout into a clear call. Design tools Helpers for selecting targets or parts. Access How users run it. 02 - Architecture Under the hood Pending documentation The architecture and key components at a high level. figure pending Fig 1 Software architecture diagram. Pending documentation Architecture + repo link 03 - Use Run it yourself Installation and usage notes; everything needed to reproduce or extend the tool. Static & open Code is hosted in our repository and the wiki ships no external scripts - keeping the site Best-Wiki compliant.",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "text": "01 - Overview What we built Pending documentation The software: what problem it solves, who it is for, and where the repository lives. Analysis Turning raw readout into a clear call. Design tools Helpers for selecting targets or parts. Access How users run it.",
        "url": "software/#overview"
      },
      {
        "id": "how",
        "title": "How it works",
        "text": "02 - Architecture Under the hood Pending documentation The architecture and key components at a high level. figure pending Fig 1 Software architecture diagram. Pending documentation Architecture + repo link",
        "url": "software/#how"
      },
      {
        "id": "repro",
        "title": "Use & reproducibility",
        "text": "03 - Use Run it yourself Installation and usage notes; everything needed to reproduce or extend the tool. Static & open Code is hosted in our repository and the wiki ships no external scripts - keeping the site Best-Wiki compliant.",
        "url": "software/#repro"
      }
    ]
  },
  {
    "title": "Team",
    "url": "pages/team-members.html",
    "crumbs": [
      "Home",
      "Team",
      "Members"
    ],
    "desc": "The Nankai University students on the trail of a hidden pest.",
    "text": "Team The Nankai University students on the trail of a hidden pest. Home Team Members 01 - Members Meet the team Student member photos, names, roles, and contribution summaries. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Pending documentation Cards with real member photos & bios 02 - Sub-teams How we organised Wet lab Built and tested the detector. Dry lab Modelling, software, hardware. Human practices Engagement, education, outreach. 03 - Affiliation Institution note Verified team affiliation, department, and official links. Pending documentation Official affiliation links before final submission 04 - Thanks Standing on shoulders With gratitude to our advisors, instructors, and supporters - see Attributions .",
    "sections": [
      {
        "id": "members",
        "title": "Members",
        "text": "01 - Members Meet the team Student member photos, names, roles, and contribution summaries. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Team member Role and contribution summary. Pending documentation Cards with real member photos & bios",
        "url": "pages/team-members.html#members"
      },
      {
        "id": "subteams",
        "title": "Sub-teams",
        "text": "02 - Sub-teams How we organised Wet lab Built and tested the detector. Dry lab Modelling, software, hardware. Human practices Engagement, education, outreach.",
        "url": "pages/team-members.html#subteams"
      },
      {
        "id": "affiliation",
        "title": "Affiliation",
        "text": "03 - Affiliation Institution note Verified team affiliation, department, and official links. Pending documentation Official affiliation links before final submission",
        "url": "pages/team-members.html#affiliation"
      },
      {
        "id": "thanks",
        "title": "Thanks",
        "text": "04 - Thanks Standing on shoulders With gratitude to our advisors, instructors, and supporters - see Attributions .",
        "url": "pages/team-members.html#thanks"
      }
    ]
  }
];
