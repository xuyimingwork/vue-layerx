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

在上面的用法里，内容组件可以是任意的普通 vue 组件。我们希望组件既可以用在普通场景里，也可以无痛用到弹层里。

但弹层场景下，内容组件常常还要回答两件事：

- 在弹层里打开时，外面弹层容器的标题、宽度等应该是什么？
- 用户点了组件内的按钮，比如「保存 / 取消」等，要不要关掉弹层？

这些东西只有内容组件的作者自身最清楚，如果使用方配置，每次 `open` 时都要传一遍，很麻烦又需要使用方深入内容组件。

所以需要有个工具来配置内容组件在弹层内的整体表现，它就是 `defineLayer`。

可以这样配置容器：

```vue
<!-- HelloWorld.vue -->
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

defineLayer({
  props: { title: '我的弹层', width: '480px' }
})
</script>
<template>
  <p>Hello World</p>
</template>
```

同时，可以配置如何监听内容组件的事件来关闭弹层

```vue
<!-- HelloWorld.vue -->
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

defineLayer({
  props: { title: '我的弹层', width: '480px' },
  content: {
    closeOn: ['ok']
  }
})
const emit = defineEmits(['ok'])
</script>
<template>
  <p>Hello World</p>
  <button @click="emit('ok')">OK</button>
</template>
```

`defineLayer` 中的所有配置，仅在 `HelloWorld.vue` 作为弹层内容组件时生效，`HelloWorld.vue` 在其它场景中使用与普通组件没有任何区别。

### useLayer 与实例使用

有容器、有内容后，就可以用 `useLayer` 创建弹层实例了。

```vue
<!-- App.vue -->
<script setup lang="ts">
import HelloWorld from './HelloWorld.vue'
import { useDialog } from './dialog'

const dialog = useDialog(HelloWorld)
</script>

<template>
  <button @click="dialog.open()">
    打开弹层
  </button>
  <button @click="dialog.close()">
    关闭弹层
  </button>
</template>
```

> 注意 `useLayer` 并不是 `vue-layerx` 导出的函数，而是由 `createLayer` 返回的。可以起自己喜欢的名字，比如：`useDialog`、`useDrawer` 等。

> 由于容器标题、closeOn 等已经在 `defineLayer` 中配置，这里的 `useDialog` 和 `open` 可以不需要任何参数，就能达成效果。

#### 用 open 向内容组件传参

`dialog.open` 允许向内容组件传入参数：

```vue
<!-- App.vue -->
<template>
  <button @click="dialog.open({ props: { id: 1, mode: 'edit' } })">
    打开弹层
  </button>
</template>
```

#### 用 useLayer 向内容组件传参

一些每次打开都要传递的参数，可以放在 useLayer 中，简化 open 时的传参：

```vue
<!-- App.vue -->
<script setup lang="ts">
// ...
const dialog = useDialog(HelloWorld, {
  props: { mode: 'edit' }
})
</script>

<template>
  <button @click="dialog.open({ props: { id: 1 } })">
    打开弹层
  </button>
</template>
```

#### 顶层 props 指哪一侧

前面两处都出现了顶层 `props`，但含义不一样：

| API | 顶层 `props` → |
|-----|----------------|
| `createLayer` / `defineLayer` | **容器**（如 `title`、`width`） |
| `useLayer` / `open` / `clone` | **内容**（如 `id`、`mode`） |

另一侧要显式写出字段名：内容侧用 `content`，容器侧用 `container`。

```ts
// defineLayer：顶层 props = 容器
defineLayer({ props: { title: '编辑用户' } })
// open：顶层 props = 内容；改标题要走 container
dialog.open({
  props: { id: 1 },
  container: { props: { title: '当次标题' } },
})
```

### LayerTemplate 向插槽传递内容

前面例子里，内容只进入容器的 `default` 插槽。实际使用中，容器往往有其它插槽，比如：

```vue
<!-- HelloWorld.vue -->
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

defineLayer({
  // ...
})
</script>
<template>
  <p>Hello World</p>
  <button @click="emit('ok')">OK</button>
</template>
```

如何把 `button` 投到 `ElDialog` 的 `footer` 中呢？

`vue-layerx` 提供了 `LayerTemplate`，只需要：

```vue
<!-- HelloWorld.vue -->
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const layer = defineLayer({
  // ...
})
</script>
<template>
  <p>Hello World</p>
  <LayerTemplate :to="layer" name="footer">
    <button @click="emit('ok')">OK</button>
  </LayerTemplate>
</template>
```

`LayerTemplate` 包裹的内容默认不会渲染，只会在弹层中使用时，将内容投递到对应的插槽中去。

#### 使用方的插槽投递

内容组件可以给容器组件的插槽投递东西，同样，使用方能给内容组件和容器组件投递东西。

```vue
<!-- App.vue -->
<script setup lang="ts">
// ...
const dialog = useDialog(HelloWorld)
</script>

<template>
  <button @click="dialog.open({ props: { id: 1 } })">
    打开弹层
  </button>
  <LayerTemplate :to="dialog" name="header">
    <span>给内容组件的自定义头部</span>
  </LayerTemplate>
  <LayerTemplate :to="dialog" container name="footer">
    <button>给容器组件的自定义 footer（覆盖内容组件的 footer）</button>
  </LayerTemplate>
</template>
```

### 配置合并

前面的例子里在各种不同的地方都出现了配置。它们的优先级是如何计算的呢？

`vue-layerx` 内部有一条严格的配置覆盖机制，常用的优先级是

`instance.open` > `useLayer` > `defineLayer` > `createLayer`

对于 `LayerTemplate` 投递的模板来说：

- `useLayer` > to dialog template > `defineLayer`
- `useLayer` > to layer template > `createLayer`

### 响应式配置

### adapter

### bindHost 与生命周期

## API（TODO:）

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
- **1.0.0-beta.1 → beta.2**：`confirm()`、`exists` 替代 `inLayer`/`outsideLayer`、`closeOn` 按 event patch 等见 [CHANGELOG 1.0.0-beta.2](./CHANGELOG.md#100-beta2---2026-07-20)。

## License

MIT
