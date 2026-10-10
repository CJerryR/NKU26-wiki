import './toolkit';
/** Entry point for every inner page (bundled by Astro). */
import { initGlass } from './glass';
import { initLiquidGlass } from './liquid-glass';
import { initHero } from './hero';
import { initNav } from './nav';
import { initToc } from './toc';
import { initSearch } from './search';
import { initMascot } from './mascot';
import { initEnhance } from './enhance';
import { initSmooth } from './smooth';

function start(): void {
  initGlass();
  initLiquidGlass();
  initNav();
  initHero();
  initToc();
  initSearch();
  initMascot();
  initEnhance();
  initSmooth();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
