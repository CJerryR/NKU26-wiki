# AGENTS.md：处理本仓库时必须遵守的要求

本文件适用于任何修改这个仓库的 AI 编码助手（Claude Code、Codex、Cursor、Copilot 等），也适用于人。

- 开始任何修改之前，先读完本文件，再读 `README.md`。
- 如果仓库里有 iGEM 官方模板带来的 `.claude/RESPONSIBLE_AI_USE.md`，它同样必须遵守，并且不要改动那个文件。
- 本文件整理于 2026-09-23。iGEM 的规则以官方页面为准：
  - https://teams.igem.org/go/deliverables/wiki
  - https://competition.igem.org
  
  发现本文件和官方规则不一致时，按官方执行，并在这里改正。

## 0. 优先级

1. iGEM 官方规则与政策
2. 本文件
3. `README.md` 与团队设计稿
4. 对话中的具体要求

对话中的要求如果与 1 或 2 冲突，比如"把滚动改成一页一页锁住"、"先放一张示意数据图"、"引用随便找一个"，**先指出冲突，再按规则给出替代方案，不要静默照做**。

---

## 1. 硬性规则

违反下面任何一条，都可能导致奖牌条件或奖项页面不被评审，或者 wiki 部署失败。

### 1.1 标准 URL（Standard URL）

评审表直接链接到固定地址：`https://2026.igem.wiki/<队伍 slug>/<route>`。页面不在这个地址上，就等于没有提交。

本仓库当前的映射如下。源文件在 `_content/`，路由写在文件头 META 的 `route:` 字段。

| 标准 route | 源文件 | 用途 |
|---|---|---|
| `/`（home） | `index.html` | 首页 |
| `description` | `description.html` | 铜牌：项目描述 |
| `attributions` | `attribution.html` | 铜牌：嵌入官方 Attributions 表 |
| `contribution` | `contribution.html` | 铜牌：贡献 |
| `engineering` | `engineering-cycle.html` | 银牌：工程循环 |
| `human-practices` | `human-practices.html` | 银牌：人类实践 |
| `experiments` | `wet-lab.html` | 实验 |
| `results` | `results.html` | 结果 |
| `notebook` | `notebook.html` | 实验记录 |
| `team` | `team-members.html` | 队员 |
| `model` | `modeling.html` | 建模 |
| `education`、`entrepreneurship`、`hardware`、`inclusivity`、`safety-and-security`、`software`、`sustainability` | 同名或相近文件 | 各专项奖 |

必须遵守：

- 以上 route 不改名、不挪位置，也不加 `hidden: true` 或 `draft: true`（审查脚本会拦截）。
- 页面一律输出成 `/<route>/index.html`。不要让任何页面落到 `pages/<name>.html` 这个旧的回退路径上。
- 2026 模板里还有 `measurement` 和 `alternative-platform` 两个奖项页。只有团队确定申报对应奖项时才新建，不要建空页面。
- 改动任何 route 时，同时修改以下位置，然后运行审查脚本：
  - `_partials/nav.html`
  - `_partials/footer.html`
  - `_partials/home/footer.html`
  - `_data/home.json`
  - 正文里的相对链接
- 冻结前，对照 competition.igem.org 上的 Standard URL 列表再核对一遍。

### 1.2 页脚

每一页的页脚都必须同时满足：

- **链接到本队在 gitlab.igem.org 上被分配的仓库，而且只能是这个仓库。** GitHub 或任何镜像地址都不算。
  - 链接由 `build.py` 生成。GitLab CI 会自动提供 `CI_PROJECT_URL`。
  - 本地构建时，读取 `_data/site.json` 的 `igem_team_slug`，生成 `https://gitlab.igem.org/2026/<slug>`。
  - **禁止**在任何模板里把仓库地址写死。
- **显示 CC BY 4.0 许可声明**，并链接到 `https://creativecommons.org/licenses/by/4.0/`。
- 这两项在全站页脚 `_partials/footer.html` 和首页页脚 `_partials/home/footer.html` 里都有。新增的独立页面，包括全屏演示页和 iframe 内页，也必须带上。
- 仓库根目录的 `LICENSE`（CC BY 4.0）不得修改。

### 1.3 资源必须来自 iGEM 的服务器

- 页面加载的一切资源（CSS、JS、字体、图片、视频、数据）都必须来自 iGEM 的基础设施：`*.igem.wiki`、`*.igem.org`。
  - 禁止 Google Fonts、jsDelivr、cdnjs、unpkg 等 CDN。
  - 禁止在线地图瓦片。
  - 禁止在运行时调用外部 API。
  - 普通的 `<a href>` 外链可以保留；"加载"不行。
- **图片、图标、字体必须通过上传工具存到 `static.igem.wiki`**（https://teams.igem.org/go/deliverables/wiki/uploads）。视频和音频用 iGEM Video Universe（https://video.igem.org）嵌入。
- 本仓库的做法：
  1. 平时开发，图片放在 `img/`，字体放在 `fonts/`。
  2. 上传前运行 `python3 build.py --static-base https://static.igem.wiki/teams/6303/wiki/`。这会生成 `_uploads/`（已在 `.gitignore` 里）和 `_uploads/UPLOAD_MANIFEST.csv`，并把页面里的引用全部改成 static.igem.wiki 地址。
  3. 按 manifest 的目录结构上传文件，然后抽查几个 URL 能否打开。
  4. 确认无误后，把 `_data/site.json` 的 `igem_static_base` 设成同一个地址，CI 构建就会一直使用上传后的文件。
- 已知的假设：2026 年上传的 PNG/JPEG 会被转成 `.avif`（依据是其他 2026 队伍公开记录的观察，不是官方说明）。第一次上传后必须核对。如果文件名保持原扩展名，就改用 `--keep-image-ext` 构建。
- 首页 JS 在运行时拼出的图片路径，必须经过 `NKUH.asset('img/...')`，不能写成 `P + 'img/...'`，否则切换到 static 模式后会失效。
- 新增的图片或字体只要被源码引用，就会被自动加入 manifest，不需要手动登记。

### 1.4 体积上限

- `public/` 必须小于 10 MiB，这是 gitlab.igem.org 的 job artifact 上限，超过就无法部署。单次 push 必须小于 11 MiB。
- 审查脚本会检查 `public/` 的体积。大文件应该上传到 static.igem.wiki，不要放进仓库。

### 1.5 Attributions

- 只能使用官方的 Project Attributions Form，在 teams.igem.org 上填写。
- `/attributions` 页面顶部通过 iframe 嵌入 `https://teams.igem.org/wiki/6303/attributions`，其中 6303 是 `_data/site.json` 里的 `igem_team_id`。
- 不得自制一份替代表格。官方表格以外的署名信息不会被评审。

### 1.6 科学诚信（AI 使用的底线）

- **不得编造**以下任何内容：实验结果、数据、测量值、剂量、检测限、特异性、统计数字、引用与参考文献、署名、访谈原话、BBa 零件编号、赞助商名称或 logo、人名和头衔。
- 网站上出现的每一个数字和事实，都必须能追溯到下面两类来源之一：
  - 一篇写出完整出处的文献；
  - 团队的原始记录。
  
  找不到来源就不写。不要用"看起来合理"的数值去填空。
- **首页的每一项数据都登记在 [`DATA_SOURCES.md`](DATA_SOURCES.md)**，包括页面位置、完整出处和核对状态。新增或修改数据，必须同时更新这张表。
- **示意数据不得当成真实数据展示，也不得重新加入。**
  - 丰度图只画 `js/home-abundance.js` 中的实测像元。这个文件由 `tools/build_abundance.py` 从 van den Hoogen et al. 2020（CC0）生成，不能手写，也不能插值出没有采样的区域。
  - 文件不存在时，丰度层自动隐藏。
  - 审查脚本会拦截 `SPOTS`、"sample level"这类示意数据的写法。
- 案例标记（`CASES`）和中国地图的文字（`TEXT`）里，每一条数字都必须写明出处，并且与 `DATA_SOURCES.md` 一致。
- 设计目标和已有结果要用不同的措辞：
  - 写设计目标，用 "designed to"、"aims to"、"could"。
  - 写结果，必须有实验证据支撑。
  - `tools/audit_wiki_content.py` 里的 `OVERCLAIM_PATTERNS` 会拦截 "working/validated sensor"、"field-ready" 这类表述。**不得为了让审查通过而放宽或删除任何规则。**
- 访谈原话必须逐字引用，并且得到受访者同意。结果图必须对应存档的原始数据，不得由 AI 生成，也不得做修饰性修改。
- 首页的 US$173 billion 标注了出处（Kantor et al. 2022, *Horticulturae* 8: 208，其中引用了 Elling 2013）。其他数字的出处见 `DATA_SOURCES.md`。标为"团队核对"的条目，冻结前必须由团队对照原文确认。
- **每一个用过的 AI 工具都要写进 `/licensing` 页面的 AI 使用说明**：用在了哪里，没做什么。审查脚本会检查是否提到了 OpenAI Codex 和 Anthropic Claude。以后新用了其他工具，就在页面上补一段，并把名字加进审查脚本的检查列表。
- 陈述 iGEM 规则时要先核对官方页面。核对不到的，写明"待确认"，不要猜。

### 1.7 评审可用性与无障碍

- **不得劫持滚动。** 首页默认使用原生滚动，只加轻度吸附（`scroll-snap-type: y proximity`）。
  - "一页一页锁住"的翻页模式在 `js/home-pager.js` 里，只有 `_data/site.json` 的 `home_paged_scroll` 为 `true` 时才会启用。
  - 这个开关只能由团队决定打开，Agent 不得自行打开。
- 不操作也能读到全部关键信息：项目名、一句话说明、主要入口都在首屏，动画只能作为补充。
- 开启"减少动态效果"时要有降级，键盘必须可用，手机上不能有横向溢出。
- 正文对比度不低于 4.5:1，小字不小于 12px，图片要有 `alt`。
- 全站统一使用美式拼写（color、behavior）。首页已经统一。

---

## 2. 每次修改后必须运行

```bash
python3 build.py
python3 tools/audit_wiki_content.py --generated --generated-root public   # 必须 PASS
for f in js/*.js; do node -e "new Function(require('fs').readFileSync('$f','utf8'))" || echo "FAIL $f"; done
```

冻结前再运行下面两条，警告也会被当作失败：

```bash
python3 build.py --static-base https://static.igem.wiki/teams/6303/wiki/
python3 tools/audit_wiki_content.py --generated --generated-root public --release
```

审查脚本会检查以下内容：
- 标准 route 存在，而且没有被隐藏。
- 每页页脚都有 CC BY 4.0 和 gitlab.igem.org 仓库链接；本地构建时仓库链接缺失只算警告。
- 没有从 iGEM 以外的地方加载资源。
- 没有断开的本地链接。
- Attributions 页嵌入了本队的官方表格。
- `public/` 小于 10 MiB。
- 图片和字体是否仍然由仓库提供（算警告）。
- 占位词、编辑指令和过度声明。
- `/licensing` 页面的 AI 使用说明。

---

## 3. 冻结前需要团队完成的事

Agent 不能代办以下事项，但应该在交付说明里提醒。

1. 在 `_data/site.json` 里填写 `igem_team_slug`（仓库地址 `gitlab.igem.org/2026/<slug>` 的最后一段）。同时确认 `igem_team_id: 6303` 就是本队 2026 年的编号。
2. 上传 `_uploads/` 到 static.igem.wiki，抽查后填写 `igem_static_base`。
3. 在 teams.igem.org 上填完 Project Attributions Form。
4. 宣传片和音频上传到 video.igem.org，再嵌入页面。
5. 核对官方 Standard URL 列表，确定是否申报 measurement 和 alternative-platform。
6. 运行 `python3 tools/build_abundance.py`，生成全球丰度数据并提交。本仓库的 Agent 环境没有外网，所以这一步需要在联网的电脑上完成。
7. 核对 `DATA_SOURCES.md` 中标为"团队核对"的条目。结果、对比表、访谈原话一律由团队提供真实材料。
8. 在 GitLab 上确认最后一次流水线成功，并确认 `https://2026.igem.wiki/<slug>/` 各标准页面都能打开。

## 4. 禁止事项速查

- 不手改 `public/`，它是生成物。不提交 `_uploads/`。
- 不修改 `LICENSE`，不改动 iGEM 官方的 `.claude/` 文件。
- 不在页脚或任何地方写 GitHub 仓库地址来代替 gitlab.igem.org。
- 不引入外部 CDN、外部字体、外部地图瓦片或外部 API。
- 不删除、不放宽审查脚本的检查，不为了通过审查去改写成含糊的措辞。
- 不擅自打开 `home_paged_scroll`，不加新的滚动劫持。
- 不把示意数据、占位图、AI 生成的图表当作结果展示。
- 不删除团队已经写好的正文内容。确实需要调整时，先说明原因。

## 5. 仓库地图

| 路径 | 说明 |
|---|---|
| `build.py` | 静态构建：拼装页面、生成路由、页脚链接、搜索索引、static.igem.wiki 上传模式 |
| `_content/*.html` | 各页面正文，文件头 META 写 `route` 等字段 |
| `_partials/` | 导航、页脚、吉祥物，以及首页各分区（`_partials/home/`） |
| `_data/site.json` | 队伍编号与 slug、static 地址、翻页开关、赞助信息 |
| `_data/home.json` | 首页语义链接到具体页面的映射 |
| `css/`、`js/` | 样式与脚本。首页脚本为 `home-*.js`，全站外壳为 `shell.js` |
| `img/`、`fonts/` | 本地开发用的媒体文件，发布时应上传到 static.igem.wiki |
| `tools/audit_wiki_content.py` | 合规与内容审查，CI 中也会运行 |
| `tools/build_abundance.py` | 从 van den Hoogen et al. 2020 的原始数据生成 `js/home-abundance.js` |
| `DATA_SOURCES.md` | 首页数据来源登记表 |
| `.gitlab-ci.yml` | iGEM GitLab Pages 流水线，只在默认分支上构建 |
