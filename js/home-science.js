/* Decorative pathway enhancement only: the complete narrative is static HTML. */
(() => {
  'use strict';
  const init = () => {
    const root = document.querySelector('.home-science');
    if (!root) return;
    const steps = Array.from(root.querySelectorAll('[data-science-step]'));
    const play = root.querySelector('[data-science-play]');
    const status = root.querySelector('[data-science-announcement]');
    const threatStatus = root.querySelector('[data-threat-stage-status]');
    const threatTriggers = Array.from(root.querySelectorAll('[data-threat-trigger]'));
    const threatItems = Array.from(root.querySelectorAll('[data-threat-stage]'));
    const pairToggle = root.querySelector('[data-science-pair-toggle]');
    const pairFeedback = root.querySelector('[data-science-pair-feedback]');
    const pairFigure = root.querySelector('.science-signal-pair');
    const networkNodes = Array.from(root.querySelectorAll('[data-network-node]'));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timers = [];
    let observer;
    const clearTimers = () => { timers.forEach(window.clearTimeout); timers = []; };
    const lightAll = () => steps.forEach(step => step.classList.add('is-lit'));
    const finish = () => {
      lightAll();
      play.disabled = false;
      status.textContent = 'Proposed five-step pathway: ascaroside input, receptor recognition, engineered yeast, signal amplification, then intended betaxanthin colour. This illustration does not show an experimental result.';
    };
    if (!play || !status || !steps.length) return;

    const threatCopy = {
      host: 'Stage 1 of 4 · Finding a host. Select another scene to follow the sequence.',
      signals: 'Stage 2 of 4 · Leaving chemical clues. ascr#3 and ascr#18 are project signals of interest, not a measured result.',
      roots: 'Stage 3 of 4 · Entering the roots. This is a simplified story illustration, not a microscopy claim.',
      symptoms: 'Stage 4 of 4 · Symptoms reach the surface. Visible effects remain a project story to investigate.'
    };
    const setThreatStage = key => {
      threatItems.forEach(item => item.classList.toggle('is-active', item.dataset.threatStage === key));
      threatTriggers.forEach(trigger => trigger.setAttribute('aria-pressed', String(trigger.dataset.threatTrigger === key)));
      if (threatStatus && threatCopy[key]) threatStatus.textContent = threatCopy[key];
    };
    threatTriggers.forEach(trigger => trigger.addEventListener('click', () => setThreatStage(trigger.dataset.threatTrigger)));

    if (pairToggle && pairFigure && pairFeedback) {
      pairToggle.addEventListener('click', () => {
        const active = pairFigure.classList.toggle('is-combined');
        pairToggle.setAttribute('aria-pressed', String(active));
        pairToggle.firstChild.textContent = active ? 'Separate the pair ' : 'Compare the pair ';
        pairFeedback.textContent = active
          ? 'Illustrative hypothesis: reading both signals together could provide a richer clue. The relationship still requires testing.'
          : 'Select “Compare the pair” to see the project hypothesis visualised.';
      });
    }
    networkNodes.forEach(node => {
      node.setAttribute('tabindex', '0');
      node.addEventListener('focus', () => node.classList.add('is-highlighted'));
      node.addEventListener('blur', () => node.classList.remove('is-highlighted'));
      node.addEventListener('mouseenter', () => node.classList.add('is-highlighted'));
      node.addEventListener('mouseleave', () => node.classList.remove('is-highlighted'));
    });
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
