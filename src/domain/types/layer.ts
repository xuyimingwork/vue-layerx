import type { Ref } from 'vue'
import type { LayerTemplateInstance } from './instance'

export type LayerProps = Record<string, unknown>

/** [visibleProp, visibleEventHandlerProp] e.g. ['modelValue', 'onUpdate:modelValue'] */
export type VisibleProtocol = [string, string]

export type LayerSlots = Record<string, Ref<LayerTemplateInstance | undefined>>

/** Content props nested under layer definition */
export interface ContentConfig {
  props?: LayerProps
}

/** createLayerx & useLayer.layer() — layer-level options */
export interface LayerDefinitionOptions {
  visible?: VisibleProtocol
  /** Layer component props */
  props?: LayerProps
  /** Layer slot name → LayerTemplate ref */
  slots?: LayerSlots
  /** Default content props */
  content?: ContentConfig
}

/** createLayerx options — same as LayerDefinitionOptions */
export type CreateLayerxOptions = LayerDefinitionOptions
