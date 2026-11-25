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

/** Delivery channel for defineLayer when called on content root (setup-only). */
export type LayerDefineContext = {
  config: (source: MaybeRefOrGetter<LayerConfigContainer>) => void
  template: (opts: {
    name: string
    render: LayerSlotRender
  }) => () => void
}

/**
 * Injected by LayerView. getDefineContext() is setup-only and returns a context
 * only for the marked content root; otherwise null.
 */
export type LayerViewBridge = {
  getDefineContext: () => LayerDefineContext | null
}
