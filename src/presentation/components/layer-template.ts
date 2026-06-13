import { computed, defineComponent, getCurrentInstance, inject, onMounted, type VNode } from 'vue'
import type { LayerTemplateScope } from '../../domain/types'
import { isInDirectLayerContent } from '../../infrastructure/vue/context/in-layer-content'
import { LAYER_TEMPLATE_CONTEXT_KEY } from '../../infrastructure/vue/di/injection-keys'

export const LayerTemplate = defineComponent({
  name: 'LayerTemplate',
  props: {
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, expose }) {
    const ctx = inject(LAYER_TEMPLATE_CONTEXT_KEY, null)
    const instance = getCurrentInstance()
    const inLayer = computed(() => ctx !== null && isInDirectLayerContent(instance))

    const renderSlot = (scope: LayerTemplateScope): VNode | VNode[] | null =>
      slots.default?.(scope) ?? null

    expose({
      render: (): VNode | VNode[] | null =>
        renderSlot({ inLayer: true, outsideLayer: false }),
    })

    onMounted(() => {
      if (inLayer.value) ctx?.bumpSlots()
    })

    return () => {
      if (inLayer.value) return null
      if (!props.visibleOutside) return null
      return renderSlot({ inLayer: false, outsideLayer: true })
    }
  },
})
