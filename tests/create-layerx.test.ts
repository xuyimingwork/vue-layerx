import { defineComponent, h, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createLayerx } from '../src/create-layerx'
import type { LayerComponent } from '../src/types'

const Shell = defineComponent({
  name: 'Shell',
  props: { modelValue: Boolean, title: String },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('motion-dialog', { 'data-title': props.title }, slots.default?.())
        : null
  },
})

const Inner = defineComponent({
  name: 'Inner',
  props: { message: String },
  emits: ['done'],
  setup(props, { emit, slots }) {
    return () =>
      h('motion-div', { class: 'inner' }, [
        h('span', { class: 'msg' }, props.message),
        slots.default?.(),
        h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
      ])
  },
})

function queryBodyDialog() {
  return document.body.querySelector('motion-dialog')
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createLayerx', () => {
  it('opens via .show() without template mount (body)', async () => {
    const useLayer = createLayerx(Shell, { props: { title: 'Create' } })
    let Dialog!: LayerComponent

    const Host = defineComponent({
      setup() {
        Dialog = useLayer(Inner)
        onMounted(() => Dialog.show({ message: 'hello' }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Create')
  })

  it('opens via .show() with template mount (in-tree)', async () => {
    const useLayer = createLayerx(Shell, { props: { title: 'InTree' } })
    let Dialog!: LayerComponent

    const Host = defineComponent({
      setup() {
        Dialog = useLayer(Inner)
        return () => h('motion-host', [h(Dialog)])
      },
    })

    const wrapper = mount(Host)
    Dialog.show({ message: 'in-tree' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('motion-dialog').exists()).toBe(true)
    expect(wrapper.find('.msg').text()).toBe('in-tree')
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('closes on closeOn inner events', async () => {
    const useLayer = createLayerx(Shell)
    let Dialog!: LayerComponent

    const Host = defineComponent({
      setup() {
        Dialog = useLayer(Inner, { closeOn: ['done'] })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    Dialog.show({ message: 'x' })
    await wrapper.vm.$nextTick()

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('merges template attrs and default slot into inner', async () => {
    const useLayer = createLayerx(Shell)
    const Dialog = useLayer(Inner)

    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Dialog,
            { message: 'from-template', 'data-id': '42' },
            { default: () => h('em', { class: 'extra' }, 'slot') },
          )
      },
    })

    const wrapper = mount(Host)
    Dialog.show()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.msg').text()).toBe('from-template')
    expect(wrapper.find('.extra').text()).toBe('slot')
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('exposes .hide()', async () => {
    const useLayer = createLayerx(Shell)
    let Dialog!: LayerComponent

    const Host = defineComponent({
      setup() {
        Dialog = useLayer(Inner)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    Dialog.show({ message: 'a' })
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeTruthy()

    Dialog.hide()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })
})
