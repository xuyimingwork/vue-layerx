import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { LayerSlot } from '../../src/presentation/components/layer-slot'

describe('LayerSlot', () => {
  it('renders nothing by default outside layer context', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(LayerSlot, null, () => h('button', { class: 'footer-btn' }, 'footer'))
        },
      }),
    )
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
  })

  it('renders with visibleOutside and passes inOutside scope', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              LayerSlot,
              { visibleOutside: true },
              ({ inOutside, inLayer }: { inOutside: boolean; inLayer: boolean }) => [
                h('span', { class: 'scope-outside' }, String(inOutside)),
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

  it('exposes render() for layer slot delegation', () => {
    let exposed: { render: () => unknown } | undefined

    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              LayerSlot,
              {
                ref: (el: { render: () => unknown } | null) => {
                  exposed = el ?? undefined
                },
              },
              ({ inLayer }: { inLayer: boolean }) =>
                h('span', { class: 'exposed' }, String(inLayer)),
            )
        },
      }),
    )

    const vnode = exposed?.render()
    expect(vnode).toBeTruthy()
  })
})
