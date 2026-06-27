# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`LayerInstance.bindHost()`**：将 detached portal 绑定到当前 setup 的 Host，使 content 能 inherit `provide` / `appContext`（`useLayer` 在 setup 内自动调用；模块单例在 App setup 手动调用）
- LayerView provides 桥接：从 live `viewHost` 读取 `provides` 与 `appContext`
- `LayerTemplate` **`container`** prop: with `:to`, register into container slot chain (remote MyDialog slots)

### Changed

- **Breaking:** `LayerTemplate` `:to` is required. Creator passes `defineLayer()` return value (`LayerDefine` with `inLayer` / `outsideLayer`); caller passes `LayerInstance`. Creator templates always register to `define:template.container`. Remove implicit creator path (`isInDirectLayerContent` / `CONTAINER_TEMPLATE_REGISTRY_KEY`).
- **Breaking:** `defineLayer()` always returns `LayerDefine` (registers config only when `inLayer`); store attached via internal `LAYER_STORE` when in layer context.
- **Breaking (internal):** Layer config store refactor: `layer-store.ts` with `createLayerStore` / `createLayerInstanceStore` / `createLayerViewStore`; `template({ key, name, entry })` replaces `registerContainerTemplate` / `registerContentTemplate`; `adapter` passed to `createLayerView` (not on store); merge via single `mergeFragment` in LayerView (remove `mergeLayerConfigStore`).
- **Breaking (internal):** Unified merge priority: `open > use > use:template > define > define:template > create` (container/content same chain). `clone()` folds config into `use` at clone time (no `clone` store bucket).
- **Breaking:** `open()` while already visible updates merge/props only; content remounts on **close then open** (not on every `open()`).
- **Breaking (internal):** Merge `buildLayerView` + `createLayerRuntime` into `createLayerView({ store, state, host })`; remove `layer-runtime.ts` and `instance-registry.ts` (replaced by `LAYER_STORE` symbol on instance).
- **Breaking (internal):** Rename `LayerConfigStore` / `createLayerConfigStore` → `LayerInstanceStore` / `createLayerInstanceStore` (`layer-instance-store.ts`).
- **Breaking:** Instance lifecycle API: `show` / `hide` → `open` / `close`; readonly state getter `visible`.
- **Breaking:** Container visibility: `visible: [prop, event]` tuple removed; use `model?: string` on container config (default `modelValue`, event `onUpdate:${model}`). Render via `bindContainerModel`.
- **Breaking:** `hideOn` renamed to `closeOn`; lives on **content** node. `defineLayer` uses `content: { closeOn: [...] }`; `useX` / `open` keep top-level `closeOn`.
- **Breaking:** Merge tier `show` renamed to `open` in `LayerConfigStore`.
- **Breaking (internal):** Rename `LayerState` → `LayerConfigStore`, `mergeLayerState` → `mergeLayerConfigStore`, `createLayerState` → `createLayerConfigStore`; instance registry helpers `attachInternal` / `getInternal` → `attachConfigStore` / `getConfigStore`.
- **Breaking:** Unify public config types: `LayerConfigStatic` (`createLayer` + `defineLayer`, top-level = container) and `LayerConfigInstance` (`useX` / `open` / `clone`, top-level = content). Remove legacy payload type names.
- **Breaking:** `createLayer` second argument: container props at top-level (`props`) instead of `container: { props }`.
- **Breaking:** `createLayer` third `adapter` argument removed; use `createLayer(Container, { adapter })`. `adapter` stored on `store.adapter` (not merged).
- **Breaking (internal):** Remove `UseLayerContext`; config flows through `LayerConfigStore`. Container component written to `store.create.container.component`; content component written to `store.use` via `mergeFragment`.
- **Breaking:** Merge tier rename: `partial` → `clone` in priority chains.
- **Breaking:** LayerTemplate slot delivery now merges through **slot tiers** in `mergeLayerConfigStore`. Resolve no longer overlays templates after merge.
- **Breaking:** Container slot priority: `open > clone > use > caller LayerTemplate (:to container) > define > creator LayerTemplate > create`
- **Breaking:** Content slot priority: `open > clone > use > caller LayerTemplate (:to) > define > create`
- **Breaking:** Remove `LayerBind`; use `LayerTemplate :to="instance"` to fill content slots from the caller side
- **Breaking:** Rename config field `layer` → `container` on instance config, `LayerNormalized`, and `LayerMerged`
- **Breaking:** Rename `layerTemplates` / `registerLayerTemplate` → `containerTemplates` / `registerContainerTemplate`; injection key `CONTAINER_TEMPLATE_REGISTRY_KEY`

## [0.0.1] - 2026-06-17

### Added

- Initial public release
- `createLayer` / `defineLayer` factory API
- `LayerTemplate` / `LayerBind` components for declarative slot delivery
- `show` / `hide` / `clone` instance API
- `adapt` hook for container switching (e.g. Dialog → Drawer)
- VitePress documentation and playground demos

### Notes

- Early release: API may change in subsequent 0.x versions
- SSR is not supported

[0.0.1]: https://github.com/xuyimingwork/vue-layerx/releases/tag/v0.0.1
