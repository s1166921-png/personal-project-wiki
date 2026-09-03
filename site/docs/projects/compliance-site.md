# 财税合规官网

> 美鸥财税合规的合规模板站，三套风格 + 咨询面板，内嵌集团 AI 客服。

| | |
| --- | --- |
| **业务域** | 财税合规获客 |
| **技术栈** | Next.js 16 / React 19 / Tailwind / Drizzle / Cloudflare |
| **代码位置** | `new/meiou-compliance-templates/` |
| **真实状态** | **真实存在且可构建**，但形态是「模板站 / 样板站」 |

## 一、它是什么

一个**合规模板库**（template gallery）——同一个合规站点，提供三种视觉风格供选择：

| 路由 | 风格 | 定位 |
| --- | --- | --- |
| `/consulting` | **顾问型** | 国际顾问型，面向跨境企业管理层，稳健、国际化 |
| `/digital` | **现代科技型** | 科技感 |
| `/heritage` | **东方品牌型** | 东方美学 |

组件层有 `consulting-home` / `digital-home` / `heritage-home` 三套首页，配 `consultation-panel`（咨询面板）和 `template-switcher`（模板切换器）。

## 二、和其他站点的关系

```text
meiou-main-site             美鸥云仓品牌官网（仓储履约 / 云贷 / 资讯）
        │
        │  合规业务独立拆出
        ↓
meiou-compliance-templates  财税合规官网（模板库）
        │
        │  内嵌
        ↓
   group-ai-widget          AI 客服挂件（businessHint="meiouyuan"）
```

git 历史里有 "plan / build Meiou compliance template gallery" 这类提交，说明合规站是从主站规划中**独立拆分**出来的。

## 三、关键联动：内嵌 AI 客服

`components/group-ai-widget.tsx` 把 [AI 智能客服](/projects/ai-cs) 的挂件嵌进合规站，并带上业务线标识：

```tsx
<GroupAiWidget businessHint="meiouyuan" />
```

::: tip 这是"一体化交付"的证据
`businessHint` 让客服**一进页面就知道用户在看财税合规业务**，不用先问"您咨询哪方面"。

AI 客服页里提到的业务路由（`router.js` + `classifier.js`），在这里有了具体的消费方。两个项目不是各做各的，是一条链路上的两环。

面试时把这条讲出来：**做合规站的时候顺手把客服的知识作用域接上了**。
:::

## 四、技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16 + React 19 |
| 样式 | Tailwind |
| ORM | Drizzle |
| 部署 | Cloudflare（vinext / wrangler） |

部署配置存在（`.openai/hosting.json`、`.wrangler/`），提交历史真实且有多次迭代。

## 五、成果数据

| 指标 | 数值 | 来源 |
| --- | --- | --- |
| 视觉风格 | **3 套**（consulting 顾问型 / digital 科技型 / heritage 东方型） | `components/` |
| 核心组件 | 3 套首页 + consultation-panel + template-switcher | 组件层 |
| 技术栈 | Next.js 16 + React 19 + Tailwind + Drizzle + Cloudflare | `package.json` |
| 客服联动 | 内嵌挂件，`businessHint="meiouyuan"` 打通知识作用域 | `group-ai-widget.tsx` |
| 部署配置 | `.openai/hosting.json`、`.wrangler/` 存在，多次迭代 | 仓库 |

::: tip 这个项目的成果是"一体化交付"，不是"独立上线"
合规官网最有价值的不是三套风格，而是**内嵌 AI 客服时带上了 `businessHint`**——客服一进页面就知道用户在看财税合规业务，不用先问"您咨询哪方面"。这跟客服系统里的业务路由是配套的，两个项目是一条链路上的两环，不是各做各的。
:::

## 五、已知边界

| 边界 | 说明 |
| --- | --- |
| **模板站形态** | 它是 gallery / template，是"可演示的作品站点" |
| **未见独立生产部署证据** | 只有 Cloudflare 部署描述，没有 DNS 或上线证据 |
| 与官网同构 | 和 meiou-main-site 技术栈一致，不是独立技术选型 |

::: warning 怎么表述
可以说：「美鸥财税合规官网，三套视觉风格 + 咨询面板 + 内嵌 AI 客服，可构建可演示。」

如果对方问「上线了吗」，如实答：「目前是模板站形态，用于选型和演示，是否绑定独立生产域名需要确认。」

**不要说"已上线运营"。**
:::

## 六、交付计划书（路线图）

| 阶段 | 目标 | 关键动作 | 状态 |
| --- | --- | --- | --- |
| 近期 | 选一套真实上线 | 从三套风格中定版，接 Cloudflare 真实域 / DNS，不再是模板站形态 | 规划中 |
| 近期 | 验证内嵌客服 | 把已内嵌的 AI 客服在线上跑通转接与护栏 | 进行中 |
| 中期 | 内容 CMS | 案例 / 服务 / 资质接 Drizzle；三套风格作为 A/B | 待启动 |
| 远期 | 打通 GEO 矩阵 | 合规内容被 AI 引用，成为 GEO 网页矩阵的一环 | 设想 |

## 六、三十秒版本

> 这是一个财税合规官网，但形态是模板库——同一套内容做了三种视觉风格：顾问型面向跨境企业管理层，还有现代科技型和东方品牌型，配咨询面板和模板切换器，让业务方直接挑。
>
> 技术上和云仓官网同构，Next.js 16 加 React 19 加 Tailwind，部署在 Cloudflare。
>
> 最有意思的一点是它内嵌了 AI 客服挂件，而且带上了业务线标识。客服一进页面就知道用户在看财税合规，不用先问"您咨询哪方面"。这和客服系统里的业务路由是配套的——两个项目不是各做各的，是一条链路上的两环。
>
> 边界说清楚：它是模板站形态，用来选型和演示的，可构建可演示，但我没有独立生产部署的证据。
