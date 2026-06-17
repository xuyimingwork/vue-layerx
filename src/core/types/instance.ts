import type { LayerShowPayload, LayerUseOptions } from './payload'

export interface LayerTemplateScope {
  inLayer: boolean
  outsideLayer: boolean
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}
