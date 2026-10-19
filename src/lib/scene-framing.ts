/** One camera for the complete composition: shared-frame parts stay together. */
export interface ScenePose { x: number; y: number; r?: number; s?: number; o?: number }
export interface FramingLayer {
  width: number; height: number; depth: number;
  from: ScenePose; to: ScenePose; window: [number, number];
}
export interface SceneBounds { left: number; top: number; width: number; height: number; x: number; y: number }
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function sampleScene(layers: FramingLayer[], progress: number) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  const poses = layers.map(layer => {
    const { from: f, to: t, window: [a, b] } = layer;
    const k = 1 - (1 - clamp((progress - a) / Math.max(0.001, b - a))) ** 3;
    const pose = {
      x: mix(f.x, t.x, k), y: mix(f.y, t.y, k),
      r: mix(f.r ?? 0, t.r ?? f.r ?? 0, k),
      s: mix(f.s ?? 1, t.s ?? f.s ?? 1, k),
      o: mix(f.o ?? 1, t.o ?? f.o ?? 1, k),
    };
    const angle = pose.r * Math.PI / 180;
    const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
    // Reserve pointer travel too, so a cursor at an edge cannot cut a prop off.
    const halfW = (layer.width * c + layer.height * s) * Math.abs(pose.s) / 2 + Math.abs(layer.depth);
    const halfH = (layer.width * s + layer.height * c) * Math.abs(pose.s) / 2 + Math.abs(layer.depth) * 0.6;
    left = Math.min(left, pose.x - halfW); right = Math.max(right, pose.x + halfW);
    top = Math.min(top, pose.y - halfH); bottom = Math.max(bottom, pose.y + halfH);
    return pose;
  });
  if (!layers.length) left = top = right = bottom = 0;
  const bounds: SceneBounds = { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top), x: (left + right) / 2, y: (top + bottom) / 2 };
  return { poses, bounds };
}

export function cameraUnit(bounds: SceneBounds, width: number, height: number, maxUnit: number, originY = height / 2): number {
  // Keep world zero in place: centering a bottom-heavy bundle would lift it onto the title.
  return Math.max(0.001, Math.min(maxUnit,
    width / 2 / Math.max(1, -bounds.left),
    width / 2 / Math.max(1, bounds.left + bounds.width),
    originY / Math.max(1, -bounds.top),
    (height - originY) / Math.max(1, bounds.top + bounds.height),
  ));
}
