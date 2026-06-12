import type { InjectionKey } from 'vue'
import type { LayerDefinitionOptions } from '../../../domain/types'

export type LayerDefinitionRegistry = {
  registerLayer: (config: LayerDefinitionOptions) => void
}

export function createLayerDefinitionKey(): InjectionKey<LayerDefinitionRegistry> {
  return Symbol('layerx-definition') as InjectionKey<LayerDefinitionRegistry>
}

export const LAYER_SLOT_CONTEXT_KEY = Symbol('layerx-slot-context') as InjectionKey<{
  bumpSlots: () => void
}>
