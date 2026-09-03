# 项目全景

我交付的系统集中在跨境电商的几个高人工环节。按业务主线分，是四条；按技术主题分，是六块。

## 一、四条业务主线

| 主线 | 项目 | 解决的人工环节 |
| --- | --- | --- |
| **财税自动化** | [美鸥做账工具](/projects/pdf-to-excel) | 财务手工录入亚马逊财报 PDF |
| **通关数据** | [美鸥天眼 · 关税查询](/projects/hscode) | 报关员跨五国官网查税率 |
| **内容获客** | [GEO 内容生产系统](/projects/geo-article)、[GEO 网页矩阵](/projects/geo-web)、[财税合规官网](/projects/compliance-site) | 运营手写文章、手动分发 |
| **作业与服务** | [跨境 SOP 视频平台](/projects/sop-video)、[RPA 工具链](/projects/rpa)、[AI 智能客服](/projects/ai-cs) | 海外工人培训、运单标识、对账、重复答疑 |

## 二、九个交付物一览

| 项目 | 定位 | 技术栈 | 真实状态 |
| --- | --- | --- | --- |
| [美鸥做账工具](/projects/pdf-to-excel) | 亚马逊财报 PDF → 可入账 Excel | Python / PyMuPDF / openpyxl / FastAPI | **生产可用**，多版本迭代至 v17 |
| [美鸥天眼](/projects/hscode) | 多国关税与 HS 编码查询 | FastAPI / React / Taro 小程序 | **已交付**，依赖外部数据源 |
| [SOP 视频平台](/projects/sop-video) | 跨境 SOP 视频管理与检索 | FastAPI / SQLAlchemy / Video.js / Docker | **已交付**，含定价工作流 |
| [GEO 内容生产系统](/projects/geo-article) | AI 内容生产与分发闭环 | Python / DeepSeek / Playwright | **运行中**，已产出 198 篇 |
| [GEO 网页矩阵](/projects/geo-web) | 面向 AI 搜索的站点与模板 | Next.js / Flask / JSON-LD | **运行中** |
| [RPA 工具链](/projects/rpa) | 运单标识 + 物流对账 | Playwright / AHK / FastAPI | **已交付**，但非"平台" |
| [AI 智能客服](/projects/ai-cs) | 网页挂件 + WhatsApp 双渠道客服 | Node / SSE / Meta Webhook | **原型完成**，集团版开发中 |
| [财税合规官网](/projects/compliance-site) | 合规模板站，内嵌 AI 客服 | Next.js / Tailwind / Cloudflare | **模板站形态** |
| [项目知识库与本站](/projects/wiki) | Obsidian → 静态站发布管线 | VitePress / Node | **进行中** |

::: warning 关于"真实状态"
这一栏是这个站里最重要的字段。每个项目页都自带「已知边界」和「交付计划书」两节，逐项写明**没做到的部分**和下一步动作。面试时把边界说清楚，比把系统说完美更安全。
:::

## 三、六块技术主题

这些项目表面上分散在不同业务里，底下其实是同一批技术问题反复出现：

| 主题 | 出现在哪些项目 | 核心问题 |
| --- | --- | --- |
| [PDF 逆向解析](/engineering/pdf-parsing) | 做账工具 | 没有文本层的版式 PDF 怎么还原成表格 |
| [内容质量门禁](/engineering/content-quality-gate) | GEO 系统 | AI 生成的内容怎么自动判定能不能发 |
| [发布可靠性工程](/engineering/publishing-reliability) | GEO 系统、RPA | 外部平台不可控时，怎么保证不重发、不漏发、失败可追 |
| [知识工程与 RAG](/engineering/knowledge-rag) | AI 客服 | 知识怎么组织，才能让模型不胡说 |
| [自动化安全边界](/engineering/automation-safety) | RPA、做账工具 | 脚本要动真实业务数据，怎么兜底 |
| 数据聚合与缓存 | 美鸥天眼 | 上游是别人的网站，挂了怎么办 |

## 四、我最想被问的三个问题

如果面试时间有限，我希望被问这三个：

1. **「你怎么证明 AI 生成的内容质量是过关的？」** —— 见 [内容质量门禁](/engineering/content-quality-gate)
2. **「外部平台发布失败你怎么处理？」** —— 见 [发布可靠性工程](/engineering/publishing-reliability)
3. **「你的脚本要改真实业务数据，怎么保证不出事？」** —— 见 [自动化安全边界](/engineering/automation-safety)

这三个问题背后是同一件事：我做的系统都要真的跑在生产环境里，所以可靠性设计比功能实现花的时间更多。
