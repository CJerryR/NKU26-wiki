import type { Template, TinaField } from 'tinacms';
const str = (name: string, label: string): TinaField => ({type:'string',name,label});
const long = (name: string, label: string): TinaField => ({type:'string',name,label,ui:{component:'textarea'}});
const title = str('title','模块标题');
const caption = long('caption','说明 / 数据来源');
const list = (name: string, label: string, fields: TinaField[]): TinaField => ({type:'object',name,label,list:true,fields,ui:{itemProps:item=>({label:item.title||item.label||item.date||'条目'})}});
const file = (name: string, label: string, accept?: string[]): TinaField => ({type:'image',name,label,...accept?{accept}:{}});
const panels = list('items','内容条目',[str('title','条目标题'),long('text','内容（保留换行）')]);
export const toolkitTemplates: Template[] = [
 {name:'tabs',label:'分栏切换 / 工程循环',fields:[title,panels,caption]},
 {name:'accordion',label:'折叠问答 / 访谈记录',fields:[title,panels,caption]},
 {name:'chronology',label:'Notebook / HP 时间线',fields:[title,list('items','事件',[str('date','日期 / 阶段'),str('title','事件标题'),str('category','组别 / 分类'),long('text','过程与反馈'),str('href','相关页面链接')]),caption]},
 {name:'protocol',label:'实验步骤清单',fields:[title,long('materials','材料（每行一项）'),list('items','步骤',[str('title','步骤名称'),long('text','操作说明'),str('duration','时间 / 条件')]),caption]},
 {name:'lightbox',label:'多图相册 / 放大阅读',fields:[title,list('items','图片',[file('image','图片'),str('title','图片说明'),long('text','图注')]),caption]},
 {name:'comparison',label:'前后图片对比',fields:[title,file('before','左侧 / 修改前图片'),file('after','右侧 / 修改后图片'),str('beforeLabel','左图说明'),str('afterLabel','右图说明'),caption]},
 {name:'video',label:'视频 / 字幕',fields:[title,file('file','MP4 / WebM 文件',['.mp4','.webm']),file('poster','封面'),file('subtitles','WebVTT 字幕',['.vtt']),str('language','字幕语言代码（如 zh 或 en）'),caption]},
 {name:'downloads',label:'附件下载列表',fields:[title,list('items','附件',[str('title','附件名称'),file('file','附件文件'),long('text','说明 / 版本 / 文件大小')]),caption]},
 {name:'datatable',label:'数据表 / Parts 表（搜索排序）',fields:[title,file('file','CSV 文件',['.csv']),long('csv','或粘贴 CSV（首行为列名，文件优先）'),caption]},
 {name:'chart',label:'实验数据图表',fields:[title,file('file','CSV 文件',['.csv']),long('csv','或粘贴 CSV（首列 X，其余列 Y，文件优先）'),{type:'string',name:'chartType',label:'图表类型',options:[{label:'折线图',value:'line'},{label:'柱状图',value:'bar'},{label:'散点图',value:'scatter'}]},str('xLabel','横轴名称 / 单位'),str('yLabel','纵轴名称 / 单位'),caption]},
 {name:'sequence',label:'DNA / 蛋白序列阅读器',fields:[title,{type:'string',name:'sequenceType',label:'序列类型',options:['dna','rna','protein']},file('file','FASTA / 文本文件',['.fasta','.fa','.faa','.fna','.txt']),long('sequence','或粘贴单条序列 / FASTA（文件优先）'),str('highlight','高亮范围，例如 10-30,50-60'),caption]},
 {name:'equation',label:'数学公式（LaTeX）',fields:[title,long('latex','LaTeX 公式（不需要 $$）'),caption]},
];
