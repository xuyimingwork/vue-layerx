import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { MinimalContainer } from '@tests/fixtures/components'
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
})
