import { h, type VNode } from 'vue'
import { LAYERX_DIRECT_CONTENT } from '@/core/constants/markers'
import type { LayerRenderPlan } from '@/core/types'
import { buildVisibleProps } from './build-visible-props'

export interface RenderLayerTreeOptions {
  plan: LayerRenderPlan
  contentMountKey?: number
}

export function renderLayerTree({
  plan,
  contentMountKey,
}: RenderLayerTreeOptions): VNode {
  const containerProps = buildVisibleProps(
    plan.container.props,
    plan.visible,
    plan.visibleProp,
    plan.visibleEvent,
    plan.onHide,
  )

  const content = plan.content
  const defaultSlot = content
    ? () =>
        h(
          content.component,
          {
            ...content.props,
            key: contentMountKey,
            [LAYERX_DIRECT_CONTENT]: true,
          },
          content.slots,
        )
    : () => null

  return h(plan.container.component, containerProps, {
    default: defaultSlot,
    ...plan.container.slots,
  })
}
