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
  H.ready(function () { traces(); combo(); signal(); labFlow(); loop(); built(); explore(); });

  /* ================= 05 TRACES ================= */
  function traces() {
    var sec = H.$('[data-traces]'); if (!sec) return;
    var cv = H.$('[data-tr-canvas]', sec), ctx, w, h, parts = [], ghosts = [], stars = [], hot = null, vis = false, t0 = performance.now();
    if (!cv) return; // The replacement ascaroside story has no legacy traces canvas.
    var groups = H.$$('[data-tr-group]', sec);
    // clusters
    H.$$('[data-cluster]', sec).forEach(function (c) {
      /* R1-H07: one soft cloud with a short trail of pale droplets, after ascr.ai */
      var kind = c.getAttribute('data-cluster'), r = H.rand(kind === '3' ? 2 : 6), blue = kind === '3';
      var cloud = document.createElement('i'); cloud.className = 'tr__cloud'; c.appendChild(cloud);
      var drops = blue ? [[4, 20, 13, 17], [70, 16, 14, 11], [96, 40, 24, 15], [120, 50, 18, 13], [60, 70, 20, 14]] : [[0, 34, 14, 18], [84, 52, 12, 10], [100, 46, 19, 14], [122, 30, 18, 16], [80, 70, 21, 15]];
      drops.forEach(function (d, i) { var b = document.createElement('i'); b.className = 'tr__drop'; b.style.setProperty('--x', d[0] + 'px'); b.style.setProperty('--y', d[1] + 'px'); b.style.setProperty('--w', d[2] + 'px'); b.style.setProperty('--h', d[3] + 'px'); b.style.setProperty('--dl', (r() * 3).toFixed(2) + 's'); b.style.setProperty('--rot', ((r() - .5) * 50).toFixed(0) + 'deg'); c.appendChild(b); });
    });
    function shuffle() {
      H.$$('[data-mix]', sec).forEach(function (m) {
        /* R1-H07: the mix is a ring of soft blue (ascr#3) / pink (ascr#18) glows round the worm */
        m.innerHTML = ''; var n = 5, a0 = Math.random() * 6.28;
        for (var i = 0; i < n; i++) { var b = document.createElement('i'), a = a0 + i * 6.283 / n + (Math.random() - .5) * .5, rr = 28 + Math.random() * 14, big = i < 4;
          b.style.setProperty('--col', Math.random() < .5 ? 'var(--tr-blue)' : 'var(--tr-pink)'); b.style.setProperty('--s', (big ? 56 + Math.random() * 18 : 22 + Math.random() * 8) + 'px');
          b.style.setProperty('--x', (Math.cos(a) * rr * 1.25).toFixed(1) + 'px'); b.style.setProperty('--y', (Math.sin(a) * rr * .8).toFixed(1) + 'px'); m.appendChild(b); }
      });
    }
    shuffle(); var sh = setInterval(function () { if (vis && !H.reduced) shuffle(); }, 2600);
    function size() { w = sec.clientWidth; h = sec.clientHeight; ctx = H.fit(cv, w, h, 1.5); stars = []; var r = H.rand(9); for (var i = 0; i < 90; i++) stars.push([r() * w, r() * h * .7, r() * 1.6, r() * 6]); ghosts = []; var sr = sec.getBoundingClientRect(), anchors = groups.map(function (g) { var f = H.$('.tr__fig', g) || g, b = f.getBoundingClientRect(); return [b.left - sr.left + b.width / 2, b.top - sr.top + b.height / 2]; });
      var cl = H.$('.tr__pair', sec).getBoundingClientRect(); target = [cl.left - sr.left, cl.width, cl.top - sr.top + cl.height * .6];
      for (i = 0; i < 8; i++) { var an = anchors[i < 4 ? 0 : 1]; ghosts.push({ side: i < 4 ? 0 : 1, x: an[0] - 30 + r() * 60, y: an[1] - 18 + r() * 36, a: r() * 6, len: 60 + r() * 50, ph: r() * 6 }); } }
    var target = [0, 0, 0];
    function draw(now) {
      if (!vis) return; var t = (now - t0) / 1000; ctx.clearRect(0, 0, w, h);
      // hills
      ctx.fillStyle = '#2a1735'; ctx.beginPath(); ctx.moveTo(0, h * .3);
      for (var x = 0; x <= w; x += 30) ctx.lineTo(x, h * .28 - Math.sin(x / w * 5 + 1) * 40 - Math.sin(x / 70) * 8); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
      stars.forEach(function (s) { ctx.fillStyle = 'rgba(255,230,200,' + (.2 + .5 * Math.max(0, Math.sin(t + s[3]))) + ')'; ctx.fillRect(s[0], s[1], s[2], s[2]); });
      ghosts.forEach(function (g) {
        var hotG = hot === 'both' || hot === (g.side ? 'pp' : 'free');
        /* R1-H07: the worms themselves are the white SVG figures; the canvas only carries the signal */
        if (Math.random() < (hotG ? .25 : .04)) parts.push({ x: g.x, y: g.y, vx: (Math.random() - .5) * .6, vy: -.2 - Math.random() * .4, c: Math.random() < .5 ? '143,186,236' : '236,166,201', life: 1, to: hotG ? (Math.random() < .5 ? .44 : .56) : 0 });
      });
      parts = parts.filter(function (p) { return p.life > 0; });
      parts.forEach(function (p) {
        if (p.to) { p.vx += ((target[0] + target[1] * (p.to < .5 ? .25 : .75) - p.x) * .0009); p.vy += ((target[2] - p.y) * .0009); }
        p.x += p.vx; p.y += p.vy; p.vx *= .99; p.vy *= .99; p.life -= .006;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9); g.addColorStop(0, 'rgba(' + p.c + ',' + p.life + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 6.29); ctx.fill();
      });
    }
    groups.forEach(function (g) {
      var k = g.getAttribute('data-tr-group');
      g.addEventListener('pointerenter', function () { hot = k; g.classList.add('is-hot'); });
      g.addEventListener('pointerleave', function () { hot = null; g.classList.remove('is-hot'); });
      g.addEventListener('click', function () { hot = hot === k ? null : k; shuffle(); });
    });
    size(); addEventListener('resize', size);
    H.visibleLoop(sec, draw, function (v) { vis = v; });
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
    }
    H.visibleLoop(field, tick, function (v) { vis = v; });
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
    if (!H.$('[data-sg-chain]', sec)) return;   // v7.2: the page is a drawing now, no signal chain to animate
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

  /* ================= 07 DRY LAB AND WET LAB (v7.5) =================
   * Wang Chang's sketch, rebuilt: ten steps on paper (wet lab) and in two
   * lavender bands (dry lab). On arrival a signal runs through the steps
   * once, chapter by chapter, drawing the arrows and lighting each step as
   * it reaches it. The four tabs replay one chapter; pointing at a step (or
   * tabbing to it) opens its note. Nothing animates once the run is over. */
  function labFlow() {
    var sec = H.$('[data-lf]'); if (!sec) return;
    var svg = H.$('[data-lf-svg]', sec), stage = H.$('[data-lf-stage]', sec), card = H.$('[data-lf-card]', sec);
    var dot = H.$('[data-lf-dot]', sec), tabs = H.$$('[data-lf-tab]', sec), replay = H.$('[data-lf-replay]', sec);
    var stops = {}; H.$$('.lf-stop', svg).forEach(function (g) { stops[g.getAttribute('data-k')] = g; });
    /* each step reacts anywhere over its drawing, not only on painted strokes */
    Object.keys(stops).forEach(function (k) {
      var g = stops[k], b = g.getBBox(), r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('class', 'lf-hit'); r.setAttribute('rx', '14');
      r.setAttribute('x', (b.x - 10).toFixed(1)); r.setAttribute('y', (b.y - 10).toFixed(1));
      r.setAttribute('width', (b.width + 20).toFixed(1)); r.setAttribute('height', (b.height + 20).toFixed(1));
      g.insertBefore(r, g.firstChild);
    });
    var arrows = H.$$('.lf-arrow', svg).map(function (p) {
      p.setAttribute('pathLength', '1');
      var c = p.classList.contains('lf-arrow--gold') ? '#e9a90e' : p.classList.contains('lf-arrow--dry') ? '#7b62ad' : '#6ff3de';
      return { el: p, len: p.getTotalLength(), to: p.getAttribute('data-to'), ch: +p.getAttribute('data-ch'), color: c };
    });
    var NOTES = {
      1: ['Wet lab', 'A fungus that hunts nematodes', 'Arthrobotrys oligospora catches the nematodes around it.'],
      2: ['Wet lab', 'A receptor for their signal', 'Researchers identified a receptor in this fungus that recognizes ascarosides, the chemicals nematodes release.'],
      3: ['Dry lab', 'Redesigning the receptor', 'We took the receptor out and designed variants of it.'],
      4: ['Dry lab', 'Screening on the computer', 'Molecular docking and molecular dynamics keep the variants that recognize ascr#3 and ascr#18.'],
      5: ['Wet lab', 'Into yeast', 'The modified gene goes into yeast, so the yeast carries the receptor and can recognize ascarosides.'],
      6: ['Wet lab', 'From signal to pigment genes', 'The receptor is coupled to the yeast\u2019s own signaling pathway, which switches on the genes that make betaxanthin.'],
      7: ['Wet lab', 'The medium turns yellow', 'Betaxanthin builds up inside and outside the cells and changes the color of the culture.'],
      8: ['Wet lab', 'Reading the color', 'OD and RGB measurements of the medium give the pigment concentration.'],
      9: ['Dry lab', 'From color to nematodes', 'How the receptor responds links pigment to the ascaroside level around it, and so to nematode activity. A lumped model writes this down.'],
      10: ['Dry lab', 'Eco model', 'The estimated abundance of harmful nematodes goes into a model that weighs the economic impact and suggests what to do.']
    };
    var CH_STOPS = { 1: ['1', '2'], 2: ['3', '4'], 3: ['5', '6', '7', '8'], 4: ['9', '10'] };
    var raf = 0, timers = [], played = false, running = false, visible = false;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function stopAll() { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; running = false; dot.classList.remove('is-on'); }
    function setTab(c) {
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', +t.getAttribute('data-lf-tab') === c ? 'true' : 'false'); });
      if (c) svg.setAttribute('data-ch', String(c)); else svg.removeAttribute('data-ch');
    }
    function lit(k) { var g = stops[k]; if (g) g.classList.add('is-lit'); }
    /* the finished picture: every arrow drawn, every step on, no chapter picked */
    function final() {
      stopAll(); played = true;
      svg.classList.remove('is-pre');
      arrows.forEach(function (a) { a.el.classList.add('is-drawn'); a.el.style.strokeDashoffset = ''; });
      Object.keys(stops).forEach(lit);
      setTab(0);
    }
    function pre() {
      stopAll();
      svg.classList.add('is-pre');
      arrows.forEach(function (a) { a.el.classList.remove('is-drawn'); a.el.style.strokeDashoffset = '1'; });
      Object.keys(stops).forEach(function (k) { stops[k].classList.remove('is-lit'); });
    }
    /* run the signal along a list of arrows, one after the other */
    function travel(list, done) {
      var i = 0;
      function one() {
        if (i >= list.length) { dot.classList.remove('is-on'); if (done) done(); return; }
        var a = list[i++], dur = H.clamp(a.len * 2.4, 420, 1150), t0 = performance.now();
        dot.style.color = a.color; dot.classList.add('is-on');
        (function f(now) {
          var k = H.clamp((now - t0) / dur, 0, 1), e = H.ease(k), p = a.el.getPointAtLength(e * a.len);
          dot.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
          if (svg.classList.contains('is-pre')) a.el.style.strokeDashoffset = String(1 - e);
          if (k < 1) { raf = requestAnimationFrame(f); return; }
          a.el.classList.add('is-drawn'); lit(a.to);
          raf = 0; later(one, 140);
        })(t0);
      }
      one();
    }
    function chapter(c, done) {
      setTab(c); lit(CH_STOPS[c][0]);
      later(function () { travel(arrows.filter(function (a) { return a.ch === c; }), function () { later(done || function () {}, 700); }); }, 380);
    }
    /* the full story, once */
    function run() {
      if (H.reduced) { final(); return; }
      pre(); played = true; running = true;
      var c = 1;
      (function next() {
        if (c > 4) { final(); return; }
        chapter(c++, next);
      })();
    }
    /* a tab replays its own chapter over the finished picture */
    function focusChapter(c) {
      final();
      if (H.reduced) { setTab(c); return; }
      running = true;
      chapter(c, function () { running = false; });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var c = +t.getAttribute('data-lf-tab');
        if (t.getAttribute('aria-pressed') === 'true' && !running) { setTab(0); return; }
        focusChapter(c);
      });
    });
    replay.addEventListener('click', run);

    /* notes on the steps */
    function showNote(g) {
      var k = g.getAttribute('data-k'), n = NOTES[k]; if (!n) return;
      svg.classList.add('is-hover'); H.$$('.lf-stop.is-hot', svg).forEach(function (s) { s.classList.remove('is-hot'); }); g.classList.add('is-hot');
      card.innerHTML = '<span class="lf-card__k">' + n[0] + ', step ' + k + '</span><b>' + n[1] + '</b><p>' + n[2] + '</p>';
      card.classList.toggle('is-dry', n[0] === 'Dry lab');
      card.classList.toggle('is-below', g.hasAttribute('data-below'));
      card.hidden = false;
      var sw = stage.clientWidth, sh = stage.clientHeight, s = sw / 1440;
      var x = +g.getAttribute('data-ax') * s, y = +g.getAttribute('data-ay') * s, half = card.offsetWidth / 2 + 10;
      card.style.left = H.clamp(x, half, sw - half).toFixed(1) + 'px';
      card.style.top = Math.min(y, sh - 12).toFixed(1) + 'px';
    }
    function hideNote() { svg.classList.remove('is-hover'); H.$$('.lf-stop.is-hot', svg).forEach(function (s) { s.classList.remove('is-hot'); }); card.hidden = true; }
    Object.keys(stops).forEach(function (k) {
      var g = stops[k];
      g.addEventListener('pointerenter', function () { showNote(g); });
      g.addEventListener('pointerleave', hideNote);
      g.addEventListener('focus', function () { showNote(g); });
      g.addEventListener('blur', hideNote);
      g.addEventListener('click', function () { showNote(g); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showNote(g); } });
    });

    H.onView(sec, function (v) { visible = v; if (!v && running) final(); });
    H.scene('signal', {
      set: function () { if (!played) pre(); },
      /* the run plays on its own; the page never holds the reader for it */
      enter: function () { if (!played) run(); return 250; },
      leave: function () { if (running) final(); return 0; }
    });
    if (H.reduced) final(); else pre();
    /* native scrolling (narrow screens): play when the page comes into view */
    H.once(sec, function () { if (!played && !(H.pager && H.pager.isPaged())) run(); }, .45);
  }

  /* ================= 08 LOOP ================= */
  /* 08 loop: the four goals of dbtlv2.svg. A click zooms a goal into the left
     of the board and opens its text beside it (requested by the wet-lab team). On wide
     screens the board grows a little, the cycle takes all the height it can and the
     text card sits next to it, top-aligned with the cycle's frame. */
  function loop() {
    var sec = H.$('[data-loop]'); if (!sec) return;
    var board = H.$('[data-lp-board]', sec), svg = board && H.$('svg.dbtl', board);
    if (!svg) return;
    var panel = H.$('[data-lp-panel]', sec), body = H.$('[data-lp-body]', sec), more = H.$('[data-lp-more]', sec), tabs = H.$$('[data-lp-tab]', sec);
    var cycles = H.$$('.dbtl-cycle', svg), parts = H.$$('[data-c]', svg), bridges = H.$$('[data-bridge]', svg);
    var v0 = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number), FULL = { x: v0[0], y: v0[1], w: v0[2], h: v0[3] };
    var cur = { x: FULL.x, y: FULL.y, w: FULL.w, h: FULL.h }, active = 0, raf = 0, hovered = 0;
    var wide = window.matchMedia('(min-width: 960px)'), GAP = 28, PAD = 14;
    var KIND = { dry: ['Dry lab', '#53509d'], wet: ['Wet lab', '#c57925'], hp: ['Human practices', '#ab3045'] };
    var texts = {}; H.$$('[data-lp-text]', sec).forEach(function (t) { texts[t.getAttribute('data-lp-text')] = t; });

    function frame(c) {
      var r = H.$('.dbtl-cycle[data-c="' + c + '"] .dbtl-cycle__frame', svg);
      return { x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height') };
    }
    /* viewBox that centres box in a W x Hh stage, at the stage's own aspect */
    function fit(box, W, Hh) {
      var s = Math.min(W / box.w, Hh / box.h), w = W / s, h = Hh / s;
      return { x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - h / 2, w: w, h: h };
    }
    /* where everything goes for the current state, at the board's final size */
    function layout() {
      var W = board.clientWidth || 1;
      if (!wide.matches) {
        var Hs = svg.getBoundingClientRect().height || 1;
        if (!active) return { vb: fit(FULL, W, Hs) };
        var b = frame(active), p = 7;
        return { vb: fit({ x: b.x - p, y: b.y - p, w: b.w + 2 * p, h: b.h + 2 * p }, W, Hs) };
      }
      var hOver = W * FULL.h / FULL.w;
      if (!active) return { h: hOver, vb: { x: FULL.x, y: FULL.y, w: FULL.w, h: FULL.h } };
      var paged = document.documentElement.classList.contains('is-paged');
      var Hb = Math.max(hOver, Math.min(hOver * 255 / 210, window.innerHeight - (paged ? 236 : 110)));
      var F = frame(active), pMin = H.clamp(W * .33, 340, 440);
      var s = Math.min((W - pMin - GAP - 2 * PAD) / F.w, (Hb - 2 * PAD) / F.h);
      var fw = F.w * s, fh = F.h * s, pw = Math.min(540, W - PAD - fw - GAP);
      var x0 = Math.max(0, (W - (PAD + fw + GAP + pw)) / 2) + PAD, y0 = (Hb - fh) / 2;
      return { h: Hb, vb: { x: F.x - x0 / s, y: F.y - y0 / s, w: W / s, h: Hb / s },
        panel: { left: x0 + fw + GAP, top: y0, width: pw, max: Hb - y0 - PAD } };
    }
    function place(L, jump) {
      var P = L.panel, props = { '--pl': P && P.left, '--pt': P && P.top, '--pw': P && P.width, '--ph': P && P.max };
      if (jump) panel.classList.add('is-jump');
      Object.keys(props).forEach(function (k) { if (props[k] == null) panel.style.removeProperty(k); else panel.style.setProperty(k, props[k].toFixed(1) + 'px'); });
      if (jump) { void panel.offsetWidth; panel.classList.remove('is-jump'); }
    }
    function apply(v) { cur = v; svg.setAttribute('viewBox', [v.x, v.y, v.w, v.h].map(function (n) { return n.toFixed(2); }).join(' ')); }
    function settle() { var L = layout(); place(L, true); board.style.height = L.h ? L.h.toFixed(1) + 'px' : ''; apply(L.vb); }
    function fly() {
      cancelAnimationFrame(raf); raf = 0;
      var L = layout(); place(L);
      if (H.reduced) { settle(); return; }
      var from = cur, h0 = board.offsetHeight, h1 = L.h, t0 = performance.now();
      if (!h1) board.style.height = '';
      raf = requestAnimationFrame(function tick(now) {
        var k = H.clamp((now - t0) / 780, 0, 1), e = H.ease(k), to = h1 ? L.vb : layout().vb;
        if (h1) board.style.height = H.lerp(h0, h1, e).toFixed(1) + 'px';
        apply({ x: H.lerp(from.x, to.x, e), y: H.lerp(from.y, to.y, e), w: H.lerp(from.w, to.w, e), h: H.lerp(from.h, to.h, e) });
        raf = k < 1 ? requestAnimationFrame(tick) : 0;
      });
    }
    function dim(c) {
      parts.forEach(function (e) { e.classList.toggle('is-dim', !!c && e.getAttribute('data-c') !== String(c)); });
      bridges.forEach(function (e) {
        var on = !!c && e.getAttribute('data-bridge').split(' ').indexOf(String(c)) >= 0;
        e.classList.toggle('is-dim', !!c && !on); e.classList.toggle('is-half', on);
      });
    }
    function hover(c) {
      if (c === hovered || active) return; hovered = c;
      cycles.forEach(function (g) { g.classList.toggle('is-hover', g.getAttribute('data-c') === String(c)); });
      dim(c);
    }
    function fill(c) {
      var src = texts[c], desc = src && H.$('[data-lp-desc]', src), link = src && H.$('a[href]', src);
      body.innerHTML = '';
      if (desc && desc.textContent.trim()) body.innerHTML = desc.innerHTML;
      else {
        var ul = document.createElement('ul'); ul.className = 'lp__mods';
        H.$$('.dbtl-node[data-c="' + c + '"]', svg).forEach(function (n) {
          var kinds = n.getAttribute('data-kind').split(' ').filter(function (k) { return KIND[k]; });
          var li = document.createElement('li'), mark = document.createElement('i'), name = document.createElement('b'), tag = document.createElement('em');
          mark.className = 'lp__kind'; mark.setAttribute('aria-hidden', 'true');
          mark.style.setProperty('--a', KIND[kinds[0]][1]); if (kinds[1]) mark.style.setProperty('--b', KIND[kinds[1]][1]);
          name.textContent = n.getAttribute('data-name');
          tag.textContent = kinds.map(function (k) { return KIND[k][0]; }).join(' and ');
          li.appendChild(mark); li.appendChild(name); li.appendChild(tag); ul.appendChild(li);
        });
        body.appendChild(ul);
      }
      if (link) { more.setAttribute('href', link.getAttribute('href')); more.hidden = false; } else more.hidden = true;
      body.scrollTop = 0;
    }
    function show(c) {
      c = +c || 0; if (c === active) return;
      var opening = !active && c;
      active = c; hovered = 0;
      if (opening) place(layout(), true);   // the card appears where it belongs, without sliding there
      board.classList.toggle('is-focus', !!c);
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(+t.getAttribute('data-lp-tab') === c)); });
      cycles.forEach(function (g) {
        var on = g.getAttribute('data-c') === String(c);
        g.classList.toggle('is-on', on); g.classList.remove('is-hover'); g.setAttribute('aria-pressed', String(on));
      });
      dim(c);
      if (c) fill(c);
      fly();
    }
    var pick = function (e) { var g = e.target.closest && e.target.closest('[data-c]'); return g ? +g.getAttribute('data-c') : 0; };
    svg.addEventListener('click', function (e) { var c = pick(e); if (c) show(c); });
    svg.addEventListener('pointerover', function (e) { if (e.pointerType !== 'touch') hover(pick(e)); });
    svg.addEventListener('pointerleave', function () { hover(0); });
    cycles.forEach(function (g) {
      g.setAttribute('aria-pressed', 'false');
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(+g.getAttribute('data-c')); } });
    });
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(+t.getAttribute('data-lp-tab')); }); });
    H.$$('[data-lp-step]', sec).forEach(function (b) {
      b.addEventListener('click', function () { var n = cycles.length; show((((active || 1) - 1 + +b.getAttribute('data-lp-step')) % n + n) % n + 1); });
    });
    H.$('[data-lp-close]', sec).addEventListener('click', function () { show(0); var t = tabs[0]; if (t) t.focus(); });
    sec.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active) show(0); });
    window.addEventListener('resize', function () { if (!raf) settle(); });
    if (wide.addEventListener) wide.addEventListener('change', settle);
    settle();
  }

  /* ================= 09 BUILT ================= */
  function built() {
    builtArt();
    H.$$('[data-art]').forEach(function (card) {
      var cv = H.$('canvas', card), kind = card.getAttribute('data-art'), ctx, w, h, hover = false, vis = false, t0 = performance.now(), r = H.rand(kind.length * 7);
      if (!cv) return; // SVG data-art slots are not legacy canvas cards.
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
      }
      card.addEventListener('pointermove', function (e) { var b = card.getBoundingClientRect(); card.style.setProperty('--ry', ((e.clientX - b.left) / b.width - .5) * 10 + 'deg'); card.style.setProperty('--rx', -((e.clientY - b.top) / b.height - .5) * 10 + 'deg'); hover = true; });
      card.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); hover = false; });
      size(); addEventListener('resize', size);
      H.visibleLoop(card, draw, function (v) { vis = v; });
    });
  }

  /* What we built team artwork: the six illustrations are lazy in the markup (the section is last),
     then fetched in idle time after the page has loaded, so they are ready before a paged jump or a
     fast scroll reaches them. Each image fades in once decoded; without this script they simply show. */
  function builtArt() {
    var grid = H.$('[data-wwb]'); if (!grid) return;
    var imgs = H.$$('.bt__art img', grid); if (!imgs.length) return;
    var waiting = 0;
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth) { img.classList.add('is-ready'); return; }
      waiting++;
      var done = function () {
        img.classList.add('is-ready');
        if (--waiting <= 0) grid.classList.remove('is-loading-art');
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
    if (waiting && !H.reduced) grid.classList.add('is-loading-art');
    var warm = function () { imgs.forEach(function (img) { if (img.loading === 'lazy') img.loading = 'eager'; }); };
    var idle = function () { if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1500); };
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
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
