'use strict';
const translations = {
  "模型实验台": "Model explorer",
  "页面导航": "Page navigation",
  "ODE 曲线": "ODE curves",
  "Eco 报告": "Eco report",
  "从显色，到线虫风险。": "From color to nematode risk.",
  "两路吸光度，连接目标密度与 Eco 情景。": "Two absorbance readings connect target density to an Eco scenario.",
  "模拟演示 · 待实验校准": "Simulation demo · Experimental calibration pending",
  "输入样本": "Sample input",
  "输入模式": "Input mode",
  "模拟土样": "Simulated soil",
  "输入吸光度": "Enter absorbance",
  "土样组合": "Soil mixture",
  "读数类型": "Reading type",
  "已扣除空白的 A480": "Blank-corrected A480",
  "原始 A480": "Raw A480",
  "通道 3 空白": "Channel 3 blank",
  "通道 18 空白": "Channel 18 blank",
  "读数已饱和": "Readings are saturated",
  "开始计算": "Run model",
  "正在加载…": "Loading…",
  "样本与读数说明": "About samples and readings",
  "Mi：": "Mi: ",
  "（M.i.），南方根结线虫；Ce：": " (M.i.), southern root-knot nematode; Ce: ",
  "（C.e.），秀丽隐杆线虫。密度均按 100 cm³ 土壤计。": " (C.e.), a free-living nematode. Densities are per 100 cm³ of soil.",
  "同一土样的两个独立传感器，8 h 读取，1 cm 有效光程。模拟样本中的读数已扣空白。": "Two independent sensors read the same soil sample at 8 h, with a 1 cm effective path length. Simulated readings are blank-corrected.",
  "假设每条虫 #3＋#18 总释放量相同；Mi 比例为 1:10，Ce 为 10:1。": "Assumed equal #3 + #18 release per worm; Mi ratio 1:10, Ce ratio 10:1.",
  "密度与分级": "Density and risk tier",
  "下载结果": "Download results",
  "选择样本，开始计算。": "Choose a sample and run the model.",
  "如何理解结果": "Understanding the result",
  "根据两路显色估计目标线虫密度。区间越宽，结果越不确定；跨过分级线时，可比较不同情景。": "The two color readings estimate target nematode density. A wider interval means greater uncertainty. Compare scenarios when the interval crosses a tier boundary.",
  "目前是模拟演示，尚未用真实土样验证。风险等级采用西班牙设施番茄示例。": "This simulation has not been validated with real soil samples. Risk tiers use a greenhouse tomato example from Spain.",
  "ODE 时间响应": "ODE time response",
  "显示方式": "Display",
  "扣空白后的显色": "Blank-corrected pigment",
  "总显色（含空白）": "Total pigment (including blank)",
  "运行后展示当前样本的正向轨迹。": "Run the model to see this sample’s simulated time course.",
  "查看 ODE 参考曲线": "View reference ODE curves",
  "参考模拟轨迹，不由本次手动读数反演。": "Reference simulation; these curves are not inferred from your readings.",
  "四种模拟土样的 Fus3 与色素时间响应参考图": "Reference Fus3 and pigment time courses for four simulated soil samples",
  "Eco · 从风险到收益": "Eco · From risk to benefit",
  "完成预测后，查看对应的 Eco 情景。": "Run a prediction to view its Eco scenario.",
  "密度情景": "Density scenario",
  "下载 Eco 数据": "Download Eco data",
  "独立报告": "Standalone report",
  "ODE 与双通道图件": "ODE and dual-channel figures",
  "下载套装": "Download figure pack",
  "v7 模拟研究图件 · 点击图片放大查看": "v7 simulation figures · Click to enlarge",
  "模拟校准 · 本地运行": "Simulated calibration · Runs locally",
  "显色随线虫密度的变化": "Pigment response across nematode densities",
  "净色素随时间积累": "Net pigment accumulation over time",
  "两路颜色如何区分目标与背景": "Separating target and background with two channels",
  "双通道密度预测效果": "Dual-channel density prediction",
  "两路颜色组合超出校准范围，请检查读数与空白。": "The paired readings are outside the calibration range. Check the readings and blanks.",
  "回归得到负密度，暂不能用于分级。": "The regression returned a negative density. A risk tier cannot be assigned.",
  "读数已饱和，请更换可用读数。": "The readings are saturated. Please use unsaturated readings.",
  "密度或区间超出 Eco 的适用范围。": "The density or interval is outside the Eco model’s supported range.",
  "测量协议与校准模型不匹配。": "The measurement protocol does not match the calibration.",
  "密度单位不匹配。": "The density unit does not match.",
  "请输入有效的两路读数。": "Enter two valid readings.",
  "读数未通过质控。": "The readings failed quality control.",
  "输入已更新，点击「开始计算」。": "Inputs updated. Select “Run model”.",
  "等待本次计算结果。": "Waiting for the new result.",
  "手动读数直接进入回归；参考曲线可在下方展开。": "Manual readings go directly to regression. Reference curves are available below.",
  "通道 18（虚线）": "Channel 18 (dashed)",
  "通道 3": "Channel 3",
  "通道 18": "Channel 18",
  "时间 / 小时": "Time / hours",
  "8 小时：": "At 8 h: ",
  "：通道3和18共用坐标轴，时间0到8小时": ": channels 3 and 18 on shared axes, 0 to 8 hours",
  "扣空白后的色素等效浓度": "Blank-corrected pigment equivalent",
  "总色素等效浓度": "Total pigment equivalent",
  "同一份土样，两路显色直接比较。已扣除各自空白随时间产生的颜色；Ce 引起的信号仍保留。": "Compare both channels for the same soil sample. Each channel’s time-matched blank is subtracted; the Ce response remains.",
  "总显色包含传感器自身的基础产色。预测密度时，仍使用扣除空白后的 8 小时读数。": "Total pigment includes basal sensor output. Density prediction still uses blank-corrected readings at 8 h.",
  "回归计算值": "Regression estimate",
  "南方根结线虫密度": "Southern root-knot nematode density",
  "J2 / 100 cm³ 土壤": "J2 / 100 cm³ soil",
  "读数或估计不可用": "Reading or estimate unavailable",
  "条件模拟等级": "Conditional simulation tier",
  "按点估计分级": "Tier from point estimate",
  "暂不分级": "Not classified",
  "估计范围": "Estimated interval",
  "区间涉及": "The interval spans ",
  "档，可切换 Eco 情景查看。": " tiers. Select an Eco scenario to compare.",
  "密度或区间超出校准范围，仅供模拟情景展示。": "Density or interval exceeds calibration coverage. Simulation scenario only.",
  "模拟真值：": "Simulated ground truth: ",
  "手动读数直接进入回归；两路终点不能唯一反演时间轨迹。": "Manual readings go directly to regression. Two endpoints cannot uniquely determine a time course.",
  "本次结果暂不生成 Eco 报告。": "No Eco report is available for this result.",
  "以下仅为给定密度下的模拟情景，不代表已验证的风险预测。": "A simulation at the given density, not a validated risk prediction.",
  "区间涉及多个等级，请比较不同密度情景。": "The interval spans multiple tiers. Compare density scenarios.",
  "按给定密度计算，可切换区间端点比较。": "Calculated at the selected density. Compare interval endpoints using the selector.",
  "点估计": "Point estimate",
  "区间下端": "Interval lower end",
  "区间上端": "Interval upper end",
  "阈值 ": "Threshold ",
  " 下侧": " below",
  " 起点": " at",
  "低档": "Low",
  "中档": "Medium",
  "高档": "High",
  "低／中／高": "Low / Medium / High",
  "低／中": "Low / Medium",
  "中／高": "Medium / High",
  "计算完成": "Done",
  "正在计算 ODE…": "Solving ODE…",
  "正在计算…": "Calculating…",
  "计算失败": "Calculation failed",
  "请先重启本地服务，再刷新页面。": "Restart the local server, then refresh this page.",
  "模型加载失败": "Model loading failed",
  "网页已更新：请在原终端按 Control+C，重新运行 start.command，再刷新页面。": "Page updated: press Control+C in the server terminal, run start.command again, then refresh.",
  "西班牙 · 设施番茄": "Spain · Greenhouse tomato"
};
let uiLanguage = 'en';
try { if (localStorage.getItem('nemaklear-language') === 'zh') uiLanguage = 'zh'; } catch (_) {}
const translationKeys = Object.keys(translations).sort((a,b)=>b.length-a.length);
const translationPattern = new RegExp(translationKeys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
function tr(text) { return uiLanguage === 'en' ? String(text).replace(translationPattern,k=>translations[k]) : String(text); }
// Cache only initial markup. Dynamic results use tr() when rendered.
const staticText = [], staticAttributes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const n=walker.currentNode;
  if (!n.parentElement.closest('script,style') && /[\u3400-\u9fff]/.test(n.textContent)) staticText.push([n,n.textContent]);
}
for (const el of document.querySelectorAll('[aria-label],[alt]')) for (const attr of ['aria-label','alt']) {
  if(el.hasAttribute(attr)) staticAttributes.push([el,attr,el.getAttribute(attr)]);
}
function applyStaticLanguage() {
  document.documentElement.lang = uiLanguage === 'en' ? 'en' : 'zh-CN';
  document.title = uiLanguage === 'en' ? 'NemaKlear · Model explorer' : 'NemaKlear · 模型实验台';
  for (const [n,source] of staticText) n.textContent = tr(source);
  for (const [el,attr,source] of staticAttributes) el.setAttribute(attr,tr(source));
  document.getElementById('language').value=uiLanguage;
}
applyStaticLanguage();
