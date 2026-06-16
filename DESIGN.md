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
| **layer（MyDialog）** | 通过 `createLayerx` 适配，项目内类型有限 |
| **定义侧** | co-locate 默认 layer 配置与操作区模板 |
| **使用侧** | 不写 layer template、不声明 `visible`，`show()` / `hide()` 即可 |
| **框架** | 命名模板注册 + 配置 merge + 容器适配 |

---

## 核心管线

每次 `show()` / 渲染前：

```text
① merge      show > useX > defineLayerx > createLayerx(defaults)  →  LayerxMerged
② resolve    defaultResolve(merged)  →  LayerxNormalized
③ adapt      createLayerx 第 3 参（可选）(normalized) => LayerxNormalized
④ render     toRenderPlan(normalized)  →  h(...)
```

- **merge**：各层贡献 **LayerxNodeConfig 片段**（`content` / `layer`）+ **模板注册表** + `hideOn`；优先级固定。模板不由 merge 优先级覆盖，而按**注册位置**分流（见下）。
- **resolve**：`layerTemplates` / `contentTemplates` 按**同名**物化为 `normalized.layer.slots` / `normalized.content.slots`；目标组件没有对应 slot 则不渲染（同 Vue）；`hideOn` 接入 content 事件；产出 **LayerxNormalized**。
- **adapt**：在 **LayerxNormalized** 上整形（滤 props、搬移 / 重命名 `layer.slots` 的 key 等）；`show` 已反映在入参中。
- **render**：内部附加 `visible` 等协议后 `h()`。

使用者配置 **片段** 在 merge 汇入；**收归为可渲染形态** 在 Normalized（adapt 所见即此）。

---

## 类型与术语

### 配置期与渲染期

渲染一个组件只有三部分：**component**、**props**（Vue 3 含 `onXxx` 事件）、**slots**。  
配置期与渲染期类型不同：

```ts
type SlotRenderFn = () => VNode | VNode[] | null

/** merge 片段：content / layer 同构 */
type LayerxNodeConfig = {
  component?: Component
  props?: Record<string, unknown>
  /** 极少：命令式直出插槽（defineLayerx / show）；常规由 LayerxTemplate 注册 */
  slots?: Record<string, SlotRenderFn>
}

/** merge 完成后 */
type LayerxMerged = {
  content: LayerxNodeConfig
  layer: LayerxNodeConfig
  /** UserForm 内 LayerxTemplate；name 即插槽名，resolve 后投进 layer.slots */
  layerTemplates: Record<string, { render: () => VNode | VNode[] | null }>
  /** LayerxScope 内 LayerxTemplate；name 即插槽名，resolve 后投进 content.slots */
  contentTemplates: Record<string, { render: () => VNode | VNode[] | null }>
  hideOn?: string[]
}

/** resolve / adapt 后：可交给 h() 的节点 */
type LayerxNodeNormalized = {
  component: Component
  props: Record<string, unknown>
  slots: Record<string, SlotRenderFn>
}

type LayerxNormalized = {
  content: LayerxNodeNormalized
  layer: LayerxNodeNormalized
}

/** 内部：adapt 之后，附加 visible 协议等 */
type LayerxRenderPlan = LayerxNormalized & {
  visible: boolean
  visibleProp: string
  visibleEvent: string
  onHide: () => void
}
```

| 术语 | 含义 |
|------|------|
| **layer** | 外层容器，如 `MyDialog` |
| **content** | 内层业务组件，如 `UserForm` |
| **UserDialog** | `useDialog(UserForm)` 构建的逻辑组合体：`MyDialog` + `UserForm` |
| **Layer 实例** | `useDialog(UserForm)` 返回值 `{ show, hide, clone, visible }` |
| **模板名 / 插槽名** | `LayerxTemplate` 的 `name`，与目标组件 slot 同名，如 `title`、`footer` |

### 工厂默认配置

```ts
type LayerxFactoryDefaults = {
  visible?: [prop: string, event: string]
  content?: LayerxNodeConfig
  layer?: LayerxNodeConfig
}
```

---

## 命名模板与插槽填充

`LayerxTemplate` 只做一件事：**声明一块有名字的模板**（等同 Vue 的 `<template #name>`），在所属 Scope 内 self-register，无需 `ref`。

### 与 Vue slot 同构

```vue
<!-- Vue：父组件提供具名模板 -->
<MyDialog>
  <template #title>ABC</template>
</MyDialog>
```

```vue
<!-- vue-layerx：content 内声明，resolve 后作为 layer 的 slots 传给 h() -->
<LayerxTemplate name="title">ABC</LayerxTemplate>
```

规则与 Vue 一致：

1. **`LayerxTemplate name="title"`** 即提供了名为 `title` 的模板。
2. resolve 后写入 `normalized.layer.slots.title`（或 `normalized.content.slots.title`）。
3. **目标组件有没有同名 `<slot name="title">`** 决定最终是否渲染——有则展示，无则静默丢弃。
4. content 里有没有预留 `<slot name="title">` 对 **layer 侧**模板不重要；layer 侧只看 MyDialog 有没有 `#title`。

不需要额外的「名表」或「物理插槽 ← 逻辑名」映射。**`name` 就是 slot 名。**

容器插槽名与 content 作者命名不一致时（如 Dialog 用 `title`、Drawer 用 `header`），在 **`adapt` 里改 `normalized.layer.slots` 的 key**（搬移 / 重命名 `SlotRenderFn`），而不是在 merge 层维护映射表。

### 声明位置决定投递目标

| 声明位置 | 填充目标 | 说明 |
|----------|----------|------|
| **UserForm 内**（弹层 direct content 上下文） | **MyDialog 的 slot** | `name` 须与 layer 组件 slot 同名（或经 `adapt` 对齐） |
| **UserList `LayerxScope` 内** | **UserForm 的 `<slot>`** | `name` 须与 content 组件 slot 同名 |

纯字符串标题仍用 `defineLayerx` / `layer.props.title`；富标题区用 **`LayerxTemplate name="title"`**（当 MyDialog 提供 `#title` 时）。

### `LayerxTemplate`

```vue
<ElForm>...</ElForm>
<slot name="form-end" />

<LayerxTemplate name="title" />
<!-- ... -->
<LayerxTemplate name="footer" visible-outside>
  <template #default="{ inLayer, outsideLayer }">
    <ElButton type="primary" @click="submit">提交</ElButton>
    <slot name="action-end" />
    <ElButton @click="cancel">取消</ElButton>
  </template>
</LayerxTemplate>
```

| 行为 | 说明 |
|------|------|
| 在 UserForm 内、弹层上下文中 | 不占本地 DOM，resolve 后作为 `normalized.layer.slots[name]` 传给 **MyDialog** |
| `visible-outside` | 页内复用时就地渲染 |
| scope | `inLayer` / `outsideLayer` |

### `LayerxScope`

与 UserForm 内的 `LayerxTemplate` **同一组件、同一套 self-register 机制**；差异只在 **声明位置决定投递目标**：

- UserForm 内 `LayerxTemplate` → `layerTemplates` → `normalized.layer.slots`（同名 key）。
- `LayerxScope` 内 `LayerxTemplate` → `contentTemplates` → `normalized.content.slots`（同名 key）。

使用侧绑定 `:of="userDialog"`（`useDialog(UserForm)` 的实例），把「远程填充 content slot」暴露到 UserList template。**不接 MyDialog 投递链**。

### 路由边界

框架按 **声明位置** 分流，而非在同一池子里用优先级「覆盖」：

| 声明位置 | 投递链 | UserList 能否触及 |
|----------|--------|-------------------|
| UserForm 内 `LayerxTemplate` | `normalized.layer.slots` → **MyDialog** | 否 |
| `LayerxScope` 内 `LayerxTemplate` | `normalized.content.slots` → **UserForm** `<slot>` | 是 |

**与 Vue 相同，框架不持有、也不校验 slot 清单：**

- Vue 无法从子组件「读出」`defineSlots` / template 里有哪些 `<slot name>`；`useDialog(UserForm)` + `LayerxScope` + `LayerxTemplate` **同样做不到**按契约拦截 `name`。
- `LayerxScope` 内 `name="form-end"` 只会进入 `contentTemplates`，resolve 后作为 `h(UserForm, …, { 'form-end': fn })` 的 slot 传入；**UserForm 没有 `<slot name="form-end">` 就不展示**——与父组件写了 `<template #form-end>` 但子组件没开口一样，不是框架 warning，是静默无渲染。
- UserList 写 `name="footer"`，而 UserForm 只有 layer 侧 `LayerxTemplate name="footer"`、没有 `<slot name="footer">`：内容走 **content** 链，对不上口 → **不展示**；**换不掉** MyDialog 上的 layer footer（那条链 UserList 触及不到）。

`layerTemplates` 与 `contentTemplates` 是两张表、两条投递链，key 相同也互不覆盖。

同一 `LayerxScope` 内同名 `LayerxTemplate` 重复注册：后者覆盖或 warning（实现期定一种，仅同一 Scope 内）。

**产品边界：** 不支持从 UserList 替换 UserForm 投进 MyDialog 的 layer 模板。调用方 **路由不到** layer 链。

### Vue slot 与 layerx 分工

| 机制 | 用途 |
|------|------|
| `LayerxTemplate name="title"` / `footer` | 块级模板 → MyDialog 同名 slot |
| Vue `<slot name="action-end">` | 结构级：操作区内部扩展 |
| `LayerxScope` + `LayerxTemplate name="action-end"` | 弹层下远程填充同名 slot |

「保存」与「取消」**之间**插入按钮：UserForm 预留 Vue slot；layerx 不负责块内顺序组合。

### 插槽投递

**layer 侧**

1. UserForm 内 `LayerxTemplate name="title"` → `layerTemplates['title']`。
2. `defaultResolve` 物化：`normalized.layer.slots.title = () => layerTemplates['title'].render()`（`contentTemplates` 同理写入 `normalized.content.slots`）。
3. 再按 merge 优先级叠 **命令式** `layer.slots` / `content.slots`（`SlotRenderFn`）：`show` > `useX` > `defineLayerx` > `createLayerx`，同 key 后者覆盖前者（**覆盖**含对 `layerTemplates` 物化结果的替换）。
4. `h(MyDialog, props, normalized.layer.slots)` — MyDialog 无 `#title` 则不展示。

**content 侧**

`LayerxScope` 内 `LayerxTemplate name="form-end"` → `contentTemplates` → `normalized.content.slots.form-end`；UserForm 无 `<slot name="form-end">` 则不展示。

**容器差异**：非默认 slot 名对齐（Dialog `#title` vs Drawer `#header`）在工厂 **`adapt`** 中调整 `normalized.layer.slots` 的 key，不在 merge 维护名表。

---

## 各方职责

| 层级 | 进入 merge？ | 职责 | 不做 |
|------|--------------|------|------|
| **createLayerx 第 2 参** | ✅ 最低 | 工厂默认 `visible`、`layer` / `content` 片段 | 运行时覆盖 show |
| **defineLayerx** | ✅ | content 贡献 `layer.props`；极少用 `layer.slots` 覆盖模板 | 选 `component`、适配容器 |
| **useX(Content, opts?)** | ✅ | 使用侧片段、`hideOn`、可绑 Content | 适配 MyDialog |
| **show(payload?)** | ✅ 最高 | 可覆盖一切，含 `component`、`layer.component` | 绕过 adapt |
| **defaultResolve** | — | `LayerxMerged` → `LayerxNormalized` | 不参与优先级 |
| **createLayerx 第 3 参 adapt** | — | `LayerxNormalized` → `LayerxNormalized` | 不实现 merge |
| **LayerxTemplate**（UserForm 内） | layerTemplates | 注册 layer 侧模板内容 | — |
| **LayerxScope** | contentTemplates | 向 UserDialog content slot 注册模板 | 接入 layer 投递链 |

### 绑定分层

| 层级 | 是否选容器 |
|------|------------|
| **UserForm** | 不应选；只 `import 'vue-layerx'` |
| **UserList** | 应选；`useDialog` / `useDrawer` 即 `createLayerx` 产物 |

使用侧 `import { useDialog }` 是 **选择已注册工厂**，不是 content 式绑死。

**不导出 `useLayerx`**：即便由框架统一入口，使用侧仍须传参决定用哪种 layer，与直接 `useDialog` / `useDrawer` 等价，类型与意图反而更弱。

### 双容器

无 `layerId`。同一 UserForm 适配 Dialog / Drawer：

- `defineLayerx` 可写跨容器 props（如 `direction`、`width`）。
- **各自工厂**的 `adapt` 过滤无效 props，并按需 **重排 `normalized.layer.slots` 的 key**（如 `title` → `header`）。

```ts
defineLayerx({
  props: { title: '筛选', direction: 'rtl', width: '420px' },
})

// useDialog 的 adapt 去掉 direction；useDrawer 的 adapt 去掉 width
```

---

## 公共 API

框架导出：`createLayerx`、`defineLayerx`、`LayerxTemplate`、`LayerxScope`。  
应用层别名 `useDialog` / `useDrawer` 由项目 `createLayerx` 注册，非框架内置。

### `createLayerx(layer, defaults?, adapt?)`

注册容器，返回工厂（如 `useDialog`）。

```ts
type LayerxAdapt = (normalized: LayerxNormalized) => LayerxNormalized

function createLayerx(
  layer: Component,
  defaults?: LayerxFactoryDefaults,
  adapt?: LayerxAdapt,
): (Content?: Component, options?: LayerxUsePayload) => LayerxInstance
```

**第 1 参** `layer`：工厂默认容器（`defaultResolve` 用于补全 `normalized.layer.component`）。

**第 2 参** `defaults`：最低优先级 merge 片段。

```ts
export const useDialog = createLayerx(MyDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  layer: {
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
export const useDialog = createLayerx(
  MyDialog,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    layer: { props: { width: '480px' } },
  },
  (normalized) => ({
    ...normalized,
    layer: {
      ...normalized.layer,
      props: omit(normalized.layer.props, ['direction']),
    },
  }),
)
```

无 `adapt` 时：`normalized = defaultResolve(merged)`。

**API 形态**：固定三参 `(layer, defaults?, adapt?)`，实现简单、职责清晰；暂不提供 `createLayerx(Layer, fn)` 两参、`createLayerx(fn)` 等重载糖。

### `defineLayerx(options?)`（content.setup）

由旧版 `useDialog.layer()` 演进而来：**content 侧声明被 layer 包裹时的默认配置**，与 Vue 的 `defineProps` / `defineEmits` 同级——全局 `defineXxx`，不挂具体容器工厂。

```ts
const props = defineProps<{ mode?: 'create' | 'edit' }>()

defineLayerx({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
    direction: 'rtl',
  },
})
```

等价于向 merge 贡献 `{ layer: { props: { ... } } }`。页内单独使用 content 时无效。

**与 `LayerxTemplate` 的分工：**

| 方式 | 典型用途 | 优先级 |
|------|----------|--------|
| `LayerxTemplate name="footer"` | 声明 layer 侧块级模板（`name` = MyDialog slot 名） | 默认 |
| `defineLayerx({ layer: { slots: { title: () => h(...) } } })` | 命令式覆盖同名 slot 渲染（少见） | **高于** `LayerxTemplate` |

正常路径：**`LayerxTemplate name` 与 layer / content 的 slot 同名**。`defineLayerx` 一般只写 `props`；需命令式覆盖时再写 `layer.slots`。

```ts
type DefineLayerxOptions = {
  /** 简写，等价于 layer.props */
  props?: Record<string, unknown>
  layer?: {
    props?: Record<string, unknown>
    /** 仅 defineLayerx：直出渲染函数，覆盖 LayerxTemplate */
    slots?: Record<string, SlotRenderFn>
  }
}
```

> **已废弃**：`slots: { footer: footerRef }` + `LayerxTemplate ref` 三连线；模板改由 `LayerxTemplate name` self-register。

### `useX(Content?, options?)` & `show(payload?)`

`useX` 由 `createLayerx` 返回。`options` 与 `show` payload **同构**，形状为 **content 节点配置 + `layer` + `hideOn`**：

```ts
/** 顶层字段即 content（LayerxNodeConfig）；另附 layer 与 hideOn */
type LayerxUsePayload = LayerxNodeConfig & {
  layer?: LayerxNodeConfig
  hideOn?: string[]
}
```

即 `{ component?, props?, slots? }` 描述 **content**；`layer` 描述外层容器片段。`useX(UserForm, { props })` 中的 `props` 即 `content.props`。顶层 / `layer.slots` 仅用于极少见的命令式 `SlotRenderFn`；常规插槽内容用 `LayerxTemplate`。

常规：

```ts
const userDialog = useDialog(UserForm, {
  hideOn: ['success', 'cancel'],
})

userDialog.show({
  props: { mode: 'edit', recordId: 1 },
  layer: { props: { title: '编辑用户' } },
})
```

极端（一切在 `show` 定义）：

```ts
const xxx = useDialog()

xxx.show({
  component: UserForm,
  props: { mode: 'create' },
  layer: {
    component: MyDialog,
    props: {
      width: '480px',
      destroyOnClose: true,
      appendToBody: true,
    },
  },
})
```

运行时换壳（`adapt` 按 `normalized.layer.component` 处理）：

```ts
userDialog.show({
  props: { mode: 'edit' },
  layer: {
    component: MyDrawer,
    props: { size: '360px', direction: 'rtl' },
  },
})
```

`show()` 传入视为打开时刻快照；打开期间父组件数据变化 **不自动同步** 进弹层。

### `LayerxScope` / `LayerxTemplate`

见上文。单 SFC 仅一个 `useX` 时可省略 `LayerxScope :of`。

### Layer 实例

```ts
interface LayerxInstance {
  show(payload?: LayerxUsePayload): void
  hide(): void
  clone(partial?: LayerxUsePayload): LayerxInstance
  readonly visible: boolean
}
```

---

## 配置 merge

### 优先级

```text
show > useX > defineLayerx > createLayerx(defaults)
```

对 `content.*`、`layer.*` 各字段分别 merge（浅合并 `props`；命令式 `slots`（`SlotRenderFn`）同 key 后者覆盖前者）。

`layerTemplates` / `contentTemplates` **不参与**上述优先级链，由声明位置在 resolve 时分流。

### merge 后字段来源示例

**layer.props**（`defineLayerx` 的顶层 `props` 简写 ≡ `layer.props`）：

```text
createLayerx.layer.props
  → defineLayerx（简写 props）
  → useX.layer.props
  → show.layer.props
```

**content.props**（`useX` / `show` 顶层 `props` 简写 ≡ `content.props`）：

```text
useX.props（useX 已绑 component 时）
  → show.props
```

`hideOn`：`useX` → `show`（后者覆盖）。`visible` 不参与 merge，由实例独占。

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

若用户在 `show({ props: { onSuccess: userFn } })` 里**也传了同名监听**，框架应**组合**而非覆盖：先执行 `userFn`（或按约定顺序），再 `hide()`；具体合并策略实现期定一种并写清。用户未传 `onSuccess` 时，仅挂 `hide()`。

`hideOn` 与 `defineLayerx`、 `LayerxTemplate` 无关；校验失败时不 emit 对应事件，故不会触发 `hideOn`。

### adapt 与 show

`show` 写入的 `layer.component`、`layer.props` 等 **先 merge → resolve → adapt**。容器 slot 名差异在 **adapt** 调整 `normalized.layer.slots`。

---

## 类型提示（可选）

框架**能**从 `createLayerx` 推导 `layer.props`、从 content 组件推导 `props` / `emits`（进而约束 `hideOn`）。  
**不能**从 `UserForm` 自动读出有哪些 layer slot、content slot——与 Vue 父组件无法自省子组件 slot 开口一样。

使用侧若写 `useDialog<UserFormLayerx>(UserForm)`，其中的 `UserFormLayerx` 只能是 **content 作者手写** 的辅助类型（文档 / IDE），框架运行时**不读取**：

```ts
/** 可选：仅用于 props / emits / hideOn 类型提示 */
export interface UserFormLayerx {
  props: { mode?: 'create' | 'edit'; recordId?: number }
  emits: 'success' | 'cancel'
}
```

```ts
const userDialog = useDialog<UserFormLayerx>(UserForm, {
  hideOn: ['success', 'cancel'],
})

userDialog.show({
  props: { mode: 'edit' },
  layer: { props: { title: '编辑' } },
})
```

| 字段 | 类型来源 |
|------|----------|
| `props` | content 组件 / `UserFormLayerx` |
| `layer.props` | `createLayerx` 注册的 `MyDialog` props |
| `hideOn` | `UserFormLayerx.emits`（手写泛型时） |
| `LayerxTemplate` / `LayerxScope` 的 `name` | **无框架类型**；须对照 UserForm 模板与 MyDialog 文档，与 Vue 使用 slot 相同 |

---

## 关闭行为

| 触发方式 | 行为 |
|----------|------|
| `hideOn`（语法糖） | resolve 转为 `content.props.onXxx`，emit 时 `hide()`；可与用户传入的 `onXxx` 组合 |
| layer 自带关闭 | 内部 `hide()` |
| `beforeClose` | 写在 `layer.props`，经 merge/adapt 透传 |
| 校验失败 | 不 emit 对应事件，不触发 `hideOn` |

---

## 架构图

```text
createLayerx(MyDialog, defaults, adapt?)
        │
        ▼
useDialog / useDrawer
        │
        ├── defineLayerx ──────────────┐
        ├── LayerxTemplate（UserForm 内）──┤
        ├── useDialog(UserForm, opts) ────┤──► merge ─► resolve ─► adapt ─► render
        ├── show(payload) ───────────────┤
        └── LayerxScope（UserList）──────┘
```

**渲染树：**

```text
LayerRoot（UserDialog 实例 Scope + template registry）
  └─ MyDialog（normalized.layer）
       ├─ #title ← LayerxTemplate name="title"
       ├─ default → UserForm（normalized.content）
       │              └─ #form-end ← LayerxScope 模板
       └─ #footer ← LayerxTemplate name="footer"
            └─ #action-end ← LayerxScope 模板
```

---

## 完整示例

### 应用级

```ts
export const useDialog = createLayerx(
  MyDialog,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    layer: { props: { width: '520px', destroyOnClose: true } },
  },
  (normalized) => ({
    ...normalized,
    layer: {
      ...normalized.layer,
      props: omit(normalized.layer.props, ['direction']),
    },
  }),
)

export const useDrawer = createLayerx(
  MyDrawer,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    layer: { props: { size: '360px', direction: 'rtl' } },
  },
  (normalized) => {
    const { title, footer, ...rest } = normalized.layer.slots
    return {
      ...normalized,
      layer: {
        ...normalized.layer,
        props: omit(normalized.layer.props, ['width']),
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
import { defineLayerx, LayerxTemplate } from 'vue-layerx'

const props = defineProps<{ mode?: 'create' | 'edit' }>()
const emit = defineEmits<{ success: []; cancel: [] }>()

defineLayerx({
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

  <LayerxTemplate name="title" />

  <LayerxTemplate name="footer" visible-outside>
    <template #default="{ outsideLayer }">
      <div :class="{ 'footer--inline': outsideLayer }">
        <ElButton type="primary" @click="submit">提交</ElButton>
        <slot name="action-end" />
        <ElButton @click="cancel">取消</ElButton>
      </div>
    </template>
  </LayerxTemplate>
</template>
```

### UserList.vue

```vue
<script setup>
import { LayerxScope, LayerxTemplate } from 'vue-layerx'
import { useDialog } from '@/layers/dialog'
import UserForm from './UserForm.vue'

const userDialog = useDialog(UserForm, { hideOn: ['success', 'cancel'] })
</script>

<template>
  <ElButton @click="() => userDialog.show({ props: { mode: 'create' } })">
    新建
  </ElButton>

  <LayerxScope :of="userDialog">
    <LayerxTemplate name="form-end">
      <ElFormItem label="年龄"><ElInput v-model="age" /></ElFormItem>
    </LayerxTemplate>
    <LayerxTemplate name="action-end">
      <ElButton @click="print">打印</ElButton>
    </LayerxTemplate>
  </LayerxScope>
</template>
```

### 双容器

```ts
defineLayerx({
  props: { title: '筛选', width: '420px', direction: 'rtl' },
})

const filterDialog = useDialog(FilterForm, { hideOn: ['apply'] })
const filterDrawer = useDrawer(FilterForm, { hideOn: ['apply'] })
```

---

## 嵌套与边界

| 场景 | 行为 |
|------|------|
| content 页内使用 | `defineLayerx` 无效；`LayerxTemplate` 按 `visible-outside` 渲染 |
| 嵌套 content | 仅 direct layer content 内 LayerxTemplate 挂外层 MyDialog |
| 多 Layer 实例 | 各 `LayerxScope :of` 隔离 |
| 操作区内部扩展 | Vue slot + `LayerxScope` 同名模板 |
| UserList 在 `LayerxScope` 写 `name="footer"` 换 layer footer | **不展示**（走 content 链；UserForm 无 `<slot name="footer">`）；换不了 layer footer |
| 从列表页替换整块 MyDialog footer | **不支持**（无 layer 侧调用 API） |
| `show` 换 `layer.component` | 允许；由该工厂的 `adapt` 适配 props / slots |

---

## 推导小结

1. **配置片段**由 `createLayerx(defaults)`、`defineLayerx`、`useX`、`show` 四层 merge，优先级 `show > useX > defineLayerx > createLayerx`。
2. **content / layer 同构**（`LayerxNodeConfig`）：`component` / `props` / 命令式 `slots`；**声明式**插槽内容走 `layerTemplates` / `contentTemplates`。
3. **merge → resolve → adapt → render**；`adapt` 为 `LayerxNormalized → LayerxNormalized`，挂在 `createLayerx` 第 3 参。
4. **`LayerxTemplate`**：`name` 即 slot 名，与 Vue `<template #name>` 同构；目标无同名 slot 则不渲染。
5. **容器 slot 名差异**在工厂 **`adapt`** 调整 `normalized.layer.slots`，不用 merge 名表。
6. **无 `layerId` / `surface`**；多容器靠多工厂 + 各自 `adapt`。
7. **细粒度扩展**用 Vue `<slot>`；`LayerxScope` 在弹层下填充同名 content slot。
8. **声明位置分流**：`LayerxScope` 与 `LayerxTemplate` 同机制，只触 content slot；不接 MyDialog。
9. **`defineLayerx`** 对齐 Vue `defineXxx`；`LayerxTemplate` 为 layer 插槽内容主路径，`defineLayerx.layer.slots` 仅作覆盖。
10. **废弃** `LayerxTemplate ref` + `layer.slots: ref` 连线；固定三参 `createLayerx`；不导出 `useLayerx`。

---

## TradeOff

### 业务弹窗开发者（UserForm）

- `defineLayerx` + `LayerxTemplate` co-locate 操作区与默认 layer props
- 扩展点用 Vue `<slot>`
- 只依赖 `vue-layerx`

### 业务弹窗使用者（UserList）

- `useDialog(UserForm)` + `show()`
- `LayerxScope` 填充 UserDialog（UserForm）的 content slot
- 不写 MyDialog template、不维护 `visible`

### 框架实现者

| 决策 | 理由 |
|------|------|
| merge 与 adapt 分离 | 优先级在框架，项目在 adapt 整形 |
| 固定三参 `createLayerx` | defaults / adapt 职责清晰，实现简单 |
| `defineLayerx` 替代 `useX.layer()` | 与 Vue `defineXxx` 拉齐；content 不感知容器 |
| 无 `useLayerx` | 仍须选 layer，意义不大 |
| 无 `LayerxTemplate ref` 连线 | `name` self-register |
| 无独立 `transform` API | adapt 内聚在注册时 |
| 同构 node | content / layer 同一套 mental model |
| `LayerxScope` 同 `LayerxTemplate` | 声明位置分流；列表页只触 content slot |
| 插槽与 Vue 同构 | `name` = slot 名；对不上就不渲染；框架不校验 slot 清单 |
| Drawer 差异走 `adapt` | 滤 props、搬移 `normalized.layer.slots` 的 key |

---

## 已知待细化（实现阶段）

| 项 | 说明 |
|----|------|
| `defaultResolve` | `layerTemplates` / `contentTemplates` 物化；merge 命令式 `slots` 同 key 覆盖 |
| `hideOn` 与用户 `onXxx` 组合 | 多 handler 顺序、异步 emit 时是否仍 `hide()` |
| `clone(partial)` | partial 与实例级 defaults 的 merge 层级 |
| `visible` 协议 | 非 `modelValue` 的 layer 组件如何声明 |
| `adapt` 管道 | 是否允许多个 adapt 链式组合 |
| 未绑 Content 的 `useX()` | `show` 必须带 `component` 时的类型推导 |
