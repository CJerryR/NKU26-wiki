/**
 * Icon set shared by Markdown blocks (`{icon="name"}` on a card heading) and
 * Astro components. 24×24 stroke icons; names are what authors type.
 * To add one: paste the inner SVG markup under a new name.
 */
export const ICONS = {
  "alert": "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"13\"></line><circle cx=\"12\" cy=\"16.5\" fill=\"currentColor\" r=\".6\"></circle>",
  "balance": "<path d=\"M12 3v18M5 7h14M7 7l-3 7h6zM17 7l3 7h-6z\"></path>",
  "board": "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8M8 13h6\"></path>",
  "book": "<path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z\"></path><line x1=\"9\" x2=\"9\" y1=\"3\" y2=\"19\"></line>",
  "briefcase": "<path d=\"M4 7h16v12H4z\"></path><path d=\"M8 7V4h8v3\"></path>",
  "building": "<path d=\"M5 20V7l7-4 7 4v13\"></path><path d=\"M9 20v-5h6v5\"></path>",
  "camera": "<rect height=\"12\" rx=\"2\" width=\"16\" x=\"4\" y=\"6\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>",
  "chart": "<line x1=\"4\" x2=\"20\" y1=\"20\" y2=\"20\"></line><rect height=\"6\" width=\"3\" x=\"6\" y=\"11\"></rect><rect height=\"10\" width=\"3\" x=\"11\" y=\"7\"></rect><rect height=\"4\" width=\"3\" x=\"16\" y=\"13\"></rect>",
  "check-circle": "<path d=\"M8 12l3 3 5-6\"></path><circle cx=\"12\" cy=\"12\" r=\"9\"></circle>",
  "chip": "<rect height=\"12\" rx=\"2\" width=\"12\" x=\"6\" y=\"6\"></rect><path d=\"M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3\"></path>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><polyline points=\"12 7 12 12 16 14\"></polyline>",
  "cost": "<path d=\"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"></path>",
  "cycle": "<path d=\"M21 12a9 9 0 1 1-3-6.7\"></path><polyline points=\"21 4 21 9 16 9\"></polyline>",
  "doc": "<path d=\"M6 3h9l3 3v15H6z\"></path><path d=\"M15 3v4h4\"></path>",
  "file": "<path d=\"M7 3h7l5 5v13H7z\"></path><polyline points=\"14 3 14 8 19 8\"></polyline>",
  "flask": "<path d=\"M9 3v4l-5 9a3 3 0 0 0 3 4h10a3 3 0 0 0 3-4l-5-9V3\"></path><line x1=\"8\" x2=\"16\" y1=\"3\" y2=\"3\"></line>",
  "gear": "<circle cx=\"12\" cy=\"12\" r=\"3.2\"></circle><path d=\"M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.3-1.3L13.7 2h-3.4l-.4 2.5a7 7 0 0 0-2.3 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.3 1.3l.4 2.5h3.4l.4-2.5a7 7 0 0 0 2.3-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z\"></path>",
  "globe": "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"></path>",
  "group": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 21a6.5 6.5 0 0 1 13 0M16 5a3.2 3.2 0 0 1 0 6.4M22 21a6.5 6.5 0 0 0-4-6\"></path>",
  "hand": "<path d=\"M9 11V5a1.5 1.5 0 0 1 3 0v6M12 11V4a1.5 1.5 0 0 1 3 0v7M15 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.5L3 14a1.6 1.6 0 0 1 2.5-2L7 14\"></path>",
  "id-card": "<path d=\"M4 6h16v12H4z\"></path><path d=\"M8 10h8M8 14h5\"></path>",
  "inspect": "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><line x1=\"21\" x2=\"16.7\" y1=\"21\" y2=\"16.7\"></line><line x1=\"11\" x2=\"11\" y1=\"8\" y2=\"11.5\"></line>",
  "leaf": "<path d=\"M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16z\"></path><line x1=\"6\" x2=\"13\" y1=\"18\" y2=\"11\"></line>",
  "lines": "<path d=\"M4 7h16M4 12h16M4 17h10\"></path>",
  "link": "<path d=\"M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1\"></path>",
  "mic": "<rect height=\"12\" rx=\"3\" width=\"6\" x=\"9\" y=\"2\"></rect><path d=\"M5 11a7 7 0 0 0 14 0M12 18v3\"></path>",
  "people": "<circle cx=\"9\" cy=\"8\" r=\"3.2\"></circle><path d=\"M2.5 20a6.5 6.5 0 0 1 13 0M17 5a3 3 0 0 1 0 6M16 20a6 6 0 0 0-2-4.5\"></path>",
  "person": "<circle cx=\"12\" cy=\"8\" r=\"3\"></circle><path d=\"M5 20a7 7 0 0 1 14 0\"></path>",
  "rocket": "<path d=\"M5 15c-2 1-2 5-2 5s4 0 5-2M9 11a8 8 0 0 1 11-7 8 8 0 0 1-7 11l-2 2-4-4z\"></path><circle cx=\"15\" cy=\"9\" r=\"1.3\"></circle>",
  "roster": "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8M8 12h8M8 16h5\"></path>",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><line x1=\"21\" x2=\"16.7\" y1=\"21\" y2=\"16.7\"></line>",
  "shield": "<path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path>",
  "signal": "<path d=\"M12 2v6M5 8l-2 4 2 4M19 8l2 4-2 4M9 22h6\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle>",
  "timer": "<circle cx=\"12\" cy=\"12\" r=\"8\"></circle><path d=\"M12 8v4l3 2\"></path>",
  "verified": "<circle cx=\"12\" cy=\"12\" r=\"8\"></circle><path d=\"M8 12l2.5 2.5L16 9\"></path>",
};

const UI = {
  arrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 18 5 12 11 6"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>',
  arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><line x1="20" y1="20" x2="16" y2="16"/>',
  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  outline: '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  hash: '<line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/><line x1="10" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="14" y2="20"/>',
  external: '<path d="M14 5h5v5"/><line x1="19" y1="5" x2="11" y2="13"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
};

export function svg(inner, strokeWidth = 1.8) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export function iconSvg(name) {
  const inner = ICONS[name];
  return inner ? svg(inner) : null;
}

export const UI_ICONS = Object.fromEntries(Object.entries(UI).map(([k, v]) => [k, svg(v, 2)]));

export const CALLOUT_ICONS = {
  note: svg("<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"13\"></line><circle cx=\"12\" cy=\"16.5\" fill=\"currentColor\" r=\".6\"></circle>"),
  tip: svg("<path d=\"M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c.7.7 1 1.3 1 2h6c0-.7.3-1.3 1-2a6 6 0 0 0-4-10z\"></path>"),
  warning: svg("<path d=\"M12 3l9 16H3z\"></path><line x1=\"12\" x2=\"12\" y1=\"9\" y2=\"14\"></line><circle cx=\"12\" cy=\"17\" fill=\"currentColor\" r=\".6\"></circle>"),
};
