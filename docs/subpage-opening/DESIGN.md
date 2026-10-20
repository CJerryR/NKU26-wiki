# 子页开屏设计说明（subpage-opening，V10.2.10 / 96c2653）

本轮范围：HP Overview（hp-overview）、HP Investigation（hp-investigation）、HP Industry（hp-industry）三个新增页的独立开屏。
Project 三页（Description / Engineering / Contribution）下一轮继续，范围不取消，方向沿用 final-plan.txt。
正文、科学数据、路由、导航、引用、审核状态一律不动。

## 1. 接入方式（沿用现有 SceneHero，不改机制）

- 每页新增 `src/data/scenes/hp-*.json`（布局）+ `hp-*.atlas.json`（帧坐标）+ `static/img/scenes/hp-*-{desktop,mobile}.webp`（横/竖图集）。
- `scenes.ts` 的 glob 自动发现新 JSON；页面自身的布局优先于 `SHARED_SCENES` 的 iHP 兜底，所以 **scenes.ts 不需要改**。新图集先走本地路径 `/img/scenes/<file>?v=<hash>`，上传 CDN 后再给 `ATLAS_URL` 补一行并记入 `content/cdn-assets.json`。
- 约束（现有测试）：桌面 ≤10 层、手机 ≤6 层；图集预算桌面 290 KB、手机 165 KB；atlas.json 里的 hash 必须与 webp 文件一致。
- 坐标系与现有页相同：桌面画布 1600×900、手机 900×1600，原点在中心，y 向下；`from`=进度 0，`to`=进度 1，`win`=该层运动所占的进度区间。

## 2. 三页故事与打开方式

### 2.1 Overview —— 折叠地图
HP 总入口。一张折好的田野地图放在标题下方；向下滚动时，地图摊开成四块，分别滑向四角，每块露出一条 HP 路径的小场景，中心留下四条虚线路线交汇的罗盘结。

| 进度 | 画面 |
|---|---|
| 0 | 合起的地图封面（带系绳的纸片）居中偏下，标题在上方 |
| 0.05–0.35 | 封面轻抬、缩小、淡出；四块地图从封面下方露出 |
| 0.15–0.80 | 四块地图分别滑向左上 / 右上 / 左下 / 右下，带少许旋转 |
| 0.40–0.95 | 每块上的小场景依次弹出：对话气泡（iHP）、小黑板（Education）、放大镜与土样袋（Investigation）、信封与资料夹（Industry） |
| 0.55–1.00 | 中心罗盘结与四条虚线浮现，标题上移缩小，接正文 |

层（桌面 10）：map-cover、panel-ihp、panel-edu、panel-inv、panel-ind、knot（罗盘结与虚线）、v-ihp、v-edu、v-inv、v-ind。
层（手机 6）：map-cover、knot、四块 panel（小场景烘焙进各自的 panel 帧）。
四块地图由 GPT 一次画成一整张“摊开的地图”，导入工具按折痕切成四块，保证四块笔触、纸色一致。

### 2.2 Investigation —— 田野路线
一条虚线小路从左向右（手机为自上而下的 S 形）铺开，一个小放大镜标记沿路前进，依次点亮四个站点：博物馆展柜 → 访谈气泡 → 大棚农场 → 取土器与土样袋。人物只作无脸木偶式的背影或剪影，不表示人数，不对应真实身份。

| 进度 | 画面 |
|---|---|
| 0 | 小路起点与卷起的田野笔记本在标题下方 |
| 0.05–0.95 | 放大镜标记沿小路由左向右移动 |
| 0.10–0.40 / 0.30–0.60 / 0.50–0.80 / 0.65–0.95 | 四个站点按顺序从路边“立起”（缩放 + 淡入 + 轻微回正旋转） |
| 0.60–1.00 | 标题上移缩小，路线终点的土样袋落在正文入口上方 |

层（桌面 8–9）：path、notebook、museum、interview、greenhouse、corer、marker（+ 可选远景 field 复用）。
层（手机 6）：path（竖版）、museum、interview、greenhouse、corer、marker。

### 2.3 Industry —— 信封到洽谈
复用已有的开合信封（i-env-closed / i-env-open）：信封打开，邀请函和演示资料飞出展开，最后落到一张洽谈桌上，桌两侧出现双方对话气泡。
**不画**工厂、流水线、认证章、货架商品、握手签约、钱币，避免暗示量产、已商业化或达成合作；这仍属应用探索与交流。

| 进度 | 画面 |
|---|---|
| 0 | 合着的信封居中，标题在上方 |
| 0.05–0.30 | 合信封淡出、开信封淡入（同位叠化） |
| 0.20–0.65 | 邀请函上升展开；演示资料册向右滑出 |
| 0.45–0.90 | 洽谈桌从下方升起；资料落到桌面 |
| 0.60–1.00 | 左右两个对话气泡先后弹出；标题上移缩小，接正文 |

层（桌面 8）：env-closed、env-open、letter、deck、table、talk-left、talk-right（+ 可选纸张飘片）。
层（手机 6）：env-closed、env-open、letter、deck、table、talk（双气泡合为一帧）。

## 3. 衔接与适配

- 末帧在下沿留出安静带，与现有 ground strip 和正文起始处衔接，避免道具压正文首段。
- 长标题（尤其 “Industry Engagement and Support”）按 SceneHero 现有标题缩放规则验证，必要时在本页 JSON 的 `title.fontSize` 单独调小，不改全局样式。
- 手机竖版独立构图，不是桌面版缩小；矮横屏走现有 scene-framing 取景。
- 减少动态效果（prefers-reduced-motion）沿用 SceneHero 现有降级：直接显示末帧。

## 4. 素材与真实性

- 画风以首页风格板 `style/00-style.png` 和已有 91 个 GPT 道具为准：纸纹、赭黄蜡笔刮痕、轻微体积感、无脸木偶式人物、透明底单个道具。
- 本轮先用**程序临时图**把三页做成可预览工作版，图上和清单里都明确标注 “PLACEHOLDER / 程序临时图”，不冒称 GPT 已生成。
- GPT 材料包：每张新图给构图底稿（灰度剪影 + 尺寸）、风格参考拼板、可直接粘贴的完整提示词、输出文件名对应表；独立 manifest（`gpt/subpage-openings/manifest.json`），不覆盖原 16 张表 / 91 道具索引。
- 自动导入：把 GPT 返回的图放进收件目录即可，脚本按文件名或顺序识别、去底、裁边、切分（Overview 四块地图）、缩放、写入道具目录并重打图集、更新 hash 和 provenance。
- 装饰插画不充当实验结果或产业落地证据；所有新增道具在 provenance 中记为 decorative。

## 5. 分阶段交付

1. checkpoint-01：本设计说明。
2. checkpoint-02：三页 layout、程序临时图、横竖图集、独立预览页。
3. checkpoint-03：GPT 底稿 / 风格参考 / 提示词 / 对应表 / 自动导入工具与自测。
4. 下一轮：Project 三页（沿用 final-plan 方向）。
