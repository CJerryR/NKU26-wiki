# Prototype verification · 2026-10-15

- 5 automated checks passed: frozen ODE endpoint consistency, raw/blank-corrected reading consistency, saturation/out-of-domain blocking, cross-class scenarios and invalid input.
- Browser checks: default Mi40/Ce80 gives 40.87; manual readings reproduce the result without showing a fake inverted curve; saturation blocks the report; zero signal shows low/medium uncertainty; Chinese and English Eco reports expand.
- Desktop and 390 px narrow screens checked; each of the three PNGs inspected with no overlapping text. Preview: preview.jpg.
- All original files listed in SOURCE_MANIFEST match their frozen copies; bridge only adapts paths.
- This round verifies the program and interface, not biological validity or measured prediction accuracy.

## Version 2 checks

- 8 automated checks passed, adding the numeric cases from two user screenshots and the "only the interval exceeds the upper limit" case.
- Browser reproduces Mi0/Ce200: 8.74, point estimate low, non-negative interval 0–34.60, low/medium notice; the raw negative lower bound can still be exported.
- Browser reproduces Mi120/Ce80: 124.22, conditional simulation high; the report keeps the out-of-calibration notice.
- Raw A480 mode adds the blank automatically, and after back-end subtraction still gives 124.22; manual mode does not fabricate ODE trajectories.
- The original strict classification is kept in strict_risk; scientific model, parameters and source-copy hashes are unchanged.
- Previews use a separate port 8766 without interrupting the original 8765 service; restart the original service before using the new version.
- Desktop and 390 px narrow screen checks passed; screenshot: preview-v2.jpg.

## Version 3 checks

- 11 automated checks passed, including identical values and curve data between the in-page Eco view and the original HTML report, unchanged values across Chinese and English, scenario selection and blocking.
- The page has no iframe; benefit cards, profit comparison, curves and collapsible details are part of the main page DOM.
- Browser checks: report updates for the Chinese point estimate 40.87 and the English interval lower bound 17.60; iframe count 0; desktop and 390 px narrow screens usable.
- Source code and frozen parameter hashes unchanged.

## Version 4 checks · 2026-10-16

- 12 automated checks passed, adding checks that net color equals total color minus blank at every time point, that endpoints match the original regression inputs, and that the blank sample's net trajectory is zero.
- Browser checks: both channels on one axis, net/total toggle, horizontal bar chart of Eco costs; no browser console errors. Preview: preview-v4-reader.jpg.
- Original model, parameters, classification and economic calculations unchanged; only blank trajectory output and the reader interface were added.
- Verified on a separate port 8766, keeping the user's original 8765 service; the test service was stopped afterwards.

## 2026-10-17 language checks

Browser checks: English on first load, round-trip switching between Chinese and English, language kept after refresh, the 40.87 prediction and interval unchanged, the Eco lower-bound scenario kept, and the standalone report link switching to lang=en; manual input and saturation-blocking messages appear in English. The header language switch works at 390 px with no horizontal overflow; no console errors. Numerical computation unchanged; no refitting. Screenshot: preview-english-2026-10-17.jpg.
