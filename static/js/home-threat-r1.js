/* NKU homepage — 04 the hidden threat, round 2 (R2-H06).
 * The four stages of one infection cycle, drawn with the team's own artwork
 * (单图大豆植株.ai / 单图放大.ai). Artboards are matched to stages by what
 * they show, not by their number:
 *   stage 1 Finding a host         plant 01 (seedling)       + circle 01 (J2 and eggs in soil)
 *   stage 2 Releasing ascarosides  plant 02 (young plant)    + circle 01 with ascr#3 / ascr#18 glows
 *   stage 3 Invading the root      plant 02                  + circle 02 (juveniles inside the root)
 *   stage 4 Yellowing above ground plant 03 (yellow, galled) + circle 03 (swollen female, eggs)
 * Stage texts are unchanged from v8.0. Everything is an illustration.
 *
 * R2 changes
 *   - Each stage is ONE svg: plant, animated overlay, magnified circle and the
 *     callout share a coordinate system, so nothing is measured at runtime and
 *     nothing drifts out of alignment when the window is resized.
 *   - The three plant artboards share one scale but not one ground line. Each
 *     is shifted so that its soil block is centred on x = 0 and its ground
 *     surface sits on y = 0 ("ground coordinates"); the four soil blocks now
 *     line up across the overview.
 *   - Overlays (SMIL, paused when off-screen): juveniles crawling to the root
 *     tip, root exudate rings, ascaroside molecules drifting, a juvenile
 *     entering the root and a gall swelling, eggs going back into the soil.
 *   - Overview: a cycle rail under the stages (1 → 4, then back to 1) and the
 *     first visible sign marked on stage 4.
 *   - Focus: the magnified circle grows out of the marked spot; labels inside
 *     the circle name what it shows; the caption says what can be seen above
 *     ground at that stage. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  /* One literal per artwork file so the CDN switch is a one-line swap each
   * (CDN-UPLOAD-MANIFEST.csv). */
  var ART = {
    plant: {
      '01': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-0bb6ae1732a7-plant-soil-artboard-01.svg',
      '02': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-76c7b5750f6c-plant-soil-artboard-02.svg',
      '03': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-2c45995f477d-plant-soil-artboard-03.svg'
    },
    lens: {
      '01': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-d0e06f642252-magnified-artboard-01.svg',
      '02': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-608e705490a6-magnified-artboard-02.svg',
      '03': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-a80b7fce538f-magnified-artboard-03.svg'
    }
  };
  /* Ground alignment, measured from the artboards (viewBox 34 118 541 582):
   * cx = middle of the soil block, gy = median height of its surface. */
  var PLANT = { '01': { cx: 297.5, gy: 399, w: 509, b: 247 }, '02': { cx: 311.5, gy: 389.5, w: 509, b: 243.5 }, '03': { cx: 277.5, gy: 451, w: 469, b: 239 } };
  /* w = soil width, b = depth of its bottom edge below the ground line */
  /* Compositions in ground coordinates. lens: centre and outer radius. */
  var LAY = {
    card: { vb: [-262, -288, 582, 566], lens: [206, 170, 104] },
    wide: { vb: [-262, -288, 1030, 546], lens: [552, 22, 214] },
    tall: { vb: [-262, -288, 548, 586], lens: [148, 168, 128] }
  };
  var LENS_R = 207;   // lens artwork is 414 units square

  var STAGES = [
    { t: 'Finding a host', p: 'Second-stage juveniles (J2) hatch from eggs in the soil and swim through water films toward the chemicals leaking from root tips.', plant: '01', lens: '01', hot: [318, 468], fx: 'host',
      tags: [{ t: 'J2 juvenile', at: [64, 32.5], to: [55, 14] }, { t: 'Egg', at: [86.5, 45], to: [80, 63] }] },
    { t: 'Releasing ascarosides', p: 'While they move and gather, nematodes release ascarosides such as ascr#3 and ascr#18. These small molecules linger in the soil around the roots. They are the clue NemaKlear is designed to read.', plant: '02', lens: '01', hot: [336, 446], key: true, glow: true, fx: 'signal' },
    { t: 'Invading the root', p: 'A juvenile pierces the root near its tip, settles inside and turns nearby cells into giant feeding cells. The root swells into knots called galls.', plant: '02', lens: '02', hot: [300, 470], fx: 'invade',
      tags: [{ t: 'J2 inside the root', at: [54, 58], to: [70, 80] }] },
    { t: 'Yellowing above ground', p: 'With galled roots the plant takes up less water and nutrients. Leaves yellow and wilt, easily mistaken for drought, while the next generation of eggs goes back into the soil.', plant: '03', lens: '03', hot: [296, 520], fx: 'yellow', seen: true, sign: [402, 334],
      tags: [{ t: 'Swollen female', at: [36, 46], to: [40, 24] }, { t: 'Egg mass', at: [20, 55], to: [22, 76] }] }
  ];
  var ABOVE = ['Above ground: no visible sign yet', 'Above ground: yellow, wilting leaves'];
  var LOOP_NOTE = 'Eggs left in the soil start the next cycle';
  var SIGN_NOTE = 'First sign you can see';
  var KEY_NOTE = 'The step NemaKlear listens for';

  var ANIM = !H.reduced;
  var f1 = function (v) { return Math.round(v * 10) / 10; };
  function g2(st, x, y) { var P = PLANT[st.plant]; return [x - P.cx, y - P.gy]; }

  /* ---------- small drawing helpers (strings, artboard coordinates) ---------- */
  function q(p0, c, p1, t) {   // point and angle on a quadratic Bézier
    var u = 1 - t;
    var x = u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], y = u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1];
    var dx = 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), dy = 2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
    return [x, y, Math.atan2(dy, dx) * 180 / Math.PI];
  }
  function qd(p0, c, p1) { return 'M' + p0.join(' ') + 'Q' + c.join(' ') + ' ' + p1.join(' '); }
  /* a juvenile: dark outline, pale core, the body wiggling */
  function wormBody(len, amp, dur) {
    var L = len / 2, a = amp;
    var d1 = 'M' + (-L) + ' 0C' + f1(-L * .55) + ' ' + (-a) + ' ' + f1(-L * .3) + ' ' + a + ' 0 0S' + f1(L * .6) + ' ' + (-a) + ' ' + L + ' 0';
    var d2 = 'M' + (-L) + ' 0C' + f1(-L * .55) + ' ' + a + ' ' + f1(-L * .3) + ' ' + (-a) + ' 0 0S' + f1(L * .6) + ' ' + a + ' ' + L + ' 0';
    var an = ANIM ? '<animate attributeName="d" values="' + d1 + ';' + d2 + ';' + d1 + '" dur="' + dur + 's" repeatCount="indefinite"/>' : '';
    return '<path class="th3-w__o" d="' + d1 + '">' + an + '</path><path class="th3-w__i" d="' + d1 + '">' + an + '</path>' +
      '<circle class="th3-w__h" cx="' + L + '" cy="0" r="1.5"/>';
  }
  /* a juvenile travelling along a curve (fades in and out at the ends) */
  function crawl(p0, c, p1, dur, begin, opt) {
    opt = opt || {};
    var body = wormBody(opt.len || 26, opt.amp || 3.4, opt.wig || .9);
    if (!ANIM) { var s = q(p0, c, p1, .62); return '<g transform="translate(' + f1(s[0]) + ' ' + f1(s[1]) + ') rotate(' + f1(s[2]) + ')">' + body + '</g>'; }
    var fade = opt.enter ? '0;1;1;.9;0' : '0;1;1;1;0', kt = opt.enter ? '0;.12;.7;.86;1' : '0;.12;.5;.85;1';
    return '<g opacity="0"><animateMotion path="' + qd(p0, c, p1) + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" rotate="auto" calcMode="spline" keyTimes="0;1" keySplines=".35 0 .6 1"/>' +
      '<animate attributeName="opacity" values="' + fade + '" keyTimes="' + kt + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' + body + '</g>';
  }
  /* a juvenile circling slowly on the spot */
  function loiter(x, y, r, dur, begin) {
    var body = wormBody(24, 3.2, .8);
    if (!ANIM) return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (begin * 40) + ')">' + body + '</g>';
    var p = 'M' + (x - r) + ' ' + y + 'a' + r + ' ' + (r * .7) + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + (r * .7) + ' 0 1 0 ' + (-2 * r) + ' 0';
    return '<g><animateMotion path="' + p + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" rotate="auto"/>' + body + '</g>';
  }
  /* an ascaroside: the sugar ring with its side chain */
  function mol(kind, s) {
    return '<g class="th3-mol is-' + kind + '" transform="scale(' + (s || 1) + ')"><circle r="11" fill="url(#th3-g-' + kind + ')"/>' +
      '<polygon points="5.2,0 2.6,4.5 -2.6,4.5 -5.2,0 -2.6,-4.5 2.6,-4.5"/><path d="M5.2 0l3.6-2.6 3.6 2.6 3.6-2.6"/></g>';
  }
  function drift(kind, p0, p1, dur, begin, s) {
    var c = [(p0[0] + p1[0]) / 2 + (p1[1] - p0[1]) * .25, (p0[1] + p1[1]) / 2 - (p1[0] - p0[0]) * .25];
    if (!ANIM) { var m = q(p0, c, p1, .5); return '<g transform="translate(' + f1(m[0]) + ' ' + f1(m[1]) + ')">' + mol(kind, s) + '</g>'; }
    return '<g opacity="0"><animateMotion path="' + qd(p0, c, p1) + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.18;.7;1" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' +
      '<g><animateTransform attributeName="transform" type="rotate" from="0" to="' + (kind === 'b' ? 90 : -90) + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' + mol(kind, s) + '</g></g>';
  }
  function egg(x, y, rot, s) {
    return '<ellipse class="th3-egg" cx="' + x + '" cy="' + y + '" rx="' + 4.6 * (s || 1) + '" ry="' + 3.2 * (s || 1) + '" transform="rotate(' + (rot || 0) + ' ' + x + ' ' + y + ')"/>';
  }
  function eggOut(p0, p1, dur, begin) {
    var c = [(p0[0] + p1[0]) / 2, Math.min(p0[1], p1[1]) - 10];
    if (!ANIM) return egg(p1[0], p1[1], 20);
    return '<g opacity="0"><animateMotion path="' + qd(p0, c, p1) + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".2 .7 .4 1"/>' +
      '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.75;1" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' + egg(0, 0, 25) + '</g>';
  }
  function ripple(x, y, r0, r1, dur, begin, cls) {
    if (!ANIM) return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="' + (r0 + r1) / 2 + '" opacity=".35"/>';
    return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="' + r0 + '" opacity="0">' +
      '<animate attributeName="r" values="' + r0 + ';' + r1 + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".2 .6 .4 1"/>' +
      '<animate attributeName="opacity" values="0;.85;0" keyTimes="0;.15;1" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/></circle>';
  }
  function blob(kind, x, y, r, dur, begin) {
    return '<circle class="th3-blob" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#th3-g-' + kind + ')">' +
      (ANIM ? '<animate attributeName="opacity" values=".65;1;.65" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' : '') + '</circle>';
  }

  /* ---------- what happens around the plant, per stage (artboard coordinates) ---------- */
  var FX = {
    host: function () {   // plant 01: seedling root tip at (291, 458)
      var s = '';
      s += '<circle cx="291" cy="452" r="74" fill="url(#th3-g-w)" opacity=".7"/>';
      s += ripple(291, 456, 8, 78, 4.2, 0, 'th3-ex') + ripple(291, 456, 8, 78, 4.2, -1.4, 'th3-ex') + ripple(291, 456, 8, 78, 4.2, -2.8, 'th3-ex');
      s += egg(132, 592, 20) + egg(143, 600, -15) + egg(455, 566, 10) + egg(466, 558, 40) + egg(372, 618, -20) + egg(96, 492, 60) + egg(508, 470, -30);
      s += crawl([118, 588], [190, 540], [270, 474], 11, -1) + crawl([470, 600], [400, 610], [310, 480], 13, -5.5) +
        crawl([500, 452], [420, 420], [314, 458], 10, -8) + crawl([100, 470], [200, 430], [272, 462], 12, -3);
      return s;
    },
    signal: function (st) {   // plant 02: juveniles gathered at the roots, molecules drifting off
      var h = st.hot, s = '';
      s += blob('b', h[0] - 34, h[1] + 6, 46, 4.6, 0) + blob('p', h[0] + 14, h[1] - 26, 40, 4.6, -2.3) + blob('b', h[0] + 2, h[1] + 44, 36, 4.6, -1.2);
      s += loiter(352, 458, 9, 7, 0) + loiter(322, 494, 8, 6, -2) + loiter(270, 448, 9, 8, -4) + loiter(372, 506, 7, 6.5, -1) + loiter(292, 520, 8, 7.5, -3);
      [[352, 458, 410, 420, 'b'], [352, 458, 404, 500, 'p'], [322, 494, 350, 560, 'b'], [270, 448, 214, 412, 'p'], [270, 448, 206, 486, 'b'],
        [372, 506, 440, 540, 'p'], [292, 520, 250, 576, 'p'], [292, 520, 316, 590, 'b'], [322, 494, 260, 530, 'b'], [352, 458, 384, 400, 'p']]
        .forEach(function (m, i) { s += drift(m[4], [m[0], m[1]], [m[2], m[3]], 6 + (i % 3), -i * .9, 1.15); });
      return s;
    },
    invade: function () {   // plant 02: a juvenile reaching the taproot tip, galls swelling
      var s = '';
      s += crawl([400, 566], [340, 556], [307, 494], 7.5, -.5, { enter: true }) + crawl([210, 548], [256, 530], [301, 488], 9, -4.5, { enter: true });
      [[305, 470, 7.5, 10, 0], [333, 452, 5.5, 4.6, -1.6], [276, 438, 5, 4.2, -3]].forEach(function (g) {
        s += '<g transform="translate(' + g[0] + ' ' + g[1] + ')"><ellipse class="th3-gall" rx="' + g[2] + '" ry="' + g[3] + '"' + (ANIM ? '' : ' transform="scale(1.05)"') + '>' +
          (ANIM ? '<animateTransform attributeName="transform" type="scale" values=".35;1.1;1.1;.35" keyTimes="0;.55;.9;1" dur="6s" begin="' + g[4] + 's" repeatCount="indefinite"/>' : '') + '</ellipse></g>';
      });
      return s;
    },
    yellow: function (st) {   // plant 03: eggs going back into the soil, the first visible sign
      var h = st.hot, s = '', sg = st.sign;
      [[-70, 40], [-40, 74], [10, 86], [56, 60], [84, 18], [-96, 2], [30, 100]].forEach(function (d, i) {
        s += eggOut([h[0] + d[0] * .15, h[1] + d[1] * .15], [h[0] + d[0], h[1] + d[1]], 6.5, -i * .93);
      });
      s += crawl([h[0] - 10, h[1] + 20], [h[0] - 60, h[1] + 70], [h[0] - 140, h[1] + 96], 12, -2) + crawl([h[0] + 20, h[1] + 24], [h[0] + 90, h[1] + 50], [h[0] + 170, h[1] + 70], 13, -8);
      s += ripple(sg[0], sg[1], 10, 34, 2.8, 0, 'th3-signring') + ripple(sg[0], sg[1], 10, 34, 2.8, -1.4, 'th3-signring');
      return s;
    }
  };

  /* ---------- one composed svg ---------- */
  function tangents(x1, y1, r1, x2, y2, r2) {
    var dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
    if (d <= Math.abs(r2 - r1) + 1) return '';
    var base = Math.atan2(dy, dx), off = Math.acos((r1 - r2) / d);
    return [base + off, base - off].map(function (a) {
      return 'M' + f1(x1 + r1 * Math.cos(a)) + ' ' + f1(y1 + r1 * Math.sin(a)) + 'L' + f1(x2 + r2 * Math.cos(a)) + ' ' + f1(y2 + r2 * Math.sin(a));
    }).join('');
  }
  function lensInner(st, big) {
    var s = '<circle class="th3-lens__shade" cy="16" r="240" fill="url(#th3-g-lshade)"/><circle r="' + (LENS_R - 1) + '" fill="#fbf5ea"/>' +
      '<image href="' + ART.lens[st.lens] + '" x="' + -LENS_R + '" y="' + -LENS_R + '" width="' + 2 * LENS_R + '" height="' + 2 * LENS_R + '" clip-path="url(#th3-lensclip)"/>';
    if (st.glow) {
      s += '<g class="th3-lensglow" clip-path="url(#th3-lensclip-c)">' +
        blob('b', -116, -50, 74, 4.6, 0) + blob('p', 50, -82, 66, 4.6, -2.3) + blob('b', 82, 74, 58, 4.6, -1.1) + blob('p', -82, 92, 62, 4.6, -3.4);
      if (big) [[-150, 10, -60, -60, 'b'], [10, -120, 80, -30, 'p'], [60, 120, 140, 40, 'b'], [-60, 140, 20, 60, 'p'], [-20, 0, -90, 110, 'b']]
        .forEach(function (m, i) { s += drift(m[4], [m[0], m[1]], [m[2], m[3]], 7 + i % 2, -i * 1.3, 3); });
      s += '</g>';
    }
    s += '<circle class="th3-lens__rim" r="' + (LENS_R - 2) + '"/><circle class="th3-lens__edge" r="' + (LENS_R + 2.5) + '"/>';
    if (big && st.tags) st.tags.forEach(function (tg) {
      var ax = tg.at[0] * 4.14 - LENS_R, ay = tg.at[1] * 4.14 - LENS_R, bx = tg.to[0] * 4.14 - LENS_R, by = tg.to[1] * 4.14 - LENS_R;
      s += '<g class="th3-lead"><path d="M' + f1(ax) + ' ' + f1(ay) + 'L' + f1(bx) + ' ' + f1(by) + '"/><circle cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="5"/></g>';
    });
    return s;
  }
  function build(st, lay, big) {
    var L = LAY[lay], vb = L.vb, P = PLANT[st.plant];
    var hot = g2(st, st.hot[0], st.hot[1]), lx = L.lens[0], ly = L.lens[1], lr = L.lens[2], k = lr / (LENS_R + 4);
    var ringR = big ? 12 : 13;
    var s = '<svg class="th3-svg" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">';
    s += '<g class="th3-plant"><ellipse class="th3-plant__shade" cx="0" cy="' + (P.b - 2) + '" rx="' + (P.w / 2 + 26) + '" ry="30" fill="url(#th3-g-shade)"/>' +
      '<g transform="translate(' + -P.cx + ' ' + -P.gy + ')">' +
      '<image class="th3-plant__img" href="' + ART.plant[st.plant] + '" x="34" y="118" width="541" height="582"/>' +
      '<g class="th3-fx">' + FX[st.fx](st) + '</g></g></g>';
    s += '<g class="th3-call"><path d="' + tangents(hot[0], hot[1], ringR + 3, lx, ly, lr) + '"/></g>';
    s += '<g class="th3-spot" transform="translate(' + f1(hot[0]) + ' ' + f1(hot[1]) + ')">' +
      (ANIM ? '<circle class="th3-spot__pulse" r="' + ringR + '"><animate attributeName="r" values="' + ringR + ';' + (ringR + 16) + '" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.4s" repeatCount="indefinite"/></circle>' : '') +
      '<circle class="th3-spot__fill" r="' + ringR + '"/><circle class="th3-spot__out" r="' + (ringR + 3) + '"/></g>';
    var pdx = f1((hot[0] - lx) / k), pdy = f1((hot[1] - ly) / k);
    s += '<g class="th3-lens" transform="translate(' + lx + ' ' + ly + ') scale(' + k.toFixed(4) + ')"><g class="th3-lens__pop" style="--dx:' + pdx + 'px;--dy:' + pdy + 'px">' +
      lensInner(st, big) + '</g></g>';
    return s + '</svg>';
  }
  /* html labels that sit on the svg, placed in % of its viewBox */
  function pctOf(vb, x, y) { return 'left:' + ((x - vb[0]) / vb[2] * 100).toFixed(2) + '%;top:' + ((y - vb[1]) / vb[3] * 100).toFixed(2) + '%'; }
  function overlays(st, lay, big) {
    var L = LAY[lay], vb = L.vb, s = '', k = L.lens[2] / (LENS_R + 4);
    function inLens(p) { return [L.lens[0] + k * (p[0] * 4.14 - LENS_R), L.lens[1] + k * (p[1] * 4.14 - LENS_R)]; }
    if (st.glow) {
      var c3 = inLens([18, 26]), c18 = inLens([66, 78]);
      s += '<span class="th3-chip is-3" style="' + pctOf(vb, c3[0], c3[1]) + '">ascr#3</span><span class="th3-chip is-18" style="' + pctOf(vb, c18[0], c18[1]) + '">ascr#18</span>';
    }
    if (big && st.tags) st.tags.forEach(function (tg, i) {
      var p = inLens(tg.to), side = tg.to[0] > 50 ? ' is-r' : ' is-l';
      s += '<span class="th3-tag' + side + '" style="' + pctOf(vb, p[0], p[1]) + ';--j:' + i + '">' + tg.t + '</span>';
    });
    if (st.sign) {
      var g = g2(st, st.sign[0], st.sign[1]);
      s += '<span class="th3-sign" style="' + pctOf(vb, g[0] + 10, g[1] - 26) + '"><i></i>' + SIGN_NOTE + '</span>';
    }
    return s;
  }
  var DEFS = '<svg class="th3-defs" aria-hidden="true" focusable="false" width="0" height="0"><defs>' +
    '<clipPath id="th3-lensclip" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".4855"/></clipPath>' +
    '<clipPath id="th3-lensclip-c"><circle r="' + (LENS_R - 3) + '"/></clipPath>' +
    '<radialGradient id="th3-g-b"><stop offset="0" stop-color="#9cc3f0" stop-opacity=".95"/><stop offset=".55" stop-color="#8fbaec" stop-opacity=".45"/><stop offset="1" stop-color="#8fbaec" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="th3-g-p"><stop offset="0" stop-color="#f0b1d0" stop-opacity=".95"/><stop offset=".55" stop-color="#eca6c9" stop-opacity=".45"/><stop offset="1" stop-color="#eca6c9" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="th3-g-w"><stop offset="0" stop-color="#f3d98e" stop-opacity=".42"/><stop offset=".6" stop-color="#e9cc7e" stop-opacity=".12"/><stop offset="1" stop-color="#e9cc7e" stop-opacity="0"/></radialGradient>' +
    /* shadows are gradients, not filters: a filter would be re-rendered on every animation frame */
    '<radialGradient id="th3-g-shade"><stop offset="0" stop-color="#231829" stop-opacity=".3"/><stop offset=".55" stop-color="#231829" stop-opacity=".13"/><stop offset="1" stop-color="#231829" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="th3-g-lshade"><stop offset=".8" stop-color="#231829" stop-opacity=".42"/><stop offset=".9" stop-color="#231829" stop-opacity=".14"/><stop offset="1" stop-color="#231829" stop-opacity="0"/></radialGradient>' +
    '</defs></svg>';

  /* ---------- page ---------- */
  H.ready(function () {
    var sec = H.$('[data-th]'); if (!sec) return;
    var track = H.$('[data-th-track]', sec), cap = H.$('[data-th-cap]', sec);
    var capN = H.$('[data-th-n]', cap), capT = H.$('[data-th-t]', cap), dotsEl = H.$('[data-th-dots]', sec);
    sec.classList.add('th2', 'th3');
    sec.insertAdjacentHTML('afterbegin', DEFS);

    /* arrival: the four stages side by side, on one ground line, joined in a cycle */
    var ov = document.createElement('div'); ov.className = 'th2__ov';
    var grid = document.createElement('ol'); grid.className = 'th3-grid'; grid.setAttribute('aria-label', 'The four stages');
    STAGES.forEach(function (st, i) {
      var k = i + 1, li = document.createElement('li');
      li.className = 'th3-card' + (st.key ? ' is-key' : '') + (st.seen ? ' is-seen' : '');
      li.style.setProperty('--i', i);
      li.innerHTML = '<div class="th3-card__art"><div class="th3-fig">' + build(st, 'card', false) + overlays(st, 'card', false) + '</div></div>' +
        '<p class="th3-card__cap"><i class="th3-node" aria-hidden="true"></i><b>' + k + '</b><span>' + st.t + '</span>' +
        (st.key ? '<i class="th3-br"></i><em class="th3-pill">' + KEY_NOTE + '</em>' : '') + '</p>';
      grid.appendChild(li);
      var d = document.createElement('li'); d.innerHTML = '<i></i><b>' + k + '</b><span>' + st.t + '</span>'; dotsEl.appendChild(d);
    });
    var loop = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    loop.setAttribute('class', 'th3-loop'); loop.setAttribute('aria-hidden', 'true');
    loop.innerHTML = '<path class="th3-loop__fwd"/><path class="th3-loop__back"/><path class="th3-loop__head"/><g class="th3-loop__chev"></g>';
    var note = document.createElement('p'); note.className = 'th3-loop__note'; note.textContent = LOOP_NOTE;
    var wrap = document.createElement('div'); wrap.className = 'th3-wrap';
    wrap.appendChild(grid); wrap.appendChild(loop); wrap.appendChild(note);
    ov.appendChild(wrap);

    /* one stage at a time */
    var focus = document.createElement('div'); focus.className = 'th2__focus'; focus.setAttribute('aria-hidden', 'true');
    var pane = document.createElement('div'); pane.className = 'th2__pane'; focus.appendChild(pane);
    track.appendChild(ov); track.appendChild(focus);
    var p = document.createElement('p'); p.className = 'th__p'; p.setAttribute('data-th-p', '');
    var above = document.createElement('p'); above.className = 'th3-above';
    var key = cap.querySelector('.th__key');
    key.parentNode.insertBefore(p, key); key.parentNode.insertBefore(above, key);

    var mq = matchMedia('(max-width: 760px)'), lay = '';
    var panes = STAGES.map(function (st, i) {
      var el = document.createElement('div'); el.className = 'th3-scene'; el.setAttribute('data-k', i + 1);
      pane.appendChild(el); return el;
    });
    function layoutScenes() {
      var want = mq.matches ? 'tall' : 'wide'; if (want === lay) return;
      lay = want;
      var vb = LAY[lay].vb;
      pane.style.setProperty('--ar', vb[2] / vb[3]);
      panes.forEach(function (el, i) { el.innerHTML = '<div class="th3-fig">' + build(STAGES[i], lay, true) + overlays(STAGES[i], lay, true) + '</div>'; });
      syncPlay();
    }

    /* the cycle rail: 1 → 2 → 3 → 4 along the captions, down the right edge,
       back under them (broken for the note) and up the left margin into 1 */
    function drawLoop() {
      var nodes = H.$$('.th3-node', grid);
      if (!nodes.length || !grid.offsetWidth || getComputedStyle(loop).display === 'none') return;
      /* offsets, not client rects: the arrival moves the captions with transforms */
      var W = wrap.offsetWidth, Hh = wrap.offsetHeight;
      var pts = nodes.map(function (n) { var c = n.offsetParent; return [c.offsetLeft + n.offsetLeft + n.offsetWidth / 2, c.offsetTop + n.offsetTop + n.offsetHeight / 2]; });
      var y = pts[0][1], x0 = pts[0][0], xr = W - 4, xl = x0 - 20;
      var yb = Hh - 10, r = Math.max(4, Math.min(14, (yb - y) / 2));
      note.style.setProperty('--nx', f1((x0 + xr) / 2) + 'px');
      var nw = note.offsetWidth / 2 + 14, nx = (x0 + xr) / 2;
      loop.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
      /* forward 1 → 4 is solid; the way back (round the right edge, under the
         captions, up the left margin) is dashed and leaves room for the note */
      H.$('.th3-loop__fwd', loop).setAttribute('d', 'M' + f1(x0) + ' ' + f1(y) + 'H' + f1(xr - r));
      H.$('.th3-loop__back', loop).setAttribute('d', 'M' + f1(xr - r) + ' ' + f1(y) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + f1(yb - r) + 'q0 ' + r + ' ' + -r + ' ' + r + 'H' + f1(nx + nw) +
        'M' + f1(nx - nw) + ' ' + f1(yb) + 'H' + f1(xl + r) + 'q' + -r + ' 0 ' + -r + ' ' + -r + 'V' + f1(y + r) + 'q0 ' + -r + ' ' + r + ' ' + -r + 'H' + f1(x0 - 9));
      H.$('.th3-loop__head', loop).setAttribute('d', 'M' + f1(x0 - 15) + ' ' + f1(y - 5) + 'L' + f1(x0 - 9) + ' ' + f1(y) + 'L' + f1(x0 - 15) + ' ' + f1(y + 5));
      H.$('.th3-loop__chev', loop).innerHTML = pts.slice(1).map(function (q2, i) {
        var mx = (pts[i][0] + q2[0]) / 2;
        return '<path style="--i:' + i + '" d="M' + f1(mx - 3) + ' ' + f1(y - 5) + 'L' + f1(mx + 3) + ' ' + f1(y) + 'L' + f1(mx - 3) + ' ' + f1(y + 5) + '"/>';
      }).join('');
      var fwd = H.$('.th3-loop__fwd', loop);
      if (fwd.getTotalLength) fwd.style.setProperty('--len', Math.ceil(fwd.getTotalLength()));
    }

    /* SMIL runs only in what is on screen */
    var visible = false, cur = 0;
    function setPlay(svg, on) { if (!svg || !svg.pauseAnimations) return; if (on) svg.unpauseAnimations(); else svg.pauseAnimations(); }
    function syncPlay() {
      H.$$('.th3-svg', grid).forEach(function (s) { setPlay(s, visible && cur === 0); });
      panes.forEach(function (el, j) { setPlay(H.$('.th3-svg', el), visible && cur === j + 1); });
      sec.classList.toggle('is-idle', !visible);
    }
    H.onView(sec, function (v) { visible = v; syncPlay(); }, { threshold: 0 });
    document.addEventListener('visibilitychange', function () {
      var r = sec.getBoundingClientRect();
      visible = !document.hidden && r.bottom > 0 && r.top < innerHeight; syncPlay();
    });
    /* the arrival plays once: cards rise, circles open, the rail draws */
    if (H.reduced) ov.classList.add('is-play', 'is-done');
    else H.once(sec, function () { ov.classList.add('is-play'); setTimeout(function () { ov.classList.add('is-done'); }, 2600); }, .35);

    function show(i) {
      cur = i;
      sec.setAttribute('data-st', i);
      dotsEl.style.setProperty('--p', i ? (i - 1) / (STAGES.length - 1) : 0);
      H.$$('li', dotsEl).forEach(function (d, j) { d.classList.toggle('is-on', j + 1 === i); d.classList.toggle('is-done', j + 1 < i); });
      panes.forEach(function (el, j) { el.classList.toggle('is-on', j + 1 === i); });
      if (i) {
        var st = STAGES[i - 1];
        capN.textContent = String(i); capT.textContent = st.t; p.textContent = st.p;
        above.textContent = st.seen ? ABOVE[1] : ABOVE[0];
        above.classList.toggle('is-seen', !!st.seen);
        cap.classList.toggle('is-key', !!st.key);
        cap.classList.remove('is-in'); void cap.offsetWidth; cap.classList.add('is-in');
      }
      syncPlay();
    }
    var rz;
    function relayout() { layoutScenes(); drawLoop(); }
    addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(relayout, 120); });
    if (mq.addEventListener) mq.addEventListener('change', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLoop);
    layoutScenes();
    requestAnimationFrame(drawLoop);
    window.addEventListener('load', drawLoop);

    H.scene('threat', {
      steps: 4, tall: 5,
      noCue: true,
      set: function (i) { show(i); },
      step: function (i) { show(i); return 950; },
      ff: function () {}
    });
    show(0);
  });
})();
