# NKU-China Wiki v8.0 — 阶段版本

2026 NKU-China（队伍编号 6303）的官方 Wiki 源码。以 Claude checkpoint16 与 local17 合并版本为基线，已在本地 Tina 整合第二轮 Description、Contribution、Engineering、Education、Results、Experiments、Safety 七页供稿。Protocols 并入 Experiments，旧地址保留兼容入口。HP 中文版总稿仅归档；HP、Licensing、Model 1/2 仍待后续供稿。团队终稿审核状态保持待审核。首页和新版 Tina 组件沿用基线。所有修改直接提交 main，以 commit 记录版本。

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

## 2026-10-16 第二轮本地内容

本轮新增媒体18份（17张原图与1份PDF）目前使用本地编辑路径，原始SHA已核对，正式发布前须迁移官方Uploads；前述CDN数量是本轮基线记录。本轮未推送或发布。内容唯一编辑源仍为content/wiki/*.json；生成Markdown不单独手改。图片采用新版白框、独立图注、尺寸比例、双图与手机单列；另补图片加载占位和直接章节链接的初始布局稳定。详细方案、原文来源、缺项、验收与备份见工作区outputs/第二轮内容排版-20261016。

2026-10-16 成员补充：Member_Formatted.docx的24位成员与新增HP队长马培松已整合为25张Team翻转卡片和25张Attributions个人贡献卡片，新增Tina“成员翻转卡片”“个人贡献卡片”模块。现有15张照片沿用，10位暂无照片使用姓名字母。具体文案按原稿逐条保留；两处空介绍沿用此前供稿。新模板已在本地Tina完成保存与精确恢复测试。
