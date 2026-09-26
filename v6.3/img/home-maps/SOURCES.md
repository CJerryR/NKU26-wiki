# NKU-iGEM 地图区段底图来源

生成日期：2026-09-22。全部文件是地理底图，不含线虫观测、丰度、发病或分布数据。

## 已集成的文件

- `world-base.svg`：`viewBox="0 0 1000 450"`，米白背景、深紫陆地，无行政国界。
- `china-base.svg`：`viewBox="0 0 600 500"`，深紫背景、浅色陆地，保留所用原始数据的全部岛屿多边形和 9 条海上指示线。
- `world-china-entry.svg`（可选生成，不随首轮页面分发）：与 `world-base.svg` 使用完全相同的坐标系；透明背景、中国地理范围填色，可作世界图入口的叠加层。真正的焦点、点击和可访问名称应由父页面提供。
- `manifest.json`：版本、原始 SHA-256、投影、范围、几何计数、生成文件 SHA-256。
- `generate_maps.py`：只需 Python 3 标准库的可复现生成脚本。
- `map-geometry.json`：可选生成，不随首轮页面分发。含预编译 SVG path 字符串及投影参数，供构建时读取并嵌入父页面 SVG。不是科学数据接口；不必部署它，也不必在页面运行时请求它。

预览图与上游原始大文件均不随网页分发。生成脚本默认将源文件缓存于系统临时目录的 `nku-home-map-originals/`，可用 `--cache-dir` 指定；只有静态 SVG 由页面加载。

## 上游来源与许可

来源是 Natural Earth 维护者仓库的固定 `v5.1.2` release。该 release 各主题有各自的版本号，因此 release 号与单主题版本号不同是正常情况。

| 文件 | 主题版本 | 固定原始下载地址 |
| --- | --- | --- |
| 世界陆地，1:50,000,000 | 4.0.0 | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson |
| 中国视角行政区范围，1:10,000,000 | 5.1.1 | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries_chn.geojson |
| 中国海上指示线，1:10,000,000 | 5.1.0 | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_boundary_lines_maritime_indicator_chn.geojson |

官方网站的 [Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) 明确将网站发布的栅格和矢量地图数据置于公共领域，允许修改和电子传播，无须另行许可。建议页面注明：**底图：Natural Earth（Public domain）**。

相应官方介绍页：

- [50m Land](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-land/)：陆地面，含主要岛屿。
- [Admin 0 – Countries point-of-views](https://www.naturalearthdata.com/blog/admin-0-countries-point-of-views/)：包含 China POV 下载；按相应国家的 de jure 视角组织几何。
- [10m Cultural Vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/)：包含 maritime indicators China supplement。
- [Disputed boundaries policy](https://www.naturalearthdata.com/about/disputed-boundaries-policy/)：解释默认边界与 POV 版本的区别。

## 几何选择与边界

中国底图筛选 China POV 文件内的 `ADM0_A3 ∈ {CHN, HKG, MAC}`，全部统一填色；台湾已经包含在这一版 `CHN` 几何内，不能再叠加默认版 `TWN`。最终保留 99 个陆地多边形、99 个 ring、15,185 个陆地顶点；另有 9 条海上指示线、135 个线顶点。可见小点是源数据中的岛屿几何，不是装饰或观测点。

世界底图保留 1,421 个多边形、1,422 个 ring、60,669 个顶点。未做轮廓平滑或删岛；SVG 仅把投影后的坐标量化到 0.001 viewBox 单位，使用相对 path 命令减少文本体积。

中国陆地源范围：经度 `[73.602256, 134.772579]`、纬度 `[9.679511, 53.569444]`。海上指示线延伸至 `3.401132°N`。中国画布包含整个源范围，没有把南海部分裁掉或移入与主图不同坐标系的插图。

“保留完整源范围”不等于重新核定每一座岛礁或声明此图是官方标准地图。Natural Earth 是概化地理底图，不替代统筹后续选定的标准地图；官网也说明其精度和内容有局限。若后续更换底图，须同时替换投影参数与入口几何。

## 投影与前端数据点映射

两张底图都是等距圆柱 / equirectangular，标准纬线 0°。输入顺序为 `[longitude, latitude]`（地理经纬度），不是屏幕坐标。它不是等面积投影，不能按屏幕面积推断丰度。

世界图（1000 × 450）：

```js
const x = (longitude + 180) * 2.5 + 50;
const y = (90 - latitude) * 2.5;
```

世界图两侧各留 50 个 viewBox 单位。中国底图（600 × 500）：

```js
const x = (longitude - 72) * 8.5 + 19.5;
const y = (56 - latitude) * 8.5 + 12;
```

HTML `<svg>` 应保持相同 `viewBox`，叠加的数据点使用相同公式，随 SVG 一起缩放。不要在 CSS 中对底图额外单独裁切、拉伸或使用 `object-fit: cover`。GCJ-02 数据不能未经转换就作为 WGS84 经度纬度与此底图叠加。

默认颜色与共享首页样式对齐：世界背景 #f5eedc、无数据陆地 #d7c4b8；中国背景 #170e23、无数据陆地 #c6afd8。颜色只表示底图形状，不表示科学指标。默认颜色可直接使用；父页面若**内联** SVG，可通过 `--map-ocean`、`--map-land`、`--map-outline` 或 `--map-china-entry` 调整。`<img src>` 加载的 SVG 不继承父页面的 CSS 自定义属性，因此已提供可直接显示的固定颜色 fallback。

## 复现与验证

```sh
python3 img/home-maps/generate_maps.py --download
# 可选输出中国入口层和构建用 SVG paths：添加 --extras
```

此命令重新下载固定版本数据，逐一核对脚本内置 SHA-256，再生成相同文件；无 `--download` 则复用并核对源文件缓存。运行网页不需要网络、Python、地图库或 CDN。

已核对原始数据的 feature、polygon、ring 和顶点计数，渲染检查世界轮廓、中国大陆、海南、台湾、岛屿和南海指示线均可见；所有投影后坐标落在对应 viewBox 内。中国入口叠加层与世界图共用投影。没有生成任何科学标记或示例热区。
