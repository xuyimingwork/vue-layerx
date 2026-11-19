import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createLayer, defineLayer, LayerTemplate, type LayerInstance } from 'vue-layerx'
import {
  flushPromises,
  mountComponent,
  mountSetup,
  withStubRouter,
} from '../helpers/dom'
import {
  Container,
  makeContent,
  makeInjectProbeContainer,
  makeInjectProbeWidget,
  makeRouterProbeContainer,
  makeRouterProbeWidget,
  queryBodyDialog,
} from '../fixtures/components'

describe('LayerInstance.bindHost (Vue 2.7)', () => {
  describe('API', () => {
    it('should warn when bindHost is called outside setup', () => {
      const dialog = createLayer(Container)(makeContent())
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      dialog.bindHost()

      expect(warn).toHaveBeenCalledWith(
        '[vue-layerx] bindHost() must be called synchronously during setup',
      )
      warn.mockRestore()
    })
  })

  describe('binding modes', () => {
    it('should open without host context when detached useLayer has no bindHost', async () => {
      const KEY = 'detached-key'
      const Content = defineComponent({
        name: 'DetachedInjectContent',
        inject: {
          msg: { from: KEY, default: 'fallback' },
        },
        render(h) {
          return h('span', { class: 'detached-inject' }, (this as unknown as { msg: string }).msg)
        },
      })

      const dialog = createLayer(Container)(Content)
      dialog.open()
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.detached-inject')?.textContent).toBe('fallback')
      dialog.unmount()
    })

    it('should inherit host context when useLayer auto-binds in setup', async () => {
      const KEY = 'layer-host-msg'
      let injected: string | undefined

      const Content = defineComponent({
        name: 'InjectContent',
        inject: {
          msg: { from: KEY, default: 'missing' },
        },
        created() {
          injected = (this as unknown as { msg: string }).msg
        },
        render(h) {
          return h('span', { class: 'msg' }, (this as unknown as { msg: string }).msg)
        },
      })

      const Host = defineComponent({
        provide: { [KEY]: 'from-host' },
        setup() {
          const dialog = createLayer(Container)(Content)
          dialog.open()
          return () => h('div', { class: 'test-host' })
        },
      })

      const host = mountComponent(Host)
      await flushPromises()
      expect(injected).toBe('from-host')
      expect(document.body.querySelector('.msg')?.textContent).toBe('from-host')
      host.destroy()
    })
  })

  describe('context', () => {
    describe('Content', () => {
      describe('provide/inject', () => {
        it('should inject value from ancestor provider wrapping host', async () => {
          const KEY = 'content-ancestor-key'
          const Content = defineComponent({
            name: 'ContentAncestorInject',
            inject: {
              msg: { from: KEY, default: 'missing' },
            },
            render(h) {
              return h('span', { class: 'content-inject' }, (this as unknown as { msg: string }).msg)
            },
          })

          const Host = defineComponent({
            setup() {
              const dialog = createLayer(Container)(Content)
              dialog.open()
              return () => h('div', { class: 'test-host' })
            },
          })

          const Root = defineComponent({
            provide: { [KEY]: 'zh-cn' },
            render(h) {
              return h(Host)
            },
          })

          const root = mountComponent(Root)
          await flushPromises()
          expect(document.body.querySelector('.content-inject')?.textContent).toBe('zh-cn')
          root.destroy()
        })
      })

      describe('globalProperties', () => {
        // Vue 2 installs plugin globals on the shared prototype — available even when detached.
        it('should still read $router when detached useLayer has no bindHost', async () => {
          const router = withStubRouter()
          try {
            const Content = defineComponent({
              name: 'DetachedRouterContent',
              render(h) {
                const path =
                  (this as unknown as { $router?: { currentRoute?: { path?: string } } }).$router
                    ?.currentRoute?.path ?? 'missing'
                return h('span', { class: 'detached-router' }, path)
              },
            })

            const dialog = createLayer(Container)(Content)
            dialog.open()
            await flushPromises()

            expect(document.body.querySelector('.detached-router')?.textContent).toBe('/users')
            dialog.unmount()
          } finally {
            router.restore()
          }
        })

        it('should read $router from Content in a typical host setup', async () => {
          const router = withStubRouter()
          try {
            const Content = defineComponent({
              name: 'ContentRouter',
              render(h) {
                const path =
                  (this as unknown as { $router?: { currentRoute?: { path?: string } } }).$router
                    ?.currentRoute?.path ?? 'missing'
                return h('span', { class: 'router-path' }, path)
              },
            })

            const host = mountSetup(() => {
              createLayer(Container)(Content).open()
            })
            await flushPromises()

            expect(document.body.querySelector('.router-path')?.textContent).toBe('/users')
            host.destroy()
          } finally {
            router.restore()
          }
        })
      })
    })

    describe('Container', () => {
      describe('provide/inject', () => {
        it('should inject value provided by host into Container', async () => {
          const KEY = 'container-host-key'
          const ProbeContainer = makeInjectProbeContainer(KEY)
          const Host = defineComponent({
            provide: { [KEY]: 'from-host' },
            setup() {
              const dialog = createLayer(ProbeContainer)(makeContent())
              dialog.open({ props: { message: 'hi' } })
              return () => h('div', { class: 'test-host' })
            },
          })

          const host = mountComponent(Host)
          await flushPromises()
          expect(document.body.querySelector('.container-inject')?.textContent).toBe(
            'from-host',
          )
          host.destroy()
        })
      })

      describe('globalProperties', () => {
        it('should read $router from Container in a typical host setup', async () => {
          const router = withStubRouter()
          try {
            const ProbeContainer = makeRouterProbeContainer()

            const host = mountSetup(() => {
              createLayer(ProbeContainer)(makeContent()).open({ props: { message: 'hi' } })
            })
            await flushPromises()

            expect(document.body.querySelector('.container-router')?.textContent).toBe(
              '/users',
            )
            host.destroy()
          } finally {
            router.restore()
          }
        })
      })
    })

    describe('LayerTemplate', () => {
      describe('provide/inject', () => {
        it('should inject value provided by host into LayerTemplate slot content', async () => {
          const KEY = 'template-host-key'
          const Footer = makeInjectProbeWidget(KEY)
          let dialog!: LayerInstance

          const Content = defineComponent({
            name: 'TemplateInjectContent',
            setup() {
              const layer = defineLayer()
              return () =>
                h('div', { class: 'content' }, [
                  h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [h(Footer)]),
                ])
            },
          })

          const Host = defineComponent({
            provide: { [KEY]: 'from-host' },
            setup() {
              dialog = createLayer(Container)(Content)
              dialog.open()
              return () => h('div', { class: 'test-host' })
            },
          })

          const host = mountComponent(Host)
          await flushPromises()
          expect(document.body.querySelector('.template-inject')?.textContent).toBe(
            'from-host',
          )
          host.destroy()
        })
      })

      describe('globalProperties', () => {
        it('should read $router from LayerTemplate slot content in a typical host setup', async () => {
          const router = withStubRouter()
          try {
            const Footer = makeRouterProbeWidget()

            const Content = defineComponent({
              name: 'TemplateRouterContent',
              setup() {
                const layer = defineLayer()
                return () =>
                  h('div', { class: 'content' }, [
                    h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [h(Footer)]),
                  ])
              },
            })

            const host = mountSetup(() => {
              createLayer(Container)(Content).open()
            })
            await flushPromises()

            expect(document.body.querySelector('.template-router')?.textContent).toBe(
              '/users',
            )
            host.destroy()
          } finally {
            router.restore()
          }
        })
      })
    })
  })
})
