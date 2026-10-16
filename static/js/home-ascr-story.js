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
       fx    'pulse': a short glow, like the slides' colour pulse
       P     overrides used on tall (portrait) screens
   - STATES[i].cam is the part of the slide a tall screen shows (viewBox).
   Going backwards replays the same states in reverse, briskly (700 ms). */
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
    /* positions along the DNA in the nucleus (centre 739,438, axis -41 deg) */
    function onDna(t) { return { x: 739 + 0.755 * t, y: 438 - 0.656 * t }; }
    function mix(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }

    var STATES = [
      /* 0 · slide 1: two signals, two kinds of nematode */
      { cam: [330, 40, 620, 660], set: {
        m3: { x: 448, y: 282, s: 1, o: 1, P: { x: 480, y: 165, s: 0.6 } }, m18: { x: 812, y: 282, s: 1, o: 1, P: { x: 800, y: 165, s: 0.6 } },
        lbl3: { x: 448, y: 196, o: 1, P: { x: 480, y: 102 } }, lbl18: { x: 812, y: 196, o: 1, P: { x: 800, y: 102 } },
        swap: { x: 630, y: 282, o: 1, P: { x: 640, y: 165, s: 0.55 } },
        wormF: { x: 168, y: 236, s: 1.05, o: 1, P: { x: 480, y: 300, s: 0.85 } }, wormP: { x: 1110, y: 236, s: 1.05, o: 1, P: { x: 800, y: 300, s: 0.85 } },
        lblF: { x: 168, y: 318, o: 1, P: { x: 480, y: 372 } }, lblP: { x: 1110, y: 318, o: 1, P: { x: 800, y: 372 } },
        barF: { x: 168, y: 418, o: 1, P: { x: 480, y: 462, s: 1.1 } }, barP: { x: 1110, y: 418, o: 1, P: { x: 800, y: 462, s: 1.1 } },
        barFi: { sx: 0.001, o: 1 }, barPi: { sx: 0.001, o: 1 },
        ratF: { x: 168, y: 470, o: 0, P: { x: 480, y: 520 } }, ratP: { x: 1110, y: 470, o: 0, P: { x: 800, y: 520 } },
        ask: { x: 630, y: 420, o: 0, P: { x: 640, y: 610 } },
        rec: { x: 300, y: 490, s: 0.92, o: 0 }, recD: { x: 301, y: 496, o: 1 }, recL: { x: 289, y: 480, o: 1 },
        pocket: { x: 356, y: 382, o: 1 }, mut: { x: 926, y: 337, o: 0 },
        fung: { x: 760, y: 330, s: 0.9, o: 0 }, scr: { x: 873, y: 362, s: 0.96, o: 0 },
        cell: { x: 647, y: 391, s: 0.9, o: 0 }, nuc: { x: 739, y: 438, o: 1 }, dna: { x: 739, y: 438, o: 1 },
        prom: mix(onDna(10), { o: 1 }), gene: mix(onDna(95), { o: 1 }), tf: mix(onDna(-130), { o: 1 }),
        gB: { x: 418, y: 262, o: 0 }, gG: { x: 452, y: 246, o: 0 }, sig: { x: 540, y: 330, o: 0 },
        arc: { x: 410, y: 270, s: 0.9, o: 0 }, out: { x: 900, y: 330, s: 1.2, o: 0 },
        glow: { x: 1110, y: 296, o: 0 }, lblBx: { x: 1110, y: 306, o: 0 },
        strip: { x: 260, y: 409, o: 0 }, spot: { x: 58, y: -4, o: 0 }, lblStrip: { x: 260, y: 470, o: 0 },
        box: { x: 560, y: 556, s: 0.72, o: 0 }, lblBox: { x: 560, y: 660, o: 0 },
        map: { x: 949, y: 220, s: 6, o: 0 }
      } },
      /* 1 · the ratio */
      { cam: [330, 40, 620, 660], set: {
        barFi: { sx: 1, t: 1100 }, barPi: { sx: 1, d: 150, t: 1100 },
        ratF: { o: 1, d: 700, t: 500 }, ratP: { o: 1, d: 850, t: 500 }, ask: { o: 1, d: 1100, t: 600 }
      } },
      /* 2 · slide 2 (Morph): the molecules rise, the receptor and the fungus arrive */
      { cam: [0, 0, 1280, 720], set: {
        m3: { x: 291, y: 130, s: 0.62, t: 1100 }, m18: { x: 889, y: 130, s: 0.62, t: 1100 },
        lbl3: { x: 291, y: 72, t: 1100 }, lbl18: { x: 889, y: 72, t: 1100 },
        swap: HIDE, wormF: HIDE, wormP: HIDE, lblF: HIDE, lblP: HIDE, barF: HIDE, barP: HIDE, ratF: HIDE, ratP: HIDE, ask: HIDE,
        rec: { s: 1, o: 1, d: 300, t: 900 }, fung: { s: 1, o: 1, d: 450, t: 900 }
      } },
      /* 3 · clicks 1-3: the fungus fades, ascr#3 docks, the receptor changes state */
      { cam: [0, 0, 1280, 720], set: {
        fung: { o: 0, t: 500 },
        m3: { x: 330, y: 432, s: 0.36, via: [214, 330], d: 200, t: 1500 },
        recD: { o: 0, d: 1300, t: 700 },
        lbl3: { o: 0, d: 200, t: 400 }
      } },
      /* 4 · clicks 4-6: the computer; the pocket flies to the screen and pulses */
      { cam: [0, 80, 1280, 640], set: {
        m3: { o: 0, t: 400 }, recD: { o: 1, t: 500 },
        scr: { s: 1, o: 1, t: 600 },
        pocket: { x: 926, y: 337, via: [640, 250], d: 400, t: 1400, fx: 'pulse', fxd: 1850 }
      } },
      /* 5 · clicks 7-8: the redesigned pocket goes back into the receptor */
      { cam: [0, 80, 1280, 640], set: {
        pocket: { o: 0, t: 350 },
        mut: { x: 356, y: 382, o: 1, via: [650, 470], d: 250, t: 1500, ot: 300 }
      } },
      /* 6 · clicks 9-11: ascr#18 docks; the receptor switches state, then lets go */
      { cam: [0, 0, 1280, 720], set: {
        scr: { o: 0, t: 500 },
        m18: { x: 330, y: 432, s: 0.36, via: [600, 200], d: 200, t: 1500 },
        lbl18: { o: 0, d: 200, t: 400 },
        recD: { o: 0, d: 1500, t: 500 }, recL: { o: 1 }
      } },
      /* 7 · slide 3 (Morph): the receptor shrinks to the corner, the yeast appears */
      { cam: [0, 0, 1080, 720], set: {
        m18: { x: 60, y: 70, s: 0.3, o: 1, from: { x: 60, y: 70, s: 0.3, o: 0 }, d: 900, t: 500 },
        rec: { x: 214, y: 136, s: 0.42, r: -58, t: 1300 }, recD: { o: 1, t: 600 },
        cell: { s: 1, o: 1, d: 250, t: 1100 }
      } },
      /* 8 · clicks 1-2: into the membrane; the G protein waits underneath */
      { cam: [180, 60, 900, 660], set: {
        rec: { x: 373, y: 222, t: 1200 },
        gB: { o: 1, d: 1000, t: 450 }, gG: { o: 1, d: 1300, t: 450 }
      } },
      /* 9 · clicks 3-4: ascr#18 binds, the signal travels to the nucleus */
      { cam: [180, 60, 900, 660], set: {
        m18: { x: 345, y: 176, via: [150, 200], t: 1100 },
        recD: { o: 0, d: 900, t: 600 },
        arc: { o: 1, d: 1200, t: 400 },
        gB: { fx: 'pulse', fxd: 1400 },
        gG: { x: 612, y: 418, via: [470, 360], d: 1700, t: 1300, fx: 'pulse', fxd: 1400 },
        sig: { o: 1, d: 1600, t: 700 },
        tf: mix(onDna(-46), { d: 3000, t: 1000, fx: 'pulse', fxd: 3000 })
      } },
      /* 10 · clicks 5-6: pigment out */
      { cam: [180, 60, 1100, 660], set: {
        gene: { fx: 'pulse', fxd: 0 },
        out: { o: 1, d: 200, t: 600 },
        glow: { o: 1, d: 700, t: 700 }, lblBx: { o: 1, d: 800, t: 600 }
      } },
      /* 11 · slide 4 (Morph): the yeast shrinks; strip, kit and map */
      { cam: [100, 20, 1080, 690], set: {
        m18: HIDE, rec: HIDE,
        cell: { x: 290, y: 174, s: 0.34, t: 1300 },
        dna: HIDE, prom: HIDE, gene: HIDE, tf: HIDE, gB: HIDE, gG: HIDE, sig: HIDE, arc: HIDE, out: HIDE, glow: HIDE, lblBx: HIDE,
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
        map: { fx: 'pulse', fxd: 3400 }
      } },
      /* 13 · slide 5: the map takes Human Practices' place (computed in mapTarget) */
      { cam: [300, 60, 680, 620], set: {
        map: { dyn: true, t: 1300 }
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
    var CAM = []; STATES.forEach(function (st, i) { CAM[i] = st.cam || CAM[i - 1] || [0, 0, 1280, 720]; });

    /* ---------- layout ---------- */
    var tallMq = matchMedia('(max-aspect-ratio: 5/4), (max-width: 760px)');
    var layout = tallMq.matches ? 'tall' : 'wide';
    function camFor(i) { return layout === 'tall' ? CAM[i] : [0, 0, 1280, 720]; }

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

    var cur = 0, anims = [], camA = null, raf = 0, timers = [];
    function clearFx() { timers.forEach(clearTimeout); timers = []; H.$$('.is-pulse', svg).forEach(function (e) { e.classList.remove('is-pulse'); }); }
    function pulse(o, at) {
      timers.push(setTimeout(function () { o.el.classList.remove('is-pulse'); void o.el.getBBox; o.el.classList.add('is-pulse'); timers.push(setTimeout(function () { o.el.classList.remove('is-pulse'); }, 900)); }, at));
    }
    function same(a, b) { for (var i = 0; i < K.length; i++) if (Math.abs(a[K[i]] - b[K[i]]) > 1e-3) return false; return true; }

    function show(i) {
      caps.forEach(function (c) { c.classList.toggle('is-on', inRange(c.getAttribute('data-as-cap'), i)); });
      rail.forEach(function (li) {
        var r = li.getAttribute('data-ch').split('-'), a = +r[0], b = +(r[1] || r[0]);
        li.classList.toggle('is-on', i >= a && i <= b); li.classList.toggle('is-done', i > b);
      });
      sec.setAttribute('data-as-step', String(i));
      if (i === N && H.hpWarm) H.hpWarm();
    }
    function inRange(spec, i) { var r = spec.split('-'), a = +r[0], b = +(r[1] || r[0]); return i >= a && i <= b; }

    function jump(i) {
      cancelAnimationFrame(raf); raf = 0; anims = []; camA = null; clearFx();
      cur = i; var t = target(i);
      Object.keys(O).forEach(function (n) { apply(O[n], t[n]); });
      setCam(camFor(i)); show(i);
    }
    function goTo(i, dir, speed) {
      if (H.reduced) { jump(i); return 0; }
      cancelAnimationFrame(raf); raf = 0; clearFx();
      var from = cur; cur = i;
      var t = target(i), k = 1 / Math.max(0.4, speed || 1), back = dir < 0 || i < from;
      var spec = back ? {} : STATES[i].set, total = 0, now = performance.now();
      anims = [];
      Object.keys(O).forEach(function (n) {
        var o = O[n], v1 = t[n], e = spec[n] || {};
        var v0 = mix(o.v, {});
        if (!back && e.from) K.forEach(function (key) { if (e.from[key] != null) v0[key] = e.from[key]; });
        if (!back && e.fx === 'pulse') pulse(o, (e.fxd || 0) * k);
        if (same(v0, v1)) return;
        var d = back ? 0 : (e.d || 0), dur = back ? 700 : (e.t || 700);
        var od = back ? 0 : (e.od != null ? e.od : d), ot = back ? 520 : (e.ot || dur);
        var a = { o: o, v0: v0, v1: v1, d: d * k, t: dur * k, od: od * k, ot: ot * k, via: back ? null : e.via };
        anims.push(a);
        total = Math.max(total, a.d + a.t, a.od + a.ot);
      });
      Object.keys(spec).forEach(function (n) { var e = spec[n]; if (e.fx === 'pulse') total = Math.max(total, ((e.fxd || 0) + 800) * k); });
      var c1 = camFor(i), c0 = camNow || c1;
      camA = c0.join() === c1.join() ? null : { c0: c0, c1: c1, t: Math.max(700 * k, Math.min(1300 * k, total)) };
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
      if (!anims.length && !camA) return;
      cancelAnimationFrame(raf); raf = 0;
      anims.forEach(function (a) { apply(a.o, a.v1); }); anims = [];
      if (camA) setCam(camA.c1); camA = null;
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

    H.scene('traces', {
      steps: N, tall: 9,
      set: function (i) { jump(i); },
      step: function (i, dir, speed) { return goTo(i, dir, speed); },
      ff: finish
    });
    /* for checks and the asset swap: jump to any state, read the timeline */
    H.ascrStory = { states: N, jump: jump, current: function () { return cur; }, objects: Object.keys(O),
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
