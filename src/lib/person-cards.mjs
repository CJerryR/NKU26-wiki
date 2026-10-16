/** Native, searchable member and credit cards; all text remains editable in Tina. */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs = (s) => String(s || '').split(/\n\s*\n/).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g,'-').replace(/^-|-$/g,'') || 'member';
function portrait(p, small = false) {
  
  // Optional portraits can only use site-relative or HTTPS image paths.
  const image = /^(?:https:\/\/|\/(?!\/))/.test(p.image || '') ? p.image : '';
  return image ? `<img class="${small ? 'credit' : 'member'}-portrait" src="${esc(image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`
    : `<span class="${small ? 'credit' : 'member'}-portrait person-placeholder" role="img" aria-label="${esc(p.name)} — portrait pending"><svg viewBox="0 0 100 120" aria-hidden="true" focusable="false"><circle cx="50" cy="43" r="20"/><path d="M13 112v-9a37 37 0 0 1 74 0v9Z"/></svg></span>`;
}
function name(p, id) { return `<div class="person-name"><h3 id="${id}">${esc(p.name)}</h3>${p.chineseName ? `<p class="person-name__cn" lang="zh">${esc(p.chineseName)}</p>` : ''}</div>`; }
export function renderMemberGrid(block) {
  return `<div class="member-grid">${(block.items || []).map(p => {
    const id=slug(p.anchor || p.name), intro=paragraphs(p.introduction);
    const facts=[['Field of study',p.major],['Year / cohort',p.cohort]].filter(([,v])=>v);
    return `<article class="member-card" id="${id}" data-member-card aria-labelledby="${id}-name"><div class="member-card__inner"><div class="member-card__face member-card__front"><div class="member-card__identity">${portrait(p)}${name(p,id+'-name')}</div><div class="member-card__info"><p class="member-card__role">${esc(p.role)}</p><dl class="member-card__facts">${facts.map(([k,v])=>`<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div><button type="button" data-member-flip aria-label="Meet ${esc(p.name)}" aria-expanded="false" aria-controls="${id}-intro"><span aria-hidden="true">↻</span></button></div><div class="member-card__face member-card__back" id="${id}-intro"><div class="member-card__identity">${portrait(p)}<div class="member-card__back-name">${esc(p.name)}${p.chineseName ? `<span lang="zh">${esc(p.chineseName)}</span>` : ''}</div></div><div class="member-card__bio">${intro}</div><button type="button" data-member-back aria-label="Back to ${esc(p.name)}’s profile"><span aria-hidden="true">↶</span></button></div></div></article>`;
  }).join('')}</div>`;
}
export function renderCreditGrid(block) {
  return `<div class="credit-grid">${(block.items || []).map(p => {
    const id=slug(p.anchor || p.name);const tasks=String(p.tasks || '').split(',').map(t=>t.trim()).filter(Boolean);const details=(p.specificTasks || []).filter(t=>t.text);
    return `<article class="credit-card" aria-labelledby="${id}"><header>${portrait(p,true)}<div>${name(p,id)}${p.role ? `<p class="credit-card__role">${esc(p.role)}</p>` : ''}</div></header><h4>Tasks</h4><p class="credit-card__tasks">${tasks.map(t=>`<span>${esc(t)}</span>`).join(', ')}</p><h4>Specific Tasks</h4>${details.length ? `<p class="credit-card__preview">(1) ${esc(details[0].text)}</p>` : ''}${details.length>1 ? `<details><summary><span class="credit-card__more">Read more⌄</span><span class="credit-card__less">Read less⌃</span></summary><div class="credit-card__rest">${details.slice(1).map((t,i)=>`<p>(${i+2}) ${esc(t.text)}</p>`).join('')}</div></details>` : ''}</article>`;
  }).join('')}</div>`;
}
