import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { defaultResolve } from '../default-resolve'

const Container = defineComponent({ name: 'Container', setup: () => () => null })
const Content = defineComponent({ name: 'Content', setup: () => () => null })

describe('defaultResolve', () => {
  it('omits content when no content component is merged', () => {
    const resolved = defaultResolve({
      merged: {
        content: {},
        container: { component: Container, props: { title: 'Shell' } },
      },
      close: vi.fn(),
    })

    expect(resolved.content).toBeUndefined()
    expect(resolved.container.component).toBe(Container)
    expect(resolved.container.props).toEqual({ title: 'Shell' })
  })

  it('resolves content from merged use tier', () => {
    const resolved = defaultResolve({
      merged: {
        content: { component: Content },
        container: { component: Container },
      },
      close: vi.fn(),
    })

    expect(resolved.content?.component).toBe(Content)
  })

  it('binds closeOn into content props', () => {
    const close = vi.fn()
    const resolved = defaultResolve({
      merged: {
        content: { component: Content, closeOn: ['done'] },
        container: { component: Container },
      },
      close,
    })

    resolved.content?.props.onDone?.()
    expect(close).toHaveBeenCalled()
  })
})
