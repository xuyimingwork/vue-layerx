# ADR 0003：Layer 配置响应式（MaybeRefOrGetter + store computed）

- **状态**：Accepted（已实现）
- **日期**：2026-07-14
- **关联**：[DESIGN.md](../../DESIGN.md) merge / store 管线；[ADR 0004](./0004-merge-unknown-fields.md)（未知字段白名单与 adapter 入参）

---

## 背景

当前 `createLayer` / `defineLayer` / `useLayer` / `clone` / `open` 的配置均在调用时经 `toFragment*` / `mergeFragment` **拍成 plain fragment** 写入 store。store 本身是 `reactive`，LayerView 会随 store 变更重 merge，但**入参侧不再订阅**用户传入的 ref / getter。

终端常见诉求：

| 场景 | API | 期望 |
|------|-----|------|
| content 内倒计时 title | `defineLayer(() => ({ props: { title } }))` | 同一次打开期间 title 随本地 state 更新，且不 remount content |
| 调用方绑选中行，空参 `open()` | `useLayer(Form, () => ({ props: { id } }))` | payload 长期在 `use` tier；`open()` 只负责 visible |
| 工厂级 i18n / 主题默认 | `createLayer(Dialog, () => ({ props: { title: t(…)) } }))` | 语言切换后默认 container props 更新 |
| 偏覆盖派生实例 | `clone(() => ({ props: { id: otherId } }))` | 未覆盖字段（如 `locale`）继续跟父 `use` 的 live 绑定 |

**明确不需要 live 的**：`open(config)` —— 当次打开快照；列表点开一行的 payload 不应悄悄跟着 hover/选中变。空参 `open()` 吃的是已绑定的 `use`（及更低 tier），不是给 `open` 做 getter。

---

## 决策

### 1. 哪些 API 接受 `MaybeRefOrGetter`

直接使用 Vue 的 `MaybeRefOrGetter<T>`（plain / `Ref` / getter / `ComputedRef`），不另起别名。

| API | 配置源 | 语义 |
|-----|--------|------|
| `createLayer(Container, config?)` | `MaybeRefOrGetter<LayerConfigCreate>`（含可选 `adapter`） | `create` tier live；见 §5 |
| `defineLayer(config?)` | `MaybeRefOrGetter<LayerConfigContainer>` | `define` tier live |
| `useLayer(Content?, config?)` | `MaybeRefOrGetter<LayerConfigContent>` | `use` tier live；`Content` 第一参保持静态 `Component` |
| `clone(config?)` | `MaybeRefOrGetter<LayerConfigContent>` | 见 §3 |
| `open(config?)` | **仅 plain** `LayerConfigContent` | 当次快照写入 `open` tier；**不**接受 getter/ref |

plain object = 常量源（computed 无依赖或依赖不变），行为与今日兼容。

### 2. 实现策略：一路 computed，不 watch 写回

利用 `reactive` 内嵌 `ref`/`computed` 自动解包：

```text
MaybeRefOrGetter
  → computed(() => toFragment*(toValue(source)) …)  // create 桶可附带 adapter
  → 放入 store.use / store.create / defineStore.define
  → LayerView 读 store.* → merge → 取出 adapter → adapt → bind → h()
```

- **不**用 `watch` + 赋值同步；依赖收集由 computed 承担。
- 热更新只重 merge / 更 props；**不**因配置变化 bump `openId`（倒计时 title 不拆 content）。
- `component` 等字段随整包 `toValue` 更新，语义对齐「已打开再 `open` 只更配置」；不单独做换组件强制 remount。

#### Store 桶形态

| 桶 | 形态 | 原因 |
|----|------|------|
| `create` | `ComputedRef<LayerConfigFragmentCreate>` | 与其它 create 字段同一源；`adapter` 仅此桶携带 |
| `use` / `define` | `ComputedRef<LayerConfigFragment>` | 绑定 MaybeRefOrGetter |
| `open` | plain，赋值替换 | 快照 API |
| `refs` | plain | 框架 internal |
| `use:template` / `define:template` | **plain 可变** | `store.template()` 原地写 slots；禁止改 computed 缓存对象 |

### 3. `clone`：父 `use` live fold + clone source

```ts
clone(config: MaybeRefOrGetter<LayerConfigContent> = {}) {
  use: computed(() =>
    mergeFragment(
      stripFragment(toValue(parentStore.use), (p) => p.endsWith('.props.ref')),
      toFragmentFromContent(toValue(config)),
    ),
  )
}
```

| 部分 | 行为 |
|------|------|
| 父 `store.use` | **持续** `toValue`：未覆盖字段（如 `locale`）跟父 live |
| `clone(config)` | 可为 getter；覆盖字段（如 `id: otherId`）由子自己绑 |
| `props.ref` | 仍 strip 父 use 段，避免多 instance 共享用户 ref |

**意图对齐**（偏覆盖）：

```ts
useLayer(Form, () => ({ props: { id: selectedId.value, locale: locale.value } }))
layer.clone(() => ({ props: { id: otherId.value } }))
```

- `id` → 子 getter（独立）
- `locale` → 继续跟父（省略 = 继承绑定，不是调用瞬间冻住）

空参 `clone()`：整份跟父 `use` live。若要完全独立且冻住父侧，调用方在 clone getter 里显式写死字段，或再调一次 `useLayer` 而非 clone。

### 4. `open` 保持快照

- `open()`：不写（或清空）`open` tier，只靠 `use` / `define` / `create` 等。
- `open({ props })`：写入 `open` tier 一次；打开期间父状态变不自动改 `open`；再 `open` 可更新。
- **不**提供 `open(() => …)`，避免与「当次 payload 快照」心智冲突；live 放在 `use` / `define` / `create`。

### 5. `createLayer` 与 `adapter`：写入 `store.create`，adapt 前取出

与「工厂创建时抠出 `adapter` 另传 prop」不同：**`adapter` 跟其它 create 字段走同一条 `MaybeRefOrGetter → computed → store.create`**，在 merge 之后、bind 之前取出使用。

```ts
// createLayer
store.create = computed(() => {
  const { adapter, ...rest } = toValue(configSource)
  return {
    ...mergeFragment(
      toFragmentFromContainer(rest),
      { container: { component: Container } },
    ),
    adapter,
  }
})

// LayerView（示意）
const adapter = props.store.create.adapter // 读 create 桶；merge 不认此字段
const fragment = mergeFragment(
  props.store.create, // mergeFragment 只合并 content/container，忽略 adapter
  defineStore['define:template'],
  defineStore.define,
  props.store['use:template'],
  props.store.use,
  props.store.open,
)
const adapted = adapter ? adapter(fragment) : fragment
```

要点：

- `mergeFragment` **只认** `content` / `container`，`adapter` 挂在 create 对象上会被自然忽略，不必改 merge 语义。
- 不再经 `createLayerInstance` → `createLayerApp` 单独传 `adapter` prop（或仅作兼容过渡）；响应式与换函数引用都随 `store.create` 更新。
- 工厂顶层 `computed` 仍合法；可工厂级共享同一 `create` computed。
- adapter **函数体内**读 `isMobile` 等依赖仍然有效（render 期调用）；也可以在 getter 里返回不同 `adapter` 引用——两者都走统一订阅。

---

## 备选方案（否决）

| 方案 | 否决原因 |
|------|----------|
| `watch` + 写回 plain store | 要管 stop / 生命周期；与 Vue 依赖模型重复 |
| 字段级 `MaybeRef`（`props.title` 单独 Ref） | 类型与 merge 复杂；整包 getter 已覆盖主场景 |
| `open` 也支持 getter | 与「点开一行 = 当次快照」冲突；空参 `open` + live `use` 已覆盖主路径 |
| clone 时父 use 快照 | 偏覆盖时 `locale` 等环境字段被误冻；与「省略 = 继承」不符 |
| `adapter` 从 config 抠出后单独闭包/prop 传递 | 与 create 其它字段两套通道；getter 换 adapter 易漏订阅 |

---

## 后果

- **兼容**：现有 plain 入参行为保持；仅扩展可传入 ref/getter/`computed`。
- **文档**：DESIGN / API 需写明各 API live vs `open` 快照，以及 clone 偏覆盖继承父 live。
- **测试**：倒计时 title 不 remount；空参 `open` + `use` getter；`createLayer` getter；clone 覆盖 `id` 后 `locale` 仍跟父；LayerTemplate 仍只写 `*:template`。

---

## 决策记录

| 项 | 结论 |
|----|------|
| `create` / `define` / `use` / `clone` 配置源 | Vue `MaybeRefOrGetter` |
| `open` | 仅 plain 快照 |
| 实现 | store 挂 computed，一路派生，无 watch 写回 |
| `adapter` | 写入 `store.create`，merge 后取出再 adapt；不单独传 prop |
| `*:template` 桶 | 保持 plain 可变 |
| clone 对父 `use` | live fold；clone source 可 live；strip 父 `props.ref` |
| 配置变化与 content remount | 不 bump `openId` |

---

## 参考

- [DESIGN.md](../../DESIGN.md) — merge 管线、`open` 快照语义（本文扩展 define/use/create/clone 为 live）
- Vue `MaybeRefOrGetter` / `toValue` / `reactive` 自动解包
