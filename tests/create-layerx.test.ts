import { defineComponent, h, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createLayerx, LayerSlot } from '../src'
import type { LayerInstance } from '../src/types'

const Shell = defineComponent({
  name: 'Shell',
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

function makeInner(useLayer: ReturnType<typeof createLayerx>, withBind = false) {
  return defineComponent({
    name: 'Inner',
    props: { message: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      const footerRef = ref()

      if (withBind) {
        useLayer.bind({
          props: { title: 'FromBind', width: '600px' },
          slots: { footer: footerRef },
          hideOn: ['done'],
        })
      }

      return () =>
        h('motion-div', { class: 'inner' }, [
          h('span', { class: 'msg' }, props.message),
          withBind
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
    const useLayer = createLayerx(Shell, { props: { title: 'Create', width: '400px' } })
    const Inner = makeInner(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Inner)
        onMounted(() => dialog.show({ message: 'hello' }))
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

  it('merges config: show > useDialog > bind > createLayerx', async () => {
    const useLayer = createLayerx(Shell, {
      props: { title: 'Default', width: '400px' },
    })
    const Inner = makeInner(useLayer, true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Inner, {
          layer: { props: { width: '640px' } },
        })
        onMounted(() =>
          dialog.show({
            message: 'merged',
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

  it('renders bind LayerSlot content into shell slot', async () => {
    const useLayer = createLayerx(Shell)
    const Inner = makeInner(useLayer, true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Inner)
        onMounted(() => dialog.show({ message: 'slot' }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.footer-btn')).toBeTruthy()
    expect(document.querySelector('.inner .footer-btn')).toBeFalsy()
  })

  it('closes on hideOn inner events', async () => {
    const useLayer = createLayerx(Shell)
    const Inner = makeInner(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Inner, { hideOn: ['done'] })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.show({ message: 'x' })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('bind hideOn works when useDialog has no hideOn', async () => {
    const useLayer = createLayerx(Shell)
    const Inner = makeInner(useLayer, true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Inner)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.show({ message: 'x' })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('exposes .hide()', async () => {
    const useLayer = createLayerx(Shell)
    const Inner = makeInner(useLayer)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Inner)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.show({ message: 'a' })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()).toBeTruthy()

    dialog.hide()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('clone() creates independent instance', async () => {
    const useLayer = createLayerx(Shell, { props: { title: 'Base' } })
    const Inner = makeInner(useLayer)
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Inner, { layer: { props: { title: 'Base' } } })
        cloned = base.clone({ layer: { props: { title: 'Cloned' } } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.show({ message: 'base' })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Base')

    base.hide()
    await wrapper.vm.$nextTick()

    cloned.show({ message: 'cloned' })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Cloned')
    expect(document.body.querySelector('.msg')?.textContent).toBe('cloned')
  })

  it('bind does not activate when Inner used outside layer', () => {
    const useLayer = createLayerx(Shell)
    const Inner = makeInner(useLayer, true)

    const wrapper = mount(Inner, { props: { message: 'page' } })
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
    expect(wrapper.find('.done').exists()).toBe(true)
  })
})
