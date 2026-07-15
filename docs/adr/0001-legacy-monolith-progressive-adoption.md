# ADR 0001：存量单体弹窗（UserDialog）渐进式接入

- **状态**：Accepted（已实现：公开 `LayerNoContainer`）
- **日期**：2026-06-29
- **关联**：[ADR 0002](./0002-open-use-override-container-component.md)（`use` / `open` 覆盖 `container.component`，可与 `LayerNoContainer` 组合）

---

## 背景

vue-layerx 的目标态是 **container + content** 分离：

```text
UserDialog（逻辑组合体）= BaseDialog + UserForm
```

存量项目里常见 **`UserDialog.vue` 内嵌 `<el-dialog>`**，短期内难以拆文件；调用方往往只需 `open()` / `close()`。

**问题**：如何让单体 `UserDialog` 与拆分后的 `UserForm` **共用同一 `useLayer`**，且 `open({ props })` 尽量不变？

### 现有约束（split）

```text
h(container, { modelValue: visible, … }, { default: () => h(content) })
```

merge 优先级：`open > use > define > create`（[`DESIGN.md`](../../DESIGN.md)）。

---

## 决策

### 1. 公开 `LayerNoContainer`，不另做 `createLayerUnited`

| API | 用途 |
|-----|------|
| **`LayerNoContainer`** | 标记「无外层壳」；`createLayerViewVNode` 遇此组件则拍平为 `h(content)` |
| **`createLayer(BaseDialog)`** | 默认 split；项目 adapter 可对单体 content 换成 `LayerNoContainer` |

不引入第二套工厂 / `United*` 类型词：管线、`LayerAdapter`、配置域与 split 完全相同。

```ts
import { createLayer, LayerNoContainer } from 'vue-layerx'

function withDialog(component) {
  return component === UserDialog
}

export const useLayer = createLayer(BaseDialog, {
  props: { width: '480px' },
  adapter: (fragment) => {
    if (withDialog(fragment.content?.component)) {
      return {
        ...fragment,
        container: { ...fragment.container, component: LayerNoContainer },
      }
    }
    return fragment
  },
})

useLayer(UserDialog, { closeOn: ['success'] }).open({ props: { mode: 'edit' } })
useLayer(UserForm) // 仍走 BaseDialog
```

也可直接：

```ts
createLayer(LayerNoContainer, { props: { width: '480px' } })(UserDialog)
```

### 2. 拍平规则

`container.component === LayerNoContainer` 时：

```ts
h(content.component, {
  ...container.props, // 含 bind 的 model / onUpdate、create 默认 props
  ...content.props,   // content 覆盖（open > create 在拍平相遇）
  key: openId,
}, content.slots)
```

- 正常用法不要在 `content.props` 里传 `modelValue`（否则会盖掉框架可见性；视为故意覆盖）。
- `container.slots`（含 container 侧 `LayerTemplate`）在拍平路径不使用。

### 3. 角色与迁移

- 单体 **`UserDialog` 始终作为 content**。
- L3：拆成 `UserForm` 后从 `withDialog` 表去掉即可，**不必换工厂**；`open({ props })` 可不动。
- 可选：L3 再上 `defineLayer` / container `LayerTemplate`。

### 4. 曾考虑后否决

| 方案 | 结论 |
|------|------|
| **`createLayerUnited` 双工厂** | 否决——薄封装无实质收益，且引入 United 词汇 |
| 独立 united merge/bind 管线 | 否决——复用 split 管线即可 |
| 不公开标记、仅内部哨兵 | 否决——项目 adapter 无法换壳，无法共用 `useLayer` |
| 单体作 container | 否决——L3 角色反了 |

---

## 能力边界

### 支持

- 与 split 相同的 `open` / `close` / `closeOn` / portal / `bindHost` / `LayerAdapter`
- 同一 `useLayer` 混用单体 content 与拆分 content（项目 `withDialog` + adapter）
- content 侧 `LayerTemplate :to="instance"`（注册到 content slots）

### 弱化 / 无效（用错自负）

| 项 | 说明 |
|----|------|
| `defineLayer` 改 container | 拍平后无外壳可挂；页内/误用时行为与 split 一致（无有效壳） |
| `LayerTemplate` `container` | 拍平不渲染 container slots |
| `content.props.modelValue` | 会覆盖 bind 投影 |

---

## 运行时

```text
merge → adapt（可把 container.component 换成 LayerNoContainer）
     → refs → bind → createLayerViewVNode
                      └ LayerNoContainer？→ h(content) ：h(container, content)
```

---

## 后果

### 正面

- 一个 `createLayer` + 可选 adapter，存量与目标态共用调用方 API。
- 无第二套类型 / 工厂。
- 实现仅 `LayerNoContainer` + render 分支。

### 限制

- `withDialog`（或等价标记）由**项目**维护。
- 拍平路径下 container 侧模板 / define 壳配置无意义。

---

## 参考

- [DESIGN.md](../../DESIGN.md)
- [`src/runtime/layer-no-container.ts`](../../src/runtime/layer-no-container.ts)
- [`src/runtime/layer-view.ts`](../../src/runtime/layer-view.ts)
- [ADR 0002](./0002-open-use-override-container-component.md)
