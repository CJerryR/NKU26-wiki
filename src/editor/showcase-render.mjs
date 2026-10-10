/**
 * Builds the component-catalogue page (/component-showcase) as one HTML string.
 * toolkit-demo.astro passes in the rendered demo HTML of every sample; everything
 * else — hero, page recipes, catalogue, Word templates — is derived here from
 * showcase-data.mjs and the shared component specs, so the Word templates always
 * match the fields in Tina.
 */
import { showcase, families, groups, pages, tiers, coreWord } from './showcase-data.mjs';
import { specByName } from '../lib/toolkit-specs.mjs';

const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CORE_LABEL = { protein: '蛋白质结构（可旋转）', pdf: 'PDF 阅读器', html: 'HTML 阅读 / 交互演示', heading: '章节标题', text: '富文本 / 表格', layout: '排版模块', image: '图片与图注', gallery: '双图并排' };
const LONG_HINT = '可用加粗、链接、「- 」列表';
const ICON = {
  search: '<path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.35-4.35"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  clip: '<path d="m21 12-8.6 8.6a6 6 0 0 1-8.5-8.5l8.6-8.6a4 4 0 0 1 5.7 5.7l-8.6 8.6a2 2 0 0 1-2.8-2.8l7.9-7.9"/>',
};
const icon = (name, cls = 'sc-i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

/* --------------------------------------------------------- Word templates */
function hintOf(field) {
  if (field.kind === 'file') return `写附件文件名${field.accept ? `（${field.accept.join(' / ')}）` : ''}`;
  if (field.kind === 'select') return field.options.map((o) => (typeof o === 'string' ? o : o.label)).join(' / ');
  if (field.kind === 'tags') return field.hint || '可写多个，用顿号分隔';
  if (field.kind === 'bool') return '是 / 否';
  if (field.kind === 'long') return field.hint && field.hint.length < 40 ? field.hint : LONG_HINT;
  return field.hint || '';
}
function specWord(spec) {
  // Same order as the Tina form: fields before the list, the list, fields after it.
  const fields = []; const after = []; let item = null;
  for (const field of spec.fields) {
    if (field.kind === 'list') item = { name: field.item || '条目', count: 3, fields: field.fields.map((sub) => [sub.label, hintOf(sub)]) };
    else (item ? after : fields).push([field.label, hintOf(field)]);
  }
  return item ? { fields, item, after } : { fields };
}
export function wordOf(sample) {
  if (sample.word) return sample.word;
  const first = sample.blocks[0];
  const type = first._template;
  if (specByName[type]) return specWord(specByName[type]);
  if (type === 'layout') return coreWord[first.kind] || coreWord.text;
  return coreWord[type] || coreWord.text;
}
function tinaOf(sample) {
  const names = [...new Set(sample.blocks.map((block) => {
    const type = block._template;
    if (specByName[type]) return `「${specByName[type].label}」`;
    if (type === 'layout') return `「排版模块」，类型选 ${block.kind}`;
    return `「${CORE_LABEL[type] || type}」`;
  }))];
  return `Tina → Wiki 内页 → 选页面 → 正文排版 ＋ → ${names.join(' ＋ ')}`;
}
function wordTable(word) {
  const rows = word.fields.map(([label, hint]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(hint)}</td></tr>`).join('');
  const item = word.item ? `<tr class="sc-word__group"><td colspan="2">${esc(word.item.name)} × ${word.item.count}（按需增减，每条都填以下各项）</td></tr>${word.item.fields.map(([label, hint]) => `<tr class="sc-word__sub"><th scope="row">${esc(label)}</th><td>${esc(hint)}</td></tr>`).join('')}` : '';
  const after = (word.after || []).map(([label, hint]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(hint)}</td></tr>`).join('');
  return `<table class="sc-word"><thead><tr><th scope="col">字段</th><th scope="col">填写说明</th></tr></thead><tbody>${rows}${item}${after}</tbody></table>`;
}

/* ------------------------------------------------------------------ hero */
function heroArt() {
  const stamp = (x, y, code, text, w) => `<g class="sc-art__stamp" transform="translate(${x} ${y})"><rect width="${w}" height="26" rx="7"/><text x="10" y="17.5"><tspan class="sc-art__code">${code}</tspan><tspan dx="7">${text}</tspan></text></g>`;
  const lines = (x, y, widths, gap = 11) => widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="5" rx="2.5"/>`).join('');
  return `<svg class="sc-art" viewBox="0 0 470 380" role="img" aria-labelledby="sc-art-t"><title id="sc-art-t">PDF 排版示意：在页面草图上框出组件位置并写上编号</title>
  <g class="sc-art__sheet2"><rect x="70" y="36" width="300" height="330" rx="10"/></g>
  <g class="sc-art__sheet">
    <rect x="46" y="18" width="300" height="340" rx="10"/>
    <g class="sc-art__ink"><rect x="70" y="42" width="120" height="10" rx="5"/>${lines(70, 62, [230, 250, 180])}</g>
    <g class="sc-art__ring"><circle cx="104" cy="126" r="22"/><path d="M104 104a22 22 0 0 1 22 22"/></g>
    <g class="sc-art__ink">${lines(140, 110, [150, 170, 120, 160])}</g>
    <g class="sc-art__chart"><path d="M72 244 L72 196 M72 244 L322 244"/><polyline points="80,236 118,222 156,208 194,200 232,196 270,194 310,193"/><polyline class="sc-art__c2" points="80,240 118,236 156,228 194,220 232,214 270,210 310,208"/></g>
    <g class="sc-art__quote"><rect x="70" y="276" width="4" height="36" rx="2"/></g>
    <g class="sc-art__ink">${lines(84, 280, [210, 160, 90], 10)}</g>
    <g class="sc-art__ink">${lines(70, 328, [240, 200], 10)}</g>
  </g>
  <g class="sc-art__marks">
    <rect x="62" y="96" width="274" height="64" rx="8"/>
    <rect x="62" y="186" width="274" height="66" rx="8"/>
    <rect x="62" y="270" width="274" height="46" rx="8"/>
  </g>
  ${stamp(262, 82, 'P01', '工程循环｜2 轮', 168)}
  ${stamp(282, 172, 'D01', '折线图｜误差棒 SD', 178)}
  ${stamp(294, 258, 'W06', '引言', 104)}
  <g class="sc-art__file" transform="translate(356 314)"><rect width="100" height="30" rx="8"/><text x="12" y="19.5">fig3.csv</text></g>
  <path class="sc-art__link" d="M406 314 C 406 280, 380 262, 336 250"/>
</svg>`;
}

/* --------------------------------------------------------------- recipes */
const sampleByCode = Object.fromEntries(showcase.map((s) => [s.code, s]));
const pagesOf = (code) => pages.filter((p) => p.use.includes(code));
function recipeCard(page) {
  const list = page.use.map((code) => `<li><a href="#sample-${code}"><span class="sc-code sc-code--${code[0]}">${code}</span><span>${esc(sampleByCode[code]?.title || code)}</span></a></li>`).join('');
  return `<article class="sc-recipe" id="page-${page.id}" data-groups="${esc(page.groups.join('|'))}">
    <header class="sc-recipe__head"><h4>${esc(page.name)}</h4><p class="sc-recipe__zh">${esc(page.zh)}</p><p class="sc-recipe__meta"><span>${esc(page.path)}</span><span>${esc(page.groups.join(' · '))}</span></p></header>
    <p class="sc-recipe__need">${esc(page.need)}</p>
    <ol class="sc-recipe__use">${list}</ol>
    <footer class="sc-recipe__foot"><button type="button" class="sc-btn sc-btn--small" data-add-page="${page.id}">${icon('plus')}<span>整页加入候选</span></button><button type="button" class="sc-btn sc-btn--small sc-btn--quiet" data-doc-page="${page.id}">${icon('doc')}<span>Word 骨架</span></button></footer>
  </article>`;
}
function recipes() {
  return tiers.map((tier) => {
    const list = pages.filter((p) => p.tier === tier.key);
    return `<div class="sc-tier sc-tier--${tier.key}">
      <header class="sc-tier__head"><h3>${esc(tier.name)}</h3><span class="sc-due-chip">DDL ${esc(tier.due)}</span><p>${esc(tier.note)}</p></header>
      <div class="sc-recipes">${list.map(recipeCard).join('')}</div>
    </div>`;
  }).join('');
}

/* --------------------------------------------------------------- samples */
function sampleHtml(sample, html) {
  const fits = pagesOf(sample.code);
  const word = wordOf(sample);
  const search = [sample.code, sample.title, sample.tip, sample.groups.join(' '), fits.map((p) => `${p.name} ${p.zh}`).join(' '), sample.blocks.map((b) => b._template + ' ' + (b.kind || '')).join(' ')].join(' ').toLowerCase();
  return `<article class="sc-sample" id="sample-${sample.code}" data-code="${sample.code}" data-groups="${esc(sample.groups.join('|'))}" data-search="${esc(search)}">
    <header class="sc-sample__head">
      <span class="sc-code sc-code--${sample.family} sc-code--big">${sample.code}</span>
      <div class="sc-sample__title"><h3>${esc(sample.title)}</h3><p>${esc(sample.tip)}</p></div>
      <label class="sc-pick"><input type="checkbox" value="${sample.code}" data-pick><span class="sc-pick__box">${icon('check')}</span><span class="sc-pick__t">加入候选</span></label>
    </header>
    <p class="sc-sample__meta">${fits.length ? `<span class="sc-sample__k">适合</span>${fits.map((p) => `<a class="sc-fit" href="#page-${p.id}">${esc(p.name)}</a>`).join('')}` : ''}<span class="sc-sample__k">组别</span><span class="sc-sample__groups">${esc(sample.groups.join(' · '))}</span></p>
    <div class="sc-stage prose">${html}</div>
    <details class="sc-how">
      <summary><span>交材料：Word 填写模板 · PDF 标注 · 后台位置</span>${icon('down', 'sc-i sc-how__chev')}</summary>
      <div class="sc-how__grid">
        <div class="sc-how__word">
          <div class="sc-how__bar"><h4>Word 填写模板</h4><button type="button" class="sc-btn sc-btn--small sc-btn--quiet" data-copy-word="${sample.code}">${icon('copy')}<span>复制模板文字</span></button></div>
          ${wordTable(word)}
          <p class="sc-how__note">中文、英文各写一份；图片、CSV 等附件的文件名要和表中一致。</p>
        </div>
        <div class="sc-how__side">
          <h4>PDF 排版标注</h4><p class="sc-stamp"><span>${esc(sample.mark || sample.code)}</span></p>
          <h4>需要准备</h4><p>${esc(sample.materials || '')}</p>
          <h4>后台位置</h4><p class="sc-how__tina">${esc(tinaOf(sample))}</p>
          ${sample.old ? `<p class="sc-how__old">旧版编号 ${esc(sample.old)}</p>` : ''}
        </div>
      </div>
    </details>
  </article>`;
}

/* ------------------------------------------------------------------ page */
export function renderShowcase(rendered) {
  const htmlOf = Object.fromEntries(showcase.map((s, i) => [s.code, rendered[i] || '']));
  const byFamily = families.map((fam) => ({ ...fam, items: showcase.filter((s) => s.family === fam.key) }));
  const data = {
    samples: Object.fromEntries(showcase.map((s) => [s.code, { title: s.title, family: s.family, old: s.old || null, mark: s.mark || s.code, materials: s.materials || '', tina: tinaOf(s), word: wordOf(s), pages: pagesOf(s.code).map((p) => p.id) }])),
    pages: pages.map(({ id, name, zh, path, tier, use }) => ({ id, name, zh, path, tier, use })),
    tiers: tiers.map(({ key, name, due }) => ({ key, name, due })),
  };
  const toolkitCount = Object.keys(specByName).length;
  return `<div class="sc" id="sc-top">
  <header class="sc-hero">
    <div class="sc-wrap sc-hero__grid">
      <div class="sc-hero__text">
        <p class="sc-kicker">NKU26 Wiki · 组件目录 · 本地预览</p>
        <h1 class="sc-hero__title">先选好怎么展示，<br>再动笔写文案。</h1>
        <p class="sc-hero__lead">${showcase.length} 个可以直接在 Tina 里使用的示例，覆盖奖牌页、专项奖和通用页面。写 Word 时照着组件的填写模板组织内容，在 PDF 排版示意里标上组件编号，排版时就能原样搭出来。</p>
        <div class="sc-due">${tiers.slice(0, 1).concat(tiers.slice(2, 3)).map((t, i) => `<p class="sc-due__item"><b>${esc(t.due)}</b><span>${i === 0 ? '铜牌 / 银牌页 + 专项奖' : '通用 / 技术页面 + 可选页面'}</span></p>`).join('')}</div>
        <p class="sc-hero__cta"><a class="sc-btn sc-btn--light" href="#pages">按页面挑组件 ${icon('arrow')}</a><a class="sc-btn sc-btn--ghost" href="#catalog">浏览全部组件</a></p>
      </div>
      <figure class="sc-hero__art">${heroArt()}<figcaption>PDF 排版示意这样标：框出位置，写上组件编号和关键设置。</figcaption></figure>
    </div>
    <ol class="sc-wrap sc-steps" aria-label="提交流程">
      <li><span class="sc-steps__n">1</span><div><b>Word 文案（中英）</b><p>按组件的填写模板写，字段和后台一一对应。</p></div></li>
      <li><span class="sc-steps__n">2</span><div><b>PDF 排版示意</b><p>在页面草图上框出位置，写组件编号和关键设置，例如「D01 折线图｜误差棒 SD」。</p></div></li>
      <li><span class="sc-steps__n">3</span><div><b>独立附件</b><p>图片、CSV、PDF 单独放，文件名和正文、模板里写的一致。</p></div></li>
      <li class="sc-steps__zip">${icon('clip')}<div><b>打包成一个 zip 提交</b><p>编号规则：P 项目叙事 · D 数据与模型 · M 图像与媒体 · L 版式与导航 · W 文字与结构</p></div></li>
    </ol>
  </header>

  <nav class="sc-bar" aria-label="组件筛选">
    <div class="sc-wrap sc-bar__in">
      <label class="sc-search">${icon('search')}<span class="sc-sr">搜索组件</span><input id="sc-q" type="search" placeholder="搜索：误差棒、IHP、D01、访谈…" autocomplete="off"></label>
      <div class="sc-seg" role="group" aria-label="按组别筛选">${['全部', ...groups].map((g, i) => `<button type="button" data-group="${esc(g)}" aria-pressed="${i === 0}">${esc(g)}</button>`).join('')}</div>
      <label class="sc-only"><input id="sc-only" type="checkbox"><span>只看已选</span></label>
      <span class="sc-count" id="sc-count" aria-live="polite"></span>
      <a class="sc-picked" href="#selection">候选清单 <b id="sc-picked-n">0</b></a>
    </div>
  </nav>

  <section class="sc-sec" id="pages" aria-labelledby="pages-t">
    <div class="sc-wrap">
      <header class="sc-sec__head"><h2 id="pages-t">按页面挑</h2><p>按奖项优先级排列。每张卡片列出这一页推荐的组件：点编号跳到示例；「整页加入候选」把推荐组件都放进清单；「Word 骨架」直接下载这一页的填写模板。</p></header>
      ${recipes()}
    </div>
  </section>

  <section class="sc-sec sc-cat" id="catalog" aria-labelledby="catalog-t">
    <div class="sc-wrap sc-cat__grid">
      <aside class="sc-side" aria-label="组件分类">
        <h2 id="catalog-t" class="sc-side__t">全部组件</h2>
        <ul class="sc-side__list">${byFamily.map((fam) => `<li><a href="#fam-${fam.key}" data-fam-link="${fam.key}"><span class="sc-code sc-code--${fam.key}">${fam.key}</span><span class="sc-side__name">${esc(fam.name)}</span><span class="sc-side__n" data-fam-count="${fam.key}">${fam.items.length}</span></a></li>`).join('')}</ul>
        <p class="sc-side__note">共 ${showcase.length} 个示例，其中 ${toolkitCount} 种交互组件。数字、人物、序列均为演示内容，不是 NKU 项目结果。</p>
      </aside>
      <div class="sc-cat__main">
        ${byFamily.map((fam) => `<section class="sc-fam" id="fam-${fam.key}" data-family="${fam.key}" aria-labelledby="fam-${fam.key}-t">
          <header class="sc-fam__head"><span class="sc-code sc-code--${fam.key} sc-code--fam">${fam.key}</span><div><h2 id="fam-${fam.key}-t">${esc(fam.name)}</h2><p>${esc(fam.desc)}</p></div></header>
          ${fam.items.map((s) => sampleHtml(s, htmlOf[s.code])).join('')}
        </section>`).join('')}
        <p class="sc-none" id="sc-none" hidden>没有符合条件的组件，换个关键词试试。</p>
      </div>
    </div>
  </section>

  <section class="sc-sec sc-sel" id="selection" aria-labelledby="sel-t">
    <div class="sc-wrap">
      <header class="sc-sec__head"><h2 id="sel-t">候选清单</h2><p>勾选会保存在这台电脑的浏览器里。给每个组件选好准备用在哪一页，导出的 Word 模板会按页面分节，每个组件一张填写表。</p></header>
      <div class="sc-sel__grid">
        <div class="sc-sel__form">
          <label class="sc-field"><span>组别 / 联系人</span><input id="sc-team" type="text" placeholder="例如：HP 组 · 张三"></label>
          <label class="sc-field"><span>备注</span><textarea id="sc-notes" rows="4" placeholder="例如：D01 需要两张图并排；P02 反馈约 8 条"></textarea></label>
          <div class="sc-sel__actions"><button type="button" class="sc-btn sc-btn--primary" id="sc-export-doc">${icon('doc')}<span>导出 Word 填写模板</span></button><button type="button" class="sc-btn" id="sc-export-txt">导出 .txt</button><button type="button" class="sc-btn sc-btn--quiet" id="sc-clear">清空</button></div>
          <p class="sc-sel__hint">.doc 可直接用 Word 或 WPS 打开；请另存为 .docx 后再填写。</p>
        </div>
        <div class="sc-sel__list" id="sc-sel-list"></div>
      </div>
    </div>
  </section>

  <section class="sc-sec sc-src" aria-label="素材说明">
    <div class="sc-wrap"><details class="sc-srcbox"><summary>示例素材来源与说明</summary>
      <p>除以下两份公开文件外，本页所有图形、数字、序列、人物、访谈与活动都是演示内容，不代表 NKU 项目成果或真实人员。</p>
      <ul><li>蛋白结构 1CRN：RCSB Protein Data Bank，<a href="https://www.rcsb.org/structure/1CRN">rcsb.org/structure/1CRN</a></li><li>PDF 示例：Mozilla PDF.js 官方展示文档，<a href="https://mozilla.github.io/pdf.js/web/viewer.html">mozilla.github.io/pdf.js</a></li><li>凝胶图为人工绘制的示意图，不是实验图像；SBOL 线路图形参考 SBOL Visual 规范自行绘制。</li></ul>
    </details></div>
  </section>
  <script type="application/json" id="sc-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</div>`;
}
