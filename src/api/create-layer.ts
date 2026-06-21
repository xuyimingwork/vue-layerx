import type { Component } from 'vue'
import type { LayerAdapt, LayerFragment, LayerStaticConfig } from '@/core/types'
import { toFragmentFromStatic } from '@/core/config/to-fragment'
import { createUseLayer } from '@/runtime/create-use-layer'

const DEFAULT_VISIBLE = ['modelValue', 'onUpdate:modelValue'] as const

export function createLayer(
  Container: Component,
  config: LayerStaticConfig = {},
  adapt?: LayerAdapt,
) {
  const [visibleProp, visibleEvent] = config.visible ?? DEFAULT_VISIBLE

  return createUseLayer({
    Container,
    create: toFragmentFromStatic(config),
    visibleProp,
    visibleEvent,
    adapt,
  })
}
