/* NKU homepage v6 — 01 opening + 02 flashlight in the soil.
 * Surface (V3): one cream headline, the mouse halo, and the words scatter on
 * the first scroll. Underground (3D v3): the painted three.js soil section,
 * lit by the V3 flashlight. The beam comes from the flashlight in the
 * detective's hand; outside the circle of light the soil is black. The line
 * at the bottom says what the light is on. Scrolling on only works once the
 * nematode has been found ("Guide my light" finds it). Everything here is an
 * illustration: no signal on this screen is measured data. */
(function () {
  'use strict';
  var H0 = window.NKUH, NK = window.NK;
  var root = document.querySelector('[data-op]');
  if (!H0 || !NK || !root) return;
  var stage = root.querySelector('.op__stage');
  var canvas = root.querySelector('[data-op-gl]');
  var fxCv = root.querySelector('[data-op-fx]');
  var hero = root.querySelector('[data-op-hero]');
  var hudLine = root.querySelector('[data-op-line]');
  var labelsEl = root.querySelector('[data-op-labels]');
  var guideBtn = root.querySelector('[data-op-guide]');
  var focusEl = root.querySelector('[data-op-focus]');
  var T = window.THREE;

  var COPY = {
    scan: NK.coarse ? 'Tap the soil to move your light.' : 'Move your light through the soil.',
    soil: 'Only soil here. Look for a flicker of cyan.',
    pebble: 'A pebble. Keep looking.',
    root: 'Healthy roots, reaching down for water.',
    sick: 'This root looks swollen and knotted.',
    ghost: 'A free-living nematode, just passing through.',
    detected: 'Signal detected!',
    trail: 'The fluorescent signals seem to form a trail.',
    hint: 'Look for the flickering cyan glow.',
    roots: 'The plant\u2019s roots are under severe attack!',
    found: 'Nematodes are behind it!',
    blocked: 'Not yet. Follow the signals to what is hiding here.',
    stuck: 'Stuck? Press \u201cGuide my light\u201d.'
  };
  var lineKey = '', lineAt = -10;
  function setLine(key, cls, force) {
    if (!hudLine) return;
    var text = COPY[key] || key;
    if (!force && hudLine.textContent === text) return;
    lineKey = key;
    hudLine.classList.remove('is-swap');
    void hudLine.offsetWidth;
    hudLine.textContent = text;
    hudLine.className = 'op__line is-swap' + (cls ? ' ' + cls : '');
  }

  /* descent: 0 = surface hero, 1 = in the soil (driven by the pager) */
  var D = { from: 0, to: 0, t0: 0, dur: 1, v: 0 };
  function descentAt(now) { var k = NK.clamp((now - D.t0) / D.dur, 0, 1); return NK.lerp(D.from, D.to, NK.easeInOut(k)); }
  function descendTo(v, ms) { D = { from: D.v, to: v, t0: performance.now(), dur: Math.max(1, ms), v: D.v }; }
  function heroStyle(d) {
    var hp = NK.smooth(0, 0.5, d);
    hero.style.opacity = String(1 - hp);
    hero.style.transform = 'translateY(' + (-hp * 90).toFixed(1) + 'px) scale(' + (1 + hp * 0.08).toFixed(3) + ')';
    hero.style.filter = hp > 0.01 ? 'blur(' + (hp * 10).toFixed(1) + 'px)' : 'none';
    hero.style.letterSpacing = (hp * 0.12).toFixed(3) + 'em';
    root.classList.toggle('is-under', d > 0.9);
  }

  var S = {
    detected: 0, roots: false, found: false, exploring: false, everExplored: false,
    tExplore: 0, lastDetect: 0, hinted: false, foundT: 0, foundAt: 0, userMoved: false, blockedN: 0
  };
  var guide = null;
  var light = { x: 0, y: 0, tx: 0, ty: 0 };
  var ptr = { x: 0, y: 0, seen: false };
  var pointerN = { x: 0.5, y: 0.5 };

  function nudge() {
    if (!guideBtn) return;
    guideBtn.classList.remove('is-nudge'); void guideBtn.offsetWidth; guideBtn.classList.add('is-nudge');
  }
  function registerScene(api) {
    H0.scene('opening', {
      steps: 1, tall: 2.6, noCue: false,
      set: function (i) { var v = i ? 1 : 0; D = { from: v, to: v, t0: 0, dur: 1, v: v }; },
      step: function (i) {
        if (i === 1) { descendTo(1, 1650); return 1700; }
        descendTo(0, 1300); return 1300;
      },
      ff: function () { D.t0 = -1e9; },
      canLeave: function () { return S.found && performance.now() - S.foundAt > 900; },
      blocked: function () {
        if (!S.exploring) return;
        S.blockedN++;
        setLine(S.blockedN > 1 ? 'stuck' : 'blocked', 'is-alert', true);
        lineAt = api.now() + 1.6; shownAt = api.now();
        nudge();
      }
    });
  }

  /* ---------------- no WebGL: keep the story moving ---------------- */
  function fallback() {
    root.classList.add('is-fallback');
    if (canvas) canvas.style.display = 'none';
    var raf = 0;
    function tick() {
      raf = 0;
      var d = D.v = descentAt(performance.now());
      heroStyle(d);
      if (d > 0.96 && !S.found) { S.found = true; S.foundAt = performance.now(); root.classList.add('is-exploring', 'is-found'); setLine('found', 'is-found'); }
      if (D.v !== D.to || D.t0 > performance.now() - D.dur) raf = requestAnimationFrame(tick);
    }
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      stage.style.setProperty('--fx', (e.clientX - r.left) + 'px'); stage.style.setProperty('--fy', (e.clientY - r.top) + 'px');
    });
    registerScene({ now: function () { return performance.now() / 1000; } });
    var orig = descendTo;
    descendTo = function (v, ms) { orig(v, ms); if (!raf) raf = requestAnimationFrame(tick); };
    tick();
  }

  if (!T || !NK.webgl()) { fallback(); return; }
  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (err) { fallback(); return; }
  renderer.setClearColor(0x050208, 1);
  var DPR = Math.min(window.devicePixelRatio || 1, NK.coarse ? 1.5 : 1.8);
  renderer.setPixelRatio(DPR);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(32, 1, 0.5, 400);
  var HALF_TAN = Math.tan(16 * Math.PI / 180);
  var W = 1, H = 1;
  var L = null, built = null, nemTex = null, look = null;
  var fctx = null;

  var U = {
    uL: { value: new T.Vector2(0, -10) },
    uR: { value: 2.6 },
    uOn: { value: 0.8 },
    uAmb: { value: 1 },
    uLC: { value: new T.Color(1.0, 0.93, 0.82) },
    uTime: { value: 0 },
    uGall: { value: 0 },
    uPx: { value: 800 },
    uHint: { value: 0 }
  };

  function computeLayout() {
    var a = W / H;
    var portrait = a < 0.95;
    var Hx = portrait ? Math.max(17.2, 10.6 / a) : 17.2;
    var Wx = Hx * a;
    var yH = Hx * 0.21;
    var yX = -(Hx * 0.5 + 3.4);
    var PW = Wx + 5;
    var top = yH + Hx * 0.5 + 1.4;
    var bottom = yX - Hx * 0.5 - 1.4;
    var PH = top - bottom;
    var maxTex = Math.min(renderer.capabilities.maxTextureSize || 4096, NK.coarse ? 1600 : 2600);
    var texW = Math.round(maxTex * Math.min(1, PW / PH >= 1 ? 1 : PW / PH));
    var texH = Math.round(texW * PH / PW);
    if (texH > maxTex) { texH = maxTex; texW = Math.round(texH * PW / PH); }
    var trail = portrait
      ? [[0.22, 0.2], [0.46, 0.25], [0.68, 0.32], [0.52, 0.4], [0.3, 0.47], [0.44, 0.55], [0.6, 0.6]]
      : [[0.13, 0.25], [0.21, 0.37], [0.3, 0.29], [0.38, 0.42], [0.46, 0.51], [0.54, 0.41], [0.61, 0.49], [0.66, 0.58]];
    var tgt = portrait ? [0.62, 0.7] : [0.735, 0.64];
    function w(n) { return { x: -Wx / 2 + n[0] * Wx, y: yX + Hx / 2 - n[1] * Hx }; }
    var nodes = trail.map(w);
    var target = w(tgt);
    var plants = portrait
      ? [{ x: -0.6, h: 6.6, lean: 0.5, s: 1.05 }, { x: 3.4, h: 4.4, lean: -0.4, s: 0.85 }, { x: -4.4, h: 3.0, lean: 0.3, s: 0.7 }]
      : [{ x: -2.3, h: 7.3, lean: 0.6, s: 1.15 }, { x: 6.2, h: 5.1, lean: -0.5, s: 0.95 }, { x: -9.6, h: 3.4, lean: 0.35, s: 0.72 }, { x: 11.6, h: 2.9, lean: -0.3, s: 0.62 }];
    plants.forEach(function (p) { p.mound = 0.34 * p.s; p.mw = 1.6 + p.s; });
    return {
      a: a, portrait: portrait, Hx: Hx, Wx: Wx, yH: yH, yX: yX, PW: PW, PH: PH, top: top, bottom: bottom,
      camZ: Hx / (2 * HALF_TAN), texW: texW, texH: texH, nodes: nodes, target: target, plants: plants,
      nem: { x: target.x + 0.95, y: target.y + 0.18 }
    };
  }

  function surf(x) {
    var v = 0.22 * Math.sin(0.43 * x + 0.6) + 0.15 * Math.sin(1.07 * x + 2.1) + 0.06 * Math.sin(2.9 * x + 1.3);
    for (var i = 0; i < L.plants.length; i++) {
      var p = L.plants[i];
      v += p.mound * Math.exp(-Math.pow((x - p.x) / p.mw, 2));
    }
    return v;
  }

  /* ---------------- procedural painting (albedo + data) ---------------- */
  function paint() {
    var cA = document.createElement('canvas');
    var cD = document.createElement('canvas');
    cA.width = cD.width = L.texW;
    cA.height = cD.height = L.texH;
    var a = cA.getContext('2d');
    var d = cD.getContext('2d');
    var k = L.texW / L.PW;
    var R = NK.rng(20260923);
    function X(x) { return (x + L.PW / 2) * k; }
    function Y(y) { return (L.top - y) * k; }
    function rgb(h, amb, flag) { return 'rgb(' + Math.round(h * 255) + ',' + Math.round(amb * 255) + ',' + (flag || 0) + ')'; }
    var x0 = -L.PW / 2;
    var x1 = L.PW / 2;

    /* sky */
    var g = a.createLinearGradient(0, 0, 0, Y(0));
    g.addColorStop(0, '#0f0816');
    g.addColorStop(0.55, '#1a0f24');
    g.addColorStop(1, '#2d1b39');
    a.fillStyle = g;
    a.fillRect(0, 0, L.texW, L.texH);
    var moon = a.createRadialGradient(X(L.portrait ? 3 : 7.5), Y(L.top - 1.5), 0, X(L.portrait ? 3 : 7.5), Y(L.top - 1.5), 9 * k);
    moon.addColorStop(0, 'rgba(160,130,190,0.16)');
    moon.addColorStop(1, 'rgba(160,130,190,0)');
    a.fillStyle = moon;
    a.fillRect(0, 0, L.texW, Y(0));
    d.fillStyle = rgb(0, 1, 255);
    d.fillRect(0, 0, L.texW, L.texH);

    /* soil body */
    function soilPath(ctx) {
      ctx.beginPath();
      ctx.moveTo(X(x0), Y(surf(x0)));
      for (var x = x0; x <= x1 + 0.1; x += 0.08) ctx.lineTo(X(x), Y(surf(x)));
      ctx.lineTo(X(x1), L.texH + 2);
      ctx.lineTo(X(x0), L.texH + 2);
      ctx.closePath();
    }
    g = a.createLinearGradient(0, Y(0.6), 0, L.texH);
    var depthStop = function (y) { return NK.clamp((Y(y) - Y(0.6)) / (L.texH - Y(0.6)), 0, 1); };
    g.addColorStop(0, '#3f2a22');
    g.addColorStop(depthStop(-2.4), '#5a3c2e');
    g.addColorStop(depthStop(-3.6), '#7b5a44');
    g.addColorStop(depthStop(-7.2), '#96775d');
    g.addColorStop(1, '#a6876b');
    soilPath(a);
    a.fillStyle = g;
    a.fill();
    soilPath(d);
    d.fillStyle = rgb(0.34, 0.04, 0);
    d.fill();

    function blob(ctx, cx, cy, r, n, jit, rot) {
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var ang = rot + i / n * Math.PI * 2;
        var rr = r * (1 - jit + ((i * 7919 + Math.floor(cx * 131)) % 97) / 97 * jit * 2);
        var px = X(cx) + Math.cos(ang) * rr * k;
        var py = Y(cy) + Math.sin(ang) * rr * k * 0.82;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    /* topsoil crumbs */
    var crumbCols = ['#2f1e19', '#4a3127', '#6a4a37', '#7e5b43', '#3a261e'];
    for (var i = 0; i < 2600; i++) {
      var cx = x0 + R() * L.PW;
      var cy = surf(cx) - Math.pow(R(), 0.8) * 3.5;
      var r = 0.025 + R() * R() * 0.12;
      blob(a, cx, cy, r, 6, 0.3, R() * 6);
      a.fillStyle = crumbCols[(R() * crumbCols.length) | 0];
      a.globalAlpha = 0.85;
      a.fill();
      blob(d, cx, cy, r, 6, 0.3, 0);
      d.fillStyle = rgb(0.45 + R() * 0.3, 0.05, 0);
      d.fill();
    }
    a.globalAlpha = 1;

    /* striated band */
    for (i = 0; i < 34; i++) {
      var yb = -3.4 - R() * 3.8;
      var amp = 0.05 + R() * 0.12;
      var fr = 0.3 + R() * 0.6;
      var ph = R() * 6;
      a.beginPath();
      d.beginPath();
      for (var x = x0; x <= x1; x += 0.2) {
        var yy = yb + Math.sin(x * fr + ph) * amp + Math.sin(x * 2.3 + ph * 2) * 0.03;
        if (x === x0) { a.moveTo(X(x), Y(yy)); d.moveTo(X(x), Y(yy)); } else { a.lineTo(X(x), Y(yy)); d.lineTo(X(x), Y(yy)); }
      }
      a.strokeStyle = R() < 0.5 ? 'rgba(58,38,28,0.42)' : 'rgba(196,164,128,0.26)';
      a.lineWidth = (0.025 + R() * 0.06) * k;
      a.stroke();
      d.strokeStyle = rgb(0.46, 0.05, 0);
      d.lineWidth = a.lineWidth;
      d.stroke();
    }
    for (i = 0; i < 1800; i++) {
      var sx = x0 + R() * L.PW;
      var syy = -3.2 - R() * 4.4;
      a.fillStyle = R() < 0.5 ? 'rgba(52,34,26,0.5)' : 'rgba(210,182,146,0.35)';
      a.beginPath();
      a.arc(X(sx), Y(syy), (0.012 + R() * 0.03) * k, 0, 6.283);
      a.fill();
    }

    /* pebbles: denser and larger with depth (woodcut strata, A07) */
    var pebCols = ['#8b6f58', '#76604e', '#b59a7f', '#c8b095', '#6a5241', '#9c7f63', '#d5c0a4'];
    var span = -6.4 - L.bottom;
    var nPeb = Math.round(L.PW * span * 2.1);
    for (i = 0; i < nPeb; i++) {
      var px = x0 + R() * L.PW;
      var py = -6.4 - Math.pow(R(), 0.85) * span;
      var dn = NK.clamp((-py - 6.4) / span, 0, 1);
      var pr = 0.07 + Math.pow(R(), 2.4) * (0.3 + 0.62 * dn);
      var rot = R() * 6.283;
      var n = 7 + ((R() * 4) | 0);
      blob(a, px, py, pr + 0.03, n, 0.18, rot);
      a.fillStyle = 'rgba(46,30,22,0.55)';
      a.fill();
      blob(a, px, py, pr, n, 0.18, rot);
      a.fillStyle = pebCols[(R() * pebCols.length) | 0];
      a.fill();
      a.save();
      a.clip();
      a.fillStyle = 'rgba(40,26,20,0.35)';
      for (var s = 0; s < 4 + pr * 26; s++) {
        a.beginPath();
        a.arc(X(px + (R() - 0.5) * pr * 1.8), Y(py + (R() - 0.5) * pr * 1.5), (0.01 + R() * 0.025) * k, 0, 6.283);
        a.fill();
      }
      a.strokeStyle = 'rgba(255,238,214,0.2)';
      a.lineWidth = pr * 0.16 * k;
      a.beginPath();
      a.arc(X(px - pr * 0.12), Y(py + pr * 0.12), pr * 0.8 * k, Math.PI * 1.05, Math.PI * 1.55);
      a.stroke();
      a.restore();
      var rg = d.createRadialGradient(X(px - pr * 0.2), Y(py + pr * 0.2), 0, X(px), Y(py), pr * k * 1.05);
      rg.addColorStop(0, rgb(0.95, 0.07, 0));
      rg.addColorStop(1, rgb(0.5, 0.06, 0));
      blob(d, px, py, pr, n, 0.18, rot);
      d.fillStyle = rg;
      d.fill();
    }

    /* roots: smooth tapered ribbons. Colour: dark rim, lit body and a
     * highlight toward the light. Height (red channel of the data canvas):
     * a rounded profile, so the flashlight shades each root as a cylinder.
     * Laterals are painted before their parent so the parent overlaps its
     * branch points; fine roots carry root hairs near the tip. */
    var rootBudget = 520;
    var LIGHT = [-0.45, 0.89];
    function ribbon(ctx, pts, w0, w1, scale, shift) {
      var n = pts.length;
      var lf = [];
      var rt = [];
      for (var i = 0; i < n; i++) {
        var pa = pts[Math.max(0, i - 1)];
        var pb = pts[Math.min(n - 1, i + 1)];
        var tx = pb[0] - pa[0];
        var ty = pb[1] - pa[1];
        var tl = Math.sqrt(tx * tx + ty * ty) || 1;
        var nx = -ty / tl;
        var ny = tx / tl;
        var hw = (w0 + (w1 - w0) * Math.pow(i / (n - 1), 0.75)) * 0.5;
        var sh = (nx * LIGHT[0] + ny * LIGHT[1]) * shift * hw;
        var cx = pts[i][0] + nx * sh;
        var cy = pts[i][1] + ny * sh;
        lf.push([cx + nx * hw * scale, cy + ny * hw * scale]);
        rt.push([cx - nx * hw * scale, cy - ny * hw * scale]);
      }
      var e = pts[n - 1];
      var q = pts[n - 2];
      var el = Math.sqrt((e[0] - q[0]) * (e[0] - q[0]) + (e[1] - q[1]) * (e[1] - q[1])) || 1;
      var tip = [e[0] + (e[0] - q[0]) / el * w1 * 0.6 * scale, e[1] + (e[1] - q[1]) / el * w1 * 0.6 * scale];
      ctx.beginPath();
      ctx.moveTo(X(lf[0][0]), Y(lf[0][1]));
      for (i = 1; i < n; i++) ctx.lineTo(X(lf[i][0]), Y(lf[i][1]));
      ctx.lineTo(X(tip[0]), Y(tip[1]));
      for (i = n - 1; i >= 0; i--) ctx.lineTo(X(rt[i][0]), Y(rt[i][1]));
      ctx.closePath();
    }
    function paintRoot(pts, w0, w1, amb, hairs, sick) {
      ribbon(a, pts, w0, w1, 1, 0);
      a.fillStyle = sick ? '#7c4a40' : '#6a4e3e';
      a.fill();
      ribbon(a, pts, w0, w1, 0.76, 0.12);
      a.fillStyle = sick ? '#e2bb9f' : '#d8c09a';
      a.fill();
      ribbon(a, pts, w0, w1, 0.26, 0.5);
      a.fillStyle = 'rgba(252,242,222,0.78)';
      a.fill();
      ribbon(d, pts, w0, w1, 1, 0);
      d.fillStyle = rgb(0.62, amb, 0);
      d.fill();
      ribbon(d, pts, w0, w1, 0.7, 0.1);
      d.fillStyle = rgb(0.77, amb, 0);
      d.fill();
      ribbon(d, pts, w0, w1, 0.36, 0.25);
      d.fillStyle = rgb(0.9, amb, 0);
      d.fill();
      if (!hairs) return;
      a.strokeStyle = 'rgba(240,226,198,0.42)';
      a.lineWidth = Math.max(0.6, 0.011 * k);
      a.lineCap = 'round';
      for (var i = Math.floor(pts.length * 0.55); i < pts.length - 2; i += 2) {
        var p0 = pts[i];
        var ang = Math.atan2(pts[i + 1][1] - p0[1], pts[i + 1][0] - p0[0]);
        for (var sd = -1; sd <= 1; sd += 2) {
          var aa = ang + sd * (1.1 + R() * 0.7);
          var hl = 0.05 + R() * 0.09;
          a.beginPath();
          a.moveTo(X(p0[0]), Y(p0[1]));
          a.lineTo(X(p0[0] + Math.cos(aa) * hl), Y(p0[1] + Math.sin(aa) * hl));
          a.stroke();
        }
      }
    }
    function rootPath(xs, ys, ang, len) {
      var pts = [[xs, ys]];
      var x = xs;
      var y = ys;
      var bend = 0;
      var n = Math.max(6, Math.round(len / 0.12));
      for (var st = 0; st < n; st++) {
        bend = bend * 0.86 + (R() - 0.5) * 0.11;
        ang += bend;
        ang += (-Math.PI / 2 - ang) * 0.05;
        x += Math.cos(ang) * 0.12;
        y += Math.sin(ang) * 0.12;
        if (y < L.bottom + 0.15) break;
        pts.push([x, y]);
      }
      return pts;
    }
    function growRoot(xs, ys, ang, len, wid, depth, amb) {
      if (rootBudget-- <= 0) return;
      var pts = rootPath(xs, ys, ang, len);
      if (pts.length < 4) return;
      var n = pts.length;
      if (depth < 3) {
        for (var j = 5 + ((R() * 5) | 0); j < n - 4; j += 6 + depth * 5 + ((R() * 8) | 0)) {
          var u = j / (n - 1);
          var wl = wid * (1 - 0.7 * u) * (0.42 + R() * 0.18);
          if (wl < 0.01) continue;
          var dir = Math.atan2(pts[j + 1][1] - pts[j][1], pts[j + 1][0] - pts[j][0]);
          growRoot(pts[j][0], pts[j][1], dir + (R() < 0.5 ? -1 : 1) * (0.7 + R() * 0.6), len * (1 - u) * (0.3 + R() * 0.3), wl, depth + 1, amb * 0.9);
        }
      }
      paintRoot(pts, wid, Math.max(0.008, wid * 0.2), amb, depth >= 1, false);
    }
    L.plants.forEach(function (p) {
      var by = surf(p.x) - 0.1;
      growRoot(p.x, by, -Math.PI / 2 - 0.12, 6 + p.s * 5, 0.13 * p.s + 0.04, 0, 0.34);
      growRoot(p.x + 0.1, by, -Math.PI / 2 + 0.5, 3 + p.s * 2, 0.08 * p.s + 0.03, 1, 0.3);
      growRoot(p.x - 0.1, by, -Math.PI / 2 - 0.6, 3 + p.s * 2, 0.08 * p.s + 0.03, 1, 0.3);
    });
    for (i = 0; i < Math.round(L.PW / 4.2); i++) {
      var rx = x0 + 1.5 + i * 4.2 + (R() - 0.5) * 1.6;
      if (Math.abs(rx - L.target.x) < 2.2) continue;
      growRoot(rx, surf(rx) - 0.2, -Math.PI / 2 + (R() - 0.5) * 0.4, 7 + R() * 9, 0.09 + R() * 0.06, 0, 0.28);
    }

    /* the damaged root: thicker and reddened, galls around the target */
    var t0 = L.target;
    var ctrl = [
      [t0.x + 1.3, surf(t0.x + 1.3) - 0.1], [t0.x + 1.1, -4.2], [t0.x + 0.5, t0.y + 3.2],
      [t0.x, t0.y], [t0.x - 0.55, t0.y - 2.4], [t0.x - 0.25, t0.y - 4.6], [t0.x - 0.6, t0.y - 7]
    ];
    function cr(p0, p1, p2, p3, t) {
      var t2 = t * t;
      var t3 = t2 * t;
      return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
    }
    var pts = [];
    for (i = 0; i < ctrl.length - 1; i++) {
      var q0 = ctrl[Math.max(0, i - 1)];
      var q1 = ctrl[i];
      var q2 = ctrl[i + 1];
      var q3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      for (var st = 0; st < 12; st++) {
        var tt = st / 12;
        pts.push([cr(q0[0], q1[0], q2[0], q3[0], tt), cr(q0[1], q1[1], q2[1], q3[1], tt)]);
      }
    }
    rootBudget += 24;
    for (i = 10; i < pts.length - 6; i += 5) growRoot(pts[i][0], pts[i][1], -Math.PI / 2 + (i % 10 ? 0.9 : -0.9), 1.6 + R() * 1.4, 0.045, 2, 0.12);
    paintRoot(pts, 0.3, 0.14, 0.14, false, true);
    var ti = 0;
    var best = 1e9;
    pts.forEach(function (p, j) { var dd = Math.hypot(p[0] - t0.x, p[1] - t0.y); if (dd < best) { best = dd; ti = j; } });
    [-13, -7, -2, 3, 8, 14].forEach(function (off, j) {
      var p = pts[NK.clamp(ti + off, 0, pts.length - 1)];
      var gr = 0.2 + (j % 3) * 0.06;
      var gx = p[0] + (j % 2 ? 0.08 : -0.08);
      var gg = a.createRadialGradient(X(gx - gr * 0.35), Y(p[1] + gr * 0.35), gr * k * 0.08, X(gx), Y(p[1]), gr * k * 1.05);
      gg.addColorStop(0, '#f7d6c2');
      gg.addColorStop(0.55, '#dfa58c');
      gg.addColorStop(1, '#a4625a');
      blob(a, gx, p[1], gr, 14, 0.08, j);
      a.fillStyle = gg;
      a.fill();
      a.strokeStyle = 'rgba(112,58,50,0.55)';
      a.lineWidth = 0.02 * k;
      a.stroke();
      a.fillStyle = 'rgba(255,240,228,0.55)';
      a.beginPath();
      a.arc(X(gx - gr * 0.32), Y(p[1] + gr * 0.34), gr * 0.26 * k, 0, 6.283);
      a.fill();
      var hg = d.createRadialGradient(X(gx - gr * 0.2), Y(p[1] + gr * 0.2), 0, X(gx), Y(p[1]), gr * k);
      hg.addColorStop(0, rgb(0.98, 0.1, 128));
      hg.addColorStop(1, rgb(0.72, 0.1, 128));
      blob(d, gx, p[1], gr, 14, 0.08, j);
      d.fillStyle = hg;
      d.fill();
    });
    L.rootPts = pts;

    /* the burrow the nematode lies in: a dark, soft-edged tunnel in the soil */
    (function () {
      var bx = X(L.nem.x), by = Y(L.nem.y), bw = 1.2 * k, bh = 0.36 * k;
      a.save(); a.translate(bx, by); a.rotate(0.12); a.scale(1, bh / bw);
      var bg2 = a.createRadialGradient(0, 0, bw * 0.15, 0, 0, bw);
      bg2.addColorStop(0, 'rgba(22,13,9,0.95)'); bg2.addColorStop(0.6, 'rgba(34,21,15,0.72)'); bg2.addColorStop(1, 'rgba(40,26,20,0)');
      a.fillStyle = bg2; a.beginPath(); a.arc(0, 0, bw, 0, 6.283); a.fill(); a.restore();
      d.save(); d.translate(bx, by); d.rotate(0.12); d.scale(1, bh / bw); d.fillStyle = rgb(0.16, 0.03, 0); d.beginPath(); d.arc(0, 0, bw * 0.78, 0, 6.283); d.fill(); d.restore();
    }());
    /* surface clods: catch the moonlight in the hero view */
    for (x = x0; x < x1; x += 0.32 + R() * 0.3) {
      var cy2 = surf(x) - 0.05 - R() * 0.25;
      var cr2 = 0.12 + R() * 0.2;
      blob(a, x, cy2, cr2, 9, 0.25, R() * 6);
      a.fillStyle = R() < 0.5 ? '#3b2821' : '#46302a';
      a.fill();
      a.strokeStyle = 'rgba(150,120,140,0.45)';
      a.lineWidth = 0.03 * k;
      a.beginPath();
      a.arc(X(x), Y(cy2), cr2 * k * 0.92, Math.PI * 1.15, Math.PI * 1.85);
      a.stroke();
      blob(d, x, cy2, cr2, 9, 0.25, 0);
      d.fillStyle = rgb(0.7, 0.34, 0);
      d.fill();
    }
    /* grass tufts */
    a.lineCap = 'round';
    for (x = x0; x < x1; x += 0.18 + R() * 0.4) {
      var sy = surf(x);
      for (var b = 0; b < 3; b++) {
        a.strokeStyle = R() < 0.5 ? '#4f5a3c' : '#66704c';
        a.lineWidth = 0.035 * k;
        a.beginPath();
        a.moveTo(X(x), Y(sy));
        a.quadraticCurveTo(X(x + (R() - 0.5) * 0.2), Y(sy + 0.18), X(x + (R() - 0.5) * 0.35), Y(sy + 0.22 + R() * 0.25));
        a.stroke();
      }
    }

    /* seedlings above ground (painted final colours; emissive in the shader) */
    function leaf(bx, by, ang, len, wid) {
      var tx = bx + Math.cos(ang) * len;
      var ty = by + Math.sin(ang) * len;
      var nx = -Math.sin(ang) * wid;
      var ny = Math.cos(ang) * wid;
      var mx = (bx + tx) / 2;
      var my = (by + ty) / 2;
      var lg = a.createLinearGradient(X(bx), Y(by), X(tx), Y(ty));
      lg.addColorStop(0, '#3a4630');
      lg.addColorStop(0.6, '#5e6d49');
      lg.addColorStop(1, '#7f8d62');
      a.fillStyle = lg;
      a.beginPath();
      a.moveTo(X(bx), Y(by));
      a.quadraticCurveTo(X(mx + nx), Y(my + ny), X(tx), Y(ty));
      a.quadraticCurveTo(X(mx - nx * 0.8), Y(my - ny * 0.8), X(bx), Y(by));
      a.fill();
      a.strokeStyle = 'rgba(200,210,160,0.32)';
      a.lineWidth = 0.025 * k;
      a.beginPath();
      a.moveTo(X(bx), Y(by));
      a.quadraticCurveTo(X(mx + nx * 0.1), Y(my + ny * 0.1), X(tx), Y(ty));
      a.stroke();
      a.strokeStyle = 'rgba(214,224,176,0.28)';
      a.lineWidth = 0.02 * k;
      a.beginPath();
      a.moveTo(X(bx + nx * 0.2), Y(by + ny * 0.2));
      a.quadraticCurveTo(X(mx + nx), Y(my + ny), X(tx), Y(ty));
      a.stroke();
    }
    L.plants.forEach(function (p) {
      var bx = p.x;
      var by = surf(p.x) - 0.05;
      var tx = p.x + p.lean;
      var ty = by + p.h;
      a.strokeStyle = '#4e5a3a';
      a.lineWidth = 0.08 * p.s * k;
      a.beginPath();
      a.moveTo(X(bx), Y(by));
      a.quadraticCurveTo(X(bx + p.lean * 0.15), Y(by + p.h * 0.55), X(tx), Y(ty));
      a.stroke();
      var nLeaves = Math.round(4 + p.s * 4);
      for (var j = 0; j < nLeaves; j++) {
        var t = 0.22 + 0.74 * j / nLeaves;
        var sxp = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * (bx + p.lean * 0.15) + t * t * tx;
        var syp = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * (by + p.h * 0.55) + t * t * ty;
        var side = j % 2 ? 1 : -1;
        var ang = Math.PI / 2 - side * (0.62 + 0.5 * (1 - t) + (R() - 0.5) * 0.25);
        var len = (0.7 + 1.35 * (1 - t) + R() * 0.3) * p.s * 1.25;
        leaf(sxp, syp, ang, len, len * 0.3);
      }
      leaf(tx, ty, Math.PI / 2 + (R() - 0.5) * 0.3, 0.75 * p.s, 0.2 * p.s);
    });

    /* fine grain */
    try {
      var img = a.getImageData(0, 0, L.texW, L.texH);
      var px8 = img.data;
      for (i = 0; i < px8.length; i += 4) {
        var nn = (R() - 0.5) * 16;
        px8[i] += nn; px8[i + 1] += nn; px8[i + 2] += nn;
      }
      a.putImageData(img, 0, 0);
    } catch (e) { /* ignore */ }
    return { albedo: cA, data: cD };
  }



  /* ---------------- shaders ---------------- */
  var VERT_WORLD = 'varying vec2 vUv; varying vec2 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xy; gl_Position = projectionMatrix * viewMatrix * w; }';
  var FRAG_SOIL = [
    'precision highp float;',
    'uniform sampler2D uA; uniform sampler2D uD; uniform vec2 uTex;',
    'uniform vec2 uL; uniform float uR; uniform float uOn; uniform vec3 uLC; uniform float uTime; uniform float uGall; uniform float uAmb;',
    'varying vec2 vUv; varying vec2 vW;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
    'void main(){',
    '  vec3 alb = texture2D(uA, vUv).rgb; vec3 dat = texture2D(uD, vUv).rgb;',
    '  if (dat.b > 0.9) { gl_FragColor = vec4(alb * (0.92 + 0.08 * sin(uTime * 0.4)) * mix(0.08, 1.0, uAmb), 1.0); return; }',
    '  float hl = texture2D(uD, vUv - vec2(uTex.x, 0.0)).r; float hr = texture2D(uD, vUv + vec2(uTex.x, 0.0)).r;',
    '  float hb = texture2D(uD, vUv - vec2(0.0, uTex.y)).r; float ht = texture2D(uD, vUv + vec2(0.0, uTex.y)).r;',
    '  vec3 n = normalize(vec3((hl - hr) * 3.4, (hb - ht) * 3.4, 1.0));',
    '  vec2 dl = uL - vW; float d = length(dl);',
    '  vec3 ld = normalize(vec3(dl, 2.4));',
    '  float diff = max(dot(n, ld), 0.0);',
    '  float spot = 1.0 - smoothstep(uR * 0.74, uR, d);',
    '  float spill = exp(-pow(d / (uR * 2.1), 2.0));',
    '  float lamp = (spot * 0.95 + spill * 0.2 * uAmb) * uOn;',
    '  float ao = 0.58 + 0.42 * smoothstep(0.25, 0.7, dat.r);',
    '  vec3 lit = alb * uLC * (0.32 + 1.02 * diff) * lamp * ao;',
    '  float surf = smoothstep(-5.0, 0.6, vW.y);',
    '  vec3 tint = mix(vec3(0.36, 0.25, 0.45), vec3(0.5, 0.45, 0.43), dat.g);',
    '  vec3 amb = alb * tint * (0.3 + 1.3 * dat.g) * (1.0 + surf * 1.35) * uAmb;',
    '  vec3 col = amb + lit;',
    '  float gall = step(0.35, dat.b) * step(dat.b, 0.65);',
    '  col += vec3(1.0, 0.3, 0.36) * gall * uGall * (0.32 + 0.22 * sin(uTime * 3.4)) * (0.35 + lamp);',
    '  float rim = smoothstep(uR * 1.03, uR * 0.98, d) * smoothstep(uR * 0.9, uR * 0.985, d);',
    '  col += uLC * rim * 0.07 * uOn;',
    '  col += (hash(vUv * vec2(1733.0, 927.0) + fract(uTime * 0.37)) - 0.5) * 0.02 * max(uAmb, lamp);',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var VERT_PTS = [
    'attribute float aSize; attribute float aPhase; attribute float aState; attribute float aT0;',
    'uniform float uTime; uniform float uPx; uniform float uHint; uniform float uFlick; uniform vec2 uL; uniform float uR;',
    'varying float vA; varying float vPulse; varying float vState;',
    'void main(){',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;',
    '  float age = uTime - aT0;',
    '  vec4 wp = modelMatrix * vec4(position, 1.0); float litP = 1.0 - smoothstep(uR * 0.45, uR * 1.02, length(wp.xy - uL));',
    '  float flick = 0.55 + 0.45 * sin(uTime * (2.1 + aPhase * 2.3) + aPhase * 6.283);',
    '  flick *= 0.72 + 0.28 * sin(uTime * 8.7 + aPhase * 17.0);',
    '  flick = mix(0.85, flick, uFlick);',
    '  float a = 0.0; vPulse = 0.0;',
    '  if (aState > 0.5 && aState < 1.5) a = flick * clamp(age / 0.7, 0.0, 1.0) * (1.0 + uHint * 0.6) * (0.5 + 0.5 * litP);',
    '  else if (aState > 1.5 && aState < 2.5) { a = 0.92 + 0.08 * sin(uTime * 2.0 + aPhase * 6.0); vPulse = clamp(1.0 - age / 1.2, 0.0, 1.0); }',
    '  else if (aState > 2.5) a = 0.34 * clamp(0.5 + 0.5 * sin(uTime * (0.6 + aPhase) + aPhase * 30.0), 0.0, 1.0) * flick * litP;',
    '  vA = a; vState = aState;',
    '  gl_PointSize = aSize * uPx / -mv.z * (1.0 + vPulse * 2.2 + uHint * 0.5 * step(0.5, aState) * step(aState, 1.5));',
    '}'
  ].join('\n');
  var FRAG_PTS = [
    'precision mediump float;',
    'uniform vec3 uCol; varying float vA; varying float vPulse; varying float vState;',
    'void main(){',
    '  vec2 c = gl_PointCoord - 0.5; float r = length(c) * 2.0;',
    '  if (r > 1.0) discard;',
    '  float core = smoothstep(0.34, 0.0, r);',
    '  float glow = exp(-r * r * 4.2) * 0.55;',
    '  float ring = vPulse * smoothstep(0.1, 0.0, abs(r - (1.0 - vPulse) * 0.85 - 0.1));',
    '  float a = (core + glow) * vA + ring * 0.9;',
    '  gl_FragColor = vec4(uCol * a, a);',
    '}'
  ].join('\n');

  var VERT_GHOST = [
    'uniform float uTime; uniform float uSpeed; uniform float uPhase; uniform float uAmp; uniform float uLen; uniform float uWid;',
    'varying vec2 vUv; varying vec2 vW;',
    'void main(){',
    '  vUv = uv; float u = uv.x;',
    '  float wave = sin(u * 8.5 - uTime * uSpeed + uPhase) * uAmp * (0.35 + 0.65 * u);',
    '  float width = uWid * pow(max(sin(3.14159 * clamp(u * 0.94 + 0.03, 0.0, 1.0)), 0.0), 0.6);',
    '  vec3 p = vec3((u - 0.5) * uLen, wave + (uv.y - 0.5) * width, 0.0);',
    '  vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xy;',
    '  gl_Position = projectionMatrix * viewMatrix * w;',
    '}'
  ].join('\n');
  var FRAG_GHOST = [
    'precision mediump float;',
    'uniform vec2 uL; uniform float uR; uniform float uOn; uniform vec3 uCol; uniform float uAlpha; uniform float uAmb;',
    'varying vec2 vUv; varying vec2 vW;',
    'void main(){',
    '  float e = 1.0 - abs(vUv.y - 0.5) * 2.0;',
    '  float body = smoothstep(0.0, 0.4, e);',
    '  float gut = smoothstep(0.7, 1.0, e) * 0.3;',
    '  float lit = (1.0 - smoothstep(uR * 0.55, uR * 1.05, length(uL - vW))) * uOn;',
    '  float a = (uAlpha * uAmb + lit * 0.32) * body;',
    '  gl_FragColor = vec4(uCol * (0.78 + gut + lit * 0.35), a);',
    '}'
  ].join('\n');

  var VERT_NEM = [
    'uniform float uTime; uniform float uWig;',
    'varying vec2 vUv; varying vec2 vW;',
    'void main(){',
    '  vUv = uv; vec3 p = position;',
    '  p.y += sin(uv.x * 6.5 - uTime * 6.0) * uWig * (1.1 - uv.x * 0.5);',
    '  vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xy;',
    '  gl_Position = projectionMatrix * viewMatrix * w;',
    '}'
  ].join('\n');
  var FRAG_NEM = [
    'precision mediump float;',
    'uniform sampler2D uMap; uniform vec2 uL; uniform float uR; uniform float uOn; uniform float uShow; uniform vec3 uLC;',
    'varying vec2 vUv; varying vec2 vW;',
    'float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float nn(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1.0, 0.0)), f.x), mix(nh(i + vec2(0.0, 1.0)), nh(i + vec2(1.0, 1.0)), f.x), f.y); }',
    'void main(){',
    '  vec4 tx = texture2D(uMap, vUv);',
    '  float lit = (1.0 - smoothstep(uR * 0.62, uR * 1.02, length(uL - vW))) * uOn;',
    '  float cover = clamp(smoothstep(0.64, 0.72, nn(vW * 6.5)) * 0.95 + smoothstep(0.8, 0.86, nn(vW * 16.0 + 3.7)) * 0.8, 0.0, 1.0);',
    '  float edge = smoothstep(0.05, 0.7, tx.a);',
    '  vec3 body = tx.rgb * uLC * (0.5 + 0.55 * lit) * (0.5 + 0.5 * edge);',
    '  vec3 soil = vec3(0.32, 0.22, 0.16) * uLC * (0.3 + 0.9 * lit);',
    '  vec3 col = mix(body, soil, cover * 0.88);',
    '  float vis = max(lit, uShow * 0.08);',
    '  gl_FragColor = vec4(col * (0.3 + 0.7 * vis), tx.a * vis);',
    '}'
  ].join('\n');

  var VERT_DUST = [
    'attribute float aPhase; uniform float uTime; uniform float uPx; uniform vec2 uL; uniform float uR; uniform float uOn;',
    'varying float vA;',
    'void main(){',
    '  vec3 p = position;',
    '  p.x += sin(uTime * 0.23 + aPhase * 9.0) * 0.5; p.y += sin(uTime * 0.17 + aPhase * 5.0) * 0.4 + mod(uTime * 0.05 + aPhase * 3.0, 1.0) * 0.3;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;',
    '  float d = length(p.xy - uL);',
    '  vA = (1.0 - smoothstep(uR * 0.3, uR * 1.1, d)) * uOn * (0.35 + 0.65 * fract(aPhase * 7.1));',
    '  gl_PointSize = (0.05 + fract(aPhase * 13.0) * 0.07) * uPx / -mv.z;',
    '}'
  ].join('\n');
  var FRAG_DUST = 'precision mediump float; uniform vec3 uLC; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, r) * vA * 0.7; gl_FragColor = vec4(uLC * a, a); }';



  /* ---------------- build / rebuild ---------------- */
  function dispose() {
    if (!built) return;
    built.list.forEach(function (o) {
      scene.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    built.textures.forEach(function (t) { t.dispose(); });
    built = null;
  }

  function pointsMaterial(color, extra) {
    return new T.ShaderMaterial({
      uniforms: {
        uTime: U.uTime, uPx: U.uPx, uHint: extra && extra.hint ? U.uHint : { value: 0 },
        uFlick: { value: NK.reduced ? 0 : 1 }, uCol: { value: new T.Color(color) }, uL: U.uL, uR: U.uR
      },
      vertexShader: VERT_PTS, fragmentShader: FRAG_PTS,
      transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending
    });
  }

  function build() {
    dispose();
    L = computeLayout();
    var list = [];
    var textures = [];
    var painted = paint();
    lastPainted = painted.data;
    var tA = new T.CanvasTexture(painted.albedo);
    var tD = new T.CanvasTexture(painted.data);
    tA.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    tD.generateMipmaps = false;
    tD.minFilter = T.LinearFilter;
    textures.push(tA, tD);

    var soil = new T.Mesh(new T.PlaneGeometry(L.PW, L.PH), new T.ShaderMaterial({
      uniforms: {
        uA: { value: tA }, uD: { value: tD }, uTex: { value: new T.Vector2(1 / L.texW, 1 / L.texH) },
        uL: U.uL, uR: U.uR, uOn: U.uOn, uLC: U.uLC, uTime: U.uTime, uGall: U.uGall, uAmb: U.uAmb
      },
      vertexShader: VERT_WORLD, fragmentShader: FRAG_SOIL
    }));
    soil.position.set(0, (L.top + L.bottom) / 2, 0);
    scene.add(soil);
    list.push(soil);

    /* signal nodes: a main dot and two satellites each */
    var R = NK.rng(314);
    var pos = [];
    var size = [];
    var phase = [];
    var owner = [];
    L.nodes.forEach(function (n, i) {
      for (var j = 0; j < 3; j++) {
        var ox = j ? (R() - 0.5) * 0.9 : 0;
        var oy = j ? (R() - 0.5) * 0.7 : 0;
        pos.push(n.x + ox, n.y + oy, 0.05);
        size.push(j ? 0.34 + R() * 0.12 : 0.62);
        phase.push(R());
        owner.push(i);
      }
    });
    var gNodes = new T.BufferGeometry();
    gNodes.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    gNodes.setAttribute('aSize', new T.Float32BufferAttribute(size, 1));
    gNodes.setAttribute('aPhase', new T.Float32BufferAttribute(phase, 1));
    gNodes.setAttribute('aState', new T.Float32BufferAttribute(new Float32Array(owner.length), 1));
    gNodes.setAttribute('aT0', new T.Float32BufferAttribute(new Float32Array(owner.length), 1));
    var nodesPts = new T.Points(gNodes, pointsMaterial('#5ff0d6', { hint: true }));
    nodesPts.frustumCulled = false;
    nodesPts.renderOrder = 3;
    scene.add(nodesPts);
    list.push(nodesPts);

    /* trail dots between consecutive nodes */
    var tpos = [];
    var tseg = [];
    var tph = [];
    var chain = L.nodes.concat([L.target]);
    for (var i = 1; i < chain.length; i++) {
      var p0 = chain[i - 1];
      var p1 = chain[i];
      var len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      var steps = Math.max(2, Math.floor(len / 0.3));
      for (var s = 1; s < steps; s++) {
        var t = s / steps;
        var bend = Math.sin(t * Math.PI) * 0.35 * (i % 2 ? 1 : -1);
        var nx = -(p1.y - p0.y) / len;
        var ny = (p1.x - p0.x) / len;
        tpos.push(p0.x + (p1.x - p0.x) * t + nx * bend, p0.y + (p1.y - p0.y) * t + ny * bend, 0.04);
        tseg.push(i);
        tph.push(t);
      }
    }
    var gTrail = new T.BufferGeometry();
    gTrail.setAttribute('position', new T.Float32BufferAttribute(tpos, 3));
    gTrail.setAttribute('aSize', new T.Float32BufferAttribute(tseg.map(function () { return 0.2; }), 1));
    gTrail.setAttribute('aPhase', new T.Float32BufferAttribute(tph, 1));
    gTrail.setAttribute('aState', new T.Float32BufferAttribute(new Float32Array(tseg.length), 1));
    gTrail.setAttribute('aT0', new T.Float32BufferAttribute(new Float32Array(tseg.length), 1));
    var trailPts = new T.Points(gTrail, pointsMaterial('#7ff5e0'));
    trailPts.frustumCulled = false;
    trailPts.renderOrder = 2;
    scene.add(trailPts);
    list.push(trailPts);

    /* decoys: background chemistry that never leads anywhere */
    var dpos = [];
    var dsz = [];
    var dph = [];
    var tries = 0;
    while (dpos.length < 3 * 26 && tries++ < 800) {
      var dx = -L.Wx / 2 + R() * L.Wx;
      var dy = L.yX - L.Hx / 2 + R() * L.Hx;
      var far = chain.every(function (c) { return Math.hypot(c.x - dx, c.y - dy) > 2.2; });
      if (!far) continue;
      dpos.push(dx, dy, 0.03);
      dsz.push(0.28 + R() * 0.2);
      dph.push(R());
    }
    var gDec = new T.BufferGeometry();
    gDec.setAttribute('position', new T.Float32BufferAttribute(dpos, 3));
    gDec.setAttribute('aSize', new T.Float32BufferAttribute(dsz, 1));
    gDec.setAttribute('aPhase', new T.Float32BufferAttribute(dph, 1));
    gDec.setAttribute('aState', new T.Float32BufferAttribute(dsz.map(function () { return 3; }), 1));
    gDec.setAttribute('aT0', new T.Float32BufferAttribute(new Float32Array(dsz.length), 1));
    var decoys = new T.Points(gDec, pointsMaterial('#5ff0d6'));
    decoys.frustumCulled = false;
    scene.add(decoys);
    list.push(decoys);

    /* ghost nematodes: free-living neighbours drifting through the soil */
    var ghosts = [];
    for (i = 0; i < (L.portrait ? 5 : 7); i++) {
      var gm = new T.Mesh(new T.PlaneGeometry(1, 1, 36, 1), new T.ShaderMaterial({
        uniforms: {
          uTime: U.uTime, uL: U.uL, uR: U.uR, uOn: U.uOn, uAmb: U.uAmb,
          uSpeed: { value: 2 + R() * 2.5 }, uPhase: { value: R() * 6 }, uAmp: { value: 0.1 + R() * 0.1 },
          uLen: { value: 1.3 + R() * 1.2 }, uWid: { value: 0.1 + R() * 0.06 },
          uCol: { value: new T.Color(0.86, 0.82, 0.93) }, uAlpha: { value: 0.1 + R() * 0.06 }
        },
        vertexShader: VERT_GHOST, fragmentShader: FRAG_GHOST, transparent: true, depthWrite: false
      }));
      var home = { x: -L.Wx / 2 + (0.08 + R() * 0.84) * L.Wx, y: L.yX - L.Hx / 2 + (0.1 + R() * 0.8) * L.Hx };
      gm.userData = { hx: home.x, hy: home.y, rx: 1.2 + R() * 2.2, ry: 0.6 + R() * 1.2, s1: 0.05 + R() * 0.06, s2: 0.04 + R() * 0.05, ph: R() * 6, z: 0.4 + R() * 1.4 };
      gm.renderOrder = 1;
      scene.add(gm);
      list.push(gm);
      ghosts.push(gm);
    }

    /* the nematode (hidden until the light finds it) */
    var nemUniforms = { uTime: U.uTime, uL: U.uL, uR: U.uR, uOn: U.uOn, uWig: { value: 0.018 }, uShow: { value: S.found ? 1 : 0 }, uMap: { value: nemTex }, uLC: U.uLC };
    var nem = new T.Mesh(new T.PlaneGeometry(2.1, 2.1 * 180 / 320, 28, 1), new T.ShaderMaterial({
      uniforms: nemUniforms, vertexShader: VERT_NEM, fragmentShader: FRAG_NEM, transparent: true, depthWrite: false
    }));
    nem.position.set(L.nem.x, L.nem.y, 0.12);
    nem.scale.x = -1;
    nem.rotation.z = -0.12;
    nem.visible = !!nemTex;
    nem.renderOrder = 4;
    scene.add(nem);
    list.push(nem);

    /* dust in the beam */
    var dust = [];
    var dustPh = [];
    for (i = 0; i < 170; i++) {
      dust.push(-L.Wx / 2 + R() * L.Wx, L.yX - L.Hx / 2 + R() * L.Hx, 0.6 + R() * 4.5);
      dustPh.push(R());
    }
    var gDust = new T.BufferGeometry();
    gDust.setAttribute('position', new T.Float32BufferAttribute(dust, 3));
    gDust.setAttribute('aPhase', new T.Float32BufferAttribute(dustPh, 1));
    var dustPts = new T.Points(gDust, new T.ShaderMaterial({
      uniforms: { uTime: U.uTime, uPx: U.uPx, uL: U.uL, uR: U.uR, uOn: U.uOn, uLC: U.uLC },
      vertexShader: VERT_DUST, fragmentShader: FRAG_DUST, transparent: true, depthWrite: false, blending: T.AdditiveBlending
    }));
    dustPts.frustumCulled = false;
    scene.add(dustPts);
    list.push(dustPts);

    built = {
      list: list, textures: textures, nodes: nodesPts, trail: trailPts, trailSeg: tseg, owner: owner,
      ghosts: ghosts, nem: nem, nemU: nemUniforms, nodeState: L.nodes.map(function () { return 0; })
    };
    /* restore progress after a rebuild */
    for (i = 0; i < S.detected; i++) setNode(i, 2, -10);
    if (S.everExplored) {
      for (i = S.detected; i < Math.min(L.nodes.length, S.detected + 2); i++) setNode(i, 1, U.uTime.value);
      revealTrail(S.detected, -10);
    }
    if (S.found) { revealTrail(chain.length, -10); for (i = 0; i < L.nodes.length; i++) setNode(i, 2, -10); }
    if (!light.tx && !light.ty) { light.x = light.tx = L.nodes[0].x + 1.6; light.y = light.ty = L.nodes[0].y + 1.9; }
    buildMeter();
  }

  function setNode(i, state, t0) {
    if (!built || i < 0 || i >= built.nodeState.length) return;
    built.nodeState[i] = state;
    var st = built.nodes.geometry.getAttribute('aState');
    var at = built.nodes.geometry.getAttribute('aT0');
    for (var k = 0; k < built.owner.length; k++) {
      if (built.owner[k] === i) { st.array[k] = state; at.array[k] = t0; }
    }
    st.needsUpdate = true;
    at.needsUpdate = true;
  }
  function revealTrail(uptoSeg, t0) {
    if (!built) return;
    var st = built.trail.geometry.getAttribute('aState');
    var at = built.trail.geometry.getAttribute('aT0');
    var ph = built.trail.geometry.getAttribute('aPhase');
    for (var k = 0; k < built.trailSeg.length; k++) {
      if (built.trailSeg[k] <= uptoSeg && st.array[k] < 1) {
        st.array[k] = 1.2;
        at.array[k] = t0 + ph.array[k] * 0.5;
      }
    }
    st.needsUpdate = true;
    at.needsUpdate = true;
  }



  function buildMeter() {}

  /* a small copy of the data canvas, to tell what the light is on */
  function makeLookup(cD) {
    var s = 6, c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(cD.width / s)); c.height = Math.max(1, Math.round(cD.height / s));
    var g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(cD, 0, 0, c.width, c.height);
    try { look = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data, k: c.width / L.PW }; } catch (e) { look = null; }
  }
  function sample(x, y) {
    if (!look) return 'soil';
    var px = Math.round((x + L.PW / 2) * look.k), py = Math.round((L.top - y) * look.k);
    if (px < 0 || py < 0 || px >= look.w || py >= look.h) return 'soil';
    var i = (py * look.w + px) * 4, r = look.d[i], g = look.d[i + 1], b = look.d[i + 2];
    if (b > 100 && b < 160) return 'sick';
    if (g > 26 && r > 150) return g < 50 ? 'sick' : 'root';
    if (g >= 14 && g <= 20 && r > 120) return 'pebble';
    return 'soil';
  }

  /* ---------------- labels (screen space) ---------------- */
  var bigLabel = null;
  function showBig() {
    if (bigLabel || !labelsEl) return;
    bigLabel = document.createElement('p');
    bigLabel.className = 'op__label op__label--big';
    bigLabel.textContent = COPY.found;
    labelsEl.appendChild(bigLabel);
    requestAnimationFrame(function () { bigLabel.classList.add('is-on'); });
  }
  var tmpV = new T.Vector3();
  function toScreen(x, y) {
    tmpV.set(x, y, 0).project(camera);
    return { x: (tmpV.x * 0.5 + 0.5) * W, y: (-tmpV.y * 0.5 + 0.5) * H };
  }
  function toWorld(cx, cy) {
    var v = new T.Vector3(cx / W * 2 - 1, -(cy / H * 2 - 1), 0.5).unproject(camera);
    v.sub(camera.position).normalize();
    var t = -camera.position.z / v.z;
    return { x: camera.position.x + v.x * t, y: camera.position.y + v.y * t };
  }

  /* ---------------- search logic (3D v3) ---------------- */
  var clock = 0;
  function detect(i, t) {
    for (var j = 0; j <= i; j++) if (built.nodeState[j] < 2) setNode(j, 2, j === i ? t : t - 2);
    S.detected = Math.max(S.detected, i + 1);
    S.lastDetect = t;
    revealTrail(i, t);
    for (j = i + 1; j <= Math.min(L.nodes.length - 1, i + 2); j++) if (built.nodeState[j] === 0) setNode(j, 1, t);
    if (S.detected === L.nodes.length) revealTrail(L.nodes.length, t);
  }
  function onRoots(t) {
    if (S.roots) return;
    S.roots = true;
    for (var j = 0; j < L.nodes.length; j++) if (built.nodeState[j] === 0) setNode(j, 1, t);
  }
  function onFound(t) {
    if (S.found) return;
    S.found = true; S.foundT = t; S.foundAt = performance.now();
    if (!S.roots) onRoots(t);
    for (var j = 0; j < L.nodes.length; j++) setNode(j, 2, j === L.nodes.length - 1 ? t : t - 2);
    S.detected = L.nodes.length;
    revealTrail(L.nodes.length + 1, t);
    root.classList.add('is-found');
    setLine('found', 'is-found', true);
    setTimeout(showBig, 450);
    NK.state.found = true;
    if (window.NKUDetective && window.NKUDetective.lit) window.NKUDetective.lit(true);
    if (guideBtn) guideBtn.classList.remove('is-nudge');
    guide = null;
  }
  function startGuide() {
    if (!L || S.found) return;
    var pts = [{ x: light.x, y: light.y }];
    for (var i = S.detected; i < L.nodes.length; i++) pts.push(L.nodes[i]);
    pts.push(L.target, L.nem);
    guide = { pts: pts, seg: 0, t: 0 };
    S.userMoved = true;
    ptr.seen = false;
  }
  if (guideBtn) guideBtn.addEventListener('click', startGuide);

  /* ---------------- input ---------------- */
  function pointerTo(e) {
    var r = stage.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
    pointerN.x = ptr.x / r.width; pointerN.y = ptr.y / r.height;
    if (e.target && e.target.closest && e.target.closest('button, a')) return;
    ptr.seen = true; S.userMoved = true; guide = null;
  }
  stage.addEventListener('pointermove', pointerTo, { passive: true });
  stage.addEventListener('pointerdown', pointerTo, { passive: true });
  stage.addEventListener('pointerleave', function () { ptr.seen = false; });
  if (focusEl) {
    focusEl.addEventListener('keydown', function (e) {
      var step = 0.9, used = true;
      if (e.key === 'ArrowLeft') light.tx -= step;
      else if (e.key === 'ArrowRight') light.tx += step;
      else if (e.key === 'ArrowUp') light.ty += step;
      else if (e.key === 'ArrowDown') light.ty -= step;
      else if (e.key === 'Enter' || e.key === ' ') startGuide();
      else used = false;
      if (used) { e.preventDefault(); e.stopPropagation(); if (e.key !== 'Enter' && e.key !== ' ') guide = null; S.userMoved = true; ptr.seen = false; }
    });
  }

  /* ---------------- sizing ---------------- */
  var lastA = 0;
  function resize(force) {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    fctx = H0.fit(fxCv, W, H, 1.5);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    U.uPx.value = H * DPR / (2 * HALF_TAN);
    var a = W / H;
    if (force || !built || Math.abs(a - lastA) > 0.12 || (L && W > L.Wx / L.Hx * H * 1.2)) {
      lastA = a;
      if (!nemTex) loadNematode();
      build();
      makeLookupFromBuilt();
    }
  }
  var lastPainted = null;
  function makeLookupFromBuilt() { if (lastPainted) makeLookup(lastPainted); }
  function loadNematode() {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = 640; c.height = 360;
      c.getContext('2d').drawImage(img, 0, 0, 640, 360);
      nemTex = new T.CanvasTexture(c);
      if (built) { built.nemU.uMap.value = nemTex; built.nem.visible = true; }
    };
    img.src = NK.prefix + 'img/home/nematode-soil.svg';
  }
  var rT = 0;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { resize(false); }, 220); });

  /* ---------------- the V3 beam, dust and bloom (2D, over the soil) ---------------- */
  var dust = [];
  for (var di = 0; di < 70; di++) dust.push({ u: Math.random(), v: Math.random() * 2 - 1, s: 0.2 + Math.random() * 0.8, ph: Math.random() * 6 });
  function drawFx(t, ls, rad, d, warmK) {
    var c = fctx; if (!c) return;
    c.clearRect(0, 0, W, H);
    var sr = stage.getBoundingClientRect();
    var det = window.NKUDetective;
    if (det && det.aim) det.aim(ls.x + sr.left, ls.y + sr.top);
    var tip = det && det.torchTip ? det.torchTip() : null;
    var intensity = NK.lerp(0.55, 0.95, d);
    c.save(); c.globalCompositeOperation = 'screen';
    var tAlpha = NK.smooth(0.5, 1, d);
    var col = warmK > 0.5 ? '255,214,110' : '225,236,255';
    if (tip && tAlpha > 0) {
      var tx = tip.x - sr.left, ty = tip.y - sr.top;
      var ang = Math.atan2(ls.y - ty, ls.x - tx), nx = -Math.sin(ang), ny = Math.cos(ang);
      var bg = c.createLinearGradient(tx, ty, ls.x, ls.y);
      bg.addColorStop(0, 'rgba(' + col + ',' + (0.2 * tAlpha) + ')');
      bg.addColorStop(1, 'rgba(' + col + ',' + (0.035 * tAlpha) + ')');
      c.fillStyle = bg; c.beginPath();
      c.moveTo(tx + nx * 7, ty + ny * 7); c.lineTo(ls.x + nx * rad * 0.82, ls.y + ny * rad * 0.82);
      c.lineTo(ls.x - nx * rad * 0.82, ls.y - ny * rad * 0.82); c.lineTo(tx - nx * 7, ty - ny * 7); c.closePath(); c.fill();
      var len = Math.hypot(ls.x - tx, ls.y - ty);
      dust.forEach(function (p) {
        var u = (p.u + t * 0.02 * p.s) % 1, spread = NK.lerp(8, rad * 0.8, u), v = p.v + Math.sin(t * p.s + p.ph) * 0.15;
        var x = tx + Math.cos(ang) * len * u + nx * spread * v, y = ty + Math.sin(ang) * len * u + ny * spread * v;
        c.fillStyle = 'rgba(255,250,235,' + (0.42 * tAlpha * (1 - Math.abs(v)) * (0.3 + 0.7 * Math.sin(u * Math.PI))) + ')';
        c.beginPath(); c.arc(x, y, 0.6 + p.s * 1.1, 0, 6.29); c.fill();
      });
      var lg = c.createRadialGradient(tx, ty, 0, tx, ty, 26);
      lg.addColorStop(0, 'rgba(255,255,244,' + (0.9 * tAlpha) + ')'); lg.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = lg; c.beginPath(); c.arc(tx, ty, 26, 0, 6.29); c.fill();
    }
    var bl = c.createRadialGradient(ls.x, ls.y, 0, ls.x, ls.y, rad * 1.3);
    var bc = warmK > 0 ? 'rgba(255,' + Math.round(NK.lerp(236, 196, warmK)) + ',' + Math.round(NK.lerp(220, 90, warmK)) + ',' : 'rgba(215,230,255,';
    bl.addColorStop(0, bc + (0.14 * intensity) + ')'); bl.addColorStop(1, bc + '0)');
    c.fillStyle = bl; c.beginPath(); c.arc(ls.x, ls.y, rad * 1.3, 0, 6.29); c.fill();
    c.restore();
  }

  /* ---------------- what is the light on? ---------------- */
  /* what is the light on? The line only changes when the light has settled on
   * something new for a moment, and every line stays at least 1 s */
  var cand = null, candAt = 0, shownAt = -10;
  var MIN_SHOW = 1.0, SETTLE = 0.3;
  function describe(t) {
    if (!S.exploring || t < lineAt) return;
    if (S.found) { if (lineKey !== 'found') { setLine('found', 'is-found'); shownAt = t; } return; }
    var R = U.uR.value, lx = light.x, ly = light.y, key = null, cls = '';
    if (S.roots && Math.hypot(L.target.x - lx, L.target.y - ly) < R * 0.95) { key = 'roots'; cls = 'is-alert'; }
    if (!key) {
      for (var i = 0; i < L.nodes.length; i++) {
        if (built.nodeState[i] === 2 && Math.hypot(L.nodes[i].x - lx, L.nodes[i].y - ly) < R * 0.6) { key = S.detected >= 3 ? 'trail' : 'detected'; cls = 'is-signal'; break; }
      }
    }
    if (!key) built.ghosts.forEach(function (g) { if (!key && Math.hypot(g.position.x - lx, g.position.y - ly) < R * 0.45) key = 'ghost'; });
    if (!key) {
      key = sample(lx, ly);
      if (key === 'pebble') key = 'soil';
      if (key === 'sick' && S.roots) { key = 'roots'; cls = 'is-alert'; }
      if (key === 'soil' && S.hinted && !S.detected) { key = 'hint'; cls = 'is-signal'; }
    }
    if (key === lineKey) { cand = null; return; }
    if (key !== cand) { cand = key; candAt = t; return; }
    var urgent = key === 'roots' || key === 'detected' || key === 'trail';
    if (t - shownAt < MIN_SHOW) return;
    if (!urgent && t - candAt < SETTLE) return;
    setLine(key, cls); shownAt = t; cand = null;
  }

  /* ---------------- frame ---------------- */
  var warmC = new T.Color(1.0, 0.93, 0.82);
  var gold = new T.Color(1.0, 0.8, 0.33);
  function frame(t, dt) {
    if (!built) return;
    clock = t;
    U.uTime.value = t;
    var d = D.v = descentAt(performance.now());
    heroStyle(d);
    var camY = NK.lerp(L.yH, L.yX, d);
    var par = NK.reduced ? 0 : 1;
    camera.position.set((pointerN.x - 0.5) * 0.45 * par, camY - (pointerN.y - 0.5) * 0.28 * par, L.camZ);
    camera.lookAt(camera.position.x * 0.6, camY, 0);
    camera.updateMatrixWorld();

    var exploring = d > 0.96;
    if (exploring !== S.exploring) {
      S.exploring = exploring;
      root.classList.toggle('is-exploring', exploring);
      if (exploring && !S.everExplored) {
        S.everExplored = true; S.tExplore = t;
        setNode(0, 1, t); setNode(1, 1, t + 0.5);
        setLine('scan', '', true); lineAt = t + 2.2; shownAt = t;
        if (!ptr.seen && !guide) { light.tx = L.nodes[0].x + 1.6; light.ty = L.nodes[0].y + 1.9; }
      }
    }
    U.uAmb.value = 1 - NK.smooth(0.2, 0.85, d);
    U.uOn.value = NK.lerp(0.8, 1, NK.smooth(0.3, 0.9, d));

    /* light motion */
    if (guide) {
      var a0 = guide.pts[guide.seg], a1 = guide.pts[guide.seg + 1];
      if (!a1) guide = null;
      else {
        var segLen = Math.max(0.3, Math.hypot(a1.x - a0.x, a1.y - a0.y));
        guide.t += dt * 3.2 / segLen;
        var e = NK.easeInOut(Math.min(1, guide.t));
        light.tx = NK.lerp(a0.x, a1.x, e) + Math.sin(t * 3) * 0.08;
        light.ty = NK.lerp(a0.y, a1.y, e) + Math.cos(t * 2.4) * 0.08;
        if (guide.t >= 1) { guide.seg++; guide.t = 0; }
      }
    } else if (ptr.seen) {
      var w = toWorld(ptr.x, ptr.y); light.tx = w.x; light.ty = w.y;
    } else if (!S.userMoved || !exploring) {
      if (exploring) {
        var n0 = L.nodes[Math.min(S.detected, L.nodes.length - 1)];
        light.tx = n0.x + 1.6 + Math.sin(t * 0.6) * 0.45;
        light.ty = n0.y + 1.9 + Math.cos(t * 0.5) * 0.25;
      } else {
        var wv = toWorld(W * (0.5 + Math.sin(t * 0.6) * 0.22), H * (0.44 + Math.sin(t * 0.9) * 0.12));
        light.tx = wv.x; light.ty = wv.y;
      }
    }
    var ease = 1 - Math.exp(-dt * (guide ? 14 : (ptr.seen ? 10 : 3)));
    light.x += (light.tx - light.x) * ease;
    light.y += (light.ty - light.y) * ease;
    var yMin = camY - L.Hx / 2 - 0.5, yMax = camY + L.Hx / 2 + 0.5;
    light.x = NK.clamp(light.x, -L.Wx / 2 - 0.5, L.Wx / 2 + 0.5);
    light.y = NK.clamp(light.y, yMin, yMax);
    U.uL.value.set(light.x, light.y);

    var fk = S.found ? NK.smooth(0, 1.2, t - S.foundT) : 0;
    var warmK = S.found ? fk : 0.18 * S.detected / L.nodes.length;
    U.uLC.value.copy(warmC).lerp(gold, warmK);
    var baseR = L.portrait ? 2.9 : 2.6;
    U.uR.value = NK.lerp(baseR * 1.3, baseR, d) * (1 + 0.19 * fk);
    U.uGall.value += ((S.roots ? 1 : 0) - U.uGall.value) * Math.min(1, dt * 2);

    if (S.exploring && !S.found) {
      var R = U.uR.value;
      for (var i = 0; i < L.nodes.length; i++) {
        if (built.nodeState[i] === 1 && Math.hypot(L.nodes[i].x - light.x, L.nodes[i].y - light.y) < R * 0.55) detect(i, t);
      }
      if (Math.hypot(L.target.x - light.x, L.target.y - light.y) < R * 0.95 && (S.detected >= 2 || guide)) onRoots(t);
      if (Math.hypot(L.nem.x - light.x, L.nem.y - light.y) < R * 0.6 && S.roots) onFound(t);
      if (!S.detected && t - S.tExplore > 7 && !S.hinted) { S.hinted = true; nudge(); }
    }
    U.uHint.value = S.hinted && !S.detected ? 0.5 + 0.5 * Math.sin(t * 3) : 0;

    built.nemU.uShow.value = S.found ? NK.smooth(0, 0.6, t - S.foundT) : 0;
    built.nemU.uWig.value = S.found ? 0.03 + 0.06 * Math.max(0, 1 - (t - S.foundT) / 2.5) : 0.018;

    built.ghosts.forEach(function (g) {
      var u = g.userData;
      var px = u.hx + Math.cos(t * u.s1 + u.ph) * u.rx, py = u.hy + Math.sin(t * u.s2 + u.ph) * u.ry;
      var vx = -Math.sin(t * u.s1 + u.ph) * u.rx * u.s1, vy = Math.cos(t * u.s2 + u.ph) * u.ry * u.s2;
      g.position.set(px, py, u.z);
      g.rotation.z = Math.atan2(vy, vx);
    });

    var ls = toScreen(light.x, light.y);
    var rad = Math.abs(toScreen(light.x + U.uR.value, light.y).x - ls.x);
    var sr = stage.getBoundingClientRect();
    NK.state.lightScreen = { x: sr.left + ls.x, y: sr.top + ls.y };
    H0.lastLight = { x: ls.x, y: sr.top + ls.y, r: rad, warm: warmK };
    if (bigLabel) {
      var s = toScreen(L.nem.x + 0.2, L.nem.y + 1.25);
      var bw = bigLabel.offsetWidth;
      var bx = NK.clamp(s.x - bw * 0.5, 16, W - bw - 16);
      bigLabel.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + (s.y - 40).toFixed(1) + 'px)';
    }
    describe(t);
    renderer.render(scene, camera);
    drawFx(t, ls, rad, d, warmK);
  }

  resize(true);
  registerScene({ now: function () { return clock; } });
  NK.loopWhileVisible(stage, frame, '80px 0px');

  /* narrow screens scroll natively and cannot be held back: the light
   * finds the nematode by itself near the end of the section instead */
  window.addEventListener('scroll', function () {
    if (H0.pager && H0.pager.isPaged && H0.pager.isPaged()) return;
    var r = root.getBoundingClientRect(), span = root.offsetHeight - innerHeight;
    var p = span > 0 ? NK.clamp(-r.top / span, 0, 1) : 0;
    if (p > 0.82 && S.exploring && !S.found && !guide) startGuide();
  }, { passive: true });
}());
