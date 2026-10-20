/** Article images open over the current page, keeping its URL and reading position. */
import { previewImageUrl } from './original-images';
import { stopSmooth } from './smooth';
import { glassFor } from './liquid-glass';

export function initImagePreview(): void {
  if (document.getElementById('image-preview')) return;
  const article = document.querySelector<HTMLElement>('[data-doc]');
  if (!article) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'image-preview';
  dialog.className = 'image-preview';
  dialog.setAttribute('aria-label', 'Image preview');
  dialog.innerHTML = `<header class="image-preview__toolbar">
    <span class="image-preview__title lg-glass" data-glass="pill" data-tone="light"><span>Image preview</span></span>
    <div class="image-preview__controls">
      <button type="button" class="lg-glass" data-glass="chip" data-tone="light" data-preview-out aria-label="Zoom out" title="Zoom out"><span aria-hidden="true">−</span></button>
      <span class="image-preview__percentage lg-glass" data-glass="pill" data-tone="light"><output aria-label="Zoom level">100%</output></span>
      <button type="button" class="lg-glass" data-glass="chip" data-tone="light" data-preview-in aria-label="Zoom in" title="Zoom in"><span aria-hidden="true">+</span></button>
      <button type="button" class="lg-glass" data-glass="pill" data-tone="light" data-preview-fit><span>Fit</span></button>
      <button type="button" class="lg-glass" data-glass="chip" data-tone="light" data-preview-close aria-label="Close image preview" title="Close (Esc)"><span aria-hidden="true">×</span></button>
    </div>
  </header>
  <div class="image-preview__stage" data-free-scroll>
    <img class="image-preview__image" alt="" draggable="false" hidden>
    <p class="image-preview__status" role="status">Loading image…</p>
  </div>`;
  document.body.append(dialog);
  const stage = dialog.querySelector<HTMLElement>('.image-preview__stage')!;
  const image = dialog.querySelector<HTMLImageElement>('img')!;
  const status = dialog.querySelector<HTMLElement>('[role="status"]')!;
  const close = dialog.querySelector<HTMLButtonElement>('[data-preview-close]')!;
  close.autofocus = true;
  const output = dialog.querySelector('output')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('[data-preview-in]')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('[data-preview-out]')!;
  let zoom = 1, fit = 1, request = 0;
  let previousFocus: HTMLElement | null = null;
  let overflow = '';
  let readingX = 0, readingY = 0;

  function paint(): void {
    if (image.hidden) return;
    image.style.width = `${image.naturalWidth * fit * zoom}px`;
    image.style.height = `${image.naturalHeight * fit * zoom}px`;
    output.value = `${Math.round(fit * zoom * 100)}%`;
    zoomIn.disabled = zoom >= 8;
    zoomOut.disabled = zoom <= 0.5;
  }
  function fitImage(): void {
    if (!image.naturalWidth || !dialog.open) return;
    fit = Math.min(1, Math.max(1, stage.clientWidth - 32) / image.naturalWidth,
      Math.max(1, stage.clientHeight - 32) / image.naturalHeight);
    zoom = 1;
    paint();
    stage.scrollTo(0, 0);
  }
  function changeZoom(multiplier: number): void {
    const oldZoom = zoom;
    zoom = Math.max(0.5, Math.min(8, zoom * multiplier));
    const ratio = zoom / oldZoom;
    const x = (stage.scrollLeft + stage.clientWidth / 2) * ratio - stage.clientWidth / 2;
    const y = (stage.scrollTop + stage.clientHeight / 2) * ratio - stage.clientHeight / 2;
    paint();
    stage.scrollTo(Math.max(0, x), Math.max(0, y));
  }
  async function open(source: HTMLImageElement, trigger: HTMLElement): Promise<void> {
    const ticket = ++request;
    previousFocus = trigger;
    stopSmooth();
    readingX = scrollX; readingY = scrollY;
    window.scrollTo({ left: readingX, top: readingY, behavior: 'instant' });
    overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    image.hidden = true;
    status.hidden = false;
    status.textContent = 'Loading image…';
    image.alt = source.alt;
    dialog.showModal();
    dialog.querySelectorAll<HTMLElement>('[data-glass]').forEach((control) => {
      const glass = glassFor(control);
      glass.refresh();
      glass.materialize(240);
    });
    close.focus({ preventScroll: true });
    try {
      const url = await previewImageUrl(source);
      if (ticket !== request || !dialog.open) return;
      image.src = url;
      await image.decode();
      if (ticket !== request || !dialog.open) return;
      image.hidden = false;
      status.hidden = true;
      fitImage();
    } catch {
      if (ticket === request && dialog.open) status.textContent = 'Image could not load. Close and try again.';
    }
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    ++request;
    document.documentElement.style.overflow = overflow;
    image.hidden = true;
    image.removeAttribute('src');
    previousFocus?.focus({ preventScroll: true });
    window.scrollTo({ left: readingX, top: readingY, behavior: 'instant' });
    stopSmooth();
  });
  // Only a deliberate click on empty space dismisses; dragging an enlarged image does not.
  let downOnSpace = false;
  dialog.addEventListener('pointerdown', (event) => { downOnSpace = event.target === stage || event.target === dialog; });
  dialog.addEventListener('click', (event) => {
    if (downOnSpace && (event.target === stage || event.target === dialog)) dialog.close();
    downOnSpace = false;
  });
  zoomIn.addEventListener('click', () => changeZoom(1.25));
  zoomOut.addEventListener('click', () => changeZoom(1 / 1.25));
  dialog.querySelector('[data-preview-fit]')!.addEventListener('click', fitImage);
  dialog.addEventListener('keydown', (event) => {
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '0') fitImage();
      else changeZoom(event.key === '-' ? 1 / 1.25 : 1.25);
    }
  });
  new ResizeObserver(() => { if (dialog.open && !image.hidden) fitImage(); }).observe(stage);

  function eligible(img: HTMLImageElement): boolean {
    if (img.closest('button, .member-card, [data-no-preview], nav, wiki-toolkit')) return false;
    const link = img.closest<HTMLAnchorElement>('a[href]');
    if (!link) return true;
    const url = new URL(link.href, location.href);
    // Keep image cards that navigate to another Wiki page working normally.
    return /\.(?:png|jpe?g|webp|gif|svg|avif)$/i.test(url.pathname)
      || link.href === img.currentSrc || link.href === img.src
      || link.getAttribute('href') === img.dataset.authorOriginal;
  }
  const observed = new WeakSet<Node>();
  function prepare(root: Element | ShadowRoot = article!): void {
    root.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      if (!eligible(img)) return;
      img.dataset.imagePreview = '';
      // A component's shadow tree cannot inherit the article stylesheet.
      img.style.cursor = 'zoom-in';
      if (!img.closest('a[href]')) {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-haspopup', 'dialog');
        img.setAttribute('aria-label', `Preview image${img.alt ? `: ${img.alt}` : ''}`);
      }
    });
    root.querySelectorAll('*').forEach((el) => { if (el.shadowRoot) prepare(el.shadowRoot); });
    if (!observed.has(root)) {
      observed.add(root);
      new MutationObserver(() => prepare(root)).observe(root, { childList: true, subtree: true });
    }
  }
  prepare();
  customElements.whenDefined('wiki-toolkit').then(() => prepare());
  article.addEventListener('click', (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const target = event.target as Element;
    const img = event.composedPath().find((node): node is HTMLImageElement => node instanceof HTMLImageElement)
      || target.closest('a')?.querySelector<HTMLImageElement>('img');
    if (!img || !eligible(img)) return;
    event.preventDefault();
    void open(img, img.closest<HTMLAnchorElement>('a') || img);
  });
  article.addEventListener('keydown', (event) => {
    const img = event.composedPath().find((node): node is HTMLImageElement => node instanceof HTMLImageElement);
    if (!img || !eligible(img)) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    void open(img, img);
  });
}
