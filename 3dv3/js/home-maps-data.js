/* Homepage map content (D01 part 02). Literature records only; every item
 * carries its source. Province markers attach province-level records to
 * schematic anchor points in js/home-geo.js; they are not detection sites. */
(function () {
  'use strict';
  window.NKUHomeMapsData = {
    schemaVersion: 2,
    scale: {
      field: 'Herbivores', unit: 'individuals per 100 g dry soil', transform: 'log10(x + 1)',
      stops: ['#f4e6c8', '#ecbf85', '#d9835f', '#a8456a', '#5b1b5e', '#2c0f3a']
    },
    world: {
      chinaLabel: { lon: 104, lat: 35 },
      cases: [{
        id: 'cn-scn', lon: 126.4, lat: 46.4,
        region: 'Northeast China', nematode: 'Soybean cyst nematode', species: 'Heterodera glycines',
        crop: 'Soybean', loss: 'More than US$120 million in yield losses per year (national estimate)',
        source: 'Phytopathology Research, 2021', url: 'https://link.springer.com/article/10.1186/s42483-021-00095-w',
        back: 'Typical infested fields lose about 20–30% of yield; severe fields 60–70%.',
        photoNote: 'Crop photo will be credited here: team photo, CC0 or CC BY.'
      }],
      chinaCard: {
        region: 'China', value: 'Import pending', unit: 'individuals per 100 g dry soil',
        type: 'Sample pixels, Herbivores field', source: 'Global soil nematode database, Scientific Data (2020)'
      }
    },
    china: {
      scn: {
        provinces: ['HL', 'JL', 'LN', 'NM', 'BJ', 'HE', 'HA', 'SD', 'SX', 'AH', 'JS', 'SH', 'ZJ', 'JX', 'HB', 'SN', 'GS', 'NX', 'XJ', 'GZ', 'YN', 'GX'],
        groups: {
          Northeast: ['HL', 'JL', 'LN', 'NM'], North: ['BJ', 'HE', 'HA', 'SD', 'SX'],
          'East and Central': ['AH', 'JS', 'SH', 'ZJ', 'JX', 'HB'], Northwest: ['SN', 'GS', 'NX', 'XJ'],
          'Southwest and South': ['GZ', 'YN', 'GX']
        },
        focus: [
          { id: 'ne', label: 'Northeast', lon: 125.8, lat: 45.2, rx: 5.2, ry: 3.6 },
          { id: 'hhh', label: 'Huang-Huai-Hai', lon: 116.0, lat: 36.6, rx: 3.8, ry: 3.3 }
        ],
        source: 'Phytopathology Research, 2021'
      },
      rkn: {
        cabi: ['AH', 'FJ', 'GD', 'GX', 'GZ', 'HI', 'HE', 'HL', 'HA', 'HB', 'HN', 'JS', 'JX', 'NM', 'QH', 'SN', 'SD', 'SC', 'YN', 'ZJ'],
        survey: ['XJ'],
        notes: {
          HN: 'Hunan survey: about 80% incidence in greenhouse vegetables, about 10% in open fields; M. incognita was 87% of identified root-knot populations.',
          XJ: 'Detected in protected-vegetable areas, 2021–2023 survey.'
        },
        source: 'CABI distribution records; Xinjiang survey (2024)'
      }
    }
  };
}());
