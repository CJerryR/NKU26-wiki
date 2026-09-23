/* Bridge 02 → 03 · "powers of ten": from China's farming regions to a field,
 * to a maize row, to nematodes in the soil. Each frame is its own 1600×900
 * drawing nested inside the previous one; the camera zooms in log space
 * around the fixed point between two frames, computed in double precision. */
(function () {
  'use strict';
  var NK = window.NK;
  if (!NK) return;

  /* Shared worm body: head at (x, y), body trailing opposite to `ang`. */
  NK.wormPath = function (x, y, ang, len, wid, t, speed, amp) {
    var n = 20;
    var top = [];
    var bot = [];
    var ca = Math.cos(ang);
    var sa = Math.sin(ang);
    function off(u) { return Math.sin(u * 2.3 * Math.PI - t * speed) * amp * (0.25 + 0.75 * u); }
    for (var i = 0; i <= n; i++) {
      var u = i / n;
      var sx = -u * len;
      var sy = off(u);
      var d = (off(Math.min(1, u + 0.02)) - off(Math.max(0, u - 0.02))) / 0.04;
      var nx = -d;
      var ny = -len;
      var nl = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= nl; ny /= nl;
      var w = wid * 0.5 * (u < 0.1 ? 0.62 + 3.8 * u : 0.14 + 0.86 * Math.pow(1 - (u - 0.1) / 0.9, 0.7));
      top.push([sx + nx * w, sy + ny * w]);
      bot.push([sx - nx * w, sy - ny * w]);
    }
    function P(p) { return (x + p[0] * ca - p[1] * sa).toFixed(1) + ' ' + (y + p[0] * sa + p[1] * ca).toFixed(1); }
    var s = 'M' + P(top[0]);
    for (i = 1; i <= n; i++) s += 'L' + P(top[i]);
    for (i = n; i >= 0; i--) s += 'L' + P(bot[i]);
    var hw = wid * 0.5 * 0.62;
    s += 'Q' + P([hw * 1.5, 0]) + ' ' + P(top[0]) + 'Z';
    return { d: s, head: { x: x, y: y + off(0) * ca, ang: ang } };
  };

  var sec = document.querySelector('[data-zoom]');
  if (!sec) return;
  /* The three.js version (home-zoom3d.js) owns the section when WebGL works;
   * it calls NK.zoom2d() if its deferred build fails. */
  if (NK.zoom3d) { NK.zoom2d = start2d; return; }
  start2d();

  function start2d() {
    var runway = sec.querySelector('[data-zoom-runway]');
    var stage = sec.querySelector('[data-zoom-stage]');
    var svg = sec.querySelector('[data-zoom-svg]');
    var steps = Array.prototype.slice.call(sec.querySelectorAll('[data-zoom-steps] li'));
    var geo = window.NKUHomeGeo;
    var R = NK.rng(88);

    /* ---- nest transforms (frame local → frame-A coordinates) ---- */
    var FOC = [
      { x: 1012.4, y: 334.5, w: 48 },   // in A: the Huang-Huai-Hai plain
      { x: 752, y: 443, w: 96 },        // in B: one maize field row
      { x: 842, y: 652, w: 176 }        // in C: around a root tip
    ];
    var N = [{ tx: 0, ty: 0, s: 1 }];
    FOC.forEach(function (f, i) {
      var p = N[i];
      N.push({ tx: p.tx + p.s * f.x, ty: p.ty + p.s * f.y, s: p.s * f.w / 1600 });
    });
    var RECT = N.map(function (n) { return { cx: n.tx + n.s * 800, cy: n.ty + n.s * 450, w: n.s * 1600 }; });

    function view(z) {
      var i = Math.min(2, Math.floor(z));
      var t = z - i;
      var a = RECT[i];
      var b = RECT[i + 1];
      var k = b.w / a.w;
      var px = (b.cx - k * a.cx) / (1 - k);
      var py = (b.cy - k * a.cy) / (1 - k);
      var kt = Math.pow(k, t);
      return { cx: px + (a.cx - px) * kt, cy: py + (a.cy - py) * kt, w: a.w * kt };
    }

    /* ---- drawing helpers ---- */
    var ns = 'http://www.w3.org/2000/svg';
    function frame(html, i) {
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'nk-zf nk-zf--' + i);
      g.innerHTML = html;
      svg.appendChild(g);
      return g;
    }
    function f1(v) { return v.toFixed(1); }

    /* frame A: China, main farming regions */
    var chinaD = geo && geo.zoomOutline ? geo.zoomOutline : '';
    function glow(lon, lat, r, o) {
      var x = 400 + ((lon - 72) * 8.5 + 19.5) * 1.6;
      var y = 50 + ((56 - lat) * 8.5 + 12) * 1.6;
      return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + r + '" fill="url(#nkz-glow)" opacity="' + o + '"/>';
    }
    var grat = '';
    for (var gx = 0; gx <= 1600; gx += 80) grat += 'M' + gx + ' 0V900';
    for (var gy = 0; gy <= 900; gy += 80) grat += 'M0 ' + gy + 'H1600';
    var A = frame(
      '<defs><radialGradient id="nkz-glow"><stop offset="0" stop-color="#f6c14b" stop-opacity=".75"/><stop offset="1" stop-color="#f6c14b" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="nkz-vig" cx="50%" cy="50%" r="70%"><stop offset=".55" stop-color="#140b1c" stop-opacity="0"/><stop offset="1" stop-color="#140b1c"/></radialGradient></defs>' +
      '<rect width="1600" height="900" fill="#140b1c"/><path d="' + grat + '" stroke="#2a1c38" stroke-width="1" fill="none"/>' +
      '<g transform="translate(400 50) scale(1.6)"><path d="' + chinaD + '" fill="#2a1a3d" stroke="#b99be0" stroke-width=".9" vector-effect="non-scaling-stroke"/></g>' +
      glow(126, 46.3, 70, 0.5) + glow(105, 30.6, 46, 0.45) + glow(115.6, 30.4, 52, 0.45) + glow(116.5, 35.6, 64, 0.95) +
      '<g class="nk-zf__lab" font-family="Spline Sans, sans-serif" fill="#f3e9f5"><text x="1086" y="318" font-size="20" font-weight="600">Huang-Huai-Hai Plain</text><text x="1086" y="342" font-size="15" fill="#cfc0d8">one of China\u2019s main farming regions</text><path d="M1040 340L1080 322" stroke="#f6c14b" stroke-width="1.5"/></g>' +
      '<rect x="1012.4" y="334.5" width="48" height="27" fill="none" stroke="#fff6e0" stroke-width="1.2" stroke-dasharray="3 3" class="nk-zf__mark"/>' +
      '<rect width="1600" height="900" fill="url(#nkz-vig)"/>', 0);

    /* frame B: patchwork fields seen from above */
    (function () {
      var cols = [0, 250, 520, 700, 900, 1130, 1380, 1600];
      var rows = [0, 200, 400, 520, 720, 900];
      var V = rows.map(function (y, r) {
        return cols.map(function (x, c) {
          var edge = c === 0 || c === cols.length - 1 || r === 0 || r === rows.length - 1;
          return [x + (edge ? 0 : (R() - 0.5) * 60), y + (edge ? 0 : (R() - 0.5) * 40)];
        });
      });
      V[2][3] = [690, 392]; V[2][4] = [912, 398]; V[3][3] = [694, 540]; V[3][4] = [906, 536];
      var fills = ['url(#nkz-p0)', 'url(#nkz-p1)', 'url(#nkz-p2)', 'url(#nkz-p3)', '#c9b979', '#a9bf78'];
      var s = '<defs>' +
        '<pattern id="nkz-p0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="14" height="14" fill="#9fb766"/><rect width="14" height="5" fill="#7f9d4f"/></pattern>' +
        '<pattern id="nkz-p1" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="12" height="12" fill="#d8c07a"/><rect width="12" height="3" fill="#c6a960"/></pattern>' +
        '<pattern id="nkz-p2" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect width="16" height="16" fill="#b5c97e"/><rect width="16" height="6" fill="#98b565"/></pattern>' +
        '<pattern id="nkz-p3" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(64)"><rect width="10" height="10" fill="#e2d39a"/><rect width="10" height="2.5" fill="#cbb77a"/></pattern>' +
        '<pattern id="nkz-maize" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#8fae5b"/><rect x="0" width="4.5" height="12" fill="#5f8a3d"/><circle cx="2.2" cy="3" r="2.1" fill="#6f9a48"/><circle cx="2.2" cy="9" r="2.1" fill="#6f9a48"/></pattern>' +
        '</defs><rect width="1600" height="900" fill="#cdbf88"/>';
      for (var r = 0; r < rows.length - 1; r++) {
        for (var c = 0; c < cols.length - 1; c++) {
          var q = [V[r][c], V[r][c + 1], V[r + 1][c + 1], V[r + 1][c]];
          var fill = r === 2 && c === 3 ? 'url(#nkz-maize)' : fills[(r * 3 + c * 5) % fills.length];
          s += '<path d="M' + q.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L') + 'Z" fill="' + fill + '" stroke="#efe4c4" stroke-width="7" stroke-linejoin="round"/>';
        }
      }
      s += '<path d="M0 604C300 590 620 640 920 600S1400 560 1600 590" fill="none" stroke="#e9dfc6" stroke-width="22"/>';
      s += '<path d="M180 0C210 240 160 520 240 900" fill="none" stroke="#8fb6c9" stroke-width="12" opacity=".85"/>';
      for (var i = 0; i < 26; i++) {
        var tx = R() * 1600;
        var ty = R() < 0.5 ? 590 + (R() - 0.5) * 60 : R() * 900;
        if (tx > 640 && tx < 960 && ty > 360 && ty < 560) continue;
        s += '<circle cx="' + f1(tx) + '" cy="' + f1(ty) + '" r="' + f1(10 + R() * 14) + '" fill="#4f6f3a" opacity=".9"/>';
      }
      s += '<rect x="752" y="443" width="96" height="54" fill="none" stroke="#fff6e0" stroke-width="1.6" stroke-dasharray="4 4" class="nk-zf__mark"/>';
      frame(s, 1);
    }());

    /* frame C: maize row in cross-section */
    (function () {
      var s = '<defs><linearGradient id="nkz-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ead3"/><stop offset="1" stop-color="#e8dab8"/></linearGradient>' +
        '<linearGradient id="nkz-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4f3c"/><stop offset="1" stop-color="#3f2c24"/></linearGradient></defs>' +
        '<rect width="1600" height="440" fill="url(#nkz-sky)"/>' +
        '<path d="M0 430C200 424 420 440 640 432S1100 424 1600 436V900H0Z" fill="url(#nkz-soil)"/>';
      for (var i = 0; i < 260; i++) {
        var x = R() * 1600;
        var y = 450 + R() * 450;
        s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + f1(2 + R() * 7) + '" ry="' + f1(1.5 + R() * 5) + '" fill="' + (R() < 0.5 ? '#5a4032' : '#8a6a52') + '" opacity=".7"/>';
      }
      [220, 540, 860, 1180, 1480].forEach(function (px, k) {
        var h = 300 + (k % 2) * 30;
        var top = 430 - h;
        s += '<path d="M' + px + ' 432C' + (px + 4) + ' ' + (430 - h * 0.5) + ' ' + (px - 4) + ' ' + (top + 40) + ' ' + px + ' ' + top + '" stroke="#6f8f45" stroke-width="10" fill="none" stroke-linecap="round"/>';
        for (var j = 0; j < 7; j++) {
          var ly = 420 - j * (h / 7.5);
          var side = j % 2 ? 1 : -1;
          var len = 150 - j * 12;
          s += '<path d="M' + px + ' ' + f1(ly) + 'C' + (px + side * len * 0.45) + ' ' + f1(ly - 70) + ' ' + (px + side * len * 0.9) + ' ' + f1(ly - 50) + ' ' + (px + side * len) + ' ' + f1(ly + 10) + '" stroke="' + (j % 3 ? '#7fa653' : '#6b9446') + '" stroke-width="' + (13 - j) + '" fill="none" stroke-linecap="round"/>';
        }
        s += '<path d="M' + px + ' ' + top + 'l-14-34M' + px + ' ' + top + 'l0-40M' + px + ' ' + top + 'l14-32" stroke="#c9a85c" stroke-width="4" stroke-linecap="round"/>';
        for (var r = 0; r < 9; r++) {
          var ang = -0.9 + r * 0.22 + (R() - 0.5) * 0.1;
          var rl = 220 + R() * 200;
          var ex = px + Math.sin(ang) * rl;
          var ey = 432 + Math.cos(ang) * rl;
          s += '<path d="M' + px + ' 434Q' + f1(px + Math.sin(ang) * rl * 0.4 + (R() - 0.5) * 40) + ' ' + f1(432 + Math.cos(ang) * rl * 0.55) + ' ' + f1(ex) + ' ' + f1(ey) + '" stroke="#e4d3b0" stroke-width="' + f1(3.5 - r * 0.2) + '" fill="none" stroke-linecap="round" opacity=".92"/>';
        }
      });
      s += '<path d="M860 432Q902 560 930 700" stroke="#efe0bf" stroke-width="5" fill="none" stroke-linecap="round"/>';
      s += '<g fill="#f2b37a" opacity=".85"><circle cx="908" cy="712" r="3"/><circle cx="946" cy="690" r="2.6"/><circle cx="925" cy="730" r="2.4"/></g>';
      s += '<rect x="842" y="652" width="176" height="99" fill="none" stroke="#fff6e0" stroke-width="2" stroke-dasharray="5 5" class="nk-zf__mark"/>';
      frame(s, 2);
    }());

    /* frame D: soil close-up with J2 juveniles */
    var worms = [];
    var Dg = (function () {
      var s = '<defs><radialGradient id="nkz-dvig" cx="55%" cy="45%" r="75%"><stop offset=".45" stop-color="#1b1113" stop-opacity="0"/><stop offset="1" stop-color="#1b1113" stop-opacity=".85"/></radialGradient>' +
        '<radialGradient id="nkz-cy"><stop offset="0" stop-color="#5ff0d6" stop-opacity=".9"/><stop offset="1" stop-color="#5ff0d6" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="1600" height="900" fill="#3a2922"/>';
      for (var i = 0; i < 70; i++) {
        var cx = R() * 1700 - 50;
        var cy = R() * 1000 - 50;
        var rr = 30 + Math.pow(R(), 1.6) * 120;
        var pts = [];
        for (var k = 0; k < 9; k++) {
          var a = k / 9 * Math.PI * 2;
          var q = rr * (0.8 + R() * 0.35);
          pts.push(f1(cx + Math.cos(a) * q) + ' ' + f1(cy + Math.sin(a) * q * 0.8));
        }
        var col = ['#6b5040', '#7d604c', '#58402f', '#8f735b', '#4c372b'][(R() * 5) | 0];
        s += '<path d="M' + pts.join('L') + 'Z" fill="' + col + '" stroke="#2a1d18" stroke-width="3" stroke-linejoin="round"/>';
      }
      s += '<g fill="#9cc3d4" opacity=".16"><ellipse cx="640" cy="520" rx="260" ry="70"/><ellipse cx="1060" cy="360" rx="200" ry="60"/><ellipse cx="420" cy="260" rx="160" ry="40"/></g>';
      s += '<path d="M1330 -20C1300 180 1240 330 1150 470C1120 520 1060 540 1020 520C1060 470 1100 400 1150 250C1190 130 1210 40 1210 -20Z" fill="#efdfc0" stroke="#c9ad83" stroke-width="3"/>';
      s += '<g stroke="#efdfc0" stroke-width="2.4" stroke-linecap="round" opacity=".8"><path d="M1236 90l60-30M1222 160l64-24M1204 230l62-16M1180 300l58-8M1150 360l50 6M1194 120l-56-26M1176 200l-58-20M1150 280l-56-10"/></g>';
      for (i = 0; i < 26; i++) s += '<circle cx="' + f1(700 + R() * 520) + '" cy="' + f1(300 + R() * 420) + '" r="' + f1(10 + R() * 16) + '" fill="url(#nkz-cy)" class="nk-zf__sig" style="--d:' + (R() * 3).toFixed(2) + 's"/>';
      s += '<g class="nk-zf__worms"></g><rect width="1600" height="900" fill="url(#nkz-dvig)"/>';
      var g = frame(s, 3);
      var wg = g.querySelector('.nk-zf__worms');
      [[880, 520, -0.5, 190, 26, 3.2], [720, 640, -0.25, 170, 24, 2.6], [1000, 690, -1.1, 160, 22, 3.6], [560, 420, 0.15, 150, 21, 2.9]].forEach(function (w) {
        var p = document.createElementNS(ns, 'path');
        p.setAttribute('class', 'nk-zf__j2');
        wg.appendChild(p);
        worms.push({ el: p, a: w });
      });
      return g;
    }());

    var frames = Array.prototype.slice.call(svg.querySelectorAll('.nk-zf'));
    var labA = A.querySelector('.nk-zf__lab');

    function zOf(q) {
      var segs = [[0.1, 0.36, 0, 1], [0.44, 0.66, 1, 2], [0.72, 0.9, 2, 3]];
      if (q <= segs[0][0]) return 0;
      for (var i = 0; i < segs.length; i++) {
        var s = segs[i];
        if (q < s[0]) return s[2];
        if (q <= s[1]) return s[2] + NK.easeInOut((q - s[0]) / (s[1] - s[0]));
      }
      return 3;
    }
    var BG = ['#140b1c', '#cdbf88', '#e8dab8', '#3a2922'];
    function render(t) {
      var r = runway.getBoundingClientRect();
      var span = Math.max(1, runway.offsetHeight - window.innerHeight);
      var q = NK.clamp(-r.top / span, 0, 1);
      var z = NK.clamp(zOf(q), 0, 2.99999);
      var v = view(z);
      var s = 1600 / v.w;
      var ox = v.cx - v.w / 2;
      var oy = v.cy - v.w * 450 / 1600;
      frames.forEach(function (g, i) {
        var n = N[i];
        var sc = n.s * s;
        var op = i === 0 ? 1 : NK.smooth(i - 0.5, i - 0.06, z);
        var vis = sc > 0.002 && sc < 80 && op > 0.001;
        g.style.display = vis ? '' : 'none';
        if (!vis) return;
        g.setAttribute('transform', 'translate(' + ((n.tx - ox) * s).toFixed(3) + ' ' + ((n.ty - oy) * s).toFixed(3) + ') scale(' + sc.toPrecision(6) + ')');
        g.style.opacity = op.toFixed(3);
      });
      if (labA) labA.style.opacity = String(1 - NK.smooth(0.05, 0.3, z));
      var lvl = Math.round(z);
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === lvl); });
      stage.style.setProperty('--zbg', BG[lvl]);
      stage.classList.toggle('is-light', lvl === 1 || lvl === 2);
      stage.style.setProperty('--qo', NK.smooth(0.88, 0.96, q).toFixed(3));
      if (z > 2.2) {
        worms.forEach(function (w) {
          var a = w.a;
          var drift = NK.reduced ? 0 : Math.sin(t * 0.3 + a[0]) * 12;
          w.el.setAttribute('d', NK.wormPath(a[0] + drift, a[1], a[2], a[3], a[4], NK.reduced ? 0 : t, a[5], 9).d);
        });
      }
    }
    render(0);
    NK.loopWhileVisible(stage, render, '60px 0px');
  }
}());
