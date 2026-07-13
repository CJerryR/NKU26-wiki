/* ============================================================================
   NKU iGEM 2026  -  interaction & animation engine  (vanilla JS, no dependencies)
   All effects degrade gracefully and honour prefers-reduced-motion.
   Modules: nav  /  scroll-progress  /  reveal  /  counters  /  TOC scrollspy  /
            hero detection-lens  /  evidence map  /  parallax  /  mascot helper
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
    siteSearch();
    heroSequence();
    detectionLens();
    evidenceMap();
    heroScrollTransition();
    swimmingNematode();
    parallax();
    magnetic();
    cardSpotlight();
    mascot();
  }

  /* -- Global wiki search --------------------------------------------- */
  function siteSearch() {
    var modal = $('#site-search'); if (!modal) return;
    var input = $('[data-search-input]', modal);
    var results = $('[data-search-results]', modal);
    var meta = $('[data-search-meta]', modal);
    var closeButtons = $$('[data-search-close]', modal);
    var openButtons = $$('[data-search-open]');
    var rawIndex = window.NKU_SEARCH_INDEX || [];
    var lastFocus = null;

    function norm(text) {
      return (text || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function escapeHTML(text) {
      return (text || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function terms(query) {
      return norm(query).split(' ').filter(function (term) { return term.length > 0; }).slice(0, 8);
    }

    function searchText(item) {
      var sectionText = (item.sections || []).map(function (sec) {
        return [sec.title, sec.text].join(' ');
      }).join(' ');
      return norm([item.title, item.crumbs, item.desc, item.text, sectionText].join(' '));
    }

    function flattenIndex() {
      var out = [];
      var prefix = document.body ? (document.body.getAttribute('data-path-prefix') || '') : '';
      function localUrl(url) {
        url = url || '#';
        return url.charAt(0) === '#' || /^(https?:|mailto:|tel:)/i.test(url) ? url : prefix + url;
      }
      rawIndex.forEach(function (item) {
        var crumbs = Array.isArray(item.crumbs) ? item.crumbs.join(' / ') : (item.crumbs || 'Wiki page');
        var pageText = searchText(item);
        out.push({
          title: item.title || 'Untitled',
          label: crumbs,
          url: localUrl(item.url),
          text: item.text || item.desc || '',
          haystack: pageText,
          weight: 36
        });
        (item.sections || []).forEach(function (sec) {
          out.push({
            title: sec.title || item.title || 'Section',
            label: (item.title || 'Wiki page') + ' / section',
            url: localUrl(sec.url || item.url),
            text: sec.text || item.text || item.desc || '',
            haystack: norm([item.title, item.crumbs, sec.title, sec.text].join(' ')),
            weight: 20
          });
        });
      });
      return out;
    }

    var candidates = flattenIndex();

    function score(candidate, qTerms) {
      if (!qTerms.length) return -1;
      var scoreValue = 0;
      var title = norm(candidate.title);
      var label = norm(candidate.label);
      for (var i = 0; i < qTerms.length; i++) {
        var term = qTerms[i];
        if (candidate.haystack.indexOf(term) === -1) return -1;
        scoreValue += 6;
        if (title.indexOf(term) > -1) scoreValue += candidate.weight;
        if (label.indexOf(term) > -1) scoreValue += 10;
        var textPos = norm(candidate.text).indexOf(term);
        if (textPos > -1) scoreValue += Math.max(1, 14 - Math.floor(textPos / 140));
      }
      return scoreValue;
    }

    function snippet(text, qTerms) {
      var clean = (text || '').toString().replace(/\s+/g, ' ').trim();
      if (!clean) return 'Open this page for details.';
      var lower = clean.toLowerCase();
      var pos = -1;
      for (var i = 0; i < qTerms.length; i++) {
        pos = lower.indexOf(qTerms[i]);
        if (pos > -1) break;
      }
      var start = pos > 72 ? pos - 72 : 0;
      var end = Math.min(clean.length, start + 190);
      var cut = (start > 0 ? '...' : '') + clean.slice(start, end) + (end < clean.length ? '...' : '');
      return highlight(cut, qTerms);
    }

    function highlight(text, qTerms) {
      var safe = escapeHTML(text);
      if (!qTerms.length) return safe;
      var parts = qTerms
        .filter(function (term) { return term.length > 1 || /^[a-z0-9]$/i.test(term); })
        .map(function (term) { return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
      if (!parts.length) return safe;
      return safe.replace(new RegExp('(' + parts.join('|') + ')', 'ig'), '<mark>$1</mark>');
    }

    function render(query) {
      var qTerms = terms(query);
      if (!qTerms.length) {
        results.innerHTML = '<div class="site-search__empty">Search by project page, experiment, target species, or any phrase from the article body.</div>';
        if (meta) meta.textContent = candidates.length ? 'Ready to search ' + rawIndex.length + ' pages.' : 'Search index is not loaded yet.';
        return;
      }
      var found = candidates.map(function (candidate) {
        return { item: candidate, score: score(candidate, qTerms) };
      }).filter(function (hit) {
        return hit.score >= 0;
      }).sort(function (a, b) {
        return b.score - a.score;
      }).slice(0, 9);

      if (meta) meta.textContent = found.length ? found.length + ' result' + (found.length === 1 ? '' : 's') + ' for "' + query + '".' : 'No results for "' + query + '".';
      if (!found.length) {
        results.innerHTML = '<div class="site-search__empty">No matching page yet. Try a broader term or check spelling.</div>';
        return;
      }
      results.innerHTML = found.map(function (hit) {
        var item = hit.item;
        return '<a class="site-search__result" href="' + escapeHTML(item.url) + '">' +
          '<span>' + escapeHTML(item.label) + '</span>' +
          '<b>' + highlight(item.title, qTerms) + '</b>' +
          '<p>' + snippet(item.text, qTerms) + '</p>' +
        '</a>';
      }).join('');
    }

    function openSearch() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.documentElement.classList.add('search-open');
      raf(function () { modal.classList.add('is-open'); });
      if (input) {
        input.focus();
        input.select();
        render(input.value);
      }
    }

    function closeSearch() {
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('search-open');
      setTimeout(function () { modal.hidden = true; }, 180);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openButtons.forEach(function (button) {
      button.addEventListener('click', openSearch);
    });
    closeButtons.forEach(function (button) {
      button.addEventListener('click', closeSearch);
    });
    if (input) input.addEventListener('input', function () { render(input.value); });
    modal.addEventListener('click', function (e) {
      if (e.target.closest('.site-search__result')) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'Escape' && !modal.hidden) {
        closeSearch();
      }
    });
    render('');
  }

  /* -- Navigation ------------------------------------------------------ */
  function nav() {
    var bar = $('.nav'); if (!bar) return;
    var toggle = $('.nav-toggle');
    var last = window.scrollY, ticking = false;
    var hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 981px)');
    var hoverCloseTimer = null;

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

    function closeDropdowns(except) {
      if (hoverCloseTimer) {
        clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
      }
      $$('.nav-item').forEach(function (i) {
        if (except && i === except) return;
        i.classList.remove('is-open');
        delete i.dataset.openMode;
        var trigger = $('.nav-link[aria-haspopup="true"]', i);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }

    function setDropdown(item, open, mode) {
      var trigger = $('.nav-link[aria-haspopup="true"]', item);
      if (open) closeDropdowns(item);
      item.classList.toggle('is-open', open);
      if (open) item.dataset.openMode = mode || 'click';
      else delete item.dataset.openMode;
      if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function scheduleHoverClose(item) {
      if (item.dataset.openMode !== 'hover') return;
      if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
      hoverCloseTimer = setTimeout(function () {
        setDropdown(item, false);
        hoverCloseTimer = null;
      }, 180);
    }

    // dropdown items: hover, click and keyboard all use the same open state
    $$('.nav-item').forEach(function (item) {
      var link = $('.nav-link', item);
      if (!link || !$('.mega', item)) return;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var stickyOpen = item.classList.contains('is-open') && item.dataset.openMode === 'click';
        setDropdown(item, !stickyOpen, 'click');
      });
      item.addEventListener('pointerenter', function () {
        if (!hoverQuery.matches) return;
        if (hoverCloseTimer) {
          clearTimeout(hoverCloseTimer);
          hoverCloseTimer = null;
        }
        if (item.dataset.openMode !== 'click') setDropdown(item, true, 'hover');
      });
      item.addEventListener('pointerleave', function () {
        if (!hoverQuery.matches) return;
        scheduleHoverClose(item);
      });
      link.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setDropdown(item, true, 'focus');
          var first = $('.mega a', item);
          if (first) first.focus();
        } else if (e.key === 'Escape') {
          setDropdown(item, false);
          link.focus();
        }
      });
      item.addEventListener('focusout', function () {
        setTimeout(function () {
          if (!item.contains(document.activeElement)) setDropdown(item, false);
        }, 0);
      });
    });

    // close menus on outside click / escape
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item')) closeDropdowns();
      if (!e.target.closest('.nav')) closeMobile();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDropdowns(); closeMobile(); } });
    function closeMobile() {
      bar.classList.remove('menu-open');
      if (toggle) { toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
      closeDropdowns();
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

  /* -- Scroll progress bar --------------------------------------------- */
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

  /* -- Scroll reveal (+ staggered groups) ------------------------------ */
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

  /* -- Animated number counters ---------------------------------------- */
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

  /* -- Floating TOC island + scrollspy --------------------------------- */
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
      bar && bar.addEventListener('click', function () {
        var open = mini.classList.toggle('open');
        bar.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  /* -- Hero load sequence ---------------------------------------------- */
  function heroSequence() {
    var hero = $('.hero'); if (!hero) return;
    if (REDUCED) { hero.classList.add('loaded', 'title-done'); return; }
    raf(function () { raf(function () { hero.classList.add('loaded'); }); });
    // once the title slide-up finishes, let descenders overflow freely
    setTimeout(function () { hero.classList.add('title-done'); }, 1650);
  }

  /* -- Magnetic buttons (subtle pull toward cursor) -------------------- */
  function magnetic() {
    if (REDUCED || !window.matchMedia('(pointer:fine)').matches) return;
    $$('.btn--primary, .btn--iris, .mascot-fab__btn').forEach(function (el) {
      var strength = el.classList.contains('mascot-fab__btn') ? 0.4 : 0.28;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (mx * strength).toFixed(1) + 'px,' + (my * strength).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* -- Card cursor-spotlight (sets --mx/--my for the radial glow) ------- */
  function cardSpotlight() {
    if (REDUCED) return;
    var ticking = false;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card');
      if (!card || ticking) return;
      ticking = true;
      raf(function () {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        ticking = false;
      });
    }, { passive: true });
  }

  /* -- Hero "detection lens" (cursor-follow reveal of hidden nematodes) - */
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
      // start parked over the radar on the right; only reveal once the cursor moves in
      var tx = innerWidth * 0.8, ty = innerHeight * 0.46, cx = tx, cy = ty, raf_on = false, woke = false;
      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        tx = e.clientX - rect.left; ty = e.clientY - rect.top;
        if (!woke) { woke = true; hero.classList.add('lens-on'); }
        if (!raf_on) { raf_on = true; raf(loop); }
      });
      hero.addEventListener('pointerleave', function () { hero.classList.remove('lens-on'); });
      hero.addEventListener('pointerenter', function () { if (woke) hero.classList.add('lens-on'); });
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

  /* -- Hero evidence map (pin highlight + route progress) ------------- */
  function evidenceMap() {
    var map = $('.hero-map'); if (!map) return;
    var core = $('.soil-core', map);
    var pins = $$('[data-evidence-pin]', map);
    if (!core || !pins.length) return;

    function setActive(pin) {
      pins.forEach(function (p) { p.classList.toggle('is-lit', p === pin); });
      if (!pin) return;
      map.dataset.activePin = pin.className.indexOf('target') > -1 ? 'target' :
        pin.className.indexOf('readout') > -1 ? 'readout' : 'sample';
      map.style.setProperty('--route-glow-y', pin.getAttribute('data-route-y') || '18%');
    }

    var sample = pins[0];
    var target = pins[1] || sample;
    var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    if (REDUCED || !fine) {
      map.classList.add('is-static');
      pins.forEach(function (pin) { pin.classList.add('is-lit'); });
      map.dataset.activePin = 'readout';
      map.style.setProperty('--route-glow-y', (pins[pins.length - 1] || target).getAttribute('data-route-y') || '78%');
      return;
    }

    setActive(sample);
    var ticking = false;
    var pointer = { x: 0, y: 0 };

    function nearestPin() {
      var best = sample, bestDist = Infinity;
      pins.forEach(function (pin) {
        var r = pin.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = pointer.x - cx;
        var dy = pointer.y - cy;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) { bestDist = d; best = pin; }
      });
      setActive(best);
      ticking = false;
    }

    function onMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!ticking) { ticking = true; raf(nearestPin); }
    }

    function onLeave() {
      setActive(sample);
    }

    core.addEventListener('pointermove', onMove, { passive: true });
    core.addEventListener('mousemove', onMove, { passive: true });
    core.addEventListener('pointerleave', onLeave, { passive: true });
    core.addEventListener('mouseleave', onLeave, { passive: true });
  }

  /* -- Hero scroll transition (dark soil -> pale case file) ------------ */
  function heroScrollTransition() {
    var hero = $('.hero'); if (!hero) return;
    if (REDUCED) {
      hero.style.setProperty('--hero-scroll', '0');
      hero.style.setProperty('--hero-map-y', '0px');
      hero.style.setProperty('--hero-map-opacity', '1');
      return;
    }

    var ticking = false;
    function update() {
      var r = hero.getBoundingClientRect();
      var p = clamp((-r.top) / Math.max(r.height * 0.58, 1), 0, 1);
      hero.style.setProperty('--hero-scroll', p.toFixed(3));
      hero.style.setProperty('--hero-map-y', (-p * 18).toFixed(1) + 'px');
      hero.style.setProperty('--hero-map-opacity', (1 - p * 0.18).toFixed(3));
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (!ticking) { ticking = true; raf(update); }
    });
    update();
  }

  /* -- Swimming nematode (rAF-driven undulating SVG ribbon) ------------- */
  function swimmingNematode() {
    var host = $('.hero__worm'); if (!host || REDUCED) return;
    if ($('.hero-map')) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var W = host.clientWidth, H = host.clientHeight;
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // soft glow + gradient
    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#6e4fb8"/><stop offset="0.7" stop-color="#9b7fe0"/><stop offset="1" stop-color="#c9a96a"/>' +
      '</linearGradient>' +
      '<filter id="wglow" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter></defs>';
    host.appendChild(svg);

    // two worms at different depths/speeds  -  kept subtle & ambient
    var worms = [
      makeWorm({ baseY: 0.72, len: 0.40, amp: 22, k: 0.016, speed: 0.85, w: 10, op: 0.3 }),
      makeWorm({ baseY: 0.88, len: 0.28, amp: 15, k: 0.022, speed: 1.3, w: 7, op: 0.16 })
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
      var travel = (t * 0.05 * cfg.speed) % (W + span) - span; // moves left -> right then wraps
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

  /* -- Generic parallax for [data-parallax] (depth via translateY) ----- */
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

  /* -- Mascot helper (scroll-to-top + rotating field-notes) ------------ */
  function mascot() {
    var fab = $('.mascot-fab'); if (!fab) return;
    var btn = $('.mascot-fab__btn', fab);
    var bubble = $('.mascot-fab__bubble', fab);
    var tips = [
      'Tip  -  tap the outline on the left to jump between sections.',
      'Every figure here is hosted on iGEM servers. No outside trackers.',
      'Looking for our parts? They live under <b>Project  ->  Parts</b>.',
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
