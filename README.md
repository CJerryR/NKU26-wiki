# NKU-China 2026 Wiki — NemaKlear

Source code for the wiki of **NKU-China** (Nankai University, Tianjin, China), iGEM 2026 team **#6303**. NemaKlear is a dual-channel detection system for plant-parasitic nematodes in agricultural soil. The wiki presents the project design, wet-lab results, models, human practices and the team behind them.

- **Live wiki:** <https://2026.igem.wiki/nku-china/>
- **Source (official):** <https://gitlab.igem.org/2026/nku-china>
- **Development mirror:** <https://github.com/CJerryR/NKU26-wiki>

Current release: **V10.2.47**. The official GitLab `main` branch is the authoritative source.

## Site map

| Section | Pages |
| --- | --- |
| Home | Soil and nematode story, world and China maps, detection workflow, Human Practices data map, four interactive DBTL cycles, six result cards |
| Project | Description, Background, Engineering, Contribution |
| Wet Lab | Parts and Collections, Experiments, Results, Safety |
| Model | Overview, Molecular Docking, Molecular Dynamics, ODE & Dual-Channel Modeling, Economic Benefit |
| Human Practices | Overview, Integrated Human Practices, Education, Investigation, Industry Engagement and Support |
| Team | Members, Attributions |

The homepage is a scroll-driven interactive narrative; inner pages open with paper-cut illustrations. The site provides full-text search, a floating table of contents, light and dark themes, and layouts for desktop, mobile, landscape and short screens.

The Model pages embed the model authors' complete program. Visitors can enter raw readings, view ODE curves, run dual-channel estimation, compare economic strategies and download a report. The Python code runs in the browser through Pyodide, so no Python backend is required.

Members and Attributions cover all 27 team members, including 138 individual contribution entries and a table of partner support. The footer holds team navigation, the Nankai University emblem, supporting organizations, licensing and the AI-use statement. Optional pages that are not in use generate no navigation entries.

## Tech stack

- [Astro](https://astro.build/) 5 static site generator
- [TinaCMS](https://tina.io/) for structured content editing
- Three.js and plain JavaScript for homepage interaction
- Pyodide for the in-browser model
- GitLab CI/CD and GitLab Pages for build and deployment

## Getting started

Requirements: **Node.js 22** (see `.nvmrc`) and **Python 3**. Dependency versions are locked in `package-lock.json`.

```bash
npm ci --no-audit --no-fund
npm run dev
```

- Site preview: <http://127.0.0.1:3000/>
- Tina editor: <http://127.0.0.1:3000/admin/index.html>
- The Tina server also uses ports 4101 and 9101.

To use TinaCloud, copy `.env.example` to `.env` and fill in the read-only token. Never commit `.env`.

## Repository layout

| What to change | Where |
| --- | --- |
| Page text, captions, tables, members and contributions | `content/wiki/*.json` |
| Tina fields and component templates | `tina/config.ts`, `tina/toolkit.ts` |
| Homepage sections | `src/home/sections/` |
| Homepage scripts and styles | `static/js/`, `static/css/` |
| Navigation, footer links and reading order | `src/data/nav.ts` |
| Footer and supporting organizations | `src/components/site/SiteFooter.astro`, `src/data/site.json` |
| Page layouts and shared components | `src/layouts/`, `src/components/` |
| Opening scenes and sprite atlases | `src/data/scenes/`, `src/data/scenes.ts` |
| Typography, themes and mobile styles | `src/styles/` |
| Model authors' original program | `vendor/nemaklear-original/` |
| In-browser model adapter | `src/nemaklear/`, `tools/prepare-nemaklear.mjs` |
| Asset URLs and content provenance | `content/cdn-assets.json`, `content/wiki-provenance.json` |
| Homepage map data sources | `DATA_SOURCES.md` |
| Build, test and audit scripts | `tools/` |

`content/wiki/*.json` is the single source of page content. The Markdown files in `src/content/pages/` are generated from it, so do not edit them by hand. After saving in Tina, run `node tools/export-tina.mjs` to sync; the build also exports automatically.

Files in `vendor/nemaklear-original/` are checked against `MANIFEST-SHA256.json` at build time and must stay byte-identical to the authors' delivery.

## Testing and building

```bash
npm run test:homepage
npm run test:deployment
npm run test:captions
npm run test:media
npm run test:theme
npm run verify
```

`npm run verify` exports content, builds the static site into `public/` and runs the technical audit. `npm run preview` serves the built site; the address is printed in the terminal.

## Deployment

GitLab Pages builds from the default branch `main`. The pipeline in `.gitlab-ci.yml` runs the deployment tests, builds the site, runs the content-structure, caption and preview audits, and publishes `public/`. The build verifies asset dependencies, removes unreferenced assets and rewrites in-site links to relative paths.

Before every build, `tools/check-release-history.py` checks that the version in `static/release.json` has an entry in the changelog below, with a numbered list of changes and a timestamp, and that the previous release records its publication time.

## Assets and licensing

Images, fonts and scene atlases are served from the official iGEM asset host (`static.igem.wiki`); videos are hosted on iGEM Video Universe. Original files, asset hashes, atlases and provenance records are kept in `content/`.

Unless stated otherwise, wiki content is released under [CC BY 4.0](LICENSE), as required by iGEM. University emblems and the logos of institutions and companies belong to their owners and are used for identification only. Third-party licenses are listed in `docs/licenses/` and next to the bundled files they cover. AI-generated illustrations are decorative only and are never presented as experimental images or model results.

## Changelog

Times are Beijing time (UTC+8). Earlier releases are recorded in the Git history.

### V10.2.47

Prepared: 2026-10-21 22:36:40 (UTC+8)

1. Center the China introduction, species switch and readout vertically on desktop in both 3D and fallback views; retain natural mobile flow.
2. Center What we built and Explore together, including large-screen scaling. Place the team and GitLab footer icons together before text links.
3. Use consistent 4:3 frames for five photo groups in Investigation, Integrated Human Practices and Education, retaining original image links.
4. Body search results open the matching chapter and display its relevant excerpt.
5. Rewrite the repository README and supporting source documents in English, retaining the current and previous release records.
6. Exclude the horizontal map-shift experiment withdrawn by the user; preserve scientific text and review status.

### V10.2.46

Published: 2026-10-21 22:02:43 (UTC+8)

1. Homepage Tibet soil map: 18 approximate source points; 289 samples across 31 sites, 232 of them from Tibet. Bar heights use square-root scaling. Added figure numbers, three sampling photos and the full text of the USTC exchange.
2. Integrated Human Practices Figure 4 uses the latest map screenshot, consistent with the homepage source points.
3. Cross-page links use the full name "Integrated Human Practices"; the homepage Survey and Human Practices entries are kept as they are.
4. Homepage copy now reads "Redesign on the computer" and "Engineer the pathway". Improved slow mouse-wheel input, the 3D pixel budget and the fixed layout on 4K screens.
5. Results references merged into a single numbered list, with fixed links and site-wide copy formatting. In-paragraph links inside HTML blocks now render correctly.
6. Shorter tables of contents for Results and Attributions with unified References. Restored the sfGFP abbreviation, full-width Results figure pairs and correct text wrapping around figures.
7. Removed internal team documents and unused files from the repository.

### V10.2.45

Published: 2026-10-21 20:18:15 (UTC+8)

1. Homepage DBTL overview uses the team's new design with four goals and 14 modules, keeping expand and zoom interaction.
2. Overview stays in the table of contents without a number; the 34 Results stage headings match the table of contents.
3. Footer adds the official logo of the Nankai University College of Computer Science; updated footer credits; replaced one member photo in Members and Attributions.
4. Removed the review interface, orphaned pages and unused repository files.

## Team

NKU-China 2026, Nankai University, Tianjin, China. See the [Members](https://2026.igem.wiki/nku-china/team/) and [Attributions](https://2026.igem.wiki/nku-china/attributions) pages for everyone who contributed.
