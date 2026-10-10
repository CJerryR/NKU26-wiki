# iGEM 内容组件：本地操作与调研

## 打开与编辑

项目目录：`/Users/cjrmacbook/Downloads/NKU26-wiki-tina`

在该目录运行 `npm run dev`，终端保持开启。

- 展示页：http://localhost:3000/component-library
- 后台：http://localhost:3000/admin/index.html

进入后台的 Wiki 页面集合，选择页面，在内容模块中点击添加，选择下表中的模块。填好字段、调整模块顺序后保存。本地模式保存的是本机内容文件；发布仍需构建与 Git 推送。本次未上传或部署。

## 新增的 12 类模块

| 后台名称 | 填写方式与用途 |
|---|---|
| 分栏切换 / 工程循环 | 添加标题和正文条目，例如 Design、Build、Test、Learn |
| 折叠问答 / 访谈记录 | 每个条目填问题和回答 |
| Notebook / HP 时间线 | 填日期、分类、标题、反馈，读者可筛选分类 |
| 实验步骤清单 | 材料每行一项，步骤单独添加；勾选仅本次阅读有效 |
| 多图相册 / 放大阅读 | 上传图片，填写图片说明和图注，点击可放大 |
| 前后图片对比 | 选择两张图片，读者拖动分界线 |
| 视频 / 字幕 | MP4 或 WebM，可选封面、VTT 字幕及语言代码 |
| 附件下载列表 | 每个附件填文件、名称和说明 |
| 数据表 / Parts 表 | 上传 CSV 或粘贴 CSV；首行列名，支持搜索、排序、分页 |
| 实验数据图表 | CSV 首列 X，其余列 Y；选择折线、柱状或散点，可导出 PNG |
| DNA / 蛋白序列阅读器 | 单条 FASTA 或纯序列，支持查找、复制、范围高亮 |
| 数学公式（LaTeX） | 输入公式源码，不需要两侧的 $$ |

CSV 和序列同时填写文件与文本时，优先读取文件。正文条目为纯文本，可换行；复杂图文可拆成多个模块排版。没有文件时可以先填标题，或使用展示页参考效果，不需要编造研究数据。

图表示例 CSV：

```csv
Time,Control,Treatment
0,0,0
1,2,3
2,3,5
```

以上为虚构数字。散点图的 X、Y 应为数字。图表仅展示数据，未提供拟合、显著性检验或误差棒。序列阅读器不是质粒编辑器，单条序列上限 100000 个字符。公式只做排版。已有蛋白结构、PDF、HTML 组件继续保留，详见《TINA-交互组件.md》。

## 调研依据

以下队伍页面用于了解信息组织方式；本项目的组件实现与示例独立编写。

- [UCSC Notebook](https://2025.igem.wiki/ucsc/notebook)：分组、工程循环和实验文档，适合分栏及附件。
- [Cornell Notebook](https://2025.igem.wiki/cornell/notebook)：按周和工作类型组织记录，适合分类时间线。
- [Aachen Human Practices](https://2025.igem.wiki/aachen/human-practices)：访谈、反馈与材料，适合折叠记录、相册和附件。
- [Imperial Human Practices](https://2025.igem.wiki/imperial/human-practices)：活动与项目调整的联系，适合时间线。
- [Düsseldorf Model](https://2025.igem.wiki/duesseldorf/model/)：公式和交互模型，启发公式、数据图表；本次未实现其特定模拟器。
- [Science Tokyo Parts](https://2025.igem.wiki/science-tokyo/parts/)：元件表格，适合搜索排序表。

本地依赖采用 [Chart.js](https://www.chartjs.org/docs/latest/)、[KaTeX](https://katex.org/docs/options.html)、PapaParse；沿用 3Dmol.js 和 PDF.js。依赖随本地构建提供，不依赖运行时 CDN。KaTeX 禁用信任模式。许可证随 viewer 静态资源复制。

## 实现位置

- `tina/toolkit.ts`：后台表单
- `src/lib/toolkit-blocks.mjs`：序列化内容
- `src/scripts/toolkit.ts`：交互功能
- `src/styles/toolkit.css`：独立样式
- `src/editor/toolkit-demo.astro`：仅编辑模式提供的展示页

展示页全部使用明确标注的演示素材，没有替换真实项目内容。正式静态构建不生成展示页。

## 本次检查

静态构建成功生成 18 页。浏览器中已确认分栏切换、问答展开、时间线筛选、步骤勾选、表格数字排序、序列查找、相册放大及关闭；图表和公式正常渲染，演示视频加载完成（3 秒）。构建提示现有 5 个指向停用页面的链接转为纯文本，这不是新组件生成的页面。
