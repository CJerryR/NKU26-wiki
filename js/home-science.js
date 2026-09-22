/* Decorative pathway enhancement only: the complete narrative is static HTML. */
(() => {
  'use strict';
  const init = () => {
    const root = document.querySelector('.home-science');
    if (!root) return;
    const steps = Array.from(root.querySelectorAll('[data-science-step]'));
    const play = root.querySelector('[data-science-play]');
    const status = root.querySelector('[data-science-announcement]');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timers = [];
    let observer;
    const clearTimers = () => { timers.forEach(window.clearTimeout); timers = []; };
    const lightAll = () => steps.forEach(step => step.classList.add('is-lit'));
    const finish = () => {
      lightAll();
      play.disabled = false;
      status.textContent = 'Proposed pathway: ascaroside input, receptor recognition, yeast relay and amplification, then intended betaxanthin colour. This illustration does not show an experimental result.';
    };
    if (!play || !status || !steps.length) return;
    play.hidden = false;
    if (motion.matches || !('IntersectionObserver' in window)) lightAll();
    else {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.add('is-lit');
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.45 });
      steps.forEach(step => observer.observe(step));
    }
    play.addEventListener('click', () => {
      clearTimers();
      if (observer) observer.disconnect();
      status.textContent = '';
      if (motion.matches) { finish(); return; }
      play.disabled = true;
      steps.forEach(step => step.classList.remove('is-lit'));
      steps.forEach((step, index) => timers.push(window.setTimeout(() => step.classList.add('is-lit'), index * 300 + 80)));
      timers.push(window.setTimeout(finish, steps.length * 300 + 80));
    });
    motion.addEventListener('change', () => {
      if (motion.matches) { clearTimers(); if (observer) observer.disconnect(); lightAll(); play.disabled = false; }
    });
    window.addEventListener('pagehide', clearTimers, { once: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
