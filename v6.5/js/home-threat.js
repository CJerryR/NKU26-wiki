/* NKU homepage v6.2 — 05 the hidden threat.
 * Layout, drawings and interaction are the 3D v3 version (home-story.js and
 * home-zoom.js there): the four scenes side by side, then the first scene
 * zooms in next to a large caption, then each scroll pans to the next scene.
 * The only change is the driver: the pager plays those states one step at a
 * time instead of a tall scroll runway. The lens works as before. */
(function () {
  'use strict';
  var H = window.NKUH, NK = window.NK;
  if (!H || !NK) return;
  NK.wormPath = NK.wormPath || function (x, y, ang, len, wid, t, speed, amp) {
    var n = 20, top = [], bot = [], ca = Math.cos(ang), sa = Math.sin(ang);
    function off(u) { return Math.sin(u * 2.3 * Math.PI - t * speed) * amp * (0.25 + 0.75 * u); }
    for (var i = 0; i <= n; i++) {
      var u = i / n, sx = -u * len, sy = off(u);
      var d = (off(Math.min(1, u + 0.02)) - off(Math.max(0, u - 0.02))) / 0.04;
      var nx = -d, ny = -len, nl = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= nl; ny /= nl;
      var w = wid * 0.5 * (u < 0.1 ? 0.62 + 3.8 * u : 0.14 + 0.86 * Math.pow(1 - (u - 0.1) / 0.9, 0.7));
      top.push([sx + nx * w, sy + ny * w]);
      bot.push([sx - nx * w, sy - ny * w]);
    }
    function P(p) { return (x + p[0] * ca - p[1] * sa).toFixed(1) + ' ' + (y + p[0] * sa + p[1] * ca).toFixed(1); }
    var s = 'M' + P(top[0]);
    for (i = 1; i <= n; i++) s += 'L' + P(top[i]);
    for (i = n; i >= 0; i--) s += 'L' + P(bot[i]);
    s += 'Q' + P([wid * 0.5 * 0.62 * 1.5, 0]) + ' ' + P(top[0]) + 'Z';
    return { d: s, head: { x: x, y: y + off(0) * ca, ang: ang } };
  };

  H.ready(function () {
    var sec = document.querySelector('[data-th3]'); if (!sec) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    /* ---------------- nematodes drawn from data attributes ---------------- */
    function nums(el, attr) { return el.getAttribute(attr).split(/\s+/).map(Number); }
    var scope = $('[data-stages]', sec);
    var worms = [];
    $$('[data-worm]', scope).forEach(function (p) { worms.push({ a: nums(p, 'data-worm'), body: p }); });
    $$('[data-j2]', scope).forEach(function (g) {
      worms.push({ a: nums(g, 'data-j2'), body: $('.nk-j2__body', g), eye: $('.nk-j2__eye', g), pupil: $('.nk-j2__pupil', g), glint: $('.nk-j2__glint', g), j2: true });
    });
    function drawWorms(t) {
      worms.forEach(function (w) {
        var a = w.a, amp = a[4] * (w.j2 ? 0.42 : 0.5);
        var res = NK.wormPath(a[0], a[1], a[2], a[3], a[4], t, a[5] * 2.4, amp);
        w.body.setAttribute('d', res.d);
        if (w.eye) {
          var ca = Math.cos(a[2]), sa = Math.sin(a[2]), lx = -a[3] * 0.09, ly = -a[4] * 0.12;
          var ex = res.head.x + lx * ca - ly * sa, ey = res.head.y + lx * sa + ly * ca;
          w.eye.setAttribute('cx', ex.toFixed(1)); w.eye.setAttribute('cy', ey.toFixed(1));
          w.pupil.setAttribute('cx', (ex + ca * 1.4).toFixed(1)); w.pupil.setAttribute('cy', (ey + sa * 1.4).toFixed(1));
          if (w.glint) { w.glint.setAttribute('cx', (ex + ca * 1.4 - 0.8).toFixed(1)); w.glint.setAttribute('cy', (ey + sa * 1.4 - 0.8).toFixed(1)); }
        }
      });
    }
    drawWorms(0);
    if (!NK.reduced) NK.loopWhileVisible(scope, function (t) { drawWorms(t); });

    /* ---------------- the detective's lens ---------------- */
    $$('[data-scene]', sec).forEach(function (fig) {
      var svg = $('[data-scene-svg]', fig), clip = $('[data-lens-clip]', fig), zoom = $('[data-lens-zoom]', fig), lens = $('[data-lens]', fig);
      if (!svg || !clip || !zoom || !lens) return;
      var hot = (fig.getAttribute('data-hot') || '200 200').split(' ').map(Number);
      var pos = { x: hot[0], y: hot[1] }, pinned = false;
      function place(x, y) {
        pos.x = NK.clamp(x, 60, 360); pos.y = NK.clamp(y, 118, 300);
        clip.setAttribute('cx', pos.x.toFixed(1)); clip.setAttribute('cy', pos.y.toFixed(1));
        zoom.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ') scale(2.2) translate(' + (-pos.x).toFixed(1) + ' ' + (-pos.y).toFixed(1) + ')');
        lens.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')');
      }
      function toSvg(e) {
        var m = svg.getScreenCTM(); if (!m) return null;
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        return pt.matrixTransform(m.inverse());
      }
      function show(on) { fig.classList.toggle('is-lens', on); }
      fig.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var p = toSvg(e); if (!p) return; place(p.x, p.y); show(true); });
      fig.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !pinned) show(false); });
      fig.addEventListener('click', function (e) { var p = toSvg(e); if (p) place(p.x, p.y); if (e.pointerType === 'mouse') { pinned = !pinned; show(true); } else { pinned = true; show(true); } });
      fig.addEventListener('focus', function () { place(pos.x, pos.y); show(true); });
      fig.addEventListener('blur', function () { if (!pinned) show(false); });
      fig.addEventListener('keydown', function (e) {
        var d = 14, k = e.key;
        if (k === 'ArrowLeft') place(pos.x - d, pos.y);
        else if (k === 'ArrowRight') place(pos.x + d, pos.y);
        else if (k === 'ArrowUp') place(pos.x, pos.y - d);
        else if (k === 'ArrowDown') place(pos.x, pos.y + d);
        else if (k === 'Escape') { pinned = false; show(false); return; }
        else return;
        e.preventDefault(); e.stopPropagation(); show(true);
      });
      place(pos.x, pos.y);
    });

    /* ---------------- stages: overview, zoom into scene 1, pan across 2–4 ---------------- */
    var run = $('[data-stagerun]', sec), pin = $('[data-stagepin]', run), list = $('[data-stages]', run);
    var items = $$('.nk-stage', list), scenes = items.map(function (li) { return $('.nk-scene', li); });
    var cap = $('[data-stagecap]', run), capN = $('[data-stagecap-n]', run), capT = $('[data-stagecap-t]', run), capP = $('[data-stagecap-p]', run);
    var dots = $$('[data-stagedots] li', run);
    var M = null, cur = -1;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function measure() {
      list.style.transform = 'none';
      var pr = pin.getBoundingClientRect(), lr = list.getBoundingClientRect(), narrow = pr.width < 760;
      var sc = scenes.map(function (s) { var r = s.getBoundingClientRect(); return { cx: r.left - lr.left + r.width / 2, cy: r.top - lr.top + r.height / 2, w: r.width, h: r.height }; });
      var capRight = narrow ? 0 : cap.getBoundingClientRect().right - pr.left + 40;
      var availW = (pr.width - capRight) * (narrow ? 1 : 0.9), availH = pr.height * (narrow ? 0.5 : 0.7);
      M = {
        lx: lr.left - pr.left, ly: lr.top - pr.top, sc: sc, narrow: narrow,
        S: narrow ? 1 : Math.min(availW / sc[0].w, availH / sc[0].h),
        tx: narrow ? pr.width / 2 : capRight + (pr.width - capRight) / 2,
        ty: narrow ? pr.height * 0.36 : pr.height / 2
      };
    }
    function setCap(i) {
      var h = $('h3', items[i]), num = h && $('span', h), p = $('p', items[i]);
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
      var k0 = Math.floor(k), k1 = Math.min(3, k0 + 1), f = k - k0;
      var fx = lerp(M.sc[k0].cx, M.sc[k1].cx, f), fy = lerp(M.sc[k0].cy, M.sc[k1].cy, f);
      var s = Math.exp(Math.log(M.S) * zk);
      var tx = lerp(M.lx + M.sc[0].cx, M.tx, zk), ty = lerp(M.ly + M.sc[0].cy, M.ty, zk);
      list.style.transform = 'translate(' + (tx - M.lx - s * fx).toFixed(1) + 'px,' + (ty - M.ly - s * fy).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      run.classList.toggle('is-zooming', M.narrow || zk > 0.02);
      run.classList.toggle('is-zoom', M.narrow || zk > 0.6);
      scenes.forEach(function (sc, j) { sc.style.opacity = zk > 0.6 ? String(1 - 0.72 * NK.clamp(Math.abs(j - k), 0, 1)) : ''; });
      var idx = Math.round(k);
      if (idx !== cur) { setCap(idx); cur = idx; }
      dots.forEach(function (d, j) { d.classList.toggle('is-on', j === idx); });
    }
    /* the pager's steps: overview · scene 1 zoomed · scene 2 · scene 3 · scene 4 */
    var P = [0, 0.22, 0.48, 0.74, 1];
    var pNow = 0, pTo = 0, raf = 0;
    function tweenTo(p, ms) {
      cancelAnimationFrame(raf);
      var p0 = pNow, t0 = performance.now(); pTo = p;
      (function f(now) {
        var k = NK.clamp((now - t0) / ms, 0, 1);
        pNow = p0 + (p - p0) * NK.easeInOut(k);
        apply(pNow);
        if (k < 1) raf = requestAnimationFrame(f);
      })(t0);
    }
    H.scene('threat', {
      steps: 4, tall: 5,
      set: function (i) { cancelAnimationFrame(raf); M = null; pNow = pTo = P[i]; apply(pNow); },
      step: function (i) { var ms = H.reduced ? 1 : 1300; tweenTo(P[i], ms); return ms; },
      ff: function () { cancelAnimationFrame(raf); pNow = pTo; apply(pNow); }
    });
    var rT = 0;
    window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { M = null; apply(pNow); }, 150); });
    apply(0);
  });
})();
