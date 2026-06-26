import type { LayerInstance } from '@/types'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'

export const LAYER_STORE = Symbol('vue-layerx:store')

export type LayerInstanceWithStore = LayerInstance & {
  readonly [LAYER_STORE]?: LayerConfigStoreWithRegistry
}

export function attachLayerStore(
  instance: object,
  store: LayerConfigStoreWithRegistry,
): void {
  Object.defineProperty(instance, LAYER_STORE, {
    value: store,
    enumerable: false,
    writable: false,
    configurable: false,
  })
}

export function resolveLayerStore(instance: LayerInstance): LayerConfigStoreWithRegistry {
  const store = (instance as LayerInstanceWithStore)[LAYER_STORE]
  if (!store) {
    throw new Error('[vue-layerx] LayerInstance config store not found')
  }
  return store
}
