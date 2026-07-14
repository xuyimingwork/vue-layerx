import { defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('reactive layer config', () => {
  describe('useLayer', () => {
    it('should update content props from getter without re-open', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const recordId = ref('a')
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content, () => ({
            props: { message: recordId.value },
          }))
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()
      expect(document.body.querySelector('.msg')?.textContent).toBe('a')

      recordId.value = 'b'
      await nextTick()
      await flushPromises()
      expect(document.body.querySelector('.msg')?.textContent).toBe('b')
    })
  })

  describe('defineLayer', () => {
    it('should update container title from getter without remounting content', async () => {
      const useLayer = createLayer(Container)
      const left = ref(3)
      let setupCount = 0
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'CountdownContent',
        setup() {
          setupCount++
          defineLayer(() => ({
            props: { title: `left-${left.value}` },
          }))
          return () => h('span', { class: 'msg' }, 'body')
        },
      })

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('left-3')
      expect(setupCount).toBe(1)

      left.value = 2
      await nextTick()
      await flushPromises()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('left-2')
      expect(setupCount).toBe(1)
    })
  })

  describe('createLayer', () => {
    it('should update create-tier container props from getter', async () => {
      const width = ref('400px')
      const useLayer = createLayer(Container, () => ({
        props: { width: width.value, title: 'factory' },
      }))
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(makeContent())
          onMounted(() => dialog.open({ props: { message: 'x' } }))
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')

      width.value = '600px'
      await nextTick()
      await flushPromises()
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('600px')
    })
  })

  describe('clone', () => {
    it('should keep following parent use for fields not overridden', async () => {
      const useLayer = createLayer(Container)
      const locale = ref('zh')
      const otherId = ref('2')
      let parent!: LayerInstance
      let child!: LayerInstance

      const Host = defineComponent({
        setup() {
          parent = useLayer(makeContent(), () => ({
            props: { message: `id-1-${locale.value}` },
          }))
          child = parent.clone(() => ({
            props: { message: `id-${otherId.value}-${locale.value}` },
          }))
          onMounted(() => {
            parent.open()
            child.open()
          })
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      const msgs = [...document.body.querySelectorAll('.msg')].map((el) => el.textContent)
      expect(msgs).toContain('id-1-zh')
      expect(msgs).toContain('id-2-zh')

      locale.value = 'en'
      await nextTick()
      await flushPromises()

      const msgsAfter = [...document.body.querySelectorAll('.msg')].map((el) => el.textContent)
      expect(msgsAfter).toContain('id-1-en')
      expect(msgsAfter).toContain('id-2-en')
    })
  })
})
