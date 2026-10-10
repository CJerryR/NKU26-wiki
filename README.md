# NKU-China Wiki v8.0 — 阶段版本

2026 NKU-China（队伍编号 6303）的官方 Wiki 源码。按团队要求保留首页，17 个内页和组件目录仅保留页面框架与导航，正文为空，等待后续回填。所有修改直接提交 main，以 commit 记录版本。

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

内容编辑 content/wiki/*.json，构建自动导出 Markdown。原始本地 v8.0 的文案保留在上传目录之外，可以逐页回填。Tina 编辑器在 http://127.0.0.1:3000，首页在 src/home/sections/。

## 阶段发布检查

GitLab Pages 在 main 上执行 npm run build 和 npm run audit。空正文是阶段版允许的状态；构建错误、断链、缺失资源等仍会失败。npm run audit:publication 是独立的最终内容检查，空页将使它失败，但不阻止阶段版部署。不得为了通过检查伪造内容审核状态。

首页和页面框架使用的图片、字体已改为官方 Uploads 中实际返回的 CDN 地址。构建后移除未使用的本地图片、字体、文档和演示音视频；组件演示仅保留在本地编辑模式。其他原始素材尚未迁移，后续使用前必须完成官方上传；音视频使用 Video Universe。

保留官方 Git 历史和原始 LICENSE，页脚保留 CC BY 4.0、真实仓库链接和 AI 使用说明。科学文案、历史 AI 模型版本、具体审核者、完整素材署名及官方 Attributions Form 仍需团队完成。此版本是可访问的阶段网站，尚非最终内容验收。
