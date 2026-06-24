import { defineComponent, provide, type Component } from 'vue'
import { mergeLayerConfigStore } from '@/pipeline/merge-config'
import { defaultResolve } from '@/pipeline/default-resolve'
import type { LayerAdapt, LayerConfigFragment, LayerRenderPlan } from '@/types'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { renderLayerTree } from '@/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  CONTAINER_TEMPLATE_REGISTRY_KEY,
} from '@/di/injection-keys'

export interface UseLayerContext {
  Container: Component
  create: LayerConfigFragment
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
  configStore: LayerConfigStoreWithRegistry,
  state: LayerRootState,
  hide: () => void,
) {
  let lastMountKey = -1

  return defineComponent({
    name: `LayerRoot_${opts.Content ? (opts.Content as { name?: string }).name ?? 'Anonymous' : 'Shell'}`,
    setup() {
      provide(LAYER_DEFINE_KEY, {
        register(fragment: LayerConfigFragment) {
          configStore.define = fragment
        },
      })

      provide(CONTAINER_TEMPLATE_REGISTRY_KEY, {
        registerCreatorContainerTemplate: configStore.registerCreatorContainerTemplate,
      })

      return () => {
        if (!state.visible) return null

        if (state.contentMountKey !== lastMountKey) {
          configStore.define = null
          lastMountKey = state.contentMountKey
        }

        void configStore.define
        void configStore.templates.creatorContainer.container?.slots
        void configStore.templates.callerContainer.container?.slots
        void configStore.templates.callerContent.content?.slots

        const merged = mergeLayerConfigStore(configStore)

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
