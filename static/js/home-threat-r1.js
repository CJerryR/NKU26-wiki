/* NKU homepage — 04 the hidden threat, round 1 (R1-H06).
 * The four stages of one infection cycle, now drawn with the team's own
 * artwork (单图大豆植株.ai / 单图放大.ai): the plant in its soil on the left
 * and, on the right, the magnified circle of the spot marked on it.
 * Artboards were matched to stages by what they show, not by their number:
 *   stage 1 Finding a host        plant 01 (seedling)      + circle 01 (J2 and eggs in soil)
 *   stage 2 Releasing ascarosides plant 02 (young plant)   + circle 01 with ascr#3 / ascr#18 glows (web overlay)
 *   stage 3 Invading the root     plant 02                 + circle 02 (juveniles inside the root)
 *   stage 4 Yellowing above ground plant 03 (yellow, galled) + circle 03 (swollen female, eggs)
 * Artboard 04 (eggs left in bare soil) has no stage in this copy and is not used.
 * Stage texts are unchanged from v8.0. Arrival shows the four stages side by
 * side; each scroll then opens one stage. Everything is an illustration. */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  /* One literal per artwork file so the CDN switch is a one-line swap each
   * (CDN-UPLOAD-MANIFEST.csv). Until the real Uploads URLs are returned these
   * stay local and are kept by tools/finalize-stage-assets.mjs. */
  var ART = {
    plant: {
      '01': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-0bb6ae1732a7-plant-soil-artboard-01.svg',
      '02': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-76c7b5750f6c-plant-soil-artboard-02.svg',
      '03': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-2c45995f477d-plant-soil-artboard-03.svg'
    },
    lens: {
      '01': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-d0e06f642252-magnified-artboard-01.svg',
      '02': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-608e705490a6-magnified-artboard-02.svg',
      '03': 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-a80b7fce538f-magnified-artboard-03.svg'
    }
  };
  var VB = [34, 118, 541, 582];   // shared viewBox of the plant artboards (same scale for all)
  var STAGES = [
    { t: 'Finding a host', p: 'Second-stage juveniles (J2) hatch from eggs in the soil and swim through water films toward the chemicals leaking from root tips.', plant: '01', lens: '01', hot: [318, 468] },
    { t: 'Releasing ascarosides', p: 'While they move and gather, nematodes release ascarosides such as ascr#3 and ascr#18. These small molecules linger in the soil around the roots. They are the clue NemaKlear is designed to read.', plant: '02', lens: '01', hot: [336, 446], key: true, glow: true },
    { t: 'Invading the root', p: 'A juvenile pierces the root near its tip, settles inside and turns nearby cells into giant feeding cells. The root swells into knots called galls.', plant: '02', lens: '02', hot: [300, 470] },
    { t: 'Yellowing above ground', p: 'With galled roots the plant takes up less water and nutrients. Leaves yellow and wilt, easily mistaken for drought, while the next generation of eggs goes back into the soil.', plant: '03', lens: '03', hot: [296, 520] }
  ];
  function pct(st) { return [((st.hot[0] - VB[0]) / VB[2] * 100).toFixed(2) + '%', ((st.hot[1] - VB[1]) / VB[3] * 100).toFixed(2) + '%']; }
  function glow(cls) {
    return '<span class="th2__glow ' + cls + '" aria-hidden="true"><i class="is-b" style="--x:22%;--y:38%;--s:34%"></i><i class="is-p" style="--x:62%;--y:30%;--s:30%"></i><i class="is-b" style="--x:70%;--y:68%;--s:26%"></i><i class="is-p" style="--x:30%;--y:72%;--s:28%"></i></span>';
  }
  function plantFig(st, k, eager) {
    var h = pct(st);
    return '<span class="th2__plant">' +
      '<img src="' + ART.plant[st.plant] + '" width="541" height="582" alt="" decoding="async"' + (eager ? '' : ' loading="lazy"') + '>' +
      (st.glow ? '<span class="th2__plantglow" style="left:' + h[0] + ';top:' + h[1] + '"><i class="is-b"></i><i class="is-p"></i><i class="is-b"></i></span>' : '') +
      '<i class="th2__spot" style="left:' + h[0] + ';top:' + h[1] + '"></i></span>';
  }
  function lensFig(st) {
    return '<span class="th2__lens"><img src="' + ART.lens[st.lens] + '" width="414" height="414" alt="" decoding="async" loading="lazy">' +
      (st.glow ? glow('is-lens') + '<span class="th2__chip is-3">ascr#3</span><span class="th2__chip is-18">ascr#18</span>' : '') + '</span>';
  }

  H.ready(function () {
    var sec = H.$('[data-th]'); if (!sec) return;
    var stageEl = H.$('.th__stage', sec), track = H.$('[data-th-track]', sec), cap = H.$('[data-th-cap]', sec);
    var capN = H.$('[data-th-n]', cap), capT = H.$('[data-th-t]', cap), dotsEl = H.$('[data-th-dots]', sec);
    sec.classList.add('th2');
    /* arrival: the four stages side by side */
    var ov = document.createElement('ol'); ov.className = 'th2__ov'; ov.setAttribute('aria-label', 'The four stages');
    /* one stage at a time: plant, callout, magnified circle */
    var focus = document.createElement('div'); focus.className = 'th2__focus'; focus.setAttribute('aria-hidden', 'true');
    var callout = '<svg class="th2__call" aria-hidden="true" focusable="false"><path data-call-a /><path data-call-b /><circle data-call-ring2 r="16" /><circle data-call-ring r="13" /></svg>';
    var p = document.createElement('p'); p.className = 'th__p'; p.setAttribute('data-th-p', '');
    var key = cap.querySelector('.th__key');
    key.parentNode.insertBefore(p, key);
    STAGES.forEach(function (st, i) {
      var k = i + 1;
      var li = document.createElement('li'); li.className = 'th2__card' + (st.key ? ' is-key' : '');
      li.innerHTML = '<figure>' + plantFig(st, k, true) + lensFig(st) + '<figcaption><b>' + k + '</b>' + st.t + '</figcaption></figure>';
      ov.appendChild(li);
      var d = document.createElement('li'); d.innerHTML = '<b>' + k + '</b><span>' + st.t + '</span>'; dotsEl.appendChild(d);
    });
    focus.innerHTML = callout + '<div class="th2__pane" data-pane></div>';
    track.appendChild(ov); track.appendChild(focus);
    var pane = H.$('[data-pane]', focus), callA = H.$('[data-call-a]', focus), callB = H.$('[data-call-b]', focus), ring = H.$('[data-call-ring]', focus), ring2 = H.$('[data-call-ring2]', focus);
    var panes = STAGES.map(function (st, i) {
      var el = document.createElement('div'); el.className = 'th2__scene'; el.setAttribute('data-k', i + 1);
      el.innerHTML = plantFig(st, i + 1, false) + lensFig(st);
      pane.appendChild(el); return el;
    });

    /* callout: a ring on the plant and the two outer tangents to the circle */
    function drawCall() {
      var on = panes.filter(function (el) { return el.classList.contains('is-on'); })[0];
      if (!on) return;
      var fr = focus.getBoundingClientRect(), spot = H.$('.th2__spot', on).getBoundingClientRect(), lens = H.$('.th2__lens', on).getBoundingClientRect();
      if (!lens.width) return;
      var x1 = spot.left + spot.width / 2 - fr.left, y1 = spot.top + spot.height / 2 - fr.top, r1 = 13;
      var x2 = lens.left + lens.width / 2 - fr.left, y2 = lens.top + lens.height / 2 - fr.top, r2 = lens.width / 2;
      var dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy); if (d <= r2 - r1 + 1) { callA.setAttribute('d', ''); callB.setAttribute('d', ''); return; }
      var base = Math.atan2(dy, dx), off = Math.acos((r1 - r2) / d);
      [[callA, base + off], [callB, base - off]].forEach(function (c) {
        var a = c[1], ax = x1 + r1 * Math.cos(a), ay = y1 + r1 * Math.sin(a), bx = x2 + r2 * Math.cos(a), by = y2 + r2 * Math.sin(a);
        c[0].setAttribute('d', 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + 'L' + bx.toFixed(1) + ' ' + by.toFixed(1));
      });
      [ring, ring2].forEach(function (c) { c.setAttribute('cx', x1.toFixed(1)); c.setAttribute('cy', y1.toFixed(1)); });
    }
    var callT = 0;
    function drawSoon() { cancelAnimationFrame(callT); callT = requestAnimationFrame(function () { drawCall(); callT = requestAnimationFrame(drawCall); }); }

    function show(i) {
      sec.setAttribute('data-st', i);
      H.$$('li', dotsEl).forEach(function (d, j) { d.classList.toggle('is-on', j + 1 === i); d.classList.toggle('is-done', j + 1 < i); });
      panes.forEach(function (el, j) { el.classList.toggle('is-on', j + 1 === i); });
      if (i) {
        var st = STAGES[i - 1];
        capN.textContent = String(i); capT.textContent = st.t; p.textContent = st.p;
        cap.classList.toggle('is-key', !!st.key);
        cap.classList.remove('is-in'); void cap.offsetWidth; cap.classList.add('is-in');
        drawSoon();
        setTimeout(drawCall, 700);   // after the scene has settled
      }
    }
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(drawCall, 120); });
    panes.forEach(function (el) { H.$$('img', el).forEach(function (im) { im.addEventListener('load', drawCall); }); });

    H.scene('threat', {
      steps: 4, tall: 5,
      noCue: true,
      set: function (i) { show(i); },
      step: function (i) { show(i); return 950; },
      ff: function () {}
    });
    show(0);
  });
})();
