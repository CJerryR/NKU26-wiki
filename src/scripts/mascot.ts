/** Yeast detective: tips on hover, day / night on tap. Keeps the v6 API. */
import { currentTheme, initTheme, onThemeChange, toggleTheme } from './theme';

export function initMascot(): void {
  initTheme();
  const box = document.querySelector<HTMLElement>('[data-detective]');
  if (!box) return;
  const btn = box.querySelector<HTMLButtonElement>('.detective__btn');
  const bubble = box.querySelector<HTMLElement>('.detective__bubble');
  if (!btn || !bubble) return;
  const narrow = matchMedia('(max-width: 1099px)');
  const night = () => currentTheme() === 'dark';
  const tips = () => [
    night() ? 'Tap me to bring the daylight back.' : 'Tap me to switch the lights off: night mode.',
    narrow.matches ? 'The outline button at the bottom jumps between sections.' : 'The outline on the left jumps between sections.',
    'Search lives in the top bar. Press <b>/</b> to open it.',
  ];
  let i = 0;
  let timer = 0;
  const say = (html: string, ms = 4800) => {
    bubble.innerHTML = html;
    box.classList.add('show-bubble');
    clearTimeout(timer);
    timer = window.setTimeout(() => box.classList.remove('show-bubble'), ms);
  };
  (window as unknown as { NKUDetective: unknown }).NKUDetective = {
    say, el: box, lit: () => {}, aim: () => {}, torchTip: () => null,
  };
  /* a toggle button: the name stays, the pressed state says which mode is on */
  const sync = () => btn.setAttribute('aria-pressed', night() ? 'true' : 'false');
  sync();
  onThemeChange(sync);
  /* While the circle spreads the page is a snapshot, so the pointer leaves
     the button and enters it again when the switch ends; that re-entry must
     not replace the "night mode on" message with a hover tip. */
  let quietUntil = 0;
  const hover = () => { if (performance.now() < quietUntil) return; const t = tips(); say(t[i++ % t.length]); };
  btn.addEventListener('click', () => {
    quietUntil = performance.now() + 1600;
    const r = (btn.querySelector('img') || btn).getBoundingClientRect();
    const t = toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    i = 1; // the next hover tip moves on from the switch hint
    say(t === 'dark' ? 'Night mode on. Tap me again for daylight.' : 'Daylight is back. Tap me again for night mode.', 3200);
  });
  btn.addEventListener('pointerenter', hover);
  btn.addEventListener('focus', hover);
}
