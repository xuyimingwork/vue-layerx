# 用模板填写插槽

到目前为止，内容只会出现在容器的**默认插槽**里。但 `ElDialog` 等通常还有 `footer`、`header` / `title` 等具名插槽。

问题在于：内容写在自己的 `.vue` 里，容器又是 `open()` 时远程挂上的——你没法像平时那样写：

```vue
<ElDialog>
  <template #footer>…</template>
</ElDialog>
```

`LayerTemplate` 就是用**仍然熟悉的模板语法**，把一块内容投到目标组件的同名插槽里。

## 在内容组件里填容器的 footer

```vue
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const layer = defineLayer({
  props: { title: '我的弹层' },
  content: { closeOn: ['ok'] },
})
const emit = defineEmits(['ok'])
</script>

<template>
  <p>Hello World</p>
  <LayerTemplate :to="layer" name="footer">
    <button @click="emit('ok')">OK</button>
  </LayerTemplate>
</template>
```

记住三点：

1. `:to` 必填——这里传 `defineLayer()` 的返回值  
2. `name` 和容器上的插槽名一致（如 `footer`）  
3. 这块内容默认**不会**显示在内容组件原来的位置，只在弹层打开时出现在对应插槽里  

## 调用方也可以投递（稍后再用也行）

打开弹层的页面，可以把模板投给**内容**的插槽，或覆盖**容器**的插槽：

```vue
<script setup lang="ts">
const dialog = useDialog(HelloWorld)
</script>

<template>
  <button @click="dialog.open({ props: { id: 1 } })">打开</button>

  <!-- 填内容组件上的 <slot name="header"> -->
  <LayerTemplate :to="dialog" name="header">
    <span>自定义头部</span>
  </LayerTemplate>

  <!-- 填容器的 footer（可盖过内容里写的 footer） -->
  <LayerTemplate :to="dialog" container name="footer">
    <button>调用方 footer</button>
  </LayerTemplate>
</template>
```

| 写法 | 填到哪里 |
|------|----------|
| 内容里 `:to="layer"` | 容器的同名插槽 |
| 页面里 `:to="dialog"` | 内容的同名 `<slot>` |
| 页面里再加 `container` | 容器的同名插槽 |

先掌握「内容里填 footer」就够用；调用方投递等真正需要再回来看。

## 页内也要显示同一块区域时

有时同一组件既在页内用、又在弹层里用，页内也要按钮。加上 `visible-outside`，并配合 `layer.exists` 分支：

```vue
<LayerTemplate :to="layer" name="footer" visible-outside>
  <div v-if="!layer.exists">页内操作区</div>
  <button v-else @click="emit('ok')">弹层内 OK</button>
</LayerTemplate>
```

完整例子见 [实践教程：内容复用：页内 / Dialog / Drawer](/guide/cookbook/content-reuse)；调用方投递见 [弹层插槽怎么填](/guide/cookbook/layer-template)。

## 插槽作用域参数

和普通 `#footer="{ xxx }"` 一样，可以用 `v-slot` 接收目标插槽传下来的参数。

## 下一步

基础用法到这里可以告一段落。若配置写在多处、不知道谁覆盖谁，读 [配置如何合并](/guide/config-merge)。
