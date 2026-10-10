/* NKU homepage v6 — 03 world map + 06 human-practices maps.
 * World: V3 layout and watercolour colour patches, now drawn from the real
 * Herbivores layer (js/home-abundance.js, 1,901 pixels, log10(x + 1)).
 * Cards open only from the case points and close when the pointer leaves
 * them. China is highlighted the 3D v3 way and dives into the next page.
 * HP: the three V3 China maps (survey, teaching, soil programme) with
 * illustrative province values until the team's records are in. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  var GEO = window.NKU_GEO || {}, LAND = window.NKU_LAND || {};
  var REG = window.NKU_HOME_MAPS || { cases: [], continents: {} };
  var RAMP = [[243, 220, 194], [244, 162, 97], [239, 111, 108], [192, 78, 168], [110, 79, 210]];
  function ramp(v, a) {
    v = H.clamp(v, 0, 1) * (RAMP.length - 1); var i = Math.min(RAMP.length - 2, Math.floor(v)), f = v - i, A = RAMP[i], B = RAMP[i + 1];
    return 'rgba(' + Math.round(H.lerp(A[0], B[0], f)) + ',' + Math.round(H.lerp(A[1], B[1], f)) + ',' + Math.round(H.lerp(A[2], B[2], f)) + ',' + (a == null ? 1 : a) + ')';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function continent(lon, lat) {
    if (lon < -30) return lat > 12 ? 'na' : 'sa';
    if (lon > 110 && lat < -10 || lon > 160) return 'oc';
    if (lon < 60 && lat > 35 && !(lon > 26 && lat < 42)) return 'eu';
    if (lon < 52 && lat <= 35 && !(lon > 34 && lat > 12)) return 'af';
    return 'as';
  }

  /* ---------- the abundance layer (one scale for every map) ---------- */
  var PTS = (window.NKU_ABUNDANCE || []).filter(function (p) { return isFinite(p.value) && p.value >= 0; });
  var LMAX = 0;
  PTS.forEach(function (p) { p.l = Math.log(p.value + 1) / Math.LN10; LMAX = Math.max(LMAX, p.l); p.k = continent(p.lon, p.lat); });
  PTS.sort(function (a, b) { return a.l - b.l; });
  var BUCK = {};
  PTS.forEach(function (p) { var key = Math.floor(p.lon / 5) + ',' + Math.floor(p.lat / 5); (BUCK[key] = BUCK[key] || []).push(p); });
  function nearest(lon, lat, maxDeg) {
    var best = null, bd = maxDeg * maxDeg, cx = Math.floor(lon / 5), cy = Math.floor(lat / 5), rr = Math.ceil(maxDeg / 5);
    for (var i = -rr; i <= rr; i++) for (var j = -rr; j <= rr; j++) {
      var b = BUCK[(cx + i) + ',' + (cy + j)]; if (!b) continue;
      for (var k = 0; k < b.length; k++) { var p = b[k], dx = (p.lon - lon) * Math.cos(lat * Math.PI / 180), dy = p.lat - lat, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = p; } }
    }
    return best;
  }
  function field(lon, lat) { var p = nearest(lon, lat, 4); return p ? p.l / LMAX : -1; }
  H.abundance = { points: PTS, max: LMAX, nearest: nearest, ramp: ramp };
  if (window.NK) window.NK.abundanceMax = LMAX;

  /* ================= WORLD ================= */
  function world() {
    var sec = H.$('[data-world]'); if (!sec || !LAND.d) return;
    var pin = H.$('.world__pin', sec), mask = H.$('[data-world-mask]', sec), title = H.$('[data-world-title]', sec);
    var svg = H.$('[data-world-svg]', sec), cv = H.$('[data-world-heat]', sec), marks = H.$('[data-world-marks]', sec);
    var mapBox = H.$('.world__canvas', sec), callout = H.$('[data-world-china]', sec);
    var card = H.$('[data-flipcard]', sec); pin.appendChild(card);
    var NS = 'http://www.w3.org/2000/svg';
    function node(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
    node('path', { d: LAND.d, fill: '#e8d6be', class: 'world__landpath' });
    var cnD = (GEO.china && GEO.china.outline || []).map(function (r) { return 'M' + r.map(function (p) { return ((p[0] + 180) * 2.5).toFixed(1) + ',' + ((84 - p[1]) * 2.5).toFixed(1); }).join('L') + 'Z'; }).join('');
    /* China, highlighted the 3D v3 way: plum fill, a breathing gold rim and a sonar ping */
    var cnLink = node('g', { class: 'world__cn', tabindex: '0', role: 'button', 'aria-label': 'China: look closer' });
    node('path', { d: cnD, class: 'world__cn-glow' }, cnLink);
    node('path', { d: cnD, class: 'world__cn-shape' }, cnLink);
    var CX = (104 + 180) * 2.5, CY = (84 - 35) * 2.5;
    node('circle', { cx: CX, cy: CY, r: 60, class: 'world__cn-ping' }, cnLink);
    node('circle', { cx: CX, cy: CY, r: 60, class: 'world__cn-ping world__cn-ping--2' }, cnLink);
    mapBox.style.setProperty('--cx', (CX / 9).toFixed(2) + '%');
    mapBox.style.setProperty('--cy', (CY / 3.5).toFixed(2) + '%');
    callout.style.left = (CX / 9 + 2.5).toFixed(2) + '%'; callout.style.top = (CY / 3.5 - 14).toFixed(2) + '%';

    var landPath = new Path2D(LAND.d);
    var ctx, w, h, hover = null, bloom = 0, dots = [], layers = {};
    var rng = H.rand(5);
    (function () {
      var g = GEO.world; if (!g) return;
      g.rows_mask.forEach(function (row, r) {
        if (!row) return;
        row.split(',').forEach(function (run) {
          var a = run.split(':'), s = +a[0], n = +a[1];
          for (var c = s; c < s + n; c++) {
            var lon = g.west + (c + .5) * g.step, lat = g.north - (r + .5) * g.step, v = field(lon, lat);
            if (rng() < (v < 0 ? .16 : .3 + v * .6)) dots.push({ lon: lon + (rng() - .5) * g.step, lat: lat + (rng() - .5) * g.step, v: v, r: rng(), k: continent(lon, lat) });
          }
        });
      });
    })();
    function X(lon) { return (lon + 180) * 2.5 / 900 * w; }
    function Y(lat) { return (84 - lat) * 2.5 / 350 * h; }
    /* watercolour patches: every sample pixel is a soft blot, pre-rendered per continent */
    function paintLayers() {
      layers = {};
      var d = Math.min(H.dpr(), 2), rad = 3.4 * 2.5 / 900 * w;
      ['na', 'sa', 'eu', 'af', 'as', 'oc'].forEach(function (k) {
        var c = document.createElement('canvas'); c.width = Math.round(w * d); c.height = Math.round(h * d);
        var g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
        g.save(); g.scale(w / 900, h / 350); g.clip(landPath); g.setTransform(d, 0, 0, d, 0, 0);
        PTS.forEach(function (p) {
          if (p.k !== k) return;
          var v = p.l / LMAX, x = X(p.lon), y = Y(p.lat), r = rad * (.75 + v * .6);
          var gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, ramp(v, .5)); gr.addColorStop(.5, ramp(v * .92, .26)); gr.addColorStop(1, ramp(v * .8, 0));
          g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
        });
        g.restore();
        layers[k] = c;
      });
    }
    function size() { var r = cv.getBoundingClientRect(); w = r.width; h = r.height; if (!w || !h) return; ctx = H.fit(cv, w, h, 2); paintLayers(); draw(); }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      Object.keys(layers).forEach(function (k) {
        ctx.globalAlpha = bloom * (hover ? (k === hover ? 1 : .35) : .95);
        ctx.drawImage(layers[k], 0, 0, w, h);
      });
      ctx.globalAlpha = 1;
      ctx.save(); ctx.scale(w / 900, h / 350); ctx.clip(landPath); ctx.setTransform(H.dpr(), 0, 0, H.dpr(), 0, 0);
      dots.forEach(function (d) {
        if (d.r > bloom * 1.2) return;
        var a = hover ? (d.k === hover ? .85 : .22) : .55;
        ctx.fillStyle = d.v < 0 ? 'rgba(150,128,110,' + (a * .45) + ')' : ramp(d.v, a);
        ctx.beginPath(); ctx.arc(X(d.lon), Y(d.lat), (.7 + Math.max(0, d.v) * 1.8) * (w / 900), 0, 6.29); ctx.fill();
      });
      ctx.restore();
    }

    /* ---------- case points and their flip cards ---------- */
    var openCase = null, closeT = 0, openT = 0, overCard = false;
    var fKick = H.$('[data-flip-kicker]', card), fTitle = H.$('[data-flip-title]', card), fFront = H.$('[data-flip-front]', card);
    var fLoss = H.$('[data-flip-loss]', card), fSrc = H.$('[data-flip-src]', card);
    (REG.cases || []).forEach(function (c, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'wmark';
      b.style.left = ((c.lon + 180) * 2.5 / 9) + '%'; b.style.top = ((84 - c.lat) * 2.5 / 3.5) + '%'; b.style.setProperty('--d', (i * .35) + 's');
      b.setAttribute('aria-label', c.region + ': ' + c.nematode + ' on ' + c.crop);
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; clearTimeout(closeT); clearTimeout(openT); openT = setTimeout(function () { open(c, b); }, 110); });
      b.addEventListener('pointerleave', function () { clearTimeout(openT); scheduleClose(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); if (openCase === c && !card.hidden) { if (e.pointerType === 'touch' || !e.pointerType) closeCard(); } else open(c, b); });
      b.addEventListener('focus', function () { open(c, b); });
      b.addEventListener('blur', function () { setTimeout(function () { if (!card.contains(document.activeElement)) scheduleClose(0); }, 10); });
      c.btn = b;
      marks.appendChild(b);
    });
    function scheduleClose(ms) { clearTimeout(closeT); closeT = setTimeout(function () { if (!overCard) closeCard(); }, ms == null ? 320 : ms); }
    card.addEventListener('pointerenter', function () { overCard = true; clearTimeout(closeT); });
    card.addEventListener('pointerleave', function () { overCard = false; scheduleClose(160); });
    card.addEventListener('focusout', function (e) { if (card.classList.contains('is-turning')) return; if (!card.contains(e.relatedTarget) && !(openCase && e.relatedTarget === openCase.btn)) scheduleClose(0); });
    function open(c, b) {
      clearTimeout(closeT);
      if (openCase && openCase.btn) openCase.btn.setAttribute('aria-expanded', 'false');
      openCase = c; b.setAttribute('aria-expanded', 'true');
      var cont = (REG.continents || {})[c.continent] || {};
      var near = nearest(c.lon, c.lat, 6);
      fKick.textContent = cont.name || '';
      fTitle.textContent = c.region;
      fFront.innerHTML = '<dt>Nematode</dt><dd>' + esc(c.nematode) + '<i>' + esc(c.species) + '</i></dd><dt>Crop</dt><dd>' + esc(c.crop) + '</dd>' +
        (near ? '<dt>Nearest sample</dt><dd><div class="flipcard__bar"><i style="width:' + Math.round(12 + near.l / LMAX * 88) + '%;background:' + ramp(near.l / LMAX) + '"></i></div><small>' + Math.round(near.value).toLocaleString('en') + ' plant-feeding nematodes per 100 g dry soil</small></dd>' : '');
      fLoss.textContent = c.loss;
      fSrc.innerHTML = c.source ? '<a href="' + esc(c.source.url) + '" target="_blank" rel="noopener">' + esc(c.source.title) + '</a> (' + esc(c.source.year) + ')' : '';
      var pr = pin.getBoundingClientRect(), br = b.getBoundingClientRect(), x = br.left + br.width / 2 - pr.left, y = br.top + br.height / 2 - pr.top, cw = 300;
      var left = x + 22 + cw > pr.width - 12 ? x - cw - 22 : x + 22, top = H.clamp(y - 70, 80, pr.height - 300);
      card.style.left = left + 'px'; card.style.top = top + 'px';
      card.style.setProperty('--ox', left < x ? '100%' : '0');
      card.classList.remove('is-flipped');
      card.hidden = false; card.classList.remove('is-open'); void card.offsetWidth; card.classList.add('is-open');
      hover = c.continent; draw();
    }
    function closeCard() {
      if (card.hidden) return;
      card.classList.remove('is-open');
      if (openCase && openCase.btn) openCase.btn.setAttribute('aria-expanded', 'false');
      openCase = null; hover = null; draw();
      setTimeout(function () { if (!card.classList.contains('is-open')) card.hidden = true; }, 380);
    }
    H.$$('[data-flip-turn]', card).forEach(function (bt) {
      bt.addEventListener('click', function () {
        card.classList.add('is-turning'); clearTimeout(closeT);
        setTimeout(function () {
          card.classList.toggle('is-flipped');
          var f = card.querySelector(card.classList.contains('is-flipped') ? '.flipcard__back [data-flip-turn]' : '.flipcard__front [data-flip-turn]');
          if (f) f.focus({ preventScroll: true });
        }, 220);
        setTimeout(function () { card.classList.remove('is-turning'); }, 480);
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
    document.addEventListener('pointerdown', function (e) { if (!card.hidden && !card.contains(e.target) && !marks.contains(e.target)) closeCard(); });

    function goChina() {
      closeCard();
      if (H.pager && H.pager.isPaged()) H.pager.go('china');
      else { var t = H.$('#china'); if (t) t.scrollIntoView({ behavior: H.reduced ? 'auto' : 'smooth' }); }
    }
    cnLink.addEventListener('click', goChina);
    cnLink.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goChina(); } });
    callout.addEventListener('click', goChina);
    cnLink.addEventListener('pointerenter', function () { sec.classList.add('is-cn-hot'); });
    cnLink.addEventListener('pointerleave', function () { sec.classList.remove('is-cn-hot'); });

    /* ---------- 3D v3 iris: the flashlight becomes a spotlight ----------
     * Ported from the 3D v3 homepage (home-core.js, iris) without changing its
     * logic. While the page scrolls from the soil to this page, the light
     * leaves the spot where the nematode was found, wobbles its way to the
     * title, circles it, then pops open over the whole map. */
    var opened = false, counted = false, visible = false, bloomRaf = 0;
    function bloomTo(v, ms) {
      cancelAnimationFrame(bloomRaf);
      var b0 = bloom, t0 = performance.now(), dur = H.reduced ? 1 : (ms || 1200);
      (function f(now) { var k = H.clamp((now - t0) / dur, 0, 1); bloom = H.lerp(b0, v, H.ease(k)); draw(); if (k < 1) bloomRaf = requestAnimationFrame(f); })(t0);
    }
    function openNow() { opened = true; sec.classList.add('is-open'); if (bloom < 1) bloomTo(1); if (!counted) { counted = true; count(); } }
    function closeNow() { opened = false; counted = false; sec.classList.remove('is-open'); cancelAnimationFrame(bloomRaf); bloom = 0; draw(); }
    var NK = window.NK;
    (function iris() {
      if (!NK || !NK.loop || H.reduced) return;
      var ov = document.createElement('div');
      ov.className = 'nk-iris';
      ov.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ov);
      var root = document.documentElement;
      var popped = false, popT0 = 0, popFrom = 80, r0 = 86;
      var cur = { x: 0, y: 0, r: 80 };
      function frame(t) {
        var vh = window.innerHeight, vw = window.innerWidth;
        var rect = sec.getBoundingClientRect();
        var q = (vh - rect.top) / (vh * 0.95);
        if (q <= 0.001) { ov.style.opacity = '0'; popped = false; root.classList.remove('nk-irising'); r0 = H.lastLight ? Math.max(60, H.lastLight.r * 0.8) : 86; return; }
        var tr = title.getBoundingClientRect();
        var tx = tr.left + tr.width * 0.46;
        var ty = tr.top + tr.height * 0.5;
        if (!popped) {
          var start = NK.state.lightScreen || { x: vw * 0.66, y: vh * 0.7 };
          var k = NK.smooth(0.05, 0.5, q);
          var wob = 1 - NK.smooth(0.2, 0.52, q);
          var rTitle = Math.max(tr.width * 0.58, tr.height * 0.9) + 20;
          cur.x = NK.lerp(start.x, tx, k) + (Math.sin(t * 5.1) * 46 + Math.sin(t * 12.3) * 9) * wob;
          cur.y = NK.lerp(start.y, ty, k) + (Math.cos(t * 4.3) * 30 + Math.sin(t * 9.1) * 7) * wob;
          cur.r = NK.lerp(r0, rTitle, NK.smooth(0.36, 0.56, q));
          ov.style.opacity = String(NK.smooth(0, 0.12, q));
          root.classList.toggle('nk-irising', q < 0.64);
          if (q > 0.64) { popped = true; popT0 = t; popFrom = cur.r; root.classList.remove('nk-irising'); openNow(); }
        } else {
          var e = NK.clamp((t - popT0) / 0.9, 0, 1);
          var full = Math.sqrt(vw * vw + vh * vh);
          cur.x = NK.lerp(cur.x, tx, 0.2);
          cur.y = NK.lerp(cur.y, ty, 0.2);
          cur.r = popFrom + (full - popFrom) * (e < 1 ? 1 - Math.pow(1 - e, 3) : 1) + (e < 0.25 ? -18 * Math.sin(e / 0.25 * Math.PI) : 0);
          ov.style.opacity = String(1 - NK.smooth(0.55, 1, e));
          if (q < 0.46) popped = false;
        }
        ov.style.setProperty('--ix', cur.x.toFixed(1) + 'px');
        ov.style.setProperty('--iy', cur.y.toFixed(1) + 'px');
        ov.style.setProperty('--ir', Math.max(0, cur.r).toFixed(1) + 'px');
      }
      var stop = null;
      if (!('IntersectionObserver' in window)) { NK.loop(frame); return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { if (!stop) stop = NK.loop(frame); return; }
          if (stop) { stop(); stop = null; }
          ov.style.opacity = '0';
          root.classList.remove('nk-irising');
          popped = en.boundingClientRect.top < 0;
        });
      }, { rootMargin: '0px 0px 25% 0px' }).observe(sec);
    }());
    /* ---------- leaving for China: the map zooms until China sits exactly where
     * the 3D China map starts, and the page darkens around it ---------- */
    function dive(on) {
      if (!on) { sec.classList.remove('is-diving'); mapBox.style.transform = ''; return; }
      var cr = mapBox.getBoundingClientRect();
      var f = window.NK && NK.chinaFrame ? NK.chinaFrame() : null;
      if (!f) {
        /* no WebGL: aim at the 2D China map of the next page instead */
        var cz = document.getElementById('china'), land = cz && cz.querySelector('.cz__land');
        if (land) { var lr = land.getBoundingClientRect(), zr = cz.getBoundingClientRect(); if (lr.width) f = { x: lr.left, y: lr.top - zr.top, w: lr.width, h: lr.height * 0.9 }; }
      }
      f = f || { x: innerWidth * 0.36, y: innerHeight * 0.14, w: innerWidth * 0.56, h: innerHeight * 0.74 };
      var X = function (lon) { return (lon + 180) * 2.5 / 900 * cr.width; }, Y = function (lat) { return (84 - lat) * 2.5 / 350 * cr.height; };
      var x0 = X(73.5), x1 = X(134.8), y0 = Y(53.6), y1 = Y(18.2), s, dx, dy;
      if (f.a && f.b) {
        /* map the same two lon/lat points onto where the 3D map draws them */
        s = ((f.b.x - f.a.x) / (X(f.b.lon) - X(f.a.lon)) + (f.b.y - f.a.y) / (Y(f.b.lat) - Y(f.a.lat))) / 2;
        dx = f.a.x - cr.left - X(f.a.lon) * s; dy = f.a.y - cr.top - Y(f.a.lat) * s;
      } else {
        s = Math.min(f.w / (x1 - x0), f.h / (y1 - y0));
        dx = f.x + f.w / 2 - cr.left - (x0 + x1) / 2 * s; dy = f.y + f.h / 2 - cr.top - (y0 + y1) / 2 * s;
      }
      mapBox.style.transformOrigin = '0 0';
      mapBox.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      sec.classList.add('is-diving');
    }
    H.scene('world', {
      cancel: function () { dive(false); if (window.NK && NK.chinaCancelHandoff) NK.chinaCancelHandoff(); },
      inMs: 2000,   // v7.2: 2.8 s -> 2.0 s from the soil to the world map
      set: function (i, dir) { dive(false); if (dir < 0) openNow(); else closeNow(); },
      enter: function () { dive(false); if (!opened) openNow(); return 300; },
      leave: function (dir, info) {
        closeCard();
        if (dir > 0 && info && info.to === 'china' && info.adjacent && innerWidth > 980) { if (window.NK && NK.chinaHandoff) NK.chinaHandoff(); dive(true); return 1900; }
        return 0;
      },
      ff: function () { openNow(); }
    });
    function count() {
      var el = H.$('[data-usd]', sec); if (!el || H.reduced) return;
      var s = performance.now();
      (function step(n) { var k = H.ease(H.clamp((n - s) / 1400, 0, 1)); el.textContent = 'US$' + Math.round(173 * k); if (k < 1) requestAnimationFrame(step); })(s);
    }
    H.onView(sec, function (v) { visible = v; if (v && !opened && !(H.pager && H.pager.isPaged())) openNow(); });
    size();
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 120); });
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(size, 120); }).observe(cv);
  }

  /* ================= HUMAN PRACTICES: three China maps ================= */
  var PROV = { Heilongjiang: [126.6, 45.8], Jilin: [125.3, 43.9], Liaoning: [123.4, 41.8], 'Inner Mongolia': [111.7, 40.8], Beijing: [116.4, 39.9], Tianjin: [117.2, 39.1], Hebei: [114.5, 38], Shanxi: [112.5, 37.9], Shandong: [117, 36.7], Henan: [113.7, 34.8], Anhui: [117.3, 31.9], Jiangsu: [118.8, 32.1], Shanghai: [121.5, 31.2], Zhejiang: [120.2, 30.3], Jiangxi: [115.9, 28.7], Hubei: [114.3, 30.6], Shaanxi: [108.9, 34.3], Gansu: [103.8, 36.1], Ningxia: [106.3, 38.5], Xinjiang: [87.6, 43.8], Tibet: [91.1, 29.7], Guizhou: [106.7, 26.6], Yunnan: [102.7, 25], Guangxi: [108.3, 22.8], Fujian: [119.3, 26.1], Guangdong: [113.3, 23.1], Hainan: [110.3, 20], Hunan: [113, 28.2], Qinghai: [101.8, 36.6], Sichuan: [104.1, 30.7], Chongqing: [106.5, 29.6] };
  /* illustrative values: seeded, so the page looks the same on every visit */
  var HPD = (function () {
    var r = H.rand(2026), names = Object.keys(PROV), out = { survey: {}, teach: {}, soil: {} };
    names.forEach(function (n) { if (r() < .74) out.survey[n] = Math.round(8 + Math.pow(r(), 1.6) * 190); });
    names.forEach(function (n) { if (r() < .4) out.teach[n] = 1 + Math.floor(r() * 7); });
    names.forEach(function (n) { if (r() < .45) out.soil[n] = 4 + Math.floor(Math.pow(r(), 1.3) * 42); });
    return out;
  }());
  var HPMAX = { survey: 1, teach: 1, soil: 1 };
  Object.keys(HPD).forEach(function (k) { Object.keys(HPD[k]).forEach(function (n) { HPMAX[k] = Math.max(HPMAX[k], HPD[k][n]); }); });
  function provAt(lon, lat) {
    var best = null, bd = 1e9;
    Object.keys(PROV).forEach(function (n) { var p = PROV[n], dx = (p[0] - lon) * Math.cos(lat * Math.PI / 180), dy = p[1] - lat, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = n; } });
    return best;
  }
  var TEXT = {
    survey: { k: 'Survey', t: 'Who answered our questionnaire', b: '<p>Growers, agronomists and students told us how they notice nematode damage today and what an early warning would need to look like.</p><p>Colour: responses per province.</p><small>Illustrative data. The team\u2019s survey counts replace these values.</small>' },
    teach: { k: 'Teaching', t: 'Where we taught', b: '<p>Volunteer classes on soil life, nematodes and synthetic biology for primary and middle school students.</p><p>Marker size: classes held in the province.</p><small>Illustrative data. The team\u2019s teaching records replace these values.</small>' },
    soil: { k: 'Soil programme', t: 'Where soil samples came from', b: '<p>Soil samples collected with local growers, for the lab and for talking about what a colour readout could mean on a farm.</p><p>Bar height: samples from the province.</p><small>Illustrative data. The team\u2019s sampling log replaces these values.</small>' }
  };

  function hp() {
    var sec = H.$('[data-hp]'); if (!sec || !GEO.china) return;
    var G = GEO.china, KINDS = ['survey', 'teach', 'soil'], COL = ['#c48cff', '#ffa24a', '#9aa7ff'];
    var fig = H.$('[data-hp-map]', sec);
    var cvs = KINDS.map(function (k) { return H.$('canvas[data-layer="' + k + '"]', sec); });
    var tabs = H.$$('[data-hp-tab]', sec);
    /* one short figure per layer, from the same (illustrative) values the map draws */
    KINDS.forEach(function (k, i) {
      var d = HPD[k], n = Object.keys(d), sum = n.reduce(function (a, p) { return a + d[p]; }, 0);
      var el = H.$('[data-hp-stat="' + i + '"]', sec);
      if (el) el.textContent = sum + (k === 'survey' ? ' responses' : k === 'teach' ? ' classes' : ' samples') + ' \u00b7 ' + n.length + ' provinces';
    });
    function inside(lon, lat) {
      var r = Math.floor((G.north - lat) / G.step), c = Math.floor((lon - G.west) / G.step), row = G.rows_mask[r];
      if (!row) return false;
      return row.split(',').some(function (run) { var a = run.split(':'); return c >= +a[0] && c < +a[0] + +a[1]; });
    }

    /* ---------- one view shared by all three layers ----------
     * The base map (outline + South China Sea inset) sits on its own canvas
     * and never changes when the layer changes; the three data layers use
     * the same projection and only cross-fade on top of it. v7.6: the map
     * faces the reader straight on (no oblique angle, no pointer tilt);
     * nothing is redrawn once it has settled. */
    var base = document.createElement('canvas');
    base.setAttribute('data-layer', 'base'); base.setAttribute('aria-hidden', 'true');
    fig.insertBefore(base, fig.firstChild);
    var LON0 = 104.25, LAT0 = 35.75;
    var V = { w: 1, h: 1, s: 1, cx: 0, cy: 0, yaw: 0, tilt: 0, ty: 0, tt: 0, hmax: 100 };
    function sq() { return 1; }   // v7.6: face-on (was an oblique 0.6 squash)
    function P3(lon, lat, z) {
      var dx = (lon - LON0) * 0.84 * V.s, dy = (LAT0 - lat) * V.s;
      var ca = Math.cos(V.yaw), sa = Math.sin(V.yaw), rx = dx * ca - dy * sa, ry = dx * sa + dy * ca;
      return [V.cx + rx * 0.96, V.cy + ry * sq() - (z || 0)];
    }
    function unP3(x, y) {
      var rx = (x - V.cx) / 0.96, ry = (y - V.cy) / sq(), ca = Math.cos(V.yaw), sa = Math.sin(V.yaw);
      var dx = rx * ca + ry * sa, dy = -rx * sa + ry * ca;
      return [dx / (0.84 * V.s) + LON0, LAT0 - dy / V.s];
    }
    /* the South China Sea inset lies on the same plane, south-east of the mainland */
    var IN = { lon0: 106, lon1: 124, lat0: 3, lat1: 24, k: 0.52, clon: 130.6, clat: 23.2 };
    function PI3(lon, lat) { return P3(IN.clon + (lon - (IN.lon0 + IN.lon1) / 2) * IN.k, IN.clat + (lat - (IN.lat0 + IN.lat1) / 2) * IN.k); }
    function sizeView() {
      var r = fig.getBoundingClientRect(); V.w = Math.max(1, r.width); V.h = Math.max(1, r.height || r.width * 0.86);
      V.hmax = V.h * 0.12;
      V.s = Math.min(V.w * 0.9 / (62.5 * 0.84 * 0.96), (V.h - V.hmax - 24) / 36.5);
      V.cx = V.w / 2; V.cy = V.hmax + (V.h - V.hmax) / 2;
    }
    function ringPath(c, ring, proj) { c.beginPath(); ring.forEach(function (p, i) { var q = proj(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); }
    var bctx = null;
    function drawBase() {
      var c = bctx; c.clearRect(0, 0, V.w, V.h);
      /* a soft pool of light under the map */
      /* an ellipse that fades out before it reaches the canvas edges, so it
         never ends in a hard line at the bottom of the map box */
      var ry = Math.min(V.h - V.cy, V.cy) * 0.96, sx = Math.min(1.7, (V.w / 2) * 0.96 / ry);
      c.save(); c.translate(V.cx, V.cy); c.scale(sx, 1);
      var g = c.createRadialGradient(0, 0, 0, 0, 0, ry);
      g.addColorStop(0, 'rgba(160,110,220,.14)'); g.addColorStop(1, 'rgba(160,110,220,0)');
      c.fillStyle = g; c.fillRect(-ry, -ry, ry * 2, ry * 2); c.restore();
      G.outline.forEach(function (ring) {
        ringPath(c, ring, P3);
        c.fillStyle = 'rgba(255,255,255,.045)'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.82)'; c.lineWidth = 1.3; c.shadowColor = 'rgba(255,255,255,.45)'; c.shadowBlur = 6; c.stroke(); c.shadowBlur = 0;
      });
      /* inset frame */
      var a = PI3(IN.lon0, IN.lat1), b = PI3(IN.lon1, IN.lat1), d = PI3(IN.lon1, IN.lat0), e = PI3(IN.lon0, IN.lat0);
      c.save();
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath();
      c.fillStyle = 'rgba(255,255,255,.03)'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.36)'; c.lineWidth = 1; c.stroke();
      c.clip();
      G.outline.forEach(function (ring) { ringPath(c, ring, PI3); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.8; c.stroke(); });
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.1;
      (G.maritime || []).forEach(function (l) { c.beginPath(); l.forEach(function (p, i) { var q = PI3(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); });
      c.restore();
    }

    /* ---------- the three data layers ---------- */
    function makeLayer(kind, cv) {
      var ctx = null, introT = -1, m = { kind: kind, cv: cv, hot: null, on: false, fadeUntil: 0 };
      var rng = H.rand(kind === 'soil' ? 3 : 9);
      var data = HPD[kind], mx = HPMAX[kind];
      var hexes = [], pins = [], mesh = [], bars = [];
      if (kind === 'survey') {
        var st = 0.62, rowH = st * 0.866;
        for (var lat = 53.8, ri = 0; lat > 17.6; lat -= rowH, ri++) for (var lon = 73.4 + (ri % 2) * st / 2; lon < 135.4; lon += st)
          if (inside(lon, lat)) { var pn = provAt(lon, lat), v = data[pn]; hexes.push({ lon: lon, lat: lat, n: pn, v: v ? v / mx : -1, d: (lon - 73) / 62 + rng() * 0.25 }); }
        m.dot = st * 0.84 * 0.37;
      }
      if (kind === 'teach') Object.keys(data).forEach(function (n, i) { pins.push({ n: n, ll: PROV[n], v: data[n], d: i * 0.05 }); });
      if (kind === 'soil') {
        var stp = 1.25, grid = {};
        for (var la = 53.5, r2 = 0; la > 18; la -= stp, r2++) for (var lo = 73.5, c2 = 0; lo < 135; lo += stp, c2++) {
          var jl = lo + (rng() - 0.5) * stp * 0.7, ja = la + (rng() - 0.5) * stp * 0.7;
          if (inside(jl, ja)) grid[r2 + ',' + c2] = [jl, ja];
        }
        Object.keys(grid).forEach(function (key) {
          var rc = key.split(','), r = +rc[0], c = +rc[1], a = grid[key];
          [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(function (d) { var b = grid[(r + d[0]) + ',' + (c + d[1])]; if (b && !(d[0] === 1 && d[1] === -1 && grid[(r + 1) + ',' + c])) mesh.push([a, b]); });
        });
        Object.keys(data).forEach(function (n, i) { bars.push({ n: n, ll: PROV[n], v: data[n] / mx, raw: data[n], d: i * 0.06, col: ['#ffa24a', '#ff6f8a', '#b88bff', '#6fb6ff', '#ffd34d'][i % 5] }); });
        bars.sort(function (a, b) { return b.ll[1] - a.ll[1]; });
      }
      m.size = function () { ctx = H.fit(cv, V.w, V.h, 2); };
      m.intro = function () { introT = performance.now(); };
      m.busy = function () { return introT >= 0 && performance.now() - introT < 1700; };
      m.draw = function (mouse) {
        if (!ctx) return;
        var it = introT < 0 ? 0 : H.clamp((performance.now() - introT) / 1600, 0, 1), c = ctx, S = sq(), hot = null;
        c.clearRect(0, 0, V.w, V.h);
        if (kind === 'survey') {
          var r0 = m.dot * V.s;
          hexes.forEach(function (d) {
            var k = H.clamp((it * 1.5 - d.d) * 3, 0, 1); if (k <= 0) return;
            var q = P3(d.lon, d.lat), near = 0;
            if (mouse) { var dd = Math.hypot(q[0] - mouse[0], (q[1] - mouse[1]) / S); near = Math.max(0, 1 - dd / 80); }
            var r = r0 * (1 + near * 0.9) * k;
            c.fillStyle = d.v < 0 ? 'rgba(255,255,255,' + (0.13 + near * 0.2) + ')' : ramp(Math.min(1, 0.15 + d.v * 0.85), 0.82 + near * 0.18);
            c.beginPath(); c.ellipse(q[0], q[1], r, r * S, 0, 0, 6.29); c.fill();
          });
        }
        if (kind === 'teach') {
          pins.forEach(function (pn) {
            var k = H.ease(H.clamp((it * 1.6 - pn.d) * 2.5, 0, 1)); if (k <= 0) return;
            var q = P3(pn.ll[0], pn.ll[1]), near = mouse && Math.hypot(q[0] - mouse[0], q[1] - mouse[1]) < 14; if (near) hot = pn;
            var sz = 5 * (1 + pn.v * 0.45) * k * (near ? 1.35 : 1);
            c.fillStyle = 'rgba(255,162,74,.2)'; c.beginPath(); c.ellipse(q[0], q[1], sz * 2.2, sz * 2.2 * S, 0, 0, 6.29); c.fill();
            c.fillStyle = '#ffa24a'; c.shadowColor = '#ffa24a'; c.shadowBlur = 10; c.beginPath(); c.arc(q[0], q[1], sz, 0, 6.29); c.fill(); c.shadowBlur = 0;
          });
        }
        if (kind === 'soil') {
          c.strokeStyle = 'rgba(235,235,255,' + (0.06 + 0.14 * it) + ')'; c.lineWidth = 0.7;
          c.beginPath();
          mesh.forEach(function (e, i) { if (i / mesh.length > it * 1.3) return; var a = P3(e[0][0], e[0][1]), b = P3(e[1][0], e[1][1]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
          c.stroke();
          bars.forEach(function (b) {
            var k = H.ease(H.clamp((it * 1.8 - b.d) * 2, 0, 1)), q = P3(b.ll[0], b.ll[1]), hh = (12 + b.v * V.hmax) * k;
            var near = mouse && Math.abs(mouse[0] - q[0]) < 9 && mouse[1] < q[1] + 6 && mouse[1] > q[1] - hh - 10; if (near) hot = b;
            var g = c.createLinearGradient(0, q[1], 0, q[1] - hh); g.addColorStop(0, b.col + '22'); g.addColorStop(1, b.col);
            c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(q[0], q[1], 5, 5 * S * 0.6, 0, 0, 6.29); c.fill();
            c.fillStyle = g; c.fillRect(q[0] - (near ? 4 : 2.6), q[1] - hh, near ? 8 : 5.2, hh);
            c.fillStyle = b.col; c.shadowColor = b.col; c.shadowBlur = near ? 20 : 12; c.beginPath(); c.arc(q[0], q[1] - hh, near ? 5 : 3.4, 0, 6.29); c.fill(); c.shadowBlur = 0;
          });
        }
        m.hot = hot;
      };
      m.tipAt = function (mouse) {
        if (kind === 'survey') {
          var ll = unP3(mouse[0], mouse[1]);
          if (inside(ll[0], ll[1])) { var pn = provAt(ll[0], ll[1]); return '<b>' + pn + '</b>' + (data[pn] ? data[pn] + ' responses' : 'No responses yet'); }
          return '';
        }
        if (!m.hot) return '';
        if (kind === 'teach') return '<b>' + m.hot.n + '</b>' + m.hot.v + (m.hot.v > 1 ? ' classes' : ' class');
        return '<b>' + m.hot.n + '</b>' + m.hot.raw + ' soil samples';
      };
      return m;
    }
    var layers = KINDS.map(function (k, i) { return makeLayer(k, cvs[i]); });

    /* ---------- one render loop that sleeps when nothing moves ---------- */
    var raf = 0, visible = true, mouse = null, cur = -1, dirty = true, lastYaw = 1, lastTilt = 1;
    function frame() {
      raf = 0; if (!visible) return;
      V.yaw += (V.ty - V.yaw) * 0.12; V.tilt += (V.tt - V.tilt) * 0.12;
      var moved = Math.abs(V.yaw - lastYaw) > 1e-4 || Math.abs(V.tilt - lastTilt) > 1e-4;
      if (moved || dirty) { drawBase(); lastYaw = V.yaw; lastTilt = V.tilt; }
      var now = performance.now(), busy = moved;
      layers.forEach(function (L, j) {
        var shown = j === cur || now < L.fadeUntil;
        if (!shown) return;
        if (moved || dirty || L.busy() || (j === cur && mouse)) L.draw(j === cur ? mouse : null);
        if (L.busy()) busy = true;
      });
      dirty = false;
      if (busy || Math.abs(V.ty - V.yaw) > 1e-4 || Math.abs(V.tt - V.tilt) > 1e-4) kick();
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    function resize() { sizeView(); bctx = H.fit(base, V.w, V.h, 2); layers.forEach(function (L) { L.size(); }); dirty = true; kick(); }

    function show(i) {
      if (i === cur) return;
      var was = cur; cur = i;
      layers.forEach(function (L, j) { L.cv.classList.toggle('is-on', j === i); if (j === was) L.fadeUntil = performance.now() + 850; });
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      sec.style.setProperty('--hpc', COL[i]);
      layers[i].intro(); kick();
      H.tip(null);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!n) return;
        e.preventDefault(); e.stopPropagation();
        var k = (i + n + 3) % 3; tabs[k].focus(); show(k);
      });
    });
    var tipT = 0;
    function move(e) {
      var r = fig.getBoundingClientRect(); mouse = [e.clientX - r.left, e.clientY - r.top];
      kick();
      clearTimeout(tipT);
      tipT = setTimeout(function () { if (mouse && cur >= 0) H.tip(layers[cur].tipAt(mouse), e.clientX, e.clientY); }, 20);
    }
    function leave() { mouse = null; H.tip(null); dirty = true; kick(); }
    fig.addEventListener('pointermove', move); fig.addEventListener('pointerdown', move); fig.addEventListener('pointerleave', leave);
    H.onView(fig, function (v) { visible = v; if (v) { dirty = true; kick(); } });
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(resize, 120); });
    resize();
    H.scene('hp', {
      steps: 2,
      set: function (i) { show(i); },
      step: function (i) { show(i); return 700; }
    });
    show(0);
    H.once(sec, function () { if (cur >= 0) { layers[cur].intro(); kick(); } }, .3);
  }
  H.ready(function () { world(); hp(); });
})();
