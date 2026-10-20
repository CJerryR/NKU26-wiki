# subpage-opening checkpoint-02 —— 仅 hp-overview（折叠地图）

## 本轮完成
- `website/src/data/scenes/hp-overview.json` + `.atlas.json`：独立开屏，scenes.ts 自动发现并优先于 SHARED_SCENES 的 iHP 兜底，**scenes.ts 未改**。
  - 桌面 10 层：合起的地图封面在标题下方 → 四块地图从封面下摊开滑向四角（iHP / Education / Investigation / Industry）→ 中心罗盘结与四条虚线浮现 → 每块地图上弹出小场景（对话气泡、小黑板、土样袋+放大镜、信封）。
  - 手机 6 层：同一故事竖排，上两块在标题上方、下两块在底部、罗盘结居中；小场景烘焙进各自的地图块帧（composite，随源图自动重建）。
- `website/static/img/scenes/hp-overview-{desktop,mobile}.webp`：桌面 213 kB / 手机 150 kB（预算 290 / 165）。
- 素材：新道具 7 个为**程序临时图**（`assets/scenes-2d/auto/ov-*.png`）；复用已有 GPT 道具 i-bubble-a、i-edu-board、i-env-closed。atlas.json 的 style 字段写明 “auto = PROCEDURAL PLACEHOLDER, awaiting GPT redraw”，预览页右下角同样标注。没有冒称 GPT 已生成。
- 工具（`website/tools/scene-art/`）：
  - `subpage_openings.py build|pack|check|kit hp-overview`：临时图、layout、横竖图集（含 preview/hash）、取景检查、GPT 材料。
  - `subpage_gpt_ingest.py`：独立导入（只读 `gpt/subpage-openings/manifest.json`，不碰原 16 张底图 / 91 道具索引）；按文件名或剪影识别、去底、按格切图、适配原帧比例、写 `assets/scenes-2d/gpt/` 并重打图集，生成 `_report.png`；可选 `--api`。
  - `subpage_preview.py`：独立预览（真实 scene-hero.css/.ts，不需 Astro）。
- GPT 材料：`website/gpt/subpage-openings/给GPT/hp-overview/`（00-style.png 风格板、OV1.png 底稿、提示词.txt 可直接粘贴），`使用说明.txt`、`manifest.json`、`ref/OV1-mask.png`。无需改字或猜文件名。
- 预览：`preview/hp-overview/index.html`（在该目录 `python3 -m http.server` 后打开）；截图 `shots/`（1440×900、390×844、844×390，进度 0 / .35 / .65 / 1 / 出场）。

## 实际验证
- `node --test tools/tests/scenes.test.mjs`：hp-overview desktop/mobile 两项通过（层数、预算、bytes、hash、帧边界、win）。同文件其他页失败均为本聚焦包未附其图集 webp（ENOENT），与本轮无关。
- 取景检查：1440×900、1920×1080、390×844 全程相机比例 1.00（无缩放抽动）；1280×720 / 360×740 最低 0.96–0.98；矮横屏 844×390 为 0.76（走现有矮横屏分栏样式）。
- Playwright 实际滚动截图三种视口，无脚本错误；正文纸边上来前道具已完成打开。
- 导入自测：用改名、缩放、白底的模拟输出 dry-run，剪影识别 0.99，7 个道具全部切出正确尺寸。（未写入 gpt/，交付里没有假 GPT 图。）

## 未做 / 注意
- 未跑整站构建（按要求交 Codex 本地）。预览中夜空走 CDN，离线时为纯夜色；正文摘录未渲染（只读示意，正文未改）。
- `handcut.py --all` 不要用于 ov-* 道具（无 V8.7 3D 参考）；这些道具由 subpage_openings.py 管理。`compose_atlas.py` 可正常回填（composite 帧已落盘到 auto/）。
- 上线 CDN 后再给 scenes.ts 的 ATLAS_URL 补两行并记入 content/cdn-assets.json。
- Investigation、Industry 与 Project 三页按后续任务继续，方向见 docs/subpage-opening/DESIGN.md。
