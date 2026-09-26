/* NKU homepage v6 — 04 one China map, then the flight into the soil.
 * The glowing 3D map, the three scales and the lens transitions are the 3D v3
 * build, kept as they were. What changed: no layer panel (both nematodes are
 * on the one map), and the pager plays the flight in paced steps with stops at
 * the field and before the question. Records come from js/home-maps-data.js;
 * markers sit at schematic points inside provinces, not at detection sites. */
(function () {
  'use strict';
  var NK = window.NK, H0 = window.NKUH, geo = window.NKUHomeGeo, REG = window.NKU_HOME_MAPS;
  var sec = document.querySelector('[data-zoom]');
  if (!NK || !H0 || !sec || !geo) return;
  var stage = sec.querySelector('[data-zoom-stage]');
  var tip = sec.querySelector('[data-china-tip]');
  var P = geo.provinces, CP = geo.china;
  var byName = {};
  Object.keys(P).forEach(function (c) { byName[P[c].en] = c; });
  function codes(list) { return (list || []).map(function (n) { return byName[n]; }).filter(Boolean); }
  var scn = REG && REG.china && REG.china.scn || { provinces: [] }, rkn = REG && REG.china && REG.china.rkn || { provinces: [] };
  /* the map data in the shape the 3D map expects */
  window.NKUHomeMapsData = {
    china: {
      scn: {
        provinces: codes(scn.provinces),
        groups: { Northeast: ['HL', 'JL', 'LN', 'NM'], North: ['BJ', 'HE', 'HA', 'SD', 'SX'], 'East and Central': ['AH', 'JS', 'SH', 'ZJ', 'JX', 'HB'], Northwest: ['SN', 'GS', 'NX', 'XJ'], 'Southwest and South': ['GZ', 'YN', 'GX'] },
        focus: [{ id: 'ne', label: 'Northeast', lon: 125.8, lat: 45.2, rx: 5.2, ry: 3.6 }, { id: 'hhh', label: 'Huang-Huai-Hai', lon: 116.0, lat: 36.6, rx: 3.8, ry: 3.3 }],
        source: scn.source ? scn.source.title + ' (' + scn.source.year + ')' : ''
      },
      rkn: {
        cabi: codes(rkn.provinces),
        survey: rkn.survey ? codes([rkn.survey.province]) : [],
        notes: {},
        source: 'CABI distribution records'
      }
    }
  };
  var DATA = window.NKUHomeMapsData;
  function llToChina(lon, lat) { return [(lon - CP.west) * CP.upd + CP.ox, (CP.north - lat) * CP.upd + CP.oy]; }
  function inside(x, y) {
    for (var r = 0; r < geo.rings.length; r++) {
      var p = geo.rings[r].p, c = false;
      for (var i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        var xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
      }
      if (c) return true;
    }
    return false;
  }
  function recordHtml(layer, code) {
    var pr = P[code]; if (!pr) return '';
    var head = '<b>' + pr.en + '</b> <span lang="zh-Hans">' + pr.zh + '</span>';
    if (layer === 1) {
      var grp = ''; Object.keys(DATA.china.scn.groups).forEach(function (g) { if (DATA.china.scn.groups[g].indexOf(code) >= 0) grp = g; });
      return head + '<span>Soybean cyst nematode reported' + (grp ? ' \u00b7 ' + grp : '') + '</span><small>' + DATA.china.scn.source + '</small>';
    }
    var survey = DATA.china.rkn.survey.indexOf(code) >= 0;
    return head + '<span>' + (survey ? 'Southern root-knot nematode, 2021\u201323 vegetable survey' : 'Southern root-knot nematode, provincial record (CABI)') + '</span>' + (survey && rkn.survey ? '<small>' + rkn.survey.record + '</small>' : '');
  }
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.hidden = false;
    var r = stage.getBoundingClientRect(), tw = tip.offsetWidth;
    tip.style.transform = 'translate(' + NK.clamp(x + 16, 8, r.width - tw - 8).toFixed(0) + 'px,' + (y - 12).toFixed(0) + 'px) translateY(-100%)';
  }
  function hideTip() { if (tip) tip.hidden = true; }
  NK.chinaUI = { active: function () { return 1; }, recordHtml: recordHtml, showTip: showTip, hideTip: hideTip, inside: inside, llToChina: llToChina };

  /* 2D stand-in when WebGL is missing: the map and its markers, then the question */
  NK.china2d = function () {
    if (sec.classList.contains('is-2d')) return;
    sec.classList.add('is-2d');
    var svg = sec.querySelector('[data-cz-svg]'); if (!svg) return;
    var d = '';
    geo.rings.forEach(function (r) { for (var i = 0; i < r.p.length; i += 2) d += (i ? 'L' : 'M') + r.p[i] + ' ' + r.p[i + 1]; d += 'Z'; });
    NK.svg('path', { d: d, class: 'cz__land' }, svg);
    DATA.china.scn.provinces.forEach(function (c) { if (P[c]) NK.svg('path', { d: 'M' + (P[c].x - 5) + ' ' + (P[c].y - 5) + 'l5 -9l5 9z', class: 'cz__m-tri' }, svg); });
    DATA.china.rkn.cabi.concat(DATA.china.rkn.survey).forEach(function (c) {
      if (P[c]) NK.svg('circle', { cx: P[c].x + 6, cy: P[c].y + 3, r: 5, class: DATA.china.rkn.survey.indexOf(c) >= 0 ? 'cz__m-pin cz__m-pin--gold' : 'cz__m-pin' }, svg);
    });
  };

  /* the pager drives the flight: stop, merge, high altitude to field, field
   * to roots, roots, question. Each step has a fixed pace and cannot be
   * skipped with a fast scroll. */
  var LAYERED = sec.getAttribute('data-layers') === 'on';
  NK.chinaLayered = LAYERED;
  var DUR = LAYERED ? [0, 1300, 1300, 1300, 6200, 5200] : [0, 4400, 5200];
  var LAST = DUR.length - 1;
  /* the big number counts up once the title is in, like US$173 billion on the world map */
  var usd = sec.querySelector('[data-cz-usd]'), counted = false;
  function countUp() {
    if (!usd || counted) return;
    counted = true;
    if (H0.reduced) return;
    var t0 = performance.now();
    (function f(now) { var k = NK.clamp((now - t0) / 1400, 0, 1); usd.textContent = 'US$' + Math.round(120 * NK.easeOut(k)); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  NK.chinaArr = 1;
  NK.chinaHandoff = function () { sec.classList.add('is-handoff', 'is-pre'); stage.style.setProperty('--arrive', '0'); requestAnimationFrame(function () { requestAnimationFrame(function () { sec.classList.add('is-show'); }); }); };
  NK.chinaArrive = function () { sec.classList.remove('is-handoff', 'is-show'); stage.style.setProperty('--arrive', '1'); };
  var drive = function () { return null; };
  NK.chinaDriver = function (fn) { drive = fn; };
  function to(i, ms, dir) {
    var d = drive(i, ms, dir);
    stage.style.setProperty('--qo', i >= LAST ? '1' : '0');
    sec.setAttribute('data-fo', LAYERED && i >= 1 && i <= 3 ? String(i - 1) : '-1');
    if (d === null) { sec.classList.toggle('is-q', i >= LAST); stage.style.setProperty('--merge', i >= LAST - 1 && i > 0 ? '1' : '0'); }
  }
  H0.scene('china', {
    steps: LAST, tall: LAYERED ? 7 : 4, cutIn: true, noSkip: true,
    set: function (i) { to(i, 0); if (i === 0) sec.classList.add('is-pre'); if (!sec.classList.contains('is-handoff')) { NK.chinaArr = 1; stage.style.setProperty('--arrive', '1'); } },
    step: function (i, dir) { if (i === 0) sec.classList.remove('is-pre'); var ms = sec.classList.contains('is-2d') ? 450 : dir > 0 ? DUR[i] : (LAYERED && i === 3 ? 2600 : 1400); to(i, ms, dir); return ms; },
    enter: function (dir, info) {
      if (sec.classList.contains('is-handoff')) {
        NK.chinaArrive(1700);
        setTimeout(function () { sec.classList.remove('is-pre'); }, 250);
        setTimeout(countUp, 700);
        return 1500;
      }
      sec.classList.remove('is-pre');
      setTimeout(countUp, 450);
      return 0;
    }
  });
  if (!window.THREE || !NK.webgl()) NK.china2d();
}());

/* Bridge 02 → 03 in 3D (three.js): from China's farming regions to one maize
 * field, then into the soil beneath a plant, where J2 juveniles move toward a
 * root tip. Three scenes at three scales are joined by the detective's lens:
 * a circular portal that opens from the point the camera dives into. Scroll
 * drives the flight. The scenes are built in idle time after page load (or at
 * once when the reader gets close), and home-zoom.js supplies an SVG version
 * when WebGL is missing or the build fails. Everything here is illustration,
 * not measured data. */
(function () {
  'use strict';
  var NK = window.NK;
  var T = window.THREE;
  var geo = window.NKUHomeGeo;
  var sec = document.querySelector('[data-zoom]');
  if (!NK || !T || !geo || !sec || !NK.webgl()) return;
  var runway = sec.querySelector('[data-zoom-runway]');
  var stage = sec.querySelector('[data-zoom-stage]');
  var canvas = sec.querySelector('[data-zoom-canvas]');
  var labelEl = sec.querySelector('[data-zoom-label]');
  var steps = Array.prototype.slice.call(sec.querySelectorAll('[data-zoom-steps] li'));
  if (!stage || !canvas) return;
  var chinaLabels = sec.querySelector('[data-china-labels]');
  var panelEl = sec.querySelector('[data-cz-head]');

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { if (NK.china2d) NK.china2d(); return; }
  /* From here on the 3D version owns the section (see home-zoom.js). */
  NK.zoom3d = true;
  sec.classList.add('is-3d');

  var DPR = Math.min(window.devicePixelRatio || 1, NK.coarse ? 1.25 : 1.5);
  renderer.setPixelRatio(DPR);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  var GL2 = renderer.capabilities.isWebGL2;
  var ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  var R = NK.rng(20260924);
  var U = { uTime: { value: 0 } };
  var UP = new T.Vector3(0, 1, 0);
  var V3 = function (x, y, z) { return new T.Vector3(x, y, z); };
  var W = 1;
  var H = 1;

  function ease(x) { return NK.easeInOut(NK.clamp(x, 0, 1)); }
  function pick(list) { return list[(R() * list.length) | 0]; }
  function canvasTex(w, h, paint) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    paint(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c);
    t.anisotropy = ANISO;
    return t;
  }
  function segDist(p, a, b) {
    var ab = b.clone().sub(a);
    var t = NK.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
    return p.distanceTo(a.clone().addScaledVector(ab, t));
  }

  /* ---------------- shared GLSL and materials ---------------- */
  var NOISE = [
    'float nkH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float nkN(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(nkH(i), nkH(i + vec2(1.0, 0.0)), f.x), mix(nkH(i + vec2(0.0, 1.0)), nkH(i + vec2(1.0, 1.0)), f.x), f.y); }',
    'float nkF(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { s += a * nkN(p); p *= 2.03; a *= 0.5; } return s; }'
  ].join('\n');
  function groundMaterial(key, glsl) {
    var m = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = 'varying vec3 vNkW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vNkW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'varying vec3 vNkW;\n' + NOISE + '\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + glsl);
    };
    m.customProgramCacheKey = function () { return 'nk-ground-' + key; };
    return m;
  }
  var FIELD_GLSL = [
    '{',
    '  vec2 wp = vNkW.xz;',
    '  float n1 = nkF(wp * 0.35); float n2 = nkF(wp * 4.0); float n3 = nkN(wp * 30.0);',
    '  float row = abs(fract(wp.y / 0.75 + 0.5) - 0.5) * 2.0;',
    '  vec3 soil = mix(vec3(0.3, 0.22, 0.16), vec3(0.46, 0.36, 0.26), n1);',
    '  soil *= (0.8 + 0.34 * n2) * (0.9 + 0.2 * n3);',
    '  soil *= 0.86 + 0.18 * (1.0 - smoothstep(0.0, 0.5, row));',
    '  float edge = min(32.0 - abs(wp.x), 22.0 - abs(wp.y));',
    '  float outer = clamp(max(smoothstep(15.6, 17.6, abs(wp.x)), smoothstep(8.9, 10.4, abs(wp.y))), 0.0, 1.0);',
    '  vec3 crop = mix(vec3(0.34, 0.49, 0.2), vec3(0.2, 0.3, 0.12), smoothstep(0.25, 0.7, row)) * (0.82 + 0.34 * n2);',
    '  soil = mix(soil, crop, outer);',
    '  vec3 grass = vec3(0.5, 0.57, 0.32) * (0.84 + 0.3 * n2);',
    '  soil = mix(grass, soil, smoothstep(0.0, 1.6, edge));',
    '  diffuseColor.rgb *= soil;',
    '}'
  ].join('\n');
  var SOIL_GLSL = [
    '{',
    '  vec2 wp = vNkW.xz;',
    '  float n1 = nkF(wp * 0.05); float n2 = nkF(wp * 0.45); float n3 = nkN(wp * 2.6);',
    '  vec3 soil = mix(vec3(0.27, 0.19, 0.14), vec3(0.43, 0.33, 0.24), n1);',
    '  soil *= (0.78 + 0.36 * n2) * (0.86 + 0.26 * n3);',
    '  diffuseColor.rgb *= soil;',
    '}'
  ].join('\n');
  function swayMaterial() {
    var m = new T.MeshStandardMaterial({ vertexColors: true, side: T.DoubleSide, roughness: 0.72, metalness: 0 });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = U.uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        '  vec3 nkIp = vec3(0.0);',
        '#ifdef USE_INSTANCING',
        '  nkIp = instanceMatrix[3].xyz;',
        '#endif',
        '  float nkY = max(position.y, 0.0);',
        '  float nkS = sin(uTime * 1.25 + nkIp.x * 0.21 + nkIp.z * 0.13) * 0.65 + sin(uTime * 2.9 + nkIp.x * 0.8 + nkIp.z * 0.4) * 0.25;',
        '  transformed.x += nkS * 0.06 * nkY * nkY;',
        '  transformed.z += cos(uTime * 1.05 + nkIp.z * 0.27) * 0.025 * nkY * nkY;'
      ].join('\n'));
    };
    m.customProgramCacheKey = function () { return 'nk-maize-sway'; };
    return m;
  }

  /* ---------------- procedural geometry ---------------- */
  function maizeGeometry() {
    var pos = [];
    var col = [];
    var idx = [];
    function v(x, y, z, c) { pos.push(x, y, z); col.push(c.r, c.g, c.b); return pos.length / 3 - 1; }
    var s0 = new T.Color('#5a7a36');
    var s1 = new T.Color('#86a857');
    var HT = 1.9;
    var sides = 6;
    var lv = 7;
    for (var i = 0; i <= lv; i++) {
      var y = HT * i / lv;
      var r = 0.024 * (1 - 0.55 * i / lv);
      var c = s0.clone().lerp(s1, i / lv);
      for (var s = 0; s < sides; s++) { var a = s / sides * Math.PI * 2; v(Math.cos(a) * r, y, Math.sin(a) * r, c); }
    }
    for (i = 0; i < lv; i++) {
      for (s = 0; s < sides; s++) {
        var a0 = i * sides + s;
        var a1 = i * sides + (s + 1) % sides;
        idx.push(a0, a0 + sides, a1, a1, a0 + sides, a1 + sides);
      }
    }
    var nL = 8;
    var leafBase = new T.Color('#557f36');
    var leafTip = new T.Color('#9cc464');
    for (var l = 0; l < nL; l++) {
      var y0 = 0.16 + l * 0.2;
      var ang = (l % 2 ? 0 : Math.PI) + l * 0.33 + (R() - 0.5) * 0.3;
      var len = 0.52 + 0.38 * Math.sin(Math.PI * (l + 1.2) / (nL + 1.4));
      var dx = Math.cos(ang);
      var dz = Math.sin(ang);
      var seg = 7;
      var base = pos.length / 3;
      for (var k = 0; k <= seg; k++) {
        var u = k / seg;
        var hd = len * u;
        var hy = y0 + len * (0.52 * u - 0.66 * u * u);
        var w = 0.066 * Math.sin(Math.PI * Math.min(1, u * 1.04 + 0.05)) * (1 - 0.25 * u);
        var cx = dx * hd;
        var cz = dz * hd;
        var cc = leafBase.clone().lerp(leafTip, u * 0.85);
        var cm = cc.clone().multiplyScalar(1.1);
        v(cx - dz * w, hy - w * 0.3, cz + dx * w, cc);
        v(cx, hy, cz, cm);
        v(cx + dz * w, hy - w * 0.3, cz - dx * w, cc);
      }
      for (k = 0; k < seg; k++) {
        var o = base + k * 3;
        var n = o + 3;
        idx.push(o, n, o + 1, o + 1, n, n + 1, o + 1, n + 1, o + 2, o + 2, n + 1, n + 2);
      }
    }
    var g = new T.BufferGeometry();
    g.setIndex(idx);
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }
  function taperTube(curve, segs, radial, r0, r1) {
    var frames = curve.computeFrenetFrames(segs, false);
    var pos = [];
    var nor = [];
    var idx = [];
    var P = new T.Vector3();
    var N = new T.Vector3();
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      curve.getPointAt(t, P);
      var r = r0 + (r1 - r0) * Math.pow(t, 0.85);
      var nn = frames.normals[i];
      var bb = frames.binormals[i];
      for (var j = 0; j <= radial; j++) {
        var a = j / radial * Math.PI * 2;
        var sn = Math.sin(a);
        var cs = -Math.cos(a);
        N.set(cs * nn.x + sn * bb.x, cs * nn.y + sn * bb.y, cs * nn.z + sn * bb.z).normalize();
        nor.push(N.x, N.y, N.z);
        pos.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z);
      }
    }
    for (i = 0; i < segs; i++) {
      for (j = 0; j < radial; j++) {
        var q0 = i * (radial + 1) + j;
        var q1 = q0 + radial + 1;
        idx.push(q0, q1, q0 + 1, q0 + 1, q1, q1 + 1);
      }
    }
    return { pos: pos, nor: nor, idx: idx };
  }
  function merge(parts) {
    var pos = [];
    var nor = [];
    var idx = [];
    parts.forEach(function (p) {
      var off = pos.length / 3;
      Array.prototype.push.apply(pos, p.pos);
      Array.prototype.push.apply(nor, p.nor);
      for (var i = 0; i < p.idx.length; i++) idx.push(p.idx[i] + off);
    });
    var g = new T.BufferGeometry();
    g.setIndex(idx);
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    return g;
  }
  function wormGeometry(len, rad) {
    var segs = 44;
    var rs = 8;
    var pos = [];
    var nor = [];
    var idx = [];
    for (var i = 0; i <= segs; i++) {
      var u = i / segs;
      var prof = u < 0.07 ? 0.22 + 0.78 * Math.sqrt(u / 0.07) : 0.06 + 0.94 * Math.pow(1 - (u - 0.07) / 0.93, 0.55);
      for (var j = 0; j <= rs; j++) {
        var a = j / rs * Math.PI * 2;
        pos.push(-u * len, Math.cos(a) * rad * prof, Math.sin(a) * rad * prof);
        nor.push(0, Math.cos(a), Math.sin(a));
      }
    }
    for (i = 0; i < segs; i++) {
      for (j = 0; j < rs; j++) {
        var q0 = i * (rs + 1) + j;
        var q1 = q0 + rs + 1;
        idx.push(q0, q1, q0 + 1, q0 + 1, q1, q1 + 1);
      }
    }
    return merge([{ pos: pos, nor: nor, idx: idx }]);
  }
  /* A soil clod: an icosphere with its corners pushed in and out. The
   * geometry is non-indexed, so shared corners are keyed by position. */
  function clodGeometry() {
    var g = new T.IcosahedronGeometry(1, 1);
    var pos = g.attributes.position;
    var jit = {};
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i);
      var y = pos.getY(i);
      var z = pos.getZ(i);
      var key = x.toFixed(3) + ',' + y.toFixed(3) + ',' + z.toFixed(3);
      if (jit[key] === undefined) jit[key] = 0.78 + R() * 0.42;
      pos.setXYZ(i, x * jit[key], y * jit[key], z * jit[key]);
    }
    g.computeVertexNormals();
    return g;
  }

  /* ---------------- textures (made during the deferred build) ---------------- */
  var GROUND = 760;
  var ROADS = [
    { w: 7, c: '#ece2c9', pts: [[-380, 36], [-210, 29], [-90, 34], [30, 31], [170, 23], [380, 31]] },
    { w: 5, c: '#e6dbc1', pts: [[-62, -380], [-57, -150], [-61, 33]] },
    { w: 10, c: '#8fb3c4', pts: [[172, -380], [150, -150], [166, 60], [140, 380]] }
  ];
  var fieldTex = null;
  var glowTex = null;
  var maizeGeo = null;
  var maizeMat = null;
  function makeFieldTex() {
    return canvasTex(2048, 2048, function (g, w) {
      var k = w / GROUND;
      function X(x) { return (x + GROUND / 2) * k; }
      g.fillStyle = '#cdbf88';
      g.fillRect(0, 0, w, w);
      var n = 9;
      var cell = GROUND / n;
      var Vt = [];
      for (var r = 0; r <= n; r++) {
        Vt.push([]);
        for (var q = 0; q <= n; q++) {
          var e = r === 0 || q === 0 || r === n || q === n;
          Vt[r].push([-GROUND / 2 + q * cell + (e ? 0 : (R() - 0.5) * cell * 0.4), -GROUND / 2 + r * cell + (e ? 0 : (R() - 0.5) * cell * 0.3)]);
        }
      }
      var crops = [['#9fb766', '#86a553'], ['#d8c07a', '#c4aa62'], ['#b5c97e', '#9cb867'], ['#e2d39a', '#cdbd82'], ['#a9bf78', '#8fae62'], ['#c9b979', '#b4a466'], ['#7fa153', '#6b9046']];
      function path(poly) { g.beginPath(); poly.forEach(function (p, i) { if (i) g.lineTo(X(p[0]), X(p[1])); else g.moveTo(X(p[0]), X(p[1])); }); g.closePath(); }
      for (r = 0; r < n; r++) {
        for (q = 0; q < n; q++) {
          var poly = [Vt[r][q], Vt[r][q + 1], Vt[r + 1][q + 1], Vt[r + 1][q]];
          var subs = R() < 0.55 ? [poly] : (function (pl) {
            var m0 = [(pl[0][0] + pl[1][0]) / 2, (pl[0][1] + pl[1][1]) / 2];
            var m1 = [(pl[3][0] + pl[2][0]) / 2, (pl[3][1] + pl[2][1]) / 2];
            return [[pl[0], m0, m1, pl[3]], [m0, pl[1], pl[2], m1]];
          }(poly));
          subs.forEach(function (sp) {
            var cp = pick(crops);
            g.save();
            path(sp);
            g.fillStyle = cp[0];
            g.fill();
            g.clip();
            g.translate(X(sp[0][0]), X(sp[0][1]));
            g.rotate((R() - 0.5) * 0.5 + (R() < 0.5 ? 0 : Math.PI / 2));
            var spc = (1.8 + R() * 1.6) * k;
            g.strokeStyle = cp[1];
            g.lineWidth = spc * 0.45;
            for (var s = -w; s < w; s += spc) { g.beginPath(); g.moveTo(-w, s); g.lineTo(w, s); g.stroke(); }
            g.restore();
            path(sp);
            g.strokeStyle = 'rgba(238,228,198,.95)';
            g.lineWidth = 2.4 * k;
            g.stroke();
          });
        }
      }
      ROADS.forEach(function (rd) {
        g.strokeStyle = rd.c;
        g.lineWidth = rd.w * k;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        rd.pts.forEach(function (p, i) { if (i) g.lineTo(X(p[0]), X(p[1])); else g.moveTo(X(p[0]), X(p[1])); });
        g.stroke();
      });
    });
  }
  function makeGlowTex() {
    return canvasTex(128, 128, function (g) {
      var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,220,120,1)');
      gr.addColorStop(0.32, 'rgba(246,193,75,.42)');
      gr.addColorStop(1, 'rgba(246,193,75,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    });
  }

  /* ---------------- level 0 · China's farming regions ---------------- */
  function buildMap() {
    var scene = new T.Scene();
    scene.background = new T.Color(0x140b1c);
    scene.fog = new T.Fog(0x140b1c, 80, 210);
    var cam = new T.PerspectiveCamera(36, 1, 0.05, 800);
    scene.add(new T.HemisphereLight(0xd9cbef, 0x1a0f24, 1.0));
    var sun = new T.DirectionalLight(0xffe7c4, 0.55);
    sun.position.set(20, 60, 30);
    scene.add(sun);
    var grid = new T.GridHelper(420, 84, 0x2e2040, 0x22172f);
    grid.position.y = -0.02;
    scene.add(grid);
    function toP(x, y) { return [(x - 300) / 10, (y - 250) / 10]; }
    var shapes = geo.rings.map(function (r) {
      var s = new T.Shape();
      for (var i = 0; i < r.p.length; i += 2) { var q = toP(r.p[i], r.p[i + 1]); if (i) s.lineTo(q[0], -q[1]); else s.moveTo(q[0], -q[1]); }
      return s;
    });
    var slab = new T.ExtrudeGeometry(shapes, { depth: 0.8, bevelEnabled: false, curveSegments: 1 });
    slab.rotateX(-Math.PI / 2);
    var slab0 = new T.Mesh(slab, new T.MeshStandardMaterial({ color: 0x2b1c40, emissive: 0x100818, roughness: 0.92, transparent: true, opacity: 1 }));
    scene.add(slab0);
    var lineMat = new T.LineBasicMaterial({ color: 0xb99be0, transparent: true, opacity: 0.85 });
    var bb = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    var outl = [], ringV3 = [];
    geo.rings.forEach(function (r) {
      if (r.a < 1.5) return;
      var pts = [], p2 = [];
      outl.push(p2);
      for (var i = 0; i < r.p.length; i += 2) {
        var q = toP(r.p[i], r.p[i + 1]);
        p2.push(q);
        pts.push(V3(q[0], 0.81, q[1]));
        if (i === 0) ringV3.push(pts);
        bb.x0 = Math.min(bb.x0, q[0]); bb.x1 = Math.max(bb.x1, q[0]); bb.z0 = Math.min(bb.z0, q[1]); bb.z1 = Math.max(bb.z1, q[1]);
      }
      scene.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), lineMat));
    });
    /* v6.3: a bold outline painted on the map, as thick on screen as the world
     * map's China outline, so the hand-off from the world map is seamless */
    var ribbon = new T.Mesh(new T.BufferGeometry(), new T.MeshBasicMaterial({ color: 0xb99be0, transparent: true, depthWrite: false, side: T.DoubleSide }));
    ribbon.renderOrder = 2;
    scene.add(ribbon);
    /* v6.6 layered view: two more plates slide out beneath the map (abundance on top,
     * soybean cyst nematode in the middle, root-knot nematode at the bottom) */
    var plates = [slab0];
    for (var pi2 = 1; pi2 < 3; pi2++) {
      var pm = new T.Mesh(slab, new T.MeshStandardMaterial({ color: 0x2b1c40, emissive: 0x120a1c, roughness: 0.92, transparent: true, opacity: 0.95 }));
      var plm = new T.LineBasicMaterial({ color: 0xb99be0, transparent: true, opacity: 0.7 });
      ringV3.forEach(function (pts) { pm.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), plm)); });
      pm.userData.lm = plm;
      pm.visible = false;
      scene.add(pm);
      plates.push(pm);
    }
    function setRibbon(hw) {
      var pos = [], idx = [];
      outl.forEach(function (P) {
        var n = P.length, base = pos.length / 3, i;
        for (i = 0; i < n; i++) {
          var a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n];
          var tx = c[0] - a[0], tz = c[1] - a[1], tl = Math.sqrt(tx * tx + tz * tz) || 1;
          var nx = -tz / tl, nz = tx / tl;
          pos.push(b[0] + nx * hw, 0.816, b[1] + nz * hw, b[0] - nx * hw, 0.816, b[1] - nz * hw);
        }
        for (i = 0; i < n; i++) { var a0 = base + i * 2, b0 = base + ((i + 1) % n) * 2; idx.push(a0, a0 + 1, b0, a0 + 1, b0 + 1, b0); }
      });
      var g = new T.BufferGeometry();
      g.setIndex(idx);
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      ribbon.geometry.dispose();
      ribbon.geometry = g;
    }
    (geo.maritime || []).forEach(function (line) {
      var pts = [];
      for (var i = 0; i < line.length; i += 2) { var q = toP(line[i], line[i + 1]); pts.push(V3(q[0], 0.02, q[1])); }
      if (pts.length < 2) return;
      var ln = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: 0xb99be0, dashSize: 0.5, gapSize: 0.5, transparent: true, opacity: 0.5 }));
      ln.computeLineDistances();
      scene.add(ln);
    });
    var MC = V3((bb.x0 + bb.x1) / 2, 0.8, (bb.z0 + bb.z1) / 2);
    var MW = bb.x1 - bb.x0 + 3;
    var MD = bb.z1 - bb.z0 + 5;
    var GAP = MD * 0.42;
    function ll(lon, lat) {
      var c = geo.china;
      var q = toP((lon - c.west) * c.upd + c.ox, (c.north - lat) * c.upd + c.oy);
      return V3(q[0], 0.82, q[1]);
    }
    var glows = [[126, 46.3, 15, 0.55], [105, 30.6, 10, 0.5], [115.6, 30.4, 11, 0.5], [116.5, 35.6, 12, 1.0]].map(function (g) {
      var sp = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 }));
      sp.rotation.x = -Math.PI / 2;
      sp.position.copy(ll(g[0], g[1]));
      sp.position.y = 0.87;
      sp.scale.set(g[2], g[2], 1);
      sp.userData = { s: g[2], o: g[3], ph: R() * 6 };
      scene.add(sp);
      return sp;
    });
    var hhh = ll(116.5, 35.6);
    var patch = new T.Mesh(new T.PlaneGeometry(3.4, 2.3), new T.MeshBasicMaterial({ map: fieldTex, transparent: true, opacity: 0, depthWrite: false }));
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(hhh.x, 0.84, hhh.z);
    scene.add(patch);
    var frame = new T.LineLoop(new T.BufferGeometry().setFromPoints([[-1.7, -1.15], [1.7, -1.15], [1.7, 1.15], [-1.7, 1.15]].map(function (p) { return V3(hhh.x + p[0], 0.86, hhh.z + p[1]); })), new T.LineDashedMaterial({ color: 0xffe3a3, dashSize: 0.16, gapSize: 0.12, transparent: true, opacity: 0 }));
    frame.computeLineDistances();
    scene.add(frame);
    var dp = [];
    for (var i = 0; i < 320; i++) dp.push((R() - 0.5) * 90, 1 + R() * 16, (R() - 0.5) * 70);
    var dg = new T.BufferGeometry();
    dg.setAttribute('position', new T.Float32BufferAttribute(dp, 3));
    var dust = new T.Points(dg, new T.PointsMaterial({ color: 0xb99be0, size: 0.16, transparent: true, opacity: 0.5, depthWrite: false }));
    scene.add(dust);

    /* ---- the three questions as data layers on this one map (records from
     * home-maps-data.js; markers sit at schematic province anchors) ---- */
    var CUI = NK.chinaUI;
    var DATA = window.NKUHomeMapsData;
    var PV = geo.provinces;
    var layers = [];
    var hits = [];
    var markers = [];
    var m4 = new T.Matrix4();
    function track(g, mat) { mat.transparent = true; mat.userData.base = mat.opacity; g.userData.mats.push(mat); return mat; }
    if (CUI && DATA && PV) {
      for (var li = 0; li < 3; li++) { var g0 = new T.Group(); g0.userData = { mats: [], op: 0 }; g0.visible = false; scene.add(g0); layers.push(g0); }
      (function () {
        var RAMP = [[243, 220, 194], [244, 162, 97], [239, 111, 108], [192, 78, 168], [110, 79, 210]];
        function rampColor(v) { v = NK.clamp(v, 0, 1) * 4; var i = Math.min(3, Math.floor(v)), f = v - i, A = RAMP[i], B = RAMP[i + 1]; return new T.Color((A[0] + (B[0] - A[0]) * f) / 255, (A[1] + (B[1] - A[1]) * f) / 255, (A[2] + (B[2] - A[2]) * f) / 255); }
        var pts = [];
        for (var y = 10; y < 500; y += 9) for (var x = 10 + ((y / 9) % 2 ? 4.5 : 0); x < 600; x += 9) if (CUI.inside(x, y)) pts.push(toP(x, y));
        var dm = track(layers[0], new T.MeshBasicMaterial({ color: 0x9a86bb, opacity: 0.5, depthWrite: false }));
        var dots = new T.InstancedMesh(new T.CylinderGeometry(0.17, 0.17, 0.06, 8), dm, pts.length);
        pts.forEach(function (q, k) { m4.makeTranslation(q[0], 0.84, q[1]); dots.setMatrixAt(k, m4); });
        layers[0].add(dots);
        var src = window.NKU_ABUNDANCE || [], mx = NK.abundanceMax || 4;
        var cp = src.filter(function (pt) { if (!isFinite(pt.value)) return false; var c = CUI.llToChina(pt.lon, pt.lat); return CUI.inside(c[0], c[1]); });
        var nEl = document.querySelector('[data-ab-n]');
        if (nEl) nEl.textContent = String(cp.length);
        if (!cp.length) return;
        var bars = new T.InstancedMesh(new T.CylinderGeometry(0.3, 0.3, 1, 10), track(layers[0], new T.MeshStandardMaterial({ roughness: 0.5, emissive: 0x2a0f2a, emissiveIntensity: 0.35, opacity: 1 })), cp.length);
        cp.forEach(function (pt, k) {
          var c = toP.apply(null, CUI.llToChina(pt.lon, pt.lat)), v = NK.clamp(Math.log(pt.value + 1) / Math.LN10 / mx, 0, 1), h = 0.25 + v * 3.4;
          m4.makeScale(1, h, 1).setPosition(c[0], 0.82 + h / 2, c[1]);
          bars.setMatrixAt(k, m4);
          bars.setColorAt(k, rampColor(v));
        });
        layers[0].add(bars);
      }());
      (function () {
        var list = DATA.china.scn.provinces.filter(function (c) { return PV[c]; });
        var inst = new T.InstancedMesh(new T.ConeGeometry(0.34, 0.62, 3), track(layers[1], new T.MeshStandardMaterial({ color: 0x5fd18f, roughness: 0.6, emissive: 0x1d5a35, emissiveIntensity: 0.5, opacity: 1 })), list.length * 4);
        var rr = NK.rng(11);
        var k = 0;
        list.forEach(function (c) {
          var q = toP(PV[c].x, PV[c].y);
          for (var j = 0; j < 4; j++) {
            var sc = j ? 0.62 + rr() * 0.3 : 1.05;
            m4.compose(V3(q[0] + (j ? (rr() - 0.5) * 1.3 : 0), 1.13, q[1] + (j ? (rr() - 0.5) * 1.1 : 0)), new T.Quaternion().setFromEuler(new T.Euler(0, rr() * 3, 0)), V3(sc, sc, sc));
            inst.setMatrixAt(k++, m4);
          }
          var hit = new T.Mesh(new T.SphereGeometry(1.25, 8, 6), new T.MeshBasicMaterial({ visible: false }));
          hit.position.set(q[0], 1.15, q[1]);
          hit.userData = { layer: 1, code: c };
          layers[1].add(hit);
          hits.push(hit);
        });
        layers[1].add(inst);
        DATA.china.scn.focus.forEach(function (f) {
          var c = CUI.llToChina(f.lon, f.lat);
          var q = toP(c[0], c[1]);
          var halo = new T.Mesh(new T.CircleGeometry(1, 48), track(layers[1], new T.MeshBasicMaterial({ color: 0xf2934a, opacity: 0.22, depthWrite: false })));
          halo.rotation.x = -Math.PI / 2;
          halo.scale.set(f.rx * geo.china.upd / 10, f.ry * geo.china.upd / 10, 1);
          halo.position.set(q[0], 0.85, q[1]);
          var ring = new T.Mesh(new T.RingGeometry(0.96, 1, 64), track(layers[1], new T.MeshBasicMaterial({ color: 0xf6a15c, opacity: 0.85, depthWrite: false, side: T.DoubleSide })));
          ring.rotation.x = -Math.PI / 2;
          ring.scale.copy(halo.scale);
          ring.position.set(q[0], 0.87, q[1]);
          layers[1].add(halo);
          layers[1].add(ring);
          markers.push({ layer: 1, text: f.label, pos: V3(q[0], 0.95, q[1] - halo.scale.y - 0.6) });
        });
      }());
      (function () {
        var rkn = DATA.china.rkn;
        var codes = rkn.cabi.concat(rkn.survey).filter(function (c) { return PV[c]; });
        var stem = new T.CylinderGeometry(0.07, 0.07, 3.0, 6);
        stem.translate(0, 2.3, 0);
        var ball = new T.SphereGeometry(0.4, 16, 12);
        ball.translate(0, 3.95, 0);
        var stemMat = track(layers[2], new T.MeshBasicMaterial({ color: 0xe8dcef, opacity: 0.55 }));
        var pink = track(layers[2], new T.MeshStandardMaterial({ color: 0xff6f9a, emissive: 0x8a1f45, emissiveIntensity: 0.6, roughness: 0.4, opacity: 1 }));
        var gold = track(layers[2], new T.MeshStandardMaterial({ color: 0xf6c14b, emissive: 0x8a5a10, emissiveIntensity: 0.7, roughness: 0.4, opacity: 1 }));
        codes.forEach(function (c) {
          var q = toP(PV[c].x, PV[c].y);
          var survey = rkn.survey.indexOf(c) >= 0;
          var s1 = new T.Mesh(stem, stemMat);
          var b1 = new T.Mesh(ball, survey ? gold : pink);
          s1.position.set(q[0], 0, q[1]);
          b1.position.set(q[0], 0, q[1]);
          layers[2].add(s1);
          layers[2].add(b1);
          var hit = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 4.2, 8), new T.MeshBasicMaterial({ visible: false }));
          hit.position.set(q[0], 2.5, q[1]);
          hit.userData = { layer: 2, code: c };
          layers[2].add(hit);
          hits.push(hit);
          if (survey) markers.push({ layer: 2, text: 'Xinjiang · survey', pos: V3(q[0], 4.7, q[1]) });
        });
      }());
    }
    markers.forEach(function (mk) {
      if (!chinaLabels) return;
      mk.el = document.createElement('span');
      mk.el.className = 'nk-china__label';
      mk.el.textContent = mk.text;
      chinaLabels.appendChild(mk.el);
    });

    /* ---- camera: the layer view sits close to the screen plane and is fitted
     * (distance + lens shift) to the free area beside the panel; the merge
     * blends it into the flight's opening view; then the dive ---- */
    var ELEV_L = 1.19;
    var ELEV_S = 0.74;
    var distS = 95;
    var D0 = V3(0, 0.9, 0.44).normalize();
    var D1 = V3(0.04, 0.91, 0.42).normalize();
    var VW = 1;
    var VH = 1;
    var FREE = { x0: 0, x1: 1, y0: 0, y1: 1 };
    var distL = 95;
    var distTop = 95;
    var dist0 = 95;
    function fitStack(fr, elev) {
      var tanV = Math.tan(cam.fov * Math.PI / 360);
      var fw = Math.max(90, fr.x1 - fr.x0), fh = Math.max(90, fr.y1 - fr.y0);
      var hgt = MD * Math.sin(elev) + 2 * GAP * Math.cos(elev);
      return Math.max(MW * VH / (2 * tanV * fw), hgt * VH / (2 * tanV * fh)) * 1.06;
    }
    function fitDist(fr, elev) {
      var tanV = Math.tan(cam.fov * Math.PI / 360);
      var fw = Math.max(90, fr.x1 - fr.x0);
      var fh = Math.max(90, fr.y1 - fr.y0);
      return Math.max(MW * VH / (2 * tanV * fw), MD * Math.sin(elev) * VH / (2 * tanV * fh)) * 1.04;
    }
    var tgt = new T.Vector3();
    var dir = new T.Vector3();
    var dirL = new T.Vector3();
    var ray = new T.Raycaster();
    var ndc = new T.Vector2();
    return {
      scene: scene, cam: cam, focus: hhh, bbox: bb, label: V3(hhh.x, 1.7, hhh.z), markers: markers, hasLayers: layers.length === 3,
      fit: function (a) { cam.fov = a < 1 ? 50 : 36; },
      layout: function (w, h, fr) {
        VW = w;
        VH = h;
        FREE = fr;
        distL = fitDist(fr, ELEV_L);
        distTop = fitDist(fr, 1.555);
        distS = fitStack(fr, ELEV_S);
        dist0 = fitDist({ x0: w * 0.08, x1: w * 0.92, y0: h * 0.16, y1: h * 0.9 }, Math.asin(D0.y));
        scene.fog.near = Math.max(distL, dist0, distTop) * 1.02;
        scene.fog.far = Math.max(distL, dist0, distTop, distS) * 3;
        setRibbon(1.35 * 2 * distTop * Math.tan(cam.fov * Math.PI / 360) / h);
      },
      pick: function (x, y, layer) {
        ndc.set(x / VW * 2 - 1, -(y / VH * 2 - 1));
        ray.setFromCamera(ndc, cam);
        var hit = ray.intersectObjects(hits, false)[0];
        return hit ? hit.object.userData : null;
      },
      update: function (t, time, dt, merge, layer) {
        var mg = merge === undefined ? 1 : merge;
        var e = ease(t);
        var kT = ease(t / 0.62);
        var dz = t > 1 ? 3 * (1 - (t - 1) * 1.6) : dist0 * Math.pow(3 / dist0, Math.pow(e, 1.35));
        tgt.copy(MC).lerp(hhh, kT);
        dir.copy(D0).lerp(D1, kT).normalize().applyAxisAngle(UP, -0.28 * kT + Math.sin(time * 0.15) * 0.015);
        var dist = dz;
        var offX = 0;
        var offY = 0;
        if (mg < 1) {
          var bl = ease(mg);
          /* arrival from the world map: straight down first, then the view tilts into 3D */
          var ar = NK.easeInOut(NK.chinaArr == null ? 1 : NK.chinaArr), exC = ease(NK.chinaEx == null ? 0 : NK.chinaEx);
          var elev = NK.lerp(1.555, NK.lerp(ELEV_L, ELEV_S, exC), ar);
          var dLay = Math.exp(NK.lerp(Math.log(distL), Math.log(distS), exC));
          var dLv = Math.exp(Math.log(distTop) + (Math.log(dLay) - Math.log(distTop)) * ar);
          tgt.y -= GAP * exC * (1 - bl);
          dirL.set(0, Math.sin(elev), Math.cos(elev)).applyAxisAngle(UP, Math.sin(time * 0.15) * 0.012 * ar);
          dir.copy(dirL).lerp(dir, bl).normalize();
          dist = Math.exp(Math.log(dLv) + (Math.log(dz) - Math.log(dLv)) * bl);
          offX = -((FREE.x0 + FREE.x1) / 2 - VW / 2) * (1 - bl);
          offY = -((FREE.y0 + FREE.y1) / 2 - VH / 2) * (1 - bl);
        }
        cam.position.copy(tgt).addScaledVector(dir, Math.max(0.9, dist));
        cam.lookAt(tgt);
        if (Math.abs(offX) > 0.5 || Math.abs(offY) > 0.5) cam.setViewOffset(VW, VH, offX, offY, VW, VH);
        else if (cam.view && cam.view.enabled) cam.clearViewOffset();
        cam.near = Math.max(0.02, dist * 0.02);
        cam.far = dist * 6 + 90;
        cam.updateProjectionMatrix();
        patch.material.opacity = NK.smooth(0.45, 0.85, t);
        ribbon.material.opacity = 1 - NK.smooth(0.02, 0.22, t);
        frame.material.opacity = 0.9 * NK.smooth(0.3, 0.55, t) * (1 - NK.smooth(1.02, 1.12, t));
        var glowIn = mg < 1 ? NK.smooth(0.15, 1, mg) : 1;
        glows.forEach(function (sp) {
          var u = sp.userData;
          var pulse = 1 + 0.06 * Math.sin(time * 1.4 + u.ph);
          sp.scale.set(u.s * pulse, u.s * pulse, 1);
          sp.material.opacity = glowIn * u.o * (0.86 + 0.14 * Math.sin(time * 1.1 + u.ph)) * (1 - 0.88 * NK.smooth(0.28, 0.72, t));
        });
        /* layered view: plates apart by exV, one layer in focus (FO: -1 none, 0..2) */
        var exV = mg < 1 ? ease(NK.chinaEx == null ? 0 : NK.chinaEx) : 0;
        var FO = NK.chinaFo == null ? -1 : NK.chinaFo, fw = NK.clamp(FO + 1, 0, 1), fpos = NK.clamp(FO, 0, 2);
        var arrV = NK.smooth(0.35, 1, NK.chinaArr == null ? 1 : NK.chinaArr);
        var LY = [0, -GAP * exV, -2 * GAP * exV];
        this.layerY = LY;
        var fop = [0, 1, 2].map(function (i) { return NK.lerp(1, NK.lerp(0.16, 1, Math.max(0, 1 - Math.abs(fpos - i))), fw); });
        plates.forEach(function (pm, i) {
          var po = i ? NK.smooth(0.02, 0.3, exV) * NK.lerp(0.3, 0.95, fop[i]) : NK.lerp(1, 0.3 + 0.7 * fop[0], exV);
          if (i) { pm.position.y = LY[i]; pm.visible = exV > 0.01; }
          pm.material.opacity = po;
          if (pm.userData.lm) pm.userData.lm.opacity = 0.7 * po;
        });
        ribbon.material.opacity *= NK.lerp(1, 0.3 + 0.7 * fop[0], exV);
        var k = mg >= 1 ? 1 : 1 - Math.exp(-(dt || 0.016) * 6);
        layers.forEach(function (g, i) {
          g.position.y = LY[i];
          var target = (i === 0 ? exV : 1) * fop[i] * (1 - NK.smooth(0, 0.55, mg)) * arrV;
          g.userData.op += (target - g.userData.op) * k;
          if (Math.abs(target - g.userData.op) < 0.002) g.userData.op = target;
          g.userData.mats.forEach(function (mt) { mt.opacity = mt.userData.base * g.userData.op; mt.depthWrite = g.userData.op > 0.6 && mt.userData.base >= 1; });
          g.visible = g.userData.op > 0.01;
          g.userData.shown = g.userData.op;
        });
        this.layerOp = layers.map(function (g) { return g.userData.op; });
        dust.rotation.y = time * 0.012;
      }
    };
  }

  /* ---------------- level 1 · a maize field ---------------- */
  function buildField() {
    var scene = new T.Scene();
    var haze = new T.Color(0xefe4cc);
    scene.background = haze;
    scene.fog = new T.Fog(haze, 150, 820);
    var cam = new T.PerspectiveCamera(40, 1, 0.05, 2400);
    scene.add(new T.HemisphereLight(0xfff4dc, 0x5d4a33, 0.85));
    var sun = new T.DirectionalLight(0xfff0d2, 1.15);
    sun.position.set(-30, 60, 24);
    sun.castShadow = true;
    sun.shadow.mapSize.set(NK.coarse ? 512 : 1024, NK.coarse ? 512 : 1024);
    var sc = sun.shadow.camera;
    sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 20; sc.far = 130;
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    scene.add(sun.target);
    var dome = new T.Mesh(new T.SphereGeometry(1600, 24, 12), new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; gl_FragColor = vec4(mix(vec3(0.937, 0.894, 0.8), vec3(0.62, 0.75, 0.88), smoothstep(0.02, 0.5, h)), 1.0); }'
    }));
    dome.renderOrder = -1;
    scene.add(dome);
    var ground = new T.Mesh(new T.PlaneGeometry(GROUND, GROUND), new T.MeshStandardMaterial({ map: fieldTex, color: 0xd4d0c8, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    var field = new T.Mesh(new T.PlaneGeometry(64, 44), groundMaterial('field', FIELD_GLSL));
    field.rotation.x = -Math.PI / 2;
    field.position.y = 0.03;
    field.receiveShadow = true;
    scene.add(field);

    var DEND = V3(-0.35, 0.45, 0.82).normalize();
    var endCam = DEND.clone().multiplyScalar(1.45).add(V3(0, 0.28, 0));
    var clearA = V3(0, 0, 0);
    var clearB = V3(endCam.x, 0, endCam.z).normalize().multiplyScalar(3.2);
    var near = [];
    var far = [];
    var m4 = new T.Matrix4();
    var q4 = new T.Quaternion();
    for (var i = -12; i <= 12; i++) {
      for (var j = -32; j <= 32; j++) {
        if (!i && !j) continue;
        var x = j * 0.5 + (R() - 0.5) * 0.08;
        var z = i * 0.75 + (R() - 0.5) * 0.05;
        if (segDist(V3(x, 0, z), clearA, clearB) < 0.55) continue;
        var f = NK.smooth(0, 2.6, Math.min(16.2 - Math.abs(x), 9.3 - Math.abs(z)));
        var s = (0.86 + R() * 0.24) * (0.4 + 0.6 * f);
        q4.setFromAxisAngle(UP, R() * Math.PI * 2);
        m4.compose(V3(x, 0, z), q4, V3(s, s * (0.92 + R() * 0.16), s));
        (x * x + z * z < 64 ? near : far).push(m4.clone());
      }
    }
    [[near, true], [far, false]].forEach(function (set) {
      var im = new T.InstancedMesh(maizeGeo, maizeMat, set[0].length);
      set[0].forEach(function (m, k) { im.setMatrixAt(k, m); });
      im.castShadow = set[1];
      im.receiveShadow = true;
      scene.add(im);
    });
    var hero = new T.Mesh(maizeGeo, maizeMat);
    hero.castShadow = true;
    hero.receiveShadow = true;
    scene.add(hero);

    var treePos = [];
    ROADS.slice(0, 2).forEach(function (rd) {
      for (var a = 0; a < rd.pts.length - 1; a++) {
        var p0 = rd.pts[a];
        var p1 = rd.pts[a + 1];
        var len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        for (var d = 6; d < len; d += 13 + R() * 8) {
          var tx = p0[0] + (p1[0] - p0[0]) * d / len;
          var tz = p0[1] + (p1[1] - p0[1]) * d / len;
          var nx = -(p1[1] - p0[1]) / len;
          var nz = (p1[0] - p0[0]) / len;
          [-1, 1].forEach(function (sd) {
            var px = tx + nx * sd * (rd.w / 2 + 4 + R() * 2);
            var pz = tz + nz * sd * (rd.w / 2 + 4 + R() * 2);
            if (Math.abs(px) < 40 && Math.abs(pz) < 30) return;
            if (R() < 0.82) treePos.push([px, pz]);
          });
        }
      }
    });
    var canopy = new T.InstancedMesh(new T.IcosahedronGeometry(1, 1), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), treePos.length);
    var trunk = new T.InstancedMesh(new T.CylinderGeometry(0.22, 0.32, 3, 6), new T.MeshStandardMaterial({ color: 0x6b4f38, roughness: 1 }), treePos.length);
    var tc = new T.Color();
    treePos.forEach(function (p, k) {
      var h = 5 + R() * 4;
      m4.compose(V3(p[0], h * 0.55 + 2.2, p[1]), q4.setFromAxisAngle(UP, R() * 6), V3(2.4 + R() * 1.6, h * 0.55, 2.4 + R() * 1.6));
      canopy.setMatrixAt(k, m4);
      canopy.setColorAt(k, tc.set(pick(['#4f6f3a', '#5c7d40', '#46643a', '#62813f'])));
      m4.compose(V3(p[0], 1.5, p[1]), q4.identity(), V3(1, 1, 1));
      trunk.setMatrixAt(k, m4);
    });
    scene.add(canopy);
    scene.add(trunk);
    [[-92, 52, 0.2], [-76, 61, -0.1], [62, 50, 0.05], [224, 44, 0.3], [-150, 14, -0.2]].forEach(function (b) {
      var house = new T.Group();
      var body = new T.Mesh(new T.BoxGeometry(9, 4, 6), new T.MeshStandardMaterial({ color: 0xefe6d6, roughness: 0.9 }));
      body.position.y = 2;
      var roof = new T.Mesh(new T.ConeGeometry(6.4, 2.6, 4), new T.MeshStandardMaterial({ color: pick([0x9c4a3c, 0x5d6b7a, 0x8a5a3c]), roughness: 0.8, flatShading: true }));
      roof.position.y = 5.3;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.1, 1, 0.75);
      house.add(body);
      house.add(roof);
      house.position.set(b[0], 0, b[1]);
      house.rotation.y = b[2];
      scene.add(house);
    });

    var D0 = V3(0, 0.9, 0.44).normalize();
    var TGT_END = V3(0, 0.28, 0);
    var tgt = new T.Vector3();
    var dir = new T.Vector3();
    return {
      scene: scene, cam: cam, focus: V3(0, 0.05, 0),
      fit: function (a) { cam.fov = a < 1 ? 52 : 40; },
      update: function (t, time) {
        var e = ease(t);
        var dist = t < 0 ? 620 * (1 - t * 1.3) : t > 1 ? 1.45 * (1 - (t - 1) * 1.4) : 620 * Math.pow(1.45 / 620, e);
        tgt.set(0, 0, 0).lerp(TGT_END, e);
        dir.copy(D0).lerp(DEND, Math.pow(e, 1.2)).normalize().applyAxisAngle(UP, -0.85 * Math.sin(Math.PI * e));
        cam.position.copy(tgt).addScaledVector(dir, Math.max(0.7, dist));
        cam.position.y += Math.sin(time * 0.6) * 0.01 * Math.min(1, dist);
        cam.lookAt(tgt);
        cam.near = Math.max(0.03, dist * 0.012);
        cam.far = Math.max(1200, dist * 4);
        cam.updateProjectionMatrix();
        scene.fog.near = Math.max(45, dist * 0.9);
        scene.fog.far = Math.max(460, dist * 3.4);
        dome.position.copy(cam.position);
      }
    };
  }

  /* ---------------- level 2 · the soil beneath one plant ---------------- */
  var VERT_NEM = [
    'uniform float uTime; uniform float uPhase; uniform float uSpeed; uniform float uAmp; uniform float uLen;',
    'varying vec3 vN; varying vec3 vV; varying float vU;',
    'void main(){',
    '  vec3 p = position;',
    '  float u = clamp(-p.x / uLen, 0.0, 1.0);',
    '  p.z += sin(u * 7.5 - uTime * uSpeed + uPhase) * uAmp * (0.2 + 0.8 * u);',
    '  vU = u;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  vN = normalize(normalMatrix * normal);',
    '  vV = -mv.xyz;',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');
  var FRAG_NEM = [
    'uniform vec3 uColor;',
    'varying vec3 vN; varying vec3 vV; varying float vU;',
    'void main(){',
    '  vec3 n = normalize(vN); vec3 v = normalize(vV);',
    '  float diff = max(dot(n, normalize(vec3(0.3, 0.8, 0.5))), 0.0);',
    '  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.2);',
    '  vec3 col = uColor * (0.4 + 0.7 * diff) + vec3(1.0, 0.9, 0.74) * rim * 0.5;',
    '  col *= 0.97 + 0.03 * sin(vU * 260.0);',
    '  gl_FragColor = vec4(col, 0.96);',
    '}'
  ].join('\n');
  var VERT_SIG = [
    'attribute float aPh; uniform float uTime; uniform float uPx;',
    'varying float vA;',
    'void main(){',
    '  vec3 p = position;',
    '  p.y += sin(uTime * 0.6 + aPh * 6.0) * 0.35; p.x += sin(uTime * 0.4 + aPh * 9.0) * 0.3;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_Position = projectionMatrix * mv;',
    '  vA = 0.35 + 0.5 * (0.5 + 0.5 * sin(uTime * (1.5 + aPh * 2.0) + aPh * 20.0));',
    '  gl_PointSize = (0.45 + aPh * 0.4) * uPx / -mv.z;',
    '}'
  ].join('\n');
  var FRAG_SIG = 'uniform vec3 uCol; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard; float a = (smoothstep(0.4, 0.0, r) + exp(-r * r * 5.0) * 0.4) * vA; gl_FragColor = vec4(uCol * a, a); }';

  function paintStrata(g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#3e2a22');
    gr.addColorStop(0.18, '#523628');
    gr.addColorStop(0.45, '#6d4e3b');
    gr.addColorStop(1, '#8d6f55');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 26; i++) {
      var y = R() * h;
      var amp = 4 + R() * 10;
      var ph = R() * 6;
      g.beginPath();
      for (var x = 0; x <= w; x += 16) { var yy = y + Math.sin(x * 0.012 + ph) * amp; if (x) g.lineTo(x, yy); else g.moveTo(x, yy); }
      g.strokeStyle = R() < 0.5 ? 'rgba(40,26,20,.35)' : 'rgba(210,180,140,.18)';
      g.lineWidth = 2 + R() * 6;
      g.stroke();
    }
    for (i = 0; i < 6000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(30,20,15,.35)' : 'rgba(220,190,150,.2)'; g.fillRect(R() * w, R() * h, 1.6, 1.6); }
    for (i = 0; i < 380; i++) {
      var py = Math.pow(R(), 0.6) * h;
      var pr = 2 + Math.pow(R(), 2.2) * (6 + 26 * py / h);
      var px = R() * w;
      g.beginPath();
      for (var k = 0; k < 9; k++) { var a = k / 9 * 6.283; var rr = pr * (0.8 + R() * 0.35); g.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr * 0.8); }
      g.closePath();
      g.fillStyle = pick(['#8b6f58', '#76604e', '#b59a7f', '#9c7f63', '#5e4636']);
      g.fill();
      g.strokeStyle = 'rgba(30,20,14,.5)';
      g.lineWidth = 1.5;
      g.stroke();
    }
    g.strokeStyle = 'rgba(232,214,176,.3)';
    g.lineCap = 'round';
    for (i = 0; i < 46; i++) {
      var sx = R() * w;
      var sy = R() * h * 0.8;
      g.lineWidth = 1 + R() * 2.5;
      g.beginPath();
      g.moveTo(sx, sy);
      g.quadraticCurveTo(sx + (R() - 0.5) * 60, sy + 30 + R() * 40, sx + (R() - 0.5) * 80, sy + 60 + R() * 70);
      g.stroke();
    }
  }

  function buildSoil() {
    var scene = new T.Scene();
    scene.background = new T.Color(0x140b1c);
    scene.fog = new T.Fog(0x140b1c, 190, 460);
    var cam = new T.PerspectiveCamera(40, 1, 0.1, 2400);
    scene.add(new T.HemisphereLight(0xf1e4d6, 0x241620, 0.42));
    var key = new T.DirectionalLight(0xfff0d8, 0.5);
    key.position.set(-80, 170, 140);
    scene.add(key);
    var lamp = new T.SpotLight(0xffdca8, 1.15, 170, 0.48, 0.8, 1.35);
    scene.add(lamp);
    scene.add(lamp.target);
    var BX = 45;
    var BZ = 30;
    var BY = 70;
    var wallMat = new T.MeshStandardMaterial({ map: canvasTex(1024, 800, paintStrata), roughness: 1, side: T.DoubleSide });
    function wall(w, h, x, y, z, ry, rx) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), wallMat);
      m.position.set(x, y, z);
      if (ry) m.rotation.y = ry;
      if (rx) m.rotation.x = rx;
      scene.add(m);
    }
    wall(2 * BX, BY, 0, -BY / 2, -BZ, 0, 0);
    wall(2 * BZ, BY, -BX, -BY / 2, 0, Math.PI / 2, 0);
    wall(2 * BZ, BY, BX, -BY / 2, 0, -Math.PI / 2, 0);
    wall(2 * BX, 2 * BZ, 0, -BY, 0, 0, -Math.PI / 2);
    var topMat = groundMaterial('soil', SOIL_GLSL);
    topMat.side = T.DoubleSide;
    var top = new T.Mesh(new T.PlaneGeometry(2 * BX, 2 * BZ), topMat);
    top.rotation.x = -Math.PI / 2;
    scene.add(top);
    var edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(2 * BX, BY, 2 * BZ)), new T.LineBasicMaterial({ color: 0xf5e6c8, transparent: true, opacity: 0.22 }));
    edges.position.y = -BY / 2;
    scene.add(edges);
    var plant = new T.Mesh(maizeGeo, maizeMat);
    plant.scale.setScalar(100);
    scene.add(plant);

    /* camera key poses; the portrait variant (k = 1) pulls back and aims
     * lower so a narrow screen still holds the block and the J2s */
    var TIP = V3(13.5, -40, 9.5);
    var BASE_C = [V3(-50.8, 71.3, 119), V3(-24, 34, 96), V3(3, -4, 62), V3(11, -24, 34), V3(16, -31, 25)];
    var BASE_T = [V3(0, 6, 0), V3(3, -10, 6), V3(9, -26, 8), V3(12.8, -36.5, 9.2), V3(13.2, -38.5, 9.4)];
    var PULL = [0.45, 0.35, 0.3, 0.6, 0.95];
    var DROP = [16, 8, 2, 0, 0];
    function poses(k) {
      var tp = BASE_T.map(function (p, i) { return p.clone().add(V3(0, -k * DROP[i], 0)); });
      var cp = BASE_C.map(function (p, i) { return tp[i].clone().add(p.clone().sub(BASE_T[i]).multiplyScalar(1 + k * PULL[i])); });
      return { C: new T.CatmullRomCurve3(cp), T: new T.CatmullRomCurve3(tp) };
    }
    /* keep the flight path and the final line of sight clear */
    var clear = [];
    [poses(0), poses(1)].forEach(function (ps) { for (var s = 0; s <= 30; s++) clear.push(ps.C.getPoint(0.4 + 0.6 * s / 30)); });
    var eyeFar = poses(1).C.getPoint(1);
    var aim = BASE_T[4];
    var axis = aim.clone().sub(eyeFar);
    var axisLen = axis.length();
    function pathGap(p) { var m = 1e9; for (var i = 0; i < clear.length; i++) m = Math.min(m, p.distanceTo(clear[i])); return m; }
    function sightGap(p) {
      var t = p.clone().sub(eyeFar).dot(axis) / (axisLen * axisLen);
      if (t < 0 || t > 0.92) return 1e9;
      return p.distanceTo(eyeFar.clone().addScaledVector(axis, t)) - (1.8 + 0.18 * t * axisLen);
    }
    function blocks(curve, pad) {
      for (var s = 0; s <= 30; s++) { var q = curve.getPoint(s / 30); if (pathGap(q) < pad + 1 || sightGap(q) < pad * 0.3) return true; }
      return false;
    }

    /* roots: the target root reaches TIP; the others wander down with a
     * gravitropic pull and stay out of the camera's way */
    var parts = [];
    var target = new T.CatmullRomCurve3([V3(1.2, -1.5, 0.6), V3(3.6, -9, 2.4), V3(6.6, -17.5, 4.2), V3(9.2, -25.5, 6.6), V3(11.6, -33, 8.2), TIP.clone()]);
    parts.push(taperTube(target, 64, 8, 0.62, 0.18));
    function lateralsFor(curve, isTarget) {
      var nLat = 4 + ((R() * 4) | 0);
      for (var j = 0; j < nLat; j++) {
        var t0 = 0.18 + R() * (isTarget ? 0.4 : 0.62);
        var p0 = curve.getPointAt(t0);
        var side = V3(R() - 0.5, 0, R() - 0.5).normalize().addScaledVector(curve.getTangentAt(t0), 0.3);
        side.y -= 0.35 + R() * 0.5;
        side.normalize();
        var len = 5 + R() * 12;
        var p1 = p0.clone().addScaledVector(side, len * 0.5).add(V3((R() - 0.5) * 2, -R() * 2, (R() - 0.5) * 2));
        var p2 = p0.clone().addScaledVector(side, len);
        p2.x = NK.clamp(p2.x, -BX + 2, BX - 2);
        p2.z = NK.clamp(p2.z, -BZ + 2, BZ - 2);
        var lat = new T.CatmullRomCurve3([p0, p1, p2]);
        if (blocks(lat, 4)) continue;
        parts.push(taperTube(lat, 18, 5, 0.24, 0.05));
      }
    }
    lateralsFor(target, true);
    for (var i = 1; i < 9; i++) {
      var curve = null;
      for (var tries = 0; !curve && tries < 10; tries++) {
        var a = i / 9 * Math.PI * 2 + R() * 0.4 + tries * 0.63;
        var out = V3(Math.cos(a), 0, Math.sin(a) * 0.9);
        var p = V3(Math.cos(a) * 0.8, -1.5 - R(), Math.sin(a) * 0.8);
        var pts = [p.clone()];
        var d = out.clone().multiplyScalar(0.55 + R() * 0.35).add(V3(0, -1, 0)).normalize();
        var seg = (34 + R() * 26) / 6;
        for (var k = 1; k <= 6; k++) {
          d.add(V3((R() - 0.5) * 0.5, -0.12 - R() * 0.2, (R() - 0.5) * 0.5)).normalize();
          p = p.clone().addScaledVector(d, seg);
          p.x = NK.clamp(p.x, -BX + 2, BX - 2);
          p.z = NK.clamp(p.z, -BZ + 2, BZ - 2);
          p.y = Math.max(p.y, -BY + 3);
          pts.push(p);
        }
        curve = new T.CatmullRomCurve3(pts);
        if (blocks(curve, 6)) curve = null;
      }
      if (!curve) continue;
      parts.push(taperTube(curve, 56, 7, 0.5, 0.1));
      lateralsFor(curve, false);
    }
    scene.add(new T.Mesh(merge(parts), new T.MeshStandardMaterial({ color: 0xd8c29a, roughness: 0.65, emissive: 0x0b0704 })));
    /* root hairs grow in the maturation zone, behind the tip */
    var hairs = [];
    for (k = 0; k < 220; k++) {
      var tt = 0.55 + R() * 0.33;
      var hp = target.getPointAt(tt);
      var hd = V3(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
      var hl = 0.6 + R() * 0.9;
      hairs.push(hp.x, hp.y, hp.z, hp.x + hd.x * hl, hp.y + hd.y * hl, hp.z + hd.z * hl);
    }
    var hg = new T.BufferGeometry();
    hg.setAttribute('position', new T.Float32BufferAttribute(hairs, 3));
    scene.add(new T.LineSegments(hg, new T.LineBasicMaterial({ color: 0xf1e2c4, transparent: true, opacity: 0.5 })));
    var cap = new T.Mesh(new T.SphereGeometry(0.21, 14, 10), new T.MeshStandardMaterial({ color: 0xefdcbc, emissive: 0x140e07 }));
    cap.position.copy(TIP);
    scene.add(cap);
    var exud = new T.Sprite(new T.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.1 }));
    exud.position.copy(TIP);
    exud.scale.set(7, 7, 1);
    scene.add(exud);

    /* J2s spread across the final frame around the tip, heads toward it */
    var fwd = aim.clone().sub(BASE_C[4]).normalize();
    var right = fwd.clone().cross(UP).normalize();
    var up2 = right.clone().cross(fwd).normalize();
    var homes = [];
    for (i = 0; i < 6; i++) {
      var ang = (i + 0.3) / 6 * Math.PI * 2 + (R() - 0.5) * 0.5;
      var rad = 2.8 + R() * 2.8;
      homes.push(TIP.clone().addScaledVector(right, Math.cos(ang) * rad * 1.3).addScaledVector(up2, Math.sin(ang) * rad * 0.85).addScaledVector(fwd, (R() - 0.5) * 3));
    }
    var nemGeo = wormGeometry(4.4, 0.18);
    var nems = homes.map(function (h) {
      var m = new T.Mesh(nemGeo, new T.ShaderMaterial({
        uniforms: { uTime: U.uTime, uPhase: { value: R() * 6 }, uSpeed: { value: 3 + R() * 2.5 }, uAmp: { value: 0.24 }, uLen: { value: 4.4 }, uColor: { value: new T.Color(0.96, 0.8, 0.62) } },
        vertexShader: VERT_NEM, fragmentShader: FRAG_NEM, transparent: true
      }));
      var dir = TIP.clone().sub(h).normalize().applyAxisAngle(up2, (R() - 0.5) * 0.7).normalize();
      m.position.copy(h);
      m.quaternion.setFromUnitVectors(V3(1, 0, 0), dir);
      m.userData = { home: h, dir: dir, ph: R() * 6, q: m.quaternion.clone() };
      scene.add(m);
      return m;
    });

    var agg = new T.InstancedMesh(clodGeometry(), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }), 440);
    var m4 = new T.Matrix4();
    var q4 = new T.Quaternion();
    var cc = new T.Color();
    var n = 0;
    for (tries = 0; tries < 8000 && n < 440; tries++) {
      var pp = V3((R() * 2 - 1) * (BX - 2), -2 - R() * (BY - 4), (R() * 2 - 1) * (BZ - 1));
      var r = 0.6 + Math.pow(R(), 2.2) * 2.8;
      if (pathGap(pp) < r + 4.5 || sightGap(pp) < r || pp.distanceTo(TIP) < r + 3) continue;
      if (homes.some(function (h) { return h.distanceTo(pp) < r + 2.4; })) continue;
      q4.setFromEuler(new T.Euler(R() * 6, R() * 6, R() * 6));
      m4.compose(pp, q4, V3(r, r * (0.7 + R() * 0.3), r * (0.8 + R() * 0.3)));
      agg.setMatrixAt(n, m4);
      agg.setColorAt(n, cc.set(pick(['#5a4232', '#6b4f3d', '#4a3527', '#7a5e48', '#3f2d22', '#866a53'])));
      n++;
    }
    agg.count = n;
    scene.add(agg);
    var dust = [];
    for (i = 0; i < 1200; i++) dust.push((R() * 2 - 1) * BX, -R() * BY, (R() * 2 - 1) * BZ);
    var dg = new T.BufferGeometry();
    dg.setAttribute('position', new T.Float32BufferAttribute(dust, 3));
    scene.add(new T.Points(dg, new T.PointsMaterial({ color: 0x8a6d57, size: 0.22, transparent: true, opacity: 0.4, depthWrite: false })));
    /* ascarosides: faint cyan trails left behind each J2 */
    var sp = [];
    var sph = [];
    nems.forEach(function (m) {
      var u = m.userData;
      for (var k2 = 0; k2 < 14; k2++) {
        var back = u.home.clone().addScaledVector(u.dir, -(1.2 + R() * 4.5));
        var jit = V3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(0.3 + R() * 0.9);
        sp.push(back.x + jit.x, back.y + jit.y, back.z + jit.z);
        sph.push(R());
      }
    });
    var sg = new T.BufferGeometry();
    sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    sg.setAttribute('aPh', new T.Float32BufferAttribute(sph, 1));
    var sigU = { uTime: U.uTime, uPx: { value: 800 }, uCol: { value: new T.Color(0x5ff0d6) } };
    var sig = new T.Points(sg, new T.ShaderMaterial({ uniforms: sigU, vertexShader: VERT_SIG, fragmentShader: FRAG_SIG, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    sig.frustumCulled = false;
    scene.add(sig);

    var path = poses(0);
    var P0 = path.C.getPoint(0);
    var Q0 = path.T.getPoint(0);
    var tgt = new T.Vector3();
    var wob = new T.Quaternion();
    return {
      scene: scene, cam: cam, focus: V3(0, 0, 0),
      fit: function (a) {
        cam.fov = a < 1 ? 52 : 40;
        path = poses(a < 1 ? NK.clamp((1 - a) / 0.55, 0, 1) : 0);
        /* the portrait close-up sits further back, so the J2s grow to stay legible */
        nems.forEach(function (m) { m.scale.setScalar(a < 1 ? 1.5 : 1); });
        P0 = path.C.getPoint(0);
        Q0 = path.T.getPoint(0);
        sigU.uPx.value = H * DPR / (2 * Math.tan(cam.fov * Math.PI / 360));
      },
      update: function (t, time) {
        var e = ease(t);
        if (t < 0) { cam.position.copy(P0).addScaledVector(P0.clone().sub(Q0), -t * 1.2); tgt.copy(Q0); }
        else { path.C.getPoint(e, cam.position); path.T.getPoint(e, tgt); }
        cam.position.x += Math.sin(time * 0.5) * 0.25 * (1 - e * 0.8);
        cam.lookAt(tgt);
        cam.updateProjectionMatrix();
        var d = cam.position.distanceTo(tgt);
        scene.fog.near = d * 1.15;
        scene.fog.far = d * 4.2 + 60;
        lamp.position.copy(cam.position);
        lamp.target.position.copy(tgt);
        nems.forEach(function (m) {
          var u = m.userData;
          m.position.copy(u.home).addScaledVector(u.dir, 0.5 + Math.sin(time * 0.32 + u.ph) * 0.9);
          m.position.addScaledVector(up2, Math.sin(time * 0.5 + u.ph * 2) * 0.25);
          wob.setFromAxisAngle(up2, Math.sin(time * 0.45 + u.ph) * 0.12);
          m.quaternion.copy(wob).multiply(u.q);
        });
      }
    };
  }

  /* ---------------- portal compositing ---------------- */
  var CU = { tA: { value: null }, tB: { value: null }, uC: { value: new T.Vector2(0.5, 0.5) }, uR: { value: 0 }, uAsp: { value: 1 }, uF: { value: 0.05 } };
  var comp = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    uniforms: CU, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tA; uniform sampler2D tB; uniform vec2 uC; uniform float uR; uniform float uAsp; uniform float uF;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec2 d = vUv - uC; d.x *= uAsp;',
      '  float r = length(d);',
      '  float m = 1.0 - smoothstep(uR - uF, uR, r);',
      '  vec3 a = texture2D(tA, vUv).rgb;',
      '  float k = 1.0 - 0.07 * smoothstep(uR * 0.55, uR, r);',
      '  vec3 b = texture2D(tB, uC + (vUv - uC) * k).rgb;',
      '  float rim = exp(-pow((r - uR + uF * 0.5) / (uF * 0.4), 2.0)) * step(0.0001, uR);',
      '  vec3 col = mix(a, b, m);',
      '  col = mix(col, col * 0.72, (1.0 - m) * smoothstep(0.0, 0.35, uR));',
      '  col += vec3(1.0, 0.83, 0.42) * rim * 0.36;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  }));
  comp.frustumCulled = false;
  var compScene = new T.Scene();
  compScene.add(comp);
  var compCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var rtA = null;
  var rtB = null;
  function ensureRT() {
    if (rtA) return;
    var o = { minFilter: T.LinearFilter, magFilter: T.LinearFilter };
    if (GL2) o.samples = 4;
    rtA = new T.WebGLRenderTarget(Math.round(W * DPR), Math.round(H * DPR), o);
    rtB = new T.WebGLRenderTarget(Math.round(W * DPR), Math.round(H * DPR), o);
  }

  /* ---------------- pager-driven flight and the frame loop ---------------- */
  var LV = null;
  function resize() {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    LV.forEach(function (l) { l.cam.aspect = W / H; l.fit(W / H); l.cam.updateProjectionMatrix(); });
    FR = freeRect();
    if (LV[0].layout) LV[0].layout(W, H, FR);
    CU.uAsp.value = W / H;
    if (rtA) { rtA.setSize(Math.round(W * DPR), Math.round(H * DPR)); rtB.setSize(Math.round(W * DPR), Math.round(H * DPR)); }
  }
  /* the map is framed in the free area right of the legend (above it on narrow screens) */
  var FR = null;
  function freeRect() {
    var navH = 76;
    if (!panelEl || !panelEl.offsetWidth) return { x0: W * 0.08, x1: W * 0.92, y0: navH + 20, y1: H - 40 };
    var sr = stage.getBoundingClientRect(), pr = panelEl.getBoundingClientRect();
    if (W >= 860) return { x0: pr.right - sr.left + 36, x1: W - 70, y0: navH + 18, y1: H - 60 };
    return { x0: 12, x1: W - 12, y0: navH + 16, y1: Math.max(navH + 170, pr.top - sr.top - 14) };
  }
  var pointer = { x: -1, y: -1, inside: false, tap: false };
  function ptr(e) { var r = stage.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.inside = true; }
  stage.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') ptr(e); }, { passive: true });
  stage.addEventListener('pointerleave', function () { pointer.inside = false; stage.style.cursor = ''; NK.chinaUI.hideTip(); });
  stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') { ptr(e); pointer.tap = true; } }, { passive: true });
  var lastPick = 0;
  var chinaShown = true;
  function chinaPhase(time, merge) {
    var L0 = LV[0];
    var ops = L0.layerOp || [0, 0, 0];
    L0.markers.forEach(function (mk) {
      if (!mk.el) return;
      var on = ops[mk.layer] > 0.6 && merge < 0.3;
      mk.el.style.opacity = on ? '1' : '0';
      if (!on) return;
      tmp.copy(mk.pos);
      if (L0.layerY) tmp.y += L0.layerY[mk.layer] || 0;
      tmp.project(L0.cam);
      mk.el.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * W).toFixed(0) + 'px,' + ((-tmp.y * 0.5 + 0.5) * H).toFixed(0) + 'px) translate(-50%,-100%)';
    });
    var CUI = NK.chinaUI;
    if (merge > 0.04 || !pointer.inside || time - lastPick < 0.06) return;
    lastPick = time;
    if (FR && W >= 860 && pointer.x < FR.x0 - 30) { CUI.hideTip(); stage.style.cursor = ''; return; }
    var hit = L0.pick(pointer.x, pointer.y);
    if (hit) { CUI.showTip(CUI.recordHtml(hit.layer, hit.code), pointer.x, pointer.y); stage.style.cursor = 'help'; }
    else { stage.style.cursor = ''; if (!pointer.tap) CUI.hideTip(); }
    pointer.tap = false;
  }
  function phase(q) {
    var p;
    if (q < 0.3) return { a: 0, ta: NK.clamp((q - 0.05) / 0.25, 0, 1) };
    if (q < 0.38) { p = (q - 0.3) / 0.08; return { a: 0, ta: 1 + p * 0.25, b: 1, tb: -0.15 * (1 - p), p: p }; }
    if (q < 0.6) return { a: 1, ta: (q - 0.38) / 0.22 };
    if (q < 0.68) { p = (q - 0.6) / 0.08; return { a: 1, ta: 1 + p * 0.2, b: 2, tb: -0.12 * (1 - p), p: p }; }
    return { a: 2, ta: NK.clamp((q - 0.68) / 0.22, 0, 1) };
  }
  /* stops (as in the v6 list): 0 the China map · 1 high above to the field, stop · 2 field to the roots, the question stays */
  /* 0 the three layers apart · 1–3 one layer in focus · 4 layers close, fly to the field · 5 the roots and the question */
  var STATES = !NK.chinaLayered ? [{ ex: 0, fo: -1, merge: 0, q: 0, qo: 0 }, { ex: 0, fo: -1, merge: 1, q: 0.38, qo: 0 }, { ex: 0, fo: -1, merge: 1, q: 0.9, qo: 1 }] : [
    { ex: 1, fo: -1, merge: 0, q: 0, qo: 0 }, { ex: 1, fo: 0, merge: 0, q: 0, qo: 0 }, { ex: 1, fo: 1, merge: 0, q: 0, qo: 0 }, { ex: 1, fo: 2, merge: 0, q: 0, qo: 0 },
    { ex: 0, fo: -1, merge: 1, q: 0.38, qo: 0 }, { ex: 0, fo: -1, merge: 1, q: 0.9, qo: 1 }];
  var Z = { ex: 0, fo: -1, merge: 0, q: 0, qo: 0 };
  var KEYS = ['ex', 'fo', 'merge', 'q', 'qo'];
  function plan(a, b, fwd) {
    var groups = [['ex', 'fo'], ['merge'], ['q']], W = { ex: 1, merge: 0.7, q: 2.2 }, ph = [], tot = 0, t = 0, win = {};
    groups.forEach(function (g) { if (g.some(function (key) { return Math.abs(a[key] - b[key]) > 1e-6; })) { ph.push(g); tot += W[g[0]]; } });
    if (!fwd) ph.reverse();
    ph.forEach(function (g) { var w = W[g[0]] / tot; g.forEach(function (key) { win[key] = [Math.max(0, t - 0.05), Math.min(1, t + w)]; }); t += w; });
    win.qo = b.qo > a.qo ? [0.8, 1] : [0, 0.25];
    return win;
  }
  function copyZ() { var o = {}; KEYS.forEach(function (key) { o[key] = Z[key]; }); return o; }
  var tw = null;
  var arrTw = null;
  NK.chinaHandoff = function () {
    tw = null; arrTw = null; Z.ex = 0; Z.fo = -1; Z.merge = 0; Z.q = 0; Z.qo = 0; NK.chinaArr = 0; NK.chinaEx = 0; NK.chinaFo = -1;
    stage.style.setProperty('--arrive', '0');
    sec.classList.add('is-handoff', 'is-pre');
    if (LV) { try { frame(performance.now() / 1000, 0.016); } catch (e) {} }
    if (!hLoop) hLoop = NK.loop(frame);
    requestAnimationFrame(function () { requestAnimationFrame(function () { sec.classList.add('is-show'); }); });
  };
  NK.chinaArrive = function (ms) {
    if (hLoop) { hLoop(); hLoop = null; }
    sec.classList.remove('is-handoff', 'is-show');
    arrTw = { t0: performance.now(), dur: ms };
    /* after the tilt starts, the plates slide apart */
    var a0 = copyZ();
    tw = { a: a0, b: STATES[0], t0: performance.now() + 450, dur: 2300, win: plan(a0, STATES[0], true) };
  };
  NK.chinaDriver(function (i, ms, dir) {
    var s = STATES[Math.max(0, Math.min(STATES.length - 1, i))];
    if (!ms) { tw = null; KEYS.forEach(function (key) { Z[key] = s[key]; }); return true; }
    var a0 = copyZ();
    tw = { a: a0, b: s, t0: performance.now(), dur: ms, win: plan(a0, s, dir !== -1) };
    return true;
  });
  var tmp = new T.Vector3();
  var lastFrameT = -1, hLoop = null;
  function frame(time, dt) {
    if (!LV || time === lastFrameT) return;
    lastFrameT = time;
    if (arrTw) { var ka = NK.clamp((performance.now() - arrTw.t0) / arrTw.dur, 0, 1); NK.chinaArr = ka; if (ka >= 1) arrTw = null; }
    stage.style.setProperty('--arrive', NK.easeInOut(NK.chinaArr == null ? 1 : NK.chinaArr).toFixed(3));
    NK.chinaEx = Z.ex; NK.chinaFo = Z.fo;
    if (tw) {
      /* the map settles into the flight first, then the flight runs (in reverse the other way round); the question comes in at the end */
      var k = NK.clamp((performance.now() - tw.t0) / tw.dur, 0, 1), a = tw.a, b = tw.b, win = tw.win;
      var seg = function (sp) { return sp && sp[1] > sp[0] ? NK.easeInOut(NK.clamp((k - sp[0]) / (sp[1] - sp[0]), 0, 1)) : 1; };
      KEYS.forEach(function (key) { Z[key] = NK.lerp(a[key], b[key], seg(win[key] || [0, 1])); });
      if (k >= 1) tw = null;
    }
    U.uTime.value = NK.reduced ? 0 : time;
    var merge = Z.merge, qCur = Z.q;
    stage.style.setProperty('--merge', merge.toFixed(3));
    stage.style.setProperty('--qo', Z.qo.toFixed(3));
    sec.classList.toggle('is-q', Z.qo > 0.5);
    if (merge < 1) {
      LV[0].update(0, time, dt, merge, 1);
      renderer.setRenderTarget(null);
      renderer.render(LV[0].scene, LV[0].cam);
      chinaPhase(time, merge);
      if (labelEl) {
        var hs = NK.smooth(0.6, 1, merge);
        labelEl.style.opacity = hs.toFixed(3);
        if (hs > 0) {
          tmp.copy(LV[0].label).project(LV[0].cam);
          labelEl.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * W).toFixed(0) + 'px,' + ((-tmp.y * 0.5 + 0.5) * H).toFixed(0) + 'px) translate(-50%,-120%)';
        }
      }
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === 0); li.classList.remove('is-done'); });
      chinaShown = true;
      return;
    }
    if (chinaShown) {
      chinaShown = false;
      LV[0].markers.forEach(function (mk) { if (mk.el) mk.el.style.opacity = '0'; });
      NK.chinaUI.hideTip();
    }
    var ph = phase(qCur);
    var A = LV[ph.a];
    A.update(ph.ta, time, dt, 1, 1);
    if (ph.b !== undefined) {
      var B = LV[ph.b];
      B.update(ph.tb, time, dt, 1, 1);
      ensureRT();
      renderer.setRenderTarget(rtA);
      renderer.render(A.scene, A.cam);
      renderer.setRenderTarget(rtB);
      renderer.render(B.scene, B.cam);
      renderer.setRenderTarget(null);
      tmp.copy(A.focus).project(A.cam);
      var cx = tmp.x * 0.5 + 0.5;
      var cy = tmp.y * 0.5 + 0.5;
      var asp = W / H;
      var far = 0;
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (c) { far = Math.max(far, Math.sqrt(Math.pow((c[0] - cx) * asp, 2) + Math.pow(c[1] - cy, 2))); });
      CU.tA.value = rtA.texture;
      CU.tB.value = rtB.texture;
      CU.uC.value.set(cx, cy);
      CU.uF.value = 0.03 + 0.025 * ph.p;
      CU.uR.value = Math.pow(ph.p, 1.6) * (far + CU.uF.value) * 1.02;
      renderer.render(compScene, compCam);
    } else {
      renderer.setRenderTarget(null);
      renderer.render(A.scene, A.cam);
    }
    if (labelEl) {
      var show = ph.a === 0 && ph.b === undefined ? 1 - NK.smooth(0.3, 0.55, ph.ta) : 0;
      labelEl.style.opacity = show.toFixed(3);
      if (show > 0) {
        tmp.copy(LV[0].label).project(LV[0].cam);
        labelEl.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * W).toFixed(0) + 'px,' + ((-tmp.y * 0.5 + 0.5) * H).toFixed(0) + 'px) translate(-50%,-120%)';
      }
    }
    var idx = qCur < 0.34 ? 0 : qCur < 0.64 ? 1 : qCur < 0.83 ? 2 : 3;
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i === idx); li.classList.toggle('is-done', i < idx); });
  }

  /* ---------------- deferred build ----------------
   * One slice per idle callback after page load keeps the main thread free
   * while the opening scene is in use; the last slices pre-compile shaders
   * and upload the big texture so the first portal does not stall. If the
   * reader comes within 1.5 screens first, the remaining build runs at once. */
  var built = [];
  var failed = false;
  var qi = 0;
  var jobs = [
    function () { fieldTex = makeFieldTex(); glowTex = makeGlowTex(); },
    function () { built[0] = buildMap(); },
    function () { maizeGeo = maizeGeometry(); maizeMat = swayMaterial(); built[1] = buildField(); },
    function () { built[2] = buildSoil(); },
    function () {
      LV = built;
      resize();
      /* where China sits on screen at the start of this page: the world map zooms to exactly this frame */
      NK.chinaFrame = function () {
        var L0 = LV[0], b = L0.bbox, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, keep = NK.chinaArr;
        NK.chinaArr = 0;
        L0.update(0, performance.now() / 1000, 0.016, 0, 1);
        L0.cam.updateMatrixWorld();
        NK.chinaArr = keep;
        var C = geo.china;
        function anchor(lon, lat) {
          var x = (lon - C.west) * C.upd + C.ox, y = (C.north - lat) * C.upd + C.oy;
          tmp.set((x - 300) / 10, 0.81, (y - 250) / 10).project(L0.cam);
          return { lon: lon, lat: lat, x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H };
        }
        var A = anchor(73.5, 53.6), B = anchor(134.8, 18.2);
        [[b.x0, b.z0], [b.x1, b.z0], [b.x0, b.z1], [b.x1, b.z1]].forEach(function (p) {
          tmp.set(p[0], 0.8, p[1]).project(L0.cam);
          var sx = (tmp.x * 0.5 + 0.5) * W, sy = (-tmp.y * 0.5 + 0.5) * H;
          x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
        });
        return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, a: A, b: B };
      };
      var rT = 0;
      window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(resize, 150); });
      NK.loopWhileVisible(stage, frame, '80px 0px');
    },
    function () { renderer.initTexture(fieldTex); renderer.compile(LV[0].scene, LV[0].cam); },
    function () { renderer.compile(LV[1].scene, LV[1].cam); },
    function () { renderer.compile(LV[2].scene, LV[2].cam); renderer.compile(compScene, compCam); }
  ];
  var READY = 5;
  function fail(err) {
    failed = true;
    if (window.console) console.error(err);
    sec.classList.remove('is-3d');
    NK.zoom3d = false;
    try { renderer.dispose(); renderer.forceContextLoss(); } catch (e2) { /* context already gone */ }
    if (NK.china2d) NK.china2d();

  }
  function run(upto) {
    while (qi < upto && !failed) {
      try { jobs[qi++](); } catch (err) { fail(err); }
    }
  }
  var idle = window.requestIdleCallback ? function (f) { window.requestIdleCallback(f, { timeout: 1500 }); } : function (f) { setTimeout(f, 40); };
  function pump() { run(qi + 1); if (qi < jobs.length && !failed) idle(pump); }
  function begin() { setTimeout(function () { idle(pump); }, 300); }
  if (document.readyState === 'complete') begin(); else window.addEventListener('load', begin);
  if ('IntersectionObserver' in window) {
    var nearIO = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { nearIO.disconnect(); run(READY); }
    }, { rootMargin: '60% 0px' });
    nearIO.observe(sec);
  } else run(READY);
}());
