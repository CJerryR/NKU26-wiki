import { defineConfig, type Template, type TinaField } from 'tinacms';
import { toolkitTemplates } from './toolkit';

const hosted = process.env.TINA_HOSTED === '1';

const body = { type: 'rich-text' as const, name: 'body', label: '正文', parser: { type: 'markdown' as const } };
const mediaFields = [
  { type: 'string' as const, name: 'title', label: '模块标题' },
  { type: 'number' as const, name: 'height', label: '窗口高度（300–1200 像素，默认 600）' },
  { type: 'string' as const, name: 'caption', label: '图注 / 说明', ui: { component: 'textarea' } },
];
const identityFields: TinaField[] = [
  {type:'string',name:'name',label:'英文姓名'},
  {type:'string',name:'chineseName',label:'中文姓名'},
  {type:'string',name:'anchor',label:'原有成员锚点'},
  {type:'image',name:'image',label:'成员照片（可留空）'},
  {type:'string',name:'role',label:'分组 / 职责'},
];
const memberCards: Template = {name:'membergrid',label:'成员翻转卡片',fields:[
  {type:'number',name:'headingLevel',label:'人物标题层级'},
  {type:'object',name:'items',label:'成员',list:true,fields:[...identityFields,
    {type:'string',name:'university',label:'学校（按原稿）'},
    {type:'string',name:'major',label:'专业 / 研究领域'},
    {type:'string',name:'cohort',label:'年级（按原稿）'},
    {type:'string',name:'academicStatus',label:'Academic Status（学籍与入学年份）'},
    {type:'string',name:'group',label:'Group（所属组别）'},
    {type:'string',name:'tags',label:'Tags（工作标签）'},
    {type:'string',name:'outsideTheLab',label:'Outside the Lab（课余兴趣）'},
    {type:'string',name:'introduction',label:'卡片背面介绍',ui:{component:'textarea'}},
  ],ui:{itemProps:item=>({label:item.name || '成员'})}},
]};
const personalCredits: Template = {name:'creditgrid',label:'个人贡献卡片',fields:[
  {type:'number',name:'headingLevel',label:'人物标题层级'},
  {type:'object',name:'items',label:'成员',list:true,fields:[...identityFields,
    {type:'string',name:'tasks',label:'Tasks（逗号分隔）',ui:{component:'textarea'}},
    {type:'object',name:'specificTasks',label:'Specific Tasks',list:true,fields:[
      {type:'string',name:'text',label:'具体贡献',ui:{component:'textarea'}},
    ],ui:{itemProps:item=>({label:item.text?.slice(0,65) || '贡献'})}},
  ],ui:{itemProps:item=>({label:item.name || '成员'})}},
]};
const templates: Template[] = [
  memberCards, personalCredits,
  ...toolkitTemplates,
  { name: 'protein', label: '蛋白质结构（可旋转）', fields: [
    ...mediaFields,
    { type: 'image', name: 'file', label: '结构文件（PDB / CIF）', accept: ['.pdb', '.cif', '.mmcif'], description: '可先留空；上传真实结构后展示。' },
    { type: 'string', name: 'format', label: '结构格式', options: ['pdb', 'cif'] },
    { type: 'string', name: 'representation', label: '初始显示方式', options: [{label:'丝带',value:'cartoon'},{label:'球棍',value:'stick'},{label:'原子球',value:'sphere'},{label:'分子表面',value:'surface'}] },
    { type: 'string', name: 'color', label: '主体颜色', description: '例如 #8cae73，留空使用绿色。' },
    { type: 'string', name: 'chain', label: '突出显示的链', description: '可选，例如 A。' },
    { type: 'string', name: 'residues', label: '突出显示的残基编号', description: '可选，例如 42,57,100-105；紫色球棍显示。' },
  ] },
  { name: 'pdf', label: 'PDF 阅读器', fields: [
    ...mediaFields,
    { type: 'image', name: 'file', label: 'PDF 文件', accept: ['.pdf'] },
    { type: 'boolean', name: 'compact', label: '折叠为文件卡片', description: '默认只显示一行文件名和打开按钮，点击后展开阅读器；适合一页有多个 PDF。' },
  ] },
  { name: 'html', label: 'HTML 阅读 / 交互演示', fields: [
    ...mediaFields,
    { type: 'image', name: 'file', label: '单文件 HTML', accept: ['.html', '.htm'], description: '多文件作品先放入 static/embeds/，再填入文件路径；ZIP 不能直接运行。' },
    { type: 'boolean', name: 'scripts', label: '允许演示中的 JavaScript', description: '仅对可信的交互作品启用；普通阅读可关闭。' },
  ] },
  { name: 'heading', label: '章节标题', fields: [
    { type: 'string', name: 'text', label: '标题', required: true },
    { type: 'number', name: 'level', label: '标题级别 (2–4)', required: true },
    { type: 'string', name: 'attributes', label: '锚点与目录设置', description: '已有值请保留；例如 #problem toc="The problem"' },
  ] },
  { name: 'manuscriptTitle', label: '稿件主标题', fields: [
    { type: 'rich-text', name: 'manuscript', label: '主标题文字', required: true, parser: { type: 'markdown' } },
  ] },
  { name: 'text', label: '富文本 / 表格', fields: [body] },
  { name: 'layout', label: '排版模块', fields: [
    { type: 'string', name: 'kind', label: '类型', required: true, options: ['note', 'tip', 'warning', 'cards', 'cols', 'figure', 'timeline', 'features', 'stats', 'refs', 'details', 'people', 'lead', 'workflow'] },
    { type: 'string', name: 'label', label: '模块标题' },
    { type: 'string', name: 'attributes', label: '布局设置', description: '例如 cols="2"；已有 svg 图形编号请保留。' },
    body,
  ] },
  { name: 'image', label: '图片与图注', fields: [
    { type: 'image', name: 'src', label: '上传图片', required: true },
    { type: 'image', name: 'originalSrc', label: '原图链接（可选）', description: '有压缩预览图时填入原始大图；点击查看完整原图会打开此地址。' },
    { type: 'string', name: 'alt', label: '图片说明', required: true },
    { type: 'boolean', name: 'openOriginal', label: '点击查看完整原图' },
    { ...body, label: '图注' },
    { type: 'string', name: 'layout', label: '图文版式', options: [{ label: '通栏图片', value: 'full' }, { label: '文字在上、图片在下', value: 'stack' }, { label: '左图右文', value: 'left' }, { label: '右图左文', value: 'right' }, { label: '左侧嵌入 · 文字环绕', value: 'wrap-left' }, { label: '右侧嵌入 · 文字环绕', value: 'wrap-right' }], description: '嵌入式将图片和图注作为整体，配套正文在旁环绕，超过图片高度后铺满下方。手机显示正文后显示图片。留空或配套正文为空时使用通栏。' },
    { type: 'string', name: 'scale', label: '图片显示比例', options: [{ label: '100%（默认）', value: '' }, { label: '85%', value: '85' }, { label: '70%', value: '70' }, { label: '55%', value: '55' }], description: '图片在白色图框中按此比例居中显示，左右留白。' },
    { type: 'string', name: 'imageWidth', label: '图片宽度', options: [{ label: '窄（约 32%）', value: 'narrow' }, { label: '中（约 40%）', value: 'medium' }, { label: '宽（约 50%）', value: 'wide' }], description: '用于左右并排和嵌入式环绕；手机自动上下排列。' },
    { ...body, name: 'accompanyingBody', label: '配套正文', description: '嵌入式请放入相关的完整段落，可包含图片前后的正文；不要拆开 DBTL、表格等组件。' },
    { type: 'boolean', name: 'continueWrap', label: '让后续正文继续环绕', description: '仅用于配套正文较短的图片；桌面后续正文延续环绕，下一二级标题处结束，手机保持原有顺序。' },
  ] },
  { name: 'imagegroup', label: '并排图片组 · 正文环绕', fields: [
    { type: 'object', name: 'items', label: '图片与原图注', list: true, fields: [
      { type: 'image', name: 'src', label: '图片', required: true },
      { type: 'image', name: 'originalSrc', label: '原图链接' },
      { type: 'string', name: 'alt', label: '图片说明' },
      { ...body, label: '原图注' },
      { type: 'boolean', name: 'openOriginal', label: '点击查看原图' },
    ] },
    { type: 'string', name: 'layout', label: '环绕方向', options: ['wrap-left', 'wrap-right'] },
    { type: 'string', name: 'imageWidth', label: '图组宽度', options: ['narrow', 'medium', 'wide'] },
    { ...body, name: 'accompanyingBody', label: '配套正文' },
    { type: 'boolean', name: 'continueWrap', label: '让后续正文继续环绕' },
  ] },
  // C01 (component-design checkpoint-01): a figure kept beside the paragraphs that lead to it and read it.
  // Text is stored exactly as authored; order on the page is always 图前正文 → 图 → 图注 → 图后正文.
  { name: 'evidence', label: '图文对照（实验图 + 相关正文）',
    ui: { defaultItem: { place: 'right', size: 'standard', openOriginal: true } },
    fields: [
      { ...body, label: '图前正文', description: '引出这张图的段落（通常写着“Figure N”）。原文照录；可留空。' },
      { type: 'image', name: 'src', label: '实验图', required: true },
      { type: 'string', name: 'figureAlt', label: '图片替代文字', description: '给读屏软件的一句话画面描述；原稿没有时可暂留空，由作者补写，不要猜测实验结果。' },
      { type: 'boolean', name: 'openOriginal', label: '点击查看完整原图' },
      { ...body, name: 'figureCaption', label: '图注', description: '原文照录，含 Figure 编号与分图说明。' },
      { ...body, name: 'afterBody', label: '图后正文', description: '紧接着解读这张图的段落；可留空。' },
      { type: 'string', name: 'place', label: '版式', options: [{ label: '文左图右（默认）', value: 'right' }, { label: '图左文右', value: 'left' }, { label: '文上图下', value: 'below' }], description: '桌面端生效；手机和窄栏始终按 图前正文 → 图 → 图后正文 顺序排列。多分图的宽图建议“文上图下”。' },
      { type: 'string', name: 'size', label: '图片大小', options: [{ label: '小（约 1/3 栏）', value: 'compact' }, { label: '中（默认）', value: 'standard' }, { label: '大（约 1/2 栏 / 通栏）', value: 'wide' }], description: '并排时决定图片占栏比例；文上图下时决定图片宽度。图片高度都有上限，不会撑满屏幕。' },
    ] },
  // C01: DBTL stage marker. The stage paragraph stays a paragraph (no new heading, anchor or outline entry).
  { name: 'phase', label: 'DBTL 阶段标记', ui: { defaultItem: { kind: 'design', body: 'Design' } }, fields: [
    { type: 'string', name: 'kind', label: '阶段', required: true, options: [{ label: 'Design', value: 'design' }, { label: 'Build', value: 'build' }, { label: 'Test', value: 'test' }, { label: 'Build & Test', value: 'build-test' }, { label: 'Learn', value: 'learn' }, { label: '其他', value: 'other' }], description: '只决定标记样式；页面显示的文字来自下方“阶段名”。' },
    { ...body, label: '阶段名', description: '原文照录，例如 Design、Build & Test。之后的正文和图文对照会归入这一阶段，直到下一个阶段标记或标题。' },
  ] },
  { name: 'gallery', label: '双图并排', fields: [
    { ...body, label: '图组上方正文' },
    { type: 'image', name: 'left', label: '左图', required: true },
    { type: 'string', name: 'leftAlt', label: '左图说明' },
    { ...body, name: 'leftCaption', label: '左图图注' },
    { type: 'image', name: 'right', label: '右图', required: true },
    { type: 'string', name: 'rightAlt', label: '右图说明' },
    { ...body, name: 'rightCaption', label: '右图图注' },
    { ...body, name: 'afterBody', label: '图组下方正文' },
  ] },
];

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'tina-v7.6',
  clientId: process.env.TINA_CLIENT_ID || 'cfacd76b-22f9-4a00-8eb0-9ef4fcf60f87',
  token: process.env.TINA_TOKEN,
  build: { publicFolder: '.tina-static', outputFolder: 'admin', basePath: hosted ? 'NKU26-wiki/wiki-editor' : '' },
  media: { tina: { publicFolder: 'static', mediaRoot: 'img/uploads' } },
  schema: { collections: [{
    name: 'wiki', label: 'Wiki 内页', path: 'content/wiki', format: 'json',
    ui: {
      router: ({ document }) => {
        if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) return undefined;
        return `/edit/${document._sys.filename}`;
      },
      allowedActions: { create: false, delete: false, createFolder: false },
      filename: { readonly: true, slugify: (values) => (values.title || 'page').toLowerCase().replace(/[^a-z0-9]+/g, '-') },
    },
    fields: [
      { type: 'string', name: 'title', label: '页面名称', isTitle: true, required: true },
      { type: 'string', name: 'heading', label: '页头标题' },
      { type: 'string', name: 'sub', label: '页头摘要', ui: { component: 'textarea' } },
      { type: 'string', name: 'description', label: '搜索摘要' },
      { type: 'string', name: 'route', label: '页面地址', description: '已有地址请勿随意更改。仅小写英文字母、数字和连字符。' },
      { type: 'string', name: 'crumbs', label: '面包屑导航', list: true },
      { type: 'object', name: 'meta', label: '页头信息', list: true, fields: [
        { type: 'string', name: 'key', label: '名称', required: true },
        { type: 'string', name: 'value', label: '内容', required: true },
      ], ui: { itemProps: (item) => ({ label: `${item.key}: ${item.value}` }) } },
      { type: 'boolean', name: 'draft', label: '草稿（不发布）' },
      { type: 'boolean', name: 'hidden', label: '从搜索中隐藏' },
      { type: 'boolean', name: 'search', label: '允许搜索' },
      { type: 'boolean', name: 'preserveAuthorFormatting', label: '保留原稿科学排版', description: '已导入的科研稿件请保留：避免自动改写作者强调、引用和科学符号。' },
      { type: 'object', name: 'blocks', label: '正文排版', list: true, templates,
        ui: { itemProps: (item) => {
          // C01: name stage markers and evidence blocks by their own text so they can be found in the block list
          const plain = (value: unknown) => String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
          if (item._template === 'phase') return { label: `阶段｜${plain(item.body) || item.kind || ''}` };
          if (item._template === 'evidence') return { label: `图文｜${plain(item.figureCaption).slice(0, 48) || '实验图'}` };
          if (item._template === 'manuscriptTitle') return { label: `稿件主标题｜${plain(item.manuscript).slice(0, 48) || '标题'}` };
          return { label: item.text || item.label || ({ text: '富文本', layout: item.kind, image: '图片', gallery: '双图' }[item._template] || '模块') };
        } } },
    ],
  }] },
});
