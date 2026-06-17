import type { Component, VNode } from 'vue'

export type LayerProps = Record<string, unknown>

export type SlotRenderFn = () => VNode | VNode[] | null

/** [visibleProp, visibleEventHandlerProp] e.g. ['modelValue', 'onUpdate:modelValue'] */
export type VisibleProtocol = [string, string]

/** merge / config fragment for content or layer node */
export interface LayerNodeConfig {
  component?: Component
  props?: LayerProps
  /** imperative slot overrides (defineLayer / show); declarative content uses LayerTemplate */
  slots?: Record<string, SlotRenderFn>
}

export interface LayerTemplateEntry {
  render: SlotRenderFn
}

/** merge phase output */
export interface LayerMerged {
  content: LayerNodeConfig
  layer: LayerNodeConfig
  hideOn?: string[]
}

/** resolve / adapt output — ready for h() except visible protocol */
export interface LayerNodeNormalized {
  component: Component
  props: LayerProps
  slots: Record<string, SlotRenderFn>
}

export interface LayerNormalized {
  content: LayerNodeNormalized
  layer: LayerNodeNormalized
}

/** after adapt, before h() */
export interface LayerRenderPlan extends LayerNormalized {
  visible: boolean
  visibleProp: string
  visibleEvent: string
  onHide: () => void
}

export interface LayerDefaults {
  visible?: VisibleProtocol
  content?: LayerNodeConfig
  layer?: LayerNodeConfig
}

export interface DefineLayerOptions {
  /** shorthand for layer.props */
  props?: LayerProps
  layer?: {
    props?: LayerProps
    slots?: Record<string, SlotRenderFn>
  }
  /** content events that auto-close the layer; owned by the dialog module author */
  hideOn?: string[]
}

export type LayerAdapt = (normalized: LayerNormalized) => LayerNormalized
