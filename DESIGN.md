# vue-layerx 设计文档

## 背景

业务弹窗通常是 **layer（容器）+ content（业务内容）** 的组合：

```
UserDialog = MyDialog + UserForm
```

痛点：

1. **content 与 layer 绑死** — UserForm 与某一种 Dialog 写在一起，换 Drawer 要复制或再拆。
2. **样板代码多** — 导入 Dialog、写 template、维护 `modelValue`，而业务上往往只想「把表单放进弹层展示」。

---

## 设计目标

| 角色 | 目标 |
|------|------|
| **content（UserForm）** | 可复用于页内与弹层；只依赖 `vue-layerx`，不依赖 `useDialog` |
| **layer（MyDialog）** | 通过 `createLayer` 适配，项目内类型有限 |
| **定义侧** | co-locate 默认 layer 配置与操作区模板 |
| **使用侧** | 不写 layer template、不声明 `model`，`open()` / `close()` 即可 |
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

每次 `open()`：**重建 content 子树**（setup 再跑，`defineLayer` / `LayerTemplate` 在当次上下文中重新注册），再执行：

```text
① merge      open > clone > use > define > create  →  LayerMerged
② resolve    defaultResolve(merged)  →  LayerNormalized
③ adapt      该实例工厂的 createLayer 第 3 参（可选）(normalized) => LayerNormalized
④ render     bindContainerModel + h(...)
```

- **merge**：各层贡献 **LayerConfigNodeBase 片段**（`content` / `container`）；`closeOn` 在 content、`model` 在 container；**slot 内容**含命令式 `slots` 与 **LayerTemplate 物化后的 slots**，按固定 tier 合并（见「配置 merge」）。
- **resolve**：`defaultResolve(merged)` 将 merge 结果归一化为 **LayerNormalized**；`closeOn` 改写为 content 的 `onXxx` → `close()`。
- **adapt**：在 **LayerNormalized** 上整形；`open` 已反映在入参中。实例由哪个工厂创建，就跑该工厂 `createLayer` 注册时的**那一个** `adapt`。
- **render**：`bindContainerModel` 将 `visible` 投影到 container `model`；**close 后再 open** 时 remount content；已打开时再次 `open()` 只更新 merge/props。

使用者配置 **片段** 在 merge 汇入；**收归为可渲染形态** 在 Normalized（adapt 所见即此）。

`open` 可覆盖 merge 输入（含 `component`、`container.component`），但**不跳过 adapt**——仍走 merge → resolve → adapt → render；adapt 可改回或替换 `container.component`。

---

## 渲染与投递机制

### open() 与 content 重建

UserForm 等业务 content **不由业务 template 直接挂进 MyDialog**，而由 vue-layerx 在 `render` 阶段 `h(content, …)` 托管。

- **`close()` 后再 `open()`**：强制重建 content 子树（内部 `contentMountKey` 递增），content `setup` 重跑，`defineLayer` / creator `LayerTemplate` 在当次上下文重新 register。
- **已打开时再次 `open(config?)`**：只更新 `store.open` tier 并下发新 props，**不** remount content。
- 弹层**已打开期间**，UserList 等父级响应式变化**不自动同步**进弹层；再次 `open({ props })` 可更新当次 payload。

首次 `visible=true` 才挂载 portal（`createLayerView` 内 `watch`）；`close()` 设 `visible=false` 并通过 container `model` 投影关闭，**不卸载**挂载点；bind 点 `onUnmounted` 时卸该 instance 的 portal。

### viewHost 与 bindHost（portal inject 上下文）

Layer 通过 `render` 挂到 `document.body`，与 Host 组件树 DOM 分离。为让 content 能 `inject` Host / `ConfigProvider` 等祖先 provide，**每个 LayerInstance 各自维护 `host`（`shallowRef<ViewHost>`）**：

- **`host` 存活**：作为 prop 传入 LayerView；setup 时 `appContext = host.appContext`，`provides = Object.create(host.provides)`
- **无 host 或已卸载**：bare portal（可 `open()`，但无 inject / 无全局组件解析）

**`bindHost()`**（per-instance，重复调用 no-op）：

```ts
const bindHost = () => {
  const host = getCurrentInstance()
  if (!host || viewHost) return
  viewHost = host
  onUnmounted(() => {
    viewHost = null
    dispose() // 仅卸本 instance portal
  })
}
```

- `useLayer()` 末尾自动 `bindHost()`；setup 内有 host 则立即绑定
- **`instance.bindHost`** 暴露给用户（全局单例在 App / ConfigProvider 子树内 setup 调用）
- **`clone()`** 内部走完整 instance 创建并自动 `bindHost()`（等价于在 clone 调用点再 `useLayer` 一次）
- **`instance.unmount()`** 只调自身 `dispose()`（卸 portal DOM），**不**清 viewHost

| 场景 | 用法 |
|------|------|
| 页面 setup | `useLayer()` 自动 bindHost |
| 全局单例 | 模块 `useLayer()` + App 内 `messageBox.bindHost()` |
| clone | `clone()` 在 setup 内自动 bindHost；parent 的 bindHost **不影响** clone |
| 多页共享配置 | `() => useLayer(...)` wrapper，各页 setup 自动 bind |

未 bindHost 可 bare open；ConfigProvider locale 等须在 **Provider 子树内** bindHost。

### 跨树 slot 投递（render fn）

`LayerTemplate` 在 mount 时向实例注册表写入 `{ name, render }`；**每次 LayerView render 时物化为 `SlotRenderFn` 并汇入 merge**。四段渲染顺序：

```text
① merge / resolve / adapt   合并配置（含 LayerTemplate slot tier）
② render layer              h(MyDialog, …) 挂载（通常 appendToBody 至 body）
③ render content            UserForm 作为 layer default slot（close 后再 open 时 remount）
④ slot fn 调用              LayerTemplate.render() 产出 VNode
```

`LayerTemplate` 注册表在 mount 时写入；**merge 阶段读取快照**并物化。首次打开若模板尚未 register，对应 slot 为空；模板 mount 后 `bumpSlots` 触发重渲染即可。

### `LayerTemplate :to` 与实例绑定

- `LayerTemplate :to="userDialog"` 绑定 `LayerInstance`，写入 **caller content** 注册表（`:to` 隔离，clone 实例各自独立）。
- `LayerTemplate :to="userDialog" container` 写入 **caller container** 注册表，远程填充 MyDialog 同名 slot。
- 无 `:to` 的 `LayerTemplate`（UserForm 内）写入 **creator container** 注册表；merge tier 最低（仅次于 `createLayer` 命令式 slots）。

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

type LayerConfigNodeBase = {
  component?: Component
  props?: Record<string, unknown>
  slots?: Record<string, SlotRenderFn>
}

/** container：model = v-model prop 名（事件 onUpdate:${model}） */
type LayerConfigNodeContainer = LayerConfigNodeBase & { model?: string }

/** content：closeOn = content emit → layer.close() */
type LayerConfigNodeContent = LayerConfigNodeBase & { closeOn?: string[] }

/** merge 完成后 */
type LayerMerged = {
  content: LayerConfigNodeContent
  container: LayerConfigNodeContainer
}

type LayerNodeNormalized = {
  component: Component
  props: Record<string, unknown>
  slots: Record<string, SlotRenderFn>
}

type LayerNormalized = {
  content?: LayerNodeNormalized
  container: LayerNodeNormalized
}

/** render 前：adapt 之后，附加 open/model 绑定 */
type LayerRenderPlan = LayerNormalized & {
  visible: boolean
  model: string
  onClose: () => void
}
```

| 术语 | 含义 |
|------|------|
| **container** | 外层容器，如 `MyDialog` |
| **content** | 内层业务组件，如 `UserForm` |
| **UserDialog** | `useDialog(UserForm)` 构建的逻辑组合体：`MyDialog` + `UserForm` |
| **Layer 实例** | `useDialog(UserForm)` 返回值 `{ open, close, clone, visible }` |
| **模板名 / 插槽名** | `LayerTemplate` 的 `name`，与目标组件 slot 同名，如 `title`、`footer` |
| **direct layer content** | `useX` / `open` 绑定的根 content 组件；仅其内部的 `LayerTemplate` 进外层 MyDialog |

### 工厂默认配置

```ts
/** createLayer + defineLayer — 顶层 = container */
type LayerConfigStatic = LayerConfigNodeContainer & {
  content?: LayerConfigNodeContent
}

/** useX / open / clone — 顶层 = content */
type LayerConfigInstance = LayerConfigNodeContent & {
  container?: LayerConfigNodeContainer
}

const DEFAULT_CONTAINER_MODEL = 'modelValue'
```

顶层 `props` / `slots` / `model` 描述 **container**；`content` 为嵌套 content 默认（含 `closeOn`）。

**`model`**：container 的 v-model prop 名，默认 `modelValue`，对应事件 `onUpdate:modelValue`。`createLayer` 第 2 参可设 `model: 'open'` 等。框架在 render 阶段写入 `[model]: visible` 与 `[onUpdate:${model}]`。

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
| **UserList `LayerTemplate :to container`** | **MyDialog 的 slot** | `name` 须与 layer 组件 slot 同名 |

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
| `:to` | 绑定 `LayerInstance`，注册进 **caller content** tier；远程填充 content 同名 `<slot>` |
| `:to` + `container` | 注册进 **caller container** tier；远程填充 MyDialog 同名 slot |

**调用方示例：**

```vue
<LayerTemplate :to="userDialog" name="header">
  <ElTag>调用方注入 content slot</ElTag>
</LayerTemplate>

<LayerTemplate :to="userDialog" container name="footer">
  <ElButton>调用方注入 container slot</ElButton>
</LayerTemplate>
```

### 路由边界

框架按 **`to` / `container` 组合** 分流到 container 链或 content 链；**同链内**按 merge slot tier 决定优先级（见「配置 merge」）。

| 用法 | 投递链 | 说明 |
|------|--------|------|
| UserForm 内 `LayerTemplate`（无 `to`） | **MyDialog** slot（creator tier） | 调用方 `:to container` 可覆盖 |
| `LayerTemplate :to` | **UserForm** `<slot>`（caller content tier） | |
| `LayerTemplate :to container` | **MyDialog** slot（caller container tier） | 高于 creator tier |

**与 Vue 相同，框架不持有、也不校验 slot 清单：**

- Vue 无法从子组件「读出」`defineSlots` / template 里有哪些 `<slot name>`；`useDialog(UserForm)` + `LayerTemplate :to` **同样做不到**按契约拦截 `name`。
- `:to` 下 `name="form-end"` 走 caller content tier，resolve 后作为 `h(UserForm, …, { 'form-end': fn })` 的 slot 传入；**UserForm 没有 `<slot name="form-end">` 就不展示**——与父组件写了 `<template #form-end>` 但子组件没开口一样，不是框架 warning，是静默无渲染。
- UserList 写 `name="footer"` 且 `:to` **无** `container`，而 UserForm 只有 creator `LayerTemplate name="footer"`：内容走 **content** 链，对不上口 → **不展示**；应改用 `:to container` 覆盖 MyDialog footer。

同一 tier 内同名 `LayerTemplate` 重复注册：**dev warning**，**后者覆盖前者**（同 tier 内仍按 mount 顺序）。

### Vue slot 与 vue-layerx 分工

| 机制 | 用途 |
|------|------|
| `LayerTemplate name="title"` / `footer` | 块级模板 → MyDialog 同名 slot |
| Vue `<slot name="action-end">` | 结构级：操作区内部扩展 |
| `LayerTemplate :to` + `name="action-end"` | 弹层下远程填充 content 同名 slot |

「保存」与「取消」**之间**插入按钮：UserForm 预留 Vue slot；vue-layerx 不负责块内顺序组合。

### 插槽投递

**container 侧**

1. UserForm 内 `LayerTemplate name="title"` → creator container tier。
2. **merge** 阶段：按 slot tier 合并（见下）；`LayerMerged.container.slots` 为最终结果。
3. `h(MyDialog, props, normalized.container.slots)` — MyDialog 无 `#title` 则不展示。

**content 侧**

`LayerTemplate :to` + `name="form-end"` → caller content tier → `normalized.content.slots.form-end`；UserForm 无 `<slot name="form-end">` 则不展示。

**容器差异**：非默认 slot 名对齐（Dialog `#title` vs Drawer `#header`）在工厂 **`adapt`** 中调整 `normalized.container.slots` 的 key，不在 merge 维护名表。

---

## 各方职责

| 层级 | 进入 merge？ | 职责 | 不做 |
|------|--------------|------|------|
| **createLayer 第 2 参** | ✅ 最低 | 工厂默认 `visible`、`create` tier（顶层 = container） | 运行时覆盖 open |
| **defineLayer** | ✅ | `define` tier；顶层 `props` / `slots` = container | 选 `component`、适配容器 |
| **useX(Content, config?)** | ✅ | `use` tier；使用侧片段、`closeOn`、可绑 Content | 适配 MyDialog |
| **open(payload?)** | ✅ 最高 | 可覆盖 merge 一切，含 `component`、`container.component` | 仍走 adapt |
| **defaultResolve** | — | `LayerMerged` → `LayerNormalized` | 不参与优先级 |
| **createLayer 第 3 参 adapt** | — | `LayerNormalized` → `LayerNormalized` | 不实现 merge |
| **LayerTemplate**（UserForm 内，无 `to`） | ✅ creator tier | content 内声明 container slot | — |
| **LayerTemplate**（`:to`） | ✅ caller tier | 远程 content slot | — |
| **LayerTemplate**（`:to container`） | ✅ caller tier | 远程 container slot；高于 creator | — |

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

### `createLayer(layer, config?)`

注册容器，返回工厂（如 `useDialog`）。

```ts
type LayerAdapter = (normalized: LayerNormalized) => LayerNormalized

type LayerConfigCreate = LayerConfigStatic & { adapter?: LayerAdapter }

function createLayer(
  layer: Component,
  config?: LayerConfigCreate,
): (Content?: Component, config?: LayerConfigInstance) => LayerInstance
```

**第 1 参** `layer`：写入 `store.create.container.component`（merge 最高优先级）。

**第 2 参** `config`：最低优先级 merge 片段（`create` tier）；可选 `adapter` 写入 `store.adapter`（不参与 merge）。

```ts
export const useDialog = createLayer(MyDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})
```

**`adapter`**：可选；在 `defaultResolve` 之后执行。

```ts
export const useDialog = createLayer(MyDialog, {
  props: { width: '480px' },
  adapter: (normalized) => ({
    ...normalized,
    container: {
      ...normalized.container,
      props: omit(normalized.container.props, ['direction']),
    },
  }),
})
```

无 `adapter` 时：`normalized = defaultResolve(merged)`。

**API 形态**：两参 `(layer, config?)`；`adapter` 在 `config` 内，仅 `createLayer` 可配置。

### `defineLayer(config?)`（content.setup）

**content 侧声明被 layer 包裹时的默认配置**，与 Vue 的 `defineProps` / `defineEmits` 同级——全局 `defineXxx`，通过**全局 inject key** 注册，不挂具体容器工厂（见「渲染与投递机制」）。与 `createLayer` 共用 **`LayerConfigStatic`**。

```ts
const props = defineProps<{ mode?: 'create' | 'edit' }>()

defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
    direction: 'rtl',
  },
})
```

等价于向 merge 贡献 container 片段（顶层 `props` 即 `container.props`）。页内单独使用 content 时无效。

每次 `open()` 会**重建 content 子树**（等价于重新 mount，setup 再跑一遍），故 `defineLayer` 在当次 `open` 的 props 上下文中求值；`open({ props: { mode: 'edit' } })` 时 title 等可随 mode 变化。弹层**已打开期间**，列表页等父级响应式数据变化**不自动同步**进弹层（见 `open` 快照语义）。

**与 `LayerTemplate` 的分工：**

| 方式 | 典型用途 | 优先级 |
|------|----------|--------|
| `LayerTemplate name="footer"` | 声明 container 侧块级模板（`name` = MyDialog slot 名） | 默认 |
| `defineLayer({ container: { slots: { title: () => h(...) } } })` | 命令式覆盖同名 slot 渲染（少见） | **高于** `LayerTemplate` |

正常路径：**`LayerTemplate name` 与 container / content 的 slot 同名**。`defineLayer` 一般只写 `props`；需命令式覆盖时再写顶层 `slots`。

```ts
// defineLayer 与 createLayer 同构：LayerConfigStatic
// 顶层 props = container.props；slots = container.slots
defineLayer({
  props: { title: '...' },
  slots: { footer: () => h(...) },
})
```

模板仅通过 `LayerTemplate name` self-register，不支持 `ref` 三连线。

### `useX(Content?, config?)` & `open(config?)`

`useX` 由 `createLayer` 返回。`config` 与 `open` **同构**，类型为 **`LayerConfigInstance`**（顶层 = content，嵌套 `container`）：

```ts
type LayerConfigInstance = LayerConfigNodeContent & {
  container?: LayerConfigNodeContainer
}
```

即 `{ component?, props?, slots? }` 描述 **content**；`container` 描述外层容器片段。`useX(UserForm, { props })` 中的 `props` 即 `content.props`。顶层 / `container.slots` 仅用于极少见的命令式 `SlotRenderFn`；常规插槽内容用 `LayerTemplate`。

常规：

```ts
const userDialog = useDialog(UserForm, {
  closeOn: ['success', 'cancel'],
})

userDialog.open({
  props: { mode: 'edit', recordId: 1 },
  container: { props: { title: '编辑用户' } },
})
```

极端（一切在 `open` 定义）：

```ts
const xxx = useDialog()

xxx.open({
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

`open` 可改 `container.component`；merge → resolve 后仍走**创建该实例的工厂**所注册的 `adapt`（如 `useDialog` 的 adapt）。`adapt` 收到完整 `LayerNormalized`，**可改回或改成别的 `container.component`**，以 adapt 返回为准。常规双容器仍推荐 `useDialog` / `useDrawer` 分工厂。

**`open` 换 `container.component`** 属进阶能力：框架只提供 merge + adapt 钩子，**不替用户处理**容器差异（slot 名、model 协议等）；非常规需求下用户须在 `adapt` 内自行处理，或对默认 Layer 做二次封装。

`useX()` **可不传 Content**——实例、`open` / `close` / `visible` 行为正常；未绑 Content 且 `open` 未传 `component` 时，layer 无 default content（空壳）。`open` 时传入 `component` 即可。

`open()` payload 为当次打开快照；弹层打开后，**父组件（如 UserList）侧**响应式数据变化不自动同步进已打开的弹层（content remount 语义见「渲染与投递机制」）。

### `LayerTemplate`

见上文。调用方远程填充 content slot 时须显式 `:to="userDialog"`（`useDialog` 返回的实例）。

### Layer 实例

```ts
interface LayerInstance {
  open(config?: LayerConfigInstance): void
  close(): void
  clone(config?: LayerConfigInstance): LayerInstance
  readonly visible: boolean
}
```

### `clone(config?)`

`clone` 从当前实例派生**新实例**（独立 `visible`、独立 `open`/`close`），继承父实例的 **content 绑定**与 **`useX` 时的 config**；`config` 写入该克隆的 **`clone` tier**，在后续每次 `open` 的 merge 中生效。

克隆实例 merge 优先级（在 `define`、`create` 之上多一层 `clone`）：

```text
open > clone（clone 入参）> use > define > create
```

- **`clone` tier**：仅 `clone(config)` 时写入，对该克隆实例持久。
- **`use`**：创建父实例时传入的 config（含 `closeOn`、默认 `props` / `container.props` 等）。
- 父实例某次 `open` 的 config **不**继承给克隆；克隆只带 `use` + 自己的 `clone` tier。
- 克隆与父实例**共享同一工厂**及其 `adapt`；**各自独立 `layerRuntime`**（独立挂载点，`open` / `close` 互不影响 DOM）。
- **`clone()` 等价于再 `useLayer` 一次**：完整新建 instance，继承 `create` / `adapter` / `use`，写入 `clone` tier，并在 setup 内自动 `bindHost()`；parent 的 bindHost 不影响 clone。

```ts
const base = useDialog(DetailContent, { closeOn: ['close'] })
const wide = base.clone({ container: { props: { width: '640px' } } })

wide.open({ props: { id: 1 } })
// merge：open.props > clone.container.props.width > use.closeOn > …
```

---

## 配置 merge

### 优先级

**container.props / content.props / component**（常规实例）：

```text
open > clone > use > define > create
```

**container.slots**（低 → 高，后者覆盖前者）：

```text
create > creator LayerTemplate > define > caller LayerTemplate (:to container) > use > clone > open
```

**content.slots**：

```text
create > caller LayerTemplate (:to) > use > clone > open
```

`LayerTemplate` 与命令式 `slots` **同构**：均为 `SlotRenderFn`，在 merge 阶段按 tier 合并。resolve 直接透传 `LayerMerged.*.slots`。

`clone` 派生实例：`clone` tier 介于 `open` 与 `use` 之间（props 与 slots 均适用）。

### 内部 LayerConfigStore

每个 layer 实例维护 **`LayerConfigStore`**（`create` / `use` / `clone` / `open` / `templates`）；**`defineLayer` tier 由 LayerView 内部 `defineFragment` 维护**，render 时 `mergeLayerConfigStore(store, defineFragment)` 汇合并 resolve。`:to` 注册通过 instance 私有 `Symbol` 访问 store。

### merge 后字段来源示例

**container.props**（`defineLayer` 的顶层 `props` 简写 ≡ `container.props`）：

```text
create.props
  → define.props
  → use.container.props
  → clone.container.props
  → open.container.props
```

**content.props**（`use` / `open` 顶层 `props` = `content.props`）：

```text
use.props
  → clone.props
  → open.props
```

`closeOn`：`define.content` → `use` → `clone` → `open`（后者覆盖）。`model` 在 container 链：`create` → `define` → `use.container` → `clone.container` → `open.container`。

### `closeOn`（使用侧语法糖）

`closeOn` 只出现在 **`useX` / `open` payload**，不是 content 组件的 prop。框架在 **resolve** 阶段把它**改写**进 `normalized.content.props` 的事件监听（Vue 3 的 `onXxx`）。

```ts
useDialog(UserForm, { closeOn: ['success', 'cancel'] })
```

等价于在 content 上提供（示意）：

```ts
// resolve 后写入 normalized.content.props
{
  onSuccess: () => close(),
  onCancel: () => close(),
}
```

即 **`closeOn: ['success']` → `onSuccess: () => close()`**（emit 名按 Vue 惯例转为 `on` + PascalCase）。

content 的 `onXxx` 由 vue-layerx 在 resolve 阶段**统一写入** `normalized.content.props`（业务组件内部无独立 listener 通道）。若 `open` / `useX` 的 `props` 与 `closeOn` 同名（如 `onSuccess`），resolve 时合并为单一 wrapper：**先调用用户 handler，再调用 `close()`**；允许 handler 为 `async`——框架**不 await**，`close()` 仍照常执行。

```ts
// resolve 后示意
onSuccess: (...args) => {
  userFn?.(...args)
  close()
}
```

用户未传同名 `onXxx` 时，等价于 `onSuccess: () => close()`。

`closeOn` 与 `defineLayer`、 `LayerTemplate` 无关；校验失败时不 emit 对应事件，故不会触发 `closeOn`。

### adapt 与 open

`open` 写入的 `container.component`、`container.props` 等 **先 merge → resolve → adapt**（始终为该实例所属工厂的**唯一** `adapt`）。容器 slot 名差异、换 `container.component` 等均在 **adapt** 内处理；adapt 返回值即最终 `LayerNormalized`。

---

## 类型提示（可选）

框架**能**从 `createLayer` 推导 `container.props`、从 content 组件推导 `props` / `emits`（进而约束 `closeOn`）。  
**不能**从 `UserForm` 自动读出有哪些 layer slot、content slot——与 Vue 父组件无法自省子组件 slot 开口一样。

`useX()` **未绑 Content** 时，layer 可正常 open/close；`open({ component })` 传入 content 后类型推导生效。`props` / `container.props` 等**推不出则回落 `any`**（不为此做复杂条件类型）。

使用侧若写 `useDialog<UserFormLayer>(UserForm)`，其中的 `UserFormLayer` 只能是 **content 作者手写** 的辅助类型（文档 / IDE），框架运行时**不读取**：

```ts
/** 可选：仅用于 props / emits / closeOn 类型提示 */
export interface UserFormLayer {
  props: { mode?: 'create' | 'edit'; recordId?: number }
  emits: 'success' | 'cancel'
}
```

```ts
const userDialog = useDialog<UserFormLayer>(UserForm, {
  closeOn: ['success', 'cancel'],
})

userDialog.open({
  props: { mode: 'edit' },
  container: { props: { title: '编辑' } },
})
```

| 字段 | 类型来源 |
|------|----------|
| `props` | content 组件 / `UserFormLayer` |
| `container.props` | `createLayer` 注册的 `MyDialog` props |
| `closeOn` | `UserFormLayer.emits`（手写泛型时） |
| `LayerTemplate` 的 `name` / `:to` | **无框架类型**；须对照 UserForm 模板与 MyDialog 文档，与 Vue 使用 slot 相同 |

---

## 关闭行为

| 触发方式 | 行为 |
|----------|------|
| `closeOn`（语法糖） | resolve 写入 `content.props.onXxx`（用户 handler 在前，`close()` 在后）；允许 async emit，框架不 await |
| layer 自带关闭 | 内部 `close()` |
| `beforeClose` | 写在 `container.props`，经 merge/adapt **透传给底层 layer 组件**；属于容器自身行为，**框架不介入**，与 `closeOn` 无关 |
| 校验失败 | 不 emit 对应事件，不触发 `closeOn` |

---

## 架构图

```text
createLayer(MyDialog, { ...defaults, adapter? })
        │
        ▼
useDialog / useDrawer
        │
        ├── defineLayer ─────────────────────────────┐
        ├── useDialog(UserForm, opts) ───────────────┤
        ├── open(payload) ───────────────────────────┤──► merge ──► resolve ──► adapt ──► render
        ├── LayerTemplate（UserForm 内，creator tier）─┤
        └── LayerTemplate :to / :to container ───────┘
              （caller tier；mount 注册，merge 前物化）
```

**渲染树（inLayer，slot render fn 投递后）：**

```text
MyDialog（normalized.container）
  ├─ #title ← slot fn ← UserForm 内 LayerTemplate name="title"
  ├─ default → UserForm（normalized.content，direct layer content）
  │              └─ #form-end ← slot fn ← LayerTemplate :to
  ├─ #footer ← slot fn ← merge tier（caller :to container 或 creator 内 LayerTemplate）
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
    props: { width: '520px', destroyOnClose: true },
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
    props: { size: '360px', direction: 'rtl' },
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

const userDialog = useDialog(UserForm, { closeOn: ['success', 'cancel'] })
</script>

<template>
  <ElButton @click="() => userDialog.open({ props: { mode: 'create' } })">
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

const filterDialog = useDialog(FilterForm, { closeOn: ['apply'] })
const filterDrawer = useDrawer(FilterForm, { closeOn: ['apply'] })
```

---

## 嵌套与边界

| 场景 | 行为 |
|------|------|
| content 页内使用 | `defineLayer` 无效；无 `visible-outside` 的 `LayerTemplate` 不占 DOM、不投递 |
| `visible-outside` | **仅 outsideLayer 生效**：在 SFC 原位置渲染；**inLayer 时忽略**，仍通过 slot render fn 投进 layer slot |
| `useX()` 无 Content | 实例正常；未 `open({ component })` 时 layer 无 content |
| 嵌套 content | 仅 **direct layer content**（`useX` / `open` 绑定的根组件）内的 `LayerTemplate` 进外层 MyDialog；内嵌子组件上的模板**不**挂外层 |
| 嵌套示例 | `OrderForm` 内嵌 `UserForm`；`useDialog(OrderForm)` 打开时，`UserForm` **不是**弹层 direct content，其 `LayerTemplate` **不**投递到 MyDialog |
| 多 Layer 实例 | 各 `LayerTemplate :to` 隔离 |
| 操作区内部扩展 | Vue slot + `LayerTemplate :to` 同名模板 |
| UserList 带 `:to` 写 `name="footer"` 换 layer footer | 应使用 `:to container`；caller tier 高于 creator |
| 从列表页替换整块 MyDialog footer | `LayerTemplate :to container name="footer"` |
| `open` 换 `container.component` | merge → resolve 后走**该实例工厂**的 `adapt`；容器差异由用户在 adapt 内处理 |
| `close` 后再 `open()` | remount content，`setup`（含 `defineLayer`）重新执行 |
| 已打开时再次 `open()` | 更新 merge/props，不 remount content |
| SSR | **暂不支持** |

---

## 推导小结

1. **配置片段** merge：props/component 常规 `open > clone > use > define > create`；**slots** 含 LayerTemplate tier（见「配置 merge」）。
2. **content / container 同构**（`LayerConfigNodeBase`）：`component` / `props` / `slots`；`LayerTemplate` 物化后与命令式 slots 同权 merge。
3. **merge → resolve → adapt → render**；每实例**单一** `adapt`；`open` 覆盖 merge 但不跳过 adapt；close 后再 open remount content。
4. **slot 投递**：creator / caller LayerTemplate 与命令式 slots 均在 merge 产出 `LayerMerged.*.slots`；resolve 透传。
5. **`visible-outside`** 仅 outsideLayer 生效；`inLayer` / `outsideLayer` / `slotProps` 为 `#default` 插槽参数。
6. **`LayerTemplate`**：`name` 即 slot 名；`:to` → caller content；`:to container` → caller container；无 `to` → creator。
7. **容器 slot 名差异**在工厂 **`adapt`** 调整 `normalized.container.slots`，不用 merge 名表。
8. **无 `layerId` / `surface`**；多容器靠多工厂 + 各自 `adapt`。
9. **细粒度扩展**用 Vue `<slot>`；`LayerTemplate :to` 在弹层下填充同名 content slot。
10. **`to` 分流**：无 `to` → creator container；`:to` → caller content；`:to container` → caller container。
11. **`defineLayer`** 全局 inject key；`LayerTemplate` 为 layer 插槽主路径；`createLayer(layer, config?)` 两参；不导出 `useLayer`。
12. **`clone`**：`open > clone > use > define > create`；`closeOn` 与用户 `onXxx` 合并为 wrapper（用户先、`close()` 后）。
13. **`model`**：container v-model prop 名，默认 `modelValue`；`bindContainerModel` 在 render 写入。
14. 同名 `LayerTemplate` 重复注册：**warning + 后者覆盖**（各注册域内）。
15. **`useX()` 可无 Content**；**暂不支持 SSR**。

---

## TradeOff

### 业务弹窗开发者（UserForm）

- `defineLayer` + `LayerTemplate` co-locate 操作区与默认 layer props
- 扩展点用 Vue `<slot>`
- 只依赖 `vue-layerx`

### 业务弹窗使用者（UserList）

- `useDialog(UserForm)` + `open()`
- `LayerTemplate :to` 填充 UserDialog（UserForm）的 content slot
- 不写 MyDialog template、不维护 `visible` / `model`

### 框架实现者

| 决策 | 理由 |
|------|------|
| merge 与 adapt 分离 | 优先级在框架，项目在 adapt 整形 |
| 两参 `createLayer` + `config.adapter` | defaults / adapter 职责清晰；adapter 存 store 顶层 |
| `defineLayer` 全局 inject | 与 Vue `defineXxx` 拉齐；content 不感知容器 |
| slot render fn 投递 | container / content 模板跨树投送；与 Vue slot 语义同构 |
| content remount | close 后再 open 时框架重建 content；已打开时 open 只更新 props |
| 无 `useLayer` | 仍须选 layer，意义不大 |
| 无 `LayerTemplate ref` 连线 | `name` self-register |
| 无独立 `transform` API | adapt 内聚在注册时 |
| 同构 node | content / container 同一套 mental model |
| `LayerTemplate :to` | 显式绑定实例；列表页走 content slot 链 |
| 插槽与 Vue 同构 | `name` = slot 名；对不上就不渲染；框架不校验 slot 清单 |
| Drawer 差异走 `adapt` | 滤 props、搬移 `normalized.container.slots` 的 key |
| `model` 默认 modelValue | 非标准 v-model 容器在 createLayer 设 `model` |
| `clone` 多一层 `clone` tier | 实例级 defaults，介于 `open` 与 `use` 之间 |
| 同名 `LayerTemplate` warning | 后者覆盖，dev 可发现误配 |
