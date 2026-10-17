/**
 * Scroll-opened page heroes ("scenes"), one per inner page that has one.
 *
 * A page with an enabled scene here gets SceneHero instead of the SVG title
 * bar (PageView.astro decides); every other page keeps PageHero unchanged.
 * Switching `enabled` off in a page's layout JSON withdraws that page's scene
 * and nothing else.
 *
 *   src/data/scenes/<page>.json        layout, hand-authored (design units)
 *   src/data/scenes/<page>.atlas.json  frames, written by tools/pack_scene_atlas.py
 *   static/img/scenes/<page>-*.webp    atlases, written by the same tool
 *
 * Layouts and atlases are found automatically (any src/data/scenes/<page>.json
 * with its .atlas.json). ATLAS_URL keeps one literal per atlas so moving to
 * the iGEM CDN is a one-line swap each (record the swap in
 * content/cdn-assets.json). Local paths carry ?v=<hash> so a re-packed atlas
 * is never served stale.
 */

export interface SceneState { x: number; y: number; r?: number; s?: number; o?: number }
export interface SceneLayer {
  id: string; prop: string; w: number; z?: number; depth?: number;
  from: SceneState; to: SceneState; win?: [number, number];
}
export interface SceneTitle { fontSize?: number; y?: number; toY?: number; toScale?: number }
export interface SceneSet { canvas: [number, number]; title?: SceneTitle; layers: SceneLayer[] }
export interface SceneLayout { page: string; enabled: boolean; eyebrow?: string; desktop: SceneSet; mobile: SceneSet }
export interface AtlasSet { file: string; size: [number, number]; hash: string; frames: Record<string, [number, number, number, number]> }
export interface SceneAtlas { desktop: AtlasSet; mobile: AtlasSet }

export type SceneKind = 'desktop' | 'mobile';
export interface ResolvedScene { page: string; eyebrow?: string; sets: Record<SceneKind, { set: SceneSet; atlas: AtlasSet; url: string }> }

/* One literal per atlas: replace with the static.igem.wiki address after upload. */
const ATLAS_URL: Record<string, string> = {
  'model-docking-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-e21799d02ac7-model-docking-desktop.webp',
  'model-docking-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-a2846fdded0f-model-docking-mobile.webp',
  'awards-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-cf4f0acb3050-awards-desktop.webp',
  'awards-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-886ada3d3035-awards-mobile.webp',
  'acknowledgements-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ffda496b49ca-acknowledgements-desktop.webp',
  'acknowledgements-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-1b42b8336d5d-acknowledgements-mobile.webp',
  'description-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-2ca7580ba2a1-description-desktop.webp',
  'description-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-af8b74d880df-description-mobile.webp',
  'engineering-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-f0f5d73b177f-engineering-desktop.webp',
  'engineering-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-40b04d8f0ba9-engineering-mobile.webp',
  'results-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-3230d626de9a-results-desktop.webp',
  'results-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-68304ee7dfee-results-mobile.webp',
  'model-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-be67aea270da-model-desktop.webp',
  'model-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-98795fba04df-model-mobile.webp',
  'contribution-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-5528f9bff332-contribution-desktop.webp',
  'contribution-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b27e379b4c03-contribution-mobile.webp',
  'experiments-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-26121982e5bc-experiments-desktop.webp',
  'experiments-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-efba8fb86275-experiments-mobile.webp',
  'parts-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-753a7f10d36c-parts-desktop.webp',
  'parts-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-dc5f6ce1e976-parts-mobile.webp',
  'background-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-2c6e40e28b7a-background-desktop.webp',
  'background-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-aacf9a056dd1-background-mobile.webp',
  'attributions-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-071a5bc41ed9-attributions-desktop.webp',
  'attributions-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-2c62556b175b-attributions-mobile.webp',
};

const layouts = import.meta.glob<SceneLayout>(['./scenes/*.json', '!./scenes/*.atlas.json'], { eager: true, import: 'default' });
const atlases = import.meta.glob<SceneAtlas>('./scenes/*.atlas.json', { eager: true, import: 'default' });
const SCENES: Record<string, { layout: SceneLayout; atlas: SceneAtlas }> = {};
for (const [path, layout] of Object.entries(layouts)) {
  const atlas = atlases[path.replace(/\.json$/, '.atlas.json')];
  if (!atlas) throw new Error(`scene ${layout.page}: no atlas — run python3 tools/pack_scene_atlas.py ${layout.page}`);
  SCENES[layout.page] = { layout, atlas };
}

/** Media query that switches to the portrait composition (shared with CSS). */
export const PORTRAIT_QUERY = '(max-aspect-ratio: 4/5)';

function urlFor(atlas: AtlasSet): string {
  const url = ATLAS_URL[atlas.file] ?? `/img/scenes/${atlas.file}`;
  return url.startsWith('/') ? `${url}?v=${atlas.hash}` : url;
}

export function getScene(page: string): ResolvedScene | null {
  const entry = SCENES[page];
  if (!entry || !entry.layout.enabled) return null;
  const { layout, atlas } = entry;
  const sets = {} as ResolvedScene['sets'];
  for (const kind of ['desktop', 'mobile'] as const) {
    const set = layout[kind];
    for (const layer of set.layers) {
      if (!atlas[kind].frames[layer.prop]) throw new Error(`scene ${page}/${kind}: no frame for prop "${layer.prop}" — run tools/pack_scene_atlas.py ${page}`);
    }
    sets[kind] = { set, atlas: atlas[kind], url: urlFor(atlas[kind]) };
  }
  return { page, eyebrow: layout.eyebrow, sets };
}
