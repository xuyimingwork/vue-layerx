import { reactive, type UnwrapNestedRefs } from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerTemplateEntry } from '@/types/config'
import { EMPTY_LAYER_FRAGMENT } from '@/pipeline/to-fragment'

export interface LayerInstanceStore {
  create: LayerConfigFragment
  /** internal: createLayer config.adapter; factory-level, shared by clone; not merged */
  adapter?: LayerAdapter
  use: LayerConfigFragment
  clone: LayerConfigFragment
  open: LayerConfigFragment
  /** `:to` + container — remote Dialog slots */
  callerContainer: LayerConfigFragment
  /** `:to` — remote content slots */
  callerContent: LayerConfigFragment
}

export interface LayerInstanceStoreInit {
  create: LayerConfigFragment
  adapter?: LayerAdapter
  use?: LayerConfigFragment
  clone?: LayerConfigFragment
  open?: LayerConfigFragment
}

function emptyContainerSlotsBucket(): LayerConfigFragment {
  return { container: { slots: {} } }
}

function emptyContentSlotsBucket(): LayerConfigFragment {
  return { content: { slots: {} } }
}

function warnDuplicate(name: string, scope: string) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(
    `[vue-layerx] Duplicate LayerTemplate name="${name}" in ${scope}; latter wins`,
  )
}

function ensureContainerSlots(bucket: LayerConfigFragment): Record<string, LayerTemplateEntry['render']> {
  if (!bucket.container) bucket.container = {}
  if (!bucket.container.slots) bucket.container.slots = {}
  return bucket.container.slots
}

function ensureContentSlots(bucket: LayerConfigFragment): Record<string, LayerTemplateEntry['render']> {
  if (!bucket.content) bucket.content = {}
  if (!bucket.content.slots) bucket.content.slots = {}
  return bucket.content.slots
}

export type ReactiveLayerInstanceStore = UnwrapNestedRefs<LayerInstanceStore>

export function createLayerInstanceStore(init: LayerInstanceStoreInit): LayerInstanceStoreWithRegistry {
  const store = reactive<LayerInstanceStore>({
    create: init.create,
    adapter: init.adapter,
    use: init.use ?? EMPTY_LAYER_FRAGMENT,
    clone: init.clone ?? EMPTY_LAYER_FRAGMENT,
    open: init.open ?? EMPTY_LAYER_FRAGMENT,
    callerContainer: emptyContainerSlotsBucket(),
    callerContent: emptyContentSlotsBucket(),
  })

  const registerContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContainerSlots(store.callerContainer)
    if (slots[name]) warnDuplicate(name, 'caller container')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  const registerContentTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContentSlots(store.callerContent)
    if (slots[name]) warnDuplicate(name, 'caller content')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  return Object.assign(store, {
    registerContainerTemplate,
    registerContentTemplate,
  }) as LayerInstanceStoreWithRegistry
}

export type LayerInstanceStoreWithRegistry = ReactiveLayerInstanceStore & {
  registerContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}
