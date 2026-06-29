import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLayer } from '@/index'
import { createLayerInstance } from '@/runtime/layer-instance'
import { Container, makeContent } from '../fixtures/components'

afterEach(() => {
  document.body.innerHTML = ''
})

function withoutDom<T>(run: () => T): T {
  const originalDocument = globalThis.document
  vi.stubGlobal('document', undefined)
  try {
    return run()
  } finally {
    vi.stubGlobal('document', originalDocument)
  }
}

describe('SSR compatibility', () => {
  it('createLayerInstance.open without DOM does not throw', () => {
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

  it('createLayer factory without DOM does not throw on open', () => {
    withoutDom(() => {
      const useLayer = createLayer(Container)
      const instance = useLayer(makeContent())
      expect(() => instance.open()).not.toThrow()
      expect(instance.visible).toBe(true)
      instance.unmount()
    })
  })

  it('open without DOM then client mount via visible toggle', () => {
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

    expect(document.body.querySelector('motion-dialog')).toBeTruthy()
    expect(document.body.querySelector('.msg')?.textContent).toBe('deferred')
    instance.unmount()
  })
})
