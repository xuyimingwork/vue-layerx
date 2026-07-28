import { h, type Component, type VNode } from 'vue'
import type { LayerBoundNode } from '@/types'
import type { CreateLayerViewVNodeOptions } from '@/compat/types'
import { LayerNoContainer } from '@/runtime/layer-no-container'
import { markLayerContent, toPlatformSlots, toPlatformVNodeData } from './platform-vnode'

export type { CreateLayerViewVNodeOptions }

/**
 * Nested tree: container default slot holds content (D0.2).
 * LayerNoContainer → flat h(content) with full prop projection (D0.5).
 * No Teleport / parking — `refContentTo` is ignored (see Vue 3 counterpart).
 */
export function createLayerViewVNode({
  container,
  content,
  openId,
}: CreateLayerViewVNodeOptions): VNode | null {
  const noContainer = container.component === LayerNoContainer

  if (noContainer) {
    if (!content) return null
    return createContentVNode({
      key: openId,
      content: {
        ...content,
        props: {
          ...container.props,
          ...content.props,
        },
      },
    })
  }

  const contentVNode = content
    ? createContentVNode({ key: openId, content })
    : null

  return h(container.component as Component, {
    ...toPlatformVNodeData(container.props as Record<string | symbol, unknown>),
    ...toPlatformSlots({
      ...container.slots,
      default: () => contentVNode as VNode,
    }),
  })
}

function createContentVNode({
  key,
  content,
}: {
  key: number | undefined
  content: LayerBoundNode
}) {
  const flat = markLayerContent({
    ...content.props,
    key,
  })
  return h(
    content.component as Component,
    {
      ...toPlatformVNodeData(flat),
      ...toPlatformSlots(content.slots ?? {}),
    },
  )
}
