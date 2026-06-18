import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { LayerTemplateScope } from '@/core/types'
import { createLayer, LayerTemplate } from '@/index'
import { LayerComponent } from '@/__test__/fixtures/components'
import { LayerTemplate as LayerTemplateComponent } from '../layer-template'

describe('LayerTemplate', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing by default outside layer context', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(LayerTemplateComponent, { name: 'footer' }, () =>
              h('button', { class: 'footer-btn' }, 'footer'),
            )
        },
      }),
    )
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
  })

  it('renders with visibleOutside and passes outsideLayer scope', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              LayerTemplateComponent,
              { name: 'footer', visibleOutside: true },
              ({ outsideLayer, inLayer, slotProps }: LayerTemplateScope) => [
                h('span', { class: 'scope-outside' }, String(outsideLayer)),
                h('span', { class: 'scope-layer' }, String(inLayer)),
                h('span', { class: 'slot-props-empty' }, String(Object.keys(slotProps).length === 0)),
                h('button', { class: 'footer-btn' }, 'footer'),
              ],
            )
        },
      }),
    )

    expect(wrapper.find('.footer-btn').exists()).toBe(true)
    expect(wrapper.find('.scope-outside').text()).toBe('true')
    expect(wrapper.find('.scope-layer').text()).toBe('false')
    expect(wrapper.find('.slot-props-empty').text()).toBe('true')
  })

  it('fills content slot via contentTemplates registry when to is set', async () => {
    const useLayer = createLayer(LayerComponent)

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
    dialog.show()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.scoped-extra')).toBeTruthy()
  })

  it('forwards content slot props into slotProps when to is set', async () => {
    const useLayer = createLayer(LayerComponent)
    let captured: LayerTemplateScope | undefined

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
          h(LayerTemplate, { to: dialog, name: 'extra' }, (templateScope: LayerTemplateScope) => {
            captured = templateScope
            return h('span', { class: 'scoped-extra' }, String(templateScope.slotProps.token))
          })
      },
    })

    const wrapper = mount(Host)
    dialog.show()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.scoped-extra')?.textContent).toBe('abc')
    expect(captured).toEqual({
      inLayer: true,
      outsideLayer: false,
      slotProps: { token: 'abc' },
    })
  })
})
