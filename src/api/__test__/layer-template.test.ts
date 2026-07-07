import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { LayerTemplateScope } from '@/types'
import { createLayer, defineLayer, LayerTemplate } from '@/index'
import { Container } from '@tests/fixtures/components'
import { flushPromises } from '@tests/helpers/dom'
import { LayerTemplate as LayerTemplateComponent } from '../layer-template'

describe('LayerTemplate', () => {
  it('should render nothing when used outside layer context without visibleOutside', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const layer = defineLayer()
          return () =>
            h(LayerTemplateComponent, { to: layer, name: 'footer' }, () =>
              h('button', { class: 'footer-btn' }, 'footer'),
            )
        },
      }),
    )
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
  })

  it('should render with outsideLayer scope when visibleOutside is true', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const layer = defineLayer()
          return () =>
            h(
              LayerTemplateComponent,
              { to: layer, name: 'footer', visibleOutside: true },
              {
                default: ({ outsideLayer, inLayer, slotProps }: LayerTemplateScope) => [
                  h('span', { class: 'scope-outside' }, String(outsideLayer)),
                  h('span', { class: 'scope-layer' }, String(inLayer)),
                  h('span', { class: 'slot-props-empty' }, String(Object.keys(slotProps).length === 0)),
                  h('button', { class: 'footer-btn' }, 'footer'),
                ],
              },
            )
        },
      }),
    )

    expect(wrapper.find('.footer-btn').exists()).toBe(true)
    expect(wrapper.find('.scope-outside').text()).toBe('true')
    expect(wrapper.find('.scope-layer').text()).toBe('false')
    expect(wrapper.find('.slot-props-empty').text()).toBe('true')
  })

  it('should render bound slot content when to is set and layer is open', async () => {
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

  it('should forward content slot props when to is set', async () => {
    const useLayer = createLayer(Container)
    let captured: Record<string, unknown> | undefined

    const Content = defineComponent({
      name: 'ScopedContent',
      setup(_props, { slots }) {
        return () =>
          h('div', { class: 'content' }, slots.extra?.({ token: 'abc' }))
      },
    })

    let dialog = useLayer(Content)

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () =>
          h(LayerTemplate, { to: dialog, name: 'extra' }, {
            default: (props: Record<string, unknown>) => {
              captured = props
              return h('span', { class: 'scoped-extra' }, String(props.token))
            },
          })
      },
    })

    const wrapper = mount(Host)
    dialog.open()
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(document.body.querySelector('.scoped-extra')?.textContent).toBe('abc')
    expect(captured).toEqual({ token: 'abc' })
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
