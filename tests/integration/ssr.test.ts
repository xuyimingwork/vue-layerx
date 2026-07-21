import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createLayer } from '@/index'
import { flushPromises, withoutDom } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('SSR', () => {
  it('should not throw when factory open is called without DOM', () => {
    withoutDom(() => {
      const useLayer = createLayer(Container)
      const instance = useLayer(makeContent())
      expect(() => instance.open()).not.toThrow()
      expect(instance.visible.value).toBe(true)
      instance.unmount()
    })
  })

  it('should not mount portal when open is called without DOM', async () => {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)

    const useLayer = createLayer(Container)
    const instance = useLayer(makeContent())
    try {
      expect(() => instance.open()).not.toThrow()
      expect(instance.visible.value).toBe(true)

      await nextTick()
      await flushPromises()
      expect(document).toBeUndefined()

      vi.stubGlobal('document', originalDocument)

      expect(queryBodyDialog()).toBeNull()
      expect(document.body.querySelectorAll(':scope > div')).toHaveLength(0)
    } finally {
      vi.stubGlobal('document', originalDocument)
      instance.unmount()
    }
  })
})
