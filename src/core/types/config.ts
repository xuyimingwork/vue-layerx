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
  /** slot content: imperative (show / define / create) or LayerTemplate materialized at merge */
  slots?: Record<string, SlotRenderFn>
}

export interface LayerTemplateEntry {
  render: SlotRenderFn
}

/** single merge tier: content + container fragments + hideOn */
export interface LayerFragment {
  content?: LayerNodeConfig
  container?: LayerNodeConfig
  hideOn?: string[]
}

/** createLayer + defineLayer — top-level LayerNodeConfig is container */
export type LayerStaticConfig = LayerNodeConfig & {
  content?: LayerNodeConfig
  hideOn?: string[]
  /** createLayer only; not part of merge */
  visible?: VisibleProtocol
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
  content?: LayerNodeNormalized
  container: LayerNodeNormalized
}

/** after adapt, before h() */
export interface LayerRenderPlan extends LayerNormalized {
  visible: boolean
  visibleProp: string
  visibleEvent: string
  onHide: () => void
}

export type LayerAdapt = (normalized: LayerNormalized) => LayerNormalized
