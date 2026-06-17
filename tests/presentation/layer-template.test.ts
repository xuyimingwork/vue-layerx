import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { LayerTemplate } from '../../src/presentation/components/layer-template'

describe('LayerTemplate', () => {
  it('renders nothing by default outside layer context', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(LayerTemplate, { name: 'footer' }, () =>
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
              LayerTemplate,
              { name: 'footer', visibleOutside: true },
              ({ outsideLayer, inLayer }: { outsideLayer: boolean; inLayer: boolean }) => [
                h('span', { class: 'scope-outside' }, String(outsideLayer)),
                h('span', { class: 'scope-layer' }, String(inLayer)),
                h('button', { class: 'footer-btn' }, 'footer'),
              ],
            )
        },
      }),
    )

    expect(wrapper.find('.footer-btn').exists()).toBe(true)
    expect(wrapper.find('.scope-outside').text()).toBe('true')
    expect(wrapper.find('.scope-layer').text()).toBe('false')
  })
})
