/* Component catalogue: filtering, shortlist (saved in this browser) and Word / TXT export. */
const root = document.querySelector('.sc');
const dataEl = document.getElementById('sc-data');
if (root && dataEl) init(JSON.parse(dataEl.textContent));

function init(data) {
  const $ = (sel, el = root) => el.querySelector(sel);
  const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
  const KEY = 'nku-component-shortlist-v2';
  const OLD_KEY = 'nku-component-shortlist-v1';
  const pageById = Object.fromEntries(data.pages.map((p) => [p.id, p]));
  const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------ state */
  let state = { ids: [], team: '', notes: '', pages: {} };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const saved = read(KEY);
  if (saved && Array.isArray(saved.ids)) state = { ...state, ...saved, ids: saved.ids.filter((c) => data.samples[c]) };
  else {
    const old = read(OLD_KEY); // v1 stored the old two-digit ids
    if (old && Array.isArray(old.ids)) {
      const map = {};
      for (const [code, s] of Object.entries(data.samples)) if (s.old) (map[s.old] ||= []).push(code);
      state.ids = [...new Set(old.ids.flatMap((id) => map[id] || []))];
      state.team = old.team || ''; state.notes = old.notes || '';
    }
  }
  for (const code of state.ids) if (!(code in state.pages)) state.pages[code] = data.samples[code].pages[0] || '';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

  /* ------------------------------------------------------------ toast */
  const toast = document.createElement('div');
  toast.className = 'sc-toast'; toast.setAttribute('role', 'status');
  root.append(toast);
  let toastTimer = 0;
  const say = (text) => { toast.textContent = text; toast.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200); };

  /* ---------------------------------------------------------- filters */
  const samples = $$('.sc-sample');
  const q = $('#sc-q'); const only = $('#sc-only'); const count = $('#sc-count');
  let group = '全部';
  function applyFilters() {
    const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0; const perFam = {};
    for (const el of samples) {
      const gs = el.dataset.groups.split('|');
      const ok = (group === '全部' || gs.includes(group) || gs.includes('全组'))
        && (!only.checked || state.ids.includes(el.dataset.code))
        && words.every((w) => el.dataset.search.includes(w));
      el.hidden = !ok;
      if (ok) { shown++; perFam[el.dataset.code[0]] = (perFam[el.dataset.code[0]] || 0) + 1; }
    }
    $$('.sc-fam').forEach((fam) => { fam.hidden = !perFam[fam.dataset.family]; });
    $$('[data-fam-count]').forEach((n) => { n.textContent = perFam[n.dataset.famCount] || 0; n.closest('li').classList.toggle('is-empty', !perFam[n.dataset.famCount]); });
    $$('.sc-recipe').forEach((card) => { const gs = card.dataset.groups.split('|'); card.hidden = !(group === '全部' || gs.includes(group) || gs.includes('全组')); });
    $$('.sc-tier').forEach((tier) => { tier.hidden = !tier.querySelector('.sc-recipe:not([hidden])'); });
    count.textContent = shown === samples.length ? `${shown} 个组件` : `显示 ${shown} / ${samples.length}`;
    $('#sc-none').hidden = shown > 0;
  }
  q.addEventListener('input', applyFilters);
  only.addEventListener('change', applyFilters);
  $$('.sc-seg [data-group]').forEach((btn) => btn.addEventListener('click', () => {
    group = btn.dataset.group;
    $$('.sc-seg [data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    applyFilters();
  }));

  /* ------------------------------------------------------------ picks */
  const boxes = $$('[data-pick]');
  function setPicked(code, on, page) {
    const has = state.ids.includes(code);
    if (on && !has) { state.ids.push(code); state.pages[code] = page ?? state.pages[code] ?? (data.samples[code].pages[0] || ''); }
    if (on && has && page && !state.pages[code]) state.pages[code] = page;
    if (!on && has) { state.ids = state.ids.filter((c) => c !== code); delete state.pages[code]; }
  }
  function sync() {
    boxes.forEach((b) => { b.checked = state.ids.includes(b.value); b.closest('.sc-sample')?.classList.toggle('is-picked', b.checked); });
    $('#sc-picked-n').textContent = state.ids.length;
    renderList(); save();
    if (only.checked) applyFilters();
  }
  boxes.forEach((b) => b.addEventListener('change', () => { setPicked(b.value, b.checked); sync(); say(b.checked ? `已加入 ${b.value}` : `已移除 ${b.value}`); }));
  $$('[data-add-page]').forEach((btn) => btn.addEventListener('click', () => {
    const page = pageById[btn.dataset.addPage];
    const before = state.ids.length;
    page.use.forEach((code) => setPicked(code, true, page.id));
    sync();
    say(`${page.name}：新加入 ${state.ids.length - before} 个组件`);
  }));
  $$('[data-doc-page]').forEach((btn) => btn.addEventListener('click', () => {
    const page = pageById[btn.dataset.docPage];
    download(`NKU26-${page.id}-template.doc`, docHtml([{ page, codes: page.use }], `${page.name} 页面`), 'application/msword');
  }));
  $$('[data-copy-word]').forEach((btn) => btn.addEventListener('click', async () => {
    const text = textTemplate(btn.dataset.copyWord);
    try { await navigator.clipboard.writeText(text); say('模板文字已复制'); }
    catch { download(`${btn.dataset.copyWord}-template.txt`, text, 'text/plain'); }
  }));

  /* -------------------------------------------------------- shortlist */
  const listEl = $('#sc-sel-list'); const team = $('#sc-team'); const notes = $('#sc-notes');
  team.value = state.team; notes.value = state.notes;
  team.addEventListener('input', () => { state.team = team.value; save(); });
  notes.addEventListener('input', () => { state.notes = notes.value; save(); });
  const pageOptions = (current) => ['<option value="">未定页面</option>', ...data.tiers.map((t) => `<optgroup label="${esc(t.name)}">${data.pages.filter((p) => p.tier === t.key).map((p) => `<option value="${p.id}"${p.id === current ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>`)].join('');
  function renderList() {
    if (!state.ids.length) {
      listEl.innerHTML = '<div class="sc-sel__empty"><p><b>还没有选择组件。</b></p><p>在示例右上角勾选「加入候选」，或在「按页面挑」里点「整页加入候选」。</p></div>';
      return;
    }
    const used = new Set(state.ids.map((c) => state.pages[c]).filter(Boolean));
    listEl.innerHTML = `<p class="sc-sel__sum">${state.ids.length} 个组件 · ${used.size} 个页面</p><ol class="sc-sel__items">${state.ids.map((code) => {
      const s = data.samples[code];
      return `<li class="sc-sel__item"><a class="sc-code sc-code--${s.family}" href="#sample-${code}">${code}</a><span class="sc-sel__title">${esc(s.title)}</span><label class="sc-sel__page"><span class="sc-sr">${code} 用于页面</span><select data-page-of="${code}">${pageOptions(state.pages[code])}</select></label><button type="button" class="sc-sel__rm" data-rm="${code}" aria-label="移除 ${code}">×</button></li>`;
    }).join('')}</ol>`;
  }
  listEl.addEventListener('change', (e) => { const sel = e.target.closest('[data-page-of]'); if (sel) { state.pages[sel.dataset.pageOf] = sel.value; save(); } });
  listEl.addEventListener('click', (e) => { const rm = e.target.closest('[data-rm]'); if (rm) { setPicked(rm.dataset.rm, false); sync(); } });
  $('#sc-clear').addEventListener('click', () => { if (state.ids.length && confirm('清空全部候选组件？')) { state.ids = []; state.pages = {}; sync(); } });

  function sections() {
    const byPage = new Map();
    for (const code of state.ids) { const id = state.pages[code] || ''; if (!byPage.has(id)) byPage.set(id, []); byPage.get(id).push(code); }
    const ordered = data.pages.filter((p) => byPage.has(p.id)).map((p) => ({ page: p, codes: byPage.get(p.id) }));
    if (byPage.has('')) ordered.push({ page: null, codes: byPage.get('') });
    return ordered;
  }
  $('#sc-export-doc').addEventListener('click', () => {
    if (!state.ids.length) return say('请先勾选组件');
    download(`NKU26-shortlist-${stamp()}.doc`, docHtml(sections(), state.team || '候选清单'), 'application/msword');
  });
  $('#sc-export-txt').addEventListener('click', () => {
    if (!state.ids.length) return say('请先勾选组件');
    const head = [`NKU26 Wiki 组件候选清单（${stamp()}）`, state.team && `组别 / 联系人：${state.team}`, state.notes && `备注：${state.notes}`].filter(Boolean).join('\n');
    const body = sections().map(({ page, codes }) => `\n==== ${page ? `${page.name}（${page.path}）` : '未定页面'} ====\n\n${codes.map(textTemplate).join('\n\n')}`).join('\n');
    download(`NKU26-shortlist-${stamp()}.txt`, `${head}\n${body}\n`, 'text/plain');
  });

  /* ---------------------------------------------------- export makers */
  function textTemplate(code) {
    const s = data.samples[code]; const w = s.word;
    const line = ([label, hint]) => `${label}${hint ? `（${hint}）` : ''}\n  中：\n  EN：`;
    const parts = [`【${code} ${s.title}】`, `后台：${s.tina}`, `PDF 标注示例：${s.mark}`, ''];
    parts.push(...w.fields.map(line));
    if (w.item) for (let i = 1; i <= w.item.count; i++) parts.push(`—— ${w.item.name} ${i} ——`, ...w.item.fields.map(line));
    if (w.after?.length) parts.push('——', ...w.after.map(line));
    return parts.join('\n');
  }
  function docTable(code) {
    const s = data.samples[code]; const w = s.word;
    const row = ([label, hint]) => `<tr><td class="f"><b>${esc(label)}</b>${hint ? `<br><span class="h">${esc(hint)}</span>` : ''}</td><td></td><td></td></tr>`;
    let rows = w.fields.map(row).join('');
    if (w.item) for (let i = 1; i <= w.item.count; i++) rows += `<tr><td colspan="3" class="g">${esc(w.item.name)} ${i}</td></tr>${w.item.fields.map(row).join('')}`;
    if (w.after?.length) rows += w.after.map(row).join('');
    return `<h3>【${code}】${esc(s.title)}</h3><p class="m">后台：${esc(s.tina)}<br>PDF 标注示例：${esc(s.mark)}<br>需要准备：${esc(s.materials)}</p><table><tr><th style="width:30%">字段</th><th>中文</th><th>English</th></tr>${rows}</table>`;
  }
  function docHtml(groups, title) {
    const body = groups.map(({ page, codes }) => `<h2>${page ? `${esc(page.name)} · ${esc(page.zh)}（${esc(page.path)}）` : '未定页面'}</h2>${codes.map(docTable).join('')}`).join('');
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-size:10.5pt;line-height:1.5;color:#241c2b}
h1{font-size:18pt;color:#523a8c;margin:0 0 6pt}h2{font-size:14pt;color:#523a8c;border-bottom:1.5pt solid #6e4fb8;padding-bottom:3pt;margin:22pt 0 8pt}
h3{font-size:12pt;margin:16pt 0 4pt}.m{color:#6c6373;font-size:9pt;margin:0 0 6pt}.intro{background:#f4eefb;padding:8pt;border:1pt solid #d8cdef}
table{border-collapse:collapse;width:100%;margin-bottom:6pt}th,td{border:1pt solid #b9aecb;padding:5pt 6pt;vertical-align:top}th{background:#efe6d6;text-align:left}
td.f{width:30%}.h{color:#8a8290;font-size:8.5pt}td.g{background:#f4eefb;font-weight:bold;color:#523a8c}
</style></head><body><h1>NKU26 Wiki 文案 · ${esc(title)}</h1>
<p class="m">导出时间 ${stamp(true)}${state.team ? ` ｜ 组别 / 联系人：${esc(state.team)}` : ''}</p>
<p class="intro">提交：一个 zip，内含 ① 本 Word 文案（中英）② PDF 排版示意——在页面草图上框出位置并写组件编号（如「D01 折线图｜误差棒 SD」）③ 独立附件，文件名与下表一致。<br>DDL：铜 / 银牌页与专项奖 10.5 22:00；通用 / 技术页面与可选页面 10.7 22:00。</p>
${state.notes ? `<p><b>备注：</b>${esc(state.notes)}</p>` : ''}${body}</body></html>`;
  }
  function stamp(full) { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${full ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : ''}`; }
  function download(name, content, type) {
    const blob = new Blob([type === 'application/msword' ? '\ufeff' + content : content], { type: `${type};charset=utf-8` });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    say(`已导出 ${name}`);
  }

  /* ------------------------------------------------- jumps & sidebar */
  function reveal(hash) {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target || !root.contains(target)) return;
    const box = target.closest('.sc-sample, .sc-recipe');
    if (box && (box.hidden || box.closest('[hidden]'))) {
      q.value = ''; only.checked = false; group = '全部';
      $$('.sc-seg [data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.group === '全部')));
      applyFilters();
      target.scrollIntoView({ block: 'start' });
    }
    if (box) { box.classList.remove('is-flash'); void box.offsetWidth; box.classList.add('is-flash'); }
  }
  window.addEventListener('hashchange', () => reveal(location.hash));
  root.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href') === location.hash) reveal(location.hash); });

  const famLinks = Object.fromEntries($$('[data-fam-link]').map((a) => [a.dataset.famLink, a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) Object.entries(famLinks).forEach(([k, a]) => a.toggleAttribute('aria-current', k === en.target.dataset.family));
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.sc-fam').forEach((s) => io.observe(s));
  }

  applyFilters(); sync();
  if (location.hash) requestAnimationFrame(() => reveal(location.hash));
}
