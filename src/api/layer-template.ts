import {
  defineComponent,
  type PropType,
  type VNode,
} from 'vue'
import type { LayerDefine, LayerInstance } from '@/types'
import { isLayerDefine } from './define-layer'
import { resolveLayerStore } from '@/runtime/layer-internal'

export type LayerTemplateTo = LayerInstance | LayerDefine

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
  setup(props, { slots }) {
    const to = props.to

    if (isLayerDefine(to) && to.outsideLayer) {
      if (!props.visibleOutside) return () => null
      return (): VNode | VNode[] | null =>
        slots.default?.({
          inLayer: to.inLayer,
          outsideLayer: to.outsideLayer,
          slotProps: {},
        }) ?? null
    }

    const store = resolveLayerStore(to)
    const define = isLayerDefine(to)
    const key = define
      ? 'define:template.container'
      : props.container
        ? 'use:template.container'
        : 'use:template.content'

    const render = define
      ? (slotProps: Record<string, unknown> = {}) =>
          slots.default?.({
            slotProps,
            inLayer: to.inLayer,
            outsideLayer: to.outsideLayer,
          }) ?? null
      : (slotProps: Record<string, unknown> = {}) =>
          slots.default?.(slotProps ?? {}) ?? null

    store.template({ key, name: props.name, entry: { render } })
    return () => null
  },
})
