# CLAUDE.md — NKU-iGEM26 Team Wiki（项目交接 / 规范）

> 这份文档既是给 AI/协作者的规范，也是**本地快速接手**用的项目说明：记录项目现状、
> 架构、已修复/待处理的问题，以及如何运行。先读「快速开始」「当前状态」「已知问题」。

---

## 0. 这是什么

- **团队**：NKU-iGEM26 Team（南开大学 iGEM 2026）。
- **项目**：检测两种植物寄生线虫的合成生物学**生物传感器**
  —— 大豆胞囊线虫 *Heterodera glycines*、南方根结线虫 *Meloidogyne incognita*。
- **wiki 主题**：**「SUBSURFACE / 地表之下」**,土壤侦探 / 田野笔记风格,围绕侦探吉祥物 + 声呐 logo。
- **目标**:Best Wiki。
- **技术**:纯静态站点(HTML+CSS+原生 JS)+ 一个 Python 构建系统,**零运行时外部依赖**。

> ⚠️ `SUBSURFACE` 是本 wiki 的设计代号/项目名占位。若你们有正式项目名,
> 在 `_partials/nav.html`(左上角小字)与各处替换即可。

---

## 1. 快速开始

```bash
# 需要 Python 3（构建脚本零第三方依赖）
python3 build.py          # 由源文件生成 index.html + pages/*.html
# 然后直接用浏览器打开 index.html 预览（无需本地服务器）
```

- 想批量重建页面骨架(很少用到):`python3 scaffold.py`(不会覆盖手写页)。
- 改完**内容/模板/样式/脚本**后,都要重新 `python3 build.py`。

---

## 2. 项目当前状态（接手必读）

**已完成(可直接用)**
- ✅ 全套设计系统 `css/style.css`、动画引擎 `js/main.js`、构建系统 `build.py`。
- ✅ 30 个页面全部生成,导航/页脚/面包屑/左侧浮动大纲齐全。
- ✅ 自托管字体、纯静态、**0 外部资源、0 未替换 token、0 失效内链**(已校验)。
- ✅ 响应式(桌面/移动)、`prefers-reduced-motion`、打印样式。

**内容完成度**
- 🟩 **首页 `index.html`**:精修完成(招牌首屏 + 统计 + 卡片 + 侦探收尾)。
- 🟩 **Description**:完整范例,展示了所有可用组件。
- 🟨 **其余 ~28 页**:有主题、成结构的**骨架**——每页有贴合该奖项维度的小节、
  引导文字和 `placeholder-tag` 占位。**需团队替换为真实内容**。

**页面清单**(对应 `_content/*.html`)
- Project:description✔、background、design、engineering-cycle、results、
  proof-of-concept、implementation、parts、contribution、safety
- Lab:wet-lab、protocols、notebook、modeling、software、hardware
- Human Practices:human-practices、integrated-hp、education、communication、
  entrepreneurship、sustainability、diversity-inclusion
- Team:team-members、advisors、instructors、collaborations、partnerships、attribution

---

## 3. 已知问题与修复记录

### 3.1 已修复（本轮）
| # | 问题 | 处理 |
| - | --- | --- |
| 1 | 旧版用 **Google Fonts CDN**(会致 Best Wiki 失格) | 字体全部下载自托管,整站零外链 |
| 2 | 旧脚手架技术债:CSS 重复、双导航、每页手抄导航 | 引入构建系统(单一可信源) |
| 3 | 首屏大标题 **g 下钩被裁切** | 入场动画结束后(`.title-done`)解除 `overflow` |
| 4 | 左上角 **logo 太小** + 名称 | logo 放大到 46px;名称改 **NKU-iGEM26 Team** + 项目名 SUBSURFACE |
| 5 | 首屏 **ghost 按钮(How detection works)在深色背景看不见** | 深色语境改浅色描边/文字 + 轻微底色 |
| 6 | 页眉渐变标题被 `background` 简写**显示成色块** | 改用 `background-image`(避免重置 `background-clip`) |
| 7 | iGEM 字样被父级 `text-transform` **强制全大写** | `.nav-brand b` 设 `text-transform:none` |
| 8 | 移动端大纲徽标**空 `img` 破图** | 改内联 SVG |
| 9 | 吉祥物**初次自动气泡遮挡内容** | 移除自动气泡(改为悬停触发) |
| 10 | 页脚校徽 GIF **透出中文文字** | 降低不透明度,作为隐约纹理 |
| 11 | 游动线虫之前偏橙偏抢眼 | 调成偏紫低透明(**保留该设计**,形似传感器波形) |

### 3.2 待团队处理（TODO）
- [ ] 全局搜索并替换所有 **`placeholder-tag`** 为真实数据/图表/引用。
- [ ] 确认/替换**正式项目名**(当前用 `SUBSURFACE` 占位)。
- [ ] 重点补全**计分页**:Parts、Results、Engineering、Safety、Human Practices、
      Contribution、Attribution。
- [ ] **团队成员/导师/合作**页:真实姓名、照片、分工。
- [ ] 各页**参考文献**(`.refs` 列表)。
- [ ] 真机测试 + **关闭 JavaScript** 测试 + 移动端宽度测试。
- [ ] 在真实 **iGEM GitLab Pages** 上验证渲染与相对路径。

### 3.3 注意事项 / 易踩坑
- 用 `background-image`(而非 `background` 简写)写渐变文字,否则 `background-clip:text` 被重置成色块。
- 大纲缺项 → 检查该节是否带 `id` 且有 `data-toc`/`data-toc-sub`,并重新 `build.py`。
- 加新页面 → 必须在 `_content/` 有对应文件,否则导航链接会 404。

---

## 4. 目录结构

```
nku/
├── index.html              # 构建产物（首页）—— 不要手改
├── pages/*.html            # 构建产物（子页面）—— 不要手改
├── _templates/base.html    # 页面骨架（占位符 token）
├── _partials/
│   ├── nav.html            # 唯一导航（含左上角名称）
│   └── footer.html         # 唯一页脚
├── _content/*.html         # ★ 页面内容（front-matter + sections）—— 在这里编辑
├── build.py                # ★ 构建脚本
├── scaffold.py             # 批量生成骨架（一次性）
├── css/style.css           # 设计系统（单文件）
├── js/main.js              # 交互/动画（单文件，原生）
├── fonts/  img/            # 自托管字体 / 本地图片
├── docs/                   # 技术手册 + 开发日志
└── CLAUDE.md               # 本文件
```

> **黄金法则**:`index.html` / `pages/*.html` 会被覆盖;一切修改都在
> `_content/`、`_partials/`、`_templates/`、`css/`、`js/`。

---

## 5. 编辑 / 新增页面

页面顶部 front-matter(HTML 注释):
```html
<!--META
title: Design
crumbs: Project / Design
eyebrow: Project · The build
heading: Designing the <span class='ink-accent'>detector</span>
sub: 一句话副标题。
meta: Discipline=Synthetic biology | Reading=7 min
-->
```
正文小节:
```html
<section id="brief" data-toc="Design brief">
  <p class="eyebrow sec-label">01 — Brief</p>
  <h2 class="section-title">What the sensor must do</h2>
  <div class="prose"><p>正文……</p></div>
</section>
```

**左侧浮动大纲会自动生成**(无需手维护):
- 带 `id` 的 `<section>` 上加 `data-toc="标题"` → 一级目录项;
- 任意带 `id` 的元素(如 `<h3>`)加 `data-toc-sub="标题"` → 二级目录项。
- 加标记 → `build.py` → 桌面浮动大纲 + 移动端精简大纲 + 滚动高亮全自动更新。

`layout: home`(仅首页)→ 整段式布局、无大纲。

可用组件(class):`.card`、`.stat`/`.stat-grid`、`.timeline`、
`.callout`(`--note/--tip/--warn`)、`.figure`、`.feature`/`.feature-list`、
`.refs`、`.split`、`.placeholder-tag`(待填占位)。

---

## 6. 设计系统(`css/style.css :root`)

- 浅色面:`--paper #f7f2e8`/`-2`/`-3`;深色面:`--loam #191222`/`-2`/`-3`。
- 文字:浅底 `--ink`/`-2`/`-3`;深底 `--cream`/`-2`/`-3`。
- 强调:`--iris #6e4fb8`(主)、`--iris-bright`、`--amber #e2a23c`(CTA)、`--clay`。
- 字体(自托管):`--font-display` Fraunces / `--font-body` Spline Sans / `--font-mono` Space Mono。
- 区块:`.band--paper` / `.band--paper-2` / `.band--loam`,内用 `.wrap` 限宽。

---

## 7. 动画系统(`js/main.js`,全部尊重 `prefers-reduced-motion`)

导航(隐藏/显现、移动抽屉、mega、当前页高亮)、顶部进度条、`.reveal*`/`[data-stagger]`
进入视口渐显(模糊淡入)、`[data-count]` 数字滚动、**浮动大纲滚动高亮/滑轨/进度/折叠**、
首屏入场、**探测放大镜**(光标跟随揭示隐藏线虫 + 琥珀光标点)、**游动线虫**(rAF)、
视差、**磁吸按钮**、**卡片光标光斑**、吉祥物助手。

- 加计数器:`<span data-count="157">0</span>`(小数加 `data-decimals="1"`)。
- 加视差:元素加 `data-parallax="0.15"`。

---

## 8. 合规红线（务必遵守 = Best Wiki 前提）

iGEM **禁止 wiki 运行时加载任何站外资源**(Google Fonts、CDN、外链图片),违反可能失格。
- 字体本地 `@font-face`;无任何站外 `<script src>`/`<link href>`;图片全在 `img/`。
- 每页完全独立静态、无运行时 fetch。
- **若要引库:把它 vendoring 进仓库,绝不要加 CDN。**

---

## 9. 部署到 iGEM

1. 推送构建产物与资源到团队 **iGEM GitLab**(`https://gitlab.igem.org/2026/<team>`):
   `index.html`、`pages/`、`css/`、`js/`、`fonts/`、`img/`。
2. **保持相对路径不变**(站点可能在子路径)。
3. 推送前先 `python3 build.py`,并在真实 GitLab Pages 上验证。

---

## 10. 接手 & 冻结前清单

- [ ] 跑通 `python3 build.py`,确认无 `{{TOKEN}}`、无站外资源。
- [ ] 替换全部 `placeholder-tag`;补全计分页与团队信息。
- [ ] 关/开 JavaScript、移动端宽度测试。
- [ ] iGEM GitLab Pages 验证。

> 详细手册见 `docs/technical-manual.md`(+ `.docx`);重构历史见 `docs/development-log.md`。
