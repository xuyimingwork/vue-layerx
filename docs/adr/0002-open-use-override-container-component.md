# ADR 0002：`useX` / `open` 覆盖 `container.component`

- **状态**：Accepted（已实现：merge 后写覆盖，无 warn）
- **日期**：2026-06-29
- **定稿**：2026-07-15
- **关联**：[ADR 0001](./0001-legacy-monolith-progressive-adoption.md)（可用 `LayerNoContainer` 作为覆盖目标）

---

## 背景

[`DESIGN.md`](../../DESIGN.md) 已约定 **`open` 可覆盖 `container.component`**（merge 最高 tier，仍走该实例工厂的 `adapter`），并标注为 **进阶能力**。

[ADR 0001](./0001-legacy-monolith-progressive-adoption.md) 定稿：存量单体通过把 `container.component` 换成 **`LayerNoContainer`**（透明壳 + props 投影；常见于项目 **adapter** 按 content 组件切换）；也允许在 `use` / `open` 显式传入。

需钉死：`use` / `open` 是否允许写 `container.component`、是否 warn、与 adapter 的先后关系。

---

## 现有 merge 事实

```text
mergeFragment(create, define:template, define, use:template, use, open)
```

`container.component`：后出现的 tier **覆盖**先前的 component 字段——与 `props` / `slots` / `model` 等同一规则。

---

## 决策

### 1. `useX` / `open` 均可覆盖 `container.component`

| API | 结论 |
|-----|------|
| `useX(Content, { container: { component } })` | **允许**；合法用法，**无** dev warn |
| `open({ container: { component } })` | **允许**（进阶）；**无** warn |

与其它配置字段同一 merge 语义；不为 `component` 单独加警告。`open` 覆盖 `use` 时 silent（后写覆盖）。

换壳后的 slot 名、`model` 协议等差异由用户在 **adapter** 或分工厂处理；框架不替用户适配。

覆盖为 `LayerNoContainer` 时走 [ADR 0001](./0001-legacy-monolith-progressive-adoption.md) 透明壳 + props 投影。

### 2. adapter 在 merge 之后

```text
merge → adapter(fragment) → refs → bind → render
```

adapter 可改回或再次改写 `use` / `open` 写入的 `container.component`（含换成 `LayerNoContainer`）。运行时覆盖进入 merge，**不跳过**该实例工厂的 adapter。

### 3. 类型

`LayerConfigContent` 保留 `container?: { component?: Component }`（含 `LayerNoContainer`）。

---

## 否决：`use` 换 component 时 dev warn

曾考虑「允许 + warn」以提示非常规换壳。否决原因：

- 类型与 merge 已把它当作一等字段；单独 warn 不一致
- 合法场景多（单实例换壳、显式 `LayerNoContainer`、个别页 Drawer）
- 与 `open` 静默不对齐；真风险靠 adapter / 分工厂，不靠 warn

---

## 与 ADR 0001 的边界

| 主题 | ADR |
|------|-----|
| `LayerNoContainer` 透明壳 / props 投影、共用 `useLayer` | **0001** |
| **`container.component` 在 use/open 的覆盖策略** | **0002（本文）** |

---

## 决策记录

| 项 | 结论 |
|----|------|
| `useX` 换 `container.component` | 允许，无 warn |
| `open` 换 `container.component` | 允许（进阶），无 warn |
| 可换成 `LayerNoContainer` | 是（ADR 0001） |
| adapter 改回 / 再改 merge 后的 component | 保持：merge 后跑工厂 adapter |
| 类型 | `LayerConfigContent.container?.component` |

---

## 参考

- [DESIGN.md](../../DESIGN.md)
- [ADR 0001](./0001-legacy-monolith-progressive-adoption.md)
- 集成测试：`tests/integration/layer-config.test.ts`（`component override`）
