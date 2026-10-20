# Project.docx 两版并行预览

用户于 2026-10-21 明确授权临时将备份加入 main 部署，保留两版独立网址，待比较后选择一版。

- 原版网址不变：/description/、/engineering/、/contribution/。
- 版本选择入口：/preview/project-feishu/。
- 备份：/preview/project-feishu/description/、/preview/project-feishu/engineering/、/preview/project-feishu/contribution/。
- 仅增加预览路由、备份来源及渲染支持，不用备份覆盖当前正式正文或全局样式。
- 不新建域名；现有 iGEM Pages 由 main 的一次源码构建发布两组路由。提交交给唯一上线 bot，仍由 integration → release 验收发布。

## 来源和隔离

补丁基线：9e9fa070857d872d29a4759c53c9e362ed9c70ab（V10.2.31）。
原始交接包：/Users/cjrmacbook/Documents/NKU26-project-feishu-20261021。
备份 JSON：content/previews/project-feishu/*.json。
生成 Markdown：src/content/project-previews/*.md（tools/export-tina.mjs 构建生成）。
独立 Astro collection 不进入正式导航和搜索；保留标准 PageView 的组件、主题、场景和目录。
备份 CSS 每条规则限定于 body:has([data-project-preview])，52rem 版心和标题样式只影响备份页面。
6 张图按源 SHA256 复用官方已有 CDN 原尺寸无损 WebP，原图保留交接包，不进入 Git；映射见 project-20261021-media.json。

## 验证和本地预览

npm run test:deployment、npm run build、两项内容/图注审计、npm run audit。
本地服务器：python3 -m http.server 4406 --bind 127.0.0.1 --directory public。
实际源码：workspace/tasks/project-feishu，任务 project-feishu；精确提交和验收结果见工作区任务登记及 release-queue/project-feishu.json。

## 待队伍确认

Engineering 3.3 缺正确的 ΔB 图，备份图号跳过 Figure 4；Description Figure 4 课堂照片肖像授权待确认。技术验证不替代科研、内容或肖像授权审核。

## 后续保留一版

用户选择前两版都保留。若选择备份，将这三个备份 JSON 按最新正式基线逐项替换并验证；52rem 等共享版式是否推广由选择范围决定。若选择现版，只移除本预览 collection、路由、专用样式和导出步骤。均通过单独提交和上线 bot 流程，不重写 main 历史。

## Pages 产物限额修正

官方首次流水线构建通过，上传产物 413。备份页使用普通 PageHero 标题，不重复内联装饰性 SceneHero 预览；现版开场、两版正文/配图、目录、主题和对照链接均保留。以官方产物实际上传结果验收，不把本地 ZIP 估算当作官方实际体积。
