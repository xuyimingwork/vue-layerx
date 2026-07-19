import type { Component, ComponentPublicInstance, VNode } from 'vue'

export type LayerSlotRender = (
  props?: Record<string, unknown>,
) => VNode | VNode[] | null

export type LayerRefCallback = (
  el: ComponentPublicInstance | null,
) => void

/** Canonical closeOn; same shape as CloseOnRaw this round */
export type CloseOn = string[]

/** Canonical props — ref is callback only (after normalizePropRef) */
export interface LayerProps {
  ref?: LayerRefCallback
  [key: string]: unknown
}

export interface LayerTemplateEntry {
  render: LayerSlotRender
}

/** Canonical merge / store building block */
export interface LayerConfigNode {
  component?: Component
  props?: LayerProps
  /** slot content: imperative or LayerTemplate materialized at merge */
  slots?: Record<string, LayerSlotRender>
}

/** Container node — model = v-model prop name (event: onUpdate:${model}) */
export interface LayerConfigNodeContainer extends LayerConfigNode {
  model?: string
}

/** Content node — closeOn = content emit → layer.close() */
export interface LayerConfigNodeContent extends LayerConfigNode {
  closeOn?: CloseOn
}

/** single merge tier: content + container (Canonical only) */
export interface LayerConfigFragment {
  content?: LayerConfigNodeContent
  container?: LayerConfigNodeContainer
}

export type LayerAdapter = (fragment: LayerConfigFragment) => LayerConfigFragment

/**
 * Instance store `create` tier: merge fragment + optional factory adapter.
 * `adapter` is not merged by mergeFragment (only content/container); LayerView
 * reads it from the create tier after merge to run adapt.
 */
export type LayerConfigFragmentCreate = LayerConfigFragment & {
  adapter?: LayerAdapter
}
