import { computed, defineComponent, getCurrentInstance, inject, onMounted, onUnmounted, type VNode } from 'vue'
import type { LayerTemplateScope } from '../../domain/types'
import { isInDirectLayerContent } from '../../infrastructure/vue/context/in-layer-content'
import {
  LAYER_SCOPE_REGISTRY_KEY,
  LAYER_TEMPLATE_REGISTRY_KEY,
} from '../../infrastructure/vue/di/injection-keys'

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
    const scopeRegistry = inject(LAYER_SCOPE_REGISTRY_KEY, null)
    const instance = getCurrentInstance()

    const inLayer = computed(
      () => layerRegistry !== null && isInDirectLayerContent(instance),
    )
    const inScope = computed(() => scopeRegistry !== null)

    const renderSlot = (scope: LayerTemplateScope): VNode | VNode[] | null =>
      slots.default?.(scope) ?? null

    onMounted(() => {
      if (inLayer.value && layerRegistry) {
        layerRegistry.registerLayerTemplate(props.name, {
          render: () => renderSlot({ inLayer: true, outsideLayer: false }),
        })
        return
      }
      if (inScope.value && scopeRegistry) {
        scopeRegistry.registerContentTemplate(props.name, {
          render: () => renderSlot({ inLayer: true, outsideLayer: false }),
        })
      }
    })

    onUnmounted(() => {
      // registry entries are overwritten on remount; bump handled by next register
    })

    return () => {
      if (inLayer.value || inScope.value) return null
      if (!props.visibleOutside) return null
      return renderSlot({ inLayer: false, outsideLayer: true })
    }
  },
})
