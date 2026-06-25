import type { InjectionKey } from 'vue'
import type { LayerConfigFragment } from '@/types/config'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'

export type LayerDefineRegistry = {
  register: (fragment: LayerConfigFragment) => void
}

/** global inject key; value provided per LayerView render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>

export type ContainerTemplateRegistry = Pick<
  LayerConfigStoreWithRegistry,
  'registerCreatorContainerTemplate'
>

export const CONTAINER_TEMPLATE_REGISTRY_KEY: InjectionKey<ContainerTemplateRegistry> =
  Symbol('vue-layerx-container-template') as InjectionKey<ContainerTemplateRegistry>
