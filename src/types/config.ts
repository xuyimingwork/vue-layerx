import type { Component, ComponentPublicInstance, VNode } from 'vue'

export type LayerSlotRender = (
  props?: Record<string, unknown>,
) => VNode | VNode[] | null

export type LayerRefCallback = (
  el: ComponentPublicInstance | null,
) => void

/** closeOn when: tombstone / always / sync predicate (=== true closes) */
export type CloseOnWhen =
  | 'none'
  | 'always'
  | ((...args: unknown[]) => boolean)

/** Canonical closeOn entry (fields always present after normalize) */
export type CloseOnEntry = {
  when: CloseOnWhen
  confirmed: boolean
}

/** Canonical closeOn: event → entry; store may include when:'none' until merge drops it */
export type CloseOn = Record<string, CloseOnEntry>

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
