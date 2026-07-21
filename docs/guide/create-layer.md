# 创建弹层工厂

`createLayer` 基于某个**容器组件**创建组合式函数，并可写入工厂默认配置。

## 基本用法

```ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

## 默认配置

第二参可给容器写默认 props 等：

```ts
const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})
```

在 `createLayer` / `defineLayer` 里，**顶层 `props` 指容器**（如 `title`、`width`）。

## model

框架默认把内部显示状态绑到 `modelValue`（普通 `v-model`）。若容器用的不是这个名字，用 `model` 声明：

```ts
const useDialog = createLayer(BaseDialog, {
  model: 'visible', // 对应 v-model:visible
  props: { width: '480px' },
})
```

Vant 的 `show`、部分自研壳的 `open` 等同理。

## 项目内怎么放

常见做法是按壳各建一个工厂文件：

```text
src/layers/
  dialog.ts   → createLayer(ElDialog, …) → useDialog
  drawer.ts   → createLayer(ElDrawer, …) → useDrawer
```

业务页只 `import { useDialog } from '@/layers/dialog'`，不再关心容器细节。

需要按断点换壳、滤 props 时，见 [adapter](/guide/adapter)。

## 下一步

[打开与关闭](/guide/open-close)
