# 写页面：Markdown 写法

每个内页是 `src/content/pages/` 里的一个 `.md` 文件。文件名就是页面 id，导航用它来引用页面。

## 1. 文件开头（frontmatter）

```yaml
---
title: Description                      # 必填。浏览器标题、搜索结果标题
heading: "What we are *solving*"        # 页头大标题；用 *星号* 包住的词显示为渐变强调色
sub: "一句话副标题"                        # 页头副标题
crumbs: [Project, Description]          # 面包屑，最后一项是本页
route: model                            # 可选。iGEM 标准地址 → /model/；不写 → /pages/文件名.html
meta:                                   # 页头的玻璃小标签，数量任意
  Track: Diagnostics / Agriculture
  Reading: "7 min"
hidden: true                            # 可选。不进入搜索（页面照常生成）
draft: true                             # 可选。草稿：不生成页面（审计会提醒）
description: "…"                        # 可选。给搜索引擎的摘要，默认使用 sub
---
```

值里含有 `:`、`#`、引号，或者以数字开头时，要用双引号包起来。

## 2. 章节与目录

```markdown
## A threat that works underground {#problem toc="The problem"}
```

- **`##` 二级标题就是一个章节**：自动编号（01、02…），自动进入目录和搜索。
- **`{#problem}`**：固定该章节的锚点地址，如 `/pages/description.html#problem`。不写会按标题自动生成。**已有页面的锚点请不要改**，站内外可能有链接指向它们。
- **`toc="…"`**：目录里显示的短名字。不写就用标题原文。
- **`###` 及更小的标题**默认不进目录。要进目录就加 `toc`：`### The 0528 plate {#r0528 toc="0528 plate"}`，或只写 `{toc}`。
- **`{notoc}`**：该二级标题不进目录、不编号。

## 3. 正文

支持普通 Markdown：段落、`**粗体**`、`*斜体*`（显示为衬线斜体，适合物种名）、`` `代码` ``、列表、引用 `>`、表格、代码块。

- **站内链接**：写以 `/` 开头的地址，构建时会自动改成相对地址。例如 `[Notebook](/pages/notebook.html)`、`[Model](/model/)`、`[本页章节](#problem)`。
- **图片**：文件放在 `static/img/…`，正文写 `![说明文字](/img/xxx.png)`。不能引用外部网址的图片（iGEM 的规定，审计会拦下）。

## 4. 内容块

以 `:::名字` 开始，以单独一行的 `:::` 结束。开始和结束的数量对不上时，审计会报错。

**提示框**（三种：`note` 紫色、`tip` 琥珀色、`warning` 橙色；方括号里的标题可以不写）

```markdown
:::note[Why these two?]
正文……
:::
```

**卡片**（每个 `###` 开始一张新卡片；`cols=1~4` 固定列数，手机上自动变成单列；不写则自动排列）

```markdown
:::cards{cols=3}
### Slow workflows {icon="clock"}
正文……

### See the results {icon="chart" href="/pages/results.html"}
写了 href，整张卡片都可以点击。
:::
```

- 可用图标：`people flask chip board file book building briefcase check-circle link camera cycle globe shield mic clock cost inspect search chart leaf group hand balance gear rocket signal lines timer alert verified roster person id-card doc`。要新增图标，在 `src/lib/icons.mjs` 里加。
- `:::cols` 的分栏方式和卡片一样，但没有卡片底色。

**时间线**

```markdown
:::timeline
#### Negative selective-medium result {when="0528"}
说明……
:::
```

**编号条目**（Engineering 页 D / B / T / L 那种；写了 `href` 整行可点击）

```markdown
:::features
### Design {idx="D" href="/pages/design.html"}
说明……
:::
```

**数字**：`:::stats`，每个 `### 数字` 下面写一行说明。

**参考文献**：`:::refs` 里面放一个编号列表。

**图**（写在最后的那一段自动成为图注）

```markdown
:::figure{svg="description-1"}
**Fig 1** The intended sensing pipeline at a glance.
:::
```

- `svg="名字"`：读取 `src/figures/名字.svg` 并内嵌进页面。图里的文字可以被搜索，缩放也清晰。
- 位图：`:::figure{src="/img/x.png" alt="…"}`，或者一行写成 `::figure[图注]{src="/img/x.png" alt="…"}`。
- 表格也可以放进 `:::figure`，得到带图注的表。
- 加 `wide`（如 `:::figure{svg="x" wide}`）表示可以占用正文右侧的留白。

**折叠**

```markdown
:::details[点击展开的标题]
内容……
:::
```

**成员**（没有照片时显示姓名首字母）

```markdown
:::people
### Zhang San {role="Wet lab" img="/img/team/zhangsan.jpg"}
一句介绍。
:::
```

**导语**：`:::lead`，放大显示的开头段落。

## 5. 写错了会怎样

写错不会导致整站构建失败：

- **不认识的 `:::名字`**：去掉外框，只显示里面的内容，终端给出警告。
- **正文里的 `Gal4:Gal80` 这类冒号写法**：原样显示，不会被当成语法。
- **找不到的图或图标**：页面上显示醒目的提示，终端给出警告，审计会拦下，不会被发布。

建议发布前运行 `npm run verify`（构建 + 审计）。

## 页面结构（v7.1，按内部大纲）

- `src/content/pages/`：已上线的页面。导航分组和顺序写在 `src/data/nav.ts`。
- `src/content/optional/`：大纲里标为【可选】的页面（Background、Notebook、Sustainability、Collaboration、Sponsors & Partners）。内容保留，暂不上线。要上线时，把文件移到 `pages/` 即可，顶部导航、手机菜单和上一页/下一页会自动加上它。
- `src/content/archive/`：大纲以外的旧页面（Hardware、Software、Design 等），不上线，文字留作备查。
- 指向未上线页面的链接不会让构建失败：构建时它们会自动显示为普通文字，构建日志逐条列出；页面上线后，链接自动恢复。
- Model 1、Model 2、Part Collection 是占位页。改名时要同时改文件名、`title`、`crumbs`，以及 `src/data/nav.ts` 里对应的 `page` 和 `label`。
