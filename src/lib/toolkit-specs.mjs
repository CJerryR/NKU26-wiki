/**
 * One description of every interactive content block.
 *
 * Used by three places, so they can never disagree:
 *  - tina/toolkit.ts          → the editor form (field names are the saved JSON keys)
 *  - src/lib/toolkit-blocks.mjs → which blocks are toolkit blocks + the no-JS fallback
 *  - src/editor/*             → the component catalogue and its Word fill-in templates
 *
 * Field kinds: str · long · num · bool · file · select · tags · list
 * The 12 original templates keep their names and field keys unchanged; new optional
 * fields were only appended, so content saved before this version still loads.
 */

const RICH = '支持 **加粗**、[链接文字](地址)、`代码`；以「- 」开头的行显示为列表；空行分段。';

const f = {
  title: { name: 'title', kind: 'str', label: '模块标题' },
  caption: { name: 'caption', kind: 'long', label: '说明 / 数据来源', hint: '显示在模块下方，写清来源、样本量或限制。' },
  href: { name: 'href', kind: 'str', label: '相关页面链接', hint: '站内写 /engineering#cycle-2，站外写完整 https 地址。' },
  csvFile: { name: 'file', kind: 'file', label: 'CSV 文件', accept: ['.csv'] },
};
const str = (name, label, hint) => ({ name, kind: 'str', label, ...(hint ? { hint } : {}) });
const long = (name, label, hint) => ({ name, kind: 'long', label, ...(hint ? { hint } : {}) });
const num = (name, label, hint) => ({ name, kind: 'num', label, ...(hint ? { hint } : {}) });
const file = (name, label, accept, hint) => ({ name, kind: 'file', label, ...(accept ? { accept } : {}), ...(hint ? { hint } : {}) });
const select = (name, label, options, hint) => ({ name, kind: 'select', label, options, ...(hint ? { hint } : {}) });
const tags = (name, label, hint) => ({ name, kind: 'tags', label, ...(hint ? { hint } : {}) });
const list = (name, label, item, fields) => ({ name, kind: 'list', label, item, fields });
const panels = list('items', '内容条目', '条目', [str('title', '条目标题'), long('text', '内容（保留换行）', RICH)]);

export const PART_TYPES = [
  { value: 'promoter', label: '启动子 Promoter' },
  { value: 'rbs', label: 'RBS' },
  { value: 'cds', label: '编码序列 CDS' },
  { value: 'terminator', label: '终止子 Terminator' },
  { value: 'operator', label: '操纵子 / 调控位点' },
  { value: 'origin', label: '复制起点 Ori' },
  { value: 'insulator', label: '绝缘子 Insulator' },
  { value: 'composite', label: '复合元件 Composite' },
  { value: 'plasmid', label: '质粒 / 骨架' },
  { value: 'other', label: '其他' },
];

export const toolkitSpecs = [
  /* ------------------------------------------------ original 12 (keys frozen) */
  { name: 'tabs', label: '分栏切换 / 工程循环', fields: [f.title, panels, f.caption] },
  { name: 'accordion', label: '折叠问答 / 访谈记录', fields: [f.title, panels, f.caption] },
  { name: 'chronology', label: 'Notebook / HP 时间线', fields: [f.title,
    list('items', '事件', '事件', [str('date', '日期 / 阶段'), str('title', '事件标题'), str('category', '组别 / 分类', '同一分类写法保持一致，读者可按分类筛选。'), long('text', '过程与反馈', RICH), str('href', '相关页面链接')]),
    f.caption] },
  
  { name: 'lightbox', label: '多图相册 / 放大阅读', fields: [f.title,
    list('items', '图片', '图片', [file('image', '图片'), str('title', '图片说明'), long('text', '图注')]),
    f.caption] },
  { name: 'comparison', label: '前后图片对比', fields: [f.title, file('before', '左侧 / 修改前图片'), file('after', '右侧 / 修改后图片'), str('beforeLabel', '左图说明'), str('afterLabel', '右图说明'), f.caption] },
  { name: 'video', label: '视频 / 字幕', fields: [f.title, file('file', 'MP4 / WebM 文件', ['.mp4', '.webm']), file('poster', '封面'), file('subtitles', 'WebVTT 字幕', ['.vtt']), str('language', '字幕语言代码（如 zh 或 en）'), f.caption] },
  { name: 'downloads', label: '附件下载 / 可复用资源', fields: [f.title,
    list('items', '附件', '附件', [str('title', '附件名称'), file('file', '附件文件'), long('text', '说明 / 版本 / 文件大小'), str('audience', '适用对象 / 用途', '可选，例如「未来 iGEM 队伍」「中学教师」。'), str('license', '许可 / 版本', '可选，例如 CC BY 4.0 · v2。')]),
    f.caption] },
  { name: 'datatable', label: '数据表 / Parts 表（搜索排序）', fields: [f.title, f.csvFile, long('csv', '或粘贴 CSV（首行为列名，文件优先）', '单元格中的 https 地址会显示为链接。'), f.caption] },
  { name: 'chart', label: '实验数据图表', fields: [f.title, f.csvFile, long('csv', '或粘贴 CSV（首列 X，其余列 Y，文件优先）', '误差列命名为「列名 ±」或「列名_sd」，放在对应数据列右侧，即可显示误差棒。'),
    select('chartType', '图表类型', [
      { label: '折线图', value: 'line' }, { label: '柱状图', value: 'bar' }, { label: '散点图', value: 'scatter' },
      { label: '横向条形图', value: 'hbar' }, { label: '百分比堆叠（问卷 / 构成）', value: 'stacked' },
    ]),
    str('xLabel', '横轴名称 / 单位'), str('yLabel', '纵轴名称 / 单位'), f.caption] },
  { name: 'sequence', label: 'DNA / 蛋白序列阅读器', fields: [f.title, select('sequenceType', '序列类型', ['dna', 'rna', 'protein']), file('file', 'FASTA / 文本文件', ['.fasta', '.fa', '.faa', '.fna', '.txt']), long('sequence', '或粘贴单条序列 / FASTA（文件优先）'),
    str('highlight', '高亮区域', '例如「12-48 启动子, 100-160 RBS」；名称可省略。'), f.caption] },
  { name: 'equation', label: '数学公式（LaTeX）', fields: [f.title, long('latex', 'LaTeX 公式（不需要 $$）'), str('label', '公式编号', '可选，例如 (1) 或 Eq. 2。'), f.caption] },

  /* ---------------------------------------------------------- iGEM narrative */
  { name: 'cycle', label: '工程循环 DBTL（多轮）', fields: [f.title,
    list('items', '轮次', '轮次', [str('title', '轮次名称', '例如 Cycle 1 · 启动子筛选'), long('design', 'Design 设计', RICH), long('build', 'Build 构建', RICH), long('test', 'Test 测试', RICH), long('learn', 'Learn 学习 / 下一步', RICH), str('href', '详细数据链接')]),
    f.caption] },
  
  { name: 'stakeholders', label: '利益相关者矩阵', fields: [f.title,
    list('items', '利益相关者', '对象', [str('name', '名称 / 身份'), str('group', '类别', '例如 学界 / 产业 / 政府 / 公众 / 使用者。'), num('influence', '影响力（1–5）'), num('interest', '关注程度（1–5）'), long('text', '诉求 / 担忧 / 我们的回应', RICH), f.href]),
    str('xLabel', '横轴名称', '默认「关注程度」'), str('yLabel', '纵轴名称', '默认「影响力」'), f.caption] },
  { name: 'interview', label: '访谈记录卡', fields: [f.title, str('person', '受访者'), str('role', '身份 / 单位'), str('date', '日期 / 形式'), file('image', '照片（可选）'),
    long('quote', '一句代表性原话', '须经受访者同意公开。'),
    list('items', '问答', '问答', [str('title', '问题'), long('text', '回答（可节选）', RICH)]),
    long('takeaways', '要点（每行一条）'), long('impact', '对项目的影响', RICH), f.href, f.caption] },
  
  { name: 'flow', label: '流程图（使用场景 / 技术路线）', fields: [f.title,
    list('items', '步骤', '步骤', [str('title', '步骤名称'), long('text', '说明', RICH), str('tag', '角色 / 场景标签', '可选，例如 用户、医院、我们。')]),
    f.caption] },
  
  { name: 'risk', label: '风险矩阵（安全 / 实施）', fields: [f.title,
    list('items', '风险', '风险', [str('title', '风险名称'), num('likelihood', '可能性（1–5）'), num('severity', '严重程度（1–5）'), long('text', '风险说明', RICH), long('mitigation', '应对措施', RICH)]),
    f.caption] },
  

  /* ---------------------------------------------------------- wet lab / parts */
  { name: 'parts', label: '元件集合（Part Collection）', fields: [f.title,
    list('items', '元件', '元件', [str('code', '编号', '例如 BBa_K0000000；Registry 页面为正式评审材料。'), str('name', '名称'),
      select('type', '类型', PART_TYPES), str('status', '状态', '例如 New / Improved / Existing。'), str('role', '在集合中的作用'), long('text', '功能说明', RICH), str('length', '长度', '例如 1 020 bp'), str('href', 'Registry 链接')]),
    f.caption] },
  { name: 'construct', label: '基因线路图（SBOL）', fields: [f.title,
    list('items', '元件', '元件', [select('type', '类型', PART_TYPES.filter((t) => !['composite', 'plasmid'].includes(t.value))), str('label', '标签'), long('text', '说明（点击元件时显示）')]),
    f.caption] },

  /* ------------------------------------------------------------- data / model */
  { name: 'heatmap', label: '热图 / 96 孔板', fields: [f.title, f.csvFile, long('csv', '或粘贴 CSV', '首行列名，首列行名；A–H × 1–12 自动显示为孔板。'),
    select('palette', '色阶', [{ label: '紫色（单向）', value: 'iris' }, { label: '琥珀（单向）', value: 'amber' }, { label: '双向（负—正）', value: 'diverging' }]),
    str('unit', '数值单位'), { name: 'showValues', kind: 'bool', label: '在格子中显示数值' }, f.caption] },
  { name: 'matrix', label: '方案比较矩阵', fields: [f.title, f.csvFile, long('csv', '或粘贴 CSV', '首列方案，首行标准。单元格可写 ✓ ✗ ~、1–5 分或短文字。'), str('highlight', '最终选择的方案', '与首列名称一致，该行会被标出。'), f.caption] },
  { name: 'params', label: '模型参数表', fields: [f.title,
    list('items', '参数', '参数', [str('symbol', '符号（LaTeX）', '例如 k_{deg} 或 V_{\\max}'), str('text', '含义'), str('value', '数值'), str('unit', '单位'), str('source', '来源类型', '文献 / 实验测定 / 拟合 / 估计 / 假设'), str('href', '来源链接')]),
    f.caption] },
  { name: 'code', label: '代码与复现', fields: [f.title, str('filename', '文件名'), str('language', '语言', '例如 Python、R、MATLAB。'), long('code', '代码'), str('command', '运行命令', '例如 python simulate.py --seed 1'), f.href, f.caption] },

  /* ----------------------------------------------------------------- media */
  { name: 'hotspots', label: '图片标注（凝胶 / 装置 / 海报）', fields: [f.title, file('image', '图片'),
    list('items', '标注点', '标注', [num('x', '横向位置（0–100%）'), num('y', '纵向位置（0–100%）'), str('title', '标注名称'), long('text', '说明', RICH)]),
    f.caption] },

  /* ------------------------------------------------------------------ people */
  
  
  
];

export const toolkitNames = toolkitSpecs.map((s) => s.name);
export const specByName = Object.fromEntries(toolkitSpecs.map((s) => [s.name, s]));
