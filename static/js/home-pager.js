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
   steps then play from scroll position (tall scenes) or when a page is in view.
   Input policy: hand velocity sets the pace. Light input preserves playback;
   forceful input accelerates or reverses the current scene without queuing
   extra pages. Only page turns use viewport resistance. */
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
    var paged = false, cur = 0, st = 0, busy = false, busyTimer = 0, atFoot = false, doneAt = 0, leaving = false, leaveTimer = 0;
    var html = root, PAGE_MS = 720;   // v7.2: 950 -> 720 ms per page
    /* v7.7: least starting speed of a move, in "page heights per duration"
       (0 = the old slow ease-in start, 1.1 = moves off at once, then settles) */
    var SLOPE = 1.1, SLOPE_SLOW = 0.5;
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
    var nextDot = -1;   // v7.7: the page a remembered scroll will lead to
    function dots() {
      pages.forEach(function (pg, i) {
        pg.dot.classList.toggle('is-on', i === cur);
        pg.dot.style.setProperty('--f', i < cur ? 1 : i > cur ? 0 : (pg.steps ? st / pg.steps : 1));
        if (i === cur) pg.dot.setAttribute('aria-current', 'step'); else pg.dot.removeAttribute('aria-current');
        pg.el.classList.toggle('is-here', i === cur);
        pg.dot.classList.toggle('is-next', i === nextDot);
      });
      var pg = pages[cur];
      cue.classList.toggle('is-on', paged && !busy && st < pg.steps && !pg.sp.noCue);
      if (root.getAttribute('data-page') !== pg.id) { var det = document.querySelector('[data-detective]'); if (det) det.classList.remove('show-bubble'); }
      root.setAttribute('data-page', pg.id);
      root.setAttribute('data-step', String(st));
      root.setAttribute('data-motion', busy ? (leaving || A.mode === 'tween' ? 'page' : 'scene') : 'idle');
    }

    /* ---------- paged mode ---------- */
    /* v7.7: page tops are read once (pages are exactly one screen tall here)
       instead of on every scroll event, so no frame forces a layout */
    var tops = [], bottom = 0;
    function measure() { tops = pages.map(function (pg) { return pg.el.offsetTop; }); bottom = maxY(); }
    function top(i) { if (tops.length !== pages.length) measure(); return tops[i]; }
    function maxY() { return Math.max(0, document.documentElement.scrollHeight - innerHeight); }
    function rest() { return atFoot ? maxY() : top(cur); }

    /* ---------- v7.7 motion ----------
       One animator owns the scroll position. A move is a cubic Hermite curve
       that starts at the current position with the current speed and ends at
       rest (speed 0): p(k) = (k^3 - 2k^2 + k) m0 + (3k^2 - 2k^3). m0 is the
       starting slope: the speed already there, but at least SLOPE, so a move
       leaves at once and the damping is all at the end. With m0 <= 3 the curve
       never overshoots. A pull (the give before a turn, the peek) is a
       critically damped spring toward rest + offset, so it can be grabbed and
       turned into a move at any instant without a jump in speed. */
    var A = { mode: '', y: 0, v: 0, raf: 0, last: 0, y0: 0, y1: 0, t0: 0, dur: 1, m0: 0, done: null, goal: 0, w: 0.02 };
    function herm(k, m) { return (k * k * k - 2 * k * k + k) * m + (3 * k * k - 2 * k * k * k); }
    function hermD(k, m) { return (3 * k * k - 4 * k + 1) * m + (6 * k - 6 * k * k); }
    function write(y) { A.y = y; scrollTo(0, y); }
    function sync() { if (!A.mode) { A.y = scrollY; A.v = 0; } }
    function halt() { cancelAnimationFrame(A.raf); A.raf = 0; A.mode = ''; A.v = 0; A.done = null; clearTimeout(pullT); pullAcc = 0; }
    function run() { if (!A.raf) { A.last = performance.now(); A.raf = requestAnimationFrame(tick); } }
    function tick(now) {
      A.raf = 0;
      var dt = Math.min(64, Math.max(1, now - A.last)); A.last = now;
      if (A.mode === 'tween') {
        var k = Math.min(1, (now - A.t0) / A.dur), D = A.y1 - A.y0;
        write(A.y0 + D * herm(k, A.m0));
        A.v = D * hermD(k, A.m0) / A.dur;
        if (k >= 1) { A.v = 0; A.mode = ''; var cb = A.done; A.done = null; if (cb) cb(); }
      } else if (A.mode === 'spring') {
        // exact step of a critically damped spring (stable for any frame time)
        var x = A.y - A.goal, w = A.w, e = Math.exp(-w * dt), c = A.v + w * x;
        var nx = (x + c * dt) * e;
        A.v = (A.v - w * c * dt) * e;
        if (Math.abs(nx) < 0.3 && Math.abs(A.v) < 0.008) { write(A.goal); A.v = 0; A.mode = ''; }
        else write(A.goal + nx);
      }
      if (A.mode && !A.raf) A.raf = requestAnimationFrame(tick);
    }
    function scrollToY(y, ms, done, slope) {
      sync(); clearTimeout(pullT); pullAcc = 0;
      var D = y - A.y;
      if (ms <= 0 || Math.abs(D) < 1) { cancelAnimationFrame(A.raf); A.raf = 0; A.mode = ''; A.v = 0; A.done = null; write(y); if (done) done(); return; }
      var m = A.v * ms / D;   // the speed the page already has, in this move's units
      if (m > 2.6) { ms = 2.6 * D / A.v; m = 2.6; }   // already fast: arrive sooner rather than brake
      m = m >= 0 ? Math.max(m, slope == null ? SLOPE : slope) : Math.max(m, -0.6);
      A.mode = 'tween'; A.y0 = A.y; A.y1 = y; A.t0 = performance.now(); A.dur = ms; A.m0 = m; A.done = done || null;
      run();
    }
    /* the give: the page follows the scroll a little, with iOS-style resistance
       b(x) = (1 - 1 / (x c / d + 1)) d, c = 0.55, and springs back when the
       scroll stops. Never during a page turn, never past the document ends. */
    var pullAcc = 0, pullT = 0;
    function rubber(x, d) { var s = x < 0 ? -1 : 1; x = Math.abs(x); return s * (1 - 1 / (x * 0.55 / d + 1)) * d; }
    function aim(off, w) {
      if (H.reduced || A.mode === 'tween') return false;
      sync(); A.goal = H.clamp(rest() + off, 0, bottom || maxY()); A.w = w; A.mode = 'spring'; run(); return true;
    }
    function release() { clearTimeout(pullT); pullAcc = 0; aim(0, 0.015); }
    function pullBy(d, max) {
      pullAcc = H.clamp(pullAcc + d, -max * 8, max * 8);
      if (!aim(rubber(pullAcc, max), 0.03)) return;
      clearTimeout(pullT); pullT = setTimeout(release, 150);
    }
    function pulse(dir, amp, hold, w) {
      pullAcc = 0;
      if (!aim(dir * amp, w || 0.024)) return;
      clearTimeout(pullT); pullT = setTimeout(release, hold || 160);
    }

    function lock(ms) {
      doneAt = performance.now() + Math.max(0, ms);
      busy = true; clearTimeout(busyTimer); dots();
      busyTimer = setTimeout(function () { busy = false; if (paged) { halt(); write(rest()); } dots(); armHint(); }, Math.max(0, ms));
    }
    var inputSpeed = 1, activeDir = 1;
    function next() {
      activeDir = 1;
      var pg = pages[cur];
      if (st < pg.steps) {
        st++; var ms = call(pg, 'step', st, 1, inputSpeed);
        if (ms < 0) return next();
        lock(ms); return;
      }
      /* v7.7: the page gives a little and comes back, so a held reader feels
         the stop instead of wondering whether the scroll was lost */
      if (pg.sp.canLeave && !pg.sp.canLeave()) { call(pg, 'blocked'); pulse(1, 18, 150); lock(450); return; }
      if (pg.sp.dwell && performance.now() - doneAt < pg.sp.dwell) return;
      if (cur < pages.length - 1) return go(cur + 1, 1);
      if (!atFoot && maxY() > top(cur) + 4) { atFoot = true; scrollToY(maxY(), 640); lock(660); }
    }
    function prev() {
      activeDir = -1;
      if (atFoot) { atFoot = false; scrollToY(top(cur), 640); lock(660); return; }
      var pg = pages[cur];
      if (st > 0) {
        st--; var ms = call(pg, 'step', st, -1, inputSpeed);
        if (ms < 0) return prev();
        lock(ms); return;
      }
      if (cur > 0) go(cur - 1, -1);
    }
    function go(i, dir, st0) {
      if (i === cur && !atFoot && st0 == null) return;
      clearTimeout(leaveTimer); clearTimeout(busyTimer); if (leaving) call(pages[cur], 'cancel'); leaving = false;
      var from = pages[cur], to = pages[i], adjacent = i === cur + dir;
      var wait = H.reduced ? 0 : call(from, 'leave', dir, { to: to.id, adjacent: adjacent });
      if (wait > 0) {
        release();
        leaving = true; busy = true; clearTimeout(busyTimer); dots();
        leaveTimer = setTimeout(function () { leaving = false; arrive(i, dir, from, to, adjacent, st0); }, wait);
        return;
      }
      arrive(i, dir, from, to, adjacent, st0);
    }
    function arrive(i, dir, from, to, adjacent, st0) {
      cur = i; atFoot = false;
      st = st0 != null ? st0 : dir < 0 ? to.steps : 0;
      call(to, 'set', st, dir);
      var cut = !!to.sp.cutIn && dir > 0 && adjacent && !H.reduced;
      busy = true; dots();
      var slow = dir > 0 && adjacent && to.sp.inMs;
      scrollToY(top(i), cut ? 0 : (slow ? to.sp.inMs : PAGE_MS) / Math.sqrt(inputSpeed), function () {
        var ms = call(to, 'enter', dir, { cut: cut, from: from.id });
        lock(ms + 120);
      }, slow ? SLOPE_SLOW : SLOPE);
      dots();
    }

    // Estimate hand intent over a short window, not from a single wheel tick.
    // Momentum can finish a movement, but cannot enqueue another page.
    var acc = 0, used = false, boosted = false, lastWheel = 0, lastDelta = 0;
    var samples = [], lastAction = 0;
    function onWheel(e) {
      if (!paged || e.ctrlKey || e.metaKey || e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || blocked(e.target)) return;
      var now = performance.now(), d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1), a = Math.abs(d);
      if (!a) return;
      e.preventDefault(); touched();
      var gap = now - lastWheel, reverse = d * lastDelta < 0 && a > 12;
      var fresh = gap > 180 || reverse || (now - lastAction > 380 && a > 45 && a > Math.abs(lastDelta) * 2.4 + 12);
      if (fresh) { used = false; boosted = false; acc = 0; samples = []; }
      lastWheel = now; lastDelta = d;
      samples.push([now, a]);
      samples = samples.filter(function (s) { return now - s[0] <= 120; });
      var distance = samples.reduce(function (sum, s) { return sum + s[1]; }, 0);
      var velocity = distance / Math.max(40, now - samples[0][0] + 16);
      var force = H.clamp((velocity - 0.35) / 2.8, 0, 1);
      var strong = distance >= 160 && velocity >= 1.35;
      if (busy) {
        // A light input leaves the current animation alone. A forceful push
        // shortens its remaining flight; a reversal can turn a scene back.
        if (!strong || boosted || leaving) return;
        boosted = true; used = true; lastAction = now;
        inputSpeed = 1 + force * 2.4;
        if (A.mode === 'tween') {
          var target = A.y1, done = A.done;
          scrollToY(target, Math.max(180, 440 - force * 240), done);
          return;
        }
        var pg = pages[cur];
        if (pg.sp.accelerate) {
          if ((d > 0 ? 1 : -1) !== activeDir && (d > 0 ? st < pg.steps : st > 0)) {
            clearTimeout(busyTimer); busy = false;
            d > 0 ? next() : prev();
          } else {
            var remaining = call(pg, 'accelerate', 600 - force * 340);
            if (remaining > 0) lock(remaining);
          }
        } else if (!pg.sp.noSkip && pg.sp.ff) {
          pg.sp.ff(); lock(120);
        }
        return;
      }
      if (used) return;
      acc += d;
      var pg = pages[cur], internal = d > 0 ? st < pg.steps : st > 0;
      var need = internal ? 24 : Math.max(56, pg.sp.leaveDelta || 0);
      if (Math.abs(acc) >= need) {
        used = true; acc = 0; lastAction = now; turns++;
        inputSpeed = 1 + force * 2.4;
        d > 0 ? next() : prev();
      } else if (!internal) pullBy(d, 14);
    }
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
      touched();
      if (busy || e.repeat) return;
      turns++; inputSpeed = 1;
      if (e.target && e.target.closest && e.target.closest('[data-op-focus]') && k.indexOf('Arrow') === 0) return;
      if (dn) next(); else if (up) prev(); else if (k === 'Home') go(0, -1); else go(pages.length - 1, 1);
    }
    function enable() {
      if (paged) return; paged = true;
      root.classList.add('is-paged');
      pages.forEach(function (pg) { pg.el.classList.remove('is-tall'); pg.el.style.removeProperty('--tall'); });
      measure();
      var y = scrollY, best = 0;
      pages.forEach(function (pg, i) { if (Math.abs(pg.el.offsetTop - y) < Math.abs(pages[best].el.offsetTop - y)) best = i; });
      var hash = location.hash && document.getElementById(location.hash.slice(1));
      if (hash) pages.forEach(function (pg, i) { if (pg.el === hash) best = i; });
      cur = best; st = 0; atFoot = false;
      pages.forEach(function (pg, i) { call(pg, 'set', i < cur ? pg.steps : 0, 1); });
      halt(); write(top(cur)); lock(call(pages[cur], 'enter', 1, { cut: false, initial: true }));
      dots(); armHint();
    }
    function disable() {
      if (!paged) return; paged = false; root.classList.remove('is-paged');
      halt(); clearTimeout(hintT); clearTimeout(busyTimer); clearTimeout(leaveTimer); if (leaving) call(pages[cur], 'cancel'); busy = false; leaving = false; tops = [];
      setupFallback(); dots();
    }
    // something else moved the page (the mascot's back-to-top, find in page): follow it
    addEventListener('scroll', function () {
      if (!paged || busy || atFoot) return;
      if (A.mode || Math.abs(scrollY - top(cur)) < 40) return;
      var best = 0; pages.forEach(function (pg, i) { if (Math.abs(top(i) - scrollY) < Math.abs(top(best) - scrollY)) best = i; });
      if (best === cur) return;
      cur = best; st = 0; call(pages[cur], 'set', 0, 1); call(pages[cur], 'enter', 1, { cut: false }); dots();
    }, { passive: true });
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    var rz; addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(function () {
        if (mq.matches && !H.reduced) { if (!paged) enable(); else { measure(); halt(); write(rest()); } }
        else disable();
      }, 150);
    });
    // anything else that scrolls (find in page, focus moving into a later page) resyncs
    addEventListener('focusin', function (e) {
      if (!paged || busy) return;
      pages.forEach(function (pg, i) { if (i !== cur && pg.el.contains(e.target)) { cur = i; st = pg.steps; call(pg, 'set', st, 1); halt(); write(top(i)); dots(); } });
    });

    /* ---------- v7.7: the idle peek ----------
       A reader who has finished a page and sits still gets one small, slow
       peek of the next page's edge: the page itself shows that it goes on.
       It stops for good once the reader has turned pages by themselves, never
       plays while the pointer is exploring the scene, and is capped per visit. */
    var hintT = 0, turns = 0, lastTouch = 0, lastPtr = 0, PEEK_KEY = 'nku-peek', IDLE = 3600;
    function peeksLeft() { try { return 3 - (+sessionStorage.getItem(PEEK_KEY) || 0); } catch (e) { return 1; } }
    function spendPeek() { try { sessionStorage.setItem(PEEK_KEY, String((+sessionStorage.getItem(PEEK_KEY) || 0) + 1)); } catch (e) {} }
    function touched() { lastTouch = performance.now(); armHint(); }
    function armHint() {
      clearTimeout(hintT);
      if (!paged || H.reduced || turns >= 2 || peeksLeft() <= 0) return;
      hintT = setTimeout(peek, IDLE);
    }
    function peek() {
      var now = performance.now(), pg = pages[cur];
      if (!paged || turns >= 2 || cur >= pages.length - 1 || atFoot) return;
      if (busy || A.mode || document.hidden || blocked(document.activeElement)) return armHint();
      if (now - lastPtr < 1500 || now - lastTouch < IDLE - 50) return armHint();
      if (st < pg.steps || (pg.sp.canLeave && !pg.sp.canLeave())) return armHint();
      spendPeek();
      pulse(1, 16, 420, 0.011);
    }
    addEventListener('pointermove', function () { lastPtr = performance.now(); }, { passive: true });
    addEventListener('pointerdown', touched, { passive: true });

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
    H.pager = { top: function () { if (paged) { if (cur || st || atFoot) go(0, -1, 0); } else scrollTo({ top: 0, behavior: H.reduced ? 'auto' : 'smooth' }); }, peek: peek, pulling: function () { return A.mode === 'spring'; }, next: next, prev: prev, go: function (id) { pages.forEach(function (pg, i) { if (pg.id === id) { if (paged) go(i, i >= cur ? 1 : -1); else pg.el.scrollIntoView({ behavior: H.reduced ? 'auto' : 'smooth' }); } }); }, isPaged: function () { return paged; } };
    H.goto = H.pager.go;
  }
})();
