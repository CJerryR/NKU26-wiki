/** Story homepage entry: the shared top bar (static/js/shell.js keeps the detective). */
import { initNav } from './nav';
import { initGlass } from './glass';
import { initSearch } from './search';
import { initLiquidGlass } from './liquid-glass';

/* v8.4: the China map's switch and readout use the site's liquid glass (refraction in Chromium) */
function start(): void {
  initGlass();
  initNav();
  initSearch();
  const china = document.getElementById('china');
  if (china) initLiquidGlass(china);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
