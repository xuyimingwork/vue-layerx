import { defineComponent, h } from 'vue'
import { defineLayer, LayerTemplate } from '@/index'

/** Thin unit-only fixtures. Integration fixtures live in tests-vue3/. */

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

export const MinimalContainer = defineComponent({
  name: 'MinimalContainer',
  props: { modelValue: Boolean },
  setup(_props, { slots }) {
    return () => slots.default?.()
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
