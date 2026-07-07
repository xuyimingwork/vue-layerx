import { describe, expect, it, vi } from 'vitest'
import { createLayer } from '@/index'
import { createLayerInstance } from '@/runtime/layer-instance'
import { flushPromises, withoutDom } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'

describe('createLayer / SSR', () => {
  it('should not throw when createLayerInstance.open is called without DOM', () => {
    withoutDom(() => {
      const instance = createLayerInstance({
        create: { container: { component: Container } },
        use: { content: { component: makeContent() } },
      })
      expect(() => instance.open({ props: { message: 'ssr' } })).not.toThrow()
      expect(instance.visible).toBe(true)
      expect(() => instance.unmount()).not.toThrow()
    })
  })

  it('should not throw when createLayer factory open is called without DOM', () => {
    withoutDom(() => {
      const useLayer = createLayer(Container)
      const instance = useLayer(makeContent())
      expect(() => instance.open()).not.toThrow()
      expect(instance.visible).toBe(true)
      instance.unmount()
    })
  })

  it('should mount on client when open is called without DOM then visible toggles after hydration', async () => {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)

    const instance = createLayerInstance({
      create: { container: { component: Container } },
      use: { content: { component: makeContent() } },
    })
    instance.open({ props: { message: 'deferred' } })

    vi.stubGlobal('document', originalDocument)
    instance.close()
    instance.open({ props: { message: 'deferred' } })

    await flushPromises()

    expect(document.body.querySelector('motion-dialog')).toBeTruthy()
    expect(document.body.querySelector('.msg')?.textContent).toBe('deferred')
    instance.unmount()
  })
})
