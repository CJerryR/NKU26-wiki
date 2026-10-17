/* Responsive camera for the illustrated 64 × 44 centre plot.
 * Fit the projected outline, rather than estimating its size from aspect alone. */
(function () {
  'use strict';
  window.NKFieldCamera = function (T, cam) {
    var UP = new T.Vector3(0, 1, 0);
    var start = new T.Vector3(), end = new T.Vector3(-0.35, 0.45, 0.82).normalize();
    var targetEnd = new T.Vector3(0, 0.28, 0), target = new T.Vector3(), dir = new T.Vector3();
    var aspect = 1, turn = 1;
    var corners = [[-32, -22], [32, -22], [32, 22], [-32, 22]].map(function (p) { return new T.Vector3(p[0], 0.03, p[1]); });
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function fit(a) {
      aspect = a; cam.aspect = a; cam.fov = a < 1 ? 52 : 40;
      // A shallower, less rotated overview gives a wide screen a complete plot.
      // Both paths still converge on the same plant and underground endpoint.
      var wide = Math.max(1, a / 1.6);
      start.set(0, 0.9 / (wide * wide), 0.44).normalize();
      turn = 1 / (wide * wide);
      cam.updateProjectionMatrix();
    }
    function update(t, time) {
      // Portal entry uses t < 0. Clamp orientation, while distance keeps its
      // approach extension; a fractional power of negative ease produces NaN.
      var e = ease(Math.max(0, Math.min(1, t)));
      var dist = t < 0 ? 620 * (1 - t * 1.3) : t > 1 ? 1.45 * (1 - (t - 1) * 1.4) : 620 * Math.pow(1.45 / 620, e);
      target.set(0, 0, 0).lerp(targetEnd, e);
      dir.copy(start).lerp(end, Math.pow(e, 1.2)).normalize().applyAxisAngle(UP, -0.85 * Math.sin(Math.PI * e) * turn);
      cam.position.copy(target).addScaledVector(dir, Math.max(0.7, dist));
      cam.position.y += Math.sin(time * 0.6) * 0.01 * Math.min(1, dist);
      cam.lookAt(target);
      cam.near = Math.max(0.03, dist * 0.012); cam.far = Math.max(1200, dist * 4);
      cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      return dist;
    }
    function outline(q) {
      update((q - 0.38) / 0.22, 0);
      var x0 = Infinity, x1 = -Infinity, extentX = 0, extentY = 0;
      corners.forEach(function (p) {
        var v = p.clone().project(cam);
        x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x);
        extentX = Math.max(extentX, Math.abs(v.x)); extentY = Math.max(extentY, Math.abs(v.y));
      });
      return { share: (x1 - x0) / 2, x: extentX, y: extentY };
    }
    function stop() {
      var lo = 0.39, hi = 0.5, wanted = aspect < 1 ? 0.86 : 0.5;
      for (var i = 0; i < 28; i++) {
        var q = (lo + hi) / 2, box = outline(q);
        if (box.share < wanted && box.x < 0.9 && box.y < 0.88) lo = q; else hi = q;
      }
      return lo;
    }
    fit(1);
    return { fit: fit, update: update, stop: stop, outline: outline };
  };
}());
