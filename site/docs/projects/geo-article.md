# GEO 内容生产系统

> 让 AI 搜索引擎引用你的内容。选题 → 生成 → 三层质量门禁 → 幂等发布 → AI 收录追踪的完整闭环。

| | |
| --- | --- |
| **业务域** | 跨境电商内容获客 |
| **技术栈** | Python / DeepSeek / Flask / Playwright / JSON-LD |
| **代码位置** | `GEO strategy/`、`new/` |
| **真实状态** | **运行中**，约 50 天里产出 198 篇内容、121 次真实发布 |

## 一、业务背景

美鸥云仓是美鸥跨境旗下的海外仓品牌，做 FBA 中转、一件代发、海外仓储配送、退货换标，仓网覆盖美/欧/日 8 大仓库，5 万平米、日均 5 万单。

传统获客靠销售和内容运营。内容运营的瓶颈是：**写文章慢、发平台更慢，而且发完不知道有没有效果。**

## 二、GEO 和 SEO 不是一回事

这是理解整套系统的前提。

| | 传统 SEO | GEO |
| --- | --- | --- |
| 优化目标 | 在搜索结果里**排第几** | **能不能被 AI 引用** |
| 关键指标 | 关键词排名、点击率 | 答案块质量、自包含性 |
| 内容形态 | 关键词密度、外链 | 一段文字被 RAG 切片后能否独立成立 |
| 对爬虫 | 防范抓取 | **主动邀请** AI 爬虫 |

系统的 GEO 评分有五个权重维度：

| 维度 | 权重 |
| --- | --- |
| `answer_block_quality` 答案块质量 | 30 |
| `self_containment` 自包含性 | 25 |
| `structural_readability` 结构可读性 | 20 |
| `statistical_density` 数据密度 | 15 |
| `uniqueness_signals` 独特性信号 | 10 |

**`self_containment`（自包含）是最能体现 GEO 思维的维度**：一段文字从文章里被切出来、单独喂给大模型时，是否仍然是一个可读、可信、有明确主体的答案。传统 SEO 从不考虑这个。

### Canonical 权威源策略

`news.meiouyuncang.com` 是**唯一的全文权威源**，百家号 / 头条 / 搜狐 / 知乎只发差异化摘要变体。

这一举解决两个问题：

1. 避免全网重复内容被判定为抄袭，稀释权重
2. 把所有引用信号回流到自有域名

## 三、管线：从选题到发布

### 3.1 选题

`topic_rotation.py` 定义 8 个专题：`us-warehouse`、`uk-warehouse`、`europe-warehouse`、`fba-transfer`、`temu-semi-managed`、`returns-relabeling`、`one-piece-fulfillment`、`geo-ai-search`，每个专题挂若干角度和关键词。

核心是 **7 天冷却窗口**——同一专题短期内不重复选题。

更硬的一条规则在 `daily_warehouse_b2b_pipeline.py`：

```python
MAX_BRIEF_AGE_HOURS = 30   # 超过 30 小时的行业简报不再作为选题证据
```

如果当日抓不到 news 侧的真实素材，`select_topic()` 会以 `news_required_no_match` **直接阻断整个流程**。

::: tip 这是一个反直觉但正确的设计
宁可今天不发，也不让模型凭空编。内容系统最容易死在"每天必须有产出"的 KPI 上——一旦为了凑数放松证据要求，产出的就是垃圾，还会污染品牌。
:::

### 3.2 生成

模型配置：`deepseek-chat`，`max_tokens=3000`，`temperature=0.7`，密钥走环境变量。

生成服务是一个 Flask 应用（端口 8765），核心接口 `/api/batch-create`，默认 `min_score=80`、`max_rounds=2`。链路是六步：

```text
generate_base_article      基础生成
      ↓
deterministic_boost        确定性结构补强
      ↓
llm_optimize               LLM 优化
      ↓
honest_judge  ⟲            评判者迭代（受 max_rounds 约束）
      ↓
commercial_claim_check     事实门禁
      ↓
final_critique             终审
```

### 3.3 让模型扮演检索系统自审

`HONEST_JUDGE_SYSTEM` 这个 prompt 的开头是：

> 你是 DeepSeek AI 搜索引擎的检索系统……

然后让模型判断「我会不会引用这篇文章」，覆盖 8 个维度，含 RAG 切片友好度、实体密度、反偏见、来源真实性。

`judge_passed()` 解析回复第一句的"会/不会"，不通过就由 `fix_article()` 按 critique 逐条修复后回炉重跑。

`max_rounds=2` 是明确的**成本刹车**——不允许无限迭代烧 token。

::: tip 面试怎么讲
这一步把"人工审稿"降本为"模型自审"。但更重要的是它的**设计意图**：不是让模型评价文章"好不好"，而是让模型**代入检索系统的角色**判断"我抓不抓、引不引"。评价好不好是主观题，判断引不引是更接近客观题的模拟。
:::

## 四、三层质量门禁

这是整个系统工程含量最高的部分，也是我最想被问的地方。

### 第一层：结构性准入 `content_quality_gate.py`

硬阈值直接写在模块顶部：

```python
SIMILARITY_LIMIT                  = 0.55   # 与已有内容的相似度上限
VARIANT_SOURCE_SIMILARITY_LIMIT   = 0.75   # 变体 vs canonical
VARIANT_SIBLING_SIMILARITY_LIMIT  = 0.72   # 变体 vs 其他平台变体
```

`assess_article()` 是一份完整的准入清单：

| 检查项 | 要求 |
| --- | --- |
| 相似度 | ≤ 0.55 |
| `original_evidence` | 必须有原创证据 |
| H1 | 必须存在 |
| H2 | ≥ 2 个 |
| FAQ | ≥ 3 条 |
| 对比表 | 必须有 |
| `source_block` / `update_block` | 必须有来源块与更新块 |
| 作者、canonical | 必须有 |
| `unsupported_commercial_claim` | 无来源商业断言必须为零 |
| `brand_overuse` | **品牌词 ≤ 12 次** |
| `promotional_headline` | 标题不得促销化 |

::: tip 品牌词超过 12 次就拦截
这条很反直觉，但很专业——它承认了一个事实：**过度自我推销的内容会被 AI 判定为广告而拒绝引用。**

做内容的人本能地想多提品牌，系统反过来限制你。
:::

### 第二层：数字中性化 `competitor_claim_guard.py`

`find_unsupported_numeric_claims()` 用正则捕获金额、百分比、时效、数量类断言，比如"3 天送达""成本降低 40%"。

关键在**怎么处理**：不是简单删掉，而是降级为定性表述，替换成"以实际合同报价为准"这类合规话术（`_QUALIFICATIONS` 提供 5 种）。

这解决的是双重风险：既是**虚假宣传的合规风险**，也会被 AI 判定为不可信内容。

### 第三层：平台特化 `platform_variant_guard.py`

不同平台用不同严格度：

| 平台 | 来源阈值 | 历史阈值 |
| --- | --- | --- |
| 百家号 | **0.32** | **0.42** |
| 其他平台 | 0.55 | 0.50 |

百家号明显更严，因为它的原创校验最狠、封号成本最高。

还有针对性改造：搜狐版本的 `prepare_sohu_editorial_variant()` 会把内容改造成"中性行业观察"，**主动删除品牌实体、数字、表格、链接**。

## 五、发布可靠性

见 [发布可靠性工程](/engineering/publishing-reliability)，这里只列要点：

- **幂等**：`already_published()` 发布前检查，日志里有 14 条真实的幂等跳过记录
- **双状态**：`public_visible` / `draft_saved` / `unverified` / `failed`——"发布成功"和"公开可见"被拆成两个独立状态
- **有界重试**：候选被拒后换下一个，池子耗尽则留 `failed_no_candidates` 的可操作记录，**不让坏候选无限循环**
- **限流**：每日上限 3 篇、单平台上限 2 篇、最小间隔 120 分钟、发布时段 9–21 点

## 六、效果追踪：两条正交链路

### 链路一：主动探针 `ai_index_tracker.py`

直连 `https://api.deepseek.com/v1`，用预设的探针问句（B2B / B2C 各 5 类）**真的去问 AI**，比如"做跨境电商，欧洲 VAT 注册代理选哪家性价比最高？"，然后记录：

- `brand_mentioned` 品牌是否被提及
- `brand_position` 提及位置
- `competitor_mentions` 竞品提及情况

这是**直接测量"AI 会不会提到我"，而不是猜。**

### 链路二：被动日志 `article_crawl_monitor.py`

`FOCUS_CRAWLERS` 覆盖 Bytespider / Baiduspider / OAI-SearchBot / GPTBot / ClaudeBot / PerplexityBot / Googlebot 等。

关键设计是 `verify_ip_identity()` 做**反向 DNS + 正向确认双向核验**——防止伪造 UA 的假爬虫污染数据。

`classify_page()` 把命中分为 article / topic / discovery / static 四类，用来区分"只爬了首页"和"真的读了正文"。

## 七、调度

| 入口 | 做什么 |
| --- | --- |
| `run_daily.bat` | 每天 8:00 执行 `daily_pipeline.py --skip-publish`——**默认生成不自动发布** |
| `run_external_matrix.bat` | 串行五步：发布 → 观测 → 提交 → 审计 → 状态回写 |
| `setup_scheduled_task.ps1` | 注册 Windows 计划任务，重启次数上限 3 |
| `ai-briefing-10am.ps1` | 独立链路：工作日 10:00 生成 AI 开源项目简报 |

::: warning 保留人工闸门
主链路 `run_daily.bat` 默认带 `--skip-publish`。发布环节**保留人工确认**，不是全自动。这是有意为之——商业内容发出去收不回来。
:::

发布器基于 Playwright 做浏览器自动化，原因是百家号 / 头条 / 搜狐 / 知乎**都没有对外发布 API**，只能走 UI 自动化。

## 八、真实运营数据

全部来自运行日志实测。

### 内容产出

| 目录 | 篇数 |
| --- | --- |
| `content/B2B/` | 69 |
| `content/B2C/` | 87 |
| `content/NewsMirror/` | 42 |
| **合计** | **198** |

### 发布执行（2026-07-15 → 2026-09-02，约 50 天）

| 平台 | 执行 | 成功 | 失败 | 成功率 |
| --- | --- | --- | --- | --- |
| 头条 | 34 | 29 | 5 | 85% |
| 百家号 | 34 | 27 | 7 | 79% |
| 搜狐 | 29 | 20 | 9 | **69%** |
| 知乎 | 21 | 19 | 2 | 90% |
| 掘金 | 3 | 2 | 1 | 67% |
| **合计** | **121** | **97** | **24** | **80%** |

其中 5 条 `dry_run`、19 条跳过（含 14 条幂等跳过）。搜狐成功率最低，与它审核最严一致。

### 发布验证状态

| 状态 | 数量 |
| --- | --- |
| `public_visible` 公开可见 | 22 |
| `draft_saved` 存草稿 | 8 |
| `unverified` 未验证 | 6 |
| `failed` 失败 | 3 |

### AI 收录效果（2026-07-31，累计扫描 33 次）

- 追踪文章 18 篇，已扫描 7 篇
- **品牌被收录 2 篇，收录率 28.6%**
- 探针级品牌命中率 13.6%
- 趋势：**早期 22.6% → 近期 4.8%，↓ 下降**

::: tip 敢写下降，比 28.6% 这个数字更有说服力
报告里如实记录了收录率下降的趋势，没有只挑好看的数字写。

如果面试官问「效果不好怎么办」，这个问题本身就是答案的一部分：**你能测到下降，说明你有测量手段；你敢把下降写进报告，说明你的系统是可信的。**
:::

### 爬虫侧观测（2026-08-27）

- Googlebot、bingbot 有**文章级**命中
- Bytespider、Baiduspider、OAI-SearchBot、GPTBot、ClaudeBot、PerplexityBot 近期**未命中正文**

这是诚实的现状：国内 AI 爬虫还没真正抓到正文。

## 可验证证据

> 完整代码在公司内网，本页只放脱敏后的证据；面试可提供脱敏代码演示。

**管线（脱敏）**

```text
选题（7 天冷却 + 30h 素材新鲜度）
   ↓
生成（deepseek-chat，max_rounds=2）
   ↓
honest_judge（模型扮演检索系统自审）
   ↓
三层质量门禁（12 项硬检查 · 数字中性化 · 平台特化）
   ↓
幂等发布（content_id+platform 键，双状态验证）
   ↓
效果追踪（主动探针 + 爬虫日志双链路）
```

**核心代码片段（脱敏）**

第一层门禁里最反直觉的一条——**品牌词出现超过 12 次就拦截**：

```python
# content_quality_gate.py:116
# 品牌词出现 >12 次 → 判定为 brand_overuse，拒绝准入
if len(re.findall(r"\u7f8e\u9e25\u4e91\u4ed3", text)) > 12:
    reasons.append("brand_overuse")
```

第二层数字中性化——无来源的数字断言**不是删掉，而是降级为定性表述**：

```python
# competitor_claim_guard.py:23
# 不是删除，而是替换成合规话术（_QUALIFICATIONS 提供 5 种）
_QUALIFICATIONS = (...)
(r"占([^。；，,]{0,40})的以实际数据为准", r"占\1的比例需以实际数据核算"),
(r"体积重以实际数据为准的", "体积重需按实际规格核算的"),
(r"收取以实际合同报价为准/件", "收取按合同约定核算的操作费"),
```

::: tip 为什么这两个设计值得放
品牌词限次，是因为**过度自我推销的内容会被 AI 判定为广告而拒绝引用**——做内容的人本能想多提品牌，系统反过来限制你。

数字降级而不是删除，是因为它同时规避**虚假宣传的合规风险**和被 AI 判定为不可信。
:::

**运行证据**

| 指标 | 数值 |
| --- | --- |
| 内容产出 | 198 篇（B2B 69 / B2C 87 / NewsMirror 42） |
| 发布执行 | 121 次，成功 97，失败 24，**成功率 80%** |
| 幂等跳过 | 14 次（日志 `reason: already_published`） |
| 搜狐成功率 | **69%**（全平台最低，与其审核最严一致） |
| AI 收录率 | 28.6%，**趋势下降**（2026-07-31，累计扫描 33 次） |

> 数据来自 `matrix_local_publish_log.jsonl` 与 `tracking/indexing_report.md` 实测，为脱敏后的统计口径。

## 九、关于"多 Agent 协作"

`geo_agent_team.json` 定义了 4 个角色 agent：`geo-developer`、`geo-article-tracker`、`geo-page-optimizer`、`geo-page-auditor`，配 `daily_sequence` 执行顺序和 `approval_policy`（代码变更 / 内容发布 / 外平台发布三类操作分别需要审批）。

但 `geo_agent_team.py` 的行为是**只读审计**——用 `ast.parse` 校验语法，不执行自动发布。

::: warning 如实表述
这不是"多个 LLM Agent 自主协商"的架构，而是**角色分工 + 顺序编排 + 人工审批闸门**的确定性工作流。

面试时应该这样讲。它比"全自动多 Agent"更可信，也更符合商业内容发布的风险要求。把确定性工作流包装成"多智能体自主协作"是很容易被问穿的。
:::

## 十、交付计划书（路线图）

> 系统已经在跑、数据也在积累，计划书的重点是**对抗收录率下降**，而不是堆功能。

| 阶段 | 目标 | 关键动作 | 状态 |
| --- | --- | --- | --- |
| 近期 | 止住下降 | 针对 `self_containment` / `answer_block_quality` 做结构迭代；提升搜狐适配（成功率 69%） | 进行中 |
| 近期 | 半自动升级 | 把 `geo_agent_team` 从「只读审计」升级为「带人工审批的半自动编排」 | 规划中 |
| 中期 | 被国内 AI 抓取 | 主动向国内爬虫提交 / 站点地图优化，让 Bytespider、Baiduspider 抓到正文 | 待启动 |
| 远期 | 内容资产复用 | 模板化跨站复用；质检门禁沉淀为 LLM 评测集 | 设想 |

::: tip 衡量标准要前置
收录率下降不可怕，**可怕的是没有测量手段**。计划书里把「长效探针 + 回归基线」列为中期目标，就是为了保证每个改动都能回答「收录率是升了还是降了」。
:::

## 十一、三十秒版本

> GEO 和 SEO 的区别在于：SEO 优化"排第几"，GEO 优化"能不能被 AI 引用"。所以整套系统的设计都围绕**"一段文字被 RAG 切片后能否独立成立"**这个标准。
>
> 管线是选题到发布的完整闭环。选题有 7 天冷却窗口，而且抓不到真实素材就当天不发——宁可不发也不让模型编。
>
> 生成用 DeepSeek，关键是中间插了一个"评判者"环节：让模型扮演检索系统本身，判断"我会不会引用这篇"，不通过就按 critique 修复后重跑，最多两轮防止烧钱。
>
> 最花功夫的是三层质量门禁。除了相似度、结构完整性这些常规项，有两个设计比较特别：一是品牌词出现超过 12 次就拦截，因为过度推销会被 AI 判定为广告；二是无来源的数字断言不是删掉，而是降级成"以实际合同报价为准"这样的定性表述，规避虚假宣传风险。
>
> 发布侧做了幂等和双状态——"发布成功"和"公开可见"是两回事，日志里有 14 次真实的幂等跳过。效果追踪用两条正交链路：一条主动拿探针问句去问 DeepSeek 看品牌有没有被提到，一条分析服务器日志并用反向 DNS 核验爬虫真伪。
>
> 跑了 50 天，198 篇内容，121 次真实发布，成功率 80%。AI 收录率 28.6% 而且在下降——这个我也如实写进报告了。
