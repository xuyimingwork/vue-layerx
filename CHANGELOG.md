# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-beta.1] - 2026-07-15

First **1.0 beta**. Public API is **locked** for the 1.0 line; remaining beta → stable work is soak / docs / bugfix. Breaking changes after this tag require a new major.

### Added

- **`LayerNoContainer`** — public marker container; `createLayerViewVNode` flattens to `h(content)` with content props overriding container props (monolith / shared `useLayer` via adapter; see ADR 0001)
- **Reactive config sources** (`MaybeRefOrGetter`) on `createLayer`, `defineLayer`, `useLayer`, and `clone` — getters / refs / computed stay live; plain objects remain snapshots
- **SSR compatibility** — safe to import and initialize in SSR apps; layer portals mount on the client (`open()` / `bindHost()` should run after mount or on user interaction)
- **Visible container swap** — while open, changing `container.component` (via `use` / `open` / adapter) keeps content instance state (see ADR 0002)

### Changed

- **Config type rename** — node: `LayerConfigNodeContainer` / `LayerConfigNodeContent`; public flat: `LayerConfigContainer` (was `LayerConfigStatic`) / `LayerConfigContent` (was `LayerConfigInstance`); store create tier: `LayerConfigFragmentCreate` (was `LayerCreateBucket`); helpers `toFragmentFromContainer` / `toFragmentFromContent`
- **`adapter` lives on instance store `create` bucket** (`LayerConfigFragmentCreate`); LayerView reads it after merge (no longer passed via `createLayerApp` / `LayerView` props)
- **`LayerView`**: setup-time `computed` pipeline `merged → adapted → bound`; render only calls `createLayerViewVNode`
- **`store.create` / `store.use` are `ComputedRef`** (read-only user/factory config); assignments remain on `open` / `use:template` / `refs` only
- **`open(config?)` stays plain snapshot** (not MaybeRefOrGetter); empty `open()` uses live `use` / lower tiers
- **`clone`**: parent `use` stays live-folded; clone config may be a live source; still strips parent `use` `props.ref`

### Notes

- **API freeze** — treat exported APIs / types as 1.0-stable; unknown config keys remain non-contract (ADR 0004: whitelist only; extension channel TBD)
- Install beta: `pnpm add vue-layerx@beta` or `vue-layerx@1.0.0-beta.1`
- Breaking vs **0.1.0**: type renames above; prefer migrating types before locking dependents on beta

## [0.1.0] - 2026-06-27

First usable public release. **Not API-frozen** — pre-1.0; minor 0.x releases may still include breaking changes.

### Added

- **`LayerInstance.open` / `close` / `visible`** — lifecycle API (replaces 0.0.1 `show` / `hide`)
- **`LayerInstance.contentRef` / `containerRef`** — `computed`; non-null only while `visible=true`; imperative access to content / container component instances
- **`LayerInstance.bindHost()`** — bind portal inject context to current setup host (`useLayer` auto-calls in setup; module singletons call manually under App / ConfigProvider)
- **`LayerInstance.clone(config?)`** — independent instance; folds parent `use` + config; does not inherit parent `use` `props.ref`
- **`LayerTemplate`** — `:to` required (`LayerDefine` or `LayerInstance`); `container` prop for remote container slots; `visible-outside` for page-local rendering
- **`defineLayer()`** — returns `LayerDefine` (`inLayer` / `outsideLayer`); registers only inside layer content
- **`createLayer(Container, { adapter?, ... })`** — factory defaults + optional `LayerAdapter`
- **`closeOn`** on content — bind merges user `onXxx` then `close()`
- **`model`** on container — default `modelValue`; `bindContainerModel` merges user `onUpdate:${model}` then closes layer when false
- **`props.ref`** — chained across merge tiers (except clone parent `use` strip); string ref unsupported
- VitePress docs, playground, integration tests

### Changed (breaking vs 0.0.1)

- Remove **`LayerBind`** — use `LayerTemplate :to="instance"`
- Remove **`LayerMerged`** — `LayerAdapter` is `(fragment: LayerConfigFragment) => LayerConfigFragment`
- **`show` / `hide`** → **`open` / `close`**
- **`hideOn`** → **`closeOn`** (on content node)
- Config field **`layer`** → **`container`**
- **`createLayer`**: container props at top-level `props`; `adapter` in second-arg object (no third argument)
- **`LayerTemplate`**: no implicit creator path; `:to` required
- Merge pipeline: `merge → adapter → mergeFragment(refs, adapted) → bind → render`
- **`open()`** while visible updates props only; **close then open** remounts content
- **`clone()`** folds into child **`use`** tier (no separate clone store bucket)

### Fixed

- **`bindContainerModel`**: user-provided `onUpdate:${model}` is invoked before layer `close()` (same pattern as `closeOn`)

### Notes

- **SSR is not supported** (added in 1.0.0-beta.1)
- **0.0.1 was a placeholder** on npm; treat this as the first installable version
- Migration: replace `show`/`hide` with `open`/`close`; replace `LayerBind` with `LayerTemplate :to`; move `adapter` into `createLayer` config object

## [0.0.1] - 2026-06-17

### Added

- Initial npm placeholder release
- Early `createLayer` / `defineLayer` / `LayerTemplate` / `LayerBind` API (superseded by 0.1.0)

### Notes

- Placeholder only; use **0.1.0+** for real usage

[Unreleased]: https://github.com/xuyimingwork/vue-layerx/compare/v1.0.0-beta.1...HEAD
[1.0.0-beta.1]: https://github.com/xuyimingwork/vue-layerx/compare/v0.1.0...v1.0.0-beta.1
[0.1.0]: https://github.com/xuyimingwork/vue-layerx/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/xuyimingwork/vue-layerx/releases/tag/v0.0.1
