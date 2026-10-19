import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { transformSync } from 'esbuild';

const code = transformSync(readFileSync('src/lib/scene-framing.ts', 'utf8'), { loader: 'ts', format: 'esm' }).code;
const { sampleScene, cameraUnit } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const scenes = readdirSync('src/data/scenes').filter(f => f.endsWith('.json') && !f.endsWith('.atlas.json')).map(file => ({
  layout: JSON.parse(readFileSync(`src/data/scenes/${file}`)),
  atlas: JSON.parse(readFileSync(`src/data/scenes/${file.replace('.json', '.atlas.json')}`)),
}));
const sizes = [[320,568],[360,640],[375,667],[390,844],[414,896],[430,932],[568,320],[667,375],[844,390],[768,1024],[820,1180],[1024,768],[1099,800],[1100,800],[1280,720],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440],[3440,1440],[3840,2160],[800,1000],[801,1000],[1366,640],[1366,641],[1920,600]];
function layersFor(scene, kind) {
  return scene.layout[kind].layers.map(l => ({
    width: l.w, height: l.w * scene.atlas[kind].frames[l.prop][3] / scene.atlas[kind].frames[l.prop][2],
    depth: l.depth ?? 0, from: l.from, to: l.to, window: l.win ?? [0, 1],
  }));
}

for (const scene of scenes) test(`${scene.layout.page}: complete rotated props fit at all 27 sizes and 21 opening positions`, () => {
  for (const [width, height] of sizes) {
    const kind = width / height <= 4 / 5 ? 'mobile' : 'desktop';
    const layers = layersFor(scene, kind);
    // Deliberately less space than the normal browser layout, including a two-line breadcrumb.
    const usableWidth = width - 72, usableHeight = height - 254;
    const originY = Math.max(usableHeight * 0.4, Math.min(usableHeight * 0.6, height / 2 - 174));
    const maxUnit = Math.min(width / scene.layout[kind].canvas[0], height / scene.layout[kind].canvas[1]);
    for (let step = 0; step <= 20; step++) {
      const { poses, bounds } = sampleScene(layers, step / 20);
      const unit = cameraUnit(bounds, usableWidth, usableHeight, maxUnit, originY);
      assert.ok(unit > 0 && unit <= maxUnit + 1e-9);
      layers.forEach((l, i) => {
        const p = poses[i], angle = p.r * Math.PI / 180;
        // Independently transform each sprite corner and each pointer extreme.
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const px of [-1, 1]) for (const py of [-1, 1]) {
          const x = sx * l.width * p.s / 2, y = sy * l.height * p.s / 2;
          const screenX = usableWidth / 2 + (p.x + x * Math.cos(angle) - y * Math.sin(angle) + px * l.depth) * unit;
          const screenY = originY + (p.y + x * Math.sin(angle) + y * Math.cos(angle) + py * l.depth * 0.6) * unit;
          assert.ok(screenX >= -1e-7 && screenX <= usableWidth + 1e-7, `${kind}/${width}x${height}/p${step}: x=${screenX}`);
          assert.ok(screenY >= -1e-7 && screenY <= usableHeight + 1e-7, `${kind}/${width}x${height}/p${step}: y=${screenY}`);
        }
      });
    }
  }
});

test('framing preserves component positions at both ends, including shared-frame assemblies', () => {
  for (const scene of scenes) for (const kind of ['desktop', 'mobile']) {
    const layers = layersFor(scene, kind);
    for (const [progress, key] of [[0, 'from'], [1, 'to']]) {
      const { poses } = sampleScene(layers, progress);
      poses.forEach((pose, i) => {
        assert.ok(Math.abs(pose.x - layers[i][key].x) < 1e-9);
        assert.ok(Math.abs(pose.y - layers[i][key].y) < 1e-9);
      });
    }
  }
});

test('bottom-heavy compositions retain world zero instead of being lifted onto the heading', () => {
  const bounds = { left: -100, top: 200, width: 200, height: 400, x: 0, y: 400 };
  const unit = cameraUnit(bounds, 1000, 800, 0.5, 400);
  assert.equal(unit, 0.5);
  assert.equal(400 + bounds.top * unit, 500);
});
