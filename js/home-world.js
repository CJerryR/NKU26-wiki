/* Part 02 · world map. Land is drawn as a dot matrix over the Natural Earth
 * base; China is the way into the next view; the only data drawn are the
 * sourced case and, once imported, verified Herbivores sample pixels. */
(function () {
  'use strict';
  var NK = window.NK;
  var geo = window.NKUHomeGeo;
  var data = window.NKUHomeMapsData;
  var ab = window.NKUHomeAbundance || { points: [] };
  var map = document.querySelector('[data-world-map]');
  if (!NK || !map || !geo || !data) return;

  var stageEl = map.querySelector('[data-world-stage]');
  var base = map.querySelector('[data-world-base]');
  var dotsC = map.querySelector('[data-world-dots]');
  var entry = map.querySelector('[data-china-entry]');
  var casesG = map.querySelector('[data-world-cases]');
  var card = map.querySelector('[data-world-card]');
  var cardInner = card.querySelector('[data-card-inner]');
  var front = card.querySelector('[data-card-front]');
  var back = card.querySelector('[data-card-back]');
  var callout = map.querySelector('[data-china-callout]');
  var statusEl = map.querySelector('[data-world-status]');
  var WP = geo.world;
  var C2W = geo.chinaToWorld;

  function wxy(lon, lat) { return [(lon - WP.west) * WP.upd + WP.ox, (WP.north - lat) * WP.upd + WP.oy]; }
  function pct(v, total) { return (v / total * 100).toFixed(2) + '%'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- China outline in world coordinates ---- */
  var d = '';
  geo.rings.forEach(function (r) {
    var p = r.p;
    if (!p || p.length < 6) return;
    for (var i = 0; i < p.length; i += 2) {
      d += (i ? 'L' : 'M') + (p[i] * C2W.scale + C2W.tx).toFixed(2) + ' ' + (p[i + 1] * C2W.scale + C2W.ty).toFixed(2);
    }
    d += 'Z';
  });
  Array.prototype.forEach.call(map.querySelectorAll('[data-china-path]'), function (el) { el.setAttribute('d', d); });
  var cLab = wxy(141, 25);
  callout.style.left = pct(cLab[0], WP.w);
  callout.style.top = pct(cLab[1], WP.h);
  var cCenter = wxy(104, 35);

  /* ---- colour scale shared with the China map ---- */
  var stops = data.scale.stops.map(function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; });
  NK.abundanceColor = function (v) {
    var dom = ab.domain || [0, 1];
    var t = NK.clamp((v - dom[0]) / ((dom[1] - dom[0]) || 1), 0, 1) * (stops.length - 1);
    var i = Math.min(stops.length - 2, Math.floor(t));
    var f = t - i;
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(stops[i][k] + (stops[i + 1][k] - stops[i][k]) * f); }).join(',') + ')';
  };
  var hasData = ab.status === 'imported' && ab.points && ab.points.length;
  if (hasData && statusEl) {
    statusEl.textContent = ab.points.length.toLocaleString('en') + ' sample pixels · imported ' + (ab.retrieved || '');
    statusEl.classList.add('is-ok');
    var cs = document.querySelector('[data-china-status]');
    if (cs) { cs.textContent = statusEl.textContent; cs.classList.add('is-ok'); }
  }

  /* ---- dot-matrix land (+ data points) ---- */
  var mask = null;
  function buildMask() {
    try {
      var off = document.createElement('canvas');
      off.width = WP.w;
      off.height = WP.h;
      var o = off.getContext('2d');
      o.drawImage(base, 0, 0, WP.w, WP.h);
      mask = o.getImageData(0, 0, WP.w, WP.h).data;
    } catch (e) { mask = null; }
  }
  function draw() {
    var r = stageEl.getBoundingClientRect();
    if (!r.width) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    dotsC.width = Math.round(r.width * dpr);
    dotsC.height = Math.round(r.height * dpr);
    var ctx = dotsC.getContext('2d');
    ctx.setTransform(dpr * r.width / WP.w, 0, 0, dpr * r.height / WP.h, 0, 0);
    if (!mask) buildMask();
    if (mask) {
      var step = r.width < 700 ? 6.5 : 5;
      ctx.beginPath();
      for (var y = step / 2, row = 0; y < WP.h; y += step, row++) {
        for (var x = step / 2 + (row % 2 ? step / 2 : 0); x < WP.w; x += step) {
          var i = ((y | 0) * WP.w + (x | 0)) * 4;
          if (mask[i] < 234) { ctx.moveTo(x + 1.05, y); ctx.arc(x, y, 1.05, 0, 6.283); }
        }
      }
      ctx.fillStyle = 'rgba(118, 73, 125, 0.5)';
      ctx.fill();
    }
    if (hasData) {
      ab.points.forEach(function (pt) {
        var q = wxy(pt[0], pt[1]);
        var v = Math.log(pt[2] + 1) / Math.LN10;
        ctx.fillStyle = NK.abundanceColor(v);
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(q[0], q[1], 2.1, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
  }
  function whenBase(fn) { if (base.complete && base.naturalWidth) fn(); else base.addEventListener('load', fn, { once: true }); }
  NK.onVisible(map, function () { whenBase(draw); }, { rootMargin: '400px 0px' });
  var rT = 0;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (mask) draw(); }, 200); });

  /* ---- sourced case markers + flip card ---- */
  var openId = null;
  function placeCard(x, y) {
    card.style.setProperty('--x', pct(x, WP.w));
    card.style.setProperty('--y', pct(y, WP.h));
    card.classList.toggle('is-left', x > WP.w * 0.62);
  }
  function showCard(html, backHtml, x, y, id) {
    front.innerHTML = html;
    back.innerHTML = backHtml || '';
    card.classList.remove('is-flipped');
    card.hidden = false;
    placeCard(x, y);
    openId = id;
    requestAnimationFrame(function () { card.classList.add('is-open'); });
    var flip = card.querySelectorAll('[data-card-flip]');
    Array.prototype.forEach.call(flip, function (b) {
      b.addEventListener('click', function () { card.classList.toggle('is-flipped'); });
    });
    var close = card.querySelectorAll('[data-card-close]');
    Array.prototype.forEach.call(close, function (b) { b.addEventListener('click', hideCard); });
  }
  function hideCard() { card.classList.remove('is-open', 'is-flipped'); card.hidden = true; openId = null; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openId) hideCard(); });

  var closeBtn = '<button type="button" class="nk-card__x" data-card-close aria-label="Close card">×</button>';
  data.world.cases.forEach(function (c) {
    var q = wxy(c.lon, c.lat);
    var g = NK.svg('g', { class: 'nk-case', transform: 'translate(' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ')', tabindex: '0', role: 'button', 'aria-label': 'Sourced case: ' + c.nematode + ', ' + c.region }, casesG);
    NK.svg('circle', { r: 9, class: 'nk-case__pulse' }, g);
    NK.svg('circle', { r: 4.4, class: 'nk-case__dot' }, g);
    var html = '<p class="nk-card__eyebrow">Sourced case</p>' + closeBtn +
      '<h4>' + esc(c.nematode) + '</h4><p class="nk-card__sp"><i>' + esc(c.species) + '</i> · ' + esc(c.region) + '</p>' +
      '<dl><dt>Main crop</dt><dd>' + esc(c.crop) + '</dd><dt>Estimated loss</dt><dd>' + esc(c.loss) + '</dd>' +
      '<dt>Source</dt><dd><a href="' + esc(c.url) + '">' + esc(c.source) + '</a></dd></dl>' +
      '<button type="button" class="nk-card__flip" data-card-flip>Flip to the crop</button>';
    var backHtml = closeBtn + '<svg class="nk-card__crop" viewBox="0 0 220 90" aria-hidden="true"><path d="M20 70C60 20 120 12 200 30" fill="none" stroke="#6f9a4c" stroke-width="3"/><g fill="#9cc36b" stroke="#5f8a3d" stroke-width="1.5"><path d="M52 52c10-14 30-16 40-8-6 12-26 18-40 8z"/><path d="M96 34c12-12 32-10 40 0-8 10-28 12-40 0z"/><path d="M142 30c12-8 30-4 36 6-10 8-28 6-36-6z"/></g><g fill="#e8d39b"><circle cx="66" cy="50" r="4"/><circle cx="76" cy="47" r="4"/><circle cx="110" cy="34" r="4"/><circle cx="121" cy="33" r="4"/><circle cx="156" cy="32" r="3.6"/></g></svg>' +
      '<h4>' + esc(c.crop) + '</h4><p>' + esc(c.back) + '</p><p class="nk-card__note">' + esc(c.photoNote) + '</p>' +
      '<button type="button" class="nk-card__flip" data-card-flip>Flip back</button>';
    function open() { if (openId === c.id) { hideCard(); return; } showCard(html, backHtml, q[0], q[1], c.id); }
    g.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  /* ---- China: info card on hover/focus, zoom then scroll on activate ---- */
  var cc = data.world.chinaCard;
  var chinaHtml = '<p class="nk-card__eyebrow">Region</p>' + closeBtn + '<h4>' + esc(cc.region) + '</h4>' +
    '<dl><dt>Plant-feeding nematode abundance</dt><dd>' + (hasData ? 'See sample pixels on the map' : esc(cc.value)) + '</dd>' +
    '<dt>Unit</dt><dd>' + esc(cc.unit) + '</dd><dt>Data type</dt><dd>' + esc(cc.type) + '</dd><dt>Source</dt><dd>' + esc(cc.source) + '</dd></dl>' +
    '<a class="nk-card__go" href="#china-story" data-go-china>Look closer at China</a>';
  var hoverT = 0;
  function showChina() { clearTimeout(hoverT); if (openId !== 'china') showCard(chinaHtml, '', cCenter[0], cCenter[1] - 30, 'china'); bindGo(); }
  function bindGo() {
    var go = card.querySelector('[data-go-china]');
    if (go) go.addEventListener('click', function (e) { e.preventDefault(); zoomToChina(); });
  }
  var zooming = false;
  function zoomToChina() {
    if (zooming) return;
    var target = document.getElementById('china-story');
    if (!target) return;
    hideCard();
    if (NK.reduced) { target.scrollIntoView(); return; }
    zooming = true;
    stageEl.style.transformOrigin = pct(cCenter[0], WP.w) + ' ' + pct(cCenter[1], WP.h);
    stageEl.classList.add('is-zooming');
    setTimeout(function () {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset, behavior: 'smooth' });
      setTimeout(function () { stageEl.classList.remove('is-zooming'); zooming = false; }, 1200);
    }, 620);
  }
  entry.addEventListener('mouseenter', function () { if (!NK.coarse) hoverT = setTimeout(showChina, 160); });
  entry.addEventListener('mouseleave', function () { clearTimeout(hoverT); });
  entry.addEventListener('focus', function () { if (!NK.coarse) showChina(); });
  entry.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (NK.coarse && openId !== 'china') { showChina(); return; }
    zoomToChina();
  });
  stageEl.addEventListener('click', function (e) { if (openId && !card.contains(e.target)) hideCard(); });
}());
