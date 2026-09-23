# 首页数据来源登记表

首页上出现的每一个数字、分布和案例都登记在这里：它在页面的什么位置、原文出处是什么、谁在什么时候核对过。

**新增或修改首页数据时，必须同时更新本表。** 找不到出处的内容不得上线（见 `AGENTS.md` §1.6）。

- 登记依据：团队叙事文档 D01《首页叙事》中列出的来源链接。
- 核对人与时间：Claude，2026-09-23。其中"已核对"表示打开了原文或摘要，确认页面上的数字与原文一致。
- 团队至少还需要再核一遍标注为"团队核对"的条目。

## 1. 全球层（`_partials/home/world.html`、`js/home-maps.js` 中的 `CASES`）

| 页面内容 | 出处 | 状态 |
|---|---|---|
| 首屏数字：US$173 billion，植物寄生线虫每年造成的全球农业损失 | Kantor, C. et al. (2022) Regulated and emerging plant-parasitic nematodes. *Horticulturae* 8: 208. 该文沿用了 Elling, A. A. (2013) *Phytopathology* 103: 1092–1102 的估算 | 已核对 Kantor 2022 原文。Elling 2013 为多篇综述共同引用的原始出处，建议团队读一遍原文 |
| 全球丰度点图，以及点击大洲后显示的中位数和像元数 | van den Hoogen, J. et al. (2020) A global database of soil nematode abundance and functional group composition. *Scientific Data* 7: 103. doi:10.1038/s41597-020-0437-3。数据以 CC0 发布，doi:10.6084/m9.figshare.c.4718003 | 字段 `Herbivores`，单位为每 100 g 干土的个体数。**数据文件尚未生成**，生成方法见第 4 节 |
| 美国：大豆胞囊线虫使美国每年损失超过 10 亿美元大豆产量（2006–2009 年估算） | Koenning, S. R. & Wrather, J. A. (2010) *Plant Health Progress* 11: 5，转引自 Peng et al. 2021 | 已核对（Peng 2021 原文） |
| 巴西马托格罗索：短体线虫 *Pratylenchus brachyurus* 使大豆平均损失 21% 的潜在产量（2011/12 年度，Vera 市一块商业田） | Franchini, J. C., Debiasi, H., Dias, W. P., Ramos Jr., E. U., Silva, J. F. V. 《Perda de produtividade da soja em área infestada por nematoide das lesões radiculares na região médio norte do Mato Grosso》，收录于 Embrapa《Agricultura de precisão: resultados de um novo olhar》（2014） | 已核对（原文 PDF） |
| 欧洲：马铃薯胞囊线虫两种合计造成全球约 9% 的马铃薯减产；在欧盟列为检疫性有害生物 | Kantor et al. 2022（见上）；Commission Implementing Regulation (EU) 2019/2072 | 9% 的数字已核对。检疫条款建议团队在 EUR-Lex 上核对附件 |
| 乌干达：香蕉穿孔线虫和螺旋线虫使东非高地香蕉产量下降 30–38% | Speijer, P. R., Kajumba, C. & Ssango, F. (1999) *International Journal of Pest Management* 45: 41–49 | 已核对（摘要） |
| 中国：大豆胞囊线虫每年造成超过 1.2 亿美元大豆产量损失 | Peng, D., Jiang, R., Peng, H. & Liu, S. (2021) Soybean cyst nematodes: a destructive threat to soybean production in China. *Phytopathology Research* 3: 19。该文引用 Ou et al. 2008 | 已核对 |
| 澳大利亚：两种短体线虫使全国每年损失约 1.23 亿澳元小麦（截至 2008 年的十年均值） | Murray, G. M. & Brennan, J. P. (2010), GRDC，转引自 Thompson et al., 2012 GRDC Grains Research Update（Goondiwindi） | 已核对（转引页）。如需引用原始报告，请团队找到原文 |

## 2. 中国层（`_partials/home/china.html`、`js/home-maps.js` 中的 `TEXT`、`SCN`、`RKN`）

| 页面内容 | 出处 | 状态 |
|---|---|---|
| "线虫已经成为农作物的第二大类病害" | 张克勤院士在十四届全国人大一次会议"代表通道"上的发言，央视网，2023-03-05 | 已核对 |
| 中国植物食性线虫丰度点图 | 与全球层使用同一数据集、同一单位、同一色阶，不单独重算 | 生成数据文件后自动显示 |
| 大豆胞囊线虫：22 个省级地区的名单；东北和黄淮海为主要大豆产区；一般减产 20–30%，严重田块 60–70%，极端情况绝收；年损失超过 1.2 亿美元；寄主包括豆科作物，以及地黄、泡桐、芝麻、烟草、番茄 | Peng et al. 2021（见上），名单与原文逐一对照 | 已核对 |
| 南方根结线虫：20 个省级地区的记录 | CABI 的 *Meloidogyne incognita* 分布图。省份名单取自团队文档 | **团队核对**：需对照 CABI 原图 |
| 新疆：2021–2023 年调查，130 份蔬菜样品中 57 份检出根结线虫，以南方根结线虫为主 | Zhou, J. et al. (2024) The occurrence and genetic diversity of vegetable root-knot nematodes in Xinjiang Uyghur Autonomous Region. *Journal of Integrative Agriculture*. doi:10.1016/j.jia.2024.12.008 | 已核对（摘要）。注意原文是"蔬菜"，不限于设施蔬菜 |
| 寄主超过 3,000 种植物 | *New Phytologist*, doi:10.1111/nph.71431（团队链接）；多篇文献表述一致 | 已核对（预印本及多篇文献）。期刊版作者和标题请团队补全 |
| 湖南：大棚蔬菜发病率达 80%，露地约 10%；南方根结线虫占鉴定种群的 87% | 程飞雪、张德咏、何明远（2010）湖南省蔬菜根结线虫发生及种类鉴定。湖南省植物保护研究所（AGRIS 收录） | 已核对（摘要）。期刊名和卷期请团队补全 |

以下内容**首页不使用**，原因如下：

- 各省统一口径的损失金额：来源不存在。
- 南方根结线虫在中国的年度总损失：没有较新的可靠数字。
- 根结线虫每年给中国蔬菜造成约 30 亿元损失：数据较旧，而且统计的不是单一物种。
- 候选采样地区柱图：来自示意数值，已删除。

## 3. 其他分区

| 位置 | 处理 |
|---|---|
| `signal` 的颜色读数 | 删掉了 RGB 数值，只保留"Target color (illustration)"色块。该色块是设计目标，不是测量结果 |
| `traces` 两组线虫的信号组合 | 两组显示相同的两种信号，不再随机变化，避免暗示尚未测出的比例 |
| `threat` 侵染过程 | 定性描述（J2 寻找寄主、释放蛔苷、侵入、形成取食位点、症状滞后），不含数值 |
| `built` 成果卡 | "Result to come"。有实验结果以后，再按团队文档第 5 部分替换 |

## 4. 生成全球丰度数据（一次即可）

```bash
python3 tools/build_abundance.py                    # 从作者的 GitHub 仓库下载原始 CSV，失败时提示改用 figshare
python3 tools/build_abundance.py --csv 下载的文件.csv  # 或者使用自己从 figshare 下载的文件
python3 build.py
```

脚本会做以下处理：
1. 读取 6,825 个样点的 `Herbivores` 字段，跳过缺失值。
2. 按 30 角秒像元（`Pixel_Lat`、`Pixel_Long`）取平均，得到论文中的约 1,933 个像元。
3. 写出 `js/home-abundance.js`，大约 60 KB，同时记录数据来源、像元数和中位数。

请把生成的文件提交到仓库。之后世界地图的点图、大洲信息卡，以及中国的丰度图都会自动出现。

脚本不插值、不建模，只画实际采样过的位置。高分辨率的预测图来自 van den Hoogen et al. 2019 发表在 *Nature* 的论文，属于模型产物，目前未使用。
