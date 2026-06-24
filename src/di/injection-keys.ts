import type { InjectionKey } from 'vue'
import type { LayerFragment } from '@/types/config'
import type { LayerStateWithRegistry } from '@/instance/layer-state'

export type LayerDefineRegistry = {
  register: (fragment: LayerFragment) => void
}

/** global inject key; value provided per LayerRoot render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>

export type ContainerTemplateRegistry = Pick<
  LayerStateWithRegistry,
  'registerCreatorContainerTemplate'
>

export const CONTAINER_TEMPLATE_REGISTRY_KEY: InjectionKey<ContainerTemplateRegistry> =
  Symbol('vue-layerx-container-template') as InjectionKey<ContainerTemplateRegistry>
