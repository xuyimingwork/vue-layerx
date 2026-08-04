# 类型

包导出的主要类型：

| 类型 | 说明 |
|------|------|
| `LayerConfigCreate` | `createLayer` 第二参（Raw flat） |
| `LayerConfigContainer` | `defineLayer` 配置（顶层 = container） |
| `LayerConfigContent` | `use` / `open` / `clone`（顶层 = content） |
| `PropsOf` | 从组件定义抽出 props（Vue 2.7 / 3 本地 shim；去掉 class/style/key 等内建键） |
| `LayerPropsInput` | 当次传入的 props（`Partial` + 可选 `ref`；内部已展平） |
| `LayerConfigFragment` | Canonical 双侧分栏（写 `adapter` 时用） |
| `LayerAdapter` | `(fragment) => fragment` |
| `LayerDefine` | `defineLayer` 返回值（含 `exists`） |
| `LayerInstance` | 实例接口（可选 `ContentP` / `ContainerP` 泛型） |
| `CloseOnRaw` | 用户侧 `closeOn` 配置（数组糖 / Record） |
| `LayerConfirmResult` / `LayerConfirmSource` | `confirm()` |
| `LayerCloseOptions` | `close(options?)` |

`createLayer(Container)` → `useX(Content)` 会推导 props，接到 `$open` / `open.props` / `container.props`。slots 名与 `closeOn`↔emits **本版不收窄**。见 [ADR 0012](/adr/0012-typed-content-container-props)。

推不出 props 时回落 `Record<string, unknown>`；逃逸可 `as LayerInstance<MyProps, ContainerProps>` 或 `PropsOf<typeof Comp>`。`Simplify` / `LooseProps` / `LayerConfig*Of` 为内部实现，不从包导出。

Canonical / Bound 等管线类型（`CloseOn`、`LayerBound` 等）为内部实现，不从包导出。配置三域见 [配置域命名](/config-naming)。
