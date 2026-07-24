# ADR 0007：内容侧静态 define——`defineOptions` 优先于自研宏 / setup 内换 `LayerNoContainer`

- **状态**：Deferred（搁置；不删文）
- **日期**：2026-07-24（搁置：同日）
- **关联**：[ADR 0001](./0001-legacy-monolith-progressive-adoption.md)（`LayerNoContainer` 同构透明容器）；[ADR 0002](./0002-open-use-override-container-component.md)；[ADR 0003](./0003-reactive-layer-config.md)

---

## 为何搁置

[ADR 0001](./0001-legacy-monolith-progressive-adoption.md) 已将 `LayerNoContainer` 改为与普通容器 **同构 Teleport** + props 投影。事后 `defineLayer({ component: LayerNoContainer })` 可 park content、**不必二次 setup**；在接受「首帧可能仍是工厂默认容器」的前提下，content 内自报写法已足够优雅。

本篇原驱动里更急的痛（remount / 双 setup）已消除。余下仅是 **挂载前可知静态 define → 首帧容器就正确**（以及可选的静态 title / closeOn），优先级下降，**暂不实现** `defineOptions({ layerx })` 自动读取。若日后要「首帧容器正确」且不愿维护 adapter 表，再拾起本文方向。

当前推荐：

- 挂载前选定容器：`adapter` / `createLayer(LayerNoContainer)`（ADR 0001）
- content 自报、可接受首帧：`defineLayer({ component: LayerNoContainer })`

以下正文保留原讨论，供将来参考。

---

## 背景

[ADR 0001](./0001-legacy-monolith-progressive-adoption.md) 定稿：存量单体始终作为 **content**，用 `LayerNoContainer`（透明容器 + props 投影）；推荐在 **adapter**（或 `createLayer(LayerNoContainer)`）里于挂载前换容器，以便与已拆分 content 共用同一 `useLayer`。

实践中仍有人希望在 **content 文件内**自报「不要外层容器」，写法接近：

```ts
defineLayer({ component: LayerNoContainer })
```

`defineLayer` 顶层本就可以写 `component`（打开后 Dialog ↔ Drawer 换容器亦然，见 playground）。问题不在 API 能否表达，而在 **时序**（首帧可能仍是工厂默认容器）。

> **实现注记（2026-07-24）**：`LayerNoContainer` 已与普通容器同构 Teleport 树，事后 `defineLayer` 换成它时可 park content、避免二次 setup；首帧仍可能先走工厂默认容器。本 ADR 讨论的静态 `defineOptions` 仍针对「挂载前可知」。

### 约束（挂载前可知）

```text
要在 content 挂载前知道容器 → 不能依赖 setup 内的 defineLayer
要跑 defineLayer           → 得先挂上 content
```

目标仍是：配置写在 content 旁、与普通 content 一样 `useDialog(X)`，且 **首次 open 的首帧容器就正确**（不只是 setup 一次）。

---

## 问题

在不推翻 ADR 0001 角色模型的前提下，如何让「内容侧声明的静态 define（尤其 `component: LayerNoContainer`）」在 **content 挂载前**可读？

---

## 备选

| | A. 仅 adapter / `createLayer(LayerNoContainer)`（现状） | B. setup `defineLayer({ component: LayerNoContainer })` | C. 自研宏：编译抬升 `defineLayer` 静态子集 | D. `defineOptions` 挂静态 `LayerConfigContainer` |
|--|--|--|--|--|
| 声明位置 | 工厂 / 项目表 | content 文件 | content 文件（糖） | content 文件 |
| 首次 setup | 1 次 | 1 次（同构换容器 park；首帧容器仍可能错） | 1 次（抬升成功时） | 1 次（挂载前可读） |
| 接入成本 | 零编译器 | 零 | unplugin + 跟 Vue 版本 | Vue 3.3+ 自带 |
| live 配置 | 不负责 | ✅ `MaybeRefOrGetter` | 只能抬静态；live 仍要 runtime | 静态进 options；live 仍 `defineLayer` |
| `LayerTemplate :to` | — | ✅ 返回值 | 仍需 runtime `defineLayer` | 仍需 runtime `defineLayer` |

另议：打开时先 park content 收 define、同 tick 再选定容器——能缓解首帧容器错误，但管线复杂；**不取**为默认方案。同构 `LayerNoContainer` 已覆盖「事后换容器不 remount」。

---

## 决策（搁置前的倾向；未落地）

### 1. 不推荐以 B 作为「首帧就必须正确」的主路径

`defineLayer({ component: LayerNoContainer })` 在同构 Teleport 下可 **只 setup 一次**，适合接受首帧可能仍是工厂默认容器的场景。文档与 ADR 0001 对渐进接入仍以 **挂载前选定容器**（adapter / `createLayer(LayerNoContainer)`）为准。B 亦适合「已打开后」改 `component`（ADR 0002 / live define）。

### 2. 不做「把 defineLayer 编成静态」的一等宏（否决 C 为起点）

自研宏的真源仍是「组件上的静态元数据」；宏只是语法糖，却引入编译管线、SFC/非 SFC 差异、以及「哪些字段被抬、哪些不抬」的认知负担。`LayerNoContainer` 是渐进接入的相对窄场景，不值得先扛编译器。

若将来要糖，方向应是 **可选** `vue-layerx/macros`，**编译落到本 ADR 的静态 option（或 Symbol）+ 保留 runtime `defineLayer`**，而不是反过来以宏为真源。

### 3. 方向：用 `defineOptions` 承载静态 define（取 D）

属性形态对齐 `defineLayer` 能接受的 **可静态子集**（字面量 / 稳定 import 的 `LayerConfigContainer`），而不是单独一个 `layerContainer` 布尔/标记：

```ts
defineOptions({
  layerx: {
    component: LayerNoContainer,
    props: { title: '编辑用户', width: '480px' },
    content: { closeOn: ['success'] },
  },
})

// live 与 LayerTemplate 句柄仍走 defineLayer
const layer = defineLayer(() => ({
  props: { title: `编辑 · ${name.value}` },
}))
```

建议 merge 直觉（实现时钉死）：

```text
open > use > defineLayer(setup) > defineOptions 静态 > create
```

静态与 setup define 同字段时，以 setup / 更高 tier 覆盖；避免同一静态字段两边各写一份。

容器 slot 仍用 `LayerTemplate`，不往 `defineOptions` 里塞 render fn。

### 4. 选项键名：字符串用 `layerx`；可另以 Symbol 为真源

| 键 | 结论 |
|----|------|
| 裸 `layer` | **不取**——易与业务「图层」等 option / 他库 `ComponentCustomOptions` 撞名 |
| **`layerx`** | **字符串键首选**——与包名一致，够短，撞车概率低于 `layer` |
| **Symbol**（如导出 `LAYERX_DEFINE`） | **防撞更强**；`defineOptions({ [LAYERX_DEFINE]: { … } })`；注意 Vue `optionMergeStrategies` 偏 string、以及 `extends`/包装组件上的可读性，实现时需验证 |

推荐契约：若同时提供二者，**Symbol 为存储真源**，文档可主推 `layerx` 或 `[LAYERX_DEFINE]`；不要提供会撞的裸 `layer`。

类型上可对 `ComponentCustomOptions` 做增强（仅 `layerx` 字符串键时）。

### 5. 与 ADR 0001 的关系

- A（adapter / `createLayer(LayerNoContainer)`）**仍然是已实现、推荐的渐进接入路径**。
- D 是「自报写在 content 上、且挂载前可读」的演进方向；落地前项目可自行用 adapter 读 `layerx` / Symbol，等价预演。
- 单体角色不变：始终是 content；拆成纯 Form 后去掉静态 `component: LayerNoContainer`（或整段 `layerx`）即可。

---

## 能力边界（落地后预期）

### 支持（目标）

- 挂载前读取 content 组件上的静态 define，首次 open 即可正确容器 / 带默认 props·closeOn
- 与 live `defineLayer`、`LayerTemplate` 并存
- 普通 `defineComponent({ layerx: { … } })` 与 `<script setup>` + `defineOptions` 同契约

### 不支持 / 不替代

- 用静态 option 表达 `() => ({ component: expanded ? ElDrawer : ElDialog })` 等 live 换容器
- 用静态 option 提供 `LayerDefine`（`exists` / `:to`）
- 无插件时的「只写 defineLayer、自动抬升」（那是可选宏的将来式）

---

## 后果

### 正面

- 保留「配置贴在 content 文件」的 DX，又满足「首次只 setup 一次」
- 不增加编译器依赖；与 Vue `defineOptions` 心智一致（静态进 options，动态进 setup）
- 键名 `layerx` / Symbol 降低与生态撞车概率

### 负面 / 待办

- 本 ADR **Deferred**：不实现自动 peek，直至有「首帧必须正确」的强需求
- 若拾起：静态与 runtime `defineLayer` 两处书写需文档讲清；Symbol 键与 Vue 合并策略、异步组件解包需验证

---

## 参考

- [ADR 0001](./0001-legacy-monolith-progressive-adoption.md)
- [指南：容器与内容未拆分](../guide/no-container.md)
- Playground：`10-layer-no-container`（adapter）；`15-define-no-container`（setup 内 `defineLayer` 换容器，对比时序）
