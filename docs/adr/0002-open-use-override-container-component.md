# ADR 0002：`useX` / `open` 覆盖 `container.component`

- **状态**：讨论中（Proposed）
- **日期**：2026-06-29
- **关联**：[ADR 0001](./0001-legacy-monolith-progressive-adoption.md)（可用 `LayerNoContainer` 作为覆盖目标）

---

## 背景

[`DESIGN.md`](../../DESIGN.md) 已约定 **`open` 可覆盖 `container.component`**（merge 最高 tier，仍走该实例工厂的 `adapter`），并标注为 **进阶能力**。

[ADR 0001](./0001-legacy-monolith-progressive-adoption.md) 定稿：存量单体通过把 `container.component` 换成 **`LayerNoContainer`** 拍平（常见于项目 **adapter** 按 content 组件切换）；也允许在 `use` / `open` 显式传入。

---

## 现有 merge 事实

```text
mergeFragment(create, define:template, define, use:template, use, open)
```

`container.component`：后出现的 tier **覆盖**先前的 component 字段。

---

## 待决问题

### Q1：`useX` 是否允许 `container.component`？

**倾向**：**允许 + dev warn**（与 merge 实现一致）；`open` 覆盖 `use` 时 silent。

### Q2：`open` 覆盖 `container.component`

**倾向**：**允许**（advanced）；adapter 负责 slot/model 差异；文档 marked advanced。覆盖为 `LayerNoContainer` 时走 ADR 0001 拍平。

### Q3：adapter 与运行时覆盖

**倾向**：**保持现状**——adapter 在 merge 之后，可改回或再次改写 `open` 写入的 component（含换成 `LayerNoContainer`）。

### Q4：类型

- `LayerConfigContent` 保留 `container?: { component?: Component }`（含 `LayerNoContainer`）。

---

## 与 ADR 0001 的边界

| 主题 | ADR |
|------|-----|
| `LayerNoContainer` 拍平语义、共用 `useLayer` | **0001** |
| **`container.component` 在 use/open 的覆盖策略与 warn** | **0002（本文）** |

---

## 决策记录

| 项 | 结论 | 置信度 |
|----|------|--------|
| `useX` 换 component | 允许 + dev warn | 中 |
| `open` 换 component | 允许（advanced） | 中 |
| 可换成 `LayerNoContainer` | 是（ADR 0001） | 高 |
| adapter 改回 / 再改 open 的 component | 保持现状 | 中 |

---

## 参考

- [DESIGN.md](../../DESIGN.md)
- [ADR 0001](./0001-legacy-monolith-progressive-adoption.md)
