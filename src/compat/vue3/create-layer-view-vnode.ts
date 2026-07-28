import * as Vue from 'vue'
import type { Component, VNode } from 'vue'
import type { LayerBoundNode } from '@/types'
import type { CreateLayerViewVNodeOptions } from '@/compat/types'
import { LayerNoContainer } from '@/runtime/layer-no-container'
import { markLayerContent, toPlatformSlots, toPlatformVNodeData } from './platform-vnode'

const { h, Teleport } = Vue

export type { CreateLayerViewVNodeOptions }

/**
 * Teleport + parking tree (D0.2). Vue 2.7 uses a nested default-slot tree instead —
 * see `vue2/create-layer-view-vnode.ts`.
 */
export function createLayerViewVNode({
  container,
  content,
  openId,
  refContentTo,
}: CreateLayerViewVNodeOptions): VNode | (VNode | null)[] | null {
  const noContainer = container.component === LayerNoContainer
  const containerSlots = toPlatformSlots({
    ...container.slots,
    default: () =>
      h('layer-content-to', {
        ref: (el: unknown) => {
          if (refContentTo) refContentTo.value = el as HTMLUnknownElement
        },
        style: { display: 'contents' },
      }),
  })

  return [
    h(
      container.component as Component,
      noContainer ? {} : toPlatformVNodeData(container.props as Record<string | symbol, unknown>),
      containerSlots,
    ),
    refContentTo?.value
      ? h(Teleport as never, { to: refContentTo.value }, [
          createLayerViewContentVNode({
            key: openId,
            content:
              noContainer && content
                ? {
                    ...content,
                    props: {
                      ...container.props,
                      ...content.props,
                    },
                  }
                : content,
          }),
        ])
      : null,
  ]
}

function createLayerViewContentVNode({
  key,
  content,
}: {
  key: number | undefined
  content: LayerBoundNode | undefined
}) {
  if (!content) return null
  const props = markLayerContent({
    ...content.props,
    key,
  })
  return h(
    content.component as Component,
    toPlatformVNodeData(props),
    toPlatformSlots(content.slots ?? {}),
  )
}
