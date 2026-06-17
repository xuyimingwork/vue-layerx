import { defineComponent, provide, type Component, type Ref } from 'vue'
import { mergeConfig } from '@/core/config/merge-config'
import { defaultResolve, hasContentComponent } from '@/core/config/default-resolve'
import type {
  DefineLayerOptions,
  LayerRenderPlan,
  LayerUsePayload,
} from '@/core/types'
import type { LayerInternalState } from '@/vue/instance/types'
import { renderLayerTree } from '@/vue/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  LAYER_TEMPLATE_REGISTRY_KEY,
} from '@/vue/di/injection-keys'
import type { UseLayerContext } from './types'

export interface LayerRootState {
  visible: boolean
  showOptions: LayerUsePayload
  contentMountKey: number
}

export interface LayerRootOptions {
  Content?: Component
  useOptions: LayerUsePayload
  partial: LayerUsePayload
}

export function buildLayerRoot(
  ctx: UseLayerContext,
  opts: LayerRootOptions,
  internal: LayerInternalState,
  state: LayerRootState,
  defineLayerConfig: Ref<DefineLayerOptions | null>,
  hide: () => void,
) {
  return defineComponent({
    name: `LayerRoot_${opts.Content ? (opts.Content as { name?: string }).name ?? 'Anonymous' : 'Shell'}`,
    setup() {
      provide(LAYER_DEFINE_KEY, {
        register(config: DefineLayerOptions) {
          defineLayerConfig.value = config
          internal.bumpSlots()
        },
      })

      provide(LAYER_TEMPLATE_REGISTRY_KEY, {
        registerLayerTemplate: internal.registerLayerTemplate,
        bumpSlots: internal.bumpSlots,
      })

      return () => {
        if (!state.visible) return null
        void internal.slotsVersion.value

        const merged = mergeConfig({
          layerDefaults: ctx.layerDefaults,
          defineLayer: defineLayerConfig.value,
          useOptions: opts.useOptions,
          showOptions: state.showOptions,
          partial: opts.partial,
        })

        const resolveCtx = {
          merged,
          LayerComponent: ctx.LayerComponent,
          boundContent: opts.Content,
          layerTemplates: internal.layerTemplates,
          contentTemplates: internal.contentTemplates,
          hide,
        }

        const resolved = defaultResolve(resolveCtx)
        const normalized = ctx.adapt ? ctx.adapt(resolved) : resolved
        const contentPresent = hasContentComponent(resolveCtx)

        const plan: LayerRenderPlan = {
          ...normalized,
          visible: true,
          visibleProp: ctx.visibleProp,
          visibleEvent: ctx.visibleEvent,
          onHide: hide,
        }

        return renderLayerTree({
          plan,
          hasContent: contentPresent,
          contentMountKey: contentPresent ? state.contentMountKey : undefined,
        })
      }
    },
  })
}
