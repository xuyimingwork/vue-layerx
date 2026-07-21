# 快速上手

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

需要 Vue `^3.5.0`（peerDependency）。

## 用 createLayer 得到组合式函数

任意弹层**容器组件**都可以交给 `createLayer`，生成你项目里的 `useDialog` / `useDrawer` 等：

```ts
// dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

> **弹层**：Dialog、Drawer、Popup 等弹出式交互的统称。

容器 = 靠 v-model（或同类显隐 prop）控制显示、通常带 default 插槽的组件。Element Plus、Ant Design Vue、Vant、项目内 `BaseDialog` 都可以。

## 传入内容并打开

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

注意：`useDialog` **不是**从 `vue-layerx` 直接导出的，而是你用 `createLayer` 自己生成的；名字可以叫 `useDrawer`、`usePopup` 等。

## 下一步

按顺序往下读即可：

1. [创建弹层组合式函数](/guide/create-layer) — 默认宽度、`model` 名  
2. [打开与关闭](/guide/open-close) — 怎么给内容传参  
3. [在内容里声明默认](/guide/define-layer) — 标题等默认值写在内容组件旁  
