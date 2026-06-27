import type { InjectionKey } from 'vue'
import type { LayerDefineRegistry } from '@/types/store'

/** global inject key; value provided per LayerView render context */
export const LAYER_DEFINE_KEY: InjectionKey<LayerDefineRegistry> =
  Symbol('vue-layerx-define') as InjectionKey<LayerDefineRegistry>
