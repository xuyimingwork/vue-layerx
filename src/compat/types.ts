import type { LayerHost } from '@/types/layer-host'

export type { LayerHost }

/** Handle from `createPlatformRoot` — call `setup` in the mounted root's setup. */
export interface PlatformRootHandle {
  /** Host baked in at create time (for remount-when-host-changes). */
  readonly host: LayerHost | null
  setup: () => void
  mount: (el: Element) => void
  unmount: () => void
}
