# 美鸥做账工具

> 亚马逊财报 PDF → 可直接入账的 Excel。覆盖 11 种语言、20 种币种，桌面 GUI 与网页 SaaS 双形态，并延伸到亿企代账凭证导入。

| | |
| --- | --- |
| **业务域** | 跨境电商财务 |
| **技术栈** | Python 3.12 / PyMuPDF / openpyxl / FastAPI / SQLite / Docker |
| **代码位置** | `project-codex/amazon_pdf_to_xlsx/`、`project-codex/amazon-saas/`、`亿企代账/` |
| **真实状态** | 生产可用，已迭代多个版本并交付真实客户 |

## 一、它解决什么问题

亚马逊卖家后台导出的 **Transaction Report 是版式 PDF**，没有可选文本层，也没有表格标记。财务拿到手，得靠肉眼把「科目名 + 金额」一行行敲进 Excel 模板。

规模是这样的：一个站点一季度 40+ 行交易，12 个站点就是几百行，每季度重复一次，还要保证跨国币种、跨语言的科目名对得准。手工录入既慢又容易错，错了直接影响报税。

这个工具把流程压成三步：**选 PDF → 选模板 → 写入**。

## 二、业务流程

```text
亚马逊后台导出 PDF（12 站点 × 多语言）
        ↓
   解析：坐标重建两栏表格
        ↓
   语言检测（11 种 locale 打分）
        ↓
   科目名翻译 → 英文标准科目
        ↓
   金额归一（英式/欧式/整数制）
        ↓
   映射到中国会计科目行
        ↓
   校验（5 条规则）
        ↓
   写入 Excel 模板（保留公式）
        ↓
   GUI 人工复核（颜色分级）
```

GUI 里的复核用颜色分级，这一步是刻意保留的人工闸门：

| 颜色 | 含义 |
| --- | --- |
| 🟢 绿 | 精确匹配 |
| 🟡 黄 | 模糊匹配，相似度 ≥ 85% |
| 🔴 红 | 未映射，需人工处理 |
| ⚪ 灰 | 无数据 |

## 三、核心模块

| 模块 | 职责 |
| --- | --- |
| `pdf_parser.py` | PDF 解析，坐标重建、语言检测、金额归一 |
| `i18n.py` | 11 种语言的科目名与界面文案字典 |
| `config.py` | 模板结构探测、科目→行号映射、币种列路由 |
| `value_mapper.py` | 科目名 → Excel 单元格写入指令，V16/V17 符号开关 |
| `validator.py` | 5 条校验规则 |
| `excel_writer.py` | openpyxl 写入，只写金额列、保留模板公式 |
| `gui_app.py` | tkinter 桌面界面 |

## 四、技术难点

### 4.1 无文本层 PDF 的表格重建

PDF 里没有表格结构，只有带坐标的文本块。做法是取 `get_text("dict")` 拿到每个 span 的 `(x, y)`，按坐标排序重建「左侧科目名栏 + 右侧金额栏」的对应关系。

跨页不是问题——循环逐页提取后合并 span 列表，天然连续。真正的难点是**行漂移**：

- 行分组用固定 **7px 高度窗口**，避免相邻行因基线漂移混叠。
- 但日文 PDF 的金额会整体下漂 11–12px，导致金额脱离所属科目行。解法是「孤儿金额再分配」：把落在窗口外的孤立金额，归并回上一行同名科目。

```python
# pdf_parser.py — 日文 PDF 金额下漂的再分配
# 孤儿金额归并到上一行同名科目
```

::: tip 面试怎么讲
这个细节值得讲，因为它体现了「先建通用规则，再为真实数据打补丁」的工程路径。7px 窗口是通用规则，孤儿再分配是针对日文版式的特例处理——两者都保留了，没有用一个 hack 覆盖掉通用逻辑。
:::

### 4.2 多语言识别与科目映射

`i18n.py` 的 `LOCALES` 实际包含 **11 种**：`en / de / fr / es / it / nl / sv / pt / pl / ja / tr`。

语言检测是**关键词打分**：对每种 locale 累加 section 关键词（+2）、skip 文本（+1）、科目名（+3），取最高分。

科目名映射是**两级**：

1. 字典精确匹配
2. `difflib.SequenceMatcher` 模糊匹配，阈值 **0.80**（模板读取处用 0.85）

货币检测按语种正则提取 `"All amounts in EUR"` 这类声明，失败则回退到 locale→币种映射表；海湾国家用 `KSA`、`GMT+4`、`GMT+3` 这类线索推断 SAR / AED。

### 4.3 金额格式归一

五种正则分别匹配：

| 格式 | 样例 | 语种 |
| --- | --- | --- |
| 英式 | `1,234.56` | en |
| 欧式 | `1.234,56` | de / fr / es / it |
| 无分隔符 | `1234.56` | 部分站点 |
| 整数制 | `27130` | ja（JPY） |
| 零值 | `0.00` | 通用 |

另外要把 Unicode 减号 `−`（U+2212）转成 ASCII `-`——这个坑很隐蔽，PDF 里的负号经常不是 ASCII。

### 4.4 V16 / V17 正负号模式

`value_mapper.py` 里有一个模块级开关 `_SIGN_TRANSFORM`：

| 版本 | 模式 | 支出行 | 转账/税行 |
| --- | --- | --- | --- |
| V16 | 正常金额 | 保持原值 | 保持原值 |
| V17 | 相反数模式 | **取反** | 取绝对值 |

业务原因是**不同客户的会计模板对费用/税款的正负号约定不一样**。这不是版本新旧，而是按客户打包的变体开关。SaaS 版在请求级别切换，桌面版改常量。

### 4.5 校验规则

桌面版 `validator.py` 有 5 条规则：

| 规则 | 内容 |
| --- | --- |
| R1 | 分节小计一致 |
| R2 | 总额 sanity（收入 ≥ 0，费用 ≤ 0） |
| R3 | 完整性检查 |
| R4 | 未映射科目提醒 |
| R5 | 关键科目必须存在 |

::: warning 这里要说清楚
桌面版的 5 条规则**不做严格借贷平衡**。真正的借贷平衡校验 `validate_balance` 在亿企代账链路里，容差 `0.01`，要求每个凭证号下本币与外币的借贷合计相等。
如果 README 里写了"借贷总额平衡"，那是针对亿企代账链路的描述，不是桌面解析阶段的能力。
:::

### 4.6 打包分发

PyInstaller spec 有两个，产出不同的 exe。其中一个明确 `excludes` 掉 easyocr / torch / numpy 等重型 OCR 依赖来缩小体积——早期版本试过 OCR 路线，后来确定 PyMuPDF 文本层足够，就把包袱卸了。

激活机制 v6 起改用 HMAC-SHA256 机器指纹，替代了原来的 PyInstaller 字节码加密。

## 五、网页 SaaS 版

`amazon-saas/` 是把桌面内核搬到浏览器的一套：

| 层 | 实现 |
| --- | --- |
| 后端 | FastAPI |
| 认证 | bcrypt 哈希 + JWT（python-jose，HS256，默认 24h） |
| 数据库 | SQLite（WAL 模式），表 `User` / `ParseJob` |
| 前端 | 单文件 Vanilla JS SPA，无构建步骤 |
| 部署 | Docker Compose（app + nginx），Uvicorn |

`ParseJob` 记录每次解析的币种、国家、期间、映射数和输出路径，一是做历史查询，二是**配额控制**——`User.monthly_quota` 默认 30 次/月。

解析是**同步**的：单请求上限 20 个文件、50MB，复用桌面完全相同的 `extract_transactions` → `build_cell_writes` → `validate` → `write_amounts` 链路。**桌面和 SaaS 共用一套解析内核**，这是刻意的设计——避免两套逻辑漂移。

## 六、延伸：亿企代账凭证导入

Excel 出来之后还要入账，客户用的是「亿企代账 / 亿企云」。这一段的工作是让导出的凭证**直接导入迁账软件**，不再二次录入。

### 6.1 凭证编号规则

```text
按国家固定顺序遍历（取自 COUNTRIES 注册表，与 PDF 选择顺序无关）
  每个国家内依次处理：Income → Expenses → Transfers → Tax
    仅当该类别外币金额 |amount| > 0.005 时才生成凭证
    生成则占用一个号，不生成则不占号
```

`CATEGORY_ORDER = ("Income", "Expenses", "Transfers", "Tax")`。反序输入国家也要保证输出顺序一致，这条有专门的测试覆盖。

### 6.2 账簿信息

迁账模板的 `账簿信息!B2:B8` 七项必须写满：公司名、会计准则、期间、科目级次、编码结构、编码分隔符、名称分隔符。写入前会校验 A2:A8 的标签与预期一致，**模板被改动过就明确报错**，而不是静默写错位置。

### 6.3 防重复入账

每个源文件算 SHA-256，同一路径或相同哈希出现两次直接抛 `ImportPreparationError`。任务号用 `sha256(公司名 + 期间 + 排序后的源文件哈希)[:16]`，**不含任何账号、密码或验证码**。

全零批次（所有交易金额都低于阈值）走 `skipped_no_data` 分支，不创建任何产物。

### 6.4 桌面客户端自动化（进行中）

`cdp-tool.mjs` 是一个 CDP（Chrome DevTools Protocol）客户端，用来自动化亿企代账的 CEF 桌面客户端，支持 `eval / click / set-file / screenshot` 四类操作。

::: danger 状态说明
这部分**只到方案与草稿阶段**。完整的适配器（`cdp_client.py`、`migration_adapter.py`、`import_orchestrator.py`）不在当前目录树里，只有 `automation-plan.md` 描述设计：默认 dry-run、fail-closed、脱敏 JSON 日志。

面试时请如实说「自动化方案已设计并做了 CDP 连通性验证，编排层尚未完成」。
:::

## 七、成果数据

| 指标 | 数值 | 来源 |
| --- | --- | --- |
| 支持语言 | **11 种** | `i18n.py` 的 `LOCALES` |
| 支持币种 | **20 种** | `config.py` 的 `KNOWN_CURRENCIES` |
| 货币列 | 15 列 | `AmazonPDFtoExcel.spec` 注释 |
| 测试覆盖 | 12 个国家真实 PDF | `test_all_countries.py` |
| SaaS 配额 | 30 次/月/用户 | `models.py` |

::: warning 一个必须修正的点
README 和开发者文档里写的是「8 种语言」，还列了一个代码里**根本不存在**的 `cs`（捷克语）。实际代码支持 11 种，多了 `pt / ja / tr`。

**这是文档没跟上代码的典型情况。** 如果要拿这个项目面试，先把文档改对——面试官 if 打开 README 对比代码，这种不一致很伤。
:::

## 可验证证据

> 完整代码在公司内网，本页只放脱敏后的证据；面试可提供脱敏代码演示。

**架构（脱敏）**

```text
[亚马逊财报 PDF（12 站点 × 11 语言）]
        ↓
pdf_parser.py      坐标重建 · 语言检测 · 金额归一
        ↓
value_mapper.py    科目名 → Excel 单元格（V16/V17 符号开关）
        ↓
validator.py       5 条校验规则
        ↓
excel_writer.py    openpyxl 写入，保留模板公式
        ↓
[GUI 颜色分级复核]  →  [亿企代账凭证导入（SHA-256 防重）]
```

**核心代码片段（脱敏）**

`pdf_parser.py` 里最值得讲的一段——**7px 固定窗口行分组 + 日文孤儿金额再分配**：

```python
# 行分组：固定 7px 高度窗口
# 注释原文：This avoids the drift-bug where max(cur_y, y) accumulated small
# y advances across alternating left/right items until adjacent rows
# (9-10 px apart) bled into one.
for x, y, text in all_spans:
    new_min = min(cur_min_y, y)
    new_max = max(cur_max_y, y)
    # 超出 7px 则另起一行（日文 PDF 的金额会下漂 11-12px）
```

```python
# 孤儿金额再分配：把落在窗口外的孤立金额归并回上一行同名科目
# 注释原文：redistribute orphan amounts (rows with only amounts/skip-text)
# to the same-side column of the previous row. This handles Japanese PDFs
# where amounts drift 11-12px below their names.
for r_idx in range(len(rows) - 1, 0, -1):
    cur, prev = rows[r_idx], rows[r_idx - 1]
    # 只有「纯金额列」才算孤儿（含非金额文本则跳过）
    has_any_text = any(not _is_amount(t) for _, t in col_items)
    if has_any_text:
        continue
    # 上一行同侧必须有「悬空」的科目名（有名字但还没分到金额）
```

::: tip 为什么这段值得放
它体现了「先建通用规则，再为真实数据打补丁」的工程路径。7px 窗口是通用规则，孤儿再分配是针对日文版式的特例处理——**两者都保留了，没有用一个 hack 覆盖掉通用逻辑**。
:::

**运行证据**

| 验证项 | 结果 |
| --- | --- |
| 12 国真实 PDF 解析测试 | 通过（`test_all_countries.py`） |
| 支持语言 | 11 种（`i18n.py` `LOCALES`，非文档所写的 8 种） |
| 支持币种 | 20 种（`config.py` `KNOWN_CURRENCIES`） |

::: warning 一个必须知道的点
README 和开发者文档写的是「8 种语言」，还列了代码里**根本不存在**的 `cs`（捷克语）。实际支持 11 种。面试前把文档改对——面试官打开 README 对比 `i18n.py` 就会发现问题。
:::

## 八、演进方向

| 维度 | 当前形态 | 下一步 |
| --- | --- | --- |
| 金额格式 | 主流五种格式归一化 | 补括号负数 `(1,234.56)`；扫描 / 胶带 PDF 的解析兜底 |
| 借贷平衡校验 | 桌面 GUI 未集成（亿企代账链路已有） | 把容差 0.01 的 `validate_balance` 以可选开关下沉到桌面端 |
| 版本切换 | 桌面 GUI 无界面控件，只在常量层 | V16/V17 切换控件在 GUI 显式化 |
| 亿企代账自动化 | CDP 连通性已验证，编排层待实现 | 完成 `migration_adapter` / `import_orchestrator`，默认 dry-run |
| 文档与代码对齐 | README 与代码偶有偏差 | 文档与代码统一为最新形态 |

## 九、路线图

> 工具已在生产里跑，计划书的重点是收敛边界、补完自动化最后一公里。

| 阶段 | 目标 | 关键动作 | 状态 |
| --- | --- | --- | --- |
| 近期 | 文档与代码对齐 | 文档与代码统一为最新形态；V16/V17 开关在 GUI 显式化 | 已立项 |
| 近期 | 覆盖剩余金额格式 | 括号负数 `(1,234.56)`；胶带/扫描 PDF 的解析兜底 | 已立项 |
| 中期 | 亿企代账自动化收口 | `migration_adapter` / `import_orchestrator` 落地，默认 dry-run、fail-closed | 进行中 |
| 中期 | 桌面借贷平衡 | 把亿企链路 `validate_balance`（容差 0.01）下沉到桌面 GUI | 已规划 |
| 远期 | 多站点科目模板 | 不同客户模板可配置，减少 GUI 人工复核 | 设计中 |

::: tip 这套工具的"现场感"
最有价值的不是解析本身，而是**跨语言版式的特例处理**——比如日文 PDF 的金额会整体下漂 11 个像素，得做孤儿金额再分配。再延伸到凭证层：连续凭证号、写满账簿信息、用文件指纹阻止重复入账。这是把"工具"升级成"完整链路"的工程价值。
:::

## 十、三十秒版本

> 亚马逊的财报 PDF 是没有文本层的版式文件，财务要手工把几百行科目和金额录进 Excel。我用 PyMuPDF 按坐标重建表格结构，做了 11 种语言的科目字典加模糊匹配、五种数字格式的归一化，再把科目映射对齐到中国会计科目，输出保留公式的 Excel。
>
> 难点不在解析本身，而在跨语言版式的特例处理——比如日文 PDF 的金额会整体下漂 11 个像素，得做孤儿金额再分配。
>
> 后来把内核抽出来做了 SaaS 版，桌面和网页共用同一套解析逻辑，避免两套代码漂移。再往下延伸到凭证层，按国家和类别生成连续凭证号、写满账簿信息、用文件指纹阻止重复入账。
>
> 现在 12 个国家的真实 PDF 测试全部通过，客户实际在用。
