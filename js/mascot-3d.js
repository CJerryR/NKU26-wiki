/* ==========================================================================
   NKU iGEM 2026  -  SUBSURFACE homepage detective  (procedural Three.js r149)

   A single narrative investigator built entirely from real 3D geometry:
   rounded warm-yellow body, brown deerstalker with a purple bow, one large
   magnified eye behind a lime/purple instrument, moustache, arms and running
   feet. No sprites, no image sequences. The scene is lit by a small procedural
   environment map (image-based lighting) plus a warm key and two coloured rim
   lights, so the standard materials read as genuinely three-dimensional while
   staying inside the corrected low-exposure warm palette.

   The module owns only the WebGL scene. All scroll / route / gaze intent is
   pushed in from main.js through a lightweight state object, and the render
   loop eases every pose toward that intent. Lifecycle (visibility, context
   loss, resize, first-frame failure, offscreen / zero-opacity pausing) is
   handled here so the loop never runs when it cannot be seen.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.THREE) return;
  var T = window.THREE;

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- small geometry helpers ------------------------------------------ */

  function standard(color, roughness, metalness, extra) {
    var params = {
      color: new T.Color(color),
      roughness: roughness == null ? 0.6 : roughness,
      metalness: metalness || 0
    };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) params[k] = extra[k];
    return new T.MeshStandardMaterial(params);
  }

  // A unit sphere reused everywhere; scale per-mesh to make ellipsoids.
  function blob(parent, geo, mat, pos, scale, rot) {
    var m = new T.Mesh(geo, mat);
    m.position.set(pos[0], pos[1], pos[2]);
    m.scale.set(scale[0], scale[1], scale[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    m.castShadow = true;
    m.receiveShadow = false;
    parent.add(m);
    return m;
  }

  function smoothTube(parent, pts, radius, mat, segments) {
    var curve = new T.CatmullRomCurve3(pts.map(function (p) {
      return new T.Vector3(p[0], p[1], p[2]);
    }));
    var geo = new T.TubeGeometry(curve, segments || 20, radius, 8, false);
    var m = new T.Mesh(geo, mat);
    m.castShadow = true;
    parent.add(m);
    return m;
  }

  /* ---- procedural environment map -------------------------------------- */
  /* A warm studio gradient baked to an equirect canvas texture, run through
     PMREMGenerator so MeshStandardMaterial gets soft image-based reflections.
     This is the single biggest reason the model reads as 3D rather than flat,
     and it keeps the palette warm without blowing out exposure. */
  function buildEnvironment(renderer) {
    var w = 128, h = 64;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#3a3326');   // warm sky glow
    grad.addColorStop(0.42, '#211c17');
    grad.addColorStop(0.7, '#14100d');
    grad.addColorStop(1.0, '#0a0a08');   // dark soil floor
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // A soft warm key highlight upper-left and cool fills so reflections read.
    function glow(x, y, r, color) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    glow(w * 0.3, h * 0.26, h * 0.85, 'rgba(255,224,168,0.9)');   // key
    glow(w * 0.82, h * 0.4, h * 0.6, 'rgba(150,90,210,0.32)');    // violet rim
    glow(w * 0.1, h * 0.62, h * 0.5, 'rgba(150,190,60,0.22)');    // lime fill

    var tex = new T.CanvasTexture(canvas);
    tex.mapping = T.EquirectangularReflectionMapping;
    if ('colorSpace' in tex) tex.colorSpace = T.SRGBColorSpace;
    else tex.encoding = T.sRGBEncoding;

    var pmrem = new T.PMREMGenerator(renderer);
    var envRT = pmrem.fromEquirectangular(tex);
    tex.dispose();
    pmrem.dispose();
    return envRT.texture;
  }

  /* ---- the character ---------------------------------------------------- */

  function buildDetective(scene, quality) {
    var seg = quality.low ? 20 : 32;
    var segH = quality.low ? 14 : 22;
    var sphere = new T.SphereGeometry(1, seg, segH);

    // Palette derived from the mascot reference art, kept warm and separated.
    var bodyMat   = standard(0xE8A63D, 0.52, 0.02, { envMapIntensity: 0.72 });
    var bodyDeep  = standard(0xC9832A, 0.6, 0.0,  { envMapIntensity: 0.55 });
    var bellyMat  = standard(0xF4C871, 0.46, 0.0, { envMapIntensity: 0.68 });
    var sclera    = standard(0xF6EEDD, 0.28, 0.0, { envMapIntensity: 1.0 });
    var iris      = standard(0x2A1A12, 0.24, 0.05,{ envMapIntensity: 1.15 });
    var hatMat    = standard(0x6E3C1E, 0.74, 0.0, { envMapIntensity: 0.42 });
    var hatDeep   = standard(0x4A2814, 0.8, 0.0,  { envMapIntensity: 0.32 });
    var stitch    = standard(0x35200F, 0.85, 0.0, { envMapIntensity: 0.25 });
    var moustache = standard(0x4A2A12, 0.62, 0.0, { envMapIntensity: 0.35 });
    var purple    = standard(0x7A2C9C, 0.4, 0.06, { envMapIntensity: 0.85 });
    var purpleHot = standard(0xA24BC0, 0.34, 0.08,{ envMapIntensity: 0.95 });
    var lens      = new T.MeshStandardMaterial({
      color: new T.Color(0xA6E82E),
      roughness: 0.35, metalness: 0,
      transparent: true, opacity: 0.94, envMapIntensity: 0.4,
      emissive: new T.Color(0x86c422), emissiveIntensity: 0.6,
      depthWrite: false, side: T.DoubleSide, toneMapped: false
    });

    // root -> bodyRig lets main.js lean the whole character while sub-rigs
    // (legs, arms, instrument, eyes) animate locally against it.
    var root = new T.Group();
    scene.add(root);
    var bodyRig = new T.Group();
    root.add(bodyRig);

    // --- body: a soft egg, slightly taller than wide -------------------
    blob(bodyRig, sphere, bodyMat, [0, 0, 0], [1.72, 1.62, 1.6]);
    // belly / face-front lightening for readable front plane
    blob(bodyRig, sphere, bellyMat, [0, -0.28, 0.62], [1.22, 1.16, 1.05]);
    // subtle underside shading so the volume turns
    blob(bodyRig, sphere, bodyDeep, [0, 0.5, -0.5], [1.55, 1.2, 1.4]);

    /* --- eyes ---------------------------------------------------------
       The detective holds the lens in front of its LEFT eye (viewer right),
       so that eye reads large and round; the other is a smaller normal eye.
       Groups let main.js dart the gaze without touching sockets.        */
    var faceZ = 1.34;
    var eyes = new T.Group();
    bodyRig.add(eyes);

    // big magnified eye (viewer's right)
    var bigEye = new T.Group();
    bigEye.position.set(0.52, 0.14, faceZ - 0.02);
    eyes.add(bigEye);
    blob(bigEye, sphere, sclera, [0, 0, 0], [0.62, 0.66, 0.4]);
    var bigIris = blob(bigEye, sphere, iris, [0.02, -0.02, 0.34], [0.3, 0.32, 0.16]);
    var bigHi = blob(bigEye, sphere, sclera, [-0.16, 0.18, 0.5], [0.09, 0.11, 0.05]);
    bigHi.material = standard(0xffffff, 0.2, 0, { envMapIntensity: 1.2 });

    // smaller eye (viewer's left)
    var smallEye = new T.Group();
    smallEye.position.set(-0.6, 0.2, faceZ - 0.16);
    eyes.add(smallEye);
    blob(smallEye, sphere, sclera, [0, 0, 0], [0.4, 0.46, 0.3]);
    var smallIris = blob(smallEye, sphere, iris, [0.04, -0.02, 0.26], [0.19, 0.22, 0.12]);
    var smallHi = blob(smallEye, sphere, sclera, [-0.1, 0.12, 0.36], [0.06, 0.08, 0.04]);
    smallHi.material = bigHi.material;

    // brow ridge tint between the eyes
    blob(bodyRig, sphere, bodyDeep, [-0.04, 0.44, faceZ - 0.18], [0.5, 0.2, 0.3]);

    /* --- moustache: a horizontal handlebar under the nose ------------
       Two mirrored tubes kept forward (high z) so they sit proud of the
       face and read as a dark bar, curling up at the outer tips.         */
    var my = -0.14;
    smoothTube(bodyRig, [
      [-0.05, my - 0.02, faceZ + 0.34],
      [-0.38, my - 0.04, faceZ + 0.24],
      [-0.72, my - 0.02, faceZ + 0.02],
      [-0.9, my + 0.16, faceZ - 0.12]
    ], 0.12, moustache, 22);
    smoothTube(bodyRig, [
      [0.05, my - 0.02, faceZ + 0.34],
      [0.4, my - 0.04, faceZ + 0.24],
      [0.76, my - 0.02, faceZ + 0.02],
      [0.94, my + 0.16, faceZ - 0.12]
    ], 0.12, moustache, 22);
    // centre dip of the moustache, sitting proud
    blob(bodyRig, sphere, moustache, [0, my - 0.06, faceZ + 0.38], [0.16, 0.1, 0.12]);
    // little nose bump above the moustache centre
    blob(bodyRig, sphere, bodyDeep, [0, 0.04, faceZ + 0.3], [0.13, 0.12, 0.12]);

    /* --- deerstalker hat --------------------------------------------
       A dome cap + front brim + rear brim + a crossing centre seam and a
       brim rim, then a purple bow pinned to the upper-left.             */
    var cap = new T.Group();
    cap.position.set(0, 1.02, 0);
    cap.rotation.z = -0.05;
    bodyRig.add(cap);

    // main dome (squashed sphere)
    blob(cap, sphere, hatMat, [-0.05, 0.18, 0.04], [1.72, 0.92, 1.62]);
    // darker under-brim band that separates hat from head
    blob(cap, sphere, hatDeep, [0, -0.12, 0.5], [1.78, 0.3, 1.4], [0.1, 0, 0]);
    // front brim (flap over the brow)
    blob(cap, sphere, hatMat, [0, -0.16, 1.2], [1.5, 0.26, 0.62], [0.32, 0, 0]);
    // rear brim
    blob(cap, sphere, hatMat, [0, -0.06, -1.15], [1.4, 0.26, 0.6], [-0.34, 0, 0]);
    // centre seam over the crown
    smoothTube(cap, [[-0.06, 1.02, -0.9], [-0.1, 1.16, 0.1], [-0.04, 0.82, 1.25]], 0.05, stitch, 18);
    // brim rim seam wrapping the base
    smoothTube(cap, [
      [-1.55, -0.02, 0.7], [-0.7, -0.12, 1.35], [0.6, -0.12, 1.4],
      [1.55, -0.02, 0.72], [0.7, 0.02, -1.2], [-0.7, 0.02, -1.22], [-1.55, -0.02, 0.7]
    ], 0.045, stitch, 40);

    // purple bow, upper-left of the cap
    var bow = new T.Group();
    bow.position.set(-0.72, 0.92, 0.55);
    bow.rotation.set(0.15, 0.3, -0.3);
    cap.add(bow);
    // two flat splayed loops
    blob(bow, sphere, purple, [-0.4, 0.02, 0], [0.5, 0.3, 0.16], [0, 0.35, 0.5]);
    blob(bow, sphere, purple, [0.4, 0.02, 0], [0.5, 0.3, 0.16], [0, -0.35, -0.5]);
    // knot
    blob(bow, sphere, purpleHot, [0, 0, 0.08], [0.2, 0.22, 0.18]);
    // trailing tails
    blob(bow, sphere, purple, [-0.12, -0.34, 0.02], [0.12, 0.26, 0.1], [0, 0, 0.3]);
    blob(bow, sphere, purple, [0.14, -0.34, 0.02], [0.12, 0.26, 0.1], [0, 0, -0.3]);

    /* --- legs & feet: capsules angled into a mid-stride stance ------- */
    function legGeo() { return new T.CapsuleGeometry(0.26, 0.34, 6, quality.low ? 10 : 16); }

    var leftLeg = new T.Group();
    leftLeg.position.set(-0.66, -1.4, 0.16);
    bodyRig.add(leftLeg);
    var leftShin = new T.Mesh(legGeo(), bodyMat);
    leftShin.castShadow = true;
    leftShin.position.y = -0.2;
    leftLeg.add(leftShin);
    blob(leftLeg, sphere, bodyDeep, [-0.06, -0.6, 0.34], [0.42, 0.24, 0.56], [0.1, 0, -0.05]);

    var rightLeg = new T.Group();
    rightLeg.position.set(0.7, -1.38, 0.12);
    bodyRig.add(rightLeg);
    var rightShin = new T.Mesh(legGeo(), bodyMat);
    rightShin.castShadow = true;
    rightShin.position.y = -0.2;
    rightLeg.add(rightShin);
    blob(rightLeg, sphere, bodyDeep, [0.08, -0.6, 0.36], [0.42, 0.24, 0.56], [0.1, 0, 0.05]);

    /* --- arms: left tucked, right raised holding the instrument ------ */
    function armGeo(len) { return new T.CapsuleGeometry(0.2, len, 6, quality.low ? 10 : 14); }

    var leftArm = new T.Group();
    leftArm.position.set(-1.42, -0.18, 0.5);
    leftArm.rotation.set(0.2, 0, 0.7);
    bodyRig.add(leftArm);
    var leftArmMesh = new T.Mesh(armGeo(0.46), bodyMat);
    leftArmMesh.castShadow = true;
    leftArmMesh.position.y = -0.22;
    leftArm.add(leftArmMesh);
    blob(leftArm, sphere, bodyDeep, [0, -0.56, 0.05], [0.24, 0.22, 0.24]);

    // right arm reaches up-and-forward toward the raised magnifier
    var rightArm = new T.Group();
    rightArm.position.set(1.34, -0.12, 0.62);
    rightArm.rotation.set(0.4, -0.2, -1.15);
    bodyRig.add(rightArm);
    var rightArmMesh = new T.Mesh(armGeo(0.56), bodyMat);
    rightArmMesh.castShadow = true;
    rightArmMesh.position.y = -0.28;
    rightArm.add(rightArmMesh);
    var rightHand = blob(rightArm, sphere, bodyDeep, [0.02, -0.66, 0.06], [0.24, 0.22, 0.24]);

    /* --- magnifying instrument, held up beside the big eye ----------- */
    /* Faces the camera so the lime lens is visible; positioned to the
       viewer's right at eye height, extending outward but kept framed. */
    var instrument = new T.Group();
    instrument.position.set(1.5, 0.32, 1.4);
    instrument.rotation.set(0.05, 0.12, 0.12);
    bodyRig.add(instrument);

    var rim = new T.Mesh(new T.TorusGeometry(0.5, 0.08, quality.low ? 8 : 16, quality.low ? 24 : 40), purple);
    rim.castShadow = true;
    instrument.add(rim);
    // the lime lens inside the rim (double-sided translucent disc), tipped
    // slightly toward the camera so the green face catches light
    var lensMesh = new T.Mesh(new T.CircleGeometry(0.47, quality.low ? 24 : 40), lens);
    lensMesh.position.z = 0.02;
    instrument.add(lensMesh);
    // rim inner bevel for a little glassy depth
    var rimInner = new T.Mesh(new T.TorusGeometry(0.47, 0.03, 8, quality.low ? 24 : 36), purpleHot);
    instrument.add(rimInner);
    // handle down toward the hand
    var handle = new T.Mesh(new T.CapsuleGeometry(0.075, 0.62, 6, 12), purpleHot);
    handle.position.set(-0.34, -0.62, -0.06);
    handle.rotation.z = -0.62;
    handle.castShadow = true;
    instrument.add(handle);

    return {
      root: root,
      bodyRig: bodyRig,
      eyes: eyes,
      bigEye: bigEye,
      smallEye: smallEye,
      bigIris: bigIris,
      smallIris: smallIris,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      leftArm: leftArm,
      rightArm: rightArm,
      instrument: instrument,
      lens: lens
    };
  }

  /* ---- ground contact shadow ------------------------------------------- */
  function buildShadowCatcher(scene) {
    var geo = new T.PlaneGeometry(9, 9);
    var mat = new T.ShadowMaterial({ opacity: 0.32 });
    var plane = new T.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2.05;
    plane.receiveShadow = true;
    scene.add(plane);
    return plane;
  }

  /* ---- main factory ---------------------------------------------------- */

  function create(host) {
    if (!host || host.dataset.mascotReady === 'true') return null;
    var canvas = host.querySelector('canvas');
    if (!canvas) return null;

    var quality = { low: window.innerWidth < 700 };

    var renderer;
    try {
      renderer = new T.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !quality.low,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
    } catch (err) {
      host.dataset.mascotFailed = 'true';
      return null;
    }

    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = T.SRGBColorSpace;
    else renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    var scene = new T.Scene();

    var camera = new T.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0.15, 12.4);
    camera.lookAt(0, -0.05, 0);

    // environment (IBL) + explicit lights
    var envTex = null;
    try {
      envTex = buildEnvironment(renderer);
      scene.environment = envTex;
    } catch (envErr) {
      envTex = null; // materials still lit by the explicit lights below
    }

    var hemi = new T.HemisphereLight(0xffe9c8, 0x241a16, 0.5);
    scene.add(hemi);

    var key = new T.DirectionalLight(0xffe4be, 1.15);
    key.position.set(-3.4, 5.2, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.width = quality.low ? 512 : 1024;
    key.shadow.mapSize.height = quality.low ? 512 : 1024;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0012;
    key.shadow.radius = 3;
    scene.add(key);

    var limeRim = new T.PointLight(0xa9e63a, 0.7, 16, 2);
    limeRim.position.set(3.8, 1.4, 3.4);
    scene.add(limeRim);

    var violetRim = new T.PointLight(0x8a4bd6, 0.6, 16, 2);
    violetRim.position.set(-3.6, -1.8, 2.6);
    scene.add(violetRim);

    var parts = buildDetective(scene, quality);
    var shadowCatcher = buildShadowCatcher(scene);

    /* ---- shared intent state (written by main.js) --------------------
       progress : 0..1 story position (review -> mechanism -> closing)
       gx, gy   : -1..1 pointer gaze target (fine pointers only)
       lift     : extra camera pull for the closing hero moment          */
    var intent = { progress: 0, gx: 0, gy: 0, lift: 0 };

    // eased animation state
    var reduced = motionQuery.matches;
    var running = false;         // is the rAF loop currently scheduled
    var onScreen = true;         // IntersectionObserver visibility
    var docVisible = !document.hidden;
    var contextLost = false;
    var failed = false;
    var firstFrame = true;

    var clock = { start: performance.now(), last: 0 };
    var frameInterval = quality.low ? 1000 / 30 : 1000 / 48;

    // smoothed values so pose changes never jump
    var s = {
      progress: 0, gx: 0, gy: 0, lift: 0,
      turn: 0, lean: 0
    };

    function resize() {
      var w = Math.max(host.clientWidth, 1);
      var h = Math.max(host.clientHeight, 1);
      var dpr = Math.min(window.devicePixelRatio || 1, w < 300 ? 1.25 : 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      quality.low = window.innerWidth < 700;
      frameInterval = quality.low ? 1000 / 30 : 1000 / 48;
      renderOnce();
    }

    function renderOnce() {
      try {
        renderer.render(scene, camera);
        if (firstFrame) {
          firstFrame = false;
          host.classList.add('is-rendered');
        }
      } catch (rErr) {
        // first-frame or mid-run GL failure -> drop to the PNG fallback
        fail();
      }
    }

    function fail() {
      running = false;
      failed = true;
      host.dataset.mascotFailed = 'true';
      host.classList.remove('is-rendered');
    }

    function frame(now) {
      running = false;
      if (contextLost || failed) return;
      if (!shouldRun()) return;

      if (!reduced && now - clock.last < frameInterval) {
        schedule();
        return;
      }
      clock.last = now;
      var t = (now - clock.start) / 1000;

      // pull latest intent (main.js updates `intent` in place)
      var p = intent.progress;
      var ease = 0.09;
      s.progress += (p - s.progress) * ease;
      s.gx += (intent.gx - s.gx) * 0.12;
      s.gy += (intent.gy - s.gy) * 0.12;
      s.lift += (intent.lift - s.lift) * 0.08;

      // idle breathing + a slow walking gait tied to progress
      var idle = reduced ? 0 : Math.sin(t * 1.1);
      var gait = reduced ? 0 : Math.sin(p * Math.PI * 6 + t * 3.4);
      var blink = reduced ? 1 : (Math.sin(t * 1.3 + 0.5) > 0.97 ? 0.12 : 1);

      // whole-body turn: faces slightly left entering, squares up by closing
      var targetTurn = -0.26 + s.progress * 0.4 + s.gx * 0.12;
      var targetLean = Math.sin(s.progress * Math.PI) * 0.05 + s.gy * -0.05;
      s.turn += (targetTurn - s.turn) * 0.07;
      s.lean += (targetLean - s.lean) * 0.07;

      parts.root.position.y = -0.05 + idle * 0.04 + s.progress * 0.02;
      parts.bodyRig.rotation.y = s.turn;
      parts.bodyRig.rotation.x = s.lean;
      parts.bodyRig.rotation.z = idle * 0.01;

      // legs stride; amplitude fades as the walk settles at the close
      var stride = 0.16 * (1 - s.progress * 0.35);
      parts.leftLeg.rotation.x = gait * stride;
      parts.rightLeg.rotation.x = -gait * stride;

      // arms counter-swing; the instrument arm stays composed
      parts.leftArm.rotation.z = 0.6 - gait * 0.05;
      parts.rightArm.rotation.z = -0.95 + Math.sin(t * 1.4) * 0.03;

      // instrument: a slow inspecting sweep, lifts a touch toward the close
      parts.instrument.rotation.z = -0.1 + Math.sin(t * 1.6) * 0.05;
      parts.instrument.position.y = 0.2 + Math.sin(t * 1.6 + 0.4) * 0.03 + s.progress * 0.05;
      var pulse = 0.9 + Math.sin(t * 2.2) * 0.04;
      parts.lens.opacity = reduced ? 0.94 : pulse;
      parts.lens.emissiveIntensity = 0.6 + (reduced ? 0 : Math.sin(t * 2.2) * 0.1);

      // gaze: irises + eye groups dart toward the pointer, bounded
      var gxA = s.gx * 0.12, gyA = s.gy * 0.1 - 0.02;
      parts.bigIris.position.x = 0.02 + gxA;
      parts.bigIris.position.y = -0.02 + gyA;
      parts.smallIris.position.x = 0.04 + gxA * 0.8;
      parts.smallIris.position.y = -0.02 + gyA * 0.8;
      parts.eyes.rotation.y = s.gx * 0.05;
      parts.eyes.rotation.x = s.gy * -0.04;
      parts.bigEye.scale.y = blink;
      parts.smallEye.scale.y = blink;

      // gentle camera dolly: pulls in slightly through the story + closing lift
      var camZ = 12.4 - s.progress * 1.4 - s.lift * 0.7;
      camera.position.x += ((s.gx * 0.25) - camera.position.x) * 0.05;
      camera.position.z += (camZ - camera.position.z) * 0.06;
      camera.position.y += ((0.15 + s.lift * 0.15) - camera.position.y) * 0.06;
      camera.lookAt(0, -0.05, 0);

      // subtle light life
      limeRim.intensity = 0.6 + (reduced ? 0 : Math.sin(t * 1.7) * 0.14);

      renderOnce();
      if (!reduced && shouldRun()) schedule();
    }

    function shouldRun() {
      // pause when tab hidden, offscreen, context lost, or runner faded out
      if (failed || contextLost || document.hidden || !onScreen) return false;
      var runner = host.closest('[data-mascot-runner]');
      if (runner) {
        var alpha = parseFloat(runner.style.getPropertyValue('--runner-alpha')) || 0;
        if (alpha <= 0.012) return false;
      }
      return true;
    }

    function schedule() {
      if (running) return;
      running = true;
      window.requestAnimationFrame(frame);
    }

    // Public kick used by main.js after every scroll update so a paused loop
    // resumes the instant the runner becomes visible again.
    function wake() {
      if (reduced) { renderOnce(); return; }
      if (shouldRun()) {
        clock.last = 0; // render immediately on next frame
        schedule();
      }
    }

    /* ---- lifecycle wiring -------------------------------------------- */

    // ResizeObserver (preferred) with a window-resize fallback
    var ro = null;
    if (typeof window.ResizeObserver === 'function') {
      ro = new window.ResizeObserver(function () { resize(); });
      ro.observe(host);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    // Offscreen pause/resume via the untransformed host
    if (typeof window.IntersectionObserver === 'function') {
      new window.IntersectionObserver(function (entries) {
        var e = entries[0];
        onScreen = !!(e && e.isIntersecting);
        if (onScreen) wake();
      }, { rootMargin: '20% 0px' }).observe(host);
    }

    // Page visibility
    document.addEventListener('visibilitychange', function () {
      docVisible = !document.hidden;
      if (docVisible) wake();
    });

    // Live reduced-motion changes (no refresh required)
    function onMotionChange() {
      reduced = motionQuery.matches;
      if (reduced) { running = false; renderOnce(); }
      else wake();
    }
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

    // WebGL context loss / restore
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      contextLost = true;
      running = false;
      host.dataset.mascotFailed = 'true';
      host.classList.remove('is-rendered');
    }, false);

    canvas.addEventListener('webglcontextrestored', function () {
      contextLost = false;
      failed = false;
      host.removeAttribute('data-mascot-failed');
      firstFrame = true;
      try {
        if (envTex) { scene.environment = envTex; }
        resize();
        wake();
      } catch (restoreErr) {
        fail();
      }
    }, false);

    host.dataset.mascotReady = 'true';

    // initial paint
    resize();
    if (reduced) renderOnce();
    else { onScreen = true; wake(); }

    // hand main.js the intent object + a wake() hook
    return {
      intent: intent,
      wake: wake,
      resize: resize
    };
  }

  window.NKUMascot3D = { create: create };
}());
