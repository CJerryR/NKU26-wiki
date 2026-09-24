# 3D v3 版本说明

## 分支与来源

- Git 分支：`3Dv3`
- 基线：`3Dv2`
- 本版素材：2026-09-24 收到的 `files (2).zip`，源码包为 `NKU26-wiki-HomePage-source-2026-09-24-r4.zip`
- 随包审阅图：`docs/screenshots/homepage-review-desktop-1440-round3.jpg`、`docs/screenshots/homepage-review-mobile-390-round3.jpg`、`docs/screenshots/homepage-review-mobile-390-round3-followup.jpg`

## 相对 v2 的主要变化

- **合并地图与飞行段落。** 中国丰度、大豆胞囊线虫、南方根结线虫三个图层共用地图舞台；滚过第三层后，镜头从同一张地图继续飞向农田和土壤，不再另起一张地图。图层、面板与镜头位置按视口避让。
- **细化叙事和信息密度。** 首屏只留主标题，删去重复的滚动提示和段落导语；精简各段说明，并保留数据未导入、结果待团队确认等证据边界。
- **改进长方体序列。** 四个感染过程场景先总览，再放大到单帧；继续纵向滚动时横向切换后续场景，放大镜交互保留。
- **改善手机阅读。** 竖屏土壤近景放大 J2；吉祥物在下滑阅读时收起、向上滚动或回到顶部后出现，减少对固定面板和说明文字的遮挡。
- **保留降级路径。** WebGL 不可用或三维场景构建失败时，中国图层回退到 2D 地图，飞行段落回退到 SVG 版本。

主要实现位于 `js/home-china.js`、`js/home-zoom3d.js`、`js/home-zoom.js`、`js/home-core.js` 及对应的 `_partials/home/` 和 `css/home-*.css` 文件。完整过程记录见 [`home-validation.md`](home-validation.md)。

## 构建与本地预览

在源码根目录执行：

```sh
python3 build.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

本地构建生成 31 个页面；`public/` 是忽略的构建产物。随包截图保存在 `docs/screenshots/`，用于对照桌面端和手机端布局。

## 数据与已知限制

- Herbivores 丰度数据尚未导入；地图不显示虚构的丰度结果或色阶。
- 地图锚点表示文献或调查记录，不表示精确采样地点或整省受害。
- three.js 场景为程序化示意，不代表实测地形、浓度或实验结果。
- 审阅记录中的截图和性能数据来自软件渲染；真实 GPU、Safari/Firefox 与手机帧率仍需在目标设备复核。
- 本版本推送到 `3Dv3` 源码分支供评审，没有部署到 GitHub Pages；线上发布仍由 `gh-pages` 管理。
