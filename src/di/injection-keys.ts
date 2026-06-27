import type { InjectionKey } from 'vue'
import type { LayerConfigFragment, LayerTemplateEntry } from '@/types/config'

export type LayerDefineRegistry = {
  register: (fragment: LayerConfigFragment) => void
}

/** global inject key; value provided per LayerView render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>

export type ContainerTemplateRegistry = {
  template: (opts: { name: string; entry: LayerTemplateEntry }) => void
}

export const CONTAINER_TEMPLATE_REGISTRY_KEY: InjectionKey<ContainerTemplateRegistry> =
  Symbol('vue-layerx-container-template') as InjectionKey<ContainerTemplateRegistry>
