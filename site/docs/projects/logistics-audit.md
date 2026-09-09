# 物流审计系统（Logistics Audit）

> 亚马逊 FBA 移除/退货订单 → 海外仓换标/转仓作业 → 费用对账。一套用真实业务数据驱动的作业审计原型。

| | |
| --- | --- |
| **业务域** | 海外仓作业 / 物流财务 |
| **技术栈** | FastAPI / SQLAlchemy / 微信小程序 / PostgreSQL(配置) |
| **代码位置** | `Logistics Audit/` |
| **真实状态** | 核心业务流完整 / 测试已就绪 |

## 一、它解决什么问题

围绕「亚马逊 FBA 移除/退货订单 → 海外仓（英国仓）换标/转仓作业 → 费用对账」这一条链路展开，是一套**跨境电商海外仓作业审计系统**。

真实样本文件（`data/` 下）说明了业务场景：`第一步-客户预报亚马逊后台数据下载.csv`、`第三部仓库操作好后装箱明细.xlsx`、`客户亚马逊移除入库单_0622.xlsx`。核心动作是：客户把亚马逊移除单报给仓库，仓库换标、装箱，最后按**换标费 / 纸箱费 / 打包费 / 箱唛费 / 超重标签费 / 仓储费 / 托盘费**逐项计费，生成和客户 Excel 模板对齐的账单。

## 二、数据模型（8 张表）

| 表 | 用途 |
| --- | --- |
| `users` | openid + 角色（CUSTOMER / STAFF / WAREHOUSE / ADMIN） |
| `amazon_orders` | 原始 FBA 移除单（sku / fnsku / disposition / shipped_quantity / tracking_number） |
| `batch_imports` | CSV 导入批次 |
| `inbound_forecasts` + `inbound_items` | 入库预报单 + 逐项确认（forecast_qty / actual_qty / difference_qty / difference_reason） |
| `operation_instructions` | 出库 / 换标操作指令单 |
| `box_packing_details` + `storage_fee_details` | 装箱明细（5 项费用列）+ 仓储费（超期部分单独算） |
| `fee_rates` | 按 user_id + warehouse + fee_type 的单价表 |

## 三、业务流程

```text
客户上传 Amazon CSV
     ↓
生成预报单（IF-YYYYMMDD-NNN）
     ↓
仓库逐项/批量确认实收（putaway）
     ↓
运营一键生成出库指令（outbound）
     ↓
仓库录入装箱明细并自动计费（packing）
     ↓
看板 / 费用报表 / Excel 导出（dashboard）
```

CSV 解析做了 BOM、大小写、空格容错与列名校验；`excel_utils.py` 的 `generate_step3_packing_excel` 专门对齐客户给的「第三步装箱明细」真实模板（含仓储费账单 P-X 列、合计行）——**这是真实业务数据驱动的细节**。

## 四、关键业务逻辑

### 费率引擎

`packing_service.py` 的 `calculate_box_fees`：

| 费用项 | 单价 |
| --- | --- |
| 换标费 | £0.49 / 件 |
| 纸箱费 | £5 / 箱 |
| 打包出库费 | £5 / 箱 |
| 箱唛费 | £0.50 / 箱 |
| 超重标签费 | £0.75 / 箱（>15kg） |

### 入库差异

`putaway_service.py` 的 `confirm_item` 自动算 `difference_qty`，差异未填原因时默认「现场清点差异」，托盘费 $15/托盘。

## 五、成果数据（测试）

| 测试文件 | 覆盖 |
| --- | --- |
| `test_full_flow.py` | CSV → 上架 → 出库 → 装箱 → 费用 → 导出全链路 + 边界用例（重复确认防护） |
| `test_e2e_roles.py` | 客户 A/B + 工人角色扮演全流程 + 隔离 |
| `test_compare.py` | 自己的导出 Excel 与客户参考 Excel 逐列比对，验证格式对齐 |

## 六、下一步：安全收口

让这套系统从"原型"走向"已上线"，最关键的一步是安全收口：

| 优先级 | 关键动作 |
| --- | --- |
| **P0** | API 层加 JWT 依赖校验，把越权访问堵在网关；CORS 收敛到白名单 |
| **P0** | 真实密钥（`WECHAT_APPID/SECRET`、JWT 签名密钥）走环境变量，把 `.env` 移出仓库 |
| **P1** | 挂载或清理 `amazon.py` / `operations.py` 死路由 |
| **P1** | 容器化交付：补 Dockerfile、迁移脚本，按目标生产库（PostgreSQL）验证 |

::: tip 这套系统的"工程底座"
最有价值的设计在费率引擎——仓储费只算超期部分、入库差异自动算 `difference_qty`、导出 Excel 与客户模板逐列对齐。这三件事都靠代码级别的边界检查，不是靠人盯。
:::

## 七、路线图

| 阶段 | 目标 | 关键动作 | 状态 |
| --- | --- | --- | --- |
| 近期 | 安全收口 | API 网关 JWT 校验 / CORS 白名单 / 密钥走环境变量 | 已立项 |
| 近期 | 清死代码 | 挂载或删除 amazon / operations 路由 | 已立项 |
| 中期 | 部署就绪 | 补 Dockerfile、迁移脚本，PostgreSQL 跑通 | 已规划 |
| 中期 | 补测试 | API 层集成测试（当前只覆盖 service 层） | 已规划 |
| 远期 | 全链路生产化 | 对接生产库，配 CI/CD | 设计中 |

## 八、三十秒版本

> 一个海外仓作业审计系统，走的是"亚马逊 FBA 移除订单 → 仓库换标装箱 → 费用对账"这条链路。客户上传亚马逊移除单 CSV，生成入库预报单，仓库确认实收算差异，出库换标后录入装箱明细，系统按换标费、纸箱费、打包费、超重标签费这些单价自动计费，最后导出一份和客户 Excel 模板逐列对齐的账单。
>
> 数据模型八张表，覆盖用户、亚马逊订单、批次、入库预报、操作指令、装箱明细、仓储费、费率。费率引擎是核心，仓储费只算超期部分，入库差异自动算 `difference_qty`。
>
> 三个测试文件质量不错：全链路、角色隔离、Excel 逐列比对。而且是真实业务数据驱动的——data 目录里有真实的亚马逊移除单和装箱明细样本。
>
> 下一步是把这套可演示的核心业务流推到生产——先把安全收口做完（API 网关校验、密钥环境化），再做容器化交付与生产库对接。
