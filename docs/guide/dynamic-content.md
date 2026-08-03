<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/dynamic-content/App.vue'
import AppSource from '../examples/dynamic-content/App.vue?raw'
import ProfileSource from '../examples/dynamic-content/ProfileForm.vue?raw'
import NoteSource from '../examples/dynamic-content/NoteForm.vue?raw'
import AsyncDemo from '../examples/dynamic-content/AsyncApp.vue'
import AsyncAppSource from '../examples/dynamic-content/AsyncApp.vue?raw'
import HeavySource from '../examples/dynamic-content/HeavyForm.vue?raw'
</script>

# 动态指定内容组件

多数时候在 `useDialog(UserForm)` 里绑死内容即可。若打开前才知道要弹哪一个（路由式调度、AI 意图驱动的表单等），可以**创建实例时不传内容**，在 `open` 里再传入 `component`。

```ts
const dialog = useDialog()

dialog.open({ component: UserForm, props: { id: 1 } })
dialog.open({ component: SupplierForm, props: { orderId } })
```

## Demo

选一个内容组件，再点打开——同一次创建的实例，按当次 `component` 挂载：

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'ProfileForm.vue', code: ProfileSource },
    { name: 'NoteForm.vue', code: NoteSource },
  ]"
/>

## 异步组件

需要按需加载时，先 `await` 动态 `import`（可自行加延迟 / 缓存），按钮上用 `loading` 反映等待；模块就绪后再 `open({ component })`：

```ts
const loading = ref(false)

async function openHeavy() {
  loading.value = true
  try {
    const { default: component } = await import('./HeavyForm.vue')
    layer.open({ component })
  } finally {
    loading.value = false
  }
}
```

<DemoBlock
  :demo="AsyncDemo"
  :files="[
    { name: 'AsyncApp.vue', code: AsyncAppSource },
    { name: 'HeavyForm.vue', code: HeavySource },
  ]"
/>

也可以直接把 Vue 的 `defineAsyncComponent` 传给 `open`（加载态画在弹层内，用它的 `loadingComponent` / `errorComponent`）。要在**触发按钮**上展示「组件加载中」，用上面这种先 await 再 open 更直观。

## 和固定内容怎么选

| 场景 | 写法 |
|------|------|
| 页面里就知道弹哪个 | `useDialog(UserForm)`（基础用法） |
| 运行时才定、或同实例换不同内容 | `useDialog()` + `open({ component })` |
| 同一内容既弹层又嵌页 | 见实践 [综合案例](/guide/cookbook/form-workflow) |

未绑内容且本次 `open` 也未传 `component` 时，层没有业务体（空壳）；改标题、宽度请走 `container:`，见 [打开与关闭](/guide/open-close#可以不传内容组件)。

## 也可以换容器组件

顶层 `component` 指**内容**；要换壳（例如当次用 Drawer）写在 `container` 里：

```ts
dialog.open({
  props: { id: 1 },
  container: { component: ElDrawer },
})
```

`useDialog(Content, { container: { component } })` 同理。换壳后插槽名、`model` 等协议要自己对齐（或用 [adapter](/guide/adapter) 统一改）；换成「无外层容器」见 [容器与内容未拆分](/guide/no-container)。Vue 2.7 上打开后再换容器的差异见 [Vue 2.7 兼容](/guide/vue2)。

## 下一步

`confirm` 等结果见 [等待弹层结果](/guide/confirm)。`bindHost` / Host 见 [上下文与生命周期](/guide/context-lifecycle)；`clone` 等见 [实例的更多能力](/guide/instance)。
