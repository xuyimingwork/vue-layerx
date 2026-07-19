import type { Component } from 'vue'
import type { LayerProps, LayerSlotRender } from './config'

/** bind output node — props include closeOn / model bindings, ready for h() */
export interface LayerBoundNode {
  component: Component
  props: LayerProps
  slots: Record<string, LayerSlotRender>
}

export interface LayerBound {
  content?: LayerBoundNode
  container: LayerBoundNode
}
