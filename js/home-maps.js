/* NKU homepage — 02 world map + 03 China maps */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  var GEO = window.NKU_GEO || {}, LAND = window.NKU_LAND || {};
  var RAMP = [[243, 220, 194], [244, 162, 97], [239, 111, 108], [192, 78, 168], [110, 79, 210]];
  function ramp(v, a) {
    v = H.clamp(v, 0, 1) * (RAMP.length - 1); var i = Math.min(RAMP.length - 2, Math.floor(v)), f = v - i, A = RAMP[i], B = RAMP[i + 1];
    return 'rgba(' + Math.round(H.lerp(A[0], B[0], f)) + ',' + Math.round(H.lerp(A[1], B[1], f)) + ',' + Math.round(H.lerp(A[2], B[2], f)) + ',' + (a == null ? 1 : a) + ')';
  }
  /* sample abundance field (shared by world and China so both use one scale) */
  var SPOTS = [[-92, 40, .8, 9], [-100, 50, .45, 10], [-120, 44, .35, 8], [-50, -14, .75, 10], [-62, -30, .55, 8], [-74, 4, .5, 7],
    [5, 50, .62, 8], [22, 47, .5, 9], [-4, 40, .35, 6], [10, 8, .6, 9], [30, 0, .7, 9], [28, -24, .55, 8], [38, 9, .45, 6], [-6, 32, .3, 6],
    [78, 23, .72, 9], [104, 15, .66, 8], [115, 34, .82, 7], [124, 45, .68, 6], [108, 27, .6, 7], [88, 44, .38, 6], [100, 52, .3, 10], [60, 48, .32, 10],
    [45, 33, .38, 7], [138, 36, .5, 4], [145, -32, .6, 8], [120, -26, .3, 9], [172, -41, .4, 3], [110, -6, .55, 6]];
  function field(lon, lat) {
    var v = .12 + .08 * Math.sin(lon * .21) * Math.cos(lat * .17);
    for (var i = 0; i < SPOTS.length; i++) {
      var s = SPOTS[i], dx = (lon - s[0]) * Math.cos(lat * Math.PI / 180), dy = lat - s[1];
      v = Math.max(v, s[2] * Math.exp(-(dx * dx + dy * dy) / (2 * s[3] * s[3])));
    }
    return H.clamp(v, 0, 1);
  }
  if (window.NKU_ABUNDANCE && window.NKU_ABUNDANCE.length) {
    var pts = window.NKU_ABUNDANCE, mx = 0;
    Array.prototype.forEach.call(document.querySelectorAll('[data-demo-flag]'), function (e) { e.hidden = true; });
    pts.forEach(function (p) { p.l = Math.log10(p.value + 1); mx = Math.max(mx, p.l); });
    field = function (lon, lat) { var best = 0, bd = 1e9; pts.forEach(function (p) { var d = (p.lon - lon) * (p.lon - lon) + (p.lat - lat) * (p.lat - lat); if (d < bd) { bd = d; best = p.l / mx; } }); return bd < 16 ? best : .05; };
  }
  function continent(lon, lat) {
    if (lon < -30) return lat > 12 ? 'na' : 'sa';
    if (lon > 110 && lat < -10 || lon > 160) return 'oc';
    if (lon < 60 && lat > 35 && !(lon > 26 && lat < 42)) return 'eu';
    if (lon < 52 && lat <= 35 && !(lon > 34 && lat > 12)) return 'af';
    return 'as';
  }
  var CONT = {
    na: { name: 'North America', nem: 'Soybean cyst nematode (Heterodera glycines)', crops: 'Soybean, maize rotations', note: 'Widely regarded as the most damaging soybean pest in the US Midwest.' },
    sa: { name: 'South America', nem: 'Root-knot and lesion nematodes', crops: 'Soybean, sugarcane, coffee', note: 'Large soybean frontiers where nematode pressure is rising.' },
    eu: { name: 'Europe', nem: 'Potato cyst nematodes (Globodera spp.)', crops: 'Potato, sugar beet', note: 'Regulated as quarantine pests across the EU.' },
    af: { name: 'Africa', nem: 'Burrowing and root-knot nematodes', crops: 'Banana, vegetables, cereals', note: 'Smallholder farms often lack access to soil testing.' },
    as: { name: 'Asia', nem: 'Root-knot and soybean cyst nematodes', crops: 'Rice, soybean, greenhouse vegetables', note: 'Includes China, the focus of the next section.' },
    oc: { name: 'Oceania', nem: 'Root-lesion nematodes (Pratylenchus spp.)', crops: 'Wheat, barley', note: 'A long-standing concern in Australian grain belts.' }
  };
  var CASES = [[-91, 41, 'na'], [-51, -16, 'sa'], [5, 52.5, 'eu'], [32, 1, 'af'], [80, 22, 'as'], [104, 14, 'as'], [146, -33, 'oc']];


  /* ================= WORLD ================= */
  function world() {
    var sec = H.$('[data-world]'); if (!sec || !LAND.d) return;
    var pin = H.$('.world__pin', sec), mask = H.$('[data-world-mask]', sec), title = H.$('[data-world-title]', sec);
    var svg = H.$('[data-world-svg]', sec), cv = H.$('[data-world-heat]', sec), marks = H.$('[data-world-marks]', sec);
    var card = H.$('[data-flipcard]', sec); pin.appendChild(card);
    var NS = 'http://www.w3.org/2000/svg';
    var land = document.createElementNS(NS, 'path'); land.setAttribute('d', LAND.d); land.setAttribute('fill', '#e8d6be'); svg.appendChild(land);
    var cn = document.createElementNS(NS, 'path');
    cn.setAttribute('d', (GEO.china && GEO.china.outline || []).map(function (r) { return 'M' + r.map(function (p) { return ((p[0] + 180) * 2.5).toFixed(1) + ',' + ((84 - p[1]) * 2.5).toFixed(1); }).join('L') + 'Z'; }).join(''));
    cn.setAttribute('fill', 'none'); cn.setAttribute('stroke', '#7e0c6e'); cn.setAttribute('stroke-width', '1.3'); cn.setAttribute('stroke-dasharray', '3 3'); cn.setAttribute('opacity', '.8');
    cn.style.pointerEvents = 'none'; svg.appendChild(cn);
    var landPath = new Path2D(LAND.d);
    var ctx, w, h, hover = null, bloom = 0, dots = [];
    var rng = H.rand(5);
    (function () {
      var g = GEO.world; if (!g) return;
      g.rows_mask.forEach(function (row, r) {
        if (!row) return;
        row.split(',').forEach(function (run) {
          var a = run.split(':'), s = +a[0], n = +a[1];
          for (var c = s; c < s + n; c++) {
            var lon = g.west + (c + .5) * g.step, lat = g.north - (r + .5) * g.step, v = field(lon, lat);
            if (rng() < .18 + v * .7) dots.push({ lon: lon + (rng() - .5) * g.step, lat: lat + (rng() - .5) * g.step, v: v, r: rng(), k: continent(lon, lat) });
          }
        });
      });
    })();
    function size() { var r = cv.getBoundingClientRect(); w = r.width; h = r.height; ctx = H.fit(cv, w, h, 2); draw(); }
    function X(lon) { return (lon + 180) * 2.5 / 900 * w; }
    function Y(lat) { return (84 - lat) * 2.5 / 350 * h; }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.save(); ctx.scale(w / 900, h / 350); ctx.clip(landPath); ctx.setTransform(H.dpr(), 0, 0, H.dpr(), 0, 0);
      var s = w / 900 * 2.5;
      SPOTS.forEach(function (sp) {
        var k = continent(sp[0], sp[1]), a = hover ? (k === hover ? 1 : .4) : .92;
        var r = sp[3] * s * 2.1 * bloom, x = X(sp[0]), y = Y(sp[1]);
        if (r <= 0) return;
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        var vv = Math.min(1, sp[2] * 1.2); g.addColorStop(0, ramp(vv, a)); g.addColorStop(.45, ramp(vv * .85, a * .55)); g.addColorStop(1, ramp(vv * .6, 0));
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });
      dots.forEach(function (d) {
        if (d.r > bloom * 1.2) return;
        var a = hover ? (d.k === hover ? .9 : .25) : .6;
        ctx.fillStyle = ramp(d.v, a); ctx.beginPath(); ctx.arc(X(d.lon), Y(d.lat), (.7 + d.v * 1.9) * (w / 900), 0, 6.29); ctx.fill();
      });
      ctx.restore();
    }
    // markers
    CASES.forEach(function (c, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'wmark';
      b.style.left = ((c[0] + 180) * 2.5 / 9) + '%'; b.style.top = ((84 - c[1]) * 2.5 / 3.5) + '%'; b.style.setProperty('--d', (i * .35) + 's');
      b.setAttribute('aria-label', CONT[c[2]].name + ': reported crop damage');
      b.addEventListener('click', function (e) { e.stopPropagation(); open(c[2], e, c); });
      b.addEventListener('pointerenter', function () { hover = c[2]; draw(); });
      b.addEventListener('pointerleave', function () { hover = null; draw(); });
      marks.appendChild(b);
    });
    function lonlat(e) { var r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 360 - 180, 84 - (e.clientY - r.top) / r.height * 140]; }
    svg.addEventListener('pointermove', function (e) {
      var ll = lonlat(e), k = continent(ll[0], ll[1]);
      if (k !== hover) { hover = k; draw(); }
    });
    svg.addEventListener('pointerleave', function () { hover = null; draw(); });
    svg.addEventListener('click', function (e) {
      var ll = lonlat(e);
      if (ll[0] > 73 && ll[0] < 135 && ll[1] > 18 && ll[1] < 54 && field(ll[0], ll[1]) >= 0 && inChina(ll[0], ll[1])) { goChina(); return; }
      open(continent(ll[0], ll[1]), e, [ll[0], ll[1]]);
    });
    function inChina(lon, lat) {
      var g = GEO.china; if (!g) return false;
      var r = Math.floor((g.north - lat) / g.step), c = Math.floor((lon - g.west) / g.step), row = g.rows_mask[r];
      if (!row) return false;
      return row.split(',').some(function (run) { var a = run.split(':'); return c >= +a[0] && c < +a[0] + +a[1]; });
    }
    function open(k, e, ll) {
      var C = CONT[k], v = field(ll[0], ll[1]);
      H.$('[data-flip-kicker]', card).textContent = 'Continent';
      H.$('[data-flip-title]', card).textContent = C.name;
      H.$('[data-flip-body]', card).innerHTML = '<dl><dt>Nematodes</dt><dd>' + C.nem + '</dd><dt>Crops</dt><dd>' + C.crops + '</dd><dt>Abundance</dt><dd><div class="flipcard__bar"><i style="width:' + Math.round(20 + v * 80) + '%"></i></div></dd></dl><small>' + C.note + ' Abundance bar reads the sample colour layer.</small>';
      var pr = pin.getBoundingClientRect(), x = e.clientX - pr.left, y = e.clientY - pr.top, cw = 290;
      var left = x + 16 + cw > pr.width - 12 ? x - cw - 16 : x + 16, top = H.clamp(y - 40, 70, pr.height - 260);
      card.style.left = left + 'px'; card.style.top = top + 'px';
      card.style.setProperty('--ox', (left < x ? '100%' : '0'));
      card.hidden = false; card.classList.remove('is-open'); void card.offsetWidth; card.classList.add('is-open');
      hover = k; draw();
    }
    function closeCard() { card.classList.remove('is-open'); setTimeout(function () { if (!card.classList.contains('is-open')) card.hidden = true; }, 400); }
    H.$('[data-flip-close]', card).addEventListener('click', closeCard);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
    document.addEventListener('pointerdown', function (e) { if (!card.hidden && !card.contains(e.target) && !svg.contains(e.target) && !marks.contains(e.target)) closeCard(); });
    function goChina() {
      closeCard(); var t = H.$('#china'); if (!t) return;
      scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: H.reduced ? 'auto' : 'smooth' });
      setTimeout(function () { var m = H.$('[data-cmap="env"]'); if (m) m.classList.add('is-ping'); }, 900);
    }
    H.$('[data-world-china]', sec).addEventListener('click', goChina);

    /* iris: the flashlight's last spot on the previous page grows until it uncovers the map */
    var t0 = performance.now(), opened = false, counted = false, iris = null;
    function setMask(x, y, r) { mask.style.setProperty('--mx', x + 'px'); mask.style.setProperty('--my', y + 'px'); mask.style.setProperty('--mr', r + 'px'); }
    function openNow() { iris = null; opened = true; sec.classList.add('is-open'); bloom = 1; draw(); if (!counted) { counted = true; count(); } }
    function closeNow() { opened = false; counted = false; sec.classList.remove('is-open'); bloom = 0; draw(); setMask(-999, -999, 0); }
    function tick(now) {
      if (iris) {
        var pr = pin.getBoundingClientRect(), k = H.clamp((now - iris.t0) / iris.dur, 0, 1), hold = .12;
        var e = H.ease(H.clamp((k - hold) / (1 - hold), 0, 1)), far = Math.hypot(Math.max(iris.x, pr.width - iris.x), Math.max(iris.y, pr.height - iris.y)) + 80;
        var wob = (1 - e) * 5, x = iris.x + Math.sin(now / 90) * wob, y = iris.y + Math.cos(now / 110) * wob;
        setMask(x, y, H.lerp(iris.r, far, e));
        bloom = H.smooth(.35, .95, k); draw();
        if (!counted && k > .45) { counted = true; count(); }
        if (k >= 1) openNow();
      }
      if (visible) requestAnimationFrame(tick);
    }
    H.scene('world', {
      cutIn: true,
      set: function (i, dir) { if (dir < 0) openNow(); else closeNow(); },
      enter: function (dir, info) {
        if (opened) return 0;
        if (!info || !info.cut || !H.lastLight || innerWidth <= 980) { openNow(); return 0; }
        var L = H.lastLight; iris = { x: L.x, y: L.y, r: Math.max(40, L.r * .85), t0: performance.now(), dur: 1500 };
        setMask(iris.x, iris.y, iris.r); requestAnimationFrame(tick); return 1500;
      },
      ff: function () { openNow(); }
    });
    function count() {
      var el = H.$('[data-usd]', sec); if (!el || H.reduced) return;
      var s = performance.now();
      (function step(n) { var k = H.ease(H.clamp((n - s) / 1400, 0, 1)); el.textContent = 'US$' + Math.round(173 * k); if (k < 1) requestAnimationFrame(step); })(s);
    }
    var visible = false;
    H.onView(sec, function (v) { var was = visible; visible = v; if (v && !was) requestAnimationFrame(tick); if (v && !opened && !(H.pager && H.pager.isPaged())) openNow(); });
    size(); addEventListener('resize', size);
  }

  /* ================= CHINA ================= */
  var PROV = { Heilongjiang: [126.6, 45.8], Jilin: [125.3, 43.9], Liaoning: [123.4, 41.8], 'Inner Mongolia': [111.7, 40.8], Beijing: [116.4, 39.9], Hebei: [114.5, 38], Shanxi: [112.5, 37.9], Shandong: [117, 36.7], Henan: [113.7, 34.8], Anhui: [117.3, 31.9], Jiangsu: [118.8, 32.1], Shanghai: [121.5, 31.2], Zhejiang: [120.2, 30.3], Jiangxi: [115.9, 28.7], Hubei: [114.3, 30.6], Shaanxi: [108.9, 34.3], Gansu: [103.8, 36.1], Ningxia: [106.3, 38.5], Xinjiang: [87.6, 43.8], Guizhou: [106.7, 26.6], Yunnan: [102.7, 25], Guangxi: [108.3, 22.8], Fujian: [119.3, 26.1], Guangdong: [113.3, 23.1], Hainan: [110.3, 20], Hunan: [113, 28.2], Qinghai: [101.8, 36.6], Sichuan: [104.1, 30.7] };
  var SCN = ['Heilongjiang', 'Jilin', 'Liaoning', 'Inner Mongolia', 'Beijing', 'Hebei', 'Henan', 'Shandong', 'Shanxi', 'Anhui', 'Jiangsu', 'Shanghai', 'Zhejiang', 'Jiangxi', 'Hubei', 'Shaanxi', 'Gansu', 'Ningxia', 'Xinjiang', 'Guizhou', 'Yunnan', 'Guangxi'];
  var RKN = ['Anhui', 'Fujian', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei', 'Hunan', 'Jiangsu', 'Jiangxi', 'Inner Mongolia', 'Qinghai', 'Shaanxi', 'Shandong', 'Sichuan', 'Yunnan', 'Zhejiang', 'Xinjiang'];
  var SITES = ['Heilongjiang', 'Jilin', 'Shandong', 'Henan', 'Hebei', 'Anhui', 'Jiangsu', 'Hubei', 'Hunan', 'Guangdong', 'Guangxi', 'Yunnan', 'Sichuan', 'Xinjiang', 'Shaanxi', 'Inner Mongolia'];
  var TEXT = {
    env: { k: 'Environment', t: 'Plant-feeding nematode abundance in China', b: '<p>Same Herbivores field, unit (individuals per 100 g dry soil) and colour scale as the world map; China is not re-scaled.</p><p>Abundance shows potential exposure. It does not stand for crop loss or disease severity.</p><small>Colours read the sample layer until the team dataset is added.</small>' },
    agr: { k: 'Agriculture', t: 'Soybean cyst and southern root-knot nematodes', b: '<ul><li><b>Soybean cyst</b><span>Reported in 22 provinces. Typical yield loss 20–30%, 60–70% in badly infested fields; over US$120 million in soybean losses a year (estimate).</span></li><li><b>Root-knot</b><span>Records in 20 provinces (CABI) plus Xinjiang greenhouses (2021–23). Over 3,000 host plants, from tomato to tobacco.</span></li></ul><small>Markers show reported presence, not how severe damage is across a province.</small>' },
    pot: { k: 'Potential', t: 'Where an early signal could help next', b: '<p>Our soil programme and interviews look for places where a quick, early risk signal would matter most.</p><small>Bar height: sample abundance at candidate sampling regions, to be redrawn from the team’s field data.</small>' }
  };

  function china() {
    var sec = H.$('[data-china]'); if (!sec || !GEO.china) return;
    var G = GEO.china, maps = {};
    H.$$('[data-cmap]', sec).forEach(function (fig) {
      var kind = fig.getAttribute('data-cmap'), m = makeMap(kind, H.$('canvas', fig), false);
      maps[kind] = m;
      H.$('[data-cmap-open]', fig).addEventListener('click', function () { openFocus(kind); });
      H.once(fig, function () { m.intro(); }, .3);
      H.$$('[data-sp]', fig).forEach(function (b) {
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); m.filter[b.getAttribute('data-sp')] = b.getAttribute('aria-pressed') === 'true'; m.kick(); });
      });
    });
    addEventListener('resize', function () { Object.keys(maps).forEach(function (k) { maps[k].resize(); }); });
    // focus dialog
    var dlg = H.$('[data-cfocus]', sec), fcv = H.$('[data-cfocus-canvas]', sec), order = ['env', 'agr', 'pot'], cur = 0, fm = null, lastFocus;
    function openFocus(kind) {
      lastFocus = document.activeElement; cur = order.indexOf(kind);
      dlg.hidden = false; requestAnimationFrame(function () { dlg.classList.add('is-open'); fill(); });
      document.documentElement.style.overflow = 'hidden';
      H.$('[data-cfocus-close]', dlg).focus();
    }
    function fill() {
      var kind = order[cur], T = TEXT[kind];
      dlg.style.setProperty('--c', H.$('[data-cmap="' + kind + '"]', sec).style.getPropertyValue('--c'));
      H.$('[data-cf-kicker]', dlg).textContent = T.k; H.$('[data-cf-title]', dlg).textContent = T.t; H.$('[data-cf-body]', dlg).innerHTML = T.b;
      if (fm) fm.destroy(); fm = makeMap(kind, fcv, true); fm.intro();
    }
    function close() { dlg.classList.remove('is-open'); document.documentElement.style.overflow = ''; setTimeout(function () { dlg.hidden = true; if (fm) { fm.destroy(); fm = null; } }, 350); if (lastFocus) lastFocus.focus(); }
    H.$('[data-cfocus-close]', dlg).addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    H.$('[data-cf-prev]', dlg).addEventListener('click', function () { cur = (cur + 2) % 3; fill(); });
    H.$('[data-cf-next]', dlg).addEventListener('click', function () { cur = (cur + 1) % 3; fill(); });
    document.addEventListener('keydown', function (e) { if (!dlg.hidden && e.key === 'Escape') close(); });

    function inside(lon, lat) {
      var r = Math.floor((G.north - lat) / G.step), c = Math.floor((lon - G.west) / G.step), row = G.rows_mask[r];
      if (!row) return false;
      return row.split(',').some(function (run) { var a = run.split(':'); return c >= +a[0] && c < +a[0] + +a[1]; });
    }

    function makeMap(kind, cv, big) {
      var ctx, w, h, s, ox, oy, mouse = null, t0 = performance.now(), introT = -1, raf = 0, alive = true, yaw = 0, tilt = 0;
      var m = { filter: { scn: true, rkn: true } };
      var rng = H.rand(kind === 'pot' ? 3 : 9);
      // projection: main map lon 73..135.5, lat 17..54 (+ South China Sea inset)
      function size() {
        var r = cv.getBoundingClientRect(); w = r.width; h = r.height || r.width * .86; ctx = H.fit(cv, w, h, 2);
        s = Math.min(w / (62.5 * .84), h / 38.5) * .94; ox = (w - 62.5 * .84 * s) / 2; oy = (h - 38.5 * s) / 2 + 2;
      }
      function P(lon, lat) { return [ox + (lon - 73) * .84 * s, oy + (54 - lat) * s]; }
      var inset = { lon0: 106, lon1: 124, lat0: 3, lat1: 24 };
      function PI(lon, lat) { var bw = w * .17, bh = bw * 1.25, bx = w - bw - 6, by = h - bh - 6; return [bx + (lon - inset.lon0) / (inset.lon1 - inset.lon0) * bw, by + (inset.lat1 - lat) / (inset.lat1 - inset.lat0) * bh]; }
      function outline(c, proj, style) {
        G.outline.forEach(function (ring) {
          c.beginPath(); ring.forEach(function (p, i) { var q = proj(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); style(c);
        });
      }
      function insetBox(c) {
        var bw = w * .17, bh = bw * 1.25, bx = w - bw - 6, by = h - bh - 6;
        c.save(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.strokeRect(bx, by, bw, bh);
        c.beginPath(); c.rect(bx, by, bw, bh); c.clip();
        outline(c, PI, function (c) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .8; c.stroke(); });
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1;
        (G.maritime || []).forEach(function (l) { c.beginPath(); l.forEach(function (p, i) { var q = PI(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); });
        c.restore();
      }
      function clipMain(c) { c.beginPath(); c.rect(0, 0, w, P(0, 17.5)[1]); c.clip(); }

      /* ---- env: hex dot matrix ---- */
      var hexes = [];
      if (kind === 'env') {
        var st = big ? .62 : .8, rowH = st * .866;
        for (var lat = 53.8, ri = 0; lat > 17.6; lat -= rowH, ri++) for (var lon = 73.4 + (ri % 2) * st / 2; lon < 135.4; lon += st)
          if (inside(lon, lat)) hexes.push({ lon: lon, lat: lat, v: field(lon, lat), d: (lon - 73) / 62 + rng() * .25 });
      }
      /* ---- agr markers ---- */
      var marks = [];
      if (kind === 'agr') {
        SCN.forEach(function (n, i) { marks.push({ n: n, sp: 'scn', ll: PROV[n], d: i * .04, off: RKN.indexOf(n) >= 0 ? -1 : 0 }); });
        RKN.forEach(function (n, i) { marks.push({ n: n, sp: 'rkn', ll: PROV[n], d: .3 + i * .04, off: SCN.indexOf(n) >= 0 ? 1 : 0, note: n === 'Xinjiang' ? 'detected in greenhouse vegetables, 2021–23' : '' }); });
      }
      /* ---- pot mesh ---- */
      var mesh = [], bars = [];
      if (kind === 'pot') {
        var stp = big ? 1.25 : 1.6, grid = {};
        for (var la = 53.5, r2 = 0; la > 18; la -= stp, r2++) for (var lo = 73.5, c2 = 0; lo < 135; lo += stp, c2++) {
          var jl = lo + (rng() - .5) * stp * .7, ja = la + (rng() - .5) * stp * .7;
          if (inside(jl, ja)) grid[r2 + ',' + c2] = [jl, ja];
        }
        Object.keys(grid).forEach(function (key) {
          var rc = key.split(','), r = +rc[0], c = +rc[1], a = grid[key];
          [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(function (d) { var b = grid[(r + d[0]) + ',' + (c + d[1])]; if (b && !(d[0] === 1 && d[1] === -1 && grid[(r + 1) + ',' + c])) mesh.push([a, b]); });
        });
        SITES.forEach(function (n, i) { var ll = PROV[n]; bars.push({ n: n, ll: ll, v: field(ll[0], ll[1]), d: i * .06, col: ['#ffa24a', '#ff6f8a', '#b88bff', '#6fb6ff', '#ffd34d'][i % 5] }); });
      }
      function P3(lon, lat, z) {
        var q = P(lon, lat), cx = w / 2, cy = h / 2, dx = q[0] - cx, dy = q[1] - cy;
        var ca = Math.cos(yaw), sa = Math.sin(yaw), rx = dx * ca - dy * sa, ry = dx * sa + dy * ca;
        var ct = .62 + tilt * .08;
        return [cx + rx * .96, cy + 18 + ry * ct - (z || 0)];
      }

      function draw() {
        raf = 0; if (!alive) return;
        var t = (performance.now() - t0) / 1000, it = introT < 0 ? 0 : H.clamp((performance.now() - introT) / 1600, 0, 1);
        ctx.clearRect(0, 0, w, h);
        if (kind === 'env') {
          ctx.save(); clipMain(ctx);
          hexes.forEach(function (d) {
            var q = P(d.lon, d.lat), k = H.clamp((it * 1.5 - d.d) * 3, 0, 1); if (k <= 0) return;
            var near = 0; if (mouse) { var dd = Math.hypot(q[0] - mouse[0], q[1] - mouse[1]); near = Math.max(0, 1 - dd / (big ? 90 : 60)); }
            var r = (big ? 2.6 : 2.3) * s / 8 * (1 + near * 1.2) * k;
            ctx.fillStyle = ramp(Math.min(1, d.v * 1.25), .82 + near * .18);
            if (near > .5) { ctx.shadowColor = ramp(d.v, 1); ctx.shadowBlur = 8; } else ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 6.29); ctx.fill();
          });
          ctx.restore(); ctx.shadowBlur = 0; insetBox(ctx);
        }
        if (kind === 'agr') {
          ctx.save(); clipMain(ctx);
          outline(ctx, P, function (c) { c.fillStyle = 'rgba(255,255,255,.035)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4; c.shadowColor = 'rgba(255,255,255,.5)'; c.shadowBlur = 6; c.stroke(); c.shadowBlur = 0; });
          // key soybean regions
          [[126, 45, 5.5, 3.6], [116, 35.5, 4.2, 3.2]].forEach(function (e, i) {
            var q = P(e[0], e[1]); ctx.save(); ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 8; ctx.strokeStyle = 'rgba(255,211,77,' + (.35 + .5 * it) + ')'; ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.ellipse(q[0], q[1], e[2] * s * .84, e[3] * s, -.3, 0, 6.29); ctx.stroke(); ctx.restore();
          });
          // hatch texture (collage feel)
          ctx.save(); var cp = new Path2D(); G.outline.forEach(function (ring) { ring.forEach(function (p, i) { var q = P(p[0], p[1]); i ? cp.lineTo(q[0], q[1]) : cp.moveTo(q[0], q[1]); }); cp.closePath(); });
          ctx.clip(cp); ctx.globalAlpha = .1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
          for (var hx = -h; hx < w; hx += 8) { ctx.beginPath(); ctx.moveTo(hx, P(0, 45)[1]); ctx.lineTo(hx + 50, P(0, 37)[1]); ctx.stroke(); }
          ctx.globalAlpha = .08; for (var hy = P(0, 30)[1]; hy < P(0, 22)[1]; hy += 6) { ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(w, hy); ctx.stroke(); }
          ctx.restore();
          var hot = null;
          marks.forEach(function (mk) {
            if (!m.filter[mk.sp]) return;
            var k = H.ease(H.clamp((it * 1.6 - mk.d) * 2.5, 0, 1)); if (k <= 0) return;
            var q = P(mk.ll[0], mk.ll[1]); q[0] += mk.off * s * .55;
            var near = mouse && Math.hypot(q[0] - mouse[0], q[1] - mouse[1]) < 12; if (near) hot = mk;
            var sz = (big ? 8 : 5.6) * k * (near ? 1.6 : 1) * (1 + Math.sin(t * 2 + mk.d * 10) * .06);
            ctx.save(); ctx.translate(q[0], q[1]);
            if (mk.sp === 'scn') { ctx.fillStyle = '#ffa24a'; ctx.shadowColor = '#ffa24a'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * .9, sz * .7); ctx.lineTo(-sz * .9, sz * .7); ctx.closePath(); ctx.fill(); }
            else { ctx.fillStyle = '#53d8f2'; ctx.shadowColor = '#53d8f2'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(0, 0, sz * .75, 0, 6.29); ctx.fill(); ctx.fillStyle = '#0f2a33'; ctx.beginPath(); ctx.arc(0, 0, sz * .28, 0, 6.29); ctx.fill(); }
            ctx.restore();
          });
          ctx.restore(); insetBox(ctx);
          m.hot = hot;
        }
        if (kind === 'pot') {
          if (mouse) { yaw += ((mouse[0] / w - .5) * .5 - yaw) * .08; tilt += ((mouse[1] / h - .5) * 2 - tilt) * .08; } else { yaw += (Math.sin(t * .3) * .08 - yaw) * .03; tilt += (0 - tilt) * .05; }
          ctx.strokeStyle = 'rgba(235,235,255,' + (.25 + .45 * it) + ')'; ctx.lineWidth = .8;
          ctx.beginPath();
          mesh.forEach(function (e, i) { if (i / mesh.length > it * 1.3) return; var a = P3(e[0][0], e[0][1]), b = P3(e[1][0], e[1][1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); });
          ctx.stroke();
          ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.2;
          G.outline.forEach(function (ring) { if (ring.length < 20) return; ctx.beginPath(); ring.forEach(function (p, i) { if (p[1] < 17.5) return; var q = P3(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.stroke(); });
          ctx.restore();
          var hot2 = null;
          bars.slice().sort(function (a, b) { return a.ll[1] - b.ll[1]; }).forEach(function (b) {
            var k = H.ease(H.clamp((it * 1.8 - b.d) * 2, 0, 1)), base = P3(b.ll[0], b.ll[1]), hh = (18 + b.v * (big ? 170 : 110)) * k;
            var near = mouse && Math.abs(mouse[0] - base[0]) < 9 && mouse[1] < base[1] + 6 && mouse[1] > base[1] - hh - 10; if (near) hot2 = b;
            var g = ctx.createLinearGradient(0, base[1], 0, base[1] - hh); g.addColorStop(0, b.col + '22'); g.addColorStop(1, b.col);
            ctx.fillStyle = g; ctx.fillRect(base[0] - (near ? 4 : 2.6), base[1] - hh, near ? 8 : 5.2, hh);
            ctx.fillStyle = b.col; ctx.shadowColor = b.col; ctx.shadowBlur = near ? 20 : 12; ctx.beginPath(); ctx.arc(base[0], base[1] - hh, near ? 5 : 3.4, 0, 6.29); ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(base[0], base[1], 5, 2, 0, 0, 6.29); ctx.fill();
          });
          m.hot = hot2;
        }
        if (it < 1 || mouse || kind === 'pot' || kind === 'agr') m.kick();
      }
      m.kick = function () { if (!raf && alive && m.visible !== false) raf = requestAnimationFrame(draw); };
      m.intro = function () { introT = performance.now(); m.kick(); };
      m.resize = function () { size(); m.kick(); };
      m.destroy = function () { alive = false; cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerleave', leave); cv.removeEventListener('pointerdown', move); };
      function move(e) {
        var r = cv.getBoundingClientRect(); mouse = [e.clientX - r.left, e.clientY - r.top]; m.kick();
        setTimeout(function () {
          var html = '';
          if (kind === 'env' && mouse) {
            var lon = (mouse[0] - ox) / (.84 * s) + 73, lat = 54 - (mouse[1] - oy) / s;
            if (inside(lon, lat)) html = '<b>' + lon.toFixed(1) + '°E, ' + lat.toFixed(1) + '°N</b>Sample level ' + Math.round(field(lon, lat) * 100) + ' / 100';
          }
          if (kind === 'agr' && m.hot) html = '<b>' + m.hot.n + '</b>' + (m.hot.sp === 'scn' ? 'Soybean cyst nematode reported' : 'Southern root-knot nematode ' + (m.hot.note || 'recorded'));
          if (kind === 'pot' && m.hot) html = '<b>' + m.hot.n + '</b>Candidate sampling region · sample level ' + Math.round(m.hot.v * 100);
          H.tip(html, e.clientX, e.clientY);
        }, 20);
      }
      function leave() { mouse = null; H.tip(null); m.kick(); }
      cv.addEventListener('pointermove', move); cv.addEventListener('pointerdown', move); cv.addEventListener('pointerleave', leave);
      H.onView(cv, function (v) { m.visible = v; if (v) m.kick(); });
      size();
      return m;
    }
  }
  H.ready(function () { world(); china(); });
})();
