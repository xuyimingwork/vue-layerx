import {
  defineComponent,
  provide,
  ref,
  shallowRef,
  type Component,
  type Ref,
} from 'vue'
import type { ContentInstanceOptions, LayerDefinitionOptions } from '../../domain/types'
import { buildLayerVNode } from '../../infrastructure/vue/render/build-layer-vnode'
import {
  createLayerDefinitionKey,
  LAYER_TEMPLATE_CONTEXT_KEY,
  type LayerDefinitionRegistry,
} from '../../infrastructure/vue/di/injection-keys'
import type { ResolvedLayerConfig } from './resolve-layer-config'

export interface LayerRootState {
  visible: boolean
  showOptions: ContentInstanceOptions
}

export interface CreateLayerRootOptions extends ResolvedLayerConfig {
  Layer: Component
  Content: Component
  useOptions: ContentInstanceOptions
  state: LayerRootState
  layerDefinitionKey: ReturnType<typeof createLayerDefinitionKey>
  layerDefinition: Ref<LayerDefinitionOptions | null>
  slotsVersion: Ref<number>
  hide: () => void
}

export function createLayerRoot(options: CreateLayerRootOptions) {
  const {
    Layer,
    Content,
    visibleProp,
    visibleEvent,
    factoryOptions,
    useOptions,
    state,
    layerDefinitionKey,
    layerDefinition,
    slotsVersion,
    hide,
  } = options

  return defineComponent({
    name: `LayerRoot_${(Content as { name?: string }).name ?? 'Anonymous'}`,
    setup() {
      provide(layerDefinitionKey, {
        registerLayer: (config: LayerDefinitionOptions) => {
          layerDefinition.value = config
        },
      } satisfies LayerDefinitionRegistry)

      provide(LAYER_TEMPLATE_CONTEXT_KEY, {
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
}
