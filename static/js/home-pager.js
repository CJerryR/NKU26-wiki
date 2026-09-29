/* NKU homepage — page-by-page scrolling.
   Each <section> in <main> is a page. A scroll gesture first plays the page's
   own steps (its animation), and only when they are done moves to the next
   page, which snaps into place. Scenes register with NKUH.scene(id, spec):
     steps   number of animation steps after arriving (default 0)
     set(i)  jump to the state after step i without animating
     step(i, dir) animate to step i, return its duration in ms
                  (return -1 when there is nothing to show, to keep going)
     enter(dir, info) called on arrival; return ms to wait (info.cut = no scroll)
     ff()    finish a running step at once
     cutIn   arrive without scrolling when coming from the previous page
     tall    height in viewports when pages are not snapped (narrow screens)
   v6 stop rules (each page decides where it holds the reader):
     canLeave()  return false to hold the reader on this page (blocked() is
                 then called, e.g. the soil scan before the nematode is found)
     noSkip      a running step cannot be fast-forwarded (the China flight)
     dwell       ms the page stays put after its last step before a scroll
                 may leave it; leaveDelta: a firmer scroll is needed to leave
     leave(dir, info) may return ms to play an exit before the next page
   Narrow screens, touch-only devices and reduced motion keep native scrolling;
   steps then play from scroll position (tall scenes) or when a page is in view. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  var scenes = {};
  H.scene = function (id, spec) { scenes[id] = spec; };
  H.goto = function (id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: H.reduced ? 'auto' : 'smooth' }); };
  // after every deferred module has registered its scene
  if (document.readyState === 'complete') setTimeout(init, 0); else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });

  function init() {
    var root = document.documentElement;
    var pages = H.$$('main > section[id]').map(function (el) {
      var sp = scenes[el.id] || {};
      return { el: el, id: el.id, sp: sp, steps: sp.steps || 0, label: el.getAttribute('data-nav-label') || el.id };
    });
    if (!pages.length) return;
    var mq = matchMedia('(pointer: fine) and (min-width: 960px) and (min-height: 600px)');
    var paged = false, cur = 0, st = 0, busy = false, busyTimer = 0, atFoot = false, tween = 0, doneAt = 0, leaving = false;
    function call(pg, fn) { var f = pg.sp[fn]; if (!f) return 0; var r = f.apply(pg.sp, [].slice.call(arguments, 2)); return typeof r === 'number' ? r : 0; }

    /* ---------- dots ---------- */
    var rail = document.createElement('nav'); rail.className = 'pager'; rail.setAttribute('aria-label', 'Homepage sections');
    pages.forEach(function (pg, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pager__dot';
      b.innerHTML = '<i><em></em></i><span>' + pg.label + '</span>';
      b.setAttribute('aria-label', pg.label);
      b.addEventListener('click', function () { if (paged) { if (!busy || i !== cur) go(i, i >= cur ? 1 : -1); } else pg.el.scrollIntoView({ behavior: H.reduced ? 'auto' : 'smooth' }); });
      pg.dot = b; rail.appendChild(b);
    });
    document.body.appendChild(rail);
    var cue = document.createElement('div'); cue.className = 'pager__cue'; cue.setAttribute('aria-hidden', 'true'); document.body.appendChild(cue);
    function dots() {
      pages.forEach(function (pg, i) {
        pg.dot.classList.toggle('is-on', i === cur);
        pg.dot.style.setProperty('--f', i < cur ? 1 : i > cur ? 0 : (pg.steps ? st / pg.steps : 1));
        if (i === cur) pg.dot.setAttribute('aria-current', 'step'); else pg.dot.removeAttribute('aria-current');
        pg.el.classList.toggle('is-here', i === cur);
      });
      var pg = pages[cur];
      cue.classList.toggle('is-on', paged && !busy && st < pg.steps && !pg.sp.noCue);
      if (root.getAttribute('data-page') !== pg.id) { var det = document.querySelector('[data-detective]'); if (det) det.classList.remove('show-bubble'); }
      root.setAttribute('data-page', pg.id);
    }

    /* ---------- paged mode ---------- */
    function top(i) { return pages[i].el.offsetTop; }
    function maxY() { return Math.max(0, document.documentElement.scrollHeight - innerHeight); }
    function scrollToY(y, ms, done) {
      cancelAnimationFrame(tween);
      var y0 = scrollY, t0 = performance.now();
      if (ms <= 0 || Math.abs(y - y0) < 2) { scrollTo(0, y); if (done) done(); return; }
      (function f(now) {
        var k = Math.min(1, (now - t0) / ms);
        scrollTo(0, y0 + (y - y0) * H.ease(k));
        if (k < 1) tween = requestAnimationFrame(f); else if (done) done();
      })(t0);
    }
    function lock(ms) {
      doneAt = performance.now() + Math.max(0, ms);
      busy = true; clearTimeout(busyTimer); dots();
      busyTimer = setTimeout(function () { busy = false; dots(); }, Math.max(0, ms));
    }
    function next() {
      var pg = pages[cur];
      if (st < pg.steps) {
        st++; var ms = call(pg, 'step', st, 1);
        if (ms < 0) return next();
        lock(ms); return;
      }
      if (pg.sp.canLeave && !pg.sp.canLeave()) { call(pg, 'blocked'); lock(450); return; }
      if (pg.sp.dwell && performance.now() - doneAt < pg.sp.dwell) return;
      if (cur < pages.length - 1) return go(cur + 1, 1);
      if (!atFoot && maxY() > top(cur) + 4) { atFoot = true; scrollToY(maxY(), 800); lock(820); }
    }
    function prev() {
      if (atFoot) { atFoot = false; scrollToY(top(cur), 800); lock(820); return; }
      var pg = pages[cur];
      if (st > 0) {
        st--; var ms = call(pg, 'step', st, -1);
        if (ms < 0) return prev();
        lock(ms); return;
      }
      if (cur > 0) go(cur - 1, -1);
    }
    function go(i, dir) {
      if (i === cur && !atFoot) return;
      var from = pages[cur], to = pages[i], adjacent = i === cur + dir;
      var wait = H.reduced ? 0 : call(from, 'leave', dir, { to: to.id, adjacent: adjacent });
      if (wait > 0) {
        leaving = true; busy = true; clearTimeout(busyTimer); dots();
        setTimeout(function () { leaving = false; arrive(i, dir, from, to, adjacent); }, wait);
        return;
      }
      arrive(i, dir, from, to, adjacent);
    }
    function arrive(i, dir, from, to, adjacent) {
      cur = i; atFoot = false;
      st = dir < 0 ? to.steps : 0;
      call(to, 'set', st, dir);
      var cut = !!to.sp.cutIn && dir > 0 && adjacent && !H.reduced;
      busy = true; dots();
      scrollToY(top(i), cut ? 0 : (dir > 0 && adjacent && to.sp.inMs ? to.sp.inMs : 950), function () {
        var ms = call(to, 'enter', dir, { cut: cut, from: from.id });
        lock(ms + 80);
      });
    }

    /* wheel: one gesture = one move; the inertia tail of that gesture is ignored */
    var lastT = 0, lastA = 0, acc = 0, used = false, busyAt = 0;
    function onWheel(e) {
      if (!paged || e.ctrlKey || blocked(e.target)) return;
      e.preventDefault();
      var now = performance.now(), d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1), a = Math.abs(d);
      var fresh = now - lastT > 190 || a > lastA * 1.7 + 6;
      lastT = now; lastA = a;
      if (fresh) { used = false; acc = 0; }
      if (used || !a) return;
      if (busy) {
        // a new, deliberate gesture while a long step is playing finishes that step
        // a gesture that lands while a step is playing is used up entirely,
        // so its inertia tail cannot trigger a second step afterwards
        if (fresh && a > 14 && now - busyAt > 700) ff();
        used = true;
        return;
      }
      acc += d;
      var need = 11;   // v6: half the scroll that V3 needed; one trackpad swipe is enough
      if (Math.abs(acc) >= need) { used = true; acc = 0; busyAt = now; d > 0 ? next() : prev(); }
    }
    function ff() { var pg = pages[cur]; if (leaving || pg.sp.noSkip) return; if (pg.sp.ff) { pg.sp.ff(); clearTimeout(busyTimer); busy = false; dots(); } }
    function blocked(t) {
      if (root.classList.contains('search-open')) return true;
      if (document.querySelector('.cnfocus:not([hidden]), dialog[open]')) return true;
      return t && t.closest && t.closest('[data-free-scroll], .lnav__drop, .lnav__sheet');
    }
    function onKey(e) {
      if (!paged || e.altKey || e.ctrlKey || e.metaKey || blocked(e.target)) return;
      var tg = e.target, tag = tg && tg.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (tg && tg.isContentEditable)) return;
      var k = e.key, dn = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey), up = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey);
      if ((k === ' ' || k === 'Enter') && tg && tg.closest && tg.closest('button, a, [role="button"]')) return;
      if (dn || up || k === 'Home' || k === 'End') e.preventDefault(); else return;
      if (busy) { if (e.repeat) return; ff(); return; }
      if (e.target && e.target.closest && e.target.closest('[data-op-focus]') && k.indexOf('Arrow') === 0) return;
      if (dn) next(); else if (up) prev(); else if (k === 'Home') go(0, -1); else go(pages.length - 1, 1);
    }
    function enable() {
      if (paged) return; paged = true;
      root.classList.add('is-paged');
      pages.forEach(function (pg) { pg.el.classList.remove('is-tall'); pg.el.style.removeProperty('--tall'); });
      var y = scrollY, best = 0;
      pages.forEach(function (pg, i) { if (Math.abs(pg.el.offsetTop - y) < Math.abs(pages[best].el.offsetTop - y)) best = i; });
      var hash = location.hash && document.getElementById(location.hash.slice(1));
      if (hash) pages.forEach(function (pg, i) { if (pg.el === hash) best = i; });
      cur = best; st = 0; atFoot = false;
      pages.forEach(function (pg, i) { call(pg, 'set', i < cur ? pg.steps : 0, 1); });
      scrollTo(0, top(cur)); call(pages[cur], 'enter', 1, { cut: false, initial: true });
      dots();
    }
    function disable() {
      if (!paged) return; paged = false; root.classList.remove('is-paged');
      setupFallback(); dots();
    }
    // something else moved the page (the mascot's back-to-top, find in page): follow it
    addEventListener('scroll', function () {
      if (!paged || busy || atFoot) return;
      if (Math.abs(scrollY - top(cur)) < 40) return;
      var best = 0; pages.forEach(function (pg, i) { if (Math.abs(pg.el.offsetTop - scrollY) < Math.abs(pages[best].el.offsetTop - scrollY)) best = i; });
      if (best === cur) return;
      cur = best; st = 0; call(pages[cur], 'set', 0, 1); call(pages[cur], 'enter', 1, { cut: false }); dots();
    }, { passive: true });
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    var rz; addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(function () {
        if (mq.matches && !H.reduced) { if (!paged) enable(); else scrollTo(0, atFoot ? maxY() : top(cur)); }
        else disable();
      }, 150);
    });
    // anything else that scrolls (find in page, focus moving into a later page) resyncs
    addEventListener('focusin', function (e) {
      if (!paged || busy) return;
      pages.forEach(function (pg, i) { if (i !== cur && pg.el.contains(e.target)) { cur = i; st = pg.steps; call(pg, 'set', st, 1); scrollTo(0, top(i)); dots(); } });
    });

    /* ---------- native scrolling ---------- */
    var fb = null;
    function setupFallback() {
      if (fb) return; fb = true;
      pages.forEach(function (pg) {
        pg.done = 0; pg.running = false;
        if (pg.sp.tall && pg.steps) { pg.el.classList.add('is-tall'); pg.el.style.setProperty('--tall', pg.sp.tall); }
        call(pg, 'set', 0, 1);
        H.onView(pg.el, function (v, e) {
          if (paged || !v) return;
          if (!pg.entered) { pg.entered = true; call(pg, 'enter', 1, { cut: false }); }
          if (!pg.sp.tall && pg.steps && !pg.running && pg.done < pg.steps) autoplay(pg);
        }, { threshold: .5 });
      });
      addEventListener('scroll', onFallbackScroll, { passive: true });
      onFallbackScroll();
    }
    function autoplay(pg) {
      pg.running = true;
      (function one() {
        if (paged || pg.done >= pg.steps) { pg.running = false; return; }
        pg.done++; var ms = call(pg, 'step', pg.done, 1);
        setTimeout(one, Math.max(0, ms) + 900);
      })();
    }
    function onFallbackScroll() {
      if (paged) return;
      pages.forEach(function (pg) {
        if (!pg.sp.tall || !pg.steps || pg.running) return;
        var want = Math.min(pg.steps, Math.floor(H.progress(pg.el) * (pg.steps + .6)));
        if (want === pg.done) return;
        pg.running = true;
        var dir = want > pg.done ? 1 : -1; pg.done += dir;
        var ms = call(pg, 'step', pg.done, dir);
        setTimeout(function () { pg.running = false; onFallbackScroll(); }, Math.max(0, Math.min(ms, 900)));
      });
      var y = scrollY + innerHeight * .5;
      pages.forEach(function (pg, i) { if (pg.el.offsetTop <= y && pg.el.offsetTop + pg.el.offsetHeight > y) { cur = i; st = pg.done || 0; } });
      dots();
    }

    if (mq.matches && !H.reduced) enable(); else setupFallback();
    H.pager = { next: next, prev: prev, go: function (id) { pages.forEach(function (pg, i) { if (pg.id === id) { if (paged) go(i, i >= cur ? 1 : -1); else pg.el.scrollIntoView({ behavior: H.reduced ? 'auto' : 'smooth' }); } }); }, isPaged: function () { return paged; } };
    H.goto = H.pager.go;
  }
})();
