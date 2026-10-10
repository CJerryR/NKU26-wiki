# NKU-China Wiki v8.0 — 阶段源码

本仓库是 2026 年 NKU-China（队伍编号 6303）的官方 Wiki 源码。此版按团队要求先保存为阶段版本，后续继续补充内容。当前技术构建可通过，但**尚未通过正式提交内容检查**。

- 官方仓库：https://gitlab.igem.org/2026/nku-china
- 阶段分支：`codex/v8.0-stage`
- 正式 Wiki：https://2026.igem.wiki/nku-china
- 官方要求：https://teams.igem.org/6303/deliverables/wiki/requirements

## 本地构建与编辑

需要 Node.js 22 和 Python 3。依赖已锁定在 `package-lock.json`。

```bash
npm ci --no-audit --no-fund
npm run verify
npm run audit:publication
```

`verify` 执行构建和技术审计；`audit:publication` 在团队文案及审核未完成时应返回失败。二者不能混作同一项验收。

内容从 `content/wiki/*.json` 经 `tools/export-tina.mjs` 导出到 `src/content/pages/*.md`。修改内容时优先编辑 JSON 或 Tina 编辑器；直接改导出 Markdown 会在下次构建时被覆盖。

```bash
npm run dev
```

Tina 本地编辑预览在 `http://127.0.0.1:3000`，编辑器端口为 4101。首页段落在 `src/home/sections/`；导航和页脚来源分别为 `src/data/nav.ts`、`src/data/site.json`。`static/` 包含现有本地预览所需的脚本、样式和素材。

## GitLab 检查与发布

阶段分支不部署正式 Wiki。本地构建生成 19 个页面并执行技术审计；iGEM 官方模板注明 Runner 只运行 `main` 分支，因此阶段分支不排队创建 CI 任务。默认分支的 Pages 发布从源码构建，并需通过 `audit:publication`。不得把 `public/`、`node_modules/`、令牌或本地环境变量提交到仓库。

本版替换官方 Flask 初始模板，使用 Astro 5 + Tina 的现有 v8.0 实现；保留官方 Git 历史和原始 `LICENSE`。页脚指向本队真实 GitLab 仓库并保留 CC BY 4.0 许可。

## 正式发布前仍需完成

- Attributions、Members、Part Collection、Model 1、Model 2 正文为空。
- 其余 12 页的现有 AI 草稿未获得团队定稿及人工审核；逐页状态见 `content/wiki-provenance.json`。不得仅为通过检查而改写审核状态。
- 图片、字体和文档等需迁移到官方 Uploads CDN，并核验实际返回地址。当前迁移未完成；本地资源地址仍保留。
- 组件展厅的本地 MP4 示例需移到 Video Universe 或停止在正式站点提供该演示。
- 团队需核实历史 AI 模型的具体版本及实际审核者，并完成独立官方 Attributions Form。

官方素材入口：https://teams.igem.org/6303/deliverables/wiki/uploads

AI 协助实现和检查，不得编造实验结果、测量、引用、访谈、贡献或科研证据。科学文案及证据的最终审核由团队完成。此阶段版本不代表 Wiki Freeze 前的正式验收通过。
