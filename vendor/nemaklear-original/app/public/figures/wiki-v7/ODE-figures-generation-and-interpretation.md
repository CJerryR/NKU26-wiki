# ODE图3-2至图3-5：生成指令与图片解读

图片解读逐字保留自本次对话。图3-2使用已去掉标题下方和图片最底部灰色说明文字的版本；图3-3至图3-5沿用这一排版风格。

模型版本：v7／ODE r07／双通道 r04。脚本使用已保存并经过哈希核验的数据，生成PNG、SVG、PDF及数据检查记录。

## 图3-2：不同背景密度下的ODE显色拟合

### 生成指令

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig2_density_response.py
```

[输出目录](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig2-density-response)

![图3-2](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig2-density-response/fig-3-2-density-response.png)

### 图片解读（对话原文）

**这张图怎么读**

- **左右面板**分别是P3与P18，共用坐标范围。
- **横轴**是Mi目标密度；**纵轴**是8小时总色素浓度，包含基础产色。
- **绿、蓝、紫色**分别表示Ce背景密度为0、80、200。
- **虚线叉号**是预设显色目标；**实线圆点**是ODE实际输出。比较同色的两条线，就能看出拟合偏差。
- 灰色水平点线表示 **0.07 mg/mL空白**。每条线连接六个Mi设计点：0、5、10、40、80、120。

**重点看三个现象**

1. **整体趋势能跟随目标，但仍保留偏差。**  
   P3与P18的18点RMSE分别为 **0.009688、0.009656 mg/mL**。这是相对预设模拟目标的拟合误差。

2. **低背景、低Mi时，模型响应偏弱。**  
   例如Ce=0、Mi=10时，P3的目标为0.0804，实际输出为0.0718 mg/mL，已接近0.0700的空白。说明低值区保留下来的刺激信号较小，整体RMSE不能代替对这一局部的检查。

3. **Ce背景本身也会显著增加颜色。**  
   即使Mi=0、Ce=200，P3和P18也分别达到约0.443、0.285 mg/mL。因此，单看颜色深浅无法直接判断Mi多少；两路响应差异是后续双通道解读的依据。

这张图支持的结论是：**校准后的ODE总体跟随预设显色变化，同时保留低刺激区的偏差和背景干扰。** 后续图4、图5再检查这些实际输出能否支持Mi密度估计。

## 图3-3：净色素积累

### 生成指令

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig3_net_timecourse.py
```

[输出目录](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig3-net-timecourse)

![图3-3](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig3-net-timecourse/fig-3-3-net-timecourse.png)

### 图片解读（对话原文）

**这张图怎么读**

横轴是刺激后的时间，纵轴是**净色素浓度**：

\[
C_{\mathrm{net},j}(t)=C_{\mathrm{sample},j}(t)-C_{\mathrm{blank},j}(t)
\]

因此空白虚线始终为零；其他曲线表示刺激带来的额外色素。这里扣除的是**每个时刻对应的空白**，不是全程减去8小时空白0.07。

8小时的净色素如下，单位为mg/mL：

| 样本 | P3 | P18 |
|---|---:|---:|
| 仅Mi：Mi=120、Ce=0 | 0.116 | 0.226 |
| 仅Ce：Mi=0、Ce=200 | 0.373 | 0.215 |
| 混合：Mi=120、Ce=200 | 0.473 | 0.410 |

**重点看三点：**

1. **色素随时间逐渐积累。** 早期增长较慢，随后曲线逐渐拉开；到8小时仍在上升，图中尚未出现平台。
2. **两个通道对同一样本的响应不同。** 仅Mi样本在P18中的净输出更高，仅Ce样本在P3中更高。这种配对响应差异为后续区分目标与背景提供信息。
3. **P18中的两条单物种曲线很接近。** 这说明不同组成的样本可能产生相近的单通道读数；结合P3后，这两个样本才更容易区分。

注意：纯Mi和纯Ce的密度分别是120和200，不能直接用曲线高度比较“单条线虫”的产色能力。**本轮校准依据是8小时终点，早期曲线属于模型推演**；这张图展示动态过程，并未确定最佳检测时间。

## 图3-4：双通道颜色空间

### 生成指令

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig4_signal_space.py
```

[输出目录](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig4-signal-space)

![图3-4](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig4-signal-space/fig-3-4-signal-space.png)

### 图片解读（对话原文）

**这张图怎么读**

每个点代表一份模拟混合样本，共 **9档Mi × 5档Ce＝45组**。

- **横轴、纵轴**分别是P3、P18的手机颜色指数：\(x_j=-\log_{10}(B_{\mathrm{sample},j}/B_{\mathrm{blank},j})\)。
- **点的颜色**表示已知Mi密度，由紫到黄逐渐升高。
- **彩色实线**连接固定Mi、改变Ce的样本。
- **灰色虚线**连接固定Ce、改变Mi的样本。

**核心看两支箭头。** 它们都从 **Mi=40、Ce=80** 出发：

| 改变方式 | P3指数增加量 | P18指数增加量 |
|---|---:|---:|
| Mi从40增加到80，Ce保持80 | 0.0171 | 0.0292 |
| Ce从80增加到140，Mi保持40 | 0.0428 | 0.0253 |

增加Mi时，P18的变化更突出，箭头更陡；增加Ce时，P3的变化更突出，箭头更平。这里比较的是**变化方向**，两支箭头对应的密度增量不同，不能直接用长度比较灵敏度。

**为什么这能解释双通道的价值？**  
目标增加和背景增加都会使颜色增强，但它们在二维空间中的移动方向不同。保留两路读数，就有机会利用这种差异区分两种贡献；单看一个通道，会丢失另一方向的信息。

这张图展示的是模拟条件下的可区分结构。具体能把Mi估计得多准，要看下一张图3-5的留出样本检验。

## 图3-5：Mi密度预测与模型比较

### 生成指令

运行一次即可生成Wiki三面板版和PPT两面板版：

```bash
cd "/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab"

.venv/bin/python -B \
  ode-v1/figures/2026-10-17-wiki-refinement/plot_fig5_prediction_comparison.py
```

[输出目录](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig5-prediction-comparison)

**Wiki版**

![图3-5 Wiki版](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig5-prediction-comparison/fig-3-5-prediction-comparison-wiki.png)

### 图片解读（对话原文）

**这张图怎么读**

- **A：双通道预测的整体表现。** 横轴是已知Mi密度，纵轴是预测密度；点越接近虚线，预测越准确。颜色和形状区分Ce背景。全部19组检验样本均保留。
- **B：低密度区域放大。** 展示同一检验集中的11个点。可以看出，整体图中看似接近对角线的点，在低值区仍可能有明显偏差。例如Mi=0、Ce=110时预测约为−4.70，原始负值没有截断。
- **C：相同检验集上的模型比较。** RMSE越小，整体预测误差越小：

| 模型 | RMSE（J2/100 cm³土样） |
|---|---:|
| 仅P3 | 36.59 |
| 仅P18 | 28.43 |
| 双通道 | **3.01** |

**这张图支持的结论是：在当前模拟条件下，双通道明显改善了Mi密度估计，但低密度处仍保留偏差。**

这些检验组合没有参与回归拟合，但仍来自同一个无噪声ODE生成器。检验点主要集中在零目标及10、80附近，因此不能将结果直接解释为整个密度范围的实测准确度。

**PPT版**保留整体预测和RMSE比较，适合集中讲“双通道带来了多少改善”：

![图3-5 PPT版](/Users/yangruoxi/Documents/ChatGPT/ODE-Research-Lab/ode-v1/figures/2026-10-17-wiki-refinement/fig5-prediction-comparison/fig-3-5-prediction-comparison-ppt.png)
