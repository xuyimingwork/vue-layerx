import { ref, type Ref } from 'vue'
import type { LayerInternalState, LayerTemplateEntry } from '@/domain/types'

function warnDuplicate(name: string, scope: 'layer' | 'content') {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(
    `[vue-layerx] Duplicate LayerTemplate name="${name}" in ${scope} scope; latter wins`,
  )
}

export function createLayerInternalState(): LayerInternalState {
  const slotsVersion = ref(0)
  const layerTemplates: Record<string, LayerTemplateEntry> = {}
  const contentTemplates: Record<string, LayerTemplateEntry> = {}

  const bumpSlots = () => {
    slotsVersion.value++
  }

  const registerLayerTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (layerTemplates[name]) warnDuplicate(name, 'layer')
    layerTemplates[name] = entry
    bumpSlots()
  }

  const registerContentTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (contentTemplates[name]) warnDuplicate(name, 'content')
    contentTemplates[name] = entry
    bumpSlots()
  }

  return {
    layerTemplates,
    contentTemplates,
    slotsVersion,
    bumpSlots,
    registerLayerTemplate,
    registerContentTemplate,
  }
}

const LAYER_INTERNAL = Symbol('vue-layerx-internal')

export interface LayerInstanceWithInternal {
  [LAYER_INTERNAL]: LayerInternalState
}

export function attachInternal(
  instance: object,
  internal: LayerInternalState,
): LayerInstanceWithInternal {
  return Object.defineProperty(instance, LAYER_INTERNAL, {
    value: internal,
    enumerable: false,
  }) as LayerInstanceWithInternal
}

export function getInternal(instance: object): LayerInternalState {
  const internal = (instance as LayerInstanceWithInternal)[LAYER_INTERNAL]
  if (!internal) {
    throw new Error('[vue-layerx] Invalid LayerInstance passed to LayerScope')
  }
  return internal
}

export function getSlotsVersion(instance: object): Ref<number> {
  return getInternal(instance).slotsVersion
}
