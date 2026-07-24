import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref, Teleport, type VNode } from 'vue'
import { MinimalContainer } from '@tests/fixtures/components'
import { LayerNoContainer } from '../layer-no-container'
import { createLayerViewVNode } from '../layer-view'

const StubContent = defineComponent({
  name: 'StubContent',
  setup() {
    return () => null
  },
})

function asArrayTree(
  tree: ReturnType<typeof createLayerViewVNode>,
): [VNode, VNode | null] {
  expect(Array.isArray(tree)).toBe(true)
  return tree as [VNode, VNode | null]
}

describe('createLayerViewVNode', () => {
  it('should place a layer-content-to anchor and teleport marked content', () => {
    const target = document.createElement('div')
    const refContentTo = ref<HTMLUnknownElement | null>(target)
    const [containerVNode, teleportVNode] = asArrayTree(
      createLayerViewVNode({
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
        openId: 1,
        refContentTo,
      }),
    )

    expect(containerVNode.type).toBe(MinimalContainer)
    const anchor = (
      containerVNode.children as { default?: () => VNode }
    ).default?.()
    expect(anchor?.type).toBe('layer-content-to')
    expect(anchor?.props?.style).toEqual({ display: 'contents' })

    expect(teleportVNode?.type).toBe(Teleport)
    expect(teleportVNode?.props?.to).toBe(target)
    expect(teleportVNode?.props?.defer).toBeUndefined()
    expect(teleportVNode?.props?.disabled).toBeUndefined()

    const contentVNode = (teleportVNode?.children as VNode[])?.[0]
    const contentProps = contentVNode?.props as
      | Record<PropertyKey, unknown>
      | undefined
    const symbolKeys = Object.getOwnPropertySymbols(contentProps ?? {})
    expect(symbolKeys.some((key) => contentProps?.[key] === true)).toBe(true)
    expect(contentProps?.message).toBe('hello')
    expect(contentProps?.key).toBe(1)
  })

  it('should omit teleport when refContentTo is empty', () => {
    const refContentTo = ref<HTMLUnknownElement | null>(null)
    const [containerVNode, teleportVNode] = asArrayTree(
      createLayerViewVNode({
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
        openId: 1,
        refContentTo,
      }),
    )

    expect(containerVNode.type).toBe(MinimalContainer)
    expect(teleportVNode).toBeNull()
  })

  it('should teleport to parking target when refContentTo is set to parking', () => {
    const parking = document.createElement('layer-content-parking')
    parking.style.display = 'none'
    const refContentTo = ref<HTMLUnknownElement | null>(parking)
    const [, teleportVNode] = asArrayTree(
      createLayerViewVNode({
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
        openId: 1,
        refContentTo,
      }),
    )

    expect(teleportVNode?.type).toBe(Teleport)
    expect(teleportVNode?.props?.to).toBe(parking)
    expect(teleportVNode?.props?.defer).toBeUndefined()
    expect((teleportVNode?.children as VNode[])?.[0]?.type).toBe(StubContent)
  })

  it('should omit content branch when content is undefined', () => {
    const target = document.createElement('div')
    const refContentTo = ref<HTMLUnknownElement | null>(target)
    const [, teleportVNode] = asArrayTree(
      createLayerViewVNode({
        container: {
          component: MinimalContainer,
          props: { modelValue: false },
          slots: {},
        },
        refContentTo,
      }),
    )

    expect(teleportVNode?.type).toBe(Teleport)
    expect((teleportVNode?.children as VNode[])?.[0]).toBeNull()
  })

  it('should use Teleport tree for LayerNoContainer and project props onto content', () => {
    const contentRef = vi.fn()
    const onUpdate = vi.fn()
    const target = document.createElement('div')
    const refContentTo = ref<HTMLUnknownElement | null>(target)
    const [containerVNode, teleportVNode] = asArrayTree(
      createLayerViewVNode({
        container: {
          component: LayerNoContainer,
          props: {
            modelValue: true,
            'onUpdate:modelValue': onUpdate,
            width: '480px',
            title: 'from-container',
          },
          slots: {},
        },
        content: {
          component: StubContent,
          props: {
            message: 'hello',
            width: '720px',
            ref: contentRef,
          },
          slots: {},
        },
        openId: 2,
        refContentTo,
      }),
    )

    expect(containerVNode.type).toBe(LayerNoContainer)
    expect(containerVNode.props).toEqual({})

    const contentVNode = (teleportVNode?.children as VNode[])?.[0]
    const props = contentVNode?.props as Record<PropertyKey, unknown>
    expect(contentVNode?.type).toBe(StubContent)
    expect(props.message).toBe('hello')
    expect(props.modelValue).toBe(true)
    expect(props['onUpdate:modelValue']).toBe(onUpdate)
    expect(props.width).toBe('720px')
    expect(props.title).toBe('from-container')
    expect(props.ref).toBe(contentRef)
    expect(props.key).toBe(2)

    const symbolKeys = Object.getOwnPropertySymbols(props)
    expect(symbolKeys.some((key) => props[key] === true)).toBe(true)
  })
})
