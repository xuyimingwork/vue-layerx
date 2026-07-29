/**
 * Opaque setup host — Vue 3 internal instance / Vue 2.7 proxy.
 * Do not expose appContext or other platform internals to business code.
 */
export type LayerHost = object

export interface LayerAppState {
  visible: boolean
}

export interface LayerAppHandle {
  readonly mounted: boolean
  unmount: () => void
}
