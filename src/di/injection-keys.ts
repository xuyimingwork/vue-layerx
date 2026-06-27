import type { InjectionKey } from 'vue'
import type { LayerConfigFragment } from '@/types/config'
import type { LayerViewStoreWithTemplate } from '@/instance/layer-store'

export type LayerDefineRegistry = {
  register: (fragment: LayerConfigFragment) => void
  store: LayerViewStoreWithTemplate
}

/** global inject key; value provided per LayerView render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>
