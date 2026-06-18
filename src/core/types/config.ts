import type { Component, VNode } from 'vue'

export type LayerProps = Record<string, unknown>

export type SlotRenderFn = (
  props?: Record<string, unknown>,
) => VNode | VNode[] | null

/** [visibleProp, visibleEventHandlerProp] e.g. ['modelValue', 'onUpdate:modelValue'] */
export type VisibleProtocol = [string, string]

/** merge / config fragment for content or container node */
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
  container: LayerNodeConfig
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
  container: LayerNodeNormalized
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
  container?: LayerNodeConfig
}

export interface DefineLayerOptions {
  /** shorthand for container.props */
  props?: LayerProps
  container?: {
    props?: LayerProps
    slots?: Record<string, SlotRenderFn>
  }
  /** content events that auto-close the layer instance; owned by the dialog module author */
  hideOn?: string[]
}

export type LayerAdapt = (normalized: LayerNormalized) => LayerNormalized
