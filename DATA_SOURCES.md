# Homepage data sources

Checked and generated on 2026-09-25. This file records the data currently
used by the homepage maps. The geographic basemap is separate from the
scientific observations and remains Natural Earth public-domain geometry.

## A. Global plant-feeding nematode abundance

- **Source:** van den Hoogen et al. (2020), “A global database of soil nematode abundance and functional group composition,” *Scientific Data* 7:103. DOI: https://doi.org/10.1038/s41597-020-0437-3
- **Data file:** https://raw.githubusercontent.com/hooge104/2020_global_nematode_dataset/master/data/nematode_aggregated_wCovariateData.csv
- **Fields copied:** `Pixel_Long` → `lon`, `Pixel_Lat` → `lat`, `Herbivores` → `value`.
- **Unit:** individuals per 100 g dry soil.
- **Result:** 1,901 valid points from 1,933 rows; 32 rows skipped because `Herbivores` was `NA`; no out-of-bounds or negative rows.
- **Processing:** source values are copied without interpolation, aggregation, or rounding. The page uses `log10(Herbivores + 1)` only for color mapping.
- **License:** CC0 1.0 Universal, https://creativecommons.org/publicdomain/zero/1.0/
- **Download date:** 2026-09-25.
- **Source CSV SHA-256:** `1d22daf9dee91c8d8ffb63f5c794bb19bb7766e938a076af567cfbf53bda75a1`.
- **Generated file:** `js/home-abundance.js`; generator: `tools/build_abundance.py`.

## B. World cards and case markers

The registry is in `js/home-maps.js`. Each case has a region, taxon, crop,
loss statement, title, year and URL. The seven markers are six continental
agricultural examples plus a second Asia example; Antarctica has no comparable
open-field crop-loss case and therefore has no marker.

| Marker | Nematode and crop | Loss statement | Source |
|---|---|---|---|
| United States | *Heterodera glycines*, soybean | More than US$1 billion of soybean yield per year, 2006–2009 estimate | Peng et al. 2021, https://doi.org/10.1186/s42483-021-00095-w |
| Mato Grosso, Brazil | *Pratylenchus brachyurus*, soybean | 21% average loss of potential yield in one mapped commercial field, 2011/12 | Embrapa, *Agricultura de precisão: resultados de um novo olhar* (2014), https://www.embrapa.br/busca-de-publicacoes/-/publicacao/956334/agricultura-de-precisao-resultados-de-um-novo-olhar |
| Europe | *Globodera pallida* and *G. rostochiensis*, potato | About 9% of world potato production in the cited review | Kantor et al. 2022, https://doi.org/10.3390/horticulturae8030208 |
| Uganda | *Radopholus similis* and *Helicotylenchus multicinctus*, banana | 30–38% lower production in infested plots | Speijer et al. 1999, https://doi.org/10.1080/096708799228030 |
| Northeast China | *Heterodera glycines*, soybean | More than US$120 million of soybean yield per year nationally | Peng et al. 2021, https://doi.org/10.1186/s42483-021-00095-w |
| India | *Meloidogyne* spp. and other plant-parasitic nematodes, rice and other crops | 21.3% crop loss; Rs. 102,039.79 million annually in the study | Kumar et al. 2020, https://doi.org/10.1007/s40009-020-00895-2 |
| Australia | *Pratylenchus thornei* and *P. neglectus*, wheat | About AU$123 million per year, ten-year average to 2008 | Murray & Brennan 2010, cited by GRDC 2012; exact paper URL still needs team verification |

The Australia marker is stored with a `team should replace` status because the
available citation is secondary and the exact GRDC page was not reliably
resolvable in this environment. It should not be presented as independently
verified until the team confirms the original report.

Crop photographs are not bundled. Add only a team photograph, CC0 asset or
CC BY asset, together with photographer/author, source URL and license.

## C. China records

`js/home-maps.js` stores province-level records separately from schematic map
anchors. A marker means “reported in this province,” not that the entire
province is infested or that the marker is a sampling site.

- **Soybean cyst nematode, *Heterodera glycines*:** 22 provincial-level records listed in Peng et al. (2021), DOI https://doi.org/10.1186/s42483-021-00095-w. The same paper supports the 20–30% typical field loss, 60–70% severe-field loss and national estimate above US$120 million per year.
- **Southern root-knot nematode, *Meloidogyne incognita*:** CABI datasheet 33245 (the same datasheet as PlantwisePlus Knowledge Bank PWKB.Species.33245, https://doi.org/10.1079/PWKB.Species.33245; v8.1 fixed an old link to 33247, the wrong species). **v8.2 check (2026-10-17):** the province list was compared with the datasheet's distribution table (https://www.cabi.org/isc/datasheet/33245). China is listed as *Widespread*; the 20 provinces under it (all *Present*) are Anhui, Fujian, Guangdong, Guangxi, Guizhou, Hainan, Hebei, Heilongjiang, Henan, Hubei, Hunan, Jiangsu, Jiangxi, Nei Menggu (Inner Mongolia), Qinghai, Shaanxi, Shandong, Sichuan, Yunnan and Zhejiang, which match the map exactly. The table's references date from 1986 to 2002 (mainly Yang et al. 1991, *Afro-Asian Journal of Nematology* 1(1): 91–93, and CABI/EPPO 2002); the card says so. Taiwan is drawn (team decision, 2026-10-17) from its own row of the same table (*Present*, Taylor et al. 1982), so the card counts 21 provincial-level regions with references from 1982 to 2002. Not drawn: Ningxia (named only in the datasheet text as a protected-cultivation record, Yang et al. 1991).
- **Xinjiang survey:** Zhou et al. (2026; online 2024), *JIA* 25(6): 2475–2484, “The occurrence and genetic diversity of vegetable root-knot nematodes in Xinjiang Uyghur Autonomous Region,” *Journal of Integrative Agriculture*, DOI https://doi.org/10.1016/j.jia.2024.12.008. The survey covered 2021–2023 and found root-knot nematodes in 57 of 130 vegetable samples; this is a survey result, not an annual loss estimate.
- **National southern root-knot loss:** no recent, reliable species-specific China-wide loss figure was found. The homepage does not invent one.


## D. v8.1 display changes (China map)

- One species on the map at a time (switch above the map). Soybean cyst nematode = circles, southern root-knot nematode = triangles; one flat marker per province at the schematic anchor (no stems, no clusters).
- The Xinjiang survey is no longer a gold map category; Xinjiang is an ordinary *M. incognita* record (from Zhou et al.) and the survey is the third tab (Xinjiang survey) of the root-knot species card (v8.2: tabs replace the expanding sections, so the card keeps one height and never covers the map).
- The "Northeast" and "Huang-Huai-Hai" rings/labels were removed: they were editorial highlights, not data.
- US$120 million+ is labelled as a historical estimate cited by Peng et al. 2021.

## E. World case photos (v8.1)

Seven representative species photos, see `img/home-cases/CREDITS.md`. They are not photographs from the marker locations.

## China base map (v8.2)

Every China map on the homepage (the 3D China map and its 2D stand-in, the world map's China shape, the dot-grid China maps) now uses the **Standard Map of China** (中国地图, English edition, 1:14 000 000, vertical layout with the South China Sea), Ministry of Natural Resources of the PRC, standard map service, **review no. GS(2022)4308** (自然资源部 监制). The review number is printed under the China map, in the world map caption and in the homepage footer.

How it was taken from the sheet (`tools/china_standard_map.py`, output `data/china-standard-map.json`): the CorelDRAW EPS paths were read directly; the province and island fills (plus the South China Sea island symbols) were merged into one land mask at about 1 km per pixel and traced; the ten dashes of the national boundary in the South China Sea were taken from the boundary symbol. The sheet was georeferenced by fitting a projection (oblique Lambert azimuthal equal-area, centre about 103.9°E 34.7°N, plus a similarity transform; median error about 3.5 km) and converted to lon/lat, then drawn in the site's existing China frame. Boundaries, islands and the dash line come from the sheet; they were not redrawn. The world map outside China is still Natural Earth.

## H. Human Practices maps ("Closer to home", v8.5, 2026-10-17)

Generated file: `js/home-hp-data.js`; generator: `tools/build_hp_maps.py`
(`extract` → `survey` → `build`). Drawn by `js/home-maps.js` (function `hp`).

**Base map.** Outline, islands and the ten-dash line: Standard Map of China
GS(2022)4308 (section G / `data/china-standard-map.json`, unchanged).
Province boundaries: 中国地图（分省设色）1:1100万，界线版，无邻国，有河流,
review no. **GS(2022)4303**, Ministry of Natural Resources (自然资源部 监制),
standard map service. EPS SHA-256 `e7346083eed8c7df24c4a5edae5690ad932d6b46d674105e4c2bf6a9224ff4cb` (not stored in the repo).
33 province fills read from the EPS (Macao has no separate fill at this scale and
is not drawn as a polygon); each is identified by the provincial capital it
contains (smallest containing fill, because Hebei lies under Beijing/Tianjin and
Guangdong under Hong Kong on the sheet; the sheet's drawing order is kept).
Projection fitted to the sheet: Albers equal-area conic, standard parallels
25°N/47°N, central meridian 109.87°E, plus similarity transform; fitted against
the GS(2022)4308 outline, median distance ≈1 pt (≈4 km), 90th percentile ≈3 pt.
Output: `data/china-provinces-standard.json` (lon/lat), simplified for the page
to 7,088 vertices (Douglas–Peucker 0.025°, small rings 0.01°).

**Survey layer.** 农业线虫问题认知与需求调查（中文版）, 369 records, submitted
2026-04-14 to 2026-08-06; field Q1 “您的所在地” (province-city chosen by the
respondent). Workbook SHA-256 `561935ebd3b5bee224b3c477890b88e518095751eded004ab002669b4509cd7b` (not stored in the repo; it holds IP
addresses and contact details). Only counts per province and per city are kept:
`data/hp/survey-locations.json`. Counts match the team's PDF summary exactly
(Shandong 171, Tianjin 99, Beijing 18, Hebei 17, Guangdong 11, …; 23 provinces,
56 places). Choropleth classes (responses per province), every class non-empty:
1–2 (9 provinces), 3–5 (7), 6–20 (5), 21–100 (Tianjin), ≥101 (Shandong); no
responses = neutral fill. Tooltip: count, share of 369, top three cities.
Caveat shown on the page: 72.4 % of respondents are students or researchers and
73.2 % are from Shandong or Tianjin, so the map shows the survey's reach, not
nematode occurrence.

**Teaching layer.** Team sign-up table (分队 / 服务地点 / 报名学生人数), 8 sites,
about 397 students (Tianjin Shangyouli “约10”). `data/hp/teaching-sites.json`.
Markers at the county/district seat (≈10–20 km); circle area ∝ students.
Nanjiangxili community: district not confirmed, marker in central Tianjin.

**Soil layer.** Team soil sample log, records 1–6 (7–16 empty): 34 samples,
6 sites, 4 provinces. `data/hp/soil-samples.json`. Markers at the
county/district/city named in the log; bar height linear in samples (1–25).
Collector names are not shown on the map. Ascaroside content: not yet measured.
