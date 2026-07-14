import { describe, expect, it, vi } from 'vitest'
import { createLayerStore } from '@/shared/layer-store'

describe('createLayerStore', () => {
  it('should skip missing buckets when tracking', () => {
    const store = createLayerStore({
      define: { content: { props: { a: 1 } } },
    })
    delete (store as { define?: unknown }).define

    expect(() => store.track()).not.toThrow()
  })

  it('should no-op template registration when bucket is missing', () => {
    const store = createLayerStore({
      define: {},
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    store.template({
      key: 'missing.container' as never,
      name: 'footer',
      entry: { render: () => null },
    })

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
