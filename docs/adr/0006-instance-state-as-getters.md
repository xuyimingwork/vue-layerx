# ADR 0006：`LayerInstance` 状态字段用只读 getter（`visible` / `content` / `container`）

- **状态**：Accepted（已实现）
- **日期**：2026-07-22
- **关联**：[DESIGN.md](../../DESIGN.md) `LayerInstance`；[`LayerInstance`](../../src/types/instance.ts)；[ADR 0005](./0005-content-self-contained-close-on.md)（实例 vs define 分工）

---

## 背景

`LayerInstance`（`useLayer` / `clone` 返回值）会整份传给 `LayerTemplate :to`，也会被用户挂在变量上命令式调用：

```ts
const dialog = useDialog(Form)
// 模板
<LayerTemplate :to="dialog" name="footer" />
// 脚本
dialog.open()
dialog.visible
dialog.content
```

实例是**完整对象**这条路径是一等公民。历史上 `visible` / `contentRef` / `containerRef` 曾以 `ComputedRef` 暴露（beta.4），读法变成 `dialog.visible.value`，并自然诱导：

```ts
const { visible, contentRef } = dialog
watch(visible, …)
```

这与「不要解构实例、始终带着整对象」的用法打架。`*Ref` 后缀还暗示 Vue `Ref`，与「直接取值的 getter」进一步冲突。

---

## 问题

状态字段怎么暴露，才能同时满足：

1. 属性访问有响应式（模板 / `computed` / `watchEffect`）
2. 不鼓励解构实例
3. 与 `:to="dialog"` 的整对象心智一致
4. 开闭语义仍只走 `open` / `close` / `confirm`（不提供可写 `visible`）
5. 命名不暗示 Vue `Ref`

---

## 备选

| | A. `ComputedRef`（beta.4） | B. 只读 getter + 保留 `*Ref` 名 | C. 只读 getter + 改名 `content` / `container` |
|--|---------------------------|--------------------------------|-----------------------------------------------|
| 读法 | `dialog.visible.value` | `dialog.visible` | `dialog.visible` / `dialog.content` |
| 模板嵌套 | 仍要 `.value` | 直接值 | 直接值 |
| `watch` | `watch(dialog.visible)` | `watch(() => dialog.visible)` | 同左 |
| 解构 | 仍是 Ref，易拆着用 | 快照丢失响应 | 同左 |
| 命名 | 与 Ref 一致 | 名像 Ref、形不是 | 与 content/container 模型同词 |

（另议：`reactive` 包整实例——整对象进 proxy，`:to` / 方法面多余代理，不取。）

---

## 决策

### 1. 取 C：只读 getter，字段为 `visible` / `content` / `container`

```ts
get visible() {
  return state.visible
}
get content() {
  return state.visible ? contentEl.value : null
}
get container() {
  return state.visible ? containerEl.value : null
}
```

在渲染 / `computed` / `watchEffect` 里访问 `dialog.visible` 时，getter 读到内部 `reactive` / `shallowRef`，依赖照常建立。**响应式靠的是读路径上的响应式源，不是 `.value` 语法。**

弃用公开名 `contentRef` / `containerRef`：beta 阶段允许再 breaking；`dialog.content` 是组件实例，不是配置里的 `container:` 节点。

### 2. 观测统一为 getter 源

```ts
watch(() => dialog.visible, …)
watch(() => dialog.content, …)
```

### 3. 不提供 `visible` setter

`dialog.visible = false` 看似无参 `close()` 快捷方式，但：

- 与 `visible = true` 不对称（`open` 常带 config）
- `close` 在 `confirm()` 流程里需要 `source` / `confirmed` / `args`，setter 表达不了
- 开闭两套入口会增加选择成本

开闭只保留 `open` / `close` / `confirm`。

### 4. 相对 beta.4 的 breaking

| | beta.4 | 本决策 |
|--|--------|--------|
| 字段 | `visible` / `contentRef` / `containerRef` | `visible` / `content` / `container` |
| 类型 | `ComputedRef<…>` | `boolean` / `ComponentPublicInstance \| null` |
| 读 | `dialog.visible.value` | `dialog.visible` |
| watch | `watch(dialog.visible)` | `watch(() => dialog.visible)` |

---

## 后果

- 文档与示例统一写成 `dialog.visible` / `dialog.content`，并写明 watch 用 `() => …`。
- 用户若解构 `const { visible } = dialog` 会失去响应式——与「整对象传递」一致，视为反模式而非要兼容的用法。
- 不能把这些字段再当 `Ref` 传给只接受 Ref 的 API；需要时自行 `computed(() => dialog.visible)`。
