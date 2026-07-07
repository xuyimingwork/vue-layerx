import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('createLayer', () => {
  describe('factory', () => {
    it('should return a useLayer function that yields a LayerInstance', () => {
      const useLayer = createLayer(Container)
      const instance = useLayer(makeContent())

      expect(typeof useLayer).toBe('function')
      expect(typeof instance.open).toBe('function')
      expect(typeof instance.close).toBe('function')
      expect(typeof instance.clone).toBe('function')
    })

    it('should return independent instances when useLayer is called multiple times', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const first = useLayer(Content)
      const second = useLayer(Content)

      expect(first).not.toBe(second)

      let dialogA!: LayerInstance
      let dialogB!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialogA = first
          dialogB = second
          onMounted(() => {
            dialogA.open({ props: { message: 'a' } })
            dialogB.open({ props: { message: 'b' } })
          })
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(dialogA.visible).toBe(true)
      expect(dialogB.visible).toBe(true)
      expect(document.body.querySelectorAll('.msg')).toHaveLength(2)
    })
  })

  describe('create tier defaults', () => {
    it('should apply container props from factory config when layer is open', async () => {
      const useLayer = createLayer(Container, {
        props: { title: 'FactoryTitle', width: '480px' },
      })
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open({ props: { message: 'hi' } }))
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('FactoryTitle')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('480px')
    })

    it('should apply content props from factory config when layer is open', async () => {
      const useLayer = createLayer(Container, {
        content: { props: { message: 'default-msg' } },
      })
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(document.body.querySelector('.msg')?.textContent).toBe('default-msg')
    })
  })
})
