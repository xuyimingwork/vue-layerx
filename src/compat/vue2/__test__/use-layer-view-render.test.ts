import { describe, expect, it, vi } from 'vitest'
import { defineComponent, shallowRef, type Ref, type VNode } from 'vue'
import { MinimalContainer } from '@tests/fixtures/components'
import type { LayerBound } from '@/types'
import { LayerNoContainer } from '@/runtime/layer-no-container'
import { useLayerViewRender } from '../use-layer-view-render'

const StubContent = defineComponent({
  name: 'StubContent',
  setup() {
    return () => null
  },
})

/** Vue 2 `h` data shape as seen when the suite runs under Vue 3. */
function vue2Data(vnode: VNode) {
  return vnode.props as {
    props?: Record<string, unknown>
    on?: Record<string, unknown>
    scopedSlots?: Record<string, () => VNode | null>
    key?: unknown
  } | null
}

describe('useLayerViewRender (Vue 2.7 tree)', () => {
  function renderBound(bound: Ref<LayerBound>, openId?: number) {
    // Vue 2 path has no setup-only parking; safe to call outside setup.
    return useLayerViewRender(bound, shallowRef(true))(openId)
  }

  it('should nest content in the container default slot', () => {
    const tree = renderBound(
      shallowRef({
        container: {
          component: MinimalContainer,
          props: { modelValue: true },
          slots: {},
        },
        content: {
          component: StubContent,
          props: { message: 'hello' },
          slots: {},
        },
      } as LayerBound),
      1,
    ) as VNode

    expect(tree.type).toBe(MinimalContainer)
    const content = vue2Data(tree)?.scopedSlots?.default?.()
    expect(content?.type).toBe(StubContent)
    expect(vue2Data(content!)?.props?.message).toBe('hello')
    expect(vue2Data(content!)?.key).toBe(1)
  })

  it('should flatten LayerNoContainer and project container props onto content', () => {
    const onUpdate = vi.fn()
    const tree = renderBound(
      shallowRef({
        container: {
          component: LayerNoContainer,
          props: {
            modelValue: true,
            'onUpdate:modelValue': onUpdate,
            title: 'from-container',
            width: '480px',
          },
          slots: {},
        },
        content: {
          component: StubContent,
          props: {
            message: 'hello',
            width: '720px',
          },
          slots: {},
        },
      } as LayerBound),
      2,
    ) as VNode

    expect(tree.type).toBe(StubContent)
    const data = vue2Data(tree)
    expect(data?.props?.message).toBe('hello')
    expect(data?.props?.modelValue).toBe(true)
    expect(data?.props?.title).toBe('from-container')
    expect(data?.props?.width).toBe('720px')
    expect(data?.on?.['update:modelValue']).toBe(onUpdate)
    expect(data?.key).toBe(2)
  })
})
