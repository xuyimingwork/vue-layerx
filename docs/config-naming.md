# 配置域命名约定

配置管线（peel → normalize → merge → adapt → bind）的类型与方法命名。与 [DESIGN.md](../DESIGN.md) 核心管线对照；本文是命名的权威来源。

---

## 三域

| 域 | 含义 | 类型文件 | 可否含糖 |
|----|------|----------|----------|
| **Raw** | 用户写法（公开 flat） | [`src/types/config-raw.ts`](../src/types/config-raw.ts) | ✅（`props.ref` 可为 `Ref`；`closeOn` 为 `CloseOnRaw` 数组/Record 糖） |
| **Canonical** | store、merge、adapter、refs | [`src/types/config.ts`](../src/types/config.ts) | ❌（`ref` 仅为 callback；`closeOn` 为 `CloseOn` = `Record<event, CloseOnEntry>`） |
| **Bound** | bind 输出，可直接 `h()` | [`src/types/bound.ts`](../src/types/bound.ts) | ❌ |

```text
Public flat (*Raw nodes)
  --toFragment* (peel + normalizeNode)-->
Canonical Fragment
  --merge / adapter / refs-->
Canonical Fragment
  --bindLayer-->
LayerBound
```

**不**引入 `LayerConfigFragmentRaw`：双侧分栏只属于 Canonical；用户非标入口只有 flat。

**不要**用 `Normalized` 表示 bind 输出——bind 用 `Bound`；`normalize*` 专指 Raw → Canonical（糖展开）。

---

## 阶段动词

| 动词 | 阶段 | 规则 |
|------|------|------|
| `toFragment*` | peel + normalize | flat → Canonical `LayerConfigFragment` |
| `normalizeNode*` / `normalizePropRef` | 糖展开（**拷贝**，不 mutate 入参） | `Ref`→callback、`markRaw(component)` |
| `merge*` | 叠 Canonical | 只吃 / 产出 Canonical |
| `adapter` | 整形 | `Fragment` → `Fragment` |
| `bind*` | 投影 runtime | `Fragment` + visible/close → `LayerBound` |

---

## 类型对照（节选）

| Raw | Canonical | Bound |
|-----|-----------|-------|
| `CloseOnRaw` | `CloseOn`（`CloseOnEntry`；`when` 可含 `'none'`） | （已写入 props `onXxx`） |
| `LayerPropsRaw` | `LayerProps` | `LayerBoundNode.props` |
| `LayerConfigNode*Raw` | `LayerConfigNode*` | `LayerBoundNode` |
| `LayerConfigContent` / `Container` | — | — |
| — | `LayerConfigFragment` | `LayerBound` |

`CloseOnRaw` → `normalizeCloseOn` → store 各 tier 的 `CloseOn`（完整 `{ when, confirmed }`，可含 `when: 'none'`）。`mergeCloseOn` 按 **event patch**、整份 entry 替换，并将 `when: 'none'` **删 key**；约定 merge 之后 / adapter / bind 不再保留 tombstone（bind 仍防御性跳过 `none`）。adapter 移除事件应删 key，勿写 `when: 'none'`。
