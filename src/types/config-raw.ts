import type { Component, Ref } from 'vue'
import type {
  CloseOnWhen,
  LayerAdapter,
  LayerRefCallback,
  LayerSlotRender,
} from './config'
import type { LayerPropsInput, LooseProps, Simplify } from './component-props'

export type { CloseOnWhen, LayerRefCallback }
export type {
  LayerPropsInput,
  LooseProps,
  PropsOf,
  Simplify,
  AnyComponent,
} from './component-props'

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

/**
 * Public / Raw props — ref may be Ref or callback.
 * Loose path only; typed APIs use {@link LayerPropsInput} (no index signature).
 */
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
 * useX / open / clone content-oriented flat config (typed).
 * Top-level fields describe **content**; nested `container` describes the shell.
 */
export type LayerConfigContentOf<
  ContentP = LooseProps,
  ContainerP = LooseProps,
> = Simplify<{
  component?: Component
  props?: LayerPropsInput<ContentP>
  slots?: Record<string, LayerSlotRender>
  closeOn?: CloseOnRaw
  container?: Simplify<{
    component?: Component
    props?: LayerPropsInput<ContainerP>
    slots?: Record<string, LayerSlotRender>
    model?: string
  }>
}>

/**
 * defineLayer / createLayer container-oriented flat config (typed).
 * Top-level fields describe **container**; nested `content` is content defaults.
 */
export type LayerConfigContainerOf<
  ContainerP = LooseProps,
  ContentP = LooseProps,
> = Simplify<{
  component?: Component
  props?: LayerPropsInput<ContainerP>
  slots?: Record<string, LayerSlotRender>
  model?: string
  content?: Simplify<{
    component?: Component
    props?: LayerPropsInput<ContentP>
    slots?: Record<string, LayerSlotRender>
    closeOn?: CloseOnRaw
  }>
}>

/** createLayer second argument (typed). */
export type LayerConfigCreateOf<
  ContainerP = LooseProps,
  ContentP = LooseProps,
> = Simplify<
  LayerConfigContainerOf<ContainerP, ContentP> & {
    adapter?: LayerAdapter
  }
>

/** Untyped / default-loose aliases (backward compatible). */
export type LayerConfigContent = LayerConfigContentOf
export type LayerConfigContainer = LayerConfigContainerOf
export type LayerConfigCreate = LayerConfigCreateOf
