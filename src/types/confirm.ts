export type LayerConfirmSource =
  | 'content'
  | 'container'
  | 'instance'
  | 'unmount'

export interface LayerConfirmResult {
  source: LayerConfirmSource
  /** Named event when close was event-driven; omitted for imperative close / unmount */
  event?: string
  args: unknown[]
  /** === args[0]; undefined when args is empty */
  data: unknown
}

/** Public options for LayerInstance.close */
export interface LayerCloseOptions {
  confirmed?: boolean
  args?: unknown[]
}

/**
 * Internal close payload (bind / emit second arg / dispose).
 * Not part of the public package surface.
 */
export type LayerClosePayload = {
  confirmed?: boolean
  source?: LayerConfirmSource
  event?: string
  args?: unknown[]
}
