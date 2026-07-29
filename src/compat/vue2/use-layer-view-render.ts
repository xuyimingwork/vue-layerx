import { h, type Component, type Ref, type VNode } from 'vue'
import type { LayerBound, LayerBoundNode } from '@/types'
import { LayerNoContainer } from '@/runtime/layer-no-container'
import { markLayerContent, toPlatformSlots, toPlatformVNodeData } from './platform-vnode'

/** Nested tree: container default holds content (D0.2). NoContainer → flat + full projection (D0.5). */
function createLayerViewVNode({
  container,
  content,
  openId,
}: LayerBound & { openId?: number }): VNode | null {
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
  return h(content.component as Component, {
    ...toPlatformVNodeData(flat),
    ...toPlatformSlots(content.slots ?? {}),
  })
}

/**
 * Setup-time: nested container/content tree (no Teleport / parking).
 * Same signature as Vue 3 so `LayerView` calls one compat export.
 */
export function useLayerViewRender(
  bound: Ref<LayerBound>,
  _visible: Ref<boolean>,
): (openId?: number) => VNode | null {
  return (openId) => {
    const { container, content } = bound.value
    return createLayerViewVNode({
      container,
      content,
      openId: content ? openId : undefined,
    })
  }
}
