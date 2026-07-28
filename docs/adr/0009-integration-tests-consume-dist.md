# ADR 0009：Vue 3 集成测试迁独立包并只消费 dist

- **状态**：Accepted（已实现；须在 [ADR 0008](./0008-vue-2-7-adaptation.md) Vue 2.7 适配实现 **之前**完成）
- **日期**：2026-07-28
- **关联**：[ADR 0008](./0008-vue-2-7-adaptation.md)（Vue 2.7 适配；本篇为其工程前置）；根包 `vitest.config.ts`；现行 `tests/integration/`；[TESTING.md](../../TESTING.md)

---

## 背景

现行集成测试从源码入口引入库：

```ts
import { createLayer, … } from '@/index'  // vitest alias → src/
```

这验证的是**源码模块图**，不是用户安装后的 **`package.json` → `exports` → `dist`** 发布面。发布物破损（exports 写错、dts 漏导出、打包丢掉公开 API）可能在集成全绿时仍漏到线上。

同时，后续 Vue 2.7 适配（ADR 0008）需要一条 **只消费包** 的测试线；若 Vue 3 集成仍绑 `@/`→`src`，两端模型不一致，且根包自引用 `vue-layerx` 易与 `@` alias 搅在一起。

**本篇范围仅限 Vue 3 集成迁包。** 不在此实现 Vue 2 测试线；Vue 2 harness 见 ADR 0008（**D0.22**），并依赖本篇先落地。

---

## 问题

1. 集成测试如何以**真实消费者**身份测 `vue-layerx`？
2. unit（打内部模块）与 integration（打公开面）如何拆开、避免再 alias 进 `src/`？
3. 与 Vue 2 适配的实现顺序如何定，避免两件事搅在同一 PR / 同一 ADR？
4. 根下现行 `tests/integration/` 迁出后如何处置（删掉 vs 挪到 `src/api/__test__`）？
5. fixture / helper 如何在 unit 与集成之间划分，避免 src / dist 双份库逻辑？

---

## 备选

### 包形态

| | A. 根包内改 `from 'vue-layerx'` + alias 到 `dist` | B. workspace 独立包 `tests-vue3`，`vue-layerx: workspace:*` | C. 维持 `@/index`，仅文档约定「发版前手工验 dist」 |
|--|--------------------------------------------------|----------------------------------------------------------|------------------------------------------------------|
| 消费者真实度 | 中（常要自引用 alias） | **高**（与安装依赖同路径） | 低 |
| 与 `@`→`src` 隔离 | 易串 | **天然隔离** | 无 |
| 为 Vue2 铺路 | 弱 | **强**（同构再加 `tests-vue2`） | 无 |
| 迁移成本 | 中 | 中高（搬用例 + workspace） | 零 |

### 根下 `tests/integration/` 处置

| | D. 迁完后**删除** | E. 挪到 `src/api/__test__/` |
|--|------------------|----------------------------|
| 层级语义 | 公开面仍在独立集成包 | 暗示「api 模块 unit」，与场景测试不符 |
| 是否仍测 src | 否（只留 `tests-vue3`→dist） | 是（`@/`），与本篇目标冲突 |
| 与现行约定 | `api/` 本就无 unit（薄胶水，见 TESTING.md） | 打破约定，且跨 config/runtime 的场景不适合挂在 api 下 |
| 重复维护 | 无 | 易与 `tests-vue3` 双轨 |

**取 D，否决 E。**

---

## 决策

### 1. 取 B：Vue 3 集成迁到独立 workspace 包

目标结构（名称实现可微调，语义固定）：

```text
vue-layerx/                 # 库 + unit（src/**/__test__，继续测源码 / 内部模块）
tests-vue3/                 # Vue 3 集成：只 import 'vue-layerx'
playground/                 # 照旧
# （ADR 0008 实现时再加）tests-vue2/   # Vue 2.7 关键路径 + 入口冒烟
```

- `pnpm-workspace` 纳入 `tests-vue3`。
- `tests-vue3` 的 `dependencies` / `devDependencies`：`vue-layerx: workspace:*`、`vue@^3`、`@vue/test-utils@2`、`vitest` 等。
- 用例从 `import … from '@/index'` 改为 `import … from 'vue-layerx'`。
- **禁止**在集成包内把 `@` / `vue-layerx` alias 到仓库 `src/`。
- Vitest 侧建议 `resolve.dedupe: ['vue']`（或等价），避免 workspace + peer 出现双份 Vue。

### 2. fixture / helper：禁止跨层共享「会 import 库」的代码

| 类别 | 放哪 | 允许 import |
|------|------|-------------|
| 纯工具（如 `flushPromises` / `withoutDom` / DOM 清理） | 根 `tests/helpers/`（或等价），unit 与集成都可用 | 仅 `vue` / test-utils / 环境 API；**不得** import 本库 |
| 依赖库的 fixture / mount helper（现行 `fixtures/components`、`fixtures/layer-config`、`helpers/layer-config-mount` 等） | **只**放 `tests-vue3` | `vue-layerx`（公开面），禁止 `@/`→`src`、禁止 `@/types` 等内部路径 |
| unit 仍需要的薄 fixture（如 `Container` / `makeContent`） | 根侧留给 unit（精简版即可） | 可继续 `@/`（测源码） |

**禁止**：共享一份「改成 `from 'vue-layerx'`」的 fixture 同时给 unit 用——unit 走 src、fixture 走 dist 会加载**两份**库逻辑，provide/inject 与实例身份易串。

### 3. 根包只保留 unit；迁完后删除 `tests/integration/`

- 根 `vitest`：`include` 收敛为 `src/**/__test__/**`（或等价）。
- unit 继续用 `@/` 测 `runtime` / `config` / `shared` 等内部实现——**不**要求走 dist。
- **不**把现行集成用例挪到 `src/api/__test__/`（见上「取 D」）。
- 迁移完成后：**删除**根下 `tests/integration/`（以及仅被集成使用、且已迁走的 fixture/helper）；根 `tests/` 只保留 setup、纯 helpers、unit 用薄 fixture。

### 4. 流水线：unit → build → integration

集成依赖已构建的 `dist`；unit 测源码、不依赖 dist，故先跑 unit 以尽早失败：

```text
pnpm test                          # 根：unit（源码）
pnpm build                         # 产出 dist
pnpm --filter <tests-vue3> test    # 集成（dist）
```

- 调整 `prepublishOnly` / CI（含 `.github/workflows/ci.yml`）：改为 **unit → build → integration**，禁止「未 build 就跑集成」。
- 现行 `prepublishOnly: test && build` 与现行 CI「先 test 后 build」在迁移后必须改掉，否则会测到空/旧 dist，或根本不跑集成。

### 5. Coverage：集成用例可双跑（src alias），不替代 dist 门禁

消费 dist 的集成趟无法可靠覆盖 `src/**`。为维持源码覆盖率口径，允许**另开一趟**同套 `tests-vue3` 用例，仅在 Vitest 里：

- `vue-layerx` → `src/index.ts`
- `@` → `src/`

配置见根目录 `vitest.integration-coverage.config.ts`。合并：

```text
pnpm test:coverage                 # → coverage/unit
pnpm test:coverage:integration     # → coverage/integration（alias，非 dist）
pnpm test:coverage:merge           # → coverage/（istanbul merge）
```

约束：

- **禁止**把 alias 覆盖率跑当成「已测发布面」；dist 门禁仍是 `pnpm build && pnpm test:integration`。
- **禁止**在同一 Vitest 进程里混用 dist 与 src。
- CI **不**设置 100% coverage threshold（本地可用合并报告追缺口）。

### 6. 文档同步调整（本篇实现的一部分）

实现时必须改，避免贡献者仍按旧规则写 `@/index` 集成：

- [TESTING.md](../../TESTING.md)：路径改为 `tests-vue3`；import 规则改为 `vue-layerx`；写明 fixture 划分、「集成前须 build」、coverage 双跑。
- [DESIGN.md](../../DESIGN.md)：测试布局与目录说明同步。
- [README.md](../../README.md)（及贡献说明若有）：「集成消费 dist」与推荐命令（unit → build → integration）。

### 7. 与 ADR 0008 的边界与顺序

| 事项 | 归属 |
|------|------|
| Vue 3 集成迁 `tests-vue3`、只消费 dist | **本篇（0009）** |
| Vue 2.7 runtime 适配、`tests-vue2` 关键路径 | **ADR 0008** |
| 根包 npm alias 双 `vue` / 同配置抢解析 | **不做**；用独立包隔离 |

- **实现顺序**：先完成 0009 并合并；再开 0008 的 compat 与 `tests-vue2`。
- 0008 **不**承担搬迁现行 `tests/integration` 的工作，避免「Vue2 兼容」PR 里夹带大规模测试基建。

### 8. 不做的事（本篇）

- 不引入 `vue-demi`、不为测试再发子包 npm 名。
- 不把 unit 也迁出根包。
- 不在本篇建立 `tests-vue2`（见 0008 D0.22）。
- 不把公开面场景测试塞进 `src/api/__test__/`。
- 不在 CI 上用 coverage 100% threshold 卡关。
- 不引入 `tests-shared` workspace 包：可跨层共享且不含库 import 的代码极少（如 `dom` helpers），单独建包成本高于复制。

---

## 后果

- 集成失败更能代表「用户装包后」的行为；顺带锁住 `exports` / 公开 `.d.ts`。
- 根包测试更快、职责更清晰（只 unit）；源码覆盖率由 unit + 集成 alias 趟合并得到，与 dist 门禁解耦。
- 依赖库的 fixture 在 unit / 集成各有一份（或 unit 更薄），接受少量重复，换隔离正确性。
- 迁移有一次性成本：搬用例、拆 fixture、改 import、改 CI / scripts、workspace 与 TESTING/DESIGN/README。
- **阻塞** ADR 0008 的实现开工条件之一：本篇落地后，Vue 2 线可同构增加 `tests-vue2`（`vue@2.7` + `@vue/test-utils@1` + `vue-layerx: workspace:*`），无需再讨论「集成测源码还是测包」。

---

## 验收清单（实现时）

- [x] `tests-vue3` 在 workspace 内可独立 `vitest run`
- [x] 全部集成用例 `from 'vue-layerx'`，无 `@/index` / 无指向 `src` 的库 alias（**dist 门禁配置**）
- [x] 依赖库的 fixture/helper 仅在 `tests-vue3`；根侧无「共享且 import 库」的 fixture 被 unit 与集成共用
- [x] 根下 `tests/integration/` 已删除（未迁入 `src/api/__test__`）
- [x] 流水线为 **unit → build → integration**（CI、`prepublishOnly`、本地文档命令一致）
- [x] coverage：unit + 集成 alias 趟可合并；CI 无 100% threshold
- [x] 根 `pnpm test` 仅 unit 且仍绿
- [x] `pnpm --filter <tests-vue3> test` 在 build 后全绿
- [x] `TESTING.md` / `DESIGN.md` / `README.md` 已按上列决策改完
