# 快速上手

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

peer：`vue` `^3.5.0`。

## 创建工厂

任意弹层**容器组件**都可以通过 `createLayer` 生成组合式函数：

```ts
// dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

> **弹层**：Dialog、Drawer、Popup 等弹出式交互形态的统称。

容器就是靠 v-model 控制显示隐藏、通常有 default slot 的组件。Element Plus、Ant Design Vue、Vant、项目内 `BaseDialog` 都可以。

## 创建实例并打开

内容可以是任意普通组件：

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

<template>
  <button @click="dialog.open()">打开弹层</button>
</template>
```

`useDialog` **不是**包的独立导出，而是 `createLayer` 的返回值；项目里可叫 `useDrawer`、`usePopup` 等。

## 下一步

- [创建弹层工厂](/guide/create-layer) — 默认 props、`model`
- [打开与关闭](/guide/open-close) — 向内容传参
- [defineLayer](/guide/define-layer) — 在内容里声明标题与关层
