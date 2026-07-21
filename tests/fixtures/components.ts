import { defineComponent, h, onMounted } from 'vue'
import { defineLayer, LayerTemplate, createLayer } from '@/index'
import type { LayerConfigContainer } from '@/index'
import type { LayerInstance } from '@/types'

export const Container = defineComponent({
  name: 'Container',
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

/**
 * Shell stays open while `showDefault` toggles the default slot.
 * Used to assert: same-component slot unmount → destroy content (not park).
 */
export const ToggleDefaultSlotContainer = defineComponent({
  name: 'ToggleDefaultSlotContainer',
  props: {
    modelValue: Boolean,
    showDefault: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h(
            'motion-dialog',
            { 'data-show-default': String(props.showDefault) },
            [
              props.showDefault ? slots.default?.() : null,
              slots.footer?.(),
            ],
          )
        : null
  },
})

/**
 * Drawer shell with toggleable default slot.
 * Used with Container swap: new component mounts before default appears → park.
 */
export const ToggleDefaultSlotDrawerContainer = defineComponent({
  name: 'ToggleDefaultSlotDrawerContainer',
  props: {
    modelValue: Boolean,
    showDefault: { type: Boolean, default: true },
    size: String,
  },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h(
            'motion-drawer',
            {
              'data-show-default': String(props.showDefault),
              'data-size': props.size,
            },
            props.showDefault ? slots.default?.() : null,
          )
        : null
  },
})

export function makeContent(withLayer = false) {
  return defineComponent({
    name: 'Content',
    props: { message: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      const layer = withLayer
        ? defineLayer({
            props: { title: 'FromLayer', width: '600px' },
          })
        : null

      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message),
          layer
            ? h(LayerTemplate, { to: layer, name: 'footer' }, () =>
                h('button', { class: 'footer-btn' }, 'footer'),
              )
            : null,
          h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
          h('button', { class: 'cancel', onClick: () => emit('cancel') }, 'cancel'),
        ])
    },
  })
}

export function makeContentWithDefineLayer(config: LayerConfigContainer = {}) {
  return defineComponent({
    name: 'ContentWithDefineLayer',
    props: { message: String, mode: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      defineLayer(config)
      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message),
          h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
          h('button', { class: 'cancel', onClick: () => emit('cancel') }, 'cancel'),
        ])
    },
  })
}

export function queryBodyDialog() {
  return document.body.querySelector('motion-dialog')
}

export function queryAllBodyDialogs() {
  return document.body.querySelectorAll('motion-dialog')
}

export const MinimalContainer = defineComponent({
  name: 'MinimalContainer',
  props: { modelValue: Boolean },
  setup(_props, { slots }) {
    return () => slots.default?.()
  },
})

export function createMountedDialog(
  setup: (useLayer: ReturnType<typeof createLayer>) => {
    dialog: LayerInstance
    Content: ReturnType<typeof makeContent>
    onMounted?: () => void
  },
  createConfig?: Parameters<typeof createLayer>[1],
  withLayer = false,
) {
  const useLayer = createLayer(Container, createConfig)
  let dialog!: LayerInstance
  let Content!: ReturnType<typeof makeContent>

  const Host = defineComponent({
    setup() {
      const result = setup(useLayer)
      dialog = result.dialog
      Content = result.Content
      if (result.onMounted) onMounted(result.onMounted)
      return () => h('motion-host')
    },
  })

  return { useLayer, dialog, Content, Host }
}
