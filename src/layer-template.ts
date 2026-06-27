import {
  defineComponent,
  getCurrentInstance,
  inject,
  type PropType,
  type VNode,
} from 'vue'
import type { LayerInstance } from '@/types'
import { isInDirectLayerContent } from '@/context/in-layer-content'
import {
  CONTAINER_TEMPLATE_REGISTRY_KEY,
  type ContainerTemplateRegistry,
} from '@/di/injection-keys'
import { resolveLayerStore } from '@/instance/layer-internal'
import type { LayerInstanceStoreWithTemplate } from '@/instance/layer-store'

function useLayerInstanceStore(
  instance: LayerInstance,
): LayerInstanceStoreWithTemplate {
  return resolveLayerStore(instance)
}

function useLayerViewStore(): ContainerTemplateRegistry | null {
  return inject(CONTAINER_TEMPLATE_REGISTRY_KEY, null)
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
    const instance = getCurrentInstance()

    if (props.to) {
      useLayerInstanceStore(props.to).template({
        key: props.container ? 'use:template.container' : 'use:template.content',
        name: props.name,
        entry: {
          render: (slotProps = {}) => slots.default?.(slotProps) ?? null,
        },
      })
      return () => null
    }

    if (isInDirectLayerContent(instance)) {
      useLayerViewStore()?.template({
        key: 'define:template.container',
        name: props.name,
        entry: {
          render: (slotProps = {}) =>
            slots.default?.({
              slotProps,
              inLayer: true,
              outsideLayer: false,
            }) ?? null,
        },
      })
      return () => null
    }

    return (): VNode | VNode[] | null => {
      if (!props.visibleOutside) return null
      return (
        slots.default?.({
          slotProps: {},
          inLayer: false,
          outsideLayer: true,
        }) ?? null
      )
    }
  },
})
