/* Homepage map evidence registry.
 * These are literature records, not interpolated abundance values.
 * Province anchors are schematic capitals; they are not detection sites.
 */
(function () {
  'use strict';

  window.NKU_HOME_MAPS = {
    schemaVersion: 1,
    continents: {
      na: {
        name: 'North America',
        summary: 'Soybean cyst nematode is a major soybean constraint in the United States.',
        source: { title: 'Soybean cyst nematodes: a destructive threat to soybean production in China', year: 2021, url: 'https://doi.org/10.1186/s42483-021-00095-w' }
      },
      sa: {
        name: 'South America',
        summary: 'Root-lesion nematodes are documented in Brazilian soybean production systems.',
        source: { title: 'Agricultura de precisão: resultados de um novo olhar', year: 2014, url: 'https://www.embrapa.br/busca-de-publicacoes/-/publicacao/956334/agricultura-de-precisao-resultados-de-um-novo-olhar' }
      },
      eu: {
        name: 'Europe',
        summary: 'Potato cyst nematodes are regulated pests associated with potato production.',
        source: { title: 'Top Ten Most Important U.S.-Regulated and Emerging Plant-Parasitic Nematodes', year: 2022, url: 'https://doi.org/10.3390/horticulturae8030208' }
      },
      af: {
        name: 'Africa',
        summary: 'Banana nematode communities can reduce production in East African highland systems.',
        source: { title: 'East African highland banana production as influenced by nematodes and crop management in Uganda', year: 1999, url: 'https://doi.org/10.1080/096708799228030' }
      },
      as: {
        name: 'Asia',
        summary: 'China and India provide documented examples of nematode pressure on major crops.',
        source: { title: 'Crop Loss Estimations due to Plant-Parasitic Nematodes in Major Crops in India', year: 2020, url: 'https://doi.org/10.1007/s40009-020-00895-2' }
      },
      oc: {
        name: 'Oceania',
        summary: 'Root-lesion nematodes are a long-standing concern in Australian wheat belts.',
        source: { title: 'A triumph of tolerance: managing the threat to wheat production by the root lesion nematode Pratylenchus thornei in eastern Australia', year: 2021, url: 'https://doi.org/10.1079/9781789247541.0002' }
      },
      an: {
        name: 'Antarctica',
        summary: 'No comparable open-field crop-loss case was found for Antarctica; no marker is shown.',
        source: null
      }
    },
    cases: [
      {
        id: 'na-scn-us', lon: -91, lat: 41, region: 'United States', continent: 'na',
        nematode: 'Soybean cyst nematode', species: 'Heterodera glycines', crop: 'Soybean',
        loss: 'More than US$1 billion of soybean yield per year (2006–2009 estimate).',
        source: { title: 'Soybean cyst nematodes: a destructive threat to soybean production in China', year: 2021, label: 'Peng et al. (2021)', url: 'https://doi.org/10.1186/s42483-021-00095-w' },
        status: 'published estimate cited by the source review'
      },
      {
        id: 'sa-rln-brazil', lon: -55.2, lat: -12.1, region: 'Mato Grosso, Brazil', continent: 'sa',
        nematode: 'Root-lesion nematode', species: 'Pratylenchus brachyurus', crop: 'Soybean',
        loss: 'Average loss of 21% of potential yield in a mapped commercial field in the 2011/12 season.',
        source: { title: 'Perda de produtividade da soja em área infestada por nematoide das lesões radiculares na região médio norte do Mato Grosso', year: 2014, label: 'Embrapa (2014)', url: 'https://www.embrapa.br/busca-de-publicacoes/-/publicacao/956334/agricultura-de-precisao-resultados-de-um-novo-olhar' },
        status: 'published field estimate'
      },
      {
        id: 'eu-pcn', lon: 5, lat: 52.5, region: 'Europe', continent: 'eu',
        nematode: 'Potato cyst nematodes', species: 'Globodera pallida and Globodera rostochiensis', crop: 'Potato',
        loss: 'About 9% of world potato production is attributed to the two species in the cited review; both are regulated pests in the EU.',
        source: { title: 'Top Ten Most Important U.S.-Regulated and Emerging Plant-Parasitic Nematodes', year: 2022, label: 'Horticulturae (2022)', url: 'https://doi.org/10.3390/horticulturae8030208' },
        status: 'review estimate; global, not Europe-only'
      },
      {
        id: 'af-banana-uganda', lon: 32.6, lat: 0.4, region: 'Uganda', continent: 'af',
        nematode: 'Burrowing and spiral nematodes', species: 'Radopholus similis and Helicotylenchus multicinctus', crop: 'East African highland banana',
        loss: 'Production was 30–38% lower in infested plots than in clean plots.',
        source: { title: 'East African highland banana production as influenced by nematodes and crop management in Uganda', year: 1999, label: 'Field study (1999)', url: 'https://doi.org/10.1080/096708799228030' },
        status: 'published field comparison'
      },
      {
        id: 'as-scn-china', lon: 126.6, lat: 45.8, region: 'Northeast China', continent: 'as',
        nematode: 'Soybean cyst nematode', species: 'Heterodera glycines', crop: 'Soybean',
        loss: 'More than US$120 million of soybean yield per year (national estimate).',
        source: { title: 'Soybean cyst nematodes: a destructive threat to soybean production in China', year: 2021, label: 'Peng et al. (2021)', url: 'https://doi.org/10.1186/s42483-021-00095-w' },
        status: 'published national estimate'
      },
      {
        id: 'as-ppn-india', lon: 78, lat: 22, region: 'India', continent: 'as',
        nematode: 'Plant-parasitic nematodes, including root-knot nematodes', species: 'Meloidogyne spp. and other PPNs', crop: 'Rice, horticultural and field crops',
        loss: '21.3% crop loss, estimated at Rs. 102,039.79 million (about US$1.58 billion) annually in the study.',
        source: { title: 'Crop Loss Estimations due to Plant-Parasitic Nematodes in Major Crops in India', year: 2020, label: 'Crop-loss study (2020)', url: 'https://doi.org/10.1007/s40009-020-00895-2' },
        status: 'national all-PPN estimate; not species-specific'
      },
      {
        id: 'oc-rln-australia', lon: 150, lat: -28, region: 'Australia', continent: 'oc',
        nematode: 'Root-lesion nematodes', species: 'Pratylenchus thornei and Pratylenchus neglectus', crop: 'Wheat',
        loss: 'About AU$123 million of wheat production losses per year, as reported by UniSQ in 2022.',
        source: { title: 'Integrated management of nematodes delivers for grain growers', year: 2022, label: 'UniSQ (2022)', url: 'https://www.unisq.edu.au/news/2022/06/research-nematode-management' },
        status: 'institutional report of an annual loss estimate; not a current-year valuation'
      }
    ],
    /* v8.1 case photos: representative species images, NOT photographs from the
     * marker locations (see static/img/home-cases/CREDITS.md). Keyed by case id.
     * view defines the display window only; the original files stay intact. */
    photos: {
      "na-scn-us": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-2185d1ca0236-soybean-cyst-on-roots-usda-k5244-6.webp",
        "w": 413,
        "h": 636,
        "view": { "ratio": "4 / 3", "position": "50% 30%" },
        "species": "Heterodera glycines",
        "description": "Soybean cyst nematode females and cysts attached to soybean roots.",
        "imageNote": "Representative image; not a photograph from the mapped site.",
        "alt": "Soybean cyst nematode females and cysts attached to soybean roots.",
        "caption": "Soybean cyst nematode (Heterodera glycines) females and cysts attached to soybean roots. Representative image, not a photograph from this map location.",
        "credit": "Photo: Keith Weller / USDA Agricultural Research Service. Public domain.",
        "source": "https://www.ars.usda.gov/oc/images/photos/sep97/k5244-6/",
        "license": "https://www.ars.usda.gov/oc/images/copyright/"
      },
      "sa-rln-brazil": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-05688ce65a1c-brazil-p-brachyurus-soybean-roots-crop-fig6.webp",
        "w": 322,
        "h": 720,
        "view": { "ratio": "1 / 1", "position": "50% 22%" },
        "species": "Pratylenchus brachyurus",
        "description": "Soybean roots inoculated with Pratylenchus brachyurus.",
        "imageNote": "Greenhouse experiment in Brazil; not a field photograph from the mapped site. Cropped to the Pb root group in Figure 6.",
        "alt": "Soybean roots inoculated with Pratylenchus brachyurus.",
        "caption": "Soybean roots after experimental inoculation with Pratylenchus brachyurus. Cropped from the second root group (Pb) in Fig. 6; a greenhouse experiment in Brazil, not a field photograph from Mato Grosso.",
        "credit": "Machado, Amaro & Silva (2019), PLOS ONE 14:e0221416, Fig. 6 (cropped to Pb group). CC BY 4.0.",
        "source": "https://doi.org/10.1371/journal.pone.0221416.g006",
        "license": "https://creativecommons.org/licenses/by/4.0/"
      },
      "eu-pcn": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-17251e97ea55-g-rostochiensis-cyst-eggs-usda-d813-2.webp",
        "w": 550,
        "h": 640,
        "view": { "ratio": "6 / 5", "position": "50% 45%" },
        "species": "Globodera rostochiensis",
        "description": "A ruptured golden potato cyst nematode cyst with eggs and juveniles.",
        "imageNote": "Representative image of G. rostochiensis; not a photograph from the mapped site.",
        "alt": "A ruptured golden potato cyst nematode cyst with eggs and juveniles.",
        "caption": "A ruptured cyst of the golden potato cyst nematode (Globodera rostochiensis), releasing eggs and juveniles. Representative image; does not depict G. pallida or a European survey sample.",
        "credit": "Photo: Xiaohong Wang / USDA Agricultural Research Service. Public domain.",
        "source": "https://www.ars.usda.gov/oc/images/photos/aug07/d813-2/",
        "license": "https://www.ars.usda.gov/oc/images/copyright/"
      },
      "af-banana-uganda": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-3a873f3710a4-uganda-r-similis-sem-fig3.webp",
        "w": 665,
        "h": 720,
        "view": { "ratio": "665 / 720", "position": "50% 50%" },
        "species": "Radopholus similis",
        "description": "Scanning electron micrographs of the female and male lip regions of Radopholus similis.",
        "imageNote": "Representative micrographs of R. similis; not a photograph from the mapped site.",
        "alt": "Scanning electron micrographs of the female and male lip regions of Radopholus similis.",
        "caption": "Scanning electron micrographs of female and male lip regions of Radopholus similis. Representative morphology, not banana root damage or Helicotylenchus multicinctus.",
        "credit": "Xu et al. (2014), ZooKeys 444, Fig. 3. CC BY 4.0.",
        "source": "https://zookeys.pensoft.net/article/4137/",
        "license": "https://creativecommons.org/licenses/by/4.0/"
      },
      "as-ppn-india": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-1d8b794d7fe5-m-incognita-entering-tomato-root-usda-d2549-1.webp",
        "w": 428,
        "h": 640,
        "view": { "ratio": "1 / 1", "position": "50% 40%" },
        "species": "Meloidogyne incognita",
        "description": "A juvenile southern root-knot nematode entering a tomato root (colorized micrograph).",
        "imageNote": "Representative image; not a photograph from the mapped site.",
        "alt": "A juvenile southern root-knot nematode entering a tomato root (colorized micrograph).",
        "caption": "A juvenile southern root-knot nematode (Meloidogyne incognita) entering a tomato root. Colorized micrograph; representative image, not an Indian field sample.",
        "credit": "Photo: William Wergin and Richard Sayre; colorized by Stephen Ausmus / USDA ARS. Public domain.",
        "source": "https://www.ars.usda.gov/oc/images/photos/jul12/d2549-1/",
        "license": "https://www.ars.usda.gov/oc/images/copyright/"
      },
      "as-scn-china": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-a933560f211c-soybean-cyst-roots-usda-endo.webp",
        "w": 720,
        "h": 483,
        "view": { "ratio": "720 / 483", "position": "50% 50%" },
        "species": "Heterodera glycines",
        "description": "Soybean cyst nematode females and cysts on a soybean root.",
        "imageNote": "Representative image; not a photograph from the mapped site.",
        "alt": "Soybean cyst nematode females and cysts on a soybean root.",
        "caption": "Brown-white soybean cyst nematode (Heterodera glycines) females/cysts on a soybean root. Representative USDA archival image, not a sample collected in China.",
        "credit": "Burton Y. Endo / USDA Agricultural Research Service, via Wikimedia Commons. Public domain.",
        "source": "https://commons.wikimedia.org/wiki/File:Root_cyst_nematode_infection.jpg",
        "license": "https://commons.wikimedia.org/wiki/File:Root_cyst_nematode_infection.jpg"
      },
      "oc-rln-australia": {
        "src": "https://static.igem.wiki/teams/6303/wiki/v8-0/v85-9cd2f86cc954-p-neglectus-usda-commons.webp",
        "w": 720,
        "h": 540,
        "view": { "ratio": "4 / 3", "position": "50% 50%" },
        "species": "Pratylenchus neglectus",
        "description": "Light micrograph of Pratylenchus neglectus.",
        "imageNote": "Representative image of P. neglectus; not a photograph from the mapped site.",
        "alt": "Light micrograph of Pratylenchus neglectus.",
        "caption": "Light micrograph of Pratylenchus neglectus. Representative species image; not Pratylenchus thornei or an Australian field sample.",
        "credit": "USDA Agricultural Research Service, via Wikimedia Commons. Public domain.",
        "source": "https://commons.wikimedia.org/wiki/File:Pratylenchus_neglectus.jpg",
        "license": "https://commons.wikimedia.org/wiki/File:Pratylenchus_neglectus.jpg"
      }
    },
    china: {
      scn: {
        species: 'Heterodera glycines',
        source: { title: 'Soybean cyst nematodes: a destructive threat to soybean production in China', year: 2021, url: 'https://doi.org/10.1186/s42483-021-00095-w' },
        provinces: [
          'Heilongjiang', 'Jilin', 'Liaoning', 'Inner Mongolia', 'Beijing', 'Hebei', 'Henan', 'Shandong', 'Shanxi',
          'Anhui', 'Jiangsu', 'Shanghai', 'Zhejiang', 'Jiangxi', 'Hubei', 'Shaanxi', 'Gansu', 'Ningxia', 'Xinjiang',
          'Guizhou', 'Yunnan', 'Guangxi'
        ],
        loss: '20–30% yield loss is typical in infested fields; 60–70% in severe fields; national loss exceeds US$120 million per year.',
        note: 'Province markers mean a published presence record, not uniform severity or a precise detection site.'
      },
      rkn: {
        species: 'Meloidogyne incognita',
        source: { title: 'Meloidogyne incognita (root-knot nematode), PlantwisePlus Knowledge Bank', year: 'n.d.', url: 'https://doi.org/10.1079/PWKB.Species.33245', checked: '2026-10-17', status: 'Province list checked against the distribution table of CABI datasheet 33245 (cabi.org/isc/datasheet/33245) on 2026-10-17: the 20 provinces listed under China (status Present) match this list exactly. References in the table date from 1986 to 2002 (mainly Yang et al. 1991 and CABI/EPPO 2002). Taiwan is drawn from its own row of the same table (Present; Taylor et al. 1982). Not drawn: Ningxia (named only in the datasheet text, protected cultivation, Yang et al. 1991).' },
        provinces: [
          'Anhui', 'Fujian', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei',
          'Hunan', 'Jiangsu', 'Jiangxi', 'Inner Mongolia', 'Qinghai', 'Shaanxi', 'Shandong', 'Sichuan', 'Yunnan', 'Zhejiang',
          /* v8.2: Taiwan, from its own row of the same CABI table (Present; Taylor et al. 1982) */
          'Taiwan'
        ],
        survey: {
          province: 'Xinjiang',
          record: 'Detected in a 2021–2023 vegetable survey: root-knot nematodes in 57 of 130 samples, M. incognita predominant (Zhou et al. 2026).',
          source: { title: 'The occurrence and genetic diversity of vegetable root-knot nematodes in Xinjiang Uyghur Autonomous Region', authors: 'Zhou et al.', journal: 'Journal of Integrative Agriculture 25(6): 2475–2484', year: 2026, url: 'https://doi.org/10.1016/j.jia.2024.12.008' }
        },
        eastChinaSurvey: {
          samples: 104,
          provinces: 6,
          source: { title: 'Investigation of Root-knot Nematodes in East China', authors: 'Wang Laifa, Yang Baojun, Li Chuandao', journal: 'Forest Research 14(5): 484–489', year: 2001, url: 'https://www.aeeisp.com/lykxyj/cn/article/pdf/preview/2692e214-259c-4e36-9d01-5e61ded0f13c.pdf' },
          note: 'Author order verified on the original PDF English abstract (p. 489); the publisher landing page lists a different order. The 104 samples include multiple root-knot species; M. incognita was dominant, not all 104 samples.'
        },
        note: 'The 21 provinces (20 under China plus the Taiwan row) are presence records from the CABI distribution table, not a national severity or loss estimate; Xinjiang is added from the 2021-2023 survey.'
      }
    },
    photoLicensing: {
      required: true,
      allowed: ['team photograph', 'CC0', 'CC BY', 'US federal public domain'],
      status: 'Seven representative species photos are bundled with author, source URL and licence (photos above); none is a field photo from its marker.'
    }
  };
  window.NKU_HOME_MAPS.CONT = window.NKU_HOME_MAPS.continents;
  window.NKU_HOME_MAPS.CASES = window.NKU_HOME_MAPS.cases;
  window.NKU_HOME_MAPS.SCN = window.NKU_HOME_MAPS.china.scn.provinces;
  window.NKU_HOME_MAPS.RKN = window.NKU_HOME_MAPS.china.rkn.provinces.concat([window.NKU_HOME_MAPS.china.rkn.survey.province]);
}());
