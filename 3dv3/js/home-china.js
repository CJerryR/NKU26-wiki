/* Part 02 · China: one map, three questions (abundance, soybean cyst,
 * root-knot). This file owns the panel, the tabs, the scroll-to-layer
 * mapping, the record tooltip and the 2D fallback. The 3D map is level 0 of
 * home-zoom3d.js: after the third layer the same map lights the farming
 * regions and flies into a field. Province records sit at schematic anchor
 * points; they are not detection sites. */
(function () {
  'use strict';
  var NK = window.NK;
  var T = window.THREE;
  var geo = window.NKUHomeGeo;
  var data = window.NKUHomeMapsData;
  var ab = window.NKUHomeAbundance || { points: [] };
  var sec = document.querySelector('[data-china]');
  if (!NK || !sec || !geo || !data) return;

  var runway = sec.querySelector('[data-china-runway]');
  var stage = sec.querySelector('[data-china-stage]');
  var labelsEl = sec.querySelector('[data-china-labels]');
  var tip = sec.querySelector('[data-china-tip]');
  var tabs = Array.prototype.slice.call(sec.querySelectorAll('[data-layer-tab]'));
  var panels = Array.prototype.slice.call(sec.querySelectorAll('[data-layer]'));
  var P = geo.provinces;
  var CP = geo.china;
  var active = 0;
  var lockUntil = 0;
  var api = null;

  function llToChina(lon, lat) { return [(lon - CP.west) * CP.upd + CP.ox, (CP.north - lat) * CP.upd + CP.oy]; }

  /* ---------------- tabs (work with or without WebGL) ---------------- */
  function setLayer(i) {
    if (i === active && panels[i] && !panels[i].hidden) { if (api) api.setLayer(i); return; }
    active = i;
    tabs.forEach(function (tb, k) {
      var on = k === i;
      tb.setAttribute('aria-selected', on ? 'true' : 'false');
      tb.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (pn, k) { pn.hidden = k !== i; pn.classList.toggle('is-active', k === i); });
    sec.setAttribute('data-active', String(i));
    if (api) api.setLayer(i);
    hideTip();
  }
  /* The runway holds the three layers, then a short merge into the flight,
   * whose own runway [data-zoom-runway] starts where the merge ends: the
   * layers take 3/4 of the distance to it, the merge the last 1/4. */
  var zoomRun = sec.querySelector('[data-zoom-runway]');
  function mergeEnd() { return zoomRun ? zoomRun.offsetTop : Math.max(1, runway.offsetHeight - window.innerHeight); }
  function layersEnd() { return zoomRun ? mergeEnd() * 0.75 : mergeEnd(); }
  function progress() {
    var s = -runway.getBoundingClientRect().top;
    var le = layersEnd();
    return { layer: NK.clamp(s / le, 0, 0.9999), merge: zoomRun ? NK.clamp((s - le) / Math.max(1, mergeEnd() - le), 0, 1) : 0 };
  }
  function scrollToLayer(i) {
    var top = window.pageYOffset + runway.getBoundingClientRect().top + layersEnd() * (i + 0.5) / 3;
    lockUntil = performance.now() + 1100;
    window.scrollTo({ top: top, behavior: NK.reduced ? 'auto' : 'smooth' });
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener('click', function () { setLayer(i); scrollToLayer(i); });
    tb.addEventListener('keydown', function (e) {
      var k = e.key;
      var n = null;
      if (k === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      tabs[n].focus();
      setLayer(n);
      scrollToLayer(n);
    });
  });
  var merging = false;
  function onScroll() {
    var r = runway.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var pr = progress();
    var i = Math.floor(pr.layer * 3);
    if (i !== active && pr.merge <= 0 && performance.now() > lockUntil) setLayer(i);
    sec.style.setProperty('--merge', pr.merge.toFixed(3));
    if ((pr.merge > 0.04) !== merging) {
      merging = pr.merge > 0.04;
      sec.classList.toggle('is-merging', merging);
      if (merging) hideTip();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------------- tooltip ---------------- */
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.hidden = false;
    var r = stage.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var left = NK.clamp(x + 16, 8, r.width - tw - 8);
    tip.style.transform = 'translate(' + left.toFixed(0) + 'px,' + (y - 12).toFixed(0) + 'px) translateY(-100%)';
  }
  function hideTip() { if (tip) tip.hidden = true; }
  function recordHtml(layer, code) {
    var pr = P[code];
    if (!pr) return '';
    var head = '<b>' + pr.en + '</b> <span lang="zh-Hans">' + pr.zh + '</span>';
    if (layer === 1) {
      var grp = '';
      Object.keys(data.china.scn.groups).forEach(function (g) { if (data.china.scn.groups[g].indexOf(code) >= 0) grp = g; });
      return head + '<span>Soybean cyst nematode reported · ' + grp + '</span><small>' + data.china.scn.source + '</small>';
    }
    if (layer === 2) {
      var survey = data.china.rkn.survey.indexOf(code) >= 0;
      var note = data.china.rkn.notes[code];
      return head + '<span>' + (survey ? 'Detected in protected vegetables, 2021–2023 survey' : 'Provincial record (CABI)') + '</span>' + (note && !survey ? '<small>' + note + '</small>' : '');
    }
    return head;
  }

  /* ---------------- geometry helpers ---------------- */
  function inside(x, y) {
    for (var r = 0; r < geo.rings.length; r++) {
      var p = geo.rings[r].p;
      var c = false;
      for (var i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        var xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
      }
      if (c) return true;
    }
    return false;
  }

  /* ---------------- 2D fallback ---------------- */
  function fallback2d() {
    sec.classList.add('is-2d');
    var svg = NK.svg('svg', { class: 'nk-china__svg', viewBox: '0 0 600 500', 'aria-hidden': 'true' });
    stage.insertBefore(svg, stage.firstChild);
    var d = '';
    geo.rings.forEach(function (r) {
      for (var i = 0; i < r.p.length; i += 2) d += (i ? 'L' : 'M') + r.p[i] + ' ' + r.p[i + 1];
      d += 'Z';
    });
    NK.svg('path', { d: d, class: 'nk-china__land' }, svg);
    var layers = [NK.svg('g', {}, svg), NK.svg('g', {}, svg), NK.svg('g', {}, svg)];
    data.china.scn.provinces.forEach(function (c) { if (P[c]) NK.svg('path', { d: 'M' + P[c].x + ' ' + (P[c].y - 7) + 'l6 10h-12z', class: 'nk-china__tri' }, layers[1]); });
    data.china.rkn.cabi.concat(data.china.rkn.survey).forEach(function (c) {
      if (!P[c]) return;
      NK.svg('circle', { cx: P[c].x, cy: P[c].y, r: 6, class: data.china.rkn.survey.indexOf(c) >= 0 ? 'nk-china__pin nk-china__pin--gold' : 'nk-china__pin' }, layers[2]);
    });
    api = { setLayer: function (i) { layers.forEach(function (g, k) { g.style.opacity = k === i ? 1 : 0; }); } };
    api.setLayer(active);
  }

  /* the 3D map lives in home-zoom3d.js and reads this API every frame */
  NK.chinaUI = {
    active: function () { return active; },
    progress: progress,
    recordHtml: recordHtml,
    showTip: showTip,
    hideTip: hideTip,
    inside: inside,
    llToChina: llToChina
  };
  NK.china2d = function () { if (!sec.classList.contains('is-2d')) fallback2d(); };
  if (!T || !NK.webgl()) fallback2d();
  onScroll();
}());
