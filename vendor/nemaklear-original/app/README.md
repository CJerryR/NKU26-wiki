# NemaKlear local interactive prototype

2026-10-15. Wraps the frozen ODE r04, dual-channel r01 and the existing Eco HTML report into a local workbench. All calibration is still simulated; no model was refitted. The current interface is version 4 (2026-10-16).

## Start

On this computer, double-click `start.command`, or run in a terminal:

```sh
cd /Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab
./ode-v1/web-demo/start.command
```

Open <http://127.0.0.1:8765> in a browser. The service listens on this machine only. Press Control+C to stop. If the port is taken, use `./ode-v1/web-demo/start.command --port 8766` and open that port.

To move it to another computer, the whole `web-demo` folder runs on its own (verified with Python 3.14; other versions need matching dependencies):

```sh
cd web-demo
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -B server.py
```

## How to use

- **ODE simulated samples:** choose one of nine saved combinations. The six-state ODE of both sensors is solved live, showing Fus3 and pigment trajectories. The 8 h pigment-equivalent concentration is multiplied by 0.048 to give A480, the matching ODE blank is subtracted for each channel, and the existing regression is called.
- **Manual absorbance:** enter blank-corrected A480 for both channels, or raw values plus two matching blanks. Manual mode goes straight into the dual-channel model. Two endpoint readings cannot uniquely determine an ODE trajectory, so only a clearly labeled reference curve is shown here.
- **Eco results on the same page:** benefits and curves appear automatically after computation. The point-estimate class and calibration coverage are shown separately. You can switch between the point estimate and the interval ends; when the interval crosses a threshold, scenarios on both sides are offered. Above the calibrated density limit, a clearly labeled conditional-simulation report is still available. Each Eco report is computed at the given density; benefit changes are not confidence intervals. Saturation, out-of-domain color combinations, negative density or results beyond the Eco supported range still block the report.
- **Downloads:** the current result as JSON, the three scientific figures as PNG/SVG/PDF, and a figure bundle.

Opens with Mi 120 + Ce 80 by default and computes automatically.

Reference example Mi 40 + Ce 80: corrected A480 about 0.01857307356 and 0.00267167879; predicted Mi 40.8723 J2/100 cm³, formal interval 17.5990–64.1455, medium class.

## Frozen conditions and interpretation

Mi J2 and Ce L4 are the simulation labels used here. Both are assumed to release the same combined amount of #3 + #18 per worm per hour, Q = 1 fmol; Mi ratio 1:10, Ce 10:1. Collection 1 h, effective volume 1 mL, sensor readout at 8 h; these ratios and absolute release amounts are not measured literature values. Absorbance conversion uses the working approximation ε = 48000 L/(mol·cm) and an effective path length of 1 cm.

Input cross-response weights and the remaining color equation parameters are fixed; each channel keeps its fitted KL and a. The ODE endpoints of nine mixed combinations feed the existing three-coefficient regression; Ce count does not enter the predictor. The model card is in `data/calibration.json` and the pairing matrix in `data/matrix.json`.

The OLS formal prediction interval comes from deterministic simulation residuals and has no guaranteed 95% coverage for real samples. The current empirical calibration covers Mi 0–120 J2/100 cm³, and the joint calibration domain of both colors is checked. Eco uses the 10 and 80 thresholds of the Spanish greenhouse tomato example, which must not be read as general agricultural thresholds. Reports keep the last 32 computations in memory; after a restart or eviction they must be recomputed.

## Figures

1. `public/figures/01-signal-to-color.*`: main figure, two-channel Fus3 / pigment time response of four representative soil samples: blank, Mi40, Ce80 and Mi40+Ce80 in gray, blue, orange and green. Matching states of both channels share a y-axis scale. The trajectories change over several hours, so both rows keep 0–8 h.
2. `02-pathway-and-interfaces.*`: methods figure with the fixed shared core, highlighting the input KL and output a; the effective color equation is in hours, while the core is solved in seconds.
3. `03-endpoint-calibration.*`: simulated calibration figure, preset color on the x-axis and ODE output on the y-axis, with all nine points used in fitting. It is not an independent validation or a comparison of measured and predicted values.

PNGs are 300 dpi; SVGs keep text and PDFs suit vector layout. Recommended: the time-response figure for the main presentation page, the pathway figure for methods, and the calibration figure for results or backup slides. Suggested caption: **"Under a fixed shared pathway and an assumed mixed secretion profile, the two sensors show different dynamic color responses; 8 h endpoints are used for simulated dual-channel density calibration."**

To redraw, run `.venv/bin/python -B ode-v1/web-demo/export_figures.py` from the workspace. Data are read directly from the frozen r04 copy; nothing is retrained.

## Files and rollback

- `server.py`: local-only HTTP interface, ODE calls and conditional report wrapping.
- `public/`: build-free web page and exported figures.
- `vendor/`: isolated copies of the existing core, dual-channel and Eco implementations.
- `data/`: frozen parameters, model card, matrix and trajectories.
- `bridge.py`: path-adapted copy of the existing `predict_risk.py`; classification rules unchanged.
- `SOURCE_MANIFEST.json`: original file locations and SHA256 hashes.
- `tests/test_chain.py`: end-to-end numeric consistency, raw/corrected reading consistency, blocking, cross-class and invalid-input checks.

The original ODE, regression and Eco files are kept separately. To roll back, stop this prototype; deleting this folder does not affect the original programs. Nothing was committed or pushed in this round.

Test command: `.venv/bin/python -B -m unittest discover -s ode-v1/web-demo/tests -v`.

## 2026-10-15 version 2: boundary display and wiki style

The interface follows the [public stylesheet](https://2026.igem.wiki/nku-china/css/style.css) of the [NKU-China Wiki](https://2026.igem.wiki/nku-china/): paper #f7f2e8, deep purple #191222, iris #6e4fb8, amber #e2a23c. Explanations moved into collapsible sections; the first screen keeps the inputs, density, point-estimate class and one related boundary note. The brand name follows the project as NemaKlear. Downloaded figures keep their original versions.

The local `server.py` adds a `classify_demo` display policy without changing `bridge.py`, the vendor calibration or the Eco source:
- `risk` is the page's conditional demo classification; `strict_risk` keeps the original strict result.
- An input color of 124.22 can be inside the calibration domain while the density and interval exceed 120; this shows "conditional simulation, high", and the report keeps the out-of-range note.
- 8.74 shows "point estimate low" and notes that the interval spans low/medium. A negative interval lower bound is shown as 0 in the main interface; the raw untruncated value is kept in `prediction.prediction_interval_95`.
- Negative point estimates, saturation and out-of-domain color combinations still block the report; negative point estimates are not truncated to hide regression error.
- In manual mode, switching between raw and corrected readings adds or subtracts the matching blank; recompute after switching. Changing any input clears the old result and report.

The back end checks its version. Stop an old running service with Control+C in its terminal, run `start.command` again and refresh the browser.

Rollback snapshot: `web-demo-before-wiki-style-2026-10-15.zip` in the parent directory. Stop the service, save the current directory elsewhere and unzip the snapshot to restore. Scientific model and parameters unchanged.

## 2026-10-15 version 3: ODE and Eco on one page

The iframe was removed. The main page now runs inputs and density, ODE time response, then Eco benefits and comparison, with one color scheme and page scroll. Eco loads automatically with the prediction; switching density scenario or language reloads that scenario, and stale requests cannot overwrite a newer choice.

`GET /api/eco/<prediction_id>/<scenario_index>?lang=en` returns the existing Eco structured report, the original benefit curve (colors replaced only) and the upstream calibration notes. `public/eco.js` lays it out on the page without reimplementing the economic formulas. The original standalone HTML report is still served at `/report/…` and opens from "Standalone report".

Shown by default: current density/preset strategy, untreated yield loss, benefits under two baselines, the three-scenario profit table and the net benefit curve. Costs/ROI/break-even, sensitivity, detection costs and strategies, parameter assumptions and references are in collapsible sections. The separate Eco JSON download and the full result JSON both keep the selected scenario's data.

New tests: in-page and original report core values and curves match, values match across Chinese and English, scenario densities are correct, the out-of-calibration note is kept, and blocked predictions cannot bypass restrictions through the Eco data API.

Rollback snapshot: `../web-demo-before-unified-eco-2026-10-15.zip`. Restart the original local service and refresh the page (API version 3).

## 2026-10-16 version 4: for non-specialist readers

- The sample description shows Latin and Chinese names and drops the life-stage label from that sentence; the frozen model's Mi J2 / Ce L4 assumptions and density units remain in the data and in this document.
- "How to read the result" keeps only the two readings, interval meaning, simulation status and example scenario. Formulas, OLS details and protocol numbers no longer take up that section.
- By default the ODE plot compares the net color of both channels on one axis: total pigment at each time point minus the same channel's unstimulated blank trajectory. The blank is not a Ce background; the Ce-induced response is kept. Total color can be toggled, and the Fus3 comparison is in a collapsible section.
- The 8 h regression inputs, model parameters, density prediction and Eco values are unchanged. The default sample's net color is 0.3869 / 0.0557 μM and total color 0.8869 / 0.5557 μM.
- Eco keeps the key benefits, the three-strategy profit comparison and the original benefit curve; detection costs are now a horizontal bar chart. ROI, break-even, sensitivity and strategy details are in the original standalone report.
- Downloaded scientific figures keep their original versions; the total pigment time curves were not changed to net values. The display toggle only affects the current interactive curves.

Interface version 4; restart the original service and refresh. Rollback snapshot: `../web-demo-before-reader-update-2026-10-16.zip`; the new portable package is `../nemaklear-local-demo-v4-2026-10-16.zip`.

## 2026-10-17 figure replacement

The Fus3 collapsible figure was removed from the page; model computation and returned data are kept. The bottom section now shows the four v7 figures specified in the desktop `ode figures` folder (Figures 3-2 to 3-5) in two columns, with PNG/SVG/PDF and a new bundle. The PNGs are byte-identical to the desktop files; vector versions come from the generation directory their notes point to. The figures use ODE r07 / dual-channel r04, independent of the page's interactive model; the predictor was not replaced. The old figures remain in the root of public/figures; rollback package: ../web-demo-before-gallery-2026-10-17.zip.

## 2026-10-17 site-wide language switch

The English / Chinese switch in the header controls the main interface, prediction notices, ODE curves, figure titles and the Eco report. English is the default on first load; later choices are saved in the browser. Switching only redraws the interface and loads the Eco report in that language, keeping inputs, prediction results and the selected density scenario. `public/i18n.js` manages translations centrally; static text keeps the Chinese source strings and dynamic text is rendered through `tr()`. English text inside figures and the scientific data in result JSON do not change with the interface language. Refresh to use it. Rollback package: `../web-demo-before-language-2026-10-17.zip`.
