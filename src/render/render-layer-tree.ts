import { h, type VNode } from 'vue'
import { LAYERX_LAYER_CONTENT } from '@/content/layer-content'
import type { LayerRenderPlan } from '@/types'
import { bindContainerModel } from './bind-container-model'

export interface RenderLayerTreeOptions {
  plan: LayerRenderPlan
  contentMountKey?: number
}

export function renderLayerTree({
  plan,
  contentMountKey,
}: RenderLayerTreeOptions): VNode {
  const containerProps = bindContainerModel(
    plan.container.props,
    plan.visible,
    plan.model,
    plan.onClose,
  )

  const content = plan.content
  const defaultSlot = content
    ? () =>
        h(
          content.component,
          {
            ...content.props,
            key: contentMountKey,
            [LAYERX_LAYER_CONTENT]: true,
          },
          content.slots,
        )
    : () => null

  return h(plan.container.component, containerProps, {
    default: defaultSlot,
    ...plan.container.slots,
  })
}
