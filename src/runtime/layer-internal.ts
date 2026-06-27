import type {
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'

export const LAYER_STORE = Symbol('vue-layerx:store')

export type LayerStoreWithTemplate =
  | LayerInstanceStoreWithTemplate
  | LayerViewStoreWithTemplate

export type LayerStoreHost = {
  readonly [LAYER_STORE]?: LayerStoreWithTemplate
}

export function attachLayerStore(
  host: object,
  store: LayerStoreWithTemplate,
): void {
  Object.defineProperty(host, LAYER_STORE, {
    value: store,
    enumerable: false,
    writable: false,
    configurable: false,
  })
}

export function resolveLayerStore(host: object): LayerStoreWithTemplate {
  const store = (host as LayerStoreHost)[LAYER_STORE]
  if (!store) {
    throw new Error('[vue-layerx] Layer store not found on target')
  }
  return store
}
