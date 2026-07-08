import { defineComponent, h, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('useLayer', () => {
  describe('open and close', () => {
    it('should render shell container when opened without content', async () => {
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer()
          onMounted(() =>
            dialog.open({ container: { props: { title: 'Shell', width: '400px' } } }),
          )
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.content')).toBeNull()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Shell')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
    })

    it('should mount content to body when open is called with content', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open({ props: { message: 'hello' } }))
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
    })

    it('should unmount dialog when close is called', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ props: { message: 'a' } })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(queryBodyDialog()).toBeTruthy()

      dialog.close()
      await wrapper.vm.$nextTick()
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should keep mount container when close is called before host unmounts', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ props: { message: 'a' } })
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('div')).toBeTruthy()

      dialog.close()
      await wrapper.vm.$nextTick()

      expect(dialog.visible).toBe(false)
      expect(queryBodyDialog()).toBeFalsy()
      expect(document.body.querySelector('div')).toBeTruthy()

      wrapper.unmount()
      await wrapper.vm.$nextTick()

      expect(document.body.querySelector('div')).toBeFalsy()
    })

    it('should reopen with updated props when open is called after close', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
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

      dialog.close()
      await wrapper.vm.$nextTick()

      dialog.open({ props: { message: 'second' } })
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(dialog.visible).toBe(true)
      expect(document.body.querySelector('.msg')?.textContent).toBe('second')
      expect(document.body.querySelectorAll('div')).toHaveLength(1)
    })

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

    it('should remount content when open is called after close', async () => {
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

      dialog.close()
      await wrapper.vm.$nextTick()

      dialog.open({ props: { message: 'second' } })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(setupCount).toBe(2)
      expect(document.body.querySelector('.msg')?.textContent).toBe('second')
    })

    it('should dispose portal when bind host unmounts', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open({ props: { message: 'host-gone' } }))
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      await flushPromises()
      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('div')).toBeTruthy()

      wrapper.unmount()
      await wrapper.vm.$nextTick()

      expect(document.body.querySelector('div')).toBeFalsy()
      expect(queryBodyDialog()).toBeFalsy()
    })
  })

  describe('instance isolation', () => {
    it('should allow parallel open with independent DOM and visible state', async () => {
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

  describe('closeOn', () => {
    it('should close layer when use-tier closeOn event is emitted', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content, { closeOn: ['done'] })
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ props: { message: 'x' } })
      await wrapper.vm.$nextTick()
      await flushPromises()

      const done = document.body.querySelector('.done') as HTMLButtonElement
      done?.click()
      await wrapper.vm.$nextTick()
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close layer when open-tier closeOn is set without use-tier closeOn', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ props: { message: 'x' }, closeOn: ['done'] })
      await wrapper.vm.$nextTick()
      await flushPromises()

      const done = document.body.querySelector('.done') as HTMLButtonElement
      done?.click()
      await wrapper.vm.$nextTick()
      expect(queryBodyDialog()).toBeFalsy()
    })
  })

  describe('instance refs', () => {
    it('should expose contentRef with defineExpose after open', async () => {
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'ExposeContent',
        props: { message: String },
        setup(props, { expose }) {
          expose({ ping: () => 'pong' })
          return () => h('span', { class: 'msg' }, props.message)
        },
      })

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open({ props: { message: 'hi' } }))
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(dialog.contentRef.value?.ping?.()).toBe('pong')
    })

    it('should set contentRef to null when layer is closed', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open({ props: { message: 'hi' } }))
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(dialog.contentRef.value).not.toBeNull()

      dialog.close()
      await wrapper.vm.$nextTick()
      expect(dialog.contentRef.value).toBeNull()
    })

    it('should track container component in containerRef while visible', async () => {
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer()
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(dialog.containerRef.value).not.toBeNull()
      dialog.close()
      await wrapper.vm.$nextTick()
      expect(dialog.containerRef.value).toBeNull()
    })

    it('should chain props.ref Ref with internal ref onto same content instance', async () => {
      const useLayer = createLayer(Container)
      const userRef = ref<unknown>(null)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'UserRefContent',
        props: { message: String },
        setup(props, { expose }) {
          expose({ marker: 'content' })
          return () => h('span', { class: 'msg' }, props.message)
        },
      })

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content, { props: { ref: userRef } })
          onMounted(() => dialog.open({ props: { message: 'ref' } }))
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(userRef.value).toBe(dialog.contentRef.value)
      expect(dialog.contentRef.value?.marker).toBe('content')
    })

    it('should warn and ignore string ref on use tier', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content, { props: { ref: 'formRef' } })
          onMounted(() => dialog.open({ props: { message: 'ref' } }))
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('string ref on layer props is not supported'),
      )
      warn.mockRestore()
    })

    it('should warn and ignore invalid props.ref values on use tier', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const useLayer = createLayer(Container)
      const Content = makeContent()
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content, {
            props: { ref: { notARef: true } as never },
          })
          onMounted(() => dialog.open({ props: { message: 'ref' } }))
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('invalid props.ref value'),
      )
      warn.mockRestore()
    })
  })
})
