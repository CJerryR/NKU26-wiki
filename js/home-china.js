/* Part 02 · China: three stacked map plates (three.js), one per question.
 * Province records sit at schematic anchor points; they are not detection
 * sites. Abundance renders only verified imported sample pixels. */
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
  var canvas = sec.querySelector('[data-china-canvas]');
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
  function runwaySpan() { return Math.max(1, runway.offsetHeight - window.innerHeight); }
  function scrollToLayer(i) {
    var top = window.pageYOffset + runway.getBoundingClientRect().top + runwaySpan() * (i + 0.5) / 3;
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
  function runwayQ() { var r = runway.getBoundingClientRect(); return NK.clamp(-r.top / runwaySpan(), 0, 0.9999); }
  window.addEventListener('scroll', function () {
    var r = runway.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var i = Math.floor(runwayQ() * 3);
    if (i !== active && performance.now() > lockUntil) setLayer(i);
  }, { passive: true });

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

  if (!T || !NK.webgl()) { fallback2d(); return; }

  /* ---------------- three.js stack ---------------- */
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { fallback2d(); return; }
  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  var scene = new T.Scene();
  scene.fog = new T.Fog(0x140b1c, 90, 190);
  var camera = new T.PerspectiveCamera(27, 1, 1, 500);
  scene.add(new T.HemisphereLight(0xd9cbef, 0x1a0f24, 0.95));
  var sun = new T.DirectionalLight(0xffe7c4, 0.75);
  sun.position.set(30, 60, 40);
  scene.add(sun);

  function toPlate(x, y) { return [(x - 300) / 10, (y - 250) / 10]; }
  var shapes = geo.rings.map(function (r) {
    var s = new T.Shape();
    for (var i = 0; i < r.p.length; i += 2) {
      var q = toPlate(r.p[i], r.p[i + 1]);
      if (i === 0) s.moveTo(q[0], -q[1]); else s.lineTo(q[0], -q[1]);
    }
    return s;
  });
  var slabGeo = new T.ExtrudeGeometry(shapes, { depth: 0.45, bevelEnabled: false, curveSegments: 1 });
  slabGeo.rotateX(-Math.PI / 2);
  var outlinePts = geo.rings.filter(function (r) { return r.a > 2; }).map(function (r) {
    var arr = [];
    for (var i = 0; i < r.p.length; i += 2) { var q = toPlate(r.p[i], r.p[i + 1]); arr.push(new T.Vector3(q[0], 0.47, q[1])); }
    return arr;
  });
  var maritimeGeo = [];
  (geo.maritime || []).forEach(function (line) {
    var arr = [];
    for (var i = 0; i < line.length; i += 2) { var q = toPlate(line[i], line[i + 1]); arr.push(new T.Vector3(q[0], 0.47, q[1])); }
    if (arr.length > 1) maritimeGeo.push(new T.BufferGeometry().setFromPoints(arr));
  });

  var LAYERS = [
    { top: 0x2c1f45, edge: 0xb99be0 },
    { top: 0x321b36, edge: 0xe0a53e },
    { top: 0x1d2239, edge: 0xff8fb1 }
  ];
  var plates = [];
  var hits = [];
  LAYERS.forEach(function (cfg, li) {
    var group = new T.Group();
    var mat = new T.MeshStandardMaterial({ color: cfg.top, roughness: 0.92, metalness: 0.02, transparent: true, opacity: 1 });
    var slab = new T.Mesh(slabGeo, mat);
    group.add(slab);
    var lineMat = new T.LineBasicMaterial({ color: cfg.edge, transparent: true, opacity: 0.9 });
    outlinePts.forEach(function (pts) { group.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), lineMat)); });
    var dashMat = new T.LineDashedMaterial({ color: cfg.edge, dashSize: 0.5, gapSize: 0.5, transparent: true, opacity: 0.6 });
    maritimeGeo.forEach(function (g) { var ln = new T.Line(g, dashMat); ln.computeLineDistances(); group.add(ln); });
    group.userData = { mats: [mat, lineMat, dashMat], y: 0, op: 1, markers: [] };
    scene.add(group);
    plates.push(group);
  });

  /* layer 0: abundance dot matrix (+ verified sample pixels) */
  (function () {
    var pts = [];
    for (var y = 10; y < 500; y += 9) for (var x = 10 + ((y / 9) % 2 ? 4.5 : 0); x < 600; x += 9) if (inside(x, y)) pts.push(toPlate(x, y));
    var dots = new T.InstancedMesh(new T.CylinderGeometry(0.17, 0.17, 0.08, 10), new T.MeshBasicMaterial({ color: 0x8b76ad, transparent: true, opacity: 0.55 }), pts.length);
    var m = new T.Matrix4();
    pts.forEach(function (q, i) { m.makeTranslation(q[0], 0.5, q[1]); dots.setMatrixAt(i, m); });
    plates[0].add(dots);
    plates[0].userData.mats.push(dots.material);
    var hasData = ab.status === 'imported' && ab.points && ab.points.length && NK.abundanceColor;
    if (hasData) {
      var chinaPts = ab.points.filter(function (pt) { var c = llToChina(pt[0], pt[1]); return inside(c[0], c[1]); });
      if (chinaPts.length) {
        var sph = new T.InstancedMesh(new T.SphereGeometry(0.34, 12, 8), new T.MeshBasicMaterial({ transparent: true }), chinaPts.length);
        chinaPts.forEach(function (pt, i) {
          var c = toPlate.apply(null, llToChina(pt[0], pt[1]));
          m.makeTranslation(c[0], 0.85, c[1]);
          sph.setMatrixAt(i, m);
          sph.setColorAt(i, new T.Color(NK.abundanceColor(Math.log(pt[2] + 1) / Math.LN10)));
        });
        plates[0].add(sph);
        plates[0].userData.mats.push(sph.material);
      }
    }
  }());

  /* layer 1: soybean cyst nematode, province glyph clusters + major-region halos */
  (function () {
    var list = data.china.scn.provinces.filter(function (c) { return P[c]; });
    var cone = new T.ConeGeometry(0.34, 0.62, 3);
    var inst = new T.InstancedMesh(cone, new T.MeshStandardMaterial({ color: 0x5fd18f, roughness: 0.6, transparent: true, emissive: 0x1d5a35, emissiveIntensity: 0.5 }), list.length * 4);
    var m = new T.Matrix4();
    var R = NK.rng(11);
    var k = 0;
    list.forEach(function (c) {
      var q = toPlate(P[c].x, P[c].y);
      for (var j = 0; j < 4; j++) {
        var ox = j ? (R() - 0.5) * 1.3 : 0;
        var oz = j ? (R() - 0.5) * 1.1 : 0;
        var s = j ? 0.62 + R() * 0.3 : 1.05;
        m.compose(new T.Vector3(q[0] + ox, 0.78, q[1] + oz), new T.Quaternion().setFromEuler(new T.Euler(0, R() * 3, 0)), new T.Vector3(s, s, s));
        inst.setMatrixAt(k++, m);
      }
      var hit = new T.Mesh(new T.SphereGeometry(1.25, 8, 6), new T.MeshBasicMaterial({ visible: false }));
      hit.position.set(q[0], 0.8, q[1]);
      hit.userData = { layer: 1, code: c };
      plates[1].add(hit);
      hits.push(hit);
    });
    plates[1].add(inst);
    plates[1].userData.mats.push(inst.material);
    data.china.scn.focus.forEach(function (f) {
      var c = llToChina(f.lon, f.lat);
      var q = toPlate(c[0], c[1]);
      var halo = new T.Mesh(new T.CircleGeometry(1, 48), new T.MeshBasicMaterial({ color: 0xf2934a, transparent: true, opacity: 0.22, depthWrite: false }));
      halo.rotation.x = -Math.PI / 2;
      halo.scale.set(f.rx * CP.upd / 10, f.ry * CP.upd / 10, 1);
      halo.position.set(q[0], 0.5, q[1]);
      var ring = new T.Mesh(new T.RingGeometry(0.96, 1, 64), new T.MeshBasicMaterial({ color: 0xf6a15c, transparent: true, opacity: 0.85, depthWrite: false, side: T.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.scale.copy(halo.scale);
      ring.position.set(q[0], 0.52, q[1]);
      plates[1].add(halo);
      plates[1].add(ring);
      plates[1].userData.mats.push(halo.material, ring.material);
      plates[1].userData.markers.push({ text: f.label, pos: new T.Vector3(q[0], 0.6, q[1] - halo.scale.y - 0.6) });
    });
  }());

  /* layer 2: southern root-knot nematode, equal-height pillars (presence only) */
  (function () {
    var rkn = data.china.rkn;
    var codes = rkn.cabi.concat(rkn.survey).filter(function (c) { return P[c]; });
    var stem = new T.CylinderGeometry(0.07, 0.07, 3.4, 6);
    stem.translate(0, 2.15, 0);
    var ball = new T.SphereGeometry(0.4, 16, 12);
    ball.translate(0, 3.95, 0);
    var stemMat = new T.MeshBasicMaterial({ color: 0xe8dcef, transparent: true, opacity: 0.55 });
    var pink = new T.MeshStandardMaterial({ color: 0xff6f9a, emissive: 0x8a1f45, emissiveIntensity: 0.6, roughness: 0.4, transparent: true });
    var gold = new T.MeshStandardMaterial({ color: 0xf6c14b, emissive: 0x8a5a10, emissiveIntensity: 0.7, roughness: 0.4, transparent: true });
    codes.forEach(function (c) {
      var q = toPlate(P[c].x, P[c].y);
      var survey = rkn.survey.indexOf(c) >= 0;
      var s = new T.Mesh(stem, stemMat);
      var b = new T.Mesh(ball, survey ? gold : pink);
      s.position.set(q[0], 0, q[1]);
      b.position.set(q[0], 0, q[1]);
      plates[2].add(s);
      plates[2].add(b);
      var hit = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 4.6, 8), new T.MeshBasicMaterial({ visible: false }));
      hit.position.set(q[0], 2.3, q[1]);
      hit.userData = { layer: 2, code: c };
      plates[2].add(hit);
      hits.push(hit);
      if (survey) plates[2].userData.markers.push({ text: 'Xinjiang · survey', pos: new T.Vector3(q[0], 4.8, q[1]) });
    });
    plates[2].userData.mats.push(stemMat, pink, gold);
  }());

  /* ---------------- labels ---------------- */
  var labelEls = [];
  plates.forEach(function (pl, li) {
    pl.userData.markers.forEach(function (mk) {
      var el = document.createElement('span');
      el.className = 'nk-china__label';
      el.textContent = mk.text;
      labelsEl.appendChild(el);
      labelEls.push({ el: el, layer: li, pos: mk.pos, plate: pl });
    });
  });

  /* ---------------- layout + animation ---------------- */
  var W = 1, H = 1;
  var narrow = false;
  function resize() {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    narrow = W < 860;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    if (narrow) camera.setViewOffset(W, H, 0, H * 0.2, W, H);
    else camera.setViewOffset(W, H, -W * 0.19, 0, W, H);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', function () { resize(); });

  var targetY = [0, 0, 0];
  var targetOp = [1, 1, 1];
  var camTarget = new T.Vector3(0, 0, 0);
  function layout(i) {
    for (var k = 0; k < 3; k++) {
      var rel = k - i;
      targetY[k] = -rel * 7.5 + (rel === 0 ? 1 : 0);
      targetOp[k] = rel === 0 ? 1 : 0.16;
    }
  }
  api = { setLayer: function (i) { layout(i); } };
  layout(active);
  plates.forEach(function (pl, k) { pl.position.y = targetY[k]; pl.userData.op = targetOp[k]; });

  var pointer = { x: 0.5, y: 0.5, inside: false, cx: 0, cy: 0 };
  var ray = new T.Raycaster();
  var ndc = new T.Vector2();
  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    pointer.cx = e.clientX - r.left;
    pointer.cy = e.clientY - r.top;
    pointer.x = pointer.cx / r.width;
    pointer.y = pointer.cy / r.height;
    pointer.inside = true;
  }, { passive: true });
  stage.addEventListener('pointerleave', function () { pointer.inside = false; hideTip(); });
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    var r = stage.getBoundingClientRect();
    pointer.cx = e.clientX - r.left;
    pointer.cy = e.clientY - r.top;
    pointer.inside = true;
    pointer.tap = true;
  }, { passive: true });

  var lastPick = 0;
  function pick(t) {
    if (!pointer.inside || t - lastPick < 0.06) return;
    lastPick = t;
    if (pointer.cx < 0 || pointer.cy < 0) return;
    if (!narrow && pointer.x < 0.42) { hideTip(); return; }
    ndc.set(pointer.cx / W * 2 - 1, -(pointer.cy / H * 2 - 1));
    ray.setFromCamera(ndc, camera);
    var cand = hits.filter(function (h) { return h.userData.layer === active; });
    var hit = ray.intersectObjects(cand, false)[0];
    if (hit) {
      showTip(recordHtml(active, hit.object.userData.code), pointer.cx, pointer.cy);
      stage.style.cursor = 'help';
    } else {
      stage.style.cursor = '';
      if (!pointer.tap) hideTip();
    }
    pointer.tap = false;
  }

  var tmp = new T.Vector3();
  function frame(t, dt) {
    var e = 1 - Math.exp(-dt * 4.5);
    plates.forEach(function (pl, k) {
      pl.position.y += (targetY[k] - pl.position.y) * e;
      pl.userData.op += (targetOp[k] - pl.userData.op) * e;
      pl.userData.mats.forEach(function (mt) {
        if (mt.userData.base === undefined) mt.userData.base = mt.opacity;
        mt.opacity = mt.userData.base * pl.userData.op;
        mt.depthWrite = pl.userData.op > 0.6;
      });
      pl.visible = pl.userData.op > 0.02;
    });
    var q = runwayQ();
    var sway = NK.reduced ? 0 : Math.sin(t * 0.18) * 0.06;
    var yaw = -0.2 + (q - 0.5) * 0.32 + sway + (pointer.inside ? (pointer.x - 0.5) * 0.08 : 0);
    var dist = narrow ? 118 : 98;
    var elev = 0.78 + (pointer.inside ? (pointer.y - 0.5) * 0.06 : 0);
    camTarget.set(1.5, 0, 2);
    camera.position.set(Math.sin(yaw) * dist * Math.cos(elev), Math.sin(elev) * dist, Math.cos(yaw) * dist * Math.cos(elev));
    camera.lookAt(camTarget);
    pick(t);
    labelEls.forEach(function (lb) {
      var show = lb.layer === active && lb.plate.userData.op > 0.6;
      if (!show) { lb.el.style.opacity = '0'; return; }
      tmp.copy(lb.pos);
      lb.plate.localToWorld(tmp);
      tmp.project(camera);
      lb.el.style.opacity = '1';
      lb.el.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * W).toFixed(0) + 'px,' + ((-tmp.y * 0.5 + 0.5) * H).toFixed(0) + 'px) translate(-50%,-100%)';
    });
    renderer.render(scene, camera);
  }
  resize();
  NK.loopWhileVisible(stage, frame, '100px 0px');
}());
