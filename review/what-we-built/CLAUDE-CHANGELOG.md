# What we built 素材替换 — checkpoint 01

基线：main 2dd2e28c990c2ceb2ce63c22d923247c4297295f 相关源码子集。ZIP 内路径均相对仓库根目录。

## 改动文件

| 文件 | 改动 |
|---|---|
| `static/images/home/what-we-built/wwb-*.<hash>.svg`（新增 6 个） | 由 `materials/originals/wwb.svg` 按卡片拆分出的独立 SVG |
| `src/home/sections/explore.html` | 仅替换 `.ex__built` 块；时间线与 Explore the wiki 不变 |
| `src/data/home.json` | 新增链接键 `model-docking`；`content` 各条状态未改 |
| `static/css/home-round1.css` | 原位替换旧卡片规则（基础、短屏、≤1100、≤700） |
| `static/css/home-mobile.css` | 原位替换 ≤959 与 ≤360 的旧卡片规则 |
| `static/js/home-story.js` | 新增 `builtArt()`，由 `built()` 调用；其余函数未改 |

## 素材处理
- prepared/ 中六个文件各约 880 KB，都是整份原图只换了 viewBox，合计 5.3 MB。因此改为从原图中只取各卡片自己的元素（按 Chromium 计算的包围盒分配），并裁剪未用到的 defs、去掉 Inkscape 元数据。
- 嵌入的 PNG 角色图转为 WebP（q82），保留原分辨率。另外原图页面外有一张无关图片和一个图层组（`image1-9`、`g30`），已排除。
- 六张画布统一为 90.8×77 mm：顶部与面板对齐，下方留出空间，容纳伸出面板的图形（Prediction 的蛋白尾巴、两张 HP 的侦探角色）。
- 六个文件合计约 210 KB，文件名带内容哈希，便于缓存。
- 无 font-family 的文字原本会在浏览器中回退为衬线体，与 PNG 参考不符，现改为圆体无衬线字体栈。`Bradley Hand ITC` 改为手写体字体栈。

## 排版
- 三组：Wet Lab / Dry Lab / Human Practices，每组两张卡片，组标题下有一条横线，标明这两张属于同一组。
- 卡片结构：标题、一行说明、团队插图。插图自带深色面板和伸出部分，所以卡片本身不加背景、不裁切、不固定高度；插图贴卡片底边，同行的面板因此对齐。
- 宽屏与分页模式下六张排成一行。≤959 px 时三组上下排列，每组两张仍并排。
- 分页模式下插图高度上限为 `max(104px, 29vh - 96px)`，让这一段与旧卡片（29vh）一样随视口高度缩放，整页仍能放进一屏。
- 标题右侧注明："Drawings of each workstream, not experimental data."
- 去掉了旧的 "Result to come" 标签。说明文字只描述工作主题，不涉及性能、阈值、特异性或实地就绪。

| 卡片 | 说明文字 | 链接键 |
|---|---|---|
| Strain construction | Receptor and reporter parts in yeast | results |
| Test strip development | Designing a paper strip format | engineering |
| Prediction | Docking ascr#3 and ascr#18 to receptors | model-docking |
| Modeling | Equations for the yeast signal relay | model |
| Survey | Asking what users need from a test | human-practices |
| Education | Explaining nematodes beyond the lab | education |

## 加载与滚动衔接
- 图片 `loading="lazy"`，并写明 `width`/`height`，不会产生布局位移。
- 页面 load 之后在空闲时改为 eager 提前拉取，分页跳转或快速滚动到这里时图片已就绪。
- 解码前透明，完成后淡入（0.35 s）。开启减少动态时不加淡入；脚本失效时图片直接显示。
- 移除全部 `data-art3d`/`data-art`。CSS 另外隐藏卡片内除 `<img>` 以外被注入的元素。

## 验证（本地测试页：只含 explore 段 + 四个首页样式表 + home-core/home-story）
- 原始 SVG 渲染：六张画布四边各约 10 px 透明余量，没有图形被截断。
- 分页模式整段溢出（新/旧，单位 px，同一测试页）：

| 视口 | 旧 | 新 |
|---|---|---|
| 1920×1080 | 0 | 0 |
| 1536×864 | 0 | 0 |
| 1440×900 | 0 | 0 |
| 1280×800 | 0 | 0 |
| 1366×768 | 7 | 4 |
| 1280×720 | 0 | 0 |
| 1280×640 | 0 | 0 |

  1366×768 下新旧都有几像素溢出，这是测试页缺少 style.css 造成的，新版不比旧版差。
- 1440 普通滚动，以及 1024 / 820 / 390 / 360 / 320 宽度：无横向溢出，同一行面板顶部和底部对齐，三组组标题对齐。
- 加载：DOMContentLoaded 与 load 时没有请求插图；空闲后 6 个请求全部完成，`is-loading-art` 被移除。
- 键盘焦点轮廓可见（#c79bff）；减少动态模式下 transition 为 0s。
- 六个 `HOME_URL` 键都在 home.json 中，顺序与 TASK.md 一致；段内无嵌套 `<section>`，不影响 `homeSearchEntry` 的正则；`home-story.js` 通过 `node --check`。

## 修复记录（本轮）
- 1366×768 卡片被撑宽到 434 px：原因是 `home.css` 在 `max-height:820px` 下给分页模式的 `.bt__card` 设了 `aspect-ratio:1.75`。之前 round1 里抵消它的规则在替换时被删掉了，现已用新类名恢复。
- 1280×720 溢出 10 px：插图上限改为随 vh 缩放后解决。
- 三组组标题错位：Wet Lab 的标题换行，撑高了其他组的标题行。已固定组内行为 `auto 1fr`。

## 局限 / 需确认
1. **`model-docking` 的 source 页面 id 未经核实**，按 TASK 写的是 `model-docking`。如果实际 id 不同，`homeData()` 会在构建时直接报错，不会生成错链接；改 home.json 一处即可。
2. **未做整站构建**：本包只是源码子集。`/images/home/what-we-built/...` 与 HomeLayout 的 `/css/...` 一样是根绝对路径，需在真实构建中确认 relative-links 会改写 `<img src>`。另外 `tools/restore-original-images.mjs` 与 `finalize-stage-assets.mjs` 不在包内，未确认它们是否处理 static/images。如果部署要求图片放在 static.igem.wiki，需要上传后替换这 6 个 src。
3. **翻页脚本未测**：home-pager.js 不在包内，分页模式只用 `html.is-paged` 加 100vh 模拟，真实翻页动画中的衔接需要在完整站点上看一遍。
4. **字体**：原稿的 Bradley Hand ITC / Arial Rounded MT Bold 无法随 SVG 图片加载。macOS/iOS 自带这两款字体，表现接近原稿；其他设备会用替代字体，"Nematodes" 等字样外观会不同。要完全一致，需要团队在 Inkscape 里对这几段文字执行"对象转路径"后再给我。
5. 两张 HP 原图角色 PNG 底部有几处极淡的杂点（原稿自带），未修改。
6. 未删除 explore.html 顶部的 `bt-sprite`（旧卡片用的 defs），因为其他段落不在包内，无法确认没有引用。确认后可以删除。
