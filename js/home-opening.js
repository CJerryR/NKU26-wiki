/* Part 01 · the field detective's search (three.js).
 * A painted soil section: the camera sinks from the surface into the soil,
 * the flashlight follows the pointer, flickering cyan chemical clues form a
 * trail, and the trail ends at a damaged root and a nematode. Illustrative:
 * no signal here is measured data. */
(function () {
  'use strict';
  var NK = window.NK;
  var root = document.querySelector('[data-opening]');
  if (!NK || !root) return;

  var stage = root.querySelector('[data-opening-stage]');
  var canvas = root.querySelector('[data-opening-canvas]');
  var hudLine = root.querySelector('[data-hud-line]');
  var meter = root.querySelector('[data-hud-meter]');
  var labelsEl = root.querySelector('[data-labels]');
  var guideBtn = root.querySelector('[data-opening-guide]');
  var startBtn = root.querySelector('[data-opening-start]');
  var focusEl = root.querySelector('[data-opening-focus]');
  var T = window.THREE;

  var COPY = {
    scan: NK.coarse ? 'Tap the soil to move your light.' : 'Move your cursor to scan the soil.',
    detected: 'Signal detected!',
    trail: 'The fluorescent signals seem to form a trail.',
    hint: 'Look for the flickering cyan glow.',
    roots: 'The plant\u2019s roots are under severe attack!',
    found: 'Nematodes are behind it!'
  };

  function setLine(text, cls) {
    if (!hudLine || hudLine.textContent === text) return;
    hudLine.textContent = text;
    hudLine.className = 'nk-hud__line' + (cls ? ' ' + cls : '');
  }
  function progress() {
    var r = root.getBoundingClientRect();
    var span = root.offsetHeight - window.innerHeight;
    return span > 0 ? NK.clamp(-r.top / span, 0, 1) : 1;
  }
  function exploreTop() {
    return root.getBoundingClientRect().top + window.pageYOffset + root.offsetHeight - window.innerHeight;
  }
  if (startBtn) {
    startBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: exploreTop(), behavior: NK.reduced ? 'auto' : 'smooth' });
      setTimeout(function () { if (focusEl) focusEl.focus({ preventScroll: true }); }, NK.reduced ? 0 : 1100);
    });
  }

  function fallback() {
    root.classList.add('is-fallback');
    root.style.setProperty('--hero-o', '1');
    setLine('Scroll on to follow the trail of chemical clues.');
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      stage.style.setProperty('--fx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      stage.style.setProperty('--fy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
    var onScroll = function () {
      var p = progress();
      root.style.setProperty('--hero-o', String(1 - NK.smooth(0.04, 0.3, p)));
      root.style.setProperty('--hud-o', String(NK.smooth(0.7, 0.95, p)));
      root.classList.toggle('is-exploring', p > 0.78);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (!T || !NK.webgl()) { fallback(); return; }
  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (err) { fallback(); return; }
  renderer.setClearColor(0x140b1c, 1);
  var DPR = Math.min(window.devicePixelRatio || 1, NK.coarse ? 1.5 : 1.8);
  renderer.setPixelRatio(DPR);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(32, 1, 0.5, 400);
  var HALF_TAN = Math.tan(16 * Math.PI / 180);
  var W = 1, H = 1;
  var L = null;           // layout
  var built = null;       // current scene objects
  var nemTex = null;      // nematode texture (loaded once)

  /* uniforms shared by every material that reacts to the light */
  var U = {
    uL: { value: new T.Vector2(0, -10) },
    uR: { value: 2.6 },
    uOn: { value: 0 },
    uLC: { value: new T.Color(1.0, 0.93, 0.82) },
    uTime: { value: 0 },
    uGall: { value: 0 },
    uPx: { value: 800 },
    uHint: { value: 0 }
  };

  var S = {                 // search state (survives rebuilds)
    detected: 0, roots: false, found: false, exploring: false, everExplored: false,
    tExplore: 0, lastDetect: 0, hinted: false, foundT: 0, userMoved: false
  };
  var light = { x: 0, y: 0, tx: 0, ty: 0 };
  var guide = null;
  var pointerN = { x: 0.5, y: 0.5 };

  /* ------------------------------------------------------------------ */
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
    'uniform vec2 uL; uniform float uR; uniform float uOn; uniform vec3 uLC; uniform float uTime; uniform float uGall;',
    'varying vec2 vUv; varying vec2 vW;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
    'void main(){',
    '  vec3 alb = texture2D(uA, vUv).rgb; vec3 dat = texture2D(uD, vUv).rgb;',
    '  if (dat.b > 0.9) { gl_FragColor = vec4(alb * (0.92 + 0.08 * sin(uTime * 0.4)), 1.0); return; }',
    '  float hl = texture2D(uD, vUv - vec2(uTex.x, 0.0)).r; float hr = texture2D(uD, vUv + vec2(uTex.x, 0.0)).r;',
    '  float hb = texture2D(uD, vUv - vec2(0.0, uTex.y)).r; float ht = texture2D(uD, vUv + vec2(0.0, uTex.y)).r;',
    '  vec3 n = normalize(vec3((hl - hr) * 3.4, (hb - ht) * 3.4, 1.0));',
    '  vec2 dl = uL - vW; float d = length(dl);',
    '  vec3 ld = normalize(vec3(dl, 2.4));',
    '  float diff = max(dot(n, ld), 0.0);',
    '  float spot = 1.0 - smoothstep(uR * 0.74, uR, d);',
    '  float spill = exp(-pow(d / (uR * 2.1), 2.0));',
    '  float lamp = (spot * 0.95 + spill * 0.2) * uOn;',
    '  float ao = 0.58 + 0.42 * smoothstep(0.25, 0.7, dat.r);',
    '  vec3 lit = alb * uLC * (0.32 + 1.02 * diff) * lamp * ao;',
    '  float surf = smoothstep(-5.0, 0.6, vW.y);',
    '  vec3 tint = mix(vec3(0.36, 0.25, 0.45), vec3(0.5, 0.45, 0.43), dat.g);',
    '  vec3 amb = alb * tint * (0.3 + 1.3 * dat.g) * (1.0 + surf * 1.35);',
    '  vec3 col = amb + lit;',
    '  float gall = step(0.35, dat.b) * step(dat.b, 0.65);',
    '  col += vec3(1.0, 0.3, 0.36) * gall * uGall * (0.32 + 0.22 * sin(uTime * 3.4)) * (0.35 + lamp);',
    '  float rim = smoothstep(uR * 1.03, uR * 0.98, d) * smoothstep(uR * 0.9, uR * 0.985, d);',
    '  col += uLC * rim * 0.07 * uOn;',
    '  col += (hash(vUv * vec2(1733.0, 927.0) + fract(uTime * 0.37)) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var VERT_PTS = [
    'attribute float aSize; attribute float aPhase; attribute float aState; attribute float aT0;',
    'uniform float uTime; uniform float uPx; uniform float uHint; uniform float uFlick;',
    'varying float vA; varying float vPulse; varying float vState;',
    'void main(){',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;',
    '  float age = uTime - aT0;',
    '  float flick = 0.55 + 0.45 * sin(uTime * (2.1 + aPhase * 2.3) + aPhase * 6.283);',
    '  flick *= 0.72 + 0.28 * sin(uTime * 8.7 + aPhase * 17.0);',
    '  flick = mix(0.85, flick, uFlick);',
    '  float a = 0.0; vPulse = 0.0;',
    '  if (aState > 0.5 && aState < 1.5) a = flick * clamp(age / 0.7, 0.0, 1.0) * (1.0 + uHint * 0.6);',
    '  else if (aState > 1.5 && aState < 2.5) { a = 0.92 + 0.08 * sin(uTime * 2.0 + aPhase * 6.0); vPulse = clamp(1.0 - age / 1.2, 0.0, 1.0); }',
    '  else if (aState > 2.5) a = 0.34 * clamp(0.5 + 0.5 * sin(uTime * (0.6 + aPhase) + aPhase * 30.0), 0.0, 1.0) * flick;',
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
    'uniform vec2 uL; uniform float uR; uniform float uOn; uniform vec3 uCol; uniform float uAlpha;',
    'varying vec2 vUv; varying vec2 vW;',
    'void main(){',
    '  float e = 1.0 - abs(vUv.y - 0.5) * 2.0;',
    '  float body = smoothstep(0.0, 0.4, e);',
    '  float gut = smoothstep(0.7, 1.0, e) * 0.3;',
    '  float lit = (1.0 - smoothstep(uR * 0.55, uR * 1.05, length(uL - vW))) * uOn;',
    '  float a = (uAlpha + lit * 0.32) * body;',
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
    'uniform sampler2D uMap; uniform vec2 uL; uniform float uR; uniform float uOn; uniform float uShow;',
    'varying vec2 vUv; varying vec2 vW;',
    'void main(){',
    '  vec4 tx = texture2D(uMap, vUv);',
    '  float lit = (1.0 - smoothstep(uR * 0.62, uR * 1.02, length(uL - vW))) * uOn;',
    '  float vis = max(lit, uShow);',
    '  gl_FragColor = vec4(tx.rgb * (0.5 + 0.5 * vis), tx.a * vis);',
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
        uFlick: { value: NK.reduced ? 0 : 1 }, uCol: { value: new T.Color(color) }
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
    var tA = new T.CanvasTexture(painted.albedo);
    var tD = new T.CanvasTexture(painted.data);
    tA.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    tD.generateMipmaps = false;
    tD.minFilter = T.LinearFilter;
    textures.push(tA, tD);

    var soil = new T.Mesh(new T.PlaneGeometry(L.PW, L.PH), new T.ShaderMaterial({
      uniforms: {
        uA: { value: tA }, uD: { value: tD }, uTex: { value: new T.Vector2(1 / L.texW, 1 / L.texH) },
        uL: U.uL, uR: U.uR, uOn: U.uOn, uLC: U.uLC, uTime: U.uTime, uGall: U.uGall
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
          uTime: U.uTime, uL: U.uL, uR: U.uR, uOn: U.uOn,
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
    var nemUniforms = { uTime: U.uTime, uL: U.uL, uR: U.uR, uOn: U.uOn, uWig: { value: 0.03 }, uShow: { value: S.found ? 1 : 0 }, uMap: { value: nemTex } };
    var nem = new T.Mesh(new T.PlaneGeometry(2.5, 2.5 * 180 / 320, 28, 1), new T.ShaderMaterial({
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

  function buildMeter() {
    if (!meter || !L) return;
    meter.innerHTML = '';
    for (var i = 0; i < L.nodes.length; i++) {
      var li = document.createElement('li');
      if (i < S.detected) li.className = 'is-on';
      meter.appendChild(li);
    }
  }

  /* ---------------- labels ---------------- */
  var labelMap = {};
  function label(id, text, x, y, cls) {
    var el = labelMap[id];
    if (!el) {
      el = document.createElement('span');
      el.className = 'nk-label' + (cls ? ' ' + cls : '');
      el.textContent = text;
      labelsEl.appendChild(el);
      labelMap[id] = el;
    }
    el._x = x;
    el._y = y;
    requestAnimationFrame(function () { el.classList.add('is-on'); });
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

  /* ---------------- search logic ---------------- */
  function detect(i, t) {
    for (var j = 0; j <= i; j++) if (built.nodeState[j] < 2) setNode(j, 2, j === i ? t : t - 2);
    var before = S.detected;
    S.detected = Math.max(S.detected, i + 1);
    S.lastDetect = t;
    revealTrail(i, t);
    for (j = i + 1; j <= Math.min(L.nodes.length - 1, i + 2); j++) if (built.nodeState[j] === 0) setNode(j, 1, t);
    if (meter) Array.prototype.forEach.call(meter.children, function (li, k) { li.classList.toggle('is-on', k < S.detected); });
    if (before === 0) {
      setLine(COPY.detected, 'is-signal');
      label('first', 'Signal detected', L.nodes[i].x, L.nodes[i].y);
    } else if (S.detected >= 3 && before < 3) {
      setLine(COPY.trail, 'is-signal');
    }
    if (S.detected === L.nodes.length) revealTrail(L.nodes.length, t);
  }
  function onRoots(t) {
    if (S.roots) return;
    S.roots = true;
    setLine(COPY.roots, 'is-alert');
    for (var j = 0; j < L.nodes.length; j++) if (built.nodeState[j] === 0) setNode(j, 1, t);
  }
  function onFound(t) {
    if (S.found) return;
    S.found = true;
    S.foundT = t;
    if (!S.roots) onRoots(t);
    for (var j = 0; j < L.nodes.length; j++) setNode(j, 2, j === L.nodes.length - 1 ? t : t - 2);
    S.detected = L.nodes.length;
    revealTrail(L.nodes.length + 1, t);
    if (meter) Array.prototype.forEach.call(meter.children, function (li) { li.classList.add('is-on'); });
    setTimeout(function () { setLine(COPY.found, 'is-found'); }, 650);
    label('nem', 'Root-knot nematode', L.nem.x - 1.1, L.nem.y + 0.9, 'nk-label--gold');
    root.classList.add('is-found');
    NK.state.found = true;
    NK.emit('found');
    guide = null;
  }

  function startGuide() {
    if (!L) return;
    var pts = [{ x: light.x, y: light.y }];
    for (var i = S.detected; i < L.nodes.length; i++) pts.push(L.nodes[i]);
    pts.push(L.target, L.nem);
    guide = { pts: pts, seg: 0, t: 0 };
    S.userMoved = true;
    if (!S.exploring) window.scrollTo({ top: exploreTop(), behavior: NK.reduced ? 'auto' : 'smooth' });
  }
  if (guideBtn) guideBtn.addEventListener('click', startGuide);

  /* ---------------- input ---------------- */
  function pointerTo(e) {
    var r = stage.getBoundingClientRect();
    var cx = e.clientX - r.left;
    var cy = e.clientY - r.top;
    pointerN.x = cx / r.width;
    pointerN.y = cy / r.height;
    if (!S.exploring || !L) return;
    var w = toWorld(cx, cy);
    light.tx = w.x;
    light.ty = w.y;
    S.userMoved = true;
    guide = null;
  }
  stage.addEventListener('pointermove', pointerTo, { passive: true });
  stage.addEventListener('pointerdown', pointerTo, { passive: true });
  if (focusEl) {
    focusEl.addEventListener('keydown', function (e) {
      var step = 0.9;
      var used = true;
      if (e.key === 'ArrowLeft') light.tx -= step;
      else if (e.key === 'ArrowRight') light.tx += step;
      else if (e.key === 'ArrowUp') light.ty += step;
      else if (e.key === 'ArrowDown') light.ty -= step;
      else if (e.key === 'Enter' || e.key === ' ') startGuide();
      else used = false;
      if (used) { e.preventDefault(); guide = e.key === 'Enter' || e.key === ' ' ? guide : null; S.userMoved = true; }
    });
  }

  /* ---------------- sizing ---------------- */
  var lastA = 0;
  function resize(force) {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    U.uPx.value = H * DPR / (2 * HALF_TAN);
    var a = W / H;
    if (force || !built || Math.abs(a - lastA) > 0.12 || (L && W > L.Wx / L.Hx * H * 1.2)) {
      lastA = a;
      if (!nemTex) loadNematode();
      build();
    }
  }
  function loadNematode() {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = 640;
      c.height = 360;
      c.getContext('2d').drawImage(img, 0, 0, 640, 360);
      nemTex = new T.CanvasTexture(c);
      if (built) { built.nemU.uMap.value = nemTex; built.nem.visible = true; }
    };
    img.src = NK.prefix + 'img/home-opening/nematode.svg';
  }
  var rT = 0;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { resize(false); }, 220); });

  /* ---------------- frame ---------------- */
  var warm = new T.Color(1.0, 0.93, 0.82);
  var gold = new T.Color(1.0, 0.8, 0.33);
  var wasExploring = false;
  function frame(t, dt) {
    if (!built) return;
    U.uTime.value = t;
    var p = progress();
    var k = NK.easeInOut(NK.smooth(0.0, 0.62, p));
    var camY = NK.lerp(L.yH, L.yX, k);
    var par = NK.reduced ? 0 : 1;
    camera.position.set((pointerN.x - 0.5) * 0.45 * par, camY - (pointerN.y - 0.5) * 0.28 * par, L.camZ);
    camera.lookAt(camera.position.x * 0.6, camY, 0);

    root.style.setProperty('--p', p.toFixed(3));
    root.style.setProperty('--hero-o', (1 - NK.smooth(0.04, 0.3, p)).toFixed(3));
    root.style.setProperty('--hud-o', NK.smooth(0.72, 0.95, p).toFixed(3));
    S.exploring = p > 0.78;
    if (S.exploring !== wasExploring) {
      wasExploring = S.exploring;
      root.classList.toggle('is-exploring', S.exploring);
      if (S.exploring && !S.everExplored) {
        S.everExplored = true;
        S.tExplore = t;
        setNode(0, 1, t);
        setNode(1, 1, t + 0.5);
        setLine(COPY.scan);
        NK.setDetective('scanning');
      }
    }
    U.uOn.value = NK.smooth(0.52, 0.86, p);

    /* light motion */
    if (guide) {
      var a0 = guide.pts[guide.seg];
      var a1 = guide.pts[guide.seg + 1];
      if (!a1) guide = null;
      else {
        var segLen = Math.max(0.3, Math.hypot(a1.x - a0.x, a1.y - a0.y));
        guide.t += dt * 3.2 / segLen;
        var e = NK.easeInOut(Math.min(1, guide.t));
        light.tx = NK.lerp(a0.x, a1.x, e) + Math.sin(t * 3) * 0.08;
        light.ty = NK.lerp(a0.y, a1.y, e) + Math.cos(t * 2.4) * 0.08;
        if (guide.t >= 1) { guide.seg++; guide.t = 0; }
      }
    } else if (!S.userMoved && S.exploring) {
      var n0 = L.nodes[0];
      light.tx = n0.x + 1.6 + Math.sin(t * 0.6) * 0.45;
      light.ty = n0.y + 1.9 + Math.cos(t * 0.5) * 0.25;
    }
    var ease = 1 - Math.exp(-dt * (guide ? 14 : 8));
    light.x += (light.tx - light.x) * ease;
    light.y += (light.ty - light.y) * ease;
    light.x = NK.clamp(light.x, -L.Wx / 2 - 0.5, L.Wx / 2 + 0.5);
    light.y = NK.clamp(light.y, L.yX - L.Hx / 2 - 0.5, L.yX + L.Hx / 2 + 0.5);
    U.uL.value.set(light.x, light.y);

    /* light colour warms as clues accumulate; betaxanthin gold once found */
    var warmK = S.found ? NK.smooth(0, 1.2, t - S.foundT) : 0.18 * S.detected / L.nodes.length;
    U.uLC.value.copy(warm).lerp(gold, warmK);
    U.uR.value = NK.lerp(L.portrait ? 2.9 : 2.6, L.portrait ? 3.4 : 3.1, S.found ? NK.smooth(0, 1.2, t - S.foundT) : 0);
    U.uGall.value += ((S.roots ? 1 : 0) - U.uGall.value) * Math.min(1, dt * 2);

    /* detection */
    if (S.exploring && !S.found) {
      var R = U.uR.value;
      for (var i = 0; i < L.nodes.length; i++) {
        if (built.nodeState[i] === 1) {
          var nd = L.nodes[i];
          if (Math.hypot(nd.x - light.x, nd.y - light.y) < R * 0.55) detect(i, t);
        }
      }
      if (Math.hypot(L.target.x - light.x, L.target.y - light.y) < R * 0.95 && (S.detected >= 2 || guide)) onRoots(t);
      if (Math.hypot(L.nem.x - light.x, L.nem.y - light.y) < R * 0.6 && S.roots) onFound(t);
      if (!S.detected && t - S.tExplore > 7 && !S.hinted) { S.hinted = true; setLine(COPY.hint, 'is-signal'); if (guideBtn) guideBtn.classList.add('is-nudge'); }
    }
    U.uHint.value = S.hinted && !S.detected ? 0.5 + 0.5 * Math.sin(t * 3) : 0;

    /* nematode */
    built.nemU.uShow.value = S.found ? NK.smooth(0, 0.6, t - S.foundT) : 0;
    built.nemU.uWig.value = S.found ? 0.05 + 0.1 * Math.max(0, 1 - (t - S.foundT) / 2.5) : 0.03;
    built.nem.position.y = L.nem.y + (S.found ? Math.sin((t - S.foundT) * 14) * 0.05 * Math.max(0, 1 - (t - S.foundT)) : 0);

    /* ghosts */
    built.ghosts.forEach(function (g) {
      var u = g.userData;
      var px = u.hx + Math.cos(t * u.s1 + u.ph) * u.rx;
      var py = u.hy + Math.sin(t * u.s2 + u.ph) * u.ry;
      var vx = -Math.sin(t * u.s1 + u.ph) * u.rx * u.s1;
      var vy = Math.cos(t * u.s2 + u.ph) * u.ry * u.s2;
      g.position.set(px, py, u.z);
      g.rotation.z = Math.atan2(vy, vx);
    });

    /* labels + shared screen position for the iris transition */
    var ls = toScreen(light.x, light.y);
    var r = stage.getBoundingClientRect();
    NK.state.lightScreen = { x: r.left + ls.x, y: r.top + ls.y };
    Object.keys(labelMap).forEach(function (id) {
      var el = labelMap[id];
      var s = toScreen(el._x, el._y);
      var flip = s.x + 16 + el.offsetWidth > W - 8;
      el.style.transform = 'translate(' + (flip ? s.x - 16 - el.offsetWidth : s.x + 16).toFixed(1) + 'px,' + (s.y - 10).toFixed(1) + 'px)';
      el.style.opacity = S.exploring ? '' : '0';
    });

    renderer.render(scene, camera);
  }

  resize(true);
  setLine(COPY.scan);
  NK.loopWhileVisible(stage, frame, '80px 0px');
}());
