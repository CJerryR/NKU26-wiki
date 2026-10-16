/** Click/touch/keyboard flip with a readable no-JS fallback and managed focus. */
function wireCards(): void {
  document.querySelectorAll<HTMLElement>('[data-member-card]').forEach(card => {
    if (card.classList.contains('is-ready')) return;
    const front=card.querySelector<HTMLElement>('.member-card__front');
    const back=card.querySelector<HTMLElement>('.member-card__back');
    const open=card.querySelector<HTMLButtonElement>('[data-member-flip]');
    const close=card.querySelector<HTMLButtonElement>('[data-member-back]');
    if (!front || !back || !open || !close) return;
    const flip=(yes:boolean) => {
      card.classList.toggle('is-flipped',yes);
      open.setAttribute('aria-expanded',String(yes));
      front.inert=yes;back.inert=!yes;
      front.setAttribute('aria-hidden',String(yes));back.setAttribute('aria-hidden',String(!yes));
      (yes ? close : open).focus({preventScroll:true});
    };
    back.inert=true;back.setAttribute('aria-hidden','true');card.classList.add('is-ready');
    open.addEventListener('click',()=>flip(true));close.addEventListener('click',()=>flip(false));
    card.addEventListener('keydown',e=>{if(e.key==='Escape' && card.classList.contains('is-flipped')) {e.preventDefault();flip(false);}});
  });
}

let observing = false;
export function initPersonCards(): void {
  wireCards();
  if (observing) return;
  observing = true;
  // Tina islands replace article markup after edits; initialize fresh cards too.
  new MutationObserver(records => {
    if (records.some(r => [...r.addedNodes].some(n => n instanceof Element &&
      (n.matches('[data-member-card], .member-grid') || n.querySelector('[data-member-card]'))))) wireCards();
  }).observe(document.body, {childList:true,subtree:true});
}
