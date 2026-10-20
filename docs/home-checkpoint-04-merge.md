# Homepage checkpoint 04 integration

Source archive: homepage-debug-checkpoint-04.zip
SHA256: 2e860cd53401ae6b5de11287e8f985377a6544f9bbb4889fe0f37bed9f284b00
Claude baseline: cf4bb980e8951d7fcadfbbafcde63cca4fe70d3c
Official main fetched before merge: 9e9fa070857d872d29a4759c53c9e362ed9c70ab

The archive CRC, relative paths and file types passed audit. Applying its cumulative patch to cf4bb98 reproduced all nine submitted files byte for byte. Only checkpoint 04 was imported; 03 was not separately applied. The explanatory checkpoint document is supporting evidence, not proof of tests or permission to publish.

## Conflict decisions

- The returned opening markup reintroduced a button inside the title grid, conflicting with cc92cda's removal to restore grass/sprout occlusion. The user chose to keep Start exploring and relocate it out of the title layout. It is now an absolutely positioned sibling in the stage, bottom right. It fades/hides during descent and returns at the surface. The original title bottom remains 484.55px at 1280×720.
- Merging current main conflicted only in the footer QR reference. The latest official high resolution CDN QR was preserved. The unused old local 144px PNG was removed; its original bytes remain in local task history and the previous export package.
- No scientific manuscript, data, citation or figure source was changed. Existing six-card sizing, alignment, footer links and loop Back to top remain.

## Additional defect corrected

The incoming gatedWheel admission function allowed a spent gesture to trigger again via its `insist` branch once the hold plus 500ms elapsed. Two scene-level regression cases failed on the incoming implementation. Removing that bypass enforces one camera action per gesture. Tests cover long-lived spent momentum, one fresh gesture/one action, and reversal of an internal shot. The five supplied gesture-segmentation tests are also retained and included in test:homepage.

## Validation

- npm run verify: full 30-page build and content technical audit PASS. Existing scientific/team-review warnings remain.
- npm run test:homepage: 31/31 PASS, including complete no-WebGL surface/descent restoration for the relocated start button.
- Deployment regression checks: 46 Node tests and 17 Python tests PASS.
- JavaScript syntax and git diff --check PASS; browser error log empty in this pass.
- Real local homepage includes its actual navigation/footer, unlike the submitted synthetic fixture.
- 1280×720: opening occlusion preserved; Start exploring enters soil scan and hides; world coach visible; China 0→1→2 and 2→1 verified.
- 1280×577: paged mode active; Explore grid bottom 552.23px within 577px.
- 1536×730: Explore grid bottom 675.98px within 730px.
- 1920×945: Explore grid bottom 824.84px within 945px.
- 390×664: China heading and species switch precede the map/readout; no horizontal overflow; Start exploring enters soil scan.
- 360×640 and 430×740: start button within viewport; no horizontal overflow.
- These are browser viewport checks, not physical-phone, Safari, Firefox or iPad acceptance. Continuous scrolling during heavy 3D can delay browser automation commands; actual touchpad feel and preferred hold duration still need human review.

The submitted known issues remain recorded: short-phone flight step bar can scroll out; phone HP description can overlap the detective slightly. No claim is made that every section at every target size was independently rechecked here. Screenshots and detailed archive audit are in workspace/evidence/home-checkpoint-04/ at the workspace root.

## Publication

Not published by this chat. Only the release bot may integrate and publish under root AGENTS.md. Use the delta against the latest official main and preserve all newer parallel work. The old task's original media blob exists in local history; do not merge that media history into a push. Create a media-clean candidate from the scoped delta and run the required whole-push-range media checks. Existing source history and original assets remain local.
