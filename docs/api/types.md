# 类型

包导出的主要类型：

| 类型 | 说明 |
|------|------|
| `LayerConfigCreate` | `createLayer` 第二参（Raw flat） |
| `LayerConfigContainer` | `defineLayer` 配置（顶层 = container） |
| `LayerConfigContent` | `use` / `open` / `clone`（顶层 = content） |
| `LayerConfigFragment` | Canonical 双侧分栏（写 `adapter` 时用） |
| `LayerAdapter` | `(fragment) => fragment` |
| `LayerDefine` | `defineLayer` 返回值（含 `exists`） |
| `LayerInstance` | 实例接口 |
| `CloseOnRaw` | 用户侧 `closeOn` 配置（数组糖 / Record） |
| `LayerConfirmResult` / `LayerConfirmSource` | `confirm()` |
| `LayerCloseOptions` | `close(options?)` |

Canonical / Bound 等管线类型（`CloseOn`、`LayerBound` 等）为内部实现，不从包导出。配置三域见 [配置域命名](/config-naming)。
