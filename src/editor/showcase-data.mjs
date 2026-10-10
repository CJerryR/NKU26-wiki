/**
 * Component catalogue data. Every example here is demonstration material:
 * numbers, sequences, people, interviews and activities are invented, except the
 * two public files named in their captions (RCSB 1CRN, Mozilla PDF.js sample).
 */
const img = '/widgets/demo/';
const demo = '演示素材，不是 NKU 实验结果。';
const b = (type, props) => ({ _template: type, ...props });
const layout = (kind, body, props = {}) => b('layout', { kind, body, ...props });

/* ---------------------------------------------------------- synthetic data */
const series = 'Time,Control,Design A,Design B\n' + Array.from({ length: 15 }, (_, i) => `${i},${(i * 0.22).toFixed(2)},${(8 * (1 - Math.exp(-i / 5))).toFixed(2)},${(6 * (1 - Math.exp(-i / 3))).toFixed(2)}`).join('\n');
const seriesErr = 'Time (h),Control,Control ±,Design A,Design A ±,Design B,Design B ±\n' + Array.from({ length: 9 }, (_, i) => {
  const t = i * 2; const c = 0.3 + t * 0.04; const a = 8 * (1 - Math.exp(-t / 6)); const bb = 6 * (1 - Math.exp(-t / 3.5));
  return `${t},${c.toFixed(2)},${(0.15 + t * 0.01).toFixed(2)},${a.toFixed(2)},${(0.35 + a * 0.06).toFixed(2)},${bb.toFixed(2)},${(0.3 + bb * 0.05).toFixed(2)}`;
}).join('\n');
const barsErr = 'Condition,Design A,Design A_sd,Design B,Design B_sd\nNo inducer,0.8,0.2,0.6,0.15\nLow,3.1,0.5,2.2,0.4\nMedium,6.4,0.7,4.8,0.6\nHigh,7.9,0.9,6.1,0.8';
const plate = ',' + Array.from({ length: 12 }, (_, i) => i + 1).join(',') + '\n' + 'ABCDEFGH'.split('').map((r, ri) => `${r},${Array.from({ length: 12 }, (_, c) => (c === 11 ? '' : Math.round(200 + 3800 * (1 - Math.exp(-c / 3.2)) * (1 - ri * 0.09) + ((ri * 7 + c * 13) % 9) * 22))).join(',')}`).join('\n');
const sensitivity = 'Parameter,Peak level,Response time,Leak\nk_deg,-0.62,0.41,-0.08\nV_max,0.81,-0.22,0.12\nK_m,-0.35,0.28,0.05\nHill n,0.18,-0.47,-0.31\nPromoter leak,0.07,0.02,0.88';

/* ------------------------------------------------------------- families */
export const families = [
  { key: 'P', name: '项目叙事', desc: '工程循环、利益相关者、访谈、项目记录、元件集合、线路图与风险。' },
  { key: 'D', name: '数据与模型', desc: '图表、表格、热图、比较矩阵、公式、参数、代码、序列与结构。' },
  { key: 'M', name: '图像与媒体', desc: '单图、并排、相册、前后对比、图片标注、视频、PDF 与 HTML 交互。' },
  { key: 'L', name: '版式与导航', desc: '分栏切换、折叠问答、流程图与经典时间线。' },
  { key: 'W', name: '文字与结构', desc: '说明、建议、注意提示框与折叠详情。' },
];
export const groups = ['湿实验', '干实验', 'HP', '设计', '全组'];

/* ---------------------------------------------- Word templates (core) */
const W = (fields, item) => ({ fields, ...(item ? { item } : {}) });
export const coreWord = {
  heading: W([['章节标题', '中英文各一份；需要进页面目录的写上短标题']]),
  text: W([['正文', '可含加粗、链接、列表、表格；表格直接在 Word 里画']]),
  image: W([['图片文件名', '与附件一致，例如 fig2-gel.png'], ['图片说明（alt）', '一句话描述画面，给读屏软件'], ['图注', 'Fig. 编号 + 读图方式 + 来源']]),
  gallery: W([['左图文件名', ''], ['左图说明', ''], ['右图文件名', ''], ['右图说明', ''], ['统一图注', '']]),
  protein: W([['结构文件名', '.pdb / .cif'], ['初始显示方式', '丝带 / 球棍 / 原子球 / 分子表面'], ['突出显示的链', '例如 A'], ['突出显示的残基', '例如 42,57,100-105'], ['图注与来源', '写明结构来源（PDB 编号或预测工具）']]),
  pdf: W([['PDF 文件名', ''], ['标题', ''], ['说明', '一句话告诉读者这份 PDF 是什么']]),
  html: W([['HTML 文件 / 文件夹名', '多文件作品整理成文件夹'], ['是否需要脚本交互', '是 / 否'], ['标题', ''], ['说明', '']]),
  note: W([['提示标题', ''], ['提示正文', '1–3 句，可含列表']]),
  tip: W([['提示标题', ''], ['提示正文', '1–3 句，可含列表']]),
  warning: W([['提示标题', ''], ['提示正文', '说清风险或限制']]),
  cards: W([['每行几张', '2 / 3 / 4']], { name: '卡片', count: 4, fields: [['卡片标题', ''], ['摘要', '1–2 句'], ['链接到', '页面或锚点，可空'], ['图标', '可选，见图标表']] }),
  cols: W([['分几栏', '2 / 3 / 4']], { name: '栏', count: 3, fields: [['小标题', ''], ['正文', '']] }),
  timeline: W([], { name: '节点', count: 4, fields: [['阶段 / 时间', ''], ['标题', ''], ['说明', '']] }),
  features: W([], { name: '要点', count: 3, fields: [['编号', '可选，例如 01'], ['标题', ''], ['说明', ''], ['链接到', '可空']] }),
  stats: W([], { name: '指标', count: 4, fields: [['数字（含单位）', '必须有来源'], ['含义与来源', '']] }),
  refs: W([], { name: '文献', count: 5, fields: [['完整引用', '作者. 标题. 期刊/网站. 年份. 链接']] }),
  details: W([['折叠标题', ''], ['折叠内容', '可含表格、列表']]),
  people: W([], { name: '人物', count: 3, fields: [['姓名', ''], ['角色', ''], ['照片文件名', '可空'], ['一句话简介', '']] }),
  lead: W([['导语', '1–2 句，概括本页最重要的问题与结论']]),
  figure: W([['图片 / SVG 文件名', ''], ['图注', 'Fig. 编号 + 说明'], ['来源 / 版权', '']]),
};

/* -------------------------------------------------------------- samples */
const entry = (code, old, title, groups, tip, blocks, extra = {}) => ({ code, family: code[0], old, title, groups, tip, blocks, ...extra });

export const showcase = [
  /* ============================================ P · 项目叙事 */
  entry('P01', null, '工程循环 DBTL（多轮）', ['湿实验', '干实验'], '点圆环或按「下一步」走完 Design → Build → Test → Learn，再进入下一轮。Engineering 页的主角。',
    [b('cycle', { title: 'Engineering cycles', items: [
      { title: 'Cycle 1 · 方案筛选', design: '问题：哪一种设计更适合目标条件？\n- 列出 3 个候选方案\n- 确定比较指标和对照', build: '构建三种候选版本，记录版本号与关键改动。\n此处只演示页面组织。', test: '在统一条件下测量，保存原始数据。\n下方图表组件可以展示曲线与误差棒。', learn: '**结论 → 证据 → 局限 → 下一步**。\n示例：方案 B 响应更快，但背景偏高，进入第 2 轮优化。', href: '#sample-D01' },
      { title: 'Cycle 2 · 降低背景', design: '基于第 1 轮的问题提出改动：调整一个调控元件。', build: '构建改动后的版本。', test: '与第 1 轮最佳方案对照测试。', learn: '记录改动是否解决问题，以及仍存在的局限。' },
    ], caption: '两轮均为虚构示例，只演示页面结构。' })],
    { mark: 'P01 工程循环｜2 轮｜每轮 D/B/T/L 各一段', materials: '每一轮的四段文字；可链接到数据图或 Notebook。' }),
  
  entry('P03', null, '利益相关者矩阵', ['HP'], '按「影响力 × 关注程度」摆放对象，点圆点看诉求与回应；说明为什么选这些群体。',
    [b('stakeholders', { title: 'Stakeholder map', items: [
      { name: '学术专家（示例）', group: '学界', influence: 4, interest: 5, text: '关注技术可行性与验证方法。\n回应：邀请参与方案评审。' },
      { name: '一线使用者（示例）', group: '使用者', influence: 3, interest: 5, text: '关注操作是否简单、结果是否可靠。' },
      { name: '监管部门（示例）', group: '政府', influence: 5, interest: 3, text: '关注生物安全与合规要求。' },
      { name: '相关企业（示例）', group: '产业', influence: 4, interest: 2.5, text: '关注成本与规模化。' },
      { name: '公众（示例）', group: '公众', influence: 2, interest: 3.5, text: '关注安全性与伦理问题。' },
      { name: '中学生（示例）', group: '公众', influence: 1.5, interest: 2, text: '科普对象，关注是否有趣、易懂。' },
    ], caption: '对象与分值为虚构示例；实际填写时写明打分依据。' })],
    { mark: 'P03 利益相关者矩阵｜6 个对象｜附打分依据', materials: '对象名称、类别、影响力与关注程度（1–5）、诉求与我们的回应。' }),
  entry('P04', null, '访谈记录卡', ['HP'], '头像、代表性原话、要点、对项目的影响和可展开的问答全文，一次访谈一张卡。',
    [b('interview', { title: 'Interview · 示例访谈', person: '受访者 A（虚构）', role: '示例身份 · 某研究机构', date: '2026-07 · 线上访谈（示例）',
      quote: '这是一句示例原话。正式页面只放受访者同意公开的内容。',
      items: [{ title: '您如何看待这个方向？', text: '示例回答：可节选，保留原意。' }, { title: '您最担心的问题是什么？', text: '示例回答：……' }, { title: '对我们有什么建议？', text: '示例回答：……' }],
      takeaways: '关注真实使用场景\n需要补充安全评估\n建议简化结果读取方式',
      impact: '根据建议，我们在设计中加入了**额外的安全措施**，并重写了使用说明。', href: '', caption: '虚构访谈，没有真实受访者或个人资料。' })],
    { mark: 'P04 访谈卡｜受访者 A｜含 3 个问答', materials: '受访者姓名/身份（须同意公开）、日期形式、原话、问答节选、要点、对项目的影响。' }),
  entry('P05', '03', 'Notebook / HP 时间线', ['湿实验', '干实验', 'HP'], '按分类筛选；湿实验、干实验和 HP 的进展放在同一条时间线上。',
    [b('chronology', { title: 'Project notebook · 跨组记录', items: Array.from({ length: 9 }, (_, i) => ({ date: `2026 / ${String(i + 1).padStart(2, '0')}`, categories: ['Wet Lab', 'Dry Lab', 'HP'][i % 3], title: `${['需求与假设', '方案比较', '阶段复盘'][i % 3]} · ${i + 1}`, text: '演示记录：本阶段输入 → 形成的材料 → 反馈 → 下一步调整。', href: '#sample-P01' })), caption: demo })],
    { mark: 'P05 时间线｜按月｜分类=Wet Lab/Dry Lab/HP', materials: '日期或阶段、分类、标题、过程与反馈。' }),
  
  entry('P07', null, '元件集合（Part Collection）', ['湿实验'], '按类型筛选、搜索、卡片 / 表格切换；每个元件显示 SBOL 图形、作用和 Registry 链接。',
    [b('parts', { title: 'Part collection · 演示元件', items: [
      { code: 'DEMO-P001', name: 'Promoter A', type: 'promoter', status: 'New', role: '集合的输入：感应信号', text: '示例说明：元件的功能与适用条件。', length: '120 bp' },
      { code: 'DEMO-P002', name: 'RBS set', type: 'rbs', status: 'Existing', role: '调节表达强度', text: '示例说明。', length: '18 bp' },
      { code: 'DEMO-P003', name: 'Reporter X', type: 'cds', status: 'Improved', role: '输出：可检测信号', text: '示例说明：改进点与对比数据链接。', length: '720 bp' },
      { code: 'DEMO-P004', name: 'Terminator T', type: 'terminator', status: 'Existing', role: '终止转录', text: '示例说明。', length: '80 bp' },
      { code: 'DEMO-P005', name: 'Sensor device', type: 'composite', status: 'New', role: '完整检测单元', text: '由 P001–P004 组合而成。', length: '1 050 bp' },
      { code: 'DEMO-P006', name: 'Operator O', type: 'operator', status: 'New', role: '调控位点', text: '示例说明。', length: '24 bp' },
    ], caption: '编号均为演示，不是 Registry 注册信息。正式评审以 Registry 页面为准。' })],
    { mark: 'P07 元件集合｜6 个元件｜默认卡片视图', materials: '编号、名称、类型、状态（New/Improved）、在集合中的作用、功能说明、长度、Registry 链接。' }),
  entry('P08', null, '基因线路图（SBOL）', ['湿实验', '干实验', '设计'], '按顺序填元件类型即可自动画出标准 SBOL 线路图；点击元件看说明。',
    [b('construct', { title: 'Sensor device · 线路示意', items: [
      { type: 'promoter', label: 'Promoter A', text: '感应输入信号的启动子（示例）。' },
      { type: 'operator', label: 'Operator O', text: '调控位点（示例）。' },
      { type: 'rbs', label: 'RBS', text: '核糖体结合位点（示例）。' },
      { type: 'cds', label: 'Reporter X', text: '报告蛋白编码序列（示例）。' },
      { type: 'terminator', label: 'Term T', text: '终止子（示例）。' },
      { type: 'promoter', label: 'Promoter B', text: '组成型启动子（示例）。' },
      { type: 'rbs', label: 'RBS', text: '' },
      { type: 'cds', label: 'Regulator R', text: '调控蛋白（示例）。' },
      { type: 'terminator', label: 'Term T2', text: '' },
    ], caption: '线路为虚构示例，只演示绘图方式。' })],
    { mark: 'P08 线路图｜9 个元件｜顺序见下表', materials: '按顺序列出每个元件的类型、标签和一句说明。' }),
  
  entry('P10', null, '风险矩阵', ['HP', '湿实验'], '按可能性 × 严重程度定位风险，每条附应对措施；适合 Safety 和 Implementation。',
    [b('risk', { title: 'Risk assessment · 示例', items: [
      { title: '工程菌意外释放', likelihood: 2, severity: 4, text: '示例风险说明。', mitigation: '示例：物理隔离 + 使用后灭活。' },
      { title: '使用者操作失误', likelihood: 3, severity: 2, text: '示例风险说明。', mitigation: '示例：简化步骤并提供图示说明。' },
      { title: '数据隐私', likelihood: 2, severity: 3, text: '示例风险说明。', mitigation: '示例：不收集可识别个人信息。' },
      { title: '结果被误读', likelihood: 4, severity: 3, text: '示例风险说明。', mitigation: '示例：说明书中注明结果的适用范围。' },
    ], caption: '风险与评分为示例，实际评估请依据学校与 iGEM 安全规则。' })],
    { mark: 'P10 风险矩阵｜4 条｜附应对措施', materials: '风险名称、可能性与严重程度（1–5）、说明、应对措施。' }),
  
  
  
  entry('P14', '08', '附件下载 / 可复用资源', ['全组'], '自动识别文件类型；可写适用对象和许可。Contribution、Education 资源和 Model 复现都用它。',
    [b('downloads', { title: 'Supplementary materials', items: [
      { title: '演示数据 CSV', file: `${img}data.csv`, text: '用于了解表格文件格式。', audience: '所有读者', license: 'CC BY 4.0（示例）' },
      { title: '公开示例结构 1CRN', file: `${img}1crn.pdb`, text: '来源 RCSB PDB；不是本项目结构。' },
      { title: '公开 PDF 示例', file: `${img}reference.pdf`, text: 'Mozilla PDF.js 官方展示文档。' },
      { title: '交互 HTML 演示', file: `${img}interactive.html`, text: '自包含的图形演示页面。', audience: '未来 iGEM 队伍' },
    ], caption: demo })],
    { mark: 'P14 附件区｜4 个文件', materials: '文件本身、显示名称、说明/版本/大小、适用对象、许可。' }),
  

  /* ============================================ D · 数据与模型 */
  entry('D01', '10', '折线图 + 误差棒', ['干实验', '湿实验'], '误差列命名为「列名 ±」即可显示误差棒；点图例隐藏系列、悬停看数值、下载 PNG、展开原始数据。',
    [b('chart', { title: 'Response curves', chartType: 'line', csv: seriesErr, xLabel: 'Time (h)', yLabel: 'Signal (a.u.)', caption: '程序生成的演示数字；误差棒仅演示显示方式，无统计推断。' })],
    { mark: 'D01 折线图｜误差棒=SD｜数据=fig3.csv', materials: 'CSV：首列横轴，其余列为各组数值；误差列放在对应列右侧。写清单位与重复数。' }),
  entry('D02', '11', '分组柱状图 + 误差棒', ['干实验', '湿实验'], '条件对比、诱导梯度等离散比较。误差列命名为「列名_sd」同样有效。',
    [b('chart', { title: 'Design comparison', chartType: 'bar', csv: barsErr, xLabel: 'Inducer level', yLabel: 'Signal (a.u.)', caption: '程序生成的演示数字。' })],
    { mark: 'D02 柱状图｜2 组｜误差棒', materials: '同 D01。' }),
  entry('D03', '12', '散点图', ['干实验'], '模型预测 vs 实验测量、两个变量的关系。第一列需为数字。',
    [b('chart', { title: 'Data distribution', chartType: 'scatter', csv: series, xLabel: 'Time (arbitrary units)', yLabel: 'Response (arbitrary units)', caption: '程序生成的演示数字；无拟合、误差棒或统计推断。' })],
    { mark: 'D03 散点图｜x=预测 y=测量', materials: 'CSV：首列 X（数字），其余列 Y。' }),
  entry('D04', null, '横向条形图', ['HP', '干实验'], '类别名较长时用横向；适合问卷多选统计、排名或敏感性（可含负值）。',
    [b('chart', { title: '受访者最关心的问题（多选）', chartType: 'hbar', csv: 'Concern,Responses\n安全性,41\n价格,33\n是否容易使用,29\n结果是否可靠,26\n对环境的影响,18\n其他,6', xLabel: '人数', caption: '虚构问卷数据，仅演示图形。' })],
    { mark: 'D04 横向条形｜问卷 Q3｜n=?', materials: 'CSV：首列类别，第二列起为数值；写明样本量与题目原文。' }),
  entry('D05', null, '百分比堆叠（问卷 Likert）', ['HP'], '五级量表、前测 / 后测对比、构成比例。颜色从「不同意」到「同意」渐变。',
    [b('chart', { title: '活动前后：我能解释什么是合成生物学', chartType: 'stacked', csv: 'Group,非常不同意,不同意,一般,同意,非常同意\n活动前,12,18,14,5,1\n活动后,1,4,10,22,13', caption: '虚构问卷数据；各行按总数换算为百分比。' })],
    { mark: 'D05 Likert 堆叠｜前测/后测', materials: 'CSV：首列为组别或题目，其余列为各等级人数（按从负到正排列）。' }),
  entry('D06', '09', '数据表 / Parts 表', ['湿实验', '干实验'], '搜索、数字排序、翻页、下载 CSV；单元格中的 https 地址自动变成链接。',
    [b('datatable', { title: 'Parts catalogue · 虚构条目', csv: 'ID,Type,Length,Version,Status,Note\n' + Array.from({ length: 60 }, (_, i) => `DEMO-${String(i + 1).padStart(3, '0')},${['Promoter', 'CDS', 'Terminator'][i % 3]},${120 + i * 37},v${i % 4 + 1},${['Draft', 'Review', 'Ready'][i % 3]},Synthetic display row`).join('\n'), caption: '全部 ID 和数字均为演示，不是 Registry 注册信息。' })],
    { mark: 'D06 数据表｜数据=table.csv', materials: 'CSV：第一行为列名。' }),
  entry('D07', null, '热图 / 96 孔板', ['湿实验', '干实验'], 'A–H × 1–12 自动画成孔板；其他矩阵画成热图，支持双向色阶（敏感性分析）。',
    [b('heatmap', { title: 'Plate reader · 示例孔板', csv: plate, palette: 'iris', unit: 'RFU', caption: '程序生成的演示数值；第 12 列留空演示缺失孔。' }),
      b('heatmap', { title: '局部敏感性 · 示例', csv: sensitivity, palette: 'diverging', showValues: true, caption: '虚构的敏感性系数，仅演示双向色阶。' })],
    { mark: 'D07 热图｜孔板 / 敏感性｜色阶=紫/双向', materials: 'CSV：首行列名、首列行名；写明单位与色阶选择。' }),
  entry('D08', null, '方案比较矩阵', ['干实验', '湿实验', 'HP'], '✓ ✗ ~ 与 1–5 分自动变成符号；标出最终方案。适合设计选择和 Implementation 论证。',
    [b('matrix', { title: '为什么选方案 B', csv: '方案,成本,安全性,构建难度,可检测性,备注\n方案 A,2,✓,4,~,示例备注\n方案 B,4,✓,3,✓,示例备注\n方案 C,5,✗,2,✓,示例备注', highlight: '方案 B', caption: '虚构评分，仅演示比较方式；分数越高越好。' })],
    { mark: 'D08 比较矩阵｜3 方案｜选中=方案 B', materials: '表格：首列方案，首行评价标准；写明评分方向与依据。' }),
  entry('D09', '14', '数学公式（LaTeX）', ['干实验'], '多行方程、矩阵、求和与下标；可加编号，读者可复制 LaTeX。',
    [b('equation', { title: 'Model notation', label: '(1)', latex: String.raw`\begin{aligned}\frac{dS}{dt}&=u(t)-kS-\frac{V_{\max}S}{K_m+S}\\\mathbf y&=\begin{bmatrix}1&0\\0&\alpha\end{bmatrix}\mathbf x+\boldsymbol\epsilon\\\mathcal L(\theta)&=\sum_{i=1}^{n}\left(y_i-\hat y_i(\theta)\right)^2+\lambda\lVert\theta\rVert_2^2\end{aligned}`, caption: '通用数学排版示例，不是本项目模型或拟合结果。' })],
    { mark: 'D09 公式 (1)｜LaTeX 见附件', materials: 'LaTeX 源码（不要截图）；需要编号就写编号。' }),
  entry('D10', null, '模型参数表', ['干实验'], '符号自动用 LaTeX 排版；来源分「文献 / 实验测定 / 拟合 / 估计 / 假设」，可筛选。',
    [b('params', { title: 'Parameters · 示例', items: [
      { symbol: 'k_{deg}', text: '降解速率', value: '0.12', unit: 'h⁻¹', source: '文献' },
      { symbol: 'V_{\\max}', text: '最大反应速率', value: '3.4', unit: 'μM·h⁻¹', source: '拟合' },
      { symbol: 'K_m', text: '米氏常数', value: '15', unit: 'μM', source: '文献' },
      { symbol: 'n', text: 'Hill 系数', value: '2', unit: '—', source: '假设' },
      { symbol: '\\alpha', text: '背景表达比例', value: '0.03', unit: '—', source: '实验测定' },
    ], caption: '参数值为示例，不对应任何真实系统。' })],
    { mark: 'D10 参数表｜5 个参数｜含来源', materials: '每个参数：符号（LaTeX）、含义、数值、单位、来源类型、来源链接。' }),
  entry('D11', null, '代码与复现', ['干实验'], '带行号和复制按钮的代码块，附运行命令与仓库链接；Model 的 Reproducibility 必备。',
    [b('code', { title: 'Reproduce the model', filename: 'simulate.py', language: 'Python', code: '# Minimal Euler integration (demonstration only)\nimport numpy as np\n\ndef simulate(k=0.12, vmax=3.4, km=15.0, t_end=24, dt=0.1):\n    """Return time points and S(t) for a toy model."""\n    steps = int(t_end / dt)\n    t = np.linspace(0, t_end, steps)\n    s = np.zeros(steps)\n    for i in range(1, steps):\n        ds = 1.0 - k * s[i-1] - vmax * s[i-1] / (km + s[i-1])\n        s[i] = s[i-1] + ds * dt\n    return t, s\n\nif __name__ == "__main__":\n    t, s = simulate()\n    print(f"final value: {s[-1]:.3f}")', command: 'python simulate.py', caption: '玩具模型代码，仅演示排版；不是本项目模型。' })],
    { mark: 'D11 代码｜simulate.py｜附运行命令', materials: '代码文件、语言、运行命令、仓库链接（GitLab / GitHub）。' }),
  entry('D12', '13', 'DNA / 蛋白序列', ['干实验', '湿实验'], '按区域命名高亮（例如「12-48 启动子」），查找所有匹配并逐个跳转，复制序列或反向互补。',
    [b('sequence', { title: 'DNA sequence · 多区域高亮', sequenceType: 'dna', sequence: '>SYNTHETIC_DEMO\n' + 'ACGTGCAATCGATGCTAGCT'.repeat(24), highlight: '12-48 区域 A, 100-160 区域 B, 250-290 区域 C', caption: demo }),
      b('sequence', { title: 'Protein sequence · 字母与位置', sequenceType: 'protein', sequence: '>SYNTHETIC_DEMO\n' + 'ACDEFGHIKLMNPQRSTVWY'.repeat(8), highlight: '20-40, 90-110', caption: '人工重复氨基酸序列，不对应真实蛋白。' })],
    { mark: 'D12 序列｜FASTA=xxx.fasta｜高亮 3 段', materials: '单条 FASTA 或序列文本；高亮区间与名称。' }),
  entry('D13', '15', '可旋转蛋白结构', ['干实验', '湿实验'], '拖动旋转、缩放；切换丝带 / 球棍 / 原子球 / 表面，自动旋转和复位。',
    [b('protein', { title: 'Crambin · 1CRN', file: `${img}1crn.pdb`, format: 'pdb', representation: 'cartoon', color: '#8cae73', chain: 'A', residues: '7-12,30-35', height: 560, caption: 'RCSB PDB 1CRN 公开结构；紫色区域仅演示选区，不代表功能位点。来源 https://www.rcsb.org/structure/1CRN' })],
    { mark: 'D13 蛋白结构｜xxx.pdb｜突出残基 42,57', materials: 'PDB / CIF 文件；可选链与残基编号；写明结构来源。' }),

  /* ============================================ M · 图像与媒体 */
  entry('M01', '19', '单图与图注', ['全组'], '图片、图注和来源。最常用的组件。',
    [b('image', { src: `${img}before.svg`, alt: '人工绘制的几何示意图', body: '**Fig. 1** 图形示例。图注解释读图方式、来源及限制。' })],
    { mark: 'M01 单图｜fig1.png｜图注见正文', materials: '原图、图片说明、图注和来源。' }),
  entry('M02', '20', '双图并排', ['湿实验', 'HP', '设计'], '两张图各自说明，底部统一图注。',
    [b('gallery', { left: `${img}before.svg`, leftAlt: 'A · 初始设计', right: `${img}after.svg`, rightAlt: 'B · 修订设计', body: '**Fig. 2** 两种图形方案，仅作排版演示。' })],
    { mark: 'M02 双图｜左 fig2a 右 fig2b', materials: '两张原图、各自说明和统一图注。' }),
  entry('M03', '32', '图形容器（SVG / 大图）', ['全组', '设计'], '独立图注与来源行；适合设计组绘制的示意图和信息图。',
    [layout('figure', '**Fig. 3** 人工绘制的视觉示例。', { attributes: `src="${img}after.svg" alt="几何示意图" credit="来源：本地演示素材"` })],
    { mark: 'M03 图形容器｜infographic.svg', materials: '图片或 SVG、图注、来源。' }),
  entry('M04', '05', '多图相册 / 放大阅读', ['HP', '湿实验', '设计'], '点缩略图放大，方向键翻页；5 张以上自动把第一张放大为封面。',
    [b('lightbox', { title: 'Visual archive · 图像档案', items: Array.from({ length: 6 }, (_, i) => ({ image: img + ['scene-1.svg', 'before.svg', 'scene-2.svg', 'after.svg', 'scene-3.svg', 'before.svg'][i], title: `Figure ${i + 1} · 设计示意`, text: `图 ${i + 1}：独立图注与来源说明。人工绘制的图形，用于展示相册交互。` })), caption: demo })],
    { mark: 'M04 相册｜6 张｜每张附图注', materials: '多张原图，每张附标题与图注。' }),
  entry('M05', '06', '前后图片对比', ['湿实验', '干实验', '设计'], '拖动分界线比较；适合改版、处理前后或两个方案。IHP「修改前后证据」很好用。',
    [b('comparison', { title: 'Design A / Design B', before: `${img}before.svg`, after: `${img}after.svg`, beforeLabel: '方案 A', afterLabel: '方案 B', caption: demo })],
    { mark: 'M05 前后对比｜左=修改前 右=修改后', materials: '两张尺寸一致的对照图片与各自说明。' }),
  entry('M06', null, '图片标注（凝胶 / 装置 / 海报）', ['湿实验', '设计'], '在图片上放编号点，右侧列出说明；点编号互相定位。适合凝胶泳道、硬件结构、海报细节。',
    [b('hotspots', { title: 'Gel · 泳道说明（示意图）', image: `${img}gel-sketch.svg`, items: [
      { x: 13, y: 12, title: 'Marker', text: '分子量标准（示意）。' },
      { x: 30, y: 12, title: '样品 1', text: '示例说明。' },
      { x: 47, y: 12, title: '样品 2', text: '示例说明。' },
      { x: 64, y: 12, title: '阴性对照', text: '示例说明。' },
      { x: 36.5, y: 47, title: '目标条带位置', text: '示例：说明期望大小与判断依据。' },
    ], caption: '人工绘制的凝胶示意图，不是实验图像。' })],
    { mark: 'M06 图片标注｜gel.png｜5 个点', materials: '原图；每个标注点的位置（约几成宽、几成高）、名称与说明。' }),
  entry('M07', '07', '视频 / 字幕', ['HP', '湿实验', '设计'], '原生播放器；可配封面和 VTT 字幕，右上角提供下载。',
    [b('video', { title: 'Video · 演示片段', file: `${img}demo.mp4`, poster: `${img}before.svg`, subtitles: `${img}demo.vtt`, language: 'zh', caption: '3 秒纯色示例，用于演示播放控件，不是项目视频。' })],
    { mark: 'M07 视频｜promo.mp4｜中文字幕', materials: 'MP4 / WebM，可选封面与 VTT 字幕。' }),
  entry('M08', '16', '浏览器原生 PDF', ['全组'], '多页文档直接嵌入；顶部提供新窗口打开和下载。具体工具栏随浏览器而异。',
    [b('pdf', { title: 'PDF · 公开示例文档', file: `${img}reference.pdf`, height: 680, caption: '来自 Mozilla PDF.js 官方示例的计算机论文，仅作阅读器展示，与本项目研究无关。' })],
    { mark: 'M08 PDF｜handbook.pdf｜高 700', materials: 'PDF 文件、标题和说明。' }),
  entry('M09', '17', 'HTML 交互演示', ['干实验', 'HP', '设计'], '嵌入自制的小网页（参数滑块、交互模型、小游戏），在隔离环境运行。',
    [b('html', { title: 'Interactive explainer · 图形演示', file: `${img}interactive.html`, scripts: true, height: 560, caption: '自制参数交互示例，隔离运行，不是科学模拟器。' })],
    { mark: 'M09 HTML 交互｜model-demo/index.html', materials: '单文件 HTML，或整理好依赖文件的作品文件夹。' }),

  /* ============================================ L · 版式与导航 */
  
  
  
  
  entry('L05', '01', '分栏切换', ['湿实验', '干实验'], '同一位置切换多段内容，底部可一键进入下一栏；适合多个模型、多种受众或中英对照。',
    [b('tabs', { title: 'Cycle 02 · Design → Build → Test → Learn', items: [
      { title: 'Design 设计', text: '问题：如何比较多个候选方案？\n假设：统一输入条件后，不同方案将表现出不同响应曲线。\n交付：比较矩阵、评价指标、下一步计划。' },
      { title: 'Build 构建', text: '展示构建设计、版本记录和关键选择。\n可在后续模块插入结构模型、序列和设计文件。\n此处仅为页面组织示例。' },
      { title: 'Test 评价', text: '整理对照条件、原始数据与重复记录。\n下方图表组件可以展示多组曲线。\n示例不构成实验方法或真实结果。' },
      { title: 'Learn 迭代', text: '结论 → 证据 → 局限 → 下一轮改动。\n将反馈与设计决策对应，形成可追溯的迭代记录。' },
    ], caption: demo })],
    { mark: 'L05 分栏｜4 栏', materials: '每栏标题与内容。' }),
  entry('L06', '02', '折叠问答', ['HP', '全组'], '逐条展开；访谈全文、FAQ、Reflection 中「采纳 / 未采纳的建议」都适合。',
    [b('accordion', { title: 'Stakeholder interview · 访谈记录', items: [
      { title: '01 背景与需求', text: '角色：虚构的使用者 A。\n场景：希望快速找到页面中的核心结论。\n需求：先看到摘要，再按需展开证据。' },
      { title: '02 反馈如何影响设计？', text: '反馈：长篇内容不易浏览。\n改动：使用折叠问答、图片说明和下载附件。\n后续：记录是否满足使用者需要。' },
      { title: '03 如何展示引用与授权？', text: '填写实际访谈日期、公开范围、引用方式。\n示例中没有真实受访者或个人资料。' },
    ], caption: demo })],
    { mark: 'L06 折叠问答｜3 条', materials: '每条问题与回答。' }),
  entry('L07', null, '流程图（使用场景 / 技术路线）', ['HP', '干实验', '设计'], '宽屏横排、窄屏竖排；每步可标角色。适合 Implementation 使用流程和项目技术路线。',
    [b('flow', { title: '示例使用流程', items: [
      { title: '采集样本', text: '示例：说明谁在什么场景下采集。', tag: '使用者' },
      { title: '加入检测装置', text: '示例：一步操作。', tag: '使用者' },
      { title: '读取结果', text: '示例：颜色分级，对照说明书判断。', tag: '使用者' },
      { title: '安全处理', text: '示例：使用后灭活并按规定丢弃。', tag: '使用者' },
      { title: '反馈改进', text: '示例：收集使用反馈，进入下一轮设计。', tag: '团队' },
    ], caption: '流程为示意，不代表已实现的产品。' })],
    { mark: 'L07 流程图｜5 步｜标注角色', materials: '每步名称、说明、角色 / 场景标签。' }),
  entry('L08', '26', '经典时间线', ['HP', '湿实验'], '静态纵向时间线，支持富文本和链接。',
    [layout('timeline', '### 探索 {when="阶段 01"}\n\n提出问题并整理资料。\n\n### 设计 {when="阶段 02"}\n\n比较方案，记录选择依据。\n\n### 复盘 {when="阶段 03"}\n\n汇总反馈，规划下一轮。')],
    { mark: 'L08 时间线｜3 节点', materials: '每个节点：阶段/时间、标题、说明。' }),

  /* ============================================ W · 文字与结构 */
  
  
  entry('W03', '21', '说明提示框', ['全组'], '补充说明、适用范围、官方要求链接。',
    [layout('note', '这是一段 **可强调的提示内容**。\n\n- 说明结论适用范围\n- 补充文件来源\n- 指出仍需补充的材料', { label: '说明' })],
    { mark: 'W03 说明框', materials: '标题与 1–3 句正文。' }),
  entry('W04', '22', '建议提示框', ['全组'], '给读者或未来队伍的建议、复用提示。',
    [layout('tip', '这是一段 **可强调的提示内容**。\n\n- 说明结论适用范围\n- 补充文件来源\n- 指出仍需补充的材料', { label: '阅读建议' })],
    { mark: 'W04 建议框', materials: '标题与 1–3 句正文。' }),
  entry('W05', '23', '注意提示框', ['全组'], '安全警示、限制与局限、「以 Registry 为准」之类的声明。',
    [layout('warning', '这是一段 **可强调的提示内容**。\n\n- 说明结论适用范围\n- 补充文件来源\n- 指出仍需补充的材料', { label: '演示内容提示' })],
    { mark: 'W05 注意框', materials: '标题与 1–3 句正文。' }),
  
  entry('W07', '30', '折叠详情', ['全组'], '附录、长表格和补充说明；默认收起。',
    [layout('details', '### 补充材料\n\n**可在这里放入方法补充和来源。**\n\n| 文件 | 状态 |\n| --- | --- |\n| 图像 | 示例 |\n| 记录 | 示例 |\n\n- 第一项\n- 第二项', { label: '展开阅读完整附录' })],
    { mark: 'W07 折叠详情｜标题=…', materials: '折叠标题与内容。' }),
  
  
];

/* --------------------------------------------------------- page recipes */
export const tiers = [
  { key: 'medal', name: '铜牌 / 银牌必需', due: '10.5 22:00', note: '最高优先级：4 个基础页面，缺一页都会影响奖牌。' },
  { key: 'special', name: '专项奖', due: '10.5 22:00', note: 'Best Integrated HP 已确定；Model、Part Collection、Education 中再选两项。内容少的支撑页可以合并。' },
  { key: 'general', name: '通用 / 技术页面', due: '10.7 22:00', note: '建议都写，已有的内容整理进来即可。' },
  { key: 'optional', name: '可选页面', due: '10.7 22:00', note: '有内容就写，没有可以不写。' },
];
export const pages = [
  { id: 'attributions', tier: 'medal', name: 'Attributions', zh: '项目分工与外部贡献', path: '/attributions', groups: ['全组'], need: '铜牌基础：使用官方 Attributions Form，并说明队员与外部人员分别做了什么。', use: [  'W03', 'W07'] },
  { id: 'contribution', tier: 'medal', name: 'Contribution', zh: '项目贡献', path: '/contribution', groups: ['全组'], need: '铜牌基础：给未来 iGEM 队伍留下可以直接复用的东西，并说明怎么用。', use: [ 'P14',  'D11', 'D06', 'W04'] },
  { id: 'engineering', tier: 'medal', name: 'Engineering', zh: '工程成功', path: '/engineering', groups: ['湿实验', '干实验'], need: '银牌基础：至少一次完整的 Design–Build–Test–Learn；每一步都有证据，Learn 要引出下一步。', use: ['P01', 'M05', 'D01', 'D08', 'P08', 'L05'] },
  { id: 'hp', tier: 'medal', name: 'Human Practices', zh: '人类实践', path: '/human-practices', groups: ['HP'], need: '银牌基础：说明项目为何负责任、对世界有益；和谁交流、为什么是他们。', use: ['P03', 'P04',  'P05',  'M04'] },
  { id: 'ihp', tier: 'special', name: 'Best Integrated HP', zh: '人类实践主评审页', path: '/human-practices', groups: ['HP'], need: '串联调研 → 反馈 → 项目修改 → 后续验证；外部反馈如何变成技术调整，附修改前后证据。Implementation 与 Reflection 可作为章节。', use: [ 'P03', 'P04', 'M05', 'L07', 'P10', 'L06'] },
  { id: 'model', tier: 'special', name: 'Best Model', zh: '建模', path: '/model', groups: ['干实验'], need: '建模目标、各模型关系、核心结果；与实验或数据对比的验证、敏感性分析；模型如何指导设计；代码与参数可复现。', use: [ 'D09', 'D10', 'D03', 'D07', 'M09', 'D11', 'P14'] },
  { id: 'parts', tier: 'special', name: 'Best Part Collection', zh: '元件集合', path: '/parts', groups: ['湿实验'], need: '集合的共同目标与整体设计、各元件如何配合、表征数据、使用指南。Registry 集合文档与元件页必须完成，不能由 Wiki 代替。', use: ['P07', 'P08', 'D01', 'D07', 'D12', 'D13',  'W05'] },
  { id: 'education', tier: 'special', name: 'Best Education', zh: '教育与科普', path: '/education', groups: ['HP'], need: '受众与学习需求、活动设计、双向交流、评估证据与反思、可复用的教育资源、可及性。', use: [  'D05', 'M04', 'M07', 'P14',  ] },
  { id: 'description', tier: 'general', name: 'Description', zh: '项目描述', path: '/description', groups: ['全组', '设计'], need: '背景问题、我们的方案、整体思路，一页讲清项目是什么。', use: [  'M03', 'L07',  ] },
  { id: 'design', tier: 'general', name: 'Design', zh: '设计', path: '/design', groups: ['湿实验', '设计'], need: '设计思路、线路与元件选择依据。', use: ['P08', 'M06',  'M05', 'D08'] },
  { id: 'results', tier: 'general', name: 'Results', zh: '实验结果 / 表征', path: '/results', groups: ['湿实验'], need: '实验结果与表征数据，附对照、重复与局限。', use: ['D01', 'D02', 'D07', 'M06', 'M04', 'D06', 'W05'] },
  { id: 'notebook', tier: 'general', name: 'Notebook & Protocols', zh: '实验记录与方法', path: '/notebook', groups: ['湿实验', '干实验'], need: '按时间记录进展；方法可复现。', use: ['P05',  'P14', 'L06'] },
  { id: 'safety', tier: 'general', name: 'Safety', zh: '安全', path: '/safety', groups: ['湿实验', 'HP'], need: '风险识别与应对，实验与使用中的安全措施。', use: ['P10', 'W05',  'W07'] },
  { id: 'implementation', tier: 'general', name: 'Implementation', zh: '实际应用（可并入 HP）', path: '/implementation', groups: ['HP', '干实验'], need: '目标用户、使用场景与流程、部署条件、风险与障碍。', use: ['L07', 'D08', 'P10', 'P03', 'W03'] },
  { id: 'hardware', tier: 'general', name: 'Hardware / Software', zh: '硬件 / 软件', path: '/hardware', groups: ['干实验', '设计'], need: '装置结构、使用演示、代码与下载。', use: ['M06', 'M07', 'D11', 'M09', 'P14'] },
  { id: 'members', tier: 'general', name: 'Members', zh: '团队成员', path: '/members', groups: ['全组', '设计'], need: '按人物身份的展示顺序排列，职责标签可多选。', use: [  'M04'] },
  { id: 'judging', tier: 'general', name: 'Judging Guide', zh: '评审导航（首页或独立页）', path: '/judging', groups: ['全组'], need: '把每条奖牌与专项奖标准链接到证据页面。', use: [ ] },
  { id: 'others', tier: 'optional', name: '其他可选页面', zh: '合作、可持续、包容性等', path: '—', groups: ['全组'], need: '已有内容就写；没有可以不写。', use: [   'M04', 'P05'] },
];
