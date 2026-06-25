import type { LayerConfigInstance } from './config'

export interface LayerTemplateScope<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  inLayer: boolean
  outsideLayer: boolean
  /** content / container 侧 scoped slot 原样转发的 props；无参数时为 {} */
  slotProps: T
}

export interface LayerInstance {
  open: (config?: LayerConfigInstance) => void
  close: () => void
  unmount: () => void
  clone: (config?: LayerConfigInstance) => LayerInstance
  readonly visible: boolean
}
