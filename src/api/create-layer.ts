import type { Component } from 'vue'
import { DEFAULT_VISIBLE } from '@/core/constants/visible'
import type { LayerAdapt, LayerDefaults } from '@/core/types'
import { createUseLayer } from '@/runtime/create-use-layer'

export function createLayer(
  LayerComponent: Component,
  defaults: LayerDefaults = {},
  adapt?: LayerAdapt,
) {
  const [visibleProp, visibleEvent] = defaults.visible ?? DEFAULT_VISIBLE

  return createUseLayer({
    LayerComponent,
    layerDefaults: defaults,
    visibleProp,
    visibleEvent,
    adapt,
  })
}
