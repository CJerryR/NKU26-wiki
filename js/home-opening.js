/* NKU homepage — 01 opening: surface hero, descent, flashlight hunt */
(function () {
  'use strict';
  var H = window.NKUH; if (!H) return;
  H.ready(function () {
    var sec = H.$('[data-op]'); if (!sec) return;
    var cv = H.$('[data-op-canvas]', sec), hero = H.$('[data-op-hero]', sec), labelsEl = H.$('[data-op-labels]', sec);
    var hint = H.$('[data-op-hint]', sec);
    var P = document.body.getAttribute('data-path-prefix') || '';
    if (H.coarse && hint) hint.textContent = 'Tap the soil to explore.';

    var ctx, W, Hh, CAM, SURF, dark, lit, tmp, tctx, texDark, texLight, R;
    var plants = [], roots = [], pebbles = [], ghosts = [], mols = [], damage = null, wormW = 150;
    var worm = new Image(); worm.src = P + 'img/home/nematode.png';
    var print = new Image(); print.src = P + 'img/home/soil-print.png';
    var light = { x: 0, y: 0, tx: 0, ty: 0 }, pointerSeen = false, found = false, foundT = 0, auto = false;
    var seen = 0, cam = 0, t0 = performance.now(), visible = true, labels = {};
    var dsc = { from: 0, to: 0, t0: 0, dur: 1 }, descentNow = 0;
    function descentAt(now) { var k = H.clamp((now - dsc.t0) / dsc.dur, 0, 1); return H.lerp(dsc.from, dsc.to, H.ease(k)); }
    function descendTo(v, ms) { dsc = { from: descentNow, to: v, t0: performance.now(), dur: Math.max(1, ms) }; }
    var warm = 0; // 0 cool -> 1 warm

    function rnd() { return rng(); } var rng = H.rand(7);

    /* ---------- scene generation ---------- */
    function build() {
      W = sec.clientWidth; Hh = innerHeight;
      CAM = Math.round(Hh * .66); SURF = Math.round(Hh * .8);
      R = Math.max(120, Math.min(W, Hh) * .2);
      ctx = H.fit(cv, W, Hh, 1.5);
      rng = H.rand(11);
      var d = Math.min(H.dpr(), 1.5), total = CAM + Hh;
      dark = document.createElement('canvas'); lit = document.createElement('canvas'); tmp = document.createElement('canvas');
      var dc = H.fit(dark, W, total, 1.5), lc = H.fit(lit, W, total, 1.5); tctx = H.fit(tmp, W, Hh, 1.5);
      wormW = H.clamp(W * .12, 100, 180);
      // plants
      plants = [.07, .19, .3, .7, .82, .93, .55].map(function (fx, i) {
        return { x: fx * W + (rnd() - .5) * 30, h: (i === 6 ? .2 : .2 + rnd() * .16) * Hh, ph: rnd() * 6, leaves: 3 + Math.floor(rnd() * 3), s: .8 + rnd() * .45 };
      });
      // worm & damaged root (world coords)
      var wv = { x: W * .66, y: CAM + Hh * .7 };
      worm.pos = wv;
      damage = { x: wv.x + wormW * .1, y: wv.y - Hh * .12 };
      // roots
      roots = [];
      plants.forEach(function (pl, i) { grow(pl.x, SURF + 4, Math.PI / 2 + (rnd() - .5) * .3, Hh * (.14 + rnd() * .08), 3.2, 0, roots); });
      // a long root reaching the nematode
      var near = plants.reduce(function (a, b) { return Math.abs(b.x - wv.x) < Math.abs(a.x - wv.x) ? b : a; });
      var path = [], x = near.x, y = SURF + 4;
      for (var k = 0; k <= 24; k++) { var tt = k / 24; path.push([H.lerp(x, damage.x, tt) + Math.sin(tt * 7) * 14, H.lerp(y, damage.y + 30, tt)]); }
      roots.push({ pts: path, w: 3, hurt: true });
      grow(damage.x, damage.y + 30, Math.PI / 2 + .6, Hh * .08, 1.6, 2, roots, true);
      grow(damage.x, damage.y + 30, Math.PI / 2 - .7, Hh * .07, 1.6, 2, roots, true);
      // pebbles
      pebbles = [];
      for (var i = 0; i < 70; i++) pebbles.push({ x: rnd() * W, y: SURF + 30 + rnd() * (total - SURF), rx: 4 + rnd() * 22, ry: 3 + rnd() * 12, a: rnd() * 3 });
      // ghosts
      ghosts = [];
      for (var g = 0; g < 7; g++) ghosts.push({ x: rnd() * W, y: CAM + Hh * (.25 + rnd() * .65), len: 70 + rnd() * 70, ang: rnd() * 6.28, sp: .2 + rnd() * .3, ph: rnd() * 6 });
      // ascaroside molecules: trail + decoys (view-relative y)
      mols = [];
      var a = { x: W * .16, y: Hh * .34 }, b = { x: W * .34, y: Hh * .86 }, c = { x: W * .5, y: Hh * .42 }, e = { x: wv.x - wormW * .2, y: Hh * .7 };
      for (var m = 0; m < 16; m++) {
        var u = m / 15, iu = 1 - u;
        var px = iu * iu * iu * a.x + 3 * iu * iu * u * b.x + 3 * iu * u * u * c.x + u * u * u * e.x;
        var py = iu * iu * iu * a.y + 3 * iu * iu * u * b.y + 3 * iu * u * u * c.y + u * u * u * e.y;
        mols.push(mol(px + (rnd() - .5) * 40, CAM + py + (rnd() - .5) * 34, true, u));
      }
      for (var q = 0; q < 12; q++) mols.push(mol(rnd() * W, CAM + Hh * (.25 + rnd() * .7), false, 0));
      paint(dc, false); paint(lc, true);
      // texture copies
      texLight = texDark = null;
      if (print.complete && print.naturalWidth) textures(dc, lc);
      light.x = light.tx = W * .5; light.y = light.ty = Hh * .45;
    }
    function mol(x, y, trail, u) {
      var n = 2 + Math.floor(rnd() * 3), balls = [];
      for (var i = 0; i < n; i++) balls.push({ dx: (rnd() - .5) * 12, dy: (rnd() - .5) * 12, r: 3 + rnd() * 3.5 });
      return { x: x, y: y, trail: trail, u: u, balls: balls, ph: rnd() * 6.28, sp: .6 + rnd() * 1.4, seen: 0, rot: rnd() * 6 };
    }
    function grow(x, y, ang, len, w, depth, out, hurt) {
      var pts = [[x, y]], cx = x, cy = y, a = ang;
      var steps = 10;
      for (var i = 1; i <= steps; i++) { a += (rnd() - .5) * .35; cx += Math.cos(a) * len / steps; cy += Math.sin(a) * len / steps; pts.push([cx, cy]); }
      out.push({ pts: pts, w: w, hurt: hurt });
      if (depth < 3) {
        var kids = 2 + Math.floor(rnd() * 2);
        for (var k = 0; k < kids; k++) {
          var at = pts[3 + Math.floor(rnd() * (pts.length - 4))];
          grow(at[0], at[1], a + (rnd() < .5 ? -1 : 1) * (.5 + rnd() * .7), len * (.45 + rnd() * .25), w * .6, depth + 1, out, hurt);
        }
      }
    }
    function paint(c, isLit) {
      var total = CAM + Hh;
      // sky
      var sky = c.createLinearGradient(0, 0, 0, SURF);
      sky.addColorStop(0, isLit ? '#2a1a33' : '#150a1c'); sky.addColorStop(1, isLit ? '#3b2542' : '#22132a');
      c.fillStyle = sky; c.fillRect(0, 0, W, SURF + 40);
      if (!isLit) { for (var s = 0; s < 90; s++) { c.fillStyle = 'rgba(255,240,230,' + (rnd() * .35) + ')'; c.fillRect(rnd() * W, rnd() * SURF * .8, 1.2, 1.2); } }
      // ground silhouette with mounds
      c.beginPath(); c.moveTo(0, SURF + 20);
      for (var x = 0; x <= W; x += 20) {
        var y = SURF - 34 * Math.sin(x / W * Math.PI * 1.3 + .6) - 16 * Math.sin(x / 90) * Math.sin(x / 210);
        c.lineTo(x, y);
      }
      c.lineTo(W, total); c.lineTo(0, total); c.closePath();
      var soil = c.createLinearGradient(0, SURF - 40, 0, total);
      if (isLit) { soil.addColorStop(0, '#9c7358'); soil.addColorStop(.3, '#c29a74'); soil.addColorStop(1, '#a8805e'); }
      else { soil.addColorStop(0, '#26162c'); soil.addColorStop(.25, '#1d1024'); soil.addColorStop(1, '#140a1a'); }
      c.fillStyle = soil; c.fill();
      c.save(); c.clip();
      // speckle
      for (var i = 0; i < W * total / 900; i++) {
        c.fillStyle = isLit ? 'rgba(90,60,40,' + (rnd() * .35) + ')' : 'rgba(180,150,190,' + (rnd() * .07) + ')';
        var r = rnd() * 1.6 + .3; c.fillRect(rnd() * W, SURF - 30 + rnd() * (total - SURF + 30), r, r);
      }
      // pebbles
      pebbles.forEach(function (pb) {
        c.save(); c.translate(pb.x, pb.y); c.rotate(pb.a);
        var g = c.createRadialGradient(-pb.rx * .3, -pb.ry * .4, 1, 0, 0, pb.rx);
        if (isLit) { g.addColorStop(0, '#e9d3b8'); g.addColorStop(1, '#a8876a'); } else { g.addColorStop(0, '#2d1d33'); g.addColorStop(1, '#1a0f20'); }
        c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, pb.rx, pb.ry, 0, 0, 6.29); c.fill(); c.restore();
      });
      // roots
      roots.forEach(function (rt) {
        c.beginPath(); rt.pts.forEach(function (q, i) { i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); });
        c.lineCap = 'round'; c.lineJoin = 'round';
        if (isLit) {
          c.strokeStyle = rt.hurt ? '#8a3a2c' : '#f4ddb4'; c.lineWidth = rt.w; c.shadowColor = rt.hurt ? 'rgba(200,60,40,.6)' : 'rgba(255,230,190,.8)'; c.shadowBlur = 6;
        } else { c.strokeStyle = 'rgba(120,80,90,.35)'; c.lineWidth = rt.w * .8; c.shadowBlur = 0; }
        c.stroke(); c.shadowBlur = 0;
      });
      // galls on hurt roots
      if (isLit) {
        roots.filter(function (r) { return r.hurt; }).forEach(function (rt) {
          rt.pts.forEach(function (q, i) { if (i % 3 === 1 && q[1] > damage.y - 60) { c.fillStyle = '#a0462f'; c.beginPath(); c.ellipse(q[0], q[1], 5 + rnd() * 4, 4 + rnd() * 3, rnd(), 0, 6.29); c.fill(); } });
        });
      }
      c.restore();
      // grass along the surface
      for (var gx = 0; gx < W; gx += 7) {
        var gy = SURF - 34 * Math.sin(gx / W * Math.PI * 1.3 + .6) - 16 * Math.sin(gx / 90) * Math.sin(gx / 210);
        var hgt = 6 + rnd() * 14;
        c.strokeStyle = isLit ? 'rgba(120,150,90,.9)' : 'rgba(60,80,70,.55)'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(gx, gy + 2); c.quadraticCurveTo(gx + 2, gy - hgt * .6, gx + (rnd() - .5) * 8, gy - hgt); c.stroke();
      }
    }
    function gy(x) { return SURF - 34 * Math.sin(x / W * Math.PI * 1.3 + .6) - 16 * Math.sin(x / 90) * Math.sin(x / 210); }
    function ground() { var p = new Path2D(); p.moveTo(0, gy(0)); for (var x = 0; x <= W; x += 20) p.lineTo(x, gy(x)); p.lineTo(W, CAM + Hh); p.lineTo(0, CAM + Hh); p.closePath(); return p; }
    function textures(dc, lc) {
      var total = CAM + Hh, iw = print.naturalWidth, ih = print.naturalHeight;
      var scale = W / iw * 1.1, h = ih * scale;
      [dc, lc].forEach(function (c, i) {
        c.save(); c.clip(ground()); 
        c.globalAlpha = i ? .2 : .07;
        if (i) c.globalCompositeOperation = 'multiply';
        var sy0 = ih * .3, sh = ih - sy0, hh2 = sh * scale; for (var y = SURF + 10; y < total; y += hh2 * .95) c.drawImage(print, 0, sy0, iw, sh, -W * .05, y, W * 1.1, hh2);
        c.restore();
      });
    }
    print.onload = function () { if (W) build(); };

    /* ---------- live drawing ---------- */
    function plant(c, pl, t, glow) {
      var sway = Math.sin(t * .9 + pl.ph) * .04 + (light.x - pl.x) / W * .08 * glow;
      c.save(); c.translate(pl.x, gy(pl.x) + 2); c.rotate(sway);
      var h = pl.h * pl.s, dist = Math.hypot(light.x - pl.x, light.y + cam - (SURF - h / 2)), lit = Math.max(0, 1 - dist / (R * 3)) * glow;
      c.strokeStyle = 'rgb(' + Math.round(40 + 60 * lit) + ',' + Math.round(48 + 70 * lit) + ',' + Math.round(40 + 40 * lit) + ')';
      c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(6, -h * .5, 0, -h); c.stroke();
      for (var i = 0; i < pl.leaves; i++) {
        var yy = -h * (.35 + i * .6 / pl.leaves), side = i % 2 ? 1 : -1, len = (26 + (pl.leaves - i) * 9) * pl.s;
        c.save(); c.translate(0, yy); c.rotate(side * (.7 + Math.sin(t * 1.3 + pl.ph + i) * .06));
        var g = c.createLinearGradient(0, 0, 0, -len);
        g.addColorStop(0, 'rgb(' + Math.round(34 + 50 * lit) + ',' + Math.round(44 + 70 * lit) + ',' + Math.round(34 + 30 * lit) + ')');
        g.addColorStop(1, 'rgb(' + Math.round(58 + 90 * lit) + ',' + Math.round(70 + 100 * lit) + ',' + Math.round(50 + 40 * lit) + ')');
        c.fillStyle = g; c.beginPath(); c.moveTo(0, 0);
        c.bezierCurveTo(len * .45, -len * .2, len * .35, -len * .85, 0, -len);
        c.bezierCurveTo(-len * .35, -len * .85, -len * .45, -len * .2, 0, 0); c.fill();
        c.strokeStyle = 'rgba(255,240,210,' + (.08 + .3 * lit) + ')'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, -len * .9); c.stroke();
        c.restore();
      }
      c.restore();
    }
    function ghost(c, g, t, alpha, tint) {
      var segs = 34, px = g.x + Math.cos(g.ang) * Math.sin(t * g.sp) * 20, py = g.y + Math.sin(g.ang) * Math.sin(t * g.sp) * 20;
      for (var i = 0; i < segs; i++) {
        var u = i / (segs - 1), off = Math.sin(u * 5 + t * 2 + g.ph) * 9;
        var x = px + Math.cos(g.ang) * g.len * u - Math.sin(g.ang) * off, y = py + Math.sin(g.ang) * g.len * u + Math.cos(g.ang) * off;
        var r = 7 * Math.sin(Math.PI * (.12 + u * .8));
        c.fillStyle = 'rgba(' + tint + ',' + alpha + ')'; c.beginPath(); c.arc(x, y - cam, r, 0, 6.29); c.fill();
      }
    }
    function drawMol(c, m, t, lightK) {
      var vy = m.y - cam, flick = m.trail ? .35 + .65 * Math.max(0, Math.sin(t * m.sp + m.ph)) : .15 + .5 * Math.max(0, Math.sin(t * m.sp * 1.3 + m.ph));
      var a = Math.min(1, lightK * 1.25 * (.55 + .45 * flick) + m.seen * .16 * flick);
      if (a < .03) return;
      c.save(); c.translate(m.x, vy + Math.sin(t * 1.4 + m.ph) * 3); c.rotate(m.rot + t * .15);
      c.globalAlpha = a;
      var halo = c.createRadialGradient(0, 0, 0, 0, 0, 22); halo.addColorStop(0, 'rgba(111,243,222,.45)'); halo.addColorStop(1, 'rgba(111,243,222,0)');
      c.fillStyle = halo; c.beginPath(); c.arc(0, 0, 22, 0, 6.29); c.fill();
      m.balls.forEach(function (b) {
        var g = c.createRadialGradient(b.dx - b.r * .4, b.dy - b.r * .4, .5, b.dx, b.dy, b.r);
        g.addColorStop(0, '#f2fffc'); g.addColorStop(.45, '#6ff3de'); g.addColorStop(1, '#1f9e98');
        c.fillStyle = g; c.beginPath(); c.arc(b.dx, b.dy, b.r, 0, 6.29); c.fill();
      });
      if (m.seen) { c.globalAlpha = .5 * (1 - ((t * .8 + m.ph) % 1)); c.strokeStyle = '#6ff3de'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 10 + 18 * ((t * .8 + m.ph) % 1), 0, 6.29); c.stroke(); }
      c.restore();
    }
    function drawWorm(c, t, bounce) {
      if (!worm.complete || !worm.naturalWidth) return;
      var w = wormW, h = w * worm.naturalHeight / worm.naturalWidth, x = worm.pos.x, y = worm.pos.y - cam;
      c.save(); c.translate(x, y - bounce * 16);
      c.rotate(Math.sin(t * 2.2) * .04); c.transform(1, 0, Math.sin(t * 3) * .06, 1, 0, 0);
      c.drawImage(worm, -w / 2, -h / 2, w, h); c.restore();
    }
    function torch(c, a, alpha) {
      var ox = Math.min(170, W * .16), oy = Hh - 96;
      c.save(); c.globalAlpha = alpha; c.translate(ox, oy); c.rotate(a);
      // body (cylinder)
      var g = c.createLinearGradient(0, -14, 0, 14);
      g.addColorStop(0, '#6f5a86'); g.addColorStop(.35, '#d8c8ec'); g.addColorStop(.55, '#8f78ad'); g.addColorStop(1, '#2b1d3a');
      c.fillStyle = g; roundRect(c, -78, -12, 70, 24, 7); c.fill();
      c.fillStyle = 'rgba(0,0,0,.35)'; for (var k = 0; k < 4; k++) c.fillRect(-66 + k * 9, -12, 3, 24);
      // head (cone)
      var hg = c.createLinearGradient(0, -22, 0, 22);
      hg.addColorStop(0, '#7e0c6e'); hg.addColorStop(.35, '#e59ad4'); hg.addColorStop(.6, '#9c2a8a'); hg.addColorStop(1, '#3d0636');
      c.fillStyle = hg; c.beginPath(); c.moveTo(-10, -13); c.lineTo(20, -22); c.lineTo(20, 22); c.lineTo(-10, 13); c.closePath(); c.fill();
      // lens
      var lg = c.createRadialGradient(22, 0, 1, 22, 0, 30);
      lg.addColorStop(0, 'rgba(255,255,240,1)'); lg.addColorStop(.3, warm > .5 ? 'rgba(255,224,120,.9)' : 'rgba(230,245,255,.85)'); lg.addColorStop(1, 'rgba(255,230,180,0)');
      c.fillStyle = lg; c.beginPath(); c.arc(22, 0, 30, 0, 6.29); c.fill();
      c.fillStyle = '#fffdf2'; c.beginPath(); c.ellipse(21, 0, 5, 21, 0, 0, 6.29); c.fill();
      c.restore();
      return { x: ox + Math.cos(a) * 22, y: oy + Math.sin(a) * 22 };
    }
    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    var dust = [];
    for (var di = 0; di < 60; di++) dust.push({ u: Math.random(), v: Math.random() * 2 - 1, s: .2 + Math.random() * .8, ph: Math.random() * 6 });

    function label(key, text, x, y, cls) {
      if (labels[key]) return;
      var el = document.createElement('p'); el.className = 'op__label ' + (cls || ''); el.textContent = text;
      labelsEl.appendChild(el);
      var w = el.offsetWidth, h = el.offsetHeight;
      if (x + w > W - 20) x = W - 20 - w;
      x = Math.max(16, x);
      // keep discovery notes from landing on each other
      for (var tries = 0; tries < 6; tries++) {
        var hit = Object.keys(labels).some(function (k) { var o = labels[k]; return x < o._x + o._w + 8 && x + w + 8 > o._x && y < o._y + o._h + 6 && y + h + 6 > o._y; });
        if (!hit) break; y += h + 10;
      }
      el._x = x; el._y = y; el._w = w; el._h = h;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      labels[key] = el; requestAnimationFrame(function () { el.classList.add('is-on'); });
    }

    function frame(now) {
      if (!visible) return;
      var t = (now - t0) / 1000;
      var descent = descentNow = descentAt(now); cam = descent * CAM; heroStyle(descent);
      var soilMode = descent > .96;
      // light target
      if (auto && !found) { light.tx = worm.pos.x - wormW * .05; light.ty = worm.pos.y - cam; }
      else if (!pointerSeen) { light.tx = W * .5 + Math.sin(t * .6) * W * .22; light.ty = (soilMode ? Hh * .5 : Hh * .42) + Math.sin(t * .9) * Hh * .12; }
      var k = auto ? .045 : .14;
      light.x += (light.tx - light.x) * k; light.y += (light.ty - light.y) * k;
      if (found) warm = Math.min(1, warm + .03);
      var intensity = H.lerp(.62, .96, descent), rad = H.lerp(R * 1.25, R, descent) * (1 + Math.sin(t * 7) * .006);

      ctx.clearRect(0, 0, W, Hh);
      ctx.drawImage(dark, 0, cam * dark.width / W, dark.width, Hh * dark.width / W, 0, 0, W, Hh);
      var night = H.smooth(.25, .9, descent);
      if (night > 0) { ctx.fillStyle = 'rgba(3,1,5,' + (night * .97).toFixed(3) + ')'; ctx.fillRect(0, 0, W, Hh); }
      // lit layer through the light
      tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, W, Hh);
      tctx.drawImage(lit, 0, cam * lit.width / W, lit.width, Hh * lit.width / W, 0, 0, W, Hh);
      ghosts.forEach(function (g) { ghost(tctx, g, t, .13, '255,245,235'); });
      if (!found) drawWorm(tctx, t, 0);
      if (warm > 0) { tctx.globalCompositeOperation = 'source-atop'; tctx.fillStyle = 'rgba(255,200,60,' + (.22 * warm) + ')'; tctx.fillRect(0, 0, W, Hh); }
      tctx.globalCompositeOperation = 'destination-in';
      var mg = tctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, rad);
      mg.addColorStop(0, 'rgba(0,0,0,' + intensity + ')'); mg.addColorStop(.5, 'rgba(0,0,0,' + intensity * .86 + ')');
      mg.addColorStop(.78, 'rgba(0,0,0,' + intensity * .42 + ')'); mg.addColorStop(1, 'rgba(0,0,0,0)');
      tctx.fillStyle = mg; tctx.fillRect(0, 0, W, Hh);
      ctx.drawImage(tmp, 0, 0, W, Hh);
      // plants (above ground, visible in hero)
      if (descent < .99) { ctx.save(); ctx.translate(0, -cam); plants.forEach(function (pl) { plant(ctx, pl, t, 1 - descent * .6); }); ctx.restore(); }
      // beam + torch
      var tAlpha = H.smooth(.55, 1, descent);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      if (tAlpha > 0) {
        var ox = Math.min(170, W * .16), oy = Hh - 96, ang = Math.atan2(light.y - oy, light.x - ox);
        var tip = { x: ox + Math.cos(ang) * 22, y: oy + Math.sin(ang) * 22 }, nx = -Math.sin(ang), ny = Math.cos(ang);
        var bg = ctx.createLinearGradient(tip.x, tip.y, light.x, light.y);
        var col = warm > .5 ? '255,214,110' : '225,236,255';
        bg.addColorStop(0, 'rgba(' + col + ',' + .16 * tAlpha + ')'); bg.addColorStop(1, 'rgba(' + col + ',' + .03 * tAlpha + ')');
        ctx.fillStyle = bg; ctx.beginPath();
        ctx.moveTo(tip.x + nx * 16, tip.y + ny * 16); ctx.lineTo(light.x + nx * rad * .82, light.y + ny * rad * .82);
        ctx.lineTo(light.x - nx * rad * .82, light.y - ny * rad * .82); ctx.lineTo(tip.x - nx * 16, tip.y - ny * 16); ctx.closePath(); ctx.fill();
        // dust in the beam
        var len = Math.hypot(light.x - tip.x, light.y - tip.y);
        dust.forEach(function (d) {
          var u = (d.u + t * .02 * d.s) % 1, spread = H.lerp(14, rad * .8, u), v = d.v + Math.sin(t * d.s + d.ph) * .15;
          var x = tip.x + Math.cos(ang) * len * u + nx * spread * v, y = tip.y + Math.sin(ang) * len * u + ny * spread * v;
          ctx.fillStyle = 'rgba(255,250,235,' + (.42 * tAlpha * (1 - Math.abs(v)) * (.3 + .7 * Math.sin(u * Math.PI))) + ')';
          ctx.beginPath(); ctx.arc(x, y, .6 + d.s * 1.1, 0, 6.29); ctx.fill();
        });
      }
      // bloom
      var bl = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, rad * 1.3);
      var bc = warm > 0 ? 'rgba(255,' + Math.round(H.lerp(236, 196, warm)) + ',' + Math.round(H.lerp(220, 90, warm)) + ',' : 'rgba(215,230,255,';
      bl.addColorStop(0, bc + (.16 * intensity) + ')'); bl.addColorStop(1, bc + '0)');
      ctx.fillStyle = bl; ctx.beginPath(); ctx.arc(light.x, light.y, rad * 1.3, 0, 6.29); ctx.fill();
      ctx.restore();
      // molecules
      mols.forEach(function (m) {
        var vy = m.y - cam, dd = Math.hypot(m.x - light.x, vy - light.y), lk = Math.max(0, 1 - dd / rad);
        if (soilMode && !m.seen && m.trail && dd < rad * .62) { m.seen = 1; seen++; onSeen(m, vy); }
        drawMol(ctx, m, t, lk);
      });
      if (soilMode && !found) {
        var dh = Math.hypot(damage.x - light.x, damage.y - cam - light.y);
        if (dh < rad * .7 && seen >= 1) label('roots', 'The plant’s roots are under severe attack!', damage.x - 140, damage.y - cam - 70, 'op__label--warn');
        if (Math.hypot(worm.pos.x - light.x, worm.pos.y - cam - light.y) < rad * .5) becomeFound(t);
      }
      if (found) { var bt = Math.max(0, 1 - (t - foundT) / .9); drawWorm(ctx, t, Math.abs(Math.sin((t - foundT) * 9)) * bt); }
      if (tAlpha > 0) torch(ctx, Math.atan2(light.y - (Hh - 96), light.x - Math.min(170, W * .16)), tAlpha);
      labelsEl.style.opacity = soilMode ? 1 : 0;
      H.lastLight = { x: light.x, y: light.y, r: rad, warm: warm };
      requestAnimationFrame(frame);
    }
    function onSeen(m, vy) {
      if (seen === 1) { sec.classList.add('has-signal'); label('sig', 'Signal detected!', m.x + 18, vy - 30, 'op__label--signal'); }
      if (seen === 4) label('trail', 'The fluorescent signals seem to form a trail.', m.x + 20, vy + 16, 'op__label--signal');
    }
    function becomeFound(t) {
      if (found) return; found = true; foundT = t;
      mols.forEach(function (m) { if (m.trail) m.seen = 1; });
      sec.classList.add('is-found');
      label('roots', 'The plant’s roots are under severe attack!', damage.x - 140, damage.y - cam - 70, 'op__label--warn');
      var wx = worm.pos.x + wormW * .62, wy = worm.pos.y - cam - 64;
      setTimeout(function () { label('worm', 'Nematodes are behind it!', wx, wy, 'op__label--big'); }, 500);
      if (window.NKUDetective) window.NKUDetective.lit(true);
      H.say('Got it! The light turned <b>yellow</b>, just like our yeast would.', 4200);
    }

    /* ---------- input & scroll ---------- */
    function setPointer(e) {
      var r = cv.getBoundingClientRect();
      light.tx = e.clientX - r.left; light.ty = e.clientY - r.top; pointerSeen = true;
    }
    cv.addEventListener('pointermove', setPointer);
    cv.addEventListener('pointerdown', setPointer);
    sec.addEventListener('pointerleave', function () { pointerSeen = false; });
    function heroStyle(d) {
      var hp = H.smooth(0, .5, d);
      hero.style.opacity = 1 - hp;
      hero.style.transform = 'translateY(' + (-hp * 90) + 'px) scale(' + (1 + hp * .06) + ')';
      hero.style.filter = hp > .01 ? 'blur(' + (hp * 8).toFixed(1) + 'px)' : 'none';
      sec.classList.toggle('is-under', d > .9);
    }
    function findNow() { if (found) return; light.x = light.tx = worm.pos.x - wormW * .05; light.y = light.ty = worm.pos.y - CAM; auto = true; }
    H.scene('opening', {
      steps: 2, tall: 2.6, noCue: true,
      set: function (i) {
        dsc = { from: i ? 1 : 0, to: i ? 1 : 0, t0: 0, dur: 1 }; descentNow = i ? 1 : 0;
        if (i >= 2) { findNow(); sec.classList.add('is-late'); } else sec.classList.remove('is-late');
      },
      step: function (i, dir) {
        if (i === 1 && dir > 0) { descendTo(1, 1500); return 1500; }
        if (i === 0) { descendTo(0, 1300); sec.classList.remove('is-late'); return 1300; }
        if (i === 1 && dir < 0) return -1;
        if (i === 2) { sec.classList.add('is-late'); if (found) return 250; auto = true; return 1900; }
        return 0;
      },
      ff: function () { if (descentNow > .5) { dsc.t0 = 0; } if (auto && !found) findNow(); }
    });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { labels = {}; labelsEl.innerHTML = ''; build(); }, 200); });
    H.onView(sec, function (v) { var was = visible; visible = v; if (v && !was) requestAnimationFrame(frame); });
    build(); requestAnimationFrame(frame);
  });
})();
