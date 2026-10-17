/**
 * Day / night for the inner pages.
 *
 * The choice lives on <html data-theme="dark"> (day = no attribute) and in
 * localStorage, so it follows the reader from page to page. BaseLayout sets
 * the attribute before the first paint (an inline script in <head>), which
 * keeps a night page from flashing paper while it loads. The story homepage
 * has its own look and never reads this.
 *
 * The switch spreads as a circle from a point (the detective): a View
 * Transition snapshots the page, the new theme is applied underneath, and the
 * new view is uncovered by a growing clip-path. Browsers without View
 * Transitions, and readers who ask for reduced motion, get an instant switch.
 * Colours: src/styles/theme-night.css (page) and toolkit-night.css (blocks).
 */
export type Theme = 'light' | 'dark';

/* keep in step with the inline script in src/layouts/BaseLayout.astro */
export const THEME_KEY = 'nku26-theme';
const EVENT = 'nku:themechange';

export function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function stored(): Theme {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
}

function paint(t: Theme): void {
  const root = document.documentElement;
  if (t === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
  dispatchEvent(new CustomEvent<Theme>(EVENT, { detail: t }));
}

type VT = { ready: Promise<void>; finished: Promise<void>; skipTransition?: () => void };
type DocVT = Document & { startViewTransition?: (cb: () => void) => VT };

// A transition paints asynchronously. Read the latest requested choice when
// toggling again, rather than the previous snapshot still on screen.
let requested: Theme | undefined;
let revision = 0;
let activeTransition: VT | undefined;
let activeCircle: Animation | undefined;
let initialized = false;

export interface Origin { x: number; y: number }

/* Glass tints, film colours and the like are registered properties that
   glide on a change of tone. During a theme switch they must not: the new
   view is shown at once and only the circle moves (theme-night.css). */
function begin(id: number): () => void {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  return () => requestAnimationFrame(() => requestAnimationFrame(() => {
    if (id !== revision) return;
    activeTransition = undefined;
    activeCircle = undefined;
    root.classList.remove('theme-switching');
  }));
}

export function setTheme(next: Theme, from?: Origin): void {
  if (next === (requested ?? currentTheme())) return;
  try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode: this page only */ }
  applyTheme(next, from);
}

function applyTheme(next: Theme, from?: Origin): void {
  requested = next;
  const id = ++revision;
  activeTransition?.skipTransition?.();
  activeCircle?.cancel();
  activeTransition = undefined;
  activeCircle = undefined;
  const settle = begin(id);
  const update = () => { if (id === revision) paint(next); };
  const doc = document as DocVT;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!from || reduced || document.hidden || typeof doc.startViewTransition !== 'function') {
    update();
    settle();
    return;
  }

  const { x, y } = from;
  // the circle ends at the farthest corner of the viewport
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  let vt: VT;
  try {
    vt = doc.startViewTransition(update);
    activeTransition = vt;
  } catch {
    update();
    settle();
    return;
  }
  vt.ready.then(() => {
    if (id !== revision) return;
    activeCircle = document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: Math.min(900, 520 + r * 0.22), easing: 'cubic-bezier(.3, .7, .2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => { /* skipped: the new theme is already painted */ });
  vt.finished.then(settle, settle);
}

export function toggleTheme(from?: Origin): Theme {
  const next: Theme = (requested ?? currentTheme()) === 'dark' ? 'light' : 'dark';
  setTheme(next, from);
  return next;
}

export function onThemeChange(fn: (t: Theme) => void): void {
  addEventListener(EVENT, (e) => fn((e as CustomEvent<Theme>).detail));
}

/** Keeps other tabs and pages restored from the back/forward cache in step. */
export function initTheme(): void {
  if (initialized) return;
  initialized = true;
  addEventListener('storage', (e) => {
    if (e.key === THEME_KEY || e.key === null) applyTheme(stored());
  });
  addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) {
      const next = stored();
      if (next !== currentTheme() || next !== (requested ?? currentTheme())) applyTheme(next);
    }
  });
}
