# Model 与 Human Practices 规则执行报告

基线：`e205f4a`；工作目录：`workspace/tasks/bug-rules`。未运行导出、构建、预览或发布，生成网页与桌面/手机复验由主代理执行。

## 修改范围

- 覆盖分配的 12 个 JSON 内容源，含两个旧模型跳转页。全部 block 键已枚举，本组只有 body 文案字段，无 accompanyingBody/gallery 嵌套文案。
- 页面标题、副标题、面包屑、正文标题、目录短标题、卡片/功能/时间线标题、HP 章节导航及图片组标题统一 sentence case，保留机构名和科学标识符大小写。
- 删除 h2 的编号和空格；h3 按每页实际章节连续编号。model-ode 的实际二级标题从 h4 提升为 h3，参考文献提升为独立 h2。稳定 anchor 保持不变。
- 删除 5 个正文原稿下载入口、5 个 Back/Next 段落和行业页重复总览入口；保留章节导航、科研交叉链接和教学资源下载。
- 去掉普通 p 元素的 text-align:left 局部覆盖，由公共样式提供两端对齐。
- 逐页定义已确认通用缩写，与另一内容代理统一 Mi/Ce、SDF/PDBQT、PPN 和 G protein。未确定缩写按用户决定保留全称并逐项记录。
- 修正 model-ode 原有 Caenorhabditis elegans 双写；正文 Mi/Ce 使用斜体。公式、表格、模型数字和参考文献原题原样保留。

## 验证

`python3 tools/apply-rules-model-hp.py --apply --verify` 逐页通过：JSON、MathML/表格/代码逐字比较、图片 URL、HTML/标题 anchor、引用原文、审核及路由元数据、h2/h3 编号、历史入口与重复导航。重复执行结果字节一致。

| 页面 | 原 block 数 | 现 block 数 | 已定义通用缩写 | 保留全称待确认 |
| --- | ---: | ---: | ---: | ---: |
| model | 9 | 8 | 5 | 16 |
| model-1 | 2 | 2 | 0 | 1 |
| model-2 | 2 | 2 | 1 | 0 |
| model-docking | 62 | 61 | 12 | 23 |
| model-md | 31 | 30 | 6 | 16 |
| model-ode | 118 | 117 | 12 | 27 |
| model-eco | 61 | 60 | 2 | 20 |
| hp-overview | 15 | 14 | 2 | 10 |
| hp-investigation | 23 | 22 | 5 | 19 |
| hp-industry | 20 | 18 | 1 | 2 |
| human-practices | 36 | 35 | 4 | 11 |
| education | 28 | 27 | 1 | 6 |

## 验证边界

- 本报告证明内容源与受保护科研材料的完整性；最终生成网页、目录计算和桌面/手机视觉由主代理复验。
- 所有已定义、保留全称及科学标识符见 `术语表-model-hp.md` 与同名 JSON。没有将待负责人确认项伪报为已统一。
- 脚本从固定基线派生本轮修改，逐页记录前后 SHA-256；只有内容仍为基线或本轮审阅结果时允许写入，发现后续改动即拒绝覆盖。
