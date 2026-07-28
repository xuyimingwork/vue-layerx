# Testing Guide

## Structure

Tests follow a two-tier layout:

| Tier | Location | Purpose |
|------|----------|---------|
| Unit | `src/**/__test__/*.test.ts` | Test internal modules in isolation, co-located with source |
| Integration | `tests-vue3/integration/*.test.ts` | Test public API as an installed consumer of **`dist`** |

Root `tests/` holds unit-only helpers:

```
tests/
  setup.ts                 # global afterEach (DOM cleanup)
  helpers/dom.ts           # withoutDom, clearBody, flushPromises (no library imports)
  fixtures/components.ts   # thin unit fixtures (may import @/ source)

tests-vue3/                # workspace package; depends on vue-layerx: workspace:*
  setup.ts
  helpers/                 # dom + mount helpers (import vue-layerx)
  fixtures/                # integration fixtures (import vue-layerx)
  integration/             # public API scenario tests
```

Do **not** share fixtures/helpers that import the library between unit and integration (src vs dist would load two copies). Pure DOM helpers may be duplicated or kept under root `tests/helpers/` only for unit; `tests-vue3` has its own copy.

## Import Rules

| Tier | Allowed imports |
|------|-----------------|
| `tests-vue3/` | `vue-layerx` (values + types), local `../helpers` / `../fixtures`, `vue`, `@vue/test-utils` |
| `src/**/__test__/` | The module under test, its internal dependencies, `@tests/*`, `vue`, `@vue/test-utils` |

Integration tests must not alias `vue-layerx` / `@` to repository `src/` in the **dist gate** (`tests-vue3/vitest.config.ts`). The separate coverage config (`vitest.integration-coverage.config.ts`) may alias for src attribution only. If a scenario needs an internal API, it belongs in unit tests.

## Integration Tests — User Perspective

Integration files map to **public API exports**. Use nested `describe` blocks for usage perspectives within an API.

Run integration only after a fresh build:

```bash
pnpm test                 # unit (source)
pnpm build
pnpm test:integration     # tests-vue3 → dist
```

### Content author

| File | API | describe 划分 |
|------|-----|--------------|
| `define-layer.test.ts` | `defineLayer` | `definition` / `in layer context` / `when config does not register` / `misuse` |
| `layer-template.test.ts` | `LayerTemplate` | `to defineLayer` / `to LayerInstance` / `mixed usage` / `edge cases` |

### Caller (LayerInstance)

| File | API | describe 划分 |
|------|-----|--------------|
| `create-layer.test.ts` | `createLayer` | `factory` / `create tier defaults` / `adapter` |
| `use-layer.test.ts` | `useLayer` / `LayerInstance` | `open and close` / `closeOn` / `instance refs` |
| `layer-config.test.ts` | config merge（props / model / slots / component / ref / clone defaults） | `partial merge` / `config shape` / `container model` / … |
| `layer-config.priority.test.ts` | config merge 优先级矩阵 | `PROPS_MERGE_CASES` / `CLONE_PROPS_CASES` / slot merge cases |
| `layer-config.close-on.test.ts` | `closeOn` 用法与行为 | `declaration sites` / `array sugar` / `record sugar` / `when` / `confirmed` / `cross-tier patch` / `with props.onXxx` / `invalid closeOn` |
| `use-layer.host.test.ts` | `LayerInstance.bindHost` | `provide and inject` / `bindHost` |
| `use-layer.clone.test.ts` | `LayerInstance.clone` | `parallel instances` / `independent defaults` / `cleanup` / `bindHost` / `instance refs` |

### Environment

| File | API | describe 划分 |
|------|-----|--------------|
| `ssr.test.ts` | SSR 约束 | 平铺场景 |

### Decision guide — where to add a new integration case

```
Which public API are you testing?
│
├─ createLayer 工厂 / create tier 默认值     → create-layer.test.ts
├─ useLayer / open / close / remount / refs  → use-layer.test.ts
├─ config merge（open > use > define > create；use > use:template；define > define:template） → layer-config.test.ts
├─ config merge 优先级矩阵                     → layer-config.priority.test.ts
├─ closeOn 写法 / 关层与 confirm 结算行为      → layer-config.close-on.test.ts
├─ bindHost / inject 继承（普通 instance）   → use-layer.host.test.ts
├─ clone() 实例隔离 / 并行 / cleanup / bindHost / refs  → use-layer.clone.test.ts
├─ defineLayer                               → define-layer.test.ts
├─ LayerTemplate
│   ├─ :to="layer"（defineLayer 返回值）
│   │   ├─ in layer context              → layer-template.test.ts › to defineLayer › in layer context
│   │   └─ outside layer context         → … › outside layer context（visible-outside 仅在此生效）
│   ├─ :to="dialog"（LayerInstance）
│   │   ├─ into content slot             → layer-template.test.ts › to LayerInstance › into content slot
│   │   └─ into container slot           → … › into container slot（可覆盖 to defineLayer template）
│   ├─ 混合场景（跨 to 类型 / 多挂载点）  → layer-template.test.ts › mixed usage
│   └─ 边界情况                          → layer-template.test.ts › edge cases
└─ SSR                                       → ssr.test.ts
```

## Unit Tests — Module Perspective

Unit tests stay co-located with source. Group by exported function or module name.

| Scenario | Tier |
|----------|------|
| Config merge priority, fragment transforms | Unit (`config/`) |
| `createLayerInstance` SSR guards | Unit (`runtime/layer-instance`) |
| View mount/unmount, SSR guard in `createLayerApp` | Unit (`runtime/layer-app`) |
| `bindCloseOn`, `bindLayerTree`, container model | Unit (`config/`) |

`mount` is not the divider — unit tests may use `mount` when the module under test renders to DOM (e.g. `layer-app`).

The `api/` layer has no unit tests — it is thin glue; behavior is covered by integration (user view) and unit tests in `config/` / `runtime/` / `shared/` (maintainer view).

## Naming Conventions

### describe blocks

- Integration: one file per public API; top-level `describe` matches the export name, nested `describe` for usage perspectives (e.g. `LayerTemplate` › `to defineLayer` › `outside layer context`)
- Unit: match the exported function or module name, e.g. `bindCloseOn`, `mergeNode`
- Use nested `describe` for sub-scenarios within a file

### it blocks

Use **should … when …** format:

```ts
it('should close layer when use-tier closeOn event is emitted', () => { ... })
it('should pass empty flat slot props when Content is mounted on page with visible-outside', () => { ... })
```

## Running Tests

```bash
pnpm test                      # unit only（源码）
pnpm test:watch
pnpm build && pnpm test:integration   # 集成门禁：只消费 dist

# Coverage（与 dist 门禁分离）
pnpm test:coverage             # unit → coverage/unit
pnpm test:coverage:integration # 同套集成用例 + alias vue-layerx→src → coverage/integration
pnpm test:coverage:merge       # 合并 → coverage/
pnpm test:coverage:all         # 上面三步
```

Coverage 的集成趟**不是**包消费验证：仅把 `vue-layerx` alias 到 `src/` 以便 V8 记到源码。CI **不**用 100% threshold 卡关；本地可用合并报告看缺口。
## Adding New Tests

1. Decide user perspective (caller vs content author) for integration; use module boundary for unit.
2. Integration: reuse fixtures from `tests-vue3/fixtures`; unit: reuse `@tests/fixtures/components`.
3. Use the local `helpers/dom` for DOM cleanup, SSR stubs, and async flushing.
4. Name new cases with the **should … when …** pattern.
5. Group related cases with nested `describe` blocks rather than long flat lists.
