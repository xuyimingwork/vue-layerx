import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('layer config', () => {
  describe('merge priority', () => {
    it('should prefer open over use over create when tiers conflict', async () => {
      const useLayer = createLayer(Container, {
        props: { title: 'Default', width: '400px' },
      })
      const Content = makeContent(true)
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content, {
            container: { props: { width: '640px' } },
          })
          onMounted(() =>
            dialog.open({
              props: { message: 'merged' },
              container: { props: { title: 'FromShow' } },
            }),
          )
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      const el = queryBodyDialog()
      expect(el?.getAttribute('data-title')).toBe('FromShow')
      expect(el?.getAttribute('data-width')).toBe('640px')
    })
  })

  describe('open tier', () => {
    it('should update content props without remounting when open is called while visible', async () => {
      const useLayer = createLayer(Container)
      let setupCount = 0

      const Content = defineComponent({
        name: 'RemountContent',
        props: { message: String },
        setup(props) {
          setupCount++
          return () => h('span', { class: 'msg' }, props.message)
        },
      })

      let dialog!: LayerInstance
      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ props: { message: 'first' } })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(setupCount).toBe(1)

      dialog.open({ props: { message: 'second' } })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(setupCount).toBe(1)
      expect(document.body.querySelector('.msg')?.textContent).toBe('second')
    })

    it('should fall back to lower merge tiers when open is called without config', async () => {
      const useLayer = createLayer(Container, {
        content: { props: { message: 'default-msg' } },
      })
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ props: { message: 'override' } })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(document.body.querySelector('.msg')?.textContent).toBe('override')

      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(document.body.querySelector('.msg')?.textContent).toBe('default-msg')
    })
  })
})
