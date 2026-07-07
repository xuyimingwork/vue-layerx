import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer, LayerTemplate } from '@/index'
import type { LayerInstance, LayerTemplateScope } from '@/types'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('createLayer / layer template', () => {
  it('should render defineLayer LayerTemplate content into container slot', async () => {
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

  it('should not activate defineLayer when content is used outside layer context', () => {
    const Content = makeContent(true)
    const wrapper = mount(Content, { props: { message: 'page' } })
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
    expect(wrapper.find('.done').exists()).toBe(true)
  })

  it('should not bind nested defineLayer and LayerTemplate to parent layer', async () => {
    const useLayer = createLayer(Container)

    const InnerContent = defineComponent({
      name: 'InnerContent',
      setup() {
        const layer = defineLayer({
          props: { title: 'InnerShouldNotApply' },
        })

        return () =>
          h('div', { class: 'inner' }, [
            h(
              LayerTemplate,
              { to: layer, name: 'footer', visibleOutside: true },
              {
                default: ({ inLayer, outsideLayer, slotProps }: LayerTemplateScope) => [
                  h('span', { class: 'inner-in-layer' }, String(inLayer)),
                  h('span', { class: 'inner-outside-layer' }, String(outsideLayer)),
                  h('span', { class: 'inner-slot-props-empty' }, String(Object.keys(slotProps).length === 0)),
                  h('button', { class: 'inner-footer' }, 'inner'),
                ],
              },
            ),
          ])
      },
    })

    const OuterContent = defineComponent({
      name: 'OuterContent',
      setup() {
        const layer = defineLayer({
          props: { title: 'OuterTitle' },
        })

        return () =>
          h('div', { class: 'outer' }, [
            h('span', { class: 'outer-msg' }, 'outer'),
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

    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('OuterTitle')
    expect(document.body.querySelector('.outer-footer')).toBeTruthy()
    expect(document.body.querySelector('.inner-in-layer')?.textContent).toBe('false')
    expect(document.body.querySelector('.inner-outside-layer')?.textContent).toBe('true')
    expect(document.body.querySelector('.inner .inner-footer')).toBeTruthy()
  })

  it('should pass inLayer scope when LayerTemplate content is rendered into container slot', async () => {
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

  it('should forward layer scoped slot props into LayerTemplate slotProps', async () => {
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
})
