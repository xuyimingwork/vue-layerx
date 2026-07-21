# API

按导出查阅。用法叙事见 [指南](/guide/introduction)。

## 核心调用链

```ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)

const dialog = useDialog(HelloWorld)
dialog.open({ props: { id: 1 } })
```

## 导出一览

| 导出 | 说明 |
|------|------|
| [`createLayer`](./create-layer) | 由容器创建 `useLayer` 工厂 |
| [`defineLayer`](./define-layer) | 内容侧注册默认配置 |
| [`LayerTemplate`](./layer-template) | 模板投递具名插槽 |
| [`LayerNoContainer`](./layer-no-container) | 无外壳标记容器 |
| [`LayerConfirmError`](./layer-instance#confirm) | `confirm()` 失败错误类 |
| 类型 | 见 [类型](./types) · [配置](./config) |

`useLayer` **不是**包导出，见 [`createLayer` 返回值](./use-layer)。

## 实例

[`LayerInstance`](./layer-instance) — `open` / `close` / `confirm` / `clone` / `bindHost` / …
