import Vue, { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer, LayerTemplate } from 'vue-layerx'
import { flushPromises, mountComponent, mountSetup } from '../helpers/dom'

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

/**
 * Stays mounted across close. `display` hides it so footer instances can survive
 * a reopen unless the delivered slot is keyed.
 */
const PersistentDialog = Vue.extend({
  name: 'PersistentDialog',
  model: { prop: 'value', event: 'input' },
  props: { value: Boolean },
  render(h) {
    return h('motion-dialog', { style: { display: this.value ? '' : 'none' } }, [
      this.$slots.default,
      h('div', { class: 'dialog-footer' }, this.$slots.footer),
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

  it('should remount defineLayer footer when the layer closes and opens again', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    let footerSetups = 0

    const FooterWidget = defineComponent({
      name: 'FooterWidget',
      setup() {
        footerSetups++
        return () => h('button', { class: 'footer-btn' }, 'ok')
      },
    })

    const Content = defineComponent({
      name: 'PersistentFooterContent',
      setup() {
        const layer = defineLayer()
        return () =>
          h('div', [
            h('span', { class: 'body' }, 'body'),
            h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [h(FooterWidget)]),
          ])
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(PersistentDialog)(Content)
    })

    dialog.open()
    await flushPromises()

    expect(footerSetups).toBe(1)
    expect(document.body.querySelector('.footer-btn')?.parentElement?.className).toBe(
      'dialog-footer',
    )

    dialog.close()
    await flushPromises()

    dialog.open()
    await flushPromises()

    expect(footerSetups).toBe(2)
    expect(document.body.querySelector('.footer-btn')?.parentElement?.className).toBe(
      'dialog-footer',
    )
    host.destroy()
  })

  /**
   * Regression: content key and footer LayerSlotFragment used to share numeric
   * `openId`, so Vue 2 reused the wrong sibling under a persistent (v-show)
   * dialog and dropped DOM click listeners on the second open.
   */
  it('should keep LayerTemplate footer closeOn click working after close and reopen', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>

    const Content = defineComponent({
      name: 'PersistentCloseOnFooterContent',
      emits: ['close'],
      setup(_, { emit }) {
        const layer = defineLayer({
          content: { closeOn: ['close'] },
        })
        return () =>
          h('div', [
            h('span', { class: 'body' }, 'body'),
            h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [
              h(
                'button',
                {
                  class: 'footer-close',
                  on: { click: () => emit('close') },
                },
                'close',
              ),
            ]),
          ])
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(PersistentDialog)(Content)
    })

    dialog.open()
    await flushPromises()
    expect(dialog.visible).toBe(true)

    document.body.querySelector<HTMLButtonElement>('.footer-close')?.click()
    await flushPromises()
    expect(dialog.visible).toBe(false)

    dialog.open()
    await flushPromises()
    expect(dialog.visible).toBe(true)

    document.body.querySelector<HTMLButtonElement>('.footer-close')?.click()
    await flushPromises()
    expect(dialog.visible).toBe(false)

    host.destroy()
  })

  it('should remount defineLayer slots footer when the layer closes and opens again', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    let footerSetups = 0

    const FooterWidget = defineComponent({
      name: 'DefineSlotFooterWidget',
      setup() {
        footerSetups++
        return () => h('button', { class: 'footer-btn' }, 'ok')
      },
    })

    const Content = defineComponent({
      name: 'PersistentDefineSlotContent',
      setup() {
        defineLayer({
          slots: { footer: () => h(FooterWidget) },
        })
        return () => h('div', { class: 'content' }, 'body')
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(PersistentDialog)(Content)
    })

    dialog.open()
    await flushPromises()

    expect(footerSetups).toBe(1)
    expect(document.body.querySelector('.footer-btn')?.parentElement?.className).toBe(
      'dialog-footer',
    )

    dialog.close()
    await flushPromises()

    dialog.open()
    await flushPromises()

    expect(footerSetups).toBe(2)
    expect(document.body.querySelector('.footer-btn')?.parentElement?.className).toBe(
      'dialog-footer',
    )
    host.destroy()
  })

  it('should keep defineLayer slots footer mounted when open is called while visible', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    let footerSetups = 0

    const FooterWidget = defineComponent({
      name: 'DefineSlotFooterWidget',
      setup() {
        footerSetups++
        return () => h('button', { class: 'footer-btn' }, 'ok')
      },
    })

    const Content = defineComponent({
      name: 'PersistentDefineSlotContent',
      setup() {
        defineLayer({
          slots: { footer: () => h(FooterWidget) },
        })
        return () => h('div', { class: 'content' }, 'body')
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(PersistentDialog)(Content)
    })

    dialog.open()
    await flushPromises()
    expect(footerSetups).toBe(1)

    dialog.open()
    await flushPromises()

    expect(footerSetups).toBe(1)
    host.destroy()
  })

  /**
   * Vue 2 has no Fragment: multi-child default slots are wrapped in `<layer-fragment>`.
   */
  it('should deliver multiple LayerTemplate footer children when the layer is open', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>

    const Content = defineComponent({
      name: 'MultiNodeFooterContent',
      setup() {
        const layer = defineLayer({ props: { title: 'MultiFooter' } })
        return () =>
          h('div', [
            h('span', { class: 'body' }, 'body'),
            h(LayerTemplate, { props: { to: layer, name: 'footer' } }, [
              h('button', { class: 'footer-cancel' }, 'cancel'),
              h('button', { class: 'footer-ok' }, 'ok'),
            ]),
          ])
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(ElementUiLikeDialog)(Content)
    })

    dialog.open()
    await flushPromises()

    const fragment = document.body.querySelector('.dialog-footer > layer-fragment')
    expect(fragment).toBeTruthy()
    expect(fragment?.querySelector('.footer-cancel')?.textContent).toBe('cancel')
    expect(fragment?.querySelector('.footer-ok')?.textContent).toBe('ok')
    host.destroy()
  })

  /**
   * Page-local visible-outside uses the same `toComponentRoot` shell when multi-child.
   */
  it('should render multiple LayerTemplate children on the page with visible-outside', () => {
    let layer!: ReturnType<typeof defineLayer>

    const Page = defineComponent({
      name: 'MultiNodeVisibleOutsidePage',
      setup() {
        layer = defineLayer()
        return () =>
          h('div', { class: 'page' }, [
            h(
              LayerTemplate,
              { props: { to: layer, name: 'footer', visibleOutside: true } },
              [
                h('button', { class: 'footer-cancel' }, 'cancel'),
                h('button', { class: 'footer-ok' }, 'ok'),
              ],
            ),
          ])
      },
    })

    const host = mountComponent(Page)

    expect(layer.exists).toBe(false)
    const fragment = document.body.querySelector('.page > layer-fragment')
    expect(fragment).toBeTruthy()
    expect(fragment?.querySelector('.footer-cancel')?.textContent).toBe('cancel')
    expect(fragment?.querySelector('.footer-ok')?.textContent).toBe('ok')
    host.destroy()
  })
})
