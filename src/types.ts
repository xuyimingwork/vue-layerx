import type { Ref, VNode } from 'vue'

export type LayerProps = Record<string, unknown>

/** [visibleProp, visibleEventHandlerProp] e.g. ['modelValue', 'onUpdate:modelValue'] */
export type VisibleProtocol = [string, string]

export type LayerSlots = Record<string, Ref<LayerSlotInstance | undefined>>

/** Content props nested under layer definition */
export interface ContentConfig {
  props?: LayerProps
}

/** createLayerx & useLayer.layer() — layer-level options */
export interface LayerDefinitionOptions {
  visible?: VisibleProtocol
  /** Layer component props */
  props?: LayerProps
  /** Layer slot name → LayerSlot ref */
  slots?: LayerSlots
  /** Default content props */
  content?: ContentConfig
}

/** createLayerx options — same as LayerDefinitionOptions */
export type CreateLayerxOptions = LayerDefinitionOptions

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

export interface LayerSlotScope {
  inLayer: boolean
  inOutside: boolean
}

export interface LayerSlotInstance {
  render: () => VNode | VNode[] | null
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}

export interface LayerSlotContext {
  bumpSlots: () => void
}
