# Testing Guide

## Structure

Tests follow a two-tier layout:

| Tier | Location | Purpose |
|------|----------|---------|
| Unit | `src/**/__test__/*.test.ts` | Pure logic, co-located with source |
| Integration | `tests/integration/*.test.ts` | End-to-end API behavior via `mount` |

Shared infrastructure lives under `tests/`:

```
tests/
  setup.ts              # global afterEach (DOM cleanup)
  helpers/dom.ts        # withoutDom, clearBody, flushPromises
  fixtures/components.ts # Container, makeContent, query helpers
  integration/          # createLayer domain tests
```

## Naming Conventions

### File names

- Unit: `<module>.test.ts` inside `__test__/` next to the module
- Integration: `<domain>.test.ts` grouped by capability (lifecycle, clone, refs, …)

### describe blocks

- Unit: match the exported function or module name, e.g. `bindCloseOn`, `mergeProps`
- Integration: `createLayer / <domain>`, e.g. `createLayer / lifecycle`

### it blocks

Use **should … when …** format:

```ts
it('should close layer when use-tier closeOn event is emitted', () => { ... })
it('should return false when value is null or undefined', () => { ... })
```

## What Goes Where

| Scenario | Tier |
|----------|------|
| Config merge priority, fragment transforms | Unit (`config/`, `runtime/store-merge`) |
| View mount/unmount, SSR guard in `createLayerView` | Unit (`runtime/layer-view`) |
| `createLayer` open/close/clone/inject end-to-end | Integration |
| `createLayer` + `createLayerInstance` SSR hydration path | Integration (`ssr.test.ts`) |

## Running Tests

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # with coverage report
```

## Adding New Tests

1. Prefer unit tests for isolated logic; add integration only when multiple layers interact.
2. Reuse fixtures from `@tests/fixtures/components` instead of inline mock components.
3. Use `@tests/helpers/dom` for DOM cleanup, SSR stubs, and async flushing.
4. Name new cases with the **should … when …** pattern.
