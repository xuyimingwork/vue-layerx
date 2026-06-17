import type { LayerNodeConfig } from './layer'

/** useX(Content, opts) & show(payload) — content node + layer + hideOn */
export type LayerUsePayload = LayerNodeConfig & {
  layer?: LayerNodeConfig
  hideOn?: string[]
}

export type LayerUseOptions = LayerUsePayload
export type LayerShowPayload = LayerUsePayload
