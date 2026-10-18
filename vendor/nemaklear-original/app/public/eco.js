'use strict';
// Native Eco presentation; all economic values come from the existing Python model.
function renderEco(view) {
  const r = view.report, d = r.diagnosis, en = view.language === 'en';
  const t = (zh, english) => en ? english : zh;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => Number(value).toLocaleString(en?'en-US':'zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const signed = value => (value>0?'+':'')+num(value);
  const pct = value => value == null ? t('不适用','N/A') : num(value*100)+'%';
  const unit = `${esc(r.scenario.currency)}/${esc(r.scenario.area_unit)}`;
  const table = (headers, rows) => `<div class="eco-table-wrap" tabindex="0" role="region" aria-label="${esc(headers.join(' · '))}"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const details = (title, content) => `<details class="eco-detail"><summary>${esc(title)}</summary>${content}</details>`;
  const scenarioNames = {'点估计':t('点估计','Point estimate'),'区间下端':t('区间下端','Interval lower end'),'区间上端':t('区间上端','Interval upper end')};
  const selected = view.context.scenario;
  const contextLabel = scenarioNames[selected.label] || (en ? selected.label.replace('阈值 ','Threshold ').replace(' 下侧',' below').replace(' 起点',' at') : selected.label);
  const heading = `<div class="eco-current"><div><span class="muted">${esc(contextLabel)}</span><h3>${num(r.input.density)} <span>J2/100 cm³</span></h3></div><div class="eco-plan"><span class="badge">${esc(d.band)}${t('档',' tier')}</span><strong>${esc(d.treatment)}</strong></div></div>`;
  const warning = d.effect_scope_warning ? `<p class="notice">${t('部分方案超出防效来源研究的密度支持范围，固定防效仅作演示假设。','Some treatment effects are extrapolated beyond source-study density support; fixed efficacy is a demonstration assumption.')}</p>` : '';
  const card = (title,value,caption,style='') => `<article class="eco-stat ${style}"><span>${esc(title)}</span><strong>${value}</strong><p>${caption}</p></article>`;
  const stats = `<div class="eco-stats">${card(t('未防治产量损失','Yield loss without control'),pct(d.yield_loss_fraction),t('给定当前密度的模型结果','Modelled at this density'))}${card(t('检测并防治，多赚多少？','What does testing + control add?'),signed(d.program_net_benefit_vs_no_control)+` <small>${unit}</small>`,t('相对未采取防治','Compared with no control'),'eco-program')}${card(t('先检测再处理，多赚多少？','What does testing add?'),signed(d.detection_net_benefit_vs_uniform)+` <small>${unit}</small>`,t('相对未检测统一处理','Compared with uniform control'),'eco-value')}</div>`;
  const profits = table([t('做法','Approach'),t('预计单季利润','Expected season profit')],[
    [t('不进行防治','No control'),`<strong>${num(d.net_income_without_test_no_control_per_ha)}</strong>`],
    [t('不检测，统一处理','Uniform treatment without testing'),`<strong>${num(d.net_income_without_test_uniform_per_ha)}</strong>`],
    [t('先检测，再按等级处理','Test, then treat by tier'),`<strong>${num(d.net_income_with_test_per_ha)}</strong>`]
  ]);
  const comparison = `<div class="eco-comparison"><div class="sectionhead"><h3>${t('三种情景，直接比较','Three scenarios compared')}</h3><span class="muted">${unit}</span></div>${profits}</div>`;
  const chart = `<div class="eco-curve"><div class="sectionhead"><h3>${t('净收益随密度变化','Net benefit across densities')}</h3><div class="eco-legend"><span class="purple">${t('项目 vs 无防治','Program vs no control')}</span><span class="amber">${t('检测 vs 统一处理','Testing vs uniform control')}</span></div></div>${view.curve_svg}<p class="hint">${t('圆点为当前情景；图示范围 0–500 J2/100 cm³。分级方案切换处保留断点，收益变化不代表置信区间。','Circles mark the selected scenario; shown range is 0–500 J2/100 cm³. Tier changes remain discontinuous; benefit scenarios are not confidence intervals.')}</p></div>`;
  const items=r.detection_cost_comparison.items;
  const maxCost=Math.max(...items.map(x=>x.cost_per_ha),1);
  const costChart=`<section class="cost-chart"><div class="sectionhead"><h3>${t('每公顷的检测费用','Testing cost per hectare')}</h3><span class="muted">${unit}</span></div>${items.map(row=>`<div class="cost-row"><span>${esc(row.method)}</span><div class="cost-track"><div style="width:${100*row.cost_per_ha/maxCost}%"></div></div><strong>${num(row.cost_per_ha)}</strong></div>`).join('')}<p class="hint">${esc(r.detection_cost_comparison.comparison_basis)} ${t('本项目试纸价格为团队假设。','The project test-strip price is a team assumption.')}</p></section>`;
  const assumptions = `<p>${esc(r.thresholds.plain_language_note)}</p><ul>${Object.values(r.assumptions).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  const refs = `<ol>${r.references.map(ref=>`<li><a href="${esc(/^https?:\/\//.test(ref.url)?ref.url:'#')}" target="_blank" rel="noopener">${esc(ref.citation)}</a></li>`).join('')}</ol>`;
  return heading+warning+stats+comparison+chart+costChart+`<p class="eco-more">${t('需要查看 ROI、参数变化和方案细节？请打开上方的“独立报告”。','For ROI, parameter changes and treatment details, open the standalone report above.')}</p><div class="eco-details">${details(t('数据依据与适用范围','Sources and scope'),assumptions+refs)}</div>`;
}
