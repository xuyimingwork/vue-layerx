import type { Component } from 'vue'
import { createUseLayer } from '@/application/factory/create-use-layer'
import { DEFAULT_VISIBLE } from '@/domain/constants/visible'
import type { LayerAdapt, LayerFactoryDefaults } from '@/domain/types'

export function createLayer(
  layer: Component,
  defaults: LayerFactoryDefaults = {},
  adapt?: LayerAdapt,
) {
  const [visibleProp, visibleEvent] = defaults.visible ?? DEFAULT_VISIBLE

  return createUseLayer({
    factoryLayer: layer,
    factoryDefaults: defaults,
    visibleProp,
    visibleEvent,
    adapt,
  })
}
