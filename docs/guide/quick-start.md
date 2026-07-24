# 快速上手

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

需要 Vue `^3.3.0`（peerDependency）。

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

## 下一步

按侧栏「基础」顺序往下读即可：

1. [创建弹层组合式函数](/guide/create-layer) — 默认宽度、`model` 名  
2. [打开与关闭](/guide/open-close) — 给内容传参、顶层 `props` 指哪一侧  
3. [在内容组件里配置弹层](/guide/define-layer) — 标题等默认值写在内容组件旁  
4. [用事件关闭弹层](/guide/close-on) — 内容 `emit` + `closeOn`  
5. [用模板填写插槽](/guide/layer-template) — 往 `footer` 等具名插槽投递  

容器与表单还粘在一个文件里、暂时拆不开？进阶里见 [容器与内容未拆分](/guide/no-container)。
