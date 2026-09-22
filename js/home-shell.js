/* Agent0 exclusively owns the opening → world-map transition. */
(function () {
  'use strict';
  function init() {
    if (!document.body.classList.contains('page-home')) return;
    var section = document.getElementById('global-story');
    var heading = document.getElementById('global-story-title');
    var map = section && section.querySelector('[data-world-map]');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mask, frame = 0, revealed = false;
    var clamp = function(v) { return Math.max(0, Math.min(1, v)); };

    function removeMask() {
      if (mask) mask.remove();
      mask = null;
      if (section) section.classList.remove('home-global-light-active');
    }
    function updateLight() {
      frame = 0;
      if (!section || !heading || !map || reduced.matches || revealed) { removeMask(); return; }
      var box = section.getBoundingClientRect();
      if (box.top < 90 || window.location.hash === '#global-story') {
        revealed = true; removeMask(); return;
      }
      if (box.top > window.innerHeight + 180) return;
      if (!mask) {
        mask = document.createElement('div');
        mask.className = 'home-light-mask';
        mask.setAttribute('aria-hidden', 'true');
        section.appendChild(mask);
        section.classList.add('home-global-light-active');
      }
      var titleBox = heading.getBoundingClientRect();
      var mapBox = map.getBoundingClientRect();
      var progress = clamp((window.innerHeight * .84 - box.top) / (window.innerHeight * .7));
      var eased = progress * progress * (3 - 2 * progress);
      var initialX = titleBox.left - box.left + Math.min(titleBox.width, 360) / 2;
      var initialY = titleBox.top - box.top + titleBox.height / 2;
      var targetX = mapBox.left - box.left + mapBox.width / 2;
      var targetY = mapBox.top - box.top + mapBox.height / 2;
      var radius = 135 + eased * Math.hypot(box.width, box.height);
      mask.style.setProperty('--light-x', (initialX + (targetX - initialX) * eased) + 'px');
      mask.style.setProperty('--light-y', (initialY + (targetY - initialY) * eased) + 'px');
      mask.style.setProperty('--light-r', radius + 'px');
      mask.style.setProperty('--light-opacity', String(1 - clamp((progress - .72) / .28)));
      if (progress >= .99) { revealed = true; removeMask(); }
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(updateLight); }
    if (section && heading && map) {
      window.addEventListener('scroll', schedule, {passive:true});
      window.addEventListener('resize', schedule, {passive:true});
      section.addEventListener('focusin', function () { revealed = true; removeMask(); });
      reduced.addEventListener('change', schedule);
      schedule();
    }

    window.addEventListener('nku:exploration', function (event) {
      var detail = event.detail || {};
      if (!['idle','exploring','discovered','skipped'].includes(detail.state)) return;
      document.body.dataset.explorationState = detail.state;
      var mascot = document.querySelector('.home-detective');
      if (mascot) mascot.dataset.explorationState = detail.state;
    });
    // Native anchor navigation always remains available, including without JS.
    window.addEventListener('hashchange', function () {
      if (window.location.hash === '#global-story' || window.location.hash === '#china-story') {
        revealed = true; removeMask();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
