# home-opening 素材来源

| 文件 | 来源原图 | 处理 | 用途 |
|---|---|---|---|
| opening-foreground.webp (167996 B, sha256 c73c0ba0d55a…c18d) | references/03-opening-materials/assets/opening-foreground.png，1586×992 RGBA，sha256 c0a21df816a2…27c6；陈的Figma开场画面所用团队美工图 | Pillow 转 WebP（quality 88，alpha_quality 90，method 6），尺寸不变，未抠图、未重绘、未AI处理；透明区与原图一致（alpha平均差0.0015） | 首屏前景：树木、地面与根系 |
| opening-sky.webp (89982 B, sha256 286c59c2d24c…21d4) | references/03-opening-materials/assets/purple-background.png，1586×992 不透明，sha256 6a0f36192a56…d98d | Pillow 转 WebP（quality 72，method 6），尺寸不变；均色保持（24.5/12.5/31.4），压缩后颗粒变柔，由着色器补回细颗粒 | 首屏紫色夜空底图 |

手机竖屏的“两组树拼接”由 home-opening.js 运行时在画布中裁切拼接（左 0–21.5%、右 56.5–100%，接缝交叠 1.8% 渐隐），不另存文件。

两张均为团队美工素材，非第三方授权；正式发布前须经 iGEM Uploads 上传并按 HOME-OPENING-ASSETS.csv 替换引用。

## AI 延展土壤（2026-10-17）

`soil-extension-ai-v1.png`：用户明确要求生图扩展第二屏土壤，使用 OpenAI 内置 image_gen，以团队 opening-foreground.webp 为风格和向下延展参考生成。紫褐土层、装饰根系与碎石仅作艺术背景，不是显微照片、实验数据或生物学证据。首屏两张原素材未被重绘或替换。运行时只替换地下背景，线虫、病根、信号和引导交互保留。

提示词及本地验证记录：工作区 outputs/soil-extension-20261017/。素材当前本地引用，发布前仍待官方 CDN 迁移与团队审核。
