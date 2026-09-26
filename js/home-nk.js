/* NKU homepage v6 — compatibility layer.
 * The soil scene and the China flight come from the 3D v3 homepage, which was
 * written against a small `NK` helper object. This file provides the same
 * helpers on top of the V3 core (NKUH), so those modules run unchanged in
 * spirit: one animation loop, easing, seeded random numbers, WebGL check. */
(function () {
  'use strict';
  var H = window.NKUH || {};
  var NK = window.NK = window.NK || {};
  NK.reduced = !!H.reduced;
  NK.coarse = !!H.coarse;
  NK.prefix = document.body.getAttribute('data-path-prefix') || '';
  NK.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  NK.lerp = function (a, b, t) { return a + (b - a) * t; };
  NK.smooth = function (a, b, x) { var t = NK.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  NK.easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  NK.easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  NK.rng = function (seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  NK.svg = function (tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) { for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]); } }
    if (parent) parent.appendChild(el);
    return el;
  };
  NK.webgl = function () {
    if (NK._gl !== undefined) return NK._gl;
    try {
      var c = document.createElement('canvas');
      NK._gl = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { NK._gl = false; }
    return NK._gl;
  };
  var handlers = {};
  NK.state = NK.state || { found: false, lightScreen: null };
  NK.on = function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); };
  NK.emit = function (name, data) {
    (handlers[name] || []).forEach(function (fn) { try { fn(data); } catch (e) { if (window.console) console.error(e); } });
  };
  /* one requestAnimationFrame loop for every WebGL scene */
  var loops = [], running = false, last = 0;
  function tick(now) {
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    for (var i = 0; i < loops.length; i++) {
      try { loops[i](now / 1000, dt); } catch (e) { if (window.console) console.error(e); loops.splice(i, 1); i--; }
    }
    if (loops.length) requestAnimationFrame(tick); else running = false;
  }
  NK.loop = function (fn) {
    if (loops.indexOf(fn) < 0) loops.push(fn);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
    return function () { var i = loops.indexOf(fn); if (i >= 0) loops.splice(i, 1); };
  };
  NK.loopWhileVisible = function (el, fn, margin) {
    var stop = null;
    if (!('IntersectionObserver' in window)) { NK.loop(fn); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !stop) stop = NK.loop(fn);
        else if (!e.isIntersecting && stop) { stop(); stop = null; }
      });
    }, { rootMargin: margin || '120px 0px' }).observe(el);
  };
  NK.say = function (t, ms) { if (window.NKUDetective) window.NKUDetective.say(t, ms); };
  NK.setDetective = function () {};
  /* one colour scale for the abundance layer (log10(x + 1)), shared by maps */
  var STOPS = ['#f4e6c8', '#ecbf85', '#d9835f', '#a8456a', '#5b1b5e', '#2c0f3a'];
  NK.abundanceColor = function (l) {
    var mx = NK.abundanceMax || 4;
    var v = NK.clamp(l / mx, 0, 1) * (STOPS.length - 1);
    var i = Math.min(STOPS.length - 2, Math.floor(v)), f = v - i;
    function hx(s) { return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]; }
    var a = hx(STOPS[i]), b = hx(STOPS[i + 1]);
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')';
  };
}());
