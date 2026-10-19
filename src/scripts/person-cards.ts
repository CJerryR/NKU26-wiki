/**
 * Member cards: click anywhere on the card, or press the round glass button, to turn it.
 * Escape turns it back. The face that is turned away is inert and aria-hidden, so keyboard
 * and screen-reader users only meet the visible one; the button keeps focus and changes its
 * label and aria-expanded. Without scripting both faces stay visible (person-cards.css).
 */
import { initLiquidGlass } from './liquid-glass';
const resizeCleanup = new WeakMap<HTMLElement, () => void>();

function wire(card: HTMLElement): void {
  if (card.classList.contains('is-ready')) return;
  const front = card.querySelector<HTMLElement>('.member-card__front');
  const back = card.querySelector<HTMLElement>('.member-card__back');
  const button = card.querySelector<HTMLButtonElement>('[data-member-flip]');
  const inner = card.querySelector<HTMLElement>('.member-card__inner');
  if (!front || !back || !button || !inner) return;

  const fit = () => {
    const face = card.classList.contains('is-flipped') ? back : front;
    inner.style.height = `${face.offsetHeight}px`;
  };

  const labels = {
    open: button.dataset.labelOpen || button.getAttribute('aria-label') || 'Turn card',
    close: button.dataset.labelClose || button.getAttribute('aria-label') || 'Turn card',
  };
  const turn = (yes: boolean) => {
    if (yes === card.classList.contains('is-flipped')) return;
    // A rotated lazy image may not start loading until the animation has finished.
    // Request it at the click; its URL is shared with the visible front portrait.
    if (yes) back.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
    card.classList.toggle('is-flipped', yes);
    button.setAttribute('aria-expanded', String(yes));
    button.setAttribute('aria-label', yes ? labels.close : labels.open);
    front.inert = yes; back.inert = !yes;
    front.setAttribute('aria-hidden', String(yes));
    back.setAttribute('aria-hidden', String(!yes));
    fit();
  };

  back.inert = true;
  back.setAttribute('aria-hidden', 'true');
  card.classList.add('is-ready');
  fit();
  // Natural face sizes update after responsive reflow, fonts and Tina content edits.
  const resize = new ResizeObserver(fit);
  resize.observe(front); resize.observe(back);
  resizeCleanup.set(card, () => { resize.disconnect(); });

  button.addEventListener('click', () => turn(!card.classList.contains('is-flipped')));
  // The whole card turns, except when the reader is selecting text or using a control.
  card.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (target.closest('button, a, input, textarea, select, summary, [contenteditable]')) return;
    if (window.getSelection()?.toString()) return;
    turn(!card.classList.contains('is-flipped'));
    // a click that lands on a face that has just become inert would drop focus: keep it on the button
    button.focus({ preventScroll: true });
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && card.classList.contains('is-flipped')) {
      e.preventDefault();
      turn(false);
      button.focus({ preventScroll: true });
    }
  });
}

function wireAll(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-member-card]').forEach(wire);
}

let observing = false;
export function initPersonCards(): void {
  wireAll(document);
  if (observing) return;
  observing = true;
  // Tina islands replace the article after edits: wire the new cards and give the
  // credit nameplates their glass.
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.removedNodes) {
      if (!(n instanceof HTMLElement) || n.isConnected) continue;
      resizeCleanup.get(n)?.();
      n.querySelectorAll<HTMLElement>('[data-member-card]').forEach(c => resizeCleanup.get(c)?.());
    }
    for (const r of records) for (const n of r.addedNodes) {
      if (!(n instanceof Element)) continue;
      const grid = n.matches('.member-grid, .credit-grid') || n.querySelector('.member-grid, .credit-grid');
      if (!grid && !n.matches('[data-member-card]')) continue;
      if (n.matches('[data-member-card]')) wire(n as HTMLElement); else wireAll(n);
      initLiquidGlass(n);
    }
  }).observe(document.body, { childList: true, subtree: true });
}
