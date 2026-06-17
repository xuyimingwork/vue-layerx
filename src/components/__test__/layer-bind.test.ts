import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, afterEach } from 'vitest'
import type { LayerTemplateScope } from '@/core/types'
import { createLayer, LayerBind, LayerTemplate } from '@/index'
import { LayerComponent } from '@/__test__/fixtures/components'

describe('LayerBind', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('fills content slot via contentTemplates registry', async () => {
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
          h(LayerBind, { to: dialog }, () =>
            h(LayerTemplate, { name: 'extra' }, () =>
              h('span', { class: 'scoped-extra' }, 'from bind'),
            ),
          )
      },
    })

    const wrapper = mount(Host)
    dialog.show()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.scoped-extra')).toBeTruthy()
  })

  it('forwards content slot props into LayerTemplate slotProps', async () => {
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
          h(LayerBind, { to: dialog }, () =>
            h(LayerTemplate, { name: 'extra' }, (templateScope: LayerTemplateScope) => {
              captured = templateScope
              return h('span', { class: 'scoped-extra' }, String(templateScope.slotProps.token))
            }),
          )
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
