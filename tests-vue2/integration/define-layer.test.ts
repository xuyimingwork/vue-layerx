import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import { Container, queryBodyDialog } from '../fixtures/components'

describe('defineLayer (Vue 2.7)', () => {
  describe('in layer context', () => {
    it('should register defineLayer on content root', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>
      let exists = false

      const Content = defineComponent({
        name: 'DefineContent',
        setup() {
          exists = defineLayer({ props: { title: 'Defined' } }).exists
          return () => h('span', { class: 'defined' })
        },
      })

      const host = mountSetup(() => {
        dialog = createLayer(Container)(Content)
      })

      dialog.open()
      await flushPromises()
      expect(exists).toBe(true)
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Defined')
      host.destroy()
    })
  })
})
