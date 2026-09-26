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
- **Southern root-knot nematode, *Meloidogyne incognita*:** 20-province distribution list carried over from CABI/Plantwise records, https://plantwiseplusknowledgebank.org/doi/10.1079/pwkb.species.33247. That page returned an access restriction here, so the team must compare the final list against the map before release.
- **Xinjiang survey:** Zhou et al. (2024), “The occurrence and genetic diversity of vegetable root-knot nematodes in Xinjiang Uyghur Autonomous Region,” *Journal of Integrative Agriculture*, DOI https://doi.org/10.1016/j.jia.2024.12.008. The survey covered 2021–2023 and found root-knot nematodes in 57 of 130 vegetable samples; this is a survey result, not an annual loss estimate.
- **National southern root-knot loss:** no recent, reliable species-specific China-wide loss figure was found. The homepage does not invent one.

