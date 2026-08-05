import type { ComponentPublicInstance, Ref } from 'vue'
import type {
  LayerConfigContentOf,
  LayerPropsInput,
  LooseProps,
} from './config-raw'
import type { LayerCloseOptions, LayerConfirmResult } from './confirm'

/** Local shim — Vue 2.7 has no MaybeRefOrGetter in its public types. */
export type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)

/**
 * Opaque setup host — Vue 3 internal instance / Vue 2.7 proxy.
 * Do not expose appContext or other platform internals to business code.
 */
export type LayerHost = object

/** Returned by defineLayer(); pass as LayerTemplate :to */
export interface LayerDefine {
  /** Whether this define is backed by a live LayerView context (direct layer content). */
  readonly exists: boolean
}

/**
 * Layer instance. Generic params tighten content / container props on open paths.
 * Defaults stay loose (`Record<string, unknown>`) for unbound or uninferable components.
 */
export interface LayerInstance<
  ContentProps = LooseProps,
  ContainerProps = LooseProps,
> {
  /** Snapshot tier only — plain config, not MaybeRefOrGetter. */
  open: (config?: LayerConfigContentOf<ContentProps, ContainerProps>) => void
  /**
   * Sugar for content props only: `$open(props)` ≡ `open({ props })`.
   * No-arg ≡ `open()`. Does not accept LayerConfigContent (use `open` for container/slots/…).
   */
  $open: (props?: LayerPropsInput<ContentProps>) => void
  /**
   * Open as a confirm session. Settles when the layer closes.
   * Rejects with LayerConfirmError (code: 'busy') if already open or confirming.
   */
  confirm: (
    config?: LayerConfigContentOf<ContentProps, ContainerProps>,
  ) => Promise<LayerConfirmResult>
  /**
   * Sugar for content props only: `$confirm(props)` ≡ `confirm({ props })`.
   * No-arg ≡ `confirm()`. Does not accept LayerConfigContent (use `confirm` for container/slots/…).
   */
  $confirm: (props?: LayerPropsInput<ContentProps>) => Promise<LayerConfirmResult>
  close: (options?: LayerCloseOptions) => void
  unmount: () => void
  clone: (
    config?: MaybeRefOrGetter<LayerConfigContentOf<ContentProps, ContainerProps>>,
  ) => LayerInstance<ContentProps, ContainerProps>
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
