# 开发日志 · Development Log
### NKU iGEM 2026 Wiki —「Subsurface」重新设计

> 本文记录本届 wiki 从旧脚手架到「Subsurface」主题的完整重构过程、关键决策与理由，供团队复盘与评委了解设计思路。

---

## 0. 背景与目标

- **项目主题**：检测两种植物寄生线虫的合成生物学生物传感器
  —— 大豆胞囊线虫 *Heterodera glycines*、南方根结线虫 *Meloidogyne incognita*。
- **本次目标**：彻底重做配色、子页面结构、动画，冲击 **Best Wiki**。
- **交付物**：全部代码、技术手册、本开发日志、更新后的 `CLAUDE.md`，打包成压缩包。

---

## 1. 调研：Best Wiki 是怎么炼成的

在动手前先研究了往届 Best Wiki（如 2024 年 JU-Krakow 的核酸检测项目）与评审标准，得到一条**决定性约束**：

> **iGEM 禁止 wiki 在运行时加载任何外部资源**（Google Fonts、CDN 脚本/样式、外链图片）。
> 一旦使用，可能直接**失去 Best Wiki 资格**。

旧脚手架恰恰通过 CDN 引入了 Google Fonts —— 这是一个会致命的合规缺陷。
因此本次重构的第一原则就是 **完全自托管、纯静态**。

**对应措施**
- 字体全部下载为 `woff2` 放入 `fonts/`，用 `@font-face` 本地声明。
- 不出现任何指向站外的 `<script src>` / `<link href>`；`js/main.js` 为零依赖原生 JS。
- 所有图片本地化；每个页面构建为完全独立的静态 HTML，**无运行时 fetch**，
  既能本地直接打开，也能在 iGEM GitLab Pages 上正确渲染。

---

## 2. 设计方向：从吉祥物与 logo 出发，而非套模板

旧版是常见的「紫色 + 黄色 + 通用大字」组合，缺乏与项目的关联。
本次刻意从两个既有素材出发：

- **吉祥物**：戴猎鹿帽、拿放大镜、叼烟斗的圆脸**侦探** → 「侦探 / 探案」隐喻。
- **logo**：带声呐/探测波纹的「H/NK」标志（棕 + 紫）。

由此定出主题 **「Subsurface（地表之下）」** —— 土壤侦探 / 田野笔记 美学：

| 维度 | 决策 |
| --- | --- |
| 叙事 | 「土壤里藏着东西，我们在症状出现前找到它」 |
| 配色 | 浅暖**纸色**正文区 + 深**壤土色**暗区（像土壤分层）+ 鸢尾紫主色 + 琥珀色 CTA |
| 字体 | Fraunces（展示衬线）/ Spline Sans（正文）/ Space Mono（标签数据），均自托管 |
| 招牌动效 | 跟随光标的「探测放大镜」揭示土中隐藏线虫；游动的线虫 SVG；土层波浪分隔 |

配色 token 详见 `css/style.css` 的 `:root`，并在 `CLAUDE.md` 中有索引。

---

## 3. 架构：用构建系统消除技术债

旧版的痛点（记录于旧 `CLAUDE.md`）：CSS 重复、两套导航写法、每个页面手抄一遍导航。
本次引入 **Python 构建系统**，建立「单一可信源」：

```
_templates/base.html  →  页面骨架（占位符 token）
_partials/nav,footer  →  唯一的导航 / 页脚
_content/*.html       →  仅页面内容（front-matter + sections）
build.py              →  组装为静态 index.html + pages/*.html
scaffold.py           →  按注册表批量生成 _content 骨架
```

**亮点：左侧浮动大纲岛自动生成。** 按用户要求，子页面左侧需有固定浮动的大纲。
`build.py` 会扫描内容中的 `data-toc="标题"`（一级）与 `data-toc-sub="标题"`（二级）
标记，**自动**生成浮动大纲岛 + 移动端精简大纲，并配合 `main.js` 的滚动高亮 /
滑轨 / 进度条 / 折叠。新增小节只需加一个标记并重新构建，无需手维护目录。

---

## 4. 动画清单（全部尊重 `prefers-reduced-motion`）

- 导航：下滚隐藏 / 上滚显现、移动端抽屉、mega 菜单。
- 顶部滚动进度条。
- `.reveal* / [data-stagger]`：进入视口渐显（IntersectionObserver）。
- `[data-count]`：数字滚动计数。
- **浮动大纲**：滚动监听高亮 + 移动滑轨 + 阅读进度 + 折叠记忆 + 移动端联动。
- **首屏探测放大镜**：光标跟随，用 CSS mask 在「土壤」中揭示隐藏线虫；触屏自动扫掠。
- **游动线虫**：`requestAnimationFrame` 驱动的扭动 SVG 带状身体，离屏暂停以省性能。
- 土层波浪分隔、视差 `[data-parallax]`、吉祥物助手（回到顶部 + 轮播提示）。
- CSS 内置 `prefers-reduced-motion` 与打印样式回退。

---

## 5. 内容

- 手写**旗舰页**：首页（招牌首屏 + 计数 + 案卷卡片 + 侦探收尾）、Description（完整范例）。
- 其余约 28 个 iGEM 必备页面由 `scaffold.py` 按注册表生成 **有主题、成结构** 的骨架：
  每页含贴合该奖项维度的小节标题、引导文字、合适组件与 `placeholder-tag` 占位，
  团队只需替换占位内容，**无需改动版式、大纲或动画**。

---

## 6. 质量校验

- `node --check js/main.js`、CSS 花括号配平校验。
- 构建后脚本校验：**无未替换的 `{{token}}`、无失效内链、无缺失静态资源**（均通过）。
- 用无头浏览器（Chromium）对首页、子页面在 **桌面 1440 / 移动 390** 截图核验：
  首屏放大镜、计数、卡片、浮动大纲与滚动高亮、移动端精简大纲均正常。
- 修复项：首屏标题下缘被裁切（`overflow` + padding）、页眉渐变标题
  因 `background` 简写重置 `background-clip` 而显示为色块（改用 `background-image`）、
  移动端大纲徽标空 `img` 破图（改内联 SVG）、吉祥物初次自动气泡遮挡（移除）。

---

## 7. 冻结前 TODO（交给团队）

1. 用真实数据 / 图表 / 引用替换所有 `placeholder-tag`。
2. 重点补全计分页面：Parts、Results、Engineering、Safety、Human Practices、
   Contribution、Attribution。
3. 重新 `build.py`，确认无 token 残留、无站外资源。
4. 关 / 开 JavaScript 两种情况、移动端宽度分别测试。
5. 在真实 iGEM GitLab Pages 上验证渲染与相对路径。

---

*生成方式：纯静态、自托管、零外部依赖 —— 既是设计选择，也是 Best Wiki 的硬性要求。*
