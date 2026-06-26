import { defineComponent, getCurrentInstance, provide, type Component } from 'vue'
import { mergeLayerConfigStore } from '@/pipeline/merge-config'
import { defaultResolve } from '@/pipeline/default-resolve'
import type { LayerAdapt, LayerConfigFragment, LayerRenderPlan } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { renderLayerTree } from '@/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  CONTAINER_TEMPLATE_REGISTRY_KEY,
} from '@/di/injection-keys'
import type { GetViewHost } from './layer-runtime'

export interface UseLayerContext {
  Container: Component
  create: LayerConfigFragment
  defaultModel: string
  adapt?: LayerAdapt
}

export interface LayerViewState {
  visible: boolean
  contentMountKey: number
}

export interface LayerViewOptions {
  Content?: Component
}

export function buildLayerView(
  ctx: UseLayerContext,
  opts: LayerViewOptions,
  configStore: LayerConfigStoreWithRegistry,
  state: LayerViewState,
  close: () => void,
  getViewHost: GetViewHost,
) {
  let lastMountKey = -1

  return defineComponent({
    name: `LayerView_${opts.Content ? (opts.Content as { name?: string }).name ?? 'Anonymous' : 'Shell'}`,
    setup() {
      const host = getViewHost()
      if (host && !host.isUnmounted) {
        const instance = getCurrentInstance()!
        instance.provides = Object.create(host.provides)
      }

      provide(LAYER_DEFINE_KEY, {
        register(fragment: LayerConfigFragment) {
          configStore.define = fragment
        },
      })

      provide(CONTAINER_TEMPLATE_REGISTRY_KEY, {
        registerCreatorContainerTemplate: configStore.registerCreatorContainerTemplate,
      })

      return () => {
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
          close,
        }

        const resolved = defaultResolve(resolveCtx)
        const normalized = ctx.adapt ? ctx.adapt(resolved) : resolved

        const plan: LayerRenderPlan = {
          ...normalized,
          visible: state.visible,
          model: merged.container.model ?? ctx.defaultModel ?? DEFAULT_CONTAINER_MODEL,
          onClose: close,
        }

        return renderLayerTree({
          plan,
          contentMountKey: normalized.content ? state.contentMountKey : undefined,
        })
      }
    },
  })
}
