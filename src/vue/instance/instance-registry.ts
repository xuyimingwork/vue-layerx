import type { LayerInternalState } from './internal-state'

const registry = new WeakMap<object, LayerInternalState>()

export function attachInternal(instance: object, internal: LayerInternalState): void {
  registry.set(instance, internal)
}

export function getInternal(instance: object): LayerInternalState {
  const internal = registry.get(instance)
  if (!internal) {
    throw new Error('[vue-layerx] Invalid LayerInstance passed to LayerTemplate')
  }
  return internal
}
