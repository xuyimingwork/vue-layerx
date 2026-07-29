import { describe, expect, it, vi } from 'vitest'
import { defineComponent, shallowRef, Teleport, type Ref, type VNode } from 'vue'
import { mount } from '@vue/test-utils'
import { MinimalContainer } from '@tests/fixtures/components'
import type { LayerBound } from '@/types'
import { LayerNoContainer } from '@/shared/layer-no-container'
import { useLayerViewRender } from '@/compat/vue3/use-layer-view-render'

const StubContent = defineComponent({
  name: 'StubContent',
  setup() {
    return () => null
  },
})

const OtherContainer = defineComponent({
  name: 'OtherContainer',
  setup(_, { slots }) {
    return () => slots.default?.() ?? null
  },
})

type RenderFn = ReturnType<typeof useLayerViewRender>

function setupRender(
  bound: Ref<LayerBound>,
  visible: Ref<boolean> = shallowRef(true),
): { render: RenderFn; unmount: () => void } {
  let render!: RenderFn
  const wrapper = mount(
    defineComponent({
      setup() {
        render = useLayerViewRender(bound, visible)
        return () => null
      },
    }),
  )
  return {
    render,
    unmount: () => wrapper.unmount(),
  }
}

function asArrayTree(tree: ReturnType<RenderFn>): [VNode, VNode | null] {
  expect(Array.isArray(tree)).toBe(true)
  return tree as [VNode, VNode | null]
}

function setAnchor(containerVNode: VNode, el: HTMLUnknownElement | null) {
  const anchor = (
    containerVNode.children as { default?: () => VNode }
  ).default?.()
  const anchorRef = anchor?.props?.ref as ((el: unknown) => void) | undefined
  expect(anchorRef).toBeTypeOf('function')
  anchorRef!(el)
}

describe('useLayerViewRender (Vue 3)', () => {
  it('should omit teleport before the anchor is set', () => {
    const bound = shallowRef({
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
    } as LayerBound)
    const { render, unmount } = setupRender(bound)
    const [containerVNode, teleportVNode] = asArrayTree(render(1))

    expect(containerVNode.type).toBe(MinimalContainer)
    expect(teleportVNode).toBeNull()
    unmount()
  })

  it('should place a layer-content-to anchor and teleport marked content', () => {
    const bound = shallowRef({
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
    } as LayerBound)
    const { render, unmount } = setupRender(bound)
    const target = document.createElement('div')

    const [containerBefore] = asArrayTree(render(1))
    setAnchor(containerBefore, target)

    const [containerVNode, teleportVNode] = asArrayTree(render(1))
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
    unmount()
  })

  it('should teleport to parking when container changes before the new anchor mounts', () => {
    const bound = shallowRef({
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
    } as LayerBound)
    const { render, unmount } = setupRender(bound)
    const target = document.createElement('div')

    setAnchor(asArrayTree(render(1))[0], target)

    bound.value = {
      ...bound.value,
      container: {
        component: OtherContainer,
        props: { modelValue: true },
        slots: {},
      },
    }
    setAnchor(asArrayTree(render(1))[0], null)

    const [, teleportVNode] = asArrayTree(render(1))
    expect(teleportVNode?.type).toBe(Teleport)
    expect((teleportVNode?.props?.to as HTMLElement)?.tagName).toBe(
      'LAYER-CONTENT-PARKING',
    )
    expect(teleportVNode?.props?.defer).toBeUndefined()
    expect((teleportVNode?.children as VNode[])?.[0]?.type).toBe(StubContent)
    unmount()
  })

  it('should omit content branch when content is undefined', () => {
    const bound = shallowRef({
      container: {
        component: MinimalContainer,
        props: { modelValue: false },
        slots: {},
      },
    } as LayerBound)
    const { render, unmount } = setupRender(bound)
    const target = document.createElement('div')

    setAnchor(asArrayTree(render())[0], target)

    const [, teleportVNode] = asArrayTree(render())
    expect(teleportVNode?.type).toBe(Teleport)
    expect((teleportVNode?.children as VNode[])?.[0]).toBeNull()
    unmount()
  })

  it('should use Teleport tree for LayerNoContainer and project props onto content', () => {
    const contentRef = vi.fn()
    const onUpdate = vi.fn()
    const bound = shallowRef({
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
    } as LayerBound)
    const { render, unmount } = setupRender(bound)
    const target = document.createElement('div')

    setAnchor(asArrayTree(render(2))[0], target)

    const [containerVNode, teleportVNode] = asArrayTree(render(2))
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
    unmount()
  })
})
