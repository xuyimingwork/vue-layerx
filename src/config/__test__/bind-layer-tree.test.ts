import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { bindLayerTree } from '../bind-layer-tree'

const Container = defineComponent({ name: 'Container', setup: () => () => null })
const Content = defineComponent({ name: 'Content', setup: () => () => null })

describe('bindLayerTree', () => {
  it('should omit content when no content component is merged', () => {
    const bound = bindLayerTree({
      fragment: {
        content: {},
        container: { component: Container, props: { title: 'Shell' } },
      },
      visible: true,
      close: vi.fn(),
    })

    expect(bound.content).toBeUndefined()
    expect(bound.container.component).toBe(Container)
    expect(bound.container.props).toEqual({
      title: 'Shell',
      modelValue: true,
      'onUpdate:modelValue': expect.any(Function),
    })
  })

  it('should resolve content from merged use tier', () => {
    const bound = bindLayerTree({
      fragment: {
        content: { component: Content },
        container: { component: Container },
      },
      visible: false,
      close: vi.fn(),
    })

    expect(bound.content?.component).toBe(Content)
    expect(bound.container.props.modelValue).toBe(false)
  })

  it('should bind closeOn into content props', () => {
    const close = vi.fn()
    const bound = bindLayerTree({
      fragment: {
        content: { component: Content, closeOn: ['done'] },
        container: { component: Container },
      },
      visible: true,
      close,
    })

    bound.content?.props.onDone?.()
    expect(close).toHaveBeenCalled()
  })

  it('should bind custom model prop on container', () => {
    const close = vi.fn()
    const bound = bindLayerTree({
      fragment: {
        content: {},
        container: { component: Container, model: 'open' },
      },
      visible: true,
      close,
    })

    expect(bound.container.props.open).toBe(true)
    expect(bound.container.props['onUpdate:open']).toBeTypeOf('function')
    bound.container.props['onUpdate:open']?.(false)
    expect(close).toHaveBeenCalled()
  })

  it('should bind closeOn and model together', () => {
    const close = vi.fn()
    const bound = bindLayerTree({
      fragment: {
        content: { component: Content, closeOn: ['save'] },
        container: { component: Container, model: 'visible' },
      },
      visible: true,
      close,
    })

    expect(bound.container.props.visible).toBe(true)
    bound.content?.props.onSave?.()
    expect(close).toHaveBeenCalled()
  })
})
