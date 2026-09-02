# 项目总览

九个交付物，按业务主线分组。**"真实状态"这一列请优先看**——它决定了面试时该怎么表述。

## 财税自动化

### [美鸥做账工具](/projects/pdf-to-excel)

亚马逊多语言财报 PDF → 可入账 Excel。11 种语言、20 种币种，桌面 GUI 与 SaaS 双形态，延伸到亿企代账凭证导入。

- **技术栈**：Python / PyMuPDF / openpyxl / FastAPI / Docker
- **状态**：🟢 生产可用，已交付真实客户
- **一句话卖点**：按坐标重建无文本层 PDF 的表格结构，为日文版式的金额下漂做了孤儿再分配

## 通关数据

### [美鸥天眼 · 关税查询](/projects/hscode)

聚合中国 HS、英国与欧盟 TARIC、美国 HTS、商务部税费库，网页端与微信小程序共用一套后端。

- **技术栈**：FastAPI / React + TS / Taro 4 小程序 / SQLite 缓存
- **状态**：🟢 已交付 ｜ ⚠️ 数据源依赖外部站点，无内置数据集
- **一句话卖点**：单后端双客户端，到岸成本计算器把"查税率"推成"算生意"

## 内容获客

### [GEO 内容生产系统](/projects/geo-article)

让 AI 搜索引擎引用你的内容。选题 → 生成 → 三层质量门禁 → 幂等发布 → 收录追踪。

- **技术栈**：Python / DeepSeek / Flask / Playwright
- **状态**：🟢 运行中，50 天产出 198 篇、121 次发布、成功率 80%
- **一句话卖点**：让模型扮演检索系统自审；品牌词超 12 次就拦截；无来源数字降级为定性表述

### [GEO 网页矩阵](/projects/geo-web)

News 站（唯一权威源）+ 品牌官网 + 两套可复用模板。

- **技术栈**：Next.js 16 / Flask / JSON-LD / Cloudflare
- **状态**：🟢 运行中 ｜ ⚠️ 官网为展示型，AI 爬虫尚未命中正文
- **一句话卖点**：robots.txt 主动放行 AI 爬虫 + `llms.txt`，与 SEO 思路完全相反

### [财税合规官网](/projects/compliance-site)

三套视觉风格的合规模板站，内嵌 AI 客服。

- **技术栈**：Next.js 16 / React 19 / Tailwind / Cloudflare
- **状态**：🟡 模板站形态，可构建可演示，未见独立生产部署
- **一句话卖点**：`businessHint` 打通客服知识作用域，是一体化交付的证据

## 作业与服务

### [跨境 SOP 视频平台](/projects/sop-video)

国内上传、海外检索的 SOP 视频系统，含定价工作流与大文件跨境上传。

- **技术栈**：FastAPI / SQLAlchemy / Video.js / ffmpeg / Docker
- **状态**：🟢 已交付，含 7 项端到端测试
- **一句话卖点**：把"报价—确认"这个商务环节固化成系统状态机

### [RPA 自动化工具链](/projects/rpa)

运单标识（Playwright + AHK，dry-run 默认开）+ 物流对账机器人（企微回调）。

- **技术栈**：Playwright / AutoHotkey / FastAPI / pandas
- **状态**：🟢 已交付并真实运行 ｜ ⚠️ **是工具链不是平台**，无编排、无调度、无幂等
- **一句话卖点**：dry-run 会走完整流程但跳过最后一次点击，这是动真实数据的唯一安全闸

### [AI 智能客服](/projects/ai-cs)

网页挂件 + WhatsApp 双渠道，带业务路由、人工转接与安全护栏。

- **技术栈**：Node / SSE / Meta Cloud API / LLM
- **状态**：🟡 可运行原型完成，集团版开发中未合并，**未上线**
- **一句话卖点**：主动砍掉自研的 RAG，因为客服知识库精炼且有限，直接拼上下文更可控

## 元项目

### [项目知识库与本站](/projects/wiki)

Obsidian → 安全过滤 → 静态站。公私隔离的发布管线。

- **技术栈**：Obsidian Markdown / VitePress / Node
- **状态**：🟡 内容已完成，自动发布与部署待实现
- **一句话卖点**：默认私有（fail-safe），把合规要求从提示词升级成系统约束

---

## 按技术主题横切

如果你更关心技术而不是业务，这些项目底下是同一批问题反复出现：

| 主题 | 涉及项目 |
| --- | --- |
| [PDF 逆向解析](/engineering/pdf-parsing) | 做账工具 |
| [内容质量门禁](/engineering/content-quality-gate) | GEO 系统 |
| [发布可靠性工程](/engineering/publishing-reliability) | GEO 系统、RPA |
| [知识工程与 RAG](/engineering/knowledge-rag) | AI 客服 |
| [自动化安全边界](/engineering/automation-safety) | RPA、做账工具 |

## 状态图例

| 图例 | 含义 |
| --- | --- |
| 🟢 | 生产可用 / 运行中 |
| 🟡 | 原型 / 模板 / 开发中 |
| ⚠️ | 有需要主动说明的边界 |

::: tip 一张图看全局
想快速了解全貌，看 [项目全景](/guide/overview)；想知道技术选型，看 [技术栈总览](/guide/stack)；想看演进过程，看 [交付时间线](/guide/timeline)。
:::
