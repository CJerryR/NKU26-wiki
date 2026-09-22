# Opening exploration — Agent A

Implemented in the working copy `nku-wiki`, using the shared [homepage contract](home-prototype-contract.md). Original `/Users/cjrmacbook/Documents/iGem-NKU26-wiki` was read only. No routes, global styles/scripts, build logic, dependencies, map components, or fixed mascot containers were changed by Agent A.

## Files and assembly

- `_partials/home/opening.html`: `#soil-exploration`, one `h1#home-title`, scene, three native clue buttons, guided button, live discovery feedback, and native skip/continue links.
- `css/home-opening.css`: styles scoped to `.home-opening`; uses shared home tokens, fonts, and utility classes. Pointer light is a CSS radial mask/gradient; chemical clues, controls, and feedback are page elements.
- `js/home-opening.js`: dependency-free, idempotent IIFE. Initialize at DOMContentLoaded or load with `defer`. It returns safely on pages without the component.
- `img/home-opening/soil-scene.svg`: decorative, code-authored soil, roots, vegetation, strata, and mineral texture.
- `img/home-opening/nematode.svg`: transparent, code-authored orange nematode character based on A06's visual direction.

Agent0 includes the partial in the existing home build and loads the section CSS/JS only on the homepage. All asset URLs are relative, retaining the project's existing base-path handling. No runtime fetching is required.

## State and events

Root starts with `data-exploration-state="idle"`; after initialization it also has `data-opening-ready="true"` and `data-clues-found="0"`.

States: `idle` → `exploring` → `discovered`, or `idle` / `exploring` → `skipped`. `discovered` and `skipped` are terminal until page reload. Continued pointer movement, repeated button activation, or following the continue link cannot duplicate discovery or turn discovery into a skip.

On state changes and new clue collection, dispatch on **window**:

```js
window.addEventListener('nku:exploration', ({ detail }) => {
  // detail.state: idle | exploring | discovered | skipped
  // detail.cluesFound: number of distinct illustrative clues inspected
  // detail.totalClues: 3
  // detail.light: { x, y }, normalized to the entire opening section
});
```

Example: `{ state: 'discovered', cluesFound: 3, totalClues: 3, light: { x: 0.69, y: 0.73 } }`. The example y coordinate varies with layout. Coordinates are clamped to `[0,1]` and computed from current bounds at dispatch. They represent the flashlight, not samples or measured data. Events are emitted on meaningful changes, not every pointer frame. Consumers that attach late can query the root data attributes.

Inspecting the target directly can complete discovery with fewer than three clues inspected. The count honestly preserves that route; three clues are not a requirement to continue. The guided button follows all three in order.

Both skip/continue links use `href="#global-story"`. A skip event fires synchronously before native anchor navigation; no `preventDefault`, scroll locking, `scrollTo`, `scrollIntoView`, body-overflow changes, or map masks are used by this component. After discovery, these links preserve `discovered` and read “Continue the story.” Agent0 owns the global transition and all map reveal behavior.

## Interaction and accessibility

- Mouse/pen: light follows the pointer, batched to at most one pending animation frame. Move close to a fixed clue to inspect it; reaching the nematode completes discovery.
- Touch: tap soil to place the light, tap a clue/target, or use **Follow the next clue**. Vertical gestures are left to the browser (`touch-action: pan-y pinch-zoom`); canceled/moved gestures do not count as taps.
- Keyboard: native buttons work with Enter/Space. Focusing a clue moves the light to it before activation, keeping it visible. The guided button retains focus after completion and uses `aria-disabled` with a guarded handler.
- Feedback: `role="status"` / polite live region announces meaningful clue progress and **Signal detected!**; warm light and text persist without a timed requirement.
- Reduced motion: CSS animation and transitions are disabled, while direct light placement and every discovery/skip control remain functional. Decorative beacons pause when the field is offscreen or the document is hidden. There is no continuously running JS animation loop.
- No JavaScript: a static soil/nematode illustration, explanation, evidence note, and native reading links remain available; the guided control stays hidden.

## References, mascot ownership, and replacement assets

Read B17 for overall atmosphere; A04 for flashlight/feedback notes; A06 for the character; A07 for root/soil texture; D01 for narrative and scientific boundaries; A16/A17 for the transition handoff only. Historical messages were treated as context, not new action authorizations.

The independent supplied mascot is existing artwork. It is not duplicated in this partial: **Agent0 owns and renders the sole site-wide fixed mascot** using the supplied asset. The original independent file matches `/Users/cjrmacbook/Documents/ChatGPT/wiki-首页/work/refs/mascot.png` byte for byte (SHA-256 `419c661104109bb93d23afcbcd89e416535f0531d904290815abadb39b23c2a0`). No redrawn mascot is needed.

The two new SVGs are replaceable prototype illustrations, not final scientific art. A06 is a white-background JPEG and A07 is a monochrome reference, so neither was presented as a final transparent scene asset. A team-reviewed transparent nematode and final soil artwork can replace the two SVG files with the same URLs/layout. B17 was not used as a flattened webpage background. No additional illustration or data asset is required to run this version.

Always-visible wording: **Illustrated chemical clues · not measured data**. Cyan points and the clue count describe the interaction. They do not encode abundance, concentrations, ratios, thresholds, species identification, or a diagnosis. The discovery text explicitly calls the nematode illustrated.

## Verification

Chrome 153 via installed Playwright/Chrome, without installing dependencies. Reproducible local fixture and check script are in ignored `tmp/agent-a-preview/`; this fixture is for QA only, not a replacement site. `node --check js/home-opening.js` passes; both SVGs parse as XML.

Verified desktop at 1440px and after resize to 900px:

- Three mouse inspections, warm feedback, exactly one discovered event, normalized light coordinates.
- Idle skip emits only one `skipped`; native anchor navigation reaches `#global-story`.
- Continue after discovery preserves discovery state.
- Keyboard clue focus, Enter/Space, three-step route, focus retention after completion.
- Target hit area remains aligned after viewport change and scrolling.

Verified 390px touch emulation:

- Soil tap updates the light; no horizontal overflow; touch-specific prompt appears.
- Browser touch swipe scrolls normally and does not accidentally discover the target.
- Three guided taps, direct target tap, and native skip each work.

Also verified reduced-motion interaction, disabled decorative animation, and no-JavaScript static fallback plus native skip. No page errors or broken opening images occurred. Physical phone testing is still a separate device-level check; this record describes browser touch emulation.

Also tested the assembled main project at `http://127.0.0.1:8765/`: desktop and touch discovery, native skip/continue to the actual map anchor, one home title, no page errors, and no phone-width overflow. The existing supplied mascot is rendered by the coordinator's global container. Final code received an independent read-only review with no actionable defects found.

Final integrated preview is managed by Agent0 at `http://127.0.0.1:8765/`. Only Agent0 rebuilds `public/`.
