# LayerNoContainer

`LayerNoContainer` 是公开的**标记容器**：表示「没有外壳」。用作 `createLayer` 的 Container，或在 adapter / use / open 中换成它时，渲染拍平为 `h(content)`（内容 props 覆盖容器 props）。

## 适用场景

存量代码里常见「一个文件里 Dialog + 表单写死」的单体弹窗。可以用 NoContainer 先命令式托管整颗旧组件，再逐步拆成「壳工厂 + 内容」，而不必一次改完。

设计说明见 [ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。

## 用法示意

```ts
import { createLayer, LayerNoContainer } from 'vue-layerx'
import LegacyUserDialog from './LegacyUserDialog.vue'

// 整颗旧弹窗当作「内容」，无额外壳
export const useLegacyUser = createLayer(LayerNoContainer)
const legacy = useLegacyUser(LegacyUserDialog)
legacy.open()
```

拆分完成后，把工厂改回 `createLayer(ElDialog)`，内容改成纯表单即可。
