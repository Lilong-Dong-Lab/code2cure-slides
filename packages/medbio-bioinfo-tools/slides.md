---
theme: hebmu
title: 生物信息学常用工具
info: |
  生物信息学常用工具
  在现代药物发现中的应用
  河北医科大学 · 基础医学
layout: cover
coverAuthor: '董立龙'
coverDate: '2026-03-25'
drawings:
  persist: false
transition: fade
mdc: true
presenter: true
fonts:
  sans: 'Arial'
  mono: 'Fira Code'
themeConfig:
  footerTel: '86265625'
defaults:
  layout: default
htmlAttrs:
  lang: zh-CN
exportFilename: medbio-bioinfo-tools
---

# 生物信息学常用工具
## 在现代药物发现中的应用

---
layout: figure
figureUrl: /assets/intro-portrait.jpeg
figureX: l
---

# 个人简介

## 董立龙

河北医科大学药学学士，澳洲利亚昆士兰大学生物技术硕士、药物化学博士。曾任河北医科大学药学院药物分析教研室讲师，现任河北医科大学基础医学院医药生物教研室讲师。在 Journal of European Medicinal Chemistry, ACS Infectious Diseases, J. Med Chem 等国外杂志发表多篇学术论文，已获 3 项国际新药发明专利，国内授权 1 项新药发明专利。主持河北省教育厅研究项目 1 项、参与国家自然科学基金 2 项。

**研究方向：**

- 靶向离子通道、膜蛋白的多肽与小分子药物开发
- 开展深度学习技术赋能的计算驱动药物分子设计
- 药物研发中临床前数据整合与数据库的开发应用

---

# 个人简介

<div class="medbio-profile">
  <img class="medbio-profile-art" src="/assets/intro-illustration.jpg" alt="董立龙" />
  <div class="medbio-profile-side">
    <p class="medbio-handle">hugolld</p>
    <p class="medbio-same-name">全网同名</p>
    <div class="medbio-qr-row">
      <img src="/assets/qr-wechat.png" alt="微信" />
      <img src="/assets/qr-lab.png" alt="Lilong Dong Lab" />
      <img src="/assets/qr-bilibili.png" alt="哔哩哔哩" />
    </div>
    <div class="medbio-social-row">
      <img src="/assets/icon-github.png" alt="GitHub" />
      <img src="/assets/icon-instagram.png" alt="Instagram" />
      <img src="/assets/icon-x.png" alt="X" />
      <img src="/assets/icon-youtube.png" alt="YouTube" />
    </div>
  </div>
</div>

---

# 医学生为什么要学生信，为什么要掌握生信工具

<div class="medbio-why">

<CharacterDissolve>

<ul>
<li>当我们讨论<strong>精准医疗</strong>时，我们到底在讨论什么？</li>
<li class="is-in">某款抗癌药物“<strong>靶向治疗</strong>”，它到底靶向什么？</li>
<li class="is-in">为什么同样癌症，不同患者使用同一药物疗效差异巨大？</li>
<li class="is-in">基因组测序价格从 <strong>27 亿美元（2003 年）降至 1000 美元以下</strong>，这意味着什么？</li>
<li class="is-in">一款药从研发到上市需要 <strong>10–15 年</strong>，耗费<strong>超过 20 亿美元</strong>，这又意味着什么？</li>
<li>生物信息学能为临床治疗方案决策、药物研发做些什么？</li>
</ul>

</CharacterDissolve>

<div v-click class="medbio-click-proxy" aria-hidden="true" />

<p
  v-motion
  class="medbio-key"
  :initial="{ opacity: 0, y: 12 }"
  :click-2="{ opacity: 1, y: 0 }"
>
  生物信息学工具是我们进行前沿医学研究、开发创新疗法的“金钥匙”。
</p>

</div>

---

# 本次课程将涵盖以下内容

<ol class="medbio-agenda">
<li v-click>建立精准医学思维模式：从“一刀切”到“个性化治疗”</li>
<li v-click>掌握不同交互方式的生物信息学工具：CLI/GUI/WebApp/API&Flow</li>
<li v-click>理解药物发现的完整流程：从靶点的发现到候选药物优化</li>
<li v-click>通过实际案例演示，直观感受体验现代药物开发的数字化流程：生物信息→计算预测→候选药物。</li>
</ol>

---
layout: table-of-contents
contentTitle: '目录 | CONTENT'
active: 1
contentItems:
  - 生信常用工具概述
  - 药物发现：从0到1的数字旅程
  - CADD实战：从靶点到候选药物
---

---

# 生信工具总览 ｜分类框架

<p class="tool-tree-lead">生信资源可以分为<strong>三个层次</strong>。</p>

<ToolTree />

---

# 生信工具总览 ｜第一层: 分析工具

## 序列分析工具 (Sequence Analysis Tools)

<TableWipe>

| 名称 | 详情 |
| --- | --- |
| BLAST | 序列同源性搜索，发现基因/蛋白质相似性 |
| ClustalW | 多重序列比对，分析进化关系和保守区域 |
| BWA/Bowtie2 | 短序列比对，二代测序数据分析 |
| HMMER | 隐马尔可夫模型，蛋白质结构域识别 |
| ... | 还有很多很多... |

</TableWipe>

---

# 生信工具总览 ｜第一层: 分析工具

## 结构分析工具 (Structure Analysis Tools)

<TableWipe>

| 名称 | 详情 |
| --- | --- |
| PyMOL | 3D 分子结构可视化，药物-靶点结合展示 |
| ChimeraX | 高级分子建模和可视化，支持大分子复合物 |
| Mol* | Web 端 3D 结构查看器，无需安装即可使用 |
| ... | 还有很多很多... |

</TableWipe>

---

# 生信工具总览 ｜第二层: 数据库 / 知识资源

## 数据库 (Database or Knowledge Base)

<TableWipe>

| 类型 | 名称 | 详情 |
| --- | --- | --- |
| 序列数据库 | NCBI GenBank | 核酸和蛋白质序列 |
| 蛋白质数据库 | UniProt, PDB | 蛋白质序列和三维结构 |
| 基因表达数据库 | GEO, TCGA | 基因表达谱、癌症基因组 |
| 通路数据库 | KEGG, Reactome | 代谢通路、信号转导 |
| 互作数据库 | STRING, BioGRID | 蛋白质相互作用网络 |
| ... |  | 还有很多很多... |

<div class="hebmu-callout hebmu-callout-key">

关键区别：数据库存储数据，工具处理数据。例如：GEO 是数据库（存储表达数据），GEO2R 是工具（分析差异表达）。

</div>

</TableWipe>

---

# 生信工具总览 ｜第三层: 交互方式

<InteractionIcons />

---

# 生信工具总览 ｜同一个靶点，四种体验

**目标蛋白：EGFR**（表皮生长因子，非小细胞肺癌靶点）

<v-clicks>

- **CLI**（命令行）：批量处理、自动化，适合服务器运行与流程化分析
- **GUI**（图形界面）：直观易用，适合教学演示与交互式分析
- **Web App**（网页应用）：无需安装、即开即用，适合快速查询
- **API | Flow**（程序化）：可编程、可扩展，适合自动化流程与批量处理

</v-clicks>

---
layout: table-of-contents
contentTitle: '目录 | CONTENT'
active: 2
contentItems:
  - 生物信息学及工具
  - 药物发现：从0到1的数字旅程
  - CADD实战：从靶点到候选药物
---

---

# 药物发现管线概览 ｜ 传统药物研发的流程

| 阶段 | 周期 | 成功率 |
| --- | --- | --- |
| Target validation | 1.5 year | ~3% |
| Compound screening | 1.5 year | 6% |
| Lead optimization | 1.5 year | 17% |
| Pre clinical test | 1 year | ~7% |
| Phase I | 1.5 year | ~15% |
| Phase II | 2.5 year | 21% |
| Phase III | 2.5 year | 26% |
| Approval to launch | 1.5 year | ~5% |

<p class="hebmu-source">Sun, D, Gao, W, Hu, H, & Zhou, S. (2022). Why 90% of clinical drug development fails and how to improve it?. Acta Pharmaceutica Sinica B, 12(7), 3049-3062.</p>

---
transition: view-transition
---

# 药物发现管线概览 ｜ 药物的数字化诞生记

靶点发现 → 靶点确证 → 先导发现 → 先导优化 → 临床前实验 → 临床实验

<PipelineStages motion="flip" />

---
transition: view-transition
---

# 药物发现管线概览 ｜ 药物的数字化诞生记

<PipelineStages :active="1" />

## 靶点发现

<v-clicks>

- 多组学数据整合: WGCNA, MOFA+
- AI 病理图像分析: PathAI, Paige.AI
- 空间转录组: 10x Visium, NanoString GeoMx
- 单细胞 RNA 测序 (scRNA-seq): 10x Genomics Chromium, Drop-seq
- 关键数据库: TCGA, GTEx, Human Protein Atlas, DepMap

</v-clicks>

---
transition: view-transition
---

# 药物发现管线概览 ｜ 药物的数字化诞生记

<PipelineStages :active="2" />

## 靶点确证

<v-clicks>

- 靶点成药性评估: SiteMap, DoGSiteScorer, DrugnomeAI
- 功能验证: 基因敲除 / 突变 / 过表达实验
- 临床验证: PandaOmics, Owkin TargetMATCH
- 安全性预测: eToxPred, Off-Target Drug Safety
- 关键数据库: PDB, DrugBank, ChEMBL, Open Targets

</v-clicks>

---
transition: view-transition
---

# 药物发现管线概览 ｜ 药物的数字化诞生记

<PipelineStages :active="3" />

## 先导发现

<v-clicks>

- 片段分子筛选: Schrödinger, MOE
- 机器学习预测: DeepChem, XGBoost
- 药效团建模: Orion, Schrödinger, MOE
- 虚拟筛选: Glide, UniDock, DiffDock, AutoDock Vina
- 关键数据库: ZINC15/20, ChEMBL, PubChem, DrugBank

</v-clicks>

---
transition: view-transition
---

# 药物发现管线概览 ｜ 药物的数字化诞生记

<PipelineStages :active="4" />

## 先导优化

<v-clicks>

- 量子化学计算: Gaussian, CP2K, Quantum Espresso
- ADMET 预测: ADMETlab 3.0, eToxPred
- 自由能计算: FEP+ (Schrödinger), TI (Amber), ABFE/RBFE (GROMACS)
- 分子动力学模拟: GROMACS, OpenMM, Amber, Desmond

</v-clicks>

---

# 药物发现管线概览 ｜ 药物的数字化诞生记

## 传统 vs 现代“数字化”药物发现

| 指标 | 传统方法 | CADD / AIDD | 改进趋势 |
| --- | --- | --- | --- |
| 总研发时间 | 10–15 年 | 可显著缩短 | ↓ |
| 总成本 | 数十亿美元 | 可有效降低 | ↓ |
| 筛选化合物数量 | 5,000–10,000 | 500–1,000 | ↓ 10 倍 |
| 临床实验成功率 | ~10% | 有望提升 | ↑ |

<p class="hebmu-source">注：具体改进幅度因药物类型、疾病领域而异，以上为总体趋势描述。</p>

---
layout: default
density: compact
---

# 药物发现管线概览 ｜ 药物的数字化诞生记

## “数字化”药物发现的成功案例

<div class="medbio-fit">

| 靶点/药物 | 疾病领域 | 关键计算方法 | 时间 |
| --- | --- | --- | --- |
| PD-1 / PD-L1 | 多种癌症免疫治疗 | 结构预测、QSAR、分子对接 | 2014–2020 |
| CDK4/6 抑制剂 | 乳腺癌、血液癌 | 虚拟筛选、药效团、机器学习 QSAR | 2007–2017 |
| Venetoclax | 慢性淋巴细胞白血病 | 共晶结构、对接、自由能计算 | 2005–2016 |
| 奥司他韦 | 流感 | 神经氨酸酶结构导向设计 | 1996–1999 |
| 格列卫 (Imatinib) | 慢性髓性白血病 | 虚拟筛选、QSAR、选择性优化 | 1996–2001 |
| 瑞德西韦 | COVID-19、埃博拉 | RdRp 结构导向、虚拟筛选、分子动力学 | 2015–2020 |

</div>

---
layout: table-of-contents
contentTitle: '目录 | CONTENT'
active: 3
contentItems:
  - 生物信息学及工具
  - 药物发现：从0到1的数字旅程
  - CADD实战：从靶点到候选药物
---

---

# 实例演示 ｜靶点发现中的单细胞测序: 为CADD提供候选靶点

## 技术简介

**单细胞测序技术 (Single-Cell Sequencing Technologies):**

- 特别是单细胞 RNA 测序 (scRNA-seq)
- 在单个细胞精度上解析基因表达谱
- **优势:** 相比传统 Bulk 测序，提供更高分辨率的单个细胞表达谱
- **核心价值:** 重构细胞发育轨迹，识别稀有细胞类型，揭示细胞间的异质性
- 寻找新的潜在靶点: 发现差异表达蛋白，作为 CADD 的候选靶点

---

# 实例演示 ｜靶点发现中的单细胞测序: 为CADD提供候选靶点

## 案例演示

基于 Scanpy 的单细胞数据分析

(Jupyter Notebook)

---

# 实例演示 ｜ 计算机辅助药物设计之分子对接

## 技术简介

**CADD (Computer-Aided Drug Design):** 利用计算方法来发现、设计和优化候选药物的过程。

- **贯穿阶段:** 从靶点确认到先导化合物的发现与优化。
- **主要目标:**
  - 提高药物研发的成功率。
  - 缩短研发周期。
  - 降低成本。

---

# 实例演示 ｜ 计算机辅助药物设计之分子对接

## 核心数据资源 (Key Data Resources)

| 名称 | 详情 |
| --- | --- |
| PDB (Protein Data Bank) | 生物大分子三维结构，基于结构的药物设计的基础 |
| DrugBank | 已上市与实验药物的化学结构、药理、靶点 |
| ChEMBL | 化合物生物活性与理化性质 |
| ZINC15 / ZINC20 | 可购买化合物的三维结构，用于虚拟筛选 |
| PubChem (NCBI) | 化合物、物质和生物活性检测 |
| BindingDB | 实验测定的蛋白质与小分子结合亲和力 |

---
layout: default
density: compact
---

# 实例演示 ｜ 计算机辅助药物设计之分子对接

## 核心工具与技术

**分子可视化与编辑 (Molecular Visualization and Editing):**

- PyMOL, VMD, UCSF ChimeraX（常用软件）。
- NGLview（Python 库, Jupyter 中交互式显示）。

**化学信息学工具 (Cheminformatics Tools):**

- RDKit（Python 库）: 处理化学结构, 计算分子描述符, 药效团分析。
- Open Babel: 化学文件格式转换和分子操作

**靶点蛋白生成建模工具 (Biomolecule Prediction Tools):**

- AlphaFold2/3, RoseTTAFold-AA, ESMFold, HighFold
- 同源建模: Swiss-Model（在线），Modeller（开源），MOE（商业）

---
layout: default
density: compact
---

# 实例演示 ｜ 计算机辅助药物设计之分子对接

## 核心工具与技术

**分子对接 (Molecular Docking):**

- **原理:** 预测小分子配体 (Ligand) 与大分子受体 (Receptor) 结合模式，评估结合亲和力。
- **软件:** AutoDock Vina（开源）, Glide（商业）, GOLD（商业）。

**分子动力学模拟 (Molecular Dynamics, MD Simulation):**

- **原理:** 基于牛顿力学，模拟分子体系原子运动轨迹，研究动态行为、构象变化、结合自由能。
- **软件:** GROMACS, AMBER, NAMD, OpenMM（开源）。
- **分析:** MDAnalysis（Python 库）, VMD。

**ADMET 性质预测 (ADMET Prediction):** 吸收, 分布, 代谢, 排泄, 毒性。

- **工具:** SWISSADME, admetSAR（在线）, Discovery Studio（商业）。

---

# 实例演示 ｜ 计算机辅助药物设计之分子对接

## 案例演示

EGFR 蛋白-配体分子对接

(Jupyter Notebook)

protein_ligand_docking_analysis

---
layout: default
density: compact
---

# 参考文献

1. Wetterstrand KA. The Cost of Sequencing a Human Genome. National Human Genome Research Institute (NHGRI). Updated 2021.
2. Wouters OJ, McKee M, Luyten J. Estimated Research and Development Investment Needed to Bring a New Medicine to Market, 2009-2018. JAMA. 2020;323(9):844-853.
3. Sun D, Gao W, Hu H, Zhou S. Why 90% of clinical drug development fails and how to improve it? Acta Pharm Sin B. 2022;12(7):3049-3062.
4. Schneider G. Automating drug discovery. Nat Rev Drug Discov. 2018;17(2):97-113.
5. Vamathevan J, Clark D, Czodrowski P, et al. Applications of machine learning in drug discovery and development. Nat Rev Drug Discov. 2019;18(6):463-477.
6. Jumper J, Evans R, Pritzel A, et al. Highly accurate protein structure prediction with AlphaFold. Nature. 2021;596(7873):583-589.
7. Lynch TJ, Bell DW, Sordella R, et al. Activating mutations in the epidermal growth factor receptor underlying responsiveness of non-small-cell lung cancer to gefitinib. N Engl J Med. 2004;350(21):2129-2139.
8. Paez JG, Jänne PA, Lee JC, et al. EGFR mutations in lung cancer: correlation with clinical response to gefitinib therapy. Science. 2004;304(5676):1497-1500.

---
layout: end
endMessage: 谢谢聆听
endMessageEn: 下课
---
