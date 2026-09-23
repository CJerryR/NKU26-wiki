/* NKU homepage — 04 threat · 05 traces · 06 combo · 07 signal · 08 loop · 09 built · 10 explore */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function wormD(x, y, len, ang, ph, amp, segs) {
    var d = '', ca = Math.cos(ang), sa = Math.sin(ang); segs = segs || 12;
    for (var i = 0; i <= segs; i++) { var u = i / segs, off = Math.sin(u * 6 + ph) * (amp || 6) * Math.sin(u * Math.PI); d += (i ? 'L' : 'M') + (x + ca * len * u - sa * off).toFixed(1) + ',' + (y + sa * len * u + ca * off).toFixed(1); }
    return d;
  }
  H.ready(function () { traces(); combo(); signal(); loop(); built(); explore(); });

  /* ================= 05 TRACES ================= */
  function traces() {
    var sec = H.$('[data-traces]'); if (!sec) return;
    var cv = H.$('[data-tr-canvas]', sec), ctx, w, h, parts = [], ghosts = [], stars = [], hot = null, vis = false, t0 = performance.now();
    var groups = H.$$('[data-tr-group]', sec);
    // clusters
    H.$$('[data-cluster]', sec).forEach(function (c) {
      var kind = c.getAttribute('data-cluster'), r = H.rand(kind === '3' ? 2 : 6);
      for (var i = 0; i < 9; i++) { var b = document.createElement('i'); b.style.setProperty('--x', (10 + r() * 70) + 'px'); b.style.setProperty('--y', (8 + r() * 60) + 'px'); b.style.setProperty('--s', (12 + r() * 14) + 'px'); b.style.setProperty('--dl', (r() * 3) + 's'); b.style.setProperty('--col', kind === '3' ? (i % 3 ? '#4c8dff' : '#9fc3ff') : (i % 3 ? '#ff5e86' : '#ffb0a0')); c.appendChild(b); }
    });
    function shuffle() {
      H.$$('[data-mix]', sec).forEach(function (m) {
        m.innerHTML = ''; var n = 5 + Math.floor(Math.random() * 3);
        for (var i = 0; i < n; i++) { var b = document.createElement('i'); b.style.setProperty('--col', Math.random() < .5 ? '#4c8dff' : '#ff5e86'); b.style.setProperty('--s', (10 + Math.random() * 8) + 'px'); m.appendChild(b); }
      });
    }
    shuffle(); var sh = setInterval(function () { if (vis && !H.reduced) shuffle(); }, 2600);
    function size() { w = sec.clientWidth; h = sec.clientHeight; ctx = H.fit(cv, w, h, 1.5); stars = []; var r = H.rand(9); for (var i = 0; i < 90; i++) stars.push([r() * w, r() * h * .7, r() * 1.6, r() * 6]); ghosts = []; var sr = sec.getBoundingClientRect(), anchors = groups.map(function (g) { var b = g.getBoundingClientRect(); return [b.left - sr.left + b.width / 2, b.top - sr.top + 70]; });
      var cl = H.$('.tr__pair', sec).getBoundingClientRect(); target = [cl.left - sr.left, cl.width, cl.top - sr.top + cl.height * .6];
      for (i = 0; i < 8; i++) { var an = anchors[i < 4 ? 0 : 1]; ghosts.push({ side: i < 4 ? 0 : 1, x: an[0] - 90 + r() * 110, y: an[1] - 40 + r() * 60, a: r() * 6, len: 60 + r() * 50, ph: r() * 6 }); } }
    var target = [0, 0, 0];
    function draw(now) {
      if (!vis) return; var t = (now - t0) / 1000; ctx.clearRect(0, 0, w, h);
      // hills
      ctx.fillStyle = '#2a1735'; ctx.beginPath(); ctx.moveTo(0, h * .3);
      for (var x = 0; x <= w; x += 30) ctx.lineTo(x, h * .28 - Math.sin(x / w * 5 + 1) * 40 - Math.sin(x / 70) * 8); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
      stars.forEach(function (s) { ctx.fillStyle = 'rgba(255,230,200,' + (.2 + .5 * Math.max(0, Math.sin(t + s[3]))) + ')'; ctx.fillRect(s[0], s[1], s[2], s[2]); });
      ghosts.forEach(function (g) {
        var hotG = hot === 'both' || hot === (g.side ? 'pp' : 'free');
        for (var i = 0; i < 30; i++) {
          var u = i / 29, off = Math.sin(u * 5 + t * 2 + g.ph) * 8, gx = g.x + Math.cos(g.a + Math.sin(t * .2 + g.ph) * .4) * g.len * u, gy = g.y + Math.sin(g.a) * g.len * u * .5 + off;
          ctx.fillStyle = 'rgba(230,210,240,' + (hotG ? .14 : .07) + ')'; ctx.beginPath(); ctx.arc(gx, gy, 7 * Math.sin(Math.PI * (.12 + u * .8)), 0, 6.29); ctx.fill();
        }
        if (Math.random() < (hotG ? .25 : .04)) parts.push({ x: g.x, y: g.y, vx: (Math.random() - .5) * .6, vy: -.2 - Math.random() * .4, c: Math.random() < .5 ? '76,141,255' : '255,94,134', life: 1, to: hotG ? (Math.random() < .5 ? .44 : .56) : 0 });
      });
      parts = parts.filter(function (p) { return p.life > 0; });
      parts.forEach(function (p) {
        if (p.to) { p.vx += ((target[0] + target[1] * (p.to < .5 ? .25 : .75) - p.x) * .0009); p.vy += ((target[2] - p.y) * .0009); }
        p.x += p.vx; p.y += p.vy; p.vx *= .99; p.vy *= .99; p.life -= .006;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9); g.addColorStop(0, 'rgba(' + p.c + ',' + p.life + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 6.29); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    groups.forEach(function (g) {
      var k = g.getAttribute('data-tr-group');
      g.addEventListener('pointerenter', function () { hot = k; g.classList.add('is-hot'); });
      g.addEventListener('pointerleave', function () { hot = null; g.classList.remove('is-hot'); });
      g.addEventListener('click', function () { hot = hot === k ? null : k; shuffle(); });
    });
    size(); addEventListener('resize', size);
    H.onView(sec, function (v) { var was = vis; vis = v; if (v && !was) requestAnimationFrame(draw); });
    var tt = 0;
    H.scene('traces', {
      steps: 1,
      set: function (i) { clearTimeout(tt); hot = null; sec.classList.toggle('is-told', i > 0); },
      step: function (i) {
        clearTimeout(tt);
        if (!i) { hot = null; sec.classList.remove('is-told'); return 400; }
        hot = 'both'; shuffle();
        tt = setTimeout(function () { hot = null; sec.classList.add('is-told'); }, 1700);
        return 2400;
      },
      ff: function () { clearTimeout(tt); hot = null; sec.classList.add('is-told'); }
    });
  }

  /* ================= 06 COMBO ================= */
  function combo() {
    var field = H.$('[data-co-field]'); if (!field) return;
    var orbs = H.$$('[data-orb]', field), read = H.$('[data-co-read]', field), wave = H.$('[data-co-wave]');
    var st = orbs.map(function (o) { return { el: o, x: 0, y: 0, tx: 0, ty: 0, drag: false }; });
    var merged = false, vis = false, t0 = performance.now();
    function setMerged(v, instant) {
      merged = v; field.classList.toggle('is-merged', v);
      var fw = field.clientWidth, ow = orbs[0].offsetWidth;
      var home0 = orbs[0].offsetLeft, home1 = orbs[1].offsetLeft, mid = fw / 2 - ow / 2;
      st[0].tx = v ? mid - home0 - ow * .3 : 0; st[1].tx = v ? mid - home1 + ow * .3 : 0; st[0].ty = st[1].ty = 0;
      read.textContent = v ? 'Read together: a pattern, not a single value.' : 'Drag one signal onto the other';
      if (instant) st.forEach(function (s2) { s2.x = s2.tx; s2.y = s2.ty; });
    }
    st.forEach(function (s, i) {
      var sx, sy, ox, oy;
      s.el.addEventListener('pointerdown', function (e) { s.drag = true; s.el.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = s.x; oy = s.y; });
      s.el.addEventListener('pointermove', function (e) { if (!s.drag) return; s.x = s.tx = ox + e.clientX - sx; s.y = s.ty = oy + e.clientY - sy; });
      s.el.addEventListener('pointerup', function () {
        if (!s.drag) return; s.drag = false;
        var a = orbs[0].getBoundingClientRect(), b = orbs[1].getBoundingClientRect();
        var d = Math.hypot(a.left + a.width / 2 - b.left - b.width / 2, a.top + a.height / 2 - b.top - b.height / 2);
        setMerged(d < a.width * .78 ? true : (merged && d < a.width * 1.1));
      });
      s.el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMerged(!merged); } });
    });
    function tick(now) {
      if (!vis) return; var t = (now - t0) / 1000;
      st.forEach(function (s, i) {
        if (!s.drag) { s.x += (s.tx - s.x) * .09; s.y += (s.ty - s.y) * .09; }
        var fx = H.reduced ? 0 : Math.sin(t * .7 + i * 2) * 6, fy = H.reduced ? 0 : Math.cos(t * .9 + i) * 8;
        s.el.style.transform = 'translate(' + (s.x + fx) + 'px,' + (s.y + fy) + 'px)';
      });
      if (wave) H.$$('path', wave).forEach(function (p, k) { var d = ''; for (var x = 0; x <= 140; x += 4) d += (x ? 'L' : 'M') + x + ',' + (20 + Math.sin(x / 14 + t * 2 + k * .8) * (6 + k * 2) * Math.sin(x / 140 * Math.PI)).toFixed(1); p.setAttribute('d', d); });
      requestAnimationFrame(tick);
    }
    H.onView(field, function (v) { var was = vis; vis = v; if (v && !was) requestAnimationFrame(tick); });
    H.scene('combo', {
      steps: 1,
      set: function (i) { setMerged(i > 0, true); },
      step: function (i) { setMerged(i > 0); return i ? 1300 : 800; },
      ff: function () { setMerged(merged, true); }
    });
  }

  /* ================= 07 SIGNAL → COLOUR ================= */
  function signal() {
    var sec = H.$('[data-signal]'); if (!sec) return;
    var nodes = H.$$('[data-node]', sec), wire = H.$('[data-sg-wire]', sec), run = H.$('[data-sg-run]', sec), amt = H.$('[data-sg-amount]', sec);
    var readout = H.$('[data-sg-readout]', sec), chip = H.$('[data-sg-chip]', sec), rgb = H.$('[data-sg-rgb]', sec), fill = H.$('.sg-fill', sec);
    var bind = H.$('.sg-bind', sec), pyr = H.$$('.sg-pyr circle', sec), timers = [], ran = false;
    wire.setAttribute('pathLength', 1000); wire.style.transition = 'stroke-dashoffset .9s cubic-bezier(.16,1,.3,1)';
    function at(ms, fn) { timers.push(setTimeout(fn, H.reduced ? 0 : ms)); }
    function colour() {
      var k = amt.value / 10, c = [Math.round(H.lerp(255, 245, k)), Math.round(H.lerp(246, 190, k)), Math.round(H.lerp(214, 20, k))];
      fill.style.fill = 'rgb(' + c + ')'; fill.style.transform = 'scaleY(' + (.25 + k * .75) + ')';
      chip.style.background = 'rgb(' + c + ')'; rgb.textContent = 'RGB(' + c.join(', ') + ')';
    }
    function go() {
      timers.forEach(clearTimeout); timers = []; ran = true;
      nodes.forEach(function (n) { n.classList.remove('is-on'); }); readout.classList.remove('is-on');
      wire.style.strokeDashoffset = 1000; bind.style.transform = 'translateY(-14px)'; fill.style.transform = 'scaleY(.08)';
      pyr.forEach(function (c) { c.style.opacity = .18; });
      at(80, function () { nodes[0].classList.add('is-on'); wire.style.strokeDashoffset = 800; });
      at(700, function () { nodes[1].classList.add('is-on'); bind.style.transform = 'translateY(16px)'; wire.style.strokeDashoffset = 600; });
      [0, 1, 1, 1, 2, 2, 2, 2, 2, 2].forEach(function (row, i) { at(1300 + row * 380 + i * 30, function () { pyr[i].style.opacity = 1; }); });
      at(1300, function () { nodes[2].classList.add('is-on'); wire.style.strokeDashoffset = 400; });
      at(2500, function () { nodes[3].classList.add('is-on'); wire.style.strokeDashoffset = 200; });
      at(3200, function () { nodes[4].classList.add('is-on'); wire.style.strokeDashoffset = 0; colour(); });
      at(4300, function () { readout.classList.add('is-on'); });
    }
    function reset() {
      timers.forEach(clearTimeout); timers = []; ran = false;
      nodes.forEach(function (n) { n.classList.remove('is-on'); }); readout.classList.remove('is-on');
      wire.style.strokeDashoffset = 1000; bind.style.transform = 'translateY(-14px)'; fill.style.transform = 'scaleY(.08)';
      pyr.forEach(function (c) { c.style.opacity = .18; });
    }
    function final() {
      timers.forEach(clearTimeout); timers = []; ran = true;
      nodes.forEach(function (n) { n.classList.add('is-on'); }); wire.style.strokeDashoffset = 0;
      bind.style.transform = 'translateY(16px)'; pyr.forEach(function (c) { c.style.opacity = 1; }); colour(); readout.classList.add('is-on');
    }
    run.addEventListener('click', go);
    amt.addEventListener('input', function () { if (ran) { colour(); readout.classList.add('is-on'); } });
    H.scene('signal', {
      steps: 1,
      set: function (i) { if (i) final(); else reset(); },
      step: function (i) { if (!i) { reset(); return 300; } go(); return 4500; },
      ff: final
    });
  }

  /* ================= 08 LOOP ================= */
  function loop() {
    var sec = H.$('[data-loop]'); if (!sec) return;
    var svg = H.$('[data-lp-svg]', sec), board = H.$('[data-lp-board]', sec), card = H.$('[data-lp-card]', sec);
    /* grid from the team's sketch (B11): dry lab | HP (questionnaire · centre · teaching/interviews) | wet lab */
    var C = [130, 370, 600, 840, 1110], R = [140, 310, 460], BOT = 566;
    var N = {
      data: [C[0], R[0], 'Data', 'dry', 'Soil and survey data used to tune the models.'],
      eco: [C[0], R[1], 'Eco model', 'dry', 'Estimates where and when the product could make economic sense.'],
      ode: [C[0], R[2], 'ODE model', 'dry', 'Links ascaroside input to pigment output over time.'],
      soil: [C[2], R[0], 'Soil survey', 'hp', 'Public soil sampling that feeds both labs.'],
      survey: [C[1], R[1], 'Questionnaire', 'hp', 'Growers’ needs and intentions, for the Eco model.'],
      society: [C[2], R[1], 'Society', 'core', 'The people and fields the project serves.'],
      project: [C[2], R[2], 'Our project', 'core', 'The sensor, its workflow and its limits.'],
      teach: [C[3], R[1], 'Teaching', 'hp', 'Classes and outreach that bring questions back.'],
      expert: [C[3], R[2], 'Expert interviews', 'hp', 'Agronomists and testers shape how results are used.'],
      samples: [C[4], R[0], 'Samples', 'wet', 'Real soil samples to test against.'],
      bench: [C[4], R[2], 'Bench tests', 'wet', 'Does the yeast respond, and can we read the colour?']
    };
    function box(k) { var n = N[k], core = n[3] === 'core', w = n[2].length * (core ? 9.8 : 8.6) + (core ? 30 : 26); return { x: n[0], y: n[1], w: w, h: 40, l: n[0] - w / 2, r: n[0] + w / 2, t: n[1] - 20, b: n[1] + 20 }; }
    var G = 7; // gap between a line end and a node
    /* each edge: from, to, label, route. Routes are orthogonal so nothing crosses. */
    function hz(a, b, y, lab) { var A = box(a), B = box(b), x0 = A.x < B.x ? A.r + G : A.l - G, x1 = A.x < B.x ? B.l - G : B.r + G; return { d: 'M' + x0 + ',' + y + 'H' + x1, lx: (x0 + x1) / 2, ly: y - 9, anchor: 'middle' }; }
    function vt(a, b, x, side, lab) { var A = box(a), B = box(b), y0 = A.y < B.y ? A.b + G : A.t - G, y1 = A.y < B.y ? B.t - G : B.b + G; return { d: 'M' + x + ',' + y0 + 'V' + y1, lx: x + side * 9, ly: (y0 + y1) / 2 + 5, anchor: side > 0 ? 'start' : 'end' }; }
    function under(a, b, y, xa, xb) { var A = box(a), B = box(b), r = 14; xa = xa == null ? A.x : xa; xb = xb == null ? B.x : xb; var y0 = A.b + G, y1 = B.b + G, dir = xb > xa ? 1 : -1;
      return { d: 'M' + xa + ',' + y0 + 'V' + (y - r) + 'Q' + xa + ',' + y + ' ' + (xa + dir * r) + ',' + y + 'H' + (xb - dir * r) + 'Q' + xb + ',' + y + ' ' + xb + ',' + (y - r) + 'V' + y1, lx: (xa + xb) / 2, ly: y + 20, anchor: 'middle' }; }
    var E = [
      ['soil', 'samples', 'provides', hz('soil', 'samples', R[0])],
      ['soil', 'data', 'provides', hz('soil', 'data', R[0])],
      ['samples', 'bench', 'tested', vt('samples', 'bench', C[4], 1)],
      ['data', 'eco', 'adjusts', vt('data', 'eco', C[0], 1)],
      ['bench', 'expert', 'raises questions', hz('bench', 'expert', R[2])],
      ['ode', 'bench', 'simulation analysis', under('ode', 'bench', BOT)],
      ['expert', 'project', 'guidance', hz('expert', 'project', R[2])],
      ['ode', 'project', 'optimises', hz('ode', 'project', R[2])],
      ['teach', 'society', 'feedback', hz('teach', 'society', R[1])],
      ['society', 'survey', 'fills in', hz('society', 'survey', R[1])],
      ['survey', 'eco', 'supports', hz('survey', 'eco', R[1])],
      ['eco', 'society', 'predicts', under('eco', 'society', R[1] + 64, C[0] + 26, C[2] - 26)],
      ['society', 'project', 'decides', vt('society', 'project', C[2] + 14, 1)],
      ['project', 'society', 'applied', vt('project', 'society', C[2] - 14, -1)]
    ];
    var QUESTION = { wet: 'Can we see it?', dry: 'Can we explain it?', hp: 'Can we use it to decide?', core: 'The centre of the loop' };
    var defs = el('defs', {}, svg), mk = el('marker', { id: 'lp-arrow', viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M1,1.5 L8.5,5 L1,8.5', fill: 'none', stroke: '#c8374f', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mk);
    [['Dry lab', C[0], 56], ['Human Practices', C[2], 50], ['Wet lab', C[4], 56]].forEach(function (c) { var tx = el('text', { x: c[1], y: c[2], 'text-anchor': 'middle', class: 'col' }, svg); tx.textContent = c[0]; });
    var eg = el('g', {}, svg), ng = el('g', {}, svg);
    var edges = E.map(function (e, i) {
      var g = el('g', { class: 'edge' }, eg), r = e[3];
      var path = el('path', { d: r.d }, g); el('path', { d: r.d, class: 'flow' }, g);
      var tx = el('text', { x: r.lx, y: r.ly, 'text-anchor': r.anchor }, g); tx.textContent = e[2];
      var L = path.getTotalLength ? path.getTotalLength() : 300;
      path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
      return { g: g, path: path, text: tx, a: e[0], b: e[1], L: L, i: i };
    });
    var nodes = {};
    Object.keys(N).forEach(function (k) {
      var n = N[k], b = box(k), g = el('g', { class: 'node' + (n[3] === 'core' ? ' core' : ''), tabindex: 0, role: 'button', 'aria-label': n[2] + ': ' + n[4] }, ng);
      el('rect', { x: b.l, y: b.t, width: b.w, height: b.h, rx: 20 }, g);
      var tx = el('text', { x: b.x, y: b.y + 6, 'text-anchor': 'middle' }, g); tx.textContent = n[2];
      nodes[k] = g;
      g.addEventListener('pointerenter', function () { if (drawn) { focus([k]); show(k); } });
      g.addEventListener('pointerleave', function () { if (!playing) { focus(null); card.hidden = true; } });
      g.addEventListener('click', function () { focus([k]); show(k); });
      g.addEventListener('focus', function () { focus([k]); show(k); });
    });
    /* drawing the connections is this page's step */
    var drawn = false, dtm = [];
    function drawAll(on, instant) {
      dtm.forEach(clearTimeout); dtm = []; drawn = on;
      board.classList.toggle('is-drawn', on);
      edges.forEach(function (e, i) {
        var delay = instant || !on ? 0 : i * 170;
        e.path.style.transition = instant ? 'none' : 'stroke-dashoffset .55s cubic-bezier(.3,.7,.2,1) ' + delay + 'ms';
        e.text.style.transitionDelay = instant ? '0ms' : (delay + 280) + 'ms';
        e.path.style.strokeDashoffset = on ? 0 : e.L;
        e.path.removeAttribute('marker-end');
        if (on) { if (instant) e.path.setAttribute('marker-end', 'url(#lp-arrow)'); else dtm.push(setTimeout(function () { e.path.setAttribute('marker-end', 'url(#lp-arrow)'); }, delay + 480)); }
      });
    }
    function focus(keys, onlyEdges) {
      board.classList.toggle('is-focus', !!keys);
      H.$$('.is-hl', svg).forEach(function (x) { x.classList.remove('is-hl'); });
      if (!keys) return;
      keys.forEach(function (k) { nodes[k].classList.add('is-hl'); });
      edges.forEach(function (e) {
        var hit = onlyEdges ? onlyEdges.indexOf(e) >= 0 : (keys.indexOf(e.a) >= 0 || keys.indexOf(e.b) >= 0);
        if (hit) { e.g.classList.add('is-hl'); nodes[e.a].classList.add('is-hl'); nodes[e.b].classList.add('is-hl'); }
      });
    }
    function show(k) {
      var n = N[k], r = board.getBoundingClientRect(), sx = r.width / 1200, sy = r.height / 620;
      card.innerHTML = '<b>' + n[2] + '</b>' + n[4] + '<em>' + QUESTION[n[3]] + '</em>';
      var b = box(k), x = n[0] * sx, y = b.b * sy + 10; card.hidden = false;
      card.style.left = H.clamp(x - 125, 0, r.width - 250) + 'px'; card.style.top = H.clamp(y, 0, r.height - 110) + 'px';
    }
    H.$$('[data-q]', sec).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!drawn) drawAll(true, true);
        var on = b.getAttribute('aria-pressed') !== 'true';
        H.$$('[data-q]', sec).forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', on ? 'true' : 'false'); card.hidden = true;
        var q = b.getAttribute('data-q');
        focus(on ? Object.keys(N).filter(function (k) { return N[k][3] === q; }) : null);
      });
    });
    // play the loop: a field question travels through the labs and back to society
    var seq = [['soil', 'samples'], ['samples', 'bench'], ['bench', 'expert'], ['expert', 'project'], ['project', 'society'], ['society', 'survey'], ['survey', 'eco'], ['eco', 'society'], ['society', 'project']];
    var dot = el('circle', { r: 7, class: 'lp__dot', opacity: 0 }, svg), playing = false;
    H.$('[data-lp-play]', sec).addEventListener('click', function () {
      if (playing) return; playing = true; if (!drawn) drawAll(true, true); var i = 0;
      (function step() {
        if (i >= seq.length) { playing = false; dot.setAttribute('opacity', 0); focus(null); card.hidden = true; return; }
        var e = edges.filter(function (x) { return x.a === seq[i][0] && x.b === seq[i][1]; })[0];
        focus([e.a, e.b], [e]); show(e.b);
        var L = e.L, s0 = performance.now(); dot.setAttribute('opacity', 1);
        (function mv(now) { var k = H.clamp((now - s0) / 900, 0, 1), p = e.path.getPointAtLength(L * H.ease(k)); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); if (k < 1) requestAnimationFrame(mv); else { i++; setTimeout(step, 200); } })(s0);
      })();
    });
    H.scene('loop', {
      steps: 1,
      set: function (i) { drawAll(i > 0, true); },
      step: function (i) { drawAll(i > 0, false); return i ? edges.length * 170 + 560 : 300; },
      ff: function () { drawAll(true, true); }
    });
  }

  /* ================= 09 BUILT ================= */
  function built() {
    H.$$('[data-art]').forEach(function (card) {
      var cv = H.$('canvas', card), kind = card.getAttribute('data-art'), ctx, w, h, hover = false, vis = false, t0 = performance.now(), r = H.rand(kind.length * 7);
      var net = []; for (var i = 0; i < 26; i++) net.push([r(), r(), r()]);
      function size() { w = card.clientWidth; h = card.clientHeight; ctx = H.fit(cv, w, h, 2); }
      function glow(x, y, rad, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      function ball(x, y, rad, col) { var g = ctx.createRadialGradient(x - rad * .35, y - rad * .35, 1, x, y, rad); g.addColorStop(0, '#fff'); g.addColorStop(.35, col); g.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.29); ctx.fill(); }
      function draw(now) {
        if (!vis) return; var t = (now - t0) / 1000 * (hover ? 1.8 : .6), cx = w * .62, cy = h * .6;
        ctx.clearRect(0, 0, w, h); var bg = ctx.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#221430'); bg.addColorStop(1, '#130a19'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        if (kind === 'yeast') {
          glow(cx, cy, h * .6, '160,110,240', .35);
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.3 + Math.sin(t) * .05);
          ctx.fillStyle = 'rgba(200,170,255,.35)'; ctx.strokeStyle = 'rgba(230,210,255,.7)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(0, 0, h * .34, h * .25, 0, 0, 6.29); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(h * .34, -h * .12, h * .09, h * .08, 0, 0, 6.29); ctx.fill(); ctx.stroke();
          for (var k = 0; k < 6; k++) { ctx.fillStyle = ['rgba(255,140,120,.7)', 'rgba(255,210,120,.7)', 'rgba(140,200,255,.6)'][k % 3]; ctx.beginPath(); ctx.arc(Math.cos(k * 1.7 + t) * h * .15, Math.sin(k * 2.3 + t) * h * .1, 4 + k % 3 * 2, 0, 6.29); ctx.fill(); }
          ctx.restore();
        }
        if (kind === 'pair') {
          [['76,141,255', '#4c8dff', w * .42], ['255,140,60', '#ff9a4a', w * .72]].forEach(function (m, j) {
            var x = m[2], y = cy + Math.sin(t + j) * 6; glow(x, y, h * .35, m[0], .35);
            var pts = [[0, 0], [-26, 18], [26, 18], [0, -28]];
            ctx.strokeStyle = m[1]; ctx.lineWidth = 3; pts.slice(1).forEach(function (p) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + p[0], y + p[1]); ctx.stroke(); });
            pts.forEach(function (p, k) { ball(x + p[0], y + p[1], k ? 9 : 12, m[1]); });
          });
        }
        if (kind === 'receptor') {
          glow(cx, cy, h * .5, '150,90,230', .3);
          ctx.strokeStyle = '#a77bf0'; ctx.lineWidth = 16; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(cx, h * .95); ctx.lineTo(cx, cy); ctx.lineTo(cx - 26, cy - 40); ctx.moveTo(cx, cy); ctx.lineTo(cx + 26, cy - 40); ctx.stroke();
          ball(cx - 70 + Math.sin(t) * 8, cy - 30, 11, '#ff7a5a'); ball(cx + 64, cy - 60 + Math.cos(t) * 8, 7, '#e86bff'); ball(cx + 18 * Math.sin(t * .7), cy - 70, 6, '#ff5e86');
        }
        if (kind === 'color') {
          [[.7, .55, .28], [.46, .72, .12], [.58, .82, .08]].forEach(function (d, j) { var x = w * d[0], y = h * d[1] + Math.sin(t + j) * 5; glow(x, y, h * d[2] * 2, '245,194,27', .35); ball(x, y, h * d[2], '#f5c21b'); });
        }
        if (kind === 'model') {
          ctx.strokeStyle = 'rgba(120,160,255,.35)'; ctx.lineWidth = 1;
          for (var c = 0; c < 7; c++) { ctx.beginPath(); for (var x2 = 0; x2 <= w; x2 += 8) { var y2 = h * (.3 + c * .1) + Math.sin(x2 / 40 + c + t * .5) * 10; x2 ? ctx.lineTo(x2, y2) : ctx.moveTo(x2, y2); } ctx.stroke(); }
          net.forEach(function (n, k) { var x3 = w * (.3 + n[0] * .7), y3 = h * (.3 + n[1] * .6) + Math.sin(t + k) * 3; ctx.fillStyle = ['#6ff3de', '#ffa24a', '#4c8dff'][k % 3]; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x3, y3, 2 + n[2] * 2.5, 0, 6.29); ctx.fill(); });
          ctx.shadowBlur = 0;
        }
        if (kind === 'field') {
          ctx.fillStyle = '#2b1d22'; ctx.beginPath(); ctx.moveTo(0, h); for (var x4 = 0; x4 <= w; x4 += 10) ctx.lineTo(x4, h * .82 - Math.sin(x4 / w * 6) * 10); ctx.lineTo(w, h); ctx.fill();
          for (var s = 0; s < 5; s++) {
            var px = w * (.36 + s * .14), py = h * .82 - Math.sin(px / w * 6) * 10, ph = h * (.22 + s * .04), sw = Math.sin(t + s) * .06;
            ctx.save(); ctx.translate(px, py); ctx.rotate(sw); ctx.strokeStyle = '#7fae5a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -ph); ctx.stroke();
            [[-1, .55], [1, .75], [-1, .95]].forEach(function (l) { ctx.save(); ctx.translate(0, -ph * l[1]); ctx.scale(l[0], 1); ctx.fillStyle = '#8fc063'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(12, -12, 24, -4); ctx.quadraticCurveTo(12, 4, 0, 0); ctx.fill(); ctx.restore(); });
            ctx.restore();
          }
        }
        requestAnimationFrame(draw);
      }
      card.addEventListener('pointermove', function (e) { var b = card.getBoundingClientRect(); card.style.setProperty('--ry', ((e.clientX - b.left) / b.width - .5) * 10 + 'deg'); card.style.setProperty('--rx', -((e.clientY - b.top) / b.height - .5) * 10 + 'deg'); hover = true; });
      card.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); hover = false; });
      size(); addEventListener('resize', size);
      H.onView(card, function (v) { var was = vis; vis = v; if (v && !was) requestAnimationFrame(draw); });
    });
  }

  /* ================= 10 EXPLORE ================= */
  function explore() {
    var sec = H.$('#explore'); if (!sec) return;
    var masc = H.$('[data-ex-mascot]', sec);
    sec.addEventListener('pointermove', function (e) {
      if (H.reduced || !masc) return; var b = masc.getBoundingClientRect(), dx = (e.clientX - b.left - b.width / 2) / innerWidth, dy = (e.clientY - b.top - b.height / 2) / innerHeight;
      masc.style.transform = 'translate(' + dx * 24 + 'px,' + dy * 18 + 'px) rotate(' + dx * 8 + 'deg)';
    });
    H.$$('[data-ex-grid] a', sec).forEach(function (a) { a.addEventListener('pointermove', function (e) { var b = a.getBoundingClientRect(); a.style.setProperty('--gx', (e.clientX - b.left) + 'px'); a.style.setProperty('--gy', (e.clientY - b.top) + 'px'); }); });
    var path = H.$('[data-ex-path]', sec), lis = H.$$('li', path), beam = H.$('.ex__beam', path);
    H.once(path, function () {
      var ol = H.$('ol', path); beam.style.setProperty('--ty', ol.offsetTop + 'px'); beam.style.width = (ol.offsetWidth - 12) + 'px';
      lis.forEach(function (li, i) { setTimeout(function () { li.classList.add('is-on'); }, H.reduced ? 0 : 200 + i * 900); });
    }, .5);
  }
})();
