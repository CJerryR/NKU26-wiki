# NKU-iGEM 2026 Wiki — GPT 首页 + Python 内页系统

这是 `claude-py-innerpage` 分支：**以 2026 年 9 月 22 日的 GPT 首页版本为基底，在其上增加统一的内页系统。** 首页沿用原来的叙事和视觉方向；这次的主要改动是内页模板、内容管线和 Awards 证据地图。

## 版本来源与技术选择

- 基底是 `HomePage` 分支。GPT 首页原型于 2026-09-22 提交（`1b9304e`、`83d52df`）；本分支从该分支后续状态 `e7abcea` 建立，保留首页的 B17 / A04 视觉方向和 D01 叙事。
- 2026-09-23 增加文章模板和 Markdown 内容管线。首页仅做了两处衔接调整：加入 Awards 导航入口，并把吉祥物提示中的 “Project → Parts” 改为 “Lab → Parts”。
- 内页的信息组织参考 Munich 2025 的文档系统思路，**没有照搬其视觉设计或文字**；本站继续使用 NKU 的液态玻璃和卡通视觉。
- 实现这版时也评估过 Astro 迁移，但当时的执行环境受网络允许列表限制，无法从 npm 仓库安装依赖，因而无法对迁移版完成构建和截图检查。为避免交付未经构建的版本，本分支继续使用现有 Python 静态构建器。这是当时的环境和交付选择，不代表 Astro 本身不可用。

## 本地构建与预览

```sh
python3 -m pip install -r requirements.txt  # 首次构建时安装 Markdown
python3 build.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

打开 <http://127.0.0.1:8765/>。请编辑源码并重新构建，不要直接编辑生成的 `public/`；该目录是构建产物，不提交到源码分支。

本地内容审计：

```sh
python3 tools/audit_wiki_content.py --generated --generated-root public
```

## 页面与内页系统

当前构建生成 32 个页面，包含首页、现有 HTML 页面、三个 Markdown 页面（Engineering、Description、Awards）。除首页外的页面使用统一文章模板，包括玻璃胶囊导航、面包屑、阅读时长、自动目录、滚动进度、移动端迷你目录、前后页导航、图片放大和键盘操作支持。

Markdown 内容位于 `_content/*.md`，旧页面仍可保留为 `_content/*.html`。新页面请使用 Markdown；每个 `##` 标题会自动进入目录。路由由 front matter 中的 `route` 控制，页面之间使用 `page:<文件名>` 链接，避免路由变更后失效。

内容组件和数据：

- `_data/references.bib`：BibTeX 文献；页面只输出实际引用的文献。
- `_data/glossary.json`：全站缩写词解释。
- `<Figure>`、`<Callout>`、`<Evidence>`、`<Tag>`、`<DBTL>`、`<Step>`、`<Details>`、`<Video>`、`<PartCard>`、`<Stakeholder>`：图表、提示、证据标记和页面内容组件。
- 证据等级为 `literature`、`hypothesis`、`result`、`open`，用于区分文献结论、项目假设、团队记录和未完成的证据要求。
- `_styleguide/components.md` 提供组件示例；仅本地构建：

  ```sh
  python3 build.py --styleguide
  python3 -m http.server 8765 --bind 127.0.0.1 --directory public
  ```

  然后打开 <http://127.0.0.1:8765/_styleguide/components/>。

## 发布前需要人工复核

1. 对照 2026 iGEM URL 规则确认 `/team`、`/attributions`、`/experiments` 等非标准路由。
2. 核实 Awards 页中的参赛奖项选择、状态和措辞。
3. 对照原文核实 Description 页新增的 `jones2013`、`choe2012` 引用，以及 Engineering DBTL 卡片的结果概述。
4. 正式发布前用 Zotero Better BibTeX 核对 `_data/references.bib` 的作者字段；现有部分条目使用 `and others`。

组件示例见 `_styleguide/components.md`；引用与 AI 使用披露见 `_content/licensing.html`。
