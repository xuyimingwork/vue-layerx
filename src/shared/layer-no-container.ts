import { defineComponent } from 'vue'

/**
 * Shared identity marker (transparent container): no outer dialog shell.
 * Implemented as a component so it can sit in `container.component`;
 * renderers key off `=== LayerNoContainer` for props projection / tree shape.
 */
export const LayerNoContainer = defineComponent({
  name: 'LayerNoContainer',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => slots.default?.() ?? null
  },
})
