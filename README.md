# NKU-iGEM 首页

此目录是原 wiki 的源码副本。首页按 B17 / A04 视觉方向、D01 叙事以及 D02–D04、B10–B14、A06–A17 的补充要求重建（2026-09-23）；保留原来的 Python 静态构建、31 个页面及真实路由。首页 3D 场景使用本地 three.js r149（`js/vendor/three.min.js`），2D 部分为 SVG 动画；不引入任何外部 CDN、字体或图片。

## 本地运行

```sh
python3 build.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

打开 http://127.0.0.1:8765/ 。修改源码后重新执行构建，不要直接编辑 public。

## 首页结构

`_content/index.html` 按故事顺序装配 `_partials/home/` 中的区段：opening → world → china → zoom → threat → clues → sensor → loop → results → closing。`nav`、`mascot`、`footer` 是由模板注入的首页外壳，`_data/home.json` 记录内容状态和详细页链接。首页专用样式在 `css/home-*.css`，脚本按以下顺序延迟加载：`vendor/three.min.js`、`home-geo.js`、`home-maps-data.js`、`home-abundance.js`、`home-core.js`、`home-opening.js`、`home-world.js`、`home-china.js`、`home-zoom.js`、`home-story.js`、`home-loop.js`。

| 部分 | 文件 | 内容 |
| --- | --- | --- |
| 01 开场 | `home-opening.js` | three.js 程序化绘制的土壤剖面；手电筒跟随鼠标、触屏或方向键；闪烁的青色线索连成轨迹，最终找到受害根系与线虫；发现后光色变为甜菜黄素金黄，左下角侦探随之变黄。「Guide my light」可自动完成搜索。 |
| 01→02 | `home-core.js` | 光斑晃动着找到第二部分标题，随后「爆开」显出世界地图；另含统一动画循环、滚动显现和侦探气泡。 |
| 02 世界 | `home-world.js` | Natural Earth 底图上的点阵陆地；点击中国进入下一视图；有来源的案例卡可翻面。 |
| 02 中国 | `home-china.js` | 丰度、大豆胞囊线虫、南方根结线虫三层 3D 叠板，随滚动或标签切换，悬停显示记录；无 WebGL 时退回 2D 地图。 |
| 02→03 | `home-zoom.js` | 逐级放大：主要农区 → 田块 → 玉米行剖面 → 土壤中的 J2 → 提问 How do nematodes infect plants? |
| 03 | `home-story.js` | 四帧感染过程与侦探放大镜（宏观/微观两层）、化学线索三选一、单一信号与信号组合对比。 |
| 04 | `home-story.js`、`home-loop.js` | 拟议的信号到颜色通路动画；按团队草图全部关系生成的研究闭环图，可追踪主循环。 |
| 05–06 | 仅 partial | 五个待证据的成果卡；光束收尾、四步路径、wiki 入口与赞助位。 |

## 数据与证据边界

- `js/home-abundance.js` 在导入经核实的 Herbivores 数据前保持为空（`status: 'pending'`），地图显示 "Verified dataset import pending"。导入后按统一的 `log10(Herbivores + 1)` 色阶显示样本像元：`python3 tools/import_herbivores.py --csv nematode_aggregated_wCovariateData.csv`（或 `--download`）。生成文件不要手改。
- 仓库未附带省界数据，省级记录显示在各省内的示意锚点上，表示文献记录而非检测地点；内容与来源见 `js/home-maps-data.js`。
- 开场信号、ascaroside 图形和通路动画均为示意，不代表浓度、比例、阈值或检测限。
- 成果卡在团队确认前保持 "Awaiting final evidence"。
- `tools/prepare_home_geometry.py` 可从 Natural Earth（中国视角）文件重新生成 `js/home-geo.js`。

## 可访问性与降级

开场支持方向键与回车；中国地图标签遵循 ARIA tabs 模式；放大镜支持方向键与 Esc；闭环节点可聚焦。系统开启「减少动态效果」时显示静态状态。无 WebGL 时开场退回 CSS 手电筒，中国叠板退回 2D 地图。

## 验证

```sh
python3 build.py
python3 tools/audit_wiki_content.py --generated --generated-root public
```

2026-09-23 的桌面（1440×900）与移动（390×844）截图审阅记录见 `docs/home-validation.md`。

## 仍待团队提供

Herbivores 数据导入；美工组矢量图（可替换 `_partials/home/threat.html` 中的场景画面，保留 macro/micro 分组即可继续使用放大镜）；世界地图案例卡背面的作物照片（需注明许可）；第五部分的正式成果；经批准的赞助机构名称与标志。本版本作为独立分支 `3d-version` 提交，仅供评审；当前线上仍使用 v3。
