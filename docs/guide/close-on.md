# 用事件关闭弹层

内容组件按普通子组件来写即可：**props 进来，事件出去**。不要在内容里去调 `dialog.close()`。

用户点了「确定」时，内容只 `emit`；是否关弹层，由外侧的 `closeOn` 声明。

```text
内容 emit('ok')  →  closeOn 匹配到 ok  →  关闭弹层
```

## 最常见写法：事件名列表

在 `defineLayer` 里列出「哪些事件要关层」：

```vue
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

defineLayer({
  props: { title: '我的弹层', width: '480px' },
  content: {
    closeOn: ['ok'],
  },
})

const emit = defineEmits(['ok'])
</script>

<template>
  <p>Hello World</p>
  <button @click="emit('ok')">OK</button>
</template>
```

`closeOn` 也可以写在 `useDialog` / `open` 的配置里，用来覆盖或补充内容侧的默认。

## 调用方仍可监听同一事件

调用方照常可以写自己的 `onOk`；框架会先走到你的监听，再按 `closeOn` 决定是否关闭。内容组件不必关心外面有没有弹层。

## 更细的写法（可选）

需要「仅部分情况关层」，或以后要用 `confirm()` 区分确认 / 取消时，再改成对象形式：

```ts
defineLayer({
  content: {
    closeOn: {
      submit: { confirmed: true },
      cancel: true,
    },
  },
})
```

日常关层用列表 `['ok']` 足够。若配合 `confirm()`，确认类事件须显式 `{ confirmed: true }`（见上例 `submit`）。更多见 [实例的更多能力](/guide/instance) 与 [API：配置](/api/config)。

多处都写了 `closeOn` 时怎么合并，见 [配置如何合并](/guide/config-merge)。

## 下一步

[用模板填写插槽](/guide/layer-template)
