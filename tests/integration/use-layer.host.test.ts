import { defineComponent, h, inject, onMounted, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('LayerInstance.bindHost', () => {
  describe('provide and inject', () => {
    it('should inject value provided by host setup useLayer', async () => {
      const HOST_KEY = Symbol('host-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance
      let injected: string | undefined

      const Content = defineComponent({
        name: 'InjectContent',
        setup() {
          injected = inject<string>(HOST_KEY)
          return () => h('span', { class: 'injected' }, injected ?? '')
        },
      })

      const Host = defineComponent({
        setup() {
          provide(HOST_KEY, 'from-host')
          dialog = useLayer(Content)
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(document.body.querySelector('.injected')?.textContent).toBe('from-host')
      expect(injected).toBe('from-host')
    })

    it('should inject value from ancestor provider wrapping host', async () => {
      const CONFIG_KEY = Symbol('config-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'ConfigInjectContent',
        setup() {
          const locale = inject<string>(CONFIG_KEY, 'missing')
          return () => h('span', { class: 'locale' }, locale)
        },
      })

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      const Root = defineComponent({
        setup() {
          provide(CONFIG_KEY, 'zh-cn')
          return () => h(Host)
        },
      })

      mount(Root)
      await flushPromises()

      expect(document.body.querySelector('.locale')?.textContent).toBe('zh-cn')
    })

    it('should preserve inject context when unmount then open is called', async () => {
      const HOST_KEY = Symbol('manual-unmount-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'ManualUnmountContent',
        setup() {
          const value = inject<string>(HOST_KEY, 'missing')
          return () => h('span', { class: 'manual-inject' }, value)
        },
      })

      const Host = defineComponent({
        setup() {
          provide(HOST_KEY, 'still-bound')
          dialog = useLayer(Content)
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')

      dialog.unmount()
      await wrapper.vm.$nextTick()
      expect(document.body.querySelector('div')).toBeFalsy()

      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')
    })
  })

  describe('bindHost', () => {
    it('should open without inject when detached useLayer has no bindHost', async () => {
      const HOST_KEY = Symbol('detached-key')
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'DetachedInjectContent',
        setup() {
          const value = inject<string>(HOST_KEY, 'fallback')
          return () => h('span', { class: 'detached-inject' }, value)
        },
      })

      const dialog = useLayer(Content)
      dialog.open()
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.detached-inject')?.textContent).toBe('fallback')
    })

    it('should inherit host provide when bindHost is called in setup', async () => {
      const HOST_KEY = Symbol('bind-host-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'BindHostInjectContent',
        setup() {
          const value = inject<string>(HOST_KEY, 'fallback')
          return () => h('span', { class: 'bind-inject' }, value)
        },
      })

      dialog = useLayer(Content)

      const App = defineComponent({
        setup() {
          provide(HOST_KEY, 'from-app')
          dialog.bindHost()
          onMounted(() => dialog.open())
          return () => h('app-root')
        },
      })

      mount(App)
      await flushPromises()

      expect(document.body.querySelector('.bind-inject')?.textContent).toBe('from-app')
    })

    it('should ignore second bindHost call', async () => {
      const HOST_KEY = Symbol('host-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'BindOnceContent',
        setup() {
          const value = inject<string>(HOST_KEY, 'none')
          return () => h('span', { class: 'bind-once' }, value)
        },
      })

      dialog = useLayer(Content)

      const SecondHost = defineComponent({
        setup() {
          provide(HOST_KEY, 'second')
          dialog.bindHost()
          onMounted(() => dialog.open())
          return () => h('second-host')
        },
      })

      const FirstHost = defineComponent({
        setup() {
          provide(HOST_KEY, 'first')
          dialog.bindHost()
          return () => h(SecondHost)
        },
      })

      mount(FirstHost)
      await flushPromises()

      expect(document.body.querySelector('.bind-once')?.textContent).toBe('first')
    })
  })
})
