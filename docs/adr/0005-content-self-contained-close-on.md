# ADR 0005：`defineLayer` 不暴露 `close` — 关层经 content emit + `closeOn`

- **状态**：Accepted（已实现）
- **日期**：2026-07-17
- **关联**：[DESIGN.md](../../DESIGN.md) `defineLayer` / `closeOn`；[`LayerDefine`](../../src/types/instance.ts) vs [`LayerInstance`](../../src/types/instance.ts)

---

## 背景：`defineLayer` 是什么

`defineLayer` 调用点在 content 的 `setup` 内，但职责不是「给 content 操作弹层的句柄」，而是：

> 在 content **被 layer 托管时**，从 content **外侧**向框架注册默认配置与模板投递点。

写在 content 文件里，只是为了与业务默认值 / `LayerTemplate` **co-locate**；语义上仍是对 content 的外部配置，与 `defineProps` / `defineEmits` 同级声明，不是 layer 运行时注入。

因此返回 **`LayerDefine`**（`exists` + `LayerTemplate :to`），与使用侧的 **`LayerInstance`**（`open` / `close` / …）分工明确。

自然问题：content 业务完成后如何关层？`defineLayer` 要不要直接给出 `close`？

---

## 问题

两种关层模型：

| | A. `defineLayer` 提供 `close` | B. content `emit` + `closeOn` |
|--|------------------------------|-------------------------------|
| content 完成时 | 调 `layer.close()` | `emit('success')` 等 |
| 关层发生在 | content 内部 | vue-layerx（或任意父级）收到事件后 |
| content 与宿主 | **调用**环境（写生命周期） | 可 **感知**环境（`exists` 等），不调用 |

需钉死取 B 还是 A，以及 `closeOn` 与 `defineLayer` 的关系。

---

## 决策

### 1. 取 B：先 emit，再由框架 / 使用侧 close

vue-layerx 使用 content 的方式，应与**其它任何父组件**使用 content 相同：props in / emits out。

```text
content.emit('success')  →  closeOn 接线  →  LayerInstance.close()
```

`closeOn` 声明「哪些 emit 触发 close」，在 bind 阶段写成 content 的 `onXxx`（见 DESIGN.md）。关层始终在 content **之外**完成。

### 2. `defineLayer` 返回值不提供 `close`（及同类操作弹层的属性）

若返回 `close`，content 就可以**不经外部交互**关掉弹层。那是在引导实现方把 content 写成 **弹层优先**——完成路径直接碰层生命周期。

vue-layerx 要引导的是相反方向：**content 实现为通用组件**，弹层只是一种宿主。故 `LayerDefine` 不能提供可操作弹层的属性；命令式 `close()` 只属于 `LayerInstance`。

### 3. `defineLayer` 可声明默认 `closeOn`，仍不是「content 调 close」

| 写法 | 含义 |
|------|------|
| `defineLayer({ content: { closeOn: ['submit'] } })` | 定义侧默认接线：这些 emit 应关层 |
| `useX` / `open` 的 `closeOn` | 使用侧声明或覆盖（merge 后者覆盖） |

即便 `closeOn` 写在 content 文件的 `defineLayer` 里，也仍是**外侧配置**（与 title、container props 同类），不是 content 拿到了 `close` 函数。content 本体只 `emit`。

### 4. `LayerDefine` vs `LayerInstance`

| API | 角色 | `close` |
|-----|------|---------|
| `defineLayer` → `LayerDefine` | 定义侧：默认配置、模板 `:to` | **无** |
| `useX` → `LayerInstance` | 使用侧：命令式生命周期 | **有** |

### 5. 辨析：`exists` vs `close`

`LayerDefine` 仍暴露 `exists`，与「不给 `close`」看似矛盾，实则边界不同：

| | `exists` | `close` |
|--|----------|---------|
| 方向 | **感知环境**（只读） | **调用环境**（写入生命周期） |
| 归类 | 询问「这份 define 所对应的层上下文是否存在」（类似 props：外 → 内） | content 操作弹层（内 → 外） |
| 用途 | 双宿主模板呈现适配（投进 slot vs `visible-outside` 就地） | 不经外部交互关层 |

原则：**感知环境，不调用环境。**

允许读 `layer.exists` 以适配 co-locate 的 `LayerTemplate`；禁止据此改业务完成路径或关层模型（完成仍只 `emit`，关层仍经 `closeOn` / `LayerInstance`）。

---

## 为何不取 A（直接给 `close`）

1. **引导方向**：有 `close` → content 可不经外部交互关层 → API 默认弹层优先；与「引导 content 通用」相悖。
2. **与普通父组件用法分叉**：页内是 `@success`，弹层内却是 `close()`；同一业务完成路径两套写法。
3. **页内复用劣化**：非 layer 上下文下 `close` 无意义，被迫分支或空操作。
4. **职责错位**：`defineLayer` 是配置注册；`close` 属于 instance 生命周期，不应出现在 `LayerDefine` 上。

（inject / `useLayerContext().close` 等同属 A，一并否决。）

---

## 不变量

1. content 业务完成路径在页内与弹层内一致：只 `emit`。
2. `LayerDefine` 永不增加 `close` / `open` 或其它**可调用宿主**的属性；`exists`（**感知宿主**）除外。
3. `exists` 用于呈现适配，不用于分支关层或改写完成语义。
4. `LAYER_VIEW_KEY` 只服务 `defineLayer` / 模板注册，不向 content 暴露关闭句柄。
5. 校验失败 → 不 emit → 不触发 `closeOn`。

---

## 后果

- API 审查：给 `defineLayer` / content 增加关层捷径 = 违背本决策。
- 「提交后关层」= content `emit` + 任一 tier 的 `closeOn`；「外部强制关」= `LayerInstance.close()`。
- DESIGN.md：`closeOn` 与 `LayerDefine` **能力**无关（无 `close`），但 define tier **可贡献**默认 `closeOn`。

---

## 决策记录

| 项 | 结论 |
|----|------|
| `defineLayer` 定位 | content 外侧配置注册（co-locate 于 content 文件） |
| 关层模型 | content `emit` → `closeOn` → 框架 / 使用侧 `close` |
| `LayerDefine` 是否提供 `close` | **否**（避免弹层优先引导） |
| `exists` | **允许**（感知环境）；与 `close`（调用环境）分立 |
| `defineLayer` 与 `closeOn` | 可声明默认接线；仍非 content 持有 `close` |
| 命令式 `close()` | 仅 `LayerInstance` |
