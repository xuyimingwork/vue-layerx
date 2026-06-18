# vue-layerx 设计文档

## 背景

业务弹窗通常是 **layer（容器）+ content（业务内容）** 的组合：

```
UserDialog = MyDialog + UserForm
```

痛点：

1. **content 与 layer 绑死** — UserForm 与某一种 Dialog 写在一起，换 Drawer 要复制或再拆。
2. **样板代码多** — 导入 Dialog、写 template、维护 `visible`，而业务上往往只想「把表单放进弹层展示」。

---

## 设计目标

| 角色 | 目标 |
|------|------|
| **content（UserForm）** | 可复用于页内与弹层；只依赖 `vue-layerx`，不依赖 `useDialog` |
| **layer（MyDialog）** | 通过 `createLayer` 适配，项目内类型有限 |
| **定义侧** | co-locate 默认 layer 配置与操作区模板 |
| **使用侧** | 不写 layer template、不声明 `visible`，`show()` / `hide()` 即可 |
| **框架** | 命名模板注册 + 配置 merge + 容器适配 |

### 命名约定

| 范围 | 约定 |
|------|------|
| **npm 包 / 项目名** | `vue-layerx`（保留 `x`，不变） |
| **import 路径** | `'vue-layerx'` |
| **公共 API / 类型** | 统一用 `Layer`，**不带 `x`**：`createLayer`、`defineLayer`、`LayerTemplate`、`LayerInstance` 等 |
| **兼容性** | 不考虑旧 `*Layerx*` API 名称；实现与文档以本节为准 |

---

## 核心管线

每次 `show()`：**重建 content 子树**（setup 再跑，`defineLayer` / `LayerTemplate` 在当次上下文中重新注册），再执行：

```text
① merge      show > useX > defineLayer > createLayer(defaults)  →  LayerMerged
② resolve    defaultResolve(merged)  →  LayerNormalized
③ adapt      该实例工厂的 createLayer 第 3 参（可选）(normalized) => LayerNormalized
④ render     toRenderPlan(normalized)  →  h(...)
```

- **merge**：各层贡献 **LayerNodeConfig 片段**（`content` / `layer`）与 `hideOn`；优先级固定。`containerTemplates` / `contentTemplates` **不经 merge**，按 **`LayerTemplate` 路由**（无 `to` → container 链，有 `to` → content 链），在 resolve 读取（见「渲染与投递机制」）。
- **resolve**：先物化 `containerTemplates` / `contentTemplates` 为 `normalized.container.slots` / `normalized.content.slots`；再用 merge 阶段已按优先级合并好的**命令式** `container.slots` / `content.slots`（`SlotRenderFn`）**同 key 覆盖**物化结果；`hideOn` 接入 content 事件；产出 **LayerNormalized**。
- **adapt**：在 **LayerNormalized** 上整形（滤 props、搬移 / 重命名 `container.slots` 的 key、**可改 `container.component`** 等）；`show` 已反映在入参中。实例由哪个工厂创建，就跑该工厂 `createLayer` 注册时的**那一个** `adapt`（不按 `show` 里的 `container.component` 动态换 adapt）。
- **render**：内部附加 `visible` 等协议后 `h()`；content 由框架托管渲染，**每次 `show()` 强制 remount**（见「渲染与投递机制」）。

使用者配置 **片段** 在 merge 汇入；**收归为可渲染形态** 在 Normalized（adapt 所见即此）。

`show` 可覆盖 merge 输入（含 `component`、`container.component`），但**不跳过 adapt**——仍走 merge → resolve → adapt → render；adapt 可改回或替换 `container.component`。

---

## 渲染与投递机制

### show() 与 content 重建

UserForm 等业务 content **不由业务 template 直接挂进 MyDialog**，而由 vue-layerx 在 `render` 阶段 `h(content, …)` 托管。每次 `show()`（含弹层已打开时再次 `show`）须**强制重建 content 子树**（如变更 `:key` 触发 remount），保证：

- content `setup` 重跑，`defineLayer` 在当次 `show` payload 的 props 上下文求值；
- `LayerTemplate` 在当次上下文中重新 self-register；
- 弹层**已打开期间**，UserList 等父级响应式变化**不自动同步**进弹层（`show` payload 为当次快照）。

### 跨树 slot 投递（render fn）

`LayerTemplate` 在 mount 时向实例注册表写入 `{ name, render }`；**resolve 阶段物化为 `SlotRenderFn`**，由框架在 `h(container, props, slots)` / `h(content, props, slots)` 时传入。四段渲染顺序：

```text
① merge / resolve / adapt   合并配置，物化模板为 slot render fn
② render layer              h(MyDialog, …) 挂载（通常 appendToBody 至 body）
③ render content            UserForm 作为 layer default slot（每次 show remount）
④ slot fn 调用              LayerTemplate.render() 产出 VNode
```

`containerTemplates` / `contentTemplates` 在组件 mount 时写入实例注册表；**resolve 阶段读取**后物化为 `SlotRenderFn`。首次打开若模板尚未 register，对应 slot 为空；模板 mount 后 `bumpSlots` 触发重渲染即可。

### `LayerTemplate :to` 与实例绑定

- `LayerTemplate :to="userDialog"` 绑定 `LayerInstance`，写入该实例的 **`contentTemplates` 注册表**（`:to` 隔离，clone 实例各自独立）。
- 带 `:to` 的 `LayerTemplate` 声明在 UserList 的 template 中，layer 渲染在 body portal；跨树靠 **实例注册表 + slot render fn** 投递，不经过 merge。
- 无 `:to` 的 `LayerTemplate`（UserForm 内）写入实例的 **`containerTemplates`**，resolve 时物化后作为 MyDialog 的 slot fn 传入。

### defineLayer 与 inject

`defineLayer` 使用**全局单一 inject key**（不绑定 `useDialog` / `useDrawer` 等具体工厂）。仅在 **direct layer content** 上下文（框架托管 render 的 content 根）内 register 进 merge；页内单独渲染 UserForm 时为 no-op。

### 挂载与 SSR

layer 默认挂载至 `document.body`（或由 layer 组件 `appendToBody` 等 props 决定）。**暂不考虑 SSR**。

---

## 类型与术语

### 配置期与渲染期

渲染一个组件只有三部分：**component**、**props**（Vue 3 含 `onXxx` 事件）、**slots**。  
配置期与渲染期类型不同：

```ts
type SlotRenderFn = (props?: Record<string, unknown>) => VNode | VNode[] | null

/** merge 片段：content / container 同构 */
type LayerNodeConfig = {
  component?: Component
  props?: Record<string, unknown>
  /** 极少：命令式直出插槽（defineLayer / show）；常规由 LayerTemplate 注册 */
  slots?: Record<string, SlotRenderFn>
}

/** merge 完成后（仅配置片段；模板注册表在 LayerInstance 运行时状态，不经 merge） */
type LayerMerged = {
  content: LayerNodeConfig
  container: LayerNodeConfig
  hideOn?: string[]
}

/** resolve / adapt 后：可交给 h() 的节点 */
type LayerNodeNormalized = {
  component: Component
  props: Record<string, unknown>
  slots: Record<string, SlotRenderFn>
}

type LayerNormalized = {
  content: LayerNodeNormalized
  container: LayerNodeNormalized
}

/** 内部：adapt 之后，附加 visible 协议等 */
type LayerRenderPlan = LayerNormalized & {
  visible: boolean
  visibleProp: string
  visibleEvent: string
  onHide: () => void
}
```

| 术语 | 含义 |
|------|------|
| **container** | 外层容器，如 `MyDialog` |
| **content** | 内层业务组件，如 `UserForm` |
| **UserDialog** | `useDialog(UserForm)` 构建的逻辑组合体：`MyDialog` + `UserForm` |
| **Layer 实例** | `useDialog(UserForm)` 返回值 `{ show, hide, clone, visible }` |
| **模板名 / 插槽名** | `LayerTemplate` 的 `name`，与目标组件 slot 同名，如 `title`、`footer` |
| **direct layer content** | `useX` / `show` 绑定的根 content 组件；仅其内部的 `LayerTemplate` 进外层 MyDialog |

### 工厂默认配置

```ts
type LayerFactoryDefaults = {
  /** [visibleProp, visibleEvent]，如 ['modelValue', 'onUpdate:modelValue'] */
  visible?: [prop: string, event: string]
  content?: LayerNodeConfig
  container?: LayerNodeConfig
}
```

**`visible` 协议**：仅支持通过 **prop + 对应 update 事件** 控制显隐（`createLayer` 第 2 参 `visible` 元组）。非 prop/event 模型（如纯方法、自定义指令）的 layer 组件**不在框架范围内**；使用者须先封装一层，对外暴露 `modelValue` / `onUpdate:modelValue`（或工厂里声明的 prop/event 对）。

---

## 命名模板与插槽填充

`LayerTemplate` 只做一件事：**声明一块有名字的模板**（等同 Vue 的 `<template #name>`），在所属 Scope 内 self-register，无需 `ref`。

### 与 Vue slot 同构

```vue
<!-- Vue：父组件提供具名模板 -->
<MyDialog>
  <template #title>ABC</template>
</MyDialog>
```

```vue
<!-- vue-layerx：content 内声明，resolve 后作为 layer 的 slots 传给 h() -->
<LayerTemplate name="title">ABC</LayerTemplate>
```

规则与 Vue 一致：

1. **`LayerTemplate name="title"`** 即提供了名为 `title` 的模板。
2. resolve 后写入 `normalized.container.slots.title`（或 `normalized.content.slots.title`）。
3. **目标组件有没有同名 `<slot name="title">`** 决定最终是否渲染——有则展示，无则静默丢弃。
4. content 里有没有预留 `<slot name="title">` 对 **container 侧**模板不重要；container 侧只看 MyDialog 有没有 `#title`。

不需要额外的「名表」或「物理插槽 ← 逻辑名」映射。**`name` 就是 slot 名。**

容器插槽名与 content 作者命名不一致时（如 Dialog 用 `title`、Drawer 用 `header`），在 **`adapt` 里改 `normalized.container.slots` 的 key**（搬移 / 重命名 `SlotRenderFn`），而不是在 merge 层维护映射表。

### 路由规则

| 用法 | 填充目标 | 说明 |
|------|----------|------|
| **UserForm 内**（无 `to`，弹层 direct content 上下文） | **MyDialog 的 slot** | `name` 须与 layer 组件 slot 同名（或经 `adapt` 对齐） |
| **UserList `LayerTemplate :to`** | **UserForm 的 `<slot>`** | `name` 须与 content 组件 slot 同名 |

纯字符串标题仍用 `defineLayer` / `container.props.title`；富标题区用 **`LayerTemplate name="title"`**（当 MyDialog 提供 `#title` 时）。

### `LayerTemplate`

```vue
<ElForm>...</ElForm>
<slot name="form-end" />

<LayerTemplate name="title" />
<!-- ... -->
<LayerTemplate name="footer" visible-outside>
  <template #default="{ inLayer, outsideLayer, slotProps }">
    <ElButton type="primary" @click="submit">提交</ElButton>
    <slot name="action-end" />
    <ElButton @click="cancel">取消</ElButton>
  </template>
</LayerTemplate>
```

| 行为 | 说明 |
|------|------|
| **inLayer**（direct layer content 内，弹层打开） | 不占 SFC 原位置 DOM；经 slot render fn 作为 `normalized.container.slots[name]` 投进 **MyDialog** 同名 slot |
| **outsideLayer**（页内等非 direct layer content 上下文） | 默认不占 DOM、不投递；见 `visible-outside` |
| `visible-outside` | **仅在非 direct layer content 上下文生效**：在原 SFC 声明位置就地渲染，供页内复用。**inLayer 时忽略此配置**，仍走 slot render fn 投进 layer slot |
| `#default` 参数 | `inLayer` / `outsideLayer` 表示渲染上下文；`slotProps` 为同名 slot 的 scoped props 原样转发，默认 `{}`（container / content 链一致） |
| `:to` | 绑定 `LayerInstance`（`useDialog(UserForm)` 返回值），注册进 **contentTemplates**；远程填充 content 同名 `<slot>`，**不接 MyDialog 投递链** |

**调用方示例：**

```vue
<LayerTemplate :to="userDialog" name="header">
  <ElTag>调用方注入</ElTag>
</LayerTemplate>
```

### 路由边界

框架按 **`to` 有无** 分流，而非在同一池子里用优先级「覆盖」：

| 用法 | 投递链 | UserList 能否触及 |
|------|--------|-------------------|
| UserForm 内 `LayerTemplate`（无 `to`） | `normalized.container.slots` → **MyDialog** | 否 |
| `LayerTemplate :to="userDialog"` | `normalized.content.slots` → **UserForm** `<slot>` | 是 |

**与 Vue 相同，框架不持有、也不校验 slot 清单：**

- Vue 无法从子组件「读出」`defineSlots` / template 里有哪些 `<slot name>`；`useDialog(UserForm)` + `LayerTemplate :to` **同样做不到**按契约拦截 `name`。
- `:to` 下 `name="form-end"` 只会进入 `contentTemplates`，resolve 后作为 `h(UserForm, …, { 'form-end': fn })` 的 slot 传入；**UserForm 没有 `<slot name="form-end">` 就不展示**——与父组件写了 `<template #form-end>` 但子组件没开口一样，不是框架 warning，是静默无渲染。
- UserList 写 `name="footer"` 且带 `:to`，而 UserForm 只有 container 侧 `LayerTemplate name="footer"`、没有 `<slot name="footer">`：内容走 **content** 链，对不上口 → **不展示**；**换不掉** MyDialog 上的 layer footer（那条链 UserList 触及不到）。

`containerTemplates` 与 `contentTemplates` 是两张表、两条投递链，key 相同也互不覆盖。

同一注册域内（UserForm 内、带 `:to` 的调用方等）同名 `LayerTemplate` 重复注册：**dev warning**，**后者覆盖前者**。

**产品边界：** 不支持从 UserList 替换 UserForm 投进 MyDialog 的 layer 模板。调用方 **路由不到** container 链。

### Vue slot 与 vue-layerx 分工

| 机制 | 用途 |
|------|------|
| `LayerTemplate name="title"` / `footer` | 块级模板 → MyDialog 同名 slot |
| Vue `<slot name="action-end">` | 结构级：操作区内部扩展 |
| `LayerTemplate :to` + `name="action-end"` | 弹层下远程填充 content 同名 slot |

「保存」与「取消」**之间**插入按钮：UserForm 预留 Vue slot；vue-layerx 不负责块内顺序组合。

### 插槽投递

**container 侧**

1. UserForm 内 `LayerTemplate name="title"` → `containerTemplates['title']`。
2. **merge** 阶段：各层贡献的命令式 `container.slots` / `content.slots` 已按 `show` > `useX` > `defineLayer` > `createLayer` 合并进 `LayerMerged`。
3. **resolve** 阶段：`defaultResolve` 先物化模板（`normalized.container.slots.title = () => containerTemplates['title'].render()`，`contentTemplates` 同理），再用 `LayerMerged` 里合并好的命令式 slots **同 key 覆盖**物化结果。
4. `h(MyDialog, props, normalized.container.slots)`，slot fn 调用模板 `render()` — MyDialog 无 `#title` 则不展示。

**content 侧**

`LayerTemplate :to` + `name="form-end"` → `contentTemplates` → `normalized.content.slots.form-end`；UserForm 无 `<slot name="form-end">` 则不展示。

**容器差异**：非默认 slot 名对齐（Dialog `#title` vs Drawer `#header`）在工厂 **`adapt`** 中调整 `normalized.container.slots` 的 key，不在 merge 维护名表。

---

## 各方职责

| 层级 | 进入 merge？ | 职责 | 不做 |
|------|--------------|------|------|
| **createLayer 第 2 参** | ✅ 最低 | 工厂默认 `visible`、`layer` / `content` 片段 | 运行时覆盖 show |
| **defineLayer** | ✅ | content 贡献 `container.props`；极少用 `container.slots` 覆盖模板 | 选 `component`、适配容器 |
| **useX(Content, opts?)** | ✅ | 使用侧片段、`hideOn`、可绑 Content | 适配 MyDialog |
| **show(payload?)** | ✅ 最高 | 可覆盖 merge 一切，含 `component`、`container.component` | 绕过 adapt（仍须走 adapt；adapt 可改回 component） |
| **defaultResolve** | — | `LayerMerged` → `LayerNormalized` | 不参与优先级 |
| **createLayer 第 3 参 adapt** | — | `LayerNormalized` → `LayerNormalized` | 不实现 merge |
| **LayerTemplate**（UserForm 内，无 `to`） | containerTemplates（resolve 读取） | 注册 container 侧模板内容 | — |
| **LayerTemplate**（`:to` 绑定实例） | contentTemplates（resolve 读取） | 向 UserDialog content slot 注册模板 | 接入 layer 投递链；不经 merge |

### 绑定分层

| 层级 | 是否选容器 |
|------|------------|
| **UserForm** | 不应选；只 `import 'vue-layerx'` |
| **UserList** | 应选；`useDialog` / `useDrawer` 即 `createLayer` 产物 |

使用侧 `import { useDialog }` 是 **选择已注册工厂**，不是 content 式绑死。

**不导出 `useLayer`**：即便由框架统一入口，使用侧仍须传参决定用哪种 layer，与直接 `useDialog` / `useDrawer` 等价，类型与意图反而更弱。

### 双容器

无 `layerId`。同一 UserForm 适配 Dialog / Drawer：

- `defineLayer` 可写跨容器 props（如 `direction`、`width`）。
- **各自工厂**的 `adapt` 过滤无效 props，并按需 **重排 `normalized.container.slots` 的 key**（如 `title` → `header`）。

```ts
defineLayer({
  props: { title: '筛选', direction: 'rtl', width: '420px' },
})

// useDialog 的 adapt 去掉 direction；useDrawer 的 adapt 去掉 width
```

---

## 公共 API

框架导出：`createLayer`、`defineLayer`、`LayerTemplate`。  
应用层别名 `useDialog` / `useDrawer` 由项目 `createLayer` 注册，非框架内置。

### `createLayer(layer, defaults?, adapt?)`

注册容器，返回工厂（如 `useDialog`）。

```ts
type LayerAdapt = (normalized: LayerNormalized) => LayerNormalized

function createLayer(
  layer: Component,
  defaults?: LayerFactoryDefaults,
  adapt?: LayerAdapt,
): (Content?: Component, options?: LayerUsePayload) => LayerInstance
```

**第 1 参** `layer`：工厂默认容器（`defaultResolve` 用于补全 `normalized.container.component`）。

**第 2 参** `defaults`：最低优先级 merge 片段。

```ts
export const useDialog = createLayer(MyDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  container: {
    props: {
      width: '480px',
      destroyOnClose: true,
      appendToBody: true,
    },
  },
})
```

**第 3 参** `adapt`：可选；在 `defaultResolve` 之后执行。

```ts
export const useDialog = createLayer(
  MyDialog,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    container: { props: { width: '480px' } },
  },
  (normalized) => ({
    ...normalized,
    container: {
      ...normalized.container,
      props: omit(normalized.container.props, ['direction']),
    },
  }),
)
```

无 `adapt` 时：`normalized = defaultResolve(merged)`。

**API 形态**：固定三参 `(layer, defaults?, adapt?)`，实现简单、职责清晰；暂不提供 `createLayer(layer, fn)` 两参、`createLayer(fn)` 等重载糖。

### `defineLayer(options?)`（content.setup）

**content 侧声明被 layer 包裹时的默认配置**，与 Vue 的 `defineProps` / `defineEmits` 同级——全局 `defineXxx`，通过**全局 inject key** 注册，不挂具体容器工厂（见「渲染与投递机制」）。

```ts
const props = defineProps<{ mode?: 'create' | 'edit' }>()

defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
    direction: 'rtl',
  },
})
```

等价于向 merge 贡献 `{ container: { props: { ... } } }`。页内单独使用 content 时无效。

每次 `show()` 会**重建 content 子树**（等价于重新 mount，setup 再跑一遍），故 `defineLayer` 在当次 `show` 的 props 上下文中求值；`show({ props: { mode: 'edit' } })` 时 title 等可随 mode 变化。弹层**已打开期间**，列表页等父级响应式数据变化**不自动同步**进弹层（见 `show` 快照语义）。

**与 `LayerTemplate` 的分工：**

| 方式 | 典型用途 | 优先级 |
|------|----------|--------|
| `LayerTemplate name="footer"` | 声明 container 侧块级模板（`name` = MyDialog slot 名） | 默认 |
| `defineLayer({ container: { slots: { title: () => h(...) } } })` | 命令式覆盖同名 slot 渲染（少见） | **高于** `LayerTemplate` |

正常路径：**`LayerTemplate name` 与 container / content 的 slot 同名**。`defineLayer` 一般只写 `props`；需命令式覆盖时再写 `container.slots`。

```ts
type DefineLayerOptions = {
  /** 简写，等价于 container.props */
  props?: Record<string, unknown>
  container?: {
    props?: Record<string, unknown>
    /** 仅 defineLayer：直出渲染函数，覆盖 LayerTemplate */
    slots?: Record<string, SlotRenderFn>
  }
}
```

模板仅通过 `LayerTemplate name` self-register，不支持 `ref` 三连线。

### `useX(Content?, options?)` & `show(payload?)`

`useX` 由 `createLayer` 返回。`options` 与 `show` payload **同构**，形状为 **content 节点配置 + `container` + `hideOn`**：

```ts
/** 顶层字段即 content（LayerNodeConfig）；另附 container 与 hideOn */
type LayerUsePayload = LayerNodeConfig & {
  container?: LayerNodeConfig
  hideOn?: string[]
}
```

即 `{ component?, props?, slots? }` 描述 **content**；`container` 描述外层容器片段。`useX(UserForm, { props })` 中的 `props` 即 `content.props`。顶层 / `container.slots` 仅用于极少见的命令式 `SlotRenderFn`；常规插槽内容用 `LayerTemplate`。

常规：

```ts
const userDialog = useDialog(UserForm, {
  hideOn: ['success', 'cancel'],
})

userDialog.show({
  props: { mode: 'edit', recordId: 1 },
  container: { props: { title: '编辑用户' } },
})
```

极端（一切在 `show` 定义）：

```ts
const xxx = useDialog()

xxx.show({
  component: UserForm,
  props: { mode: 'create' },
  container: {
    component: MyDialog,
    props: {
      width: '480px',
      destroyOnClose: true,
      appendToBody: true,
    },
  },
})
```

`show` 可改 `container.component`；merge → resolve 后仍走**创建该实例的工厂**所注册的 `adapt`（如 `useDialog` 的 adapt）。`adapt` 收到完整 `LayerNormalized`，**可改回或改成别的 `container.component`**，以 adapt 返回为准。常规双容器仍推荐 `useDialog` / `useDrawer` 分工厂。

**`show` 换 `container.component`** 属进阶能力：框架只提供 merge + adapt 钩子，**不替用户处理**容器差异（slot 名、visible 协议等）；非常规需求下用户须在 `adapt` 内自行处理，或对默认 Layer 做二次封装。

`useX()` **可不传 Content**——实例、`show` / `hide` / `visible` 行为正常；未绑 Content 且 `show` 未传 `component` 时，layer 无 default content（空壳）。`show` 时传入 `component` 即可。

`show()` payload 为当次打开快照；弹层打开后，**父组件（如 UserList）侧**响应式数据变化不自动同步进已打开的弹层（content remount 语义见「渲染与投递机制」）。

### `LayerTemplate`

见上文。调用方远程填充 content slot 时须显式 `:to="userDialog"`（`useDialog` 返回的实例）。

### Layer 实例

```ts
interface LayerInstance {
  show(payload?: LayerUsePayload): void
  hide(): void
  clone(partial?: LayerUsePayload): LayerInstance
  readonly visible: boolean
}
```

### `clone(partial?)`

`clone` 从当前实例派生**新实例**（独立 `visible`、独立 `show`/`hide`），继承父实例的 **content 绑定**与 **`useX` 时的 options**；`partial` 写入该克隆的**实例级 defaults**，在后续每次 `show` 的 merge 中生效。

克隆实例 merge 优先级（在 `defineLayer`、`createLayer` 之上多一层 `partial`）：

```text
show > partial（clone 入参）> useX > defineLayer > createLayer(defaults)
```

- **`partial`**：仅 `clone(partial)` 时写入，对该克隆实例持久，直到再次被 `clone` 覆盖（无单独 API 改 partial）。
- **`useX`**：创建父实例时传入的 options（含 `hideOn`、默认 `props` / `container.props` 等）。
- 父实例某次 `show` 的 payload **不**继承给克隆；克隆只带 `useX` + 自己的 `partial`。
- 克隆与父实例**共享同一工厂**及其 `adapt`；**各自独立 `layerRuntime`**（独立挂载点，`show` / `hide` 互不影响 DOM）。

```ts
const base = useDialog(DetailContent, { hideOn: ['close'] })
const wide = base.clone({ container: { props: { width: '640px' } } })

wide.show({ props: { id: 1 } })
// merge：show.props > partial.container.props.width > useX.hideOn > …
```

---

## 配置 merge

### 优先级

常规实例（非 `clone` 派生）：

```text
show > useX > defineLayer > createLayer(defaults)
```

`clone` 派生实例见上文：`show > partial > useX > defineLayer > createLayer(defaults)`。

对 `content.*`、`container.*` 各字段分别 merge（浅合并 `props`；命令式 `slots`（`SlotRenderFn`）同 key 后者覆盖前者，结果写入 `LayerMerged.content.slots` / `LayerMerged.container.slots`，在 **resolve** 阶段覆盖模板物化结果）。

`containerTemplates` / `contentTemplates` **不参与**上述优先级链，由声明位置在 resolve 时先物化，再被 merge 好的命令式 slots 同 key 覆盖。

### merge 后字段来源示例

**container.props**（`defineLayer` 的顶层 `props` 简写 ≡ `container.props`）：

```text
createLayer.container.props
  → defineLayer（简写 props）
  → useX.container.props
  → show.container.props
```

**content.props**（`useX` / `show` 顶层 `props` 简写 ≡ `content.props`）：

```text
useX.props（useX 已绑 component 时）
  → show.props
```

`hideOn`：`useX` → `show`（后者覆盖）；`clone` 实例另插入 `partial`：`show` > `partial` > `useX`。`visible` 不参与 merge，由实例独占。

### `hideOn`（使用侧语法糖）

`hideOn` 只出现在 **`useX` / `show` payload**，不是 content 组件的 prop。框架在 **resolve** 阶段把它**改写**进 `normalized.content.props` 的事件监听（Vue 3 的 `onXxx`）。

```ts
useDialog(UserForm, { hideOn: ['success', 'cancel'] })
```

等价于在 content 上提供（示意）：

```ts
// resolve 后写入 normalized.content.props
{
  onSuccess: () => hide(),
  onCancel: () => hide(),
}
```

即 **`hideOn: ['success']` → `onSuccess: () => hide()`**（emit 名按 Vue 惯例转为 `on` + PascalCase）。

content 的 `onXxx` 由 vue-layerx 在 resolve 阶段**统一写入** `normalized.content.props`（业务组件内部无独立 listener 通道）。若 `show` / `useX` 的 `props` 与 `hideOn` 同名（如 `onSuccess`），resolve 时合并为单一 wrapper：**先调用用户 handler，再调用 `hide()`**；允许 handler 为 `async`——框架**不 await**，`hide()` 仍照常执行。

```ts
// resolve 后示意
onSuccess: (...args) => {
  userFn?.(...args)
  hide()
}
```

用户未传同名 `onXxx` 时，等价于 `onSuccess: () => hide()`。

`hideOn` 与 `defineLayer`、 `LayerTemplate` 无关；校验失败时不 emit 对应事件，故不会触发 `hideOn`。

### adapt 与 show

`show` 写入的 `container.component`、`container.props` 等 **先 merge → resolve → adapt**（始终为该实例所属工厂的**唯一** `adapt`）。容器 slot 名差异、换 `container.component` 等均在 **adapt** 内处理；adapt 返回值即最终 `LayerNormalized`。

---

## 类型提示（可选）

框架**能**从 `createLayer` 推导 `container.props`、从 content 组件推导 `props` / `emits`（进而约束 `hideOn`）。  
**不能**从 `UserForm` 自动读出有哪些 layer slot、content slot——与 Vue 父组件无法自省子组件 slot 开口一样。

`useX()` **未绑 Content** 时，layer 可正常显隐；`show({ component })` 传入 content 后类型推导生效。`props` / `container.props` 等**推不出则回落 `any`**（不为此做复杂条件类型）。

使用侧若写 `useDialog<UserFormLayer>(UserForm)`，其中的 `UserFormLayer` 只能是 **content 作者手写** 的辅助类型（文档 / IDE），框架运行时**不读取**：

```ts
/** 可选：仅用于 props / emits / hideOn 类型提示 */
export interface UserFormLayer {
  props: { mode?: 'create' | 'edit'; recordId?: number }
  emits: 'success' | 'cancel'
}
```

```ts
const userDialog = useDialog<UserFormLayer>(UserForm, {
  hideOn: ['success', 'cancel'],
})

userDialog.show({
  props: { mode: 'edit' },
  container: { props: { title: '编辑' } },
})
```

| 字段 | 类型来源 |
|------|----------|
| `props` | content 组件 / `UserFormLayer` |
| `container.props` | `createLayer` 注册的 `MyDialog` props |
| `hideOn` | `UserFormLayer.emits`（手写泛型时） |
| `LayerTemplate` 的 `name` / `:to` | **无框架类型**；须对照 UserForm 模板与 MyDialog 文档，与 Vue 使用 slot 相同 |

---

## 关闭行为

| 触发方式 | 行为 |
|----------|------|
| `hideOn`（语法糖） | resolve 写入 `content.props.onXxx`（用户 handler 在前，`hide()` 在后）；允许 async emit，框架不 await |
| layer 自带关闭 | 内部 `hide()` |
| `beforeClose` | 写在 `container.props`，经 merge/adapt **透传给底层 layer 组件**；属于容器自身行为，**框架不介入**，与 `hideOn` 无关 |
| 校验失败 | 不 emit 对应事件，不触发 `hideOn` |

---

## 架构图

```text
createLayer(MyDialog, defaults, adapt?)
        │
        ▼
useDialog / useDrawer
        │
        ├── defineLayer ──────────────┐
        ├── useDialog(UserForm, opts) ──┤──► merge ──┐
        └── show(payload) ──────────────┘            │
                                                     ├──► resolve ─► adapt ─► render
        LayerTemplate（UserForm 内）─── containerTemplates ─┘      ▲
        LayerTemplate :to（UserList）─── contentTemplates ──────┘
              （运行时注册，resolve 读取；不经 merge）
```

**渲染树（inLayer，slot render fn 投递后）：**

```text
MyDialog（normalized.container）
  ├─ #title ← slot fn ← UserForm 内 LayerTemplate name="title"
  ├─ default → UserForm（normalized.content，direct layer content）
  │              └─ #form-end ← slot fn ← LayerTemplate :to
  └─ #footer ← slot fn ← UserForm 内 LayerTemplate name="footer"
       └─ #action-end ← slot fn ← LayerTemplate :to
```

**页内复用（outsideLayer）：** 带 `visible-outside` 的 `LayerTemplate` 在 UserForm SFC 原位置渲染；无 `visible-outside` 的不占 DOM。inLayer 时 `visible-outside` 无效，footer 等仍通过 slot render fn 投进 MyDialog slot。

---

## 完整示例

### 应用级

```ts
export const useDialog = createLayer(
  MyDialog,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    container: { props: { width: '520px', destroyOnClose: true } },
  },
  (normalized) => ({
    ...normalized,
    container: {
      ...normalized.container,
      props: omit(normalized.container.props, ['direction']),
    },
  }),
)

export const useDrawer = createLayer(
  MyDrawer,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    container: { props: { size: '360px', direction: 'rtl' } },
  },
  (normalized) => {
    const { title, footer, ...rest } = normalized.container.slots
    return {
      ...normalized,
      container: {
        ...normalized.container,
        props: omit(normalized.container.props, ['width']),
        // Drawer 用 #header 而非 #title：在 adapt 搬移 slot fn
        slots: {
          ...rest,
          ...(title ? { header: title } : {}),
          ...(footer ? { footer } : {}),
        },
      },
    }
  },
)
```

### UserForm.vue

```vue
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{ mode?: 'create' | 'edit' }>()
const emit = defineEmits<{ success: []; cancel: [] }>()

defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
  },
})

function submit() { emit('success') }
function cancel() { emit('cancel') }
</script>

<template>
  <ElForm>...</ElForm>
  <slot name="form-end" />

  <LayerTemplate name="title" />

  <!-- visible-outside：页内时在表单下展示 footer；弹层内仍通过 slot fn 投进 MyDialog #footer -->
  <LayerTemplate name="footer" visible-outside>
    <template #default="{ inLayer, outsideLayer, slotProps }">
      <div :class="{ 'footer--inline': outsideLayer }">
        <ElButton type="primary" @click="submit">提交</ElButton>
        <slot name="action-end" />
        <ElButton @click="cancel">取消</ElButton>
      </div>
    </template>
  </LayerTemplate>
</template>
```

### UserList.vue

```vue
<script setup>
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '@/layers/dialog'
import UserForm from './UserForm.vue'

const userDialog = useDialog(UserForm, { hideOn: ['success', 'cancel'] })
</script>

<template>
  <ElButton @click="() => userDialog.show({ props: { mode: 'create' } })">
    新建
  </ElButton>

  <LayerTemplate :to="userDialog" name="form-end">
    <ElFormItem label="年龄"><ElInput v-model="age" /></ElFormItem>
  </LayerTemplate>
  <LayerTemplate :to="userDialog" name="action-end">
    <ElButton @click="print">打印</ElButton>
  </LayerTemplate>
</template>
```

### 双容器

```ts
defineLayer({
  props: { title: '筛选', width: '420px', direction: 'rtl' },
})

const filterDialog = useDialog(FilterForm, { hideOn: ['apply'] })
const filterDrawer = useDrawer(FilterForm, { hideOn: ['apply'] })
```

---

## 嵌套与边界

| 场景 | 行为 |
|------|------|
| content 页内使用 | `defineLayer` 无效；无 `visible-outside` 的 `LayerTemplate` 不占 DOM、不投递 |
| `visible-outside` | **仅 outsideLayer 生效**：在 SFC 原位置渲染；**inLayer 时忽略**，仍通过 slot render fn 投进 layer slot |
| `useX()` 无 Content | 实例正常；未 `show({ component })` 时 layer 无 content |
| 嵌套 content | 仅 **direct layer content**（`useX` / `show` 绑定的根组件）内的 `LayerTemplate` 进外层 MyDialog；内嵌子组件上的模板**不**挂外层 |
| 嵌套示例 | `OrderForm` 内嵌 `UserForm`；`useDialog(OrderForm)` 打开时，`UserForm` **不是**弹层 direct content，其 `LayerTemplate` **不**投递到 MyDialog |
| 多 Layer 实例 | 各 `LayerTemplate :to` 隔离 |
| 操作区内部扩展 | Vue slot + `LayerTemplate :to` 同名模板 |
| UserList 带 `:to` 写 `name="footer"` 换 layer footer | **不展示**（走 content 链；UserForm 无 `<slot name="footer">`）；换不了 layer footer |
| 从列表页替换整块 MyDialog footer | **不支持**（无 container 侧调用 API） |
| `show` 换 `container.component` | merge → resolve 后走**该实例工厂**的 `adapt`；容器差异由用户在 adapt 内处理 |
| 每次 `show()` | 框架强制 remount content，setup（含 `defineLayer`）在当次 props 下重新执行 |
| SSR | **暂不支持** |

---

## 推导小结

1. **配置片段** merge：常规 `show > useX > defineLayer > createLayer`；`clone` 实例 `show > partial > useX > defineLayer > createLayer`。
2. **content / container 同构**（`LayerNodeConfig`）：`component` / `props` / 命令式 `slots`；**声明式**插槽内容走 `containerTemplates` / `contentTemplates`。
3. **merge → resolve → adapt → render**；每实例**单一** `adapt`；`show` 覆盖 merge 但不跳过 adapt；`show` 每次 remount content。
4. **slot render fn 投递**：UserForm 内模板 → layer slot；`LayerTemplate :to` → content slot；模板运行时注册、resolve 物化。
5. **`visible-outside`** 仅 outsideLayer 生效；`inLayer` / `outsideLayer` / `slotProps` 为 `#default` 插槽参数。
6. **`LayerTemplate`**：`name` 即 slot 名，与 Vue `<template #name>` 同构；`:to` 走 content 链；目标无同名 slot 则不渲染。
7. **容器 slot 名差异**在工厂 **`adapt`** 调整 `normalized.container.slots`，不用 merge 名表。
8. **无 `layerId` / `surface`**；多容器靠多工厂 + 各自 `adapt`。
9. **细粒度扩展**用 Vue `<slot>`；`LayerTemplate :to` 在弹层下填充同名 content slot。
10. **`to` 分流**：无 `to` → container 链；有 `to` → content 链；不接 MyDialog。
11. **`defineLayer`** 全局 inject key；`LayerTemplate` 为 layer 插槽主路径；固定三参 `createLayer`；不导出 `useLayer`。
12. **`clone`**：`show > partial > useX > defineLayer > createLayer`；`hideOn` 与用户 `onXxx` 合并为 wrapper（用户先、`hide()` 后）。
13. **`visible`**：仅 prop + event 元组；非常规模型由使用者封装 layer。
14. 同名 `LayerTemplate` 重复注册：**warning + 后者覆盖**（各注册域内）。
15. **`useX()` 可无 Content**；**暂不支持 SSR**。

---

## TradeOff

### 业务弹窗开发者（UserForm）

- `defineLayer` + `LayerTemplate` co-locate 操作区与默认 layer props
- 扩展点用 Vue `<slot>`
- 只依赖 `vue-layerx`

### 业务弹窗使用者（UserList）

- `useDialog(UserForm)` + `show()`
- `LayerTemplate :to` 填充 UserDialog（UserForm）的 content slot
- 不写 MyDialog template、不维护 `visible`

### 框架实现者

| 决策 | 理由 |
|------|------|
| merge 与 adapt 分离 | 优先级在框架，项目在 adapt 整形 |
| 固定三参 `createLayer` | defaults / adapt 职责清晰，实现简单 |
| `defineLayer` 全局 inject | 与 Vue `defineXxx` 拉齐；content 不感知容器 |
| slot render fn 投递 | container / content 模板跨树投送；与 Vue slot 语义同构 |
| content remount on show | 框架托管 render，每次 show 强制重建以兑现快照语义 |
| 无 `useLayer` | 仍须选 layer，意义不大 |
| 无 `LayerTemplate ref` 连线 | `name` self-register |
| 无独立 `transform` API | adapt 内聚在注册时 |
| 同构 node | content / container 同一套 mental model |
| `LayerTemplate :to` | 显式绑定实例；列表页走 content slot 链 |
| 插槽与 Vue 同构 | `name` = slot 名；对不上就不渲染；框架不校验 slot 清单 |
| Drawer 差异走 `adapt` | 滤 props、搬移 `normalized.container.slots` 的 key |
| `visible` 仅 prop+event | 非常规模型用户自封装 layer |
| `clone` 多一层 `partial` | 实例级 defaults，介于 `show` 与 `useX` 之间 |
| 同名 `LayerTemplate` warning | 后者覆盖，dev 可发现误配 |
