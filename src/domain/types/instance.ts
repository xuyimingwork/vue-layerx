import type { Ref } from 'vue'
import type { LayerTemplateEntry } from './layer'
import type { LayerShowPayload, LayerUseOptions } from './content'

export interface LayerTemplateScope {
  inLayer: boolean
  outsideLayer: boolean
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}

export interface LayerInternalState {
  layerTemplates: Record<string, LayerTemplateEntry>
  contentTemplates: Record<string, LayerTemplateEntry>
  slotsVersion: Ref<number>
  bumpSlots: () => void
  registerLayerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}
