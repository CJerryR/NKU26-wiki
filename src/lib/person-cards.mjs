/**
 * Member and credit cards. Native, searchable HTML; every text stays editable in Tina.
 *
 * Members: a landscape flip card. A generous portrait on the left; the name and details
 * share a left-aligned column on the right. The back keeps the name below the portrait.
 * One round glass button turns the card; without scripting both faces are shown, one under
 * the other.
 * Credits: a ledger row. A portrait tile with a liquid-glass nameplate sits beside the Tasks
 * chips and the numbered Specific tasks; everything after the first opens in <details>.
 *
 * The markup is one line on purpose: a blank line would end the raw HTML block in Markdown.
 */
// Line breaks render as spaces in HTML anyway; folding them keeps a blank line typed into a
// Tina textarea from ending the raw HTML block early.
const esc = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs = (s) => String(s || '').split(/\n\s*\n/).map(t => t.trim()).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g,'-').replace(/^-|-$/g,'') || 'member';
// Optional portraits can only use site-relative or HTTPS image paths.
const photoSrc = p => /^(?:https:\/\/|\/(?!\/))/.test(p.image || '') ? p.image : '';

const glass = (cls, attrs = '') => `<div class="${cls} lg-glass" data-glass="panel" data-tone="dark"${attrs}><span class="lg-surface" aria-hidden="true"></span>`;
const chevron = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4"/></svg>';

/* No photo: the rings of the page header over loam, and a quiet silhouette. Decorative,
   because the name is always printed beside it. */
const emptyArt = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" focusable="false"><g class="portrait-rings">${[46, 92, 142, 196, 254].map(r => `<circle cx="252" cy="70" r="${r}"/>`).join('')}</g><path class="portrait-figure" d="M150 92a52 52 0 1 1 0 104a52 52 0 1 1 0-104ZM46 400v-38c0-62 47-104 104-104s104 42 104 104v38Z"/></svg>`;
const emptyPortrait = cls => `<div class="${cls} is-empty" aria-hidden="true">${emptyArt}</div>`;
const portrait = (p, cls) => {
  const src = photoSrc(p);
  return src ? `<div class="${cls}"><img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>` : emptyPortrait(cls);
};
/* "Analysis: did X" — the category before the colon is set in bold; the text is unchanged. */
const topic = t => { const m = /^([^:：\n]{2,40}[:：])\s+/.exec(t); return m ? `<strong class="credit-card__topic">${esc(m[1])}</strong> ${esc(t.slice(m[0].length))}` : esc(t); };
const nameBlock = (p, id, level = 3) => `<div class="person-name"><h${level} id="${id}">${esc(p.name)}</h${level}>${p.chineseName ? `<p class="person-name__cn" lang="zh">${esc(p.chineseName)}</p>` : ''}</div>`;

/* The photo sits in a glass frame. On the back it is decoration (the name is printed beside it). */
const memberPhoto = (p, alt) => {
  const src = photoSrc(p);
  return `<div class="member-card__photo">${src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : `<span class="member-card__blank" aria-hidden="true">${emptyArt}</span>`}</div>`;
};
const turn = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M16.2 8.2A6.6 6.6 0 0 0 4.3 6.1M3.8 2.8v3.5h3.5M3.8 11.8a6.6 6.6 0 0 0 11.9 2.1M16.2 17.2v-3.5h-3.5"/></svg>';

export function renderMemberGrid(block) {
  return `<div class="member-grid">${(block.items || []).map(p => {
    const id = slug(p.anchor || p.name), intro = paragraphs(p.introduction);
    const facts = [['University', p.university], ['Grade', p.cohort]].filter(([, v]) => String(v || '').trim());
    const role = p.role ? `<p class="member-card__role">${esc(p.role)}</p>` : '';
    const factList = rows => rows.length ? `<dl class="member-card__facts">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '';
    const dl = factList(facts);
    const front = `<div class="member-card__face member-card__front"><div class="member-card__identity">${memberPhoto(p, p.name)}</div><div class="member-card__info">${nameBlock(p, `${id}-name`, Math.max(3, Math.min(5, block.headingLevel || 3)))}${role}${dl}</div></div>`;
    // Nothing to turn over to: a single face, no button.
    if (!intro) return `<article class="member-card" id="${id}" aria-labelledby="${id}-name"><div class="member-card__inner">${front}</div></article>`;
    const backName = `<div class="member-card__back-name">${esc(p.name)}${p.chineseName ? `<span lang="zh">${esc(p.chineseName)}</span>` : ''}</div>`;
    const back = `<div class="member-card__face member-card__back" id="${id}-intro"><div class="member-card__identity">${memberPhoto(p, '')}${backName}</div><div class="member-card__back-content"><div class="member-card__bio">${intro}</div></div></div>`;
    const open = `Meet ${esc(p.name)}`, shut = `Back to ${esc(p.name)}’s profile`;
    return `<article class="member-card" id="${id}" data-member-card aria-labelledby="${id}-name"><div class="member-card__inner">${front}${back}</div>`
      + `<button type="button" class="member-card__flip" data-member-flip data-label-open="${open}" data-label-close="${shut}" aria-label="${open}" aria-expanded="false" aria-controls="${id}-intro">${turn}</button></article>`;
  }).join('')}</div>`;
}

export function renderCreditGrid(block) {
  return `<div class="credit-grid">${(block.items || []).map(p => {
    const id = slug(p.anchor || p.name);
    const tasks = String(p.tasks || '').split(',').map(t => t.trim()).filter(Boolean);
    const details = (p.specificTasks || []).map(t => String(t?.text || '').trim()).filter(Boolean);
    // Two items read faster than one item and a button, so short lists stay open.
    const shown = details.length <= 2 ? details.length : 1, rest = details.slice(shown);
    const list = (items, start) => `<ol class="credit-card__list"${start > 1 ? ` start="${start}"` : ''}>${items.map((t, i) => `<li value="${start + i}">${topic(t)}</li>`).join('')}</ol>`;
    const more = rest.length ? `<details class="credit-card__more"><summary><span class="credit-card__show">Show ${rest.length} more</span><span class="credit-card__hide">Show less</span>${chevron}</summary>${list(rest, shown + 1)}</details>` : '';
    return `<article class="credit-card" aria-labelledby="${id}"><div class="credit-card__id">${portrait(p, 'credit-card__photo')}`
      + `${glass('credit-card__plate')}${nameBlock(p, id, Math.max(3, Math.min(5, block.headingLevel || 3)))}${p.role ? `<p class="credit-card__role">${esc(p.role)}</p>` : ''}</div></div>`
      + `<div class="credit-card__body">${tasks.length ? `<h${Math.max(4, Math.min(6, (block.headingLevel || 3) + 1))} class="credit-card__label">Tasks</h${Math.max(4, Math.min(6, (block.headingLevel || 3) + 1))}><ul class="credit-card__tasks">${tasks.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}`
      + `${details.length ? `<h${Math.max(4, Math.min(6, (block.headingLevel || 3) + 1))} class="credit-card__label">Specific tasks</h${Math.max(4, Math.min(6, (block.headingLevel || 3) + 1))}>${list(details.slice(0, shown), 1)}${more}` : ''}</div></article>`;
  }).join('')}</div>`;
}
