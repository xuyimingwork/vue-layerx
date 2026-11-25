import type { ComputedRef, UnwrapNestedRefs } from 'vue'
import type {
  LayerConfigFragment,
  LayerConfigFragmentCreate,
  LayerSlotRender,
} from './config'
import type { LayerConfigContainer } from './config-raw'
import type { MaybeRefOrGetter } from './instance'

export type LayerStoreKey = 'use' | 'define'

export type LayerConfigFragmentSide = 'container' | 'content'

/**
 * Writes one slot on the current `setup` owner. Noop after a newer `setup` overwrites.
 * Returns a dispose.
 */
export type LayerStoreTemplate = (opts: {
  name: string
  side: LayerConfigFragmentSide
  render: LayerSlotRender
}) => () => void

/**
 * Raw config sources held by a layer instance.
 *
 * - `create` / `open` / `refs`: ordinary fields. `create` is a ComputedRef; `open` is assigned.
 * - `use` / `use:template`: getters over the single active pair (plain fragment values, not
 *   ComputedRef). `setup('use')` overwrites them.
 */
export interface LayerInstanceStore {
  create: ComputedRef<LayerConfigFragmentCreate>
  use: LayerConfigFragment
  open: LayerConfigFragment
  'use:template': LayerConfigFragment
  refs: LayerConfigFragment
}

/**
 * defineLayer sources owned by LayerView.
 * Getters follow the single active `setup('define')` pair (plain fragments). They are not assigned.
 */
export interface LayerViewStore {
  define: LayerConfigFragment
  'define:template': LayerConfigFragment
}

export type LayerStoreMethods = {
  setup: (
    key: LayerStoreKey,
    source: ComputedRef<LayerConfigFragment>,
  ) => { template: LayerStoreTemplate }
}

export type LayerInstanceStoreWithTemplate = UnwrapNestedRefs<LayerInstanceStore> &
  LayerStoreMethods

export type LayerViewStoreWithTemplate = UnwrapNestedRefs<LayerViewStore> &
  LayerStoreMethods

/**
 * Result of LayerViewBridge.define() on the marked content root (setup-only).
 * Registers define-tier config; template() writes container slots for that setup generation.
 */
export type LayerDefineContext = {
  template: (opts: {
    name: string
    render: LayerSlotRender
  }) => () => void
}

/**
 * Injected by LayerView. define() is setup-only: content root gets a context,
 * otherwise null. Config is applied in the same call; template comes from the return.
 */
export type LayerViewBridge = {
  define: (
    source: MaybeRefOrGetter<LayerConfigContainer>,
  ) => LayerDefineContext | null
}
