# 技术栈总览

按层列出这些项目实际用到的技术，以及**为什么选它**。

## 后端

| 技术 | 项目 | 为什么选 |
| --- | --- | --- |
| **Python 3.12** | 做账工具、GEO 系统、美鸥天眼、SOP 视频 | PDF/Excel/网页自动化生态最全（PyMuPDF、openpyxl、Playwright） |
| **FastAPI** | 做账工具 SaaS、美鸥天眼、SOP 视频、RPA 对账 | 自带 OpenAPI 文档；异步支持好，适合抓取与长任务 |
| **Node.js** | AI 客服、RPA 运单标识、官网 | 客服要 SSE 流式；Playwright 的 Node SDK 更成熟 |
| **Flask** | GEO 生成服务、GEO Hub | 内部服务，够轻 |

## 前端

| 技术 | 项目 | 为什么选 |
| --- | --- | --- |
| **Next.js 16 + React 19** | 品牌官网、合规官网 | 需要 SSR/SSG 做 SEO 与 GEO；Cloudflare 部署链路短 |
| **React + TS + Vite** | 美鸥天眼网页端 | 查询型 SPA，不需要 SSR |
| **Taro 4** | 美鸥天眼小程序 | **用 React 语法写一套代码产出微信小程序 + H5** |
| **原生 HTML/CSS/JS** | SOP 视频工人端、SaaS 前端 | 工人端设备杂、网络差，零构建产物最稳 |
| **VitePress** | 本站 | 参见 [本站的技术选型变化](/projects/wiki#技术选型的变化) |

## 数据与存储

| 技术 | 项目 | 场景 |
| --- | --- | --- |
| **SQLite** | SOP 视频、做账工具 SaaS、美鸥天眼缓存 | 单机部署、零运维；WAL 模式 |
| **Drizzle ORM** | 官网、合规站 | TypeScript 优先，类型推导好 |
| **SQLAlchemy** | SOP 视频 | Python 侧成熟 |
| **内存 LRU + SQLite 两级缓存** | 美鸥天眼 | 热点查询走内存，持久化走 SQLite |
| **JSON 状态文件** | GEO 发布状态机 | 幂等与断点，人可读可改 |

## AI 与内容

| 技术 | 项目 | 说明 |
| --- | --- | --- |
| **DeepSeek（`deepseek-chat`）** | GEO 内容生成 | 中文内容质量与成本平衡；`temperature=0.7` |
| **LLM-as-Judge** | GEO 系统 | 让模型扮演检索系统自审，最多 2 轮 |
| **difflib / 余弦相似度** | 做账工具、GEO | 轻量相似度，不引入重型依赖 |
| **直接知识上下文** | AI 客服 | 见 [知识工程与 RAG](/engineering/knowledge-rag) |

## 自动化

| 技术 | 项目 | 说明 |
| --- | --- | --- |
| **Playwright** | RPA、GEO 发布 | 目标系统无 API，只能走 UI 自动化 |
| **AutoHotkey** | RPA 运单标识 | 企业微信桌面端无公开文件下载 API，靠坐标点击 |
| **CDP** | 亿企代账自动化 | 验证阶段，编排层未完成 |
| **Windows 计划任务** | GEO 系统 | `schtasks` + PowerShell 注册 |

## 部署与运维

| 技术 | 项目 |
| --- | --- |
| **Docker + docker-compose** | SOP 视频、做账工具 SaaS、RPA 对账 |
| **Nginx 反向代理** | SOP 视频（`proxy_buffering off`）、SaaS 版 |
| **Cloudflare Workers** | 品牌官网、合规官网 |
| **PyInstaller** | 做账工具桌面版分发 |
| **VitePress 静态构建** | 本站 |

## 一个贯穿始终的选择：能不用重型依赖就不用

几个例子：

| 场景 | 常见做法 | 我的选择 |
| --- | --- | --- |
| 相似度检测 | 引入 embedding 模型 | `difflib.SequenceMatcher` |
| 客服知识检索 | 向量数据库 | 直接拼 Markdown（客服场景） |
| 文章页前端 | React 工程 | 单文件 Vanilla JS |
| 工人端 | SPA 框架 | 原生 HTML |
| OCR 解析 PDF | easyocr + torch | PyMuPDF 文本层，并把 OCR 依赖从打包里 exclude 掉 |

::: tip 这不是"不会用"
这些选择的前提是**先判断场景真的需不需要**。做账工具早期试过 OCR 路线，确认文本层够用之后就把 torch 那些依赖从打包里排除了。

**引入依赖是有成本的**：体积、构建时间、排查难度、升级风险。够用就停，是这些项目能快速交付的重要原因。
:::

## 技术栈速查

如果要一句话概括：

> **Python 做数据处理与自动化，Node 做实时对话与前端，FastAPI 统一后端接口，能静态就不动态，能不引依赖就不引。**
