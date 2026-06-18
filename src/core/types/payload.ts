import type { LayerNodeConfig } from './config'

/** useX(Content, opts) & show(payload) — content node + container + hideOn */
export type LayerUsePayload = LayerNodeConfig & {
  container?: LayerNodeConfig
  hideOn?: string[]
}

export type LayerUseOptions = LayerUsePayload
export type LayerShowPayload = LayerUsePayload
