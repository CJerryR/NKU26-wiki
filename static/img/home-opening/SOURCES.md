# home-opening asset sources

| File | Source image | Processing | Use |
|---|---|---|---|
| opening-foreground.webp (167996 B, sha256 c73c0ba0d55a…c18d) | `references/03-opening-materials/assets/opening-foreground.png`, 1586×992 RGBA, sha256 c0a21df816a2…27c6; team artwork used in the opening design in Figma | Converted to WebP with Pillow (quality 88, alpha_quality 90, method 6) at the original size; no cut-out, redrawing or AI processing; transparency matches the original (mean alpha difference 0.0015) | Opening foreground: trees, ground and roots |
| opening-sky.webp (89982 B, sha256 286c59c2d24c…21d4) | `references/03-opening-materials/assets/purple-background.png`, 1586×992 opaque, sha256 6a0f36192a56…d98d | Converted to WebP with Pillow (quality 72, method 6) at the original size; mean color preserved (24.5/12.5/31.4); compression softens the grain, which the shader adds back | Opening purple night sky |

On portrait phones, the two tree groups are cropped and joined on the canvas at runtime by `home-opening.js` (left 0–21.5%, right 56.5–100%, with a 1.8% faded overlap at the seam). No extra file is stored.

Both images are original team artwork, not third-party licensed material. They are served from iGEM Uploads; references follow `HOME-OPENING-ASSETS.csv`.

## AI-extended soil (2026-10-17)

`soil-extension-ai-v1.png` extends the soil of the second screen. It was generated with OpenAI's built-in image generation at the user's explicit request, using the team's `opening-foreground.webp` as the style and downward-extension reference. The purple-brown soil layers, decorative roots and gravel are artistic background only; they are not micrographs, experimental data or biological evidence. The two original opening images were not redrawn or replaced. At runtime only the underground background is replaced; the nematodes, diseased roots, signals and guided interaction are unchanged.
