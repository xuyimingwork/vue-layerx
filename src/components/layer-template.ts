import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  onMounted,
  type PropType,
  type VNode,
} from 'vue'
import type { LayerInstance, LayerTemplateScope } from '@/core/types'
import { isInDirectLayerContent } from '@/vue/context/in-layer-content'
import { LAYER_TEMPLATE_REGISTRY_KEY } from '@/vue/di/injection-keys'
import { getInternal } from '@/vue/instance/instance-registry'

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
    to: {
      type: Object as PropType<LayerInstance>,
      default: undefined,
    },
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const layerRegistry = inject(LAYER_TEMPLATE_REGISTRY_KEY, null)
    const instance = getCurrentInstance()

    const inLayer = computed(
      () => !props.to && layerRegistry !== null && isInDirectLayerContent(instance),
    )
    const boundToInstance = computed(() => props.to != null)

    const renderSlot = (templateScope: LayerTemplateScope): VNode | VNode[] | null =>
      slots.default?.(templateScope) ?? null

    onMounted(() => {
      const renderWithScope =
        (layer: Pick<LayerTemplateScope, 'inLayer' | 'outsideLayer'>) =>
        (slotProps: Record<string, unknown> = {}) =>
          renderSlot(buildTemplateScope(slotProps, layer))

      if (props.to) {
        getInternal(props.to).registerContentTemplate(props.name, {
          render: renderWithScope({ inLayer: true, outsideLayer: false }),
        })
        return
      }
      if (inLayer.value && layerRegistry) {
        layerRegistry.registerLayerTemplate(props.name, {
          render: renderWithScope({ inLayer: true, outsideLayer: false }),
        })
      }
    })

    return () => {
      if (boundToInstance.value || inLayer.value) return null
      if (!props.visibleOutside) return null
      return renderSlot(buildTemplateScope({}, { inLayer: false, outsideLayer: true }))
    }
  },
})
