# 技术手册 · Technical Manual
### NKU iGEM 2026 Wiki —「Subsurface」

本手册说明本 wiki 的架构、构建方式、页面编写规范、设计系统、动画系统与部署流程，
便于团队在赛季中持续维护，并在 Wiki Freeze 前安全交付。

---

## 1. 总览

- **类型**：纯静态网站（HTML + CSS + 原生 JS），**无任何运行时外部依赖**。
- **主题**：「Subsurface」土壤侦探 / 田野笔记，围绕侦探吉祥物与声呐 logo。
- **核心特性**：单一可信源的 Python 构建系统；子页面左侧**自动生成的浮动大纲岛**；
  自托管字体；丰富但克制、且全部支持 `prefers-reduced-motion` 的动画。
- **合规**：满足 iGEM 对 Best Wiki 的硬性要求 —— 不加载任何站外资源。

---

## 2. 目录结构

```
nku/
├── index.html              # 构建产物（首页）—— 不要手改
├── pages/*.html            # 构建产物（子页面）—— 不要手改
├── _templates/base.html    # 页面骨架（占位符 token）
├── _partials/
│   ├── nav.html            # 唯一导航（mega 菜单）
│   └── footer.html         # 唯一页脚
├── _content/*.html         # 页面内容（front-matter + sections）—— 在这里编辑
├── build.py                # 构建脚本：组装为静态 HTML
├── scaffold.py             # 批量生成 _content 骨架（一次性）
├── css/style.css           # 完整设计系统（单文件）
├── js/main.js              # 全部交互/动画（单文件，原生）
├── fonts/                  # 自托管字体（woff2）
├── img/                    # 本地图片（logo、吉祥物、校徽）
├── docs/                   # 本手册 + 开发日志
└── CLAUDE.md               # 给 AI/人类的仓库说明
```

> **黄金法则**：`index.html` 与 `pages/*.html` 是**构建产物**，会被覆盖。
> 所有修改都应发生在 `_content/`、`_partials/`、`_templates/`、`css/`、`js/`。

---

## 3. 构建系统

### 3.1 日常流程

```bash
python3 build.py        # 修改内容/模板/样式/脚本后运行
# 然后用浏览器打开 index.html 预览
```

`build.py` 会：
1. 读取 `_templates/base.html`、`_partials/nav.html`、`_partials/footer.html`；
2. 遍历 `_content/*.html`，解析 front-matter 与正文；
3. 对子页面：生成页眉（面包屑/标题/副标题/元信息）、**自动生成浮动大纲岛**与移动端精简大纲、
   包裹为 `.layout`（大纲 + 内容两栏）；首页（`layout: home`）则直接使用整段式布局；
4. 用 token 替换骨架（`{{TITLE}} {{DESC}} {{NAV}} {{FOOTER}} {{BODY}} {{P}}`），
   其中 `{{P}}` 为相对路径前缀（首页为空，子页面为 `../`）；
5. 先清空再写出 `index.html` 与 `pages/*.html`。

### 3.2 脚手架生成

```bash
python3 scaffold.py     # 按注册表生成/重建 _content 骨架
```

`scaffold.py` 内含一个页面注册表（`PAGES`），为每个 iGEM 必备页面生成
**有主题、成结构**的骨架。它**不会覆盖**`KEEP` 集合中的手写页面（当前为
`index`、`description`）。如需新增页面，在 `PAGES` 中添加条目后运行即可。

---

## 4. 页面编写规范

### 4.1 Front-matter（文件顶部的 HTML 注释）

```html
<!--META
title: Design
crumbs: Project / Design
eyebrow: Project · The build
heading: Designing the <span class='ink-accent'>detector</span>
sub: 标题下的一句话副标题。
meta: Discipline=Synthetic biology | Reading=7 min | Status=Living document
-->
```

| 字段 | 含义 |
| --- | --- |
| `title` | 浏览器标题与大纲标题 |
| `crumbs` | 面包屑（用 `/` 分隔，首页自动加在最前） |
| `eyebrow` | 页眉小标签 |
| `heading` | 大标题（可含 `<span class='ink-accent'>` 渐变强调） |
| `sub` | 副标题 |
| `meta` | 元信息行，`键=值` 用 `|` 分隔 |
| `layout` | 设为 `home` 则用整段式布局且无大纲（仅首页） |

### 4.2 正文小节

```html
<section id="brief" data-toc="Design brief">
  <p class="eyebrow sec-label">01 — Brief</p>
  <h2 class="section-title">What the sensor must do</h2>
  <div class="prose"><p>正文……</p></div>
</section>
```

### 4.3 浮动大纲：自动生成（重点）

按用户要求，子页面左侧需有**固定浮动的大纲岛**。本系统**自动**完成，无需手维护：

- 在带 `id` 的 `<section>` 上加 `data-toc="标题"` → 生成**一级**大纲项；
- 在任意带 `id` 的元素（如 `<h3>`）上加 `data-toc-sub="标题"` → 生成**二级**大纲项。

`build.py` 按出现顺序收集这些标记，生成桌面浮动大纲岛与移动端精简大纲；
`main.js` 负责滚动高亮、移动滑轨、阅读进度条、折叠记忆与移动端联动。
**新增一节 = 加一个标记 + 重新 `build.py`**。

---

## 5. 设计系统（`css/style.css`）

### 5.1 配色 token（`:root`）

| 类别 | 变量（示例） |
| --- | --- |
| 表面（浅） | `--paper #f7f2e8`、`--paper-2`、`--paper-3` |
| 表面（深） | `--loam #191222`、`--loam-2`、`--loam-3` |
| 文字（浅底） | `--ink`、`--ink-2`、`--ink-3` |
| 文字（深底） | `--cream`、`--cream-2`、`--cream-3` |
| 强调 | `--iris #6e4fb8`（主）、`--iris-bright`、`--amber #e2a23c`（CTA）、`--clay` |

### 5.2 字体

| 用途 | 变量 | 字体 |
| --- | --- | --- |
| 展示标题 | `--font-display` | Fraunces（可变衬线） |
| 正文/UI | `--font-body` | Spline Sans |
| 标签/数据 | `--font-mono` | Space Mono |

### 5.3 常用区块与组件

- 区块底色：`.band--paper` / `.band--paper-2` / `.band--loam`；区块内用 `.wrap` 限宽。
- 组件：`.card`、`.stat` / `.stat-grid`、`.timeline`、`.callout`（`--note/--tip/--warn`）、
  `.figure`、`.feature` / `.feature-list`、`.refs`、`.ticker`、`.split`。
- **`.placeholder-tag`**：标记「待团队填写」的占位；冻结前请全局搜索并替换。

---

## 6. 动画系统（`js/main.js`）

全部模块均检测并尊重 `prefers-reduced-motion`，CSS 亦有打印样式回退。

| 模块 | 说明 |
| --- | --- |
| nav | 下滚隐藏/上滚显现、移动端抽屉、mega 菜单（移动端点击展开）、当前页高亮 |
| scrollProgress | 顶部阅读进度条 |
| reveal | `.reveal* / [data-stagger]` 进入视口渐显（IntersectionObserver） |
| counters | `[data-count]`（可配 `data-decimals`）数字滚动 |
| toc | **浮动大纲滚动高亮 + 滑轨 + 进度 + 折叠记忆 + 移动端联动** |
| heroSequence | 首屏入场动画 |
| detectionLens | **首屏探测放大镜**：光标跟随，用 CSS mask 揭示隐藏线虫；触屏自动扫掠 |
| swimmingNematode | **游动线虫**：`requestAnimationFrame` 扭动 SVG；离屏暂停省性能 |
| parallax | `[data-parallax]` 视差 |
| mascot | 吉祥物助手：回到顶部 + 悬停提示气泡 |

> **添加计数器**：`<span data-count="157">0</span>`，小数加 `data-decimals="1"`。
> **添加视差**：给元素加 `data-parallax="0.15"`（数值为强度）。

---

## 7. 自托管字体与「无 CDN」原则（合规关键）

iGEM **禁止 wiki 运行时加载任何外部资源**（含 Google Fonts、CDN、外链图片），
违反可能**丧失 Best Wiki 资格**。因此：

- 字体以 `woff2` 形式置于 `fonts/`，在 `css/style.css` 顶部用 `@font-face` 声明，
  并对正文/标题字体做了 `<link rel="preload">`（同样指向本地）。
- 全站无任何指向站外的 `<script src>` / `<link href>`；`main.js` 为零依赖原生 JS。
- 所有图片本地化（`img/`）。
- 每页为完全独立静态 HTML，**无运行时 fetch**，本地直接打开与 GitLab Pages 均可渲染。

> 若将来要引入库：**把它 vendoring 进仓库**，绝不要加 CDN 标签。

---

## 8. 部署到 iGEM

1. 在团队的 **iGEM GitLab** 仓库（`https://gitlab.igem.org/2026/<team>`）中，
   推送构建产物与资源：`index.html`、`pages/`、`css/`、`js/`、`fonts/`、`img/`。
2. **保持相对路径不变**（站点可能部署在子路径下）。
3. 每次推送前先 `python3 build.py`。
4. 在真实 GitLab Pages 上验证渲染、字体加载与内部链接。

---

## 9. 排错

| 现象 | 排查 |
| --- | --- |
| 页面出现 `{{TOKEN}}` | 多半是 `base.html` 改坏或新 token 未在 `build.py` 替换 |
| 字体不生效 | 检查 `fonts/` 路径与 `@font-face` 的相对路径；确认未被 CDN 覆盖 |
| 大纲缺项 | 该节是否带 `id` 且有 `data-toc` / `data-toc-sub`；改后是否重新 `build.py` |
| 渐变标题显示为色块 | 用 `background-image`（而非 `background` 简写）以免重置 `background-clip` |
| 内链 404 | 确认目标 `_content` 文件存在；`nav.html` 中每个链接都应有对应内容文件 |
| 动画在录屏/截图中不出现 | 多为 IntersectionObserver 尚未触发或开启了 reduced-motion，属正常 |

**完整性自检（构建后建议执行）**：搜索是否有 `{{`、检查内链与静态资源是否存在、
关/开 JavaScript 与移动端宽度分别测试。

---

## 10. Wiki Freeze 前检查清单

- [ ] 用真实数据/图表/引用替换全部 `placeholder-tag`。
- [ ] 重点补全计分页面：Parts、Results、Engineering、Safety、Human Practices、
      Contribution、Attribution。
- [ ] 重新 `build.py`，确认无 token 残留、无站外资源。
- [ ] 关/开 JavaScript、移动端宽度分别测试。
- [ ] 在真实 iGEM GitLab Pages 上验证。

---

*附：仓库说明见 `CLAUDE.md`；重构历史与理由见 `docs/development-log.md`（开发日志）。*
