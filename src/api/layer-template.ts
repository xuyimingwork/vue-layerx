import {
  defineComponent,
  type PropType,
  type SlotsType,
  type VNode,
} from 'vue'
import type { LayerTemplateScope } from '@/types'
import {
  resolveTemplateTo,
  type LayerTemplateTo,
} from '@/shared/layer-template-to'

export type { LayerTemplateTo }

export const LayerTemplate = defineComponent({
  name: 'LayerTemplate',
  props: {
    name: {
      type: String,
      required: true,
    },
    /** Required. Creator: defineLayer() return value. Caller: LayerInstance from useX(). */
    to: {
      type: Object as PropType<LayerTemplateTo>,
      required: true,
    },
    /** With LayerInstance `:to`, register into container slot chain instead of content slot chain */
    container: {
      type: Boolean,
      default: false,
    },
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  slots: Object as SlotsType<{
    default: (
      props?: LayerTemplateScope | Record<string, unknown>,
    ) => VNode | VNode[] | null
  }>,
  setup(props, { slots }) {
    const slotRender = (slotProps?: Record<string, unknown>) =>
      slots.default?.(slotProps) ?? null

    const content = resolveTemplateTo(props.to).template({
      name: props.name,
      container: props.container,
      render: slotRender,
    })

    return () => (props.visibleOutside ? content.render() : null)
  },
})
