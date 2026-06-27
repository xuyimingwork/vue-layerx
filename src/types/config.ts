import type { Component, VNode } from 'vue'

export type LayerProps = Record<string, unknown>

export type SlotRenderFn = (
  props?: Record<string, unknown>,
) => VNode | VNode[] | null

/** Content emit names that trigger layer.close(); extended forms allow conditional close */
export type CloseOnConfig = string[]

/** merge / config fragment building blocks */
export interface LayerConfigNodeBase {
  component?: Component
  props?: LayerProps
  /** slot content: imperative or LayerTemplate materialized at merge */
  slots?: Record<string, SlotRenderFn>
}

/** Container node — model = v-model prop name (event: onUpdate:${model}) */
export type LayerConfigNodeContainer = LayerConfigNodeBase & {
  model?: string
}

/** Content node — closeOn = content emit → layer.close() */
export type LayerConfigNodeContent = LayerConfigNodeBase & {
  closeOn?: CloseOnConfig
}

export interface LayerTemplateEntry {
  render: SlotRenderFn
}

/** single merge tier: content + container fragments */
export interface LayerConfigFragment {
  content?: LayerConfigNodeContent
  container?: LayerConfigNodeContainer
}

/** createLayer + defineLayer — top-level fields = container */
export type LayerConfigStatic = LayerConfigNodeContainer & {
  content?: LayerConfigNodeContent
}

/** useX / open / clone — top-level fields = content */
export type LayerConfigInstance = LayerConfigNodeContent & {
  container?: LayerConfigNodeContainer
}

/** merge phase output */
export interface LayerMerged {
  content: LayerConfigNodeContent
  container: LayerConfigNodeContainer
}

/** bind output — props include closeOn / model bindings, ready for h() */
export interface LayerNodeNormalized {
  component: Component
  props: LayerProps
  slots: Record<string, SlotRenderFn>
}

export interface LayerNormalized {
  content?: LayerNodeNormalized
  container: LayerNodeNormalized
}

export type LayerAdapter = (merged: LayerMerged) => LayerMerged

/** createLayer second argument only; adapter is not valid on defineLayer / use / open / clone */
export type LayerConfigCreate = LayerConfigStatic & {
  adapter?: LayerAdapter
}

export const DEFAULT_CONTAINER_MODEL = 'modelValue' as const
