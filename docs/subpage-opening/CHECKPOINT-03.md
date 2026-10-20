# subpage-opening checkpoint-03（累计：含 02 全部成果 + Investigation + Industry）

## 本轮新增
- **hp-investigation —— 田野路线**：虚线小路铺开，放大镜标记沿路前进，四站依次立起：博物馆展柜 → 访谈气泡 → 大棚农场 → 取土器与土样袋；田野笔记本（复用 i-contrib-docs）退到起点角落。桌面 7 层；手机 6 层为 S 形竖向路线，第一站在标题下方先立着，滚动后上移到标题上方。不画人数、不对应真实身份。
- **hp-industry —— 信封到洽谈**：合信封与开信封同位叠化并移向左侧，邀请函和演示资料飞出到两侧，洽谈桌从下方升起，左右两个对话气泡先后弹出。桌面 7 层；手机 6 层（双气泡合成一帧）。长标题单独设 `title.fontSize`（桌面 100、手机 84 设计单位，390 宽为两行、360 宽为三行且不压道具），只作用于本页。不画工厂、流水线、认证章、货架商品、握手、钱币。
- GPT 材料累加：`gpt/subpage-openings/给GPT/` 下现有 hp-overview（OV1）、hp-investigation（IV1）、hp-industry（IN1）三份，各含 00-style.png、底稿、提示词.txt；`manifest.json` 按 id 累加（OV1/IV1/IN1），导入工具一次可处理三张。信封给了高清重画项（in-env-*），临时版为现有 GPT 信封放大。
- 生成脚本仅增量扩展（合成帧与 GPT 底稿改为通用，Overview 输出不变）；预览增加三页索引 `preview/index.html`。

## 实际验证
- `node --test tools/tests/scenes.test.mjs`：hp-overview / hp-investigation / hp-industry 的 desktop、mobile 共 6 项全部通过；其余失败仍是本聚焦包缺其他页 webp（ENOENT）。
- 取景检查（相机比例，1.00 = 不缩放）：两页在 1440×900、390×844 全程 1.00；1920×1080 / 1280×720 ≥ 0.99；360×740 ≥ 0.92；768×1024 ≥ 0.85；矮横屏 844×390 ≥ 0.86（现有分栏样式）。
- Playwright 实际滚动截图（shots/）：Investigation 三视口；Industry 桌面复查后 390×844、360×740 手机复查，无脚本错误。
- 截图中发现并已修正：Industry 的邀请函、资料册、对话气泡末态漏写 `o:1 / s:1`，按引擎规则沿用了起始透明，导致桌面不显示；另加了一道检查，三页没有任何层再依赖隐式末态。手机末态道具下移、缩小，避开三行标题。

## 需要你决定的共享样式问题（未改公共引擎）
矮横屏（约 844×390）下，长标题 “Industry Engagement and Support” 左半被裁：两个媒体查询叠加，`max-height:640px` 把标题中心放在 22%，`max-height:500px` 又把宽度改成整屏宽。这是现有 scene-hero.css 的问题，iHP 等长标题页同样会遇到，所以本轮没动。建议在 scene-hero.css 的 `@media (max-height: 500px) and (orientation: landscape) and (max-width: 1000px)` 块中，把 `.scene__title { width: calc(100% - 40px); }` 改为 `width: calc(44% - 36px);`，与分栏布局一致。

## 说明
- 新道具全部为程序临时图（assets/scenes-2d/auto/），atlas style 与预览角标如实标注；路径条 iv-path / iv-path-m 是程序生成的虚线，不进 GPT 底稿。
- scenes.ts、正文、路由、导航、引用、审核状态均未改；未跑整站构建。
- Project 三页留到下一阶段。
