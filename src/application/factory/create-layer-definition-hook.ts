import { getCurrentInstance, inject, type InjectionKey } from 'vue'
import type { LayerDefinitionOptions } from '../../domain/types'
import { hasDirectLayerMarker } from '../../infrastructure/vue/context/layer-marker'
import type { LayerDefinitionRegistry } from '../../infrastructure/vue/di/injection-keys'

export function createLayerDefinitionHook(
  layerDefinitionKey: InjectionKey<LayerDefinitionRegistry>,
) {
  return function layer(options: LayerDefinitionOptions = {}) {
    const registry = inject(layerDefinitionKey, null)
    if (!registry || !hasDirectLayerMarker(getCurrentInstance())) return
    registry.registerLayer(options)
  }
}
