# 创建弹层组合式函数

`createLayer` 接收一个**容器组件**，返回组合式函数（例如 `useDialog`）。之后业务页只调用这个组合式函数，不必每次再写容器模板。

```ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

## 给容器写默认配置

第二参可写入容器的一些配置，例如 props：

```ts
const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})
```

## 显隐字段不叫 modelValue 时

vue-layerx 使用 `v-model`（`modelValue` 和 `onUpdate:modelValue`）控制容器组件的显示隐藏。

若容器用的是别的名字，用 `model` 声明：

```ts
const useDialog = createLayer(BaseDialog, {
  model: 'visible', // 对应 v-model:visible
  props: { width: '480px' },
})
```

Vant 的 `show`、部分自研容器的自定义字段同理。

> 如果组件不是通过 `v-model` 方式控制显隐，可以先自行封装包裹一层。

## 建议文件位置

通过 `createLayer` 创建的 `useXxx` 相当于普通的组合式函数，可以和其他组合式函数放一起：

```text
src/composables/
  dialog.ts   → createLayer(ElDialog, …) → useDialog
  drawer.ts   → createLayer(ElDrawer, …) → useDrawer
```

业务页只 `import { useDialog } from '@/composables/dialog'`。

以后若需要「各处配置合并完之后，仍按项目约定再改一刀」（而不是普通默认 props），见进阶里的 [用 adapter 统一改配置](/guide/adapter)。

## 下一步

[打开与关闭](/guide/open-close)
