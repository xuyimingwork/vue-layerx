import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  createLayer,
  defineLayer,
  LayerTemplate,
  type LayerInstance,
  type LayerTemplateScope,
} from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'

const MultiSlotContainer = defineComponent({
  name: 'MultiSlotContainer',
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('motion-dialog', {}, [
            slots.default?.(),
            slots.header?.(),
            slots.footer?.(),
          ])
        : null
  },
})

describe('LayerTemplate', () => {
  describe('to defineLayer', () => {
    describe('in layer context', () => {
      it('should render into container slot by name when layer is open', async () => {
        const useLayer = createLayer(Container)
        const Content = makeContent(true)
        let dialog!: LayerInstance

        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            onMounted(() => dialog.open({ props: { message: 'slot' } }))
            return () => h('motion-host')
          },
        })

        mount(Host)
        await flushPromises()

        expect(document.body.querySelector('.footer-btn')).toBeTruthy()
        expect(document.querySelector('.content .footer-btn')).toBeFalsy()
      })

      it('should pass inLayer scope with empty slotProps when layer is open', async () => {
        const useLayer = createLayer(Container)
        let captured: LayerTemplateScope | undefined

        const Content = defineComponent({
          name: 'ContentWithScopeCapture',
          props: { message: String },
          setup(props) {
            const layer = defineLayer()
            return () =>
              h('motion-div', { class: 'content' }, [
                h('span', { class: 'msg' }, props.message),
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer' },
                  {
                    default: (templateScope: LayerTemplateScope) => {
                      captured = templateScope
                      return h('button', { class: 'footer-btn' }, 'footer')
                    },
                  },
                ),
              ])
          },
        })

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            onMounted(() => dialog.open({ props: { message: 'scope' } }))
            return () => h('motion-host')
          },
        })

        mount(Host)
        await flushPromises()

        expect(document.body.querySelector('.footer-btn')).toBeTruthy()
        expect(captured).toEqual({
          inLayer: true,
          outsideLayer: false,
          slotProps: {},
        })
      })

      it('should forward container scoped slot props via slotProps when layer is open', async () => {
        const ScopedFooterLayer = defineComponent({
          name: 'ScopedFooterLayer',
          props: { modelValue: Boolean },
          emits: ['update:modelValue'],
          setup(props, { slots }) {
            return () =>
              props.modelValue
                ? h('motion-dialog', {}, [
                    slots.default?.(),
                    slots.footer?.({ confirmLoading: true }),
                  ])
                : null
          },
        })

        const useLayer = createLayer(ScopedFooterLayer)
        let captured: LayerTemplateScope | undefined

        const Content = defineComponent({
          name: 'ContentWithLayerScopedFooter',
          setup() {
            const layer = defineLayer()
            return () =>
              h(
                LayerTemplate,
                { to: layer, name: 'footer' },
                {
                  default: (templateScope: LayerTemplateScope) => {
                    captured = templateScope
                    return h(
                      'button',
                      { class: 'footer-btn' },
                      String(templateScope.slotProps.confirmLoading),
                    )
                  },
                },
              )
          },
        })

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

        expect(document.body.querySelector('.footer-btn')?.textContent).toBe('true')
        expect(captured).toEqual({
          inLayer: true,
          outsideLayer: false,
          slotProps: { confirmLoading: true },
        })
      })

      it('should render multiple container slots by name when layer is open', async () => {
        const useLayer = createLayer(MultiSlotContainer)
        let dialog!: LayerInstance

        const Content = defineComponent({
          name: 'MultiSlotContent',
          setup() {
            const layer = defineLayer()
            return () => [
              h(LayerTemplate, { to: layer, name: 'header' }, () =>
                h('span', { class: 'header-slot' }, 'header'),
              ),
              h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                h('button', { class: 'footer-btn' }, 'footer'),
              ),
            ]
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

        expect(document.body.querySelector('.header-slot')?.textContent).toBe('header')
        expect(document.body.querySelector('.footer-btn')?.textContent).toBe('footer')
      })

      it('should let latter LayerTemplate win when the same slot name is registered twice', async () => {
        const useLayer = createLayer(Container)
        let dialog!: LayerInstance

        const Content = defineComponent({
          name: 'DuplicateSlotContent',
          setup() {
            const layer = defineLayer()
            return () => [
              h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                h('span', { class: 'first-footer' }, 'first'),
              ),
              h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                h('span', { class: 'second-footer' }, 'second'),
              ),
            ]
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

        expect(document.body.querySelector('.first-footer')).toBeFalsy()
        expect(document.body.querySelector('.second-footer')?.textContent).toBe('second')
      })

      it('should ignore visible-outside when Content runs in layer context', async () => {
        const useLayer = createLayer(Container)
        let captured: LayerTemplateScope | undefined

        const Content = defineComponent({
          name: 'VisibleOutsideInLayerContent',
          setup() {
            const layer = defineLayer()
            return () =>
              h(
                LayerTemplate,
                { to: layer, name: 'footer', visibleOutside: true },
                {
                  default: (templateScope: LayerTemplateScope) => {
                    captured = templateScope
                    return h('button', { class: 'footer-btn' }, 'footer')
                  },
                },
              )
          },
        })

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

        expect(document.body.querySelector('.footer-btn')).toBeTruthy()
        expect(document.querySelector('.content .footer-btn')).toBeFalsy()
        expect(captured).toEqual({
          inLayer: true,
          outsideLayer: false,
          slotProps: {},
        })
      })
    })

    describe('outside layer context', () => {
      it('should render nothing by default when Content is mounted on page', () => {
        const wrapper = mount(
          defineComponent({
            setup() {
              const layer = defineLayer()
              return () =>
                h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                  h('button', { class: 'footer-btn' }, 'footer'),
                )
            },
          }),
        )
        expect(wrapper.find('.footer-btn').exists()).toBe(false)
      })

      it('should pass outsideLayer scope with empty slotProps when Content is mounted on page', () => {
        let captured: LayerTemplateScope | undefined

        mount(
          defineComponent({
            setup() {
              const layer = defineLayer()
              return () =>
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer', visibleOutside: true },
                  {
                    default: (templateScope: LayerTemplateScope) => {
                      captured = templateScope
                      return h('button', { class: 'footer-btn' }, 'footer')
                    },
                  },
                )
            },
          }),
        )

        expect(captured).toEqual({
          inLayer: false,
          outsideLayer: true,
          slotProps: {},
        })
      })

      it('should render on page when visible-outside is set', () => {
        const wrapper = mount(
          defineComponent({
            setup() {
              const layer = defineLayer()
              return () =>
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer', visibleOutside: true },
                  () => h('button', { class: 'footer-btn' }, 'footer'),
                )
            },
          }),
        )

        expect(wrapper.find('.footer-btn').exists()).toBe(true)
      })

      it('should render into container slot when Content with visible-outside is opened via useLayer', async () => {
        const useLayer = createLayer(Container)
        let dialog!: LayerInstance

        const Content = defineComponent({
          name: 'VisibleOutsideContentInLayer',
          props: { message: String },
          setup(props) {
            const layer = defineLayer()
            return () =>
              h('motion-div', { class: 'content' }, [
                h('span', { class: 'msg' }, props.message),
                h(LayerTemplate, { to: layer, name: 'footer', visibleOutside: true }, () =>
                  h('button', { class: 'footer-btn' }, 'footer'),
                ),
              ])
          },
        })

        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            onMounted(() => dialog.open({ props: { message: 'layer' } }))
            return () => h('motion-host')
          },
        })

        mount(Host)
        await flushPromises()

        expect(document.body.querySelector('.footer-btn')).toBeTruthy()
        expect(document.querySelector('.content .footer-btn')).toBeFalsy()
      })

      it('should ignore container prop when to is defineLayer on page', () => {
        const wrapper = mount(
          defineComponent({
            setup() {
              const layer = defineLayer()
              return () =>
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer', container: true, visibleOutside: true },
                  () => h('button', { class: 'footer-btn' }, 'footer'),
                )
            },
          }),
        )

        expect(wrapper.find('.footer-btn').exists()).toBe(true)
      })
    })
  })

  describe('to LayerInstance', () => {
    it('should render bound slot content when layer is open', async () => {
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'ScopedContent',
        setup(_props, { slots }) {
          return () => h('div', { class: 'content' }, slots.extra?.())
        },
      })

      let dialog = useLayer(Content)

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () =>
            h(LayerTemplate, { to: dialog, name: 'extra' }, () =>
              h('span', { class: 'scoped-extra' }, 'from bind'),
            )
        },
      })

      const wrapper = mount(Host)
      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.scoped-extra')).toBeTruthy()
    })

    it('should forward content scoped slot props when to is set', async () => {
      const useLayer = createLayer(Container)
      let captured: Record<string, unknown> | undefined

      const Content = defineComponent({
        name: 'ContentWithScopedSlot',
        setup(_props, { slots }) {
          return () =>
            h('motion-div', { class: 'content' }, slots.extra?.({ data: 'from-content' }))
        },
      })

      let dialog!: LayerInstance
      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () =>
            h(LayerTemplate, { to: dialog, name: 'extra' }, {
              default: (props: Record<string, unknown>) => {
                captured = props
                return h('span', { class: 'scoped-extra' }, String(props.data))
              },
            })
        },
      })

      const wrapper = mount(Host)
      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.scoped-extra')?.textContent).toBe('from-content')
      expect(captured).toEqual({ data: 'from-content' })
    })

    it('should prefer caller container slot over creator slot when container is set', async () => {
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'ContentWithCreatorFooter',
        setup() {
          const layer = defineLayer()
          return () =>
            h('div', { class: 'content' }, [
              h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                h('span', { class: 'creator-footer' }, 'creator'),
              ),
            ])
        },
      })

      let dialog = useLayer(Content)

      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () =>
            h(LayerTemplate, { to: dialog, container: true, name: 'footer' }, () =>
              h('span', { class: 'caller-footer' }, 'caller'),
            )
        },
      })

      const wrapper = mount(Host)
      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.caller-footer')).toBeTruthy()
      expect(document.body.querySelector('.creator-footer')).toBeFalsy()
    })
  })
})
