/** Small reading aids: section link anchors, scroll hints on wide tables. */
export function initEnhance(): void {
  document.querySelectorAll<HTMLElement>('[data-doc] :is(h2, h3)[id]').forEach((h) => {
    if (h.querySelector('a')) return;
    const a = document.createElement('a');
    a.className = 'heading-anchor';
    a.href = `#${h.id}`;
    a.textContent = '#';
    a.setAttribute('aria-label', `Link to “${(h.textContent || '').trim()}”`);
    h.appendChild(a);
  });
  const wraps = Array.from(document.querySelectorAll<HTMLElement>('.table-wrap'));
  const check = () => wraps.forEach((w) => w.classList.toggle('is-scrollable', w.scrollWidth > w.clientWidth + 2));
  check();
  addEventListener('resize', check, { passive: true });
}
