# ADR 0004：`mergeFragment` / 节点是否保留未知字段

- **状态**：Accepted（维持白名单；未知字段非公共契约；扩展机制待定）
- **日期**：2026-07-14
- **定稿**：2026-07-15
- **关联**：[ADR 0003](./0003-reactive-layer-config.md)（`adapter` 挂 `store.create`）；[DESIGN.md](../../DESIGN.md) merge → adapt → bind

---

## 背景

[ADR 0003](./0003-reactive-layer-config.md) 将 `adapter` 写入 `store.create`，依赖现状：**`mergeFragment` 只合并 `content` / `container`，其它顶层键被丢弃**，故 merge 后从 `store.create.adapter` 再取一次。

由此引出更一般的问题：

1. **Fragment 顶层**是否应保留未知字段（供 adapter 决策）？
2. **`container` / `content` 节点**是否允许已知字段之外的自定义键，并经 merge 传到 adapter？
3. 与 **`props` 已是开放字典**（`LayerProps = Record<string, unknown>`）如何区分——哪些扩展走 props，哪些走「配置域元数据」？

若不允许未知字段，adapter 只能看见规范 fragment，自定义信号必须塞进 `props`（可能污染组件）或闭包（无法经 tier merge）。若允许，merge / strip / bind / 类型都要有明确规则，否则未知键会漏进 `h()` 或静默丢失。

---

## 现有事实

### Fragment merge（[`fragment.ts`](../../src/config/fragment.ts)）

```ts
mergeFragment(...sources) {
  // 只取 sources[].container / sources[].content
  // 顶层其它键（含 adapter）不进入结果
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

只消费 `component` / `props` / `slots` / `model` / `closeOn`，产出 `LayerBound`（可 `h()`）。节点上若残留未知键，**当前不会**传到 vnode（因 bind 重建对象）；但若将来 merge 保留未知键却忘记在 bind 剥离，有泄漏风险。

### adapter 时机

```text
merge → adapter(fragment) → refs → bind → render
```

adapter 的输入是 **merge 后的配置域 fragment**。它今天能改的只有进得了 merge 的字段。

---

## 需求分层

| 层级 | 例子 | 今天 | 结论 |
|------|------|------|------|
| A. 组件 props | `title`、`width`、业务 `recordId` | ✅ `props` 开放 | **保持** |
| B. Fragment 顶层框架字段 | `adapter`（仅 create） | 不参与 merge；从 `store.create` 另读 | **ADR 0003** |
| C. Fragment 顶层用户扩展信号 | 供 adapter 读的非 props 数据 | ❌ 丢失 | **本期不引入；机制待定** |
| D. Node 级用户扩展信号 | 非 props 的 node 自定义键 | ❌ 丢失 | **否决任意未知键** |

C 的动机仍在：adapter 可能需要 **跨 tier 合并后的信号**，又不想写进会打到 Dialog/Form 上的 `props`。本期只钉死负面契约，不预定正面 API 形状。

---

## 决策

### 1. 维持字段白名单（采纳方案 1 行为）

| 范围 | 规则 |
|------|------|
| Fragment 顶层 | 只合并 `content` / `container`；其它顶层键 **丢弃**，**不是**公共契约 |
| Node | 只合并已知字段（`component` / `props` / `slots` / `model` / `closeOn`）；其它键 **丢弃** |
| `props` | 继续开放字典；真正打到组件上的扩展走这里 |
| `adapter` | 按 ADR 0003 挂 `store.create`，**不**靠未知顶层键透传 |

### 2. 钉死负面契约（1.0 冻结面）

1. **未知顶层键 / 未知 node 字段不保证透传**——今天丢弃；用户与第三方 **不得**依赖「未知键能经 merge 到达 adapter」。
2. **进 bind / `h()` 的只有已知字段**——任何将来的扩展通道都必须保证不泄漏进 vnode props。

### 3. 否决「开放任意未知键」

- **否决方案 2**（Fragment 顶层任意未知键后写覆盖）
- **否决方案 3**（Node 级任意未知键后写覆盖）

理由：未知键没有稳定消费者契约；与框架字段混排；类型与 strip 成本高；容易漏进 `h()`。

### 4. 扩展机制待定（不预定为 `meta`）

本期 **不**落地专用扩展袋，也 **不**把方案 4（显式 `meta`）定为已采纳 API。

若日后需要「非 props、可跨 tier 合并、仅 adapter 消费」的信号，另开 ADR 设计正面形状——可以是显式 `meta`、专用顶层键、或其他通道。约束不变：

- 不得回头把「任意未知键」变成公共契约
- bind / render 路径保持封闭

过渡期若必须传 adapter 专用信号：可用闭包，或临时塞进 `props` 并由 adapter 读后删掉（**不推荐**长期依赖；与「给组件的 props」职责重叠，易漏删）。

---

## 备选方向（讨论记录）

### 方案 1：维持白名单（**已采纳为现状契约**）

- Fragment：只 `content` / `container`；`adapter` **不参与 merge**，固定从 `store.create` 读取。
- Node：只已知字段。
- 跨 tier 非 props 信号 → 本期不做；需要时另开 ADR。

### 方案 2：Fragment 顶层允许未知键 — **否决**

### 方案 3：Node 级允许未知键 — **否决**

### 方案 4：显式 `meta` 袋 — **未采纳（备选，非承诺）**

```ts
interface LayerConfigFragment {
  content?: LayerConfigNodeContent
  container?: LayerConfigNodeContainer
  meta?: Record<string, unknown>  // 仅 adapter；merge 浅合并；bind 丢弃
}
```

曾作为讨论倾向；**不定为 1.0 承诺**。若将来采用，须满足上文「扩展机制」约束，并单独 ADR 定稿。

---

## 与 ADR 0003 的衔接

- `adapter` 继续：**写入 `store.create`，merge 后取出**（框架通道），不依赖未知字段透传。
- 将来若增加扩展袋，再约定它如何进入 `adapter(fragment)` 入参；与 0003 兼容。

---

## 决策记录

| 项 | 结论 |
|----|------|
| Fragment / node 未知键 | **丢弃**；非公共契约 |
| 是否开放任意未知键 | **否** |
| bind / render | **仅已知字段** |
| `adapter` 与 merge | 维持 ADR 0003（`store.create`） |
| 专用扩展袋（如 `meta`） | **本期不落地；形状待定** |

---

## 参考

- [ADR 0003 §5 adapter → store.create](./0003-reactive-layer-config.md)
- [DESIGN.md 核心管线](../../DESIGN.md)
- [`src/config/fragment.ts`](../../src/config/fragment.ts) / [`node.ts`](../../src/config/node.ts) / [`bind-layer.ts`](../../src/config/bind-layer.ts)
