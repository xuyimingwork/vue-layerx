import { computed, defineComponent, inject, onMounted, type VNode } from 'vue'
import { LAYER_SLOT_CONTEXT_KEY } from './build-vnode'
import type { LayerSlotScope } from './types'

export const LayerSlot = defineComponent({
  name: 'LayerSlot',
  props: {
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, expose }) {
    const ctx = inject(LAYER_SLOT_CONTEXT_KEY, null)
    const inLayer = computed(() => ctx !== null)

    const renderSlot = (scope: LayerSlotScope): VNode | VNode[] | null =>
      slots.default?.(scope) ?? null

    expose({
      render: (): VNode | VNode[] | null =>
        renderSlot({ inLayer: true, inOutside: false }),
    })

    onMounted(() => {
      ctx?.bumpSlots()
    })

    return () => {
      if (inLayer.value) return null
      if (!props.visibleOutside) return null
      return renderSlot({ inLayer: false, inOutside: true })
    }
  },
})
