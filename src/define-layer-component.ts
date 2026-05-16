import {
  defineComponent,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
  type Component,
  type Ref,
  type SetupContext,
  type VNode,
} from 'vue'
import { buildLayerVNode, type BuildVNodeContext } from './build-vnode'
import type { BodyRenderer } from './body-renderer'
import type { LayerProps, SlotRenderFn } from './types'

export interface DefineLayerComponentOptions {
  Inner: Component
  bridged: Ref<boolean>
  isVisible: () => boolean
  templateAttrs: Ref<LayerProps>
  templateSlots: Ref<Record<string, SlotRenderFn>>
  buildContext: () => BuildVNodeContext
  bodyRenderer: BodyRenderer
  renderToBody: () => void
}

export function defineLayerComponent(options: DefineLayerComponentOptions) {
  const {
    Inner,
    bridged,
    isVisible,
    templateAttrs,
    templateSlots,
    buildContext,
    bodyRenderer,
    renderToBody,
  } = options

  return defineComponent({
    name: `Layer_${(Inner as { name?: string }).name ?? 'Anonymous'}`,
    inheritAttrs: false,
    setup(_props, ctx: SetupContext) {
      const syncTemplate = () => {
        templateAttrs.value = { ...(ctx.attrs as LayerProps) }
        templateSlots.value = ctx.slots as Record<string, SlotRenderFn>
      }

      syncTemplate()

      onMounted(() => {
        bridged.value = true
        bodyRenderer.teardown()
      })

      onUnmounted(() => {
        bridged.value = false
      })

      watch(
        () => ctx.attrs,
        () => {
          syncTemplate()
          if (isVisible() && !bridged.value) renderToBody()
        },
        { deep: true },
      )

      return (): VNode | null => {
        if (!isVisible()) return null
        if (bridged.value) return buildLayerVNode(buildContext())
        return null
      }
    },
  })
}
