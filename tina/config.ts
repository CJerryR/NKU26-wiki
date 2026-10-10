import { defineConfig, type Template } from 'tinacms';
import { toolkitTemplates } from './toolkit';

const hosted = process.env.TINA_HOSTED === '1';

const body = { type: 'rich-text' as const, name: 'body', label: '正文', parser: { type: 'markdown' as const } };
const mediaFields = [
  { type: 'string' as const, name: 'title', label: '模块标题' },
  { type: 'number' as const, name: 'height', label: '窗口高度（300–1200 像素，默认 600）' },
  { type: 'string' as const, name: 'caption', label: '图注 / 说明', ui: { component: 'textarea' } },
];
const templates: Template[] = [
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
  { name: 'text', label: '富文本 / 表格', fields: [body] },
  { name: 'layout', label: '排版模块', fields: [
    { type: 'string', name: 'kind', label: '类型', required: true, options: ['note', 'tip', 'warning', 'cards', 'cols', 'figure', 'timeline', 'features', 'stats', 'refs', 'details', 'people', 'lead'] },
    { type: 'string', name: 'label', label: '模块标题' },
    { type: 'string', name: 'attributes', label: '布局设置', description: '例如 cols="2"；已有 svg 图形编号请保留。' },
    body,
  ] },
  { name: 'image', label: '图片与图注', fields: [
    { type: 'image', name: 'src', label: '上传图片', required: true },
    { type: 'string', name: 'alt', label: '图片说明', required: true },
    body,
  ] },
  { name: 'gallery', label: '双图并排', fields: [
    { type: 'image', name: 'left', label: '左图', required: true },
    { type: 'string', name: 'leftAlt', label: '左图说明' },
    { type: 'image', name: 'right', label: '右图', required: true },
    { type: 'string', name: 'rightAlt', label: '右图说明' },
    body,
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
      { type: 'object', name: 'blocks', label: '正文排版', list: true, templates,
        ui: { itemProps: (item) => ({ label: item.text || item.label || ({ text: '富文本', layout: item.kind, image: '图片', gallery: '双图' }[item._template] || '模块') }) } },
    ],
  }] },
});
