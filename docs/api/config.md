# 配置

## 顶层 props 指哪一侧

| API | 顶层 `props` → |
|-----|----------------|
| `createLayer` / `defineLayer` | **容器** |
| `useLayer` / `open` / `clone` | **内容** |

另一侧显式写 `content` / `container`。

## 公开 flat 类型（Raw）

| 类型 | 用于 |
|------|------|
| `LayerConfigCreate` | `createLayer` 第二参 |
| `LayerConfigContainer` | `defineLayer` |
| `LayerConfigContent` | `use` / `open` / `clone` |

## Fragment / Adapter

| 类型 | 说明 |
|------|------|
| `LayerConfigFragment` | 双侧分栏；adapter / store |
| `LayerAdapter` | `(fragment) => fragment` |

命名与管线见 [配置域命名](/config-naming)。

## 合并优先级

```text
open > use > use:template > define > define:template > create
```

## closeOn

- 用户配置：`CloseOnRaw`（数组糖或 Record）
- 跨 tier：**按事件 patch**，非整表替换
- `when: 'none'` / `false` 去掉该事件
- 数组糖默认 `confirmed: false`；`confirm()` 成功路径需显式 `confirmed: true`

见 [指南：用事件关闭弹层](/guide/close-on)。

## 未知字段

未知配置键不进入合并契约（见 [ADR 0004](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0004-merge-unknown-fields.md)）。
