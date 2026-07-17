import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  createLayer,
  defineLayer,
  LayerTemplate,
  type LayerDefine,
  type LayerInstance,
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

      it('should pass empty flat slot props when layer is open', async () => {
        const useLayer = createLayer(Container)
        let captured: Record<string, unknown> | undefined
        let layer!: LayerDefine

        const Content = defineComponent({
          name: 'ContentWithScopeCapture',
          props: { message: String },
          setup(props) {
            layer = defineLayer()
            return () =>
              h('motion-div', { class: 'content' }, [
                h('span', { class: 'msg' }, props.message),
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer' },
                  {
                    default: (slotProps: Record<string, unknown> = {}) => {
                      captured = slotProps
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
        expect(layer.exists).toBe(true)
        expect(captured).toEqual({})
        expect(captured).not.toHaveProperty('exists')
        expect(captured).not.toHaveProperty('slotProps')
      })

      it('should forward container scoped slot props flat when layer is open', async () => {
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
        let captured: Record<string, unknown> | undefined
        let layer!: LayerDefine

        const Content = defineComponent({
          name: 'ContentWithLayerScopedFooter',
          setup() {
            layer = defineLayer()
            return () =>
              h(
                LayerTemplate,
                { to: layer, name: 'footer' },
                {
                  default: (slotProps: Record<string, unknown> = {}) => {
                    captured = slotProps
                    return h(
                      'button',
                      { class: 'footer-btn' },
                      String(slotProps.confirmLoading),
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
        expect(layer.exists).toBe(true)
        expect(captured).toEqual({ confirmLoading: true })
        expect(captured).not.toHaveProperty('slotProps')
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
        let captured: Record<string, unknown> | undefined
        let layer!: LayerDefine

        const Content = defineComponent({
          name: 'VisibleOutsideInLayerContent',
          setup() {
            layer = defineLayer()
            return () =>
              h(
                LayerTemplate,
                { to: layer, name: 'footer', visibleOutside: true },
                {
                  default: (slotProps: Record<string, unknown> = {}) => {
                    captured = slotProps
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
        expect(layer.exists).toBe(true)
        expect(captured).toEqual({})
      })

      it('should ignore container prop and still render into container slot when to is defineLayer', async () => {
        const useLayer = createLayer(Container)
        let dialog!: LayerInstance

        const Content = defineComponent({
          name: 'ContentWithContainerProp',
          setup() {
            const layer = defineLayer()
            return () =>
              h('motion-div', { class: 'content' }, [
                h(LayerTemplate, { to: layer, name: 'footer', container: true }, () =>
                  h('button', { class: 'footer-btn' }, 'footer'),
                ),
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

        mount(Host)
        await flushPromises()

        expect(document.body.querySelector('.footer-btn')).toBeTruthy()
        expect(document.querySelector('.content .footer-btn')).toBeFalsy()
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

      it('should render nothing by default when Content is nested inside another Content', async () => {
        const useLayer = createLayer(Container)

        const InnerContent = defineComponent({
          name: 'InnerContent',
          setup() {
            const layer = defineLayer()
            return () =>
              h('div', { class: 'inner' }, [
                h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                  h('button', { class: 'inner-footer' }, 'inner'),
                ),
              ])
          },
        })

        const OuterContent = defineComponent({
          name: 'OuterContent',
          setup() {
            const layer = defineLayer()
            return () =>
              h('div', { class: 'outer' }, [
                h(InnerContent),
                h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                  h('button', { class: 'outer-footer' }, 'outer'),
                ),
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

        expect(document.body.querySelector('.outer-footer')).toBeTruthy()
        expect(document.body.querySelector('.inner-footer')).toBeFalsy()
      })

      it('should pass empty flat slot props when Content is mounted on page with visible-outside', () => {
        let captured: Record<string, unknown> | undefined
        let layer!: LayerDefine

        mount(
          defineComponent({
            setup() {
              layer = defineLayer()
              return () =>
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer', visibleOutside: true },
                  {
                    default: (slotProps: Record<string, unknown> = {}) => {
                      captured = slotProps
                      return h('button', { class: 'footer-btn' }, 'footer')
                    },
                  },
                )
            },
          }),
        )

        expect(layer.exists).toBe(false)
        expect(captured).toEqual({})
        expect(captured).not.toHaveProperty('exists')
        expect(captured).not.toHaveProperty('slotProps')
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

      it('should render in place when visible-outside is set on Content nested inside another Content', async () => {
        const useLayer = createLayer(Container)

        const InnerContent = defineComponent({
          name: 'InnerContent',
          setup() {
            const layer = defineLayer()
            return () =>
              h('div', { class: 'inner' }, [
                h(LayerTemplate, { to: layer, name: 'footer', visibleOutside: true }, () =>
                  h('button', { class: 'inner-footer' }, 'inner'),
                ),
              ])
          },
        })

        const OuterContent = defineComponent({
          name: 'OuterContent',
          setup() {
            const layer = defineLayer()
            return () =>
              h('div', { class: 'outer' }, [
                h(InnerContent),
                h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                  h('button', { class: 'outer-footer' }, 'outer'),
                ),
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

        expect(document.body.querySelector('.outer-footer')).toBeTruthy()
        expect(document.body.querySelector('.inner .inner-footer')).toBeTruthy()
      })

      it('should pass empty flat slot props when Content is nested inside another Content', async () => {
        let captured: Record<string, unknown> | undefined
        let layer!: LayerDefine

        const InnerContent = defineComponent({
          name: 'InnerContent',
          setup() {
            layer = defineLayer()
            return () =>
              h('div', { class: 'inner' }, [
                h(
                  LayerTemplate,
                  { to: layer, name: 'footer', visibleOutside: true },
                  {
                    default: (slotProps: Record<string, unknown> = {}) => {
                      captured = slotProps
                      return h('button', { class: 'inner-footer' }, 'inner')
                    },
                  },
                ),
              ])
          },
        })

        mount(
          defineComponent({
            setup() {
              return () => h('div', { class: 'outer' }, [h(InnerContent)])
            },
          }),
        )

        expect(layer.exists).toBe(false)
        expect(captured).toEqual({})
        expect(captured).not.toHaveProperty('exists')
        expect(captured).not.toHaveProperty('slotProps')
      })
    })
  })

  describe('to LayerInstance', () => {
    describe('into content slot', () => {
      it('should render into content slot by name when layer is open', async () => {
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

      it('should forward content scoped slot props as flat slot args', async () => {
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
        expect(captured).not.toHaveProperty('exists')
        expect(captured).not.toHaveProperty('slotProps')
      })

      it('should ignore visible-outside when to is LayerInstance', async () => {
        const useLayer = createLayer(Container)

        const Content = defineComponent({
          name: 'ContentWithExtraSlot',
          setup(_props, { slots }) {
            return () => h('div', { class: 'content' }, slots.extra?.())
          },
        })

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            return () =>
              h(LayerTemplate, { to: dialog, name: 'extra', visibleOutside: true }, () =>
                h('span', { class: 'scoped-extra' }, 'from caller'),
              )
          },
        })

        const wrapper = mount(Host)
        dialog.open()
        await wrapper.vm.$nextTick()
        await flushPromises()

        expect(document.body.querySelector('.scoped-extra')).toBeTruthy()
      })

      it('should let latter LayerTemplate win when the same content slot name is registered twice', async () => {
        const useLayer = createLayer(Container)

        const Content = defineComponent({
          name: 'ContentWithExtraSlot',
          setup(_props, { slots }) {
            return () => h('div', { class: 'content' }, slots.extra?.())
          },
        })

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            return () => [
              h(LayerTemplate, { to: dialog, name: 'extra' }, () =>
                h('span', { class: 'first-extra' }, 'first'),
              ),
              h(LayerTemplate, { to: dialog, name: 'extra' }, () =>
                h('span', { class: 'second-extra' }, 'second'),
              ),
            ]
          },
        })

        const wrapper = mount(Host)
        dialog.open()
        await wrapper.vm.$nextTick()
        await flushPromises()

        expect(document.body.querySelector('.first-extra')).toBeFalsy()
        expect(document.body.querySelector('.second-extra')?.textContent).toBe('second')
      })
    })

    describe('into container slot', () => {
      it('should render into container slot by name when layer is open', async () => {
        const useLayer = createLayer(Container)

        const Content = defineComponent({
          name: 'PlainContent',
          setup() {
            return () => h('div', { class: 'content' }, 'body')
          },
        })

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            return () =>
              h(LayerTemplate, { to: dialog, container: true, name: 'footer' }, () =>
                h('button', { class: 'caller-footer' }, 'caller'),
              )
          },
        })

        const wrapper = mount(Host)
        dialog.open()
        await wrapper.vm.$nextTick()
        await flushPromises()

        expect(document.body.querySelector('.caller-footer')).toBeTruthy()
        expect(document.querySelector('.content .caller-footer')).toBeFalsy()
      })

      it('should forward container scoped slot props as flat slot args', async () => {
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
        let captured: Record<string, unknown> | undefined

        const Content = defineComponent({
          name: 'PlainContent',
          setup() {
            return () => h('div', { class: 'content' }, 'body')
          },
        })

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            return () =>
              h(LayerTemplate, { to: dialog, container: true, name: 'footer' }, {
                default: (props: Record<string, unknown>) => {
                  captured = props
                  return h(
                    'button',
                    { class: 'caller-footer' },
                    String(props.confirmLoading),
                  )
                },
              })
          },
        })

        const wrapper = mount(Host)
        dialog.open()
        await wrapper.vm.$nextTick()
        await flushPromises()

        expect(document.body.querySelector('.caller-footer')?.textContent).toBe('true')
        expect(captured).toEqual({ confirmLoading: true })
        expect(captured).not.toHaveProperty('slotProps')
      })

      it('should override LayerTemplate from to defineLayer in layer context', async () => {
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

        let dialog!: LayerInstance
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
        expect(document.querySelector('.content .caller-footer')).toBeFalsy()
      })

      it('should keep to defineLayer template when caller targets a different slot name', async () => {
        const useLayer = createLayer(MultiSlotContainer)

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

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            return () =>
              h(LayerTemplate, { to: dialog, container: true, name: 'header' }, () =>
                h('span', { class: 'caller-header' }, 'caller'),
              )
          },
        })

        const wrapper = mount(Host)
        dialog.open()
        await wrapper.vm.$nextTick()
        await flushPromises()

        expect(document.body.querySelector('.creator-footer')?.textContent).toBe('creator')
        expect(document.body.querySelector('.caller-header')?.textContent).toBe('caller')
      })

      it('should let latter LayerTemplate win when the same container slot name is registered twice', async () => {
        const useLayer = createLayer(Container)

        const Content = defineComponent({
          name: 'PlainContent',
          setup() {
            return () => h('div', { class: 'content' }, 'body')
          },
        })

        let dialog!: LayerInstance
        const Host = defineComponent({
          setup() {
            dialog = useLayer(Content)
            return () => [
              h(LayerTemplate, { to: dialog, container: true, name: 'footer' }, () =>
                h('span', { class: 'first-footer' }, 'first'),
              ),
              h(LayerTemplate, { to: dialog, container: true, name: 'footer' }, () =>
                h('span', { class: 'second-footer' }, 'second'),
              ),
            ]
          },
        })

        const wrapper = mount(Host)
        dialog.open()
        await wrapper.vm.$nextTick()
        await flushPromises()

        expect(document.body.querySelector('.first-footer')).toBeFalsy()
        expect(document.body.querySelector('.second-footer')?.textContent).toBe('second')
      })
    })
  })

  describe('mixed usage', () => {
    it('should combine to LayerInstance content slot and to defineLayer container slot on the same open layer', async () => {
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'ContentWithHeaderSlot',
        setup(_props, { slots }) {
          const layer = defineLayer()
          return () =>
            h('div', { class: 'content' }, [
              h('div', { class: 'header-region' }, slots.header?.()),
              h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                h('span', { class: 'creator-footer' }, 'creator'),
              ),
            ])
        },
      })

      let dialog!: LayerInstance
      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () =>
            h(LayerTemplate, { to: dialog, name: 'header' }, () =>
              h('span', { class: 'caller-header' }, 'caller'),
            )
        },
      })

      const wrapper = mount(Host)
      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.caller-header')?.textContent).toBe('caller')
      expect(document.body.querySelector('.creator-footer')?.textContent).toBe('creator')
      expect(document.querySelector('.content .caller-header')).toBeTruthy()
      expect(document.querySelector('.content .creator-footer')).toBeFalsy()
    })

    it('should render on page and in layer independently when the same Content is on page and opened via useLayer', async () => {
      const useLayer = createLayer(Container)

      const SharedContent = defineComponent({
        name: 'SharedContent',
        props: { message: String },
        setup(props) {
          const layer = defineLayer()
          return () =>
            h('div', { class: 'shared-content' }, [
              h('span', { class: 'msg' }, props.message),
              h(LayerTemplate, { to: layer, name: 'footer', visibleOutside: true }, () =>
                h('button', { class: 'shared-footer' }, 'save'),
              ),
            ])
        },
      })

      let dialog!: LayerInstance
      const Host = defineComponent({
        setup() {
          dialog = useLayer(SharedContent)
          onMounted(() => dialog.open({ props: { message: 'dialog' } }))
          return () => h(SharedContent, { message: 'page' })
        },
      })

      const wrapper = mount(Host)
      await flushPromises()

      expect(wrapper.find('.shared-content .shared-footer').exists()).toBe(true)
      expect(wrapper.find('.msg').text()).toBe('page')

      const dialogContent = document.body.querySelector('motion-dialog .shared-content')
      expect(dialogContent?.querySelector('.msg')?.textContent).toBe('dialog')
      expect(dialogContent?.querySelector('.shared-footer')).toBeFalsy()
      expect(document.body.querySelector('motion-dialog .shared-footer')).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('should render nothing when default slot is empty with to defineLayer in layer context', async () => {
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'EmptyFooterContent',
        setup() {
          const layer = defineLayer()
          return () =>
            h('motion-div', { class: 'content' }, [
              h('span', { class: 'msg' }, 'body'),
              h(LayerTemplate, { to: layer, name: 'footer' }),
            ])
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

      expect(document.body.querySelector('motion-dialog')).toBeTruthy()
      expect(document.body.querySelector('.msg')?.textContent).toBe('body')
      expect(document.body.querySelector('.footer-btn')).toBeFalsy()
      expect(document.querySelector('.content .footer-btn')).toBeFalsy()
    })

    it('should render nothing when default slot is empty with to defineLayer outside layer and visible-outside', () => {
      const wrapper = mount(
        defineComponent({
          setup() {
            const layer = defineLayer()
            return () =>
              h(LayerTemplate, { to: layer, name: 'footer', visibleOutside: true })
          },
        }),
      )

      expect(wrapper.find('.footer-btn').exists()).toBe(false)
      expect(wrapper.element.textContent).toBe('')
    })

    it('should render nothing when default slot is empty with to LayerInstance into content slot', async () => {
      const useLayer = createLayer(Container)

      const Content = defineComponent({
        name: 'ContentWithExtraSlot',
        setup(_props, { slots }) {
          return () =>
            h('div', { class: 'content' }, [
              h('span', { class: 'msg' }, 'body'),
              h('div', { class: 'extra-region' }, slots.extra?.()),
            ])
        },
      })

      let dialog!: LayerInstance
      const Host = defineComponent({
        setup() {
          dialog = useLayer(Content)
          return () => h(LayerTemplate, { to: dialog, name: 'extra' })
        },
      })

      const wrapper = mount(Host)
      dialog.open()
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(document.body.querySelector('.msg')?.textContent).toBe('body')
      expect(document.body.querySelector('.extra-region')?.textContent).toBe('')
      expect(document.body.querySelector('.scoped-extra')).toBeFalsy()
    })
  })
})
