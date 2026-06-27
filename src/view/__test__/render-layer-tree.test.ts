import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { LAYER_CONTENT } from '@/shared/contracts'
import { renderLayerTree } from '../render-layer-tree'

const Container = defineComponent({
  name: 'Container',
  props: { modelValue: Boolean },
  setup(_props, { slots }) {
    return () => slots.default?.()
  },
})

const Content = defineComponent({
  name: 'Content',
  props: { [LAYER_CONTENT]: Boolean },
  setup() {
    return () => null
  },
})

describe('renderLayerTree', () => {
  it('marks content root with LAYER_CONTENT', () => {
    const tree = renderLayerTree({
      container: {
        component: Container,
        props: { modelValue: true },
        slots: {},
      },
      content: {
        component: Content,
        props: { message: 'hello' },
        slots: {},
      },
      contentMountKey: 1,
    })

    const contentVNode = tree.children?.default?.() as {
      props?: Record<PropertyKey, unknown>
    }
    expect(contentVNode?.props?.[LAYER_CONTENT]).toBe(true)
    expect(contentVNode?.props?.message).toBe('hello')
    expect(contentVNode?.props?.key).toBe(1)
  })

  it('omits content branch when content is undefined', () => {
    const tree = renderLayerTree({
      container: {
        component: Container,
        props: { modelValue: false },
        slots: {},
      },
    })

    const defaultSlot = tree.children?.default?.()
    expect(defaultSlot).toBeNull()
  })
})
