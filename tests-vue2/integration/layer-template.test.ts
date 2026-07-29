import Vue, { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer, LayerTemplate } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'

/**
 * Options API + `$slots.footer` — same gate as Element UI Dialog template.
 * Requires Vue 2.6 `scopedSlots[name].proxy = true` to reverse-proxy onto `$slots`.
 */
const ElementUiLikeDialog = Vue.extend({
  name: 'ElementUiLikeDialog',
  model: { prop: 'value', event: 'input' },
  props: {
    value: Boolean,
    title: String,
  },
  render(h) {
    if (!this.value) return null as never
    return h('motion-dialog', { attrs: { 'data-title': this.title } }, [
      this.$slots.default,
      this.$slots.footer
        ? h('div', { class: 'dialog-footer' }, this.$slots.footer)
        : null,
    ])
  },
})

describe('LayerTemplate (Vue 2.7)', () => {
  it('should deliver footer when container gates on $slots.footer (Element UI)', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>

    const Content = defineComponent({
      name: 'FooterContent',
      setup() {
        const layer = defineLayer({ props: { title: 'WithFooter' } })
        return () =>
          h('div', [
            h('span', { class: 'body' }, 'body'),
            h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [
              h('button', { class: 'footer-btn' }, 'ok'),
            ]),
          ])
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(ElementUiLikeDialog)(Content)
    })

    dialog.open()
    await flushPromises()

    expect(document.body.querySelector('.body')).toBeTruthy()
    expect(document.body.querySelector('.dialog-footer .footer-btn')?.textContent).toBe(
      'ok',
    )
    host.destroy()
  })
})
