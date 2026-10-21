# NKU-iGEM homepage basemap sources

Generated on 2026-09-22. All files here are geographic basemaps. They contain no nematode observations, abundance, disease or distribution data.

## Included files

- `world-base.svg`: `viewBox="0 0 1000 450"`, off-white background, dark purple land, no national boundaries.
- `china-base.svg`: `viewBox="0 0 600 500"`, dark purple background, light land; keeps every island polygon and all 9 maritime indicator lines from the source data.
- `world-china-entry.svg` (optional, not shipped with the first release of the page): uses exactly the same coordinate system as `world-base.svg`; transparent background with China's geographic extent filled, for use as an overlay on the world map entry point. Focus, click handling and accessible names must be provided by the parent page.
- `manifest.json`: version, source SHA-256 hashes, projection, extent, geometry counts and SHA-256 hashes of the generated files.
- `generate_maps.py`: reproducible generator that needs only the Python 3 standard library.
- `map-geometry.json` (optional, not shipped): precompiled SVG path strings and projection parameters, read at build time and embedded into the parent page's SVG. It is not a scientific data interface and does not need to be deployed or requested at runtime.

Previews and the large upstream source files are not shipped with the site. By default the generator caches source files in `nku-home-map-originals/` under the system temporary directory; use `--cache-dir` to change this. Only the static SVG files are loaded by the page.

## Upstream sources and license

The source is the pinned `v5.1.2` release of the Natural Earth maintainer repository. Each theme in that release has its own version number, so release and theme versions differ by design.

| Layer | Theme version | Pinned download URL |
| --- | --- | --- |
| World land, 1:50,000,000 | 4.0.0 | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson |
| Admin 0 countries, China point of view, 1:10,000,000 | 5.1.1 | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries_chn.geojson |
| Maritime indicator lines, China supplement, 1:10,000,000 | 5.1.0 | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_boundary_lines_maritime_indicator_chn.geojson |

The Natural Earth [Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) place all raster and vector map data published on the site in the public domain; modification and electronic distribution are allowed without further permission. Suggested credit: **Basemap: Natural Earth (public domain)**.

Official reference pages:

- [50m Land](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-land/): land polygons including major islands.
- [Admin 0 – Countries point-of-views](https://www.naturalearthdata.com/blog/admin-0-countries-point-of-views/): includes the China POV download; geometry follows each country's de jure view.
- [10m Cultural Vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/): includes the maritime indicators China supplement.
- [Disputed boundaries policy](https://www.naturalearthdata.com/about/disputed-boundaries-policy/): explains the difference between default and POV boundaries.

## Geometry selection and boundaries

The China basemap selects `ADM0_A3 ∈ {CHN, HKG, MAC}` from the China POV file and fills them uniformly. Taiwan is already part of the `CHN` geometry in this edition, so the default `TWN` geometry must not be added on top. The result has 99 land polygons, 99 rings and 15,185 land vertices, plus 9 maritime indicator lines with 135 vertices. The small visible dots are island geometry from the source data, not decoration or observation points.

The world basemap keeps 1,421 polygons, 1,422 rings and 60,669 vertices. No outline smoothing or island removal was applied; the SVG only quantizes projected coordinates to 0.001 viewBox units and uses relative path commands to reduce file size.

China land extent in the source: longitude `[73.602256, 134.772579]`, latitude `[9.679511, 53.569444]`. The maritime indicator lines extend to `3.401132°N`. The China canvas covers the full source extent; the South China Sea is neither cropped nor moved into an inset with a different coordinate system.

Keeping the full source extent does not mean every island and reef has been re-surveyed, nor that this is an official standard map. Natural Earth is a generalized basemap and does not replace the standard map chosen later (see `DATA_SOURCES.md`); its website also documents limits in accuracy and content. If the basemap is replaced, the projection parameters and entry geometry must be replaced with it.

## Projection and data point mapping

Both basemaps use an equirectangular projection with the standard parallel at 0°. Input order is `[longitude, latitude]` (geographic coordinates), not screen coordinates. The projection is not equal-area, so screen area must not be used to infer abundance.

World map (1000 × 450):

```js
const x = (longitude + 180) * 2.5 + 50;
const y = (90 - latitude) * 2.5;
```

The world map has a 50-unit margin on each side. China basemap (600 × 500):

```js
const x = (longitude - 72) * 8.5 + 19.5;
const y = (56 - latitude) * 8.5 + 12;
```

An HTML `<svg>` must keep the same `viewBox`, and overlaid data points must use the same formulas so they scale with the SVG. Do not crop or stretch the basemap separately in CSS or use `object-fit: cover`. GCJ-02 coordinates must be converted before being overlaid as WGS84 longitude and latitude.

Default colors match the shared homepage styles: world background #f5eedc, land without data #d7c4b8; China background #170e23, land without data #c6afd8. Colors only show the basemap shape and do not encode any scientific value. When the SVG is **inlined**, the parent page can override `--map-ocean`, `--map-land`, `--map-outline` or `--map-china-entry`. An SVG loaded through `<img src>` does not inherit CSS custom properties from the parent page, so fixed fallback colors are included.

## Reproduction and verification

```sh
python3 img/home-maps/generate_maps.py --download
# Add --extras to also output the China entry layer and the build-time SVG paths
```

This command downloads the pinned data again, checks every file against the SHA-256 hashes built into the script, and regenerates identical files. Without `--download` it reuses and checks the cached source files. The running site needs no network access, Python, map library or CDN for the basemaps.

Feature, polygon, ring and vertex counts were checked against the source data. A render check confirmed that world outlines, mainland China, Hainan, Taiwan, the islands and the South China Sea indicator lines are all visible, and that every projected coordinate falls inside its viewBox. The China entry overlay shares the world map projection. No scientific markers or sample hotspots were generated.
