import type { Component } from 'vue'
import type { LayerAdapter, LayerConfigStatic } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import { toFragmentFromStatic } from '@/pipeline/to-fragment'
import { createUseLayer } from '@/instance/create-use-layer'

export function createLayer(
  Container: Component,
  config: LayerConfigStatic = {},
  adapter?: LayerAdapter,
) {
  return createUseLayer({
    Container,
    create: toFragmentFromStatic(config),
    defaultModel: config.model ?? DEFAULT_CONTAINER_MODEL,
    adapter,
  })
}
