import { computed, defineComponent, getCurrentInstance, inject, onMounted, type VNode } from 'vue'
import type { LayerTemplateScope } from '@/core/types'
import { isInDirectLayerContent } from '@/vue/context/in-layer-content'
import {
  LAYER_BIND_REGISTRY_KEY,
  LAYER_TEMPLATE_REGISTRY_KEY,
} from '@/vue/di/injection-keys'

export const LayerTemplate = defineComponent({
  name: 'LayerTemplate',
  props: {
    name: {
      type: String,
      required: true,
    },
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const layerRegistry = inject(LAYER_TEMPLATE_REGISTRY_KEY, null)
    const bindRegistry = inject(LAYER_BIND_REGISTRY_KEY, null)
    const instance = getCurrentInstance()

    const inLayer = computed(
      () => layerRegistry !== null && isInDirectLayerContent(instance),
    )
    const inBind = computed(() => bindRegistry !== null)

    const renderSlot = (scope: LayerTemplateScope): VNode | VNode[] | null =>
      slots.default?.(scope) ?? null

    onMounted(() => {
      if (inLayer.value && layerRegistry) {
        layerRegistry.registerLayerTemplate(props.name, {
          render: () => renderSlot({ inLayer: true, outsideLayer: false }),
        })
        return
      }
      if (inBind.value && bindRegistry) {
        bindRegistry.registerContentTemplate(props.name, {
          render: () => renderSlot({ inLayer: true, outsideLayer: false }),
        })
      }
    })

    return () => {
      if (inLayer.value || inBind.value) return null
      if (!props.visibleOutside) return null
      return renderSlot({ inLayer: false, outsideLayer: true })
    }
  },
})
