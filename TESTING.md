# Testing Guide

## Structure

Tests follow a two-tier layout:

| Tier | Location | Purpose |
|------|----------|---------|
| Unit | `src/**/__test__/*.test.ts` | Test internal modules in isolation, co-located with source |
| Integration | `tests/integration/*.test.ts` | Test public API from the **user's perspective** |

Shared infrastructure lives under `tests/`:

```
tests/
  setup.ts              # global afterEach (DOM cleanup)
  helpers/dom.ts        # withoutDom, clearBody, flushPromises
  fixtures/components.ts # Container, makeContent, query helpers
  integration/          # public API scenario tests (user-facing grouping)
```

## Import Rules

| Tier | Allowed imports |
|------|-----------------|
| `tests/integration/` | `@/index` (values + types), `@tests/*`, `vue`, `@vue/test-utils` |
| `src/**/__test__/` | The module under test, its internal dependencies, `@tests/*`, `vue`, `@vue/test-utils` |

Integration tests must not import from `@/runtime/*`, `@/config/*`, `@/types`, etc. If a scenario needs an internal API, it belongs in unit tests.

## Integration Tests — User Perspective

Integration files map to **public API exports**. Use nested `describe` blocks for usage perspectives within an API.

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
| `layer-config.test.ts` | config merge | `PROPS_MERGE_CASES` + `CLONE_PROPS_CASES`；`CONTAINER/CONTENT_SLOT_MERGE_CASES`（缺 1 / 缺 open+1） |
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
- Unit: match the exported function or module name, e.g. `bindCloseOn`, `mergeNodeConfig`
- Use nested `describe` for sub-scenarios within a file

### it blocks

Use **should … when …** format:

```ts
it('should close layer when use-tier closeOn event is emitted', () => { ... })
it('should render with outsideLayer scope when visibleOutside is true', () => { ... })
```

## Running Tests

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # with coverage report
```

## Adding New Tests

1. Decide user perspective (caller vs content author) for integration; use module boundary for unit.
2. Reuse fixtures from `@tests/fixtures/components` instead of inline mock components.
3. Use `@tests/helpers/dom` for DOM cleanup, SSR stubs, and async flushing.
4. Name new cases with the **should … when …** pattern.
5. Group related cases with nested `describe` blocks rather than long flat lists.
