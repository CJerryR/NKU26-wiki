'use strict';
const $ = id => document.getElementById(id);
let mode = 'simulation', data = null, result = null, request = 0, signalType = 'corrected';
let ecoRequest = 0, ecoController = null, currentEco = null;
const fmt = (v, n = 2) => Number(v).toFixed(n);
const reasons = {
  outside_joint_signal_hull: '两路颜色组合超出校准范围，请检查读数与空白。',
  negative_density: '回归得到负密度，暂不能用于分级。',
  saturated: '读数已饱和，请更换可用读数。',
  outside_eco_domain: '密度或区间超出 Eco 的适用范围。',
  protocol_mismatch: '测量协议与校准模型不匹配。',
  unit_mismatch: '密度单位不匹配。',
  invalid_signal: '请输入有效的两路读数。',
  qc_failed: '读数未通过质控。'
};
function invalidate() {
  request++;
  result = null;
  $('download').disabled = true;
  $('reportControls').hidden = true;
  resetEco();
  $('resultBody').innerHTML = tr('<p class="empty">输入已更新，点击「开始计算」。</p>');
  $('ecoNote').textContent = tr('等待本次计算结果。');
  $('curves').replaceChildren();
  $('reference').hidden = mode === 'simulation';
  $('curveNote').textContent = tr(mode === 'simulation' ? '运行后展示当前样本的正向轨迹。' : '手动读数直接进入回归；参考曲线可在下方展开。');
  $('status').textContent = tr('');
  $('run').disabled = !data;
}
function fillSample() {
  const s = data.samples.find(s => s.sample_id === $('sample').value);
  $('x3').value = s.signals[0].toPrecision(10);
  $('x18').value = s.signals[1].toPrecision(10);
  $('saturated').checked = false;
}
function setMode(next) {
  if (!data || mode === next) return;
  mode = next;
  for (const [id, m] of [['simMode', 'simulation'], ['manualMode', 'manual']]) {
    $(id).classList.toggle('active', mode === m);
    $(id).setAttribute('aria-pressed', String(mode === m));
  }
  $('simFields').hidden = mode !== 'simulation';
  $('manualFields').hidden = mode !== 'manual';
  $('x3').readOnly = $('x18').readOnly = mode === 'simulation';
  // Simulation fields always contain corrected readings; reset the convention.
  signalType = 'corrected';
  $('signalType').value = signalType;
  $('blankFields').hidden = true;
  fillSample();
  invalidate();
}
function changeConvention() {
  const next = $('signalType').value;
  for (const [input, blank] of [['x3', 'b3'], ['x18', 'b18']]) {
    const value = $(input).valueAsNumber, baseline = $(blank).valueAsNumber;
    if (Number.isFinite(value) && Number.isFinite(baseline)) {
      $(input).value = (value + (next === 'raw' ? baseline : -baseline)).toPrecision(12);
    }
  }
  signalType = next;
  $('blankFields').hidden = next !== 'raw';
  invalidate();
}
function combinedChart(key, title, unit) {
  const width=860, height=290, left=72, right=24, top=22, bottom=48;
  const values=['3','18'].flatMap(ch=>result.curves[ch][key]);
  const low=Math.min(0,...values), high=Math.max(...values,1e-6)*1.12;
  const X=x=>left+x/8*(width-left-right), Y=y=>height-bottom-(y-low)/(high-low)*(height-top-bottom);
  let markup='';
  for(let i=0;i<=4;i++) {
    const v=low+(high-low)*i/4, y=Y(v);
    markup+=`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#e7dfe8"/><text x="${left-12}" y="${y+4}" text-anchor="end">${Number(v.toPrecision(3))}</text>`;
  }
  for(let i=0;i<=8;i+=2) markup+=`<text x="${X(i)}" y="${height-22}" text-anchor="middle">${i}</text>`;
  for(const ch of ['3','18']) {
    const d=result.curves[ch], ys=d[key], color=ch==='3'?'#6e4fb8':'#bb7914';
    const path=ys.map((y,i)=>`${i?'L':'M'}${X(d.hours[i])},${Y(y)}`).join(' ');
    markup+=`<path d="${path}" fill="none" stroke="${color}" stroke-width="3" ${ch==='18'?'stroke-dasharray="8 4"':''}/><circle cx="${X(8)}" cy="${Y(ys.at(-1))}" r="4" fill="${color}"/>`;
  }
  const el=document.createElement('div');el.className='chart combined-chart';
  el.innerHTML=tr(`<div class="sectionhead"><h3>${title} · ${unit}</h3><div class="eco-legend"><span class="purple">通道 3</span><span class="amber">通道 18（虚线）</span></div></div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}：通道3和18共用坐标轴，时间0到8小时">${markup}<text x="${width-right}" y="${height-3}" text-anchor="end">时间 / 小时</text></svg><div class="curve-endpoints">8 小时：<span>通道 3 <b>${fmt(result.curves['3'][key].at(-1),4)}</b></span><span>通道 18 <b>${fmt(result.curves['18'][key].at(-1),4)}</b></span> ${unit}</div>`);
  return el;
}
function renderCurves() {
  $('curves').replaceChildren();
  if (!result?.curves) return;
  const key=$('colorBasis').value;
  $('curves').append(combinedChart(key,key==='pigment_net'?'扣空白后的色素等效浓度':'总色素等效浓度','μM'));
  $('curveNote').textContent=tr(key==='pigment_net'?'同一份土样，两路显色直接比较。已扣除各自空白随时间产生的颜色；Ce 引起的信号仍保留。':'总显色包含传感器自身的基础产色。预测密度时，仍使用扣除空白后的 8 小时读数。');
}
function reportURL() { return `/report/${result.id}/${$('scenario').value}?lang=${$('language').value}`; }
function resetEco() {
  ecoRequest++;
  if (ecoController) ecoController.abort();
  currentEco = null;
  $('ecoBody').replaceChildren();
  $('ecoBody').setAttribute('aria-busy','false');
  $('ecoStatus').textContent = tr('');
  $('ecoDownload').disabled = true;
  if (result) delete result.eco_view;
}
async function updateReport() {
  if (!result || result.risk.status === 'blocked') return;
  resetEco();
  const ticket = ecoRequest, resultId = result.id;
  const en = $('language').value === 'en';
  $('reportLink').href = reportURL();
  $('ecoBody').lang = en ? 'en' : 'zh-CN';
  $('ecoBody').setAttribute('aria-busy','true');
  $('ecoStatus').textContent = tr(en ? 'Calculating Eco scenario…' : '正在计算 Eco 情景…');
  $('ecoNote').textContent = result.risk.conditional_demo
    ? (en ? 'Density coverage exceeded: conditional simulation only.' : '密度或区间超出校准范围；以下仅作条件模拟。')
    : (en ? 'Simulated calibration. Compare conditional density scenarios, not benefit confidence intervals.' : '基于模拟校准；切换密度情景作比较，收益不是置信区间。');
  ecoController = new AbortController();
  try {
    const response = await fetch(`/api/eco/${resultId}/${$('scenario').value}?lang=${$('language').value}`,{signal:ecoController.signal});
    const body = await response.json();
    if (ticket !== ecoRequest || result?.id !== resultId) return;
    if (!response.ok) throw Error(body.error || 'Eco report unavailable');
    currentEco = body;
    result.eco_view = body;
    $('ecoBody').innerHTML = renderEco(body);
    $('ecoDownload').disabled = false;
    $('ecoStatus').textContent = tr('');
  } catch (err) {
    if (err.name !== 'AbortError' && ticket === ecoRequest) $('ecoStatus').textContent = tr(err.message);
  } finally {
    if (ticket === ecoRequest) $('ecoBody').setAttribute('aria-busy','false');
  }
}

function addNote(text) {
  const p = document.createElement('p');
  p.className = 'notice'; p.textContent = tr(text);
  $('resultBody').append(p);
}
function render(selectedScenario = "0") {
  const p = result.prediction, r = result.risk, blocked = r.status === 'blocked';
  const interval = r.physical_interval || p.prediction_interval_95;
  $('resultBody').innerHTML = tr(`<div class="densityline"><div><span class="unit">${blocked?'回归计算值':'南方根结线虫密度'}</span><div class="big">${fmt(p.density)}</div><span class="unit">J2 / 100 cm³ 土壤</span></div><div class="grade ${blocked?'block':''}"><span>${blocked?'读数或估计不可用':r.conditional_demo?'条件模拟等级':'按点估计分级'}</span><b>${blocked?'暂不分级':r.point_grade+'档'}</b></div></div><div class="interval"><span>估计范围</span><strong>${fmt(interval[0])} — ${fmt(interval[1])}</strong></div>`);
  if (blocked) {
    // Negative estimates also exceed calibration bounds; display the causal issue once.
    addNote(r.reasons.map(x => reasons[x] || x).join(' '));
  } else {
    if (r.grade_uncertain) addNote(`区间涉及${r.possible_grades.join('／')}档，可切换 Eco 情景查看。`);
    if (r.conditional_demo) addNote('密度或区间超出校准范围，仅供模拟情景展示。');
  }
  if (result.sample) {
    const note = document.createElement('p'); note.className = 'sampletruth';
    note.textContent = tr(`模拟真值：Mi ${result.sample.target_density_J2_per_100cm3} · Ce ${result.sample.background_density_L4_per_100cm3}`);
    $('resultBody').append(note);
  }
  $('curves').replaceChildren();
  $('reference').hidden = !!result.curves;
  if (result.curves) {
    renderCurves();
  } else $('curveNote').textContent = tr('手动读数直接进入回归；两路终点不能唯一反演时间轨迹。');
  $('download').disabled = false;
  $('reportControls').hidden = blocked;
  $('ecoNote').textContent = tr(blocked ? '本次结果暂不生成 Eco 报告。' : r.conditional_demo ? '以下仅为给定密度下的模拟情景，不代表已验证的风险预测。' : r.grade_uncertain ? '区间涉及多个等级，请比较不同密度情景。' : '按给定密度计算，可切换区间端点比较。');
  $('scenario').replaceChildren();
  result.scenarios.forEach((s,i) => {
    const opt = document.createElement('option'); opt.value = i;
    // Avoid displaying a rounded "10.00" with a low grade on the lower side.
    const densityText = s.label.includes('下侧') ? s.label.replace('阈值 ', '< ').replace(' 下侧', '') : fmt(s.density);
    opt.textContent = tr(`${s.label} · ${densityText} · ${s.grade}档`);
    $('scenario').append(opt);
  });
  if ($('scenario').querySelector(`option[value="${selectedScenario}"]`)) $('scenario').value=selectedScenario;
  if (!blocked) updateReport();
  $('status').textContent = tr('计算完成');
}
async function run(event) {
  if (event) event.preventDefault();
  if (!data) return;
  invalidate(); const ticket = request;
  $('run').disabled = true;
  $('status').textContent = tr(mode === 'simulation' ? '正在计算 ODE…' : '正在计算…');
  const payload = {mode, saturated:$('saturated').checked};
  if (mode === 'simulation') payload.sample_id = $('sample').value;
  else {
    payload.signals = [$('x3').valueAsNumber, $('x18').valueAsNumber];
    payload.signal_type = signalType;
    payload.blanks = [$('b3').valueAsNumber, $('b18').valueAsNumber];
  }
  try {
    const response = await fetch('/api/predict', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const body = await response.json();
    if (ticket !== request) return;
    if (!response.ok) throw Error(body.error || '计算失败');
    if (body.ui_policy_version !== 4) throw Error('请先重启本地服务，再刷新页面。');
    result = body; result.submitted_input = payload; render();
  } catch (err) { if (ticket === request) $('status').textContent = tr(err.message); }
  finally { if (ticket === request) $('run').disabled = false; }
}
$('simMode').onclick = () => setMode('simulation');
$('manualMode').onclick = () => setMode('manual');
$('sample').onchange = () => {fillSample(); invalidate();};
$('signalType').onchange = changeConvention;
for (const id of ['x3','x18','b3','b18','saturated']) $(id).addEventListener('input', invalidate);
$('form').onsubmit = run;
$('colorBasis').onchange = renderCurves;
$('scenario').onchange = updateReport;
$('language').onchange = () => {
  uiLanguage = $('language').value;
  try { localStorage.setItem('nemaklear-language',uiLanguage); } catch (_) {}
  const selected=$('scenario').value;
  applyStaticLanguage();
  renderGallery();
  if(data) $('ecoScenario').textContent=tr(data.scenario);
  if(result) render(selected);
  else if(data) invalidate();
};
$('ecoDownload').onclick = () => {
  if (!currentEco) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(currentEco,null,2)], {type:'application/json'}));
  const a = document.createElement('a'); a.href=url; a.download='nemaklear-eco-scenario.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('download').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(result,null,2)], {type:'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = 'nemaklear-result.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function renderGallery() {
$('figures').replaceChildren();
for (const [name,title] of [['fig-3-2-density-response','显色随线虫密度的变化'],['fig-3-3-net-timecourse','净色素随时间积累'],['fig-3-4-signal-space','两路颜色如何区分目标与背景'],['fig-3-5-prediction-comparison-wiki','双通道密度预测效果']]) {
  const el = document.createElement('article'); el.className = 'figure';
  el.innerHTML = tr(`<a href="/figures/wiki-v7/${name}.png" target="_blank" rel="noopener"><img src="/figures/wiki-v7/${name}.png" alt="${title}" loading="lazy"></a><div class="caption"><h3>${title}</h3>${['png','svg','pdf'].map(ext=>`<a href="/figures/wiki-v7/${name}.${ext}" download>${ext.toUpperCase()} ↓</a>`).join('')}</div>`);
  $('figures').append(el);
}
}
renderGallery();
(async () => {
  try {
    const response = await fetch('/api/bootstrap');
    if (!response.ok) throw Error('模型加载失败');
    const loaded = await response.json();
    if (loaded.ui_policy_version !== 4) throw Error('网页已更新：请在原终端按 Control+C，重新运行 start.command，再刷新页面。');
    data = loaded;
    for (const s of data.samples) {
      const opt = document.createElement('option'); opt.value = s.sample_id;
      opt.textContent = tr(`Mi ${s.target_density_J2_per_100cm3} ＋ Ce ${s.background_density_L4_per_100cm3}`);
      $('sample').append(opt);
    }
    $('sample').value = 'SIM-V4-T120-B80';

    $('ecoScenario').textContent = tr(data.scenario);
    fillSample(); await run();
  } catch (err) { $('status').textContent = tr(err.message); }
})();
