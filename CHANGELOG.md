# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`LayerTemplate` prop rebind** — `to` / `name` / `container` 变化时 dispose 旧注册并按新键重新 `template()`（与挂卸载语义一致）。

### Fixed

- **Mid-open content swap** — `open({ component })` while visible no longer keeps the previous content's `define` / `define:template` slots (e.g. leftover footer).
- **Caller `LayerTemplate` unmount** — unregister `use:template` on dispose so creator slots are no longer masked after `v-if` teardown.
- **Close while parked** — clearing content parking when `visible` becomes false so Teleport does not leave content under `layer-content-parking`.

## [1.0.0-beta.5] - 2026-07-22

### Fixed

- **`LayerTemplate` + `defineLayer` container slots** — 关闭后再打开时 footer 等 creator slot 丢失。再次打开时 `define` 重置为 `computed(() => ({}))`（避免替换 readonly computed 告警），`define:template` 重置为新的 plain `{}` 供 `LayerTemplate` 重新注册。

### Changed

- **`LayerInstance.visible` / `content` / `container`** — 只读 getter（非 `ComputedRef`）；`contentRef` / `containerRef` 更名为 `content` / `container`。直接 `dialog.visible`，观测用 `watch(() => dialog.visible)`。见 [ADR 0006](./docs/adr/0006-instance-state-as-getters.md)

### Notes

- Install beta: `pnpm add vue-layerx@beta` or `vue-layerx@1.0.0-beta.5`
- Breaking vs **1.0.0-beta.4**: `visible` / `content` / `container` 不再是 `ComputedRef`（去掉 `.value`）；`contentRef` / `containerRef` 改名

## [1.0.0-beta.4] - 2026-07-21

### Changed

- **`LayerInstance.visible`** — now `ComputedRef<boolean>` (was plain boolean getter); use `dialog.visible.value`
- **Public type exports slimmed** — package no longer exports pipeline types (`LayerBound` / `LayerBoundNode`, canonical `CloseOn*` / node types, `CloseOnEntryRaw` / `CloseOnPolicyObjectRaw`, etc.). Keep: config flats, `LayerConfigFragment` / `LayerAdapter`, instance/define, `CloseOnRaw`, confirm types

### Notes

- Install beta: `pnpm add vue-layerx@beta` or `vue-layerx@1.0.0-beta.4`
- Breaking vs **1.0.0-beta.3**: `visible` access requires `.value`; removed non-user-facing type exports

## [1.0.0-beta.3] - 2026-07-21

### Fixed

- Container slot unmount / remount: keep content mounted when the container slot tears down; render content again when the slot is not mounted

### Changed

- Docs site redesign and guide improvements
- Publish workflow cleanup (Trusted Publisher path; drop unused Playwright / custom actions)

### Notes

- Install beta: `pnpm add vue-layerx@beta` or `vue-layerx@1.0.0-beta.3`

## [1.0.0-beta.2] - 2026-07-20

### Added

- **`LayerInstance.confirm(config?)`** — returns `Promise<LayerConfirmResult>`; settles on close via `closeOn.confirmed` / `close({ confirmed })` / container / unmount. Rejects with **`LayerConfirmError`** (`code: 'close' | 'busy'`, optional `result`). Mutual exclusion: confirming blocks public `open` (warn); busy if already open/confirming.
- **`LayerInstance.close(options?)`** — optional `{ confirmed?, args? }` while confirming (defaults `source: 'instance'`).
- Types: `LayerConfirmResult`, `LayerConfirmSource`, `LayerCloseOptions`; export `LayerConfirmError`.

### Changed

- **`closeOn.confirmed`** — bind now reads it (no longer reserved); array sugar still defaults `confirmed: false` (reject path for `confirm()`).
- Close path: bind → `emit('update:visible', false, payload)` → layer-app forwards instance internal `close` (single place for `visible=false` + confirm settle).
- **`closeOn`** — Canonical is `Record<event, { when, confirmed }>`; Raw supports array / Record sugar (`true` / `false` / `when`); cross-tier **per-event patch** (not whole-table replace); `when: 'none'` / `false` removes that event; `when` functions close only when `=== true`
- **Config domain types (Raw / Canonical / Bound)** — split into `types/config-raw.ts`, `types/config.ts`, `types/bound.ts`; see [docs/config-naming.md](./docs/config-naming.md)
- **`CloseOnConfig` → `CloseOnRaw` / `CloseOn`**; **`LayerNormalized` / `LayerNodeNormalized` → `LayerBound` / `LayerBoundNode`**
- **`LayerPropsRaw`** accepts `props.ref` as `Ref` or callback; Canonical `LayerProps.ref` is callback-only after `toFragment*` / `normalizeNode*`
- **`normalizeNode*`** copies Raw → Canonical (no in-place mutation of user config)
- **`LayerDefine.exists`** — replaces `inLayer` / `outsideLayer`; content asks whether the define's layer context exists (`true` = direct layer content)
- **`LayerTemplate` `#default`** — creator path now flat-forwards target slot scoped props (same as caller); removed `LayerTemplateScope` (`inLayer` / `outsideLayer` / `slotProps` wrapper); host branching uses `layer.exists`

### Notes

- Install beta: `pnpm add vue-layerx@beta` or `vue-layerx@1.0.0-beta.2`
- Breaking vs **1.0.0-beta.1**: `inLayer` / `outsideLayer` / `LayerTemplateScope` removed (`exists`); config type renames (`CloseOnRaw` / Bound); `closeOn` merge semantics

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
- **`defineLayer()`** — returns `LayerDefine` (`exists`); registers only inside layer content
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

[Unreleased]: https://github.com/xuyimingwork/vue-layerx/compare/v1.0.0-beta.5...HEAD
[1.0.0-beta.5]: https://github.com/xuyimingwork/vue-layerx/compare/v1.0.0-beta.4...v1.0.0-beta.5
[1.0.0-beta.4]: https://github.com/xuyimingwork/vue-layerx/compare/v1.0.0-beta.3...v1.0.0-beta.4
[1.0.0-beta.3]: https://github.com/xuyimingwork/vue-layerx/compare/v1.0.0-beta.2...v1.0.0-beta.3
[1.0.0-beta.2]: https://github.com/xuyimingwork/vue-layerx/compare/v1.0.0-beta.1...v1.0.0-beta.2
[1.0.0-beta.1]: https://github.com/xuyimingwork/vue-layerx/compare/v0.1.0...v1.0.0-beta.1
[0.1.0]: https://github.com/xuyimingwork/vue-layerx/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/xuyimingwork/vue-layerx/releases/tag/v0.0.1
