import type { Component, Ref } from 'vue'
import type {
  CloseOnWhen,
  LayerAdapter,
  LayerRefCallback,
  LayerSlotRender,
} from './config'

export type { CloseOnWhen, LayerRefCallback }

/** object 形：when 必填（禁止无 when 的 confirmed） */
export type CloseOnPolicyObjectRaw = {
  when: CloseOnWhen
  confirmed?: boolean
}

/** 数组 object 条目 */
export type CloseOnEntryRaw = CloseOnPolicyObjectRaw & { event: string }

/**
 * User-facing closeOn sugar.
 * Array string = event name (always). Record value true/false/CloseOnWhen/object = policy sugar.
 * Bare array string `'none'` is an event named none, not a tombstone.
 */
export type CloseOnRaw =
  | Array<string | CloseOnEntryRaw>
  | Record<string, boolean | CloseOnWhen | CloseOnPolicyObjectRaw>

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
