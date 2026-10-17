/**
 * "Our work: dry lab and wet lab" — the :::workflow block on the Description page.
 * The signal runs through the ten steps once when the figure scrolls into view;
 * the four tabs replay one chapter; pointing at a step opens its note.
 * Ported from the home page's labFlow (static/js/home-story.js); markup is
 * src/figures/our-work.html, styles are src/styles/workflow.css.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const one = <T extends Element>(s: string, r: ParentNode) => r.querySelector(s) as T;
const all = <T extends Element>(s: string, r: ParentNode) => Array.from(r.querySelectorAll(s)) as T[];

const NOTES: Record<string, [string, string, string]> = {
  '1': ['Wet lab', 'A fungus that hunts nematodes', 'Arthrobotrys oligospora catches the nematodes around it.'],
  '2': ['Wet lab', 'A receptor for their signal', 'In this fungus we found a receptor that recognizes ascarosides, the chemicals nematodes release.'],
  '3': ['Dry lab', 'Redesigning the receptor', 'We took the receptor out and designed variants of it.'],
  '4': ['Dry lab', 'Screening on the computer', 'Molecular docking and molecular dynamics keep the variants that recognize ascr#3 and ascr#18.'],
  '5': ['Wet lab', 'Into yeast', 'The modified gene goes into yeast, so the yeast carries the receptor and can recognize ascarosides.'],
  '6': ['Wet lab', 'From signal to pigment genes', 'The receptor is coupled to the yeast\u2019s own signaling pathway, which switches on the genes that make betaxanthin.'],
  '7': ['Wet lab', 'The medium turns yellow', 'Betaxanthin builds up inside and outside the cells and changes the color of the culture.'],
  '8': ['Wet lab', 'Reading the color', 'OD and RGB measurements of the medium give the pigment concentration.'],
  '9': ['Dry lab', 'From color to nematodes', 'How the receptor responds links pigment to the ascaroside level around it, and so to nematode activity. A lumped model writes this down.'],
  '10': ['Dry lab', 'Eco model', 'The estimated abundance of harmful nematodes goes into a model that weighs the economic impact and suggests what to do.'],
};
const CH_STOPS: Record<number, string[]> = { 1: ['1', '2'], 2: ['3', '4'], 3: ['5', '6', '7', '8'], 4: ['9', '10'] };

function init(root: HTMLElement): void {
  const svg = one<SVGSVGElement>('[data-lf-svg]', root), stage = one<HTMLElement>('[data-lf-stage]', root), card = one<HTMLElement>('[data-lf-card]', root);
  const dot = one<SVGGElement>('[data-lf-dot]', root), tabs = all<HTMLElement>('[data-lf-tab]', root), replay = one<HTMLElement>('[data-lf-replay]', root);
  if (!svg || !stage || !card || !dot) return;

  const stops: Record<string, SVGGElement> = {};
  all<SVGGElement>('.lf-stop', svg).forEach((g) => { stops[g.getAttribute('data-k') || ''] = g; });
  // each step reacts anywhere over its drawing, not only on painted strokes
  Object.keys(stops).forEach((k) => {
    const g = stops[k], b = g.getBBox(), r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('class', 'lf-hit'); r.setAttribute('rx', '14');
    r.setAttribute('x', (b.x - 10).toFixed(1)); r.setAttribute('y', (b.y - 10).toFixed(1));
    r.setAttribute('width', (b.width + 20).toFixed(1)); r.setAttribute('height', (b.height + 20).toFixed(1));
    g.insertBefore(r, g.firstChild);
  });
  const arrows = all<SVGPathElement>('.lf-arrow', svg).map((p) => {
    p.setAttribute('pathLength', '1');
    const c = p.classList.contains('lf-arrow--gold') ? '#e9a90e' : p.classList.contains('lf-arrow--dry') ? '#7b62ad' : '#6ff3de';
    return { el: p, len: p.getTotalLength(), to: p.getAttribute('data-to') || '', ch: +(p.getAttribute('data-ch') || 0), color: c };
  });

  let raf = 0, timers: number[] = [], played = false, running = false;
  const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
  const stopAll = () => { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; running = false; dot.classList.remove('is-on'); };
  const setTab = (c: number) => {
    tabs.forEach((t) => t.setAttribute('aria-pressed', +(t.getAttribute('data-lf-tab') || 0) === c ? 'true' : 'false'));
    if (c) svg.setAttribute('data-ch', String(c)); else svg.removeAttribute('data-ch');
  };
  const lit = (k: string) => { stops[k]?.classList.add('is-lit'); };
  // the finished picture: every arrow drawn, every step on, no chapter picked
  const final = () => {
    stopAll(); played = true;
    svg.classList.remove('is-pre');
    arrows.forEach((a) => { a.el.classList.add('is-drawn'); a.el.style.strokeDashoffset = ''; });
    Object.keys(stops).forEach(lit);
    setTab(0);
  };
  const pre = () => {
    stopAll();
    svg.classList.add('is-pre');
    arrows.forEach((a) => { a.el.classList.remove('is-drawn'); a.el.style.strokeDashoffset = '1'; });
    Object.keys(stops).forEach((k) => stops[k].classList.remove('is-lit'));
  };
  // run the signal along a list of arrows, one after the other
  const travel = (list: typeof arrows, done?: () => void) => {
    let i = 0;
    const next = () => {
      if (i >= list.length) { dot.classList.remove('is-on'); done?.(); return; }
      const a = list[i++], dur = clamp(a.len * 2.4, 420, 1150), t0 = performance.now();
      dot.style.color = a.color; dot.classList.add('is-on');
      const f = (now: number) => {
        const k = clamp((now - t0) / dur, 0, 1), e = ease(k), p = a.el.getPointAtLength(e * a.len);
        dot.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        if (svg.classList.contains('is-pre')) a.el.style.strokeDashoffset = String(1 - e);
        if (k < 1) { raf = requestAnimationFrame(f); return; }
        a.el.classList.add('is-drawn'); lit(a.to);
        raf = 0; later(next, 140);
      };
      f(t0);
    };
    next();
  };
  const chapter = (c: number, done?: () => void) => {
    setTab(c); lit(CH_STOPS[c][0]);
    later(() => travel(arrows.filter((a) => a.ch === c), () => later(done || (() => {}), 700)), 380);
  };
  // the full story, once
  const run = () => {
    if (reduced) { final(); return; }
    pre(); played = true; running = true;
    let c = 1;
    const next = () => { if (c > 4) { final(); return; } chapter(c++, next); };
    next();
  };
  // a tab replays its own chapter over the finished picture
  const focusChapter = (c: number) => {
    final();
    if (reduced) { setTab(c); return; }
    running = true;
    chapter(c, () => { running = false; });
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    const c = +(t.getAttribute('data-lf-tab') || 0);
    if (t.getAttribute('aria-pressed') === 'true' && !running) { setTab(0); return; }
    focusChapter(c);
  }));
  replay?.addEventListener('click', run);

  // notes on the steps
  const showNote = (g: SVGGElement) => {
    const k = g.getAttribute('data-k') || '', n = NOTES[k]; if (!n) return;
    svg.classList.add('is-hover'); all('.lf-stop.is-hot', svg).forEach((s) => s.classList.remove('is-hot')); g.classList.add('is-hot');
    card.innerHTML = `<span class="lf-card__k">${n[0]}, step ${k}</span><b>${n[1]}</b><p>${n[2]}</p>`;
    card.classList.toggle('is-dry', n[0] === 'Dry lab');
    card.classList.toggle('is-below', g.hasAttribute('data-below'));
    card.hidden = false;
    // On phones the SVG is wider than its scrollable stage. Map its anchor
    // through the rendered SVG matrix so notes still point to the right step.
    const sw = stage.clientWidth, sh = stage.clientHeight, bounds = stage.getBoundingClientRect();
    const point = svg.createSVGPoint();
    point.x = +(g.getAttribute('data-ax') || 0); point.y = +(g.getAttribute('data-ay') || 0);
    const matrix = svg.getScreenCTM(); if (!matrix) return;
    const anchor = point.matrixTransform(matrix), half = card.offsetWidth / 2 + 10;
    const x = anchor.x - bounds.left + stage.scrollLeft, y = anchor.y - bounds.top + stage.scrollTop;
    card.style.left = clamp(x, stage.scrollLeft + half, stage.scrollLeft + sw - half).toFixed(1) + 'px';
    card.style.top = Math.min(y, sh - 12).toFixed(1) + 'px';
  };
  const hideNote = () => { svg.classList.remove('is-hover'); all('.lf-stop.is-hot', svg).forEach((s) => s.classList.remove('is-hot')); card.hidden = true; };
  stage.addEventListener('scroll', hideNote, { passive: true });
  window.addEventListener('resize', hideNote);
  Object.keys(stops).forEach((k) => {
    const g = stops[k];
    g.addEventListener('pointerenter', () => showNote(g));
    g.addEventListener('pointerleave', hideNote);
    g.addEventListener('focus', () => showNote(g));
    g.addEventListener('blur', hideNote);
    g.addEventListener('click', () => showNote(g));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showNote(g); } });
  });

  if (reduced) { final(); return; }
  pre();
  if (!('IntersectionObserver' in window)) { run(); return; }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !played) { run(); io.disconnect(); }
    });
  }, { threshold: 0.45 });
  io.observe(root);
  // leaving mid-run shows the finished picture rather than a half-drawn one
  new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && running) final(); })).observe(root);
}

export function initWorkflow(): void {
  all<HTMLElement>('[data-wf]', document).forEach(init);
}
