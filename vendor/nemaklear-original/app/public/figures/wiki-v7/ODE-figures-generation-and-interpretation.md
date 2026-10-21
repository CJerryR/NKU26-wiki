# ODE Figures 3-2 to 3-5: generation commands and interpretation

The interpretations are kept from the original discussion, translated into English. Figure 3-2 uses the version without the gray notes under the title and at the bottom of the image; Figures 3-3 to 3-5 follow the same layout.

Model version: v7 / ODE r07 / dual-channel r04. The scripts use saved, hash-verified data and generate PNG, SVG and PDF files plus data check records.

## Figure 3-2: ODE color fit at different background densities

### Command

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig2_density_response.py
```

[Output directory](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig2-density-response)

![Figure 3-2](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig2-density-response/fig-3-2-density-response.png)

### Interpretation

**How to read this figure**

- The **left and right panels** are P3 and P18 and share the same axis ranges.
- The **x-axis** is the target Mi density; the **y-axis** is total pigment concentration at 8 hours, including basal color production.
- **Green, blue and purple** mark Ce background densities of 0, 80 and 200.
- **Dashed lines with crosses** are the preset color targets; **solid lines with dots** are the actual ODE outputs. Comparing the two lines of the same color shows the fitting deviation.
- The gray horizontal dotted line marks the **0.07 mg/mL blank**. Each line connects six Mi design points: 0, 5, 10, 40, 80 and 120.

**Three things to look for**

1. **The overall trend follows the targets, with some deviation.**  
   The 18-point RMSE is **0.009688 mg/mL for P3 and 0.009656 mg/mL for P18**. This is the fitting error relative to the preset simulated targets.

2. **At low background and low Mi, the model response is weaker.**  
   For example, at Ce = 0 and Mi = 10, P3 has a target of 0.0804 and an output of 0.0718 mg/mL, close to the 0.0700 blank. Little stimulus signal remains in the low range, so the overall RMSE cannot replace a check of this region.

3. **The Ce background itself also increases color markedly.**  
   Even at Mi = 0 and Ce = 200, P3 and P18 reach about 0.443 and 0.285 mg/mL. Color intensity alone therefore cannot show how much Mi is present; the difference between the two channel responses is the basis for the dual-channel reading that follows.

Conclusion supported by this figure: **the calibrated ODE broadly follows the preset color changes, while keeping the deviation in the low-stimulus region and the background interference.** Figures 4 and 5 then test whether these outputs can support Mi density estimation.

## Figure 3-3: net pigment accumulation

### Command

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig3_net_timecourse.py
```

[Output directory](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig3-net-timecourse)

![Figure 3-3](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig3-net-timecourse/fig-3-3-net-timecourse.png)

### Interpretation

**How to read this figure**

The x-axis is time after stimulation and the y-axis is **net pigment concentration**:

\[
C_{\mathrm{net},j}(t)=C_{\mathrm{sample},j}(t)-C_{\mathrm{blank},j}(t)
\]

The dashed blank line is therefore always zero; the other curves show the extra pigment caused by stimulation. The blank subtracted is the **blank at each time point**, not the 8-hour blank of 0.07 applied to the whole run.

Net pigment at 8 hours, in mg/mL:

| Sample | P3 | P18 |
|---|---:|---:|
| Mi only: Mi = 120, Ce = 0 | 0.116 | 0.226 |
| Ce only: Mi = 0, Ce = 200 | 0.373 | 0.215 |
| Mixed: Mi = 120, Ce = 200 | 0.473 | 0.410 |

**Three things to look for:**

1. **Pigment accumulates over time.** Growth is slow at first, then the curves separate; they are still rising at 8 hours with no plateau yet.
2. **The two channels respond differently to the same sample.** The Mi-only sample gives a higher net output in P18, while the Ce-only sample is higher in P3. This paired difference provides the information used later to separate target from background.
3. **In P18 the two single-species curves are very close.** Samples of different composition can give similar single-channel readings; adding P3 makes them easier to tell apart.

Note: pure Mi and pure Ce are at densities of 120 and 200, so curve height cannot be used to compare color production per worm. **This calibration is based on the 8-hour endpoint; the early curves are model extrapolation.** The figure shows the dynamics and does not determine the best detection time.

## Figure 3-4: dual-channel color space

### Command

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig4_signal_space.py
```

[Output directory](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig4-signal-space)

![Figure 3-4](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig4-signal-space/fig-3-4-signal-space.png)

### Interpretation

**How to read this figure**

Each point is one simulated mixed sample: **9 Mi levels × 5 Ce levels = 45 groups**.

- The **x- and y-axes** are the phone color indices of P3 and P18: \(x_j=-\log_{10}(B_{\mathrm{sample},j}/B_{\mathrm{blank},j})\).
- **Point color** shows the known Mi density, rising from purple to yellow.
- **Colored solid lines** connect samples with fixed Mi and varying Ce.
- **Gray dashed lines** connect samples with fixed Ce and varying Mi.

**The key is the two arrows.** Both start from **Mi = 40, Ce = 80**:

| Change | Increase in P3 index | Increase in P18 index |
|---|---:|---:|
| Mi from 40 to 80, Ce kept at 80 | 0.0171 | 0.0292 |
| Ce from 80 to 140, Mi kept at 40 | 0.0428 | 0.0253 |

Increasing Mi changes P18 more, so the arrow is steeper; increasing Ce changes P3 more, so the arrow is flatter. What is compared here is the **direction of change**. The two arrows correspond to different density increments, so their lengths cannot be used to compare sensitivity.

**Why this explains the value of two channels**  
Both a higher target and a higher background make the color stronger, but they move in different directions in the two-dimensional space. Keeping both readings makes it possible to use this difference to separate the two contributions; a single channel loses the information along the other direction.

This figure shows a separable structure under simulated conditions. How accurately Mi can be estimated depends on the held-out test in Figure 3-5.

## Figure 3-5: Mi density prediction and model comparison

### Command

One run generates both the three-panel wiki version and the two-panel slide version:

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig5_prediction_comparison.py
```

[Output directory](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig5-prediction-comparison)

**Wiki version**

![Figure 3-5, wiki version](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig5-prediction-comparison/fig-3-5-prediction-comparison-wiki.png)

### Interpretation

**How to read this figure**

- **A: overall dual-channel prediction.** The x-axis is known Mi density and the y-axis predicted density; the closer a point is to the dashed line, the more accurate the prediction. Color and shape distinguish the Ce background. All 19 test samples are shown.
- **B: zoom on the low-density region.** Shows 11 points from the same test set. Points that look close to the diagonal in the overall plot can still deviate clearly at low values. For example, at Mi = 0 and Ce = 110 the prediction is about −4.70; the raw negative value is not truncated.
- **C: model comparison on the same test set.** A smaller RMSE means a smaller overall prediction error:

| Model | RMSE (J2/100 cm³ soil) |
|---|---:|
| P3 only | 36.59 |
| P18 only | 28.43 |
| Dual-channel | **3.01** |

**Conclusion supported by this figure: under the current simulated conditions, the dual-channel model clearly improves Mi density estimation, but some bias remains at low density.**

These test combinations were not used in fitting the regression, but they come from the same noise-free ODE generator. Test points cluster around zero target and near 10 and 80, so the result cannot be read as measured accuracy across the full density range.

The **slide version** keeps the overall prediction and the RMSE comparison, for a focused talk on how much the dual-channel approach improves:

![Figure 3-5, slide version](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig5-prediction-comparison/fig-3-5-prediction-comparison-ppt.png)
