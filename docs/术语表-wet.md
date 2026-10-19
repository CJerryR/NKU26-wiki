# 正文规则执行记录：实验、项目与团队页面

基线：`e205f4a`。仅修改分配的 12 个内容 JSON；未构建、未导出、未发布。

## 覆盖与标题层级

| 页面 | 一级章节 | 连续编号子章节 | 术语定义 | 待确认词项 |
| --- | ---: | ---: | ---: | ---: |
| attributions | 3 | 4 | 13 | 12 |
| background | 5 | 7 | 17 | 15 |
| contribution | 3 | 11 | 22 | 12 |
| description | 4 | 7 | 22 | 22 |
| engineering | 4 | 12 | 25 | 19 |
| experiments | 3 | 20 | 8 | 7 |
| members | 3 | 4 | 5 | 2 |
| parts | 2 | 2 | 11 | 1 |
| part-collection | 1 | 0 | 0 | 0 |
| protocols | 1 | 0 | 0 | 0 |
| results | 3 | 13 | 25 | 45 |
| safety | 2 | 6 | 3 | 7 |

标题组件只改 sentence case，不强加正文章节数字；正文 h3 逐章连续编号，现有显式 anchor 全部保留。Contribution 和 Engineering 修复导入时错置的标题层级；引用条目原文、CSV、sourceCellRuns、材料编号、图片源和视频未改。

## 逐页术语定义位置

完整机读明细（含匹配计数、首次块位置、原稿入口删除证据、标题前后对照及科学标识库存）见 `术语表-wet.json`。

| 页面 | 全称 | 统一缩写 | 首次位置 |
| --- | --- | --- | --- |
| attributions | molecular dynamics | MD | `blocks[4].items[2].specificTasks[1].text` |
| attributions | interaction fingerprint | IFP | `blocks[4].items[2].specificTasks[3].text` |
| attributions | root mean square deviation | RMSD | `blocks[4].items[2].specificTasks[5].text` |
| attributions | Human Practices | HP | `blocks[7].items[0].specificTasks[6].text` |
| attributions | Microsoft PowerPoint presentations | PPTs | `blocks[7].items[0].specificTasks[7].text` |
| attributions | G protein-coupled receptor | GPCR | `blocks[7].items[1].specificTasks[2].text` |
| attributions | ordinary differential equation | ODE | `blocks[7].items[1].specificTasks[2].text` |
| attributions | principal investigators | PI | `blocks[7].items[1].specificTasks[12].text` |
| attributions | plant-parasitic nematodes | PPN | `blocks[10].items[4].specificTasks[4].text` |
| attributions | histidine | His | `blocks[10].items[6].specificTasks[0].text` |
| attributions | ascaroside #3 | ascr#3 | `blocks[12].items[0].specificTasks[2].text` |
| attributions | ascaroside #18 | ascr#18 | `blocks[12].items[0].specificTasks[2].text` |
| attributions | Meloidogyne incognita | Mi | `blocks[14].items[3].specificTasks[0].text` |
| background | ascaroside #18 | ascr#18 | `blocks[3].body` |
| background | plant-parasitic nematode | PPN | `blocks[3].body` |
| background | ascaroside #3 | ascr#3 | `blocks[4].body` |
| background | G protein-coupled receptors | GPCR | `blocks[6].body` |
| background | Arthrobotrys oligospora | A. oligospora | `blocks[7].body` |
| background | ascaroside #7 | ascr#7 | `blocks[7].body` |
| background | wild type | WT | `blocks[7].body` |
| background | Saccharomyces cerevisiae | S.c | `blocks[8].body` |
| background | Arthrobotrys flagrans | A. flagrans | `blocks[9].body` |
| background | green fluorescent protein | GFP | `blocks[9].body` |
| background | mitogen-activated protein kinase | MAPK | `blocks[10].body` |
| background | guanine nucleotide-binding proteins | G protein | `blocks[10].body` |
| background | interaction fingerprints | IFP | `blocks[12].body` |
| background | Caenorhabditis elegans | Ce | `blocks[13].body` |
| background | molecular dynamics | MD | `blocks[17].body` |
| background | synthetic transcription factors | sTF | `blocks[19].body` |
| background | ordinary differential equations | ODE | `blocks[20].body` |
| contribution | deoxyribonucleic acid | DNA | `blocks[3].body` |
| contribution | ribonucleic acid | RNA | `blocks[6].body` |
| contribution | single-guide RNA | sgRNA | `blocks[6].body` |
| contribution | Saccharomyces cerevisiae | S.c | `blocks[12].body` |
| contribution | complementary DNA | cDNA | `blocks[19].body` |
| contribution | G protein-coupled receptor | GPCR | `blocks[20].body` |
| contribution | polymerase chain reaction | PCR | `blocks[29].body` |
| contribution | wild type | WT | `blocks[36].body` |
| contribution | alanine | Ala | `blocks[36].body` |
| contribution | ascaroside #3 | ascr#3 | `blocks[39].body` |
| contribution | ascaroside #18 | ascr#18 | `blocks[39].body` |
| contribution | structure-data format | SDF | `blocks[45].body` |
| contribution | Protein Data Bank format with partial charges and atom types | PDBQT | `blocks[45].body` |
| contribution | Caenorhabditis elegans | Ce | `blocks[48].body` |
| contribution | molecular dynamics | MD | `blocks[52].body` |
| contribution | ordinary differential equation | ODE | `blocks[56].body` |
| contribution | synthetic transcription factor | sTF | `blocks[57].body` |
| contribution | red–green–blue | RGB | `blocks[58].body` |
| contribution | Meloidogyne incognita | Mi | `blocks[58].body` |
| contribution | Human Practices | HP | `blocks[68].body` |
| description | plant-parasitic nematodes | PPN | `blocks[3].body` |
| description | Heterodera glycines | H. glycines | `blocks[3].body` |
| description | Meloidogyne incognita | Mi | `blocks[3].body` |
| description | second-stage juveniles | J2 | `blocks[5].body` |
| description | polymerase chain reaction | PCR | `blocks[10].body` |
| description | quantitative polymerase chain reaction | qPCR | `blocks[10].body` |
| description | next-generation sequencing | NGS | `blocks[10].body` |
| description | loop-mediated isothermal amplification | LAMP | `blocks[10].body` |
| description | recombinase polymerase amplification | RPA | `blocks[10].body` |
| description | convolutional neural network | CNN | `blocks[10].body` |
| description | ascaroside #18 | ascr#18 | `blocks[14].body` |
| description | Caenorhabditis elegans | Ce | `blocks[14].body` |
| description | ascaroside #3 | ascr#3 | `blocks[14].body` |
| description | ascaroside #5 | ascr#5 | `blocks[14].body` |
| description | G protein-coupled receptor | GPCR | `blocks[17].accompanyingBody` |
| description | Arthrobotrys oligospora | A. oligospora | `blocks[17].accompanyingBody` |
| description | mitogen-activated protein kinase | MAPK | `blocks[17].accompanyingBody` |
| description | Human Practices | HP | `blocks[19].body` |
| description | ordinary differential equation | ODE | `blocks[30].accompanyingBody` |
| description | Saccharomyces cerevisiae | S.c | `blocks[31].body` |
| description | molecular dynamics | MD | `blocks[36].body` |
| description | red–green–blue | RGB | `blocks[38].body` |
| engineering | design–build–test–learn | DBTL | `blocks[5].body` |
| engineering | ascaroside #18 | ascr#18 | `blocks[5].body` |
| engineering | ascaroside #3 | ascr#3 | `blocks[5].body` |
| engineering | G protein-coupled receptors | GPCR | `blocks[5].body` |
| engineering | Saccharomyces cerevisiae | S.c | `blocks[16].body` |
| engineering | superfolder green fluorescent protein | sfGFP | `blocks[16].body` |
| engineering | homologous recombination | HR | `blocks[16].body` |
| engineering | green fluorescent protein | GFP | `blocks[22].body` |
| engineering | Calcofluor White | CFW | `blocks[24].body` |
| engineering | synthetic transcription factor | sTF | `blocks[36].rightCaption` |
| engineering | pheromone-responsive domain | PRD | `blocks[36].afterBody` |
| engineering | DNA-binding domain | DBD | `blocks[36].afterBody` |
| engineering | wild type | WT | `blocks[50].body` |
| engineering | alanine | Ala | `blocks[50].body` |
| engineering | molecular dynamics | MD | `blocks[60].body` |
| engineering | 1-palmitoyl-2-oleoyl-sn-glycero-3-phosphocholine | POPC | `blocks[62].body` |
| engineering | guanine nucleotide-binding protein | G protein | `blocks[71].body` |
| engineering | mitogen-activated protein kinase | MAPK | `blocks[71].body` |
| engineering | Meloidogyne incognita | Mi | `blocks[80].body` |
| engineering | Caenorhabditis elegans | Ce | `blocks[80].body` |
| engineering | second-stage juveniles | J2 | `blocks[80].body` |
| engineering | ordinary differential equation | ODE | `blocks[82].body` |
| engineering | red–green–blue | RGB | `blocks[82].body` |
| engineering | root mean square error | RMSE | `blocks[84].body` |
| engineering | Human Practices | HP | `blocks[100].body` |
| experiments | deoxyribonucleic acid | DNA | `blocks[1].body` |
| experiments | ribonucleic acid | RNA | `blocks[1].body` |
| experiments | single-guide RNA | sgRNA | `blocks[1].body` |
| experiments | polymerase chain reaction | PCR | `blocks[1].body` |
| experiments | Saccharomyces cerevisiae | S.c | `blocks[1].body` |
| experiments | Escherichia coli | E. coli | `blocks[1].body` |
| experiments | homologous recombination | HR | `blocks[14].body` |
| experiments | double-joint PCR | DJ-PCR | `blocks[14].body` |
| members | principal investigator | PI | `blocks[3].items[0].introduction` |
| members | histidine | His | `blocks[5].items[1].introduction` |
| members | molecular dynamics | MD | `blocks[5].items[2].introduction` |
| members | Human Practices | HP | `blocks[15].items[0].introduction` |
| members | artificial intelligence | AI | `blocks[15].items[3].introduction` |
| parts | deoxyribonucleic acid | DNA | `blocks[0].body` |
| parts | ribonucleic acid | RNA | `blocks[0].body` |
| parts | complementary DNA | cDNA | `blocks[0].body` |
| parts | coding sequence | CDS | `blocks[0].body` |
| parts | homologous recombination | HR | `blocks[0].body` |
| parts | clustered regularly interspaced short palindromic repeats–CRISPR-associated protein 9 | CRISPR-Cas9 | `blocks[0].body` |
| parts | single-guide RNA | sgRNA | `blocks[0].body` |
| parts | guide RNA | gRNA | `blocks[0].body` |
| parts | superfolder green fluorescent protein | sfGFP | `blocks[0].body` |
| parts | Saccharomyces cerevisiae | S.c | `blocks[0].body` |
| parts | Escherichia coli | E. coli | `blocks[0].body` |
| results | design–build–test–learn | DBTL | `blocks[2].body` |
| results | homologous recombination | HR | `blocks[5].body` |
| results | coding sequence | CDS | `blocks[7].body` |
| results | complementary DNA | cDNA | `blocks[8].body` |
| results | superfolder green fluorescent protein | sfGFP | `blocks[8].body` |
| results | polymerase chain reaction | PCR | `blocks[12].body` |
| results | Calcofluor White | CFW | `blocks[22].body` |
| results | deoxyribonucleic acid | DNA | `blocks[39].body` |
| results | double-joint PCR | DJ-PCR | `blocks[39].body` |
| results | synthetic transcription factor | sTF | `blocks[45].body` |
| results | DNA-binding domain | DBD | `blocks[45].body` |
| results | pheromone-responsive domain | PRD | `blocks[45].body` |
| results | Escherichia coli | E. coli | `blocks[59].body` |
| results | clustered regularly interspaced short palindromic repeats–CRISPR-associated protein 9 | CRISPR-Cas9 | `blocks[65].body` |
| results | leucine | Leu | `blocks[80].body` |
| results | ribonucleic acid | RNA | `blocks[80].body` |
| results | single-guide RNAs | sgRNA | `blocks[80].body` |
| results | Human Practices | HP | `blocks[128].body` |
| results | yeast extract–peptone–dextrose | YPD | `blocks[133].body` |
| results | yeast nitrogen base | YNB | `blocks[171].body` |
| results | synthetic complete | SC | `blocks[171].body` |
| results | phosphate-buffered saline | PBS | `blocks[171].body` |
| results | tryptophan | Trp | `blocks[171].body` |
| results | tyrosine | Tyr | `blocks[171].body` |
| results | red–green–blue | RGB | `blocks[175].body` |
| safety | histidine | His | `blocks[4].body` |
| safety | leucine | Leu | `blocks[4].body` |
| safety | personal protective equipment | PPE | `blocks[9].body` |
| contribution | transmembrane helix 6 | TM6 | `blocks[49].body` |
| contribution | tryptophan residues | Trp | `blocks[49].body` |

## 待确认缩写：全量去重清单

以下概念按用户决定保留全称，待负责人确认缩写；不擅自编造缩写，不阻塞本轮已确定规则的修改。重复出现页面在右栏列全。

| 专业概念 | 出现页面 |
| --- | --- |
| 6-methoxybenzoxazolin-2-one | description |
| G protein cycle | background |
| Tween 80 | results |
| agarose gel electrophoresis | experiments |
| amino acid | results |
| antioxidant | results |
| ascarosides | attributions, background, description |
| autoclaves | safety |
| auxotrophic marker | results |
| betaxanthin | description, results |
| biological control | description |
| biosensor | attributions, contribution, description, engineering |
| carboxylate | engineering |
| cellulose | results |
| cellulose acetate | results |
| chassis strain | results, safety |
| chemical fumigation | description |
| chemical signals | background |
| chlorosis | description |
| cobalt(II) chloride | results |
| colony counting | results |
| color development | background, description, engineering, results |
| colorimetric output | background |
| conformational changes | attributions, background |
| copper sulfate | results |
| copper(II) sulfate | results |
| cotton fiber | results |
| crop rotation | description |
| cyanoacrylate | results |
| deep learning | description |
| double digestion | results |
| doxycycline | safety |
| endocytosis | engineering, results |
| fluorescence microscopy | engineering, experiments, results |
| force field | background |
| gene expression | description, results |
| gene knock-in | engineering, results |
| gene knockout | results |
| genetic modification | contribution, results |
| genetic parts | attributions, contribution |
| genome editing | contribution |
| genomic DNA | experiments, results |
| glucose | results |
| glycerol | experiments, results |
| heterologous expression | engineering, results |
| high-throughput homogenizers | safety |
| homology arm | results |
| hydrogen bond | engineering |
| hydrophobic contact | contribution |
| hyperspectral imaging | description |
| ionic environment | background |
| iron(III) chloride | results |
| lateral flow test strip | attributions |
| ligand | attributions, background, contribution, description, engineering |
| lipid bilayer | background, engineering |
| lyophilization | results |
| manganese(II) chloride | results |
| mannitol | results |
| matrix interference | engineering |
| metabarcoding | description |
| mitochondrial apoptosis | safety |
| molecular docking | attributions, background, description, members |
| mutant | contribution, engineering |
| mutation | attributions, engineering |
| nematicides | description |
| nematode density | engineering |
| nematode-trapping fungi | background, engineering |
| nutrient uptake | description |
| one-step cloning | contribution, results |
| plasmid | attributions, engineering, experiments, parts, results |
| promoter | attributions, background, engineering, results |
| protectant | results |
| receptor engineering | contribution |
| receptor recognition | background, description |
| remote sensing | description |
| restriction enzyme digestion | experiments |
| rhizosphere microbiome | description |
| sample preparation | attributions |
| saturation scanning | contribution, engineering |
| seamless assembly | experiments |
| sedentary endoparasitic nematodes | description |
| signal transduction | background, results |
| sodium alginate | results |
| sodium glutamate | results |
| suicide switch | safety |
| sulfite paper | results |
| surfactant | results |
| syncytial feeding sites | description |
| synthetic biology | attributions, contribution, members, safety |
| terminator | results |
| transcription factor | contribution, engineering, results |
| transmembrane localization | results |
| trehalose | results |
| wood pulp | results |

## 科学标识处理边界

Gpr2/GPR2、GPA1、GAL80、基因与蛋白符号、株系、荧光染料商品名、FM4-64、材料等级 GF/A 和 GF/B 以及完整质粒名均为准确科学标识。未因格式统一而推测全称、改写基因大小写或拆解构建体名称。具体列表与每页位置列在 JSON 的 `scientific_identifiers`；额外缩写样式词库存列在 `remaining_symbol_inventory`，供复验逐项排除人名、机构、软件和材料符号。

## 术语核实来源

- PCR： https://www.genome.gov/genetics-glossary/Polymerase-Chain-Reaction-PCR
- sTF/DBD/PRD 及信号途径： https://pmc.ncbi.nlm.nih.gov/articles/PMC10753199/
- GPCR： https://pmc.ncbi.nlm.nih.gov/articles/PMC6476273/
- LAMP： https://www.neb.com/en-us/faqs/what-is-lamp-and-rt-lamp
- RPA： https://www.neb.com/applications/dna-amplification-pcr-and-qpcr/isothermal-amplification/recombinase-polymerase-amplification-and-strand-invasion-based-amplification
- 酿酒酵母拼写： https://www.yeastgenome.org/
- POPC： https://www.sigmaaldrich.com/NZ/en/product/avanti/850457c
- Calcofluor White： https://tools.thermofisher.com/content/sfs/manuals/IFU21507.pdf

物种简称 S.c 为用户约定；Mi/Ce 为既有 ODE 模型记号，已与模型内容代理协调统一，不更改公式或表格值。

## 额外缩写样式词的逐项复核

下列词由全文扫描发现，已逐一分类；不把准确基因、株系、商品名、软件/机构专名和个人兴趣误当作需要编造全称的普通缩写。每页首次位置见 JSON 的 `reviewed_symbol_inventory`。

| 扫描词 | 处理决定 |
| --- | --- |
| CEN | CEN.PK2-1C准确株系的分词片段 |
| CRISPR | CRISPR-Cas9定义内部组成及已有完整缩写的分词片段 |
| CYC1 | 终止子/基因符号 |
| DAF | DAF-37/DAF-38准确受体标识的分词片段 |
| DJ | DJ-PCR已定义缩写的分词片段 |
| DOI | 引用标识类型，保留引用原文 |
| EDIS | 引用来源平台名称 |
| FM4 | FM4-64准确染料名称的分词片段 |
| GAL | 酵母GAL途径/调控元件的专名标识 |
| GAL1 | 基因符号 |
| GAL10 | 基因符号 |
| GF | GF/A和GF/B准确滤纸材料等级的分词片段 |
| GPA1 | 基因符号 |
| GPR | 原稿中的受体标识用语，未擅自改成GPCR |
| GPR2 | 基因/受体符号，不能推断成GPCR同义词 |
| GPR3 | 基因符号 |
| IFAS | 引用来源机构名称 |
| II | 试剂化学名氧化态 |
| III | 试剂化学名氧化态 |
| KOSTE12 | 准确敲除片段名 |
| MAD | 成员个人兴趣中的视频剪辑风格名称，未擅自解释 |
| MC | Minecraft社团个人介绍中的昵称，非科研概念 |
| NG018 | 引用原稿文献编号 |
| NKU | NKU-China团队品牌前缀，保留准确名称 |
| PARTS | 被提及的Wiki页面标签，非科学缩写 |
| PK2 | CEN.PK2-1C准确株系的分词片段 |
| RNAs | single-guide RNAs首次定义内部的复数名词组成；RNA已在前一句定义 |
| SRBC | SRBC-64/SRBC-66准确受体标识的分词片段 |
| STE12 | 基因符号 |
| STE2 | 基因符号 |
| TEF1 | 启动子/基因符号 |
| TM1 | 跨膜螺旋位置标识，保留编号 |
| TM5 | 跨膜螺旋位置标识，保留编号 |
| TM6 | 跨膜螺旋位置标识，保留编号 |
| TU | TU Delft机构/历史团队专有名称，非transcription unit |
| UF | 引用来源机构名称 |
| gGal4 | 准确sgRNA片段标识 |
| gSTE12 | 准确sgRNA片段标识 |
| gSTE2 | 准确sgRNA片段标识 |
| gasA | 基因符号 |
| gprC | 基因符号 |
| iGEM | 竞赛专有名称，保留规范大小写 |
| oliC | 启动子标识 |
| pEASY | 试剂商品名 |
| pRS313 | 准确质粒骨架名 |
| pRS314 | 准确质粒骨架名 |
| pRS315 | 准确质粒骨架名 |

## 实际验证

`python3 tools/apply-rules-wet.py --audit` 通过 12 页逐页校验：结果 SHA-256 与术语表一致；CSV、sourceCellRuns、图片/成员照片/姓名、科研媒体链接等保护字段与基线完全相同；全部原有显式 anchor 保留；34 个 h2 无前置编号，86 个 h3 按章连续；引用条目原文不变；移除 7 个原稿入口；无嵌套 strong。

第二次运行 `python3 tools/apply-rules-wet.py --apply` 返回已匹配结果、不写文件，证明不会重复展开术语或重复添加章节号。对本代理修改文件运行 `git diff --check` 通过。统一导出、构建、浏览器验收和后续发布由父代理执行。

跨组复核补充：Contribution 的第六跨膜螺旋与色氨酸残基首次写为 `Transmembrane helix 6 (TM6) tryptophan residues (Trp)`，后续使用 TM6/Trp；精确残基 Gpr2 W338、Gpr3 W306、GprC W388 保持。
