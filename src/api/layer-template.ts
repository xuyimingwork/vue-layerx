import {
  defineComponent,
  onBeforeUnmount,
  shallowRef,
  watch,
  type PropType,
  type SlotsType,
  type VNode,
} from 'vue'
import {
  renderless,
  resolveTemplateTo,
  type LayerTemplateTo,
  type TemplateToContent,
} from '@/shared/layer-template-to'

export type { LayerTemplateTo }

/**
 * Deliver default-slot VNodes into a named slot on the content or container.
 *
 * - Content side: `:to="defineLayer()"` → container slot of the same `name`
 * - Caller: `:to="instance"` → content slot; add `container` for container slot
 *
 * Unmount unregisters; prefer constant `name` / `to` in everyday use.
 *
 * @example
 * ```vue
 * <!-- inside content: fill container footer -->
 * <LayerTemplate :to="layer" name="footer">
 *   <button @click="emit('ok')">OK</button>
 * </LayerTemplate>
 *
 * <!-- caller: fill content header -->
 * <LayerTemplate :to="dialog" name="header">Extra</LayerTemplate>
 * ```
 */
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
    /** Also render in-place on the page; still delivered into the layer when open */
    visibleOutside: {
      type: Boolean,
      default: false,
    },
  },
  slots: Object as SlotsType<{
    default: (props?: Record<string, unknown>) => VNode | VNode[] | null
  }>,
  setup(props, { slots }) {
    const slotRender = (slotProps?: Record<string, unknown>) =>
      slots.default?.(slotProps) ?? null

    const content = shallowRef<TemplateToContent>({
      render: renderless,
      dispose: () => {},
    })

    watch(
      () => [props.to, props.name, props.container] as const,
      () => {
        content.value.dispose()
        content.value = resolveTemplateTo(props.to).template({
          name: props.name,
          container: props.container,
          render: slotRender,
        })
      },
      { immediate: true },
    )

    onBeforeUnmount(() => content.value.dispose())

    return () => (props.visibleOutside ? content.value.render() : null)
  },
})
