# NKU26-wiki v7 — NemaKlear（NKU-iGEM 2026）

v7 把 30 个内页迁到了 **Astro 5**：页面内容改用 Markdown 编写，外观统一为"实心纸面正文 + 液态玻璃浮层控件"。首页（three.js 土壤故事页）保持 v6 原样。

> **请先看最后的"验证状态"一节**：这份代码还没有在真实 Astro 上构建过。

## v7.6 改动（2026-09-29）

- **HP 三层地图改为正俯视**：三层仍共用一张底图和同一个南海诸岛小图，但不再斜着，也不随鼠标倾斜。土壤计划的柱子改为从省份位置竖直升起。
- **WebGL 渲染循环加保护**（`static/js/home-nk.js`）：以前某一帧出错，整个 3D 场景会被停掉，画面冻在那一帧。现在出错会在控制台打印 `[NKU WebGL] frame error`，并继续重试；连续 30 帧出错才停，并在 `<html>` 上标 `data-webgl-error="1"`。

## v7.5 改动（2026-09-29）

- 首页 **Our work: dry lab and wet lab** 不再贴图片，而是把王昶的思路图用前端重新画出来：
  - 布局和原图一致：纸色部分是湿实验，两条淡紫色斜带是干实验；10 个步骤全部用 SVG 重画，颜色取自网站（梅紫、紫、金黄、ascr#3 蓝、ascr#18 粉）。
  - 进入这一页时，一个信号点按四章（Discover / Engineer / Sense / Interpret）依次走完全程，箭头随之画出、步骤依次点亮，约 11 秒，播放时可以随时翻走。
  - 左侧四个章节可以点击，单独重播这一章；指到任意步骤会弹出英文说明；右下角 Replay 重播全程。
  - 代码：`src/home/sections/signal.html`、`static/css/home-v6.css` 末尾的 `.lf` 部分、`static/js/home-story.js` 里的 `labFlow()`。说明文字在 `labFlow()` 的 `NOTES` 里改。
  - 原图和 v7.2 贴图版放在 `assets/unpublished/lab-sketch/`。

## v7.4 改动（2026-09-29，按学姐和 6.7 手写意见）

- 首页 **The hidden threat** 换回 v6.1 版（四个土壤方块 + 放大镜，每滚一次一个阶段）。之前 v6.2–v7.3 用的版本存在 `tools/legacy/threat-v6.7/`，里面写了换回去的方法。
- **HP 三层地图**：三层共用一张斜视底图（同一轮廓、同一南海诸岛小图），切换时只有数据层交叉淡入；静止时不重画。
- **翻页**：动画中的新一次滑动会排队执行；普通翻页 0.72 秒，土壤到世界地图 2.0 秒；分页模式关闭滚动锚定。
- **性能**：导航背景检测改为滚动停下后执行；玻璃折射贴图按尺寸缓存；颗粒层面积降到一屏。
- **导航**：两侧留白随屏宽变化；Logo 区与菜单同高、同为胶囊形；浅色页面上导航的奶油色膜更厚、模糊更强，正文不再透出来。
- **其他**：第二幕删除手电筒；全站不用衬线字体；干湿实验页换成王昶的图（颜色已按网站调整）。

## 快速开始

需要 Node.js 22 LTS（`.nvmrc` 已写好；≥ 18.20.8 也可），以及 Python 3（只用于审计）。

```bash
npm install        # 首次安装依赖
npm run dev        # 本地预览 http://localhost:4321 ，改 Markdown 后自动刷新
npm run build      # 生成 public/（iGEM 发布的就是这个目录）
npm run preview    # 预览构建结果
npm run audit      # 审计源文件与 public/（需先 build）
npm run verify     # build + audit，一步完成
```

首次 `npm install` 会生成 `package-lock.json`，**请把它提交进仓库**。CI 发现它后会自动改用更快、更可复现的 `npm ci`。

## 目录

| 路径 | 内容 |
| --- | --- |
| `src/content/pages/*.md` | 30 个内页，**平时主要编辑这里**。写法见 [`src/content/README.md`](src/content/README.md) |
| `src/figures/*.svg` | 内页用到的矢量图 |
| `src/data/nav.ts` | 顶栏、手机菜单、页脚、上一页/下一页（唯一来源） |
| `src/data/site.json` | 源码仓库地址、赞助商、友链（沿用 v6 的 `_data/site.json`） |
| `src/data/home.json` | 首页用到的链接（沿用 v6） |
| `src/components/` | `glass/Glass`；`site/`：导航、页脚、搜索、侦探；`page/`：页头、目录、翻页、页面组装 |
| `src/layouts/` | `BaseLayout`（内页外壳）、`HomeLayout`（首页外壳，等同 v6 的 `base.html`） |
| `src/styles/` | 内页设计系统：配色与尺寸、玻璃材质、导航、排版、内容块、搜索、页脚 |
| `src/scripts/` | 内页脚本：玻璃引擎、导航、目录、搜索、侦探 |
| `src/lib/remark-wiki.mjs` | Markdown 扩展语法的实现 |
| `src/home/` | 首页各段 HTML（v6 原文件） |
| `static/` | 原样复制到网站的文件：首页的 `css/`、`js/`，图片，字体 |
| `integrations/relative-links.mjs` | 构建后把站内链接改成相对地址 |
| `tools/audit_wiki_content.py` | 内容与发布审计（CI 会运行） |
| `tools/legacy/` | v6 HTML → Markdown 的一次性转换脚本（留作出处） |

## 网址

与 v6 完全一致：

- iGEM 标准页在 `/model/`、`/engineering/` 等，由 frontmatter 的 `route` 决定；
- 其他页在 `/pages/<文件名>.html`。

构建后所有站内链接都是相对地址，所以同一份 `public/` 可以直接放在 iGEM（`2026.igem.wiki/nku26-china/`）、GitHub Pages 或本地服务器上。

## 部署

- **iGEM GitLab**：`.gitlab-ci.yml` 使用 `node:22` 镜像，依次安装依赖 → `npm run build` → 审计 → 发布 `public/`，只在默认分支运行。
- **GitHub Pages**：`.github/workflows/pages.yml`，推送 `HomePage` 分支时触发。
- **源码仓库链接**：页脚在 GitLab 上自动使用 `CI_PROJECT_URL`，否则取 `src/data/site.json` 的 `source_repository_url`。

## 新增一个页面

1. 在 `src/content/pages/` 新建 `xxx.md`。复制一个现有页面再修改最省事。
2. 如果要出现在导航里，在 `src/data/nav.ts` 的 `primaryNav` / `mobileNav` / `footerNav` 里用文件名 `xxx` 引用。上一页/下一页的顺序就是顶栏从左到右的顺序。
3. 运行 `npm run dev` 预览。

## 设计与组件

- **正文**：始终在实心纸面上，Fraunces 标题 + Spline Sans 正文，每行约 70 个字符。
- **液态玻璃**：只用于浮在内容上方的控件，即顶栏、目录、目录胶囊、搜索框、页头小标签。
- **玻璃组件**：`<Glass as="div" preset="panel" class="…">…</Glass>`。`preset` 可选 `bar lens drop sheet card panel pill chip`。
  - Chrome、Edge 等 Chromium 内核浏览器显示真实折射（SVG 位移贴图，光学算法沿用 v6）。
  - Safari、Firefox 自动退回毛玻璃；也会尊重系统的"减少透明度"设置。
- **调整某处玻璃**：在 CSS 里设置以下变量。
  - `--lg-tint-bg`：底色
  - `--lg-blur`：折射下的模糊
  - `--lg-frost`：毛玻璃模糊
  - `--lg-ink`：文字颜色
- **目录**：
  - 宽屏（≥ 1100px）是左侧吸顶玻璃目录，章节大序号压在目录下方。
  - 窄屏是底部玻璃胶囊，显示当前章节和阅读进度环，点开是同一份目录。
- **搜索**：点顶栏按钮，或按 `/`、`Ctrl/⌘ + K` 打开；上下键选择，回车跳转。索引文件 `js/search-data.js` 与 v6 格式相同，首页原有的搜索继续使用它。

## 与 v6 相比

- **内容**：30 个内页全部转为 Markdown，正文与 v6 逐词一致（每页都比对过）。
- **按约定删除**：章节眉题（如 "01 · Background"，改为左侧大号序号）、页头眉题（如 "Project / Case file 01"）、卡片淡入动画。
- **修复**：
  - 内页侦探身上出现手电筒遮罩；
  - 导航收起后，正文上方的玻璃折射出乱字；
  - 内页没有了重复的旧式样式。
- **首页**：DOM 与 v6 一致（逐个元素比对 1293 个），只是导航改由组件生成。
- **审计**：v6 的规则全部保留，新增检查：未闭合的 `:::` 块、找不到的图和图标、重复的锚点。

## 验证状态

- **已做**：开发环境无法联网安装 Astro，所以我写了一个模拟器，按 Astro 的规则渲染同一套源文件（同一个 Markdown 插件、组件、样式、脚本）。在模拟结果上做了三项检查：
  - 30 页正文与 v6 逐词比对全部一致；
  - 审计通过：无坏链、无坏锚点、每页都有许可链接；
  - 桌面和手机截图人工检查。
- **未验证**：
  - 真实的 `npm install` 和 `npm run build`。第一次真实构建可能遇到模拟器覆盖不到的问题，请把报错原文发回来。
  - Safari、Firefox 下的毛玻璃观感。
  - iGEM GitLab runner 能否访问 npm（通常可以）。
- **已知问题**：Software 页的正文仍在描述 v6 的 Python 构建流程（`build.py`、`_content/`、`data-toc`），内容已经过时，需要按新架构改写。

## v7.1 更新

- 页面按内部大纲重排：Project / Wet Lab / Model / Human Practices / Team，共 16 页；Licensing & AI use 只放在页脚。可选页面放在 `src/content/optional/`，旧页面放在 `src/content/archive/`，说明见 `src/content/README.md`。
- 标准地址：Description → `/description/`，Attributions → `/attributions/`，Members → `/team/`，Experiments → `/experiments/`，Results → `/results/`。
- 全站玻璃统一使用 `src/styles/glass.css` 开头的参数：以导航栏为准，不透明度加 5%。首页导航使用同一套参数（`static/css/shell.css` 末尾）。
- 已修复：下拉菜单渐变时玻璃变灰、悬停光斑消失、手机菜单跨深浅背景时文字看不清、搜索结果多时输入框被压扁。
