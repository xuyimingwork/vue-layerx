import { defineComponent, provide, type Component } from 'vue'
import { mergeLayerState } from '@/core/config/merge-config'
import { defaultResolve } from '@/core/config/default-resolve'
import type { LayerAdapt, LayerFragment, LayerRenderPlan } from '@/core/types'
import type { LayerStateWithRegistry } from '@/vue/instance/layer-state'
import { renderLayerTree } from '@/vue/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  CONTAINER_TEMPLATE_REGISTRY_KEY,
} from '@/vue/di/injection-keys'

export interface UseLayerContext {
  Container: Component
  create: LayerFragment
  visibleProp: string
  visibleEvent: string
  adapt?: LayerAdapt
}

export interface LayerRootState {
  visible: boolean
  contentMountKey: number
}

export interface LayerRootOptions {
  Content?: Component
}

export function buildLayerRoot(
  ctx: UseLayerContext,
  opts: LayerRootOptions,
  layerState: LayerStateWithRegistry,
  state: LayerRootState,
  hide: () => void,
) {
  let lastMountKey = -1

  return defineComponent({
    name: `LayerRoot_${opts.Content ? (opts.Content as { name?: string }).name ?? 'Anonymous' : 'Shell'}`,
    setup() {
      provide(LAYER_DEFINE_KEY, {
        register(fragment: LayerFragment) {
          layerState.define = fragment
        },
      })

      provide(CONTAINER_TEMPLATE_REGISTRY_KEY, {
        registerCreatorContainerTemplate: layerState.registerCreatorContainerTemplate,
      })

      return () => {
        if (!state.visible) return null

        if (state.contentMountKey !== lastMountKey) {
          layerState.define = null
          lastMountKey = state.contentMountKey
        }

        void layerState.define
        void layerState.templates.creatorContainer.container?.slots
        void layerState.templates.callerContainer.container?.slots
        void layerState.templates.callerContent.content?.slots

        const merged = mergeLayerState(layerState)

        const resolveCtx = {
          merged,
          Container: ctx.Container,
          boundContent: opts.Content,
          hide,
        }

        const resolved = defaultResolve(resolveCtx)
        const normalized = ctx.adapt ? ctx.adapt(resolved) : resolved

        const plan: LayerRenderPlan = {
          ...normalized,
          visible: true,
          visibleProp: ctx.visibleProp,
          visibleEvent: ctx.visibleEvent,
          onHide: hide,
        }

        return renderLayerTree({
          plan,
          contentMountKey: normalized.content ? state.contentMountKey : undefined,
        })
      }
    },
  })
}
