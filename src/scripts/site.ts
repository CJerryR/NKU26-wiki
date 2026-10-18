import { initOriginalImages } from './original-images';
import './toolkit';
import { initPersonCards } from './person-cards';
/** Entry point for every inner page (bundled by Astro). */
import { initGlass } from './glass';
import { initLiquidGlass } from './liquid-glass';
import { initHero } from './hero';
import { initSceneHero } from './scene-hero';
import { initNav } from './nav';
import { initToc } from './toc';
import { initSearch } from './search';
import { initMascot } from './mascot';
import { initEnhance } from './enhance';
import { initSmooth } from './smooth';
import { initWorkflow } from './workflow';

function start(): void {
  initOriginalImages();
  initGlass();
  initLiquidGlass();
  initNav();
  initHero();
  initSceneHero();
  initToc();
  initSearch();
  initMascot();
  initEnhance();
  initSmooth();
  initPersonCards();
  initWorkflow();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
