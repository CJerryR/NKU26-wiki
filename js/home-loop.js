/* Part 04 · "A loop, not a line": every relationship from the team's loop
 * sketch (B10/B11, D03), built from data so the list and map stay in sync. */
(function () {
  'use strict';
  var NK = window.NK;
  var fig = document.querySelector('[data-loopmap]');
  if (!NK || !fig) return;
  var svg = fig.querySelector('[data-loop-svg]');
  var info = fig.querySelector('[data-loop-info]');
  var traceBtn = fig.querySelector('[data-loop-trace]');
  var S = NK.svg;

  var ICON = {
    data: 'M-8 7V1M-3 7V-6M2 7V-2M7 7V-8M-10 7H10',
    eco: 'M-8 7C-9-4 0-9 8-8C9 2 2 8-8 7ZM-8 7L3-3',
    ode: 'M-9-8V8H9M-8 5C-3 5-2-6 3-6S8-4 8-4',
    md: 'M-6 4L0-5 7 3M-6 4H7',
    soil: 'M-5-9H5V9H-5ZM-5-3H5M-5 3H5',
    survey: 'M-7-8H7V9H-7ZM-3-10H3V-6H-3ZM-4-1H4M-4 4H2',
    society: 'M-9 8V6A5 5 0 0 1 1 6V8M-4-2A3 3 0 1 0-4-8 3 3 0 0 0-4-2ZM4 0A3 3 0 1 0 4-6M3 3A5 5 0 0 1 10 7V8',
    project: 'M-8 2A7 6 0 1 0 6 2 7 6 0 1 0-8 2ZM5-4A3.5 3 0 1 0 11-7',
    edu: 'M-10-6C-5-8-2-7 0-5 2-7 5-8 10-6V7C5 5 2 6 0 8-2 6-5 5-10 7ZM0-5V8',
    expert: 'M-9-7H9V4H-1L-6 8V4H-9Z',
    samples: 'M-7-9V5A2.5 2.5 0 0 0-2 5V-9M2-9V5A2.5 2.5 0 0 0 7 5V-9M-8-9H-1M1-9H8',
    bench: 'M-3-9H3M-2-9V-3L-8 7H8L2-3V-9M-5 3H5'
  };
  /* lab: where the label sits (l, r, t, b), chosen so that no edge or
   * arrow runs through a label; checked by tools/check_loop_layout.py */
  var NODES = [
    { id: 'data', zone: 'dry', x: 230, y: 150, lab: 'l', name: 'Field data', zh: '数据', d: 'Soil-plan and survey data that calibrate the models.' },
    { id: 'eco', zone: 'dry', x: 230, y: 320, lab: 'l', name: 'Eco model', zh: 'Eco 模型', d: 'Uses questionnaires and literature to explore where the product could be feasible. It does not promise a fixed economic return.' },
    { id: 'ode', zone: 'dry', x: 230, y: 490, lab: 'l', name: 'Signalling ODE model', zh: 'ODE', d: 'Links ascaroside input to pigment output; wet-lab measurements tune its parameters.' },
    { id: 'md', zone: 'dry', x: 230, y: 650, lab: 'l', name: 'Docking and dynamics', zh: '分子对接 · 分子动力学', d: 'Simulates receptor–ascaroside interactions to suggest candidate receptor variants for the wet lab.' },
    { id: 'soil', zone: 'hp', x: 600, y: 140, lab: 't', name: 'Soil plan', zh: '土壤计划', d: 'Invites the public to collect soil: samples go to the wet lab, data to the dry lab.' },
    { id: 'survey', zone: 'hp', x: 430, y: 250, lab: 't', name: 'Questionnaires', zh: '问卷', d: 'Asks potential users what they need; responses support the Eco model.' },
    { id: 'edu', zone: 'hp', x: 770, y: 250, lab: 't', name: 'Education', zh: '支教科普', d: 'Teaching and outreach carry the science back to society.' },
    { id: 'society', zone: 'core', x: 600, y: 330, lab: 'r', name: 'Society', zh: '社会', d: 'Growers, experts, testers and the public: where questions come from and where results must return.', core: true },
    { id: 'project', zone: 'core', x: 600, y: 520, lab: 'b', name: 'Our project', zh: '项目', d: 'NemaKlear: the sensor, its workflow and its boundaries.', core: true },
    { id: 'expert', zone: 'hp', x: 820, y: 470, lab: 'b', name: 'Expert interviews', zh: '专家访谈', d: 'Specialists answer the team\u2019s questions and guide the design.' },
    { id: 'samples', zone: 'wet', x: 990, y: 170, lab: 'r', name: 'Soil samples', zh: '样本', d: 'Real soils from the soil plan, ready for testing.' },
    { id: 'bench', zone: 'wet', x: 990, y: 520, lab: 'r', name: 'Experiments', zh: '实验 · 技术验证', d: 'Measures recognition, response and color, and tests technical feasibility.' }
  ];
  var EDGES = [
    { f: 'soil', t: 'data', l: 'provides data', b: 0.16 },
    { f: 'soil', t: 'samples', l: 'provides samples', b: -0.16 },
    { f: 'data', t: 'eco', l: 'calibrates', b: 0 },
    { f: 'survey', t: 'eco', l: 'supports', b: -0.1 },
    { f: 'society', t: 'survey', l: 'responds to', b: -0.12 },
    { f: 'eco', t: 'society', l: 'predicts for', b: 0.2, back: true },
    { f: 'edu', t: 'society', l: 'feeds back', b: 0.12, back: true },
    { f: 'society', t: 'project', l: 'shapes', b: 0.42 },
    { f: 'project', t: 'society', l: 'applies to', b: 0.42 },
    { f: 'ode', t: 'project', l: 'optimizes', b: -0.06, back: true },
    { f: 'expert', t: 'project', l: 'guides', b: 0.12, back: true },
    { f: 'bench', t: 'expert', l: 'asks', b: 0.22 },
    { f: 'samples', t: 'bench', l: 'tested in', b: 0 },
    { f: 'ode', t: 'bench', l: 'data \u21c4 simulation', both: true, c: [[420, 690], [800, 690]] },
    { f: 'md', t: 'bench', l: 'candidate variants', c: [[500, 760], [900, 700]] },
    { f: 'society', t: 'soil', l: 'takes part in', b: 0.28 }
  ];
  var TRACE = [
    { n: ['society', 'soil', 'samples'], e: ['society>soil', 'soil>samples'], x: 'Real field needs and soil samples start the loop.' },
    { n: ['society', 'project', 'expert'], e: ['society>project', 'expert>project'], x: 'Define the use scenario, the workflow and the research questions.' },
    { n: ['samples', 'bench'], e: ['samples>bench'], x: 'The wet lab measures recognition, response and color.' },
    { n: ['bench', 'ode'], e: ['ode>bench'], x: 'The dry lab explains the data, assesses uncertainty and predicts.' },
    { n: ['ode', 'md', 'bench', 'project'], e: ['ode>project', 'md>bench', 'ode>bench'], x: 'Model results guide the next experiments and the product design.' },
    { n: ['project', 'society', 'soil'], e: ['project>society', 'society>soil'], x: 'Results go back to real settings to be tested again.' }
  ];
  var byId = {};
  NODES.forEach(function (n) { byId[n.id] = n; n.r = n.core ? 34 : 26; });

  /* ---- watercolor zones ---- */
  var defs = S('defs', null, svg);
  var filt = S('filter', { id: 'lp-wc', x: '-12%', y: '-12%', width: '124%', height: '124%' }, defs);
  S('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.013', numOctaves: '3', seed: '7', result: 'n' }, filt);
  S('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '30', xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }, filt);
  S('feGaussianBlur', { in: 'd', stdDeviation: '2.4' }, filt);
  var zones = S('g', { class: 'lp-zones', filter: 'url(#lp-wc)' }, svg);
  S('path', { d: 'M40 80C120 50 280 60 318 110S336 420 326 560 300 730 180 724 30 700 26 560 12 160 40 80Z', fill: '#f5d27a', opacity: '.5' }, zones);
  S('path', { d: 'M890 90C990 60 1150 70 1176 140S1194 420 1176 540 1080 610 980 600 880 540 874 420 862 130 890 90Z', fill: '#f7c48f', opacity: '.5' }, zones);
  S('path', { d: 'M380 170C460 70 740 60 832 160S884 470 850 630 660 710 540 700 360 640 350 480 322 250 380 170Z', fill: '#a9c8ea', opacity: '.42' }, zones);
  S('ellipse', { cx: 600, cy: 425, rx: 128, ry: 150, fill: '#f09a9a', opacity: '.42' }, zones);
  var zl = S('g', null, svg);
  [['Dry lab', 60, 44], ['Human Practices', 505, 44], ['Wet lab', 1000, 44]].forEach(function (z) {
    var tx = S('text', { x: z[1], y: z[2], class: 'lp-zone-label' }, zl);
    tx.textContent = z[0];
  });

  /* ---- edges ---- */
  var edgeG = S('g', null, svg);
  var pillG = S('g', null, svg);
  function unit(x, y) { var l = Math.sqrt(x * x + y * y) || 1; return [x / l, y / l]; }
  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  }
  function arrow(tip, from, g, cls) {
    var d = unit(tip[0] - from[0], tip[1] - from[1]);
    var n = [-d[1], d[0]];
    var b = [tip[0] - d[0] * 11, tip[1] - d[1] * 11];
    S('path', { class: 'lp-head', d: 'M' + tip[0].toFixed(1) + ' ' + tip[1].toFixed(1) + 'L' + (b[0] + n[0] * 5).toFixed(1) + ' ' + (b[1] + n[1] * 5).toFixed(1) + 'L' + (b[0] - n[0] * 5).toFixed(1) + ' ' + (b[1] - n[1] * 5).toFixed(1) + 'Z' }, g);
  }
  EDGES.forEach(function (e) {
    var a = byId[e.f];
    var b = byId[e.t];
    var c1, c2;
    if (e.c) { c1 = e.c[0]; c2 = e.c[1]; } else {
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var len = Math.sqrt(dx * dx + dy * dy);
      var mx = (a.x + b.x) / 2 + (-dy / len) * e.b * len;
      var my = (a.y + b.y) / 2 + (dx / len) * e.b * len;
      c1 = [a.x + (mx - a.x) * 2 / 3, a.y + (my - a.y) * 2 / 3];
      c2 = [b.x + (mx - b.x) * 2 / 3, b.y + (my - b.y) * 2 / 3];
    }
    var s0 = unit(c1[0] - a.x, c1[1] - a.y);
    var s1 = unit(c2[0] - b.x, c2[1] - b.y);
    var p0 = [a.x + s0[0] * (a.r + 4), a.y + s0[1] * (a.r + 4)];
    var p3 = [b.x + s1[0] * (b.r + 5), b.y + s1[1] * (b.r + 5)];
    var g = S('g', { class: 'lp-edge' + (e.back ? ' is-back' : '') }, edgeG);
    e.el = g;
    e.key = e.f + '>' + e.t;
    S('path', { class: 'lp-line', d: 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) }, g);
    arrow(p3, c2, g);
    if (e.both) arrow(p0, c1, g);
    var mid = bez(p0, c1, c2, p3, 0.5);
    var pg = S('g', { class: 'lp-pill', transform: 'translate(' + mid[0].toFixed(1) + ' ' + mid[1].toFixed(1) + ')' }, pillG);
    e.pill = pg;
    var w = e.l.length * 6.3 + 16;
    S('rect', { x: (-w / 2).toFixed(1), y: -10, width: w.toFixed(1), height: 20, rx: 10 }, pg);
    var tx = S('text', { y: 4, 'text-anchor': 'middle' }, pg);
    tx.textContent = e.l;
  });

  /* ---- nodes ---- */
  var nodeG = S('g', null, svg);
  NODES.forEach(function (n) {
    var g = S('g', { class: 'lp-node' + (n.core ? ' lp-node--core' : ''), transform: 'translate(' + n.x + ' ' + n.y + ')', tabindex: '0', role: 'button', 'aria-label': n.name + '. ' + n.d }, nodeG);
    n.el = g;
    S('circle', { class: 'lp-disc', r: n.r }, g);
    S('path', { class: 'lp-icon', d: ICON[n.id], transform: n.core ? 'scale(1.25)' : '' }, g);
    var side = n.lab || 'b';
    var lx = side === 'l' ? -(n.r + 12) : side === 'r' ? n.r + 12 : 0;
    var anchor = side === 'l' ? 'end' : side === 'r' ? 'start' : 'middle';
    var y1 = side === 't' ? -(n.r + 26) : side === 'b' ? n.r + 18 : -2;
    var y2 = side === 't' ? -(n.r + 10) : side === 'b' ? n.r + 33 : 15;
    var t1 = S('text', { class: 'lp-name', x: lx, y: y1, 'text-anchor': anchor }, g);
    t1.textContent = n.name;
    var t2 = S('text', { class: 'lp-zh', x: lx, y: y2, 'text-anchor': anchor, lang: 'zh-Hans' }, g);
    t2.textContent = n.zh;
    function on() { focusNode(n); }
    g.addEventListener('mouseenter', on);
    g.addEventListener('focus', on);
    g.addEventListener('click', on);
    g.addEventListener('mouseleave', clearFocus);
    g.addEventListener('blur', clearFocus);
  });
  var badgeG = S('g', null, svg);

  function sentence(e) { return byId[e.f].name + ' ' + e.l.replace('\u21c4', 'and') + ' ' + byId[e.t].name.toLowerCase(); }
  function hot(nodeIds, edgeKeys) {
    fig.classList.add('is-focus');
    NODES.forEach(function (n) { n.el.classList.toggle('is-hot', nodeIds.indexOf(n.id) >= 0); });
    EDGES.forEach(function (e) {
      var h = edgeKeys.indexOf(e.key) >= 0;
      e.el.classList.toggle('is-hot', h);
      e.pill.style.opacity = h ? '1' : '';
    });
  }
  function focusNode(n) {
    if (tracing) return;
    var ids = [n.id];
    var keys = [];
    var rel = [];
    EDGES.forEach(function (e) {
      if (e.f === n.id || e.t === n.id) {
        keys.push(e.key);
        ids.push(e.f === n.id ? e.t : e.f);
        rel.push(sentence(e));
      }
    });
    hot(ids, keys);
    info.innerHTML = '<b>' + n.name + '.</b> ' + n.d + (rel.length ? ' <span>Links: ' + rel.join('; ') + '.</span>' : '');
  }
  function clearFocus() {
    if (tracing) return;
    fig.classList.remove('is-focus');
    NODES.forEach(function (n) { n.el.classList.remove('is-hot'); });
    EDGES.forEach(function (e) { e.el.classList.remove('is-hot'); e.pill.style.opacity = ''; });
    info.textContent = NK.coarse ? 'Tap a node to see its connections.' : 'Hover or focus a node to see its connections.';
  }
  var pillsDim = document.createElement('style');
  pillsDim.textContent = '.nk-loopmap.is-focus .lp-pill{opacity:.18}';
  document.head.appendChild(pillsDim);

  /* ---- trace the main loop ---- */
  var tracing = false;
  var timer = 0;
  function badge(n, k) {
    var by = n.lab === 't' ? n.y + n.r * 0.8 : n.y - n.r * 0.8;
    var g = S('g', { class: 'lp-badge', transform: 'translate(' + (n.x + n.r * 0.8).toFixed(0) + ' ' + by.toFixed(0) + ')' }, badgeG);
    S('circle', { r: 11 }, g);
    var t = S('text', { y: 4, 'text-anchor': 'middle' }, g);
    t.textContent = String(k);
  }
  function step(i) {
    badgeG.innerHTML = '';
    NODES.forEach(function (n) { n.el.classList.remove('is-trace'); });
    if (i >= TRACE.length) { stopTrace(); return; }
    var s = TRACE[i];
    var keys = s.e.map(function (k) { return k; });
    hot(s.n, keys);
    s.n.forEach(function (id) { byId[id].el.classList.add('is-trace'); });
    badge(byId[s.n[s.n.length - 1]], i + 1);
    info.innerHTML = '<b>' + (i + 1) + ' of ' + TRACE.length + '.</b> ' + s.x;
    timer = setTimeout(function () { step(i + 1); }, NK.reduced ? 3200 : 2400);
  }
  function stopTrace() {
    clearTimeout(timer);
    tracing = false;
    badgeG.innerHTML = '';
    NODES.forEach(function (n) { n.el.classList.remove('is-trace'); });
    traceBtn.textContent = 'Trace the loop';
    clearFocus();
  }
  if (traceBtn) {
    traceBtn.addEventListener('click', function () {
      if (tracing) { stopTrace(); return; }
      tracing = true;
      traceBtn.textContent = 'Stop tracing';
      step(0);
    });
  }
}());
