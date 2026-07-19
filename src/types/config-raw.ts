import type { Component, Ref } from 'vue'
import type {
  LayerAdapter,
  LayerRefCallback,
  LayerSlotRender,
} from './config'

/** User-facing closeOn sugar; same shape as CloseOn this round */
export type CloseOnRaw = string[]

export type { LayerRefCallback }

/** Public / Raw props — ref may be Ref or callback */
export interface LayerPropsRaw {
  ref?: LayerRefCallback | Ref<unknown>
  [key: string]: unknown
}

export interface LayerConfigNodeRaw {
  component?: Component
  props?: LayerPropsRaw
  /** slot content: imperative or LayerTemplate materialized at merge */
  slots?: Record<string, LayerSlotRender>
}

/** Container node (Raw) — model = v-model prop name */
export interface LayerConfigNodeContainerRaw extends LayerConfigNodeRaw {
  model?: string
}

/** Content node (Raw) — closeOn = content emit → layer.close() */
export interface LayerConfigNodeContentRaw extends LayerConfigNodeRaw {
  closeOn?: CloseOnRaw
}

/**
 * defineLayer / createLayer container-oriented flat config
 * 顶层为 container 配置属性
 */
export interface LayerConfigContainer extends LayerConfigNodeContainerRaw {
  content?: LayerConfigNodeContentRaw
}

/**
 * useX / open / clone content-oriented flat config
 * 顶层为 content 配置属性
 */
export interface LayerConfigContent extends LayerConfigNodeContentRaw {
  container?: LayerConfigNodeContainerRaw
}

/**
 * createLayer 的配置
 */
export type LayerConfigCreate = LayerConfigContainer & {
  adapter?: LayerAdapter
}
