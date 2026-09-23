/* NKU iGEM 2026  -  article pages.
   Vanilla JS, no dependencies, no network. Loaded with `defer` after main.js.

   1  Glass capability test      5  Citation previews
   2  Top navigation            6  Figure zoom
   3  Outline scrollspy         7  Anchor offset
   4  Mobile outline
*/
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.body.classList.contains('page-article')) return;
  document.addEventListener('DOMContentLoaded', function () {
    glassSupport();
    topNav();
    outline();
    citationPreviews();
    figureZoom();
  });

  /* -- 1  Glass capability test ---------------------------------------------
     Chromium applies an SVG filter inside backdrop-filter; Safari and Firefox
     silently drop the whole declaration, which would leave the bar transparent.
     Feature-detect, then inject the filter only where it works.            */
  function glassSupport() {
    var ok = CSS.supports('backdrop-filter', 'url(#x) blur(4px)') ||
             CSS.supports('-webkit-backdrop-filter', 'url(#x) blur(4px)');
    if (!ok || REDUCED) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
    svg.innerHTML =
      '<filter id="lg-edge" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">' +
        '<feImage href="' + edgeMap() + '" result="map" preserveAspectRatio="none"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="26" ' +
          'xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>';
    document.body.appendChild(svg);
    document.documentElement.classList.add('is-chromium');
  }

  /* Displacement map: neutral (128,128) in the middle, pushed at the rim, so
     only the edges of a glass panel bend what is behind them. */
  function edgeMap() {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
        '<defs>' +
          '<linearGradient id="h" x1="0" x2="1"><stop offset="0" stop-color="#f00"/>' +
            '<stop offset="0.14" stop-color="#800"/><stop offset="0.86" stop-color="#800"/>' +
            '<stop offset="1" stop-color="#000"/></linearGradient>' +
          '<linearGradient id="v" y1="0" y2="1"><stop offset="0" stop-color="#0f0"/>' +
            '<stop offset="0.14" stop-color="#080"/><stop offset="0.86" stop-color="#080"/>' +
            '<stop offset="1" stop-color="#000"/></linearGradient>' +
        '</defs>' +
        '<rect width="200" height="200" fill="#808080"/>' +
        '<rect width="200" height="200" fill="url(#h)" style="mix-blend-mode:screen" opacity="0.5"/>' +
        '<rect width="200" height="200" fill="url(#v)" style="mix-blend-mode:screen" opacity="0.5"/>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* -- 2  Top navigation ----------------------------------------------------- */
  function topNav() {
    var shell = $('[data-gnav]'); if (!shell) return;
    var scrolling = false;
    function onScroll() {
      shell.classList.toggle('is-scrolled', window.scrollY > 6);
      scrolling = false;
    }
    window.addEventListener('scroll', function () {
      if (!scrolling) { scrolling = true; raf(onScroll); }
    }, { passive: true });
    onScroll();

    var items = $$('.gnav__item', shell);
    var sheetToggle = $('.gnav__menu-toggle', shell);
    var sheet = $('.gnav-sheet', shell);
    var openItem = null;
    var hoverTimer = null;
    var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    function panelOf(item) {
      var btn = $('.gnav__btn[aria-controls]', item);
      return btn ? document.getElementById(btn.getAttribute('aria-controls')) : null;
    }

    function setOpen(item, open) {
      var panel = panelOf(item), btn = $('.gnav__btn[aria-controls]', item);
      if (!panel || !btn) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.classList.toggle('is-open', open);
      if (open) {
        panel.hidden = false;
        raf(function () { panel.setAttribute('data-open', ''); });
        openItem = item;
      } else {
        panel.removeAttribute('data-open');
        if (openItem === item) openItem = null;
        window.setTimeout(function () {
          if (!panel.hasAttribute('data-open')) panel.hidden = true;
        }, REDUCED ? 0 : 190);
      }
    }

    function closeAll(except) {
      items.forEach(function (i) { if (i !== except) setOpen(i, false); });
      if (sheet && !sheet.hidden) closeSheet();
    }

    items.forEach(function (item) {
      var btn = $('.gnav__btn[aria-controls]', item);
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var open = item.classList.contains('is-open');
        closeAll(item);
        setOpen(item, !open);
      });
      if (canHover) {
        item.addEventListener('pointerenter', function () {
          window.clearTimeout(hoverTimer);
          closeAll(item);
          setOpen(item, true);
        });
        item.addEventListener('pointerleave', function () {
          hoverTimer = window.setTimeout(function () { setOpen(item, false); }, 220);
        });
        var panel = panelOf(item);
        if (panel) {
          panel.addEventListener('pointerenter', function () { window.clearTimeout(hoverTimer); });
          panel.addEventListener('pointerleave', function () {
            hoverTimer = window.setTimeout(function () { setOpen(item, false); }, 220);
          });
        }
      }
      item.addEventListener('focusout', function () {
        window.setTimeout(function () {
          if (!item.contains(document.activeElement) &&
              !(panelOf(item) || document.body).contains(document.activeElement)) setOpen(item, false);
        }, 0);
      });
    });

    function closeSheet() {
      if (!sheet) return;
      sheet.removeAttribute('data-open');
      sheetToggle.setAttribute('aria-expanded', 'false');
      window.setTimeout(function () {
        if (!sheet.hasAttribute('data-open')) sheet.hidden = true;
      }, REDUCED ? 0 : 210);
    }

    if (sheetToggle && sheet) {
      sheetToggle.addEventListener('click', function () {
        if (sheet.hidden) {
          closeAll();
          sheet.hidden = false;
          raf(function () { sheet.setAttribute('data-open', ''); });
          sheetToggle.setAttribute('aria-expanded', 'true');
        } else {
          closeSheet();
        }
      });
    }

    document.addEventListener('click', function (e) {
      if (!shell.contains(e.target)) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (openItem) {
        var btn = $('.gnav__btn', openItem);
        setOpen(openItem, false);
        btn && btn.focus();
      }
      closeAll();
    });
  }

  /* -- 3  Outline scrollspy -------------------------------------------------- */
  function outline() {
    var body = $('.art-body'); if (!body) return;
    var island = $('.atoc');
    var mini = $('.atoc-mini');
    var fill = island && $('.atoc__progress i', island);
    var miniNow = mini && $('.atoc-mini__now', mini);

    var targets = $$('section[id]', body).reduce(function (acc, sec) {
      acc.push(sec);
      return acc.concat($$('h3[id][data-toc-sub]', sec));
    }, []);
    if (!targets.length) return;

    function linksFor(id) {
      return $$('a[href="#' + CSS.escape(id) + '"]', island || document)
        .concat(mini ? $$('a[href="#' + CSS.escape(id) + '"]', mini) : []);
    }

    var entries = targets.map(function (el) {
      return { el: el, links: linksFor(el.id) };
    }).filter(function (e) { return e.links.length; });

    var current = -1;
    function setActive(i) {
      if (i === current) return;
      current = i;
      entries.forEach(function (entry, k) {
        entry.links.forEach(function (a) {
          var li = a.closest('li');
          if (li) li.classList.toggle('is-active', k === i);
        });
      });
      if (i >= 0) {
        var active = entries[i].links[0];
        if (miniNow) miniNow.textContent = active.textContent;
        // keep the active row visible inside a long outline
        if (island && island.scrollHeight > island.clientHeight) {
          var li = active.closest('li');
          if (li) {
            var top = li.offsetTop - island.clientHeight / 2;
            island.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
          }
        }
      }
    }

    var ticking = false;
    function onScroll() {
      var line = window.innerHeight * 0.3;
      var found = -1;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].el.getBoundingClientRect().top <= line) found = i;
      }
      setActive(found);
      if (fill) {
        var rect = body.getBoundingClientRect();
        var seen = Math.min(Math.max(-rect.top + window.innerHeight * 0.4, 0), rect.height);
        fill.style.width = (rect.height ? (seen / rect.height) * 100 : 0).toFixed(1) + '%';
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; raf(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', function () { current = -1; onScroll(); });
    onScroll();

    /* -- 4  Mobile outline: close the sheet after a jump */
    if (mini) {
      $$('a[href^="#"]', mini).forEach(function (a) {
        a.addEventListener('click', function () { mini.open = false; });
      });
    }
  }

  /* -- 5  Citation previews -------------------------------------------------- */
  function citationPreviews() {
    var cites = $$('a.cite[data-cite]');
    if (!cites.length) return;
    var pop = null, hideTimer = null;

    function refHTML(key) {
      var li = document.getElementById('bib-' + key);
      if (!li) return '';
      var clone = li.cloneNode(true);
      var back = clone.querySelector('.bib__back');
      if (back) back.remove();
      return clone.innerHTML.trim();
    }

    function show(link) {
      var html = refHTML(link.getAttribute('data-cite'));
      if (!html) return;
      window.clearTimeout(hideTimer);
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'cite-pop glass';
        pop.setAttribute('role', 'tooltip');
        document.body.appendChild(pop);
      }
      pop.innerHTML = html;
      pop.style.visibility = 'hidden';
      pop.removeAttribute('data-open');
      raf(function () {
        var r = link.getBoundingClientRect();
        var w = pop.offsetWidth, h = pop.offsetHeight;
        var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
        var above = r.top > h + 16;
        pop.style.left = (left + window.scrollX) + 'px';
        pop.style.top = ((above ? r.top - h - 10 : r.bottom + 10) + window.scrollY) + 'px';
        pop.style.visibility = '';
        pop.setAttribute('data-open', '');
      });
    }

    function hide() {
      hideTimer = window.setTimeout(function () {
        if (pop) pop.removeAttribute('data-open');
      }, 120);
    }

    cites.forEach(function (link) {
      link.addEventListener('pointerenter', function () { show(link); });
      link.addEventListener('pointerleave', hide);
      link.addEventListener('focus', function () { show(link); });
      link.addEventListener('blur', hide);
    });
    window.addEventListener('scroll', function () { if (pop) pop.removeAttribute('data-open'); }, { passive: true });
  }

  /* -- 6  Figure zoom -------------------------------------------------------- */
  function figureZoom() {
    var images = $$('.afig__media img[data-zoom]');
    if (!images.length) return;
    var overlay = null, lastFocus = null;

    function close() {
      if (!overlay) return;
      overlay.removeAttribute('data-open');
      var node = overlay;
      overlay = null;
      window.setTimeout(function () { node.remove(); }, REDUCED ? 0 : 210);
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    function open(img) {
      lastFocus = document.activeElement;
      overlay = document.createElement('div');
      overlay.className = 'zoomer';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', img.alt || 'Enlarged figure');
      var big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || '';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zoomer__close';
      btn.setAttribute('aria-label', 'Close');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      overlay.appendChild(big);
      overlay.appendChild(btn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      raf(function () { overlay.setAttribute('data-open', ''); });
      btn.focus();
      btn.addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target !== big) close(); });
    }

    images.forEach(function (img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { open(img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
})();
