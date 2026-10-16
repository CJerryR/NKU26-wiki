import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox = { console, window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('static/js/vendor/three.min.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('static/js/home-field-camera.js', 'utf8'), sandbox);
const T = sandbox.THREE;
for (const [width, height] of [[1440,900],[1440,810],[1800,900],[2100,900],[2560,1080],[3440,1440],[390,844],[844,390]]) {
  test(`complete centre plot at ${width} × ${height}`, () => {
    const cam = new T.PerspectiveCamera(), view = sandbox.window.NKFieldCamera(T, cam);
    view.fit(width/height);
    const box = view.outline(view.stop());
    assert.ok(box.x <= .901 && box.y <= .881, `clipped outline: ${JSON.stringify(box)}`);
    assert.ok(width < height ? box.share >= .84 && box.share <= .87 : box.share >= .45 && box.share <= .55, `wrong plot share: ${box.share}`);
    // Both screen layouts reach the same plant for the existing soil handoff.
    view.update(1,0);
    const end = new T.Vector3(-.35,.45,.82).normalize().multiplyScalar(1.45).add(new T.Vector3(0,.28,0));
    assert.ok(cam.position.distanceTo(end) < 1e-8);
  });
}
test('camera remains finite and continuous through both directions of the flight', () => {
  const cam = new T.PerspectiveCamera(), view = sandbox.window.NKFieldCamera(T,cam);
  for (const aspect of [.462,1.6,2.4,3.56]) {
    view.fit(aspect);
    for (let i=0; i<=200; i++) {
      const t=i/200; view.update(t,0);
      const forward=cam.position.clone(); view.update(t+1e-6,0);
      assert.ok(cam.position.toArray().every(Number.isFinite));
      assert.ok(cam.position.distanceTo(forward)<.02);
    }
  }
});
