import type { ComputedRef, ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import type { LayerConfigContent } from './config'

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
  /** Snapshot tier only — plain config, not MaybeRefOrGetter. */
  open: (config?: LayerConfigContent) => void
  close: () => void
  unmount: () => void
  clone: (config?: MaybeRefOrGetter<LayerConfigContent>) => LayerInstance
  readonly visible: boolean
  readonly contentRef: ComputedRef<ComponentPublicInstance | null>
  readonly containerRef: ComputedRef<ComponentPublicInstance | null>
  /**
   * Bind portal inherit context to current setup host.
   * Same-host re-call is a silent no-op; binding a different host or calling outside setup warns in dev.
   * `useLayer` / `clone` auto-bind during create (silent if no setup host).
   */
  bindHost: () => void
}
