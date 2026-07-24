# LayerNoContainer

标记组件：表示**外面不再包一层 Dialog**。渲染与普通壳同构（Teleport + default 锚点），并把容器侧 props 投影到 content（内容 props 覆盖容器侧）。

## 用途

容器与内容还粘在同一个组件里（存量单体弹窗）时，把该组件当作 **content**，用 `LayerNoContainer` 作 `createLayer` 的容器（或在 adapter / open / `defineLayer` 里换成它）。

**不要**把单体当成 `createLayer` 的第一参，也不要和「`useDialog()` 不传 Content」的空壳用法混为一谈。说明见 [指南：容器与内容未拆分](/guide/no-container)。

设计细节：[ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。
