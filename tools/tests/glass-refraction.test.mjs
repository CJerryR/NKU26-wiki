import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';

// Capture the production canvas pixels without requiring a browser renderer.
// The optical functions run unmodified; only the canvas output is intercepted.
function sandbox() {
  const document = {
    documentElement: { classList: { add() {} } },
    readyState: 'loading', addEventListener() {},
    createElement(tag) {
      assert.equal(tag, 'canvas');
      const canvas = { width: 0, height: 0, pixels: null };
      canvas.getContext = () => ({
        createImageData: (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
        putImageData: (image) => { canvas.pixels = image; },
      });
      canvas.toDataURL = () => canvas.pixels;
      return canvas;
    },
  };
  const matchMedia = () => ({ matches: false });
  return vm.createContext({ document, navigator: { userAgent: '' }, CSS: { supports: () => false },
    window: { matchMedia, addEventListener() {} }, matchMedia, exports: {}, module: { exports: {} } });
}
async function load(engine) {
  const context = sandbox();
  let source = await fs.readFile(new URL(`../../${engine}`, import.meta.url), 'utf8');
  if (engine.endsWith('shell.js')) {
    source = source.replace('  function maps(', '  window.testMaps = maps;\n  function maps(');
    vm.runInContext(source, context);
    return (w, h, r, b) => context.window.testMaps(w, h, r, Math.min(b, h / 2 - 1), .45).disp;
  }
  if (engine.endsWith('/glass.ts')) source += '\nexport { maps as testMaps };';
  const { code } = await transform(source, { loader: 'ts', format: 'cjs' });
  context.module.exports = context.exports;
  vm.runInContext(code, context);
  if (engine.endsWith('/glass.ts')) return (w, h, r, b) => context.module.exports.testMaps(w, h, r, Math.min(b, h / 2 - 1), .45).disp;
  return (w, h, r, b) => context.module.exports.computeDisplacementMap(w, h, r,
    { ior: 1.5, thickness: 22, bezel: b, zoom: 0, dispersion: .04 }).url;
}
for (const engine of ['src/scripts/glass.ts', 'src/scripts/liquid-glass.ts', 'static/js/shell.js']) {
  test(`${engine}: tall rectangular glass has no interior displacement seam`, async () => {
    const draw = await load(engine);
    const map = draw(244, 493, 24, 999);
    let tested = 0;
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
      const px = (x + .5) * 244 / map.width, py = (y + .5) * 493 / map.height;
      if (px < 27 || px > 217 || py < 27 || py > 466) continue;
      const at = (y * map.width + x) * 4;
      assert.equal(map.data[at], 128, `horizontal seam at ${px},${py}`);
      assert.equal(map.data[at + 1], 128, `vertical seam at ${px},${py}`);
      tested++;
    }
    assert.ok(tested > 10_000, 'inspect the full flat interior, including its midlines');
    assert.ok(map.data.some((v, i) => i % 4 < 2 && v !== 128), 'keep refraction at the rim');
  });
  test(`${engine}: wide pill retains an unbroken centre at several aspect ratios`, async () => {
    const draw = await load(engine);
    for (const [w, h, r] of [[640, 56, 28], [366, 474, 24], [244, 250, 24], [400, 300, 12]]) {
      const map = draw(w, h, r, 999);
      for (const x of [Math.floor(map.width / 2) - 1, Math.floor(map.width / 2)]) {
        for (const y of [Math.floor(map.height / 2) - 1, Math.floor(map.height / 2)]) {
          const at = (y * map.width + x) * 4;
          assert.deepEqual(Array.from(map.data.slice(at, at + 2)), [128, 128], `${w}x${h} centre`);
        }
      }
    }
  });
}
