import type { VNode } from 'vue'
import type { LayerUseOptions, LayerShowPayload } from './content'

export interface LayerSlotScope {
  inLayer: boolean
  inOutside: boolean
}

export interface LayerSlotInstance {
  render: () => VNode | VNode[] | null
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}

export interface LayerSlotContext {
  bumpSlots: () => void
}
