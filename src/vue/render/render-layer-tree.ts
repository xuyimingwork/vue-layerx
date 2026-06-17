import { h, type VNode } from 'vue'
import { LAYERX_DIRECT_CONTENT } from '@/core/constants/markers'
import type { LayerRenderPlan } from '@/core/types'
import { buildVisibleProps } from './build-visible-props'

export interface RenderLayerTreeOptions {
  plan: LayerRenderPlan
  hasContent: boolean
  contentMountKey?: number
}

export function renderLayerTree({
  plan,
  hasContent,
  contentMountKey,
}: RenderLayerTreeOptions): VNode {
  const layerProps = buildVisibleProps(
    plan.layer.props,
    plan.visible,
    plan.visibleProp,
    plan.visibleEvent,
    plan.onHide,
  )

  const defaultSlot = hasContent
    ? () =>
        h(
          plan.content.component,
          {
            ...plan.content.props,
            key: contentMountKey,
            [LAYERX_DIRECT_CONTENT]: true,
          },
          plan.content.slots,
        )
    : () => null

  return h(plan.layer.component, layerProps, {
    default: defaultSlot,
    ...plan.layer.slots,
  })
}
