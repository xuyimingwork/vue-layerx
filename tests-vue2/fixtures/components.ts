import { defineComponent, h } from 'vue'

/** Vue 2.7 shell: default model is `value` + `input` (aligned with Vue 3 modelValue). */
export const Container = defineComponent({
  name: 'Container',
  model: { prop: 'value', event: 'input' },
  props: {
    value: Boolean,
    title: String,
    width: String,
  },
  setup(props, { slots }) {
    return () =>
      props.value
        ? h(
            'motion-dialog',
            { attrs: { 'data-title': props.title, 'data-width': props.width } },
            [slots.default?.(undefined as never), slots.footer?.(undefined as never)],
          )
        : null
  },
})

export const DrawerContainer = defineComponent({
  name: 'DrawerContainer',
  model: { prop: 'value', event: 'input' },
  props: {
    value: Boolean,
    size: String,
  },
  setup(props, { slots }) {
    return () =>
      props.value
        ? h('motion-drawer', { attrs: { 'data-size': props.size } }, [
            slots.default?.(undefined as never),
          ])
        : null
  },
})

export function makeContent() {
  return defineComponent({
    name: 'Content',
    props: { message: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message as string),
          h(
            'button',
            { class: 'done', on: { click: () => emit('done') } },
            'done',
          ),
          h(
            'button',
            { class: 'cancel', on: { click: () => emit('cancel') } },
            'cancel',
          ),
        ])
    },
  })
}

export function queryBodyDialog() {
  return document.body.querySelector('motion-dialog')
}
