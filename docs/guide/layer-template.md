<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/layer-template/App.vue'
import AppSource from '../examples/layer-template/App.vue?raw'
import ContentSource from '../examples/layer-template/HelloContent.vue?raw'
</script>

# 向弹层投递插槽

上一章把确定做成内容里的按钮：

```vue
<template>
  <p>Hello World</p>
  <button @click="emit('ok')">OK</button>
</template>
```

实际项目里，确定按钮常常希望出现在容器的 `footer`。

但内容组件里并没有 `ElDialog`，没法像平时那样写：

```vue
<ElDialog>
  <template #footer>…</template>
</ElDialog>
```

`LayerTemplate` 就是用**仍然熟悉的模板语法**，把一块内容投到目标组件的同名插槽里。

## 在内容里填容器的 footer

把按钮用 `LayerTemplate` 包起来，投到容器的 `footer`：

```vue
<template>
  <p>Hello World</p>
  <LayerTemplate :to="layer" name="footer">
    <button @click="emit('ok')">OK</button>
  </LayerTemplate>
</template>
```

`layer` 是 `defineLayer()` 的返回值。这块内容不会留在正文里，只会出现在容器的 `footer`。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'HelloContent.vue', code: ContentSource },
    { name: 'App.vue', code: AppSource },
  ]"
/>

## 调用方也可以往内容里塞插槽

调用方若要往内容的具名插槽里塞东西，页面上通常也没有直接写内容组件，没法用普通的 `#header`：

```vue
<HelloWorld>
  <template #header>…</template>
</HelloWorld>
```

同样用 `LayerTemplate`，`:to` 换成实例：

```vue
<LayerTemplate :to="dialog" name="header">
  <span>自定义头部</span>
</LayerTemplate>
```

内容里需要有 `<slot name="header" />`。若要改容器插槽（例如盖掉内容写的 `footer`），加 `container` 即可，见 [配置如何合并](/guide/config-merge)。

## 也可以用 JSX

若项目里内容都用 JSX 写，也可以在配置的 `slots` 里用 JSX（或 `h()`）投递插槽，不必再用 `LayerTemplate`。与上面同一场景：

```tsx
import { ElButton } from 'element-plus'

const layer = defineLayer({
  props: { title: '我的弹层', width: '420px' },
  content: { closeOn: ['ok'] },
  slots: {
    footer: () => (
      <ElButton type="primary" onClick={() => emit('ok')}>
        确定
      </ElButton>
    ),
  },
})
```

`use` / `open` 同理。同一侧写入时，配置里的 `slots` 高于同名的 `LayerTemplate`，见 [配置如何合并](/guide/config-merge)。

## 下一步

基础用法到这里可以告一段落。

- 页内也要看见同一块操作区：见实践 [页内与弹层共用操作区](/guide/cookbook/action-dual-host)
- Props、插槽优先级，以及挂卸载 / 改 `name` 时的注册细节：见 [API：LayerTemplate](/api/layer-template)
- 设计决策：见 [设计决策](/guide/design)
- 谁覆盖谁：见 [配置如何合并](/guide/config-merge)
