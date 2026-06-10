/* ============================================================================
   NKU iGEM 2026 — interaction & animation engine  (vanilla JS, no dependencies)
   All effects degrade gracefully and honour prefers-reduced-motion.
   Modules: nav · scroll-progress · reveal · counters · TOC scrollspy ·
            hero detection-lens · swimming nematode · parallax · mascot helper
============================================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var raf = window.requestAnimationFrame || function (f){ return setTimeout(f, 16); };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    nav();
    scrollProgress();
    reveal();
    counters();
    toc();
    heroSequence();
    detectionLens();
    swimmingNematode();
    parallax();
    mascot();
  }

  /* ── Navigation ────────────────────────────────────────────────────── */
  function nav() {
    var bar = $('.nav'); if (!bar) return;
    var toggle = $('.nav-toggle');
    var last = window.scrollY, ticking = false;

    function onScroll() {
      var y = window.scrollY;
      bar.classList.toggle('is-scrolled', y > 8);
      // hide on scroll down, show on scroll up (not while mobile menu open)
      if (!bar.classList.contains('menu-open')) {
        if (y > last && y > 320) bar.classList.add('is-hidden');
        else bar.classList.remove('is-hidden');
      }
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { raf(onScroll); ticking = true; }
    }, { passive: true });

    // mobile hamburger
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = bar.classList.toggle('menu-open');
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        bar.classList.remove('is-hidden');
      });
    }

    // dropdown items: hover handled by CSS; click toggles on touch / small screens
    $$('.nav-item').forEach(function (item) {
      var link = $('.nav-link', item);
      if (!link || !$('.mega', item)) return;
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 920) {
          e.preventDefault();
          var was = item.classList.contains('is-open');
          $$('.nav-item').forEach(function (i) { i.classList.remove('is-open'); });
          item.classList.toggle('is-open', !was);
        }
      });
    });

    // desktop: hover bridge — 220ms close delay so cursor can cross
    // the ~30px gap between nav-link and mega dropdown without losing the menu
    if (window.innerWidth > 920) {
      var hoverTimer = null;
      $$('.nav-item').forEach(function (item) {
        var mega = $('.mega', item);
        if (!mega) return;

        item.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimer);
          item.classList.add('is-open');
        });

        item.addEventListener('mouseleave', function () {
          hoverTimer = setTimeout(function () {
            item.classList.remove('is-open');
          }, 220);
        });

        mega.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimer);
        });

        mega.addEventListener('mouseleave', function () {
          item.classList.remove('is-open');
        });
      });
    }

    // close menus on outside click / escape
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item')) $$('.nav-item').forEach(function (i){ i.classList.remove('is-open'); });
      if (!e.target.closest('.nav')) closeMobile();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobile(); });
    function closeMobile() {
      bar.classList.remove('menu-open');
      if (toggle) { toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    }

    // highlight current page in mega menu + top links
    var here = location.pathname.split('/').pop() || 'index.html';
    $$('.nav a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (href && href === here) {
        a.classList.add('is-current');
        var top = a.closest('.nav-item'); var topLink = top && $('.nav-link', top);
        if (topLink && topLink !== a) topLink.classList.add('is-current');
      }
    });
  }

  /* ── Scroll progress bar ───────────────────────────────────────────── */
  function scrollProgress() {
    var bar = $('.scroll-progress'); if (!bar) return;
    var ticking = false;
    function upd() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { raf(upd); ticking = true; } }, { passive: true });
    upd();
  }

  /* ── Scroll reveal (+ staggered groups) ────────────────────────────── */
  function reveal() {
    var els = $$('.reveal, .reveal-l, .reveal-r, .reveal-scale, [data-stagger]');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Animated number counters ──────────────────────────────────────── */
  function counters() {
    var nums = $$('[data-count]'); if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-decimals') || '0') | 0;
      var dur = 1400, start = null;
      if (REDUCED) { el.firstChild ? setText(el, target, dec) : (el.textContent = fmt(target, dec)); return; }
      function step(t) {
        if (start === null) start = t;
        var p = clamp((t - start) / dur, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        setText(el, target * eased, dec);
        if (p < 1) raf(step);
      }
      raf(step);
    }
    function fmt(v, dec){ return Number(v).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function setText(el, v, dec) {
      var unit = el.querySelector('.unit');
      el.childNodes[0] && el.childNodes[0].nodeType === 3
        ? (el.childNodes[0].nodeValue = fmt(v, dec))
        : (el.insertBefore(document.createTextNode(fmt(v, dec)), unit || null));
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ── Floating TOC island + scrollspy ───────────────────────────────── */
  function toc() {
    var box = $('.toc'); if (!box) return;
    var list = $('.toc__list', box);
    var rail = $('.toc__rail', box);
    var fill = $('.toc__progress i', box);
    var collapse = $('.toc__collapse', box);
    var mini = $('.toc-mini');
    var miniNow = mini && $('.now', mini);

    // gather sections: <section id> with [data-toc] label, plus optional h3[data-toc]
    var sections = $$('.content > section[id]');
    var links = []; // {a, id, el, lvl}
    sections.forEach(function (sec) {
      var a = list ? list.querySelector('a[href="#' + sec.id + '"]') : null;
      if (a) links.push({ a: a.closest('li'), link: a, el: sec, lvl: 1 });
      // sub-anchors
      $$('[data-toc-sub]', sec).forEach(function (h) {
        if (!h.id) return;
        var sa = list ? list.querySelector('a[href="#' + h.id + '"]') : null;
        if (sa) links.push({ a: sa.closest('li'), link: sa, el: h, lvl: 2 });
      });
    });

    // smooth scroll for clicks (both islands)
    function bindScroll(scope) {
      $$('a[href^="#"]', scope).forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href').slice(1);
          var t = document.getElementById(id);
          if (!t) return;
          e.preventDefault();
          var top = t.getBoundingClientRect().top + window.scrollY - 84;
          window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
          history.replaceState(null, '', '#' + id);
          if (mini) mini.classList.remove('open');
        });
      });
    }
    bindScroll(box); if (mini) bindScroll(mini);

    var current = -1;
    function setActive(i) {
      if (i === current) return; current = i;
      links.forEach(function (l, k) {
        l.a && l.a.classList.toggle('is-active', k === i);
      });
      // mirror to mini list by id
      if (mini && links[i]) {
        $$('li', mini).forEach(function (li) { li.classList.remove('is-active'); });
        var mLink = mini.querySelector('a[href="#' + (links[i].el.id) + '"]');
        if (mLink) mLink.closest('li').classList.add('is-active');
        if (miniNow) miniNow.textContent = (links[i].link.textContent || '').trim();
      }
      // move the rail to the active item
      if (rail && links[i] && links[i].a) {
        box.classList.add('has-active');
        var li = links[i].a, a = links[i].link;
        var lt = a.offsetTop, lh = a.offsetHeight;
        rail.style.height = lh + 'px';
        rail.style.transform = 'translateY(' + lt + 'px)';
      }
    }

    var ticking = false;
    function onScroll() {
      var probe = window.scrollY + 110;
      var idx = 0;
      for (var k = 0; k < links.length; k++) {
        if (links[k].el.getBoundingClientRect().top + window.scrollY - 4 <= probe) idx = k;
      }
      setActive(idx);
      // TOC reading progress over the whole content
      var content = $('.content');
      if (fill && content) {
        var r = content.getBoundingClientRect();
        var total = r.height - window.innerHeight * 0.5;
        var done = clamp((window.scrollY - (r.top + window.scrollY) + window.innerHeight * 0.5) / Math.max(total, 1), 0, 1);
        fill.style.width = (done * 100) + '%';
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { raf(onScroll); ticking = true; } }, { passive: true });
    window.addEventListener('resize', function () { current = -1; onScroll(); });
    onScroll();

    // collapse toggle (persist in this session)
    if (collapse) {
      if (sessionStorage.getItem('toc-collapsed') === '1') box.classList.add('is-collapsed');
      collapse.addEventListener('click', function () {
        var c = box.classList.toggle('is-collapsed');
        sessionStorage.setItem('toc-collapsed', c ? '1' : '0');
        collapse.setAttribute('aria-label', c ? 'Expand outline' : 'Collapse outline');
      });
    }
    // mobile mini toggle
    if (mini) {
      var bar = $('.toc-mini__bar', mini);
      bar && bar.addEventListener('click', function () { mini.classList.toggle('open'); });
    }
  }

  /* ── Hero load sequence ────────────────────────────────────────────── */
  function heroSequence() {
    var hero = $('.hero'); if (!hero) return;
    raf(function () { raf(function () { hero.classList.add('loaded'); }); });
  }

  /* ── Hero "detection lens" (cursor-follow reveal of hidden nematodes) ─ */
  function detectionLens() {
    var hero = $('.hero'); if (!hero) return;
    var lit = $('.hero__field--lit', hero);
    var lens = $('.hero__lens', hero);
    if (!lit && !lens) return;

    function setLens(px, py, r) {
      hero.style.setProperty('--lx', px + 'px');
      hero.style.setProperty('--ly', py + 'px');
      if (r) hero.style.setProperty('--lens-r', r + 'px');
    }

    var fine = window.matchMedia('(pointer:fine)').matches;
    if (fine && !REDUCED) {
      hero.classList.add('lens-on');
      var tx = 0, ty = 0, cx = innerWidth / 2, cy = innerHeight * 0.42, raf_on = false;
      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        tx = e.clientX - rect.left; ty = e.clientY - rect.top;
        if (!raf_on) { raf_on = true; raf(loop); }
      });
      hero.addEventListener('pointerleave', function () { hero.classList.remove('lens-on'); });
      hero.addEventListener('pointerenter', function () { hero.classList.add('lens-on'); });
      function loop() {
        cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
        setLens(Math.round(cx), Math.round(cy), 150);
        if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf(loop); else raf_on = false;
      }
      setLens(cx, cy, 150);
    } else if (!REDUCED) {
      // touch / coarse pointer: gentle auto-sweep so the effect is still discoverable
      hero.classList.add('lens-on');
      var t0 = null;
      (function sweep(t) {
        if (t0 === null) t0 = t;
        var e = (t - t0) / 4200;
        var w = hero.clientWidth, h = hero.clientHeight;
        setLens(w * (0.5 + 0.34 * Math.sin(e * 2)), h * (0.42 + 0.16 * Math.cos(e * 1.3)), 130);
        raf(sweep);
      })();
    }
  }

  /* ── Swimming nematode (rAF-driven undulating SVG ribbon) ───────────── */
  function swimmingNematode() {
    var host = $('.hero__worm'); if (!host || REDUCED) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var W = host.clientWidth, H = host.clientHeight;
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // soft glow + gradient
    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#9b7fe0"/><stop offset="1" stop-color="#e2a23c"/>' +
      '</linearGradient>' +
      '<filter id="wglow" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter></defs>';
    host.appendChild(svg);

    // two worms at different depths/speeds
    var worms = [
      makeWorm({ baseY: 0.74, len: 0.42, amp: 26, k: 0.016, speed: 0.9, w: 11, op: 0.5 }),
      makeWorm({ baseY: 0.86, len: 0.30, amp: 18, k: 0.022, speed: 1.35, w: 8, op: 0.32 })
    ];

    function makeWorm(cfg) {
      var p = document.createElementNS(svgNS, 'path');
      p.setAttribute('fill', 'url(#wg)');
      p.setAttribute('filter', 'url(#wglow)');
      p.setAttribute('opacity', cfg.op);
      svg.appendChild(p);
      var head = document.createElementNS(svgNS, 'circle');
      head.setAttribute('r', cfg.w * 0.62); head.setAttribute('fill', '#cdbfe8'); head.setAttribute('opacity', cfg.op);
      svg.appendChild(head);
      return { el: p, head: head, cfg: cfg, phase: Math.random() * 6 };
    }

    function build(worm, t) {
      var cfg = worm.cfg, N = 26;
      var span = W * cfg.len;
      var travel = (t * 0.05 * cfg.speed) % (W + span) - span; // moves left→right then wraps
      var baseY = H * cfg.baseY;
      var top = [], bot = [], hx = 0, hy = 0;
      for (var i = 0; i <= N; i++) {
        var f = i / N;
        var x = travel + f * span;
        var y = baseY + Math.sin(cfg.k * x * 8 - t * 0.004 * cfg.speed - worm.phase) * cfg.amp * (0.4 + 0.6 * Math.sin(f * Math.PI));
        // taper: thick near head (f=0), thin tail (f=1)
        var hw = cfg.w * (1 - f) * (0.5 + 0.5 * Math.sin(f * Math.PI)) + 0.6;
        // perpendicular (approx vertical body, normal ~ along y derivative)
        top.push((x).toFixed(1) + ',' + (y - hw).toFixed(1));
        bot.push((x).toFixed(1) + ',' + (y + hw).toFixed(1));
        if (i === 0) { hx = x; hy = y; }
      }
      var d = 'M' + top.join(' L') + ' L' + bot.reverse().join(' L') + ' Z';
      worm.el.setAttribute('d', d);
      worm.head.setAttribute('cx', hx); worm.head.setAttribute('cy', hy);
    }

    var t0 = null, alive = true;
    function frame(t) {
      if (!alive) return;
      if (t0 === null) t0 = t;
      var e = t - t0;
      worms.forEach(function (w) { build(w, e); });
      raf(frame);
    }
    raf(frame);

    window.addEventListener('resize', function () {
      W = host.clientWidth; H = host.clientHeight;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    });
    // pause when hero off-screen (perf)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !alive) { alive = true; t0 = null; raf(frame); }
          else if (!en.isIntersecting) { alive = false; }
        });
      }, { threshold: 0 }).observe(host);
    }
  }

  /* ── Generic parallax for [data-parallax] (depth via translateY) ───── */
  function parallax() {
    if (REDUCED) return;
    var items = $$('[data-parallax]'); if (!items.length) return;
    var ticking = false;
    function upd() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-center * speed).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { raf(upd); ticking = true; } }, { passive: true });
    upd();
  }

  /* ── Mascot helper (scroll-to-top + rotating field-notes) ──────────── */
  function mascot() {
    var fab = $('.mascot-fab'); if (!fab) return;
    var btn = $('.mascot-fab__btn', fab);
    var bubble = $('.mascot-fab__bubble', fab);
    var tips = [
      'Tip — tap the outline on the left to jump between sections.',
      'Every figure here is hosted on iGEM servers. No outside trackers.',
      'Looking for our parts? They live under <b>Project → Parts</b>.',
      'Back to the top? Just tap me.',
      'Two suspects: <b>H. glycines</b> &amp; <b>M. incognita</b>. We catch both.'
    ];
    var ti = 0, shown = false, timer;

    function showBubble() {
      if (!bubble) return;
      bubble.innerHTML = tips[ti % tips.length]; ti++;
      fab.classList.add('show-bubble'); shown = true;
      clearTimeout(timer); timer = setTimeout(hideBubble, 5200);
    }
    function hideBubble() { fab.classList.remove('show-bubble'); shown = false; }

    // reveal mascot only after some scrolling; cycle a tip occasionally
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      raf(function () {
        if (window.scrollY > 700 && !shown && Math.random() < 0.012) showBubble();
        ticking = false;
      });
    }, { passive: true });

    btn && btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
    btn && btn.addEventListener('mouseenter', showBubble);
    fab.addEventListener('mouseleave', function () { clearTimeout(timer); timer = setTimeout(hideBubble, 1200); });
  }
})();
