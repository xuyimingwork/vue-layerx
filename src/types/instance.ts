import type { LayerInstanceConfig } from './payload'

export interface LayerTemplateScope<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  inLayer: boolean
  outsideLayer: boolean
  /** content / container 侧 scoped slot 原样转发的 props；无参数时为 {} */
  slotProps: T
}

export interface LayerInstance {
  show: (config?: LayerInstanceConfig) => void
  hide: () => void
  clone: (config?: LayerInstanceConfig) => LayerInstance
  readonly visible: boolean
}
