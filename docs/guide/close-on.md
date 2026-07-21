# 事件关层 closeOn

内容组件应按普通子组件来写：**props in / emits out**。关层发生在内容之外。

```text
content.emit('ok')  →  closeOn 接线  →  LayerInstance.close()
```

## 基本写法

在 `defineLayer`（或 use / open）里声明哪些事件触发关层：

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

数组糖会为列出的事件接上「emit 后 close」。

## 对象写法

需要按条件关层、或配合 `confirm()` 区分「确认 / 取消」时，用对象：

```ts
defineLayer({
  content: {
    closeOn: {
      submit: { confirmed: true },
      cancel: true,
      // when: (payload) => payload?.ok === true
    },
  },
})
```

- `confirmed: true`：走 `confirm()` 的 resolve 路径  
- 默认数组糖相当于 `confirmed: false`（`confirm()` 会走 reject / close 路径）  
- `when` 可精细控制是否关层；`when: 'none'` / `false` 可去掉某事件的关层

跨 tier 时 `closeOn` 按**事件名 patch**合并，不是整表替换。细节见 [配置合并](/guide/config-merge) 与 [API：配置](/api/config)。

## 和使用方监听的关系

使用方仍可在配置里写 `onOk` 等；框架会把 `closeOn` 接到同一事件链上（先用户监听，再按策略 close）。内容侧不必知道外面有没有弹层。

## 下一步

[LayerTemplate](/guide/layer-template) — 用模板把 footer 投进容器插槽
