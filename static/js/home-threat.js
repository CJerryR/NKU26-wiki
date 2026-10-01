/* NKU homepage v6.1 — 05 the hidden threat (restored in v7.4 at the team's request).
 * Four blocks of the same patch of soil, one per stage of the infection:
 * finding a host, releasing ascarosides (the step this project is about),
 * invading the root, yellowing above ground. The pager shows all four, then
 * one stage per scroll. The lens enlarges the same spot of the same block:
 * a scaled copy of the scene plus details only visible up close (the J2's
 * stylet, ascr#3 / ascr#18, giant cells, a female and her egg mass). Since
 * v7.8 the lens is liquid glass (see GLASS below).
 * Drawn in code; structures and sizes are simplified illustrations. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  var ZOOM = 2.5, LR = 58;
  /* v7.8: the lens is liquid glass, with the parameters the team tuned in the
   * LiquidGlassLens demo on a round 200 px lens: index 2.20, thickness 90,
   * bezel 39, centre zoom 0.33, dispersion 0.03, frost 0.4. Lengths are scaled
   * from that lens to this one, so it looks the same at any size. The scene is
   * magnified as vectors (sharp at any pixel density) and the glass's centre
   * zoom is folded into ZOOM, so the centre is still 2.5x; the displacement map
   * carries only the rim's refraction, scaled by 1 / (1 - zoom) to match.
   * (Baking the zoom into the 8-bit map stair-stepped the magnified detail.)
   * An 8-bit map still steps the rim's lines at these strong settings, so the
   * rim is bent twice: by a coarse map, then by a fine map holding what the
   * coarse one rounded off (about 250x finer). The fine map fades out at the
   * very edge, where the bend changes too fast for rounding to show and the
   * correction would only add speckle. One filter serves all four blocks:
   * only the focused block's lens is ever shown.
   * SVG filters on SVG content refract in every browser, not only Chromium. */
  var GLASS = { ior: 2.2, thickness: 90, bezel: 39, zoom: 0.33, dispersion: 0.03, blur: 0.4, saturate: 1.35, tunedAt: 200 };
  var lensMap = null;
  function lensGlass() {
    if (lensMap) return lensMap;
    var g = 2 * LR / GLASS.tunedAt, T = GLASS.thickness * g, Bz = Math.min(GLASS.bezel * g, LR);
    var RES = 4, D = 2 * LR * RES, N = 128, eps = 1e-3, i, x, y;
    var sq = function (t) { return Math.pow(1 - Math.pow(1 - t, 4), 0.25); };   // squircle cross-section
    var prof = new Float32Array(N);
    for (i = 0; i < N; i++) {   // Snell's law along the bezel
      var t = i / (N - 1), a = Math.max(0, t - eps), b = Math.min(1, t + eps);
      var inc = Math.atan((sq(b) - sq(a)) / (b - a) * (T / Bz));
      prof[i] = sq(t) * T * Math.tan(inc - Math.asin(Math.sin(inc) / GLASS.ior));
    }
    var at = function (d) {   // the profile, read between its samples
      var u = Math.max(0, Math.min(N - 1, d / Bz * (N - 1))), i0 = Math.min(N - 2, Math.floor(u)), f = u - i0;
      return prof[i0] * (1 - f) + prof[i0 + 1] * f;
    };
    var vx = new Float32Array(D * D), vy = new Float32Array(D * D), slope = new Float32Array(D * D), max = 0;
    for (y = 0; y < D; y++) for (x = 0; x < D; x++) {
      var px = (x + 0.5) / RES - LR, py = (y + 0.5) / RES - LR, l = Math.sqrt(px * px + py * py), d = LR - l;
      if (d < 0 || d >= Bz || !l) continue;
      var m = at(d), k = y * D + x;
      vx[k] = -px / l * m; vy[k] = -py / l * m;   // the convex rim pulls light inwards
      slope[k] = Math.abs(at(d + 1 / RES) - m);   // how fast the bend changes per map pixel
      max = Math.max(max, Math.abs(vx[k]), Math.abs(vy[k]));
    }
    /* coarse byte + fine byte: the fine map carries the coarse one's rounding error */
    var S = max ? max * 2 / (1 - GLASS.zoom) * 255 / 254 : 0, Sf = S / 254, to = 1 / (1 - GLASS.zoom);
    var mk = function () { var c = document.createElement('canvas'); c.width = c.height = D; var x2 = c.getContext('2d'); return { c: c, x: x2, img: x2.createImageData(D, D) }; };
    var A = mk(), F = mk(), level = S / 255, keep = 1, split = function (v, q, o) {
      var b = S ? Math.round(127.5 + v * to / S * 255) : 128;   // coarse byte
      var r = v * to - S * (b / 255 - 0.5);                       // what it rounded off
      A.img.data[q + o] = b;
      F.img.data[q + o] = Sf ? Math.max(0, Math.min(255, Math.round(127.5 + keep * r / Sf * 255))) : 128;
    };
    for (var j = 0, q = 0; j < D * D; j++, q += 4) {
      /* full correction while the bend moves under one step per map pixel, none past two */
      keep = level ? Math.max(0, Math.min(1, 2 - slope[j] * to / level)) : 0;
      split(vx[j], q, 0); split(vy[j], q, 1);
      A.img.data[q + 2] = F.img.data[q + 2] = 128; A.img.data[q + 3] = F.img.data[q + 3] = 255;
    }
    A.x.putImageData(A.img, 0, 0); F.x.putImageData(F.img, 0, 0);
    lensMap = { url: A.c.toDataURL('image/png'), fine: F.c.toDataURL('image/png'), scale: S, fineScale: Sf, blur: GLASS.blur * g };
    return lensMap;
  }
  function lensFilter() {
    var gm = lensGlass(), box = 'x="' + (-LR) + '" y="' + (-LR) + '" width="' + 2 * LR + '" height="' + 2 * LR + '"', f = '', ch = ['r', 'g', 'b'];
    f += '<filter id="th-lensfx" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" ' + box + ' color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + gm.blur.toFixed(3) + '" result="soft"/>' +
      '<feImage href="' + gm.url + '" ' + box + ' preserveAspectRatio="none" result="map"/>' +
      '<feImage href="' + gm.fine + '" ' + box + ' preserveAspectRatio="none" result="fine"/>';
    ch.forEach(function (c, i) {   // RGB bend by slightly different amounts: dispersion
      var d = 1 + (i - 1) * GLASS.dispersion;
      f += '<feDisplacementMap in="soft" in2="map" scale="' + (gm.scale * d).toFixed(3) + '" xChannelSelector="R" yChannelSelector="G" data-fx="' + d + '" result="c' + c + '"/>' +
        '<feDisplacementMap in="c' + c + '" in2="fine" scale="' + (gm.fineScale * d).toFixed(4) + '" xChannelSelector="R" yChannelSelector="G" data-fx="' + d + '" data-fine result="d' + c + '"/>' +
        '<feColorMatrix in="d' + c + '" type="matrix" values="' + ['1 0 0 0 0  0 0 0 0 0  0 0 0 0 0', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0'][i] + '  0 0 0 1 0" result="' + c + '"/>';
    });
    f += '<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen" result="glass"/>' +
      '<feColorMatrix in="glass" type="saturate" values="' + GLASS.saturate + '"/></filter>';
    return f;
  }
  function lensDefs(k) {
    return '<clipPath id="th-lensclip-' + k + '"><circle r="' + LR + '"/></clipPath>' +
      '<filter id="th-lensshade-' + k + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
      // rim light: bright where the light comes from, a fainter back rim opposite
      '<linearGradient id="th-lensrim-' + k + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + (-LR) + '" x2="0" y2="' + LR + '" data-lensrim><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".32" stop-color="#fff" stop-opacity="0"/><stop offset=".68" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>' +
      '<radialGradient id="th-lensglow-' + k + '" gradientUnits="userSpaceOnUse" cx="0" cy="' + (-LR * 1.1) + '" r="' + (LR * 1.3) + '"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".65" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  }
  var STAGES = [
    { n: 1, t: 'Finding a host', p: 'Second-stage juveniles (J2) hatch from eggs in the soil and swim through water films toward the chemicals leaking from root tips.', hot: [228, 250] },
    { n: 2, t: 'Releasing ascarosides', p: 'While they move and gather, nematodes release ascarosides such as ascr#3 and ascr#18. These small molecules linger in the soil around the roots. They are the clue NemaKlear is designed to read.', hot: [182, 226], key: true },
    { n: 3, t: 'Invading the root', p: 'A juvenile pierces the root near its tip, settles inside and turns nearby cells into giant feeding cells. The root swells into knots called galls.', hot: [210, 203] },
    { n: 4, t: 'Yellowing above ground', p: 'With galled roots the plant takes up less water and nutrients. Leaves yellow and wilt, easily mistaken for drought, while the next generation of eggs goes back into the soil.', hot: [226, 238] }
  ];

  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var ROOT_MAIN = 'M206 121C204 150 212 170 208 200S216 240 214 262';
  var LAT = ['M207 150C190 160 170 168 150 190C140 200 128 206 118 222', 'M208 165C226 172 246 182 262 204C272 216 280 226 292 236', 'M209 205C196 214 184 226 176 246', 'M211 222C226 230 238 244 246 262', 'M150 190C146 206 146 222 140 238', 'M262 204C270 220 268 236 274 252'];
  var LAT_SHORT = ['M207 150C192 158 178 166 166 182', 'M208 165C224 172 238 180 248 194', 'M209 205C200 212 192 222 188 234', 'M211 222C222 228 230 238 234 250'];
  function soil() {
    var r = rnd(4242), s = '', i;
    s += '<path d="M340 120L384 90V270L340 300Z" fill="url(#th-right)"/>';
    s += '<path d="M40 120L84 90H384L340 120Z" fill="url(#th-top)"/>';
    s += '<rect x="40" y="120" width="300" height="180" fill="url(#th-front)"/>';
    s += '<g fill="none" stroke-linecap="round"><path d="M40 164C110 156 210 176 340 160" stroke="rgba(38,24,18,.34)" stroke-width="2"/><path d="M40 214C140 206 240 228 340 210" stroke="rgba(38,24,18,.3)" stroke-width="1.6"/><path d="M40 262C120 254 230 276 340 258" stroke="rgba(214,186,146,.22)" stroke-width="2.4"/>';
    s += '<path d="M340 160L384 132M340 210L384 184M340 258L384 232" stroke="rgba(20,12,9,.35)" stroke-width="1.4"/></g>';
    var peb = ['#8b6f58', '#76604e', '#b59a7f', '#9c7f63', '#5e4636', '#c8b095'];
    for (i = 0; i < 30; i++) {
      var x = 50 + r() * 282, y = 150 + Math.pow(r(), .7) * 144, rx = 2.4 + Math.pow(r(), 2) * (5 + (y - 150) / 18), ry = rx * (.55 + r() * .3);
      s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" transform="rotate(' + Math.round(r() * 180) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + peb[(r() * peb.length) | 0] + '" stroke="rgba(30,20,14,.45)" stroke-width=".8"/>';
    }
    s += '<g fill="rgba(240,220,190,.28)">';
    for (i = 0; i < 70; i++) s += '<circle cx="' + (42 + r() * 296).toFixed(1) + '" cy="' + (122 + r() * 176).toFixed(1) + '" r="' + (.5 + r() * .9).toFixed(2) + '"/>';
    s += '</g><g fill="rgba(20,12,8,.35)">';
    for (i = 0; i < 50; i++) s += '<circle cx="' + (42 + r() * 296).toFixed(1) + '" cy="' + (122 + r() * 176).toFixed(1) + '" r="' + (.6 + r() * 1.1).toFixed(2) + '"/>';
    s += '</g><g fill="rgba(255,240,215,.2)">';
    for (i = 0; i < 40; i++) { var tx = 90 + r() * 280, ty = 93 + r() * 25; s += '<ellipse cx="' + (tx - (ty - 93) * 1.4).toFixed(1) + '" cy="' + ty.toFixed(1) + '" rx="' + (1 + r() * 2.4).toFixed(1) + '" ry="' + (.6 + r()).toFixed(1) + '"/>'; }
    s += '</g><g stroke="#86a35b" stroke-width="1.3" stroke-linecap="round">';
    for (i = 0; i < 26; i++) { var gx = 46 + r() * 290; s += '<path d="M' + gx.toFixed(1) + ' 120l' + ((r() - .5) * 5).toFixed(1) + ' -' + (3 + r() * 6).toFixed(1) + '"/>'; }
    return s + '</g>';
  }
  function roots(kind) {
    var lat = kind === 4 ? LAT_SHORT : LAT, s = '<g fill="none" stroke-linecap="round" class="th-roots">';
    lat.forEach(function (d) { s += '<path d="' + d + '" stroke="#6e5240" stroke-width="3.8"/>'; });
    s += '<path d="' + ROOT_MAIN + '" stroke="#6e5240" stroke-width="6.6"/>';
    lat.forEach(function (d) { s += '<path d="' + d + '" stroke="' + (kind >= 3 ? '#dfc2a0' : '#e2cfa8') + '" stroke-width="2.2"/>'; });
    s += '<path d="' + ROOT_MAIN + '" stroke="' + (kind >= 3 ? '#e2c0a0' : '#e6d4ae') + '" stroke-width="4.4"/>';
    s += '<path d="' + ROOT_MAIN + '" stroke="rgba(255,248,230,.55)" stroke-width="1.2" transform="translate(-1 0)"/></g>';
    var hairs = '<g stroke="rgba(240,226,198,.5)" stroke-width=".5">';
    [[212, 244], [214, 250], [213, 238], [210, 232]].forEach(function (p, i) { hairs += '<path d="M' + p[0] + ' ' + p[1] + 'l' + (i % 2 ? 5 : -5) + ' ' + (i % 2 ? -2 : 2) + '"/>'; });
    return s + hairs + '</g>';
  }
  function gall(x, y, rx, ry, rot) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (rot || 0) + ' ' + x + ' ' + y + ')" fill="url(#th-gall)" stroke="#7c4a40" stroke-width="1"/>' +
      '<ellipse cx="' + (x - rx * .3) + '" cy="' + (y - ry * .35) + '" rx="' + (rx * .3) + '" ry="' + (ry * .22) + '" fill="rgba(255,240,228,.5)"/>';
  }
  function plant(kind) {
    var col = kind === 4 ? ['#a9913a', '#c9a23f', '#dcbf55'] : kind === 3 ? ['#7d9a4d', '#9cb462', '#aec372'] : ['#5f8f3e', '#7fae57', '#8cbc63'];
    var droop = kind === 4 ? .55 : kind === 3 ? .15 : 0;
    var stem = kind === 4 ? 'M206 121C207 104 204 88 214 70' : 'M206 121C207 100 204 80 208 56';
    var s = '<g class="th-plant"><path d="' + stem + '" fill="none" stroke="' + (kind === 4 ? '#8f8a45' : '#5b7f3a') + '" stroke-width="2.6" stroke-linecap="round"/>';
    var L = kind === 4 ? [[206.4, 106, -1, 28], [206.3, 96, 1, 29], [207, 86, -1, 24], [210, 76, 1, 18]] : [[206.4, 106, -1, 30], [206.2, 96, 1, 32], [205.6, 84, -1, 27], [207, 72, 1, 22], [208, 60, -1, 15]];
    L.forEach(function (l, i) {
      var len = l[3], a = l[2] * (62 + droop * 70 + i * 3), c = col[i % 3];
      s += '<g transform="translate(' + l[0] + ' ' + l[1] + ') rotate(' + a + ')"><path d="M0 0C' + (len * .42) + ' ' + (-len * .18) + ' ' + (len * .34) + ' ' + (-len * .86) + ' 0 ' + (-len) + 'C' + (-len * .34) + ' ' + (-len * .86) + ' ' + (-len * .42) + ' ' + (-len * .18) + ' 0 0Z" fill="' + c + '"/>' +
        '<path d="M0 -1V' + (-len * .9) + '" stroke="rgba(255,248,220,.35)" stroke-width=".7"/>' +
        (kind === 4 && i < 2 ? '<path d="M' + (len * .12) + ' ' + (-len * .5) + 'c3 -2 5 -1 6 1" stroke="#8a5a2a" stroke-width=".8" fill="none"/>' : '') + '</g>';
    });
    if (kind === 4) s += '<path d="M150 112c6-3 12-2 16 2c-6 3-12 2-16-2z" fill="#c9a23f" opacity=".85"/>';
    return s + '</g>';
  }
  function eggs(x, y, n, sc) {
    var r = rnd(Math.round(x * 7 + y)), s = '<g class="th-eggs">';
    for (var i = 0; i < n; i++) s += '<ellipse cx="' + (x + (r() - .5) * 14 * sc).toFixed(1) + '" cy="' + (y + (r() - .5) * 9 * sc).toFixed(1) + '" rx="' + (2.8 * sc).toFixed(1) + '" ry="' + (1.9 * sc).toFixed(1) + '" transform="rotate(' + Math.round(r() * 180) + ' ' + x + ' ' + y + ')" fill="#f3e6c8" stroke="#a88a63" stroke-width=".6"/>';
    return s + '</g>';
  }
  var jid = 0;
  function j2(x, y, ang, len, cls) {
    jid++;
    return '<g class="th-j2 ' + (cls || '') + '" data-j2="' + [x, y, ang, len, (jid * 1.7) % 6].join(' ') + '"><path class="th-j2__o" d=""/><path class="th-j2__b" d=""/><circle class="th-j2__h" r="1.5" cx="' + x + '" cy="' + y + '"/></g>';
  }
  function wormD(x, y, ang, len, ph, amp) {
    var d = '', dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    for (var i = 0; i <= 14; i++) {
      var u = i / 14, w = Math.sin(u * Math.PI * 2.3 + ph) * amp * Math.pow(u, .7);
      d += (i ? 'L' : 'M') + (x - dx * len * u + nx * w).toFixed(1) + ' ' + (y - dy * len * u + ny * w).toFixed(1);
    }
    return d;
  }
  function mols(cx, cy, n, seed) {
    var r = rnd(seed), s = '<g class="th-mols">';
    for (var i = 0; i < n; i++) {
      var a = r() * 6.283, d = 8 + r() * 46, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .8;
      s += '<circle class="th-mol" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (1.5 + r() * 1.2).toFixed(1) + '" fill="' + (i % 2 ? '#4c8dff' : '#ff5e86') + '" style="--dx:' + (Math.cos(a) * 9).toFixed(1) + 'px;--dy:' + (Math.sin(a) * 7).toFixed(1) + 'px;--d:' + (r() * 3).toFixed(2) + 's"/>';
    }
    return s + '</g>';
  }
  function pill(x, y, text, fs) {
    fs = fs || 4.2;
    var w = text.length * fs * .56 + fs * 1.6;
    return '<g class="th-pill"><rect x="' + x + '" y="' + (y - fs * 1.1).toFixed(2) + '" width="' + w.toFixed(1) + '" height="' + (fs * 1.75).toFixed(1) + '" rx="' + (fs * .87).toFixed(1) + '" fill="rgba(24,14,12,.84)"/><text x="' + (x + fs * .8).toFixed(1) + '" y="' + (y + fs * .25).toFixed(1) + '" font-size="' + fs + '" fill="#fff4dc">' + text + '</text></g>';
  }
  function lead(x1, y1, x2, y2) { return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="#fff4dc" stroke-width=".35" fill="none"/>'; }
  function ascr(x, y, chain, col, sc) {
    var s = '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')" fill="none" stroke="' + col + '" stroke-linecap="round" stroke-linejoin="round"><path d="M6.1 3.5L0 7-6.1 3.5V-3.5L0-7 6.1-3.5Z" stroke-width="1.8"/><circle cx="-6.1" cy="-3.5" r="1.4" fill="' + col + '" stroke="none"/><circle cx="0" cy="7" r="1.4" fill="' + col + '" stroke="none"/><path d="M6.1-3.5';
    for (var i = 1; i <= chain; i++) s += 'L' + (6.1 + i * 4) + ' ' + (i % 2 ? -7 : -3.5);
    return s + '" stroke-width="1.6"/><circle cx="' + (6.1 + chain * 4 + 2) + '" cy="' + (chain % 2 ? -7.6 : -3) + '" r="1.5" fill="' + col + '" stroke="none"/></g>';
  }

  function sceneContent(k) {
    var s = soil();
    if (k === 1) {
      s += '<circle cx="214" cy="262" r="42" fill="url(#th-exud)" class="th-pulse"/>' + roots(1);
      s += eggs(96, 266, 9, 1) + '<ellipse cx="96" cy="266" rx="14" ry="9" fill="none" stroke="rgba(243,230,200,.35)" stroke-dasharray="1.5 2"/>';
      s += j2(236, 250, -2.75, 30, 'is-hot') + j2(150, 244, .15, 28) + j2(270, 290, -2.3, 26) + j2(112, 262, .6, 18, 'is-small');
    }
    if (k === 2) {
      s += '<circle cx="190" cy="228" r="58" fill="url(#th-cyan)" class="th-pulse"/>' + roots(2) + mols(188, 228, 34, 77);
      s += j2(184, 228, -.25, 30, 'is-hot') + j2(236, 250, -2.75, 28) + j2(162, 202, .9, 26);
      s += '<circle cx="184" cy="228" r="10" class="th-ring"/><circle cx="184" cy="228" r="10" class="th-ring th-ring--2"/>';
      s += '<g class="th-chips"><rect x="262" y="138" width="44" height="15" rx="7.5" fill="#4c8dff"/><text x="284" y="148.6" text-anchor="middle">ascr#3</text><rect x="262" y="158" width="48" height="15" rx="7.5" fill="#ff5e86"/><text x="286" y="168.6" text-anchor="middle">ascr#18</text></g>';
    }
    if (k === 3) {
      s += roots(3) + gall(209, 203, 8.5, 6.5, 80) + gall(158, 184, 6.5, 5, 30) + gall(250, 190, 7, 5.2, -35) + gall(212, 243, 6, 4.8, 85);
      s += j2(216, 257, -1.95, 26, 'is-in') + j2(128, 250, .3, 24) + '<circle cx="215" cy="255" r="3" fill="rgba(120,40,30,.55)"/>';
    }
    if (k === 4) {
      s += '<circle cx="214" cy="220" r="70" fill="url(#th-red)" class="th-pulse th-pulse--slow"/>' + roots(4);
      s += gall(208, 186, 9, 7, 80) + gall(174, 170, 7, 5.5, 30) + gall(236, 184, 7.5, 5.5, -35) + gall(212, 232, 10, 7.5, 85) + gall(196, 222, 6, 4.8, 40) + gall(228, 244, 8, 6, -20);
      s += '<ellipse cx="236" cy="240" rx="5.5" ry="4" fill="#9b6a42" stroke="#6b4428" stroke-width=".6"/><ellipse cx="186" cy="176" rx="4.5" ry="3.4" fill="#9b6a42" stroke="#6b4428" stroke-width=".6"/>';
      s += eggs(252, 262, 6, .9) + eggs(160, 250, 5, .9) + eggs(118, 214, 4, .9);
    }
    return s + plant(k) + '<path d="M40 120H340M340 120L384 90" stroke="rgba(255,240,210,.28)" stroke-width="1" fill="none"/>';
  }
  function microContent(k) {
    var s = '';
    if (k === 1) {
      s += '<g stroke="#b99a70" stroke-width=".35" fill="rgba(240,222,190,.35)"><ellipse cx="213" cy="262" rx="2.4" ry="1.6"/><ellipse cx="216" cy="263" rx="2" ry="1.4"/><ellipse cx="211" cy="264.5" rx="2" ry="1.3"/><ellipse cx="214.5" cy="265.5" rx="1.8" ry="1.2"/></g>';
      s += '<path d="M236.2 249.6L240.4 248.1" stroke="#5a2d14" stroke-width=".5" stroke-linecap="round"/><g stroke="#c96a2a" stroke-width=".25"><path d="M241 250.5l1 1.6M244 251.2l1 1.6M247 252.4l.9 1.6M250 253.8l.9 1.6"/></g>';
      s += lead(240.5, 248, 244, 240) + pill(244, 240, 'stylet') + lead(252, 255, 257, 262) + pill(257, 262, 'J2 juvenile') + lead(215, 266, 205, 274) + pill(178, 274, 'root cap cells');
      s += '<g fill="rgba(255,236,190,.8)"><circle cx="222" cy="258" r=".6"/><circle cx="226" cy="262" r=".5"/><circle cx="220" cy="266" r=".55"/><circle cx="229" cy="256" r=".45"/></g>' + pill(216, 250, 'root exudates', 3.6);
    }
    if (k === 2) {
      s += ascr(173, 216, 3, '#7fb0ff', .42) + ascr(190, 238, 5, '#ff8fab', .42) + ascr(196, 214, 3, '#7fb0ff', .3) + ascr(168, 238, 5, '#ff8fab', .3);
      s += pill(160, 207, 'ascr#3') + pill(194, 250, 'ascr#18') + pill(163, 262, 'sugar ring + fatty side chain', 3.4);
    }
    if (k === 3) {
      s += '<g stroke="#7c4a40" stroke-width=".45" fill="#f1c9b4">';
      [[205, 200, 4.2], [212.5, 199, 3.6], [208, 206.5, 3.8], [214.5, 206, 3]].forEach(function (c) {
        var p = ''; for (var i = 0; i < 7; i++) { var a = i / 7 * 6.283; p += (i ? 'L' : 'M') + (c[0] + Math.cos(a) * c[2] * (.85 + (i % 3) * .08)).toFixed(2) + ' ' + (c[1] + Math.sin(a) * c[2] * .8).toFixed(2); }
        s += '<path d="' + p + 'Z"/>';
      });
      s += '</g><g fill="#6b2f4a">';
      [[204, 199.3], [205.8, 201], [204.6, 201.6], [211.8, 198.6], [213.3, 199.8], [207.4, 206], [208.9, 207.2], [214, 205.4], [215.2, 206.6]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".45"/>'; });
      s += '</g><path d="M209.5 203.2c2 .6 3.6 .1 4.6-1.2" stroke="#f08a3c" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
      s += lead(204, 197, 196, 190) + pill(168, 190, 'giant cells') + lead(214, 202, 222, 196) + pill(222, 196, 'feeding juvenile');
    }
    if (k === 4) {
      s += '<path d="M222 236c-1.6-3.2.2-6.6 3.4-6.8c3.4-.2 5 3.4 3.4 6.4c-1 1.8-2.4 2.8-3.4 2.8s-2.6-.8-3.4-2.4z" fill="#fff6e6" stroke="#c7a883" stroke-width=".4"/>';
      s += '<path d="M229.6 237.4c2.6-.4 5.8.4 7.4 2.4c1.4 2-.2 4-2.8 4.2c-2.8.2-5.4-1.4-5.8-3.6z" fill="rgba(160,113,74,.85)" stroke="#6b4428" stroke-width=".35"/><g fill="#f3e6c8" stroke="#a88a63" stroke-width=".2">';
      [[231.4, 239.4], [233.2, 240.2], [234.8, 241.2], [232.2, 241.6], [230.6, 240.8], [234, 239]].forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx=".7" ry=".48"/>'; });
      s += '</g>' + lead(223, 233, 214, 226) + pill(196, 226, 'female') + lead(236, 243, 242, 250) + pill(242, 250, 'egg mass');
    }
    return s;
  }

  H.ready(function () {
    var sec = H.$('[data-th]'); if (!sec) return;
    var stageEl = H.$('.th__stage', sec), track = H.$('[data-th-track]', sec), cap = H.$('[data-th-cap]', sec);
    var capN = H.$('[data-th-n]', cap), capT = H.$('[data-th-t]', cap), dotsEl = H.$('[data-th-dots]', sec);
    var lensSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lensSvg.setAttribute('aria-hidden', 'true'); lensSvg.setAttribute('focusable', 'false');
    lensSvg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    lensSvg.innerHTML = '<defs>' + lensFilter() + '</defs>';
    sec.insertBefore(lensSvg, sec.firstChild);
    var lensFx = [].slice.call(lensSvg.querySelectorAll('feDisplacementMap'));
    var blocks = STAGES.map(function (st, i) {
      var k = i + 1, fig = document.createElement('figure');
      fig.className = 'th__block' + (st.key ? ' th__block--key' : '');
      fig.innerHTML = '<svg viewBox="0 0 420 330" role="img" aria-label="Stage ' + k + ': ' + st.t + '. Move the lens to look closer.">' +
        '<defs>' + lensDefs(k) + '</defs>' +
        '<g id="th-scene-' + k + '">' + sceneContent(k) + '</g>' +
        '<g class="th__lensview" data-lensview><circle r="' + LR + '" cy="6" fill="rgba(12,20,40,.34)" filter="url(#th-lensshade-' + k + ')"/>' +
          '<g clip-path="url(#th-lensclip-' + k + ')"><g filter="url(#th-lensfx)"><rect x="' + (-LR) + '" y="' + (-LR) + '" width="' + 2 * LR + '" height="' + 2 * LR + '" fill="#2a1a14"/><g data-lenszoom><use href="#th-scene-' + k + '"/><g class="th__micro">' + microContent(k) + '</g></g></g></g></g>' +
        '<g class="th__lens" data-lens><circle r="' + LR + '" fill="rgba(255,255,255,.05)"/><circle r="' + LR + '" fill="url(#th-lensglow-' + k + ')"/>' +
          '<circle r="' + (LR - 0.7) + '" fill="none" stroke="url(#th-lensrim-' + k + ')" stroke-width="1.4"/><circle r="' + (LR - 0.3) + '" fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".5"/></g>' +
        '</svg><figcaption><b>' + k + '</b>' + st.t + '</figcaption>';
      track.appendChild(fig);
      var li = document.createElement('li'); dotsEl.appendChild(li);
      return {
        k: k, st: st, fig: fig, svg: fig.querySelector('svg'), dot: li,
        view: fig.querySelector('[data-lensview]'), zoom: fig.querySelector('[data-lenszoom]'), lens: fig.querySelector('[data-lens]'),
        rim: fig.querySelector('[data-lensrim]'),
        worms: H.$$('[data-j2]', fig).filter(function (g) { return !g.closest('.th__lensview'); }).map(function (g) { var a = g.getAttribute('data-j2').split(' ').map(Number); return { o: g.children[0], b: g.children[1], x: a[0], y: a[1], ang: a[2], len: a[3], ph: a[4] }; }),
        lx: st.hot[0], ly: st.hot[1], tx: st.hot[0], ty: st.hot[1]
      };
    });
    var cur = 0;
    function place(b) {
      var at = 'translate(' + b.lx.toFixed(2) + ' ' + b.ly.toFixed(2) + ')';
      b.view.setAttribute('transform', at);
      b.zoom.setAttribute('transform', 'scale(' + ZOOM + ') translate(' + (-b.lx).toFixed(2) + ' ' + (-b.ly).toFixed(2) + ')');
      b.lens.setAttribute('transform', at);
      b.rim.setAttribute('gradientTransform', 'rotate(' + (-45 + (b.lx - 210) / 170 * 18).toFixed(1) + ')');   // light from the upper left
    }
    /* like the demo's glass, the lens does not fade in: its bending grows until it is there */
    function bend(k) {
      var gm = lensGlass();
      lensFx.forEach(function (fe) {
        var fine = fe.hasAttribute('data-fine');
        fe.setAttribute('scale', ((fine ? gm.fineScale : gm.scale) * k * +fe.getAttribute('data-fx')).toFixed(fine ? 4 : 3));
      });
    }
    var focused = 0;
    var bendRun = 0;
    function materialize() {
      if (H.reduced) { bend(1); return; }
      var t0 = performance.now(), run = ++bendRun;   // a newer focus takes over the shared filter
      bend(0);
      (function step(t) { if (run !== bendRun) return; var p = Math.min(1, (t - t0) / 900); bend(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(step); })(t0);
    }
    /* 3D v3 interaction: a preview of the four blocks, then the first block
     * zooms in, then each scroll slides sideways to the next block. One big
     * line of text per stage. */
    function layout() {
      var vw = sec.clientWidth, vh = stageEl.clientHeight, narrow = vw < 760;
      var head = H.$('.th__head', sec), hb = head.offsetTop + head.offsetHeight;
      var pad = narrow ? 16 : 32;
      var B = narrow ? vw - 2 * pad : Math.min(vw * 0.6, 920, (vh - hb - 130) * 420 / 330), hB = B * 330 / 420;
      blocks.forEach(function (b) { b.fig.style.width = B + 'px'; });
      if (cur === 0) {
        var gap = narrow ? 10 : 16, s0 = narrow ? (vw - 2 * pad - gap) / 2 / B : (vw - 2 * pad - 3 * gap) / 4 / B;
        var rowW = 4 * s0 * B + 3 * gap, x0 = (vw - rowW) / 2, y0 = hb + Math.max(24, (vh - hb - s0 * hB) / 2 - 36);
        blocks.forEach(function (b, i) {
          var x = narrow ? pad + (i % 2) * (s0 * B + gap) : x0 + i * (s0 * B + gap), y = narrow ? hb + 20 + Math.floor(i / 2) * (s0 * hB + 44) : y0;
          b.fig.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s0.toFixed(4) + ')';
          b.fig.classList.remove('is-focus', 'is-side');
        });
        return;
      }
      var fx = (vw - B) / 2, fy = hb + Math.max(8, (vh - hb - hB - 96) / 2), gapF = narrow ? 24 : 72;
      blocks.forEach(function (b) {
        var off = b.k - cur;
        b.fig.style.transform = 'translate(' + (fx + off * (B + gapF)).toFixed(1) + 'px,' + fy.toFixed(1) + 'px) scale(1)';
        b.fig.classList.toggle('is-focus', off === 0);
        b.fig.classList.toggle('is-side', off !== 0);
      });
      cap.style.left = fx + 'px'; cap.style.width = B + 'px'; cap.style.top = (fy + hB + 14) + 'px';
    }
    function show(i) {
      cur = i;
      sec.setAttribute('data-st', i);
      blocks.forEach(function (b) { b.dot.classList.toggle('is-on', b.k === i); b.dot.classList.toggle('is-done', b.k < i); if (b.k !== i) { b.tx = b.st.hot[0]; b.ty = b.st.hot[1]; } });
      if (i) {
        var st = STAGES[i - 1];
        capN.textContent = String(i); capT.textContent = st.t;
        cap.classList.toggle('is-key', !!st.key);
        cap.classList.remove('is-in'); void cap.offsetWidth; cap.classList.add('is-in');
        if (focused !== i) materialize();
      }
      focused = i;
      layout();
    }
    blocks.forEach(function (b) {
      b.svg.addEventListener('pointermove', function (e) {
        if (b.k !== cur) return;
        var r = b.svg.getBoundingClientRect();
        b.tx = H.clamp((e.clientX - r.left) / r.width * 420, 40, 380); b.ty = H.clamp((e.clientY - r.top) / r.height * 330, 96, 300);
      });
      b.svg.addEventListener('pointerleave', function () { b.tx = b.st.hot[0]; b.ty = b.st.hot[1]; });
      b.worms.forEach(function (w) { var d = wormD(w.x, w.y, w.ang, w.len, w.ph, 2.6); w.o.setAttribute('d', d); w.b.setAttribute('d', d); });
      place(b);
    });
    var vis = false, t0 = performance.now();
    function tick(now) {
      if (!vis) return;
      var t = (now - t0) / 1000;
      blocks.forEach(function (b) {
        if (!H.reduced) b.worms.forEach(function (w) {
          var sway = Math.sin(t * .7 + w.ph) * 1.2, d = wormD(w.x + Math.cos(w.ang) * sway, w.y + Math.sin(w.ang) * sway, w.ang, w.len, t * 4 + w.ph, 2.6);
          w.o.setAttribute('d', d); w.b.setAttribute('d', d);
        });
        if (Math.abs(b.tx - b.lx) > .05 || Math.abs(b.ty - b.ly) > .05) { b.lx += (b.tx - b.lx) * .16; b.ly += (b.ty - b.ly) * .16; place(b); }
      });
    }
    H.visibleLoop(sec, tick, function (v) { vis = v; });
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
    H.scene('threat', {
      steps: 4, tall: 5,
      noCue: true,   // v7.4: the page has its own stage dashes; the pager's scroll icon covered the key label
      set: function (i) { show(i); },
      step: function (i) { show(i); return 950; },
      ff: function () {}
    });
    show(0);
  });
})();
