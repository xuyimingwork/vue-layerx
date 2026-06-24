import { reactive, type UnwrapNestedRefs } from 'vue'
import type { LayerFragment, LayerTemplateEntry } from '@/types/config'
import { EMPTY_LAYER_FRAGMENT } from '@/pipeline/to-fragment'

export interface LayerTemplateBuckets {
  creatorContainer: LayerFragment
  callerContainer: LayerFragment
  callerContent: LayerFragment
}

export interface LayerState {
  create: LayerFragment
  define: LayerFragment | null
  use: LayerFragment
  clone: LayerFragment
  show: LayerFragment
  templates: LayerTemplateBuckets
}

export interface CreateLayerStateInit {
  create: LayerFragment
  use?: LayerFragment
  clone?: LayerFragment
  show?: LayerFragment
}

function emptyContainerTemplateBucket(): LayerFragment {
  return { container: { slots: {} } }
}

function emptyContentTemplateBucket(): LayerFragment {
  return { content: { slots: {} } }
}

function warnDuplicate(name: string, scope: string) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(
    `[vue-layerx] Duplicate LayerTemplate name="${name}" in ${scope}; latter wins`,
  )
}

function ensureContainerSlots(bucket: LayerFragment): Record<string, LayerTemplateEntry['render']> {
  if (!bucket.container) bucket.container = {}
  if (!bucket.container.slots) bucket.container.slots = {}
  return bucket.container.slots
}

function ensureContentSlots(bucket: LayerFragment): Record<string, LayerTemplateEntry['render']> {
  if (!bucket.content) bucket.content = {}
  if (!bucket.content.slots) bucket.content.slots = {}
  return bucket.content.slots
}

export type ReactiveLayerState = UnwrapNestedRefs<LayerState>

export function createLayerState(init: CreateLayerStateInit): LayerStateWithRegistry {
  const templates: LayerTemplateBuckets = {
    creatorContainer: emptyContainerTemplateBucket(),
    callerContainer: emptyContainerTemplateBucket(),
    callerContent: emptyContentTemplateBucket(),
  }

  const state = reactive<LayerState>({
    create: init.create,
    define: null,
    use: init.use ?? EMPTY_LAYER_FRAGMENT,
    clone: init.clone ?? EMPTY_LAYER_FRAGMENT,
    show: init.show ?? EMPTY_LAYER_FRAGMENT,
    templates,
  })

  const registerCreatorContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContainerSlots(state.templates.creatorContainer)
    if (slots[name]) warnDuplicate(name, 'creator container')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  const registerCallerContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContainerSlots(state.templates.callerContainer)
    if (slots[name]) warnDuplicate(name, 'caller container')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  const registerCallerContentTemplate = (name: string, entry: LayerTemplateEntry) => {
    const slots = ensureContentSlots(state.templates.callerContent)
    if (slots[name]) warnDuplicate(name, 'caller content')
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  return Object.assign(state, {
    registerCreatorContainerTemplate,
    registerCallerContainerTemplate,
    registerCallerContentTemplate,
  }) as LayerStateWithRegistry
}

export type LayerStateWithRegistry = ReactiveLayerState & {
  registerCreatorContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerCallerContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerCallerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}
