# defineLayer

内容组件可以是任意普通 Vue 组件。弹层场景下，内容作者往往还要回答：

- 打开时，外层容器的标题、宽度等默认是什么？
- 用户点了「保存 / 取消」等，要不要关层？

这些只有内容作者最清楚；若每次 `open` 都由使用方传一遍，又烦又容易传错。`defineLayer` 用来在内容文件里**声明「作为弹层内容时」的默认表现**。

## 配置容器默认

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

在 `defineLayer` 中，**顶层 `props` 仍指容器**。

## 仅在弹层托管时生效

`defineLayer` 的配置只在该组件作为**弹层内容根**被框架托管时生效。同一组件在页内普通使用时，与没有 `defineLayer` 一样，不会凭空多出一个 Dialog。

## exists

`defineLayer` 返回 `LayerDefine`（不是带 `open`/`close` 的实例）：

```ts
const layer = defineLayer({ props: { title: '…' } })

layer.exists // 作为 direct layer content 时为 true，页内 / 嵌套子树内为 false
```

常用于模板分支（例如页内与弹层 footer 不同），配合 [LayerTemplate](/guide/layer-template) 的 `visible-outside`。

## 与关层的关系

`defineLayer` **不**提供 `close()`。内容完成路径应 `emit`，再由 `closeOn` 在外侧关层——见 [事件关层](/guide/close-on)。

## 下一步

[事件关层 closeOn](/guide/close-on)
