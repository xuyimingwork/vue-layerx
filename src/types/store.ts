import type { UnwrapNestedRefs } from 'vue'
import type { LayerConfigFragment, LayerTemplateEntry } from './config'

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

export type LayerDefineRegistry = {
  register: (fragment: LayerConfigFragment) => void
  store: LayerViewStoreWithTemplate
}
