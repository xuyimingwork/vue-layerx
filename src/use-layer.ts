import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onUnmounted,
  provide,
  reactive,
  ref,
  shallowRef,
  type Component,
} from 'vue'
import {
  buildLayerVNode,
  createLayerDefinitionKey,
  LAYER_SLOT_CONTEXT_KEY,
  type LayerDefinitionRegistry,
} from './build-vnode'
import { createBodyRenderer } from './body-renderer'
import type { ResolvedLayerConfig } from './layer-config'
import type {
  ContentInstanceOptions,
  LayerDefinitionOptions,
  LayerInstance,
  LayerShowPayload,
  LayerUseOptions,
} from './types'
import { mergeContentInstanceOptions } from './utils/merge-config'

export interface UseLayerFactoryContext extends ResolvedLayerConfig {
  Layer: Component
}

export function createUseLayer(ctx: UseLayerFactoryContext) {
  const { Layer, factoryOptions, visibleProp, visibleEvent } = ctx
  const layerDefinitionKey = createLayerDefinitionKey()

  function layer(options: LayerDefinitionOptions = {}) {
    const registry = inject(layerDefinitionKey, null)
    if (registry) registry.registerLayer(options)
  }

  function useLayer(
    Content: Component,
    useOptions: LayerUseOptions = {},
  ): LayerInstance {
    const state = reactive({
      visible: false,
      showOptions: {} as ContentInstanceOptions,
    })

    const layerDefinition = shallowRef<LayerDefinitionOptions | null>(null)
    const slotsVersion = ref(0)

    const instance = getCurrentInstance()
    const bodyRenderer = createBodyRenderer(instance?.appContext ?? null)

    const hide = () => {
      state.visible = false
      bodyRenderer.teardown()
    }

    const LayerRoot = defineComponent({
      name: `LayerRoot_${(Content as { name?: string }).name ?? 'Anonymous'}`,
      setup() {
        provide(layerDefinitionKey, {
          registerLayer: (config: LayerDefinitionOptions) => {
            layerDefinition.value = config
          },
        } satisfies LayerDefinitionRegistry)

        provide(LAYER_SLOT_CONTEXT_KEY, {
          bumpSlots: () => {
            slotsVersion.value++
          },
        })

        return () => {
          if (!state.visible) return null
          return buildLayerVNode({
            Layer,
            Content,
            visible: true,
            visibleProp,
            visibleEvent,
            factoryOptions,
            layerDefinition: layerDefinition.value,
            useOptions,
            showOptions: state.showOptions,
            slotsVersion: slotsVersion.value,
            hide,
          })
        }
      },
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
