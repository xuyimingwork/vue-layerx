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
  setup(props, { slots, emit }) {
    return () =>
      props.value
        ? h(
            'motion-dialog',
            { attrs: { 'data-title': props.title, 'data-width': props.width } },
            [
              slots.default?.(undefined as never),
              slots.footer?.(undefined as never),
              h(
                'button',
                {
                  class: 'close-via-model',
                  on: { click: () => emit('input', false) },
                },
                'close',
              ),
            ],
          )
        : null
  },
})

/** Custom container model `visible` + `update:visible` (covers non-default toModelUpdateProp). */
export const VisibleModelContainer = defineComponent({
  name: 'VisibleModelContainer',
  model: { prop: 'visible', event: 'update:visible' },
  props: {
    visible: Boolean,
    title: String,
  },
  setup(props, { slots, emit }) {
    return () =>
      props.visible
        ? h(
            'motion-dialog',
            { attrs: { 'data-title': props.title, 'data-model': 'visible' } },
            [
              slots.default?.(undefined as never),
              h(
                'button',
                {
                  class: 'close-via-model',
                  on: { click: () => emit('update:visible', false) },
                },
                'close',
              ),
            ],
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

/** Monolith dialog for LayerNoContainer (Vue 2.7 default `value` model). */
export const MonolithDialog = defineComponent({
  name: 'MonolithDialog',
  props: {
    value: Boolean,
    title: String,
    width: String,
    mode: String,
  },
  setup(props, { emit, slots }) {
    return () =>
      props.value
        ? h(
            'motion-monolith',
            {
              attrs: {
                'data-title': props.title,
                'data-width': props.width,
                'data-mode': props.mode,
              },
            },
            [
              slots.default?.(undefined as never),
              h(
                'button',
                {
                  class: 'close-via-model',
                  on: { click: () => emit('input', false) },
                },
                'close',
              ),
            ],
          )
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

export function queryBodyMonolith() {
  return document.body.querySelector('motion-monolith')
}
