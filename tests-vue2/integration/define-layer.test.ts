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

  describe('content swap clears define', () => {
    const CompA = defineComponent({
      name: 'CompAWithDefine',
      setup() {
        defineLayer({
          props: { title: 'A的标题', width: '800px' },
        })
        return () => h('div', { class: 'content-a' }, 'A')
      },
    })

    const CompB = defineComponent({
      name: 'CompBWithoutDefine',
      setup() {
        return () => h('div', { class: 'content-b' }, 'B')
      },
    })

    it('should drop defineLayer container props when open swaps content while visible', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>

      const host = mountSetup(() => {
        dialog = createLayer(Container)()
      })

      dialog.open({ component: CompA })
      await flushPromises()

      expect(document.body.querySelector('.content-a')).toBeTruthy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('A的标题')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('800px')

      dialog.open({ component: CompB })
      await flushPromises()

      expect(document.body.querySelector('.content-b')).toBeTruthy()
      expect(document.body.querySelector('.content-a')).toBeFalsy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBeFalsy()
      expect(queryBodyDialog()?.getAttribute('data-width')).toBeFalsy()

      host.destroy()
    })

    it('should drop defineLayer container props when reopen with content that has no defineLayer', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>

      const host = mountSetup(() => {
        dialog = createLayer(Container)()
      })

      dialog.open({ component: CompA })
      await flushPromises()

      dialog.close()
      await flushPromises()

      dialog.open({ component: CompB })
      await flushPromises()

      expect(document.body.querySelector('.content-b')).toBeTruthy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBeFalsy()
      expect(queryBodyDialog()?.getAttribute('data-width')).toBeFalsy()

      host.destroy()
    })
  })
})
