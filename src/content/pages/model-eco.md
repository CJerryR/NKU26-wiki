---
title: Economic Benefit
heading: Economic Benefit
sub: ''
crumbs:
  - Model
  - Economic Benefit
route: model-eco
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<div data-nemaklear-original></div>

<p class="author-source-link"><a href="/source-archive/#meeting-20261019" data-source-document="meeting-20261019-cf8e375550b3">Original submission (.docx)</a><span role="status" aria-live="polite"></span></p>

<section class="author-manuscript" lang="zh">

## 4. <strong>Eco｜从显色读数到管理决策</strong> {#src-Model-Eco-1 toc="4. Eco｜从显色读数到管理决策"}

<p style="text-align:left;">我们开发了 <strong>NemaKlear 交互网页</strong>，将 ODE 显色模拟、双通道密度估计和经济效益分析连接起来。读者可以选择模拟土样或输入两路吸光度读数，查看目标线虫密度，并比较不同管理方式下的单季净收益。</p>

<p style="text-align:left;">这个网页让我们能够直接探索一个问题：<strong>当农户已经可以选择统一处理时，知道线虫密度还能带来多少额外收益？</strong> 为此，Eco 模型将密度与潜在产量损失、处理成本和检测费用联系起来，考察密度信息何时会改变管理选择，以及这种改变能否覆盖获取信息和调整处理的成本。</p>

### <strong>4.1 在交互网页中探索从显色到收益的联系</strong> {#src-Model-Eco-4 toc="4.1 在交互网页中探索从显色到收益的联系"}

<p style="text-align:left;">在 NemaKlear 中，读者可以沿着“显色响应 → 密度估计 → 管理选择 → 经济结果”的过程查看模型输出。</p>

<p style="text-align:left;">网页提供两种输入方式：</p>

<p style="text-align:left;">**模拟土样：**选择不同样本，观察两路显色随时间的变化及对应的密度估计。</p>

<p style="text-align:left;">**手动读数：**输入两路 A480 读数，直接开展密度估计。该模式中的 ODE 曲线作为参考展示。</p>

<p style="text-align:left;">获得密度估计后，网页联动显示管理分级、潜在产量损失，以及“不检测、不处理”“不检测、统一处理”和“检测后分级处理”三种情景的净收益表与收益曲线。读者可以比较检测后分级处理相对两个基准的收益变化，也可以切换密度点估计、预测区间端点和跨越分级界限时的相邻情景，观察密度判断如何影响处理选择。</p>

<p style="text-align:left;">探索时，可以重点观察三个问题：</p>

<p style="text-align:left;">低密度下，检测能否帮助减少不必要的处理？</p>

<p style="text-align:left;">分级处理与统一处理相同时，检测费用如何影响净收益？</p>

<p style="text-align:left;">高密度下，加强处理带来的额外收益能否覆盖增加的成本？</p>

<p style="text-align:left;">网页同时提供完整报告，供读者查看参数与敏感性分析，并下载计算结果进行复查。</p>

### <strong>4.2 以密度为接口，连接显色与经济分析</strong> {#src-Model-Eco-15 toc="4.2 以密度为接口，连接显色与经济分析"}

<p style="text-align:left;">ODE、双通道模型和 Eco 分别完成三个连续任务：ODE 描述受体输入如何经胞内通路形成显色输出；双通道模型利用两路颜色特征，在背景线虫共同贡献信号的条件下估计南方根结线虫密度；Eco 接收密度估计，结合种植与管理参数计算经济结果。</p>

<p style="text-align:left;">模拟土样的计算过程为：</p>

<p style="text-align:left;"><strong>ODE 显色输出 → 终点吸光度与空白校正 → 双通道密度回归 → Eco 管理情景比较。</strong></p>

<p style="text-align:left;">密度统一为每 100 cm³ 土壤中的二龄幼虫数量（J2/100 cm³）。两路读数采用与校准一致的处理方式，回归结果经单位和适用范围检查后进入 Eco。经济参数独立来自文献与情景设定，颜色与收益通过密度这一中间量连接。</p>

<p style="text-align:left;">接口同时保留密度点估计及其回归预测区间。当区间跨过管理分级界限时，程序分别计算界限两侧的情景，显示处理选择与收益比较可能如何变化。负密度、超出校准范围或超出经济模型支持范围的结果会停止向后传递，页面同时说明校准状态与适用条件。</p>

### <strong>4.3 从线虫密度计算产量损失与净收益</strong> {#src-Model-Eco-21 toc="4.3 从线虫密度计算产量损失与净收益"}

<p style="text-align:left;">我们选择西班牙设施番茄与南方根结线虫作为示例，以种植前密度为输入，按每公顷、一个生产季核算收益。</p>

<p style="text-align:left;">密度与相对产量之间采用 Seinhorst 损失关系，参数依据 Expósito 等（2020）未嫁接番茄春季试验的拟合结果。密度低于耐受水平时，模型预测产量保持在正常水平；超过这一水平后，相对产量随密度增加而下降，并逐渐接近下限。示例中的耐受密度换算后为 <strong>6 J2/100 cm³</strong>，最低相对产量为 <strong>0.34</strong>。<a href="https://doi.org/10.3389/fpls.2020.560024">1</a></p>

<p style="text-align:left;">在此基础上，模型引入作物售价、基础生产成本、处理费用和处理效果，计算：</p>

<p style="text-align:left;"><strong>单季净收益＝考虑剩余线虫损失后的销售收入－基础生产成本－处理成本－检测成本。</strong></p>

<p style="text-align:left;">经济与处理资料参考 Talavera-Rubia 等（2022）的研究。<a href="https://doi.org/10.3390/plants11202774">2</a> 我们先将文献中的虫口降低率在参考密度 100 J2/100 cm³ 下，通过密度—产量关系换算为避免损失的比例，再将这一比例固定用于不同密度情景。因此，<strong>避免损失的比例随密度保持不变</strong>是本示例的一项简化假设。</p>

<p style="text-align:left;">模型综合不同研究中的产量关系和经济参数，形成可复算的文献情景。检测费用暂设为 <strong>5 EUR/ha</strong>，属于团队假设。文献价格、处理费用与换算效果均保留来源，便于结合实际应用条件更新。</p>

### <strong>4.4 用两个基准区分防治收益与信息价值</strong> {#src-Model-Eco-28 toc="4.4 用两个基准区分防治收益与信息价值"}

<p style="text-align:left;">检测后收益提高，可能同时来自防治本身和依据密度调整处理的作用。为区分这两部分，我们设置三种管理情景。</p>

<p style="text-align:left;"><br></p>

<p style="text-align:center;"><strong>点击图片可查看完整电子表格</strong></p>

<p style="text-align:left;">分级处理采用以下预设规则，其中处理方案的资料来自文献 <a href="https://doi.org/10.3390/plants11202774">2</a>。</p>

<p style="text-align:left;"><br></p>

<p style="text-align:center;"><strong>点击图片可查看完整电子表格</strong></p>

<p style="text-align:left;">这里，10 和 80 J2/100 cm³ 是预设的管理分级界限；6 J2/100 cm³ 是产量曲线中的耐受密度，两者承担不同作用。模型另行比较各候选方案的净收益，检查预设分级是否与当前参数下收益最高的选项一致。</p>

<p style="text-align:left;">我们分别计算两项收益差：</p>

<p style="text-align:left;"><strong>相对不处理的净收益改善</strong><br>＝检测后分级处理净收益－不检测、不处理净收益。</p>

<p style="text-align:left;"><strong>相对统一处理的净收益改善</strong><br>＝检测后分级处理净收益－不检测、统一处理净收益。</p>

<p style="text-align:left;">前者评价检测与分级处理整套方案的收益；后者评价在已有统一处理选择时，利用密度信息调整行动的条件性价值。将两个基准分开，有助于判断收益增加来自实施防治，还是来自获得信息后对处理方式的调整。</p>

### <strong>4.5 密度信息何时值得获取</strong> {#src-Model-Eco-40 toc="4.5 密度信息何时值得获取"}

<p style="text-align:left;">在密度为 <strong>100 J2/100 cm³</strong>、其余参数保持示例配置时，模型得到以下结果：</p>

<p style="text-align:left;"><br></p>

<p style="text-align:center;"><strong>点击图片可查看完整电子表格</strong></p>

<p style="text-align:left;">两项差值回答不同的问题。17,028.48 EUR/ha 体现整套检测与防治方案相对不处理的改善；496.26 EUR/ha 则体现相对已有统一处理方案，调整处理后增加的净收益。在这一情景下，较强处理额外避免的损失能够覆盖增加的处理费用与检测费用。</p>

<p style="text-align:left;">随着密度变化，信息的作用也随之变化：</p>

<p style="text-align:left;">**低密度时，**检测可能帮助减少不必要的处理。</p>

<p style="text-align:left;">**中等密度区间，**分级处理与统一处理采用相同方案，两者收益差为 <strong>−5 EUR/ha</strong>，即新增的检测费用。</p>

<p style="text-align:left;">**高密度时，**加强处理是否值得，取决于额外避免的损失能否覆盖增加的成本。</p>

<p style="text-align:left;">因此，评价检测价值需要同时考察<strong>密度信息是否改变管理选择，以及改变后能否提高净收益</strong>。</p>

<p style="text-align:left;">我们进一步分别改变检测费用、处理费用、处理效果和作物售价，检查两项收益差对假设的敏感性。当分级处理与统一处理采用相同措施时，两侧共享的成本和效果参数同步调整，保持比较条件一致。</p>

<p style="text-align:left;">这些结果是在给定密度及成本、效果假设下的条件性计算。当前密度预测区间反映模拟回归的形式不确定性，其实测覆盖率仍需真实样本与读数标定检验。网页展示的区间端点及相邻密度情景用于观察判断变化的经济影响，所得收益变化范围不构成收益的置信区间。真实检测误差可能改变处理选择，其经济影响还需结合实测误差分布评价。</p>

### <strong>4.6 让经济比较反馈到检测设计</strong> {#src-Model-Eco-52 toc="4.6 让经济比较反馈到检测设计"}

<p style="text-align:left;">Eco 将检测设计的重点进一步落到可能改变管理选择的密度区间。当不同密度对应不同处理方式时，半定量或定量信息有助于支持管理分级；尤其在分级界限附近，估计偏差可能改变方案选择，因此这些区域应成为后续标定与评价的重点。</p>

<p style="text-align:left;">这一需求也体现在网页的结果呈现中：同时保留密度估计、对应管理等级与两个基准下的收益比较，并在估计范围跨越分级界限时展示相邻情景，帮助读者判断结论对密度估计的依赖。</p>

<p style="text-align:left;">后续将结合真实样本与手机读数校准密度估计，并通过应用调研更新采样覆盖、每公顷检测费用和管理参数。这些数据将用于检验前端读数能否区分有关密度区间，以及获取这些信息的成本是否合理。</p>

<p style="text-align:left;">为便于复算与更新，我们将参数配置与计算程序分开保存，并提供示例输入和可再生成的报告。现有自动化检查覆盖密度—损失计算、成本核算和比较基准的一致性；实际应用收益仍需当地数据检验。其他研究者可以在这一框架中替换作物、价格和处理参数，评价其检测方案在具体管理条件下的价值。</p>

### <strong>References</strong> {#src-Model-Eco-57 toc="References"}

<p style="text-align:left;">[1] Expósito, A., Pujolà, M., Achaerandio, I., Giné, A., Escudero, N., Fullana, A. M., Cunquero, M., Loza-Alvarez, P., &amp; Sorribas, F. J. (2020). Tomato and Melon <em>Meloidogyne</em> Resistant Rootstocks Improve Crop Yield but Melon Fruit Quality Is Influenced by the Cropping Season. <em>Frontiers in Plant Science, 11</em>, 560024. <a href="https://doi.org/10.3389/fpls.2020.560024">DOI: 10.3389/fpls.2020.560024</a></p>

<p style="text-align:left;">[2] Talavera-Rubia, M., Vela-Delgado, M. D., &amp; Verdejo-Lucas, S. (2022). A Cost-Benefit Analysis of Soil Disinfestation Methods against Root-Knot Nematodes in Mediterranean Intensive Horticulture. <em>Plants, 11</em>(20), 2774. <a href="https://doi.org/10.3390/plants11202774">DOI: 10.3390/plants11202774</a></p>

<p style="text-align:left;"><br></p>

</section>

<span id="eco-introduction" aria-hidden="true"></span>
<span id="eco-interface" aria-hidden="true"></span>
<span id="eco-economics" aria-hidden="true"></span>
<span id="eco-baselines" aria-hidden="true"></span>
<span id="eco-example" aria-hidden="true"></span>
<span id="eco-design" aria-hidden="true"></span>
<span id="eco-explorer" aria-hidden="true"></span>
