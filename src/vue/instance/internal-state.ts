import { ref, type Ref } from 'vue'
import type { LayerTemplateEntry } from '@/core/types/config'

export interface LayerInternalState {
  containerTemplates: Record<string, LayerTemplateEntry>
  contentTemplates: Record<string, LayerTemplateEntry>
  slotsVersion: Ref<number>
  bumpSlots: () => void
  registerContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}

function warnDuplicate(name: string, scope: 'container' | 'content') {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(
    `[vue-layerx] Duplicate LayerTemplate name="${name}" in ${scope} scope; latter wins`,
  )
}

export function createLayerInternalState(): LayerInternalState {
  const slotsVersion = ref(0)
  const containerTemplates: Record<string, LayerTemplateEntry> = {}
  const contentTemplates: Record<string, LayerTemplateEntry> = {}

  const bumpSlots = () => {
    slotsVersion.value++
  }

  const registerContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (containerTemplates[name]) warnDuplicate(name, 'container')
    containerTemplates[name] = entry
    bumpSlots()
  }

  const registerContentTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (contentTemplates[name]) warnDuplicate(name, 'content')
    contentTemplates[name] = entry
    bumpSlots()
  }

  return {
    containerTemplates,
    contentTemplates,
    slotsVersion,
    bumpSlots,
    registerContainerTemplate,
    registerContentTemplate,
  }
}
