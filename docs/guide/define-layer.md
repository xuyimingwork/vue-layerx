<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/define-layer/App.vue'
</script>

# 在内容组件里配置弹层

标题、宽度这类「作为弹层打开时」的默认，若总在 `open` 里传，又烦又容易漏。用 `defineLayer` 写在**内容组件自己的文件里**，只在它被 vue-layerx 当作弹层内容打开时生效。

## 声明容器默认（标题、宽度等）

```vue
<!-- HelloWorld.vue -->
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

defineLayer({
  props: { title: '我的弹层', width: '480px' },
})
</script>

<template>
  <p>Hello World</p>
</template>
```

和 `createLayer` 一样：这里顶层的 `props` 作用在**容器**上（标题、宽度，以及容器自己的能力如 `beforeClose` 等，都会透传）。

配好之后，调用方常常可以直接 `dialog.open()`，不必再传标题。

## 当普通组件使用

同一份内容组件在页面里直接使用时，不会因为写了 `defineLayer` 就多出一个 Dialog。这些默认只在它被当作弹层内容打开时生效。

<DemoBlock :demo="Demo" preview-only />

## 区分是否弹层中使用

上面 Demo 的「当前：…」来自 `defineLayer` 返回值上的 `exists`：

```ts
const layer = defineLayer({ props: { title: '…' } })

layer.exists // true：弹层中；false：页内等普通使用
```

只声明标题、宽度时用不到。需要「页内 / 弹层两套操作」时，见 [复用内容组件](/guide/cookbook/content-reuse)。

## 下一步

标题、宽度解决的是「打开时长什么样」。用户点了确定之后要不要关层，同样可以在内容里用 `defineLayer` 声明——见 [用事件关闭弹层](/guide/close-on)。
