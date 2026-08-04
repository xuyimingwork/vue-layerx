# ADR 0011：`$open` / `$confirm` — 内容 props 快捷打开（不改动 `open`）

- **状态**：Accepted（已实现）
- **日期**：2026-07-31
- **关联**：[DESIGN.md](../../DESIGN.md) `useX` / `open` 与 `LayerConfigContent`；[`LayerInstance`](../../src/types/instance.ts)

---

## 背景

`open` / `confirm` 接受完整 **`LayerConfigContent`**（与 `use` 同构）：顶层描述 **content**（`props` / `slots` / `component` / `closeOn`…），嵌套 `container` 描述容器。这保证：

- 少数场景可在当次打开时改标题、换容器、命令式 `slots`、覆盖 `closeOn`
- create / define / use / open 配置形状一致

但调用分布极不均衡：

| 频率 | 典型写法 |
|------|----------|
| ~99% | 只给**内容**传参：`open({ props: { userId, mode } })` |
| ~1% | 同时改 `container.props`、极少写 `slots` / `component` |

多包一层 `props:` 在完整模型里合理，在日常调用里啰嗦。`LayerTemplate` 已承担常规插槽投递，**不**构成「每次 open 都要配 slots」的理由；slots 留在 `open` 配置里只为冷门命令式覆盖。

约束：**不能破坏现有 `open(config?: LayerConfigContent)` 的语义与签名**（已发布 API）。

---

## 问题

1. 在保留完整 `open` / `confirm` 的前提下，如何降低「只传内容 props」的样板？
2. 快捷 API 是否允许顺带传 `container` / `slots`（以免再嫌糖不够甜）？
3. 命名用什么？是否与 Vue `$route` / `$router` 一类 `$` 快捷入口对齐？
4. `confirm` 是否对称提供糖？

---

## 备选

| | A. 改 `open` 重载：`open(props)` / `open(config)` | B. 新方法 `$open(props)`（+ `$confirm`） | C. 仅文档约定，不加 API |
|--|--------------------------------------------------|------------------------------------------|-------------------------|
| 兼容 | 重载易与「纯对象既像 props 又像 config」冲突；已有调用全是 config | 加方法，旧代码零改动 | 无代码成本 |
| 心智 | 一个名字两种形状，边界糊 | 两名字：完整 vs 糖 | 啰嗦依旧 |
| 表达力 | 完整能力仍在 | 完整仍走 `open`；糖只含量 props | — |

取 **B**。

不取 A：在「顶层字段既可能是 content props 键，也可能是 `props`/`container`/`closeOn`」时，重载区分不可靠，且等于改 `open` 的契约叙事。  
不取 C：问题真实且实现成本极低（委托一行），值得做成正式 API。

---

## 决策

### 1. 新增 `LayerInstance.$open` / `$confirm`

```ts
// 语义（实现即委托，不另开 merge 通道）
instance.$open(contentProps?)
  ≡ instance.open(contentProps === undefined ? undefined : { props: contentProps })

instance.$confirm(contentProps?)
  ≡ instance.confirm(contentProps === undefined ? undefined : { props: contentProps })
```

- **入参**：当次 **content props** 普通对象（与 `open({ props })` 的 `props` 同形；含 `onXxx` 事件回调惯例）。不传则等同无参 `open()` / `confirm()`。
- **不接受** `LayerConfigContent` 顶层形态（禁止在 `$open` 里写 `container` / `slots` / `closeOn` / `component`）。需要这些时用 `open` / `confirm`。
- **返回值**：与 `open` / `confirm` 相同（`$open` → `void`；`$confirm` → `Promise<LayerConfirmResult>`）。

### 2. 不修改现有 `open` / `confirm`

- 签名、merge、快照语义、slots/container 能力不变。
- 不从类型中删除 `open` 配置上的 `slots`（同构与冷门命令式 / JSX 仍需要）。

### 3. 命名采用 `$` 前缀

- 表示「实例上的常用快捷入口」，类比 Vue 生态中 `$route` / `$router` 相对底层能力的定位（此处为**同一实例**上的糖，而非全局属性）。
- 备选名 `openWith` / `openProps` 语义也可，本 ADR **钉死 `$open` / `$confirm`**，避免再分叉。
- `$` **不是** Options API 专属；组合式里 `const dialog = useDialog(...)` 后调用 `dialog.$open(...)` 即可。

### 4. 文档与推荐用法（落地时）

| 场景 | 用 |
|------|-----|
| 只传内容 props（默认示例） | `$open` / `$confirm` |
| 当次改容器、slots、closeOn、component 等 | `open` / `confirm` |

快速上手与最佳实践默认示范 `$open`；进阶 / API 仍详述完整 `open`。

### 5. 类型（实现指引）

- 理想：`$open` / `$confirm` 的入参与当前实例绑定的 content 组件 props 对齐（含可选；难度依赖现有 `useLayer` 泛型是否已携带 Content props）。
- 最低：入参为 `Record<string, unknown>` 或与 `LayerConfigContent['props']` 等同的宽松对象；**不得**把入参类型写成 `LayerConfigContent`（以免鼓励传入 `container`）。
- 若泛型一时接不齐，可先宽松对象 + 文档说明，后续小版本收紧（非本 ADR 阻塞项）。

### 6. 非目标

- 不把 `$open` 扩展成「也能传 container 的第二套 open」。
- 不引入 `$close`（`close` 已足够短）。
- 不在本版本用重载改写 `open` 本身。
- 不要求迁移旧代码；旧 `open({ props })` 永久有效。

---

## 后果

- **下版本实现清单**：`LayerInstance` 增加 `$open` / `$confirm`；运行时委托；测试（等价性、无参、与 `confirm` busy 行为一致）；指南 / API / 最佳实践改默认示例。 → **已完成**
- **API 审查**：若有人提议 `$open({ props, container })` 或让 `$open` 接受完整 config → 违背本决策。
- **DESIGN.md**（落地时）：在 `LayerInstance` / `open` 节增补 `$open` / `$confirm` 一行等价说明。 → **已完成**

---

## 决策记录

| 项 | 结论 |
|----|------|
| 完整配置入口 | 仍为 `open` / `confirm`（`LayerConfigContent`） |
| 内容 props 糖 | `$open(props?)` / `$confirm(props?)` |
| 实现 | 委托为 `{ props }`；无新 merge 语义 |
| `$open` 可否含 container/slots | **否** |
| 改 `open` 重载 / 删 slots | **否** |
| 状态 | 下版本实现 |
