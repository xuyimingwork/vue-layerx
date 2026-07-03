# ADR 0002：`useX` / `open` 覆盖 `container.component`（仅 split 工厂）

- **状态**：讨论中（Proposed）
- **日期**：2026-06-29
- **关联**：[ADR 0001](./0001-legacy-monolith-progressive-adoption.md) — **`createLayerUnited` 实例不适用本文**（禁止 container 块与换壳）

---

## 背景

[`DESIGN.md`](../../DESIGN.md) 已约定 **split 工厂**下 **`open` 可覆盖 `container.component`**（merge 最高 tier，仍走该实例工厂的 `adapter`），并标注为 **进阶能力**。

[ADR 0001 第七轮](./0001-legacy-monolith-progressive-adoption.md) 定稿：**united 工厂不允许** `use`/`open` 的 `container` 配置，也不允许运行时换 container；迁移只能 **换 `useDialog` 工厂**。本文 **仅讨论 split**（`createLayer(BaseDialog)` 等）。

---

## 现有 merge 事实

```text
mergeFragment(create, define:template, define, use:template, use, open)
```

`container.component`：后出现的 tier **覆盖**先前的 component 字段。

---

## 待决问题（split only）

### Q1：`useX` 是否允许 `container.component`？

**倾向**：**允许 + dev warn**（与 merge 实现一致）；`open` 覆盖 `use` 时 silent。

### Q2：`open` 覆盖 `container.component`

**倾向**：**允许**（advanced）；adapter 负责 slot/model 差异；文档 marked advanced。

### Q3：adapter 与运行时覆盖

**倾向**：split **保持现状**——adapter 在 merge 之后，可改回 `open` 写入的 component。

### Q4：类型

- split 的 `LayerConfigInstance` 保留 `container?: { component?: Component }`。
- united 使用 **`LayerConfigUnitedInstance`**（无 `container`）——见 ADR 0001。

---

## 与 ADR 0001 的边界

| 主题 | ADR |
|------|-----|
| united pipeline、fold、禁止 container / define | **0001** |
| split 下 **`container.component` 运行时覆盖** | **0002（本文）** |

---

## 决策记录

| 项 | 结论 | 置信度 |
|----|------|--------|
| united 实例适用本文 | **否**（已定稿于 0001） | 高 |
| split：`useX` 换 component | 允许 + dev warn | 中 |
| split：`open` 换 component | 允许（advanced） | 中 |
| adapter 改回 open 的 component | split 保持现状 | 中 |

---

## 参考

- [DESIGN.md § open 换 container.component](../../DESIGN.md)
- [ADR 0001 § 第七轮](./0001-legacy-monolith-progressive-adoption.md)
