import type { LayerShowPayload, LayerUseOptions } from './payload'

export interface LayerTemplateScope<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  inLayer: boolean
  outsideLayer: boolean
  /** content / layer 侧 scoped slot 原样转发的 props；无参数时为 {} */
  slotProps: T
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}
