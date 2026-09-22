/* Scientific content only. No observations have been supplied or approved.
 * Schema and handoff: docs/home-maps.md. Geometry provenance: img/home-maps/SOURCES.md.
 * Load before home-maps.js. No runtime fetch, sample values or generated distributions.
 */
(function () {
  'use strict';
  window.NKUHomeMapsData = {
    schemaVersion: 1,
    contentStatus: 'D01 prototype topics; final scientific scope awaits confirmation',
    projections: {
      world: { west: -180, east: 180, south: -90, north: 90, unitsPerDegree: 2.5, offsetX: 50, offsetY: 0, width: 1000, height: 450 },
      china: { west: 72, east: 138, south: 0, north: 56, unitsPerDegree: 8.5, offsetX: 19.5, offsetY: 12, width: 600, height: 500 }
    },
    scales: {
      'herbivores-global': {
        field: 'Herbivores', unit: 'individuals / 100 g dry soil',
        // Explicit raw-value boundaries, agreed using the GLOBAL dataset.
        // Both abundance layers must reference this same scale. Never autoscale China.
        bounds: [], colors: [], reviewed: false
      }
    },
    layers: [
      {
        id: 'world-abundance', projection: 'world', kind: 'abundance',
        title: 'Global plant-feeding nematode abundance',
        field: 'Herbivores', unit: 'individuals / 100 g dry soil', scaleId: 'herbivores-global',
        status: 'pending', reviewed: false, sources: [], records: [],
        pendingSource: 'Pending: verified Herbivores dataset, version, observation years and citation.',
        boundary: 'Abundance describes potential exposure; it is not a measure of crop loss or disease severity.'
      },
      {
        id: 'china-abundance', projection: 'china', kind: 'abundance',
        title: 'Plant-feeding nematode abundance', subtitle: 'China · the same global measure',
        field: 'Herbivores', unit: 'individuals / 100 g dry soil', scaleId: 'herbivores-global',
        status: 'pending', reviewed: false, sources: [], records: [],
        pendingSource: 'Pending: the China subset of the verified global Herbivores dataset.',
        boundary: 'Abundance is not crop loss or disease severity.'
      },
      {
        id: 'china-soybean-cyst', projection: 'china', kind: 'distribution',
        title: 'Soybean cyst nematode distribution',
        species: 'Heterodera glycines', unit: 'reported presence',
        status: 'pending', reviewed: false, sources: [], records: [], categories: [],
        pendingSource: 'Pending: reviewed regional records, publication years and citations for H. glycines.',
        boundary: 'A regional report does not imply region-wide infestation. National losses are not allocated to provinces.'
      },
      {
        id: 'china-root-knot', projection: 'china', kind: 'distribution',
        title: 'Southern root-knot nematode distribution',
        species: 'Meloidogyne incognita', unit: 'reported presence',
        status: 'pending', reviewed: false, sources: [], records: [], categories: [],
        pendingSource: 'Pending: reviewed records, hosts, survey years and citations for M. incognita.',
        boundary: 'Reported presence, disease incidence and yield loss are different measures.'
      }
    ]
  };
}());
