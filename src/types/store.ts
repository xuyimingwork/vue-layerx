import type { UnwrapNestedRefs, VNode } from 'vue'
import type {
  LayerConfigFragment,
  LayerConfigStatic,
  LayerTemplateEntry,
} from './config'

export type TemplateSlotKey =
  | 'use:template.container'
  | 'use:template.content'
  | 'define:template.container'

export interface LayerInstanceStore {
  create: LayerConfigFragment
  use: LayerConfigFragment
  open: LayerConfigFragment
  'use:template': LayerConfigFragment
  refs: LayerConfigFragment
}

export interface LayerViewStore {
  define: LayerConfigFragment
  'define:template': LayerConfigFragment
}

export interface LayerInstanceStoreInit {
  create: LayerConfigFragment
  use?: LayerConfigFragment
  refs?: LayerConfigFragment
}

type LayerStoreMethods = {
  template: (opts: {
    key: TemplateSlotKey
    name: string
    entry: LayerTemplateEntry
  }) => void
  track: () => void
}

export type LayerInstanceStoreWithTemplate = UnwrapNestedRefs<LayerInstanceStore> &
  LayerStoreMethods

export type LayerViewStoreWithTemplate = UnwrapNestedRefs<LayerViewStore> &
  LayerStoreMethods

/** Delivery channel for defineLayer when called on content root (setup-only). */
export type LayerDefineContext = {
  config: (config: LayerConfigStatic) => void
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
