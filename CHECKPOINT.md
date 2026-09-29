# 中间版 1（未经构建验证）

这是迁移过程中的中间包，用来防止对话中断时成果丢失，**不要部署**。

已完成：
- `src/content/pages/*.md`：31 个内页已从 v6 的 HTML 转成 Markdown（正文逐字保留）
- `src/lib/remark-wiki.mjs`：Markdown 扩展语法（`:::cards`、`:::note`、`:::timeline`、`:::figure` 等）
- Astro 骨架：配置、内容 schema、路由（地址与 v6 相同）、导航数据、搜索索引
- 组件：玻璃导航、页头、玻璃目录、上一页/下一页、页脚、搜索框、侦探吉祥物
- 样式 `src/styles/*` 与脚本 `src/scripts/*`（液态玻璃引擎、目录、搜索）
- 首页保持 v6 原样（`src/home/` + `static/`）

还没做：真实构建与截图检查、审计脚本移植、CI 配置、README。
