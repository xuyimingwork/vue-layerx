# ADR 0004：`mergeFragment` / 节点是否保留未知字段（adapter 元数据与扩展）

- **状态**：讨论中（Proposed）
- **日期**：2026-07-14
- **关联**：[ADR 0003](./0003-reactive-layer-config.md)（`adapter` 挂 `store.create`）；[DESIGN.md](../../DESIGN.md) merge → adapt → bind

---

## 背景

[ADR 0003](./0003-reactive-layer-config.md) 拟将 `adapter` 写入 `store.create`，依赖现状：**`mergeFragment` 只合并 `content` / `container`，其它顶层键被丢弃**，故 merge 后从 `store.create.adapter` 再取一次。

由此引出更一般的问题：

1. **Fragment 顶层**是否应保留未知字段（`adapter`、以及用户自定义 meta，供 adapter 决策）？
2. **`container` / `content` 节点**是否允许 `component` / `props` / `slots` / `model` / `closeOn` 之外的自定义字段，并经 merge 传到 adapter？
3. 与 **`props` 已是开放字典**（`LayerProps = Record<string, unknown>`）如何区分——哪些扩展走 props，哪些走「配置域元数据」？

若不允许未知字段，adapter 只能看见规范 fragment，自定义信号必须塞进 `props`（可能污染组件）或闭包（无法经 tier merge）。若允许，merge / strip / bind / 类型都要有明确规则，否则未知键会漏进 `h()` 或静默丢失。

---

## 现有事实

### Fragment merge（[`fragment.ts`](../../src/config/fragment.ts)）

```ts
mergeFragment(...sources) {
  // 只取 sources[].container / sources[].content
  // 顶层其它键（含设想中的 adapter）不进入结果
}
```

### Node merge（[`node.ts`](../../src/config/node.ts)）

| 字段 | `mergeNode` / container / content |
|------|-----------------------------------|
| `component` | 后写覆盖 |
| `props` | `mergeProps`（`ref` 链式，其余后写覆盖） |
| `slots` | shallow 合并 |
| `model` | 仅 container，后写覆盖 |
| `closeOn` | 仅 content，后写覆盖 |
| **其它键** | **丢弃** |

### `props`

已是开放的：任意 key 可进 `container.props` / `content.props`，bind 后进入 `h()`。**组件 props 级扩展今天已支持**，无需改 merge。

### bind（[`bind-layer.ts`](../../src/config/bind-layer.ts)）

只消费 `component` / `props` / `slots` / `model` / `closeOn`，产出 `LayerNormalized`（可 `h()`）。节点上若残留未知键，**当前不会**传到 vnode（因 bind 重建对象）；但若将来 merge 保留未知键却忘记在 bind 剥离，有泄漏风险。

### adapter 时机

```text
merge → adapter(fragment) → refs → bind → render
```

adapter 的输入是 **merge 后的配置域 fragment**。它今天能改的只有进得了 merge 的字段。

---

## 需求分层

| 层级 | 例子 | 今天 | 诉求 |
|------|------|------|------|
| A. 组件 props | `title`、`width`、业务 `recordId` | ✅ `props` 开放 | 保持 |
| B. Fragment 顶层框架字段 | `adapter`（仅 create） | ❌ merge 丢弃；拟从 `store.create` 另读 | ADR 0003 |
| C. Fragment 顶层用户 meta | `breakpoint: 'sm'`、`intent: 'confirm'` 供 adapter 读 | ❌ 丢失 | **待决** |
| D. Node 级用户 meta | `container.variant`、`content.mode`（非 props） | ❌ 丢失 | **待决** |

C/D 的动机：adapter 需要 **跨 tier 合并后的信号**，又不想把信号写进会打到 Dialog/Form 上的 `props`。

---

## 建议（倾向采纳）

**同意前提：进 render / bind 的必须是已知字段；「未知」数据的唯一消费者是 adapter。**

管线角色因此很清楚：

```text
各 tier（含可选 meta）→ merge → adapter 读/改 meta 与规范字段 →（丢掉 meta）→ bind → h()
```

| 数据 | 谁用 | 建议 |
|------|------|------|
| `component` / `props` / `slots` / `model` / `closeOn` | merge → adapter → **bind → render** | 白名单；node **不**开放任意未知键 |
| `props.*` | 打到组件上 | 已开放；真正给组件的扩展走这里 |
| `meta.*` | **仅 adapter**（跨 tier 信号） | 显式袋子；merge 浅合并；**bind 保证丢弃** |
| `adapter` | 框架 | 仍按 ADR 0003 挂 `store.create`，**不**放进 `meta`，也 **不**靠「任意未知顶层键」透传 |

因此：

- **否决方案 2 / 3**（任意顶层 / 任意 node 键）：render 契约应保持封闭；开放未知键没有第二个合法消费者，只增加泄漏与类型噪音。
- **采纳方案 4（显式 `meta`）**，且语义钉死为 **adapter-only**：
  - `mergeFragment` 增加 `meta` 浅合并（后写覆盖）；其它未知顶层键 **dev warn 并丢弃**（或类型直接不准写）。
  - `container` / `content` 维持字段白名单。
  - `bindLayer` 不读 `meta`；adapter 若返回仍带 `meta`，bind 前剥离（或约定 adapter 应删掉）。
- 若项目暂时没有「非 props 的跨 tier 信号」需求，可 **先不实现 `meta`，但文档写明：禁止依赖未知键透传**；需要时再加 `meta`，而不是回头开放任意字段。

**不推荐**把 adapter 专用信号长期塞在 `props` 里再删：能跑，但和「给组件的 props」职责重叠，且容易漏删打到 Dialog 上。

---

## 备选方向

### 方案 1：维持白名单（现状 + ADR 0003 特例）

- Fragment：只 `content` / `container`；`adapter` **不参与 merge**，固定从 `store.create` 读取。
- Node：只已知字段。
- 用户 meta → 约定塞进 `props`（或 `props` 下命名空间如 `props['layerx:meta']`），adapter 读写后再删掉，避免泄漏到 `h()`。

**优点**：管线简单、类型封闭、无泄漏。  
**缺点**：污染 props 或依赖约定；跨 tier meta 要自己 merge。  
**定位**：无 `meta` 需求时的现状；有需求时升级到方案 4，而不是方案 2/3。

### 方案 2：Fragment 顶层允许未知键（后写覆盖）— 不推荐

- `mergeFragment`：除合并 `content`/`container` 外，对其它顶层 key 做浅合并（后源覆盖）。
- bind **必须忽略**未知顶层键。

**否决理由**：未知键没有稳定消费者契约；与 `adapter` 框架字段混排；类型与 strip 成本高。

### 方案 3：Node 级允许未知键（后写覆盖）— 不推荐

- `mergeContainerNode` / `mergeContentNode`：未知 key 后写覆盖。

**否决理由**：与 `model`/`closeOn` 混排；render 路径应保持节点白名单。

### 方案 4：显式 `meta` 袋（**建议采纳**）

```ts
interface LayerConfigFragment {
  content?: LayerConfigContent
  container?: LayerConfigContainer
  meta?: Record<string, unknown>  // 仅 adapter；merge 浅合并；bind 丢弃
}
```

- 用户与 adapter 约定只通过 `meta` 传非 props 信号。
- Node 级不开放任意键。
- `adapter` 函数本身仍按 ADR 0003，不放入 `meta`。

---

## 与 ADR 0003 的衔接

- `adapter` 继续：**写入 `store.create`，merge 后取出**（框架通道），不依赖未知字段透传。
- 若实现 `meta`：merge 结果带上合并后的 `meta`，再交给 `adapter(fragment)`；与 0003 兼容。

---

## 待决问题（收窄后）

### Q1：现在是否落地 `meta`，还是仅文档约定「将来用 meta」？

- 有真实 adapter 跨 tier 信号 → 落地方案 4。
- 暂无 → 维持方案 1 行为 + 本文定规，避免有人依赖未知键。

### Q2：`meta` merge 深浅？

- 倾向 **浅合并、后写覆盖**（与 slots 类似）；需要深合并由 adapter 自理。

### Q3：公共 API 是否在 `LayerConfigStatic` / `LayerConfigInstance` 暴露 `meta`？

- 倾向暴露（create / define / use / open / clone 均可贡献 meta，按 tier 合并），与 props 一样由高优先级覆盖。

---

## 决策记录

| 项 | 结论 | 置信度 |
|----|------|--------|
| 未知数据的消费者 | **仅 adapter**；bind/render 只用已知字段 | 高 |
| 是否保留任意 fragment 顶层未知键 | **否** | 高 |
| 是否保留任意 node 未知键 | **否** | 高 |
| 是否引入显式 `meta` | **是**（adapter-only；可分期落地） | 高 |
| `adapter` 与 merge | 维持 ADR 0003（`store.create`）；不放进 `meta` | 高 |
| `meta` merge | 浅合并、后写覆盖 | 中 |

---

## 参考

- [ADR 0003 §5 adapter → store.create](./0003-reactive-layer-config.md)
- [DESIGN.md 核心管线](../../DESIGN.md)
- [`src/config/fragment.ts`](../../src/config/fragment.ts) / [`node.ts`](../../src/config/node.ts) / [`bind-layer.ts`](../../src/config/bind-layer.ts)
