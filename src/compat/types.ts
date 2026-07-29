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

/** Handle from `createPlatformRoot` — call `setup` in the mounted root's setup. */
export interface PlatformRootHandle {
  /** Host baked in at create time (for remount-when-host-changes). */
  readonly host: LayerHost | null
  setup: () => void
  mount: (el: Element) => void
  unmount: () => void
}
