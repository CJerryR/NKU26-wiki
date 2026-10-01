/** Story homepage entry: the shared top bar (static/js/shell.js keeps the detective). */
import { initNav } from './nav';

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initNav());
else initNav();
