# The hidden threat — v6.7 version (retired in v7.4)

v7.4 switched the homepage's "The hidden threat" page back to the v6.1 layout
(four soil blocks, lens, one stage per scroll), as the team asked.
The 3D-v3-based version that ran from v6.2 to v7.3 is kept here.

To bring it back:
1. copy `threat.html` to `src/home/sections/threat.html`
2. copy `home-threat.js` to `static/js/home-threat.js`
3. copy `home-threat3d.css` to `static/css/` and add `'home-threat3d'` back to
   the `styles` list in `src/layouts/HomeLayout.astro`
