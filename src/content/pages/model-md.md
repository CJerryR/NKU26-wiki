---
title: Molecular Dynamics
heading: Molecular Dynamics
sub: ''
crumbs:
  - Model
  - Molecular Dynamics
route: model-md
search: true
description: ''
preserveAuthorFormatting: true
meta: {}
draft: false
hidden: false
---
<p class="author-source-link"><a href="/source-archive/#meeting-20261019" data-source-document="meeting-20261019-a689408f0daa">Original submission (.docx)</a><span role="status" aria-live="polite"></span></p>

<section class="author-manuscript" lang="zh">

## <strong>Molecular Dynamics｜膜环境中的配体定位与接触变化</strong> {#src-Model-Molecular-Dynamics-1 toc="Molecular Dynamics｜膜环境中的配体定位与接触变化"}

<p style="text-align:left;">分子对接给出了 N84V 和 V368R 的候选结合姿态。我们进一步开展分子动力学（molecular dynamics，MD）模拟，观察这些姿态在膜环境中如何调整，以及哪些受体–配体接触能够保持。</p>

### <strong>2.1 从对接姿态建立六组膜体系</strong> {#src-Model-Molecular-Dynamics-3 toc="2.1 从对接姿态建立六组膜体系"}

<p style="text-align:left;">将 WT、N84V 和 V368R 分别与 ascr#18、ascr#3 配对，构建六组复合物。各组从自身的对接姿态出发，将配体放回对应的全长受体，处理恢复片段与配体及周围结构的空间冲突，再将复合物置于 POPC 脂质双层、溶剂和离子环境中。</p>

<p style="text-align:left;">体系先经过能量最小化，再在定容条件下逐步升温至 303.15 K，并进行短时恒温预热。随后在 1 bar 下分阶段进行压力平衡，逐步减弱位置和二面角约束，使受体、配体、膜脂和溶剂共同松弛。撤去约束后继续进行准备模拟，检查温度、密度、膜平面面积及盒高的变化。六组随后各完成一条 100 ns 生产模拟。</p>

### <strong>2.2 以局部口袋为参照，观察配体运动</strong> {#src-Model-Molecular-Dynamics-6 toc="2.2 以局部口袋为参照，观察配体运动"}

<p style="text-align:left;">为区分受体整体运动与配体在口袋内的移动，我们用六组共同的一组口袋主链原子对齐轨迹，再计算配体相对各自生产起始帧的重原子均方根偏差（RMSD）。同时采用全受体和膜内螺旋核心对齐，比较不同参照下的结果。</p>

<p style="text-align:left;">六组统一以 50–100 ns 为主要比较窗口，以减少早期构象松弛的影响，并利用全程轨迹追踪接触形成、丢失和配体换位。RMSD 描述配体偏离自身起始姿态的程度，接触占有率则表示窗口内满足接触判据的采样帧比例。</p>

<p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-d5f1716f681b7d35-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-d5f1716f681b7d35-00.json" alt="" loading="lazy" width="552" height="319"></a></p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图1｜不同结构对齐方式下的配体重原子 RMSD。</strong> 分别以全受体、膜内螺旋核心和局部口袋主链对齐，各轨迹以自身生产起始结构为参照。曲线为每 100 ps 采样数据的 1 ns 居中滑动平均，阴影标示 50–100 ns 比较窗口。每组包含一条 100 ns 轨迹。</p></td></tr></tbody></table></div>

<p style="text-align:left;">口袋对齐与膜内螺旋核心对齐的曲线接近，而全受体对齐的结果明显不同。这说明受体其他区域的运动会影响配体 RMSD 的读数；以局部结构为参照，更容易看清配体在结合区域内的姿态变化。</p>

### <strong>2.3 N84V–ascr#18：Arg189 持续锚定配体羧酸端</strong> {#src-Model-Molecular-Dynamics-12 toc="2.3 N84V–ascr#18：Arg189 持续锚定配体羧酸端"}

<p style="text-align:left;">N84V–ascr#18 中，Arg189 与配体末端羧酸盐保持持续接触。模型中的 Arg189 胍基带正电，配体羧酸盐带负电；二者的近距离接触符合盐桥特征，并具有氢键几何。盐桥的静电作用及其几何特征，为理解带电末端的定位提供了参考。[1]</p>

<p style="text-align:left;">在 50–100 ns，Arg189 胍基氮与配体羧酸盐氧的最近距离在全部采样帧中均不超过 4 Å，接触占有率为 100%；其中 93.6% 的采样帧至少存在一条氢键。氢键按供体–受体距离 ≤3.0 Å、D–H–A 角 ≥150° 判断。采用相同判据，N84V–ascr#3 和 WT–ascr#18 在这一时段均未检出 Arg189 与配体羧酸端的氢键。</p>

<p style="text-align:center;"><a href="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-f0178ce121bafde0-00.json" target="_blank" rel="noopener"><img src="https://static.igem.wiki/teams/6303/wiki/meeting-20261019/meeting-image-f0178ce121bafde0-00.json" alt="" loading="lazy" width="552" height="251"></a></p>

<div class="author-table-scroll"><table class="author-table"><colgroup><col style="width:100.0000%"></colgroup><tbody><tr><td colspan="1"><p style="text-align:left;"><strong>图2｜Gpr2 N84V 中 Arg189 与 ascr#18 羧酸端的接触。</strong> （a）64.64 ns 时的模拟快照，虚线标示 Arg189 与配体之间的氢键，供体–受体距离为 2.77 Å。（b）50–100 ns 内的氢键占有率：N84V–ascr#18 为 93.6%，WT–ascr#18 和 N84V–ascr#3 均为 0%。每 100 ps 采样，氢键判据同正文。</p></td></tr></tbody></table></div>

<p style="text-align:left;">持续接触也伴随着较小的配体移动。口袋对齐后，N84V–ascr#18 的后半程平均配体 RMSD 低于 WT–ascr#18 和 N84V–ascr#3；改用膜内螺旋核心对齐，仍保留这一关系。Arg189 盐桥及其中的氢键，为 ascr#18 在该构象中保持位置提供了机制线索。</p>

<p style="text-align:left;"><br></p>

<p style="text-align:center;"><strong>点击图片可查看完整电子表格</strong></p>

### <strong>2.4 V368R–ascr#3：尚未找到稳定的机制解释</strong> {#src-Model-Molecular-Dynamics-20 toc="2.4 V368R–ascr#3：尚未找到稳定的机制解释"}

<p style="text-align:left;">原始 V368R–ascr#3 轨迹中，配体离开初始位置，随后由 Arg345 固定羧酸端。与此同时，Arg368 的带电末端从 Asp70 附近移开，使我们开始关注受体局部变化与配体重定位的关系。然而，WT–ascr#3 和 V368R–ascr#18 也具有持续的 Arg345–配体接触。因此，Arg345 是多个体系都能利用的固定位置，不能解释 V368R 对 ascr#3 的偏好增强。</p>

<p style="text-align:left;">为寻找其他稳定作用，我们设计了两种 V368R–ascr#3 起始构象，各进行了 100 ns MD 模拟。一种让配体羧酸端靠近突变新增的 Arg368，检验其能否直接固定配体；另一种让羧酸端靠近 Arg189，借鉴 N84V–ascr#18 中的锚定方式。两条轨迹均在早期失去预设接触，后期主要转为 Arg345 固定，没有得到新的持续锚定模式。</p>

<p style="text-align:left;">全受体直接盐桥、氢键及组合接触筛查发现，Arg189 起点的轨迹中，Asp89 曾固定 ascr#3 的糖环：这处氢键在 20–50 ns 频繁出现，后半程大多消失。氢键形成和丢失前后，Arg368–Asp70 接触均保持，未显示出与糖环移动相对应的变化。ascr#18 的静态模型也能容纳相同的糖环位置。因此，Asp89 提供了一种阶段性结合姿势，却没有形成解释 V368R–ascr#3 偏好的稳定线索。</p>

<p style="text-align:left;"><strong>补充模拟和后续分析仍未找到类似 N84V–ascr#18 中 Arg189 持续锚定的机制线索。Vina 所预测的 V368R 对 ascr#3 偏好增强，其结构机制仍待深入研究。</strong></p>

### <strong>2.5 两种候选的机制解释</strong> {#src-Model-Molecular-Dynamics-25 toc="2.5 两种候选的机制解释"}

<p style="text-align:left;">N84V 的 MD 结果为 Vina 预测的 ascr#18 偏好提供了结构线索：Arg189 持续锚定配体羧酸端，形成盐桥和氢键接触，同时配体在局部口袋中的移动较小。这为 ascr#18 如何保持结合姿态提供了具体解释。</p>

<p style="text-align:left;">V368R 则尚未获得类似的机制线索。两条补充模拟未能保持预设的 Arg368 或 Arg189 接触，后期形成的 Arg345 接触也见于对照；新发现的 Asp89 氢键仅在部分时段保持。因此，现有 MD 仍未解释 Vina 所预测的 V368R 对 ascr#3 偏好增强，其结构机制仍待深入研究。</p>

### <strong>References</strong> {#src-Model-Molecular-Dynamics-28 toc="References"}

<p style="text-align:left;">[1] Donald, J. E., Kulp, D. W., &amp; DeGrado, W. F. (2011). Salt bridges: Geometrically specific, designable interactions. <em>Proteins: Structure, Function, and Bioinformatics</em>, 79(3), 898–915. <a href="https://doi.org/10.1002/prot.22927">https://doi.org/10.1002/prot.22927</a></p>

</section>

<span id="md-introduction" aria-hidden="true"></span>
<span id="md-systems" aria-hidden="true"></span>
<span id="md-pocket-rmsd" aria-hidden="true"></span>
<span id="md-n84v" aria-hidden="true"></span>
<span id="md-v368r" aria-hidden="true"></span>
<span id="md-next-steps" aria-hidden="true"></span>
