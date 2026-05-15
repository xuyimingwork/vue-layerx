import type { Component, VNode } from 'vue'

export type LayerProps = Record<string, unknown>

export interface LayerShellOptions {
  /** Props merged into the shell on every open (e.g. ElDialog title, width). */
  props?: LayerProps
  /** Prop on the shell that controls visibility; default `modelValue`. */
  visibleProp?: string
  /** Event emitted when the shell requests close; default `update:modelValue`. */
  visibleEvent?: string
}

export interface LayerInstanceOptions {
  /** Default props for the inner component. */
  props?: LayerProps
  /**
   * Inner component event names that close the layer when emitted.
   * @example ['submit', 'cancel']
   */
  closeOn?: string[]
  /** Extra props for the shell on this instance only. */
  shellProps?: LayerProps
}

export interface LayerController {
  show: (payload?: LayerProps) => void
  hide: () => void
  readonly visible: boolean
}

export type LayerComponent = Component & LayerController

export type SlotRenderFn = () => VNode | VNode[] | null
