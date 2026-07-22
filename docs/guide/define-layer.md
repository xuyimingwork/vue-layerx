# 在内容里声明默认

内容组件首先是普通 Vue 组件。当它被放进弹层时，内容作者通常还知道：

- 弹层标题、宽度等默认应该是什么  
- （下一章）用户点了「确定」要不要关弹层  

这些若每次都由调用方在 `open` 里传，又烦又容易漏。`defineLayer` 写在**内容组件自己的文件里**，只描述「作为弹层内容时」的默认表现。

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

## 页内当普通组件用不受影响

同一份 `HelloWorld.vue` 在页面里直接使用时，不会因为写了 `defineLayer` 就多出一个 Dialog。这些默认只在它被 vue-layerx 当作弹层内容打开时生效。

## 返回值里的 exists（可选）

```ts
const layer = defineLayer({ props: { title: '…' } })

// true：当前正作为弹层内容被打开
// false：页内普通使用，或嵌套在别的组件里
layer.exists
```

多数场景先不用管。等需要「页内一套按钮、弹层里另一套」时，再配合 [用模板填写插槽](/guide/layer-template) 里的 `visible-outside`。

返回值**没有** `open` / `close`——关弹层不在内容里调，见下一章。

## 下一步

[用事件关闭弹层](/guide/close-on)
