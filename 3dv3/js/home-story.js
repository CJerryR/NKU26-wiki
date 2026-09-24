/* Parts 03–04 · animated nematodes, the detective's lens, the clue sky,
 * the signal-combination toggle and the proposed sensor pathway. */
(function () {
  'use strict';
  var NK = window.NK;
  if (!NK || !NK.wormPath) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- nematodes drawn from data attributes ---------------- */
  function nums(el, attr) { return el.getAttribute(attr).split(/\s+/).map(Number); }
  function drawWorms(list, t) {
    list.forEach(function (w) {
      var a = w.a;
      var amp = a[4] * (w.j2 ? 0.42 : 0.5);
      var res = NK.wormPath(a[0], a[1], a[2], a[3], a[4], t, a[5] * 2.4, amp);
      w.body.setAttribute('d', res.d);
      if (w.eye) {
        var ca = Math.cos(a[2]);
        var sa = Math.sin(a[2]);
        var lx = -a[3] * 0.09;
        var ly = -a[4] * 0.12;
        var ex = res.head.x + lx * ca - ly * sa;
        var ey = res.head.y + lx * sa + ly * ca;
        w.eye.setAttribute('cx', ex.toFixed(1));
        w.eye.setAttribute('cy', ey.toFixed(1));
        w.pupil.setAttribute('cx', (ex + ca * 1.4).toFixed(1));
        w.pupil.setAttribute('cy', (ey + sa * 1.4).toFixed(1));
      }
    });
  }
  function collectWorms(scope) {
    var out = [];
    $$('[data-worm]', scope).forEach(function (p) { out.push({ a: nums(p, 'data-worm'), body: p }); });
    $$('[data-j2]', scope).forEach(function (g) {
      out.push({ a: nums(g, 'data-j2'), body: $('.nk-j2__body', g), eye: $('.nk-j2__eye', g), pupil: $('.nk-j2__pupil', g), j2: true });
    });
    return out;
  }
  ['[data-stages]', '[data-profiles]'].forEach(function (sel) {
    var scope = $(sel);
    if (!scope) return;
    var worms = collectWorms(scope);
    if (!worms.length) return;
    drawWorms(worms, 0);
    if (!NK.reduced) NK.loopWhileVisible(scope, function (t) { drawWorms(worms, t); });
  });

  /* ---------------- the detective's lens ---------------- */
  $$('[data-scene]').forEach(function (fig) {
    var svg = $('[data-scene-svg]', fig);
    var clip = $('[data-lens-clip]', fig);
    var zoom = $('[data-lens-zoom]', fig);
    var lens = $('[data-lens]', fig);
    if (!svg || !clip || !zoom || !lens) return;
    var hot = (fig.getAttribute('data-hot') || '200 200').split(' ').map(Number);
    var pos = { x: hot[0], y: hot[1] };
    var pinned = false;
    function place(x, y) {
      pos.x = NK.clamp(x, 60, 360);
      pos.y = NK.clamp(y, 118, 300);
      clip.setAttribute('cx', pos.x.toFixed(1));
      clip.setAttribute('cy', pos.y.toFixed(1));
      zoom.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ') scale(2.2) translate(' + (-pos.x).toFixed(1) + ' ' + (-pos.y).toFixed(1) + ')');
      lens.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')');
    }
    function toSvg(e) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(m.inverse());
    }
    function show(on) { fig.classList.toggle('is-lens', on); }
    fig.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var p = toSvg(e);
      if (!p) return;
      place(p.x, p.y);
      show(true);
    });
    fig.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !pinned) show(false); });
    fig.addEventListener('click', function (e) {
      var p = toSvg(e);
      if (p) place(p.x, p.y);
      if (e.pointerType === 'mouse') { pinned = !pinned; show(true); } else { pinned = true; show(true); }
    });
    fig.addEventListener('focus', function () { place(pos.x, pos.y); show(true); });
    fig.addEventListener('blur', function () { if (!pinned) show(false); });
    fig.addEventListener('keydown', function (e) {
      var d = 14;
      var k = e.key;
      if (k === 'ArrowLeft') place(pos.x - d, pos.y);
      else if (k === 'ArrowRight') place(pos.x + d, pos.y);
      else if (k === 'ArrowUp') place(pos.x, pos.y - d);
      else if (k === 'ArrowDown') place(pos.x, pos.y + d);
      else if (k === 'Escape') { pinned = false; show(false); return; }
      else return;
      e.preventDefault();
      show(true);
    });
    place(pos.x, pos.y);
  });

  /* ---------------- stages: overview, zoom into scene 1, pan across 2–4 ----------------
   * Vertical scroll drives it. The scenes stay real SVG (the lens keeps
   * working through the transform); one large caption replaces the four
   * small ones while zoomed. Narrow screens skip the overview. */
  (function () {
    var run = $('[data-stagerun]');
    if (!run || !('IntersectionObserver' in window)) return;
    var pin = $('[data-stagepin]', run);
    var list = $('[data-stages]', run);
    var items = $$('.nk-stage', list);
    var scenes = items.map(function (li) { return $('.nk-scene', li); });
    var cap = $('[data-stagecap]', run);
    var capN = $('[data-stagecap-n]', run);
    var capT = $('[data-stagecap-t]', run);
    var capP = $('[data-stagecap-p]', run);
    var dots = $$('[data-stagedots] li', run);
    if (!pin || !list || items.length !== 4 || scenes.some(function (s) { return !s; })) return;
    run.classList.add('is-on');
    var M = null;
    var cur = -1;
    var lastP = -1;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function measure() {
      list.style.transform = 'none';
      var pr = pin.getBoundingClientRect();
      var lr = list.getBoundingClientRect();
      var narrow = pr.width < 760;
      var sc = scenes.map(function (s) {
        var r = s.getBoundingClientRect();
        return { cx: r.left - lr.left + r.width / 2, cy: r.top - lr.top + r.height / 2, w: r.width, h: r.height };
      });
      var capRight = narrow ? 0 : cap.getBoundingClientRect().right - pr.left + 40;
      var availW = (pr.width - capRight) * (narrow ? 1 : 0.9);
      var availH = pr.height * (narrow ? 0.5 : 0.7);
      M = {
        lx: lr.left - pr.left, ly: lr.top - pr.top, sc: sc, narrow: narrow,
        S: narrow ? 1 : Math.min(availW / sc[0].w, availH / sc[0].h),
        tx: narrow ? pr.width / 2 : capRight + (pr.width - capRight) / 2,
        ty: narrow ? pr.height * 0.36 : pr.height / 2
      };
      lastP = -1;
    }
    function setCap(i) {
      var h = $('h3', items[i]);
      var num = h && $('span', h);
      var p = $('p', items[i]);
      cap.classList.add('is-swap');
      setTimeout(function () {
        capN.textContent = String(i + 1);
        capT.textContent = h ? h.textContent.replace(num ? num.textContent : '', '').trim() : '';
        capP.textContent = p ? p.textContent : '';
        cap.classList.remove('is-swap');
      }, cur < 0 ? 0 : 160);
    }
    function apply(p) {
      if (!M) measure();
      var zk = M.narrow ? 1 : NK.easeInOut(NK.clamp((p - 0.08) / 0.14, 0, 1));
      var raw = NK.clamp((p - 0.22) / 0.78, 0, 1) * 3;
      var i = Math.min(2, Math.floor(raw));
      var k = raw >= 3 ? 3 : i + NK.smooth(0.3, 0.8, raw - i);
      var k0 = Math.floor(k);
      var k1 = Math.min(3, k0 + 1);
      var f = k - k0;
      var fx = lerp(M.sc[k0].cx, M.sc[k1].cx, f);
      var fy = lerp(M.sc[k0].cy, M.sc[k1].cy, f);
      var s = Math.exp(Math.log(M.S) * zk);
      var tx = lerp(M.lx + M.sc[0].cx, M.tx, zk);
      var ty = lerp(M.ly + M.sc[0].cy, M.ty, zk);
      list.style.transform = 'translate(' + (tx - M.lx - s * fx).toFixed(1) + 'px,' + (ty - M.ly - s * fy).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      run.classList.toggle('is-zooming', M.narrow || zk > 0.02);
      run.classList.toggle('is-zoom', M.narrow || zk > 0.6);
      scenes.forEach(function (sc, j) { sc.style.opacity = zk > 0.6 ? String(1 - 0.72 * NK.clamp(Math.abs(j - k), 0, 1)) : ''; });
      var idx = Math.round(k);
      if (idx !== cur) { setCap(idx); cur = idx; }
      dots.forEach(function (d, j) { d.classList.toggle('is-on', j === idx); });
    }
    function frame() {
      var r = run.getBoundingClientRect();
      var p = NK.clamp(-r.top / Math.max(1, run.offsetHeight - window.innerHeight), 0, 1);
      if (Math.abs(p - lastP) < 1e-4) return;
      lastP = p;
      apply(p);
    }
    var rT = 0;
    window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { M = null; frame(); }, 150); });
    NK.loopWhileVisible(run, frame, '100px 0px');
  }());

  /* ---------------- clue sky: free-living nematodes drifting ---------------- */
  (function () {
    var sky = $('[data-clue-sky]');
    if (!sky) return;
    var R = NK.rng(5);
    var worms = [];
    for (var i = 0; i < 11; i++) {
      var p = NK.svg('path', { class: 'nk-ghost' }, sky);
      worms.push({ el: p, x: R() * 1440, y: 80 + R() * 760, ang: R() * 6.28, len: 60 + R() * 70, wid: 7 + R() * 5, sp: 6 + R() * 10, ph: R() * 6 });
    }
    for (i = 0; i < 46; i++) {
      var c = NK.svg('circle', { cx: (R() * 1440).toFixed(0), cy: (R() * 900).toFixed(0), r: (0.8 + R() * 1.8).toFixed(1), fill: R() < 0.7 ? '#5ff0d6' : '#ffd66b', class: 'nk-zf__sig' }, sky);
      c.style.setProperty('--d', (R() * 3).toFixed(2) + 's');
      c.style.opacity = '.55';
    }
    function draw(t, dt) {
      worms.forEach(function (w) {
        w.ang += Math.sin(t * 0.2 + w.ph) * 0.002;
        w.x += Math.cos(w.ang) * w.sp * (dt || 0);
        w.y += Math.sin(w.ang) * w.sp * (dt || 0);
        if (w.x < -120) w.x = 1560; else if (w.x > 1560) w.x = -120;
        if (w.y < -120) w.y = 1020; else if (w.y > 1020) w.y = -120;
        w.el.setAttribute('d', NK.wormPath(w.x, w.y, w.ang, w.len, w.wid, t + w.ph, 3, w.wid * 0.6).d);
      });
    }
    draw(0, 0);
    if (!NK.reduced) NK.loopWhileVisible(sky.parentNode, draw);
  }());

  /* ---------------- one signal or a combination ---------------- */
  (function () {
    var sec = $('[data-combo-section]');
    if (!sec) return;
    var orbs = $('[data-orbs]', sec);
    var read = $('[data-combo-read]', sec);
    var btns = $$('[data-combo]', sec);
    var TEXT = {
      single: 'A single ascaroside may only tell us that a related signal is present.',
      pair: 'Reading ascr#3 and ascr#18 together is the question we test: could the combination help separate plant-parasitic risk from background activity?'
    };
    var touched = false;
    function set(mode, focus) {
      orbs.setAttribute('data-mode', mode);
      read.textContent = TEXT[mode];
      btns.forEach(function (b) {
        var on = b.getAttribute('data-combo') === mode;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { touched = true; set(b.getAttribute('data-combo')); });
      b.addEventListener('keydown', function (e) {
        if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].indexOf(e.key) < 0) return;
        e.preventDefault();
        touched = true;
        set(btns[(i + 1) % btns.length].getAttribute('data-combo'), true);
      });
    });
    set('single');
    NK.onVisible(orbs, function () { setTimeout(function () { if (!touched) set('pair'); }, 2400); }, { threshold: 0.5 });
  }());

  /* ---------------- proposed sensor pathway ---------------- */
  (function () {
    var fig = $('[data-pathway]');
    if (!fig) return;
    var edgesG = $('[data-pw-edges]', fig);
    var nodesG = $('[data-pw-nodes]', fig);
    var pigG = $('[data-pw-pigment]', fig);
    var liquid = $('[data-pw-liquid]', fig);
    var pointer = $('[data-pw-pointer]', fig);
    var glyphs = $$('[data-pw-glyph]', fig);
    var labels = $$('[data-pw-label]', fig);
    var goBtns = $$('[data-pw-go]', fig);
    var play = $('[data-pw-play]', fig);

    /* amplification pyramid: 1 → 3 → 9 → 27 */
    var levels = [[{ x: 372, y: 252 }]];
    function ys(n, a, b) { var out = []; for (var i = 0; i < n; i++) out.push(n === 1 ? (a + b) / 2 : a + (b - a) * i / (n - 1)); return out; }
    levels.push(ys(3, 190, 314).map(function (y) { return { x: 440, y: y }; }));
    levels.push(ys(9, 138, 366).map(function (y) { return { x: 512, y: y }; }));
    levels.push(ys(27, 96, 408).map(function (y) { return { x: 584, y: y }; }));
    var edgeSets = [[], [], [], [], []];
    function line(x1, y1, x2, y2, set) { set.push(NK.svg('line', { x1: x1, y1: y1.toFixed(1), x2: x2, y2: y2.toFixed(1) }, edgesG)); }
    line(330, 252, 372, 252, edgeSets[0]);
    for (var l = 1; l < levels.length; l++) {
      levels[l].forEach(function (n, i) { var parent = levels[l - 1][Math.floor(i / 3)]; line(parent.x, parent.y, n.x, n.y, edgeSets[l]); });
    }
    levels[3].forEach(function (n, i) { line(n.x, n.y, 702, 262 + (i / 26) * 40, edgeSets[4]); });
    var radii = [7, 6, 4.6, 3.2];
    var nodeSets = levels.map(function (lv, li) { return lv.map(function (n) { return NK.svg('circle', { cx: n.x, cy: n.y.toFixed(1), r: radii[li] }, nodesG); }); });
    var R = NK.rng(21);
    var pig = [];
    while (pig.length < 34) {
      var px = 640 + R() * 400;
      var py = 80 + R() * 380;
      var inCell = Math.pow((px - 640) / 318, 2) + Math.pow((py - 270) / 198, 2) < 1;
      var inNuc = Math.hypot(px - 780, py - 282) < 88;
      var outside = px > 972 && px < 1030 && py > 190 && py < 360;
      if ((inCell && !inNuc) || outside) {
        var d = Math.hypot(px - 780, py - 282);
        pig.push({ el: NK.svg('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: (3.6 + R() * 3.4).toFixed(1) }, pigG), t: 3.7 + d / 260 + R() * 0.4 });
      }
    }
    var from = [[110, 200], [140, 290]];
    var to = [[252, 244], [246, 266]];

    var T_END = 7.2;
    var t0 = 0;
    var elapsed = 0;
    var running = false;
    var stop = null;
    function ease(x) { return NK.easeInOut(NK.clamp(x, 0, 1)); }
    function apply(e) {
      glyphs.forEach(function (g, i) {
        var k = ease((e - i * 0.15) / 1.3);
        var x = NK.lerp(from[i][0], to[i][0], k) + (k < 1 ? Math.sin(e * 3 + i) * 3 : 0);
        var y = NK.lerp(from[i][1], to[i][1], k) + (k < 1 ? Math.cos(e * 2.4 + i) * 4 : 0);
        g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      });
      fig.classList.toggle('is-bound', e >= 1.4);
      var times = [1.6, 1.9, 2.3, 2.7, 3.1];
      edgeSets.forEach(function (set, i) { var on = e >= times[i]; set.forEach(function (ln) { ln.classList.toggle('is-on', on); }); });
      nodeSets.forEach(function (set, i) { var on = e >= times[i]; set.forEach(function (c) { c.classList.toggle('is-on', on); }); });
      fig.classList.toggle('is-gene', e >= 3.4);
      pig.forEach(function (p) { p.el.classList.toggle('is-on', e >= p.t); });
      var level = ease((e - 4.4) / 2.0);
      liquid.setAttribute('y', (409 - 230 * level).toFixed(1));
      liquid.setAttribute('height', (230 * level).toFixed(1));
      liquid.style.opacity = String(0.35 + 0.65 * level);
      pointer.style.transform = 'translateX(' + (100 * ease((e - 6.0) / 0.8)).toFixed(1) + 'px)';
      var step = e >= 3.4 ? 3 : e >= 1.9 ? 2 : e >= 1.4 ? 1 : 0;
      fig.setAttribute('data-step', String(step));
      labels.forEach(function (lb) { lb.classList.toggle('is-on', Number(lb.getAttribute('data-pw-label')) <= step); });
      goBtns.forEach(function (b) { b.classList.toggle('is-on', Number(b.getAttribute('data-pw-go')) === step); });
    }
    function frame(t) {
      if (!running) return;
      if (!t0) t0 = t - elapsed;
      elapsed = t - t0;
      apply(elapsed);
      if (elapsed >= T_END) { running = false; if (stop) { stop(); stop = null; } }
    }
    function run() {
      if (NK.reduced) { elapsed = T_END; apply(T_END); return; }
      elapsed = 0;
      t0 = 0;
      running = true;
      fig.classList.remove('is-bound');
      if (!stop) stop = NK.loop(frame);
    }
    function jump(step) {
      running = false;
      if (stop) { stop(); stop = null; }
      elapsed = step === 1 ? 1.5 : step === 2 ? 3.2 : T_END;
      apply(elapsed);
    }
    goBtns.forEach(function (b) { b.addEventListener('click', function () { jump(Number(b.getAttribute('data-pw-go'))); }); });
    if (play) play.addEventListener('click', run);
    apply(0);
    NK.onVisible(fig, run, { threshold: 0.45 });
  }());
}());
