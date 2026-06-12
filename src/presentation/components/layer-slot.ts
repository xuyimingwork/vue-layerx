import { computed, defineComponent, getCurrentInstance, inject, onMounted, type VNode } from 'vue'
import type { LayerSlotScope } from '../../domain/types'
import { isInDirectLayerContent } from '../../infrastructure/vue/context/in-layer-content'
import { LAYER_SLOT_CONTEXT_KEY } from '../../infrastructure/vue/di/injection-keys'

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
    const instance = getCurrentInstance()
    const inLayer = computed(() => ctx !== null && isInDirectLayerContent(instance))

    const renderSlot = (scope: LayerSlotScope): VNode | VNode[] | null =>
      slots.default?.(scope) ?? null

    expose({
      render: (): VNode | VNode[] | null =>
        renderSlot({ inLayer: true, inOutside: false }),
    })

    onMounted(() => {
      if (inLayer.value) ctx?.bumpSlots()
    })

    return () => {
      if (inLayer.value) return null
      if (!props.visibleOutside) return null
      return renderSlot({ inLayer: false, inOutside: true })
    }
  },
})
