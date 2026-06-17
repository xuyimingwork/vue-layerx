import type { InjectionKey } from 'vue'
import type { DefineLayerOptions } from '@/core/types/config'
import type { LayerInternalState } from '@/vue/instance/internal-state'

export type LayerDefineRegistry = {
  register: (config: DefineLayerOptions) => void
}

/** global inject key; value provided per LayerRoot render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>

export type LayerTemplateRegistry = Pick<LayerInternalState, 'registerLayerTemplate'>

export const LAYER_TEMPLATE_REGISTRY_KEY: InjectionKey<LayerTemplateRegistry> =
  Symbol('vue-layerx-layer-template') as InjectionKey<LayerTemplateRegistry>

export type LayerScopeRegistry = Pick<LayerInternalState, 'registerContentTemplate'>

export const LAYER_SCOPE_REGISTRY_KEY: InjectionKey<LayerScopeRegistry> =
  Symbol('vue-layerx-content-template') as InjectionKey<LayerScopeRegistry>
