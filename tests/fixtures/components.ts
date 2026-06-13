import { defineComponent, h, onMounted, ref } from 'vue'
import { createLayerx, LayerTemplate } from '../../src'
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

export function makeContent(useLayer: ReturnType<typeof createLayerx>, withLayer = false) {
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
            ? h(LayerTemplate, { ref: footerRef }, () =>
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

export function createMountedDialog(
  setup: (useLayer: ReturnType<typeof createLayerx>) => {
    dialog: LayerInstance
    Content: ReturnType<typeof makeContent>
    onMounted?: () => void
  },
  layerxOptions?: Parameters<typeof createLayerx>[1],
  withLayer = false,
) {
  const useLayer = createLayerx(LayerComponent, layerxOptions)
  let dialog!: LayerInstance
  let Content!: ReturnType<typeof makeContent>
  let onMountedCb: (() => void) | undefined

  const result = setup(useLayer)
  dialog = result.dialog
  Content = result.Content
  onMountedCb = result.onMounted

  const Host = defineComponent({
    setup() {
      const { dialog: d, Content: C, onMounted: cb } = setup(useLayer)
      dialog = d
      Content = C
      onMountedCb = cb
      if (onMountedCb) onMounted(onMountedCb)
      return () => h('motion-host')
    },
  })

  return { useLayer, dialog, Content, Host }
}
