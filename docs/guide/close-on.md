# 用事件关闭弹层

上一章用 `defineLayer` 配了标题、宽度。关层也写在同一份配置里：内容只负责 `emit`，用 `closeOn` 声明「哪些事件要关弹层」。

```text
内容 emit('ok')  →  closeOn 匹配到 ok  →  关闭弹层
```

## 在内容里声明 closeOn

最常见写法是事件名列表：

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

`closeOn` 写在 `content` 下；顶层的 `props` 仍是给容器的，和上一章一样。

> 或许会觉得：内容先 `emit`，再在 `defineLayer` 里声明「这个事件要关层」，有点绕——为什么不直接在内容里提供 `close()` 之类的 API？
>
> 因为内容首先是普通组件（**props 进来，事件出去**）；`defineLayer` / `closeOn` 只是在这套行为上面补一层「放进弹层时」的适配。弹层和页内嵌入一样，都是内容的使用方。所以关层是「听到内容某个事件之后」的行为，而不是内容主动去关。

## 按条件关层：when

需要「只有部分情况才关」时，在列表里对单个事件写上 `when`：

```ts
defineLayer({
  content: {
    closeOn: [
      { event: 'submit', when: (payload) => payload?.ok === true },
      'cancel',
    ],
  },
})
```

上面等价于对象写法（语法糖）：

```ts
defineLayer({
  content: {
    closeOn: {
      submit: { when: (payload) => payload?.ok === true },
      cancel: true, // 同 'cancel' / { when: 'always' }
    },
  },
})
```

| 写法 | 含义 |
|------|------|
| `'ok'` / `ok: true` / `{ when: 'always' }` | 该事件触发即关 |
| `{ event: 'ok', when: fn }` / `ok: { when: fn }` | 返回 `true` 才关 |
| `ok: false` / `{ when: 'none' }` | 不关（常用来盖掉内容默认） |

## 覆盖 closeOn

内容侧的 `closeOn` 是默认；要盖掉其中某一条，写在 `useDialog` 的第二参即可——和 [打开与关闭](/guide/open-close) 里给实例写默认一样。

例如内容里 `ok`、`cancel` 都会关：

```ts
defineLayer({
  content: {
    closeOn: ['ok', 'cancel'],
  },
})
```

调用方想只在 `cancel` 事件时关闭，可以覆盖 `ok` 的关闭配置：

```ts
const dialog = useDialog(HelloWorld, {
  closeOn: { ok: false },
})
```

之后点 cancel 仍会关；点 ok 会 `emit('ok')`，但弹层不关。

只有某一次打开要临时改时，也可以写在那次的 `open` 里。多处如何合并，见 [配置如何合并](/guide/config-merge)。

## 关层之外，事件照样能听

`closeOn` 只管「要不要关」，不会把事件吃掉。内容 `emit('ok')` 之后，外面仍可以像用普通组件一样传 `onOk`，做关层以外的事：

```ts
dialog.open({
  props: {
    onOk: () => {
      // 比如记下选中项、发请求……
    },
  },
})
```

顺序是：先跑你的 `onOk`，再按 `closeOn` 决定关不关。

## 下一步

确定按钮常常要放到容器的 `footer` 插槽里，而不是堆在内容中间——见 [用模板填写插槽](/guide/layer-template)。
