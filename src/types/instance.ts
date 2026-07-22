import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import type { LayerConfigContent } from './config-raw'
import type { LayerCloseOptions, LayerConfirmResult } from './confirm'

/** Returned by defineLayer(); pass as LayerTemplate :to */
export interface LayerDefine {
  /** Whether this define is backed by a live LayerView context (direct layer content). */
  readonly exists: boolean
}

export interface LayerInstance {
  /** Snapshot tier only — plain config, not MaybeRefOrGetter. */
  open: (config?: LayerConfigContent) => void
  /**
   * Open as a confirm session. Settles when the layer closes.
   * Rejects with LayerConfirmError (code: 'busy') if already open or confirming.
   */
  confirm: (config?: LayerConfigContent) => Promise<LayerConfirmResult>
  close: (options?: LayerCloseOptions) => void
  unmount: () => void
  clone: (config?: MaybeRefOrGetter<LayerConfigContent>) => LayerInstance
  /** Read-only getter; track via `dialog.visible` / `watch(() => dialog.visible)`. */
  readonly visible: boolean
  /** Read-only getter; open → content component instance, closed → `null`. Not a Vue Ref. */
  readonly content: ComponentPublicInstance | null
  /** Read-only getter; open → container component instance, closed → `null`. Not a Vue Ref. */
  readonly container: ComponentPublicInstance | null
  /**
   * Bind portal inherit context to current setup host.
   * Same-host re-call is a silent no-op; binding a different host or calling outside setup warns in dev.
   * `useLayer` / `clone` auto-bind during create (silent if no setup host).
   */
  bindHost: () => void
}
