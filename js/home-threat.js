/* NKU homepage — 04 the hidden threat.
   One continuous scene, played in five stages (B12 sketch): eggs in the soil,
   juveniles hatch, they release ascarosides on the way, one enters a root and
   settles, and only then does the plant show it. A camera pans and zooms
   through a single soil cross-section, so each scroll moves the story
   sideways instead of swapping pictures. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v) { return Math.round(v * 10) / 10; }
  /* smooth path through points (Catmull-Rom → cubic Bézier) */
  function curve(pts) {
    var d = 'M' + f1(pts[0][0]) + ',' + f1(pts[0][1]);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f1(p2[0]) + ',' + f1(p2[1]);
    }
    return d;
  }
  /* sample a Catmull-Rom curve into an arc-length table */
  function sampler(pts, n) {
    var raw = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (var k = 0; k < 24; k++) {
        var t = k / 24, t2 = t * t, t3 = t2 * t;
        raw.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                  .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    raw.push(pts[pts.length - 1]);
    var L = [0]; for (i = 1; i < raw.length; i++) L.push(L[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
    var total = L[L.length - 1];
    return {
      len: total,
      at: function (u) {
        var d = H.clamp(u, 0, 1) * total, lo = 0, hi = L.length - 1;
        while (hi - lo > 1) { var m = (lo + hi) >> 1; if (L[m] < d) lo = m; else hi = m; }
        var f = (d - L[lo]) / ((L[hi] - L[lo]) || 1), a = raw[lo], b = raw[hi];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
      }
    };
  }

  H.ready(function () {
    var sec = H.$('[data-threat]'); if (!sec) return;
    var svg = H.$('[data-th-svg]', sec), head = H.$('[data-th-head]', sec), track = H.$('[data-th-track]', sec);
    var bars = H.$$('[data-th-bar] i', sec), items = H.$$('li', track), chips = H.$$('[data-th-chip]', sec);
    var P = document.body.getAttribute('data-path-prefix') || '';
    var GROUND = 330, PX = 1900, IS = [1702, 626];
    var rnd = H.rand(21);

    /* ---------- defs ---------- */
    var defs = el('defs', {}, svg);
    function radial(id, stops) { var g = el('radialGradient', { id: id }, defs); stops.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g); }); }
    radial('thGlowB', [[0, '#8fb6ff', .95], [.35, '#4c8dff', .55], [1, '#4c8dff', 0]]);
    radial('thGlowP', [[0, '#ffb3c4', .95], [.35, '#ff5e86', .55], [1, '#ff5e86', 0]]);
    radial('thGlowR', [[0, '#ff5a4f', .75], [.5, '#e0413f', .3], [1, '#e0413f', 0]]);
    var sg = el('linearGradient', { id: 'thSoil', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#7a4d36' }, sg); el('stop', { offset: .45, 'stop-color': '#5e3a2a' }, sg); el('stop', { offset: 1, 'stop-color': '#3f261d' }, sg);
    var sk = el('linearGradient', { id: 'thSky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#f7f0e3' }, sk); el('stop', { offset: 1, 'stop-color': '#efe2cc' }, sk);
    var clip = el('clipPath', { id: 'thSoilClip' }, defs);

    var cam = el('g', {}, svg);
    /* ---------- sky & ground ---------- */
    el('rect', { x: -1200, y: -1400, width: 5200, height: GROUND + 1400, fill: 'url(#thSky)' }, cam);
    var hills = []; for (var x = -1200; x <= 4000; x += 60) hills.push([x, GROUND - 40 - 34 * Math.sin(x / 380) - 18 * Math.sin(x / 150 + 1)]);
    el('path', { d: 'M-1200,' + GROUND + 'L' + hills.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join('L') + 'L4000,' + GROUND + 'Z', fill: '#e7d8bf' }, cam);
    var surf = []; for (x = -1200; x <= 4000; x += 40) surf.push([x, GROUND + Math.sin(x / 90) * 4 + Math.sin(x / 37) * 2]);
    var soilD = 'M-1200,2200L' + surf.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join('L') + 'L4000,2200Z';
    el('path', { d: soilD }, clip);
    var soil = el('g', { 'clip-path': 'url(#thSoilClip)' }, cam);
    el('rect', { x: -1200, y: GROUND - 20, width: 5200, height: 2000, fill: 'url(#thSoil)' }, soil);
    el('image', { href: H.asset('img/home/soil-print.png'), x: -1200, y: GROUND + 10, width: 5200, height: 1500, preserveAspectRatio: 'none', opacity: .045 }, soil);
    for (var r = 0; r < 5; r++) {
      var y0 = GROUND + 150 + r * 125, pts = [];
      for (x = -1200; x <= 4000; x += 160) pts.push([x, y0 + Math.sin(x / 260 + r) * 16]);
      el('path', { d: curve(pts), fill: 'none', stroke: 'rgba(255,228,200,.07)', 'stroke-width': 3 }, soil);
    }
    el('path', { d: 'M-1200,' + GROUND + 'L' + surf.map(function (p) { return f1(p[0]) + ',' + f1(p[1] + 16); }).join('L') + 'L4000,' + (GROUND - 30) + 'L-1200,' + (GROUND - 30) + 'Z', fill: '#4a2d21', opacity: .55 }, soil);
    for (var i = 0; i < 90; i++) {
      var px = -200 + rnd() * 3000, py = GROUND + 50 + rnd() * 700, rx = 5 + rnd() * 20, ry = 3 + rnd() * 11;
      el('ellipse', { cx: f1(px), cy: f1(py), rx: f1(rx), ry: f1(ry), transform: 'rotate(' + Math.round(rnd() * 180) + ' ' + f1(px) + ' ' + f1(py) + ')', fill: rnd() < .5 ? '#8a624b' : '#6f4b39', opacity: .85 }, soil);
    }
    for (i = 0; i < 320; i++) el('circle', { cx: f1(-200 + rnd() * 3000), cy: f1(GROUND + 20 + rnd() * 760), r: f1(.8 + rnd() * 2.4), fill: rnd() < .55 ? 'rgba(255,232,205,.16)' : 'rgba(20,8,4,.28)' }, soil);

    /* ---------- feeding-site glow (under the roots) ---------- */
    var glow = el('circle', { cx: IS[0], cy: IS[1], r: 120, fill: 'url(#thGlowR)', opacity: 0 }, cam);

    /* ---------- roots ---------- */
    var ROOTS = [
      { w: 13, p: [[PX, GROUND - 4], [PX + 4, 420], [PX + 14, 560], [PX + 30, 720], [PX + 24, 870]] },
      { w: 11, p: [[PX + 6, 430], [1800, 490], [1740, 560], [1700, 626], [1672, 700], [1650, 770]], inf: true },
      { w: 6.5, p: [[PX + 10, 500], [2010, 540], [2090, 610], [2160, 720]] },
      { w: 6, p: [[PX + 20, 620], [1850, 680], [1800, 760], [1780, 830]] },
      { w: 5.5, p: [[PX + 28, 700], [2000, 760], [2050, 840], [2080, 900]] },
      { w: 5, p: [[PX + 3, 380], [1990, 400], [2060, 440], [2120, 490]] },
      { w: 3, p: [[1760, 540], [1700, 540], [1640, 575]] },
      { w: 3, p: [[2090, 610], [2150, 600], [2220, 630]] },
      { w: 2.5, p: [[1800, 760], [1740, 780], [1700, 830]] },
      { w: 2.5, p: [[2060, 440], [2100, 400], [2150, 410]] }
    ];
    var rootG = el('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cam);
    ROOTS.forEach(function (rt) { el('path', { d: curve(rt.p), stroke: '#b99a70', 'stroke-width': rt.w + 3 }, rootG); });
    ROOTS.forEach(function (rt) { el('path', { d: curve(rt.p), stroke: '#f1e2c4', 'stroke-width': rt.w }, rootG); rt.s = sampler(rt.p); });
    // root cells along the infected root, only readable when the camera is close
    var inf = ROOTS[1].s, cells = el('g', { stroke: 'rgba(150,112,72,.45)', 'stroke-width': .6 }, cam);
    for (var u = .35; u < .92; u += .012) {
      var q = inf.at(u), nx = -Math.sin(q[2]), ny = Math.cos(q[2]);
      el('line', { x1: f1(q[0] + nx * 3.2), y1: f1(q[1] + ny * 3.2), x2: f1(q[0] - nx * 3.2), y2: f1(q[1] - ny * 3.2) }, cells);
    }
    // gall with giant cells
    var tangent = inf.at(.62)[2] * 180 / Math.PI;
    var gall = el('g', { transform: 'translate(' + IS[0] + ',' + IS[1] + ') rotate(' + f1(tangent) + ') scale(0)' }, cam);
    el('ellipse', { rx: 20, ry: 13, fill: '#f0cfa8', stroke: '#c69c70', 'stroke-width': 1.4 }, gall);
    [[-8, -3, 5.5], [2, 3, 6], [9, -4, 4.5], [-2, -6, 3.5]].forEach(function (c) {
      el('circle', { cx: c[0], cy: c[1], r: c[2], fill: '#f3a6a0', stroke: '#d9787a', 'stroke-width': .7 }, gall);
      el('circle', { cx: c[0] - 1, cy: c[1] - 1, r: 1, fill: '#a8404d' }, gall); el('circle', { cx: c[0] + 1.6, cy: c[1] + .8, r: .8, fill: '#a8404d' }, gall);
    });

    /* ---------- egg mass ---------- */
    var EM = [430, 700], eggs = [], eggG = el('g', {}, cam);
    el('path', { d: 'M' + (EM[0] - 78) + ',' + EM[1] + 'C' + (EM[0] - 80) + ',' + (EM[1] - 52) + ' ' + (EM[0] + 70) + ',' + (EM[1] - 60) + ' ' + (EM[0] + 82) + ',' + (EM[1] - 6) + 'C' + (EM[0] + 90) + ',' + (EM[1] + 44) + ' ' + (EM[0] - 70) + ',' + (EM[1] + 56) + ' ' + (EM[0] - 78) + ',' + EM[1] + 'Z', fill: 'rgba(246,226,168,.42)', stroke: 'rgba(236,206,140,.85)', 'stroke-width': 2 }, eggG);
    var er = H.rand(4);
    for (i = 0; i < 17; i++) {
      var ex = EM[0] - 58 + (i % 6) * 22 + er() * 8, ey = EM[1] - 26 + Math.floor(i / 6) * 22 + er() * 6, rot = er() * 180;
      var g = el('g', { transform: 'translate(' + f1(ex) + ',' + f1(ey) + ') rotate(' + Math.round(rot) + ')' }, eggG);
      el('ellipse', { rx: 10, ry: 6, fill: '#fbf2d8', stroke: '#d8bf8a', 'stroke-width': 1.2 }, g);
      var curl = el('path', { d: 'M-5,1C-5,-4 4,-4 4,0C4,3 -1,3 -1,0', fill: 'none', stroke: '#f09a42', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
      eggs.push({ g: g, curl: curl, x: ex, y: ey });
    }

    /* ---------- particles & larvae layers ---------- */
    var partG = el('g', {}, cam), larvaG = el('g', {}, cam);
    var sheath = el('path', { d: curve(ROOTS[1].p.slice(1, 6)), fill: 'none', stroke: 'rgba(241,226,196,.78)', 'stroke-width': 11, 'stroke-linecap': 'round', opacity: 0 }, cam);
    var newEggs = el('g', { transform: 'translate(' + (IS[0] - 22) + ',' + (IS[1] + 10) + ') scale(0)' }, cam);
    el('ellipse', { rx: 16, ry: 11, fill: 'rgba(246,226,168,.7)', stroke: 'rgba(230,200,140,.95)', 'stroke-width': 1 }, newEggs);
    for (i = 0; i < 7; i++) el('ellipse', { cx: -9 + (i % 4) * 6, cy: -4 + Math.floor(i / 4) * 7, rx: 3, ry: 2, fill: '#fbf2d8', stroke: '#d8bf8a', 'stroke-width': .6 }, newEggs);

    /* ---------- grass & plant ---------- */
    var grass = el('g', { fill: 'none', 'stroke-linecap': 'round' }, cam);
    for (x = -300; x < 3100; x += 18 + rnd() * 16) {
      var gy0 = GROUND + Math.sin(x / 90) * 4 - 2;
      for (var b = 0; b < 3; b++) { var hh = 10 + rnd() * 22, lean = (rnd() - .5) * 14; el('path', { d: 'M' + f1(x + b * 3) + ',' + f1(gy0) + 'q' + f1(lean * .3) + ',' + f1(-hh * .6) + ' ' + f1(lean) + ',' + f1(-hh), stroke: rnd() < .5 ? '#86b45a' : '#6f9d45', 'stroke-width': 2.2 }, grass); }
    }
    // seedlings with their own shallow roots, so the field is not empty
    [[980, .8], [1330, .65], [640, .55]].forEach(function (sd) {
      var bx = sd[0], sc = sd[1], sg2 = el('g', { transform: 'translate(' + bx + ',' + GROUND + ') scale(' + sc + ')' }, cam);
      el('path', { d: 'M0,4C4,90 -6,170 10,260M2,90C30,120 50,150 60,200M-2,140C-30,170 -40,210 -48,250', fill: 'none', stroke: '#b99a70', 'stroke-width': 6, 'stroke-linecap': 'round' }, sg2);
      el('path', { d: 'M0,4C4,90 -6,170 10,260M2,90C30,120 50,150 60,200M-2,140C-30,170 -40,210 -48,250', fill: 'none', stroke: '#f1e2c4', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, sg2);
      el('path', { d: 'M0,2C-3,-40 3,-80 0,-120', fill: 'none', stroke: '#6f9f45', 'stroke-width': 5, 'stroke-linecap': 'round' }, sg2);
      el('path', { d: 'M0,-110C20,-140 52,-138 64,-120C44,-104 18,-100 0,-110Z', fill: '#8cbc5e' }, sg2);
      el('path', { d: 'M0,-100C-20,-130 -52,-128 -62,-108C-42,-94 -18,-92 0,-100Z', fill: '#7fb055' }, sg2);
    });
    var plant = el('g', {}, cam), stemTop = el('g', {}, plant);
    el('path', { d: 'M' + PX + ',' + (GROUND + 2) + 'C' + (PX + 8) + ',250 ' + (PX - 10) + ',160 ' + (PX - 4) + ',50', fill: 'none', stroke: '#6f9f45', 'stroke-width': 9, 'stroke-linecap': 'round' }, stemTop);
    /* trifoliate leaves on short petioles, alternating sides */
    var leaves = [];
    [[270, 1, 1.15], [222, -1, 1.1], [172, 1, 1], [124, -1, .88], [84, 1, .72], [56, -1, .5]].forEach(function (n, ni) {
      var side = n[1], sx = PX - 4 + (GROUND - n[0]) * -.02, sy = n[0], tipX = sx + side * 34 * n[2], tipY = sy - 16 * n[2];
      el('path', { d: 'M' + f1(sx) + ',' + sy + 'Q' + f1(sx + side * 18 * n[2]) + ',' + f1(sy - 2) + ' ' + f1(tipX) + ',' + f1(tipY), fill: 'none', stroke: '#6f9f45', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, stemTop);
      [22, 68, 114].forEach(function (deg, k) {
        var ang = side * deg, len = (k === 1 ? 66 : 54) * n[2];
        var lf = el('g', { transform: 'translate(' + f1(tipX) + ',' + f1(tipY) + ') rotate(' + ang + ')' }, stemTop);
        var body = el('path', { d: 'M0,0C' + f1(len * .36) + ',' + f1(-len * .2) + ' ' + f1(len * .32) + ',' + f1(-len * .84) + ' 0,' + f1(-len) + 'C' + f1(-len * .32) + ',' + f1(-len * .84) + ' ' + f1(-len * .36) + ',' + f1(-len * .2) + ' 0,0Z', fill: '#86b85a' }, lf);
        el('path', { d: 'M0,-3V' + f1(-len * .88), stroke: 'rgba(60,90,40,.45)', 'stroke-width': 1.4 }, lf);
        leaves.push({ g: lf, body: body, ang: ang, x: tipX, y: tipY, side: side, k: k });
      });
    });

    /* ---------- larvae ---------- */
    var PATH0 = sampler([[EM[0] + 6, EM[1] - 8], [560, 652], [700, 704], [860, 640], [1020, 694], [1180, 632], [1340, 684], [1480, 640], [1600, 652], [IS[0] - 8, IS[1] + 4], [IS[0] + 10, IS[1] - 16]]);
    function loopPath(cx, cy, rx, ry, ph) { var p = []; for (var k = 0; k <= 12; k++) { var a = k / 12 * Math.PI * 2 + ph; p.push([cx + Math.cos(a) * rx + Math.sin(a * 3) * 18, cy + Math.sin(a) * ry]); } return sampler(p); }
    function larva(parent) {
      var g = el('g', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, parent);
      return { g: g, o: el('path', { stroke: '#c46a22', 'stroke-width': 9.5 }, g), b: el('path', { stroke: '#f6a445', 'stroke-width': 7 }, g),
        hl: el('path', { stroke: 'rgba(255,232,196,.65)', 'stroke-width': 1.6 }, g),
        eye: el('circle', { r: 2.7, fill: '#fff' }, g), pup: el('circle', { r: 1.35, fill: '#2a1712' }, g) };
    }
    var L0 = larva(larvaG), L1 = larva(larvaG), L2 = larva(larvaG);
    var LP1 = loopPath(640, 780, 150, 60, 0), LP2 = loopPath(330, 560, 130, 50, 2);
    function drawLarva(Lv, pathS, u, t, len, thick, visible, amp) {
      Lv.g.setAttribute('opacity', visible);
      if (!visible) return null;
      var pts = [], n = 16, step = len / pathS.len / n;
      for (var k = 0; k <= n; k++) {
        var q = pathS.at(u - k * step), wig = Math.sin(t * 7 - k * .75) * amp * Math.sin(Math.PI * k / n * .9 + .1);
        pts.push([q[0] - Math.sin(q[2]) * wig, q[1] + Math.cos(q[2]) * wig]);
      }
      var d = curve(pts);
      Lv.o.setAttribute('d', d); Lv.b.setAttribute('d', d); Lv.hl.setAttribute('d', curve(pts.slice(1, 9).map(function (p) { return [p[0], p[1] - thick * .22]; })));
      Lv.o.setAttribute('stroke-width', thick + 2.5); Lv.b.setAttribute('stroke-width', thick);
      var hd = pts[0], a = Math.atan2(pts[0][1] - pts[2][1], pts[0][0] - pts[2][0]);
      Lv.eye.setAttribute('cx', f1(hd[0] - Math.sin(a) * 1.2)); Lv.eye.setAttribute('cy', f1(hd[1] - thick * .15));
      Lv.pup.setAttribute('cx', f1(hd[0] + Math.cos(a) * 1 - Math.sin(a) * 1.2)); Lv.pup.setAttribute('cy', f1(hd[1] - thick * .15 + Math.sin(a) * .8));
      return pts;
    }

    /* ---------- ascaroside particles ---------- */
    var parts = [], MAX = 170;
    for (i = 0; i < MAX; i++) {
      var pg = el('g', { opacity: 0 }, partG);
      var kind = i % 2;
      el('circle', { r: 12, fill: kind ? 'url(#thGlowP)' : 'url(#thGlowB)' }, pg);
      el('circle', { r: 3.2, fill: kind ? '#ff7aa0' : '#6ea2ff', stroke: '#fff', 'stroke-width': .8 }, pg);
      el('circle', { cx: 4.2, cy: -2.6, r: 2.1, fill: kind ? '#ffb3c4' : '#a8c6ff' }, pg);
      parts.push({ g: pg, on: false, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, sc: 1 });
    }
    var nextP = 0;
    function emit(x, y, spread) {
      var p = parts[nextP]; nextP = (nextP + 1) % MAX;
      p.on = true; p.x = x + (Math.random() - .5) * spread; p.y = y + (Math.random() - .5) * spread;
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 2; p.age = 0; p.life = 9 + Math.random() * 6; p.sc = .75 + Math.random() * .55; p.rot = Math.random() * 360;
    }
    function prefill() {
      parts.forEach(function (p) { p.on = false; p.g.setAttribute('opacity', 0); });
      for (var k = 0; k < 150; k++) { var q = PATH0.at(.05 + Math.random() * .67); emit(q[0], q[1], 70); parts[(nextP + MAX - 1) % MAX].age = Math.random() * 7; }
    }

    /* ---------- stage timeline ---------- */
    var S = { from: 0, to: 0, t0: 0, dur: 1 }, s = 0, W = 0, Hh = 0;
    function stageAt(now) { var k = H.clamp((now - S.t0) / S.dur, 0, 1); return H.lerp(S.from, S.to, H.ease(k)); }
    function goStage(v, ms) { S = { from: s, to: v, t0: performance.now(), dur: H.reduced ? 1 : ms }; caption(v); if (!running) start(); }
    function larvaU(v) {
      if (v < 1) return 0;
      if (v < 1.3) return H.lerp(0, .02, (v - 1) / .3);
      if (v < 2) return H.lerp(.02, .72, H.smooth(1.3, 2, v));
      if (v < 2.35) return H.lerp(.72, .8, (v - 2) / .35);
      if (v < 3) return H.lerp(.8, 1, H.smooth(2.35, 3, v));
      return 1;
    }
    /* camera keyframes: world rect to fit, and where its centre sits on screen */
    function key(i, v) {
      if (i === 0) return [220, 40, 2200, 980, .52, .55];
      if (i === 1) return [230, 560, 760, 830, .57, .5];
      if (i === 2) { var lx = PATH0.at(larvaU(Math.min(v, 2.2)))[0]; return [lx - 520, 440, lx + 560, 880, .5, .5]; }
      if (i === 3) return [1590, 560, 1812, 704, .57, .5];
      return [1330, 20, 2430, 900, .6, .53];
    }
    function camera(v) {
      var a = Math.floor(H.clamp(v, 0, 3.999)), f = H.smooth(0, 1, v - a), A = key(a, v), B = key(Math.min(4, a + 1), v);
      function zc(R) { return [Math.min(W / (R[2] - R[0]), Hh / (R[3] - R[1])), (R[0] + R[2]) / 2, (R[1] + R[3]) / 2, R[4], R[5]]; }
      var za = zc(A), zb = zc(B);
      var z = Math.exp(H.lerp(Math.log(za[0]), Math.log(zb[0]), f));
      return [z, H.lerp(za[1], zb[1], f), H.lerp(za[2], zb[2], f), H.lerp(za[3], zb[3], f), H.lerp(za[4], zb[4], f)];
    }
    function toScreen(c, x, y) { return [c[3] * W + (x - c[1]) * c[0], c[4] * Hh + (y - c[2]) * c[0]]; }
    function caption(v) {
      var i = Math.round(v);
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      bars.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); });
      sec.classList.toggle('is-key', i === 2);
    }

    var running = false, vis = false, last = 0, t0 = performance.now(), toneDark = false;
    function start() { if (running || !vis) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function frame(now) {
      if (!vis) { running = false; return; }
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      s = stageAt(now);
      var c = camera(s);
      cam.setAttribute('transform', 'translate(' + f1(c[3] * W) + ',' + f1(c[4] * Hh) + ') scale(' + c[0].toFixed(4) + ') translate(' + f1(-c[1]) + ',' + f1(-c[2]) + ')');
      head.style.opacity = (1 - H.smooth(.08, .5, s)).toFixed(3);
      // nav tone follows what is under it
      var gTop = toScreen(c, 0, GROUND)[1], dark = gTop < 90;
      if (dark !== toneDark) { toneDark = dark; sec.setAttribute('data-tone', dark ? 'dark' : 'light'); dispatchEvent(new Event('scroll')); }

      // hatching
      var hatch = H.smooth(1, 1.35, s);
      eggs.forEach(function (e, k) { if (k < 3) e.curl.setAttribute('opacity', (1 - hatch).toFixed(2)); });
      // larvae
      var u = larvaU(s) + (s > 1.95 && s < 2.3 ? Math.sin(t * .8) * .004 : 0), inside = H.smooth(2.85, 3.05, s);
      var swell = H.smooth(3.1, 3.8, s), len = H.lerp(H.lerp(70, 44, inside), 26, swell), thick = H.lerp(H.lerp(7, 5, inside), 12, swell);
      var p0 = drawLarva(L0, PATH0, u, t, len, thick, s >= 1 ? 1 : 0, H.lerp(4.5, .6, inside));
      var wander = H.smooth(1.1, 1.5, s);
      var p1 = drawLarva(L1, LP1, (t * .018) % 1, t + 1, 60, 6.2, wander, 4);
      var p2 = drawLarva(L2, LP2, (t * .015 + .5) % 1, t + 2, 56, 6, wander, 4);
      sheath.setAttribute('opacity', (inside * .85).toFixed(2));
      L0.g.setAttribute('opacity', s >= 1 ? (1 - inside * .35).toFixed(2) : 0);
      // release: the key stage
      if (s > 1.35 && s < 3.05 && p0) {
        var rate = s < 2.9 ? 30 : 5;
        if (Math.random() < rate * dt) { var q = p0[6 + Math.floor(Math.random() * 8)]; emit(q[0], q[1], 8); }
      }
      if (s > 1.4 && wander > .5) {
        if (p1 && Math.random() < 4 * dt) { q = p1[8]; emit(q[0], q[1], 6); }
        if (p2 && Math.random() < 4 * dt) { q = p2[8]; emit(q[0], q[1], 6); }
      }
      var fade = s < 1.3 ? 3 : 1, focus = 1 + H.smooth(1.7, 2, s) * (1 - H.smooth(2.4, 2.8, s)) * .6;
      parts.forEach(function (p) {
        if (!p.on) return;
        p.age += dt * fade;
        if (p.age > p.life) { p.on = false; p.g.setAttribute('opacity', 0); return; }
        p.vx *= .985; p.vy *= .985; p.vx += (Math.random() - .5) * 6 * dt; p.vy += (Math.random() - .5) * 6 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        var a = Math.min(1, p.age * 2) * (1 - H.smooth(p.life * .6, p.life, p.age));
        p.g.setAttribute('opacity', a.toFixed(2));
        p.g.setAttribute('transform', 'translate(' + f1(p.x) + ',' + f1(p.y) + ') rotate(' + Math.round(p.rot + p.age * 12) + ') scale(' + (p.sc * focus).toFixed(2) + ')');
      });
      // infection and symptoms
      var gs = H.smooth(2.55, 3.05, s);
      gall.setAttribute('transform', 'translate(' + IS[0] + ',' + IS[1] + ') rotate(' + f1(tangent) + ') scale(' + (.3 + gs * .9).toFixed(3) + ')');
      gall.setAttribute('opacity', gs.toFixed(2));
      glow.setAttribute('opacity', (H.smooth(2.55, 3.1, s) * (.7 + Math.sin(t * 2.4) * .12)).toFixed(2));
      var ne = H.smooth(3.55, 3.95, s);
      newEggs.setAttribute('transform', 'translate(' + (IS[0] - 24) + ',' + (IS[1] + 12) + ') scale(' + ne.toFixed(3) + ')');
      var sick = H.smooth(3.2, 3.95, s);
      stemTop.setAttribute('transform', 'rotate(' + f1(sick * 7 + Math.sin(t * .9) * .6) + ' ' + PX + ' ' + GROUND + ')');
      leaves.forEach(function (lf, k) {
        var col = mix([134, 184, 90], k % 3 === 1 ? [214, 176, 70] : [201, 168, 78], sick);
        lf.body.setAttribute('fill', 'rgb(' + col.join(',') + ')');
        var droop = sick * (26 + lf.k * 10) * lf.side, sway = Math.sin(t * 1.2 + k) * 1.8;
        lf.g.setAttribute('transform', 'translate(' + f1(lf.x) + ',' + f1(lf.y) + ') rotate(' + f1(lf.ang + droop + sway) + ') scale(' + (1 - sick * .22).toFixed(3) + ')');
      });
      // labels for the two signals
      var cl = H.smooth(1.75, 2, s) * (1 - H.smooth(2.35, 2.7, s));
      chips.forEach(function (ch, k) {
        var w = PATH0.at(k ? .6 : .42), sp = toScreen(c, w[0], w[1] - 70 - k * 20);
        ch.style.transform = 'translate(' + Math.round(sp[0]) + 'px,' + Math.round(sp[1]) + 'px)';
        ch.style.opacity = cl.toFixed(2);
      });
      requestAnimationFrame(frame);
    }
    function mix(a, b, k) { return [Math.round(H.lerp(a[0], b[0], k)), Math.round(H.lerp(a[1], b[1], k)), Math.round(H.lerp(a[2], b[2], k))]; }
    function size() { W = svg.clientWidth || innerWidth; Hh = svg.clientHeight || innerHeight; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); }
    size(); addEventListener('resize', size);
    H.onView(sec, function (v) { vis = v; if (v) start(); });
    caption(0);

    var DUR = [0, 1500, 2600, 2000, 2100];
    H.scene('threat', {
      steps: 4, tall: 4.4,
      set: function (i) { S = { from: i, to: i, t0: 0, dur: 1 }; s = i; caption(i); if (i >= 2 && i < 3) prefill(); if (i < 1) parts.forEach(function (p) { p.on = false; p.g.setAttribute('opacity', 0); }); },
      step: function (i, dir) { var ms = DUR[dir > 0 ? i : i + 1] * (dir > 0 ? 1 : .7); goStage(i, ms); return ms; },
      ff: function () { S.t0 = 0; }
    });
  });
})();
