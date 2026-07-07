import { describe, expect, it } from 'vitest'
import { createLayer } from '@/index'
import { withoutDom } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'

describe('SSR', () => {
  it('should not throw when factory open is called without DOM', () => {
    withoutDom(() => {
      const useLayer = createLayer(Container)
      const instance = useLayer(makeContent())
      expect(() => instance.open()).not.toThrow()
      expect(instance.visible).toBe(true)
      instance.unmount()
    })
  })
})
