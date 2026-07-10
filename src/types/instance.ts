import type { ComputedRef, ComponentPublicInstance } from 'vue'
import type { LayerConfigInstance } from './config'

export interface LayerTemplateScope<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  inLayer: boolean
  outsideLayer: boolean
  /** content / container 侧 scoped slot 原样转发的 props；无参数时为 {} */
  slotProps: T
}

/** Returned by defineLayer(); pass as LayerTemplate :to */
export interface LayerDefine {
  readonly inLayer: boolean
  readonly outsideLayer: boolean
}

export interface LayerInstance {
  open: (config?: LayerConfigInstance) => void
  close: () => void
  unmount: () => void
  clone: (config?: LayerConfigInstance) => LayerInstance
  readonly visible: boolean
  readonly contentRef: ComputedRef<ComponentPublicInstance | null>
  readonly containerRef: ComputedRef<ComponentPublicInstance | null>
  /** Bind portal inherit context to current setup host; no-op if already bound or outside setup */
  bindHost: () => void
}
