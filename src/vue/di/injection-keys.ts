import type { InjectionKey } from 'vue'
import type { DefineLayerOptions } from '@/core/types/config'
import type { LayerInternalState } from '@/vue/instance/internal-state'

export type LayerDefineRegistry = {
  register: (config: DefineLayerOptions) => void
}

/** global inject key; value provided per LayerRoot render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>

export type ContainerTemplateRegistry = Pick<
  LayerInternalState,
  'registerCreatorContainerTemplate'
>

export const CONTAINER_TEMPLATE_REGISTRY_KEY: InjectionKey<ContainerTemplateRegistry> =
  Symbol('vue-layerx-container-template') as InjectionKey<ContainerTemplateRegistry>
