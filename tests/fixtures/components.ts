import { defineComponent, h, onMounted } from 'vue'
import { defineLayer, LayerTemplate, createLayer } from '../../src'
import type { LayerInstance } from '../../src/domain/types'

export const LayerComponent = defineComponent({
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

export function makeContent(withLayer = false) {
  return defineComponent({
    name: 'Content',
    props: { message: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      if (withLayer) {
        defineLayer({
          props: { title: 'FromLayer', width: '600px' },
        })
      }

      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message),
          withLayer
            ? h(LayerTemplate, { name: 'footer' }, () =>
                h('button', { class: 'footer-btn' }, 'footer'),
              )
            : null,
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

export function createMountedDialog(
  setup: (useLayer: ReturnType<typeof createLayer>) => {
    dialog: LayerInstance
    Content: ReturnType<typeof makeContent>
    onMounted?: () => void
  },
  layerDefaults?: Parameters<typeof createLayer>[1],
  withLayer = false,
) {
  const useLayer = createLayer(LayerComponent, layerDefaults)
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
