---
theme: hebmu
title: 第十讲 Python数据分析 NumPy与Pandas进阶
info: |
  生物信息学应用语言课程 — 第十讲
  Python数据分析 NumPy与Pandas进阶 (Python Data Analysis: NumPy & Advanced Pandas)
  河北医科大学 · 生物信息学专业
layout: cover
coverAuthor: '董立龙'
coverDate: '2026-11-12'
courseName: '生物信息学应用语言'
courseNameEn: 'The Languages in Bioinformatics'
sessionNumber: 10
drawings:
  persist: false
transition: slide-left
mdc: true
presenter: true
aspectRatio: 4/3
canvasWidth: 1024
colorSchema: light
fonts:
  sans: 'PingFang SC'
  mono: 'Fira Code'
themeConfig:
  paginationX: 'r'
  paginationY: 'b'
  paginationPagesDisabled: [1]
  footerMode: 'compact'
  logoUrl: '/hebmu-logo.png'
  coverBackgroundUrl: '/campus-cover.jpeg'
  endBackgroundUrl: '/campus-end.jpeg'
  footerDepartment: '河北医科大学 基础医学院 医药信息学教研室'
  footerAuthor: '董立龙'
  footerEmail: 'lilong.dong@hebmu.edu.cn'
  footerWechat: 'donglilonghugo'
defaults:
  layout: default
htmlAttrs:
  lang: zh-CN
exportFilename: ch10-numpy-pandas-advanced
---

# 第十讲 Python数据分析 NumPy与Pandas进阶
## Python Data Analysis: NumPy & Advanced Pandas

---
layout: default
hideFrame: true
---

# 本讲学习目标 Learning Objectives

**Knowledge**
- 说出 ndarray 与 Python 列表的区别（同质类型、向量化），能解释"整列一起算"为什么快
- 掌握 Pandas 进阶三件武器：`merge()` 合并、`groupby()+agg()` 聚合、`melt / pivot` 长宽转换
- 理解 DataFrame−Series 对齐运算（广播的 Pandas 形态）与 Z-score 公式

**Ability**
- 用 `merge()` 合并表达矩阵与临床信息，说清行数变化
- 用 `groupby()+agg()` 完成分期×吸烟的分组汇总（`as_index=False`）
- 用 `melt / pivot` 完成长宽互换（ggplot/Seaborn 都以长数据为输入）；在真实表达矩阵上算出 Z-score 矩阵（第12–13讲热图输入）

**Thinking**
- 性能优势：能向量化就不写循环（写不出向量表达式才用 .map）
- 数据合并先数行数 —— 以透明、可追溯的方式报告样本排除标准

<!-- notes: 前测（举手调查）：第9讲作业3的%>%管道翻译一次跑通的？第5讲melt/dcast还记得的？R里scale()/Z-score公式还有印象的？根据举手情况决定 NumPy 模块节奏。口径：R半程是base R（merge/aggregate/melt），dplyr五件套未讲过，不作为举手题。本讲结构：上半节NumPy速览（含性能实测收口）+apply·map/CoW；下半节merge→groupby→长宽转换→五步闭环。数组创建、显式广播、transform等移到课后自学（第33页），课上只指地图。-->

---
layout: table-of-contents
contentTitle: '目录 | Contents'
contentItems:
  - 上讲回顾与向量化之问
  - NumPy速览：向量化与Z-score
  - 变换写法：apply、map与安全赋值
  - 数据合并：merge、concat与reindex
  - 分组聚合：groupby与agg
  - 长宽转换与流程闭环
  - 总结与作业
---

<!-- notes: 七个模块。上半节：导入（作业回顾+向量化之问）+NumPy速览（含性能实测收口）+apply·map/CoW；下半节：merge→groupby→长宽转换→五步流程闭环（顺序=流程本身）。-->

---
layout: section
sectionNumber: 1
sectionTitle: '上讲回顾与向量化之问'
sectionTitleEn: 'Where We Left Off'
---

---
layout: default
hideFrame: true
density: compact
---

# 第9讲作业3解决方案速览

**R 版（4行管道）**

```r
lung %>% filter(age >= 60) %>%
  select(patient_id, age, egfr_expr) %>%
  mutate(log2_expr = log2(egfr_expr + 1))
```

**Pandas 分步版（逐列、嵌套括号）**

```python
sub = lung[lung["age"] >= 60]                        # filter
sub = sub[["patient_id", "age", "egfr_expr"]]        # select
sub = sub.assign(log2_expr=np.log2(sub["egfr_expr"] + 1))  # mutate
```

**Pandas 方法链版（`%>%` ↔ `.`）**

```python
chained = (lung[lung["age"] >= 60]
           [["patient_id", "age", "egfr_expr"]]
           .assign(log2_expr=lambda d: np.log2(d["egfr_expr"] + 1)))
```

<div class="hebmu-callout hebmu-callout-key mt-3">

**方法链(method chaining)**：R 的 `%>%` ↔ Python 的 `.` —— 从本页起两种写法都算对，流程页统一用链写

</div>

<!-- notes: 先点评作业整体情况与典型错误（布尔忘括号、index=False），参考答案课后发希冀平台。呼应导入提问：%>%管道不在R半程内（作业3附了读法提示），Python对应物是方法链——本页并排命名，notebook Slide 5 实测两种写法结果一致（True）。分步版里的 np.log2 在模块二正式介绍。-->

---
layout: default
hideFrame: true
---

# R 一行算全表均值，Python 列表为什么不行？

<div class="hebmu-columns">

<div>

**Python 列表**

````md magic-move
```python
counts = [8, 3, 17]
counts * 2    # [8,3,17,8,3,17] ⚠️ 拼接！
```

```python
counts = [8, 3, 17]
counts * 2                 # 拼接，不是翻倍
[x * 2 for x in counts]    # [16, 6, 34] 需循环
```

```python
counts = [8, 3, 17]
counts * 2                 # 拼接，不是翻倍
[x * 2 for x in counts]    # [16, 6, 34] 需循环
mean(counts)               # NameError：无此函数
```
````

</div>

<div>

**R 向量**

```r
counts <- c(8, 3, 17)
counts * 2     # 16  6 34 —— 天生翻倍
mean(counts)   # 9.333... —— 一行算均值
```

</div>

</div>

<div class="hebmu-callout hebmu-callout-warning mt-3" v-click>

Python 靠一个库追平 R：**NumPy** —— 科学计算的地基，Pandas/Matplotlib 都建在上面

</div>

<!-- notes: 左栏 magic-move 三拍：① list*2 拼接陷阱 → ② 推导式才翻倍 → ③ mean 根本没有。右栏 R 全程可见作向量化对照。末击 callout 点出 NumPy。思政点：开源库是全球科研公共基础设施。过渡：先认识ndarray。-->

---
layout: section
sectionNumber: 2
sectionTitle: 'NumPy速览：向量化与Z-score'
sectionTitleEn: 'NumPy in One Breath'
---

---
layout: default
hideFrame: true
density: compact
---

# ndarray：相当于 R 的原子向量(atomic vector)

Input:
```python
import numpy as np

arr = np.array([8, 3, 17]); arr * 2    # 整组一起算！
counts = [8, 3, 17]; counts * 2        # ⚠️ 列表乘法 = 拼接

tpm = np.array([120.0, 30.0, 480.0, 8.0])
np.log2(tpm + 1)                       # 一行算全组 —— R: log2(tpm + 1)
```
Output:

````md magic-move
```

```
```
arr * 2          : [16  6 34]
counts * 2       : [8, 3, 17, 8, 3, 17]
np.log2(tpm + 1) : [6.92 4.95 8.91 3.17]
```
````

| 对比维度 | Python列表 list | NumPy数组 ndarray | R向量 |
|----------|----------------|-------------------|--------|
| 元素类型 | 可混合 | **同质**（统一dtype） | 同质 |
| 运算方式 | 逐元素写循环 | **向量化** | 天生向量化 |
| 内存 | 分散 | 连续、省内存 | 连续 |

<div class="hebmu-callout hebmu-callout-key mt-3" v-click>

一句话定位：**ndarray ≈ R 的原子向量** —— 口诀：**整列一起算，不写 for**（数组怎么造、有哪些属性：课后自学）

</div>

<!-- notes: 强调"同质类型"是向量化快的前提。现场跑arr*2和counts*2对比（notebook Slide 8）。本讲NumPy只取"够用的一瓢"：向量化+Z-score；数组创建函数（arange/linspace/zeros/random.rand）与属性（shape/dtype/ndim/size）移到课后自学，notebook留了可运行的"自学"单元格。-->

---
layout: default
hideFrame: true
density: compact
---

# 性能实测：向量化到底快多少？

Input（`%%timeit` 是 Jupyter Notebook 的单元格魔法）：

```python
import math
import numpy as np
big = np.random.rand(1_000_000)     # 单元格0：百万个"表达值"
```

```python
%%timeit                            # 单元格1
[math.log2(x + 1) for x in big]     # 列表推导式逐元素
```

```python
%%timeit                            # 单元格2
np.log2(big + 1)                    # 向量化
```
Output:

````md magic-move
```

```
```
61.0 ms  # 逐元素循环
5.55 ms  # 向量化
```
````

<div class="hebmu-callout hebmu-callout-check mt-2" v-click>

向量化快约 **11 倍**。第9讲预告的"约快100倍"是**上限区间**：书里说 NumPy 一般快 10–100 倍——运算越接近纯数组乘法，倍数越逼近上限（书里 `arr * 2` 实测约150倍）

</div>

<div class="hebmu-callout hebmu-callout-key mt-2" v-click>

**"整列一起算，不写 for"**：不是禁止循环，是能向量化就别手写循环

</div>

<!-- notes: 课程思政点（大纲19条）：性能对比实验培养追求效率的科学意识。第一节"向量化之问"（R一行能算、Python列表不行）在此用计时收束；下一模块apply/map是它的另一面（写不出向量表达式时的出路）。课前用%%timeit跑好留截图，现场重跑一次。数字为2026-11-10教师机实测（notebook Slide 9，61.0ms vs 5.55ms），讲解时以现场输出为准。把第9讲"约100倍"预告与本页11倍的落差摆上桌面：倍数取决于运算本身与循环开销的占比，McKinney 书里 arr*2 对比实测约150倍——顺势引出书第4章开篇同款实验。-->

---
layout: default
hideFrame: true
density: compact
---

# Z-score标准化：在真实表达矩阵上算（第12–13讲的输入）

<div class="hebmu-columns">

<div>

**Python / Pandas**

Input:
```python
expr = pd.read_csv("demo_data/expr_matrix.csv",
                   index_col="patient_id")  # 28×20：行=患者 列=基因

z = (expr - expr.mean()) / expr.std()   # 按基因（列）标准化
```
Output:

````md magic-move
```

```
```
expr.shape: (28, 20)
z.iloc[:4, :4]
           EGFR  KRAS   ALK  TP53
LC001      1.14 -0.62 -0.38 -0.93
LC002     -0.56 -0.23  2.43 -0.68
LC004      0.34  0.35  0.38 -0.45
LC005     -0.46 -0.17 -0.43  1.83
```
````

</div>

<div>

**R 对照**

```r
scale(x, center = TRUE, scale = TRUE)
# 热图聚类前常做这一步
```

<div class="hebmu-callout hebmu-callout-check" v-click>

z 范围实测 **−1.13 ~ 4.73** —— 第13讲热图就以这个矩阵作为输入

</div>

<div class="hebmu-callout hebmu-callout-key" v-click>

**广播的 Pandas 形态**：`expr.mean()` 每列一个值（Series），减法自动**按列对齐铺开**到 28 行——不用手动变形（NumPy 里才需要 `[:, None]`，见课后自学）

</div>

<div class="hebmu-callout hebmu-callout-warning" v-click>

⚠️ 记法：pandas 的 `mean/std` 默认 `axis=0`（**按列**算）；`0=行、1=列`，与第13讲 seaborn `z_score=1` 同一套记法

</div>

</div>

</div>

<!-- notes: 这页是 NumPy 模块的落点：z-score 直接写成 DataFrame 运算，与第13讲代码逐字一致（ch13: z = (expr - expr.mean()) / expr.std()，expr 同样以 patient_id 为索引）——"同一公式第三次出现（第10讲造、第12讲预告、今天上岗）"由此变得严格成立。广播只讲 DataFrame−Series 自动对齐这一种（McKinney ch5 的教法）；NumPy 显式广播 [:, None] 移课后自学。ddof口径：pandas .std() 默认 ddof=1（除以n−1，与R的sd同口径），第13讲seaborn内置z_score用ddof=0，差异约2%视觉无差——课程统一用本页公式。z范围-1.13~4.73与第13讲课件宣称值完全一致（2026-11-10实测）。 -->

---
layout: section
sectionNumber: 3
sectionTitle: '变换写法：apply、map与安全赋值'
sectionTitleEn: 'apply, map & Safe Assignment'
---

---
layout: default
hideFrame: true
density: compact
---

# 向量表达式写得出就整列算；写不出就用 .map

上一页实测：整列运算快约 11 倍。能写成**整列运算**就优先；规则含 `if` / `startswith` 等 Python 逻辑时，再对每个元素调用函数。

<div class="hebmu-columns">

<div>

**① 写得出：向量表达式**

```python
lg = lung[["patient_id", "egfr_expr", "stage"]]

# 整列一起算：没有 for，没有 if
lg["log2_egfr"] = np.log2(lg["egfr_expr"] + 1)
```

<!-- Absolute clicks: magic-move at 1, then these (DOM is left-of-right, so bare v-click would fire first). -->
<div class="hebmu-callout hebmu-callout-key" v-click="2">

`.map(f)` ≈ R 的 `sapply`：对每个元素调用一次函数。本课元素级统一用 `map`

</div>

<div class="hebmu-callout hebmu-callout-warning" v-click="3">

⚠️ 教材更新滞后：`applymap` 在 pandas 2.1 弃用、3.0 已移除，元素级现在用 `.map`

</div>

<div class="hebmu-callout hebmu-callout-check" v-click="4">

`.apply` 能做的事更多，但本页只要“对一列每个值调用函数”，用 `.map` 即可。等要按行处理整张表，再用 `df.apply`

</div>

</div>

<div>

**② 写不出：没有现成的整列函数**

```python
# ❌ 没有 np.late_stage(lg["stage"])
#    分期要判断 III*/IV → 只能写 Python 逻辑

def stage_label(stage):
    return "晚期" if stage.startswith("III") or stage == "IV" else "早期"

lg["stage_group"] = lg["stage"].map(stage_label)  # R: sapply()
```

Output:

````md magic-move {at:1}
```

```
```
lg.head(4)
  patient_id  egfr_expr stage  log2_egfr stage_group
0      LC001       8.52  IIIB   3.250962          晚期
1      LC002       2.14    II   1.650765          早期
2      LC003       9.71    IV   3.420887          晚期
3      LC004       7.88 IIIA   3.150560          晚期
```
````

</div>

</div>

<!-- notes: ⏱️弹性：先右栏讲 .map 与点一次 Output（magic-move at:1），再点出口径 callout（v-click 2/3/4）。左栏向量表达式可先讲。第9讲作业3的assign(lambda)就是这思想的链式写法。notebook Slide 12 演示两列结果。第13讲 row_colors=stage.map(lut) 从本页起可指认。-->

---
layout: default
hideFrame: true
---

# 链式索引与Copy-on-Write：能赋值 ≠ 赋上了

**CoW：独立切片副本**

```python
sub = lung[lung["age"] >= 60]     # ① 先切片存变量
sub["age_group"] = "senior"       # ② 再赋新列：只改 sub，lung 仍无 age_group

lung[lung["age"] >= 60]["age_group2"] = "senior"   # ③ 想改 lung，CoW 下不生效 ⚠️
```

**要改成功时的写法**

```python
# 子集上改：显式 .copy()
sub = lung[lung["age"] >= 60].copy()
sub["age_group"] = "senior"

# 若确实要改 lung：
lung.loc[lung["age"] >= 60, "age_group"] = "senior"
```

<div class="hebmu-callout hebmu-callout-key mt-3" v-click>

**CoW（Copy-on-Write，pandas 3.x 默认）**：切片就是独立副本，改切片不会改原表；真正的链式赋值只会警告，**赋值不生效**

</div>

<div class="hebmu-callout hebmu-callout-check mt-2" v-click>

第9讲作业3的分步写法"能用"，正是 CoW 在保护。视图(view)/副本(copy)的来龙去脉：课后自学

</div>

<!-- notes: 方案2结构：上块=CoW现象（口头可补实测：① 18行 lung 无 age_group；③ 警告1条 age_group2 未写入，2026-11-10 pandas 3.1.1）；下块=口诀两种正确写法（.copy 子集 / loc 改原表）。呼应第9讲保温备选题。⏱️弹性：时间紧只讲上下两块各看一眼+口诀。loc/SettingWithCopy 历史见课后自学 / McKinney ch5。-->

---
layout: break
breakMinutes: 10
---

休息后继续：merge合并、groupby聚合与长宽转换

---
layout: section
sectionNumber: 4
sectionTitle: '数据合并：merge、concat与reindex'
sectionTitleEn: 'merge, concat & reindex'
---

---
layout: default
hideFrame: true
density: compact
---

# 合并前：先看两张表

要做「表达与分期」，得先按 `patient_id` 把两张表合并。先看几行几列和前几行

<div class="hebmu-columns">

<div>

**表达矩阵** `expr_matrix.csv` · **28**×20（不含ID列）

| patient_id | EGFR | KRAS | … |
|------------|------|------|---|
| LC001 | 117.93 | 4.84 | … |
| LC002 | 22.89 | 15.81 | … |
| LC004 | 73.30 | 32.11 | … |
| ⋮ | | | |

</div>

<div>

**临床表** `lung_clinical.csv` · **30**×8（不含ID列）

| patient_id | age | stage | … |
|------------|-----|-------|---|
| LC001 | 61 | IIIB | … |
| LC002 | 55 | II | … |
| LC003 | 68 | IV | … |
| LC004 | 72 | IIIA | … |

</div>

</div>

<div class="hebmu-callout hebmu-callout-key mt-3">

共同键是 `patient_id`。注意：临床有 **LC003**，表达矩阵没有（测序质控(QC)剔除）。下一页用四种 `how` 看行数怎么变

</div>

<!-- notes: 刻意让表达表跳过 LC003（LC001→LC002→LC004），临床表保留 LC003，学生一眼看出两边不对齐。形状口径：表达 28行×20基因列（patient_id 另计）；临床 30行×8临床列（patient_id 另计）。LC027 同理缺表达，本页只亮 LC003 一个即可。-->

---
layout: default
hideFrame: true
density: compact
---

# merge：表达矩阵 × 临床信息

下面用 `merge` 把两个表拼起来

Input:
```python
len(pd.merge(expr_df, lung, on="patient_id"))                 # on=连接键；inner（默认）只留两边都有
len(pd.merge(expr_df, lung, on="patient_id", how="left"))     # left：左表全留（研究以谁为准就 left 谁）
len(pd.merge(expr_df, lung, on="patient_id", how="right"))    # right：右表全留
len(pd.merge(expr_df, lung, on="patient_id", how="outer"))    # outer：并集
len(pd.merge(lung, expr_df, on="patient_id"))                 # 左表换 lung，inner
len(pd.merge(lung, expr_df, on="patient_id", how="left"))     # lung←expr left：临床 30 例全留
```
Output:

````md magic-move
```

```
```
28  # expr←lung  how=inner
28  # expr←lung  how=left
30  # expr←lung  how=right
30  # expr←lung  how=outer
28  # lung←expr  how=inner
30  # lung←expr  how=left
```
````

<div class="hebmu-callout hebmu-callout-key mt-3">

这就是 R 第5讲 `merge(expr, clin, by="patient_id")` 的同款任务（默认两边都保留交集 = pandas `how="inner"`）。要保留左表全部（本页 `how="left"`）在 R 里写 `all.x=TRUE`；tidyverse 对应 `left_join()`

</div>

<!-- notes: 上一页已亮LC003不对齐。强调默认是inner，多数研究设计应该用left。Output为notebook实测：先让学生预测四种how各剩几行，再点击morph验证。lung←expr left=30，其中LC003/LC027的EGFR为NaN——思政点：合并后纳入30例、2例无表达数据，论文方法学要写得出来。-->

---
layout: default
hideFrame: true
density: compact
---

# 连接方式(how)：四种对照

<style scoped>
.join-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 1.25rem;
  margin: 0.15rem 0 0.35rem;
}
.join-panel { text-align: center; }
.join-panel .join-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--hebmu-primary, #4e136c);
  line-height: 1.2;
}
.join-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 330px;
  margin: 0.05rem auto 0;
  font-size: 12px;
  line-height: 1.2;
  color: var(--hebmu-text, #202020);
}
.join-gloss {
  margin: 0.05rem 0 0;
  font-size: 13px;
  color: var(--hebmu-text, #202020);
  line-height: 1.25;
}
.join-venn {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  margin: 0.1rem auto 0;
}
</style>

<div class="join-grid">

<div class="join-panel">
<p class="join-title"><code>inner</code> 内连接（默认）</p>
<svg class="join-venn" viewBox="0 0 220 100" role="img" aria-label="inner：只留交集">
  <defs>
    <clipPath id="join-clip-inner"><circle cx="78" cy="50" r="42"/></clipPath>
  </defs>
  <circle cx="142" cy="50" r="42" fill="var(--hebmu-primary, #4e136c)" fill-opacity="0.4" clip-path="url(#join-clip-inner)"/>
  <circle cx="78" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
  <circle cx="142" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
</svg>
<div class="join-labels"><span>左(expr)</span><span>右(lung)</span></div>
<p class="join-gloss">只留两边都有的 ID</p>
</div>

<div class="join-panel">
<p class="join-title"><code>left</code> 左连接</p>
<svg class="join-venn" viewBox="0 0 220 100" role="img" aria-label="left：左表全留">
  <circle cx="78" cy="50" r="42" fill="var(--hebmu-primary, #4e136c)" fill-opacity="0.4"/>
  <circle cx="78" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
  <circle cx="142" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
</svg>
<div class="join-labels"><span>左(expr)</span><span>右(lung)</span></div>
<p class="join-gloss">左表全留；右无则 NaN</p>
</div>

<div class="join-panel">
<p class="join-title"><code>right</code> 右连接</p>
<svg class="join-venn" viewBox="0 0 220 100" role="img" aria-label="right：右表全留">
  <circle cx="142" cy="50" r="42" fill="var(--hebmu-primary, #4e136c)" fill-opacity="0.4"/>
  <circle cx="78" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
  <circle cx="142" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
</svg>
<div class="join-labels"><span>左(expr)</span><span>右(lung)</span></div>
<p class="join-gloss">右表全留；左无则 NaN</p>
</div>

<div class="join-panel">
<p class="join-title"><code>outer</code> 外连接</p>
<svg class="join-venn" viewBox="0 0 220 100" role="img" aria-label="outer：并集">
  <circle cx="78" cy="50" r="42" fill="var(--hebmu-primary, #4e136c)" fill-opacity="0.4"/>
  <circle cx="142" cy="50" r="42" fill="var(--hebmu-primary, #4e136c)" fill-opacity="0.4"/>
  <circle cx="78" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
  <circle cx="142" cy="50" r="42" fill="none" stroke="var(--hebmu-primary, #4e136c)" stroke-width="2.5"/>
</svg>
<div class="join-labels"><span>左(expr)</span><span>右(lung)</span></div>
<p class="join-gloss">并集；缺侧补 NaN</p>
</div>

</div>

<!-- notes: 四种 how 用 Venn 对照上一页六行 len()。数据口径口头带：expr 28 ∩ lung 30（缺 LC003/LC027）。思政点口头讲：内连接悄悄丢样本、论文要写清排除标准。重复键膨胀（书 ch8 §8.2.1）口头一句：合并前 nunique() 查键。-->

---
layout: default
hideFrame: true
density: compact
---

# concat：按位置拼接

```python
batch_a, batch_b = lung.iloc[:15], lung.iloc[15:]   # 模拟两个批次
left, right = expr.iloc[:, :10], expr.iloc[:, 10:]  # 表达矩阵左右两半
```

<style scoped>
.concat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 0.2rem 1.1rem;
  margin: 0.2rem 0 0.2rem;
  align-items: stretch;
}
.concat-caption {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--hebmu-primary, #4e136c);
  line-height: 1.2;
  text-align: center;
}
.concat-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 0;
}
.concat-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.concat-row {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.concat-arrow {
  font-size: 1.25rem;
  align-self: center;
}
.concat-tag {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 0.08rem;
  text-align: center;
}
.hebmu-pd-frame.is-2col { grid-template-columns: 1.9rem repeat(2, minmax(2.5rem, 1fr)); }
.hebmu-pd-frame.is-4col { grid-template-columns: 1.9rem repeat(4, minmax(2.1rem, 1fr)); }
.hebmu-pd-frame {
  gap: 0.18rem 0.2rem;
  font-size: 11px;
  line-height: 1.1;
}
.hebmu-pd-idx, .hebmu-pd-head, .hebmu-pd-cell {
  border-radius: 4px;
  min-height: 1.35rem;
  min-width: 0;
  padding: 0 0.15rem;
}
.concat-code {
  min-width: 0;
}
.concat-code .slidev-code-wrapper,
.concat-code pre {
  margin: 0;
  font-size: 12px;
}
.concat-shape {
  margin: 0;
  font-size: 12px;
  color: var(--hebmu-text, #202020);
  text-align: center;
}
.concat-scene {
  margin: 0.1rem 0 0.15rem;
  font-size: 14px;
  text-align: center;
}
</style>

<div class="concat-grid">

<p class="concat-caption"><code>axis=0</code> 行拼接 · R: <code>rbind()</code></p>
<p class="concat-caption"><code>axis=1</code> 列拼接 · R: <code>cbind()</code></p>

<div class="concat-flow">
  <div class="concat-stack">
    <div>
      <div class="hebmu-pd-tag concat-tag">batch_a</div>
      <div class="hebmu-pd-frame is-2col" aria-label="batch_a">
        <div></div><div class="hebmu-pd-head">id</div><div class="hebmu-pd-head">stage</div>
        <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">IIIB</div>
        <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">II</div>
      </div>
    </div>
    <div>
      <div class="hebmu-pd-tag concat-tag">batch_b</div>
      <div class="hebmu-pd-frame is-2col" aria-label="batch_b">
        <div></div><div class="hebmu-pd-head">id</div><div class="hebmu-pd-head">stage</div>
        <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC016</div><div class="hebmu-pd-cell">II</div>
        <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC017</div><div class="hebmu-pd-cell">IIIB</div>
      </div>
    </div>
  </div>
  <div class="hebmu-pd-arrow concat-arrow" aria-hidden="true">→</div>
  <div>
    <div class="hebmu-pd-tag concat-tag">结果 4×2</div>
    <div class="hebmu-pd-frame is-2col" aria-label="axis=0 result">
      <div></div><div class="hebmu-pd-head">id</div><div class="hebmu-pd-head">stage</div>
      <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">IIIB</div>
      <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">II</div>
      <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC016</div><div class="hebmu-pd-cell">II</div>
      <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC017</div><div class="hebmu-pd-cell">IIIB</div>
    </div>
  </div>
</div>

<div class="concat-flow">
  <div class="concat-row">
    <div>
      <div class="hebmu-pd-tag concat-tag">left</div>
      <div class="hebmu-pd-frame is-2col" aria-label="left">
        <div></div><div class="hebmu-pd-head">EGFR</div><div class="hebmu-pd-head">KRAS</div>
        <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">118</div><div class="hebmu-pd-cell">4.8</div>
        <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">23</div><div class="hebmu-pd-cell">16</div>
      </div>
    </div>
    <div>
      <div class="hebmu-pd-tag concat-tag">right</div>
      <div class="hebmu-pd-frame is-2col" aria-label="right">
        <div></div><div class="hebmu-pd-head">KEAP1</div><div class="hebmu-pd-head">ERBB2</div>
        <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">18</div><div class="hebmu-pd-cell">17</div>
        <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">34</div><div class="hebmu-pd-cell">10</div>
      </div>
    </div>
  </div>
  <div class="hebmu-pd-arrow concat-arrow" aria-hidden="true">→</div>
  <div>
    <div class="hebmu-pd-tag concat-tag">结果 2×4</div>
    <div class="hebmu-pd-frame is-4col" aria-label="axis=1 result">
      <div></div><div class="hebmu-pd-head">EGFR</div><div class="hebmu-pd-head">KRAS</div><div class="hebmu-pd-head">KEAP1</div><div class="hebmu-pd-head">ERBB2</div>
      <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">118</div><div class="hebmu-pd-cell">4.8</div><div class="hebmu-pd-cell">18</div><div class="hebmu-pd-cell">17</div>
      <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">23</div><div class="hebmu-pd-cell">16</div><div class="hebmu-pd-cell">34</div><div class="hebmu-pd-cell">10</div>
    </div>
  </div>
</div>

<div class="concat-code">

```python
pd.concat([batch_a, batch_b], axis=0)
```

</div>

<div class="concat-code">

```python
pd.concat([left, right], axis=1)
```

</div>

<p class="concat-shape">本讲实测 (30, 9)（含ID列）</p>
<p class="concat-shape">本讲实测 (28, 20)（不含ID列） · 按索引对齐</p>

</div>

<p class="concat-scene">典型场景：两个批次的测序数据垂直合并；表达矩阵与基因注释水平拼接</p>

<div class="hebmu-callout hebmu-callout-key">

一句话区分：**merge 按键找朋友，concat 按位置拼积木**

</div>

<!-- notes: 顶部 Input 定义 batch_a/batch_b 与 left/right。左面板 axis=0 示意 4×2 对应实测 (30,9)；右面板 axis=1 示意 2×4 对应实测 (28,20)。双列共用 grid 行，保证两行代码与两行实测说明水平对齐。join() 一句带过。concat 进阶参数 → 课后自学页（书 ch8 §8.2.3）。-->

---
layout: default
hideFrame: true
density: compact
---

# reindex：按索引标签对齐

<style scoped>
.rx-step {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin: 0.1rem 0 0.2rem;
}
.rx-col { display: flex; flex-direction: column; align-items: center; }
.rx-tag {
  font-size: 14px;
  margin-bottom: 0.1rem;
  line-height: 1.2;
}
.rx-arrow {
  font-size: 1.6rem;
}
.hebmu-pd-frame {
  gap: 0.21rem 0.23rem;
  font-size: 14px;
  line-height: 1.1;
}
.hebmu-pd-frame.is-2col { grid-template-columns: 3.1rem minmax(4.2rem, 1fr); }
.hebmu-pd-frame.is-3col { grid-template-columns: 2.2rem minmax(4.4rem, 1fr) minmax(3.4rem, 1fr); }
.hebmu-pd-frame.is-ids { grid-template-columns: minmax(4.4rem, 1fr); }
.hebmu-pd-idx, .hebmu-pd-head, .hebmu-pd-cell {
  border-radius: 4px;
  min-height: 1.7rem;
  min-width: 0;
  padding: 0 0.22rem;
}
.rx-code {
  margin: 0.15rem 0 0.05rem;
}
.rx-code .slidev-code-wrapper,
.rx-code pre {
  margin: 0;
  font-size: 12px;
}
</style>

<!-- ① set_index：列 → 索引 -->
<div class="rx-code">

```python
stage = lung.set_index("patient_id")["stage"]
```

</div>
<div class="rx-step">
  <div class="rx-col">
    <div class="hebmu-pd-tag rx-tag">lung（ID 还是列）</div>
    <div class="hebmu-pd-frame is-3col" aria-label="lung before set_index">
      <div></div><div class="hebmu-pd-head">patient_id</div><div class="hebmu-pd-head">stage</div>
      <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">IIIB</div>
      <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">II</div>
      <div class="hebmu-pd-idx">2</div><div class="hebmu-pd-cell">LC004</div><div class="hebmu-pd-cell">IIIA</div>
    </div>
  </div>
  <div class="hebmu-pd-arrow rx-arrow" aria-hidden="true">→</div>
  <div class="rx-col">
    <div class="hebmu-pd-tag rx-tag">stage Series（ID 已是索引）</div>
    <div class="hebmu-pd-frame is-2col" aria-label="stage series">
      <div class="hebmu-pd-head">index</div><div class="hebmu-pd-head">stage</div>
      <div class="hebmu-pd-idx">LC001</div><div class="hebmu-pd-cell">IIIB</div>
      <div class="hebmu-pd-idx">LC002</div><div class="hebmu-pd-cell">II</div>
      <div class="hebmu-pd-idx">LC004</div><div class="hebmu-pd-cell">IIIA</div>
    </div>
  </div>
</div>

<!-- ② reindex：按 expr 的 ID 顺序取数 -->
<div class="rx-code">

```python
aligned = stage.reindex(expr_df["patient_id"])
```

</div>
<div class="rx-step">
  <div class="rx-col">
    <div class="hebmu-pd-tag rx-tag">stage</div>
    <div class="hebmu-pd-frame is-2col" aria-label="stage again">
      <div class="hebmu-pd-head">index</div><div class="hebmu-pd-head">stage</div>
      <div class="hebmu-pd-idx">LC001</div><div class="hebmu-pd-cell">IIIB</div>
      <div class="hebmu-pd-idx">LC002</div><div class="hebmu-pd-cell">II</div>
      <div class="hebmu-pd-idx">LC004</div><div class="hebmu-pd-cell">IIIA</div>
    </div>
  </div>
  <div class="rx-col">
    <div class="hebmu-pd-tag rx-tag">expr 的 ID 顺序</div>
    <div class="hebmu-pd-frame is-ids" aria-label="expr patient_id order">
      <div class="hebmu-pd-head">patient_id</div>
      <div class="hebmu-pd-cell">LC002</div>
      <div class="hebmu-pd-cell">LC001</div>
      <div class="hebmu-pd-cell">LC004</div>
    </div>
  </div>
  <div class="hebmu-pd-arrow rx-arrow" aria-hidden="true">→</div>
  <div class="rx-col">
    <div class="hebmu-pd-tag rx-tag">aligned（跟 expr 同行序）</div>
    <div class="hebmu-pd-frame is-2col" aria-label="aligned">
      <div class="hebmu-pd-head">index</div><div class="hebmu-pd-head">stage</div>
      <div class="hebmu-pd-idx">LC002</div><div class="hebmu-pd-cell">II</div>
      <div class="hebmu-pd-idx">LC001</div><div class="hebmu-pd-cell">IIIB</div>
      <div class="hebmu-pd-idx">LC004</div><div class="hebmu-pd-cell">IIIA</div>
    </div>
  </div>
</div>

<div class="hebmu-callout hebmu-callout-warning mt-2">

若按**位置**硬拼：expr 第1行 `LC002` 会错配到 lung 第1行 `LC001` 的 IIIB。`reindex` 后：`LC002 → II`

</div>

<div class="hebmu-callout hebmu-callout-key mt-2">

课后想一想：`trap = lung["stage"].reindex(expr_df["patient_id"])` —— 忘了 `set_index`，会怎样？

</div>

<!-- notes: R对照：match()按名字取数。reindex 按 ID 顺序取分期；错配 callout。第13讲聚类热图 row_colors=stage.map(颜色字典) 就用这招把 stage 对齐到 28 个样本。课后题答案口头可补：忘 set_index → 索引仍是 0,1,2…，整列 NaN、不报错（28/28），对齐后先查 isna().sum()。⏱️弹性2分钟。-->

---
layout: section
sectionNumber: 5
sectionTitle: '分组聚合：groupby与agg'
sectionTitleEn: 'groupby & agg'
---

---
layout: default
hideFrame: true
density: compact
---

# groupby + agg：拆分-应用-合并

<style scoped>
.gb-flow {
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-template-rows: auto auto;
  align-items: center;
  justify-content: center;
  column-gap: 0.825rem;
  row-gap: 0.225rem;
  margin: 0.3rem 0 0.375rem;
}
.gb-tag {
  font-size: 20px;
  line-height: 1.2;
}
.gb-arrow {
  font-size: 2.25rem;
  text-align: center;
}
.hebmu-pd-frame {
  gap: 0.27rem 0.3rem;
  font-size: 18px;
  line-height: 1.1;
}
.hebmu-pd-frame.is-2col { grid-template-columns: minmax(4.8rem, 1fr) minmax(6.3rem, 1fr); }
.hebmu-pd-frame.is-surv { grid-template-columns: minmax(5.4rem, 1fr); }
.gb-groups {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.525rem;
}
.gb-group-label {
  font-size: 17px;
  margin-bottom: 0.075rem;
}
.hebmu-pd-head, .hebmu-pd-cell {
  border-radius: 6px;
  min-height: 2.175rem;
  min-width: 0;
  padding: 0 0.3rem;
}
.gb-code {
  margin: 0.1rem 0 0.3rem;
}
.gb-code .slidev-code-wrapper,
.gb-code pre {
  margin: 0;
  font-size: 13px;
}
</style>

<div class="gb-flow">

<div class="hebmu-pd-tag gb-tag">① 原表</div>
<div></div>
<div class="hebmu-pd-tag gb-tag">② 切组</div>
<div></div>
<div class="hebmu-pd-tag gb-tag">③ 每组 median → 小表</div>

<div class="hebmu-pd-frame is-2col" aria-label="input df">
  <div class="hebmu-pd-head">stage</div><div class="hebmu-pd-head">survival</div>
  <div class="hebmu-pd-cell">II</div><div class="hebmu-pd-cell">41.2</div>
  <div class="hebmu-pd-cell">IIIB</div><div class="hebmu-pd-cell">18.3</div>
  <div class="hebmu-pd-cell">IV</div><div class="hebmu-pd-cell">7.6</div>
  <div class="hebmu-pd-cell">II</div><div class="hebmu-pd-cell">38.5</div>
  <div class="hebmu-pd-cell">IIIB</div><div class="hebmu-pd-cell">15.1</div>
  <div class="hebmu-pd-cell">IV</div><div class="hebmu-pd-cell">4.2</div>
</div>

<div class="hebmu-pd-arrow gb-arrow" aria-hidden="true">→</div>

<div class="gb-groups">
  <div>
    <div class="hebmu-pd-group-label gb-group-label">stage=II</div>
    <div class="hebmu-pd-frame is-surv" aria-label="group II">
      <div class="hebmu-pd-head">survival</div>
      <div class="hebmu-pd-cell">41.2</div>
      <div class="hebmu-pd-cell">38.5</div>
    </div>
  </div>
  <div>
    <div class="hebmu-pd-group-label gb-group-label">stage=IIIB</div>
    <div class="hebmu-pd-frame is-surv" aria-label="group IIIB">
      <div class="hebmu-pd-head">survival</div>
      <div class="hebmu-pd-cell">18.3</div>
      <div class="hebmu-pd-cell">15.1</div>
    </div>
  </div>
  <div>
    <div class="hebmu-pd-group-label gb-group-label">stage=IV</div>
    <div class="hebmu-pd-frame is-surv" aria-label="group IV">
      <div class="hebmu-pd-head">survival</div>
      <div class="hebmu-pd-cell">7.6</div>
      <div class="hebmu-pd-cell">4.2</div>
    </div>
  </div>
</div>

<div class="hebmu-pd-arrow gb-arrow" aria-hidden="true">→</div>

<div class="hebmu-pd-frame is-2col" aria-label="result">
  <div class="hebmu-pd-head">stage</div><div class="hebmu-pd-head">median</div>
  <div class="hebmu-pd-cell">II</div><div class="hebmu-pd-cell">39.85</div>
  <div class="hebmu-pd-cell">IIIB</div><div class="hebmu-pd-cell">16.7</div>
  <div class="hebmu-pd-cell">IV</div><div class="hebmu-pd-cell">5.9</div>
</div>

</div>

<div class="gb-code">

````md magic-move
```python
df.groupby("stage")["survival_months"].median()
```

```python
df.groupby("stage")["survival_months"].median()
df.groupby("stage")["survival_months"].agg(["median", "count"])   # 多聚合
```

```python
df.groupby("stage")["survival_months"].median()
df.groupby("stage")["survival_months"].agg(["median", "count"])   # 多聚合
df.groupby("stage").agg(med_surv=("survival_months", "median"))  # named agg：列名直接起好
```
````

</div>

<div class="hebmu-callout hebmu-callout-key mt-2">

拆分-应用-合并（split-apply-combine）：`groupby` 切组 → `median`/`agg` 每组算 → 拼回一张小表。Hadley Wickham 提出；R 半程对应 `aggregate()`，tidyverse 为 `group_by` + `summarise`

</div>


<!-- notes: 本页只讲单键 median 的 SAC 图像；代码 magic-move 三拍：① median → ② .agg([...]) 多聚合 → ③ named agg。多列分组留给下一页真数据。R 对照已收进 SAC callout。组内更复杂操作→自学（书 ch10 §10.2–10.3）。-->

---
layout: default
hideFrame: true
density: compact
---

# 真数据跑一遍：分期×吸烟的中位生存

```python
lung = pd.read_csv("demo_data/lung_clinical.csv")  # 30例

summary = (lung.groupby(["stage", "smoking"], as_index=False)
               .agg(n=("patient_id", "count"),
                    med_surv=("survival_months", "median"),  # 中位生存(月)
                    med_expr=("egfr_expr", "median")))       # 中位 egfr_expr
```

Output（`summary`）：

| stage | smoking | n | med_surv | med_expr |
|-------|---------|---|----------|----------|
| I | no | 3 | 58.60 | 3.02 |
| II | no | 5 | 42.90 | 3.95 |
| II | yes | 3 | 39.95 | 5.71 |
| IIIA | no | 3 | 29.80 | 4.66 |
| IIIA | yes | 1 | 24.90 | 7.88 |
| IIIB | yes | 6 | 15.95 | 7.56 |
| IV | yes | 9 | 5.90 | 9.93 |

<div class="hebmu-callout hebmu-callout-procedure mt-2">

数据自己会讲故事：IV期吸烟中位生存5.9个月 vs I期不吸烟58.6个月。⚠️ IIIA/yes组只有1人——样本量小，不下结论

</div>

<!-- notes: 现场用Jupyter跑出这张表（notebook Slide 22-23）。as_index=False 出平表——下一页专门讲。median自动忽略缺失值（survival_months有1个NaN）。IIIB 的 med_expr 实测约 7.555，表中四舍五入为 7.56。这张表第12讲 catplot/heatmap 还会用到。-->

---
layout: default
hideFrame: true
density: compact
---

# MultiIndex太碍事？as_index=False

<style scoped>
.ai-pair {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 2.4rem;
  margin: 0.45rem 0 0.35rem;
}
.ai-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}
.ai-tag {
  font-size: 20px;
  line-height: 1.2;
}
.ai-hint {
  font-size: 18px;
  color: var(--hebmu-text, #202020);
  line-height: 1.25;
  opacity: 0.85;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.hebmu-pd-frame {
  gap: 0.27rem 0.3rem;
  font-size: 20px;
  line-height: 1.1;
}
.hebmu-pd-frame.is-mi { grid-template-columns: minmax(4.8rem, 1fr) minmax(5.4rem, 1fr) minmax(3.6rem, 1fr); }
.hebmu-pd-frame.is-flat { grid-template-columns: 2.7rem minmax(4.8rem, 1fr) minmax(5.4rem, 1fr) minmax(3.6rem, 1fr); }
.hebmu-pd-idx, .hebmu-pd-head, .hebmu-pd-cell {
  border-radius: 5px;
  min-height: 2.3rem;
  min-width: 0;
  padding: 0 0.375rem;
}
</style>

```python
df.groupby(["stage", "smoking"]).agg(n=("patient_id", "count"))  # 默认：MultiIndex行索引
df.groupby(["stage", "smoking"], as_index=False).agg(...)        # 结果是普通平表，直接可 to_csv
```

<div class="ai-pair">

<div class="ai-col">
  <div class="hebmu-pd-tag ai-tag">默认 · MultiIndex 行索引</div>
  <div class="hebmu-pd-frame is-mi" aria-label="default MultiIndex result">
    <div class="hebmu-pd-head">stage</div><div class="hebmu-pd-head">smoking</div><div class="hebmu-pd-head">n</div>
    <div class="hebmu-pd-idx">II</div><div class="hebmu-pd-idx">no</div><div class="hebmu-pd-cell">5</div>
    <div class="hebmu-pd-idx">II</div><div class="hebmu-pd-idx">yes</div><div class="hebmu-pd-cell">3</div>
    <div class="hebmu-pd-idx">IIIA</div><div class="hebmu-pd-idx">yes</div><div class="hebmu-pd-cell">1</div>
  </div>
  <div class="hebmu-pd-hint ai-hint">取值要元组 · df.loc[("II","yes")]</div>
</div>

<div class="ai-col">
  <div class="hebmu-pd-tag ai-tag">as_index=False · 普通平表</div>
  <div class="hebmu-pd-frame is-flat" aria-label="as_index=False flat result">
    <div></div><div class="hebmu-pd-head">stage</div><div class="hebmu-pd-head">smoking</div><div class="hebmu-pd-head">n</div>
    <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">II</div><div class="hebmu-pd-cell">no</div><div class="hebmu-pd-cell">5</div>
    <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">II</div><div class="hebmu-pd-cell">yes</div><div class="hebmu-pd-cell">3</div>
    <div class="hebmu-pd-idx">2</div><div class="hebmu-pd-cell">IIIA</div><div class="hebmu-pd-cell">yes</div><div class="hebmu-pd-cell">1</div>
  </div>
  <div class="hebmu-pd-hint ai-hint">直接 to_csv · df["n"]</div>
</div>

</div>

<div class="hebmu-callout hebmu-callout-key mt-3">

初学阶段统一加 `as_index=False`：打印好看、取值简单、存CSV不乱（书里也推荐：省掉不必要的计算）

</div>

<!-- notes: 左：默认 MultiIndex，stage/smoking 是行索引（紫格），取值要元组键；右：as_index=False 平表，stage/smoking 是普通列。示意3组只看 n。unstack()只口头提一句，不要求。McKinney ch10 §10.2「Returning Aggregated Data Without Row Indexes」原话：as_index=False "avoids some unnecessary computations"——书站我们这边。-->

---
layout: section
sectionNumber: 6
sectionTitle: '长宽转换与流程闭环'
sectionTitleEn: 'Reshape & Pipeline'
---

---
layout: default
hideFrame: true
density: compact
---

# 长宽转换：melt 融化 = 宽变长

<style scoped>
.ml-pair { gap: 1.43rem; margin: 0.455rem 0 0.39rem; }
.ml-col { gap: 0.325rem; }
.ml-tag { font-size: 20px; }
.ml-hint { font-size: 17px; }
.ml-arrow { font-size: 2.34rem; padding-top: 1.82rem; }
.hebmu-pd-frame {
  gap: 0.21rem 0.23rem;
  font-size: 17px;
}
.hebmu-pd-idx, .hebmu-pd-head, .hebmu-pd-cell {
  border-radius: 5px;
  min-height: 1.885rem;
  min-width: 0;
  padding: 0 0.286rem;
}
.hebmu-pd-frame.is-wide { grid-template-columns: 2.08rem repeat(4, minmax(4.42rem, 1fr)); }
.hebmu-pd-frame.is-long { grid-template-columns: 2.08rem minmax(5.46rem, 1fr) minmax(4.16rem, 1fr) minmax(4.68rem, 1fr); }
</style>

```python
mini = expr_df[["patient_id", "EGFR", "KRAS", "TP53"]].head(2)  # 2样本小表
long = mini.melt(id_vars="patient_id",
                 value_vars=["EGFR", "KRAS", "TP53"],   # 3列表达值堆成1列
                 var_name="gene", value_name="tpm")
```

<div class="ml-pair">

<div class="ml-col">
  <div class="hebmu-pd-tag ml-tag">宽表 · 2样本×3基因</div>
  <div class="hebmu-pd-frame is-wide" aria-label="wide mini">
    <div></div><div class="hebmu-pd-head">patient_id</div><div class="hebmu-pd-head">EGFR</div><div class="hebmu-pd-head">KRAS</div><div class="hebmu-pd-head">TP53</div>
    <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">117.93</div><div class="hebmu-pd-cell">4.84</div><div class="hebmu-pd-cell">16.09</div>
    <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">22.89</div><div class="hebmu-pd-cell">15.81</div><div class="hebmu-pd-cell">46.02</div>
  </div>
</div>

<div class="hebmu-pd-arrow ml-arrow" aria-hidden="true">→</div>

<div class="ml-col">
  <div class="hebmu-pd-tag ml-tag">长表 · 6行 = 2×3</div>
  <div class="hebmu-pd-frame is-long" aria-label="long after melt">
    <div></div><div class="hebmu-pd-head">patient_id</div><div class="hebmu-pd-head">gene</div><div class="hebmu-pd-head">tpm</div>
    <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">EGFR</div><div class="hebmu-pd-cell">117.93</div>
    <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">EGFR</div><div class="hebmu-pd-cell">22.89</div>
    <div class="hebmu-pd-idx">2</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">KRAS</div><div class="hebmu-pd-cell">4.84</div>
    <div class="hebmu-pd-idx">3</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">KRAS</div><div class="hebmu-pd-cell">15.81</div>
    <div class="hebmu-pd-idx">4</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">TP53</div><div class="hebmu-pd-cell">16.09</div>
    <div class="hebmu-pd-idx">5</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">TP53</div><div class="hebmu-pd-cell">46.02</div>
  </div>
  <div class="hebmu-pd-hint ml-hint">6行 = 2样本 × 3基因</div>
</div>

</div>

<div class="hebmu-callout hebmu-callout-key mt-2">

**melt 融化 = 宽变长**：R 第5讲 reshape2 的 `melt()` 同名同义（tidyverse: `pivot_longer()`）—— pandas 连函数名都没换

</div>

<!-- notes: 唤醒第5讲reshape2记忆。课件并排 pd-diagram：左宽表2×4、右长表6×3，EGFR/KRAS/TP53 全部入堆可见。快问快答：画3个基因在3个样本的表达对比，用宽表还是长表？（长表）。口头可补：ggplot/Seaborn 都以长数据为输入。第12讲把整张28×20矩阵melt成560行喂给seaborn——本页的2样本小演习就是那次大动作的缩小版。-->

---
layout: default
hideFrame: true
density: compact
---

# pivot / pivot_table：长转宽

<style scoped>
.pv-pair { gap: 1.43rem; margin: 0.455rem 0 0.39rem; }
.pv-col { gap: 0.325rem; }
.pv-tag { font-size: 20px; }
.pv-hint { font-size: 17px; }
.pv-arrow { font-size: 2.34rem; padding-top: 1.82rem; }
.hebmu-pd-frame {
  gap: 0.21rem 0.23rem;
  font-size: 17px;
}
.hebmu-pd-idx, .hebmu-pd-head, .hebmu-pd-cell {
  border-radius: 5px;
  min-height: 1.885rem;
  min-width: 0;
  padding: 0 0.286rem;
}
.hebmu-pd-frame.is-long { grid-template-columns: 2.08rem minmax(5.46rem, 1fr) minmax(4.16rem, 1fr) minmax(4.68rem, 1fr); }
.hebmu-pd-frame.is-wide { grid-template-columns: minmax(5.46rem, 1fr) repeat(3, minmax(4.42rem, 1fr)); }
</style>

```python
wide = long.pivot(index="patient_id", columns="gene", values="tpm")
# 长转宽 —— R 第5讲: reshape2::dcast()（tidyverse: pivot_wider()）

# 带聚合的长转宽 —— R: dcast(..., fun.aggregate=mean)
pt = long.pivot_table(index="patient_id", columns="gene",
                      values="tpm", aggfunc="mean")
```

<div class="pv-pair">

<div class="pv-col">
  <div class="hebmu-pd-tag pv-tag">长表 long · 6行</div>
  <div class="hebmu-pd-frame is-long" aria-label="long before pivot">
    <div></div><div class="hebmu-pd-head">patient_id</div><div class="hebmu-pd-head">gene</div><div class="hebmu-pd-head">tpm</div>
    <div class="hebmu-pd-idx">0</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">EGFR</div><div class="hebmu-pd-cell">117.93</div>
    <div class="hebmu-pd-idx">1</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">EGFR</div><div class="hebmu-pd-cell">22.89</div>
    <div class="hebmu-pd-idx">2</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">KRAS</div><div class="hebmu-pd-cell">4.84</div>
    <div class="hebmu-pd-idx">3</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">KRAS</div><div class="hebmu-pd-cell">15.81</div>
    <div class="hebmu-pd-idx">4</div><div class="hebmu-pd-cell">LC001</div><div class="hebmu-pd-cell">TP53</div><div class="hebmu-pd-cell">16.09</div>
    <div class="hebmu-pd-idx">5</div><div class="hebmu-pd-cell">LC002</div><div class="hebmu-pd-cell">TP53</div><div class="hebmu-pd-cell">46.02</div>
  </div>
</div>

<div class="hebmu-pd-arrow pv-arrow" aria-hidden="true">→</div>

<div class="pv-col">
  <div class="hebmu-pd-tag pv-tag">宽表 wide · 2×3</div>
  <div class="hebmu-pd-frame is-wide" aria-label="wide after pivot">
    <div class="hebmu-pd-head">patient_id</div><div class="hebmu-pd-head">EGFR</div><div class="hebmu-pd-head">KRAS</div><div class="hebmu-pd-head">TP53</div>
    <div class="hebmu-pd-idx">LC001</div><div class="hebmu-pd-cell">117.93</div><div class="hebmu-pd-cell">4.84</div><div class="hebmu-pd-cell">16.09</div>
    <div class="hebmu-pd-idx">LC002</div><div class="hebmu-pd-cell">22.89</div><div class="hebmu-pd-cell">15.81</div><div class="hebmu-pd-cell">46.02</div>
  </div>
  <div class="hebmu-pd-hint pv-hint">gene 回到列名 · 与 melt 前一致</div>
</div>

</div>

<v-clicks>

- `pivot` 遇重复值**报错**，`pivot_table` 自动聚合 —— `aggfunc` 就是上一模块的 `agg`：**groupby + pivot 的合体**

</v-clicks>

<div class="hebmu-callout hebmu-callout-key mt-3" v-click>

报错是好事：`pivot` 逼你想清楚重复值怎么办

</div>

<!-- notes: 课件并排 pd-diagram：左长表6×3、右宽表2×3（patient_id 为行索引），与上一页 melt 示意小表同一套数。无重复值时 pivot 与 pivot_table 数值一致。现场讨论：要触发报错得先制造重复键——pd.concat([long, long.head(1)]) 再 pivot → ValueError；pivot_table 则按 aggfunc 聚合。口头可补：本页放在 groupby 之后，aggfunc 不再是黑箱；书ch10 §10.5 也把 pivot_table 放在聚合章（pivot_table = groupby聚合 + 层级索引变形）。-->

---
layout: default
hideFrame: true
---

# 完整流程闭环：读 → 合 → 组 → 透视 → 存

<style scoped>
.pipeline-callout p { white-space: nowrap; }
</style>

```python
expr = pd.read_csv("expr_matrix.csv")          # ① 读 (read)
clin = pd.read_csv("lung_clinical.csv")

merged = pd.merge(expr, clin, on="patient_id",
                  how="left")                  # ② 合 (merge)（数行数！）

summary = (merged.groupby(["stage", "smoking"], as_index=False)
                 .agg(n=("patient_id", "count"),
                      med_expr=("egfr_expr", "median")))   # ③ 组 (groupby)

wide = summary.pivot(index="stage", columns="smoking",
                     values="med_expr")        # ④ 透视 (pivot)
summary.to_csv("summary.csv", index=False)     # ⑤ 存 (to_csv)
```

<div class="hebmu-callout hebmu-callout-procedure mt-2 pipeline-callout" v-click>

这就是 R 半程 `read.csv → merge → aggregate → dcast → write.csv` 的 Python 镜像

</div>

<!-- notes: 本章大结局：五步流程串起全部武器，方法链版写在notebook Slide 28。口头可补：R 半程第3/5讲五步每步都见过；五步顺序=本讲下半节回放（合→组→pivot）；每次 merge、每次 dropna 后都数行数（② 注释已写「数行数」）。④ pivot 输出里有3个NaN（I/yes、IIIB/no、IV/no无样本）——第12讲heatmap"空白格子"页与第13讲"clustermap不接受NaN"页都以它为引子。强调作业和实验课都按这个骨架写。-->

---
layout: section
sectionNumber: 7
sectionTitle: '总结与作业'
sectionTitleEn: 'Summary & Assignment'
---

---
layout: default
hideFrame: true
---

# 课堂小测（快问快答）

<style scoped>
.quiz-ans {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.35rem;
}
.quiz-ans > p {
  width: 100%;
  margin: 0;
}
</style>

<v-clicks>

1. 设 `expr_df` 30 行，`clin_df` 只有其中 27 个ID：`expr_df.merge(clin_df, on="patient_id")`（默认inner）结果几行？想保留 expr 全部30行用哪种 `how`？

2. `2 ** 3` 与 `2 ^ 3`，哪个是幂运算？

3. 一行代码算"各分期的中位生存时间"，并写出 R 对照

</v-clicks>

<div class="hebmu-callout hebmu-callout-check mt-4 quiz-ans" v-click>

<p>答案：</p>
<p>① <strong>27行</strong>（inner=交集；先数行数再下结论——本讲真数据是 expr 28/临床 30，inner=28，同一原理）；保留全部用 <code>how="left"</code></p>
<p>② <code>2 ** 3</code>；<code>^</code> 是按位异或（XOR）——第9讲讲过，检验留存率</p>
<p>③ <code>df.groupby("stage")["survival_months"].median()</code> ←→ R 半程写法 <code>aggregate(lung$survival_months, by=list(lung$stage), FUN=median)</code>（tidyverse：<code>group_by(stage) %&gt;% summarise(median(survival_months))</code>）</p>

</div>

<!-- notes: 第1题请1名学生口答并追问"为什么"；题干是假想计数场景（30/27），与课堂实测数据（28/30）区分。第2题观察第9讲内容的留存率；第3题上黑板写。三题全部落在本讲核心三件武器内——课后自学内容不进小测。-->

---
layout: default
hideFrame: true
density: compact
---

# R↔Pandas 速查表

<style scoped>
.cheat-wrap { margin: 0.25rem 0 0; width: 100%; }
.cheat-wrap :deep(table) {
  font-size: 12px;
  line-height: 1.2;
  width: 100%;
  table-layout: auto;
}
.cheat-wrap :deep(th),
.cheat-wrap :deep(td) {
  padding: 0.28rem 0.5rem;
  vertical-align: middle;
}
.cheat-wrap :deep(th) { font-size: 12px; }
.cheat-wrap :deep(code) {
  font-size: 11px;
  white-space: nowrap;
}
</style>

<div class="cheat-wrap">

| 任务 | R base | tidyverse | Pandas |
|------|------|------|------|
| 分组汇总 | `aggregate(x, by=list(g), FUN=mean)` | `group_by() %>% summarise()` | `groupby().agg()` |
| 分组变换 | `ave()` / `transform()` | `group_by() %>% mutate()` | `groupby().transform()` |
| 合并（内连接） | `merge(a, b, by="id")` | `inner_join(a, b, by="id")` | `a.merge(b, on="id")` |
| 合并（左连接） | `merge(..., all.x=TRUE)` | `left_join(a, b, by="id")` | `a.merge(..., how="left")` |
| 行/列拼接 | `rbind()` / `cbind()` | 同名 | `concat(axis=0/1)` |
| 宽转长 | `melt()` | `pivot_longer()` | `melt()` |
| 长转宽 | `dcast()` | `pivot_wider()` | `pivot()` / `pivot_table()` |
| 元素级施函数 | `sapply(x, f)` | 同族 | `x.map(f)` / 向量化 |
| 向量化运算 | `log2(x)` | 同 | `np.log2(x)` |
| 存表 | `write.csv(df, f)` | `write_csv(df, f)` | `df.to_csv(f, index=False)` |

</div>

<!-- notes: 课后发PDF版——和第9讲速查表贴在一起。10行速查表：分组汇总/分组变换/合并×2/拼接/长宽×2/map/向量化/存表。transform行保留（查表用），但课上没讲——课后自学页有去处。速查表与课后自学页一起发，正好一张管查阅、一张管进阶。-->

---
layout: default
hideFrame: true
---

# 本讲总结

<div class="hebmu-callout hebmu-callout-key">

**R 半程的 base R 功底 + NumPy 向量化 + Pandas 三件武器 = Python 数据分析进阶**

</div>

<v-clicks>

1. **NumPy 向量化** —— 整列一起算，不写 for；Z-score 矩阵已备好
2. **merge** 合并 —— 先数行数，再下结论
3. **groupby** 分组 —— `as_index=False` 出平表，`aggfunc` 与透视合体
4. **melt/pivot** 变形 —— 长宽随需，ggplot 以长数据为输入

</v-clicks>

<div class="mt-4" v-click>

流程骨架：`读 → 合(数行数!) → 组 → 透视 → 存` —— 作业与实验课都按它写

</div>

---
layout: default
hideFrame: true
density: compact
---

# 课后自学：今天没讲的，去哪学

<style scoped>
.self-study-wrap :deep(table) { font-size: 14px; line-height: 1.25; }
.self-study-wrap :deep(th),
.self-study-wrap :deep(td) { padding: 0.28rem 0.45rem; vertical-align: middle; }
.self-study-wrap :deep(code) { font-size: 13px; white-space: nowrap; }
</style>

<div class="self-study-wrap">

| 内容 | 一句话定位 | 去处 |
|------|-----------|------|
| 数组创建与属性 | `np.array / arange / linspace / zeros / ones / random.rand`；`shape / dtype / ndim / size` | McKinney 书 ch4 §4.1–4.2；notebook"自学"单元格 |
| 显式广播 `[:, None]` | NumPy 手动把列统计"立起来"对齐——DataFrame 会自动对齐，本讲用不上 | 书 ch4 → 附录A（书原话：深究广播非必需）；ch5 §5.2「Arithmetic and Data Alignment」 |
| `transform` 组内回填 | 给**每行**加一列"本组统计量"，行数不变 | 书 ch10 §10.4；notebook"自学"单元格 |
| CoW 与 loc 赋值 | 视图/副本的来龙去脉、`df.loc[cond, col]` 细节 | 书 ch5 "Pitfalls with chained indexing" |
| concat 进阶 | `keys=` 给批次打标签、`ignore_index=True` | 书 ch8 §8.2.3 |
| groupby + apply | 组内取 top-N、自定义组函数 | 书 ch10 §10.3 |

</div>

<!-- notes: 大纲完成度说明（教案有专节）：第十章大纲的NumPy创建/属性、显式广播、transform在课上压缩为"指地图"，自学页给出书章节定位——覆盖方式从"课堂讲授"改为"课堂导览+课后自学"，教案与大纲的对账写进教案第五节。口头可补：课上抓核心、课后给地图；下次课前钉钉群发本页截图+速查表PDF，对照书读一遍即可，不进小测。作业4/实验课可能用到map与loc赋值。本地镜像：resource/pydata_book_3e/site/。-->

---
layout: default
hideFrame: true
density: compact
---

# 课后作业（11-19 交）

<div class="text-sm">

1. **多表合并**：5人注释表与 `lung_clinical.csv` 分别做 inner 和 left 合并 —— **各几行？LC099去哪了？left后谁的 hospital 是 NaN？**

| patient_id | hospital | batch |
|------|------|------|
| LC001 / LC004 | 附一院 | B1 / B2 |
| LC002 | 附二院 | B1 |
| LC005 | 附三院 | B2 |
| LC099 | 外院 | B3 |

2. **分组汇总**：按 `stage`×`smoking` 分组，输出各组的 n、中位生存、中位 `egfr_expr`（`as_index=False`），`to_csv` 提交

3. **长宽转换**：自建 `stage`×`age_group` 频数表——`pd.cut` 分箱（第9讲见过）+ `groupby` 计数（本讲），再 `melt` 转长、`pivot_table` 转回宽，验证一致

4. **R→Python翻译**（读法提示：`filter` 筛选行、`group_by+summarise` 分组汇总——与第5讲 `subset`+`aggregate` 同任务；dplyr 写法 R 半程未讲，钉钉群有逐词释义）：

</div>

```r
lung %>% filter(stage %in% c("IIIB","IV")) %>%
  group_by(stage) %>%
  summarise(n = n(), med_surv = median(survival_months, na.rm = TRUE))
```

---
layout: default
hideFrame: true
---

# 预告：下一讲

```mermaid
flowchart LR
    A["第9讲\nPandas基础"] --> B["第10讲\nNumPy/Pandas进阶"]
    B --> C["第11-14讲\nMatplotlib/Seaborn\n热图/Plotly"]
    C --> D["第15-16讲\n序列绘图与\nJupyter报告"]
```

**第11讲 Matplotlib基础绘图** · 2026-11-19（周四 6–7节）

- Figure/Axes 体系与两种绘图接口（pyplot vs 面向对象）
- 散点图、折线图、柱状图、直方图、箱线图
- 本讲的 Z-score 矩阵，就是第12–13讲聚类热图的输入

<div class="hebmu-callout hebmu-callout-procedure mt-3">

预习：[Matplotlib快速入门](https://matplotlib.org/stable/tutorials/introductory/quick_start.html)（重点看面向对象接口）；思考：ggplot2的"图层"思维，对应 `fig, ax = plt.subplots()` 里的什么？

</div>

<!-- notes: 预习与前测设计沿用第11讲课件开场。课后自学没完成的同学：优先补数组创建（第11讲绘图数据准备会用np.array造y值）。思考题答案：图层≈ax（Axes对象）——ggplot的geom+aes叠在ax上。-->

---
layout: end
endMessage: '谢谢聆听'
endMessageEn: 'Thank You'
---
