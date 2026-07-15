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
): [VNode, VNode] {
  expect(Array.isArray(tree)).toBe(true)
  return tree as [VNode, VNode]
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

    expect(teleportVNode.type).toBe(Teleport)
    expect(teleportVNode.props?.to).toBe(target)
    expect(teleportVNode.props?.defer).toBe(true)
    expect(teleportVNode.props?.disabled).toBe(false)

    const contentVNode = (teleportVNode.children as VNode[])?.[0]
    const contentProps = contentVNode?.props as
      | Record<PropertyKey, unknown>
      | undefined
    const symbolKeys = Object.getOwnPropertySymbols(contentProps ?? {})
    expect(symbolKeys.some((key) => contentProps?.[key] === true)).toBe(true)
    expect(contentProps?.message).toBe('hello')
    expect(contentProps?.key).toBe(1)
  })

  it('should keep teleport disabled until refContentTo is set', () => {
    const refContentTo = ref<HTMLUnknownElement | null>(null)
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

    expect(teleportVNode.type).toBe(Teleport)
    expect(teleportVNode.props?.to).toBeNull()
    expect(teleportVNode.props?.defer).toBe(true)
    expect(teleportVNode.props?.disabled).toBe(true)
    expect((teleportVNode.children as VNode[])?.[0]?.type).toBe(StubContent)
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

    expect(teleportVNode.type).toBe(Teleport)
    expect((teleportVNode.children as VNode[])?.[0]).toBeNull()
  })

  it('should flatten LayerNoContainer with content props overriding container', () => {
    const contentRef = vi.fn()
    const onUpdate = vi.fn()
    const tree = createLayerViewVNode({
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
      refContentTo: ref(null),
    }) as VNode

    const props = tree.props as Record<PropertyKey, unknown>
    expect(tree.type).toBe(StubContent)
    expect(props.message).toBe('hello')
    expect(props.modelValue).toBe(true)
    expect(props['onUpdate:modelValue']).toBe(onUpdate)
    expect(props.width).toBe('720px')
    expect(props.title).toBe('from-container')
    expect(props.ref).toBe(contentRef)
    expect(props.key).toBe(2)

    const symbolKeys = Object.getOwnPropertySymbols(props)
    expect(symbolKeys.some((key) => props[key] === true)).toBe(false)
  })
})

