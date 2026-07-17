(function () {
  'use strict';

  if (!window.THREE) return;

  var T = window.THREE;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createMaterial(color, roughness, metalness) {
    return new T.MeshStandardMaterial({
      color: color,
      roughness: roughness == null ? 0.58 : roughness,
      metalness: metalness || 0
    });
  }

  function ellipsoid(parent, geometry, material, position, scale, rotation) {
    var mesh = new T.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function capsule(parent, material, position, scale, rotation) {
    var mesh = new T.Mesh(new T.CapsuleGeometry(0.34, 0.82, 7, 14), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function tube(parent, points, radius, material) {
    var curve = new T.CatmullRomCurve3(points.map(function (p) {
      return new T.Vector3(p[0], p[1], p[2]);
    }));
    var mesh = new T.Mesh(new T.TubeGeometry(curve, 24, radius, 8, false), material);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function create(host) {
    if (!host || host.dataset.mascotReady === 'true') return null;
    var canvas = host.querySelector('canvas');
    if (!canvas) return null;

    var renderer;
    try {
      renderer = new T.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      host.dataset.mascotFailed = 'true';
      return null;
    }

    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = T.SRGBColorSpace;
    else renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = window.innerWidth > 680;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.05, 10.4);
    camera.lookAt(0, 0, 0);

    scene.add(new T.HemisphereLight(0xfff4d9, 0x24112f, 2.25));

    var key = new T.DirectionalLight(0xfff1cf, 4.1);
    key.position.set(-4, 6, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    var signal = new T.PointLight(0xb7ff2a, 18, 16, 2);
    signal.position.set(4.6, 1.2, 4.5);
    scene.add(signal);

    var violet = new T.PointLight(0x8a4bd6, 14, 15, 2);
    violet.position.set(-4.4, -2.5, 3.8);
    scene.add(violet);

    var root = new T.Group();
    root.position.y = -0.08;
    scene.add(root);

    var bodyRig = new T.Group();
    root.add(bodyRig);

    var sphere = new T.SphereGeometry(1, 40, 28);
    var bodyMat = createMaterial(0xf7bf55, 0.62, 0.01);
    var bodyLight = createMaterial(0xffd675, 0.58, 0);
    var cream = createMaterial(0xfffbf0, 0.38, 0);
    var pupil = createMaterial(0x3a2115, 0.5, 0);
    var brown = createMaterial(0x744324, 0.78, 0);
    var brownDark = createMaterial(0x44291f, 0.84, 0);
    var purple = createMaterial(0x8722a7, 0.42, 0.02);
    var purpleHot = createMaterial(0xc14bd8, 0.34, 0.03);
    var signalMat = createMaterial(0xb7ff2a, 0.28, 0.08);

    var body = ellipsoid(bodyRig, sphere, bodyMat, [0, -0.05, 0], [2.05, 1.82, 1.57]);
    ellipsoid(bodyRig, sphere, bodyLight, [-0.82, -0.68, 1.27], [0.28, 0.36, 0.12]);
    ellipsoid(bodyRig, sphere, bodyLight, [-1.25, -0.35, 1.12], [0.15, 0.2, 0.08]);

    var eyes = new T.Group();
    bodyRig.add(eyes);
    var eyeLeft = ellipsoid(eyes, sphere, cream, [-0.57, 0.39, 1.38], [0.66, 0.82, 0.3]);
    var eyeRight = ellipsoid(eyes, sphere, cream, [0.56, 0.39, 1.38], [0.66, 0.82, 0.3]);
    var pupilLeft = ellipsoid(eyes, sphere, pupil, [-0.36, 0.42, 1.66], [0.23, 0.38, 0.1]);
    var pupilRight = ellipsoid(eyes, sphere, pupil, [0.77, 0.42, 1.66], [0.23, 0.38, 0.1]);
    ellipsoid(eyes, sphere, cream, [-0.3, 0.57, 1.76], [0.055, 0.09, 0.035]);
    ellipsoid(eyes, sphere, cream, [0.83, 0.57, 1.76], [0.055, 0.09, 0.035]);

    ellipsoid(bodyRig, sphere, bodyLight, [0.04, -0.14, 1.63], [0.34, 0.31, 0.23]);
    tube(bodyRig, [[-0.02, -0.38, 1.72], [-0.37, -0.62, 1.75], [-0.79, -0.55, 1.66]], 0.15, brown);
    tube(bodyRig, [[0.02, -0.38, 1.72], [0.37, -0.62, 1.75], [0.79, -0.55, 1.66]], 0.15, brown);
    tube(bodyRig, [[-0.72, -0.55, 1.67], [-0.98, -0.48, 1.61], [-1.13, -0.62, 1.54]], 0.08, brown);
    tube(bodyRig, [[0.72, -0.55, 1.67], [0.98, -0.48, 1.61], [1.13, -0.62, 1.54]], 0.08, brown);

    var cap = new T.Group();
    cap.rotation.z = -0.06;
    bodyRig.add(cap);
    ellipsoid(cap, sphere, brown, [-0.1, 1.35, 0.08], [2.03, 0.83, 1.55]);
    ellipsoid(cap, sphere, brownDark, [-0.02, 1.08, 1.08], [2.12, 0.22, 0.8], [0.06, 0, -0.04]);
    tube(cap, [[-0.14, 2.0, 0.28], [-0.22, 1.6, 1.42], [-0.12, 1.12, 1.72]], 0.045, brownDark);
    tube(cap, [[-1.55, 1.1, 1.02], [-0.72, 1.04, 1.53], [0.52, 1.08, 1.66], [1.72, 1.04, 1.12]], 0.045, brownDark);

    var bow = new T.Group();
    bow.position.set(-0.72, 2.05, 0.28);
    bow.rotation.z = -0.12;
    cap.add(bow);
    ellipsoid(bow, sphere, purple, [-0.42, 0, 0], [0.58, 0.24, 0.25], [0, 0.08, 0.2]);
    ellipsoid(bow, sphere, purple, [0.42, 0, 0], [0.58, 0.24, 0.25], [0, -0.08, -0.2]);
    ellipsoid(bow, sphere, purpleHot, [0, 0, 0.12], [0.23, 0.22, 0.2]);

    var leftLeg = new T.Group();
    leftLeg.position.set(-0.85, -1.43, 0.05);
    bodyRig.add(leftLeg);
    capsule(leftLeg, bodyMat, [0, -0.28, 0], [0.74, 0.78, 0.74], [0, 0, -0.18]);
    ellipsoid(leftLeg, sphere, bodyLight, [-0.12, -0.91, 0.28], [0.72, 0.39, 0.85], [0.06, -0.12, -0.08]);

    var rightLeg = new T.Group();
    rightLeg.position.set(0.88, -1.42, 0.02);
    bodyRig.add(rightLeg);
    capsule(rightLeg, bodyMat, [0, -0.28, 0], [0.74, 0.78, 0.74], [0, 0, 0.18]);
    ellipsoid(rightLeg, sphere, bodyLight, [0.18, -0.91, 0.29], [0.72, 0.39, 0.85], [0.06, 0.12, 0.08]);

    var leftArm = new T.Group();
    leftArm.position.set(-1.75, -0.02, 0.15);
    leftArm.rotation.z = 0.7;
    bodyRig.add(leftArm);
    capsule(leftArm, bodyMat, [0, -0.26, 0], [0.7, 0.78, 0.7], [0, 0, 0]);
    ellipsoid(leftArm, sphere, bodyLight, [0, -0.9, 0.05], [0.38, 0.35, 0.38]);

    var rightArm = new T.Group();
    rightArm.position.set(1.65, 0.05, 0.18);
    rightArm.rotation.z = -1.02;
    bodyRig.add(rightArm);
    capsule(rightArm, bodyMat, [0, -0.35, 0], [0.68, 1.04, 0.68], [0, 0, 0]);
    ellipsoid(rightArm, sphere, bodyLight, [0, -1.08, 0.04], [0.38, 0.35, 0.38]);

    var sensor = new T.Group();
    sensor.position.set(2.8, 0.35, 0.48);
    sensor.rotation.z = -0.06;
    bodyRig.add(sensor);
    var ring = new T.Mesh(new T.TorusGeometry(0.48, 0.09, 12, 42), purpleHot);
    ring.castShadow = true;
    sensor.add(ring);
    var lens = new T.Mesh(new T.CircleGeometry(0.39, 42), new T.MeshPhysicalMaterial({
      color: 0xb7ff2a,
      transparent: true,
      opacity: 0.16,
      roughness: 0.12,
      transmission: 0.5,
      depthWrite: false,
      side: T.DoubleSide
    }));
    lens.position.z = 0.01;
    sensor.add(lens);
    var sensorDot = ellipsoid(sensor, sphere, signalMat, [0, 0, 0.08], [0.08, 0.08, 0.05]);
    var handle = new T.Mesh(new T.CapsuleGeometry(0.085, 0.64, 6, 10), purple);
    handle.position.set(-0.48, -0.5, 0);
    handle.rotation.z = -0.76;
    handle.castShadow = true;
    sensor.add(handle);

    var shadow = new T.Mesh(
      new T.CircleGeometry(2.2, 48),
      new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24, depthWrite: false })
    );
    shadow.position.set(0, -2.18, -0.4);
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.y = 0.34;
    root.add(shadow);

    var pointerX = 0;
    var pointerY = 0;
    var visible = true;
    var start = performance.now();

    function resize() {
      var width = Math.max(host.clientWidth, 1);
      var height = Math.max(host.clientHeight, 1);
      var pixelRatio = Math.min(window.devicePixelRatio || 1, width < 360 ? 1.25 : 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    function render(now) {
      var time = (now - start) / 1000;
      var runner = host.closest('[data-mascot-runner]');
      var progress = runner ? parseFloat(runner.dataset.mascotProgress || '0') : 0;
      var gait = Math.sin(progress * Math.PI * 10 + time * 1.15);
      var idle = reduced ? 0 : Math.sin(time * 1.8);
      var blink = reduced ? 1 : (Math.sin(time * 1.37 + 0.6) > 0.985 ? 0.08 : 1);

      root.position.y = -0.08 + idle * 0.045;
      bodyRig.rotation.y += ((-0.28 + progress * 0.54 + pointerX * 0.1) - bodyRig.rotation.y) * 0.055;
      bodyRig.rotation.x += ((pointerY * 0.06 + Math.sin(progress * Math.PI) * 0.04) - bodyRig.rotation.x) * 0.055;
      bodyRig.rotation.z = idle * 0.012;
      leftLeg.rotation.z = gait * 0.18;
      rightLeg.rotation.z = -gait * 0.18;
      leftArm.rotation.z = 0.7 - gait * 0.08;
      rightArm.rotation.z = -1.02 + gait * 0.06;
      sensor.rotation.z = -0.06 + idle * 0.04;
      sensor.scale.setScalar(1 + Math.sin(time * 2.4) * 0.018);
      sensorDot.scale.setScalar(1 + Math.sin(time * 3.8) * 0.28);
      eyeLeft.scale.y = 0.82 * blink;
      eyeRight.scale.y = 0.82 * blink;
      pupilLeft.position.x = -0.36 + pointerX * 0.08;
      pupilRight.position.x = 0.77 + pointerX * 0.08;
      pupilLeft.position.y = 0.42 - pointerY * 0.05;
      pupilRight.position.y = 0.42 - pointerY * 0.05;
      signal.intensity = 17 + Math.sin(time * 2.5) * 2.4;

      renderer.render(scene, camera);
      if (!host.classList.contains('is-rendered')) host.classList.add('is-rendered');
      if (!reduced && visible) window.requestAnimationFrame(render);
    }

    function onPointerMove(event) {
      pointerX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      pointerY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    }

    if (!reduced) window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window && !reduced) {
      new IntersectionObserver(function (entries) {
        var nextVisible = entries[0] && entries[0].isIntersecting;
        if (nextVisible && !visible) {
          visible = true;
          start = performance.now() - 1000;
          window.requestAnimationFrame(render);
        } else {
          visible = nextVisible;
        }
      }, { rootMargin: '25% 0px' }).observe(host);
    }

    host.dataset.mascotReady = 'true';
    resize();
    if (reduced) render(performance.now());
    else window.requestAnimationFrame(render);

    return { resize: resize };
  }

  window.NKUMascot3D = { create: create };
}());
