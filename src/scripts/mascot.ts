/** Yeast detective: tips on hover, back to top on tap. Keeps the v6 API. */
export function initMascot(): void {
  const box = document.querySelector<HTMLElement>('[data-detective]');
  if (!box) return;
  const btn = box.querySelector<HTMLButtonElement>('.detective__btn');
  const bubble = box.querySelector<HTMLElement>('.detective__bubble');
  if (!btn || !bubble) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 1099px)');
  const tips = () => [
    'Lost? Tap me to go back to the top.',
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
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  btn.addEventListener('pointerenter', () => { const t = tips(); say(t[i++ % t.length]); });
  btn.addEventListener('focus', () => { const t = tips(); say(t[i++ % t.length]); });
}
