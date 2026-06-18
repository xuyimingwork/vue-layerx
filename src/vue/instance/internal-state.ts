import { ref, type Ref } from 'vue'
import type { LayerTemplateEntry } from '@/core/types/config'

export interface LayerTemplateRegistries {
  creatorContainer: Record<string, LayerTemplateEntry>
  callerContainer: Record<string, LayerTemplateEntry>
  callerContent: Record<string, LayerTemplateEntry>
}

export interface LayerInternalState extends LayerTemplateRegistries {
  slotsVersion: Ref<number>
  bumpSlots: () => void
  registerCreatorContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerCallerContainerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerCallerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}

function warnDuplicate(name: string, scope: string) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(
    `[vue-layerx] Duplicate LayerTemplate name="${name}" in ${scope}; latter wins`,
  )
}

export function createLayerInternalState(): LayerInternalState {
  const slotsVersion = ref(0)
  const creatorContainer: Record<string, LayerTemplateEntry> = {}
  const callerContainer: Record<string, LayerTemplateEntry> = {}
  const callerContent: Record<string, LayerTemplateEntry> = {}

  const bumpSlots = () => {
    slotsVersion.value++
  }

  const registerCreatorContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (creatorContainer[name]) warnDuplicate(name, 'creator container')
    creatorContainer[name] = entry
    bumpSlots()
  }

  const registerCallerContainerTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (callerContainer[name]) warnDuplicate(name, 'caller container')
    callerContainer[name] = entry
    bumpSlots()
  }

  const registerCallerContentTemplate = (name: string, entry: LayerTemplateEntry) => {
    if (callerContent[name]) warnDuplicate(name, 'caller content')
    callerContent[name] = entry
    bumpSlots()
  }

  return {
    creatorContainer,
    callerContainer,
    callerContent,
    slotsVersion,
    bumpSlots,
    registerCreatorContainerTemplate,
    registerCallerContainerTemplate,
    registerCallerContentTemplate,
  }
}
