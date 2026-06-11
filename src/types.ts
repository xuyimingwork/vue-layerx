import type { Component, Ref, VNode } from 'vue'

export type LayerProps = Record<string, unknown>

/** [visibleProp, visibleEventHandlerProp] e.g. ['modelValue', 'onUpdate:modelValue'] */
export type VisibleProtocol = [string, string]

export interface LayerShellOptions {
  /** Shell visibility prop / event protocol */
  visible?: VisibleProtocol
  /** Default props passed to Shell */
  props?: LayerProps
}

export interface LayerBindOptions {
  /** Shell default props (definition side) */
  props?: LayerProps
  /** Shell slot name → LayerSlot ref */
  slots?: Record<string, Ref<LayerSlotInstance | undefined>>
  /** Inner emit names that auto-hide the layer */
  hideOn?: string[]
}

export interface LayerUseOptions {
  /** Inner default props */
  props?: LayerProps
  /** Shell props override */
  layer?: { props?: LayerProps }
  /** Override bind hideOn behavior */
  hideOn?: string[]
}

export interface LayerShowPayload extends LayerProps {
  layer?: { props?: LayerProps }
  hideOn?: string[]
}

export interface LayerSlotInstance {
  render: () => VNode | VNode[] | null
}

export interface LayerInstance {
  show: (payload?: LayerShowPayload) => void
  hide: () => void
  clone: (partial?: LayerUseOptions) => LayerInstance
  readonly visible: boolean
}

export interface LayerContext {
  registerBind: (config: LayerBindOptions) => void
  bumpSlots: () => void
  readonly slotsVersion: number
}
