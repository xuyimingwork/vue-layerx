import type { LayerNormalized, LayerRenderPlan } from '../types/layer'

export interface ToRenderPlanContext {
  normalized: LayerNormalized
  visible: boolean
  visibleProp: string
  visibleEvent: string
  onHide: () => void
}

export function toRenderPlan(ctx: ToRenderPlanContext): LayerRenderPlan {
  return {
    ...ctx.normalized,
    visible: ctx.visible,
    visibleProp: ctx.visibleProp,
    visibleEvent: ctx.visibleEvent,
    onHide: ctx.onHide,
  }
}
