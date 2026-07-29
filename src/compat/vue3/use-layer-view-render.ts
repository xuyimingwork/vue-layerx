import * as Vue from 'vue'
import {
  computed,
  onBeforeUnmount,
  ref,
  toRaw,
  type Component,
  type Ref,
  type VNode,
  type WritableComputedRef,
} from 'vue'
import type { LayerBound, LayerBoundNode } from '@/types'
import { toValue } from '@/compat/polyfill/to-value'
import { LayerNoContainer } from '@/runtime/layer-no-container'
import { markLayerContent, toPlatformSlots, toPlatformVNodeData } from './platform-vnode'

const { h, Teleport } = Vue

function useParkingElement(): HTMLUnknownElement {
  const el = document.createElement('layer-content-parking')
  el.style.display = 'none'
  document.body.appendChild(el)
  onBeforeUnmount(() => el.remove())
  return el
}

/** Anchor when present; otherwise hidden parking so Teleport never uses disabled/in-place. */
function useContentPlacement(
  bound: Ref<LayerBound>,
  visible: Ref<boolean>,
): WritableComputedRef<HTMLUnknownElement | undefined> {
  const anchor = ref<HTMLUnknownElement | null>(null)
  const parking = useParkingElement()
  const container = computed(() => toValue(bound).container?.component)
  const active = ref<Component | null>(null)

  return computed({
    get: () => {
      if (!active.value) return
      return anchor.value ?? (visible.value ? parking : undefined)
    },
    set: (el) => {
      anchor.value = el as HTMLUnknownElement | null
      const same = toRaw(active.value) === toRaw(container.value)
      active.value = !el && same ? null : container.value
    },
  })
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

/** Teleport + parking tree (D0.2). */
function createLayerViewVNode({
  container,
  content,
  openId,
  refContentTo,
}: LayerBound & {
  openId?: number
  refContentTo?: Ref<HTMLUnknownElement | undefined | null>
}): VNode | (VNode | null)[] | null {
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
      noContainer
        ? {}
        : toPlatformVNodeData(container.props as Record<string | symbol, unknown>),
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

/**
 * Setup-time: parking/anchor + Teleport tree. Call once in `LayerView` setup.
 */
export function useLayerViewRender(
  bound: Ref<LayerBound>,
  visible: Ref<boolean>,
): (openId?: number) => VNode | (VNode | null)[] | null {
  const refContentTo = useContentPlacement(bound, visible)
  return (openId) => {
    const { container, content } = bound.value
    return createLayerViewVNode({
      container,
      content,
      openId: content ? openId : undefined,
      refContentTo,
    })
  }
}
