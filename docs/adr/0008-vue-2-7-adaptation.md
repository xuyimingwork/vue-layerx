# ADR 0008：Vue 2.7 适配

- **状态**：Accepted（**已实现**；前置 [ADR 0009](./0009-integration-tests-consume-dist.md) 已完成）
- **日期**：2026-07-28
- **关联**：[DESIGN.md](../../DESIGN.md) 兼容性；[ADR 0001](./0001-legacy-monolith-progressive-adoption.md)；[ADR 0002](./0002-open-use-override-container-component.md)；[ADR 0003](./0003-reactive-layer-config.md)；[ADR 0009](./0009-integration-tests-consume-dist.md)（Vue 3 集成迁独立包 / 只消费 dist，**须先完成**）

---

## 背景

主线（Vue 3）依赖 Teleport 同构树、`createApp` + `appContext` Host 桥接、`MaybeRefOrGetter` / `toValue`、flat `onUpdate:*` 等。Vue 2.7 有 Composition API，但缺 Teleport / Fragment / `createApp`，且 `h`、实例字段、默认 v-model 不同。

**已定降级（见 §已决）**：2.7 **不做 Teleport**；`container` 直接包 `content`；换容器时因嵌套 diff **自然**连带 remount content（非另定策略）。其余与 Vue 3 同类问题 **行为对齐**（D0.18）。清单项均已拍板；下文保留选项原文供追溯。

**可行性（实现前评估）**：在上述降级与 D0.19–D0.22 工程约束下 **可实现**。分叉面集中在挂载 / 视图树 / `h` 翻译；主要不确定性在「同包 dist 导入安全」与 Host / `defineLayer` 读路径，用 D0.17 / D0.22 关键路径 CI 锁定（见 §风险与缓解）。

**工程前置**：**先**落地 [ADR 0009](./0009-integration-tests-consume-dist.md)（Vue 3 集成 → `tests-vue3`、只消费 `dist`），**再**实现本篇 runtime 与 `tests-vue2`。本篇 **不**搬迁现行 `tests/integration`（避免与 Vue 2 兼容搅在同一变更集）。

---

## 已决

| ID | 决策 | 说明 |
|----|------|------|
| D0.1 | 计划支持 Vue 2.7，状态 **待适配** | 未实现前不改 `peerDependencies`、不宣称可用 |
| D0.2 | **不做 Teleport**（不自研 portal、不引 `portal-vue`） | `h(container, …, { default: () => h(content) })` |
| D0.3 | **换容器后 content 会丢**（相对 Vue 3 park） | **不是**另做 remount API：嵌套树下 `container.component` 一变，Vue 2 diff 自然拆掉子树；`openId` 策略与 Vue 3 相同（D2.2 / D2.3） |
| D0.4 | Vue 3 主线 **不**为 2.7 削弱 Teleport / park | 双端行为允许分叉 |
| D0.5 | `LayerNoContainer` 在 2.7 **不**维持同构 Teleport 树；**props 全投影**（D2.1-A） | 扁平 `h(content)`，但 container props→content 与 Vue 3 同语义 |
| D0.6 | **容器 model / 更新事件按大版本**（D4.1 / D4.2） | 见下表；**默认 model 与 flat 更新键由 compat 注入**（D0.20），非在 bind 内写 `isVue2` |
| D0.7 | **同包同 API**；适配首发预定 **`1.1.0`**（D1.1 / D1.2） | `peer: ^2.7 \|\| ^3.3`；公开函数名/签名一致；runtime 按 Vue 大版本分叉 |
| D0.8 | **Vue 2.7 挂载 / Host**：宿主 `Vue.extend` + `parent`（D3.1–D3.3） | provide/inject + 全局能力；对齐现行「一次 LayerApp、visible 显隐」；Host 窄接口见 D0.21 |
| D0.9 | **`toValue` / `MaybeRefOrGetter` 库内 polyfill**（D5.1-A） | 语义对齐 ADR 0003；不依赖 `@vueuse/core`；不削弱 getter |
| D0.10 | **`defineLayer` 内容根标记**（D5.4-A） | Vue 2.7：标在占位 vnode 的 **`data[LAYER_CONTENT]`**；读 **`$vnode.data`**；不进 props/attrs |
| D0.11 | **`h` / 事件平台适配落点**（D4.3 / D8.2-C） | `bind-*` 仍产出 Vue 3 flat；仅在 **`createLayerViewVNode` / `createLayerApp`**（`h` 前）翻译；**不做** model/`value`→`input` 二次推导（已在 D0.20 flat 键上体现） |
| D0.12 | **源码组织：`compat/vue2` + `compat/vue3` + 聚合层 `isVue2`**（D8.1） | 分端实现；业务只依赖聚合导出；不散落 `isVue2`；零运行时额外依赖（D8.3-B）；**导入安全见 D0.19** |
| D0.13 | **首期公开 API 全做；同名同形；行为差仅文档**（D7.1 / D7.2-A） | 不砍能力、不子路径、不因版本 throw；见下「对外可感知差」 |
| D0.14 | **公开类型：同包一份 `.d.ts` + 本地 shim**（D1.3-C） | 不双 types 入口；`MaybeRefOrGetter` 等自声明；只用两端共有的 Vue 类型名 |
| D0.15 | **官方 2.7 可运行示例暂不做**（D6.1） | 首期以差异文档为准；playground-vue2 / Element UI demo **延后** |
| D0.16 | **容器 default 插槽：与 Vue 3 相同，无特殊处理**（D2.4） | 假定容器会渲染 default；不做 fallback / 不强制关 append-to-body |
| D0.17 | **CI / 文档 / EOL**（D1.4-C / D1.5 / D1.6-A） | Vue 2.7 **关键路径** job（D0.22）；一篇 Vue 2 兼容说明；best-effort 无 SLA |
| D0.18 | **与 Vue 3 同类问题：行为对齐现行** | 凡非 2.7 专有缺口（Teleport/model 默认/Host 挂载形态等已另决），实现与用户体感跟 Vue 3 一致；见下表 |
| D0.19 | **同包 dist 导入安全** | 禁止对 Vue 3-only API 静态 named import；见下「D0.19」 |
| D0.20 | **默认 model / flat 更新键由 compat 注入** | 澄清 D0.6 + D0.11：bind 仍 flat、不分叉文件；`value`→`input` 体现在 flat 键 |
| D0.21 | **Host 经 compat 窄接口** | 业务不直触 `appContext` / 2.7 raw 内部实例；配套 D0.8 / D3.5 |
| D0.22 | **Vue 2.7 测试：独立 workspace 包 `tests-vue2`** | 只消费 `vue-layerx` dist；关键路径 + 入口冒烟；**不**在根包双挂 `vue@2`；前置 ADR 0009 |

**D0.18 对齐清单（原待决策项一次性收口）**

| ID | 决议（与 Vue 3 相同 / 实现适配不改语义） |
|----|------------------------------------------|
| D2.5 | 无额外 wrapper；单根即 container / NoContainer 时 content |
| D2.6 | 对外仍收「返回 VNode 的函数」；2.7 仅在 compat/`h` 侧转 slots |
| D3.4 | 不专项处理 DevTools（`parent` 关联即可，同「不另搞一套」） |
| D3.5 | 适配层封装 setup 实例探测（proxy / mounted）；语义同现 `bindHost`（窄接口 **D0.21**） |
| D3.7 | SSR：无 `document` 不 mount |
| D3.8 | 挂载点：`document.body` |
| D4.4 | ref：仅 function / Ref；字符串忽略 |
| D4.5 | 不强制拆 attrs；尊重组件 `inheritAttrs` |
| D4.6 | 异步等 content 支持范围同 Vue 3 文档/测试意图 |
| D5.2 | 类型本地处理；不因 emits 改用户语义 |
| D5.3 | 继续 Symbol `InjectionKey` |
| D5.5 | 文档面向 2.7+；ADR 0007 静态 define **两端都不做** |
| D6.2 | append-to-body 双挂：接受，与 Vue 3+Element 相同；兼容篇可提一句 |
| D6.3 | **仅 Vue 2.7+**（不对标 composition-api+2.6） |
| D7.3 | keep-alive：同现文档（deactivated 不自动卸；Host 卸才 dispose） |

**D0.14 类型**

- 发布仍一个 `"types": "./dist/index.d.ts"`；用户 `import … from 'vue-layerx'`，**不**要求 `vue-layerx/vue2`，**不**用 postinstall 改 types。
- 对 Vue 3.3+ 才有的类型（如 `MaybeRefOrGetter`）在库内 **本地声明 / shim**（与 D0.9 polyfill 配套）；公开表面优先依赖两端都有的 `Component`、`ComponentPublicInstance`、`VNode`、`Ref`、`ComputedRef` 等。
- **否决**双 `types` 入口、`typesVersions` 扮 Vue 分支、自定义 exports condition。
- 内部 Host / `appContext` 等不进入精确公开类型（放宽或仅实现侧使用；与 **D0.21** 窄接口一致）。

**D0.13 API 范围与对外差异**

首期 2.7 **全部**提供与 Vue 3 同名的公开能力：`createLayer` / `useLayer` / `open` / `close` / `confirm` / `clone` / `bindHost` / `defineLayer` / `LayerTemplate` / `adapter` / live 配置 / `LayerNoContainer` / SSR（无 DOM 跳过 mount）/ 打开后换容器（允许，自然 remount）。

日常用法（`open` / `close` / `confirm` / `defineLayer` / 插槽模板 / Host provide）在正确配置 `model` 与容器组件的前提下，**对外体感应基本一致**。仍建议文档点明的差主要是：

| 场景 | 是否常踩 | 说明 |
|------|----------|------|
| 打开后改 `container.component` | 少见（进阶） | Vue 3 可 park content；2.7 嵌套 diff 会丢 content state（D0.3） |
| 默认 `model` | 换 UI 库时 | 3→`modelValue`，2.7→`value`（D0.6）；Element UI 等需显式 `model: 'visible'` |
| 内部树形（有无 Teleport） | 通常无感 | Dialog 自身常 `append-to-body`；用户仍 `open()` |

**不**做：专用子路径、对「同名 API」按版本 throw、首期砍 `LayerTemplate` 等。行为差 **只写文档 / changelog**，不加强制 runtime 警告（可选日后加）。

**D0.12 compat 结构**

```text
src/
  core/                 # fragment、store、bind-*、instance 编排等（无 isVue2）
  compat/
    env.ts              # isVue2（读 vue.version / 约定探测；不引 vue-demi）
    vue3/               # 现行 createLayerApp、createLayerViewVNode、toPlatformVNodeData(identity)…
    vue2/               # extend+parent、嵌套树、toPlatformVNodeData、data[LAYER_CONTENT]…
    index.ts            # 聚合：createLayerApp = isVue2 ? vue2 : vue3（只选函数引用）
  api/                  # 只 import compat 聚合，不直连 vue2/vue3
```

约束：

- **分端实现**，禁止单文件内大段 `if (isVue2) { … }` 交织业务。
- 聚合层 **静态绑定一次**导出；热路径不再反复判断。
- 同包一份 dist 可同时带上两套 compat（库小可接受）；若日后要抠包体，再在构建期把 `isVue2` define 成常量做 DCE（非本期必须）。
- **不**引入 `vue-demi` / `portal-vue`（D8.3-B / D0.2）。
- **导入安全见 D0.19**：同包带两套 compat 可行，但 dist **不得**让 Vue 2.7 消费路径静态 named import `createApp` / `Teleport` / `toValue` 等 Vue 3-only 符号。

**D0.11 `h` 适配落点**

- 库内调 `h(` 的只有 `createLayerViewVNode`（container/content）与 `createLayerApp`（`LayerView` + 挂载）。
- **`bind-container-model` / `bind-close-on` 不维护两套文件**：继续产出 Vue 3 flat props（`onDone`、`onUpdate:…` / 在 D0.20 下也可能是 `onInput`），可作共享 core；**不**在 bind 内写大段 `if (isVue2)`。
- 与 **D0.20** 配合：默认 `model` 与「应产出的 flat 更新键」已由 compat 选好；本层 **只**做 flat props / slots / ref / `LAYER_CONTENT` → 平台 `h` data，**不**再二次猜测 `value` / `input`。
- Vue 2.7：在 `h` 前把 flat props 拆成 `{ props, on, scopedSlots, … }`（建议抽共用 `toPlatformVNodeData`）；顺带处理 `ref`、`LAYER_CONTENT`→`data`、slots 形态（D2.6）。
- Vue 3：翻译层 identity，避免误伤现行路径。
- **不**为 `.native` 另开配置（首期只保证组件自定义事件）。

**D0.8 挂载与 Host（Vue 2.7）**

对齐现行 `createLayerApp` / `bindHost` 语义，不用 Vue 3 的 `createApp` + `appContext` 桥接。公开仍只有 `bindHost()`；内部经 **D0.21** 窄接口，业务不直触 `appContext`。

| 步骤 | 做法 |
|------|------|
| 取 Host | `bindHost` 在 setup 同步调用：经 compat 取 **setup proxy**（Options 的 `this`）。**不要**把 Vue 3 internal / 2.7 raw 内部实例当 `parent` |
| 取构造器 | **`hostProxy.$root.constructor`（实现时可再评估 `hostProxy.constructor`）**，即宿主应用那份 `Vue`；避免库内 `import Vue from 'vue'` 与应用双副本导致全局组件 / `prototype` 丢失 |
| 创建根 | `const LayerCtor = HostVue.extend(LayerApp)`（**一次**；不要每次 `open` 都 `extend`） |
| 挂载 | `instance = new LayerCtor({ parent: hostProxy })` → `$mount()`（或挂到预置 el）→ 插入 `document.body`（与现行一致，见 D3.8） |
| 卸载 | `$destroy()` + 摘除 DOM，对齐 `app.unmount()` |
| provide/inject | 仅靠 **`parent: hostProxy`** 走 `_provided` 链；**不**手拷 `_provided` |
| 全局能力 | `$message` / `Vue.use` / 全局组件随 **宿主构造器上的 `extend`** 继承；**不**逐项抄 `prototype` |
| 显隐 | LayerApp **长期存活**，用外部 `reactive`/`visible` 驱动；**不是**每次 `open` 都 `new`+`extend`（与「动态组件每次 mount」示例不同） |
| 无 Host | 与 Vue 3 对齐：**允许**挂载 / `open`，此时无 `parent`（无页面 provide）；全局仍取决于所用 `Vue` 构造器（无 Host 时回退策略实现定，须测） |
| 晚绑定 / Host 卸 | **下次 open 才 bake Host**（开着换 Host 不热更新 provide / 不 destroy）；Host `onUnmounted` → dispose 弹层 |

示意（非最终源码）：

```js
const hostProxy = getCurrentInstance().proxy // bindHost 时经 compat 保存
const HostVue = hostProxy.$root.constructor
const LayerCtor = HostVue.extend(LayerApp)

// createLayerApp.mount（首次需要 DOM 时）
const instance = new LayerCtor({ parent: hostProxy })
instance.$mount()
document.body.appendChild(instance.$el)

// unmount
instance.$destroy()
instance.$el.remove()
```

约束：

- 双副本 `vue` 时注入链可能仍在、全局却丢——文档提醒应用 `dedupe`；库侧坚持宿主构造器 `extend`。
- DevTools：靠 `parent` 关联；不做 Vue 3 那套 `appContext.app` 特判（D3.4，接受多根）。
- `isMounted` / `_isMounted`、proxy vs internal 等差异由 compat 封装（D0.21 / D3.5），须测。

**D0.7 发布**

- 包名仍为 `vue-layerx`；用户 `import { createLayer, … } from 'vue-layerx'`，Vue 2 / 3 **调用面一致**。
- 实现：`compat/vue2` + `compat/vue3` 分端 + 聚合层 `isVue2`（**D0.12**）；**不**另发 `vue-layerx-vue2`，**不**以 `vue-demi` 为依赖。
- 版本：适配合并后发 **`1.1.0`**（相对现行 `1.0.x` 的 minor）；changelog 写明 2.7 支持与行为差（无 Teleport、换容器 remount、model 默认等）。未实现前 `package.json` 版本与 peer **暂不改**。

**D0.6 容器显隐绑定**

| Vue | 默认 `model` | prop | 更新事件 |
|-----|--------------|------|----------|
| **3** | `modelValue` | `modelValue`（或显式 `model`） | 始终 `update:${model}`（flat：`onUpdate:${model}`） |
| **2.7** | `value` | 同 `model` | **`model === 'value'`** → `input`（flat：`onInput`）；**否则** → `update:${model}`（如 `visible` + `update:visible`） |

```text
# Vue 3（现行）
modelValue  +  update:modelValue

# Vue 2.7
默认：     value   +  input
其它显式 model（如 visible / open）： visible + update:visible、open + update:open
```

用户仍可用 `createLayer(Dialog, { model: '…' })` / tier 覆盖改 prop 名；事件按上表由 `model` 推导，**不**另开 `event` 配置项（除非将来修订）。

**实现分工（与 D0.11 / D0.20 一致，避免前后打架）**：

- compat 导出 `DEFAULT_CONTAINER_MODEL` 与 `toModelUpdateProp(model)`（或等价名）。
- `bindContainerModel` / `bindLayer` **只消费**上述注入值，按传入的 `model` + flat 键写 props；**不**读 `isVue2`。
- `toPlatformVNodeData` 只做 flat → Vue 2 `{ props, on, … }`，**不**再把 `onUpdate:value` 特判成 `input`。

```text
# Vue 2.7 LayerView（目标；对外仍是「slots 对象」心智，compat 再转 scopedSlots）
h(container, /* 经 toPlatformVNodeData 后的 data */, {
  default: () => h(content, …),
})
```

**D0.19 同包 dist 导入安全**

同包一份 dist 可同时含 `compat/vue2` + `compat/vue3`（D0.12），但若模块图里对 Vue 3-only API 做静态 named import，Vue 2.7 应用会在解析 / 打包阶段失败。

约束：

- **仅** named import 两端交集 API（如 `h` / `ref` / `watch` / `defineComponent` / `getCurrentInstance` / `provide` / `inject` / `computed` / `reactive` / `shallowRef` / `onUnmounted` 等）。
- Vue 3 专有能力（`createApp` / `Teleport` / …）仅在 `compat/vue3` 内通过 `import * as Vue from 'vue'`（或等价）再取属性；缺失则为 `undefined`，且 **不得**被 Vue 2.7 热路径执行到。
- `toValue` **不**从 `vue` named import：走库内 polyfill（D0.9）；`MaybeRefOrGetter` 走本地类型 shim（D0.14）。
- **否决**：依赖「未执行的分支 bundler 不会解析」、或假定 Vue 2.7 会 re-export 这些符号。
- CI（D0.17 / D0.22）：在 `tests-vue2` 用 Vue 2.7 解析 / 打包库入口做冒烟，防止回归。

**D0.20 默认 model / flat 更新键注入**

澄清「D0.6 按大版本选事件」与「D0.11 bind 仍 flat、不分叉文件」：

| 导出（compat 聚合） | Vue 3 | Vue 2.7 |
|---------------------|-------|---------|
| `DEFAULT_CONTAINER_MODEL` | `'modelValue'` | `'value'` |
| `toModelUpdateProp(model)` | 恒 `'onUpdate:' + model` | `model === 'value'` → `'onInput'`；否则 `'onUpdate:' + model` |

- core 的 `bindLayer` / `bindContainerModel` 从聚合层取上述值；产出仍是 flat props。
- **不**维护两套 `bind-*` 文件；**不**在 bind 内散落 `isVue2`。
- `toPlatformVNodeData`：**不**承担 `value`→`input` 语义（已在 flat 键上体现）。

**D0.21 Host 窄接口**

公开 API 仍只有 `bindHost()`。内部 Host 经 compat 统一窄接口（名称实现自定），例如：

- `getSetupInstance()` / `hasSetupContext()` / `onHostUnmounted(cb)` / `createLayerApp` 所用挂载原语。

约束：

- **禁止**业务 / instance 编排层直接依赖 Vue 3 的 `appContext`、`ComponentInternalInstance.provides`，或把 2.7 raw 内部实例当 `parent`。
- Vue 3：现行 `createApp` + provide 桥接（可继续活在 `compat/vue3`）。
- Vue 2.7：`proxy` + `parent` + `$destroy`（D0.8）。
- 与 D3.5 一致：探测失败则 warn 并当无 Host（语义同现行）。

**D0.22 Vue 2.7 测试 harness（独立包）**

与 [ADR 0009](./0009-integration-tests-consume-dist.md) 同构：**集成 / 兼容线只消费 `dist`**，用独立 workspace 包隔离 Vue 大版本解析；**覆盖率另开 src-alias 趟**（与 `tests-vue3` 双跑对称）。

| 包 | 职责 | 依赖要点 |
|----|------|----------|
| 根 `vue-layerx` | 库 + **unit**（`src/**/__test__`，测源码） | `vue@3`（dev）；不变 |
| `tests-vue3` | Vue 3 **全量集成**（ADR 0009） | `vue-layerx: workspace:*` + `vue@3` + `@vue/test-utils@2` |
| `tests-vue2` | Vue 2.7 **关键路径** + **入口解析冒烟**（本篇） | `vue-layerx: workspace:*` + `vue@2.7` + `@vue/test-utils@1` |

双跑：

| 趟 | 配置 | 作用 |
|----|------|------|
| **门禁** | `tests-vue2/vitest.config.ts` | 只消费 dist；CI / `prepublishOnly` |
| **覆盖率** | 根 `vitest.vue2-coverage.config.ts` | `vue-layerx`→`src`，`vue` 钉到 tests-vue2 的 2.7；**不**代替门禁 |

约束：

- **前置**：ADR 0009 已合并（`tests-vue3` 存在且集成只 `import from 'vue-layerx'`）。本篇实现 **不**负责把现行 `tests/integration` 迁出根包。
- **否决**根包同时安装 `vue@2` + `vue@3`、或靠 npm alias / Vitest 全局改写 `vue` 解析跑双端（易串版）。
- `tests-vue2` **不**追求与 `tests-vue3` 全量对等；覆盖 mount / Host / 换容器自然 remount / bind·model（默认 `value`）/ `defineLayer` 内容根 + D0.19 入口冒烟即可。
- 流水线：`pnpm build` → 根 unit → `tests-vue3` → `tests-vue2`（后两步均依赖 dist）。
- Coverage：`unit` + vue3-alias + vue2-alias → merge；CI **不**设 100% threshold。
- 用例按 `@vue/test-utils@1` API **新写**；不要指望把 Vue 3 集成原样改 alias 就能绿。

---

## 待决策问题清单（追溯用；决策已全部并入 D0）

填写约定：每项选一个选项（或写「自定义」）；实现前把「决策」列填满。建议优先级：先 **D1 交付形态** → **D3 Host/挂载** → **D4 事件/v-model** → 其余。

> 现状：选项原文保留供追溯；**决策列已填满**并并入 D0.1–D0.18。实现评估后追加的工程约束为 **D0.19–D0.22**（导入安全、model/更新键注入、Host 窄接口、`tests-vue2` 独立包）；Vue 3 集成迁包见 **ADR 0009**（本篇前置，不在此实现）。

### D1. 交付与工程

#### D1.1 发布形态

| 选项 | 内容 | 利 | 弊 |
|------|------|----|----|
| A | 同包条件导出（`vue-layerx` + `exports` / 自动按 vue 版本） | 用户装一个包 | 构建/类型复杂；误用风险 |
| B | `vue-demi` 同仓条件编译 | 经典双端套路 | Teleport 分叉仍要两套 view；demi 维护成本 |
| C | 独立包 `vue-layerx-vue2`（或 scope 子包） | 主线干净；版本可独立 | 两份发布、文档分叉 |
| D | 同仓 `packages/vue2`，npm 仍一个名字不同 tag（如 `@vue2`） | 源码一仓 | tag/发布流程要定 |

- **决策**：**A + 同 API 运行时兼容**（并入 **D0.7**）— 同包；公开函数一致；按 Vue 大版本选 runtime。否决独立包名（C）与 vue-demi 依赖（B）。

#### D1.2 版本号与 semver

| 选项 | 内容 |
|------|------|
| A | 与 Vue 3 同版本号，changelog 分区写 2.7 差异 |
| B | Vue 2 包独立 major/minor（如 `0.x` 或 `2.x`），不跟主线齐步 |
| C | 主线升 major 才加 2.7 peer（`^2.7 \|\| ^3`），此前独立预发 |

- **决策**：**A，首发 `1.1.0`**（并入 **D0.7**）— 与 Vue 3 同版本号；changelog 分区写 2.7 差异。

#### D1.3 TypeScript 类型从哪来

| 选项 | 内容 |
|------|------|
| A | 依赖 `vue@2.7` 自带类型 |
| B | 双端各自 `types` 入口（`dist/index.d.ts` vs `dist/vue2.d.ts`） |
| C | 共享业务类型，Vue API 类型用条件类型 / 本地 shim（`MaybeRefOrGetter` 等） |

- **决策**：**C**（并入 **D0.14**）— 同包一份声明 + 本地 shim；否决双 types / postinstall 切 types。

#### D1.4 测试矩阵

| 选项 | 内容 |
|------|------|
| A | CI 双矩阵：Vue 3（现行）+ Vue 2.7（`@vue/test-utils@1`） |
| B | 仅 Vue 3 CI；2.7 本地/手工 + 少量冒烟 |
| C | 2.7 单独 job，覆盖 runtime 关键路径（mount / Host / 换容器 remount / bind） |

- **决策**：**C**（并入 **D0.17** / **D0.22**）— 保留 Vue 3 测试（unit 在根；集成在 `tests-vue3`，见 ADR 0009）；另加 workspace 包 **`tests-vue2`** 跑 Vue 2.7 **关键路径**（mount / Host / 换容器自然 remount / bind·model / defineLayer 内容根）+ **库入口解析冒烟**（D0.19）。**不**在根包双挂 `vue@2`；**不**追求与 Vue 3 集成全量对等。实现本篇前须先完成 ADR 0009。

#### D1.5 文档与 demo

| 选项 | 内容 |
|------|------|
| A | 官网 VitePress 仍 Vue 3；另开「Vue 2.7」差异页 + 外链 playground |
| B | 同仓 `playground-vue2`（Vite + vue2 plugin / webpack） |
| C | 文档只写差异表，不提供可运行 2.7 demo |
| D | 一篇「Vue 2 兼容」指南即可（无 playground） |

- **问题**：现有 `DemoBlock` / Element Plus 示例无法在 VitePress（Vue 3）里跑 2.7。
- **决策**：**D**（并入 **D0.17**；与 **D0.15** 一致）— 提供一篇 Vue 2 兼容说明（差异、model 默认、换容器、Host）；**不做**可运行 2.7 demo / playground。

#### D1.6 Vue 2 EOL 与支持窗口

| 选项 | 内容 |
|------|------|
| A | 明确「best-effort / 社区维护」，无 SLA |
| B | 定支持截止日期（如发后 N 个月或 Vue 2 安全通告后停更） |
| C | 与主线同生命周期，bugfix 都接 |

- **决策**：**A**（并入 **D0.17**）— **最大努力（best-effort）**，无 SLA；不承诺与主线同寿。

---

### D2. 视图树与 NoContainer（在已决 D0.2/D0.3 之上）

#### D2.1 `LayerNoContainer` 时 props 投影

Vue 3：NoContainer 仍走 Teleport 树，把 `container.props`（含 model）投影到 content。

2.7 扁平 `h(content)` 时：

| 选项 | 内容 |
|------|------|
| A | 同样把 merge 后的 container props（model / onUpdate / create 默认）merge 进 content props |
| B | 不投影；用户必须在 content 内自己接 `visible` / 关层 |
| C | 仅投影 `model` 相关键，其它 container props 丢弃 |

- **影响**：A 最接近 Vue 3 用户体感；B 更简单但破坏「无容器仍命令式显隐」；单体 + NoContainer（ADR 0001）强依赖投影语义。
- **决策**：**A**（并入 **D0.5**）— **全投影**，与现行 Vue 3 一致：NoContainer 时把 merge 后的 `container.props`（含 model / 更新监听 / create 默认等）merge 进 content props。树形扁平，投影语义不变。

#### D2.2 换容器 remount 的触发面

| 选项 | 哪些变化触发整树 remount |
|------|--------------------------|
| A | **仅** `container.component` 引用变化 |
| B | `container.component` **或** NoContainer ↔ 普通容器 切换 |
| C | 任意导致「根 vnode type」变化都 remount（含误把异步组件每次新函数） |
| D | **与 Vue 3 配置/合并语义一致**；不另定触发表。因无 Teleport、content 在 container 子树内，`container.component`（含↔ NoContainer）类型变化时 **patch 自然 remount 整棵子树** |

- **决策**：**D**（澄清 **D0.3**）— 不引入单独的「换容器 remount 策略」。行为差只来自树形：Vue 3 Teleport 可 park content；Vue 2.7 嵌套则 diff 连带刷 content。触发面 = 任何使容器 vnode type 变化的 `container.component` 更新（与现在改 component 的时机相同）。

#### D2.3 `openId` / key 策略

Vue 3：`openId` 在 `visible` false→true 时递增，作 content 的 `key`；换容器靠 Teleport park，**不**另涨 key。

| 选项 | 内容 |
|------|------|
| A | 2.7：`key = openId` 只在 visible false→true 递增；换容器另用 `containerKey` 迫使整树重建 |
| B | 换容器与重新 open 共用同一 key 空间（任一变化都 ++） |
| C | 不做稳定 key，依赖 Vue 2 默认原地 patch（**不推荐**，换容器可能状态错乱） |
| D | **与 Vue 3 相同**：仅 `openId`（false→true ++）；**不**为换容器加 `containerKey`——换容器重刷靠父组件 type 变化的自然 diff |

- **决策**：**D**（与现行一致）— `watch(visible)` 逻辑对齐 `layer-view.ts`；不为 2.7 单独发明 key 空间。

#### D2.4 容器 `default` 插槽被 UI 库吃掉 / 不渲染

部分 Dialog 用 `append-to-body` 把面板挪到 body，default 仍在组件内部——嵌套 content 一般仍 OK。若容器 **不渲染** default（只渲染具名插槽）：

| 选项 | 内容 |
|------|------|
| A | 文档约束：容器必须渲染 default；否则不支持 |
| B | 检测无锚点则 fallback 把 content 挂到 LayerApp 根（行为分叉） |
| C | 2.7 要求容器关闭 `append-to-body`，避免双层传送门心智 |

- **决策**：**与 Vue 3 相同**（并入 **D0.16**）— 内容放进容器 default（2.7 为直接嵌套）；**不**做无 default 时的 fallback，**不**因本问题强制关 append-to-body。怪容器不渲染 default 时两端同样不可用，文档可顺带一句约束即可（非 2.7 专有决策）。

#### D2.5 Vue 2 无 Fragment：LayerApp / LayerView 包装节点

| 选项 | 内容 |
|------|------|
| A | LayerView 单根即 container（或 NoContainer 时 content）——无额外 wrapper |
| B | 外层固定 `<div class="vue-layerx-root">`，便于挂 class / 测查询 |
| C | 注释节点 / 空标签技巧（脆弱，不推荐） |

- **决策**：**与 Vue 3 相同**（并入 **D0.18**）— 无额外 wrapper。

#### D2.6 插槽函数形态（`LayerTemplate` / config.slots）

Vue 3：`slots: { footer: () => VNode }`。Vue 2 scoped slot 数据形态不同（`slot-scope` / `v-slot`，`h` 的 children 规范不同）。

| 选项 | 内容 |
|------|------|
| A | 内部适配层：对外仍收「返回 VNode 的函数」，渲染时转成 2.7 children / scopedSlot |
| B | 2.7 公开 API 改为 Vue 2 风格 slot 对象，与 Vue 3 类型分叉 |
| C | 首期 **不支持** `LayerTemplate` / 具名 slots 配置，只支持 default content |

- **决策**：**A**（并入 **D0.18**）— 公开 API 同 Vue 3；仅 compat/`h` 侧转换。

---

### D3. 挂载与 Host

#### D3.1 独立实例怎么造

| 选项 | 内容 |
|------|------|
| A | `new Vue({ parent, render }).$mount(el)` + `$destroy()` |
| B | `Vue.extend` 出构造器再 `new` |
| C | 挂到隐藏组件的 `$root` 下，不独立 Vue 实例 |

- **决策**：**B**（并入 **D0.8**）— 宿主 `Vue.extend(LayerApp)` 再 `new`；`$destroy()` 卸载。否决挂到 `$root` 下不独立实例（C）。

#### D3.2 provide / inject 继承

| 选项 | 内容 |
|------|------|
| A | 仅 `parent: hostProxy`（经典，继承 `_provided`） |
| B | `parent` + 手动拷贝 / 原型链 `_provided`（防 host 卸载后仍打开？） |
| C | 不继承；文档要求用户自备配置（无 Host 上下文） |

- **问题**：无 Host 时 Vue 3 仍能挂到 body，只是没有 provide——2.7 是否同样允许？
- **决策**：**A**（并入 **D0.8**）— `parent: hostProxy`；不手拷 `_provided`。**无 Host：允许挂 / open**（无 provide，与 Vue 3 对齐）。

#### D3.3 全局能力继承（`$message`、Element locale、prototype 插件）

`parent` **不会**自动带上 Host 所在根的全部 `Vue.prototype` 扩展方式差异，且独立 `new Vue` 的 `Vue` 构造器是模块里那份。

| 选项 | 内容 |
|------|------|
| A | 只保证 provide/inject；原型 / 全局组件 **不**桥接（文档写清） |
| B | 从 host 根读取 `constructor` / `options.components` / `prototype` 做有限桥接 |
| C | 要求用户 `Vue.use` 的插件在「创建 Layer 的同一 Vue 构造器」上，库用该构造器 `new` |

- **影响**：Element UI 主题、`$t`、`$message` 是高频坑。
- **决策**：**C**（并入 **D0.8**）— 用 **`hostProxy.$root.constructor.extend(...)`**（与应用同一 `Vue`）；不靠抄 `prototype` 列表（否决纯 A；B 的「有限桥接」不作主路径）。

#### D3.4 DevTools / 多根实例

Vue 3 曾特判 `appContext.app` 避免 DevTools 挂错树。

| 选项 | 内容 |
|------|------|
| A | 2.7 不处理 DevTools；接受多个 Vue 根 |
| B | 设置 `parent` 后尽量让 DevTools 归到主应用下 |
| C | `Vue.config.devtools` 相关专项测试后再定 |

- **决策**：**与 Vue 3 相同意图**（并入 **D0.18**）— 不专项处理 DevTools；靠 `parent` 关联即可。

#### D3.5 `bindHost` 实例探测

Vue 3：`getCurrentInstance()` + `isMounted`。2.7 的 setup 实例是 proxy，字段名可能是 `_isMounted`，且 `getCurrentInstance()` 在 2.7 与 3 行为有历史差异。

| 选项 | 内容 |
|------|------|
| A | 适配层统一 `getSetupInstance()`，封装 isMounted / proxy / raw |
| B | 要求用户只在 `setup` / `<script setup>` 调；探测失败则 warn 并当无 Host |
| C | 暴露 `bindHost(vm)` 显式传入 Options API `this` |

- **决策**：**A**（并入 **D0.18**；窄接口见 **D0.21**）— 适配层对齐现 `bindHost` 语义（setup 同步、已挂载拒绝等）；不新增公开 `bindHost(vm)` 除非日后需要。

#### D3.6 Host 卸载与晚绑定

现行：Host `onUnmounted` → dispose；打开时若 Host 变更则 bump key。

| 选项 | 内容 |
|------|------|
| A | 对齐 Vue 3：Host 卸则 `unmount` 弹层；晚 `bindHost` 下次 open 生效 |
| B | Host 卸只断 provide，弹层可继续（易成孤儿） |
| C | 无 Host 时禁止 `open` |

- **决策**：**A**（并入 **D0.8**）— Host 卸则 dispose 弹层；晚 `bindHost` 下次 open 生效。

#### D3.7 SSR

| 选项 | 内容 |
|------|------|
| A | 与 Vue 3 相同：无 `document` 不 mount；客户端再 open |
| B | 2.7 路径声明 **不支持 SSR** |
| C | 提供 `onMounted` 自动 defer 的包装（库内） |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同。

#### D3.8 挂载点 DOM

| 选项 | 内容 |
|------|------|
| A | 继续 `document.body.appendChild` 空 div（现行） |
| B | 可配置 `mountTo`（对齐部分 UI 库） |
| C | 若容器自身 `append-to-body`，库改为挂到 Host 旁，避免双重 body |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同，挂 `document.body`。

---

### D4. `h`、事件、v-model、attrs

#### D4.1 默认 `container.model`

| 选项 | 内容 |
|------|------|
| A | 2.7 默认 `'visible'`（Element UI Dialog） |
| B | 仍默认 `'modelValue'`，文档强制 `createLayer(Dialog, { model: 'visible' })` |
| C | 按 `vue` 大版本自动选默认（3→`modelValue`，2.7→`value`，与平台默认 v-model 对齐） |
| D | 无默认，缺 `model` 则 dev 抛错 |

- **决策**：**C**（并入 **D0.6**；实现见 **D0.20**）— Vue 3 → `modelValue`；Vue 2.7 → `value`；Element UI 等用 `visible` 时显式 `model: 'visible'`。由 compat 注入 `DEFAULT_CONTAINER_MODEL`，bind 不读 `isVue2`。

#### D4.2 更新事件命名（bind-container-model）

Vue 3：`props['onUpdate:visible']`。Vue 2 `.sync`：`on: { 'update:visible': fn }`，另有人用 `input` + `value`。

| 选项 | 内容 |
|------|------|
| A | 内部按 `model` 分支：`value`→`input`，其它→`update:${model}`；Vue 3 始终 `update:${model}` |
| B | 只支持 `update:${model}`（文档要求 `.sync` / `update:visible`） |
| C | `model` 同时配置 `prop` + `event`（公开扩展 config） |

- **决策**：**A**（并入 **D0.6**；实现见 **D0.20**）— Vue 3：flat `onUpdate:${model}`；Vue 2.7：`model === 'value'` 时 flat `onInput`（对应 `input`），否则 `onUpdate:${model}`。不采用公开 `event` 字段（否决 C）。`toPlatformVNodeData` 不再二次特判。

#### D4.3 `closeOn` / 普通 listeners（bind-close-on）

Vue 3：`onDone` camelCase 进 props。Vue 2：`on: { done: fn }` 或 `nativeOn`。

| 选项 | 内容 |
|------|------|
| A | 适配层按版本输出正确 `h` data |
| B | 2.7 只支持组件自定义事件（非 `.native`） |
| C | 另支持 `nativeOn` 表（配置扩展） |

- **决策**：**A**（并入 **D0.11**）— 适配发生在 `h` 前（`createLayerViewVNode` / `createLayerApp`），把 flat `onXxx` 转成 Vue 2 `on: { … }`。首期只保证**组件自定义事件**（非 `.native`）；不另开 `nativeOn` 配置（否决 C 作首期范围）。model/`value`→`input` 不在本层处理（D0.20）。

#### D4.4 `ref` 回调 / 字符串 ref

现行：只支持 function / `Ref`，字符串 ref warn 忽略。

| 选项 | 内容 |
|------|------|
| A | 2.7 保持相同策略 |
| B | 2.7 额外支持字符串 ref 写到子实例 `$refs`（通常无 Host 控制权，意义不大） |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同。

#### D4.5 `inheritAttrs` / 透传

Vue 2/3 对 fallthrough 略有差异；NoContainer `inheritAttrs: false`。

| 选项 | 内容 |
|------|------|
| A | 保持组件自己的 `inheritAttrs`；库不强制 |
| B | bind 时显式拆 `props` vs `attrs`，避免 class/style 进错地方 |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同。

#### D4.6 异步 / 函数式组件作 content

| 选项 | 内容 |
|------|------|
| A | 文档声明与 Vue 3 相同支持范围，测异步组件 |
| B | 2.7 首期仅 SFC / 普通选项组件 |
| C | 函数式组件单独测，不行就文档排除 |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同。

---

### D5. Composition API / 类型 polyfill

#### D5.1 `toValue` / `MaybeRefOrGetter`

| 选项 | 内容 |
|------|------|
| A | 库内 polyfill（`unref` + 函数则调用） |
| B | peer 依赖 `@vueuse/core` 的 `toValue` |
| C | 2.7 公开 API **不**接受 getter，只 plain / Ref（削弱 ADR 0003） |

- **决策**：**A**（并入 **D0.9**）— 库内 polyfill：`toValue(source)` = 函数则调用否则 `unref`；类型侧本地声明 `MaybeRefOrGetter`（可与 D1.3 共用）。否决 vueuse（B）与削弱 ADR 0003（C）。

#### D5.2 `SlotsType` / `emits` 选项

`LayerTemplate` 用了 `SlotsType`；`LayerView` 用了 `emits: { 'update:visible': … }`。

| 选项 | 内容 |
|------|------|
| A | 类型侧去掉 / 本地声明；runtime `emits` 在 2.7 忽略或改 `model` 选项 |
| B | 2.7 用 `model: { prop, event }` 声明 LayerView 显隐 |

- **决策**：**A**（并入 **D0.18**）— 不改变用户可见语义。

#### D5.3 `InjectionKey` + `Symbol`

| 选项 | 内容 |
|------|------|
| A | 继续 Symbol key（2.7 provide/inject 支持） |
| B | 改字符串 key 以免跨副本 Symbol 不一致 |

- **问题**：双 Vue 副本或重复打包时 Symbol 不共享会导致 `defineLayer` 的 `exists === false`。
- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同用 Symbol；双副本问题两端共有，文档提醒 dedupe。

#### D5.4 `defineLayer` 内容根判定

Vue 3：vnode.props 上挂 `LAYER_CONTENT` Symbol。2.7 VNode 是 `data` / `componentOptions`。

| 选项 | 内容 |
|------|------|
| A | 标在占位 vnode 的 **`data`**（Symbol / 私有键）；读取 `$vnode.data`；**不**进 `props` / `attrs` |
| B | 用 provide 层级「当前是否在 content 渲染中」替代 vnode 标记 |
| C | 2.7 放宽：在 LayerView 子树内任意 `defineLayer` 都生效（可能误伤） |

- **决策**：**A**（并入 **D0.10**）— 与 Vue 3「标在 vnode 上」同构：

```js
// 创建（Vue 2 h data 形态）
h(content.component, {
  key: openId,
  props: { ...contentProps },
  [LAYER_CONTENT]: true, // 落在 data，非 props
})

// 判定
instance.proxy?.$vnode?.data?.[LAYER_CONTENT] === true
// （勿用 _vnode；实现时核对 getCurrentInstance 适配层是否已映射到占位 vnode）
```

否决 provide 栈（B）与放宽子树任意生效（C）。

#### D5.5 `<script setup>` / `defineOptions`

| 选项 | 内容 |
|------|------|
| A | 文档要求 2.7.0+ 与对应编译器；setup 用法与 Vue 3 同文 |
| B | 另附 Options API 示例（`setup()` 返回） |
| C | ADR 0007 静态 define 在 2.7 **明确不做** |

- **决策**：**A + C**（并入 **D0.18**）— 文档面向 2.7+；用法与 Vue 3 指南同文；ADR 0007 静态 define **两端都不做**。

#### D6.1 官方示例容器

| 选项 | 内容 |
|------|------|
| A | Element UI `el-dialog` / `el-drawer` |
| B | 无 UI 库 headless 示例（自写假 Dialog） |
| C | Element UI + 一篇「其它库」差异 |

- **决策**：**延后**（并入 **D0.15**）— 官方可运行 Vue 2.7 / Element UI 示例**暂时不做**；发版以差异说明 + Vue 3 文档为准。日后补 playground 另开。

#### D6.2 与容器 `append-to-body` / `modal` 叠层

库已把 LayerApp 挂 body；Element Dialog 也可能再 append-to-body → 双层 body 节点，一般仍可用，但 z-index、焦点陷阱可能怪。

| 选项 | 内容 |
|------|------|
| A | 文档推荐保留 UI 库 append-to-body；接受双挂 |
| B | 推荐关掉 append-to-body，由库统一挂 body |
| C | 检测并 warn |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 相同：接受 UI 库 append-to-body 双挂；兼容篇可提一句。不强制关掉、不做检测 warn。

#### D6.3 是否承诺兼容 `@vue/composition-api` + Vue &lt; 2.7

| 选项 | 内容 |
|------|------|
| A | **仅 2.7+**（内置 composition） |
| B | 尝试兼容 2.6 + `@vue/composition-api`（工作量大） |

- **决策**：**A**（并入 **D0.18**）— 仅 Vue **2.7+**。

---

### D7. API 表面与功能裁剪

#### D7.1 首期功能范围（可多选「砍」）

对每项标：**做 / 砍 / 延后**

| 能力 | Vue 3 | 2.7（首期） |
|------|-------|-------------|
| `createLayer` / `useLayer` / `open` / `close` | ✓ | **做** |
| `confirm` | ✓ | **做** |
| `clone` | ✓ | **做** |
| `bindHost` / 自动 Host | ✓ | **做** |
| `defineLayer` | ✓ | **做** |
| `LayerTemplate` | ✓ | **做** |
| `adapter` | ✓ | **做** |
| live `MaybeRefOrGetter` 配置 | ✓ | **做** |
| `LayerNoContainer` | ✓ | **做** |
| 打开后换容器 | park | **做**（允许；自然 remount，见 D0.3） |
| SSR | ✓ | **做**（同：无 DOM 不 mount） |

- **决策**：**全做**（并入 **D0.13**）。不因无 Teleport 砍功能面。

#### D7.2 公开 API 是否同名同形

| 选项 | 内容 |
|------|------|
| A | 同名；行为差只写文档（推荐） |
| B | 2.7 专用 API 前缀 / 子路径（如 `vue-layerx/vue2`） |
| C | 运行时 `isVue2` 时对不支持 API throw |

- **决策**：**A**（并入 **D0.13**）— 同名同形；行为差仅文档。日常路径对外几乎无感；文档重点写清换容器与默认 `model`（见 D0.13 表）。

#### D7.3 `keep-alive` Host

| 选项 | 内容 |
|------|------|
| A | 对齐 Vue 3 文档：deactivated 不自动关；卸才 dispose |
| B | 2.7 在 `deactivated` 时强制 close/unmount |
| C | 不测试、不承诺 |

- **决策**：**A**（并入 **D0.18**）— 与 Vue 3 文档相同。

#### D8.1 源码分叉方式

| 选项 | 内容 |
|------|------|
| A | `layer-view.vue3.ts` / `layer-view.vue2.ts` + 构建别名 |
| B | 运行时 `if (isVue2)` 分支（单文件交织） |
| C | 共享 core + 两套 runtime 入口（构建只打进一套） |
| D | **`compat/vue2` + `compat/vue3` 分端实现** + **`compat/index` 聚合用 `isVue2` 选导出** |

- **决策**：**D**（并入 **D0.12**；导入安全 **D0.19**）— 两端代码分开写；统一聚合层做 `isVue2` 判断并导出同名 API。否决单文件交织（B）；构建别名只打一套（A/C）可作为日后优化，非本期形态。同包双 compat 时必须遵守 D0.19，否则 Vue 2.7 消费方会在解析阶段失败。

#### D8.2 `bind-*` 是否抽「平台适配」层

| 选项 | 内容 |
|------|------|
| A | `bindContainerModel` 产出「逻辑事件」，再 `toVNodeProps(platform)` |
| B | 两套 bind 实现文件 |
| C | 仅在 `h()` 前一层转换，bind 仍产出 Vue 3 形态（2.7 入口翻译） |

- **决策**：**C**（并入 **D0.11**；澄清见 **D0.20**）— `bind-*` 仍产出 Vue 3 flat，且不维护两套文件；默认 model / flat 更新键由 compat 注入；仅 `createLayerViewVNode` + `createLayerApp` 在 `h` 前做平台翻译（`toPlatformVNodeData`）。否决两套 bind（B）；不必先改成抽象「逻辑事件」再映射（A 可选优化，非必须）。

#### D8.3 运行时外部依赖

README 写「零外部依赖」。若 2.7 引入 `vue-demi` / `portal-vue`：

| 选项 | 内容 |
|------|------|
| A | 2.7 包允许 peer/dep 额外依赖，README 分区说明 |
| B | 坚持零依赖 → 禁止 demi/portal（与 D0.2 一致） |
| C | 主线仍零依赖；仅 vue2 包可有 dep |

- **决策**：**B**（并入 **D0.12**）— 坚持零运行时外部依赖；`isVue2` 自研探测；禁止 demi/portal。`vue` 仅为 peer。

---

## 与 Vue 3 行为对照（用户可见，已决部分）

| 场景 | Vue 3 | Vue 2.7 |
|------|-------|---------|
| 正常 open / close | Teleport → 容器 default | container 插槽内直接挂 content |
| 打开后换 `container.component` | Teleport park，content 可保留 | **同配置语义**；无 Teleport → 嵌套 diff **自然**整子树 remount（D0.3 / D2.2） |
| `LayerNoContainer` | 同构 Teleport + 全投影 | 扁平 `h(content)` + **全投影**（D0.5 / D2.1-A） |
| Host provide | `appContext` 桥接 | **`extend` + `parent: proxy`**（D0.8 / D0.21） |
| 全局插件 / `$message` | 独立 App + 桥接 | 宿主 `Vue` 构造器上 `extend`（D0.8） |
| 默认 `model` / 更新事件 | `modelValue` + `update:modelValue` | `value` + `input`；其它→`update:${model}`（D0.6 / D0.20） |
| 公开 API | 现行 | **同名全做**；差仅文档（D0.13） |

---

## 风险与缓解

| 风险 | 影响 | 缓解（实现约束） |
|------|------|------------------|
| 同包 dist 静态 named import Vue 3-only API | Vue 2.7 应用解析 / 打包失败 | **D0.19**：交集 named import + vue3 侧 namespace 安全访问；`tests-vue2` 入口冒烟 |
| `DEFAULT_CONTAINER_MODEL` / `value`→`input` 与「bind 不分叉」张力 | 事件绑错或两端行为不一致 | **D0.20**：默认 model 与 flat 更新键由 compat 注入；`toPlatformVNodeData` 不做二次特例 |
| Host / `getCurrentInstance` 字段差异（`isMounted` vs `_isMounted`、proxy vs internal） | provide 断裂、误绑、晚 bind 失效 | **D0.21** + D3.5 适配层；关键路径测无 Host / 晚 bind / Host 卸 dispose |
| 双份 `vue` / 根包双版本抢解析 | inject 丢失或测试串版 | 文档 dedupe；库坚持 `$root.constructor.extend`；测试用 **D0.22** 独立包，否决根包双挂 |
| `LAYER_CONTENT` 读路径（`$vnode.data`）与 2.7 setup 实例映射不符 | `defineLayer` 的 `exists === false` | D0.10；关键路径测钉死读路径；勿用 `_vnode` |
| slots / `h` 形态（scopedSlots vs slots 对象） | 具名插槽、`LayerTemplate` 不渲染 | D0.11 / D2.6：仅在 `createLayerViewVNode` / `createLayerApp` 转换；测具名 + default |
| 打开后换 `container.component` | content state 丢失（相对 Vue 3 park） | 已接受（D0.3）；兼容篇写明；不另加 `containerKey` |
| Element `append-to-body` 双挂 body | z-index / 滚动锁怪异 | 与 Vue 3 相同接受（D6.2）；文档一句即可 |
| `getCurrentInstance` 时序 | 异步回调里 `bindHost` 失败（两端都有，2.7 更易踩 Options API） | 与现行相同：须 setup 同步调用；文档 / warn（D3.5） |
| 同包一份 `.d.ts` 与运行时分叉 | IDE 提示与 2.7 默认 model 等不符 | D0.14 shim；兼容篇写清默认 model / 换容器；不双 types 入口 |
| Vue 2 EOL / 矩阵拖累 | 长期维护成本 | D0.17 best-effort；仅 `tests-vue2` 关键路径，不做全量对等覆盖 |
| 未先完成 ADR 0009 就开本篇 | 集成仍测源码、Vue2 线模型不一致 | **阻塞**：先 0009，再本篇 runtime + `tests-vue2` |

---

## 后果

- 范围已定（Accepted）；按 D0.1–D0.22 在已决降级下 **可实现**；**未实现**前不改 `peerDependencies` / 版本号；实现合并后发 **`1.1.0`**。
- **实现前置**：[ADR 0009](./0009-integration-tests-consume-dist.md) 须先完成；本篇 **不**搬迁 Vue 3 集成到独立包。
- 实现须遵守 D0.1–D0.22：无 Teleport；compat 分端；`h` 前适配；同包 shim 类型；API 全做；与 Vue 3 同类问题行为对齐；导入安全（D0.19）、model/事件键注入（D0.20）、Host 窄接口（D0.21）、`tests-vue2` 独立包只消费 dist（D0.22）。
- 对外文档：一篇 Vue 2 兼容说明（换容器、默认 model、双挂 body、dedupe 等）；官方 2.7 playground **延后**。
- 风险用 §风险与缓解 + D0.17 / D0.22 CI 锁定；不承诺与主线同寿（best-effort）。

---

## 决议录

```text
D1.1 A（D0.7：同包同 API；构建/解析选 runtime；无 vue-demi / 独立包名）
D1.2 A（D0.7：首发预定 1.1.0；changelog 写 2.7 差异）
D1.3 C（D0.14：同包一份 d.ts + MaybeRefOrGetter 等本地 shim）
D1.4 C（D0.17 / D0.22：tests-vue2 关键路径 + 入口冒烟；前置 ADR 0009）
D1.5 D（D0.17：一篇 Vue 2 兼容说明；无 playground）
D1.6 A（D0.17：best-effort / 最大努力，无 SLA）
D2.1 A（D0.5：NoContainer 全投影，与 Vue 3 语义一致）
D2.2 D（与 Vue 3 同语义；无 Teleport → 换 container 自然 remount）
D2.3 D（openId 同 Vue 3：仅 false→true ++；无 containerKey）
D2.4 与 Vue 3 相同（D0.16：无 fallback；假定容器渲染 default）
D2.5 A（D0.18：无额外 wrapper）
D2.6 A（D0.18：对外 VNode 函数；compat 侧转 slots）
D3.1 B（D0.8：HostVue.extend(LayerApp) + new；一次 app）
D3.2 A（D0.8：parent: hostProxy；无 Host 允许挂）
D3.3 C（D0.8：宿主 $root.constructor.extend；不抄 prototype）
D3.4 与 Vue 3 意图相同（D0.18：不专项 DevTools）
D3.5 A（D0.18 / D0.21：适配层对齐 bindHost 语义；窄接口）
D3.6 A（随 D0.8：Host 卸则 dispose；晚 bind 下次 open）
D3.7 A（D0.18：SSR 同 Vue 3）
D3.8 A（D0.18：挂 document.body）
D4.1 C（D0.6 / D0.20：3→modelValue，2.7→value；由 compat 注入）
D4.2 A（D0.6 / D0.20：3 恒 onUpdate:model；2.7 value→onInput，其它→onUpdate:model）
D4.3 A（D0.11：h 前翻译 onXxx→on；首期无 nativeOn；不做 value/input 二次特例）
D4.4 A（D0.18：ref 同 Vue 3）
D4.5 A（D0.18：attrs 同 Vue 3）
D4.6 A（D0.18：异步 content 同 Vue 3）
D5.1 A（D0.9：库内 toValue / MaybeRefOrGetter polyfill）
D5.2 A（D0.18：类型本地处理）
D5.3 A（D0.18：Symbol InjectionKey）
D5.4 A（D0.10：标记 data[LAYER_CONTENT]；读 $vnode.data；不进 props/attrs）
D5.5 A+C（D0.18：文档 2.7+；不做 ADR 0007 静态 define）
D6.1 延后（D0.15：官方 2.7 可运行示例暂不做）
D6.2 A（D0.18：接受 append-to-body 双挂，同 Vue 3）
D6.3 A（D0.18：仅 Vue 2.7+）
D7.1 全做（D0.13）
D7.2 A（D0.13：同名同形；行为差仅文档）
D7.3 A（D0.18：keep-alive 同 Vue 3 文档）
D8.1 D（D0.12：compat/vue2|vue3 分端 + index 聚合 isVue2；导入安全 D0.19）
D8.2 C（D0.11 + D0.20：bind 保持 flat；compat 注入 model/更新键；h 前翻译）
D8.3 B（D0.12：零运行时依赖；自研 isVue2；无 demi/portal）
D0.19 同包 dist：禁止对 Vue3-only API 静态 named import；vue3 侧 namespace/安全访问
D0.20 默认 model + flat 更新键由 compat 注入；bind 仍 flat；toPlatformVNodeData 不做 value/input 二次特例
D0.21 Host 经 compat 窄接口；业务不直触 appContext / 2.7 raw 内部实例
D0.22 tests-vue2 独立 workspace 包；只消费 dist；关键路径 + 冒烟；前置 ADR 0009；否决根包双挂 vue@2
```
