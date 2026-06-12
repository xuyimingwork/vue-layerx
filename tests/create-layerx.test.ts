import { defineComponent, h, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createLayerx, LayerSlot } from '../src'
import type { LayerInstance } from '../src/types'

const LayerComponent = defineComponent({
  name: 'LayerComponent',
  props: { modelValue: Boolean, title: String, width: String },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('motion-dialog', { 'data-title': props.title, 'data-width': props.width }, [
            slots.default?.(),
            slots.footer?.(),
          ])
        : null
  },
})

function makeContent(useLayer: ReturnType<typeof createLayerx>, withLayer = false) {
  return defineComponent({
    name: 'Content',
    props: { message: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      const footerRef = ref()

      if (withLayer) {
        useLayer.layer({
          props: { title: 'FromLayer', width: '600px' },
          slots: { footer: footerRef },
        })
      }

      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message),
          withLayer
            ? h(LayerSlot, { ref: footerRef }, () =>
                h('button', { class: 'footer-btn' }, 'footer'),
              )
            : null,
          h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
          h('button', { class: 'cancel', onClick: () => emit('cancel') }, 'cancel'),
        ])
    },
  })
}

function queryBodyDialog() {
  return document.body.querySelector('motion-dialog')
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createLayerx', () => {
  it('opens via .show() without template (body)', async () => {
    const useLayer = createLayerx(LayerComponent, {
      props: { title: 'Create', width: '400px' },
    })
    const Content = makeContent(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.show({ props: { message: 'hello' } }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Create')
    expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
  })

  it('merges config: show > useDialog > layer() > createLayerx', async () => {
    const useLayer = createLayerx(LayerComponent, {
      props: { title: 'Default', width: '400px' },
    })
    const Content = makeContent(useLayer, true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, {
          layer: { props: { width: '640px' } },
        })
        onMounted(() =>
          dialog.show({
            props: { message: 'merged' },
            layer: { props: { title: 'FromShow' } },
          }),
        )
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    const el = queryBodyDialog()
    expect(el?.getAttribute('data-title')).toBe('FromShow')
    expect(el?.getAttribute('data-width')).toBe('640px')
  })

  it('merges default content props from createLayerx', async () => {
    const useLayer = createLayerx(LayerComponent, {
      content: { props: { message: 'default-msg' } },
    })
    const Content = makeContent(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.show())
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.msg')?.textContent).toBe('default-msg')
  })

  it('renders layer() LayerSlot content into layer slot', async () => {
    const useLayer = createLayerx(LayerComponent)
    const Content = makeContent(useLayer, true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.show({ props: { message: 'slot' } }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.footer-btn')).toBeTruthy()
    expect(document.querySelector('.content .footer-btn')).toBeFalsy()
  })

  it('closes on hideOn content events', async () => {
    const useLayer = createLayerx(LayerComponent)
    const Content = makeContent(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, { hideOn: ['done'] })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.show({ props: { message: 'x' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('show hideOn works when useDialog has no hideOn', async () => {
    const useLayer = createLayerx(LayerComponent)
    const Content = makeContent(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.show({ props: { message: 'x' }, hideOn: ['done'] })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('exposes .hide()', async () => {
    const useLayer = createLayerx(LayerComponent)
    const Content = makeContent(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.show({ props: { message: 'a' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()).toBeTruthy()

    dialog.hide()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('clone() creates independent instance', async () => {
    const useLayer = createLayerx(LayerComponent, { props: { title: 'Base' } })
    const Content = makeContent(useLayer)
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content, { layer: { props: { title: 'Base' } } })
        cloned = base.clone({ layer: { props: { title: 'Cloned' } } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.show({ props: { message: 'base' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Base')

    base.hide()
    await wrapper.vm.$nextTick()

    cloned.show({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Cloned')
    expect(document.body.querySelector('.msg')?.textContent).toBe('cloned')
  })

  it('layer() does not activate when content used outside layer', () => {
    const useLayer = createLayerx(LayerComponent)
    const Content = makeContent(useLayer, true)

    const wrapper = mount(Content, { props: { message: 'page' } })
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
    expect(wrapper.find('.done').exists()).toBe(true)
  })
})
