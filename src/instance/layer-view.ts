import { defineComponent, getCurrentInstance, provide, type Component } from 'vue'
import { mergeLayerConfigStore } from '@/pipeline/merge-config'
import { defaultResolve } from '@/pipeline/default-resolve'
import type { LayerConfigFragment, LayerRenderPlan } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { renderLayerTree } from '@/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  CONTAINER_TEMPLATE_REGISTRY_KEY,
} from '@/di/injection-keys'
import type { GetViewHost } from './view-host'
import { asViewHost } from './view-host'

export interface LayerViewState {
  visible: boolean
  contentMountKey: number
}

export function buildLayerView(
  configStore: LayerConfigStoreWithRegistry,
  runtime: {
    state: LayerViewState
    close: () => void
    getViewHost: GetViewHost
  },
) {
  let lastMountKey = -1
  const contentComponent = configStore.use.content?.component as Component | undefined
  const contentName = contentComponent
    ? (contentComponent as { name?: string }).name ?? 'Anonymous'
    : 'Shell'

  return defineComponent({
    name: `LayerView_${contentName}`,
    setup() {
      const host = runtime.getViewHost()
      if (host && !host.isUnmounted) {
        const instance = asViewHost(getCurrentInstance()!)
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
        if (runtime.state.contentMountKey !== lastMountKey) {
          configStore.define = null
          lastMountKey = runtime.state.contentMountKey
        }

        void configStore.define
        void configStore.templates.creatorContainer.container?.slots
        void configStore.templates.callerContainer.container?.slots
        void configStore.templates.callerContent.content?.slots

        const merged = mergeLayerConfigStore(configStore)

        const resolved = defaultResolve({ merged, close: runtime.close })
        const normalized = configStore.adapter ? configStore.adapter(resolved) : resolved

        const plan: LayerRenderPlan = {
          ...normalized,
          visible: runtime.state.visible,
          model: merged.container.model ?? DEFAULT_CONTAINER_MODEL,
          onClose: runtime.close,
        }

        return renderLayerTree({
          plan,
          contentMountKey: normalized.content ? runtime.state.contentMountKey : undefined,
        })
      }
    },
  })
}
