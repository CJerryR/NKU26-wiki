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
  "acknowledgements-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-2ecf0c208aa8-acknowledgements-desktop.webp",
  "acknowledgements-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-54a256f96d9d-acknowledgements-mobile.webp",
  "attributions-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-36b6e44f4119-attributions-desktop.webp",
  "attributions-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-990b8c2b7e50-attributions-mobile.webp",
  "awards-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-51c37f48cc61-awards-desktop.webp",
  "awards-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-dcc0ab13e34b-awards-mobile.webp",
  "background-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-133f4a6dfc1e-background-desktop.webp",
  "background-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-872bb7161e80-background-mobile.webp",
  "contribution-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-39d8de9cb6b7-contribution-desktop.webp",
  "contribution-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-0a6c3a2a6373-contribution-mobile.webp",
  "description-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-766cc7a513bd-description-desktop.webp",
  "description-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-b3251d2df0b9-description-mobile.webp",
  "education-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-cd3ed976df28-education-desktop.webp",
  "education-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-f07df2f3ba54-education-mobile.webp",
  "engineering-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-c3bf781d52e9-engineering-desktop.webp",
  "engineering-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-1b70657f105a-engineering-mobile.webp",
  "experiments-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-fd956188062b-experiments-desktop.webp",
  "experiments-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-48bb8b6c63a6-experiments-mobile.webp",
  "human-practices-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-401a10a1370c-human-practices-desktop.webp",
  "human-practices-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-c2de5daa97b7-human-practices-mobile.webp",
  "licensing-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-54be4bf4299a-licensing-desktop.webp",
  "licensing-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-7f5dc47d2574-licensing-mobile.webp",
  "members-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-cba626240979-members-desktop.webp",
  "members-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-a15a8a4d6565-members-mobile.webp",
  "model-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-1a3e1d613342-model-desktop.webp",
  "model-docking-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-9b8956e15d8e-model-docking-desktop.webp",
  "model-docking-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-15b8eda50260-model-docking-mobile.webp",
  "model-eco-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-bacbabb8b810-model-eco-desktop.webp",
  "model-eco-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-484854825747-model-eco-mobile.webp",
  "model-md-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-baacba0eaefc-model-md-desktop.webp",
  "model-md-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-ba8baae37110-model-md-mobile.webp",
  "model-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-9a4092339ed3-model-mobile.webp",
  "model-ode-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-ea6b25f8778a-model-ode-desktop.webp",
  "model-ode-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-b10240f2b78f-model-ode-mobile.webp",
  "parts-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-a1136d243284-parts-desktop.webp",
  "parts-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-c7359f52ebe4-parts-mobile.webp",
  "results-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-28ab21340831-results-desktop.webp",
  "results-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-d400d8ce4bbe-results-mobile.webp",
  "safety-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-3122cd5e8b1e-safety-desktop.webp",
  "safety-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v10-2e0668d39928-safety-mobile.webp",
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

/** Night sky (the homepage's, already on the CDN) and ground strip (local until uploaded) behind every opening. */
export const GROUND_URL = 'https://static.igem.wiki/teams/6303/wiki/v8-0/v10-75721912e3cc-ground-strip.webp';
export const SKY_URL = 'https://static.igem.wiki/teams/6303/wiki/v8-0/v85-286c59c2d24c-opening-sky.webp'; // homepage's own upload
