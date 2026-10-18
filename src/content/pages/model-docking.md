---
title: Molecular Docking
heading: Molecular Docking
sub: ''
crumbs:
  - Model
  - Molecular Docking
route: model-docking
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<p class="author-source-link"><a href="/source-archive/#meeting-20261019" data-source-document="meeting-20261019-a035b2e959ac">Original submission (.docx)</a><span role="status" aria-live="polite"></span></p>

<section class="author-manuscript" lang="zh">

## 1. <strong>Docking｜从双配体接触差异到受体改造假说</strong> {#src-Model-Docking-1 toc="1. Docking｜从双配体接触差异到受体改造假说"}

<p style="text-align:left;">为了构建能够区分 ascr#18 与 ascr#3 的传感系统，我们希望获得分别偏向两种配体的受体候选。分子对接帮助我们从预测结构中寻找改造线索：两种配体接触哪些残基，改变相关侧链后评分和接触如何变化，以及哪些候选值得进入进一步研究。</p>

<p style="text-align:left;">围绕这些问题，我们逐步建立比较条件，由野生型（WT）的接触差异提出位点，再通过丙氨酸替换、侧链扫描和组合测试调整设计。评分用于比较候选的双配体表现，接触分析则帮助提出结构解释。每一轮结果都成为下一轮设计的依据。</p>

<p style="text-align:left;"><br></p>

### <strong>1.1 建立结构与对接条件，使双配体比较有共同基础</strong> {#src-Model-Docking-5 toc="1.1 建立结构与对接条件，使双配体比较有共同基础"}

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:65.2494%"><col style="width:34.7506%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;">我们首先将参与蛔苷素感知的真菌 GPCR——Gpr2、Gpr3 [1] 和 GprC [2]——纳入研究，准备预测结构与配体，并结合相关文献中的口袋位置、关键残基和对接方法开展探索。受体选择同时考虑其在酵母中的应用条件。由于文献报道的 GprC 质膜及线粒体相关定位 [2] 可能增加异源定位与通路整合的复杂度，后续改造以 Gpr2 为重点，保留 Gpr3 及其突变体研究，并将 GprC 用作结构比较参照。</p><p style="text-align:left;">初步对接的检查促使我们修正了两类输入问题。结构与搜索框的坐标参照不一致，会使实际搜索区域偏离预期位置；格式转换中丢失形式电荷等化学信息，则会影响后续带电接触的识别。这些发现使输入核对成为分析流程的一部分。</p><p style="text-align:left;">我们通过结构叠合统一受体、配体和搜索框的坐标参照，并结合膜方向与实际保留区段复核搜索区域。配体文件则通过原子映射检查，核对原始 SDF 与对接 PDBQT 的原子、坐标及结构对应关系。在 PDBQT 完整保留 Meeko 结构元数据的条件下，我们恢复包含对接姿态和形式电荷等信息的 SDF，用于接触分析。[4]</p><p style="text-align:left;">后续突变比较采用一致的配体输入与搜索设置，保留原始残基编号，使评分与残基接触能够对应追踪。文献信息用于确定研究背景和结构参照，输入检查用于核对计算条件，双配体对接结果则用于提出并筛选改造假说。</p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-08befb7e1df2-docking-source-01.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-08befb7e1df2-docking-source-01.avif" alt="" loading="lazy" width="175" height="279"></a></p><div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图1｜Gpr2 WT 全长预测结构。 </strong>展示 AlphaFold 3 预测模型 model_0 的整体结构。[3]</p></td></tr></tbody></table></div><p style=""><br></p></td></tr></tbody></table></div>

<p style="text-align:left;"><br></p>

### <strong>1.2 结合接触频率与具体姿态，提出初始改造位置</strong> {#src-Model-Docking-14 toc="1.2 结合接触频率与具体姿态，提出初始改造位置"}

<p style="text-align:left;">初始选点结合了两个观察尺度。首先，我们统计不同受体预测模型及其对接姿态中的残基接触频率，关注反复参与配体接触的位置，并比较其在两种配体中的出现情况。其次，我们在 model_0 中检查双配体的具体接触差异，关注在所分析姿态中仅对某一种配体检出的接触及其相互作用类型。</p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:28.2315%"><col style="width:21.4545%"><col style="width:28.2315%"><col style="width:22.0826%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-c4d04847c0b3-docking-source-02.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-c4d04847c0b3-docking-source-02.avif" alt="" loading="lazy" width="139" height="104"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-a42c709871dd-docking-source-03.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-a42c709871dd-docking-source-03.avif" alt="" loading="lazy" width="102" height="101"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bd6f41305f4d-docking-source-04.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bd6f41305f4d-docking-source-04.avif" alt="" loading="lazy" width="139" height="104"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-2e0dde6cfeee-docking-source-05.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-2e0dde6cfeee-docking-source-05.avif" alt="" loading="lazy" width="105" height="102"></a></p></td></tr></tbody></table></div>

<p style=""><br></p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图2｜Gpr2 WT 与两种配体的预测对接姿态。</strong> （a）ascr#3；（b）ascr#18。展示各自的最低评分姿态及周围口袋残基。</p></td></tr></tbody></table></div>

<p style="text-align:left;">这两类信息具有互补作用。跨模型和姿态的统计描述接触在所分析构象集合中的出现情况；具体姿态的对照则帮助定位差异，并提出可以通过侧链替换检验的问题。</p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:71.4700%"><col style="width:28.5300%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;">据此，我们围绕候选位置开展丙氨酸替换，考察简化侧链后，两种配体的评分和接触如何变化。初轮单点包括 N84、L90、V110、R181、R345、W338 和 V368。我们生成对应突变序列，使用 AlphaFold 3 [3] 预测结构，再完成结构准备、对接及与 WT 的接触比较。</p><div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图3｜Gpr2 初始改造候选位点的空间分布。</strong> 在全长预测结构上标示 N84、L90、V110、R181、W338、R345 和 V368。</p></td></tr></tbody></table></div><p style=""><br></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-b40381b8776ddda7-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-b40381b8776ddda7-00.json" alt="" loading="lazy" width="141" height="106"></a></p></td></tr></tbody></table></div>

<p style="text-align:left;">初轮结果显示，N84A、V110A 和 V368A 在当时的结构与 WT 参照下均表现出 ascr#3 评分降低、ascr#18 评分升高。这使 N84、V110 和 V368 成为继续比较侧链替换的核心位置；W338 和 R181 的评分及接触变化则保留了进一步探索的价值。对接由此将初始接触线索转化为下一轮可检验的替换方案。</p>

<p style="text-align:left;"><br></p>

### <strong>1.3 由少数替换扩展到饱和扫描</strong> {#src-Model-Docking-29 toc="1.3 由少数替换扩展到饱和扫描"}

<p style="text-align:left;">丙氨酸扫描帮助我们缩小了研究范围，同时提出了新的问题：在同一位置上，不同侧链是否会产生不同方向的双配体变化？</p>

<p style="text-align:left;">综合前期丙氨酸扫描的评分、接触分析及补充侧链替换结果，我们选定 N84、V110、V368 和 W338 开展饱和扫描。四个位点各包含十九种替换，共形成七十六种单突变设计，用于系统比较不同侧链对双配体评分与接触分布的影响。</p>

<p style="text-align:left;">饱和扫描显示，同一位置上的不同替换可以形成不同的评分偏移。例如，N84V 的 ascr#18 评分降低、ascr#3 评分升高，而 N84Y 呈相反方向。接触差异提出了值得探索的位置，具体候选还需要通过侧链替换后的双配体结果确定。</p>

<p style="text-align:left;"><br></p>

### <strong>1.4 拆开两项评分，比较候选的偏移来源</strong> {#src-Model-Docking-34 toc="1.4 拆开两项评分，比较候选的偏移来源"}

<p style="text-align:left;">我们以两种配体相对 WT 的评分变化之差描述候选的偏移方向。令 (G) 表示 AutoDock Vina 对接评分 [5]，分别定义：</p>

<p style="text-align:left;"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub><mo>=</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow><mo separator="true">,</mo><mn>18</mn></mrow></msub><mo>−</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">W</mi><mi mathvariant="normal">T</mi></mrow><mo separator="true">,</mo><mn>18</mn></mrow></msub></mrow><annotation encoding="application/x-tex"> \Delta G_{18} = G_{\mathrm{mut},18}-G_{\mathrm{WT},18} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">mut</span></span><span class="mpunct mtight">,</span><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">WT</span></span><span class="mpunct mtight">,</span><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub><mo>=</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow><mo separator="true">,</mo><mn>3</mn></mrow></msub><mo>−</mo><msub><mi>G</mi><mrow><mrow><mi mathvariant="normal">W</mi><mi mathvariant="normal">T</mi></mrow><mo separator="true">,</mo><mn>3</mn></mrow></msub></mrow><annotation encoding="application/x-tex"> \Delta G_{3} = G_{\mathrm{mut},3}-G_{\mathrm{WT},3} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">mut</span></span><span class="mpunct mtight">,</span><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">WT</span></span><span class="mpunct mtight">,</span><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span></p>

<p style="text-align:left;">并计算：</p>

<p style="text-align:left;"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>G</mi><mo>=</mo><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>18</mn></msub><mo>−</mo><mi mathvariant="normal">Δ</mi><msub><mi>G</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex"> \Delta\Delta G = \Delta G_{18}-\Delta G_{3} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="katex-base"><span class="katex-strut" style="height:0.6833em;"></span><span class="mord">ΔΔ</span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="katex-base"><span class="katex-strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="katex-sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></p>

<p style="text-align:left;">负的 <math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="ΔG"><mrow><mi>Δ</mi><mi>G</mi></mrow></math> 表示该配体评分低于 WT。按此定义，正的 <math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="ΔΔG"><mrow><mi>ΔΔ</mi><mi>G</mi></mrow></math> 表示相对 WT 向 ascr#3 偏移，负值表示向 ascr#18 偏移。该指标描述对接评分差异，用于候选比较；实际结合能力与选择性需要实验评估。</p>

<p style="text-align:left;">偏移方向确定后，我们继续检查两项评分各自的变化。目标配体评分降低、另一配体评分升高，以及两者同时发生，都可能产生相同方向的 <math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="ΔΔG"><mrow><mi>ΔΔ</mi><mi>G</mi></mrow></math>，但对应不同的候选特征。</p>

<p style="text-align:left;">饱和扫描后的首批重点接触复核包括 N84V、V110C、V110M 和 V368R。四者采用同一批 WT 作为参照，其 ascr#18、ascr#3 评分分别为 −6.492、−6.625 kcal/mol。</p>

<p style="text-align:left;"><br></p>

<p style="text-align:center;"><strong>点击图片可查看完整电子表格</strong></p>

<p style="text-align:left;">表中评分及差值单位均为 kcal/mol，负差值表示评分降低。</p>

<p style="text-align:left;">N84V 和 V110C 都向 ascr#18 偏移，但变化来源不同。V110C 的两项评分共同降低，其中 ascr#18 降低更多；N84V 则同时表现出 ascr#18 评分降低和 ascr#3 评分升高。因此，V110C 对 ascr#18 的评分改善更大，而 N84V 的双配体评分分化更大。</p>

<p style="text-align:left;">V110M 与 V368R 都向 ascr#3 偏移。V110M 的 ascr#3 评分接近 WT，其偏移主要来自 ascr#18 评分升高；V368R 则同时表现出 ascr#3 评分降低和 ascr#18 评分升高。将两项变化分别展开，使我们能够根据双配体分化的研究目标选择候选，并据此设计组合。</p>

<p style="text-align:left;"><br></p>

### <strong>1.5 通过组合测试，检验单点变化能否共同保留</strong> {#src-Model-Docking-48 toc="1.5 通过组合测试，检验单点变化能否共同保留"}

<p style="text-align:left;">单点结果进一步引出了组合设计：同方向的替换能否扩大评分差异？分别降低一种配体评分、提高另一种配体评分的替换，能否在同一受体中保留各自表现？</p>

<p style="text-align:left;">我们根据候选的偏移方向和评分变化方式构建组合，并同时与 WT 和各单点亲本比较。与 WT 的对照回答原有方向是否保留；与亲本的对照则检验组合是否带来额外收益。</p>

<p style="text-align:left;">N84V 与 V110C 的组合提供了一个具体例子。两种单点都向 ascr#18 偏移，因此我们希望组合能够兼顾 N84V 的双配体分化与 V110C 的 ascr#18 评分改善。实际结果中，组合的 (\Delta G_{18}) 为 −0.081、(\Delta G_{3}) 为 −0.411 kcal/mol，(\Delta\Delta G) 转为 +0.330 kcal/mol：ascr#3 的评分降低更多，原有的 ascr#18 方向未能保留。</p>

<p style="text-align:left;">接触复核进一步显示，该组合的 ascr#18 姿态仍保留 R189 离子类型接触和 W338 疏水接触，但其评分较 V110C 单点升高了 0.480 kcal/mol。这提示，部分关键接触的保留需要结合完整姿态与其他接触变化解释，单点评分变化也需要通过组合计算重新检验。</p>

<p style="text-align:left;">多数受测组合未进一步改善较优亲本的目标配体评分或扩大双配体差异。这一结果使后续研究继续聚焦单点候选，并将组合评价明确为对 WT、各单点亲本和完整接触网络的联合比较。</p>

<p style="text-align:left;"><br></p>

### <strong>1.6 从四个重点候选收敛到两个动态研究对象</strong> {#src-Model-Docking-55 toc="1.6 从四个重点候选收敛到两个动态研究对象"}

<p style="text-align:left;">结合评分分化与接触复核，我们从四个重点候选中选择 N84V 和 V368R 进入后续 MD 研究。两者分别呈现方向相反的双向评分变化，为进一步比较 ascr#18 与 ascr#3 的结构行为提供了两组代表候选。</p>

<p style="text-align:left;">N84V 的接触分析尤其说明了检查周围残基网络的必要性。在所选对接姿态中，84 位自身未检出直接配体接触；相对同批 WT，ascr#18 新增了 R189 相关离子及氢键类型接触，以及 W338 疏水接触。这些变化使我们将解释重点放在配体位置和周围接触的共同变化上，并进一步提出：这些接触能否在动态环境中维持，是否与配体定位有关？</p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:26.9477%"><col style="width:14.6153%"><col style="width:26.9477%"><col style="width:31.4893%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-290633cd2c70-docking-source-07.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-290633cd2c70-docking-source-07.avif" alt="" loading="lazy" width="132" height="99"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-fdc859343d6f-docking-source-08.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-fdc859343d6f-docking-source-08.avif" alt="" loading="lazy" width="64" height="90"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-1239c64d4af0-docking-source-09.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-1239c64d4af0-docking-source-09.avif" alt="" loading="lazy" width="132" height="99"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-c89c70191520-docking-source-10.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-c89c70191520-docking-source-10.avif" alt="" loading="lazy" width="157" height="101"></a></p></td></tr></tbody></table></div>

<p style=""><br></p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图4｜Gpr2 N84V 与两种配体的预测对接姿态。 </strong>（a）ascr#3；（b）ascr#18。展示各自的最低评分姿态及周围口袋残基。</p></td></tr></tbody></table></div>

<p style="text-align:left;">V368R 则提供了另一种值得检验的情况。虽然替换引入了精氨酸，其所选姿态中，R368 仅对 ascr#18 检出近距离接触，未检出 R368 自身的离子类型接触；两种配体都出现了新增的 K364 相关离子及氢键类型接触。因此，对 V368R 的解释同样需要考察突变位置周围的结构和接触网络，以及这些变化与双配体评分之间的关系。</p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:24.2329%"><col style="width:28.1469%"><col style="width:24.2329%"><col style="width:23.3873%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ed8369c53675-docking-source-11.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-ed8369c53675-docking-source-11.avif" alt="" loading="lazy" width="117" height="88"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-9b84a8b736bb-docking-source-12.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-9b84a8b736bb-docking-source-12.avif" alt="" loading="lazy" width="139" height="89"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-a7066f8f852e-docking-source-13.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-a7066f8f852e-docking-source-13.avif" alt="" loading="lazy" width="117" height="88"></a></p></td><td colspan="1"><p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-848ee038bf41-docking-source-14.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-848ee038bf41-docking-source-14.avif" alt="" loading="lazy" width="113" height="87"></a></p></td></tr></tbody></table></div>

<p style=""><br></p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图5｜Gpr2 V368R 与两种配体的预测对接姿态。</strong>（a）ascr#3；（b）ascr#18。展示各自的最低评分姿态及周围口袋残基。</p></td></tr></tbody></table></div>

<p style="text-align:left;">对接由此把候选筛选推进为动态问题：在全长受体的膜环境中，配体是否保持初始位置，哪些接触持续存在，哪些发生重排？我们将 WT、N84V 和 V368R 分别与两种配体配对，形成六组体系开展 MD 比较。后续动态分析将检验这些结构线索，并帮助修正对候选作用方式的理解。</p>

<p style="text-align:left;"><br></p>

### <strong>1.7 扩展分析：跨受体寻找可平行检验的接触位置</strong> {#src-Model-Docking-73 toc="1.7 扩展分析：跨受体寻找可平行检验的接触位置"}

<p style="text-align:left;">在 Gpr2 候选研究之外，我们将 Gpr3、GprC，以及秀丽隐杆线虫的 DAF-37、SRBC-64 纳入比较，探索功能相关受体中是否存在值得平行研究的接触位置。Hu 等人的研究通过不同受体的对接模型比较蛔苷素口袋，为这一分析提供了参考。[2]</p>

<p style="text-align:left;">每种受体采用五个预测模型，在同一模型内配对比较 ascr#18 与 ascr#3 的接触频率，再通过序列比对与结构映射检查残基位置的对应关系。同时记录相关残基在实际构建体中的保留情况，使接触分析、位置对应与所用结构保持一致。</p>

<p style="text-align:left;">三种真菌受体的 TM6 色氨酸——Gpr2 W338、Gpr3 W306 和 GprC W388——同时具有偏向 ascr#18 的接触差异，以及序列和结构位置对应的支持。这些结果使它们成为值得开展跨受体平行替换比较的位置，后续可通过对应位置的替换检验其作用是否具有相似性。</p>

<p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bbf52d6e8540-docking-source-15.avif" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/v8-6/v86-bbf52d6e8540-docking-source-15.avif" alt="" loading="lazy" width="552" height="182"></a></p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图6｜GprC、SRBC-64 和 DAF-37 的蛔苷素预测结合口袋。 </strong>各受体展示五种蛔苷素的对接结果，每种配体包含五个姿态。裁切自 Hu et al.（2024）Fig. 5a–c。[2]</p></td></tr></tbody></table></div>

<p style="text-align:left;">这一扩展将选点方法从单个受体内的双配体比较延伸到跨受体分析：接触差异用于发现候选位置，序列与结构对应用于判断位置之间的可比性，构建体记录则用于核对实际分析对象。原始评分、逐姿态接触表、模型编号、WT 来源及结构处理记录共同提供复查依据，也便于其他研究者在自己的受体与配体体系中应用这一分析思路。</p>

<p style="text-align:left;"><br></p>

### <strong>References</strong> {#src-Model-Docking-81 toc="References"}

<p style="text-align:left;">[1] Kuo, C.-Y., Tay, R. J., Lin, H.-C., et al. (2024). The nematode-trapping fungus Arthrobotrys oligospora detects prey pheromones via G protein-coupled receptors. <em>Nature Microbiology</em>, 9, 1738–1751. <a href="https://doi.org/10.1038/s41564-024-01679-w">https://doi.org/10.1038/s41564-024-01679-w</a></p>

<p style="text-align:left;">[2] Hu, X., et al. (2024). GprC of the nematode-trapping fungus Arthrobotrys flagrans activates mitochondria and reprograms fungal cells for nematode hunting. <em>Nature Microbiology</em>, 9, 1752–1763. <a href="https://doi.org/10.1038/s41564-024-01731-9">https://doi.org/10.1038/s41564-024-01731-9</a></p>

<p style="text-align:left;">[3] Abramson, J., et al. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. <em>Nature</em>, 630, 493–500. <a href="https://doi.org/10.1038/s41586-024-07487-w">https://doi.org/10.1038/s41586-024-07487-w</a></p>

<p style="text-align:left;">[4] Meeko developers. <em>Meeko documentation: Options of mk_export.py</em>. <a href="https://meeko.readthedocs.io/en/develop/export_cli_options.html">https://meeko.readthedocs.io/en/develop/export_cli_options.html</a> (Accessed 19 October 2026).</p>

<p style="text-align:left;">[5] Trott, O., &amp; Olson, A. J. (2010). AutoDock Vina: Improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading. <em>Journal of Computational Chemistry</em>, 31, 455–461. <a href="https://doi.org/10.1002/jcc.21334">https://doi.org/10.1002/jcc.21334</a></p>

</section>

<span id="docking-introduction" aria-hidden="true"></span>
<span id="docking-conditions" aria-hidden="true"></span>
<span id="docking-sites" aria-hidden="true"></span>
<span id="docking-saturation" aria-hidden="true"></span>
<span id="docking-score-shifts" aria-hidden="true"></span>
<span id="docking-combinations" aria-hidden="true"></span>
<span id="docking-md-candidates" aria-hidden="true"></span>
<span id="docking-cross-receptor" aria-hidden="true"></span>
