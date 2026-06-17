import { ref, type Ref } from 'vue'
import type { LayerTemplateEntry } from '@/core/types/config'

export interface LayerInternalState {
  layerTemplates: Record<string, LayerTemplateEntry>
  contentTemplates: Record<string, LayerTemplateEntry>
  slotsVersion: Ref<number>
  bumpSlots: () => void
  registerLayerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}

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
