/* ==========================================================================
   NKU-iGEM 2026 - site shell (every page)
   LiquidGlass: builds a per-element SVG displacement filter so the rim of the
   glass bends whatever sits behind it (Apple Liquid Glass style). Chromium
   supports url() filters inside backdrop-filter; other engines keep the CSS
   frosted fallback from shell.css.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ua = navigator.userAgent;
  var REFRACT = /Chrome\/|Chromium\//.test(ua) && !/CriOS|FxiOS|Firefox/.test(ua) &&
    window.CSS && CSS.supports('backdrop-filter', 'blur(1px)');
  if (REFRACT) root.classList.add('lg-refract');

  /* ---- LiquidGlass ----------------------------------------------------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var defs = null, uid = 0;

  function ensureDefs() {
    if (defs) return defs;
    var host = doc.querySelector('.lg-defs');
    if (!host) {
      host = doc.createElementNS(SVGNS, 'svg');
      host.setAttribute('class', 'lg-defs');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      doc.body.appendChild(host);
    }
    defs = host.querySelector('defs') || host.appendChild(doc.createElementNS(SVGNS, 'defs'));
    return defs;
  }

  /* Glass optics, after kube.io's "Liquid Glass in the Browser".
     The rim of the pane is a convex squircle bezel, y = (1 - (1 - x)^4)^(1/4).
     For each distance from the edge we trace a vertical ray through that
     surface with Snell's law (n = 1.5) and record how far inward it lands on
     the background. The profile is computed once per bezel width and swept
     around the rounded rectangle; the flat middle does not bend light. */
  var profiles = {};
  function bezelProfile(bezel, thickness) {
    var key = bezel + ':' + thickness; if (profiles[key]) return profiles[key];
    var N = 128, out = new Float32Array(N), max = 0, n = 1.5;
    function h(x) { x = Math.max(0, Math.min(1, x)); return 1 - (1 - x) * (1 - x); }   // v6: a smooth dome, so the whole pane bends light continuously
    for (var i = 0; i < N; i++) {
      var x = i / (N - 1), e = 0.002;
      var slope = (h(x + e) - h(x - e)) / (2 * e) * (thickness / bezel);   // dh/ds in px/px
      var nx = -slope, nz = 1, L = Math.sqrt(nx * nx + nz * nz); nx /= L; nz /= L;
      var eta = 1 / n, cosi = nz, k = 1 - eta * eta * (1 - cosi * cosi);
      if (k < 0) { out[i] = 0; continue; }
      var c = eta * cosi - Math.sqrt(k), tx = c * nx, tz = -eta + c * nz;
      var depth = h(x) * thickness;                                         // glass above the background here
      var d = tz < 0 ? tx / -tz * depth : 0;                               // > 0: lands further inside
      out[i] = d; if (Math.abs(d) > max) max = Math.abs(d);
    }
    for (i = 0; i < N; i++) out[i] = max ? out[i] / max : 0;
    return (profiles[key] = out);
  }
  /* distance to the rounded-rect edge and the outward normal, per pixel */
  function edgeField(x, y, hw, hh, r) {
    var ax = Math.abs(x), ay = Math.abs(y), qx = ax - (hw - r), qy = ay - (hh - r), dist, nx, ny;
    if (qx > 0 && qy > 0) { var L = Math.sqrt(qx * qx + qy * qy) || 1e-6; dist = r - L; nx = qx / L; ny = qy / L; }
    else if (qx > qy) { dist = hw - ax; nx = 1; ny = 0; }
    else { dist = hh - ay; nx = 0; ny = 1; }
    return [dist, x < 0 ? -nx : nx, y < 0 ? -ny : ny];
  }
  function maps(w, h, radius, bezel, specular) {
    var s = 0.5, cw = Math.max(2, Math.round(w * s)), ch = Math.max(2, Math.round(h * s));
    var prof = bezelProfile(bezel, bezel * 1.15);
    var c1 = doc.createElement('canvas'); c1.width = cw; c1.height = ch;
    var c2 = doc.createElement('canvas'); c2.width = Math.round(w); c2.height = Math.round(h);
    var d1 = c1.getContext('2d').createImageData(cw, ch), D = d1.data;
    var r = Math.min(radius, w / 2, h / 2), hw = w / 2, hh = h / 2, px, py, f, i;
    for (py = 0; py < ch; py++) for (px = 0; px < cw; px++) {
      f = edgeField((px + 0.5) / s - hw, (py + 0.5) / s - hh, hw, hh, r);
      var t = f[0] / bezel, m = t < 1 && t >= 0 ? prof[Math.min(127, Math.round(t * 127))] : 0;
      i = (py * cw + px) * 4;
      D[i] = 128 - f[1] * m * 127; D[i + 1] = 128 - f[2] * m * 127; D[i + 2] = 128; D[i + 3] = 255;
    }
    c1.getContext('2d').putImageData(d1, 0, 0);
    /* specular: a thin rim lit from the upper left, fading along the edge by
       angle, plus a much softer glint on the opposite side */
    var W2 = c2.width, H2 = c2.height, d2 = c2.getContext('2d').createImageData(W2, H2), S = d2.data;
    var lx = -0.55, ly = -0.84;
    for (py = 0; py < H2; py++) for (px = 0; px < W2; px++) {
      f = edgeField(px + 0.5 - hw, py + 0.5 - hh, hw, hh, r);
      if (f[0] < 0 || f[0] > 3.2) continue;
      var dot = f[1] * lx + f[2] * ly, lit = dot > 0 ? Math.pow(dot, 2.2) : Math.pow(-dot, 3) * 0.45;
      var fall = f[0] < 1 ? f[0] : Math.max(0, 1 - (f[0] - 1) / 2.2);
      var a = lit * fall * specular;
      if (a < 0.004) continue;
      i = (py * W2 + px) * 4; S[i] = S[i + 1] = S[i + 2] = 255; S[i + 3] = Math.round(a * 255);
    }
    c2.getContext('2d').putImageData(d2, 0, 0);
    return { disp: c1.toDataURL(), spec: c2.toDataURL() };
  }

  function buildFilter(id, w, h, m, scale, aberration) {
    var f = doc.getElementById(id);
    if (!f) {
      f = doc.createElementNS(SVGNS, 'filter');
      f.setAttribute('id', id);
      f.setAttribute('filterUnits', 'userSpaceOnUse');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      ensureDefs().appendChild(f);
    }
    f.setAttribute('x', 0); f.setAttribute('y', 0);
    f.setAttribute('width', w); f.setAttribute('height', h);
    var a = aberration, sc = function (k) { return (scale * k).toFixed(2); };
    f.innerHTML =
      '<feImage href="' + m.disp + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none" result="map"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + sc(1) + '" xChannelSelector="R" yChannelSelector="G" result="dr"/>' +
      '<feColorMatrix in="dr" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + sc(1 - a) + '" xChannelSelector="R" yChannelSelector="G" result="dg"/>' +
      '<feColorMatrix in="dg" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + sc(1 - 2 * a) + '" xChannelSelector="R" yChannelSelector="G" result="db"/>' +
      '<feColorMatrix in="db" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b"/>' +
      '<feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/>' +
      '<feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" result="glass"/>' +
      '<feImage href="' + m.spec + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none" result="spec"/>' +
      '<feComposite in="spec" in2="glass" operator="over"/>';
  }

  var PRESETS = {
    /* bezel: refracting rim (px) · shift: largest inward shift at the rim (px)
       aberration: channel split · spec: rim light strength · blur/sat: backdrop */
    /* v6: the refracting zone spans the whole pane (bezel >= half its height),
       so the surface reads as one continuous lens instead of a frosted slab */
    bar:   { bezel: 999, shift: 13, aberration: 0.06, spec: 0.55, blur: 0.35, sat: 150 },
    lens:  { bezel: 999, shift: 9, aberration: 0.05, spec: 0.45, blur: 0, sat: 140 },
    drop:  { bezel: 44, shift: 16, aberration: 0.05, spec: 0.45, blur: 3.5, sat: 155 },
    sheet: { bezel: 44, shift: 16, aberration: 0.05, spec: 0.45, blur: 3.5, sat: 155 },
    card:  { bezel: 999, shift: 12, aberration: 0.05, spec: 0.45, blur: 1.5, sat: 150 }
  };

  function attach(el) {
    if (!REFRACT || el.__lg) return;
    var fx = el.querySelector(':scope > .lg__fx'); if (!fx) return;
    var p = PRESETS[el.getAttribute('data-lg')] || PRESETS.card;
    var id = 'lg-' + (++uid), last = '';
    el.__lg = true;
    function update() {
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (w < 4 || h < 4) return;
      var key = w + 'x' + h; if (key === last) return; last = key;
      var radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || h / 2;
      buildFilter(id, w, h, maps(w, h, radius, Math.min(p.bezel, h / 2 - 1), p.spec), p.shift * 2, p.aberration);
      var v = 'blur(' + p.blur + 'px) url(#' + id + ') saturate(' + p.sat + '%) brightness(1.03)';
      fx.style.backdropFilter = v;
    }
    el.__lgUpdate = update;
    update();
    if (window.ResizeObserver) {
      var tm; new ResizeObserver(function () { clearTimeout(tm); tm = setTimeout(update, 60); }).observe(el);
    }
  }

  window.LiquidGlass = { attach: attach, refract: REFRACT };

  function pointerSheen(el) {
    if (REDUCED || !window.matchMedia('(pointer:fine)').matches) return;
    var shine = el.querySelector(':scope > .lg__shine'); if (!shine) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      shine.style.setProperty('--lg-mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      shine.style.setProperty('--lg-my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---- nav ------------------------------------------------------------- */
  function nav() {
    var bar = doc.querySelector('[data-lnav]'); if (!bar) return;
    var links = bar.querySelector('.lnav__links');
    var lens = bar.querySelector('.lnav__lens');
    var toggle = bar.querySelector('.lnav__toggle');
    var sheet = bar.querySelector('.lnav__sheet');
    var groups = [].slice.call(bar.querySelectorAll('.lnav__group'));
    var pathPrefix = doc.body.getAttribute('data-path-prefix') || '';

    [].slice.call(bar.querySelectorAll('.lg')).forEach(function (el) { attach(el); pointerSheen(el); });

    // mark the current section
    var here = location.pathname.replace(/index\.html$/, '');
    [].slice.call(bar.querySelectorAll('a[href]')).forEach(function (a) {
      var p = new URL(a.getAttribute('href'), location.href).pathname.replace(/index\.html$/, '');
      if (p === here) {
        a.setAttribute('aria-current', 'page');
        var top = a.classList.contains('lnav__link') ? a : null;
        var g = a.closest('.lnav__group');
        if (g) top = g.querySelector('.lnav__link');
        if (top) top.classList.add('is-current');
      }
    });

    // droplet lens that follows the hovered link
    var lensTimer;
    function moveLens(target) {
      if (!lens || !target) return;
      var lr = links.getBoundingClientRect(), tr = target.getBoundingClientRect();
      lens.style.width = tr.width + 'px';
      lens.style.setProperty('--lens-x', (tr.left - lr.left) + 'px');
      lens.classList.add('is-on');
      clearTimeout(lensTimer);
      lensTimer = setTimeout(function () { lens.__lgUpdate && lens.__lgUpdate(); }, 480);
    }
    function hideLens() {
      var open = groups.filter(function (g) { return g.classList.contains('is-open'); })[0];
      if (open) moveLens(open.querySelector('.lnav__link'));
      else if (lens) lens.classList.remove('is-on');
    }
    if (links) {
      [].slice.call(links.querySelectorAll('.lnav__link')).forEach(function (l) {
        l.addEventListener('pointerenter', function () { moveLens(l); });
        l.addEventListener('focus', function () { moveLens(l); });
        l.addEventListener('pointerdown', function () { lens && lens.classList.add('is-pressed'); });
      });
      doc.addEventListener('pointerup', function () { lens && lens.classList.remove('is-pressed'); });
      links.addEventListener('pointerleave', hideLens);
    }

    // dropdowns: hover on fine pointers, click everywhere, Esc to close
    var hover = window.matchMedia('(hover:hover) and (pointer:fine)');
    function setOpen(g, open) {
      g.classList.toggle('is-open', open);
      g.querySelector('.lnav__link').setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var drop = g.querySelector('.lnav__drop'); drop && drop.__lgUpdate && drop.__lgUpdate(); }
    }
    function closeAll(except) { groups.forEach(function (g) { if (g !== except) setOpen(g, false); }); }
    groups.forEach(function (g) {
      var btn = g.querySelector('.lnav__link'), t;
      btn.addEventListener('click', function () { var o = !g.classList.contains('is-open'); closeAll(g); setOpen(g, o); });
      g.addEventListener('pointerenter', function () { if (!hover.matches) return; clearTimeout(t); closeAll(g); setOpen(g, true); });
      g.addEventListener('pointerleave', function () { if (!hover.matches) return; t = setTimeout(function () { setOpen(g, false); hideLens(); }, 220); });
    });
    doc.addEventListener('click', function (e) { if (!e.target.closest('.lnav__group')) closeAll(); });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = groups.filter(function (g) { return g.classList.contains('is-open'); })[0];
      closeAll(); if (open) open.querySelector('.lnav__link').focus();
      if (sheet && !sheet.hidden) { setSheet(false); toggle.focus(); }
    });

    // mobile sheet
    function setSheet(open) {
      if (!sheet) return;
      sheet.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) attach(sheet), sheet.__lgUpdate && sheet.__lgUpdate();
    }
    toggle && toggle.addEventListener('click', function () { setSheet(sheet.hidden); });

    // hide on scroll down, show on scroll up; tint adapts to light sections
    var lastY = window.scrollY, ticking = false;
    function tone() {
      var y = 42, xs = [window.innerWidth * 0.3, window.innerWidth * 0.7], light = 0;
      xs.forEach(function (x) {
        var stack = doc.elementsFromPoint ? doc.elementsFromPoint(x, y) : [];
        for (var i = 0; i < stack.length; i++) {
          if (stack[i].closest && stack[i].closest('.lnav')) continue;
          var t = stack[i].closest && stack[i].closest('[data-tone]');
          if (t) { if (t.getAttribute('data-tone') === 'light') light++; break; }
          var bg = getComputedStyle(stack[i]).backgroundColor;
          var m = bg && bg.match(/\d+(\.\d+)?/g);
          if (m && (m.length < 4 || +m[3] > 0.5)) { if ((+m[0] * .3 + +m[1] * .59 + +m[2] * .11) > 170) light++; break; }
        }
      });
      bar.classList.toggle('is-on-light', light > 0);
    }
    var nowEl = bar.querySelector('[data-lnav-now]'), nowText = '';
    function nowLabel() {
      if (!nowEl) return;
      var y = window.innerHeight * .35, secs = doc.querySelectorAll('main section, main > article, footer'), txt = '';
      for (var i = 0; i < secs.length; i++) {
        var r = secs[i].getBoundingClientRect();
        if (r.top <= y && r.bottom > y) { var h = secs[i].querySelector('h1,h2'); txt = secs[i].getAttribute('data-nav-label') || (h ? h.textContent : '') || ''; break; }
      }
      txt = txt.replace(/\s+/g, ' ').trim(); if (txt.length > 34) txt = txt.slice(0, 32) + '…';
      if (!txt) txt = doc.title.split('|')[0].trim();
      if (txt !== nowText) { nowText = txt; nowEl.textContent = txt; }
    }
    bar.addEventListener('pointerenter', function () { bar.classList.add('is-peek'); });
    bar.addEventListener('pointerleave', function () { bar.classList.remove('is-peek'); });
    function onScroll() {
      var y = window.scrollY;
      var busy = (sheet && !sheet.hidden) || groups.some(function (g) { return g.classList.contains('is-open'); });
      if (!busy && y > lastY + 2 && y > 420) bar.classList.add('is-compact');
      if (y < lastY - 6 || y < 420) bar.classList.remove('is-compact');
      nowLabel();
      lastY = y; ticking = false; tone();
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    tone();
  }

  /* ---- detective ------------------------------------------------------- */
  function detective() {
    var box = doc.querySelector('[data-detective]'); if (!box) return;
    var btn = box.querySelector('.detective__btn');
    var bubble = box.querySelector('.detective__bubble');
    var home = doc.body.classList.contains('page-home');
    var tips = home ? [
      'Follow the <b>cyan dots</b>. They lead somewhere.',
      'Tap me any time to go back to the soil.',
      'Every map on this page can be clicked.',
      'Colors here mean something: <b>yellow</b> is our readout.'
    ] : [
      'Lost? Tap me to go back to the top.',
      'The outline on the left jumps between sections.',
      'Search lives in the top bar.'
    ];
    var ti = 0, timer;
    function say(html, ms) {
      bubble.innerHTML = html; box.classList.add('show-bubble');
      clearTimeout(timer); timer = setTimeout(function () { box.classList.remove('show-bubble'); }, ms || 4800);
    }
    var torch = box.querySelector('.detective__torch'), rot = torch && torch.querySelector('[data-torch-rot]'), tipEl = torch && torch.querySelector('[data-torch-tip]');
    function aim(x, y) {
      if (!torch || !rot) return;
      var r = torch.getBoundingClientRect(); if (!r.width) return;
      var a = Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180 / Math.PI;
      a = Math.max(-150, Math.min(80, a));
      rot.setAttribute('transform', 'rotate(' + a.toFixed(1) + ')');
    }
    function torchTip() {
      if (!tipEl) return null;
      var r = tipEl.getBoundingClientRect(); if (!r.width && !r.height && !r.left) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    window.NKUDetective = { say: say, el: box, lit: function (on) { box.classList.toggle('is-lit', !!on); }, aim: aim, torchTip: torchTip };
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); });
    btn.addEventListener('pointerenter', function () { say(tips[ti++ % tips.length]); });
    btn.addEventListener('focus', function () { say(tips[ti++ % tips.length]); });
  }

  function init() { nav(); detective(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
