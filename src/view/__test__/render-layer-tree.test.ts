import { describe, expect, it } from 'vitest'
import { LAYER_CONTENT } from '@/shared/contracts'
import { LayerContentMarker, MinimalContainer } from '@tests/fixtures/components'
import { renderLayerTree } from '../render-layer-tree'

describe('renderLayerTree', () => {
  it('should mark content root with LAYER_CONTENT', () => {
    const tree = renderLayerTree({
      container: {
        component: MinimalContainer,
        props: { modelValue: true },
        slots: {},
      },
      content: {
        component: LayerContentMarker,
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

  it('should omit content branch when content is undefined', () => {
    const tree = renderLayerTree({
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
