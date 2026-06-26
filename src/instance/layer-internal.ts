import type { LayerInstance } from '@/types'
import type { LayerInstanceStoreWithRegistry } from '@/instance/layer-instance-store'

export const LAYER_STORE = Symbol('vue-layerx:store')

export type LayerInstanceWithStore = LayerInstance & {
  readonly [LAYER_STORE]?: LayerInstanceStoreWithRegistry
}

export function attachLayerStore(
  instance: object,
  store: LayerInstanceStoreWithRegistry,
): void {
  Object.defineProperty(instance, LAYER_STORE, {
    value: store,
    enumerable: false,
    writable: false,
    configurable: false,
  })
}

export function resolveLayerStore(instance: LayerInstance): LayerInstanceStoreWithRegistry {
  const store = (instance as LayerInstanceWithStore)[LAYER_STORE]
  if (!store) {
    throw new Error('[vue-layerx] LayerInstance config store not found')
  }
  return store
}
