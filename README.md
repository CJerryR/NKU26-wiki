# NKU-iGEM 2026 Wiki（首页重做 v3）

纯静态站点。`python3 build.py` 把 `_content/`、`_partials/`、`css/`、`js/`、`img/` 拼装到 `public/`，不依赖任何框架或 npm。

## 本地运行

```bash
python3 build.py
cd public && python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

> 请用 http 服务打开。直接双击 `file://` 时，字体和部分脚本会被浏览器拦截。

## 首页结构

### 翻页方式：一页一页走

宽屏且使用鼠标或触控板时（`pointer:fine`，宽 ≥ 960px，高 ≥ 600px，且未开启“减少动态效果”），首页按页翻动，由 `js/home-pager.js` 控制：

1. 滚到某一页会**吸附**，整页对齐视口。
2. 在这一页**再滚一下**，播放这一页的动画（一页可以有多步）。
3. 动画播完后**再滚**，才进入下一页。向上滚则逐步倒退。

一次滚动手势只算一步，触控板的惯性尾巴会被忽略。动画较长时，再做一次明确的滚动会让它直接播完。键盘 ↓ / PageDown / 空格前进，↑ / PageUp 后退，Home / End 跳到首尾。右侧的小圆点对应每一页，当前页的圆点随步骤逐渐填满，点击可直接跳页。底部的小鼠标图标表示这一页还有动画没播。

手机、平板、窄窗口和“减少动态效果”下恢复原生滚动：`opening` 和 `threat` 变成高分区加吸顶画面，按滚动位置切换步骤；其他分区进入视口一半时自动播放。

每个分区在自己的脚本里用 `NKUH.scene(id, {...})` 登记：

| 字段 | 作用 |
|---|---|
| `steps` | 到达后还有几步动画，默认 0 |
| `step(i, dir)` | 播放到第 i 步，返回动画时长（毫秒）；返回 -1 表示这一步没有可见变化，直接继续 |
| `set(i, dir)` | 不播动画，直接显示第 i 步的状态（跳页、倒退进入时用） |
| `enter(dir, info)` | 到达时调用，返回需要等待的毫秒数；`info.cut` 表示无滚动直接切入 |
| `ff()` | 把正在播放的一步立刻播完 |
| `cutIn` | 从上一页进入时不滚动，直接切入（`world` 用它接住手电筒） |
| `tall` | 原生滚动时这个分区占几个视口高 |

现在各页的步骤：

| 分区 | 步骤 |
|---|---|
| `opening` | ① 镜头下沉到土里 ② 光自动找到线虫（已经找到就跳过）→ 下一页 |
| `world` | 无步骤。到达时手电筒最后照到的位置就是光圈中心，光圈从那里扩大露出地图 |
| `threat` | 5 个阶段、4 步：虫卵 → 孵化 → **释放蛔苷** → 侵入根系 → 植株发黄 |
| `traces` | ① 两类线虫同时释放信号，飞向中间团簇，然后出现项目假设 |
| `combo` | ① 两个信号球合在一起 |
| `signal` | ① 信号沿链条传到颜色输出 |
| `loop` | ① 14 条关系线依次画出 |

### 各分区

`_content/index.html` 按下表顺序拼装 `_partials/home/*.html`。每个分区上的 `data-nav-label` 是导航收缩后显示的章节名，`data-tone` 决定导航用深色还是浅色玻璃。

| 分区 id | 片段 | 脚本 | 内容与交互 |
|---|---|---|---|
| `opening` | `opening.html` | `home-opening.js` | 首屏超大标题，下方幼苗随鼠标轻摆。下沉到土里之后，**只有手电筒照到的圆形区域可见，其余全黑**；分子只在光里出现，找到过的会留下很淡的光点。找到线虫后光变暖黄，出现 "Nematodes are behind it!" 和关键词飘带。当前光斑的位置和半径写在 `NKUH.lastLight`，供下一页使用。 |
| `world` | `world.html` | `home-maps.js` | 转场（沿用第一版逻辑）：从手电筒最后停留的位置开一个同样大小的光圈，光圈扩大露出世界地图，遮罩颜色与上一页的黑暗一致，看起来是同一束光照亮了整页；US$173 billion 随之计数。米色纸面上是水彩晕染式丰度色块；悬停大洲高亮，点击后信息卡在鼠标旁翻转弹出；案例标记会脉冲；点击中国跳到中国地图。 |
| `china` | `china.html` | `home-maps.js` | 三张并列无边框地图：点阵（点跟随光标放大，悬停显示数值）、轮廓拼贴（两类线虫按省份标注，可筛选）、网格 3D 柱（视角随鼠标倾斜，柱子升起）。点任意一张放大查看，南海诸岛为右下角附图。 |
| `threat` | `threat.html` | `home-threat.js` | 按 B12 侵染循环草图做成一个连续场景：从整幅土壤剖面开始，镜头横向跟着幼虫移动、推近根系、再拉回植株。幼虫一路释放 ascr#3 / ascr#18（蓝、粉两色分子），这一步是重点，说明卡片换成紫色描边并标出两种分子；随后侵入根系、形成取食位点和根瘤，最后植株发黄、新虫卵回到土里。左下角的说明卡随阶段横向滑动，上方 5 段进度条。 |
| `traces` | `traces.html` | `traces()` | 滚动一步：两侧线虫同时释放信号粒子，飞向中间的 ascr#3 / ascr#18 团簇，随后出现"项目假设"。悬停单侧仍可单独释放。 |
| `combo` | `combo.html` | `combo()` | 滚动一步两球自动合拢；也可以手动拖动。合拢时两侧文字错开，不再互相遮挡。 |
| `signal` | `signal.html` | `signal()` | 五个插画节点，信号链依次点亮；中间是金字塔式放大动画；最后烧瓶变黄并给出示意 RGB 读数，可用滑杆调节。 |
| `loop` | `loop.html` | `loop()` | 重新按 B11 草图排成 5 列 × 3 行的网格，连线全部横平竖直，"模拟分析"和"预测"从节点下方绕行，标签带底色描边，节点、连线、文字互不遮挡。草图里没有的 "Docking & MD" 已去掉。滚动一步依次画出 14 条关系线；可按三个问题筛选，悬停高亮，"Play the loop" 播放一圈。 |
| `built` | `built.html` | `built()` | 6 张深色动态插画卡，分别链接到对应页面。 |
| `explore` | `explore.html` + `footer.html` | `explore()` | 大号吉祥物加 "Follow the signals!"，8 宫格链接，四步路径光效，米色页脚。 |

脚本加载顺序由 `build.py` 决定：`home-geo.js`（地理点阵，生成文件）→ `home-land.js`（世界陆地轮廓，生成文件）→ `home-abundance.js`（可选，见下文）→ `home-core.js`（公共工具：`NKUH.$`、`NKUH.onView`、`NKUH.say` 等）→ `home-pager.js`（翻页）→ `home-opening.js` → `home-maps.js` → `home-threat.js` → `home-story.js`。样式全部在 `css/home.css`。

首页用到的图片在 `img/home/`：

- `nematode.png`：官方线虫形象（A06）的透明抠图，已修正眼白被误抠的问题。
- `mascot-lg.png`：高清吉祥物裁切。
- `soil-print.png`：版画土壤图（A07）转成的浅色透明纹理，叠在深色背景上用。

替换时保持文件名和大致宽高比即可，代码不用改。

## 全站导航（液态玻璃）与搜索

相关文件：`_partials/nav.html`、`css/shell.css`、`js/shell.js`，所有页面共用。

- **形态**：去掉了紫红底，拆成左右两个悬浮的透明玻璃岛。向下滚动超过 420px 后，右岛收缩成当前章节名；鼠标悬停或键盘聚焦时重新展开；向上滚动恢复。
- **折射实现**：参照开源文章 kube.io《Liquid Glass in the Browser》的物理做法。玻璃边缘是凸面超椭圆（squircle）截面，按斯涅尔定律（折射率 1.5）逐点计算垂直入射光落到背景上偏移了多少，得到位移贴图，交给 SVG `feDisplacementMap`；R/G/B 三个通道略微错开形成色散。
- **边缘高光**：不再用 CSS 白色描边和渐变边框（上一版边缘过亮的原因）。高光单独算成一张贴图：只在边缘约 3px 内，强度随边缘法线与左上方光源的夹角变化，对侧只有很弱的反光，再叠到折射结果上。CSS 只留 0.5px 的细轮廓；Safari / Firefox 的磨砂降级也换成了更柔和的描边。
- **调参**：`js/shell.js` 里的 `bar / lens / drop / sheet / card` 五组预设。`bezel` 是折射边缘宽度，`shift` 是边缘处最大偏移像素，`aberration` 是色散，`spec` 是高光强度，`blur` 和 `sat` 是背景模糊和饱和度。
- **浏览器差异**：真实折射目前只在 Chrome / Edge 生效。Safari 和 Firefox 不支持在 `backdrop-filter` 里用 SVG 滤镜，会自动显示为磨砂玻璃，这是浏览器能力限制。
- **深浅色**：导航下方分区写 `data-tone="light"` 时自动换成浅色玻璃和深色文字。
- **搜索弹窗**：与首页一致的深色玻璃、无衬线字体和青色强调色。
- **吉祥物**：固定在左下角（`_partials/mascot.html`），脚本里可调用 `window.NKUDetective.say('文字', 毫秒)`。

与上一版相比修好的问题：旧的液态玻璃滤镜只保留了红色通道，导航整体偏红；现在三个通道都正确合成，是真正透明的玻璃。

## 需要团队替换的内容

以下内容目前是版式占位或示意，页面上已有对应的小字提示。替换后记得删掉提示。

1. **世界 / 中国丰度数据**
   新建 `js/home-abundance.js`，内容如下：
   ```js
   window.NKU_ABUNDANCE = [
     { lon: 116.4, lat: 39.9, value: 120 },   // value = 原始丰度（个体数 / 100 g 干土）
     // ...
   ];
   ```
   文件存在时 `build.py` 会自动加载它。页面按 log10(x+1) 着色，世界和中国共用同一色标，"Sample colour layer" 提示会自动隐藏。不提供时使用 `js/home-maps.js` 顶部 `SPOTS` 生成的示意色块。
2. **大洲信息卡与案例标记**：`js/home-maps.js` 中的 `CONT`（每个大洲的线虫、作物和一句说明）和 `CASES`（案例标记坐标）。现在的文字是通用背景知识，请由团队核对或替换成有出处的表述。
3. **中国三张地图**：同在 `js/home-maps.js`。
   - `PROV`：各省会经纬度，用来放置符号。
   - `SCN` / `RKN`：大豆胞囊线虫、南方根结线虫的分布省份列表，按 HP 组整理的资料修改。
   - `SITES`：3D 柱图的候选采样地区；柱高目前取自示意丰度，接入真实数据后自动更新。
   - 素材里没有省界数据，所以没有画省界，只用国界轮廓加省会位置的符号，避免画出看起来像省界但不准确的线。拿到可靠的省界数据后可再加。
4. **插画**：`threat` 的整幅场景（土壤、根系、虫卵、幼虫、分子、根瘤、植株）由 `js/home-threat.js` 用代码绘制，页面上不再有占位说明，但仍是等 HP 美术组分镜时的临时画面。阶段文字在 `threat.html`，镜头位置在 `key()`，幼虫路线在 `PATH0`。信号链五个节点的插画在 `signal.html` 的内联 `<svg>` 里。美术定稿后可直接替换，JS 只依赖外层容器的 `data-*` 属性。
5. **闭环图**：节点和连线定义在 `home-story.js` 的 `loop()` 里（`N` 为节点，紧随其后的数组为连线，`seq` 为一键播放的顺序）。改文字或增减节点都在这里完成。
6. **RGB 读数**：`signal` 分区的颜色和 RGB 数值是设计目标示意，不是测量结果。有实测数据后替换。
7. **成果卡**：`built.html` 里每张卡的 "Result to come"，结果确认后换成一句结论。
8. **赞助 logo**：放进 `footer.html` 的 Support 区域。

## 重新生成地理数据（一般不需要）

```bash
python3 tools/build_home_geo.py   # 生成 js/home-geo.js 和 js/home-land.js，数据来自 Natural Earth（公有领域）
```

## 无障碍与降级

- 翻页模式只在宽屏加鼠标 / 触控板时启用；其他情况保持原生滚动（见上文）。搜索弹窗、中国地图放大层打开时，滚轮和方向键交还给弹窗。

- 系统开启"减少动态效果"时，自动播放的动画会跳过或直接显示终态（`NKUH.reduced`）。
- 触屏设备（`NKUH.coarse`）会改用点按提示；悬停类交互在手机上的手感还需要真机再过一遍。
- 手机端已确认没有横向溢出。

## 提交前验证

```bash
python3 build.py
python3 tools/audit_wiki_content.py --generated --generated-root public
```

审查脚本会拦截占位词、编辑指令和过度声明，提交前应为 PASS。

## 本版文件变更

v3（本次）：

- 新增：`js/home-pager.js`（翻页与步骤）、`js/home-threat.js`（侵染循环场景）。
- 重写：`_partials/home/threat.html`、`loop.html`；`home-story.js` 里的 `loop()`；`js/shell.js` 的位移贴图与高光。
- 修改：`home-opening.js`（下沉改为动画驱动、光外全黑、导出光斑位置）、`home-maps.js`（光圈从手电筒位置展开）、`home-story.js`（traces / combo / signal 接入步骤）、`css/home.css`、`css/shell.css`、`build.py`（脚本列表）。
- 精简文字：删掉 china 段落、combo / signal 的编号和标语、combo 右侧说明、traces 脚注、loop 段落和脚注、threat 分镜与占位说明、开场的"Psst"气泡和跳过按钮。

v2：

- 新增：`_partials/home/` 下 11 个分区片段，`js/home-core.js`、`home-opening.js`、`home-maps.js`、`home-story.js`、`home-land.js`，`img/home/` 三张图。
- 重写：`css/home.css`；`css/shell.css`、`js/shell.js`、`_partials/nav.html`（双岛导航、滤镜修复、搜索弹窗样式）。
- 修改：`build.py`（首页脚本列表、`home-abundance.js` 可选加载）、`tools/build_home_geo.py`（新增世界陆地轮廓生成）。
- 删除：上一版首页脚本 `js/home.js`，以及不再使用的旧分区片段。
