# LayerNoContainer

公开标记容器：无外壳。

## 用法

用作 `createLayer` 的 `Container`，或在 adapter / use / open 中换成它时，渲染拍平为 `h(content)`（content props 覆盖 container props）。

用于存量单体弹层的渐进接入。见 [指南：LayerNoContainer](/guide/no-container) 与 [ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。
