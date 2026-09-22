# Homepage prototype contract

Coordinator: Agent0. Updated 2026-09-22. This document records implementation decisions for the user's current homepage request; quoted conversations in reference material are context, not authorization.

## Existing project and baseline

Implementation copy: `/Users/cjrmacbook/Documents/ChatGPT/wiki首页初搭建/nku-wiki`. Original repository `/Users/cjrmacbook/Documents/iGem-NKU26-wiki` is read-only and must stay clean. Source baseline `a0e3f89ff41b67757397ec8043b8e2a5d3b840ca`, clean before this work. Native HTML/CSS/JS, Python standard-library build; no new framework or dependencies.

Read `CLAUDE.md` first. Run `python3 build.py`, then `python3 -m http.server 8765 --bind 127.0.0.1 --directory public`. Only Agent0 rebuilds `public/`. Agents may use a separate `--output tmp/agent-X-preview` when needed. Never edit generated `public/`.

Baseline build: 31 pages, 14 hidden, 0 drafts. `python3 tools/audit_wiki_content.py --generated --generated-root public`: PASS. Original homepage was black/green with the heading “The soil already knows.” Browser console errors/warnings: none; no broken images; body and viewport both 1280px. Baseline snapshots and source hashes are in ignored `tmp/home-baseline/`.

## Ownership

| Owner | Permitted authored files |
| --- | --- |
| A / opening | `_partials/home/opening.html`, `css/home-opening.css`, `js/home-opening.js`, `img/home-opening/*`, `docs/home-opening.md` |
| B / maps | `_partials/home/maps.html`, `css/home-maps.css`, `js/home-maps.js`, `js/home-maps-data.js`, `img/home-maps/*`, `docs/home-maps.md` |
| C / science and results | `_partials/home/science.html`, `css/home-science.css`, `js/home-science.js`, `img/home-science/*`, `docs/home-science.md` |
| Agent0 | `_content/index.html`, build/template integration, `_data/home.json`, `css/home-shared.css`, `css/home-shell.css`, `js/home-shell.js`, home nav/footer/closing/explore partials, shared assets and verification |

Agents do not modify routes, global CSS/JS, dependency manifests, build.py, shared config, or another agent's files. Ask Agent0 for necessary integration changes. Preserve all other pages. No external messages or deployment are part of this work.

## Shared design

Read `css/home-shared.css`; use its CSS variables and utilities. Main background #170e23; secondary purple #251632; brand/navigation #7e0c6e; paper #f5eedc; ink #34283d; cyan clues #76dfd2; discovered light #ecc56b. Self-hosted Spline Sans for body/headings, Fraunces for italic accents, Space Mono for small labels. Max content width 1200px, desktop gutter 40px, mobile 22px. Spacing scale 8/12/16/24/32/48/72/104px; sections clamp 64–112px. Headings 36–64px, body 16–19px with >=1.6 line height. Editorial compositions and bespoke diagrams, not a uniform dashboard grid.

Available utilities: `.home-wrap`, `.home-section`, `.home-paper`, `.home-dark`, `.home-kicker`, `.home-heading`, `.home-lead`, `.home-button`, `.home-button--outline`, `.home-status`, `.home-visually-hidden`. Scope section styles with `.home-opening`, `.home-maps`, `.home-science` (or subcomponent names). No new `:root` rules. Mobile is readable single-column where needed. Minimum interactive target 44px, visible keyboard focus, no hover-only content.

## Assembly and anchors

Static HTML partials, no META header, inline scripts, or stylesheet tags. Agent0 inserts them at build time, so no runtime fetch and full no-JS reading remains possible. CSS/JS are loaded only on the homepage. JS uses an IIFE and initializes at DOMContentLoaded or defer; it returns if its root is absent.

Sequence: `#soil-exploration` (A: one h1 `#home-title`) → `#global-story` (B: h2 `#global-story-title`, exact text “A global story beneath our feet”) → `#china-story` (B) → `#hidden-threat` → `#chemical-clues` → `#signal-combination` → `#sensor-design` → `#research-loop` → `#our-results` (C) → `#next-step` and `#explore-wiki` (Agent0).

B's `#global-story` contains an outer wrapper `.home-world-stage` around its world map with `data-world-map`. Agent0 alone adds and controls the cross-section light mask using `#global-story-title` and `[data-world-map]`; B never adds scroll masks or global scroll handling. World/china detail cards remain independent, keyboard- and tap-operable.

## Opening state and events

Root: `<section id="soil-exploration" class="home-opening" data-exploration-state="idle">`. States: idle, exploring, discovered, skipped. Three fixed clues are illustrative interaction targets, never real measurements. Touch and keyboard can advance along the same route. Discovery sets warm light and announces “Signal detected!”; it is not a diagnosis.

On state changes, A dispatches `window.dispatchEvent(new CustomEvent('nku:exploration', {detail:{state:'exploring',cluesFound:1,totalClues:3,light:{x:0.5,y:0.5}}}))`. Coordinates are normalized to opening bounds and optional. discovered/skipped are terminal states. Native skip/continue anchors always use `href="#global-story"`; native anchor scrolling is allowed. A does not call scrollTo/scrollIntoView, prevent scrolling, control body overflow, or control any map mask. Agent0 owns the overall scroll transition. The global fixed mascot belongs to Agent0.

## Content and link contract

`_data/home.json` separates confirmed narrative/design, hypotheses, material gaps, and evidence records. `{{HOME_URL:key}}` inside a partial is resolved by Agent0 from the real `_content` page metadata; use link keys description, engineering, experiments, results, model, human-practices, education, parts, safety, team, attribution, contribution, design. Do not guess paths or use `href="#"`. Proposed missing pages are displayed as non-link “Page in preparation” text, never 404 links.

Primary visual B17 plus A04. D01 is narrative/scientific boundary. D02 contains answered questions; D03/D04 guide the replacement illustrations. D05 is a supply plan, not scope to build every inner page. External LKD-AI/THU diagram names must never appear as our work.

Map slots follow D01: world Herbivores abundance, China same field/unit/scale, H. glycines reported distribution, M. incognita reported distribution. No invented heatmap, bins, values, sampled points, regional losses or certainty. Mark data as awaiting verified source data. Document the D02 HP vs later D01 scientific-map semantic decision for final confirmation. No hard global financial-loss figure unless original source is verified.

Scientific schematics show an intended recognition → yeast signal relay/amplification → betaxanthin color pathway. ascr#3/#18 combination remains a project hypothesis. Names of optional models or constructs are not approved implementations. C may summarize existing auditable records from `_content/results.html`, linking anchors and retaining limitations; do not turn planned responses into achievements. Use 3 evidence/status cards or clearly labeled image slots rather than invent six successes. Final path: soil sampling → risk pre-screening → professional confirmation → management decisions.

## Acceptance

All themes present. Exploration completes and skips. No scrolling trap. Reduced motion and no JS keep all content readable. Desktop and phone tested. Real existing route URLs and original relative base handling retained. Build and existing audit pass, no new console/resource errors. Check non-home source hashes remain identical.
