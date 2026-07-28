# ADR 0009：Vue 3 集成测试迁独立包并只消费 dist

- **状态**：Accepted（**待实现**；须在 [ADR 0008](./0008-vue-2-7-adaptation.md) Vue 2.7 适配实现 **之前**完成）
- **日期**：2026-07-28
- **关联**：[ADR 0008](./0008-vue-2-7-adaptation.md)（Vue 2.7 适配；本篇为其工程前置）；根包 `vitest.config.ts`；现行 `tests/integration/`

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

---

## 备选

| | A. 根包内改 `from 'vue-layerx'` + alias 到 `dist` | B. workspace 独立包 `tests-vue3`，`vue-layerx: workspace:*` | C. 维持 `@/index`，仅文档约定「发版前手工验 dist」 |
|--|--------------------------------------------------|----------------------------------------------------------|------------------------------------------------------|
| 消费者真实度 | 中（常要自引用 alias） | **高**（与安装依赖同路径） | 低 |
| 与 `@`→`src` 隔离 | 易串 | **天然隔离** | 无 |
| 为 Vue2 铺路 | 弱 | **强**（同构再加 `tests-vue2`） | 无 |
| 迁移成本 | 中 | 中高（搬用例 + workspace） | 零 |

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
- fixture / helpers 可迁入 `tests-vue3`（或共享目录，但共享代码也不得再 import 库源码）。

### 2. 根包只保留 unit

- 根 `vitest`：`include` 收敛为 `src/**/__test__/**`（或等价）；去掉对 `tests/integration` 的收录（迁移完成后删除或清空根下旧集成目录）。
- unit 继续用 `@/` 测 `runtime` / `config` / `shared` 等内部实现——**不**要求走 dist。

### 3. 流水线：先 build，再跑集成

集成依赖已构建的 `dist`：

```text
pnpm build
pnpm test                          # 根：unit（源码）
pnpm --filter <tests-vue3> test    # 集成（dist）
```

- 调整 `prepublishOnly` / CI：改为 **build → unit → integration**（或等价），禁止「未 build 就跑集成」。
- 现行 `prepublishOnly: test && build` 在迁移后必须改掉，否则会测到空/旧 dist。

### 4. 与 ADR 0008 的边界与顺序

| 事项 | 归属 |
|------|------|
| Vue 3 集成迁 `tests-vue3`、只消费 dist | **本篇（0009）** |
| Vue 2.7 runtime 适配、`tests-vue2` 关键路径 | **ADR 0008** |
| 根包 npm alias 双 `vue` / 同配置抢解析 | **不做**；用独立包隔离 |

- **实现顺序**：先完成 0009 并合并；再开 0008 的 compat 与 `tests-vue2`。
- 0008 **不**承担搬迁现行 `tests/integration` 的工作，避免「Vue2 兼容」PR 里夹带大规模测试基建。

### 5. 不做的事（本篇）

- 不引入 `vue-demi`、不为测试再发子包 npm 名。
- 不把 unit 也迁出根包。
- 不在本篇建立 `tests-vue2`（见 0008 D0.22）。

---

## 后果

- 集成失败更能代表「用户装包后」的行为；顺带锁住 `exports` / 公开 `.d.ts`。
- 根包测试更快、职责更清晰（只 unit）。
- 迁移有一次性成本：搬用例、改 import、改 CI / scripts、workspace 配置。
- **阻塞** ADR 0008 的实现开工条件之一：本篇落地后，Vue 2 线可同构增加 `tests-vue2`（`vue@2.7` + `@vue/test-utils@1` + `vue-layerx: workspace:*`），无需再讨论「集成测源码还是测包」。

---

## 验收清单（实现时）

- [ ] `tests-vue3` 在 workspace 内可独立 `vitest run`
- [ ] 全部集成用例 `from 'vue-layerx'`，无 `@/index` / 无指向 `src` 的库 alias
- [ ] CI / 本地脚本保证集成前已 `build`
- [ ] 根 `pnpm test` 仅 unit 且仍绿
- [ ] `pnpm --filter <tests-vue3> test` 在 build 后全绿
- [ ] README / 贡献说明中写明「集成消费 dist」与命令
