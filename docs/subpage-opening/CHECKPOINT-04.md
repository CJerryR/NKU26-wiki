# subpage-opening checkpoint-04（累计：六页开屏源码 + 全部 GPT 材料）

## 本轮新增：Project 三页（替换旧开屏，按最新作者稿）
- **description —— 双传感器试纸**：种植者站在田边（种植前的决定）→ 土下根系与线虫 → 两类信号（橙色珠链 / 淡紫菱形）分别升向两条酵母试纸，黄色读数深浅不同 → 远处显微镜与样品管表示专业确认。桌面 7 层、手机 6 层。只作示意：无对勾、数值或判定。
- **engineering —— 四个目标迭代站**：四个 DBTL 小循环（生物传感器 / 读数信息化 / 可用检测形式 / 面向农业的改进）从四角向中心靠拢；第五个“下一轮”循环随后出现但缺一段，表示系统整合尚未完成。桌面 5 层、手机 5 层。
- **contribution —— 三层抽屉**：抽屉柜依次拉开：生物零件与实验资源（基因块、冻存管、方案册）、计算方法与模型（对接、MD、ODE、经济模型）、教育与参与资源（绘本、问卷、土样）。桌面、手机各 4 层。
- 道具：新程序临时图 pd-* / pe-* / pc-*；循环站与抽屉是“临时底板 + 已有 GPT 道具”的合成帧，GPT 若把整件画出（gpt/ 下同名文件）会自动优先于合成。
- GPT 材料：`gpt/subpage-openings/给GPT/` 下累计 6 份（OV1、IV1、IN1、PD1、PE1、PC1），manifest 按 id 累加；原 `gpt/manifest.json` 与 16 张素材未包含、未改动。

## 必要的接入改动（仅此两处共享文件）
- `src/data/scenes.ts`：删除 description / engineering / contribution 的 6 条旧 CDN 图集地址（旧图配新帧会错乱），改走本地 `?v=hash`；重新上传 CDN 后再补回。
- `tools/scene-art/pages.py`：`write()` 遇到 note 写明由 subpage_openings.py 生成的布局时跳过，避免旧脚本覆盖新开屏。

## 打包修正
- 本包用 Python zipfile 打包（脚本 `tools/scene-art/subpage_checkpoint.py`）：完整保留 `website/gpt/subpage-openings/…` 目录，中文文件名带 UTF-8 标志；包内不含 `website/gpt/manifest.json`。02/03 的扁平化与文件名编码问题已在此修正。

## 实际验证（打包时）
- `node --test tools/tests/scenes.test.mjs`：六页 desktop/mobile 共 12 项通过（其余页失败仍为聚焦包缺 webp）。
- 取景（相机比例）：三页在 1440×900、390×844 基本全程 ≥0.98；Description 在 1920×1080 稳定 0.92（不抽动）；矮横屏 ≥0.77。
- Playwright 实际滚动截图（shots/project-three-desktop-mobile.png，1440×900 与 390×844，进度 0/.35/.65/1/出场）：三页无脚本错误，道具在纸边上来前打开完毕，标题与道具不重叠；正文摘录（只读）衔接正常。
- 截图后修正：Engineering 手机首帧上方两个循环站贴近面包屑，起始位置下移至 y -470。

## 说明
- 正文未改；Overview 的程序底稿保留，GPT 回填由你本地进行，本包不声称已生成。
- 未跑整站构建；面包屑与矮横屏标题按你的本地修复为准。
