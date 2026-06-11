import { defineComponent, inject, onMounted, type VNode } from 'vue'
import { LAYER_SLOT_CONTEXT_KEY } from './build-vnode'

export const LayerSlot = defineComponent({
  name: 'LayerSlot',
  setup(_, { slots, expose }) {
    const ctx = inject(LAYER_SLOT_CONTEXT_KEY, null)

    expose({
      render: (): VNode | VNode[] | null => slots.default?.() ?? null,
    })

    onMounted(() => {
      ctx?.bumpSlots()
    })

    return () => null
  },
})
