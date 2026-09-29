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
        source: { title: 'Soybean cyst nematodes: a destructive threat to soybean production in China', year: 2021, url: 'https://doi.org/10.1186/s42483-021-00095-w' },
        status: 'published estimate cited by the source review'
      },
      {
        id: 'sa-rln-brazil', lon: -55.2, lat: -12.1, region: 'Mato Grosso, Brazil', continent: 'sa',
        nematode: 'Root-lesion nematode', species: 'Pratylenchus brachyurus', crop: 'Soybean',
        loss: 'Average loss of 21% of potential yield in a mapped commercial field in the 2011/12 season.',
        source: { title: 'Perda de produtividade da soja em área infestada por nematoide das lesões radiculares na região médio norte do Mato Grosso', year: 2014, url: 'https://www.embrapa.br/busca-de-publicacoes/-/publicacao/956334/agricultura-de-precisao-resultados-de-um-novo-olhar' },
        status: 'published field estimate'
      },
      {
        id: 'eu-pcn', lon: 5, lat: 52.5, region: 'Europe', continent: 'eu',
        nematode: 'Potato cyst nematodes', species: 'Globodera pallida and Globodera rostochiensis', crop: 'Potato',
        loss: 'About 9% of world potato production is attributed to the two species in the cited review; both are regulated pests in the EU.',
        source: { title: 'Top Ten Most Important U.S.-Regulated and Emerging Plant-Parasitic Nematodes', year: 2022, url: 'https://doi.org/10.3390/horticulturae8030208' },
        status: 'review estimate; global, not Europe-only'
      },
      {
        id: 'af-banana-uganda', lon: 32.6, lat: 0.4, region: 'Uganda', continent: 'af',
        nematode: 'Burrowing and spiral nematodes', species: 'Radopholus similis and Helicotylenchus multicinctus', crop: 'East African highland banana',
        loss: 'Production was 30–38% lower in infested plots than in clean plots.',
        source: { title: 'East African highland banana production as influenced by nematodes and crop management in Uganda', year: 1999, url: 'https://doi.org/10.1080/096708799228030' },
        status: 'published field comparison'
      },
      {
        id: 'as-scn-china', lon: 126.6, lat: 45.8, region: 'Northeast China', continent: 'as',
        nematode: 'Soybean cyst nematode', species: 'Heterodera glycines', crop: 'Soybean',
        loss: 'More than US$120 million of soybean yield per year (national estimate).',
        source: { title: 'Soybean cyst nematodes: a destructive threat to soybean production in China', year: 2021, url: 'https://doi.org/10.1186/s42483-021-00095-w' },
        status: 'published national estimate'
      },
      {
        id: 'as-ppn-india', lon: 78, lat: 22, region: 'India', continent: 'as',
        nematode: 'Plant-parasitic nematodes, including root-knot nematodes', species: 'Meloidogyne spp. and other PPNs', crop: 'Rice, horticultural and field crops',
        loss: '21.3% crop loss, estimated at Rs. 102,039.79 million (about US$1.58 billion) annually in the study.',
        source: { title: 'Crop Loss Estimations due to Plant-Parasitic Nematodes in Major Crops in India', year: 2020, url: 'https://doi.org/10.1007/s40009-020-00895-2' },
        status: 'national all-PPN estimate; not species-specific'
      },
      {
        id: 'oc-rln-australia', lon: 150, lat: -28, region: 'Australia', continent: 'oc',
        nematode: 'Root-lesion nematodes', species: 'Pratylenchus thornei and Pratylenchus neglectus', crop: 'Wheat',
        loss: 'About AU$123 million of wheat loss per year, reported as a ten-year average to 2008.',
        source: { title: 'Root-lesion nematodes in Australian wheat production', year: 2012, url: 'https://grdc.com.au/resources-and-publications/grdc-update-papers' },
        status: 'secondary GRDC citation; team should replace with the exact GRDC paper URL before release'
      }
    ],
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
        source: { title: 'Meloidogyne incognita distribution records', year: 'n.d.', url: 'https://plantwiseplusknowledgebank.org/doi/10.1079/pwkb.species.33247', status: 'CABI/Plantwise page is access-restricted in this environment; team must check the map' },
        provinces: [
          'Anhui', 'Fujian', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei',
          'Hunan', 'Jiangsu', 'Jiangxi', 'Inner Mongolia', 'Qinghai', 'Shaanxi', 'Shandong', 'Sichuan', 'Yunnan', 'Zhejiang'
        ],
        survey: {
          province: 'Xinjiang',
          record: 'Root-knot nematodes were detected in 57 of 130 vegetable samples in a 2021–2023 survey; Meloidogyne incognita was the dominant species among identified populations.',
          source: { title: 'The occurrence and genetic diversity of vegetable root-knot nematodes in Xinjiang Uyghur Autonomous Region', year: 2024, url: 'https://doi.org/10.1016/j.jia.2024.12.008' }
        },
        note: 'The 20-province list is a distribution record, not a national severity or loss estimate.'
      }
    },
    photoLicensing: {
      required: true,
      allowed: ['team photograph', 'CC0', 'CC BY'],
      status: 'No external crop photograph is bundled until the photographer, source URL and license are recorded.'
    }
  };
  window.NKU_HOME_MAPS.CONT = window.NKU_HOME_MAPS.continents;
  window.NKU_HOME_MAPS.CASES = window.NKU_HOME_MAPS.cases;
  window.NKU_HOME_MAPS.SCN = window.NKU_HOME_MAPS.china.scn.provinces;
  window.NKU_HOME_MAPS.RKN = window.NKU_HOME_MAPS.china.rkn.provinces.concat([window.NKU_HOME_MAPS.china.rkn.survey.province]);
}());
