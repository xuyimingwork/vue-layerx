import { defineComponent, h } from 'vue'

/** Monolith dialog: shell embedded in content (use with LayerNoContainer). */
export const MonolithDialog = defineComponent({
  name: 'MonolithDialog',
  props: {
    modelValue: Boolean,
    title: String,
    width: String,
    mode: String,
  },
  emits: ['update:modelValue', 'success'],
  setup(props, { emit, slots }) {
    return () =>
      props.modelValue
        ? h(
            'motion-monolith',
            {
              'data-title': props.title,
              'data-width': props.width,
              'data-mode': props.mode,
            },
            [
              slots.default?.(),
              h(
                'button',
                { class: 'success', onClick: () => emit('success') },
                'ok',
              ),
              h(
                'button',
                {
                  class: 'close-via-model',
                  onClick: () => emit('update:modelValue', false),
                },
                'close',
              ),
            ],
          )
        : null
  },
})

export function queryBodyMonolith() {
  return document.body.querySelector('motion-monolith')
}
