import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  onMounted,
  type PropType,
  type VNode,
} from 'vue'
import type { LayerInstance, LayerTemplateScope } from '@/types'
import { isInDirectLayerContent } from '@/context/in-layer-content'
import { CONTAINER_TEMPLATE_REGISTRY_KEY } from '@/di/injection-keys'
import { resolveLayerStore } from '@/instance/layer-internal'

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
    /** With `:to`, register into container slot chain instead of content slot chain */
    container: {
      type: Boolean,
      default: false,
    },
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const containerRegistry = inject(CONTAINER_TEMPLATE_REGISTRY_KEY, null)
    const instance = getCurrentInstance()

    const inLayer = computed(
      () => !props.to && containerRegistry !== null && isInDirectLayerContent(instance),
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
        const internal = resolveLayerStore(props.to)
        const entry = {
          render: renderWithScope({ inLayer: true, outsideLayer: false }),
        }
        internal.template({
          key: props.container ? 'use:template.container' : 'use:template.content',
          name: props.name,
          entry,
        })
        return
      }
      if (inLayer.value && containerRegistry) {
        containerRegistry.template({
          name: props.name,
          entry: {
            render: renderWithScope({ inLayer: true, outsideLayer: false }),
          },
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
