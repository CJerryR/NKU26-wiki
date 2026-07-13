/* ============================================================================
   SUBSURFACE flow scene
   Home-only progressive enhancement: WebGL reagent fluid, non-linear camera,
   disrupted title, kinetic ticker and scroll-inertia cards. No dependencies.
============================================================================ */
(function () {
  'use strict';

  var hero = document.querySelector('[data-flow-scene]');
  if (!hero) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var expoOut = function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); };
  var smoothstep = function (t) { return t * t * (3 - 2 * t); };

  function segment(p, from, to) {
    return clamp((p - from) / Math.max(to - from, 0.0001), 0, 1);
  }

  function mixShot(a, b, t) {
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      scale: lerp(a.scale, b.scale, t),
      rx: lerp(a.rx || 0, b.rx || 0, t),
      ry: lerp(a.ry || 0, b.ry || 0, t),
      rz: lerp(a.rz || 0, b.rz || 0, t),
      depth: lerp(a.depth || 0, b.depth || 0, t)
    };
  }

  function bezierShot(a, control, b, t) {
    var inv = 1 - t;
    var shot = mixShot(a, b, t);
    shot.x = inv * inv * a.x + 2 * inv * t * control.x + t * t * b.x;
    shot.y = inv * inv * a.y + 2 * inv * t * control.y + t * t * b.y;
    shot.scale = inv * inv * a.scale + 2 * inv * t * control.scale + t * t * b.scale;
    return shot;
  }

  function cameraAt(p) {
    if (p < 0.16) {
      return mixShot(
        { x: 0.72, y: 0.52, scale: 0.88, rx: -2, ry: -8, rz: -3, depth: 8 },
        { x: 0.75, y: 0.48, scale: 0.94, rx: 0, ry: 5, rz: 0, depth: 28 },
        expoOut(segment(p, 0, 0.16))
      );
    }
    if (p < 0.52) {
      var t1 = smoothstep(segment(p, 0.16, 0.52));
      return bezierShot(
        { x: 0.75, y: 0.48, scale: 0.94, ry: 5, depth: 28 },
        { x: 0.92, y: 0.20, scale: 0.64 },
        { x: 0.83, y: 0.34, scale: 0.53, ry: -13, rz: 5, depth: -80 },
        t1
      );
    }
    if (p < 0.78) {
      var t2 = smoothstep(segment(p, 0.52, 0.78));
      return bezierShot(
        { x: 0.83, y: 0.34, scale: 0.53, ry: -13, rz: 5, depth: -80 },
        { x: 0.45, y: 0.22, scale: 0.58 },
        { x: 0.62, y: 0.40, scale: 0.69, ry: 16, rz: -7, depth: -24 },
        t2
      );
    }
    return mixShot(
      { x: 0.62, y: 0.40, scale: 0.69, ry: 16, rz: -7, depth: -24 },
      { x: 0.70, y: 0.56, scale: 1.16, ry: 0, rz: 0, depth: 72 },
      expoOut(segment(p, 0.78, 1))
    );
  }

  function hash(n) {
    var x = Math.sin(n * 91.733 + 17.17) * 43758.5453;
    return x - Math.floor(x);
  }

  function seededShuffle(list, seed) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(hash(seed + i * 13.17) * (i + 1));
      var temp = out[i]; out[i] = out[j]; out[j] = temp;
    }
    return out;
  }

  function disruptTitle() {
    var lines = Array.prototype.slice.call(hero.querySelectorAll('[data-disrupt]'));
    if (!lines.length || REDUCED) {
      hero.classList.add('is-title-live');
      return;
    }

    lines.forEach(function (line, row) {
      var text = line.getAttribute('data-disrupt') || line.textContent;
      var chars = Array.from(text);
      var order = seededShuffle(chars.map(function (_, index) { return index; }), 2066 + row * 47);
      line.textContent = '';
      line.setAttribute('aria-hidden', 'true');

      chars.forEach(function (character, index) {
        var span = document.createElement('span');
        var rank = order.indexOf(index);
        var seed = hash(index + row * 31);
        span.className = 'hero-char';
        span.textContent = character === ' ' ? '\u00a0' : character;
        span.style.setProperty('--char-order', rank);
        span.style.setProperty('--char-x', lerp(-38, 38, seed).toFixed(1) + 'px');
        span.style.setProperty('--char-y', lerp(-52, 32, hash(index * 7 + row)).toFixed(1) + 'px');
        span.style.setProperty('--char-r', lerp(-15, 15, hash(index * 13 + row)).toFixed(1) + 'deg');
        line.appendChild(span);
      });
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('is-title-live'); });
    });
    window.setTimeout(function () {
      lines.forEach(function (line) {
        Array.prototype.forEach.call(line.children, function (span) { span.style.willChange = 'auto'; });
      });
    }, 1900);
  }

  function createMotionBus() {
    var subscribers = [];
    var running = false;
    var lastTime = 0;
    var state = {
      scrollY: window.scrollY,
      previousScrollY: window.scrollY,
      scrollVelocity: 0,
      pointerTargetX: 0,
      pointerTargetY: 0,
      pointerX: 0,
      pointerY: 0
    };

    function frame(now) {
      var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      var rawVelocity = dt ? (state.scrollY - state.previousScrollY) / dt : 0;
      state.scrollVelocity += (rawVelocity - state.scrollVelocity) * Math.min(1, dt * 9);
      state.scrollVelocity *= Math.pow(0.91, dt * 60);
      state.previousScrollY = state.scrollY;
      state.pointerX += (state.pointerTargetX - state.pointerX) * Math.min(1, dt * 4.5);
      state.pointerY += (state.pointerTargetY - state.pointerY) * Math.min(1, dt * 4.5);

      var active = false;
      subscribers.forEach(function (subscriber) {
        if (subscriber(dt, state, now * 0.001) !== false) active = true;
      });

      if (!document.hidden && (active || Math.abs(state.scrollVelocity) > 0.35 || Math.abs(state.pointerTargetX - state.pointerX) > 0.002)) {
        requestAnimationFrame(frame);
      } else {
        running = false;
        lastTime = 0;
      }
    }

    function wake() {
      if (running || document.hidden) return;
      running = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', function () { state.scrollY = window.scrollY; wake(); }, { passive: true });
    window.addEventListener('resize', wake, { passive: true });
    document.addEventListener('visibilitychange', wake);

    if (FINE && !REDUCED) {
      hero.addEventListener('pointermove', function (event) {
        var rect = hero.getBoundingClientRect();
        state.pointerTargetX = clamp(((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2, -1, 1);
        state.pointerTargetY = clamp(((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2, -1, 1);
        wake();
      }, { passive: true });
      hero.addEventListener('pointerleave', function () {
        state.pointerTargetX = 0;
        state.pointerTargetY = 0;
        wake();
      });
    }

    return {
      state: state,
      subscribe: function (subscriber) { subscribers.push(subscriber); wake(); },
      wake: wake
    };
  }

  function initWebGL(canvas, bus, visibility) {
    if (!canvas) return null;
    var gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: true });
    if (!gl) return null;

    var vertexSource = [
      'attribute vec2 aPosition;',
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = aPosition * .5 + .5;',
      '  gl_Position = vec4(aPosition, 0.0, 1.0);',
      '}'
    ].join('\n');

    var fragmentSource = [
      'precision highp float;',
      'varying vec2 vUv;',
      'uniform vec2 uResolution;',
      'uniform vec2 uPointer;',
      'uniform float uTime;',
      'uniform float uScroll;',
      'uniform float uEnergy;',
      'float field(vec2 p){',
      '  float f = 0.0;',
      '  for(int i=0;i<6;i++){',
      '    float fi = float(i);',
      '    float speed = .105 + fi * .014;',
      '    vec2 c = vec2(sin(uTime*speed + fi*1.71), cos(uTime*(speed*.78) + fi*2.13));',
      '    c *= .25 + .045*sin(fi*2.37 + uScroll*3.0);',
      '    c += vec2(sin(uScroll*3.1415 + fi)*.11, cos(uScroll*2.4 + fi*.7)*.07);',
      '    c += uPointer * (.025 + fi*.002);',
      '    float r = .175 + .038*sin(fi*2.31 + uTime*.16 + uScroll*2.0);',
      '    vec2 d = p-c;',
      '    f += r*r/max(dot(d,d),.0022);',
      '  }',
      '  return f;',
      '}',
      'vec3 normalAt(vec2 p){',
      '  float e=.003;',
      '  float dx=field(p+vec2(e,0.0))-field(p-vec2(e,0.0));',
      '  float dy=field(p+vec2(0.0,e))-field(p-vec2(0.0,e));',
      '  return normalize(vec3(-dx,-dy,.42));',
      '}',
      'void main(){',
      '  vec2 uv=vUv-.5;',
      '  uv.x*=uResolution.x/max(uResolution.y,1.0);',
      '  uv*=1.34;',
      '  float f=field(uv);',
      '  float body=smoothstep(.82,1.08,f);',
      '  float glow=smoothstep(.42,.88,f)-body*.34;',
      '  if(body<.002 && glow<.002){gl_FragColor=vec4(0.0);return;}',
      '  vec3 n=normalAt(uv);',
      '  vec3 light=normalize(vec3(-.42+uPointer.x*.35,.58-uPointer.y*.28,.78));',
      '  float diffuse=max(dot(n,light),0.0);',
      '  float spec=pow(max(dot(reflect(-light,n),vec3(0.0,0.0,1.0)),0.0),24.0);',
      '  float fresnel=pow(1.0-max(n.z,0.0),2.4);',
      '  vec3 iris=vec3(.43,.31,.72);',
      '  vec3 lilac=vec3(.66,.51,.92);',
      '  vec3 amber=vec3(.90,.60,.19);',
      '  vec3 cream=vec3(.97,.91,.80);',
      '  float band=.5+.5*sin((uv.x-uv.y)*3.2+uScroll*4.0+n.x*2.0);',
      '  vec3 color=mix(iris,lilac,band);',
      '  color=mix(color,amber,clamp(vUv.y*.56+uScroll*.18,0.0,.72));',
      '  color*=.48+diffuse*.72;',
      '  color=mix(color,cream,spec*.58);',
      '  color+=fresnel*vec3(.24,.11,.30)*uEnergy;',
      '  color+=glow*vec3(.30,.12,.38);',
      '  float alpha=clamp(body*.92+glow*.34,0.0,.96);',
      '  gl_FragColor=vec4(color*alpha,alpha);',
      '}'
    ].join('\n');

    function shader(type, source) {
      var item = gl.createShader(type);
      gl.shaderSource(item, source);
      gl.compileShader(item);
      if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
        gl.deleteShader(item);
        return null;
      }
      return item;
    }

    var vertex = shader(gl.VERTEX_SHADER, vertexSource);
    var fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    var position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    var uniforms = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      time: gl.getUniformLocation(program, 'uTime'),
      scroll: gl.getUniformLocation(program, 'uScroll'),
      energy: gl.getUniformLocation(program, 'uEnergy')
    };
    var lastWidth = 0, lastHeight = 0, lastDraw = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var mobile = window.innerWidth < 760;
      var cap = mobile ? 360 : 640;
      var dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
      var scale = Math.min(dpr, cap / Math.max(rect.width, rect.height, 1));
      var width = Math.max(2, Math.round(rect.width * scale));
      var height = Math.max(2, Math.round(rect.height * scale));
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = canvas.width = width;
      lastHeight = canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    window.addEventListener('resize', function () { resize(); bus.wake(); }, { passive: true });
    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      visibility.webgl = false;
      hero.classList.remove('has-webgl');
      hero.classList.add('has-fluid-fallback');
    });

    resize();
    hero.classList.add('has-webgl');

    return function draw(time, state, progress) {
      if (!visibility.hero || !visibility.webgl) return false;
      if (REDUCED && lastDraw) return false;
      var fps = window.innerWidth < 760 ? 30 : 45;
      if (!REDUCED && time - lastDraw < 1 / fps) return true;
      lastDraw = time;
      resize();
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.pointer, state.pointerX, state.pointerY);
      gl.uniform1f(uniforms.time, REDUCED ? 3.2 : time);
      gl.uniform1f(uniforms.scroll, progress);
      gl.uniform1f(uniforms.energy, 0.72 + Math.min(Math.abs(state.scrollVelocity) / 2200, 0.26));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return !REDUCED;
    };
  }

  function init() {
    disruptTitle();
    var bus = createMotionBus();
    var viewport = hero.querySelector('.hero__viewport') || hero;
    var stage = hero.querySelector('[data-fluid-stage]');
    var canvas = hero.querySelector('[data-fluid-canvas]');
    var ticker = document.querySelector('[data-kinetic-ticker]');
    var tickerTrack = ticker && ticker.querySelector('.ticker__track');
    var tickerSet = ticker && ticker.querySelector('.ticker__set');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-inertia-card]'));
    var anchor = document.querySelector('[data-fluid-anchor]');
    var visibility = { hero: true, ticker: false, webgl: true };
    var visibleCards = [];
    var progress = 0;
    var tickerX = 0;
    var tickerVelocity = -20;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.target === hero) visibility.hero = entry.isIntersecting;
          else if (entry.target === ticker) visibility.ticker = entry.isIntersecting;
          else if (entry.target.hasAttribute('data-inertia-card')) {
            if (entry.isIntersecting && visibleCards.indexOf(entry.target) === -1) visibleCards.push(entry.target);
            if (!entry.isIntersecting) visibleCards = visibleCards.filter(function (card) { return card !== entry.target; });
          }
        });
        bus.wake();
      }, { rootMargin: '12% 0px 12% 0px' });
      observer.observe(hero);
      if (ticker) observer.observe(ticker);
      cards.forEach(function (card) { observer.observe(card); });
    } else {
      visibility.ticker = !!ticker;
      visibleCards = cards.slice();
    }

    var drawFluid = initWebGL(canvas, bus, visibility);
    if (!drawFluid) hero.classList.add('has-fluid-fallback');

    bus.subscribe(function (dt, state, time) {
      var rect = hero.getBoundingClientRect();
      var travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
      progress = REDUCED || window.innerWidth <= 920 ? 0 : clamp(-rect.top / travel, 0, 1);
      var shot = cameraAt(progress);
      var vw = viewport.clientWidth;
      var vh = viewport.clientHeight;
      var pointerRX = FINE && !REDUCED ? state.pointerY * -7 : 0;
      var pointerRY = FINE && !REDUCED ? state.pointerX * 11 : 0;

      hero.style.setProperty('--flow-x', ((shot.x - 0.5) * vw).toFixed(1) + 'px');
      hero.style.setProperty('--flow-y', ((shot.y - 0.5) * vh).toFixed(1) + 'px');
      hero.style.setProperty('--flow-scale', shot.scale.toFixed(4));
      hero.style.setProperty('--flow-rx', (shot.rx + pointerRX).toFixed(2) + 'deg');
      hero.style.setProperty('--flow-ry', (shot.ry + pointerRY).toFixed(2) + 'deg');
      hero.style.setProperty('--flow-rz', shot.rz.toFixed(2) + 'deg');
      hero.style.setProperty('--flow-depth', shot.depth.toFixed(1) + 'px');
      hero.style.setProperty('--flow-progress', progress.toFixed(4));
      hero.style.setProperty('--flow-word-opacity', clamp((progress - 0.72) / 0.22, 0, 1).toFixed(3));
      hero.style.setProperty('--flow-copy-opacity', (1 - clamp((progress - 0.48) / 0.26, 0, 0.78)).toFixed(3));
      hero.style.setProperty('--flow-map-opacity', (1 - clamp((progress - 0.36) / 0.30, 0, 0.88)).toFixed(3));
      hero.style.setProperty('--flow-map-y', (-progress * 22).toFixed(1) + 'px');

      var active = visibility.hero;
      if (drawFluid) active = drawFluid(time, state, progress) || active;

      if (visibility.ticker && tickerTrack && tickerSet && !REDUCED) {
        var impulse = clamp(state.scrollVelocity * -0.035, -96, 96);
        var target = -20 + impulse;
        tickerVelocity += (target - tickerVelocity) * Math.min(1, dt * 7.5);
        tickerVelocity *= Math.pow(0.992, dt * 60);
        tickerX += tickerVelocity * dt;
        var setWidth = tickerSet.offsetWidth;
        if (setWidth > 0) {
          while (tickerX <= -setWidth) tickerX += setWidth;
          while (tickerX > 0) tickerX -= setWidth;
        }
        tickerTrack.style.transform = 'translate3d(' + tickerX.toFixed(2) + 'px,0,0) skewX(' + clamp(tickerVelocity * -0.012, -4, 4).toFixed(2) + 'deg)';
        active = true;
      }

      if (!REDUCED && visibleCards.length) {
        visibleCards.forEach(function (card, index) {
          var skew = clamp(state.scrollVelocity * 0.0022, -4.2, 4.2) * Math.cos(index * 0.72);
          var y = clamp(state.scrollVelocity * -0.005, -10, 10) * Math.sin(index * 0.53 + 1.1);
          var currentSkew = parseFloat(card.dataset.motionSkew || '0');
          var currentY = parseFloat(card.dataset.motionY || '0');
          currentSkew += (skew - currentSkew) * Math.min(1, dt * 8);
          currentY += (y - currentY) * Math.min(1, dt * 7);
          card.dataset.motionSkew = currentSkew.toFixed(3);
          card.dataset.motionY = currentY.toFixed(3);
          card.style.setProperty('--card-skew', currentSkew.toFixed(3) + 'deg');
          card.style.setProperty('--card-y', currentY.toFixed(3) + 'px');
        });
        active = true;
      }

      if (anchor) {
        var anchorRect = anchor.getBoundingClientRect();
        var anchorProgress = clamp(1 - Math.abs((anchorRect.top + anchorRect.height * 0.5) / window.innerHeight - 0.5) * 1.7, 0, 1);
        anchor.style.setProperty('--anchor-progress', anchorProgress.toFixed(3));
        anchor.style.setProperty('--anchor-tilt', clamp(state.scrollVelocity * 0.0015, -3, 3).toFixed(2) + 'deg');
      }

      return active;
    });

    bus.wake();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
