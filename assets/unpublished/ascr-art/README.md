# 蛔苷素 / 受体 / 酵母素材（团队 Inkscape 源文件）

| 文件 | 说明 |
|---|---|
| `total_2.svg` | 团队最新素材（ascr#3 蓝、ascr#18 红）。**以后只改这个文件。** |
| `Ste20-Gpa1-MAPK-p-sTF.pptx` | 王昶的排版示意：第 1 页受体与蛔苷素、第 2 页酵母内的 Gpa1 / Ste20 / MAPK / p / sTF、第 3 页真菌、第 4 页出芽酵母。 |
| `total_v1-superseded.svg` | 上一版（ascr#3 红、ascr#18 蓝），仅留档。 |
| `tools/` | 把 `total_2.svg` 切成首页动画里的素材槽位（`data-art`）。 |

## 重新生成首页的素材槽位

需要 Python 3 和 Playwright（Chromium）。在 `tools/` 目录下：

```
python3 dump.py          # 读取 total_2.svg，按元素 id 导出标记和变换
python3 compose.py       # 按 geom.py 的比例，把元素裁成各个槽位
python3 build_traces.py  # 写入 src/home/sections/traces.html 的 <svg>
```

- `geom.py`：蛔苷素凹槽与口袋凸块的对接位置（`B`）、酵母的缩放（`K_CELL`）。动画里的坐标来自这里，改动后要同步 `static/js/home-ascr-story.js` 的状态表（`states.js` 是当前状态表的副本）。
- `traces_svg.tpl`：整个 `<svg>` 的模板，`{{名字}}` 是槽位。
- 配色在 `static/css/home-ascr.css` 顶部的 4 个变量（`--as-c3 / --as-c18 / --as-p3 / --as-p18`）。

## 素材对应

| 槽位 (`data-o`) | `total_2.svg` 元素 |
|---|---|
| `recL`（受体下层）/ `recD`（受体上层） | `g64` / `g65` |
| `pocket`（ascr#3 口袋）/ `mut`（ascr#18 口袋） | `g142` / `g143` |
| `m3` / `m18` | `g67` / `g139` |
| `fung` | `g8` + `g26*`（不含文字“捕食线虫真菌素材”） |
| `cellIn` / `bud` | `path77` / `path147` 等（出芽酵母） |
| `nuc` / `dna` / `prom` / `gene` | `path92` / `path98` / `rect99` / `rect99-5*` |
| `gB`（Gpa1） / `ste20` / `mapk` / `gG`（p） | `g15` / `rect112` / `rect113` / `g107-6` |
| `tf`（sTF） / `tfP` | `g13` + `g137` / `g107` |

未使用：`path149`（网格渐变，浏览器不支持）、`path74`（红色曲线）、`path143`（两个受体之间的箭头）。

## 本地整合核验（2026-10-18）

已在完整 Astro 工程中构建。模板同步保留当前比例条从左向右增长、地图落点涟漪及文字排版；`states.js` 为当前整合状态表的参考副本，不是运行入口。素材生成只替换 SVG，不覆盖动画脚本和正文。
