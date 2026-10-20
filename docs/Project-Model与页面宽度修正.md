# Project、Model 与全站正文宽度修正

日期：2026-10-20

## 范围

- Project：Description、Background、Engineering、Contribution。
- Model：Overview、Docking、Molecular dynamics、ODE、Economic benefit。
- 全部 26 个内容页：恢复共用的 65rem 正文栏。HP 内容源未修改。

## 原因与修正

- `.doc, .pager` 的局部 42rem 覆盖了公共 65rem，导致 1440px 下正文仅 672px、两侧各空约 224px。删除窄栏覆盖，直接在实际布局元素设置统一宽度；修正后正文 1040px、左右各约 40px。
- Model 新稿重新带入 Title Case、unnumbered 和带编号的一级标题。保留新稿，修正真实层级、句首大写及编号；一级标题正文不带数字，二级标题逐章 x.x，目录一级 01/02、子项不显示数字。
- Model 局部样式强制普通段落左对齐；移除此覆盖，继承两端对齐与共同边界。
- Project 新稿补齐定义、修复重复缩写括号，Description 的章节顺序重新对应。
- 复用既有审定的专业术语全称与缩写，九页逐页建立 77 条定义记录；无确定通用缩写的继续保留全称。
- 公式（含完整 KaTeX 与 MathML）、代码、表格、原始数据字段、图片、链接、稳定锚点、参考文献和审稿元数据逐项保护。

## 验证

- 26 页生成结构审计。
- 1440×900 与 390×844 共 52 组浏览器检查：全部通过宽度、普通正文字号/字重/对齐及水平溢出检查。
- 已定正文排版数值保持：18px/380/1.65；手机 17.5px/380/1.7；h2/h3 继承既定规则。
- 九页内容源与官方基线 `6143316` 对照，保护片段与科学资源完全一致。
- 重复执行迁移不会重复编号或定义；版本化报告用于后续来源变化检查。
- CI 增加结构与规则检查；不把科研终审标记改成已通过。

完整术语、保留全称词项与保护检查：`project-model-rules-followup.json`。

布局检查与截图：`validation/layout-followup/`。

提交、预览及上线状态以工作区 `workspace/registry/tasks/bug-rules.json` 的 followup 字段为准。
