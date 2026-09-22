# 地图区段交付

实施位置：当前仓库 `nku-wiki/`。只修改统筹分配的地图文件，另经统筹批准新增 `js/home-maps-data.js`。旧 `/Users/cjrmacbook/Documents/iGem-NKU26-wiki` 未被本任务修改。

## 结构与接口

- `_partials/home/maps.html`：世界图、三张中国图、静态待接入状态、独立图例/来源位置和原生锚点。
- `css/home-maps.css`：仅地图局部样式，使用 `css/home-shared.css` 变量与工具类。
- `js/home-maps-data.js`：可替换科学数据配置 `window.NKUHomeMapsData`。首轮四层均为 `pending`，`records` / `sources` 为空，未创建任何科学值、热区或随机点。
- `js/home-maps.js`：校验、投影、绘图及信息卡。`window.NKUHomeMaps.validateLayer(layer, config)` 返回 `{ready, errors}`；`refresh()` 重新读取配置并清理旧图。无运行时 fetch 或外部脚本。
- `img/home-maps/world-base.svg`、`china-base.svg`：本地真实几何底图；来源、原始 SHA-256 和复现程序位于同目录。

统筹按 `home-maps-data.js → home-maps.js` 加载。`#global-story` → `#china-story` → `#hidden-threat` 均为原生入口；精确标题 `#global-story-title` 为 **A global story beneath our feet**。`.home-world-stage[data-world-map]` 是光圈揭示的稳定容器；地图脚本不监听滚动，不控制遮罩、body overflow 或全局路由。

构建与服务沿用 `python3 build.py` 和 `python3 -m http.server 8765 --bind 127.0.0.1 --directory public`，统一 `public/` 由统筹构建。

## 内容口径

按统筹确认的首轮可替换方案：全球 Herbivores 丰度、中国同指标丰度、*Heterodera glycines* 已报道分布、*Meloidogyne incognita* 已报道分布。D02 的 0913 HP 工作支线解释与 D01 科学分布版本冲突仍需内容负责人最终核定；本交付不宣称科学内容已定稿。

没有把材料中的省份清单直接转成正式设色，也没有上屏未核查的经济损失数字。两张丰度图共享同一单位和全局分级，物种分布采用各自分类图例。未着色不等于未分布，丰度不等于病害严重程度或经济损失。

## 数据结构

`schemaVersion: 1`。每张图由固定 `id` 与 DOM 的 `data-map-layer` 匹配。状态只在 `status: 'ready'`、`reviewed: true` 且完整校验通过时展示记录；缺值、单位不符、来源缺失、非法几何或色阶不完整均保持待接入。删除配置或图层后 `refresh()` 会清除原来显示的记录，避免留下过期“已核验”数据。

```ts
type Source = {
  id: string;
  title: string;
  url: string;             // http(s) 原始论文、数据集或调查记录
  year: string;            // 发表/发布年份；与观测年份分别保留
  version: string;         // 数据版本、DOI版本或具体表号
  license: string;         // 数据使用许可
};
type Record = {
  id: string;
  region: string;
  year: string;            // 观测或报告年份/范围，不自动等同发表年份
  dataType: string;        // 实测、汇总像元、预测、文献分布记录等
  sourceId: string;
  geometry: Point | Polygon | MultiPolygon; // GeoJSON，WGS84 [经度,纬度]
  geometrySourceId?: string; // 面几何必须提供；点填写时也必须可解析
  value?: number;          // 仅丰度，非负有限数；0 有效，null 不等于 0
  species?: string;        // 分布图必须与该层物种完全相同
  category?: string;       // 分布图必须匹配该层 categories 的 id
  hosts?: string;
  note?: string;           // 样点/调查/地域范围限制
};
```

面几何需闭合环，允许多面和内环；跨国际日期变更线的环应先在数据准备阶段切分。省份数据应使用有来源的省级面，不用随意设定的省会坐标伪装成采样点。本轮底图未附省界，待正式分布记录到位后由数据提供者同时提供许可明确、标识匹配的省级 GeoJSON。

丰度共同引用 `scaleId: 'herbivores-global'`。在 `scales['herbivores-global']` 中提供经确认的 `bounds`（严格递增的**原始丰度值**边界）、`colors`（六位十六进制，长度等于边界数减一）及 `reviewed: true`。第 n 档为 `[bounds[n], bounds[n+1])`，最后一档包含上界；越界记录被拦截，不静默压入末档。两张图不分别自动分级。若团队选择 log10(Herbivores+1) 分级，应离线确定边界，再换算回原始丰度值传入，图例保持真实单位。

每张物种图独立提供 `categories: [{id, label, color}]`。分类文字必须说明含义（如已有报告），不能把报告区域写成省域全部受侵染。来源和文本用 DOM textContent 输出，不接受 HTML 或 javascript: 链接。

投影参数与本地底图绑定；替换底图时需同时更换 SVG、投影和尺寸，不能只换图片或只改 CSS 裁切：

- 世界 1000×450：`x=(lon+180)*2.5+50`，`y=(90-lat)*2.5`。
- 中国 600×500：`x=(lon-72)*8.5+19.5`，`y=(56-lat)*8.5+12`。
- 不把 GCJ-02 坐标直接作为 WGS84 叠加。

## 底图来源

来源为 Natural Earth 固定 `v5.1.2` 发布的 50m land（主题 4.0.0）、10m China POV countries（主题 5.1.1）和中国海上指示线（主题 5.1.0）。[许可](https://www.naturalearthdata.com/about/terms-of-use/)为 Public domain，允许修改和电子传播；[China POV 说明](https://www.naturalearthdata.com/blog/admin-0-countries-point-of-views/)来自官方。

世界图为无国界陆地底图。中国从 China POV 合并 CHN/HKG/MAC，台湾已包含在 CHN 中，保留 99 个陆地多边形、15,185 个顶点以及 9 条海上指示线。没有裁掉源数据南海范围，没有手绘补岛，也没有借用 A10 的美国地图。完整性指保留所选源的全部几何，不将其称为中国官方标准地图；正式发布前由统筹核定地图展示版本。

详细下载地址、原始 SHA-256、几何数量和生成方法见 [SOURCES.md](../img/home-maps/SOURCES.md) 与 [manifest.json](../img/home-maps/manifest.json)。网页运行离线自足；只有重制素材时才需要下载固定版本源文件。

## 逐项待补给统筹

1. **口径核定**：三张中国图最终保留 D01 科学分布，还是改为 D02 HP 支线。
2. **全球丰度**：原始/汇总数据文件、Herbivores 字段、WGS84 坐标、单位确认、采样/汇总/预测类型、观测年份、版本、原始引用与许可；不能用总线虫数替代植物食性类群。
3. **中国丰度**：可追溯至同一全球数据版本的中国子集，以及统一全球色阶/分级；不单独按中国重新归一化。
4. **大豆胞囊线虫**：核定物种和省级/地点记录、地区标识、调查/文献年份、原始来源/许可、寄主、对应几何及几何来源。未给统一各省损失口径，不拆分全国损失。
5. **南方根结线虫**：同上，严格限 *M. incognita*；新疆等补充记录须各自引用。不混入水稻根结线虫，不把发病率或检出比例当减产率。
6. **可选危害案例与作物照片**：若需要加案例标记，再给真实地点、寄主、口径明确的损失证据、年份和可复用图片许可。当前未制作案例点。
7. **省界与正式地图版本**：正式区域设色需许可明确的区域 GeoJSON 和与记录一致的标识；统筹确认当前 Natural Earth POV 是否保留或更换标准底图。

## 交互与验证

当前四层为空数据；浏览器中的“数据待接入”是真实状态。来源折叠说明与跨区段锚点不依赖 JavaScript。数据准备好后支持鼠标悬停预览、点击固定、Enter/Space 打开、Escape/关闭按钮关闭并恢复焦点；手机可点选图形或使用 44px 高的原生记录选择器。信息卡列地区、值/分类、单位、数据类型、年份、来源和可选寄主，避免只靠颜色理解。

2026-09-22 已完成：

- 两份 JavaScript 通过 Node 语法检查。
- 独立最小 DOM harness **36 项通过**：18 项数据验证，18 项渲染与交互。包含 null 条目、缺值/越界、错误物种/字段/投影、缺来源、pending 隐藏记录、移除/重复图层清空、悬停、点击、Enter/Space、Escape、选择器、关闭与焦点恢复。复测由实现任务再次执行通过。
- 底图原始 SHA-256、最终 SVG SHA-256 通过；重复生成的两张 SVG 与 manifest 完全一致。全部顶点位于画布范围内。
- 地图 partial 的 ID 唯一、四个信息卡容器完整、所有本地素材存在、无空链接。
- 已在整页真实浏览器中确认四层均 `pending`、科学记录数均为 0；世界→中国入口正常，控制台无错误/警告。
- 本任务实际浏览器检查：390px 手机宽度，`body.scrollWidth === innerWidth === 390`；四张底图加载成功；中国丰度和大豆胞囊图的来源面板可展开，标题、单位、待接入状态与来源说明可读。统筹另已完成 320px 整页无横向溢出检查。
- 独立临时 `TEST ONLY` 页的真实浏览器检查：桌面点击点记录，正确显示数值 **0**、单位、类型、年份和来源，关闭按钮有效。此页与交付页面隔离，测试结束关闭；没有向正式配置写入测试记录。
- 完全不加载脚本的临时检查页：四图、标题、图例与待接入状态保留；原生来源 details 可展开；进入后续侵染锚点有效。未将此检查等同于整页开场动画的无脚本检查。

测试数据只位于临时测试环境，绝不写入交付数据配置。最小 harness 是模拟 DOM 检查，不将其写成真实手机测试；首轮没有真实科学记录可供验证其内容正确性。
