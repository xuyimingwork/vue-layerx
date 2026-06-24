import type { LayerConfigStoreWithRegistry } from './layer-config-store'

const registry = new WeakMap<object, LayerConfigStoreWithRegistry>()

export function attachConfigStore(instance: object, store: LayerConfigStoreWithRegistry): void {
  registry.set(instance, store)
}

export function getConfigStore(instance: object): LayerConfigStoreWithRegistry {
  const store = registry.get(instance)
  if (!store) {
    throw new Error('[vue-layerx] LayerInstance config store not found')
  }
  return store
}
