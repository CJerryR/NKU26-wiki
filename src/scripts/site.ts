/** Entry point for every inner page (bundled by Astro). */
import { initGlass } from './glass';
import { initNav } from './nav';
import { initToc } from './toc';
import { initSearch } from './search';
import { initMascot } from './mascot';
import { initEnhance } from './enhance';

function start(): void {
  initGlass();
  initNav();
  initToc();
  initSearch();
  initMascot();
  initEnhance();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
