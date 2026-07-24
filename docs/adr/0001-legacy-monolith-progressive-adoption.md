# ADR 0001：存量单体弹窗（UserDialog）渐进式接入

- **状态**：Accepted（已实现：公开 `LayerNoContainer`）
- **日期**：2026-06-29（叙事边界澄清：2026-07-19）
- **关联**：[ADR 0002](./0002-open-use-override-container-component.md)（`use` / `open` 覆盖 `container.component`，可与 `LayerNoContainer` 组合）；[ADR 0007](./0007-static-define-via-define-options.md)（`defineOptions` 静态 define，**Deferred**）

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
| **`LayerNoContainer`** | 标记「无外层 Dialog 壳」；与普通壳同构（Teleport + default 锚点），并把 `container.props` 投影到 content |
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

### 2. 同构透明壳 + props 投影

`container.component === LayerNoContainer` 时**不**改成另一棵树，仍走：

```ts
h(LayerNoContainer, {}, {
  default: () => h('layer-content-to', …),  // 锚点
})
// + Teleport → h(content, { ...container.props, ...content.props, key })
```

- 与 `ElDialog` / `ElDrawer` **同一 Teleport 树形**，故 `defineLayer` / `open` 事后换成 `LayerNoContainer` 时可走 ADR 0002 的 park，**不必 remount content**。
- `LayerNoContainer` 只透传 default slot（`inheritAttrs: false`，壳上不挂 model）；`modelValue`、create 默认 title/width 等经 **props 投影**落到 content（content 覆盖 container）。
- 正常用法不要在 `content.props` 里传 `modelValue`（否则会盖掉框架可见性；视为故意覆盖）。
- `container.slots`（含 container 侧 `LayerTemplate`）挂在透明壳上，**无有效 UI**（与「无外层 Dialog」一致）。

### 3. 角色与迁移

- 单体 **`UserDialog` 始终作为 content**。
- L3：拆成 `UserForm` 后从 `withDialog` 表去掉即可，**不必换工厂**；`open({ props })` 可不动。
- 可选：L3 再上 `defineLayer` / container `LayerTemplate`。

### 4. 叙事边界（与「无 content」拆开）

域上 **content 可空、container 不可空**：二者不是对称概念。下面两套叙事**不得混用**。

| 叙事 | 含义 | 推荐写法 |
|------|------|----------|
| **壳-only** | `useX()` 未绑 Content；层合法，只是没有业务体 | 配壳用 `open` / `use` 的 **`container:`**（content 取向 flat 顶层进 content 列；无 `content.component` 时该列配置丢弃） |
| **单体接入** | 内嵌 dialog 的存量组件 | **`LayerNoContainer` + 单体做 content**（或 `createLayer(BaseDialog)` + adapter 换成 NoContainer） |

因此：

- **无 content ≠ 单体场景。** 壳-only 是 split 下的兼容用法，不是「把单体放进 container、视 content 不存在」。
- **单体不要当 `createLayer` 第一参。** 那样仍把单体当「壳」走 split，角色与 L3「单体 = content」相反；应 `LayerNoContainer` + 单体 content。
- **props 投影不是对称先例。** `LayerNoContainer` 将 `container.props`（含 create 默认与 bind 的 `model`）摊到 content，是为了混用工厂与可见性协议在无 Dialog 壳时仍成立；**不**据此要求「无 content 时把 content 列配置摊到 container」。
- **不做 `LayerNoContent`。** 不为「content 列配置落到 container vnode」提供反向标记；壳-only 显式写 `container:` 即可。

### 5. 曾考虑后否决

| 方案 | 结论 |
|------|------|
| **`createLayerUnited` 双工厂** | 否决——薄封装无实质收益，且引入 United 词汇 |
| 独立 united merge/bind 管线 | 否决——复用 split 管线即可 |
| 不公开标记、仅内部哨兵 | 否决——项目 adapter 无法换壳，无法共用 `useLayer` |
| 单体作 container | 否决——L3 角色反了；亦非壳-only 的正确建模 |
| **`LayerNoContent` / 反向投影** | 否决——与壳-only / 单体两套叙事混淆；壳配置已有 `container:`；无「管线写在 content 却必须喂壳」的对等负担 |

---

## 能力边界

### 支持

- 与 split 相同的 `open` / `close` / `closeOn` / portal / `bindHost` / `LayerAdapter`
- 同一 `useLayer` 混用单体 content 与拆分 content（项目 `withDialog` + adapter）
- content 侧 `LayerTemplate :to="instance"`（注册到 content slots）
- 壳-only（无 Content）：实例可 open/close；壳 props / slots 经 **`container:`** 写入

### 弱化 / 无效（用错自负）

| 项 | 说明 |
|----|------|
| `defineLayer` 改 container props | 透明壳无 Dialog UI 可挂；页内/误用时行为与「无有效壳」一致 |
| `LayerTemplate` `container` | 透明壳不渲染有意义的 container slots |
| `content.props.modelValue` | 会覆盖 bind 投影 |
| 壳-only 时顶层 `open({ props })` | 进 content 列；无 `content.component` 时丢弃——应改 `container: { props }` |
| `createLayer(单体Dialog)` 当「无 content 单体」 | 非本 ADR 路径；应改 NoContainer + 单体 content |

---

## 运行时

```text
merge → adapt（可把 container.component 换成 LayerNoContainer）
     → refs → bind → createLayerViewVNode
                      └ 同构 h(container)+Teleport(content)；
                        NoContainer 时 props 投影到 content
```

---

## 后果

### 正面

- 一个 `createLayer` + 可选 adapter，存量与目标态共用调用方 API。
- 无第二套类型 / 工厂。
- 实现为 `LayerNoContainer` 透明壳 + props 投影（与真壳同 Teleport 树）。

### 限制

- `withDialog`（或等价标记）由**项目**维护。
- 透明壳下 container 侧模板 / define 壳 UI 无意义。
- 壳-only 与单体接入是两套叙事；无 `LayerNoContent`，不为 content→container 做对称投影。
- 壳-only 与单体接入是两套叙事；无 `LayerNoContent`，不为 content→container 做对称投影。

---

## 参考

- [DESIGN.md](../../DESIGN.md)
- [`src/runtime/layer-no-container.ts`](../../src/runtime/layer-no-container.ts)
- [`src/runtime/layer-view.ts`](../../src/runtime/layer-view.ts)
- [ADR 0002](./0002-open-use-override-container-component.md)
