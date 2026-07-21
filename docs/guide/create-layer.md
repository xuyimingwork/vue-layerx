# 创建弹层组合式函数

`createLayer` 接收一个**容器组件**，返回组合式函数（例如 `useDialog`）。之后业务页只调用这个组合式函数，不必每次再写容器模板。

## 基本用法

```ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

## 给容器写默认配置

第二参可写入该组合式函数的默认配置，例如宽度、是否挂到 body：

```ts
const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})
```

这里顶层的 `props` 作用在**容器**上（`title`、`width` 等），不是内容组件的 props。

## 显隐字段不叫 modelValue 时

默认把内部显示状态绑到 `modelValue`（普通 `v-model`）。若容器用的是别的名字，用 `model` 声明：

```ts
const useDialog = createLayer(BaseDialog, {
  model: 'visible', // 对应 v-model:visible
  props: { width: '480px' },
})
```

Vant 的 `show`、部分自研壳的自定义字段同理。

## 项目里怎么放

常见做法是按容器各建一个文件：

```text
src/layers/
  dialog.ts   → createLayer(ElDialog, …) → useDialog
  drawer.ts   → createLayer(ElDrawer, …) → useDrawer
```

业务页只 `import { useDialog } from '@/layers/dialog'`。

以后若要按屏幕宽度自动把 Dialog 换成 Drawer，见进阶里的 [按环境换容器](/guide/adapter)。

## 下一步

[打开与关闭](/guide/open-close)
