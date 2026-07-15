import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { MinimalContainer } from '@tests/fixtures/components'
import { LayerNoContainer } from '../layer-no-container'
import { createLayerViewVNode } from '../layer-view'

const StubContent = defineComponent({
  name: 'StubContent',
  setup() {
    return () => null
  },
})

describe('createLayerViewVNode', () => {
  it('should mark content root with an internal Symbol prop', () => {
    const tree = createLayerViewVNode({
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
    })

    const contentVNode = tree.children?.default?.() as {
      props?: Record<PropertyKey, unknown>
    }
    const symbolKeys = Object.getOwnPropertySymbols(contentVNode?.props ?? {})
    expect(symbolKeys.some((key) => contentVNode?.props?.[key] === true)).toBe(true)
    expect(contentVNode?.props?.message).toBe('hello')
    expect(contentVNode?.props?.key).toBe(1)
  })

  it('should omit content branch when content is undefined', () => {
    const tree = createLayerViewVNode({
      container: {
        component: MinimalContainer,
        props: { modelValue: false },
        slots: {},
      },
    })

    const defaultSlot = tree.children?.default?.()
    expect(defaultSlot).toBeNull()
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
    })

    expect(tree!.type).toBe(StubContent)
    expect(tree!.props?.message).toBe('hello')
    expect(tree!.props?.modelValue).toBe(true)
    expect(tree!.props?.['onUpdate:modelValue']).toBe(onUpdate)
    expect(tree!.props?.width).toBe('720px')
    expect(tree!.props?.title).toBe('from-container')
    expect(tree!.props?.ref).toBe(contentRef)
    expect(tree!.props?.key).toBe(2)
  })
})
