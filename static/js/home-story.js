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
      2: ['Wet lab', 'A receptor for their signal', 'In this fungus we found a receptor that recognizes ascarosides, the chemicals nematodes release.'],
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
  /* v10.0.2: the team's revised relationship diagram (关系图_修改.ai): the
     same nodes and arrows, NEMA KLEAR and Society at the centre, without the
     coloured wash, read as one Design → Build → Test → Learn cycle. Places
     are the artboard's (pt, scaled into the 1200 × 620 board); every arrow
     end is measured from its rendered label, so the arrows clear the text
     whatever font metrics the browser has. */
  function loop() {
    var sec = H.$('[data-loop]'); if (!sec) return;
    var svg = H.$('[data-lp-svg]', sec), board = H.$('[data-lp-board]', sec), card = H.$('[data-lp-card]', sec);
    board.tabIndex = 0;
    board.setAttribute('role', 'region');
    board.setAttribute('aria-label', 'Field and laboratory feedback diagram. Scroll horizontally to explore.');
    var swipeHint = document.createElement('p');
    swipeHint.className = 'lp__mobile-hint';
    swipeHint.textContent = 'Swipe sideways to explore the full diagram. Tap a step to read its role.';
    board.insertAdjacentElement('afterend', swipeHint);
    var K = 1200 / 1230;
    function X(x) { return (x - 273) * K; }
    function Y(y) { return (y - 103) * K + 36; }
    var STAGE = {
      design: ['Design', 'models and data shape the sensor'],
      build: ['Build', 'the sensor itself'],
      test: ['Test', 'real soil on the bench'],
      learn: ['Learn', 'what people and fields tell us'],
      core: ['Society', 'the centre of the cycle']
    };
    // key: artboard x, y (label centre, pt), label, stage, what it is
    var N = {
      data: [404, 163.5, 'Data', 'design', 'Soil and survey data used to tune the models.'],
      eco: [406, 331, 'Eco model', 'design', 'Estimates where and when the product could make economic sense.'],
      ode: [406, 470, 'ODE model', 'design', 'Links ascaroside input to pigment output over time.'],
      soil: [865, 163.5, 'Soil survey', 'learn', 'Public soil sampling that feeds both labs.'],
      survey: [609.5, 268.5, 'Questionnaire', 'learn', 'Growers’ needs and intentions, for the Eco model.'],
      society: [865, 336.5, 'Society', 'core', 'The people and fields the project serves.'],
      kit: [865, 473, 'NEMA KLEAR', 'build', 'The sensor, its workflow and its limits.'],
      teach: [1268.5, 331, 'Teaching', 'learn', 'Classes and outreach that bring questions back.'],
      expert: [1280, 465.5, 'Expert interviews', 'learn', 'Agronomists and testers shape how results are used.'],
      samples: [1366, 163.5, 'Samples', 'test', 'Real soil samples to test against.'],
      bench: [1364, 603, 'Bench tests', 'test', 'Does the yeast respond, and can we read the colour?']
    };
    var defs = el('defs', {}, svg);
    var mk = el('marker', { id: 'lp-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6.2, markerHeight: 6.2, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0,.8 L10,5 L0,9.2 Z', class: 'lp__tip' }, mk);
    var hg = el('radialGradient', { id: 'lp-halo' }, defs);
    el('stop', { offset: 0, 'stop-color': '#f4a7c8', 'stop-opacity': .5 }, hg);
    el('stop', { offset: .6, 'stop-color': '#f4a7c8', 'stop-opacity': .16 }, hg);
    el('stop', { offset: 1, 'stop-color': '#f4a7c8', 'stop-opacity': 0 }, hg);
    el('rect', { class: 'lp__panel', x: .75, y: 36, width: 1198.5, height: 548, rx: 58 }, svg);
    el('ellipse', { class: 'lp__halo', cx: X(865), cy: Y(402), rx: 220, ry: 205, fill: 'url(#lp-halo)' }, svg);
    var eg = el('g', { class: 'lp__edges' }, svg), ng = el('g', { class: 'lp__nodes' }, svg);
    var nodes = {}, B = {};
    Object.keys(N).forEach(function (k) {
      var n = N[k], big = k === 'society' || k === 'kit';
      var g = el('g', { class: 'node node--' + n[3] + (big ? ' node--big' : ''), tabindex: 0, role: 'button', 'aria-label': n[2] + ' (' + STAGE[n[3]][0] + '): ' + n[4] }, ng);
      var hit = el('rect', { class: 'hit', rx: 12 }, g);
      var dot = big ? null : el('circle', { class: 'dot', r: 4.5 }, g);
      var tx = el('text', { x: X(n[0]).toFixed(1), y: Y(n[1]).toFixed(1), dy: '.35em', 'text-anchor': 'middle' }, g); tx.textContent = n[2];
      nodes[k] = { g: g, hit: hit, dot: dot, text: tx };
      g.addEventListener('pointerenter', function () { if (drawn && !playing) { focus([k]); show(k); } });
      g.addEventListener('pointerleave', function () { if (!playing && !pinned) { focus(null); card.hidden = true; } });
      g.addEventListener('click', function () { if (!drawn) drawAll(true, true); focus([k]); show(k); });
      g.addEventListener('focus', function () { if (!drawn) drawAll(true, true); focus([k]); show(k); });
      g.addEventListener('blur', function () { if (!playing && !pinned) { focus(null); card.hidden = true; } });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus([k]); show(k); }
        if (e.key === 'Escape') { focus(null); card.hidden = true; }
      });
    });
    /* label boxes, trimmed to the letters (the text box carries the font's
       leading); a dotted label also owns the space of its dot */
    function measure() {
      Object.keys(N).forEach(function (k) {
        var o = nodes[k], b = null;
        try { b = o.text.getBBox(); } catch (e) {}
        if (!b || !b.width) { var w = N[k][2].length * 12; b = { x: X(N[k][0]) - w / 2, y: Y(N[k][1]) - 15, width: w, height: 30 }; }
        var trim = b.height * 0.14, dx = o.dot ? 17 : 0;
        B[k] = { x0: b.x, l: b.x - dx, r: b.x + b.width, t: b.y + trim, b: b.y + b.height - trim, cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width };
        o.hit.setAttribute('x', (b.x - 10 - dx).toFixed(1)); o.hit.setAttribute('y', (b.y - 5).toFixed(1));
        o.hit.setAttribute('width', (b.width + 20 + dx).toFixed(1)); o.hit.setAttribute('height', (b.height + 10).toFixed(1));
        if (o.dot) { o.dot.setAttribute('cx', (b.x - 10).toFixed(1)); o.dot.setAttribute('cy', (b.y + b.height / 2).toFixed(1)); }
      });
    }
    var G = 10, GV = 6;
    function hz(a, b, lab) { var A = B[a], C = B[b], right = C.cx > A.cx, y = (A.cy + C.cy) / 2; return { pts: [[right ? A.r + G : A.l - G, y], [right ? C.l - G : C.r + G, y]], lab: lab }; }
    function vt(a, b, x, lab) { var A = B[a], C = B[b], down = C.cy > A.cy; return { pts: [[x, down ? A.b + GV : A.t - GV], [x, down ? C.t - GV : C.b + GV]], lab: lab }; }
    // out of a sideways, then up or down into b
    function hv(a, b, x, lab) { var A = B[a], C = B[b], down = C.cy > A.cy; return { pts: [[x < A.cx ? A.l - G : A.r + G, A.cy], [x, A.cy], [x, down ? C.t - GV : C.b + GV]], lab: lab }; }
    // out of a upwards or downwards, then sideways into b
    function vh(a, b, x, lab) { var A = B[a], C = B[b], up = C.cy < A.cy; return { pts: [[x, up ? A.t - GV : A.b + GV], [x, C.cy], [C.cx > x ? C.l - G : C.r + G, C.cy]], lab: lab }; }
    // drawn in cycle order: design, build, test, learn, then the centre
    var E = [
      ['data', 'eco', 'adjusts', function () { return vt('data', 'eco', B.eco.cx - B.eco.w * 0.17, { pos: 'left' }); }],
      ['ode', 'kit', 'optimises', function () { return hz('ode', 'kit', { pos: 'above' }); }],
      ['ode', 'bench', 'simulation analysis', function () { return vh('ode', 'bench', B.ode.x0 + B.ode.w * 0.37, { seg: 1, pos: 'above', at: 0.2 }); }],
      ['bench', 'samples', 'tested', function () { return vt('bench', 'samples', B.samples.cx + B.samples.w * 0.38, { pos: 'right' }); }],
      ['bench', 'expert', 'raises questions', function () { return vt('bench', 'expert', (B.expert.cx + B.bench.cx) / 2 + 10, { pos: 'left' }); }],
      ['expert', 'kit', 'guidance', function () { return hz('expert', 'kit', { pos: 'above', at: 0.42 }); }],
      ['soil', 'data', 'provides', function () { return hz('soil', 'data', { pos: 'above' }); }],
      ['soil', 'samples', 'provides', function () { return hz('soil', 'samples', { pos: 'above', at: 0.55 }); }],
      ['survey', 'eco', 'supports', function () { return hv('survey', 'eco', B.eco.cx - B.eco.w * 0.05, { seg: 0, pos: 'above', at: 0.5 }); }],
      ['society', 'soil', 'participates', function () { return vt('society', 'soil', B.society.cx, { pos: 'right' }); }],
      ['society', 'survey', 'fills in', function () { return vh('society', 'survey', B.society.cx - B.society.w * 0.12, { seg: 1, pos: 'above', at: 0.45 }); }],
      ['teach', 'society', 'feedback', function () { return hz('teach', 'society', { pos: 'above', at: 0.42 }); }],
      ['eco', 'society', 'predicts', function () { return hz('eco', 'society', { pos: 'below', at: 0.45 }); }],
      ['society', 'kit', 'decides', function () { return vt('society', 'kit', B.society.cx + 10, { pos: 'right', big: true }); }],
      ['kit', 'society', 'applied', function () { return vt('kit', 'society', B.society.cx - 10, { pos: 'left', big: true }); }]
    ];
    function pathD(pts) {
      if (pts.length === 2) return 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1) + 'L' + pts[1][0].toFixed(1) + ',' + pts[1][1].toFixed(1);
      var p = pts[0], c = pts[1], q = pts[2], r = 12;
      var ux = Math.sign(c[0] - p[0]), uy = Math.sign(c[1] - p[1]), vx = Math.sign(q[0] - c[0]), vy = Math.sign(q[1] - c[1]);
      return 'M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + 'L' + (c[0] - ux * r).toFixed(1) + ',' + (c[1] - uy * r).toFixed(1) +
        'Q' + c[0].toFixed(1) + ',' + c[1].toFixed(1) + ' ' + (c[0] + vx * r).toFixed(1) + ',' + (c[1] + vy * r).toFixed(1) + 'L' + q[0].toFixed(1) + ',' + q[1].toFixed(1);
    }
    function labelAt(r) {
      var sp = r.lab, p = r.pts[sp.seg || 0], q = r.pts[(sp.seg || 0) + 1], at = sp.at == null ? 0.5 : sp.at;
      var x = p[0] + (q[0] - p[0]) * at, y = p[1] + (q[1] - p[1]) * at, off = sp.big ? 14 : 10;
      if (sp.pos === 'above') return [x, y - off, 'middle'];
      if (sp.pos === 'below') return [x, y + off + 13, 'middle'];
      return [sp.pos === 'left' ? x - off : x + off, y + (sp.big ? 8 : 6), sp.pos === 'left' ? 'end' : 'start'];
    }
    var edges = E.map(function (e, i) {
      var g = el('g', { class: 'edge' + (e[2] === 'applied' || e[2] === 'decides' ? ' edge--big' : '') }, eg);
      var path = el('path', {}, g), flow = el('path', { class: 'flow' }, g), tx = el('text', {}, g); tx.textContent = e[2];
      return { g: g, path: path, flow: flow, text: tx, a: e[0], b: e[1], route: e[3], L: 300, i: i };
    });
    var drawn = false, dtm = [], playing = false, pinned = false;
    function layout() {
      measure();
      edges.forEach(function (e) {
        var r = e.route(), d = pathD(r.pts), lp = labelAt(r);
        e.path.setAttribute('d', d); e.flow.setAttribute('d', d);
        e.text.setAttribute('x', lp[0].toFixed(1)); e.text.setAttribute('y', lp[1].toFixed(1)); e.text.setAttribute('text-anchor', lp[2]);
        e.L = e.path.getTotalLength ? Math.ceil(e.path.getTotalLength()) + 2 : 300;
        e.path.style.strokeDasharray = e.L;
        if (!drawn) e.path.style.strokeDashoffset = e.L;
      });
    }
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    /* drawing the connections is this page's step */
    function drawAll(on, instant) {
      dtm.forEach(clearTimeout); dtm = []; drawn = on;
      board.classList.toggle('is-drawn', on);
      edges.forEach(function (e, i) {
        var delay = instant || !on ? 0 : i * 105;
        e.path.style.transition = instant ? 'none' : 'stroke-dashoffset .5s cubic-bezier(.3,.7,.2,1) ' + delay + 'ms';
        e.text.style.transitionDelay = instant ? '0ms' : (delay + 260) + 'ms';
        e.path.style.strokeDashoffset = on ? 0 : e.L;
        e.path.removeAttribute('marker-end');
        if (on) { if (instant) e.path.setAttribute('marker-end', 'url(#lp-arrow)'); else dtm.push(setTimeout(function () { e.path.setAttribute('marker-end', 'url(#lp-arrow)'); }, delay + 430)); }
      });
    }
    function focus(keys, onlyEdges) {
      board.classList.toggle('is-focus', !!keys);
      H.$$('.is-hl', svg).forEach(function (x) { x.classList.remove('is-hl'); });
      if (!keys) return;
      keys.forEach(function (k) { nodes[k].g.classList.add('is-hl'); });
      edges.forEach(function (e) {
        var hit = onlyEdges ? onlyEdges.indexOf(e) >= 0 : (keys.indexOf(e.a) >= 0 || keys.indexOf(e.b) >= 0);
        if (hit) { e.g.classList.add('is-hl'); nodes[e.a].g.classList.add('is-hl'); nodes[e.b].g.classList.add('is-hl'); }
      });
    }
    function show(k) {
      // The SVG can extend beyond its horizontal scroll viewport on phones.
      var n = N[k], drawing = svg.getBoundingClientRect(), sx = drawing.width / 1200, sy = drawing.height / 620, b = B[k];
      var st = STAGE[n[3]];
      card.innerHTML = '<b>' + n[2] + '</b>' + n[4] + '<em class="lp__stage lp__stage--' + n[3] + '">' + (n[3] === 'core' ? 'At the centre of the cycle' : st[0] + ': ' + st[1]) + '</em>';
      card.hidden = false;
      var cw = card.offsetWidth || 250, ch = card.offsetHeight || 110, x = b.cx * sx, below = b.b * sy + 12, above = b.t * sy - ch - 12;
      card.style.left = H.clamp(x - cw / 2, board.scrollLeft, board.scrollLeft + Math.max(0, board.clientWidth - cw)) + 'px';
      card.style.top = (below + ch <= drawing.height || above < 0 ? H.clamp(below, 0, Math.max(0, drawing.height - ch)) : above) + 'px';
    }
    var stageBtns = H.$$('[data-q]', sec);
    stageBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (!drawn) drawAll(true, true);
        var on = b.getAttribute('aria-pressed') !== 'true';
        stageBtns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', on ? 'true' : 'false'); card.hidden = true; pinned = on;
        var q = b.getAttribute('data-q');
        focus(on ? Object.keys(N).filter(function (k) { return N[k][3] === q; }) : null);
      });
    });
    function live(stage) { stageBtns.forEach(function (o) { o.classList.toggle('is-live', o.getAttribute('data-q') === stage); }); }
    // play the loop: one trip round the cycle, design → build → test → learn → society → build
    var seq = [['ode', 'kit'], ['ode', 'bench'], ['bench', 'samples'], ['bench', 'expert'], ['expert', 'kit'], ['kit', 'society'], ['society', 'survey'], ['survey', 'eco'], ['eco', 'society'], ['society', 'kit']];
    var dot = el('circle', { r: 7, class: 'lp__dot', opacity: 0 }, svg), playBtn = H.$('[data-lp-play]', sec);
    playBtn.addEventListener('click', function () {
      if (playing) return; playing = true; pinned = false; playBtn.setAttribute('aria-pressed', 'true');
      stageBtns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      if (!drawn) drawAll(true, true); var i = 0;
      (function step() {
        if (i >= seq.length || !drawn) { playing = false; playBtn.removeAttribute('aria-pressed'); dot.setAttribute('opacity', 0); live(null); focus(null); card.hidden = true; return; }
        var e = edges.filter(function (x) { return x.a === seq[i][0] && x.b === seq[i][1]; })[0];
        focus([e.a, e.b], [e]); show(e.b); live(N[e.b][3] === 'core' ? N[e.a][3] : N[e.b][3]);
        var L = e.path.getTotalLength(), s0 = performance.now(), ms = H.reduced ? 0 : 760; dot.setAttribute('opacity', 1);
        (function mv(now) { var k = ms ? H.clamp((now - s0) / ms, 0, 1) : 1, p = e.path.getPointAtLength(L * H.ease(k)); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); if (k < 1) requestAnimationFrame(mv); else { i++; setTimeout(step, H.reduced ? 900 : 260); } })(s0);
      })();
    });
    H.scene('loop', {
      steps: 1,
      set: function (i) { drawAll(i > 0, true); if (!i) { focus(null); card.hidden = true; } },
      step: function (i) { drawAll(i > 0, false); return i ? edges.length * 105 + 520 : 300; },
      ff: function () { drawAll(true, true); }
    });
  }

  /* ================= 09 BUILT ================= */
  function built() {
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
