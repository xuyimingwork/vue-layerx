# 类型

包导出的主要类型（节选）：

| 类型 | 说明 |
|------|------|
| `LayerConfigCreate` | `createLayer` 第二参（Raw flat） |
| `LayerConfigContainer` | `defineLayer` 配置（顶层 = container） |
| `LayerConfigContent` | `use` / `open` / `clone`（顶层 = content） |
| `LayerConfigFragment` | Canonical 双侧分栏 |
| `LayerBound` / `LayerBoundNode` | bind 输出 |
| `LayerAdapter` | `(fragment) => fragment` |
| `LayerDefine` | `defineLayer` 返回值（含 `exists`） |
| `LayerInstance` | 实例接口 |
| `CloseOn` / `CloseOnRaw` / `CloseOnEntry` | 关层策略 |
| `LayerConfirmResult` / `LayerConfirmSource` | `confirm()` |
| `LayerCloseOptions` | `close(options?)` |

配置三域（Raw / Canonical / Bound）见 [配置域命名](/config-naming)。
