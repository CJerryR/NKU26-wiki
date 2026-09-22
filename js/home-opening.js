/* Agent A. No scroll interception, map control, dependencies, or global CSS. */
(function () {
  'use strict';

  function initOpening() {
    var root = document.querySelector('#soil-exploration');
    if (!root || root.dataset.openingReady === 'true') return;
    var field = root.querySelector('[data-exploration-field]');
    var clues = Array.from(root.querySelectorAll('[data-opening-clue]'));
    var next = root.querySelector('[data-opening-next]');
    var status = root.querySelector('[data-opening-status]');
    var detail = root.querySelector('[data-opening-detail]');
    var progress = root.querySelector('[data-opening-progress]');
    var count = root.querySelector('[data-opening-count]');
    if (!field || clues.length !== 3 || !next || !status || !detail || !progress || !count) return;

    var state = 'idle';
    var found = new Set();
    var light = { x: 0.24, y: 0.50 };
    var frame = 0;
    var pendingPointer = null;
    var touchStart = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hints = [
      ['A chemical clue.', 'Follow the glow as it curves toward the roots.'],
      ['The trail continues.', 'Look a little farther to the right, among the roots.']
    ];

    function terminal() { return state === 'discovered' || state === 'skipped'; }
    function clamp(value) { return Math.max(0, Math.min(1, value)); }
    function isControl(target) { return target instanceof Element && !!target.closest('button, a'); }

    // Measurements are made when used, so scroll and responsive resizes cannot
    // leave pointer coordinates or discovery hit areas cached in the wrong place.
    function clueCenter(index) {
      var rect = field.getBoundingClientRect();
      var button = clues[index].getBoundingClientRect();
      return { x: (button.left + button.width / 2 - rect.left) / rect.width,
        y: (button.top + button.height / 2 - rect.top) / rect.height };
    }

    function setLight(point) {
      light = { x: clamp(point.x), y: clamp(point.y) };
      field.style.setProperty('--light-x', (light.x * 100).toFixed(3) + '%');
      field.style.setProperty('--light-y', (light.y * 100).toFixed(3) + '%');
    }

    function emit() {
      var bounds = root.getBoundingClientRect();
      var soil = field.getBoundingClientRect();
      root.dataset.explorationState = state;
      root.dataset.cluesFound = String(found.size);
      window.dispatchEvent(new CustomEvent('nku:exploration', { detail: {
        state: state, cluesFound: found.size, totalClues: 3,
        light: { x: clamp((soil.left - bounds.left + light.x * soil.width) / bounds.width),
          y: clamp((soil.top - bounds.top + light.y * soil.height) / bounds.height) }
      }}));
    }

    function begin() {
      if (state !== 'idle') return;
      state = 'exploring';
      emit();
    }

    function finish(newState) {
      if (terminal()) return;
      state = newState;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pendingPointer = null;
      touchStart = null;
      // Keep the guided button focusable after discovery, without moving focus
      // away from the control the visitor just used.
      next.setAttribute('aria-disabled', 'true');
      next.textContent = newState === 'discovered' ? 'Hidden visitor found ✓' : 'Exploration skipped';
      clues.forEach(function (button) { button.setAttribute('aria-disabled', 'true'); });
      if (newState === 'discovered') {
        setLight(clueCenter(2));
        status.textContent = 'Signal detected!';
        detail.textContent = 'You found an illustrated nematode near the roots. Where does its story lead?';
        root.querySelectorAll('[data-opening-continue]').forEach(function (label) { label.textContent = 'Continue the story'; });
        var topSkip = root.querySelector('.opening-skip');
        if (topSkip) topSkip.textContent = 'Continue the story ↗';
      } else {
        status.textContent = 'The story continues beneath our feet.';
        detail.textContent = 'Exploration is optional. Read on to see the wider context.';
      }
      emit();
    }

    function collect(index) {
      if (terminal() || found.has(index)) return;
      begin();
      found.add(index);
      clues[index].classList.add('is-collected');
      count.textContent = String(found.size);
      if (index === 2) {
        finish('discovered');
      } else {
        status.textContent = hints[index][0];
        detail.textContent = hints[index][1];
        emit();
      }
    }

    function inspect(point) {
      if (terminal()) return;
      setLight(point);
      begin();
      var rect = field.getBoundingClientRect();
      // Fixed illustrative targets; these distances are UI hit areas, never
      // chemical concentrations, sampling coordinates, or scientific thresholds.
      clues.forEach(function (_, index) {
        if (terminal()) return;
        var center = clueCenter(index);
        var dx = (light.x - center.x) * rect.width;
        var dy = (light.y - center.y) * rect.height;
        if (Math.hypot(dx, dy) <= (index === 2 ? 43 : 30)) collect(index);
      });
    }

    function pointerPoint(event) {
      var rect = field.getBoundingClientRect();
      return { x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height };
    }

    function flushPointer() {
      frame = 0;
      if (pendingPointer && !terminal()) inspect(pendingPointer);
      pendingPointer = null;
    }

    field.addEventListener('pointermove', function (event) {
      if (terminal() || event.pointerType === 'touch') return;
      pendingPointer = pointerPoint(event);
      if (reduced.matches) { flushPointer(); return; }
      if (!frame) frame = requestAnimationFrame(flushPointer);
    }, { passive: true });

    field.addEventListener('pointerdown', function (event) {
      if (terminal() || isControl(event.target)) return;
      touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }, { passive: true });
    field.addEventListener('pointerup', function (event) {
      if (!touchStart || touchStart.id !== event.pointerId) return;
      var moved = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
      touchStart = null;
      if (moved <= 12 && !isControl(event.target)) inspect(pointerPoint(event));
    }, { passive: true });
    field.addEventListener('pointercancel', function () { touchStart = null; }, { passive: true });
    field.addEventListener('pointerleave', function () {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pendingPointer = null;
      touchStart = null;
    }, { passive: true });

    clues.forEach(function (button, index) {
      button.disabled = false;
      button.addEventListener('click', function () {
        if (terminal()) return;
        setLight(clueCenter(index));
        collect(index);
      });
      button.addEventListener('focus', function () {
        if (!terminal()) setLight(clueCenter(index));
      });
    });

    next.addEventListener('click', function () {
      if (terminal()) return;
      var index = clues.findIndex(function (_, i) { return !found.has(i); });
      if (index < 0) return;
      setLight(clueCenter(index));
      collect(index);
    });

    root.querySelectorAll('[data-exploration-skip]').forEach(function (link) {
      link.addEventListener('click', function () {
        // The native href handles navigation. There is deliberately no preventDefault.
        if (!terminal()) finish('skipped');
      });
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        root.dataset.offscreen = String(!entries[0].isIntersecting);
      });
      observer.observe(field);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        pendingPointer = null;
        root.dataset.offscreen = 'true';
      } else {
        var rect = field.getBoundingClientRect();
        root.dataset.offscreen = String(rect.bottom <= 0 || rect.top >= window.innerHeight);
      }
    });

    root.dataset.openingReady = 'true';
    root.dataset.cluesFound = '0';
    root.classList.add('is-ready');
    next.hidden = false;
    progress.hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOpening, { once: true });
  else initOpening();
})();
