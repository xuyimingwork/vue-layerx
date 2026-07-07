import { defineComponent, h, onMounted } from 'vue'
import { defineLayer, LayerTemplate, createLayer } from '@/index'
import type { LayerConfigStatic } from '@/index'
import { LAYER_CONTENT } from '@/shared/contracts'
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

export function makeContentWithDefineLayer(config: LayerConfigStatic = {}) {
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

export const LayerContentMarker = defineComponent({
  name: 'LayerContentMarker',
  props: { [LAYER_CONTENT]: Boolean },
  setup() {
    return () => null
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
