import { reactive, type UnwrapNestedRefs } from 'vue'
import type { LayerConfigFragment, LayerTemplateEntry } from '@/types/config'
import { EMPTY_LAYER_FRAGMENT } from '@/pipeline/to-fragment'

export interface LayerTemplateBuckets {
  creatorContainer: LayerConfigFragment
  callerContainer: LayerConfigFragment
  callerContent: LayerConfigFragment
}

export interface LayerConfigStore {
  create: LayerConfigFragment
  define: LayerConfigFragment | null
  use: LayerConfigFragment
  clone: LayerConfigFragment
  open: LayerConfigFragment
  templates: LayerTemplateBuckets
}

export interface LayerConfigStoreInit {
  create: LayerConfigFragment
  use?: LayerConfigFragment
  clone?: LayerConfigFragment
  open?: LayerConfigFragment
}

function emptyContainerTemplateBucket(): LayerConfigFragment {
  return { container: { slots: {} } }
}

function emptyContentTemplateBucket(): LayerConfigFragment {
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

export type ReactiveLayerConfigStore = UnwrapNestedRefs<LayerConfigStore>

export function createLayerConfigStore(init: LayerConfigStoreInit): LayerConfigStoreWithRegistry {
  const templates: LayerTemplateBuckets = {
    creatorContainer: emptyContainerTemplateBucket(),
    callerContainer: emptyContainerTemplateBucket(),
    callerContent: emptyContentTemplateBucket(),
  }

  const configStore = reactive<LayerConfigStore>({
    create: init.create,
    define: null,
    use: init.use ?? EMPTY_LAYER_FRAGMENT,
    clone: init.clone ?? EMPTY_LAYER_FRAGMENT,
    open: init.open ?? EMPTY_LAYER_FRAGMENT,
    templates,
  })

  const registerCreatorContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContainerSlots(configStore.templates.creatorContainer)
    if (slots[name]) warnDuplicate(name, 'creator container')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  const registerCallerContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContainerSlots(configStore.templates.callerContainer)
    if (slots[name]) warnDuplicate(name, 'caller container')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  const registerCallerContentTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContentSlots(configStore.templates.callerContent)
    if (slots[name]) warnDuplicate(name, 'caller content')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  return Object.assign(configStore, {
    registerCreatorContainerTemplate,
    registerCallerContainerTemplate,
    registerCallerContentTemplate,
  }) as LayerConfigStoreWithRegistry
}

export type LayerConfigStoreWithRegistry = ReactiveLayerConfigStore & {
  registerCreatorContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerCallerContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerCallerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}
