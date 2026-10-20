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
  };

  back.inert = true;
  back.setAttribute('aria-hidden', 'true');
  card.classList.add('is-ready');

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

function wireCredit(card: HTMLElement): void {
  if (resizeCleanup.has(card)) return;
  const identity = card.querySelector<HTMLElement>('.credit-card__id');
  const body = card.querySelector<HTMLElement>('.credit-card__body');
  const visible = body?.querySelector<HTMLOListElement>(':scope > .credit-card__list');
  const more = body?.querySelector<HTMLDetailsElement>('.credit-card__more');
  const hidden = more?.querySelector<HTMLOListElement>('.credit-card__list');
  const summary = more?.querySelector<HTMLElement>('summary');
  const count = more?.querySelector<HTMLElement>('.credit-card__show');
  if (!identity || !body || !visible || !more || !hidden || !summary || !count) return;
  const rows = [...visible.children, ...hidden.children];
  let frame = 0;
  let previousSize = '';
  const fit = () => {
    frame = 0;
    if (!card.isConnected) return;
    const tile = identity.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const stacked = bodyRect.left < tile.right;
    let shown = Math.min(2, rows.length);
    if (!stacked) {
      // Measure a separate, inaccessible list: the reader's open/closed state stays intact.
      const measure = visible.cloneNode(false) as HTMLOListElement;
      measure.setAttribute('aria-hidden', 'true');
      measure.inert = true;
      Object.assign(measure.style, {
        position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
        width: `${visible.getBoundingClientRect().width}px`,
      });
      rows.forEach(row => measure.append(row.cloneNode(true)));
      body.append(measure);
      const top = visible.getBoundingClientRect().top;
      const available = tile.bottom - top - parseFloat(getComputedStyle(body).paddingBottom);
      if (measure.getBoundingClientRect().height <= available) {
        shown = rows.length;
      } else {
        const wasHidden = more.hidden;
        more.hidden = false;
        const reserve = summary.getBoundingClientRect().height + parseFloat(getComputedStyle(summary).marginTop);
        more.hidden = wasHidden;
        const start = measure.getBoundingClientRect().top;
        shown = 1;
        [...measure.children].forEach((row, i) => {
          if (row.getBoundingClientRect().bottom - start + reserve <= available) shown = i + 1;
        });
      }
      measure.remove();
    }
    // Move the original nodes so numbering, text, and any future links stay unchanged.
    rows.slice(0, shown).forEach(row => visible.append(row));
    rows.slice(shown).forEach(row => hidden.append(row));
    hidden.start = shown + 1;
    count.textContent = `Show ${rows.length - shown} more`;
    more.hidden = shown === rows.length;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(fit); };
  const resize = new ResizeObserver(() => {
    const size = `${body.clientWidth}:${identity.offsetHeight}`;
    if (size !== previousSize) { previousSize = size; schedule(); }
  });
  resize.observe(body); resize.observe(identity);
  document.fonts.ready.then(schedule);
  document.fonts.addEventListener('loadingdone', schedule);
  schedule();
  resizeCleanup.set(card, () => {
    resize.disconnect(); cancelAnimationFrame(frame);
    document.fonts.removeEventListener('loadingdone', schedule);
  });
}

function wireAll(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-member-card]').forEach(wire);
  root.querySelectorAll<HTMLElement>('.credit-card').forEach(wireCredit);
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
      n.querySelectorAll<HTMLElement>('[data-member-card], .credit-card').forEach(c => resizeCleanup.get(c)?.());
    }
    for (const r of records) for (const n of r.addedNodes) {
      if (!(n instanceof Element)) continue;
      const grid = n.matches('.member-grid, .credit-grid') || n.querySelector('.member-grid, .credit-grid');
      if (!grid && !n.matches('[data-member-card], .credit-card')) continue;
      if (n.matches('[data-member-card]')) wire(n as HTMLElement);
      else if (n.matches('.credit-card')) wireCredit(n as HTMLElement);
      else wireAll(n);
      initLiquidGlass(n);
    }
  }).observe(document.body, { childList: true, subtree: true });
}
