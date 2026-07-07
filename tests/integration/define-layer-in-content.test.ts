import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer, LayerTemplate, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('defineLayer in content', () => {
  it('should not activate defineLayer when content is used outside layer context', () => {
    const Content = makeContent(true)
    const wrapper = mount(Content, { props: { message: 'page' } })
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
    expect(wrapper.find('.done').exists()).toBe(true)
  })

  it('should not bind nested defineLayer to parent layer', async () => {
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
              () => h('button', { class: 'inner-footer' }, 'inner'),
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
    expect(document.body.querySelector('.inner .inner-footer')).toBeTruthy()
  })
})
