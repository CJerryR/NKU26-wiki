/* Map presentation and accessible interactions. No global scrolling or reveal masks. */
(function () {
  'use strict';
  var SVG = 'http://www.w3.org/2000/svg';
  var roots = [];
  function text(value) { return typeof value === 'string' && value.trim().length > 0; }
  function number(value) { return typeof value === 'number' && Number.isFinite(value); }
  function color(value) { return /^#[0-9a-f]{6}$/i.test(value || ''); }
  function safeUrl(value) {
    try { var url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : null; }
    catch (_) { return null; }
  }
  function element(tag, value, className) {
    var node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function svgElement(tag, attrs) {
    var node = document.createElementNS(SVG, tag);
    Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }
  function project(point, projection) {
    return [(point[0] - projection.west) * projection.unitsPerDegree + projection.offsetX,
      (projection.north - point[1]) * projection.unitsPerDegree + projection.offsetY];
  }
  function validProjection(projection) {
    return projection && ['west', 'east', 'south', 'north', 'unitsPerDegree', 'offsetX', 'offsetY', 'width', 'height'].every(function (key) { return number(projection[key]); }) &&
      projection.west >= -180 && projection.east <= 180 && projection.west < projection.east &&
      projection.south >= -90 && projection.north <= 90 && projection.south < projection.north &&
      projection.unitsPerDegree > 0 && projection.offsetX >= 0 && projection.offsetY >= 0 &&
      (projection.east - projection.west) * projection.unitsPerDegree + projection.offsetX <= projection.width &&
      (projection.north - projection.south) * projection.unitsPerDegree + projection.offsetY <= projection.height;
  }
  function validPoint(point, projection) {
    return Array.isArray(point) && point.length === 2 && point.every(number) &&
      point[0] >= projection.west && point[0] <= projection.east &&
      point[1] >= projection.south && point[1] <= projection.north;
  }
  function validGeometry(geometry, projection) {
    if (!geometry || !projection) return false;
    if (geometry.type === 'Point') return validPoint(geometry.coordinates, projection);
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') return false;
    var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    return Array.isArray(polygons) && polygons.length > 0 && polygons.every(function (polygon) {
      return Array.isArray(polygon) && polygon.length > 0 && polygon.every(function (ring) {
        return Array.isArray(ring) && ring.length >= 4 && ring.every(function (point, index) {
          return validPoint(point, projection) && (!index || Math.abs(point[0] - ring[index - 1][0]) <= 180);
        }) && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
      });
    });
  }
  function validateLayer(layer, config) {
    var errors = [];
    if (!layer || layer.status !== 'ready') return { ready: false, errors: [] };
    config = config || {};
    if (config.schemaVersion !== 1) errors.push('Unsupported schema version.');
    if (layer.reviewed !== true) errors.push('Layer review is missing.');
    if (!text(layer.title) || !text(layer.unit)) errors.push('Title or unit is missing.');
    var projection = config.projections && config.projections[layer.projection];
    if (!validProjection(projection)) errors.push('Projection is missing or invalid.');
    var sources = Array.isArray(layer.sources) ? layer.sources : [];
    var sourceIds = new Set();
    sources.forEach(function (source) {
      if (!source || typeof source !== 'object') { errors.push('A source citation is invalid.'); return; }
      if (!text(source.id) || sourceIds.has(source.id) || !text(source.title) || !text(source.year) ||
          !text(source.version) || !text(source.license) || !safeUrl(source.url)) errors.push('A source citation is incomplete or duplicated.');
      sourceIds.add(source.id);
    });
    if (!sources.length) errors.push('No scientific sources supplied.');
    var scale = config.scales && config.scales[layer.scaleId];
    var categories = Array.isArray(layer.categories) ? layer.categories : [];
    if (layer.kind === 'abundance') {
      if (layer.scaleId !== 'herbivores-global' || layer.field !== 'Herbivores' || layer.unit !== 'individuals / 100 g dry soil') errors.push('Abundance field, unit or shared scale does not match.');
      if (!scale || scale.reviewed !== true || !Array.isArray(scale.bounds) || scale.bounds.length < 2 ||
          !scale.bounds.every(function (bound, index) { return number(bound) && bound >= 0 && (!index || bound > scale.bounds[index - 1]); }) ||
          !Array.isArray(scale.colors) || scale.colors.length !== scale.bounds.length - 1 || !scale.colors.every(color) ||
          scale.field !== layer.field || scale.unit !== layer.unit) errors.push('Global abundance scale is incomplete.');
    } else if (layer.kind === 'distribution') {
      if (!text(layer.species) || !categories.length || !categories.every(function (category) {
        return category && text(category.id) && text(category.label) && color(category.color);
      }) || new Set(categories.map(function (category) { return category.id; })).size !== categories.length) errors.push('Species or distribution legend is incomplete.');
    } else errors.push('Unsupported indicator kind.');
    var records = Array.isArray(layer.records) ? layer.records : [];
    var ids = new Set();
    if (!records.length) errors.push('No verified records supplied.');
    records.forEach(function (record) {
      if (!record || typeof record !== 'object') { errors.push('A record is invalid.'); return; }
      if (!text(record.id) || ids.has(record.id) || !text(record.region) || !text(record.year) || !text(record.dataType) || !sourceIds.has(record.sourceId)) errors.push('A record lacks its identity, date, type or citation.');
      ids.add(record.id);
      if (!validGeometry(record.geometry, projection)) errors.push('A geometry is invalid or outside the map extent.');
      if ((record.geometrySourceId || (record.geometry && record.geometry.type !== 'Point')) && !sourceIds.has(record.geometrySourceId)) errors.push('Geometry needs a valid source citation.');
      if (layer.kind === 'abundance') {
        if (!number(record.value) || record.value < 0 || (scale && scale.bounds && scale.bounds.length &&
            (record.value < scale.bounds[0] || record.value > scale.bounds[scale.bounds.length - 1]))) errors.push('An abundance value is missing, invalid or outside the agreed scale.');
      } else if (layer.kind === 'distribution' && (!categories.some(function (category) { return category && category.id === record.category; }) || record.species !== layer.species)) errors.push('A record does not match this species or legend.');
    });
    return { ready: errors.length === 0, errors: Array.from(new Set(errors)) };
  }
  function recordColor(record, layer, config) {
    if (layer.kind === 'distribution') return layer.categories.find(function (c) { return c.id === record.category; }).color;
    var scale = config.scales[layer.scaleId];
    var index = scale.bounds.slice(1).findIndex(function (bound) { return record.value < bound; });
    return scale.colors[index < 0 ? scale.colors.length - 1 : index];
  }
  function geometryNode(record, projection, fill) {
    var geometry = record.geometry;
    if (geometry.type === 'Point') {
      var point = project(geometry.coordinates, projection);
      return svgElement('circle', { cx: point[0], cy: point[1], r: 5, fill: fill, stroke: '#fff9ed', 'stroke-width': 1.5 });
    }
    var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    var path = polygons.map(function (polygon) {
      return polygon.map(function (ring) {
        return ring.map(function (point, index) {
          var xy = project(point, projection);
          return (index ? 'L' : 'M') + xy[0].toFixed(3) + ',' + xy[1].toFixed(3);
        }).join(' ') + 'Z';
      }).join(' ');
    }).join(' ');
    return svgElement('path', { d: path, fill: fill, 'fill-rule': 'evenodd', stroke: '#fff9ed', 'stroke-width': 0.6 });
  }
  function sourceLink(source) {
    var link = element('a', source.title + ' (' + source.year + ')');
    link.href = safeUrl(source.url);
    return link;
  }
  function drawLegend(root, layer, config) {
    var legend = root.querySelector('[data-map-legend]');
    legend.replaceChildren(element('p', 'Legend · ' + (layer.kind === 'abundance' ? 'abundance' : 'reported distribution'), 'home-map__label'));
    var list = element('ul', undefined, 'home-map__legend-items');
    var entries = layer.categories;
    if (layer.kind === 'abundance') {
      var scale = config.scales[layer.scaleId];
      entries = scale.colors.map(function (fill, index) {
        return { color: fill, label: scale.bounds[index] + (index === scale.colors.length - 1 ? ' – ' : ' – <') + scale.bounds[index + 1] };
      });
    }
    entries.forEach(function (entry) {
      var li = element('li');
      var swatch = element('span', undefined, 'home-map__swatch');
      swatch.style.backgroundColor = entry.color; swatch.setAttribute('aria-hidden', 'true');
      li.append(swatch, document.createTextNode(entry.label)); list.append(li);
    });
    legend.append(list, element('p', layer.unit + (layer.kind === 'abundance' ? ' · Shared global scale.' : ' · Uncolored areas have no loaded record; absence is not inferred.'), 'home-map__fine'));
  }
  function resetRoot(root) {
    root.querySelector('[data-map-overlay]').replaceChildren();
    root.querySelector('[data-map-info]').replaceChildren();
    root.querySelector('[data-map-info]').hidden = true;
    root.querySelector('[data-map-records]').replaceChildren();
    root.querySelector('[data-map-records]').hidden = true;
    root.dataset.mapState = 'pending';
    root.querySelector('[data-map-status]').textContent = 'Data awaiting verification';
    root.querySelector('[data-map-empty]').hidden = false;
    root.querySelector('[data-map-legend]').innerHTML = root._fallback.legend;
    root.querySelector('[data-map-sources]').innerHTML = root._fallback.sources;
    root.querySelector('[data-map-title]').textContent = root._fallback.title;
    root.querySelector('[data-map-boundary]').textContent = root._fallback.boundary;
    root.querySelector('.home-map__base').alt = root._fallback.alt;
    root.onkeydown = null;
  }
  function render(root, config) {
    resetRoot(root);
    if (!config || !Array.isArray(config.layers)) return;
    var matching = config.layers.filter(function (item) { return item && item.id === root.dataset.mapLayer; });
    if (matching.length !== 1) return;
    var layer = matching[0];
    var state = validateLayer(layer, config);
    var overlay = root.querySelector('[data-map-overlay]');
    var info = root.querySelector('[data-map-info]');
    var picker = root.querySelector('[data-map-records]');
    overlay.replaceChildren(); info.replaceChildren(); picker.replaceChildren();
    info.hidden = true; picker.hidden = true;
    root.dataset.mapState = state.ready ? 'ready' : 'pending';
    root.querySelector('[data-map-status]').textContent = state.ready ? 'Verified records loaded' : 'Data awaiting verification';
    if (text(layer.title)) root.querySelector('[data-map-title]').textContent = layer.title;
    if (text(layer.boundary)) root.querySelector('[data-map-boundary]').textContent = layer.boundary;
    root.querySelector('[data-map-empty]').hidden = state.ready;
    var sourceArea = root.querySelector('[data-map-sources]');
    sourceArea.replaceChildren(element('p', 'Scientific data source', 'home-map__label'));
    if (!state.ready) {
      sourceArea.append(element('p', state.errors.length ? 'Data remain hidden until the dataset, geometry, legend and citations pass review.' : (layer.pendingSource || 'Verified scientific data and citations are awaiting confirmation.'), 'home-map__fine'));
      return;
    }
    root.querySelector('.home-map__base').alt = 'Base geography for ' + layer.title + '. Verified records are in the interactive overlay and record selector.';
    layer.sources.forEach(function (source) {
      var p = element('p', undefined, 'home-map__fine');
      p.append(sourceLink(source), document.createTextNode(' · ' + source.version + ' · ' + source.license)); sourceArea.append(p);
    });
    drawLegend(root, layer, config);
    picker.hidden = false;
    var label = element('label', 'Choose a record, or hover / tap its map feature.');
    var select = element('select');
    select.id = layer.id + '-record-picker'; label.htmlFor = select.id;
    select.append(element('option', 'Select a verified record'));
    select.firstChild.value = '';
    picker.append(label, select);
    var activeTrigger = null;
    var pinned = false;
    function close(restoreFocus) {
      info.hidden = true; select.value = ''; pinned = false;
      overlay.querySelectorAll('[aria-pressed]').forEach(function (item) { item.setAttribute('aria-pressed', 'false'); });
      if (restoreFocus && activeTrigger && activeTrigger.isConnected) activeTrigger.focus();
    }
    function open(record, trigger, pin) {
      if (pinned && !pin) return;
      pinned = Boolean(pin); activeTrigger = trigger; select.value = record.id;
      overlay.querySelectorAll('[data-record-id]').forEach(function (item) { item.setAttribute('aria-pressed', String(item.dataset.recordId === record.id)); });
      info.replaceChildren(); info.hidden = false;
      var closeButton = element('button', '×', 'home-map__close');
      closeButton.type = 'button'; closeButton.setAttribute('aria-label', 'Close map record');
      closeButton.addEventListener('click', function () { close(true); });
      info.append(element('h4', record.region), closeButton);
      var dl = element('dl');
      function row(name, value) { dl.append(element('dt', name), element('dd', value)); }
      if (layer.kind === 'abundance') row('Abundance', record.value.toLocaleString('en-US') + ' ' + layer.unit);
      else {
        row('Species', layer.species);
        row('Distribution', layer.categories.find(function (category) { return category.id === record.category; }).label);
      }
      row('Data type', record.dataType); row('Observation / report year', record.year);
      if (text(record.hosts)) row('Crop hosts', record.hosts);
      if (text(record.note)) row('Scope', record.note);
      var source = layer.sources.find(function (item) { return item.id === record.sourceId; });
      var dd = element('dd'); dd.append(sourceLink(source)); dl.append(element('dt', 'Source'), dd);
      if (record.geometrySourceId && record.geometrySourceId !== record.sourceId) {
        var geometrySource = layer.sources.find(function (item) { return item.id === record.geometrySourceId; });
        var geometryDd = element('dd'); geometryDd.append(sourceLink(geometrySource)); dl.append(element('dt', 'Area geometry'), geometryDd);
      }
      info.append(dl);
    }
    layer.records.forEach(function (record) {
      var shape = geometryNode(record, config.projections[layer.projection], recordColor(record, layer, config));
      shape.dataset.recordId = record.id;
      shape.setAttribute('tabindex', '0'); shape.setAttribute('role', 'button');
      shape.setAttribute('aria-label', record.region + ': open ' + (layer.kind === 'abundance' ? 'abundance' : layer.species) + ' record');
      shape.setAttribute('aria-controls', layer.id + '-info'); shape.setAttribute('aria-pressed', 'false');
      shape.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') open(record, shape, false); });
      shape.addEventListener('click', function () { open(record, shape, true); });
      shape.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(record, shape, true); }
      });
      overlay.append(shape);
      var option = element('option', record.region + ' · ' + record.year); option.value = record.id; select.append(option);
    });
    info.id = layer.id + '-info';
    select.addEventListener('change', function () {
      var record = layer.records.find(function (item) { return item.id === select.value; });
      if (record) open(record, select, true); else close(false);
    });
    // The handler is replaced on refresh; it never accumulates global listeners.
    root.onkeydown = function (event) { if (event.key === 'Escape' && !info.hidden) close(true); };
  }
  function refresh() {
    var config = window.NKUHomeMapsData;
    roots.forEach(function (root) { render(root, config); });
  }
  function init() {
    roots = Array.from(document.querySelectorAll('.home-maps [data-map-layer]'));
    if (!roots.length) return;
    roots.forEach(function (root) {
      root._fallback = {
        legend: root.querySelector('[data-map-legend]').innerHTML,
        sources: root.querySelector('[data-map-sources]').innerHTML,
        title: root.querySelector('[data-map-title]').textContent,
        boundary: root.querySelector('[data-map-boundary]').textContent,
        alt: root.querySelector('.home-map__base').alt
      };
    });
    refresh();
  }
  window.NKUHomeMaps = { validateLayer: validateLayer, refresh: refresh, project: project };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
