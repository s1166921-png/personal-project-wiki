# GEO 网页矩阵

> 面向 AI 搜索优化的站点群：自有 News 站、品牌官网、两套可复用文章模板。

| | |
| --- | --- |
| **业务域** | 内容获客 / 品牌官网 |
| **技术栈** | Next.js 16 / React 19 / Flask / JSON-LD / Cloudflare |
| **代码位置** | `GEO strategy/geo-hub/`、`new/meiou-main-site/`、`new/meiou-news-article-template/`、`new/refero-geo-template/` |
| **真实状态** | 运行中，官网为展示型，News 站为内容主战场 |

## 一、矩阵结构

```text
news.meiouyuncang.com          ← 唯一全文权威源（GEO 主战场）
        │  差异化摘要变体
        ├──→ 百家号 / 头条 / 搜狐 / 知乎 / 掘金

meiou-main-site                ← 美鸥云仓品牌官网（展示型）
meiou-compliance-templates     ← 财税合规官网（见合规官网页）
meiou-news-article-template    ← 可复用文章页脚手架
refero-geo-template            ← 落地页模板
```

## 二、News 站：GEO 主战场

`geo-hub/app.py` 是一个 Flask 应用，路由包括：

| 路由 | 说明 |
| --- | --- |
| `/` | 首页 |
| `/topics/` | 专题聚合页 |
| `/article/<slug>/` | 文章页 |
| `/sitemap.xml`、`/sitemap-index.xml` | 站点地图 |
| `/feed.xml` | RSS |
| `/robots.txt` | **显式放行 AI 爬虫** |
| `/llms.txt` | 面向大模型的站点说明书 |

### 两个纯 GEO 设计

**1. robots.txt 主动邀请 AI 爬虫**

```text
User-agent: GPTBot
Allow: /

User-agent: Baiduspider
Allow: /

Content-Signal: ai-train=yes
```

这和传统 SEO 站"防抓取"的思路**完全相反**。GEO 的目标就是被 AI 读到，防抓取等于自断生路。

**2. `/llms.txt`**

这是面向大模型的站点说明文件，新兴的事实标准。相当于给 AI 一份"本站该怎么读"的说明书。

### 文章页结构化数据

`templates/article.html` 同页注入三块 JSON-LD：

| 类型 | 作用 |
| --- | --- |
| `NewsArticle` | 文章主体结构 |
| `BreadcrumbList` | 层级路径 |
| `FAQPage` | **问答对，配 `speakable` 标注** |

外加 canonical 链接指向自有站。

::: tip FAQPage + speakable 的组合
这是直接冲"AI 摘要引用"去的：`speakable` 明确告诉读屏软件和 AI 系统"这段内容适合被朗读/引用"。

AI 搜索在生成答案时，特别倾向于抓取结构化的问答对。**把 FAQ 做成机器可识别的结构，比把正文写得更漂亮更管用。**
:::

## 三、品牌官网

`meiou-main-site/`：

| 项 | 选型 |
| --- | --- |
| 框架 | Next.js 16.2 + React 19.2 |
| ORM | Drizzle 0.45（sqlite dialect） |
| 部署 | Cloudflare Worker（vinext） |

::: warning 官网的实际状态
`db/schema.ts` 是**空的**，文件里注明 "Intentionally empty by default"。

也就是说官网目前是**纯展示型静态站**，数据库层是为后续预留的骨架。面试时别说"官网带数据库"。
:::

## 四、两套可复用模板

### 文章页脚手架 `meiou-news-article-template/`

一套开箱即用的 GEO 文章页，包含：

| 文件 | 作用 |
| --- | --- |
| `index.html` | 四类 JSON-LD：Article / Organization / WebPage / FAQPage |
| `llms.txt` | 站点说明 |
| `robots.txt` | 爬虫策略 |
| `sitemap.xml` | 站点地图 |
| `BingSiteAuth.xml` | 搜索引擎验证 |

这套模板的价值在于**把 GEO 最佳实践固化成可复制的资产**——新站点照着抄就能有一套合规的结构化标记。

### 落地页模板 `refero-geo-template/`

`index.html` + `styles.css` 的轻量形态，用于快速产出专题落地页。

`crossborder-portal-showcase/` 是另一个跨境门户展示页，带 `portal-smoke.test.js` 冒烟测试。

## 五、视觉体系

站点沿用一套设计令牌（内部称 Monad 方向）：

| 令牌 | 色值 | 用途 |
| --- | --- | --- |
| Parchment | `#f6f3f1` | 页面底色（不用纯白） |
| Off-Black | `#242424` | 主文字 |
| Graphite / Smoke | `#4e4d4d` / `#797776` | 次级文字 |
| Ash | `#cecac8` | 边框，统一 1px |
| Lake Blue | `#2b59d1` | **唯一功能强调色** |
| Periwinkle Mist | `#cfdaf5` | 特色卡片 |

配中文标题衬线字体（字重 400）、40px 卡片圆角、药丸形控件、卡片靠细边框和底色区分而不用投影。

本站（这个作品集站）也沿用了同一套令牌。

## 六、成果数据

| 指标 | 数值 | 来源 |
| --- | --- | --- |
| 矩阵站点 | **4 类**（News 站 / 品牌官网 / 文章模板 / 落地页模板） | 矩阵结构 |
| News 站路由 | **8 个**（首页/专题/文章/sitemap/RSS/robots/llms.txt 等） | `geo-hub/app.py` |
| 文章页 JSON-LD | **3 块**（NewsArticle / BreadcrumbList / FAQPage + speakable） | `templates/article.html` |
| 文章模板 | 4 类 JSON-LD + llms.txt + robots + sitemap + BingSiteAuth | `meiou-news-article-template/` |
| 官网技术栈 | Next.js 16.2 + React 19.2 + Drizzle 0.45 | `meiou-main-site/package.json` |
| 设计令牌 | **7 色** Monad 体系，单功能强调色 Lake Blue | 视觉规范 |
| 冒烟测试 | `portal-smoke.test.js` | `crossborder-portal-showcase/` |

::: tip 这个项目的成果是"可复制的资产"，不是"流量"
GEO 网页矩阵最值钱的是把 GEO 最佳实践（robots 放行、llms.txt、FAQ+speakable、canonical）**固化成了可照抄的模板**。AI 爬虫目前还没命中正文是真实现状，但结构化标记、权威源策略这些都是长期资产，做好了等爬虫来。能测到"没抓到"，本身也是能力证明。
:::

## 六、已知边界

| 边界 | 说明 |
| --- | --- |
| 官网无数据库内容 | `db/schema.ts` 为空，纯展示型 |
| 模板站形态 | 模板是为复用而做，不等于每个都独立上线 |
| AI 爬虫尚未命中正文 | 观测显示 OAI-SearchBot / GPTBot / ClaudeBot 等近期未抓到正文，只有 Googlebot 和 bingbot 有文章级命中 |
| 无 A/B 实验 | GEO 效果靠探针和日志观测，没有做对照实验 |

::: tip 关于"效果还没显现"
AI 爬虫还没抓到正文，这是真实现状。

但这不影响做 GEO 的合理性——**结构化标记、canonical 策略、llms.txt 这些都是长期资产**，做好了等爬虫来。而且因为做了追踪，能知道"没抓到"，而不是蒙在鼓里。

面试时把"我能测到它没抓到"讲出来，本身就是能力证明。
:::

## 七、交付计划书（路线图）

| 阶段 | 目标 | 关键动作 | 状态 |
| --- | --- | --- | --- |
| 近期 | 官网不再是空壳 | 品牌官网接 Drizzle 真实内容（案例 / 服务），`db/schema.ts` 从空到实 | 规划中 |
| 近期 | 结构化全覆盖 | FAQ + `speakable` 覆盖全站文章页 | 进行中 |
| 中期 | 数据驱动选型 | 用追踪数据决定三套风格哪套转化好，而不是凭感觉 | 待启动 |
| 远期 | GEO 中台 | 一处改、矩阵同步的站点中台 | 设想 |

## 七、三十秒版本

> GEO 网页矩阵的核心是 news 站——它是唯一全文权威源，其他平台只发差异化摘要变体，这样既避免全网重复被判抄袭，也把引用信号全部回流到自有域名。
>
> 新闻站做了两个纯 GEO 的设计。一是 robots.txt 里显式放行所有 AI 爬虫，还输出 Content-Signal: ai-train=yes，这和传统 SEO 防抓取的思路完全相反。二是加了 llms.txt，给大模型一份站点说明书。
>
> 文章页同页注入三块结构化数据：NewsArticle、BreadcrumbList 和 FAQPage，FAQ 区块标注 speakable。AI 生成答案时特别爱抓结构化问答对，所以把 FAQ 做成机器可识别的结构，比正文写得更漂亮更管用。
>
> 另外做了两套可复用模板，把这套 GEO 最佳实践固化成可以照抄的资产。
>
> 边界说清楚：官网目前是展示型，数据库 schema 是空的；AI 爬虫到现在还没真正抓到正文，只有 Googlebot 和 bingbot 有文章级命中。但因为做了追踪，我能知道"没抓到"，而不是蒙在鼓里。
