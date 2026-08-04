# ADR 0012：Content / Container props 类型推导

- **状态**：Accepted（已实现）
- **日期**：2026-08-04
- **关联**：[ADR 0008](./0008-vue-2-7-adaptation.md) D0.14（同包一份 `.d.ts`）；[ADR 0011](./0011-dollar-open-content-props-sugar.md)（`$open` / `$confirm`）；[`DESIGN.md`](../../DESIGN.md)「类型提示」

---

## 背景

公开配置里 `props` 长期是 `LayerPropsRaw`（含索引签名），IDE 无法从 `createLayer(ElDialog)` / `useDialog(UserForm)` 提示字段。日常调用几乎只传内容 props（见 ADR 0011），类型价值集中在这条路径。

约束：

- 同包一份声明，须同时被 Vue 3 与 Vue 2.7 解析
- 不能破坏现有无泛型调用
- 不把 slots / closeOn 一并做成「看起来完整却测不稳」的类型工程

---

## 问题

1. 如何从 Container / Content 组件推导 props，并接到 `createLayer` / `useX` / `open` / `$open`？
2. slots、`closeOn`、动态 `open({ component })` 是否同期收紧？
3. Vue 2.7 推断偏弱时，成功标准是什么？

---

## 备选

| | A. 仅文档 + 手写辅助类型 | B. props 泛型轴（本决策） | C. props + closeOn↔emits + slots name |
|--|--------------------------|---------------------------|----------------------------------------|
| 收益 | 低 | 覆盖 ~99% 传参路径 | 理论最大 |
| 成本 | 无 | 中（helper + 泛型 + 类型测） | 高；slots 无法自省；closeOn 糖形态多 |
| Vue2 | — | 提示质量可降级 | 两端同严不现实 |

取 **B**。

---

## 决策

### 1. 双轴泛型

- `createLayer<CContainer>(Container, config?)` → `ContainerP = PropsOf<CContainer>`
- 返回的 `useLayer`：传入 `Content` 时 `ContentP = PropsOf<CContent>`；未传 Content 时 `ContentP = LooseProps`（`Record<string, unknown>`）
- `LayerInstance<ContentP, ContainerP>` 上：
  - `$open` / `$confirm` ← `LayerPropsInput<ContentP>`
  - `open` / `confirm` / `clone` / `use` 配置 ← `LayerConfigContentOf<ContentP, ContainerP>`（仅 `props` / `container.props` 收紧）

### 2. `PropsOf` / `LayerPropsInput` / `Simplify`（本地 shim）

- `PropsOf`：`[C] extends […]` **非分布式**（避免 UI 库 `Component` 联合变成 `PropsOf` 联合 → `keyof` 为 `never` → `width` 等全被多余属性拒绝）；抽不出或空键集时回落 `Record<string, unknown>`
- `createLayer` / `useLayer` 的组件参数约束为内部 `AnyComponent`（构造器 | 对象 | 函数），**不**用 Vue 的 `Component`——同包 `.d.ts` 下 2.7 / 3 的 `Component` 互不兼容（`SetupContext.listeners` vs `expose`）
- `Simplify<T> = { [K in keyof T]: T[K] } & {}`：展平交叉类型，改善 IDE hover（等同 type-fest / Vue Prettify 惯用法）
- **不**把 Vue 3-only utility 当作唯一路径
- `LayerPropsInput<P> = Partial<P> & { ref?; [extra: string]: unknown }`：已知键（含 Vue 3 emit → `onXxx`）保留精确类型；字符串索引允许未抽出的键（Vue 2 的 `onXxx`、自定义 props）
- 保留 `LayerPropsRaw` 给宽松 / 内部 normalize 路径

### 3. 非目标（本版明确不做）

- **slots `name`**：与 Vue 父组件无法自省子组件 slot 开口相同
- **`closeOn` ↔ emits**：糖形态多；推不出 emits 时收益低。后续可另开 ADR
- **动态 `open({ component: C })` 按 C 收紧 props**：未绑 Content 时保持宽松；后续可加 `open` 泛型重载

### 4. 逃逸口

组件推不出时：`as LayerInstance<MyProps, ContainerProps>`（或等价显式泛型）。不引入运行时读取的 `UserFormLayer` 接口。

### 5. Vue 2.7 质量上限

- **Vue 3**：`defineComponent({ props })` 等可抽出路径须能补全与拒绝错误类型（类型测）
- **Vue 2.7**：同包 d.ts **编译不炸** + happy path 可调用；不要求与 Vue 3 同等拒绝强度

### 6. 运行时

零行为变化；`createLayerInstance` 返回值类型断言接到泛型实例。

---

## 后果

- 公开导出：`PropsOf`、`LayerPropsInput`（以及既有 `LayerConfigContent` / `Container` / `Create` 等）。`Simplify`、`LooseProps`、`LayerConfig*Of` **不**从包导出（内部实现）。
- 类型测：主包 Vue3 `*.test-d.ts`；`tests-vue2` 轻量 `tsc` smoke
- 文档默认示范倾向 `$open`；完整 `open` 仍述同构配置

---

## 决策记录

| 项 | 结论 |
|----|------|
| 本版范围 | 仅 props |
| slots / closeOn / 动态 component 收紧 | 否 |
| 同包 `.d.ts` | 是（沿用 0008） |
| 推不出 | `LooseProps`，不做条件类型地狱 |
| 状态 | Accepted（已实现） |
