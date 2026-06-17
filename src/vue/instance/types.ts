import type { Ref } from 'vue'
import type { LayerTemplateEntry } from '@/core/types/config'

export interface LayerInternalState {
  layerTemplates: Record<string, LayerTemplateEntry>
  contentTemplates: Record<string, LayerTemplateEntry>
  slotsVersion: Ref<number>
  bumpSlots: () => void
  registerLayerTemplate: (name: string, entry: LayerTemplateEntry) => void
  registerContentTemplate: (name: string, entry: LayerTemplateEntry) => void
}
