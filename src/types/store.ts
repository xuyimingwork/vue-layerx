import type { ComputedRef, MaybeRefOrGetter, UnwrapNestedRefs, VNode } from 'vue'
import type {
  LayerConfigFragment,
  LayerConfigStatic,
  LayerCreateBucket,
  LayerTemplateEntry,
} from './config'

export type TemplateSlotKey =
  | 'use:template.container'
  | 'use:template.content'
  | 'define:template.container'

/**
 * Raw config sources held by a layer instance.
 *
 * - `create` / `use`: read-only derived buckets (ComputedRef); never assigned after init.
 * - `open`: snapshot tier; assigned by open(plain).
 * - `use:template` / `refs`: mutable plain fragments (template() / framework refs).
 */
export interface LayerInstanceStore {
  create: ComputedRef<LayerCreateBucket>
  use: ComputedRef<LayerConfigFragment>
  open: LayerConfigFragment
  'use:template': LayerConfigFragment
  refs: LayerConfigFragment
}

/**
 * defineLayer / creator LayerTemplate sources owned by LayerView.
 * `define` may be plain (reset) or ComputedRef (live defineLayer source).
 */
export interface LayerViewStore {
  define: LayerConfigFragment | ComputedRef<LayerConfigFragment>
  'define:template': LayerConfigFragment
}

export interface LayerInstanceStoreInit {
  create: ComputedRef<LayerCreateBucket>
  use: ComputedRef<LayerConfigFragment>
  refs?: LayerConfigFragment
}

type LayerStoreMethods = {
  template: (opts: {
    key: TemplateSlotKey
    name: string
    entry: LayerTemplateEntry
  }) => void
}

export type LayerInstanceStoreWithTemplate = UnwrapNestedRefs<LayerInstanceStore> &
  LayerStoreMethods

export type LayerViewStoreWithTemplate = UnwrapNestedRefs<LayerViewStore> &
  LayerStoreMethods

/** Delivery channel for defineLayer when called on content root (setup-only). */
export type LayerDefineContext = {
  config: (source: MaybeRefOrGetter<LayerConfigStatic>) => void
  template: (opts: {
    name: string
    render: (slotProps?: Record<string, unknown>) => VNode | VNode[] | null
  }) => void
}

/**
 * Injected by LayerView. getDefineContext() is setup-only and returns a context
 * only for the marked content root; otherwise null.
 */
export type LayerViewBridge = {
  getDefineContext: () => LayerDefineContext | null
}
