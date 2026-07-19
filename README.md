# vue-layerx

让弹层组件通过命令方式调用，三行代码打开弹窗：

```ts
const useDialog = createLayer(ElDialog)
const dialog = useDialog(HelloWorld)
dialog.open()
```

## 特性

- 无需维护弹层显示变量
- 无需在模板内编写弹层样板代码
- 弹层参数响应式传递
- 弹层插槽模板式编写
- 零外部依赖，不依赖三方 npm 包
- 使用 TypeScript 编写，提供完整的类型定义
- 单元测试覆盖率100%，提供稳定性保障
- 支持服务端渲染

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

## 首个命令式弹层

### 获取组合式函数

任意弹层 **容器组件** 都可以通过 `createLayer` 生成对应的组合式函数。以 Dialog 为例：

```ts
// dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

> 弹层：Dialog、Drawer、Popup 等弹出式交互形态的统称。

### 获取弹层实例

有了 `useDialog` 后，传入 **内容组件** 即可得到弹层实例：

```vue
<!-- HelloWorld.vue -->
<template>
  <p>Hello World</p>
</template>
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import HelloWorld from './HelloWorld.vue'
import { useDialog } from './dialog'

const dialog = useDialog(HelloWorld)
</script>
```

### 使用弹层实例

调用 `open()` 打开弹层：

```vue
<!-- App.vue -->
<script setup lang="ts">
  /* ... */
</script>

<template>
  <button @click="dialog.open()">
    打开弹层
  </button>
</template>
```

## 用法

### createLayer 配置容器组件

`createLayer` 可以基于某个容器组件创建组合式函数，还能给容器写上默认配置：

```ts
const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})
```

所谓容器，就是靠 v-model 控制显示隐藏、通常有 default slot 的组件，比如 `ElDialog`、`ElDrawer` 等。

框架默认会把内部的显示状态绑到 modelValue（也就是普通的 v-model）。如果你自己的容器用的不是这个名字，用 model 告诉框架即可：

```ts
const useDialog = createLayer(BaseDialog, {
  model: 'visible', // 对应 v-model:visible
  props: { width: '480px' },
})
```

### defineLayer 在内容组件中配置

内容组件本身是普通 Vue 组件。但弹层场景下，它常常还要回答两件事：

- 在弹层里打开时，外面弹层容器的标题、宽度等应该是什么？
- 用户点了组件内的按钮，比如「保存 / 取消」等，要不要关掉弹层？

这些东西只有内容组件的作者自身最清楚，如果使用方配置，每次 `open` 时都要传一遍，很麻烦又需要使用方深入内容组件。
所以在内容组件里，需要有个工具来配置外层容器，它就是 `defineLayer`。




Content 是普通 Vue 组件，可同时用于页内与弹层。在 content 的 `setup` 里调用 `defineLayer`，为当次打开注册 container 默认与 `closeOn`：

```ts
const layer = defineLayer({
  props: { title: '新建用户', width: '480px' },
  content: { closeOn: ['success', 'cancel'] },
})
```

- `closeOn`：content 的 emit 名；触发时自动 `close()`。
- `defineLayer` 返回 `LayerDefine`（含 `exists`），供 `LayerTemplate :to` 使用。
- 仅在弹层 content 树内生效；页内直接渲染该组件时不会注册弹层配置。

### useLayer 与实例使用

```ts
const dialog = useDialog(UserForm, {
  // use tier：可跟 ref / getter 长期绑定
  // props: { id: selectedId.value }
})

dialog.open({ props: { mode: 'edit', id: 1 } }) // open tier：当次快照
dialog.close()
```

| | 说明 |
|--|------|
| `useLayer(Content?, config?)` | `createLayer` 的返回值，**不是**独立导出 |
| `open(config?)` | 打开；参数为 plain 对象；已打开时再次 `open` 只更新配置 |
| `close()` | 关闭（不卸 portal） |
| `clone(config?)` | 派生独立实例（独立 `visible`） |

`createLayer` / `defineLayer` / `useLayer` / `clone` 的配置可以是 getter 或 ref（live）；**`open(config)` 只接受普通对象**（当次快照）。需要长期跟状态时，写在 `use` / `define`，再空参 `open()`。详见 [响应式配置](#响应式配置)。

### LayerTemplate 向插槽传递内容

`LayerTemplate` 把插槽内容投到 container 或 content 的同名 slot。**`:to` 必填。**

```vue
<!-- content 内（creator）：投进 Dialog 等同名 slot -->
<LayerTemplate :to="layer" name="footer">
  <button @click="emit('success')">保存</button>
</LayerTemplate>

<!-- 调用方（caller）：远程投进 content 的同名 slot -->
<LayerTemplate :to="dialog" name="header">
  <span>自定义头部</span>
</LayerTemplate>

<!-- 调用方：远程投进 container slot（覆盖 content 内同名模板） -->
<LayerTemplate :to="dialog" container name="footer">
  <button>调用方 footer</button>
</LayerTemplate>
```

- **creator**（`:to` 为 `defineLayer()` 返回值）：固定投 container；`#default` 为目标 slot scoped props flat 透传；宿主态读 `layer.exists`。
- **caller**（`:to` 为 `LayerInstance`）：投 content slot；加 `container` 则投 container slot；`#default` 参数与目标 scoped slot 一致。
- **`visible-outside`**：页内渲染同一 content 时也显示该模板（如页内编辑也要保存按钮）。

### 配置合并

配置按 tier 合并，**后者覆盖前者**（同名字段）：

```text
open > use > use:template > define > define:template > create
```

```ts
const useDialog = createLayer(ElDialog, {
  props: { width: '480px' }, // create
})

const dialog = useDialog(UserForm, {
  container: { props: { width: '520px' } }, // use
})

dialog.open({
  container: { props: { title: '覆盖标题', width: '640px' } }, // open
})
```

- `createLayer` / `defineLayer`：顶层字段 → container，`content` 显式写 content。
- `useLayer` / `open` / `clone`：顶层字段 → content，`container` 显式写 container。

细则（slot、未知字段等）见 [配置合并规则](#配置合并规则)。

---


每次 `open` / 配置变更走：

```text
merge → adapter → refs → bind → render
```

1. **merge**：汇总各 tier 的 `content` / `container` 片段（`component` / `props` / `slots`；content 另有 `closeOn`，container 另有 `model`）。
2. **adapter**：该实例所属工厂的切面（可选）。
3. **refs**：框架内部 ref 与用户 `props.ref` 链式合并。
4. **bind**：`closeOn` → content 事件；`visible` → container `[model]` / `onUpdate:model`。
5. **render**：`h()` 挂到 portal。

Slot 与命令式 `slots` 同构，按同一优先级链合并。容器 slot 名不一致（如 Dialog `#title` vs Drawer `#header`）应在 **adapter** 里搬移 key，而不是在 merge 层维护映射表。

节点上仅白名单字段参与契约；未知键不保证经 merge 保留（见 [ADR 0004](./docs/adr/0004-merge-unknown-fields.md)）。

### 响应式配置

| API | 配置源 | 语义 |
|-----|--------|------|
| `createLayer` / `defineLayer` / `useLayer` / `clone` | `MaybeRefOrGetter` | live：getter / ref / computed 会持续订阅 |
| `open(config?)` | plain `LayerConfigContent` | 当次快照；**不**接受 getter |

典型用法：

```ts
// 调用方长期绑选中行；open 只负责打开
const dialog = useDialog(UserForm, () => ({
  props: { id: selectedId.value },
}))
dialog.open()

// content 内倒计时 title（同一次打开不 remount content）
defineLayer(() => ({
  props: { title: `请确认（${left.value}s）` },
}))
```

`clone` 对父 `use` 做 live 折叠：未覆盖字段继续跟父；`clone` 自身 source 也可是 getter。`clone` **不继承**父 `use` 的 `props.ref`。

### adapter

`adapter` 挂在 `createLayer` 第二参，是**工厂级切面**：该工厂创建的每个实例，在 merge 之后、bind 之前都会跑同一个 adapter。

```ts
type LayerAdapter = (fragment: LayerConfigFragment) => LayerConfigFragment

const useDrawer = createLayer(ElDrawer, {
  props: { direction: 'rtl', size: '360px' },
  adapter: (fragment) => {
    const container = fragment.container ?? {}
    const { title, footer, ...rest } = container.slots ?? {}
    return {
      ...fragment,
      container: {
        ...container,
        // 滤掉 Dialog 专用 props
        props: Object.fromEntries(
          Object.entries(container.props ?? {}).filter(([k]) => k !== 'width'),
        ),
        // Dialog #title → Drawer #header
        slots: {
          ...rest,
          ...(title ? { header: title } : {}),
          ...(footer ? { footer } : {}),
        },
      },
    }
  },
})
```

适合：窄屏换壳、滤无效 props、对齐 slot / `model`。`open` 可改 `container.component`，但仍走该工厂的 adapter；容器差异由 adapter 处理。

### bindHost 与生命周期

设计上，弹层实例应**归属于某个组件**（Host），便于随页面卸载一起清理。

| API | 行为 |
|-----|------|
| `open()` | 打开；**close 后再 open** 会重建 content；已打开时 `open` 只更新配置 |
| `close()` | `visible = false`，不卸 portal DOM |
| `unmount()` | 卸 portal；**不**清除已绑定的 host |
| Host `onUnmounted` | 自动 `dispose`（卸 portal）并清空 host |

```ts
// 页面 setup 内创建：自动 bindHost，组件卸载时弹层一并清理
const dialog = useDialog(UserForm)

// 模块级单例：须在 App / ConfigProvider 子树内 setup 调用
export const messageBox = useDialog(AlertContent)
// App.vue setup:
messageBox.bindHost()
```

`clone()` 走完整实例创建，在调用点的 setup 内自动 `bindHost`；与父实例的 host 无关。

弹层 portal 挂在 `document.body`，与 Host 组件树 DOM 分离。为让 content 仍能 `inject` 祖先 provide（如 `ElConfigProvider` 的 locale / size），每个实例维护自己的 `host`：

- `useLayer` / `clone` 在 setup 内创建时自动 `bindHost()`。
- 模块顶层创建时无 setup，保持 bare portal；需要 inject 时再手动 `bindHost()`。
- 同一 host 重复绑定为 no-op；绑到其他 host 或非 setup 调用时开发环境 warn。

未 `bindHost` 仍可 `open()`，只是 content 拿不到 Host 子树的 provide。

---

## API

### `createLayer`

```ts
function createLayer(
  Container: Component,
  config?: MaybeRefOrGetter<LayerConfigCreate>,
): typeof useLayer
```

- `LayerConfigCreate`：container 扁平字段 + 可选 `content` + 可选 `adapter`。
- 返回的 `useLayer` 闭包绑定该工厂的 `create` tier 与 `adapter`。

### `defineLayer`

```ts
function defineLayer(
  config?: MaybeRefOrGetter<LayerConfigContainer>,
): LayerDefine
```

- 在 content `setup` 内调用；注册 `define` tier。
- 返回值：`{ exists }`，作 `LayerTemplate` 的 `:to`。`exists` 表示这份 define 是否有 live LayerView 上下文（direct layer content）。

### `useLayer`

```ts
function useLayer(
  Content?: Component,
  config?: MaybeRefOrGetter<LayerConfigContent>,
): LayerInstance
```

`createLayer` 的返回值，**不是**包的独立导出。

### `LayerInstance`

| 成员 | 说明 |
|------|------|
| `open(config?)` | 打开；`config` 为 plain 快照 |
| `close()` | 关闭 |
| `unmount()` | 卸 portal DOM |
| `clone(config?)` | 独立实例；`config` 可为 live |
| `visible` | 只读是否打开 |
| `contentRef` | 打开时指向 content 实例，否则 `null` |
| `containerRef` | 打开时指向 container 实例，否则 `null` |
| `bindHost()` | 绑定当前 setup 的 Host |

### `LayerTemplate`

```vue
<LayerTemplate
  :to="layerOrInstance"
  name="footer"
  container?          <!-- 仅 caller：投 container slot -->
  visible-outside?    <!-- 页内也渲染 -->
>
  ...
</LayerTemplate>
```

Creator / caller 的 `#default` 均为目标 slot scoped props flat 透传；宿主态用 `layer.exists`。

### `LayerNoContainer`

公开标记容器：无外壳。用作 `createLayer` 的 Container，或在 adapter / use / open 中换成它时，渲染拍平为 `h(content)`（content props 覆盖 container props）。用于存量单体弹层的渐进接入，见 [ADR 0001](./docs/adr/0001-legacy-monolith-progressive-adoption.md)。

### 类型（节选）

| 类型 | 说明 |
|------|------|
| `LayerConfigCreate` | `createLayer` 第二参（Raw flat） |
| `LayerConfigContainer` | `defineLayer` 配置（顶层 = container） |
| `LayerConfigContent` | `use` / `open` / `clone`（顶层 = content） |
| `LayerConfigFragment` | Canonical 双侧分栏；adapter / store |
| `LayerBound` | bind 输出，可 `h()` |
| `LayerAdapter` | `(fragment) => fragment` |
| `LayerDefine` | `defineLayer` 返回值（含 `exists`） |

配置域命名见 [docs/config-naming.md](./docs/config-naming.md)。

---

## SSR

可用于 SSR 应用（Nuxt、Vite SSR 等）。弹层为客户端 UI：模块单例请在客户端 setup 内 `bindHost()`，`open()` 在 `onMounted` 或用户交互后调用；服务端不会输出弹层 HTML。

## 限制

- 模块级单例须在 App / ConfigProvider 子树内调用 `bindHost()`，否则 content 无法 `inject` 全局配置。

## 从 0.x 迁移

- **0.0.1** 为占名占位；请升级并参照 [CHANGELOG 0.1.0](./CHANGELOG.md#010---2026-06-27)（`show/hide` → `open/close`，移除 `LayerBind` 等）。
- **0.1.0 → 1.0 beta**：类型重命名等见 [CHANGELOG 1.0.0-beta.1](./CHANGELOG.md#100-beta1---2026-07-15)。

## License

MIT
