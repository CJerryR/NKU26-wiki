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
export interface AtlasSet { file: string; size: [number, number]; hash: string; preview?: string; frames: Record<string, [number, number, number, number]> }
export interface SceneAtlas { desktop: AtlasSet; mobile: AtlasSet }

export type SceneKind = 'desktop' | 'mobile';
export interface ResolvedScene { page: string; eyebrow?: string; sets: Record<SceneKind, { set: SceneSet; atlas: AtlasSet; url: string }> }

/* One literal per uploaded atlas. Redesigned Project openings use local hashed
 * files until their new atlases are uploaded; old CDN crops cannot be reused. */
const ATLAS_URL: Record<string, string> = {
  "description-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/description-desktop-a72dbb5987.webp",
  "description-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/description-mobile-a6a6eae33f.webp",
  "engineering-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/engineering-desktop-174fbd6436.webp",
  "engineering-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/engineering-mobile-520e65f108.webp",
  "contribution-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/contribution-desktop-551cfe7ca5.webp",
  "contribution-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/contribution-mobile-e6ad22c432.webp",
  "hp-overview-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/hp-overview-desktop-a8d5b02eca.webp",
  "hp-overview-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/hp-overview-mobile-913bb8f016.webp",
  "hp-investigation-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/hp-investigation-desktop-3d4a88c807.webp",
  "hp-investigation-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/hp-investigation-mobile-5ee06e3c7f.webp",
  "hp-industry-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/hp-industry-desktop-8beb53fbb3.webp",
  "hp-industry-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/openings-20261020/hp-industry-mobile-ada0d88023.webp",

  "acknowledgements-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-3a033b97fd56-acknowledgements-desktop.webp",
  "attributions-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-a2c05d975859-attributions-desktop.webp",
  "awards-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-85ed66bc463c-awards-desktop.webp",
  "background-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-c095340d2b08-background-desktop.webp",
  "education-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-9b1918b8434d-education-desktop.webp",
  "experiments-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-8ac661ad85ce-experiments-desktop.webp",
  "human-practices-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-a81cf6847a23-human-practices-desktop.webp",
  "licensing-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-48201d18548d-licensing-desktop.webp",
  "members-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-0e8520a73d2c-members-desktop.webp",
  "model-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-af019c657181-model-desktop.webp",
  "model-docking-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-3c1b40d2893a-model-docking-desktop.webp",
  "model-eco-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-1713ec27cecf-model-eco-desktop.webp",
  "model-md-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-487326e2f7bd-model-md-desktop.webp",
  "model-ode-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-9bdd926e8a1f-model-ode-desktop.webp",
  "parts-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-e2166e2f0777-parts-desktop.webp",
  "results-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-707292c2fbac-results-desktop.webp",
  "safety-desktop.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-ec01a36617f8-safety-desktop.webp",
  "acknowledgements-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-8d7adaff263c-acknowledgements-mobile.webp",
  "attributions-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-a627a30177ee-attributions-mobile.webp",
  "awards-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-b9939330ece4-awards-mobile.webp",
  "background-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-aea720a2df28-background-mobile.webp",
  "education-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-1d3de0748ebd-education-mobile.webp",
  "experiments-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-5cfff77c9596-experiments-mobile.webp",
  "human-practices-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-9e69b32087e9-human-practices-mobile.webp",
  "licensing-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-120020b6cc75-licensing-mobile.webp",
  "members-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-267e94093ec4-members-mobile.webp",
  "model-docking-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-4ce2de321b00-model-docking-mobile.webp",
  "model-eco-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-c607b16ea67d-model-eco-mobile.webp",
  "model-md-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-6383161e4ab8-model-md-mobile.webp",
  "model-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-3600b1125cb4-model-mobile.webp",
  "model-ode-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-35262a000a00-model-ode-mobile.webp",
  "parts-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-18ef89186bc8-parts-mobile.webp",
  "results-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-2dec54f0c415-results-mobile.webp",
  "safety-mobile.webp": "https://static.igem.wiki/teams/6303/wiki/v8-0/v101-1d8cb6e4c565-safety-mobile.webp",
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

// New HP chapters share iHP's opening until their own scene is supplied.
// A page-specific layout takes priority, including an explicitly disabled one.
const SHARED_SCENES: Record<string, string> = {
  'hp-overview': 'human-practices',
  'hp-investigation': 'human-practices',
  'hp-industry': 'human-practices',
};

export function getScene(page: string): ResolvedScene | null {
  const entry = SCENES[page] ?? SCENES[SHARED_SCENES[page]];
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
