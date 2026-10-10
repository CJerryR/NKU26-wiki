# v7.6 内页内容编辑

## 地址

- 线上后台：https://cjerryr.github.io/NKU26-wiki/wiki-editor/admin/index.html#/collections/wiki
- 当前编辑版：https://cjerryr.github.io/NKU26-wiki/wiki-editor/
- v7.6 原始快照：https://cjerryr.github.io/NKU26-wiki/v7.6/
- 内容分支：`tina-v7.6`

## 日常操作

1. 登录线上后台，打开 **Wiki 内页**，选择页面。
2. 编辑标题、摘要，在 **正文排版** 中添加或拖动模块。
3. 普通段落用「富文本 / 表格」；章节用「章节标题」（一般为 2 级）；配图用「图片与图注」或「双图并排」。卡片、时间线和提示框在「排版模块」中编辑。
4. 图片通过媒体库上传；Word 文案分段粘贴，图片单独上传。PDF 排版示意不能自动变成网页。
5. **Save** 会提交到 GitHub 的 `tina-v7.6` 分支，触发 **Publish Tina wiki** 工作流。构建完成后刷新当前编辑版。

「草稿」页面不发布。已有地址、锚点及布局设置请保留，避免引用和导航失配。目前开放 17 个内页编辑、正文模块增删排序；页面新建和删除暂时关闭。

线上提供完整表单编辑。GitHub Pages 不能执行 Astro 实时预览接口，线上保存后通过发布地址查看排版。本地可左侧编辑、右侧实时预览。

## 本地编辑

```sh
cd /Users/cjrmacbook/Downloads/NKU26-wiki-tina
npm ci
npm run dev
```

打开 http://localhost:3000/admin/index.html ，点 **Enter Edit Mode**，从菜单进入 **Wiki 内页**。

本地模式保存到电脑，不自动上传。发布本地编辑前，先合并线上提交，再提交并推送 `tina-v7.6`。

网站端口 3000，Tina API 4101，数据服务 9101。关闭终端会停止本地后台。

## 文件与发布

- `content/wiki/*.json`：内容唯一编辑源。
- `static/img/uploads/`：上传图片。
- `tina/config.ts`：字段和排版模块。
- `tina/tina-lock.json`：云端索引配置；字段调整后重新生成并提交。
- `src/content/pages/*.md`：构建时自动导出，勿单独修改。
- `npm run build`：导出内容并构建到 `public/`。
- `.github/workflows/tina-publish.yml`：只更新 `gh-pages/wiki-editor/`，保留历史版本。
- `.env` 和 Actions secret `TINA_TOKEN`：只读 Content token，禁止提交。

云端连接的本地预览需要 `.env`，执行 `npm run build:admin` 后运行 `npm run dev:cloud`。不要同时运行两个占用 3000 端口的进程。

发布失败时查看 GitHub Actions 中 **Publish Tina wiki**。旧的线上站点会继续保留。TinaCloud Configuration / Site URLs 应包含编辑站点 URL；登录时使用有项目编辑权限的账户。
