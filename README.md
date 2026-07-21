# vue-layerx

让弹层通过命令方式调用，三行代码打开弹窗：

```ts
const useDialog = createLayer(ElDialog)
const dialog = useDialog(HelloWorld)
dialog.open()
```

## 特性

- 无需维护弹层显示变量
- 无需在模板内编写弹层样板代码
- 弹层参数响应式传递
- 弹层插槽模板式编写
- 零外部依赖，不依赖三方 npm 包
- 使用 TypeScript 编写，提供完整的类型定义
- 单元测试覆盖率 100%，提供稳定性保障
- 支持服务端渲染

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

## 首个命令式弹层

### 获取组合式函数

任意弹层 **容器组件** 都可以通过 `createLayer` 生成对应的组合式函数。以 Dialog 为例：

```ts
// dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

> 弹层：Dialog、Drawer、Popup 等弹出式交互形态的统称。

### 获取弹层实例

有了 `useDialog` 后，传入 **内容组件** 即可得到弹层实例：

```vue
<!-- HelloWorld.vue -->
<template>
  <p>Hello World</p>
</template>
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import HelloWorld from './HelloWorld.vue'
import { useDialog } from './dialog'

const dialog = useDialog(HelloWorld)
</script>
```

### 使用弹层实例

调用 `open()` 打开弹层：

```vue
<!-- App.vue -->
<script setup lang="ts">
  /* ... */
</script>

<template>
  <button @click="dialog.open()">
    打开弹层
  </button>
</template>
```

## 文档

完整用法、进阶能力与 API 见文档站：

- [指南](https://xuyimingwork.github.io/vue-layerx/guide/introduction)
- [API](https://xuyimingwork.github.io/vue-layerx/api/)
- [Playground](https://xuyimingwork.github.io/vue-layerx/playground/)

## License

MIT
