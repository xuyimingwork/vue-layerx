import type { Ref } from 'vue'
import type { LayerInternalState } from './types'

const registry = new WeakMap<object, LayerInternalState>()

export function attachInternal(instance: object, internal: LayerInternalState): void {
  registry.set(instance, internal)
}

export function getInternal(instance: object): LayerInternalState {
  const internal = registry.get(instance)
  if (!internal) {
    throw new Error('[vue-layerx] Invalid LayerInstance passed to LayerScope')
  }
  return internal
}

export function getSlotsVersion(instance: object): Ref<number> {
  return getInternal(instance).slotsVersion
}
