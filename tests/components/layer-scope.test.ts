import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, LayerScope, LayerTemplate } from '../../src'
import { LayerComponent } from '../fixtures/components'

describe('LayerScope', () => {
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
          h(LayerScope, { of: dialog }, () =>
            h(LayerTemplate, { name: 'extra' }, () =>
              h('span', { class: 'scoped-extra' }, 'from scope'),
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
})
