import type { VNode } from 'vue'
import type { LayerUseOptions, LayerShowPayload } from './content'

export interface LayerTemplateScope {
  inLayer: boolean
  outsideLayer: boolean
}

export interface LayerTemplateInstance {
  render: () => VNode | VNode[] | null
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}

export interface LayerTemplateContext {
  bumpSlots: () => void
}
