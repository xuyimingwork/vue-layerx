import { h, type VNode } from 'vue'
import { LAYER_CONTENT } from '@/shared/contracts'
import type { LayerNormalized } from '@/types'

export interface RenderLayerTreeOptions extends LayerNormalized {
  contentMountKey?: number
}

export function renderLayerTree({
  container,
  content,
  contentMountKey,
}: RenderLayerTreeOptions): VNode {
  const defaultSlot = content
    ? () =>
        h(
          content.component,
          {
            ...content.props,
            key: contentMountKey,
            [LAYER_CONTENT]: true,
          },
          content.slots,
        )
    : () => null

  return h(container.component, container.props, {
    default: defaultSlot,
    ...container.slots,
  })
}
