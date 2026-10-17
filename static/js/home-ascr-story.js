/* NKU homepage — cp16: the merged ascaroside page (#traces).
   Rebuilt from the team's PPT sketch "蛔苷素-线虫鉴别-ascr#3/18": slide 1 (two
   ascarosides, two kinds of nematode, the ratio), slide 2 (GPR2 from a
   nematode-trapping fungus, redesigned with PyMOL / MD / docking), slide 3
   (the receptor in yeast, signal to the nucleus, betaxanthin out), slide 4
   (freeze-dried strip, kit, map) and slide 5 (the map hands over to Human
   Practices). The slides' clicks are folded into 13 pager steps; objects keep
   their identity between steps and move like PowerPoint's Morph, forwards
   and backwards, and can be interrupted at any moment.

   Authoring model
   - Every moving thing is an SVG <g data-o="name">, drawn round its own origin.
   - STATES[i].set lists only what changes on arriving at state i:
       x y   position in the 1280x720 slide space      s  scale   sx  extra x-scale
       r     rotation (deg)   o  opacity
       d t   delay / duration of the move (ms)          od ot  same for opacity
       via   [x, y] control point: the move bends like the slide's motion path
       from  props to jump to before moving (forward only)
       fx    'pulse': a short glow, like the slides' colour pulse;
             'ripple': rings spreading out (the kit landing on the map)
       P     overrides used on tall (portrait) screens
   - STATES[i].cam is the part of the slide a tall screen shows (viewBox);
     STATES[i].wcam the same for wide screens (default: the whole slide).
   - INTRO: how slide 1 assembles when the reader arrives from above.
   Going backwards replays the same states in reverse, briskly (700 ms).
   2026-10-17 polish: slide 1 sits below the title block (they overlapped on
   short screens); captions scale with the stage (cqw) so text and drawing keep
   one proportion; the bars appear with the ratio instead of as empty pills;
   the pocket flies
   onto the monitor instead of behind it; the yeast slides pan left so its
   captions sit beside the cell; the worms undulate; the kit lands with a
   ripple; the chapter rail shows progress inside a chapter. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  H.ready(init);

  function init() {
    var sec = H.$('[data-as]'); if (!sec) return;
    var svg = H.$('[data-as-svg]', sec), frame = H.$('[data-as-frame]', sec);
    var caps = H.$$('[data-as-cap]', sec), rail = H.$$('[data-as-rail] li', sec);
    var O = {};
    H.$$('[data-o]', svg).forEach(function (el) { O[el.getAttribute('data-o')] = { el: el, v: null }; });
    buildMap(H.$('[data-as-map]', svg));

    var K = ['x', 'y', 's', 'sx', 'r', 'o'];
    var HIDE = { o: 0 };
    function mix(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }

    /* v8.6 — the team's artwork (total_2.svg) and its PPT "Ste20-Gpa1-MAPK-p-sTF".
       Molecules are drawn round the top of their ring's notch and the pockets round
       the top of their block, so docking = putting the two origins together:
       in the receptor's own frame the pocket sits at B = (22.7, -70.3) (slide 1 of the
       PPT). The yeast scene follows slide 2: Gpa1, Ste20, the MAPK cascade, the
       phosphate p and the sTF on the DNA. */
    var REC_Y = { x: 374.5, y: 199.6, s: 0.475, r: -50 };     // receptor in the membrane
    var DOCK_Y = { x: 355.8, y: 169.9, s: 0.475, r: -50 };    // ascr#18 bound to it
    var STF_L = { x: 595.1, y: 504.6 }, STF_R = { x: 789.2, y: 504.6 };
    var STATES = [
      /* 0 · slide 1: two signals, two kinds of nematode */
      { cam: [330, 40, 620, 660], set: {
        m3: { x: 425.8, y: 437.4, s: 0.9, o: 1, P: { x: 466.4, y: 198.5, s: 0.55 } }, m18: { x: 778.9, y: 451.7, s: 0.9, o: 1, P: { x: 779.8, y: 207.3, s: 0.55 } },
        lbl3: { x: 448, y: 296, o: 1, P: { x: 480, y: 102 } }, lbl18: { x: 812, y: 296, o: 1, P: { x: 800, y: 102 } },
        swap: { x: 630, y: 394, o: 1, P: { x: 640, y: 172, s: 0.55 } },
        wormF: { x: 168, y: 372, s: 1.05, o: 1, P: { x: 480, y: 300, s: 0.85 } }, wormP: { x: 1110, y: 372, s: 1.05, o: 1, P: { x: 800, y: 300, s: 0.85 } },
        lblF: { x: 168, y: 452, o: 1, P: { x: 480, y: 372 } }, lblP: { x: 1110, y: 452, o: 1, P: { x: 800, y: 372 } },
        barF: { x: 168, y: 540, o: 0, P: { x: 480, y: 462, s: 1.1 } }, barP: { x: 1110, y: 540, o: 0, P: { x: 800, y: 462, s: 1.1 } },
        barFi: { x: -120, sx: 0.001, o: 1 }, barPi: { x: -120, sx: 0.001, o: 1 },
        ratF: { x: 168, y: 592, o: 0, P: { x: 480, y: 520 } }, ratP: { x: 1110, y: 592, o: 0, P: { x: 800, y: 520 } },
        ask: { x: 630, y: 549, o: 0, P: { x: 640, y: 610 } },
        rec: { x: 300, y: 490, s: 0.92, o: 0 }, recD: { x: 300, y: 490, o: 0 }, recL: { x: 300, y: 490, o: 1 },
        pocket: { x: 322.7, y: 419.7, o: 1 }, mut: { x: 950, y: 296, o: 0 },
        fung: { x: 760, y: 330, s: 0.9, o: 0 }, scr: { x: 873, y: 362, s: 0.96, o: 0 },
        cell: { x: 647, y: 391, s: 0.9, o: 0 }, cellIn: { x: 640, y: 398.3, o: 1 }, bud: { x: 640, y: 398.3, o: 0 },
        nuc: { x: 685.1, y: 494.5, o: 1 }, dna: { x: 687.8, y: 504.6, o: 1 },
        prom: { x: 598, y: 504.6, o: 1 }, gene: { x: 731.9, y: 504.6, o: 1 },
        tf: mix(STF_L, { o: 1 }), tfP: { x: 12, y: -72.4, o: 0 },
        gB: { x: 492.9, y: 205.3, o: 0 }, ste20: { x: 540.9, y: 242.4, o: 0 }, mapk: { x: 674, y: 239.9, o: 0 },
        gG: { x: 662.8, y: 287, o: 0 },
        arc: { x: 567.7, y: 242, o: 0 }, sig: { x: 676, y: 300, o: 0 }, out: { x: 760, y: 440, o: 0 },
        glow: { x: 1100, y: 300, o: 0 }, lblBx: { x: 1100, y: 310, o: 0 },
        strip: { x: 260, y: 409, o: 0 }, spot: { x: 58, y: -4, o: 0 }, lblStrip: { x: 260, y: 470, o: 0 },
        box: { x: 560, y: 556, s: 0.72, o: 0 }, lblBox: { x: 560, y: 660, o: 0 },
        map: { x: 949, y: 220, s: 6, o: 0 }, ping: { x: 935, y: 250, o: 0 }
      } },
      /* 1 · the ratio */
      { cam: [330, 40, 620, 660], set: {
        barF: { o: 1, t: 420 }, barP: { o: 1, d: 120, t: 420 },
        barFi: { sx: 1, d: 220, t: 1100 }, barPi: { sx: 1, d: 360, t: 1100 },
        ratF: { o: 1, d: 950, t: 500 }, ratP: { o: 1, d: 1100, t: 500 }, ask: { o: 1, d: 1350, t: 600 }
      } },
      /* 2 · slide 2 (Morph): the molecules rise, the receptor and the fungus arrive */
      { cam: [0, 0, 1280, 720], set: {
        m3: { x: 275.7, y: 164.9, s: 0.62, t: 1100 }, m18: { x: 866.2, y: 174.8, s: 0.62, t: 1100 },
        lbl3: { x: 291, y: 66, t: 1100 }, lbl18: { x: 889, y: 66, t: 1100 },
        swap: HIDE, wormF: HIDE, wormP: HIDE, lblF: HIDE, lblP: HIDE, barF: HIDE, barP: HIDE, ratF: HIDE, ratP: HIDE, ask: HIDE,
        rec: { s: 1, o: 1, d: 300, t: 900 },
        // Reveal the upper layer only after the lower receptor has arrived.
        recD: { o: 1, d: 1200, t: 500 }, fung: { s: 1, o: 1, d: 450, t: 900 }
      } },
      /* 3 · PPT slide 1: ascr#3 slides into its pocket; 0.5 s in, the receptor's
         upper layer fades over 1 s, leaving the lower layer, the pocket and ascr#3 */
      { cam: [0, 0, 1280, 720], set: {
        fung: { o: 0, t: 500 },
        m3: { x: 322.7, y: 419.7, s: 1, via: [214, 330], t: 2000 },
        recD: { o: 0, d: 500, t: 1000 },
        lbl3: { o: 0, d: 200, t: 400 }
      } },
      /* 4 · clicks 4-6: the computer; the pocket flies to the screen and pulses */
      { cam: [0, 80, 1280, 640], set: {
        m3: { o: 0, t: 400 }, recD: { o: 1, t: 500 },
        scr: { s: 1, o: 1, t: 600 },
        pocket: { x: 950, y: 296, via: [640, 250], d: 400, t: 1400, fx: 'pulse', fxd: 1850 }
      } },
      /* 5 · clicks 7-8: the redesigned pocket goes back into the receptor */
      { cam: [0, 80, 1280, 640], set: {
        pocket: { o: 0, t: 350 },
        mut: { x: 322.7, y: 419.7, o: 1, via: [650, 470], d: 250, t: 1500, ot: 300 }
      } },
      /* 6 · ascr#18 docks into the redesigned pocket, the upper layer fades as in slide 1 */
      { cam: [0, 0, 1280, 720], set: {
        scr: { o: 0, t: 500 },
        m18: { x: 322.7, y: 419.7, s: 1, via: [600, 200], t: 2000 },
        lbl18: { o: 0, d: 200, t: 400 },
        recD: { o: 0, d: 500, t: 1000 }, recL: { o: 1 }
      } },
      /* 7 · slide 3 (Morph): the receptor shrinks to the corner, the yeast appears;
         ascr#18 waits outside, already at the size and angle it will bind with */
      { cam: [0, 0, 1080, 720], wcam: [110, 0, 1280, 720], set: {
        m18: { x: 104.1, y: 117, s: DOCK_Y.s, r: DOCK_Y.r, o: 1, from: { x: 104.1, y: 117, s: DOCK_Y.s, r: DOCK_Y.r, o: 0 }, d: 900, t: 500 },
        rec: { x: 230, y: 150, s: REC_Y.s, r: REC_Y.r, t: 1300 }, recD: { o: 1, t: 600 },
        cell: { s: 1, o: 1, d: 250, t: 1100 }
      } },
      /* 8 · into the membrane; Gpa1, Ste20 and the MAPK cascade wait underneath */
      { cam: [180, 60, 900, 660], wcam: [110, 0, 1280, 720], set: {
        rec: { x: REC_Y.x, y: REC_Y.y, t: 1200 },
        gB: { o: 1, d: 1000, t: 450 }, ste20: { o: 1, d: 1150, t: 450 }, mapk: { o: 1, d: 1300, t: 450 }
      } },
      /* 9 · ascr#18 binds (the upper layer fades), Gpa1 passes the signal to Ste20,
         Ste20 joins the MAPK cascade, and the phosphate p travels to the sTF */
      { cam: [180, 60, 900, 660], wcam: [110, 0, 1280, 720], set: {
        m18: { x: DOCK_Y.x, y: DOCK_Y.y, via: [200, 150], t: 1400 },
        recD: { o: 0, d: 400, t: 900 },
        gB: { fx: 'pulse', fxd: 1300 },
        arc: { o: 1, d: 1400, t: 400 },
        ste20: { x: 659, y: 199.2, d: 1500, t: 800 },
        mapk: { fx: 'pulse', fxd: 2300 },
        sig: { o: 1, d: 2400, t: 400 },
        gG: { x: 607.1, y: 429.5, o: 1, via: [700, 380], d: 2500, t: 1200, od: 2400, ot: 250 },
        tf: { fx: 'pulse', fxd: 3600 }
      } },
      /* 10 · the sTF, now carrying p, moves along the DNA; the pigment genes switch on */
      { cam: [180, 60, 1100, 660], wcam: [110, 0, 1280, 720], set: {
        gG: { o: 0, t: 150 }, tfP: { o: 1, t: 150 },
        tf: mix(STF_R, { d: 150, t: 1100, fx: 'pulse', fxd: 150 }),
        gene: { fx: 'pulse', fxd: 1300 },
        out: { o: 1, d: 1300, t: 600 },
        glow: { o: 1, d: 1700, t: 700 }, lblBx: { o: 1, d: 1800, t: 600 }
      } },
      /* 11 · slide 4 (Morph): the yeast shrinks and becomes the budding yeast; strip, kit and map */
      { cam: [100, 20, 1080, 690], set: {
        m18: HIDE, rec: HIDE,
        cell: { x: 290, y: 174, s: 0.34, t: 1300 },
        cellIn: { o: 0, d: 200, t: 900 }, nuc: { o: 0, d: 200, t: 700 }, bud: { o: 1, d: 200, t: 900 },
        dna: HIDE, prom: HIDE, gene: HIDE, tf: HIDE, gB: HIDE, ste20: HIDE, mapk: HIDE, gG: HIDE, sig: HIDE, arc: HIDE, out: HIDE, glow: HIDE, lblBx: HIDE,
        strip: { o: 1, d: 500, t: 600 }, lblStrip: { o: 1, d: 700, t: 500 },
        box: { o: 1, d: 700, t: 600 }, lblBox: { o: 1, d: 850, t: 500 },
        map: { o: 1, d: 900, t: 700 }
      } },
      /* 12 · clicks 1-4: onto the strip, into the kit, out to the fields */
      { cam: [100, 20, 1080, 690], set: {
        cell: { x: 314, y: 392, s: 0.12, o: 0, t: 1100, od: 600, ot: 500 },
        spot: { o: 1, d: 850, t: 450 },
        strip: { x: 548, y: 548, s: 0.42, o: 0, via: [470, 330], d: 1400, t: 1100, od: 2300, ot: 300 },
        lblStrip: { o: 0, d: 1200, t: 300 },
        box: { x: 935, y: 250, s: 0.16, o: 0, d: 2500, t: 1100, od: 3100, ot: 500, fx: 'pulse', fxd: 2300 },
        lblBox: { o: 0, d: 2400, t: 300 },
        map: { fx: 'pulse', fxd: 3400 },
        ping: { o: 1, d: 3300, t: 100, fx: 'ripple', fxd: 3420 }
      } },
      /* 13 · slide 5: the map takes Human Practices' place (computed in mapTarget) */
      { cam: [300, 60, 680, 620], set: {
        map: { dyn: true, t: 1300 }, ping: HIDE
      } }
    ];
    var N = STATES.length - 1;

    /* resolve every state for both layouts by carrying values forward */
    var R = { wide: [], tall: [] };
    ['wide', 'tall'].forEach(function (L) {
      var prev = {};
      STATES.forEach(function (st, i) {
        var cur = {};
        Object.keys(O).forEach(function (n) { cur[n] = prev[n] ? mix(prev[n], {}) : { x: 0, y: 0, s: 1, sx: 1, r: 0, o: 0 }; });
        Object.keys(st.set).forEach(function (n) {
          if (!cur[n]) return;
          var e = st.set[n];
          K.forEach(function (k) { if (e[k] != null) cur[n][k] = e[k]; });
          if (L === 'tall' && e.P) K.forEach(function (k) { if (e.P[k] != null) cur[n][k] = e.P[k]; });
        });
        R[L][i] = cur; prev = cur;
      });
    });
    var FULL = [0, 0, 1280, 720];
    var CAM = []; STATES.forEach(function (st, i) { CAM[i] = st.cam || CAM[i - 1] || FULL; });

    /* slide 1 assembling (forward arrival only): offsets from state 0 and timings */
    var INTRO_DELAY = 380;   // most of the page turn (720 ms) has landed by then
    var INTRO = {
      wormF: { dx: -70, d: 0, t: 1200, ot: 700 }, wormP: { dx: 70, d: 90, t: 1200, ot: 700 },
      lblF: { dy: 14, d: 480, t: 650 }, lblP: { dy: 14, d: 560, t: 650 },
      m3: { k: 0.55, r: -24, d: 260, t: 950, ot: 600 }, m18: { k: 0.55, r: 24, d: 400, t: 950, ot: 600 },
      lbl3: { dy: 12, d: 720, t: 600 }, lbl18: { dy: 12, d: 820, t: 600 },
      swap: { k: 0.7, d: 940, t: 600 }
    };
    /* ms: how long the class stays on; hold: how much of it the step waits for
       (the ripple is an afterglow, the reader may scroll on while it fades) */
    var FX = { pulse: { ms: 900, hold: 800 }, ripple: { ms: 1700, hold: 500 } };

    /* ---------- layout ---------- */
    var tallMq = matchMedia('(max-aspect-ratio: 5/4), (max-width: 760px)');
    var layout = tallMq.matches ? 'tall' : 'wide';
    function camFor(i) { return layout === 'tall' ? CAM[i] : (STATES[i].wcam || FULL); }

    /* ---------- the map hand-over ----------
       Human Practices draws China face-on with a linear projection
       (home-maps.js: P3 with yaw 0). Measured from its map box, the same
       outline here lands exactly where that page will draw it. */
    function mapTarget() {
      var def = layout === 'tall' ? { x: 640, y: 372, s: 10.5 } : { x: 880, y: 392, s: 12.5 };
      var hp = document.getElementById('hp'), fig = hp && hp.querySelector('[data-hp-map]');
      if (layout !== 'wide' || !fig || !H.pager || !H.pager.isPaged()) return def;
      var fr = fig.getBoundingClientRect(), hr = hp.getBoundingClientRect(), sr = sec.getBoundingClientRect(), r = frame.getBoundingClientRect();
      if (fr.width < 120 || r.width < 120) return def;
      var w = fr.width, h = fr.height || w * 0.86, hmax = h * 0.12;
      var s = Math.min(w * 0.9 / (62.5 * 0.84 * 0.96), (h - hmax - 24) / 36.5);
      var cx = fr.left + w / 2, cy = (fr.top - hr.top) + hmax + (h - hmax) / 2;
      var k = r.width / 1280;
      return { x: (cx - r.left) / k, y: (cy - (r.top - sr.top)) / k, s: s / k };
    }
    function target(i) {
      var t = R[layout][i];
      if (STATES[i].set.map && STATES[i].set.map.dyn) { t = mix(t, {}); t.map = mix(t.map, mapTarget()); }
      return t;
    }

    /* ---------- drawing ---------- */
    function f(n) { return Math.round(n * 100) / 100; }
    function apply(o, v) {
      var tr = 'translate(' + f(v.x) + ' ' + f(v.y) + ')';
      if (v.r) tr += ' rotate(' + f(v.r) + ')';
      if (v.s !== 1 || v.sx !== 1) tr += ' scale(' + f(v.s * v.sx) + ' ' + f(v.s) + ')';
      o.el.setAttribute('transform', tr);
      var op = f(Math.max(0, Math.min(1, v.o)));
      o.el.style.opacity = op;
      o.el.style.visibility = op < 0.01 ? 'hidden' : '';
      o.v = v;
    }
    var camNow = null;
    function setCam(c) { camNow = c; svg.setAttribute('viewBox', c.map(f).join(' ')); }

    var cur = 0, anims = [], camA = null, raf = 0, timers = [], introEnd = 0;
    function clearFx() { timers.forEach(clearTimeout); timers = []; H.$$('.is-pulse, .is-ripple', svg).forEach(function (e) { e.classList.remove('is-pulse', 'is-ripple'); }); }
    function fx(o, kind, at) {
      var cls = 'is-' + kind, ms = FX[kind] ? FX[kind].ms : 900;
      timers.push(setTimeout(function () {
        o.el.classList.remove(cls);
        void o.el.getBoundingClientRect();   // reflow, so a repeated effect restarts (getBBox was only read, never called)
        o.el.classList.add(cls);
        timers.push(setTimeout(function () { o.el.classList.remove(cls); }, ms));
      }, at));
    }
    function same(a, b) { for (var i = 0; i < K.length; i++) if (Math.abs(a[K[i]] - b[K[i]]) > 1e-3) return false; return true; }

    function show(i) {
      caps.forEach(function (c) {
        var spec = (layout === 'tall' && c.getAttribute('data-as-tall')) || c.getAttribute('data-as-cap');
        c.classList.toggle('is-on', inRange(spec, i));
      });
      rail.forEach(function (li) {
        var r = li.getAttribute('data-ch').split('-'), a = +r[0], b = +(r[1] || r[0]);
        li.classList.toggle('is-on', i >= a && i <= b); li.classList.toggle('is-done', i > b);
        /* progress inside the chapter, and which dot the next scroll leads to */
        li.style.setProperty('--p', i > b ? 1 : i < a ? 0 : ((i - a + 1) / (b - a + 1)).toFixed(3));
        li.classList.toggle('is-next', i < N && i + 1 >= a && i + 1 <= b);
      });
      sec.setAttribute('data-as-step', String(i));
      if (i === N && H.hpWarm) H.hpWarm();
    }
    function inRange(spec, i) { var r = spec.split('-'), a = +r[0], b = +(r[1] || r[0]); return i >= a && i <= b; }

    function jump(i) {
      cancelAnimationFrame(raf); raf = 0; anims = []; camA = null; clearFx(); introEnd = 0;
      cur = i; var t = target(i);
      Object.keys(O).forEach(function (n) { apply(O[n], t[n]); });
      setCam(camFor(i)); show(i);
    }
    function goTo(i, dir, speed) {
      if (H.reduced) { jump(i); return 0; }
      var from = cur; cur = i; introEnd = 0;
      var back = dir < 0 || i < from;
      return run(target(i), back ? {} : STATES[i].set, back, 1 / Math.max(0.4, speed || 1), 0, camFor(i), i);
    }
    /* animate every object from where it is now to t. spec: per-object timings
       (STATES[i].set or INTRO); back: brisk reverse; k: speed; lag: added delay */
    function run(t, spec, back, k, lag, cam1, i) {
      cancelAnimationFrame(raf); raf = 0; clearFx();
      var total = 0, now = performance.now();
      anims = [];
      Object.keys(O).forEach(function (n) {
        var o = O[n], v1 = t[n], e = spec[n] || {};
        var v0 = mix(o.v, {});
        if (!back && e.from) K.forEach(function (key) { if (e.from[key] != null) v0[key] = e.from[key]; });
        if (!back && e.fx) fx(o, e.fx, ((e.fxd || 0) + lag) * k);
        if (same(v0, v1)) return;
        var d = back ? 0 : (e.d || 0) + lag, dur = back ? 700 : (e.t || 700);
        var od = back ? 0 : (e.od != null ? e.od + lag : d), ot = back ? 520 : (e.ot || dur);
        var a = { o: o, v0: v0, v1: v1, d: d * k, t: dur * k, od: od * k, ot: ot * k, via: back ? null : e.via };
        anims.push(a);
        total = Math.max(total, a.d + a.t, a.od + a.ot);
      });
      Object.keys(spec).forEach(function (n) { var e = spec[n]; if (e.fx && !back) total = Math.max(total, ((e.fxd || 0) + lag + (FX[e.fx] ? FX[e.fx].hold : 800)) * k); });
      var c0 = camNow || cam1;
      camA = c0.join() === cam1.join() ? null : { c0: c0, c1: cam1, t: Math.max(700 * k, Math.min(1300 * k, total)) };
      if (camA) total = Math.max(total, camA.t);
      show(i);
      var t0 = now;
      function tick(nw) {
        raf = 0; var live = false, el = nw - t0;
        anims.forEach(function (a) {
          var kp = H.clamp((el - a.d) / Math.max(1, a.t), 0, 1), ko = H.clamp((el - a.od) / Math.max(1, a.ot), 0, 1);
          var ep = H.ease(kp), eo = ko * ko * (3 - 2 * ko), v = {};
          if (a.via) {
            var u = ep, w0 = (1 - u) * (1 - u), w1 = 2 * (1 - u) * u, w2 = u * u;
            v.x = w0 * a.v0.x + w1 * a.via[0] + w2 * a.v1.x; v.y = w0 * a.v0.y + w1 * a.via[1] + w2 * a.v1.y;
          } else { v.x = H.lerp(a.v0.x, a.v1.x, ep); v.y = H.lerp(a.v0.y, a.v1.y, ep); }
          v.s = H.lerp(a.v0.s, a.v1.s, ep); v.sx = H.lerp(a.v0.sx, a.v1.sx, ep); v.r = H.lerp(a.v0.r, a.v1.r, ep);
          v.o = H.lerp(a.v0.o, a.v1.o, eo);
          apply(a.o, v);
          if (kp < 1 || ko < 1) live = true;
        });
        if (camA) {
          var kc = H.ease(H.clamp(el / camA.t, 0, 1));
          setCam(camA.c0.map(function (x, j) { return H.lerp(x, camA.c1[j], kc); }));
          if (kc < 1) live = true; else camA = null;
        }
        if (live) raf = requestAnimationFrame(tick); else anims = [];
      }
      raf = requestAnimationFrame(tick);
      return Math.round(total);
    }
    function finish() {
      introEnd = 0;
      if (!anims.length && !camA) return;
      cancelAnimationFrame(raf); raf = 0;
      anims.forEach(function (a) { apply(a.o, a.v1); }); anims = [];
      if (camA) setCam(camA.c1); camA = null;
    }
    /* slide 1 assembles while the page turn lands: worms crawl in, the two
       molecules turn into place, then the labels. Returns its length in ms. */
    function intro() {
      cancelAnimationFrame(raf); raf = 0; anims = []; camA = null; clearFx();
      cur = 0;
      var t = target(0);
      Object.keys(O).forEach(function (n) {
        var v = mix(t[n], {}), e = INTRO[n];
        if (e) {
          v.x += e.dx || 0; v.y += e.dy || 0; v.s *= e.k || 1; v.r += e.r || 0; v.o = 0;
        }
        apply(O[n], v);
      });
      setCam(camFor(0));
      var ms = run(t, INTRO, false, 1, INTRO_DELAY, camFor(0), 0);
      introEnd = performance.now() + ms;
      return ms;
    }

    /* captions: placed over the slide on wide screens (slide units -> %) */
    caps.forEach(function (c) {
      var p = (c.getAttribute('data-at') || '0,0,400').split(',').map(Number);
      c.style.setProperty('--cx', (p[0] / 12.8) + '%'); c.style.setProperty('--cy', (p[1] / 7.2) + '%'); c.style.setProperty('--cw', (p[2] / 12.8) + '%');
    });

    jump(0);
    function relayout() {
      var L = tallMq.matches ? 'tall' : 'wide';
      sec.classList.toggle('as--tall', L === 'tall');
      if (L !== layout) { layout = L; }
      jump(cur);
    }
    sec.classList.toggle('as--tall', layout === 'tall');
    var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(relayout, 160); });

    wormsAlive();

    H.scene('traces', {
      steps: N, tall: 9,
      /* the chapter rail below the stage shows progress, and the global scroll
         cue would sit on top of it (it covered "Yeast") */
      noCue: true,
      set: function (i, dir) {
        /* arriving from above in paged mode: slide 1 assembles as the page lands */
        if (i === 0 && dir > 0 && !H.reduced && H.pager && H.pager.isPaged()) intro(); else jump(i);
      },
      enter: function () { return Math.max(0, Math.round(introEnd - performance.now())); },
      step: function (i, dir, speed) { return goTo(i, dir, speed); },
      ff: finish
    });
    /* ---------- the worms undulate ----------
       Only the placeholder drawings (path.as-worm) are animated: a travelling
       sine wave from head to tail, like a nematode's own crawl. Replaced art in
       the data-art slot is left alone; reduced motion keeps the still drawing. */
    function wormsAlive() {
      if (H.reduced) return;
      var W = [
        { o: O.wormF, body: H.$('[data-art="worm-free"] path.as-worm', svg), x0: -100, x1: 100, amp: 15, cyc: 1.45, per: 2400, tilt: 0, head: 1 },
        { o: O.wormP, body: H.$('[data-art="worm-parasitic"] path.as-worm', svg), stylet: H.$('[data-art="worm-parasitic"] .as-worm-stylet', svg), x0: -92, x1: 94, amp: 17, cyc: 0.85, per: 3400, tilt: 64, head: 0 }
      ].filter(function (w) { return w.o && w.body; });
      if (!W.length) return;
      var SEG = 18, t0 = performance.now();
      function pts(w, t) {
        var out = [], ph = t / w.per;
        for (var j = 0; j <= SEG; j++) {
          var u = j / SEG, env = 0.6 + 0.4 * Math.sin(Math.PI * u);
          /* the wave runs from the head to the tail */
          var a = 2 * Math.PI * (w.cyc * u + (w.head ? ph : -ph));
          out.push([w.x0 + (w.x1 - w.x0) * u, (u - 0.5) * w.tilt + w.amp * env * Math.sin(a)]);
        }
        return out;
      }
      function smooth(p) {
        var d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
        for (var j = 0; j < p.length - 1; j++) {
          var a = p[j - 1] || p[j], b = p[j], c = p[j + 1], e = p[j + 2] || c;
          d += 'C' + f(b[0] + (c[0] - a[0]) / 6) + ' ' + f(b[1] + (c[1] - a[1]) / 6) + ' ' + f(c[0] - (e[0] - b[0]) / 6) + ' ' + f(c[1] - (e[1] - b[1]) / 6) + ' ' + f(c[0]) + ' ' + f(c[1]);
        }
        return d;
      }
      function draw(now) {
        var t = now - t0;
        W.forEach(function (w) {
          if (!w.o.v || w.o.v.o < 0.01) return;
          var p = pts(w, t);
          w.body.setAttribute('d', smooth(p));
          if (w.stylet) {
            var h = p[0], n = p[1], dx = h[0] - n[0], dy = h[1] - n[1], l = Math.hypot(dx, dy) || 1;
            w.stylet.setAttribute('d', 'M' + f(h[0]) + ' ' + f(h[1]) + 'L' + f(h[0] + dx / l * 14) + ' ' + f(h[1] + dy / l * 14));
          }
        });
      }
      draw(t0);
      H.visibleLoop(sec, draw);
    }

    /* for checks and the asset swap: jump to any state, read the timeline */
    H.ascrStory = { states: N, jump: jump, current: function () { return cur; }, objects: Object.keys(O),
      /* play one step forward or back as the pager would, and the arrival intro */
      play: function (i) { return goTo(i, i >= cur ? 1 : -1, 1); }, intro: intro,
      /* Human Practices cuts in only when the map really sits on its map box */
      handsOver: function () { return cur === N && layout === 'wide' && !!(H.pager && H.pager.isPaged()); } };
  }

  /* China, from the shared geography (home-geo.js) in the units Human
     Practices uses: x = (lon - 104.25) * 0.84 * 0.96, y = 35.75 - lat. */
  function buildMap(g) {
    var G = window.NKU_GEO && window.NKU_GEO.china; if (!g || !G) return;
    var NS = 'http://www.w3.org/2000/svg', LON0 = 104.25, LAT0 = 35.75;
    var IN = { lon0: 106, lon1: 124, lat0: 2.5, lat1: 24, k: 0.52, clon: 130.6, clat: 23.2 };
    function P(lon, lat) { return [(lon - LON0) * 0.84 * 0.96, LAT0 - lat]; }
    function PI(lon, lat) { return P(IN.clon + (lon - (IN.lon0 + IN.lon1) / 2) * IN.k, IN.clat + (lat - (IN.lat0 + IN.lat1) / 2) * IN.k); }
    function d(rings, proj, close) {
      return rings.map(function (r) { return 'M' + r.map(function (p) { var q = proj(p[0], p[1]); return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join('L') + (close ? 'Z' : ''); }).join('');
    }
    function el(tag, a, parent) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); parent.appendChild(e); return e; }
    el('path', { d: d(G.outline, P, true), 'class': 'as-map__land', 'vector-effect': 'non-scaling-stroke' }, g);
    var a = PI(IN.lon0, IN.lat1), b = PI(IN.lon1, IN.lat1), c = PI(IN.lon1, IN.lat0), e = PI(IN.lon0, IN.lat0);
    var box = 'M' + [a, b, c, e].map(function (q) { return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join('L') + 'Z';
    var cp = el('clipPath', { id: 'as-inset' }, g); el('path', { d: box }, cp);
    el('path', { d: box, 'class': 'as-map__inset', 'vector-effect': 'non-scaling-stroke' }, g);
    var ins = el('g', { 'clip-path': 'url(#as-inset)' }, g);
    el('path', { d: d(G.outline, PI, true), 'class': 'as-map__inland', 'vector-effect': 'non-scaling-stroke' }, ins);
    el('path', { d: d(G.maritime || [], PI, false), 'class': 'as-map__sea', 'vector-effect': 'non-scaling-stroke' }, ins);
    /* v8.2: the China outline is the Standard Map of China; its review number goes with the map */
    el('text', { x: e[0].toFixed(2), y: (e[1] + 1.6).toFixed(2), 'class': 'as-map__no' }, g).textContent = 'Map: GS(2022)4308';
  }
})();
