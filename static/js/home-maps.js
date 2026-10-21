/* NKU homepage v6 — 03 world map + 06 human-practices maps.
 * World: V3 layout and watercolour colour patches, now drawn from the real
 * Herbivores layer (js/home-abundance.js, 1,901 pixels, log10(x + 1)).
 * Cards open only from the case points and close when the pointer leaves
 * them. China is highlighted the 3D v3 way and dives into the next page.
 * HP: the three China maps (survey, teaching, soil programme) from the
 * team's records (js/home-hp-data.js); see tools/build_hp_maps.py. */
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
    var openCase = null, closeT = 0, openT = 0, overCard = false, overMark = null, hoverLockT = 0, hoverLocked = false, turnT = 0, turnEndT = 0;
    var fKick = H.$('[data-flip-kicker]', card), fTitle = H.$('[data-flip-title]', card), fFront = H.$('[data-flip-front]', card);
    var fLoss = H.$('[data-flip-loss]', card), fSrc = H.$('[data-flip-src]', card);
    var fPhoto = H.$('[data-flip-photo]', card), fCredit = H.$('[data-flip-credit]', card);
    var flipToggle = H.$('[data-flip-toggle]', card), flipLabel = H.$('[data-flip-label]', card);
    function syncFlipControl() {
      var back = card.classList.contains('is-flipped');
      flipLabel.textContent = back ? 'Back to the case' : 'Picture and image details';
      flipToggle.title = back ? 'Back to the case' : 'Show picture and image details';
      flipToggle.setAttribute('aria-label', flipToggle.title);
      flipToggle.setAttribute('aria-expanded', String(back));
    }
    (REG.cases || []).forEach(function (c, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'wmark';
      b.style.left = ((c.lon + 180) * 2.5 / 9) + '%'; b.style.top = ((84 - c.lat) * 2.5 / 3.5) + '%'; b.style.setProperty('--d', (i * .35) + 's');
      b.setAttribute('aria-label', c.region + ': ' + c.nematode + ' on ' + c.crop);
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; overMark = c; if (hoverLocked) return; clearTimeout(closeT); clearTimeout(openT); openT = setTimeout(function () { if (!hoverLocked) open(c, b); }, 110); });
      b.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; if (overMark === c) overMark = null; clearTimeout(openT); scheduleClose(); });
      var pointerActivation = false;
      b.addEventListener('pointerdown', function () { pointerActivation = true; });
      b.addEventListener('click', function (e) { pointerActivation = false; e.stopPropagation(); if (openCase === c && !card.hidden) { if (e.pointerType === 'touch' || !e.pointerType) closeCard(); } else open(c, b); });
      b.addEventListener('focus', function () { if (!pointerActivation && openCase !== c) open(c, b); });
      b.addEventListener('blur', function () { setTimeout(function () { if (!card.contains(document.activeElement)) scheduleClose(0); }, 10); });
      c.btn = b;
      marks.appendChild(b);
    });
    /* 2026-10-21 (review HOME-04): one-time cue beside a case dot. The legend
       on the left was too far from the dots; this sits on the map itself and
       goes away for the visit as soon as any dot is hovered, focused or
       clicked. */
    var coach = null, coachDone = false;
    try { coachDone = sessionStorage.getItem('nku-world-coach') === '1'; } catch (e) {}
    function coachOff() {
      if (coachDone) return; coachDone = true;
      try { sessionStorage.setItem('nku-world-coach', '1'); } catch (e) {}
      if (coach) coach.classList.remove('is-on');
      sec.classList.add('is-coached');
    }
    function coachOn() {
      if (coachDone || !(REG.cases || []).length) return;
      if (!coach) {
        var best = null;
        REG.cases.forEach(function (c) { var x = (c.lon + 180) * 2.5 / 9; if (!best || Math.abs(x - 26) < Math.abs((best.lon + 180) * 2.5 / 9 - 26)) best = c; });
        coach = document.createElement('p'); coach.className = 'world__coach'; coach.setAttribute('aria-hidden', 'true');
        coach.textContent = matchMedia('(pointer: coarse)').matches ? 'Tap a dot to open a case' : 'Click a dot to open a case';
        coach.style.left = ((best.lon + 180) * 2.5 / 9) + '%'; coach.style.top = ((84 - best.lat) * 2.5 / 3.5) + '%';
        marks.appendChild(coach);
        if (best.btn) best.btn.classList.add('is-coach');
      }
      setTimeout(function () { if (!coachDone && coach) coach.classList.add('is-on'); }, 1300);
    }
    H.$$('.wmark', marks).forEach(function (b) { ['pointerenter', 'focus', 'click'].forEach(function (ev) { b.addEventListener(ev, coachOff); }); });
    function scheduleClose(ms) { clearTimeout(closeT); if (hoverLocked) return; closeT = setTimeout(function () { if (!hoverLocked && !overCard && !overMark) closeCard(); }, ms == null ? 320 : ms); }
    function protectFlip(resumeHover) {
      clearTimeout(openT); clearTimeout(closeT); clearTimeout(hoverLockT);
      hoverLocked = true;
      hoverLockT = setTimeout(function () {
        hoverLocked = false;
        if (card.hidden || !openCase || !resumeHover) return;
        if (overMark && overMark !== openCase) open(overMark, overMark.btn);
        else if (!overCard && !overMark) closeCard();
      }, 2000);
    }
    card.addEventListener('pointerenter', function () { overCard = true; clearTimeout(closeT); });
    card.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; overCard = false; scheduleClose(160); });
    card.addEventListener('focusout', function (e) { if (card.classList.contains('is-turning')) return; if (!card.contains(e.relatedTarget) && !(openCase && e.relatedTarget === openCase.btn)) scheduleClose(0); });
    function placeCard() {
      if (!openCase || card.hidden) return;
      var pr = pin.getBoundingClientRect(), br = openCase.btn.getBoundingClientRect();
      var x = br.left + br.width / 2 - pr.left, y = br.top + br.height / 2 - pr.top;
      var minTop = Math.max(80, 80 - pr.top), bottom = Math.min(pr.height, innerHeight - pr.top) - 16;
      card.style.setProperty('--case-card-max-height', Math.max(120, bottom - minTop) + 'px');
      var cw = card.offsetWidth, ch = card.offsetHeight;
      var left = H.clamp(x + 22 + cw > pr.width - 12 ? x - cw - 22 : x + 22, 12, Math.max(12, pr.width - cw - 12));
      card.style.left = left + 'px';
      card.style.top = H.clamp(y - 70, minTop, Math.max(minTop, bottom - ch)) + 'px';
      card.style.setProperty('--ox', left < x ? '100%' : '0');
    }
    // Refit after fonts, image decoding or a turn changes the visible face's height.
    new ResizeObserver(placeCard).observe(H.$('.flipcard__inner', card));
    function open(c, b) {
      clearTimeout(hoverLockT); clearTimeout(turnT); clearTimeout(turnEndT); hoverLocked = false; card.classList.remove('is-turning');
      clearTimeout(closeT);
      if (openCase && openCase.btn) openCase.btn.setAttribute('aria-expanded', 'false');
      openCase = c; b.setAttribute('aria-expanded', 'true');
      var cont = (REG.continents || {})[c.continent] || {};
      var near = nearest(c.lon, c.lat, 6);
      fKick.textContent = cont.name || '';
      fTitle.textContent = c.region;
      var ph = (REG.photos || {})[c.id];
      var view = ph && ph.view || {};
      fPhoto.style.setProperty('--case-photo-ratio', view.ratio || '4 / 3');
      fPhoto.style.setProperty('--case-photo-position', view.position || '50% 50%');
      H.$('[data-flip-photo-region]', card).textContent = c.region;
      H.$('[data-flip-photo-species]', card).textContent = ph ? ph.species : '';
      var description = ph ? esc(ph.description).split(esc(ph.species)).join('<i>' + esc(ph.species) + '</i>') : '';
      fPhoto.innerHTML = ph ? '<a class="flipcard__image-link" href="' + esc(ph.src) + '" target="_blank" rel="noopener" aria-label="View full image of ' + esc(ph.species) + '"><img src="' + esc(ph.src) + '" width="' + ph.w + '" height="' + ph.h + '" alt="' + esc(ph.alt) + '" loading="lazy" decoding="async"></a><a class="flipcard__full" href="' + esc(ph.src) + '" target="_blank" rel="noopener">View full image ↗</a><figcaption><p class="flipcard__caption">' + description + '</p><p class="flipcard__image-note"><b>Image note:</b> ' + esc(ph.imageNote) + '</p></figcaption>' : '';
      fPhoto.hidden = !ph;
      fFront.innerHTML = '<dt>Nematode</dt><dd>' + esc(c.nematode) + '<i>' + esc(c.species) + '</i></dd><dt>Reported crop</dt><dd>' + esc(c.crop) + '</dd>' +
        (near ? '<dt>Nearest sample</dt><dd><div class="flipcard__bar"><i style="width:' + Math.round(12 + near.l / LMAX * 88) + '%;background:' + ramp(near.l / LMAX) + '"></i></div><small>' + Math.round(near.value).toLocaleString('en') + ' plant-feeding nematodes per 100 g dry soil</small></dd>' : '');
      fLoss.textContent = c.loss;
      fSrc.innerHTML = c.source ? '<a href="' + esc(c.source.url) + '" target="_blank" rel="noopener" title="' + esc(c.source.title) + '">' + esc(c.source.label || 'Source (' + c.source.year + ')') + ' ↗</a>' : '';
      fCredit.innerHTML = ph ? '<summary>Image credit and source</summary><p>' + esc(ph.credit) + '</p><p><a href="' + esc(ph.source) + '" target="_blank" rel="noopener">Original source</a> · <a href="' + esc(ph.license) + '" target="_blank" rel="noopener">License</a></p>' : '';
      fCredit.open = false;
      fCredit.hidden = !ph;
      card.classList.remove('is-flipped');
      syncFlipControl();
      card.setAttribute('aria-labelledby', 'flip-title');
      card.hidden = false;
      placeCard();
      card.hidden = false; card.classList.remove('is-open'); void card.offsetWidth; card.classList.add('is-open');
      hover = c.continent; draw();
    }
    function closeCard() {
      clearTimeout(openT); clearTimeout(closeT); clearTimeout(hoverLockT); clearTimeout(turnT); clearTimeout(turnEndT);
      hoverLocked = false; card.classList.remove('is-turning');
      if (card.hidden) return;
      card.classList.remove('is-open');
      if (openCase && openCase.btn) openCase.btn.setAttribute('aria-expanded', 'false');
      openCase = null; hover = null; draw();
      setTimeout(function () { if (!card.classList.contains('is-open')) card.hidden = true; }, 380);
    }
    H.$$('[data-flip-turn]', card).forEach(function (bt) {
      bt.addEventListener('click', function (e) {
        if (card.classList.contains('is-turning')) return;
        protectFlip(e.pointerType === 'mouse' || e.pointerType === 'pen' || e.detail > 0 && e.pointerType !== 'touch');
        card.classList.add('is-turning');
        turnT = setTimeout(function () {
          card.classList.toggle('is-flipped');
          syncFlipControl();
          card.setAttribute('aria-labelledby', card.classList.contains('is-flipped') ? 'flip-photo-title' : 'flip-title');
          placeCard();
          flipToggle.focus({ preventScroll: true });
        }, 220);
        turnEndT = setTimeout(function () { card.classList.remove('is-turning'); }, 480);
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
    function closeNow() { closeCard(); opened = false; counted = false; sec.classList.remove('is-open'); cancelAnimationFrame(bloomRaf); bloom = 0; draw(); }
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
      enter: function () { dive(false); if (!opened) openNow(); coachOn(); return 300; },
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
    H.onView(sec, function (v) { visible = v; if (v && !opened && !(H.pager && H.pager.isPaged())) openNow(); if (v) coachOn(); });
    size();
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { size(); placeCard(); }, 120); });
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(size, 120); }).observe(cv);
  }

  /* ================= HUMAN PRACTICES: three China maps =================
   * v8.5: real records (js/home-hp-data.js, built by tools/build_hp_maps.py).
   * Survey   = province choropleth, 5 classes, boundaries from the Standard
   *            Map of China GS(2022)4303; outline + South China Sea GS(2022)4308.
   * Teaching = 8 sites, circle AREA proportional to students signed up.
   * Soil     = logged source areas, bar HEIGHT mapped to log2(samples + 1).
   * Projection is unchanged (the ascaroside story hands its outline over). */
  var HP = window.NKU_HP;
  var CLS = ['#6b2a8f', '#b03a86', '#e65a62', '#fb9b5f', '#fde6a3'];   // magma-like, dark -> light = few -> many
  var NODATA = 'rgba(255,255,255,.07)';
  function fmtN(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function pip(x, y, f) {   // point in polygon, flat [x0,y0,x1,y1,...]
    var c = false, n = f.length / 2;
    for (var i = 0, j = n - 1; i < n; j = i++) {
      var xi = f[i * 2], yi = f[i * 2 + 1], xj = f[j * 2], yj = f[j * 2 + 1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  function hp() {
    var sec = H.$('[data-hp]'); if (!sec || !GEO.china || !HP) return;
    var G = GEO.china, KINDS = ['survey', 'teach', 'soil'], COL = ['#c48cff', '#ffa24a', '#9aa7ff'];
    var fig = H.$('[data-hp-map]', sec);
    var cvs = KINDS.map(function (k) { return H.$('canvas[data-layer="' + k + '"]', sec); });
    var tabs = H.$$('[data-hp-tab]', sec);
    var SV = HP.survey, TS = HP.teach.sites, SS = HP.soil.sites;
    var SMAX = Math.max.apply(null, SS.map(function (s) { return s.n; }));
    function soilHeightFraction(n) { return Math.log1p(n) / Math.log1p(SMAX); }
    var BY = {}; SV.byProvince.forEach(function (p) { BY[p.en] = p; });
    var BR = SV.breaks;
    function cls(n) { if (!n) return -1; for (var i = 0; i < BR.length; i++) if (n >= BR[i][0] && (BR[i][1] == null || n <= BR[i][1])) return i; return BR.length - 1; }
    function rng(b) { return b[1] == null ? '\u2265 ' + b[0] : b[0] === b[1] ? String(b[0]) : b[0] + '\u2013' + b[1]; }
    var nSites = function (a) { return a.reduce(function (s, x) { return s + x.n; }, 0); };
    var soilProv = {}; SS.forEach(function (s) { soilProv[s.province] = 1; });
    var tibet = SS.filter(function (s) { return s.id === 'lab-tibet'; })[0];
    var soilViews = H.$('[data-soil-views]', sec), soilChart = H.$('[data-soil-chart]', sec);
    var soilButtons = H.$$('[data-soil-view]', sec), soilView = 'tibet';
    var soilRows = H.$('[data-soil-rows]', sec);
    if (soilRows && tibet && tibet.entries) soilRows.innerHTML = tibet.entries.slice().sort(function (a, b) { return b.n - a.n; }).map(function (s) {
      return '<li title="' + s.place + ' · ' + s.soil + '"><span class="hp2__soil-label">' + s.short + '<small>' + s.soil + '</small></span><span class="hp2__soil-track"><i style="width:' + (s.n / 40 * 100) + '%"></i></span><b>' + s.n + '</b></li>';
    }).join('');
    function updateSoilView() {
      var active = sec.getAttribute('data-hp-active') === 'soil';
      if (soilViews) soilViews.hidden = !active;
      if (soilChart) soilChart.hidden = !active || soilView !== 'tibet';
      fig.classList.toggle('is-soil-chart', active && soilView === 'tibet');
      var legend = H.$('[data-hp-legend="2"]', sec);
      if (active && legend) legend.innerHTML = soilView === 'tibet' ? '<span class="hp2__lgt">Tibet breakdown: linear sample counts</span><span>18 source entries · 4–38 samples per entry</span>' : LEG[2];
      soilButtons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-soil-view') === soilView ? 'true' : 'false'); });
    }
    soilButtons.forEach(function (b) { b.addEventListener('click', function () { soilView = b.getAttribute('data-soil-view'); updateSoilView(); H.tip(null); }); });

    /* ---------- the copy column: figures, legends, sources ---------- */
    var STAT = [
      fmtN(SV.responses) + ' responses \u00b7 ' + SV.byProvince.length + ' provinces',
      TS.length + ' sites \u00b7 \u2248' + HP.teach.total + ' students',
      nSites(SS) + ' soil samples collected \u00b7 ' + Object.keys(soilProv).length + ' provinces'
    ];
    STAT.forEach(function (t, i) { var el = H.$('[data-hp-stat="' + i + '"]', sec); if (el) el.textContent = t; });
    var counts = BR.map(function () { return 0; }); SV.byProvince.forEach(function (p) { counts[cls(p.n)]++; });
    var LEG = [
      '<span class="hp2__lgt">Responses per province</span><span class="hp2__chips">' +
        BR.map(function (b, i) { return '<span class="hp2__chip" title="' + counts[i] + (counts[i] > 1 ? ' provinces' : ' province') + '"><i style="background:' + CLS[i] + '"></i>' + rng(b) + '</span>'; }).join('') +
        '<span class="hp2__chip"><i class="is-none"></i>none</span></span>',
      '<span class="hp2__lgt">Circle area = students signed up</span><span class="hp2__sizes">' +
        [10, 50, 130].map(function (n) { var d = Math.round(26 * Math.sqrt(n / 130)); return '<span><i style="width:' + d + 'px;height:' + d + 'px"></i>' + n + '</span>'; }).join('') + '</span>',
      '<span class="hp2__lgt">Bar height: log<sub>2</sub>(samples + 1)</span><span class="hp2__bars">' +
        [1, 3, 5, 25, SMAX].map(function (n) { return '<span><i style="height:' + (26 * soilHeightFraction(n)).toFixed(1) + 'px"></i>' + n + '</span>'; }).join('') + '</span>'
    ];
    LEG.forEach(function (h, i) { var el = H.$('[data-hp-legend="' + i + '"]', sec); if (el) el.innerHTML = h; });
    var NOTE = [
      'Questionnaire, ' + SV.first + ' to ' + SV.last + ' (n = ' + SV.responses + '), self-reported province',
      'Team sign-up sheet; markers at county or district seats',
      'Soil collection records; Tibet details updated 21 Oct 2026. Compare 18 recorded sources in the Tibet breakdown. Map markers indicate approximate source areas.'
    ];
    var noteEl = H.$('[data-hp-note]', sec);
    /* the same records as text, for screen readers */
    var sr = H.$('[data-hp-sr]', sec);
    if (sr) sr.innerHTML =
      '<h3>Survey responses by province</h3><ul>' + SV.byProvince.map(function (p) { return '<li>' + p.en + ': ' + p.n + '</li>'; }).join('') + '</ul>' +
      '<h3>Teaching sites</h3><ul>' + TS.map(function (s) { return '<li>' + s.place + ': ' + (s.approx ? 'about ' : '') + s.n + ' students</li>'; }).join('') + '</ul>' +
      '<h3>Soil samples</h3><ul>' + SS.map(function (s) { return '<li>' + s.place + ': ' + s.n + (s.n > 1 ? ' samples' : ' sample') + '</li>'; }).join('') + '</ul>';

    /* ---------- one view shared by all three layers (unchanged since v7.6) ---------- */
    var base = document.createElement('canvas');
    base.setAttribute('data-layer', 'base'); base.setAttribute('aria-hidden', 'true');
    fig.insertBefore(base, fig.firstChild);
    var LON0 = 104.25, LAT0 = 35.75;
    var V = { w: 1, h: 1, s: 1, cx: 0, cy: 0, hmax: 100 };
    function P3(lon, lat) { return [V.cx + (lon - LON0) * 0.84 * V.s * 0.96, V.cy + (LAT0 - lat) * V.s]; }
    function unP3(x, y) { return [(x - V.cx) / (0.96 * 0.84 * V.s) + LON0, LAT0 - (y - V.cy) / V.s]; }
    /* the South China Sea inset lies on the same plane, south-east of the mainland */
    var IN = { lon0: 106, lon1: 124, lat0: 3, lat1: 24, k: 0.52, clon: 130.6, clat: 23.2 };
    var IMX = (IN.lon0 + IN.lon1) / 2, IMY = (IN.lat0 + IN.lat1) / 2;
    function PI3(lon, lat) { return P3(IN.clon + (lon - IMX) * IN.k, IN.clat + (lat - IMY) * IN.k); }
    function unPI3(x, y) { var l = unP3(x, y); return [IMX + (l[0] - IN.clon) / IN.k, IMY + (l[1] - IN.clat) / IN.k]; }
    function inInset(x, y) { var a = PI3(IN.lon0, IN.lat1), d = PI3(IN.lon1, IN.lat0); return x >= a[0] && x <= d[0] && y >= a[1] && y <= d[1]; }
    function insetClip(c) { var a = PI3(IN.lon0, IN.lat1), d = PI3(IN.lon1, IN.lat0); c.beginPath(); c.rect(a[0], a[1], d[0] - a[0], d[1] - a[1]); c.clip(); }
    function sizeView() {
      var r = fig.getBoundingClientRect(); V.w = Math.max(1, r.width); V.h = Math.max(1, r.height || r.width * 0.86);
      V.hmax = V.h * 0.12;
      V.s = Math.min(V.w * 0.9 / (62.5 * 0.84 * 0.96), (V.h - V.hmax - 24) / 36.5);
      V.cx = V.w / 2; V.cy = V.hmax + (V.h - V.hmax) / 2;
    }
    function ringPath(c, ring, proj) { c.beginPath(); ring.forEach(function (p, i) { var q = proj(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); }
    function flatPath(c, f, proj) { for (var i = 0; i < f.length; i += 2) { var q = proj(f[i], f[i + 1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.closePath(); }
    function outlineStroke(c, proj, a, w) {
      c.strokeStyle = 'rgba(255,255,255,' + a + ')'; c.lineWidth = w;
      G.outline.forEach(function (ring) { ringPath(c, ring, proj); c.stroke(); });
    }
    var bctx = null;
    function drawBase() {
      var c = bctx; c.clearRect(0, 0, V.w, V.h);
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
    function label(c, t, x, y, al, size, col) {
      c.font = '600 ' + (size || 12) + 'px Spline Sans, system-ui, sans-serif'; c.textAlign = al || 'left'; c.textBaseline = 'middle';
      c.lineWidth = 3.2; c.strokeStyle = 'rgba(23,12,31,.92)'; c.lineJoin = 'round'; c.strokeText(t, x, y);
      c.fillStyle = col || '#fff'; c.fillText(t, x, y);
    }

    /* ---------- survey: the provinces of the standard map ---------- */
    var PROVS = HP.provinces.map(function (p, i) {
      var d = BY[p.en], minLon = 999;
      p.r.forEach(function (f) { for (var k = 0; k < f.length; k += 2) minLon = Math.min(minLon, f[k]); });
      return { en: p.en, zh: p.zh, r: p.r, n: d ? d.n : 0, c: d ? cls(d.n) : -1, d: d, delay: (minLon - 73) / 62 };
    });
    /* value labels for every province with 10 or more responses; the two small
       municipalities get a leader line out to open water / open land */
    var LAB = [
      { en: 'Shandong', at: [118.3, 36.25] }, { en: 'Hebei', at: [115.1, 38.45] }, { en: 'Guangdong', at: [113.6, 23.55] },
      { en: 'Tianjin', from: [117.35, 39.12], at: [120.6, 39.25] }, { en: 'Beijing', from: [116.35, 40.25], at: [113.6, 41.75] }
    ];
    function provAt(x, y) {
      var ll = inInset(x, y) ? unPI3(x, y) : unP3(x, y);
      for (var i = PROVS.length - 1; i >= 0; i--) {   // topmost first (sheet drawing order)
        var p = PROVS[i]; for (var k = 0; k < p.r.length; k++) if (pip(ll[0], ll[1], p.r[k])) return p;
      }
      return null;
    }
    function drawProvinces(c, proj, it, hotP, small) {
      PROVS.forEach(function (p) {
        var k = H.clamp((it * 1.6 - p.delay * 0.8) * 2.4, 0, 1); if (k <= 0) return;
        c.globalAlpha = k;
        c.fillStyle = p.c < 0 ? NODATA : CLS[p.c];
        p.r.forEach(function (f) { c.beginPath(); flatPath(c, f, proj); c.fill(); });
      });
      c.globalAlpha = 1;
      /* province boundaries: a dark hairline between coloured provinces */
      c.strokeStyle = 'rgba(23,12,31,.85)'; c.lineWidth = small ? 0.5 : 0.8; c.lineJoin = 'round';
      PROVS.forEach(function (p) { p.r.forEach(function (f) { c.beginPath(); flatPath(c, f, proj); c.stroke(); }); });
      c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 0.5;
      PROVS.forEach(function (p) { if (p.c < 0) p.r.forEach(function (f) { c.beginPath(); flatPath(c, f, proj); c.stroke(); }); });
      if (hotP) { c.strokeStyle = '#fff'; c.lineWidth = small ? 1.2 : 2; hotP.r.forEach(function (f) { c.beginPath(); flatPath(c, f, proj); c.stroke(); }); }
    }

    /* ---------- teaching: sites, dodged so near neighbours stay readable ---------- */
    var TMAX = Math.max.apply(null, TS.map(function (s) { return s.n; }));
    function teachLayout() {
      var R = H.clamp(V.s * 1.3, 7, 30);
      var pts = TS.map(function (s) { var q = P3(s.ll[0], s.ll[1]); return { s: s, tx: q[0], ty: q[1], x: q[0], y: q[1], r: R * Math.sqrt(s.n / TMAX) }; });
      for (var it = 0; it < 60; it++) {
        for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) {
          var a = pts[i], b = pts[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, need = (a.r + b.r) * 0.8 + 3;
          if (d < need) { var m = (need - d) / 2, ux = dx / d, uy = dy / d; if (d < 0.02) { ux = 1; uy = 0; } a.x -= ux * m; a.y -= uy * m; b.x += ux * m; b.y += uy * m; }
        }
        pts.forEach(function (p) { p.x += (p.tx - p.x) * 0.04; p.y += (p.ty - p.y) * 0.04; });
      }
      return pts;
    }
    /* labels: try right, left, above, below and the diagonals; take the first
       spot that hits no marker and no label already placed */
    function placeLabels(c, items, obst, col) {
      c.font = '600 12px Spline Sans, system-ui, sans-serif';
      var boxes = [], H2 = 14;
      items.slice().sort(function (a, b) { return b.r - a.r; }).forEach(function (L) {
        var w = c.measureText(L.t).width + 4, g = L.r + 4, best = null;
        var cand = [];
        [g, g + 16].forEach(function (d) { cand.push([d, -H2 / 2], [-d - w, -H2 / 2], [-w / 2, -d - H2], [-w / 2, d], [d * .7, -d * .7 - H2], [d * .7, d * .7], [-d * .7 - w, -d * .7 - H2], [-d * .7 - w, d * .7]); });
        for (var k = 0; k < cand.length && !best; k++) {
          var bx = { x: L.x + cand[k][0], y: L.y + cand[k][1], w: w, h: H2 }, ok = bx.x > 2 && bx.x + w < V.w - 2;
          boxes.forEach(function (b) { if (bx.x < b.x + b.w && bx.x + bx.w > b.x && bx.y < b.y + b.h && bx.y + bx.h > b.y) ok = false; });
          (obst || []).forEach(function (o) {
            if (o.rw) { if (bx.x < o.rx + o.rw + 1 && bx.x + w > o.rx - 1 && bx.y < o.ry + o.rh && bx.y + H2 > o.ry) ok = false; return; }
            var cx = H.clamp(o.x, bx.x, bx.x + w), cy = H.clamp(o.y, bx.y, bx.y + H2); if (Math.hypot(cx - o.x, cy - o.y) < (o.r || 3) + 1) ok = false;
          });
          if (ok) { best = bx; best.far = k >= 8; }
        }
        best = best || { x: L.x + g, y: L.y - H2 / 2, w: w, h: H2 };
        boxes.push(best);
        if (best.far) {   // moved out to the second ring: tie it back to its marker
          var ex = H.clamp(L.x, best.x, best.x + w), ey = H.clamp(L.y, best.y, best.y + H2);
          c.strokeStyle = col; c.globalAlpha *= 0.6; c.lineWidth = 0.8; c.beginPath(); c.moveTo(L.x, L.y); c.lineTo(ex, ey); c.stroke(); c.globalAlpha /= 0.6;
        }
        label(c, L.t, best.x + 2, best.y + H2 / 2, 'left', 12, col);
      });
    }
    /* ---------- soil: one bar per source area; log2(n + 1) keeps small counts visible ---------- */

    function makeLayer(kind, cv) {
      var ctx = null, introT = -1, m = { kind: kind, cv: cv, hot: null, fadeUntil: 0 }, tpts = [], mesh = [];
      if (kind === 'soil') {
        var rr = H.rand(3), stp = 1.25, grid = {};
        for (var la = 53.5, r2 = 0; la > 18; la -= stp, r2++) for (var lo = 73.5, c2 = 0; lo < 135; lo += stp, c2++) {
          var jl = lo + (rr() - 0.5) * stp * 0.7, ja = la + (rr() - 0.5) * stp * 0.7;
          var row = G.rows_mask[Math.floor((G.north - ja) / G.step)], col = Math.floor((jl - G.west) / G.step);
          if (row && row.split(',').some(function (run) { var a = run.split(':'); return col >= +a[0] && col < +a[0] + +a[1]; })) grid[r2 + ',' + c2] = [jl, ja];
        }
        Object.keys(grid).forEach(function (key) {
          var rc = key.split(','), r = +rc[0], c = +rc[1], a = grid[key];
          [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(function (d) { var b = grid[(r + d[0]) + ',' + (c + d[1])]; if (b && !(d[0] === 1 && d[1] === -1 && grid[(r + 1) + ',' + c])) mesh.push([a, b]); });
        });
      }
      m.size = function () { ctx = H.fit(cv, V.w, V.h, 2); if (kind === 'teach') tpts = teachLayout(); };
      m.intro = function () { introT = performance.now(); };
      m.busy = function () { return introT >= 0 && performance.now() - introT < 1700; };
      m.draw = function (mouse) {
        if (!ctx) return;
        var it = introT < 0 ? 1 : H.clamp((performance.now() - introT) / 1600, 0, 1), c = ctx, hot = null;
        c.clearRect(0, 0, V.w, V.h);
        if (kind === 'survey') {
          hot = mouse ? provAt(mouse[0], mouse[1]) : null;
          drawProvinces(c, P3, it, hot, false);
          outlineStroke(c, P3, 0.7, 1);
          c.save(); insetClip(c); drawProvinces(c, PI3, it, hot, true); outlineStroke(c, PI3, 0.6, 0.7); c.restore();
          if (it > 0.55) {
            c.globalAlpha = H.clamp((it - 0.55) * 3, 0, 1);
            LAB.forEach(function (L) {
              var p = BY[L.en]; if (!p) return;
              if (V.s < 10 && !L.from && p.n < 100) return;   // small screens: keep 171, 99 and 18; the rest are in the tooltip
              var q = P3(L.at[0], L.at[1]);
              if (L.from) {
                var f = P3(L.from[0], L.from[1]);
                c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(f[0], f[1]); c.lineTo(q[0], q[1]); c.stroke();
                c.fillStyle = '#fff'; c.beginPath(); c.arc(f[0], f[1], 1.8, 0, 6.29); c.fill();
                var right = q[0] > f[0];
                label(c, p.n + '  ' + L.en, q[0] + (right ? 4 : -4), q[1], right ? 'left' : 'right', V.s < 10 ? 11 : 12);
              } else label(c, String(p.n), q[0], q[1], 'center', V.s < 10 ? 11 : 13);
            });
            c.globalAlpha = 1;
          }
        }
        if (kind === 'teach') {
          var order = tpts.slice().sort(function (a, b) { return b.r - a.r; });
          order.forEach(function (p, i) {
            var k = H.ease(H.clamp((it * 1.6 - i * 0.08) * 2.5, 0, 1)); if (k <= 0) return;
            var near = mouse && Math.hypot(p.x - mouse[0], p.y - mouse[1]) < Math.max(9, p.r + 2);
            if (near) hot = p;
            if (Math.hypot(p.x - p.tx, p.y - p.ty) > 2.5) {
              c.strokeStyle = 'rgba(255,200,150,.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(p.tx, p.ty); c.lineTo(p.x, p.y); c.stroke();
              c.fillStyle = '#ffd1a6'; c.beginPath(); c.arc(p.tx, p.ty, 1.6, 0, 6.29); c.fill();
            }
            var r = p.r * k;
            c.fillStyle = near ? 'rgba(255,162,74,.55)' : 'rgba(255,162,74,.32)';
            c.beginPath(); c.arc(p.x, p.y, r, 0, 6.29); c.fill();
            c.strokeStyle = '#ffa24a'; c.lineWidth = near ? 2 : 1.3; c.shadowColor = '#ffa24a'; c.shadowBlur = near ? 14 : 6; c.stroke(); c.shadowBlur = 0;
            c.fillStyle = '#ffe2c4'; c.beginPath(); c.arc(p.x, p.y, 1.8, 0, 6.29); c.fill();
          });
          if (it > 0.5) {
            c.globalAlpha = H.clamp((it - 0.5) * 3, 0, 1);
            /* sites that share a group (the two Tianjin communities) share one label */
            var seen = {}, items = [];
            tpts.forEach(function (p) {
              var g = p.s.group, v = (p.s.approx ? '\u2248' : '') + p.s.n;
              if (!g) { items.push({ x: p.x, y: p.y, r: p.r, t: p.s.short + ' ' + v }); return; }
              if (seen[g]) { seen[g].t += ' + ' + v; seen[g].x = (seen[g].x + p.x) / 2; seen[g].y = (seen[g].y + p.y) / 2; seen[g].r = Math.max(seen[g].r, p.r) + 3; return; }
              seen[g] = { x: p.x, y: p.y, r: p.r, t: g + ' ' + v }; items.push(seen[g]);
            });
            placeLabels(c, items, tpts, '#ffe2c4');
            c.globalAlpha = 1;
          }
        }
        if (kind === 'soil') {
          c.strokeStyle = 'rgba(235,235,255,' + (0.05 + 0.1 * it) + ')'; c.lineWidth = 0.7;
          c.beginPath();
          mesh.forEach(function (e, i) { if (i / mesh.length > it * 1.3) return; var a = P3(e[0][0], e[0][1]), b = P3(e[1][0], e[1][1]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
          c.stroke();
          var HB = V.hmax * 0.9, col = '#9aa7ff', tops = [];
          SS.slice().sort(function (a, b) { return b.ll[1] - a.ll[1]; }).forEach(function (s, i) {
            var k = H.ease(H.clamp((it * 1.8 - i * 0.08) * 2, 0, 1)), q = P3(s.ll[0], s.ll[1]), hh = Math.max(3, soilHeightFraction(s.n) * HB) * k;
            var near = mouse && Math.abs(mouse[0] - q[0]) < 9 && mouse[1] < q[1] + 7 && mouse[1] > q[1] - hh - 18; if (near) hot = { s: s };
            c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(q[0], q[1], 5, 2.2, 0, 0, 6.29); c.fill();
            var g = c.createLinearGradient(0, q[1], 0, q[1] - hh); g.addColorStop(0, col + '55'); g.addColorStop(1, col);
            c.fillStyle = near ? '#c9d0ff' : g; c.fillRect(q[0] - (near ? 4 : 3), q[1] - hh, near ? 8 : 6, hh);
            c.fillStyle = '#e4e8ff'; c.shadowColor = col; c.shadowBlur = near ? 16 : 8; c.beginPath(); c.arc(q[0], q[1] - hh, near ? 3.6 : 2.6, 0, 6.29); c.fill(); c.shadowBlur = 0;
            if (k > 0.9) tops.push({ x: q[0], y: q[1] - hh, r: 5, t: s.short + ' ' + s.n, bar: [q[0] - 4, q[1] - hh, 8, hh] });
          });
          if (tops.length) placeLabels(c, tops, tops.map(function (t) { return { rx: t.bar[0], ry: t.bar[1], rw: t.bar[2], rh: t.bar[3] + 3 }; }).concat(tops), '#e4e8ff');
        }
        m.hot = hot;
      };
      m.tipAt = function (mouse) {
        if (kind === 'survey') {
          var p = provAt(mouse[0], mouse[1]); if (!p) return '';
          if (!p.n) return '<b>' + p.en + ' \u00b7 ' + p.zh + '</b>No responses';
          var share = (p.n / SV.responses * 100).toFixed(1);
          return '<b>' + p.en + ' \u00b7 ' + p.zh + '</b>' + p.n + (p.n > 1 ? ' responses' : ' response') + ' (' + share + '% of ' + SV.responses + ')' +
            '<em>' + p.d.top.map(function (t) { return t[0] + ' ' + t[1]; }).join(' \u00b7 ') + (p.d.places > 3 ? ' \u00b7 +' + (p.d.places - 3) + ' more' : '') + '</em>';
        }
        if (!m.hot) return '';
        if (kind === 'teach') { var s = m.hot.s; return '<b>' + s.team + '</b>' + s.placeZh + '<br>' + (s.approx ? 'About ' : '') + s.n + ' students signed up' + (s.check ? '<em>Location to be confirmed</em>' : ''); }
        var o = m.hot.s;
        return '<b>' + o.place + '</b>' + o.n + (o.n > 1 ? ' soil samples' : ' soil sample') +
          (o.soil || o.cover ? '<br>' + [o.soil, o.cover].filter(Boolean).join(' \u00b7 ') : '') + (o.link ? '<em>' + o.link + '</em>' : '');
      };
      return m;
    }
    var layers = KINDS.map(function (k, i) { return makeLayer(k, cvs[i]); });

    /* ---------- one render loop that sleeps when nothing moves ---------- */
    var raf = 0, visible = true, mouse = null, cur = -1, dirty = true;
    function frame() {
      raf = 0; if (!visible) return;
      if (dirty) drawBase();
      var now = performance.now(), busy = false;
      layers.forEach(function (L, j) {
        var shown = j === cur || now < L.fadeUntil;
        if (!shown) return;
        if (dirty || L.busy() || (j === cur && mouse)) L.draw(j === cur ? mouse : null);
        if (L.busy()) busy = true;
      });
      dirty = false;
      if (busy) kick();
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    function resize() { sizeView(); bctx = H.fit(base, V.w, V.h, 2); layers.forEach(function (L) { L.size(); }); dirty = true; kick(); }

    function show(i) {
      if (i === cur) return;
      var was = cur; cur = i;
      sec.setAttribute('data-hp-active', KINDS[i]); updateSoilView();
      layers.forEach(function (L, j) { L.cv.classList.toggle('is-on', j === i); if (j === was) L.fadeUntil = performance.now() + 850; });
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      sec.style.setProperty('--hpc', COL[i]);
      if (noteEl) noteEl.textContent = NOTE[i];
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
      if (fig.classList.contains('is-soil-chart') || e.target.closest('[data-soil-views]')) return;
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
    H.hpWarm = function () { visible = true; dirty = true; kick(); };
    H.scene('hp', {
      get cutIn() { return !!(H.ascrStory && H.ascrStory.handsOver()); },
      // The final traces map aligns with this map in both directions.
      get cutOut() { return !!(H.ascrStory && H.ascrStory.handsOver()); },
      steps: 2,
      set: function (i) { show(i); },
      step: function (i) { show(i); return 700; }
    });
    show(0);
    H.once(sec, function () { if (cur >= 0) { layers[cur].intro(); kick(); } }, .3);
  }
  H.ready(function () { world(); hp(); });
})();
