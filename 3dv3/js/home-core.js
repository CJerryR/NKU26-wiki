/* NKU-iGEM26 homepage core: one animation loop, small utilities, the
 * detective mascot and the flashlight "iris" transition into part 02. */
(function () {
  'use strict';

  var NK = window.NK = window.NK || {};
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  NK.reduced = !!(mq && mq.matches);
  NK.coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
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

  /* ---- tiny event bus + shared state ---- */
  var handlers = {};
  NK.state = { found: false, lightScreen: null };
  NK.on = function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); };
  NK.emit = function (name, data) {
    (handlers[name] || []).forEach(function (fn) { try { fn(data); } catch (e) { if (window.console) console.error(e); } });
  };

  /* ---- one requestAnimationFrame loop for every animated part ---- */
  var loops = [];
  var running = false;
  var last = 0;
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
  /* Run fn every frame only while el is near the viewport. */
  NK.loopWhileVisible = function (el, fn, margin) {
    var stop = null;
    if (!('IntersectionObserver' in window)) { NK.loop(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !stop) stop = NK.loop(fn);
        else if (!e.isIntersecting && stop) { stop(); stop = null; }
      });
    }, { rootMargin: margin || '120px 0px' });
    io.observe(el);
  };
  NK.onVisible = function (el, fn, opts) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, opts || { threshold: 0.25 });
    io.observe(el);
  };

  /* ---- detective mascot ---- */
  var det = document.querySelector('[data-detective]');
  var note = det && det.querySelector('[data-detective-note]');
  var noteTimer = 0;
  NK.say = function (text, ms) {
    if (!det || !note) return;
    note.textContent = text;
    det.classList.add('has-note');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { det.classList.remove('has-note'); }, Math.min(ms || 4400, window.innerWidth < 761 ? 3200 : 9000));
  };
  NK.setDetective = function (state) {
    if (!det) return;
    if (NK.state.found && state !== 'found') state = 'found';
    det.setAttribute('data-state', state);
  };
  NK.on('found', function () { NK.setDetective('found'); });

  /* Section notes are off: each one repeated a hint already on the page and
   * covered content near the mascot. Add [sectionId, text] pairs to restore. */
  var NOTES = [];
  if (det && 'IntersectionObserver' in window) {
    var said = {};
    var noteIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        var now = Date.now();
        if (said[id] && now - said[id] < 45000) return;
        said[id] = now;
        for (var i = 0; i < NOTES.length; i++) { if (NOTES[i][0] === id) NK.say(NOTES[i][1]); }
      });
    }, { threshold: 0.32 });
    NOTES.forEach(function (n) { var el = document.getElementById(n[0]); if (el) noteIO.observe(el); });
  }

  /* On narrow screens the mascot steps aside while a pinned panel that sits
   * at the bottom of the screen is in view ([data-mascot-away]). */
  if (det && 'IntersectionObserver' in window) {
    var awayOn = [];
    var awayIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var k = awayOn.indexOf(e.target);
        if (e.isIntersecting && k < 0) awayOn.push(e.target);
        if (!e.isIntersecting && k >= 0) awayOn.splice(k, 1);
      });
      det.classList.toggle('is-away', awayOn.length > 0);
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-mascot-away]'), function (el) { awayIO.observe(el); });
  }

  /* Phones: the mascot tucks away while the reader scrolls down through the
   * story and returns on the way back up or near the top, so it never rests
   * on a line that is being read (it stays the way back to the start). */
  if (det) {
    var lastY = window.pageYOffset;
    var tucked = false;
    var setTuck = function (on) { if (on !== tucked) { tucked = on; det.classList.toggle('is-tucked', on); } };
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      var dy = y - lastY;
      if (window.innerWidth > 760 || y < 160) { setTuck(false); lastY = y; return; }
      if (!tucked && dy > 10) { setTuck(true); lastY = y; }
      else if (tucked && dy < -40) { setTuck(false); lastY = y; }
      else if ((tucked && dy > 0) || (!tucked && dy < 0)) lastY = y;
    }, { passive: true });
  }

  /* ---- reveal-on-scroll for elements marked [data-reveal] ---- */
  var revealEls = document.querySelectorAll('[data-reveal], .nk-stage, .nk-triad, .nk-profiles, .nk-beam, .nk-questions li, .nk-card-r, .nk-path4 li, .nk-meanings li, .nk-three li');
  if ('IntersectionObserver' in window && !NK.reduced) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('nk-will-reveal'); rio.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  }

  /* ---- iris: the light finds the part-02 title, then pops open ---- */
  (function iris() {
    var sec = document.getElementById('global-story');
    var title = sec && sec.querySelector('[data-iris-target]');
    if (!sec || !title || NK.reduced) return;
    var ov = document.createElement('div');
    ov.className = 'nk-iris';
    ov.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ov);
    NK.state.irisOpen = false;
    var popped = false;
    var popT0 = 0;
    var popFrom = 80;
    var cur = { x: 0, y: 0, r: 80 };

    function frame(t) {
      var vh = window.innerHeight;
      var vw = window.innerWidth;
      var rect = sec.getBoundingClientRect();
      var q = (vh - rect.top) / (vh * 0.95);
      if (q <= 0.001) { ov.style.opacity = '0'; popped = false; NK.state.irisOpen = false; return; }
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
        cur.r = NK.lerp(86, rTitle, NK.smooth(0.36, 0.56, q));
        ov.style.opacity = String(NK.smooth(0, 0.12, q));
        if (q > 0.64) { popped = true; NK.state.irisOpen = true; popT0 = t; popFrom = cur.r; NK.emit('iris-pop'); }
      } else {
        var e = NK.clamp((t - popT0) / 0.9, 0, 1);
        var full = Math.sqrt(vw * vw + vh * vh);
        cur.x = NK.lerp(cur.x, tx, 0.2);
        cur.y = NK.lerp(cur.y, ty, 0.2);
        cur.r = popFrom + (full - popFrom) * (e < 1 ? 1 - Math.pow(1 - e, 3) : 1) + (e < 0.25 ? -18 * Math.sin(e / 0.25 * Math.PI) : 0);
        ov.style.opacity = String(1 - NK.smooth(0.55, 1, e));
        if (q < 0.46) { popped = false; NK.state.irisOpen = false; }
      }
      ov.style.setProperty('--ix', cur.x.toFixed(1) + 'px');
      ov.style.setProperty('--iy', cur.y.toFixed(1) + 'px');
      ov.style.setProperty('--ir', Math.max(0, cur.r).toFixed(1) + 'px');
    }
    var stop = null;
    if (!('IntersectionObserver' in window)) { NK.loop(frame); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!stop) stop = NK.loop(frame); return; }
        if (stop) { stop(); stop = null; }
        ov.style.opacity = '0';
        popped = e.boundingClientRect.top < 0;
        NK.state.irisOpen = popped;
      });
    }, { rootMargin: '0px 0px 25% 0px' }).observe(sec);
  }());
}());
