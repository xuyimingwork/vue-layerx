import type { LayerStateWithRegistry } from './layer-state'

const registry = new WeakMap<object, LayerStateWithRegistry>()

export function attachInternal(instance: object, internal: LayerStateWithRegistry): void {
  registry.set(instance, internal)
}

export function getInternal(instance: object): LayerStateWithRegistry {
  const state = registry.get(instance)
  if (!state) {
    throw new Error('[vue-layerx] LayerInstance internal state not found')
  }
  return state
}
