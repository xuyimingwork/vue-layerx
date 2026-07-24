import { defineComponent } from 'vue'

/**
 * Public marker / transparent container: no outer dialog shell.
 * createLayerViewVNode keeps the same Teleport + default-slot anchor tree as
 * real shells (so ElDialog → LayerNoContainer swap can park content), and
 * projects container props onto content (modelValue, create defaults).
 */
export const LayerNoContainer = defineComponent({
  name: 'LayerNoContainer',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => slots.default?.() ?? null
  },
})
