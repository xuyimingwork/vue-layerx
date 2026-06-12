import {
  getCurrentInstance,
  h,
  onUnmounted,
  reactive,
  ref,
  shallowRef,
  type Component,
} from 'vue'
import { mergeContentInstanceOptions } from '../../domain/config/merge-content-instance-options'
import type {
  ContentInstanceOptions,
  LayerInstance,
  LayerUseOptions,
  LayerShowPayload,
} from '../../domain/types'
import { createBodyRenderer } from '../../infrastructure/vue/render/body-renderer'
import { createLayerDefinitionKey } from '../../infrastructure/vue/di/injection-keys'
import { createLayerDefinitionHook } from './create-layer-definition-hook'
import { createLayerRoot } from './create-layer-root'
import type { ResolvedLayerConfig } from './resolve-layer-config'

export interface UseLayerFactoryContext extends ResolvedLayerConfig {
  Layer: Component
}

export function createUseLayer(ctx: UseLayerFactoryContext) {
  const layerDefinitionKey = createLayerDefinitionKey()
  const layer = createLayerDefinitionHook(layerDefinitionKey)

  function useLayer(
    Content: Component,
    useOptions: LayerUseOptions = {},
  ): LayerInstance {
    const state = reactive({
      visible: false,
      showOptions: {} as ContentInstanceOptions,
    })

    const layerDefinition = shallowRef(null)
    const slotsVersion = ref(0)

    const instance = getCurrentInstance()
    const bodyRenderer = createBodyRenderer(instance?.appContext ?? null)

    const hide = () => {
      state.visible = false
      bodyRenderer.teardown()
    }

    const LayerRoot = createLayerRoot({
      ...ctx,
      Content,
      useOptions,
      state,
      layerDefinitionKey,
      layerDefinition,
      slotsVersion,
      hide,
    })

    const show = (payload?: LayerShowPayload) => {
      if (payload) state.showOptions = payload
      state.visible = true
      bodyRenderer.render(h(LayerRoot))
    }

    const clone = (partial?: LayerUseOptions): LayerInstance =>
      useLayer(Content, mergeContentInstanceOptions(useOptions, partial))

    if (instance) {
      onUnmounted(hide)
    }

    return {
      show,
      hide,
      clone,
      get visible() {
        return state.visible
      },
    }
  }

  useLayer.layer = layer

  return useLayer
}
