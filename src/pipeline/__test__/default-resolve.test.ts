import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { defaultResolve } from '../default-resolve'

const Container = defineComponent({ name: 'Container', setup: () => () => null })
const Content = defineComponent({ name: 'Content', setup: () => () => null })

describe('defaultResolve', () => {
  it('omits content when no content component is bound or merged', () => {
    const resolved = defaultResolve({
      merged: {
        content: {},
        container: { props: { title: 'Shell' } },
      },
      Container,
      hide: vi.fn(),
    })

    expect(resolved.content).toBeUndefined()
    expect(resolved.container.component).toBe(Container)
    expect(resolved.container.props).toEqual({ title: 'Shell' })
  })

  it('resolves bound content from useLayer', () => {
    const resolved = defaultResolve({
      merged: { content: {}, container: {} },
      Container,
      boundContent: Content,
      hide: vi.fn(),
    })

    expect(resolved.content?.component).toBe(Content)
  })

  it('prefers merged content component over bound content', () => {
    const Override = defineComponent({ name: 'Override', setup: () => () => null })

    const resolved = defaultResolve({
      merged: { content: { component: Override }, container: {} },
      Container,
      boundContent: Content,
      hide: vi.fn(),
    })

    expect(resolved.content?.component).toBe(Override)
  })
})
