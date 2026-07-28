# LayerNoContainer

标记组件：表示**外面不再包一层 Dialog**。渲染与普通容器组件同构，并把容器侧 props 投影到内容（内容 props 覆盖容器侧）。

## 用途

容器与内容还粘在同一个组件里（存量单体弹窗）时，把该组件当作 **内容组件**：

- 日常：内容里 `defineLayer({ component: LayerNoContainer })`（调用方与普通 content 无区别）
- 大量同类：`createLayer(LayerNoContainer)`
- 个例且要打开前定容器：`useDialog(Content, { container: { component: LayerNoContainer } })`

也可在 adapter / `open` 里换成它。说明见 [指南：容器与内容未拆分](/guide/no-container)。

**不要**把单体当成 `createLayer` 的第一参，也不要和「`useDialog()` 不传 Content」的仅容器用法混为一谈。

设计细节：[ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。
