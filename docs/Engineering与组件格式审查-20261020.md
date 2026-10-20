# Engineering 与昨日改动的 Tina／格式审查

状态：本地修正完成，未合并、未发布。

基线：`c56e223f136804824dd9ba8cc11c24f8cdd03eb4`。任务 `ruoxi-requirements`，分支 `codex/ruoxi-requirements-publication`。准确结果 SHA 及预览信息记录在工作区任务登记。

## 原稿核对

本轮重新通过飞书官方“所有内容”导出读取 Engineering，并读取 README｜Project。Engineering 与此前已取得的最新作者稿正文一致；五张原始 PNG 字节集合一致，只有导出文件名次序不同。作者正文保持；没有把旧稿覆盖到最新 Model。原稿来源与核对哈希见 `validation/component-audit/latest-source-comparison.json`。

## 修正

- Engineering：12 轮原稿 DBTL 转为现成 Tina `cycle` 组件，48 个阶段独立编辑和切换。图片与图注保留在对应阶段，英文界面、键盘操作和无 JavaScript 正文回退可用。原 SVG 基因线路图保留；Figure 5 继续按用户决定仅保留图注。
- ODE：13 处独立公式改用现成 Tina `equation`，从当前原始 MathML 的 TeX 注释提取，保持公式原文；可复制 LaTeX。五张含数学排版的原始参数表仍由 Tina 富文本块承载，不扁平化或改写其数据。
- Background、Attributions：两张普通表格改用 Tina `datatable`，可筛选、排序和下载。贡献表保留物种斜体及首次定义；下载 CSV 去除排版标记，保持原始名称与数值。Background 的检测方法缩写使用既有审定术语表补充图例。
- 复用既有格式任务提交 `5e7eec8` 的修正（本分支提交 `b2332d8`），再依据最新 README 检查总述和章节边界。正文共用 65rem 上限；移除 42rem 与局部左对齐覆盖。修正 Project／Model 标题句首大写、章节与子标题编号、目录编号；总述不计章号。
- Model 当前稿的 43 处文内引用补为上标，参考文献条目不变。公式、表格原始文字和原有引用不丢失。
- Tina 增加显式“保留原稿科学排版”字段；编辑预览使用该字段，缓存也按排版模式区分。没有把团队科研终审状态改成通过。

## 范围与验证

- 检查全部 26 份 Tina 内容源及生成页面；兼容跳转页、原稿归档和待稿空页保持原有用途。首页为现有独立场景叙事，成员／个人贡献保留既有 Tina 卡片；没有把所有段落机械改成互动控件。
- 科研保护检查：26 页的图片与附件、TeX、复杂表格、原始 CSV、参考文献及根元数据全部通过；复杂表格内仅增加已有引用的上标标签。
- `npm run verify`：构建、资源检查和技术审计通过；原有待团队科研终审提示保留。
- 26 页结构检查通过；16 个标题目录、图注、原稿排版和组件回归测试通过。
- Engineering 48 个阶段逐项点击通过。桌面实测正文／组件同宽 1040px、正文 18px／29.7px；390px 手机正文栏 350px、正文 17.5px／29.75px、h3 21px，无横向溢出；浅色／深色截图已保存。
- ODE 13 个公式全部渲染成功，五张原始参数表保留，390px 无整页横向溢出。
- Tina 独立表单可读取四阶段及图片图注字段；本地 GraphQL 实读确认 12 个循环、13 个公式及表格排版选项，Engineering／ODE 的原稿格式开关为 true。
- Attributions 表格实际筛选 GenScript 后为一行，物种斜体正确；下载 CSV 已核对 1,506 bp、804 bp 和物种名称，未包含 HTML 排版标签。
- 公共宽度修正原有全站 52 组浏览器证据保留在 `validation/layout-followup/`；本轮新组件与手机验证在 `validation/component-audit/`，不把旧证据计作本轮新测。

预览为本任务源码构建的静态站，端口 54721。Tina 独立编辑表单端口 54722，本地 API 4119；其他聊天的预览及编辑器未修改。预览路径与准确 HEAD 以工作区登记为准。

## 全部内容源的组件清单

| 内容源 | 修正后 Tina 模板及数量 |
| --- | --- |
| attributions | heading×23, creditgrid×7, text×14, datatable×1 |
| background | text×10, heading×4, image×4, layout×1, datatable×1 |
| contribution | text×38, heading×14, image×5 |
| description | text×31, image×1, heading×10 |
| education | text×12, heading×8, layout×7 |
| engineering | image×2, text×32, heading×17, cycle×12 |
| experiments | heading×23, text×18, datatable×4, pdf×17, image×1 |
| hp-industry | text×9, layout×4, heading×5 |
| hp-investigation | text×13, heading×5, layout×4 |
| hp-overview | text×7, layout×3, heading×4 |
| human-practices | text×18, heading×7, layout×10 |
| licensing |  |
| members | image×1, heading×10, membergrid×7 |
| model-1 | heading×1, text×1 |
| model-2 | heading×1, text×1 |
| model-docking | text×54, layout×1, heading×8, image×6 |
| model-eco | text×51, layout×3, heading×7 |
| model-md | text×26, layout×1, heading×6, image×3 |
| model-ode | text×85, layout×1, image×5, heading×11, equation×13 |
| model | text×11, heading×4 |
| part-collection | heading×1, text×1 |
| parts | text×1, heading×4, datatable×3 |
| protocols | heading×1, text×1 |
| results | text×118, heading×41, image×29 |
| safety | heading×8, text×15, image×6 |
| source-archive | text×28, heading×8 |
