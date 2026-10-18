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
  'acknowledgements-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-1d9f4976b2e1-acknowledgements-desktop.webp',
  'acknowledgements-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-5620805cce9c-acknowledgements-mobile.webp',
  'attributions-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-8a893f37f949-attributions-desktop.webp',
  'attributions-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-e27bf13e692c-attributions-mobile.webp',
  'awards-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-f2a55e7ba095-awards-desktop.webp',
  'awards-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-518cdc7c7ade-awards-mobile.webp',
  'background-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-9e19502ab17d-background-desktop.webp',
  'background-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-97433cab4fa5-background-mobile.webp',
  'contribution-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-b1dcfd215fc9-contribution-desktop.webp',
  'contribution-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-6/v86-b27e379b4c03-contribution-mobile.webp',
  'description-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-efcb42c67661-description-desktop.webp',
  'description-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-30ef075e9a0f-description-mobile.webp',
  'education-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-a1c26826be81-education-desktop.webp',
  'education-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-1ad7fcaba9c1-education-mobile.webp',
  'engineering-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-a41a167937f7-engineering-desktop.webp',
  'engineering-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-f8bdb3d8e368-engineering-mobile.webp',
  'experiments-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-7cab99731703-experiments-desktop.webp',
  'experiments-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-e1e1412cf488-experiments-mobile.webp',
  'human-practices-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-82ddafe64673-human-practices-desktop.webp',
  'human-practices-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-318ed638accb-human-practices-mobile.webp',
  'licensing-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-2b0025d96fb4-licensing-desktop.webp',
  'licensing-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-b1ac54a0da7f-licensing-mobile.webp',
  'members-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-3014128e0434-members-desktop.webp',
  'members-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-eda9483571ef-members-mobile.webp',
  'model-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-6f53f0dcfb11-model-desktop.webp',
  'model-docking-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-45d6f7ccfba4-model-docking-desktop.webp',
  'model-docking-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-682e8c43d634-model-docking-mobile.webp',
  'model-eco-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-12eaa905b921-model-eco-desktop.webp',
  'model-eco-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-221e2a48137e-model-eco-mobile.webp',
  'model-md-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-fd67866b511c-model-md-desktop.webp',
  'model-md-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-b1142b20e3e0-model-md-mobile.webp',
  'model-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-b1a33a0b16a4-model-mobile.webp',
  'model-ode-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-d79d048e0fcf-model-ode-desktop.webp',
  'model-ode-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-8300c606c9a8-model-ode-mobile.webp',
  'parts-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-2546d25ce820-parts-desktop.webp',
  'parts-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-0c8a191c00aa-parts-mobile.webp',
  'results-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-1efb11a35c8b-results-desktop.webp',
  'results-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-0faec36c9fd5-results-mobile.webp',
  'safety-desktop.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-0d74992e301e-safety-desktop.webp',
  'safety-mobile.webp': 'https://static.igem.wiki/teams/6303/wiki/v8-7/v87-845fcb376a5f-safety-mobile.webp',
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
