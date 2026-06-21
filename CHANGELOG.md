# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `LayerTemplate` **`container`** prop: with `:to`, register into container slot chain (remote MyDialog slots)

### Changed

- **Breaking:** Unify public config types: `LayerStaticConfig` (`createLayer` + `defineLayer`, top-level = container) and `LayerInstanceConfig` (`useX` / `show` / `clone`, top-level = content). Remove `LayerDefaults`, `DefineLayerOptions`, `LayerUsePayload`, `LayerUseOptions`, `LayerShowPayload`.
- **Breaking:** `createLayer` second argument: container props move to top-level (`props`) instead of `container: { props }`.
- **Breaking:** Internal merge input consolidated into per-instance `LayerState` (`create` / `define` / `use` / `clone` / `show` / `templates` tiers); `mergeConfig` renamed to `mergeLayerState`.
- **Breaking:** Merge tier rename: `partial` → `clone` in priority chains.
- **Breaking:** LayerTemplate slot delivery now merges through **slot tiers** in `mergeLayerState` (same priority model as imperative `slots`). Resolve no longer overlays templates after merge.
- **Breaking:** Container slot priority: `show > clone > use > caller LayerTemplate (:to container) > define > creator LayerTemplate > create`
- **Breaking:** Content slot priority: `show > clone > use > caller LayerTemplate (:to) > create`
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
