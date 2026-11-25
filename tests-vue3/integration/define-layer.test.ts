import { defineComponent, h, onMounted, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  createLayer,
  defineLayer,
  LayerTemplate,
  type LayerDefine,
  type LayerInstance,
} from 'vue-layerx'
import { flushPromises } from '../helpers/dom'
import {
  Container,
  makeContentWithDefineLayer,
  queryBodyDialog,
} from '../fixtures/components'

async function openLayer(
  Content: Component,
  openProps?: Record<string, unknown>,
) {
  const useLayer = createLayer(Container)
  let dialog!: LayerInstance

  const Host = defineComponent({
    setup() {
      dialog = useLayer(Content)
      onMounted(() => dialog.open({ props: openProps }))
      return () => h('motion-host')
    },
  })

  mount(Host)
  await flushPromises()
  return dialog
}

describe('defineLayer', () => {
  describe('definition', () => {
    it('should accept empty config when called in layer context', async () => {
      let layer!: LayerDefine

      const Content = defineComponent({
        name: 'EmptyDefineLayerInLayer',
        props: { message: String },
        setup(props) {
          layer = defineLayer()
          return () => h('span', { class: 'msg' }, props.message)
        },
      })

      await openLayer(Content, { message: 'hello' })

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
      expect(layer.exists).toBe(true)
    })

    it('should accept empty config when config does not register', () => {
      let layer!: LayerDefine

      const Content = defineComponent({
        name: 'EmptyDefineLayerOnPage',
        props: { message: String },
        setup(props) {
          layer = defineLayer()
          return () => h('span', { class: 'msg' }, props.message)
        },
      })

      const wrapper = mount(Content, { props: { message: 'page' } })

      expect(wrapper.find('.msg').text()).toBe('page')
      expect(queryBodyDialog()).toBeNull()
      expect(layer.exists).toBe(false)
    })
  })

  describe('in layer context', () => {
    it('should apply container props when layer is open', async () => {
      const Content = defineComponent({
        name: 'ModeAwareContent',
        props: { message: String, mode: String },
        emits: ['done', 'cancel'],
        setup(props, { emit }) {
          defineLayer({
            props: {
              title: props.mode === 'edit' ? 'Edit user' : 'View user',
              width: '520px',
            },
          })
          return () =>
            h('motion-div', { class: 'content' }, [
              h('span', { class: 'msg' }, props.message),
              h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
            ])
        },
      })

      await openLayer(Content, { message: 'hi', mode: 'edit' })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Edit user')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('520px')
    })

    it('should apply content closeOn when layer is open', async () => {
      await openLayer(
        makeContentWithDefineLayer({ content: { closeOn: ['done'] } }),
        { message: 'close me' },
      )

      expect(queryBodyDialog()).toBeTruthy()
      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await flushPromises()

      expect(queryBodyDialog()).toBeNull()
    })
  })

  describe('when config does not register', () => {
    it('should not apply container props when content is mounted on page', () => {
      const Content = defineComponent({
        name: 'ContentOnPage',
        props: { message: String },
        emits: ['done', 'cancel'],
        setup(props, { emit }) {
          defineLayer({
            props: { title: 'ShouldNotApply', width: '999px' },
          })
          return () =>
            h('motion-div', { class: 'content' }, [
              h('span', { class: 'msg' }, props.message),
              h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
            ])
        },
      })

      mount(Content, { props: { message: 'page' } })

      expect(queryBodyDialog()).toBeNull()
      expect(document.body.querySelector('[data-title="ShouldNotApply"]')).toBeNull()
    })

    it('should not apply nested defineLayer config to parent layer', async () => {
      const useLayer = createLayer(Container)
      let innerLayer!: LayerDefine

      const InnerContent = defineComponent({
        name: 'InnerContent',
        setup() {
          innerLayer = defineLayer({ props: { title: 'InnerShouldNotApply' } })
          return () => h('div', { class: 'inner' }, 'inner')
        },
      })

      const OuterContent = defineComponent({
        name: 'OuterContent',
        setup() {
          defineLayer({ props: { title: 'OuterTitle', width: '640px' } })
          return () =>
            h('div', { class: 'outer' }, [
              h('span', { class: 'outer-msg' }, 'outer'),
              h(InnerContent),
            ])
        },
      })

      let dialog!: LayerInstance
      const Host = defineComponent({
        setup() {
          dialog = useLayer(OuterContent)
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('OuterTitle')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('640px')
      expect(innerLayer.exists).toBe(false)
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
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer()
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ component: CompA })
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.content-a')).toBeTruthy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('A的标题')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('800px')

      dialog.open({ component: CompB })
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.content-b')).toBeTruthy()
      expect(document.body.querySelector('.content-a')).toBeFalsy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBeFalsy()
      expect(queryBodyDialog()?.getAttribute('data-width')).toBeFalsy()
    })

    it('should drop defineLayer container props when reopen with content that has no defineLayer', async () => {
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

      const Host = defineComponent({
        setup() {
          dialog = useLayer()
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ component: CompA })
      await wrapper.vm.$nextTick()
      await flushPromises()

      dialog.close()
      await wrapper.vm.$nextTick()

      dialog.open({ component: CompB })
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.content-b')).toBeTruthy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBeFalsy()
      expect(queryBodyDialog()?.getAttribute('data-width')).toBeFalsy()
    })
  })

  describe('misuse', () => {
    it('should throw when called outside setup', () => {
      expect(() => defineLayer()).toThrow(
        '[vue-layerx] defineLayer() must be called synchronously inside setup().',
      )
    })

    it('should throw when called inside onMounted', async () => {
      let caught: unknown

      const Host = defineComponent({
        setup() {
          onMounted(() => {
            try {
              defineLayer()
            } catch (error) {
              caught = error
            }
          })
          return () => h('div')
        },
      })

      mount(Host)
      await flushPromises()

      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(
        '[vue-layerx] defineLayer() must be called synchronously inside setup().',
      )
    })

    it('should warn when defineLayer is called twice in the same setup', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const Content = defineComponent({
        name: 'DoubleDefineLayer',
        setup() {
          defineLayer({ props: { title: 'First' } })
          defineLayer({ props: { title: 'Second', width: '400px' } })
          return () => h('div', { class: 'double-define' })
        },
      })

      await openLayer(Content)

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Second')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup; latter wins',
        ),
      )
      warn.mockRestore()
    })

    it('should ignore LayerTemplate :to from a superseded defineLayer return value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const Content = defineComponent({
        name: 'StaleDefineLayerTo',
        setup() {
          const stale = defineLayer({ props: { title: 'First' } })
          defineLayer({ props: { title: 'Second', width: '400px' } })
          return () =>
            h(LayerTemplate, { to: stale, name: 'footer' }, () =>
              h('span', { class: 'stale-footer' }, 'stale'),
            )
        },
      })

      await openLayer(Content)

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Second')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
      expect(document.body.querySelector('.stale-footer')).toBeFalsy()
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup; latter wins',
        ),
      )
      warn.mockRestore()
    })

    it('should honor LayerTemplate :to from the latter defineLayer return value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const Content = defineComponent({
        name: 'LatterDefineLayerTo',
        setup() {
          defineLayer({ props: { title: 'First' } })
          const layer = defineLayer({ props: { title: 'Second' } })
          return () =>
            h(LayerTemplate, { to: layer, name: 'footer' }, () =>
              h('span', { class: 'live-footer' }, 'live'),
            )
        },
      })

      await openLayer(Content)

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Second')
      expect(document.body.querySelector('.live-footer')?.textContent).toBe('live')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup; latter wins',
        ),
      )
      warn.mockRestore()
    })

    it('should not warn when different contents each call defineLayer once', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const useLayer = createLayer(Container)
      let dialog!: LayerInstance

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

      const Host = defineComponent({
        setup() {
          dialog = useLayer()
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      dialog.open({ component: CompA })
      await wrapper.vm.$nextTick()
      await flushPromises()

      dialog.open({ component: CompB })
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('B')
      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'defineLayer() called more than once in the same setup',
        ),
      )
      warn.mockRestore()
    })
  })
})
