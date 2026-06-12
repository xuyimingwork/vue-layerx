import type { LayerDefinitionOptions, LayerProps, LayerSlots } from './layer'

/** useLayer(Content) & show() — content-level options */
export interface ContentInstanceOptions {
  /** Content component props */
  props?: LayerProps
  slots?: LayerSlots
  hideOn?: string[]
  layer?: LayerDefinitionOptions
}

export type LayerUseOptions = ContentInstanceOptions
export type LayerShowPayload = ContentInstanceOptions
