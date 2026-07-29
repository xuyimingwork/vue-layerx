import { describe, expect, it } from 'vitest'
import { createLayer } from 'vue-layerx'
import { withoutDom } from '../helpers/dom'
import { Container, makeContent } from '../fixtures/components'

describe('SSR (Vue 2.7)', () => {
  it('should skip mount without document', () => {
    const useLayer = createLayer(Container)
    withoutDom(() => {
      const dialog = useLayer(makeContent())
      expect(() => dialog.open({ props: { message: 'ssr' } })).not.toThrow()
      expect(dialog.visible).toBe(true)
      dialog.unmount()
    })
  })
})
