import { getCurrentInstance, inject } from 'vue'
import type { LayerConfigStatic, LayerDefine } from '@/types'
import { toFragmentFromStatic } from '@/config/fragment'
import { isLayerContent, LAYER_DEFINE_KEY } from '@/shared/contracts'
import { attachLayerStore } from '@/runtime/layer-internal'

const LAYER_DEFINE = Symbol('vue-layerx:define')

export function isLayerDefine(to: object): to is LayerDefine {
  return LAYER_DEFINE in to
}

export function defineLayer(config: LayerConfigStatic = {}): LayerDefine {
  const ctx = inject(LAYER_DEFINE_KEY, null)
  const instance = getCurrentInstance()
  const inLayer = !!(ctx && isLayerContent(instance))
  const outsideLayer = !inLayer

  if (inLayer) ctx!.register(toFragmentFromStatic(config))

  const layer: LayerDefine = { inLayer, outsideLayer }
  Object.defineProperty(layer, LAYER_DEFINE, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  })
  if (inLayer && ctx) attachLayerStore(layer, ctx.store)
  return layer
}
