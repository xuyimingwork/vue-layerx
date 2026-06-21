import type { Component } from 'vue'
import type { LayerAdapt, LayerDefaults } from '@/core/types'
import { createUseLayer } from '@/runtime/create-use-layer'

const DEFAULT_VISIBLE = ['modelValue', 'onUpdate:modelValue'] as const

export function createLayer(
  Container: Component,
  defaults: LayerDefaults = {},
  adapt?: LayerAdapt,
) {
  const [visibleProp, visibleEvent] = defaults.visible ?? DEFAULT_VISIBLE

  return createUseLayer({
    Container,
    layerDefaults: defaults,
    visibleProp,
    visibleEvent,
    adapt,
  })
}
