import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createLayer, defineLayer, LayerTemplate } from 'vue-layerx'
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

  describe('misuse', () => {
    it('should warn when defineLayer is called twice in the same setup', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let dialog!: ReturnType<ReturnType<typeof createLayer>>

      const Content = defineComponent({
        name: 'DoubleDefineLayer',
        setup() {
          defineLayer({ props: { title: 'First' } })
          defineLayer({ props: { title: 'Second', width: '400px' } })
          return () => h('div', { class: 'double-define' })
        },
      })

      const host = mountSetup(() => {
        dialog = createLayer(Container)(Content)
      })

      dialog.open()
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Second')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup; latter wins',
        ),
      )
      warn.mockRestore()
      host.destroy()
    })

    it('should ignore LayerTemplate :to from a superseded defineLayer return value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let dialog!: ReturnType<ReturnType<typeof createLayer>>

      const Content = defineComponent({
        name: 'StaleDefineLayerTo',
        setup() {
          const stale = defineLayer({ props: { title: 'First' } })
          defineLayer({ props: { title: 'Second', width: '400px' } })
          return () =>
            h(LayerTemplate, { props: { to: stale, name: 'footer' } }, [
              h('span', { class: 'stale-footer' }, 'stale'),
            ])
        },
      })

      const host = mountSetup(() => {
        dialog = createLayer(Container)(Content)
      })

      dialog.open()
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Second')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
      expect(document.body.querySelector('.stale-footer')).toBeFalsy()
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup; latter wins',
        ),
      )
      warn.mockRestore()
      host.destroy()
    })

    it('should honor LayerTemplate :to from the latter defineLayer return value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let dialog!: ReturnType<ReturnType<typeof createLayer>>

      const Content = defineComponent({
        name: 'LatterDefineLayerTo',
        setup() {
          defineLayer({ props: { title: 'First' } })
          const layer = defineLayer({ props: { title: 'Second' } })
          return () =>
            h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [
              h('span', { class: 'live-footer' }, 'live'),
            ])
        },
      })

      const host = mountSetup(() => {
        dialog = createLayer(Container)(Content)
      })

      dialog.open()
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Second')
      expect(document.body.querySelector('.live-footer')?.textContent).toBe('live')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup; latter wins',
        ),
      )
      warn.mockRestore()
      host.destroy()
    })

    it('should not warn when different contents each call defineLayer once', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let dialog!: ReturnType<ReturnType<typeof createLayer>>

      const CompA = defineComponent({
        name: 'DefineOnceA',
        setup() {
          defineLayer({ props: { title: 'A' } })
          return () => h('div', { class: 'content-a' }, 'A')
        },
      })
      const CompB = defineComponent({
        name: 'DefineOnceB',
        setup() {
          defineLayer({ props: { title: 'B' } })
          return () => h('div', { class: 'content-b' }, 'B')
        },
      })

      const host = mountSetup(() => {
        dialog = createLayer(Container)()
      })

      dialog.open({ component: CompA })
      await flushPromises()

      dialog.open({ component: CompB })
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('B')
      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup',
        ),
      )
      warn.mockRestore()
      host.destroy()
    })
  })
})
