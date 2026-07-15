import { defineComponent } from 'vue'

/**
 * Public marker container: no outer shell.
 * When used as createLayer's container (or swapped in via adapter / use / open),
 * createLayerViewVNode flattens to h(content) with content props overriding container props.
 */
export const LayerNoContainer = defineComponent({
  name: 'LayerNoContainer',
  setup(_, { slots }) {
    return () => slots.default?.() ?? null
  },
})
