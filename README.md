# NKU-China Wiki v8.0 — 阶段版本

2026 NKU-China（队伍编号 6303）的官方 Wiki 源码。本次整合团队初步审查的 V8.0 内容副本，已接入 Description、Background、Experiments、Protocols、Engineering、Results、Model、Contribution、Parts、Part Collection、Members、Attributions。HP、Education、Safety、Licensing、Model 1/2 保持空白正文、副标题及信息标签，保留页面框架与导航。首页和组件目录保留原内容。所有修改直接提交 main，以 commit 记录版本。

- 仓库：https://gitlab.igem.org/2026/nku-china
- Wiki：https://2026.igem.wiki/nku-china
- 官方要求：https://teams.igem.org/6303/deliverables/wiki/requirements

## 构建与编辑

Node.js 22 和 Python 3；依赖由 package-lock.json 锁定。

```bash
npm ci --no-audit --no-fund
npm run verify
npm run dev
```

内容编辑 content/wiki/*.json，构建自动导出 Markdown。原始本地 v8.0 及 v8.0-content 副本保持原样，部署源码位于官方仓库克隆中。Tina 编辑器在 http://127.0.0.1:3000，首页在 src/home/sections/。

## 阶段发布检查

GitLab Pages 在 main 上执行 npm run build 和 npm run audit。空正文是阶段版允许的状态；构建错误、断链、缺失资源等仍会失败。npm run audit:publication 是独立的最终内容检查，空页将使它失败，但不阻止阶段版部署。不得为了通过检查伪造内容审核状态。

本次页面实际使用的图片、PDF 和字体均已引用官方 Uploads 返回的 CDN 地址：新增 91 份独立素材（54 图片、17 PDF、20 KaTeX WOFF2 字体），当前构建共引用 102 个 CDN 地址。PDF 和新增字体完整 SHA-256 与源附件一致。构建后根据页面、CSS、脚本、组件参数和 viewer 的引用移除未使用资源；实际引用的文件、字体和组件依赖保留，不按扩展名或整个目录无条件删除。新增组件后仍须迁移其实际使用的素材到官方 CDN，依赖裁剪不代替托管验收。组件示例保持本地编辑模式。其他原始素材尚未迁移，后续使用前必须完成官方上传；音视频使用 Video Universe。

保留官方 Git 历史和原始 LICENSE，页脚保留 CC BY 4.0、真实仓库链接和 AI 使用说明。科学文案、历史 AI 模型版本、具体审核者、完整素材署名及官方 Attributions Form 仍需团队完成。此版本是可访问的阶段网站，尚非最终内容验收。

部署回归检查：`npm run test:deployment`。实际使用的 CDN 映射及验证记录见 `content/cdn-assets.json`。重新验证可运行 `python3 tools/verify-cdn-assets.py --progress <完整上传记录路径> --public public --manifest content/cdn-assets.json`；HTTP、构建引用和浏览器验证分开记录。

内容填充仍有 43 条材料待补及作者终稿复核事项；初步审查与本次发布授权不替代最终科学内容验收。Protocols 的 PDF 使用浏览器原生阅读器，并提供直接打开/下载链接。旧 protocols 和 part-collection 地址保留兼容页面。
