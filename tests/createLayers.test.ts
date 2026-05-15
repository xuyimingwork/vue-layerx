import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayers } from '../src/createLayers'

const Shell = defineComponent({
  name: 'Shell',
  props: { modelValue: Boolean, title: String },
  emits: ['update:modelValue'],
  setup(props, { slots, emit }) {
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
      h('div', { class: 'inner' }, [
        h('span', { class: 'msg' }, props.message),
        slots.default?.(),
        h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
      ])
  },
})

describe('createLayers', () => {
  it('opens imperatively via .show() and passes payload props', async () => {
    const useLayer = createLayers(Shell, { props: { title: 'Create' } })
    const CreateDialog = useLayer(Inner)

    const Host = defineComponent({
      setup() {
        return () => h(CreateDialog)
      },
    })

    const wrapper = mount(Host)
    expect(wrapper.find('motion-dialog').exists()).toBe(false)

    CreateDialog.show({ message: 'hello' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('motion-dialog').exists()).toBe(true)
    expect(wrapper.find('.msg').text()).toBe('hello')
    expect(wrapper.find('motion-dialog').attributes('data-title')).toBe('Create')
  })

  it('closes on shell v-model and closeOn inner events', async () => {
    const useLayer = createLayers(Shell)
    const Dialog = useLayer(Inner, { closeOn: ['done'] })

    const Host = defineComponent({
      setup() {
        return () => h(Dialog)
      },
    })

    const wrapper = mount(Host)
    Dialog.show({ message: 'x' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('motion-dialog').exists()).toBe(true)

    await wrapper.find('.done').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('motion-dialog').exists()).toBe(false)
  })

  it('merges template attrs and default slot into inner', async () => {
    const useLayer = createLayers(Shell)
    const Dialog = useLayer(Inner)

    const id = ref('42')
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Dialog,
            { message: 'from-template', 'data-id': id.value },
            { default: () => h('em', { class: 'extra' }, 'slot') },
          )
      },
    })

    const wrapper = mount(Host)
    Dialog.show()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.msg').text()).toBe('from-template')
    expect(wrapper.find('.extra').text()).toBe('slot')
  })

  it('exposes .hide()', async () => {
    const useLayer = createLayers(Shell)
    const Dialog = useLayer(Inner)

    const wrapper = mount(defineComponent({
      setup: () => () => h(Dialog),
    }))

    Dialog.show({ message: 'a' })
    await wrapper.vm.$nextTick()
    Dialog.hide()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('motion-dialog').exists()).toBe(false)
  })
})
