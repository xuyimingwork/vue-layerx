import { h, type VNode } from 'vue'
import { LAYERX_DIRECT_CONTENT } from '../../../domain/constants/markers'
import type { LayerRenderPlan } from '../../domain/types'
import { buildVisibleProps } from './build-visible-props'

export function renderLayerTree(plan: LayerRenderPlan, hasContent: boolean): VNode {
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
            key: plan.content.props.__layerContentKey,
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
