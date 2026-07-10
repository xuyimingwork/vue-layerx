import { describe, expect, it, vi } from 'vitest'
import { flushPromises, withoutDom } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'
import { getLayerTemplateTo } from '@/shared/layer-template-to'
import { createLayerInstance } from '../layer-instance'

describe('createLayerInstance', () => {
  describe('SSR', () => {
    it('should not throw when open is called without DOM', () => {
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

  describe('template handler', () => {
    it('should attach template handler that returns null local render', () => {
      const instance = createLayerInstance({
        create: { container: { component: Container } },
        use: { content: { component: makeContent() } },
      })

      const content = getLayerTemplateTo(instance).template({
        name: 'extra',
        container: false,
        render: () => 'vnode',
      })

      expect(content.render()).toBeNull()
    })
  })
})
