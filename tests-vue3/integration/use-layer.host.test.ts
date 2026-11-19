import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  provide,
} from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createLayer, defineLayer, LayerTemplate, type LayerInstance } from 'vue-layerx'
import { flushPromises, mountWithRouter } from '../helpers/dom'
import {
  Container,
  makeContent,
  makeInjectProbeContainer,
  makeInjectProbeWidget,
  makeRouterProbeContainer,
  makeRouterProbeWidget,
  queryBodyDialog,
} from '../fixtures/components'

describe('LayerInstance.bindHost', () => {
  describe('API', () => {
    it('should warn when bindHost is called outside setup', () => {
      const useLayer = createLayer(Container)
      const dialog = useLayer(makeContent())
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      dialog.bindHost()

      expect(warn).toHaveBeenCalledWith(
        '[vue-layerx] bindHost() must be called synchronously during setup',
      )
      warn.mockRestore()
    })

    it('should ignore second bindHost call and warn when host differs', async () => {
      const HOST_KEY = Symbol('host-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const Content = defineComponent({
        name: 'BindOnceContent',
        setup() {
          const value = inject(HOST_KEY, 'none')
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
      expect(warn).toHaveBeenCalledWith(
        '[vue-layerx] bindHost() ignored: already bound to another host',
      )
      warn.mockRestore()
    })

    it('should not warn when bindHost is called again on the same host', async () => {
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const Host = defineComponent({
        setup() {
          dialog = useLayer(makeContent())
          dialog.bindHost()
          return () => h('same-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  describe('binding modes', () => {
    it('should open without host context when detached useLayer has no bindHost', async () => {
      const HOST_KEY = Symbol('detached-key')
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'DetachedInjectContent',
        setup() {
          const value = inject(HOST_KEY, 'fallback')
          return () => h('span', { class: 'detached-inject' }, value)
        },
      })

      const dialog = useLayer(Content)
      dialog.open()
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.detached-inject')?.textContent).toBe('fallback')
    })

    it('should inherit host context when bindHost is called in setup', async () => {
      const HOST_KEY = Symbol('bind-host-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'BindHostInjectContent',
        setup() {
          const value = inject(HOST_KEY, 'fallback')
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

    it('should preserve host context when unmount then open is called', async () => {
      const HOST_KEY = Symbol('manual-unmount-key')
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Content = defineComponent({
        name: 'ManualUnmountContent',
        setup() {
          const value = inject(HOST_KEY, 'missing')
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
      expect(queryBodyDialog()).toBeFalsy()
      expect(document.body.querySelector('.manual-inject')).toBeFalsy()

      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')
    })

    it('should remount with host context after open then bindHost then close then open', async () => {
      const HOST_KEY = Symbol('late-bind-key')
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'LateBindContent',
        setup() {
          const value = inject(HOST_KEY, 'fallback')
          return () => h('span', { class: 'late-bind' }, value)
        },
      })

      const dialog = useLayer(Content)

      dialog.open()
      await flushPromises()
      expect(document.body.querySelector('.late-bind')?.textContent).toBe('fallback')

      const Host = defineComponent({
        setup() {
          provide(HOST_KEY, 'from-host')
          dialog.bindHost()
          return () => h('late-bind-host')
        },
      })
      mount(Host)
      await flushPromises()
      expect(document.body.querySelector('.late-bind')?.textContent).toBe('fallback')

      dialog.close()
      await flushPromises()

      dialog.open()
      await flushPromises()
      expect(document.body.querySelector('.late-bind')?.textContent).toBe('from-host')
    })
  })

  describe('context', () => {
    describe('Content', () => {
      describe('provide/inject', () => {
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
              const locale = inject(CONFIG_KEY, 'missing')
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
      })

      describe('globalProperties', () => {
        // Vue 3 globalProperties are app-scoped — without bindHost the layer app cannot see the host's $router.
        it('should not read host $router when detached useLayer has no bindHost', async () => {
          const useLayer = createLayer(Container)

          const Content = defineComponent({
            name: 'DetachedRouterContent',
            setup() {
              const router = getCurrentInstance()?.appContext.config.globalProperties
                .$router as { currentRoute?: { path?: string } } | undefined
              const path = router?.currentRoute?.path ?? 'missing'
              return () => h('span', { class: 'detached-router' }, path)
            },
          })

          const dialog = useLayer(Content)

          const Host = defineComponent({
            setup() {
              // Host app has $router via mountWithRouter, but dialog is not bindHost'd.
              onMounted(() => dialog.open())
              return () => h('motion-host')
            },
          })

          mountWithRouter(Host)
          await flushPromises()

          expect(document.body.querySelector('.detached-router')?.textContent).toBe('missing')
        })

        it('should read host $router from Content', async () => {
          const useLayer = createLayer(Container)
          let dialog!: LayerInstance

          const Content = defineComponent({
            name: 'RouterContent',
            setup() {
              const router = getCurrentInstance()?.appContext.config.globalProperties
                .$router as { currentRoute?: { path?: string } } | undefined
              const path = router?.currentRoute?.path ?? 'missing'
              return () => h('span', { class: 'router-path' }, path)
            },
          })

          const Host = defineComponent({
            setup() {
              dialog = useLayer(Content)
              onMounted(() => dialog.open())
              return () => h('motion-host')
            },
          })

          mountWithRouter(Host)
          await flushPromises()

          expect(document.body.querySelector('.router-path')?.textContent).toBe('/users')
        })
      })
    })

    describe('Container', () => {
      describe('provide/inject', () => {
        it('should inject value provided by host into Container', async () => {
          const HOST_KEY = Symbol('container-host-key')
          const ProbeContainer = makeInjectProbeContainer(HOST_KEY)
          const useLayer = createLayer(ProbeContainer)
          let dialog!: LayerInstance

          const Host = defineComponent({
            setup() {
              provide(HOST_KEY, 'from-host')
              dialog = useLayer(makeContent())
              onMounted(() => dialog.open({ props: { message: 'hi' } }))
              return () => h('motion-host')
            },
          })

          mount(Host)
          await flushPromises()

          expect(document.body.querySelector('.container-inject')?.textContent).toBe(
            'from-host',
          )
        })

        it('should inject value from ancestor provider into Container', async () => {
          const CONFIG_KEY = Symbol('container-config-key')
          const ProbeContainer = makeInjectProbeContainer(CONFIG_KEY)
          const useLayer = createLayer(ProbeContainer)
          let dialog!: LayerInstance

          const Host = defineComponent({
            setup() {
              dialog = useLayer(makeContent())
              onMounted(() => dialog.open({ props: { message: 'hi' } }))
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

          expect(document.body.querySelector('.container-inject')?.textContent).toBe('zh-cn')
        })
      })

      describe('globalProperties', () => {
        it('should read host $router from Container', async () => {
          const ProbeContainer = makeRouterProbeContainer()
          const useLayer = createLayer(ProbeContainer)
          let dialog!: LayerInstance

          const Host = defineComponent({
            setup() {
              dialog = useLayer(makeContent())
              onMounted(() => dialog.open({ props: { message: 'hi' } }))
              return () => h('motion-host')
            },
          })

          mountWithRouter(Host)
          await flushPromises()

          expect(document.body.querySelector('.container-router')?.textContent).toBe(
            '/users',
          )
        })
      })
    })

    describe('LayerTemplate', () => {
      describe('provide/inject', () => {
        it('should inject value provided by host into LayerTemplate slot content', async () => {
          const HOST_KEY = Symbol('template-host-key')
          const Footer = makeInjectProbeWidget(HOST_KEY)
          const useLayer = createLayer(Container)
          let dialog!: LayerInstance

          const Content = defineComponent({
            name: 'TemplateInjectContent',
            setup() {
              const layer = defineLayer()
              return () =>
                h('div', { class: 'content' }, [
                  h(LayerTemplate, { to: layer, name: 'footer' }, () => h(Footer)),
                ])
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

          expect(document.body.querySelector('.template-inject')?.textContent).toBe(
            'from-host',
          )
        })

        it('should inject value from ancestor provider into LayerTemplate slot content', async () => {
          const CONFIG_KEY = Symbol('template-config-key')
          const Footer = makeInjectProbeWidget(CONFIG_KEY)
          const useLayer = createLayer(Container)
          let dialog!: LayerInstance

          const Content = defineComponent({
            name: 'TemplateAncestorContent',
            setup() {
              const layer = defineLayer()
              return () =>
                h('div', { class: 'content' }, [
                  h(LayerTemplate, { to: layer, name: 'footer' }, () => h(Footer)),
                ])
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

          expect(document.body.querySelector('.template-inject')?.textContent).toBe('zh-cn')
        })
      })

      describe('globalProperties', () => {
        it('should read host $router from LayerTemplate slot content', async () => {
          const Footer = makeRouterProbeWidget()
          const useLayer = createLayer(Container)
          let dialog!: LayerInstance

          const Content = defineComponent({
            name: 'TemplateRouterContent',
            setup() {
              const layer = defineLayer()
              return () =>
                h('div', { class: 'content' }, [
                  h(LayerTemplate, { to: layer, name: 'footer' }, () => h(Footer)),
                ])
            },
          })

          const Host = defineComponent({
            setup() {
              dialog = useLayer(Content)
              onMounted(() => dialog.open())
              return () => h('motion-host')
            },
          })

          mountWithRouter(Host)
          await flushPromises()

          expect(document.body.querySelector('.template-router')?.textContent).toBe(
            '/users',
          )
        })
      })
    })
  })
})
