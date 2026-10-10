# 首页利率、佣金数据及跳转页联动修改说明

## 1. 结论

当前站点的利率和佣金数据不是从一个统一配置文件读取，而是直接写在多个 HTML 文件中。因此，修改首页数字后，必须同步修改对应落地页、页面导航摘要以及可能仍会被访问的带哈希镜像文件。

目前首页与落地页已经存在明显不一致：

| 业务项目 | 首页当前值 | 对应落地页当前值 | 状态 |
| --- | ---: | ---: | --- |
| YMC Pro 现金利率 | 4.87% | 3.13% | 不一致 |
| 首页主文案现金利率 | 4.87% | 3.13% | 不一致 |
| YMC Pro 保证金利率 | 3.92% | 4.13% | 不一致 |
| YMC Lite 保证金利率 | 5.74% | 落地页未按 Lite/Pro 展示该值 | 缺少对应说明 |
| YMC Lite 现金利率 | 3.62% | 利率落地页只突出 3.13% | 不一致/口径不清 |
| YMC Lite 股票及 ETF 佣金 | $0 | 佣金页为 $0 | 一致 |
| YMC Pro 每股佣金 | $0.005/share | 佣金页需按具体产品表核对 | 首页只是摘要 |

因此不能只改 `_fron/index.html`。最稳妥的做法是先确定一套最终业务口径，再按下文的联动清单一次性修改。

## 2. 首页数据在哪里修改

文件：`_fron/index.html`

### 2.0 首页全部业务数字总表（主维护索引）

以下“首页数字”仅指用户实际能看到的业务数字，不包括 CSS 百分比、响应式宽度、图片尺寸、HTML class 名称和 SVG 坐标。

| 首页数字/日期 | 首页标注与行号 | 点击或披露跳转页 | 跳转页对应标注与行号 | 当前结论 | 修改要求 |
| --- | --- | --- | --- | --- | --- |
| 现金利率 4.87% | `_fron/index.html:2631` 首屏；`:2717` 现金卡；`:2764` Pro 卡 | `_fron/en/accounts/fees/pricing-interest-rates.html` | `:2306` 主标题、`:2735` YMC 滑条、`:3848` 规则、`:3858` 表格说明、`:3872` 下方计算器均为 3.13% | **冲突** | 选定最终 Pro 现金利率后，首页三处、利率页正文/计算器、导航摘要和镜像一起改 |
| 现金利率 3.62%（Lite） | `_fron/index.html:2753` Lite 卡 | `_fron/en/accounts/fees/pricing-interest-rates.html` | 页面未清楚展示 Lite 3.62%，只突出 3.13% | **缺少对应标注** | 利率页增加 Lite/Pro 分档并让计算器明确使用哪一档；否则首页不能单独写 3.62% |
| 保证金利率 3.92%（Pro） | `_fron/index.html:2729` 保证金卡；`:2763` Pro 卡 | `_fron/en/whyib/low-cost-margin.html`；披露另跳 `_fron/en/whyib/low-cost.html` | `low-cost-margin.html:2440` 为 4.13%；`low-cost.html:2466` 也为 4.13% | **冲突** | 两个落地页正文、导航摘要及 `_fron/en/trading/margin-rates.html` 必须与首页 Pro 值一致 |
| 保证金利率 5.74%（Lite） | `_fron/index.html:2752` Lite 卡 | 卡片整体跳 `_fron/en/pricing/commissions-home.html` | 佣金页未给出 Lite 5.74% 保证金说明 | **缺少对应标注** | 在佣金页计划对比或保证金页加入 Lite 5.74%；否则首页不能孤立展示该值 |
| 比行业平均低 48% | `_fron/index.html:2631`；披露 `:3008` | `_fron/en/whyib/low-cost.html` | 页面没有 48% 对应比较值；只在 `:2466` 写最低利率 4.13% | **缺少依据** | 落地页加入同口径 48% 比较、比较对象和日期，或删除首页 48% 宣称 |
| Lite 佣金 $0 | `_fron/index.html:2631`、`:2751`；披露 `:3009` | `_fron/en/pricing/commissions-home.html` | `:2500`、`:2522`、`:2664`、`:2965–2972`、`:3120` 均说明 zero/$0 commissions | **基本一致** | 修改时同时改首页两处、佣金页卡片、FAQ、披露及适用条件 |
| Pro 佣金 $0.005/share | `_fron/index.html:2762`；披露 `:3010` | `_fron/en/pricing/commissions-home.html` | 首页跳转到总览页，但对应费率需继续在产品佣金表中核对 | **需补直接标注** | 佣金首页计划对比应直接显示相同 `$0.005/share`，并链接具体费率表 |
| 180+ global markets | `_fron/index.html:2631`、`:2679` | `_fron/en/trading/products-stocks.html`（`:2685`、`:2695` 链接） | `products-stocks.html:11` 和 `:2425` 写 **90+ market centers** | **冲突** | 若是同一口径则统一；若 markets 与 market centers 不同，首页及落地页必须明确单位差异 |
| 4.8 Million 账户 | `_fron/index.html:2921–2922` | `_fron/en/general/financial-strength.html`（`:2960`） | 财务页未找到 4.8 Million 对应标注 | **缺少对应标注** | 财务页增加相同账户指标、统计日期和口径，或从首页移除 |
| 3.6 Million 日订单 | `_fron/index.html:2925–2927` | `_fron/en/general/financial-strength.html` | 财务页未找到 3.6 Million 对应标注 | **缺少对应标注** | 财务页增加相同指标、统计日期和“日均/某日”口径 |
| 42 Regions | `_fron/index.html:2934–2935` | `_fron/en/general/financial-strength.html` | 财务页未找到 42 Regions 对应标注 | **缺少对应标注** | 财务页增加相同区域数量并定义 region 的统计口径 |
| $847 Billion capital activity | `_fron/index.html:2939–2941` | `_fron/en/general/financial-strength.html` | 财务页未找到 $847 Billion 对应标注 | **缺少对应标注** | 财务页增加同名指标、周期、币种与日期；不能用其他资产指标替代 |
| $18.4 Billion platform equity | `_fron/index.html:2943–2945` | `_fron/en/general/financial-strength.html` | `financial-strength.html:2342`、`:2448` 为 **$22.3 billion equity capital** | **冲突且名称不清** | 若是同一指标必须统一；若定义不同，双方页面必须解释，不能让用户误认为同一数值 |
| $5 Million available cash coverage | `_fron/index.html:2947–2950`；披露 `:3011` | `_fron/en/accounts/sweep-program.html` | `:2245` 为个人账户 **$5,000,000 FDIC**、总保障 **$5,250,000**；联合账户为 $10,000,000/$10,250,000 | **摘要口径不完整** | 首页明确是个人账户 FDIC 部分还是含 SIPC 的总保障；若写 total coverage，应与落地页 $5.25M 一致 |
| 30 Years | `_fron/index.html:2952–2955` | `_fron/en/general/financial-strength.html` | 财务页 `:2922` 写 **nearly 50 years**；导航也多处写 50 years | **冲突** | 确定成立年限或业务年限；同一 market experience 口径只能保留一个数字 |
| June 18, 2026 | `_fron/index.html:2895` 引用日期 | 当前引用没有可用来源跳转 | 无对应来源页 | **不可核验** | 若保留，增加可访问来源/说明；修改引用时同步日期 |
| August 7, 2026 | `_fron/index.html:3007` 利率生效日 | 利率页及 `_fron/en/accounts/sweep-program.html` | `sweep-program.html:2294` 同为 August 7, 2026；利率页主标题旁未明确日期 | **部分一致** | 每次改利率都同步更新首页披露、利率页和 sweep 页的生效日期 |
| 脚注 4 | `_fron/index.html:2766`、`:2949` | `_fron/en/accounts/sweep-program.html` | 落地页 `:2245` 的保障金额及脚注体系 | **需保持引用语义** | 调整披露顺序时确保脚注仍指向 sweep program |

#### 首页导航本身也存在冲突

首页打开 Pricing 导航时，还会看到另一套旧数字：

- `_fron/index.html:1445`、`:1653`：保证金最低 **4.13%**
- `_fron/index.html:1446`、`:1654`：现金利率最高 **3.13%**

这与首页主体的 Pro 保证金 3.92%、Pro 现金 4.87% 冲突。因此任何利率修改都必须同时覆盖首页正文和首页桌面/移动导航，不能只处理卡片。

#### 当前必须先解决的冲突集合

```text
现金利率：4.87%（首页主体） vs 3.13%（首页导航、利率页和计算器）
Lite 现金：3.62%（首页） vs 落地页无 Lite 对应值
Pro 保证金：3.92%（首页主体） vs 4.13%（首页导航和两个保证金落地页）
Lite 保证金：5.74%（首页） vs 落地页无 Lite 对应值
市场数量：180+（首页） vs 90+ market centers（产品页）
权益资本：$18.4B（首页） vs $22.3B（财务页）
从业年限：30 年（首页） vs nearly 50 years（财务页）
现金保障：$5M（首页简称） vs $5M FDIC / $5.25M total（sweep 页）
```

### 2.1 现金利率 4.87%

当前出现位置：

- 第 2631 行：首页首屏文案 `up to USD 4.87%`
- 第 2717 行：现金利率卡片 `USD 4.87%`
- 第 2764 行：YMC Pro 的 `Cash rates up to USD 4.87%`

这三处必须保持完全一致。

### 2.2 保证金利率 3.92%

当前出现位置：

- 第 2729 行：保证金卡片 `USD 3.92%`
- 第 2763 行：YMC Pro 的 `Margin from USD 3.92%`

这两处必须保持一致，并与保证金落地页的最低利率一致。

### 2.3 YMC Lite 保证金利率 5.74%

当前出现位置：

- 第 2752 行：YMC Lite 的 `Margin from USD 5.74%`

如修改该数值，佣金页或保证金页中也应明确增加/更新 Lite 对应利率，否则用户从首页跳转后找不到 5.74% 的依据。

### 2.4 YMC Lite 现金利率 3.62%

当前出现位置：

- 第 2753 行：YMC Lite 的 `Cash rates up to USD 3.62%`

如保留 Lite 和 Pro 两档不同利率，利率页必须明确展示两档，而不能只写一个笼统的 `Earn up to USD 3.13%`。

### 2.5 佣金值

当前出现位置：

- 第 2751 行：YMC Lite 为 `$0 Commissions`
- 第 2762 行：YMC Pro 为 `$0.005 per share`
- 第 3009、3010 行：对应披露及佣金页链接

如果修改佣金，还要同步修改佣金落地页的卡片、产品表、FAQ 和披露内容；不要只改首页卡片。

## 3. 跳转页联动清单

### 3.1 现金利率页

主文件：`_fron/en/accounts/fees/pricing-interest-rates.html`

现金基准利率目前统一使用 **3.13%**，关键位置如下：

- 第 1345、1429 行：桌面导航中的收益摘要
- 第 1412、1639 行：桌面/移动导航中的 Interest Rates 摘要
- 第 2306 行：页面主标题 `Earn up to USD 3.13%`
- 第 2735 行：上方 YMC 换算滑条实际读取的基准利率
- 第 3848、3858 行：利率规则正文
- 第 3872 行：下方利率表/计算器读取的基准利率

如果首页 YMC Pro 现金利率采用 4.87%，以上所有业务位置应同步改成 4.87%。如果 YMC Lite 保留 3.62%，则不能把所有 3.13% 简单全局替换为 4.87%，而应在页面上分别标注 Lite 3.62% 和 Pro 4.87%，并让相应计算器选择正确计划后再读取对应利率。

注意：页面中类似 CSS 颜色数值里的 `84.13%` 不是利率，不能误替换。应搜索完整的业务值，例如 `3.13%`，并逐条检查上下文。

### 3.2 保证金页

主文件：`_fron/en/whyib/low-cost-margin.html`

该页当前最低保证金利率为 **4.13%**：

- 第 1484、1568 行：桌面导航收益摘要
- 第 1550、1777 行：桌面/移动导航 Margin Rates 摘要
- 第 2440 行：页面正文 `Margin rates as low as USD 4.13%`

如果首页 YMC Pro 保证金利率采用 3.92%，这些业务位置必须同步改成 3.92%。

首页还单独写了 YMC Lite 5.74%。若这是有效产品利率，应在该页增加清楚的 Lite/Pro 对照，例如 `YMC Lite: 5.74%`、`YMC Pro: 3.92%`，不要只显示一个不区分计划的最低值。

另一个相关页面是 `_fron/en/trading/margin-rates.html`。导航和部分“Learn More”链接实际会进入该文件，因此修改保证金利率时也必须搜索和核对它，不能只处理用户列出的 `low-cost-margin.html`。

### 3.3 佣金页

主文件：`_fron/en/pricing/commissions-home.html`

该页当前包含：

- YMC Lite：US stocks and ETFs 为 zero commissions / `$0`
- 页面卡片、FAQ、披露中多次解释 commission-free 条件
- 导航摘要仍写现金 3.13%、保证金 4.13%

如果只修改 4.87%、3.92%、5.74% 等利率，佣金产品正文通常不需要改，但该文件自身导航里的 3.13% 和 4.13% 必须同步，否则进入佣金页后顶部菜单仍显示旧数据。

如果修改 `$0` 或 `$0.005/share`，则需重点核对该页约第 2500、2522、2664、2965–2972、3118–3129 行附近的卡片、FAQ 和披露。

## 4. 带哈希镜像文件也可能需要同步

目录中存在同一页面的多个静态镜像：

- `_fron/en/accounts/fees/pricing-interest-rates.html`
- `_fron/en/accounts/fees/pricing-interest-rates255e.html`
- `_fron/en/accounts/fees/pricing-interest-rates7abe.html`
- `_fron/en/pricing/commissions-home.html`
- `_fron/en/pricing/commissions-home31b2.html`
- `_fron/en/pricing/commissions-home7abe.html`

首页卡片使用无哈希文件，但桌面导航中的链接经常指向 `*7abe.html?menu=B`。所以只修改无哈希文件，用户从不同入口访问时仍可能看到旧值。

建议做法：

1. 先确认哪些镜像仍能通过导航进入。
2. 对所有可达镜像同步相同业务值和计算逻辑。
3. 更理想的长期方案是让所有链接只指向一份规范文件，并删除或停止引用重复镜像。

## 5. YMC 现金换算滑条当前按什么计算

位置：`_fron/en/accounts/fees/pricing-interest-rates.html` 第 2734–2906 行。

该区域实际上有两个滑条：

- 现金余额：0–100,000，步长 1,000，默认 40,000
- 账户净资产 NAV：0–100,000，步长 1,000，默认 50,000

当前核心参数：

| 参数 | 当前值 | 代码位置 |
| --- | ---: | --- |
| 基准年利率 `r` | 3.13% | 第 2735 行 `.interest-rate-var` |
| 免息现金门槛 `b` | $10,000 | 第 2843 行 `nonInterestBase = 10000` |
| NAV 满倍率门槛 | $100,000 | 第 2860 行 `navVal / 100000` |
| NAV 倍率范围 | 0–1 倍 | 第 2861–2862 行 |
| 月度天数 | 30 天 | 第 2890 行 `30/365` |
| 年度天数 | 365 天 | 第 2889 行 `365/365` |

公式如下：

```text
NAV 倍率 p = min(NAV / 100,000, 1)

当现金余额 a <= 10,000 时：
有效年利率 = 0

当现金余额 a > 10,000 时：
有效年利率 = 基准年利率 r × ((a - 10,000) / a) × NAV 倍率 p

预计年利息 = a × 有效年利率 / 100
预计月利息 = a × 有效年利率 / 100 × 30 / 365
```

化简后，年利息等于：

```text
(现金余额 - 10,000) × 基准年利率 / 100 × NAV 倍率
```

### 当前默认值示例

现金余额 40,000、NAV 50,000、基准年利率 3.13%：

```text
NAV 倍率 = 50,000 / 100,000 = 0.5
有效年利率 = 3.13% × (30,000 / 40,000) × 0.5 = 1.17375%
预计年利息 = 40,000 × 1.17375% = 469.50，页面四舍五入为 $470
预计 30 天利息 = 469.50 × 30 / 365 = 38.59，页面四舍五入为 $39
```

页面 HTML 当前预置显示 `$4,347`/`$362`，与现有公式不符。JavaScript 正常执行后会立即覆盖为 `$470`/`$39`，但脚本加载前或脚本失败时会显示错误值。建议把第 2767、2771 行的预置值也改为与默认参数一致，或者初始显示 `--`，等待计算完成后再填入。

## 6. 如何修改滑条的“倍率”

“倍率”可能指以下三种不同参数，应根据业务需求修改对应位置。

### 6.1 修改基础收益率

例如把 3.13% 改为 4.87%，修改第 2735 行：

```html
<span class="interest-rate-var ...">4.87%</span>
```

同时还要修改本页标题、规则正文、表格中的 3.13%，尤其是第 3872 行的第二个 `.interest-rate-var`，否则上方换算滑条和下方计算器会使用不同值。

在默认现金 40,000、NAV 50,000 下，4.87% 对应年息约 `$731`、30 天约 `$60`。

### 6.2 修改 NAV 倍率门槛

当前满倍率门槛是 100,000：

```js
let p = navVal / 100000;
```

例如希望 NAV 达到 50,000 就获得 1 倍，将分母改为 50,000，并同步调整 NAV 滑条的 `max`、右侧 `$100,000+` 标签以及页面中所有关于 NAV 100,000 的规则说明。

### 6.3 修改免息现金门槛

当前前 10,000 不计息：

```js
let nonInterestBase = 10000;
```

修改该值后，还必须同步正文中所有 `USD 10,000`、示例表格、下方计算器及披露说明。该文件至少有两套计算代码，第 2843 行和第 3964 行都定义了 `nonInterestBase`，必须一起修改。

### 6.4 修改月度换算方式

当前月息按 30 天计算：

```js
monthlyEarnedExact = cashBal * (blendedRateNum / 100) * (30/365);
```

如果业务口径是“年息除以 12”，可改为：

```js
monthlyEarnedExact = annualEarnedExact / 12;
```

两种结果略有差异，页面文案和披露必须说明采用哪一种口径。

## 7. 推荐的修改顺序

1. 先确定 Pro/Lite 的现金利率、保证金利率和佣金最终值。
2. 修改 `_fron/index.html` 的所有首页展示和披露日期。
3. 修改现金利率页正文、两个计算器、导航摘要和所有可达镜像。
4. 修改保证金页正文、Lite/Pro 对照、导航摘要，并核对 `_fron/en/trading/margin-rates.html`。
5. 修改佣金页对应卡片、FAQ、披露及该页导航摘要。
6. 全站搜索旧值，逐条区分历史新闻、CSS 数值和当前产品数据；历史新闻中的旧利率通常不应替换。
7. 分别从首页卡片、桌面导航、移动导航打开页面，验证显示值和计算结果。

## 8. 修改后的核对命令

在项目根目录执行：

```powershell
rg -n -S "4\.87%|3\.92%|5\.74%|3\.62%|3\.13%|4\.13%" _fron/index.html _fron/en/accounts/fees _fron/en/whyib _fron/en/trading _fron/en/pricing
```

检查滑条参数：

```powershell
rg -n -S "interest-rate-var|nonInterestBase|navVal /|annualEarnedExact|monthlyEarnedExact" _fron/en/accounts/fees/pricing-interest-rates*.html
```

最终验收标准：同一计划、同一币种、同一利率类型在首页、落地页正文、导航摘要、计算器和披露中只能出现同一套当前值；历史新闻或历史示例应明确标注日期，不能让用户误认为是当前报价。
