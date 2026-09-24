# 3D v2 版本说明

## 分支与来源

- Git 分支：`3Dv2`
- 基线：`3d-version`（3D v1）
- 本版素材：2026-09-24 收到的 `files (1).zip`
- 评审图：`docs/screenshots/homepage-review-desktop-1440-2026-09-24.jpg`、`docs/screenshots/homepage-review-mobile-390-2026-09-24.jpg`

## 本版内容

- 将「中国主要农区 → 田块 → 土壤与 J2」的逐级放大段落扩展为 three.js 三维场景；无 WebGL 或 3D 场景初始化失败时保留 SVG 降级路径。
- 调整世界地图的点阵显现、聚光灯揭示和标题/统计动效，并保持未导入核实数据时不显示丰度图例。
- 保留 31 个静态页面及原有 wiki 路由，Three.js 使用仓库内的本地文件。
- 详细页面和视觉验证记录见 [`home-validation.md`](home-validation.md)。

## 构建与本地预览

在源码根目录执行：

```sh
python3 build.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

本次整理该版本时，静态构建生成了 31 个页面。`public/` 是构建产物，按仓库 `.gitignore` 忽略；分支保存源码和审阅记录。

## 数据与适用范围

- Herbivores 丰度数据尚未导入；地图显示的是待导入状态。
- 三维场景是程序化示意，不代表实测地形、浓度或实验结果。
- 评审截图可用于快速查看布局；真实 GPU、Safari/Firefox 和手机上的帧率仍需目标设备复核。
- 本分支仅保存版本源码，不会触发当前 GitHub Pages 发布流程；线上站点继续由 `gh-pages` 提供。
