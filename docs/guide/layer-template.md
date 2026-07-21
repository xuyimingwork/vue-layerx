# LayerTemplate

内容默认只进入容器的 `default` 插槽。组件库 Dialog 通常还有 `footer`、`title` 等具名插槽——内容写在另一个 SFC 里、壳又是命令式远程挂载时，普通 `<template #footer>` 用不了。

`LayerTemplate` 用**模板语法**声明一块具名模板，投递到目标组件的同名 slot。

## 内容侧投递到容器

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

- `:to` **必填**：内容侧传 `defineLayer()` 的返回值  
- `name` 与目标 slot 同名（如 `footer`）  
- 包裹内容默认**不在原位置渲染**；仅在弹层中作为 slot 渲染  

## 调用方投递

使用方可以把模板投进**内容**或**容器**的插槽：

```vue
<script setup lang="ts">
const dialog = useDialog(HelloWorld)
</script>

<template>
  <button @click="dialog.open({ props: { id: 1 } })">打开</button>

  <!-- 投进内容组件的同名 <slot> -->
  <LayerTemplate :to="dialog" name="header">
    <span>给内容的自定义头部</span>
  </LayerTemplate>

  <!-- 投进容器同名 slot（可覆盖内容侧 footer） -->
  <LayerTemplate :to="dialog" container name="footer">
    <button>调用方 footer</button>
  </LayerTemplate>
</template>
```

| 写法 | 目标 |
|------|------|
| 内容内 `:to="layer"` | 容器同名 slot |
| 调用方 `:to="instance"` | 内容同名 `<slot>` |
| 调用方 `:to` + `container` | 容器同名 slot（高于内容侧模板） |

## visible-outside

需要**页内也展示**同一块 UI（例如页内编辑也要保存按钮）时：

```vue
<LayerTemplate :to="layer" name="footer" visible-outside>
  <div v-if="!layer.exists">页内操作区</div>
  <button v-else @click="emit('ok')">弹层内 OK</button>
</LayerTemplate>
```

- `visible-outside`：页内在原位置渲染  
- 弹层内仍通过 slot 投递；宿主态用 `layer.exists` 分支  

完整业务故事见 [实践：visible-outside](/guide/cookbook/visible-outside)。

## scoped 透传

`#default` 收到目标 slot 的 scoped props（flat 透传），与在父组件写 `#footer="{ … }"` 类似。

## 下一步

[配置合并](/guide/config-merge)
