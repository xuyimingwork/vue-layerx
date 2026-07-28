# vue-layerx

让弹层通过命令方式调用，三行代码打开弹窗：

```ts
const useDialog = createLayer(ElDialog)
const dialog = useDialog(HelloWorld)
dialog.open()
```

- 📚 文档：[官网](https://xuyimingwork.github.io/vue-layerx/) [![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/xuyimingwork/vue-layerx)

## 特性

- 无需维护弹层显示变量
- 无需在模板内编写弹层样板代码
- 弹层参数响应式传递
- 弹层插槽模板式编写
- 零外部依赖，不依赖三方 npm 包
- 使用 TypeScript 编写，提供完整的类型定义
- 单元测试覆盖率 100%，提供稳定性保障
- 集成测试消费发布面 `dist`（见 `tests-vue3`）
- 支持服务端渲染

## 开发与测试

```bash
pnpm test                 # unit（源码）
pnpm build
pnpm test:integration     # Vue 3 集成（只 import vue-layerx → dist）
```

详见 [TESTING.md](./TESTING.md)。

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

## License

MIT
