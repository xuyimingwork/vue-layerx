import { computed, defineComponent, getCurrentInstance, inject, onMounted, type VNode } from 'vue'
import type { LayerTemplateScope } from '@/core/types'
import { isInDirectLayerContent } from '@/vue/context/in-layer-content'
import {
  LAYER_BIND_REGISTRY_KEY,
  LAYER_TEMPLATE_REGISTRY_KEY,
} from '@/vue/di/injection-keys'

function buildTemplateScope(
  slotProps: Record<string, unknown>,
  layer: Pick<LayerTemplateScope, 'inLayer' | 'outsideLayer'>,
): LayerTemplateScope {
  return {
    slotProps,
    inLayer: layer.inLayer,
    outsideLayer: layer.outsideLayer,
  }
}

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

    const renderSlot = (templateScope: LayerTemplateScope): VNode | VNode[] | null =>
      slots.default?.(templateScope) ?? null

    onMounted(() => {
      const renderWithScope = (
        layer: Pick<LayerTemplateScope, 'inLayer' | 'outsideLayer'>,
      ) => (slotProps: Record<string, unknown> = {}) =>
        renderSlot(buildTemplateScope(slotProps, layer))

      if (inLayer.value && layerRegistry) {
        layerRegistry.registerLayerTemplate(props.name, {
          render: renderWithScope({ inLayer: true, outsideLayer: false }),
        })
        return
      }
      if (inBind.value && bindRegistry) {
        bindRegistry.registerContentTemplate(props.name, {
          render: renderWithScope({ inLayer: true, outsideLayer: false }),
        })
      }
    })

    return () => {
      if (inLayer.value || inBind.value) return null
      if (!props.visibleOutside) return null
      return renderSlot(buildTemplateScope({}, { inLayer: false, outsideLayer: true }))
    }
  },
})
