import type { Ref } from 'vue'
import type { LayerBound } from '@/types'

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

/**
 * Shared options for `createLayerViewVNode` (both platforms).
 * `refContentTo` is only consumed on Vue 3 (Teleport / parking).
 */
export interface CreateLayerViewVNodeOptions extends LayerBound {
  openId?: number
  refContentTo?: Ref<HTMLUnknownElement | undefined | null>
}
