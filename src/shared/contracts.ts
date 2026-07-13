import type { InjectionKey } from 'vue'
import type { LayerViewBridge } from '@/types/store'

/** Inject key provided by LayerView; consumers request capabilities via the bridge. */
export const LAYER_VIEW_KEY: InjectionKey<LayerViewBridge> =
  Symbol('vue-layerx:layer-view') as InjectionKey<LayerViewBridge>
