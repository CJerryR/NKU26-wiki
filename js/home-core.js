/* NKU homepage — shared helpers */
(function () {
  'use strict';
  var doc = document, win = window;
  var H = win.NKUH = {};
  H.reduced = win.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  H.coarse = win.matchMedia && matchMedia('(pointer: coarse)').matches;
  H.$ = function (s, r) { return (r || doc).querySelector(s); };
  H.$$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  H.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  H.lerp = function (a, b, t) { return a + (b - a) * t; };
  H.ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  H.smooth = function (a, b, v) { var t = H.clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  H.rand = function (seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  H.onView = function (el, cb, opts) {
    if (!('IntersectionObserver' in win)) { cb(true); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting, e); }); }, opts || { threshold: 0 });
    io.observe(el); return io;
  };
  H.once = function (el, cb, th) { var io = H.onView(el, function (v) { if (v) { cb(); if (io) io.disconnect(); } }, { threshold: th || .25 }); };
  /* progress of a tall section through the viewport: 0 when its top hits top, 1 when its bottom hits bottom */
  H.progress = function (el) {
    var r = el.getBoundingClientRect(), span = r.height - innerHeight;
    return span <= 0 ? (r.top <= 0 ? 1 : 0) : H.clamp(-r.top / span, 0, 1);
  };
  /* images live on static.igem.wiki once uploaded; build.py passes the URL map in NKU_HOME.assets */
  H.asset = function (rel) {
    var m = win.NKU_HOME && win.NKU_HOME.assets, key = rel.replace(/^img\//, '');
    return (m && m[key]) || (doc.body.getAttribute('data-path-prefix') || '') + rel;
  };
  H.dpr = function () { return Math.min(win.devicePixelRatio || 1, 2); };
  H.fit = function (cv, w, h, max) {
    var d = Math.min(H.dpr(), max || 2);
    cv.width = Math.round(w * d); cv.height = Math.round(h * d);
    var c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return c;
  };
  /* tooltip shared by maps */
  var tipEl;
  H.tip = function (html, x, y) {
    tipEl = tipEl || H.$('[data-tip]');
    if (!tipEl) return;
    if (!html) { tipEl.hidden = true; return; }
    tipEl.innerHTML = html; tipEl.hidden = false;
    var w = tipEl.offsetWidth, flip = x + w + 30 > innerWidth;
    tipEl.style.left = (flip ? x - w - 28 : x) + 'px'; tipEl.style.top = y + 'px';
  };
  H.say = function (t, ms) { if (win.NKUDetective) win.NKUDetective.say(t, ms); };

  /* heading word reveal */
  function split(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
            var s = doc.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    H.$$('.w', el).forEach(function (w, i) { w.style.setProperty('--i', i); });
  }
  function initSplit() {
    H.$$('[data-split]').forEach(function (el) {
      split(el);
      if (H.reduced) { el.classList.add('is-in'); return; }
      H.once(el, function () { el.classList.add('is-in'); }, .3);
    });
  }
  H.ready = function (fn) { if (doc.readyState !== 'loading') fn(); else doc.addEventListener('DOMContentLoaded', fn); };
  H.ready(initSplit);
})();
